import type { AdDocument, StudioLayer } from '../../types/studio';

/**
 * DYNAMIC TEMPLATE GENERATOR V2
 * Algorithmically generates unique layouts instead of static presets
 * 
 * Features:
 * - Golden Ratio layout calculation
 * - Color Harmony algorithms (Complementary, Monochromatic, Triadic)
 * - Smart Font Pairing based on mood
 * - Z-Pattern reading flow optimization
 */

export interface VisualStyle {
    id: string;
    name: 'minimal' | 'bold' | 'luxury' | 'playful' | 'editorial';
    colorPalette: ColorPalette;
    typography: TypographyConfig;
    composition: CompositionStyle;
}

export interface ColorPalette {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    scheme: 'complementary' | 'monochromatic' | 'triadic' | 'analogous';
}

export interface TypographyConfig {
    heading: FontConfig;
    body: FontConfig;
    contrast: 'subtle' | 'strong' | 'extreme';
}

export interface FontConfig {
    family: string;
    weight: number;
    size: number;
    lineHeight: number;
    letterSpacing: number;
}

export interface CompositionStyle {
    layout: 'centered' | 'asymmetric' | 'grid' | 'diagonal';
    whitespace: 'tight' | 'balanced' | 'airy';
    hierarchy: 'flat' | 'moderate' | 'dramatic';
}

// Professional Font Pairings (Heading + Body)
const FONT_PAIRINGS: Record<string, { heading: string; body: string }> = {
    professional: { heading: 'Inter', body: 'Inter' },
    luxury: { heading: 'Playfair Display', body: 'Lato' },
    bold: { heading: 'Bebas Neue', body: 'Roboto' },
    playful: { heading: 'Poppins', body: 'Nunito' },
    minimal: { heading: 'Outfit', body: 'Inter' },
    editorial: { heading: 'Merriweather', body: 'Source Sans Pro' }
};

/**
 * Generate color palette using color harmony algorithms
 */
export function generateColorHarmony(
    baseColor: string,
    style: VisualStyle['name']
): ColorPalette {
    const base = hexToHSL(baseColor);

    let scheme: ColorPalette['scheme'];
    let colors: { h: number; s: number; l: number }[];

    switch (style) {
        case 'luxury':
            // Monochromatic with gold accents
            scheme = 'monochromatic';
            colors = [
                base,
                { h: base.h, s: base.s * 0.6, l: base.l * 1.2 },
                { h: 45, s: 80, l: 50 }, // Gold accent
                { h: base.h, s: base.s * 0.3, l: 95 },
                { h: base.h, s: base.s, l: 20 }
            ];
            break;

        case 'bold':
            // Complementary (opposite on color wheel)
            scheme = 'complementary';
            colors = [
                base,
                { h: (base.h + 180) % 360, s: base.s, l: base.l }, // Complement
                { h: (base.h + 30) % 360, s: 90, l: 55 }, // Vibrant accent
                { h: 0, s: 0, l: 10 }, // Near-black
                { h: 0, s: 0, l: 98 }
            ];
            break;

        case 'playful':
            // Triadic (evenly spaced on color wheel)
            scheme = 'triadic';
            colors = [
                base,
                { h: (base.h + 120) % 360, s: base.s, l: base.l },
                { h: (base.h + 240) % 360, s: base.s, l: base.l },
                { h: base.h, s: 20, l: 95 },
                { h: base.h, s: base.s, l: 25 }
            ];
            break;

        case 'minimal':
            // Monochromatic with subtle variation
            scheme = 'monochromatic';
            colors = [
                { h: 0, s: 0, l: 20 }, // Charcoal primary
                { h: 0, s: 0, l: 60 }, // Mid-gray
                base, // User's brand color as accent
                { h: 0, s: 0, l: 98 }, // Off-white
                { h: 0, s: 0, l: 15 }
            ];
            break;

        case 'editorial':
            // Analogous (adjacent colors)
            scheme = 'analogous';
            colors = [
                base,
                { h: (base.h + 30) % 360, s: base.s * 0.8, l: base.l },
                { h: (base.h - 30 + 360) % 360, s: base.s * 0.8, l: base.l },
                { h: base.h, s: 10, l: 96 },
                { h: base.h, s: base.s, l: 18 }
            ];
            break;

        default:
            colors = [base, base, base, { h: 0, s: 0, l: 95 }, { h: 0, s: 0, l: 20 }];
            scheme = 'monochromatic';
    }

    return {
        primary: hslToHex(colors[0]),
        secondary: hslToHex(colors[1]),
        accent: hslToHex(colors[2]),
        background: hslToHex(colors[3]),
        text: hslToHex(colors[4]),
        scheme
    };
}

