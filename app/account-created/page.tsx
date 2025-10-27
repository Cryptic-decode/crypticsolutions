"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AccountCreatedPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const tempPassword = sessionStorage.getItem('temp_password');
    const userEmail = sessionStorage.getItem('user_email');
    
    if (!tempPassword || !userEmail) {
      router.push('/login');
      return;
    }

    setEmail(userEmail);
    setPassword(tempPassword);

    // Clean up session storage after 5 minutes
    setTimeout(() => {
      sessionStorage.removeItem('temp_password');
      sessionStorage.removeItem('user_email');
    }, 5 * 60 * 1000);
  }, [router]);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!email || !password) {
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
              Your account has been successfully created. Please save your login credentials securely.
            </p>

            <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
              <div className="space-y-3 text-left">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                  <p className="text-sm">{email}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-muted-foreground">Temporary Password</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-6 px-2 text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-sm font-mono break-all">{password}</p>
                </div>
              </div>
            </Card>

            <div className="space-y-4 mb-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-left">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Important:</strong> Please save this password securely. You'll need it to access your IELTS Manual. You can change it after logging in.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Important - Check Your Email:</strong> We've sent a confirmation link to {email}. You must click this link before you can log in.
                </p>
                <ul className="mt-2 text-sm text-blue-800 dark:text-blue-200 list-disc list-inside">
                  <li>Check your spam/junk folder if you don't see it</li>
                  <li>The link expires in 24 hours</li>
                  <li>After confirming, return here to log in</li>
                </ul>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" className="w-full" onClick={() => router.push('/login?email=' + encodeURIComponent(email))}>
                Continue to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
