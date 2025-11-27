// netlify/functions/stripe-webhook.js

import { stripe, supabaseAdmin, SUBSCRIPTION_TABLE } from './_shared/clients.js';

const corsHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Stripe-Signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
});

// Hilfsfunktion: Subscription-Daten nach Supabase schreiben
async function updateUserFromSubscription(subscription) {
  if (!subscription) {
    console.warn('[StripeWebhook] updateUserFromSubscription called without subscription');
    return;
  }

  const userId = subscription.metadata?.user_id;
  const customerId = subscription.customer;

  if (!userId) {
    console.warn('[StripeWebhook] subscription without user_id metadata', {
      subscriptionId: subscription.id
    });
    return;
  }

  const status = subscription.status; // 'trialing', 'active', 'canceled', ...
  const trialStart =
    subscription.trial_start != null
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null;
  const trialEnd =
    subscription.trial_end != null
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null;

  const trialStatus = status === 'trialing' ? 'active' : 'inactive';

  const paymentVerified = status === 'trialing' || status === 'active';
  const onboardingCompleted = paymentVerified; // Wenn bezahlt / Trial aktiv, ist Onboarding im Prinzip durch

  console.log('[StripeWebhook] updating user profile from subscription', {
    userId,
    subscriptionId: subscription.id,
    status,
    trialStatus,
    trialStart,
    trialEnd
  });

  const { error } = await supabaseAdmin
    .from(SUBSCRIPTION_TABLE)
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      subscription_status: status,
      trial_status: trialStatus,
      trial_started_at: trialStart,
      trial_expires_at: trialEnd,
      payment_verified: paymentVerified,
      onboarding_completed: onboardingCompleted
    })
    .eq('id', userId);

  if (error) {
    console.error('[StripeWebhook] failed to update user profile', error, {
      userId,
      subscriptionId: subscription.id
    });
  } else {
    console.log('[StripeWebhook] user profile updated successfully', {
      userId,
      subscriptionId: subscription.id,
      status
    });
  }
}

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

  const sig =
    event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[StripeWebhook] STRIPE_WEBHOOK_SECRET not configured');
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Webhook secret missing' })
    };
  }

  let stripeEvent;
  try {
    // rawBody für Stripe-Signaturprüfung
    const rawBody =
      event.body && event.isBase64Encoded
        ? Buffer.from(event.body, 'base64')
        : event.body;

    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error(
      '[StripeWebhook] signature verification failed',
      err?.message
    );
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: `Webhook Error: ${err.message}`
    };
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

    switch (type) {
      case 'checkout.session.completed': {
        // Checkout fertig → Subscription ziehen und in Supabase schreiben
        const subscriptionId = payload.subscription;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          );
          await updateUserFromSubscription(subscription);
        } else {
          console.warn(
            '[StripeWebhook] checkout.session.completed without subscription id',
            { sessionId: payload.id }
          );
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        // Hier ist das Subscription-Objekt direkt im Payload
        await updateUserFromSubscription(payload);
        break;
      }

      case 'invoice.payment_failed': {
        // Optional: Status auf „inactive“ setzen oder nur loggen
        console.log('[StripeWebhook] invoice.payment_failed', {
          invoiceId: payload.id,
          customer: payload.customer,
          subscription: payload.subscription
        });
        break;
      }

      default:
        console.log('[StripeWebhook] unhandled event type', type);
    }

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ received: true })
    };
  } catch (err) {
    console.error('[StripeWebhook] handler error', err?.message);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Webhook handling failed' })
    };
  }
}
