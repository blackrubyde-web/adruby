import { stripe, supabaseAdmin, SUBSCRIPTION_TABLE } from './_shared/clients.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders()
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { userId, paymentMethodId, name, country, email } = body;

    if (!userId || !paymentMethodId) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'userId and paymentMethodId are required' })
      };
    }

    // Fetch or create profile, ensure Stripe customer
    const { customerId } = await ensureProfileAndCustomer({
      userId,
      email,
      name,
      country
    });

    // Attach payment method
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId }
    });

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: process.env.STRIPE_PRICE_ID }],
      trial_period_days: 5,
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        supabase_user_id: userId,
        env: process.env.NODE_ENV || 'development'
      }
    });

    const { status, id: subscriptionId, trial_end } = subscription;

    console.log('[Stripe] subscription created', { userId, subscriptionId, status });

    const { error: updateSubError } = await supabaseAdmin
      .from(SUBSCRIPTION_TABLE)
      .update({
        stripe_subscription_id: subscriptionId,
        subscription_status: status,
        trial_ends_at: trial_end ? new Date(trial_end * 1000).toISOString() : null
      })
      .eq('id', userId);

    if (updateSubError) {
      console.error('[Stripe] failed to save subscription', updateSubError);
      throw updateSubError;
    }

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        subscriptionId,
        status,
        trialEndsAt: trial_end ? new Date(trial_end * 1000).toISOString() : null
      })
    };
  } catch (error) {
    console.error('[Stripe] create-subscription error', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: error.message || 'Internal error' })
    };
  }
}

async function ensureProfileAndCustomer({ userId, email, name, country }) {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from(SUBSCRIPTION_TABLE)
    .select('id, email, stripe_customer_id')
    .eq('id', userId)
    .maybeSingle();

  let effectiveProfile = profile;

  if (profileError) {
    console.warn('[Stripe] profile lookup warning', profileError.message);
  }

  if (!effectiveProfile) {
    const { data: newProfile, error: upsertError } = await supabaseAdmin
      .from(SUBSCRIPTION_TABLE)
      .upsert({
        id: userId,
        email: email || null,
        credits: 0,
        onboarding_completed: false,
        payment_verified: false
      }, { onConflict: 'id' })
      .select('id, email, stripe_customer_id')
      .maybeSingle();

    if (upsertError || !newProfile) {
      console.error('[Stripe] profile upsert failed', upsertError || 'no data returned', { userId, email });
      throw upsertError || new Error('Profil konnte nicht angelegt werden');
    }

    effectiveProfile = newProfile;
  }

  let customerId = effectiveProfile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: email || effectiveProfile?.email,
      name,
      address: country ? { country } : undefined,
      metadata: { supabase_user_id: userId }
    });
    customerId = customer.id;
    const { error: updateError } = await supabaseAdmin
      .from(SUBSCRIPTION_TABLE)
      .update({ stripe_customer_id: customerId })
      .eq('id', userId);
    if (updateError) {
      console.error('[Stripe] failed to save stripe_customer_id', updateError);
      throw updateError;
    }
    console.log('[Stripe] created Stripe customer', { userId, customerId });
  }

  console.log('[Stripe] profile ready', { userId, customerId });
  return { customerId };
}

const corsHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
});
