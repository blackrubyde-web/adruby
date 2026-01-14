import type { TemplateCapsule } from './types';
import type { AdDocument } from '../../types/studio';
import { ADDITIONAL_TEMPLATES } from './registry-extended';
import { ECOMMERCE_FEATURE_SCATTER } from './registry-feature';
import {
    ECOMMERCE_RETAIL_LAUNCH,
    ECOMMERCE_NUTRITION_PROOF,
    ECOMMERCE_VEHICLE_RING,
    ECOMMERCE_EXPLODED_STACK,
    ECOMMERCE_LIFESTYLE_MATERIAL,
    SAAS_4_STEP_GRID
} from './registry-premium';

// ============================================================================
// E-COMMERCE TEMPLATES (5)
// ============================================================================

/**
 * T1: E-Commerce Product Focus + Benefit Stack
 * 
 * Hero product center, 2-3 benefit bullets left, CTA bottom
 * Ideal for: product launches, feature highlights, benefit-driven messaging
 */
export const ECOMMERCE_PRODUCT_FOCUS: TemplateCapsule = {
    id: 'tmpl_ecom_product_focus_v1',
    name: 'Product Focus + Benefit Stack',
    ratio: '1:1',
    version: 1,

    supportedBusinessModels: ['ecommerce'],
    supportedPatterns: [
        'ecommerce_product_focus',
        'ecommerce_benefit_stack'
    ],

    zones: [
        {
            id: 'hero',
            bbox: { x: 540, y: 270, width: 500, height: 500 },
            rules: { priority: 10 },
            contentType: 'image',
            layerId: 'product'
        },
        {
            id: 'headline',
            bbox: { x: 60, y: 120, width: 400, height: 120 },
            rules: {
                maxLines: 2,
                maxChars: 50,
                minFontSize: 48,
                allowWrap: true,
                align: 'left',
                priority: 9
            },
            contentType: 'text',
            dynamic: { scaleDown: true },
            layerId: 'headline'
        },
        {
            id: 'badges',
            bbox: { x: 60, y: 280, width: 400, height: 300 },
            rules: { maxLines: 3, priority: 7 },
            contentType: 'stack',
            layerId: 'bullets'
        },
        {
            id: 'cta',
            bbox: { x: 60, y: 900, width: 300, height: 80 },
            rules: {
                maxChars: 25,
                minFontSize: 18,
                priority: 10
            },
            contentType: 'text',
            layerId: 'cta'
        }
    ],

    requiredAssets: ['productCutout'],
    optionalAssets: ['offerBadge'],

    copyConstraints: {
        maxChars: {
            headline: 50,
            subheadline: 80,
            cta: 25
        },
        maxLines: {
            headline: 2,
            subheadline: 2
        },
        minFontSize: 18,
        hierarchyRules: {
            headlineShouldDominate: true,
            ctaShouldStandOut: true
        }
    },

    layoutConstraints: {
        safeMargins: { top: 60, right: 40, bottom: 60, left: 60 },
        minCTAWidth: 200,
        minCTAHeight: 60,
        maxDensity: 5,
        minContrast: 4.5
    },

    stylingTokens: {
        paletteSlots: ['background', 'primary', 'accent'],
        typographySlots: ['headlineFont', 'bodyFont']
    },

    document: {
        id: 'tmpl_ecom_product_focus_v1',
        name: 'Product Focus + Benefit Stack',
        width: 1080,
        height: 1080,
        backgroundColor: '#FFFFFF',
        layers: [
            {
                id: 'bg',
                type: 'background',
                name: 'Background',
                x: 0,
                y: 0,
                width: 1080,
                height: 1080,
                visible: true,
                locked: true,
                zIndex: 0,
                opacity: 1,
                rotation: 0,
                src: '',
                fit: 'cover'
            },
            {
                id: 'product',
                type: 'product',
                name: 'Product Hero',
                x: 540,
                y: 270,
                width: 500,
                height: 500,
                visible: true,
                locked: false,
                zIndex: 5,
                opacity: 1,
                rotation: 0,
                src: '',
                fit: 'contain',
                role: 'product_image'
            },
            {
                id: 'headline',
                type: 'text',
                name: 'Headline',
                x: 60,
                y: 120,
                width: 400,
                height: 120,
                visible: true,
                locked: false,
                zIndex: 10,
                opacity: 1,
                rotation: 0,
                text: 'Your Product Headline',
                fontFamily: 'Inter',
                fontWeight: 900,
                fontSize: 56,
                color: '#000000',
                fill: '#000000',
                align: 'left',
                lineHeight: 1.1,
                letterSpacing: -1.5,
                role: 'headline'
            },
            {
                id: 'bullets',
                type: 'text',
                name: 'Benefits',
                x: 60,
                y: 280,
                width: 400,
                height: 300,
                visible: true,
                locked: false,
                zIndex: 8,
                opacity: 1,
                rotation: 0,
                text: '✓ Benefit 1\n✓ Benefit 2\n✓ Benefit 3',
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: 24,
                color: '#222222',
                fill: '#222222',
                align: 'left',
                lineHeight: 1.6,
                role: 'description'
            },
            {
                id: 'cta',
                type: 'cta',
                name: 'CTA Button',
                x: 60,
                y: 900,
                width: 300,
                height: 80,
                visible: true,
                locked: false,
                zIndex: 10,
                opacity: 1,
                rotation: 0,
                text: 'Jetzt ansehen',
                fontFamily: 'Inter',
                fontSize: 20,
                fontWeight: 700,
                color: '#FFFFFF',
                bgColor: '#000000',
                radius: 8,
                paddingX: 32,
                paddingY: 20,
                role: 'cta'
            }
        ]
    },

    performance: {
        estimatedCTR: 3.2,
        conversionPotential: 'high',
        knownGoodFor: ['ecommerce', 'product launches', 'feature highlights']
    }
};

