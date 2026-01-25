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
 * DEEP PRODUCT ANALYSIS - Phase 1 of AI Creative Director
 * 
 * Analyzes user's product screenshot with GPT-4V to understand:
 * - Where are the key content zones (charts, metrics, text)?
 * - What visual elements can callouts point to?
 * - Where are empty spaces suitable for badges/text?
 * - What colors dominate the screenshot?
 * - What features are worth highlighting?
 * 
 * This drives intelligent element placement decisions.
 */
export async function deepProductAnalysis(productBuffer) {
    console.log('[DeepAnalysis] 🔬 Starting deep screenshot analysis with GPT-4V...');

    try {
        const base64 = productBuffer.toString('base64');

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `You are an expert UI/UX designer and creative director analyzing a product screenshot for ad creation.

Your task: Analyze this image to help me create a stunning ad that highlights the RIGHT features in the RIGHT places.

Return detailed JSON with these EXACT specifications:

{
    "productType": "saas_dashboard|mobile_app|ecommerce_store|physical_product|service|other",
    
    "contentZones": {
        "primaryFocus": {
            "description": "What is the main visual focus of this image?",
            "xPercent": 0.5,
            "yPercent": 0.4,
            "widthPercent": 0.6,
            "heightPercent": 0.5,
            "type": "dashboard|chart|product|text|hero_image|interface"
        },
        "emptySpaces": [
            {
                "xPercent": 0.1,
                "yPercent": 0.85,
                "suitableFor": "badge|cta|callout|text",
                "size": "small|medium|large"
            }
        ],
        "dataDenseAreas": [
            {
                "xPercent": 0.5,
                "yPercent": 0.5,
                "type": "chart|metrics|table|form",
                "description": "brief description"
            }
        ]
    },
    
    "visualAnchors": [
        {
            "type": "metric|chart|button|feature|icon|logo",
            "description": "what this element shows",
            "xPercent": 0.25,
            "yPercent": 0.3,
            "highlightPriority": 1,
            "suggestedCallout": "concise callout text"
        }
    ],
    
    "colorPalette": {
        "dominant": "#hex",
        "secondary": "#hex",
        "accent": "#hex",
        "background": "#hex",
        "textColor": "#hex"
    },
    
    "designRecommendations": {
        "maxCallouts": 2,
        "suggestedHeadline": "compelling headline based on what the image shows",
        "suggestedSubheadline": "supporting text",
        "ctaText": "action text",
        "mockupStyle": "macbook|ipad|phone|browser|floating|none",
        "backgroundStyle": "gradient_dark|gradient_light|solid|abstract|blur",
        "elementPlacement": {
            "headlinePosition": "top_center|top_left|bottom",
            "productPosition": "center|left|right",
            "ctaPosition": "bottom_center|bottom_right"
        }
    },
    
    "excludeElements": ["reason to NOT add certain elements like too many badges"],
    
    "overallMood": "professional|playful|luxury|tech|minimal|bold"
}`
                    },
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/png;base64,${base64}`, detail: 'high' }
                    }
                ]
            }],
            max_tokens: 2000,
            response_format: { type: 'json_object' }
        });

        const analysis = JSON.parse(response.choices[0].message.content);

        console.log('[DeepAnalysis] ✅ Analysis complete:');
        console.log(`[DeepAnalysis]   Product type: ${analysis.productType}`);
        console.log(`[DeepAnalysis]   Visual anchors: ${analysis.visualAnchors?.length || 0}`);
        console.log(`[DeepAnalysis]   Empty spaces: ${analysis.contentZones?.emptySpaces?.length || 0}`);
        console.log(`[DeepAnalysis]   Max callouts: ${analysis.designRecommendations?.maxCallouts || 2}`);
        console.log(`[DeepAnalysis]   Exclude: ${analysis.excludeElements?.join(', ') || 'none'}`);

        return analysis;
    } catch (error) {
        console.error('[DeepAnalysis] GPT-4V deep analysis failed:', error.message);
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
