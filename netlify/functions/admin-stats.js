// netlify/functions/admin-stats.js
import { supabaseAdmin } from './_shared/clients.js';
import { requireUserId } from './_shared/auth.js';
import { withCors, forbidden, serverError } from './utils/response.js';

/**
 * Admin Stats API
 * GET - Get platform-wide statistics
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

        if (event.httpMethod === 'GET') {
            const { data: stats, error } = await supabaseAdmin.rpc('admin_get_revenue_stats');

            if (error) {
                console.error('[Admin] Get stats failed:', error);
                return serverError('Failed to fetch stats');
            }

            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    stats: stats || {}
                })
            };
        }

        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    } catch (err) {
        console.error('[Admin] Stats error:', err);
        return serverError('Internal server error');
    }
}

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') return withCors({ statusCode: 200 });
    const response = await handleRequest(event);
    return withCors(response);
}