/**
 * T2: E-Commerce Offer Burst + Price Anchor
 * 
 * Discount badge top-right, price block center, CTA bottom
 * Ideal for: sales, promotions, urgency-driven campaigns
 */
export const ECOMMERCE_OFFER_BURST: TemplateCapsule = {
    id: 'tmpl_ecom_offer_burst_v1',
    name: 'Offer Burst + Price Anchor',
    ratio: '1:1',
    version: 1,

    supportedBusinessModels: ['ecommerce'],
    supportedPatterns: [
        'ecommerce_offer_burst',
        'ecommerce_product_focus'
    ],

    zones: [
        {
            id: 'hero',
            bbox: { x: 270, y: 400, width: 540, height: 540 },
            rules: { priority: 9 },
            contentType: 'image',
            layerId: 'product'
        },
        {
            id: 'badges',
            bbox: { x: 750, y: 60, width: 260, height: 120 },
            rules: { maxChars: 20, priority: 10 },
            contentType: 'badge',
            layerId: 'offerBadge'
        },
        {
            id: 'headline',
            bbox: { x: 60, y: 120, width: 600, height: 100 },
            rules: {
                maxLines: 2,
                maxChars: 45,
                minFontSize: 44,
                priority: 8
            },
            contentType: 'text',
            dynamic: { scaleDown: true },
            layerId: 'headline'
        },
        {
            id: 'subheadline',
            bbox: { x: 60, y: 240, width: 600, height: 60 },
            rules: { maxChars: 60, maxLines: 1, priority: 6 },
            contentType: 'text',
            layerId: 'subheadline'
        },
        {
            id: 'cta',
            bbox: { x: 390, y: 920, width: 300, height: 80 },
            rules: { maxChars: 25, priority: 10 },
            contentType: 'text',
            layerId: 'cta'
        }
    ],

    requiredAssets: ['productCutout', 'offerBadge'],

    copyConstraints: {
        maxChars: {
            headline: 45,
            subheadline: 60,
            cta: 25
        },
        maxLines: {
            headline: 2,
            subheadline: 1
        },
        minFontSize: 18
    },

    layoutConstraints: {
        safeMargins: { top: 60, right: 40, bottom: 60, left: 60 },
        minCTAWidth: 240,
        maxDensity: 6
    },

    stylingTokens: {
        paletteSlots: ['background', 'accent', 'offer'],
        typographySlots: ['headlineFont', 'bodyFont']
    },

    document: {
        id: 'tmpl_ecom_offer_burst_v1',
        name: 'Offer Burst + Price Anchor',
        width: 1080,
        height: 1080,
        backgroundColor: '#FFFFFF',
        layers: [
            {
                id: 'bg',
                type: 'background',
                name: 'Background',
                x: 0,
                y: 0,
                width: 1080,
                height: 1080,
                visible: true,
                locked: true,
                zIndex: 0,
                opacity: 1,
                rotation: 0,
                src: '',
                fit: 'cover'
            },
            {
                id: 'offerBadge',
                type: 'shape',
                name: 'Offer Badge',
                x: 750,
                y: 60,
                width: 260,
                height: 120,
                visible: true,
                locked: false,
                zIndex: 10,
                opacity: 1,
                rotation: -5,
                fill: '#FF3B30',
                cornerRadius: 12
            },
            {
                id: 'offerText',
                type: 'text',
                name: 'Offer Text',
                x: 770,
                y: 85,
                width: 220,
                height: 70,
                visible: true,
                locked: false,
                zIndex: 11,
                opacity: 1,
                rotation: -5,
                text: '-20%',
                fontFamily: 'Inter',
                fontWeight: 900,
                fontSize: 48,
                color: '#FFFFFF',
                fill: '#FFFFFF',
                align: 'center',
                role: 'badge'
            },
            {
                id: 'product',
                type: 'product',
                name: 'Product',
                x: 270,
                y: 400,
                width: 540,
                height: 540,
                visible: true,
                locked: false,
                zIndex: 5,
                opacity: 1,
                rotation: 0,
                src: '',
                fit: 'contain',
                role: 'product_image'
            },
            {
                id: 'headline',
                type: 'text',
                name: 'Headline',
                x: 60,
                y: 120,
                width: 600,
                height: 100,
                visible: true,
                locked: false,
                zIndex: 8,
                opacity: 1,
                rotation: 0,
                text: 'LIMITED OFFER',
                fontFamily: 'Inter',
                fontWeight: 900,
                fontSize: 52,
                color: '#000000',
                fill: '#000000',
                align: 'left',
                lineHeight: 1.1,
                role: 'headline'
            },
            {
                id: 'subheadline',
                type: 'text',
                name: 'Subheadline',
                x: 60,
                y: 240,
                width: 600,
                height: 60,
                visible: true,
                locked: false,
                zIndex: 7,
                opacity: 1,
                rotation: 0,
                text: 'Nur heute: 20% Rabatt',
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: 28,
                color: '#FF3B30',
                fill: '#FF3B30',
                align: 'left',
                role: 'subheadline'
            },
            {
                id: 'cta',
                type: 'cta',
                name: 'CTA',
                x: 390,
                y: 920,
                width: 300,
                height: 80,
                visible: true,
                locked: false,
                zIndex: 10,
                opacity: 1,
                rotation: 0,
                text: 'Jetzt sichern',
                fontFamily: 'Inter',
                fontSize: 20,
                fontWeight: 700,
                color: '#FFFFFF',
                bgColor: '#DC2626',
                radius: 12,
                role: 'cta'
            }
        ]
    },

    performance: {
        estimatedCTR: 4.1,
        conversionPotential: 'high',
        knownGoodFor: ['sales', 'promotions', 'urgency campaigns']
    }
};

