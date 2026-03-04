/**
 * VIDEO AD GENERATE — Background Function
 * 
 * Netlify background function (15min timeout) for video ad generation.
 * Follows the same architecture as ai-ad-generate-background.js.
 * 
 * Pipeline:
 *   1. Auth + Validation
 *   2. Create job in generated_creatives (media_type: 'video')
 *   3. Deduct credits (dynamic based on quality + duration)
 *   4. Generate script with Gemini Flash
 *   5. Generate video with Veo 3.1
 *   6. Upload to Supabase Storage
 *   7. Update job → complete
 */

import { getUserProfile } from './_shared/auth.js';
import { assertAndConsumeCredits, refundCredits, CREDIT_COSTS } from './_shared/credits.js';
import { supabaseAdmin } from './_shared/clients.js';
import { getCorsHeaders } from './_shared/cors.js';
import { categorizeError } from './_shared/errorCategorizer.js';
import { generateVideoScript, buildVeoPrompt, buildVeoNegativePrompt, getCreditAction } from './_shared/videoAdScriptEngine.js';
import { generateVideoWithVeo, uploadVideoToStorage } from './_shared/geminiVideo.js';
import { getArchetype } from './_shared/videoAdArchetypes.js';
import crypto from 'crypto';

// ============================================================
// VALIDATION
// ============================================================

const VALID_ARCHETYPES = ['product_reveal', 'before_after', 'dynamic_showcase', 'lifestyle_scene', 'social_proof'];
const VALID_DURATIONS = [4, 5, 6, 8];
const VALID_QUALITIES = ['fast', 'premium'];
const VALID_ASPECT_RATIOS = ['16:9', '9:16'];
const VALID_RESOLUTIONS = ['720p', '1080p', '4k'];

const ALLOWED_IMAGE_HOSTS = [
    'res.cloudinary.com', 'cdn.shopify.com', 'images.unsplash.com',
    'supabase.co', 'storage.googleapis.com', 's3.amazonaws.com', 'i.imgur.com',
];

function validateImageUrl(urlString) {
    try {
        const url = new URL(urlString);
        if (url.protocol !== 'https:') return { valid: false, error: 'Only HTTPS URLs allowed' };
        const isAllowed = ALLOWED_IMAGE_HOSTS.some(host => url.hostname.endsWith(host));
        if (!isAllowed) return { valid: false, error: `Host ${url.hostname} not in allowlist` };
        return { valid: true };
    } catch {
        return { valid: false, error: 'Invalid URL format' };
    }
}

// ============================================================
// HANDLER
// ============================================================

