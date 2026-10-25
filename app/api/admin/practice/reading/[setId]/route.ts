import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { authenticateAdmin } from "@/lib/admin-auth";
import { practiceAdminErrorResponse } from "@/lib/server/practice-admin-errors";

const updateSchema = z.object({
  status: z.enum(["draft", "published", "archived"]),
});

const editQuestionSchema = z.object({
  id: z.string().uuid(),
  prompt: z.string().trim().min(8).max(500),
  options: z.array(z.string().trim().min(1).max(250)).max(6),
  acceptedAnswers: z.array(z.string().trim().min(1).max(250)).min(1).max(10),
  explanation: z.string().trim().min(8).max(1000),
});

const editSchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(10).max(300),
  instructions: z.string().trim().min(10).max(500),
  durationMinutes: z.number().int().min(5).max(180),
  section: z.object({
    id: z.string().uuid(),
    title: z.string().trim().min(3).max(120),
    passage: z.string().trim().min(300).max(10000),
  }),
  questions: z.array(editQuestionSchema).min(6).max(10),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string }> },
) {
  try {
    const { admin } = await authenticateAdmin(request);
    const { setId } = await params;
    const { data: set, error } = await admin
      .from("practice_sets")
      .select(
        "id, title, description, instructions, status, duration_minutes, created_at, practice_sections(id, title, instructions, source_text, position, practice_questions(id, question_type, prompt, options, points, position, practice_answer_keys(correct_answer, explanation)))",
      )
      .eq("id", setId)
      .eq("skill", "reading")
      .single();

    if (error || !set) {
      return NextResponse.json(
        { error: "Reading practice set not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { set },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return practiceAdminErrorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string }> },
) {
  try {
    const { admin, user } = await authenticateAdmin(request);
    const { setId } = await params;
    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Choose a valid practice status." },
        { status: 400 },
      );
    }

    if (parsed.data.status === "published") {
      const { data: questions, error: questionError } = await admin
        .from("practice_questions")
        .select(
          "id, practice_sections!inner(set_id), practice_answer_keys(question_id)",
        )
        .eq("practice_sections.set_id", setId);
      if (questionError) throw questionError;
      const hasMissingAnswerKey = questions?.some((question) => {
        const keys = question.practice_answer_keys;
        return Array.isArray(keys) ? keys.length === 0 : !keys;
      });
      if (!questions || questions.length < 6 || hasMissingAnswerKey) {
        return NextResponse.json(
          {
            error:
              "Every published set must contain questions with answer keys.",
          },
          { status: 409 },
        );
      }
    }

    const now = new Date().toISOString();
    const { data: updatedSet, error } = await admin
      .from("practice_sets")
      .update({
        status: parsed.data.status,
        published_at: parsed.data.status === "published" ? now : null,
        published_by: parsed.data.status === "published" ? user.id : null,
      })
      .eq("id", setId)
      .eq("skill", "reading")
      .select("id, status, published_at")
      .maybeSingle();

    if (error) throw error;
    if (!updatedSet)
      return NextResponse.json(
        { error: "Reading practice set not found." },
        { status: 404 },
      );
    return NextResponse.json({ success: true, set: updatedSet });
  } catch (error) {
    return practiceAdminErrorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string }> },
) {
  try {
    const { admin } = await authenticateAdmin(request);
    const { setId } = await params;
    const parsed = editSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Review the Reading practice content and try again.",
        },
        { status: 400 },
      );
    }

    const { data: existingSet, error: setError } = await admin
      .from("practice_sets")
      .select(
        "id, status, practice_sections(id, practice_questions(id, question_type))",
      )
      .eq("id", setId)
      .eq("skill", "reading")
      .maybeSingle();
    if (setError) throw setError;
    if (!existingSet)
      return NextResponse.json(
        { error: "Reading practice set not found." },
        { status: 404 },
      );
    if (existingSet.status !== "draft") {
      return NextResponse.json(
        { error: "Return this set to draft before editing it." },
        { status: 409 },
      );
    }

    const section = existingSet.practice_sections?.[0];
    const existingQuestions = section?.practice_questions ?? [];
    const existingById = new Map(
      existingQuestions.map((question) => [question.id, question]),
    );
    const submittedIds = new Set(
      parsed.data.questions.map((question) => question.id),
    );
    if (
      section?.id !== parsed.data.section.id ||
      existingQuestions.length !== parsed.data.questions.length ||
      existingQuestions.some((question) => !submittedIds.has(question.id))
    ) {
      return NextResponse.json(
        { error: "The Reading draft changed. Reload it before saving." },
        { status: 409 },
      );
    }

    for (const question of parsed.data.questions) {
      const existing = existingById.get(question.id);
      if (!existing) {
        return NextResponse.json(
          { error: "The Reading draft changed. Reload it before saving." },
          { status: 409 },
        );
      }
      if (
        existing.question_type === "single_choice" &&
        question.options.length < 2
      ) {
        return NextResponse.json(
          {
            error: "Each multiple-choice question needs at least two options.",
          },
          { status: 400 },
        );
      }
    }

    const { error: setUpdateError } = await admin
      .from("practice_sets")
      .update({
        title: parsed.data.title,
        description: parsed.data.description,
        instructions: parsed.data.instructions,
        duration_minutes: parsed.data.durationMinutes,
      })
      .eq("id", setId);
    if (setUpdateError) throw setUpdateError;

    const { error: sectionError } = await admin
      .from("practice_sections")
      .update({
        title: parsed.data.section.title,
        source_text: parsed.data.section.passage,
      })
      .eq("id", parsed.data.section.id)
      .eq("set_id", setId);
    if (sectionError) throw sectionError;

    for (const question of parsed.data.questions) {
      const { error: questionError } = await admin
        .from("practice_questions")
        .update({ prompt: question.prompt, options: question.options })
        .eq("id", question.id)
        .eq("section_id", parsed.data.section.id);
      if (questionError) throw questionError;

      const { error: answerError } = await admin
        .from("practice_answer_keys")
        .update({
          correct_answer: { acceptedValues: question.acceptedAnswers },
          explanation: question.explanation,
        })
        .eq("question_id", question.id);
      if (answerError) throw answerError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return practiceAdminErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string }> },
) {
  try {
    const { admin } = await authenticateAdmin(request);
    const { setId } = await params;
    const { count, error: attemptError } = await admin
      .from("practice_attempts")
      .select("id", { count: "exact", head: true })
      .eq("set_id", setId);
    if (attemptError) throw attemptError;
    if ((count ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            "This set has learner attempts. Archive it instead so the learning record remains intact.",
        },
        { status: 409 },
      );
    }

    const { data, error } = await admin
      .from("practice_sets")
      .delete()
      .eq("id", setId)
      .eq("skill", "reading")
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data)
      return NextResponse.json(
        { error: "Reading practice set not found." },
        { status: 404 },
      );
    return NextResponse.json({ success: true });
  } catch (error) {
    return practiceAdminErrorResponse(error);
  }
}
