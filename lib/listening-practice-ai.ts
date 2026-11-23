import "server-only";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import { PRACTICE_AI_MODEL } from "@/lib/practice-ai";
import type { ListeningQuestionType } from "@/lib/practice";

export const PRACTICE_TTS_MODEL =
  process.env.PRACTICE_TTS_MODEL || "gemini-3.8-flash-lite-tts";
export const LISTENING_PROMPT_VERSION = "listening-set-v1";

export const listeningGenerationInputSchema = z.object({
  topic: z.string().trim().min(3).max(100),
  difficulty: z.enum(["foundation", "standard", "challenging"]),
  format: z.enum(["monologue", "dialogue"]),
  questionCount: z.union([z.literal(6), z.literal(8), z.literal(10)]),
});

export type ListeningGenerationInput = z.infer<
  typeof listeningGenerationInputSchema
>;

const generatedQuestionSchema = z.object({
  type: z.enum(["single_choice", "short_answer"]),
  prompt: z.string().trim().min(8).max(320),
  options: z.array(z.string().trim().min(1).max(180)).max(4),
  acceptedAnswers: z.array(z.string().trim().min(1).max(180)).min(1).max(5),
  explanation: z.string().trim().min(15).max(600),
});

const generatedListeningSetSchema = z.object({
  title: z.string().trim().min(8).max(120),
  description: z.string().trim().min(20).max(280),
  instructions: z.string().trim().min(15).max(300),
  durationMinutes: z.number().int().min(5).max(25),
  sectionTitle: z.string().trim().min(3).max(120),
  speakers: z
    .array(
      z.object({
        name: z.string().trim().min(2).max(40),
      }),
    )
    .min(1)
    .max(2),
  segments: z
    .array(
      z.object({
        speaker: z.string().trim().min(2).max(40),
        text: z.string().trim().min(10).max(1500),
      }),
    )
    .min(3)
    .max(30),
  questions: z.array(generatedQuestionSchema).min(6).max(10),
});

export interface ListeningScriptSpeaker {
  name: string;
}

export interface ListeningScriptSegment {
  speaker: string;
  text: string;
}

export interface GeneratedListeningQuestion {
  type: ListeningQuestionType;
  prompt: string;
  options: string[];
  acceptedAnswers: string[];
  explanation: string;
}

export interface GeneratedListeningSet {
  title: string;
  description: string;
  instructions: string;
  durationMinutes: number;
  sectionTitle: string;
  speakers: ListeningScriptSpeaker[];
  segments: ListeningScriptSegment[];
  questions: GeneratedListeningQuestion[];
}

export type ListeningGenerationResult =
  | {
      ok: true;
      set: GeneratedListeningSet;
      audio: Buffer;
      durationMs: number;
      usage: {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
      };
    }
  | {
      ok: false;
      reason:
        | "not_configured"
        | "invalid_response"
        | "provider_error"
        | "audio_error";
      durationMs: number;
    };

const listeningSetJsonSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    instructions: { type: "string" },
    durationMinutes: { type: "integer", minimum: 5, maximum: 25 },
    sectionTitle: { type: "string" },
    speakers: {
      type: "array",
      minItems: 1,
      maxItems: 2,
      items: {
        type: "object",
        properties: { name: { type: "string" } },
        required: ["name"],
        additionalProperties: false,
      },
    },
    segments: {
      type: "array",
      minItems: 3,
      maxItems: 30,
      items: {
        type: "object",
        properties: { speaker: { type: "string" }, text: { type: "string" } },
        required: ["speaker", "text"],
        additionalProperties: false,
      },
    },
    questions: {
      type: "array",
      minItems: 6,
      maxItems: 10,
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["single_choice", "short_answer"] },
          prompt: { type: "string" },
          options: { type: "array", maxItems: 4, items: { type: "string" } },
          acceptedAnswers: {
            type: "array",
            minItems: 1,
            maxItems: 5,
            items: { type: "string" },
          },
          explanation: { type: "string" },
        },
        required: [
          "type",
          "prompt",
          "options",
          "acceptedAnswers",
          "explanation",
        ],
        additionalProperties: false,
      },
    },
  },
  required: [
    "title",
    "description",
    "instructions",
    "durationMinutes",
    "sectionTitle",
    "speakers",
    "segments",
    "questions",
  ],
  additionalProperties: false,
} as const;

function buildListeningPrompt(input: ListeningGenerationInput) {
  const formatRequirement =
    input.format === "dialogue"
      ? "Use exactly two named speakers and alternate naturally between them."
      : "Use exactly one named speaker in a clear informational monologue.";

  return `Create one original IELTS-style listening practice set.

Topic or situation: ${input.topic}
Difficulty: ${input.difficulty}
Format: ${input.format}
Question count: ${input.questionCount}

Requirements:
- Write an original spoken script of 420 to 600 words.
- ${formatRequirement}
- Make the script sound natural when read aloud, with no visual references or stage directions.
- This is independent practice material. Do not claim it is official IELTS, British Council, Cambridge, or IDP content.
- Use clear international English suitable for a neutral British-English delivery.
- Keep the recording self-contained. A learner must not need outside knowledge.
- Create exactly ${input.questionCount} questions in the same order as the information appears in the recording.
- Use a balanced mix of single_choice and short_answer questions.
- For single_choice, provide exactly four plausible options and make acceptedAnswers contain the exact correct option text.
- For short_answer, provide no options and include reasonable spelling or wording variants in acceptedAnswers.
- Every answer must be directly supported by the spoken script.
- Explanations must identify the relevant spoken evidence without inventing information.
- Avoid trick questions, ambiguity, culturally narrow assumptions, and em dashes.
- Speaker names in every segment must exactly match a name in speakers.
- Return plain text inside every JSON string.`;
}

