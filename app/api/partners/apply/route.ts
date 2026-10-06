import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { sendPartnerAdminNotification, sendPartnerApplicationReceipt } from "@/lib/partner-emails";
import {
  isValidReferralCode,
  normalizeReferralCode,
  PARTNER_AUDIENCE_DESCRIPTION_MAX_LENGTH,
  PARTNER_AUDIENCE_DESCRIPTION_MIN_LENGTH,
  PARTNER_COMMISSION_PERCENT,
  PARTNER_TYPES,
  partnerTypeLabels,
  PAYOUT_SCHEDULES,
  payoutScheduleLabels,
} from "@/lib/partner-program";
import { getServerAppUrl } from "@/lib/server-url";

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
    const audienceDescription = text(
      body.audienceDescription,
      PARTNER_AUDIENCE_DESCRIPTION_MAX_LENGTH,
    );
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
    if (audienceDescription.length < PARTNER_AUDIENCE_DESCRIPTION_MIN_LENGTH) {
      return NextResponse.json(
        { error: `Enter at least ${PARTNER_AUDIENCE_DESCRIPTION_MIN_LENGTH} characters describing how you reach IELTS candidates.` },
        { status: 400 },
      );
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

    const adminEmail = process.env.ADMIN_EMAIL || "info@crypticsolutionsltd.com";
    const applicantLabel = organisationName || fullName;
    const payoutLabel = payoutScheduleLabels[payoutSchedule as keyof typeof payoutScheduleLabels];

    const notifications = [
      sendPartnerAdminNotification({
        to: adminEmail,
        applicantLabel,
        fullName,
        email,
        applicationId: application.id,
        partnerTypeLabel,
        organisationName,
        phone,
        website,
        payoutLabel,
        requestedReferralCode,
        commissionRate: PARTNER_COMMISSION_PERCENT,
        audienceDescription,
        reviewUrl: `${getServerAppUrl()}/admin/partners`,
      }),
      sendPartnerApplicationReceipt({
        fullName,
        email,
        requestedReferralCode,
      }),
    ];

    const results = await Promise.all(notifications);
    for (const result of results) {
      if (!result.sent) {
        console.error("Partner application email could not be sent:", result.error);
      }
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Partner application error:", error);
    return NextResponse.json({ error: "We could not submit your application. Please try again." }, { status: 500 });
  }
}
