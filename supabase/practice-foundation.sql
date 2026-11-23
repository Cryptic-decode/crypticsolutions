-- ============================================
-- IELTS Practice Foundation
-- ============================================
-- Creates the reusable content and attempt structure for Reading, Listening,
-- Writing, and Speaking practice. This script does not add sample exercises.
-- Run it in Supabase SQL Editor before publishing practice activities.

-- 1. Practice sets, such as "Reading Practice 1"
CREATE TABLE IF NOT EXISTS public.practice_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL DEFAULT 'ielts-manual',
  skill TEXT NOT NULL CHECK (skill IN ('reading', 'listening', 'writing', 'speaking')),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  instructions TEXT NOT NULL DEFAULT '',
  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT practice_sets_product_slug_unique UNIQUE (product_id, slug)
);

-- 2. Sections keep shared passages and audio separate from individual questions
CREATE TABLE IF NOT EXISTS public.practice_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID NOT NULL REFERENCES public.practice_sets(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  instructions TEXT NOT NULL DEFAULT '',
  source_text TEXT,
  media_url TEXT,
  position INTEGER NOT NULL CHECK (position >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT practice_sections_set_position_unique UNIQUE (set_id, position)
);

-- 3. Questions contain only learner-facing content
CREATE TABLE IF NOT EXISTS public.practice_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.practice_sections(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::JSONB CHECK (jsonb_typeof(options) = 'array'),
  points NUMERIC(7,2) NOT NULL DEFAULT 1 CHECK (points > 0),
  position INTEGER NOT NULL CHECK (position >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT practice_questions_section_position_unique UNIQUE (section_id, position)
);

-- 4. Answer keys are deliberately separate from learner-facing questions
CREATE TABLE IF NOT EXISTS public.practice_answer_keys (
  question_id UUID PRIMARY KEY REFERENCES public.practice_questions(id) ON DELETE CASCADE,
  correct_answer JSONB NOT NULL,
  explanation TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Attempts store the learner's overall state and result
CREATE TABLE IF NOT EXISTS public.practice_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  set_id UUID NOT NULL REFERENCES public.practice_sets(id) ON DELETE RESTRICT,
  product_id TEXT NOT NULL DEFAULT 'ielts-manual',
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  score NUMERIC(7,2) CHECK (score IS NULL OR score >= 0),
  max_score NUMERIC(7,2) CHECK (max_score IS NULL OR max_score > 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT practice_attempts_completion_check CHECK (
    (status = 'completed' AND completed_at IS NOT NULL)
    OR (status <> 'completed')
  )
);

-- 6. Submitted answers remain attached to their attempt
CREATE TABLE IF NOT EXISTS public.practice_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.practice_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.practice_questions(id) ON DELETE RESTRICT,
  answer JSONB NOT NULL,
  is_correct BOOLEAN,
  points_awarded NUMERIC(7,2) CHECK (points_awarded IS NULL OR points_awarded >= 0),
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT practice_answers_attempt_question_unique UNIQUE (attempt_id, question_id)
);

-- 7. Indexes for content order and learner history
CREATE INDEX IF NOT EXISTS idx_practice_sets_product_status
  ON public.practice_sets(product_id, status, skill, position);
CREATE INDEX IF NOT EXISTS idx_practice_sections_set_position
  ON public.practice_sections(set_id, position);
CREATE INDEX IF NOT EXISTS idx_practice_questions_section_position
  ON public.practice_questions(section_id, position);
CREATE INDEX IF NOT EXISTS idx_practice_attempts_user_started
  ON public.practice_attempts(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_practice_answers_attempt
  ON public.practice_answers(attempt_id);

-- 8. Row Level Security
ALTER TABLE public.practice_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Eligible learners read published practice sets" ON public.practice_sets;
CREATE POLICY "Eligible learners read published practice sets"
  ON public.practice_sets FOR SELECT
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM public.purchases
      WHERE purchases.user_id = auth.uid()
        AND purchases.product_id = practice_sets.product_id
        AND purchases.status = 'completed'
    )
  );

DROP POLICY IF EXISTS "Eligible learners read published practice sections" ON public.practice_sections;
CREATE POLICY "Eligible learners read published practice sections"
  ON public.practice_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.practice_sets
      JOIN public.purchases ON purchases.product_id = practice_sets.product_id
      WHERE practice_sets.id = practice_sections.set_id
        AND practice_sets.status = 'published'
        AND purchases.user_id = auth.uid()
        AND purchases.status = 'completed'
    )
  );

DROP POLICY IF EXISTS "Eligible learners read published practice questions" ON public.practice_questions;
CREATE POLICY "Eligible learners read published practice questions"
  ON public.practice_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.practice_sections
      JOIN public.practice_sets ON practice_sets.id = practice_sections.set_id
      JOIN public.purchases ON purchases.product_id = practice_sets.product_id
      WHERE practice_sections.id = practice_questions.section_id
        AND practice_sets.status = 'published'
        AND purchases.user_id = auth.uid()
        AND purchases.status = 'completed'
    )
  );

-- No learner policy is added to practice_answer_keys. Correct answers stay server-only.

DROP POLICY IF EXISTS "Learners read their own practice attempts" ON public.practice_attempts;
CREATE POLICY "Learners read their own practice attempts"
  ON public.practice_attempts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners read their own practice answers" ON public.practice_answers;
CREATE POLICY "Learners read their own practice answers"
  ON public.practice_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.practice_attempts
      WHERE practice_attempts.id = practice_answers.attempt_id
        AND practice_attempts.user_id = auth.uid()
    )
  );

-- Attempts, answers, scoring, and answer keys are written only by authenticated server routes.

-- 9. Keep updated_at values current
CREATE OR REPLACE FUNCTION public.set_practice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_practice_sets_updated_at ON public.practice_sets;
CREATE TRIGGER trg_practice_sets_updated_at BEFORE UPDATE ON public.practice_sets
FOR EACH ROW EXECUTE FUNCTION public.set_practice_updated_at();

DROP TRIGGER IF EXISTS trg_practice_sections_updated_at ON public.practice_sections;
CREATE TRIGGER trg_practice_sections_updated_at BEFORE UPDATE ON public.practice_sections
FOR EACH ROW EXECUTE FUNCTION public.set_practice_updated_at();

DROP TRIGGER IF EXISTS trg_practice_questions_updated_at ON public.practice_questions;
CREATE TRIGGER trg_practice_questions_updated_at BEFORE UPDATE ON public.practice_questions
FOR EACH ROW EXECUTE FUNCTION public.set_practice_updated_at();

DROP TRIGGER IF EXISTS trg_practice_answer_keys_updated_at ON public.practice_answer_keys;
CREATE TRIGGER trg_practice_answer_keys_updated_at BEFORE UPDATE ON public.practice_answer_keys
FOR EACH ROW EXECUTE FUNCTION public.set_practice_updated_at();

DROP TRIGGER IF EXISTS trg_practice_attempts_updated_at ON public.practice_attempts;
CREATE TRIGGER trg_practice_attempts_updated_at BEFORE UPDATE ON public.practice_attempts
FOR EACH ROW EXECUTE FUNCTION public.set_practice_updated_at();

DROP TRIGGER IF EXISTS trg_practice_answers_updated_at ON public.practice_answers;
CREATE TRIGGER trg_practice_answers_updated_at BEFORE UPDATE ON public.practice_answers
FOR EACH ROW EXECUTE FUNCTION public.set_practice_updated_at();

-- Verification
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name LIKE 'practice_%'
-- ORDER BY table_name;
