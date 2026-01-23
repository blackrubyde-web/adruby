/**
 * Ad Generator v5.0 - Visual DNA Recreation System
 * 
 * PERFECTION-level ad generation using:
 * 1. Product Analysis → GPT-4V understands your product
 * 2. Reference Matching → Find 30+ day winning ads
 * 3. Visual DNA Extraction → Pixel-precise layout specs from winners
 * 4. DNA Prompt Building → 1000+ word prompts with exact coordinates
 * 5. Gemini Generation → Execute with precision
 * 6. Quality Verification → Verify & retry if needed
 */

import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { matchProduct, analyzeProduct } from '../ai/productMatcher.js';
import { extractPatternDNA, buildDNAPrompt, getDefaultDNA } from '../ai/visualDNA.js';
import { verifyAdQuality, buildImprovementPrompt, quickQualityCheck } from '../ai/qualityVerifier.js';
import { getIndustryConfig, detectIndustry } from '../config/industries.js';
import { fetchProductImage } from '../utils/imageLoader.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Constants
const MAX_RETRIES = 2;
const QUALITY_THRESHOLD = 7;

/**
 * Main ad generation function - PERFECTION level
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
    enableQualityCheck = true,
    maxRetries = MAX_RETRIES
}) {
    console.log('[AdGenerator] 🚀 Starting PERFECTION-level generation v5.0...');
    const startTime = Date.now();

    // ========================================
    // PHASE 1: Product Analysis
    // ========================================
    console.log('[AdGenerator] Phase 1: Product Analysis...');

    let productBuffer = null;
    if (productImageBase64) {
        productBuffer = Buffer.from(productImageBase64, 'base64');
    } else if (productImageUrl) {
        productBuffer = await fetchProductImage(productImageUrl);
    }

    let productAnalysis;
    let referenceAds = [];
    let patterns;

    if (productBuffer) {
        const matchResult = await matchProduct(productBuffer);
        productAnalysis = matchResult.analysis;
        referenceAds = matchResult.referenceAds || [];
        patterns = matchResult.patterns;
        console.log(`[AdGenerator] Product: ${productAnalysis.productName}`);
        console.log(`[AdGenerator] References found: ${referenceAds.length}`);
    } else {
        productAnalysis = {
            productName: 'Premium Product',
            productType: industry || 'tech',
            keywords: [userPrompt || 'premium'],
            suggestedHeadlines: [headline || 'Shop Now'],
            emotionalHook: 'Quality and Value',
            adStyle: 'bold'
        };
    }

    // Determine industry
    const detectedIndustry = industry || productAnalysis.productType || detectIndustry(userPrompt || '', headline || '');
    const industryConfig = getIndustryConfig(detectedIndustry);

    // ========================================
    // PHASE 2: Visual DNA Extraction
    // ========================================
    console.log('[AdGenerator] Phase 2: Visual DNA Extraction...');

    let visualDNA;
    if (referenceAds.length > 0) {
        const dnaResult = await extractPatternDNA(referenceAds, 3);
        visualDNA = dnaResult.pattern;
        console.log(`[AdGenerator] DNA extracted from ${dnaResult.count} reference ads`);
    } else {
        console.log('[AdGenerator] No references, using default DNA');
        visualDNA = getDefaultDNA();
    }

    // Override accent color if provided
    if (accentColor) {
        visualDNA.colors.accent = accentColor;
        visualDNA.colors.cta = { background: accentColor, text: '#FFFFFF' };
    }

    // ========================================
    // PHASE 3: DNA Prompt Building
    // ========================================
    console.log('[AdGenerator] Phase 3: Building DNA Prompt...');

    const content = {
        headline: headline || productAnalysis.suggestedHeadlines?.[0] || 'Premium Quality',
        subline: tagline,
        cta: cta || 'Shop Now',
        features: features.length > 0 ? features : productAnalysis.keyFeatures?.slice(0, 3) || [],
        productDescription: productAnalysis.productName
    };

    let prompt = buildDNAPrompt(visualDNA, content);
    console.log(`[AdGenerator] Prompt: ${prompt.length} characters`);

    // ========================================
    // PHASE 4: Generation with Quality Loop
    // ========================================
    console.log('[AdGenerator] Phase 4: Gemini Generation...');

    let adBuffer = null;
    let qualityResult = null;
    let attempts = 0;

    while (attempts <= maxRetries) {
        attempts++;
        console.log(`[AdGenerator] Generation attempt ${attempts}/${maxRetries + 1}...`);

        adBuffer = await generateWithGemini(prompt, productBuffer);

        if (!adBuffer) {
            console.warn('[AdGenerator] Generation failed, retrying...');
            continue;
        }

        // Quick quality check
        if (enableQualityCheck && attempts <= maxRetries) {
            qualityResult = await quickQualityCheck(adBuffer);

            if (qualityResult.score >= QUALITY_THRESHOLD) {
                console.log(`[AdGenerator] ✅ Quality passed: ${qualityResult.score}/10`);
                break;
            } else {
                console.log(`[AdGenerator] ⚠️ Quality ${qualityResult.score}/10, improving prompt...`);
                prompt = buildImprovementPrompt(prompt, {
                    scores: { headlineVisible: qualityResult.hasHeadline ? 8 : 3, ctaVisible: qualityResult.hasCTA ? 8 : 3 },
                    issues: !qualityResult.hasHeadline ? ['Headline not visible'] : [],
                    improvements: ['Make headline larger', 'Ensure CTA is visible']
                });
            }
        } else {
            break;
        }
    }

    // Fallback if all attempts failed
    if (!adBuffer) {
        console.log('[AdGenerator] All attempts failed, using fallback');
        adBuffer = await createFallbackAd(visualDNA.colors, content);
    }

    const duration = Date.now() - startTime;
    console.log(`[AdGenerator] ✅ PERFECTION ad complete in ${duration}ms (${attempts} attempts)`);

    return {
        buffer: adBuffer,
        pattern: visualDNA.layout?.type || 'hero_centered',
        industry: detectedIndustry,
        referenceCount: referenceAds.length,
        confidence: visualDNA.confidence || 0.8,
        duration,
        attempts,
        quality: qualityResult?.score || 0,
        productAnalysis: {
            name: productAnalysis.productName,
            type: productAnalysis.productType,
            style: productAnalysis.adStyle
        }
    };
}

/**
 * Generate ad with Gemini using DNA prompt
 */
