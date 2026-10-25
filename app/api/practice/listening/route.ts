import { NextRequest, NextResponse } from "next/server";

import { PRACTICE_PRODUCT_ID } from "@/lib/practice";
import { requirePracticeAccess } from "@/lib/server/practice-access";
import {
  authenticateUser,
  createServiceSupabaseClient,
  userAuthErrorResponse,
} from "@/lib/server/user-auth";

interface SetRow {
  id: string;
  title: string;
  description: string;
  duration_minutes: number | null;
  position: number;
  practice_sections: { practice_questions: { count: number }[] }[];
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await authenticateUser(request);
    const admin = createServiceSupabaseClient();
    await requirePracticeAccess(admin, user.id);

    const { data, error } = await admin
      .from("practice_sets")
      .select(
        "id, title, description, duration_minutes, position, practice_sections(practice_questions(count))",
      )
      .eq("product_id", PRACTICE_PRODUCT_ID)
      .eq("skill", "listening")
      .eq("status", "published")
      .order("position", { ascending: true });
    if (error) throw error;

    const rows = (data ?? []) as SetRow[];
    const setIds = rows.map((set) => set.id);
    const latestAttemptBySet = new Map<
      string,
      "in_progress" | "completed" | "abandoned"
    >();

    if (setIds.length) {
      const { data: attemptData, error: attemptError } = await admin
        .from("practice_attempts")
        .select("set_id, status, started_at")
        .eq("user_id", user.id)
        .in("set_id", setIds)
        .order("started_at", { ascending: false });
      if (attemptError) throw attemptError;
      for (const attempt of attemptData ?? []) {
        if (!latestAttemptBySet.has(attempt.set_id))
          latestAttemptBySet.set(attempt.set_id, attempt.status);
      }
    }

    const sets = rows.map((set) => ({
      id: set.id,
      title: set.title,
      description: set.description,
      durationMinutes: set.duration_minutes,
      questionCount: set.practice_sections.reduce(
        (total, section) => total + (section.practice_questions[0]?.count ?? 0),
        0,
      ),
      position: set.position,
      latestAttemptStatus: latestAttemptBySet.get(set.id),
    }));

    return NextResponse.json(
      { sets },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return userAuthErrorResponse(error);
  }
}
