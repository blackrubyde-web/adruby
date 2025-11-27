// netlify/functions/create-checkout-session.js
import { stripe, supabaseAdmin, SUBSCRIPTION_TABLE } from './_shared/clients.js';

const corsHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
});

export async function handler(event) {
  // CORS-Preflight
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

  // --- Env-Check ---
  const requiredEnv = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PRICE_ID',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);

  if (missingEnv.length) {
    console.error('[StripeCheckout] missing env vars', missingEnv);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        error: `Missing environment variables: ${missingEnv.join(', ')}`
      })
    };
  }

  // --- Body parsen ---
  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (err) {
    console.error('[StripeCheckout] failed to parse JSON body', {
      rawBody: event.body,
      error: err
    });
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  // flexible Feldnamen, falls Frontend anders sendet
  const userId =
    body.userId || body.user_id || body.id || body.user_id_pk || null;
  const email =
    body.email || body.userEmail || body.user_email || body.mail || null;

  console.log('[StripeCheckout] incoming request', {
    rawBody: event.body,
    parsedBody: body,
    resolvedUserId: userId,
    resolvedEmail: email
  });

  if (!userId || !email) {
    console.error('[StripeCheckout] missing userId or email', {
      body,
      userId,
      email
    });
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({
        error:
          'Checkout konnte nicht gestartet werden: Benutzerinformationen fehlen (userId / email).'
      })
    };
  }

  try {
    console.log('[StripeCheckout] start', { userId, email });

    // --- Profil laden / erstellen ---
    const { data: profile, error: profileError } = await supabaseAdmin
      .from(SUBSCRIPTION_TABLE)
      .select('id, email, stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();

    let effectiveProfile = profile;

    if (profileError) {
      console.warn('[StripeCheckout] profile lookup warning', profileError);
    }

    if (!effectiveProfile) {
      console.log('[StripeCheckout] no profile found, creating new one', {
        userId,
        email
      });

      const { data: newProfile, error: upsertError } = await supabaseAdmin
        .from(SUBSCRIPTION_TABLE)
        .upsert(
          {
            id: userId,
            email,
            credits: 0,
            onboarding_completed: false,
            payment_verified: false
          },
          { onConflict: 'id' }
        )
        .select('id, email, stripe_customer_id')
        .maybeSingle();

      if (upsertError || !newProfile) {
        console.error(
          '[StripeCheckout] profile upsert failed',
          upsertError || 'no data returned',
          { userId, email }
        );
        return {
          statusCode: 500,
          headers: corsHeaders(),
          body: JSON.stringify({
            error: 'Profil konnte nicht angelegt werden.'
          })
        };
      }

      effectiveProfile = newProfile;
    }

    // --- Stripe-Kunde sicherstellen ---
    let customerId = effectiveProfile?.stripe_customer_id;

    if (!customerId) {
      console.log('[Stripe] creating new customer', { userId, email });

      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId }
      });

      customerId = customer.id;

      const { error: updateError } = await supabaseAdmin
        .from(SUBSCRIPTION_TABLE)
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);

      if (updateError) {
        console.error(
          '[StripeCheckout] failed to persist stripe_customer_id',
          updateError,
          { userId, customerId }
        );
        throw updateError;
      }

      console.log('[Stripe] customer created & saved', { userId, customerId });
    }

    console.log('[Stripe] profile ready', { userId, customerId });

    // --- Checkout-Session mit 7 Tagen Trial ---
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: userId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      subscription_data: {
        // 👉 Hier wird die 7-Tage-Testphase gesetzt
        trial_period_days: 7,
        metadata: {
          user_id: userId
        }
      },
      metadata: {
        user_id: userId
      },
      success_url:
        'https://www.adruby.de/payment-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://www.adruby.de/payment-cancelled'
    });

    console.log('[StripeCheckout] session created', {
      userId,
      sessionId: checkoutSession?.id,
      customerId
    });

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
      body: JSON.stringify({
        error:
          error?.message || 'Checkout konnte nicht gestartet werden. (Server)'
      })
    };
  }
}
