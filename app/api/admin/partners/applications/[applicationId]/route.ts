import { NextRequest, NextResponse } from "next/server";

import { adminErrorResponse, authenticateAdmin } from "@/lib/admin-auth";
import { sendPartnerReviewEmail } from "@/lib/partner-emails";
import { buildPartnerReferralUrl } from "@/lib/partner-program";
import { getServerAppUrl } from "@/lib/server-url";

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
          getServerAppUrl(),
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

    const email = await sendPartnerReviewEmail({
      application,
      action,
      referralLink,
      reviewNote,
    });

    return NextResponse.json({ success: true, status, email });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  try {
    const { admin } = await authenticateAdmin(request);
    const { applicationId } = await params;

    const { data: application, error: applicationError } = await admin
      .from("partner_applications")
      .select("id, full_name, organisation_name, email, requested_referral_code, status")
      .eq("id", applicationId)
      .single();

    if (applicationError || !application) {
      return NextResponse.json({ error: "Partner not found." }, { status: 404 });
    }
    if (application.status !== "approved") {
      return NextResponse.json(
        { error: "Approval emails can only be resent to approved partners." },
        { status: 409 },
      );
    }

    const referralLink = buildPartnerReferralUrl(
      application.requested_referral_code,
      getServerAppUrl(),
    );
    const email = await sendPartnerReviewEmail({
      application,
      action: "approve",
      referralLink,
    });

    if (!email.sent) {
      return NextResponse.json(
        { error: email.error || "The approval email could not be sent." },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, email });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  try {
    const { admin } = await authenticateAdmin(request);
    const { applicationId } = await params;

    const { data: application, error: applicationError } = await admin
      .from("partner_applications")
      .select("id, requested_referral_code, status")
      .eq("id", applicationId)
      .single();

    if (applicationError || !application) {
      return NextResponse.json({ error: "Partner not found." }, { status: 404 });
    }
    if (application.status !== "approved") {
      return NextResponse.json(
        { error: "Only approved partners can be deleted from the Partners tab." },
        { status: 409 },
      );
    }

    const { count: referredPurchaseCount, error: purchaseError } = await admin
      .from("purchases")
      .select("id", { count: "exact", head: true })
      .ilike("referral_code", application.requested_referral_code);

    if (purchaseError) throw purchaseError;
    if ((referredPurchaseCount || 0) > 0) {
      return NextResponse.json(
        { error: "This partner has recorded purchases and cannot be deleted because the financial history must be preserved." },
        { status: 409 },
      );
    }

    const { data: deletedApplication, error: deleteError } = await admin
      .from("partner_applications")
      .delete()
      .eq("id", applicationId)
      .select("id")
      .maybeSingle();

    if (deleteError) throw deleteError;
    if (!deletedApplication) {
      return NextResponse.json({ error: "Partner not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
