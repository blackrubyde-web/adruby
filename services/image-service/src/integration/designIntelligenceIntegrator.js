/**
 * DESIGN INTELLIGENCE INTEGRATOR
 * 
 * Wires all v11-v13 design intelligence modules into
 * a unified system driven by Foreplay reference ads.
 * 
 * This is the central hub that:
 * 1. Takes Foreplay analysis as primary input
 * 2. Selects appropriate modules based on analysis
 * 3. Generates complete ad specifications
 * 4. Returns everything needed for compositing
 */

// v11.0 Modules - Industry, Variants, Emotions
import { getIndustryConfig, getVisualStyleForProduct } from '../data/industryDatabase.js';
import { generateCreativeVariants, predictVariantPerformance } from '../variants/creativeVariantEngine.js';
import { getEmotionsForProduct, mapEmotionToDesign, getCurrentSeasonalTrend, applySeasonalTrend } from '../data/emotionMoodSystem.js';
import { getProductVisualRules, getMockupRecommendation, getEffectRecommendations } from '../rules/productVisualRules.js';
import { generateCopyPackage } from '../copy/copyTemplateLibrary.js';
import { deepAnalyzeForeplayPatterns } from '../patterns/deepForeplayMatcher.js';

// v12.0 Modules - Design Primitives
import * as colorScience from '../design/colorScience.js';
import * as typography from '../design/typographyMastery.js';
import * as brandDNA from '../design/brandDNAExtractor.js';
import * as composition from '../design/compositionIntelligence.js';
import * as materials from '../design/materialTextures.js';
import * as aiCritic from '../design/aiDesignCritic.js';
import * as masterDesigner from '../design/masterOrchestrator.js';

// v13.0 Modules - 360° Elements
import * as shapes from '../elements/shapeGenerator.js';
import * as dataViz from '../elements/dataVisualization.js';
import * as icons from '../elements/iconLibrary.js';
import * as badges from '../elements/badgeGenerator.js';
import * as glass from '../elements/glassmorphicComponents.js';
import * as textFx from '../elements/enhancedTextEffects.js';
import * as callouts from '../elements/calloutGenerator.js';
import * as overlays from '../elements/decorativeOverlays.js';
import * as elementOrchestrator from '../elements/masterElementOrchestrator.js';
import * as advancedPrompts from '../ai/advancedPromptEngine.js';

// Animation & Export
import * as animation from '../animation/animationLayer.js';
import * as multiFormat from '../export/multiFormatExporter.js';

// ========================================
// MAIN INTEGRATION FUNCTION
// ========================================

/**
 * Generate complete design intelligence from Foreplay + product
 * 
 * This is the CORE function that drives everything from reference ads
 */
