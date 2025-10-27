"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PaystackPaymentProps {
  email: string;
  amount: number;
  metadata?: Record<string, any>;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

export function PaystackPayment({ 
  email, 
  amount, 
  metadata, 
  onSuccess, 
  onError 
}: PaystackPaymentProps) {
  const [loading, setLoading] = useState(false);

  const initializePayment = async () => {
    setLoading(true);
    
    try {
      // In production, this would initialize Paystack payment
      // For now, we'll use a mock implementation
      
      // The actual implementation would:
      // 1. Call our API route to initiate payment
      // 2. Get authorization URL from Paystack
      // 3. Redirect to Paystack hosted page or open Paystack inline
      
      console.log('Initiating payment for:', email);
      
      // Simulate payment process
      setTimeout(() => {
        if (onSuccess) {
          onSuccess({ reference: `ref_${Date.now()}` });
        }
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Payment error:', error);
      if (onError) {
        onError(error);
      }
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={initializePayment} 
      disabled={loading}
      size="lg"
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          Buy for ₦{amount.toLocaleString()}
        </>
      )}
    </Button>
  );
}

