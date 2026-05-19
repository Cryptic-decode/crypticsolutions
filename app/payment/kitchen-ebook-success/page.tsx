"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Download, Home, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  KITCHEN_EBOOK_PDF_FILES,
  KITCHEN_EBOOK_PRODUCTS,
  getKitchenProductFromMetadata,
  type KitchenEbookPart,
  type KitchenEbookProductId,
} from "@/lib/kitchen-ebook-products";
import { showError } from "@/lib/utils";

function downloadPart(reference: string, part: KitchenEbookPart) {
  const fileName = KITCHEN_EBOOK_PDF_FILES[part];
  const downloadUrl = `/api/download/kitchen-ebook?reference=${encodeURIComponent(reference)}&part=${part}`;
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function KitchenEbookSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [productId, setProductId] = useState<KitchenEbookProductId | null>(null);
  const reference = searchParams.get("reference");

  useEffect(() => {
    if (reference) {
      handlePaymentSuccess(reference);
    } else {
      router.push("/from-kitchen-to-cash");
    }
  }, [reference, router]);

  const handlePaymentSuccess = async (ref: string) => {
    try {
      setLoading(true);

      const verifyResponse = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: ref }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.success) {
        throw new Error(verifyData.error || "Payment verification failed");
      }

      setVerified(true);

      const transaction = verifyData.transaction;
      const email = transaction.customer?.email || "";
      const name = transaction.customer?.name || "";
      const resolvedProductId =
        getKitchenProductFromMetadata(transaction.metadata) ||
        (typeof window !== "undefined"
          ? (localStorage.getItem("paystack_kitchen_product_id") as KitchenEbookProductId | null)
          : null);

      if (!resolvedProductId || !KITCHEN_EBOOK_PRODUCTS[resolvedProductId]) {
        throw new Error("Could not determine which ebook you purchased.");
      }

      setProductId(resolvedProductId);

      const storeResponse = await fetch("/api/payment/kitchen-ebook-success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: ref,
          email,
          name,
          amount: transaction.amount / 100,
          currency: transaction.currency || "NGN",
          productId: resolvedProductId,
        }),
      });

      const storeData = await storeResponse.json();

      if (!storeResponse.ok) {
        console.error("Failed to store kitchen ebook purchase:", storeData.error);
      }

      setDownloadReady(true);
    } catch (error: unknown) {
      console.error("Kitchen ebook payment success error:", error);
      showError(error, "payment");
      setTimeout(() => router.push("/from-kitchen-to-cash#checkout"), 3000);
    } finally {
      setLoading(false);
    }
  };

  const product = productId ? KITCHEN_EBOOK_PRODUCTS[productId] : null;
  const isBundle = productId === "from-kitchen-to-cash-bundle";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#F5E6D3] flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md p-8 text-center border-orange-300 bg-gradient-to-br from-orange-50 to-amber-100 shadow-lg">
        {loading && !verified && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12"
          >
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-700" />
            <p className="text-orange-900/80">Verifying your payment...</p>
          </motion.div>
        )}

        {verified && downloadReady && product && reference && (
          <>
            <div className="mx-auto w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-orange-700" />
            </div>
            <h1 className="text-2xl font-bold text-orange-950 mb-2">Payment successful</h1>
            <p className="text-orange-900/80 mb-6">
              Thank you for purchasing <strong>{product.name}</strong>. Your PDF
              {isBundle ? "s are" : " is"} ready to download.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-3"
            >
              {isBundle ? (
                <>
                  <Button
                    size="lg"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={() => downloadPart(reference, "part-one")}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Part One
                  </Button>
                  <Button
                    size="lg"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={() => downloadPart(reference, "part-two")}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Part Two
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() =>
                    downloadPart(
                      reference,
                      productId === "from-kitchen-to-cash-part-two" ? "part-two" : "part-one"
                    )
                  }
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download your PDF
                </Button>
              )}
            </motion.div>

            <Link
              href="/from-kitchen-to-cash"
              className="inline-flex items-center gap-2 text-sm text-orange-800/80 hover:text-orange-900 mt-6"
            >
              <Home className="h-4 w-4" />
              Back to ebook page
            </Link>
          </>
        )}
      </Card>
    </motion.div>
  );
}

export default function KitchenEbookSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5E6D3] flex items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-700" />
        </div>
      }
    >
      <KitchenEbookSuccessContent />
    </Suspense>
  );
}
