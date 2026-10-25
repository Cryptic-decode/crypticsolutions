import "server-only";

import { NextResponse } from "next/server";

import { adminErrorResponse } from "@/lib/admin-auth";

const setupErrorCodes = new Set(["42P01", "42703", "PGRST204", "PGRST205"]);

export function practiceAdminErrorResponse(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "";

  if (setupErrorCodes.has(code)) {
    return NextResponse.json(
      {
        error:
          "Practice setup is incomplete. Run the practice SQL files in Supabase, then try again.",
      },
      { status: 503 },
    );
  }

  return adminErrorResponse(error);
}
