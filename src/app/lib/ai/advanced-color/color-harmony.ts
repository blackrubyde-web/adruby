/**
 * COLOR HARMONY SYSTEM
 * Generate harmonious color schemes using color theory
 * 
 * Features:
 * - Complementary colors (180° hue shift)
 * - Triadic schemes (120° intervals)
 * - Analogous colors (30° range)
 * - Split-complementary
 * - Tetradic (rectangle)
 * - Monochromatic variations
 */

export interface HarmonyScheme {
    name: string;
    colors: string[];
    description: string;
}

export interface HarmonyScore {
    overall: number;        // 0-100
    balance: number;        // Color weight distribution
    contrast: number;       // Value contrast
    saturationHarmony: number;  // Saturation consistency
    temperature: number;    // Warm/cool balance
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
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

    return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h /= 360;
    s /= 100;
    l /= 100;

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

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/**
 * Convert hex to HSL
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return rgbToHsl(r, g, b);
}

/**
 * Convert HSL to hex
 */
function hslToHex(h: number, s: number, l: number): string {
    const rgb = hslToRgb(h, s, l);
    return '#' + [rgb.r, rgb.g, rgb.b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

/**
 * Normalize hue to 0-360 range
 */
function normalizeHue(hue: number): number {
    while (hue < 0) hue += 360;
    while (hue >= 360) hue -= 360;
    return hue;
}

/**
 * Generate complementary color (180° hue shift)
 */
export function generateComplementary(baseColor: string): HarmonyScheme {
    const hsl = hexToHsl(baseColor);
    if (!hsl) return { name: 'complementary', colors: [baseColor], description: 'Invalid color' };

    const complement = hslToHex(normalizeHue(hsl.h + 180), hsl.s, hsl.l);

    return {
        name: 'Complementary',
        colors: [baseColor, complement],
        description: 'High contrast pairing'
    };
}

/**
 * Generate triadic scheme (120° intervals)
 */
export function generateTriadic(baseColor: string): HarmonyScheme {
    const hsl = hexToHsl(baseColor);
    if (!hsl) return { name: 'triadic', colors: [baseColor], description: 'Invalid color' };

    const second = hslToHex(normalizeHue(hsl.h + 120), hsl.s, hsl.l);
    const third = hslToHex(normalizeHue(hsl.h + 240), hsl.s, hsl.l);

    return {
        name: 'Triadic',
        colors: [baseColor, second, third],
        description: 'Vibrant and balanced'
    };
}

/**
 * Generate analogous colors (adjacent hues)
 */
export function generateAnalogous(baseColor: string, range: number = 30): HarmonyScheme {
    const hsl = hexToHsl(baseColor);
    if (!hsl) return { name: 'analogous', colors: [baseColor], description: 'Invalid color' };

    const left = hslToHex(normalizeHue(hsl.h - range), hsl.s, hsl.l);
    const right = hslToHex(normalizeHue(hsl.h + range), hsl.s, hsl.l);

    return {
        name: 'Analogous',
        colors: [left, baseColor, right],
        description: 'Harmonious and serene'
    };
}

/**
 * Generate split-complementary scheme
 */
export function generateSplitComplementary(baseColor: string): HarmonyScheme {
    const hsl = hexToHsl(baseColor);
    if (!hsl) return { name: 'split-complementary', colors: [baseColor], description: 'Invalid color' };

    const complementHue = normalizeHue(hsl.h + 180);
    const left = hslToHex(normalizeHue(complementHue - 30), hsl.s, hsl.l);
    const right = hslToHex(normalizeHue(complementHue + 30), hsl.s, hsl.l);

    return {
        name: 'Split-Complementary',
        colors: [baseColor, left, right],
        description: 'Contrast with less tension'
    };
}

/**
 * Generate tetradic (rectangle) scheme
 */
export function generateTetradic(baseColor: string): HarmonyScheme {
    const hsl = hexToHsl(baseColor);
    if (!hsl) return { name: 'tetradic', colors: [baseColor], description: 'Invalid color' };

    const second = hslToHex(normalizeHue(hsl.h + 60), hsl.s, hsl.l);
    const third = hslToHex(normalizeHue(hsl.h + 180), hsl.s, hsl.l);
    const fourth = hslToHex(normalizeHue(hsl.h + 240), hsl.s, hsl.l);

    return {
        name: 'Tetradic',
        colors: [baseColor, second, third, fourth],
        description: 'Rich and complex'
    };
}

/**
 * Generate monochromatic variations
 */
export function generateMonochromatic(baseColor: string): HarmonyScheme {
    const hsl = hexToHsl(baseColor);
    if (!hsl) return { name: 'monochromatic', colors: [baseColor], description: 'Invalid color' };

    const darker = hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 20));
    const lighter = hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 20));
    const desaturated = hslToHex(hsl.h, Math.max(0, hsl.s - 30), hsl.l);
    const saturated = hslToHex(hsl.h, Math.min(100, hsl.s + 20), hsl.l);

    return {
        name: 'Monochromatic',
        colors: [darker, desaturated, baseColor, saturated, lighter],
        description: 'Cohesive and elegant'
    };
}

/**
 * Validate harmony of a palette
 */
export function validateHarmony(colors: string[]): HarmonyScore {
    if (colors.length < 2) {
        return {
            overall: 0,
            balance: 0,
            contrast: 0,
            saturationHarmony: 0,
            temperature: 0
        };
    }

    const hslColors = colors.map(c => hexToHsl(c)).filter(Boolean) as Array<{ h: number; s: number; l: number }>;

    // 1. Balance (hue distribution)
    const hues = hslColors.map(c => c.h);
    const hueVariance = calculateVariance(hues);
    const balance = Math.min(100, (hueVariance / 100) * 100); // Higher variance = better balance

    // 2. Contrast (lightness range)
    const lightnesses = hslColors.map(c => c.l);
    const lightnessRange = Math.max(...lightnesses) - Math.min(...lightnesses);
    const contrast = Math.min(100, (lightnessRange / 80) * 100); // 80% range = perfect

    // 3. Saturation harmony (consistency)
    const saturations = hslColors.map(c => c.s);
    const saturationVariance = calculateVariance(saturations);
    const saturationHarmony = Math.max(0, 100 - saturationVariance); // Lower variance = better

    // 4. Temperature balance (warm vs cool)
    const warmCount = hues.filter(h => (h >= 0 && h < 60) || (h >= 300 && h < 360)).length;
    const coolCount = hues.filter(h => h >= 120 && h < 300).length;
    const tempBalance = 100 - Math.abs((warmCount - coolCount) / hues.length) * 100;

    const overall = (balance * 0.3 + contrast * 0.3 + saturationHarmony * 0.2 + tempBalance * 0.2);

    return {
        overall: Math.round(overall),
        balance: Math.round(balance),
        contrast: Math.round(contrast),
        saturationHarmony: Math.round(saturationHarmony),
        temperature: Math.round(tempBalance)
    };
}

/**
 * Calculate variance of array
 */
function calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Get best harmony scheme for context
 */
export function selectHarmonyScheme(
    baseColor: string,
    context: 'minimal' | 'bold' | 'luxury' | 'ecommerce' | 'urgency'
): HarmonyScheme {
    switch (context) {
        case 'minimal':
            return generateMonochromatic(baseColor);
        case 'bold':
            return generateComplementary(baseColor);
        case 'luxury':
            return generateAnalogous(baseColor, 20);
        case 'ecommerce':
            return generateSplitComplementary(baseColor);
        case 'urgency':
            return generateTriadic(baseColor);
        default:
            return generateMonochromatic(baseColor);
    }
}
