/**
 * AUTO-LAYOUT ADJUSTER
 * Automatically fix layout issues through iterative refinement
 * 
 * Features:
 * - Element overlap resolution (move/resize)
 * - Boundary violation fixes (push into safe area)
 * - Aspect ratio preservation
 * - Iterative refinement (max 5 passes)
 * - Priority-based movement (CTA > product > text)
 */

import type { StudioLayer } from '../../../types/studio';
import type { GridConfig } from '../layout/grid-system';

export interface AdjustmentResult {
    adjustedLayers: StudioLayer[];
    adjustmentsMade: number;
    iterations: number;
    issues: string[];
    fixes: string[];
}

interface Collision {
    layer1: StudioLayer;
    layer2: StudioLayer;
    overlap: { x: number; y: number; width: number; height: number };
}

/**
 * Get element priority (higher = more important, less likely to move)
 */
function getPriority(layer: StudioLayer): number {
    if (layer.type === 'cta' || layer.role === 'cta') return 100;
    if (layer.type === 'product' || layer.role === 'product_image') return 90;
    if (layer.role === 'headline') return 80;
    if (layer.type === 'text') return 70;
    if (layer.type === 'background') return 0;
    return 50;
}

/**
 * Check if two layers collide
 */
function checkCollision(a: StudioLayer, b: StudioLayer): Collision | null {
    const overlapX = (a.x < b.x + b.width) && (a.x + a.width > b.x);
    const overlapY = (a.y < b.y + b.height) && (a.y + a.height > b.y);

    if (!overlapX || !overlapY) return null;

    const overlapLeft = Math.max(a.x, b.x);
    const overlapTop = Math.max(a.y, b.y);
    const overlapRight = Math.min(a.x + a.width, b.x + b.width);
    const overlapBottom = Math.min(a.y + a.height, b.y + b.height);

    return {
        layer1: a,
        layer2: b,
        overlap: {
            x: overlapLeft,
            y: overlapTop,
            width: overlapRight - overlapLeft,
            height: overlapBottom - overlapTop
        }
    };
}

/**
 * Find all collisions
 */
function detectCollisions(layers: StudioLayer[]): Collision[] {
    const collisions: Collision[] = [];
    const visibleLayers = layers.filter(l => l.visible && l.type !== 'background');

    for (let i = 0; i < visibleLayers.length; i++) {
        for (let j = i + 1; j < visibleLayers.length; j++) {
            const collision = checkCollision(visibleLayers[i], visibleLayers[j]);
            if (collision) {
                collisions.push(collision);
            }
        }
    }

    return collisions;
}

/**
 * Calculate minimum translation vector to resolve collision
 */
function calculateMTV(collision: Collision): { dx: number; dy: number } {
    const { overlap } = collision;

    // Move in direction of smallest overlap
    if (overlap.width < overlap.height) {
        // Move horizontally
        return { dx: overlap.width, dy: 0 };
    } else {
        // Move vertically
        return { dx: 0, dy: overlap.height };
    }
}

/**
 * Resolve single collision by moving lower-priority element
 */
function resolveCollision(
    collision: Collision,
    canvasWidth: number,
    canvasHeight: number
): { movedLayer: StudioLayer; newX: number; newY: number } | null {
    const priority1 = getPriority(collision.layer1);
    const priority2 = getPriority(collision.layer2);

    // Move lower-priority element
    const movingLayer = priority1 < priority2 ? collision.layer1 : collision.layer2;
    const staticLayer = priority1 < priority2 ? collision.layer2 : collision.layer1;

    const mtv = calculateMTV(collision);

    // Determine direction (away from static layer)
    let newX = movingLayer.x;
    let newY = movingLayer.y;

    if (mtv.dx !== 0) {
        // Horizontal movement
        if (movingLayer.x < staticLayer.x) {
            newX -= mtv.dx;
        } else {
            newX += mtv.dx;
        }
    }

    if (mtv.dy !== 0) {
        // Vertical movement
        if (movingLayer.y < staticLayer.y) {
            newY -= mtv.dy;
        } else {
            newY += mtv.dy;
        }
    }

    // Ensure within bounds
    newX = Math.max(0, Math.min(canvasWidth - movingLayer.width, newX));
    newY = Math.max(0, Math.min(canvasHeight - movingLayer.height, newY));

    return { movedLayer: movingLayer, newX, newY };
}

/**
 * Fix boundary violations (elements outside safe area)
 */
