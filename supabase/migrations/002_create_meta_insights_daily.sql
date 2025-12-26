-- Migration: Create meta_insights_daily table
-- Description: Stores daily Meta Ads insights and performance metrics
-- 
-- Usage: Run this in Supabase SQL Editor

-- Create table if not exists
CREATE TABLE IF NOT EXISTS meta_insights_daily (
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
    
    -- Raw Data (full Meta API response)
    raw_data JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Unique constraint to prevent duplicates
    CONSTRAINT unique_meta_insight_daily 
        UNIQUE (user_id, ad_account_id, date, campaign_id, adset_id, ad_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meta_insights_user_id 
    ON meta_insights_daily(user_id);
    
CREATE INDEX IF NOT EXISTS idx_meta_insights_date 
    ON meta_insights_daily(date DESC);
    
CREATE INDEX IF NOT EXISTS idx_meta_insights_ad_account 
    ON meta_insights_daily(ad_account_id);
    
CREATE INDEX IF NOT EXISTS idx_meta_insights_campaign 
    ON meta_insights_daily(campaign_id) 
    WHERE campaign_id IS NOT NULL;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_meta_insights_user_date 
    ON meta_insights_daily(user_id, date DESC);

-- Enable Row Level Security
ALTER TABLE meta_insights_daily ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
    -- Policy: Users can read their own insights
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'meta_insights_daily' 
        AND policyname = 'Users can view own insights'
    ) THEN
        CREATE POLICY "Users can view own insights"
            ON meta_insights_daily
            FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    -- Policy: Users can insert their own insights
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'meta_insights_daily' 
        AND policyname = 'Users can insert own insights'
    ) THEN
        CREATE POLICY "Users can insert own insights"
            ON meta_insights_daily
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Policy: Users can update their own insights
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'meta_insights_daily' 
        AND policyname = 'Users can update own insights'
    ) THEN
        CREATE POLICY "Users can update own insights"
            ON meta_insights_daily
            FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Policy: Users can delete their own insights
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'meta_insights_daily' 
        AND policyname = 'Users can delete own insights'
    ) THEN
        CREATE POLICY "Users can delete own insights"
            ON meta_insights_daily
            FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add trigger for updated_at (reuse function from previous migration)
DROP TRIGGER IF EXISTS update_meta_insights_daily_updated_at ON meta_insights_daily;
CREATE TRIGGER update_meta_insights_daily_updated_at
    BEFORE UPDATE ON meta_insights_daily
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON meta_insights_daily TO authenticated;
GRANT ALL ON meta_insights_daily TO service_role;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ Migration completed: meta_insights_daily table created with RLS policies';
END $$;
