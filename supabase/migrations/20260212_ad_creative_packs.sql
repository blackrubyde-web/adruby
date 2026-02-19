-- ═══════════════════════════════════════════════════════════════
-- Ad Creative Packs — Full Meta Ad Pack Generation
-- ═══════════════════════════════════════════════════════════════

-- Main pack table (stores copy pack, meta mapping, QA results)
CREATE TABLE IF NOT EXISTS ad_creative_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'complete', 'error')),
  ad_spec JSONB NOT NULL,
  copy_pack JSONB,
  meta_mapping JSONB,
  qa_result JSONB,
  credits_used INTEGER DEFAULT 40,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Individual creative assets per pack
CREATE TABLE IF NOT EXISTS ad_pack_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID REFERENCES ad_creative_packs(id) ON DELETE CASCADE,
  concept_name TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('square', 'portrait', 'story')),
  storage_path TEXT,
  public_url TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  qa_passed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_packs_user ON ad_creative_packs(user_id);
CREATE INDEX IF NOT EXISTS idx_packs_status ON ad_creative_packs(status);
CREATE INDEX IF NOT EXISTS idx_packs_created ON ad_creative_packs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_pack ON ad_pack_assets(pack_id);

-- RLS policies
ALTER TABLE ad_creative_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_pack_assets ENABLE ROW LEVEL SECURITY;

-- Users can only read their own packs
CREATE POLICY "Users can view own packs"
  ON ad_creative_packs FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY "Service role full access on packs"
  ON ad_creative_packs FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on assets"
  ON ad_pack_assets FOR ALL
  USING (auth.role() = 'service_role');

-- Users can view assets for their packs
CREATE POLICY "Users can view own pack assets"
  ON ad_pack_assets FOR SELECT
  USING (
    pack_id IN (
      SELECT id FROM ad_creative_packs WHERE user_id = auth.uid()
    )
  );
