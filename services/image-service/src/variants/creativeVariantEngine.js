/**
 * CREATIVE VARIANT ENGINE
 * 
 * Generates multiple ad variants with:
 * - Different layouts for A/B testing
 * - Emotional approach variations
 * - Visual style alternatives
 * - Copy variants
 * - CTA variations
 * - Color scheme alternatives
 * - Social proof positioning
 */

import { getIndustryConfig } from '../data/industryDatabase.js';

// ========================================
// VARIANT STRATEGIES
// ========================================

export const VARIANT_STRATEGIES = {
    // Layout-focused variants
    layout: {
        name: 'Layout Variants',
        description: 'Same content, different layouts',
        variants: [
            { id: 'hero_centered', name: 'Hero Centered', productPosition: 'center', textPosition: 'top' },
            { id: 'hero_left', name: 'Product Left', productPosition: 'left', textPosition: 'right' },
            { id: 'hero_right', name: 'Product Right', productPosition: 'right', textPosition: 'left' },
            { id: 'split_screen', name: 'Split Screen', productPosition: 'right_half', textPosition: 'left_half' },
            { id: 'floating_ui', name: 'Floating Elements', productPosition: 'offset_center', textPosition: 'top' },
            { id: 'minimal', name: 'Minimal Focus', productPosition: 'center', textPosition: 'bottom' }
        ]
    },

    // Emotional approach variants
    emotional: {
        name: 'Emotional Variants',
        description: 'Same product, different emotional appeals',
        variants: [
            { id: 'benefit_focused', name: 'Benefit-Focused', approach: 'rational', hook: 'value_proposition' },
            { id: 'pain_point', name: 'Pain Point', approach: 'problem_solution', hook: 'frustration' },
            { id: 'aspirational', name: 'Aspirational', approach: 'emotional', hook: 'desire' },
            { id: 'fomo', name: 'FOMO/Urgency', approach: 'urgency', hook: 'scarcity' },
            { id: 'social_proof', name: 'Social Proof', approach: 'trust', hook: 'validation' },
            { id: 'curiosity', name: 'Curiosity Gap', approach: 'intrigue', hook: 'mystery' }
        ]
    },

    // Visual style variants
    visual: {
        name: 'Visual Style Variants',
        description: 'Same content, different visual treatments',
        variants: [
            { id: 'dark_premium', name: 'Dark Premium', bgStyle: 'dark', effects: 'premium', contrast: 'high' },
            { id: 'light_clean', name: 'Light Clean', bgStyle: 'light', effects: 'minimal', contrast: 'medium' },
            { id: 'vibrant_bold', name: 'Vibrant Bold', bgStyle: 'gradient', effects: 'vibrant', contrast: 'high' },
            { id: 'minimal_elegant', name: 'Minimal Elegant', bgStyle: 'subtle', effects: 'refined', contrast: 'low' },
            { id: 'gradient_mesh', name: 'Gradient Mesh', bgStyle: 'mesh', effects: 'modern', contrast: 'medium' },
            { id: 'lifestyle', name: 'Lifestyle Focus', bgStyle: 'warm', effects: 'organic', contrast: 'medium' }
        ]
    },

    // CTA variants
    cta: {
        name: 'CTA Variants',
        description: 'Same creative, different calls-to-action',
        variants: [
            { id: 'direct', name: 'Direct Action', text: 'Buy Now', style: 'bold', urgency: 'high' },
            { id: 'soft', name: 'Soft Entry', text: 'Learn More', style: 'soft', urgency: 'low' },
            { id: 'trial', name: 'Trial Offer', text: 'Start Free Trial', style: 'gradient', urgency: 'medium' },
            { id: 'exclusive', name: 'Exclusive', text: 'Get Early Access', style: 'glow', urgency: 'high' },
            { id: 'savings', name: 'Savings Focused', text: 'Save 50% Today', style: 'urgent', urgency: 'high' },
            { id: 'curious', name: 'Curiosity', text: 'See How It Works', style: 'minimal', urgency: 'low' }
        ]
    },

    // Color scheme variants
    color: {
        name: 'Color Variants',
        description: 'Same layout, different color schemes',
        variants: [
            { id: 'brand_primary', name: 'Brand Primary', useAccent: true, bgTone: 'dark' },
            { id: 'brand_secondary', name: 'Brand Secondary', useSecondary: true, bgTone: 'dark' },
            { id: 'monochrome', name: 'Monochrome', useMonochrome: true, bgTone: 'dark' },
            { id: 'complementary', name: 'Complementary', useComplementary: true, bgTone: 'dark' },
            { id: 'warm', name: 'Warm Tones', useWarm: true, bgTone: 'warm' },
            { id: 'cool', name: 'Cool Tones', useCool: true, bgTone: 'cool' }
        ]
    },

    // Platform-optimized variants
    platform: {
        name: 'Platform Variants',
        description: 'Optimized for specific platforms',
        variants: [
            { id: 'meta_feed', name: 'Meta Feed', format: '1:1', style: 'scroll_stopping', cta: 'prominent' },
            { id: 'meta_story', name: 'Meta Story', format: '9:16', style: 'immersive', cta: 'swipe_up' },
            { id: 'tiktok', name: 'TikTok', format: '9:16', style: 'native_feel', cta: 'subtle' },
            { id: 'linkedin', name: 'LinkedIn', format: '1:1', style: 'professional', cta: 'business' },
            { id: 'google_display', name: 'Google Display', format: 'various', style: 'clean', cta: 'clear' },
            { id: 'pinterest', name: 'Pinterest', format: '2:3', style: 'aspirational', cta: 'inspire' }
        ]
    }
};

