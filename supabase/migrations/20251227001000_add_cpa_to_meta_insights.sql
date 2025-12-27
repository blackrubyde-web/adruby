-- Migration: Add CPA (Cost Per Action) to meta_insights_daily
-- Description: Adds the missing 'cpa' column for tracking Cost Per Action metric.

ALTER TABLE public.meta_insights_daily
ADD COLUMN IF NOT EXISTS cpa NUMERIC(10, 2) DEFAULT 0;

-- Comment on column
COMMENT ON COLUMN public.meta_insights_daily.cpa IS 'Cost Per Action (Spend / Conversions)';

-- Optional: Update existing rows to calculate CPA if data exists
UPDATE public.meta_insights_daily
SET cpa = CASE 
    WHEN conversions > 0 THEN ROUND((spend / conversions)::numeric, 2)
    ELSE 0 
END
WHERE cpa = 0 OR cpa IS NULL;
