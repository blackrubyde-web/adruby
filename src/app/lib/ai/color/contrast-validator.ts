/**
 * CONTRAST VALIDATOR
 * WCAG 2.1 compliant contrast checking and auto-adjustment
 * 
 * Features:
 * - WCAG AA/AAA contrast ratio calculation
 * - Automatic color adjustment to meet standards
 * - Readability validation
 * - Accessible color palette generation
 */

export interface ContrastResult {
    ratio: number;
    passes: {
        AA: boolean;        // 4.5:1 for normal text
        AALarge: boolean;   // 3:1 for large text (18pt+)
        AAA: boolean;       // 7:1 for normal text
        AAALarge: boolean;  // 4.5:1 for large text
    };
    foreground: string;
    background: string;
}

/**
 * Normalize color input (handle transparent, rgb, etc)
 */
function normalizeColor(color: string): string | null {
    if (!color || color.toLowerCase() === 'transparent' || color === 'none') {
        return null; // Cannot calculate contrast for transparent
    }

    // Already hex
    if (/^#[0-9a-f]{6}$/i.test(color)) {
        return color;
    }

    // 3-digit hex
    if (/^#[0-9a-f]{3}$/i.test(color)) {
        const [, r, g, b] = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(color)!;
        return `#${r}${r}${g}${g}${b}${b}`;
    }

    return null; // Unsupported format
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const normalized = normalizeColor(hex);
    if (!normalized) return null;

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

/**
 * Calculate relative luminance (WCAG formula)
 */
function getLuminance(color: string): number {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;

    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors (WCAG formula)
 */
export function getContrastRatio(foreground: string, background: string): number {
    // Handle invalid/transparent colors
    const fgNorm = normalizeColor(foreground);
    const bgNorm = normalizeColor(background);

    if (!fgNorm || !bgNorm) {
        return 1; // Minimum contrast for invalid colors
    }

    const lum1 = getLuminance(fgNorm);
    const lum2 = getLuminance(bgNorm);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if colors meet WCAG standards
 */
export function validateContrast(
    foreground: string,
    background: string,
    fontSize: number = 16,
    fontWeight: number | string = 400
): ContrastResult {
    const ratio = getContrastRatio(foreground, background);
    const weight = typeof fontWeight === 'string' ? 400 : fontWeight;
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && weight >= 700);

    return {
        ratio: Math.round(ratio * 100) / 100,
        passes: {
            AA: ratio >= 4.5,
            AALarge: isLargeText ? ratio >= 3 : ratio >= 4.5,
            AAA: ratio >= 7,
            AAALarge: isLargeText ? ratio >= 4.5 : ratio >= 7
        },
        foreground,
        background
    };
}

/**
 * Darken a color by percentage
 */
function darken(color: string, percentage: number): string {
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    const factor = 1 - (percentage / 100);
    return rgbToHex(
        rgb.r * factor,
        rgb.g * factor,
        rgb.b * factor
    );
}

/**
 * Lighten a color by percentage
 */
function lighten(color: string, percentage: number): string {
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    const increase = (255 * percentage) / 100;
    return rgbToHex(
        Math.min(255, rgb.r + increase),
        Math.min(255, rgb.g + increase),
        Math.min(255, rgb.b + increase)
    );
}

/**
 * Automatically adjust foreground color to meet WCAG AA standards
 */
export function autoAdjustContrast(
    foreground: string,
    background: string,
    targetRatio: number = 4.5,
    maxIterations: number = 20
): string {
    let adjusted = foreground;
    let currentRatio = getContrastRatio(adjusted, background);

    if (currentRatio >= targetRatio) {
        return foreground; // Already meets standard
    }

    const bgLum = getLuminance(background);
    const isDarkBg = bgLum < 0.5;

    // Iteratively adjust until we meet target
    for (let i = 0; i < maxIterations; i++) {
        if (currentRatio >= targetRatio) break;

        // If dark background, lighten foreground; if light background, darken
        adjusted = isDarkBg
            ? lighten(adjusted, 10)
            : darken(adjusted, 10);

        currentRatio = getContrastRatio(adjusted, background);
    }

    return adjusted;
}

/**
 * Get accessible text color for any background
 */
export function getAccessibleTextColor(backgroundColor: string): string {
    const luminance = getLuminance(backgroundColor);

    // If background is dark, use white; if light, use dark gray
    if (luminance < 0.5) {
        return '#FFFFFF';
    } else {
        return '#1A1A1A';
    }
}

/**
 * Generate accessible color palette from base color
 */
export function generateAccessiblePalette(baseColor: string): {
    primary: string;
    secondary: string;
    text: string;
    textLight: string;
    background: string;
    backgroundAlt: string;
} {
    const baseLum = getLuminance(baseColor);
    const isDark = baseLum < 0.5;

    return {
        primary: baseColor,
        secondary: isDark ? lighten(baseColor, 20) : darken(baseColor, 20),
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textLight: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
        background: isDark ? '#000000' : '#FFFFFF',
        backgroundAlt: isDark ? '#1A1A1A' : '#F5F5F5'
    };
}

/**
 * Validate entire ad for accessibility
 */
export function validateAdAccessibility(layers: Array<{
    type: string;
    foreground?: string;
    background?: string;
    fontSize?: number;
    fontWeight?: number | string;
}>): {
    passed: boolean;
    issues: Array<{
        layerIndex: number;
        issue: string;
        ratio: number;
        required: number;
    }>;
} {
    const issues: Array<{
        layerIndex: number;
        issue: string;
        ratio: number;
        required: number;
    }> = [];

    layers.forEach((layer, index) => {
        if (layer.type === 'text' && layer.foreground && layer.background) {
            const result = validateContrast(
                layer.foreground,
                layer.background,
                layer.fontSize,
                layer.fontWeight
            );

            if (!result.passes.AA) {
                issues.push({
                    layerIndex: index,
                    issue: `Text layer fails WCAG AA (ratio: ${result.ratio}, required: 4.5)`,
                    ratio: result.ratio,
                    required: 4.5
                });
            }
        }
    });

    return {
        passed: issues.length === 0,
        issues
    };
}

/**
 * Get contrast-safe CTA color
 */
export function getSafeCTAColor(backgroundColor: string, brandColor: string): {
    bgColor: string;
    textColor: string;
} {
    // Try brand color first
    const brandRatio = getContrastRatio(brandColor, backgroundColor);

    if (brandRatio >= 3) {
        // Brand color is visible enough for CTA background
        return {
            bgColor: brandColor,
            textColor: getAccessibleTextColor(brandColor)
        };
    }

    // Adjust brand color to be more visible
    const adjustedBrand = autoAdjustContrast(brandColor, backgroundColor, 3);

    return {
        bgColor: adjustedBrand,
        textColor: getAccessibleTextColor(adjustedBrand)
    };
}
