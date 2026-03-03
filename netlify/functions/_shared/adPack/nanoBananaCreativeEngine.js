/**
 * Nano Banana Creative Engine v5.1
 * 
 * 2-PHASE AI CREATIVE DIRECTION:
 *   Phase 1: Gemini Flash generates a bespoke creative brief for THIS specific product
 *   Phase 2: NanoBanana-compliant image prompt assembled from the brief
 * 
 * Every product gets its own story, scene, emotion, and camera setup.
 * Industry presets serve as FALLBACK only when AI brief generation fails.
 * 
 * 100% Gemini — no OpenAI fallback.
 */

import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

const META_FORMATS = {
    square: { ratio: '1:1', width: 1080, height: 1080, openaiSize: '1024x1024', geminiAspect: '1:1' },
    portrait: { ratio: '4:5', width: 1080, height: 1350, openaiSize: '1024x1536', geminiAspect: '4:5' },
    story: { ratio: '9:16', width: 1080, height: 1920, openaiSize: '1024x1536', geminiAspect: '9:16' },
};

const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const GEMINI_TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';

// ═══════════════════════════════════════════════════════════════
// VARIATION SEEDS — Creative Diversity
// ═══════════════════════════════════════════════════════════════

const SCENE_MOODS = ['aspirational', 'intimate', 'dramatic', 'playful', 'serene', 'bold', 'nostalgic', 'futuristic'];
const PERSPECTIVES = ['first-person-experience', 'third-person-lifestyle', 'product-hero-closeup', 'action-moment', 'result-aftermath'];
const TIME_OF_DAY = ['golden-hour-sunrise', 'blue-hour-dusk', 'bright-midday', 'cozy-evening-warmth', 'energetic-morning'];

function getVariationSeeds(conceptIndex) {
    return {
        mood: SCENE_MOODS[(conceptIndex + Math.floor(Math.random() * 3)) % SCENE_MOODS.length],
        perspective: PERSPECTIVES[conceptIndex % PERSPECTIVES.length],
        timeOfDay: TIME_OF_DAY[Math.floor(Math.random() * TIME_OF_DAY.length)],
    };
}

// ═══════════════════════════════════════════════════════════════
// CONCEPT TYPES — What kind of ad to create
// ═══════════════════════════════════════════════════════════════

const CONCEPT_TYPES = [
    {
        key: 'lifestyle_in_use',
        name: 'Lifestyle In-Use',
        briefDirection: 'Show the product being used by a real person in a natural, aspirational setting. The scene tells a story about the lifestyle this product enables.',
    },
    {
        key: 'product_hero',
        name: 'Product Hero',
        briefDirection: 'Dramatic, stunning product showcase that highlights the product\'s most impressive feature or design element. The product is the undeniable star.',
    },
    {
        key: 'emotional_context',
        name: 'Emotional Context',
        briefDirection: 'Create a scene that captures the EMOTIONAL BENEFIT of owning this product. Focus on the feeling, the result, the transformation — not just the object.',
    },
];

// ═══════════════════════════════════════════════════════════════
// PHASE 1: AI CREATIVE DIRECTOR — Gemini Flash Brief
// ═══════════════════════════════════════════════════════════════

let _geminiClient = null;

function isGeminiAvailable() {
    return !!process.env.GEMINI_API_KEY;
}

function getGeminiClient() {
    if (_geminiClient) return _geminiClient;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');
    _geminiClient = new GoogleGenAI({ apiKey });
    return _geminiClient;
}

/**
 * AI Creative Director: Generates a bespoke creative brief for THIS specific product.
 * Uses Gemini Flash (text-only, ~250ms, ~500 tokens) — fast and cheap.
 * 
 * Every product gets a UNIQUE scene, camera, lighting, mood.
 * A Smartwatch gets a wrist-on-jog scene, a Drone gets a coastal-cliff scene,
 * Headphones get a café-immersion scene.
 * 
 * @param {Object} adSpec - Product info (productName, offer, audience, industry, angle)
 * @param {Object} conceptType - What kind of ad (lifestyle, hero, emotional)
 * @param {string} format - Ad format (square, portrait, story)
 * @param {Object} variation - Variation seeds for diversity
 * @returns {Promise<Object>} Creative brief JSON
 */
