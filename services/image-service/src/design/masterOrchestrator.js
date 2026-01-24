/**
 * MASTER DESIGN ORCHESTRATOR
 * 
 * Central hub that coordinates all design intelligence modules:
 * 
 * - Integrates all design primitives
 * - Applies color science
 * - Uses typography mastery
 * - Extracts brand DNA
 * - Applies composition intelligence
 * - Adds material textures
 * - Runs design critique
 * 
 * This is the single entry point for design decisions.
 */

import {
    generateTypeScale,
    generateSpacingSystem,
    snapToGrid,
    ruleOfThirdsGrid,
    goldenDivide,
    calculateBalance,
    getOpticalCenter,
    OPTICAL_CORRECTIONS
} from './designPrimitives.js';

import {
    generatePalette,
    generateGradient,
    generateHarmony,
    checkWCAGCompliance,
    findAccessibleColor,
    getColorPsychology,
    suggestColorsForEmotion
} from './colorScience.js';

import {
    FONT_PAIRINGS,
    TYPE_HIERARCHIES,
    calculateLetterSpacing,
    calculateLineHeight,
    fitTextToWidth,
    wrapText,
    scaleTypographyForCanvas,
    getFontPairingForContext,
    createGradientTextSVG,
    createTextWithShadow
} from './typographyMastery.js';

import { extractBrandDNA, checkBrandConsistency } from './brandDNAExtractor.js';

import {
    calculateFocalPoint,
    EYE_MOVEMENT_PATTERNS,
    getRecommendedFlowPattern,
    analyzeNegativeSpace,
    calculateVisualTension,
    assignDepthLayers,
    getDepthEffects,
    GESTALT_PRINCIPLES
} from './compositionIntelligence.js';

import {
    MATERIALS,
    TEXTURES,
    LIGHTING_SETUPS,
    generateNoiseTextureSVG,
    generateSpecularHighlight,
    generateReflection,
    generateEmbossFilter,
    getMaterialForProduct,
    getTextureForMood
} from './materialTextures.js';

import { critiqueDesign, quickQualityCheck } from './aiDesignCritic.js';

// ========================================
// DESIGN SYSTEM GENERATOR
// ========================================

/**
 * Generate complete design system for an ad
 */
export async function generateDesignSystem({
    productImage,
    industry,
    productType,
    mood,
    targetEmotion,
    canvasWidth = 1080,
    canvasHeight = 1080,
    brandColors = null
}) {
    console.log('[DesignOrchestrator] 🎯 Generating design system...');

    // 1. Extract brand DNA from product image
    let brandDNA = null;
    if (productImage) {
        brandDNA = await extractBrandDNA(productImage, { imageType: 'product', industry });
    }

    // 2. Generate color system
    const colorSystem = generateColorSystem({
        brandDNA,
        brandColors,
        targetEmotion,
        mood
    });

    // 3. Generate typography system
    const typographySystem = generateTypographySystem({
        industry,
        mood,
        brandDNA,
        canvasWidth,
        canvasHeight
    });

    // 4. Generate spacing system
    const spacingSystem = generateSpacingSystem(8);
    const typeScale = generateTypeScale(16, 'golden_ratio', 10);

    // 5. Calculate composition
    const compositionSystem = generateCompositionSystem({
        canvasWidth,
        canvasHeight,
        productType
    });

    // 6. Select materials and textures
    const materialSystem = selectMaterialSystem({
        productType,
        mood
    });

    // 7. Compile effects
    const effectsSystem = compileEffectsSystem({
        brandDNA,
        mood,
        materialSystem
    });

    console.log('[DesignOrchestrator] ✅ Design system complete');

    return {
        colors: colorSystem,
        typography: typographySystem,
        spacing: spacingSystem,
        typeScale,
        composition: compositionSystem,
        materials: materialSystem,
        effects: effectsSystem,
        brandDNA,
        metadata: {
            canvasWidth,
            canvasHeight,
            industry,
            productType,
            mood
        }
    };
}

// ========================================
// COLOR SYSTEM
// ========================================

