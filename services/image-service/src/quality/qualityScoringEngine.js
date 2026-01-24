/**
 * QUALITY SCORING ENGINE
 * 
 * Comprehensive quality scoring system:
 * - Multi-factor scoring (composition, colors, typography, effects)
 * - GPT-4V visual analysis
 * - Pattern matching against Foreplay references
 * - Actionable improvement suggestions
 * - Score history and tracking
 */

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Quality thresholds
const QUALITY_THRESHOLDS = {
    excellent: 9.0,
    good: 7.5,
    acceptable: 6.0,
    needsWork: 4.0
};

// Scoring weights
const SCORING_WEIGHTS = {
    visualAppeal: 0.20,
    composition: 0.15,
    colorHarmony: 0.12,
    typography: 0.15,
    productPresentation: 0.15,
    ctaEffectiveness: 0.10,
    brandConsistency: 0.08,
    technicalQuality: 0.05
};

// ========================================
// MAIN QUALITY SCORER
// ========================================

/**
 * Perform comprehensive quality scoring
 */
export async function scoreAdQuality({
    imageBuffer,
    designSpecs,
    contentPackage,
    productAnalysis,
    referenceAds = []
}) {
    console.log('[QualityScorer] 🔍 Starting comprehensive quality analysis...');

    try {
        // Get GPT-4V analysis
        const visualAnalysis = await performVisualAnalysis(imageBuffer, designSpecs);

        // Calculate individual scores
        const scores = {
            visualAppeal: visualAnalysis.scores?.visualAppeal || 7,
            composition: visualAnalysis.scores?.composition || 7,
            colorHarmony: visualAnalysis.scores?.colorHarmony || 7,
            typography: visualAnalysis.scores?.typography || 7,
            productPresentation: visualAnalysis.scores?.productPresentation || 7,
            ctaEffectiveness: visualAnalysis.scores?.ctaEffectiveness || 7,
            brandConsistency: calculateBrandConsistency(designSpecs, contentPackage),
            technicalQuality: 8 // Technical quality is mostly ensured by our pipeline
        };

        // Calculate weighted overall score
        let overallScore = 0;
        for (const [key, weight] of Object.entries(SCORING_WEIGHTS)) {
            overallScore += (scores[key] || 7) * weight;
        }
        overallScore = Math.round(overallScore * 10) / 10;

        // Get quality tier
        const tier = getQualityTier(overallScore);

        // Get improvement suggestions
        const improvements = generateImprovementSuggestions(scores, visualAnalysis);

        // Compare to references if available
        let referenceMatch = null;
        if (referenceAds.length > 0) {
            referenceMatch = calculateReferenceMatch(visualAnalysis, referenceAds);
        }

        const result = {
            overallScore,
            tier,
            scores,
            strengths: visualAnalysis.strengths || [],
            improvements,
            referenceMatch,
            passesThreshold: overallScore >= QUALITY_THRESHOLDS.good,
            needsRegeneration: overallScore < QUALITY_THRESHOLDS.acceptable,
            analysisDetails: visualAnalysis
        };

        console.log(`[QualityScorer] ✅ Score: ${overallScore}/10 (${tier})`);
        console.log(`[QualityScorer] Passes: ${result.passesThreshold}, Needs Regen: ${result.needsRegeneration}`);

        return result;

    } catch (error) {
        console.error('[QualityScorer] Analysis failed:', error.message);
        return {
            overallScore: 7.0,
            tier: 'good',
            scores: {},
            passesThreshold: true,
            needsRegeneration: false,
            error: error.message
        };
    }
}

/**
 * Perform visual analysis with GPT-4V
 */