async function generateCreativeBrief(adSpec, conceptType, format, variation) {
    const client = getGeminiClient();
    const formatSpec = META_FORMATS[format];
    const lang = adSpec.language === 'en' ? 'English' : 'German';

    // Build rich product context from all available fields
    const productContext = [
        adSpec.productName ? `Name: ${adSpec.productName}` : null,
        adSpec.offer ? `Offer: ${adSpec.offer}` : null,
        adSpec.usp ? `USP: ${adSpec.usp}` : null,
        adSpec.description ? `Description: ${adSpec.description}` : null,
        adSpec.text ? `Details: ${adSpec.text}` : null,
    ].filter(Boolean).join('\n');

    const prompt = `You are a world-class Creative Director at a top Meta Ads agency.
You are directing a $50,000 photo shoot for ONE specific product.

PRODUCT DETAILS:
${productContext || 'A premium product'}

INDUSTRY: ${adSpec.industry || 'general'}
TARGET AUDIENCE: ${adSpec.audience || 'quality-conscious consumers'}
CREATIVE ANGLE: ${adSpec.angle || 'premium quality'}
AD FORMAT: ${format} (${formatSpec.ratio}, ${formatSpec.width}×${formatSpec.height})
LANGUAGE: All text suggestions must be in ${lang}.

CREATIVE DIRECTION: ${conceptType.briefDirection}

VARIATION SEEDS (use these to make this brief UNIQUE):
- Mood: ${variation.mood}
- Perspective: ${variation.perspective}
- Time of day: ${variation.timeOfDay}

Generate a UNIQUE creative brief for THIS EXACT product.
Do NOT use generic descriptions like "product on dark background" or "clean studio setup".
Think: What scene would make SPECIFICALLY a ${adSpec.productName || 'this product'} look irresistible?

Return this exact JSON structure:
{
  "scene": "A hyper-specific, narrative scene description (3-4 sentences) that is UNIQUE to this exact product. Include specific props, environment details, human interaction if relevant, and an emotional moment. Describe what the viewer SEES, not abstract concepts.",
  "camera": "Specific camera setup: lens focal length (mm), aperture (f/X.X), angle (eye-level/low/high/overhead), and composition rule (rule of thirds/centered/diagonal) — chosen specifically for THIS product's shape and key features.",
  "lighting": "Detailed lighting setup (2 sentences): primary light source, fill light, any accent/rim lights. Chosen to enhance THIS product's materials and textures.",
  "mood": "The exact emotional response (2 sentences): what the viewer should FEEL and what action it should trigger. Specific to THIS audience.",
  "colorPalette": "3-4 specific hex colors that complement THIS product and resonate with THIS audience. Format: '#hex1, #hex2, #hex3'",
  "textPlacement": "Where to place headline and CTA given the scene composition. Example: 'Headline top-left on negative space area, CTA bottom-center below product'",
  "ctaStyle": "CTA button style including color, shape, and feel that matches the scene. Example: 'Rounded pill, coral #FF6B6B, warm and inviting'"
}

CRITICAL RULES:
1. The scene MUST be specific to "${adSpec.productName || 'this product'}" — not any random product in the same category
2. Camera specs must be justified by the product's physical characteristics
3. Every brief you generate must be DIFFERENT from any template
4. Think about what makes THIS product unique and lean into it visually`;

    console.log(`[NanoBanana] 🎬 AI Creative Director generating brief for "${adSpec.productName}" (${conceptType.key}, ${format})...`);

    try {
        const response = await client.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                temperature: 0.9, // High creativity for diverse outputs
            },
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Empty response from Creative Director');

        const brief = JSON.parse(text);

        // Validate brief has required fields
        if (!brief.scene || !brief.camera || !brief.lighting) {
            throw new Error('Brief missing required fields (scene/camera/lighting)');
        }

        console.log(`[NanoBanana] ✅ Brief generated: "${brief.scene.substring(0, 80)}..."`);
        return brief;
    } catch (err) {
        console.warn(`[NanoBanana] ⚠️ AI Creative Director failed: ${err.message}`);
        return null; // Caller will fall back to static preset
    }
}

// ═══════════════════════════════════════════════════════════════
// INDUSTRY PRESETS — FALLBACK when AI brief fails
// ═══════════════════════════════════════════════════════════════

