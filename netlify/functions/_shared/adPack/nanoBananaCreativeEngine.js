/**
 * Nano Banana Creative Engine v2.0
 * 
 * Generates ad creative images using Gemini 2.0 Flash via @google/generative-ai npm SDK.
 * Falls back to OpenAI gpt-image-1 if Gemini is unavailable.
 * 
 * Produces 3 creative concept directions, each in 3 Meta formats:
 *   1. UGC/Lifestyle — warm, natural, relatable
 *   2. Clean Product — studio, premium, minimal
 *   3. Bold Offer — bright, urgent, high-contrast
 * 
 * v2.0: Replaced Python subprocess with direct Gemini API calls (Netlify-compatible).
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateHeroImage } from '../openai.js';
import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

// Meta format specs
const META_FORMATS = {
    square: { ratio: '1:1', width: 1080, height: 1080, openaiSize: '1024x1024' },
    portrait: { ratio: '4:5', width: 1080, height: 1350, openaiSize: '1024x1536' },
    story: { ratio: '9:16', width: 1080, height: 1920, openaiSize: '1024x1536' },
};

// ═══════════════════════════════════════════════════════════════
// CONCEPT DIRECTIONS
// ═══════════════════════════════════════════════════════════════

const CONCEPT_DIRECTIONS = {
    ugc_lifestyle: {
        name: 'UGC Lifestyle',
        direction: 'warm, natural, relatable, authentic',
        style: 'Natural photography style. Warm golden-hour lighting. Casual, lived-in environment. Shallow depth of field with bokeh background. Shot on iPhone aesthetic. Authentic and unpolished feel. No studio lighting.',
        moodKeywords: ['cozy', 'authentic', 'warm', 'natural', 'casual', 'relatable'],
    },
    clean_product: {
        name: 'Clean Product',
        direction: 'studio, premium, minimal, sleek',
        style: 'Professional studio photography. Clean white or gradient background. Soft diffused lighting with subtle shadows. Sharp product focus with 85mm lens effect. Minimal composition. Premium and luxurious feel. Crisp details.',
        moodKeywords: ['premium', 'clean', 'minimal', 'luxurious', 'sharp', 'professional'],
    },
    bold_offer: {
        name: 'Bold Offer',
        direction: 'bright, urgent, high-contrast, attention-grabbing',
        style: 'Bold graphic design poster aesthetic. High contrast colors. Dynamic composition with diagonal elements. Vibrant neon accent lighting. Eye-catching color blocks. Energetic and urgent feel. Strong visual hierarchy.',
        moodKeywords: ['bold', 'vibrant', 'urgent', 'energetic', 'attention-grabbing', 'dynamic'],
    },
};

// ═══════════════════════════════════════════════════════════════
// PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════

/**
 * Build a hyper-specific Gemini prompt for ad creative generation.
 */
function buildCreativePrompt(config) {
    const { concept, format, adSpec, brandKit } = config;
    const direction = CONCEPT_DIRECTIONS[concept];
    const formatSpec = META_FORMATS[format];

    // Brand color integration
    const brandColors = brandKit?.palette?.length > 0
        ? `Use these brand colors as accent: ${brandKit.palette.join(', ')}.`
        : '';

    // Safe zone instructions for 9:16
    const safeZone = format === 'story'
        ? 'CRITICAL: Leave the top 14% (270px) and bottom 14% (270px) completely clear — no important elements in those zones. All key visual elements must be in the center 72% of the vertical composition.'
        : '';

    // Product integration
    const productContext = adSpec.productName
        ? `The product is: ${adSpec.productName}. ${adSpec.offer}.`
        : `The offer is: ${adSpec.offer}.`;

    const prompt = `Create a professional Meta ad creative image for Instagram/Facebook.

PURPOSE: This is a ${format === 'square' ? 'feed post (1:1)' : format === 'portrait' ? 'feed post (4:5)' : 'Story/Reel (9:16)'} ad creative.

PRODUCT/OFFER: ${productContext}
TARGET AUDIENCE: ${adSpec.audience}

CREATIVE DIRECTION: ${direction.direction}
VISUAL STYLE: ${direction.style}

COMPOSITION:
- ${formatSpec.width}x${formatSpec.height} pixels, ${formatSpec.ratio} aspect ratio
- Leave generous negative space for text overlay (do NOT include any text in the image)
- Strong focal point in the center-third of the composition
- Clean, uncluttered background that supports but doesn't compete with the subject
${safeZone}

TECHNICAL REQUIREMENTS:
- No text, no typography, no logos, no watermarks, no UI elements in the image
- Professional commercial photography quality
- Sharp focus on the main subject, appropriate depth of field
- Color-graded for social media impact (slightly saturated, high clarity)
${brandColors}

MOOD: ${direction.moodKeywords.join(', ')}

Generate a single, stunning ad creative image that would make a user stop scrolling.`;

    return prompt;
}

