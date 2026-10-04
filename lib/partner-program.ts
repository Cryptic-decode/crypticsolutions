export const PARTNER_COMMISSION_PERCENT = 20;
export const IELTS_MANUAL_PRICE = 5_000;
export const PARTNER_COMMISSION_AMOUNT =
  (IELTS_MANUAL_PRICE * PARTNER_COMMISSION_PERCENT) / 100;

export const PARTNER_TYPES = ["individual", "organisation", "community", "academy"] as const;
export type PartnerType = (typeof PARTNER_TYPES)[number];

export const partnerTypeLabels: Record<PartnerType, string> = {
  individual: "Individual",
  organisation: "Organisation",
  community: "Community",
  academy: "Academy",
};

export const PAYOUT_SCHEDULES = ["biweekly", "monthly"] as const;
export type PayoutSchedule = (typeof PAYOUT_SCHEDULES)[number];

export const payoutScheduleLabels: Record<PayoutSchedule, string> = {
  biweekly: "Bi-weekly",
  monthly: "Monthly",
};

export function normalizeReferralCode(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20);
}

export function createReferralCodeSuggestions(value: string) {
  const base = normalizeReferralCode(value).replace(/-/g, "").slice(0, 14);
  if (base.length < 3) return [];

  return Array.from(
    new Set([
      base,
      `${base.slice(0, 15)}IELTS`,
      `${base.slice(0, 15)}LEARN`,
    ].map((code) => code.slice(0, 20))),
  );
}

export function isValidReferralCode(value: string) {
  return /^[A-Z0-9](?:[A-Z0-9-]{2,18})[A-Z0-9]$/.test(value);
}