const INDUSTRY_FALLBACK = {
    tech_electronics: {
        scene: 'The product displayed on a clean dark surface with subtle ambient blue-purple glow, highlighting its design and craftsmanship.',
        camera: 'Shot with 85mm lens at f/2.0, eye-level, centered composition with product as hero',
        lighting: 'Dramatic rim-light from behind, subtle cool fill from front',
        mood: 'Premium, innovative, cutting-edge',
        ctaStyle: 'Rounded pill, electric blue #2563EB',
        colorTemp: '4500K cool-neutral',
    },
    food_restaurant: {
        scene: 'The food item beautifully presented on a rustic wooden surface, steam visible, fresh herbs and ingredients artfully scattered nearby.',
        camera: 'Shot with 50mm lens at f/2.8, 45-degree overhead angle, food photography composition',
        lighting: 'Warm side-lighting from left (window quality), golden fill from right',
        mood: 'Appetizing, warm, inviting',
        ctaStyle: 'Rounded pill, warm terracotta #E07A5F',
        colorTemp: '5800K warm',
    },
    fashion_beauty: {
        scene: 'The product in an editorial setting with clean lines and generous negative space, art-directed for high-fashion appeal.',
        camera: 'Shot with 70mm lens at f/1.8, editorial composition with negative space',
        lighting: 'Soft diffused beauty lighting, large overhead softbox, subtle fill from below',
        mood: 'Aspirational, luxurious, desirable',
        ctaStyle: 'Rounded pill, matte black #1A1A1A',
        colorTemp: '5200K neutral-warm',
    },
    fitness_health: {
        scene: 'The product in an energetic context — gym, outdoors, or post-workout moment with natural golden light.',
        camera: 'Shot with 35mm lens at f/2.8, slightly dynamic low angle, conveying energy',
        lighting: 'Golden hour natural light, high clarity, vibrant',
        mood: 'Motivating, empowering, energetic',
        ctaStyle: 'Rounded pill, vibrant coral #FF6B6B',
        colorTemp: '5500K warm-neutral',
    },
    home_interior: {
        scene: 'The product integrated into a warmly styled living space with complementary decor and natural daylight.',
        camera: 'Shot with 35mm lens at f/4.0, room context visible, product as focal point',
        lighting: 'Warm natural window light, golden hour feel',
        mood: 'Cozy, aspirational, serene',
        ctaStyle: 'Rounded pill, warm sage #6B8E6B',
        colorTemp: '5800K warm',
    },
    default: {
        scene: 'The product showcased in a clean, professional setting that highlights its quality and design.',
        camera: 'Shot with 50mm lens at f/3.5, clean product photography composition',
        lighting: 'Bright, even, professional studio lighting with soft shadows',
        mood: 'Clean, trustworthy, professional',
        ctaStyle: 'Rounded pill, warm orange #F97316',
        colorTemp: '5000K neutral',
    },
};

const INDUSTRY_ALIASES = {
    'tech': 'tech_electronics', 'electronics': 'tech_electronics', 'software': 'tech_electronics',
    'saas': 'tech_electronics', 'b2b': 'tech_electronics', 'gadget': 'tech_electronics',
    'food': 'food_restaurant', 'restaurant': 'food_restaurant', 'beverage': 'food_restaurant',
    'fashion': 'fashion_beauty', 'beauty': 'fashion_beauty', 'cosmetics': 'fashion_beauty',
    'jewelry': 'fashion_beauty', 'clothing': 'fashion_beauty',
    'fitness': 'fitness_health', 'health': 'fitness_health', 'wellness': 'fitness_health',
    'sport': 'fitness_health', 'supplement': 'fitness_health',
    'home': 'home_interior', 'interior': 'home_interior', 'furniture': 'home_interior',
    'decor': 'home_interior',
};

function resolveIndustry(input) {
    if (!input) return 'default';
    const key = input.toLowerCase().replace(/[^a-z_]/g, '');
    return INDUSTRY_FALLBACK[key] ? key : (INDUSTRY_ALIASES[key] || 'default');
}

