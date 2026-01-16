/**
 * Composition Engine - Designer-Level Ad Generation
 * Combines: Layout Templates + Design Elements + Product Info + Text
 * Outputs: Detailed gpt-image-1 prompts that generate designer-quality ads
 */

import { getAdLayout, recommendLayouts, getAllAdLayouts } from './adLayoutTemplates.js';
import {
    buildElementPrompt,
    buildBackgroundPrompt,
    getRandomColorFromStyle,
    ARROW_STYLES,
    BADGE_STYLES,
    ICON_STYLES,
} from './designElementLibrary.js';

/**
 * Main composition function - builds a complete image prompt
 */
export function composeAdPrompt(options) {
    const {
        layoutId,
        product,
        features = [],
        headline,
        subheadline,
        cta,
        badge,
        visionDescription, // Detailed product description from Vision API
        brandColor,
        language = 'de',
        tone = 'professional',
    } = options;

    // Get layout template
    const layout = getAdLayout(layoutId) || getAdLayout('feature_callout_arrows');

    // Determine background color
    const bgColor = brandColor || getRandomColorFromStyle(layout.colorScheme.background);

    // Build the prompt from layout template
    let prompt = layout.promptTemplate;

    // Replace product placeholder
    const productDesc = visionDescription || product.description || product.name;
    prompt = prompt.replace('{PRODUCT}', productDesc);
    prompt = prompt.replace('{PRODUCT_DESCRIPTION}', productDesc);

    // Replace background color
    prompt = prompt.replace('{BACKGROUND_COLOR}', describeColor(bgColor));
    prompt = prompt.replace('{ARROW_COLOR}', 'dark charcoal or brand-matching');

    // Replace headline
    prompt = prompt.replace('{HEADLINE}', headline || product.name);
    prompt = prompt.replace('{SUBHEADLINE}', subheadline || '');

    // Replace CTA
    prompt = prompt.replace('{CTA}', cta || 'Jetzt entdecken');

    // Replace features
    features.forEach((feature, index) => {
        prompt = prompt.replace(`{FEATURE_${index + 1}}`, feature);
        prompt = prompt.replace(`{BENEFIT_${index + 1}}`, feature);
    });

    // Clean up unreplaced placeholders
    prompt = prompt.replace(/\{FEATURE_\d+\}/g, '');
    prompt = prompt.replace(/\{BENEFIT_\d+\}/g, '');
    prompt = prompt.replace(/\{[A-Z_]+\}/g, '');

    // Add badge if provided
    if (badge) {
        prompt += `\nTrust badge prominently displayed: "${badge}" in award ribbon or seal style.`;
    }

    // Add quality and technical specifications
    prompt += buildQualitySpecs();

    // Add product integrity rules if we have vision description
    if (visionDescription) {
        prompt += buildProductIntegrityRules(visionDescription);
    }

    return {
        prompt: prompt.trim(),
        layout: layout,
        metadata: {
            layoutId: layout.id,
            layoutName: layout.name,
            backgroundColor: bgColor,
            featureCount: features.length,
        },
    };
}

/**
 * Auto-compose - Analyzes content and picks best layout automatically
 */
export function autoComposeAdPrompt(options) {
    const {
        product,
        features = [],
        headline,
        cta,
        hasTestimonial = false,
        isSale = false,
        isAnnouncement = false,
        isMinimal = false,
        hasBeforeAfter = false,
    } = options;

    // Recommend best layouts
    const recommendations = recommendLayouts({
        hasMultipleFeatures: features.length >= 3,
        featureCount: features.length,
        hasTestimonial,
        isSale,
        isAnnouncement,
        isMinimal,
        hasBeforeAfter,
    });

    // Use top recommendation
    const bestLayout = recommendations[0];

    return composeAdPrompt({
        ...options,
        layoutId: bestLayout.id,
    });
}

/**
 * Describe a hex color in words for the AI
 */
function describeColor(hexColor) {
    const colorNames = {
        '#F5A623': 'warm orange-yellow',
        '#FF6B6B': 'coral red',
        '#4ECDC4': 'teal turquoise',
        '#45B7D1': 'sky blue',
        '#96CEB4': 'sage green',
        '#FFEAA7': 'soft yellow',
        '#DDA0DD': 'soft plum purple',
        '#98D8C8': 'mint green',
        '#F7DC6F': 'golden yellow',
        '#AED6F1': 'light blue',
        '#F5B7B1': 'blush pink',
        '#D7BDE2': 'lavender',
        '#FCF3CF': 'cream yellow',
        '#E8DAEF': 'soft violet',
        '#F5F5F0': 'off-white',
        '#E5E5E5': 'light gray',
        '#FAFAFA': 'near white',
        '#F0EAD6': 'warm cream',
    };

    return colorNames[hexColor] || 'vibrant brand color';
}

