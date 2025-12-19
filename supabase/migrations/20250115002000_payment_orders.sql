CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'created',
  provider TEXT NOT NULL DEFAULT 'stripe',
  amount_total NUMERIC,
  currency TEXT,
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  stripe_subscription_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id
  ON public.payment_orders(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_orders_checkout_session
  ON public.payment_orders(stripe_checkout_session_id);

CREATE INDEX IF NOT EXISTS idx_payment_orders_invoice
  ON public.payment_orders(stripe_invoice_id);

CREATE INDEX IF NOT EXISTS idx_payment_orders_subscription
  ON public.payment_orders(stripe_subscription_id);

ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payment_orders'
  ) THEN
    CREATE POLICY "users_manage_own_payment_orders"
    ON public.payment_orders
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;