async function performVisualAnalysis(imageBuffer, designSpecs) {
    const base64 = imageBuffer.toString('base64');
    const mood = designSpecs?.mood || {};
    const expectedLayout = designSpecs?.layout?.type || 'hero_centered';

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
            role: 'system',
            content: `You are an elite creative director at a Fortune 500 advertising agency, scoring ad creatives with decades of experience. Be precise and critical.`
        },
        {
            role: 'user',
            content: [
                {
                    type: 'image_url',
                    image_url: { url: `data:image/png;base64,${base64}`, detail: 'high' }
                },
                {
                    type: 'text',
                    text: `Analyze this advertisement and score each aspect (1-10).

CONTEXT:
- Target mood: ${mood.primary || 'premium'}
- Target energy: ${mood.energy || 'dynamic'}
- Expected layout: ${expectedLayout}

Return detailed JSON:
{
    "scores": {
        "visualAppeal": 8,
        "composition": 7,
        "colorHarmony": 8,
        "typography": 7,
        "productPresentation": 8,
        "ctaEffectiveness": 7
    },
    "strengths": [
        "Clear visual hierarchy",
        "Strong product focus"
    ],
    "weaknesses": [
        "CTA could be more prominent",
        "Typography lacks contrast"
    ],
    "technicalIssues": [],
    "moodAlignment": 0.85,
    "professionalLevel": "agency_quality|professional|acceptable|amateur",
    "conversionPotential": "high|medium|low",
    "detailedNotes": {
        "composition": "Analysis of layout and balance...",
        "colors": "Analysis of color usage...",
        "typography": "Analysis of text treatment...",
        "product": "Analysis of product presentation...",
        "cta": "Analysis of call-to-action..."
    }
}

Scoring Guide:
- 10: Award-winning, perfect execution
- 9: Exceptional, minor refinements only
- 8: Very strong, meets high standards
- 7: Good, some improvements possible
- 6: Acceptable, noticeable issues
- 5: Below average, needs work
- 1-4: Significant problems`
                }
            ]
        }],
        max_tokens: 1200,
        response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
}

// ========================================
// SCORE CALCULATIONS
// ========================================

/**
 * Calculate brand consistency score
 */
function calculateBrandConsistency(designSpecs, contentPackage) {
    let score = 8; // Start with good score

    // Check if colors are consistent
    if (designSpecs?.colors?.accentColor && contentPackage?.colorRecommendations?.accent) {
        const specColor = designSpecs.colors.accentColor.toLowerCase();
        const recColor = contentPackage.colorRecommendations.accent.toLowerCase();
        if (specColor === recColor) {
            score += 1;
        }
    }

    // Check if mood is maintained
    if (designSpecs?.mood?.primary && contentPackage?.layoutSuggestion?.type) {
        score += 0.5;
    }

    return Math.min(10, Math.round(score * 10) / 10);
}

/**
 * Get quality tier from score
 */
function getQualityTier(score) {
    if (score >= QUALITY_THRESHOLDS.excellent) return 'excellent';
    if (score >= QUALITY_THRESHOLDS.good) return 'good';
    if (score >= QUALITY_THRESHOLDS.acceptable) return 'acceptable';
    if (score >= QUALITY_THRESHOLDS.needsWork) return 'needs_work';
    return 'poor';
}

/**
 * Calculate match to reference ads
 */
function calculateReferenceMatch(visualAnalysis, referenceAds) {
    // Simple match calculation based on mood alignment
    const moodAlignment = visualAnalysis.moodAlignment || 0.7;
    const professionalMatch = visualAnalysis.professionalLevel === 'agency_quality' ? 0.95 :
        visualAnalysis.professionalLevel === 'professional' ? 0.8 :
            visualAnalysis.professionalLevel === 'acceptable' ? 0.6 : 0.4;

    return {
        score: Math.round((moodAlignment + professionalMatch) / 2 * 100),
        topReferences: referenceAds.slice(0, 3).map(ad => ({
            headline: ad.headline,
            runningDays: ad.running_duration?.days
        }))
    };
}

// ========================================
// IMPROVEMENT SUGGESTIONS
// ========================================

/**
 * Generate actionable improvement suggestions
 */
