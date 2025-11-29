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
ADD COLUMN IF NOT EXISTS bank_bic TEXT,
ADD COLUMN IF NOT EXISTS auto_payout_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_payout_day INTEGER,
ADD COLUMN IF NOT EXISTS auto_payout_min_amount NUMERIC(10,2) DEFAULT 0;

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
  status TEXT DEFAULT 'requested',
  created_at TIMESTAMPTZ DEFAULT now(),
  requested_at TIMESTAMPTZ DEFAULT now(),   -- << HINZUFÜGEN
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  admin_note TEXT,
  note TEXT,
  bank_account_holder TEXT,
  bank_iban TEXT,
  bank_bic TEXT
);


ALTER TABLE public.affiliate_payouts
ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ DEFAULT now();
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

-- Admin policies to allow full access for administrators via is_admin()
CREATE OR REPLACE FUNCTION public.is_admin(token_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_profiles WHERE id = token_user_id AND role = 'admin'
  );
$$;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_select_user_profiles ON public.user_profiles;
CREATE POLICY admin_select_user_profiles ON public.user_profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS select_self_user_profiles ON public.user_profiles;
CREATE POLICY select_self_user_profiles ON public.user_profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS update_self_user_profiles ON public.user_profiles;
CREATE POLICY update_self_user_profiles ON public.user_profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Admin overrides for affiliate tables
DROP POLICY IF EXISTS admin_select_affiliate_referrals ON public.affiliate_referrals;
CREATE POLICY admin_select_affiliate_referrals ON public.affiliate_referrals
  FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS admin_select_affiliate_earnings ON public.affiliate_earnings;
CREATE POLICY admin_select_affiliate_earnings ON public.affiliate_earnings
  FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS admin_select_affiliate_payouts ON public.affiliate_payouts;
CREATE POLICY admin_select_affiliate_payouts ON public.affiliate_payouts
  FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS admin_update_affiliate_payouts ON public.affiliate_payouts;
CREATE POLICY admin_update_affiliate_payouts ON public.affiliate_payouts
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Payments table and policies (for revenue stats)
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id),
  stripe_invoice_id text,
  amount numeric(10,2),
  currency text,
  paid_at timestamptz
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_select_payments ON public.payments;
CREATE POLICY admin_select_payments ON public.payments
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Revenue stats RPC (monthly + total + monthly breakdown)
CREATE OR REPLACE FUNCTION public.get_revenue_stats()
RETURNS TABLE(monthly_amount numeric, total_amount numeric, monthly_breakdown jsonb)
LANGUAGE plpgsql
AS $$
DECLARE
  v_monthly numeric;
  v_total numeric;
  v_breakdown jsonb;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_monthly
  FROM public.payments
  WHERE date_trunc('month', paid_at) = date_trunc('month', now());

  SELECT COALESCE(SUM(amount), 0) INTO v_total
  FROM public.payments;

  SELECT jsonb_agg(row_to_json(t))
  INTO v_breakdown
  FROM (
    SELECT
      date_trunc('month', paid_at) AS month,
      SUM(amount) AS amount
    FROM public.payments
    WHERE paid_at >= date_trunc('month', now()) - INTERVAL '11 months'
    GROUP BY 1
    ORDER BY 1
  ) t;

  RETURN QUERY SELECT v_monthly, v_total, COALESCE(v_breakdown, '[]'::jsonb);
END;
$$ SECURITY DEFINER;