export async function generateDesignIntelligence({
    foreplayAnalysis,    // From deepForeplayMatcher
    productAnalysis,     // From productMatcher
    userPrompt = null,
    industry = null,
    targetEmotion = null,
    format = 'square',
    enableVariants = false,
    variantCount = 3
}) {
    console.log('[DesignIntel] 🧠 Generating Design Intelligence...');

    // ════════════════════════════════════════
    // STEP 1: FOREPLAY AS PRIMARY DRIVER
    // ════════════════════════════════════════

    // Foreplay patterns are the FOUNDATION - not strict templates
    const patterns = foreplayAnalysis?.designPatterns || {};
    const foreplayColors = foreplayAnalysis?.colorPalette || {};
    const foreplayTypography = foreplayAnalysis?.typography || {};
    const foreplayEffects = foreplayAnalysis?.effects || {};
    const foreplayLayout = foreplayAnalysis?.layout || {};

    console.log(`[DesignIntel]   Foreplay patterns: ${Object.keys(patterns).length} detected`);

    // ════════════════════════════════════════
    // STEP 2: INDUSTRY CONTEXT
    // ════════════════════════════════════════

    const detectedIndustry = industry || productAnalysis?.industry || 'technology';
    const industryConfig = getIndustryConfig(detectedIndustry);
    const visualStyle = getVisualStyleForProduct(productAnalysis?.productType, detectedIndustry);

    console.log(`[DesignIntel]   Industry: ${detectedIndustry}`);

    // ════════════════════════════════════════
    // STEP 3: COLOR INTELLIGENCE
    // ════════════════════════════════════════

    // Start with Foreplay colors, enhance with color science
    let colorPalette;

    if (foreplayColors.primary) {
        // Foreplay-driven colors
        colorPalette = colorScience.enhancePalette({
            primary: foreplayColors.primary,
            secondary: foreplayColors.secondary,
            accent: foreplayColors.accent,
            background: foreplayColors.background || '#0A0A1A'
        });
    } else if (productAnalysis?.dominantColors) {
        // Product-driven colors
        colorPalette = colorScience.generatePaletteFromProduct(productAnalysis.dominantColors);
    } else {
        // Industry defaults
        colorPalette = colorScience.generateIndustryPalette(detectedIndustry);
    }

    // Apply emotion-based color adjustments
    const emotion = targetEmotion || getEmotionsForProduct(productAnalysis?.productType)?.[0];
    if (emotion) {
        const emotionDesign = mapEmotionToDesign(emotion);
        colorPalette = colorScience.blendPalettes(colorPalette, emotionDesign.colors, 0.2);
    }

    console.log(`[DesignIntel]   Primary color: ${colorPalette.primary}`);

    // ════════════════════════════════════════
    // STEP 4: TYPOGRAPHY INTELLIGENCE
    // ════════════════════════════════════════

    // Merge Foreplay typography with system recommendations
    const typographySpec = typography.generateTypographySpec({
        industry: detectedIndustry,
        mood: patterns.mood || 'professional',
        baseScale: foreplayTypography.scale || 1,
        headlineStyle: foreplayTypography.headlineStyle || 'bold_impact'
    });

    // Apply Foreplay-detected sizes if available
    if (foreplayTypography.headlineSize) {
        typographySpec.headline.sizePx = foreplayTypography.headlineSize;
    }
    if (foreplayTypography.fontFamily) {
        typographySpec.fontFamily = foreplayTypography.fontFamily;
    }

    // ════════════════════════════════════════
    // STEP 5: COMPOSITION INTELLIGENCE
    // ════════════════════════════════════════

    // Derive composition from Foreplay patterns
    const compositionSpec = composition.generateComposition({
        layoutType: foreplayLayout.type || 'centered_hero',
        aspectRatio: multiFormat.AD_FORMATS[format]?.ratio || 1,
        productFocus: foreplayLayout.productEmphasis || 0.6,
        textPlacement: foreplayLayout.textPosition || 'top',
        hasFeatures: !!patterns.features,
        hasSocialProof: !!patterns.socialProof,
        hasBadge: !!patterns.badge
    });

    // ════════════════════════════════════════
    // STEP 6: ELEMENT SELECTION
    // ════════════════════════════════════════

    // Use element orchestrator with Foreplay-driven selection
    const selectedElements = elementOrchestrator.selectElementsForAd({
        industry: detectedIndustry,
        adType: detectAdType(patterns),
        mood: patterns.mood || emotion || 'professional',
        hasDiscount: !!patterns.discountBadge,
        hasSocialProof: !!patterns.socialProof || !!patterns.rating,
        hasFeatureList: !!patterns.features,
        hasComparison: !!patterns.comparison
    });

    console.log(`[DesignIntel]   Elements: ${countElements(selectedElements)} selected`);

    // ════════════════════════════════════════
    // STEP 7: OVERLAY & EFFECTS
    // ════════════════════════════════════════

    // Determine atmosphere style from Foreplay
    const atmosphereStyle = detectAtmosphereStyle(foreplayEffects, patterns.mood);

    // Generate overlay specs
    const overlaySpecs = {
        style: atmosphereStyle,
        bokeh: foreplayEffects.hasBokeh !== false,
        particles: foreplayEffects.hasParticles !== false,
        vignette: foreplayEffects.hasVignette !== false,
        gradientOrbs: atmosphereStyle === 'premium' || atmosphereStyle === 'luxury'
    };

    // ════════════════════════════════════════
    // STEP 8: COPY GENERATION
    // ════════════════════════════════════════

    // Generate copy from templates, informed by Foreplay
    const copyPackage = generateCopyPackage({
        productName: productAnalysis?.productName || 'Product',
        productType: productAnalysis?.productType || 'saas',
        industry: detectedIndustry,
        targetEmotion: emotion,
        copyStrategy: patterns.copyStyle || 'benefit_focused',
        userPrompt
    });

    // ════════════════════════════════════════
    // STEP 9: MOCKUP & PRODUCT RULES
    // ════════════════════════════════════════

    const productRules = getProductVisualRules(productAnalysis?.productType);
    const mockupRecommendation = getMockupRecommendation(productAnalysis?.productType, detectedIndustry);
    const effectRecommendations = getEffectRecommendations(productAnalysis?.productType);

    // ════════════════════════════════════════
    // STEP 10: AI PROMPT GENERATION
    // ════════════════════════════════════════

    const backgroundPrompt = advancedPrompts.buildBackgroundPromptCoT({
        industry: detectedIndustry,
        mood: patterns.mood || 'professional',
        colors: colorPalette,
        productType: productAnalysis?.productType,
        targetEmotion: emotion,
        style: atmosphereStyle === 'premium' ? 'premium_dark' : 'gradient_mesh',
        canvasWidth: multiFormat.AD_FORMATS[format]?.width || 1080,
        canvasHeight: multiFormat.AD_FORMATS[format]?.height || 1080
    });

    // ════════════════════════════════════════
    // STEP 11: ANIMATION SPEC
    // ════════════════════════════════════════

    const animationPreset = animation.getAnimationPreset(atmosphereStyle);
    const animationCSS = animation.generateAdAnimationCSS({
        ...animationPreset,
        glowColor: colorPalette.accent || colorPalette.primary,
        featureCount: patterns.features?.length || 4
    });

    // ════════════════════════════════════════
    // STEP 12: FORMAT LAYOUT
    // ════════════════════════════════════════

    const formatLayout = multiFormat.getFormatLayout(format);

    // ════════════════════════════════════════
    // STEP 13: VARIANT GENERATION (optional)
    // ════════════════════════════════════════

    let variants = null;
    if (enableVariants) {
        variants = generateCreativeVariants({
            baseDesign: {
                colors: colorPalette,
                typography: typographySpec,
                layout: compositionSpec,
                copy: copyPackage
            },
            count: variantCount,
            variationTypes: ['color', 'copy', 'layout']
        });
        console.log(`[DesignIntel]   Variants: ${variants.length} generated`);
    }

    // ════════════════════════════════════════
    // COMPILE FINAL INTELLIGENCE
    // ════════════════════════════════════════

    const designIntelligence = {
        // Source
        source: {
            foreplayDriven: !!foreplayAnalysis,
            industry: detectedIndustry,
            emotion,
            format
        },

        // Core Design
        colors: colorPalette,
        typography: typographySpec,
        composition: compositionSpec,

        // Elements
        elements: selectedElements,
        overlays: overlaySpecs,

        // Content
        copy: copyPackage,

        // Product
        product: {
            rules: productRules,
            mockup: mockupRecommendation,
            effects: effectRecommendations
        },

        // AI Generation
        prompts: {
            background: backgroundPrompt
        },

        // Layout
        layout: formatLayout,

        // Animation
        animation: {
            preset: animationPreset,
            css: animationCSS
        },

        // Variants
        variants,

        // Technical
        canvas: {
            width: multiFormat.AD_FORMATS[format]?.width || 1080,
            height: multiFormat.AD_FORMATS[format]?.height || 1080,
            format
        }
    };

    console.log('[DesignIntel] ✅ Design Intelligence generated');

    return designIntelligence;
}

