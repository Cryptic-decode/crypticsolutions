"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export function AdminSignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user.app_metadata?.role === "admin") {
        router.replace("/admin/dashboard");
        return;
      }
      setChecking(false);
    });
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError || !data.user) {
      setError("The email or password is incorrect.");
      setSubmitting(false);
      return;
    }
    if (data.user.app_metadata?.role !== "admin") {
      await supabase.auth.signOut();
      setError("This account does not have administrator access.");
      setSubmitting(false);
      return;
    }

    router.replace("/admin/dashboard");
  };

  if (checking) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Checking admin session" /></div>;
  }

  return (
    <AuthShell
      eyebrow="Administration"
      title="Admin sign in"
      description="Use your Cryptic Solutions administrator account."
      footer={
        <Link href="/" className="font-medium text-primary hover:underline">
          Return to the main website
        </Link>
      }
    >
      <form onSubmit={handleSubmit}>
        <fieldset disabled={submitting} className="space-y-5 border-0 p-0 disabled:cursor-wait disabled:opacity-70">
          <div>
            <Label htmlFor="adminEmail">Email address</Label>
            <Input
              id="adminEmail"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 h-12"
              required
            />
          </div>
          <PasswordField id="adminPassword" value={password} onChange={setPassword} />
          {error && (
            <div role="alert" className="rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <Button type="submit" size="lg" className="h-12 w-full">
            {submitting ? <><Loader2 className="animate-spin" /> Signing in</> : "Sign in"}
          </Button>
        </fieldset>
      </form>
    </AuthShell>
  );
}
