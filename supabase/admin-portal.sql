-- Minimal additions for the internal admin portal.
-- Run this after supabase/partner-program.sql.

ALTER TABLE partner_applications
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by TEXT,
  ADD COLUMN IF NOT EXISTS review_note TEXT;

-- Create the admin account in Supabase Authentication, then run the statement
-- below once with the account's real email address. The role is stored in
-- protected app metadata, so users cannot grant it to themselves.
--
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"admin"}'::jsonb
WHERE LOWER(email) = LOWER('your-admin-email@example.com');
