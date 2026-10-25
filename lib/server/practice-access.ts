import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { PRACTICE_PRODUCT_ID } from "@/lib/practice";
import { UserAuthError } from "@/lib/server/user-auth";

export async function requirePracticeAccess(
  admin: SupabaseClient,
  userId: string,
  productId = PRACTICE_PRODUCT_ID,
) {
  const { data, error } = await admin
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .eq("status", "completed")
    .limit(1);

  if (error) throw error;
  if (!data?.length) {
    throw new UserAuthError("Purchase access is required for IELTS practice.", 403);
  }
}

export function normalizePracticeAnswer(value: string) {
  return value.trim().toLocaleLowerCase("en").replace(/\s+/g, " ");
}