// ========================================
// QUICK FOREPLAY ANALYSIS
// ========================================

/**
 * Quick analyze Foreplay results for design decisions
 */
export async function quickForeplayAnalysis(referenceAds) {
    if (!referenceAds || referenceAds.length === 0) {
        return getDefaultDesignPatterns();
    }

    // Use deep Foreplay matcher
    try {
        const analysis = await deepAnalyzeForeplayPatterns(referenceAds);
        return analysis;
    } catch (error) {
        console.warn('[DesignIntel] Foreplay analysis fallback:', error.message);
        return getDefaultDesignPatterns();
    }
}

// ========================================
// HELPERS
// ========================================

function detectAdType(patterns) {
    if (patterns.discountBadge || patterns.sale) return 'ecommerce_sale';
    if (patterns.rating || patterns.testimonial) return 'social_proof';
    if (patterns.features) return 'feature_highlight';
    if (patterns.comparison) return 'comparison';
    if (patterns.premium || patterns.luxury) return 'luxury';
    if (patterns.tech || patterns.data) return 'tech';
    return 'saas_app'; // Default
}

function detectAtmosphereStyle(effects, mood) {
    if (mood === 'luxury' || mood === 'premium') return 'premium';
    if (mood === 'exciting' || mood === 'energetic') return 'energetic';
    if (mood === 'calm' || mood === 'peaceful') return 'calm';
    if (mood === 'tech' || mood === 'innovative') return 'tech';
    return 'premium'; // Default
}

function countElements(elements) {
    return Object.values(elements).reduce((sum, arr) => sum + (arr?.length || 0), 0);
}

function getDefaultDesignPatterns() {
    return {
        designPatterns: {
            mood: 'professional',
            style: 'premium_dark'
        },
        colorPalette: {
            primary: '#3B82F6',
            secondary: '#8B5CF6',
            accent: '#10B981',
            background: '#0A0A1A'
        },
        typography: {},
        effects: {
            hasBokeh: true,
            hasParticles: true,
            hasVignette: true
        },
        layout: {
            type: 'centered_hero',
            productEmphasis: 0.6,
            textPosition: 'top'
        }
    };
}

// ========================================
// EXPORTS
// ========================================

export {
    // Re-export all modules for direct access
    colorScience,
    typography,
    brandDNA,
    composition,
    materials,
    aiCritic,
    masterDesigner,
    shapes,
    dataViz,
    icons,
    badges,
    glass,
    textFx,
    callouts,
    overlays,
    elementOrchestrator,
    advancedPrompts,
    animation,
    multiFormat
};

export default {
    generateDesignIntelligence,
    quickForeplayAnalysis
};
