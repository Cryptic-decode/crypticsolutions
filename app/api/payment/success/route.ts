import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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
    const { name, email, reference, password, referralCode } = body;
    if (!name || !email || !reference || !password) {
      console.error('Missing required fields:', { name: !!name, email: !!email, reference: !!reference, password: !!password });
      return NextResponse.json(
        { error: 'Name, email, reference, and password are required' },
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
        referral_code: referralCode || null,
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

      // Send credentials email via Resend
      const resendApiKey = process.env.RESEND_API_KEY;
      let emailSent = false;
      let emailErrorMsg = null;
      
      if (resendApiKey) {
        try {
          const resend = new Resend(resendApiKey);
          // Get origin from request headers or use fallback
          const origin = request.headers.get('origin') || 
                         request.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
                         process.env.NEXT_PUBLIC_SITE_URL || 
                         'https://crypticsolutionsltd.com';
          const signInUrl = `${origin}/signin?email=${encodeURIComponent(email)}`;
          
          const emailHtml = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1B2242; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #1B2242; font-size: 24px; margin-bottom: 10px;">
                    Welcome to Cryptic Solutions!
                  </h1>
                </div>

                <div style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                  <h2 style="color: #1B2242; font-size: 18px; margin-top: 0;">
                    Your Login Credentials
                  </h2>
                  <p style="color: #4a5568; margin-bottom: 20px;">
                    Thank you for purchasing the IELTS Preparation Manual. Your account has been created successfully. 
                    Please save these credentials securely.
                  </p>

                  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <div style="margin-bottom: 16px;">
                      <p style="color: #718096; font-size: 14px; margin: 0 0 4px 0; font-weight: 600;">Email Address</p>
                      <p style="color: #1B2242; font-size: 16px; margin: 0; font-family: monospace;">${email}</p>
                    </div>
                    <div>
                      <p style="color: #718096; font-size: 14px; margin: 0 0 4px 0; font-weight: 600;">Temporary Password</p>
                      <p style="color: #1B2242; font-size: 16px; margin: 0; font-family: monospace; word-break: break-all;">${password}</p>
                    </div>
                  </div>

                  <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="color: #856404; font-size: 14px; margin: 0;">
                      <strong>Important:</strong> Please save this password securely. You'll need it to access your IELTS Manual. 
                      You can change it after logging in.
                    </p>
                  </div>

                  <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="color: #0c5460; font-size: 14px; margin: 0 0 8px 0;">
                      <strong>Next Steps:</strong>
                    </p>
                    <ol style="color: #0c5460; font-size: 14px; margin: 0; padding-left: 20px;">
                      <li style="margin-bottom: 8px;">Check your email for the confirmation link (from Supabase)</li>
                      <li style="margin-bottom: 8px;">Click the confirmation link to activate your account</li>
                      <li style="margin-bottom: 8px;">Return to sign in using the credentials above</li>
                    </ol>
                  </div>

                  <div style="text-align: center; margin: 24px 0;">
                    <a
                      href="${signInUrl}"
                      style="display: inline-block; background: #93E030; color: #1B2242; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px;"
                    >
                      Sign In to Your Account
                    </a>
                  </div>

                  <p style="color: #718096; font-size: 14px; margin-bottom: 0;">
                    If you didn't create this account, please contact support immediately.
                  </p>
                </div>

                <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
                  <p style="color: #718096; font-size: 14px; margin-bottom: 8px;">
                    Need help? Contact us at
                    <a href="mailto:info@crypticsolutionsltd.com" style="color: #93E030; text-decoration: none;">info@crypticsolutionsltd.com</a>
                  </p>
                  <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                    © 2025 Cryptic Solutions. All rights reserved.
                  </p>
                </div>
              </body>
            </html>
          `;

          // Use configured from address or fallback to Resend default
          // Note: For production, verify a domain in Resend and set RESEND_FROM_EMAIL env var
          // Example: RESEND_FROM_EMAIL="Cryptic Solutions <noreply@yourdomain.com>"
          const fromEmail = process.env.RESEND_FROM_EMAIL || 'Cryptic Solutions <onboarding@resend.dev>';
          
          const { data: emailData, error: emailError } = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: 'Your Cryptic Solutions Login Credentials',
            html: emailHtml,
          });

          if (emailError) {
            emailErrorMsg = emailError.message || 'Unknown email error';
            console.error('Failed to send credentials email:', {
              error: emailError,
              email: email,
              message: emailErrorMsg
            });
          } else {
            emailSent = true;
            console.log('Credentials email sent successfully:', {
              email: email,
              emailId: emailData?.id
            });
          }
        } catch (emailErr: any) {
          emailErrorMsg = emailErr.message || 'Unknown error';
          console.error('Error sending credentials email:', {
            error: emailErr,
            email: email,
            message: emailErrorMsg,
            stack: emailErr.stack
          });
        }
      } else {
        console.warn('RESEND_API_KEY not configured - skipping credentials email');
        emailErrorMsg = 'RESEND_API_KEY not configured';
      }

      return NextResponse.json({
        success: true,
        purchase,
        message: 'Purchase recorded successfully',
        emailSent,
        emailError: emailErrorMsg || undefined
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