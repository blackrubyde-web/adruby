/**
 * AI Ad Builder - Background Function
 * Netlify automatically handles this as background due to -background suffix
 * The entire handler runs with 15min timeout, returns 202 on completion
 */

import { getOpenAiClient, getOpenAiModel, generateHeroImage } from './_shared/openai.js';
import { buildPromptFromForm, buildPromptFromFreeText, enhanceImagePrompt } from './_shared/aiAdPromptBuilder.js';
import { getUserProfile } from './_shared/auth.js';
import { assertAndConsumeCredits, CREDIT_COSTS } from './_shared/credits.js';
import { supabaseAdmin } from './_shared/clients.js';
import { withRetry } from './_shared/aiAd/retry.js';
import { scoreAdQuality, validateAdContent, predictEngagement } from './_shared/aiAd/quality-scorer.js';

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
        try {
            await assertAndConsumeCredits(user.id, 'ai_ad_generate');
        } catch (creditError) {
            return {
                statusCode: 402,
                headers,
                body: JSON.stringify({ error: 'Insufficient credits', message: creditError.message }),
            };
        }

        // Create job record using client-provided jobId or generate new one
        const jobId = body.jobId || crypto.randomUUID();
        await supabaseAdmin.from('generated_creatives').insert({
            id: jobId,
            user_id: user.id,
            saved: false,
            inputs: { mode, language, ...body },
            outputs: null,
            metrics: { status: 'processing', started_at: new Date().toISOString() }
        });

        console.log('[AI Ad Generate] Job created:', jobId);

        // Vision Analysis for Product Preservation
        let visionDescription = '';
        if (body.productImageUrl) {
            console.log('[AI Ad Generate] Analyzing product image:', body.productImageUrl);
            try {
                const visionResponse = await getOpenAiClient().chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert product photographer. Analyze the product in this image in EXTREME detail for a DALL-E 3 prompt. Focus ONLY on the product (shape, materials, colors, logos, textures). Ignore the background. Output a dense, comma-separated visual description.'
                        },
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: 'Describe the main product:' },
                                { type: 'image_url', image_url: { url: body.productImageUrl } }
                            ]
                        }
                    ],
                    max_tokens: 300
                });
                visionDescription = visionResponse.choices[0].message.content;
                console.log('[AI Ad Generate] Vision description:', visionDescription.substring(0, 50) + '...');
            } catch (err) {
                console.error('[AI Ad Generate] Vision analysis failed:', err);
                // Continue without vision
            }
        }

        // Build prompts (incorporating vision data)
        let promptData;
        const enrichedBody = { ...body };

        // Inject vision description into product inputs
        if (visionDescription) {
            if (mode === 'form') {
                enrichedBody.productName = `${body.productName || 'Product'} (${visionDescription})`;
            } else {
                enrichedBody.text = `${body.text}. Visual Product Description: ${visionDescription}`;
            }
        }

        if (mode === 'form') {
            promptData = buildPromptFromForm(enrichedBody);
        } else {
            promptData = buildPromptFromFreeText(enrichedBody.text, enrichedBody.template, language);
        }

        // Override user prompt in promptData if vision description exists to enforce product look
        if (visionDescription) {
            // We ensure the image prompt strictly uses the vision description
            promptData.user += `\n\nCRITICAL VISUAL REQUIREMENT: The product in the image MUST look exactly like this: ${visionDescription}`;
        }

        const openai = getOpenAiClient();
        const model = getOpenAiModel();

        // Quality loop for copy generation
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

        const generationTime = Date.now() - startTime;
        console.log('[AI Ad Generate] SUCCESS in', generationTime, 'ms');

        // Background functions return 202 automatically
        // But we still return the result for the status endpoint
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                jobId,
                status: 'complete',
                data: {
                    id: jobId,
                    headline: adCopy.headline,
                    slogan: adCopy.slogan,
                    description: adCopy.description,
                    cta: adCopy.cta,
                    imageUrl,
                    qualityScore,
                    engagementScore: engagement.score,
                },
                metadata: {
                    model,
                    timestamp,
                    generationTime,
                    savedToLibrary: true,
                }
            }),
        };

    } catch (error) {
        console.error('[AI Ad Generate] Error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Ad generation failed',
                message: error.message
            }),
        };
    }
};
