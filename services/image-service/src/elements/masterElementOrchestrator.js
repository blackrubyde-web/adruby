/**
 * MASTER ELEMENT ORCHESTRATOR
 * 
 * Central hub for all 360° element generation:
 * 
 * - Combines all element modules
 * - Intelligent element selection
 * - Layer composition
 * - Style presets
 * - Export to PNG/SVG
 */

import sharp from 'sharp';

// Import all element modules
import * as shapes from './shapeGenerator.js';
import * as dataViz from './dataVisualization.js';
import * as icons from './iconLibrary.js';
import * as badges from './badgeGenerator.js';
import * as glass from './glassmorphicComponents.js';
import * as textFx from './enhancedTextEffects.js';
import * as callouts from './calloutGenerator.js';
import * as overlays from './decorativeOverlays.js';

// ========================================
// QUICK ACCESS EXPORTS
// ========================================

export const Elements = {
    shapes,
    dataViz,
    icons,
    badges,
    glass,
    textFx,
    callouts,
    overlays
};

// ========================================
// ELEMENT PRESETS BY AD TYPE
// ========================================

export const ELEMENT_PRESETS = {
    // Product showcase ad
    product_showcase: {
        background: { overlays: ['gradientOrbs', 'vignette'] },
        decorative: ['sparkles', 'bokeh'],
        badges: ['featureBadge'],
        text: ['gradientText', 'glowText']
    },

    // SaaS/App ad
    saas_app: {
        background: { overlays: ['particles', 'vignette'] },
        decorative: ['geometricAccents', 'lightStreaks'],
        components: ['glassCard', 'glassButton'],
        dataViz: ['progressBar', 'statCounter'],
        text: ['shadowText']
    },

    // E-commerce sale ad
    ecommerce_sale: {
        badges: ['discountBadge', 'featureBadge'],
        overlays: ['bokeh', 'sparkles'],
        callouts: ['comparisonCallout'],
        text: ['glowText', '3dText']
    },

    // Social proof ad
    social_proof: {
        dataViz: ['starRating', 'avatarBadge', 'statCounter'],
        badges: ['trustBadge'],
        components: ['glassBanner'],
        overlays: ['particles']
    },

    // Feature highlight ad
    feature_highlight: {
        callouts: ['featureCallout', 'numberedStep', 'iconCallout'],
        dataViz: ['featureList', 'comparisonTable'],
        overlays: ['lightStreaks'],
        text: ['highlightText']
    },

    // Comparison ad
    comparison: {
        dataViz: ['barChart', 'comparisonTable', 'progressBar'],
        callouts: ['comparisonCallout'],
        badges: ['featureBadge'],
        text: ['splitColorText']
    },

    // Luxury/Premium ad
    luxury: {
        overlays: ['gradientOrbs', 'vignette', 'lensFlare'],
        components: ['glassCard'],
        text: ['gradientText', '3dText'],
        decorative: ['geometricAccents']
    },

    // Tech/Innovation ad
    tech: {
        overlays: ['particles', 'geometricAccents', 'lightStreaks'],
        dataViz: ['circularProgress', 'timeline'],
        components: ['glassPanel'],
        text: ['glowText', 'outlinedText']
    }
};

// ========================================
// INTELLIGENT ELEMENT SELECTOR
// ========================================

export function selectElementsForAd({
    industry,
    adType,
    mood,
    hasDiscount = false,
    hasSocialProof = false,
    hasFeatureList = false,
    hasComparison = false
}) {
    const selected = {
        overlays: [],
        components: [],
        badges: [],
        dataViz: [],
        callouts: [],
        text: []
    };

    // Get preset or use default
    const preset = ELEMENT_PRESETS[adType] || ELEMENT_PRESETS.product_showcase;

    // Apply preset
    if (preset.background?.overlays) selected.overlays.push(...preset.background.overlays);
    if (preset.decorative) selected.overlays.push(...preset.decorative);
    if (preset.components) selected.components.push(...preset.components);
    if (preset.badges) selected.badges.push(...preset.badges);
    if (preset.dataViz) selected.dataViz.push(...preset.dataViz);
    if (preset.callouts) selected.callouts.push(...preset.callouts);
    if (preset.text) selected.text.push(...preset.text);

    // Add conditional elements
    if (hasDiscount) {
        selected.badges.push('discountBadge');
        selected.text.push('glowText');
    }

    if (hasSocialProof) {
        selected.dataViz.push('starRating', 'avatarBadge');
        selected.badges.push('trustBadge');
    }

    if (hasFeatureList) {
        selected.dataViz.push('featureList');
        selected.callouts.push('iconCallout');
    }

    if (hasComparison) {
        selected.dataViz.push('barChart');
        selected.callouts.push('comparisonCallout');
    }

    // Mood adjustments
    if (mood === 'exciting' || mood === 'energetic') {
        selected.overlays.push('sparkles', 'lensFlare');
    } else if (mood === 'calm' || mood === 'professional') {
        selected.overlays = selected.overlays.filter(o => !['sparkles', 'lensFlare'].includes(o));
    } else if (mood === 'premium' || mood === 'luxury') {
        selected.overlays.push('gradientOrbs');
        selected.text.push('gradientText');
    }

    // Remove duplicates
    for (const key of Object.keys(selected)) {
        selected[key] = [...new Set(selected[key])];
    }

    return selected;
}

