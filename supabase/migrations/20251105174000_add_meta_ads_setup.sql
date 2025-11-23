-- ============================================
-- Migration: Meta Ads Setup Module
-- Description: Creates table for storing Meta Ads Manager setup guides
-- Dependencies: user_profiles, ad_strategies
-- ============================================

-- 1. CREATE TABLE for Meta Ads Setup
CREATE TABLE public.ad_meta_setup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_strategy_id UUID NOT NULL REFERENCES public.ad_strategies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Meta Ads Setup Configuration
    setup_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Campaign Structure from JSON Blueprint  
    campaign_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    adsets_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    ads_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    recommendations JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Step-by-step setup guide
    setup_instructions JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'generated',
    exported_pdf_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CREATE INDEXES for performance
CREATE INDEX idx_ad_meta_setup_ad_strategy_id ON public.ad_meta_setup(ad_strategy_id);
CREATE INDEX idx_ad_meta_setup_user_id ON public.ad_meta_setup(user_id);
CREATE INDEX idx_ad_meta_setup_status ON public.ad_meta_setup(status);
CREATE INDEX idx_ad_meta_setup_created_at ON public.ad_meta_setup(created_at DESC);

-- 3. CREATE UPDATE FUNCTION for updated_at
CREATE OR REPLACE FUNCTION public.update_ad_meta_setup_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CREATE TRIGGER for auto-updating updated_at
CREATE TRIGGER trigger_update_ad_meta_setup_updated_at
    BEFORE UPDATE ON public.ad_meta_setup
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ad_meta_setup_updated_at();

-- 5. ENABLE RLS for security
ALTER TABLE public.ad_meta_setup ENABLE ROW LEVEL SECURITY;

-- 6. CREATE RLS POLICIES for access control
CREATE POLICY "users_manage_own_meta_ads_setup" 
ON public.ad_meta_setup 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- 7. INSERT MOCK DATA for testing
DO $$
DECLARE
    existing_strategy_id UUID;
    existing_user_id UUID;
    mock_setup_data JSONB;
BEGIN
    -- Get existing strategy and user
    SELECT id INTO existing_strategy_id FROM public.ad_strategies LIMIT 1;
    SELECT user_id INTO existing_user_id FROM public.ad_strategies WHERE id = existing_strategy_id;
    
    IF existing_strategy_id IS NOT NULL AND existing_user_id IS NOT NULL THEN
        -- Create comprehensive mock setup data
        mock_setup_data := '{
            "campaign": {
                "objective": "Conversions",
                "campaign_name": "BlackRuby - Performance Boost - E-Commerce",
                "budget": "50€/Tag",
                "optimization_goal": "Purchases",
                "duration": "14 Tage",
                "notes": "CBO aktivieren, um Budget automatisch zu verteilen"
            },
            "adsets": [
                {
                    "name": "AdSet 1 - Core Audience",
                    "budget": "20€/Tag",
                    "placements": "Automatic",
                    "optimization": "Conversions",
                    "target_audience": {
                        "age": "25-45",
                        "gender": "Alle",
                        "locations": ["Deutschland", "Österreich", "Schweiz"],
                        "languages": ["Deutsch"],
                        "interests": ["E-Commerce", "Online-Shopping", "Shopify"],
                        "exclusions": ["Jobbörsen", "Studentenjobs"]
                    }
                },
                {
                    "name": "AdSet 2 - Lookalike Audience",
                    "budget": "20€/Tag",
                    "target_audience": {
                        "type": "Lookalike",
                        "source": "Website Besucher 30 Tage",
                        "percentage": "2%",
                        "countries": ["Deutschland"]
                    }
                }
            ],
            "ads": [
                {
                    "name": "Ad 1 - Hauptvariante",
                    "format": "Video",
                    "primary_text": "[Ad Text aus Builder]",
                    "headline": "[Ad Headline]",
                    "cta": "Jetzt kaufen",
                    "link": "[Product Link]",
                    "tracking": "Pixel Event: Purchase"
                }
            ],
            "recommendations": {
                "testing": "Starte mit 2 AdSets à 2 Ads, werte nach 3 Tagen aus.",
                "scaling": "Wenn CPA < Zielwert → Budget +20% alle 2 Tage.",
                "reporting": "Überprüfe ROAS, CTR, CPM täglich im Meta Dashboard."
            }
        }'::jsonb;

        INSERT INTO public.ad_meta_setup (
            ad_strategy_id,
            user_id,
            setup_data,
            campaign_config,
            adsets_config,
            ads_config,
            recommendations,
            setup_instructions,
            status
        ) VALUES (
            existing_strategy_id,
            existing_user_id,
            mock_setup_data,
            mock_setup_data->'campaign',
            mock_setup_data->'adsets',
            mock_setup_data->'ads',
            mock_setup_data->'recommendations',
            '{"steps": ["Kampagne erstellen", "AdSets konfigurieren", "Anzeigen hochladen"]}'::jsonb,
            'generated'
        );

        RAISE NOTICE 'Mock Meta Ads setup created successfully';
    ELSE
        RAISE NOTICE 'No ad strategies found - run strategy migration first';
    END IF;
END $$;