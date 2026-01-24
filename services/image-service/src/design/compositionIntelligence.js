/**
 * COMPOSITION INTELLIGENCE ENGINE
 * 
 * Professional composition algorithms:
 * 
 * - Visual Flow Analysis
 * - Focal Point Calculation
 * - Eye Movement Patterns
 * - Gestalt Principles
 * - Negative Space Analysis
 * - Visual Tension/Balance
 * - Depth & Layering
 * - Dynamic Symmetry
 */

import { goldenDivide, ruleOfThirdsGrid, calculateVisualWeight, OPTICAL_CORRECTIONS } from './designPrimitives.js';

// ========================================
// FOCAL POINT SYSTEM
// ========================================

/**
 * Calculate optimal focal point placement
 */
export function calculateFocalPoint(canvasWidth, canvasHeight, strategy = 'rule_of_thirds') {
    const strategies = {
        // Rule of Thirds - classic and effective
        rule_of_thirds: () => {
            const grid = ruleOfThirdsGrid(canvasWidth, canvasHeight);
            return grid.powerPoints[0]; // Top-left power point
        },

        // Golden Spiral - for natural flow
        golden_spiral: () => {
            const gx = goldenDivide(canvasWidth, true);
            const gy = goldenDivide(canvasHeight, true);
            return { x: gx.primary, y: gy.primary };
        },

        // Center (with optical adjustment)
        center: () => ({
            x: canvasWidth / 2,
            y: (canvasHeight / 2) + (canvasHeight * OPTICAL_CORRECTIONS.textOpticalCenterOffset)
        }),

        // Dynamic - slightly off-center for tension
        dynamic: () => ({
            x: canvasWidth * 0.55,
            y: canvasHeight * 0.45
        }),

        // Left third - for left-to-right reading
        left_heavy: () => ({
            x: canvasWidth * 0.35,
            y: canvasHeight * 0.42
        }),

        // Right third - for product focus
        right_heavy: () => ({
            x: canvasWidth * 0.65,
            y: canvasHeight * 0.42
        })
    };

    const calc = strategies[strategy] || strategies.rule_of_thirds;
    const point = calc();

    return {
        x: Math.round(point.x),
        y: Math.round(point.y),
        strategy,
        zones: generateAttentionZones(canvasWidth, canvasHeight, point)
    };
}

/**
 * Generate attention zones around focal point
 */
function generateAttentionZones(width, height, focalPoint) {
    const zones = [];
    const maxRadius = Math.min(width, height) * 0.6;

    // Primary attention zone (100%)
    zones.push({
        name: 'primary',
        attention: 1.0,
        x: focalPoint.x,
        y: focalPoint.y,
        radius: maxRadius * 0.25
    });

    // Secondary (80%)
    zones.push({
        name: 'secondary',
        attention: 0.8,
        x: focalPoint.x,
        y: focalPoint.y,
        radius: maxRadius * 0.45
    });

    // Tertiary (50%)
    zones.push({
        name: 'tertiary',
        attention: 0.5,
        x: focalPoint.x,
        y: focalPoint.y,
        radius: maxRadius * 0.7
    });

    // Peripheral (20%)
    zones.push({
        name: 'peripheral',
        attention: 0.2,
        x: focalPoint.x,
        y: focalPoint.y,
        radius: maxRadius
    });

    return zones;
}

// ========================================
// VISUAL FLOW PATTERNS
// ========================================

