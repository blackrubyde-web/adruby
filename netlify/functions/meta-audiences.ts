/**
 * Meta Audiences Endpoint
 * Fetches custom audiences from Meta Business Account
 */

// @ts-ignore
import { supabaseAdmin } from './_shared/clients.js';

export async function handler(event: any) {
    // CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            body: ''
        };
    }

    try {
        const authHeader = event.headers.authorization || event.headers.Authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Missing or invalid Authorization header' })
            };
        }

        const token = authHeader.replace('Bearer ', '').trim();
        const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !userData?.user?.id) {
            console.warn('[MetaAudiences] Auth failed', authError);
            return {
                statusCode: 401,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        const userId = userData.user.id;

        // TODO: Fetch from Supabase facebook_connections
        // For now, return mock data
        const audiences = [
            {
                id: 'ca_website_30d',
                name: 'Website Visitors (30 days)',
                type: 'website',
                size: 15000,
                status: 'ready',
                description: 'Alle Besucher der letzten 30 Tage'
            },
            {
                id: 'ca_customers',
                name: 'Customer Email List',
                type: 'customer_list',
                size: 8500,
                status: 'ready',
                description: 'Hochgeladene Kundenliste'
            },
            {
                id: 'ca_engagement',
                name: 'Email Openers',
                type: 'engagement',
                size: 3200,
                status: 'ready',
                description: 'Nutzer die Email geöffnet haben'
            },
            {
                id: 'ca_video_viewers',
                name: 'Video Viewers (90 days)',
                type: 'engagement',
                size: 12000,
                status: 'ready',
                description: 'Video-Interaktionen der letzten 90 Tage'
            },
            {
                id: 'ca_cart_abandoners',
                name: 'Cart Abandoners',
                type: 'website',
                size: 2800,
                status: 'populating',
                description: 'Warenkorbabbrecher'
            }
        ];

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                audiences
            })
        };
    } catch (error: any) {
        console.error('Meta audiences error:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
}
