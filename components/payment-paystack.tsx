"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  const initializePayment = async () => {
    setLoading(true);
    
    try {
      // Call our API to initialize payment
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount,
          metadata: {
            ...metadata,
            product_id: 'ielts-manual',
            product_name: 'IELTS Preparation Manual'
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

