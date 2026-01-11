/**
 * VISUAL BALANCE SCORER
 * Analyzes ad layout for visual balance and spacing quality
 * 
 * Features:
 * - Left/right weight distribution
 * - Vertical rhythm analysis
 * - Element overlap detection
 * - Whitespace utilization
 * - Golden ratio proximity
 */

import type { StudioLayer } from '../../../types/studio';

export interface BalanceScore {
    overall: number;              // 0-100
    breakdown: {
        horizontalBalance: number;  // 0-100
        verticalBalance: number;    // 0-100
        spacing: number;            // 0-100
        overlapFree: number;        // 0-100 (100 = no overlaps)
        whitespace: number;         // 0-100
    };
    issues: string[];
    suggestions: string[];
}

interface ElementWeight {
    layer: StudioLayer;
    x: number;
    y: number;
    width: number;
    height: number;
    area: number;
    centerX: number;
    centerY: number;
    weight: number; // Visual weight (size + opacity + type)
}

/**
 * Calculate visual weight of element
 */
function calculateVisualWeight(layer: StudioLayer): number {
    const baseArea = layer.width * layer.height;
    let weight = baseArea;

    // Type weighting
    if (layer.type === 'text') weight *= 0.8; // Text feels lighter
    if (layer.type === 'cta') weight *= 1.3;  // CTAs demand attention
    if (layer.type === 'product') weight *= 1.5; // Product is focal point

    // Opacity factor
    weight *= layer.opacity;

    // Font weight for text
    if (layer.type === 'text' || layer.type === 'cta') {
        const fontWeight = 'fontWeight' in layer ? layer.fontWeight : 400;
        const fwNum = typeof fontWeight === 'number' ? fontWeight : 400;
        weight *= (fwNum / 400); // Bold text = more weight
    }

    return weight;
}

/**
 * Get element weights for all layers
 */
function getElementWeights(layers: StudioLayer[], _canvasWidth: number, _canvasHeight: number): ElementWeight[] {
    return layers
        .filter(l => l.visible && l.type !== 'background')
        .map(layer => ({
            layer,
            x: layer.x,
            y: layer.y,
            width: layer.width,
            height: layer.height,
            area: layer.width * layer.height,
            centerX: layer.x + (layer.width / 2),
            centerY: layer.y + (layer.height / 2),
            weight: calculateVisualWeight(layer)
        }));
}

/**
 * Score horizontal balance (left vs right)
 */
function scoreHorizontalBalance(weights: ElementWeight[], canvasWidth: number): {
    score: number;
    leftWeight: number;
    rightWeight: number;
} {
    const centerX = canvasWidth / 2;
    let leftWeight = 0;
    let rightWeight = 0;

    weights.forEach(w => {
        if (w.centerX < centerX) {
            leftWeight += w.weight * (centerX - w.centerX) / centerX;
        } else {
            rightWeight += w.weight * (w.centerX - centerX) / centerX;
        }
    });

    const totalWeight = leftWeight + rightWeight;
    if (totalWeight === 0) return { score: 100, leftWeight: 0, rightWeight: 0 };

    const leftRatio = leftWeight / totalWeight;

    // Perfect balance = 0.5/0.5
    // Calculate deviation from perfect
    const deviation = Math.abs(leftRatio - 0.5);

    // Score: 0 deviation = 100, 0.5 deviation (all on one side) = 0
    const score = Math.max(0, 100 - (deviation * 200));

    return { score, leftWeight, rightWeight };
}

/**
 * Score vertical balance (top vs bottom)
 */
function scoreVerticalBalance(weights: ElementWeight[], canvasHeight: number): {
    score: number;
    topWeight: number;
    bottomWeight: number;
} {
    const centerY = canvasHeight / 2;
    let topWeight = 0;
    let bottomWeight = 0;

    weights.forEach(w => {
        if (w.centerY < centerY) {
            topWeight += w.weight * (centerY - w.centerY) / centerY;
        } else {
            bottomWeight += w.weight * (w.centerY - centerY) / centerY;
        }
    });

    const totalWeight = topWeight + bottomWeight;
    if (totalWeight === 0) return { score: 100, topWeight: 0, bottomWeight: 0 };

    const topRatio = topWeight / totalWeight;

    const deviation = Math.abs(topRatio - 0.5);
    const score = Math.max(0, 100 - (deviation * 200));

    return { score, topWeight, bottomWeight };
}

/**
 * Check for element overlaps
 */
function detectOverlaps(weights: ElementWeight[]): {
    count: number;
    pairs: Array<{ layer1: string; layer2: string }>;
} {
    const overlaps: Array<{ layer1: string; layer2: string }> = [];

    for (let i = 0; i < weights.length; i++) {
        for (let j = i + 1; j < weights.length; j++) {
            const a = weights[i];
            const b = weights[j];

            // Check for overlap (AABB collision)
            const overlapX = (a.x < b.x + b.width) && (a.x + a.width > b.x);
            const overlapY = (a.y < b.y + b.height) && (a.y + a.height > b.y);

            if (overlapX && overlapY) {
                overlaps.push({
                    layer1: a.layer.name || a.layer.id,
                    layer2: b.layer.name || b.layer.id
                });
            }
        }
    }

    return { count: overlaps.length, pairs: overlaps };
}

