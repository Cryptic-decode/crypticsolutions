import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, reference } = body;

    if (!name || !email || !reference) {
      return NextResponse.json(
        { error: 'Name, email, and reference are required' },
        { status: 400 }
      );
    }

    // Store purchase in database
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        transaction_id: reference,
        email,
        name,
        product_id: 'ielts-manual',
        status: 'completed',
        amount: 5000,
        currency: 'NGN'
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Database error:', purchaseError);
      return NextResponse.json(
        { error: 'Failed to store purchase' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      purchase,
      message: 'Purchase recorded successfully'
    });
  } catch (error: any) {
    console.error('Success handler error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process payment success' },
      { status: 500 }
    );
  }
}

