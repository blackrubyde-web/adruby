import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

const corsHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Stripe-Signature',
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

  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET; // Set in Netlify/Stripe dashboard

  if (!webhookSecret) {
    console.error('[StripeWebhook] STRIPE_WEBHOOK_SECRET not configured');
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Webhook secret missing' }) };
  }

  let stripeEvent;
  try {
    const rawBody = event.body && event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('[StripeWebhook] signature verification failed', err?.message);
    return { statusCode: 400, headers: corsHeaders(), body: `Webhook Error: ${err.message}` };
  }

  try {
    const type = stripeEvent.type;
    const payload = stripeEvent.data?.object;

    console.log('[StripeWebhook] received event', {
      type,
      id: payload?.id,
      subscription: payload?.subscription,
      customer: payload?.customer
    });

    // Only log for now – DB updates happen later once webhook secret + flows are verified.
    switch (type) {
      case 'checkout.session.completed':
        // TODO: lookup subscription by payload.subscription and update Supabase subscription_status + trial_ends_at
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // TODO: persist subscription status changes (active/trialing/canceled) and stripe_subscription_id
        break;
      case 'invoice.payment_failed':
        // TODO: flag payment failures in Supabase to gracefully limit access
        break;
      default:
        console.log('[StripeWebhook] unhandled event type', type);
    }

    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('[StripeWebhook] handler error', err?.message);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Webhook handling failed' }) };
  }
}