export const EYE_MOVEMENT_PATTERNS = {
    // Z-Pattern - most common for western readers
    z_pattern: {
        name: 'Z-Pattern',
        description: 'Top-left to top-right, diagonal to bottom-left, then bottom-right',
        path: (w, h) => [
            { x: w * 0.1, y: h * 0.15, order: 1, weight: 1.0 },
            { x: w * 0.9, y: h * 0.15, order: 2, weight: 0.8 },
            { x: w * 0.1, y: h * 0.85, order: 3, weight: 0.6 },
            { x: w * 0.9, y: h * 0.85, order: 4, weight: 0.9 } // CTA position
        ],
        bestFor: ['simple layouts', 'landing pages', 'ads']
    },

    // F-Pattern - for text-heavy content
    f_pattern: {
        name: 'F-Pattern',
        description: 'Top-left, horizontal scan, down-left, shorter horizontal scan',
        path: (w, h) => [
            { x: w * 0.1, y: h * 0.12, order: 1, weight: 1.0 },
            { x: w * 0.85, y: h * 0.12, order: 2, weight: 0.8 },
            { x: w * 0.1, y: h * 0.35, order: 3, weight: 0.9 },
            { x: w * 0.6, y: h * 0.35, order: 4, weight: 0.7 },
            { x: w * 0.1, y: h * 0.55, order: 5, weight: 0.6 }
        ],
        bestFor: ['text-heavy ads', 'feature lists', 'articles']
    },

    // Gutenberg Diagram - for balanced layouts
    gutenberg: {
        name: 'Gutenberg Diagram',
        description: 'Four quadrants with diagonal reading gravity',
        path: (w, h) => [
            { x: w * 0.25, y: h * 0.25, order: 1, weight: 1.0, zone: 'primary_optical' },
            { x: w * 0.75, y: h * 0.25, order: 2, weight: 0.5, zone: 'strong_fallow' },
            { x: w * 0.25, y: h * 0.75, order: 3, weight: 0.4, zone: 'weak_fallow' },
            { x: w * 0.75, y: h * 0.75, order: 4, weight: 0.9, zone: 'terminal_area' }
        ],
        bestFor: ['balanced ads', 'product focus', 'minimal designs']
    },

    // Center-out - for hero product
    center_radial: {
        name: 'Center Radial',
        description: 'Center product with radiating attention',
        path: (w, h) => [
            { x: w * 0.5, y: h * 0.45, order: 1, weight: 1.0 },
            { x: w * 0.5, y: h * 0.15, order: 2, weight: 0.9 }, // Headline above
            { x: w * 0.5, y: h * 0.85, order: 3, weight: 0.85 } // CTA below
        ],
        bestFor: ['product focus', 'hero layouts', 'centered designs']
    },

    // Spiral - natural movement
    spiral: {
        name: 'Golden Spiral',
        description: 'Following the golden spiral from outside in',
        path: (w, h) => {
            const points = [];
            const centerX = w * 0.618;
            const centerY = h * 0.382;
            for (let i = 0; i < 6; i++) {
                const angle = (i * 90 * Math.PI) / 180;
                const radius = (6 - i) * 50;
                points.push({
                    x: centerX + Math.cos(angle) * radius,
                    y: centerY + Math.sin(angle) * radius,
                    order: i + 1,
                    weight: 1 - (i * 0.12)
                });
            }
            return points;
        },
        bestFor: ['creative ads', 'artistic layouts', 'storytelling']
    }
};

/**
 * Get recommended flow pattern for content type
 */
export function getRecommendedFlowPattern(contentType, elementCount) {
    if (contentType === 'minimal' || elementCount <= 3) {
        return EYE_MOVEMENT_PATTERNS.center_radial;
    }
    if (contentType === 'text_heavy' || elementCount > 5) {
        return EYE_MOVEMENT_PATTERNS.f_pattern;
    }
    if (contentType === 'creative' || contentType === 'storytelling') {
        return EYE_MOVEMENT_PATTERNS.spiral;
    }
    // Default
    return EYE_MOVEMENT_PATTERNS.z_pattern;
}

/**
 * Calculate visual flow path
 */
export function calculateVisualFlowPath(elements, canvasWidth, canvasHeight) {
    if (elements.length === 0) return [];

    // Sort elements by visual weight
    const weighted = elements.map(el => ({
        ...el,
        weight: calculateVisualWeight(el)
    })).sort((a, b) => b.weight - a.weight);

    // Create flow path starting from heaviest element
    const path = [];
    const visited = new Set();
    let current = weighted[0];

    while (current && path.length < elements.length) {
        path.push({
            x: current.x + (current.width || 0) / 2,
            y: current.y + (current.height || 0) / 2,
            element: current,
            order: path.length + 1
        });
        visited.add(current);

        // Find next closest unvisited element with good visual weight
        current = findNextFlowElement(current, weighted, visited);
    }

    return path;
}

function findNextFlowElement(current, elements, visited) {
    let best = null;
    let bestScore = -Infinity;

    for (const el of elements) {
        if (visited.has(el)) continue;

        const distance = Math.sqrt(
            Math.pow(el.x - current.x, 2) + Math.pow(el.y - current.y, 2)
        );

        // Score based on weight and distance (prefer close high-weight elements)
        const score = el.weight - (distance * 0.1);

        if (score > bestScore) {
            bestScore = score;
            best = el;
        }
    }

    return best;
}

// ========================================
// GESTALT PRINCIPLES
// ========================================

