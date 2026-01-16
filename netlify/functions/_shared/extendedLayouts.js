/**
 * Extended Layout Patterns - 15+ Additional Designer-Level Layouts
 * Brings total to 30+ unique ad layouts
 */

export const EXTENDED_LAYOUTS = {
    // ========================================
    // CATEGORY: DYNAMIC & MOTION
    // ========================================

    floating_particles: {
        id: 'floating_particles',
        name: 'Floating Product with Particles',
        nameDE: 'Schwebendes Produkt mit Partikeln',
        description: 'Product floating with confetti, sparkles, or particles around it. Celebratory feel.',

        zones: [
            { id: 'headline', position: 'top', size: 'medium' },
            { id: 'product', position: 'center-float', size: '60%' },
            { id: 'particles', position: 'around-product', size: 'scattered' },
            { id: 'cta', position: 'bottom', size: 'medium' },
        ],

        designElements: [
            { type: 'floating_effect', style: 'levitation with shadow' },
            { type: 'particles', style: 'confetti, sparkles, or abstract shapes' },
            { type: 'glow', style: 'subtle product glow' },
        ],

        promptTemplate: `Celebratory product advertisement with floating effect.
{PRODUCT} appears to float magically in center of frame, subtle shadow below suggesting levitation.
{PARTICLE_TYPE} (confetti/sparkles/abstract geometric shapes) scattered around product creating energy.
{BACKGROUND_COLOR} solid or gradient background.
Headline "{HEADLINE}" at top in bold typography.
CTA "{CTA}" at bottom.
Celebratory, exciting, premium launch feel.
This is a PARTY for the product.`,
    },

    collage_mood: {
        id: 'collage_mood',
        name: 'Collage / Mood Board',
        nameDE: 'Collage / Moodboard',
        description: 'Multiple images arranged as artistic collage. Editorial magazine style.',

        zones: [
            { id: 'main_image', position: 'center-large', size: '50%' },
            { id: 'small_1', position: 'top-left', size: '20%' },
            { id: 'small_2', position: 'top-right', size: '20%' },
            { id: 'small_3', position: 'bottom-left', size: '20%' },
            { id: 'small_4', position: 'bottom-right', size: '20%' },
            { id: 'headline', position: 'overlay', size: 'large' },
        ],

        designElements: [
            { type: 'photo_frames', style: 'polaroid or clean white borders' },
            { type: 'tape_elements', style: 'washi tape accents' },
            { type: 'handwritten', style: 'annotations' },
        ],

        promptTemplate: `Editorial collage/mood board style advertisement.
Multiple images arranged artistically like a magazine mood board or Pinterest collection:
- Main hero: {PRODUCT} or {LIFESTYLE_IMAGE} (largest, center)
- Supporting images: lifestyle moments, details, textures
- Polaroid-style frames or clean borders
- Optional: washi tape, paper clips, handwritten notes
- Bold headline "{HEADLINE}" overlaid
Editorial, curated, aspirational aesthetic.`,
    },

    magazine_editorial: {
        id: 'magazine_editorial',
        name: 'Magazine Editorial',
        nameDE: 'Magazin Editorial',
        description: 'High-fashion magazine layout with dramatic typography.',

        zones: [
            { id: 'photo', position: 'full-bleed', size: '100%' },
            { id: 'headline', position: 'left-thirds', size: 'massive' },
            { id: 'body', position: 'left-lower', size: 'small' },
            { id: 'logo', position: 'corner', size: 'small' },
        ],

        promptTemplate: `High-fashion magazine editorial advertisement.
Full-bleed {PRODUCT} or {LIFESTYLE_IMAGE} as background.
Massive bold headline "{HEADLINE}" positioned dramatically on left third.
Small elegant body text below headline.
Vogue/GQ level editorial design.
Typography is ART, not just text.
Dramatic, aspirational, runway-worthy.`,
    },

    // ========================================
    // CATEGORY: ILLUSTRATIVE & ARTISTIC
    // ========================================

    photo_illustration_hybrid: {
        id: 'photo_illustration_hybrid',
        name: 'Photo + Illustration Hybrid',
        nameDE: 'Foto + Illustration Hybrid',
        description: 'Real product photo with illustrated elements around it.',

        zones: [
            { id: 'product_photo', position: 'center', size: '50%' },
            { id: 'illustrations', position: 'around', size: 'various' },
            { id: 'headline', position: 'top', size: 'medium' },
            { id: 'cta', position: 'bottom', size: 'medium' },
        ],

        designElements: [
            { type: 'hand_drawn', style: 'arrows, stars, exclamations' },
            { type: 'doodles', style: 'playful sketches' },
            { type: 'icons', style: 'illustrated icons' },
        ],

        promptTemplate: `Creative hybrid of photography and illustration.
Real photo of {PRODUCT} in center.
Hand-drawn illustrated elements around product:
- Playful arrows pointing to features
- Stars, sparkles, exclamation marks
- Doodle annotations
- Illustrated icons representing benefits
Headline "{HEADLINE}" in bold modern font.
CTA "{CTA}" at bottom.
Fun, creative, eye-catching, social media native.`,
    },

    watercolor_artistic: {
        id: 'watercolor_artistic',
        name: 'Watercolor / Artistic Style',
        nameDE: 'Aquarell / Künstlerisch',
        description: 'Product with watercolor or artistic painted background.',

        zones: [
            { id: 'product', position: 'center', size: '50%' },
            { id: 'artistic_bg', position: 'background', size: '100%' },
            { id: 'headline', position: 'top', size: 'artistic' },
        ],

        promptTemplate: `Artistic watercolor style advertisement.
{PRODUCT} photographed cleanly, placed over artistic watercolor background.
Watercolor washes in {COLORS} creating organic, flowing backdrop.
Headline "{HEADLINE}" in elegant brush-style or serif font.
Artistic, premium, gallery-worthy aesthetic.
The product is GROUNDED in art.`,
    },

    neon_cyberpunk: {
        id: 'neon_cyberpunk',
        name: 'Neon / Cyberpunk',
        nameDE: 'Neon / Cyberpunk',
        description: 'Futuristic neon-lit product with cyberpunk aesthetic.',

        zones: [
            { id: 'product', position: 'center', size: '60%' },
            { id: 'neon_elements', position: 'around', size: 'various' },
            { id: 'headline', position: 'top', size: 'neon-style' },
            { id: 'grid', position: 'background', size: '100%' },
        ],

        promptTemplate: `Futuristic neon cyberpunk advertisement.
{PRODUCT} lit dramatically with neon colored lighting (cyan, magenta, purple).
Dark background (black or deep blue) with neon grid lines.
Glowing neon accents and reflections.
Headline "{HEADLINE}" in futuristic neon-glow typography.
Sci-fi, gaming, tech-forward aesthetic.
The future is NOW.`,
    },

    retro_vintage: {
        id: 'retro_vintage',
        name: 'Retro / Vintage',
        nameDE: 'Retro / Vintage',
        description: '70s/80s/90s inspired retro design with nostalgic elements.',

        zones: [
            { id: 'product', position: 'center', size: '50%' },
            { id: 'retro_graphics', position: 'around', size: 'various' },
            { id: 'headline', position: 'top', size: 'retro-typography' },
            { id: 'badge', position: 'corner', size: 'sticker' },
        ],

        promptTemplate: `Retro nostalgic advertisement style.
{PRODUCT} in center with vintage-inspired styling.
Design elements from {ERA} (70s/80s/90s):
- Retro color palette (muted or bold depending on era)
- Vintage typography (groovy, chrome, pixel depending on era)
- Period-appropriate graphic elements
- Nostalgic textures (grain, halftone, VHS)
Headline "{HEADLINE}" in {ERA}-appropriate font.
Nostalgic, fun, stands out in modern feed.`,
    },

    // ========================================
    // CATEGORY: GEOMETRIC & STRUCTURED
    // ========================================

    geometric_abstract: {
        id: 'geometric_abstract',
        name: 'Geometric Abstract',
        nameDE: 'Geometrisch Abstrakt',
        description: 'Product with bold geometric shapes as backdrop.',

        zones: [
            { id: 'product', position: 'center', size: '50%' },
            { id: 'shapes', position: 'background', size: 'various' },
            { id: 'headline', position: 'integrated', size: 'medium' },
        ],

        promptTemplate: `Bold geometric abstract advertisement.
{PRODUCT} centered with geometric shapes as backdrop:
- Circles, triangles, rectangles in {COLORS}
- Overlapping transparencies
- Dynamic diagonal compositions
Headline "{HEADLINE}" integrated into geometric composition.
Modern, bold, graphic design forward.
Think Bauhaus meets Instagram.`,
    },

    split_diagonal: {
        id: 'split_diagonal',
        name: 'Diagonal Split',
        nameDE: 'Diagonale Teilung',
        description: 'Dramatic diagonal split composition.',

        zones: [
            { id: 'left_section', position: 'left-diagonal', size: '50%' },
            { id: 'right_section', position: 'right-diagonal', size: '50%' },
            { id: 'product', position: 'overlap-center', size: '40%' },
            { id: 'headline', position: 'top-left', size: 'large' },
            { id: 'benefits', position: 'bottom-right', size: 'medium' },
        ],

        promptTemplate: `Dynamic diagonal split composition.
Image split diagonally:
- Left section: {COLOR_1} or {IMAGE_1}
- Right section: {COLOR_2} or {IMAGE_2}
{PRODUCT} overlapping the split line in center.
Headline "{HEADLINE}" in left section.
Benefits or CTA in right section.
Dynamic, modern, movement-creating.`,
    },

    frames_windows: {
        id: 'frames_windows',
        name: 'Framed Windows',
        nameDE: 'Gerahmte Fenster',
        description: 'Product shown through elegant frame or window cutouts.',

        zones: [
            { id: 'frame', position: 'full', size: '100%' },
            { id: 'content', position: 'inside-frame', size: '80%' },
            { id: 'headline', position: 'below-frame', size: 'medium' },
        ],

        promptTemplate: `Elegant framed window advertisement.
{PRODUCT} or {LIFESTYLE_SCENE} visible through elegant frame or arch cutout.
Frame design: {FRAME_STYLE} (ornate, minimal, arch, circle).
Clean space outside frame for branding.
Headline "{HEADLINE}" below or beside frame.
Gallery, museum, curated aesthetic.`,
    },

    // ========================================
    // CATEGORY: SOCIAL PROOF & TRUST
    // ========================================

    review_showcase: {
        id: 'review_showcase',
        name: 'Review Showcase',
        nameDE: 'Bewertungs-Showcase',
        description: 'Multiple reviews/ratings prominently displayed.',

        zones: [
            { id: 'product', position: 'center-left', size: '40%' },
            { id: 'review_1', position: 'right-top', size: 'medium' },
            { id: 'review_2', position: 'right-middle', size: 'medium' },
            { id: 'review_3', position: 'right-bottom', size: 'medium' },
            { id: 'overall_rating', position: 'bottom', size: 'large' },
        ],

        designElements: [
            { type: 'star_ratings', style: '5-star filled' },
            { type: 'quote_cards', style: 'subtle shadows' },
            { type: 'avatars', style: 'circular photos' },
        ],

        promptTemplate: `Trust-building review showcase advertisement.
{PRODUCT} on left side.
Right side shows 3 customer reviews with:
- Star rating (⭐⭐⭐⭐⭐)
- Review snippet in quotes
- Customer name/avatar
Bottom: large overall rating display "{RATING} stars from {NUMBER} reviews"
Trust, social proof, credibility.`,
    },

    ugc_authentic: {
        id: 'ugc_authentic',
        name: 'UGC / Authentic User Content',
        nameDE: 'UGC / Authentischer Nutzer-Content',
        description: 'Made to look like real user-generated content.',

        zones: [
            { id: 'main_photo', position: 'full', size: '100%' },
            { id: 'username', position: 'top-left', size: 'small' },
            { id: 'comment', position: 'bottom', size: 'medium' },
            { id: 'likes', position: 'bottom-right', size: 'small' },
        ],

        promptTemplate: `Authentic UGC-style advertisement.
Photo looks like real customer photo, not studio:
- Natural lighting, slightly imperfect
- Real person using/showing {PRODUCT}
- Authentic, not posed professionally
UI overlay suggesting social media:
- Username "@{USERNAME}"
- Comment text "{COMMENT}"
- Likes/engagement numbers
Authentic, relatable, trustworthy.
NOT an ad, a real recommendation.`,
    },

    expert_endorsed: {
        id: 'expert_endorsed',
        name: 'Expert Endorsed',
        nameDE: 'Experten-Empfehlung',
        description: 'Professional/expert endorsement or certification.',

        zones: [
            { id: 'product', position: 'left', size: '50%' },
            { id: 'expert_photo', position: 'right-top', size: 'medium' },
            { id: 'credentials', position: 'right-middle', size: 'small' },
            { id: 'quote', position: 'right-bottom', size: 'medium' },
            { id: 'seal', position: 'corner', size: 'medium' },
        ],

        promptTemplate: `Expert-endorsed professional advertisement.
{PRODUCT} on left with professional lighting.
Right side features expert endorsement:
- Professional photo of expert
- Credentials "{CREDENTIALS}" (Dr., CEO, Expert, etc.)
- Expert quote "{QUOTE}"
- Certification seal/badge if applicable
Authority, trust, professional validation.`,
    },

    // ========================================
    // CATEGORY: SALE & PROMOTION
    // ========================================

    flash_sale_timer: {
        id: 'flash_sale_timer',
        name: 'Flash Sale with Timer',
        nameDE: 'Flash Sale mit Timer',
        description: 'Urgent sale with countdown timer visual.',

        zones: [
            { id: 'discount', position: 'top-center', size: 'massive' },
            { id: 'product', position: 'center', size: '40%' },
            { id: 'timer', position: 'top-right', size: 'medium' },
            { id: 'prices', position: 'bottom-left', size: 'medium' },
            { id: 'cta', position: 'bottom-right', size: 'large' },
        ],

        designElements: [
            { type: 'starburst', style: 'discount explosion' },
            { type: 'countdown', style: 'digital timer display' },
            { type: 'strikethrough', style: 'old price crossed out' },
        ],

        promptTemplate: `Urgent flash sale advertisement.
MASSIVE discount display "{DISCOUNT}" in starburst/explosion shape.
{PRODUCT} centered dramatically.
Countdown timer visual showing urgency: "{TIME_LEFT}" (HH:MM:SS style).
Price display: Old price struck through, new price bold.
CTA "{CTA}" in urgent button style.
FOMO, urgency, limited time, ACT NOW.`,
    },

    bundle_deal: {
        id: 'bundle_deal',
        name: 'Bundle Deal',
        nameDE: 'Bundle-Angebot',
        description: 'Multiple products as bundle/package deal.',

        zones: [
            { id: 'headline', position: 'top', size: 'large' },
            { id: 'product_1', position: 'left', size: '30%' },
            { id: 'product_2', position: 'center', size: '30%' },
            { id: 'product_3', position: 'right', size: '30%' },
            { id: 'plus_signs', position: 'between-products', size: 'small' },
            { id: 'total_value', position: 'bottom', size: 'large' },
        ],

        promptTemplate: `Bundle deal package advertisement.
Headline "{HEADLINE}" (e.g., "The Complete Kit").
3 products shown in row:
{PRODUCT_1} + {PRODUCT_2} + {PRODUCT_3}
Plus signs (+) between products.
Value display: "Value: {OLD_VALUE} → Only {NEW_VALUE}"
Savings highlighted.
Complete solution, better together, smart purchase.`,
    },

    // ========================================
    // CATEGORY: EDUCATIONAL & INFORMATIVE
    // ========================================

    how_to_use: {
        id: 'how_to_use',
        name: 'How To Use',
        nameDE: 'Anwendungsanleitung',
        description: 'Step-by-step usage instructions with visuals.',

        zones: [
            { id: 'headline', position: 'top', size: 'medium' },
            { id: 'step_1', position: 'left', size: '32%' },
            { id: 'step_2', position: 'center', size: '32%' },
            { id: 'step_3', position: 'right', size: '32%' },
            { id: 'result', position: 'bottom', size: 'medium' },
        ],

        designElements: [
            { type: 'step_numbers', style: 'circled 1, 2, 3' },
            { type: 'arrows', style: 'forward progression' },
            { type: 'result_badge', style: 'success indicator' },
        ],

        promptTemplate: `Educational how-to-use advertisement.
Headline "{HEADLINE}" (e.g., "Easy as 1-2-3").
3 steps shown visually in sequence:
1. "{STEP_1}" with visual
2. "{STEP_2}" with visual
3. "{STEP_3}" with visual
Arrows between steps showing progression.
Final result/benefit shown at bottom.
Simple, clear, removes friction.`,
    },

    myth_vs_fact: {
        id: 'myth_vs_fact',
        name: 'Myth vs Fact',
        nameDE: 'Mythos vs. Fakt',
        description: 'Debunking myths with facts about product.',

        zones: [
            { id: 'headline', position: 'top', size: 'medium' },
            { id: 'myth_side', position: 'left', size: '45%' },
            { id: 'fact_side', position: 'right', size: '45%' },
            { id: 'product', position: 'bottom-center', size: 'medium' },
        ],

        promptTemplate: `Educational myth vs fact advertisement.
Split layout:
LEFT (Myth - red X): "{MYTH}" - crossed out, debunked
RIGHT (Fact - green check): "{FACT}" - proven true
{PRODUCT} at bottom as the solution.
Educational, trust-building, objection-handling.
Replace doubt with confidence.`,
    },
};

