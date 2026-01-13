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

// ============================================================================
// PREMIUM VEHICLE / FEATURE RING TEMPLATE
// ============================================================================

/**
 * T_PREMIUM_3: Vehicle / Product Feature Ring
 * 
 * Pattern: Center Hero Product, Radial Feature Badges, Top Headline
 * Ideal for: Vehicle giveaways, complex machines, watch features, "Win this" campaigns
 */
export const ECOMMERCE_VEHICLE_RING: TemplateCapsule = {
    id: 'tmpl_ecom_vehicle_ring_v1',
    name: 'Product Feature Ring',
    ratio: '1:1',
    version: 1,

    supportedBusinessModels: ['ecommerce'],
    supportedPatterns: ['ecommerce_product_focus'],

    zones: [
        {
            id: 'headline',
            bbox: { x: 100, y: 50, width: 880, height: 180 },
            rules: { priority: 10 },
            contentType: 'text',
            layerId: 'headline'
        },
        {
            id: 'hero',
            bbox: { x: 260, y: 260, width: 560, height: 420 },
            rules: { priority: 10 },
            contentType: 'image',
            layerId: 'vehicle'
        },
        // 5 Radial Features
        { id: 'f1', bbox: { x: 100, y: 300, width: 140, height: 140 }, rules: {}, contentType: 'badge', layerId: 'feature1' },
        { id: 'f2', bbox: { x: 840, y: 300, width: 140, height: 140 }, rules: {}, contentType: 'badge', layerId: 'feature2' },
        { id: 'f3', bbox: { x: 50, y: 560, width: 140, height: 140 }, rules: {}, contentType: 'badge', layerId: 'feature3' },
        { id: 'f4', bbox: { x: 890, y: 560, width: 140, height: 140 }, rules: {}, contentType: 'badge', layerId: 'feature4' },
        { id: 'f5', bbox: { x: 470, y: 720, width: 140, height: 140 }, rules: {}, contentType: 'badge', layerId: 'feature5' },

        {
            id: 'cta',
            bbox: { x: 0, y: 940, width: 1080, height: 140 },
            rules: { priority: 9 },
            contentType: 'text',
            layerId: 'footerCTA'
        }
    ],

    requiredAssets: ['productCutout'],
    optionalAssets: [],

    copyConstraints: {
        maxChars: { headline: 30, cta: 40 },
        minFontSize: 24
    },

    layoutConstraints: {
        safeMargins: { top: 40, right: 20, bottom: 0, left: 20 },
        minCTAWidth: 400,
        maxDensity: 8,
        minContrast: 4.5
    },

    stylingTokens: {
        paletteSlots: ['background', 'text', 'accent', 'secondary'],
        typographySlots: ['headlineFont', 'bodyFont']
    },

    document: {
        id: 'tmpl_ecom_vehicle_ring_v1',
        name: 'Vehicle Feature Ring',
        width: 1080,
        height: 1080,
        backgroundColor: '#F2E1C6',
        layers: [
            { id: 'bg', type: 'background', name: 'BG', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, opacity: 1, rotation: 0, src: '', fill: '#F2E1C6', fit: 'cover' },

            // Headline
            {
                id: 'headline', type: 'text', name: 'Headline', x: 100, y: 60, width: 880, height: 140, zIndex: 10, visible: true, locked: false, rotation: 0, opacity: 1,
                text: 'WIN THIS BIKE', fontFamily: 'Inter', fontWeight: 900, fontSize: 96, color: '#5A3B2E', fill: '#5A3B2E', align: 'center', role: 'headline'
            },

            // Vehicle Hero
            {
                id: 'vehicle', type: 'product', name: 'Vehicle', x: 260, y: 260, width: 560, height: 420, zIndex: 5, visible: true, locked: false, rotation: 0, opacity: 1,
                src: '', fit: 'contain', role: 'product_image'
            },

            // Feature Badges (Circles with text)
            // F1 Top Left
            { id: 'f1bg', type: 'shape', name: 'F1 BG', x: 100, y: 300, width: 140, height: 140, zIndex: 6, fill: '#FFFFFF', stroke: '#5A3B2E', strokeWidth: 2, cornerRadius: 70, visible: true, locked: false },
            { id: 'f1txt', type: 'text', name: 'F1 Text', x: 110, y: 350, width: 120, height: 40, zIndex: 7, text: 'Custom\nPaint', fontSize: 24, align: 'center', fill: '#5A3B2E', visible: true, locked: false, role: 'description' },

            // F2 Top Right
            { id: 'f2bg', type: 'shape', name: 'F2 BG', x: 840, y: 300, width: 140, height: 140, zIndex: 6, fill: '#FFFFFF', stroke: '#5A3B2E', strokeWidth: 2, cornerRadius: 70, visible: true, locked: false },
            { id: 'f2txt', type: 'text', name: 'F2 Text', x: 850, y: 350, width: 120, height: 40, zIndex: 7, text: 'Turbo\nCharged', fontSize: 24, align: 'center', fill: '#5A3B2E', visible: true, locked: false, role: 'description' },

            // F3 Bottom Left
            { id: 'f3bg', type: 'shape', name: 'F3 BG', x: 50, y: 560, width: 140, height: 140, zIndex: 6, fill: '#FFFFFF', stroke: '#5A3B2E', strokeWidth: 2, cornerRadius: 70, visible: true, locked: false },
            { id: 'f3txt', type: 'text', name: 'F3 Text', x: 60, y: 610, width: 120, height: 40, zIndex: 7, text: 'Sport\nSeats', fontSize: 24, align: 'center', fill: '#5A3B2E', visible: true, locked: false, role: 'description' },

            // F4 Bottom Right
            { id: 'f4bg', type: 'shape', name: 'F4 BG', x: 890, y: 560, width: 140, height: 140, zIndex: 6, fill: '#FFFFFF', stroke: '#5A3B2E', strokeWidth: 2, cornerRadius: 70, visible: true, locked: false },
            { id: 'f4txt', type: 'text', name: 'F4 Text', x: 900, y: 610, width: 120, height: 40, zIndex: 7, text: 'Carbon\nFiber', fontSize: 24, align: 'center', fill: '#5A3B2E', visible: true, locked: false, role: 'description' },

            // F5 Bottom Center
            { id: 'f5bg', type: 'shape', name: 'F5 BG', x: 470, y: 720, width: 140, height: 140, zIndex: 6, fill: '#FFFFFF', stroke: '#5A3B2E', strokeWidth: 2, cornerRadius: 70, visible: true, locked: false },
            { id: 'f5txt', type: 'text', name: 'F5 Text', x: 480, y: 770, width: 120, height: 40, zIndex: 7, text: 'Limited\nEdition', fontSize: 24, align: 'center', fill: '#5A3B2E', visible: true, locked: false, role: 'description' },

            // Footer CTA
            { id: 'footerBg', type: 'shape', name: 'Footer', x: 0, y: 940, width: 1080, height: 140, zIndex: 8, fill: '#6A4A3C', visible: true, locked: true },
            { id: 'footerText', type: 'cta', name: 'Footer Text', x: 100, y: 980, width: 880, height: 60, zIndex: 9, text: 'ENTER TO WIN NOW', fontSize: 42, fontWeight: 700, fill: '#FFFFFF', align: 'center', visible: true, locked: false, role: 'cta' }
        ]
    }
};

