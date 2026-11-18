import "server-only";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import type { ReadingQuestionType } from "@/lib/practice";

export const PRACTICE_AI_MODEL =
  process.env.PRACTICE_AI_MODEL || "gemini-3.8-flash";
export const READING_PROMPT_VERSION = "reading-set-v2";

export const readingGenerationInputSchema = z.object({
  topic: z.string().trim().min(3).max(100),
  difficulty: z.enum(["foundation", "standard", "challenging"]),
  questionCount: z.union([z.literal(6), z.literal(8), z.literal(10)]),
});

export type ReadingGenerationInput = z.infer<
  typeof readingGenerationInputSchema
>;

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
      usage: {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
      };
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
    "passage",
    "questions",
  ],
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
- Use exactly ${input.questionCount / 2} single_choice and ${input.questionCount / 2} short_answer questions.
- Arrange the questions in the same order as the supporting information appears in the passage.
- Test a useful mix of detail, main idea, inference, purpose, and cause-and-effect understanding. Do not repeat the same fact in multiple questions.
- For single_choice, provide exactly four plausible options and make acceptedAnswers contain the exact correct option text.
- For single_choice, make every distractor plausible but clearly contradicted or unsupported by the passage.
- For short_answer, provide no options. The expected answer must be no more than three words and/or a number. Include only reasonable spelling or wording variants that the passage supports.
- Every answer must be directly supported by the passage.
- Explanations must identify and briefly paraphrase the relevant evidence without inventing information.
- Avoid trick questions, ambiguity, and culturally narrow assumptions.
- Do not use em dashes. Use full stops, commas, or parentheses instead.
- Return plain text inside every JSON string.`;
}

function validateGeneratedSet(
  set: GeneratedReadingSet,
  expectedQuestionCount: number,
) {
  if (set.questions.length !== expectedQuestionCount) return false;

  const expectedPerType = expectedQuestionCount / 2;
  const singleChoiceCount = set.questions.filter(
    (question) => question.type === "single_choice",
  ).length;
  const shortAnswerCount = set.questions.filter(
    (question) => question.type === "short_answer",
  ).length;
  if (
    singleChoiceCount !== expectedPerType ||
    shortAnswerCount !== expectedPerType
  ) {
    return false;
  }

  const normalizedPrompts = set.questions.map((question) =>
    question.prompt.trim().toLowerCase(),
  );
  if (new Set(normalizedPrompts).size !== normalizedPrompts.length)
    return false;

  return set.questions.every((question) => {
    const normalizedAnswers = question.acceptedAnswers.map((answer) =>
      answer.trim().toLowerCase(),
    );
    if (new Set(normalizedAnswers).size !== normalizedAnswers.length)
      return false;

    if (question.type === "single_choice") {
      const normalizedOptions = question.options.map((option) =>
        option.trim().toLowerCase(),
      );
      return (
        new Set(normalizedOptions).size === 4 &&
        question.options.length === 4 &&
        question.acceptedAnswers.length === 1 &&
        question.options.includes(question.acceptedAnswers[0])
      );
    }

    return (
      question.options.length === 0 &&
      question.acceptedAnswers.every(
        (answer) => answer.trim().split(/\s+/).length <= 3,
      )
    );
  });
}

function isRetryableProviderError(error: unknown) {
  if (!error || typeof error !== "object" || !("status" in error)) return false;
  const status = Number(error.status);
  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

function wait(delayMs: number) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export async function generateReadingSet(
  input: ReadingGenerationInput,
  requestId: string,
): Promise<ReadingGenerationResult> {
  const startedAt = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      reason: "not_configured",
      durationMs: Date.now() - startedAt,
    };
  }

  try {
    const client = new GoogleGenAI({ apiKey });
    let response:
      | Awaited<ReturnType<typeof client.models.generateContent>>
      | undefined;
    let providerError: unknown;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        response = await client.models.generateContent({
          model: PRACTICE_AI_MODEL,
          contents: buildReadingPrompt(input),
          config: {
            maxOutputTokens: 7000,
            responseMimeType: "application/json",
            responseJsonSchema: readingSetJsonSchema,
            systemInstruction:
              "You create accurate, original IELTS-style practice material for admin review. Quality, answerability, and evidence-based explanations are mandatory.",
          },
        });
        break;
      } catch (error) {
        providerError = error;
        if (attempt === 1 || !isRetryableProviderError(error)) throw error;
        await wait(750);
      }
    }

    if (!response) throw providerError;

    if (!response.text) {
      return {
        ok: false,
        reason: "invalid_response",
        durationMs: Date.now() - startedAt,
      };
    }

    const parsed = generatedReadingSetSchema.parse(JSON.parse(response.text));
    if (!validateGeneratedSet(parsed, input.questionCount)) {
      return {
        ok: false,
        reason: "invalid_response",
        durationMs: Date.now() - startedAt,
      };
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
    const invalidResponse =
      error instanceof SyntaxError || error instanceof z.ZodError;
    console.error(
      JSON.stringify({
        event: "reading_practice_generation_failed",
        requestId,
        model: PRACTICE_AI_MODEL,
        promptVersion: READING_PROMPT_VERSION,
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
