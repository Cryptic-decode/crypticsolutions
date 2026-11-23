import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ListeningSetDetail,
  PracticeAttemptStatus,
  ReadingAttemptReviewItem,
  ReadingAttemptState,
  ReadingQuestionType,
} from "@/lib/practice";

interface SetRow {
  id: string;
  title: string;
  description: string;
  instructions: string;
  duration_minutes: number | null;
  position: number;
  practice_sections: Array<{
    id: string;
    title: string;
    instructions: string;
    source_text: string | null;
    media_url: string | null;
    position: number;
    practice_questions: Array<{
      id: string;
      question_type: ReadingQuestionType;
      prompt: string;
      options: string[];
      points: number;
      position: number;
    }>;
  }>;
}

interface AttemptRow {
  id: string;
  status: PracticeAttemptStatus;
  score: number | null;
  max_score: number | null;
  started_at: string;
  completed_at: string | null;
}

interface AnswerRow {
  question_id: string;
  answer: { value?: unknown } | string;
  is_correct: boolean | null;
  points_awarded: number | null;
}

interface AnswerKeyRow {
  question_id: string;
  correct_answer: { acceptedValues?: unknown };
  explanation: string;
}

function getAnswerValue(answer: AnswerRow["answer"]) {
  if (typeof answer === "string") return answer;
  return typeof answer?.value === "string" ? answer.value : "";
}

export async function getListeningSetDetail(
  admin: SupabaseClient,
  setId: string,
  userId: string,
): Promise<ListeningSetDetail | null> {
  const { data, error } = await admin
    .from("practice_sets")
    .select(
      "id, title, description, instructions, duration_minutes, position, practice_sections(id, title, instructions, source_text, media_url, position, practice_questions(id, question_type, prompt, options, points, position))",
    )
    .eq("id", setId)
    .eq("skill", "listening")
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const set = data as SetRow;
  const { data: attemptData, error: attemptError } = await admin
    .from("practice_attempts")
    .select("id, status, score, max_score, started_at, completed_at")
    .eq("user_id", userId)
    .eq("set_id", setId)
    .in("status", ["in_progress", "completed"])
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (attemptError) throw attemptError;

  const completed = attemptData?.status === "completed";
  const sections = [...set.practice_sections]
    .sort((a, b) => a.position - b.position)
    .map((section) => ({
      id: section.id,
      title: section.title,
      instructions: section.instructions,
      position: section.position,
      questions: [...section.practice_questions]
        .sort((a, b) => a.position - b.position)
        .map((question) => ({
          id: question.id,
          type: question.question_type,
          prompt: question.prompt,
          options: question.options,
          points: Number(question.points),
          position: question.position,
        })),
      ...(completed ? { transcript: section.source_text ?? "" } : {}),
    }));

  let attempt: ReadingAttemptState | null = null;
  if (attemptData) {
    const attemptRow = attemptData as AttemptRow;
    const { data: answerData, error: answerError } = await admin
      .from("practice_answers")
      .select("question_id, answer, is_correct, points_awarded")
      .eq("attempt_id", attemptRow.id);
    if (answerError) throw answerError;

    const answerRows = (answerData ?? []) as AnswerRow[];
    const answers = Object.fromEntries(
      answerRows.map((answer) => [
        answer.question_id,
        getAnswerValue(answer.answer),
      ]),
    );
    let review: ReadingAttemptReviewItem[] | undefined;

    if (attemptRow.status === "completed") {
      const questionIds = sections.flatMap((section) =>
        section.questions.map((question) => question.id),
      );
      const { data: keyData, error: keyError } = await admin
        .from("practice_answer_keys")
        .select("question_id, correct_answer, explanation")
        .in("question_id", questionIds);
      if (keyError) throw keyError;

      const keys = new Map(
        ((keyData ?? []) as AnswerKeyRow[]).map((key) => [
          key.question_id,
          key,
        ]),
      );
      const answerMap = new Map(
        answerRows.map((answer) => [answer.question_id, answer]),
      );
      review = questionIds.map((questionId) => {
        const key = keys.get(questionId);
        const answer = answerMap.get(questionId);
        const acceptedValues = Array.isArray(
          key?.correct_answer?.acceptedValues,
        )
          ? key.correct_answer.acceptedValues.filter(
              (value): value is string => typeof value === "string",
            )
          : [];
        return {
          questionId,
          answer: answer ? getAnswerValue(answer.answer) : "",
          correctAnswer: acceptedValues[0] ?? "",
          explanation: key?.explanation ?? "",
          isCorrect: answer?.is_correct ?? false,
          pointsAwarded: Number(answer?.points_awarded ?? 0),
        };
      });
    }

    attempt = {
      id: attemptRow.id,
      status: attemptRow.status,
      answers,
      score: attemptRow.score === null ? null : Number(attemptRow.score),
      maxScore:
        attemptRow.max_score === null ? null : Number(attemptRow.max_score),
      startedAt: attemptRow.started_at,
      completedAt: attemptRow.completed_at,
      review,
    };
  }

  return {
    id: set.id,
    title: set.title,
    description: set.description,
    instructions: set.instructions,
    durationMinutes: set.duration_minutes,
    position: set.position,
    questionCount: sections.reduce(
      (total, section) => total + section.questions.length,
      0,
    ),
    sections,
    attempt,
  };
}
