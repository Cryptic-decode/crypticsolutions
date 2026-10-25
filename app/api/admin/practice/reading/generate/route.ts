import { NextRequest, NextResponse } from "next/server";

import {
  generateReadingSet,
  PRACTICE_AI_MODEL,
  READING_PROMPT_VERSION,
  readingGenerationInputSchema,
} from "@/lib/practice-ai";
import { adminErrorResponse, authenticateAdmin } from "@/lib/admin-auth";
import { PRACTICE_PRODUCT_ID } from "@/lib/practice";

const MAX_GENERATIONS_PER_HOUR = 8;

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  let createdSetId: string | null = null;

  try {
    const { admin, user } = await authenticateAdmin(request);
    const input = readingGenerationInputSchema.safeParse(await request.json());
    if (!input.success) {
      return NextResponse.json({ error: "Enter a valid topic, difficulty, and question count." }, { status: 400 });
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: rateLimitError } = await admin
      .from("practice_ai_generations")
      .select("id", { count: "exact", head: true })
      .eq("created_by", user.id)
      .gte("created_at", oneHourAgo);

    if (rateLimitError) throw rateLimitError;
    if ((count ?? 0) >= MAX_GENERATIONS_PER_HOUR) {
      return NextResponse.json(
        { error: "You have reached the hourly draft limit. Review the drafts already created before generating more." },
        { status: 429 },
      );
    }

    const generation = await generateReadingSet(input.data, requestId);
    if (!generation.ok) {
      const message = generation.reason === "not_configured"
        ? "Google AI is not configured. Add GEMINI_API_KEY to the server environment."
        : generation.reason === "invalid_response"
          ? "The generated draft did not pass validation. Try again with a more specific topic."
          : "Google AI could not create the draft. Please try again.";
      return NextResponse.json({ error: message, requestId }, { status: 503 });
    }

    const { count: existingSetCount, error: countError } = await admin
      .from("practice_sets")
      .select("id", { count: "exact", head: true })
      .eq("product_id", PRACTICE_PRODUCT_ID)
      .eq("skill", "reading");
    if (countError) throw countError;

    const slugBase = generation.set.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "reading-practice";
    const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`;

    const { data: practiceSet, error: setError } = await admin
      .from("practice_sets")
      .insert({
        product_id: PRACTICE_PRODUCT_ID,
        skill: "reading",
        slug,
        title: generation.set.title,
        description: generation.set.description,
        instructions: generation.set.instructions,
        duration_minutes: generation.set.durationMinutes,
        status: "draft",
        position: existingSetCount ?? 0,
      })
      .select("id")
      .single();
    if (setError || !practiceSet) throw setError || new Error("The reading set could not be stored.");
    createdSetId = practiceSet.id;

    const { data: section, error: sectionError } = await admin
      .from("practice_sections")
      .insert({
        set_id: practiceSet.id,
        title: generation.set.sectionTitle,
        instructions: generation.set.instructions,
        source_text: generation.set.passage,
        position: 0,
      })
      .select("id")
      .single();
    if (sectionError || !section) throw sectionError || new Error("The reading section could not be stored.");

    const { data: questions, error: questionError } = await admin
      .from("practice_questions")
      .insert(generation.set.questions.map((question, index) => ({
        section_id: section.id,
        question_type: question.type,
        prompt: question.prompt,
        options: question.options,
        points: 1,
        position: index,
      })))
      .select("id, position");
    if (questionError || !questions || questions.length !== generation.set.questions.length) {
      throw questionError || new Error("The reading questions could not be stored.");
    }

    const questionIdByPosition = new Map(questions.map((question) => [question.position, question.id]));
    const { error: answerKeyError } = await admin
      .from("practice_answer_keys")
      .insert(generation.set.questions.map((question, index) => ({
        question_id: questionIdByPosition.get(index),
        correct_answer: { acceptedValues: question.acceptedAnswers },
        explanation: question.explanation,
      })));
    if (answerKeyError) throw answerKeyError;

    const { error: auditError } = await admin
      .from("practice_ai_generations")
      .insert({
        set_id: practiceSet.id,
        created_by: user.id,
        provider: "gemini",
        model: PRACTICE_AI_MODEL,
        prompt_version: READING_PROMPT_VERSION,
        topic: input.data.topic,
        difficulty: input.data.difficulty,
        question_count: input.data.questionCount,
        input_tokens: generation.usage.inputTokens ?? null,
        output_tokens: generation.usage.outputTokens ?? null,
        total_tokens: generation.usage.totalTokens ?? null,
        duration_ms: generation.durationMs,
      });
    if (auditError) throw auditError;

    console.info(JSON.stringify({
      event: "reading_practice_generation_completed",
      requestId,
      setId: practiceSet.id,
      model: PRACTICE_AI_MODEL,
      promptVersion: READING_PROMPT_VERSION,
      durationMs: generation.durationMs,
      totalTokens: generation.usage.totalTokens,
    }));

    return NextResponse.json({ success: true, setId: practiceSet.id }, { status: 201 });
  } catch (error) {
    if (createdSetId) {
      try {
        const { admin } = await authenticateAdmin(request);
        await admin.from("practice_sets").delete().eq("id", createdSetId);
      } catch {
        console.error("Failed to clean up an incomplete reading practice draft", { requestId, createdSetId });
      }
    }
    return adminErrorResponse(error);
  }
}
