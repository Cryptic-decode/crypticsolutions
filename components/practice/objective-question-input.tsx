"use client";

import { CheckCircle2, XCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { ReadingAttemptReviewItem, ReadingQuestion } from "@/lib/practice";
import { cn } from "@/lib/utils";

export function ObjectiveQuestionInput({
  question,
  value,
  disabled,
  review,
  onChange,
  onBlur,
}: {
  question: ReadingQuestion;
  value: string;
  disabled: boolean;
  review?: ReadingAttemptReviewItem;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <fieldset
      className="rounded-xl border border-border/70 bg-card p-5 sm:p-6"
      disabled={disabled}
    >
      <legend className="sr-only">{question.prompt}</legend>
      <div className="flex items-start gap-3">
        <span className="grid h-7 min-w-7 place-items-center rounded-full bg-muted text-xs font-semibold">
          {question.position + 1}
        </span>
        <p className="pt-0.5 text-sm font-medium leading-6">
          {question.prompt}
        </p>
      </div>

      {question.type === "single_choice" ? (
        <div className="mt-5 space-y-2.5">
          {question.options.map((option) => (
            <label
              key={option}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 text-sm leading-6 transition-colors",
                value === option
                  ? "border-primary/45 bg-primary/8"
                  : "border-border/70 hover:bg-muted/45",
                disabled && "cursor-default",
              )}
            >
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                className="mt-1 accent-[var(--primary)]"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="mt-5">
          <label
            htmlFor={`answer-${question.id}`}
            className="text-xs font-medium text-muted-foreground"
          >
            Your answer
          </label>
          <Input
            id={`answer-${question.id}`}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            placeholder="Type a short answer"
            maxLength={500}
            className="mt-2 h-12"
          />
        </div>
      )}

      {review && (
        <div
          className={cn(
            "mt-5 rounded-lg border p-4",
            review.isCorrect
              ? "border-primary/25 bg-primary/8"
              : "border-destructive/20 bg-destructive/5",
          )}
        >
          <p
            className={cn(
              "flex items-center gap-2 text-sm font-semibold",
              review.isCorrect ? "text-primary" : "text-destructive",
            )}
          >
            {review.isCorrect ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {review.isCorrect ? "Correct" : "Review this answer"}
          </p>
          {!review.isCorrect && (
            <p className="mt-2 text-sm">
              <span className="font-medium">Correct answer:</span>{" "}
              {review.correctAnswer}
            </p>
          )}
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {review.explanation}
          </p>
        </div>
      )}
    </fieldset>
  );
}
