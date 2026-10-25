import "server-only";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import type { ReadingQuestionType } from "@/lib/practice";

export const PRACTICE_AI_MODEL = process.env.PRACTICE_AI_MODEL || "gemini-3.8-flash";
export const READING_PROMPT_VERSION = "reading-set-v1";

export const readingGenerationInputSchema = z.object({
  topic: z.string().trim().min(3).max(100),
  difficulty: z.enum(["foundation", "standard", "challenging"]),
  questionCount: z.union([z.literal(6), z.literal(8), z.literal(10)]),
});

export type ReadingGenerationInput = z.infer<typeof readingGenerationInputSchema>;

const generatedQuestionSchema = z.object({
  type: z.enum(["single_choice", "short_answer"]),
  prompt: z.string().trim().min(8).max(320),
  options: z.array(z.string().trim().min(1).max(180)).max(4),
  acceptedAnswers: z.array(z.string().trim().min(1).max(180)).min(1).max(5),
  explanation: z.string().trim().min(15).max(600),
});

const generatedReadingSetSchema = z.object({
  title: z.string().trim().min(8).max(120),
  description: z.string().trim().min(20).max(280),
  instructions: z.string().trim().min(15).max(300),
  durationMinutes: z.number().int().min(10).max(40),
  sectionTitle: z.string().trim().min(3).max(120),
  passage: z.string().trim().min(1800).max(7000),
  questions: z.array(generatedQuestionSchema).min(6).max(10),
});

export interface GeneratedReadingQuestion {
  type: ReadingQuestionType;
  prompt: string;
  options: string[];
  acceptedAnswers: string[];
  explanation: string;
}

export interface GeneratedReadingSet {
  title: string;
  description: string;
  instructions: string;
  durationMinutes: number;
  sectionTitle: string;
  passage: string;
  questions: GeneratedReadingQuestion[];
}

export type ReadingGenerationResult =
  | {
      ok: true;
      set: GeneratedReadingSet;
      durationMs: number;
      usage: { inputTokens?: number; outputTokens?: number; totalTokens?: number };
    }
  | {
      ok: false;
      reason: "not_configured" | "invalid_response" | "provider_error";
      durationMs: number;
    };

const readingSetJsonSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    instructions: { type: "string" },
    durationMinutes: { type: "integer", minimum: 10, maximum: 40 },
    sectionTitle: { type: "string" },
    passage: { type: "string" },
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
          acceptedAnswers: { type: "array", minItems: 1, maxItems: 5, items: { type: "string" } },
          explanation: { type: "string" },
        },
        required: ["type", "prompt", "options", "acceptedAnswers", "explanation"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "description", "instructions", "durationMinutes", "sectionTitle", "passage", "questions"],
  additionalProperties: false,
} as const;

function buildReadingPrompt(input: ReadingGenerationInput) {
  return `Create one original IELTS Academic-style reading practice set.

Topic: ${input.topic}
Difficulty: ${input.difficulty}
Question count: ${input.questionCount}

Requirements:
- Write an original informational passage of 650 to 850 words. Do not copy, quote, paraphrase, or name a real published article.
- This is independent practice material. Do not claim it is official IELTS, British Council, Cambridge, or IDP content.
- Use clear international English and a neutral academic tone.
- Keep the passage self-contained. A learner must not need outside knowledge.
- Create exactly ${input.questionCount} questions.
- Use a balanced mix of single_choice and short_answer questions.
- For single_choice, provide exactly four plausible options and make acceptedAnswers contain the exact correct option text.
- For short_answer, provide no options and include reasonable spelling or wording variants in acceptedAnswers.
- Every answer must be directly supported by the passage.
- Explanations must identify the relevant evidence without inventing information.
- Avoid trick questions, ambiguity, and culturally narrow assumptions.
- Do not use em dashes. Use full stops, commas, or parentheses instead.
- Return plain text inside every JSON string.`;
}

function validateGeneratedSet(set: GeneratedReadingSet, expectedQuestionCount: number) {
  if (set.questions.length !== expectedQuestionCount) return false;

  return set.questions.every((question) => {
    if (question.type === "single_choice") {
      return question.options.length === 4
        && question.acceptedAnswers.length === 1
        && question.options.includes(question.acceptedAnswers[0]);
    }
    return question.options.length === 0;
  });
}

export async function generateReadingSet(
  input: ReadingGenerationInput,
  requestId: string,
): Promise<ReadingGenerationResult> {
  const startedAt = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, reason: "not_configured", durationMs: Date.now() - startedAt };

  try {
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model: PRACTICE_AI_MODEL,
      contents: buildReadingPrompt(input),
      config: {
        maxOutputTokens: 7000,
        responseMimeType: "application/json",
        responseJsonSchema: readingSetJsonSchema,
        systemInstruction: "You create accurate, original IELTS-style practice material for admin review. Quality, answerability, and evidence-based explanations are mandatory.",
      },
    });

    if (!response.text) {
      return { ok: false, reason: "invalid_response", durationMs: Date.now() - startedAt };
    }

    const parsed = generatedReadingSetSchema.parse(JSON.parse(response.text));
    if (!validateGeneratedSet(parsed, input.questionCount)) {
      return { ok: false, reason: "invalid_response", durationMs: Date.now() - startedAt };
    }

    return {
      ok: true,
      set: parsed,
      durationMs: Date.now() - startedAt,
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount,
        outputTokens: response.usageMetadata?.candidatesTokenCount,
        totalTokens: response.usageMetadata?.totalTokenCount,
      },
    };
  } catch (error) {
    const invalidResponse = error instanceof SyntaxError || error instanceof z.ZodError;
    console.error(JSON.stringify({
      event: "reading_practice_generation_failed",
      requestId,
      model: PRACTICE_AI_MODEL,
      promptVersion: READING_PROMPT_VERSION,
      reason: invalidResponse ? "invalid_response" : "provider_error",
      errorType: error instanceof Error ? error.name : "UnknownError",
      durationMs: Date.now() - startedAt,
    }));
    return {
      ok: false,
      reason: invalidResponse ? "invalid_response" : "provider_error",
      durationMs: Date.now() - startedAt,
    };
  }
}
