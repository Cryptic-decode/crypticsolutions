"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";

function AccountCreatedContent() {
  const router = useRouter();
  const email = useSearchParams().get('email') || '';

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 text-center">
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

            <h1 className="text-3xl font-bold mb-2">Account Created!</h1>
            <p className="text-muted-foreground mb-8">
              Your account has been created securely. Confirm your email before signing in.
            </p>

            <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
              <div className="text-left">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                  <p className="text-sm">{email}</p>
                </div>
              </div>
            </Card>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Check your email:</strong> We&apos;ve sent a confirmation link to {email}. You must click this link before you can log in.
                </p>
                <ul className="mt-2 text-sm text-blue-800 dark:text-blue-200 list-disc list-inside">
                  <li>Check your spam/junk folder if you don&apos;t see it</li>
                  <li>The link expires in 24 hours</li>
                  <li>After confirming, return here to log in</li>
                </ul>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" className="w-full" onClick={() => router.push('/signin?email=' + encodeURIComponent(email))}>
                Continue to Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function AccountCreatedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <AccountCreatedContent />
    </Suspense>
  );
}
