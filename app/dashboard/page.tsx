"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
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
          <div className="mb-8">
            <Card className="p-4 border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/20">
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Security Recommendation</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Please change your temporary password to ensure account security.
                  </p>
                </div>
                <button className="px-4 py-2 text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors">
                  Change Password
                </button>
              </div>
            </Card>
          </div>

          {/* My Library Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">My Library</h2>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">IELTS Preparation Manual</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete study guide for IELTS exam
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Active
                  </span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <button className="flex items-center justify-center p-4 border-2 border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">
                  <div className="text-center">
                    <h4 className="font-medium mb-1">Continue Reading</h4>
                    <p className="text-sm text-muted-foreground">Pick up where you left off</p>
                  </div>
                </button>

                <button className="flex items-center justify-center p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="text-center">
                    <h4 className="font-medium mb-1">Study Progress</h4>
                    <p className="text-sm text-muted-foreground">Track your learning journey</p>
                  </div>
                </button>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <h3 className="font-medium mb-1">Account Settings</h3>
              <p className="text-sm text-muted-foreground">Update your profile and preferences</p>
            </Card>
            
            <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <h3 className="font-medium mb-1">Support</h3>
              <p className="text-sm text-muted-foreground">Get help with your manual</p>
            </Card>

            <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <h3 className="font-medium mb-1">Updates</h3>
              <p className="text-sm text-muted-foreground">Check for new content</p>
            </Card>
          </div>
      </motion.div>
    </div>
  );
}

