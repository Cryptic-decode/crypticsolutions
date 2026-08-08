"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { AlertCircle, ArrowRight, BookOpen, CalendarDays, Clock, Flame, RefreshCw } from "lucide-react";

import { DashboardPageFrame, DashboardPageHeader, DashboardSectionHeader } from "@/components/dashboard/dashboard-page";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { usePurchases } from "@/lib/hooks/use-purchases";
import { useReadingProgress } from "@/lib/hooks/use-reading-progress";
import { useStudyStreak } from "@/lib/hooks/use-study-streak";
import { formatReadingTime, getCourseProductIds, getProductInfo } from "@/lib/products";

const courseProductIds = getCourseProductIds();

function ProgressSkeleton() {
  return (
    <DashboardPageFrame aria-busy="true" aria-label="Loading study progress">
      <div className="space-y-3 border-b border-border/70 pb-8"><Skeleton className="h-3 w-24" /><Skeleton className="h-10 w-64" /><Skeleton className="h-5 w-96 max-w-full" /></div>
      <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border/70 bg-border/70 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-28 rounded-none bg-card" />)}
      </div>
      <Skeleton className="mt-12 h-72 w-full rounded-2xl" />
    </DashboardPageFrame>
  );
}

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth();
  const { purchases, loading: purchasesLoading, error: purchasesError, refetch: refetchPurchases } = usePurchases();
  const { progress, loading: progressLoading, error: progressError, refetch: refetchProgress, getProgressForProduct } = useReadingProgress();
  const { currentStreak, longestStreak, totalStudyDays, loading: streakLoading } = useStudyStreak();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/signin");
  }, [user, authLoading, router]);

  const coursePurchases = useMemo(
    () => purchases.filter((purchase) => courseProductIds.has(purchase.product_id)),
    [purchases]
  );
  const totalStudySeconds = progress.reduce((total, item) => total + item.total_read_seconds, 0);
  const activeCourses = coursePurchases.filter((purchase) => Boolean(getProgressForProduct(purchase.product_id))).length;
  const dataError = purchasesError || progressError;

  if (authLoading || purchasesLoading || progressLoading) return <ProgressSkeleton />;
  if (!user) return null;

  const retry = () => Promise.all([refetchPurchases(), refetchProgress()]);

  return (
    <DashboardPageFrame>
      <DashboardPageHeader eyebrow="Learning record" title="Study progress" description="A clear view of your reading activity, course position, and study consistency." />

      <section aria-label="Progress summary" className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border/70 bg-border/70 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [BookOpen, "Courses", String(coursePurchases.length), "in your library"],
          [Clock, "Reading time", totalStudySeconds ? formatReadingTime(totalStudySeconds) : "0 min", "across all courses"],
          [CalendarDays, "Study days", String(totalStudyDays), "days with activity"],
          [Flame, "Current streak", streakLoading ? "..." : `${currentStreak} ${currentStreak === 1 ? "day" : "days"}`, longestStreak ? `Best: ${longestStreak} ${longestStreak === 1 ? "day" : "days"}` : "Start with one session"],
        ].map(([Icon, label, value, detail]) => {
          const SummaryIcon = Icon as typeof BookOpen;
          return (
            <div key={String(label)} className="bg-card px-5 py-5 sm:px-6">
              <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><SummaryIcon className="h-3.5 w-3.5 text-primary" />{String(label)}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{String(value)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{String(detail)}</p>
            </div>
          );
        })}
      </section>

      {dataError && (
        <section className="mt-8 rounded-xl border border-destructive/25 bg-destructive/5 p-6" aria-labelledby="progress-error-title">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <h2 id="progress-error-title" className="mt-4 font-semibold">We could not load all progress data</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{dataError}</p>
          <Button className="mt-5" variant="outline" onClick={retry}><RefreshCw /> Try again</Button>
        </section>
      )}

      {!dataError && (
        <section className="mt-12" aria-labelledby="course-progress-title">
          <DashboardSectionHeader title="Course progress" description={`${activeCourses} of ${coursePurchases.length} courses started.`} />

          {coursePurchases.length === 0 ? (
            <div className="rounded-2xl border border-border/70 bg-card p-8 sm:p-10">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Nothing to track yet</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.025em]">Add a course to begin your learning record.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Once you start reading, this page will show your page position, reading time, and study consistency.</p>
              <Button asChild className="mt-7"><Link href="/ielts-manual">Explore IELTS manual <ArrowRight /></Link></Button>
            </div>
          ) : (
            <div className="space-y-4">
              {coursePurchases.map((purchase) => {
                const product = getProductInfo(purchase.product_id);
                if (!product?.totalPages) return null;

                const totalPages = product.totalPages;
                const readingProgress = getProgressForProduct(purchase.product_id);
                const currentPage = readingProgress ? readingProgress.last_page + 1 : 0;
                const percentage = readingProgress ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0;

                return (
                  <article key={purchase.id} className="grid items-center gap-6 rounded-2xl border border-border/70 bg-card p-5 sm:grid-cols-[5rem_1fr_auto] sm:p-6">
                    <div className="grid place-items-center rounded-lg bg-muted/50 p-2 dark:bg-[#10120f]"><Image src="/product-assets/ielts-manual-cover.png" alt={`${product.name} cover`} width={80} height={114} className="h-24 w-auto rounded-sm" /></div>
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-semibold">{product.name}</h3>
                        <span className="text-sm font-semibold tabular-nums">{percentage}%</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`${product.name} progress`} aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} /></div>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                        <span>{currentPage ? `Page ${currentPage} of ${totalPages}` : "Not started"}</span>
                        <span>{readingProgress?.total_read_seconds ? formatReadingTime(readingProgress.total_read_seconds) : "No reading time yet"}</span>
                      </div>
                    </div>
                    <Button asChild variant={percentage ? "default" : "outline"}><Link href={`/course/${purchase.product_id}`}>{percentage ? "Continue" : "Start"}<ArrowRight /></Link></Button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </DashboardPageFrame>
  );
}
