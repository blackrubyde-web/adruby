/**
 * Composition Plan Solver v2.0
 *
 * Enforces safe zones, resolves collisions, and normalizes positions
 * using mathematical principles for optimal composition:
 * - Golden Ratio (1.618) for element spacing
 * - Rule of Thirds for key element placement
 * - Z-pattern and F-pattern for reading flow
 * - Meta/Facebook safe zones for ad compliance
 */

import { detectCollisions, validateElementPlacements } from '../quality/qualityScoringEngine.js';

// Mathematical constants
const GOLDEN_RATIO = 1.618;
const PHI = 0.618; // Inverse golden ratio

// Golden Ratio grid points (0-1 scale)
const GOLDEN_GRID = {
    // Horizontal golden points
    left: 1 - PHI,           // 0.382
    center: 0.5,
    right: PHI,              // 0.618
    // Vertical golden points
    top: 1 - PHI,            // 0.382
    middle: 0.5,
    bottom: PHI              // 0.618
};

// Rule of Thirds grid
const THIRDS_GRID = {
    left: 0.333,
    right: 0.667,
    top: 0.333,
    bottom: 0.667
};

// Meta/Facebook ad safe zones
const META_SAFE_ZONES = {
    feed: {
        top: 0.08,      // Account for profile pic overlay
        bottom: 0.12,   // Account for CTA button overlay
        left: 0.04,
        right: 0.04
    },
    story: {
        top: 0.15,      // Story header
        bottom: 0.20,   // Swipe up CTA
        left: 0.04,
        right: 0.04
    }
};

// Reading patterns - where eyes naturally flow
const READING_PATTERNS = {
    // Z-pattern: Top-left → Top-right → Bottom-left → Bottom-right
    z_pattern: [
        { x: 0.15, y: 0.15 },  // Start
        { x: 0.85, y: 0.15 },  // Top-right
        { x: 0.15, y: 0.85 },  // Bottom-left
        { x: 0.85, y: 0.85 }   // End/CTA
    ],
    // F-pattern: Top → Left column scan (for text-heavy)
    f_pattern: [
        { x: 0.5, y: 0.12 },   // Headline
        { x: 0.2, y: 0.35 },   // First scan line
        { x: 0.2, y: 0.55 },   // Second scan line
        { x: 0.5, y: 0.88 }    // CTA
    ],
    // Gutenberg diagonal (for balanced layouts)
    gutenberg: [
        { x: 0.2, y: 0.15 },   // Primary optical area
        { x: 0.8, y: 0.15 },   // Strong fallow
        { x: 0.2, y: 0.85 },   // Weak fallow
        { x: 0.8, y: 0.85 }    // Terminal area (CTA!)
    ]
};

const DEFAULT_BOUNDS = { min: 0.05, max: 0.95 };
const DEFAULT_STEP = 0.04;
const MAX_ITERATIONS = 12;

export function solveCompositionPlan(plan, deepAnalysis, options = {}) {
    if (!plan) {
        throw new Error('Composition plan is required');
    }

    const bounds = {
        min: options.minBound ?? DEFAULT_BOUNDS.min,
        max: options.maxBound ?? DEFAULT_BOUNDS.max
    };
    const step = options.step ?? DEFAULT_STEP;
    const resolved = structuredClone(plan);

    ensureRequiredPositions(resolved);
    normalizePositions(resolved, bounds);
    applyZoneAvoidance(resolved, deepAnalysis, bounds, step);

    for (let i = 0; i < MAX_ITERATIONS; i += 1) {
        const violations = validateElementPlacements(resolved, deepAnalysis);
        const collisions = detectCollisions(resolved);

        if (violations.length === 0 && collisions.length === 0) {
            return resolved;
        }

        if (violations.length > 0) {
            applyZoneAvoidance(resolved, deepAnalysis, bounds, step);
        }

        if (collisions.length > 0) {
            resolveCollisions(resolved, collisions, bounds, step, i);
        }
    }

    const finalViolations = validateElementPlacements(resolved, deepAnalysis);
    const finalCollisions = detectCollisions(resolved);
    if (finalViolations.length || finalCollisions.length) {
        throw new Error('Unable to resolve composition plan collisions or safe-zone violations');
    }

    return resolved;
}