/**
 * T3: E-Commerce UGC Frame Still
 * 
 * Phone frame hero, testimonial card overlay, CTA
 * Ideal for: social proof, user-generated content style
 */
export const ECOMMERCE_UGC_FRAME: TemplateCapsule = {
    id: 'tmpl_ecom_ugc_frame_v1',
    name: 'UGC Frame Still',
    ratio: '4:5',
    version: 1,

    supportedBusinessModels: ['ecommerce'],
    supportedPatterns: ['ecommerce_ugc_frame'],

    zones: [
        {
            id: 'hero',
            bbox: { x: 315, y: 200, width: 450, height: 800 },
            rules: { priority: 10 },
            contentType: 'image',
            layerId: 'phoneFrame'
        },
        {
            id: 'proof',
            bbox: { x: 80, y: 1050, width: 920, height: 140 },
            rules: { maxChars: 100, priority: 8 },
            contentType: 'text',
            layerId: 'testimonial'
        },
        {
            id: 'cta',
            bbox: { x: 340, y: 1220, width: 400, height: 80 },
            rules: { maxChars: 30, priority: 10 },
            contentType: 'text',
            layerId: 'cta'
        }
    ],

    requiredAssets: ['productCutout'],
    optionalAssets: ['testimonialCard'],

    copyConstraints: {
        maxChars: {
            headline: 100,
            cta: 30
        },
        maxLines: {
            headline: 3
        },
        minFontSize: 16
    },

    layoutConstraints: {
        safeMargins: { top: 80, right: 80, bottom: 80, left: 80 },
        minCTAWidth: 300,
        maxDensity: 4
    },

    stylingTokens: {
        paletteSlots: ['background', 'frame', 'accent'],
        typographySlots: ['headlineFont']
    },

    document: {
        id: 'tmpl_ecom_ugc_frame_v1',
        name: 'UGC Frame Still',
        width: 1080,
        height: 1350,
        backgroundColor: '#F5F5F7',
        layers: [
            {
                id: 'bg',
                type: 'background',
                name: 'Background',
                x: 0,
                y: 0,
                width: 1080,
                height: 1350,
                visible: true,
                locked: true,
                zIndex: 0,
                opacity: 1,
                rotation: 0,
                src: '',
                fit: 'cover'
            },
            {
                id: 'phoneFrame',
                type: 'shape',
                name: 'Phone Frame',
                x: 315,
                y: 200,
                width: 450,
                height: 800,
                visible: true,
                locked: false,
                zIndex: 5,
                opacity: 1,
                rotation: 0,
                fill: '#000000',
                cornerRadius: 40
            },
            {
                id: 'phoneContent',
                type: 'image',
                name: 'Phone Content',
                x: 330,
                y: 215,
                width: 420,
                height: 770,
                visible: true,
                locked: false,
                zIndex: 6,
                opacity: 1,
                rotation: 0,
                src: '',
                fit: 'cover',
                role: 'product_image'
            },
            {
                id: 'testimonial',
                type: 'text',
                name: 'Testimonial',
                x: 80,
                y: 1050,
                width: 920,
                height: 140,
                visible: true,
                locked: false,
                zIndex: 8,
                opacity: 1,
                rotation: 0,
                text: '"Absolut begeistert! Genau das, was ich gesucht habe."',
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: 24,
                color: '#000000',
                fill: '#000000',
                align: 'center',
                lineHeight: 1.4,
                role: 'social_proof'
            },
            {
                id: 'cta',
                type: 'cta',
                name: 'CTA',
                x: 340,
                y: 1220,
                width: 400,
                height: 80,
                visible: true,
                locked: false,
                zIndex: 10,
                opacity: 1,
                rotation: 0,
                text: 'Mehr erfahren',
                fontFamily: 'Inter',
                fontSize: 20,
                fontWeight: 700,
                color: '#FFFFFF',
                bgColor: '#000000',
                radius: 40,
                role: 'cta'
            }
        ]
    },

    performance: {
        estimatedCTR: 3.8,
        conversionPotential: 'medium',
        knownGoodFor: ['social proof', 'ugc style', 'mobile-first']
    }
};

