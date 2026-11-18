"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  Headphones,
  LockKeyhole,
  MessageCircleMore,
  PencilLine,
  RefreshCw,
} from "lucide-react";

import {
  DashboardPageFrame,
  DashboardPageHeader,
  DashboardSectionHeader,
} from "@/components/dashboard/dashboard-page";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWithUserSession } from "@/lib/client-authenticated-fetch";
import {
  getAttemptStatusLabel,
  getPracticeStatusLabel,
  PRACTICE_SKILLS,
  type PracticeOverviewData,
  type PracticeSkill,
} from "@/lib/practice";
import { cn } from "@/lib/utils";

const skillIcons = {
  reading: BookOpenCheck,
  listening: Headphones,
  writing: PencilLine,
  speaking: MessageCircleMore,
} satisfies Record<PracticeSkill, typeof BookOpenCheck>;

function PracticeSkeleton() {
  return (
    <DashboardPageFrame aria-busy="true" aria-label="Loading IELTS practice">
      <div className="space-y-3 border-b border-border/70 pb-8">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-5 w-[34rem] max-w-full" />
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-52 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="mt-12 h-60 rounded-2xl" />
    </DashboardPageFrame>
  );
}

function MissingAccess() {
  return (
    <DashboardPageFrame>
      <DashboardPageHeader
        eyebrow="IELTS practice"
        title="Build confidence through focused practice"
        description="Practice access is available to learners who own the IELTS Preparation Manual."
      />
      <section
        className="mt-10 grid overflow-hidden rounded-2xl border border-border/70 bg-card md:grid-cols-[1fr_18rem]"
        aria-labelledby="practice-access-title"
      >
        <div className="p-7 sm:p-10">
          <LockKeyhole className="h-6 w-6 text-primary" />
          <h2
            id="practice-access-title"
            className="mt-5 text-2xl font-semibold tracking-[-0.025em]"
          >
            Add the manual to unlock practice.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            The manual gives you a structured foundation for IELTS preparation.
            Practice activities will help you apply what you learn across the
            four skills.
          </p>
          <Button asChild className="mt-7" size="lg">
            <Link href="/ielts-manual">
              Explore the IELTS manual <ArrowRight />
            </Link>
          </Button>
        </div>
        <div
          className="grid place-items-center border-t border-border/70 bg-muted/45 p-8 md:border-l md:border-t-0 dark:bg-[#10120f]"
          aria-hidden="true"
        >
          <div className="grid h-28 w-28 place-items-center rounded-full border border-primary/25 bg-primary/10">
            <BookOpenCheck className="h-12 w-12 text-primary" />
          </div>
        </div>
      </section>
    </DashboardPageFrame>
  );
}

