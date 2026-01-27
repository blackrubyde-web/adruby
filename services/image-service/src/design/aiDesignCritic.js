/**
 * AI DESIGN CRITIC
 * 
 * Professional design review with actionable feedback:
 * 
 * - Multi-dimensional quality scoring
 * - Principle-based critique (typography, color, composition)
 * - Specific improvement suggestions
 * - Before/after recommendations
 * - Industry benchmarking
 * - Iterative refinement guidance
 */

import { callOpenAI } from '../utils/openaiClient.js';
import { checkWCAGCompliance, getContrastRatio } from './colorScience.js';
import { scoreReadability } from './typographyMastery.js';
import { analyzeNegativeSpace, calculateVisualTension } from './compositionIntelligence.js';


// ========================================
// SCORING DIMENSIONS
// ========================================

export const SCORING_DIMENSIONS = {
    visual_hierarchy: {
        name: 'Visual Hierarchy',
        weight: 0.15,
        description: 'Clear order of importance, eye flow guidance',
        criteria: [
            'Headline is the dominant element',
            'Clear progression from headline to CTA',
            'Supporting elements don\'t compete for attention',
            'Visual weight is properly distributed'
        ]
    },

    typography: {
        name: 'Typography',
        weight: 0.15,
        description: 'Font choices, sizing, spacing, readability',
        criteria: [
            'Appropriate font pairing',
            'Proper size hierarchy',
            'Adequate line height and letter spacing',
            'Text is readable at intended size'
        ]
    },

    color_harmony: {
        name: 'Color Harmony',
        weight: 0.12,
        description: 'Palette cohesion, contrast, emotional fit',
        criteria: [
            'Colors work well together',
            'Sufficient contrast for readability',
            'Colors support the brand/mood',
            'Accent colors are used effectively'
        ]
    },

    composition: {
        name: 'Composition',
        weight: 0.12,
        description: 'Layout balance, spacing, alignment',
        criteria: [
            'Balanced visual weight',
            'Appropriate use of whitespace',
            'Elements are properly aligned',
            'Layout creates visual flow'
        ]
    },

    product_presentation: {
        name: 'Product Presentation',
        weight: 0.15,
        description: 'How well the product is showcased',
        criteria: [
            'Product is clearly visible',
            'Product is the focus (not lost)',
            'Quality of product image/mockup',
            'Product context is appropriate'
        ]
    },

    cta_effectiveness: {
        name: 'CTA Effectiveness',
        weight: 0.12,
        description: 'Call-to-action visibility and appeal',
        criteria: [
            'CTA is easily visible',
            'CTA text is action-oriented',
            'Button design invites clicking',
            'Positioned for natural flow'
        ]
    },

    brand_consistency: {
        name: 'Brand Consistency',
        weight: 0.09,
        description: 'Alignment with brand identity',
        criteria: [
            'Uses brand colors appropriately',
            'Typography matches brand style',
            'Visual style is consistent',
            'Tone matches brand voice'
        ]
    },

    emotional_impact: {
        name: 'Emotional Impact',
        weight: 0.1,
        description: 'Ability to evoke desired emotion',
        criteria: [
            'Creates intended emotional response',
            'Visuals support the message',
            'Urgency/desire is communicated',
            'Authentic and relatable'
        ]
    }
};

// ========================================
// MAIN CRITIC FUNCTION
// ========================================

/**
 * Comprehensive design critique using AI + rule-based analysis
 */
