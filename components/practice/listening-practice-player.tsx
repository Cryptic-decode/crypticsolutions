"use client";

import {
  AlertCircle,
  ArrowLeft,
  Clock3,
  Headphones,
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
import type { ListeningSetDetail, ReadingQuestion } from "@/lib/practice";
import { supabase } from "@/lib/supabase";
import { showError, showSuccess } from "@/lib/utils";

async function getUserToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token)
    throw new Error("Your session has expired. Please sign in again.");
  return session.access_token;
}

function PlayerSkeleton() {
  return (
    <DashboardPageFrame
      aria-busy="true"
      aria-label="Loading Listening practice set"
    >
      <div className="space-y-3 border-b border-border/70 pb-8">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-[30rem] max-w-full" />
        <Skeleton className="h-5 w-[36rem] max-w-full" />
      </div>
      <Skeleton className="mt-8 h-28 rounded-2xl" />
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-64 rounded-2xl" />
        ))}
      </div>
    </DashboardPageFrame>
  );
}

export function ListeningPracticePlayer({ setId }: { setId: string }) {
  const [set, setSet] = useState<ListeningSetDetail | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const loadAudio = useCallback(async () => {
    const token = await getUserToken();
    const response = await fetch(`/api/practice/listening/${setId}/audio`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(
        result.error || "The listening audio could not be loaded.",
      );
    setAudioUrl(result.url);
  }, [setId]);

  const loadSet = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getUserToken();
      const response = await fetch(`/api/practice/listening/${setId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          result.error || "This Listening practice set could not be loaded.",
        );
      setSet(result.set);
      setAnswers(result.set.attempt?.answers ?? {});
      if (result.set.attempt) await loadAudio();
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "This Listening practice set could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [loadAudio, setId]);

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
      const token = await getUserToken();
      const response = await fetch(`/api/practice/listening/${setId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          result.error || "The Listening practice could not be started.",
        );
      await loadSet();
      showSuccess(
        result.resumed
          ? "Your saved attempt is ready."
          : "Listening practice started.",
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
      const token = await getUserToken();
      const response = await fetch(
        `/api/practice/listening/attempts/${set.attempt.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
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
      const token = await getUserToken();
      await Promise.all(
        Object.entries(answers).map(async ([questionId, answer]) => {
          const response = await fetch(
            `/api/practice/listening/attempts/${set.attempt!.id}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
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
      const response = await fetch(
        `/api/practice/listening/attempts/${set.attempt.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
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
  if (error || !set)
    return (
      <DashboardPageFrame>
        <DashboardPageHeader
          eyebrow="IELTS Listening"
          title="This practice set is unavailable"
          description="Return to Listening practice or try loading the set again."
          action={
            <Button asChild variant="outline">
              <Link href="/practice/listening">
                <ArrowLeft /> Listening practice
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

  if (!set.attempt)
    return (
      <DashboardPageFrame>
        <DashboardPageHeader
          eyebrow="IELTS Listening"
          title={set.title}
          description={set.description}
          action={
            <Button asChild variant="outline">
              <Link href="/practice/listening">
                <ArrowLeft /> Listening practice
              </Link>
            </Button>
          }
        />
        <section className="mt-10 grid overflow-hidden rounded-2xl border border-border/70 bg-card lg:grid-cols-[1fr_20rem]">
          <div className="p-7 sm:p-10">
            <Headphones className="h-7 w-7 text-primary" />
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
                  Start practice <Headphones />
                </>
              )}
            </Button>
          </div>
          <aside className="border-t border-border/70 bg-muted/35 p-7 lg:border-l lg:border-t-0">
            <h3 className="font-semibold">Before pressing play</h3>
            <ol className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">
              <li>
                <strong className="text-foreground">
                  1. Preview the questions.
                </strong>
                <br />
                Notice the information you need to capture.
              </li>
              <li>
                <strong className="text-foreground">
                  2. Listen for meaning.
                </strong>
                <br />
                Do not stop at every unfamiliar word.
              </li>
              <li>
                <strong className="text-foreground">
                  3. Check after submission.
                </strong>
                <br />
                The transcript stays hidden until you finish.
              </li>
            </ol>
          </aside>
        </section>
      </DashboardPageFrame>
    );

  return (
    <DashboardPageFrame className="max-w-[78rem]">
      <DashboardPageHeader
        eyebrow="IELTS Listening"
        title={set.title}
        description={
          completed
            ? `Completed with ${set.attempt.score} out of ${set.attempt.maxScore}. Review each answer below.`
            : set.instructions
        }
        action={
          <Button asChild variant="outline">
            <Link href="/practice/listening">
              <ArrowLeft /> Listening practice
            </Link>
          </Button>
        }
      />
      <section
        className="mt-6 rounded-2xl border border-border/70 bg-card p-5 sm:p-6"
        aria-label="Listening recording"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
              Practice recording
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Use headphones if possible. The transcript appears after
              submission.
            </p>
          </div>
          <div className="text-sm font-medium">
            {answeredCount} of {questions.length} answered
          </div>
        </div>
        {audioUrl ? (
          <audio
            className="mt-5 w-full"
            controls
            preload="metadata"
            src={audioUrl}
          >
            Your browser does not support audio playback.
          </audio>
        ) : (
          <Button
            className="mt-5"
            variant="outline"
            onClick={() => void loadAudio()}
          >
            <RefreshCw /> Load recording
          </Button>
        )}{" "}
        {!completed && (
          <p
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground"
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
          </p>
        )}
      </section>
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
              Review the transcript and explanations before trying again.
            </p>
          </div>
          <Button onClick={() => void startAttempt()} disabled={starting}>
            {starting ? <Loader2 className="animate-spin" /> : <RotateCcw />}{" "}
            Try again
          </Button>
        </section>
      )}
      <section className="mt-8" aria-labelledby="listening-questions-title">
        <h2
          id="listening-questions-title"
          className="text-2xl font-semibold tracking-[-0.025em]"
        >
          Questions
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Answer from the recording. Questions follow the order of the audio.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
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
      {completed && set.sections.some((section) => section.transcript) && (
        <section className="mt-10 rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            Review resource
          </p>
          <h2 className="mt-3 text-2xl font-semibold">Transcript</h2>
          <div className="mt-5 max-h-[34rem] overflow-y-auto pr-2 text-sm leading-7 text-foreground/90 whitespace-pre-line">
            {set.sections
              .map((section) => section.transcript)
              .filter(Boolean)
              .join("\n\n")}
          </div>
        </section>
      )}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => !submitting && setShowSubmitModal(false)}
        title="Submit your answers?"
      >
        <p className="text-sm leading-6 text-muted-foreground">
          {unansweredCount
            ? `You still have ${unansweredCount} unanswered ${unansweredCount === 1 ? "question" : "questions"}. Unanswered questions will score zero.`
            : "You have answered every question. After submission, you will see your score, explanations, and transcript."}
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
