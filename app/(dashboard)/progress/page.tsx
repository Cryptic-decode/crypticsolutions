"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { BookOpen, BarChart3, TrendingUp, Clock, CheckCircle2, Flame } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePurchases } from "@/lib/hooks/use-purchases";
import { useReadingProgress } from "@/lib/hooks/use-reading-progress";
import {
  getCourseProductIds,
  getProductInfo,
  formatReadingTime,
} from "@/lib/products";
import { useStudyStreak } from "@/lib/hooks/use-study-streak";
import { Skeleton, SkeletonCard, SkeletonStatCard } from "@/components/ui/skeleton";

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

// Only show course-type purchases on the progress page.
const courseProductIds = getCourseProductIds();

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth();
  const { purchases, loading: purchasesLoading } = usePurchases();
  const { progress, loading: progressLoading, getProgressForProduct } = useReadingProgress();
  const { currentStreak, longestStreak, totalStudyDays, loading: streakLoading } = useStudyStreak();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [user, authLoading, router]);

  // Compute derived data (placed before early returns to respect Rules of Hooks)
  const completedPurchases = useMemo(
    () => purchases.filter((p) => p.status === 'completed'),
    [purchases]
  );
  const coursePurchases = useMemo(
    () => completedPurchases.filter((p) => courseProductIds.has(p.product_id)),
    [completedPurchases]
  );
  // Calculate total study time across all courses
  const totalStudySeconds = progress.reduce((sum, p) => sum + p.total_read_seconds, 0);
  // Count courses with any progress
  const activeCoursesCount = progress.filter((p) => p.last_page > 0 || p.total_read_seconds > 0).length;

  if (authLoading || purchasesLoading || progressLoading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center gap-3 mb-8">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* Stat grid skeleton */}
          <div className="grid gap-4 md:grid-cols-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>

          {/* Course cards skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

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
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Courses</p>
                    <p className="text-2xl font-bold text-[#1B2242] dark:text-white">
                      {coursePurchases.length}
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
                      {activeCoursesCount}
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
                      {totalStudySeconds > 0 ? formatReadingTime(totalStudySeconds) : "0 min"}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Streak Card */}
              <Card className={`p-6 ${currentStreak > 0 ? 'bg-gradient-to-br from-orange-50/70 to-amber-50/30 dark:from-orange-950/20 dark:to-amber-950/10' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    currentStreak > 0
                      ? 'bg-gradient-to-br from-orange-400 to-amber-500'
                      : 'bg-secondary/40'
                  }`}>
                    <Flame className={`h-6 w-6 ${currentStreak > 0 ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {currentStreak > 0 ? 'Current Streak' : 'Streak'}
                    </p>
                    <p className="text-2xl font-bold text-[#1B2242] dark:text-white">
                      {currentStreak > 0
                        ? `${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}`
                        : totalStudyDays > 0
                        ? `${totalStudyDays} study days`
                        : 'Not started'}
                    </p>
                    {longestStreak > currentStreak && currentStreak > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Best: {longestStreak} days
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Streak Details (loads independently so stats aren't blocked) */}
          {!streakLoading && currentStreak === 0 && totalStudyDays === 0 && (
            <motion.div variants={itemVariants}>
              <Card className="p-5 border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-secondary/40 flex items-center justify-center flex-shrink-0">
                    <Flame className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No study days yet. Open your course and start reading to begin tracking your streak.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Course Progress */}
          {coursePurchases.length === 0 ? (
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
                  {coursePurchases.map((purchase) => {
                      const product = getProductInfo(purchase.product_id) ?? {
                        id: purchase.product_id,
                        name: purchase.product_id,
                        description: 'Course',
                        type: 'course' as const,
                        totalPages: 100,
                      };
                      const totalPages = product.totalPages ?? 100;
                      const readingProgress = getProgressForProduct(purchase.product_id);
                      const progressPercent = readingProgress
                        ? Math.min(100, Math.round(((readingProgress.last_page + 1) / totalPages) * 100))
                        : 0;
                      const hasProgress = readingProgress && (readingProgress.last_page > 0 || readingProgress.total_read_seconds > 0);

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

                        {/* Progress Section */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-[#1B2242] dark:text-white">
                              Progress
                            </span>
                            {hasProgress ? (
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  Page {readingProgress.last_page + 1}
                                </span>
                                {readingProgress.total_read_seconds > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatReadingTime(readingProgress.total_read_seconds)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                Not started
                              </span>
                            )}
                          </div>
                          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {hasProgress ? `${progressPercent}% complete` : "Start reading to track your progress"}
                          </p>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Link
                            href={`/course/${purchase.product_id}`}
                            className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-center"
                          >
                            {hasProgress ? "Continue Learning" : "Start Learning"}
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

