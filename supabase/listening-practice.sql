-- ============================================
-- Phase 4: Listening Practice
-- ============================================
-- Run practice-foundation.sql and reading-practice.sql before this file.

ALTER TABLE public.practice_sections
  ADD COLUMN IF NOT EXISTS audio_script JSONB;

ALTER TABLE public.practice_ai_generations
  ADD COLUMN IF NOT EXISTS skill TEXT NOT NULL DEFAULT 'reading'
    CHECK (skill IN ('reading', 'listening', 'writing', 'speaking')),
  ADD COLUMN IF NOT EXISTS audio_model TEXT,
  ADD COLUMN IF NOT EXISTS audio_bytes INTEGER CHECK (audio_bytes IS NULL OR audio_bytes > 0);

-- Generated practice audio is private. Learners receive short-lived signed URLs
-- only after server-side authentication and purchase checks.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'practice-audio',
  'practice-audio',
  FALSE,
  26214400,
  ARRAY['audio/wav']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- No browser-facing storage policies are added. The service role uploads audio
-- and creates signed URLs after checking the learner's entitlement.

-- Verification
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'practice_sections'
--   AND column_name = 'audio_script';
-- SELECT id, public, file_size_limit FROM storage.buckets
-- WHERE id = 'practice-audio';