/**
 * Registry of all available template capsules
 * 
 * ✅ FIX 5: Excluded ADDITIONAL_TEMPLATES (registry-extended) because they have layers: []
 * These templates cannot work until layers are implemented.
 */
export const TEMPLATE_REGISTRY: TemplateCapsule[] = [
    // E-Commerce Standard
    ECOMMERCE_PRODUCT_FOCUS,
    ECOMMERCE_OFFER_BURST,
    ECOMMERCE_UGC_FRAME,

    // E-Commerce Premium / Feature
    ECOMMERCE_FEATURE_SCATTER,
    ECOMMERCE_RETAIL_LAUNCH,
    ECOMMERCE_NUTRITION_PROOF,
    ECOMMERCE_VEHICLE_RING,
    ECOMMERCE_EXPLODED_STACK,
    ECOMMERCE_LIFESTYLE_MATERIAL,

    // SaaS Premium
    SAAS_4_STEP_GRID,

    // ❌ EXCLUDED: registry-extended templates have empty layers
    // ...ADDITIONAL_TEMPLATES
].filter(t => t.document?.layers && t.document.layers.length > 0);  // ✅ Double-check filter

export const ALL_TEMPLATES = TEMPLATE_REGISTRY;

// Total: 10+ templates

/**
 * Get template by ID
 */
export function getTemplateById(id: string): TemplateCapsule | undefined {
    return TEMPLATE_REGISTRY.find(t => t.id === id);
}

/**
 * Get templates by business model
 */
export function getTemplatesByBusinessModel(
    businessModel: string
): TemplateCapsule[] {
    return TEMPLATE_REGISTRY.filter(t =>
        t.supportedBusinessModels.includes(businessModel as any)
    );
}

/**
 * Get templates by pattern
 */
export function getTemplatesByPattern(
    pattern: string
): TemplateCapsule[] {
    return TEMPLATE_REGISTRY.filter(t =>
        t.supportedPatterns.includes(pattern as any)
    );
}

/**
 * Get templates by ratio
 */
export function getTemplatesByRatio(
    ratio: '1:1' | '4:5' | '9:16'
): TemplateCapsule[] {
    return TEMPLATE_REGISTRY.filter(t => t.ratio === ratio);
}
