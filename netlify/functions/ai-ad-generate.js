/**
 * AI Ad Builder - Background Function
 * Uses Netlify's 15-minute background function timeout
 * Returns immediately with job ID, processes in background
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

export const handler = async (event, context) => {
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

    try {
        const body = JSON.parse(event.body || '{}');
        const { mode, language = 'de' } = body;

        // Authenticate
        const authHeader = event.headers.authorization || event.headers.Authorization;
        const user = await getUserProfile(authHeader);

        if (!user) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }

        // Validate
        if (mode !== 'form' && mode !== 'free') {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid mode' }) };
        }
        if (mode === 'free' && !body.text) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing text' }) };
        }

        console.log('[AI Ad Generate] User:', user.id, 'Mode:', mode);

        // Deduct credits
        const creditCost = CREDIT_COSTS.ai_ad_generate || 10;
        try {
            await assertAndConsumeCredits(user.id, 'ai_ad_generate');
        } catch (creditError) {
            return {
                statusCode: 402,
                headers,
                body: JSON.stringify({ error: 'Insufficient credits', message: creditError.message }),
            };
        }

        // Create job record immediately
        const jobId = crypto.randomUUID();
        await supabaseAdmin.from('generated_creatives').insert({
            id: jobId,
            user_id: user.id,
            saved: false,
            inputs: { mode, language, ...body },
            outputs: null,
            metrics: { status: 'processing', started_at: new Date().toISOString() }
        });

        // Start background processing (don't await)
        processInBackground(jobId, user, body, mode, language, startTime);

        // Return immediately with job ID
        return {
            statusCode: 202,
            headers,
            body: JSON.stringify({
                success: true,
                jobId,
                status: 'processing',
                message: 'Ad generation started. Poll /ai-ad-status?id=' + jobId
            }),
        };

    } catch (error) {
        console.error('[AI Ad Generate] Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to start generation', message: error.message }),
        };
    }
};

/**
 * Background processing function
 */
async function processInBackground(jobId, user, body, mode, language, startTime) {
    try {
        // Build prompts
        let promptData;
        if (mode === 'form') {
            promptData = buildPromptFromForm(body);
        } else {
            promptData = buildPromptFromFreeText(body.text, body.template, language);
        }

        const openai = getOpenAiClient();
        const model = getOpenAiModel();

        // Quality loop
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
                if (attempt === MAX_QUALITY_RETRIES) throw err;
                continue;
            }

            const quality = scoreAdQuality(adCopy);
            qualityScore = quality.score;
            console.log('[AI Ad Generate] Quality:', qualityScore, quality.grade);

            if (quality.passed || attempt === MAX_QUALITY_RETRIES) break;
        }

        // Generate image
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

        // Upload to Storage
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
            throw new Error('Image upload failed: ' + uploadError.message);
        }

        const { data: urlData } = supabaseAdmin.storage
            .from('creative-images')
            .getPublicUrl(storagePath);

        const imageUrl = urlData?.publicUrl;
        console.log('[AI Ad Generate] Image uploaded:', imageUrl);

        // Engagement prediction
        const engagement = predictEngagement(adCopy, body.targetAudience);

        // Update job with results
        await supabaseAdmin.from('generated_creatives').update({
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
            saved: true,
            metrics: {
                status: 'complete',
                qualityScore,
                engagementScore: engagement.score,
                generationTime: Date.now() - startTime,
                completed_at: new Date().toISOString()
            }
        }).eq('id', jobId);

        console.log('[AI Ad Generate] Job complete:', jobId);

    } catch (error) {
        console.error('[AI Ad Generate] Background error:', error);

        // Update job with error
        await supabaseAdmin.from('generated_creatives').update({
            metrics: {
                status: 'error',
                error: error.message,
                failed_at: new Date().toISOString()
            }
        }).eq('id', jobId);
    }
}
