/**
 * AI Ad Refine — Edit existing ads with a modification prompt
 * 
 * Takes an existing generated ad image and a user's refinement prompt,
 * uses Gemini 2.5 Flash Image (image-to-image) to apply the changes.
 * Costs 1 credit per refinement.
 */

import { getUserProfile } from './_shared/auth.js';
import { assertAndConsumeCredits, refundCredits, CREDIT_COSTS } from './_shared/credits.js';
import { supabaseAdmin } from './_shared/clients.js';
import { checkRateLimit } from './_shared/rateLimiter.js';
import { getCorsHeaders } from './_shared/cors.js';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';

const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';

export const handler = async (event) => {
    const headers = getCorsHeaders(event);

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    let userId = null;

    try {
        const body = JSON.parse(event.body || '{}');
        const { jobId, refinementPrompt, language = 'de' } = body;

        // ─── AUTH ───
        const authHeader = event.headers.authorization || event.headers.Authorization;
        const user = await getUserProfile(authHeader);
        if (!user) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }
        userId = user.id;

        // ─── VALIDATION ───
        if (!jobId) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing jobId' }) };
        }
        if (!refinementPrompt?.trim()) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing refinement prompt' }) };
        }

        console.log(`[AI Ad Refine] User: ${user.id.substring(0, 8)}... | Job: ${jobId} | Prompt: "${refinementPrompt.substring(0, 80)}"`);

        // ─── RATE LIMITING ───
        const rateLimitResult = await checkRateLimit(user.id, 'ai_ad_generate');
        if (!rateLimitResult.allowed) {
            return {
                statusCode: 429,
                headers,
                body: JSON.stringify({
                    error: 'Rate limit exceeded',
                    message: 'Zu viele Anfragen. Bitte warte einen Moment.',
                }),
            };
        }

        // ─── LOAD ORIGINAL AD ───
        const { data: original, error: fetchError } = await supabaseAdmin
            .from('generated_creatives')
            .select('*')
            .eq('id', jobId)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !original) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Original ad not found' }) };
        }

        const originalImageUrl = original.outputs?.imageUrl || original.thumbnail;
        if (!originalImageUrl) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Original ad has no image' }) };
        }

        // ─── DEDUCT CREDITS ───
        try {
            await assertAndConsumeCredits(user.id, 'ai_ad_generate');
        } catch (creditError) {
            return { statusCode: 402, headers, body: JSON.stringify({ error: 'Insufficient credits', message: creditError.message }) };
        }

        // ─── FETCH ORIGINAL IMAGE ───
        let originalImageBuffer;
        let originalMimeType = 'image/png';
        try {
            const imgResponse = await fetch(originalImageUrl, { signal: AbortSignal.timeout(15000) });
            if (!imgResponse.ok) throw new Error(`HTTP ${imgResponse.status}`);
            originalMimeType = imgResponse.headers.get('content-type') || 'image/png';
            const arrayBuffer = await imgResponse.arrayBuffer();
            originalImageBuffer = Buffer.from(arrayBuffer);
            console.log(`[AI Ad Refine] ✅ Original image loaded: ${(originalImageBuffer.length / 1024).toFixed(0)}KB`);
        } catch (imgErr) {
            // Refund credits if we can't load the image
            await refundCredits(user.id, 'ai_ad_generate');
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to load original image' }) };
        }

        // ─── GEMINI IMAGE-TO-IMAGE REFINEMENT ───
        const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const isGerman = language === 'de';
        const editPrompt = `You are a professional ad designer editing an existing Meta advertisement image.

CURRENT IMAGE: This is the existing ad that needs to be modified.

USER'S MODIFICATION REQUEST: "${refinementPrompt}"

RULES:
1. Apply ONLY the requested changes — keep everything else as-is
2. Maintain the same overall style, quality level, and professional look
3. If adding/removing text, render it sharply with proper typography
4. If the user asks to remove the CTA button, remove it cleanly
5. If the user asks to add elements (arrows, text, badges), integrate them naturally
6. The result must still look like a $50,000 agency production
7. All text must be in ${isGerman ? 'German' : 'English'}

Apply the modifications and return the edited image.`;

        console.log(`[AI Ad Refine] 🎨 Generating refinement with ${GEMINI_IMAGE_MODEL}...`);

        const response = await gemini.models.generateContent({
            model: GEMINI_IMAGE_MODEL,
            contents: [
                {
                    inlineData: {
                        mimeType: originalMimeType,
                        data: originalImageBuffer.toString('base64'),
                    },
                },
                editPrompt,
            ],
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
                imageConfig: {
                    aspectRatio: '1:1',
                    imageSize: '2K',
                },
            },
        });

        // Extract image from response
        let refinedBuffer = null;
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData?.data) {
                    refinedBuffer = Buffer.from(part.inlineData.data, 'base64');
                    if (refinedBuffer.length < 1000) throw new Error('Refined image too small');
                    break;
                }
            }
        }

        if (!refinedBuffer) {
            await refundCredits(user.id, 'ai_ad_generate');
            throw new Error('Gemini returned no image for refinement');
        }

        console.log(`[AI Ad Refine] ✅ Refined image: ${(refinedBuffer.length / 1024).toFixed(0)}KB`);

        // ─── UPLOAD & SAVE ───
        const newJobId = crypto.randomUUID();
        const filename = `creatives/${user.id}/${newJobId}.png`;
        const { error: uploadError } = await supabaseAdmin.storage
            .from('creative-images')
            .upload(filename, refinedBuffer, { contentType: 'image/png', upsert: true });

        let imageUrl = null;
        if (!uploadError) {
            const { data: urlData } = supabaseAdmin.storage.from('creative-images').getPublicUrl(filename);
            imageUrl = urlData.publicUrl;
        }

        // Save as new creative with parent reference
        await supabaseAdmin.from('generated_creatives').insert({
            id: newJobId,
            user_id: user.id,
            saved: true,
            thumbnail: imageUrl,
            inputs: {
                mode: 'refine',
                parentJobId: jobId,
                refinementPrompt,
                language,
            },
            outputs: {
                ...original.outputs,
                imageUrl,
                imageDataUrl: imageUrl,
                thumbnailUrl: imageUrl,
                engine: `refined_${GEMINI_IMAGE_MODEL}`,
                parentId: jobId,
                refinementPrompt,
            },
            metrics: {
                status: 'complete',
                progress: 100,
                engine: `refined_${GEMINI_IMAGE_MODEL}`,
                credits_deducted: true,
                completed_at: new Date().toISOString(),
            },
        });

        console.log(`[AI Ad Refine] ✅ Refinement saved as ${newJobId}`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                jobId: newJobId,
                parentJobId: jobId,
                data: {
                    id: newJobId,
                    imageUrl,
                    headline: original.outputs?.headline || '',
                    slogan: original.outputs?.slogan || '',
                    cta: original.outputs?.cta || '',
                    hook: original.outputs?.hook || original.outputs?.description || '',
                    refinementPrompt,
                    creditsUsed: CREDIT_COSTS.ai_ad_generate,
                },
            }),
        };

    } catch (error) {
        console.error('[AI Ad Refine] Error:', error);

        // Refund credits on failure
        if (userId) {
            const refundResult = await refundCredits(userId, 'ai_ad_generate');
            if (refundResult.ok) {
                console.log(`[AI Ad Refine] ✅ Refunded. New balance: ${refundResult.newBalance}`);
            }
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Refinement failed',
                message: error.message || 'Unknown error',
            }),
        };
    }
};
