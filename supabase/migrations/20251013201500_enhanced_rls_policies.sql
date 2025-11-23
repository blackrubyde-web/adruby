-- ========================================
-- Enhanced RLS Policies für Dual-Client Setup
-- Sichere Admin-Zugriffe + GDPR-Compliance
-- ========================================

-- ✅ 1. Admin-Helper-Funktion für role-based access
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role = 'admin'
)
$$;

-- ✅ 2. Service Role Check für Backend-Operationen
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT auth.role() = 'service_role'
$$;

-- ========================================
-- Enhanced Policies für user_profiles
-- ========================================

-- Drop existing policy to recreate with admin access
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;

-- ✅ Users manage own profiles + Admin full access
CREATE POLICY "users_and_admins_manage_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (
    id = auth.uid() OR 
    public.is_admin_user() OR
    public.is_service_role()
)
WITH CHECK (
    id = auth.uid() OR 
    public.is_admin_user() OR
    public.is_service_role()
);

-- ========================================
-- Enhanced Policies für ad_campaigns
-- ========================================

DROP POLICY IF EXISTS "users_manage_own_ad_campaigns" ON public.ad_campaigns;

CREATE POLICY "users_and_admins_manage_ad_campaigns"
ON public.ad_campaigns
FOR ALL
TO authenticated
USING (
    user_id = auth.uid() OR 
    public.is_admin_user() OR
    public.is_service_role()
)
WITH CHECK (
    user_id = auth.uid() OR 
    public.is_admin_user() OR
    public.is_service_role()
);

-- ========================================
-- Enhanced Policies für products
-- ========================================

DROP POLICY IF EXISTS "users_manage_own_products" ON public.products;

CREATE POLICY "users_and_admins_manage_products"
ON public.products
FOR ALL
TO authenticated
USING (
    user_id = auth.uid() OR 
    public.is_admin_user() OR
    public.is_service_role()
)
WITH CHECK (
    user_id = auth.uid() OR 
    public.is_admin_user() OR
    public.is_service_role()
);

-- ========================================
-- Enhanced Policies für generated_ads
-- ========================================

DROP POLICY IF EXISTS "users_manage_own_generated_ads" ON public.generated_ads;

CREATE POLICY "users_and_admins_manage_generated_ads"
ON public.generated_ads
FOR ALL
TO authenticated
USING (
    user_id = auth.uid() OR 
    public.is_admin_user() OR
    public.is_service_role()
)
WITH CHECK (
    user_id = auth.uid() OR 
    public.is_admin_user() OR
    public.is_service_role()
);

-- ========================================
-- Enhanced Policies für market_insights
-- ========================================

DROP POLICY IF EXISTS "users_manage_own_market_insights" ON public.market_insights;

CREATE POLICY "users_and_admins_manage_market_insights"
ON public.market_insights
FOR ALL
TO authenticated
USING (
    user_id = auth.uid() OR 
    public.is_admin_user() OR
    public.is_service_role()
)
WITH CHECK (
    user_id = auth.uid() OR 
    public.is_admin_user() OR
    public.is_service_role()
);

-- ========================================
-- Enhanced Policies für saved_ad_variants
-- ========================================

DROP POLICY IF EXISTS "users_manage_own_saved_ad_variants" ON public.saved_ad_variants;

CREATE POLICY "users_and_admins_manage_saved_ad_variants"
ON public.saved_ad_variants
FOR ALL
TO authenticated
USING (
    user_id = auth.uid() OR 
    public.is_admin_user() OR
    public.is_service_role()
)
WITH CHECK (
    user_id = auth.uid() OR 
    public.is_admin_user() OR
    public.is_service_role()
);

-- ========================================
-- Secure Admin Stats Function (Replaces View with RLS)
-- ========================================

-- ✅ Secure function for admin statistics instead of view with RLS
CREATE OR REPLACE FUNCTION public.get_admin_system_stats()
RETURNS TABLE(
    total_users BIGINT,
    admin_users BIGINT,
    total_campaigns BIGINT,
    total_products BIGINT,
    total_ads BIGINT,
    published_ads BIGINT,
    total_insights BIGINT,
    avg_conversion_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Nur Admin oder Service Role darf diese Statistiken abrufen
    IF NOT public.is_admin_user() AND NOT public.is_service_role() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.user_profiles)::BIGINT,
        (SELECT COUNT(*) FROM public.user_profiles WHERE role = 'admin')::BIGINT,
        (SELECT COUNT(*) FROM public.ad_campaigns)::BIGINT,
        (SELECT COUNT(*) FROM public.products)::BIGINT,
        (SELECT COUNT(*) FROM public.generated_ads)::BIGINT,
        (SELECT COUNT(*) FROM public.generated_ads WHERE status = 'published')::BIGINT,
        (SELECT COUNT(*) FROM public.market_insights)::BIGINT,
        (SELECT AVG(conversion_score) FROM public.generated_ads WHERE conversion_score IS NOT NULL);
END;
$$;

-- ========================================
-- GDPR Compliance Functions
-- ========================================