function validateGeneratedSet(
  set: GeneratedListeningSet,
  input: ListeningGenerationInput,
) {
  if (set.questions.length !== input.questionCount) return false;
  if (set.speakers.length !== (input.format === "dialogue" ? 2 : 1))
    return false;

  const speakerNames = new Set(set.speakers.map((speaker) => speaker.name));
  if (set.segments.some((segment) => !speakerNames.has(segment.speaker)))
    return false;

  return set.questions.every((question) => {
    if (question.type === "single_choice") {
      return (
        question.options.length === 4 &&
        question.acceptedAnswers.length === 1 &&
        question.options.includes(question.acceptedAnswers[0])
      );
    }
    return question.options.length === 0;
  });
}

function buildSpeechInput(set: GeneratedListeningSet) {
  return [
    {
      type: "user_input" as const,
      content: set.segments.map((segment) => ({
        type: "text" as const,
        text: segment.text,
        annotations: [
          {
            type: "speech_metadata" as const,
            speaker: segment.speaker,
            style:
              "clear, natural and measured IELTS listening delivery with neutral British English pronunciation",
          },
        ],
      })),
    },
  ];
}

async function synthesizeAudio(
  client: GoogleGenAI,
  set: GeneratedListeningSet,
) {
  const voices = ["Iapetus", "Kore"];
  const speechConfig =
    set.speakers.length === 1
      ? [{ voice: voices[0] }]
      : {
          speakers: set.speakers.map((speaker, index) => ({
            speaker: speaker.name,
            voice: voices[index],
          })),
        };

  const interaction = await client.interactions.create({
    model: PRACTICE_TTS_MODEL,
    input: buildSpeechInput(set),
    response_format: { type: "audio" },
    generation_config: { speech_config: speechConfig },
  });
  const audioData = interaction.output_audio?.data;
  if (!audioData) throw new Error("The TTS model did not return audio.");

  const audio = Buffer.from(audioData, "base64");
  if (audio.length < 44 || audio.subarray(0, 4).toString("ascii") !== "RIFF") {
    throw new Error("The TTS model returned an invalid WAV file.");
  }
  return audio;
}

export function formatListeningTranscript(
  set: Pick<GeneratedListeningSet, "speakers" | "segments">,
) {
  const showSpeaker = set.speakers.length > 1;
  return set.segments
    .map((segment) =>
      showSpeaker ? `${segment.speaker}: ${segment.text}` : segment.text,
    )
    .join("\n\n");
}

export async function generateListeningSet(
  input: ListeningGenerationInput,
  requestId: string,
): Promise<ListeningGenerationResult> {
  const startedAt = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey)
    return {
      ok: false,
      reason: "not_configured",
      durationMs: Date.now() - startedAt,
    };

  try {
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model: PRACTICE_AI_MODEL,
      contents: buildListeningPrompt(input),
      config: {
        maxOutputTokens: 7000,
        responseMimeType: "application/json",
        responseJsonSchema: listeningSetJsonSchema,
        systemInstruction:
          "You create accurate, original IELTS-style listening practice material for admin review. Quality, answerability, natural speech, and evidence-based explanations are mandatory.",
      },
    });

    if (!response.text) {
      return {
        ok: false,
        reason: "invalid_response",
        durationMs: Date.now() - startedAt,
      };
    }

    const parsed = generatedListeningSetSchema.parse(JSON.parse(response.text));
    if (!validateGeneratedSet(parsed, input)) {
      return {
        ok: false,
        reason: "invalid_response",
        durationMs: Date.now() - startedAt,
      };
    }

    let audio: Buffer;
    try {
      audio = await synthesizeAudio(client, parsed);
    } catch (error) {
      console.error(
        JSON.stringify({
          event: "listening_practice_audio_failed",
          requestId,
          model: PRACTICE_TTS_MODEL,
          errorType: error instanceof Error ? error.name : "UnknownError",
          durationMs: Date.now() - startedAt,
        }),
      );
      return {
        ok: false,
        reason: "audio_error",
        durationMs: Date.now() - startedAt,
      };
    }

    return {
      ok: true,
      set: parsed,
      audio,
      durationMs: Date.now() - startedAt,
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount,
        outputTokens: response.usageMetadata?.candidatesTokenCount,
        totalTokens: response.usageMetadata?.totalTokenCount,
      },
    };
  } catch (error) {
    const invalidResponse =
      error instanceof SyntaxError || error instanceof z.ZodError;
    console.error(
      JSON.stringify({
        event: "listening_practice_generation_failed",
        requestId,
        model: PRACTICE_AI_MODEL,
        promptVersion: LISTENING_PROMPT_VERSION,
        reason: invalidResponse ? "invalid_response" : "provider_error",
        errorType: error instanceof Error ? error.name : "UnknownError",
        durationMs: Date.now() - startedAt,
      }),
    );
    return {
      ok: false,
      reason: invalidResponse ? "invalid_response" : "provider_error",
      durationMs: Date.now() - startedAt,
    };
  }
}
