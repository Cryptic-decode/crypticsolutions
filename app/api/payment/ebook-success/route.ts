import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      });
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase credentials' },
        { status: 500 }
      );
    }

    // Initialize Supabase Admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    const { reference, email, name, amount, currency } = body;
    if (!reference || !email) {
      console.error('Missing required fields:', { reference: !!reference, email: !!email });
      return NextResponse.json(
        { error: 'Reference and email are required' },
        { status: 400 }
      );
    }

    // Store purchase in database
    try {
      const purchaseData = {
        transaction_id: reference,
        product_id: 'talk-to-ai-like-a-pro',
        product_name: 'Talk to AI like a Pro',
        buyer_email: email,
        buyer_name: name || null,
        amount: amount || null,
        currency: currency || 'NGN',
        status: 'completed',
        // No user_id for ebook purchases (direct download, no account required)
        user_id: null,
      };

      // Check if purchase already exists (idempotency)
      const { data: existingPurchase } = await supabaseAdmin
        .from('purchases')
        .select('id')
        .eq('transaction_id', reference)
        .eq('product_id', 'talk-to-ai-like-a-pro')
        .single();

      if (existingPurchase) {
        // Purchase already stored, return success
        return NextResponse.json({
          success: true,
          message: 'Purchase already recorded',
          purchaseId: existingPurchase.id,
        });
      }

      // Insert new purchase
      const { data: purchase, error: insertError } = await supabaseAdmin
        .from('purchases')
        .insert([purchaseData])
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting purchase:', insertError);
        throw insertError;
      }

      return NextResponse.json({
        success: true,
        message: 'Purchase stored successfully',
        purchaseId: purchase.id,
      });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to store purchase: ' + (dbError.message || 'Unknown error') },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error in ebook-success route:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
