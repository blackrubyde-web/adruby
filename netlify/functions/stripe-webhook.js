// netlify/functions/stripe-webhook.js

import { stripe, supabaseAdmin, SUBSCRIPTION_TABLE } from './_shared/clients.js';

const corsHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Stripe-Signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
});

// Hilfsfunktion: user_id aus Subscription + Customer-Metadata auflösen
async function resolveUserIdAndCustomer(subscription, source = 'unknown') {
  if (!subscription) {
    console.warn('[Webhook] resolveUserIdAndCustomer called without subscription', { source });
    return { userId: null, customerId: null };
  }

  const customerId = subscription.customer || null;
  const md = subscription.metadata || {};

  let userId =
    md.user_id ||
    md.userId ||
    md.supabase_user_id ||
    md.supabaseUserId ||
    null;

  if (userId) {
    console.log('[Webhook] user_id from subscription metadata', {
      source,
      userId,
      customerId
    });
    return { userId, customerId };
  }

  // Fallback: Customer-Metadata abfragen
  if (customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      const cmd = customer.metadata || {};

      userId =
        cmd.user_id ||
        cmd.userId ||
        cmd.supabase_user_id ||
        cmd.supabaseUserId ||
        null;

      if (userId) {
        console.log('[Webhook] user_id resolved from customer metadata', {
          source,
          userId,
          customerId
        });
        return { userId, customerId };
      } else {
        console.warn('[Webhook] No user_id found on customer metadata', {
          source,
          customerId,
          customerMetadata: cmd
        });
      }
    } catch (err) {
      console.error('[Webhook] Failed to retrieve customer for metadata', {
        source,
        customerId,
        error: err.message || err
      });
    }
  }

  console.warn('[Webhook] Could not resolve user_id from subscription or customer', {
    source,
    subId: subscription.id,
    metadata: subscription.metadata
  });

  return { userId: null, customerId };
}

async function updateUserFromSubscription(subscription, source = 'unknown') {
  try {
    if (!subscription) {
      console.warn('[Webhook] updateUserFromSubscription called with null', { source });
      return;
    }

    const { userId, customerId } = await resolveUserIdAndCustomer(subscription, source);

    if (!userId) {
      // Ohne user_id können wir nichts in user_profiles mappen
      console.warn('[Webhook] No userId resolved, skipping update', {
        source,
        subId: subscription.id,
        metadata: subscription.metadata
      });
      return;
    }

    const status = subscription.status;

    const trialStart = subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null;

    const trialEnd = subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null;

    const trialStatus = status === 'trialing' ? 'active' : 'inactive';
    const paymentVerified = status === 'trialing' || status === 'active';
    const onboardingCompleted = paymentVerified;

    const payload = {
      stripe_customer_id: customerId,
      trial_status: trialStatus,
      trial_started_at: trialStart,
      trial_expires_at: trialEnd,
      payment_verified: paymentVerified,
      onboarding_completed: onboardingCompleted,
      verification_method: 'stripe_card'
    };

    console.log('[Webhook] Preparing update into user_profiles', {
      source,
      userId,
      subId: subscription.id,
      status,
      payload
    });

    const { data, error } = await supabaseAdmin
      .from(SUBSCRIPTION_TABLE)
      .update(payload)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[Webhook] Update failed', { source, error, payload });
    } else {
      console.log('[Webhook] Update OK', { source, userId, data });
    }
  } catch (err) {
    console.error('[Webhook] updateUserFromSubscription crashed', {
      source,
      error: err.message || err
    });
  }
}


export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders() };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders() };
  }

  const sig =
    event.headers['stripe-signature'] ||
    event.headers['Stripe-Signature'];

  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    console.error('[Webhook] Missing STRIPE_WEBHOOK_SECRET');
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Missing STRIPE_WEBHOOK_SECRET' })
    };
  }

  let stripeEvent;

  try {
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : event.body;

    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      secret
    );
  } catch (err) {
    console.error('[Webhook] Signature verification failed', err.message);
    return { statusCode: 400, headers: corsHeaders() };
  }

  const type = stripeEvent.type;
  const obj = stripeEvent.data.object;

  console.log('[Webhook] Event received', {
    type,
    eventId: stripeEvent.id
  });

  try {
    if (type === 'checkout.session.completed') {
      console.log('[Webhook] checkout.session.completed payload', {
        sessionId: obj.id,
        mode: obj.mode,
        subscription: obj.subscription,
        metadata: obj.metadata
      });

      if (obj.subscription) {
        const subscription = await stripe.subscriptions.retrieve(obj.subscription);
        await updateUserFromSubscription(subscription, 'checkout.session.completed');
      } else {
        console.warn('[Webhook] checkout.session.completed without subscription', {
          sessionId: obj.id
        });
      }
    }

    if (
      type === 'customer.subscription.created' ||
      type === 'customer.subscription.updated' ||
      type === 'customer.subscription.deleted'
    ) {
      console.log('[Webhook] customer.subscription.* event', {
        type,
        subId: obj.id,
        status: obj.status,
        metadata: obj.metadata
      });

      await updateUserFromSubscription(obj, type);
    }

    if (type === 'invoice.payment_succeeded') {
      console.log('[Webhook] invoice.payment_succeeded', {
        invoiceId: obj.id,
        subscription: obj.subscription
      });

      if (obj.subscription) {
        const subscription = await stripe.subscriptions.retrieve(obj.subscription);
        await updateUserFromSubscription(subscription, 'invoice.payment_succeeded');
      }
    }

    if (type === 'invoice.payment_failed') {
      console.log('[Webhook] invoice.payment_failed', {
        invoiceId: obj.id,
        subscription: obj.subscription
      });

      if (obj.subscription) {
        const subscription = await stripe.subscriptions.retrieve(obj.subscription);
        await updateUserFromSubscription(subscription, 'invoice.payment_failed');
      }
    }
  } catch (err) {
    console.error('[Webhook] Handler crashed processing event', {
      type,
      error: err.message || err
    });
  }

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({ received: true })
  };
}
