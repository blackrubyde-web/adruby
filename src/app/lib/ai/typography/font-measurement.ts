/**
 * FONT MEASUREMENT SYSTEM
 * Canvas-based text measurement for accurate font sizing
 * 
 * Features:
 * - Actual pixel-width measurement (not character count)
 * - Multi-line text wrapping calculation
 * - Font fallback system
 * - Optimized caching for performance
 */

export interface FontMetrics {
    width: number;
    height: number;
    lines: number;
    fontSize: number;
    fontFamily: string;
    fontWeight: number | string;
}

export interface MeasurementOptions {
    maxWidth?: number;
    maxHeight?: number;
    minFontSize?: number;
    maxFontSize?: number;
    lineHeight?: number;
    fontWeight?: number | string;
    letterSpacing?: number;
}

// Canvas singleton for measurements (reused for performance)
let measurementCanvas: HTMLCanvasElement | null = null;
let measurementContext: CanvasRenderingContext2D | null = null;

/**
 * Get or create measurement canvas
 */
function getMeasurementContext(): CanvasRenderingContext2D {
    if (!measurementContext) {
        // Check if we're in browser environment
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            measurementCanvas = document.createElement('canvas');
            measurementContext = measurementCanvas.getContext('2d');
        } else {
            // Server-side: Use approximate calculations
            // (Canvas measurement will happen client-side during preview)
            measurementContext = null as any;
        }
    }
    return measurementContext!;
}

/**
 * Measure text width using Canvas API
 */
export function measureTextWidth(
    text: string,
    fontSize: number,
    fontFamily: string = 'Inter',
    fontWeight: number | string = 400
): number {
    const ctx = getMeasurementContext();

    if (!ctx) {
        // Server-side fallback: approximate calculation
        // Average char width is roughly 0.6 * fontSize for most fonts
        return text.length * fontSize * 0.6;
    }

    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    return metrics.width;
}

/**
 * Calculate how many lines text will wrap to
 */
export function calculateLineWrap(
    text: string,
    maxWidth: number,
    fontSize: number,
    fontFamily: string = 'Inter',
    fontWeight: number | string = 400
): { lines: string[]; totalHeight: number } {
    const ctx = getMeasurementContext();

    if (!ctx) {
        // Server-side fallback
        const approxCharsPerLine = Math.floor(maxWidth / (fontSize * 0.6));
        const approxLines = Math.ceil(text.length / approxCharsPerLine);
        return {
            lines: text.match(new RegExp(`.{1,${approxCharsPerLine}}`, 'g')) || [text],
            totalHeight: approxLines * fontSize * 1.2
        };
    }

    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    const lineHeight = fontSize * 1.2; // Standard 1.2x line height
    const totalHeight = lines.length * lineHeight;

    return { lines, totalHeight };
}

/**
 * Find optimal font size that fits text within constraints
 */
export function findOptimalFontSize(
    text: string,
    constraints: {
        maxWidth: number;
        maxHeight: number;
        minFontSize?: number;
        maxFontSize?: number;
        fontFamily?: string;
        fontWeight?: number | string;
        lineHeight?: number;
    }
): FontMetrics {
    const minSize = constraints.minFontSize || 16;
    const maxSize = constraints.maxFontSize || 120;
    const fontFamily = constraints.fontFamily || 'Inter';
    const fontWeight = constraints.fontWeight || 400;
    const lineHeight = constraints.lineHeight || 1.2;

    let optimalSize = maxSize;
    let fits = false;

    // Binary search for optimal font size
    let low = minSize;
    let high = maxSize;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const { lines, totalHeight } = calculateLineWrap(
            text,
            constraints.maxWidth,
            mid,
            fontFamily,
            fontWeight
        );

        const adjustedHeight = totalHeight * lineHeight / 1.2;

        if (adjustedHeight <= constraints.maxHeight) {
            // Fits! Try larger
            optimalSize = mid;
            fits = true;
            low = mid + 1;
        } else {
            // Too big, try smaller
            high = mid - 1;
        }
    }

    // Final measurement with optimal size
    const { lines, totalHeight } = calculateLineWrap(
        text,
        constraints.maxWidth,
        optimalSize,
        fontFamily,
        fontWeight
    );

    const width = Math.max(...lines.map(line =>
        measureTextWidth(line, optimalSize, fontFamily, fontWeight)
    ));

    return {
        width,
        height: totalHeight * lineHeight / 1.2,
        lines: lines.length,
        fontSize: optimalSize,
        fontFamily,
        fontWeight
    };
}

