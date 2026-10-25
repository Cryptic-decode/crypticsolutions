import { NextRequest, NextResponse } from "next/server";

import { PRACTICE_PRODUCT_ID, type PracticeAttemptSummary, type PracticeSkill } from "@/lib/practice";
import { authenticateUser, userAuthErrorResponse } from "@/lib/server/user-auth";

interface AttemptRow {
  id: string;
  status: PracticeAttemptSummary["status"];
  score: number | null;
  max_score: number | null;
  started_at: string;
  completed_at: string | null;
  practice_sets: { title: string; skill: PracticeSkill } | { title: string; skill: PracticeSkill }[] | null;
}

const missingPracticeTableCodes = new Set(["42P01", "PGRST205"]);

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await authenticateUser(request);
    const { data: purchases, error: purchaseError } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", PRACTICE_PRODUCT_ID)
      .eq("status", "completed")
      .limit(1);

    if (purchaseError) throw purchaseError;

    if (!purchases?.length) {
      return NextResponse.json(
        { hasAccess: false, attempts: [] },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }

    const { data, error: attemptsError } = await supabase
      .from("practice_attempts")
      .select("id, status, score, max_score, started_at, completed_at, practice_sets(title, skill)")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(6);

    if (attemptsError && !missingPracticeTableCodes.has(attemptsError.code ?? "")) {
      throw attemptsError;
    }

    const attempts = ((data ?? []) as AttemptRow[]).flatMap((attempt) => {
      const set = Array.isArray(attempt.practice_sets)
        ? attempt.practice_sets[0]
        : attempt.practice_sets;

      if (!set) return [];

      return [{
        id: attempt.id,
        setTitle: set.title,
        skill: set.skill,
        status: attempt.status,
        score: attempt.score,
        maxScore: attempt.max_score,
        startedAt: attempt.started_at,
        completedAt: attempt.completed_at,
      } satisfies PracticeAttemptSummary];
    });

    return NextResponse.json(
      { hasAccess: true, attempts },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return userAuthErrorResponse(error);
  }
}
