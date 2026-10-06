"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createReferralCodeSuggestions,
  normalizeReferralCode,
  PARTNER_AUDIENCE_DESCRIPTION_MAX_LENGTH,
  PARTNER_AUDIENCE_DESCRIPTION_MIN_LENGTH,
  partnerTypeLabels,
  payoutScheduleLabels,
} from "@/lib/partner-program";

const fieldClassName =
  "mt-2 min-h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const initialForm = {
  partnerType: "individual",
  fullName: "",
  organisationName: "",
  email: "",
  phone: "",
  website: "",
  audienceDescription: "",
  payoutSchedule: "biweekly",
  referralCode: "",
  acceptedTerms: false,
  middleName: "",
};

export function PartnerApplicationForm() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const suggestionSource = form.organisationName || form.fullName;
  const selectedPartnerType = form.partnerType as keyof typeof partnerTypeLabels;
  const selectedPartnerTypeLabel = partnerTypeLabels[selectedPartnerType];
  const requiresEntityName = selectedPartnerType !== "individual";
  const audienceDescriptionLength = form.audienceDescription.length;
  const audienceCharactersRemaining = Math.max(
    PARTNER_AUDIENCE_DESCRIPTION_MIN_LENGTH - audienceDescriptionLength,
    0,
  );
  const suggestions = useMemo(
    () => createReferralCodeSuggestions(suggestionSource),
    [suggestionSource],
  );

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/partners/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "We could not submit your application. Please try again.");
      }

      setSubmitted(true);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not submit your application. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-primary/25 bg-primary/[0.06] p-7 sm:p-9" role="status">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">Application received</h3>
        <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
          Thank you for applying. We will review your information and contact you before activating your referral code.
        </p>
        <div className="mt-6 rounded-lg border border-border/70 bg-background/70 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Requested referral code</p>
          <p className="mt-2 font-mono text-lg font-semibold text-primary">{form.referralCode}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={submitting}>
      <fieldset
        disabled={submitting}
        className="min-w-0 space-y-6 border-0 p-0 transition-opacity disabled:cursor-wait disabled:opacity-65"
      >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="partnerType">Applying as</Label>
          <select
            id="partnerType"
            value={form.partnerType}
            onChange={(event) => update("partnerType", event.target.value)}
            className={fieldClassName}
          >
            {Object.entries(partnerTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            name="name"
            autoComplete="name"
            value={form.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            placeholder="Your full name"
            className="mt-2 h-12"
            required
          />
        </div>
      </div>

      {requiresEntityName && (
        <div>
          <Label htmlFor="organisationName">{selectedPartnerTypeLabel} name</Label>
          <Input
            id="organisationName"
            autoComplete="organization"
            value={form.organisationName}
            onChange={(event) => update("organisationName", event.target.value)}
            placeholder={`Your ${selectedPartnerTypeLabel.toLowerCase()} name`}
            className="mt-2 h-12"
            required
          />
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="partnerEmail">Email address</Label>
          <Input
            id="partnerEmail"
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
          <Label htmlFor="partnerPhone">Phone or WhatsApp number</Label>
          <Input
            id="partnerPhone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="+234..."
            className="mt-2 h-12"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="partnerWebsite">Website or social page <span className="text-muted-foreground">(optional)</span></Label>
        <Input
          id="partnerWebsite"
          type="url"
          autoComplete="url"
          value={form.website}
          onChange={(event) => update("website", event.target.value)}
          placeholder="https://"
          className="mt-2 h-12"
        />
      </div>

      <div>
        <Label htmlFor="audienceDescription">How do you reach potential IELTS candidates?</Label>
        <textarea
          id="audienceDescription"
          value={form.audienceDescription}
          onChange={(event) => update("audienceDescription", event.target.value)}
          placeholder="Tell us about your students, community, clients, or audience."
          rows={5}
          minLength={PARTNER_AUDIENCE_DESCRIPTION_MIN_LENGTH}
          maxLength={PARTNER_AUDIENCE_DESCRIPTION_MAX_LENGTH}
          aria-describedby="audienceDescriptionHelp"
          aria-invalid={audienceDescriptionLength > 0 && audienceCharactersRemaining > 0}
          className={fieldClassName}
          required
        />
        <div
          id="audienceDescriptionHelp"
          className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs"
        >
          <p className={audienceDescriptionLength > 0 && audienceCharactersRemaining > 0 ? "text-destructive" : "text-muted-foreground"}>
            {audienceCharactersRemaining > 0
              ? audienceDescriptionLength > 0
                ? `${audienceCharactersRemaining} more character${audienceCharactersRemaining === 1 ? "" : "s"} needed.`
                : `Minimum ${PARTNER_AUDIENCE_DESCRIPTION_MIN_LENGTH} characters.`
              : "Description length looks good."}
          </p>
          <p className="text-muted-foreground">
            {audienceDescriptionLength}/{PARTNER_AUDIENCE_DESCRIPTION_MAX_LENGTH}
          </p>
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Preferred payout schedule</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {Object.entries(payoutScheduleLabels).map(([value, label]) => (
            <label
              key={value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                form.payoutSchedule === value
                  ? "border-primary bg-primary/[0.06]"
                  : "border-border/70 bg-background hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name="payoutSchedule"
                value={value}
                checked={form.payoutSchedule === value}
                onChange={(event) => update("payoutSchedule", event.target.value)}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm font-medium">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <Label htmlFor="referralCode">Preferred referral code</Label>
        <Input
          id="referralCode"
          value={form.referralCode}
          onChange={(event) => update("referralCode", normalizeReferralCode(event.target.value))}
          placeholder="YOURCODE"
          minLength={4}
          maxLength={20}
          pattern="[A-Z0-9][A-Z0-9-]{2,18}[A-Z0-9]"
          className="mt-2 h-12 font-mono uppercase"
          required
        />
        <p className="mt-2 text-xs leading-5 text-muted-foreground">Use 4 to 20 letters, numbers, or hyphens. Your code becomes active after approval.</p>
        {suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Referral code suggestions">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => update("referralCode", suggestion)}
                className="rounded-md border border-border/70 bg-background px-3 py-2 font-mono text-xs transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="hidden" aria-hidden="true">
        <Label htmlFor="middleName">Middle name</Label>
        <Input
          id="middleName"
          tabIndex={-1}
          autoComplete="off"
          value={form.middleName}
          onChange={(event) => update("middleName", event.target.value)}
        />
      </div>

      <label className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
        <input
          type="checkbox"
          checked={form.acceptedTerms}
          onChange={(event) => update("acceptedTerms", event.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-primary"
          required
        />
        <span>I confirm that this information is accurate and understand that referral codes become active only after approval.</span>
      </label>

      {error && (
        <div className="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      <Button type="submit" size="lg" className="h-12 w-full sm:w-auto" disabled={submitting}>
        {submitting ? <><Loader2 className="animate-spin" /> Submitting application</> : "Submit application"}
      </Button>
      </fieldset>
    </form>
  );
}
