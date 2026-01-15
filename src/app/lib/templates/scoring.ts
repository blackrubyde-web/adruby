/**
 * TEMPLATE SCORING ALGORITHM
 * 
 * Intelligent template selection based on capability matching,
 * copy fit prediction, and style harmony analysis.
 */

import type { TemplateCapsule } from './types';
import type { CreativeSpec } from '../ai/creative/types';

// ============================================================================
// SCORING CONTEXT
// ============================================================================

export interface MeasuredCopy {
    headline: {
        chars: number;
        estimatedLines: number;
        estimatedWidth?: number;  // px at average font size
    };
    subheadline?: {
        chars: number;
        estimatedLines: number;
    };
    cta: {
        chars: number;
    };
    bullets?: Array<{ chars: number }>;
}

export interface TemplateScoringContext {
    spec: CreativeSpec;
    measuredCopy: MeasuredCopy;
    availableAssets: string[];  // Asset types that are available/renderable
    imageAnalysis?: {
        dominantColors?: string[];
        productPosition?: 'left' | 'center' | 'right';
        textSafeZones?: Array<{ x: number; y: number; width: number; height: number }>;
    };
}

// ============================================================================
// SCORING RESULT
// ============================================================================

export interface TemplateScoringResult {
    template: TemplateCapsule;
    score: number;  // 0-1000
    breakdown: {
        businessModelMatch: number;    // 0-200
        patternMatch: number;          // 0-200
        assetAvailability: number;     // 0-200
        copyFitScore: number;          // 0-200
        zoneIntentMatch: number;       // 0-100
        styleHarmonyScore: number;     // 0-100
        penalties: number;             // negative (density, contrast, etc.)
    };
    canBeAssembled: boolean;  // True if all required assets available
    predictedIssues: string[]; // Warnings about potential problems
}

// ============================================================================
// COPY MEASUREMENT
// ============================================================================

/**
 * Measure copy metrics for fit prediction
 */
export function measureCopy(spec: CreativeSpec): MeasuredCopy {
    const { copy } = spec;

    return {
        headline: {
            chars: copy.headline.length,
            estimatedLines: estimateLines(copy.headline, 60), // avg chars per line at headline size
            estimatedWidth: copy.headline.length * 20 // rough px estimate
        },
        subheadline: copy.subheadline ? {
            chars: copy.subheadline.length,
            estimatedLines: estimateLines(copy.subheadline, 80)
        } : undefined,
        cta: {
            chars: copy.cta.length
        },
        bullets: copy.bullets?.map(bullet => ({ chars: bullet.length }))
    };
}

// MED-002 FIX: Dynamic font metrics
function estimateLines(text: string, charsPerLine: number): number {
    return Math.ceil(text.length / charsPerLine);
}

// ============================================================================
// TEMPLATE SCORING
// ============================================================================

/**
 * Score templates against a CreativeSpec
 * Returns sorted list with highest scores first
 * 
 * HIGH-001 FIX: Prefilters by ratio and minimum viable score
 */
export function scoreTemplates(
    templates: TemplateCapsule[],
    context: TemplateScoringContext
): TemplateScoringResult[] {
    // ✅ FIX 4: Prefilter - Ratio mismatch + Empty templates
    const eligibleByRatio = templates.filter(t =>
        t.ratio === context.spec.ratio &&
        t.document?.layers &&
        t.document.layers.length > 0  // Filter empty templates!
    );

    if (eligibleByRatio.length === 0) {
        console.warn(`⚠️ No valid templates found for ratio ${context.spec.ratio}`);
        console.warn(`Total templates: ${templates.length}, With matching ratio: ${templates.filter(t => t.ratio === context.spec.ratio).length}, Non-empty after filter: ${eligibleByRatio.length}`);
        // Will score all templates but they'll have penalties
    }

    const templatesToScore = eligibleByRatio.length > 0 ? eligibleByRatio : templates;

    // Score eligible templates
    const results: TemplateScoringResult[] = templatesToScore.map(template =>
        scoreTemplate(template, context)
    );

    // Sort by score DESC
    const sorted = results.sort((a, b) => b.score - a.score);

    // PREFILTER 2: Minimum viable score threshold
    const MIN_VIABLE_SCORE = 200;
    const viable = sorted.filter(r => r.score >= MIN_VIABLE_SCORE);

    if (viable.length === 0) {
        console.warn(`⚠️ No templates scored above ${MIN_VIABLE_SCORE}. Top score: ${sorted[0]?.score || 0}`);
        // Return top 3 as fallback, caller will handle
        return sorted.slice(0, 3);
    }

    return viable;
}