export const GESTALT_PRINCIPLES = {
    proximity: {
        name: 'Proximity',
        description: 'Elements close together are perceived as related',
        implementation: (elements) => {
            // Group nearby elements
            const groups = [];
            const threshold = 100; // pixels

            for (const el of elements) {
                let foundGroup = false;
                for (const group of groups) {
                    for (const member of group) {
                        const dist = Math.sqrt(
                            Math.pow(el.x - member.x, 2) + Math.pow(el.y - member.y, 2)
                        );
                        if (dist < threshold) {
                            group.push(el);
                            foundGroup = true;
                            break;
                        }
                    }
                    if (foundGroup) break;
                }
                if (!foundGroup) groups.push([el]);
            }

            return groups;
        }
    },

    similarity: {
        name: 'Similarity',
        description: 'Similar elements are perceived as related',
        implementation: (elements) => {
            // Group by visual similarity (color, size, shape)
            const groups = {};

            for (const el of elements) {
                const key = `${el.type || 'default'}_${el.color || 'none'}`;
                if (!groups[key]) groups[key] = [];
                groups[key].push(el);
            }

            return Object.values(groups);
        }
    },

    continuity: {
        name: 'Continuity',
        description: 'Eyes follow smooth paths',
        implementation: (startPoint, endPoint) => {
            // Generate smooth curve points
            const points = [];
            const steps = 10;

            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                // Bezier curve for smooth path
                points.push({
                    x: startPoint.x + (endPoint.x - startPoint.x) * t,
                    y: startPoint.y + (endPoint.y - startPoint.y) * t
                });
            }

            return points;
        }
    },

    closure: {
        name: 'Closure',
        description: 'Mind completes incomplete shapes',
        implementation: (elements) => {
            // Find elements that form implied shapes
            // Return bounds of implied shapes
            if (elements.length < 3) return null;

            const bounds = {
                minX: Math.min(...elements.map(e => e.x)),
                maxX: Math.max(...elements.map(e => e.x + (e.width || 0))),
                minY: Math.min(...elements.map(e => e.y)),
                maxY: Math.max(...elements.map(e => e.y + (e.height || 0)))
            };

            return {
                x: bounds.minX,
                y: bounds.minY,
                width: bounds.maxX - bounds.minX,
                height: bounds.maxY - bounds.minY,
                implied: true
            };
        }
    },

    figure_ground: {
        name: 'Figure-Ground',
        description: 'Distinguish foreground from background',
        implementation: (elements, canvasWidth, canvasHeight) => {
            const canvasArea = canvasWidth * canvasHeight;

            return elements.map(el => {
                const elArea = (el.width || 100) * (el.height || 100);
                const prominence = elArea / canvasArea;

                return {
                    ...el,
                    layer: prominence > 0.3 ? 'figure' : (prominence > 0.1 ? 'midground' : 'detail'),
                    prominence
                };
            });
        }
    }
};

// ========================================
// NEGATIVE SPACE ANALYSIS
// ========================================

/**
 * Analyze negative space (whitespace) in composition
 */
export function analyzeNegativeSpace(elements, canvasWidth, canvasHeight) {
    const canvasArea = canvasWidth * canvasHeight;

    // Calculate total content area
    let contentArea = 0;
    const occupiedRegions = [];

    for (const el of elements) {
        const area = (el.width || 0) * (el.height || 0);
        contentArea += area;
        occupiedRegions.push({
            x: el.x,
            y: el.y,
            width: el.width || 0,
            height: el.height || 0
        });
    }

    const negativeSpaceRatio = 1 - (contentArea / canvasArea);

    // Analyze distribution of negative space
    const gridSize = 10;
    const cellWidth = canvasWidth / gridSize;
    const cellHeight = canvasHeight / gridSize;
    const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));

    // Mark occupied cells
    for (const region of occupiedRegions) {
        const startCol = Math.floor(region.x / cellWidth);
        const endCol = Math.min(gridSize - 1, Math.floor((region.x + region.width) / cellWidth));
        const startRow = Math.floor(region.y / cellHeight);
        const endRow = Math.min(gridSize - 1, Math.floor((region.y + region.height) / cellHeight));

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
                    grid[r][c] = true;
                }
            }
        }
    }

    // Find largest empty region
    const emptyRegions = findEmptyRegions(grid, cellWidth, cellHeight);

    return {
        ratio: Math.round(negativeSpaceRatio * 100) / 100,
        assessment: negativeSpaceRatio > 0.6 ? 'generous' :
            negativeSpaceRatio > 0.4 ? 'balanced' :
                negativeSpaceRatio > 0.25 ? 'moderate' : 'dense',
        gridAnalysis: grid,
        emptyRegions,
        recommendation: getNegativeSpaceRecommendation(negativeSpaceRatio)
    };
}

function findEmptyRegions(grid, cellWidth, cellHeight) {
    const regions = [];
    const visited = Array(grid.length).fill(null).map(() => Array(grid[0].length).fill(false));

    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[0].length; c++) {
            if (!grid[r][c] && !visited[r][c]) {
                const region = floodFill(grid, visited, r, c);
                if (region.length > 1) {
                    const bounds = getRegionBounds(region, cellWidth, cellHeight);
                    regions.push(bounds);
                }
            }
        }
    }

    return regions.sort((a, b) => b.area - a.area);
}

function floodFill(grid, visited, startR, startC) {
    const cells = [];
    const queue = [[startR, startC]];

    while (queue.length > 0) {
        const [r, c] = queue.shift();

        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) continue;
        if (visited[r][c] || grid[r][c]) continue;

        visited[r][c] = true;
        cells.push({ r, c });

        queue.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
    }

    return cells;
}

