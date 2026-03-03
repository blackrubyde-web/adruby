/**
 * VIDEO AD STATUS — Polling Endpoint
 * 
 * Returns video job status, progress, and video URL when complete.
 * Same pattern as ai-ad-status.js but with video-specific fields.
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
        const jobId = event.queryStringParameters?.id;
        if (!jobId) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing job ID' }) };
        }

        const authHeader = event.headers.authorization || event.headers.Authorization;
        const user = await getUserProfile(authHeader);
        if (!user) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }

        const { data: job, error } = await supabaseAdmin
            .from('generated_creatives')
            .select('id, outputs, metrics, video_url, video_duration_ms, video_aspect_ratio, video_resolution, video_has_audio, video_archetype, video_script, saved, media_type')
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
                        mediaType: job.media_type || 'video',
                        videoUrl: job.video_url || job.outputs?.videoUrl,
                        durationMs: job.video_duration_ms,
                        aspectRatio: job.video_aspect_ratio,
                        resolution: job.video_resolution,
                        hasAudio: job.video_has_audio,
                        archetype: job.video_archetype,
                        script: job.video_script,
                        headline: job.outputs?.headline,
                        slogan: job.outputs?.slogan,
                        description: job.outputs?.description,
                        cta: job.outputs?.cta,
                    },
                    metadata: {
                        generationTime: job.metrics?.generationTime,
                        engine: job.metrics?.engine,
                        savedToLibrary: job.saved,
                    },
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
                    error: job.metrics?.errorMessage || 'Video generation failed',
                }),
            };
        }

        // Still processing — return progress info
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                status: 'processing',
                progress: job.metrics?.progress || 0,
                step: job.metrics?.step || 'pending',
                message: job.metrics?.message || 'Video wird generiert...',
            }),
        };

    } catch (error) {
        console.error('[Video Status] Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Status check failed', message: error.message }),
        };
    }
};
