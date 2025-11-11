"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { Worker } from "@react-pdf-viewer/core";

// Import PDF viewer styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

interface PDFViewerProps {
  productId: string;
  userEmail: string;
  productName: string;
  userName?: string;
}

// Dynamically import PDF viewer (client-side only)
const Viewer = dynamic(
  () => import("@react-pdf-viewer/core").then((mod) => mod.Viewer),
  { ssr: false }
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
  // Per library docs: call plugin factory at top-level of component (it uses hooks)
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // Initialize PDF viewer - extracted for reusability
  const initializeViewer = useCallback(async () => {
    try {
      // Get session token for API authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("Authentication required. Please sign in again.");
        setLoading(false);
        return;
      }

      setAuthToken(session.access_token);

      // Construct PDF URL with auth token
      const apiUrl = `/api/course/${productId}/pdf`;
      setPdfUrl(apiUrl);
      setMounted(true);
      setLoading(false);
    } catch (err: any) {
      // Handle initialization errors gracefully
      setError("Failed to initialize PDF viewer. Please refresh the page.");
      setLoading(false);
    }
  }, [productId]);

  // Load plugin module and get auth token
  useEffect(() => {
    initializeViewer();
  }, [initializeViewer]);

  // Sync dark theme with dashboard
  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Security event handlers - extracted for better organization
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Block Ctrl+P (Print), Ctrl+S (Save), Ctrl+A (Select All)
    if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "s" || e.key === "a")) {
      e.preventDefault();
      return false;
    }
    // Block F12 (DevTools), Print Screen
    if (e.key === "F12" || e.key === "PrintScreen") {
      e.preventDefault();
      return false;
    }
  };

  const handleCopy = (e: ClipboardEvent) => {
    e.preventDefault();
    return false;
  };

  const handleDragStart = (e: DragEvent) => {
    e.preventDefault();
    return false;
  };

  const handleBeforePrint = (e: BeforeUnloadEvent) => {
    e.preventDefault();
  };

  // Security: Disable right-click, keyboard shortcuts, and print
  useEffect(() => {
    if (!mounted) return;

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

  // Handle PDF load errors
  const handleDocumentLoadError = (error: any) => {
    let errorMessage = "Failed to load PDF. Please try again.";

    const errorStr = String(error?.message || error?.toString() || "");

    if (errorStr.includes("404") || errorStr.includes("not found")) {
      errorMessage = "PDF file not found. Please contact support.";
    } else if (errorStr.includes("403") || errorStr.includes("Access denied")) {
      errorMessage = "Access denied. Please ensure you have purchased this course.";
    } else if (errorStr.includes("401") || errorStr.includes("Authentication")) {
      errorMessage = "Authentication required. Please sign in again.";
    } else if (errorStr.includes("Network") || errorStr.includes("CORS")) {
      errorMessage = "Network error. Please check your connection and try again.";
    }

    setError(errorMessage);
    setLoading(false);
  };

  // Show loading state during SSR or initialization
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

  // Show error state
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

  // Render PDF viewer
  if (!pdfUrl || !authToken) {
    return null;
  }

  // Worker URL - using CDN for reliability (compatible with @react-pdf-viewer/core v3.12.0)
  const workerUrl = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

  // Watermark styles - extracted for maintainability
  const watermarkContainerStyle: React.CSSProperties = {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    pointerEvents: "none",
    zIndex: 10,
  };

  const getWatermarkTextStyle = (scale: number): React.CSSProperties => ({
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    fontSize: `${0.7 * scale}rem`,
    fontWeight: 700,
    letterSpacing: "0.02em",
    color: "rgba(0, 0, 0, 0.2)",
    userSelect: "none",
    WebkitUserSelect: "none",
    textAlign: "right",
    lineHeight: "1.4",
  });

  const watermarkEmailStyle: React.CSSProperties = {
    fontSize: "0.85em",
    marginTop: "0.01rem",
  };

  // Per-page watermark renderer (visible, top-right corner)
  const renderPage = (props: any) => (
    <>
      {props.canvasLayer.children}
      <div style={watermarkContainerStyle}>
        <div style={getWatermarkTextStyle(props.scale || 1)}>
          <div>{userName || "User"}</div>
          <div style={watermarkEmailStyle}>
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
          <Worker workerUrl={workerUrl}>
            <Viewer
              fileUrl={pdfUrl}
              httpHeaders={{
                Authorization: `Bearer ${authToken}`,
              }}
              plugins={[defaultLayoutPluginInstance]}
              renderPage={renderPage}
              defaultScale={1.0}
              onDocumentLoad={(e) => {
                setLoading(false);
                setError(null);
              }}
            />
          </Worker>
        </div>
      </Card>
    </div>
  );
}

