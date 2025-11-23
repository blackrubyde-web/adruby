-- Location: supabase/migrations/20251013210400_add_ad_strategies.sql
-- Schema Analysis: Existing schema has user_profiles, products, generated_ads tables
-- Integration Type: Addition - Adding strategies table and modifying generated_ads
-- Dependencies: user_profiles, products, generated_ads

-- ===== SCHEMA ADDITION: Ad Strategy System =====

-- 1. Create new types for goal types
CREATE TYPE public.goal_type AS ENUM (
    'leads', 
    'e_commerce', 
    'awareness', 
    'local', 
    'coaching', 
    'saas'
);

-- 2. Create strategies table (NEW - references existing user_profiles)
CREATE TABLE public.strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    goal_type public.goal_type NOT NULL,
    description TEXT NOT NULL,
    step_by_step TEXT NOT NULL,
    ideal_tone TEXT,
    recommended_budget_range TEXT,
    performance_score NUMERIC(5,2) CHECK (performance_score >= 0 AND performance_score <= 100),
    platform TEXT DEFAULT 'facebook',
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Modify existing generated_ads table to add strategy reference
ALTER TABLE public.generated_ads 
ADD COLUMN selected_strategy_id UUID REFERENCES public.strategies(id) ON DELETE SET NULL;

-- 4. Create indexes for performance
CREATE INDEX idx_strategies_goal_type ON public.strategies(goal_type);
CREATE INDEX idx_strategies_platform ON public.strategies(platform);
CREATE INDEX idx_strategies_performance_score ON public.strategies(performance_score DESC);
CREATE INDEX idx_generated_ads_strategy_id ON public.generated_ads(selected_strategy_id);

-- 5. Enable RLS on new table
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for strategies (Pattern 4: Public Read, Private Write)
CREATE POLICY "public_can_read_strategies"
ON public.strategies
FOR SELECT
TO public
USING (true);

-- 7. Insert predefined strategies (German content for BlackRuby)
INSERT INTO public.strategies (title, goal_type, description, step_by_step, ideal_tone, recommended_budget_range, performance_score, platform, tags) VALUES

-- E-Commerce Strategies
('High-Intent Conversion Funnel', 'e_commerce', 
'Hochkonvertierende Strategie für Produktverkäufe mit starkem Fokus auf kaufbereite Kunden. Nutzt emotionale Trigger und Verknappung.',
'1️⃣ Hook mit Schmerzpunkt oder starker Emotion beginnen
2️⃣ Produktlösung kurz visualisieren  
3️⃣ Nutzenversprechen wiederholen
4️⃣ Social Proof zeigen
5️⃣ CTA mit Verknappung (Jetzt sichern, Nur heute gültig)',
'emotional, urgent', '50-200 EUR/Tag', 92.5, 'facebook',
ARRAY['conversion-optimized', 'e-commerce', 'scarcity']),

('Trust-Based Product Launch', 'e_commerce',
'Vertrauensbasierte Strategie für neue Produkte oder unbekannte Marken. Setzt auf Glaubwürdigkeit und schrittweise Überzeugung.',
'1️⃣ Problem/Frustration der Zielgruppe ansprechen
2️⃣ Persönliche Geschichte oder Expertise zeigen
3️⃣ Produktvorteile mit Fakten untermauern
4️⃣ Testimonials oder Bewertungen einbinden
5️⃣ Risikofrei-Angebot (Geld-zurück-Garantie)',
'professional, friendly', '30-150 EUR/Tag', 89.2, 'facebook',
ARRAY['trust-based', 'authority', 'testimonials']),

-- Lead Generation Strategies  
('Lead Magnet Funnel', 'leads',
'Effektive Leadgenerierung durch kostenlosen Mehrwert. Ideal für Dienstleister und Coaches.',
'1️⃣ Konkretes Problem der Zielgruppe benennen
2️⃣ Kostenlose Lösung/Guide anbieten
3️⃣ Wert des Angebots hervorheben
4️⃣ Einfache Anmeldung betonen
5️⃣ CTA: Jetzt kostenlos sichern',
'helpful, professional', '20-80 EUR/Tag', 87.8, 'facebook',
ARRAY['lead-generation', 'free-offer', 'value-first']),

