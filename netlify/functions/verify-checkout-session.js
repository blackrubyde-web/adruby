import { stripe } from './_shared/clients.js';
import { ok, badRequest, serverError, methodNotAllowed, unauthorized, withCors } from './utils/response.js';
import { initTelemetry, captureException } from './utils/telemetry.js';
import { requireUserId } from './_shared/auth.js';

const missingEnv = () => !process.env.STRIPE_SECRET_KEY;

const extractSessionId = (event, body) => {
  const qsId = event?.queryStringParameters?.session_id || event?.queryStringParameters?.sessionId;
  const bodyId = body?.session_id || body?.sessionId;
  return qsId || bodyId || null;
};

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return withCors({ statusCode: 200 });
  }

  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return methodNotAllowed('GET,POST,OPTIONS');
  }

  initTelemetry();

  const auth = await requireUserId(event);
  if (!auth.ok) return auth.response;

  if (missingEnv()) {
    return serverError('Server misconfiguration: STRIPE_SECRET_KEY missing');
  }

  let body = {};
  if (event.body) {
    try {
      const parsed = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body;
      body = JSON.parse(parsed || '{}');
    } catch {
      return badRequest('Invalid JSON body');
    }
  }

  const sessionId = extractSessionId(event, body);
  if (!sessionId) {
    return badRequest('Missing session_id');
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    });

    const paid = session.payment_status === 'paid';
    const completed = session.status === 'complete';
    const isOk = paid || completed;

    const sessionUserId = session.metadata?.user_id || session.metadata?.userId || null;
    if (sessionUserId && sessionUserId !== auth.userId) {
      return unauthorized('Forbidden');
    }

    return ok(
      {
        ok: isOk,
        status: session.payment_status || session.status || 'unknown',
        checkout_status: session.status || null,
        subscription_id:
          (typeof session.subscription === 'string' ? session.subscription : session.subscription?.id) ||
          null,
      },
      isOk ? 200 : 202
    );
  } catch (err) {
    const isStripeNotFound =
      err?.type === 'StripeInvalidRequestError' ||
      err?.statusCode === 404 ||
      err?.message?.toLowerCase?.().includes('no such');

    const statusCode = isStripeNotFound ? 400 : 500;
    const message = isStripeNotFound ? 'Invalid or expired session_id' : 'Failed to verify checkout session';

    console.error('[verify-checkout-session] error', {
      message: err?.message,
      type: err?.type,
      statusCode
    });

    captureException(err, { function: 'verify-checkout-session', sessionId });

    return statusCode === 400 ? badRequest(message) : serverError(message, statusCode);
  }
}