-- Affiliate leaderboard RPC
CREATE OR REPLACE FUNCTION public.get_affiliate_leaderboard()
RETURNS TABLE(
  affiliate_id uuid,
  referral_count bigint,
  paid_sum numeric,
  affiliate_balance numeric,
  affiliate_lifetime_earnings numeric,
  full_name text,
  first_name text,
  last_name text,
  email text
) AS $$
  SELECT
    up.id AS affiliate_id,
    COALESCE(refs.referral_count, 0) AS referral_count,
    COALESCE(payouts.paid_sum, 0) AS paid_sum,
    COALESCE(up.affiliate_balance, 0) AS affiliate_balance,
    COALESCE(up.affiliate_lifetime_earnings, 0) AS affiliate_lifetime_earnings,
    NULLIF(trim(concat(up.first_name, ' ', up.last_name)), '') AS full_name,
    up.first_name,
    up.last_name,
    up.email
  FROM public.user_profiles up
  LEFT JOIN (
    SELECT affiliate_id, COUNT(*) AS referral_count
    FROM public.affiliate_referrals
    GROUP BY affiliate_id
  ) refs ON refs.affiliate_id = up.id
  LEFT JOIN (
    SELECT affiliate_id, COALESCE(SUM(amount), 0) AS paid_sum
    FROM public.affiliate_payouts
    WHERE status = 'paid'
    GROUP BY affiliate_id
  ) payouts ON payouts.affiliate_id = up.id
  WHERE up.affiliate_enabled = TRUE;
$$ LANGUAGE sql SECURITY DEFINER;

-- Create affiliate payout with bank snapshot
CREATE OR REPLACE FUNCTION public.create_affiliate_payout(
  p_affiliate_id uuid,
  p_amount numeric,
  p_currency text DEFAULT 'EUR'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile record;
  v_payout record;
BEGIN
  IF p_affiliate_id IS NULL THEN
    RAISE EXCEPTION 'affiliate_id required';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;

  SELECT * INTO v_profile FROM public.user_profiles WHERE id = p_affiliate_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'affiliate not found';
  END IF;

  INSERT INTO public.affiliate_payouts (
    affiliate_id,
    amount,
    currency,
    status,
    bank_account_holder,
    bank_iban,
    bank_bic
  )
  VALUES (
    p_affiliate_id,
    p_amount,
    COALESCE(p_currency, 'EUR'),
    'requested',
    v_profile.bank_account_holder,
    v_profile.bank_iban,
    v_profile.bank_bic
  )
  RETURNING * INTO v_payout;

  RETURN row_to_json(v_payout);
END;
$$;

-- Process affiliate payout (admin)
CREATE OR REPLACE FUNCTION public.process_affiliate_payout(
  p_payout_id uuid,
  p_new_status text DEFAULT 'paid',
  p_note text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payout record;
  v_balance numeric;
BEGIN
  IF p_payout_id IS NULL THEN
    RAISE EXCEPTION 'payout id required';
  END IF;

  SELECT * INTO v_payout FROM public.affiliate_payouts WHERE id = p_payout_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'payout not found';
  END IF;

  IF v_payout.status = 'paid' THEN
    RAISE EXCEPTION 'payout already paid';
  END IF;

  IF p_new_status = 'paid' THEN
    SELECT affiliate_balance INTO v_balance FROM public.user_profiles WHERE id = v_payout.affiliate_id FOR UPDATE;
    IF v_balance IS NULL OR v_balance < v_payout.amount THEN
      RAISE EXCEPTION 'insufficient balance';
    END IF;

    UPDATE public.user_profiles
    SET affiliate_balance = GREATEST(0, COALESCE(affiliate_balance, 0) - v_payout.amount)
    WHERE id = v_payout.affiliate_id;

    UPDATE public.affiliate_payouts
    SET
      status = 'paid',
      paid_at = COALESCE(v_payout.paid_at, now()),
      processed_at = now(),
      note = COALESCE(p_note, v_payout.note),
      admin_note = p_note
    WHERE id = p_payout_id;
  ELSIF p_new_status IN ('approved', 'rejected') THEN
    UPDATE public.affiliate_payouts
    SET
      status = p_new_status,
      approved_at = CASE WHEN p_new_status = 'approved' THEN COALESCE(v_payout.approved_at, now()) ELSE v_payout.approved_at END,
      processed_at = CASE WHEN p_new_status = 'rejected' THEN now() ELSE v_payout.processed_at END,
      note = COALESCE(p_note, v_payout.note),
      admin_note = p_note
    WHERE id = p_payout_id;
  ELSE
    RAISE EXCEPTION 'unsupported status %', p_new_status;
  END IF;

  SELECT * INTO v_payout FROM public.affiliate_payouts WHERE id = p_payout_id;
  RETURN row_to_json(v_payout);
END;
$$;
