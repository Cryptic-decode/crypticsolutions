"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { showError, showSuccess } from "@/lib/utils";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { user, updatePassword, signOut, loading, isRecoverySession } = useAuth();

  const [formLoading, setFormLoading] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Check URL for recovery token (Supabase uses hash fragments)
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(hash.substring(1));
    
    const hasRecoveryToken = hash.includes('type=recovery') || 
                             urlParams.get('type') === 'recovery' || 
                             hashParams.get('type') === 'recovery';

    // Wait for auth to finish loading before deciding where to send the user
    if (loading) return;
    
    // If there is no user/session AND no recovery token in URL, send them back to sign-in
    // (This handles expired links or links opened on different devices)
    if (user === null && !hasRecoveryToken) {
      router.replace("/signin");
      return;
    }

    // If user is signed in but NOT in a recovery session, redirect to dashboard
    // (They shouldn't be able to change password via this page if they're already signed in normally)
    if (user && !isRecoverySession && !hasRecoveryToken) {
      router.replace("/dashboard");
      return;
    }
  }, [user, loading, router, isRecoverySession]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFieldError("");

    try {
      const passwordError = validatePassword(formData.newPassword);
      if (passwordError) {
        setFieldError(passwordError);
        setFormLoading(false);
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setFieldError("New password and confirmation password do not match");
        setFormLoading(false);
        return;
      }

      await updatePassword(formData.newPassword);

      setSubmitted(true);
      showSuccess("Password updated successfully. Please sign in with your new password.");

      // End the recovery session to avoid keeping old auth state around
      await signOut();
    } catch (error: unknown) {
      showError(error, "password");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
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

              <h1 className="text-2xl font-bold mb-2">Set a new password</h1>
              <p className="text-muted-foreground">
                Choose a strong new password to secure your account.
              </p>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {fieldError && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>{fieldError}</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, newPassword: e.target.value })
                      }
                      placeholder="Enter your new password"
                      required
                      className="pr-10"
                      disabled={formLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                      disabled={formLoading}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 8 characters with uppercase, lowercase, and number.
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      placeholder="Confirm your new password"
                      required
                      className="pr-10"
                      disabled={formLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      disabled={formLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={formLoading || loading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    "Update password"
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <h2 className="text-lg font-semibold">Your password has been updated</h2>
                <p className="text-sm text-muted-foreground">
                  For security, your previous password no longer works. Please sign in again
                  with your new password.
                </p>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => router.push("/signin")}
                >
                  Go to sign in
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
