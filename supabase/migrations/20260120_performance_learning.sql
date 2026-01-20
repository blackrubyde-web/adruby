-- Performance Learning Tables
-- Tracks ad performance to improve future generations

-- Main performance tracking table
CREATE TABLE IF NOT EXISTS ad_performance_learning (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID,  -- Reference to generated creative (no FK to avoid migration order issues)
    
    -- Performance metrics
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    spend DECIMAL(10, 2) DEFAULT 0,
    
    -- Calculated metrics
    ctr DECIMAL(5, 2) DEFAULT 0,        -- Click-through rate %
    cvr DECIMAL(5, 2) DEFAULT 0,        -- Conversion rate %
    cpc DECIMAL(10, 2) DEFAULT 0,       -- Cost per click
    cpa DECIMAL(10, 2) DEFAULT 0,       -- Cost per acquisition
    roas DECIMAL(5, 2) DEFAULT 0,       -- Return on ad spend
    performance_score INTEGER DEFAULT 0, -- 0-100 score
    
    -- Creative dimensions for learning
    headline_formula TEXT,
    cta_style TEXT,
    color_palette TEXT,
    layout TEXT,
    industry TEXT,
    effects JSONB DEFAULT '[]',
    text_position TEXT,
    
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Aggregated insights table (learned patterns)
CREATE TABLE IF NOT EXISTS ad_creative_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dimension being tracked
    dimension TEXT NOT NULL,  -- headline_formula, cta_style, color_palette, etc.
    value TEXT NOT NULL,      -- The specific value (e.g., 'premium', 'pulsingGlow')
    
    -- Learning metrics
    avg_score DECIMAL(5, 2) DEFAULT 0,  -- Exponential moving average score
    sample_count INTEGER DEFAULT 0,      -- Number of samples
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(dimension, value)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_performance_ad_id ON ad_performance_learning(ad_id);
CREATE INDEX IF NOT EXISTS idx_performance_recorded_at ON ad_performance_learning(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_score ON ad_performance_learning(performance_score DESC);
CREATE INDEX IF NOT EXISTS idx_insights_dimension ON ad_creative_insights(dimension, avg_score DESC);

-- Enable RLS
ALTER TABLE ad_performance_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_creative_insights ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Service role can manage performance data" ON ad_performance_learning
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage insights" ON ad_creative_insights
    FOR ALL USING (true) WITH CHECK (true);

-- Comments
COMMENT ON TABLE ad_performance_learning IS 'Tracks individual ad performance for machine learning';
COMMENT ON TABLE ad_creative_insights IS 'Aggregated learning insights from ad performance patterns';
