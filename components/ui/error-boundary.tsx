"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback to render instead of the default UI */
  fallback?: ReactNode;
  /** Called when an error is caught (for logging, etc.) */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors in child components.
 * Displays a user-friendly fallback UI with retry and navigation options.
 * Follows existing Card and Button patterns from the design guide.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Call optional error handler (for logging to external service)
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI following existing design patterns
      return (
        <div className="grid min-h-[28rem] place-items-center p-6">
          <section className="w-full max-w-lg rounded-xl border border-destructive/25 bg-destructive/5 p-7 sm:p-9" aria-labelledby="component-error-title">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <h2 id="component-error-title" className="mt-4 text-xl font-semibold">This section could not load</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Try rendering it again. If the problem continues, return to your library.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    onClick={this.handleRetry}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try again
                  </Button>
                  <Button asChild variant="outline"><a href="/dashboard">Return to library</a></Button>
                </div>

                {/* Error Details (collapsed, for debugging) */}
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <details className="mt-6">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      Error details (dev only)
                    </summary>
                    <pre className="mt-2 p-3 bg-secondary/50 rounded-lg text-xs overflow-auto max-h-32 text-destructive">
                      {this.state.error.message}
                      {"\n"}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
          </section>
        </div>
      );
    }

    return this.props.children;
  }
}
