-- Add draft columns to generated_creatives table
ALTER TABLE generated_creatives  
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE;

ALTER TABLE generated_creatives  
ADD COLUMN IF NOT EXISTS generated_in_canvas BOOLEAN DEFAULT FALSE;

-- Add index for better query performance when finding drafts
CREATE INDEX IF NOT EXISTS idx_generated_creatives_drafts  
ON generated_creatives(user_id, is_draft, updated_at DESC)  
WHERE is_draft = TRUE;

-- Migration complete
-- Run this in Supabase SQL Editor
