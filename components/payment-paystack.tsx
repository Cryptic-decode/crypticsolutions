"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
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
  metadata?: Record<string, any>;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
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
  productName,
  successPath = '/payment/success', // Default to IELTS flow
  metadata, 
  onSuccess, 
  onError,
  disabled = false,
  className,
  buttonLabel,
  requireEmail = true,
  referralCode,
}: PaystackPaymentProps) {
  const [loading, setLoading] = useState(false);
  const checkoutEmail = email.trim();
  const emailValid = !requireEmail || isCheckoutEmailValid(checkoutEmail);

  const initializePayment = async () => {
    if (!emailValid) return;

    setLoading(true);

    try {
      // Call our API to initialize payment
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: checkoutEmail,
          amount,
          productId,
          productName,
          successPath,
          referralCode,
          metadata: {
            ...metadata,
            product_id: productId,
            product_name: productName
          }
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
      
    } catch (error: any) {
      if (onError) {
        onError(error);
      }
      setLoading(false);
    }
  };

  const isDisabled = disabled || loading || !emailValid;

  return (
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
  );
}

