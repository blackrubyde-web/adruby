/**
 * DEEP FOREPLAY PATTERN MATCHER
 * 
 * Advanced analysis of Foreplay reference ads:
 * - Pattern extraction across multiple dimensions
 * - Style clustering and matching
 * - Performance correlation
 * - Trend detection
 * - Best practice extraction
 */

import OpenAI from 'openai';
import { getIndustryConfig } from '../data/industryDatabase.js';
import { getEmotionsForProduct } from '../data/emotionMoodSystem.js';
import { getProductVisualRules } from '../rules/productVisualRules.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ========================================
// PATTERN CATEGORIES
// ========================================

export const PATTERN_CATEGORIES = {
    layout: {
        name: 'Layout Pattern',
        aspects: ['product_position', 'text_alignment', 'whitespace', 'element_distribution', 'grid_structure']
    },
    color: {
        name: 'Color Pattern',
        aspects: ['dominant_color', 'accent_usage', 'gradient_style', 'contrast_level', 'mood_mapping']
    },
    typography: {
        name: 'Typography Pattern',
        aspects: ['headline_style', 'font_weight', 'letter_spacing', 'hierarchy', 'effects']
    },
    imagery: {
        name: 'Imagery Pattern',
        aspects: ['product_presentation', 'background_treatment', 'decorative_elements', 'photo_style']
    },
    cta: {
        name: 'CTA Pattern',
        aspects: ['button_style', 'position', 'color_contrast', 'size', 'text_approach']
    },
    effects: {
        name: 'Effects Pattern',
        aspects: ['shadows', 'glows', 'particles', 'gradients', 'textures']
    },
    messaging: {
        name: 'Messaging Pattern',
        aspects: ['headline_approach', 'value_proposition', 'urgency', 'social_proof']
    }
};

// ========================================
// FOREPLAY PATTERN EXTRACTOR
// ========================================

/**
 * Deep analyze Foreplay reference ads
 */
export async function deepAnalyzeForeplayPatterns(referenceAds, productAnalysis) {
    if (!referenceAds || referenceAds.length === 0) {
        return getDefaultPatterns(productAnalysis);
    }

    console.log(`[ForeplayPatterns] Analyzing ${referenceAds.length} reference ads...`);

    try {
        // Sort by running days (performance indicator)
        const sortedAds = referenceAds.sort((a, b) =>
            (b.running_duration?.days || 0) - (a.running_duration?.days || 0)
        );

        // Take top performers
        const topAds = sortedAds.slice(0, Math.min(5, sortedAds.length));

        // Analyze each ad
        const adAnalyses = await Promise.all(
            topAds.map(ad => analyzeIndividualAd(ad))
        );

        // Synthesize patterns across ads
        const synthesizedPatterns = synthesizePatterns(adAnalyses);

        // Add industry-specific adjustments
        const industryConfig = getIndustryConfig(productAnalysis?.industry);
        const adjustedPatterns = adjustForIndustry(synthesizedPatterns, industryConfig);

        // Add emotion-based enhancements
        const emotions = getEmotionsForProduct(productAnalysis?.productType, 'all');
        const emotionalPatterns = addEmotionalLayer(adjustedPatterns, emotions);

        console.log('[ForeplayPatterns] ✅ Pattern analysis complete');

        return {
            patterns: emotionalPatterns,
            confidence: calculateConfidence(adAnalyses),
            topReferences: topAds.slice(0, 3).map(ad => ({
                headline: ad.headline,
                runningDays: ad.running_duration?.days,
                source: ad.source
            })),
            recommendations: generateRecommendations(emotionalPatterns, productAnalysis)
        };

    } catch (error) {
        console.error('[ForeplayPatterns] Analysis failed:', error.message);
        return getDefaultPatterns(productAnalysis);
    }
}

/**
 * Analyze individual ad
 */