function ensureRequiredPositions(plan) {
    const required = [
        plan?.headline?.text ? { name: 'headline', pos: plan.headline.position } : null,
        plan?.subheadline?.text ? { name: 'subheadline', pos: plan.subheadline.position } : null,
        plan?.cta?.text ? { name: 'cta', pos: plan.cta.position } : null,
        plan?.product ? { name: 'product', pos: plan.product.position } : null
    ].filter(Boolean);

    for (const item of required) {
        if (!item.pos || !isFiniteNumber(item.pos.xPercent) || !isFiniteNumber(item.pos.yPercent)) {
            throw new Error(`Composition plan missing position for ${item.name}`);
        }
    }

    (plan?.badges || []).forEach((badge, index) => {
        if (!badge?.position || !isFiniteNumber(badge.position.xPercent) || !isFiniteNumber(badge.position.yPercent)) {
            throw new Error(`Composition plan missing position for badge_${index}`);
        }
    });

    (plan?.callouts || []).forEach((callout, index) => {
        if (!callout?.position || !isFiniteNumber(callout.position.xPercent) || !isFiniteNumber(callout.position.yPercent)) {
            throw new Error(`Composition plan missing position for callout_${index}`);
        }
    });

    (plan?.features || []).forEach((feature, index) => {
        if (!feature?.position || !isFiniteNumber(feature.position.xPercent) || !isFiniteNumber(feature.position.yPercent)) {
            throw new Error(`Composition plan missing position for feature_${index}`);
        }
    });
}

function normalizePositions(plan, bounds) {
    for (const target of getPositionTargets(plan)) {
        clampPosition(target.position, bounds);
    }
}

function applyZoneAvoidance(plan, deepAnalysis, bounds, step) {
    const safeZones = deepAnalysis?.safeZones || {};
    const noText = safeZones.noText || [];
    const noOverlay = safeZones.noOverlay || [];

    for (const target of getPositionTargets(plan)) {
        if (target.type === 'text') {
            avoidZones(target.position, noText, bounds, step);
        }
        avoidZones(target.position, noOverlay, bounds, step);
    }
}

function resolveCollisions(plan, collisions, bounds, step, iteration) {
    const elementMap = buildElementMap(plan);

    for (const collision of collisions) {
        const { element1, element2 } = collision;
        const target = pickCollisionTarget(element1, element2);
        const position = elementMap[target];
        if (!position) continue;

        const angle = ((iteration % 8) * Math.PI) / 4;
        const dx = Math.cos(angle) * step;
        const dy = Math.sin(angle) * step;
        nudgePosition(position, bounds, dx, dy);
    }
}

function buildElementMap(plan) {
    const map = {};

    if (plan?.headline?.position) map.headline = plan.headline.position;
    if (plan?.subheadline?.position) map.subheadline = plan.subheadline.position;
    if (plan?.cta?.position) map.cta = plan.cta.position;
    if (plan?.product?.position) map.product = plan.product.position;

    (plan?.badges || []).forEach((badge, index) => {
        if (badge?.position) map[`badge_${index}`] = badge.position;
    });

    (plan?.callouts || []).forEach((callout, index) => {
        if (callout?.position) map[`callout_${index}`] = callout.position;
    });

    return map;
}

function pickCollisionTarget(element1, element2) {
    const priority1 = getMovePriority(element1);
    const priority2 = getMovePriority(element2);
    return priority1 <= priority2 ? element1 : element2;
}

function getMovePriority(elementName) {
    if (elementName === 'product') return 100;
    if (elementName.startsWith('cta')) return 5;
    if (elementName.startsWith('headline')) return 4;
    if (elementName.startsWith('subheadline')) return 3;
    if (elementName.startsWith('callout_')) return 2;
    if (elementName.startsWith('badge_')) return 1;
    return 10;
}

function getPositionTargets(plan) {
    const targets = [];

    if (plan?.headline?.position) {
        targets.push({ name: 'headline', type: 'text', position: plan.headline.position });
    }
    if (plan?.subheadline?.position) {
        targets.push({ name: 'subheadline', type: 'text', position: plan.subheadline.position });
    }
    if (plan?.cta?.position) {
        targets.push({ name: 'cta', type: 'text', position: plan.cta.position });
    }
    if (plan?.product?.position) {
        targets.push({ name: 'product', type: 'overlay', position: plan.product.position });
    }

    (plan?.badges || []).forEach((badge, index) => {
        if (badge?.position) {
            targets.push({ name: `badge_${index}`, type: 'overlay', position: badge.position });
        }
    });

    (plan?.callouts || []).forEach((callout, index) => {
        if (callout?.position) {
            targets.push({ name: `callout_${index}`, type: 'overlay', position: callout.position });
        }
    });

    return targets;
}

