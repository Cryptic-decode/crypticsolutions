# Supabase Email Templates for Cryptic Solutions

Configure these templates in **Supabase Dashboard → Authentication → Email Templates**.

---

## 1. Confirm Signup (Most Important)

### Subject

```
Confirm your Cryptic Solutions IELTS account
```

### Body (HTML)

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body
    style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1B2242; max-width: 600px; margin: 0 auto; padding: 20px;"
  >
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1B2242; font-size: 24px; margin-bottom: 10px;">
        Welcome to Cryptic Solutions!
      </h1>
    </div>

    <div
      style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 24px;"
    >
      <h2 style="color: #1B2242; font-size: 18px; margin-top: 0;">
        Confirm Your Email
      </h2>
      <p style="color: #4a5568; margin-bottom: 20px;">
        Thank you for purchasing the IELTS Preparation Manual. Please confirm
        your email address to activate your account and access your course
        materials.
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <a
          href="{{ .ConfirmationURL }}"
          style="display: inline-block; background: #93E030; color: #1B2242; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px;"
        >
          Confirm Email Address
        </a>
      </div>

      <p style="color: #718096; font-size: 14px; margin-bottom: 0;">
        This link will expire in 24 hours. If you didn't create this account,
        you can safely ignore this email.
      </p>
    </div>

    <div
      style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;"
    >
      <p style="color: #718096; font-size: 14px; margin-bottom: 8px;">
        Need help? Contact us at
        <a
          href="mailto:crypticsolutions.contact@gmail.com"
          style="color: #93E030;"
          >crypticsolutions.contact@gmail.com</a
        >
      </p>
      <p style="color: #a0aec0; font-size: 12px; margin: 0;">
        © 2025 Cryptic Solutions. All rights reserved.
      </p>
    </div>
  </body>
</html>
```

---

## 2. Magic Link (if enabled)

### Subject

```
Your Cryptic Solutions sign-in link
```

### Body (HTML)

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body
    style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1B2242; max-width: 600px; margin: 0 auto; padding: 20px;"
  >
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1B2242; font-size: 24px; margin-bottom: 10px;">
        Sign In to Cryptic Solutions
      </h1>
    </div>

    <div
      style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 24px;"
    >
      <p style="color: #4a5568; margin-bottom: 20px;">
        Click the button below to sign in to your account. This link is valid
        for 1 hour.
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <a
          href="{{ .ConfirmationURL }}"
          style="display: inline-block; background: #93E030; color: #1B2242; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px;"
        >
          Sign In
        </a>
      </div>

      <p style="color: #718096; font-size: 14px; margin-bottom: 0;">
        If you didn't request this link, you can safely ignore this email.
      </p>
    </div>

    <div
      style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;"
    >
      <p style="color: #718096; font-size: 14px; margin-bottom: 8px;">
        Need help? Contact us at
        <a
          href="mailto:crypticsolutions.contact@gmail.com"
          style="color: #93E030;"
          >crypticsolutions.contact@gmail.com</a
        >
      </p>
      <p style="color: #a0aec0; font-size: 12px; margin: 0;">
        © 2025 Cryptic Solutions. All rights reserved.
      </p>
    </div>
  </body>
</html>
```

---

## 3. Reset Password

### Subject

```
Reset your Cryptic Solutions password
```

### Body (HTML)

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body
    style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1B2242; max-width: 600px; margin: 0 auto; padding: 20px;"
  >
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1B2242; font-size: 24px; margin-bottom: 10px;">
        Password Reset Request
      </h1>
    </div>

    <div
      style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 24px;"
    >
      <p style="color: #4a5568; margin-bottom: 20px;">
        We received a request to reset your password. Click the button below to
        create a new password.
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <a
          href="{{ .ConfirmationURL }}"
          style="display: inline-block; background: #93E030; color: #1B2242; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px;"
        >
          Reset Password
        </a>
      </div>

      <p style="color: #718096; font-size: 14px; margin-bottom: 0;">
        This link will expire in 1 hour. If you didn't request a password reset,
        you can safely ignore this email.
      </p>
    </div>

    <div
      style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;"
    >
      <p style="color: #718096; font-size: 14px; margin-bottom: 8px;">
        Need help? Contact us at
        <a
          href="mailto:crypticsolutions.contact@gmail.com"
          style="color: #93E030;"
          >crypticsolutions.contact@gmail.com</a
        >
      </p>
      <p style="color: #a0aec0; font-size: 12px; margin: 0;">
        © 2025 Cryptic Solutions. All rights reserved.
      </p>
    </div>
  </body>
</html>
```

---

## 4. Change Email Address

### Subject

```
Confirm your new email address - Cryptic Solutions
```

### Body (HTML)

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body
    style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1B2242; max-width: 600px; margin: 0 auto; padding: 20px;"
  >
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1B2242; font-size: 24px; margin-bottom: 10px;">
        Confirm Email Change
      </h1>
    </div>

    <div
      style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 24px;"
    >
      <p style="color: #4a5568; margin-bottom: 20px;">
        You requested to change your email address. Please confirm this new
        email address by clicking the button below.
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <a
          href="{{ .ConfirmationURL }}"
          style="display: inline-block; background: #93E030; color: #1B2242; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px;"
        >
          Confirm New Email
        </a>
      </div>

      <p style="color: #718096; font-size: 14px; margin-bottom: 0;">
        If you didn't request this change, please contact support immediately.
      </p>
    </div>

    <div
      style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;"
    >
      <p style="color: #718096; font-size: 14px; margin-bottom: 8px;">
        Need help? Contact us at
        <a
          href="mailto:crypticsolutions.contact@gmail.com"
          style="color: #93E030;"
          >crypticsolutions.contact@gmail.com</a
        >
      </p>
      <p style="color: #a0aec0; font-size: 12px; margin: 0;">
        © 2025 Cryptic Solutions. All rights reserved.
      </p>
    </div>
  </body>
</html>
```

---

## Setup Instructions

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. For each template type:
   - Click on the template name
   - Replace the **Subject** with the provided subject
   - Replace the **Body** with the provided HTML
   - Click **Save**

### Important Notes

- The `{{ .ConfirmationURL }}` variable is automatically replaced by Supabase with the actual confirmation link
- Brand colors used:
  - Primary Green: `#93E030`
  - Navy: `#1B2242`
- All templates are mobile-responsive
- Test emails after configuration by creating a test account

### Optional: Custom SMTP

For better deliverability (avoid spam folder), consider setting up custom SMTP:

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Enable custom SMTP
3. Configure with your email provider (e.g., SendGrid, Mailgun, Amazon SES)
4. Use a sender email like `noreply@crypticsolutions.com` (requires domain verification)