/**
 * Build quality specification section
 */
function buildQualitySpecs() {
    return `

TECHNICAL SPECIFICATIONS (CRITICAL):
- Aspect ratio: 1:1 (1024x1024 optimal for Instagram/Facebook feed)
- Style: Professional advertising photography and graphic design hybrid
- Quality: Ultra-high resolution, magazine-quality, agency-produced aesthetic
- Typography: All text must be PERFECTLY LEGIBLE, no artistic blur or distortion
- Modern design principles: proper visual hierarchy, balanced composition, intentional whitespace

MOBILE-FIRST DESIGN:
- Composition must work on small screens (320px width)
- Key elements centered, not at extreme edges
- Text large enough to read on mobile
- Strong contrast for outdoor viewing

PROFESSIONAL STANDARDS:
- This should look like a $50,000 agency campaign
- Think: Apple, Nike, Glossier level design quality
- Every element intentional, nothing random
- Clean, polished, scroll-stopping`;
}

/**
 * Build product integrity rules for vision-analyzed products
 */
function buildProductIntegrityRules(visionDescription) {
    return `

🚨 CRITICAL: PRODUCT INTEGRITY (HIGHEST PRIORITY)
The product must appear EXACTLY as described. This is NON-NEGOTIABLE:

PRODUCT VISUAL SPECIFICATIONS:
${visionDescription}

STRICT RULES:
1. Product SHAPE, GEOMETRY, PROPORTIONS = IDENTICAL to description
2. Product COLORS = EXACT match (no shifts, no "improvements")
3. Product LOGOS, TEXT, MARKINGS = PRESERVED exactly
4. Product MATERIAL TEXTURE = Match (matte stays matte, glossy stays glossy)
5. ONLY background, lighting, camera angle may be adjusted
6. The product is the UNTOUCHABLE ANCHOR - design adapts around it

If any doubt, prioritize ACCURACY over aesthetics.`;
}

/**
 * Build feature callout prompt section
 */
export function buildFeatureCalloutsPrompt(features, style = 'arrows') {
    if (!features || features.length === 0) return '';

    const positions = [
        'top-left of product',
        'top-right of product',
        'bottom-left of product',
        'bottom-right of product',
        'left of product',
        'right of product',
    ];

    let prompt = '\nFEATURE CALLOUTS:\n';

    features.slice(0, 6).forEach((feature, index) => {
        const position = positions[index];

        if (style === 'arrows') {
            prompt += `- "${feature}" positioned ${position}, connected to product with curved hand-drawn arrow\n`;
        } else if (style === 'dotted') {
            prompt += `- "${feature}" positioned ${position}, connected to product with dotted line and circle marker\n`;
        } else if (style === 'checklist') {
            prompt += `- ✓ "${feature}" in white pill-shaped box with checkmark icon\n`;
        }
    });

    return prompt;
}

/**
 * Build badge/trust signal prompt section
 */
export function buildBadgePrompt(badgeText, badgeStyle = 'ribbon_award') {
    if (!badgeText) return '';

    const style = BADGE_STYLES[badgeStyle] || BADGE_STYLES.ribbon_award;

    return `
TRUST BADGE:
${style.promptFragment}
Badge text: "${badgeText}"
Position: Prominent but not competing with headline
May include: star rating (⭐⭐⭐⭐⭐), award symbol, or certification mark`;
}

/**
 * Get available layout IDs for frontend dropdown
 */
export function getLayoutOptions() {
    return getAllAdLayouts().map(layout => ({
        id: layout.id,
        name: layout.name,
        nameDE: layout.nameDE,
        description: layout.description,
    }));
}

/**
 * Validate composition inputs
 */
export function validateCompositionInputs(options) {
    const errors = [];

    if (!options.product?.name && !options.headline) {
        errors.push('Product name or headline required');
    }

    if (options.features && options.features.length > 6) {
        errors.push('Maximum 6 features supported');
    }

    if (options.headline && options.headline.length > 60) {
        errors.push('Headline should be under 60 characters');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
