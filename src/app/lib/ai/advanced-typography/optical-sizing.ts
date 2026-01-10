/**
 * OPTICAL SIZING ENGINE
 * Adjust font rendering based on size for optimal readability
 * 
 * Features:
 * - Size-dependent glyph adjustments
 * - Stroke width compensation
 * - Letter spacing optimization
 * - Variable font axis manipulation
 */

export interface OpticalSizeConfig {
    fontSize: number;
    fontFamily: string;
    isDisplay: boolean; // Display (large) vs text (small) usage
}

export interface OpticalAdjustments {
    letterSpacing: number;    // Adjusted letter spacing (px)
    strokeCompensation: number; // Weight adjustment (-100 to +100)
    opticalSize: number;      // Variable font 'opsz' axis value
    recommendations: string[];
}

/**
 * Calculate optimal letter spacing based on font size
 * Larger text = tighter spacing
 * Smaller text = wider spacing
 */
function calculateOptimalLetterSpacing(fontSize: number): number {
    if (fontSize >= 72) {
        // Display sizes (72pt+): tight spacing
        return -1.5;
    } else if (fontSize >= 48) {
        // Large titles (48-72pt): slightly tight
        return -1.0;
    } else if (fontSize >= 24) {
        // Headings (24-48pt): normal
        return 0;
    } else if (fontSize >= 16) {
        // Body text (16-24pt): slightly wide
        return 0.3;
    } else {
        // Small text (<16pt): wider spacing for readability
        return 0.5;
    }
}

/**
 * Calculate stroke compensation
 * Small sizes need bolder strokes
 * Large sizes can be thinner
 */
function calculateStrokeCompensation(fontSize: number, currentWeight: number): number {
    const baseWeight = typeof currentWeight === 'number' ? currentWeight : 400;

    if (fontSize < 12) {
        // Tiny text: +100 weight units
        return Math.min(900, baseWeight + 100) - baseWeight;
    } else if (fontSize < 16) {
        // Small text: +50 weight units
        return Math.min(900, baseWeight + 50) - baseWeight;
    } else if (fontSize < 24) {
        // Body text: no change
        return 0;
    } else if (fontSize >= 72) {
        // Display: -50 weight units (thinner looks elegant)
        return Math.max(100, baseWeight - 50) - baseWeight;
    } else {
        // Headings: slight reduction
        return Math.max(100, baseWeight - 25) - baseWeight;
    }
}

/**
 * Calculate optical size axis value (for variable fonts)
 * Maps font size to 'opsz' axis (typically 6-144)
 */
function calculateOpticalSizeAxis(fontSize: number): number {
    // Clamp to typical opsz range
    return Math.max(6, Math.min(144, fontSize));
}

/**
 * Get optical size adjustments
 */
export function getOpticalAdjustments(
    config: OpticalSizeConfig,
    currentWeight: number = 400
): OpticalAdjustments {
    const { fontSize, fontFamily, isDisplay } = config;
    const recommendations: string[] = [];

    const letterSpacing = calculateOptimalLetterSpacing(fontSize);
    const strokeCompensation = calculateStrokeCompensation(fontSize, currentWeight);
    const opticalSize = calculateOpticalSizeAxis(fontSize);

    // Generate recommendations
    if (fontSize < 14 && !isDisplay) {
        recommendations.push('Font size below 14px may hinder readability. Consider increasing.');
    }

    if (fontSize >= 72 && letterSpacing > -1) {
        recommendations.push('Large display text benefits from tighter letter spacing (-1.5px to -1px).');
    }

    if (fontSize < 16 && strokeCompensation === 0 && currentWeight < 500) {
        recommendations.push('Small text at light weight may be hard to read. Consider increasing weight.');
    }

    // Font-specific recommendations
    if (fontFamily === 'Playfair Display' && fontSize < 24) {
        recommendations.push('Playfair Display is optimized for larger sizes. Consider alternative for body text.');
    }

    if ((fontFamily === 'Inter' || fontFamily === 'Montserrat') && fontSize >= 72) {
        recommendations.push(`${fontFamily} supports variable 'opsz' axis. Set to ${opticalSize} for optimal rendering.`);
    }

    return {
        letterSpacing,
        strokeCompensation,
        opticalSize,
        recommendations
    };
}

/**
 * Apply optical adjustments to text layer
 */
export function applyOpticalSizing(
    layer: any,
    fontFamily: string = 'Inter'
): any {
    const adjustments = getOpticalAdjustments({
        fontSize: layer.fontSize || 16,
        fontFamily,
        isDisplay: layer.role === 'headline' || layer.fontSize >= 48
    }, layer.fontWeight);

    return {
        ...layer,
        letterSpacing: adjustments.letterSpacing,
        fontWeight: Math.round((layer.fontWeight || 400) + adjustments.strokeCompensation),
        // Store optical size for variable fonts (would need renderer support)
        opticalSize: adjustments.opticalSize
    };
}

/**
 * Batch apply to all text layers
 */
export function applyOpticalSizingToDocument(adDocument: any): {
    updatedDocument: any;
    adjustmentsMade: number;
    recommendations: string[];
} {
    let adjustmentsMade = 0;
    const allRecommendations: string[] = [];

    const updatedLayers = adDocument.layers.map((layer: any) => {
        if (layer.type === 'text' || layer.type === 'cta') {
            const adjusted = applyOpticalSizing(layer, layer.fontFamily);

            if (adjusted.letterSpacing !== layer.letterSpacing ||
                adjusted.fontWeight !== layer.fontWeight) {
                adjustmentsMade++;
            }

            const adjustments = getOpticalAdjustments({
                fontSize: layer.fontSize || 16,
                fontFamily: layer.fontFamily || 'Inter',
                isDisplay: layer.role === 'headline'
            }, layer.fontWeight);

            allRecommendations.push(...adjustments.recommendations);

            return adjusted;
        }
        return layer;
    });

    return {
        updatedDocument: {
            ...adDocument,
            layers: updatedLayers
        },
        adjustmentsMade,
        recommendations: [...new Set(allRecommendations)] // Unique
    };
}