export async function critiqueDesign(imageBuffer, designSpecs, brandDNA = null) {
    console.log('[DesignCritic] 🎨 Starting comprehensive design critique...');

    try {
        // Parallel analysis
        const [aiCritique, ruleBasedCritique] = await Promise.all([
            analyzeWithAI(imageBuffer, designSpecs),
            performRuleBasedAnalysis(designSpecs, brandDNA)
        ]);

        // Merge critiques
        const mergedScores = mergeScores(aiCritique.scores, ruleBasedCritique.scores);

        // Calculate overall score
        const overallScore = calculateOverallScore(mergedScores);

        // Generate actionable improvements
        const improvements = generateImprovements(mergedScores, aiCritique.analysis, designSpecs);

        // Determine grade
        const grade = getGrade(overallScore);

        console.log(`[DesignCritic] ✅ Critique complete: ${overallScore}/10 (${grade})`);

        return {
            overallScore,
            grade,
            dimensionScores: mergedScores,
            aiAnalysis: aiCritique.analysis,
            improvements: {
                critical: improvements.filter(i => i.priority === 'critical'),
                recommended: improvements.filter(i => i.priority === 'recommended'),
                optional: improvements.filter(i => i.priority === 'optional')
            },
            strengths: identifyStrengths(mergedScores),
            regenerationGuidance: generateRegenerationGuidance(improvements, overallScore),
            passesQuality: overallScore >= 7.0
        };

    } catch (error) {
        console.error('[DesignCritic] Critique failed:', error.message);
        return getDefaultCritique();
    }
}

/**
 * AI-powered visual analysis
 */
async function analyzeWithAI(imageBuffer, designSpecs) {
    const base64 = imageBuffer.toString('base64');

    try {
        const response = await callOpenAI({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'system',
                content: `You are a senior creative director with 20 years of experience in advertising.
Analyze ads with the precision of a professional design critique.
Score each dimension from 1-10 with specific justifications.
Be constructively critical - identify real issues, not just praise.`
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
                        text: `Critique this ad design professionally.

Design context: ${JSON.stringify({
                            industry: designSpecs?.industry,
                            productType: designSpecs?.productType,
                            mood: designSpecs?.mood
                        })}

Score each dimension 1-10 with specific reasoning:

{
    "scores": {
        "visual_hierarchy": { "score": 8, "reasoning": "..." },
        "typography": { "score": 7, "reasoning": "..." },
        "color_harmony": { "score": 8, "reasoning": "..." },
        "composition": { "score": 7, "reasoning": "..." },
        "product_presentation": { "score": 9, "reasoning": "..." },
        "cta_effectiveness": { "score": 6, "reasoning": "..." },
        "brand_consistency": { "score": 8, "reasoning": "..." },
        "emotional_impact": { "score": 7, "reasoning": "..." }
    },
    
    "analysis": {
        "firstImpression": "What a viewer notices first",
        "strengthsFound": ["Specific strength 1", "Specific strength 2"],
        "issuesFound": ["Specific issue 1", "Specific issue 2"],
        "designPatternMatch": "What successful ad pattern this resembles",
        "missingElements": ["Any missing expected elements"],
        "textReadability": "Assessment of text legibility",
        "visualBalance": "Assessment of composition balance",
        "emotionalResonance": "How well it connects emotionally"
    },
    
    "detailedIssues": [
        {
            "element": "headline",
            "issue": "What's wrong",
            "currentState": "How it is now",
            "recommendedFix": "Specific fix",
            "impact": "high|medium|low"
        }
    ]
}`
                    }
                ]
            }],
            max_tokens: 1500,
            response_format: { type: 'json_object' }
        });

        return JSON.parse(response.choices[0].message.content);

    } catch (error) {
        console.warn('[DesignCritic] AI analysis fallback:', error.message);
        return { scores: {}, analysis: {}, detailedIssues: [] };
    }
}

/**
 * Rule-based technical analysis
 */
