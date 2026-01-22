/**
 * REFERENCE PATTERN LIBRARY
 * 
 * Extracted visual patterns from 45 high-converting Meta ad references.
 * Each pattern includes prompt snippets that guide Gemini to recreate the style.
 * 
 * Pattern categories:
 * 1. Feature Callouts - Arrows pointing to product features
 * 2. Us vs Them - Split comparison layout
 * 3. Benefit Checkmarks - Clean benefit list with checkmarks
 * 4. Lifestyle Action - Product in aspirational context
 * 5. Collage Grid - Multiple products with central CTA
 * 6. Before/After - Visual transformation comparison
 */

export const REFERENCE_PATTERNS = {
    feature_callouts: {
        id: 'feature_callouts',
        name: 'Feature Callouts',
        description: 'Curved arrows pointing to product features with labels',
        bestFor: ['electronics', 'gadgets', 'tools', 'footwear', 'accessories'],
        visualElements: ['curved_arrows', 'feature_labels', 'product_center'],
        textPlacement: 'scattered_around_product',
        colorScheme: 'product_derived',
        conversionStrength: 9,
        promptSnippet: `
STYLE: Feature Callouts (High-Performance Ad Style)

LAYOUT:
- Product positioned prominently in CENTER or slightly off-center
- 3-5 curved white/light arrows pointing FROM labels TO specific product features
- Each arrow has a small circular origin point at the label

FEATURE LABELS:
- Clean sans-serif font (Inter, SF Pro, or similar)
- Each label has subtle pill-shaped background or drop shadow
- Labels positioned strategically around product WITHOUT overlapping
- Use ™ or ® symbols for branded features

ARROWS:
- Smooth bezier curves, not straight lines
- Subtle drop shadow for depth
- Arrow heads are small and elegant
- Flow naturally from label to feature

BACKGROUND:
- Lifestyle scene showing product IN USE (not just floating)
- Dynamic elements (water splash, motion blur, dust) add energy
- Professional photography lighting

TYPOGRAPHY:
- Headline at TOP: Bold, impactful statement
- Feature labels: Medium weight, 16-20px equivalent
- Optional subheadline below headline
`
    },

    us_vs_them: {
        id: 'us_vs_them',
        name: 'Us vs Them Comparison',
        description: 'Split screen showing product vs competitor/problem',
        bestFor: ['sustainability', 'health', 'premium_alternatives', 'eco_friendly'],
        visualElements: ['split_layout', 'contrast_colors', 'emoji_indicators'],
        textPlacement: 'left_right_columns',
        colorScheme: 'green_vs_gray',
        conversionStrength: 10,
        promptSnippet: `
STYLE: Us vs Them Comparison (High-Converting Split Layout)

LAYOUT:
- Perfect 50/50 vertical split
- LEFT side = YOUR PRODUCT (the hero, positive)
- RIGHT side = COMPETITOR/PROBLEM (the villain, negative)
- Clear visual divider (thin line or color boundary)

LEFT SIDE (POSITIVE):
- Bright, fresh colors (mint, green, blue, white)
- Product shown beautifully, premium lighting
- 👍 or ✨ emoji at top
- Headline: Positive statement (e.g., "Endless refills.")
- 3-4 benefit bullet points below

RIGHT SIDE (NEGATIVE):
- Muted, dull colors (gray, black, beige)
- Competitor product or problematic alternative
- 👎 or 🚫 emoji at top
- Headline: Negative statement (e.g., "Endless landfills.")
- 3-4 negative points below

BOTTOM:
- Brand logo centered
- Bold CTA button spanning full width
- Trust badges (payment methods) optional

TYPOGRAPHY:
- Headlines: Large, bold, contrasting
- Bullet points: Clean, easy to scan
- Emphasis on KEY WORDS with bold or color
`
    },

    benefit_checkmarks: {
        id: 'benefit_checkmarks',
        name: 'Benefit List with Checkmarks',
        description: 'Clean checkmark list showing product benefits',
        bestFor: ['food', 'beverages', 'supplements', 'kitchen', 'home'],
        visualElements: ['checkmark_icons', 'horizontal_bars', 'product_left'],
        textPlacement: 'stacked_right',
        colorScheme: 'brand_accent',
        conversionStrength: 8,
        promptSnippet: `
STYLE: Benefit Checkmarks (Trust-Building Layout)

LAYOUT:
- Product on LEFT side (40% of width), in realistic context
- Benefits stacked on RIGHT side (60% of width)
- Clean, uncluttered composition

PRODUCT PRESENTATION:
- Product shown IN USE (hands holding, being poured, etc.)
- Natural, warm lighting
- Lifestyle context (kitchen, table, outdoor setting)
- Human element adds trust

BENEFIT LIST:
- 3-4 key benefits maximum
- Each benefit has:
  - Colored checkmark (✓) matching brand accent
  - Benefit text in clean sans-serif
  - Optional subtle background pill for each line
- Stacked vertically with consistent spacing
- Left-aligned for easy scanning

BOTTOM SECTION:
- Trust badges: Payment methods, certifications
- Subtle brand logo
- Optional CTA if space allows

COLORS:
- Warm, inviting overall palette
- Accent color for checkmarks matches product/brand
- White or light background for benefits area
`
    },

    lifestyle_action: {
        id: 'lifestyle_action',
        name: 'Lifestyle Action Shot',
        description: 'Product shown being used in aspirational context',
        bestFor: ['fashion', 'beauty', 'books', 'planners', 'self_improvement'],
        visualElements: ['human_hands', 'natural_setting', 'subtle_text'],
        textPlacement: 'top_or_bottom_overlay',
        colorScheme: 'warm_natural',
        conversionStrength: 8,
        promptSnippet: `
STYLE: Lifestyle Action Shot (Aspirational Context)

CORE CONCEPT:
- Product is BEING USED, not just displayed
- Human presence (hands, partial body) creates connection
- Scene tells a STORY about the lifestyle

COMPOSITION:
- Product is the HERO but within a lifestyle context
- Rule of thirds: Product slightly off-center
- Depth of field: Sharp product, soft background
- Props that enhance the story (flowers, coffee, fabric, books)

LIGHTING:
- Golden hour / warm natural light
- Soft shadows, no harsh contrasts
- Cozy, inviting atmosphere

TEXT OVERLAY:
- Brand name at TOP (small, elegant)
- Product name: Large, clear headline
- Brief description: 1-2 lines explaining value
- CTA at BOTTOM: Swipe-style or button

EMOTIONAL TONE:
- Aspirational: "This could be YOUR life"
- Calm, organized, beautiful
- Authenticity over perfection

COLORS:
- Warm neutrals: Beige, cream, soft brown
- Pops of green (plants) or color accents
- Nothing neon or jarring
`
    },

    collage_grid: {
        id: 'collage_grid',
        name: 'Product Collage Grid',
        description: 'Multiple product images in grid with central CTA',
        bestFor: ['bundles', 'product_lines', 'subscriptions', 'variety_packs'],
        visualElements: ['grid_layout', 'multiple_products', 'central_cta'],
        textPlacement: 'center_overlay',
        colorScheme: 'vibrant_pops',
        conversionStrength: 7,
        promptSnippet: `
STYLE: Product Collage Grid (Abundance Layout)

GRID STRUCTURE:
- 6-9 product images in asymmetric grid
- Each cell shows ONE product with props
- Central area: Clean card/overlay with CTA
- Grid creates sense of VARIETY and VALUE

INDIVIDUAL CELLS:
- Each product styled with lifestyle props
- Flat lay style works well
- Plants, fabrics, small accessories as props
- Colorful backgrounds (different per cell)
- Consistent lighting across all cells

CENTRAL CTA CARD:
- Clean white or brand-colored card
- Rounded corners, subtle shadow
- Headline: Urgency or value proposition
  - "Time for a refill?"
  - "Subscribe & save 15%!"
- CTA button: High contrast, actionable
  - "Save Now!"
  - "Shop Bundle"

COLORS:
- Energetic, vibrant palette
- Each cell can have different background color
- Creates quilt-like visual effect
- CTA card contrasts with surroundings

PURPOSE:
- Showcase product RANGE
- Create feeling of abundance
- Drive bundle/subscription purchases
`
    },

    before_after: {
        id: 'before_after',
        name: 'Before/After Comparison',
        description: 'Visual contrast showing transformation',
        bestFor: ['services', 'software', 'education', 'cleaning', 'transformation'],
        visualElements: ['side_by_side', 'contrast_pair', 'clear_labels'],
        textPlacement: 'below_each_image',
        colorScheme: 'neutral_clean',
        conversionStrength: 9,
        promptSnippet: `
STYLE: Before/After Comparison (Transformation Visual)

LAYOUT:
- Two images side by side (50/50 split)
- OR top/bottom for vertical format
- Clear visual contrast between states

LEFT/TOP (BEFORE - The Problem):
- Represents life WITHOUT the product
- Negative visual: Burnt toast, messy desk, confusion
- Muted colors, less appealing
- Label: "Without [Product]" or "You without..."

RIGHT/BOTTOM (AFTER - The Solution):
- Represents life WITH the product
- Positive visual: Perfect result, organized, success
- Bright, appealing colors
- Label: "With [Product]" or "You with..."

HEADLINE:
- Bold statement at TOP
- Often witty or clever
- Examples:
  - "Work Smart. Not Hard."
  - "The difference is clear."

VISUAL METAPHOR:
- Use universal symbols people instantly understand
- Burnt vs golden toast
- Tangled vs straight cables
- Stressed vs relaxed person

BOTTOM:
- Product/brand mention
- Simple CTA or value prop
- Clean, minimal design

COLORS:
- Neutral background (white, light gray)
- Contrast comes from the images themselves
- Accent color for labels and CTA
`
    }
};

