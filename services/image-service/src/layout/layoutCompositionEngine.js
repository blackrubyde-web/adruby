/**
 * LAYOUT COMPOSITION ENGINE
 * 
 * Intelligent layout system that:
 * - Analyzes Foreplay patterns for optimal layouts
 * - Calculates element positions dynamically
 * - Handles responsive scaling
 * - Manages visual hierarchy
 * - Applies golden ratio and rule of thirds
 * - Creates multi-layer compositions
 */

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;

// Layout presets derived from Foreplay analysis
export const LAYOUT_PRESETS = {
    // Hero layouts
    hero_centered: {
        name: 'Hero Centered',
        description: 'Product center, headline top, CTA bottom',
        zones: {
            headline: { x: 0.5, y: 0.08, w: 0.9, anchor: 'center' },
            tagline: { x: 0.5, y: 0.16, w: 0.75, anchor: 'center' },
            product: { x: 0.5, y: 0.48, scale: 0.55, anchor: 'center' },
            cta: { x: 0.5, y: 0.88, w: 0.26, anchor: 'center' },
            features: { layout: 'bottom_row', y: 0.72 },
            badges: { layout: 'top_right' },
            socialProof: { y: 0.82 }
        },
        grid: 'centered',
        whitespace: 'balanced'
    },

    hero_left: {
        name: 'Hero Left',
        description: 'Product left, text right',
        zones: {
            headline: { x: 0.72, y: 0.25, w: 0.45, anchor: 'center' },
            tagline: { x: 0.72, y: 0.38, w: 0.4, anchor: 'center' },
            product: { x: 0.28, y: 0.5, scale: 0.5, anchor: 'center' },
            cta: { x: 0.72, y: 0.55, w: 0.28, anchor: 'center' },
            features: { layout: 'right_column', x: 0.72 },
            badges: { layout: 'top_left' }
        },
        grid: 'asymmetric',
        whitespace: 'minimal'
    },

    hero_right: {
        name: 'Hero Right',
        description: 'Product right, text left',
        zones: {
            headline: { x: 0.28, y: 0.25, w: 0.45, anchor: 'center' },
            tagline: { x: 0.28, y: 0.38, w: 0.4, anchor: 'center' },
            product: { x: 0.72, y: 0.5, scale: 0.5, anchor: 'center' },
            cta: { x: 0.28, y: 0.55, w: 0.28, anchor: 'center' },
            features: { layout: 'left_column', x: 0.28 },
            badges: { layout: 'top_right' }
        },
        grid: 'asymmetric',
        whitespace: 'minimal'
    },

    hero_top: {
        name: 'Hero Top',
        description: 'Product top, content bottom',
        zones: {
            headline: { x: 0.5, y: 0.6, w: 0.85, anchor: 'center' },
            tagline: { x: 0.5, y: 0.68, w: 0.7, anchor: 'center' },
            product: { x: 0.5, y: 0.28, scale: 0.5, anchor: 'center' },
            cta: { x: 0.5, y: 0.88, w: 0.26, anchor: 'center' },
            features: { layout: 'bottom_row', y: 0.78 },
            badges: { layout: 'top_corners' }
        },
        grid: 'rule_of_thirds',
        whitespace: 'generous'
    },

    split_screen: {
        name: 'Split Screen',
        description: '50/50 split with product one side',
        zones: {
            headline: { x: 0.25, y: 0.3, w: 0.4, anchor: 'center' },
            tagline: { x: 0.25, y: 0.42, w: 0.38, anchor: 'center' },
            product: { x: 0.72, y: 0.5, scale: 0.48, anchor: 'center' },
            cta: { x: 0.25, y: 0.6, w: 0.3, anchor: 'center' },
            features: { layout: 'left_stacked', x: 0.25 },
            divider: { x: 0.5, style: 'gradient' }
        },
        grid: 'split',
        whitespace: 'minimal'
    },

    floating_ui: {
        name: 'Floating UI',
        description: 'Multiple floating elements for SaaS/Tech',
        zones: {
            headline: { x: 0.5, y: 0.08, w: 0.85, anchor: 'center' },
            tagline: { x: 0.5, y: 0.16, w: 0.7, anchor: 'center' },
            product: { x: 0.55, y: 0.5, scale: 0.6, anchor: 'center' },
            cta: { x: 0.5, y: 0.9, w: 0.26, anchor: 'center' },
            floatingCards: [
                { x: 0.12, y: 0.4, w: 0.2 },
                { x: 0.12, y: 0.55, w: 0.18 },
                { x: 0.85, y: 0.35, w: 0.22 }
            ],
            badges: { layout: 'scattered' }
        },
        grid: 'dynamic',
        whitespace: 'minimal'
    },

    feature_grid: {
        name: 'Feature Grid',
        description: 'Product with feature callouts',
        zones: {
            headline: { x: 0.5, y: 0.06, w: 0.9, anchor: 'center' },
            tagline: { x: 0.5, y: 0.13, w: 0.75, anchor: 'center' },
            product: { x: 0.5, y: 0.48, scale: 0.45, anchor: 'center' },
            cta: { x: 0.5, y: 0.9, w: 0.26, anchor: 'center' },
            features: {
                layout: 'around_product',
                positions: [
                    { x: 0.15, y: 0.35 },
                    { x: 0.85, y: 0.35 },
                    { x: 0.15, y: 0.6 },
                    { x: 0.85, y: 0.6 }
                ]
            }
        },
        grid: 'feature_focused',
        whitespace: 'balanced'
    },

    minimal: {
        name: 'Minimal',
        description: 'Clean, focused design',
        zones: {
            headline: { x: 0.5, y: 0.12, w: 0.8, anchor: 'center' },
            product: { x: 0.5, y: 0.5, scale: 0.6, anchor: 'center' },
            cta: { x: 0.5, y: 0.88, w: 0.24, anchor: 'center' }
        },
        grid: 'centered',
        whitespace: 'generous'
    },

    story: {
        name: 'Story Format',
        description: 'Optimized for 9:16 story placement',
        zones: {
            headline: { x: 0.5, y: 0.15, w: 0.85, anchor: 'center' },
            tagline: { x: 0.5, y: 0.22, w: 0.75, anchor: 'center' },
            product: { x: 0.5, y: 0.55, scale: 0.7, anchor: 'center' },
            cta: { x: 0.5, y: 0.88, w: 0.7, anchor: 'center' }
        },
        grid: 'vertical_flow',
        whitespace: 'minimal'
    }
};