function generateColorSystem({ brandDNA, brandColors, targetEmotion, mood }) {
    // Start with brand DNA or provided colors
    let primaryColor = brandDNA?.colors?.primary || brandColors?.primary || '#3B82F6';

    // Adjust for target emotion if specified
    if (targetEmotion) {
        const emotionColors = suggestColorsForEmotion(targetEmotion);
        if (emotionColors.length > 0 && !brandColors?.primary) {
            primaryColor = emotionColors[0].color;
        }
    }

    // Generate full palette
    const palette = generatePalette(primaryColor, {
        shades: 9,
        includeNeutrals: true,
        includeAccent: true,
        darkMode: true
    });

    // Generate harmonies
    const harmonies = {
        complementary: generateHarmony(primaryColor, 'complementary'),
        analogous: generateHarmony(primaryColor, 'analogous'),
        triadic: generateHarmony(primaryColor, 'triadic')
    };

    // Generate gradients
    const gradients = {
        primary: generateGradient(primaryColor, 'linear', { direction: 135 }),
        radial: generateGradient(primaryColor, 'radial'),
        mesh: {
            colors: [palette.primary, palette.accent?.primary || '#8B5CF6', palette.dark?.surface || '#141428']
        }
    };

    // Check accessibility
    const wcag = checkWCAGCompliance(palette.dark?.background || '#0A0A1A', '#FFFFFF');

    // Get color psychology
    const psychology = getColorPsychology(primaryColor);

    return {
        primary: primaryColor,
        secondary: brandDNA?.colors?.secondary || palette['400'],
        accent: brandDNA?.colors?.accent || palette.accent?.primary,
        background: brandDNA?.colors?.background || palette.dark?.background,
        surface: palette.dark?.surface,
        text: {
            primary: '#FFFFFF',
            secondary: palette.dark?.textSecondary || '#A0A0B0',
            onAccent: findAccessibleColor(palette.accent?.primary || primaryColor)
        },
        palette,
        harmonies,
        gradients,
        accessibility: wcag,
        psychology
    };
}

// ========================================
// TYPOGRAPHY SYSTEM
// ========================================

function generateTypographySystem({ industry, mood, brandDNA, canvasWidth, canvasHeight }) {
    // Get font pairing
    const pairing = getFontPairingForContext(industry, mood);

    // Get hierarchy
    const baseHierarchy = TYPE_HIERARCHIES.ad_standard;
    const scaledHierarchy = scaleTypographyForCanvas(baseHierarchy, canvasWidth, canvasHeight);

    // Build typography specs for each level
    const specs = {};
    for (const level of scaledHierarchy.levels) {
        specs[level.name] = {
            fontFamily: level.name.includes('headline') ? pairing.headline.family : pairing.body.family,
            fontWeight: level.name.includes('headline') ? pairing.headline.weight : pairing.body.weight,
            fontSize: level.baseSize,
            lineHeight: calculateLineHeight(level.baseSize, level.name),
            letterSpacing: calculateLetterSpacing(level.baseSize, level.weight),
            textTransform: level.transform || 'none'
        };
    }

    return {
        pairing,
        hierarchy: scaledHierarchy,
        specs,
        opticalCorrections: OPTICAL_CORRECTIONS,
        // Pre-built text render functions
        renderers: {
            headline: (text, options = {}) => createTextWithShadow({
                text,
                fontSize: specs.headline.fontSize,
                fontFamily: specs.headline.fontFamily,
                fontWeight: specs.headline.fontWeight,
                ...options
            }),
            gradientHeadline: (text, colors, options = {}) => createGradientTextSVG({
                text,
                fontSize: specs.headline.fontSize,
                fontFamily: specs.headline.fontFamily,
                fontWeight: specs.headline.fontWeight,
                gradientColors: colors,
                ...options
            })
        }
    };
}

// ========================================
// COMPOSITION SYSTEM
// ========================================

function generateCompositionSystem({ canvasWidth, canvasHeight, productType }) {
    // Calculate focal point
    const focalPoint = calculateFocalPoint(canvasWidth, canvasHeight, 'rule_of_thirds');

    // Calculate grid
    const thirdGrid = ruleOfThirdsGrid(canvasWidth, canvasHeight);
    const goldenH = goldenDivide(canvasWidth);
    const goldenV = goldenDivide(canvasHeight);

    // Get flow pattern
    const flowPattern = getRecommendedFlowPattern('standard', 5);
    const flowPath = flowPattern.path(canvasWidth, canvasHeight);

    // Define zones
    const zones = {
        headline: {
            x: canvasWidth * 0.1,
            y: canvasHeight * 0.08,
            width: canvasWidth * 0.8,
            height: canvasHeight * 0.18,
            alignment: 'center'
        },
        product: {
            x: getOpticalCenter(canvasWidth, canvasHeight * 0.5, canvasWidth * 0.5, canvasHeight * 0.5, 'product').x,
            y: canvasHeight * 0.25,
            width: canvasWidth * 0.5,
            height: canvasHeight * 0.5,
            alignment: 'center'
        },
        tagline: {
            x: canvasWidth * 0.15,
            y: canvasHeight * 0.72,
            width: canvasWidth * 0.7,
            height: canvasHeight * 0.08,
            alignment: 'center'
        },
        cta: {
            x: canvasWidth * 0.25,
            y: canvasHeight * 0.82,
            width: canvasWidth * 0.5,
            height: canvasHeight * 0.08,
            alignment: 'center'
        },
        badges: {
            x: canvasWidth * 0.75,
            y: canvasHeight * 0.05,
            width: canvasWidth * 0.2,
            height: canvasHeight * 0.1,
            alignment: 'right'
        }
    };

    return {
        focalPoint,
        grid: thirdGrid,
        golden: { horizontal: goldenH, vertical: goldenV },
        flowPattern,
        flowPath,
        zones,
        margins: {
            outer: canvasWidth * 0.05,
            inner: canvasWidth * 0.03
        },
        gestalt: GESTALT_PRINCIPLES
    };
}

