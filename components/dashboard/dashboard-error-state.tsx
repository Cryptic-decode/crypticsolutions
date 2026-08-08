"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardErrorStateProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function DashboardErrorState({ error, reset }: DashboardErrorStateProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Dashboard error:", error);
    }
  }, [error]);

  return (
    <main className="grid min-h-[calc(100dvh-4rem)] place-items-center p-6">
      <section className="w-full max-w-lg rounded-xl border border-destructive/20 bg-destructive/5 p-7 sm:p-9" aria-labelledby="dashboard-error-title">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-destructive/10">
          <AlertCircle className="h-5 w-5 text-destructive" />
        </div>
        <h1 id="dashboard-error-title" className="text-2xl font-semibold tracking-tight">We could not load this page</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Try loading it again. If the problem continues, return to your library and choose another section.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Return to library</Link>
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-7 text-left">
            <summary className="cursor-pointer text-xs text-muted-foreground">Development details</summary>
            <pre className="mt-2 max-h-32 overflow-auto rounded-md bg-muted p-3 text-xs text-destructive">{error.message}{error.digest && `\nDigest: ${error.digest}`}</pre>
          </details>
        )}
      </section>
    </main>
  );
}