/**
 * Professional font pairings
 */
export const FontPairings = {
    modern: {
        headline: { family: 'Inter', weight: 800 },
        body: { family: 'Inter', weight: 400 },
        cta: { family: 'Inter', weight: 700 }
    },
    elegant: {
        headline: { family: 'Playfair Display', weight: 700 },
        body: { family: 'Inter', weight: 400 },
        cta: { family: 'Inter', weight: 600 }
    },
    bold: {
        headline: { family: 'Montserrat', weight: 900 },
        body: { family: 'Montserrat', weight: 500 },
        cta: { family: 'Montserrat', weight: 700 }
    },
    tech: {
        headline: { family: 'Inter', weight: 700 },
        body: { family: 'Inter', weight: 400 },
        cta: { family: 'Inter', weight: 600 }
    }
} as const;

/**
 * Get font pairing for style
 */
export function getFontPairing(style: keyof typeof FontPairings) {
    return FontPairings[style] || FontPairings.modern;
}

/**
 * Typography scale (based on Major Third - 1.25 ratio)
 */
export const TypographyScale = {
    h1: 72,   // Main headline
    h2: 58,   // Secondary headline
    h3: 46,   // Tertiary headline
    h4: 37,   // Large body
    body: 30, // Standard body
    small: 24, // Small text
    cta: 28   // CTA button text
} as const;

/**
 * Get recommended font size for element type
 */
export function getRecommendedFontSize(
    elementType: keyof typeof TypographyScale,
    format: 'square' | 'story' | 'landscape' | 'portrait'
): number {
    const baseSize = TypographyScale[elementType];

    // Scale for format
    const formatMultipliers = {
        square: 1.0,
        story: 1.1,    // Slightly larger for vertical format
        landscape: 0.9, // Slightly smaller for horizontal
        portrait: 1.05
    };

    return Math.round(baseSize * formatMultipliers[format]);
}

/**
 * Validate if text is readable at given size
 */
export function isReadable(
    fontSize: number,
    fontWeight: number | string,
    minReadableSize: number = 20
): boolean {
    // Bolder text can be slightly smaller
    const weight = typeof fontWeight === 'string' ? 400 : fontWeight;
    const adjustedMin = weight >= 700 ? minReadableSize * 0.9 : minReadableSize;

    return fontSize >= adjustedMin;
}

/**
 * Calculate optimal letter spacing for headline
 */
export function getOptimalLetterSpacing(
    fontSize: number,
    fontWeight: number | string
): number {
    // Larger, bolder text benefits from tighter letter spacing
    const weight = typeof fontWeight === 'string' ? 400 : fontWeight;

    if (fontSize >= 60 && weight >= 700) {
        return -1; // Tighter for large, bold headlines
    } else if (fontSize >= 40) {
        return -0.5;
    }

    return 0; // Default spacing
}

/**
 * Cache for measurement results (performance optimization)
 */
const measurementCache = new Map<string, FontMetrics>();

export function getCachedMeasurement(
    text: string,
    maxWidth: number,
    maxHeight: number,
    fontFamily: string,
    fontWeight: number | string
): FontMetrics | null {
    const key = `${text}_${maxWidth}_${maxHeight}_${fontFamily}_${fontWeight}`;
    return measurementCache.get(key) || null;
}

export function cacheMeasurement(
    text: string,
    maxWidth: number,
    maxHeight: number,
    fontFamily: string,
    fontWeight: number | string,
    metrics: FontMetrics
): void {
    const key = `${text}_${maxWidth}_${maxHeight}_${fontFamily}_${fontWeight}`;
    measurementCache.set(key, metrics);

    // Limit cache size
    if (measurementCache.size > 1000) {
        const firstKey = measurementCache.keys().next().value;
        measurementCache.delete(firstKey);
    }
}
