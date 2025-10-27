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
    const { name, email, reference } = body;
    if (!name || !email || !reference) {
      console.error('Missing required fields:', { name: !!name, email: !!email, reference: !!reference });
      return NextResponse.json(
        { error: 'Name, email, and reference are required' },
        { status: 400 }
      );
    }

    // Store purchase in database
    try {
      const purchaseData = {
        transaction_id: reference,
        email,
        name,
        product_id: 'ielts-manual',
        status: 'completed',
        amount: 5000,
        currency: 'NGN',
        // user_id is omitted - will be linked after email confirmation
      };
      
      const { data: purchase, error: purchaseError } = await supabaseAdmin
        .from('purchases')
        .insert(purchaseData)
        .select()
        .single();

      if (purchaseError) {
        console.error('Failed to store purchase:', purchaseError);
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
    } catch (error) {
      console.error('Database operation failed:', error);
      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Unhandled error in success handler:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}