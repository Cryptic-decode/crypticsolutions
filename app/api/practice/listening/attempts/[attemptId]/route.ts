import { NextRequest } from "next/server";

import {
  saveObjectiveAnswer,
  submitObjectiveAttempt,
} from "@/lib/server/objective-practice-attempts";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> },
) {
  const { attemptId } = await params;
  return saveObjectiveAnswer(request, attemptId, "listening");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> },
) {
  const { attemptId } = await params;
  return submitObjectiveAttempt(request, attemptId, "listening");
}
