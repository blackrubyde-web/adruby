-- Migration: Fix Admin RPC Errors and Missing Columns
-- Description: Ensures all required columns for Admin Dashboard exist and RPCs are synced.

-- 1. Fix affiliate_payouts (Missing payout_method)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'affiliate_payouts') THEN
        ALTER TABLE affiliate_payouts 
        ADD COLUMN IF NOT EXISTS payout_method VARCHAR(50) DEFAULT 'paypal';
    END IF;
END $$;

-- 2. Fix affiliate_referrals (Missing status)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'affiliate_referrals') THEN
        ALTER TABLE affiliate_referrals 
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'registered';
    END IF;
END $$;

-- 3. Fix user_profiles (Missing columns for admin_get_all_users)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS credits INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS trial_status TEXT,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS referred_by_code TEXT;

-- 4. Re-create admin_get_all_users to ensure type safety
CREATE OR REPLACE FUNCTION admin_get_all_users(
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0,
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT,
  credits INT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT,
  payment_verified BOOLEAN,
  trial_status TEXT,
  trial_ends_at TIMESTAMPTZ,
  is_affiliate BOOLEAN,
  referred_by_code TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.email::TEXT,
    up.full_name::TEXT,
    up.avatar_url::TEXT,
    up.role::TEXT,
    COALESCE(up.credits, 0),
    up.stripe_customer_id::TEXT,
    up.stripe_subscription_id::TEXT,
    up.subscription_status::TEXT,
    COALESCE(up.payment_verified, FALSE),
    up.trial_status::TEXT,
    up.trial_ends_at,
    COALESCE(up.is_affiliate, FALSE),
    up.referred_by_code::TEXT,
    up.created_at
  FROM user_profiles up
  WHERE (p_search IS NULL OR 
         up.email ILIKE '%' || p_search || '%' OR 
         up.full_name ILIKE '%' || p_search || '%')
  ORDER BY up.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Re-create admin_get_all_payouts to match table
CREATE OR REPLACE FUNCTION admin_get_all_payouts(p_status TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  affiliate_id UUID,
  amount DECIMAL,
  status TEXT,
  payout_method TEXT,
  payout_reference TEXT,
  requested_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  affiliate_code TEXT,
  payout_email TEXT,
  user_email TEXT,
  user_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pay.id,
    pay.affiliate_id,
    pay.amount,
    pay.status::TEXT,
    pay.payout_method::TEXT,
    pay.payout_reference::TEXT,
    pay.requested_at,
    pay.processed_at,
    ap.affiliate_code::TEXT,
    ap.payout_email::TEXT,
    up.email::TEXT,
    up.full_name::TEXT
  FROM affiliate_payouts pay
  LEFT JOIN affiliate_partners ap ON pay.affiliate_id = ap.id
  LEFT JOIN user_profiles up ON ap.user_id = up.id
  WHERE (p_status IS NULL OR pay.status = p_status)
  ORDER BY pay.requested_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Fix admin_get_revenue_stats (registered_at doesn't exist, use created_at)
CREATE OR REPLACE FUNCTION admin_get_revenue_stats()
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM user_profiles),
    'paying_users', (SELECT COUNT(*) FROM user_profiles WHERE payment_verified = TRUE),
    'trial_users', (SELECT COUNT(*) FROM user_profiles WHERE trial_status = 'active'),
    'total_affiliates', (SELECT COUNT(*) FROM affiliate_partners),
    'approved_affiliates', (SELECT COUNT(*) FROM affiliate_partners WHERE is_approved = TRUE),
    'total_referrals', (SELECT COUNT(*) FROM affiliate_referrals),
    'active_referrals', (SELECT COUNT(*) FROM affiliate_referrals WHERE status = 'paid'),
    'total_affiliate_earnings', (SELECT COALESCE(SUM(total_earnings), 0) FROM affiliate_partners),
    'pending_affiliate_earnings', (SELECT COALESCE(SUM(pending_earnings), 0) FROM affiliate_partners),
    'pending_payouts_count', (SELECT COUNT(*) FROM affiliate_payouts WHERE status = 'pending'),
    'pending_payouts_amount', (SELECT COALESCE(SUM(amount), 0) FROM affiliate_payouts WHERE status = 'pending'),
    'completed_payouts_amount', (SELECT COALESCE(SUM(amount), 0) FROM affiliate_payouts WHERE status = 'completed'),
    'this_month_referrals', (
      SELECT COUNT(*) FROM affiliate_referrals 
      WHERE created_at >= DATE_TRUNC('month', NOW())
    ),
    'this_month_commissions', (
      SELECT COALESCE(SUM(amount), 0) FROM affiliate_commissions 
      WHERE created_at >= DATE_TRUNC('month', NOW())
    )
  ) INTO v_stats;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION admin_get_all_payouts TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_revenue_stats TO authenticated;