// ============================================================================
// PREMIUM EXPLODED / UMBRELLA TEMPLATE
// ============================================================================

/**
 * T_PREMIUM_4: Product Exploded Features
 * 
 * Pattern: Left Product, Right Feature Stack with connecting lines
 * Ideal for: Umbrellas, Chairs, Tech Hardware, anything with parts
 */
export const ECOMMERCE_EXPLODED_STACK: TemplateCapsule = {
    id: 'tmpl_ecom_exploded_stack_v1',
    name: 'Exploded Feature Stack',
    ratio: '1:1',
    version: 1,

    supportedBusinessModels: ['ecommerce'],
    supportedPatterns: ['ecommerce_feature_stack'],

    zones: [
        { id: 'headline', bbox: { x: 120, y: 80, width: 840, height: 100 }, rules: {}, contentType: 'text', layerId: 'headline' },
        { id: 'product', bbox: { x: 80, y: 240, width: 520, height: 520 }, rules: {}, contentType: 'image', layerId: 'product' },
        // Stack Right
        { id: 'f1', bbox: { x: 660, y: 300, width: 300, height: 60 }, rules: {}, contentType: 'text', layerId: 'f1' },
        { id: 'f2', bbox: { x: 660, y: 440, width: 300, height: 60 }, rules: {}, contentType: 'text', layerId: 'f2' },
        { id: 'f3', bbox: { x: 660, y: 580, width: 300, height: 60 }, rules: {}, contentType: 'text', layerId: 'f3' },

        { id: 'cta', bbox: { x: 0, y: 940, width: 1080, height: 140 }, rules: {}, contentType: 'text', layerId: 'cta' }
    ],

    requiredAssets: ['productCutout'],
    optionalAssets: [],

    copyConstraints: { maxChars: { headline: 40 }, minFontSize: 24 },
    layoutConstraints: { safeMargins: { top: 60, right: 60, bottom: 60, left: 60 }, minCTAWidth: 400, maxDensity: 7, minContrast: 4.5 },
    stylingTokens: { paletteSlots: ['background', 'text', 'line'], typographySlots: ['headlineFont'] },

    document: {
        id: 'tmpl_ecom_exploded_stack_v1',
        name: 'Exploded Feature Stack',
        width: 1080, height: 1080, backgroundColor: '#F4FAF8',
        layers: [
            { id: 'bg', type: 'background', name: 'BG', x: 0, y: 0, width: 1080, height: 1080, src: '', fill: '#F4FAF8', visible: true, locked: true },
            // Headline
            { id: 'headline', type: 'text', name: 'Headline', x: 120, y: 80, width: 840, height: 100, text: 'BUILT TO LAST', fontSize: 64, fontWeight: 700, fill: '#004A3C', align: 'left', role: 'headline', visible: true, locked: false },

            // Product Left
            { id: 'product', type: 'product', name: 'Product', x: 80, y: 240, width: 520, height: 520, src: '', fit: 'contain', role: 'product_image', visible: true, locked: false },

            // Feature 1
            { id: 'f1', type: 'text', name: 'Feature 1', x: 660, y: 300, width: 300, height: 60, text: 'Windproof Frame', fontSize: 32, fontWeight: 600, fill: '#004A3C', align: 'left', role: 'description', visible: true, locked: false },
            // Line 1
            { id: 'l1', type: 'shape', name: 'Line 1', x: 500, y: 330, width: 140, height: 2, fill: '#004A3C', visible: true, locked: true },

            // Feature 2
            { id: 'f2', type: 'text', name: 'Feature 2', x: 660, y: 460, width: 300, height: 60, text: 'Compact Design', fontSize: 32, fontWeight: 600, fill: '#004A3C', align: 'left', role: 'description', visible: true, locked: false },
            // Line 2
            { id: 'l2', type: 'shape', name: 'Line 2', x: 520, y: 490, width: 120, height: 2, fill: '#004A3C', visible: true, locked: true },

            // Feature 3
            { id: 'f3', type: 'text', name: 'Feature 3', x: 660, y: 620, width: 300, height: 60, text: 'Lifetime Warranty', fontSize: 32, fontWeight: 600, fill: '#004A3C', align: 'left', role: 'description', visible: true, locked: false },
            // Line 3
            { id: 'l3', type: 'shape', name: 'Line 3', x: 500, y: 650, width: 140, height: 2, fill: '#004A3C', visible: true, locked: true },

            // Footer
            { id: 'footerBg', type: 'shape', name: 'Footer', x: 0, y: 940, width: 1080, height: 140, zIndex: 8, fill: '#004A3C', visible: true, locked: true },
            { id: 'footerText', type: 'cta', name: 'Footer Text', x: 100, y: 980, width: 880, height: 60, zIndex: 9, text: 'SHOP THE SALE', fontSize: 42, fontWeight: 700, fill: '#FFFFFF', align: 'center', visible: true, locked: false, role: 'cta' }
        ]
    }
};

