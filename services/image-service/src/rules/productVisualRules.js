/**
 * PRODUCT CATEGORY VISUAL RULES
 * 
 * Detailed visual rules for every product category:
 * - Mockup specifications
 * - Shadow and lighting rules
 * - Composition guidelines
 * - Effect recommendations
 * - Typography constraints
 * - Color adjustments
 */

// ========================================
// PRODUCT CATEGORY RULES
// ========================================

export const PRODUCT_VISUAL_RULES = {
    // ──────────────────────────────────────────────────────────────
    // SOFTWARE / SAAS / APPS
    // ──────────────────────────────────────────────────────────────
    saas_dashboard: {
        category: 'Software',
        productType: 'SaaS Dashboard',
        mockup: {
            devices: ['macbook_pro', 'browser', 'floating_ui'],
            preferredDevice: 'browser',
            deviceRotation: 0,
            perspective: false,
            scale: { min: 0.5, max: 0.65, optimal: 0.58 },
            position: { x: 0.5, y: 0.48 }
        },
        shadow: {
            type: 'layered',
            intensity: 0.5,
            blur: 40,
            spread: 0,
            color: '#000000',
            elevation: 30
        },
        screenGlow: {
            enabled: true,
            intensity: 0.12,
            spread: 20,
            color: 'auto' // Uses accent color
        },
        reflection: {
            enabled: false
        },
        effects: {
            bokeh: { enabled: true, count: 4, opacity: 0.04 },
            particles: { enabled: true, count: 25, opacity: 0.2 },
            gradientMesh: { enabled: true, complexity: 4 },
            noise: { enabled: true, opacity: 0.02 }
        },
        composition: {
            productFocus: 0.6,
            textAreaTop: 0.18,
            textAreaBottom: 0.12,
            featureCallouts: { enabled: true, positions: ['left', 'right'] },
            glassCards: { enabled: true, count: 2 }
        },
        typography: {
            headlineSize: { min: 52, max: 64, optimal: 58 },
            maxHeadlineWords: 5,
            taglineOptional: true,
            ctaProminent: true
        },
        colors: {
            preferDark: true,
            contrastMinimum: 4.5,
            accentUsage: 'moderate',
            gradientAllowed: true
        }
    },

    mobile_app: {
        category: 'Software',
        productType: 'Mobile App',
        mockup: {
            devices: ['iphone_15', 'phone', 'phone_minimal'],
            preferredDevice: 'iphone_15',
            deviceRotation: 0,
            perspective: false,
            scale: { min: 0.35, max: 0.5, optimal: 0.42 },
            position: { x: 0.5, y: 0.48 }
        },
        shadow: {
            type: 'layered',
            intensity: 0.6,
            blur: 35,
            elevation: 25
        },
        screenGlow: {
            enabled: true,
            intensity: 0.1,
            spread: 15
        },
        effects: {
            bokeh: { enabled: true, count: 5, opacity: 0.05 },
            particles: { enabled: true, count: 20, opacity: 0.15 },
            gradientMesh: { enabled: false },
            sparkles: { enabled: true, count: 6 }
        },
        composition: {
            productFocus: 0.5,
            textAreaTop: 0.22,
            textAreaBottom: 0.15,
            featureCallouts: { enabled: true, positions: ['bottom'] },
            socialProof: { enabled: true, position: 'above_cta' }
        },
        typography: {
            headlineSize: { min: 48, max: 60, optimal: 54 },
            maxHeadlineWords: 6,
            taglineOptional: true
        }
    },

    ai_tool: {
        category: 'Software',
        productType: 'AI Tool',
        mockup: {
            devices: ['browser', 'floating_ui', 'abstract'],
            preferredDevice: 'floating_ui',
            scale: { min: 0.5, max: 0.65, optimal: 0.6 },
            position: { x: 0.52, y: 0.5 }
        },
        shadow: {
            type: 'ambient',
            intensity: 0.4,
            blur: 50
        },
        screenGlow: {
            enabled: true,
            intensity: 0.15,
            spread: 25,
            pulsate: true
        },
        effects: {
            bokeh: { enabled: true, count: 6, opacity: 0.06 },
            particles: { enabled: true, count: 40, opacity: 0.25, distribution: 'radial' },
            gradientMesh: { enabled: true, complexity: 5 },
            lightRays: { enabled: true, count: 4, opacity: 0.05 },
            sparkles: { enabled: true, count: 10 }
        },
        composition: {
            productFocus: 0.55,
            dynamicLayout: true,
            glassCards: { enabled: true, count: 3 }
        },
        typography: {
            headlineSize: { min: 54, max: 68, optimal: 62 },
            allowGradientText: true,
            futuristicStyle: true
        },
        colors: {
            preferDark: true,
            neonAccents: true,
            gradientAllowed: true
        }
    },

    // ──────────────────────────────────────────────────────────────
    // E-COMMERCE PRODUCTS
    // ──────────────────────────────────────────────────────────────
    physical_product: {
        category: 'E-Commerce',
        productType: 'Physical Product',
        mockup: {
            devices: ['product_hero', 'lifestyle', 'floating_card'],
            preferredDevice: 'floating_card',
            scale: { min: 0.45, max: 0.6, optimal: 0.52 },
            position: { x: 0.5, y: 0.48 }
        },
        shadow: {
            type: 'contact',
            intensity: 0.5,
            blur: 20
        },
        reflection: {
            enabled: true,
            opacity: 0.15,
            fadeHeight: 0.3
        },
        effects: {
            bokeh: { enabled: true, count: 3, opacity: 0.03 },
            particles: { enabled: false },
            gradientMesh: { enabled: false },
            vignette: { enabled: true, intensity: 0.35 }
        },
        composition: {
            productFocus: 0.7,
            textAreaTop: 0.15,
            badges: { enabled: true, position: 'top_right' },
            pricing: { enabled: true, position: 'near_cta' }
        },
        typography: {
            headlineSize: { min: 48, max: 62, optimal: 56 }
        }
    },

    fashion_apparel: {
        category: 'E-Commerce',
        productType: 'Fashion',
        mockup: {
            devices: ['lifestyle', 'model', 'flat_lay'],
            preferredDevice: 'lifestyle',
            scale: { min: 0.5, max: 0.7, optimal: 0.6 }
        },
        shadow: {
            type: 'soft',
            intensity: 0.3
        },
        effects: {
            bokeh: { enabled: false },
            particles: { enabled: false },
            vignette: { enabled: true, intensity: 0.25 },
            colorGrading: { enabled: true, preset: 'fashion' }
        },
        composition: {
            productFocus: 0.75,
            minimalText: true,
            whitespaceGenerous: true
        },
        typography: {
            headlineSize: { min: 42, max: 54, optimal: 48 },
            elegantStyle: true,
            letterSpacingWide: true
        },
        colors: {
            adaptToProduct: true,
            neutralBackground: true
        }
    },

    beauty_cosmetics: {
        category: 'E-Commerce',
        productType: 'Beauty',
        mockup: {
            devices: ['product_hero', 'texture', 'ingredients'],
            preferredDevice: 'product_hero',
            scale: { min: 0.4, max: 0.55, optimal: 0.48 }
        },
        shadow: {
            type: 'soft',
            intensity: 0.35
        },
        reflection: {
            enabled: true,
            opacity: 0.2,
            glossy: true
        },
        effects: {
            bokeh: { enabled: true, count: 3, opacity: 0.03, soft: true },
            particles: { enabled: true, count: 15, opacity: 0.1, type: 'shimmer' },
            lightRays: { enabled: false },
            lensFlare: { enabled: true, intensity: 0.1 }
        },
        composition: {
            productFocus: 0.6,
            elegantLayout: true,
            ingredientCallouts: { enabled: true }
        },
        typography: {
            headlineSize: { min: 46, max: 58, optimal: 52 },
            elegantStyle: true,
            scriptAccents: false
        },
        colors: {
            softPalette: true,
            pinkGoldAccents: true
        }
    },

    electronics: {
        category: 'E-Commerce',
        productType: 'Electronics',
        mockup: {
            devices: ['product_hero', '3d_floating', 'angle_view'],
            preferredDevice: 'product_hero',
            scale: { min: 0.5, max: 0.65, optimal: 0.58 }
        },
        shadow: {
            type: 'layered',
            intensity: 0.55,
            blur: 35
        },
        reflection: {
            enabled: true,
            opacity: 0.2
        },
        effects: {
            bokeh: { enabled: true, count: 4, opacity: 0.04 },
            particles: { enabled: true, count: 20, opacity: 0.15 },
            gradientMesh: { enabled: true, complexity: 3 }
        },
        composition: {
            productFocus: 0.65,
            specCallouts: { enabled: true, count: 3 },
            techStyle: true
        },
        typography: {
            headlineSize: { min: 52, max: 64, optimal: 58 },
            boldStyle: true
        },
        colors: {
            preferDark: true,
            techBlues: true,
            accentGlow: true
        }
    },

    food_beverage: {
        category: 'E-Commerce',
        productType: 'Food & Beverage',
        mockup: {
            devices: ['product_focus', 'lifestyle', 'ingredients'],
            preferredDevice: 'product_focus',
            scale: { min: 0.45, max: 0.6, optimal: 0.52 }
        },
        shadow: {
            type: 'contact',
            intensity: 0.4
        },
        effects: {
            bokeh: { enabled: false },
            particles: { enabled: false },
            warmLighting: { enabled: true },
            vignette: { enabled: true, intensity: 0.3 }
        },
        composition: {
            productFocus: 0.65,
            appetizingLayout: true,
            ingredientVisuals: { enabled: true }
        },
        typography: {
            headlineSize: { min: 50, max: 62, optimal: 56 },
            friendlyStyle: true
        },
        colors: {
            warmPalette: true,
            appetizingColors: true,
            avoidBlue: true
        }
    },

    // ──────────────────────────────────────────────────────────────
    // FINANCE & BUSINESS
    // ──────────────────────────────────────────────────────────────
    fintech: {
        category: 'Finance',
        productType: 'Fintech App',
        mockup: {
            devices: ['phone', 'browser'],
            preferredDevice: 'phone',
            scale: { min: 0.38, max: 0.48, optimal: 0.43 }
        },
        shadow: {
            type: 'layered',
            intensity: 0.45
        },
        screenGlow: {
            enabled: true,
            intensity: 0.08,
            color: '#10B981'
        },
        effects: {
            bokeh: { enabled: true, count: 3, opacity: 0.03 },
            particles: { enabled: false },
            gradientMesh: { enabled: false },
            vignette: { enabled: true, intensity: 0.3 }
        },
        composition: {
            productFocus: 0.55,
            trustBadges: { enabled: true, prominent: true },
            securityIndicators: { enabled: true }
        },
        typography: {
            headlineSize: { min: 50, max: 62, optimal: 56 },
            professionalStyle: true
        },
        colors: {
            preferDark: true,
            greenAccents: true,
            trustworthyPalette: true
        }
    },

    // ──────────────────────────────────────────────────────────────
    // HEALTH & FITNESS
    // ──────────────────────────────────────────────────────────────
    fitness_app: {
        category: 'Health',
        productType: 'Fitness App',
        mockup: {
            devices: ['phone', 'watch'],
            preferredDevice: 'phone',
            scale: { min: 0.4, max: 0.52, optimal: 0.46 }
        },
        shadow: {
            type: 'layered',
            intensity: 0.5
        },
        screenGlow: {
            enabled: true,
            intensity: 0.12,
            color: '#FF4757'
        },
        effects: {
            bokeh: { enabled: true, count: 5, opacity: 0.05 },
            particles: { enabled: true, count: 30, opacity: 0.2, distribution: 'radial' },
            sparkles: { enabled: true, count: 8 },
            gradientMesh: { enabled: true, complexity: 4 }
        },
        composition: {
            productFocus: 0.5,
            statsCallouts: { enabled: true },
            motivationalLayout: true
        },
        typography: {
            headlineSize: { min: 54, max: 68, optimal: 62 },
            boldStyle: true,
            impactFont: true
        },
        colors: {
            preferDark: true,
            energeticColors: true,
            vibrantAccents: true
        }
    },

    supplement: {
        category: 'Health',
        productType: 'Supplement',
        mockup: {
            devices: ['product_hero', 'lifestyle'],
            preferredDevice: 'product_hero',
            scale: { min: 0.45, max: 0.58, optimal: 0.52 }
        },
        shadow: {
            type: 'contact',
            intensity: 0.4
        },
        effects: {
            bokeh: { enabled: false },
            particles: { enabled: true, count: 10, opacity: 0.1, type: 'sparkle' },
            gradientMesh: { enabled: false },
            vignette: { enabled: true, intensity: 0.25 }
        },
        composition: {
            productFocus: 0.6,
            benefitBadges: { enabled: true },
            ingredientHighlight: { enabled: true }
        },
        typography: {
            headlineSize: { min: 52, max: 64, optimal: 58 }
        },
        colors: {
            naturalPalette: true,
            greenAccents: true,
            cleanBackground: true
        }
    },

    // ──────────────────────────────────────────────────────────────
    // EDUCATION
    // ──────────────────────────────────────────────────────────────
    online_course: {
        category: 'Education',
        productType: 'Online Course',
        mockup: {
            devices: ['browser', 'tablet', 'mixed'],
            preferredDevice: 'browser',
            scale: { min: 0.5, max: 0.62, optimal: 0.56 }
        },
        shadow: {
            type: 'layered',
            intensity: 0.45
        },
        effects: {
            bokeh: { enabled: true, count: 3, opacity: 0.03 },
            particles: { enabled: false },
            lightRays: { enabled: true, count: 3, opacity: 0.04, subtle: true }
        },
        composition: {
            productFocus: 0.55,
            instructorPhoto: { enabled: true, optional: true },
            credentialBadges: { enabled: true }
        },
        typography: {
            headlineSize: { min: 50, max: 62, optimal: 56 },
            inspiringStyle: true
        },
        colors: {
            warmBlues: true,
            trustworthyPalette: true
        }
    }
};

