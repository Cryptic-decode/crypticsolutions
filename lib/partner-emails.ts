import "server-only";

import { sendTransactionalEmail } from "@/lib/email";

interface PartnerEmailApplication {
  full_name: string;
  organisation_name: string | null;
  email: string;
  requested_referral_code: string;
}

interface SendPartnerReviewEmailOptions {
  application: PartnerEmailApplication;
  action: "approve" | "reject";
  referralLink?: string;
  reviewNote?: string;
}

export function sendPartnerReviewEmail({
  application,
  action,
  referralLink = "",
  reviewNote = "",
}: SendPartnerReviewEmailOptions) {
  const greetingName = application.organisation_name || application.full_name;
  const approved = action === "approve";
  const lines = approved
    ? [
        `Hello ${greetingName},`,
        "",
        "Your Cryptic Partner Programme application has been approved.",
        `Your referral code is ${application.requested_referral_code}.`,
        `Share this link with your audience: ${referralLink}`,
        "Purchases completed through this link will be attributed to your partner account.",
      ]
    : [
        `Hello ${greetingName},`,
        "",
        "Thank you for your interest in the Cryptic Partner Programme.",
        "We are unable to approve your application at this time.",
        ...(reviewNote ? [reviewNote] : []),
      ];

  return sendTransactionalEmail({
    to: application.email,
    subject: approved
      ? "Your Cryptic Partner Programme application is approved"
      : "Update on your Cryptic Partner Programme application",
    text: [...lines, "", "Cryptic Solutions"].join("\n"),
  });
}
