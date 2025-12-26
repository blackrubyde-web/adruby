-- Migration: Create generated_creatives table
-- Description: Stores AI-generated ad creatives with metadata, thumbnails, and performance metrics
-- 
-- Usage: Run this in Supabase SQL Editor

-- Create table if not exists
CREATE TABLE IF NOT EXISTS generated_creatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Content
    thumbnail TEXT,
    outputs JSONB,
    inputs JSONB,
    
    -- Metadata
    saved BOOLEAN DEFAULT false,
    metrics JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_generated_creatives_user_id 
    ON generated_creatives(user_id);
    
CREATE INDEX IF NOT EXISTS idx_generated_creatives_saved 
    ON generated_creatives(saved) 
    WHERE saved = true;
    
CREATE INDEX IF NOT EXISTS idx_generated_creatives_created_at 
    ON generated_creatives(created_at DESC);

-- Enable Row Level Security
ALTER TABLE generated_creatives ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
    -- Policy: Users can read their own creatives
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'generated_creatives' 
        AND policyname = 'Users can view own creatives'
    ) THEN
        CREATE POLICY "Users can view own creatives"
            ON generated_creatives
            FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    -- Policy: Users can insert their own creatives
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'generated_creatives' 
        AND policyname = 'Users can insert own creatives'
    ) THEN
        CREATE POLICY "Users can insert own creatives"
            ON generated_creatives
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Policy: Users can update their own creatives
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'generated_creatives' 
        AND policyname = 'Users can update own creatives'
    ) THEN
        CREATE POLICY "Users can update own creatives"
            ON generated_creatives
            FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Policy: Users can delete their own creatives
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'generated_creatives' 
        AND policyname = 'Users can delete own creatives'
    ) THEN
        CREATE POLICY "Users can delete own creatives"
            ON generated_creatives
            FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_generated_creatives_updated_at ON generated_creatives;
CREATE TRIGGER update_generated_creatives_updated_at
    BEFORE UPDATE ON generated_creatives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON generated_creatives TO authenticated;
GRANT ALL ON generated_creatives TO service_role;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ Migration completed: generated_creatives table created with RLS policies';
END $$;