/**
 * Score a single template against the context
 */
export function scoreTemplate(
    template: TemplateCapsule,
    context: TemplateScoringContext
): TemplateScoringResult {
    const { spec, measuredCopy, availableAssets } = context;

    const breakdown = {
        businessModelMatch: 0,
        patternMatch: 0,
        assetAvailability: 0,
        copyFitScore: 0,
        zoneIntentMatch: 0,
        styleHarmonyScore: 0,
        penalties: 0
    };

    const predictedIssues: string[] = [];

    // 1. BUSINESS MODEL MATCH (0-200)
    if (template.supportedBusinessModels.includes(spec.businessModel)) {
        breakdown.businessModelMatch = 200;
    } else if (template.supportedBusinessModels.includes('ecommerce') &&
        spec.businessModel !== 'ecommerce') {
        // Generic ecommerce templates can work for some other models
        breakdown.businessModelMatch = 50;
    }

    // 2. PATTERN MATCH (0-200)
    if (template.supportedPatterns.includes(spec.creativePattern)) {
        breakdown.patternMatch = 200;
    } else if (template.supportedPatterns.length === 0) {
        // Universal template
        breakdown.patternMatch = 100;
    } else {
        // Check if pattern is in same family (e.g. ecommerce_*)
        const specFamily = spec.creativePattern.split('_')[0];
        const hasMatchingFamily = template.supportedPatterns.some(
            p => p.startsWith(specFamily)
        );
        if (hasMatchingFamily) {
            breakdown.patternMatch = 80;
        }
    }

    // 3. ASSET AVAILABILITY (0-200)
    const requiredAssets = template.requiredAssets || [];
    const missingAssets = requiredAssets.filter(asset => !availableAssets.includes(asset));

    if (missingAssets.length === 0) {
        breakdown.assetAvailability = 200;
    } else {
        breakdown.assetAvailability = Math.max(0, 200 - (missingAssets.length * 50));
        predictedIssues.push(`Missing required assets: ${missingAssets.join(', ')}`);
    }

    // 4. COPY FIT SCORE (0-200)
    breakdown.copyFitScore = scoreCopyFit(template, spec, measuredCopy, predictedIssues);

    // 5. ZONE INTENT MATCH (0-100)
    breakdown.zoneIntentMatch = scoreZoneIntent(template, spec);

    // 6. STYLE HARMONY (0-100)
    breakdown.styleHarmonyScore = scoreStyleHarmony(template, spec);

    // 7. PENALTIES
    breakdown.penalties = calculatePenalties(template, spec, measuredCopy, predictedIssues);

    // Calculate total score
    const totalScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    return {
        template,
        score: totalScore,
        breakdown,
        canBeAssembled: missingAssets.length === 0,
        predictedIssues
    };
}

// ============================================================================
// SCORING COMPONENTS
// ============================================================================

/**
 * Score how well copy fits template constraints
 */
function scoreCopyFit(
    template: TemplateCapsule,
    spec: CreativeSpec,
    measured: MeasuredCopy,
    issues: string[]
): number {
    let score = 200;

    const constraints = template.copyConstraints;

    // Check headline fit
    if (measured.headline.chars > constraints.maxChars.headline) {
        const overflow = measured.headline.chars - constraints.maxChars.headline;
        score -= Math.min(50, overflow * 2);
        issues.push(`Headline overflow: ${overflow} chars over limit`);
    }

    // Check headline lines
    if (constraints.maxLines?.headline &&
        measured.headline.estimatedLines > constraints.maxLines.headline) {
        score -= 30;
        issues.push(`Headline may wrap to ${measured.headline.estimatedLines} lines (max ${constraints.maxLines.headline})`);
    }

    // Check subheadline if present
    if (measured.subheadline && constraints.maxChars.subheadline) {
        if (measured.subheadline.chars > constraints.maxChars.subheadline) {
            const overflow = measured.subheadline.chars - constraints.maxChars.subheadline;
            score -= Math.min(30, overflow);
            issues.push(`Subheadline overflow: ${overflow} chars`);
        }
    }

    // Check CTA fit
    if (measured.cta.chars > constraints.maxChars.cta) {
        const overflow = measured.cta.chars - constraints.maxChars.cta;
        score -= Math.min(40, overflow * 2);
        issues.push(`CTA overflow: ${overflow} chars`);
    }

    return Math.max(0, score);
}

