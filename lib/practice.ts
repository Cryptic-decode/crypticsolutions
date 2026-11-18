export const PRACTICE_PRODUCT_ID = "ielts-manual";

export type PracticeSkill = "reading" | "listening" | "writing" | "speaking";
export type PracticeDevelopmentStatus = "available" | "coming_soon";
export type PracticeAttemptStatus = "in_progress" | "completed" | "abandoned";
export type ReadingQuestionType = "single_choice" | "short_answer";
export type ListeningQuestionType = ReadingQuestionType;

export interface PracticeSkillDefinition {
  skill: PracticeSkill;
  title: string;
  description: string;
  status: PracticeDevelopmentStatus;
}

export interface PracticeAttemptSummary {
  id: string;
  setTitle: string;
  skill: PracticeSkill;
  status: PracticeAttemptStatus;
  score: number | null;
  maxScore: number | null;
  startedAt: string;
  completedAt: string | null;
}

export interface PracticeOverviewData {
  hasAccess: boolean;
  attempts: PracticeAttemptSummary[];
  availableSetCounts: Partial<Record<PracticeSkill, number>>;
}

export interface ReadingQuestion {
  id: string;
  type: ReadingQuestionType;
  prompt: string;
  options: string[];
  points: number;
  position: number;
}

export interface ReadingSection {
  id: string;
  title: string;
  instructions: string;
  passage: string;
  position: number;
  questions: ReadingQuestion[];
}

export interface ReadingSetSummary {
  id: string;
  title: string;
  description: string;
  durationMinutes: number | null;
  questionCount: number;
  position: number;
  latestAttemptStatus?: PracticeAttemptStatus;
}

export interface ReadingAttemptReviewItem {
  questionId: string;
  answer: string;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
  pointsAwarded: number;
}

export interface ReadingAttemptState {
  id: string;
  status: PracticeAttemptStatus;
  answers: Record<string, string>;
  score: number | null;
  maxScore: number | null;
  startedAt: string;
  completedAt: string | null;
  review?: ReadingAttemptReviewItem[];
}

export interface ReadingSetDetail
  extends Omit<ReadingSetSummary, "questionCount"> {
  instructions: string;
  sections: ReadingSection[];
  questionCount: number;
  attempt: ReadingAttemptState | null;
}

export interface ListeningSection {
  id: string;
  title: string;
  instructions: string;
  position: number;
  questions: ReadingQuestion[];
  transcript?: string;
}

export type ListeningSetSummary = ReadingSetSummary;
export type ListeningAttemptReviewItem = ReadingAttemptReviewItem;
export type ListeningAttemptState = ReadingAttemptState;

export interface ListeningSetDetail
  extends Omit<ListeningSetSummary, "questionCount"> {
  instructions: string;
  sections: ListeningSection[];
  questionCount: number;
  attempt: ListeningAttemptState | null;
}

export const PRACTICE_SKILLS = [
  {
    skill: "reading",
    title: "Reading",
    description:
      "Practise finding evidence, managing time, and answering common IELTS reading question types.",
    status: "coming_soon",
  },
  {
    skill: "listening",
    title: "Listening",
    description:
      "Build accuracy across conversations, monologues, note completion, and multiple-choice tasks.",
    status: "coming_soon",
  },
] as const satisfies readonly PracticeSkillDefinition[];

export function getPracticeStatusLabel(status: PracticeDevelopmentStatus) {
  if (status === "available") return "Available";
  return "Coming soon";
}

export function getAttemptStatusLabel(status: PracticeAttemptStatus) {
  if (status === "in_progress") return "In progress";
  if (status === "completed") return "Completed";
  return "Not completed";
}