function getRegionBounds(cells, cellWidth, cellHeight) {
    const rows = cells.map(c => c.r);
    const cols = cells.map(c => c.c);

    const minR = Math.min(...rows);
    const maxR = Math.max(...rows);
    const minC = Math.min(...cols);
    const maxC = Math.max(...cols);

    return {
        x: minC * cellWidth,
        y: minR * cellHeight,
        width: (maxC - minC + 1) * cellWidth,
        height: (maxR - minR + 1) * cellHeight,
        area: cells.length * cellWidth * cellHeight
    };
}

function getNegativeSpaceRecommendation(ratio) {
    if (ratio > 0.7) {
        return 'Consider adding more content or decorative elements';
    } else if (ratio > 0.5) {
        return 'Good balance of content and breathing room';
    } else if (ratio > 0.3) {
        return 'Layout is getting dense, ensure key elements stand out';
    } else {
        return 'Very dense layout, consider removing or consolidating elements';
    }
}

// ========================================
// VISUAL TENSION & BALANCE
// ========================================

/**
 * Calculate visual tension in composition
 */
export function calculateVisualTension(elements, canvasWidth, canvasHeight) {
    if (elements.length < 2) {
        return { tension: 0, vectors: [], assessment: 'neutral' };
    }

    // Calculate tension vectors between elements
    const vectors = [];

    for (let i = 0; i < elements.length; i++) {
        for (let j = i + 1; j < elements.length; j++) {
            const el1 = elements[i];
            const el2 = elements[j];

            const dx = (el2.x + (el2.width || 0) / 2) - (el1.x + (el1.width || 0) / 2);
            const dy = (el2.y + (el2.height || 0) / 2) - (el1.y + (el1.height || 0) / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            const weight1 = calculateVisualWeight(el1);
            const weight2 = calculateVisualWeight(el2);

            // Tension increases with weight difference and proximity
            const tensionMagnitude = Math.abs(weight1 - weight2) / (distance / 100);

            vectors.push({
                from: { x: el1.x, y: el1.y },
                to: { x: el2.x, y: el2.y },
                magnitude: tensionMagnitude,
                direction: Math.atan2(dy, dx) * (180 / Math.PI)
            });
        }
    }

    // Average tension
    const avgTension = vectors.reduce((sum, v) => sum + v.magnitude, 0) / vectors.length;

    return {
        tension: Math.round(avgTension * 100) / 100,
        vectors,
        assessment: avgTension > 3 ? 'high_tension' :
            avgTension > 1.5 ? 'balanced_tension' :
                avgTension > 0.5 ? 'subtle_tension' : 'static'
    };
}

// ========================================
// DEPTH & LAYERING
// ========================================

/**
 * Assign depth layers to elements
 */
export function assignDepthLayers(elements, canvasWidth, canvasHeight) {
    const layered = elements.map(el => {
        const weight = calculateVisualWeight(el);
        const size = (el.width || 100) * (el.height || 100);
        const sizeRatio = size / (canvasWidth * canvasHeight);

        // Larger and heavier elements feel closer
        let depth = 3; // Default middle layer

        if (sizeRatio > 0.3 && weight > 50) {
            depth = 1; // Foreground
        } else if (sizeRatio > 0.15 || weight > 35) {
            depth = 2; // Near-middle
        } else if (sizeRatio < 0.05 || weight < 15) {
            depth = 4; // Background details
        }

        return { ...el, depth, depthLabel: getDepthLabel(depth) };
    });

    return layered.sort((a, b) => b.depth - a.depth); // Sort back to front
}

function getDepthLabel(depth) {
    const labels = {
        1: 'foreground',
        2: 'midground_near',
        3: 'midground',
        4: 'background',
        5: 'deep_background'
    };
    return labels[depth] || 'unknown';
}

/**
 * Generate depth-based effects
 */
export function getDepthEffects(depth) {
    const effects = {
        1: { blur: 0, opacity: 1, scale: 1, shadow: 'large' },
        2: { blur: 0, opacity: 0.95, scale: 0.95, shadow: 'medium' },
        3: { blur: 1, opacity: 0.85, scale: 0.9, shadow: 'small' },
        4: { blur: 2, opacity: 0.7, scale: 0.85, shadow: 'none' },
        5: { blur: 4, opacity: 0.5, scale: 0.8, shadow: 'none' }
    };

    return effects[depth] || effects[3];
}

export default {
    calculateFocalPoint,
    EYE_MOVEMENT_PATTERNS,
    getRecommendedFlowPattern,
    calculateVisualFlowPath,
    GESTALT_PRINCIPLES,
    analyzeNegativeSpace,
    calculateVisualTension,
    assignDepthLayers,
    getDepthEffects
};