// ========================================
// RULE LOOKUP FUNCTIONS
// ========================================

/**
 * Get visual rules for product type
 */
export function getProductVisualRules(productType) {
    const normalized = productType?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'saas_dashboard';

    // Direct match
    if (PRODUCT_VISUAL_RULES[normalized]) {
        return PRODUCT_VISUAL_RULES[normalized];
    }

    // Fuzzy match
    for (const [key, rules] of Object.entries(PRODUCT_VISUAL_RULES)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return rules;
        }
    }

    // Category-based fallback
    const categoryMap = {
        saas: 'saas_dashboard',
        app: 'mobile_app',
        software: 'saas_dashboard',
        dashboard: 'saas_dashboard',
        ai: 'ai_tool',
        fashion: 'fashion_apparel',
        beauty: 'beauty_cosmetics',
        cosmetic: 'beauty_cosmetics',
        electronic: 'electronics',
        tech: 'electronics',
        food: 'food_beverage',
        drink: 'food_beverage',
        finance: 'fintech',
        bank: 'fintech',
        fitness: 'fitness_app',
        gym: 'fitness_app',
        vitamin: 'supplement',
        course: 'online_course',
        learning: 'online_course'
    };

    for (const [keyword, ruleKey] of Object.entries(categoryMap)) {
        if (normalized.includes(keyword)) {
            return PRODUCT_VISUAL_RULES[ruleKey];
        }
    }

    // Default to SaaS dashboard rules
    return PRODUCT_VISUAL_RULES.saas_dashboard;
}