// ========================================
// LAYOUT SELECTION
// ========================================

/**
 * Select optimal layout based on analysis
 */
export function selectOptimalLayout({
    productAnalysis,
    designSpecs,
    contentPackage,
    referenceAds = []
}) {
    // If design specs have layout recommendation
    if (designSpecs?.layout?.type && LAYOUT_PRESETS[designSpecs.layout.type]) {
        return LAYOUT_PRESETS[designSpecs.layout.type];
    }

    // If content package has suggestion
    if (contentPackage?.layoutSuggestion?.type && LAYOUT_PRESETS[contentPackage.layoutSuggestion.type]) {
        return LAYOUT_PRESETS[contentPackage.layoutSuggestion.type];
    }

    // Analyze product type for best layout
    const productType = productAnalysis?.productType?.toLowerCase() || '';

    if (productType.includes('saas') || productType.includes('dashboard') || productType.includes('app')) {
        return LAYOUT_PRESETS.floating_ui;
    }

    if (productType.includes('mobile') || productType.includes('phone')) {
        return LAYOUT_PRESETS.hero_centered;
    }

    // Check content density
    const featureCount = contentPackage?.features?.length || 0;
    if (featureCount >= 4) {
        return LAYOUT_PRESETS.feature_grid;
    }

    // Default to hero centered
    return LAYOUT_PRESETS.hero_centered;
}

// ========================================
// POSITION CALCULATION
// ========================================

/**
 * Calculate absolute positions from layout zones
 */
