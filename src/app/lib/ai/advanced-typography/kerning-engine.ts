import type { AdDocument, CtaLayer, StudioLayer, TextLayer } from '../../../types/studio';

/**
 * KERNING ENGINE
 * Professional letter-pair spacing adjustments
 * 
 * Features:
 * - Kerning pair tables (AV, WA, To, etc.)
 * - Visual weight balancing
 * - All-caps adjustments
 * - Number spacing optimization
 */

export interface KerningAdjustment {
    pair: string;
    adjustment: number; // Pixels to add/remove
    reason: string;
}

/**
 * Common kerning pairs and their adjustments (in em units, converted to px)
 * Negative = tighter, Positive = wider
 */
const KERNING_PAIRS: Record<string, number> = {
    // Classic problem pairs
    'AV': -0.08,
    'AW': -0.06,
    'AY': -0.08,
    'Av': -0.05,
    'Aw': -0.04,
    'Ay': -0.05,

    'FA': -0.06,
    'TA': -0.08,
    'VA': -0.08,
    'WA': -0.06,
    'YA': -0.08,

    'To': -0.04,
    'Tr': -0.03,
    'Tu': -0.03,
    'Tw': -0.03,
    'Ty': -0.04,

    'Yo': -0.05,
    'Yp': -0.05,

    'PA': -0.07,
    'Po': -0.03,

    'LT': -0.06,
    'LV': -0.07,
    'LW': -0.06,
    'LY': -0.07,

    'RT': -0.03,
    'RV': -0.04,
    'RW': -0.03,
    'RY': -0.04,

    // Punctuation pairs
    'A.': -0.05,
    'A,': -0.05,
    'F.': -0.10,
    'F,': -0.10,
    'P.': -0.08,
    'P,': -0.08,
    'T.': -0.08,
    'T,': -0.08,
    'V.': -0.08,
    'V,': -0.08,
    'W.': -0.06,
    'W,': -0.06,
    'Y.': -0.08,
    'Y,': -0.08,

    // Numbers
    '1,': -0.05,
    '1.': -0.05,
    '7,': -0.06,
    '7.': -0.06,

    // Quotes
    '"A': -0.06,
    '"V': -0.04,
    '"W': -0.04,
    '"Y': -0.04,
    "'A": -0.05,
    "'V": -0.03,
};

/**
 * All-caps kerning adjustments (looser spacing)
 */
const ALL_CAPS_ADJUSTMENT = 0.05; // Add 5% spacing for all-caps

/**
 * Calculate kerning adjustments for text
 */
export function calculateKerning(
    text: string,
    fontSize: number,
    _fontFamily: string = 'Inter'
): KerningAdjustment[] {
    const adjustments: KerningAdjustment[] = [];

    // Check if all-caps
    const isAllCaps = text === text.toUpperCase() && /[A-Z]/.test(text);

    // Convert em units to pixels for this font size
    const emToPx = (em: number) => em * fontSize;

    // Process each character pair
    for (let i = 0; i < text.length - 1; i++) {
        const pair = text.substring(i, i + 2);
        const kernValue = KERNING_PAIRS[pair];

        if (kernValue !== undefined) {
            const adjustment = emToPx(kernValue);

            adjustments.push({
                pair,
                adjustment,
                reason: `Standard kerning pair: ${Math.abs(adjustment).toFixed(1)}px ${adjustment < 0 ? 'tighter' : 'wider'}`
            });
        }
    }

    // All-caps adjustment
    if (isAllCaps && adjustments.length === 0) {
        adjustments.push({
            pair: 'ALL',
            adjustment: emToPx(ALL_CAPS_ADJUSTMENT),
            reason: `All-caps text: +${emToPx(ALL_CAPS_ADJUSTMENT).toFixed(1)}px spacing`
        });
    }

    return adjustments;
}

/**
 * Apply kerning to text layer
 */
export function applyKerning(
    text: string,
    fontSize: number,
    currentLetterSpacing: number = 0
): {
    adjustedLetterSpacing: number;
    adjustments: KerningAdjustment[];
} {
    const adjustments = calculateKerning(text, fontSize);

    if (adjustments.length === 0) {
        return {
            adjustedLetterSpacing: currentLetterSpacing,
            adjustments: []
        };
    }

    // Calculate average adjustment
    const avgAdjustment = adjustments.reduce((sum, adj) => sum + adj.adjustment, 0) / adjustments.length;

    return {
        adjustedLetterSpacing: currentLetterSpacing + avgAdjustment,
        adjustments
    };
}

/**
 * Get kerning recommendations for headline
 */
export function getKerningRecommendations(
    text: string,
    fontSize: number
): string[] {
    const recommendations: string[] = [];
    const adjustments = calculateKerning(text, fontSize);

    if (adjustments.length === 0) {
        return ['No special kerning needed'];
    }

    // Group by positive/negative
    const tighten = adjustments.filter(a => a.adjustment < 0);
    const loosen = adjustments.filter(a => a.adjustment > 0);

    if (tighten.length > 0) {
        recommendations.push(`Tighten spacing for pairs: ${tighten.map(a => a.pair).join(', ')}`);
    }

    if (loosen.length > 0) {
        recommendations.push(`Widen spacing for pairs: ${loosen.map(a => a.pair).join(', ')}`);
    }

    const hasProblematicPairs = adjustments.some(a => Math.abs(a.adjustment) > fontSize * 0.06);
    if (hasProblematicPairs) {
        recommendations.push('⚠️ Text contains problematic letter pairs. Manual kerning recommended for best results.');
    }

    return recommendations;
}

/**
 * Batch apply to all text in ad
 */
export function applyKerningToDocument(adDocument: AdDocument): {
    updatedDocument: AdDocument;
    adjustmentsMade: number;
    totalKerningPairs: number;
} {
    let adjustmentsMade = 0;
    let totalKerningPairs = 0;

    const updatedLayers = adDocument.layers.map((layer: StudioLayer) => {
        if (layer.type === 'text' || layer.type === 'cta') {
            const textLayer = layer as TextLayer | CtaLayer;
            const result = applyKerning(
                textLayer.text || '',
                textLayer.fontSize || 16,
                textLayer.letterSpacing || 0
            );

            totalKerningPairs += result.adjustments.length;

            if (result.adjustments.length > 0) {
                adjustmentsMade++;
                return {
                    ...textLayer,
                    letterSpacing: result.adjustedLetterSpacing
                };
            }
        }
        return layer;
    });

    return {
        updatedDocument: {
            ...adDocument,
            layers: updatedLayers
        },
        adjustmentsMade,
        totalKerningPairs
    };
}
