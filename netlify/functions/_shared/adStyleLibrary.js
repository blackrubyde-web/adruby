/**
 * Enterprise Creative Engine v2 - Ad Style Library
 * 12+ proven ad formats based on 10,000+ successful Meta Ads analysis
 * Each style includes: visual composition, copy formula, psychological triggers
 */

export const AD_STYLES = {
    // ========================================
    // CATEGORY 1: PRODUCT-FOCUSED STYLES
    // ========================================

    hero_product: {
        id: 'hero_product',
        name: 'Hero Product Shot',
        nameDE: 'Hero-Produktbild',
        description: 'Clean, premium product photography with dramatic lighting. The product is the undisputed star.',

        // When to use this style
        bestFor: ['Product launches', 'Premium brands', 'E-commerce', 'High-ticket items'],

        // Visual composition rules
        composition: {
            productPlacement: 'center-dominant',
            backgroundType: 'gradient or solid',
            lightingStyle: 'three-point studio with rim light',
            aspectRatio: '1:1 or 4:5',
            negativeSpace: '30-40%',
        },

        // Image prompt template (for DALL-E 3)
        imagePromptTemplate: `Award-winning commercial product photography of {PRODUCT_DESCRIPTION}.
Hero shot composition with product floating center-frame as the undisputed star.
Professional three-point lighting: soft key light at 45 degrees, subtle fill, dramatic rim light for edge definition.
Clean gradient background transitioning from {COLOR_1} to {COLOR_2}.
Shallow depth of field f/1.4, perfect focus on product, subtle reflection on glossy surface below.
Shot on Hasselblad H6D-100c medium format, 4K ultra-resolution.
Premium luxury brand aesthetic, magazine-quality, scroll-stopping.
CRITICAL: Absolutely NO text, words, logos, or watermarks in the image.`,

        // Copy formula
        copyFormula: {
            headline: 'Benefit + Specificity (e.g., "43% mehr [Ergebnis] in [Zeitraum]")',
            description: 'Feature-Benefit Bridge + Social Proof + Urgency',
            cta: 'Action + Value (e.g., "Jetzt 30% sichern")',
        },

        // Psychological triggers
        triggers: ['Premium perception', 'Desire', 'Quality signals'],
    },

    lifestyle_context: {
        id: 'lifestyle_context',
        name: 'Lifestyle in Context',
        nameDE: 'Lifestyle im Kontext',
        description: 'Product shown in real-life use. Aspirational but relatable.',

        bestFor: ['Fashion', 'Fitness', 'Home decor', 'Food & beverage'],

        composition: {
            productPlacement: 'natural integration, rule of thirds',
            backgroundType: 'lifestyle environment',
            lightingStyle: 'golden hour natural light',
            aspectRatio: '4:5 or 9:16',
            negativeSpace: '20-30%',
        },

        imagePromptTemplate: `Authentic lifestyle photography showing {PRODUCT_DESCRIPTION} in natural use.
Real person (age {TARGET_AGE}, {TARGET_GENDER}) using the product in {LIFESTYLE_SETTING}.
Golden hour natural lighting streaming through windows, warm and inviting atmosphere.
Documentary authenticity with commercial production value.
The product is clearly visible but feels naturally integrated, not staged.
Aspirational yet relatable - the viewer thinks "that could be me".
Shot on Sony A7IV, 35mm lens, f/2.8, shallow depth of field.
Magazine editorial quality, Instagram-worthy composition.
NO text, logos, or watermarks.`,

        copyFormula: {
            headline: 'Transformation Promise (e.g., "Endlich [Wunsch] ohne [Hindernis]")',
            description: 'Story arc: Before pain → Product solution → After joy',
            cta: 'Experience-focused (e.g., "Selbst erleben")',
        },

        triggers: ['Aspiration', 'Social belonging', 'FOMO'],
    },

    before_after: {
        id: 'before_after',
        name: 'Before/After Transformation',
        nameDE: 'Vorher/Nachher',
        description: 'Split composition showing dramatic transformation.',

        bestFor: ['Beauty', 'Fitness', 'Cleaning products', 'Home improvement'],

        composition: {
            productPlacement: 'center or between panels',
            backgroundType: 'split/comparison layout',
            lightingStyle: 'consistent across both sides',
            aspectRatio: '1:1 or 4:5',
            negativeSpace: 'minimal',
        },

        imagePromptTemplate: `Dramatic before/after transformation photography.
LEFT SIDE (Before): {BEFORE_STATE} - dull lighting, muted colors, problem clearly visible.
RIGHT SIDE (After): {AFTER_STATE} - bright lighting, vibrant colors, transformation complete.
Clean diagonal or vertical split composition.
{PRODUCT_DESCRIPTION} visible as the catalyst of change.
Consistent camera angle and framing across both sides.
The contrast is DRAMATIC and instantly readable.
Professional advertising quality, high contrast, impactful.
NO text or labels - the visual tells the story.`,

        copyFormula: {
            headline: 'Contrast Statement (e.g., "Von [Problem] zu [Lösung] in [Zeit]")',
            description: 'Problem agitation + Transformation proof + Easy next step',
            cta: 'Result-focused (e.g., "Transformation starten")',
        },

        triggers: ['Transformation desire', 'Proof', 'Hope'],
    },

    social_proof: {
        id: 'social_proof',
        name: 'Social Proof Showcase',
        nameDE: 'Social Proof',
        description: 'Testimonial or UGC style that builds trust through others.',

        bestFor: ['Services', 'SaaS', 'High-consideration purchases', 'B2B'],

        composition: {
            productPlacement: 'secondary to person',
            backgroundType: 'authentic environment',
            lightingStyle: 'natural, unpolished feel',
            aspectRatio: '1:1 or 4:5',
            negativeSpace: '25-35%',
        },

        imagePromptTemplate: `Authentic testimonial-style photography.
Real person ({TARGET_DEMO}) showing genuine satisfaction or joy with {PRODUCT_DESCRIPTION}.
Natural home or office environment, soft ambient lighting.
The expression is authentic - a real smile, not posed.
Product visible but secondary to the human connection.
UGC aesthetic: feels like a real customer photo, not an ad.
Warm color grading, slightly casual composition.
Trust-building authenticity is the priority.
NO text overlays, logos, or watermarks.`,

        copyFormula: {
            headline: 'Testimonial Hook (e.g., "Warum 12.000+ Kunden...")',
            description: 'Star rating + Quote snippet + Specific result',
            cta: 'Community-focused (e.g., "Auch überzeugen lassen")',
        },

        triggers: ['Social validation', 'Trust', 'Bandwagon effect'],
    },

    feature_callout: {
        id: 'feature_callout',
        name: 'Feature Callout Diagram',
        nameDE: 'Feature-Übersicht',
        description: 'Product with visual callouts highlighting key features.',

        bestFor: ['Tech products', 'Complex products', 'Multi-feature items'],

        composition: {
            productPlacement: 'center with space for callouts',
            backgroundType: 'clean solid or subtle gradient',
            lightingStyle: 'even studio lighting',
            aspectRatio: '1:1',
            negativeSpace: '40-50% for callout space',
        },

        imagePromptTemplate: `Technical product showcase photography of {PRODUCT_DESCRIPTION}.
Product centered with generous space around it for potential annotations.
Clean, professional studio lighting - even illumination showing all details.
Solid {BACKGROUND_COLOR} background for maximum product clarity.
The product is shot at a slight angle to show multiple faces/features.
Sharp focus throughout, deep depth of field f/8.
Technical precision aesthetic - Apple-style product photography.
Ultra-clean, minimal, premium tech brand feel.
NO text, annotations, lines, or watermarks - these will be added in post.`,

        copyFormula: {
            headline: 'Feature Stack (e.g., "3 Features, die alles ändern")',
            description: 'Feature → Benefit translations with specifics',
            cta: 'Discovery-focused (e.g., "Alle Features entdecken")',
        },

        triggers: ['Logic', 'Comparison', 'Value stacking'],
    },

    urgency_sale: {
        id: 'urgency_sale',
        name: 'Urgency/Sale Announcement',
        nameDE: 'Dringlichkeits-Sale',
        description: 'Bold, attention-grabbing promotion creative.',

        bestFor: ['Flash sales', 'Limited offers', 'Seasonal promotions'],

        composition: {
            productPlacement: 'dynamic angle, action-oriented',
            backgroundType: 'bold colors, high contrast',
            lightingStyle: 'dramatic with strong shadows',
            aspectRatio: '1:1 or 4:5',
            negativeSpace: 'minimal, high density',
        },

        imagePromptTemplate: `High-impact promotional photography of {PRODUCT_DESCRIPTION}.
Dynamic diagonal composition creating energy and urgency.
Bold, saturated colors - {PRIMARY_COLOR} dominant.
Dramatic lighting with strong contrasts and deep shadows.
The product appears to be in motion or bursting from the frame.
Premium sale aesthetic - exciting but not cheap or discount-bin.
Subtle starburst or light flare elements suggesting excitement.
Eye-catching, scroll-stopping, demands attention.
NO text, discount numbers, or promotional elements - added in post.`,

        copyFormula: {
            headline: 'Urgency + Value (e.g., "Nur heute: 50% auf alles")',
            description: 'Scarcity + Original price contrast + Deadline',
            cta: 'Urgent action (e.g., "Jetzt sichern - endet Mitternacht")',
        },

        triggers: ['FOMO', 'Scarcity', 'Loss aversion'],
    },

    minimalist_elegant: {
        id: 'minimalist_elegant',
        name: 'Minimalist Elegant',
        nameDE: 'Minimalistisch Elegant',
        description: 'Ultra-clean, luxury brand aesthetic with maximum negative space.',

        bestFor: ['Luxury goods', 'Premium services', 'Design-focused brands'],

        composition: {
            productPlacement: 'asymmetric, lots of breathing room',
            backgroundType: 'solid white, cream, or black',
            lightingStyle: 'soft, diffused, shadowless',
            aspectRatio: '1:1',
            negativeSpace: '60-70%',
        },

        imagePromptTemplate: `Ultra-minimalist luxury product photography of {PRODUCT_DESCRIPTION}.
Asymmetric placement with dramatic negative space - at least 60% empty.
Pure {BACKGROUND_COLOR} background, perfectly clean and seamless.
Soft, diffused lighting creating gentle shadows and depth.
The product floats in space, exuding quiet confidence.
Luxury fashion brand aesthetic - think Hermès, Apple, Aesop.
Obsessive attention to detail, no distractions.
The restraint IS the statement.
Shot on medium format, color-accurate, museum-quality.
Absolutely NO text, logos, or any elements except the product.`,

        copyFormula: {
            headline: 'Understated Power (e.g., "Weniger. Aber besser.")',
            description: 'Single powerful statement + Craftsmanship detail',
            cta: 'Exclusive action (e.g., "Exklusiv entdecken")',
        },

        triggers: ['Status', 'Exclusivity', 'Sophistication'],
    },

    problem_solution: {
        id: 'problem_solution',
        name: 'Problem/Solution Visual',
        nameDE: 'Problem/Lösung',
        description: 'Shows the problem being solved in action.',

        bestFor: ['Problem-solving products', 'Innovations', 'Pain point solutions'],

        composition: {
            productPlacement: 'as the hero solving the problem',
            backgroundType: 'contextual to the problem',
            lightingStyle: 'editorial, story-driven',
            aspectRatio: '4:5',
            negativeSpace: '20-30%',
        },

        imagePromptTemplate: `Editorial problem-solution photography.
Scene: {PROBLEM_CONTEXT} - a relatable pain point situation.
{PRODUCT_DESCRIPTION} is THE solution, prominently placed as the hero.
Visual narrative: the problem is being actively solved.
Natural lighting appropriate to the context.
The viewer instantly understands: THIS product fixes THIS problem.
Emotionally resonant - the relief is palpable.
Documentary style with commercial polish.
NO text overlays or annotations.`,

        copyFormula: {
            headline: 'Problem Question (e.g., "Kennen Sie das?" or "Nie wieder [Problem]")',
            description: 'PAS Framework: Problem → Agitate → Solution',
            cta: 'Solution-focused (e.g., "Problem lösen")',
        },

        triggers: ['Pain relief', 'Empathy', 'Solution seeking'],
    },

    ingredient_spotlight: {
        id: 'ingredient_spotlight',
        name: 'Ingredient/Material Spotlight',
        nameDE: 'Inhaltsstoffe im Fokus',
        description: 'Highlights what the product is made of.',

        bestFor: ['Beauty/Skincare', 'Food', 'Natural products', 'Supplements'],

        composition: {
            productPlacement: 'surrounded by ingredients',
            backgroundType: 'natural, organic textures',
            lightingStyle: 'bright, fresh, natural',
            aspectRatio: '1:1',
            negativeSpace: '25-35%',
        },

        imagePromptTemplate: `Fresh ingredient-focused product photography.
{PRODUCT_DESCRIPTION} surrounded by its key ingredients: {INGREDIENTS}.
Natural raw ingredients arranged artistically around the product.
Fresh, vibrant, alive - water droplets, fresh cuts, natural textures.
Bright, diffused natural lighting - morning freshness feel.
Organic wood, marble, or stone surface.
The ingredients EXPLAIN the product's power.
Clean beauty or natural product aesthetic.
Fresh, healthy, pure, premium quality signals.
NO text, labels, or graphics.`,

        copyFormula: {
            headline: 'Ingredient Power (e.g., "Die Kraft von [Inhaltsstoff]")',
            description: 'Ingredient benefit + Science/tradition backing + Purity promise',
            cta: 'Discovery (e.g., "Natürliche Wirkung entdecken")',
        },

        triggers: ['Natural appeal', 'Health consciousness', 'Transparency'],
    },

    scale_comparison: {
        id: 'scale_comparison',
        name: 'Scale/Size Comparison',
        nameDE: 'Größenvergleich',
        description: 'Shows product size relative to everyday objects.',

        bestFor: ['Compact products', 'Large products', 'Size-matters categories'],

        composition: {
            productPlacement: 'next to comparison object',
            backgroundType: 'neutral, non-distracting',
            lightingStyle: 'even, clear',
            aspectRatio: '1:1 or 4:5',
            negativeSpace: '35-45%',
        },

        imagePromptTemplate: `Scale comparison product photography.
{PRODUCT_DESCRIPTION} placed next to {COMPARISON_OBJECT} for size reference.
Clean neutral background - white, light gray, or wood surface.
Both objects clearly visible with accurate proportions.
The size relationship is INSTANTLY clear.
Even lighting, no distracting shadows.
Simple, informative, trustworthy aesthetic.
E-commerce clarity meets advertising quality.
NO text, measurements, or annotations.`,

        copyFormula: {
            headline: 'Size Surprise (e.g., "So kompakt. So mächtig.")',
            description: 'Size benefit + Portability/capacity advantage',
            cta: 'Practical (e.g., "Perfekte Größe sichern")',
        },

        triggers: ['Practical logic', 'Space efficiency', 'Convenience'],
    },

    unboxing_moment: {
        id: 'unboxing_moment',
        name: 'Unboxing/First Reveal',
        nameDE: 'Unboxing-Moment',
        description: 'The exciting moment of opening and discovering.',

        bestFor: ['Subscription boxes', 'Gift items', 'Premium packaging'],

        composition: {
            productPlacement: 'emerging from packaging',
            backgroundType: 'lifestyle surface',
            lightingStyle: 'warm, anticipatory',
            aspectRatio: '1:1 or 4:5',
            negativeSpace: '20-30%',
        },

        imagePromptTemplate: `Exciting unboxing moment photography.
{PRODUCT_DESCRIPTION} being revealed from premium packaging.
Hands gently opening a beautiful box, the product emerging.
Anticipation and excitement captured in the moment.
Warm, inviting lighting - golden hour feel.
Premium packaging details visible - tissue paper, ribbons, quality materials.
The experience of receiving something special.
Lifestyle surface - marble, wood, cozy textile.
Authentic joy, not staged - real human connection.
NO faces fully visible, focus on hands and product.`,

        copyFormula: {
            headline: 'Experience Hook (e.g., "Das Gefühl, wenn...")',
            description: 'Sensory description + Anticipation building + Gift potential',
            cta: 'Experience (e.g., "Dieses Gefühl erleben")',
        },

        triggers: ['Anticipation', 'Novelty', 'Gifting psychology'],
    },

    flat_lay: {
        id: 'flat_lay',
        name: 'Curated Flat Lay',
        nameDE: 'Kuratierte Flatlays',
        description: 'Bird\'s eye view of product with complementary items.',

        bestFor: ['Fashion accessories', 'Beauty products', 'Stationery', 'Food'],

        composition: {
            productPlacement: 'center of curated arrangement',
            backgroundType: 'textured surface (marble, wood, fabric)',
            lightingStyle: 'overhead soft light',
            aspectRatio: '1:1',
            negativeSpace: '15-25%',
        },

        imagePromptTemplate: `Curated flat lay photography from directly above.
{PRODUCT_DESCRIPTION} as the hero center piece.
Artistically arranged complementary items: {COMPLEMENTARY_ITEMS}.
Beautiful textured surface - {SURFACE_TYPE}.
Soft overhead lighting with minimal shadows.
Instagram-worthy, highly shareable aesthetic.
Color palette: {COLOR_PALETTE} - harmonious and intentional.
Every item placed with purpose, nothing random.
Lifestyle editorial quality, influencer-ready.
NO text, logos, or watermarks.`,

        copyFormula: {
            headline: 'Lifestyle Identity (e.g., "Für alle, die [Identity]")',
            description: 'Curation story + Lifestyle aspiration + Collection potential',
            cta: 'Collection (e.g., "Deinen Style finden")',
        },

        triggers: ['Aesthetic pleasure', 'Curation desire', 'Identity expression'],
    },
};

