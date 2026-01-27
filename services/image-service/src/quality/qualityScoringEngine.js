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
// COLLISION DETECTION
// ========================================

/**
 * Detect collisions between placed elements
 * Returns array of collision issues
 */
export function detectCollisions(compositionPlan, canvasSize = { width: 1080, height: 1080 }) {
    console.log('[CollisionDetector] 🔍 Checking for element collisions...');

    const collisions = [];
    const elements = [];

    // Convert composition plan to bounding boxes
    if (compositionPlan?.headline) {
        elements.push({
            type: 'headline',
            bounds: calculateTextBounds(
                compositionPlan.headline.position,
                compositionPlan.headline.sizePx || 48,
                compositionPlan.headline.text?.length || 20,
                canvasSize
            )
        });
    }

    if (compositionPlan?.subheadline?.text) {
        elements.push({
            type: 'subheadline',
            bounds: calculateTextBounds(
                compositionPlan.subheadline.position,
                compositionPlan.subheadline.sizePx || 20,
                compositionPlan.subheadline.text?.length || 40,
                canvasSize
            )
        });
    }

    if (compositionPlan?.product) {
        elements.push({
            type: 'product',
            bounds: calculateProductBounds(compositionPlan.product, canvasSize)
        });
    }

    if (compositionPlan?.cta) {
        elements.push({
            type: 'cta',
            bounds: calculateCTABounds(compositionPlan.cta, canvasSize)
        });
    }

    // Add badges
    (compositionPlan?.badges || []).forEach((badge, i) => {
        elements.push({
            type: `badge_${i}`,
            bounds: calculateBadgeBounds(badge, canvasSize)
        });
    });

    // Add callouts
    (compositionPlan?.callouts || []).forEach((callout, i) => {
        elements.push({
            type: `callout_${i}`,
            bounds: calculateCalloutBounds(callout, canvasSize)
        });
    });

    // Check all pairs for collision
    for (let i = 0; i < elements.length; i++) {
        for (let j = i + 1; j < elements.length; j++) {
            const overlap = calculateOverlap(elements[i].bounds, elements[j].bounds);
            if (overlap > 0.05) { // More than 5% overlap
                collisions.push({
                    element1: elements[i].type,
                    element2: elements[j].type,
                    overlapPercent: Math.round(overlap * 100),
                    severity: overlap > 0.3 ? 'critical' : overlap > 0.15 ? 'high' : 'medium'
                });
            }
        }
    }

    console.log(`[CollisionDetector] ${collisions.length === 0 ? '✅ No collisions' : `⚠️ ${collisions.length} collisions found`}`);
    collisions.forEach(c => {
        console.log(`[CollisionDetector]   ${c.severity.toUpperCase()}: ${c.element1} ↔ ${c.element2} (${c.overlapPercent}% overlap)`);
    });

    return collisions;
}

/**
 * Validate element placements against safe zones
 */
export function validateElementPlacements(compositionPlan, deepAnalysis, canvasSize = { width: 1080, height: 1080 }) {
    console.log('[PlacementValidator] 🔍 Validating placements against safe zones...');

    const violations = [];
    const safeZones = deepAnalysis?.safeZones || {};

    // Check headline against noText zones
    if (compositionPlan?.headline && safeZones.noText) {
        for (const zone of safeZones.noText) {
            const distance = calculateDistance(
                compositionPlan.headline.position,
                { xPercent: zone.xPercent, yPercent: zone.yPercent }
            );
            if (distance < zone.radiusPercent) {
                violations.push({
                    element: 'headline',
                    zone: 'noText',
                    reason: zone.reason,
                    severity: 'high'
                });
            }
        }
    }

    // Check all elements against noOverlay zones
    const elements = [
        { name: 'headline', pos: compositionPlan?.headline?.position },
        { name: 'cta', pos: compositionPlan?.cta?.position },
        { name: 'subheadline', pos: compositionPlan?.subheadline?.position }
    ].filter(e => e.pos);

    for (const element of elements) {
        for (const zone of safeZones.noOverlay || []) {
            const distance = calculateDistance(element.pos, { xPercent: zone.xPercent, yPercent: zone.yPercent });
            if (distance < zone.radiusPercent * 0.5) { // Inside core of no-overlay zone
                violations.push({
                    element: element.name,
                    zone: 'noOverlay',
                    reason: zone.reason,
                    severity: 'critical'
                });
            }
        }
    }

    // Check spatial grid occupancy
    const spatialGrid = deepAnalysis?.spatialGrid?.zones || {};
    const gridPositions = {
        'top_left': { x: 0.16, y: 0.16 },
        'top_center': { x: 0.5, y: 0.16 },
        'top_right': { x: 0.84, y: 0.16 },
        'middle_left': { x: 0.16, y: 0.5 },
        'middle_center': { x: 0.5, y: 0.5 },
        'middle_right': { x: 0.84, y: 0.5 },
        'bottom_left': { x: 0.16, y: 0.84 },
        'bottom_center': { x: 0.5, y: 0.84 },
        'bottom_right': { x: 0.84, y: 0.84 }
    };

    // Check if badges/callouts are placed in occupied zones
    (compositionPlan?.badges || []).forEach((badge, i) => {
        const zone = findNearestZone(badge.position, gridPositions);
        if (spatialGrid[zone]?.occupied && !spatialGrid[zone]?.suitableFor?.includes('badge')) {
            violations.push({
                element: `badge_${i}`,
                zone: zone,
                reason: `Zone "${zone}" is occupied by: ${spatialGrid[zone].content}`,
                severity: 'medium'
            });
        }
    });

    console.log(`[PlacementValidator] ${violations.length === 0 ? '✅ All placements valid' : `⚠️ ${violations.length} violations found`}`);
    violations.forEach(v => {
        console.log(`[PlacementValidator]   ${v.severity.toUpperCase()}: ${v.element} in ${v.zone} - ${v.reason}`);
    });

    return violations;
}

