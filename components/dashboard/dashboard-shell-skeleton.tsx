import { Skeleton } from "@/components/ui/skeleton";

export function DashboardShellSkeleton() {
  return (
    <div className="min-h-dvh bg-background" aria-busy="true" aria-label="Loading dashboard">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border/70 p-6 lg:block">
        <Skeleton className="mx-auto h-8 w-36" />
        <div className="mt-12 space-y-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="h-16 border-b border-border/70 px-5 py-3 lg:px-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-10 w-44" />
          </div>
        </header>
        <main className="mx-auto max-w-6xl space-y-8 p-5 sm:p-8 lg:p-10">
          <div className="space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-96 max-w-full" />
          </div>
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-5 md:grid-cols-2">
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        </main>
      </div>
    </div>
  );
}