// ============================================================================
// PREMIUM LIFESTYLE / MATERIAL TEMPLATE
// ============================================================================

/**
 * T_PREMIUM_5: Lifestyle Material Callout
 * 
 * Pattern: Full background lifestyle image, 1 key material callout with line
 * Ideal for: Phone cases, fashion, premium textures, "Made of X"
 */
export const ECOMMERCE_LIFESTYLE_MATERIAL: TemplateCapsule = {
    id: 'tmpl_ecom_lifestyle_material_v1',
    name: 'Lifestyle Material Focus',
    ratio: '1:1',
    version: 1,

    supportedBusinessModels: ['ecommerce'],
    supportedPatterns: ['ecommerce_ugc_frame'], // Maps loosely to UGC but uses annotation

    zones: [
        { id: 'hero', bbox: { x: 0, y: 0, width: 1080, height: 1080 }, rules: {}, contentType: 'image', layerId: 'lifestyle' }, // Full bg hero
        { id: 'material', bbox: { x: 680, y: 80, width: 340, height: 100 }, rules: {}, contentType: 'text', layerId: 'materialInfo' },
        { id: 'secondary', bbox: { x: 120, y: 880, width: 840, height: 120 }, rules: {}, contentType: 'text', layerId: 'secondaryClaim' }
    ],

    requiredAssets: ['lifestyleImage'], // Needs a specific lifestyle shot
    optionalAssets: [],

    copyConstraints: { maxChars: { headline: 20 }, minFontSize: 24 },
    layoutConstraints: { safeMargins: { top: 40 }, minCTAWidth: 0, maxDensity: 3, minContrast: 4.5 },
    stylingTokens: { paletteSlots: ['text', 'line'], typographySlots: ['bodyFont'] },

    document: {
        id: 'tmpl_ecom_lifestyle_material_v1',
        name: 'Lifestyle Material Focus',
        width: 1080, height: 1080, backgroundColor: '#EFE6DB',
        layers: [
            // Full Lifestyle Image
            { id: 'lifestyle', type: 'image', name: 'Lifestyle BG', x: 0, y: 0, width: 1080, height: 1080, src: '', fit: 'cover', role: 'product_image', visible: true, locked: false },

            // Overlay gradient for text readability bottom
            { id: 'grad', type: 'shape', name: 'Gradient', x: 0, y: 700, width: 1080, height: 380, fill: '#000000', opacity: 0.4, visible: true, locked: true },

            // Material Annotation Top Right
            { id: 'materialInfo', type: 'text', name: 'Material Info', x: 680, y: 80, width: 340, height: 80, text: 'Italian Leather', fontSize: 32, fontWeight: 600, fill: '#FFFFFF', align: 'right', role: 'description', visible: true, locked: false, shadowColor: '#000000', shadowBlur: 10 },

            // Annotation Line
            { id: 'line', type: 'shape', name: 'Pointer', x: 600, y: 130, width: 100, height: 150, zIndex: 10, fill: 'transparent', stroke: '#FFFFFF', strokeWidth: 3, path: 'M 100 -20 L 0 100', visible: true, locked: true, shadowColor: '#000000', shadowBlur: 5 },

            // Bottom Claim
            { id: 'secondaryClaim', type: 'text', name: 'Claim', x: 120, y: 920, width: 840, height: 80, text: 'Feel the difference.', fontSize: 48, fontWeight: 700, fill: '#FFFFFF', align: 'center', role: 'headline', visible: true, locked: false }
        ]
    }
};

