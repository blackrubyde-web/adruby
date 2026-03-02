/**
 * Generate Ad Pack — Background Function
 * 
 * Netlify automatically handles this as background due to -background suffix.
 * Runs with 15min timeout, returns 202 on completion.
 * 
 * Generates a complete "done-for-you" Meta ad pack:
 *   - 54 copy variants (12 primary texts, 12 headlines, 12 descriptions, 6 CTAs, 6 UGC, 6 DR)
 *   - 9 creative images (3 concepts × 3 formats: 1:1, 4:5, 9:16)
 *   - Meta-compliant structured JSON output
 *   - Automated QA gate
 * 
 * Does NOT modify the existing ai-ad-generate-background.js.
 */

import { getUserProfile } from './_shared/auth.js';
import { assertAndConsumeCredits, refundCredits } from './_shared/credits.js';
import { supabaseAdmin } from './_shared/clients.js';
import { checkRateLimit } from './_shared/rateLimiter.js';
import { categorizeError, getUserMessage } from './_shared/errorCategorizer.js';
import { runPipeline } from './_shared/adPack/adPipelineOrchestrator.js';
import { getCorsHeaders } from './_shared/cors.js';
import crypto from 'crypto';

// Credit cost for ad pack generation
const AD_PACK_CREDIT_COST = parseInt(process.env.AD_PACK_CREDIT_COST || '40', 10);
const CREDIT_FEATURE_NAME = 'generate_ad_pack';

export const handler = async (event) => {
    const startTime = Date.now();

    const headers = getCorsHeaders(event);

    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    let packId = null;
    let user = null;
    let creditsDeducted = false;

    try {
        const body = JSON.parse(event.body || '{}');

        // ══ AUTH ══
        const authHeader = event.headers.authorization || event.headers.Authorization;
        user = await getUserProfile(authHeader);
        if (!user) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }

        console.log(`[AdPack] User: ${user.id.substring(0, 8)}... Request received`);

        // ══ RATE LIMIT ══
        const rateLimitResult = await checkRateLimit(user.id, 'generate_ad_pack');
        if (!rateLimitResult.allowed) {
            return {
                statusCode: 429,
                headers: {
                    ...headers,
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
                },
                body: JSON.stringify({
                    error: 'Rate limit exceeded',
                    message: 'Zu viele Anfragen. Bitte warte einen Moment.',
                    resetAt: rateLimitResult.resetAt.toISOString(),
                }),
            };
        }

        // ══ VALIDATE INPUT ══
        const adSpec = {
            offer: body.offer,
            audience: body.audience,
            angle: body.angle || '',
            brandKit: body.brandKit || {},
            proof: body.proof || '',
            industry: body.industry || body.constraints?.industry || 'general',
            language: body.constraints?.language || body.language || 'de',
            usp: body.usp || '',
            description: body.description || '',
            text: body.text || '',
            constraints: {
                niche: body.constraints?.niche || body.niche || 'general',
                language: body.constraints?.language || body.language || 'de',
                tone: body.constraints?.tone || body.tone || 'professional',
            },
            productImageUrl: body.productImageUrl || null,
            productName: body.productName || null,
        };

        // ══ CREATE PACK RECORD ══
        packId = body.packId || crypto.randomUUID();
        try {
            await supabaseAdmin.from('ad_creative_packs').insert({
                id: packId,
                user_id: user.id,
                status: 'pending',
                ad_spec: adSpec,
                credits_used: AD_PACK_CREDIT_COST,
            });
        } catch (dbErr) {
            console.error('[AdPack] Failed to create pack record:', dbErr.message);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Failed to create job', message: 'Please try again' }),
            };
        }

        // ══ DEDUCT CREDITS ══
        try {
            await assertAndConsumeCredits(user.id, CREDIT_FEATURE_NAME);
            creditsDeducted = true;

            await supabaseAdmin.from('ad_creative_packs').update({
                status: 'processing',
            }).eq('id', packId);
        } catch (creditErr) {
            // Cleanup pack record
            await supabaseAdmin.from('ad_creative_packs').delete().eq('id', packId);
            return {
                statusCode: 402,
                headers,
                body: JSON.stringify({ error: 'Insufficient credits', message: creditErr.message }),
            };
        }

        console.log(`[AdPack] Pack ${packId}: Credits deducted, starting pipeline...`);

        // ══ PROGRESS UPDATE HELPER ══
        const onProgress = async (step, progress, details = {}) => {
            try {
                const { data: existing } = await supabaseAdmin
                    .from('ad_creative_packs')
                    .select('status')
                    .eq('id', packId)
                    .single();

                // Don't overwrite terminal states
                if (existing?.status === 'complete' || existing?.status === 'error') return;

                await supabaseAdmin.from('ad_creative_packs').update({
                    status: 'processing',
                    // Store progress in ad_spec temporarily (reusing JSON column)
                    ad_spec: {
                        ...adSpec,
                        _progress: { step, progress, ...details, last_update: new Date().toISOString() },
                    },
                }).eq('id', packId);
            } catch {
                // Progress updates are best-effort
            }
        };

        // ══ RUN PIPELINE ══
        const result = await runPipeline({
            adSpec,
            userId: user.id,
            packId,
            onProgress,
        });

        const duration = Date.now() - startTime;
        console.log(`[AdPack] ✅ Pack ${packId} complete in ${(duration / 1000).toFixed(1)}s`);

        return {
            statusCode: 202,
            headers,
            body: JSON.stringify({
                success: true,
                packId,
                status: 'complete',
                data: result.adPack,
                pipeline: result._pipeline,
                metadata: {
                    duration,
                    timestamp: Date.now(),
                    creditsUsed: AD_PACK_CREDIT_COST,
                },
            }),
        };

    } catch (err) {
        console.error(`[AdPack] ❌ Error:`, err.message);
        console.error(`[AdPack] Stack:`, err.stack);

        // Refund credits on failure
        if (creditsDeducted && user) {
            try {
                await refundCredits(user.id, CREDIT_FEATURE_NAME);
                console.log(`[AdPack] 💰 Credits refunded for user ${user.id.substring(0, 8)}...`);
            } catch (refundErr) {
                console.error('[AdPack] ❌ Credit refund failed:', refundErr.message);
            }
        }

        // Update pack record with error
        if (packId) {
            await supabaseAdmin.from('ad_creative_packs').update({
                status: 'error',
                error: err.message,
            }).eq('id', packId).catch(() => { });
        }

        const categorized = categorizeError(err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: categorized.type || 'generation_failed',
                message: getUserMessage(err) || 'Ad pack generation failed. Credits have been refunded.',
                packId,
            }),
        };
    }
};