// ========================================
// MATERIAL SYSTEM
// ========================================

function selectMaterialSystem({ productType, mood }) {
    const material = getMaterialForProduct(productType);
    const textureKey = getTextureForMood(mood);
    const texture = textureKey ? TEXTURES[textureKey] : null;
    const lighting = LIGHTING_SETUPS.studio_soft;

    return {
        material,
        texture,
        lighting,
        generators: {
            noise: (w, h) => generateNoiseTextureSVG(w, h, textureKey || 'noise_fine'),
            specular: generateSpecularHighlight,
            reflection: generateReflection,
            emboss: generateEmbossFilter
        }
    };
}

// ========================================
// EFFECTS SYSTEM
// ========================================

function compileEffectsSystem({ brandDNA, mood, materialSystem }) {
    // Build effect stack based on mood and brand
    const effects = {
        // Background effects
        background: {
            gradient: true,
            gradientType: 'radial',
            noise: materialSystem.texture ? true : false,
            noiseOpacity: materialSystem.texture?.opacity || 0.03,
            vignette: true,
            vignetteIntensity: 0.35
        },

        // Product effects
        product: {
            shadow: {
                type: 'layered',
                blur: 40,
                intensity: 0.5
            },
            reflection: materialSystem.material?.type === 'glass',
            screenGlow: true,
            screenGlowIntensity: 0.1
        },

        // Decorative effects
        decorative: {
            bokeh: true,
            bokehCount: 4,
            bokehOpacity: 0.04,
            particles: mood === 'dynamic' || mood === 'exciting',
            particleCount: 25,
            sparkles: mood === 'premium' || mood === 'luxury'
        },

        // Post-processing
        postProcess: {
            colorGrading: brandDNA?.mood?.primary === 'warm',
            sharpness: 1.0
        }
    };

    return effects;
}

// ========================================
// DESIGN VALIDATION
// ========================================

/**
 * Validate design against system
 */
export function validateAgainstDesignSystem(designSpecs, designSystem) {
    const issues = [];

    // Check color consistency
    if (designSpecs.colors?.primary !== designSystem.colors.primary) {
        issues.push({
            type: 'color',
            issue: 'Primary color does not match design system',
            severity: 'warning'
        });
    }

    // Check typography
    if (designSpecs.typography?.fontFamily !== designSystem.typography.pairing.headline.family) {
        issues.push({
            type: 'typography',
            issue: 'Font family does not match design system',
            severity: 'warning'
        });
    }

    // Check spacing
    if (designSpecs.spacing) {
        for (const [key, value] of Object.entries(designSpecs.spacing)) {
            const snapped = snapToGrid(value, 8);
            if (value !== snapped) {
                issues.push({
                    type: 'spacing',
                    issue: `${key} (${value}px) not on 8px grid`,
                    suggestion: `Use ${snapped}px`,
                    severity: 'info'
                });
            }
        }
    }

    return {
        valid: issues.filter(i => i.severity === 'error').length === 0,
        issues
    };
}

// ========================================
// FULL QUALITY PIPELINE
// ========================================

/**
 * Run full design quality pipeline
 */
export async function runDesignQualityPipeline(imageBuffer, designSpecs, designSystem) {
    console.log('[DesignOrchestrator] 🔍 Running quality pipeline...');

    // Quick check first
    const quickCheck = quickQualityCheck(designSpecs);

    if (!quickCheck.passes) {
        console.log('[DesignOrchestrator] ⚠️ Quick check failed:', quickCheck.issues);
        return {
            passes: false,
            quickCheck,
            fullCritique: null
        };
    }

    // Full AI critique
    const fullCritique = await critiqueDesign(imageBuffer, designSpecs, designSystem.brandDNA);

    // Validate against design system
    const systemValidation = validateAgainstDesignSystem(designSpecs, designSystem);

    console.log(`[DesignOrchestrator] ✅ Quality: ${fullCritique.overallScore}/10 (${fullCritique.grade})`);

    return {
        passes: fullCritique.passesQuality,
        score: fullCritique.overallScore,
        grade: fullCritique.grade,
        quickCheck,
        fullCritique,
        systemValidation,
        shouldRegenerate: fullCritique.regenerationGuidance?.shouldRegenerate
    };
}

export default {
    generateDesignSystem,
    validateAgainstDesignSystem,
    runDesignQualityPipeline
};
