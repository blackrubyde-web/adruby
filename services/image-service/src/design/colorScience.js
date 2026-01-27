/**
 * COLOR SCIENCE ENGINE
 * 
 * Professional color theory and manipulation:
 * 
 * - Color Space Conversions (RGB, HSL, HSV, LAB, LCH)
 * - Contrast Ratio (WCAG AA/AAA)
 * - Color Harmony Algorithms
 * - Perceptual Color Distance
 * - Palette Generation
 * - Brand Color Extraction
 * - Accessible Color Pairs
 * - Color Psychology Mapping
 */

// ========================================
// COLOR SPACE CONVERSIONS
// ========================================

/**
 * Hex to RGB
 */
export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * RGB to Hex
 */
export function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

/**
 * RGB to HSL
 */
export function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
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

/**
 * HSL to RGB
 */
export function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
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

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/**
 * Hex to HSL
 */
export function hexToHsl(hex) {
    const rgb = hexToRgb(hex);
    return rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
}

/**
 * HSL to Hex
 */
export function hslToHex(h, s, l) {
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * RGB to LAB (for perceptual calculations)
 */
export function rgbToLab(r, g, b) {
    // First convert to XYZ
    r /= 255; g /= 255; b /= 255;

    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

    x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116;

    return {
        l: (116 * y) - 16,
        a: 500 * (x - y),
        b: 200 * (y - z)
    };
}

// ========================================
// LUMINANCE & CONTRAST
// ========================================

/**
 * Calculate relative luminance (WCAG 2.1)
 */
export function getRelativeLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors (WCAG 2.1)
 */
export function getContrastRatio(color1, color2) {
    const rgb1 = typeof color1 === 'string' ? hexToRgb(color1) : color1;
    const rgb2 = typeof color2 === 'string' ? hexToRgb(color2) : color2;

    if (!rgb1 || !rgb2) return null;

    const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check WCAG compliance
 */
export function checkWCAGCompliance(color1, color2) {
    const ratio = getContrastRatio(color1, color2);

    return {
        ratio: Math.round(ratio * 100) / 100,
        AA_normal: ratio >= 4.5,
        AA_large: ratio >= 3,
        AAA_normal: ratio >= 7,
        AAA_large: ratio >= 4.5,
        level: ratio >= 7 ? 'AAA' : (ratio >= 4.5 ? 'AA' : (ratio >= 3 ? 'AA-large' : 'Fail'))
    };
}

/**
 * Find accessible color pair
 */
export function findAccessibleColor(backgroundColor, targetHue = null, minContrast = 4.5) {
    const bgRgb = typeof backgroundColor === 'string' ? hexToRgb(backgroundColor) : backgroundColor;
    const bgLum = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

    // Determine if we need light or dark foreground
    const needsLight = bgLum < 0.5;

    // If target hue specified, find accessible shade of that hue
    if (targetHue !== null) {
        for (let l = needsLight ? 100 : 0; needsLight ? l >= 0 : l <= 100; l += needsLight ? -5 : 5) {
            const testColor = hslToHex(targetHue, 70, l);
            const ratio = getContrastRatio(backgroundColor, testColor);
            if (ratio >= minContrast) {
                return testColor;
            }
        }
    }

    // Fall back to black or white
    return needsLight ? '#FFFFFF' : '#000000';
}

// ========================================
// PERCEPTUAL COLOR DISTANCE
// ========================================

/**
 * Calculate Delta E (CIE76) - perceptual color difference
 */
export function deltaE(color1, color2) {
    const rgb1 = typeof color1 === 'string' ? hexToRgb(color1) : color1;
    const rgb2 = typeof color2 === 'string' ? hexToRgb(color2) : color2;

    if (!rgb1 || !rgb2) return null;

    const lab1 = rgbToLab(rgb1.r, rgb1.g, rgb1.b);
    const lab2 = rgbToLab(rgb2.r, rgb2.g, rgb2.b);

    return Math.sqrt(
        Math.pow(lab1.l - lab2.l, 2) +
        Math.pow(lab1.a - lab2.a, 2) +
        Math.pow(lab1.b - lab2.b, 2)
    );
}

/**
 * Check if colors are perceptually similar
 */
export function areSimilarColors(color1, color2, threshold = 10) {
    const de = deltaE(color1, color2);
    return de !== null && de < threshold;
}

// ========================================
// COLOR HARMONY ALGORITHMS
// ========================================

/**
 * Generate color harmonies
 */
export function generateHarmony(baseColor, type = 'complementary') {
    const hsl = typeof baseColor === 'string' ? hexToHsl(baseColor) : baseColor;
    if (!hsl) return null;

    const harmonies = {
        complementary: [
            { h: hsl.h, s: hsl.s, l: hsl.l },
            { h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l }
        ],

        analogous: [
            { h: (hsl.h - 30 + 360) % 360, s: hsl.s, l: hsl.l },
            { h: hsl.h, s: hsl.s, l: hsl.l },
            { h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l }
        ],

        triadic: [
            { h: hsl.h, s: hsl.s, l: hsl.l },
            { h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l },
            { h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l }
        ],

        tetradic: [
            { h: hsl.h, s: hsl.s, l: hsl.l },
            { h: (hsl.h + 90) % 360, s: hsl.s, l: hsl.l },
            { h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l },
            { h: (hsl.h + 270) % 360, s: hsl.s, l: hsl.l }
        ],

        split_complementary: [
            { h: hsl.h, s: hsl.s, l: hsl.l },
            { h: (hsl.h + 150) % 360, s: hsl.s, l: hsl.l },
            { h: (hsl.h + 210) % 360, s: hsl.s, l: hsl.l }
        ],

        square: [
            { h: hsl.h, s: hsl.s, l: hsl.l },
            { h: (hsl.h + 90) % 360, s: hsl.s, l: hsl.l },
            { h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l },
            { h: (hsl.h + 270) % 360, s: hsl.s, l: hsl.l }
        ]
    };

    const colors = harmonies[type] || harmonies.complementary;
    return colors.map(c => hslToHex(c.h, c.s, c.l));
}

// ========================================
// PALETTE GENERATION
// ========================================

/**
 * Generate complete color palette from base color
 */
export function generatePalette(baseColor, options = {}) {
    const hsl = typeof baseColor === 'string' ? hexToHsl(baseColor) : baseColor;
    if (!hsl) return null;

    const {
        shades = 9,
        includeNeutrals = true,
        includeAccent = true,
        darkMode = true
    } = options;

    const palette = {};

    // Generate shades (50-900)
    const shadeLabels = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    for (let i = 0; i < shades && i < shadeLabels.length; i++) {
        const lightness = 95 - (i * 10);
        const saturation = Math.min(100, hsl.s + ((i - 4) * 2));
        palette[shadeLabels[i]] = hslToHex(hsl.h, saturation, Math.max(5, lightness));
    }

    // Primary color is 500
    palette.primary = palette['500'];

    // Generate neutral grays with slight tint
    if (includeNeutrals) {
        palette.neutrals = {};
        for (let i = 0; i < 10; i++) {
            const lightness = 95 - (i * 10);
            // Add slight tint of primary hue to grays
            palette.neutrals[shadeLabels[i]] = hslToHex(hsl.h, 3, Math.max(5, lightness));
        }
    }

    // Generate accent (complementary)
    if (includeAccent) {
        const accentHue = (hsl.h + 180) % 360;
        palette.accent = {};
        for (let i = 0; i < 5; i++) {
            const lightness = 70 - (i * 12);
            palette.accent[shadeLabels[i * 2]] = hslToHex(accentHue, hsl.s, lightness);
        }
        palette.accent.primary = palette.accent['400'];
    }

    // Dark mode specific colors
    if (darkMode) {
        palette.dark = {
            background: hslToHex(hsl.h, 30, 8),
            surface: hslToHex(hsl.h, 25, 12),
            surfaceHover: hslToHex(hsl.h, 22, 16),
            border: hslToHex(hsl.h, 15, 20),
            text: hslToHex(hsl.h, 5, 95),
            textSecondary: hslToHex(hsl.h, 5, 70)
        };
    }

    return palette;
}

/**
 * Generate gradient from color
 */
export function generateGradient(baseColor, type = 'linear', options = {}) {
    const hsl = typeof baseColor === 'string' ? hexToHsl(baseColor) : baseColor;
    if (!hsl) return null;

    const {
        direction = 135,
        stops = 2,
        hueShift = 30,
        saturationShift = 10,
        lightnessShift = 15
    } = options;

    const colors = [];
    for (let i = 0; i < stops; i++) {
        const t = i / (stops - 1);
        colors.push(hslToHex(
            (hsl.h + (hueShift * t)) % 360,
            Math.min(100, hsl.s + (saturationShift * t)),
            Math.max(0, Math.min(100, hsl.l - (lightnessShift * t)))
        ));
    }

    const colorStops = colors.map((c, i) =>
        `${c} ${Math.round(i / (colors.length - 1) * 100)}%`
    ).join(', ');

    if (type === 'linear') {
        return `linear-gradient(${direction}deg, ${colorStops})`;
    } else if (type === 'radial') {
        return `radial-gradient(ellipse at center, ${colorStops})`;
    } else if (type === 'conic') {
        return `conic-gradient(from ${direction}deg, ${colorStops})`;
    }

    return { colors, css: `linear-gradient(${direction}deg, ${colorStops})` };
}

// ========================================
// COLOR PSYCHOLOGY
// ========================================

export const COLOR_PSYCHOLOGY = {
    red: {
        emotions: ['excitement', 'passion', 'urgency', 'energy', 'love'],
        associations: ['action', 'power', 'danger', 'importance'],
        industries: ['food', 'entertainment', 'sports', 'sales'],
        contrast: 'high',
        hueRange: [345, 15]
    },
    orange: {
        emotions: ['warmth', 'enthusiasm', 'creativity', 'friendliness'],
        associations: ['affordable', 'fun', 'adventure', 'confidence'],
        industries: ['food', 'youth', 'technology', 'creative'],
        contrast: 'medium',
        hueRange: [15, 45]
    },
    yellow: {
        emotions: ['optimism', 'happiness', 'clarity', 'warmth'],
        associations: ['caution', 'playful', 'energy', 'attention'],
        industries: ['children', 'food', 'leisure', 'creative'],
        contrast: 'high',
        hueRange: [45, 70]
    },
    green: {
        emotions: ['growth', 'harmony', 'health', 'nature'],
        associations: ['wealth', 'stability', 'renewal', 'balance'],
        industries: ['health', 'finance', 'organic', 'environment'],
        contrast: 'medium',
        hueRange: [70, 160]
    },
    cyan: {
        emotions: ['calm', 'clarity', 'innovation', 'freshness'],
        associations: ['clean', 'modern', 'technology', 'water'],
        industries: ['technology', 'health', 'travel', 'communication'],
        contrast: 'medium',
        hueRange: [160, 200]
    },
    blue: {
        emotions: ['trust', 'security', 'calm', 'professionalism'],
        associations: ['reliability', 'wisdom', 'confidence', 'authority'],
        industries: ['finance', 'technology', 'healthcare', 'corporate'],
        contrast: 'medium',
        hueRange: [200, 250]
    },
    purple: {
        emotions: ['luxury', 'creativity', 'wisdom', 'mystery'],
        associations: ['royalty', 'spirituality', 'imagination', 'quality'],
        industries: ['luxury', 'beauty', 'creative', 'spiritual'],
        contrast: 'medium',
        hueRange: [250, 290]
    },
    pink: {
        emotions: ['romance', 'femininity', 'softness', 'playfulness'],
        associations: ['care', 'youth', 'tenderness', 'love'],
        industries: ['beauty', 'fashion', 'children', 'romance'],
        contrast: 'low',
        hueRange: [290, 345]
    },
    black: {
        emotions: ['power', 'elegance', 'sophistication', 'mystery'],
        associations: ['luxury', 'authority', 'premium', 'exclusivity'],
        industries: ['luxury', 'fashion', 'technology', 'automotive'],
        contrast: 'maximum'
    },
    white: {
        emotions: ['purity', 'simplicity', 'cleanliness', 'peace'],
        associations: ['minimalism', 'clarity', 'innocence', 'space'],
        industries: ['healthcare', 'technology', 'luxury', 'minimal'],
        contrast: 'maximum'
    }
};

/**
 * Get psychological profile of a color
 */
export function getColorPsychology(color) {
    const hsl = typeof color === 'string' ? hexToHsl(color) : color;
    if (!hsl) return null;

    // Check for black/white/gray first
    if (hsl.s < 10) {
        if (hsl.l < 10) return { ...COLOR_PSYCHOLOGY.black, colorName: 'black' };
        if (hsl.l > 90) return { ...COLOR_PSYCHOLOGY.white, colorName: 'white' };
        return {
            emotions: ['neutral', 'balanced', 'professional', 'timeless'],
            associations: ['neutrality', 'sophistication', 'classic'],
            industries: ['corporate', 'luxury', 'minimal'],
            colorName: 'gray'
        };
    }

    // Find matching color by hue
    for (const [name, profile] of Object.entries(COLOR_PSYCHOLOGY)) {
        if (profile.hueRange) {
            const [start, end] = profile.hueRange;
            if (start < end) {
                if (hsl.h >= start && hsl.h < end) {
                    return { ...profile, colorName: name };
                }
            } else {
                // Wraps around (like red: 345-15)
                if (hsl.h >= start || hsl.h < end) {
                    return { ...profile, colorName: name };
                }
            }
        }
    }

    return null;
}

/**
 * Suggest colors for emotion/industry
 */
export function suggestColorsForEmotion(targetEmotion) {
    const suggestions = [];

    for (const [name, profile] of Object.entries(COLOR_PSYCHOLOGY)) {
        if (profile.emotions?.includes(targetEmotion)) {
            if (profile.hueRange) {
                const midHue = (profile.hueRange[0] + profile.hueRange[1]) / 2;
                suggestions.push({
                    name,
                    color: hslToHex(midHue % 360, 70, 50),
                    confidence: 0.9
                });
            }
        }
    }

    return suggestions;
}

// ========================================
// INDUSTRY & ADVANCED PALETTE FUNCTIONS
// ========================================

/**
 * Industry color palettes based on common conventions
 */
const INDUSTRY_PALETTES = {
    tech: { primary: '#3B82F6', secondary: '#10B981', accent: '#8B5CF6', background: '#0F172A' },
    saas: { primary: '#6366F1', secondary: '#22D3EE', accent: '#F59E0B', background: '#1E1B4B' },
    finance: { primary: '#1E40AF', secondary: '#059669', accent: '#F59E0B', background: '#0F172A' },
    healthcare: { primary: '#0891B2', secondary: '#10B981', accent: '#F97316', background: '#F0FDFA' },
    beauty: { primary: '#EC4899', secondary: '#F472B6', accent: '#8B5CF6', background: '#FDF2F8' },
    fashion: { primary: '#1F2937', secondary: '#F9FAFB', accent: '#EF4444', background: '#FFFFFF' },
    food: { primary: '#EF4444', secondary: '#F59E0B', accent: '#22C55E', background: '#FEF2F2' },
    fitness: { primary: '#EF4444', secondary: '#1F2937', accent: '#22C55E', background: '#0F172A' },
    eco: { primary: '#22C55E', secondary: '#86EFAC', accent: '#0EA5E9', background: '#F0FDF4' },
    luxury: { primary: '#1F2937', secondary: '#D4AF37', accent: '#FFFFFF', background: '#0A0A0A' },
    home: { primary: '#78716C', secondary: '#F5F5F4', accent: '#22C55E', background: '#FAFAF9' },
    other: { primary: '#6366F1', secondary: '#22D3EE', accent: '#F59E0B', background: '#1E1B4B' }
};

/**
 * Generate industry-specific color palette
 */
export function generateIndustryPalette(industry) {
    const base = INDUSTRY_PALETTES[industry] || INDUSTRY_PALETTES.other;

    return {
        primary: base.primary,
        secondary: base.secondary,
        accent: base.accent,
        background: base.background,
        text: getContrastRatio(base.background, '#FFFFFF') > 4.5 ? '#FFFFFF' : '#1F2937',
        textSecondary: getContrastRatio(base.background, '#9CA3AF') > 3 ? '#9CA3AF' : '#6B7280',
        // Generate full palette from primary
        ...generatePalette(base.primary, { includeNeutrals: true })
    };
}

/**
 * Enhance existing palette with accessibility and variants
 */
export function enhancePalette({ primary, secondary, accent }) {
    const primaryHsl = hexToHsl(primary);
    const secondaryHsl = secondary ? hexToHsl(secondary) : null;

    return {
        primary,
        primaryLight: primaryHsl ? hslToHex(primaryHsl.h, primaryHsl.s, Math.min(primaryHsl.l + 20, 90)) : primary,
        primaryDark: primaryHsl ? hslToHex(primaryHsl.h, primaryHsl.s, Math.max(primaryHsl.l - 20, 10)) : primary,
        secondary: secondary || generateHarmony(primary, 'complementary')?.[1] || primary,
        secondaryLight: secondaryHsl ? hslToHex(secondaryHsl.h, secondaryHsl.s, Math.min(secondaryHsl.l + 20, 90)) : secondary,
        accent: accent || generateHarmony(primary, 'triadic')?.[1] || primary,
        text: '#FFFFFF',
        textSecondary: '#9CA3AF',
        background: primaryHsl ? hslToHex(primaryHsl.h, 30, 8) : '#0F172A',
        surface: primaryHsl ? hslToHex(primaryHsl.h, 25, 12) : '#1E293B'
    };
}

/**
 * Generate palette from product's dominant colors
 */
export function generatePaletteFromProduct(dominantColors) {
    if (!dominantColors || dominantColors.length === 0) {
        return generateIndustryPalette('tech');
    }

    const primary = dominantColors[0];
    const secondary = dominantColors[1] || generateHarmony(primary, 'complementary')?.[1];
    const accent = dominantColors[2] || generateHarmony(primary, 'triadic')?.[1];

    return enhancePalette({ primary, secondary, accent });
}

/**
 * Blend two palettes together
 */
export function blendPalettes(palette1, palette2, ratio = 0.5) {
    if (!palette1) return palette2;
    if (!palette2) return palette1;

    const blendColor = (c1, c2) => {
        const rgb1 = hexToRgb(c1);
        const rgb2 = hexToRgb(c2);
        if (!rgb1 || !rgb2) return c1;

        return rgbToHex(
            Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio),
            Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio),
            Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio)
        );
    };

    return {
        primary: blendColor(palette1.primary, palette2.primary),
        secondary: blendColor(palette1.secondary || palette1.primary, palette2.secondary || palette2.primary),
        accent: blendColor(palette1.accent || palette1.primary, palette2.accent || palette2.primary),
        background: palette1.background || palette2.background,
        text: palette1.text || palette2.text,
        textSecondary: palette1.textSecondary || palette2.textSecondary
    };
}

export default {
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    hslToRgb,
    hexToHsl,
    hslToHex,
    rgbToLab,
    getRelativeLuminance,
    getContrastRatio,
    checkWCAGCompliance,
    findAccessibleColor,
    deltaE,
    areSimilarColors,
    generateHarmony,
    generatePalette,
    generateGradient,
    COLOR_PSYCHOLOGY,
    getColorPsychology,
    suggestColorsForEmotion,
    // New functions
    generateIndustryPalette,
    enhancePalette,
    generatePaletteFromProduct,
    blendPalettes,
    INDUSTRY_PALETTES
};
