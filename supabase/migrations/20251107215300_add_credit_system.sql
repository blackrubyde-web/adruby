-- Location: supabase/migrations/20251107215300_add_credit_system.sql
-- Schema Analysis: Existing user_profiles table with authentication system
-- Integration Type: Extension - Adding credit system to existing user management
-- Dependencies: user_profiles table

-- 1. Add credits column to existing user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN credits INTEGER DEFAULT 1000 NOT NULL,
ADD COLUMN stripe_customer_id TEXT UNIQUE;

-- Add index for credits column
CREATE INDEX idx_user_profiles_credits ON public.user_profiles(credits);
CREATE INDEX idx_user_profiles_stripe_customer_id ON public.user_profiles(stripe_customer_id);

-- 2. Create credit transactions table for tracking credit usage
CREATE TABLE public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('ad_builder', 'ai_analysis', 'ad_strategy', 'full_process', 'purchase', 'refund')),
    credits_used INTEGER NOT NULL, -- Positive for usage, negative for purchases
    credits_before INTEGER NOT NULL,
    credits_after INTEGER NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for credit transactions
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_action_type ON public.credit_transactions(action_type);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at);

-- 3. Create credit packages table for different purchase options
CREATE TABLE public.credit_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    price_cents INTEGER NOT NULL, -- Price in cents
    currency TEXT DEFAULT 'EUR',
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Insert default credit packages
INSERT INTO public.credit_packages (name, credits, price_cents, is_popular, is_active) VALUES
    ('Starter Pack', 1000, 999, FALSE, TRUE), -- 9.99 EUR
    ('Professional Pack', 2500, 1999, TRUE, TRUE), -- 19.99 EUR  
    ('Business Pack', 5000, 3499, FALSE, TRUE), -- 34.99 EUR
    ('Enterprise Pack', 10000, 5999, FALSE, TRUE); -- 59.99 EUR

-- 4. Create payment orders table for Stripe integration
CREATE TABLE public.payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    credit_package_id UUID REFERENCES public.credit_packages(id),
    stripe_payment_intent_id TEXT UNIQUE,
    order_number TEXT UNIQUE NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'EUR',
    credits_amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'cancelled')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for payment orders
CREATE INDEX idx_payment_orders_user_id ON public.payment_orders(user_id);
CREATE INDEX idx_payment_orders_stripe_payment_intent_id ON public.payment_orders(stripe_payment_intent_id);
CREATE INDEX idx_payment_orders_status ON public.payment_orders(status);

-- 5. Enable RLS on all new tables
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

