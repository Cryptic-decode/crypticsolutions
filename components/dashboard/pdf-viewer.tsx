"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { getErrorMessage, toLocalDateStr } from "@/lib/utils";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { Worker } from "@react-pdf-viewer/core";

// Import PDF viewer styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// ─── Constants ──────────────────────────────────────────────────────────────
/** Save progress & study-session at most once per N ms. */
const SAVE_DEBOUNCE_MS = 2_000;
/** Periodically save progress even if the user is idle on the same page. */
const IDLE_SAVE_INTERVAL_MS = 15_000;

interface PDFViewerProps {
  productId: string;
  userEmail: string;
  productName: string;
  userName?: string;
}

// Dynamically import PDF viewer (client-side only)
const Viewer = dynamic(
  () => import("@react-pdf-viewer/core").then((mod) => mod.Viewer),
  { ssr: false },
);

export function PDFViewer({
  productId,
  userEmail,
  productName,
  userName,
}: PDFViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [initialPage, setInitialPage] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [viewerReady, setViewerReady] = useState(false);
  const [pdfNightMode, setPdfNightMode] = useState(false);

  // ── Refs (avoid stale closures, avoid re-renders) ────────────────────────
  const userIdRef = useRef<string | null>(null);
  const readingStartTimeRef = useRef<number>(Date.now());
  const initialReadSecondsRef = useRef<number>(0);
  const currentPageRef = useRef<number>(0);
  const idleSaveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const defaultLayoutPluginInstance = useRef(defaultLayoutPlugin()).current;

  // ── Study session helpers ─────────────────────────────────────────────────

  /** Record (or update) today's study session for this user+product. */
  const upsertStudySession = useCallback(
    async (durationSeconds: number) => {
      const userId = userIdRef.current;
      if (!userId) return;
      try {
        const todayLocal = toLocalDateStr(new Date());
        await supabase.from("study_sessions").upsert(
          {
            user_id: userId,
            product_id: productId,
            session_date: todayLocal,
            duration_seconds: durationSeconds,
          },
          {
            onConflict: "user_id,product_id,session_date",
            ignoreDuplicates: false,
          },
        );
      } catch {
        // Non-critical — silently ignore
      }
    },
    [productId],
  );

  // ── Progress persistence ──────────────────────────────────────────────────

  /** Persist reading progress + study session. Called by the debounced save. */
  const persistProgress = useCallback(
    async (page: number) => {
      const userId = userIdRef.current;
      if (!userId) return;

      try {
        const now = Date.now();
        const elapsedSeconds = Math.max(
          0,
          Math.floor((now - readingStartTimeRef.current) / 1000),
        );
        const totalSeconds = initialReadSecondsRef.current + elapsedSeconds;

        await supabase
          .from("reading_progress")
          .upsert(
            {
              user_id: userId,
              product_id: productId,
              last_page: page,
              total_read_seconds: totalSeconds,
            },
            { onConflict: "user_id,product_id" },
          );

        // Also update today's study session with accumulated reading time
        await upsertStudySession(elapsedSeconds);
      } catch {
        // Silently ignore so reading isn't disrupted
      }
    },
    [productId, upsertStudySession],
  );

  // ── Debounced save ───────────────────────────────────────────────────────

  const debouncedSaveRef = useRef<((page: number) => void) | null>(null);

  useEffect(() => {
    let lastSaveTime = 0;
    let pendingPage: number | null = null;
    let pendingTimer: ReturnType<typeof setTimeout> | null = null;

    debouncedSaveRef.current = (page: number) => {
      pendingPage = page;
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTime;

      if (timeSinceLastSave >= SAVE_DEBOUNCE_MS) {
        lastSaveTime = now;
        persistProgress(page);
        if (pendingTimer) {
          clearTimeout(pendingTimer);
          pendingTimer = null;
        }
      } else if (!pendingTimer) {
        pendingTimer = setTimeout(() => {
          lastSaveTime = Date.now();
          if (pendingPage !== null) persistProgress(pendingPage);
          pendingTimer = null;
        }, SAVE_DEBOUNCE_MS - timeSinceLastSave);
      }
    };

    return () => {
      if (pendingTimer) clearTimeout(pendingTimer);
    };
  }, [persistProgress]);

  // ── Idle save interval ───────────────────────────────────────────────────

  useEffect(() => {
    idleSaveIntervalRef.current = setInterval(() => {
      const page = currentPageRef.current;
      if (userIdRef.current != null) {
        debouncedSaveRef.current?.(page);
      }
    }, IDLE_SAVE_INTERVAL_MS);

    return () => {
      if (idleSaveIntervalRef.current) clearInterval(idleSaveIntervalRef.current);
    };
  }, []);

  // ── Keyboard shortcuts (arrow keys only) ─────────────────────────────────

  useEffect(() => {
    if (!viewerReady) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      // Save progress on page navigation via keyboard
      if (
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown"
      ) {
        debouncedSaveRef.current?.(currentPageRef.current);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [viewerReady]);

  // ── Save on unmount ──────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (userIdRef.current != null) {
        persistProgress(currentPageRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Init ─────────────────────────────────────────────────────────────────

  const initializeViewer = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("Authentication required. Please sign in again.");
        setLoading(false);
        return;
      }

      const userId = session.user?.id as string | undefined;
      if (userId) {
        userIdRef.current = userId;

        const { data: progressRows } = await supabase
          .from("reading_progress")
          .select("last_page, total_read_seconds")
          .eq("user_id", userId)
          .eq("product_id", productId)
          .limit(1);

        if (progressRows && progressRows.length > 0) {
          const progress = progressRows[0] as {
            last_page: number | null;
            total_read_seconds: number | null;
          };

          if (typeof progress.last_page === "number" && progress.last_page >= 0) {
            setInitialPage(progress.last_page);
            setCurrentPage(progress.last_page);
            currentPageRef.current = progress.last_page;
          }
          if (
            typeof progress.total_read_seconds === "number" &&
            progress.total_read_seconds >= 0
          ) {
            initialReadSecondsRef.current = progress.total_read_seconds;
          }
        }
      }

      readingStartTimeRef.current = Date.now();
      setAuthToken(session.access_token);

      // Create a study-session row for today immediately (streak tracking)
      upsertStudySession(0);

      setPdfUrl(`/api/course/${productId}/pdf`);
      setMounted(true);
      setLoading(false);
    } catch {
      setError("Failed to initialize PDF viewer. Please refresh the page.");
      setLoading(false);
    }
  }, [productId, upsertStudySession]);

  useEffect(() => {
    initializeViewer();
  }, [initializeViewer]);

  // ── Theme sync ───────────────────────────────────────────────────────────

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // ── Security handlers ────────────────────────────────────────────────────

  useEffect(() => {
    if (!mounted) return;

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "p" || e.key === "s" || e.key === "a")
      ) {
        e.preventDefault();
      }
      if (e.key === "F12" || e.key === "PrintScreen") {
        e.preventDefault();
      }
    };
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();
    const handleDragStart = (e: DragEvent) => e.preventDefault();
    const handleBeforePrint = (e: BeforeUnloadEvent) => e.preventDefault();

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("dragstart", handleDragStart);
    window.addEventListener("beforeprint", handleBeforePrint);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("beforeprint", handleBeforePrint);
    };
  }, [mounted]);

  // ── Loading state (simple spinner — matches original UX) ─────────────────

  if (!mounted || loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading PDF viewer...</p>
          </div>
        </div>
      </Card>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-destructive font-medium mb-2">{error}</p>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            If the problem persists, please contact support.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setError(null);
              setLoading(true);
              initializeViewer();
            }}
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!pdfUrl || !authToken) return null;

  // ── Render ───────────────────────────────────────────────────────────────

  const workerUrl =
    "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

  // Watermark styles - extracted for maintainability
  const watermarkContainerStyle: React.CSSProperties = {
    position: "absolute",
    top: "0.8rem",
    right: "1.8rem",
    pointerEvents: "none",
    zIndex: 10,
  };

  const getWatermarkTextStyle = (scale: number): React.CSSProperties => ({
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    fontSize: `${0.5 * scale}rem`,
    fontWeight: 700,
    letterSpacing: "0.02em",
    color: "rgba(0, 0, 0, 0.28)",
    userSelect: "none",
    WebkitUserSelect: "none",
    textAlign: "right",
    lineHeight: "1.4",
  });

  const renderPage = (props: any) => (
    <>
      {props.canvasLayer.children}
      <div style={watermarkContainerStyle}>
        <div style={getWatermarkTextStyle(props.scale || 1)}>
          <div>{userName || "User"}</div>
          <div style={{ fontSize: "0.85em", marginTop: "0.01rem" }}>
            {userEmail || "Cryptic Solutions"}
          </div>
        </div>
      </div>
      {props.annotationLayer.children}
      {props.textLayer.children}
    </>
  );

  return (
    <div className={`w-full ${isDark ? "dark" : ""}`}>
      <Card className="p-0 overflow-hidden ring-1 ring-border/60 dark:ring-border/40 rounded-lg">
        <div className="h-[calc(100vh-300px)] min-h-[600px] no-select bg-secondary/10 dark:bg-secondary/20 relative">
          {/* Overlay while the viewer is preparing the correct page */}
          {!viewerReady && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-secondary/10 dark:bg-secondary/20">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Preparing your last reading position...
                </p>
              </div>
            </div>
          )}

          {/* Night-mode toggle — simple icon-only button */}
          <button
            onClick={() => setPdfNightMode((p) => !p)}
            className={`absolute top-3 left-3 z-30 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all shadow-sm ${
              pdfNightMode
                ? "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800"
                : "bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800"
            }`}
            title={pdfNightMode ? "Disable night mode" : "Enable night mode"}
          >
            {pdfNightMode ? "☀" : "🌙"}
          </button>

          {/* Night mode wrapper */}
          <div
            className={
              pdfNightMode
                ? "[&_.rpv-core__viewer]:invert-[0.9] [&_.rpv-core__viewer]:hue-rotate-180"
                : ""
            }
          >
            <Worker workerUrl={workerUrl}>
              <Viewer
                fileUrl={pdfUrl}
                httpHeaders={{
                  Authorization: `Bearer ${authToken}`,
                }}
                plugins={[defaultLayoutPluginInstance]}
                renderPage={renderPage}
                defaultScale={1.0}
                initialPage={initialPage ?? 0}
                onDocumentLoad={() => {
                  setLoading(false);
                  setError(null);
                  setViewerReady(true);
                }}
                onPageChange={(event: any) => {
                  const nextPage =
                    typeof event.currentPage === "number" && event.currentPage >= 0
                      ? event.currentPage
                      : 0;
                  setCurrentPage(nextPage);
                  currentPageRef.current = nextPage;
                  debouncedSaveRef.current?.(nextPage);
                }}
              />
            </Worker>
          </div>
        </div>
      </Card>
    </div>
  );
}
