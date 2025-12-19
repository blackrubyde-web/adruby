-- Minimal billing + credits columns and RPC for server-side enforcement

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS trial_status TEXT DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  credits_used INTEGER NOT NULL,
  credits_before INTEGER NOT NULL,
  credits_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id
  ON public.credit_transactions(user_id);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'credit_transactions'
  ) THEN
    CREATE POLICY "users_manage_own_credit_transactions"
    ON public.credit_transactions
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.consume_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_credits INTEGER;
  next_credits INTEGER;
BEGIN
  SELECT credits INTO current_credits
  FROM public.user_profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF current_credits IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF current_credits < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient credits');
  END IF;

  next_credits := current_credits - p_amount;

  UPDATE public.user_profiles
  SET credits = next_credits
  WHERE id = p_user_id;

  INSERT INTO public.credit_transactions (
    user_id,
    action_type,
    credits_used,
    credits_before,
    credits_after
  ) VALUES (
    p_user_id,
    COALESCE(p_reason, 'consume'),
    p_amount,
    current_credits,
    next_credits
  );

  RETURN jsonb_build_object(
    'success', true,
    'credits_before', current_credits,
    'credits_after', next_credits,
    'credits_used', p_amount
  );
END;
$$;
