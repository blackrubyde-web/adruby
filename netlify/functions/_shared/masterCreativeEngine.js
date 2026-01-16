/**
 * Master Creative Engine - Unified Intelligence System
 * Combines all intelligent systems into one cohesive engine
 * This is the BRAIN of the ad generation system
 */

import { getAdLayout, recommendLayouts, AD_LAYOUTS } from './adLayoutTemplates.js';
import { getExtendedLayout, getAllExtendedLayouts, generateVariations, calculateCreativeScore, EXTENDED_LAYOUTS } from './extendedLayouts.js';
import { getIndustryPack, detectIndustry, applyIndustryToPrompt, getIndustryColor, getIndustryLayouts } from './industryIntelligence.js';
import { buildOptimalPalette, extractColorsFromDescription, describePaletteForPrompt, getContrastingTextColor } from './colorHarmonyEngine.js';
import { recommendFontPairing, buildTypographyPrompt } from './typographyPairings.js';
import { buildElementPrompt, buildBackgroundPrompt } from './designElementLibrary.js';

/**
 * Master Creative Engine - Main Entry Point
 * Takes raw inputs and produces optimized, intelligent ad specifications
 */
export function masterCreativeEngine(inputs) {
    const {
        // Product info
        productName,
        productDescription,
        productImageUrl,
        visionDescription,

        // User preferences
        industry: userIndustry,
        targetAudience,
        goal = 'conversion',
        tone = 'professional',
        language = 'de',

        // Optional overrides
        layoutId: userLayoutId,
        colorOverride,
        fontPairingId,

        // Content
        headline,
        subheadline,
        features = [],
        cta,
        badge,
        testimonial,
    } = inputs;

    // ========================================
    // STEP 1: Industry Detection & Intelligence
    // ========================================
    const detectedIndustry = userIndustry || detectIndustry(productDescription || productName);
    const industryPack = getIndustryPack(detectedIndustry);

    console.log(`[Master Engine] Detected industry: ${detectedIndustry}`);

    // ========================================
    // STEP 2: Color Intelligence
    // ========================================
    const productColors = visionDescription ? extractColorsFromDescription(visionDescription) : [];

    const colorPalette = buildOptimalPalette({
        industry: detectedIndustry,
        goal: goal,
        productColors: productColors,
        brandColor: colorOverride,
        mood: tone === 'playful' ? 'energetic' : tone === 'premium' ? 'elegant' : 'balanced',
    });

    console.log(`[Master Engine] Color palette: ${colorPalette.primary} (${colorPalette.harmonyType})`);

    // ========================================
    // STEP 3: Layout Selection Algorithm
    // ========================================
    let selectedLayout;
    let layoutSource;

    if (userLayoutId) {
        // User override
        selectedLayout = getAdLayout(userLayoutId) || getExtendedLayout(userLayoutId);
        layoutSource = 'user-selected';
    } else {
        // Intelligent selection
        selectedLayout = selectOptimalLayout({
            industry: detectedIndustry,
            features: features,
            hasTestimonial: !!testimonial,
            hasBadge: !!badge,
            goal: goal,
            tone: tone,
        });
        layoutSource = 'ai-optimized';
    }

    console.log(`[Master Engine] Selected layout: ${selectedLayout?.id} (${layoutSource})`);

    // ========================================
    // STEP 4: Typography Selection
    // ========================================
    const fontPairing = fontPairingId
        ? { id: fontPairingId }
        : recommendFontPairing(detectedIndustry);

    console.log(`[Master Engine] Typography: ${fontPairing.id}`);

    // ========================================
    // STEP 5: Build Master Prompt
    // ========================================
    const masterPrompt = buildMasterPrompt({
        layout: selectedLayout,
        industryPack: industryPack,
        colorPalette: colorPalette,
        fontPairing: fontPairing,
        product: {
            name: productName,
            description: productDescription,
            visionDescription: visionDescription,
        },
        content: {
            headline: headline,
            subheadline: subheadline,
            features: features,
            cta: cta || 'Jetzt entdecken',
            badge: badge,
        },
    });

    // ========================================
    // STEP 6: Generate Variations
    // ========================================
    const variations = generateVariations({
        layoutId: selectedLayout?.id,
        industry: detectedIndustry,
        goal: goal,
    }, 3);

    // ========================================
    // STEP 7: Calculate Creative Score
    // ========================================
    const creativeScore = calculateCreativeScore({
        headline: headline,
        features: features,
        badge: badge,
        cta: cta,
        productImageUrl: productImageUrl,
        visionDescription: visionDescription,
        industryMatch: true,
    });

    console.log(`[Master Engine] Creative score: ${creativeScore.score}/100 (${creativeScore.grade})`);

    // ========================================
    // RETURN COMPLETE CREATIVE SPECIFICATION
    // ========================================
    return {
        // Primary prompt for image generation
        imagePrompt: masterPrompt,

        // Metadata
        metadata: {
            industry: detectedIndustry,
            industryPack: industryPack.name,
            layout: selectedLayout?.id,
            layoutName: selectedLayout?.name,
            layoutSource: layoutSource,
            colorPalette: {
                primary: colorPalette.primary,
                secondary: colorPalette.secondary,
                accent: colorPalette.accent,
                harmony: colorPalette.harmonyType,
            },
            typography: fontPairing.id,
        },

        // Variations for A/B testing
        variations: variations,

        // Quality score
        creativeScore: creativeScore,

        // Recommendations
        recommendations: {
            layouts: getIndustryLayouts(detectedIndustry),
            triggers: industryPack.triggers,
            avoidColors: industryPack.colorPalette?.avoid || [],
        },
    };
}

