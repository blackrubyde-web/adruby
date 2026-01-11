/**
 * TEMPLATE VARIATION GENERATOR
 * Infinite variations through intelligent mutations
 * 
 * Takes base templates and creates unique variations by:
 * - Color mutations
 * - Layout shifts
 * - Typography variations
 * - Element transformations
 */

import type { TemplateIntelligence } from './template-intelligence';
import type { StyleDNA } from '../intelligence/style-dna-extractor';
import type { ProductImageAnalysis } from './adaptive-layout-engine';

export interface TemplateVariation {
    id: string;
    baseTemplate: string;          // Source template ID
    mutationLevel: number;          // 1-10 (how different from base)

    // Mutated properties
    colors: ColorMutation;
    layout: LayoutMutation;
    typography: TypographyMutation;
    elements: ElementMutation;

    // Quality scores
    scores: {
        uniqueness: number;         // 0-100
        harmony: number;            // 0-100
        balance: number;            // 0-100
        readability: number;        // 0-100
        overall: number;            // 0-100
    };
}

interface ColorMutation {
    strategy: 'shift' | 'complementary' | 'analogous' | 'triadic' | 'invert';
    palette: string[];
    dominantColor: string;
    accentColor: string;
    backgroundGradient?: {
        type: 'linear' | 'radial' | 'conic';
        colors: string[];
        angle?: number;
    };
}

interface LayoutMutation {
    transformation: 'none' | 'rotate' | 'scale' | 'flip' | 'reorder';
    spacing: 'tighter' | 'normal' | 'looser' | 'extreme';
    alignment: 'left' | 'center' | 'right' | 'justified';
    asymmetry: number;              // 0-100%
}

interface TypographyMutation {
    headlineFont: string;
    bodyFont: string;
    sizeScale: number;              // 0.8-1.5 (80% to 150%)
    weightVariation: 'lighter' | 'normal' | 'bolder';
    letterSpacing: number;          // -5 to +10
    lineHeight: number;             // 1.0-2.0
}

interface ElementMutation {
    shapeStyle: 'sharp' | 'rounded' | 'circle' | 'organic';
    shadowIntensity: 'none' | 'subtle' | 'moderate' | 'dramatic';
    borderStyle: 'none' | 'solid' | 'dashed' | 'gradient';
    textEffects: ('shadow' | 'outline' | 'gradient' | 'glow')[];
}

/**
 * Generate N unique variations from base template
 */
export function generateVariations(
    baseTemplate: TemplateIntelligence,
    styleDNA: StyleDNA,
    productAnalysis: ProductImageAnalysis,
    count: number = 20
): TemplateVariation[] {
    const variations: TemplateVariation[] = [];

    for (let i = 0; i < count; i++) {
        const mutationLevel = Math.floor((i / count) * 10) + 1; // Progressive mutations

        const variation = createVariation(
            baseTemplate,
            styleDNA,
            productAnalysis,
            mutationLevel
        );

        variations.push(variation);
    }

    // Filter out low-quality variations
    const qualityFiltered = variations.filter(v => v.scores.overall > 70);

    // Remove duplicates (too similar)
    const uniqueVariations = removeSimilar(qualityFiltered);

    return uniqueVariations;
}

/**
 * Create single variation with specific mutation level
 */
