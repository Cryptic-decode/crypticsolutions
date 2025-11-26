-- ============================================
-- Email Confirmation Tracking for Cryptic Solutions
-- ============================================
-- This script creates a table and trigger to track when users confirm their email.
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Create the signup_events table to log email confirmations
CREATE TABLE IF NOT EXISTS public.signup_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  event_type TEXT NOT NULL DEFAULT 'email_confirmed',
  confirmed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE
);

-- 2. Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_signup_events_user_id ON public.signup_events(user_id);
CREATE INDEX IF NOT EXISTS idx_signup_events_email ON public.signup_events(email);
CREATE INDEX IF NOT EXISTS idx_signup_events_notified ON public.signup_events(notified);
CREATE INDEX IF NOT EXISTS idx_signup_events_created_at ON public.signup_events(created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE public.signup_events ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policy - only service role can access this table
CREATE POLICY "Service role only" ON public.signup_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 5. Create the trigger function to log email confirmations
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when email_confirmed_at changes from NULL to a timestamp
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.signup_events (
      user_id,
      email,
      full_name,
      event_type,
      confirmed_at
    ) VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name',
      'email_confirmed',
      NEW.email_confirmed_at
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create the trigger on auth.users table
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;
CREATE TRIGGER on_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_confirmation();

-- 7. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.signup_events TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- ============================================
-- VERIFICATION QUERIES (run after setup)
-- ============================================

-- Check if table was created:
-- SELECT * FROM public.signup_events LIMIT 10;

-- Check if trigger exists:
-- SELECT trigger_name, event_manipulation, action_statement 
-- FROM information_schema.triggers 
-- WHERE trigger_name = 'on_email_confirmed';

-- Test: After a user confirms their email, run:
-- SELECT * FROM public.signup_events ORDER BY created_at DESC LIMIT 5;

