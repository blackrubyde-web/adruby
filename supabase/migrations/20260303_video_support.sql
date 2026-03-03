-- =============================================
-- VIDEO SUPPORT MIGRATION
-- Adds video columns to generated_creatives
-- and creates veo_quota tracking table
-- =============================================

-- 1. New columns on generated_creatives
ALTER TABLE generated_creatives
  ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image'
    CHECK (media_type IN ('image', 'video')),
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS video_bucket TEXT,
  ADD COLUMN IF NOT EXISTS video_path TEXT,
  ADD COLUMN IF NOT EXISTS video_thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS video_duration_ms INTEGER,
  ADD COLUMN IF NOT EXISTS video_aspect_ratio TEXT,
  ADD COLUMN IF NOT EXISTS video_resolution TEXT,
  ADD COLUMN IF NOT EXISTS video_has_audio BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS video_archetype TEXT,
  ADD COLUMN IF NOT EXISTS video_script JSONB;

-- 2. Veo Quota Tracking (mirrors gemini_quota pattern)
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

-- 3. Index for video queries
CREATE INDEX IF NOT EXISTS idx_generated_creatives_media_type
  ON generated_creatives (media_type)
  WHERE media_type = 'video';

-- NOTE: A 'creative-videos' storage bucket must be created
-- manually in the Supabase Dashboard:
--   Name: creative-videos
--   Public: true
--   File size limit: 100MB
--   Allowed MIME types: video/mp4, video/webm
