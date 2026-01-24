/**
 * FOREPLAY PATTERN LIBRARY
 * 
 * Pre-analyzed patterns from high-performing Foreplay ads:
 * - Color schemes by industry
 * - Typography combinations
 * - Layout compositions
 * - Visual effect presets
 * - CTA styles
 * - Badge placements
 */

// ========================================
// INDUSTRY COLOR PALETTES
// ========================================

export const INDUSTRY_PALETTES = {
    technology: {
        name: 'Technology',
        variants: [
            { bg: '#0A0F1C', accent: '#3B82F6', secondary: '#8B5CF6', text: '#FFFFFF' },
            { bg: '#0F172A', accent: '#06B6D4', secondary: '#22D3EE', text: '#FFFFFF' },
            { bg: '#09090B', accent: '#A855F7', secondary: '#D946EF', text: '#FFFFFF' },
            { bg: '#020617', accent: '#2563EB', secondary: '#3B82F6', text: '#FFFFFF' },
            { bg: '#0C0A09', accent: '#F97316', secondary: '#FB923C', text: '#FFFFFF' }
        ]
    },

    saas: {
        name: 'SaaS / Software',
        variants: [
            { bg: '#0F0F23', accent: '#6366F1', secondary: '#818CF8', text: '#FFFFFF' },
            { bg: '#0A1628', accent: '#14B8A6', secondary: '#2DD4BF', text: '#FFFFFF' },
            { bg: '#1A1A2E', accent: '#F472B6', secondary: '#EC4899', text: '#FFFFFF' },
            { bg: '#0D1117', accent: '#10B981', secondary: '#34D399', text: '#FFFFFF' }
        ]
    },

    ecommerce: {
        name: 'E-Commerce',
        variants: [
            { bg: '#FAFAFA', accent: '#000000', secondary: '#404040', text: '#000000' },
            { bg: '#0A0A0A', accent: '#EAB308', secondary: '#FDE047', text: '#FFFFFF' },
            { bg: '#18181B', accent: '#EF4444', secondary: '#F87171', text: '#FFFFFF' },
            { bg: '#1C1917', accent: '#F59E0B', secondary: '#FBBF24', text: '#FFFFFF' }
        ]
    },

    finance: {
        name: 'Finance / Fintech',
        variants: [
            { bg: '#0F172A', accent: '#10B981', secondary: '#34D399', text: '#FFFFFF' },
            { bg: '#0C4A6E', accent: '#38BDF8', secondary: '#7DD3FC', text: '#FFFFFF' },
            { bg: '#1E1B4B', accent: '#A78BFA', secondary: '#C4B5FD', text: '#FFFFFF' },
            { bg: '#052E16', accent: '#22C55E', secondary: '#4ADE80', text: '#FFFFFF' }
        ]
    },

    health: {
        name: 'Health / Wellness',
        variants: [
            { bg: '#ECFDF5', accent: '#059669', secondary: '#10B981', text: '#064E3B' },
            { bg: '#F0FDFA', accent: '#14B8A6', secondary: '#2DD4BF', text: '#134E4A' },
            { bg: '#FFF7ED', accent: '#EA580C', secondary: '#F97316', text: '#7C2D12' },
            { bg: '#FAFAF9', accent: '#78716C', secondary: '#A8A29E', text: '#1C1917' }
        ]
    },

    lifestyle: {
        name: 'Lifestyle / Fashion',
        variants: [
            { bg: '#FAF5FF', accent: '#A855F7', secondary: '#C084FC', text: '#3B0764' },
            { bg: '#FDF4FF', accent: '#D946EF', secondary: '#E879F9', text: '#4A044E' },
            { bg: '#0F0F0F', accent: '#FFFFFF', secondary: '#A1A1AA', text: '#FFFFFF' },
            { bg: '#1C1917', accent: '#D4A373', secondary: '#E9C46A', text: '#FEFCE8' }
        ]
    },

    gaming: {
        name: 'Gaming / Entertainment',
        variants: [
            { bg: '#0A0A0A', accent: '#EF4444', secondary: '#F87171', text: '#FFFFFF' },
            { bg: '#030712', accent: '#8B5CF6', secondary: '#A78BFA', text: '#FFFFFF' },
            { bg: '#0C0A09', accent: '#22D3EE', secondary: '#67E8F9', text: '#FFFFFF' },
            { bg: '#18181B', accent: '#FACC15', secondary: '#FDE047', text: '#FFFFFF' }
        ]
    },

    education: {
        name: 'Education',
        variants: [
            { bg: '#1E3A5F', accent: '#3B82F6', secondary: '#60A5FA', text: '#FFFFFF' },
            { bg: '#0C4A6E', accent: '#F59E0B', secondary: '#FBBF24', text: '#FFFFFF' },
            { bg: '#FFFBEB', accent: '#D97706', secondary: '#F59E0B', text: '#451A03' },
            { bg: '#F0F9FF', accent: '#0284C7', secondary: '#38BDF8', text: '#0C4A6E' }
        ]
    },

    luxury: {
        name: 'Luxury / Premium',
        variants: [
            { bg: '#0A0A0A', accent: '#D4AF37', secondary: '#FFD700', text: '#FFFFFF' },
            { bg: '#1A1A1A', accent: '#B8860B', secondary: '#DAA520', text: '#FFFFFF' },
            { bg: '#0F0F0F', accent: '#FFFFFF', secondary: '#C0C0C0', text: '#FFFFFF' },
            { bg: '#1C1917', accent: '#C9A962', secondary: '#E5C287', text: '#FFFFFF' }
        ]
    }
};

