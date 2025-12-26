-- Migration: Create affiliate services marketplace
-- Description: Enable affiliates to offer paid services to their referrals
-- 
-- Usage: Run this in Supabase SQL Editor after 004_create_affiliate_earnings_daily.sql

-- Drop existing tables if structure is wrong
DROP TABLE IF EXISTS affiliate_service_requests CASCADE;
DROP TABLE IF EXISTS affiliate_services CASCADE;

-- Create services table
CREATE TABLE affiliate_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Service Details
    service_type TEXT NOT NULL CHECK (service_type IN ('ad_review', 'onboarding', 'support', 'consultation', 'custom')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price_credits INTEGER NOT NULL CHECK (price_credits >= 0),
    
    -- Availability
    is_active BOOLEAN DEFAULT true,
    max_slots INTEGER DEFAULT NULL, -- NULL = unlimited
    booked_slots INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create service requests table
CREATE TABLE affiliate_service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES affiliate_services(id) ON DELETE CASCADE,
    requester_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Request Details
    message TEXT NOT NULL,
    response TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled', 'declined')),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_affiliate_services_user ON affiliate_services(affiliate_user_id);
CREATE INDEX idx_affiliate_services_active ON affiliate_services(is_active) WHERE is_active = true;
CREATE INDEX idx_affiliate_service_requests_service ON affiliate_service_requests(service_id);
CREATE INDEX idx_affiliate_service_requests_requester ON affiliate_service_requests(requester_user_id);
CREATE INDEX idx_affiliate_service_requests_status ON affiliate_service_requests(status);

-- Enable RLS
ALTER TABLE affiliate_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_service_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_services
DO $$ 
BEGIN
    -- Anyone can view active services
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'affiliate_services' 
        AND policyname = 'Anyone can view active services'
    ) THEN
        CREATE POLICY "Anyone can view active services"
            ON affiliate_services
            FOR SELECT
            USING (is_active = true OR auth.uid() = affiliate_user_id);
    END IF;

    -- Affiliates can manage their own services
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'affiliate_services' 
        AND policyname = 'Affiliates can manage own services'
    ) THEN
        CREATE POLICY "Affiliates can manage own services"
            ON affiliate_services
            FOR ALL
            USING (auth.uid() = affiliate_user_id);
    END IF;
END $$;

-- RLS Policies for affiliate_service_requests
DO $$ 
BEGIN
    -- Requesters can view their own requests
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'affiliate_service_requests' 
        AND policyname = 'Users can view own requests'
    ) THEN
        CREATE POLICY "Users can view own requests"
            ON affiliate_service_requests
            FOR SELECT
            USING (
                auth.uid() = requester_user_id 
                OR auth.uid() IN (
                    SELECT affiliate_user_id FROM affiliate_services WHERE id = service_id
                )
            );
    END IF;

    -- Users can create requests
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'affiliate_service_requests' 
        AND policyname = 'Users can create requests'
    ) THEN
        CREATE POLICY "Users can create requests"
            ON affiliate_service_requests
            FOR INSERT
            WITH CHECK (auth.uid() = requester_user_id);
    END IF;

    -- Affiliates can update requests for their services
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'affiliate_service_requests' 
        AND policyname = 'Affiliates can update requests'
    ) THEN
        CREATE POLICY "Affiliates can update requests"
            ON affiliate_service_requests
            FOR UPDATE
            USING (
                auth.uid() IN (
                    SELECT affiliate_user_id FROM affiliate_services WHERE id = service_id
                )
            );
    END IF;
END $$;

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_affiliate_services_updated_at ON affiliate_services;
CREATE TRIGGER update_affiliate_services_updated_at
    BEFORE UPDATE ON affiliate_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_affiliate_service_requests_updated_at ON affiliate_service_requests;
CREATE TRIGGER update_affiliate_service_requests_updated_at
    BEFORE UPDATE ON affiliate_service_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON affiliate_services TO authenticated;
GRANT ALL ON affiliate_services TO service_role;
GRANT ALL ON affiliate_service_requests TO authenticated;
GRANT ALL ON affiliate_service_requests TO service_role;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ Migration completed: affiliate_services and affiliate_service_requests tables created';
END $$;
