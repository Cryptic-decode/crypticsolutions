import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference } = body;

    // In a real implementation:
    // 1. Verify the payment with Paystack
    // 2. Get payment details from Paystack API
    // 3. Store the purchase in Supabase
    // 4. Send confirmation email

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      );
    }

    // Store purchase in database
    const { data, error } = await supabase
      .from('purchases')
      .insert({
        transaction_id: reference,
        email: body.email || 'customer@example.com',
        name: body.name || 'Customer',
        product_id: 'ielts-manual',
        status: 'completed',
        amount: 5000,
        currency: 'NGN'
      })
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to store purchase' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Purchase recorded successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    );
  }
}