// ========================================
// TYPOGRAPHY COMBINATIONS
// ========================================

export const TYPOGRAPHY_PRESETS = {
    bold_impact: {
        name: 'Bold Impact',
        headline: { size: 64, weight: 900, letterSpacing: -2, lineHeight: 1.0 },
        tagline: { size: 22, weight: 400, letterSpacing: 0.5, lineHeight: 1.4 },
        cta: { size: 18, weight: 700, letterSpacing: 0.5 },
        mood: ['premium', 'intense', 'urgent']
    },

    elegant_minimal: {
        name: 'Elegant Minimal',
        headline: { size: 48, weight: 600, letterSpacing: -0.5, lineHeight: 1.15 },
        tagline: { size: 18, weight: 300, letterSpacing: 1, lineHeight: 1.5 },
        cta: { size: 16, weight: 500, letterSpacing: 1 },
        mood: ['luxury', 'calm', 'minimal']
    },

    modern_tech: {
        name: 'Modern Tech',
        headline: { size: 56, weight: 800, letterSpacing: -1.5, lineHeight: 1.1 },
        tagline: { size: 20, weight: 400, letterSpacing: 0, lineHeight: 1.4 },
        cta: { size: 18, weight: 600, letterSpacing: 0.3 },
        mood: ['dynamic', 'professional', 'tech']
    },

    playful_friendly: {
        name: 'Playful Friendly',
        headline: { size: 52, weight: 700, letterSpacing: -1, lineHeight: 1.15 },
        tagline: { size: 20, weight: 400, letterSpacing: 0.2, lineHeight: 1.45 },
        cta: { size: 18, weight: 600, letterSpacing: 0.2 },
        mood: ['playful', 'friendly', 'approachable']
    },

    headline_heavy: {
        name: 'Headline Heavy',
        headline: { size: 72, weight: 900, letterSpacing: -3, lineHeight: 0.95 },
        tagline: { size: 18, weight: 400, letterSpacing: 0.5, lineHeight: 1.5 },
        cta: { size: 20, weight: 700, letterSpacing: 0.5 },
        mood: ['intense', 'powerful', 'statement']
    },

    balanced_classic: {
        name: 'Balanced Classic',
        headline: { size: 52, weight: 700, letterSpacing: -1, lineHeight: 1.2 },
        tagline: { size: 20, weight: 400, letterSpacing: 0.3, lineHeight: 1.45 },
        cta: { size: 18, weight: 600, letterSpacing: 0.3 },
        mood: ['professional', 'trustworthy', 'balanced']
    }
};

// ========================================
// VISUAL EFFECT PATTERNS
// ========================================

export const EFFECT_PATTERNS = {
    premium_dark: {
        name: 'Premium Dark',
        background: 'radial_gradient',
        bokeh: { show: true, count: 5, opacity: 0.04 },
        particles: { show: true, count: 30, opacity: 0.15 },
        noise: { show: true, opacity: 0.02 },
        vignette: { show: true, intensity: 0.35 },
        screenGlow: { show: true, intensity: 0.1 },
        colorGrading: 'cinematic'
    },

    vibrant_energy: {
        name: 'Vibrant Energy',
        background: 'gradient_mesh',
        bokeh: { show: true, count: 8, opacity: 0.06 },
        particles: { show: true, count: 50, opacity: 0.2 },
        sparkles: { show: true, count: 12 },
        noise: { show: true, opacity: 0.015 },
        vignette: { show: true, intensity: 0.25 },
        colorGrading: 'neon'
    },

    clean_minimal: {
        name: 'Clean Minimal',
        background: 'solid_gradient',
        bokeh: { show: false },
        particles: { show: false },
        noise: { show: true, opacity: 0.01 },
        vignette: { show: true, intensity: 0.15 },
        screenGlow: { show: false }
    },

    luxury_glow: {
        name: 'Luxury Glow',
        background: 'radial_gradient',
        bokeh: { show: true, count: 3, opacity: 0.03 },
        particles: { show: true, count: 15, opacity: 0.1 },
        lightRays: { show: true, count: 4, opacity: 0.05 },
        noise: { show: true, opacity: 0.02 },
        vignette: { show: true, intensity: 0.4 },
        colorGrading: 'warm'
    },

    tech_futuristic: {
        name: 'Tech Futuristic',
        background: 'gradient_mesh',
        bokeh: { show: true, count: 6, opacity: 0.05 },
        particles: { show: true, count: 40, opacity: 0.2 },
        glassCards: { show: true },
        noise: { show: true, opacity: 0.025 },
        vignette: { show: true, intensity: 0.3 },
        screenGlow: { show: true, intensity: 0.15 },
        colorGrading: 'cool'
    },

    warm_inviting: {
        name: 'Warm Inviting',
        background: 'radial_gradient',
        bokeh: { show: true, count: 4, opacity: 0.04 },
        particles: { show: false },
        lensFlare: { show: true, intensity: 0.15 },
        noise: { show: true, opacity: 0.02 },
        vignette: { show: true, intensity: 0.3 },
        colorGrading: 'warm'
    }
};

