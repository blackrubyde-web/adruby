import { stripe, supabaseAdmin, SUBSCRIPTION_TABLE } from './_shared/clients.js';
import { ok, badRequest, serverError, methodNotAllowed, unauthorized, withCors } from './utils/response.js';
import { initTelemetry, captureException } from './utils/telemetry.js';

async function resolveUserFromAuthHeader(event) {
  const authHeader = event?.headers?.authorization || event?.headers?.Authorization || null;
  if (!authHeader?.startsWith('Bearer ')) return { userId: null, userEmail: null, source: 'none' };

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return { userId: null, userEmail: null, source: 'empty' };

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error) {
      console.warn('[Checkout] Invalid bearer token', { message: error.message });
      return { userId: null, userEmail: null, source: 'invalid' };
    }
    return { userId: data?.user?.id || null, userEmail: data?.user?.email || null, source: 'supabase' };
  } catch (err) {
    console.error('[Checkout] auth.getUser crashed', err);
    return { userId: null, userEmail: null, source: 'crash' };
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return withCors({ statusCode: 200 });
  }

  if (event.httpMethod !== 'POST') {
    return methodNotAllowed('POST,OPTIONS');
  }

  initTelemetry();

  let orderId = null;
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    orderId = body?.orderId || null;
  } catch (err) {
    console.warn('[Checkout] Failed to parse request body', err?.message || err);
  }

  const requiredEnv = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PRICE_ID',
    'FRONTEND_URL',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missingEnv = requiredEnv.filter((k) => !process.env[k]);
  if (missingEnv.length) {
    console.error('[Checkout] Missing ENV vars', missingEnv);
    return serverError('Server misconfiguration (ENV missing)');
  }

  try {
    const authUser = await resolveUserFromAuthHeader(event);
    const userId = authUser.userId;
    const userEmail = authUser.userEmail;

    if (!userId || !userEmail) {
      console.warn('[Checkout] Unauthorized checkout attempt', { authSource: authUser.source });
      return unauthorized('Unauthorized');
    }

    console.log('[Checkout] Start', { userId, userEmail, authSource: authUser.source });

    // 1) Stripe-Customer aus Supabase holen (falls vorhanden)
    let customerId = null;

    try {
      const { data: existing, error: existingError } = await supabaseAdmin
        .from(SUBSCRIPTION_TABLE)
        .select('stripe_customer_id')
        .eq('id', userId)
        .maybeSingle();

      if (existingError) {
        console.warn('[Checkout] Error fetching existing profile', existingError);
      }

      if (existing?.stripe_customer_id) {
        customerId = existing.stripe_customer_id;
        console.log('[Checkout] Existing customerId found', { customerId });
      }
    } catch (err) {
      console.error('[Checkout] Supabase lookup crashed', err);
    }

    // 2) Falls kein Customer vorhanden: neuen Stripe-Customer anlegen
    if (!customerId) {
      console.log('[Checkout] Creating new Stripe customer', { userId, userEmail });

      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { user_id: userId }
      });

      customerId = customer.id;
      console.log('[Checkout] Created new Stripe customer', { customerId });

      // in Supabase speichern (best effort)
      try {
        const { error: upsertError } = await supabaseAdmin
          .from(SUBSCRIPTION_TABLE)
          .upsert(
            {
              id: userId,
              email: userEmail,
              stripe_customer_id: customerId
            },
            { onConflict: 'id' }
          );

        if (upsertError) {
          console.error('[Checkout] Failed to upsert stripe_customer_id in Supabase', upsertError);
        } else {
          console.log('[Checkout] Supabase upsert for stripe_customer_id OK', { userId, customerId });
        }
      } catch (err) {
        console.error('[Checkout] Supabase upsert crashed', err);
      }
    }

    // 3) Checkout-Session erzeugen
    const successUrl = `${process.env.FRONTEND_URL}/payment-verification?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.FRONTEND_URL}/payment-cancelled`;

    console.log('[Checkout] Creating checkout session', {
      userId,
      customerId,
      priceId: process.env.STRIPE_PRICE_ID,
      successUrl,
      cancelUrl
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      client_reference_id: orderId || undefined,
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_id: userId,
          email: userEmail,
          order_id: orderId || undefined
        }
      },
      metadata: {
        user_id: userId,
        email: userEmail,
        order_id: orderId || undefined
      },
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    console.log('[Checkout] Session created', {
      sessionId: session.id,
      customerId,
      mode: session.mode,
      url: session.url
    });

    if (orderId) {
      const { error: orderError } = await supabaseAdmin
        .from('payment_orders')
        .update({
          stripe_checkout_session_id: session.id,
          stripe_subscription_id: session.subscription || null,
          status: 'pending',
          amount_total: session.amount_total ?? null,
          currency: session.currency ?? null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('[Checkout] Failed to update payment order', { orderId, orderError });
      }
    } else {
      console.warn('[Checkout] No orderId provided for checkout session', { sessionId: session.id });
    }

    return ok({ url: session.url });
  } catch (err) {
    console.error('[Checkout] Unexpected error', {
      message: err?.message,
      raw: err
    });
    captureException(err, { function: 'create-checkout-session' });
    return serverError(err?.message || 'Unexpected server error in checkout');
  }
}