// ========================================
// CREATIVE VARIANT GENERATOR
// ========================================

/**
 * Generate multiple creative variants
 */
export function generateCreativeVariants({
    baseCreative,
    productAnalysis,
    industry,
    strategies = ['layout', 'emotional', 'visual'],
    variantsPerStrategy = 3,
    maxTotalVariants = 10
}) {
    const variants = [];
    const industryConfig = getIndustryConfig(industry);

    for (const strategyKey of strategies) {
        const strategy = VARIANT_STRATEGIES[strategyKey];
        if (!strategy) continue;

        const strategyVariants = strategy.variants.slice(0, variantsPerStrategy);

        for (const variant of strategyVariants) {
            if (variants.length >= maxTotalVariants) break;

            variants.push({
                id: `${strategyKey}_${variant.id}`,
                name: variant.name,
                strategy: strategyKey,
                strategyName: strategy.name,
                config: buildVariantConfig(variant, strategyKey, industryConfig, productAnalysis)
            });
        }
    }

    return variants;
}

/**
 * Build variant configuration
 */
function buildVariantConfig(variant, strategy, industryConfig, productAnalysis) {
    const config = { ...variant };

    switch (strategy) {
        case 'layout':
            config.layoutPreset = variant.id;
            config.productPosition = variant.productPosition;
            config.textPosition = variant.textPosition;
            break;

        case 'emotional':
            config.headlineApproach = variant.approach;
            config.emotionalHook = variant.hook;
            config.copyTone = getEmotionalTone(variant.approach);
            break;

        case 'visual':
            config.backgroundStyle = variant.bgStyle;
            config.effectLevel = variant.effects;
            config.contrastLevel = variant.contrast;
            break;

        case 'cta':
            config.ctaText = variant.text;
            config.ctaStyle = variant.style;
            config.urgencyLevel = variant.urgency;
            break;

        case 'color':
            config.colorStrategy = variant;
            config.palette = selectColorPalette(variant, industryConfig);
            break;

        case 'platform':
            config.aspectRatio = variant.format;
            config.platformStyle = variant.style;
            config.ctaPlacement = variant.cta;
            break;
    }

    return config;
}

/**
 * Get emotional tone for copy
 */
function getEmotionalTone(approach) {
    const tones = {
        rational: { primary: 'informative', secondary: 'confident' },
        problem_solution: { primary: 'empathetic', secondary: 'reassuring' },
        emotional: { primary: 'inspiring', secondary: 'aspirational' },
        urgency: { primary: 'urgent', secondary: 'exciting' },
        trust: { primary: 'confident', secondary: 'trustworthy' },
        intrigue: { primary: 'mysterious', secondary: 'curious' }
    };
    return tones[approach] || tones.rational;
}

/**
 * Select color palette for color variant
 */
