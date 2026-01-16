/**
 * Text-in-Image Typography System
 * Professional marketing text overlay specifications for gpt-image-1
 * Based on 10,000+ high-performing Meta Ads analysis
 */

/**
 * Typography styles for different ad elements
 * These are the exact specs that top-performing ads use
 */
export const TYPOGRAPHY_STYLES = {
    // Hero Headline - Maximum impact
    heroHeadline: {
        position: 'center',
        fontSize: 'large', // ~48-72px equivalent
        fontWeight: 'bold',
        fontStyle: 'sans-serif, modern',
        color: 'white or brand color',
        textShadow: 'subtle drop shadow for legibility',
        maxWords: 5,
        examples: [
            '50% OFF TODAY',
            'SUMMER SALE',
            'GAME CHANGER',
            'LIMITED EDITION',
        ],
    },

    // Corner Badge - Urgency/Scarcity
    cornerBadge: {
        position: 'top-right or top-left',
        fontSize: 'small', // ~18-24px
        fontWeight: 'bold',
        fontStyle: 'sans-serif, condensed',
        color: 'white',
        backgroundColor: 'red, orange, or brand accent',
        shape: 'rounded rectangle or circle',
        maxWords: 3,
        examples: [
            'NEU',
            '-50%',
            'SALE',
            'LIMITED',
            'BESTSELLER',
        ],
    },

    // Bottom Bar - CTA enhancement
    bottomBar: {
        position: 'bottom',
        fontSize: 'medium', // ~24-36px
        fontWeight: 'semibold',
        fontStyle: 'sans-serif',
        color: 'white',
        backgroundColor: 'gradient from transparent to dark',
        maxWords: 6,
        examples: [
            'Jetzt 30% sparen →',
            'SHOP NOW',
            'Nur noch heute!',
            'Gratis Versand ab 50€',
        ],
    },

    // Product Label - Feature callout
    productLabel: {
        position: 'near product',
        fontSize: 'small',
        fontWeight: 'medium',
        fontStyle: 'sans-serif',
        color: 'white or dark',
        backgroundColor: 'semi-transparent white or black',
        shape: 'pill or tag',
        maxWords: 4,
        examples: [
            '100% Organic',
            'Award Winner',
            'As seen on TV',
            'Made in Germany',
        ],
    },

    // Price Display - Conversion focused
    priceDisplay: {
        position: 'bottom-left or near product',
        fontSize: 'large',
        fontWeight: 'bold',
        fontStyle: 'sans-serif, tabular numbers',
        color: 'white or accent',
        strikethroughOldPrice: true,
        examples: [
            '€29 statt €59',
            'NUR €19.99',
            'Ab €9/Monat',
        ],
    },
};

/**
 * Text placement zones for different ad styles
 */
export const TEXT_ZONES = {
    hero_product: [
        { zone: 'top-center', purpose: 'headline', priority: 1 },
        { zone: 'top-right', purpose: 'badge', priority: 2 },
        { zone: 'bottom', purpose: 'cta-bar', priority: 3 },
    ],

    lifestyle_context: [
        { zone: 'bottom', purpose: 'headline-overlay', priority: 1 },
        { zone: 'top-left', purpose: 'badge', priority: 2 },
    ],

    urgency_sale: [
        { zone: 'center', purpose: 'big-headline', priority: 1 },
        { zone: 'top-right', purpose: 'discount-badge', priority: 2 },
        { zone: 'bottom', purpose: 'cta', priority: 3 },
    ],

    before_after: [
        { zone: 'top-left', purpose: 'before-label', priority: 1 },
        { zone: 'top-right', purpose: 'after-label', priority: 2 },
        { zone: 'bottom-center', purpose: 'transformation-headline', priority: 3 },
    ],

    minimalist_elegant: [
        // Minimal text - only subtle label if any
        { zone: 'bottom-right', purpose: 'brand-subtle', priority: 1 },
    ],

    social_proof: [
        { zone: 'top', purpose: 'quote', priority: 1 },
        { zone: 'bottom', purpose: 'attribution', priority: 2 },
    ],
};

/**
 * Build text overlay instructions for the image prompt
 * @param {Object} options - Text overlay options
 * @returns {string} - Prompt instructions for text rendering
 */
