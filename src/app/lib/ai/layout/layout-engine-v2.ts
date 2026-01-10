/**
 * LAYOUT ENGINE V2
 * Enterprise-grade ad composition engine
 * 
 * Integrates:
 * - Grid System (12-column responsive)
 * - Font Measurement (Canvas-based)
 * - Contrast Validation (WCAG)
 * - Template Library (5+ patterns)
 * - Visual Balance Scoring
 * 
 * Output: Production-ready, accessible, balanced ad layouts
 */

import type { AdDocument, StudioLayer, TextLayer, ImageLayer, CtaLayer } from '../../../types/studio';
import type { AdFormat, GridConfig } from './grid-system';
import type { TemplatePattern } from './template-library';
import { getGridConfig, getSafeArea } from './grid-system';
import { getTemplateByPattern, selectTemplate } from './template-library';
import { findOptimalFontSize, getFontPairing, getOptimalLetterSpacing } from '../typography/font-measurement';
import { validateContrast, autoAdjustContrast, getAccessibleTextColor, getSafeCTAColor } from '../color/contrast-validator';
import { scoreVisualBalance } from '../quality/visual-balance';

export interface LayoutInput {
    // Content
    headline: string;
    subheadline?: string;
    description?: string;
    ctaText: string;
    productImage?: string;
    backgroundImage?: string;

    // Context
    productName: string;
    brandName?: string;
    tone?: 'minimal' | 'bold' | 'luxury' | 'professional' | 'playful';
    productType?: string;
    goal?: 'awareness' | 'consideration' | 'conversion';
    hasOffer?: boolean;

    // Design
    colors?: {
        primary: string;
        secondary?: string;
        text?: string;
        background?: string;
        accent?: string;
    };

    // Options
    format?: AdFormat;
    pattern?: TemplatePattern;
    enforceAccessibility?: boolean;
    targetBalanceScore?: number;
}

export interface LayoutOutput {
    adDocument: AdDocument;
    quality: {
        balanceScore: number;
        accessibilityPassed: boolean;
        issues: string[];
        suggestions: string[];
    };
    metadata: {
        template: string;
        format: AdFormat;
        generated: string;
    };
}

/**
 * Main composition engine
 */
