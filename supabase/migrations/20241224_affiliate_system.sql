-- =============================================
-- AFFILIATE PARTNER SYSTEM - Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Affiliate Partners Table
-- Main table for approved affiliate partners
CREATE TABLE IF NOT EXISTS affiliate_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  affiliate_code VARCHAR(50) UNIQUE NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  payout_email VARCHAR(255),
  payout_method VARCHAR(50) DEFAULT 'paypal',
  total_earnings DECIMAL(10,2) DEFAULT 0,
  pending_earnings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Affiliate Referrals Table
-- Tracks users who signed up with an affiliate's promo code
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliate_partners(id) ON DELETE CASCADE NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  promo_code_used VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'registered',
  months_paid INT DEFAULT 0,
  total_commission_earned DECIMAL(10,2) DEFAULT 0,
  last_commission_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  first_payment_at TIMESTAMPTZ,
  plan_type VARCHAR(50)
);

-- 3. Affiliate Commissions Table
-- Individual commission entries (€10 per month, max 12)
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliate_partners(id) ON DELETE CASCADE NOT NULL,
  referral_id UUID REFERENCES affiliate_referrals(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  month_number INT NOT NULL CHECK (month_number >= 1 AND month_number <= 12),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- 4. Affiliate Payouts Table
-- Payout requests from affiliates
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliate_partners(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  status VARCHAR(20) DEFAULT 'pending',
  payout_method VARCHAR(50),
  payout_reference VARCHAR(255),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- 5. Extend user_profiles with affiliate fields
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS referred_by_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS signup_bonus_credits_applied BOOLEAN DEFAULT FALSE;

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_user_id ON affiliate_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_code ON affiliate_partners(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_user_id ON affiliate_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate_id ON affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate_id ON affiliate_payouts(affiliate_id);

-- =============================================
-- RLS (Row Level Security) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE affiliate_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Partners can view their own data
CREATE POLICY "Users can view own affiliate_partner" ON affiliate_partners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate_partner" ON affiliate_partners
  FOR UPDATE USING (auth.uid() = user_id);

-- Partners can view their own referrals
CREATE POLICY "Affiliates can view own referrals" ON affiliate_referrals
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliate_partners WHERE user_id = auth.uid())
  );

-- Partners can view their own commissions
CREATE POLICY "Affiliates can view own commissions" ON affiliate_commissions
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliate_partners WHERE user_id = auth.uid())
  );

-- Partners can view and create payout requests
CREATE POLICY "Affiliates can view own payouts" ON affiliate_payouts
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliate_partners WHERE user_id = auth.uid())
  );