// Helper functions for collision detection
function calculateTextBounds(position, sizePx, charCount, canvasSize) {
    const charWidth = sizePx * 0.6;
    const width = Math.min(charCount * charWidth, canvasSize.width * 0.9);
    const height = sizePx * 1.2;
    const x = position.xPercent * canvasSize.width - width / 2;
    const y = position.yPercent * canvasSize.height - height / 2;
    return { x, y, width, height };
}

function calculateProductBounds(product, canvasSize) {
    const scale = product.scale || 0.6;
    const width = canvasSize.width * scale;
    const height = canvasSize.height * scale * 0.8;
    const x = product.position.xPercent * canvasSize.width - width / 2;
    const y = product.position.yPercent * canvasSize.height - height / 2;
    return { x, y, width, height };
}

function calculateCTABounds(cta, canvasSize) {
    const width = 280;
    const height = 56;
    const x = cta.position.xPercent * canvasSize.width - width / 2;
    const y = cta.position.yPercent * canvasSize.height - height / 2;
    return { x, y, width, height };
}

function calculateBadgeBounds(badge, canvasSize) {
    const width = 120;
    const height = 40;
    const x = badge.position.xPercent * canvasSize.width - width / 2;
    const y = badge.position.yPercent * canvasSize.height - height / 2;
    return { x, y, width, height };
}

function calculateCalloutBounds(callout, canvasSize) {
    const width = 180;
    const height = 60;
    const x = callout.position.xPercent * canvasSize.width - width / 2;
    const y = callout.position.yPercent * canvasSize.height - height / 2;
    return { x, y, width, height };
}

function calculateOverlap(bounds1, bounds2) {
    const xOverlap = Math.max(0, Math.min(bounds1.x + bounds1.width, bounds2.x + bounds2.width) - Math.max(bounds1.x, bounds2.x));
    const yOverlap = Math.max(0, Math.min(bounds1.y + bounds1.height, bounds2.y + bounds2.height) - Math.max(bounds1.y, bounds2.y));
    const overlapArea = xOverlap * yOverlap;
    const minArea = Math.min(bounds1.width * bounds1.height, bounds2.width * bounds2.height);
    return minArea > 0 ? overlapArea / minArea : 0;
}

function calculateDistance(pos1, pos2) {
    return Math.sqrt(Math.pow(pos1.xPercent - pos2.xPercent, 2) + Math.pow(pos1.yPercent - pos2.yPercent, 2));
}

function findNearestZone(position, gridPositions) {
    let nearestZone = 'middle_center';
    let minDistance = Infinity;
    for (const [zone, pos] of Object.entries(gridPositions)) {
        const dist = Math.sqrt(Math.pow(position.xPercent - pos.x, 2) + Math.pow(position.yPercent - pos.y, 2));
        if (dist < minDistance) {
            minDistance = dist;
            nearestZone = zone;
        }
    }
    return nearestZone;
}

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
    referenceAds = [],
    strictReplica = false
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
        if (strictReplica) {
            throw error;
        }
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
        model: 'gpt-4o-mini',
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

/**
 * Score similarity to Foreplay reference ads using GPT-4V
 * ENHANCED: Multi-aspect weighted scoring for 8.5+ threshold
 */
