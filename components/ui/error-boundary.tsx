"use client";

import { Component, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { motion } from "framer-motion";

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

  handleGoHome = (): void => {
    window.location.href = "/dashboard";
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI following existing design patterns
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
                  <Button
                    onClick={this.handleRetry}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={this.handleGoHome}
                    className="flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Go to Dashboard
                  </Button>
                </div>

                {/* Error Details (collapsed, for debugging) */}
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <details className="mt-6 text-left">
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
              </div>
            </Card>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

