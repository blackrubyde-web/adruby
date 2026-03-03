/**
 * AI Ad Builder - Background Function
 * Netlify automatically handles this as background due to -background suffix
 * The entire handler runs with 15min timeout, returns 202 on completion
 *
 * ARCHITECTURE (v3.1 — 100% Gemini):
 *   1. Railway Composite v6 (product image) or Railway v3 (no product image)
 *   2. NanoBanana v5.1 AI Creative Director (Gemini 2.5 Flash Image)
 *   3. Error → refund credits
 */

import { getUserProfile } from './_shared/auth.js';
import { assertAndConsumeCredits, refundCredits, CREDIT_COSTS } from './_shared/credits.js';
import { supabaseAdmin } from './_shared/clients.js';
import { withRetry } from './_shared/aiAd/retry.js';
import { checkRateLimit } from './_shared/rateLimiter.js';
import { categorizeError, getUserMessage } from './_shared/errorCategorizer.js';
import { generateWithAIDesign, generateWithCompositeAsync, isForeplayAvailable } from './_shared/railwayImageClient.js';
import { getCorsHeaders } from './_shared/cors.js';
import { generateSingleAd as nanoBananaGenerateSingleAd, checkAvailability as isGeminiAvailable } from './_shared/adPack/nanoBananaCreativeEngine.js';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';

const ALLOWED_IMAGE_HOSTS = [
    'res.cloudinary.com',
    'cdn.shopify.com',
    'images.unsplash.com',
    'supabase.co',
    'storage.googleapis.com',
    's3.amazonaws.com',
    'i.imgur.com',
];

