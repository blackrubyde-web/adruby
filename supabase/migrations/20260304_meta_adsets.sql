-- Meta Ad Sets table for storing ad set level insights
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS meta_adsets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  facebook_adset_id TEXT NOT NULL,
  facebook_campaign_id TEXT,
  name TEXT,
  campaign_name TEXT,
  status TEXT DEFAULT 'active',
  spend NUMERIC DEFAULT 0,
  impressions NUMERIC DEFAULT 0,
  clicks NUMERIC DEFAULT 0,
  conversions NUMERIC DEFAULT 0,
  ctr NUMERIC DEFAULT 0,
  cpm NUMERIC DEFAULT 0,
  roas NUMERIC DEFAULT 0,
  frequency NUMERIC DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, facebook_adset_id)
);

-- Enable RLS
ALTER TABLE meta_adsets ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own ad sets
CREATE POLICY "Users read own ad sets" ON meta_adsets
  FOR SELECT USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_meta_adsets_user ON meta_adsets(user_id);
CREATE INDEX IF NOT EXISTS idx_meta_adsets_campaign ON meta_adsets(facebook_campaign_id);
