"use client";

import { useAuth } from "@/lib/auth";
import { usePurchases } from "@/lib/hooks/use-purchases";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChangePasswordModal } from "@/components/dashboard/change-password-modal";

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
        console.error('Failed to link purchases:', error);
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
          <p className="text-muted-foreground">
            {user.email}
          </p>
        </div>

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
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                  >
                    Change Password
                  </button>
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
                <Link
                  href="/ielts-manual"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Browse Products
                </Link>
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

                      <div className="grid gap-4 md:grid-cols-2">
                        <Link href={`/course/${purchase.product_id}`}>
                          <motion.button
                            variants={cardVariants}
                            whileHover="hover"
                            className="w-full flex items-center justify-center p-4 border-2 border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
                          >
                            <div className="text-center">
                              <h4 className="font-medium mb-1">Continue Reading</h4>
                              <p className="text-sm text-muted-foreground">Pick up where you left off</p>
                            </div>
                          </motion.button>
                        </Link>

                        <Link href="/progress">
                          <motion.button
                            variants={cardVariants}
                            whileHover="hover"
                            className="w-full flex items-center justify-center p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="text-center">
                              <h4 className="font-medium mb-1">Study Progress</h4>
                              <p className="text-sm text-muted-foreground">Track your learning journey</p>
                            </div>
                          </motion.button>
                        </Link>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Linking Purchases Indicator */}
          {linkingPurchases && (
            <Card className="p-4 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Linking your purchases...
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid gap-4 md:grid-cols-3"
        >
          <motion.div variants={itemVariants}>
            <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <h3 className="font-medium mb-1">Account Settings</h3>
              <p className="text-sm text-muted-foreground">Update your profile and preferences</p>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <h3 className="font-medium mb-1">Support</h3>
              <p className="text-sm text-muted-foreground">Get help with your manual</p>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <h3 className="font-medium mb-1">Updates</h3>
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

