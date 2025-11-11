"use client";

import { useState, useEffect } from "react";
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
}: PDFViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  // Per library docs: call plugin factory at top-level of component (it uses hooks)
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // Load plugin module and get auth token
  useEffect(() => {
    const init = async () => {
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
        console.error("PDF viewer initialization error:", err);
        setError("Failed to initialize PDF viewer. Please refresh the page.");
        setLoading(false);
      }
    };

    init();
  }, [productId]);

  // Handle PDF load errors
  const handleDocumentLoadError = (error: any) => {
    console.error("PDF load error:", error);
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
              // Re-initialize
              const init = async () => {
                const {
                  data: { session },
                } = await supabase.auth.getSession();
                if (session?.access_token) {
                  setAuthToken(session.access_token);
                  setPdfUrl(`/api/course/${productId}/pdf`);
                  setLoading(false);
                }
              };
              init();
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

  return (
    <div className="w-full">
      <Card className="p-0 overflow-hidden">
        <div className="h-[calc(100vh-300px)] min-h-[600px]">
          <Worker workerUrl={workerUrl}>
            <Viewer
              fileUrl={pdfUrl}
              httpHeaders={{
                Authorization: `Bearer ${authToken}`,
              }}
              plugins={[defaultLayoutPluginInstance]}
              onDocumentLoad={() => {
                setLoading(false);
                setError(null);
              }}
              onLoadError={handleDocumentLoadError}
            />
          </Worker>
        </div>
      </Card>
    </div>
  );
}

