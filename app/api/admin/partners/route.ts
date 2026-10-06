import { NextRequest, NextResponse } from "next/server";

import { adminErrorResponse, authenticateAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const { admin } = await authenticateAdmin(request);

    const [applicationsResult, purchasesResult] = await Promise.all([
      admin
        .from("partner_applications")
        .select("id, partner_type, full_name, organisation_name, email, phone, website, audience_description, payout_schedule, requested_referral_code, commission_rate, status, created_at, reviewed_at, reviewed_by, review_note")
        .order("created_at", { ascending: false })
        .limit(100),
      admin
        .from("purchases")
        .select("id, transaction_id, product_id, referral_code, amount, currency, created_at")
        .eq("status", "completed")
        .not("referral_code", "is", null)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    const queryError = applicationsResult.error || purchasesResult.error;
    if (queryError) throw queryError;

    const applications = applicationsResult.data || [];
    const approvedApplications = applications.filter((application) => application.status === "approved");
    const approvedByCode = new Map(
      approvedApplications.map((application) => [application.requested_referral_code.toUpperCase(), application]),
    );

    const commissions = (purchasesResult.data || []).flatMap((purchase) => {
      const referralCode = purchase.referral_code?.trim().toUpperCase();
      const partner = referralCode ? approvedByCode.get(referralCode) : undefined;
      if (!partner) return [];

      const commissionAmount = Number(purchase.amount) * (Number(partner.commission_rate) / 100);
      return [{
        id: purchase.id,
        partner_name: partner.organisation_name || partner.full_name,
        transaction_id: purchase.transaction_id,
        product_id: purchase.product_id,
        referral_code: referralCode,
        gross_amount: Number(purchase.amount),
        commission_rate: Number(partner.commission_rate),
        commission_amount: commissionAmount,
        currency: purchase.currency,
        status: "calculated" as const,
        created_at: purchase.created_at,
        paid_at: null,
      }];
    });

    const commissionByCode = new Map<string, { sales: number; pending: number; paid: number }>();
    for (const commission of commissions) {
      const current = commissionByCode.get(commission.referral_code) || { sales: 0, pending: 0, paid: 0 };
      current.sales += 1;
      current.pending += commission.commission_amount;
      commissionByCode.set(commission.referral_code, current);
    }

    const partners = approvedApplications.map((application) => ({
      id: application.id,
      partner_type: application.partner_type,
      full_name: application.full_name,
      organisation_name: application.organisation_name,
      email: application.email,
      phone: application.phone,
      website: application.website,
      payout_schedule: application.payout_schedule,
      referral_code: application.requested_referral_code,
      commission_rate: Number(application.commission_rate),
      status: "active" as const,
      approved_at: application.reviewed_at || application.created_at,
      approved_by: application.reviewed_by || "Administrator",
      metrics: commissionByCode.get(application.requested_referral_code.toUpperCase()) || { sales: 0, pending: 0, paid: 0 },
    }));

    return NextResponse.json({
      applications,
      partners,
      commissions,
      summary: {
        pending_applications: applications.filter((application) => application.status === "pending").length,
        active_partners: partners.length,
        tracked_sales: commissions.length,
        outstanding_commission: commissions.reduce((total, commission) => total + commission.commission_amount, 0),
      },
    });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