export function calculatePositions(layout, customizations = {}) {
    const positions = {};
    const zones = layout.zones || {};

    // Headline position
    if (zones.headline) {
        positions.headline = {
            x: Math.round(CANVAS_WIDTH * (customizations.headlineX || zones.headline.x)),
            y: Math.round(CANVAS_HEIGHT * (customizations.headlineY || zones.headline.y)),
            maxWidth: Math.round(CANVAS_WIDTH * (zones.headline.w || 0.9)),
            anchor: zones.headline.anchor || 'center'
        };
    }

    // Tagline position
    if (zones.tagline) {
        positions.tagline = {
            x: Math.round(CANVAS_WIDTH * (zones.tagline.x || 0.5)),
            y: Math.round(CANVAS_HEIGHT * (zones.tagline.y || 0.2)),
            maxWidth: Math.round(CANVAS_WIDTH * (zones.tagline.w || 0.75)),
            anchor: zones.tagline.anchor || 'center'
        };
    }

    // Product position
    if (zones.product) {
        positions.product = {
            x: Math.round(CANVAS_WIDTH * (customizations.productX || zones.product.x)),
            y: Math.round(CANVAS_HEIGHT * (customizations.productY || zones.product.y)),
            scale: customizations.productScale || zones.product.scale || 0.55,
            anchor: zones.product.anchor || 'center'
        };
    }

    // CTA position
    if (zones.cta) {
        positions.cta = {
            x: Math.round(CANVAS_WIDTH * (zones.cta.x || 0.5)),
            y: Math.round(CANVAS_HEIGHT * (customizations.ctaY || zones.cta.y || 0.88)),
            width: Math.round(CANVAS_WIDTH * (zones.cta.w || 0.26)),
            anchor: zones.cta.anchor || 'center'
        };
    }

    // Features positions
    if (zones.features) {
        positions.features = calculateFeaturePositions(zones.features);
    }

    // Floating cards for floating_ui layout
    if (zones.floatingCards) {
        positions.floatingCards = zones.floatingCards.map(card => ({
            x: Math.round(CANVAS_WIDTH * card.x),
            y: Math.round(CANVAS_HEIGHT * card.y),
            width: Math.round(CANVAS_WIDTH * (card.w || 0.2))
        }));
    }

    // Badges
    if (zones.badges) {
        positions.badges = calculateBadgePositions(zones.badges.layout);
    }

    // Social proof
    if (zones.socialProof) {
        positions.socialProof = {
            x: CANVAS_WIDTH / 2,
            y: Math.round(CANVAS_HEIGHT * (zones.socialProof.y || 0.82))
        };
    }

    return positions;
}

/**
 * Calculate feature callout positions
 */
function calculateFeaturePositions(featureZone) {
    const layout = featureZone.layout || 'bottom_row';
    const positions = [];

    switch (layout) {
        case 'bottom_row':
            // 4 features in bottom row
            for (let i = 0; i < 4; i++) {
                positions.push({
                    x: Math.round(CANVAS_WIDTH * (0.12 + i * 0.25)),
                    y: Math.round(CANVAS_HEIGHT * (featureZone.y || 0.72)),
                    width: Math.round(CANVAS_WIDTH * 0.22)
                });
            }
            break;

        case 'left_column':
        case 'left_stacked':
            for (let i = 0; i < 3; i++) {
                positions.push({
                    x: Math.round(CANVAS_WIDTH * (featureZone.x || 0.25)) - 100,
                    y: Math.round(CANVAS_HEIGHT * (0.65 + i * 0.08)),
                    width: Math.round(CANVAS_WIDTH * 0.2)
                });
            }
            break;

        case 'right_column':
            for (let i = 0; i < 3; i++) {
                positions.push({
                    x: Math.round(CANVAS_WIDTH * (featureZone.x || 0.72)) - 50,
                    y: Math.round(CANVAS_HEIGHT * (0.65 + i * 0.08)),
                    width: Math.round(CANVAS_WIDTH * 0.2)
                });
            }
            break;

        case 'around_product':
            if (featureZone.positions) {
                featureZone.positions.forEach(pos => {
                    positions.push({
                        x: Math.round(CANVAS_WIDTH * pos.x),
                        y: Math.round(CANVAS_HEIGHT * pos.y),
                        width: Math.round(CANVAS_WIDTH * 0.18)
                    });
                });
            }
            break;

        case 'scattered':
            // Random-ish positions avoiding center
            const scatterPositions = [
                { x: 0.1, y: 0.3 },
                { x: 0.9, y: 0.25 },
                { x: 0.08, y: 0.65 },
                { x: 0.92, y: 0.7 }
            ];
            scatterPositions.forEach(pos => {
                positions.push({
                    x: Math.round(CANVAS_WIDTH * pos.x),
                    y: Math.round(CANVAS_HEIGHT * pos.y),
                    width: Math.round(CANVAS_WIDTH * 0.15)
                });
            });
            break;
    }

    return positions;
}