function getFallbackPreset(industry) {
    const key = resolveIndustry(industry);
    return INDUSTRY_FALLBACK[key] || INDUSTRY_FALLBACK.default;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 2: PROMPT ASSEMBLY — From AI Brief or Fallback Preset
// ═══════════════════════════════════════════════════════════════

/**
 * Build a NanoBanana-compliant image prompt from an AI-generated brief
 * or a static industry fallback preset.
 */
function buildCreativePrompt(config) {
    const { brief, fallbackPreset, format, adSpec, brandKit } = config;
    const formatSpec = META_FORMATS[format];
    const source = brief || fallbackPreset;

    // Brand color integration
    const brandColors = brandKit?.palette?.length > 0
        ? `Apply these brand colors as accent elements: ${brandKit.palette.join(', ')}.`
        : source.colorPalette
            ? `Color palette: ${source.colorPalette}`
            : 'Use colors that naturally complement the scene.';

    // Safe zone instructions for story format
    const safeZone = format === 'story'
        ? '\nSAFE ZONES: Keep all important elements in the center 72% of vertical composition. Top/bottom 14% will be cropped by Instagram Stories UI.'
        : '';

    // Language-aware defaults
    const isEnglish = adSpec.language === 'en';
    const headline = adSpec.headline || adSpec.productName || '';
    const cta = adSpec.cta || (isEnglish ? 'Discover Now' : 'Jetzt entdecken');
    const subheadline = adSpec.subheadline || '';
    const textPlacement = source.textPlacement || 'Headline at top, CTA at bottom center';
    const ctaStyle = source.ctaStyle || 'Rounded pill, brand accent color';

    const textBlock = headline ? `
TEXT IN IMAGE (Gemini must render this text sharply):
- HEADLINE: "${headline}"
  Position: ${textPlacement.split(',')[0] || 'Upper area of composition'}
  Typography: Bold modern sans-serif (like Inter or Helvetica), high contrast against background
  Size: Large enough to read instantly at phone screen size

${subheadline ? `- SUBHEADLINE: "${subheadline}"
  Typography: Regular weight, 60% of headline size, below headline\n` : ''}
- CTA BUTTON: "${cta}"
  Style: ${ctaStyle}
  Typography: White bold text inside button, tappable-looking
  Position: Bottom center with breathing room` : `
SPACE FOR TEXT: Leave generous negative space in the upper-left area for headline overlay.`;

    return `A professional Meta advertisement image.

SCENE:
${source.scene}
Product: "${adSpec.productName || adSpec.offer || 'Product'}" — integrated naturally into the scene above.

CAMERA:
- ${source.camera}
- ${formatSpec.ratio} aspect ratio (${formatSpec.width}×${formatSpec.height})
${source.colorTemp ? `- Color temperature: ${source.colorTemp}` : ''}

LIGHTING:
- ${source.lighting}
- Professional commercial quality, natural-looking
${safeZone}
${textBlock}

MOOD: ${source.mood}
${brandColors}

QUALITY: This must look like a $50,000 agency photo shoot production.
Professional, polished, scroll-stopping. Indistinguishable from a real commercial ad.`;
}

// ═══════════════════════════════════════════════════════════════
// IMAGE GENERATION — GEMINI (via @google/genai SDK)
// ═══════════════════════════════════════════════════════════════

/**
 * Generate an image using Gemini Image Generation model.
 * 2K resolution, aspect ratio from format spec.
 */
async function generateWithGemini(prompt, format, productImageUrl = null) {
    const client = getGeminiClient();
    const formatSpec = META_FORMATS[format];

    const contents = [];

    // Product image for image-to-image generation
    if (productImageUrl) {
        try {
            console.log(`[NanoBanana] 📷 Fetching product image for Gemini...`);
            const imageResponse = await fetch(productImageUrl, {
                signal: AbortSignal.timeout(15000),
            });
            if (imageResponse.ok) {
                const imageArrayBuffer = await imageResponse.arrayBuffer();
                const imageBuffer = Buffer.from(imageArrayBuffer);
                contents.push({
                    inlineData: {
                        mimeType: imageResponse.headers.get('content-type') || 'image/png',
                        data: imageBuffer.toString('base64'),
                    },
                });
                console.log(`[NanoBanana] ✅ Product image loaded: ${(imageBuffer.length / 1024).toFixed(0)}KB`);
            }
        } catch (imgErr) {
            console.warn(`[NanoBanana] ⚠️ Could not fetch product image: ${imgErr.message}`);
        }
    }

    contents.push(prompt);

    console.log(`[NanoBanana] 🎨 Generating ${format} image with ${GEMINI_IMAGE_MODEL} (2K)...`);

    const response = await client.models.generateContent({
        model: GEMINI_IMAGE_MODEL,
        contents: contents,
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
            imageConfig: {
                aspectRatio: formatSpec?.geminiAspect || '1:1',
                imageSize: '2K',
            },
        },
    });

    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData?.data) {
                const buffer = Buffer.from(part.inlineData.data, 'base64');
                if (buffer.length < 1000) {
                    throw new Error('Generated image too small (likely failed)');
                }
                console.log(`[NanoBanana] ✅ Gemini generated ${format}: ${(buffer.length / 1024).toFixed(0)}KB`);
                return buffer;
            }
        }
    }

    let textResponse = '';
    try {
        textResponse = response.candidates?.[0]?.content?.parts
            ?.filter(p => p.text)
            ?.map(p => p.text)
            ?.join(' ') || '';
    } catch { /* ignore */ }

    throw new Error(`Gemini returned no image. Text: ${textResponse.substring(0, 200)}`);
}

