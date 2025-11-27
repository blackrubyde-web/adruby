// netlify/functions/create-checkout-session.js

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

  const requiredEnv = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PRICE_ID',
    'FRONTEND_URL',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missingEnv = requiredEnv.filter(k => !process.env[k]);
  if (missingEnv.length) {
    console.error('[Checkout] Missing ENV vars', missingEnv);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Server misconfiguration (ENV missing)' })
    };
  }

  try {
    let body;
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch (err) {
      console.error('[Checkout] Invalid JSON body', err);
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Invalid JSON body' })
      };
    }

    const userId = body.userId || body.user_id;
    const userEmail = body.userEmail || body.email;

    if (!userId || !userEmail) {
      console.warn('[Checkout] Missing userId or email', {
        hasUserId: !!userId,
        hasEmail: !!userEmail
      });
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Missing userId or email' })
      };
    }

    console.log('[Checkout] Start', { userId, userEmail });

    // 1) Stripe-Customer aus Supabase holen (falls vorhanden)
    let customerId = null;

    try {
      const { data: existing, error: existingError } = await supabaseAdmin
        .from(SUBSCRIPTION_TABLE)
        .select('stripe_customer_id')
        .eq('id', userId)
        .maybeSingle();

      if (existingError) {
        console.warn('[Checkout] Error fetching existing profile', existingError);
      }

      if (existing && existing.stripe_customer_id) {
        customerId = existing.stripe_customer_id;
        console.log('[Checkout] Existing customerId found', { customerId });
      }
    } catch (err) {
      console.error('[Checkout] Supabase lookup crashed', err);
    }

    // 2) Falls kein Customer vorhanden: neuen Stripe-Customer anlegen
    if (!customerId) {
      console.log('[Checkout] Creating new Stripe customer', { userId, userEmail });

      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { user_id: userId }
      });

      customerId = customer.id;
      console.log('[Checkout] Created new Stripe customer', { customerId });

      // in Supabase speichern (best effort)
      try {
        const { error: upsertError } = await supabaseAdmin
          .from(SUBSCRIPTION_TABLE)
          .upsert(
            {
              id: userId,
              email: userEmail,
              stripe_customer_id: customerId
            },
            { onConflict: 'id' }
          );

        if (upsertError) {
          console.error(
            '[Checkout] Failed to upsert stripe_customer_id in Supabase',
            upsertError
          );
        } else {
          console.log('[Checkout] Supabase upsert for stripe_customer_id OK', {
            userId,
            customerId
          });
        }
      } catch (err) {
        console.error('[Checkout] Supabase upsert crashed', err);
      }
    }

    // 3) Checkout-Session erzeugen
    const successUrl = `${process.env.FRONTEND_URL}/payment-verification?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.FRONTEND_URL}/payment-cancelled`;

    console.log('[Checkout] Creating checkout session', {
      userId,
      customerId,
      priceId: process.env.STRIPE_PRICE_ID,
      successUrl,
      cancelUrl
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_id: userId,
          email: userEmail
        }
      },
      metadata: {
        user_id: userId,
        email: userEmail
      },
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    console.log('[Checkout] Session created', {
      sessionId: session.id,
      customerId,
      mode: session.mode,
      url: session.url
    });

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ url: session.url })
    };
  } catch (err) {
    // HIER landen jetzt alle Stripe-/Runtime-Fehler
    console.error('[Checkout] Unexpected error', {
      message: err.message,
      raw: err
    });
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        error: err.message || 'Unexpected server error in checkout'
      })
    };
  }
}
