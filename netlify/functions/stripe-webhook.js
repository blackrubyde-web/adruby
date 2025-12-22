import { stripe, supabaseAdmin, SUBSCRIPTION_TABLE } from './_shared/clients.js';
import { withCors, serverError } from './utils/response.js';
import { initTelemetry, captureException } from './utils/telemetry.js';

const AFFILIATE_PAYOUT_PER_INVOICE = 5.0;

function extractInvoicePeriod(invoice) {
  const line = invoice?.lines?.data?.[0];
  const period = line?.period || {};
  const start = period.start || invoice?.period_start;
  const end = period.end || invoice?.period_end;

  return {
    periodStart: start ? new Date(start * 1000).toISOString() : null,
    periodEnd: end ? new Date(end * 1000).toISOString() : null
  };
}

async function resolveUserIdAndCustomer(subscription, source = 'unknown') {
  if (!subscription) {
    console.warn('[Webhook] resolveUserIdAndCustomer called without subscription', { source });
    return { userId: null, customerId: null };
  }

  const customerId = subscription.customer || null;
  const md = subscription.metadata || {};

  let userId =
    md.user_id || md.userId || md.supabase_user_id || md.supabaseUserId || null;

  if (userId) {
    console.log('[Webhook] user_id from subscription metadata', { source, userId, customerId });
    return { userId, customerId };
  }

  if (customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      const cmd = customer.metadata || {};

      userId =
        cmd.user_id || cmd.userId || cmd.supabase_user_id || cmd.supabaseUserId || null;

      if (userId) {
        console.log('[Webhook] user_id resolved from customer metadata', { source, userId, customerId });
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

async function updatePaymentOrder(match, payload, source) {
  const matchEntries = Object.entries(match || {}).filter(([, value]) => value);
  if (!matchEntries.length) {
    console.warn('[Webhook] payment_orders update skipped (no match)', { source });
    return;
  }

  try {
    let query = supabaseAdmin.from('payment_orders').update(payload);
    matchEntries.forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.select('id');

    if (error) {
      console.error('[Webhook] payment_orders update failed', { source, match, error });
    } else {
      console.log('[Webhook] payment_orders updated', { source, match, updated: data?.length || 0 });
    }
  } catch (err) {
    console.error('[Webhook] payment_orders update crashed', { source, error: err?.message || err });
  }
}

async function updateUserFromSubscription(subscription, source = 'unknown') {
  try {
    if (!subscription) {
      console.warn('[Webhook] updateUserFromSubscription called with null', { source });
      return;
    }

    const { userId, customerId } = await resolveUserIdAndCustomer(subscription, source);

    if (!userId) {
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
      stripe_subscription_id: subscription.id || null,
      subscription_status: status,
      trial_status: trialStatus,
      trial_started_at: trialStart,
      trial_expires_at: trialEnd,
      trial_ends_at: trialEnd,
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

async function findUserByCustomerId(customerId) {
  if (!customerId) return { user: null, error: 'Missing customerId' };

  try {
    const { data, error } = await supabaseAdmin
      .from(SUBSCRIPTION_TABLE)
      .select('id, stripe_customer_id, referred_by_affiliate_id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (error) {
      return { user: null, error };
    }

    return { user: data, error: null };
  } catch (err) {
    return { user: null, error: err };
  }
}

async function upsertAffiliateReferral({
  affiliateId,
  referredUserId,
  refCode = null,
  stripeCustomerId,
  stripeSubscriptionId,
  status,
  lastInvoiceAt = null
}) {
  try {
    const payload = {
      affiliate_id: affiliateId,
      referred_user_id: referredUserId,
      ref_code: refCode,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      current_status: status,
      last_invoice_paid_at: lastInvoiceAt
    };

    const { error } = await supabaseAdmin.from('affiliate_referrals').upsert(payload, {
      onConflict: 'affiliate_id,referred_user_id'
    });

    if (error) {
      console.error('[Affiliate] Failed to upsert referral', { payload, error });
    } else {
      console.log('[Affiliate] Referral upserted', { affiliateId, referredUserId, stripeSubscriptionId, status });
    }
  } catch (err) {
    console.error('[Affiliate] upsertAffiliateReferral crashed', { error: err.message || err });
  }
}

async function recordAffiliateEarning({ affiliateId, referredUserId, invoice, subscriptionId }) {
  if (!affiliateId || !referredUserId || !invoice) {
    console.warn('[Affiliate] recordAffiliateEarning missing data', {
      affiliateId,
      referredUserId,
      invoiceId: invoice?.id
    });
    return;
  }

  try {
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('affiliate_earnings')
      .select('id')
      .eq('stripe_invoice_id', invoice.id)
      .maybeSingle();

    if (existingError) {
      console.error('[Affiliate] Failed checking existing earning', {
        invoiceId: invoice.id,
        error: existingError
      });
    }

    if (existing) {
      console.log('[Affiliate] Earning already exists for invoice, skipping', { invoiceId: invoice.id });
      return;
    }
  } catch (err) {
    console.error('[Affiliate] Existing earning check crashed', {
      invoiceId: invoice.id,
      error: err.message || err
    });
  }

  const { periodStart, periodEnd } = extractInvoicePeriod(invoice);

  try {
    const earningPayload = {
      affiliate_id: affiliateId,
      referred_user_id: referredUserId,
      stripe_invoice_id: invoice.id,
      stripe_subscription_id: subscriptionId,
      amount: AFFILIATE_PAYOUT_PER_INVOICE,
      currency: (invoice.currency || 'eur').toUpperCase(),
      period_start: periodStart,
      period_end: periodEnd
    };

    const { error: earningError } = await supabaseAdmin.from('affiliate_earnings').insert(earningPayload);

    if (earningError) {
      console.error('[Affiliate] Failed to insert earning', { earningPayload, earningError });
    } else {
      console.log('[Affiliate] Earning recorded', earningPayload);
    }

    const { error: balanceError } = await supabaseAdmin.rpc('add_affiliate_earning', {
      p_affiliate_id: affiliateId,
      p_amount: AFFILIATE_PAYOUT_PER_INVOICE
    });

    if (balanceError) {
      console.error('[Affiliate] Failed to update affiliate balance via RPC', { affiliateId, balanceError });
    } else {
      console.log('[Affiliate] Affiliate balance updated via RPC', { affiliateId });
    }
  } catch (err) {
    console.error('[Affiliate] recordAffiliateEarning crashed', {
      error: err.message || err,
      affiliateId,
      referredUserId,
      invoiceId: invoice.id
    });
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  if (!invoice?.customer) {
    console.warn('[Affiliate] invoice.payment_succeeded without customer', { invoiceId: invoice?.id });
    return;
  }

  if (!invoice?.subscription) {
    console.log('[Affiliate] Skipping non-subscription invoice for affiliate payout', { invoiceId: invoice?.id });
    return;
  }

  const lines = invoice.lines?.data || [];
  const mainLine = lines[0];
  const priceId = mainLine?.price?.id;
  const affiliateEligiblePriceId = process.env.STRIPE_AFFILIATE_ELIGIBLE_PRICE_ID;

  if (affiliateEligiblePriceId && priceId && priceId !== affiliateEligiblePriceId) {
    console.log('[Affiliate] Invoice not eligible for affiliate payout (price mismatch)', {
      invoiceId: invoice.id,
      priceId,
      affiliateEligiblePriceId
    });
    return;
  }

  const { user, error } = await findUserByCustomerId(invoice.customer);
  if (error || !user) {
    console.warn('[Affiliate] No user found for invoice customer', { invoiceId: invoice.id, customerId: invoice.customer, error });
    return;
  }

  if (!user.referred_by_affiliate_id) {
    console.log('[Affiliate] User has no affiliate referral, skipping earning', { userId: user.id, customerId: invoice.customer });
    return;
  }

  const { periodEnd } = extractInvoicePeriod(invoice);

  await upsertAffiliateReferral({
    affiliateId: user.referred_by_affiliate_id,
    referredUserId: user.id,
    refCode: null,
    stripeCustomerId: invoice.customer,
    stripeSubscriptionId: invoice.subscription,
    status: 'active',
    lastInvoiceAt: periodEnd || new Date().toISOString()
  });

  await recordAffiliateEarning({
    affiliateId: user.referred_by_affiliate_id,
    referredUserId: user.id,
    invoice,
    subscriptionId: invoice.subscription
  });
}

async function handleSubscriptionCancellation(subscription) {
  const customerId = subscription?.customer;
  if (!customerId) return;

  const { user, error } = await findUserByCustomerId(customerId);
  if (error || !user?.referred_by_affiliate_id) return;

  try {
    const { error: updateError } = await supabaseAdmin
      .from('affiliate_referrals')
      .update({ current_status: 'cancelled' })
      .eq('affiliate_id', user.referred_by_affiliate_id)
      .eq('referred_user_id', user.id);

    if (updateError) {
      console.error('[Affiliate] Failed to mark referral cancelled', { subId: subscription.id, customerId, updateError });
    } else {
      console.log('[Affiliate] Referral marked cancelled', { subId: subscription.id, customerId });
    }
  } catch (err) {
    console.error('[Affiliate] handleSubscriptionCancellation crashed', { subId: subscription.id, error: err.message || err });
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return withCors({ statusCode: 200 });
  }

  if (event.httpMethod !== 'POST') {
    return withCors({ statusCode: 405 });
  }

  initTelemetry();

  if (!stripe) {
    console.error('[Webhook] Stripe client not configured');
    return serverError('Stripe not configured');
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[Webhook] Supabase env missing', {
      hasUrl: !!process.env.SUPABASE_URL,
      hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });
    return serverError('Supabase not configured');
  }

  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    console.error('[Webhook] Missing STRIPE_WEBHOOK_SECRET');
    return serverError('Missing STRIPE_WEBHOOK_SECRET');
  }

  if (!sig) {
    console.error('[Webhook] Missing Stripe signature header');
    return withCors({ statusCode: 400 });
  }

  let stripeEvent;

  try {
    if (!event.body) {
      console.error('[Webhook] Missing request body');
      return withCors({ statusCode: 400 });
    }
    const rawBody = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error('[Webhook] Signature verification failed', err.message);
    captureException(err, { function: 'stripe-webhook', stage: 'signature' });
    return withCors({ statusCode: 400 });
  }

  const type = stripeEvent.type;
  const obj = stripeEvent.data.object;

  console.log('[Webhook] Event received', { type, eventId: stripeEvent.id });

  try {
    if (type === 'checkout.session.completed') {
      console.log('[Webhook] checkout.session.completed payload', {
        sessionId: obj.id,
        mode: obj.mode,
        subscription: obj.subscription,
        metadata: obj.metadata
      });

      const orderId = obj.client_reference_id || obj.metadata?.order_id || null;
      await updatePaymentOrder(
        orderId ? { id: orderId } : { stripe_checkout_session_id: obj.id },
        {
          status: 'completed',
          stripe_checkout_session_id: obj.id,
          stripe_subscription_id: obj.subscription || null,
          stripe_payment_intent_id: obj.payment_intent || null,
          stripe_invoice_id: obj.invoice || null,
          amount_total: obj.amount_total ?? null,
          currency: obj.currency ?? null,
          updated_at: new Date().toISOString()
        },
        'checkout.session.completed'
      );

      if (obj.subscription) {
        const subscription = await stripe.subscriptions.retrieve(obj.subscription);
        await updateUserFromSubscription(subscription, 'checkout.session.completed');
      } else {
        console.warn('[Webhook] checkout.session.completed without subscription', { sessionId: obj.id });
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

      if (type === 'customer.subscription.deleted' || obj.status === 'canceled') {
        await handleSubscriptionCancellation(obj);
      }
    }

    if (type === 'invoice.payment_succeeded') {
      console.log('[Webhook] invoice.payment_succeeded', { invoiceId: obj.id, subscription: obj.subscription });

      if (obj.subscription) {
        const subscription = await stripe.subscriptions.retrieve(obj.subscription);
        await updateUserFromSubscription(subscription, 'invoice.payment_succeeded');
      }

      const orderId = obj.metadata?.order_id || null;
      await updatePaymentOrder(
        orderId
          ? { id: orderId }
          : {
              stripe_invoice_id: obj.id,
              stripe_subscription_id: obj.subscription || null
            },
        {
          status: 'paid',
          stripe_invoice_id: obj.id,
          stripe_subscription_id: obj.subscription || null,
          amount_total: obj.amount_paid ?? obj.amount_due ?? null,
          currency: obj.currency ?? null,
          updated_at: new Date().toISOString()
        },
        'invoice.payment_succeeded'
      );

      await handleInvoicePaymentSucceeded(obj);
    }

    if (type === 'invoice.payment_failed') {
      console.log('[Webhook] invoice.payment_failed', { invoiceId: obj.id, subscription: obj.subscription });

      if (obj.subscription) {
        const subscription = await stripe.subscriptions.retrieve(obj.subscription);
        await updateUserFromSubscription(subscription, 'invoice.payment_failed');
      }

      const orderId = obj.metadata?.order_id || null;
      await updatePaymentOrder(
        orderId
          ? { id: orderId }
          : {
              stripe_invoice_id: obj.id,
              stripe_subscription_id: obj.subscription || null
            },
        {
          status: 'invoice_failed',
          stripe_invoice_id: obj.id,
          stripe_subscription_id: obj.subscription || null,
          updated_at: new Date().toISOString()
        },
        'invoice.payment_failed'
      );
    }

    if (type === 'payment_intent.succeeded') {
      console.log('[Webhook] payment_intent.succeeded', { paymentIntentId: obj.id });

      const orderId = obj.metadata?.order_id || null;
      await updatePaymentOrder(
        orderId ? { id: orderId } : { stripe_payment_intent_id: obj.id },
        {
          status: 'paid',
          stripe_payment_intent_id: obj.id,
          stripe_invoice_id: obj.invoice || null,
          amount_total: obj.amount_received ?? obj.amount ?? null,
          currency: obj.currency ?? null,
          updated_at: new Date().toISOString()
        },
        'payment_intent.succeeded'
      );
    }
  } catch (err) {
    console.error('[Webhook] Handler crashed processing event', { type, error: err.message || err });
    captureException(err, { function: 'stripe-webhook', type });
  }

  return {
    statusCode: 200,
    headers: withCors().headers,
    body: JSON.stringify({ received: true })
  };
}