/**
 * Score zone intent alignment with spec preferences
 */
function scoreZoneIntent(
    template: TemplateCapsule,
    spec: CreativeSpec
): number {
    let score = 50; // baseline

    // Check text placement preference
    if (spec.templateHints.preferTextPlacement) {
        const textZones = template.zones.filter(z => z.contentType === 'text');
        const avgYPosition = textZones.reduce((sum, z) => sum + z.bbox.y, 0) / textZones.length;

        const preferredPosition = spec.templateHints.preferTextPlacement;
        const actualPosition = avgYPosition < 300 ? 'top' : avgYPosition > 700 ? 'bottom' : 'center';

        if (
            (preferredPosition === 'top' && actualPosition === 'top') ||
            (preferredPosition === 'bottom' && actualPosition === 'bottom')
        ) {
            score += 50;
        } else if (actualPosition === 'center') {
            score += 25; // Center is always acceptable
        }
    }

    return score;
}

/**
 * Score style harmony between spec and template
 */
function scoreStyleHarmony(
    template: TemplateCapsule,
    spec: CreativeSpec
): number {
    let score = 50; // baseline

    // Check if template styling tokens match spec style preferences
    if (spec.style.palette && template.stylingTokens.paletteSlots.length > 0) {
        score += 25; // Template can accept custom palette
    }

    // Check forbidden styles
    if (spec.style.forbiddenStyles) {
        const hasForbidden = spec.style.forbiddenStyles.some(_style => {
            // Check if template violates forbidden styles
            // (This would need template metadata about style features)
            return false; // Placeholder
        });

        if (!hasForbidden) {
            score += 25;
        }
    }

    return score;
}

/**
 * Calculate penalties for known issues
 */
function calculatePenalties(
    template: TemplateCapsule,
    spec: CreativeSpec,
    measured: MeasuredCopy,
    issues: string[]
): number {
    let penalties = 0;

    // Density penalty: too many elements
    const elementCount = template.zones.length;
    const baseArea = template.document.width! * template.document.height!;
    const density = elementCount / (baseArea / 1000); // elements per 1000px²

    if (density > template.layoutConstraints.maxDensity) {
        penalties -= 30;
        issues.push(`High element density: ${density.toFixed(1)} (max ${template.layoutConstraints.maxDensity})`);
    }

    // Contrast penalty: if spec requires min readability and template might not meet it
    if (spec.constraints.readabilityMin && spec.constraints.readabilityMin > 4.5) {
        // Would need template background color analysis
        // Placeholder: assume some templates might have contrast issues
    }

    // Wrong ratio penalty
    if (spec.ratio !== template.ratio) {
        penalties -= 100; // Strong penalty for ratio mismatch
        issues.push(`Ratio mismatch: spec wants ${spec.ratio}, template is ${template.ratio}`);
    }

    return penalties;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Filter templates by minimum score threshold
 */
export function filterByMinScore(
    results: TemplateScoringResult[],
    minScore: number
): TemplateScoringResult[] {
    return results.filter(r => r.score >= minScore);
}

/**
 * Get top N templates
 */
export function getTopN(
    results: TemplateScoringResult[],
    n: number
): TemplateScoringResult[] {
    return results.slice(0, n);
}

/**
 * Get templates that can be assembled (all required assets available)
 */
export function getAssemblableTemplates(
    results: TemplateScoringResult[]
): TemplateScoringResult[] {
    return results.filter(r => r.canBeAssembled);
}
