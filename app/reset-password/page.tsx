"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { showError, showSuccess } from "@/lib/utils";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSubmitted(true);
      showSuccess("Check your email for a password reset link.");
    } catch (error: unknown) {
      showError(error, "auth");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8">
            <div className="text-center mb-8">
              <Link href="/" className="inline-block mb-8">
                <img
                  src="/cryptic-assets/fullLogo.png"
                  alt="Cryptic Solutions"
                  className="h-12 w-auto dark:hidden"
                />
                <img
                  src="/cryptic-assets/fullLogo2.png"
                  alt="Cryptic Solutions"
                  className="h-12 w-auto hidden dark:block"
                />
              </Link>
              {!submitted ? (
                <>
                  <h1 className="text-2xl font-bold mb-2">Reset your password</h1>
                  <p className="text-muted-foreground">
                    Enter the email you used to sign up. We&apos;ll send you a secure link to create a new password.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold mb-2">Check your email</h1>
                  <p className="text-muted-foreground">
                    If an account exists for <span className="font-medium">{email}</span>, you&apos;ll receive a password reset link shortly.
                  </p>
                </>
              )}
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>
            ) : (
              <div className="mt-2 space-y-4 text-center">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  You can now check your inbox and follow the link to set a new password.
                </p>
                <p className="text-xs text-muted-foreground">
                  Once you&apos;re done, return here and sign in with your new password.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/signin")}
                >
                  Back to sign in
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

