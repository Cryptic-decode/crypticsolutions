"use client";

import {
  Archive,
  BookOpenCheck,
  CheckCircle2,
  Eye,
  Loader2,
  Pencil,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  DashboardPageFrame,
  DashboardPageHeader,
  DashboardSectionHeader,
} from "@/components/dashboard/dashboard-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { showError, showSuccess } from "@/lib/utils";

type SetStatus = "draft" | "published" | "archived";

interface PracticeSetSummary {
  id: string;
  title: string;
  description: string;
  status: SetStatus;
  durationMinutes: number | null;
  questionCount: number;
  attemptCount: number;
  createdAt: string;
  publishedAt: string | null;
}

interface PracticeSetDetail {
  id: string;
  title: string;
  description: string;
  instructions: string;
  status: SetStatus;
  duration_minutes: number | null;
  practice_sections: Array<{
    id: string;
    title: string;
    source_text: string;
    position: number;
    practice_questions: Array<{
      id: string;
      question_type: string;
      prompt: string;
      options: string[];
      position: number;
      practice_answer_keys:
        | Array<{
            correct_answer: { acceptedValues?: string[] };
            explanation: string;
          }>
        | {
            correct_answer: { acceptedValues?: string[] };
            explanation: string;
          };
    }>;
  }>;
}

async function getAdminToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token)
    throw new Error("Your admin session has expired. Please sign in again.");
  return session.access_token;
}

function statusClasses(status: SetStatus) {
  if (status === "published")
    return "border-primary/25 bg-primary/10 text-primary";
  if (status === "archived")
    return "border-border bg-muted text-muted-foreground";
  return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300";
}

function getAnswerKey(
  question: PracticeSetDetail["practice_sections"][number]["practice_questions"][number],
) {
  return Array.isArray(question.practice_answer_keys)
    ? question.practice_answer_keys[0]
    : question.practice_answer_keys;
}

function AdminPracticeSkeleton() {
  return (
    <DashboardPageFrame
      aria-busy="true"
      aria-label="Loading Reading practice administration"
    >
      <div className="space-y-3 border-b border-border/70 pb-8">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-[32rem] max-w-full" />
      </div>
      <Skeleton className="mt-10 h-72 rounded-2xl" />
      <Skeleton className="mt-10 h-60 rounded-2xl" />
    </DashboardPageFrame>
  );
}

