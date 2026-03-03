/**
 * GEMINI VIDEO — Veo 3.1 Wrapper
 * 
 * Handles video generation via the Veo 3.1 API through @google/genai SDK.
 * Supports text-to-video and image-to-video modes.
 * 
 * Features:
 *   - generateVideoWithVeo()  — Main generation (text or image → video)
 *   - pollVeoOperation()      — Poll until generation completes
 *   - downloadVeoVideo()      — Download from Veo and return buffer
 *   - checkVeoQuota()         — Rate limit tracking via veo_quota table
 *   - recordVeoUsage()        — Record successful/failed usage
 */

import { GoogleGenAI } from '@google/genai';
import { supabaseAdmin } from './clients.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ============================================================
// CONFIG
// ============================================================

const VEO_MODELS = {
    fast: 'veo-3.1-fast-generate-preview',
    premium: 'veo-3.1-generate-preview',
};

const VEO_POLL_INTERVAL_MS = 10_000;  // 10 seconds
const VEO_MAX_WAIT_MS = 360_000;      // 6 minutes max
const VEO_QUOTA_LIMITS = {
    requestsPerMinute: 5,
    requestsPerDay: 100,
};

// ============================================================
// CLIENT
// ============================================================

let cachedGenAI = null;

function getGenAI() {
    if (!cachedGenAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY not configured');
        cachedGenAI = new GoogleGenAI({ apiKey });
    }
    return cachedGenAI;
}

// ============================================================
// QUOTA TRACKING
// ============================================================

/**
 * Check if Veo quota is likely available
 */
export async function checkVeoQuota() {
    try {
        const { data, error } = await supabaseAdmin
            .from('veo_quota')
            .select('*')
            .eq('id', 'global')
            .single();

        if (error || !data) {
            console.warn('[VeoQuota] No quota record found, allowing request');
            return { available: true };
        }

        const now = new Date();

        // Check if quota was exhausted and hasn't reset
        if (data.quota_exhausted && data.quota_reset_at) {
            const resetAt = new Date(data.quota_reset_at);
            if (now < resetAt) {
                return { available: false, reason: 'Quota exhausted', resetAt: resetAt.toISOString() };
            }
        }

        // Check minute rate
        const lastMinuteReset = new Date(data.last_minute_reset);
        const minuteElapsed = (now - lastMinuteReset) > 60_000;
        const currentMinuteRequests = minuteElapsed ? 0 : data.requests_this_minute;

        if (currentMinuteRequests >= VEO_QUOTA_LIMITS.requestsPerMinute) {
            return { available: false, reason: 'Minute rate limit', resetAt: new Date(lastMinuteReset.getTime() + 60_000).toISOString() };
        }

        // Check daily rate
        const lastDayReset = new Date(data.last_day_reset);
        const dayElapsed = (now - lastDayReset) > 86_400_000;
        const currentDayRequests = dayElapsed ? 0 : data.requests_this_day;

        if (currentDayRequests >= VEO_QUOTA_LIMITS.requestsPerDay) {
            return { available: false, reason: 'Daily rate limit', resetAt: new Date(lastDayReset.getTime() + 86_400_000).toISOString() };
        }

        // Check consecutive errors
        if (data.consecutive_errors >= 3) {
            return { available: false, reason: 'Too many consecutive errors' };
        }

        return { available: true, remainingMinute: VEO_QUOTA_LIMITS.requestsPerMinute - currentMinuteRequests };
    } catch (err) {
        console.warn('[VeoQuota] Quota check failed, allowing request:', err.message);
        return { available: true };
    }
}

/**
 * Record a Veo API usage (success or error)
 */
export async function recordVeoUsage(success, errorMessage = null) {
    try {
        const { data: current } = await supabaseAdmin
            .from('veo_quota')
            .select('*')
            .eq('id', 'global')
            .single();

        if (!current) return;

        const now = new Date();
        const lastMinuteReset = new Date(current.last_minute_reset);
        const lastDayReset = new Date(current.last_day_reset);
        const minuteElapsed = (now - lastMinuteReset) > 60_000;
        const dayElapsed = (now - lastDayReset) > 86_400_000;

        const update = {
            requests_this_minute: minuteElapsed ? 1 : current.requests_this_minute + 1,
            requests_this_day: dayElapsed ? 1 : current.requests_this_day + 1,
            last_minute_reset: minuteElapsed ? now.toISOString() : current.last_minute_reset,
            last_day_reset: dayElapsed ? now.toISOString() : current.last_day_reset,
            updated_at: now.toISOString(),
        };

        if (success) {
            update.consecutive_errors = 0;
            update.total_videos_generated = (current.total_videos_generated || 0) + 1;
            update.quota_exhausted = false;
        } else {
            update.consecutive_errors = (current.consecutive_errors || 0) + 1;
            if (errorMessage?.includes('quota') || errorMessage?.includes('429') || errorMessage?.includes('RESOURCE_EXHAUSTED')) {
                update.quota_exhausted = true;
                update.quota_reset_at = new Date(now.getTime() + 60_000).toISOString();
            }
        }

        await supabaseAdmin.from('veo_quota').update(update).eq('id', 'global');
    } catch (err) {
        console.warn('[VeoQuota] Failed to record usage:', err.message);
    }
}

// ============================================================
// VIDEO GENERATION
// ============================================================