async function generateWithGemini(prompt, productBuffer) {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: { responseModalities: ['image', 'text'] }
        });

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

        return null;
    } catch (error) {
        console.error('[AdGenerator] Gemini error:', error.message);
        return null;
    }
}

/**
 * Create fallback ad when Gemini fails
 */
async function createFallbackAd(colors, content) {
    const bgColor = colors?.background?.primary || '#0A0A1A';
    const textColor = colors?.text?.primary || '#FFFFFF';
    const ctaColor = colors?.cta?.background || colors?.accent || '#FF4757';

    const svg = `
    <svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="glow" cx="50%" cy="40%" r="60%">
                <stop offset="0%" style="stop-color:${ctaColor};stop-opacity:0.15"/>
                <stop offset="100%" style="stop-color:${ctaColor};stop-opacity:0"/>
            </radialGradient>
            <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:${bgColor}"/>
                <stop offset="100%" style="stop-color:${adjustBrightness(bgColor, -30)}"/>
            </linearGradient>
        </defs>
        <rect width="1080" height="1080" fill="url(#bg)"/>
        <ellipse cx="540" cy="400" rx="500" ry="400" fill="url(#glow)"/>
        
        <!-- Headline -->
        <text x="540" y="120" text-anchor="middle" fill="${textColor}" 
              font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="900"
              style="text-shadow: 0 4px 30px rgba(0,0,0,0.8);">
            ${escapeXml(content.headline || 'Premium Quality')}
        </text>
        
        ${content.subline ? `
        <text x="540" y="170" text-anchor="middle" fill="rgba(255,255,255,0.75)" 
              font-family="system-ui, sans-serif" font-size="28" font-weight="400">
            ${escapeXml(content.subline)}
        </text>
        ` : ''}
        
        <!-- CTA Button -->
        <rect x="390" y="960" width="300" height="60" rx="30" fill="${ctaColor}"/>
        <text x="540" y="1000" text-anchor="middle" fill="#FFFFFF" 
              font-family="system-ui, sans-serif" font-size="22" font-weight="600">
            ${escapeXml(content.cta || 'Shop Now')}
        </text>
    </svg>`;

    return await sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Escape XML special characters
 */
function escapeXml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
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

export default { generateAd };