/**
 * Select the best reference pattern based on product and context analysis
 */
export function selectBestPattern({
    productType = 'general',
    industry = 'retail',
    hasMultipleFeatures = false,
    hasCompetitor = false,
    isLifestyle = false,
    productCount = 1,
    goal = 'conversion',
    userHint = ''
}) {
    // Check user hint first (explicit pattern request)
    const hintLower = userHint.toLowerCase();
    if (hintLower.includes('vergleich') || hintLower.includes('vs') || hintLower.includes('besser als')) {
        return REFERENCE_PATTERNS.us_vs_them;
    }
    if (hintLower.includes('feature') || hintLower.includes('pfeil') || hintLower.includes('zeigen')) {
        return REFERENCE_PATTERNS.feature_callouts;
    }
    if (hintLower.includes('vorher') || hintLower.includes('nachher') || hintLower.includes('transformation')) {
        return REFERENCE_PATTERNS.before_after;
    }
    if (hintLower.includes('lifestyle') || hintLower.includes('leben') || hintLower.includes('alltag')) {
        return REFERENCE_PATTERNS.lifestyle_action;
    }

    // Score each pattern based on context
    const scores = {};

    for (const [key, pattern] of Object.entries(REFERENCE_PATTERNS)) {
        let score = pattern.conversionStrength;

        // Boost for matching product type
        if (pattern.bestFor.includes(productType)) {
            score += 3;
        }

        // Pattern-specific boosts
        if (key === 'feature_callouts' && hasMultipleFeatures) {
            score += 4;
        }
        if (key === 'us_vs_them' && hasCompetitor) {
            score += 5;
        }
        if (key === 'lifestyle_action' && isLifestyle) {
            score += 4;
        }
        if (key === 'collage_grid' && productCount > 1) {
            score += 5;
        }
        if (key === 'benefit_checkmarks' && ['food', 'health', 'supplements'].includes(industry)) {
            score += 3;
        }
        if (key === 'before_after' && ['education', 'software', 'services'].includes(industry)) {
            score += 4;
        }

        scores[key] = score;
    }

    // Find highest scoring pattern
    const bestKey = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

    console.log('[ReferencePatterns] Pattern scores:', scores);
    console.log('[ReferencePatterns] Selected:', bestKey);

    return REFERENCE_PATTERNS[bestKey];
}

/**
 * Get a random selection of patterns for A/B testing
 */
export function getPatternVariants(count = 3) {
    const patterns = Object.values(REFERENCE_PATTERNS);
    const shuffled = patterns.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

/**
 * Get pattern by ID
 */
export function getPatternById(patternId) {
    return REFERENCE_PATTERNS[patternId] || REFERENCE_PATTERNS.feature_callouts;
}

export default {
    REFERENCE_PATTERNS,
    selectBestPattern,
    getPatternVariants,
    getPatternById
};