/**
 * Generate a video with Veo 3.1
 * 
 * @param {Object} config
 * @param {string} config.prompt - The video description prompt
 * @param {string} [config.negativePrompt] - What NOT to include
 * @param {string} [config.quality='fast'] - 'fast' or 'premium'
 * @param {string} [config.aspectRatio='9:16'] - '16:9' or '9:16'
 * @param {string} [config.resolution='1080p'] - '720p', '1080p', or '4k'
 * @param {string} [config.durationSeconds='8'] - '4', '5', '6', '8'
 * @param {string} [config.personGeneration='dont_allow'] - Person policy
 * @param {Buffer|string} [config.imageBytes] - Product image buffer (for image-to-video)
 * @param {string} [config.imageMimeType='image/png'] - Image MIME type
 * @param {Function} [config.onProgress] - Progress callback
 * @returns {Promise<{videoBuffer: Buffer, metadata: Object}>}
 */
export async function generateVideoWithVeo(config) {
    const {
        prompt,
        negativePrompt,
        quality = 'fast',
        aspectRatio = '9:16',
        resolution = '1080p',
        durationSeconds = '8',
        personGeneration = 'dont_allow',
        imageBytes = null,
        imageMimeType = 'image/png',
        onProgress = null,
    } = config;

    // Check quota
    const quota = await checkVeoQuota();
    if (!quota.available) {
        throw new Error(`Veo quota unavailable: ${quota.reason}. Resets at: ${quota.resetAt || 'unknown'}`);
    }

    const ai = getGenAI();
    const model = VEO_MODELS[quality] || VEO_MODELS.fast;

    console.log(`[GeminiVideo] Generating with ${model}, ${aspectRatio}, ${resolution}, ${durationSeconds}s`);
    if (onProgress) onProgress('veo_starting', 30);

    try {
        // Build generation params
        const generateParams = {
            model,
            prompt,
            config: {
                aspectRatio,
                resolution,
                durationSeconds: String(durationSeconds),
                personGeneration,
            },
        };

        if (negativePrompt) {
            generateParams.negativePrompt = negativePrompt;
        }

        // Image-to-Video mode
        if (imageBytes) {
            const base64 = Buffer.isBuffer(imageBytes) ? imageBytes.toString('base64') : imageBytes;
            generateParams.image = {
                imageBytes: base64,
                mimeType: imageMimeType,
            };
            console.log('[GeminiVideo] Mode: Image-to-Video');
        } else {
            console.log('[GeminiVideo] Mode: Text-to-Video');
        }

        // Start generation
        let operation = await ai.models.generateVideos(generateParams);

        if (onProgress) onProgress('veo_generating', 40);

        // Poll until done
        const videoBuffer = await pollVeoOperation(operation, ai, onProgress);

        // Record success
        await recordVeoUsage(true);

        return {
            videoBuffer,
            metadata: {
                model,
                quality,
                aspectRatio,
                resolution,
                durationSeconds: parseInt(durationSeconds),
                hasImage: !!imageBytes,
                promptLength: prompt.length,
            },
        };

    } catch (err) {
        console.error(`[GeminiVideo] Generation failed: ${err.message}`);
        await recordVeoUsage(false, err.message);
        throw err;
    }
}

// ============================================================
// POLLING
// ============================================================

/**
 * Poll a Veo operation until it completes, then download the video.
 */
async function pollVeoOperation(operation, ai, onProgress = null) {
    const startTime = Date.now();
    let pollCount = 0;

    while (!operation.done) {
        if (Date.now() - startTime > VEO_MAX_WAIT_MS) {
            throw new Error(`Veo generation timed out after ${VEO_MAX_WAIT_MS / 1000}s`);
        }

        await new Promise(r => setTimeout(r, VEO_POLL_INTERVAL_MS));
        pollCount++;

        const elapsed = Math.round((Date.now() - startTime) / 1000);
        const progress = Math.min(40 + (pollCount * 8), 85);
        console.log(`[GeminiVideo] Polling... (attempt ${pollCount}, ${elapsed}s elapsed)`);

        if (onProgress) onProgress('veo_rendering', progress);

        operation = await ai.operations.getVideosOperation({ operation });
    }

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`[GeminiVideo] Generation complete in ${elapsed}s`);

    // Extract video
    if (!operation.response?.generatedVideos?.length) {
        throw new Error('Veo returned no videos');
    }

    const videoFile = operation.response.generatedVideos[0].video;
    if (!videoFile) {
        throw new Error('Veo response missing video file reference');
    }

    if (onProgress) onProgress('downloading', 88);

    // Download to temp file then read buffer
    const tmpDir = os.tmpdir();
    const tmpPath = path.join(tmpDir, `veo_${Date.now()}.mp4`);

    try {
        await ai.files.download({ file: videoFile, downloadPath: tmpPath });
        const videoBuffer = fs.readFileSync(tmpPath);
        console.log(`[GeminiVideo] Downloaded video: ${(videoBuffer.length / 1024 / 1024).toFixed(1)}MB`);
        return videoBuffer;
    } finally {
        // Clean up temp file
        try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }
    }
}

// ============================================================
// UPLOAD TO SUPABASE STORAGE
// ============================================================

/**
 * Upload a video buffer to Supabase Storage
 */
export async function uploadVideoToStorage(videoBuffer, userId, jobId) {
    const filePath = `creatives/${userId}/${jobId}.mp4`;

    const { error: uploadError } = await supabaseAdmin.storage
        .from('creative-videos')
        .upload(filePath, videoBuffer, {
            contentType: 'video/mp4',
            upsert: true,
        });

    if (uploadError) {
        console.error('[GeminiVideo] Upload failed:', uploadError.message);
        throw new Error(`Video upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabaseAdmin.storage
        .from('creative-videos')
        .getPublicUrl(filePath);

    console.log('[GeminiVideo] Uploaded to:', urlData.publicUrl);
    return {
        url: urlData.publicUrl,
        bucket: 'creative-videos',
        path: filePath,
    };
}

export default {
    generateVideoWithVeo,
    checkVeoQuota,
    recordVeoUsage,
    uploadVideoToStorage,
    VEO_MODELS,
};
