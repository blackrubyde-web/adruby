/**
 * TEMPLATE CAPSULE REGISTRY - PART 2
 * 
 * Remaining template definitions (T4-T10)
 */

import type { TemplateCapsule } from './types';

// ============================================================================
// E-COMMERCE TEMPLATES (continued)
// ============================================================================

/**
 * T4: E-Commerce Giftable / Seasonal
 * 
 * "Perfect gift" headline, product hero, gift badge, CTA
 * Ideal for: holidays, gift guides, seasonal campaigns
 */
export const ECOMMERCE_GIFTABLE: TemplateCapsule = {
    id: 'tmpl_ecom_giftable_v1',
    name: 'Giftable / Seasonal',
    ratio: '1:1',
    version: 1,

    supportedBusinessModels: ['ecommerce'],
    supportedPatterns: ['ecommerce_giftable', 'ecommerce_product_focus'],

    zones: [
        {
            id: 'headline',
            bbox: { x: 540, y: 100, width: 900, height: 140 },
            rules: { maxLines: 2, maxChars: 55, minFontSize: 48, align: 'center', priority: 9 },
            contentType: 'text',
            dynamic: { scaleDown: true },
            layerId: 'headline'
        },
        {
            id: 'hero',
            bbox: { x: 290, y: 340, width: 500, height: 500 },
            rules: { priority: 10 },
            contentType: 'image',
            layerId: 'product'
        },
        {
            id: 'badges',
            bbox: { x: 60, y: 60, width: 180, height: 80 },
            rules: { maxChars: 15, priority: 7 },
            contentType: 'badge',
            layerId: 'giftBadge'
        },
        {
            id: 'cta',
            bbox: { x: 340, y: 900, width: 400, height: 80 },
            rules: { maxChars: 30, priority: 10 },
            contentType: 'text',
            layerId: 'cta'
        }
    ],

    requiredAssets: ['productCutout'],
    optionalAssets: ['giftBadge'],

    copyConstraints: {
        maxChars: { headline: 55, cta: 30 },
        maxLines: { headline: 2 },
        minFontSize: 18
    },

    layoutConstraints: {
        safeMargins: { top: 60, right: 60, bottom: 60, left: 60 },
        minCTAWidth: 300,
        maxDensity: 5
    },

    stylingTokens: {
        paletteSlots: ['background', 'accent', 'gift'],
        typographySlots: ['headlineFont']
    },

    document: {
        id: 'tmpl_ecom_giftable_v1',
        name: 'Giftable / Seasonal',
        width: 1080,
        height: 1080,
        backgroundColor: '#FFF5F5',
        layers: [] // Simplified for brevity
    },

    performance: {
        estimatedCTR: 3.5,
        conversionPotential: 'medium',
        knownGoodFor: ['holidays', 'gifts', 'seasonal']
    }
};

/**
 * T5: E-Commerce Comparison Mini
 * 
 * Before/after or vs-competitor table, hero product, CTA
 * Ideal for: comparisons, upgrades, competitive positioning
 */
export const ECOMMERCE_COMPARISON: TemplateCapsule = {
    id: 'tmpl_ecom_comparison_v1',
    name: 'Comparison Mini',
    ratio: '1:1',
    version: 1,

    supportedBusinessModels: ['ecommerce'],
    supportedPatterns: ['ecommerce_comparison', 'ecommerce_before_after'],

    zones: [
        {
            id: 'headline',
            bbox: { x: 60, y: 80, width: 960, height: 100 },
            rules: { maxLines: 2, maxChars: 50, minFontSize: 44, align: 'center', priority: 9 },
            contentType: 'text',
            layerId: 'headline'
        },
        {
            id: 'hero',
            bbox: { x: 540, y: 250, width: 400, height: 400 },
            rules: { priority: 8 },
            contentType: 'image',
            layerId: 'product'
        },
        {
            id: 'secondary',
            bbox: { x: 60, y: 680, width: 960, height: 200 },
            rules: { priority: 7 },
            contentType: 'table',
            layerId: 'comparison'
        },
        {
            id: 'cta',
            bbox: { x: 340, y: 920, width: 400, height: 80 },
            rules: { maxChars: 30, priority: 10 },
            contentType: 'text',
            layerId: 'cta'
        }
    ],

    requiredAssets: ['productCutout', 'comparisonTable'],

    copyConstraints: {
        maxChars: { headline: 50, cta: 30 },
        maxLines: { headline: 2 },
        minFontSize: 18
    },

    layoutConstraints: {
        safeMargins: { top: 60, right: 60, bottom: 60, left: 60 },
        minCTAWidth: 300,
        maxDensity: 6
    },

    stylingTokens: {
        paletteSlots: ['background', 'primary', 'secondary'],
        typographySlots: ['headlineFont', 'bodyFont']
    },

    document: {
        id: 'tmpl_ecom_comparison_v1',
        name: 'Comparison Mini',
        width: 1080,
        height: 1080,
        backgroundColor: '#FFFFFF',
        layers: [] // Simplified
    },

    performance: {
        estimatedCTR: 3.0,
        conversionPotential: 'medium',
        knownGoodFor: ['comparisons', 'upgrades', 'differentiation']
    }
};

