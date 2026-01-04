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

// Premium Font Pairings for Meta-Quality Ads (Heading + Body + CTA)
const PREMIUM_FONT_PAIRINGS: Record<string, { heading: string; body: string; cta: string }> = {
    professional: { heading: 'Montserrat', body: 'Inter', cta: 'Montserrat' },
    luxury: { heading: 'Playfair Display', body: 'Raleway', cta: 'Raleway' },
    bold: { heading: 'Bebas Neue', body: 'DM Sans', cta: 'Bebas Neue' },
    playful: { heading: 'Outfit', body: 'Manrope', cta: 'Outfit' },
    minimal: { heading: 'Space Grotesk', body: 'Inter', cta: 'Space Grotesk' },
    editorial: { heading: 'Crimson Pro', body: 'Source Sans Pro', cta: 'Source Sans Pro' }
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

    const normalized = colors.map(normalizeHsl);

    return {
        primary: hslToHex(normalized[0]),
        secondary: hslToHex(normalized[1]),
        accent: hslToHex(normalized[2]),
        background: hslToHex(normalized[3]),
        text: hslToHex(normalized[4]),
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
    const pairing = PREMIUM_FONT_PAIRINGS[tone] || PREMIUM_FONT_PAIRINGS.professional;

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
 * Modern Button Style Configuration
 */
export interface ModernButtonStyle {
    bgColor: string;
    bgGradient?: { start: string; end: string; angle: number };
    shadowColor: string;
    shadowBlur: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
    borderColor?: string;
    borderWidth?: number;
}

/**
 * Utility: Darken a hex color by a percentage
 */
function darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - Math.round((255 * percent) / 100));
    const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round((255 * percent) / 100));
    const b = Math.max(0, (num & 0x0000FF) - Math.round((255 * percent) / 100));
    return '#' + (0x1000000 + (r * 0x10000) + (g * 0x100) + b).toString(16).slice(1);
}

/**
 * Generate modern button style based on visual style
 */
export function generateModernButtonStyle(
    accentColor: string,
    styleName: VisualStyle['name']
): ModernButtonStyle {
    const styleMap: Record<VisualStyle['name'], ModernButtonStyle> = {
        minimal: {
            bgColor: accentColor,
            shadowColor: 'rgba(0, 0, 0, 0.15)',
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowOffsetY: 8,
        },
        bold: {
            bgColor: accentColor,
            bgGradient: {
                start: accentColor,
                end: darkenColor(accentColor, 15),
                angle: 180
            },
            shadowColor: hexToRgba(accentColor, 0.4) || 'rgba(0, 0, 0, 0.4)',
            shadowBlur: 25,
            shadowOffsetX: 0,
            shadowOffsetY: 12,
        },
        luxury: {
            bgColor: '#000000',
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 30,
            shadowOffsetX: 0,
            shadowOffsetY: 6,
            borderColor: accentColor,
            borderWidth: 1
        },
        playful: {
            bgColor: accentColor,
            bgGradient: {
                start: accentColor,
                end: darkenColor(accentColor, 10),
                angle: 135
            },
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 22,
            shadowOffsetX: 0,
            shadowOffsetY: 10,
        },
        editorial: {
            bgColor: accentColor,
            shadowColor: 'rgba(0, 0, 0, 0.18)',
            shadowBlur: 18,
            shadowOffsetX: 0,
            shadowOffsetY: 7,
            borderColor: darkenColor(accentColor, 20),
            borderWidth: 1
        }
    };

    return styleMap[styleName] || styleMap.minimal;
}

/**
 * Generate text shadow for optimal readability
 */