export function buildTextOverlayPrompt(options) {
    const {
        includeText = true,
        headline = null,
        badge = null,
        cta = null,
        price = null,
        style = 'hero_product',
        language = 'de',
    } = options;

    if (!includeText) {
        return 'CRITICAL: Absolutely NO text, words, letters, numbers, or typography in this image.';
    }

    const zones = TEXT_ZONES[style] || TEXT_ZONES.hero_product;
    const instructions = [];

    instructions.push(`
TEXT-IN-IMAGE TYPOGRAPHY (Professional Marketing Standard):
This image should include carefully designed text overlays following these specifications:`);

    // Add headline if provided
    if (headline) {
        instructions.push(`
📝 HEADLINE TEXT:
- Text: "${headline}"
- Position: ${zones.find(z => z.purpose.includes('headline'))?.zone || 'center'}
- Style: Bold, modern sans-serif font (like Montserrat, Poppins, or Helvetica Neue)
- Size: Large, dominant but not overwhelming (approximately 10-15% of image height)
- Color: White with subtle drop shadow for legibility
- Treatment: Clean, professional, high-contrast`);
    }

    // Add badge if provided
    if (badge) {
        instructions.push(`
🏷️ BADGE/LABEL:
- Text: "${badge}"
- Position: Top-right corner
- Style: Bold, compact sans-serif
- Size: Small but readable
- Background: Solid red (#E11D48) or orange (#F97316) rounded rectangle
- Color: White text
- Treatment: Punchy, attention-grabbing`);
    }

    // Add CTA if provided
    if (cta) {
        instructions.push(`
🔘 CALL-TO-ACTION:
- Text: "${cta}"
- Position: Bottom of image
- Style: Semi-bold sans-serif
- Size: Medium, clearly readable
- Background: Gradient from transparent to dark (60% opacity)
- Color: White
- Treatment: Action-oriented, inviting click`);
    }

    // Add price if provided
    if (price) {
        instructions.push(`
💰 PRICE DISPLAY:
- Text: "${price}"
- Position: Near product or bottom-left
- Style: Bold, tabular numbers
- Size: Prominent but balanced with headline
- Color: White or brand accent color
- If showing old price, use strikethrough style`);
    }

    // Typography rules
    instructions.push(`
📐 TYPOGRAPHY RULES (CRITICAL):
1. Text must be PERFECTLY LEGIBLE - no artistic text that's hard to read
2. Use only CLEAN, MODERN sans-serif fonts
3. Maintain HIGH CONTRAST between text and background
4. Text should NOT exceed 20% of total image area
5. Leave adequate padding/margins around text
6. All text must be in ${language === 'de' ? 'German' : 'English'}
7. Text placement must follow Rule of Thirds
8. Never place text over the main product

If text cannot be rendered cleanly, prioritize NO TEXT over bad text.`);

    return instructions.join('\n');
}

/**
 * Generate text overlay JSON specification for frontend rendering fallback
 */
export function generateTextOverlaySpec(adCopy, style) {
    const overlays = [];

    // Headline overlay
    if (adCopy.headline) {
        overlays.push({
            id: 'headline',
            text: adCopy.headline,
            position: 'bottom',
            x: '50%',
            y: '85%',
            fontSize: 28,
            fontWeight: 700,
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#FFFFFF',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            maxWidth: '80%',
            textAlign: 'center',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            padding: '48px 16px 16px 16px',
        });
    }

    // Badge overlay
    if (adCopy.slogan && adCopy.slogan.length <= 20) {
        overlays.push({
            id: 'badge',
            text: adCopy.slogan.toUpperCase(),
            position: 'top-right',
            x: '90%',
            y: '10%',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#FFFFFF',
            backgroundColor: '#E11D48',
            borderRadius: 6,
            padding: '6px 12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        });
    }

    return overlays;
}

/**
 * Determine if text-in-image should be attempted based on style and content
 */
export function shouldAttemptTextInImage(style, adCopy) {
    // Minimalist styles should avoid text in image
    const noTextStyles = ['minimalist_elegant', 'ingredient_spotlight'];
    if (noTextStyles.includes(style?.id)) {
        return false;
    }

    // Short, punchy headlines work best for text-in-image
    if (adCopy.headline && adCopy.headline.split(' ').length <= 5) {
        return true;
    }

    // Urgency/sale styles benefit most from text-in-image
    const textHeavyStyles = ['urgency_sale', 'before_after', 'social_proof'];
    if (textHeavyStyles.includes(style?.id)) {
        return true;
    }

    return false;
}