// ============================================================================
// PREMIUM SAAS / 4-STEP GRID TEMPLATE
// ============================================================================

/**
 * T_PREMIUM_6: SaaS 4-Step Grid
 * 
 * Pattern: 2x2 Grid of values/steps, Center Product cut, Top Hook
 * Ideal for: Subscription boxes, SaaS workflows, "How it works"
 */
export const SAAS_4_STEP_GRID: TemplateCapsule = {
    id: 'tmpl_saas_4_step_grid_v1',
    name: 'SaaS 4-Step Grid',
    ratio: '1:1',
    version: 1,

    supportedBusinessModels: ['saas', 'ecommerce'], // Works for both
    supportedPatterns: ['saas_feature_grid'],

    zones: [
        { id: 'headline', bbox: { x: 150, y: 50, width: 780, height: 100 }, rules: {}, contentType: 'text', layerId: 'headline' },
        { id: 's1', bbox: { x: 100, y: 200, width: 400, height: 300 }, rules: {}, contentType: 'text', layerId: 'step1' },
        { id: 's2', bbox: { x: 580, y: 200, width: 400, height: 300 }, rules: {}, contentType: 'text', layerId: 'step2' },
        { id: 's3', bbox: { x: 100, y: 600, width: 400, height: 300 }, rules: {}, contentType: 'text', layerId: 'step3' },
        { id: 's4', bbox: { x: 580, y: 600, width: 400, height: 300 }, rules: {}, contentType: 'text', layerId: 'step4' },
        // Center product overlap
        { id: 'product', bbox: { x: 440, y: 400, width: 200, height: 400 }, rules: {}, contentType: 'image', layerId: 'product' }
    ],

    requiredAssets: ['productCutout'], // Should be tall/vertical product ideally
    optionalAssets: [],

    copyConstraints: { maxChars: { headline: 40 }, minFontSize: 24 },
    layoutConstraints: { safeMargins: { top: 40 }, minCTAWidth: 0, maxDensity: 8, minContrast: 4.5 },
    stylingTokens: { paletteSlots: ['background', 'text'], typographySlots: ['headlineFont'] },

    document: {
        id: 'tmpl_saas_4_step_grid_v1',
        name: 'SaaS 4-Step Grid',
        width: 1080, height: 1080, backgroundColor: '#7B7FEF',
        layers: [
            { id: 'bg', type: 'background', name: 'BG', x: 0, y: 0, width: 1080, height: 1080, src: '', fill: '#7B7FEF', visible: true, locked: true },

            { id: 'headline', type: 'text', name: 'Headline', x: 100, y: 50, width: 880, height: 120, text: 'YOUR SKINCARE ROUTINE', fontSize: 56, fontWeight: 900, fill: '#FFFFFF', align: 'center', role: 'headline', visible: true, locked: false },

            // Cells (Visual bg boxes for contrast)
            { id: 'c1', type: 'shape', name: 'Cell 1', x: 60, y: 200, width: 460, height: 380, fill: '#FFFFFF', opacity: 0.1, cornerRadius: 20, visible: true, locked: true },
            { id: 'c2', type: 'shape', name: 'Cell 2', x: 560, y: 200, width: 460, height: 380, fill: '#FFFFFF', opacity: 0.1, cornerRadius: 20, visible: true, locked: true },
            { id: 'c3', type: 'shape', name: 'Cell 3', x: 60, y: 620, width: 460, height: 380, fill: '#FFFFFF', opacity: 0.1, cornerRadius: 20, visible: true, locked: true },
            { id: 'c4', type: 'shape', name: 'Cell 4', x: 560, y: 620, width: 460, height: 380, fill: '#FFFFFF', opacity: 0.1, cornerRadius: 20, visible: true, locked: true },

            // Step Text
            { id: 't1', type: 'text', name: 'Step 1', x: 80, y: 240, width: 420, height: 100, text: '1. Cleanse', fontSize: 32, fontWeight: 700, fill: '#FFFFFF', align: 'left', role: 'description', visible: true, locked: false },
            { id: 't2', type: 'text', name: 'Step 2', x: 580, y: 240, width: 420, height: 100, text: '2. Treat', fontSize: 32, fontWeight: 700, fill: '#FFFFFF', align: 'right', role: 'description', visible: true, locked: false },
            { id: 't3', type: 'text', name: 'Step 3', x: 80, y: 660, width: 420, height: 100, text: '3. Moisturize', fontSize: 32, fontWeight: 700, fill: '#FFFFFF', align: 'left', role: 'description', visible: true, locked: false },
            { id: 't4', type: 'text', name: 'Step 4', x: 580, y: 660, width: 420, height: 100, text: '4. Protect', fontSize: 32, fontWeight: 700, fill: '#FFFFFF', align: 'right', role: 'description', visible: true, locked: false },

            // Center Product (Overlapping)
            { id: 'product', type: 'product', name: 'Center Product', x: 440, y: 340, width: 200, height: 500, src: '', fit: 'contain', role: 'product_image', visible: true, locked: false, shadowColor: '#000000', shadowBlur: 20, shadowOpacity: 0.3 }
        ]
    }
};