export function getTextShadowForReadability(
    backgroundColor: string,
    textColor: string
): { shadowColor: string; shadowBlur: number; shadowOffsetX: number; shadowOffsetY: number } | undefined {
    // Calculate luminance to determine if shadow is needed
    const bgLuminance = getLuminance(backgroundColor);
    const textLuminance = getLuminance(textColor);
    const contrast = Math.abs(bgLuminance - textLuminance);

    // If contrast is low, add shadow for readability
    if (contrast < 0.4) {
        // Light text on light bg OR dark text on dark bg
        const shadowColor = bgLuminance > 0.5 ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
        return {
            shadowColor,
            shadowBlur: 8,
            shadowOffsetX: 0,
            shadowOffsetY: 2
        };
    }

    // Always add subtle shadow for depth
    return {
        shadowColor: bgLuminance > 0.5 ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.4)',
        shadowBlur: 4,
        shadowOffsetX: 0,
        shadowOffsetY: 1
    };
}

/**
 * Calculate relative luminance of a color (0-1)
 */
function getLuminance(color: string): number {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate optimal layout positions using Golden Ratio and Z-pattern
 */
export function calculateLayout(
    style: VisualStyle['name'],
    canvasWidth: number = 1080,
    canvasHeight: number = 1080
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

        case 'minimal': {
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
        }

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

    // NEW: Generate modern button style
    const buttonStyle = generateModernButtonStyle(style.colorPalette.accent, params.visualStyle);

    const layers: StudioLayer[] = [
        // Background layer
        {
            id: 'bg-dynamic',
            type: 'background',
            name: 'Background',
            x: 0,
            y: 0,
            width: 1080,
            height: 1080,
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
            fontSize: Math.max(48, style.typography.heading.size), // Min 48px for headlines
            fontFamily: style.typography.heading.family,
            fontWeight: style.typography.heading.weight as any,
            color: style.colorPalette.text,
            fill: style.colorPalette.text,
            align: params.visualStyle === 'luxury' || params.visualStyle === 'minimal' ? 'center' : 'left',
            lineHeight: style.typography.heading.lineHeight,
            letterSpacing: style.typography.heading.letterSpacing,
            // NEW: Text shadow for readability
            ...getTextShadowForReadability(style.colorPalette.background, style.colorPalette.text)
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
            lineHeight: 1.4,
            // NEW: Text shadow for readability
            ...getTextShadowForReadability(style.colorPalette.background, style.colorPalette.secondary)
        },
        // CTA button layer with modern styling
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
            fontSize: Math.max(20, 22), // Min 20px for CTA
            fontFamily: PREMIUM_FONT_PAIRINGS[params.tone]?.cta || style.typography.heading.family,
            fontWeight: 800,
            lineHeight: 1.2,
            color: params.visualStyle === 'luxury' ? style.colorPalette.accent : '#FFFFFF',
            bgColor: buttonStyle.bgColor,
            bgGradient: buttonStyle.bgGradient,
            radius: params.visualStyle === 'minimal' ? 8 : params.visualStyle === 'luxury' ? 0 : 16,
            // Modern shadows for elevation
            shadowColor: buttonStyle.shadowColor,
            shadowBlur: buttonStyle.shadowBlur,
            shadowOffsetX: buttonStyle.shadowOffsetX,
            shadowOffsetY: buttonStyle.shadowOffsetY,
            borderColor: buttonStyle.borderColor,
            borderWidth: buttonStyle.borderWidth
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
        height: 1080,
        backgroundColor: style.colorPalette.background,
        layers
    };
}

// ========== UTILITY FUNCTIONS ==========

function hexToHSL(hex: string): { h: number; s: number; l: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 50 };

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

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

function normalizeHsl(hsl: { h: number; s: number; l: number }): { h: number; s: number; l: number } {
    return {
        h: normalizeHue(hsl.h),
        s: clampPercent(hsl.s),
        l: clampPercent(hsl.l)
    };
}

function normalizeHue(value: number): number {
    const wrapped = value % 360;
    return wrapped < 0 ? wrapped + 360 : wrapped;
}

function clampPercent(value: number): number {
    return Math.min(100, Math.max(0, value));
}

function hexToRgba(hex: string, alpha: number): string | null {
    const normalized = hex.startsWith('#') ? hex : `#${hex}`;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
    if (!result) return null;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
