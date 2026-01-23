/**
 * AI Design Director
 * 
 * The brain of the ad generation system.
 * Uses Foreplay references + background analysis to make layout decisions.
 */

import { createForeplayClient } from './foreplayClient.js';
import { analyzeAdDesign, analyzeBackgroundForText } from './designAnalyzer.js';
import { getIndustryConfig } from '../config/industries.js';

const foreplay = createForeplayClient(process.env.FOREPLAY_API_KEY);

/**
 * Main Design Director - orchestrates layout decisions
 */
export async function directAdDesign({
    backgroundBuffer,
    productDescription,
    headline,
    tagline,
    features = [],
    stats = [],
    cta,
    industry,
    userPrompt
}) {
    console.log('[DesignDirector] Starting AI-directed design process...');

    // Step 1: Get reference ads from Foreplay
    const referenceAds = await getReferenceAds(industry, userPrompt);
    console.log(`[DesignDirector] Found ${referenceAds.length} reference ads`);

    // Step 2: Analyze reference ads for patterns (use cached/pre-analyzed)
    const referencePatterns = await analyzeReferencePatterns(referenceAds);

    // Step 3: Analyze the generated background
    const backgroundAnalysis = await analyzeBackgroundForText(backgroundBuffer);
    console.log('[DesignDirector] Background complexity:', backgroundAnalysis.backgroundComplexity);

    // Step 4: Decide layout based on content + references
    const layoutDecision = decideLayout({
        referencePatterns,
        backgroundAnalysis,
        headline,
        tagline,
        features,
        stats,
        cta,
        industry
    });

    console.log('[DesignDirector] Selected layout pattern:', layoutDecision.pattern);

    // Step 5: Generate precise composition instructions
    const compositionInstructions = generateCompositionInstructions({
        layoutDecision,
        backgroundAnalysis,
        headline,
        tagline,
        features,
        stats,
        cta,
        industry
    });

    return {
        pattern: layoutDecision.pattern,
        instructions: compositionInstructions,
        referenceCount: referenceAds.length,
        confidence: layoutDecision.confidence
    };
}

/**
 * Get reference ads from Foreplay
 */
async function getReferenceAds(industry, userPrompt) {
    if (!foreplay) {
        console.log('[DesignDirector] No Foreplay client, using defaults');
        return [];
    }

    try {
        // Try to find similar ads first
        if (userPrompt) {
            const similarAds = await foreplay.findSimilarAds(userPrompt, industry, { limit: 5 });
            if (similarAds.length >= 3) {
                return similarAds;
            }
        }

        // Fallback to top-performing ads in industry
        return await foreplay.getTopPerformingAds(industry, { limit: 5 });
    } catch (error) {
        console.error('[DesignDirector] Foreplay error:', error.message);
        return [];
    }
}

/**
 * Analyze reference ads to extract common patterns
 */
async function analyzeReferencePatterns(ads) {
    if (ads.length === 0) {
        return getDefaultPatterns();
    }

    const patterns = {
        layouts: {},
        typography: {
            headlineSizes: [],
            headlineWeights: []
        },
        elements: {
            hasArrows: 0,
            hasBadges: 0,
            hasDottedLines: 0
        },
        colors: []
    };

    // Analyze first 3 ads with images
    const adsWithImages = ads.filter(ad => ad.image || ad.thumbnail).slice(0, 3);

    for (const ad of adsWithImages) {
        try {
            const imageUrl = ad.image || ad.thumbnail;
            const analysis = await analyzeAdDesign(imageUrl, ad);

            if (analysis.success) {
                const a = analysis.analysis;

                // Track layout patterns
                const pattern = a.layout?.pattern || 'hero_product';
                patterns.layouts[pattern] = (patterns.layouts[pattern] || 0) + 1;

                // Track typography
                if (a.typography?.headlineSize) {
                    patterns.typography.headlineSizes.push(a.typography.headlineSize);
                }
                if (a.typography?.headlineWeight) {
                    patterns.typography.headlineWeights.push(a.typography.headlineWeight);
                }

                // Track elements
                if (a.elements?.hasArrows) patterns.elements.hasArrows++;
                if (a.elements?.hasBadges) patterns.elements.hasBadges++;
                if (a.elements?.hasDottedLines) patterns.elements.hasDottedLines++;

                // Track colors
                if (a.colors?.accentColor) {
                    patterns.colors.push(a.colors.accentColor);
                }
            }
        } catch (error) {
            console.warn('[DesignDirector] Reference analysis failed:', error.message);
        }
    }

    return patterns;
}

/**
 * Decide the best layout based on all inputs
 */
function decideLayout({ referencePatterns, backgroundAnalysis, headline, tagline, features, stats, industry }) {
    let pattern = 'hero_product';
    let confidence = 0.7;

    // Content-based decisions (highest priority)
    if (features.length >= 3) {
        pattern = 'feature_callout';
        confidence = 0.9;
    } else if (stats.length >= 3) {
        pattern = 'stats_grid';
        confidence = 0.9;
    } else if (features.length >= 2 || stats.length >= 2) {
        // Check reference patterns
        const mostCommon = getMostCommonPattern(referencePatterns.layouts);
        if (mostCommon) {
            pattern = mostCommon.pattern;
            confidence = 0.8;
        }
    }

    // Background complexity affects decision
    if (backgroundAnalysis.backgroundComplexity === 'complex') {
        // Simpler layouts for complex backgrounds
        if (pattern === 'feature_callout') {
            pattern = 'hero_product';
            confidence = 0.75;
        }
    }

    // Industry-specific preferences
    const industryConfig = getIndustryConfig(industry);
    const industryDefault = industryConfig.preferredTemplates?.[0];

    if (pattern === 'hero_product' && industryDefault && industryDefault !== 'hero_product') {
        pattern = industryDefault;
        confidence = 0.7;
    }

    return { pattern, confidence };
}

