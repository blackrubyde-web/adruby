import type { TemplateCapsule } from './types';

// ============================================================================
// PREMIUM RETAIL LAUNCH TEMPLATE
// ============================================================================

/**
 * T_PREMIUM_1: Retail Launch / Announcement
 * 
 * Pattern: Left headline, Horizontal Packshot, Feature Arrows, Circle CTA
 * Ideal for: "Now in Stores", "New Flavor Drop", "Limited Edition"
 */
export const ECOMMERCE_RETAIL_LAUNCH: TemplateCapsule = {
    id: 'tmpl_ecom_retail_launch_v1',
    name: 'Retail Launch Announcement',
    ratio: '1:1',
    version: 1,

    supportedBusinessModels: ['ecommerce'],
    supportedPatterns: ['ecommerce_offer_burst', 'ecommerce_product_focus'],

    zones: [
        {
            id: 'hero',
            bbox: { x: 180, y: 600, width: 720, height: 250 },
            rules: { priority: 10 },
            contentType: 'image',
            layerId: 'product'
        },
        {
            id: 'headline',
            bbox: { x: 90, y: 120, width: 600, height: 300 },
            rules: { maxLines: 3, maxChars: 40, priority: 10 },
            contentType: 'text',
            layerId: 'headline'
        },
        {
            id: 'featureLeft',
            bbox: { x: 50, y: 500, width: 300, height: 100 },
            rules: { maxChars: 40, priority: 8 },
            contentType: 'text',
            layerId: 'featureLeft'
        },
        {
            id: 'featureRight',
            bbox: { x: 730, y: 500, width: 300, height: 100 },
            rules: { maxChars: 40, priority: 8 },
            contentType: 'text',
            layerId: 'featureRight'
        },
        {
            id: 'cta',
            bbox: { x: 760, y: 820, width: 380, height: 380 }, // Large circle area
            rules: { maxChars: 15, priority: 10 },
            contentType: 'text',
            layerId: 'ctaText'
        }
    ],

    requiredAssets: ['productCutout'],
    optionalAssets: [],

    copyConstraints: {
        maxChars: { headline: 40, cta: 15 },
        minFontSize: 24,
        hierarchyRules: { headlineShouldDominate: true }
    },

    layoutConstraints: {
        safeMargins: { top: 60, right: 60, bottom: 60, left: 60 },
        minCTAWidth: 200,
        maxDensity: 7,
        minContrast: 4.5
    },

    stylingTokens: {
        paletteSlots: ['background', 'text', 'accent', 'cta'],
        typographySlots: ['headlineFont', 'bodyFont']
    },

    document: {
        id: 'tmpl_ecom_retail_launch_v1',
        name: 'Retail Launch',
        width: 1080,
        height: 1080,
        backgroundColor: '#F6B23A',
        layers: [
            // Background Gradient (Simulated by simple bg for now, typically assets handle complex grads)
            {
                id: 'bg',
                type: 'background',
                name: 'Background',
                x: 0, y: 0, width: 1080, height: 1080,
                visible: true, locked: true, zIndex: 0, opacity: 1, rotation: 0,
                src: '', fill: '#F6B23A', fit: 'cover'
            },

            // Headline
            {
                id: 'headline',
                type: 'text',
                name: 'Headline',
                x: 90, y: 120, width: 600, height: 300,
                zIndex: 10, visible: true, locked: false, rotation: 0, opacity: 1,
                text: 'NOW IN\nYOUR STORE',
                fontFamily: 'Inter', fontWeight: 900, fontSize: 92,
                color: '#FFFFFF', fill: '#FFFFFF', align: 'left',
                lineHeight: 1.05,
                role: 'headline'
            },

            // Feature Left
            {
                id: 'featureLeft',
                type: 'text',
                name: 'Feature Left',
                x: 90, y: 520, width: 300, height: 80,
                zIndex: 10, visible: true, locked: false, rotation: 0, opacity: 1,
                text: 'Zero Sugar',
                fontFamily: 'Inter', fontWeight: 600, fontSize: 32,
                color: '#FFFFFF', fill: '#FFFFFF', align: 'left',
                role: 'description'
            },
            // Arrow Left (Curved Path)
            {
                id: 'arrowLeft',
                type: 'shape',
                name: 'Arrow Left',
                x: 300, y: 530, width: 150, height: 100,
                zIndex: 5, visible: true, locked: true, rotation: 0, opacity: 1,
                fill: 'transparent', stroke: '#FFFFFF', strokeWidth: 4,
                path: 'M 0 20 Q 75 0 100 80', // Approximate curve
            },

            // Feature Right
            {
                id: 'featureRight',
                type: 'text',
                name: 'Feature Right',
                x: 690, y: 520, width: 300, height: 80,
                zIndex: 10, visible: true, locked: false, rotation: 0, opacity: 1,
                text: 'Best Flavor',
                fontFamily: 'Inter', fontWeight: 600, fontSize: 32,
                color: '#FFFFFF', fill: '#FFFFFF', align: 'right',
                role: 'description'
            },
            // Arrow Right (Curved Path)
            {
                id: 'arrowRight',
                type: 'shape',
                name: 'Arrow Right',
                x: 630, y: 530, width: 150, height: 100,
                zIndex: 5, visible: true, locked: true, rotation: 0, opacity: 1,
                fill: 'transparent', stroke: '#FFFFFF', strokeWidth: 4,
                path: 'M 150 20 Q 75 0 50 80', // Approximate curve
            },

            // Purpose Claim
            {
                id: 'purpose',
                type: 'text',
                name: 'Purpose Claim',
                x: 390, y: 820, width: 300, height: 80,
                zIndex: 10, visible: true, locked: false, rotation: 0, opacity: 1,
                text: 'You buy one.\nWe give back.',
                fontFamily: 'Inter', fontWeight: 600, fontSize: 28,
                color: '#FFFFFF', fill: '#FFFFFF', align: 'center',
                role: 'subheadline'
            },
            // Purpose Arrow
            {
                id: 'arrowPurpose',
                type: 'shape',
                name: 'Arrow Purpose',
                x: 520, y: 760, width: 40, height: 60,
                zIndex: 5, visible: true, locked: true, rotation: 0, opacity: 1,
                fill: 'transparent', stroke: '#FFFFFF', strokeWidth: 4,
                path: 'M 20 60 L 20 0', // Straight up
            },

            // Product Hero (Horizontal)
            {
                id: 'product',
                type: 'product',
                name: 'Product Hero',
                x: 180, y: 600, width: 720, height: 200,
                zIndex: 20, visible: true, locked: false, rotation: 0, opacity: 1,
                src: '', fit: 'contain',
                role: 'product_image'
            },

            // CTA Circle (Corner)
            {
                id: 'ctaShape',
                type: 'shape',
                name: 'CTA Circle',
                x: 760, y: 820, width: 380, height: 380,
                zIndex: 30, visible: true, locked: false, rotation: 0, opacity: 1,
                fill: '#F05A00', cornerRadius: 190, // Circle
            },
            {
                id: 'ctaText',
                type: 'cta',
                name: 'CTA Text',
                x: 800, y: 920, width: 280, height: 120,
                zIndex: 31, visible: true, locked: false, rotation: 0, opacity: 1,
                text: 'JETZT\nTESTEN',
                fontFamily: 'Inter', fontWeight: 900, fontSize: 44,
                color: '#FFFFFF', fill: '#FFFFFF', align: 'center', lineHeight: 1.1,
                bgColor: 'transparent', // Text only, shape is separate
                role: 'cta'
            }
        ]
    }
};

