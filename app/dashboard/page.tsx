"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, ArrowRight, BookOpen, Check, Clock, Flame, LockKeyhole, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { ChangePasswordModal } from "@/components/dashboard/change-password-modal";
import { DashboardPageFrame, DashboardPageHeader, DashboardSectionHeader } from "@/components/dashboard/dashboard-page";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { usePurchases } from "@/lib/hooks/use-purchases";
import { useReadingProgress } from "@/lib/hooks/use-reading-progress";
import { useStudyStreak } from "@/lib/hooks/use-study-streak";
import { formatReadingTime, getCourseProductIds, getProductInfo } from "@/lib/products";
import { supabase } from "@/lib/supabase";
import { showSuccess } from "@/lib/utils";

const courseProductIds = getCourseProductIds();

function LibrarySkeleton() {
  return (
    <DashboardPageFrame aria-busy="true" aria-label="Loading your library">
      <div className="space-y-3 border-b border-border/70 pb-8">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-5 w-[32rem] max-w-full" />
      </div>
      <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border/70 bg-border/70 sm:grid-cols-3">
        {[0, 1, 2].map((item) => <Skeleton key={item} className="h-24 rounded-none bg-card" />)}
      </div>
      <div className="mt-12 space-y-5">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    </DashboardPageFrame>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { purchases, loading: purchasesLoading, error: purchasesError, refetch } = usePurchases();
  const { getProgressForProduct } = useReadingProgress();
  const { currentStreak, todayStudied, loading: streakLoading } = useStudyStreak();
  const router = useRouter();
  const [linkingPurchases, setLinkingPurchases] = useState(false);
  const [linkingError, setLinkingError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const hasLinkedPurchases = useRef(false);

  const coursePurchases = useMemo(
    () => purchases.filter((purchase) => courseProductIds.has(purchase.product_id)),
    [purchases]
  );

  const totalReadingSeconds = coursePurchases.reduce(
    (total, purchase) => total + (getProgressForProduct(purchase.product_id)?.total_read_seconds ?? 0),
    0
  );

  useEffect(() => {
    if (!authLoading && !user) router.replace("/signin");
  }, [user, authLoading, router]);

  useEffect(() => {
    const linkPurchases = async () => {
      if (!user?.email_confirmed_at || hasLinkedPurchases.current) return;

      setLinkingPurchases(true);
      setLinkingError("");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const response = await fetch("/api/purchases/link", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "We could not sync your purchases.");

        if (data.linked_count > 0) {
          await refetch();
          showSuccess(`${data.linked_count} purchase${data.linked_count > 1 ? "s" : ""} added to your library.`);
        }
        hasLinkedPurchases.current = true;
      } catch (error) {
        setLinkingError(error instanceof Error ? error.message : "We could not sync your purchases.");
      } finally {
        setLinkingPurchases(false);
      }
    };

    linkPurchases();
  }, [user, refetch]);

  if (authLoading || purchasesLoading) return <LibrarySkeleton />;
  if (!user) return null;

  const displayName = user.user_metadata?.full_name?.trim() || user.email?.split("@")[0] || "there";
  const firstName = displayName.split(" ")[0];

  return (
    <DashboardPageFrame>
      <DashboardPageHeader
        eyebrow="Your learning space"
        title={`Welcome back, ${firstName}`}
        description="Continue reading, review your progress, or manage your account from one focused workspace."
        action={coursePurchases[0] && (
          <Button asChild size="lg">
            <Link href={`/course/${coursePurchases[0].product_id}`}>Continue reading <ArrowRight /></Link>
          </Button>
        )}
      />

      <section aria-label="Learning overview" className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border/70 bg-border/70 sm:grid-cols-3">
        <div className="bg-card px-5 py-5 sm:px-6">
          <p className="text-xs font-medium text-muted-foreground">Course library</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{coursePurchases.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">{coursePurchases.length === 1 ? "course ready" : "courses ready"}</p>
        </div>
        <div className="bg-card px-5 py-5 sm:px-6">
          <p className="text-xs font-medium text-muted-foreground">Reading time</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{totalReadingSeconds ? formatReadingTime(totalReadingSeconds) : "0 min"}</p>
          <p className="mt-1 text-xs text-muted-foreground">across your library</p>
        </div>
        <div className="bg-card px-5 py-5 sm:px-6">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Flame className="h-3.5 w-3.5 text-primary" /> Study streak</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{streakLoading ? "..." : `${currentStreak} ${currentStreak === 1 ? "day" : "days"}`}</p>
          <p className="mt-1 text-xs text-muted-foreground">{todayStudied ? "Studied today" : "Open a course to keep learning"}</p>
        </div>
      </section>

      <div aria-live="polite" className="mt-6 space-y-3">
        {linkingPurchases && (
          <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin text-primary" /> Checking for recent purchases
          </div>
        )}
        {linkingError && (
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2 text-destructive"><AlertCircle className="h-4 w-4" />{linkingError}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => { hasLinkedPurchases.current = false; setLinkingError(""); window.location.reload(); }}>Try again</Button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {!user.user_metadata?.password_changed && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-8 grid gap-4 rounded-xl border border-primary/25 bg-primary/[0.06] p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6"
            aria-labelledby="security-task-title"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15"><LockKeyhole className="h-5 w-5 text-primary" /></div>
            <div>
              <h2 id="security-task-title" className="font-semibold">Secure your account</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Replace your temporary password before your next study session.</p>
            </div>
            <Button variant="outline" onClick={() => setShowPasswordModal(true)}>Change password</Button>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="mt-12" aria-labelledby="library-title">
        <DashboardSectionHeader
          title="My library"
          description="Your protected courses and saved reading progress."
          action={<Button asChild variant="ghost" size="sm"><Link href="/progress">View progress <ArrowRight /></Link></Button>}
        />

        {purchasesError && (
          <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <h3 className="mt-4 font-semibold">We could not load your library</h3>
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">{purchasesError}</p>
            <Button className="mt-5" variant="outline" onClick={() => refetch()}><RefreshCw /> Try again</Button>
          </div>
        )}

        {!purchasesError && coursePurchases.length === 0 && (
          <div className="grid overflow-hidden rounded-2xl border border-border/70 bg-card md:grid-cols-[1fr_16rem]">
            <div className="p-7 sm:p-10">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Start your library</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.025em]">Choose a practical learning product.</h3>
              <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">The IELTS manual includes protected online reading and progress tracking. Download products remain available through their purchase links.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild><Link href="/ielts-manual">Explore IELTS manual <ArrowRight /></Link></Button>
                <Button asChild variant="outline"><Link href="/prompt-engineering-ebook">View prompt ebook</Link></Button>
              </div>
            </div>
            <div className="grid place-items-center bg-muted/45 p-8 dark:bg-[#10120f]">
              <Image src="/product-assets/ielts-manual-cover.png" alt="IELTS Preparation Manual cover" width={180} height={256} className="h-52 w-auto rounded-md shadow-[0_18px_40px_rgba(20,25,16,.18)]" />
            </div>
          </div>
        )}

        {!purchasesError && coursePurchases.length > 0 && (
          <div className="space-y-5">
            {coursePurchases.map((purchase) => {
              const product = getProductInfo(purchase.product_id);
              if (!product?.totalPages) return null;

              const totalPages = product.totalPages;
              const readingProgress = getProgressForProduct(purchase.product_id);
              const currentPage = readingProgress ? readingProgress.last_page + 1 : 0;
              const progressPercent = readingProgress ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0;

              return (
                <article key={purchase.id} className="grid overflow-hidden rounded-2xl border border-border/70 bg-card transition-colors hover:border-primary/35 lg:grid-cols-[13rem_1fr]">
                  <div className="grid min-h-64 place-items-center bg-muted/45 p-7 dark:bg-[#10120f]">
                    <Image src="/product-assets/ielts-manual-cover.png" alt={`${product.name} cover`} width={180} height={256} className="h-52 w-auto rounded-md shadow-[0_18px_45px_rgba(20,25,16,.2)]" />
                  </div>
                  <div className="flex flex-col p-6 sm:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary"><Check className="h-3.5 w-3.5" /> Ready to read</span>
                        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">{product.name}</h3>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{product.description}</p>
                      </div>
                      <p className="shrink-0 text-xs text-muted-foreground">Added {new Date(purchase.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>

                    <div className="mt-7 rounded-lg bg-muted/45 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                        <span className="font-medium">{progressPercent ? `${progressPercent}% complete` : "Ready to begin"}</span>
                        <span className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />{currentPage ? `Page ${currentPage} of ${totalPages}` : `${totalPages} pages`}</span>
                          {Boolean(readingProgress?.total_read_seconds) && <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{formatReadingTime(readingProgress!.total_read_seconds)}</span>}
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-background" role="progressbar" aria-label={`${product.name} reading progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}>
                        <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${progressPercent}%` }} />
                      </div>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-3 pt-7">
                      <Button asChild size="lg"><Link href={`/course/${purchase.product_id}`}>{progressPercent ? "Continue reading" : "Start reading"} <ArrowRight /></Link></Button>
                      <Button asChild variant="ghost"><Link href="/progress">Detailed progress</Link></Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-12 border-t border-border/70 pt-8" aria-labelledby="account-shortcuts-title">
        <DashboardSectionHeader title="Account shortcuts" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/settings" className="group rounded-xl bg-muted/45 p-5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <p className="font-semibold">Account settings</p>
            <p className="mt-1 text-sm text-muted-foreground">Review your profile, email, and password.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">Open settings <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
          </Link>
          <a href="mailto:info@crypticsolutionsltd.com" className="group rounded-xl bg-muted/45 p-5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <p className="font-semibold">Customer support</p>
            <p className="mt-1 text-sm text-muted-foreground">Get help with access, payments, or reading.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">Email support <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
          </a>
        </div>
      </section>

      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </DashboardPageFrame>
  );
}
