-- Rate Limit Log Table for API Protection
-- Tracks API usage per user for rate limiting

CREATE TABLE IF NOT EXISTS rate_limit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by user and action within time window
CREATE INDEX IF NOT EXISTS idx_rate_limit_user_action_time 
ON rate_limit_log (user_id, action, created_at DESC);

-- Enable RLS
ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage all entries
CREATE POLICY "Service role can manage rate limits" ON rate_limit_log
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Auto-cleanup function: Remove entries older than 24 hours
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM rate_limit_log
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Schedule cleanup (run via pg_cron if available)
-- SELECT cron.schedule('cleanup-rate-limits', '0 * * * *', 'SELECT cleanup_old_rate_limits()');

COMMENT ON TABLE rate_limit_log IS 'Tracks API requests for rate limiting. Auto-cleaned after 24 hours.';
