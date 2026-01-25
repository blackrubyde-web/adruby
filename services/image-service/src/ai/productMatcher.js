/**
 * Smart Product Matcher
 * 
 * Analyzes product images and finds matching high-performing ads from Foreplay.
 * Uses GPT-4V for product analysis and intelligent Foreplay search.
 */

import OpenAI from 'openai';
import { createForeplayClient } from './foreplayClient.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const foreplay = createForeplayClient(process.env.FOREPLAY_API_KEY);

/**
 * Product categories for Foreplay search
 */
const PRODUCT_CATEGORIES = {
    figurine: ['collectibles', 'toys', 'gaming', 'anime'],
    tech: ['electronics', 'gadgets', 'software', 'apps'],
    beauty: ['skincare', 'cosmetics', 'beauty', 'wellness'],
    fashion: ['clothing', 'apparel', 'accessories', 'jewelry'],
    food: ['food', 'beverage', 'supplements', 'health'],
    home: ['home decor', 'furniture', 'kitchen', 'garden'],
    fitness: ['fitness', 'sports', 'gym', 'wellness'],
    pet: ['pets', 'dog', 'cat', 'pet supplies']
};

/**
 * Analyze product with GPT-4 Vision
 * Returns detailed product info for smart Foreplay search
 */
export async function analyzeProduct(productBuffer) {
    console.log('[ProductMatcher] 🔍 Analyzing product with GPT-4V...');

    try {
        const base64 = productBuffer.toString('base64');

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Analyze this product image for ad creation. Return JSON:
{
    "productName": "specific product name",
    "productType": "figurine|tech|beauty|fashion|food|home|fitness|pet|other",
    "category": "specific category",
    "keywords": ["search", "keywords", "for", "finding", "similar", "ads"],
    "targetAudience": "who would buy this",
    "emotionalHook": "what emotion sells this",
    "colorPalette": ["#hex1", "#hex2", "#hex3"],
    "suggestedHeadlines": ["Option 1", "Option 2", "Option 3"],
    "keyFeatures": ["Feature 1", "Feature 2", "Feature 3"],
    "adStyle": "minimal|bold|playful|luxury|techy|natural"
}`
                    },
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/png;base64,${base64}`, detail: 'high' }
                    }
                ]
            }],
            max_tokens: 800,
            response_format: { type: 'json_object' }
        });

        const analysis = JSON.parse(response.choices[0].message.content);
        console.log('[ProductMatcher] ✅ Product:', analysis.productName);
        console.log('[ProductMatcher] Type:', analysis.productType);
        console.log('[ProductMatcher] Keywords:', analysis.keywords?.slice(0, 3).join(', '));

        return analysis;
    } catch (error) {
        console.error('[ProductMatcher] GPT-4V failed:', error.message);
        return {
            productName: 'Product',
            productType: 'other',
            category: 'general',
            keywords: ['product', 'premium', 'quality'],
            targetAudience: 'general consumers',
            emotionalHook: 'quality and value',
            colorPalette: ['#FF4757', '#2F3542', '#FFFFFF'],
            suggestedHeadlines: ['Premium Quality', 'Discover More', 'Shop Now'],
            keyFeatures: ['High Quality', 'Best Value', 'Fast Shipping'],
            adStyle: 'bold'
        };
    }
}

/**
 * DEEP PRODUCT ANALYSIS v2.0 - Advanced AI Visual Intelligence
 * 
 * Comprehensive GPT-4V analysis of user's product screenshot:
 * - 9-Zone Spatial Grid for precise positioning
 * - Safe Zones (where NOT to place elements)
 * - Visual Hierarchy Map with eye-flow analysis
 * - Semantic Content Understanding
 * - Smart Placement Recommendations with exact coordinates
 */
