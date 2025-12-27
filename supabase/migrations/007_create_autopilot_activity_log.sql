-- Create autopilot_activity_log table
CREATE TABLE IF NOT EXISTS autopilot_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id TEXT NOT NULL,
    campaign_name TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('PAUSE', 'scale', 'increase_budget', 'decrease_budget', 'SOFT_KILL', 'HARD_STOP', 'FATIGUE_THROTTLE', 'SURF_SCALE', 'pause_ad')),
    reason TEXT,
    old_value TEXT,
    new_value TEXT,
    status TEXT DEFAULT 'applied',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_autopilot_log_created_at ON autopilot_activity_log(created_at DESC);
CREATE INDEX idx_autopilot_log_campaign_id ON autopilot_activity_log(campaign_id);

-- Enable RLS
ALTER TABLE autopilot_activity_log ENABLE ROW LEVEL SECURITY;

-- Policies (Open for now as it's system generated, but authenticated users can read)
CREATE POLICY "Authenticated users can read logs" ON autopilot_activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can insert logs" ON autopilot_activity_log FOR INSERT TO service_role WITH CHECK (true);

-- Grant permissions
GRANT ALL ON autopilot_activity_log TO authenticated;
GRANT ALL ON autopilot_activity_log TO service_role;
