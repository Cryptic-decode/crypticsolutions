import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import {
  isValidReferralCode,
  normalizeReferralCode,
  PARTNER_COMMISSION_PERCENT,
  PARTNER_TYPES,
  partnerTypeLabels,
  PAYOUT_SCHEDULES,
  payoutScheduleLabels,
} from "@/lib/partner-program";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // A filled hidden field indicates an automated submission.
    if (text(body.middleName, 100)) {
      return NextResponse.json({ success: true }, { status: 201 });
    }

    const partnerType = text(body.partnerType, 20);
    const fullName = text(body.fullName, 100);
    const organisationName = text(body.organisationName, 120);
    const email = text(body.email, 160).toLowerCase();
    const phone = text(body.phone, 40);
    const website = text(body.website, 240);
    const audienceDescription = text(body.audienceDescription, 1_000);
    const payoutSchedule = text(body.payoutSchedule, 20);
    const requestedReferralCode = normalizeReferralCode(text(body.referralCode, 20));
    const acceptedTerms = body.acceptedTerms === true;

    if (!PARTNER_TYPES.includes(partnerType as (typeof PARTNER_TYPES)[number])) {
      return NextResponse.json({ error: "Choose a valid partner type." }, { status: 400 });
    }
    if (fullName.length < 2) {
      return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
    }
    const partnerTypeLabel = partnerTypeLabels[partnerType as keyof typeof partnerTypeLabels];
    if (partnerType !== "individual" && organisationName.length < 2) {
      return NextResponse.json(
        { error: `Enter your ${partnerTypeLabel.toLowerCase()} name.` },
        { status: 400 },
      );
    }
    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (phone.length < 7) {
      return NextResponse.json({ error: "Enter a valid phone or WhatsApp number." }, { status: 400 });
    }
    if (audienceDescription.length < 20) {
      return NextResponse.json({ error: "Tell us briefly how you reach IELTS candidates." }, { status: 400 });
    }
    if (!PAYOUT_SCHEDULES.includes(payoutSchedule as (typeof PAYOUT_SCHEDULES)[number])) {
      return NextResponse.json({ error: "Choose a valid payout schedule." }, { status: 400 });
    }
    if (!isValidReferralCode(requestedReferralCode)) {
      return NextResponse.json({ error: "Use 4 to 20 letters, numbers, or hyphens for your referral code." }, { status: 400 });
    }
    if (!acceptedTerms) {
      return NextResponse.json({ error: "Confirm that the information provided is accurate." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Partner applications are temporarily unavailable." }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: application, error } = await supabase
      .from("partner_applications")
      .insert({
        partner_type: partnerType,
        full_name: fullName,
        organisation_name: organisationName || null,
        email,
        phone,
        website: website || null,
        audience_description: audienceDescription,
        payout_schedule: payoutSchedule,
        requested_referral_code: requestedReferralCode,
        commission_rate: PARTNER_COMMISSION_PERCENT,
        accepted_terms: acceptedTerms,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "An application already uses this email address or referral code." },
          { status: 409 },
        );
      }
      console.error("Partner application insert error:", error);
      return NextResponse.json({ error: "We could not submit your application. Please try again." }, { status: 500 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const adminEmail = process.env.ADMIN_EMAIL || "info@crypticsolutionsltd.com";
      const from = process.env.RESEND_FROM_EMAIL || "Cryptic Solutions <onboarding@resend.dev>";
      const applicantLabel = organisationName || fullName;
      const payoutLabel = payoutScheduleLabels[payoutSchedule as keyof typeof payoutScheduleLabels];

      const notifications = [
        resend.emails.send({
          from,
          to: adminEmail,
          subject: `New partner application from ${applicantLabel}`,
          text: [
            `Application ID: ${application.id}`,
            `Partner type: ${partnerTypeLabel}`,
            `Name: ${fullName}`,
            `Organisation, community, or academy: ${organisationName || "Not applicable"}`,
            `Email: ${email}`,
            `Phone or WhatsApp: ${phone}`,
            `Website or social page: ${website || "Not provided"}`,
            `Preferred payout: ${payoutLabel}`,
            `Requested code: ${requestedReferralCode}`,
            `Commission: ${PARTNER_COMMISSION_PERCENT}%`,
            "",
            "Audience:",
            audienceDescription,
          ].join("\n"),
        }),
        resend.emails.send({
          from,
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
        }),
      ];

      const results = await Promise.allSettled(notifications);
      if (results.some((result) => result.status === "rejected")) {
        console.error("One or more partner application emails could not be sent.");
      }
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Partner application error:", error);
    return NextResponse.json({ error: "We could not submit your application. Please try again." }, { status: 500 });
  }
}