-- 6. Functions for credit management
CREATE OR REPLACE FUNCTION public.deduct_credits(
    p_user_id UUID,
    p_action_type TEXT,
    p_credits_to_deduct INTEGER,
    p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_credits INTEGER;
    new_credits INTEGER;
    transaction_id UUID;
BEGIN
    -- Get current credits
    SELECT credits INTO current_credits
    FROM public.user_profiles
    WHERE id = p_user_id;

    IF current_credits IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    -- Check if user has enough credits
    IF current_credits < p_credits_to_deduct THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient credits', 'current_credits', current_credits);
    END IF;

    -- Calculate new credits
    new_credits := current_credits - p_credits_to_deduct;

    -- Update user credits
    UPDATE public.user_profiles
    SET credits = new_credits,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_user_id;

    -- Record transaction
    INSERT INTO public.credit_transactions (user_id, action_type, credits_used, credits_before, credits_after, description)
    VALUES (p_user_id, p_action_type, p_credits_to_deduct, current_credits, new_credits, p_description)
    RETURNING id INTO transaction_id;

    RETURN jsonb_build_object(
        'success', true,
        'credits_before', current_credits,
        'credits_after', new_credits,
        'credits_used', p_credits_to_deduct,
        'transaction_id', transaction_id
    );
END;
$$;

-- Function to add credits (for purchases)
CREATE OR REPLACE FUNCTION public.add_credits(
    p_user_id UUID,
    p_credits_to_add INTEGER,
    p_description TEXT DEFAULT 'Credit purchase'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_credits INTEGER;
    new_credits INTEGER;
    transaction_id UUID;
BEGIN
    -- Get current credits
    SELECT credits INTO current_credits
    FROM public.user_profiles
    WHERE id = p_user_id;

    IF current_credits IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    -- Calculate new credits
    new_credits := current_credits + p_credits_to_add;

    -- Update user credits
    UPDATE public.user_profiles
    SET credits = new_credits,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_user_id;

    -- Record transaction (negative credits_used for additions)
    INSERT INTO public.credit_transactions (user_id, action_type, credits_used, credits_before, credits_after, description)
    VALUES (p_user_id, 'purchase', -p_credits_to_add, current_credits, new_credits, p_description)
    RETURNING id INTO transaction_id;

    RETURN jsonb_build_object(
        'success', true,
        'credits_before', current_credits,
        'credits_after', new_credits,
        'credits_added', p_credits_to_add,
        'transaction_id', transaction_id
    );
END;
$$;

-- Function to get user credit status with color indicator
CREATE OR REPLACE FUNCTION public.get_user_credit_status(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_credits INTEGER;
    credit_status TEXT;
    status_color TEXT;
    max_credits INTEGER := 1000; -- Default max for percentage calculation
BEGIN
    -- Get current credits
    SELECT credits INTO user_credits
    FROM public.user_profiles
    WHERE id = p_user_id;

    IF user_credits IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    -- Determine status and color based on German requirements
    IF user_credits > 250 THEN
        credit_status := 'high';
        status_color := 'green';
    ELSIF user_credits <= 250 AND user_credits > 50 THEN
        credit_status := 'medium';
        status_color := 'orange';
    ELSE
        credit_status := 'low';
        status_color := 'red';
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'credits', user_credits,
        'max_credits', max_credits,
        'status', credit_status,
        'color', status_color,
        'percentage', ROUND((user_credits::NUMERIC / max_credits::NUMERIC) * 100, 0)
    );
END;
$$;

-- 7. RLS Policies
-- Credit transactions - users can only see their own
CREATE POLICY "users_manage_own_credit_transactions"
ON public.credit_transactions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Credit packages - public read access for pricing
CREATE POLICY "public_can_view_credit_packages"
ON public.credit_packages
FOR SELECT
TO public
USING (is_active = true);

-- Payment orders - users can only see their own
CREATE POLICY "users_manage_own_payment_orders"
ON public.payment_orders
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 8. Update triggers for payment orders
CREATE OR REPLACE FUNCTION public.update_payment_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_orders_updated_at_trigger
    BEFORE UPDATE ON public.payment_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_payment_orders_updated_at();

-- 9. Generate unique order numbers function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN 'CR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
END;
$$;

-- Set default order number for payment_orders
ALTER TABLE public.payment_orders 
ALTER COLUMN order_number SET DEFAULT public.generate_order_number();

-- 10. Mock data for testing (existing users get credits)
DO $$
DECLARE
    existing_user_id UUID;
BEGIN
    -- Update existing users to have credits if they don't already
    UPDATE public.user_profiles 
    SET credits = 1000 
    WHERE credits IS NULL;

    -- Get an existing user for testing transactions
    SELECT id INTO existing_user_id 
    FROM public.user_profiles 
    LIMIT 1;

    -- Add some sample transactions for existing user
    IF existing_user_id IS NOT NULL THEN
        INSERT INTO public.credit_transactions (user_id, action_type, credits_used, credits_before, credits_after, description)
        VALUES
            (existing_user_id, 'ad_builder', 8, 1000, 992, 'Created holiday campaign ad'),
            (existing_user_id, 'ai_analysis', 6, 992, 986, 'Analyzed campaign performance');
    END IF;
END $$;