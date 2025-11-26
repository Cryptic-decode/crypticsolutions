import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

/**
 * Admin Notification API Route
 * Checks for unnotified email confirmations and sends admin notification emails via Resend.
 * 
 * Security: Protected by API secret key in header (for manual calls) or Vercel Cron
 * Usage: Called automatically via Vercel Cron every 6 hours
 * 
 * Headers required (for manual calls):
 *   x-api-secret: Your CRON_SECRET environment variable
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authorization - either via header or Vercel Cron
    const apiSecret = request.headers.get('x-api-secret');
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    // Allow access if: valid x-api-secret header OR valid Vercel Cron authorization
    const isValidSecret = expectedSecret && apiSecret === expectedSecret;
    const isVercelCron = authHeader === `Bearer ${expectedSecret}`;

    if (!isValidSecret && !isVercelCron) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || 'crypticsolutions.contact@gmail.com';

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase credentials' },
        { status: 500 }
      );
    }

    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing Resend API key' },
        { status: 500 }
      );
    }

    // Initialize clients
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // Get unnotified signup events
    const { data: signups, error: fetchError } = await supabaseAdmin
      .from('signup_events')
      .select('*')
      .eq('notified', false)
      .eq('event_type', 'email_confirmed')
      .order('created_at', { ascending: true });

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch signup events', details: fetchError.message },
        { status: 500 }
      );
    }

    // If no new signups, return early
    if (!signups || signups.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new signups to notify',
        count: 0
      });
    }

    // Build email content
    const signupRows = signups.map((signup, index) => {
      const confirmedDate = new Date(signup.confirmed_at).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${index + 1}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${signup.full_name || 'N/A'}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${signup.email}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${confirmedDate}</td>
        </tr>
      `;
    }).join('');

    const emailSubject = `🎉 New IELTS Course Signup${signups.length > 1 ? 's' : ''}: ${signups.length} confirmed`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1B2242; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1B2242; font-size: 24px; margin-bottom: 8px;">New Signup${signups.length > 1 ? 's' : ''} Confirmed!</h1>
          <p style="color: #718096; margin: 0;">You have ${signups.length} new confirmed user${signups.length > 1 ? 's' : ''}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; background: #f8f9fa; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #93E030; color: #1B2242;">
              <th style="padding: 12px; text-align: left;">#</th>
              <th style="padding: 12px; text-align: left;">Name</th>
              <th style="padding: 12px; text-align: left;">Email</th>
              <th style="padding: 12px; text-align: left;">Confirmed</th>
            </tr>
          </thead>
          <tbody>
            ${signupRows}
          </tbody>
        </table>

        <p style="color: #718096; font-size: 14px; margin-top: 24px; text-align: center;">
          These users have confirmed their email and can now access the IELTS course.
        </p>

        <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 16px; text-align: center;">
          <p style="color: #a0aec0; font-size: 12px; margin: 0;">
            Cryptic Solutions Admin Notification
          </p>
        </div>
      </body>
      </html>
    `;

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Cryptic Solutions <onboarding@resend.dev>',
      to: adminEmail,
      subject: emailSubject,
      html: emailHtml,
    });

    if (emailError) {
      return NextResponse.json(
        { error: 'Failed to send email', details: emailError.message },
        { status: 500 }
      );
    }

    // Mark signups as notified only after successful email send
    const signupIds = signups.map(s => s.id);
    const { error: updateError } = await supabaseAdmin
      .from('signup_events')
      .update({ notified: true })
      .in('id', signupIds);

    if (updateError) {
      return NextResponse.json(
        { error: 'Email sent but failed to update notification status', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Sent notification for ${signups.length} signup(s)`,
      count: signups.length,
      emailId: emailData?.id
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