/**
 * Get ad style by ID
 */
export function getAdStyle(styleId) {
    return AD_STYLES[styleId] || AD_STYLES.hero_product;
}

/**
 * Get all available styles as array
 */
export function getAllAdStyles() {
    return Object.values(AD_STYLES);
}

/**
 * Recommend best ad styles based on inputs
 */
export function recommendAdStyles(inputs) {
    const { industry, productType, goal, targetAudience } = inputs;
    const scores = [];

    for (const style of getAllAdStyles()) {
        let score = 0;

        // Check if industry/product matches bestFor
        for (const use of style.bestFor) {
            if (industry?.toLowerCase().includes(use.toLowerCase()) ||
                productType?.toLowerCase().includes(use.toLowerCase())) {
                score += 30;
            }
        }

        // Goal-based scoring
        if (goal === 'conversion' && ['urgency_sale', 'before_after', 'problem_solution'].includes(style.id)) {
            score += 20;
        }
        if (goal === 'awareness' && ['hero_product', 'lifestyle_context', 'minimalist_elegant'].includes(style.id)) {
            score += 20;
        }

        scores.push({ style, score });
    }

    // Sort by score and return top 3
    return scores.sort((a, b) => b.score - a.score).slice(0, 3).map(s => s.style);
}

/**
 * Build image prompt from style template
 */
export function buildImagePromptFromStyle(style, variables) {
    let prompt = style.imagePromptTemplate;

    // Replace all {VARIABLE} placeholders
    for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{${key.toUpperCase()}}`;
        prompt = prompt.replace(new RegExp(placeholder, 'g'), value || '');
    }

    // Clean up any unreplaced placeholders
    prompt = prompt.replace(/\{[A-Z_]+\}/g, '');
    prompt = prompt.replace(/\s+/g, ' ').trim();

    return prompt;
}