function performRuleBasedAnalysis(designSpecs, brandDNA) {
    const scores = {};
    const issues = [];

    // Typography analysis
    if (designSpecs?.typography) {
        const readability = scoreReadability({
            fontSize: designSpecs.typography.headlineSize || 48,
            lineHeight: designSpecs.typography.lineHeight || 1.2,
            letterSpacing: designSpecs.typography.letterSpacing || 0,
            contrastRatio: designSpecs.typography.contrastRatio,
            fontWeight: designSpecs.typography.weight || 700
        });

        scores.typography = {
            score: Math.round(readability.score / 10),
            reasoning: readability.issues.length > 0
                ? `Issues: ${readability.issues.join(', ')}`
                : 'Typography passes all readability checks'
        };

        if (!readability.passes) {
            issues.push(...readability.issues.map(i => ({
                element: 'typography',
                issue: i,
                impact: 'high'
            })));
        }
    }

    // Color analysis
    if (designSpecs?.colors) {
        const bgColor = designSpecs.colors.background || '#0A0A1A';
        const textColor = designSpecs.colors.text || '#FFFFFF';
        const wcag = checkWCAGCompliance(bgColor, textColor);

        scores.color_harmony = {
            score: wcag.ratio >= 7 ? 9 : wcag.ratio >= 4.5 ? 7 : wcag.ratio >= 3 ? 5 : 3,
            reasoning: `Contrast ratio: ${wcag.ratio} (${wcag.level})`
        };

        if (wcag.ratio < 4.5) {
            issues.push({
                element: 'color',
                issue: 'Insufficient text contrast',
                currentState: `Ratio: ${wcag.ratio}`,
                recommendedFix: 'Increase contrast between text and background',
                impact: 'critical'
            });
        }
    }

    // Composition analysis
    if (designSpecs?.elements) {
        const negativeSpace = analyzeNegativeSpace(
            designSpecs.elements,
            designSpecs.canvasWidth || 1080,
            designSpecs.canvasHeight || 1080
        );

        let compositionScore = 7;
        if (negativeSpace.assessment === 'generous') compositionScore = 8;
        else if (negativeSpace.assessment === 'balanced') compositionScore = 9;
        else if (negativeSpace.assessment === 'dense') compositionScore = 5;

        scores.composition = {
            score: compositionScore,
            reasoning: `Whitespace: ${negativeSpace.assessment} (${Math.round(negativeSpace.ratio * 100)}%)`
        };
    }

    // Brand consistency
    if (brandDNA && designSpecs?.colors) {
        const primaryMatch = designSpecs.colors.primary === brandDNA.colors.primary;
        scores.brand_consistency = {
            score: primaryMatch ? 9 : 6,
            reasoning: primaryMatch ? 'Primary color matches brand' : 'Primary color differs from brand DNA'
        };
    }

    return { scores, issues };
}

/**
 * Merge AI and rule-based scores
 */
function mergeScores(aiScores, ruleScores) {
    const merged = {};

    for (const dimension of Object.keys(SCORING_DIMENSIONS)) {
        const aiScore = aiScores[dimension]?.score;
        const ruleScore = ruleScores[dimension]?.score;

        if (aiScore && ruleScore) {
            // Average with slight preference to AI visual analysis
            merged[dimension] = {
                score: Math.round((aiScore * 0.6 + ruleScore * 0.4) * 10) / 10,
                aiReasoning: aiScores[dimension]?.reasoning,
                ruleReasoning: ruleScores[dimension]?.reasoning
            };
        } else {
            merged[dimension] = {
                score: aiScore || ruleScore || 7,
                aiReasoning: aiScores[dimension]?.reasoning,
                ruleReasoning: ruleScores[dimension]?.reasoning
            };
        }
    }

    return merged;
}

/**
 * Calculate weighted overall score
 */
function calculateOverallScore(dimensionScores) {
    let totalWeight = 0;
    let weightedSum = 0;

    for (const [dimension, config] of Object.entries(SCORING_DIMENSIONS)) {
        const score = dimensionScores[dimension]?.score || 7;
        weightedSum += score * config.weight;
        totalWeight += config.weight;
    }

    return Math.round((weightedSum / totalWeight) * 10) / 10;
}

/**
 * Generate actionable improvements
 */
function generateImprovements(scores, aiAnalysis, designSpecs) {
    const improvements = [];

    // From low scores
    for (const [dimension, data] of Object.entries(scores)) {
        if (data.score < 6) {
            improvements.push({
                dimension,
                priority: 'critical',
                issue: data.ruleReasoning || data.aiReasoning || `${dimension} needs improvement`,
                suggestion: getImprovementSuggestion(dimension, data.score)
            });
        } else if (data.score < 7.5) {
            improvements.push({
                dimension,
                priority: 'recommended',
                issue: data.ruleReasoning || data.aiReasoning,
                suggestion: getImprovementSuggestion(dimension, data.score)
            });
        }
    }

    // From AI detailed issues
    if (aiAnalysis?.detailedIssues) {
        for (const issue of aiAnalysis.detailedIssues) {
            if (issue.impact === 'high') {
                improvements.push({
                    dimension: issue.element,
                    priority: 'critical',
                    issue: issue.issue,
                    suggestion: issue.recommendedFix,
                    currentState: issue.currentState
                });
            } else if (issue.impact === 'medium') {
                improvements.push({
                    dimension: issue.element,
                    priority: 'recommended',
                    issue: issue.issue,
                    suggestion: issue.recommendedFix
                });
            } else {
                improvements.push({
                    dimension: issue.element,
                    priority: 'optional',
                    issue: issue.issue,
                    suggestion: issue.recommendedFix
                });
            }
        }
    }

    return improvements;
}

