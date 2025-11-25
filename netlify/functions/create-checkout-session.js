import { stripe, supabaseAdmin, SUBSCRIPTION_TABLE } from './_shared/clients.js';

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

  const requiredEnv = ['STRIPE_SECRET_KEY', 'STRIPE_PRICE_ID', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_URL'];
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
    const { userId, userEmail } = body;

    if (!userId || !userEmail) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'userId and userEmail are required' })
      };
    }

    console.log('[StripeCheckout] start', { userId, userEmail, ts: new Date().toISOString() });

    // 1) Load profile to ensure we can link the subscription to the Supabase user
    const fetchProfile = async () => {
      const byId = await supabaseAdmin
        .from(SUBSCRIPTION_TABLE)
        .select('id, email, stripe_customer_id')
        .eq('id', userId)
        .single();

      if (byId.data) return { profile: byId.data, error: null, source: 'id' };
      // Fallback by email in case id mismatch (should not happen, but helps debugging)
      const byEmail = await supabaseAdmin
        .from(SUBSCRIPTION_TABLE)
        .select('id, email, stripe_customer_id')
        .eq('email', userEmail)
        .maybeSingle();

      return {
        profile: byEmail.data || null,
        error: byId.error || byEmail.error || null,
        source: byEmail.data ? 'email' : null
      };
    };

    let { profile, error: profileError, source } = await fetchProfile();

    console.log('[StripeCheckout] profile lookup', {
      userId,
      profileFound: !!profile,
      lookupSource: source || 'none',
      supabaseError: profileError?.message || null
    });

    let effectiveProfile = profile;

    if (!effectiveProfile) {
      console.warn('[StripeCheckout] profile missing, attempting to ensure + upsert', { userId, userEmail });

      // Try server-side RPC (if available) to create the profile consistently
      try {
        const { error: ensureError } = await supabaseAdmin.rpc('ensure_user_profile_exists', { target_user_id: userId });
        if (ensureError) {
          console.warn('[StripeCheckout] ensure_user_profile_exists RPC failed', ensureError.message);
        }
      } catch (rpcErr) {
        console.warn('[StripeCheckout] ensure_user_profile_exists RPC threw', rpcErr?.message);
      }

      // Re-fetch after RPC
      ({ profile, error: profileError, source } = await fetchProfile());

      // If still missing, do a last-resort upsert
      if (!profile) {
        const { data: newProfile, error: upsertError } = await supabaseAdmin
          .from(SUBSCRIPTION_TABLE)
          .upsert({ id: userId, email: userEmail }, { onConflict: 'id' })
          .select('id, email, stripe_customer_id')
          .single();

        if (upsertError || !newProfile) {
          console.error('[StripeCheckout] profile upsert failed', upsertError || 'no data returned', {
            userId,
            userEmail,
            profileError: profileError?.message || null
          });
          return {
            statusCode: 404,
            headers: corsHeaders(),
            body: JSON.stringify({ error: 'Profil nicht gefunden. Bitte erneut anmelden.' })
          };
        }

        effectiveProfile = newProfile;
      } else {
        effectiveProfile = profile;
      }
    }

    // 2) Ensure Stripe customer exists
    let customerId = effectiveProfile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { supabaseUserId: userId }
      });
      customerId = customer.id;

      const { error: updateError } = await supabaseAdmin
        .from(SUBSCRIPTION_TABLE)
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);

      if (updateError) {
        console.error('[StripeCheckout] failed to persist stripe_customer_id', updateError, { userId, customerId });
        throw updateError;
      }
    }

    // 3) Build URLs from environment or request origin
    const appBaseUrl = (
      process.env.FRONTEND_URL ||
      process.env.VITE_APP_URL ||
      process.env.SITE_URL ||
      process.env.URL ||
      event.headers?.origin ||
      'http://localhost:5173'
    ).replace(/\/$/, '');

    const successUrl = `${appBaseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appBaseUrl}/payment-verification?status=cancel`;

    // 4) Create Checkout Session with 7-day trial
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      allow_promotion_codes: false,
      subscription_data: {
        trial_period_days: 7,
        metadata: { supabaseUserId: userId }
      },
      metadata: { supabaseUserId: userId, userEmail },
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    console.log('[StripeCheckout] session created', {
      userId,
      sessionId: checkoutSession?.id,
      customerId,
      ts: new Date().toISOString()
    });

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ url: checkoutSession?.url })
    };
  } catch (error) {
    console.error('[StripeCheckout] error creating session', { message: error?.message, stack: error?.stack });
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: error?.message || 'Checkout konnte nicht gestartet werden' })
    };
  }
}