// ============================================================================
// SAAS TEMPLATES (2)
// ============================================================================

/**
 * T6: SaaS Chat Proof + Dashboard
 * 
 * Messenger mock left, dashboard card right, feature chips, CTA
 * Ideal for: workflow automation, productivity tools, communication platforms
 */
export const SAAS_UI_PROOF: TemplateCapsule = {
    id: 'tmpl_saas_ui_proof_v1',
    name: 'Chat Proof + Dashboard',
    ratio: '1:1',
    version: 1,

    supportedBusinessModels: ['saas'],
    supportedPatterns: ['saas_ui_proof', 'saas_whatsapp_flow'],

    zones: [
        {
            id: 'headline',
            bbox: { x: 60, y: 80, width: 960, height: 120 },
            rules: { maxLines: 2, maxChars: 50, minFontSize: 42, align: 'left', priority: 9 },
            contentType: 'text',
            dynamic: { scaleDown: true },
            layerId: 'headline'
        },
        {
            id: 'hero',
            bbox: { x: 60, y: 250, width: 460, height: 600 },
            rules: { priority: 10 },
            contentType: 'image',
            layerId: 'messengerMock'
        },
        {
            id: 'secondary',
            bbox: { x: 560, y: 250, width: 460, height: 600 },
            rules: { priority: 9 },
            contentType: 'image',
            layerId: 'dashboardCard'
        },
        {
            id: 'chips',
            bbox: { x: 60, y: 880, width: 960, height: 60 },
            rules: { priority: 7 },
            contentType: 'chip',
            layerId: 'featureChips'
        },
        {
            id: 'cta',
            bbox: { x: 390, y: 970, width: 300, height: 70 },
            rules: { maxChars: 25, priority: 10 },
            contentType: 'text',
            layerId: 'cta'
        }
    ],

    requiredAssets: ['messengerMock', 'dashboardCard'],
    optionalAssets: ['featureChips'],

    copyConstraints: {
        maxChars: { headline: 50, cta: 25 },
        maxLines: { headline: 2 },
        minFontSize: 18
    },

    layoutConstraints: {
        safeMargins: { top: 60, right: 60, bottom: 60, left: 60 },
        minCTAWidth: 250,
        maxDensity: 7,
        minContrast: 4.5
    },

    stylingTokens: {
        paletteSlots: ['background', 'primary', 'ui'],
        typographySlots: ['headlineFont', 'monospaceFont']
    },

    document: {
        id: 'tmpl_saas_ui_proof_v1',
        name: 'Chat Proof + Dashboard',
        width: 1080,
        height: 1080,
        backgroundColor: '#F8FAFC',
        layers: [] // Simplified
    },

    performance: {
        estimatedCTR: 2.8,
        conversionPotential: 'high',
        knownGoodFor: ['saas', 'automation', 'productivity']
    }
};

/**
 * T7: SaaS Workflow 3-Step
 * 
 * Step chips visual flow, proof line, CTA
 * Ideal for: process automation, time-saving tools, workflow optimization
 */
export const SAAS_WORKFLOW_STEPS: TemplateCapsule = {
    id: 'tmpl_saas_workflow_v1',
    name: 'Workflow 3-Step',
    ratio: '1:1',
    version: 1,

    supportedBusinessModels: ['saas'],
    supportedPatterns: ['saas_workflow_steps', 'saas_time_saving'],

    zones: [
        {
            id: 'headline',
            bbox: { x: 60, y: 100, width: 960, height: 140 },
            rules: { maxLines: 2, maxChars: 55, minFontSize: 48, align: 'center', priority: 9 },
            contentType: 'text',
            layerId: 'headline'
        },
        {
            id: 'chips',
            bbox: { x: 140, y: 320, width: 800, height: 400 },
            rules: { priority: 10 },
            contentType: 'stack',
            layerId: 'stepChips'
        },
        {
            id: 'proof',
            bbox: { x: 140, y: 760, width: 800, height: 80 },
            rules: { maxChars: 80, priority: 7 },
            contentType: 'text',
            layerId: 'proofLine'
        },
        {
            id: 'cta',
            bbox: { x: 340, y: 900, width: 400, height: 80 },
            rules: { maxChars: 30, priority: 10 },
            contentType: 'text',
            layerId: 'cta'
        }
    ],

    requiredAssets: ['featureChips'],

    copyConstraints: {
        maxChars: { headline: 55, cta: 30 },
        maxLines: { headline: 2 },
        minFontSize: 18
    },

    layoutConstraints: {
        safeMargins: { top: 80, right: 80, bottom: 60, left: 80 },
        minCTAWidth: 300,
        maxDensity: 5
    },

    stylingTokens: {
        paletteSlots: ['background', 'primary', 'steps'],
        typographySlots: ['headlineFont', 'bodyFont']
    },

    document: {
        id: 'tmpl_saas_workflow_v1',
        name: 'Workflow 3-Step',
        width: 1080,
        height: 1080,
        backgroundColor: '#FFFFFF',
        layers: [] // Simplified
    },

    performance: {
        estimatedCTR: 2.5,
        conversionPotential: 'medium',
        knownGoodFor: ['automation', 'process', 'efficiency']
    }
};

