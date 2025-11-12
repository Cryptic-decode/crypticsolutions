"use client";

import { useAuth } from "@/lib/auth";
import { usePurchases } from "@/lib/hooks/use-purchases";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, BookOpen, AlertCircle, CheckCircle2, ArrowRight, Settings, HelpCircle, Bell, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChangePasswordModal } from "@/components/dashboard/change-password-modal";
import { Button } from "@/components/ui/button";

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

// Product name mapping
const productNames: Record<string, { name: string; description: string }> = {
  'ielts-manual': {
    name: 'IELTS Preparation Manual',
    description: 'Complete study guide for IELTS exam',
  },
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { purchases, loading: purchasesLoading, error: purchasesError, refetch } = usePurchases();
  const router = useRouter();
  const [linkingPurchases, setLinkingPurchases] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const hasLinkedPurchases = useRef(false);

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
        const response = await fetch('/api/purchases/link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            email: user.email,
          }),
        });

        const data = await response.json();
        
        if (data.success && data.linked_count > 0) {
          // Refetch purchases after linking
          await refetch();
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

        {/* Linking Purchases Indicator - Moved to top */}
        <AnimatePresence>
          {linkingPurchases && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mb-6"
            >
              <Card className="p-4 border-primary/30 dark:border-primary/20 bg-primary/5 dark:bg-primary/10">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <p className="text-sm font-medium text-[#1B2242] dark:text-white">
                    Linking your purchases...
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

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

          {/* Empty State */}
          {!purchasesLoading && !purchasesError && purchases.length === 0 && (
            <Card className="p-6 border-gray-200 dark:border-gray-700">
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Purchases Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven't purchased any products yet. Explore our products to get started.
                </p>
                <Button asChild size="lg" className="mt-4">
                  <Link href="/ielts-manual" className="inline-flex items-center gap-2">
                    Browse Products
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          )}

          {/* Purchases List */}
          {!purchasesLoading && !purchasesError && purchases.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              {purchases.map((purchase) => {
                const product = productNames[purchase.product_id] || {
                  name: purchase.product_id,
                  description: 'Product',
                };

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

