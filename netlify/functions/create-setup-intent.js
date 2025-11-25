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
    const { userId, email, name } = body;

    if (!userId) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'userId required' })
      };
    }

    // Load or create profile, then ensure Stripe customer
    const { profile, customerId } = await ensureProfileAndCustomer({
      userId,
      email,
      name
    });

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session'
    });

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ clientSecret: setupIntent.client_secret })
    };
  } catch (error) {
    console.error('[Stripe] create-setup-intent error', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: error.message || 'Internal error' })
    };
  }
}

async function ensureProfileAndCustomer({ userId, email, name }) {
  // Load profile by id
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
  return { profile: effectiveProfile, customerId };
}

const corsHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
});