// ============================================================================
// LOCAL/GASTRO TEMPLATES (2)
// ============================================================================

/**
 * T8: Local Menu Feature
 * 
 * Dish hero top, 3-item menu card bottom-left, hours, CTA
 * Ideal for: restaurants, cafés, food delivery
 */
export const LOCAL_MENU_FEATURE: TemplateCapsule = {
    id: 'tmpl_local_menu_v1',
    name: 'Menu Feature',
    ratio: '1:1',
    version: 1,

    supportedBusinessModels: ['local'],
    supportedPatterns: ['local_menu_feature', 'local_social_proof'],

    zones: [
        {
            id: 'hero',
            bbox: { x: 60, y: 60, width: 960, height: 480 },
            rules: { priority: 10 },
            contentType: 'image',
            layerId: 'dishPhoto'
        },
        {
            id: 'headline',
            bbox: { x: 60, y: 580, width: 960, height: 100 },
            rules: { maxLines: 2, maxChars: 45, minFontSize: 44, align: 'left', priority: 9 },
            contentType: 'text',
            layerId: 'headline'
        },
        {
            id: 'secondary',
            bbox: { x: 60, y: 720, width: 580, height: 180 },
            rules: { priority: 8 },
            contentType: 'stack',
            layerId: 'menuCard'
        },
        {
            id: 'proof',
            bbox: { x: 680, y: 720, width: 340, height: 80 },
            rules: { maxChars: 40, priority: 6 },
            contentType: 'text',
            layerId: 'hours'
        },
        {
            id: 'cta',
            bbox: { x: 680, y: 820, width: 340, height: 80 },
            rules: { maxChars: 30, priority: 10 },
            contentType: 'text',
            layerId: 'cta'
        }
    ],

    requiredAssets: ['menuCard'],
    optionalAssets: ['dishPhoto', 'hoursCard'],

    copyConstraints: {
        maxChars: { headline: 45, cta: 30 },
        maxLines: { headline: 2 },
        minFontSize: 18
    },

    layoutConstraints: {
        safeMargins: { top: 60, right: 60, bottom: 80, left: 60 },
        minCTAWidth: 280,
        maxDensity: 6
    },

    stylingTokens: {
        paletteSlots: ['background', 'accent', 'food'],
        typographySlots: ['headlineFont', 'bodyFont']
    },

    document: {
        id: 'tmpl_local_menu_v1',
        name: 'Menu Feature',
        width: 1080,
        height: 1080,
        backgroundColor: '#FFF8F0',
        layers: [] // Simplified
    },

    performance: {
        estimatedCTR: 3.3,
        conversionPotential: 'high',
        knownGoodFor: ['restaurants', 'food', 'local']
    }
};

/**
 * T9: Local Coupon/Map
 * 
 * Offer coupon card left, map + hours card right, CTA
 * Ideal for: local services, proximity marketing, offers
 */