// OpenAI fallback removed — 100% Gemini

// ═══════════════════════════════════════════════════════════════
// MAIN ENGINE — 2-Phase Generation
// ═══════════════════════════════════════════════════════════════

/**
 * Generate all creative assets for an ad pack.
 * 
 * Phase 1: AI Creative Director generates unique briefs per concept+format
 * Phase 2: NanoBanana builds prompts from briefs and generates images
 * Fallback: Static industry presets if Phase 1 fails
 */
export async function generateCreativePack(adSpec, options = {}) {
    const {
        formats = Object.keys(META_FORMATS),
        maxRetries = 2,
        onProgress = () => { },
    } = options;

    if (!isGeminiAvailable()) {
        throw new Error('GEMINI_API_KEY not configured — cannot generate images');
    }
    const industryKey = resolveIndustry(adSpec.industry);
    const totalImages = CONCEPT_TYPES.length * formats.length;
    let generatedCount = 0;
    let failedCount = 0;
    let aiBriefsUsed = 0;
    let fallbacksUsed = 0;

    console.log(`[NanoBanana] 🚀 Engine v5.0 — AI Creative Director`);
    console.log(`[NanoBanana] Product: "${adSpec.productName}" | Industry: ${adSpec.industry} (${industryKey})`);
    console.log(`[NanoBanana] Image Gen: ${GEMINI_IMAGE_MODEL}`);

    const creativePack = {
        concepts: [],
        engine: 'gemini_image',
        industry: industryKey,
        stats: { total: totalImages, generated: 0, failed: 0, aiBriefs: 0, fallbacks: 0 },
    };

    // ── PHASE 1: Pre-generate ALL briefs in parallel ──
    // 9 briefs from Gemini Flash in ~1.5s parallel instead of ~13s sequential
    const briefJobs = [];
    for (let conceptIndex = 0; conceptIndex < CONCEPT_TYPES.length; conceptIndex++) {
        const conceptType = CONCEPT_TYPES[conceptIndex];
        for (const formatKey of formats) {
            if (!META_FORMATS[formatKey]) continue;
            const variation = getVariationSeeds(conceptIndex);
            const briefPromise = generateCreativeBrief(adSpec, conceptType, formatKey, variation)
                .catch(err => { console.warn(`[NanoBanana] Brief failed for ${conceptType.key}/${formatKey}: ${err.message}`); return null; });
            briefJobs.push({ conceptIndex, conceptType, formatKey, briefPromise });
        }
    }

    console.log(`[NanoBanana] 🎬 Generating ${briefJobs.length} briefs in parallel...`);
    onProgress('generating_briefs', 5, { total: briefJobs.length });
    const briefResults = await Promise.all(briefJobs.map(j => j.briefPromise));

    // Map briefs back to concept/format pairs
    const briefMap = new Map();
    briefJobs.forEach((job, idx) => {
        briefMap.set(`${job.conceptIndex}_${job.formatKey}`, briefResults[idx]);
    });

    const successBriefs = briefResults.filter(b => b !== null).length;
    console.log(`[NanoBanana] ✅ ${successBriefs}/${briefJobs.length} briefs generated`);

    // ── PHASE 2: Generate images sequentially (rate limits) ──
    for (let conceptIndex = 0; conceptIndex < CONCEPT_TYPES.length; conceptIndex++) {
        const conceptType = CONCEPT_TYPES[conceptIndex];

        const conceptResult = {
            name: conceptType.name,
            key: conceptType.key,
            formats: {},
        };

        for (const formatKey of formats) {
            const formatSpec = META_FORMATS[formatKey];
            if (!formatSpec) continue;

            const progressPct = Math.round((generatedCount / totalImages) * 100);
            onProgress('generating_image', progressPct, {
                concept: conceptType.name,
                format: formatKey,
                remaining: totalImages - generatedCount,
            });

            // Use pre-generated brief or fallback
            const brief = briefMap.get(`${conceptIndex}_${formatKey}`);
            let fallbackPreset = null;

            if (!brief) {
                fallbackPreset = getFallbackPreset(adSpec.industry);
                fallbacksUsed++;
            } else {
                aiBriefsUsed++;
            }

            // ── PHASE 2: Prompt Assembly + Image Generation ──
            const prompt = buildCreativePrompt({
                brief,
                fallbackPreset: brief ? null : fallbackPreset,
                format: formatKey,
                adSpec,
                brandKit: adSpec.brandKit || {},
            });

            let imageResult = null;
            let lastError = null;

            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    const buffer = await generateWithGemini(prompt, formatKey, adSpec.productImageUrl);
                    imageResult = {
                        buffer,
                        width: formatSpec.width,
                        height: formatSpec.height,
                        format: 'png',
                        engine: 'gemini_image',
                        usedAiBrief: !!brief,
                    };
                    break;
                } catch (err) {
                    lastError = err;
                    console.warn(`[NanoBanana] ${conceptType.name}/${formatKey} attempt ${attempt + 1}/${maxRetries + 1} failed: ${err.message}`);
                }
            }

            if (imageResult) {
                conceptResult.formats[formatKey] = imageResult;
                generatedCount++;
            } else {
                failedCount++;
                console.error(`[NanoBanana] ❌ ${conceptType.name}/${formatKey} failed: ${lastError?.message}`);
                conceptResult.formats[formatKey] = {
                    error: lastError?.message || 'Unknown error',
                    width: formatSpec.width,
                    height: formatSpec.height,
                };
            }
        }

        creativePack.concepts.push(conceptResult);
    }

    creativePack.stats = { total: totalImages, generated: generatedCount, failed: failedCount, aiBriefs: aiBriefsUsed, fallbacks: fallbacksUsed };

    console.log(`[NanoBanana] ✅ Pack complete: ${generatedCount}/${totalImages} images | AI Briefs: ${aiBriefsUsed} | Fallbacks: ${fallbacksUsed}`);

    if (generatedCount < Math.ceil(totalImages * 0.67)) {
        throw new Error(`Too many failures: ${generatedCount}/${totalImages} (need ≥67%)`);
    }

    return creativePack;
}

