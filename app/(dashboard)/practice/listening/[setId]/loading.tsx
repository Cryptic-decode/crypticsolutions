import { DashboardPageFrame } from "@/components/dashboard/dashboard-page";
import { Skeleton } from "@/components/ui/skeleton";

export default function ListeningPracticeSetLoading() {
  return <DashboardPageFrame aria-busy="true" aria-label="Loading Listening practice set"><div className="space-y-3 border-b border-border/70 pb-8"><Skeleton className="h-3 w-24" /><Skeleton className="h-10 w-[30rem] max-w-full" /><Skeleton className="h-5 w-[36rem] max-w-full" /></div><Skeleton className="mt-8 h-28 rounded-2xl" /><div className="mt-6 grid gap-4 lg:grid-cols-2"><Skeleton className="h-64 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div></DashboardPageFrame>;
}