export async function deepProductAnalysis(productBuffer) {
    console.log('[DeepAnalysis] 🔬 Starting ADVANCED deep analysis with GPT-4V...');

    try {
        const base64 = productBuffer.toString('base64');

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `You are an ELITE creative director analyzing a product screenshot.

Return COMPREHENSIVE JSON:

{
    "productType": "saas_dashboard|mobile_app|ecommerce_product|physical_product|service|website|other",
    
    "spatialGrid": {
        "zones": {
            "top_left": { "occupied": true, "content": "description", "suitableFor": ["badge"] },
            "top_center": { "occupied": false, "content": "", "suitableFor": ["headline"] },
            "top_right": { "occupied": true, "content": "", "suitableFor": [] },
            "middle_left": { "occupied": false, "content": "", "suitableFor": ["callout"] },
            "middle_center": { "occupied": true, "content": "main content", "suitableFor": [] },
            "middle_right": { "occupied": false, "content": "", "suitableFor": ["callout"] },
            "bottom_left": { "occupied": false, "content": "", "suitableFor": ["text"] },
            "bottom_center": { "occupied": false, "content": "", "suitableFor": ["cta"] },
            "bottom_right": { "occupied": false, "content": "", "suitableFor": ["badge", "social"] }
        }
    },
    
    "safeZones": {
        "noOverlay": [
            { "xPercent": 0.5, "yPercent": 0.5, "radiusPercent": 0.25, "reason": "main content" }
        ],
        "noText": [
            { "xPercent": 0.3, "yPercent": 0.4, "radiusPercent": 0.1, "reason": "busy area" }
        ]
    },
    
    "visualHierarchy": {
        "primaryFocus": { "xPercent": 0.5, "yPercent": 0.45, "description": "main focus" },
        "secondaryFocus": { "xPercent": 0.3, "yPercent": 0.6, "description": "secondary" },
        "eyeFlowDirection": "left_to_right|top_to_bottom|center_out|z_pattern|f_pattern",
        "focalWeight": "center_heavy|left_heavy|right_heavy|balanced"
    },
    
    "semanticContent": {
        "mainValueProp": "the key benefit shown",
        "keyFeatures": ["feature 1", "feature 2"],
        "targetAudience": "who wants this",
        "emotionalAppeal": "efficiency|growth|savings|ease|power|security",
        "uniqueElements": ["specific unique things"]
    },
    
    "contentZones": {
        "primaryFocus": {
            "description": "main visual focus",
            "xPercent": 0.5, "yPercent": 0.45,
            "widthPercent": 0.6, "heightPercent": 0.5,
            "type": "dashboard|chart|product|interface"
        },
        "emptySpaces": [
            { "zone": "bottom_center", "xPercent": 0.5, "yPercent": 0.9, "suitableFor": ["cta"], "size": "medium" }
        ],
        "dataDenseAreas": [
            { "xPercent": 0.5, "yPercent": 0.5, "type": "chart|metrics", "avoidOverlay": true }
        ]
    },
    
    "visualAnchors": [
        {
            "type": "metric|chart|button|feature|icon",
            "description": "what this shows",
            "xPercent": 0.25, "yPercent": 0.3,
            "size": "medium",
            "highlightPriority": 1,
            "suggestedCallout": "max 4 words",
            "calloutPosition": "left|right|above|below"
        }
    ],
    
    "colorPalette": {
        "dominant": "#hex", "secondary": "#hex", "accent": "#hex",
        "background": "#hex", "textColor": "#hex",
        "suggestedAdBackground": "#hex", "suggestedAccent": "#hex"
    },
    
    "smartPlacements": {
        "headline": { "position": { "xPercent": 0.5, "yPercent": 0.08 }, "alignment": "center", "reasoning": "why" },
        "tagline": { "position": { "xPercent": 0.5, "yPercent": 0.16 }, "show": true },
        "cta": { "position": { "xPercent": 0.5, "yPercent": 0.88 }, "style": "pill" },
        "badges": [{ "position": { "xPercent": 0.9, "yPercent": 0.05 }, "shouldInclude": true, "text": "badge text" }],
        "callouts": [{ "position": { "xPercent": 0.15, "yPercent": 0.45 }, "pointsTo": { "xPercent": 0.25, "yPercent": 0.35 }, "text": "callout", "shouldInclude": true }],
        "socialProof": { "position": { "xPercent": 0.5, "yPercent": 0.82 }, "shouldInclude": true }
    },
    
    "designRecommendations": {
        "maxCallouts": 0-3,
        "maxBadges": 0-2,
        "showSocialProof": true,
        "suggestedHeadline": "headline based on content",
        "suggestedSubheadline": "supporting text",
        "ctaText": "action text",
        "mockupStyle": "macbook|phone|browser|floating",
        "backgroundStyle": "gradient_dark|gradient_light|solid",
        "recommendedApproach": "clean_minimal|feature_showcase|benefit_focused"
    },
    
    "excludeElements": ["what NOT to include and why"],
    "overallMood": "professional|playful|luxury|tech|minimal|bold"
}`
                    },
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/png;base64,${base64}`, detail: 'high' }
                    }
                ]
            }],
            max_tokens: 4000,
            response_format: { type: 'json_object' }
        });

        const analysis = JSON.parse(response.choices[0].message.content);

        console.log('[DeepAnalysis] ✅ ADVANCED Analysis complete:');
        console.log(`[DeepAnalysis]   Product: ${analysis.productType}`);
        console.log(`[DeepAnalysis]   9-Zone Grid: analyzed`);
        console.log(`[DeepAnalysis]   Safe zones: ${analysis.safeZones?.noOverlay?.length || 0}`);
        console.log(`[DeepAnalysis]   Visual anchors: ${analysis.visualAnchors?.length || 0}`);
        console.log(`[DeepAnalysis]   Empty spaces: ${analysis.contentZones?.emptySpaces?.length || 0}`);
        console.log(`[DeepAnalysis]   Eye-flow: ${analysis.visualHierarchy?.eyeFlowDirection || 'unknown'}`);
        console.log(`[DeepAnalysis]   Value prop: ${analysis.semanticContent?.mainValueProp?.substring(0, 40) || 'N/A'}...`);
        console.log(`[DeepAnalysis]   Headline @ ${JSON.stringify(analysis.smartPlacements?.headline?.position || {})}`);
        console.log(`[DeepAnalysis]   Approach: ${analysis.designRecommendations?.recommendedApproach || 'default'}`);
        console.log(`[DeepAnalysis]   Exclude: ${analysis.excludeElements?.slice(0, 2).join(', ') || 'none'}`);

        return analysis;
    } catch (error) {
        console.error('[DeepAnalysis] GPT-4V failed:', error.message);
        return getDefaultDeepAnalysis();
    }
}


/**
 * Default deep analysis when GPT-4V fails
 */
function getDefaultDeepAnalysis() {
    return {
        productType: 'other',
        contentZones: {
            primaryFocus: {
                description: 'Product image',
                xPercent: 0.5,
                yPercent: 0.5,
                widthPercent: 0.6,
                heightPercent: 0.6,
                type: 'product'
            },
            emptySpaces: [
                { xPercent: 0.1, yPercent: 0.9, suitableFor: 'badge', size: 'small' }
            ],
            dataDenseAreas: []
        },
        visualAnchors: [],
        colorPalette: {
            dominant: '#1a1a2e',
            secondary: '#2f3542',
            accent: '#e74c3c',
            background: '#0f0f23',
            textColor: '#ffffff'
        },
        designRecommendations: {
            maxCallouts: 2,
            suggestedHeadline: 'Premium Quality',
            suggestedSubheadline: 'Discover the difference',
            ctaText: 'Learn More',
            mockupStyle: 'floating',
            backgroundStyle: 'gradient_dark',
            elementPlacement: {
                headlinePosition: 'top_center',
                productPosition: 'center',
                ctaPosition: 'bottom_center'
            }
        },
        excludeElements: [],
        overallMood: 'professional'
    };
}

/**
 * Find matching reference ads from Foreplay
 * Uses smart search based on product analysis
 */
export async function findMatchingAds(productAnalysis, limit = 5) {
    if (!foreplay) {
        console.log('[ProductMatcher] No Foreplay client, using defaults');
        return { ads: [], patterns: getDefaultPatterns() };
    }

    console.log('[ProductMatcher] 🔎 Searching Foreplay for similar ads...');

    try {
        // Build search query from product keywords
        const searchQuery = productAnalysis.keywords?.slice(0, 3).join(' ') || productAnalysis.productName;

        // Get niches based on product type
        const niches = PRODUCT_CATEGORIES[productAnalysis.productType] || ['ecommerce'];

        // Search with high-converting filter
        const ads = await foreplay.searchByNiche(niches[0], {
            query: searchQuery,
            runningDurationMin: 30, // Only ads running 30+ days = proven winners
            order: 'longest_running',
            limit: limit
        });

        if (ads.length === 0) {
            console.log('[ProductMatcher] No exact matches, trying broader search...');
            // Fallback to broader industry search
            const broadAds = await foreplay.getTopPerformingAds(productAnalysis.productType, { limit });
            return { ads: broadAds, patterns: extractPatterns(broadAds) };
        }

        console.log(`[ProductMatcher] ✅ Found ${ads.length} matching ads`);
        return { ads, patterns: extractPatterns(ads) };

    } catch (error) {
        console.error('[ProductMatcher] Foreplay search failed:', error.message);
        return { ads: [], patterns: getDefaultPatterns() };
    }
}

/**
 * Extract design patterns from reference ads
 */
function extractPatterns(ads) {
    if (!ads || ads.length === 0) return getDefaultPatterns();

    const patterns = {
        layouts: [],
        headlines: [],
        colors: [],
        elements: {
            hasBadges: false,
            hasArrows: false,
            hasFeatureCallouts: false,
            hasStats: false
        },
        averageTextDensity: 'medium',
        dominantStyle: 'bold'
    };

    // Analyze each ad
    ads.forEach(ad => {
        // Collect headlines for inspiration
        if (ad.headline) patterns.headlines.push(ad.headline);
        if (ad.name) patterns.headlines.push(ad.name);

        // Detect layout from description or name
        const text = `${ad.headline || ''} ${ad.description || ''} ${ad.name || ''}`.toLowerCase();

        if (text.includes('feature') || text.includes('benefit')) {
            patterns.elements.hasFeatureCallouts = true;
        }
        if (text.includes('%') || text.includes('x') || /\d+/.test(text)) {
            patterns.elements.hasStats = true;
        }
    });

    // Set layout based on detected elements
    if (patterns.elements.hasFeatureCallouts) {
        patterns.layouts.push('feature_callout');
    }
    if (patterns.elements.hasStats) {
        patterns.layouts.push('stats_showcase');
    }
    if (patterns.layouts.length === 0) {
        patterns.layouts.push('hero_centered');
    }

    return patterns;
}

/**
 * Default patterns when no references available
 */
function getDefaultPatterns() {
    return {
        layouts: ['hero_centered'],
        headlines: ['Premium Quality', 'Discover More', 'Shop Now'],
        colors: ['#FF4757', '#2F3542', '#FFFFFF'],
        elements: {
            hasBadges: true,
            hasArrows: false,
            hasFeatureCallouts: true,
            hasStats: false
        },
        averageTextDensity: 'medium',
        dominantStyle: 'bold'
    };
}

/**
 * Complete product matching pipeline
 * Now includes deep analysis for intelligent element placement
 */
export async function matchProduct(productBuffer) {
    // Step 1: Basic product analysis
    const analysis = await analyzeProduct(productBuffer);

    // Step 2: Deep analysis for element placement (NEW!)
    const deepAnalysis = await deepProductAnalysis(productBuffer);

    // Step 3: Find matching ads
    const { ads, patterns } = await findMatchingAds(analysis);

    return {
        analysis,
        deepAnalysis,  // NEW: Contains visual anchors, content zones, design recommendations
        referenceAds: ads,
        patterns,
        searchKeywords: analysis.keywords
    };
}

export default { analyzeProduct, deepProductAnalysis, findMatchingAds, matchProduct };
