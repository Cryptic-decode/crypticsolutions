"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, BookOpen, BarChart3, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
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

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth();
  const { purchases, loading: purchasesLoading } = usePurchases();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [user, authLoading, router]);

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

  const completedPurchases = purchases.filter(p => p.status === 'completed');

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl"
      >
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Study Progress</h1>
              <p className="text-muted-foreground">Track your learning journey</p>
            </div>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >
          {/* Summary Stats */}
          <motion.div variants={itemVariants}>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Courses</p>
                    <p className="text-2xl font-bold text-[#1B2242] dark:text-white">
                      {completedPurchases.length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Learning</p>
                    <p className="text-2xl font-bold text-[#1B2242] dark:text-white">
                      {completedPurchases.length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Study Time</p>
                    <p className="text-2xl font-bold text-[#1B2242] dark:text-white">
                      Coming Soon
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Course Progress */}
          {completedPurchases.length === 0 ? (
            <motion.div variants={itemVariants}>
              <Card className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Progress Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start learning by purchasing a course and begin your journey.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Browse Courses
                </Link>
              </Card>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants}>
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Your Courses</h2>
                <div className="space-y-4">
                  {completedPurchases.map((purchase) => {
                    const product = productNames[purchase.product_id] || {
                      name: purchase.product_id,
                      description: 'Course',
                    };

                    return (
                      <div
                        key={purchase.id}
                        className="p-4 rounded-lg bg-secondary/20 border border-secondary/40"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-[#1B2242] dark:text-white">
                                {product.name}
                              </h3>
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {product.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Purchased on {new Date(purchase.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar Placeholder */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              Progress
                            </span>
                            <span className="text-sm font-medium text-muted-foreground">
                              Not tracked yet
                            </span>
                          </div>
                          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: '0%' }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Progress tracking will be available soon
                          </p>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Link
                            href={`/course/${purchase.product_id}`}
                            className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-center"
                          >
                            Continue Learning
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