/**
 * Apply visual rules to design specs
 */
export function applyVisualRules(designSpecs, productType) {
    const rules = getProductVisualRules(productType);

    return {
        ...designSpecs,
        appliedRules: rules,
        mockup: {
            ...designSpecs.mockup,
            device: rules.mockup.preferredDevice,
            scale: rules.mockup.scale.optimal,
            position: rules.mockup.position
        },
        shadow: rules.shadow,
        screenGlow: rules.screenGlow,
        reflection: rules.reflection,
        effects: {
            ...designSpecs.effects,
            ...rules.effects
        },
        composition: {
            ...designSpecs.composition,
            ...rules.composition
        },
        typography: {
            ...designSpecs.typography,
            headlineSize: rules.typography.headlineSize.optimal,
            style: rules.typography
        },
        colors: {
            ...designSpecs.colors,
            ...rules.colors
        }
    };
}

/**
 * Get mockup recommendation
 */
export function getMockupRecommendation(productType, variant = 0) {
    const rules = getProductVisualRules(productType);
    const devices = rules.mockup.devices || ['floating_card'];
    return devices[variant % devices.length];
}

/**
 * Get effect recommendations
 */
export function getEffectRecommendations(productType) {
    const rules = getProductVisualRules(productType);
    const effects = [];

    if (rules.effects.bokeh?.enabled) {
        effects.push({ type: 'bokeh', ...rules.effects.bokeh });
    }
    if (rules.effects.particles?.enabled) {
        effects.push({ type: 'particles', ...rules.effects.particles });
    }
    if (rules.effects.gradientMesh?.enabled) {
        effects.push({ type: 'gradientMesh', ...rules.effects.gradientMesh });
    }
    if (rules.effects.sparkles?.enabled) {
        effects.push({ type: 'sparkles', ...rules.effects.sparkles });
    }
    if (rules.effects.lightRays?.enabled) {
        effects.push({ type: 'lightRays', ...rules.effects.lightRays });
    }

    return effects;
}

export default {
    PRODUCT_VISUAL_RULES,
    getProductVisualRules,
    applyVisualRules,
    getMockupRecommendation,
    getEffectRecommendations
};
