import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, amount, metadata } = body;

    // Validate input
    if (!email || !amount) {
      return NextResponse.json(
        { error: 'Email and amount are required' },
        { status: 400 }
      );
    }

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Paystack secret key is not configured' },
        { status: 500 }
      );
    }

    // Generate reference
    const reference = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Call Paystack API to initialize transaction
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Convert to kobo (lowest currency unit)
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?reference=${reference}`,
        metadata
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
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

