import { buffer } from 'micro';
import Stripe from 'stripe';
import { supabaseAdmin, SUBSCRIPTION_TABLE } from './_shared/clients.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

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

  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[StripeWebhook] missing STRIPE_WEBHOOK_SECRET');
    return { statusCode: 500, headers: corsHeaders(), body: 'Webhook secret not configured' };
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
    const data = stripeEvent.data.object;

    switch (type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = data;
        const subscriptionId = subscription.id;
        const customerId = subscription.customer;
        const status = subscription.status;
        const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null;
        const supabaseUserId =
          subscription.metadata?.supabase_user_id || subscription?.metadata?.supabaseUserId || null;

        console.log('[StripeWebhook] subscription event', { type, subscriptionId, status, supabaseUserId, customerId });

        let matchQuery;
        if (supabaseUserId) {
          matchQuery = { column: 'id', value: supabaseUserId };
        } else if (customerId) {
          matchQuery = { column: 'stripe_customer_id', value: customerId };
        }

        if (!matchQuery) {
          console.warn('[StripeWebhook] no matchable identifier found for subscription update');
          break;
        }

        const { error: updateError } = await supabaseAdmin
          .from(SUBSCRIPTION_TABLE)
          .update({
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            subscription_status: status,
            trial_ends_at: trialEnd
          })
          .eq(matchQuery.column, matchQuery.value);

        if (updateError) {
          console.error('[StripeWebhook] Supabase update error', updateError);
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const subscriptionId = data.subscription;
        console.log('[StripeWebhook] invoice paid', { subscriptionId });
        break;
      }
      case 'invoice.payment_failed': {
        console.warn('[StripeWebhook] invoice payment failed', { invoiceId: data.id, subscription: data.subscription });
        break;
      }
      default:
        console.log('[StripeWebhook] unhandled event', type);
    }

    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('[StripeWebhook] handler error', err);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Webhook handling failed' }) };
  }
}

const corsHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Stripe-Signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
});
