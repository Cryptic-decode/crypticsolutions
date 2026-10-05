"use client";

import {
  BadgeDollarSign,
  Check,
  CircleDollarSign,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldAlert,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { partnerTypeLabels, payoutScheduleLabels, PartnerType, PayoutSchedule } from "@/lib/partner-program";
import { supabase } from "@/lib/supabase";
import { showError, showSuccess } from "@/lib/utils";

type ApplicationStatus = "pending" | "approved" | "rejected";
type PartnerStatus = "active" | "inactive";
type CommissionStatus = "calculated";
type AdminTab = "applications" | "partners" | "commissions";

interface PartnerApplication {
  id: string;
  partner_type: PartnerType;
  full_name: string;
  organisation_name: string | null;
  email: string;
  phone: string;
  website: string | null;
  audience_description: string;
  payout_schedule: PayoutSchedule;
  requested_referral_code: string;
  commission_rate: number;
  status: ApplicationStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_note: string | null;
}

interface Partner {
  id: string;
  partner_type: PartnerType;
  full_name: string;
  organisation_name: string | null;
  email: string;
  phone: string;
  website: string | null;
  payout_schedule: PayoutSchedule;
  referral_code: string;
  commission_rate: number;
  status: PartnerStatus;
  approved_at: string;
  approved_by: string;
  metrics: { sales: number; pending: number; paid: number };
}

interface Commission {
  id: string;
  partner_name: string;
  transaction_id: string;
  product_id: string;
  referral_code: string;
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  currency: string;
  status: CommissionStatus;
  created_at: string;
  paid_at: string | null;
}

interface AdminData {
  applications: PartnerApplication[];
  partners: Partner[];
  commissions: Commission[];
  summary: {
    pending_applications: number;
    active_partners: number;
    tracked_sales: number;
    outstanding_commission: number;
  };
}

interface ReviewTarget {
  application: PartnerApplication;
  action: "approve" | "reject";
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(value));

const formatCurrency = (value: number, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

const statusStyles = {
  pending: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  calculated: "border-primary/25 bg-primary/10 text-primary",
  approved: "border-primary/25 bg-primary/10 text-primary",
  active: "border-primary/25 bg-primary/10 text-primary",
  paid: "border-primary/25 bg-primary/10 text-primary",
  rejected: "border-destructive/25 bg-destructive/10 text-destructive",
  inactive: "border-border bg-muted text-muted-foreground",
  reversed: "border-destructive/25 bg-destructive/10 text-destructive",
} as const;

function StatusBadge({ status }: { status: keyof typeof statusStyles }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[status]}`}>
      {status}
    </span>
  );
}

function AdminLoading() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <Skeleton className="h-9 w-72" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <SkeletonCard key={item} />)}
      </div>
      <Skeleton className="mt-10 h-12 w-full" />
      <div className="mt-5 space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export function PartnerAdminPortal() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<AdminData | null>(null);
  const [pageState, setPageState] = useState<"loading" | "ready" | "forbidden" | "error">("loading");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("applications");
  const [applicationFilter, setApplicationFilter] = useState<ApplicationStatus | "all">("pending");
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const loadData = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      router.replace("/admin");
      return;
    }

    setPageState("loading");
    setError("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      router.replace("/admin");
      return;
    }

    try {
      const response = await fetch("/api/admin/partners", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));
      if (response.status === 401) {
        router.replace("/admin");
        return;
      }
      if (!response.ok) {
        setPageState(response.status === 403 ? "forbidden" : "error");
        setError(result.error || "Partner administration could not be loaded.");
        return;
      }

      setData(result as AdminData);
      setPageState("ready");
    } catch {
      setError("Partner administration could not be loaded. Check your connection and try again.");
      setPageState("error");
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredApplications = useMemo(() => {
    if (!data) return [];
    return applicationFilter === "all"
      ? data.applications
      : data.applications.filter((application) => application.status === applicationFilter);
  }, [applicationFilter, data]);

  const submitReview = async () => {
    if (!reviewTarget) return;
    setReviewing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Your session has expired. Please sign in again.");

      const response = await fetch(`/api/admin/partners/applications/${reviewTarget.application.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: reviewTarget.action, reviewNote }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "The application could not be reviewed.");

      showSuccess(reviewTarget.action === "approve" ? "Partner approved and referral code activated." : "Application rejected.");
      setReviewTarget(null);
      setReviewNote("");
      await loadData();
    } catch (reviewError) {
      showError(reviewError);
    } finally {
      setReviewing(false);
    }
  };

  const closeReview = () => {
    if (reviewing) return;
    setReviewTarget(null);
    setReviewNote("");
  };

  return (
    <AdminShell>

      {pageState === "loading" && <AdminLoading />}

      {(pageState === "forbidden" || pageState === "error") && (
        <main className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-xl items-center px-5 py-16 text-center">
          <div className="w-full rounded-2xl border border-border/70 bg-card p-8 sm:p-10">
            <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
              {pageState === "forbidden" ? "Access restricted" : "Unable to load administration"}
            </h1>
            <p className="mt-3 leading-7 text-muted-foreground">{error}</p>
            {pageState === "error" && <Button className="mt-7" onClick={() => void loadData()}><RefreshCw /> Try again</Button>}
          </div>
        </main>
      )}

      {pageState === "ready" && data && (
        <main className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Cryptic Partner Programme</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Partner administration</h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">Review applications, monitor approved partners, and calculate commissions from completed referred purchases.</p>
            </div>
            <Button variant="outline" onClick={() => void loadData()}><RefreshCw /> Refresh</Button>
          </div>

          <section aria-label="Partner programme summary" className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Pending applications", value: data.summary.pending_applications, icon: Users },
              { label: "Active partners", value: data.summary.active_partners, icon: UserCheck },
              { label: "Tracked sales", value: data.summary.tracked_sales, icon: CircleDollarSign },
              { label: "Calculated commission", value: formatCurrency(data.summary.outstanding_commission), icon: BadgeDollarSign },
            ].map(({ label, value, icon: Icon }) => (
              <article key={label} className="rounded-xl border border-border/70 bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"><Icon className="h-4 w-4 text-primary" /></span>
                </div>
                <p className="mt-5 text-3xl font-semibold tabular-nums tracking-[-0.04em]">{value}</p>
              </article>
            ))}
          </section>

          <nav aria-label="Partner administration sections" className="mt-10 flex gap-1 overflow-x-auto border-b border-border/70">
            {([
              ["applications", `Applications (${data.applications.length})`],
              ["partners", `Partners (${data.partners.length})`],
              ["commissions", `Commissions (${data.commissions.length})`],
            ] as Array<[AdminTab, string]>).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                aria-current={activeTab === tab ? "page" : undefined}
                className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {label}
              </button>
            ))}
          </nav>

          {activeTab === "applications" && (
            <section className="py-7">
              <div className="flex flex-wrap gap-2" aria-label="Filter applications">
                {(["pending", "all", "approved", "rejected"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setApplicationFilter(filter)}
                    aria-pressed={applicationFilter === filter}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${applicationFilter === filter ? "border-primary bg-primary/10 text-primary" : "border-border/70 text-muted-foreground hover:text-foreground"}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {filteredApplications.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-border p-10 text-center">
                  <Check className="mx-auto h-8 w-8 text-primary" />
                  <h2 className="mt-4 text-xl font-semibold">No {applicationFilter === "all" ? "" : applicationFilter} applications</h2>
                  <p className="mt-2 text-sm text-muted-foreground">New applications will appear here when they are submitted.</p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {filteredApplications.map((application) => (
                    <article key={application.id} className="rounded-xl border border-border/70 bg-card p-5 sm:p-6">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-xl font-semibold">{application.organisation_name || application.full_name}</h2>
                            <StatusBadge status={application.status} />
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{application.full_name} · {partnerTypeLabels[application.partner_type]} · Applied {formatDate(application.created_at)}</p>
                          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">{application.audience_description}</p>
                          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
                            <div><dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Email</dt><dd className="mt-1 break-all font-medium">{application.email}</dd></div>
                            <div><dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Phone</dt><dd className="mt-1 font-medium">{application.phone}</dd></div>
                            <div><dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Referral code</dt><dd className="mt-1 font-mono font-semibold text-primary">{application.requested_referral_code}</dd></div>
                            <div><dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Payout</dt><dd className="mt-1 font-medium">{payoutScheduleLabels[application.payout_schedule]}</dd></div>
                          </dl>
                          {application.website && <a href={application.website} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm text-primary hover:underline">Open website or social page <ExternalLink className="h-3.5 w-3.5" /></a>}
                          {application.review_note && <p className="mt-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">Review note: {application.review_note}</p>}
                        </div>
                        {application.status === "pending" && (
                          <div className="flex shrink-0 gap-2">
                            <Button variant="outline" onClick={() => setReviewTarget({ application, action: "reject" })}><X /> Reject</Button>
                            <Button onClick={() => setReviewTarget({ application, action: "approve" })}><Check /> Approve</Button>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "partners" && (
            <section className="py-7">
              {data.partners.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-10 text-center"><Users className="mx-auto h-8 w-8 text-primary" /><h2 className="mt-4 text-xl font-semibold">No approved partners yet</h2><p className="mt-2 text-sm text-muted-foreground">Approved applications will appear here.</p></div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {data.partners.map((partner) => (
                    <article key={partner.id} className="rounded-xl border border-border/70 bg-card p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div><h2 className="text-xl font-semibold">{partner.organisation_name || partner.full_name}</h2><p className="mt-1 text-sm text-muted-foreground">{partnerTypeLabels[partner.partner_type]} · Approved {formatDate(partner.approved_at)}</p></div>
                        <StatusBadge status={partner.status} />
                      </div>
                      <div className="mt-5 rounded-lg border border-border/70 bg-background p-4">
                        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Active referral code</p>
                        <p className="mt-2 font-mono text-lg font-semibold text-primary">{partner.referral_code}</p>
                      </div>
                      <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
                        <div><dt className="text-xs text-muted-foreground">Sales</dt><dd className="mt-1 text-xl font-semibold">{partner.metrics.sales}</dd></div>
                        <div><dt className="text-xs text-muted-foreground">Commission</dt><dd className="mt-1 text-xl font-semibold">{formatCurrency(partner.metrics.pending)}</dd></div>
                        <div><dt className="text-xs text-muted-foreground">Rate</dt><dd className="mt-1 text-xl font-semibold">{Number(partner.commission_rate)}%</dd></div>
                      </dl>
                      <div className="mt-5 border-t border-border/70 pt-4 text-sm text-muted-foreground"><p>{partner.email}</p><p className="mt-1">{payoutScheduleLabels[partner.payout_schedule]} payouts · {Number(partner.commission_rate)}% commission</p></div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "commissions" && (
            <section className="py-7">
              {data.commissions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-10 text-center"><CircleDollarSign className="mx-auto h-8 w-8 text-primary" /><h2 className="mt-4 text-xl font-semibold">No referral commissions yet</h2><p className="mt-2 text-sm text-muted-foreground">Verified purchases using active referral codes will appear here automatically.</p></div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border/70">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-muted/60 text-xs uppercase tracking-[0.1em] text-muted-foreground"><tr><th className="px-5 py-4">Partner</th><th className="px-5 py-4">Transaction</th><th className="px-5 py-4">Sale</th><th className="px-5 py-4">Commission</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Date</th></tr></thead>
                      <tbody className="divide-y divide-border/70 bg-card">
                        {data.commissions.map((commission) => (
                          <tr key={commission.id}><td className="px-5 py-4"><p className="font-medium">{commission.partner_name}</p><p className="mt-1 font-mono text-xs text-primary">{commission.referral_code}</p></td><td className="max-w-[12rem] truncate px-5 py-4 font-mono text-xs text-muted-foreground">{commission.transaction_id}</td><td className="px-5 py-4 tabular-nums">{formatCurrency(Number(commission.gross_amount), commission.currency)}</td><td className="px-5 py-4 font-semibold tabular-nums">{formatCurrency(Number(commission.commission_amount), commission.currency)}</td><td className="px-5 py-4"><StatusBadge status={commission.status} /></td><td className="px-5 py-4 text-muted-foreground">{formatDate(commission.created_at)}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
      )}

      <Modal
        isOpen={Boolean(reviewTarget)}
        onClose={closeReview}
        title={reviewTarget?.action === "approve" ? "Approve partner" : "Reject application"}
      >
        {reviewTarget && (
          <div>
            <p className="leading-7 text-muted-foreground">
              {reviewTarget.action === "approve"
                ? `This will activate ${reviewTarget.application.requested_referral_code} for ${reviewTarget.application.organisation_name || reviewTarget.application.full_name}.`
                : `This will reject the application from ${reviewTarget.application.organisation_name || reviewTarget.application.full_name}.`}
            </p>
            {reviewTarget.action === "reject" && (
              <div className="mt-5">
                <label htmlFor="reviewNote" className="text-sm font-medium">Reason <span className="text-muted-foreground">(optional)</span></label>
                <textarea id="reviewNote" value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} maxLength={500} rows={4} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Add a short, helpful explanation." />
              </div>
            )}
            <div className="mt-7 flex justify-end gap-3">
              <Button variant="outline" onClick={closeReview} disabled={reviewing}>Cancel</Button>
              <Button variant={reviewTarget.action === "reject" ? "destructive" : "default"} onClick={() => void submitReview()} disabled={reviewing}>
                {reviewing && <Loader2 className="animate-spin" />}
                {reviewing ? "Saving" : reviewTarget.action === "approve" ? "Approve partner" : "Reject application"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminShell>
  );
}