export const LOCAL_COUPON_MAP: TemplateCapsule = {
    id: 'tmpl_local_coupon_v1',
    name: 'Coupon/Map',
    ratio: '1:1',
    version: 1,

    supportedBusinessModels: ['local'],
    supportedPatterns: ['local_offer_coupon', 'local_map_hours'],

    zones: [
        {
            id: 'headline',
            bbox: { x: 60, y: 80, width: 960, height: 100 },
            rules: { maxLines: 2, maxChars: 50, minFontSize: 44, align: 'center', priority: 9 },
            contentType: 'text',
            layerId: 'headline'
        },
        {
            id: 'hero',
            bbox: { x: 80, y: 240, width: 440, height: 560 },
            rules: { priority: 10 },
            contentType: 'image',
            layerId: 'offerCard'
        },
        {
            id: 'secondary',
            bbox: { x: 560, y: 240, width: 440, height: 560 },
            rules: { priority: 8 },
            contentType: 'image',
            layerId: 'mapCard'
        },
        {
            id: 'cta',
            bbox: { x: 340, y: 880, width: 400, height: 80 },
            rules: { maxChars: 30, priority: 10 },
            contentType: 'text',
            layerId: 'cta'
        }
    ],

    requiredAssets: ['offerBadge', 'mapCard'],

    copyConstraints: {
        maxChars: { headline: 50, cta: 30 },
        maxLines: { headline: 2 },
        minFontSize: 18
    },

    layoutConstraints: {
        safeMargins: { top: 60, right: 60, bottom: 60, left: 60 },
        minCTAWidth: 320,
        maxDensity: 5
    },

    stylingTokens: {
        paletteSlots: ['background', 'offer', 'map'],
        typographySlots: ['headlineFont']
    },

    document: {
        id: 'tmpl_local_coupon_v1',
        name: 'Coupon/Map',
        width: 1080,
        height: 1080,
        backgroundColor: '#FFFFFF',
        layers: [] // Simplified
    },

    performance: {
        estimatedCTR: 3.6,
        conversionPotential: 'high',
        knownGoodFor: ['local offers', 'proximity', 'coupons']
    }
};

// ============================================================================
// COACH/AGENCY/INFO (1 multi-variant)
// ============================================================================

/**
 * T10: Authority Slide
 * 
 * Optional portrait frame top, 3 outcome bullets, optional testimonial card, CTA
 * Ideal for: coaches, agencies, consultants, info products
 * Multi-variant: works for coach, agency, and info business models
 */
export const AUTHORITY_SLIDE: TemplateCapsule = {
    id: 'tmpl_authority_slide_v1',
    name: 'Authority Slide',
    ratio: '1:1',
    version: 1,

    supportedBusinessModels: ['coach', 'agency', 'info'],
    supportedPatterns: [
        'coach_authority_slide',
        'coach_transformation',
        'agency_results_card',
        'agency_case_study',
        'info_curriculum',
        'info_outcomes'
    ],

    zones: [
        {
            id: 'hero',
            bbox: { x: 60, y: 60, width: 260, height: 260 },
            rules: { priority: 7 },
            contentType: 'image',
            layerId: 'portraitFrame'
        },
        {
            id: 'headline',
            bbox: { x: 360, y: 80, width: 660, height: 200 },
            rules: { maxLines: 3, maxChars: 60, minFontSize: 40, align: 'left', priority: 10 },
            contentType: 'text',
            dynamic: { scaleDown: true },
            layerId: 'headline'
        },
        {
            id: 'badges',
            bbox: { x: 60, y: 360, width: 960, height: 360 },
            rules: { priority: 9 },
            contentType: 'stack',
            layerId: 'outcomes'
        },
        {
            id: 'proof',
            bbox: { x: 60, y: 760, width: 960, height: 100 },
            rules: { maxChars: 100, priority: 6 },
            contentType: 'text',
            layerId: 'testimonial'
        },
        {
            id: 'cta',
            bbox: { x: 340, y: 900, width: 400, height: 80 },
            rules: { maxChars: 35, priority: 10 },
            contentType: 'text',
            layerId: 'cta'
        }
    ],

    requiredAssets: [],
    optionalAssets: ['portraitFrame', 'testimonialCard', 'resultsCard'],
    forbiddenAssets: ['productCutout'],

    copyConstraints: {
        maxChars: { headline: 60, cta: 35 },
        maxLines: { headline: 3 },
        minFontSize: 18
    },

    layoutConstraints: {
        safeMargins: { top: 60, right: 60, bottom: 60, left: 60 },
        minCTAWidth: 320,
        maxDensity: 6
    },

    stylingTokens: {
        paletteSlots: ['background', 'primary', 'authority'],
        typographySlots: ['headlineFont', 'bodyFont']
    },

    document: {
        id: 'tmpl_authority_slide_v1',
        name: 'Authority Slide',
        width: 1080,
        height: 1080,
        backgroundColor: '#F8F9FA',
        layers: [] // Simplified
    },

    performance: {
        estimatedCTR: 2.3,
        conversionPotential: 'medium',
        knownGoodFor: ['coaching', 'consulting', 'expertise', 'courses']
    }
};

// Export all templates
export const ADDITIONAL_TEMPLATES: TemplateCapsule[] = [
    ECOMMERCE_GIFTABLE,
    ECOMMERCE_COMPARISON,
    SAAS_UI_PROOF,
    SAAS_WORKFLOW_STEPS,
    LOCAL_MENU_FEATURE,
    LOCAL_COUPON_MAP,
    AUTHORITY_SLIDE
];
