-- ============================================
-- Study Sessions & Streak Tracking
-- ============================================
-- This script creates a table to track daily study activity
-- so we can compute streaks (consecutive days studied).
--
-- Streak logic (computed client-side in use-study-streak.ts):
--   currentStreak  = consecutive days ending at the latest session date
--   longestStreak  = best ever streak
--   totalStudyDays = count of unique days with at least one session
--   todayStudied   = whether a session exists for today's date
--
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query).

-- 1. Create the study_sessions table
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- One row per user, per product, per day
  CONSTRAINT study_sessions_user_product_date_unique UNIQUE (user_id, product_id, session_date)
);

-- 2. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date
  ON public.study_sessions(user_id, session_date DESC);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_product
  ON public.study_sessions(user_id, product_id);

-- 3. Enable Row Level Security
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- 4. RLS policy — users can only manage their own study sessions
DROP POLICY IF EXISTS "Users manage their own study sessions" ON public.study_sessions;
CREATE POLICY "Users manage their own study sessions"
  ON public.study_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Trigger to keep updated_at in sync
CREATE OR REPLACE FUNCTION public.set_study_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_study_sessions_updated_at ON public.study_sessions;
CREATE TRIGGER trg_study_sessions_updated_at
BEFORE UPDATE ON public.study_sessions
FOR EACH ROW
EXECUTE FUNCTION public.set_study_sessions_updated_at();

-- ============================================
-- VERIFICATION QUERIES (run after setup)
-- ============================================
-- Check if table was created:
-- SELECT * FROM public.study_sessions LIMIT 10;
--
-- Check policies:
-- SELECT * FROM pg_policies WHERE tablename = 'study_sessions';
--
-- Example: Get study days for the current user:
-- SELECT DISTINCT session_date FROM public.study_sessions
-- WHERE user_id = auth.uid()
-- ORDER BY session_date DESC;
