-- Core Meta Ads tables + connection metadata
-- Safe to re-run (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS public.facebook_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'facebook',
    facebook_user_id TEXT,
    access_token TEXT,
    ad_account_id TEXT,
    page_id TEXT,
    profile_picture TEXT,
    full_name TEXT,
    meta JSONB DEFAULT '{}'::jsonb,
    connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_sync_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_facebook_connections_user_provider
    ON public.facebook_connections(user_id, provider);

ALTER TABLE public.facebook_connections ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'facebook_connections'
    ) THEN
        CREATE POLICY "users_manage_own_facebook_connections"
        ON public.facebook_connections
        FOR ALL
        TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.update_facebook_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_facebook_connections_updated_at'
    ) THEN
        CREATE TRIGGER trigger_update_facebook_connections_updated_at
        BEFORE UPDATE ON public.facebook_connections
        FOR EACH ROW
        EXECUTE FUNCTION public.update_facebook_connections_updated_at();
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.meta_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    facebook_campaign_id TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    spend NUMERIC(12,2) DEFAULT 0,
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    ctr NUMERIC(8,3) DEFAULT 0,
    cpm NUMERIC(12,2) DEFAULT 0,
    roas NUMERIC(8,3) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    frequency NUMERIC(8,3) DEFAULT 0,
    revenue NUMERIC(12,2) DEFAULT 0,
    raw_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_meta_campaigns_user_facebook
    ON public.meta_campaigns(user_id, facebook_campaign_id);

CREATE INDEX IF NOT EXISTS idx_meta_campaigns_user_id
    ON public.meta_campaigns(user_id);

ALTER TABLE public.meta_campaigns ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'meta_campaigns'
    ) THEN
        CREATE POLICY "users_manage_own_meta_campaigns"
        ON public.meta_campaigns
        FOR ALL
        TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.update_meta_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_meta_campaigns_updated_at'
    ) THEN
        CREATE TRIGGER trigger_update_meta_campaigns_updated_at
        BEFORE UPDATE ON public.meta_campaigns
        FOR EACH ROW
        EXECUTE FUNCTION public.update_meta_campaigns_updated_at();
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.meta_insights_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    spend NUMERIC(12,2) DEFAULT 0,
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    ctr NUMERIC(8,3) DEFAULT 0,
    cpm NUMERIC(12,2) DEFAULT 0,
    frequency NUMERIC(8,3) DEFAULT 0,
    revenue NUMERIC(12,2) DEFAULT 0,
    roas NUMERIC(8,3) DEFAULT 0,
    cpa NUMERIC(12,2) DEFAULT 0,
    raw_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_meta_insights_daily_user_date
    ON public.meta_insights_daily(user_id, date);

ALTER TABLE public.meta_insights_daily ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'meta_insights_daily'
    ) THEN
        CREATE POLICY "users_manage_own_meta_insights_daily"
        ON public.meta_insights_daily
        FOR ALL
        TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.update_meta_insights_daily_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_meta_insights_daily_updated_at'
    ) THEN
        CREATE TRIGGER trigger_update_meta_insights_daily_updated_at
        BEFORE UPDATE ON public.meta_insights_daily
        FOR EACH ROW
        EXECUTE FUNCTION public.update_meta_insights_daily_updated_at();
    END IF;
END $$;
