import "server-only";

import { renderBrandedEmail } from "@/lib/branded-email";
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

interface PartnerApplicationReceiptOptions {
  fullName: string;
  email: string;
  requestedReferralCode: string;
}

interface PartnerAdminNotificationOptions {
  to: string;
  applicantLabel: string;
  fullName: string;
  email: string;
  applicationId: string;
  partnerTypeLabel: string;
  organisationName: string;
  phone: string;
  website: string;
  payoutLabel: string;
  requestedReferralCode: string;
  commissionRate: number;
  audienceDescription: string;
  reviewUrl: string;
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
    html: approved
      ? renderBrandedEmail({
          preview: `Your referral code ${application.requested_referral_code} is now active.`,
          eyebrow: "Application approved",
          heading: "Welcome to the Partner Programme",
          greeting: greetingName,
          paragraphs: ["Your application has been approved. You can now share your unique referral link with your audience."],
          details: [
            { label: "Referral code", value: application.requested_referral_code },
            { label: "Status", value: "Active" },
          ],
          callout: "Purchases completed through your referral link will be attributed to your partner account.",
          action: { label: "Open your referral link", href: referralLink },
        })
      : renderBrandedEmail({
          preview: "An update on your Cryptic Partner Programme application.",
          eyebrow: "Application update",
          heading: "Thank you for your interest",
          greeting: greetingName,
          paragraphs: [
            "We have reviewed your application and are unable to approve it at this time.",
            "Thank you for taking the time to apply to the Cryptic Partner Programme.",
          ],
          callout: reviewNote || undefined,
        }),
  });
}

export function sendPartnerApplicationReceipt({
  fullName,
  email,
  requestedReferralCode,
}: PartnerApplicationReceiptOptions) {
  return sendTransactionalEmail({
    to: email,
    subject: "We received your Cryptic Partner Programme application",
    text: [
      `Hello ${fullName},`,
      "",
      "Thank you for applying to the Cryptic Partner Programme.",
      `Your requested referral code is ${requestedReferralCode}. It will become active only after approval.`,
      "We will review your application and contact you with the next steps.",
      "",
      "Cryptic Solutions",
    ].join("\n"),
    html: renderBrandedEmail({
      preview: "We received your Cryptic Partner Programme application.",
      eyebrow: "Application received",
      heading: "Your application is with us",
      greeting: fullName,
      paragraphs: [
        "Thank you for applying to the Cryptic Partner Programme.",
        "Our team will review your application and contact you with the next steps.",
      ],
      details: [
        { label: "Requested referral code", value: requestedReferralCode },
        { label: "Current status", value: "Awaiting review" },
      ],
      callout: "Your referral code will become active only after your application has been approved.",
    }),
  });
}

export function sendPartnerAdminNotification(options: PartnerAdminNotificationOptions) {
  const {
    to,
    applicantLabel,
    fullName,
    email,
    applicationId,
    partnerTypeLabel,
    organisationName,
    phone,
    website,
    payoutLabel,
    requestedReferralCode,
    commissionRate,
    audienceDescription,
    reviewUrl,
  } = options;

  const lines = [
    `Application ID: ${applicationId}`,
    `Partner type: ${partnerTypeLabel}`,
    `Name: ${fullName}`,
    `Organisation, community, or academy: ${organisationName || "Not applicable"}`,
    `Email: ${email}`,
    `Phone or WhatsApp: ${phone}`,
    `Website or social page: ${website || "Not provided"}`,
    `Preferred payout: ${payoutLabel}`,
    `Requested code: ${requestedReferralCode}`,
    `Commission: ${commissionRate}%`,
    "",
    "Audience:",
    audienceDescription,
  ];

  return sendTransactionalEmail({
    to,
    subject: `New partner application from ${applicantLabel}`,
    text: lines.join("\n"),
    html: renderBrandedEmail({
      preview: `${applicantLabel} submitted a new partner application.`,
      eyebrow: "New partner application",
      heading: "A new application is ready for review",
      greeting: "Cryptic team",
      paragraphs: [`${applicantLabel} has applied to join the Cryptic Partner Programme.`],
      details: [
        { label: "Applicant", value: fullName },
        { label: "Partner type", value: partnerTypeLabel },
        { label: "Email", value: email },
        { label: "Phone or WhatsApp", value: phone },
        { label: "Requested code", value: requestedReferralCode },
        { label: "Preferred payout", value: payoutLabel },
        { label: "Audience", value: audienceDescription },
      ],
      action: { label: "Review application", href: reviewUrl },
      disclaimer: "Internal Cryptic Solutions notification.",
    }),
  });
}
