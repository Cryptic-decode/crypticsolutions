import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !anonKey || !serviceKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user?.email) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }
    if (!user.email_confirmed_at) {
      return NextResponse.json({ error: "Email must be confirmed" }, { status: 403 });
    }

    const email = user.email.trim().toLowerCase();
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: purchases, error } = await admin
      .from("purchases")
      .update({ user_id: user.id })
      .eq("email", email)
      .is("user_id", null)
      .eq("status", "completed")
      .select("id, transaction_id");

    if (error) throw error;
    return NextResponse.json({
      success: true,
      linked_count: purchases?.length || 0,
      purchases: purchases || [],
    });
  } catch (error: unknown) {
    console.error("Purchase linking error:", error);
    return NextResponse.json({ error: "Failed to link purchases" }, { status: 500 });
  }
}
