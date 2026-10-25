export const PRACTICE_PRODUCT_ID = "ielts-manual";

export type PracticeSkill = "reading" | "listening" | "writing" | "speaking";
export type PracticeDevelopmentStatus = "in_development" | "planned";
export type PracticeAttemptStatus = "in_progress" | "completed" | "abandoned";

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
}

export const PRACTICE_SKILLS: PracticeSkillDefinition[] = [
  {
    skill: "reading",
    title: "Reading",
    description: "Practise finding evidence, managing time, and answering common IELTS reading question types.",
    status: "in_development",
  },
  {
    skill: "listening",
    title: "Listening",
    description: "Build accuracy across conversations, monologues, note completion, and multiple-choice tasks.",
    status: "in_development",
  },
  {
    skill: "writing",
    title: "Writing",
    description: "Develop clearer responses with structured practice and useful feedback.",
    status: "planned",
  },
  {
    skill: "speaking",
    title: "Speaking",
    description: "Prepare for each speaking part with guided prompts and focused review.",
    status: "planned",
  },
];

export function getPracticeStatusLabel(status: PracticeDevelopmentStatus) {
  return status === "in_development" ? "In development" : "Planned";
}

export function getAttemptStatusLabel(status: PracticeAttemptStatus) {
  if (status === "in_progress") return "In progress";
  if (status === "completed") return "Completed";
  return "Not completed";
}
