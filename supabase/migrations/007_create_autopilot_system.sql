-- AI Autopilot System - Database Schema
-- Migration: 007_create_autopilot_system.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: autopilot_settings
-- Stores user preferences for autopilot mode
-- ============================================
CREATE TABLE IF NOT EXISTS autopilot_settings (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'manual', -- 'manual' or 'automatic'
  auto_apply_delay_minutes INTEGER DEFAULT 5,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for autopilot_settings
ALTER TABLE autopilot_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own autopilot settings"
  ON autopilot_settings
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- Table: autopilot_rules
-- Stores automation rules for campaigns
-- ============================================
CREATE TABLE IF NOT EXISTS autopilot_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger TEXT NOT NULL, -- 'roas_below', 'roas_above', 'cpc_above', 'spend_exceeds', 'ctr_below'
  threshold NUMERIC NOT NULL,
  action TEXT NOT NULL, -- 'pause', 'scale_up', 'scale_down', 'duplicate', 'notify'
  scale_pct NUMERIC, -- percentage for scale actions (e.g., 0.5 for +50%)
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- higher priority rules execute first
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_autopilot_rules_user_enabled ON autopilot_rules(user_id, enabled);

-- RLS for autopilot_rules
ALTER TABLE autopilot_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own autopilot rules"
  ON autopilot_rules
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- Table: autopilot_actions
-- Logs all autopilot actions (pending and applied)
-- ============================================
CREATE TABLE IF NOT EXISTS autopilot_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL, -- Meta campaign ID
  campaign_name TEXT,
  rule_id UUID REFERENCES autopilot_rules(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'pause', 'scale_up', 'scale_down', 'duplicate'
  reason TEXT, -- human-readable reason
  previous_value JSONB, -- e.g., {"budget": 100, "status": "active"}
  new_value JSONB, -- e.g., {"budget": 150, "status": "active"}
  scale_pct NUMERIC, -- percentage used for scaling
  status TEXT DEFAULT 'pending', -- 'pending', 'applied', 'failed', 'cancelled', 'undone'
  error_message TEXT, -- if status = 'failed'
  applied_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  undone_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_autopilot_actions_user ON autopilot_actions(user_id);
CREATE INDEX idx_autopilot_actions_campaign ON autopilot_actions(campaign_id);
CREATE INDEX idx_autopilot_actions_status ON autopilot_actions(status);
CREATE INDEX idx_autopilot_actions_created ON autopilot_actions(created_at DESC);

-- RLS for autopilot_actions
ALTER TABLE autopilot_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own autopilot actions"
  ON autopilot_actions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own autopilot actions"
  ON autopilot_actions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own autopilot actions"
  ON autopilot_actions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- Function: update_updated_at_column
-- Auto-updates updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_autopilot_settings_updated_at
  BEFORE UPDATE ON autopilot_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_autopilot_rules_updated_at
  BEFORE UPDATE ON autopilot_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Default Rules for New Users
-- ============================================
-- Function to create default autopilot rules for new users
CREATE OR REPLACE FUNCTION create_default_autopilot_rules(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Conservative default rules
  INSERT INTO autopilot_rules (user_id, name, description, trigger, threshold, action, scale_pct, priority)
  VALUES
    (p_user_id, 'Pause Low ROAS', 'Automatically pause campaigns with ROAS below 0.8x', 'roas_below', 0.8, 'pause', NULL, 100),
    (p_user_id, 'Scale High Performers', 'Increase budget by 20% for campaigns with ROAS above 4.0x', 'roas_above', 4.0, 'scale_up', 0.2, 90),
    (p_user_id, 'Reduce High CPC', 'Decrease budget by 20% when CPC exceeds €3.00', 'cpc_above', 3.0, 'scale_down', 0.2, 80);
    
  -- Create default settings
  INSERT INTO autopilot_settings (user_id, mode, auto_apply_delay_minutes, notifications_enabled)
  VALUES (p_user_id, 'manual', 5, true)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Helper Function: Get Pending Actions Count
-- ============================================
CREATE OR REPLACE FUNCTION get_pending_actions_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM autopilot_actions
    WHERE user_id = p_user_id
      AND status = 'pending'
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Comments for Documentation
-- ============================================
COMMENT ON TABLE autopilot_settings IS 'User preferences for AI Autopilot mode (manual vs automatic)';
COMMENT ON TABLE autopilot_rules IS 'Automation rules that trigger actions based on campaign metrics';
COMMENT ON TABLE autopilot_actions IS 'Log of all autopilot actions (pending, applied, failed, cancelled)';

COMMENT ON COLUMN autopilot_rules.trigger IS 'Metric to monitor: roas_below, roas_above, cpc_above, spend_exceeds, ctr_below';
COMMENT ON COLUMN autopilot_rules.action IS 'Action to take: pause, scale_up, scale_down, duplicate, notify';
COMMENT ON COLUMN autopilot_rules.scale_pct IS 'Percentage for scale actions (0.5 = +50%, -0.3 = -30%)';
COMMENT ON COLUMN autopilot_actions.status IS 'Action status: pending, applied, failed, cancelled, undone';
