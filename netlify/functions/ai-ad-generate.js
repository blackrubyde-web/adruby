/**
 * AI Ad Builder - Enterprise Main Generation Function
 * Full enterprise support: validation, credit reservation, rate limiting, DB persistence
 */

import { getOpenAiClient, getOpenAiModel, generateHeroImage } from './_shared/openai.js';
import { buildPromptFromForm, buildPromptFromFreeText, enhanceImagePrompt } from './_shared/aiAdPromptBuilder.js';
import { getUserProfile } from './_shared/auth.js';
import { CREDIT_COSTS, reserveCredits, confirmCredits, refundCredits, checkRateLimit } from './_shared/credits.js';
import { supabaseAdmin } from './_shared/clients.js';
import { withRetry } from './_shared/aiAd/retry.js';
import { scoreAdQuality, validateAdContent, predictEngagement } from './_shared/aiAd/quality-scorer.js';
import { adCache } from './_shared/aiAd/cache.js';
import { validateAdRequest } from './_shared/aiAd/schemas.js';

const QUALITY_THRESHOLD = 7;
const MAX_QUALITY_RETRIES = 2;
const ACTION_NAME = 'ai_ad_generate';

export const handler = async (event) => {
    const startTime = Date.now();
    let creditReservation = null;

    // CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        // 1. Parse and validate input with Zod
        let rawBody;
        try {
            rawBody = JSON.parse(event.body || '{}');
        } catch {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid JSON body' }),
            };
        }

        const validation = validateAdRequest(rawBody);
        if (!validation.success) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Validation failed',
                    details: validation.error.details
                }),
            };
        }
        const body = validation.data;
        const { mode, language } = body;

        // 2. Authenticate user
        const authHeader = event.headers.authorization || event.headers.Authorization;
        const user = await getUserProfile(authHeader);

        if (!user) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Unauthorized' }),
            };
        }

        console.log('[AI Ad Generate] Request from user:', user.id, 'mode:', mode);

        // 3. Rate limiting check
        const rateLimit = await checkRateLimit(user.id, ACTION_NAME);
        if (!rateLimit.ok) {
            return {
                statusCode: 429,
                headers,
                body: JSON.stringify({
                    error: 'Rate limit exceeded',
                    reason: rateLimit.reason,
                    retryAfter: rateLimit.resetInSeconds
                }),
            };
        }

        // 4. Reserve credits BEFORE generation
        const creditCost = CREDIT_COSTS[ACTION_NAME];
        try {
            creditReservation = await reserveCredits(user.id, ACTION_NAME);
        } catch (creditError) {
            return {
                statusCode: 402,
                headers,
                body: JSON.stringify({
                    error: 'Insufficient credits',
                    message: creditError.message,
                    required: creditCost,
                    available: user.credits
                }),
            };
        }

        // 5. Build prompts
        let promptData;
        if (mode === 'form') {
            promptData = buildPromptFromForm(body);
        } else {
            promptData = buildPromptFromFreeText(body.text, body.template, language);
        }

        // 6. Check cache
        const cacheKey = adCache.generateKey('ad', {
            mode,
            language,
            template: promptData.template.id,
            input: mode === 'form' ? body.productName : body.text?.substring(0, 50),
        });

        const cached = adCache.get(cacheKey);
        if (cached) {
            console.log('[AI Ad Generate] Cache HIT - returning cached result');
            // Refund credits for cached results
            await refundCredits(creditReservation);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: cached.data,
                    metadata: {
                        ...cached.metadata,
                        cached: true,
                        cacheAge: Date.now() - cached.metadata.timestamp,
                    },
                }),
            };
        }

        const openai = getOpenAiClient();
        const model = getOpenAiModel();

        // 7. Quality loop: retry if quality score too low
        let adCopy;
        let qualityScore;
        let attempt = 0;

        while (attempt < MAX_QUALITY_RETRIES) {
            attempt++;
            console.log(`[AI Ad Generate] Quality attempt ${attempt}/${MAX_QUALITY_RETRIES}`);

            const copyResponse = await withRetry(
                async () => {
                    return await openai.chat.completions.create({
                        model,
                        messages: [
                            { role: 'system', content: promptData.system },
                            { role: 'user', content: promptData.user },
                        ],
                        response_format: { type: 'json_object' },
                        temperature: 0.7 + (attempt * 0.1),
                        max_tokens: 1000,
                    });
                },
                { maxRetries: 3, initialDelay: 1000 }
            );

            adCopy = JSON.parse(copyResponse.choices[0].message.content);

            try {
                validateAdContent(adCopy);
            } catch (err) {
                console.warn('[AI Ad Generate] Invalid structure:', err.message);
                if (attempt === MAX_QUALITY_RETRIES) throw err;
                continue;
            }

            const quality = scoreAdQuality(adCopy);
            qualityScore = quality.score;

            console.log('[AI Ad Generate] Quality score:', qualityScore, 'Issues:', quality.issues);

            if (quality.passed || attempt === MAX_QUALITY_RETRIES) {
                break;
            }

            console.log('[AI Ad Generate] Quality too low, retrying...');
        }

        // 8. Generate image
        const enhancedImagePrompt = enhanceImagePrompt(
            adCopy.imagePrompt || promptData.user,
            promptData.template
        );

        console.log('[AI Ad Generate] Starting image generation');

        const imageResult = await withRetry(
            async () => {
                return await generateHeroImage({
                    prompt: enhancedImagePrompt,
                    size: '1024x1024',
                    quality: 'hd',
                });
            },
            { maxRetries: 2, initialDelay: 2000 }
        );

        // 9. Upload to Supabase Storage
        const timestamp = Date.now();
        const filename = `ai-ad-${user.id}-${timestamp}.png`;
        const storagePath = `ai-ads/${filename}`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from('creative-images')
            .upload(storagePath, Buffer.from(imageResult.b64, 'base64'), {
                contentType: 'image/png',
                upsert: false,
            });

        if (uploadError) {
            console.error('[AI Ad Generate] Upload failed:', uploadError.message);
            throw new Error('Image upload failed: ' + uploadError.message);
        }

        const { data: urlData } = supabaseAdmin.storage
            .from('creative-images')
            .getPublicUrl(storagePath);

        const imageUrl = urlData?.publicUrl;

        console.log('[AI Ad Generate] Image uploaded:', imageUrl);

        // 10. Predict engagement (returns object with score, factors, prediction)
        const engagement = predictEngagement(adCopy, body.targetAudience);
        const engagementScore = engagement.score;

        // 11. Confirm credits (generation successful)
        await confirmCredits(creditReservation);

        // Get quality grade from score
        const quality = scoreAdQuality(adCopy);
        const qualityGrade = quality.grade;

        // 12. Save to database
        const generationRecord = {
            user_id: user.id,
            type: 'ad',
            input: { mode, language, template: body.template, ...body },
            output: {
                headline: adCopy.headline,
                slogan: adCopy.slogan,
                description: adCopy.description,
                cta: adCopy.cta,
                imageUrl,
                imagePrompt: adCopy.imagePrompt,
                qualityGrade,
                engagementFactors: engagement.factors
            },
            quality_score: qualityScore,
            engagement_score: engagementScore,
            credits_used: creditCost,
            template_id: promptData.template.id,
            generation_time_ms: Date.now() - startTime
        };

        const { error: saveError } = await supabaseAdmin
            .from('ai_generations')
            .insert(generationRecord);

        if (saveError) {
            console.error('[AI Ad Generate] DB save failed (non-blocking):', saveError.message);
        }

        // 13. Prepare response
        const result = {
            success: true,
            data: {
                headline: adCopy.headline,
                slogan: adCopy.slogan,
                description: adCopy.description,
                cta: adCopy.cta,
                imageUrl,
                imagePrompt: adCopy.imagePrompt,
                template: promptData.template.id,
                creditsUsed: creditCost,
                qualityScore,
                engagementScore,
            },
            metadata: {
                model,
                timestamp,
                generationTime: Date.now() - startTime,
                cached: false,
            },
        };

        // 14. Cache result if quality is good
        if (qualityScore >= QUALITY_THRESHOLD) {
            adCache.set(cacheKey, result, 3600000);
        }

        console.log('[AI Ad Generate] SUCCESS - Time:', result.metadata.generationTime, 'ms');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result),
        };

    } catch (error) {
        console.error('[AI Ad Generate] Error:', error);

        // REFUND credits on failure
        if (creditReservation) {
            await refundCredits(creditReservation);
            console.log('[AI Ad Generate] Credits refunded due to error');
        }

        // Categorize error
        let errorMessage = 'Ad generation failed';
        let statusCode = 500;

        if (error.message?.includes('rate_limit')) {
            errorMessage = 'Service temporarily busy. Please try again in a moment.';
            statusCode = 429;
        } else if (error.message?.includes('content_policy')) {
            errorMessage = 'Content violates policy guidelines. Please adjust your input.';
            statusCode = 400;
        } else if (error.message?.includes('timeout')) {
            errorMessage = 'Generation took too long. Please try again.';
            statusCode = 504;
        } else if (error.message?.includes('Insufficient credits')) {
            errorMessage = error.message;
            statusCode = 402;
        }

        return {
            statusCode,
            headers,
            body: JSON.stringify({
                error: errorMessage,
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            }),
        };
    }
};
