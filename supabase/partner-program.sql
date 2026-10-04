-- Cryptic Partner Programme application intake
-- Run this file in the Supabase SQL editor before publishing /partners.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS partner_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_type TEXT NOT NULL CHECK (partner_type IN ('individual', 'organisation', 'community', 'academy')),
  full_name TEXT NOT NULL,
  organisation_name TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  audience_description TEXT NOT NULL,
  payout_schedule TEXT NOT NULL CHECK (payout_schedule IN ('biweekly', 'monthly')),
  requested_referral_code TEXT NOT NULL,
  commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 20.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  accepted_terms BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (partner_type = 'individual' OR NULLIF(BTRIM(organisation_name), '') IS NOT NULL),
  CHECK (requested_referral_code ~ '^[A-Z0-9][A-Z0-9-]{2,18}[A-Z0-9]$')
);

-- Safe to rerun after the table has already been created. This expands the
-- original partner type constraint without changing existing applications.
ALTER TABLE partner_applications
  DROP CONSTRAINT IF EXISTS partner_applications_partner_type_check;

ALTER TABLE partner_applications
  ADD CONSTRAINT partner_applications_partner_type_check
  CHECK (partner_type IN ('individual', 'organisation', 'community', 'academy'));

CREATE UNIQUE INDEX IF NOT EXISTS partner_applications_email_unique
  ON partner_applications (LOWER(email));

CREATE UNIQUE INDEX IF NOT EXISTS partner_applications_referral_code_unique
  ON partner_applications (UPPER(requested_referral_code));

CREATE INDEX IF NOT EXISTS partner_applications_status_created_at
  ON partner_applications (status, created_at DESC);

ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;

-- No public policies are created. Applications are submitted through the
-- server route using the Supabase service role and remain private by default.

CREATE OR REPLACE FUNCTION update_partner_application_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_partner_application_updated_at ON partner_applications;
CREATE TRIGGER set_partner_application_updated_at
  BEFORE UPDATE ON partner_applications
  FOR EACH ROW EXECUTE FUNCTION update_partner_application_updated_at();
