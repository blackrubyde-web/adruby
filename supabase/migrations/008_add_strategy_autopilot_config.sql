-- Strategy-Driven Autopilot - Schema Enhancement
-- Migration: 008_add_strategy_autopilot_config.sql

-- Add autopilot_config column to strategies table
ALTER TABLE strategies 
ADD COLUMN IF NOT EXISTS autopilot_config JSONB DEFAULT '{
  "enabled": false,
  "target_roas": 3.0,
  "max_daily_budget": 500,
  "scale_speed": "medium",
  "risk_tolerance": "medium",
  "pause_threshold_roas": 1.0,
  "scale_threshold_roas": 3.5,
  "max_budget_increase_pct": 0.3,
  "min_conversions_required": 10,
  "creative_rotation_days": 7
}'::jsonb;

-- ============================================
-- Strategy Template Functions
-- ============================================

-- Conservative Testing Template
CREATE OR REPLACE FUNCTION get_conservative_autopilot_config()
RETURNS JSONB AS $$
BEGIN
  RETURN '{
    "enabled": true,
    "target_roas": 2.5,
    "max_daily_budget": 300,
    "scale_speed": "slow",
    "risk_tolerance": "low",
    "pause_threshold_roas": 1.0,
    "scale_threshold_roas": 4.0,
    "max_budget_increase_pct": 0.2,
    "min_conversions_required": 20,
    "creative_rotation_days": 14
  }'::jsonb;
END;
$$ LANGUAGE plpgsql;

-- Aggressive Scaling Template
CREATE OR REPLACE FUNCTION get_aggressive_autopilot_config()
RETURNS JSONB AS $$
BEGIN
  RETURN '{
    "enabled": true,
    "target_roas": 3.0,
    "max_daily_budget": 1000,
    "scale_speed": "aggressive",
    "risk_tolerance": "high",
    "pause_threshold_roas": 0.8,
    "scale_threshold_roas": 3.0,
    "max_budget_increase_pct": 0.5,
    "min_conversions_required": 5,
    "creative_rotation_days": 5
  }'::jsonb;
END;
$$ LANGUAGE plpgsql;

-- Profit Maximization Template
CREATE OR REPLACE FUNCTION get_profit_autopilot_config()
RETURNS JSONB AS $$
BEGIN
  RETURN '{
    "enabled": true,
    "target_roas": 4.0,
    "max_daily_budget": 500,
    "scale_speed": "medium",
    "risk_tolerance": "medium",
    "pause_threshold_roas": 2.0,
    "scale_threshold_roas": 5.0,
    "max_budget_increase_pct": 0.3,
    "min_conversions_required": 15,
    "creative_rotation_days": 10
  }'::jsonb;
END;
$$ LANGUAGE plpgsql;

-- Balanced Growth Template
CREATE OR REPLACE FUNCTION get_balanced_autopilot_config()
RETURNS JSONB AS $$
BEGIN
  RETURN '{
    "enabled": true,
    "target_roas": 3.5,
    "max_daily_budget": 750,
    "scale_speed": "medium",
    "risk_tolerance": "medium",
    "pause_threshold_roas": 1.5,
    "scale_threshold_roas": 4.0,
    "max_budget_increase_pct": 0.3,
    "min_conversions_required": 12,
    "creative_rotation_days": 7
  }'::jsonb;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Validation Function
-- ============================================
CREATE OR REPLACE FUNCTION validate_autopilot_config(config JSONB)
RETURNS BOOLEAN AS $$
DECLARE
  required_keys TEXT[] := ARRAY[
    'enabled', 'target_roas', 'max_daily_budget', 'scale_speed',
    'risk_tolerance', 'pause_threshold_roas', 'scale_threshold_roas',
    'max_budget_increase_pct', 'min_conversions_required'
  ];
  key TEXT;
BEGIN
  -- Check all required keys exist
  FOREACH key IN ARRAY required_keys
  LOOP
    IF NOT config ? key THEN
      RAISE EXCEPTION 'Missing required key: %', key;
    END IF;
  END LOOP;
  
  -- Validate ranges
  IF (config->>'target_roas')::numeric <= 0 THEN
    RAISE EXCEPTION 'target_roas must be positive';
  END IF;
  
  IF (config->>'max_daily_budget')::numeric <= 0 THEN
    RAISE EXCEPTION 'max_daily_budget must be positive';
  END IF;
  
  IF (config->>'pause_threshold_roas')::numeric < 0 THEN
    RAISE EXCEPTION 'pause_threshold_roas must be non-negative';
  END IF;
  
  IF (config->>'scale_threshold_roas')::numeric <= (config->>'pause_threshold_roas')::numeric THEN
    RAISE EXCEPTION 'scale_threshold_roas must be greater than pause_threshold_roas';
  END IF;
  
  IF (config->>'max_budget_increase_pct')::numeric <= 0 OR (config->>'max_budget_increase_pct')::numeric > 1 THEN
    RAISE EXCEPTION 'max_budget_increase_pct must be between 0 and 1';
  END IF;
  
  IF (config->>'min_conversions_required')::integer < 0 THEN
    RAISE EXCEPTION 'min_conversions_required must be non-negative';
  END IF;
  
  -- Validate enum values
  IF config->>'scale_speed' NOT IN ('slow', 'medium', 'fast', 'aggressive') THEN
    RAISE EXCEPTION 'scale_speed must be slow, medium, fast, or aggressive';
  END IF;
  
  IF config->>'risk_tolerance' NOT IN ('low', 'medium', 'high') THEN
    RAISE EXCEPTION 'risk_tolerance must be low, medium, or high';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Trigger for Validation
