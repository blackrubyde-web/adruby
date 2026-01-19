-- =============================================
-- TIERED AFFILIATE COMMISSION SYSTEM
-- Migration: 20260119_tiered_commissions.sql
-- =============================================

-- 1. Add tier and commission rate fields to affiliate_partners
ALTER TABLE affiliate_partners 
ADD COLUMN IF NOT EXISTS current_tier VARCHAR(20) DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 15.00;

-- Update existing affiliates to have correct tier based on their referral count
UPDATE affiliate_partners ap
SET 
  current_tier = CASE 
    WHEN (SELECT COUNT(*) FROM affiliate_referrals ar WHERE ar.affiliate_id = ap.id AND ar.status = 'paid') >= 30 THEN 'elite'
    WHEN (SELECT COUNT(*) FROM affiliate_referrals ar WHERE ar.affiliate_id = ap.id AND ar.status = 'paid') >= 10 THEN 'pro'
    ELSE 'starter'
  END,
  commission_rate = CASE 
    WHEN (SELECT COUNT(*) FROM affiliate_referrals ar WHERE ar.affiliate_id = ap.id AND ar.status = 'paid') >= 30 THEN 30.00
    WHEN (SELECT COUNT(*) FROM affiliate_referrals ar WHERE ar.affiliate_id = ap.id AND ar.status = 'paid') >= 10 THEN 20.00
    ELSE 15.00
  END;

-- 2. Create tier calculation function
CREATE OR REPLACE FUNCTION calculate_affiliate_tier(referral_count INT)
RETURNS TABLE(tier VARCHAR, commission_rate DECIMAL) AS $$
BEGIN
  IF referral_count >= 30 THEN
    RETURN QUERY SELECT 'elite'::VARCHAR, 30.00::DECIMAL;
  ELSIF referral_count >= 10 THEN
    RETURN QUERY SELECT 'pro'::VARCHAR, 20.00::DECIMAL;
  ELSE
    RETURN QUERY SELECT 'starter'::VARCHAR, 15.00::DECIMAL;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. Create auto-upgrade trigger function
CREATE OR REPLACE FUNCTION update_affiliate_tier()
RETURNS TRIGGER AS $$
DECLARE
  v_referral_count INT;
  v_new_tier VARCHAR(20);
  v_new_rate DECIMAL(5,2);
BEGIN
  -- Count PAID referrals for this affiliate
  SELECT COUNT(*) INTO v_referral_count 
  FROM affiliate_referrals 
  WHERE affiliate_id = NEW.affiliate_id AND status = 'paid';
  
  -- Calculate new tier
  IF v_referral_count >= 30 THEN
    v_new_tier := 'elite';
    v_new_rate := 30.00;
  ELSIF v_referral_count >= 10 THEN
    v_new_tier := 'pro';
    v_new_rate := 20.00;
  ELSE
    v_new_tier := 'starter';
    v_new_rate := 15.00;
  END IF;
  
  -- Update affiliate tier if changed
  UPDATE affiliate_partners 
  SET current_tier = v_new_tier,
      commission_rate = v_new_rate,
      updated_at = NOW()
  WHERE id = NEW.affiliate_id 
    AND (current_tier IS DISTINCT FROM v_new_tier);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trg_update_affiliate_tier ON affiliate_referrals;

-- Create trigger on referral status changes
CREATE TRIGGER trg_update_affiliate_tier
AFTER INSERT OR UPDATE OF status ON affiliate_referrals
FOR EACH ROW EXECUTE FUNCTION update_affiliate_tier();

-- 4. Create percentage-based commission calculation function
CREATE OR REPLACE FUNCTION calculate_commission_amount(
  p_affiliate_id UUID,
  p_subscription_amount DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  v_rate DECIMAL;
BEGIN
  SELECT commission_rate INTO v_rate 
  FROM affiliate_partners WHERE id = p_affiliate_id;
  
  -- Return commission amount based on percentage
  RETURN ROUND(p_subscription_amount * (COALESCE(v_rate, 15.00) / 100), 2);
END;
$$ LANGUAGE plpgsql;

-- 5. Update get_affiliate_stats to include tier info
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
  
  -- Build stats with tier info
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
    'is_approved', ap.is_approved,
    'current_tier', COALESCE(ap.current_tier, 'starter'),
    'commission_rate', COALESCE(ap.commission_rate, 15.00)
  ) INTO v_stats
  FROM affiliate_partners ap
  WHERE ap.id = v_affiliate_id;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_affiliate_tier TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_commission_amount TO authenticated;

-- =============================================
-- VERIFICATION QUERY (run after migration)
-- =============================================
-- SELECT id, affiliate_code, current_tier, commission_rate, 
--        (SELECT COUNT(*) FROM affiliate_referrals ar WHERE ar.affiliate_id = ap.id AND ar.status = 'paid') as paid_referrals
-- FROM affiliate_partners ap;