/**
 * Intelligent Layout Selection Algorithm
 */
function selectOptimalLayout(options) {
    const { industry, features, hasTestimonial, hasBadge, goal, tone } = options;

    // Get industry-preferred layouts
    const industryLayouts = getIndustryLayouts(industry);

    // Score each layout based on content match
    const allLayouts = { ...AD_LAYOUTS, ...EXTENDED_LAYOUTS };
    const scoredLayouts = [];

    for (const [id, layout] of Object.entries(allLayouts)) {
        let score = 0;

        // Industry match
        if (industryLayouts.includes(id)) {
            score += 30;
        }

        // Feature count match
        if (features.length >= 4 && (id.includes('callout') || id.includes('grid'))) {
            score += 25;
        } else if (features.length === 3 && (id.includes('checklist') || id.includes('steps'))) {
            score += 25;
        } else if (features.length <= 2 && (id.includes('hero') || id.includes('minimal'))) {
            score += 25;
        }

        // Testimonial match
        if (hasTestimonial && (id.includes('testimonial') || id.includes('review') || id.includes('ugc'))) {
            score += 20;
        }

        // Badge match
        if (hasBadge && id.includes('badge')) {
            score += 15;
        }

        // Goal match
        if (goal === 'sale' && (id.includes('sale') || id.includes('urgency') || id.includes('flash'))) {
            score += 25;
        }
        if (goal === 'awareness' && (id.includes('lifestyle') || id.includes('editorial'))) {
            score += 20;
        }
        if (goal === 'trust' && (id.includes('social') || id.includes('expert') || id.includes('review'))) {
            score += 20;
        }

        // Tone match
        if (tone === 'playful' && (id.includes('playful') || id.includes('illustration') || id.includes('collage'))) {
            score += 15;
        }
        if (tone === 'premium' && (id.includes('minimal') || id.includes('editorial') || id.includes('elegant'))) {
            score += 15;
        }

        scoredLayouts.push({ id, layout, score });
    }

    // Sort by score and return top
    scoredLayouts.sort((a, b) => b.score - a.score);

    return scoredLayouts[0]?.layout || AD_LAYOUTS.feature_callout_arrows;
}

/**
 * Build the master image prompt from all components
 */