-- ============================================
CREATE OR REPLACE FUNCTION validate_strategy_autopilot_config()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.autopilot_config IS NOT NULL THEN
    PERFORM validate_autopilot_config(NEW.autopilot_config);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_autopilot_config_trigger
  BEFORE INSERT OR UPDATE ON strategies
  FOR EACH ROW
  WHEN (NEW.autopilot_config IS NOT NULL)
  EXECUTE FUNCTION validate_strategy_autopilot_config();

-- ============================================
-- Helper Functions
-- ============================================

-- Get scale percentage based on speed and max
CREATE OR REPLACE FUNCTION get_scale_percentage(
  speed TEXT,
  max_pct NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
  base_pct NUMERIC;
BEGIN
  base_pct := CASE speed
    WHEN 'slow' THEN 0.1
    WHEN 'medium' THEN 0.2
    WHEN 'fast' THEN 0.3
    WHEN 'aggressive' THEN max_pct
    ELSE 0.2
  END;
  
  RETURN LEAST(base_pct, max_pct);
END;
$$ LANGUAGE plpgsql;

-- Check if campaign should be scaled based on strategy
CREATE OR REPLACE FUNCTION should_scale_campaign(
  campaign_roas NUMERIC,
  campaign_conversions INTEGER,
  campaign_budget NUMERIC,
  strategy_config JSONB
)
RETURNS TABLE(
  action TEXT,
  scale_pct NUMERIC,
  reason TEXT
) AS $$
DECLARE
  config_enabled BOOLEAN;
  min_conversions INTEGER;
  pause_threshold NUMERIC;
  scale_threshold NUMERIC;
  max_budget NUMERIC;
  speed TEXT;
  max_increase NUMERIC;
  calculated_scale NUMERIC;
  new_budget NUMERIC;
BEGIN
  -- Extract config values
  config_enabled := (strategy_config->>'enabled')::boolean;
  min_conversions := (strategy_config->>'min_conversions_required')::integer;
  pause_threshold := (strategy_config->>'pause_threshold_roas')::numeric;
  scale_threshold := (strategy_config->>'scale_threshold_roas')::numeric;
  max_budget := (strategy_config->>'max_daily_budget')::numeric;
  speed := strategy_config->>'scale_speed';
  max_increase := (strategy_config->>'max_budget_increase_pct')::numeric;
  
  -- Check if autopilot is enabled
  IF NOT config_enabled THEN
    RETURN QUERY SELECT 'disabled'::TEXT, 0::NUMERIC, 'Autopilot not enabled for this strategy'::TEXT;
    RETURN;
  END IF;
  
  -- Check minimum conversions
  IF campaign_conversions < min_conversions THEN
    RETURN QUERY SELECT 
      'wait'::TEXT, 
      0::NUMERIC, 
      format('Need %s conversions (have %s)', min_conversions, campaign_conversions)::TEXT;
    RETURN;
  END IF;
  
  -- Check pause threshold
  IF campaign_roas < pause_threshold THEN
    RETURN QUERY SELECT 
      'pause'::TEXT, 
      0::NUMERIC, 
      format('ROAS %.2fx below threshold %.2fx', campaign_roas, pause_threshold)::TEXT;
    RETURN;
  END IF;
  
  -- Check scale threshold
  IF campaign_roas >= scale_threshold THEN
    calculated_scale := get_scale_percentage(speed, max_increase);
    new_budget := campaign_budget * (1 + calculated_scale);
    
    -- Check budget limit
    IF new_budget > max_budget THEN
      RETURN QUERY SELECT 
        'limit_reached'::TEXT, 
        0::NUMERIC, 
        format('Would exceed max budget €%s', max_budget)::TEXT;
      RETURN;
    END IF;
    
    RETURN QUERY SELECT 
      'scale_up'::TEXT, 
      calculated_scale, 
      format('ROAS %.2fx above threshold %.2fx', campaign_roas, scale_threshold)::TEXT;
    RETURN;
  END IF;
  
  -- ROAS within range - maintain
  RETURN QUERY SELECT 
    'maintain'::TEXT, 
    0::NUMERIC, 
    format('ROAS %.2fx within target range', campaign_roas)::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Comments
-- ============================================
COMMENT ON COLUMN strategies.autopilot_config IS 'Autopilot configuration for strategy-driven campaign optimization';
COMMENT ON FUNCTION get_conservative_autopilot_config() IS 'Returns conservative autopilot template config';
COMMENT ON FUNCTION get_aggressive_autopilot_config() IS 'Returns aggressive autopilot template config';
COMMENT ON FUNCTION get_profit_autopilot_config() IS 'Returns profit maximization autopilot template config';
COMMENT ON FUNCTION validate_autopilot_config(JSONB) IS 'Validates autopilot config structure and values';
COMMENT ON FUNCTION should_scale_campaign(NUMERIC, INTEGER, NUMERIC, JSONB) IS 'Determines if campaign should be scaled based on strategy config';
