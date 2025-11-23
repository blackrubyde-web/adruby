-- ============================================
-- Migration: Comprehensive Ad Strategy Questionnaire System
-- Description: Creates ad_strategies table to support detailed 7-step strategy questionnaire with AI-powered matching
-- Dependencies: saved_ad_variants, strategies, user_profiles tables (already exists)
-- ============================================

-- 1. CREATE AD_STRATEGIES TABLE (Enhanced questionnaire responses)
CREATE TABLE public.ad_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_variant_id UUID NOT NULL REFERENCES public.saved_ad_variants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- 7-Step Questionnaire Answers (JSONB for flexible structure)
    questionnaire_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- AI-Selected Strategy
    selected_strategy_id UUID REFERENCES public.strategies(id),
    selected_strategy_data JSONB, -- Store strategy details for historical purposes
    
    -- AI Analysis Results
    ai_analysis JSONB, -- Store AI reasoning, confidence, alternatives
    matching_score INTEGER DEFAULT 0 CHECK (matching_score >= 0 AND matching_score <= 100),
    confidence_level TEXT CHECK (confidence_level IN ('sehr_niedrig', 'niedrig', 'mittel', 'hoch', 'sehr_hoch')),
    
    -- Strategy Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'analyzed', 'applied', 'archived')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    applied_at TIMESTAMPTZ
);

-- 2. CREATE INDEXES (for performance)
CREATE INDEX idx_ad_strategies_user_id ON public.ad_strategies(user_id);
CREATE INDEX idx_ad_strategies_ad_variant_id ON public.ad_strategies(ad_variant_id);
CREATE INDEX idx_ad_strategies_selected_strategy_id ON public.ad_strategies(selected_strategy_id);
CREATE INDEX idx_ad_strategies_status ON public.ad_strategies(status);
CREATE INDEX idx_ad_strategies_matching_score ON public.ad_strategies(matching_score DESC);
CREATE INDEX idx_ad_strategies_created_at ON public.ad_strategies(created_at DESC);

-- 3. CREATE UPDATE TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.update_ad_strategies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Set applied_at when status changes to applied
    IF NEW.status = 'applied' AND OLD.status != 'applied' THEN
        NEW.applied_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CREATE UPDATE TRIGGER
CREATE TRIGGER trigger_update_ad_strategies_updated_at
    BEFORE UPDATE ON public.ad_strategies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ad_strategies_updated_at();

-- 5. ENABLE RLS (security)
ALTER TABLE public.ad_strategies ENABLE ROW LEVEL SECURITY;

-- 6. CREATE RLS POLICIES (access control)
CREATE POLICY "users_manage_own_ad_strategies" 
ON public.ad_strategies 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- 7. CREATE HELPER FUNCTION FOR STRATEGY ANALYSIS
CREATE OR REPLACE FUNCTION public.get_user_strategy_stats(target_user_id UUID)
RETURNS TABLE(
    total_strategies INTEGER,
    draft_count INTEGER,
    analyzed_count INTEGER,
    applied_count INTEGER,
    avg_matching_score NUMERIC,
    most_recent_strategy TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_strategies,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END)::INTEGER as draft_count,
        SUM(CASE WHEN status = 'analyzed' THEN 1 ELSE 0 END)::INTEGER as analyzed_count,
        SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END)::INTEGER as applied_count,
        AVG(matching_score)::NUMERIC as avg_matching_score,
        MAX(created_at) as most_recent_strategy
    FROM public.ad_strategies 
    WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. INSERT MOCK DATA (for testing)
DO $$
DECLARE
    existing_user_id UUID;
    existing_ad_variant_id UUID;
    existing_strategy_id UUID;
    sample_questionnaire_answers JSONB;
    sample_ai_analysis JSONB;
BEGIN
    -- Get existing user from user_profiles
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    -- Get existing ad variant
    SELECT id INTO existing_ad_variant_id FROM public.saved_ad_variants WHERE user_id = existing_user_id LIMIT 1;
    
    -- Get existing strategy
    SELECT id INTO existing_strategy_id FROM public.strategies LIMIT 1;
    
    IF existing_user_id IS NOT NULL AND existing_ad_variant_id IS NOT NULL AND existing_strategy_id IS NOT NULL THEN
        -- Sample questionnaire answers (7-step structure)
        sample_questionnaire_answers := '{
            "goal": "sales",
            "budget_scaling": "150-300-moderate", 
            "performance_goals": "roas-focused",
            "target_audience": "lookalike-similar",
            "creative_strategy": "product-showcase", 
            "timeline_commitment": "campaign-1month",
            "risk_innovation": "balanced-steady"
        }'::jsonb;
        
        -- Sample AI analysis results
        sample_ai_analysis := '{
            "reasoning": "Basierend auf Ihren Antworten passt die Performance Boost Strategie optimal zu Ihren Zielen für direkten Verkauf mit moderatem Budget und ROAS-Fokus.",
            "confidence": "hoch",
            "alternatives": [
                {"strategy": "Stable Growth", "score": 75, "reason": "Gute Alternative für nachhaltiges Wachstum"},
                {"strategy": "Conversion Optimizer", "score": 70, "reason": "Optimiert für bessere Conversion-Raten"}
            ],
            "recommendations": [
                "Skalierung 15% täglich bei guter Performance",
                "Lookalike Audiences mit 1-3% Ähnlichkeit verwenden", 
                "Product-Showcase Creatives mit klaren CTAs"
            ]
        }'::jsonb;
        
        -- Insert sample ad strategy
        INSERT INTO public.ad_strategies (
            ad_variant_id, 
            user_id, 
            questionnaire_answers,
            selected_strategy_id,
            selected_strategy_data,
            ai_analysis,
            matching_score,
            confidence_level,
            status
        ) VALUES (
            existing_ad_variant_id,
            existing_user_id,
            sample_questionnaire_answers,
            existing_strategy_id,
            '{"title": "Performance Boost", "description": "Aggressives Skalierungsmodell für Kampagnen"}'::jsonb,
            sample_ai_analysis,
            85,
            'hoch',
            'analyzed'
        );
        
        RAISE NOTICE 'Mock ad strategy created successfully for user with comprehensive questionnaire data';
    ELSE
        RAISE NOTICE 'Missing dependencies - ensure user_profiles, saved_ad_variants, and strategies exist first';
    END IF;
END $$;