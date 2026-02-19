import { supabaseAdmin } from './_shared/clients.js';
import { requireUserId } from './_shared/auth.js';
import { withCors, ok, unauthorized, serverError } from './utils/response.js';

/**
 * Admin Check Endpoint
 * GET /api/admin-check
 * Verifies if the current user has admin privileges.
 */
export const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return withCors({ statusCode: 200 });

    try {
        // Require valid auth token
        const auth = await requireUserId(event);
        if (!auth.ok) return auth.response;

        const { userId } = auth;

        // Check admin role via RPC
        const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc('admin_check_role', {
            p_user_id: userId
        });

        if (roleError) {
            console.error('[AdminCheck] RPC Error:', roleError);
            // If RPC fails, default to false for safety
            return ok({ isAdmin: false, error: 'Check failed' });
        }

        return ok({ isAdmin: !!isAdmin });

    } catch (err) {
        console.error('[AdminCheck] Error:', err);
        return serverError('Internal server error');
    }
};
