-- ============================================
-- Migration: Meta Ads Campaign Analysis Structure
-- Description: Creates hierarchical Facebook/Meta Ads structure for campaigns → ad_sets → ads with performance data
-- Dependencies: user_profiles (existing table)
-- ============================================

-- 1. CREATE ENUM TYPES FOR ADS STRUCTURE
CREATE TYPE campaign_status AS ENUM ('active', 'paused', 'completed', 'draft');
CREATE TYPE adset_status AS ENUM ('active', 'paused', 'limited', 'pending_review');
CREATE TYPE ad_status_meta AS ENUM ('active', 'paused', 'disapproved', 'pending_review', 'learning');

-- 2. CREATE META CAMPAIGNS TABLE
CREATE TABLE public.meta_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    objective TEXT NOT NULL DEFAULT 'CONVERSIONS',
    status campaign_status NOT NULL DEFAULT 'active',
    budget_daily DECIMAL(10,2),
    budget_lifetime DECIMAL(10,2),
    spend DECIMAL(10,2) DEFAULT 0,
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    ctr DECIMAL(5,2) DEFAULT 0,
    cpm DECIMAL(10,2) DEFAULT 0,
    roas DECIMAL(10,2) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    facebook_campaign_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. CREATE META AD SETS TABLE
CREATE TABLE public.meta_ad_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.meta_campaigns(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status adset_status NOT NULL DEFAULT 'active',
    budget_daily DECIMAL(10,2),
    budget_lifetime DECIMAL(10,2),
    spend DECIMAL(10,2) DEFAULT 0,
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    ctr DECIMAL(5,2) DEFAULT 0,
    cpm DECIMAL(10,2) DEFAULT 0,
    roas DECIMAL(10,2) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    targeting_data JSONB DEFAULT '{}',
    facebook_adset_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. CREATE META ADS TABLE
CREATE TABLE public.meta_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    adset_id UUID NOT NULL REFERENCES public.meta_ad_sets(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.meta_campaigns(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status ad_status_meta NOT NULL DEFAULT 'active',
    creative_type TEXT DEFAULT 'single_image',
    headline TEXT,
    primary_text TEXT,
    description TEXT,
    call_to_action TEXT DEFAULT 'LEARN_MORE',
    spend DECIMAL(10,2) DEFAULT 0,
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    ctr DECIMAL(5,2) DEFAULT 0,
    cpm DECIMAL(10,2) DEFAULT 0,
    roas DECIMAL(10,2) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    ai_analysis_score INTEGER DEFAULT 0,
    ai_recommendations JSONB DEFAULT '[]',
    facebook_ad_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. CREATE FACEBOOK LOGIN CONNECTIONS TABLE
CREATE TABLE public.facebook_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    facebook_user_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    profile_picture TEXT,
    full_name TEXT,
    connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_sync_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, facebook_user_id)
);

-- 6. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX idx_meta_campaigns_user_id ON public.meta_campaigns(user_id);
CREATE INDEX idx_meta_campaigns_status ON public.meta_campaigns(status);
CREATE INDEX idx_meta_campaigns_created_at ON public.meta_campaigns(created_at DESC);

CREATE INDEX idx_meta_ad_sets_user_id ON public.meta_ad_sets(user_id);
CREATE INDEX idx_meta_ad_sets_campaign_id ON public.meta_ad_sets(campaign_id);
CREATE INDEX idx_meta_ad_sets_status ON public.meta_ad_sets(status);

CREATE INDEX idx_meta_ads_user_id ON public.meta_ads(user_id);
CREATE INDEX idx_meta_ads_adset_id ON public.meta_ads(adset_id);
CREATE INDEX idx_meta_ads_campaign_id ON public.meta_ads(campaign_id);
CREATE INDEX idx_meta_ads_status ON public.meta_ads(status);
CREATE INDEX idx_meta_ads_ai_score ON public.meta_ads(ai_analysis_score DESC);

CREATE INDEX idx_facebook_connections_user_id ON public.facebook_connections(user_id);
CREATE INDEX idx_facebook_connections_active ON public.facebook_connections(is_active);

-- 7. ENABLE RLS ON ALL TABLES
ALTER TABLE public.meta_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ad_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_connections ENABLE ROW LEVEL SECURITY;

-- 8. CREATE RLS POLICIES
-- Meta Campaigns Policies
CREATE POLICY "users_own_meta_campaigns" ON public.meta_campaigns
FOR ALL TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- Meta Ad Sets Policies  
CREATE POLICY "users_own_meta_ad_sets" ON public.meta_ad_sets
FOR ALL TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- Meta Ads Policies
CREATE POLICY "users_own_meta_ads" ON public.meta_ads
FOR ALL TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- Facebook Connections Policies
CREATE POLICY "users_own_facebook_connections" ON public.facebook_connections
FOR ALL TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- 9. CREATE FUNCTION FOR UPDATING TIMESTAMPS
CREATE OR REPLACE FUNCTION public.update_meta_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_meta_ad_sets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_meta_ads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. CREATE TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
CREATE TRIGGER trigger_update_meta_campaigns_updated_at
BEFORE UPDATE ON public.meta_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_meta_campaigns_updated_at();

CREATE TRIGGER trigger_update_meta_ad_sets_updated_at
BEFORE UPDATE ON public.meta_ad_sets
FOR EACH ROW
EXECUTE FUNCTION public.update_meta_ad_sets_updated_at();

CREATE TRIGGER trigger_update_meta_ads_updated_at
BEFORE UPDATE ON public.meta_ads
FOR EACH ROW
EXECUTE FUNCTION public.update_meta_ads_updated_at();

-- 11. INSERT COMPREHENSIVE MOCK DATA
DO $$
DECLARE
    existing_user_id UUID;
    campaign1_id UUID := gen_random_uuid();
    campaign2_id UUID := gen_random_uuid(); 
    campaign3_id UUID := gen_random_uuid();
    adset1_id UUID := gen_random_uuid();
    adset2_id UUID := gen_random_uuid();
    adset3_id UUID := gen_random_uuid();
    adset4_id UUID := gen_random_uuid();
    adset5_id UUID := gen_random_uuid();
    adset6_id UUID := gen_random_uuid();
BEGIN
    -- Get existing user from user_profiles
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Insert Mock Facebook Connection
        INSERT INTO public.facebook_connections (user_id, facebook_user_id, access_token, profile_picture, full_name) VALUES
        (existing_user_id, '1234567890', 'EAABwzLixnjY...', 'https://graph.facebook.com/1234567890/picture', 'Demo User');

        -- Insert Mock Campaigns
        INSERT INTO public.meta_campaigns (id, user_id, name, objective, status, budget_daily, spend, impressions, clicks, ctr, cpm, roas, conversions, facebook_campaign_id) VALUES
        (campaign1_id, existing_user_id, 'BlackRuby Conversion Push', 'CONVERSIONS', 'active', 100.00, 540.00, 12500, 350, 2.8, 9.50, 3.2, 42, 'FB_CAM_001'),
        (campaign2_id, existing_user_id, 'Brand Awareness Q4', 'BRAND_AWARENESS', 'active', 75.00, 315.00, 8900, 180, 2.0, 11.20, 2.8, 28, 'FB_CAM_002'),
        (campaign3_id, existing_user_id, 'Retargeting Special', 'CONVERSIONS', 'paused', 50.00, 425.00, 15200, 480, 3.2, 8.90, 4.1, 65, 'FB_CAM_003');

        -- Insert Mock Ad Sets
        INSERT INTO public.meta_ad_sets (id, user_id, campaign_id, name, status, budget_daily, spend, impressions, clicks, ctr, cpm, roas, conversions, targeting_data, facebook_adset_id) VALUES
        (adset1_id, existing_user_id, campaign1_id, 'Main Audience', 'active', 60.00, 220.00, 7500, 232, 3.1, 8.90, 3.8, 28, '{"age_range": [25, 45], "interests": ["fitness", "supplements"], "location": "Germany"}', 'FB_AS_001'),
        (adset2_id, existing_user_id, campaign1_id, 'Lookalike 1%', 'active', 40.00, 320.00, 5000, 118, 2.4, 11.00, 2.6, 14, '{"age_range": [18, 65], "lookalike_source": "customers", "location": "DACH"}', 'FB_AS_002'),
        (adset3_id, existing_user_id, campaign2_id, 'Brand Audience Core', 'active', 45.00, 180.00, 4200, 95, 2.3, 10.50, 2.9, 16, '{"age_range": [22, 55], "interests": ["marketing", "business"], "behavior": "entrepreneurs"}', 'FB_AS_003'),
        (adset4_id, existing_user_id, campaign2_id, 'Broad Targeting', 'active', 30.00, 135.00, 4700, 85, 1.8, 12.20, 2.4, 12, '{"age_range": [25, 50], "detailed_targeting": "broad"}', 'FB_AS_004'),
        (adset5_id, existing_user_id, campaign3_id, 'Website Visitors', 'paused', 30.00, 225.00, 8200, 278, 3.4, 8.20, 4.5, 38, '{"custom_audience": "website_visitors_30d", "exclusions": ["purchasers_7d"]}', 'FB_AS_005'),
        (adset6_id, existing_user_id, campaign3_id, 'Cart Abandoners', 'paused', 20.00, 200.00, 7000, 202, 2.9, 9.60, 3.8, 27, '{"custom_audience": "cart_abandoners_14d", "optimization": "purchases"}', 'FB_AS_006');

        -- Insert Mock Ads with AI Analysis
        INSERT INTO public.meta_ads (user_id, adset_id, campaign_id, name, status, creative_type, headline, primary_text, call_to_action, spend, impressions, clicks, ctr, cpm, roas, conversions, ai_analysis_score, ai_recommendations, facebook_ad_id) VALUES
        (existing_user_id, adset1_id, campaign1_id, 'Ad 1 - Video Creative', 'active', 'video', 'Maximiere deine Fitness-Ziele!', 'Entdecke FitMax Pro – das Supplement, das deine Workouts auf das nächste Level bringt. Jetzt 40% sparen!', 'SHOP_NOW', 110.00, 3750, 145, 3.9, 8.50, 4.2, 18, 89, '["Skalierung empfohlen: Budget um 25% erhöhen", "Creative Performance: Sehr gut", "Zielgruppe: Optimal"]', 'FB_AD_001'),
        (existing_user_id, adset1_id, campaign1_id, 'Ad 2 - Image Static', 'active', 'single_image', 'FitMax Pro - Dein Fitness-Booster!', 'Wissenschaftlich bewiesene Formel für maximale Leistung. Teste jetzt risikofrei!', 'LEARN_MORE', 110.00, 3750, 87, 2.3, 9.30, 3.4, 10, 72, '["Budget reduzieren: Geringe CTR", "Creative testen: Neue Variante erstellen", "Targeting: Interesse verfeinern"]', 'FB_AD_002'),
        (existing_user_id, adset2_id, campaign1_id, 'Ad 3 - Carousel Format', 'active', 'carousel', 'Die Top 3 Fitness-Geheimnisse', 'Swipe durch die bewährtesten Methoden für schnelle Ergebnisse. FitMax Pro macht den Unterschied!', 'SHOP_NOW', 160.00, 2500, 78, 3.1, 10.80, 2.8, 9, 81, '["Performance stabil: Weiter überwachen", "Carousel optimieren: Bild 2 austauschen", "Budget: Leicht erhöhen (+15%)"]', 'FB_AD_003'),
        (existing_user_id, adset2_id, campaign1_id, 'Ad 4 - UGC Content', 'learning', 'video', 'Echte Ergebnisse von echten Kunden', 'Lisa verlor 8kg in 12 Wochen mit FitMax Pro. Sieh dir ihre Transformation an!', 'WATCH_MORE', 160.00, 2500, 40, 1.6, 12.50, 1.9, 5, 65, '["Learning Phase: Abwarten", "UGC Performance: Unterdurchschnittlich", "Alternative Creative: Bereithalten"]', 'FB_AD_004'),
        (existing_user_id, adset3_id, campaign2_id, 'Ad 5 - Brand Story', 'active', 'single_image', 'BlackRuby - Innovation seit 2020', 'Vertraue auf 4 Jahre Erfahrung im digitalen Marketing. Über 500 erfolgreiche Kampagnen.', 'CONTACT_US', 90.00, 2100, 55, 2.6, 10.20, 3.1, 9, 78, '["Brand Awareness: Ziel erreicht", "Engagement Rate: Gut", "Reichweite: Ausbauen"]', 'FB_AD_005'),
        (existing_user_id, adset3_id, campaign2_id, 'Ad 6 - Service Overview', 'active', 'video', 'Alles aus einer Hand', 'Von Strategie bis Umsetzung - BlackRuby begleitet dich zum Erfolg. Kostenlose Beratung!', 'APPLY_NOW', 90.00, 2100, 40, 1.9, 11.80, 2.6, 7, 69, '["CTR niedrig: Creative überarbeiten", "Video: Kürzere Variante testen", "CTA: LEARN_MORE versuchen"]', 'FB_AD_006'),
        (existing_user_id, adset4_id, campaign2_id, 'Ad 7 - Testimonial', 'active', 'single_image', 'Kundenstimme: Maria K.', '"BlackRuby hat unseren ROAS um 300% gesteigert!" - Erfahre mehr über unsere Erfolgsgeschichten.', 'READ_MORE', 67.50, 2350, 42, 1.8, 12.00, 2.5, 6, 73, '["Testimonial: Authentizität prüfen", "Social Proof: Mehr Bewertungen", "Budget: Stabil halten"]', 'FB_AD_007'),
        (existing_user_id, adset4_id, campaign2_id, 'Ad 8 - Free Guide', 'active', 'single_image', 'Gratis: Facebook Ads Masterclass', 'Lade dir unseren kostenlosen Guide herunter und lerne die Geheimnisse erfolgreicher Werbung!', 'DOWNLOAD', 67.50, 2350, 43, 1.8, 12.20, 2.3, 6, 76, '["Lead Magnet: Gut angenommen", "Landing Page: Conversion optimieren", "Follow-Up: E-Mail-Sequenz starten"]', 'FB_AD_008'),
        (existing_user_id, adset5_id, campaign3_id, 'Ad 9 - Retargeting Offer', 'paused', 'video', 'Nur für kurze Zeit: 50% Rabatt!', 'Du warst interessiert? Jetzt zuschlagen! Exklusiver Rabatt nur für Website-Besucher.', 'SHOP_NOW', 112.50, 4100, 167, 4.1, 7.90, 5.2, 23, 94, '["Top Performer: Reaktivieren empfohlen", "Rabatt-Strategie: Sehr erfolgreich", "Budget: Deutlich erhöhen"]', 'FB_AD_009'),
        (existing_user_id, adset5_id, campaign3_id, 'Ad 10 - Urgency Message', 'paused', 'single_image', 'Letzte Chance! Angebot endet morgen', 'Verpasse nicht deine letzte Gelegenheit für FitMax Pro zum Sonderpreis. Nur noch 24h!', 'ORDER_NOW', 112.50, 4100, 111, 2.7, 8.50, 3.4, 15, 85, '["Urgency: Sehr wirksam", "Zeitdruck: Conversion-Boost", "Wiederholung: Alle 2 Wochen"]', 'FB_AD_010'),
        (existing_user_id, adset6_id, campaign3_id, 'Ad 11 - Cart Recovery', 'paused', 'carousel', 'Vergessen? Dein Warenkorb wartet!', 'Schließe deinen Kauf ab und sichere dir FitMax Pro + kostenlosen Versand. Swipe für Details!', 'COMPLETE_ORDER', 100.00, 3500, 126, 3.6, 9.10, 4.0, 17, 91, '["Cart Recovery: Hochperformant", "Kostenloser Versand: Starker Anreiz", "Personalisierung: Weiter ausbauen"]', 'FB_AD_011'),
        (existing_user_id, adset6_id, campaign3_id, 'Ad 12 - Social Proof', 'paused', 'video', 'Über 10.000 zufriedene Kunden!', 'Werde Teil unserer Community! Sieh, was andere über FitMax Pro sagen und starte deine Reise.', 'JOIN_US', 100.00, 3500, 76, 2.2, 10.10, 3.2, 10, 77, '["Social Proof: Glaubwürdig", "Community-Aspekt: Ausbaufähig", "Video-Testimonials: Hinzufügen"]', 'FB_AD_012');

        RAISE NOTICE 'Mock Meta Ads campaign structure created successfully with comprehensive performance data';
        RAISE NOTICE 'Facebook connection established for user: Demo User';
        RAISE NOTICE 'Created 3 campaigns, 6 ad sets, and 12 ads with AI analysis scores';
    ELSE
        RAISE NOTICE 'No users found - run auth migration first to create user_profiles';
    END IF;
END $$;