/**
 * Get extended layout by ID
 */
export function getExtendedLayout(layoutId) {
    return EXTENDED_LAYOUTS[layoutId] || null;
}

/**
 * Get all extended layouts
 */
export function getAllExtendedLayouts() {
    return Object.values(EXTENDED_LAYOUTS);
}

/**
 * Creative Variation Generator - Generate multiple ad variations
 */
export function generateVariations(baseConfig, count = 3) {
    const variations = [];

    // Variation strategies
    const strategies = [
        'layout_swap',      // Different layout, same content
        'color_shift',      // Same layout, different colors
        'headline_alt',     // Alternative headline approach
        'style_change',     // Different visual style
        'emphasis_shift',   // Different element emphasized
    ];

    for (let i = 0; i < count; i++) {
        const strategy = strategies[i % strategies.length];
        const variation = applyVariationStrategy(baseConfig, strategy, i);
        variations.push({
            id: `variation_${i + 1}`,
            strategy: strategy,
            ...variation,
        });
    }

    return variations;
}

/**
 * Apply variation strategy to base config
 */
function applyVariationStrategy(baseConfig, strategy, index) {
    const variation = { ...baseConfig };

    switch (strategy) {
        case 'layout_swap':
            // Suggest alternative layouts
            const allLayouts = ['feature_callout_arrows', 'checklist_benefits', 'hero_with_badge', 'lifestyle_scene'];
            variation.alternateLayout = allLayouts[index % allLayouts.length];
            variation.description = 'Alternative layout arrangement';
            break;

        case 'color_shift':
            // Suggest color variations
            variation.colorMood = ['energetic', 'calm', 'bold', 'elegant'][index % 4];
            variation.description = `Color mood: ${variation.colorMood}`;
            break;

        case 'headline_alt':
            // Suggest headline variations
            variation.headlineApproach = ['question', 'benefit', 'urgency', 'social-proof'][index % 4];
            variation.description = `Headline style: ${variation.headlineApproach}`;
            break;

        case 'style_change':
            // Suggest style variations
            variation.visualStyle = ['minimal', 'bold', 'playful', 'premium'][index % 4];
            variation.description = `Visual style: ${variation.visualStyle}`;
            break;

        case 'emphasis_shift':
            // Shift emphasis
            variation.emphasis = ['product', 'benefit', 'social-proof', 'urgency'][index % 4];
            variation.description = `Emphasis on: ${variation.emphasis}`;
            break;
    }

    return variation;
}

