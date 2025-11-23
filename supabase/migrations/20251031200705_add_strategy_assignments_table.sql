-- Location: supabase/migrations/20251031200705_add_strategy_assignments_table.sql
-- Schema Analysis: Existing schema has saved_ad_variants, strategies, user_profiles tables
-- Integration Type: Addition - new table for strategy assignments with questionnaire data
-- Dependencies: References existing saved_ad_variants, strategies, user_profiles tables

-- New table for storing strategy assignments with user questionnaire answers
CREATE TABLE public.strategy_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_variant_id UUID REFERENCES public.saved_ad_variants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    strategy_id UUID REFERENCES public.strategies(id) ON DELETE SET NULL,
    questionnaire_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    assignment_score NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient queries
CREATE INDEX idx_strategy_assignments_ad_variant_id ON public.strategy_assignments(ad_variant_id);
CREATE INDEX idx_strategy_assignments_user_id ON public.strategy_assignments(user_id);
CREATE INDEX idx_strategy_assignments_strategy_id ON public.strategy_assignments(strategy_id);

-- Enable RLS
ALTER TABLE public.strategy_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policy using Pattern 2: Simple User Ownership
CREATE POLICY "users_manage_own_strategy_assignments"
ON public.strategy_assignments
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Mock data for strategy assignments
DO $$
DECLARE
    existing_user_id UUID;
    existing_variant_id UUID;
    existing_strategy_id UUID;
BEGIN
    -- Get existing IDs from related tables
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    SELECT id INTO existing_variant_id FROM public.saved_ad_variants LIMIT 1;
    SELECT id INTO existing_strategy_id FROM public.strategies LIMIT 1;

    -- Create sample strategy assignment if related data exists
    IF existing_user_id IS NOT NULL AND existing_variant_id IS NOT NULL AND existing_strategy_id IS NOT NULL THEN
        INSERT INTO public.strategy_assignments (
            ad_variant_id, 
            user_id, 
            strategy_id, 
            questionnaire_answers, 
            assignment_score
        ) VALUES (
            existing_variant_id,
            existing_user_id,
            existing_strategy_id,
            '{
                "goal": "leads", 
                "budget": "100-300", 
                "duration": "1-month", 
                "price_level": "mid-ticket"
            }'::jsonb,
            85.5
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Strategy assignments mock data creation failed: %', SQLERRM;
END $$;