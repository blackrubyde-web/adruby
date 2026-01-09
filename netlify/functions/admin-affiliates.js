// netlify/functions/admin-affiliates.js
import { supabaseAdmin } from './_shared/clients.js';
import { requireUserId } from './_shared/auth.js';
import { withCors, badRequest, forbidden, serverError } from './utils/response.js';

/**
 * Admin Affiliates API
 * GET - List all affiliates with stats
 * POST - Create new affiliate partner
 * PATCH - Approve/update affiliate
 */
async function handleRequest(event) {
    // Require authentication
    const auth = await requireUserId(event);
    if (!auth.ok) return auth.response;

    const { userId } = auth;

    try {
        // Check admin role
        const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc('admin_check_role', {
            p_user_id: userId
        });

        if (roleError || !isAdmin) {
            return forbidden('Admin access required');
        }

        // GET - List all affiliates
        if (event.httpMethod === 'GET') {
            const { data: affiliates, error } = await supabaseAdmin.rpc('admin_get_all_affiliates');

            if (error) {
                console.error('[Admin] Get affiliates failed:', error);
                return serverError('Failed to fetch affiliates');
            }

            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    affiliates: affiliates || []
                })
            };
        }

        // POST - Create new affiliate
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const { user_id, affiliate_code, payout_email } = body;

            if (!user_id) {
                return badRequest('user_id is required');
            }

            const { data, error } = await supabaseAdmin.rpc('admin_create_affiliate', {
                p_user_id: user_id,
                p_code: affiliate_code || null,
                p_payout_email: payout_email || null
            });

            if (error) {
                console.error('[Admin] Create affiliate failed:', error);
                return serverError('Failed to create affiliate');
            }

            if (!data?.success) {
                return badRequest(data?.error || 'Failed to create affiliate');
            }

            return {
                statusCode: 201,
                body: JSON.stringify(data)
            };
        }

        // PATCH - Approve affiliate
        if (event.httpMethod === 'PATCH') {
            const body = JSON.parse(event.body || '{}');
            const { affiliate_id, action } = body;

            if (!affiliate_id) {
                return badRequest('affiliate_id is required');
            }

            if (action === 'approve') {
                const { data, error } = await supabaseAdmin.rpc('admin_approve_affiliate', {
                    p_affiliate_id: affiliate_id
                });

                if (error) {
                    console.error('[Admin] Approve affiliate failed:', error);
                    return serverError('Failed to approve affiliate');
                }

                return {
                    statusCode: 200,
                    body: JSON.stringify(data)
                };
            }

            return badRequest('Invalid action');
        }

        return badRequest('Method not allowed');
    } catch (err) {
        console.error('[Admin] Affiliates error:', err);
        return serverError('Internal server error');
    }
}

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') return withCors({ statusCode: 200 });
    const response = await handleRequest(event);
    return withCors(response);
}
