-- AI Generations Table for persistence and rate limiting
-- Run this in Supabase SQL Editor

-- 1. Create ai_generations table
CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  type TEXT NOT NULL DEFAULT 'ad', -- 'ad', 'image', 'copy'
  input JSONB NOT NULL DEFAULT '{}',
  output JSONB NOT NULL DEFAULT '{}',
  quality_score NUMERIC(3,1),
  engagement_score NUMERIC(3,1),
  credits_used INTEGER DEFAULT 0,
  template_id TEXT,
  generation_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_generations_user ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_created ON ai_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_generations_type ON ai_generations(type);

-- 3. Enable RLS
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "Users can view own generations" ON ai_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert" ON ai_generations
  FOR INSERT WITH CHECK (true);

-- 5. Grant permissions
GRANT SELECT ON ai_generations TO authenticated;
GRANT INSERT ON ai_generations TO service_role;

-- Done! The ai-ad-generate function will now persist all generations.
