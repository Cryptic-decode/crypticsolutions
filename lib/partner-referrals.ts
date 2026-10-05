import "server-only";

import { createClient } from "@supabase/supabase-js";

import { isValidReferralCode, normalizeReferralCode } from "@/lib/partner-program";

export class InvalidReferralCodeError extends Error {}

export async function getActiveReferralCode(value: string) {
  const referralCode = normalizeReferralCode(value);
  if (!isValidReferralCode(referralCode)) {
    throw new InvalidReferralCodeError("Enter a valid referral code.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Referral validation is not configured.");
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: application, error } = await admin
    .from("partner_applications")
    .select("requested_referral_code")
    .eq("requested_referral_code", referralCode)
    .eq("status", "approved")
    .maybeSingle();

  if (error) throw error;
  if (!application) {
    throw new InvalidReferralCodeError("This referral code is not active. Check the code and try again.");
  }

  return application.requested_referral_code as string;
}
