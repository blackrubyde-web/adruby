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

  const requiredEnv = ['STRIPE_PRICE_ID', 'FRONTEND_URL'];
  const missingEnv = requiredEnv.filter(k => !process.env[k]);

  if (missingEnv.length) {
    console.error('[Checkout] Missing ENV vars', missingEnv);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Server misconfiguration (ENV missing)' })
    };
  }

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (err) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const userId = body.userId || body.user_id;
  const userEmail = body.userEmail || body.email;

  if (!userId || !userEmail) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Missing userId or email' })
    };
  }

  console.log('[Checkout] Start', { userId, userEmail });

  // 1. Customer im Supabase suchen
  let customerId = null;

  const { data: existing } = await supabaseAdmin
    .from(SUBSCRIPTION_TABLE)
    .select('stripe_customer_id')
    .eq('id', userId)
    .maybeSingle();

  if (existing && existing.stripe_customer_id) {
    customerId = existing.stripe_customer_id;
    console.log('[Checkout] Existing customerId found', { customerId });
  }

  // 2. Wenn kein Kunde existiert → neuen Stripe-Customer erzeugen
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { user_id: userId }
    });

    customerId = customer.id;

    console.log('[Checkout] Created new Stripe customer', { customerId });

    // In Supabase speichern
    await supabaseAdmin
      .from(SUBSCRIPTION_TABLE)
      .upsert({ id: userId, stripe_customer_id: customerId }, { onConflict: 'id' });
  }

  // 3. Checkout-Session erzeugen
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
        user_id: userId
      }
    },
    metadata: {
      user_id: userId
    },
    success_url: `${process.env.FRONTEND_URL}/payment-verification?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`
  });

  console.log('[Checkout] Session created', {
    sessionId: session.id,
    customerId
  });

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({ url: session.url })
  };
}
