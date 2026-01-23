/**
 * Ad Generator v4.0 - Elite AI-Directed Generation
 * 
 * Complete pipeline for 10/10 quality ads:
 * 1. Product Analysis with GPT-4V
 * 2. Smart Foreplay Search for matching ads
 * 3. Pattern Extraction from winners
 * 4. Elite Prompt Building (500+ words)
 * 5. Gemini Generation with COMPLETE ad (including text)
 */

import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { matchProduct, analyzeProduct, findMatchingAds } from '../ai/productMatcher.js';
import { buildElitePrompt, buildSimplePrompt } from '../ai/elitePromptBuilder.js';
import { getIndustryConfig, detectIndustry } from '../config/industries.js';
import { applyEffects } from '../effects/index.js';
import { fetchProductImage } from '../utils/imageLoader.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Main ad generation function - Elite Quality
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
    console.log('[AdGenerator] 🚀 Starting ELITE ad generation v4.0...');
    const startTime = Date.now();

    // Step 1: Load product image
    let productBuffer = null;
    if (productImageBase64) {
        productBuffer = Buffer.from(productImageBase64, 'base64');
    } else if (productImageUrl) {
        productBuffer = await fetchProductImage(productImageUrl);
    }

    // Step 2: Deep product analysis with GPT-4V
    console.log('[AdGenerator] Step 1: Deep Product Analysis...');
    let productAnalysis;
    let patterns;
    let referenceAds = [];

    if (productBuffer) {
        const matchResult = await matchProduct(productBuffer);
        productAnalysis = matchResult.analysis;
        patterns = matchResult.patterns;
        referenceAds = matchResult.referenceAds;
        console.log(`[AdGenerator] Found ${referenceAds.length} reference ads`);
    } else {
        // Fallback without product image
        productAnalysis = {
            productName: 'Premium Product',
            productType: industry || 'tech',
            keywords: [userPrompt || 'premium'],
            suggestedHeadlines: [headline || 'Shop Now'],
            emotionalHook: 'Quality and Value',
            adStyle: 'bold'
        };
        patterns = { layouts: ['hero_centered'] };
    }

    // Step 3: Determine industry from analysis
    const detectedIndustry = industry || productAnalysis.productType || detectIndustry(userPrompt || '', headline || '');
    const industryConfig = getIndustryConfig(detectedIndustry);
    console.log('[AdGenerator] Industry:', detectedIndustry);

    // Step 4: Build elite prompt using patterns
    console.log('[AdGenerator] Step 2: Building Elite Prompt...');
    const { prompt, layout, colors } = buildElitePrompt({
        productAnalysis,
        patterns,
        headline: headline || productAnalysis.suggestedHeadlines?.[0],
        tagline,
        features: features.length > 0 ? features : productAnalysis.keyFeatures?.slice(0, 3) || [],
        stats,
        cta: cta || 'Shop Now',
        industry: detectedIndustry
    });

    console.log('[AdGenerator] Layout:', layout);
    console.log('[AdGenerator] Prompt length:', prompt.length, 'chars');

    // Step 5: Generate complete ad with Gemini
    console.log('[AdGenerator] Step 3: Generating Complete Ad...');
    let adBuffer = await generateCompleteAd({
        prompt,
        productBuffer,
        colors,
        style: style || (productAnalysis.adStyle === 'minimal' ? 'light' : 'dark'),
        retries: maxRetries
    });

    // Step 6: Apply finishing effects
    if (industryConfig.effects?.length > 0) {
        const effectsToApply = mapEffects(industryConfig.effects.slice(0, 2));
        if (effectsToApply.length > 0) {
            console.log('[AdGenerator] Applying effects:', effectsToApply);
            adBuffer = await applyEffects(adBuffer, effectsToApply, {
                color: colors.accent
            });
        }
    }

    const duration = Date.now() - startTime;
    console.log(`[AdGenerator] ✅ Elite ad complete in ${duration}ms`);

    return {
        buffer: adBuffer,
        pattern: layout,
        industry: detectedIndustry,
        referenceCount: referenceAds.length,
        confidence: patterns.layouts?.includes(layout) ? 0.9 : 0.7,
        duration,
        productAnalysis: {
            name: productAnalysis.productName,
            type: productAnalysis.productType,
            style: productAnalysis.adStyle
        }
    };
}

/**
 * Generate complete ad with Gemini (includes all text)
 */
async function generateCompleteAd({ prompt, productBuffer, colors, style, retries = 2 }) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: { responseModalities: ['image', 'text'] }
    });

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const parts = [];

            // Add product image if available
            if (productBuffer) {
                parts.push({
                    inlineData: {
                        mimeType: 'image/png',
                        data: productBuffer.toString('base64')
                    }
                });
            }

            parts.push({ text: prompt });

            console.log(`[AdGenerator] Gemini attempt ${attempt + 1}/${retries + 1}...`);
            const result = await model.generateContent(parts);
            const candidates = result.response?.candidates;

            if (candidates?.[0]?.content?.parts) {
                for (const part of candidates[0].content.parts) {
                    if (part.inlineData?.data) {
                        const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
                        // Ensure proper dimensions
                        return await sharp(imageBuffer)
                            .resize(1080, 1080, { fit: 'cover' })
                            .png()
                            .toBuffer();
                    }
                }
            }

            console.warn('[AdGenerator] No image in response, retrying...');
        } catch (error) {
            console.error(`[AdGenerator] Gemini attempt ${attempt + 1} failed:`, error.message);
            if (attempt === retries) {
                console.log('[AdGenerator] All attempts failed, using fallback');
                return await createFallbackAd(colors, style);
            }
        }
    }

    return await createFallbackAd(colors, style);
}

/**
 * Create fallback ad when Gemini fails
 */
async function createFallbackAd(colors, style) {
    const bgColor = colors?.background || (style === 'dark' ? '#0F0F1A' : '#F5F5F5');
    const textColor = colors?.textPrimary || '#FFFFFF';

    const svg = `
    <svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="glow" cx="50%" cy="40%" r="60%">
                <stop offset="0%" style="stop-color:${colors?.primary || '#333'};stop-opacity:0.2"/>
                <stop offset="100%" style="stop-color:${colors?.primary || '#333'};stop-opacity:0"/>
            </radialGradient>
            <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:${bgColor}"/>
                <stop offset="100%" style="stop-color:${adjustBrightness(bgColor, -20)}"/>
            </linearGradient>
        </defs>
        <rect width="1080" height="1080" fill="url(#bg)"/>
        <ellipse cx="540" cy="400" rx="450" ry="350" fill="url(#glow)"/>
        <text x="540" y="200" text-anchor="middle" fill="${textColor}" 
              font-family="Arial, sans-serif" font-size="64" font-weight="700">
            Premium Quality
        </text>
        <rect x="390" y="950" width="300" height="60" rx="30" fill="${colors?.ctaBackground || '#FF4757'}"/>
        <text x="540" y="990" text-anchor="middle" fill="#FFFFFF" 
              font-family="Arial, sans-serif" font-size="24" font-weight="600">
            Shop Now
        </text>
    </svg>`;

    return await sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Adjust hex color brightness
 */
function adjustBrightness(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
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