CREATE POLICY "Affiliates can request payouts" ON affiliate_payouts
  FOR INSERT WITH CHECK (
    affiliate_id IN (SELECT id FROM affiliate_partners WHERE user_id = auth.uid() AND is_approved = true)
  );

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to apply promo code during signup
CREATE OR REPLACE FUNCTION apply_promo_code(
  p_promo_code VARCHAR,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_affiliate_id UUID;
  v_bonus_credits INT := 250;
BEGIN
  -- Find affiliate by code (case-insensitive)
  SELECT id INTO v_affiliate_id 
  FROM affiliate_partners 
  WHERE LOWER(affiliate_code) = LOWER(p_promo_code) 
    AND is_approved = true;
  
  IF v_affiliate_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid promo code');
  END IF;
  
  -- Check if user already has a referral
  IF EXISTS (SELECT 1 FROM affiliate_referrals WHERE referred_user_id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already referred');
  END IF;
  
  -- Create referral entry
  INSERT INTO affiliate_referrals (affiliate_id, referred_user_id, promo_code_used, status)
  VALUES (v_affiliate_id, p_user_id, UPPER(p_promo_code), 'registered');
  
  -- Add bonus credits to user
  UPDATE user_profiles 
  SET credits = COALESCE(credits, 0) + v_bonus_credits,
      referred_by_code = UPPER(p_promo_code),
      signup_bonus_credits_applied = true
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'bonus_credits', v_bonus_credits,
    'message', 'Promo code applied! +250 credits added.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get affiliate dashboard stats
CREATE OR REPLACE FUNCTION get_affiliate_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_affiliate_id UUID;
  v_stats JSONB;
BEGIN
  -- Get affiliate ID
  SELECT id INTO v_affiliate_id FROM affiliate_partners WHERE user_id = p_user_id;
  
  IF v_affiliate_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not an affiliate');
  END IF;
  
  -- Build stats
  SELECT jsonb_build_object(
    'total_earnings', COALESCE(ap.total_earnings, 0),
    'pending_earnings', COALESCE(ap.pending_earnings, 0),
    'total_referrals', (SELECT COUNT(*) FROM affiliate_referrals WHERE affiliate_id = v_affiliate_id),
    'active_referrals', (SELECT COUNT(*) FROM affiliate_referrals WHERE affiliate_id = v_affiliate_id AND status = 'paid'),
    'trial_referrals', (SELECT COUNT(*) FROM affiliate_referrals WHERE affiliate_id = v_affiliate_id AND status = 'trial'),
    'this_month_earnings', (
      SELECT COALESCE(SUM(amount), 0) 
      FROM affiliate_commissions 
      WHERE affiliate_id = v_affiliate_id 
        AND created_at >= date_trunc('month', NOW())
    ),
    'affiliate_code', ap.affiliate_code,
    'is_approved', ap.is_approved
  ) INTO v_stats
  FROM affiliate_partners ap
  WHERE ap.id = v_affiliate_id;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- GRANT permissions for anon/authenticated
-- =============================================
GRANT EXECUTE ON FUNCTION apply_promo_code TO authenticated;
GRANT EXECUTE ON FUNCTION get_affiliate_stats TO authenticated;

-- Function to request a payout (with validation)
CREATE OR REPLACE FUNCTION request_payout(
  p_user_id UUID,
  p_amount DECIMAL,
  p_payout_method VARCHAR DEFAULT 'paypal'
) RETURNS JSONB AS $$
DECLARE
  v_affiliate_id UUID;
  v_pending DECIMAL;
  v_payout_id UUID;
  v_min_payout DECIMAL := 20.00; -- Minimum €20 payout
BEGIN
  -- Get affiliate partner
  SELECT id, pending_earnings INTO v_affiliate_id, v_pending
  FROM affiliate_partners 
  WHERE user_id = p_user_id AND is_approved = true;
  
  IF v_affiliate_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not an approved affiliate');
  END IF;
  
  -- Validate amount
  IF p_amount < v_min_payout THEN
    RETURN jsonb_build_object('success', false, 'error', 'Minimum payout is €' || v_min_payout);
  END IF;
  
  IF p_amount > v_pending THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance. Available: €' || v_pending);
  END IF;
  
  -- Create payout request
  INSERT INTO affiliate_payouts (affiliate_id, amount, payout_method, status)
  VALUES (v_affiliate_id, p_amount, p_payout_method, 'pending')
  RETURNING id INTO v_payout_id;
  
  -- Deduct from pending earnings
  UPDATE affiliate_partners
  SET pending_earnings = pending_earnings - p_amount,
      updated_at = NOW()
  WHERE id = v_affiliate_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'payout_id', v_payout_id,
    'amount', p_amount,
    'new_balance', v_pending - p_amount,
    'message', 'Payout request submitted successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION request_payout TO authenticated;

-- Function to get payout history
CREATE OR REPLACE FUNCTION get_payout_history(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  amount DECIMAL,
  status VARCHAR,
  payout_method VARCHAR,
  payout_reference VARCHAR,
  requested_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ap.id,
    ap.amount,
    ap.status,
    ap.payout_method,
    ap.payout_reference,
    ap.requested_at,
    ap.processed_at
  FROM affiliate_payouts ap
  INNER JOIN affiliate_partners aff ON ap.affiliate_id = aff.id
  WHERE aff.user_id = p_user_id
  ORDER BY ap.requested_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_payout_history TO authenticated;