export function ReadingPracticeAdmin() {
  const [sets, setSets] = useState<PracticeSetSummary[] | null>(null);
  const [error, setError] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("standard");
  const [questionCount, setQuestionCount] = useState("8");
  const [generating, setGenerating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<PracticeSetDetail | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PracticeSetSummary | null>(
    null,
  );

  const loadSets = useCallback(async () => {
    setError("");
    try {
      const token = await getAdminToken();
      const response = await fetch("/api/admin/practice/reading", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          result.error || "Reading practice content could not be loaded.",
        );
      setSets(result.sets);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Reading practice content could not be loaded.",
      );
    }
  }, []);

  useEffect(() => {
    void loadSets();
  }, [loadSets]);

  const generateDraft = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGenerating(true);
    try {
      const token = await getAdminToken();
      const response = await fetch("/api/admin/practice/reading/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          difficulty,
          questionCount: Number(questionCount),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          result.error || "The Reading draft could not be generated.",
        );
      showSuccess(
        "Reading draft created. Review it carefully before publishing.",
      );
      setTopic("");
      await loadSets();
      await openPreview(result.setId);
    } catch (generationError) {
      showError(generationError);
    } finally {
      setGenerating(false);
    }
  };

  const openPreview = async (setId: string) => {
    setPreviewLoading(true);
    try {
      const token = await getAdminToken();
      const response = await fetch(`/api/admin/practice/reading/${setId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          result.error || "The Reading draft could not be opened.",
        );
      setPreview(result.set);
      setEditing(false);
    } catch (previewError) {
      showError(previewError);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreview(null);
    setEditing(false);
  };

  const updatePreviewQuestion = (
    sectionId: string,
    questionId: string,
    update: (
      question: PracticeSetDetail["practice_sections"][number]["practice_questions"][number],
    ) => PracticeSetDetail["practice_sections"][number]["practice_questions"][number],
  ) => {
    setPreview((current) =>
      current
        ? {
            ...current,
            practice_sections: current.practice_sections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    practice_questions: section.practice_questions.map(
                      (question) =>
                        question.id === questionId
                          ? update(question)
                          : question,
                    ),
                  }
                : section,
            ),
          }
        : current,
    );
  };

  const saveDraft = async () => {
    if (!preview) return;
    const section = preview.practice_sections[0];
    if (!section) return;
    setSaving(true);
    try {
      const token = await getAdminToken();
      const response = await fetch(
        `/api/admin/practice/reading/${preview.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: preview.title,
            description: preview.description,
            instructions: preview.instructions,
            durationMinutes: preview.duration_minutes ?? 30,
            section: {
              id: section.id,
              title: section.title,
              passage: section.source_text,
            },
            questions: section.practice_questions.map((question) => {
              const key = getAnswerKey(question);
              return {
                id: question.id,
                prompt: question.prompt,
                options: question.options,
                acceptedAnswers: key?.correct_answer?.acceptedValues ?? [],
                explanation: key?.explanation ?? "",
              };
            }),
          }),
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          result.error || "The Reading draft could not be saved.",
        );
      showSuccess("Reading draft saved.");
      setEditing(false);
      await loadSets();
    } catch (saveError) {
      showError(saveError);
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (setId: string, status: SetStatus) => {
    setUpdatingId(setId);
    try {
      const token = await getAdminToken();
      const response = await fetch(`/api/admin/practice/reading/${setId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          result.error || "The practice status could not be updated.",
        );
      showSuccess(
        status === "published"
          ? "Reading practice published."
          : status === "archived"
            ? "Reading practice archived."
            : "Reading practice returned to draft.",
      );
      setPreview(null);
      await loadSets();
    } catch (statusError) {
      showError(statusError);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteSet = async () => {
    if (!deleteTarget) return;
    setUpdatingId(deleteTarget.id);
    try {
      const token = await getAdminToken();
      const response = await fetch(
        `/api/admin/practice/reading/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          result.error || "The Reading practice set could not be deleted.",
        );
      showSuccess("Reading practice set deleted.");
      setDeleteTarget(null);
      await loadSets();
    } catch (deleteError) {
      showError(deleteError);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminShell>
      {!sets && !error ? (
        <AdminPracticeSkeleton />
      ) : (
        <DashboardPageFrame>
          <DashboardPageHeader
            eyebrow="Practice content"
            title="Reading practice"
            description="Generate original drafts with Google AI, review every passage and answer, then publish only the sets you approve."
            action={
              <Button asChild variant="outline">
                <Link href="/admin/practice/listening">Listening practice</Link>
              </Button>
            }
          />

          {error && (
            <section
              className="mt-8 rounded-xl border border-destructive/25 bg-destructive/5 p-6"
              role="alert"
            >
              <h2 className="font-semibold">
                We could not load Reading practice
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <Button
                className="mt-5"
                variant="outline"
                onClick={() => void loadSets()}
              >
                <RefreshCw /> Try again
              </Button>
            </section>
          )}

          {sets && (
            <>
              <section
                className="mt-10 grid overflow-hidden rounded-2xl border border-border/70 bg-card lg:grid-cols-[1.2fr_0.8fr]"
                aria-labelledby="generate-reading-title"
              >
                <form className="p-6 sm:p-8" onSubmit={generateDraft}>
                  <fieldset
                    disabled={generating}
                    className="space-y-5 border-0 p-0 disabled:cursor-wait disabled:opacity-70"
                  >
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                        AI-assisted draft
                      </p>
                      <h2
                        id="generate-reading-title"
                        className="mt-3 text-2xl font-semibold tracking-[-0.025em]"
                      >
                        Create a Reading practice set
                      </h2>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                        The result stays in draft until you inspect the passage,
                        questions, accepted answers, and explanations.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="reading-topic">Passage topic</Label>
                      <Input
                        id="reading-topic"
                        value={topic}
                        onChange={(event) => setTopic(event.target.value)}
                        placeholder="For example, urban farming"
                        minLength={3}
                        maxLength={100}
                        required
                        className="mt-2 h-12"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="reading-difficulty">Difficulty</Label>
                        <select
                          id="reading-difficulty"
                          value={difficulty}
                          onChange={(event) =>
                            setDifficulty(event.target.value)
                          }
                          className="mt-2 h-12 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="foundation">Foundation</option>
                          <option value="standard">Standard</option>
                          <option value="challenging">Challenging</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="reading-question-count">
                          Questions
                        </Label>
                        <select
                          id="reading-question-count"
                          value={questionCount}
                          onChange={(event) =>
                            setQuestionCount(event.target.value)
                          }
                          className="mt-2 h-12 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="6">6 questions</option>
                          <option value="8">8 questions</option>
                          <option value="10">10 questions</option>
                        </select>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="animate-spin" /> Generating draft
                        </>
                      ) : (
                        <>
                          <Sparkles /> Generate draft
                        </>
                      )}
                    </Button>
                  </fieldset>
                </form>
                <aside className="border-t border-border/70 bg-muted/35 p-6 lg:border-l lg:border-t-0 sm:p-8">
                  <BookOpenCheck className="h-6 w-6 text-primary" />
                  <h3 className="mt-5 font-semibold">Publication checklist</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                    <li>
                      Confirm the passage is original, clear, and
                      self-contained.
                    </li>
                    <li>Answer every question using only the passage.</li>
                    <li>
                      Check that each accepted answer and explanation is
                      accurate.
                    </li>
                    <li>Publish only after the full set has been reviewed.</li>
                  </ul>
                </aside>
              </section>

              <section className="mt-12" aria-labelledby="reading-drafts-title">
                <DashboardSectionHeader
                  title="Reading sets"
                  description={`${sets.length} ${sets.length === 1 ? "set" : "sets"} created.`}
                />
                {sets.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center sm:p-10">
                    <Sparkles className="mx-auto h-6 w-6 text-primary" />
                    <h3 className="mt-4 font-semibold">No Reading sets yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Generate the first draft above. Nothing is published
                      automatically.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sets.map((set) => (
                      <article
                        key={set.id}
                        className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6"
                      >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusClasses(set.status)}`}
                              >
                                {set.status}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {set.questionCount} questions
                              </span>
                              {set.durationMinutes && (
                                <span className="text-xs text-muted-foreground">
                                  {set.durationMinutes} minutes
                                </span>
                              )}
                              {set.attemptCount > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {set.attemptCount} attempts
                                </span>
                              )}
                            </div>
                            <h3 className="mt-3 text-lg font-semibold">
                              {set.title}
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                              {set.description}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              onClick={() => void openPreview(set.id)}
                              disabled={previewLoading || updatingId === set.id}
                            >
                              {previewLoading ? (
                                <Loader2 className="animate-spin" />
                              ) : (
                                <Eye />
                              )}{" "}
                              Review
                            </Button>
                            {set.status !== "published" && (
                              <Button
                                onClick={() =>
                                  void updateStatus(set.id, "published")
                                }
                                disabled={updatingId === set.id}
                              >
                                <CheckCircle2 /> Publish
                              </Button>
                            )}
                            {set.status === "published" && (
                              <Button
                                variant="outline"
                                onClick={() =>
                                  void updateStatus(set.id, "archived")
                                }
                                disabled={updatingId === set.id}
                              >
                                <Archive /> Archive
                              </Button>
                            )}
                            {set.status === "archived" && (
                              <Button
                                variant="outline"
                                onClick={() =>
                                  void updateStatus(set.id, "draft")
                                }
                                disabled={updatingId === set.id}
                              >
                                <Pencil /> Return to draft
                              </Button>
                            )}
                            {set.attemptCount === 0 && (
                              <Button
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                                onClick={() => setDeleteTarget(set)}
                                disabled={updatingId === set.id}
                              >
                                <Trash2 /> Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </DashboardPageFrame>
      )}

      <Modal
        isOpen={Boolean(preview)}
        onClose={closePreview}
        title={editing ? "Edit Reading draft" : preview?.title}
        className="max-w-5xl"
      >
        {preview && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span
                className={`rounded-full border px-2.5 py-1 font-medium capitalize ${statusClasses(preview.status)}`}
              >
                {preview.status}
              </span>
              {preview.duration_minutes && (
                <span>{preview.duration_minutes} minutes</span>
              )}
            </div>
            {editing ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="edit-reading-title">Title</Label>
                  <Input
                    id="edit-reading-title"
                    className="mt-2"
                    value={preview.title}
                    onChange={(event) =>
                      setPreview({ ...preview, title: event.target.value })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="edit-reading-description">Description</Label>
                  <textarea
                    id="edit-reading-description"
                    className="mt-2 min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={preview.description}
                    onChange={(event) =>
                      setPreview({
                        ...preview,
                        description: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="edit-reading-instructions">
                    Instructions
                  </Label>
                  <textarea
                    id="edit-reading-instructions"
                    className="mt-2 min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={preview.instructions}
                    onChange={(event) =>
                      setPreview({
                        ...preview,
                        instructions: event.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-reading-duration">
                    Duration in minutes
                  </Label>
                  <Input
                    id="edit-reading-duration"
                    className="mt-2"
                    type="number"
                    min={5}
                    max={180}
                    value={preview.duration_minutes ?? 30}
                    onChange={(event) =>
                      setPreview({
                        ...preview,
                        duration_minutes: Number(event.target.value),
                      })
                    }
                  />
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {preview.description}
                </p>
                <p className="mt-3 rounded-lg bg-muted/50 p-4 text-sm leading-6">
                  {preview.instructions}
                </p>
              </div>
            )}
            {[...preview.practice_sections]
              .sort((a, b) => a.position - b.position)
              .map((section) => (
                <section key={section.id}>
                  {editing ? (
                    <>
                      <Label htmlFor={`section-title-${section.id}`}>
                        Passage title
                      </Label>
                      <Input
                        id={`section-title-${section.id}`}
                        className="mt-2"
                        value={section.title}
                        onChange={(event) =>
                          setPreview({
                            ...preview,
                            practice_sections: preview.practice_sections.map(
                              (item) =>
                                item.id === section.id
                                  ? { ...item, title: event.target.value }
                                  : item,
                            ),
                          })
                        }
                      />
                      <Label
                        htmlFor={`section-passage-${section.id}`}
                        className="mt-4 block"
                      >
                        Passage
                      </Label>
                      <textarea
                        id={`section-passage-${section.id}`}
                        className="mt-2 min-h-80 w-full rounded-xl border border-input bg-background p-5 text-sm leading-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={section.source_text}
                        onChange={(event) =>
                          setPreview({
                            ...preview,
                            practice_sections: preview.practice_sections.map(
                              (item) =>
                                item.id === section.id
                                  ? { ...item, source_text: event.target.value }
                                  : item,
                            ),
                          })
                        }
                      />
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-semibold">{section.title}</h3>
                      <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-border/70 bg-muted/25 p-5 text-sm leading-7 whitespace-pre-line">
                        {section.source_text}
                      </div>
                    </>
                  )}
                  <div className="mt-6 space-y-4">
                    {[...section.practice_questions]
                      .sort((a, b) => a.position - b.position)
                      .map((question, index) => {
                        const key = getAnswerKey(question);
                        return (
                          <article
                            key={question.id}
                            className="rounded-xl border border-border/70 p-5"
                          >
                            <p className="text-xs font-medium uppercase tracking-wide text-primary">
                              Question {index + 1} ·{" "}
                              {question.question_type.replace("_", " ")}
                            </p>
                            {editing ? (
                              <div className="mt-4 space-y-4">
                                <div>
                                  <Label htmlFor={`prompt-${question.id}`}>
                                    Question
                                  </Label>
                                  <textarea
                                    id={`prompt-${question.id}`}
                                    className="mt-2 min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={question.prompt}
                                    onChange={(event) =>
                                      updatePreviewQuestion(
                                        section.id,
                                        question.id,
                                        (item) => ({
                                          ...item,
                                          prompt: event.target.value,
                                        }),
                                      )
                                    }
                                  />
                                </div>
                                {question.options.length > 0 && (
                                  <div>
                                    <Label>Options</Label>
                                    <div className="mt-2 space-y-2">
                                      {question.options.map(
                                        (option, optionIndex) => (
                                          <Input
                                            key={`${question.id}-${optionIndex}`}
                                            aria-label={`Option ${optionIndex + 1}`}
                                            value={option}
                                            onChange={(event) =>
                                              updatePreviewQuestion(
                                                section.id,
                                                question.id,
                                                (item) => ({
                                                  ...item,
                                                  options: item.options.map(
                                                    (value, indexToUpdate) =>
                                                      indexToUpdate ===
                                                      optionIndex
                                                        ? event.target.value
                                                        : value,
                                                  ),
                                                }),
                                              )
                                            }
                                          />
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <Label htmlFor={`answers-${question.id}`}>
                                    Accepted answers, one per line
                                  </Label>
                                  <textarea
                                    id={`answers-${question.id}`}
                                    className="mt-2 min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={
                                      key?.correct_answer?.acceptedValues?.join(
                                        "\n",
                                      ) ?? ""
                                    }
                                    onChange={(event) =>
                                      updatePreviewQuestion(
                                        section.id,
                                        question.id,
                                        (item) => {
                                          const currentKey = getAnswerKey(item);
                                          const nextKey = {
                                            ...currentKey,
                                            correct_answer: {
                                              acceptedValues: event.target.value
                                                .split("\n")
                                                .map((value) => value.trim())
                                                .filter(Boolean),
                                            },
                                            explanation:
                                              currentKey?.explanation ?? "",
                                          };
                                          return {
                                            ...item,
                                            practice_answer_keys: Array.isArray(
                                              item.practice_answer_keys,
                                            )
                                              ? [nextKey]
                                              : nextKey,
                                          };
                                        },
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`explanation-${question.id}`}>
                                    Explanation
                                  </Label>
                                  <textarea
                                    id={`explanation-${question.id}`}
                                    className="mt-2 min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={key?.explanation ?? ""}
                                    onChange={(event) =>
                                      updatePreviewQuestion(
                                        section.id,
                                        question.id,
                                        (item) => {
                                          const currentKey = getAnswerKey(item);
                                          const nextKey = {
                                            ...currentKey,
                                            correct_answer: {
                                              acceptedValues:
                                                currentKey?.correct_answer
                                                  ?.acceptedValues ?? [],
                                            },
                                            explanation: event.target.value,
                                          };
                                          return {
                                            ...item,
                                            practice_answer_keys: Array.isArray(
                                              item.practice_answer_keys,
                                            )
                                              ? [nextKey]
                                              : nextKey,
                                          };
                                        },
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="mt-2 font-medium leading-6">
                                  {question.prompt}
                                </p>
                                {question.options.length > 0 && (
                                  <ol className="mt-3 list-[upper-alpha] space-y-1 pl-5 text-sm text-muted-foreground">
                                    {question.options.map((option) => (
                                      <li key={option}>{option}</li>
                                    ))}
                                  </ol>
                                )}
                                <div className="mt-4 rounded-lg bg-primary/8 p-4 text-sm">
                                  <p>
                                    <strong>Accepted answer:</strong>{" "}
                                    {key?.correct_answer?.acceptedValues?.join(
                                      ", ",
                                    ) || "Missing"}
                                  </p>
                                  <p className="mt-2 leading-6 text-muted-foreground">
                                    {key?.explanation ||
                                      "No explanation provided."}
                                  </p>
                                </div>
                              </>
                            )}
                          </article>
                        );
                      })}
                  </div>
                </section>
              ))}
            <div className="flex flex-wrap justify-end gap-2 border-t border-border/70 pt-5">
              <Button variant="outline" onClick={closePreview}>
                {editing ? "Cancel changes" : "Close review"}
              </Button>
              {!editing && preview.status === "draft" && (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <Pencil /> Edit draft
                </Button>
              )}
              {editing && (
                <Button onClick={() => void saveDraft()} disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" /> : <Save />}{" "}
                  Save draft
                </Button>
              )}
              {!editing && preview.status === "archived" && (
                <Button
                  variant="outline"
                  onClick={() => void updateStatus(preview.id, "draft")}
                  disabled={updatingId === preview.id}
                >
                  <Pencil /> Return to draft
                </Button>
              )}
              {!editing && preview.status !== "published" && (
                <Button
                  onClick={() => void updateStatus(preview.id, "published")}
                  disabled={updatingId === preview.id}
                >
                  <CheckCircle2 /> Publish approved set
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Reading set?"
      >
        <p className="text-sm leading-6 text-muted-foreground">
          This permanently removes{" "}
          <strong className="text-foreground">{deleteTarget?.title}</strong>.
          Published sets with learner attempts cannot be deleted.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => void deleteSet()}
            disabled={updatingId === deleteTarget?.id}
          >
            {updatingId === deleteTarget?.id ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Trash2 />
            )}{" "}
            Delete set
          </Button>
        </div>
      </Modal>
    </AdminShell>
  );
}
