import { NextRequest, NextResponse } from "next/server";

import { PRACTICE_PRODUCT_ID } from "@/lib/practice";
import { requirePracticeAccess } from "@/lib/server/practice-access";
import {
  authenticateUser,
  createServiceSupabaseClient,
  userAuthErrorResponse,
} from "@/lib/server/user-auth";

const SIGNED_AUDIO_SECONDS = 60 * 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string }> },
) {
  try {
    const { user } = await authenticateUser(request);
    const admin = createServiceSupabaseClient();
    await requirePracticeAccess(admin, user.id);
    const { setId } = await params;

    const { data: set, error } = await admin
      .from("practice_sets")
      .select("id, practice_sections!inner(media_url)")
      .eq("id", setId)
      .eq("product_id", PRACTICE_PRODUCT_ID)
      .eq("skill", "listening")
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    const mediaPath = set?.practice_sections?.[0]?.media_url;
    if (!mediaPath)
      return NextResponse.json(
        { error: "Listening audio not found." },
        { status: 404 },
      );

    const { data: signed, error: signedError } = await admin.storage
      .from("practice-audio")
      .createSignedUrl(mediaPath, SIGNED_AUDIO_SECONDS);
    if (signedError || !signed?.signedUrl)
      throw (
        signedError || new Error("The listening audio could not be opened.")
      );

    return NextResponse.json(
      { url: signed.signedUrl, expiresIn: SIGNED_AUDIO_SECONDS },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return userAuthErrorResponse(error);
  }
}
