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
    const { user_id, email } = body;
    if (!user_id || !email) {
      console.error('Missing required fields:', { user_id: !!user_id, email: !!email });
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      );
    }

    // Verify user exists and email matches
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(user_id);
    
    if (authError || !authUser) {
      console.error('User verification failed:', authError);
      return NextResponse.json(
        { error: 'Invalid user' },
        { status: 400 }
      );
    }

    // Verify email matches
    if (authUser.user.email !== email) {
      console.error('Email mismatch:', { provided: email, actual: authUser.user.email });
      return NextResponse.json(
        { error: 'Email does not match user account' },
        { status: 400 }
      );
    }

    // Verify email is confirmed
    if (!authUser.user.email_confirmed_at) {
      console.error('Email not confirmed for user:', user_id);
      return NextResponse.json(
        { error: 'Email must be confirmed before linking purchases' },
        { status: 400 }
      );
    }

    // Find and link purchases with matching email and null user_id
    try {
      const { data: purchasesToLink, error: findError } = await supabaseAdmin
        .from('purchases')
        .select('id, transaction_id, email')
        .eq('email', email)
        .is('user_id', null)
        .eq('status', 'completed');

      if (findError) {
        console.error('Failed to find purchases:', findError);
        return NextResponse.json(
          { 
            error: 'Failed to find purchases',
            details: findError.message
          },
          { status: 500 }
        );
      }

      // If no purchases to link, return success with 0 count
      if (!purchasesToLink || purchasesToLink.length === 0) {
        return NextResponse.json({
          success: true,
          linked_count: 0,
          message: 'No purchases found to link'
        });
      }

      // Update purchases to link them to the user
      const { data: updatedPurchases, error: updateError } = await supabaseAdmin
        .from('purchases')
        .update({ user_id })
        .eq('email', email)
        .is('user_id', null)
        .eq('status', 'completed')
        .select('id, transaction_id');

      if (updateError) {
        console.error('Failed to link purchases:', updateError);
        return NextResponse.json(
          { 
            error: 'Failed to link purchases',
            details: updateError.message
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        linked_count: updatedPurchases?.length || 0,
        purchases: updatedPurchases,
        message: `Successfully linked ${updatedPurchases?.length || 0} purchase(s)`
      });
    } catch (error) {
      console.error('Database operation failed:', error);
      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Unhandled error in link purchases handler:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