function avoidZones(position, zones, bounds, step) {
    for (const zone of zones) {
        if (!zone || !isFiniteNumber(zone.xPercent) || !isFiniteNumber(zone.yPercent) || !isFiniteNumber(zone.radiusPercent)) {
            continue;
        }

        const dx = position.xPercent - zone.xPercent;
        const dy = position.yPercent - zone.yPercent;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance >= zone.radiusPercent) continue;

        const safeDistance = zone.radiusPercent + step;
        const scale = distance === 0 ? 1 : safeDistance / distance;
        position.xPercent = zone.xPercent + dx * scale;
        position.yPercent = zone.yPercent + dy * scale;
        clampPosition(position, bounds);
    }
}

function nudgePosition(position, bounds, dx, dy) {
    position.xPercent += dx;
    position.yPercent += dy;
    clampPosition(position, bounds);
}

function clampPosition(position, bounds) {
    position.xPercent = clamp(position.xPercent, bounds.min, bounds.max);
    position.yPercent = clamp(position.yPercent, bounds.min, bounds.max);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function isFiniteNumber(value) {
    return Number.isFinite(value);
}

// ═══════════════════════════════════════════════════════════════
// GOLDEN RATIO ALIGNMENT FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Snap position to nearest golden ratio grid point
 */
export function snapToGoldenGrid(position, tolerance = 0.08) {
    const goldenPoints = [
        { x: GOLDEN_GRID.left, y: GOLDEN_GRID.top },
        { x: GOLDEN_GRID.center, y: GOLDEN_GRID.top },
        { x: GOLDEN_GRID.right, y: GOLDEN_GRID.top },
        { x: GOLDEN_GRID.left, y: GOLDEN_GRID.middle },
        { x: GOLDEN_GRID.center, y: GOLDEN_GRID.middle },
        { x: GOLDEN_GRID.right, y: GOLDEN_GRID.middle },
        { x: GOLDEN_GRID.left, y: GOLDEN_GRID.bottom },
        { x: GOLDEN_GRID.center, y: GOLDEN_GRID.bottom },
        { x: GOLDEN_GRID.right, y: GOLDEN_GRID.bottom }
    ];

    let nearest = null;
    let minDist = Infinity;

    for (const point of goldenPoints) {
        const dist = Math.sqrt(
            Math.pow(position.xPercent - point.x, 2) +
            Math.pow(position.yPercent - point.y, 2)
        );
        if (dist < minDist && dist <= tolerance) {
            minDist = dist;
            nearest = point;
        }
    }

    if (nearest) {
        return { xPercent: nearest.x, yPercent: nearest.y };
    }
    return position;
}

/**
 * Apply reading pattern to composition plan
 * Places headline, features, and CTA along natural eye flow
 */
export function applyReadingPattern(plan, pattern = 'z_pattern') {
    const patternPoints = READING_PATTERNS[pattern] || READING_PATTERNS.z_pattern;
    const resolved = structuredClone(plan);

    // Map elements to reading pattern points
    if (resolved.headline?.position && patternPoints[0]) {
        resolved.headline.position.xPercent = patternPoints[0].x;
        resolved.headline.position.yPercent = patternPoints[0].y;
    }

    // Product typically goes in center (between first and last)
    if (resolved.product?.position) {
        resolved.product.position.xPercent = 0.5;
        resolved.product.position.yPercent = 0.5;
    }

    // CTA goes to terminal area (last point)
    if (resolved.cta?.position && patternPoints[patternPoints.length - 1]) {
        resolved.cta.position.xPercent = patternPoints[patternPoints.length - 1].x;
        resolved.cta.position.yPercent = patternPoints[patternPoints.length - 1].y;
    }

    return resolved;
}

/**
 * Apply Meta/Facebook safe zone constraints
 */
export function applyMetaSafeZones(plan, format = 'feed') {
    const safeZone = META_SAFE_ZONES[format] || META_SAFE_ZONES.feed;
    const resolved = structuredClone(plan);
    const bounds = {
        min: Math.max(safeZone.left, safeZone.top),
        max: 1 - Math.max(safeZone.right, safeZone.bottom)
    };

    for (const target of getPositionTargets(resolved)) {
        // Ensure important elements (headline, CTA) aren't in unsafe areas
        if (target.name === 'headline') {
            target.position.yPercent = Math.max(target.position.yPercent, safeZone.top + 0.05);
        }
        if (target.name === 'cta') {
            target.position.yPercent = Math.min(target.position.yPercent, 1 - safeZone.bottom - 0.05);
        }
        clampPosition(target.position, bounds);
    }

    return resolved;
}

/**
 * Calculate visual weight and balance the composition
 */
export function balanceVisualWeight(plan) {
    const resolved = structuredClone(plan);
    const targets = getPositionTargets(resolved);

    // Calculate center of mass
    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;

    const WEIGHTS = {
        product: 5,
        headline: 3,
        cta: 2,
        subheadline: 1,
        badge: 0.5,
        callout: 0.5
    };

    for (const target of targets) {
        const weight = WEIGHTS[target.name.split('_')[0]] || 1;
        weightedX += target.position.xPercent * weight;
        weightedY += target.position.yPercent * weight;
        totalWeight += weight;
    }

    const centerX = weightedX / totalWeight;
    const centerY = weightedY / totalWeight;

    // If center of mass is off-center, nudge elements to balance
    const offsetX = 0.5 - centerX;
    const offsetY = 0.5 - centerY;

    // Only apply subtle balancing (max 5% shift)
    const maxShift = 0.05;
    const balanceX = clamp(offsetX * 0.3, -maxShift, maxShift);
    const balanceY = clamp(offsetY * 0.3, -maxShift, maxShift);

    for (const target of targets) {
        // Don't move product
        if (target.name === 'product') continue;
        target.position.xPercent = clamp(target.position.xPercent + balanceX, 0.05, 0.95);
        target.position.yPercent = clamp(target.position.yPercent + balanceY, 0.05, 0.95);
    }

    return resolved;
}

/**
 * Get optimal position for element type based on design principles
 */
export function getOptimalPosition(elementType, layout = 'centered') {
    const OPTIMAL_POSITIONS = {
        centered: {
            headline: { xPercent: 0.5, yPercent: 0.12 },
            subheadline: { xPercent: 0.5, yPercent: 0.22 },
            product: { xPercent: 0.5, yPercent: 0.5 },
            cta: { xPercent: 0.5, yPercent: 0.88 },
            badge: { xPercent: 0.85, yPercent: 0.15 }
        },
        left_product: {
            headline: { xPercent: 0.65, yPercent: 0.15 },
            subheadline: { xPercent: 0.65, yPercent: 0.25 },
            product: { xPercent: 0.25, yPercent: 0.5 },
            cta: { xPercent: 0.65, yPercent: 0.85 },
            badge: { xPercent: 0.9, yPercent: 0.1 }
        },
        right_product: {
            headline: { xPercent: 0.35, yPercent: 0.15 },
            subheadline: { xPercent: 0.35, yPercent: 0.25 },
            product: { xPercent: 0.75, yPercent: 0.5 },
            cta: { xPercent: 0.35, yPercent: 0.85 },
            badge: { xPercent: 0.1, yPercent: 0.1 }
        },
        diagonal: {
            headline: { xPercent: GOLDEN_GRID.left, yPercent: GOLDEN_GRID.top },
            subheadline: { xPercent: GOLDEN_GRID.left, yPercent: 0.48 },
            product: { xPercent: GOLDEN_GRID.right, yPercent: 0.55 },
            cta: { xPercent: GOLDEN_GRID.right, yPercent: GOLDEN_GRID.bottom },
            badge: { xPercent: 0.9, yPercent: 0.1 }
        }
    };

    const layoutPositions = OPTIMAL_POSITIONS[layout] || OPTIMAL_POSITIONS.centered;
    return layoutPositions[elementType] || { xPercent: 0.5, yPercent: 0.5 };
}

export default {
    solveCompositionPlan,
    snapToGoldenGrid,
    applyReadingPattern,
    applyMetaSafeZones,
    balanceVisualWeight,
    getOptimalPosition,
    GOLDEN_GRID,
    THIRDS_GRID,
    META_SAFE_ZONES,
    READING_PATTERNS
};