// ========================================
// CTA STYLE PATTERNS
// ========================================

export const CTA_PATTERNS = {
    gradient_glow: {
        name: 'Gradient Glow',
        style: 'gradient_glow',
        hasGradient: true,
        hasGlow: true,
        glowIntensity: 0.5,
        borderRadius: 'full',
        size: 'large',
        mood: ['premium', 'dynamic', 'tech']
    },

    solid_bold: {
        name: 'Solid Bold',
        style: 'solid',
        hasGradient: false,
        hasGlow: false,
        borderRadius: 'medium',
        size: 'large',
        mood: ['professional', 'urgent', 'direct']
    },

    outline_elegant: {
        name: 'Outline Elegant',
        style: 'outline',
        hasGradient: false,
        hasGlow: false,
        borderRadius: 'full',
        size: 'medium',
        mood: ['minimal', 'luxury', 'sophisticated']
    },

    glass_modern: {
        name: 'Glass Modern',
        style: 'glass',
        hasGradient: false,
        hasGlow: true,
        glowIntensity: 0.2,
        borderRadius: 'large',
        size: 'medium',
        mood: ['tech', 'futuristic', 'modern']
    },

    soft_friendly: {
        name: 'Soft Friendly',
        style: 'gradient',
        hasGradient: true,
        hasGlow: false,
        borderRadius: 'full',
        size: 'medium',
        mood: ['playful', 'friendly', 'approachable']
    }
};

// ========================================
// BADGE PLACEMENT PATTERNS
// ========================================

export const BADGE_PATTERNS = {
    top_right_corner: {
        positions: [
            { x: 0.85, y: 0.04 },
            { x: 0.85, y: 0.09 }
        ],
        style: 'pill',
        opacity: 0.9
    },

    top_left_stack: {
        positions: [
            { x: 0.04, y: 0.04 },
            { x: 0.04, y: 0.09 },
            { x: 0.04, y: 0.14 }
        ],
        style: 'square',
        opacity: 0.85
    },

    near_cta: {
        positions: [
            { x: 0.7, y: 0.88 }
        ],
        style: 'pill',
        opacity: 0.95
    },

    scattered: {
        positions: [
            { x: 0.04, y: 0.04 },
            { x: 0.85, y: 0.2 },
            { x: 0.04, y: 0.7 }
        ],
        style: 'mixed',
        opacity: 0.8
    },

    corners: {
        positions: [
            { x: 0.04, y: 0.04 },
            { x: 0.85, y: 0.04 }
        ],
        style: 'flag',
        opacity: 0.9
    }
};

// ========================================
// LAYOUT COMPOSITION PATTERNS
// ========================================

export const COMPOSITION_PATTERNS = {
    centered_focus: {
        productPosition: { x: 0.5, y: 0.48 },
        productScale: 0.55,
        headlineY: 0.08,
        ctaY: 0.88,
        whitespace: 'balanced',
        grid: 'centered'
    },

    left_product: {
        productPosition: { x: 0.28, y: 0.5 },
        productScale: 0.48,
        headlinePosition: { x: 0.72, y: 0.25 },
        ctaPosition: { x: 0.72, y: 0.55 },
        whitespace: 'minimal',
        grid: 'asymmetric'
    },

    right_product: {
        productPosition: { x: 0.72, y: 0.5 },
        productScale: 0.48,
        headlinePosition: { x: 0.28, y: 0.25 },
        ctaPosition: { x: 0.28, y: 0.55 },
        whitespace: 'minimal',
        grid: 'asymmetric'
    },

    top_product: {
        productPosition: { x: 0.5, y: 0.28 },
        productScale: 0.5,
        headlineY: 0.6,
        ctaY: 0.88,
        whitespace: 'generous',
        grid: 'rule_of_thirds'
    },

    floating_elements: {
        productPosition: { x: 0.55, y: 0.5 },
        productScale: 0.6,
        headlineY: 0.08,
        ctaY: 0.9,
        floatingCards: true,
        whitespace: 'minimal',
        grid: 'dynamic'
    }
};

