-- ============================================
-- Lydei Standalone App — Database Schema
-- ============================================
-- Run this SQL in your **Lydei Supabase** SQL Editor.
-- This is a separate Supabase project from Cryptic Solutions.
-- It only needs the purchases table (instant download flow, no accounts).
--
-- Usage:
--   1. Open your Lydei Supabase Dashboard → SQL Editor → New Query
--   2. Paste this entire file
--   3. Run it
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Purchases table
-- ============================================
-- Tracks ebook purchases for instant download.
-- No user accounts needed — just email + transaction reference.
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Customer',
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  user_id UUID DEFAULT NULL,        -- Always NULL for instant download (no account)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups by the download and verification routes
CREATE INDEX IF NOT EXISTS idx_lydei_purchases_transaction_id ON purchases(transaction_id);
CREATE INDEX IF NOT EXISTS idx_lydei_purchases_email ON purchases(email);
CREATE INDEX IF NOT EXISTS idx_lydei_purchases_product_id ON purchases(product_id);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
-- The kitchen-ebook-success and download routes use the service role key,
-- so RLS doesn't block them. We still enable it for safety.
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by API routes)
CREATE POLICY "Service role full access" ON purchases
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Allow anonymous users to insert purchases (for the success callback)
CREATE POLICY "Anonymous insert purchases" ON purchases
  FOR INSERT
  WITH CHECK (auth.role() = 'anon' OR auth.role() IS NULL);

-- ============================================
-- Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lydei_purchases_updated_at BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Verify the table was created
-- ============================================
-- SELECT * FROM information_schema.tables WHERE table_name = 'purchases';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'purchases';
