import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import type { PracticeSkill } from "@/lib/practice";
import {
  normalizePracticeAnswer,
  requirePracticeAccess,
} from "@/lib/server/practice-access";
import {
  authenticateUser,
  createServiceSupabaseClient,
  userAuthErrorResponse,
} from "@/lib/server/user-auth";

const saveAnswerSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.string().max(500),
});

interface QuestionRow {
  id: string;
  points: number;
  practice_sections: { set_id: string } | { set_id: string }[];
  practice_answer_keys:
    | {
        correct_answer: { acceptedValues?: unknown };
        explanation: string;
      }
    | {
        correct_answer: { acceptedValues?: unknown };
        explanation: string;
      }[];
}

function getRelatedValue<T>(value: T | T[]) {
  return Array.isArray(value) ? value[0] : value;
}

async function getOwnedAttempt(
  request: NextRequest,
  attemptId: string,
  skill: PracticeSkill,
) {
  const { user } = await authenticateUser(request);
  const admin = createServiceSupabaseClient();
  await requirePracticeAccess(admin, user.id);

  const { data: attempt, error } = await admin
    .from("practice_attempts")
    .select("id, set_id, status, score, max_score, practice_sets!inner(skill)")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .eq("practice_sets.skill", skill)
    .maybeSingle();
  if (error) throw error;

  return { admin, attempt };
}

export async function saveObjectiveAnswer(
  request: NextRequest,
  attemptId: string,
  skill: PracticeSkill,
) {
  try {
    const parsed = saveAnswerSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        { error: "Enter a valid answer." },
        { status: 400 },
      );

    const { admin, attempt } = await getOwnedAttempt(request, attemptId, skill);
    if (!attempt)
      return NextResponse.json(
        { error: "Practice attempt not found." },
        { status: 404 },
      );
    if (attempt.status !== "in_progress") {
      return NextResponse.json(
        { error: "This practice attempt has already been submitted." },
        { status: 409 },
      );
    }

    const { data: question, error: questionError } = await admin
      .from("practice_questions")
      .select("id, practice_sections!inner(set_id)")
      .eq("id", parsed.data.questionId)
      .eq("practice_sections.set_id", attempt.set_id)
      .maybeSingle();
    if (questionError) throw questionError;
    if (!question)
      return NextResponse.json(
        { error: "Question not found in this practice set." },
        { status: 404 },
      );

    const { error: saveError } = await admin.from("practice_answers").upsert(
      {
        attempt_id: attemptId,
        question_id: parsed.data.questionId,
        answer: { value: parsed.data.answer },
        is_correct: null,
        points_awarded: null,
      },
      { onConflict: "attempt_id,question_id" },
    );
    if (saveError) throw saveError;
    return NextResponse.json({
      success: true,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    return userAuthErrorResponse(error);
  }
}

export async function submitObjectiveAttempt(
  request: NextRequest,
  attemptId: string,
  skill: PracticeSkill,
) {
  try {
    const body = await request.json().catch(() => ({}));
    if (body.action !== "submit")
      return NextResponse.json(
        { error: "A valid action is required." },
        { status: 400 },
      );

    const { admin, attempt } = await getOwnedAttempt(request, attemptId, skill);
    if (!attempt)
      return NextResponse.json(
        { error: "Practice attempt not found." },
        { status: 404 },
      );
    if (attempt.status === "completed") {
      return NextResponse.json({
        success: true,
        score: Number(attempt.score),
        maxScore: Number(attempt.max_score),
        alreadySubmitted: true,
      });
    }

    const { data: questionData, error: questionError } = await admin
      .from("practice_questions")
      .select(
        "id, points, practice_sections!inner(set_id), practice_answer_keys(correct_answer, explanation)",
      )
      .eq("practice_sections.set_id", attempt.set_id)
      .order("position", { ascending: true });
    if (questionError) throw questionError;
    const questions = (questionData ?? []) as QuestionRow[];
    if (!questions.length)
      return NextResponse.json(
        { error: "This practice set has no questions." },
        { status: 409 },
      );

    const { data: answerData, error: answerError } = await admin
      .from("practice_answers")
      .select("id, question_id, answer")
      .eq("attempt_id", attemptId);
    if (answerError) throw answerError;
    const answers = new Map(
      (answerData ?? []).map((answer) => [answer.question_id, answer]),
    );

    let score = 0;
    let maxScore = 0;
    const review = questions.map((question) => {
      const key = getRelatedValue(question.practice_answer_keys);
      const acceptedValues = Array.isArray(key?.correct_answer?.acceptedValues)
        ? key.correct_answer.acceptedValues.filter(
            (value): value is string => typeof value === "string",
          )
        : [];
      const savedAnswer = answers.get(question.id);
      const answerValue =
        typeof savedAnswer?.answer?.value === "string"
          ? savedAnswer.answer.value
          : "";
      const isCorrect = acceptedValues.some(
        (value) =>
          normalizePracticeAnswer(value) ===
          normalizePracticeAnswer(answerValue),
      );
      const points = Number(question.points);
      const pointsAwarded = isCorrect ? points : 0;
      maxScore += points;
      score += pointsAwarded;
      return {
        questionId: question.id,
        answer: answerValue,
        correctAnswer: acceptedValues[0] ?? "",
        explanation: key?.explanation ?? "",
        isCorrect,
        pointsAwarded,
        answerId: savedAnswer?.id,
      };
    });

    const answeredReviews = review.filter((item) => item.answerId);
    if (answeredReviews.length) {
      const { error: gradeError } = await admin.from("practice_answers").upsert(
        answeredReviews.map((item) => ({
          id: item.answerId,
          attempt_id: attemptId,
          question_id: item.questionId,
          answer: { value: item.answer },
          is_correct: item.isCorrect,
          points_awarded: item.pointsAwarded,
        })),
      );
      if (gradeError) throw gradeError;
    }

    const completedAt = new Date().toISOString();
    const { data: completedAttempt, error: completionError } = await admin
      .from("practice_attempts")
      .update({
        status: "completed",
        score,
        max_score: maxScore,
        completed_at: completedAt,
      })
      .eq("id", attemptId)
      .eq("status", "in_progress")
      .select("id")
      .maybeSingle();
    if (completionError) throw completionError;
    if (!completedAttempt) {
      return NextResponse.json(
        { error: "This practice attempt was already submitted." },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      score,
      maxScore,
      completedAt,
      review: review.map((item) => ({
        questionId: item.questionId,
        answer: item.answer,
        correctAnswer: item.correctAnswer,
        explanation: item.explanation,
        isCorrect: item.isCorrect,
        pointsAwarded: item.pointsAwarded,
      })),
    });
  } catch (error) {
    return userAuthErrorResponse(error);
  }
}