function buildMasterPrompt(config) {
    const { layout, industryPack, colorPalette, fontPairing, product, content } = config;

    // Start with layout template
    let prompt = layout.promptTemplate || '';

    // Replace product placeholder
    const productDesc = product.visionDescription || product.description || product.name;
    prompt = prompt.replace(/\{PRODUCT\}/g, productDesc);
    prompt = prompt.replace(/\{PRODUCT_DESCRIPTION\}/g, productDesc);

    // Replace color placeholders
    prompt = prompt.replace(/\{BACKGROUND_COLOR\}/g, describeColor(colorPalette.primary));
    prompt = prompt.replace(/\{COLOR_1\}/g, describeColor(colorPalette.primary));
    prompt = prompt.replace(/\{COLOR_2\}/g, describeColor(colorPalette.secondary));
    prompt = prompt.replace(/\{COLORS\}/g, `${describeColor(colorPalette.primary)} and ${describeColor(colorPalette.accent)}`);

    // Replace content placeholders
    prompt = prompt.replace(/\{HEADLINE\}/g, content.headline || product.name);
    prompt = prompt.replace(/\{SUBHEADLINE\}/g, content.subheadline || '');
    prompt = prompt.replace(/\{CTA\}/g, content.cta);
    prompt = prompt.replace(/\{BADGE_TEXT\}/g, content.badge || '');

    // Replace features
    content.features.forEach((feature, index) => {
        prompt = prompt.replace(`{FEATURE_${index + 1}}`, feature);
        prompt = prompt.replace(`{BENEFIT_${index + 1}}`, feature);
    });

    // Clean up unreplaced placeholders
    prompt = prompt.replace(/\{[A-Z_0-9]+\}/g, '');

    // Add industry-specific enhancement
    prompt += '\n\n' + industryPack.promptEnhancement;

    // Add typography specification
    prompt += '\n' + buildTypographyPrompt(fontPairing.id);

    // Add color palette specification
    prompt += describePaletteForPrompt(colorPalette);

    // Add universal quality standards
    prompt += buildUniversalQualityStandards();

    // Add product integrity if vision description available
    if (product.visionDescription) {
        prompt += buildProductIntegrityRules(product.visionDescription);
    }

    return prompt.trim();
}

/**
 * Describe hex color in words
 */
function describeColor(hex) {
    // Simple color name lookup
    const colors = {
        '#F5A623': 'warm vibrant orange',
        '#FF6B6B': 'coral red',
        '#4ECDC4': 'teal turquoise',
        '#3498DB': 'sky blue',
        '#9B59B6': 'rich purple',
        '#2ECC71': 'fresh green',
        '#F1C40F': 'bright yellow',
        '#1A1A1A': 'deep black',
        '#FFFFFF': 'pure white',
    };

    return colors[hex] || `vibrant color (${hex})`;
}

/**
 * Universal quality standards for all ads
 */
function buildUniversalQualityStandards() {
    return `

## UNIVERSAL QUALITY STANDARDS (MANDATORY)

### Technical Specifications:
- Resolution: Ultra-high quality, magazine-grade
- Aspect Ratio: 1:1 (1024x1024) optimized for Instagram/Facebook
- Mobile-first: Must look perfect on small screens

### Design Excellence:
- This must look like a $50,000 agency campaign
- Every element intentional, nothing random
- Perfect visual hierarchy
- Professional typography with zero errors
- Colors harmonious and purposeful

### Typography Rules:
- All text PERFECTLY LEGIBLE
- No artistic distortion of letters
- High contrast between text and background
- Professional, modern typefaces only

### Composition:
- Rule of thirds applied
- Clear focal point (product)
- Balanced negative space
- No cluttered or busy feeling
`;
}

/**
 * Product integrity rules
 */
function buildProductIntegrityRules(visionDescription) {
    return `

## PRODUCT INTEGRITY (NON-NEGOTIABLE)

The product MUST appear EXACTLY as described:
${visionDescription}

STRICT PRESERVATION RULES:
1. Product SHAPE/GEOMETRY = IDENTICAL
2. Product COLORS = EXACT MATCH (no shifts)
3. Product LOGOS/TEXT = PRESERVED
4. Product TEXTURE = MATCH (matte/glossy as described)
5. ONLY background, lighting, angle may change
6. Product is the UNTOUCHABLE ANCHOR
`;
}

/**
 * Get all available layouts (combined)
 */
export function getAllLayouts() {
    return {
        core: Object.keys(AD_LAYOUTS),
        extended: Object.keys(EXTENDED_LAYOUTS),
        total: Object.keys(AD_LAYOUTS).length + Object.keys(EXTENDED_LAYOUTS).length,
    };
}

/**
 * Get layout by ID from any source
 */
export function getAnyLayout(layoutId) {
    return getAdLayout(layoutId) || getExtendedLayout(layoutId);
}