async function analyzeIndividualAd(ad) {
    // Get image if available
    const imageUrl = ad.image_url || ad.screenshot;

    if (imageUrl) {
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{
                    role: 'system',
                    content: 'You are an expert ad creative analyst. Extract precise design patterns from ads.'
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: { url: imageUrl, detail: 'high' }
                        },
                        {
                            type: 'text',
                            text: `Analyze this high-performing ad and extract design patterns.

Return JSON:
{
    "layout": {
        "type": "centered|left|right|split|floating",
        "gridType": "symmetric|asymmetric|dynamic",
        "productPositionX": 0.5,
        "productPositionY": 0.48,
        "productScale": 0.55,
        "whitespace": "minimal|balanced|generous",
        "textAlignment": "center|left|right"
    },
    "color": {
        "backgroundType": "solid|gradient|mesh|image",
        "primaryBg": "#hex",
        "secondaryBg": "#hex",
        "accentColor": "#hex",
        "textColor": "#hex",
        "isDark": true,
        "hasVignette": true,
        "gradientDirection": "radial|linear|mesh"
    },
    "typography": {
        "headlineSize": "small|medium|large|xlarge",
        "headlineWeight": "normal|bold|black",
        "headlinePosition": "top|middle|bottom",
        "hasTagline": true,
        "hasGradientText": false,
        "hasShadow": true,
        "letterSpacing": "tight|normal|wide"
    },
    "cta": {
        "style": "solid|gradient|outline|glass",
        "shape": "rounded|pill|square",
        "hasGlow": true,
        "position": "bottom|bottom_left|bottom_right",
        "size": "small|medium|large",
        "colorContrast": "high|medium|low"
    },
    "effects": {
        "hasBokeh": true,
        "hasParticles": true,
        "hasGradientMesh": false,
        "hasReflection": false,
        "hasScreenGlow": true,
        "shadowIntensity": "light|medium|heavy",
        "noiseTexture": true
    },
    "elements": {
        "hasBadges": true,
        "badgeTypes": ["rating", "award", "discount"],
        "hasFeatureCallouts": false,
        "hasSocialProof": true,
        "hasUrgencyElement": false
    },
    "mood": {
        "primary": "premium|playful|urgent|professional|luxury",
        "energy": "calm|balanced|dynamic|intense",
        "trustLevel": "high|medium|low_urgency"
    },
    "performance_indicators": {
        "visualClarity": 8,
        "hierarchyStrength": 9,
        "ctaVisibility": 8,
        "brandingConsistency": 7
    }
}`
                        }
                    ]
                }],
                max_tokens: 1200,
                response_format: { type: 'json_object' }
            });

            const analysis = JSON.parse(response.choices[0].message.content);
            return {
                ad,
                analysis,
                runningDays: ad.running_duration?.days || 0
            };

        } catch (error) {
            console.warn(`[ForeplayPatterns] Failed to analyze ad: ${error.message}`);
            return { ad, analysis: null };
        }
    }

    return { ad, analysis: null };
}

/**
 * Synthesize patterns across multiple ads
 */