export function PracticeOverview() {
  const [data, setData] = useState<PracticeOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetchWithUserSession("/api/practice/overview", {
        cache: "no-store",
        signal,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "We could not load IELTS practice.");
      setData(result);
    } catch (requestError) {
      if (
        requestError instanceof DOMException &&
        requestError.name === "AbortError"
      )
        return;
      setError(
        requestError instanceof Error
          ? requestError.message
          : "We could not load IELTS practice.",
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadOverview(controller.signal);
    return () => controller.abort();
  }, [loadOverview]);

  const completedAttempts = useMemo(
    () =>
      data?.attempts.filter((attempt) => attempt.status === "completed")
        .length ?? 0,
    [data],
  );
  const hasReadingPractice = Boolean(data?.availableSetCounts.reading);
  const hasListeningPractice = Boolean(data?.availableSetCounts.listening);
  const availablePracticeCount =
    Number(hasReadingPractice) + Number(hasListeningPractice);

  if (loading) return <PracticeSkeleton />;

  if (error) {
    return (
      <DashboardPageFrame>
        <DashboardPageHeader
          eyebrow="IELTS practice"
          title="Practice is temporarily unavailable"
          description="Your learning record is safe. Try loading this page again."
        />
        <section
          className="mt-10 rounded-2xl border border-destructive/25 bg-destructive/5 p-7 sm:p-9"
          role="alert"
        >
          <AlertCircle className="h-6 w-6 text-destructive" />
          <h2 className="mt-4 text-lg font-semibold">
            We could not load your practice space
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {error}
          </p>
          <Button
            className="mt-6"
            variant="outline"
            onClick={() => loadOverview()}
          >
            <RefreshCw /> Try again
          </Button>
        </section>
      </DashboardPageFrame>
    );
  }

  if (!data?.hasAccess) return <MissingAccess />;

  return (
    <DashboardPageFrame>
      <DashboardPageHeader
        eyebrow="IELTS practice"
        title="Practise with purpose"
        description={
          availablePracticeCount === 2
            ? "Reading and Listening practice are ready. Writing and Speaking will follow later."
            : availablePracticeCount === 1
              ? "The first practice area is ready. Reading and Listening will launch before Writing and Speaking."
              : "Reading and Listening are the first practice areas we are building. Writing and Speaking will follow later."
        }
        action={
          <Button asChild variant="outline">
            <Link href="/course/ielts-manual">
              Open the manual <ArrowRight />
            </Link>
          </Button>
        }
      />

      <section className="mt-12" aria-labelledby="practice-areas-title">
        <DashboardSectionHeader
          title="Practice areas"
          description="Each area will keep your attempts and results together, so you can see where to focus next."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {PRACTICE_SKILLS.map((item) => {
            const Icon = skillIcons[item.skill];
            const isAvailable =
              item.skill === "reading"
                ? hasReadingPractice
                : item.skill === "listening" && hasListeningPractice;
            const status = isAvailable ? "available" : item.status;
            const isInDevelopment = status === "in_development";
            const isPrimaryStatus = isAvailable || isInDevelopment;

            return (
              <article
                key={item.skill}
                className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={cn(
                      "grid h-11 w-11 place-items-center rounded-lg",
                      isPrimaryStatus
                        ? "bg-primary/12 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium",
                      isPrimaryStatus
                        ? "border-primary/25 bg-primary/8 text-primary"
                        : "border-border/70 bg-muted/50 text-muted-foreground",
                    )}
                  >
                    {getPracticeStatusLabel(status)}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-[-0.02em]">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
                <div className="mt-6 border-t border-border/70 pt-4">
                  {isAvailable ? (
                    <Button asChild size="sm">
                      <Link href={`/practice/${item.skill}`}>
                        Open {item.title} practice <ArrowRight />
                      </Link>
                    </Button>
                  ) : (
                    <p className="text-xs font-medium text-muted-foreground">
                      {isInDevelopment
                        ? "Activities will appear here when they are ready."
                        : "Scheduled after Reading and Listening."}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="attempt-history-title">
        <DashboardSectionHeader
          title="Recent attempts"
          description={
            data.attempts.length
              ? `${completedAttempts} of ${data.attempts.length} recent attempts completed.`
              : "Your in-progress and completed activities will appear here."
          }
        />

        {data.attempts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center sm:p-10">
            <Clock3 className="mx-auto h-6 w-6 text-primary" />
            <h3 className="mt-4 text-lg font-semibold">
              No practice attempts yet
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              There is nothing you need to do yet. Your activity history will
              begin when the first Reading and Listening exercises are released.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
            <ul className="divide-y divide-border/70">
              {data.attempts.map((attempt) => {
                const isCompleted = attempt.status === "completed";
                return (
                  <li
                    key={attempt.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{attempt.setTitle}</h3>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                          {attempt.skill}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Started{" "}
                        {new Date(attempt.startedAt).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 sm:text-right">
                      {isCompleted &&
                        attempt.score !== null &&
                        attempt.maxScore !== null && (
                          <p className="text-sm font-semibold tabular-nums">
                            {attempt.score}/{attempt.maxScore}
                          </p>
                        )}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-medium",
                          isCompleted
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Clock3 className="h-3.5 w-3.5" />
                        )}
                        {getAttemptStatusLabel(attempt.status)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </DashboardPageFrame>
  );
}
