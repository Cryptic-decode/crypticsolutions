"use client";

import { Toaster } from "react-hot-toast";

/**
 * Global toast notification provider
 * Configured to match Cryptic Solutions design system
 * Positioned at top-right corner of the screen
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--card)",
          color: "var(--card-foreground)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "12px 16px",
          fontSize: "14px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        },
        success: {
          iconTheme: {
            primary: "var(--primary)",
            secondary: "var(--primary-foreground)",
          },
          style: {
            borderColor: "var(--primary)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--destructive)",
            secondary: "var(--card)",
          },
          style: {
            borderColor: "var(--destructive)",
          },
        },
      }}
    />
  );
}

