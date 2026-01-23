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
 */
export async function matchProduct(productBuffer) {
    // Step 1: Analyze product
    const analysis = await analyzeProduct(productBuffer);

    // Step 2: Find matching ads
    const { ads, patterns } = await findMatchingAds(analysis);

    return {
        analysis,
        referenceAds: ads,
        patterns,
        searchKeywords: analysis.keywords
    };
}

export default { analyzeProduct, findMatchingAds, matchProduct };
