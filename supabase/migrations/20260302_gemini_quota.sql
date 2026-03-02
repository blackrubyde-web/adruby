-- ═══════════════════════════════════════════════════════════════
-- Gemini API Quota Tracking
-- Referenced by netlify/functions/_shared/gemini.js
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS gemini_quota (
    id TEXT PRIMARY KEY DEFAULT 'global',
    requests_this_minute INTEGER DEFAULT 0,
    requests_this_day INTEGER DEFAULT 0,
    last_minute_reset TIMESTAMPTZ DEFAULT now(),
    last_day_reset TIMESTAMPTZ DEFAULT now(),
    quota_exhausted BOOLEAN DEFAULT false,
    quota_reset_at TIMESTAMPTZ,
    consecutive_errors INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default row
INSERT INTO gemini_quota (id) VALUES ('global') ON CONFLICT (id) DO NOTHING;

-- RLS: Only service role should access this (server-side only)
ALTER TABLE gemini_quota ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on gemini_quota"
    ON gemini_quota FOR ALL
    USING (auth.role() = 'service_role');

-- RPC function for atomic increment (used by gemini.js recordGeminiSuccess)
CREATE OR REPLACE FUNCTION increment_gemini_quota_success()
RETURNS void AS $$
BEGIN
    UPDATE gemini_quota
    SET requests_this_minute = requests_this_minute + 1,
        requests_this_day = requests_this_day + 1,
        consecutive_errors = 0,
        updated_at = now()
    WHERE id = 'global';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