function selectColorPalette(variant, industryConfig) {
    const basePalette = industryConfig?.palette || {
        bg: '#0A0A1A',
        accent: '#FF4757',
        secondary: '#6C5CE7',
        text: '#FFFFFF'
    };

    if (variant.useMonochrome) {
        return {
            bg: '#0A0A0A',
            accent: '#FFFFFF',
            secondary: '#888888',
            text: '#FFFFFF'
        };
    }

    if (variant.useComplementary) {
        return {
            ...basePalette,
            accent: getComplementaryColor(basePalette.accent)
        };
    }

    if (variant.useWarm) {
        return {
            bg: '#1C1917',
            accent: '#F97316',
            secondary: '#FBBF24',
            text: '#FFFFFF'
        };
    }

    if (variant.useCool) {
        return {
            bg: '#0C4A6E',
            accent: '#38BDF8',
            secondary: '#7DD3FC',
            text: '#FFFFFF'
        };
    }

    return basePalette;
}

/**
 * Get complementary color
 */
function getComplementaryColor(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

// ========================================
// A/B TEST VARIANT PAIRS
// ========================================

/**
 * Generate A/B test pairs
 */
export function generateABTestPairs({
    baseCreative,
    productAnalysis,
    industry,
    testFocus = 'all'
}) {
    const pairs = [];

    if (testFocus === 'all' || testFocus === 'headline') {
        pairs.push({
            name: 'Headline Test',
            description: 'Benefit vs Emotional headline',
            variantA: {
                type: 'benefit_headline',
                headline: generateBenefitHeadline(productAnalysis)
            },
            variantB: {
                type: 'emotional_headline',
                headline: generateEmotionalHeadline(productAnalysis)
            }
        });
    }

    if (testFocus === 'all' || testFocus === 'cta') {
        pairs.push({
            name: 'CTA Test',
            description: 'Direct vs Soft CTA',
            variantA: {
                type: 'direct_cta',
                cta: 'Buy Now',
                ctaStyle: 'bold'
            },
            variantB: {
                type: 'soft_cta',
                cta: 'Learn More',
                ctaStyle: 'soft'
            }
        });
    }

    if (testFocus === 'all' || testFocus === 'layout') {
        pairs.push({
            name: 'Layout Test',
            description: 'Centered vs Asymmetric',
            variantA: {
                type: 'centered',
                layout: 'hero_centered'
            },
            variantB: {
                type: 'asymmetric',
                layout: 'hero_left'
            }
        });
    }

    if (testFocus === 'all' || testFocus === 'social_proof') {
        pairs.push({
            name: 'Social Proof Test',
            description: 'With vs Without social proof',
            variantA: {
                type: 'with_social_proof',
                showRating: true,
                showReviews: true
            },
            variantB: {
                type: 'without_social_proof',
                showRating: false,
                showReviews: false
            }
        });
    }

    if (testFocus === 'all' || testFocus === 'urgency') {
        pairs.push({
            name: 'Urgency Test',
            description: 'With vs Without urgency badge',
            variantA: {
                type: 'with_urgency',
                showUrgencyBadge: true,
                urgencyText: 'Limited Time Offer'
            },
            variantB: {
                type: 'without_urgency',
                showUrgencyBadge: false
            }
        });
    }

    return pairs;
}

function generateBenefitHeadline(productAnalysis) {
    const benefits = productAnalysis?.keyBenefits || ['Save Time', 'Boost Productivity'];
    return benefits[0] || 'Discover the Difference';
}

function generateEmotionalHeadline(productAnalysis) {
    const name = productAnalysis?.productName || 'This';
    return `Transform Your Life with ${name}`;
}

// ========================================
// BATCH VARIANT GENERATION
// ========================================

/**
 * Generate a batch of variants for production
 */
export function generateVariantBatch({
    productAnalysis,
    industry,
    headline,
    tagline,
    cta,
    batchSize = 5,
    includeABTests = true
}) {
    const batch = [];

    // Get industry-specific recommendations
    const industryConfig = getIndustryConfig(industry);
    const subCategory = industryConfig?.subCategory;

    // Prioritize layouts based on product type
    const prioritizedLayouts = getPrioritizedLayouts(subCategory?.productTypes, subCategory?.mockupPreference);

    // Generate main variants
    for (let i = 0; i < Math.min(batchSize, prioritizedLayouts.length); i++) {
        const layout = prioritizedLayouts[i];
        const visualVariant = VARIANT_STRATEGIES.visual.variants[i % VARIANT_STRATEGIES.visual.variants.length];
        const ctaVariant = VARIANT_STRATEGIES.cta.variants[i % VARIANT_STRATEGIES.cta.variants.length];

        batch.push({
            id: `variant_${i + 1}`,
            name: `Variant ${i + 1}: ${layout.name}`,
            layout: layout.id,
            visual: {
                style: visualVariant.bgStyle,
                effects: visualVariant.effects,
                contrast: visualVariant.contrast
            },
            cta: {
                text: ctaVariant.text,
                style: ctaVariant.style,
                urgency: ctaVariant.urgency
            },
            copy: {
                headline: headline || generateBenefitHeadline(productAnalysis),
                tagline: tagline
            },
            priority: i + 1,
            testable: i < 2 // First 2 for A/B testing
        });
    }

    // Add A/B test pairs if requested
    if (includeABTests) {
        const pairs = generateABTestPairs({ productAnalysis, industry, testFocus: 'headline' });
        batch.push({
            id: 'ab_test_headline',
            name: 'A/B Test: Headline',
            isABTest: true,
            pairs: pairs[0]
        });
    }

    return batch;
}

/**
 * Get prioritized layouts for product type
 */
function getPrioritizedLayouts(productTypes, mockupPreferences) {
    const layouts = VARIANT_STRATEGIES.layout.variants;

    if (productTypes?.some(pt => ['dashboard', 'saas', 'browser'].includes(pt))) {
        // Software products - prefer browser mockups
        return [
            layouts.find(l => l.id === 'floating_ui'),
            layouts.find(l => l.id === 'hero_centered'),
            layouts.find(l => l.id === 'split_screen'),
            ...layouts
        ].filter(Boolean);
    }

    if (productTypes?.some(pt => ['phone', 'mobile_app', 'ios'].includes(pt))) {
        // Mobile products - centered works well
        return [
            layouts.find(l => l.id === 'hero_centered'),
            layouts.find(l => l.id === 'minimal'),
            layouts.find(l => l.id === 'hero_left'),
            ...layouts
        ].filter(Boolean);
    }

    if (mockupPreferences?.includes('lifestyle')) {
        // Lifestyle products - asymmetric with space for copy
        return [
            layouts.find(l => l.id === 'hero_left'),
            layouts.find(l => l.id === 'hero_right'),
            layouts.find(l => l.id === 'split_screen'),
            ...layouts
        ].filter(Boolean);
    }

    // Default ordering
    return layouts;
}

// ========================================
// VARIANT SCORING
// ========================================

/**
 * Score variant performance prediction
 */
export function predictVariantPerformance(variant, productAnalysis, industryConfig) {
    let score = 50; // Base score

    // Layout alignment with product type
    if (industryConfig?.subCategory?.mockupPreference) {
        const prefs = industryConfig.subCategory.mockupPreference;
        if (prefs.includes('browser') && variant.layout === 'floating_ui') score += 15;
        if (prefs.includes('phone') && variant.layout === 'hero_centered') score += 15;
        if (prefs.includes('lifestyle') && variant.layout === 'hero_left') score += 10;
    }

    // CTA alignment with industry
    if (industryConfig?.subCategory?.ctaStyles?.includes(variant.cta?.style)) {
        score += 10;
    }

    // Emotional approach alignment
    if (industryConfig?.subCategory?.emotionalTriggers) {
        const triggers = industryConfig.subCategory.emotionalTriggers;
        if (triggers.includes('efficiency') && variant.emotional === 'benefit_focused') score += 10;
        if (triggers.includes('desire') && variant.emotional === 'aspirational') score += 10;
        if (triggers.includes('protection') && variant.emotional === 'pain_point') score += 10;
    }

    // Visual style alignment
    if (industryConfig?.subCategory?.visualStyle) {
        const style = industryConfig.subCategory.visualStyle;
        if (style.includes('dark') && variant.visual?.style === 'dark_premium') score += 10;
        if (style.includes('clean') && variant.visual?.style === 'minimal_elegant') score += 10;
        if (style.includes('vibrant') && variant.visual?.style === 'vibrant_bold') score += 10;
    }

    return Math.min(100, score);
}

export default {
    VARIANT_STRATEGIES,
    generateCreativeVariants,
    generateABTestPairs,
    generateVariantBatch,
    predictVariantPerformance
};
