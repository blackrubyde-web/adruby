-- Atomic Credit Deduction RPC
-- Prevents race conditions from parallel requests
-- Run this in Supabase SQL Editor

-- Drop existing functions if they have different signatures
DROP FUNCTION IF EXISTS consume_credits_atomic(UUID, INTEGER);
DROP FUNCTION IF EXISTS ensure_user_profile_exists();
DROP FUNCTION IF EXISTS add_affiliate_earning(UUID, NUMERIC);

-- 1. Create atomic credit consumption function
CREATE OR REPLACE FUNCTION consume_credits_atomic(
  p_user_id UUID,
  p_amount INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Atomic UPDATE with RETURNING
  -- Only succeeds if user has sufficient credits
  UPDATE user_profiles 
  SET credits = credits - p_amount,
      updated_at = now()
  WHERE id = p_user_id 
    AND credits >= p_amount
  RETURNING credits INTO v_new_balance;
  
  -- If no rows affected, user doesn't have enough credits
  IF NOT FOUND THEN
    RETURN -1; -- Signal insufficient credits
  END IF;
  
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure User Profile Exists (called from AuthContext)
CREATE OR REPLACE FUNCTION ensure_user_profile_exists()
RETURNS void AS $$
BEGIN
  INSERT INTO user_profiles (id, email, credits)
  SELECT auth.uid(), auth.email(), 100  -- 100 starter credits
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Add Affiliate Earning (called from stripe-webhook.js)
CREATE OR REPLACE FUNCTION add_affiliate_earning(
  p_affiliate_id UUID,
  p_amount NUMERIC
) RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET credits = COALESCE(credits, 0) + (p_amount * 10)::INTEGER,
      updated_at = now()
  WHERE id = p_affiliate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant execute permissions
GRANT EXECUTE ON FUNCTION consume_credits_atomic(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION consume_credits_atomic(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION ensure_user_profile_exists() TO authenticated;
GRANT EXECUTE ON FUNCTION add_affiliate_earning(UUID, NUMERIC) TO service_role;

-- Done! All missing RPCs are now available.
