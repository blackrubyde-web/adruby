// netlify/functions/admin-payouts.js
import { supabaseAdmin } from './_shared/clients.js';
import { requireUserId } from './_shared/auth.js';
import { withCors, badRequest, forbidden, serverError } from './utils/response.js';

/**
 * Admin Payouts API
 * GET - List all payouts (optional status filter)
 * POST - Process a payout (mark as completed/failed)
 */
async function handleRequest(event) {
    // Require authentication
    const auth = await requireUserId(event);
    if (!auth.ok) return auth.response;

    const { userId } = auth;

    try {
        // Check admin role (gracefully handle missing RPC)
        let isAdmin = false;
        try {
            const { data, error: roleError } = await supabaseAdmin.rpc('admin_check_role', {
                p_user_id: userId
            });
            if (!roleError && data) {
                isAdmin = true;
            }
        } catch (rpcErr) {
            console.log('[Admin] admin_check_role RPC not found, checking profile.is_admin');
            // Fallback: check is_admin in user profile
            const { data: profile } = await supabaseAdmin
                .from('user_profiles')
                .select('is_admin')
                .eq('id', userId)
                .single();
            isAdmin = profile?.is_admin === true;
        }

        if (!isAdmin) {
            return forbidden('Admin access required');
        }

        // GET - List payouts
        if (event.httpMethod === 'GET') {
            const params = event.queryStringParameters || {};
            const status = params.status || null;

            const { data: payouts, error } = await supabaseAdmin.rpc('admin_get_all_payouts', {
                p_status: status
            });

            if (error) {
                console.error('[Admin] Get payouts failed:', error);
                return serverError('Failed to fetch payouts');
            }

            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    payouts: payouts || []
                })
            };
        }

        // POST - Process payout
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const { payout_id, status, reference } = body;

            if (!payout_id || !status) {
                return badRequest('payout_id and status are required');
            }

            if (!['completed', 'failed', 'processing'].includes(status)) {
                return badRequest('Invalid status. Must be: completed, failed, or processing');
            }

            const { data, error } = await supabaseAdmin.rpc('admin_process_payout', {
                p_payout_id: payout_id,
                p_status: status,
                p_reference: reference || null
            });

            if (error) {
                console.error('[Admin] Process payout failed:', error);
                return serverError('Failed to process payout');
            }

            if (!data?.success) {
                return badRequest(data?.error || 'Failed to process payout');
            }

            return {
                statusCode: 200,
                body: JSON.stringify(data)
            };
        }

        return badRequest('Method not allowed');
    } catch (err) {
        console.error('[Admin] Payouts error:', err);
        return serverError('Internal server error');
    }
}

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') return withCors({ statusCode: 200 });
    const response = await handleRequest(event);
    return withCors(response);
}
