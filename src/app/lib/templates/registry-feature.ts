import type { TemplateCapsule } from './types';

/**
 * T_NEW: Feature Scatter / Product Anatomy
 * 
 * Central product hero with feature callouts scattered around.
 * Ideal for: supplement bottles, tech gadgets, complex products.
 * 
 * Layout:
 *      [Feature 1]       [Feature 2]
 *             [ PRODUCT ]
 *      [Feature 3]       [Feature 4]
 *              [ CTA ]
 */
export const ECOMMERCE_FEATURE_SCATTER: TemplateCapsule = {
    id: 'tmpl_feature_scatter_v1',
    name: 'Feature Scatter / Anatomy',
    ratio: '1:1',
    version: 1,

    supportedBusinessModels: ['ecommerce', 'saas'],
    supportedPatterns: [
        'ecommerce_benefit_stack',
        'ecommerce_product_focus'
    ],

    zones: [
        {
            id: 'hero',
            bbox: { x: 340, y: 340, width: 400, height: 400 }, // Dead center, slightly smaller to make room
            rules: { priority: 10 },
            contentType: 'image',
            layerId: 'product'
        },
        // Feature Top Left
        {
            id: 'secondary',
            bbox: { x: 50, y: 200, width: 300, height: 150 },
            rules: { maxChars: 60, priority: 8 },
            contentType: 'text',
            layerId: 'feature1'
        },
        // Feature Top Right
        {
            id: 'secondary',
            bbox: { x: 730, y: 200, width: 300, height: 150 },
            rules: { maxChars: 60, priority: 8 },
            contentType: 'text',
            layerId: 'feature2'
        },
        // Feature Bottom Left
        {
            id: 'secondary',
            bbox: { x: 50, y: 600, width: 300, height: 150 },
            rules: { maxChars: 60, priority: 7 },
            contentType: 'text',
            layerId: 'feature3'
        },
        // Feature Bottom Right
        {
            id: 'secondary',
            bbox: { x: 730, y: 600, width: 300, height: 150 },
            rules: { maxChars: 60, priority: 7 },
            contentType: 'text',
            layerId: 'feature4'
        },
        {
            id: 'cta',
            bbox: { x: 340, y: 850, width: 400, height: 100 },
            rules: { maxChars: 25, priority: 10 },
            contentType: 'text',
            layerId: 'cta'
        }
    ],

    requiredAssets: ['productCutout'],
    optionalAssets: ['offerBadge'],

    copyConstraints: {
        maxChars: {
            headline: 40, // Features act as headlines
            cta: 25
        },
        minFontSize: 24,
        hierarchyRules: {
            headlineShouldDominate: true,
            ctaShouldStandOut: true
        }
    },

    layoutConstraints: {
        safeMargins: { top: 50, right: 50, bottom: 50, left: 50 },
        minCTAWidth: 250,
        maxDensity: 8,
        minContrast: 7 // High contrast required for small text
    },

    stylingTokens: {
        paletteSlots: ['background', 'text', 'accent', 'line'],
        typographySlots: ['headlineFont', 'bodyFont']
    },

    document: {
        id: 'tmpl_feature_scatter_v1',
        name: 'Feature Scatter',
        width: 1080,
        height: 1080,
        backgroundColor: '#111111', // Dark by default as requested
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
                fill: '#111111',
                fit: 'cover'
            },
            {
                id: 'product',
                type: 'product',
                name: 'Product Hero',
                x: 340,
                y: 300,
                width: 400,
                height: 480, // Taller allowance
                visible: true,
                locked: false,
                zIndex: 10,
                opacity: 1,
                rotation: 0,
                src: '',
                fit: 'contain',
                role: 'product_image'
            },
            // Connecting Lines (Decorative)
            {
                id: 'line1', type: 'shape', name: 'Line TL', x: 250, y: 280, width: 100, height: 2, zIndex: 5, fill: '#FFFFFF', opacity: 0.3, visible: true, locked: true, rotation: 30
            },
            {
                id: 'line2', type: 'shape', name: 'Line TR', x: 730, y: 280, width: 100, height: 2, zIndex: 5, fill: '#FFFFFF', opacity: 0.3, visible: true, locked: true, rotation: -30
            },

            // Feature Texts
            {
                id: 'feature1',
                type: 'text',
                name: 'Feature 1',
                x: 50,
                y: 200,
                width: 300,
                height: 120,
                visible: true,
                locked: false,
                zIndex: 10,
                opacity: 1,
                rotation: 0,
                text: 'High Protein',
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: 32,
                color: '#FFFFFF',
                align: 'right',
                role: 'description'
            },
            {
                id: 'feature2',
                type: 'text',
                name: 'Feature 2',
                x: 730,
                y: 200,
                width: 300,
                height: 120,
                visible: true,
                locked: false,
                zIndex: 10,
                opacity: 1,
                rotation: 0,
                text: 'Zero Sugar',
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: 32,
                color: '#FFFFFF',
                align: 'left',
                role: 'description'
            },
            {
                id: 'feature3',
                type: 'text',
                name: 'Feature 3',
                x: 50,
                y: 500,
                width: 300,
                height: 120,
                visible: true,
                locked: false,
                zIndex: 10,
                opacity: 1,
                rotation: 0,
                text: 'Vegan Friendly',
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: 32,
                color: '#FFFFFF',
                align: 'right',
                role: 'description'
            },
            {
                id: 'feature4',
                type: 'text',
                name: 'Feature 4',
                x: 730,
                y: 500,
                width: 300,
                height: 120,
                visible: true,
                locked: false,
                zIndex: 10,
                opacity: 1,
                rotation: 0,
                text: 'Fast Absorption',
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: 32,
                color: '#FFFFFF',
                align: 'left',
                role: 'description'
            },
            {
                id: 'cta',
                type: 'cta',
                name: 'CTA Button',
                x: 340,
                y: 850,
                width: 400,
                height: 100,
                visible: true,
                locked: false,
                zIndex: 10,
                opacity: 1,
                rotation: 0,
                text: 'Shop Now',
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: 32,
                color: '#000000',
                bgColor: '#FFFFFF',
                radius: 50,
                role: 'cta'
            }
        ]
    }
};
