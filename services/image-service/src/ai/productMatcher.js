/**
 * Smart Product Matcher
 * 
 * Analyzes product images and finds matching high-performing ads from Foreplay.
 * Uses GPT-4V for product analysis and intelligent Foreplay search.
 */

import { callGeminiVision } from '../utils/geminiClient.js';
import { createForeplayClient } from './foreplayClient.js';
const foreplay = createForeplayClient(process.env.FOREPLAY_API_KEY);

/**
 * VALID Foreplay API niches (verified from their API documentation)
 * Using ONLY these values prevents 422 errors
 */
const VALID_FOREPLAY_NICHES = [
    'app/software',
    'fashion',
    'beauty',
    'food',
    'travel',
    'sports',
    'technology',
    'accessories',
    'health/wellness',
    'home/garden',
    'jewelry/watches',
    'pets',
    'kids/baby',
    'automotive',
    'entertainment',
    'education',
    'finance',
    'other'
];

/**
 * Map product types to valid Foreplay niches
 */
const PRODUCT_TO_NICHE_MAP = {
    figurine: ['accessories', 'entertainment'],
    tech: ['app/software', 'technology'],
    beauty: ['beauty', 'health/wellness'],
    fashion: ['fashion', 'accessories'],
    food: ['food', 'health/wellness'],
    home: ['home/garden'],
    fitness: ['health/wellness', 'sports'],
    pet: ['pets'],
    saas: ['app/software', 'technology'],
    software: ['app/software'],
    other: ['other']
};

/**
 * Convert any niche string to a valid Foreplay niche
 */
function toValidNiche(niche) {
    if (!niche) return 'other';
    const lower = niche.toLowerCase().trim();

    // Direct match
    if (VALID_FOREPLAY_NICHES.includes(lower)) return lower;

    // Map common variations
    if (lower.includes('software') || lower.includes('app') || lower.includes('saas')) return 'app/software';
    if (lower.includes('tech') || lower.includes('gadget') || lower.includes('electronic')) return 'technology';
    if (lower.includes('beauty') || lower.includes('cosmetic') || lower.includes('skincare')) return 'beauty';
    if (lower.includes('fashion') || lower.includes('clothing') || lower.includes('apparel')) return 'fashion';
    if (lower.includes('food') || lower.includes('drink') || lower.includes('beverage')) return 'food';
    if (lower.includes('health') || lower.includes('wellness') || lower.includes('fitness')) return 'health/wellness';
    if (lower.includes('home') || lower.includes('garden') || lower.includes('furniture')) return 'home/garden';
    if (lower.includes('pet') || lower.includes('dog') || lower.includes('cat')) return 'pets';
    if (lower.includes('sport') || lower.includes('gym')) return 'sports';
    if (lower.includes('jewelry') || lower.includes('watch') || lower.includes('accessori')) return 'accessories';
    if (lower.includes('kid') || lower.includes('baby') || lower.includes('toy')) return 'kids/baby';
    if (lower.includes('travel') || lower.includes('tourism')) return 'travel';
    if (lower.includes('auto') || lower.includes('car') || lower.includes('vehicle')) return 'automotive';
    if (lower.includes('game') || lower.includes('entertainment') || lower.includes('collectible')) return 'entertainment';

    return 'other';
}

const MIN_REFERENCE_ADS = 5;
const MAX_PLAN_CALLS = 6;
const MAX_TOP_NICHES = 2;

/**
 * Analyze product with GPT-4 Vision
 * Returns detailed product info for smart Foreplay search
 */
