-- ============================================
-- Phase 3: Reading Practice
-- ============================================
-- Run practice-foundation.sql first, then run this file in Supabase SQL Editor.

ALTER TABLE public.practice_sets
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- One unfinished attempt per learner and practice set. Completed attempts remain as history.
CREATE UNIQUE INDEX IF NOT EXISTS idx_practice_attempts_one_in_progress
  ON public.practice_attempts(user_id, set_id)
  WHERE status = 'in_progress';

-- Server-side audit and durable rate-limit record for AI-assisted draft creation.
CREATE TABLE IF NOT EXISTS public.practice_ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID REFERENCES public.practice_sets(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  provider TEXT NOT NULL DEFAULT 'gemini',
  model TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('foundation', 'standard', 'challenging')),
  question_count INTEGER NOT NULL CHECK (question_count IN (6, 8, 10)),
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,
  duration_ms INTEGER NOT NULL CHECK (duration_ms >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_ai_generations_admin_time
  ON public.practice_ai_generations(created_by, created_at DESC);

ALTER TABLE public.practice_ai_generations ENABLE ROW LEVEL SECURITY;

-- No browser-facing policies are added. Admin server routes use the service role.

-- Verification
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'practice_sets'
--   AND column_name IN ('published_at', 'published_by');
-- SELECT * FROM public.practice_ai_generations ORDER BY created_at DESC LIMIT 10;