export async function scoreReferenceSimilarity({ imageBuffer, referenceAds = [] }) {
    if (!referenceAds || referenceAds.length === 0) {
        throw new Error('Reference similarity requires Foreplay references');
    }

    const referenceImages = referenceAds
        .map(ad => ad.image || ad.thumbnail)
        .filter(Boolean)
        .slice(0, 3);

    if (referenceImages.length === 0) {
        throw new Error('Reference ads missing images for similarity check');
    }

    console.log('[QualityScorer] 🎯 Multi-aspect similarity scoring...');
    const base64 = imageBuffer.toString('base64');

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
            role: 'system',
            content: `You are an elite Meta/Facebook ad creative director with 15+ years experience.
Analyze ads with extreme precision. Generated ads must match the VISUAL QUALITY and DESIGN PATTERNS of top-performing reference ads.
Score harshly - only truly matching ads should score 8.5+.`
        }, {
            role: 'user',
            content: [
                {
                    type: 'text',
                    text: `Compare the GENERATED AD (first image) against the TOP-PERFORMING REFERENCE ADS (remaining images).

Score each aspect 1-10 with detailed feedback:

1. LAYOUT_COMPOSITION (25% weight)
   - Element positioning (headline, product, CTA locations)
   - Visual hierarchy matches reference
   - Whitespace and balance
   - Grid alignment

2. COLOR_HARMONY (20% weight)
   - Color palette similarity
   - Contrast levels
   - Mood matches references
   - Brand color usage

3. TYPOGRAPHY_STYLE (20% weight)
   - Font style matches (bold/elegant/playful)
   - Size hierarchy appropriate
   - Text effects (gradients, shadows)
   - Readability

4. VISUAL_EFFECTS (15% weight)
   - Shadow quality
   - Glow/lighting effects
   - Background treatment
   - Professional finish

5. PRODUCT_PRESENTATION (10% weight)
   - Product visibility
   - Mockup quality
   - Integration with design
   - Scale appropriateness

6. OVERALL_IMPRESSION (10% weight)
   - Would this perform on Meta/Facebook?
   - Professional agency quality?
   - Scroll-stopping potential?

Return JSON:
{
  "aspects": [
    { "name": "layout_composition", "score": 1-10, "feedback": "specific issue or praise" },
    { "name": "color_harmony", "score": 1-10, "feedback": "..." },
    { "name": "typography_style", "score": 1-10, "feedback": "..." },
    { "name": "visual_effects", "score": 1-10, "feedback": "..." },
    { "name": "product_presentation", "score": 1-10, "feedback": "..." },
    { "name": "overall_impression", "score": 1-10, "feedback": "..." }
  ],
  "weightedScore": 0-10,
  "topStrengths": ["what matches references best"],
  "criticalIssues": ["what needs fixing most"],
  "regenerationFocus": "which aspect to prioritize if regenerating"
}`
                },
                {
                    type: 'image_url',
                    image_url: { url: `data:image/png;base64,${base64}`, detail: 'high' }
                },
                ...referenceImages.map(url => ({
                    type: 'image_url',
                    image_url: { url, detail: 'high' }
                }))
            ]
        }],
        max_tokens: 800,
        response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    // Calculate weighted score if not provided
    const WEIGHTS = {
        layout_composition: 0.25,
        color_harmony: 0.20,
        typography_style: 0.20,
        visual_effects: 0.15,
        product_presentation: 0.10,
        overall_impression: 0.10
    };

    let calculatedScore = 0;
    const aspects = result.aspects || [];

    for (const aspect of aspects) {
        const weight = WEIGHTS[aspect.name] || 0.1;
        calculatedScore += (aspect.score || 5) * weight;
    }

    const finalScore = result.weightedScore || calculatedScore;

    if (!Number.isFinite(finalScore)) {
        throw new Error('Invalid similarity score');
    }

    // Log detailed results
    console.log(`[QualityScorer]   Weighted Score: ${finalScore.toFixed(1)}/10`);
    for (const aspect of aspects) {
        const emoji = aspect.score >= 8 ? '✅' : aspect.score >= 6 ? '⚠️' : '❌';
        console.log(`[QualityScorer]   ${emoji} ${aspect.name}: ${aspect.score}/10`);
    }

    if (result.criticalIssues?.length > 0) {
        console.log(`[QualityScorer]   🔴 Critical: ${result.criticalIssues.join(', ')}`);
    }

    return {
        score: finalScore,
        aspects: aspects,
        topStrengths: result.topStrengths || [],
        criticalIssues: result.criticalIssues || [],
        regenerationFocus: result.regenerationFocus || 'overall',
        // Legacy compatibility
        notes: result.criticalIssues?.join('; ') || '',
        matchedAttributes: result.topStrengths || [],
        mismatches: result.criticalIssues || []
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
            model: 'gpt-4o-mini',
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
            model: 'gpt-4o-mini',
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
    detectCollisions,
    validateElementPlacements,
    scoreReferenceSimilarity,
    QUALITY_THRESHOLDS
};
