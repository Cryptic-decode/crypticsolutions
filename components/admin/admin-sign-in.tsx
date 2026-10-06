"use client";

import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export function AdminSignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="grid min-h-screen bg-background text-foreground lg:grid-cols-[.85fr_1.15fr]">
      <section className="grid content-start justify-items-center px-5 py-8 sm:px-8 lg:py-10">
        <div className="w-full max-w-md">
          <Image src="/cryptic-assets/fullLogo.png" alt="Cryptic Solutions" width={150} height={38} className="h-9 w-auto dark:hidden" priority />
          <Image src="/cryptic-assets/fullLogo2.png" alt="Cryptic Solutions" width={150} height={38} className="hidden h-9 w-auto dark:block" priority />
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-primary">Administration</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Sign in to the admin portal.</h1>
          <p className="mt-3 leading-7 text-muted-foreground">Use your Cryptic Solutions administrator account.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div><Label htmlFor="adminEmail">Email address</Label><Input id="adminEmail" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-12" required /></div>
            <div>
              <Label htmlFor="adminPassword">Password</Label>
              <div className="relative mt-2">
                <Input id="adminPassword" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 pr-12" required />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <div role="alert" className="rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
            <Button type="submit" size="lg" className="h-12 w-full" disabled={submitting}>{submitting ? <><Loader2 className="animate-spin" /> Signing in</> : "Sign in"}</Button>
          </form>
        </div>
      </section>
      <aside className="hidden items-center justify-center border-l border-border/60 bg-[#0d0f0c] p-12 text-white lg:flex">
        <div className="max-w-md"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15"><LockKeyhole className="h-6 w-6 text-primary" /></span><h2 className="mt-8 text-4xl font-semibold tracking-[-0.045em]">One secure place for internal operations.</h2><p className="mt-5 leading-7 text-white/60">Review partner applications today. Add other administrative tools only when the business needs them.</p></div>
      </aside>
    </main>
  );
}
