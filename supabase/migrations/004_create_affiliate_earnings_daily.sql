-- Migration: Create affiliate_earnings_daily table
-- Description: Track daily affiliate earnings for chart visualization and analytics
-- 
-- Usage: Run this in Supabase SQL Editor after 003_create_partner_applications.sql

-- Drop existing table if structure is wrong
DROP TABLE IF EXISTS affiliate_earnings_daily CASCADE;

-- Create table
CREATE TABLE affiliate_earnings_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Daily Metrics
    earnings NUMERIC(10, 2) DEFAULT 0.00,
    referrals_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Unique constraint: one record per affiliate per day
    UNIQUE(affiliate_user_id, date)
);

-- Create indexes
CREATE INDEX idx_affiliate_earnings_daily_user_date ON affiliate_earnings_daily(affiliate_user_id, date DESC);
CREATE INDEX idx_affiliate_earnings_daily_date ON affiliate_earnings_daily(date DESC);

-- Enable RLS
ALTER TABLE affiliate_earnings_daily ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
    -- Policy: Affiliates can view their own earnings
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'affiliate_earnings_daily' 
        AND policyname = 'Affiliates can view own earnings'
    ) THEN
        CREATE POLICY "Affiliates can view own earnings"
            ON affiliate_earnings_daily
            FOR SELECT
            USING (auth.uid() = affiliate_user_id);
    END IF;

    -- Policy: System can insert/update (for automated tracking)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'affiliate_earnings_daily' 
        AND policyname = 'Service role can manage earnings'
    ) THEN
        CREATE POLICY "Service role can manage earnings"
            ON affiliate_earnings_daily
            FOR ALL
            USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger
DROP TRIGGER IF EXISTS update_affiliate_earnings_daily_updated_at ON affiliate_earnings_daily;
CREATE TRIGGER update_affiliate_earnings_daily_updated_at
    BEFORE UPDATE ON affiliate_earnings_daily
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON affiliate_earnings_daily TO authenticated;
GRANT ALL ON affiliate_earnings_daily TO service_role;

-- Helper function: Get earnings for date range
CREATE OR REPLACE FUNCTION get_affiliate_earnings_range(
    p_affiliate_user_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    date DATE,
    earnings NUMERIC,
    referrals_count INTEGER,
    conversions_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aed.date,
        aed.earnings,
        aed.referrals_count,
        aed.conversions_count
    FROM affiliate_earnings_daily aed
    WHERE aed.affiliate_user_id = p_affiliate_user_id
        AND aed.date >= p_start_date
        AND aed.date <= p_end_date
    ORDER BY aed.date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ Migration completed: affiliate_earnings_daily table created';
END $$;
