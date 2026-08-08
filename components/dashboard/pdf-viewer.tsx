"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { AlertCircle, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { toLocalDateStr } from "@/lib/utils";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { Worker, type PageChangeEvent, type RenderPageProps } from "@react-pdf-viewer/core";

// Import PDF viewer styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// ─── Constants ──────────────────────────────────────────────────────────────
const SAVE_DEBOUNCE_MS = 2_000;
const IDLE_SAVE_INTERVAL_MS = 15_000;

interface PDFViewerProps {
  productId: string;
  userEmail: string;
  userName?: string;
}

const Viewer = dynamic(
  () => import("@react-pdf-viewer/core").then((mod) => mod.Viewer),
  { ssr: false },
);

export function PDFViewer({
  productId,
  userEmail,
  userName,
}: PDFViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [initialPage, setInitialPage] = useState<number | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const userIdRef = useRef<string | null>(null);
  const readingStartTimeRef = useRef<number>(Date.now());
  const initialReadSecondsRef = useRef<number>(0);
  const currentPageRef = useRef<number>(0);
  const idleSaveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const defaultLayoutPluginInstance = useRef(defaultLayoutPlugin()).current;

  // ── Study session ────────────────────────────────────────────────────────

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
          { onConflict: "user_id,product_id,session_date", ignoreDuplicates: false },
        );
      } catch { /* non-critical */ }
    },
    [productId],
  );

  // ── Progress persistence ─────────────────────────────────────────────────

  const persistProgress = useCallback(
    async (page: number) => {
      const userId = userIdRef.current;
      if (!userId) return;
      try {
        setSaveStatus("saving");
        const now = Date.now();
        const elapsedSeconds = Math.max(0, Math.floor((now - readingStartTimeRef.current) / 1000));
        const totalSeconds = initialReadSecondsRef.current + elapsedSeconds;

        await supabase
          .from("reading_progress")
          .upsert(
            { user_id: userId, product_id: productId, last_page: page, total_read_seconds: totalSeconds },
            { onConflict: "user_id,product_id" },
          );

        await upsertStudySession(elapsedSeconds);
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
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
        if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }
      } else if (!pendingTimer) {
        pendingTimer = setTimeout(() => {
          lastSaveTime = Date.now();
          if (pendingPage !== null) persistProgress(pendingPage);
          pendingTimer = null;
        }, SAVE_DEBOUNCE_MS - timeSinceLastSave);
      }
    };

    return () => { if (pendingTimer) clearTimeout(pendingTimer); };
  }, [persistProgress]);

  // ── Idle save interval ───────────────────────────────────────────────────

  useEffect(() => {
    idleSaveIntervalRef.current = setInterval(() => {
      const page = currentPageRef.current;
      if (userIdRef.current != null) debouncedSaveRef.current?.(page);
    }, IDLE_SAVE_INTERVAL_MS);
    return () => { if (idleSaveIntervalRef.current) clearInterval(idleSaveIntervalRef.current); };
  }, []);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────

  useEffect(() => {
    if (!viewerReady) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        debouncedSaveRef.current?.(currentPageRef.current);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [viewerReady]);

  // ── Save on unmount ──────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (userIdRef.current != null) persistProgress(currentPageRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Init ─────────────────────────────────────────────────────────────────

  const initializeViewer = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
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
          const p = progressRows[0] as { last_page: number | null; total_read_seconds: number | null };
          if (typeof p.last_page === "number" && p.last_page >= 0) {
            setInitialPage(p.last_page);
            currentPageRef.current = p.last_page;
            setCurrentPage(p.last_page + 1);
          }
          if (typeof p.total_read_seconds === "number" && p.total_read_seconds >= 0) {
            initialReadSecondsRef.current = p.total_read_seconds;
          }
        }
      }

      readingStartTimeRef.current = Date.now();
      setAuthToken(session.access_token);
      upsertStudySession(0);
      setPdfUrl(`/api/course/${productId}/pdf`);
      setMounted(true);
      setLoading(false);
    } catch {
      setError("Failed to initialize PDF viewer. Please refresh the page.");
      setLoading(false);
    }
  }, [productId, upsertStudySession]);

  useEffect(() => { initializeViewer(); }, [initializeViewer]);

  // ── Theme sync ───────────────────────────────────────────────────────────

  useEffect(() => {
    const updateTheme = () => setIsDark(document.documentElement.classList.contains("dark"));
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // ── Security handlers ────────────────────────────────────────────────────

  useEffect(() => {
    if (!mounted) return;

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["p", "s", "a"].includes(e.key)) e.preventDefault();
      if (e.key === "F12" || e.key === "PrintScreen") e.preventDefault();
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

  // ── Loading state ────────────────────────────────────────────────────────

  if (!mounted || loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border/70" aria-busy="true" aria-label="Preparing protected reader">
        <div className="flex h-14 items-center gap-3 border-b border-border/70 px-4"><Skeleton className="h-8 w-24" /><Skeleton className="h-8 w-20" /><Skeleton className="ml-auto h-5 w-32" /></div>
        <div className="grid min-h-[32rem] place-items-center bg-muted/25 p-8">
          <Skeleton className="h-[28rem] w-full max-w-sm rounded-md" />
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────

  if (error) {
    return (
      <section className="grid min-h-[28rem] place-items-center rounded-xl border border-destructive/25 bg-destructive/5 p-7" aria-labelledby="reader-error-title">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto h-7 w-7 text-destructive" />
          <h2 id="reader-error-title" className="mt-4 text-xl font-semibold">The reader could not open</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => { setError(null); setLoading(true); initializeViewer(); }}
          >
            <RefreshCw /> Try again
          </Button>
        </div>
      </section>
    );
  }

  if (!pdfUrl || !authToken) return null;

  // ── Render ───────────────────────────────────────────────────────────────

  const workerUrl = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

  const watermarkContainerStyle: React.CSSProperties = {
    position: "absolute", top: "0.8rem", right: "1.8rem",
    pointerEvents: "none", zIndex: 10,
  };

  const getWatermarkTextStyle = (scale: number): React.CSSProperties => ({
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    fontSize: `${0.5 * scale}rem`,
    fontWeight: 700,
    letterSpacing: "0.02em",
    color: "rgba(0, 0, 0, 0.28)",
    userSelect: "none", WebkitUserSelect: "none",
    textAlign: "right", lineHeight: "1.4",
  });

  const renderPage = (props: RenderPageProps) => (
    <>
      {props.canvasLayer.children}
      <div style={watermarkContainerStyle}>
        <div style={getWatermarkTextStyle(props.scale || 1)}>
          <div>{userName || "User"}</div>
          <div style={{ fontSize: "0.85em", marginTop: "0.01rem" }}>{userEmail || "Cryptic Solutions"}</div>
        </div>
      </div>
      {props.annotationLayer.children}
      {props.textLayer.children}
    </>
  );

  return (
    <div className={`w-full overflow-hidden rounded-xl border border-border/70 bg-card ${isDark ? "dark" : ""}`}>
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-2 text-xs text-muted-foreground" aria-live="polite">
        <span className="tabular-nums">Page {currentPage}</span>
        <span className={`inline-flex items-center gap-1.5 ${saveStatus === "error" ? "text-destructive" : ""}`}>
          {saveStatus === "saved" && <Check className="h-3.5 w-3.5 text-primary" />}
          {saveStatus === "saving" ? "Saving progress" : saveStatus === "error" ? "Progress will retry while you read" : saveStatus === "saved" ? "Progress saved" : "Progress saves automatically"}
        </span>
      </div>
        <div className="relative h-[calc(100dvh-16rem)] min-h-[32rem] no-select bg-muted/25 dark:bg-muted/15">
          {/* Overlay while viewer is preparing */}
          {!viewerReady && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-background/85 p-8 backdrop-blur-sm">
              <div className="w-full max-w-sm space-y-4 text-center">
                <Skeleton className="mx-auto h-[24rem] w-full rounded-md" />
                <p className="text-sm text-muted-foreground">Restoring your last reading position</p>
              </div>
            </div>
          )}

          <Worker workerUrl={workerUrl}>
            <Viewer
              fileUrl={pdfUrl}
              httpHeaders={{ Authorization: `Bearer ${authToken}` }}
              plugins={[defaultLayoutPluginInstance]}
              renderPage={renderPage}
              defaultScale={1.0}
              initialPage={initialPage ?? 0}
              onDocumentLoad={() => {
                setLoading(false);
                setError(null);
                setViewerReady(true);
              }}
              onPageChange={(event: PageChangeEvent) => {
                const nextPage = typeof event.currentPage === "number" && event.currentPage >= 0
                  ? event.currentPage : 0;
                currentPageRef.current = nextPage;
                setCurrentPage(nextPage + 1);
                debouncedSaveRef.current?.(nextPage);
              }}
            />
          </Worker>
        </div>
    </div>
  );
}