export async function analyzeProduct(productBuffer) {
    console.log('[ProductMatcher] 🔍 Analyzing product with Gemini Vision...');

    try {
        const prompt = `Analyze this product image for ad creation. Return JSON:
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
}`;

        const result = await callGeminiVision(productBuffer, prompt, 'ProductMatcher');
        const analysis = result.content;

        console.log('[ProductMatcher] ✅ Product:', analysis.productName);
        console.log('[ProductMatcher] Type:', analysis.productType);
        console.log('[ProductMatcher] Keywords:', analysis.keywords?.slice(0, 3).join(', '));

        return analysis;
    } catch (error) {
        console.error('[ProductMatcher] Gemini Vision failed:', error.message);
        throw error;
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
    console.log('[DeepAnalysis] 🔬 Starting ADVANCED deep analysis with Gemini Vision...');

    try {
        const prompt = `You are an ELITE creative director analyzing a product screenshot.

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
        "maxCallouts": 2,
        "maxBadges": 1,
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
}`;

        const result = await callGeminiVision(productBuffer, prompt, 'DeepAnalysis');
        const analysis = result.content;

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
        console.error('[DeepAnalysis] Gemini Vision failed:', error.message);
        throw error;
    }
}

/**
 * Find matching reference ads from Foreplay
 * Uses smart search based on product analysis
 * Now with graceful fallback when Foreplay is unavailable or returns errors
 */
export async function findMatchingAds(productAnalysis, limit = 5) {
    // Graceful fallback when Foreplay is not configured
    if (!foreplay) {
        console.warn('[ProductMatcher] ⚠️ Foreplay not configured - using default patterns');
        return { ads: [], patterns: getDefaultPatterns(), searchPlan: [] };
    }

    console.log('[ProductMatcher] 🔎 Searching Foreplay for similar ads...');

    try {
        const searchPlan = buildSearchPlan(productAnalysis);
        console.log('[ProductMatcher] Search plan:', searchPlan);

        const perQueryLimit = Math.max(limit, 8);
        let ads = await executeSearchPlan(searchPlan, {
            limit: perQueryLimit,
            runningDurationMin: 30
        });

        if (ads.length < MIN_REFERENCE_ADS) {
            console.log('[ProductMatcher] Low matches, expanding running duration...');
            const expandedAds = await executeSearchPlan(searchPlan, {
                limit: perQueryLimit,
                runningDurationMin: 14
            });
            ads = dedupeAds([...ads, ...expandedAds]);
        }

        if (ads.length < MIN_REFERENCE_ADS) {
            console.log('[ProductMatcher] Still low matches, fetching top-performing by niche...');
            const fallbackNiches = [...new Set(searchPlan.map(item => item.niche))].slice(0, MAX_TOP_NICHES);
            const topAds = await Promise.all(fallbackNiches.map(niche =>
                foreplay.searchAdsByNiche(niche, { minRunDays: 30, order: 'longest_running', limit: perQueryLimit })
            ));
            ads = dedupeAds([...ads, ...topAds.flat()]);
        }

        // Graceful degradation: use whatever ads we have instead of failing
        if (ads.length < MIN_REFERENCE_ADS) {
            console.warn(`[ProductMatcher] ⚠️ Only ${ads.length} reference ads found (less than ${MIN_REFERENCE_ADS}) - continuing with available references`);
        }

        const rankedAds = ads
            .sort((a, b) => (b.running_duration?.days || 0) - (a.running_duration?.days || 0))
            .slice(0, Math.max(limit, MIN_REFERENCE_ADS));

        console.log(`[ProductMatcher] ✅ Found ${rankedAds.length} matching ads`);
        return { ads: rankedAds, patterns: extractPatterns(rankedAds), searchPlan };

    } catch (error) {
        // GRACEFUL FALLBACK: Don't kill the pipeline on Foreplay errors
        console.error('[ProductMatcher] ⚠️ Foreplay search failed:', error.message);
        console.log('[ProductMatcher] 🔄 Falling back to default patterns (AI-only mode)');
        return { ads: [], patterns: getDefaultPatterns(), searchPlan: [] };
    }
}

function buildSearchPlan(productAnalysis) {
    const niches = new Set();
    const productType = productAnalysis?.productType;
    const category = productAnalysis?.category;
    const productName = productAnalysis?.productName || '';

    // Filter out irrelevant business terms from product name/keywords
    const irrelevantTerms = ['dropshipping', 'affiliate', 'marketing', 'business', 'money', 'profit', 'ecommerce', 'amazon', 'shopify'];
    const cleanName = productName.split(/[,\s]+/)
        .filter(word => !irrelevantTerms.includes(word.toLowerCase()))
        .join(' ')
        .trim();

    // Detect physical product keywords for better niche mapping
    const physicalProductKeywords = {
        'led': 'home/garden',
        'lampe': 'home/garden',
        'lamp': 'home/garden',
        'light': 'home/garden',
        'deko': 'home/garden',
        'decor': 'home/garden',
        'figur': 'accessories',
        'figure': 'accessories',
        'spielzeug': 'kids/baby',
        'toy': 'kids/baby',
        'plush': 'kids/baby',
        'shirt': 'fashion',
        'clothing': 'fashion',
        'schmuck': 'jewelry/watches',
        'jewelry': 'jewelry/watches',
        'watch': 'jewelry/watches',
        'uhr': 'jewelry/watches',
        'beauty': 'beauty',
        'skincare': 'beauty',
        'makeup': 'beauty',
        'food': 'food',
        'supplement': 'health/wellness',
        'fitness': 'sports',
        'pet': 'pets',
        'hund': 'pets',
        'katze': 'pets',
        'dog': 'pets',
        'cat': 'pets'
    };

    // Check product name for physical product indicators
    const lowerName = cleanName.toLowerCase();
    for (const [keyword, niche] of Object.entries(physicalProductKeywords)) {
        if (lowerName.includes(keyword)) {
            niches.add(niche);
        }
    }

    // Use PRODUCT_TO_NICHE_MAP for known product types
    if (productType && PRODUCT_TO_NICHE_MAP[productType]) {
        PRODUCT_TO_NICHE_MAP[productType].forEach(niche => niches.add(niche));
    } else if (productType) {
        niches.add(toValidNiche(productType));
    }

    // Validate category
    if (category) {
        niches.add(toValidNiche(category));
    }

    // Add broad fallback niches for physical products
    if (niches.size === 0 || niches.has('other')) {
        // Default fallbacks for physical products
        niches.add('home/garden');
        niches.add('accessories');
    }

    const queries = new Set();

    // Add cleaned product name
    if (cleanName) queries.add(cleanName);

    // Add individual clean words (min 3 chars) as separate queries
    const words = cleanName.split(/\s+/).filter(w => w.length >= 3);
    words.forEach(word => queries.add(word));

    // Add category if clean
    if (category && !irrelevantTerms.includes(category.toLowerCase())) {
        queries.add(category);
    }

    // Add clean keywords
    const keywords = (productAnalysis?.keywords || [])
        .filter(k => k && !irrelevantTerms.includes(k.toLowerCase()));
    keywords.slice(0, 3).forEach(keyword => queries.add(keyword));

    // Build search plan
    const plan = [];
    const nicheList = Array.from(niches);
    const queryList = Array.from(queries);

    // First: specific searches
    for (const niche of nicheList.slice(0, 2)) {
        for (const query of queryList.slice(0, 3)) {
            plan.push({ niche, query });
            if (plan.length >= MAX_PLAN_CALLS) break;
        }
        if (plan.length >= MAX_PLAN_CALLS) break;
    }

    // Add broad niche searches as fallback (no query = top performing)
    if (plan.length < MAX_PLAN_CALLS) {
        nicheList.slice(0, 2).forEach(niche => {
            if (plan.length < MAX_PLAN_CALLS) {
                plan.push({ niche, query: '' });
            }
        });
    }

    return plan.length > 0 ? plan : [{ niche: 'home/garden', query: '' }, { niche: 'accessories', query: '' }];
}

async function executeSearchPlan(plan, options) {
    const results = await Promise.all(plan.map(item =>
        foreplay.searchByNiche(item.niche, {
            query: item.query,
            runningDurationMin: options.runningDurationMin,
            order: 'longest_running',
            limit: options.limit
        })
    ));
    return dedupeAds(results.flat());
}

function dedupeAds(ads) {
    const seen = new Set();
    return (ads || []).filter(ad => {
        if (!ad?.id || seen.has(ad.id)) return false;
        seen.add(ad.id);
        return true;
    });
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
