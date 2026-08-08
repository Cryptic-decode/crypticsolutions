"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, LockKeyhole, RefreshCw } from "lucide-react";

import { DashboardPageFrame } from "@/components/dashboard/dashboard-page";
import { PDFViewer } from "@/components/dashboard/pdf-viewer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { usePurchases } from "@/lib/hooks/use-purchases";
import { getProductInfo } from "@/lib/products";

function CourseSkeleton() {
  return (
    <DashboardPageFrame className="max-w-[96rem]" aria-busy="true" aria-label="Loading course reader">
      <Skeleton className="h-5 w-28" />
      <div className="mt-7 space-y-3"><Skeleton className="h-10 w-80 max-w-full" /><Skeleton className="h-5 w-[30rem] max-w-full" /></div>
      <div className="mt-8 overflow-hidden rounded-xl border border-border/70">
        <Skeleton className="h-14 w-full rounded-none" />
        <Skeleton className="h-[calc(100dvh-18rem)] min-h-[32rem] w-full rounded-none" />
      </div>
    </DashboardPageFrame>
  );
}

export default function CourseViewPage() {
  const { user, loading: authLoading } = useAuth();
  const { purchases, loading: purchasesLoading, error: purchasesError, refetch } = usePurchases();
  const router = useRouter();
  const params = useParams();
  const productId = params?.productId as string;
  const product = getProductInfo(productId);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/signin");
  }, [user, authLoading, router]);

  if (authLoading || purchasesLoading) return <CourseSkeleton />;
  if (!user) return null;

  const hasAccess = purchases.some(
    (purchase) => purchase.product_id === productId && purchase.status === "completed"
  );

  if (purchasesError) {
    return (
      <DashboardPageFrame className="max-w-3xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to library</Link>
        <section className="mt-8 rounded-xl border border-destructive/25 bg-destructive/5 p-7" aria-labelledby="course-access-error-title">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <h1 id="course-access-error-title" className="mt-4 text-2xl font-semibold tracking-tight">We could not verify course access</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{purchasesError}</p>
          <Button className="mt-6" variant="outline" onClick={() => refetch()}><RefreshCw /> Try again</Button>
        </section>
      </DashboardPageFrame>
    );
  }

  if (!product || !hasAccess) {
    return (
      <DashboardPageFrame className="max-w-3xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to library</Link>
        <section className="mt-8 rounded-xl border border-border/70 bg-card p-7 sm:p-9" aria-labelledby="course-access-title">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted"><LockKeyhole className="h-5 w-5 text-muted-foreground" /></div>
          <h1 id="course-access-title" className="mt-5 text-2xl font-semibold tracking-tight">This course is not in your library</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Purchase the course with this account, then return here to open the protected reader.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild><Link href="/ielts-manual">View course details <ArrowRight /></Link></Button>
            <Button asChild variant="outline"><Link href="/dashboard">Return to library</Link></Button>
          </div>
        </section>
      </DashboardPageFrame>
    );
  }

  return (
    <DashboardPageFrame className="max-w-[96rem]">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="h-4 w-4" /> Back to library</Link>
      <header className="mt-6 flex flex-col gap-3 border-b border-border/70 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Protected reader</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{product.name}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Your page position and reading time save automatically while you study.</p>
        </div>
        <Link href="/progress" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">View detailed progress</Link>
      </header>
      <div className="mt-8">
        <PDFViewer productId={productId} userEmail={user.email || ""} userName={user.user_metadata?.full_name || user.email?.split("@")[0] || "User"} />
      </div>
    </DashboardPageFrame>
  );
}
