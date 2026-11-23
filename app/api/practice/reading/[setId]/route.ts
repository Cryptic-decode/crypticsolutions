import { NextRequest, NextResponse } from "next/server";

import { PRACTICE_PRODUCT_ID } from "@/lib/practice";
import { requirePracticeAccess } from "@/lib/server/practice-access";
import { getReadingSetDetail } from "@/lib/server/reading-practice";
import { authenticateUser, createServiceSupabaseClient, userAuthErrorResponse } from "@/lib/server/user-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string }> },
) {
  try {
    const { user } = await authenticateUser(request);
    const admin = createServiceSupabaseClient();
    await requirePracticeAccess(admin, user.id);
    const { setId } = await params;
    const set = await getReadingSetDetail(admin, setId, user.id);

    if (!set) return NextResponse.json({ error: "Reading practice set not found." }, { status: 404 });
    return NextResponse.json({ set }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return userAuthErrorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string }> },
) {
  try {
    const { user } = await authenticateUser(request);
    const admin = createServiceSupabaseClient();
    await requirePracticeAccess(admin, user.id);
    const { setId } = await params;

    const { data: set, error: setError } = await admin
      .from("practice_sets")
      .select("id")
      .eq("id", setId)
      .eq("product_id", PRACTICE_PRODUCT_ID)
      .eq("skill", "reading")
      .eq("status", "published")
      .maybeSingle();
    if (setError) throw setError;
    if (!set) return NextResponse.json({ error: "Reading practice set not found." }, { status: 404 });

    const { data: existing, error: existingError } = await admin
      .from("practice_attempts")
      .select("id")
      .eq("user_id", user.id)
      .eq("set_id", setId)
      .eq("status", "in_progress")
      .maybeSingle();
    if (existingError) throw existingError;

    if (existing) return NextResponse.json({ attemptId: existing.id, resumed: true });

    const { data: attempt, error: attemptError } = await admin
      .from("practice_attempts")
      .insert({
        user_id: user.id,
        set_id: setId,
        product_id: PRACTICE_PRODUCT_ID,
        status: "in_progress",
      })
      .select("id")
      .single();
    if (attemptError?.code === "23505") {
      const { data: concurrentAttempt, error: concurrentError } = await admin
        .from("practice_attempts")
        .select("id")
        .eq("user_id", user.id)
        .eq("set_id", setId)
        .eq("status", "in_progress")
        .single();
      if (concurrentError) throw concurrentError;
      return NextResponse.json({ attemptId: concurrentAttempt.id, resumed: true });
    }
    if (attemptError || !attempt) throw attemptError || new Error("The practice attempt could not be started.");
    return NextResponse.json({ attemptId: attempt.id, resumed: false }, { status: 201 });
  } catch (error) {
    return userAuthErrorResponse(error);
  }
}
