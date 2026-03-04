/**
 * AI Ad Builder - Status Endpoint
 * Polls job status for background generation
 */

import { supabaseAdmin } from './_shared/clients.js';
import { getUserProfile } from './_shared/auth.js';

export const handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || 'https://adruby.de',
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

        // Fetch job — include image_url column for fallback
        const { data: job, error } = await supabaseAdmin
            .from('generated_creatives')
            .select('id, outputs, metrics, thumbnail, saved, image_url')
            .eq('id', jobId)
            .eq('user_id', user.id)
            .single();

        if (error || !job) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Job not found' }) };
        }

        const status = job.metrics?.status || 'unknown';

        // ── ERROR ──
        if (status === 'error') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: false,
                    status: 'error',
                    error: job.metrics?.error || job.metrics?.errorMessage || 'Generation failed',
                }),
            };
        }

        // ── COMPLETE ──
        if (status === 'complete') {
            const outputs = job.outputs || {};

            // Chain multiple fallbacks for image URL
            const resolvedImageUrl = job.thumbnail
                || job.image_url
                || outputs.imageUrl
                || outputs.imageDataUrl
                || outputs.thumbnailUrl
                || null;

            // Build variants array for frontend (backend stores as { url, concept, layout })
            const variants = Array.isArray(outputs.variants)
                ? outputs.variants.map((v, idx) => ({
                    id: `${job.id}_v${idx + 1}`,
                    headline: v.headline || outputs.headline,
                    slogan: v.slogan || outputs.slogan || '',
                    description: v.description || outputs.description || '',
                    cta: v.cta || outputs.cta || '',
                    hook: v.hook || outputs.hook || outputs.description || '',
                    imageUrl: v.url || v.imageUrl || resolvedImageUrl,
                    imagePrompt: v.imagePrompt || outputs.imagePrompt || '',
                    template: v.template || outputs.template || '',
                    qualityScore: v.qualityScore || outputs.qualityScore,
                    engagementScore: v.engagementScore || outputs.engagementScore,
                }))
                : undefined;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    status: 'complete',
                    data: {
                        id: job.id,
                        headline: outputs.headline,
                        slogan: outputs.slogan,
                        description: outputs.description || outputs.hook || '',
                        cta: outputs.cta,
                        hook: outputs.hook || outputs.description || '',
                        imageUrl: resolvedImageUrl,
                        imagePrompt: outputs.imagePrompt || '',
                        template: outputs.template || '',
                        qualityScore: outputs.qualityScore,
                        engagementScore: outputs.engagementScore,
                        creditsUsed: job.metrics?.credits_deducted ? 1 : 0,
                        ...(variants && variants.length > 0 ? { variants } : {}),
                    },
                    metadata: {
                        generationTime: job.metrics?.generationTime,
                        savedToLibrary: job.saved,
                        engine: outputs.engine || job.metrics?.engine,
                    }
                }),
            };
        }

        // ── STILL PROCESSING ──
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                status: 'processing',
                message: 'Generation in progress...',
                progress: job.metrics?.progress || 0,
                step: job.metrics?.step || 'pending',
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
