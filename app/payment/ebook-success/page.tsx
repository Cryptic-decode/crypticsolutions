"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Download, Loader2, Home } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { showError } from "@/lib/utils";

function EbookSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [purchaseStored, setPurchaseStored] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const reference = searchParams.get('reference');

  useEffect(() => {
    // Verify payment and store purchase on mount
    if (reference) {
      handlePaymentSuccess(reference);
    } else {
      // No reference means user shouldn't be here
      router.push('/prompt-engineering-ebook');
    }
  }, [reference, router]);

  const handlePaymentSuccess = async (ref: string) => {
    try {
      setLoading(true);

      // Step 1: Verify payment with Paystack
      const verifyResponse = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference: ref, productId: 'talk-to-ai-like-a-pro' }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Payment verification failed');
      }

      setVerified(true);

      // Step 2: Store purchase in Supabase
      // Store purchase for access verification and manual follow-up
      const storeResponse = await fetch('/api/payment/ebook-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference: ref }),
      });

      const storeData = await storeResponse.json();

      if (!storeResponse.ok) {
        console.error('Failed to store purchase:', storeData.error);
        // Don't block user from downloading if storage fails
        // They can still download, we just won't have the record
      } else {
        setPurchaseStored(true);
      }

      setDownloadReady(true);
    } catch (error: unknown) {
      console.error('Payment success handling error:', error);
      showError(error, 'payment');
      // Redirect back to ebook page on error
      setTimeout(() => {
        router.push('/prompt-engineering-ebook');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!reference) return;
    
    // Download ebook via secure API route
    const downloadUrl = `/api/download/ebook?reference=${encodeURIComponent(reference)}`;
    
    // Use a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'Talk to AI like a PRO.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 text-center">
            {loading && !verified && (
              <div className="py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Verifying your payment...</p>
              </div>
            )}

            {verified && downloadReady && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mb-6"
                >
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                </motion.div>

                <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
                <p className="text-muted-foreground mb-8">
                  Thank you for purchasing <strong>Talk to AI like a Pro</strong>. Your ebook is ready to download.
                </p>

                <div className="space-y-4 mb-6">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-left">
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong className="text-[#1B2242] dark:text-white">What&apos;s next?</strong>
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Click the download button below to get your ebook</li>
                      <li>Save the file to your device for offline reading</li>
                    </ul>
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="lg" 
                    className="w-full mb-4"
                    onClick={handleDownload}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Your Ebook
                  </Button>
                </motion.div>

                <Link 
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Back to Home
                </Link>
              </>
            )}

            {verified && !downloadReady && (
              <div className="py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Preparing your download...</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function EbookSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <EbookSuccessContent />
    </Suspense>
  );
}