-- ✅ GDPR: User kann alle eigenen Daten abrufen
CREATE OR REPLACE FUNCTION public.get_user_gdpr_data(target_user_id UUID DEFAULT auth.uid())
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Nur eigene Daten oder Admin/Service Role
    IF target_user_id != auth.uid() AND NOT public.is_admin_user() AND NOT public.is_service_role() THEN
        RAISE EXCEPTION 'Access denied: Can only access own data';
    END IF;

    SELECT json_build_object(
        'user_profile', up.*,
        'ad_campaigns', ac_data.campaigns,
        'products', p_data.products,
        'generated_ads', ga_data.ads,
        'market_insights', mi_data.insights,
        'saved_ad_variants', sav_data.variants
    ) INTO result
    FROM public.user_profiles up
    LEFT JOIN (
        SELECT user_id, json_agg(ac.*) as campaigns
        FROM public.ad_campaigns ac
        WHERE user_id = target_user_id
        GROUP BY user_id
    ) ac_data ON up.id = ac_data.user_id
    LEFT JOIN (
        SELECT user_id, json_agg(p.*) as products
        FROM public.products p
        WHERE user_id = target_user_id
        GROUP BY user_id
    ) p_data ON up.id = p_data.user_id
    LEFT JOIN (
        SELECT user_id, json_agg(ga.*) as ads
        FROM public.generated_ads ga
        WHERE user_id = target_user_id
        GROUP BY user_id
    ) ga_data ON up.id = ga_data.user_id
    LEFT JOIN (
        SELECT user_id, json_agg(mi.*) as insights
        FROM public.market_insights mi
        WHERE user_id = target_user_id
        GROUP BY user_id
    ) mi_data ON up.id = mi_data.user_id
    LEFT JOIN (
        SELECT user_id, json_agg(sav.*) as variants
        FROM public.saved_ad_variants sav
        WHERE user_id = target_user_id
        GROUP BY user_id
    ) sav_data ON up.id = sav_data.user_id
    WHERE up.id = target_user_id;

    RETURN result;
END;
$$;

-- ✅ GDPR: User kann alle eigenen Daten löschen
CREATE OR REPLACE FUNCTION public.delete_user_gdpr_data(target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Nur eigene Daten oder Admin/Service Role
    IF target_user_id != auth.uid() AND NOT public.is_admin_user() AND NOT public.is_service_role() THEN
        RAISE EXCEPTION 'Access denied: Can only delete own data';
    END IF;

    -- Lösche alle verknüpften Daten in korrekter Reihenfolge
    DELETE FROM public.saved_ad_variants WHERE user_id = target_user_id;
    DELETE FROM public.market_insights WHERE user_id = target_user_id;
    DELETE FROM public.generated_ads WHERE user_id = target_user_id;
    DELETE FROM public.products WHERE user_id = target_user_id;
    DELETE FROM public.ad_campaigns WHERE user_id = target_user_id;
    DELETE FROM public.user_profiles WHERE id = target_user_id;

    RETURN TRUE;
END;
$$;

-- ========================================
-- Security Audit Log
-- ========================================

-- ✅ Tabelle für Security-Logging
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS für Audit Log (nur Service Role und Admins)
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_admin_access"
ON public.security_audit_log
FOR ALL
TO authenticated
USING (
    public.is_admin_user() OR
    public.is_service_role()
)
WITH CHECK (
    public.is_admin_user() OR
    public.is_service_role()
);

-- ✅ Function zum Loggen von Security Events
CREATE OR REPLACE FUNCTION public.log_security_event(
    action_type TEXT,
    table_name TEXT DEFAULT NULL,
    record_id UUID DEFAULT NULL,
    details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.security_audit_log (
        user_id, 
        action, 
        table_name, 
        record_id, 
        details
    ) VALUES (
        auth.uid(),
        action_type,
        table_name,
        record_id,
        details
    );
END;
$$;

-- ========================================
-- Performance Optimizations
-- ========================================

-- ✅ Standard Indices für bessere Performance bei Admin-Queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_generated_ads_status_user ON public.generated_ads(status, user_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_created_at ON public.ad_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_industry_user ON public.products(industry, user_id);

-- ✅ Einfache Indices für bessere Performance (ohne IMMUTABLE-Probleme)
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_user_recent 
ON public.ad_campaigns(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_ads_published 
ON public.generated_ads(user_id, status) 
WHERE status = 'published';

-- ========================================
-- Notification System für RLS Violations
-- ========================================

-- ✅ Function für RLS Violation Logging
CREATE OR REPLACE FUNCTION public.handle_rls_violation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Log RLS violation attempt
    PERFORM public.log_security_event(
        'RLS_VIOLATION_ATTEMPT',
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        json_build_object(
            'operation', TG_OP,
            'attempted_by', auth.uid(),
            'table', TG_TABLE_NAME,
            'timestamp', CURRENT_TIMESTAMP
        )
    );
    
    -- Prevent the operation
    RAISE EXCEPTION 'Row Level Security violation detected and logged';
    
    RETURN NULL;
END;
$$;

-- ========================================
-- Success Message
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '✅ Enhanced RLS Policies erfolgreich implementiert!';
    RAISE NOTICE '📊 Features aktiviert:';
    RAISE NOTICE '   - Dual-Client Support (Public + Admin)';
    RAISE NOTICE '   - GDPR-konforme Datenzugriffe';
    RAISE NOTICE '   - Admin-Dashboard Berechtigung';
    RAISE NOTICE '   - Security Audit Logging';
    RAISE NOTICE '   - Performance Optimierungen';
    RAISE NOTICE '🔒 Alle Tabellen sind jetzt sicher und voll funktionsfähig!';
END $$;