-- Add canvas state columns to campaign_drafts
-- This migration adds support for the visual canvas builder

ALTER TABLE public.campaign_drafts 
ADD COLUMN IF NOT EXISTS canvas_nodes jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS canvas_edges jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS canvas_viewport jsonb DEFAULT '{"x": 0, "y": 0, "zoom": 1}'::jsonb;

-- Add index for faster canvas loading
CREATE INDEX IF NOT EXISTS idx_campaign_drafts_user_updated 
ON public.campaign_drafts(user_id, updated_at DESC);

-- Add delete policy if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'campaign_drafts' AND policyname = 'campaign_drafts_delete_own'
    ) THEN
        CREATE POLICY "campaign_drafts_delete_own"
            ON public.campaign_drafts
            FOR DELETE
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END $$;
