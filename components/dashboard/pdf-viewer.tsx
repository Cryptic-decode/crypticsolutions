"use client";

import { useState, useEffect } from "react";
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

interface PDFViewerProps {
  pdfUrl: string;
  userEmail: string;
  productName: string;
}

// Dynamically import react-pdf only on client side
const PDFDocument = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  { ssr: false }
);

const PDFPage = dynamic(
  () => import("react-pdf").then((mod) => mod.Page),
  { ssr: false }
);

export function PDFViewer({ pdfUrl, userEmail, productName }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [pdfVersion, setPdfVersion] = useState<string>("");

  // Set up PDF.js worker only on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("react-pdf").then((mod) => {
        const { pdfjs } = mod;
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        setPdfVersion(pdfjs.version);
        setMounted(true);
      });
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      setLoading(true);
      setError(null);
    }
  }, [pdfUrl, mounted]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error("PDF load error:", error);
    setError("Failed to load PDF. Please try again.");
    setLoading(false);
  }

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(2.0, prev + 0.25));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(0.5, prev - 0.25));
  };

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Watermark text
  const watermarkText = `${userEmail} - ${productName}`;

  // Prevent right-click and context menu
  useEffect(() => {
    if (!mounted) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+S, Ctrl+P, Ctrl+A, F12, Print Screen
      if (
        (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'a')) ||
        e.key === 'F12' ||
        (e.key === 'PrintScreen')
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mounted]);

  // Show placeholder during SSR
  if (!mounted) {
    return (
      <div className="w-full">
        <div className="relative w-full bg-secondary/10 rounded-lg overflow-hidden min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Initializing PDF viewer...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full" 
      style={{ userSelect: 'none' }} 
      onContextMenu={(e) => e.preventDefault()}
      data-pdf-viewer
    >
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 p-4 bg-secondary/20 rounded-lg flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm font-medium px-3">
            Page {pageNumber} of {numPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="flex items-center gap-1"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-2 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 2.0}
            className="flex items-center gap-1"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={rotate}
            className="flex items-center gap-1"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Viewer Container */}
      <div className="relative w-full bg-secondary/10 rounded-lg overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                setLoading(true);
              }}
            >
              Retry
            </Button>
          </div>
        )}

        {/* PDF Document with Watermark Overlay */}
        {mounted && pdfVersion && (
          <div className="relative w-full flex justify-center overflow-auto max-h-[calc(100vh-300px)]">
            <div className="relative">
              <PDFDocument
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading PDF...</p>
                  </div>
                }
                options={{
                  cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfVersion}/cmaps/`,
                  cMapPacked: true,
                }}
              >
                <div className="relative">
                  <PDFPage
                    pageNumber={pageNumber}
                    scale={scale}
                    rotate={rotation}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="shadow-lg"
                  />
                  {/* Watermark Overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none select-none"
                    style={{
                      background: `repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 200px,
                        rgba(0, 0, 0, 0.03) 200px,
                        rgba(0, 0, 0, 0.03) 201px
                      )`,
                    }}
                  >
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        transform: "rotate(-45deg)",
                        fontSize: "24px",
                        color: "rgba(0, 0, 0, 0.1)",
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                        userSelect: "none",
                      }}
                    >
                      {watermarkText}
                    </div>
                  </div>
                </div>
              </PDFDocument>
            </div>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
          This document is watermarked with your email address. Downloading and printing are disabled for security purposes.
        </p>
      </div>
    </div>
  );
}

