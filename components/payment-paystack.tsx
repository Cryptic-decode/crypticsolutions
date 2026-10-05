"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';


function isCheckoutEmailValid(email: string): boolean {
  const trimmed = email.trim();
  return trimmed.length > 0 && trimmed.includes("@") && trimmed.includes(".");
}

interface PaystackPaymentProps {
  email: string;
  amount: number;
  productId: string;
  productName: string;
  successPath?: string; // Optional: defaults to '/payment/success' for IELTS flow
  metadata?: Record<string, unknown>;
  onSuccess?: (response: unknown) => void;
  onError?: (error: unknown) => void;
  disabled?: boolean;
  className?: string;
  buttonLabel?: string;
  requireEmail?: boolean;
  referralCode?: string;
}

export function PaystackPayment({ 
  email, 
  amount,
  productId,
  onError,
  disabled = false,
  className,
  buttonLabel,
  requireEmail = true,
  referralCode,
}: PaystackPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const checkoutEmail = email.trim();
  const emailValid = !requireEmail || isCheckoutEmailValid(checkoutEmail);

  const initializePayment = async () => {
    if (!emailValid) return;

    setLoading(true);
    setError("");

    try {
      // Call our API to initialize payment
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: checkoutEmail,
          productId,
          referralCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      if (data.success && data.authorization_url) {
        // Store reference in localStorage for verification after redirect
        localStorage.setItem('paystack_reference', data.reference);

        // Redirect to Paystack checkout
        window.location.href = data.authorization_url;
      } else {
        throw new Error('Invalid response from payment initialization');
      }
      
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Payment could not be started. Please try again.";
      setError(message);
      if (onError) {
        onError(error);
      }
      setLoading(false);
    }
  };

  const isDisabled = disabled || loading || !emailValid;

  return (
    <div>
      <Button
        type="button"
        onClick={initializePayment}
        disabled={isDisabled}
        size="lg"
        className={cn(
          "w-full",
          className,
          isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>{buttonLabel ?? `Buy for ₦${amount.toLocaleString()}`}</>
        )}
      </Button>
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
