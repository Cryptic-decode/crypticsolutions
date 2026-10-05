"use client";

import { ArrowRight, CircleDollarSign, ShieldAlert, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

interface AdminSummary {
  pending_applications: number;
  active_partners: number;
  tracked_sales: number;
  outstanding_commission: number;
}

const formatCurrency = (value: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      router.replace("/admin");
      return;
    }

    const response = await fetch("/api/admin/partners", { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
    const result = await response.json().catch(() => ({}));
    if (response.status === 401) {
      router.replace("/admin");
      return;
    }
    if (!response.ok) {
      setError(result.error || "The admin dashboard could not be loaded.");
      return;
    }
    setSummary(result.summary);
  }, [authLoading, router, user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load protected dashboard data when auth becomes available
    void loadSummary();
  }, [loadSummary]);

  return (
    <AdminShell>
      <main className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Administration</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Dashboard</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Manage Cryptic Solutions internal operations from one place.</p>

        {error && <div className="mt-8 rounded-xl border border-destructive/25 bg-destructive/5 p-5" role="alert"><div className="flex items-start gap-3"><ShieldAlert className="mt-0.5 h-5 w-5 text-destructive" /><div><p className="font-medium">Unable to load dashboard</p><p className="mt-1 text-sm text-muted-foreground">{error}</p><Button variant="outline" size="sm" className="mt-4" onClick={() => void loadSummary()}>Try again</Button></div></div></div>}

        {!summary && !error && <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Loading dashboard"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>}

        {summary && (
          <>
            <section aria-label="Administration summary" className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Pending applications", summary.pending_applications],
                ["Approved partners", summary.active_partners],
                ["Referred purchases", summary.tracked_sales],
                ["Calculated commission", formatCurrency(summary.outstanding_commission)],
              ].map(([label, value]) => <article key={label} className="rounded-xl border border-border/70 bg-card p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-5 text-3xl font-semibold tabular-nums tracking-[-0.04em]">{value}</p></article>)}
            </section>

            <section className="mt-12">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">Admin tools</h2>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <article className="rounded-xl border border-border/70 bg-card p-6 sm:p-7">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></span>
                  <h3 className="mt-6 text-xl font-semibold">Partner Programme</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">Review applications, approve referral codes, and monitor referred purchases.</p>
                  <Button asChild className="mt-6"><Link href="/admin/partners">Manage partners <ArrowRight /></Link></Button>
                </article>
                <article className="rounded-xl border border-dashed border-border bg-muted/20 p-6 sm:p-7">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted"><CircleDollarSign className="h-5 w-5 text-muted-foreground" /></span>
                  <h3 className="mt-6 text-xl font-semibold">More tools when needed</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">Future administrative functions will be added here only when there is a clear operational need.</p>
                </article>
              </div>
            </section>
          </>
        )}
      </main>
    </AdminShell>
  );
}
