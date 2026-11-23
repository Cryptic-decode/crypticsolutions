"use client";

import { CheckCircle2, Loader2, Youtube } from "lucide-react";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MOBILE_VIDEO_EDITING_PLAYLIST_URL,
  mobileVideoExperienceLabels,
} from "@/lib/mobile-video-editing-program";

const fieldClassName =
  "mt-2 min-h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  experienceLevel: "new",
  learningGoal: "",
  acceptedUpdates: false,
  middleName: "",
};

export function MobileVideoRegistrationForm() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailSent, setEmailSent] = useState(true);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [error, setError] = useState("");

  const update = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/mobile-video-editing/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          result.error || "We could not complete your registration. Please try again.",
        );
      }

      setEmailSent(result.emailSent !== false);
      setAlreadyRegistered(result.alreadyRegistered === true);
      setSubmitted(true);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not complete your registration. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="rounded-2xl border border-primary/25 bg-primary/[0.06] p-7 sm:p-9"
        role="status"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">
          You are registered
        </h3>
        <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
          {alreadyRegistered
            ? "This email is already registered. You can continue with the tutorial below."
            : emailSent
            ? `We sent the learning link to ${form.email}. You can also begin now.`
            : "Your registration is saved, but the email is delayed. You can begin with the tutorial below."}
        </p>
        <Button asChild className="mt-6 h-12 px-5">
          <a
            href={MOBILE_VIDEO_EDITING_PLAYLIST_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Youtube /> Start the free tutorial
          </a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={submitting}>
      <fieldset
        disabled={submitting}
        className="min-w-0 space-y-6 border-0 p-0 transition-opacity disabled:cursor-wait disabled:opacity-65"
      >
        <div>
          <Label htmlFor="mobileVideoFullName">Full name</Label>
          <Input
            id="mobileVideoFullName"
            autoComplete="name"
            value={form.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            placeholder="Your full name"
            className="mt-2 h-12"
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="mobileVideoEmail">Email address</Label>
            <Input
              id="mobileVideoEmail"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              placeholder="you@example.com"
              className="mt-2 h-12"
              required
            />
          </div>
          <div>
            <Label htmlFor="mobileVideoPhone">
              Phone or WhatsApp <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="mobileVideoPhone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
              placeholder="+234..."
              className="mt-2 h-12"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="mobileVideoExperience">Current editing experience</Label>
          <select
            id="mobileVideoExperience"
            value={form.experienceLevel}
            onChange={(event) => update("experienceLevel", event.target.value)}
            className={fieldClassName}
          >
            {Object.entries(mobileVideoExperienceLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-end justify-between gap-3">
            <Label htmlFor="mobileVideoGoal">
              What would you like to create?{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <span className="text-xs text-muted-foreground">
              {form.learningGoal.length}/400
            </span>
          </div>
          <textarea
            id="mobileVideoGoal"
            value={form.learningGoal}
            onChange={(event) => update("learningGoal", event.target.value)}
            placeholder="Tell us what you hope to learn or create."
            maxLength={400}
            rows={4}
            className={fieldClassName}
          />
        </div>

        <label className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
          <input
            type="checkbox"
            checked={form.acceptedUpdates}
            onChange={(event) => update("acceptedUpdates", event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-input accent-primary"
            required
          />
          <span>
            I agree to receive programme learning materials and essential updates by
            email.
          </span>
        </label>

        <div className="sr-only" aria-hidden="true">
          <Label htmlFor="mobileVideoMiddleName">Middle name</Label>
          <Input
            id="mobileVideoMiddleName"
            tabIndex={-1}
            autoComplete="off"
            value={form.middleName}
            onChange={(event) => update("middleName", event.target.value)}
          />
        </div>

        {error && (
          <p
            className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}

        <Button type="submit" className="h-12 w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="animate-spin" /> Registering
            </>
          ) : (
            "Register and start learning"
          )}
        </Button>
      </fieldset>
    </form>
  );
}