export async function composeAd(input: LayoutInput): Promise<LayoutOutput> {
    const format = input.format || 'square';
    const config = getGridConfig(format);
    const enforceAccessibility = input.enforceAccessibility !== false; // Default true
    const targetBalanceScore = input.targetBalanceScore || 70;

    // 1. Select Template
    const template = input.pattern
        ? getTemplateByPattern(input.pattern)
        : selectTemplate({
            productType: input.productType,
            tone: input.tone,
            goal: input.goal,
            hasOffer: input.hasOffer
        });

    // 2. Generate base layers from template
    let layers = template.layers(config);

    // 3. Apply Colors with Accessibility
    const colors = input.colors || {
        primary: '#000000',
        text: '#000000',
        background: '#FFFFFF',
        accent: '#000000'
    };

    // Ensure accessible text color
    const textColor = enforceAccessibility
        ? getAccessibleTextColor(colors.background || '#FFFFFF')
        : (colors.text || '#000000');

    // Get safe CTA colors
    const ctaColors = getSafeCTAColor(
        colors.background || '#FFFFFF',
        colors.primary || '#000000'
    );

    // 4. Populate Content & Measure Text
    const fontPair = getFontPairing(input.tone === 'luxury' ? 'elegant' : input.tone === 'bold' ? 'bold' : 'modern');

    layers = layers.map(layer => {
        const newLayer = { ...layer };

        // Apply role-based content
        if (layer.role === 'headline' && layer.type === 'text') {
            const textLayer = newLayer as TextLayer;
            textLayer.text = input.headline;
            textLayer.fontFamily = fontPair.headline.family;
            textLayer.fontWeight = fontPair.headline.weight;
            textLayer.color = textColor;
            textLayer.fill = textColor;

            // Measure optimal font size
            const metrics = findOptimalFontSize(input.headline, {
                maxWidth: layer.width,
                maxHeight: layer.height,
                minFontSize: 40,
                maxFontSize: 100,
                fontFamily: textLayer.fontFamily,
                fontWeight: textLayer.fontWeight
            });

            textLayer.fontSize = metrics.fontSize;
            textLayer.letterSpacing = getOptimalLetterSpacing(metrics.fontSize, textLayer.fontWeight);

            // Validate contrast
            if (enforceAccessibility) {
                const contrast = validateContrast(textColor, colors.background || '#FFFFFF', metrics.fontSize, textLayer.fontWeight);
                if (!contrast.passes.AA) {
                    textLayer.color = autoAdjustContrast(textColor, colors.background || '#FFFFFF', 4.5);
                    textLayer.fill = textLayer.color;
                }
            }
        }

        if (layer.role === 'description' && layer.type === 'text') {
            const textLayer = newLayer as TextLayer;
            textLayer.text = input.description || input.subheadline || '';
            textLayer.fontFamily = fontPair.body.family;
            textLayer.fontWeight = fontPair.body.weight;
            textLayer.color = textColor;
            textLayer.fill = textColor;
            textLayer.opacity = 0.9;

            if (textLayer.text) {
                const metrics = findOptimalFontSize(textLayer.text, {
                    maxWidth: layer.width,
                    maxHeight: layer.height,
                    minFontSize: 20,
                    maxFontSize: 36,
                    fontFamily: textLayer.fontFamily,
                    fontWeight: textLayer.fontWeight
                });
                textLayer.fontSize = metrics.fontSize;
            }
        }

        if (layer.role === 'cta' && layer.type === 'cta') {
            const ctaLayer = newLayer as CtaLayer;
            ctaLayer.text = input.ctaText.toUpperCase();
            ctaLayer.fontFamily = fontPair.cta.family;
            ctaLayer.fontWeight = fontPair.cta.weight;
            ctaLayer.bgColor = ctaColors.bgColor;
            ctaLayer.color = ctaColors.textColor;
        }

        if (layer.role === 'product' && layer.type === 'product') {
            const imageLayer = newLayer as ImageLayer;
            if (input.productImage) {
                imageLayer.src = input.productImage;
            }
        }

        if (layer.type === 'background') {
            const bgLayer = newLayer as ImageLayer;
            if (input.backgroundImage) {
                bgLayer.src = input.backgroundImage;
            }
        }

        return newLayer;
    });

    // 5. Visual Balance Check
    const balanceResult = scoreVisualBalance(layers, config.width, config.height);
    const issues: string[] = [...balanceResult.issues];
    const suggestions: string[] = [...balanceResult.suggestions];

    if (balanceResult.overall < targetBalanceScore) {
        issues.push(`Visual balance score (${balanceResult.overall}) below target (${targetBalanceScore})`);
    }

    // 6. Accessibility Validation
    let accessibilityPassed = true;

    if (enforceAccessibility) {
        layers.forEach((layer, idx) => {
            if (layer.type === 'text') {
                const textLayer = layer as TextLayer;
                const fg = textLayer.color || textLayer.fill || '#000000';
                const bg = colors.background || '#FFFFFF';

                const contrast = validateContrast(fg, bg, textLayer.fontSize, textLayer.fontWeight);
                if (!contrast.passes.AA) {
                    accessibilityPassed = false;
                    issues.push(`Text layer ${idx} fails WCAG AA (ratio: ${contrast.ratio}, required: 4.5)`);
                }
            }
        });
    }

    // 7. Create AdDocument
    const adDocument: AdDocument = {
        id: `ad-${Date.now()}`,
        name: `${input.brandName || input.productName} - ${template.name}`,
        width: config.width,
        height: config.height,
        backgroundColor: colors.background || '#FFFFFF',
        layers: layers,
        safeArea: getSafeArea(config),
        createdAt: new Date().toISOString()
    };

    return {
        adDocument,
        quality: {
            balanceScore: balanceResult.overall,
            accessibilityPassed,
            issues,
            suggestions
        },
        metadata: {
            template: template.id,
            format,
            generated: new Date().toISOString()
        }
    };
}

/**
 * Generate multiple format variants
 */
export async function generateMultiFormat(input: LayoutInput): Promise<{
    square: LayoutOutput;
    story: LayoutOutput;
    landscape: LayoutOutput;
}> {
    const [square, story, landscape] = await Promise.all([
        composeAd({ ...input, format: 'square' }),
        composeAd({ ...input, format: 'story' }),
        composeAd({ ...input, format: 'landscape' })
    ]);

    return { square, story, landscape };
}

/**
 * Generate A/B test variants (different templates)
 */
export async function generateVariants(
    input: LayoutInput,
    variantCount: number = 3
): Promise<LayoutOutput[]> {
    const patterns: TemplatePattern[] = ['minimal', 'bold', 'ecommerce', 'luxury', 'urgency'];
    const selectedPatterns = patterns.slice(0, Math.min(variantCount, patterns.length));

    const variants = await Promise.all(
        selectedPatterns.map(pattern =>
            composeAd({ ...input, pattern })
        )
    );

    // Sort by quality score (best first)
    return variants.sort((a, b) => b.quality.balanceScore - a.quality.balanceScore);
}

/**
 * Quick quality check (pass/fail)
 */
export function meetsQualityStandards(output: LayoutOutput): boolean {
    return (
        output.quality.balanceScore >= 70 &&
        output.quality.accessibilityPassed &&
        output.quality.issues.length === 0
    );
}