/**
 * Generate a single ad image using the NanoBanana engine.
 * Uses AI Creative Director for individualized prompt.
 */
export async function generateSingleAd(params) {
    const {
        productImageUrl,
        headline, subheadline, cta,
        productName, offer, audience, industry, angle,
        brandKit, format = 'square',
    } = params;

    const adSpec = {
        productName: productName || offer || 'Product',
        offer: offer || productName || 'Premium Product',
        audience: audience || 'quality-conscious consumers',
        industry: industry || 'general',
        angle: angle || 'premium quality',
        language: params.language || 'de',
        usp: params.usp || '',
        description: params.description || '',
        text: params.text || '',
        headline, subheadline,
        cta: cta || (params.language === 'en' ? 'Discover Now' : 'Jetzt entdecken'),
        productImageUrl,
        brandKit,
    };

    if (!isGeminiAvailable()) {
        throw new Error('GEMINI_API_KEY not configured — cannot generate images');
    }

    const conceptType = CONCEPT_TYPES[0]; // Lifestyle In-Use for single ads
    const variation = getVariationSeeds(0);

    // Phase 1: AI Creative Director
    const brief = await generateCreativeBrief(adSpec, conceptType, format, variation);

    // Phase 2: Prompt Assembly
    const prompt = buildCreativePrompt({
        brief,
        fallbackPreset: brief ? null : getFallbackPreset(industry),
        format,
        adSpec,
        brandKit: brandKit || {},
    });

    // Image Generation — 100% Gemini
    const buffer = await generateWithGemini(prompt, format, productImageUrl);
    const engine = 'gemini_image';

    return {
        buffer,
        engine,
        usedAiBrief: !!brief,
        metadata: {
            industry: resolveIndustry(industry),
            concept: conceptType.name,
            format,
            model: GEMINI_IMAGE_MODEL,
            briefScene: brief?.scene?.substring(0, 100) || 'fallback preset',
        },
    };
}

/**
 * No-op cleanup (no temp files when using API directly).
 */
export async function cleanupTempFiles() { }

export {
    CONCEPT_TYPES,
    META_FORMATS,
    buildCreativePrompt,
    resolveIndustry,
    isGeminiAvailable as checkAvailability,
};

export default {
    generateCreativePack,
    generateSingleAd,
    cleanupTempFiles,
    isGeminiAvailable,
    CONCEPT_TYPES,
    META_FORMATS,
    resolveIndustry,
};