// ═══════════════════════════════════════════════════════════════
// IMAGE GENERATION — GEMINI (via npm SDK)
// ═══════════════════════════════════════════════════════════════

let _geminiClient = null;

/**
 * Check if Gemini is available (API key set).
 */
function isGeminiAvailable() {
    return !!process.env.GEMINI_API_KEY;
}

/**
 * Get or create Gemini client.
 */
function getGeminiClient() {
    if (_geminiClient) return _geminiClient;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');
    _geminiClient = new GoogleGenerativeAI(apiKey);
    return _geminiClient;
}

/**
 * Generate an image using Gemini 2.0 Flash via @google/generative-ai SDK.
 * Returns a Buffer of the generated image.
 */
async function generateWithGemini(prompt, format) {
    const genAI = getGeminiClient();

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
            responseModalities: ['image', 'text'],
        },
    });

    console.log(`[NanoBanana] 🎨 Generating ${format} image with Gemini 2.0 Flash...`);

    const result = await model.generateContent([{ text: prompt }]);
    const response = result.response;

    // Extract image from response
    if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                const buffer = Buffer.from(part.inlineData.data, 'base64');
                if (buffer.length < 1000) {
                    throw new Error('Generated image too small (likely failed)');
                }
                console.log(`[NanoBanana] ✅ Gemini generated ${format}: ${(buffer.length / 1024).toFixed(0)}KB`);
                return buffer;
            }
        }
    }

    // No image in response
    const textResponse = response.text?.() || '';
    throw new Error(`Gemini returned no image. Text: ${textResponse.substring(0, 200)}`);
}

// ═══════════════════════════════════════════════════════════════
// IMAGE GENERATION — OPENAI FALLBACK
// ═══════════════════════════════════════════════════════════════

/**
 * Generate an image using OpenAI gpt-image-1 (fallback).
 * Uses mapped sizes that gpt-image-1 actually accepts.
 */
async function generateWithOpenAI(prompt, format) {
    const formatSpec = META_FORMATS[format];

    console.log(`[NanoBanana] ⚠️ Falling back to OpenAI gpt-image-1 for ${format}`);

    const result = await generateHeroImage({
        prompt,
        size: formatSpec.openaiSize,
        quality: 'high',
    });

    return result;
}

// ═══════════════════════════════════════════════════════════════
// MAIN ENGINE
// ═══════════════════════════════════════════════════════════════

/**
 * Generate all creative assets for an ad pack.
 * 
 * @param {Object} adSpec - The ad specification
 * @param {Object} [options] - Options
 * @param {string[]} [options.concepts] - Concept keys to generate (default: all 3)
 * @param {string[]} [options.formats] - Format keys to generate (default: all 3)
 * @param {number} [options.maxRetries=2] - Max retries per image
 * @param {Function} [options.onProgress] - Progress callback (step, progress, details)
 * @returns {Promise<CreativePack>} Generated creative pack
 */
