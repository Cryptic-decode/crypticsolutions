import "server-only";

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export class UserAuthError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

interface UserContext {
  supabase: SupabaseClient;
  user: User;
}

export async function authenticateUser(request: NextRequest): Promise<UserContext> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new UserAuthError("Account services are not configured.", 503);
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    throw new UserAuthError("Authentication required.", 401);
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new UserAuthError("Your session is invalid or has expired.", 401);
  }

  return { supabase, user };
}

export function userAuthErrorResponse(error: unknown) {
  if (error instanceof UserAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error("Authenticated user request failed:", error);
  return NextResponse.json(
    { error: "This part of your learning space is temporarily unavailable." },
    { status: 500 },
  );
}
