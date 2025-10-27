"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { generatePassword } from "@/lib/utils";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const reference = searchParams.get('reference');

  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    // Verify payment on mount
    if (reference) {
      verifyPayment(reference);
    }
  }, [reference]);

  const verifyPayment = async (ref: string) => {
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference: ref }),
      });

      const data = await response.json();

      if (data.success) {
        setVerified(true);
        setFormData({
          email: data.transaction.customer.email,
          name: data.transaction.customer.name || ''
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
    }
  };

  const { signUp, user } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // Generate a secure random password
      const password = generatePassword();

      // Create user account with Supabase Auth
      const authData = await signUp(formData.email, password, {
        full_name: formData.name,
      });

      // Store purchase details without user_id (will be linked after email confirmation)
      const response = await fetch('/api/payment/success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          reference,
          // Don't pass userId - we'll link it after email confirmation
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json().catch(() => {
        throw new Error('Failed to parse success response');
      });

      if (data.success) {
        // Store password temporarily in sessionStorage for display
        sessionStorage.setItem('temp_password', password);
        sessionStorage.setItem('user_email', formData.email);
        
        // Redirect to account setup page
        router.push('/account-created');
      } else {
        throw new Error(data.error || 'Failed to process payment');
      }
    } catch (error: any) {
      console.error('Account creation error:', error);
      
      // Handle different types of errors with specific messages
      let errorMessage = 'An unexpected error occurred. Please try again or contact support.';
      
      if (error.message?.includes('Missing required environment variables')) {
        errorMessage = 'Server configuration error. Please contact support.';
      } else if (error.message?.includes('Server error')) {
        errorMessage = 'Server error. Please try again in a few minutes.';
      } else if (error.message?.includes('Failed to parse')) {
        errorMessage = 'Communication error with server. Please try again.';
      } else if (error.message?.includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please log in instead.';
      }
      
      setErrorMessage(`${errorMessage} If the issue persists, contact support at crypticsolutions.contact@gmail.com`);
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
          <Card className="p-8 text-center">
            {verified && (
              <>
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

                <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
                <p className="text-muted-foreground mb-8">
                  Thank you for your purchase. Please complete your account setup below to access your IELTS Manual.
                </p>

                {errorMessage && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" size="lg" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account & Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </>
            )}

            {!verified && (
              <div className="py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p>Verifying your payment...</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

