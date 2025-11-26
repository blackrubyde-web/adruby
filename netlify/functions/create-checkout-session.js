import { stripe, supabaseAdmin } from './_shared/clients.js';

const corsHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
});

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders() };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const requiredEnv = ['STRIPE_PRICE_ID', 'STRIPE_SECRET_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);

  if (missingEnv.length) {
    console.error('[StripeCheckout] missing env vars', missingEnv);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: `Missing environment variables: ${missingEnv.join(', ')}` })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { userId, email } = body;

    if (!userId || !email) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'userId and email are required' })
      };
    }

    console.log('[StripeCheckout] start', { userId, email });

    // Load profile (required)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, stripe_customer_id, trial_status, trial_started_at, trial_expires_at, onboarding_completed, payment_verified, verification_method')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('[StripeCheckout] profile lookup error', profileError);
    }

    if (!profile) {
      console.error('[StripeCheckout] profile not found', { userId });
      return {
        statusCode: 404,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Profile not found for userId' })
      };
    }

    // Ensure Stripe customer
    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || email,
        metadata: { supabase_user_id: userId }
      });
      customerId = customer.id;

      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);

      if (updateError) {
        console.error('[StripeCheckout] failed to persist stripe_customer_id', updateError, { userId, customerId });
        // soft fail: proceed with session creation
      }
      console.log('[Stripe] created Stripe customer', { userId, customerId });
    }

    console.log('[Stripe] profile ready', { userId, customerId });

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: userId,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      subscription_data: {
        metadata: { user_id: userId }
      },
      metadata: { user_id: userId },
      success_url: 'https://www.adruby.de/payment-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://www.adruby.de/payment-cancelled'
    });

    console.log('[StripeCheckout] session created', { userId, sessionId: checkoutSession?.id, customerId });

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ url: checkoutSession?.url })
    };
  } catch (error) {
    console.error('[StripeCheckout] error creating session', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: error?.message || 'Checkout konnte nicht gestartet werden' })
    };
  }
}
