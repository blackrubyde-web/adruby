import Stripe from 'stripe';
import { supabaseAdmin } from './_shared/clients.js';

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

    console.log('[StripeWebhook] event received', {
      type,
      id: payload?.id,
      subscription: payload?.subscription,
      customer: payload?.customer
    });

    switch (type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(payload);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await logSubscriptionEvent(payload, type);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(payload);
        break;
      case 'invoice.payment_failed':
        console.log('[StripeWebhook] invoice.payment_failed', { invoiceId: payload?.id, subscription: payload?.subscription });
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

function extractUserIdFromSession(session) {
  return (
    session?.client_reference_id ||
    session?.metadata?.user_id ||
    session?.metadata?.supabase_user_id ||
    null
  );
}

async function updateUserProfileAfterSuccessfulPayment(userId, stripeCustomerId) {
  if (!userId) {
    console.warn('[StripeWebhook] update skipped: missing userId');
    return;
  }

  const { data: profile, error } = await supabaseAdmin
    .from('user_profiles')
    .select('id, stripe_customer_id, trial_status, trial_started_at, trial_expires_at, onboarding_completed, payment_verified, verification_method')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[StripeWebhook] failed to load profile', { userId, error });
    throw error;
  }

  if (!profile) {
    console.warn('[StripeWebhook] profile not found for user', { userId });
    return;
  }

  const update = {
    payment_verified: true,
    verification_method: 'stripe_subscription',
    onboarding_completed: true
  };

  if (!profile?.stripe_customer_id && stripeCustomerId) {
    update.stripe_customer_id = stripeCustomerId;
  }

  if (profile?.trial_status === 'active') {
    update.trial_status = 'converted';
    if (!profile?.trial_expires_at) {
      update.trial_expires_at = new Date().toISOString();
    }
  }

  const { error: updateError } = await supabaseAdmin
    .from('user_profiles')
    .update(update)
    .eq('id', userId);

  if (updateError) {
    console.error('[StripeWebhook] failed to update user_profiles', { userId, updateError });
    throw updateError;
  }

  console.log('[StripeWebhook] user_profiles updated after payment', { userId, stripeCustomerId });
}

async function setPaymentVerifiedByCustomerId(stripeCustomerId, isVerified) {
  if (!stripeCustomerId) {
    console.warn('[StripeWebhook] no stripeCustomerId provided to setPaymentVerifiedByCustomerId');
    return;
  }

  const update = {
    payment_verified: isVerified,
    verification_method: isVerified ? 'stripe_subscription' : null
  };

  const { error: updateError } = await supabaseAdmin
    .from('user_profiles')
    .update(update)
    .eq('stripe_customer_id', stripeCustomerId);

  if (updateError) {
    console.error('[StripeWebhook] failed to update payment_verified by customer id', { stripeCustomerId, updateError });
    throw updateError;
  }

  console.log('[StripeWebhook] payment_verified updated by customer id', { stripeCustomerId, isVerified });
}

async function handleCheckoutSessionCompleted(session) {
  console.log('[StripeWebhook] checkout.session.completed', {
    id: session?.id,
    mode: session?.mode,
    customer: session?.customer,
    subscription: session?.subscription,
    client_reference_id: session?.client_reference_id,
    metadata: session?.metadata
  });

  if (session?.mode !== 'subscription') {
    console.log('[StripeWebhook] non-subscription checkout, skipping user update', { sessionId: session?.id });
    return;
  }

  const userId = extractUserIdFromSession(session);
  const customerId = session?.customer || null;

  await updateUserProfileAfterSuccessfulPayment(userId, customerId);
}

async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription?.customer || null;
  console.log('[StripeWebhook] customer.subscription.deleted', {
    id: subscription?.id,
    status: subscription?.status,
    customer: customerId
  });

  await setPaymentVerifiedByCustomerId(customerId, false);
}

async function logSubscriptionEvent(subscription, type) {
  console.log(`[StripeWebhook] ${type}`, {
    id: subscription?.id,
    status: subscription?.status,
    customer: subscription?.customer
  });
}