// ========================================
// LAYER COMPOSER
// ========================================

export function composeElementLayers({
    width = 1080,
    height = 1080,
    elements,
    options = {}
}) {
    const layers = {
        background: [],
        decorative: [],
        content: [],
        overlays: [],
        effects: []
    };

    // Background overlays (gradient orbs, etc.)
    if (elements.overlays?.includes('gradientOrbs')) {
        layers.background.push(overlays.generateGradientOrbs({
            width, height,
            orbs: [
                { x: width * 0.2, y: height * 0.3, size: 400, color: options.primaryColor || '#3B82F6', opacity: 0.12 },
                { x: width * 0.8, y: height * 0.7, size: 350, color: options.secondaryColor || '#8B5CF6', opacity: 0.1 }
            ]
        }).svg);
    }

    // Decorative elements
    if (elements.overlays?.includes('bokeh')) {
        layers.decorative.push(overlays.generateBokeh({ width, height }).svg);
    }
    if (elements.overlays?.includes('particles')) {
        layers.decorative.push(overlays.generateParticles({ width, height }).svg);
    }
    if (elements.overlays?.includes('sparkles')) {
        layers.decorative.push(overlays.generateSparkles({ width, height }).svg);
    }
    if (elements.overlays?.includes('geometricAccents')) {
        layers.decorative.push(overlays.generateGeometricAccents({ width, height }).svg);
    }
    if (elements.overlays?.includes('lightStreaks')) {
        layers.decorative.push(overlays.generateLightStreaks({ width, height }).svg);
    }
    if (elements.overlays?.includes('lensFlare')) {
        layers.effects.push(overlays.generateLensFlare({ x: width * 0.2, y: height * 0.2 }).svg);
    }

    // Final vignette
    if (elements.overlays?.includes('vignette')) {
        layers.effects.push(overlays.generateVignette({ width, height }).svg);
    }

    return layers;
}

// ========================================
// SVG BUILDER
// ========================================

export function buildSVG({
    width = 1080,
    height = 1080,
    layers,
    backgroundColor = '#0A0A1A'
}) {
    const allLayers = [
        ...(layers.background || []),
        ...(layers.decorative || []),
        ...(layers.content || []),
        ...(layers.overlays || []),
        ...(layers.effects || [])
    ];

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
        ${allLayers.join('\n')}
    </svg>`;
}

// ========================================
// PNG EXPORT
// ========================================

export async function exportToPNG(svg, width = 1080, height = 1080) {
    return await sharp(Buffer.from(svg))
        .png()
        .toBuffer();
}

// ========================================
// QUICK GENERATORS
// ========================================

export async function generateQuickAtmosphere({
    width = 1080,
    height = 1080,
    style = 'premium',
    primaryColor = '#3B82F6',
    secondaryColor = '#8B5CF6',
    backgroundColor = '#0A0A1A'
}) {
    const atmosphere = overlays.generateAtmosphereLayer({
        width, height, style, primaryColor, secondaryColor
    });

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
        ${atmosphere.svg}
    </svg>`;

    return await exportToPNG(svg, width, height);
}

export async function generateQuickBadge({
    type = 'discount',
    value = '50',
    size = 80,
    primaryColor = '#EF4444'
}) {
    let badgeSvg = '';

    switch (type) {
        case 'discount':
            badgeSvg = badges.generateDiscountBadge({ x: 10, y: 10, value, size, bgColor: primaryColor }).svg;
            break;
        case 'trust':
            badgeSvg = badges.generateTrustBadge({ x: 10, y: 10, type: 'verified', primaryColor }).svg;
            break;
        case 'feature':
            badgeSvg = badges.generateFeatureBadge({ x: 10, y: 10, text: 'NEW', bgColor: primaryColor }).svg;
            break;
    }

    const padding = 20;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size + padding}" height="${size + padding}" viewBox="0 0 ${size + padding} ${size + padding}">
        ${badgeSvg}
    </svg>`;

    return await exportToPNG(svg, size + padding, size + padding);
}

export async function generateQuickDataViz({
    type = 'progress',
    value = 75,
    width = 300,
    height = 100,
    primaryColor = '#3B82F6'
}) {
    let vizSvg = '';

    switch (type) {
        case 'progress':
            vizSvg = dataViz.generateProgressBar({ x: 10, y: height / 2 - 10, width: width - 20, progress: value, barColor: primaryColor }).svg;
            break;
        case 'circular':
            vizSvg = dataViz.generateCircularProgress({ cx: width / 2, cy: height / 2, radius: Math.min(width, height) / 3, progress: value, barColor: primaryColor }).svg;
            break;
        case 'rating':
            vizSvg = dataViz.generateStarRating({ x: 10, y: height / 2 - 12, rating: value / 20 }).svg;
            break;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="${width}" height="${height}" fill="#0A0A1A"/>
        ${vizSvg}
    </svg>`;

    return await exportToPNG(svg, width, height);
}

export default {
    Elements,
    ELEMENT_PRESETS,
    selectElementsForAd,
    composeElementLayers,
    buildSVG,
    exportToPNG,
    generateQuickAtmosphere,
    generateQuickBadge,
    generateQuickDataViz
};
