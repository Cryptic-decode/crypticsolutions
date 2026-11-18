"use client";

import { AlertCircle, ArrowLeft, ArrowRight, BookOpenCheck, CheckCircle2, Clock3, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DashboardPageFrame, DashboardPageHeader, DashboardSectionHeader } from "@/components/dashboard/dashboard-page";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWithUserSession } from "@/lib/client-authenticated-fetch";
import type { ReadingSetSummary } from "@/lib/practice";

function ReadingLibrarySkeleton() {
  return (
    <DashboardPageFrame aria-busy="true" aria-label="Loading Reading practice">
      <div className="space-y-3 border-b border-border/70 pb-8"><Skeleton className="h-3 w-24" /><Skeleton className="h-10 w-72" /><Skeleton className="h-5 w-[32rem] max-w-full" /></div>
      <div className="mt-12 grid gap-4 md:grid-cols-2">{[0, 1].map((item) => <Skeleton key={item} className="h-64 rounded-2xl" />)}</div>
    </DashboardPageFrame>
  );
}

export function ReadingPracticeLibrary() {
  const [sets, setSets] = useState<ReadingSetSummary[] | null>(null);
  const [error, setError] = useState("");

  const loadSets = useCallback(async () => {
    setError("");
    try {
      const response = await fetchWithUserSession("/api/practice/reading", {
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Reading practice could not be loaded.");
      setSets(result.sets);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Reading practice could not be loaded.");
    }
  }, []);

  useEffect(() => { void loadSets(); }, [loadSets]);

  if (!sets && !error) return <ReadingLibrarySkeleton />;

  return (
    <DashboardPageFrame>
      <DashboardPageHeader
        eyebrow="IELTS Reading"
        title="Read carefully. Answer with evidence."
        description="Work through focused passages, submit your answers, and review the evidence behind every result."
        action={<Button asChild variant="outline"><Link href="/practice"><ArrowLeft /> All practice areas</Link></Button>}
      />

      {error && (
        <section className="mt-10 rounded-2xl border border-destructive/25 bg-destructive/5 p-7" role="alert">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <h2 className="mt-4 font-semibold">We could not load Reading practice</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{error}</p>
          <Button className="mt-5" variant="outline" onClick={() => void loadSets()}><RefreshCw /> Try again</Button>
        </section>
      )}

      {sets && (
        <section className="mt-12" aria-labelledby="reading-sets-title">
          <DashboardSectionHeader title="Available practice" description={`${sets.length} ${sets.length === 1 ? "set" : "sets"} ready to study.`} />
          {sets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center sm:p-10">
              <BookOpenCheck className="mx-auto h-6 w-6 text-primary" />
              <h2 className="mt-4 text-lg font-semibold">The first Reading set is being reviewed</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">It will appear here after it has passed the content and answer checks.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sets.map((set, index) => {
                const completed = set.latestAttemptStatus === "completed";
                const inProgress = set.latestAttemptStatus === "in_progress";
                return (
                  <article key={set.id} className="flex flex-col rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/35 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary"><BookOpenCheck className="h-5 w-5" /></span>
                      <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Set {index + 1}</span>
                    </div>
                    <h2 className="mt-6 text-xl font-semibold tracking-[-0.02em]">{set.title}</h2>
                    <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{set.description}</p>
                    <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border/70 pt-4 text-xs text-muted-foreground">
                      <span>{set.questionCount} questions</span>
                      {set.durationMinutes && <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{set.durationMinutes} minutes</span>}
                      {completed && <span className="inline-flex items-center gap-1.5 text-primary"><CheckCircle2 className="h-3.5 w-3.5" />Completed</span>}
                    </div>
                    <Button asChild className="mt-5 w-full sm:w-auto sm:self-start"><Link href={`/practice/reading/${set.id}`}>{inProgress ? "Continue practice" : completed ? "Review or try again" : "Start practice"}<ArrowRight /></Link></Button>
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
