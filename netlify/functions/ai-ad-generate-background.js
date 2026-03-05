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
import { generateSingleAd as nanoBananaGenerateSingleAd, scoreAdImage, checkAvailability as isGeminiAvailable } from './_shared/adPack/nanoBananaCreativeEngine.js';
import { selectAdaptiveTriple } from './_shared/adPack/adaptiveSelector.js';
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
            // Strip large base64 data from stored inputs to avoid DB bloat
            const { productImageBase64: _strip, ...inputsToStore } = body;
            await supabaseAdmin.from('generated_creatives').insert({
                id: jobId,
                user_id: user.id,
                saved: false,
                inputs: { mode, language, ...inputsToStore },
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
                    let compositeCta = body.cta || '';

                    if (!compositeHeadline) {
                        try {
                            const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                            const langRules = language === 'de'
                                ? 'Write in flawless native German. Use € (Euro) for any prices, NEVER $. Avoid anglicisms (use Angebot not Deal, Vorteil not Benefit). Use correct grammar, umlauts (ä,ö,ü,ß). Sound like a native German copywriter.'
                                : '';
                            const copyPrompt = `Generate professional ad copy in ${language === 'de' ? 'German' : 'English'} for:\nProduct: ${body.productName || 'Product'}\nDescription: ${body.text || body.usp || 'A great product'}\nIndustry: ${body.industry || 'tech'}\nTarget: ${body.targetAudience || 'everyone'}\n${langRules ? '\n' + langRules + '\n' : ''}\nReturn JSON: { "headline": "short catchy headline (2-5 words, professional)", "tagline": "supporting text (1 sentence)", "cta": "call to action (2-4 words)" }`;
                            const copyResponse = await gemini.models.generateContent({
                                model: 'gemini-2.5-flash',
                                contents: copyPrompt,
                                config: { responseMimeType: 'application/json', temperature: 0.7 },
                            });
                            const copyText = copyResponse.candidates?.[0]?.content?.parts?.[0]?.text;
                            const generatedCopy = JSON.parse(copyText);
                            compositeHeadline = generatedCopy.headline || body.productName || 'Jetzt entdecken';
                            compositeTagline = compositeTagline || generatedCopy.tagline || '';
                            compositeCta = generatedCopy.cta || compositeCta;
                        } catch (copyErr) {
                            console.warn('[AI Ad Generate] Copy generation failed:', copyErr.message);
                            compositeHeadline = body.productName || 'Dein Produkt';
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
                        cta: body.cta || '',
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
                        headline: body.headline || body.productName || '',
                        slogan: body.subheadline || '',
                        description: body.text || body.usp || '',
                        cta: body.cta || '',
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

        // ─── ATTEMPT 2: NANOBANANA (AI Creative Director) — MULTI-FORMAT SUPPORT ───
        if (!finalImageBuffer) {
            const requestedFormats = body.formats || [body.format || 'square'];
            const isMultiFormat = requestedFormats.length > 1;

            console.log(`[AI Ad Generate] 🍌 NANOBANANA: ${isMultiFormat ? `Multi-Format (${requestedFormats.join(', ')})` : 'Adaptive Creative Intelligence — 3 Variants'}`);
            await updateProgress('nanoBanana', 40, { engine: 'nanoBanana_v6_adaptive', formats: requestedFormats });

            const funnelStage = body.funnelStage || 'tof';
            const goal = body.goal || 'conversion';

            const makeBaseParams = (fmt) => ({
                productImageUrl: hasProductImage ? body.productImageUrl : null,
                productImageBase64: body.productImageBase64 || null,
                headline: body.headline || body.productName || '',
                subheadline: body.subheadline || body.usp || '',
                cta: body.cta || '',
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
                format: fmt,
                funnelStage,
                goal,
            });

            try {
                let variants = [];

                if (isMultiFormat) {
                    // ── MULTI-FORMAT: 1 variant per format ──
                    console.log(`[AI Ad Generate] 🎨 Multi-format: generating ${requestedFormats.length} format variants`);
                    const formatResults = await Promise.allSettled(
                        requestedFormats.map(fmt => {
                            const triple = selectAdaptiveTriple({ industry: body.industry || 'ecommerce', funnelStage, goal, audience: body.audience, format: fmt });
                            return nanoBananaGenerateSingleAd({ ...makeBaseParams(fmt), _adaptiveConfig: triple[0] })
                                .then(result => ({ ...result, _format: fmt }));
                        })
                    );
                    for (let i = 0; i < formatResults.length; i++) {
                        if (formatResults[i].status === 'fulfilled') variants.push(formatResults[i].value);
                        else console.warn(`[AI Ad Generate] Format ${requestedFormats[i]} failed: ${formatResults[i].reason?.message}`);
                    }
                } else {
                    // ── SINGLE FORMAT: 3 adaptive style variants ──
                    const adFormat = requestedFormats[0];
                    const adaptiveTriple = selectAdaptiveTriple({ industry: body.industry || 'ecommerce', funnelStage, goal, audience: body.audience, format: adFormat });
                    console.log(`[AI Ad Generate] 🧠 Adaptive selection:`, adaptiveTriple.map(v => `${v.meta.archetypeKey} (${v.meta.category}) + ${v.meta.layoutKey} + ${v.meta.hookKey}`));
                    const variantResults = await Promise.allSettled(
                        adaptiveTriple.map(config => nanoBananaGenerateSingleAd({ ...makeBaseParams(adFormat), _adaptiveConfig: config }))
                    );
                    for (let i = 0; i < variantResults.length; i++) {
                        if (variantResults[i].status === 'fulfilled') variants.push({ ...variantResults[i].value, _format: adFormat });
                        else console.warn(`[AI Ad Generate] Variant ${i + 1} failed: ${variantResults[i].reason?.message}`);
                    }
                }

                if (variants.length === 0) {
                    throw new Error(isMultiFormat ? 'All format variants failed' : 'All 3 variants failed');
                }

                // Use first successful variant as primary
                const primary = variants[0];
                finalImageBuffer = primary.buffer;
                engine = `nanoBanana_v5_${primary.engine}`;

                const aiCopy = primary.copy || {};
                outputData = {
                    headline: aiCopy.headline || body.headline || body.productName || '',
                    slogan: aiCopy.tagline || body.subheadline || '',
                    description: aiCopy.hook || body.text || body.usp || '',
                    cta: aiCopy.cta || body.cta || '',
                    includeCta: aiCopy.includeCta !== undefined ? aiCopy.includeCta : !!aiCopy.cta,
                    hook: aiCopy.hook || '',
                    imagePrompt: 'NanoBanana v5.1 AI Creative Director',
                    template: 'nanoBanana_v5',
                    metadata: primary.metadata,
                    variantCount: variants.length,
                    format: primary._format || requestedFormats[0],
                    formats: requestedFormats,
                };

                // Upload additional variant images
                const variantUrls = [];
                for (let i = 1; i < variants.length; i++) {
                    try {
                        const vFilename = `creatives/${user.id}/${jobId}_v${i + 1}.png`;
                        await supabaseAdmin.storage
                            .from('creative-images')
                            .upload(vFilename, variants[i].buffer, { contentType: 'image/png', upsert: true });
                        const { data: vUrlData } = supabaseAdmin.storage.from('creative-images').getPublicUrl(vFilename);
                        variantUrls.push({
                            url: vUrlData.publicUrl,
                            concept: variants[i].metadata?.concept,
                            layout: variants[i].metadata?.layout,
                            format: variants[i]._format,
                        });
                    } catch (vErr) {
                        console.warn(`[AI Ad Generate] Variant ${i + 1} upload failed: ${vErr.message}`);
                    }
                }
                if (variantUrls.length > 0) {
                    outputData.variants = variantUrls;
                }

                // Score primary image with Gemini Vision
                try {
                    const qualityScore = await scoreAdImage(finalImageBuffer);
                    outputData.qualityScore = qualityScore;
                } catch (scoreErr) {
                    console.warn(`[AI Ad Generate] Scoring skipped: ${scoreErr.message}`);
                }

                console.log(`[AI Ad Generate] ✅ NanoBanana: ${variants.length}/${isMultiFormat ? requestedFormats.length + ' formats' : '3 variants'} generated`);
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
            // Fallback: convert buffer to base64 data URL so the image still displays
            try {
                const base64 = Buffer.from(finalImageBuffer).toString('base64');
                imageUrl = `data:image/png;base64,${base64}`;
                console.log('[AI Ad Generate] Using base64 fallback for image display');
            } catch (b64Err) {
                console.error('[AI Ad Generate] Base64 fallback also failed:', b64Err.message);
            }
        }

        const generationTime = Date.now() - startTime;

        // Save to DB
        await supabaseAdmin.from('generated_creatives').update({
            thumbnail: imageUrl || null,
            image_url: imageUrl || null,
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
