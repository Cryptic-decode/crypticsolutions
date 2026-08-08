import { DashboardPageFrame } from "@/components/dashboard/dashboard-page";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardRouteSkeleton() {
  return (
    <DashboardPageFrame aria-busy="true" aria-label="Loading page">
      <div className="space-y-3 border-b border-border/70 pb-8">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-64 max-w-full" />
        <Skeleton className="h-5 w-[30rem] max-w-full" />
      </div>
      <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border/70 bg-border/70 sm:grid-cols-3">
        {[0, 1, 2].map((item) => <Skeleton key={item} className="h-24 rounded-none bg-card" />)}
      </div>
      <div className="mt-12 space-y-5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </DashboardPageFrame>
  );
}
