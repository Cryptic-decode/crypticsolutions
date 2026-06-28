import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getPaystackSecretKey, type PaystackAccount } from '@/lib/paystack-accounts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, paystackAccount } = body;

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      );
    }

    const account: PaystackAccount =
      paystackAccount === 'lydei' || paystackAccount === 'default'
        ? paystackAccount
        : 'default';
    const secretKey = getPaystackSecretKey(account);

    if (!secretKey) {
      return NextResponse.json(
        {
          error:
            account === 'lydei'
              ? 'Lydei Paystack secret key is not configured'
              : 'Paystack secret key is not configured',
        },
        { status: 500 }
      );
    }

    // Verify payment with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );

    if (response.data.status && response.data.data.status === 'success') {
      return NextResponse.json({
        success: true,
        transaction: response.data.data,
        message: 'Payment verified successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