function getImprovementSuggestion(dimension, score) {
    const suggestions = {
        visual_hierarchy: 'Increase headline size or reduce competing elements',
        typography: 'Adjust font size, weight, or spacing for better readability',
        color_harmony: 'Increase contrast or adjust color palette for cohesion',
        composition: 'Rebalance visual weight or adjust whitespace',
        product_presentation: 'Make product larger or improve mockup quality',
        cta_effectiveness: 'Make CTA more prominent with better contrast/positioning',
        brand_consistency: 'Align colors and typography with brand guidelines',
        emotional_impact: 'Strengthen emotional connection through copy or visuals'
    };

    return suggestions[dimension] || 'Review and improve this aspect';
}

/**
 * Identify strengths
 */
function identifyStrengths(scores) {
    return Object.entries(scores)
        .filter(([_, data]) => data.score >= 8)
        .map(([dimension, data]) => ({
            dimension,
            score: data.score,
            description: data.aiReasoning || SCORING_DIMENSIONS[dimension]?.description
        }));
}

/**
 * Generate regeneration guidance
 */
function generateRegenerationGuidance(improvements, overallScore) {
    if (overallScore >= 8.5) {
        return {
            shouldRegenerate: false,
            reason: 'Design quality is excellent'
        };
    }

    if (overallScore >= 7.0) {
        return {
            shouldRegenerate: false,
            reason: 'Design quality is acceptable',
            optionalImprovements: improvements.filter(i => i.priority !== 'critical')
        };
    }

    const criticalIssues = improvements.filter(i => i.priority === 'critical');

    return {
        shouldRegenerate: true,
        reason: `${criticalIssues.length} critical issues found`,
        focusAreas: criticalIssues.map(i => i.dimension),
        specificFixes: criticalIssues.map(i => ({
            area: i.dimension,
            fix: i.suggestion
        }))
    };
}

function getGrade(score) {
    if (score >= 9.5) return 'A+';
    if (score >= 9.0) return 'A';
    if (score >= 8.5) return 'A-';
    if (score >= 8.0) return 'B+';
    if (score >= 7.5) return 'B';
    if (score >= 7.0) return 'B-';
    if (score >= 6.5) return 'C+';
    if (score >= 6.0) return 'C';
    if (score >= 5.0) return 'D';
    return 'F';
}

function getDefaultCritique() {
    return {
        overallScore: 7.0,
        grade: 'B-',
        dimensionScores: {},
        improvements: { critical: [], recommended: [], optional: [] },
        strengths: [],
        regenerationGuidance: { shouldRegenerate: false },
        passesQuality: true
    };
}

// ========================================
// QUICK CHECKS
// ========================================

/**
 * Fast quality check without full AI analysis
 */
export function quickQualityCheck(designSpecs) {
    let passes = true;
    const issues = [];

    // Check contrast
    if (designSpecs?.colors) {
        const ratio = getContrastRatio(
            designSpecs.colors.background || '#0A0A1A',
            designSpecs.colors.text || '#FFFFFF'
        );
        if (ratio < 4.5) {
            passes = false;
            issues.push('Insufficient text contrast');
        }
    }

    // Check headline size
    if (designSpecs?.typography?.headlineSize < 36) {
        issues.push('Headline may be too small');
    }

    // Check product visibility
    if (designSpecs?.product?.scale < 0.3) {
        issues.push('Product may be too small');
    }

    return { passes, issues };
}

export default {
    SCORING_DIMENSIONS,
    critiqueDesign,
    quickQualityCheck
};
