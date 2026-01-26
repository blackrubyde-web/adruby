/**
 * AI Ad Builder - Full Generation (Text + Image)
 * Synchronous version that works within Netlify timeout limits
 * Uses existing AdRuby credit system
 */

import { getOpenAiClient, getOpenAiModel, generateHeroImage } from './_shared/openai.js';
import { buildPromptFromForm, buildPromptFromFreeText, enhanceImagePrompt } from './_shared/aiAdPromptBuilder.js';
import { getUserProfile } from './_shared/auth.js';
import { assertAndConsumeCredits, CREDIT_COSTS } from './_shared/credits.js';
import { supabaseAdmin } from './_shared/clients.js';
import { withRetry } from './_shared/aiAd/retry.js';
import { scoreAdQuality, validateAdContent, predictEngagement } from './_shared/aiAd/quality-scorer.js';

const QUALITY_THRESHOLD = 7;
const MAX_QUALITY_RETRIES = 2;

export const handler = async (event) => {
    const startTime = Date.now();

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
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    return {
        statusCode: 410,
        headers,
        body: JSON.stringify({
            error: 'Foreplay-only pipeline enabled',
            message: 'Use ai-ad-generate-background (Foreplay pipeline) for ad generation.'
        }),
    };

    try {
        // 1. Parse body
        const body = JSON.parse(event.body || '{}');
        const { mode, language = 'de' } = body;

        // 2. Authenticate
        const authHeader = event.headers.authorization || event.headers.Authorization;
        const user = await getUserProfile(authHeader);

        if (!user) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }

        // 3. Validate input
        if (mode !== 'form' && mode !== 'free') {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid mode (form or free)' }) };
        }
        if (mode === 'free' && !body.text) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing text for free mode' }) };
        }

        console.log('[AI Ad Generate] User:', user.id, 'Mode:', mode);

        // 4. Deduct credits FIRST using atomic credit system
        const creditCost = CREDIT_COSTS.ai_ad_generate || 10;
        try {
            await assertAndConsumeCredits(user.id, 'ai_ad_generate');
        } catch (creditError) {
            return {
                statusCode: 402,
                headers,
                body: JSON.stringify({
                    error: 'Insufficient credits',
                    message: creditError.message,
                    required: creditCost
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

        const openai = getOpenAiClient();
        const model = getOpenAiModel();

        // 6. Generate ad copy with quality loop
        let adCopy;
        let qualityScore;
        let attempt = 0;

        while (attempt < MAX_QUALITY_RETRIES) {
            attempt++;
            console.log(`[AI Ad Generate] Quality attempt ${attempt}/${MAX_QUALITY_RETRIES}`);

            const copyResponse = await withRetry(
                async () => openai.chat.completions.create({
                    model,
                    messages: [
                        { role: 'system', content: promptData.system },
                        { role: 'user', content: promptData.user },
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.7 + (attempt * 0.1),
                    max_tokens: 1000,
                }),
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
            console.log('[AI Ad Generate] Quality:', qualityScore, quality.grade);

            if (quality.passed || attempt === MAX_QUALITY_RETRIES) break;
        }

        // 7. Generate image with DALL-E 3
        const imagePrompt = enhanceImagePrompt(
            adCopy.imagePrompt || promptData.user,
            promptData.template
        );

        console.log('[AI Ad Generate] Generating image...');

        const imageResult = await withRetry(
            async () => generateHeroImage({
                prompt: imagePrompt,
                size: '1024x1024',
                quality: 'hd',
            }),
            { maxRetries: 2, initialDelay: 2000 }
        );

        // 8. Upload to Supabase Storage
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
            throw new Error('Image upload failed');
        }

        const { data: urlData } = supabaseAdmin.storage
            .from('creative-images')
            .getPublicUrl(storagePath);

        const imageUrl = urlData?.publicUrl;
        console.log('[AI Ad Generate] Image uploaded:', imageUrl);

        // 9. Calculate engagement
        const engagement = predictEngagement(adCopy, body.targetAudience);

        // 10. Save to Creative Library (generated_creatives table)
        const creativePayload = {
            user_id: user.id,
            thumbnail: imageUrl,
            outputs: {
                headline: adCopy.headline,
                slogan: adCopy.slogan,
                description: adCopy.description,
                cta: adCopy.cta,
                imageUrl,
                imagePrompt: adCopy.imagePrompt,
                qualityScore,
                engagementScore: engagement.score,
                source: 'ai_ad_builder'
            },
            inputs: {
                mode,
                language,
                template: body.template || promptData.template.id,
                ...body
            },
            saved: true,
            metrics: {
                status: 'complete',
                qualityScore,
                engagementScore: engagement.score,
                generationTime: Date.now() - startTime,
                completed_at: new Date().toISOString()
            }
        };

        const { data: savedCreative, error: saveError } = await supabaseAdmin
            .from('generated_creatives')
            .insert(creativePayload)
            .select('id')
            .single();

        if (saveError) {
            console.error('[AI Ad Generate] Library save failed:', saveError.message);
        } else {
            console.log('[AI Ad Generate] Saved to Creative Library:', savedCreative?.id);
        }

        // 11. Build response
        const result = {
            success: true,
            data: {
                id: savedCreative?.id,
                headline: adCopy.headline,
                slogan: adCopy.slogan,
                description: adCopy.description,
                cta: adCopy.cta,
                imageUrl,
                imagePrompt: adCopy.imagePrompt,
                template: promptData.template.id,
                creditsUsed: creditCost,
                qualityScore,
                engagementScore: engagement.score,
            },
            metadata: {
                model,
                timestamp,
                generationTime: Date.now() - startTime,
                savedToLibrary: !saveError,
            },
        };

        console.log('[AI Ad Generate] SUCCESS in', result.metadata.generationTime, 'ms');

        return { statusCode: 200, headers, body: JSON.stringify(result) };

    } catch (error) {
        console.error('[AI Ad Generate] Error:', error);

        let errorMessage = 'Ad generation failed';
        let statusCode = 500;

        if (error.message?.includes('rate_limit')) {
            errorMessage = 'Service busy. Try again.';
            statusCode = 429;
        } else if (error.message?.includes('content_policy')) {
            errorMessage = 'Content violates policy.';
            statusCode = 400;
        } else if (error.message?.includes('timeout')) {
            errorMessage = 'Generation timeout. Try again.';
            statusCode = 504;
        }

        return {
            statusCode,
            headers,
            body: JSON.stringify({ error: errorMessage, message: error.message }),
        };
    }
};