/**
 * Generate precise composition instructions for SVG rendering
 */
function generateCompositionInstructions({ layoutDecision, backgroundAnalysis, headline, tagline, features, stats, cta, industry }) {
    const instructions = {
        // Text positions (0-100 percentages, converted to pixels later)
        headline: null,
        tagline: null,
        cta: null,
        features: [],
        stats: [],

        // Styling
        textColor: backgroundAnalysis.suggestedTextColor || '#FFFFFF',
        needsShadow: backgroundAnalysis.needsTextShadow,

        // Layout-specific elements
        elements: []
    };

    const recommended = backgroundAnalysis.recommendedLayout || {};
    const industryConfig = getIndustryConfig(industry);

    // Headline positioning
    if (headline) {
        instructions.headline = {
            text: headline,
            x: recommended.headline?.x ?? 50,
            y: recommended.headline?.y ?? 10,
            maxWidth: recommended.headline?.maxWidth ?? 80,
            alignment: recommended.headline?.alignment ?? 'center',
            fontSize: layoutDecision.pattern === 'hero_product' ? 64 : 48,
            fontWeight: 700,
            color: instructions.textColor
        };
    }

    // Tagline positioning
    if (tagline) {
        instructions.tagline = {
            text: tagline,
            x: recommended.headline?.x ?? 50,
            y: (recommended.headline?.y ?? 10) + 8,
            alignment: recommended.headline?.alignment ?? 'center',
            fontSize: 22,
            fontWeight: 400,
            color: adjustOpacity(instructions.textColor, 0.8)
        };
    }

    // CTA positioning
    if (cta) {
        instructions.cta = {
            text: cta,
            x: recommended.cta?.x ?? 50,
            y: recommended.cta?.y ?? 92,
            style: 'button',
            backgroundColor: industryConfig.colors?.primary || '#FF4757',
            textColor: '#FFFFFF',
            fontSize: 18,
            fontWeight: 600,
            borderRadius: 30
        };
    }

    // Layout-specific features
    if (layoutDecision.pattern === 'feature_callout' && features.length > 0) {
        instructions.features = generateFeatureCalloutPositions(features, backgroundAnalysis);
        instructions.elements.push({ type: 'dotted_lines' });
    }

    if (layoutDecision.pattern === 'stats_grid' && stats.length > 0) {
        instructions.stats = generateStatsPositions(stats, backgroundAnalysis);
        instructions.elements.push({ type: 'arrows' });
    }

    return instructions;
}

/**
 * Generate feature callout positions based on background analysis
 */
function generateFeatureCalloutPositions(features, backgroundAnalysis) {
    const positions = [];
    const productBounds = backgroundAnalysis.productBounds || { x: 25, y: 25, width: 50, height: 50 };

    // Position features around the product
    const leftX = Math.max(5, productBounds.x - 25);
    const rightX = Math.min(95, productBounds.x + productBounds.width + 10);

    features.slice(0, 6).forEach((feature, i) => {
        const isLeft = i % 2 === 0;
        const yBase = 30 + (i * 15);

        positions.push({
            text: feature,
            x: isLeft ? leftX : rightX,
            y: Math.min(yBase, 80),
            alignment: isLeft ? 'end' : 'start',
            anchorX: isLeft ? productBounds.x : productBounds.x + productBounds.width,
            anchorY: yBase,
            hasLine: true,
            hasMarker: true
        });
    });

    return positions;
}

/**
 * Generate stats positions
 */
function generateStatsPositions(stats, backgroundAnalysis) {
    const positions = [];
    const productBounds = backgroundAnalysis.productBounds || { x: 25, y: 25, width: 50, height: 50 };

    stats.slice(0, 6).forEach((stat, i) => {
        const isLeft = i % 2 === 0;
        const row = Math.floor(i / 2);

        positions.push({
            value: stat.value || stat,
            label: stat.label || '',
            x: isLeft ? 15 : 85,
            y: 35 + (row * 18),
            alignment: isLeft ? 'start' : 'end',
            hasArrow: true,
            arrowTarget: {
                x: isLeft ? productBounds.x : productBounds.x + productBounds.width,
                y: 45 + (row * 12)
            }
        });
    });

    return positions;
}

/**
 * Get most common pattern from analysis
 */
function getMostCommonPattern(layouts) {
    if (!layouts || Object.keys(layouts).length === 0) return null;

    const sorted = Object.entries(layouts).sort((a, b) => b[1] - a[1]);
    return { pattern: sorted[0][0], count: sorted[0][1] };
}

/**
 * Adjust color opacity
 */
function adjustOpacity(hexColor, opacity) {
    if (!hexColor) return 'rgba(255,255,255,' + opacity + ')';

    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    return `rgba(${r},${g},${b},${opacity})`;
}

/**
 * Default patterns when no references available
 */
function getDefaultPatterns() {
    return {
        layouts: { hero_product: 1 },
        typography: {
            headlineSizes: ['large'],
            headlineWeights: ['bold']
        },
        elements: {
            hasArrows: 0,
            hasBadges: 0,
            hasDottedLines: 0
        },
        colors: []
    };
}

export default { directAdDesign };
