import { NextRequest, NextResponse } from "next/server";

import { authenticateAdmin } from "@/lib/admin-auth";
import { PRACTICE_PRODUCT_ID } from "@/lib/practice";
import { practiceAdminErrorResponse } from "@/lib/server/practice-admin-errors";

interface SetRow {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published" | "archived";
  duration_minutes: number | null;
  position: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  practice_sections: { practice_questions: { count: number }[] }[];
  practice_attempts: { count: number }[];
}

export async function GET(request: NextRequest) {
  try {
    const { admin } = await authenticateAdmin(request);
    const { data, error } = await admin
      .from("practice_sets")
      .select(
        "id, title, description, status, duration_minutes, position, created_at, updated_at, published_at, practice_sections(practice_questions(count)), practice_attempts(count)",
      )
      .eq("product_id", PRACTICE_PRODUCT_ID)
      .eq("skill", "reading")
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;

    const sets = ((data ?? []) as SetRow[]).map((set) => ({
      id: set.id,
      title: set.title,
      description: set.description,
      status: set.status,
      durationMinutes: set.duration_minutes,
      questionCount: set.practice_sections.reduce(
        (total, section) => total + (section.practice_questions[0]?.count ?? 0),
        0,
      ),
      attemptCount: set.practice_attempts[0]?.count ?? 0,
      createdAt: set.created_at,
      updatedAt: set.updated_at,
      publishedAt: set.published_at,
    }));

    return NextResponse.json(
      { sets },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return practiceAdminErrorResponse(error);
  }
}
