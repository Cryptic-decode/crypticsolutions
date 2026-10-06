import "server-only";

import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export class AdminAuthError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

interface AdminContext {
  admin: SupabaseClient;
  user: User;
}

export async function authenticateAdmin(request: NextRequest): Promise<AdminContext> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    throw new AdminAuthError("Admin services are not configured.", 503);
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    throw new AdminAuthError("Authentication required.", 401);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error } = await authClient.auth.getUser(token);

  if (error || !user?.email) {
    throw new AdminAuthError("Your session is invalid or has expired.", 401);
  }
  if (!user.email_confirmed_at) {
    throw new AdminAuthError("Confirm your email before accessing administration.", 403);
  }
  if (user.app_metadata?.role !== "admin") {
    throw new AdminAuthError("You do not have access to administration.", 403);
  }

  return {
    admin: createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
    user,
  };
}

export function adminErrorResponse(error: unknown) {
  if (error instanceof AdminAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error("Administration error:", error);
  return NextResponse.json(
    { error: "Administration is temporarily unavailable." },
    { status: 500 },
  );
}
