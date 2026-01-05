-- Migration: Fix generated_creatives Schema Conflict
-- Description: Unifies the table definition by ensuring columns from all previous migrations exist.
-- Fixes conflict between 001_create_generated_creatives.sql and 20250115005000_strategy_blueprints.sql

DO $$ 
BEGIN
    -- 1. Ensure 'blueprint_id' exists and is a foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'generated_creatives' AND column_name = 'blueprint_id'
    ) THEN
        ALTER TABLE generated_creatives 
        ADD COLUMN blueprint_id text REFERENCES public.strategy_blueprints(id) ON DELETE SET NULL;
    END IF;

    -- 2. Ensure 'score' exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'generated_creatives' AND column_name = 'score'
    ) THEN
        ALTER TABLE generated_creatives 
        ADD COLUMN score double precision;
    END IF;

    -- 3. Ensure 'saved' column exists (defined in 001, but just in case)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'generated_creatives' AND column_name = 'saved'
    ) THEN
        ALTER TABLE generated_creatives 
        ADD COLUMN saved BOOLEAN DEFAULT false;
    END IF;

    -- 4. Create Index on blueprint_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'generated_creatives' AND indexname = 'idx_generated_creatives_blueprint_id'
    ) THEN
        CREATE INDEX idx_generated_creatives_blueprint_id 
        ON generated_creatives(blueprint_id);
    END IF;

    RAISE NOTICE '✅ Fixed generated_creatives schema conflict';
END $$;
