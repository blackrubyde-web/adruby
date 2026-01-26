/**
 * Composition Plan Solver
 *
 * Enforces safe zones, resolves collisions, and normalizes positions
 * to make composition plans renderable without overlaps.
 */

import { detectCollisions, validateElementPlacements } from '../quality/qualityScoringEngine.js';

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

export default { solveCompositionPlan };
