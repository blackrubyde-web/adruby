import type { TemplateCapsule } from './types';

// ============================================================================
// FEATURE CALLOUT DIAGRAM TEMPLATE
// Based on: YETI Cooler, Pureful Yoga Mat, Bilagone Dog Bags
// ============================================================================

/**
 * T_FEATURE_CALLOUT: Product Feature Diagram
 * 
 * Pattern: Centered Product + 4-6 Radial Feature Callouts with Dotted Lines
 * Ideal for: Physical products with multiple features to highlight
 * Reference Ads: YETI Roadie Cooler, Eco-Cork Yoga Mat, Evergreen Shorts
 */
export const ECOMMERCE_FEATURE_CALLOUT_DIAGRAM: TemplateCapsule = {
    id: 'tmpl_ecom_feature_callout_v1',
    name: 'Feature Callout Diagram',
    ratio: '1:1',
    version: 1,

    supportedBusinessModels: ['ecommerce'],
    supportedPatterns: ['ecommerce_product_focus', 'ecommerce_benefit_stack'],

    zones: [
        {
            id: 'headline',
            bbox: { x: 80, y: 40, width: 920, height: 160 },
            rules: { maxLines: 2, maxChars: 40, priority: 10 },
            contentType: 'text',
            layerId: 'headline'
        },
        {
            id: 'hero',
            bbox: { x: 290, y: 280, width: 500, height: 500 },
            rules: { priority: 10 },
            contentType: 'image',
            layerId: 'product'
        },
        // 6 Feature Callout positions (radial around product)
        { id: 'feature', bbox: { x: 60, y: 220, width: 200, height: 80 }, rules: {}, contentType: 'text', layerId: 'featureTopLeft' },
        { id: 'feature', bbox: { x: 820, y: 220, width: 200, height: 80 }, rules: {}, contentType: 'text', layerId: 'featureTopRight' },
        { id: 'feature', bbox: { x: 50, y: 480, width: 200, height: 80 }, rules: {}, contentType: 'text', layerId: 'featureLeft' },
        { id: 'feature', bbox: { x: 830, y: 480, width: 200, height: 80 }, rules: {}, contentType: 'text', layerId: 'featureRight' },
        { id: 'feature', bbox: { x: 60, y: 800, width: 200, height: 80 }, rules: {}, contentType: 'text', layerId: 'featureBottomLeft' },
        { id: 'feature', bbox: { x: 820, y: 800, width: 200, height: 80 }, rules: {}, contentType: 'text', layerId: 'featureBottomRight' },
        {
            id: 'footer',
            bbox: { x: 280, y: 940, width: 520, height: 100 },
            rules: { priority: 8 },
            contentType: 'text',
            layerId: 'brandFooter'
        }
    ],

    requiredAssets: ['productCutout'],
    optionalAssets: ['background'],

    copyConstraints: {
        maxChars: { headline: 40, cta: 30 },
        maxLines: { headline: 2 },
        minFontSize: 16
    },

    layoutConstraints: {
        safeMargins: { top: 40, right: 40, bottom: 40, left: 40 },
        minCTAWidth: 200,
        maxDensity: 8,
        minContrast: 3.5 // Lower for light backgrounds
    },

    stylingTokens: {
        paletteSlots: ['background', 'text', 'line'],
        typographySlots: ['headlineFont', 'bodyFont']
    },

    document: {
        id: 'tmpl_ecom_feature_callout_v1',
        name: 'Feature Callout Diagram',
        width: 1080,
        height: 1080,
        backgroundColor: '#B8D9DD', // Light blue like YETI

        layers: [
            // Background
            {
                id: 'bg',
                type: 'background',
                name: 'Background',
                x: 0, y: 0, width: 1080, height: 1080,
                visible: true, locked: true, zIndex: 0, opacity: 1, rotation: 0,
                src: '', fill: '#B8D9DD', fit: 'cover'
            },

            // Top Headline
            {
                id: 'headline',
                type: 'text',
                name: 'Headline',
                x: 80, y: 60, width: 920, height: 120,
                zIndex: 10, visible: true, locked: false, rotation: 0, opacity: 1,
                text: 'THE GOLD STANDARD',
                fontFamily: 'Inter', fontWeight: 300, fontSize: 48,
                color: '#FFFFFF', fill: '#FFFFFF', align: 'center',
                letterSpacing: 4,
                role: 'headline'
            },

            // Subheadline
            {
                id: 'subheadline',
                type: 'text',
                name: 'Subheadline',
                x: 300, y: 160, width: 480, height: 60,
                zIndex: 10, visible: true, locked: false, rotation: 0, opacity: 1,
                text: 'Premium Cooler',
                fontFamily: 'Inter', fontWeight: 400, fontSize: 28,
                color: '#FFFFFF', fill: '#FFFFFF', align: 'center',
                role: 'subheadline'
            },

            // Center Product Hero
            {
                id: 'product',
                type: 'product',
                name: 'Product Hero',
                x: 290, y: 280, width: 500, height: 500,
                zIndex: 20, visible: true, locked: false, rotation: 0, opacity: 1,
                src: '', fit: 'contain',
                role: 'product_image'
            },

            // FEATURE CALLOUT 1: Top Left
            {
                id: 'featureTopLeft',
                type: 'text',
                name: 'Feature Top Left',
                x: 60, y: 230, width: 200, height: 60,
                zIndex: 15, visible: true, locked: false, rotation: 0, opacity: 1,
                text: 'INSULATED FOR\\nCOLD-HOLDING\\nPOWER',
                fontFamily: 'Inter', fontWeight: 500, fontSize: 16,
                color: '#FFFFFF', fill: '#FFFFFF', align: 'right',
                lineHeight: 1.3,
                role: 'description'
            },
            // Connector  Line 1 (Dotted)
            {
                id: 'lineTopLeft',
                type: 'shape',
                name: 'Line Top Left',
                x: 270, y: 250, width: 50, height: 100,
                zIndex: 12, visible: true, locked: true, rotation: 0, opacity: 1,
                fill: 'transparent', stroke: '#FFFFFF', strokeWidth: 2,
                path: 'M 0 20 L 50 80' // Diagonal line
            },
            // Circle marker 1
            {
                id: 'circleTopLeft',
                type: 'shape',
                name: 'Circle Top Left',
                x: 315, y: 325, width: 16, height: 16,
                zIndex: 13, visible: true, locked: true, rotation: 0, opacity: 1,
                fill: 'transparent', stroke: '#FFFFFF', strokeWidth: 2,
                cornerRadius: 8 // Circle
            },

            // FEATURE CALLOUT 2: Top Right
            {
                id: 'featureTopRight',
                type: 'text',
                name: 'Feature Top Right',
                x: 820, y: 230, width: 200, height: 60,
                zIndex: 15, visible: true, locked: false, rotation: 0, opacity: 1,
                text: 'STRONG\\nLATCHES',
                fontFamily: 'Inter', fontWeight: 500, fontSize: 16,
                color: '#FFFFFF', fill: '#FFFFFF', align: 'left',
                lineHeight: 1.3,
                role: 'description'
            },
            // Connector Line 2
            {
                id: 'lineTopRight',
                type: 'shape',
                name: 'Line Top Right',
                x: 760, y: 250, width: 50, height: 100,
                zIndex: 12, visible: true, locked: true, rotation: 0, opacity: 1,
                fill: 'transparent', stroke: '#FFFFFF', strokeWidth: 2,
                path: 'M 50 20 L 0 80'
            },
            // Circle marker 2
            {
                id: 'circleTopRight',
                type: 'shape',
                name: 'Circle Top Right',
                x: 749, y: 325, width: 16, height: 16,
                zIndex: 13, visible: true, locked: true, rotation: 0, opacity: 1,
                fill: 'transparent', stroke: '#FFFFFF', strokeWidth: 2,
                cornerRadius: 8
            },

            // FEATURE CALLOUT 3: Left
            {
                id: 'featureLeft',
                type: 'text',
                name: 'Feature Left',
                x: 50, y: 490, width: 200, height: 60,
                zIndex: 15, visible: true, locked: false, rotation: 0, opacity: 1,
                text: 'BUILT TO LAST\\nYEARS',
                fontFamily: 'Inter', fontWeight: 500, fontSize: 16,
                color: '#FFFFFF', fill: '#FFFFFF', align: 'right',
                lineHeight: 1.3,
                role: 'description'
            },
            // Connector Line 3
            {
                id: 'lineLeft',
                type: 'shape',
                name: 'Line Left',
                x: 260, y: 510, width: 50, height: 20,
                zIndex: 12, visible: true, locked: true, rotation: 0, opacity: 1,
                fill: 'transparent', stroke: '#FFFFFF', strokeWidth: 2,
                path: 'M 0 10 L 50 10' // Horizontal
            },
            // Circle marker 3
            {
                id: 'circleLeft',
                type: 'shape',
                name: 'Circle Left',
                x: 302, y: 512, width: 16, height: 16,
                zIndex: 13, visible: true, locked: true, rotation: 0, opacity: 1,
                fill: 'transparent', stroke: '#FFFFFF', strokeWidth: 2,
                cornerRadius: 8
            },

            // FEATURE CALLOUT 4: Right
            {
                id: 'featureRight',
                type: 'text',
                name: 'Feature Right',
                x: 830, y: 490, width: 200, height: 60,
                zIndex: 15, visible: true, locked: false, rotation: 0, opacity: 1,
                text: 'REALLY GREAT\\nSTRAPS',
                fontFamily: 'Inter', fontWeight: 500, fontSize: 16,
                color: '#FFFFFF', fill: '#FFFFFF', align: 'left',
                lineHeight: 1.3,
                role: 'description'
            },
            // Connector Line 4
            {
                id: 'lineRight',
                type: 'shape',
                name: 'Line Right',
                x: 770, y: 510, width: 50, height: 20,
                zIndex: 12, visible: true, locked: true, rotation: 0, opacity: 1,
                fill: 'transparent', stroke: '#FFFFFF', strokeWidth: 2,
                path: 'M 50 10 L 0 10'
            },
            // Circle marker 4
            {
                id: 'circleRight',
                type: 'shape',
                name: 'Circle Right',
                x: 762, y: 512, width: 16, height: 16,
                zIndex: 13, visible: true, locked: true, rotation: 0, opacity: 1,
                fill: 'transparent', stroke: '#FFFFFF', strokeWidth: 2,
                cornerRadius: 8
            },

            // Brand Footer
            {
                id: 'brandFooter',
                type: 'text',
                name: 'Brand Footer',
                x: 280, y: 960, width: 520, height: 80,
                zIndex: 10, visible: true, locked: false, rotation: 0, opacity: 1,
                text: 'PREMIUM BRAND',
                fontFamily: 'Inter', fontWeight: 900, fontSize: 56,
                color: '#FFFFFF', fill: '#FFFFFF', align: 'center',
                role: 'cta'
            }
        ]
    }
};
