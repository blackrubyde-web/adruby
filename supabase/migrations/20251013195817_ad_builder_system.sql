-- Location: supabase/migrations/20251013195817_ad_builder_system.sql
-- Schema Analysis: Fresh project - no existing schema
-- Integration Type: Complete new schema with auth and ad builder functionality  
-- Dependencies: None - fresh implementation

-- 1. Custom Types
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'member');
CREATE TYPE public.industry_type AS ENUM ('e_commerce', 'fitness', 'beauty', 'food', 'tech', 'other');
CREATE TYPE public.tonality_type AS ENUM ('serious', 'emotional', 'humorous', 'exclusive', 'scientific', 'professional', 'friendly', 'urgent', 'casual', 'luxury', 'playful');
CREATE TYPE public.ad_status AS ENUM ('draft', 'generating', 'generated', 'published', 'archived');

-- 2. Core User Management Table
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'member'::public.user_role,
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Ad Campaigns Table
CREATE TABLE public.ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Product Information Table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_description TEXT NOT NULL,
    industry public.industry_type DEFAULT 'other'::public.industry_type,
    target_audience TEXT NOT NULL,
    main_benefits TEXT NOT NULL,
    pain_points TEXT NOT NULL,
    usp TEXT NOT NULL,
    price_offer TEXT,
    tonality public.tonality_type DEFAULT 'professional'::public.tonality_type,
    cta_text TEXT DEFAULT 'Jetzt kaufen',
    focus_emotion BOOLEAN DEFAULT false,
    focus_benefits BOOLEAN DEFAULT true,
    focus_urgency BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Generated Ads Table
CREATE TABLE public.generated_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    headline TEXT NOT NULL,
    primary_text TEXT NOT NULL,
    cta TEXT NOT NULL,
    emotional_trigger TEXT,
    visual_suggestion TEXT,
    conversion_score INTEGER CHECK (conversion_score >= 0 AND conversion_score <= 100),
    estimated_ctr DECIMAL(5,2),
    facebook_preview_data JSONB,
    status public.ad_status DEFAULT 'draft'::public.ad_status,
    generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Market Analysis Data Table
CREATE TABLE public.market_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    industry public.industry_type,
    common_hooks JSONB,
    common_ctas JSONB,
    emotional_triggers JSONB,
    visual_trends JSONB,
    analyzed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Saved Ad Variants Table
CREATE TABLE public.saved_ad_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    generated_ad_id UUID REFERENCES public.generated_ads(id) ON DELETE CASCADE,
    variant_name TEXT NOT NULL,
    is_favorite BOOLEAN DEFAULT false,
    notes TEXT,
    performance_data JSONB,
    saved_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_ad_campaigns_user_id ON public.ad_campaigns(user_id);
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_campaign_id ON public.products(campaign_id);
CREATE INDEX idx_products_industry ON public.products(industry);
CREATE INDEX idx_generated_ads_product_id ON public.generated_ads(product_id);
CREATE INDEX idx_generated_ads_user_id ON public.generated_ads(user_id);
CREATE INDEX idx_generated_ads_status ON public.generated_ads(status);
CREATE INDEX idx_market_insights_user_id ON public.market_insights(user_id);
CREATE INDEX idx_market_insights_industry ON public.market_insights(industry);
CREATE INDEX idx_saved_ad_variants_user_id ON public.saved_ad_variants(user_id);

-- 9. Helper Functions (Must be before RLS policies)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')::public.user_role
  );
  RETURN NEW;
END;
$$;

-- 10. Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_ad_variants ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies - Using Pattern 1 for user_profiles, Pattern 2 for others

-- Pattern 1: Core user table (user_profiles) - Simple only, no functions
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 2: Simple user ownership for all other tables
CREATE POLICY "users_manage_own_ad_campaigns"
ON public.ad_campaigns
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_products"
ON public.products
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_generated_ads"
ON public.generated_ads
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_market_insights"
ON public.market_insights
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_saved_ad_variants"
ON public.saved_ad_variants
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 12. Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. Mock Data for Testing
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    user_uuid UUID := gen_random_uuid();
    campaign_uuid UUID := gen_random_uuid();
    product_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@adbuilder.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Marketing Admin", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'user@adbuilder.com', crypt('user123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Marketing Manager", "role": "member"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create sample campaign
    INSERT INTO public.ad_campaigns (id, user_id, name, description) VALUES
        (campaign_uuid, user_uuid, 'Fitness Product Launch', 'High-conversion ads for new fitness supplement');

    -- Create sample product
    INSERT INTO public.products (
        id, user_id, campaign_id, product_name, product_description, industry,
        target_audience, main_benefits, pain_points, usp, price_offer,
        tonality, cta_text, focus_emotion, focus_benefits, focus_urgency
    ) VALUES (
        product_uuid, user_uuid, campaign_uuid,
        'FitMax Pro Supplement',
        'Revolutionary fitness supplement that boosts energy and muscle growth with natural ingredients. Perfect for serious athletes and fitness enthusiasts.',
        'fitness'::public.industry_type,
        'Fitness enthusiasts, athletes, gym-goers aged 25-45',
        'Increased energy, faster muscle growth, natural ingredients, proven results',
        'Lack of energy during workouts, slow muscle development, synthetic supplements with side effects',
        'Only supplement with patented natural formula + 30-day money-back guarantee',
        '49.99 EUR (Normalpreis: 79.99 EUR)',
        'emotional'::public.tonality_type,
        'Jetzt 40% sparen!',
        true, true, true
    );

    -- Create sample generated ad
    INSERT INTO public.generated_ads (
        product_id, user_id, headline, primary_text, cta,
        emotional_trigger, visual_suggestion, conversion_score, estimated_ctr,
        facebook_preview_data, status
    ) VALUES (
        product_uuid, user_uuid,
        'FitMax Pro - Ihr Weg zu maximaler Fitness!',
        'Sind Sie es leid, dass Ihre Workouts nicht die Ergebnisse bringen, die Sie sich wünschen? FitMax Pro revolutioniert Ihr Training mit natürlichen Inhaltsstoffen, die Ihre Energie steigern und das Muskelwachstum beschleunigen. Über 10.000 zufriedene Kunden vertrauen bereits auf unsere patentierte Formel. Keine Nebenwirkungen, nur reine Kraft!',
        'Jetzt 40% sparen!',
        'FOMO & Empowerment',
        'Athletic person lifting weights in modern gym, showing visible muscle definition, bright energetic lighting',
        87,
        2.34,
        '{"page_name": "FitMax Pro Official", "image_placeholder": "Athletic person in gym", "likes": 1247, "shares": 89, "comments": 156}'::jsonb,
        'generated'::public.ad_status
    );

    -- Create sample market insights
    INSERT INTO public.market_insights (
        user_id, product_id, industry, common_hooks, common_ctas,
        emotional_triggers, visual_trends
    ) VALUES (
        user_uuid, product_uuid, 'fitness'::public.industry_type,
        '["Sind Sie bereit für...", "Schluss mit...", "Endlich der Durchbruch...", "Das Geheimnis von...", "Warum 90% der Menschen..."]'::jsonb,
        '["Jetzt starten", "Sofort bestellen", "Nur heute", "Limitiertes Angebot", "30 Tage testen"]'::jsonb,
        '["Transformation", "Selbstvertrauen", "Erfolg", "Frustration", "Durchbruch"]'::jsonb,
        '["Before/After Bilder", "Athletische Models", "Gym Settings", "Produktnahaufnahmen", "Erfolgsgeschichten"]'::jsonb
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating mock data: %', SQLERRM;
END $$;