/**
 * Creative Score Algorithm - Predict ad performance
 */
export function calculateCreativeScore(adConfig) {
    let score = 50; // Base score
    const factors = [];

    // Headline quality
    if (adConfig.headline) {
        const headlineLength = adConfig.headline.length;
        if (headlineLength >= 20 && headlineLength <= 60) {
            score += 10;
            factors.push({ name: 'Optimal headline length', impact: +10 });
        }

        // Contains numbers
        if (/\d+/.test(adConfig.headline)) {
            score += 8;
            factors.push({ name: 'Headline contains numbers', impact: +8 });
        }

        // Power words
        const powerWords = ['free', 'new', 'now', 'save', 'exclusive', 'limited', 'frei', 'neu', 'jetzt', 'sparen'];
        if (powerWords.some(word => adConfig.headline.toLowerCase().includes(word))) {
            score += 7;
            factors.push({ name: 'Contains power words', impact: +7 });
        }
    }

    // Feature count
    if (adConfig.features) {
        if (adConfig.features.length >= 3 && adConfig.features.length <= 5) {
            score += 10;
            factors.push({ name: 'Optimal feature count (3-5)', impact: +10 });
        }
    }

    // Has social proof
    if (adConfig.badge || adConfig.rating || adConfig.testimonial) {
        score += 12;
        factors.push({ name: 'Includes social proof', impact: +12 });
    }

    // Has clear CTA
    if (adConfig.cta && adConfig.cta.length >= 10) {
        score += 8;
        factors.push({ name: 'Has clear CTA', impact: +8 });
    }

    // Uses product image
    if (adConfig.productImageUrl || adConfig.visionDescription) {
        score += 10;
        factors.push({ name: 'Uses real product image', impact: +10 });
    }

    // Industry-specific layout
    if (adConfig.industryMatch) {
        score += 5;
        factors.push({ name: 'Industry-optimized layout', impact: +5 });
    }

    // Cap at 100
    score = Math.min(score, 100);

    return {
        score,
        grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
        factors,
        recommendation: score < 70 ? 'Add more social proof and specific numbers' : 'Great creative! Ready for testing.',
    };
}
