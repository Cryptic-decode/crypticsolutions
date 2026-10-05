"use client";

import { ArrowRight, RefreshCw, ShieldAlert, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { DashboardPageFrame, DashboardPageHeader, DashboardSectionHeader } from "@/components/dashboard/dashboard-page";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

interface AdminSummary {
  pending_applications: number;
  active_partners: number;
  tracked_sales: number;
  outstanding_commission: number;
}

const formatCurrency = (value: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

function AdminDashboardSkeleton() {
  return (
    <DashboardPageFrame aria-busy="true" aria-label="Loading admin dashboard">
      <div className="space-y-3 border-b border-border/70 pb-8">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-64 max-w-full" />
        <Skeleton className="h-5 w-[30rem] max-w-full" />
      </div>
      <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border/70 bg-border/70 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-24 rounded-none bg-card" />)}
      </div>
      <div className="mt-12 space-y-5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-52 w-full rounded-xl" />
      </div>
    </DashboardPageFrame>
  );
}

export function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      router.replace("/admin");
      return;
    }

    setError("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      router.replace("/admin");
      return;
    }

    try {
      const response = await fetch("/api/admin/partners", { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
      const result = await response.json().catch(() => ({}));
      if (response.status === 401) {
        router.replace("/admin");
        return;
      }
      if (!response.ok) throw new Error(result.error || "The admin dashboard could not be loaded.");
      setSummary(result.summary);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "The admin dashboard could not be loaded.");
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  return (
    <AdminShell>
      {!summary && !error ? (
        <AdminDashboardSkeleton />
      ) : (
        <DashboardPageFrame>
          <DashboardPageHeader
            eyebrow="Internal operations"
            title="Admin dashboard"
            description="Review activity and manage the operational tools available to your team."
            action={summary?.pending_applications ? <Button asChild><Link href="/admin/partners">Review applications <ArrowRight /></Link></Button> : undefined}
          />

          {error && (
            <div className="mt-8 rounded-xl border border-destructive/25 bg-destructive/5 p-6" role="alert">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <h2 className="mt-4 font-semibold">We could not load the admin dashboard</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">{error}</p>
              <Button variant="outline" className="mt-5" onClick={() => void loadSummary()}><RefreshCw /> Try again</Button>
            </div>
          )}

          {summary && (
            <>
              <section aria-label="Administration overview" className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border/70 bg-border/70 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Pending applications", summary.pending_applications, "awaiting review"],
                  ["Approved partners", summary.active_partners, "active referral codes"],
                  ["Referred purchases", summary.tracked_sales, "completed purchases"],
                  ["Calculated commission", formatCurrency(summary.outstanding_commission), "at the agreed rates"],
                ].map(([label, value, detail]) => (
                  <div key={label} className="bg-card px-5 py-5 sm:px-6">
                    <p className="text-xs font-medium text-muted-foreground">{label}</p>
                    <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                  </div>
                ))}
              </section>

              <section className="mt-12" aria-labelledby="admin-tools-title">
                <DashboardSectionHeader title="Admin tools" description="Only the operational modules currently in use appear here." />
                <article className="max-w-2xl rounded-xl border border-border/70 bg-card p-6 sm:p-7">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></span>
                  <h3 className="mt-6 text-xl font-semibold">Partner Programme</h3>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Review applications, activate referral codes, and monitor purchases attributed to approved partners.</p>
                  <Button asChild className="mt-6"><Link href="/admin/partners">Manage partners <ArrowRight /></Link></Button>
                </article>
              </section>
            </>
          )}
        </DashboardPageFrame>
      )}
    </AdminShell>
  );
}