export const handler = async (event) => {
    const startTime = Date.now();
    const headers = getCorsHeaders(event);

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    let userId = null;
    let jobId = null;
    let creditAction = null;

    try {
        const body = JSON.parse(event.body || '{}');
        const {
            mode = 'form',
            language = 'de',
            archetypeId = 'product_reveal',
            durationSeconds = 8,
            quality = 'fast',
            aspectRatio = '9:16',
            resolution = '1080p',
            includeAudio = true,
            personGeneration = 'dont_allow',
        } = body;

        // ─── AUTH ───
        const authHeader = event.headers.authorization || event.headers.Authorization;
        const user = await getUserProfile(authHeader);
        if (!user) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }
        userId = user.id;

        // ─── VALIDATION ───
        if (!VALID_ARCHETYPES.includes(archetypeId)) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: `Invalid archetype: ${archetypeId}` }) };
        }
        if (!VALID_DURATIONS.includes(durationSeconds)) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: `Invalid duration: ${durationSeconds}s` }) };
        }
        if (!VALID_QUALITIES.includes(quality)) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: `Invalid quality: ${quality}` }) };
        }

        // SSRF protection for product images
        if (body.productImageUrl) {
            const urlVal = validateImageUrl(body.productImageUrl);
            if (!urlVal.valid) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid image URL', message: urlVal.error }) };
            }
        }

        console.log(`[Video Ad] User: ${user.id.substring(0, 8)}... | ${archetypeId} | ${quality} | ${durationSeconds}s | ${aspectRatio}`);

        // ─── CREATE JOB ───
        jobId = body.jobId || crypto.randomUUID();
        try {
            await supabaseAdmin.from('generated_creatives').insert({
                id: jobId,
                user_id: user.id,
                saved: false,
                media_type: 'video',
                inputs: { mode, language, archetypeId, durationSeconds, quality, aspectRatio, resolution, includeAudio, ...body },
                outputs: null,
                metrics: { status: 'pending', started_at: new Date().toISOString() },
            });
        } catch (jobErr) {
            console.error('[Video Ad] Failed to create job:', jobErr.message);
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to create job' }) };
        }

        // ─── DEDUCT CREDITS ───
        creditAction = getCreditAction(quality, durationSeconds);
        try {
            await assertAndConsumeCredits(user.id, creditAction);
            await updateJob(jobId, { status: 'processing', credits_deducted: true, step: 'credits_deducted' });
        } catch (creditErr) {
            await supabaseAdmin.from('generated_creatives').delete().eq('id', jobId);
            return { statusCode: 402, headers, body: JSON.stringify({ error: 'Insufficient credits', message: creditErr.message }) };
        }

        // ─── PROGRESS HELPER ───
        const updateProgress = async (step, progress, details = {}) => {
            await updateJob(jobId, { status: 'processing', step, progress, ...details });
        };

        // ═══════════════════════════════════════════════════════════
        // STEP 1: GENERATE SCRIPT
        // ═══════════════════════════════════════════════════════════
        await updateProgress('script_generating', 10, { message: 'Video-Script wird generiert...' });

        const productName = body.productName || body.text || 'Produkt';
        const industry = body.industry || 'ecommerce';
        const targetAudience = body.targetAudience || body.audience || 'quality-conscious consumers';
        const usp = body.usp || body.text || '';

        const scriptResult = await generateVideoScript({
            archetypeId,
            productName,
            industry,
            targetAudience,
            usp,
            language,
            durationSeconds,
        });

        console.log(`[Video Ad] Script generated: ${scriptResult.script.scenes.length} scenes, hook: ${scriptResult.hook.id}`);
        await updateProgress('script_complete', 25, { message: 'Script fertig — Video wird generiert...' });

        // ═══════════════════════════════════════════════════════════
        // STEP 2: BUILD VEO PROMPT
        // ═══════════════════════════════════════════════════════════
        const hasProductImage = !!body.productImageUrl || !!body.productImageBase64;

        const veoPrompt = buildVeoPrompt({
            script: scriptResult.script,
            archetype: scriptResult.archetype,
            productName,
            usp,
            aspectRatio,
            includeAudio,
            language,
            hasProductImage,
        });

        const negativePrompt = buildVeoNegativePrompt(archetypeId);
        console.log(`[Video Ad] Veo prompt: ${veoPrompt.length} chars`);

        // ═══════════════════════════════════════════════════════════
        // STEP 3: GENERATE VIDEO WITH VEO
        // ═══════════════════════════════════════════════════════════
        await updateProgress('veo_generating', 30, { message: 'KI generiert dein Video...' });

        // Prepare image if available
        let imageBytes = null;
        if (body.productImageBase64) {
            imageBytes = body.productImageBase64;
        } else if (body.productImageUrl) {
            try {
                const imgRes = await fetch(body.productImageUrl);
                if (imgRes.ok) {
                    const imgBuf = Buffer.from(await imgRes.arrayBuffer());
                    imageBytes = imgBuf.toString('base64');
                }
            } catch (imgErr) {
                console.warn('[Video Ad] Image fetch failed, using text-to-video:', imgErr.message);
            }
        }

        const videoResult = await generateVideoWithVeo({
            prompt: veoPrompt,
            negativePrompt,
            quality,
            aspectRatio,
            resolution,
            durationSeconds: String(durationSeconds),
            personGeneration,
            imageBytes,
            onProgress: (step, progress) => updateProgress(step, progress),
        });

        console.log(`[Video Ad] Video generated: ${(videoResult.videoBuffer.length / 1024 / 1024).toFixed(1)}MB`);

        // ═══════════════════════════════════════════════════════════
        // STEP 4: UPLOAD TO STORAGE
        // ═══════════════════════════════════════════════════════════
        await updateProgress('uploading', 90, { message: 'Video wird gespeichert...' });

        const uploadResult = await uploadVideoToStorage(videoResult.videoBuffer, user.id, jobId);

        // ═══════════════════════════════════════════════════════════
        // STEP 5: SAVE COMPLETE
        // ═══════════════════════════════════════════════════════════
        const generationTime = Date.now() - startTime;

        const outputData = {
            headline: body.headline || body.productName || '',
            slogan: body.subheadline || body.usp || '',
            description: body.text || body.usp || '',
            cta: scriptResult.cta,
            videoUrl: uploadResult.url,
            engine: `veo_${quality}`,
            archetype: archetypeId,
            script: scriptResult.script,
            veoPrompt,
        };

        await supabaseAdmin.from('generated_creatives').update({
            thumbnail: null, // Could generate thumbnail later
            video_url: uploadResult.url,
            video_bucket: uploadResult.bucket,
            video_path: uploadResult.path,
            video_duration_ms: durationSeconds * 1000,
            video_aspect_ratio: aspectRatio,
            video_resolution: resolution,
            video_has_audio: includeAudio,
            video_archetype: archetypeId,
            video_script: scriptResult.script,
            outputs: outputData,
            saved: true,
            metrics: {
                status: 'complete',
                progress: 100,
                engine: `veo_${quality}`,
                generationTime,
                credits_deducted: true,
                completed_at: new Date().toISOString(),
            },
        }).eq('id', jobId);

        console.log(`[Video Ad] ✅ SUCCESS in ${generationTime}ms (${quality}, ${durationSeconds}s)`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                jobId,
                status: 'complete',
                data: {
                    id: jobId,
                    ...outputData,
                    creditsUsed: CREDIT_COSTS[creditAction],
                    mediaType: 'video',
                    durationMs: durationSeconds * 1000,
                    aspectRatio,
                    resolution,
                    hasAudio: includeAudio,
                },
                metadata: { engine: `veo_${quality}`, generationTime, timestamp: Date.now() },
            }),
        };

    } catch (error) {
        console.error('[Video Ad] Error:', error);
        const categorized = categorizeError(error);

        // Refund credits
        if (userId && creditAction) {
            console.log('[Video Ad] 💰 Refunding credits...');
            const refundResult = await refundCredits(userId, creditAction);
            if (refundResult.ok) {
                console.log(`[Video Ad] ✅ Refunded. New balance: ${refundResult.newBalance}`);
            } else {
                console.error('[Video Ad] ⚠️ Refund failed:', refundResult.error);
            }
        }

        // Update job status
        if (jobId) {
            try {
                await supabaseAdmin.from('generated_creatives').update({
                    metrics: {
                        status: 'error',
                        errorCode: categorized.code,
                        errorMessage: categorized.originalMessage,
                        creditsRefunded: !!userId,
                        failed_at: new Date().toISOString(),
                    },
                }).eq('id', jobId);
            } catch (dbErr) {
                console.error('[Video Ad] DB error update failed:', dbErr.message);
            }
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Video generation failed',
                code: categorized.code,
                message: categorized.userMessage,
                recoverable: categorized.recoverable,
            }),
        };
    }
};

// ============================================================
// JOB HELPERS
// ============================================================

async function updateJob(jobId, metricsUpdate) {
    try {
        const { data: existing } = await supabaseAdmin
            .from('generated_creatives')
            .select('metrics')
            .eq('id', jobId)
            .single();

        await supabaseAdmin.from('generated_creatives').update({
            metrics: {
                ...(existing?.metrics || {}),
                ...metricsUpdate,
                last_update: new Date().toISOString(),
            },
        }).eq('id', jobId);
    } catch (err) {
        console.warn('[Video Ad] Progress update failed:', err.message);
    }
}
