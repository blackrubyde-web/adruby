-- Supabase Migration: AI Decision History + Pattern Learning
-- This creates tables for the AI to learn and improve over time

-- ============================================
-- AI DECISION HISTORY
-- Tracks all AI decisions and their outcomes
-- ============================================
CREATE TABLE IF NOT EXISTS ai_decision_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Campaign Info
    campaign_id TEXT NOT NULL,
    campaign_name TEXT NOT NULL,
    
    -- Decision Details
    decision_type TEXT NOT NULL, -- pause, increase_budget, decrease_budget, duplicate, etc.
    decision_value INTEGER, -- e.g., 25 for +25% budget
    confidence INTEGER NOT NULL, -- 0-100
    reasoning TEXT,
    
    -- Scores at time of decision
    scores JSONB DEFAULT '{}',
    -- {overall, industryBenchmark, userHistory, patterns, realTimeSignals}
    
    -- Metrics at time of decision
    metrics_at_decision JSONB DEFAULT '{}',
    -- {roas, ctr, cpc, spend, revenue, conversions}
    
    -- Outcome tracking (filled in later)
    was_executed BOOLEAN DEFAULT FALSE,
    outcome_roas NUMERIC,
    outcome_ctr NUMERIC,
    outcome_spend NUMERIC,
    was_successful BOOLEAN,
    outcome_notes TEXT,
    outcome_measured_at TIMESTAMPTZ,
    
    -- Industry context
    industry_type TEXT DEFAULT 'ecom_d2c',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_ai_decision_history_user_id ON ai_decision_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_decision_history_campaign_id ON ai_decision_history(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ai_decision_history_decision_type ON ai_decision_history(decision_type);
CREATE INDEX IF NOT EXISTS idx_ai_decision_history_created_at ON ai_decision_history(created_at DESC);

-- ============================================
-- AI PATTERN STORE
-- Stores recognized patterns for each user
-- ============================================
CREATE TABLE IF NOT EXISTS ai_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Pattern Details
    pattern_type TEXT NOT NULL, -- fatigue, scaling_success, creative_decay, timing, audience
    pattern_name TEXT NOT NULL,
    description TEXT,
    
    -- Pattern Conditions
    conditions JSONB DEFAULT '{}',
    -- e.g., {metric: 'frequency', operator: '>', value: 3, timeframe: '7d'}
    
    -- Pattern Statistics
    occurrences INTEGER DEFAULT 1,
    success_rate NUMERIC DEFAULT 0.5, -- 0-1
    confidence NUMERIC DEFAULT 0.5, -- 0-1
    
    -- Learning Data
    last_triggered_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_patterns_user_id ON ai_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_patterns_type ON ai_patterns(pattern_type);

-- ============================================
-- AI USER PROFILE
-- Stores aggregated learning data per user
-- ============================================
CREATE TABLE IF NOT EXISTS ai_user_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Industry & Business Type
    primary_industry TEXT DEFAULT 'ecom_d2c',
    business_type TEXT,
    
    -- Historical Averages (updated periodically)
    avg_roas NUMERIC DEFAULT 0,
    avg_ctr NUMERIC DEFAULT 0,
    avg_cpc NUMERIC DEFAULT 0,
    avg_spend_per_campaign NUMERIC DEFAULT 0,
    
    -- Performance Percentiles
    roas_percentile_25 NUMERIC,
    roas_percentile_50 NUMERIC,
    roas_percentile_75 NUMERIC,
    
    -- Decision Stats
    total_decisions INTEGER DEFAULT 0,
    decisions_executed INTEGER DEFAULT 0,
    decisions_successful INTEGER DEFAULT 0,
    success_rate NUMERIC DEFAULT 0,
    
    -- Top Performing Patterns
    top_patterns JSONB DEFAULT '[]',
    
    -- Learning Metadata
    campaigns_analyzed INTEGER DEFAULT 0,
    last_analysis_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_user_profile_user_id ON ai_user_profile(user_id);

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Get user's decision history for learning
CREATE OR REPLACE FUNCTION get_user_decision_history(p_user_id UUID, p_limit INTEGER DEFAULT 100)
RETURNS TABLE (
    id UUID,
    campaign_id TEXT,
    decision_type TEXT,
    decision_value INTEGER,
    confidence INTEGER,
    was_executed BOOLEAN,
    was_successful BOOLEAN,
    metrics_at_decision JSONB,
    outcome_roas NUMERIC,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.campaign_id,
        h.decision_type,
        h.decision_value,
        h.confidence,
        h.was_executed,
        h.was_successful,
        h.metrics_at_decision,
        h.outcome_roas,
        h.created_at
    FROM ai_decision_history h
    WHERE h.user_id = p_user_id
    ORDER BY h.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's patterns
CREATE OR REPLACE FUNCTION get_user_patterns(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    pattern_type TEXT,
    pattern_name TEXT,
    description TEXT,
    conditions JSONB,
    success_rate NUMERIC,
    confidence NUMERIC,
    occurrences INTEGER,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.pattern_type,
        p.pattern_name,
        p.description,
        p.conditions,
        p.success_rate,
        p.confidence,
        p.occurrences,
        p.is_active
    FROM ai_patterns p
    WHERE p.user_id = p_user_id AND p.is_active = TRUE
    ORDER BY p.confidence DESC, p.occurrences DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user profile with new averages
CREATE OR REPLACE FUNCTION update_user_ai_profile(
    p_user_id UUID,
    p_avg_roas NUMERIC,
    p_avg_ctr NUMERIC,
    p_avg_cpc NUMERIC,
    p_campaigns_analyzed INTEGER
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO ai_user_profile (user_id, avg_roas, avg_ctr, avg_cpc, campaigns_analyzed, last_analysis_at)
    VALUES (p_user_id, p_avg_roas, p_avg_ctr, p_avg_cpc, p_campaigns_analyzed, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        avg_roas = EXCLUDED.avg_roas,
        avg_ctr = EXCLUDED.avg_ctr,
        avg_cpc = EXCLUDED.avg_cpc,
        campaigns_analyzed = EXCLUDED.campaigns_analyzed,
        last_analysis_at = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record decision outcome (called 7 days after decision)
CREATE OR REPLACE FUNCTION record_decision_outcome(
    p_decision_id UUID,
    p_outcome_roas NUMERIC,
    p_outcome_ctr NUMERIC,
    p_was_successful BOOLEAN,
    p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE ai_decision_history
    SET 
        outcome_roas = p_outcome_roas,
        outcome_ctr = p_outcome_ctr,
        was_successful = p_was_successful,
        outcome_notes = p_notes,
        outcome_measured_at = NOW(),
        updated_at = NOW()
    WHERE id = p_decision_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE ai_decision_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_user_profile ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_decision_history
CREATE POLICY "Users can view own decision history" ON ai_decision_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decisions" ON ai_decision_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decisions" ON ai_decision_history
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_patterns
CREATE POLICY "Users can view own patterns" ON ai_patterns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own patterns" ON ai_patterns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patterns" ON ai_patterns
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own patterns" ON ai_patterns
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ai_user_profile
CREATE POLICY "Users can view own profile" ON ai_user_profile
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON ai_user_profile
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON ai_user_profile
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- AI CHAT MEMORY
-- Stores conversation history for persistent memory across sessions
-- ============================================
CREATE TABLE IF NOT EXISTS ai_chat_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Message Info
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    
    -- Context at time of message
    campaign_context JSONB DEFAULT '{}',
    
    -- Metadata
    tokens_used INTEGER DEFAULT 0,
    model_used TEXT DEFAULT 'gpt-4o',
    
    -- Learning flags
    was_helpful BOOLEAN, -- User feedback
    recommendation_given BOOLEAN DEFAULT FALSE,
    recommendation_followed BOOLEAN,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_ai_chat_memory_user_id ON ai_chat_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_memory_created_at ON ai_chat_memory(created_at DESC);

-- RLS for ai_chat_memory
ALTER TABLE ai_chat_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat history" ON ai_chat_memory
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON ai_chat_memory
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Get recent chat history for context
CREATE OR REPLACE FUNCTION get_chat_memory(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
    role TEXT,
    content TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.role,
        m.content,
        m.created_at
    FROM ai_chat_memory m
    WHERE m.user_id = p_user_id
    ORDER BY m.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