/**
 * Score spacing between elements
 */
function scoreSpacing(weights: ElementWeight[], _canvasWidth: number, _canvasHeight: number): number {
    if (weights.length < 2) return 100;

    const margins: number[] = [];

    // Calculate minimum distances between elements
    for (let i = 0; i < weights.length; i++) {
        for (let j = i + 1; j < weights.length; j++) {
            const a = weights[i];
            const b = weights[j];

            // Calculate gap (negative = overlap)
            const gapX = Math.max(0, Math.min(
                Math.abs(a.x + a.width - b.x),
                Math.abs(b.x + b.width - a.x)
            ));
            const gapY = Math.max(0, Math.min(
                Math.abs(a.y + a.height - b.y),
                Math.abs(b.y + b.height - a.y)
            ));

            const gap = Math.min(gapX, gapY);
            margins.push(gap);
        }
    }

    // Ideal minimum margin: 40px
    const idealMargin = 40;
    const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length;

    // Score based on how close to ideal
    if (avgMargin >= idealMargin) {
        return 100;
    } else {
        return (avgMargin / idealMargin) * 100;
    }
}

/**
 * Score whitespace utilization
 */
function scoreWhitespace(weights: ElementWeight[], canvasWidth: number, canvasHeight: number): number {
    const totalArea = canvasWidth * canvasHeight;
    const usedArea = weights.reduce((sum, w) => sum + w.area, 0);
    const whitespaceRatio = 1 - (usedArea / totalArea);

    // Ideal whitespace: 40-60%
    if (whitespaceRatio >= 0.4 && whitespaceRatio <= 0.6) {
        return 100;
    } else if (whitespaceRatio < 0.4) {
        // Too cramped
        return (whitespaceRatio / 0.4) * 100;
    } else {
        // Too empty
        return ((1 - whitespaceRatio) / 0.4) * 100;
    }
}

/**
 * Calculate overall visual balance score
 */
export function scoreVisualBalance(
    layers: StudioLayer[],
    canvasWidth: number = 1080,
    canvasHeight: number = 1080
): BalanceScore {
    const weights = getElementWeights(layers, canvasWidth, canvasHeight);
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Horizontal balance
    const hBalance = scoreHorizontalBalance(weights, canvasWidth);
    if (hBalance.score < 70) {
        issues.push(`Horizontal imbalance detected (score: ${Math.round(hBalance.score)})`);
        suggestions.push('Redistribute elements more evenly across left and right sides');
    }

    // Vertical balance
    const vBalance = scoreVerticalBalance(weights, canvasHeight);
    if (vBalance.score < 70) {
        issues.push(`Vertical imbalance detected (score: ${Math.round(vBalance.score)})`);
        suggestions.push('Adjust element placement to balance top and bottom areas');
    }

    // Overlaps
    const overlaps = detectOverlaps(weights);
    const overlapScore = overlaps.count === 0 ? 100 : Math.max(0, 100 - (overlaps.count * 25));
    if (overlaps.count > 0) {
        issues.push(`${overlaps.count} element overlap(s) detected`);
        suggestions.push('Increase spacing between overlapping elements');
        overlaps.pairs.forEach(p => {
            issues.push(`  - ${p.layer1} overlaps with ${p.layer2}`);
        });
    }

    // Spacing
    const spacingScore = scoreSpacing(weights, canvasWidth, canvasHeight);
    if (spacingScore < 70) {
        issues.push('Elements are too close together');
        suggestions.push('Increase margins between elements (recommended: 40px minimum)');
    }

    // Whitespace
    const whitespaceScore = scoreWhitespace(weights, canvasWidth, canvasHeight);
    if (whitespaceScore < 70) {
        const usedArea = weights.reduce((sum, w) => sum + w.area, 0);
        const ratio = usedArea / (canvasWidth * canvasHeight);
        if (ratio > 0.6) {
            issues.push('Layout feels cramped (insufficient whitespace)');
            suggestions.push('Reduce element sizes or remove less important elements');
        } else {
            issues.push('Layout feels empty (too much whitespace)');
            suggestions.push('Add more content or increase element sizes');
        }
    }

    // Overall score (weighted average)
    const overall = Math.round(
        (hBalance.score * 0.25) +
        (vBalance.score * 0.25) +
        (overlapScore * 0.25) +
        (spacingScore * 0.15) +
        (whitespaceScore * 0.10)
    );

    return {
        overall,
        breakdown: {
            horizontalBalance: Math.round(hBalance.score),
            verticalBalance: Math.round(vBalance.score),
            spacing: Math.round(spacingScore),
            overlapFree: Math.round(overlapScore),
            whitespace: Math.round(whitespaceScore)
        },
        issues,
        suggestions
    };
}

/**
 * Quick pass/fail check
 */
export function isBalanced(layers: StudioLayer[], minScore: number = 70): boolean {
    const score = scoreVisualBalance(layers);
    return score.overall >= minScore;
}