export async function generateCreativePack(adSpec, options = {}) {
    const {
        concepts = Object.keys(CONCEPT_DIRECTIONS),
        formats = Object.keys(META_FORMATS),
        maxRetries = 2,
        onProgress = () => { },
    } = options;

    const geminiReady = isGeminiAvailable();
    console.log(`[NanoBanana] Engine: ${geminiReady ? 'Gemini 2.0 Flash (npm SDK)' : 'OpenAI Fallback'}`);

    const brandKit = adSpec.brandKit || {};
    const totalImages = concepts.length * formats.length;
    let generatedCount = 0;
    let failedCount = 0;

    const creativePack = {
        concepts: [],
        engine: geminiReady ? 'gemini_2_flash' : 'openai_gpt_image_1',
        stats: { total: totalImages, generated: 0, failed: 0 },
    };

    for (const conceptKey of concepts) {
        const direction = CONCEPT_DIRECTIONS[conceptKey];
        if (!direction) {
            console.warn(`[NanoBanana] Unknown concept: ${conceptKey}, skipping`);
            continue;
        }

        const conceptResult = {
            name: direction.name,
            key: conceptKey,
            direction: direction.direction,
            formats: {},
        };

        for (const formatKey of formats) {
            const formatSpec = META_FORMATS[formatKey];
            if (!formatSpec) continue;

            const progressPct = Math.round((generatedCount / totalImages) * 100);
            onProgress('generating_image', progressPct, {
                concept: direction.name,
                format: formatKey,
                remaining: totalImages - generatedCount,
            });

            // Build prompt
            const prompt = buildCreativePrompt({
                concept: conceptKey,
                format: formatKey,
                adSpec,
                brandKit,
            });

            // Generate with retries
            let imageResult = null;
            let lastError = null;

            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    if (geminiReady) {
                        // Gemini path (direct API call — no Python, no exec)
                        const buffer = await generateWithGemini(prompt, formatKey);
                        imageResult = {
                            buffer,
                            width: formatSpec.width,
                            height: formatSpec.height,
                            format: 'png',
                            engine: 'gemini_2_flash',
                        };
                    } else {
                        // OpenAI fallback
                        const result = await generateWithOpenAI(prompt, formatKey);
                        imageResult = {
                            buffer: result.imageBuffer || Buffer.from(result.b64 || '', 'base64'),
                            dataUrl: result.imageDataUrl,
                            width: formatSpec.width,
                            height: formatSpec.height,
                            format: 'png',
                            engine: 'openai_gpt_image_1',
                        };
                    }

                    break; // Success
                } catch (err) {
                    lastError = err;
                    console.warn(`[NanoBanana] ${direction.name}/${formatKey} attempt ${attempt + 1} failed: ${err.message}`);

                    // On last retry with Gemini, switch to OpenAI fallback
                    if (attempt === maxRetries - 1 && geminiReady) {
                        console.log(`[NanoBanana] Last retry: switching to OpenAI fallback`);
                        try {
                            const result = await generateWithOpenAI(prompt, formatKey);
                            imageResult = {
                                buffer: result.imageBuffer || Buffer.from(result.b64 || '', 'base64'),
                                dataUrl: result.imageDataUrl,
                                width: formatSpec.width,
                                height: formatSpec.height,
                                format: 'png',
                                engine: 'openai_gpt_image_1_fallback',
                            };
                            break;
                        } catch (fallbackErr) {
                            lastError = fallbackErr;
                        }
                    }
                }
            }

            if (imageResult) {
                conceptResult.formats[formatKey] = imageResult;
                generatedCount++;
            } else {
                failedCount++;
                console.error(`[NanoBanana] ❌ ${direction.name}/${formatKey} failed permanently: ${lastError?.message}`);
                conceptResult.formats[formatKey] = {
                    error: lastError?.message || 'Unknown error',
                    width: formatSpec.width,
                    height: formatSpec.height,
                };
            }
        }

        creativePack.concepts.push(conceptResult);
    }

    creativePack.stats.generated = generatedCount;
    creativePack.stats.failed = failedCount;

    console.log(`[NanoBanana] ✅ Creative pack complete: ${generatedCount}/${totalImages} images generated, ${failedCount} failed`);

    // Minimum viable check: need at least 6 out of 9 images
    if (generatedCount < Math.ceil(totalImages * 0.67)) {
        throw new Error(`Too many image generation failures: ${generatedCount}/${totalImages} (need ≥67%)`);
    }

    return creativePack;
}

/**
 * No-op cleanup (no temp files when using API directly).
 */
export async function cleanupTempFiles() {
    // No temp files to clean — Gemini API returns buffers directly
}

export {
    CONCEPT_DIRECTIONS,
    META_FORMATS,
    buildCreativePrompt,
    isGeminiAvailable as checkAvailability,
};

export default {
    generateCreativePack,
    cleanupTempFiles,
    isGeminiAvailable,
    CONCEPT_DIRECTIONS,
    META_FORMATS,
};