function synthesizePatterns(adAnalyses) {
    const validAnalyses = adAnalyses.filter(a => a.analysis);

    if (validAnalyses.length === 0) {
        return null;
    }

    // Weight by running days
    const weightedAnalyses = validAnalyses.map(a => ({
        ...a,
        weight: Math.min(1 + (a.runningDays / 100), 3)
    }));

    const totalWeight = weightedAnalyses.reduce((sum, a) => sum + a.weight, 0);

    // Synthesize layout
    const layouts = validAnalyses.map(a => a.analysis.layout);
    const synthesizedLayout = {
        type: mostCommon(layouts.map(l => l.type)),
        gridType: mostCommon(layouts.map(l => l.gridType)),
        productPositionX: weightedAverage(layouts.map(l => l.productPositionX), weightedAnalyses.map(a => a.weight)),
        productPositionY: weightedAverage(layouts.map(l => l.productPositionY), weightedAnalyses.map(a => a.weight)),
        productScale: weightedAverage(layouts.map(l => l.productScale), weightedAnalyses.map(a => a.weight)),
        whitespace: mostCommon(layouts.map(l => l.whitespace)),
        textAlignment: mostCommon(layouts.map(l => l.textAlignment))
    };

    // Synthesize color
    const colors = validAnalyses.map(a => a.analysis.color);
    const synthesizedColor = {
        backgroundType: mostCommon(colors.map(c => c.backgroundType)),
        isDark: colors.filter(c => c.isDark).length > colors.length / 2,
        hasVignette: colors.filter(c => c.hasVignette).length > colors.length / 2,
        gradientDirection: mostCommon(colors.map(c => c.gradientDirection))
    };

    // Synthesize typography
    const typos = validAnalyses.map(a => a.analysis.typography);
    const synthesizedTypo = {
        headlineSize: mostCommon(typos.map(t => t.headlineSize)),
        headlineWeight: mostCommon(typos.map(t => t.headlineWeight)),
        headlinePosition: mostCommon(typos.map(t => t.headlinePosition)),
        hasTagline: typos.filter(t => t.hasTagline).length > typos.length / 2,
        hasGradientText: typos.filter(t => t.hasGradientText).length > typos.length / 3,
        hasShadow: typos.filter(t => t.hasShadow).length > typos.length / 2,
        letterSpacing: mostCommon(typos.map(t => t.letterSpacing))
    };

    // Synthesize CTA
    const ctas = validAnalyses.map(a => a.analysis.cta);
    const synthesizedCTA = {
        style: mostCommon(ctas.map(c => c.style)),
        shape: mostCommon(ctas.map(c => c.shape)),
        hasGlow: ctas.filter(c => c.hasGlow).length > ctas.length / 2,
        position: mostCommon(ctas.map(c => c.position)),
        size: mostCommon(ctas.map(c => c.size)),
        colorContrast: mostCommon(ctas.map(c => c.colorContrast))
    };

    // Synthesize effects
    const effects = validAnalyses.map(a => a.analysis.effects);
    const synthesizedEffects = {
        hasBokeh: effects.filter(e => e.hasBokeh).length > effects.length / 2,
        hasParticles: effects.filter(e => e.hasParticles).length > effects.length / 2,
        hasGradientMesh: effects.filter(e => e.hasGradientMesh).length > effects.length / 3,
        hasReflection: effects.filter(e => e.hasReflection).length > effects.length / 2,
        hasScreenGlow: effects.filter(e => e.hasScreenGlow).length > effects.length / 2,
        shadowIntensity: mostCommon(effects.map(e => e.shadowIntensity)),
        noiseTexture: effects.filter(e => e.noiseTexture).length > effects.length / 2
    };

    // Synthesize elements
    const elements = validAnalyses.map(a => a.analysis.elements);
    const synthesizedElements = {
        hasBadges: elements.filter(e => e.hasBadges).length > elements.length / 2,
        badgeTypes: [...new Set(elements.flatMap(e => e.badgeTypes || []))],
        hasFeatureCallouts: elements.filter(e => e.hasFeatureCallouts).length > elements.length / 3,
        hasSocialProof: elements.filter(e => e.hasSocialProof).length > elements.length / 2,
        hasUrgencyElement: elements.filter(e => e.hasUrgencyElement).length > elements.length / 3
    };

    // Synthesize mood
    const moods = validAnalyses.map(a => a.analysis.mood);
    const synthesizedMood = {
        primary: mostCommon(moods.map(m => m.primary)),
        energy: mostCommon(moods.map(m => m.energy)),
        trustLevel: mostCommon(moods.map(m => m.trustLevel))
    };

    return {
        layout: synthesizedLayout,
        color: synthesizedColor,
        typography: synthesizedTypo,
        cta: synthesizedCTA,
        effects: synthesizedEffects,
        elements: synthesizedElements,
        mood: synthesizedMood,
        sampleSize: validAnalyses.length
    };
}

/**
 * Adjust patterns for industry
 */
function adjustForIndustry(patterns, industryConfig) {
    if (!patterns || !industryConfig?.subCategory) return patterns;

    const subCat = industryConfig.subCategory;

    // Apply industry-specific adjustments
    if (subCat.visualStyle) {
        if (subCat.visualStyle.includes('dark')) {
            patterns.color.isDark = true;
        }
        if (subCat.visualStyle.includes('minimal')) {
            patterns.effects.hasBokeh = false;
            patterns.effects.hasParticles = false;
        }
    }

    if (subCat.ctaStyles?.includes('glow')) {
        patterns.cta.hasGlow = true;
    }

    return patterns;
}

/**
 * Add emotional layer to patterns
 */
function addEmotionalLayer(patterns, emotions) {
    if (!patterns || !emotions?.length) return patterns;

    const primaryEmotion = emotions[0];

    // Adjust based on emotion
    switch (primaryEmotion) {
        case 'excitement':
            patterns.effects.hasParticles = true;
            patterns.effects.hasSparkles = true;
            patterns.cta.hasGlow = true;
            break;
        case 'trust':
            patterns.elements.hasSocialProof = true;
            patterns.elements.hasBadges = true;
            patterns.mood.trustLevel = 'high';
            break;
        case 'fomo':
            patterns.elements.hasUrgencyElement = true;
            patterns.cta.colorContrast = 'high';
            break;
        case 'peace':
            patterns.effects.hasParticles = false;
            patterns.layout.whitespace = 'generous';
            break;
        case 'desire':
            patterns.effects.hasGlow = true;
            patterns.color.gradientDirection = 'radial';
            break;
    }

    patterns.emotionalContext = {
        primary: primaryEmotion,
        secondary: emotions[1] || null,
        appliedAdjustments: true
    };

    return patterns;
}