/**
 * Calculate badge positions
 */
function calculateBadgePositions(layout) {
    const positions = [];
    const margin = 40;
    const badgeWidth = 130;
    const badgeHeight = 36;

    switch (layout) {
        case 'top_left':
            positions.push({ x: margin, y: margin });
            positions.push({ x: margin, y: margin + badgeHeight + 10 });
            break;

        case 'top_right':
            positions.push({ x: CANVAS_WIDTH - badgeWidth - margin, y: margin });
            positions.push({ x: CANVAS_WIDTH - badgeWidth - margin, y: margin + badgeHeight + 10 });
            break;

        case 'top_corners':
            positions.push({ x: margin, y: margin });
            positions.push({ x: CANVAS_WIDTH - badgeWidth - margin, y: margin });
            break;

        case 'scattered':
            positions.push({ x: margin, y: margin });
            positions.push({ x: CANVAS_WIDTH - badgeWidth - margin, y: CANVAS_HEIGHT * 0.25 });
            positions.push({ x: margin, y: CANVAS_HEIGHT * 0.7 });
            break;

        default:
            positions.push({ x: CANVAS_WIDTH - badgeWidth - margin, y: margin });
    }

    return positions;
}

// ========================================
// GOLDEN RATIO & RULE OF THIRDS
// ========================================

const GOLDEN_RATIO = 1.618;

/**
 * Calculate golden ratio divisions
 */
export function goldenRatioDivisions() {
    return {
        major: CANVAS_WIDTH / GOLDEN_RATIO,
        minor: CANVAS_WIDTH - (CANVAS_WIDTH / GOLDEN_RATIO),
        sections: [
            CANVAS_WIDTH / GOLDEN_RATIO / GOLDEN_RATIO,
            CANVAS_WIDTH / GOLDEN_RATIO,
            CANVAS_WIDTH - (CANVAS_WIDTH / GOLDEN_RATIO / GOLDEN_RATIO)
        ]
    };
}

/**
 * Calculate rule of thirds grid
 */
export function ruleOfThirds() {
    return {
        verticalLines: [CANVAS_WIDTH / 3, CANVAS_WIDTH * 2 / 3],
        horizontalLines: [CANVAS_HEIGHT / 3, CANVAS_HEIGHT * 2 / 3],
        intersections: [
            { x: CANVAS_WIDTH / 3, y: CANVAS_HEIGHT / 3 },
            { x: CANVAS_WIDTH * 2 / 3, y: CANVAS_HEIGHT / 3 },
            { x: CANVAS_WIDTH / 3, y: CANVAS_HEIGHT * 2 / 3 },
            { x: CANVAS_WIDTH * 2 / 3, y: CANVAS_HEIGHT * 2 / 3 }
        ]
    };
}

// ========================================
// VISUAL HIERARCHY
// ========================================

/**
 * Calculate visual weights for element sizing
 */
export function calculateVisualHierarchy(contentPackage) {
    const hierarchy = {
        headline: { weight: 1.0, order: 1 },
        product: { weight: 0.9, order: 2 },
        tagline: { weight: 0.5, order: 3 },
        cta: { weight: 0.7, order: 4 },
        features: { weight: 0.4, order: 5 },
        badges: { weight: 0.3, order: 6 }
    };

    // Adjust based on content
    if (contentPackage?.layoutSuggestion?.emphasis === 'cta') {
        hierarchy.cta.weight = 0.85;
        hierarchy.cta.order = 2;
    }

    if (contentPackage?.layoutSuggestion?.emphasis === 'product') {
        hierarchy.product.weight = 1.0;
        hierarchy.product.order = 1;
        hierarchy.headline.order = 2;
    }

    return hierarchy;
}

// ========================================
// SPACING SYSTEM
// ========================================

const SPACING_SCALE = {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 40,
    xl: 64,
    xxl: 96
};

/**
 * Get spacing value
 */
export function spacing(size) {
    return SPACING_SCALE[size] || SPACING_SCALE.md;
}

/**
 * Calculate margins based on whitespace preference
 */
