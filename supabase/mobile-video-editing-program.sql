-- ============================================
-- Mobile Video Editing Programme registrations
-- ============================================

CREATE TABLE IF NOT EXISTS public.mobile_video_editing_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  email TEXT NOT NULL UNIQUE CHECK (email = lower(email)),
  phone TEXT,
  experience_level TEXT NOT NULL CHECK (
    experience_level IN ('new', 'beginner', 'intermediate')
  ),
  learning_goal TEXT,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (
    status IN ('registered', 'assessment_ready', 'submitted', 'completed')
  ),
  accepted_updates BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mobile_video_registrations_status_created
  ON public.mobile_video_editing_registrations(status, created_at DESC);

ALTER TABLE public.mobile_video_editing_registrations ENABLE ROW LEVEL SECURITY;

-- Registrations are created only through the server route using the service role.
-- No browser-facing policies are required.