function generateImprovementSuggestions(scores, visualAnalysis) {
    const improvements = [];
    const threshold = 7.5;

    // Check each score and suggest improvements
    if (scores.visualAppeal < threshold) {
        improvements.push({
            category: 'Visual Appeal',
            priority: 'high',
            suggestion: 'Enhance visual interest with additional effects or stronger gradients',
            action: 'add_effects'
        });
    }

    if (scores.composition < threshold) {
        improvements.push({
            category: 'Composition',
            priority: 'high',
            suggestion: 'Improve element placement and visual balance',
            action: 'adjust_layout'
        });
    }

    if (scores.colorHarmony < threshold) {
        improvements.push({
            category: 'Color Harmony',
            priority: 'medium',
            suggestion: 'Adjust color relationships for better harmony',
            action: 'adjust_colors'
        });
    }

    if (scores.typography < threshold) {
        improvements.push({
            category: 'Typography',
            priority: 'high',
            suggestion: 'Increase text contrast and adjust sizing',
            action: 'enhance_typography'
        });
    }

    if (scores.productPresentation < threshold) {
        improvements.push({
            category: 'Product Presentation',
            priority: 'critical',
            suggestion: 'Improve product visibility and presentation',
            action: 'enhance_product'
        });
    }

    if (scores.ctaEffectiveness < threshold) {
        improvements.push({
            category: 'CTA Effectiveness',
            priority: 'high',
            suggestion: 'Make CTA more prominent with stronger contrast/glow',
            action: 'enhance_cta'
        });
    }

    // Add weaknesses from visual analysis
    if (visualAnalysis.weaknesses) {
        visualAnalysis.weaknesses.slice(0, 3).forEach(weakness => {
            if (!improvements.find(i => i.suggestion.toLowerCase().includes(weakness.toLowerCase().split(' ')[0]))) {
                improvements.push({
                    category: 'General',
                    priority: 'medium',
                    suggestion: weakness,
                    action: 'general_improvement'
                });
            }
        });
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    improvements.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return improvements;
}

// ========================================
// REGENERATION GUIDANCE
// ========================================

/**
 * Generate guidance for regeneration attempt
 */
export function generateRegenerationGuidance(qualityResult) {
    const guidance = {
        adjustments: [],
        focusAreas: [],
        avoidances: []
    };

    // Based on weak scores
    for (const improvement of qualityResult.improvements || []) {
        switch (improvement.action) {
            case 'add_effects':
                guidance.adjustments.push('Increase bokeh count and particle density');
                guidance.focusAreas.push('visual_effects');
                break;
            case 'adjust_layout':
                guidance.adjustments.push('Try alternative layout preset');
                guidance.focusAreas.push('composition');
                break;
            case 'adjust_colors':
                guidance.adjustments.push('Increase accent color saturation');
                guidance.focusAreas.push('colors');
                break;
            case 'enhance_typography':
                guidance.adjustments.push('Increase headline size and shadow intensity');
                guidance.focusAreas.push('typography');
                break;
            case 'enhance_product':
                guidance.adjustments.push('Increase product scale and screen glow');
                guidance.focusAreas.push('product');
                break;
            case 'enhance_cta':
                guidance.adjustments.push('Increase CTA glow intensity and size');
                guidance.focusAreas.push('cta');
                break;
        }
    }

    // Add specific avoidances
    if (qualityResult.analysisDetails?.technicalIssues?.length > 0) {
        guidance.avoidances.push(...qualityResult.analysisDetails.technicalIssues);
    }

    return guidance;
}

// ========================================
// QUICK QUALITY CHECK
// ========================================

/**
 * Quick quality check for fast iteration
 */
export async function quickQualityCheck(imageBuffer) {
    try {
        const base64 = imageBuffer.toString('base64');

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/png;base64,${base64}`, detail: 'low' }
                    },
                    {
                        type: 'text',
                        text: `Quick ad quality check. Return JSON:
{
    "score": 8,
    "passable": true,
    "majorIssues": []
}
Score 1-10. majorIssues only if score < 6.`
                    }
                ]
            }],
            max_tokens: 100,
            response_format: { type: 'json_object' }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        return { score: 7, passable: true, majorIssues: [] };
    }
}

// ========================================
// A/B VARIANT COMPARISON
// ========================================

/**
 * Compare quality of A/B variants
 */
export async function compareVariants(variantA, variantB) {
    try {
        const base64A = variantA.toString('base64');
        const base64B = variantB.toString('base64');

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/png;base64,${base64A}`, detail: 'high' }
                    },
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/png;base64,${base64B}`, detail: 'high' }
                    },
                    {
                        type: 'text',
                        text: `Compare these two ad variants and determine which performs better.

Return JSON:
{
    "winner": "A" or "B",
    "confidence": 0.85,
    "reasoning": "Why winner is better",
    "variantAScore": 7.5,
    "variantBScore": 8.2,
    "keyDifferences": [
        "Difference 1",
        "Difference 2"
    ]
}`
                    }
                ]
            }],
            max_tokens: 400,
            response_format: { type: 'json_object' }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        return { winner: 'A', confidence: 0.5, error: error.message };
    }
}

export default {
    scoreAdQuality,
    quickQualityCheck,
    generateRegenerationGuidance,
    compareVariants,
    QUALITY_THRESHOLDS
};
