-- Migration: Create affiliate achievements system
-- Description: Gamification with badges and milestones
-- 
-- Usage: Run this in Supabase SQL Editor after 005_create_affiliate_services.sql

-- Drop existing tables if structure is wrong
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;

-- Create achievements table (master list)
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL, -- Emoji or icon name
    tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    
    -- Requirements
    requirement_type TEXT NOT NULL CHECK (requirement_type IN ('earnings', 'referrals', 'conversions', 'streak', 'custom')),
    requirement_value INTEGER NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user achievements table (unlocked badges)
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    
    -- Unlock Details
    unlocked_at TIMESTAMPTZ DEFAULT now(),
    progress_value INTEGER DEFAULT 0, -- For tracking progress
    
    -- Unique constraint: one achievement per user
    UNIQUE(user_id, achievement_id)
);

-- Create indexes
CREATE INDEX idx_achievements_tier ON achievements(tier);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked_at DESC);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
    -- Everyone can view achievements
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'achievements' 
        AND policyname = 'Everyone can view achievements'
    ) THEN
        CREATE POLICY "Everyone can view achievements"
            ON achievements
            FOR SELECT
            USING (true);
    END IF;

    -- Users can view their own unlocked achievements
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_achievements' 
        AND policyname = 'Users can view own achievements'
    ) THEN
        CREATE POLICY "Users can view own achievements"
            ON user_achievements
            FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    -- Service role can manage achievements
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_achievements' 
        AND policyname = 'Service role can manage user achievements'
    ) THEN
        CREATE POLICY "Service role can manage user achievements"
            ON user_achievements
            FOR ALL
            USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Grant permissions
GRANT ALL ON achievements TO authenticated;
GRANT ALL ON achievements TO service_role;
GRANT ALL ON user_achievements TO authenticated;
GRANT ALL ON user_achievements TO service_role;

-- Seed initial achievements
INSERT INTO achievements (code, name, description, icon, tier, requirement_type, requirement_value) VALUES
    ('first_sale', 'First Sale', 'Your first referral converted to paid!', '🎯', 'bronze', 'conversions', 1),
    ('ten_referrals', 'Community Builder', 'Reached 10 total referrals', '👥', 'bronze', 'referrals', 10),
    ('hundred_euros', 'Rising Star', 'Earned €100 lifetime', '💰', 'silver', 'earnings', 100),
    ('fifty_referrals', 'Influencer', 'Reached 50 total referrals', '⭐', 'silver', 'referrals', 50),
    ('thousand_euros', 'Big Earner', 'Earned €1,000 lifetime', '💎', 'gold', 'earnings', 1000),
    ('hundred_referrals', 'Super Affiliate', 'Reached 100 total referrals', '🚀', 'gold', 'referrals', 100),
    ('hot_streak_3', 'Hot Streak', '3 consecutive months with earnings', '🔥', 'silver', 'streak', 3),
    ('five_thousand_euros', 'Elite Partner', 'Earned €5,000 lifetime', '👑', 'platinum', 'earnings', 5000),
    ('top_ten', 'Top Performer', 'Ranked in top 10 affiliates', '🏆', 'platinum', 'custom', 10)
ON CONFLICT (code) DO NOTHING;

-- Helper function: Check and unlock achievements for user
CREATE OR REPLACE FUNCTION check_and_unlock_achievements(p_user_id UUID)
RETURNS TABLE (
    achievement_code TEXT,
    achievement_name TEXT,
    newly_unlocked BOOLEAN
) AS $$
DECLARE
    v_total_earnings NUMERIC;
    v_total_referrals INTEGER;
    v_total_conversions INTEGER;
BEGIN
    -- Get user stats
    SELECT 
        COALESCE(SUM(affiliate_balance + affiliate_lifetime_earnings), 0),
        COALESCE(COUNT(*), 0),
        COALESCE(COUNT(*) FILTER (WHERE payment_verified = true), 0)
    INTO v_total_earnings, v_total_referrals, v_total_conversions
    FROM user_profiles
    WHERE referred_by_affiliate_id = p_user_id;

    -- Check earnings-based achievements
    INSERT INTO user_achievements (user_id, achievement_id, progress_value)
    SELECT p_user_id, a.id, v_total_earnings::INTEGER
    FROM achievements a
    WHERE a.requirement_type = 'earnings'
        AND v_total_earnings >= a.requirement_value
        AND NOT EXISTS (
            SELECT 1 FROM user_achievements ua 
            WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
        )
    ON CONFLICT (user_id, achievement_id) DO NOTHING;

    -- Check referrals-based achievements
    INSERT INTO user_achievements (user_id, achievement_id, progress_value)
    SELECT p_user_id, a.id, v_total_referrals
    FROM achievements a
    WHERE a.requirement_type = 'referrals'
        AND v_total_referrals >= a.requirement_value
        AND NOT EXISTS (
            SELECT 1 FROM user_achievements ua 
            WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
        )
    ON CONFLICT (user_id, achievement_id) DO NOTHING;

    -- Check conversions-based achievements
    INSERT INTO user_achievements (user_id, achievement_id, progress_value)
    SELECT p_user_id, a.id, v_total_conversions
    FROM achievements a
    WHERE a.requirement_type = 'conversions'
        AND v_total_conversions >= a.requirement_value
        AND NOT EXISTS (
            SELECT 1 FROM user_achievements ua 
            WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
        )
    ON CONFLICT (user_id, achievement_id) DO NOTHING;

    -- Return unlocked achievements
    RETURN QUERY
    SELECT a.code, a.name, true as newly_unlocked
    FROM user_achievements ua
    JOIN achievements a ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id
    ORDER BY ua.unlocked_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ Migration completed: achievements system created with initial badges';
END $$;
