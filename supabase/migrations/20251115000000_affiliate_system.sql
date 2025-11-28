-- Affiliate System Migration for AdRuby
-- Adds affiliate columns to user_profiles and creates referral/earnings/payout tables plus helper function.

-- 1) Extend user_profiles with affiliate-related fields
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS affiliate_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS affiliate_code TEXT,
ADD COLUMN IF NOT EXISTS referred_by_affiliate_id UUID REFERENCES public.user_profiles (id),
ADD COLUMN IF NOT EXISTS affiliate_balance NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS affiliate_lifetime_earnings NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS bank_account_holder TEXT,
ADD COLUMN IF NOT EXISTS bank_iban TEXT,
ADD COLUMN IF NOT EXISTS bank_bic TEXT;

-- Enforce non-empty affiliate_code when present and uniqueness across users
ALTER TABLE public.user_profiles
ADD CONSTRAINT IF NOT EXISTS chk_affiliate_code_not_blank
CHECK (affiliate_code IS NULL OR length(trim(affiliate_code)) > 0);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_affiliate_code_unique
ON public.user_profiles (affiliate_code)
WHERE affiliate_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_referred_by_affiliate_id
ON public.user_profiles (referred_by_affiliate_id);

-- 2) Referral tracking table
CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.user_profiles (id),
  referred_user_id UUID NOT NULL REFERENCES public.user_profiles (id),
  ref_code TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_status TEXT DEFAULT 'registered',  -- 'registered' | 'active' | 'cancelled'
  last_invoice_paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliate_referrals_unique_pair
ON public.affiliate_referrals (affiliate_id, referred_user_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id
ON public.affiliate_referrals (affiliate_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referred_user_id
ON public.affiliate_referrals (referred_user_id);

-- 3) Earnings table
CREATE TABLE IF NOT EXISTS public.affiliate_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.user_profiles (id),
  referred_user_id UUID NOT NULL REFERENCES public.user_profiles (id),
  stripe_invoice_id TEXT,
  stripe_subscription_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.affiliate_earnings
ADD CONSTRAINT IF NOT EXISTS chk_affiliate_earnings_amount_positive
CHECK (amount > 0);

CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_affiliate_id
ON public.affiliate_earnings (affiliate_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_referred_user_id
ON public.affiliate_earnings (referred_user_id);

-- Prevent double payouts per invoice
CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliate_earnings_invoice_unique
ON public.affiliate_earnings (stripe_invoice_id)
WHERE stripe_invoice_id IS NOT NULL;

-- 4) Payout requests table
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.user_profiles (id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'requested',  -- 'requested' | 'approved' | 'paid' | 'rejected'
  created_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  admin_note TEXT
);

ALTER TABLE public.affiliate_payouts
ADD CONSTRAINT IF NOT EXISTS chk_affiliate_payouts_amount_positive
CHECK (amount > 0);

CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate_id
ON public.affiliate_payouts (affiliate_id);

-- Admin TODO: build panel to approve/reject/mark paid for requested payouts (set status/paid_at/approved_at, notify affiliates).

-- 5) Helper function to atomically add affiliate earnings to balances
CREATE OR REPLACE FUNCTION public.add_affiliate_earning(
  p_affiliate_id UUID,
  p_amount NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.user_profiles
  SET
    affiliate_balance = COALESCE(affiliate_balance, 0) + p_amount,
    affiliate_lifetime_earnings = COALESCE(affiliate_lifetime_earnings, 0) + p_amount
  WHERE id = p_affiliate_id;
END;
$$;

-- 6) Apply affiliate referral via code for the current auth user
CREATE OR REPLACE FUNCTION public.apply_affiliate_referral(
  p_code TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user_id UUID := auth.uid();
  v_affiliate_id UUID;
BEGIN
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'auth.uid() is null';
  END IF;

  IF p_code IS NULL OR length(trim(p_code)) = 0 THEN
    RAISE EXCEPTION 'Affiliate-Code fehlt';
  END IF;

  SELECT id INTO v_affiliate_id
  FROM public.user_profiles
  WHERE affiliate_code = trim(p_code)
    AND affiliate_enabled = TRUE;

  IF v_affiliate_id IS NULL THEN
    RAISE EXCEPTION 'Ungültiger Affiliate-Code';
  END IF;

  IF v_affiliate_id = v_current_user_id THEN
    RAISE EXCEPTION 'Selbst-Referral ist nicht erlaubt';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = v_current_user_id
      AND referred_by_affiliate_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Referral wurde bereits gesetzt';
  END IF;

  UPDATE public.user_profiles
  SET referred_by_affiliate_id = v_affiliate_id
  WHERE id = v_current_user_id;

  INSERT INTO public.affiliate_referrals (
    affiliate_id,
    referred_user_id,
    ref_code,
    current_status
  )
  VALUES (
    v_affiliate_id,
    v_current_user_id,
    trim(p_code),
    'registered'
  )
  ON CONFLICT (affiliate_id, referred_user_id)
  DO UPDATE SET
    ref_code = EXCLUDED.ref_code,
    current_status = 'registered';
END;
$$;

-- 6) RLS policies for affiliate tables
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Referrals: affiliates can see their own, referred users can write their own entry
DROP POLICY IF EXISTS select_own_affiliate_referrals ON public.affiliate_referrals;
CREATE POLICY select_own_affiliate_referrals ON public.affiliate_referrals
  FOR SELECT USING (affiliate_id = auth.uid());

DROP POLICY IF EXISTS insert_self_referral_record ON public.affiliate_referrals;
CREATE POLICY insert_self_referral_record ON public.affiliate_referrals
  FOR INSERT WITH CHECK (referred_user_id = auth.uid());

DROP POLICY IF EXISTS update_self_referral_record ON public.affiliate_referrals;
CREATE POLICY update_self_referral_record ON public.affiliate_referrals
  FOR UPDATE USING (referred_user_id = auth.uid());

-- Earnings: affiliates can read their earnings; inserts are done by service role
DROP POLICY IF EXISTS select_own_affiliate_earnings ON public.affiliate_earnings;
CREATE POLICY select_own_affiliate_earnings ON public.affiliate_earnings
  FOR SELECT USING (affiliate_id = auth.uid());

-- Payouts: affiliates can read and create their own payout requests
DROP POLICY IF EXISTS select_own_affiliate_payouts ON public.affiliate_payouts;
CREATE POLICY select_own_affiliate_payouts ON public.affiliate_payouts
  FOR SELECT USING (affiliate_id = auth.uid());

DROP POLICY IF EXISTS insert_own_affiliate_payouts ON public.affiliate_payouts;
CREATE POLICY insert_own_affiliate_payouts ON public.affiliate_payouts
  FOR INSERT WITH CHECK (affiliate_id = auth.uid());
