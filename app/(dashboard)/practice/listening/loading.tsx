import { DashboardPageFrame } from "@/components/dashboard/dashboard-page";
import { Skeleton } from "@/components/ui/skeleton";

export default function ListeningPracticeLoading() {
  return <DashboardPageFrame aria-busy="true" aria-label="Loading Listening practice"><div className="space-y-3 border-b border-border/70 pb-8"><Skeleton className="h-3 w-24" /><Skeleton className="h-10 w-72" /><Skeleton className="h-5 w-[32rem] max-w-full" /></div><div className="mt-12 grid gap-4 md:grid-cols-2"><Skeleton className="h-64 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div></DashboardPageFrame>;
}
