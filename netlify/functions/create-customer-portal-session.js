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
      console.warn('[Portal] Invalid bearer token', { message: error.message });
      return { userId: null, userEmail: null, source: 'invalid' };
    }
    return { userId: data?.user?.id || null, userEmail: data?.user?.email || null, source: 'supabase' };
  } catch (err) {
    console.error('[Portal] auth.getUser crashed', err);
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

  const requiredEnv = ['STRIPE_SECRET_KEY', 'FRONTEND_URL', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missingEnv = requiredEnv.filter((k) => !process.env[k]);
  if (missingEnv.length) {
    console.error('[Portal] Missing ENV vars', missingEnv);
    return serverError('Server misconfiguration (ENV missing)');
  }

  try {
    let body;
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch {
      return badRequest('Invalid JSON body');
    }

    const authUser = await resolveUserFromAuthHeader(event);
    const userId = authUser.userId;

    if (!userId) {
      return unauthorized('Unauthorized');
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from(SUBSCRIPTION_TABLE)
      .select('stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('[Portal] Failed to load user profile', profileError);
      return serverError('Failed to load user profile');
    }

    const customerId = profile?.stripe_customer_id || null;
    if (!customerId) {
      return badRequest('No Stripe customer found. Start checkout first.');
    }

    const returnUrl = body.returnUrl || `${process.env.FRONTEND_URL}/settings`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl
    });

    return ok({ url: portalSession.url });
  } catch (err) {
    console.error('[Portal] Unexpected error', { message: err?.message, raw: err });
    captureException(err, { function: 'create-customer-portal-session' });
    return serverError(err?.message || 'Failed to create customer portal session');
  }
}
