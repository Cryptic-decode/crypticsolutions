import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import { adminErrorResponse, authenticateAdmin } from "@/lib/admin-auth";
import { buildPartnerReferralUrl } from "@/lib/partner-program";

interface ActionBody {
  action?: unknown;
  reviewNote?: unknown;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  try {
    const { admin, user } = await authenticateAdmin(request);
    const { applicationId } = await params;
    const body = await request.json() as ActionBody;
    const action = body.action === "approve" || body.action === "reject" ? body.action : null;
    const reviewNote = typeof body.reviewNote === "string" ? body.reviewNote.trim().slice(0, 500) : "";

    if (!applicationId || !action) {
      return NextResponse.json({ error: "A valid review action is required." }, { status: 400 });
    }

    const { data: application, error: applicationError } = await admin
      .from("partner_applications")
      .select("id, full_name, organisation_name, email, requested_referral_code, status")
      .eq("id", applicationId)
      .single();

    if (applicationError || !application) {
      return NextResponse.json({ error: "Partner application not found." }, { status: 404 });
    }
    if (application.status !== "pending") {
      return NextResponse.json({ error: "This application has already been reviewed." }, { status: 409 });
    }

    const status = action === "approve" ? "approved" : "rejected";
    const referralLink = action === "approve"
      ? buildPartnerReferralUrl(
          application.requested_referral_code,
          process.env.NEXT_PUBLIC_APP_URL || "https://www.crypticsolutionsltd.com",
        )
      : "";
    const { data: reviewedApplication, error: reviewError } = await admin
      .from("partner_applications")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.email?.trim().toLowerCase() || user.id,
        review_note: action === "reject" ? reviewNote || null : null,
      })
      .eq("id", applicationId)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

    if (reviewError) throw reviewError;
    if (!reviewedApplication) {
      return NextResponse.json({ error: "This application has already been reviewed." }, { status: 409 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const from = process.env.RESEND_FROM_EMAIL || "Cryptic Solutions <onboarding@resend.dev>";
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

      const result = await resend.emails.send({
        from,
        to: application.email,
        subject: approved
          ? "Your Cryptic Partner Programme application is approved"
          : "Update on your Cryptic Partner Programme application",
        text: [...lines, "", "Cryptic Solutions"].join("\n"),
      });
      if (result.error) console.error("Partner review email error:", result.error);
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