/**
 * Calculate confidence score
 */
function calculateConfidence(adAnalyses) {
    const validCount = adAnalyses.filter(a => a.analysis).length;
    const avgRunningDays = adAnalyses.reduce((sum, a) => sum + (a.runningDays || 0), 0) / Math.max(1, validCount);

    let confidence = 0.5;

    if (validCount >= 3) confidence += 0.2;
    if (validCount >= 5) confidence += 0.1;
    if (avgRunningDays >= 30) confidence += 0.1;
    if (avgRunningDays >= 60) confidence += 0.1;

    return Math.min(1, confidence);
}

/**
 * Generate recommendations
 */
function generateRecommendations(patterns, productAnalysis) {
    const recommendations = [];

    if (patterns.layout.type === 'centered') {
        recommendations.push({
            category: 'layout',
            recommendation: 'Use centered product placement for maximum focus',
            confidence: 'high'
        });
    }

    if (patterns.cta.hasGlow) {
        recommendations.push({
            category: 'cta',
            recommendation: 'Add glow effect to CTA button for visibility',
            confidence: 'high'
        });
    }

    if (patterns.elements.hasBadges) {
        recommendations.push({
            category: 'elements',
            recommendation: 'Include trust badges in top-right corner',
            confidence: 'medium'
        });
    }

    if (patterns.effects.hasBokeh) {
        recommendations.push({
            category: 'effects',
            recommendation: 'Add subtle bokeh effect to background',
            confidence: 'medium'
        });
    }

    return recommendations;
}

/**
 * Get default patterns
 */
function getDefaultPatterns(productAnalysis) {
    const productRules = getProductVisualRules(productAnalysis?.productType);

    return {
        patterns: {
            layout: {
                type: 'centered',
                gridType: 'symmetric',
                productPositionX: productRules?.mockup?.position?.x || 0.5,
                productPositionY: productRules?.mockup?.position?.y || 0.48,
                productScale: productRules?.mockup?.scale?.optimal || 0.55,
                whitespace: 'balanced',
                textAlignment: 'center'
            },
            color: {
                backgroundType: 'gradient',
                isDark: true,
                hasVignette: true,
                gradientDirection: 'radial'
            },
            typography: {
                headlineSize: 'large',
                headlineWeight: 'bold',
                headlinePosition: 'top',
                hasTagline: true,
                hasGradientText: false,
                hasShadow: true,
                letterSpacing: 'tight'
            },
            cta: {
                style: 'gradient',
                shape: 'pill',
                hasGlow: true,
                position: 'bottom',
                size: 'large',
                colorContrast: 'high'
            },
            effects: productRules?.effects || {
                hasBokeh: true,
                hasParticles: true,
                hasGradientMesh: false,
                hasReflection: false,
                hasScreenGlow: true,
                shadowIntensity: 'medium',
                noiseTexture: true
            },
            elements: {
                hasBadges: true,
                badgeTypes: ['rating'],
                hasFeatureCallouts: false,
                hasSocialProof: true,
                hasUrgencyElement: false
            },
            mood: {
                primary: 'premium',
                energy: 'dynamic',
                trustLevel: 'high'
            }
        },
        confidence: 0.6,
        isDefault: true
    };
}

// Helper functions
function mostCommon(arr) {
    if (!arr?.length) return null;
    const counts = {};
    arr.forEach(item => { counts[item] = (counts[item] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function weightedAverage(values, weights) {
    const validPairs = values.map((v, i) => [v, weights[i]]).filter(([v]) => v != null);
    if (validPairs.length === 0) return null;
    const sum = validPairs.reduce((acc, [v, w]) => acc + v * w, 0);
    const weightSum = validPairs.reduce((acc, [, w]) => acc + w, 0);
    return sum / weightSum;
}

export default {
    PATTERN_CATEGORIES,
    deepAnalyzeForeplayPatterns
};