('Webinar Registration Strategy', 'leads',
'Hochwertige Leads durch Live-Webinare oder Online-Events generieren.',
'1️⃣ Exklusives Wissen oder Insider-Tipps ankündigen
2️⃣ Speaker-Expertise hervorheben
3️⃣ Begrenzte Plätze erwähnen
4️⃣ Konkreten Nutzen für Teilnehmer aufzeigen
5️⃣ CTA: Platz reservieren/Anmelden',
'exclusive, professional', '40-120 EUR/Tag', 91.3, 'facebook',
ARRAY['webinar', 'education', 'exclusivity']),

-- SaaS Strategies
('SaaS Free Trial Push', 'saas',
'Optimiert für Software-Unternehmen, die Free Trials oder Freemium-Modelle anbieten.',
'1️⃣ Zeitverschwendung durch manuelle Prozesse aufzeigen
2️⃣ Software als Lösung präsentieren
3️⃣ Kostenlose Testphase anbieten
4️⃣ Einfache Einrichtung betonen
5️⃣ CTA: Jetzt kostenlos testen',
'professional, solution-focused', '60-250 EUR/Tag', 88.7, 'facebook',
ARRAY['saas', 'free-trial', 'productivity']),

-- Local Business Strategies
('Local Business Awareness', 'local',
'Für lokale Unternehmen, die Reichweite in der Umgebung aufbauen möchten.',
'1️⃣ Lokalen Bezug herstellen (Stadtname, Region)
2️⃣ Einzigartigkeit des Angebots hervorheben
3️⃣ Bequemlichkeit/Nähe betonen
4️⃣ Öffnungszeiten oder Kontakt zeigen
5️⃣ CTA: Jetzt besuchen/anrufen',
'friendly, local', '15-60 EUR/Tag', 85.4, 'facebook',
ARRAY['local', 'community', 'convenience']),

-- Awareness Strategies
('Brand Awareness Builder', 'awareness',
'Markenbekanntheit steigern und Zielgruppe für spätere Conversions vorbereiten.',
'1️⃣ Interessante Frage oder Statistik als Hook
2️⃣ Markenwerte oder Mission kommunizieren
3️⃣ Behind-the-Scenes oder Story erzählen
4️⃣ Community-Aufbau betonen
5️⃣ CTA: Mehr erfahren/folgen',
'inspiring, authentic', '30-100 EUR/Tag', 83.9, 'facebook',
ARRAY['awareness', 'brand-building', 'storytelling']),

-- Coaching Strategies
('Coaching Transformation Story', 'coaching',
'Für Coaches und Berater, die persönliche Transformation anbieten.',
'1️⃣ Transformation Geschichte erzählen (vorher/nachher)
2️⃣ Konkrete Ergebnisse nennen
3️⃣ Coach-Expertise und Methode erwähnen
4️⃣ Begrenzte Verfügbarkeit kommunizieren
5️⃣ CTA: Kostenloses Gespräch buchen',
'inspirational, personal', '25-100 EUR/Tag', 90.1, 'facebook',
ARRAY['coaching', 'transformation', 'personal-development']);

-- 8. Add sample mock data for existing ads to have strategy references
DO $$
DECLARE
    strategy_id UUID;
    ad_record RECORD;
BEGIN
    -- Get a sample strategy ID
    SELECT id INTO strategy_id FROM public.strategies WHERE goal_type = 'e_commerce' LIMIT 1;
    
    -- Update some existing generated ads to reference this strategy
    UPDATE public.generated_ads 
    SET selected_strategy_id = strategy_id
    WHERE id IN (
        SELECT id FROM public.generated_ads LIMIT 2
    );
    
    -- Log the update
    RAISE NOTICE 'Updated sample ads with strategy references';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Strategy reference update completed with notice: %', SQLERRM;
END $$;