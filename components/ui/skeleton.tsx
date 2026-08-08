"use client";

import { cn } from "@/lib/utils";

/**
 * Base skeleton block with a shimmer animation.
 * Accepts standard HTML div props so it can be composed freely.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-lg bg-secondary/40 dark:bg-secondary/20",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/20 dark:before:via-white/5 before:to-transparent",
        className,
      )}
      {...props}
    />
  );
}

/**
 * A card-shaped skeleton with the same dimensions as a standard Card+p-6.
 */
export function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton className={cn("p-6", className)} {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <div className="pt-2">
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
      </div>
    </Skeleton>
  );
}

/**
 * A small stat-card skeleton for the progress page grid.
 */
export function SkeletonStatCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton className={cn("p-6", className)} {...props}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-3/5" />
          <Skeleton className="h-6 w-2/5" />
        </div>
      </div>
    </Skeleton>
  );
}

/**
 * A full-page loading shell for the dashboard/progress pages.
 * Renders a column of skeleton cards with staggered opacity.
 */
export function PageSkeleton({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-4xl p-8 space-y-6">
        {children || (
          <>
            {/* Title area */}
            <div className="flex items-center gap-3 mb-8">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* Stat grid */}
            <div className="grid gap-4 md:grid-cols-4">
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </div>

            {/* Course cards */}
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}
      </div>
    </div>
  );
}