/**
 * Select optimal font pairing based on mood
 */
export function selectFontPairing(
    tone: string,
    contrast: 'subtle' | 'strong' | 'extreme'
): TypographyConfig {
    const pairing = FONT_PAIRINGS[tone] || FONT_PAIRINGS.professional;

    // Contrast determines size difference between heading and body
    const sizeMultipliers = {
        subtle: { heading: 2.0, body: 1.0 },
        strong: { heading: 3.5, body: 1.0 },
        extreme: { heading: 5.0, body: 1.0 }
    };

    const multiplier = sizeMultipliers[contrast];

    return {
        heading: {
            family: pairing.heading,
            weight: tone === 'luxury' ? 400 : tone === 'bold' ? 900 : 700,
            size: 64 * multiplier.heading,
            lineHeight: 1.1,
            letterSpacing: tone === 'luxury' ? 0.05 : tone === 'minimal' ? -0.02 : 0
        },
        body: {
            family: pairing.body,
            weight: 400,
            size: 18 * multiplier.body,
            lineHeight: 1.5,
            letterSpacing: 0
        },
        contrast
    };
}

/**
 * Calculate optimal layout positions using Golden Ratio and Z-pattern
 */
export function calculateLayout(
    style: VisualStyle['name'],
    canvasWidth: number = 1080,
    canvasHeight: number = 1350
): {
    headline: { x: number; y: number; width: number; height: number };
    subheadline: { x: number; y: number; width: number; height: number };
    product: { x: number; y: number; width: number; height: number };
    cta: { x: number; y: number; width: number; height: number };
    badge?: { x: number; y: number; width: number; height: number };
} {
    const GOLDEN_RATIO = 1.618;
    const padding = canvasWidth * 0.05; // 5% padding

    switch (style) {
        case 'luxury':
            // Centered, symmetrical, generous whitespace
            return {
                headline: {
                    x: padding,
                    y: canvasHeight * 0.15,
                    width: canvasWidth - padding * 2,
                    height: 180
                },
                subheadline: {
                    x: padding * 2,
                    y: canvasHeight * 0.35,
                    width: canvasWidth - padding * 4,
                    height: 100
                },
                product: {
                    x: canvasWidth * 0.2,
                    y: canvasHeight * 0.5,
                    width: canvasWidth * 0.6,
                    height: canvasHeight * 0.35
                },
                cta: {
                    x: padding * 3,
                    y: canvasHeight * 0.88,
                    width: canvasWidth - padding * 6,
                    height: 70
                }
            };

        case 'bold':
            // Diagonal, asymmetric, high energy
            return {
                headline: {
                    x: padding,
                    y: canvasHeight * 0.08,
                    width: canvasWidth * 0.7,
                    height: 200
                },
                subheadline: {
                    x: canvasWidth * 0.55,
                    y: canvasHeight * 0.25,
                    width: canvasWidth * 0.4,
                    height: 80
                },
                product: {
                    x: 0,
                    y: canvasHeight * 0.35,
                    width: canvasWidth * 0.8,
                    height: canvasHeight * 0.45
                },
                cta: {
                    x: canvasWidth * 0.6,
                    y: canvasHeight * 0.85,
                    width: 350,
                    height: 85
                },
                badge: {
                    x: canvasWidth * 0.05,
                    y: canvasHeight * 0.05,
                    width: 150,
                    height: 150
                }
            };

        case 'minimal':
            // Grid-based, balanced whitespace
            const gridUnit = canvasWidth / 12;
            return {
                headline: {
                    x: gridUnit,
                    y: canvasHeight * 0.12,
                    width: gridUnit * 10,
                    height: 140
                },
                subheadline: {
                    x: gridUnit,
                    y: canvasHeight * 0.28,
                    width: gridUnit * 8,
                    height: 60
                },
                product: {
                    x: gridUnit,
                    y: canvasHeight * 0.42,
                    width: gridUnit * 10,
                    height: canvasHeight * 0.38
                },
                cta: {
                    x: gridUnit * 2,
                    y: canvasHeight * 0.88,
                    width: gridUnit * 8,
                    height: 65
                }
            };

        case 'playful':
            // Scattered, organic, fun
            return {
                headline: {
                    x: padding * 1.5,
                    y: canvasHeight * 0.1,
                    width: canvasWidth * 0.8,
                    height: 160
                },
                subheadline: {
                    x: padding * 2.5,
                    y: canvasHeight * 0.27,
                    width: canvasWidth * 0.7,
                    height: 90
                },
                product: {
                    x: canvasWidth * 0.1,
                    y: canvasHeight * 0.4,
                    width: canvasWidth * 0.8,
                    height: canvasHeight * 0.4
                },
                cta: {
                    x: padding * 2,
                    y: canvasHeight * 0.86,
                    width: canvasWidth - padding * 4,
                    height: 75
                }
            };

        case 'editorial':
            // Classic Z-pattern, magazine-style
            return {
                headline: {
                    x: padding * 1.2,
                    y: canvasHeight * 0.1,
                    width: canvasWidth - padding * 2.4,
                    height: 150
                },
                subheadline: {
                    x: padding * 1.2,
                    y: canvasHeight * 0.26,
                    width: canvasWidth * 0.65,
                    height: 70
                },
                product: {
                    x: canvasWidth * 0.15,
                    y: canvasHeight * 0.38,
                    width: canvasWidth * 0.7,
                    height: canvasHeight * 0.42
                },
                cta: {
                    x: canvasWidth * 0.65,
                    y: canvasHeight * 0.87,
                    width: canvasWidth * 0.3,
                    height: 60
                }
            };

        default:
            return calculateLayout('minimal', canvasWidth, canvasHeight);
    }
}

