"use client";

import { useAuth } from "@/lib/auth";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, BookOpen, ArrowLeft, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePurchases } from "@/lib/hooks/use-purchases";

// Animation variants following design guide
const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Product name mapping
const productNames: Record<string, { name: string; description: string }> = {
  'ielts-manual': {
    name: 'IELTS Preparation Manual',
    description: 'Complete study guide for IELTS exam',
  },
};

export default function CourseViewPage() {
  const { user, loading: authLoading } = useAuth();
  const { purchases, loading: purchasesLoading } = usePurchases();
  const router = useRouter();
  const params = useParams();
  const productId = params?.productId as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [user, authLoading, router]);

  // Check if user has access to this product
  const hasAccess = purchases.some(
    (purchase) => purchase.product_id === productId && purchase.status === 'completed'
  );

  const product = productNames[productId] || {
    name: productId,
    description: 'Course content',
  };

  if (authLoading || purchasesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  // If user doesn't have access, show error
  if (!hasAccess) {
    return (
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <Card className="p-6 border-destructive/20 bg-destructive/5">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-destructive mb-2">
                  Access Denied
                </h2>
                <p className="text-muted-foreground mb-4">
                  You don't have access to this course. Please purchase it first to continue.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl"
      >
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Course Content</h2>
              <p className="text-muted-foreground mb-4">
                Content viewer is currently unavailable.
              </p>
              <div className="bg-secondary/20 rounded-lg p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  We’re preparing a new, more reliable reader. Please check back soon.
                </p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