// ============================================================================
// PREMIUM NUTRITION PROOF TEMPLATE
// ============================================================================

/**
 * T_PREMIUM_2: Radial Nutrition Proof
 * 
 * Pattern: Center product (hand-held style), 4 radial metric callouts
 * Ideal for: Huel, AG1, Protein Shakes
 */
export const ECOMMERCE_NUTRITION_PROOF: TemplateCapsule = {
    id: 'tmpl_ecom_nutrition_proof_v1',
    name: 'Nutrition Radial Proof',
    ratio: '1:1',
    version: 1,

    supportedBusinessModels: ['ecommerce'],
    supportedPatterns: ['ecommerce_benefit_stack', 'ecommerce_product_focus'],

    zones: [
        {
            id: 'hero',
            bbox: { x: 390, y: 260, width: 300, height: 520 },
            rules: { priority: 10 },
            contentType: 'image',
            layerId: 'product'
        },
        // 4 Metrics
        { id: 'm1', bbox: { x: 50, y: 360, width: 250, height: 100 }, rules: {}, contentType: 'text', layerId: 'metric1' },
        { id: 'm2', bbox: { x: 50, y: 520, width: 250, height: 100 }, rules: {}, contentType: 'text', layerId: 'metric2' },
        { id: 'm3', bbox: { x: 780, y: 360, width: 250, height: 100 }, rules: {}, contentType: 'text', layerId: 'metric3' },
        { id: 'm4', bbox: { x: 780, y: 520, width: 250, height: 100 }, rules: {}, contentType: 'text', layerId: 'metric4' },
    ],

    requiredAssets: ['productCutout'],
    optionalAssets: [],

    copyConstraints: {
        maxChars: { headline: 30 },
        minFontSize: 20
    },

    layoutConstraints: {
        safeMargins: { top: 40, right: 40, bottom: 40, left: 40 },
        minCTAWidth: 200,
        maxDensity: 6,
        minContrast: 4.5
    },

    stylingTokens: {
        paletteSlots: ['background', 'text', 'line'],
        typographySlots: ['headlineFont', 'bodyFont']
    },

    document: {
        id: 'tmpl_ecom_nutrition_proof_v1',
        name: 'Nutrition Radial Proof',
        width: 1080,
        height: 1080,
        backgroundColor: '#FFFFFF',
        layers: [
            {
                id: 'bg', type: 'background', name: 'BG', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, opacity: 1, rotation: 0, src: '', fill: '#FFFFFF', fit: 'cover'
            },
            // Top Headline
            {
                id: 'headline', type: 'text', name: 'Headline', x: 80, y: 60, width: 920, height: 180, zIndex: 10, visible: true, locked: false, rotation: 0, opacity: 1,
                text: 'COMPLETE\nNUTRITION', fontFamily: 'Inter', fontWeight: 900, fontSize: 80, color: '#FFFFFF', fill: '#FFFFFF', align: 'left', lineHeight: 1.0,
                role: 'headline'
            },
            // Black bg for headline
            {
                id: 'headlineBg', type: 'shape', name: 'Headline BG', x: 60, y: 50, width: 600, height: 200, zIndex: 9, visible: true, locked: false, rotation: 0, opacity: 1,
                fill: '#000000', cornerRadius: 0
            },

            // Product
            {
                id: 'product', type: 'product', name: 'Product', x: 390, y: 260, width: 300, height: 520, zIndex: 20, visible: true, locked: false, rotation: 0, opacity: 1,
                src: '', fit: 'contain', role: 'product_image'
            },

            // Metrics Left
            { id: 'm1', type: 'text', name: 'Metric 1', x: 50, y: 360, width: 250, height: 80, zIndex: 10, visible: true, locked: false, rotation: 0, opacity: 1, text: '20g\nProtein', fontSize: 36, fontWeight: 700, fontFamily: 'Inter', align: 'right', fill: '#000000', role: 'description' },
            { id: 'm2', type: 'text', name: 'Metric 2', x: 50, y: 520, width: 250, height: 80, zIndex: 10, visible: true, locked: false, rotation: 0, opacity: 1, text: '26\nVits', fontSize: 36, fontWeight: 700, fontFamily: 'Inter', align: 'right', fill: '#000000', role: 'description' },

            // Metrics Right
            { id: 'm3', type: 'text', name: 'Metric 3', x: 780, y: 360, width: 250, height: 80, zIndex: 10, visible: true, locked: false, rotation: 0, opacity: 1, text: '1g\nSugar', fontSize: 36, fontWeight: 700, fontFamily: 'Inter', align: 'left', fill: '#000000', role: 'description' },
            { id: 'm4', type: 'text', name: 'Metric 4', x: 780, y: 520, width: 250, height: 80, zIndex: 10, visible: true, locked: false, rotation: 0, opacity: 1, text: 'Low\nCarb', fontSize: 36, fontWeight: 700, fontFamily: 'Inter', align: 'left', fill: '#000000', role: 'description' },

            // Connectors (Arrows)
            { id: 'c1', type: 'shape', name: 'Conn 1', x: 280, y: 380, width: 100, height: 40, zIndex: 5, fill: 'transparent', stroke: '#000000', strokeWidth: 3, path: 'M 0 20 Q 50 20 100 60', visible: true, locked: true, rotation: 0, opacity: 1 },
            { id: 'c2', type: 'shape', name: 'Conn 2', x: 280, y: 540, width: 100, height: 40, zIndex: 5, fill: 'transparent', stroke: '#000000', strokeWidth: 3, path: 'M 0 20 Q 50 20 100 -20', visible: true, locked: true, rotation: 0, opacity: 1 },
            { id: 'c3', type: 'shape', name: 'Conn 3', x: 700, y: 380, width: 100, height: 40, zIndex: 5, fill: 'transparent', stroke: '#000000', strokeWidth: 3, path: 'M 100 20 Q 50 20 0 60', visible: true, locked: true, rotation: 0, opacity: 1 },
            { id: 'c4', type: 'shape', name: 'Conn 4', x: 700, y: 540, width: 100, height: 40, zIndex: 5, fill: 'transparent', stroke: '#000000', strokeWidth: 3, path: 'M 100 20 Q 50 20 0 -20', visible: true, locked: true, rotation: 0, opacity: 1 },

            // Price Strip Bottom
            {
                id: 'priceStrip', type: 'shape', name: 'Price Strip', x: 0, y: 880, width: 1080, height: 120, zIndex: 8, visible: true, locked: true, rotation: 0, opacity: 1,
                fill: '#000000'
            },
            {
                id: 'priceText', type: 'text', name: 'Price', x: 60, y: 910, width: 960, height: 80, zIndex: 9, visible: true, locked: false, rotation: 0, opacity: 1,
                text: 'STARTING AT $1.50 / MEAL', fontSize: 42, fontWeight: 700, fontFamily: 'Inter', align: 'center', fill: '#FFFFFF', role: 'cta'
            }
        ]
    }
};
