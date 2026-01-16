/**
 * AI Ad Builder - Status Endpoint
 * Polls job status for background generation
 */

import { supabaseAdmin } from './_shared/clients.js';
import { getUserProfile } from './_shared/auth.js';

export const handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        // Get job ID from query params
        const jobId = event.queryStringParameters?.id;
        if (!jobId) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing job ID' }) };
        }

        // Authenticate
        const authHeader = event.headers.authorization || event.headers.Authorization;
        const user = await getUserProfile(authHeader);

        if (!user) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }

        // Fetch job
        const { data: job, error } = await supabaseAdmin
            .from('generated_creatives')
            .select('id, outputs, metrics, thumbnail, saved')
            .eq('id', jobId)
            .eq('user_id', user.id)
            .single();

        if (error || !job) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Job not found' }) };
        }

        const status = job.metrics?.status || 'unknown';

        if (status === 'complete') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    status: 'complete',
                    data: {
                        id: job.id,
                        headline: job.outputs?.headline,
                        slogan: job.outputs?.slogan,
                        description: job.outputs?.description,
                        cta: job.outputs?.cta,
                        imageUrl: job.thumbnail || job.outputs?.imageUrl,
                        qualityScore: job.outputs?.qualityScore,
                        engagementScore: job.outputs?.engagementScore,
                    },
                    metadata: {
                        generationTime: job.metrics?.generationTime,
                        savedToLibrary: job.saved,
                    }
                }),
            };
        }

        if (status === 'error') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: false,
                    status: 'error',
                    error: job.metrics?.error || 'Generation failed',
                }),
            };
        }

        // Still processing
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                status: 'processing',
                message: 'Generation in progress...',
            }),
        };

    } catch (error) {
        console.error('[AI Ad Status] Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Status check failed', message: error.message }),
        };
    }
};