/**
 * Generate complete visual style configuration
 */
export function generateVisualStyle(
    brandColor: string,
    tone: string,
    styleName: VisualStyle['name']
): VisualStyle {
    const colorPalette = generateColorHarmony(brandColor, styleName);
    const typography = selectFontPairing(tone, styleName === 'luxury' ? 'subtle' : styleName === 'bold' ? 'extreme' : 'strong');

    const compositionStyles: Record<VisualStyle['name'], CompositionStyle> = {
        minimal: { layout: 'grid', whitespace: 'airy', hierarchy: 'moderate' },
        bold: { layout: 'diagonal', whitespace: 'tight', hierarchy: 'dramatic' },
        luxury: { layout: 'centered', whitespace: 'airy', hierarchy: 'flat' },
        playful: { layout: 'asymmetric', whitespace: 'balanced', hierarchy: 'moderate' },
        editorial: { layout: 'grid', whitespace: 'balanced', hierarchy: 'moderate' }
    };

    return {
        id: `style_${styleName}_${Date.now()}`,
        name: styleName,
        colorPalette,
        typography,
        composition: compositionStyles[styleName]
    };
}

/**
 * Generate complete AdDocument template dynamically
 */
export function generateDynamicTemplate(params: {
    tone: string;
    visualStyle: VisualStyle['name'];
    brandColor: string;
    productCategory?: string;
}): AdDocument {
    const style = generateVisualStyle(params.brandColor, params.tone, params.visualStyle);
    const layout = calculateLayout(params.visualStyle);

    const layers: StudioLayer[] = [
        // Background layer
        {
            id: 'bg-dynamic',
            type: 'background',
            name: 'Background',
            x: 0,
            y: 0,
            width: 1080,
            height: 1350,
            zIndex: 0,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            src: '' // Will be filled with generated background or solid color
        },
        // Product image layer (placeholder)
        {
            id: 'product-dynamic',
            type: 'product',
            name: 'Product Image',
            x: layout.product.x,
            y: layout.product.y,
            width: layout.product.width,
            height: layout.product.height,
            zIndex: 2,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            src: '' // Will be filled with user's product image
        },
        // Headline text layer
        {
            id: 'headline-dynamic',
            type: 'text',
            name: 'Headline',
            role: 'headline', // Enables layout-composer mapping
            x: layout.headline.x,
            y: layout.headline.y,
            width: layout.headline.width,
            height: layout.headline.height,
            zIndex: 3,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: 'PREMIUM PRODUCT',
            fontSize: style.typography.heading.size,
            fontFamily: style.typography.heading.family,
            fontWeight: style.typography.heading.weight as any,
            color: style.colorPalette.text,
            fill: style.colorPalette.text,
            align: params.visualStyle === 'luxury' || params.visualStyle === 'minimal' ? 'center' : 'left',
            lineHeight: style.typography.heading.lineHeight,
            letterSpacing: style.typography.heading.letterSpacing
        },
        // Subheadline text layer
        {
            id: 'subheadline-dynamic',
            type: 'text',
            name: 'Subheadline',
            role: 'subheadline', // Enables layout-composer mapping
            x: layout.subheadline.x,
            y: layout.subheadline.y,
            width: layout.subheadline.width,
            height: layout.subheadline.height,
            zIndex: 3,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: 'The perfect solution for you',
            fontSize: style.typography.body.size * 1.3,
            fontFamily: style.typography.body.family,
            fontWeight: 600 as any,
            color: style.colorPalette.secondary,
            fill: style.colorPalette.secondary,
            align: params.visualStyle === 'luxury' || params.visualStyle === 'minimal' ? 'center' : 'left',
            lineHeight: 1.4
        },
        // CTA button layer
        {
            id: 'cta-dynamic',
            type: 'cta',
            name: 'Call to Action',
            role: 'cta', // CRITICAL: Enables layout-composer to replace text
            x: layout.cta.x,
            y: layout.cta.y,
            width: layout.cta.width,
            height: layout.cta.height,
            zIndex: 4,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: 'SHOP NOW',
            fontSize: 22,
            fontFamily: style.typography.heading.family,
            fontWeight: 800,
            lineHeight: 1.2,
            color: style.colorPalette.background,
            bgColor: style.colorPalette.accent,
            radius: params.visualStyle === 'minimal' ? 4 : params.visualStyle === 'luxury' ? 0 : 12
        }
    ];

    // Add badge layer for bold style
    if (layout.badge) {
        layers.push({
            id: 'badge-dynamic',
            type: 'shape',
            name: 'Promo Badge',
            x: layout.badge.x,
            y: layout.badge.y,
            width: layout.badge.width,
            height: layout.badge.height,
            zIndex: 5,
            rotation: -15,
            opacity: 1,
            locked: false,
            visible: true,
            fill: style.colorPalette.accent,
            cornerRadius: layout.badge.width / 2 // Circle
        });
    }

    return {
        id: `template_${params.visualStyle}_${Date.now()}`,
        name: `${params.visualStyle.charAt(0).toUpperCase() + params.visualStyle.slice(1)} Template`,
        width: 1080,
        height: 1350,
        backgroundColor: style.colorPalette.background,
        layers
    };
}

// ========== UTILITY FUNCTIONS ==========

function hexToHSL(hex: string): { h: number; s: number; l: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 50 };

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(hsl: { h: number; s: number; l: number }): string {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
