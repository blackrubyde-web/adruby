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
import { matchProduct, findMatchingAds } from '../ai/productMatcher.js';
import { extractPatternDNA, buildDNAPrompt } from '../ai/visualDNA.js';
import { verifyAdQuality, buildImprovementPrompt, quickQualityCheck } from '../ai/qualityVerifier.js';
import { detectIndustry } from '../config/industries.js';
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

    const detectedIndustry = industry || detectIndustry(userPrompt || '', headline || '');

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

    if (productBuffer) {
        const matchResult = await matchProduct(productBuffer);
        productAnalysis = matchResult.analysis;
        referenceAds = matchResult.referenceAds || [];
        console.log(`[AdGenerator] Product: ${productAnalysis.productName}`);
        console.log(`[AdGenerator] References found: ${referenceAds.length}`);
    } else {
        productAnalysis = buildTextProductAnalysis({
            userPrompt,
            headline,
            tagline,
            industry: detectedIndustry,
            features
        });
        const matchResult = await findMatchingAds(productAnalysis, 5);
        referenceAds = matchResult.ads || [];
        console.log(`[AdGenerator] Text-only analysis: ${productAnalysis.productName}`);
        console.log(`[AdGenerator] References found: ${referenceAds.length}`);
    }

    // Determine industry
    const finalIndustry = industry || productAnalysis.productType || detectedIndustry;

    // ========================================
    // PHASE 2: Visual DNA Extraction
    // ========================================
    console.log('[AdGenerator] Phase 2: Visual DNA Extraction...');

    const dnaResult = await extractPatternDNA(referenceAds, 3);
    const visualDNA = dnaResult.pattern;
    console.log(`[AdGenerator] DNA extracted from ${dnaResult.count} reference ads`);

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

        try {
            adBuffer = await generateWithGemini(prompt, productBuffer);
        } catch (error) {
            console.warn('[AdGenerator] Generation error:', error.message);
            if (attempts > maxRetries) {
                throw error;
            }
            continue;
        }

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

    if (!adBuffer) {
        throw new Error('Gemini generation failed after all retries');
    }

    const duration = Date.now() - startTime;
    console.log(`[AdGenerator] ✅ PERFECTION ad complete in ${duration}ms (${attempts} attempts)`);

    return {
        buffer: adBuffer,
        pattern: visualDNA.layout?.type || 'hero_centered',
        industry: finalIndustry,
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
        throw error;
    }
}

function buildTextProductAnalysis({ userPrompt, headline, tagline, industry, features }) {
    const seed = [headline, tagline, userPrompt, industry].filter(Boolean).join(' ');
    const keywords = extractKeywords(seed);

    return {
        productName: headline || userPrompt || 'Product',
        productType: industry || 'tech',
        keywords: keywords.length > 0 ? keywords : [industry || 'tech'],
        suggestedHeadlines: headline ? [headline] : [],
        keyFeatures: features || [],
        emotionalHook: 'Quality and Value',
        adStyle: 'bold'
    };
}

function extractKeywords(text) {
    if (!text) return [];

    const stopWords = new Set([
        'a', 'an', 'the', 'for', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'of', 'with',
        'create', 'make', 'generate', 'ad', 'advertisement', 'promo', 'campaign', 'brand'
    ]);

    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word))
        .slice(0, 6);
}

export default { generateAd };
