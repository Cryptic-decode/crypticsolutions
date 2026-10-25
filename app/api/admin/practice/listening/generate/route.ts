import { NextRequest, NextResponse } from "next/server";

import { authenticateAdmin } from "@/lib/admin-auth";
import {
  formatListeningTranscript,
  generateListeningSet,
  LISTENING_PROMPT_VERSION,
  listeningGenerationInputSchema,
  PRACTICE_TTS_MODEL,
} from "@/lib/listening-practice-ai";
import { PRACTICE_AI_MODEL } from "@/lib/practice-ai";
import { PRACTICE_PRODUCT_ID } from "@/lib/practice";
import { practiceAdminErrorResponse } from "@/lib/server/practice-admin-errors";

export const maxDuration = 120;

const MAX_GENERATIONS_PER_HOUR = 6;
const AUDIO_BUCKET = "practice-audio";

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  let createdSetId: string | null = null;
  let audioPath: string | null = null;

  try {
    const { admin, user } = await authenticateAdmin(request);
    const input = listeningGenerationInputSchema.safeParse(
      await request.json(),
    );
    if (!input.success) {
      return NextResponse.json(
        {
          error: "Enter a valid topic, difficulty, format, and question count.",
        },
        { status: 400 },
      );
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: rateLimitError } = await admin
      .from("practice_ai_generations")
      .select("id", { count: "exact", head: true })
      .eq("created_by", user.id)
      .eq("skill", "listening")
      .gte("created_at", oneHourAgo);
    if (rateLimitError) throw rateLimitError;
    if ((count ?? 0) >= MAX_GENERATIONS_PER_HOUR) {
      return NextResponse.json(
        {
          error:
            "You have reached the hourly Listening draft limit. Review the drafts already created before generating more.",
        },
        { status: 429 },
      );
    }

    const generation = await generateListeningSet(input.data, requestId);
    if (!generation.ok) {
      const message =
        generation.reason === "not_configured"
          ? "Google AI is not configured. Add GEMINI_API_KEY to the server environment."
          : generation.reason === "invalid_response"
            ? "The generated draft did not pass validation. Try again with a more specific topic."
            : generation.reason === "audio_error"
              ? "The transcript was created, but Google AI could not produce valid audio. Please try again."
              : "Google AI could not create the Listening draft. Please try again.";
      return NextResponse.json({ error: message, requestId }, { status: 503 });
    }

    const { count: existingSetCount, error: countError } = await admin
      .from("practice_sets")
      .select("id", { count: "exact", head: true })
      .eq("product_id", PRACTICE_PRODUCT_ID)
      .eq("skill", "listening");
    if (countError) throw countError;

    const slugBase =
      generation.set.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60) || "listening-practice";
    const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`;

    const { data: practiceSet, error: setError } = await admin
      .from("practice_sets")
      .insert({
        product_id: PRACTICE_PRODUCT_ID,
        skill: "listening",
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
    if (setError || !practiceSet)
      throw setError || new Error("The Listening set could not be stored.");
    createdSetId = practiceSet.id;
    audioPath = `listening/${practiceSet.id}/recording.wav`;

    const { error: uploadError } = await admin.storage
      .from(AUDIO_BUCKET)
      .upload(audioPath, generation.audio, {
        contentType: "audio/wav",
        upsert: false,
      });
    if (uploadError) throw uploadError;

    const { data: section, error: sectionError } = await admin
      .from("practice_sections")
      .insert({
        set_id: practiceSet.id,
        title: generation.set.sectionTitle,
        instructions: generation.set.instructions,
        source_text: formatListeningTranscript(generation.set),
        media_url: audioPath,
        audio_script: {
          speakers: generation.set.speakers,
          segments: generation.set.segments,
        },
        position: 0,
      })
      .select("id")
      .single();
    if (sectionError || !section)
      throw (
        sectionError || new Error("The Listening section could not be stored.")
      );

    const { data: questions, error: questionError } = await admin
      .from("practice_questions")
      .insert(
        generation.set.questions.map((question, index) => ({
          section_id: section.id,
          question_type: question.type,
          prompt: question.prompt,
          options: question.options,
          points: 1,
          position: index,
        })),
      )
      .select("id, position");
    if (
      questionError ||
      !questions ||
      questions.length !== generation.set.questions.length
    ) {
      throw (
        questionError ||
        new Error("The Listening questions could not be stored.")
      );
    }

    const questionIdByPosition = new Map(
      questions.map((question) => [question.position, question.id]),
    );
    const { error: answerKeyError } = await admin
      .from("practice_answer_keys")
      .insert(
        generation.set.questions.map((question, index) => ({
          question_id: questionIdByPosition.get(index),
          correct_answer: { acceptedValues: question.acceptedAnswers },
          explanation: question.explanation,
        })),
      );
    if (answerKeyError) throw answerKeyError;

    const { error: auditError } = await admin
      .from("practice_ai_generations")
      .insert({
        set_id: practiceSet.id,
        created_by: user.id,
        provider: "gemini",
        model: PRACTICE_AI_MODEL,
        prompt_version: LISTENING_PROMPT_VERSION,
        topic: input.data.topic,
        difficulty: input.data.difficulty,
        question_count: input.data.questionCount,
        skill: "listening",
        audio_model: PRACTICE_TTS_MODEL,
        audio_bytes: generation.audio.length,
        input_tokens: generation.usage.inputTokens ?? null,
        output_tokens: generation.usage.outputTokens ?? null,
        total_tokens: generation.usage.totalTokens ?? null,
        duration_ms: generation.durationMs,
      });
    if (auditError) throw auditError;

    console.info(
      JSON.stringify({
        event: "listening_practice_generation_completed",
        requestId,
        setId: practiceSet.id,
        model: PRACTICE_AI_MODEL,
        audioModel: PRACTICE_TTS_MODEL,
        promptVersion: LISTENING_PROMPT_VERSION,
        durationMs: generation.durationMs,
        audioBytes: generation.audio.length,
      }),
    );

    return NextResponse.json(
      { success: true, setId: practiceSet.id },
      { status: 201 },
    );
  } catch (error) {
    try {
      const { admin } = await authenticateAdmin(request);
      if (audioPath) await admin.storage.from(AUDIO_BUCKET).remove([audioPath]);
      if (createdSetId)
        await admin.from("practice_sets").delete().eq("id", createdSetId);
    } catch {
      console.error(
        "Failed to clean up an incomplete Listening practice draft",
        { requestId, createdSetId, audioPath },
      );
    }
    return practiceAdminErrorResponse(error);
  }
}
