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

    // Load profile to get/create Stripe customer
    const { data: profile, error: profileError } = await supabaseAdmin
      .from(SUBSCRIPTION_TABLE)
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('[Stripe] profile lookup error', profileError);
      throw profileError;
    }

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email || profile?.email,
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
    }

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

const corsHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
});