function fixBoundaryViolations(
    layers: StudioLayer[],
    safeArea: { x: number; y: number; width: number; height: number }
): { layer: StudioLayer; fixes: string[] }[] {
    const fixes: { layer: StudioLayer; fixes: string[] }[] = [];

    for (const layer of layers) {
        if (layer.type === 'background' || layer.locked) continue;

        const layerFixes: string[] = [];
        let adjusted = false;

        // Check if outside safe area
        if (layer.x < safeArea.x) {
            layer.x = safeArea.x;
            layerFixes.push('Moved right into safe area');
            adjusted = true;
        }

        if (layer.y < safeArea.y) {
            layer.y = safeArea.y;
            layerFixes.push('Moved down into safe area');
            adjusted = true;
        }

        if (layer.x + layer.width > safeArea.x + safeArea.width) {
            layer.x = safeArea.x + safeArea.width - layer.width;
            layerFixes.push('Moved left into safe area');
            adjusted = true;
        }

        if (layer.y + layer.height > safeArea.y + safeArea.height) {
            layer.y = safeArea.y + safeArea.height - layer.height;
            layerFixes.push('Moved up into safe area');
            adjusted = true;
        }

        if (adjusted) {
            fixes.push({ layer, fixes: layerFixes });
        }
    }

    return fixes;
}

/**
 * Auto-adjust layout to fix issues
 */
export async function autoAdjustLayout(
    layers: StudioLayer[],
    config: GridConfig,
    maxIterations: number = 5
): Promise<AdjustmentResult> {
    const adjustedLayers = JSON.parse(JSON.stringify(layers)) as StudioLayer[];
    const issues: string[] = [];
    const fixes: string[] = [];
    let adjustmentsMade = 0;
    let iterations = 0;

    const safeArea = {
        x: config.safeZone.left,
        y: config.safeZone.top,
        width: config.width - config.safeZone.left - config.safeZone.right,
        height: config.height - config.safeZone.top - config.safeZone.bottom
    };

    // Iteration loop
    for (let iter = 0; iter < maxIterations; iter++) {
        iterations++;
        let madeAdjustment = false;

        // 1. Fix boundary violations
        const boundaryFixes = fixBoundaryViolations(adjustedLayers, safeArea);
        if (boundaryFixes.length > 0) {
            boundaryFixes.forEach(fix => {
                fixes.push(...fix.fixes.map(f => `${fix.layer.name || fix.layer.id}: ${f}`));
            });
            adjustmentsMade += boundaryFixes.length;
            madeAdjustment = true;
        }

        // 2. Resolve collisions
        const collisions = detectCollisions(adjustedLayers);

        if (collisions.length > 0) {
            issues.push(`Found ${collisions.length} collision(s) in iteration ${iter + 1}`);

            // Resolve each collision
            for (const collision of collisions) {
                const resolution = resolveCollision(collision, config.width, config.height);

                if (resolution) {
                    // Find and update the layer
                    const layerIndex = adjustedLayers.findIndex(l => l.id === resolution.movedLayer.id);
                    if (layerIndex !== -1) {
                        adjustedLayers[layerIndex] = {
                            ...adjustedLayers[layerIndex],
                            x: resolution.newX,
                            y: resolution.newY
                        };

                        fixes.push(`Moved ${resolution.movedLayer.name || resolution.movedLayer.id} to resolve collision`);
                        adjustmentsMade++;
                        madeAdjustment = true;
                    }
                }
            }
        }

        // If no adjustments made, we're done
        if (!madeAdjustment) {
            break;
        }
    }

    // Final check
    const remainingCollisions = detectCollisions(adjustedLayers);
    if (remainingCollisions.length > 0) {
        issues.push(`⚠️ ${remainingCollisions.length} collision(s) remain after ${iterations} iterations`);
    }

    return {
        adjustedLayers,
        adjustmentsMade,
        iterations,
        issues,
        fixes
    };
}

/**
 * Optimize element spacing
 */
export function optimizeSpacing(
    layers: StudioLayer[],
    config: GridConfig,
    minSpacing: number = 40
): StudioLayer[] {
    const optimized = JSON.parse(JSON.stringify(layers)) as StudioLayer[];

    // Sort by vertical position
    const sortedLayers = optimized
        .filter(l => l.type !== 'background' && l.visible)
        .sort((a, b) => a.y - b.y);

    // Adjust vertical spacing
    for (let i = 1; i < sortedLayers.length; i++) {
        const prev = sortedLayers[i - 1];
        const current = sortedLayers[i];

        const gap = current.y - (prev.y + prev.height);

        if (gap < minSpacing) {
            // Push current element down
            current.y = prev.y + prev.height + minSpacing;
        }
    }

    return optimized;
}

/**
 * Quick validation check
 */
export function needsAdjustment(layers: StudioLayer[]): boolean {
    const collisions = detectCollisions(layers);
    return collisions.length > 0;
}
