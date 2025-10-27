import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, reference, userId } = body;

    if (!name || !email || !reference) {
      return NextResponse.json(
        { error: 'Name, email, and reference are required' },
        { status: 400 }
      );
    }

    // Store purchase in database using admin client to bypass RLS
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .insert({
        transaction_id: reference,
        email,
        name,
        product_id: 'ielts-manual',
        status: 'completed',
        amount: 5000,
        currency: 'NGN',
        user_id: userId || null, // Will be null if user hasn't confirmed email yet
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Database error:', purchaseError);
      return NextResponse.json(
        { 
          error: 'Failed to store purchase',
          details: purchaseError.message
        },
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

