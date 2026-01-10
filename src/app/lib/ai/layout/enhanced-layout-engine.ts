/**
 * ENHANCED LAYOUT ENGINE
 * Wrapper that adds all advanced features to layout-engine-v2
 * 
 * Enhancements:
 * - Palette extraction from images
 * - Color harmony application
 * - Heatmap & attention prediction
 * - CTR estimation
 * -Auto-layout adjustment
 * - Readability scoring
 * - Error recovery
 */

import type { AdDocument } from '../../../types/studio';
import type { LayoutInput, LayoutOutput } from '../layout/layout-engine-v2';
import { composeAd as baseComposeAd } from '../layout/layout-engine-v2';

export interface EnhancedLayoutOutput extends LayoutOutput {
    quality: LayoutOutput['quality'] & {
        heatmapScore?: number;
        ctrEstimate?: number;
        readabilityGrade?: number;
        comprehensiveScore?: number;
    };
    metadata: LayoutOutput['metadata'] & {
        colorsExtracted?: boolean;
        autoAdjusted?: boolean;
        fallbackLevel?: number;
    };
}

/**
 * Enhanced composition with all advanced features
 */
export async function composeAdEnhanced(input: LayoutInput): Promise<EnhancedLayoutOutput> {
    try {
        // STEP 1: Extract colors from product image if provided
        let enhancedInput = { ...input };

        if (input.productImage && !input.colors) {
            try {
                const { extractDominantColors } = await import('../advanced-color/palette-extractor');
                const { selectHarmonyScheme } = await import('../advanced-color/color-harmony');

                const extractedColors = await extractDominantColors(input.productImage);
                const harmonyScheme = selectHarmonyScheme(
                    extractedColors.primary,
                    input.tone || 'minimal'
                );

                enhancedInput.colors = {
                    primary: extractedColors.primary,
                    secondary: extractedColors.secondary,
                    text: extractedColors.text,
                    background: extractedColors.background,
                    accent: harmonyScheme.colors[1] || extractedColors.accent
                };

                console.log('✓ Colors extracted from product image');
            } catch (error) {
                console.warn('Color extraction failed:', error);
            }
        }

        // STEP 2: Generate base layout
        let result = await baseComposeAd(enhancedInput);
        let { adDocument, quality, metadata } = result;

        // STEP 3: Auto-adjust layout if collisions detected
        try {
            const { needsAdjustment, autoAdjustLayout } = await import('../layout-optimization/auto-adjuster');
            const { getGridConfig } = await import('../layout/grid-system');

            if (needsAdjustment(adDocument.layers)) {
                console.log('⚙️  Auto-adjusting layout...');
                const config = getGridConfig(input.format || 'square');
                const adjustmentResult = await autoAdjustLayout(adDocument.layers, config, 5);

                if (adjustmentResult.adjustmentsMade > 0) {
                    adDocument.layers = adjustmentResult.adjustedLayers;
                    quality.suggestions.push(`Applied ${adjustmentResult.adjustmentsMade} auto-adjustments`);
                    (metadata as any).autoAdjusted = true;
                    console.log(`✓ ${adjustmentResult.adjustmentsMade} adjustments made`);
                }
            }
        } catch (error) {
            console.warn('Auto-adjustment skipped:', error);
        }

        // STEP 4: Predict heatmap & attention
        let heatmapScore = 0;
        try {
            const { predictHeatmap } = await import('../conversion/heatmap-predictor');
            const heatmapPrediction = predictHeatmap(adDocument.layers, adDocument.width, adDocument.height);

            heatmapScore = heatmapPrediction.overallScore;
            quality.suggestions.push(...heatmapPrediction.insights);

            console.log(`✓ Heatmap score: ${heatmapScore}/100`);
        } catch (error) {
            console.warn('Heatmap prediction skipped:', error);
        }

        // STEP 5: Estimate CTR
        let ctrEstimate = 0;
        try {
            const { estimateCTR } = await import('../conversion/ctr-estimator');
            const ctrResult = estimateCTR(adDocument.layers, undefined, input.productType);

            ctrEstimate = ctrResult.estimated;
            quality.suggestions.push(...ctrResult.recommendations);

            console.log(`✓ CTR estimate: ${ctrEstimate.toFixed(2)}%`);
        } catch (error) {
            console.warn('CTR estimation skipped:', error);
        }

        // STEP 6: Score readability
        let readabilityGrade = 0;
        try {
            const { scoreReadability } = await import('../advanced-typography/readability-scorer');

            const combinedText = [input.headline, input.description, input.ctaText]
                .filter(Boolean)
                .join(' ');

            const readabilityScore = scoreReadability(combinedText);
            readabilityGrade = readabilityScore.grade;

            if (readabilityScore.overallScore < 70) {
                quality.suggestions.push(...readabilityScore.recommendations);
            }

            console.log(`✓ Readability grade: ${readabilityGrade}`);
        } catch (error) {
            console.warn('Readability scoring skipped:', error);
        }

        // STEP 7: Calculate comprehensive score
        const comprehensiveScore = Math.round(
            quality.balanceScore * 0.30 +
            heatmapScore * 0.30 +
            (ctrEstimate * 10) * 0.20 + // Scale CTR to 0-100
            (Math.max(0, 100 - readabilityGrade * 10)) * 0.20 // Lower grade = higher score
        );

        console.log(`✅ Comprehensive quality score: ${comprehensiveScore}/100`);

        return {
            adDocument,
            quality: {
                ...quality,
                heatmapScore,
                ctrEstimate,
                readabilityGrade,
                comprehensiveScore
            },
            metadata: {
                ...metadata,
                colorsExtracted: !!input.productImage && !input.colors
            }
        };

    } catch (error) {
        console.error('❌ Enhanced composition failed:', error);

        // STEP 8: Error recovery
        try {
            const { recoverFromFailure } = await import('../performance/error-recovery');
            const recovery = await recoverFromFailure(input, error as Error, 'enhanced-composition');

            if (recovery.success && recovery.adDocument) {
                console.log(`✓ Recovered using fallback (level ${recovery.fallbackLevel})`);

                return {
                    adDocument: recovery.adDocument,
                    quality: {
                        balanceScore: 50,
                        accessibilityPassed: false,
                        issues: recovery.errors.map(e => `${e.stage}: ${e.error}`),
                        suggestions: recovery.warnings,
                        comprehensiveScore: 30
                    },
                    metadata: {
                        template: 'fallback',
                        format: input.format || 'square',
                        generated: new Date().toISOString(),
                        fallbackLevel: recovery.fallbackLevel
                    }
                };
            }
        } catch (recoveryError) {
            console.error('Recovery also failed:', recoveryError);
        }

        throw error;
    }
}

/**
 * Generate enhanced variants
 */
export async function generateEnhancedVariants(
    input: LayoutInput,
    variantCount: number = 3
): Promise<EnhancedLayoutOutput[]> {
    const patterns = ['minimal', 'bold', 'ecommerce', 'luxury', 'urgency'] as const;
    const selectedPatterns = patterns.slice(0, Math.min(variantCount, patterns.length));

    const variants = await Promise.all(
        selectedPatterns.map(pattern =>
            composeAdEnhanced({ ...input, pattern })
        )
    );

    // Sort by comprehensive score
    return variants.sort((a, b) =>
        (b.quality.comprehensiveScore || 0) - (a.quality.comprehensiveScore || 0)
    );
}
