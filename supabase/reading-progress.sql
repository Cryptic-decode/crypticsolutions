-- ============================================
-- Reading Progress Tracking for Cryptic Solutions
-- ============================================
-- This script creates a table to track per-user reading progress
-- for course materials (e.g. the IELTS manual).
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query).
--
-- It is designed to:
-- - Store the last page a user reached for a given product
-- - Optionally track cumulative reading time in seconds
-- - Enforce that users can only read/update their own progress

-- 1. Create the reading_progress table
CREATE TABLE IF NOT EXISTS public.reading_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  last_page INTEGER NOT NULL DEFAULT 0,
  total_read_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Unique constraint for upsert on (user_id, product_id)
ALTER TABLE public.reading_progress
  DROP CONSTRAINT IF EXISTS reading_progress_user_product_unique;
ALTER TABLE public.reading_progress
  ADD CONSTRAINT reading_progress_user_product_unique UNIQUE (user_id, product_id);

-- 3. Index for fast lookups (the unique constraint already creates one, but explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_product
  ON public.reading_progress(user_id, product_id);

-- 3. Enable Row Level Security
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

-- 4. RLS policy - users can only manage their own reading progress
DROP POLICY IF EXISTS "Users manage their own reading progress" ON public.reading_progress;
CREATE POLICY "Users manage their own reading progress"
  ON public.reading_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Trigger to keep updated_at in sync
CREATE OR REPLACE FUNCTION public.set_reading_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reading_progress_updated_at ON public.reading_progress;
CREATE TRIGGER trg_reading_progress_updated_at
BEFORE UPDATE ON public.reading_progress
FOR EACH ROW
EXECUTE FUNCTION public.set_reading_progress_updated_at();

-- ============================================
-- VERIFICATION QUERIES (run after setup)
-- ============================================
-- Check if table was created:
-- SELECT * FROM public.reading_progress LIMIT 10;
--
-- Check policies:
-- SELECT * FROM pg_policies WHERE tablename = 'reading_progress';
--
-- Example: Get a user's progress for the IELTS manual:
-- SELECT * FROM public.reading_progress
-- WHERE user_id = auth.uid() AND product_id = 'ielts-manual';