function createVariation(
    baseTemplate: TemplateIntelligence,
    styleDNA: StyleDNA,
    productAnalysis: ProductImageAnalysis,
    mutationLevel: number
): TemplateVariation {
    // Mutate colors
    const colorMutation = mutateColors(
        baseTemplate.colors,
        styleDNA.colorStrategy,
        productAnalysis.colors,
        mutationLevel
    );

    // Mutate layout
    const layoutMutation = mutateLayout(
        baseTemplate.layout,
        styleDNA.visualLanguage,
        mutationLevel
    );

    // Mutate typography
    const typographyMutation = mutateTypography(
        baseTemplate.typography,
        styleDNA.typography,
        mutationLevel
    );

    // Mutate design elements
    const elementMutation = mutateElements(
        baseTemplate.elements,
        styleDNA.materials,
        mutationLevel
    );

    // Calculate quality scores
    const scores = calculateQualityScores(
        colorMutation,
        layoutMutation,
        typographyMutation,
        elementMutation
    );

    return {
        id: `var-${baseTemplate.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        baseTemplate: baseTemplate.id,
        mutationLevel,
        colors: colorMutation,
        layout: layoutMutation,
        typography: typographyMutation,
        elements: elementMutation,
        scores
    };
}

/**
 * Mutate colors intelligently
 */
function mutateColors(
    baseColors: TemplateIntelligence['colors'],
    colorStrategy: StyleDNA['colorStrategy'],
    productColors: ProductImageAnalysis['colors'],
    mutationLevel: number
): ColorMutation {
    const strategies: ColorMutation['strategy'][] = ['shift', 'complementary', 'analogous', 'triadic', 'invert'];
    const strategy = strategies[mutationLevel % strategies.length];

    let palette = [...baseColors.palette];
    let dominantColor = baseColors.dominantColor;
    let accentColor = baseColors.accentColor;

    switch (strategy) {
        case 'shift':
            // Shift hue by mutation level * 36 degrees
            palette = palette.map(c => shiftHue(c, mutationLevel * 36));
            dominantColor = shiftHue(dominantColor, mutationLevel * 36);
            accentColor = shiftHue(accentColor, mutationLevel * 36);
            break;

        case 'complementary':
            // Use complementary color scheme
            palette = getComplementaryPalette(dominantColor);
            accentColor = getComplementary(dominantColor);
            break;

        case 'analogous':
            // Use analogous colors
            palette = getAnalogousPalette(dominantColor);
            break;

        case 'triadic':
            // Use triadic color scheme
            palette = getTriadicPalette(dominantColor);
            accentColor = palette[1];
            break;

        case 'invert':
            // Invert colors (light/dark swap)
            palette = palette.map(invertColor);
            dominantColor = invertColor(dominantColor);
            accentColor = invertColor(accentColor);
            break;
    }

    // Add gradient for higher mutation levels
    const backgroundGradient = mutationLevel > 5 ? {
        type: 'linear' as const,
        colors: [palette[0], palette[1]],
        angle: 45 + (mutationLevel * 15)
    } : undefined;

    return {
        strategy,
        palette,
        dominantColor,
        accentColor,
        backgroundGradient
    };
}

/**
 * Mutate layout structure
 */
function mutateLayout(
    baseLayout: TemplateIntelligence['layout'],
    visualLanguage: StyleDNA['visualLanguage'],
    mutationLevel: number
): LayoutMutation {
    const transformations: LayoutMutation['transformation'][] = ['none', 'rotate', 'scale', 'flip', 'reorder'];
    const transformation = transformations[Math.min(mutationLevel, 4)];

    const spacingOptions: LayoutMutation['spacing'][] = ['tighter', 'normal', 'looser', 'extreme'];
    const spacing = spacingOptions[Math.floor(mutationLevel / 3)];

    const alignments: LayoutMutation['alignment'][] = ['left', 'center', 'right', 'justified'];
    const alignment = alignments[mutationLevel % 4];

    const asymmetry = Math.min(visualLanguage.asymmetry + (mutationLevel * 5), 100);

    return {
        transformation,
        spacing,
        alignment,
        asymmetry
    };
}

/**
 * Mutate typography
 */
function mutateTypography(
    baseTypography: TemplateIntelligence['typography'],
    typoDNA: StyleDNA['typography'],
    mutationLevel: number
): TypographyMutation {
    // Font pairing variations
    const fontPairings = [
        ['Inter', 'Inter'],
        ['Playfair Display', 'Lato'],
        ['Montserrat', 'Open Sans'],
        ['Poppins', 'Roboto'],
        ['Oswald', 'Source Sans Pro'],
        ['Bebas Neue', 'Arial'],
        ['Raleway', 'Merriweather']
    ];

    const selectedPairing = fontPairings[mutationLevel % fontPairings.length];

    // Scale variations
    const sizeScale = 0.8 + (mutationLevel * 0.05); // 0.8 to 1.3

    // Weight variations
    const weightOptions: TypographyMutation['weightVariation'][] = ['lighter', 'normal', 'bolder'];
    const weightVariation = weightOptions[mutationLevel % 3];

    // Letter spacing: tighter for higher mutations
    const letterSpacing = -2 + (mutationLevel * 1.2);

    // Line height: varied
    const lineHeight = 1.2 + (mutationLevel * 0.08);

    return {
        headlineFont: selectedPairing[0],
        bodyFont: selectedPairing[1],
        sizeScale,
        weightVariation,
        letterSpacing,
        lineHeight
    };
}

/**
 * Mutate design elements
 */
function mutateElements(
    baseElements: TemplateIntelligence['elements'],
    materials: StyleDNA['materials'],
    mutationLevel: number
): ElementMutation {
    const shapeStyles: ElementMutation['shapeStyle'][] = ['sharp', 'rounded', 'circle', 'organic'];
    const shapeStyle = shapeStyles[mutationLevel % 4];

    const shadowIntensities: ElementMutation['shadowIntensity'][] = ['none', 'subtle', 'moderate', 'dramatic'];
    const shadowIntensity = shadowIntensities[Math.min(Math.floor(mutationLevel / 3), 3)];

    const borderStyles: ElementMutation['borderStyle'][] = ['none', 'solid', 'dashed', 'gradient'];
    const borderStyle = borderStyles[mutationLevel % 4];

    // Text effects increase with mutation
    const textEffects: ElementMutation['textEffects'] = [];
    if (mutationLevel > 3) textEffects.push('shadow');
    if (mutationLevel > 5) textEffects.push('outline');
    if (mutationLevel > 7) textEffects.push('gradient');
    if (mutationLevel > 9) textEffects.push('glow');

    return {
        shapeStyle,
        shadowIntensity,
        borderStyle,
        textEffects
    };
}

/**
 * Calculate quality scores for variation
 */
function calculateQualityScores(
    colors: ColorMutation,
    layout: LayoutMutation,
    typography: TypographyMutation,
    elements: ElementMutation
): TemplateVariation['scores'] {
    // Uniqueness: Higher for more extreme mutations
    const uniqueness = 60 + (colors.strategy !== 'shift' ? 20 : 0) + (layout.transformation !== 'none' ? 15 : 0);

    // Harmony: Check color harmony
    const harmony = calculateColorHarmony(colors.palette);

    // Balance: Check visual balance
    const balance = 100 - layout.asymmetry;

    // Readability: Lower for extreme typography
    const readability = Math.max(50, 100 - (Math.abs(typography.letterSpacing) * 5));

    // Overall: Weighted average
    const overall = (uniqueness * 0.3 + harmony * 0.3 + balance * 0.2 + readability * 0.2);

    return {
        uniqueness: Math.round(uniqueness),
        harmony: Math.round(harmony),
        balance: Math.round(balance),
        readability: Math.round(readability),
        overall: Math.round(overall)
    };
}

/**
 * Remove similar variations to ensure diversity
 */
function removeSimilar(variations: TemplateVariation[]): TemplateVariation[] {
    const unique: TemplateVariation[] = [];

    for (const variation of variations) {
        const isSimilar = unique.some(existing =>
            calculateSimilarity(variation, existing) > 70
        );

        if (!isSimilar) {
            unique.push(variation);
        }
    }

    return unique;
}

/**
 * Calculate similarity between two variations (0-100)
 */
function calculateSimilarity(v1: TemplateVariation, v2: TemplateVariation): number {
    let similarity = 0;

    // Color similarity
    if (v1.colors.strategy === v2.colors.strategy) similarity += 25;

    // Layout similarity
    if (v1.layout.transformation === v2.layout.transformation) similarity += 25;
    if (v1.layout.spacing === v2.layout.spacing) similarity += 15;

    // Typography similarity
    if (v1.typography.headlineFont === v2.typography.headlineFont) similarity += 20;

    // Element similarity
    if (v1.elements.shapeStyle === v2.elements.shapeStyle) similarity += 15;

    return similarity;
}

// Color manipulation utilities
function shiftHue(hex: string, degrees: number): string {
    // Simplified hue shift (in production would use proper color space)
    return hex; // Placeholder
}

function getComplementary(hex: string): string {
    return hex; // Placeholder
}

function getComplementaryPalette(hex: string): string[] {
    return [hex, getComplementary(hex), '#FFFFFF'];
}

function getAnalogousPalette(hex: string): string[] {
    return [hex, hex, hex]; // Placeholder
}

function getTriadicPalette(hex: string): string[] {
    return [hex, hex, hex]; // Placeholder
}

function invertColor(hex: string): string {
    // Invert RGB values
    if (hex === '#FFFFFF') return '#000000';
    if (hex === '#000000') return '#FFFFFF';
    return hex; // Placeholder
}

function calculateColorHarmony(palette: string[]): number {
    // Simplified harmony calculation
    return 85; // Placeholder
}
