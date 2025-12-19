-- Meta tokens + sync job tracking (service-role only tokens)

CREATE TABLE IF NOT EXISTS public.meta_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.facebook_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_meta_tokens_connection_id
  ON public.meta_tokens(connection_id);

CREATE INDEX IF NOT EXISTS idx_meta_tokens_user_id
  ON public.meta_tokens(user_id);

ALTER TABLE public.meta_tokens ENABLE ROW LEVEL SECURITY;

-- No policies: tokens are service-role only.

CREATE TABLE IF NOT EXISTS public.meta_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES public.facebook_connections(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL DEFAULT 'full',
  status TEXT NOT NULL DEFAULT 'running',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  error_message TEXT,
  meta JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_meta_sync_jobs_user_id
  ON public.meta_sync_jobs(user_id);

CREATE INDEX IF NOT EXISTS idx_meta_sync_jobs_connection_id
  ON public.meta_sync_jobs(connection_id);

ALTER TABLE public.meta_sync_jobs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'meta_sync_jobs'
  ) THEN
    CREATE POLICY "users_read_own_meta_sync_jobs"
    ON public.meta_sync_jobs
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
  END IF;
END $$;
