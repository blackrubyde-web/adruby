// netlify/functions/admin-users.js
import { supabaseAdmin } from './_shared/clients.js';
import { requireUserId } from './_shared/auth.js';
import { withCors, badRequest, forbidden, serverError } from './utils/response.js';

/**
 * Admin Users API
 * GET - List all users with pagination and search
 * Returns user profiles with billing/credits data
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
            const params = event.queryStringParameters || {};
            const limit = Math.min(parseInt(params.limit) || 50, 100);
            const offset = parseInt(params.offset) || 0;
            const search = params.search || null;

            // Get users
            const { data: users, error: usersError } = await supabaseAdmin.rpc('admin_get_all_users', {
                p_limit: limit,
                p_offset: offset,
                p_search: search
            });

            if (usersError) {
                console.error('[Admin] Get users failed:', usersError);
                return serverError('Failed to fetch users');
            }

            // Get total count
            const { data: totalCount, error: countError } = await supabaseAdmin.rpc('admin_get_user_count', {
                p_search: search
            });

            if (countError) {
                console.error('[Admin] Get user count failed:', countError);
            }

            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    users: users || [],
                    total: totalCount || 0,
                    limit,
                    offset
                })
            };
        }

        if (event.httpMethod === 'PATCH') {
            // Update user credits
            const body = JSON.parse(event.body || '{}');
            const { user_id, credits, reason } = body;

            if (!user_id || credits === undefined) {
                return badRequest('user_id and credits are required');
            }

            const { data, error } = await supabaseAdmin.rpc('admin_update_user_credits', {
                p_user_id: user_id,
                p_credits: parseInt(credits),
                p_reason: reason || 'admin_adjustment'
            });

            if (error) {
                console.error('[Admin] Update credits failed:', error);
                return serverError('Failed to update credits');
            }

            return {
                statusCode: 200,
                body: JSON.stringify(data)
            };
        }

        return badRequest('Method not allowed');
    } catch (err) {
        console.error('[Admin] Users error:', err);
        return serverError('Internal server error');
    }
}

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') return withCors({ statusCode: 200 });
    const response = await handleRequest(event);
    return withCors(response);
}
