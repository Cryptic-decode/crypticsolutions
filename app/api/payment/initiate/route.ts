import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import {
  getPaystackSecretKey,
  resolvePaystackAccount,
} from '@/lib/paystack-accounts';
import { isKitchenEbookProductId } from '@/lib/kitchen-ebook-products';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      amount,
      productId,
      productName,
      successPath = '/payment/success',
      metadata,
      paystackAccount,
    } = body;

    // Validate input
    if (!email || !amount || !productId || !productName) {
      return NextResponse.json(
        { error: 'Email, amount, productId, and productName are required' },
        { status: 400 }
      );
    }

    const account = resolvePaystackAccount(productId, paystackAccount);
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

    // Generate reference
    const reference = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Build callback URL dynamically based on product
    const isKitchenEbook = isKitchenEbookProductId(productId);
    const baseUrl = isKitchenEbook
      ? (process.env.NEXT_PUBLIC_KITCHEN_CASH_DOMAIN || 'https://lydei.crypticsolutionsltd.com')
      : (process.env.NEXT_PUBLIC_APP_URL || 'https://crypticsolutionsltd.com');
    const callbackUrl = `${baseUrl}${successPath}?reference=${reference}`;

    // Call Paystack API to initialize transaction
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Convert to kobo (lowest currency unit)
        reference,
        callback_url: callbackUrl,
        metadata: {
          ...metadata,
          paystack_account: account,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status) {
      return NextResponse.json({
        success: true,
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        reference,
        email,
        amount
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to initialize payment' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}

