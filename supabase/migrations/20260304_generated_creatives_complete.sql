-- =============================================
-- COMPLETE generated_creatives TABLE
-- Creates the table with ALL columns needed by the app
-- Safe to run multiple times (IF NOT EXISTS / IF NOT EXISTS)
-- =============================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS generated_creatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Content
    thumbnail TEXT,
    image_url TEXT,
    outputs JSONB,
    inputs JSONB,
    prompt TEXT,

    -- Classification
    media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    archetype TEXT,
    format TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Scoring
    ad_score INTEGER,
    metrics JSONB DEFAULT '{}'::jsonb,

    -- State
    saved BOOLEAN DEFAULT false,

    -- Video-specific
    video_url TEXT,
    video_bucket TEXT,
    video_path TEXT,
    video_thumbnail_url TEXT,
    video_duration_ms INTEGER,
    video_aspect_ratio TEXT,
    video_resolution TEXT,
    video_has_audio BOOLEAN DEFAULT false,
    video_archetype TEXT,
    video_script JSONB,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add any missing columns (safe for existing tables)
DO $$
BEGIN
    -- Core columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_creatives' AND column_name = 'image_url') THEN
        ALTER TABLE generated_creatives ADD COLUMN image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_creatives' AND column_name = 'prompt') THEN
        ALTER TABLE generated_creatives ADD COLUMN prompt TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_creatives' AND column_name = 'archetype') THEN
        ALTER TABLE generated_creatives ADD COLUMN archetype TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_creatives' AND column_name = 'format') THEN
        ALTER TABLE generated_creatives ADD COLUMN format TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_creatives' AND column_name = 'tags') THEN
        ALTER TABLE generated_creatives ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_creatives' AND column_name = 'metadata') THEN
        ALTER TABLE generated_creatives ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_creatives' AND column_name = 'ad_score') THEN
        ALTER TABLE generated_creatives ADD COLUMN ad_score INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_creatives' AND column_name = 'media_type') THEN
        ALTER TABLE generated_creatives ADD COLUMN media_type TEXT DEFAULT 'image';
    END IF;

    -- Video columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_creatives' AND column_name = 'video_url') THEN
        ALTER TABLE generated_creatives ADD COLUMN video_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_creatives' AND column_name = 'video_bucket') THEN
        ALTER TABLE generated_creatives ADD COLUMN video_bucket TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_creatives' AND column_name = 'video_path') THEN
        ALTER TABLE generated_creatives ADD COLUMN video_path TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_creatives' AND column_name = 'video_thumbnail_url') THEN
        ALTER TABLE generated_creatives ADD COLUMN video_thumbnail_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_creatives' AND column_name = 'video_duration_ms') THEN
        ALTER TABLE generated_creatives ADD COLUMN video_duration_ms INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_creatives' AND column_name = 'video_aspect_ratio') THEN
        ALTER TABLE generated_creatives ADD COLUMN video_aspect_ratio TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_creatives' AND column_name = 'video_resolution') THEN
        ALTER TABLE generated_creatives ADD COLUMN video_resolution TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_creatives' AND column_name = 'video_has_audio') THEN
        ALTER TABLE generated_creatives ADD COLUMN video_has_audio BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_creatives' AND column_name = 'video_archetype') THEN
        ALTER TABLE generated_creatives ADD COLUMN video_archetype TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_creatives' AND column_name = 'video_script') THEN
        ALTER TABLE generated_creatives ADD COLUMN video_script JSONB;
    END IF;
END $$;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_generated_creatives_user_id
    ON generated_creatives(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_creatives_saved
    ON generated_creatives(saved) WHERE saved = true;
CREATE INDEX IF NOT EXISTS idx_generated_creatives_created_at
    ON generated_creatives(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_creatives_media_type
    ON generated_creatives(media_type) WHERE media_type = 'video';

-- 4. RLS
ALTER TABLE generated_creatives ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'generated_creatives' AND policyname = 'Users can view own creatives') THEN
        CREATE POLICY "Users can view own creatives" ON generated_creatives FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'generated_creatives' AND policyname = 'Users can insert own creatives') THEN
        CREATE POLICY "Users can insert own creatives" ON generated_creatives FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'generated_creatives' AND policyname = 'Users can update own creatives') THEN
        CREATE POLICY "Users can update own creatives" ON generated_creatives FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'generated_creatives' AND policyname = 'Users can delete own creatives') THEN
        CREATE POLICY "Users can delete own creatives" ON generated_creatives FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 5. Service role full access
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'generated_creatives' AND policyname = 'Service role full access') THEN
        CREATE POLICY "Service role full access" ON generated_creatives FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 6. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_generated_creatives_updated_at ON generated_creatives;
CREATE TRIGGER update_generated_creatives_updated_at
    BEFORE UPDATE ON generated_creatives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Grants
GRANT ALL ON generated_creatives TO authenticated;
GRANT ALL ON generated_creatives TO service_role;

-- 8. Veo Quota table
CREATE TABLE IF NOT EXISTS veo_quota (
    id TEXT PRIMARY KEY DEFAULT 'global',
    requests_this_minute INTEGER DEFAULT 0,
    requests_this_day INTEGER DEFAULT 0,
    last_minute_reset TIMESTAMPTZ DEFAULT now(),
    last_day_reset TIMESTAMPTZ DEFAULT now(),
    quota_exhausted BOOLEAN DEFAULT false,
    quota_reset_at TIMESTAMPTZ,
    consecutive_errors INTEGER DEFAULT 0,
    total_videos_generated INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO veo_quota (id) VALUES ('global') ON CONFLICT DO NOTHING;
GRANT ALL ON veo_quota TO service_role;

DO $$
BEGIN
    RAISE NOTICE '✅ generated_creatives + veo_quota — complete migration done!';
END $$;
