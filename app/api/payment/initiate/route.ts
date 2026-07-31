import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getPaystackSecretKey } from '@/lib/paystack-accounts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      amount,
      productId,
      productName,
      successPath = '/payment/success',
      referralCode,
      metadata,
    } = body;

    // Validate input
    if (!email || !amount || !productId || !productName) {
      return NextResponse.json(
        { error: 'Email, amount, productId, and productName are required' },
        { status: 400 }
      );
    }

    const secretKey = getPaystackSecretKey();

    if (!secretKey) {
      return NextResponse.json(
        { error: 'Paystack secret key is not configured' },
        { status: 500 }
      );
    }

    // Generate reference
    const reference = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Build callback URL
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'https://crypticsolutionsltd.com';
    const callbackUrl = referralCode
      ? `${baseUrl}${successPath}?reference=${reference}&referral_code=${encodeURIComponent(referralCode)}`
      : `${baseUrl}${successPath}?reference=${reference}`;

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
          product_id: productId,
          product_name: productName,
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

