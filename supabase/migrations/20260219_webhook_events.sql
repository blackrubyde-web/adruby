-- Webhook event deduplication table
-- Prevents double-processing when Stripe retries webhook delivery

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT,
  processed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_webhook_events_stripe_id ON webhook_events(stripe_event_id);

-- No RLS needed: only service_role accesses this table
GRANT ALL ON webhook_events TO service_role;