// Validate image URL to prevent SSRF attacks
function validateImageUrl(urlString) {
    try {
        const url = new URL(urlString);
        if (url.protocol !== 'https:') {
            return { valid: false, error: 'Only HTTPS URLs allowed' };
        }
        const isAllowed = ALLOWED_IMAGE_HOSTS.some(host => url.hostname.endsWith(host));
        if (!isAllowed) {
            return { valid: false, error: `Host ${url.hostname} not in allowlist` };
        }
        return { valid: true };
    } catch {
        return { valid: false, error: 'Invalid URL format' };
    }
}

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

    try {
        const body = JSON.parse(event.body || '{}');
        const { mode, language = 'de', strictReplica = true } = body;

        // ─── AUTH ───
        const authHeader = event.headers.authorization || event.headers.Authorization;
        const user = await getUserProfile(authHeader);
        if (!user) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }
        userId = user.id;

        // ─── VALIDATION ───
        if (mode !== 'form' && mode !== 'free') {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid mode' }) };
        }
        if (mode === 'free' && !body.text) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing text' }) };
        }

        // SSRF protection
        if (body.productImageUrl) {
            const urlValidation = validateImageUrl(body.productImageUrl);
            if (!urlValidation.valid) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid image URL', message: urlValidation.error }) };
            }
        }

        console.log('[AI Ad Generate] User:', user.id.substring(0, 8) + '...', 'Mode:', mode);

        // ─── RATE LIMITING ───
        const rateLimitResult = await checkRateLimit(user.id, 'ai_ad_generate');
        if (!rateLimitResult.allowed) {
            return {
                statusCode: 429,
                headers: { ...headers, 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString() },
                body: JSON.stringify({ error: 'Rate limit exceeded', message: 'Zu viele Anfragen. Bitte warte einen Moment.', resetAt: rateLimitResult.resetAt.toISOString() }),
            };
        }

        // ─── CREATE JOB RECORD ───
        jobId = body.jobId || crypto.randomUUID();
        try {
            await supabaseAdmin.from('generated_creatives').insert({
                id: jobId,
                user_id: user.id,
                saved: false,
                inputs: { mode, language, ...body },
                outputs: null,
                metrics: { status: 'pending', started_at: new Date().toISOString() },
            });
        } catch (jobError) {
            console.error('[AI Ad Generate] Failed to create job:', jobError.message);
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to create job' }) };
        }

        // ─── DEDUCT CREDITS ───
        try {
            await assertAndConsumeCredits(user.id, 'ai_ad_generate');
            await supabaseAdmin.from('generated_creatives').update({
                metrics: { status: 'processing', credits_deducted: true, started_at: new Date().toISOString() },
            }).eq('id', jobId);
        } catch (creditError) {
            await supabaseAdmin.from('generated_creatives').delete().eq('id', jobId);
            return { statusCode: 402, headers, body: JSON.stringify({ error: 'Insufficient credits', message: creditError.message }) };
        }

        // ─── PROGRESS HELPER ───
        const updateProgress = async (step, progress, details = {}) => {
            try {
                const { data: existing } = await supabaseAdmin
                    .from('generated_creatives')
                    .select('metrics')
                    .eq('id', jobId)
                    .single();

                await supabaseAdmin.from('generated_creatives').update({
                    metrics: {
                        ...(existing?.metrics || {}),
                        status: 'processing',
                        step,
                        progress,
                        ...details,
                        last_update: new Date().toISOString(),
                    },
                }).eq('id', jobId);
            } catch (err) {
                console.warn('[AI Ad Generate] Progress update failed:', err.message);
            }
        };

        const hasProductImage = !!body.productImageUrl || !!body.productImageBase64;

        // ═══════════════════════════════════════════════════════════════
        // PIPELINE: Try Railway → NanoBanana (Gemini) → Error
        // ═══════════════════════════════════════════════════════════════

        let finalImageBuffer = null;
        let outputData = null;
        let engine = 'unknown';

        // ─── ATTEMPT 1: RAILWAY ───
        const foreplayAvailable = await isForeplayAvailable();

        if (foreplayAvailable) {
            try {
                if (hasProductImage) {
                    // Railway Composite v6 (product image)
                    console.log('[AI Ad Generate] 🎨 RAILWAY COMPOSITE v6');
                    await updateProgress('composite_v6', 10, { engine: 'railway_composite_v6' });

                    // Generate copy if not provided
                    let compositeHeadline = body.headline;
                    let compositeTagline = body.subheadline || body.usp;
                    let compositeCta = body.cta || 'Jetzt entdecken';

                    if (!compositeHeadline) {
                        try {
                            const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                            const copyPrompt = `Generate ad copy in ${language === 'de' ? 'German' : 'English'} for:\nProduct: ${body.productName || 'Product'}\nDescription: ${body.text || body.usp || 'A great product'}\nIndustry: ${body.industry || 'tech'}\nTarget: ${body.targetAudience || 'everyone'}\n\nReturn JSON: { "headline": "short catchy headline", "tagline": "supporting text", "cta": "call to action" }`;
                            const copyResponse = await gemini.models.generateContent({
                                model: 'gemini-2.5-flash',
                                contents: copyPrompt,
                                config: { responseMimeType: 'application/json', temperature: 0.7 },
                            });
                            const copyText = copyResponse.candidates?.[0]?.content?.parts?.[0]?.text;
                            const generatedCopy = JSON.parse(copyText);
                            compositeHeadline = generatedCopy.headline || body.productName || 'Discover More';
                            compositeTagline = compositeTagline || generatedCopy.tagline || '';
                            compositeCta = generatedCopy.cta || compositeCta;
                        } catch (copyErr) {
                            console.warn('[AI Ad Generate] Copy generation failed:', copyErr.message);
                            compositeHeadline = body.productName || 'Your Product';
                        }
                    }

                    await updateProgress('composite_generating', 30);

                    const compositeResult = await generateWithCompositeAsync({
                        productImageBase64: body.productImageBase64 || null,
                        productImageUrl: body.productImageUrl,
                        headline: compositeHeadline,
                        tagline: compositeTagline,
                        cta: compositeCta,
                        userPrompt: body.text || `${body.productName || 'Product'} advertisement`,
                        industry: body.industry || 'tech',
                        accentColor: body.accentColor || '#FF4757',
                        strictReplica,
                    });

                    if (!compositeResult.imageBuffer) throw new Error('Composite returned no image');

                    finalImageBuffer = compositeResult.imageBuffer;
                    engine = 'railway_composite_v6';

                    const composition = compositeResult.metadata?.compositionPlan;
                    outputData = {
                        headline: composition?.headline?.text || body.headline || compositeHeadline,
                        slogan: composition?.subheadline?.text || body.subheadline || compositeTagline || '',
                        tagline: composition?.subheadline?.text || body.subheadline || compositeTagline || '',
                        cta: composition?.cta?.text || body.cta || compositeCta,
                        description: body.text || body.usp || '',
                        template: 'composite_v6',
                        quality: compositeResult.metadata?.qualityScore || null,
                        metadata: compositeResult.metadata || {},
                    };

                } else {
                    // Railway v3 AI Design (no product image)
                    console.log('[AI Ad Generate] 🚀 RAILWAY v3 AI DESIGN');
                    await updateProgress('railway_v3', 10, { engine: 'railway_v3' });

                    const railwayResult = await generateWithAIDesign({
                        productImageBase64: body.productImageBase64,
                        productImageUrl: body.productImageUrl,
                        headline: body.headline,
                        tagline: body.subheadline || body.usp,
                        cta: body.cta || 'Jetzt entdecken',
                        userPrompt: body.text || `${body.productName || 'Product'} advertisement`,
                        industry: body.industry || 'tech',
                        accentColor: body.accentColor || '#FF4757',
                        enableQualityCheck: true,
                        enableAIContent: true,
                        enableAdvancedEffects: true,
                    });

                    if (!railwayResult.imageBuffer) throw new Error('Railway returned no image');

                    finalImageBuffer = railwayResult.imageBuffer;
                    engine = 'railway_v3_ai_design';
                    outputData = {
                        headline: body.headline || 'AI Generated',
                        slogan: body.subheadline || '',
                        description: body.text || body.usp || '',
                        cta: body.cta || 'Jetzt entdecken',
                        imagePrompt: railwayResult.imagePrompt,
                        template: 'ai_design_system_v3',
                        metadata: {
                            foreplayReferences: railwayResult.metadata?.referenceCount || 0,
                            composition: railwayResult.metadata?.composition,
                        },
                    };
                }

                console.log(`[AI Ad Generate] ✅ Railway success (${engine})`);
            } catch (railwayErr) {
                console.warn(`[AI Ad Generate] ⚠️ Railway failed: ${railwayErr.message}`);
                await updateProgress('railway_failed', 20, { error: railwayErr.message });
                // Fall through to Gemini/OpenAI fallback
            }
        } else {
            console.log('[AI Ad Generate] ⚠️ Railway/Foreplay unavailable, using fallback pipeline');
        }

        // ─── ATTEMPT 2: NANOBANANA (AI Creative Director) ───
        if (!finalImageBuffer) {
            console.log('[AI Ad Generate] 🍌 NANOBANANA: AI Creative Director');
            await updateProgress('nanoBanana', 40, { engine: 'nanoBanana_v5' });

            try {
                const nbResult = await nanoBananaGenerateSingleAd({
                    productImageUrl: hasProductImage ? body.productImageUrl : null,
                    headline: body.headline || body.productName || 'Discover',
                    subheadline: body.subheadline || body.usp || '',
                    cta: body.cta,
                    productName: body.productName,
                    offer: body.text || body.usp || body.productName || 'Premium Product',
                    audience: body.audience || 'quality-conscious consumers',
                    industry: body.industry || 'ecommerce_general',
                    angle: body.angle || '',
                    language: body.language || 'de',
                    usp: body.usp || '',
                    description: body.description || '',
                    text: body.text || '',
                    brandKit: body.brandKit,
                    format: 'square',
                });

                finalImageBuffer = nbResult.buffer;
                engine = `nanoBanana_v5_${nbResult.engine}`;

                // Use AI-generated copy if available, fallback to user input
                const aiCopy = nbResult.copy || {};
                outputData = {
                    headline: aiCopy.headline || body.headline || body.productName || 'AI Generated',
                    slogan: aiCopy.tagline || body.subheadline || '',
                    description: aiCopy.hook || body.text || body.usp || '',
                    cta: aiCopy.cta || body.cta || (body.language === 'en' ? 'Discover Now' : 'Jetzt entdecken'),
                    hook: aiCopy.hook || '',
                    imagePrompt: 'NanoBanana v5.1 AI Creative Director',
                    template: 'nanoBanana_v5',
                    metadata: nbResult.metadata,
                };

                console.log(`[AI Ad Generate] ✅ NanoBanana success (${nbResult.engine}, AI brief: ${nbResult.usedAiBrief})`);
            } catch (nbErr) {
                console.warn(`[AI Ad Generate] ⚠️ NanoBanana failed: ${nbErr.message}`);
                await updateProgress('nanoBanana_failed', 60, { error: nbErr.message });
            }
        }

        // No more OpenAI fallback — NanoBanana (Gemini) is the final attempt
        if (!finalImageBuffer) {
            throw new Error('All generation pipelines failed — no image produced');
        }

        // ═══════════════════════════════════════════════════════════════
        // UPLOAD & SAVE
        // ═══════════════════════════════════════════════════════════════

        const filename = `creatives/${user.id}/${jobId}.png`;
        const { error: uploadError } = await supabaseAdmin.storage
            .from('creative-images')
            .upload(filename, finalImageBuffer, { contentType: 'image/png', upsert: true });

        let imageUrl = null;
        if (!uploadError) {
            const { data: urlData } = supabaseAdmin.storage.from('creative-images').getPublicUrl(filename);
            imageUrl = urlData.publicUrl;
        } else {
            console.error('[AI Ad Generate] Upload error:', uploadError.message);
        }

        const generationTime = Date.now() - startTime;

        // Save to DB
        await supabaseAdmin.from('generated_creatives').update({
            thumbnail: imageUrl || null,
            outputs: {
                ...outputData,
                imageUrl: imageUrl,
                imageDataUrl: imageUrl,
                thumbnailUrl: imageUrl,
                engine,
            },
            saved: true,
            metrics: {
                status: 'complete',
                progress: 100,
                engine,
                generationTime,
                credits_deducted: true,
                completed_at: new Date().toISOString(),
            },
        }).eq('id', jobId);

        console.log(`[AI Ad Generate] ✅ SUCCESS in ${generationTime}ms (engine: ${engine})`);

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
                    imageUrl,
                    creditsUsed: CREDIT_COSTS.ai_ad_generate,
                },
                metadata: { engine, generationTime, timestamp: Date.now() },
            }),
        };

    } catch (error) {
        console.error('[AI Ad Generate] Error:', error);
        const categorized = categorizeError(error);

        // Refund credits
        if (userId) {
            console.log('[AI Ad Generate] 💰 Refunding credits...');
            const refundResult = await refundCredits(userId, 'ai_ad_generate');
            if (refundResult.ok) {
                console.log(`[AI Ad Generate] ✅ Refunded. New balance: ${refundResult.newBalance}`);
            } else {
                console.error('[AI Ad Generate] ⚠️ Refund failed:', refundResult.error);
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
                console.error('[AI Ad Generate] DB error update failed:', dbErr.message);
            }
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Ad generation failed',
                code: categorized.code,
                message: categorized.userMessage,
                recoverable: categorized.recoverable,
            }),
        };
    }
};
