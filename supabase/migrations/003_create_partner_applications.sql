-- Migration: Create partner_applications table
-- Description: Stores partner program applications for admin review
-- 
-- Usage: Run this in Supabase SQL Editor

-- Drop existing table if structure is wrong
DROP TABLE IF EXISTS partner_applications CASCADE;

-- Create table
CREATE TABLE partner_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Application Details
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    company_name TEXT,
    website TEXT,
    
    -- Partner Type
    partner_type TEXT NOT NULL CHECK (partner_type IN ('influencer', 'coach', 'community_leader', 'agency', 'other')),
    
    -- Audience Info
    audience_size INTEGER,
    audience_description TEXT,
    platform TEXT, -- Instagram, YouTube, TikTok, etc.
    
    -- Motivation
    motivation TEXT NOT NULL,
    experience TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'contacted')),
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX idx_partner_applications_status ON partner_applications(status);
CREATE INDEX idx_partner_applications_created_at ON partner_applications(created_at DESC);
CREATE INDEX idx_partner_applications_email ON partner_applications(email);
CREATE INDEX idx_partner_applications_user_id ON partner_applications(user_id) WHERE user_id IS NOT NULL;

-- Enable RLS
ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
    -- Policy: Users can view their own applications
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'partner_applications' 
        AND policyname = 'Users can view own applications'
    ) THEN
        CREATE POLICY "Users can view own applications"
            ON partner_applications
            FOR SELECT
            USING (auth.uid() = user_id OR user_id IS NULL);
    END IF;

    -- Policy: Anyone can insert (for public form)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'partner_applications' 
        AND policyname = 'Anyone can submit application'
    ) THEN
        CREATE POLICY "Anyone can submit application"
            ON partner_applications
            FOR INSERT
            WITH CHECK (true);
    END IF;

    -- Policy: Only admins can update (check user_profiles.role = 'admin')
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'partner_applications' 
        AND policyname = 'Admins can update applications'
    ) THEN
        CREATE POLICY "Admins can update applications"
            ON partner_applications
            FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE user_profiles.id = auth.uid() 
                    AND user_profiles.role = 'admin'
                )
            );
    END IF;

    -- Policy: Only admins can delete
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'partner_applications' 
        AND policyname = 'Admins can delete applications'
    ) THEN
        CREATE POLICY "Admins can delete applications"
            ON partner_applications
            FOR DELETE
            USING (
                EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE user_profiles.id = auth.uid() 
                    AND user_profiles.role = 'admin'
                )
            );
    END IF;
END $$;

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger
DROP TRIGGER IF EXISTS update_partner_applications_updated_at ON partner_applications;
CREATE TRIGGER update_partner_applications_updated_at
    BEFORE UPDATE ON partner_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON partner_applications TO authenticated;
GRANT ALL ON partner_applications TO service_role;
GRANT SELECT, INSERT ON partner_applications TO anon; -- Allow anonymous submissions

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ Migration completed: partner_applications table created';
END $$;
