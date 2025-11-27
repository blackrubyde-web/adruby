// netlify/functions/stripe-webhook.js

import { stripe, supabaseAdmin, SUBSCRIPTION_TABLE } from './_shared/clients.js';

const corsHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Stripe-Signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
});

// Hilfsfunktion: Subscription-Daten nach Supabase schreiben (immer upsert)
async function updateUserFromSubscription(subscription) {
  if (!subscription) {
    console.warn('[StripeWebhook] updateUserFromSubscription called without subscription');
    return;
  }

  console.log('[StripeWebhook] raw subscription object', {
    id: subscription.id,
    status: subscription.status,
    customer: subscription.customer,
    metadata: subscription.metadata,
    trial_start: subscription.trial_start,
    trial_end: subscription.trial_end
  });

  // userId aus metadata ziehen (user_id oder userId)
  const userId =
    subscription.metadata?.user_id ||
    subscription.metadata?.userId ||
    null;

  const customerId = subscription.customer;

  if (!userId) {
    console.warn('[StripeWebhook] subscription without user_id metadata', {
      subscriptionId: subscription.id,
      metadata: subscription.metadata
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
  const onboardingCompleted = paymentVerified; // wenn Trial/Subscription aktiv ist, betrachten wir das Onboarding als abgeschlossen

  console.log('[StripeWebhook] upserting user subscription', {
    userId,
    subscriptionId: subscription.id,
    customerId,
    status,
    trialStatus,
    trialStart,
    trialEnd
  });

  try {
    const { data, error } = await supabaseAdmin
      .from(SUBSCRIPTION_TABLE)
      .upsert(
        {
          id: userId, // id = Supabase auth.users.id
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          subscription_status: status,
          trial_status: trialStatus,
          trial_started_at: trialStart,
          trial_expires_at: trialEnd,
          payment_verified: paymentVerified,
          onboarding_completed: onboardingCompleted
        },
        {
          onConflict: 'id'
        }
      )
      .select()
      .single();

    if (error) {
      console.error('[StripeWebhook] failed to upsert user subscription', error, {
        userId,
        subscriptionId: subscription.id
      });
    } else {
      console.log('[StripeWebhook] user subscription upserted successfully', {
        userId,
        subscriptionId: subscription.id,
        status,
        row: data
      });
    }
  } catch (err) {
    console.error(
      '[StripeWebhook] unexpected error during upsert',
      err?.message,
      { userId, subscriptionId: subscription.id }
    );
  }
}

export async function handler(event) {
  // CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders() };
  }

  // Nur POST erlauben
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const sig =
    event.headers['stripe-signature'] ||
    event.headers['Stripe-Signature'] ||
    event.headers['STRIPE-SIGNATURE'];

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
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` })
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
          try {
            const subscription = await stripe.subscriptions.retrieve(
              subscriptionId
            );
            await updateUserFromSubscription(subscription);
          } catch (err) {
            console.error(
              '[StripeWebhook] failed to retrieve subscription from checkout.session.completed',
              err?.message,
              { subscriptionId }
            );
          }
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

      case 'invoice.payment_succeeded': {
        // Zahlung erfolgreich → Subscription aus invoice ziehen und aktualisieren
        const subscriptionId = payload.subscription;
        if (subscriptionId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(
              subscriptionId
            );
            await updateUserFromSubscription(subscription);
          } catch (err) {
            console.error(
              '[StripeWebhook] failed to retrieve subscription from invoice.payment_succeeded',
              err?.message,
              { subscriptionId }
            );
          }
        } else {
          console.log(
            '[StripeWebhook] invoice.payment_succeeded without subscription id',
            { invoiceId: payload.id }
          );
        }
        break;
      }

      case 'invoice.payment_failed': {
        // Zahlung fehlgeschlagen → Optional: Subscription auf "inactive" setzen
        console.log('[StripeWebhook] invoice.payment_failed', {
          invoiceId: payload.id,
          customer: payload.customer,
          subscription: payload.subscription
        });

        const subscriptionId = payload.subscription;
        if (subscriptionId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(
              subscriptionId
            );
            await updateUserFromSubscription(subscription);
          } catch (err) {
            console.error(
              '[StripeWebhook] failed to retrieve subscription from invoice.payment_failed',
              err?.message,
              { subscriptionId }
            );
          }
        }
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
    console.error('[StripeWebhook] handler error', err?.message, err?.stack);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Webhook handling failed' })
    };
  }
}
