// netlify/functions/delete-account.js

import { supabaseAdmin } from './_shared/clients.js';
import { ok, badRequest, serverError, methodNotAllowed, withCors } from './utils/response.js';
import { initTelemetry, captureException } from './utils/telemetry.js';

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

const checkEnv = () => {
  const missing = requiredEnv.filter((k) => !process.env[k]);
  return { ok: missing.length === 0, missing };
};

const extractToken = (event) => {
  const header = event.headers?.authorization || event.headers?.Authorization || '';
  if (header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length);
  }
  return null;
};

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return withCors({ statusCode: 200 });
  }

  if (event.httpMethod !== 'POST') {
    return methodNotAllowed('POST,OPTIONS');
  }

  initTelemetry();

  const env = checkEnv();
  if (!env.ok) {
    return serverError(`Server misconfiguration (missing env: ${env.missing.join(', ')})`);
  }

  const token = extractToken(event);
  if (!token) {
    return badRequest('Missing bearer token', 401);
  }

  try {
    const { data: userResult, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userResult?.user) {
      return badRequest('Invalid or expired token', 401);
    }

    const userId = userResult.user.id;

    // Best effort: clean up user data before deleting the auth user
    try {
      const { error: rpcError } = await supabaseAdmin.rpc('delete_user_gdpr_data', {
        target_user_id: userId
      });
      if (rpcError) {
        console.warn('[delete-account] delete_user_gdpr_data failed', rpcError);
      }
    } catch (rpcCrash) {
      console.warn('[delete-account] delete_user_gdpr_data crashed', rpcCrash);
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (deleteError) {
        return serverError(deleteError.message || 'Failed to delete user');
      }

    return ok({ ok: true, user_id: userId });
  } catch (err) {
    console.error('[delete-account] unexpected error', err);
    captureException(err, { function: 'delete-account' });
    return serverError('Unexpected server error while deleting account');
  }
}
