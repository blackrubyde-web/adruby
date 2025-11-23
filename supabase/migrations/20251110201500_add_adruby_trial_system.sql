-- Location: supabase/migrations/20251110201500_add_adruby_trial_system.sql
-- Schema Analysis: Extending existing user_profiles, credit_packages, payment_orders tables
-- Integration Type: Addition - Trial tracking for AdRuby onboarding flow
-- Dependencies: user_profiles, credit_packages, payment_orders, credit_transactions

-- Add trial tracking columns to existing user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN trial_status TEXT DEFAULT 'inactive' CHECK (trial_status IN ('inactive', 'pending_verification', 'active', 'expired')),
ADD COLUMN trial_started_at TIMESTAMPTZ,
ADD COLUMN trial_expires_at TIMESTAMPTZ,
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN payment_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN verification_method TEXT CHECK (verification_method IN ('stripe_card', 'paypal', null));

-- Add indexes for trial queries
CREATE INDEX idx_user_profiles_trial_status ON public.user_profiles(trial_status);
CREATE INDEX idx_user_profiles_trial_expires_at ON public.user_profiles(trial_expires_at);
CREATE INDEX idx_user_profiles_onboarding_completed ON public.user_profiles(onboarding_completed);

-- Function to start trial after payment verification
CREATE OR REPLACE FUNCTION public.start_trial(
    target_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    trial_start_date TIMESTAMPTZ := NOW();
    trial_end_date TIMESTAMPTZ := NOW() + INTERVAL '7 days';
    result JSONB;
BEGIN
    -- Update user profile with trial information
    UPDATE public.user_profiles
    SET 
        trial_status = 'active',
        trial_started_at = trial_start_date,
        trial_expires_at = trial_end_date,
        onboarding_completed = TRUE,
        payment_verified = TRUE,
        credits = 1000,
        updated_at = NOW()
    WHERE id = target_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;

    -- Add credit transaction for trial credits
    INSERT INTO public.credit_transactions (
        user_id,
        action_type,
        credits_used,
        credits_before,
        credits_after,
        description
    ) VALUES (
        target_user_id,
        'trial_bonus',
        -1000,  -- Negative because it's adding credits
        0,
        1000,
        'AdRuby Trial - 1000 Credits Vergabe'
    );

    result := jsonb_build_object(
        'success', true,
        'trial_started_at', trial_start_date,
        'trial_expires_at', trial_end_date,
        'credits_granted', 1000
    );

    RETURN result;
END;
$$;

-- Function to verify payment and activate trial
CREATE OR REPLACE FUNCTION public.verify_payment_and_activate_trial(
    target_user_id UUID,
    payment_method TEXT DEFAULT 'stripe_card'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Check if user exists and trial is not already active
    IF NOT EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = target_user_id 
        AND trial_status IN ('inactive', 'pending_verification')
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User nicht gefunden oder Trial bereits aktiv'
        );
    END IF;

    -- Mark payment as verified and set verification method
    UPDATE public.user_profiles
    SET 
        verification_method = payment_method,
        payment_verified = TRUE,
        trial_status = 'pending_verification',
        updated_at = NOW()
    WHERE id = target_user_id;

    -- Start the trial
    result := public.start_trial(target_user_id);

    RETURN result;
END;
$$;

-- Function to check trial status and expiration
CREATE OR REPLACE FUNCTION public.check_trial_status(
    target_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_trial RECORD;
    result JSONB;
    days_remaining INTEGER;
BEGIN
    SELECT 
        trial_status,
        trial_started_at,
        trial_expires_at,
        onboarding_completed,
        payment_verified,
        verification_method,
        credits
    INTO user_trial
    FROM public.user_profiles
    WHERE id = target_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;

    -- Check if trial has expired
    IF user_trial.trial_expires_at IS NOT NULL AND user_trial.trial_expires_at < NOW() THEN
        -- Update status to expired if not already
        IF user_trial.trial_status = 'active' THEN
            UPDATE public.user_profiles
            SET trial_status = 'expired'
            WHERE id = target_user_id;
            
            user_trial.trial_status := 'expired';
        END IF;
    END IF;

    -- Calculate days remaining
    IF user_trial.trial_expires_at IS NOT NULL THEN
        days_remaining := EXTRACT(DAY FROM (user_trial.trial_expires_at - NOW()));
        IF days_remaining < 0 THEN
            days_remaining := 0;
        END IF;
    ELSE
        days_remaining := 0;
    END IF;

    result := jsonb_build_object(
        'success', true,
        'trial_status', user_trial.trial_status,
        'onboarding_completed', user_trial.onboarding_completed,
        'payment_verified', user_trial.payment_verified,
        'verification_method', user_trial.verification_method,
        'trial_started_at', user_trial.trial_started_at,
        'trial_expires_at', user_trial.trial_expires_at,
        'days_remaining', days_remaining,
        'credits', user_trial.credits
    );

    RETURN result;
END;
$$;