-- =============================================
-- ADMIN DASHBOARD - Database Functions
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Check if user is admin
CREATE OR REPLACE FUNCTION admin_check_role(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role 
  FROM user_profiles 
  WHERE id = p_user_id;
  
  RETURN v_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Get all users with billing/credits info (paginated, searchable)
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
    up.email,
    up.full_name,
    up.avatar_url,
    up.role,
    up.credits,
    up.stripe_customer_id,
    up.stripe_subscription_id,
    up.subscription_status,
    up.payment_verified,
    up.trial_status,
    COALESCE(up.trial_ends_at, up.trial_expires_at),
    up.is_affiliate,
    up.referred_by_code,
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

-- 3. Get user count (for pagination)
CREATE OR REPLACE FUNCTION admin_get_user_count(p_search TEXT DEFAULT NULL)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM user_profiles 
    WHERE (p_search IS NULL OR 
           email ILIKE '%' || p_search || '%' OR 
           full_name ILIKE '%' || p_search || '%')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Get all affiliates with their stats
CREATE OR REPLACE FUNCTION admin_get_all_affiliates()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  affiliate_code TEXT,
  is_approved BOOLEAN,
  approved_at TIMESTAMPTZ,
  payout_email TEXT,
  payout_method TEXT,
  total_earnings DECIMAL,
  pending_earnings DECIMAL,
  created_at TIMESTAMPTZ,
  -- Joined user data
  user_email TEXT,
  user_name TEXT,
  -- Computed stats
  total_referrals BIGINT,
  active_referrals BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ap.id,
    ap.user_id,
    ap.affiliate_code::TEXT,
    ap.is_approved,
    ap.approved_at,
    ap.payout_email::TEXT,
    ap.payout_method::TEXT,
    ap.total_earnings,
    ap.pending_earnings,
    ap.created_at,
    up.email::TEXT,
    up.full_name::TEXT,
    (SELECT COUNT(*) FROM affiliate_referrals ar WHERE ar.affiliate_id = ap.id),
    (SELECT COUNT(*) FROM affiliate_referrals ar WHERE ar.affiliate_id = ap.id AND ar.status = 'paid')
  FROM affiliate_partners ap
  LEFT JOIN user_profiles up ON ap.user_id = up.id
  ORDER BY ap.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create new affiliate partner
CREATE OR REPLACE FUNCTION admin_create_affiliate(
  p_user_id UUID,
  p_code TEXT,
  p_payout_email TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_affiliate_id UUID;
  v_code TEXT;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Check if user is already an affiliate
  IF EXISTS (SELECT 1 FROM affiliate_partners WHERE user_id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User is already an affiliate');
  END IF;
  
  -- Generate code if not provided
  v_code := COALESCE(UPPER(TRIM(p_code)), 'RUBY' || SUBSTR(MD5(p_user_id::TEXT || NOW()::TEXT), 1, 6));
  
  -- Check if code is unique
  IF EXISTS (SELECT 1 FROM affiliate_partners WHERE UPPER(affiliate_code) = UPPER(v_code)) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Affiliate code already exists');
  END IF;
  
  -- Create affiliate partner
  INSERT INTO affiliate_partners (user_id, affiliate_code, is_approved, approved_at, payout_email)
  VALUES (p_user_id, v_code, TRUE, NOW(), p_payout_email)
  RETURNING id INTO v_affiliate_id;
  
  -- Update user profile
  UPDATE user_profiles SET is_affiliate = TRUE WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'affiliate_id', v_affiliate_id,
    'affiliate_code', v_code,
    'message', 'Affiliate partner created successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Get all payouts (pending and completed)
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
  -- Joined data
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
  JOIN affiliate_partners ap ON pay.affiliate_id = ap.id
  LEFT JOIN user_profiles up ON ap.user_id = up.id
  WHERE (p_status IS NULL OR pay.status = p_status)
  ORDER BY pay.requested_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Process a payout (mark as completed/failed)
CREATE OR REPLACE FUNCTION admin_process_payout(
  p_payout_id UUID,
  p_status TEXT,
  p_reference TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_payout RECORD;
BEGIN
  -- Get payout details
  SELECT * INTO v_payout FROM affiliate_payouts WHERE id = p_payout_id;
  
  IF v_payout IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payout not found');
  END IF;
  
  -- Validate status
  IF p_status NOT IN ('completed', 'failed', 'processing') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid status');
  END IF;
  
  -- Update payout
  UPDATE affiliate_payouts 
  SET 
    status = p_status,
    payout_reference = COALESCE(p_reference, payout_reference),
    processed_at = CASE WHEN p_status IN ('completed', 'failed') THEN NOW() ELSE processed_at END
  WHERE id = p_payout_id;
  
  -- If completed, update affiliate total_earnings
  IF p_status = 'completed' THEN
    UPDATE affiliate_partners 
    SET total_earnings = total_earnings + v_payout.amount
    WHERE id = v_payout.affiliate_id;
  END IF;
  
  -- If failed, refund pending_earnings
  IF p_status = 'failed' THEN
    UPDATE affiliate_partners 
    SET pending_earnings = pending_earnings + v_payout.amount
    WHERE id = v_payout.affiliate_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'payout_id', p_payout_id,
    'new_status', p_status,
    'message', 'Payout updated successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Get platform revenue stats
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
      WHERE registered_at >= DATE_TRUNC('month', NOW())
    ),
    'this_month_commissions', (
      SELECT COALESCE(SUM(amount), 0) FROM affiliate_commissions 
      WHERE created_at >= DATE_TRUNC('month', NOW())
    )
  ) INTO v_stats;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Update user credits (admin adjustment)
CREATE OR REPLACE FUNCTION admin_update_user_credits(
  p_user_id UUID,
  p_credits INT,
  p_reason TEXT DEFAULT 'admin_adjustment'
)
RETURNS JSONB AS $$
DECLARE
  v_current_credits INT;
  v_new_credits INT;
BEGIN
  -- Get current credits
  SELECT credits INTO v_current_credits FROM user_profiles WHERE id = p_user_id;
  
  IF v_current_credits IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  v_new_credits := GREATEST(0, p_credits); -- Ensure non-negative
  
  -- Update credits
  UPDATE user_profiles SET credits = v_new_credits WHERE id = p_user_id;
  
  -- Log the transaction
  INSERT INTO credit_transactions (user_id, action_type, credits_used, credits_before, credits_after)
  VALUES (p_user_id, p_reason, ABS(v_new_credits - v_current_credits), v_current_credits, v_new_credits);
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'credits_before', v_current_credits,
    'credits_after', v_new_credits,
    'message', 'Credits updated successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Approve affiliate partner
CREATE OR REPLACE FUNCTION admin_approve_affiliate(p_affiliate_id UUID)
RETURNS JSONB AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM affiliate_partners WHERE id = p_affiliate_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Affiliate not found');
  END IF;
  
  UPDATE affiliate_partners 
  SET is_approved = TRUE, approved_at = NOW()
  WHERE id = p_affiliate_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'affiliate_id', p_affiliate_id,
    'message', 'Affiliate approved successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- GRANT permissions
-- =============================================
GRANT EXECUTE ON FUNCTION admin_check_role TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_all_users TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_user_count TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_all_affiliates TO authenticated;
GRANT EXECUTE ON FUNCTION admin_create_affiliate TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_all_payouts TO authenticated;
GRANT EXECUTE ON FUNCTION admin_process_payout TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_revenue_stats TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_user_credits TO authenticated;
GRANT EXECUTE ON FUNCTION admin_approve_affiliate TO authenticated;