// ========================================
// PATTERN SELECTION
// ========================================

/**
 * Select best color palette for industry and mood
 */
export function selectColorPalette(industry, mood = 'premium') {
    const normalizedIndustry = industry?.toLowerCase() || 'technology';

    // Find matching industry
    let palette = INDUSTRY_PALETTES.technology;
    for (const [key, value] of Object.entries(INDUSTRY_PALETTES)) {
        if (normalizedIndustry.includes(key) || key.includes(normalizedIndustry)) {
            palette = value;
            break;
        }
    }

    // Select variant based on mood
    const variants = palette.variants;
    if (mood === 'dark' || mood === 'premium') {
        return variants[0];
    } else if (mood === 'vibrant' || mood === 'dynamic') {
        return variants[Math.min(1, variants.length - 1)];
    }

    return variants[Math.floor(Math.random() * variants.length)];
}

/**
 * Select typography preset based on mood
 */
export function selectTypographyPreset(mood = 'professional', productType = '') {
    const moods = {
        premium: 'bold_impact',
        luxury: 'elegant_minimal',
        tech: 'modern_tech',
        playful: 'playful_friendly',
        intense: 'headline_heavy',
        professional: 'balanced_classic',
        minimal: 'elegant_minimal'
    };

    return TYPOGRAPHY_PRESETS[moods[mood]] || TYPOGRAPHY_PRESETS.balanced_classic;
}

/**
 * Select effect pattern based on mood
 */
export function selectEffectPattern(mood = 'premium', energy = 'dynamic') {
    if (mood === 'premium' && energy !== 'intense') {
        return EFFECT_PATTERNS.premium_dark;
    }
    if (energy === 'intense' || mood === 'vibrant') {
        return EFFECT_PATTERNS.vibrant_energy;
    }
    if (mood === 'minimal') {
        return EFFECT_PATTERNS.clean_minimal;
    }
    if (mood === 'luxury') {
        return EFFECT_PATTERNS.luxury_glow;
    }
    if (mood === 'tech' || mood === 'futuristic') {
        return EFFECT_PATTERNS.tech_futuristic;
    }
    if (mood === 'friendly' || mood === 'warm') {
        return EFFECT_PATTERNS.warm_inviting;
    }

    return EFFECT_PATTERNS.premium_dark;
}

/**
 * Select CTA pattern based on mood
 */
export function selectCTAPattern(mood = 'premium') {
    for (const [key, pattern] of Object.entries(CTA_PATTERNS)) {
        if (pattern.mood.includes(mood)) {
            return pattern;
        }
    }
    return CTA_PATTERNS.gradient_glow;
}

/**
 * Build complete pattern set from analysis
 */
export function buildPatternSet(designSpecs, productAnalysis, contentPackage) {
    const mood = designSpecs?.mood?.primary || 'premium';
    const energy = designSpecs?.mood?.energy || 'dynamic';
    const industry = productAnalysis?.industry || productAnalysis?.productType || 'technology';

    return {
        colors: selectColorPalette(industry, mood),
        typography: selectTypographyPreset(mood, productAnalysis?.productType),
        effects: selectEffectPattern(mood, energy),
        cta: selectCTAPattern(mood),
        badges: mood === 'minimal' ? BADGE_PATTERNS.top_right_corner : BADGE_PATTERNS.scattered,
        composition: selectCompositionPattern(designSpecs?.layout?.type)
    };
}

/**
 * Select composition pattern
 */
function selectCompositionPattern(layoutType) {
    const map = {
        hero_centered: COMPOSITION_PATTERNS.centered_focus,
        hero_left: COMPOSITION_PATTERNS.left_product,
        hero_right: COMPOSITION_PATTERNS.right_product,
        hero_top: COMPOSITION_PATTERNS.top_product,
        floating_ui: COMPOSITION_PATTERNS.floating_elements
    };

    return map[layoutType] || COMPOSITION_PATTERNS.centered_focus;
}

export default {
    INDUSTRY_PALETTES,
    TYPOGRAPHY_PRESETS,
    EFFECT_PATTERNS,
    CTA_PATTERNS,
    BADGE_PATTERNS,
    COMPOSITION_PATTERNS,
    selectColorPalette,
    selectTypographyPreset,
    selectEffectPattern,
    selectCTAPattern,
    buildPatternSet
};