export function calculateMargins(whitespacePreference = 'balanced') {
    switch (whitespacePreference) {
        case 'minimal':
            return {
                top: 40,
                bottom: 60,
                left: 40,
                right: 40
            };
        case 'generous':
            return {
                top: 100,
                bottom: 120,
                left: 80,
                right: 80
            };
        default: // balanced
            return {
                top: 70,
                bottom: 90,
                left: 60,
                right: 60
            };
    }
}

// ========================================
// COMPOSITION VALIDATION
// ========================================

/**
 * Validate composition and suggest fixes for overlaps
 */
export function validateComposition(positions) {
    const issues = [];
    const elements = Object.entries(positions).filter(([key]) =>
        ['headline', 'tagline', 'product', 'cta'].includes(key)
    );

    // Check for overlaps
    for (let i = 0; i < elements.length; i++) {
        for (let j = i + 1; j < elements.length; j++) {
            const [nameA, posA] = elements[i];
            const [nameB, posB] = elements[j];

            if (posA.y && posB.y && Math.abs(posA.y - posB.y) < 50) {
                issues.push({
                    type: 'overlap',
                    elements: [nameA, nameB],
                    suggestion: `Increase vertical spacing between ${nameA} and ${nameB}`
                });
            }
        }
    }

    // Check for edge proximity
    if (positions.product?.x < 100 || positions.product?.x > CANVAS_WIDTH - 100) {
        issues.push({
            type: 'edge_proximity',
            element: 'product',
            suggestion: 'Product is too close to edge'
        });
    }

    return {
        valid: issues.length === 0,
        issues
    };
}

/**
 * Auto-fix composition issues
 */
export function autoFixComposition(positions, issues) {
    const fixed = JSON.parse(JSON.stringify(positions));

    issues.forEach(issue => {
        if (issue.type === 'overlap') {
            // Push elements apart
            const [elemA, elemB] = issue.elements;
            if (fixed[elemA] && fixed[elemB]) {
                if (fixed[elemA].y < fixed[elemB].y) {
                    fixed[elemA].y -= 30;
                    fixed[elemB].y += 30;
                } else {
                    fixed[elemA].y += 30;
                    fixed[elemB].y -= 30;
                }
            }
        }

        if (issue.type === 'edge_proximity') {
            const elem = issue.element;
            if (fixed[elem]) {
                fixed[elem].x = Math.max(150, Math.min(CANVAS_WIDTH - 150, fixed[elem].x));
            }
        }
    });

    return fixed;
}

// ========================================
// LAYER ORDERING
// ========================================

/**
 * Define z-index order for compositing
 */
export function getLayerOrder() {
    return [
        'background',
        'gradient_mesh',
        'particles',
        'bokeh',
        'light_rays',
        'decorative_shapes',
        'product_shadow',
        'product',
        'glass_cards',
        'feature_callouts',
        'typography',
        'badges',
        'noise_texture',
        'vignette',
        'color_grading'
    ];
}

/**
 * Create layer manifest for compositing
 */
export function createLayerManifest(designSpecs, contentPackage) {
    return {
        background: true,
        gradient_mesh: designSpecs?.mood?.primary === 'premium',
        particles: designSpecs?.effects?.backgroundEffects?.hasParticles,
        bokeh: designSpecs?.effects?.backgroundEffects?.hasBokeh,
        light_rays: designSpecs?.effects?.backgroundEffects?.hasLightRays,
        decorative_shapes: contentPackage?.features?.length > 0,
        product_shadow: designSpecs?.effects?.productShadow?.show !== false,
        product: true,
        glass_cards: designSpecs?.layout?.type === 'floating_ui',
        feature_callouts: (contentPackage?.features?.length || 0) > 0,
        typography: true,
        badges: (contentPackage?.trustIndicators?.badges?.length || 0) > 0,
        noise_texture: designSpecs?.effects?.backgroundEffects?.hasNoiseTexture !== false,
        vignette: designSpecs?.colors?.hasVignette !== false,
        color_grading: designSpecs?.mood?.primary === 'cinematic'
    };
}

export default {
    LAYOUT_PRESETS,
    selectOptimalLayout,
    calculatePositions,
    goldenRatioDivisions,
    ruleOfThirds,
    calculateVisualHierarchy,
    spacing,
    calculateMargins,
    validateComposition,
    autoFixComposition,
    getLayerOrder,
    createLayerManifest
};
