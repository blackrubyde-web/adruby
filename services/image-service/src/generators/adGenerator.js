/**
 * Ad Generator v3.0 - AI Design Director Powered
 * 
 * No fixed templates - AI decides layout dynamically:
 * 1. Fetch reference ads from Foreplay
 * 2. Generate clean background with Gemini
 * 3. AI analyzes background + references
 * 4. AI decides layout and element positions
 * 5. Dynamic renderer creates overlay
 */

import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { directAdDesign } from '../ai/designDirector.js';
import { renderDynamicOverlay } from '../compositing/dynamicRenderer.js';
import { getIndustryConfig, detectIndustry } from '../config/industries.js';
import { applyEffects } from '../effects/index.js';
import { fetchProductImage } from '../utils/imageLoader.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Main ad generation function - AI Director powered
 */
export async function generateAd({
    productImageUrl,
    productImageBase64,
    headline,
    tagline,
    cta,
    features = [],
    stats = [],
    comparisonData,
    userPrompt,
    industry,
    style,
    accentColor,
    enableQualityCheck = false,
    maxRetries = 2
}) {
    console.log('[AdGenerator] 🚀 Starting AI-directed generation...');
    const startTime = Date.now();

    // Step 1: Load product image
    let productBuffer = null;
    if (productImageBase64) {
        productBuffer = Buffer.from(productImageBase64, 'base64');
    } else if (productImageUrl) {
        productBuffer = await fetchProductImage(productImageUrl);
    }

    // Step 2: Detect industry
    const detectedIndustry = industry || detectIndustry(userPrompt || '', headline || '');
    const industryConfig = getIndustryConfig(detectedIndustry);
    console.log('[AdGenerator] Industry:', detectedIndustry);

    // Step 3: Determine style
    const effectiveStyle = style || industryConfig.defaultStyle;
    const effectiveAccent = accentColor || industryConfig.colors?.primary;

    // Step 4: Generate clean background with Gemini (NO TEXT)
    const backgroundBuffer = await generateCleanBackground({
        productBuffer,
        industry: detectedIndustry,
        style: effectiveStyle,
        userPrompt
    });

    // Step 5: AI Design Director decides layout
    const designDecision = await directAdDesign({
        backgroundBuffer,
        productDescription: userPrompt,
        headline,
        tagline,
        features,
        stats,
        cta,
        industry: detectedIndustry,
        userPrompt
    });

    console.log(`[AdGenerator] AI selected pattern: ${designDecision.pattern} (confidence: ${designDecision.confidence})`);

    // Add accent color to instructions
    designDecision.instructions.accentColor = effectiveAccent;

    // Step 6: Render dynamic overlay based on AI instructions
    let resultBuffer = await renderDynamicOverlay(backgroundBuffer, designDecision.instructions);

    // Step 7: Apply industry effects
    if (industryConfig.effects?.length > 0) {
        const mappedEffects = mapEffects(industryConfig.effects.slice(0, 2));
        if (mappedEffects.length > 0) {
            resultBuffer = await applyEffects(resultBuffer, mappedEffects, {
                color: effectiveAccent
            });
        }
    }

    const duration = Date.now() - startTime;
    console.log(`[AdGenerator] ✅ Complete in ${duration}ms`);

    return {
        buffer: resultBuffer,
        pattern: designDecision.pattern,
        industry: detectedIndustry,
        referenceCount: designDecision.referenceCount,
        confidence: designDecision.confidence,
        duration
    };
}

/**
 * Generate clean background with Gemini (NO TEXT)
 */
async function generateCleanBackground({ productBuffer, industry, style, userPrompt }) {
    console.log('[AdGenerator] Generating clean background...');

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: { responseModalities: ['image', 'text'] }
    });

    const industryConfig = getIndustryConfig(industry);
    const isDark = style === 'dark';

    const prompt = `Create a premium 1080x1080 product advertisement BACKGROUND.

ABSOLUTE RULE: DO NOT RENDER ANY TEXT, HEADLINES, LABELS, BUTTONS, OR WORDS.
The text overlay will be added separately in post-processing.

COMPOSITION:
- Product from the input image must be EXACTLY preserved
- Place product CENTER, slightly below middle
- Product should occupy 45-55% of the frame
- Leave CLEAR SPACE at TOP (for headline) and BOTTOM (for CTA)

BACKGROUND STYLE (${style}):
${isDark
            ? `- Deep, dramatic gradient background
    - Premium dark tones from ${industryConfig.colors?.backgroundDark || '#0a0f1a'}
    - Subtle atmospheric glow behind product
    - Moody, professional lighting`
            : `- Clean, bright gradient background  
    - Light tones from ${industryConfig.colors?.backgroundLight || '#F5F5F5'}
    - Soft, diffused studio lighting
    - Fresh, modern aesthetic`
        }

INDUSTRY CONTEXT: ${industryConfig.name || industry}
USER CONTEXT: ${userPrompt || 'Premium product advertisement'}

QUALITY:
- Professional studio-quality lighting
- Subtle drop shadow beneath product
- High-end e-commerce look
- Premium, aspirational feel

OUTPUT: Clean product scene ready for text overlay. ABSOLUTELY NO TEXT OR LABELS.`;

    try {
        const parts = [];
        if (productBuffer) {
            parts.push({
                inlineData: {
                    mimeType: 'image/png',
                    data: productBuffer.toString('base64')
                }
            });
        }
        parts.push({ text: prompt });

        const result = await model.generateContent(parts);
        const candidates = result.response?.candidates;

        if (candidates?.[0]?.content?.parts) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData?.data) {
                    const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
                    return await sharp(imageBuffer)
                        .resize(1080, 1080, { fit: 'cover' })
                        .png()
                        .toBuffer();
                }
            }
        }
        throw new Error('No image in response');
    } catch (error) {
        console.error('[AdGenerator] Gemini failed, using fallback:', error.message);
        return createFallbackBackground(industryConfig, style);
    }
}

/**
 * Create fallback gradient background
 */
async function createFallbackBackground(industryConfig, style) {
    const isDark = style === 'dark';
    const bgColor = isDark
        ? industryConfig.colors?.backgroundDark || '#0a0f1a'
        : industryConfig.colors?.backgroundLight || '#F5F5F5';

    const svg = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:${industryConfig.colors?.primary || '#333'};stop-opacity:0.1"/>
                <stop offset="100%" style="stop-color:${industryConfig.colors?.primary || '#333'};stop-opacity:0"/>
            </radialGradient>
        </defs>
        <rect width="1080" height="1080" fill="${bgColor}"/>
        <ellipse cx="540" cy="500" rx="400" ry="350" fill="url(#glow)"/>
    </svg>`;

    return await sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Map industry effects to actual effect names
 */
function mapEffects(industryEffects) {
    const effectMap = {
        'neon_glow': 'neon_glow',
        'glass_reflection': 'soft_glow',
        'warm_glow': 'warm_tint',
        'soft_shadow': 'soft_shadow',
        'soft_glow': 'soft_glow',
        'grain': 'grain',
        'vignette': 'vignette'
    };

    return industryEffects
        .map(e => effectMap[e])
        .filter(Boolean);
}

export default { generateAd };
