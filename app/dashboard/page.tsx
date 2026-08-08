"use client";

import { useAuth } from "@/lib/auth";
import { usePurchases } from "@/lib/hooks/use-purchases";
import { useReadingProgress } from "@/lib/hooks/use-reading-progress";
import { useStudyStreak } from "@/lib/hooks/use-study-streak";
import { showSuccess } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import {
  getCourseProductIds,
  getProductInfo,
  formatReadingTime,
} from "@/lib/products";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { BookOpen, AlertCircle, CheckCircle2, ArrowRight, Settings, HelpCircle, Bell, BarChart3, Clock, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChangePasswordModal } from "@/components/dashboard/change-password-modal";
import { Button } from "@/components/ui/button";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

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

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { scale: 1.02, y: -2 },
};

// Only show course-type purchases on the dashboard (instant-download products
// like ebooks don't need progress tracking or a course card).
const courseProductIds = getCourseProductIds();

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { purchases, loading: purchasesLoading, error: purchasesError, refetch } = usePurchases();
  const { getProgressForProduct } = useReadingProgress();
  const { currentStreak, longestStreak, todayStudied, loading: streakLoading } = useStudyStreak();
  const router = useRouter();
  const [linkingPurchases, setLinkingPurchases] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const hasLinkedPurchases = useRef(false);

  // Filter purchases to only course products
  const coursePurchases = useMemo(
    () => purchases.filter((p) => courseProductIds.has(p.product_id)),
    [purchases]
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [user, authLoading, router]);

  // Link purchases when user first accesses dashboard after email confirmation
  useEffect(() => {
    const linkPurchases = async () => {
      if (!user || hasLinkedPurchases.current || linkingPurchases) return;
      
      // Only link if email is confirmed
      if (!user.email_confirmed_at) return;

      try {
        setLinkingPurchases(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const response = await fetch('/api/purchases/link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await response.json();
        
        if (data.success && data.linked_count > 0) {
          // Refetch purchases after linking
          await refetch();
          showSuccess(`Successfully linked ${data.linked_count} purchase${data.linked_count > 1 ? 's' : ''}!`);
        }
        
        hasLinkedPurchases.current = true;
      } catch (error) {
        // Handle purchase linking errors silently - user can still use dashboard
      } finally {
        setLinkingPurchases(false);
      }
    };

    if (user && user.email_confirmed_at) {
      linkPurchases();
    }
  }, [user, refetch, linkingPurchases]);

  if (authLoading || purchasesLoading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title skeleton */}
          <Skeleton className="h-10 w-48 mb-8" />

          {/* Streak widget skeleton */}
          <Skeleton className="h-24 w-full rounded-xl p-5">
            <div className="flex items-center gap-5">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/5" />
                <Skeleton className="h-4 w-2/5" />
              </div>
            </div>
          </Skeleton>

          {/* Library heading */}
          <Skeleton className="h-8 w-32" />

          {/* Course cards */}
          <SkeletonCard />
          <SkeletonCard />
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
          {/* <p className="text-muted-foreground">
            {user.user_metadata?.full_name || user.email}
          </p> */}
        </div>

        {/* Study Streak: subtle stat line */}
        {!streakLoading && currentStreak > 0 && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5"
          >
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <span>
              <strong className="text-foreground">{currentStreak}</strong> day streak
              {!todayStudied && (
                <span className="text-muted-foreground ml-1">
                  . Study today to keep it going.
                </span>
              )}
            </span>
          </motion.p>
        )}

        {/* Security Alert - Password Change */}
        <AnimatePresence>
          {!user.user_metadata?.password_changed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mb-8"
            >
              <Card className="p-4 border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/20">
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Security Recommendation</h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Please change your temporary password to ensure account security.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowPasswordModal(true)}
                    size="sm"
                    className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800"
                  >
                    Change Password
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* My Library Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">My Library</h2>
          
          {/* Error State */}
          {purchasesError && (
            <Card className="p-6 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800 dark:text-red-200">Error Loading Purchases</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {purchasesError}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Empty State: no course purchases found */}
          {!purchasesLoading && !purchasesError && coursePurchases.length === 0 && (
            <Card className="p-6 border-gray-200 dark:border-gray-700">
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {purchases.length > 0
                    ? "You have purchases but no course products. Only courses with progress tracking appear here."
                    : "You haven't purchased any products yet. Explore our products to get started."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild size="lg">
                    <Link href="/ielts-manual" className="inline-flex items-center gap-2">
                      IELTS Manual
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/prompt-engineering-ebook" className="inline-flex items-center gap-2">
                      Prompt Engineering Ebook
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Purchases List: Only course products */}
          {!purchasesLoading && !purchasesError && coursePurchases.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              {coursePurchases.map((purchase) => {
                const product = getProductInfo(purchase.product_id) ?? {
                  id: purchase.product_id,
                  name: purchase.product_id,
                  description: 'Product',
                  type: 'course' as const,
                  totalPages: 100,
                };
                const totalPages = product.totalPages ?? 100;
                const readingProgress = getProgressForProduct(purchase.product_id);
                const progressPercent = readingProgress
                  ? Math.min(100, Math.round(((readingProgress.last_page + 1) / totalPages) * 100))
                  : 0;

                return (
                  <motion.div key={purchase.id} variants={itemVariants}>
                    <Card className="p-6 border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-[#1B2242] dark:text-white">
                              {product.name}
                            </h3>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Active
                            </span>
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

                      {/* Reading Progress Indicator */}
                      {readingProgress && (
                        <div className="mb-4 p-3 rounded-lg bg-secondary/20 border border-secondary/40">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-[#1B2242] dark:text-white">
                              Reading Progress
                            </span>
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
                          </div>
                          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 text-right">
                            {progressPercent}% complete
                          </p>
                        </div>
                      )}

                      <div className="grid gap-4 md:grid-cols-2 mt-6">
                        <motion.div variants={itemVariants}>
                          <Button
                            asChild
                            size="lg"
                            className="w-full h-auto py-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                          >
                            <Link href={`/course/${purchase.product_id}`} className="flex items-center justify-center gap-2">
                              <BookOpen className="h-5 w-5" />
                              <div className="text-left">
                                <div className="font-semibold">Continue Reading</div>
                                <div className="text-xs opacity-90">Pick up where you left off</div>
                              </div>
                              <ArrowRight className="h-4 w-4 ml-auto" />
                            </Link>
                          </Button>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="w-full h-auto py-4 border-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                          >
                            <Link href="/progress" className="flex items-center justify-center gap-2">
                              <BarChart3 className="h-5 w-5" />
                              <div className="text-left">
                                <div className="font-semibold">Study Progress</div>
                                <div className="text-xs text-muted-foreground">Track your learning journey</div>
                              </div>
                              <ArrowRight className="h-4 w-4 ml-auto" />
                            </Link>
                          </Button>
                        </motion.div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

        </div>

        {/* Quick Actions */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid gap-4 md:grid-cols-3 mt-8"
        >
          <motion.div variants={itemVariants}>
            <Link href="/settings">
              <Card className="p-6 hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer group h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 dark:bg-primary/15 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-semibold mb-1 text-[#1B2242] dark:text-white">Account Settings</h3>
                <p className="text-sm text-muted-foreground">Update your profile and preferences</p>
              </Card>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="p-6 hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer group h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 dark:bg-primary/15 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <HelpCircle className="h-5 w-5 text-primary" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-semibold mb-1 text-[#1B2242] dark:text-white">Support</h3>
              <p className="text-sm text-muted-foreground">Get help with your manual</p>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="p-6 hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer group h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 dark:bg-primary/15 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-semibold mb-1 text-[#1B2242] dark:text-white">Updates</h3>
              <p className="text-sm text-muted-foreground">Check for new content</p>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}
