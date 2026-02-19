/**
 * Nano Banana Creative Engine v1.0
 * 
 * Generates ad creative images using Gemini 3 Pro Image (Nano Banana Pro)
 * via the skill scripts: create_image.py, edit_image.py
 * 
 * Produces 3 creative concept directions, each in 3 Meta formats:
 *   1. UGC/Lifestyle — warm, natural, relatable
 *   2. Clean Product — studio, premium, minimal
 *   3. Bold Offer — bright, urgent, high-contrast
 * 
 * Falls back to OpenAI gpt-image-1 if Gemini is unavailable.
 */

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { generateHeroImage } from '../openai.js';

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

const SKILL_ROOT = process.env.NANO_BANANA_SCRIPTS ||
    path.resolve(process.cwd(), 'skills/nano-banana-image-editor/scripts');

const VENV_PYTHON = process.env.NANO_BANANA_VENV
    ? path.join(process.env.NANO_BANANA_VENV, 'bin/python3')
    : path.resolve(process.cwd(), 'skills/nano-banana-image-editor/.venv/bin/python3');

const CREATE_SCRIPT = path.join(SKILL_ROOT, 'create_image.py');
const EDIT_SCRIPT = path.join(SKILL_ROOT, 'edit_image.py');

const TEMP_DIR = path.join(os.tmpdir(), 'adruby-creatives');

// Meta format specs
const META_FORMATS = {
    square: { ratio: '1:1', width: 1080, height: 1080 },
    portrait: { ratio: '4:5', width: 1080, height: 1350 },
    story: { ratio: '9:16', width: 1080, height: 1920 },
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
 * Follows nano-banana best_practices.md guidelines.
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
// IMAGE GENERATION
// ═══════════════════════════════════════════════════════════════

/**
 * Check if Nano Banana (Gemini 3 Pro Image) is available.
 */
async function isNanoBananaAvailable() {
    // Check for API key
    if (!process.env.GEMINI_API_KEY) return false;

    // Check if scripts exist
    try {
        await fs.access(CREATE_SCRIPT);
        await fs.access(VENV_PYTHON);
        return true;
    } catch {
        return false;
    }
}

/**
 * Generate an image using Nano Banana (create_image.py).
 */
function generateWithNanoBanana(outputPath, prompt, format, referenceImage = null) {
    return new Promise((resolve, reject) => {
        const formatSpec = META_FORMATS[format];

        // Build command arguments
        const args = [
            VENV_PYTHON,
            CREATE_SCRIPT,
            `'${outputPath}'`,
            // Use single quotes to avoid bash special char issues (per best_practices.md)
            `'${prompt.replace(/'/g, "'\\''")}'`,
            '--resolution', '2K',
            '--aspect-ratio', formatSpec.ratio,
        ];

        // Add reference image if provided
        if (referenceImage) {
            args.push('--reference', `'${referenceImage}'`);
        }

        const cmd = args.join(' ');
        console.log(`[NanoBanana] Executing: ${cmd.substring(0, 200)}...`);

        exec(cmd, {
            timeout: 120000, // 2 min timeout per image
            env: { ...process.env },
            maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        }, async (error, stdout, stderr) => {
            if (error) {
                console.error(`[NanoBanana] Error:`, error.message);
                console.error(`[NanoBanana] Stderr:`, stderr);
                reject(new Error(`Nano Banana generation failed: ${error.message}`));
                return;
            }

            // Check if output file was created
            try {
                const stat = await fs.stat(outputPath);
                if (stat.size < 1000) {
                    reject(new Error('Generated image too small (likely failed)'));
                    return;
                }
                console.log(`[NanoBanana] ✅ Generated: ${outputPath} (${(stat.size / 1024).toFixed(0)}KB)`);
                resolve(outputPath);
            } catch {
                reject(new Error(`Output file not created: ${outputPath}`));
            }
        });
    });
}

/**
 * Generate an image using OpenAI gpt-image-1 (fallback).
 */
async function generateWithOpenAI(prompt, format) {
    const formatSpec = META_FORMATS[format];

    console.log(`[NanoBanana] ⚠️ Falling back to OpenAI gpt-image-1 for ${format}`);

    try {
        const result = await generateHeroImage({
            prompt,
            size: `${formatSpec.width}x${formatSpec.height}`,
            quality: 'high',
        });

        return result;
    } catch (err) {
        console.error(`[NanoBanana] OpenAI fallback also failed:`, err.message);
        throw err;
    }
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

    const nanoBananaReady = await isNanoBananaAvailable();
    console.log(`[NanoBanana] Engine: ${nanoBananaReady ? 'Gemini 3 Pro Image' : 'OpenAI Fallback'}`);

    // Ensure temp directory exists
    await fs.mkdir(TEMP_DIR, { recursive: true });

    const brandKit = adSpec.brandKit || {};
    const totalImages = concepts.length * formats.length;
    let generatedCount = 0;
    let failedCount = 0;

    const creativePack = {
        concepts: [],
        engine: nanoBananaReady ? 'gemini_3_pro' : 'openai_gpt_image_1',
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
                    if (nanoBananaReady) {
                        // Nano Banana path
                        const hash = crypto.createHash('sha256')
                            .update(`${conceptKey}_${formatKey}_${adSpec.offer}`)
                            .digest('hex')
                            .substring(0, 12);
                        const outputPath = path.join(TEMP_DIR, `${hash}_${formatKey}.png`);

                        await generateWithNanoBanana(
                            outputPath,
                            prompt,
                            formatKey,
                            adSpec.productImageUrl || null,
                        );

                        const buffer = await fs.readFile(outputPath);
                        imageResult = {
                            buffer,
                            filePath: outputPath,
                            width: formatSpec.width,
                            height: formatSpec.height,
                            format: 'png',
                            engine: 'gemini_3_pro',
                        };
                    } else {
                        // OpenAI fallback
                        const result = await generateWithOpenAI(prompt, formatKey);
                        imageResult = {
                            buffer: result.imageBuffer || Buffer.from(result.imageBase64 || '', 'base64'),
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

                    // On retry, try OpenAI fallback even if Nano Banana was primary
                    if (attempt === maxRetries - 1 && nanoBananaReady) {
                        console.log(`[NanoBanana] Last retry: switching to OpenAI fallback`);
                        try {
                            const result = await generateWithOpenAI(prompt, formatKey);
                            imageResult = {
                                buffer: result.imageBuffer || Buffer.from(result.imageBase64 || '', 'base64'),
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
 * Clean up temporary files.
 */
export async function cleanupTempFiles() {
    try {
        await fs.rm(TEMP_DIR, { recursive: true, force: true });
        console.log('[NanoBanana] Cleaned up temp directory');
    } catch {
        // Ignored
    }
}

export {
    CONCEPT_DIRECTIONS,
    META_FORMATS,
    buildCreativePrompt,
    isNanoBananaAvailable as checkAvailability,
};

export default {
    generateCreativePack,
    cleanupTempFiles,
    isNanoBananaAvailable,
    CONCEPT_DIRECTIONS,
    META_FORMATS,
};
