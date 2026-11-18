"use client";

import {
  AlertCircle,
  ArrowLeft,
  BookOpenCheck,
  Clock3,
  Loader2,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DashboardPageFrame,
  DashboardPageHeader,
} from "@/components/dashboard/dashboard-page";
import { ObjectiveQuestionInput } from "@/components/practice/objective-question-input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWithUserSession } from "@/lib/client-authenticated-fetch";
import type { ReadingQuestion, ReadingSetDetail } from "@/lib/practice";
import { showError, showSuccess } from "@/lib/utils";

function PlayerSkeleton() {
  return (
    <DashboardPageFrame
      aria-busy="true"
      aria-label="Loading Reading practice set"
    >
      <div className="space-y-3 border-b border-border/70 pb-8">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-[30rem] max-w-full" />
        <Skeleton className="h-5 w-[36rem] max-w-full" />
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-[38rem] rounded-2xl" />
        <Skeleton className="h-[38rem] rounded-2xl" />
      </div>
    </DashboardPageFrame>
  );
}

export function ReadingPracticePlayer({ setId }: { setId: string }) {
  const [set, setSet] = useState<ReadingSetDetail | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const loadSet = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchWithUserSession(
        `/api/practice/reading/${setId}`,
        {
          cache: "no-store",
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          result.error || "This Reading practice set could not be loaded.",
        );
      setSet(result.set);
      setAnswers(result.set.attempt?.answers ?? {});
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "This Reading practice set could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [setId]);

  useEffect(() => {
    void loadSet();
  }, [loadSet]);

  const questions = useMemo(
    () => set?.sections.flatMap((section) => section.questions) ?? [],
    [set],
  );
  const answeredCount = questions.filter((question) =>
    answers[question.id]?.trim(),
  ).length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);
  const completed = set?.attempt?.status === "completed";
  const reviewByQuestion = useMemo(
    () =>
      new Map(
        (set?.attempt?.review ?? []).map((item) => [item.questionId, item]),
      ),
    [set],
  );

  const startAttempt = async () => {
    setStarting(true);
    try {
      const response = await fetchWithUserSession(
        `/api/practice/reading/${setId}`,
        {
          method: "POST",
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          result.error || "The Reading practice could not be started.",
        );
      await loadSet();
      showSuccess(
        result.resumed
          ? "Your saved attempt is ready."
          : "Reading practice started.",
      );
    } catch (startError) {
      showError(startError);
    } finally {
      setStarting(false);
    }
  };

  const saveAnswer = async (questionId: string, value: string) => {
    if (!set?.attempt || set.attempt.status !== "in_progress") return;
    setSavingQuestionId(questionId);
    try {
      const response = await fetchWithUserSession(
        `/api/practice/reading/attempts/${set.attempt.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ questionId, answer: value }),
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(result.error || "Your answer could not be saved.");
      setLastSavedAt(result.savedAt);
    } catch (saveError) {
      showError(saveError);
    } finally {
      setSavingQuestionId(null);
    }
  };

  const changeAnswer = (question: ReadingQuestion, value: string) => {
    setAnswers((current) => ({ ...current, [question.id]: value }));
    if (question.type === "single_choice") void saveAnswer(question.id, value);
  };

  const submitAttempt = async () => {
    if (!set?.attempt || set.attempt.status !== "in_progress") return;
    setSubmitting(true);
    try {
      await Promise.all(
        Object.entries(answers).map(async ([questionId, answer]) => {
          const response = await fetchWithUserSession(
            `/api/practice/reading/attempts/${set.attempt!.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ questionId, answer }),
            },
          );
          if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(
              result.error || "One or more answers could not be saved.",
            );
          }
        }),
      );

      const response = await fetchWithUserSession(
        `/api/practice/reading/attempts/${set.attempt.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "submit" }),
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(result.error || "Your answers could not be submitted.");
      setShowSubmitModal(false);
      await loadSet();
      showSuccess(
        `Practice submitted. You scored ${result.score} out of ${result.maxScore}.`,
      );
    } catch (submitError) {
      showError(submitError);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PlayerSkeleton />;

  if (error || !set) {
    return (
      <DashboardPageFrame>
        <DashboardPageHeader
          eyebrow="IELTS Reading"
          title="This practice set is unavailable"
          description="Return to Reading practice or try loading the set again."
          action={
            <Button asChild variant="outline">
              <Link href="/practice/reading">
                <ArrowLeft /> Reading practice
              </Link>
            </Button>
          }
        />
        <section
          className="mt-10 rounded-2xl border border-destructive/25 bg-destructive/5 p-7"
          role="alert"
        >
          <AlertCircle className="h-6 w-6 text-destructive" />
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {error}
          </p>
          <Button
            className="mt-5"
            variant="outline"
            onClick={() => void loadSet()}
          >
            <RefreshCw /> Try again
          </Button>
        </section>
      </DashboardPageFrame>
    );
  }

  if (!set.attempt) {
    return (
      <DashboardPageFrame>
        <DashboardPageHeader
          eyebrow="IELTS Reading"
          title={set.title}
          description={set.description}
          action={
            <Button asChild variant="outline">
              <Link href="/practice/reading">
                <ArrowLeft /> Reading practice
              </Link>
            </Button>
          }
        />
        <section className="mt-10 grid overflow-hidden rounded-2xl border border-border/70 bg-card lg:grid-cols-[1fr_20rem]">
          <div className="p-7 sm:p-10">
            <BookOpenCheck className="h-7 w-7 text-primary" />
            <h2 className="mt-5 text-2xl font-semibold">Before you begin</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {set.instructions}
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <span>{set.questionCount} questions</span>
              {set.durationMinutes && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4 text-primary" />
                  Recommended time: {set.durationMinutes} minutes
                </span>
              )}
            </div>
            <Button
              className="mt-7"
              size="lg"
              onClick={() => void startAttempt()}
              disabled={starting}
            >
              {starting ? (
                <>
                  <Loader2 className="animate-spin" /> Starting
                </>
              ) : (
                <>
                  Start practice <BookOpenCheck />
                </>
              )}
            </Button>
          </div>
          <aside className="border-t border-border/70 bg-muted/35 p-7 lg:border-l lg:border-t-0">
            <h3 className="font-semibold">A simple approach</h3>
            <ol className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">
              <li>
                <strong className="text-foreground">
                  1. Read for structure.
                </strong>
                <br />
                Notice the main idea of each paragraph.
              </li>
              <li>
                <strong className="text-foreground">
                  2. Return to the evidence.
                </strong>
                <br />
                Answer from the passage, not from memory or outside knowledge.
              </li>
              <li>
                <strong className="text-foreground">
                  3. Review the explanation.
                </strong>
                <br />
                Use the result to improve your next attempt.
              </li>
            </ol>
          </aside>
        </section>
      </DashboardPageFrame>
    );
  }

  return (
    <DashboardPageFrame className="max-w-[90rem]">
      <DashboardPageHeader
        eyebrow="IELTS Reading"
        title={set.title}
        description={
          completed
            ? `Completed with ${set.attempt.score} out of ${set.attempt.maxScore}. Review each answer below.`
            : set.instructions
        }
        action={
          <Button asChild variant="outline">
            <Link href="/practice/reading">
              <ArrowLeft /> Reading practice
            </Link>
          </Button>
        }
      />

      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-medium">
            {answeredCount} of {questions.length} answered
          </span>
          {set.durationMinutes && (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              {set.durationMinutes} minutes recommended
            </span>
          )}
        </div>
        {!completed && (
          <span
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
            aria-live="polite"
          >
            {savingQuestionId ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving answer
              </>
            ) : lastSavedAt ? (
              <>
                <Save className="h-3.5 w-3.5" /> Answers saved
              </>
            ) : (
              "Answers save as you work"
            )}
          </span>
        )}
      </div>

      {completed && (
        <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-primary/25 bg-primary/8 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">
              Practice complete
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {set.attempt.score} / {set.attempt.maxScore}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Review the passage evidence and explanations before trying again.
            </p>
          </div>
          <Button onClick={() => void startAttempt()} disabled={starting}>
            {starting ? <Loader2 className="animate-spin" /> : <RotateCcw />}{" "}
            Try again
          </Button>
        </section>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(28rem,0.92fr)]">
        <div className="xl:sticky xl:top-24 xl:self-start">
          {set.sections.map((section) => (
            <article
              key={section.id}
              className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8"
            >
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                Reading passage
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">
                {section.title}
              </h2>
              <div className="mt-6 max-h-[calc(100dvh-15rem)] overflow-y-auto pr-2 text-[0.95rem] leading-8 text-foreground/90 whitespace-pre-line">
                {section.passage}
              </div>
            </article>
          ))}
        </div>

        <section aria-labelledby="reading-questions-title">
          <div className="mb-5">
            <h2
              id="reading-questions-title"
              className="text-2xl font-semibold tracking-[-0.025em]"
            >
              Questions
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use only the passage to choose or enter each answer.
            </p>
          </div>
          <div className="space-y-4">
            {questions.map((question) => (
              <ObjectiveQuestionInput
                key={question.id}
                question={question}
                value={answers[question.id] ?? ""}
                disabled={completed || submitting}
                review={reviewByQuestion.get(question.id)}
                onChange={(value) => changeAnswer(question, value)}
                onBlur={() =>
                  void saveAnswer(question.id, answers[question.id] ?? "")
                }
              />
            ))}
          </div>
          {!completed && (
            <div className="sticky bottom-4 mt-6 rounded-xl border border-border/70 bg-background/95 p-4 shadow-lg backdrop-blur-xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {unansweredCount
                    ? `${unansweredCount} unanswered ${unansweredCount === 1 ? "question" : "questions"}`
                    : "All questions answered"}
                </p>
                <Button
                  size="lg"
                  onClick={() => setShowSubmitModal(true)}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="animate-spin" /> : <Send />}{" "}
                  Submit answers
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>

      <Modal
        isOpen={showSubmitModal}
        onClose={() => !submitting && setShowSubmitModal(false)}
        title="Submit your answers?"
      >
        <p className="text-sm leading-6 text-muted-foreground">
          {unansweredCount
            ? `You still have ${unansweredCount} unanswered ${unansweredCount === 1 ? "question" : "questions"}. Unanswered questions will score zero.`
            : "You have answered every question. After submission, you will see your score and explanations."}
        </p>
        <p className="mt-3 text-sm font-medium">
          You cannot change this attempt after submitting it.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSubmitModal(false)}
            disabled={submitting}
          >
            Keep reviewing
          </Button>
          <Button onClick={() => void submitAttempt()} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="animate-spin" /> Submitting
              </>
            ) : (
              "Submit attempt"
            )}
          </Button>
        </div>
      </Modal>
    </DashboardPageFrame>
  );
}
