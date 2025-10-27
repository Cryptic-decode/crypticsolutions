# IELTS Manual Sales Implementation Guide

## Overview

This document outlines the implementation steps for the IELTS manual sales flow with Paystack payment integration and Supabase for data storage.

## Current Status

### ✅ Completed

1. Created `/ielts-manual` product page
2. Updated all "Get Manual" buttons to link to the product page
3. Set up Supabase infrastructure (client, types, schema)
4. Set up Paystack integration structure (API routes and client component)

### 📋 Next Steps Required

#### 1. Supabase Setup (You Need to Do This)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Run the SQL from `database-schema.sql` in your Supabase SQL Editor
3. Get your API credentials from Project Settings → API:
   - Project URL: Copy the URL under "Project Configuration"
   - Anon Key: Copy the "anon" public key under "Project API keys"
   - Service Role Key: Copy the "service_role" secret key under "Project API keys"
     - This key has admin access and is needed to store purchases before user authentication
     - Never expose this key to the client or commit it to version control

#### 2. Paystack Setup (You Need to Do This)

1. Go to [paystack.com](https://paystack.com) and create an account
2. Get your Public Key and Secret Key from Settings → API Keys & Webhooks
3. Set up a webhook URL: `https://yourdomain.com/api/payment/callback`

#### 3. Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Get this from Project Settings → API → service_role key

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 4. Complete Paystack Integration

The current implementation has placeholder code. You need to:

1. Install the Paystack SDK: `npm install paystack`
2. Update `app/api/payment/initiate/route.ts` to call Paystack API
3. Update `components/payment-paystack.tsx` to use Paystack inline payment
4. Implement proper webhook verification in `app/api/payment/callback/route.ts`

#### 5. Remaining Tasks

- Task 5: Create payment success page to collect user details
- Task 6: Set up Supabase Auth with email/password authentication
- Task 7: Store purchase data in Supabase (implemented structure, needs activation)
- Task 8: Create protected /dashboard route with Supabase Auth guards
- Task 9: Implement PDF viewer with watermarking
- Task 10: Disable download/print capabilities in PDF viewer
- Task 11: Set up email automation (Resend) to send access email
- Task 12: Add rate limiting and security measures
- Task 13: Test end-to-end flow

## Architecture

### Payment Flow

1. User clicks "Buy Now" on `/ielts-manual`
2. Payment initiated via Paystack (inline or hosted page)
3. Payment verified via webhook
4. Purchase stored in Supabase `purchases` table
5. User redirected to success page
6. User enters details → account created in Supabase Auth
7. User logs in → sees protected dashboard with PDF viewer
8. PDF is watermarked with user email for security

### Database Schema

- **users**: Extends Supabase auth.users
- **purchases**: Tracks all transactions
- **products**: Catalog of digital products

### Security Features

- Row Level Security (RLS) enabled
- Users can only see their own purchases
- PDF watermarking with user email
- Download/print disabled
- Transaction verification via Paystack webhooks

## Files Created

- `lib/supabase.ts` - Supabase client configuration
- `database-schema.sql` - Database schema with RLS policies
- `app/api/payment/initiate/route.ts` - Initialize payment
- `app/api/payment/callback/route.ts` - Handle payment webhook
- `components/payment-paystack.tsx` - Client payment component
