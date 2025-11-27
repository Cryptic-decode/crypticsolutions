"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { motion } from "framer-motion";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js App Router error page for the /dashboard route.
 * Catches errors in child routes and displays a user-friendly UI.
 */
export default function DashboardError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Dashboard error:", error);
    }
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 border-destructive/20 bg-destructive/5 dark:bg-destructive/10">
          <div className="text-center">
            {/* Error Icon */}
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>

            {/* Error Message */}
            <h3 className="text-xl font-semibold mb-2 text-[#1B2242] dark:text-white">
              Something went wrong
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              We encountered an unexpected error. Please try again or return to the dashboard.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={reset} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/dashboard")}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </div>

            {/* Error Details (dev only) */}
            {process.env.NODE_ENV === "development" && (
              <details className="mt-6 text-left">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  Error details (dev only)
                </summary>
                <pre className="mt-2 p-3 bg-secondary/50 rounded-lg text-xs overflow-auto max-h-32 text-destructive">
                  {error.message}
                  {error.digest && `\nDigest: ${error.digest}`}
                </pre>
              </details>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

