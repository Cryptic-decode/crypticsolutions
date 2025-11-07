# Testing Guide - Data Foundation Phase

## End-to-End Testing: Purchase → Sign In → View Purchases in Dashboard

This guide provides step-by-step instructions for testing the complete user flow from purchase to viewing purchases in the dashboard.

---

## Prerequisites

1. **Environment Setup**:

   - Ensure all environment variables are set in `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
     - `PAYSTACK_SECRET_KEY`

2. **Database Setup**:

   - Run `database-schema.sql` in Supabase SQL Editor
   - Verify RLS policies are enabled
   - Verify `purchases` table has `user_id` as nullable

3. **Supabase Auth Configuration**:
   - Email confirmation is enabled (default)
   - Email templates are configured
   - Redirect URL is set to `/signin`

---

## Test Flow

### Step 1: Make a Purchase

1. Navigate to `/ielts-manual`
2. Click "Buy Now" button
3. Complete payment via Paystack (use test card: `4084084084084081`)
4. After successful payment, you should be redirected to `/payment/success?reference=...`

**Expected Result**:

- ✅ Payment success page displays
- ✅ Form shows email and name from Paystack transaction
- ✅ "Create Account & Continue" button is visible

---

### Step 2: Create Account

1. On `/payment/success` page:
   - Verify email and name are pre-filled
   - Click "Create Account & Continue"

**Expected Result**:

- ✅ Account is created in Supabase Auth
- ✅ Purchase is stored in `purchases` table with:
  - `email`: User's email
  - `name`: User's name
  - `user_id`: `NULL` (not linked yet)
  - `status`: `'completed'`
- ✅ Redirected to `/account-created` page
- ✅ Temp password is displayed
- ✅ Confirmation email is sent

**Verify in Supabase**:

- Check `auth.users` table: User exists with `email_confirmed_at = NULL`
- Check `purchases` table: Purchase exists with `user_id = NULL`

---

### Step 3: Confirm Email

1. Check your email inbox (or spam folder)
2. Click the confirmation link in the email
3. You should be redirected to `/signin`

**Expected Result**:

- ✅ Email confirmation link works
- ✅ Redirected to `/signin` page
- ✅ Email is pre-filled in sign-in form

**Verify in Supabase**:

- Check `auth.users` table: User has `email_confirmed_at` set (timestamp)

---

### Step 4: Sign In

1. On `/signin` page:
   - Email should be pre-filled
   - Enter the temp password from `/account-created` page
   - Click "Sign In"

**Expected Result**:

- ✅ Sign-in succeeds (email is confirmed)
- ✅ Redirected to `/dashboard`
- ✅ Dashboard displays user's email

**Verify in Browser Console**:

- No errors should appear
- Check Network tab: `/api/purchases/link` should be called

---

### Step 5: View Purchases in Dashboard

1. On `/dashboard` page:
   - Wait for purchases to load
   - Check "My Library" section

**Expected Result**:

- ✅ "Linking your purchases..." indicator appears briefly (if purchases need linking)
- ✅ Purchase appears in "My Library" section:
  - Product name: "IELTS Preparation Manual"
  - Description: "Complete study guide for IELTS exam"
  - Status badge: "Active" (with CheckCircle icon)
  - Purchase date displayed
  - Action buttons: "Continue Reading" and "Study Progress"
- ✅ Stagger animation plays for purchase cards
- ✅ No errors in console

**Verify in Supabase**:

- Check `purchases` table: Purchase has `user_id` set (linked to user)
- Check RLS: User can only see their own purchases

---

## Edge Cases to Test

### 1. Multiple Purchases Before Email Confirmation

**Test**:

1. Make a purchase → Create account
2. Make another purchase with same email (before confirming)
3. Confirm email → Sign in

**Expected Result**:

- ✅ Both purchases are linked to user account
- ✅ Both purchases appear in dashboard

---

### 2. Sign In Without Email Confirmation

**Test**:

1. Make purchase → Create account
2. Try to sign in immediately (before confirming email)

**Expected Result**:

- ✅ Sign-in fails with error: "Please confirm your email before signing in..."
- ✅ User cannot access dashboard

---

### 3. No Purchases

**Test**:

1. Create account directly (without purchase)
2. Confirm email → Sign in

**Expected Result**:

- ✅ Dashboard shows empty state:
  - "No Purchases Yet" message
  - BookOpen icon
  - "Browse Products" button

---

### 4. Purchase Fetch Error

**Test**:

1. Temporarily break Supabase connection
2. Sign in to dashboard

**Expected Result**:

- ✅ Error state displays:
  - Red card with AlertCircle icon
  - Error message from hook
  - User can still see dashboard (other sections)

---

### 5. Linking Purchases Error

**Test**:

1. Make purchase → Create account
2. Temporarily break `/api/purchases/link` endpoint
3. Confirm email → Sign in

**Expected Result**:

- ✅ Linking indicator appears
- ✅ Error is logged in console
- ✅ Dashboard still loads (graceful degradation)
- ✅ Purchase may not appear (until linking succeeds)

---

## Verification Checklist

### Database Verification

- [ ] User exists in `auth.users` table
- [ ] User has `email_confirmed_at` set
- [ ] Purchase exists in `purchases` table
- [ ] Purchase has `user_id` set (after linking)
- [ ] Purchase has `status = 'completed'`
- [ ] RLS policies work (user can only see own purchases)

### UI Verification

- [ ] Payment success page displays correctly
- [ ] Account created page shows temp password
- [ ] Sign-in page works with email confirmation
- [ ] Dashboard displays purchases correctly
- [ ] Loading states work properly
- [ ] Error states display correctly
- [ ] Empty state displays when no purchases
- [ ] Animations work smoothly

### Functionality Verification

- [ ] Purchase is stored with correct data
- [ ] Account creation works
- [ ] Email confirmation works
- [ ] Sign-in requires email confirmation
- [ ] Purchase linking works automatically
- [ ] Purchases are fetched correctly
- [ ] RLS policies are enforced

---

## Common Issues & Solutions

### Issue: Purchase not appearing in dashboard

**Possible Causes**:

1. Email not confirmed → Check `email_confirmed_at` in Supabase
2. Purchase not linked → Check `user_id` in `purchases` table
3. RLS policy issue → Verify RLS policies in Supabase

**Solution**:

- Verify email is confirmed
- Check browser console for errors
- Manually call `/api/purchases/link` endpoint
- Check Supabase logs for RLS errors

---

### Issue: Sign-in fails even after email confirmation

**Possible Causes**:

1. Email confirmation not processed → Check Supabase Auth logs
2. Wrong password → Verify temp password from `/account-created`

**Solution**:

- Check `email_confirmed_at` in Supabase
- Verify password is correct
- Check browser console for specific error

---

### Issue: Linking indicator never disappears

**Possible Causes**:

1. API endpoint error → Check network tab
2. Email not confirmed → Check `email_confirmed_at`

**Solution**:

- Check browser console for errors
- Verify API endpoint is working
- Check Supabase logs

---

## Test Data

### Test Email

Use a real email address you can access for confirmation.

### Test Password

Temp password is generated automatically and displayed on `/account-created` page.

### Test Payment

Use Paystack test card: `4084084084084081`

---

## Success Criteria

✅ **All tests pass**:

- Purchase flow works end-to-end
- Account creation works
- Email confirmation works
- Sign-in requires confirmation
- Purchases are linked automatically
- Dashboard displays purchases correctly
- All edge cases handled gracefully

---

## Next Steps

After successful testing:

1. Document any issues found
2. Fix any bugs discovered
3. Update documentation if needed
4. Proceed to next phase of development

---

**Last Updated**: Phase 1 - Data Foundation
**Status**: Ready for Testing
