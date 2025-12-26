-- COMBINED MIGRATION - Run this single file to create both tables
-- This is easier than running 001 and 002 separately

-- ============================================
-- PART 1: generated_creatives table
-- ============================================

-- Drop existing table if structure is wrong
DROP TABLE IF EXISTS generated_creatives CASCADE;

-- Create table
CREATE TABLE generated_creatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Content
    thumbnail TEXT,
    outputs JSONB,
    inputs JSONB,
    
    -- Metadata
    saved BOOLEAN DEFAULT false,
    metrics JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_generated_creatives_user_id ON generated_creatives(user_id);
CREATE INDEX idx_generated_creatives_saved ON generated_creatives(saved) WHERE saved = true;
CREATE INDEX idx_generated_creatives_created_at ON generated_creatives(created_at DESC);

-- Enable RLS
ALTER TABLE generated_creatives ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own creatives" ON generated_creatives FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own creatives" ON generated_creatives FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own creatives" ON generated_creatives FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own creatives" ON generated_creatives FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON generated_creatives TO authenticated;
GRANT ALL ON generated_creatives TO service_role;

-- ============================================
-- PART 2: meta_insights_daily table
-- ============================================

-- Drop existing table if structure is wrong
DROP TABLE IF EXISTS meta_insights_daily CASCADE;

-- Create table
CREATE TABLE meta_insights_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Meta Ad Account Info
    ad_account_id TEXT NOT NULL,
    campaign_id TEXT,
    adset_id TEXT,
    ad_id TEXT,
    
    -- Date
    date DATE NOT NULL,
    
    -- Performance Metrics
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    spend NUMERIC(10, 2) DEFAULT 0,
    revenue NUMERIC(10, 2) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    
    -- Calculated Metrics
    ctr NUMERIC(5, 2) DEFAULT 0,
    cpc NUMERIC(10, 2) DEFAULT 0,
    cpm NUMERIC(10, 2) DEFAULT 0,
    roas NUMERIC(10, 2) DEFAULT 0,
    
    -- Raw Data
    raw_data JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_meta_insights_user_id ON meta_insights_daily(user_id);
CREATE INDEX idx_meta_insights_date ON meta_insights_daily(date DESC);
CREATE INDEX idx_meta_insights_ad_account ON meta_insights_daily(ad_account_id);
CREATE INDEX idx_meta_insights_campaign ON meta_insights_daily(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX idx_meta_insights_user_date ON meta_insights_daily(user_id, date DESC);

-- Add unique constraint
ALTER TABLE meta_insights_daily
ADD CONSTRAINT unique_meta_insight_daily
UNIQUE (user_id, ad_account_id, date, campaign_id, adset_id, ad_id);

-- Enable RLS
ALTER TABLE meta_insights_daily ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own insights" ON meta_insights_daily FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON meta_insights_daily FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON meta_insights_daily FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own insights" ON meta_insights_daily FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON meta_insights_daily TO authenticated;
GRANT ALL ON meta_insights_daily TO service_role;

-- ============================================
-- SHARED: Trigger function for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_generated_creatives_updated_at
    BEFORE UPDATE ON generated_creatives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meta_insights_daily_updated_at
    BEFORE UPDATE ON meta_insights_daily
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Success
SELECT 'Migration completed successfully! ✅' AS status;
