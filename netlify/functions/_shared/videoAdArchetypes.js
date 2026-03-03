/**
 * VIDEO AD ARCHETYPES — 5 Tier-1 Formats + 12 Hook Library
 * 
 * Each archetype contains:
 * - Veo prompt template (scene, camera, lighting, mood)
 * - Compatible hooks from 12-hook library
 * - Default settings (duration, camera, text overlay)
 * - Negative prompt additions
 * 
 * Based on Meta's highest-performing video ad formats 2025/2026.
 */

// ============================================================
// HOOK LIBRARY — 12 Scroll-Stopper Patterns
// ============================================================

export const HOOK_LIBRARY = {
    statistik_shock: {
        id: 'statistik_shock',
        name: { de: 'Statistik-Shock', en: 'Statistic Shock' },
        example: { de: '97% der Kunden kaufen nochmal', en: '97% of customers reorder' },
        promptPrefix: 'Text overlay with a large, bold statistic zooming in from the center',
        visualCue: 'zoom-in on bold number, dramatic lighting shift',
        bestFor: ['social_proof', 'product_reveal'],
    },
    frage: {
        id: 'frage',
        name: { de: 'Frage', en: 'Question' },
        example: { de: 'Warum zahlst du noch so viel für X?', en: 'Why are you still overpaying for X?' },
        promptPrefix: 'Text appears word by word on screen, creating curiosity',
        visualCue: 'kinetic typography, words appearing sequentially',
        bestFor: ['before_after', 'lifestyle_scene'],
    },
    problem_erkennung: {
        id: 'problem_erkennung',
        name: { de: 'Problem-Erkennung', en: 'Problem Recognition' },
        example: { de: 'Kennst du das? Dein X macht schon wieder...', en: 'Sound familiar? Your X is failing again...' },
        promptPrefix: 'Relatable scene showing a common frustration or problem',
        visualCue: 'frustrated expression, messy/broken item, desaturated colors',
        bestFor: ['before_after', 'dynamic_showcase'],
    },
    before_after: {
        id: 'before_after',
        name: { de: 'Vorher/Nachher', en: 'Before/After' },
        example: { de: 'Vorher ➝ Nachher', en: 'Before ➝ After' },
        promptPrefix: 'Split-screen or dramatic transition from an undesirable state to a perfect result',
        visualCue: 'side-by-side or wipe transition, color shift from dull to vibrant',
        bestFor: ['before_after'],
    },
    fomo: {
        id: 'fomo',
        name: { de: 'FOMO', en: 'FOMO' },
        example: { de: 'Nur noch heute -50%', en: 'Today only -50%' },
        promptPrefix: 'Countdown timer animation, urgent red/orange color scheme, flashing text overlay',
        visualCue: 'timer, red accents, pulsing urgency',
        bestFor: ['social_proof', 'product_reveal'],
    },
    kontroverser_claim: {
        id: 'kontroverser_claim',
        name: { de: 'Kontroverser Claim', en: 'Controversial Claim' },
        example: { de: 'Vergiss alles was du über X weißt', en: 'Forget everything you know about X' },
        promptPrefix: 'Bold, large text slamming onto screen with dramatic camera zoom',
        visualCue: 'impactful text animation, dramatic dolly zoom',
        bestFor: ['product_reveal', 'dynamic_showcase'],
    },
    social_proof: {
        id: 'social_proof',
        name: { de: 'Social Proof', en: 'Social Proof' },
        example: { de: '10.000+ zufriedene Kunden', en: '10,000+ happy customers' },
        promptPrefix: 'Star rating animation appearing, review snippets floating in, counter increasing',
        visualCue: 'stars filling up, numbers counting, testimonial cards',
        bestFor: ['social_proof'],
    },
    demo_teaser: {
        id: 'demo_teaser',
        name: { de: 'Demo-Teaser', en: 'Demo Teaser' },
        example: { de: 'Schau was passiert...', en: 'Watch what happens...' },
        promptPrefix: 'Close-up product in action, fast movement, satisfying result',
        visualCue: 'close-up, product demo, quick cuts',
        bestFor: ['dynamic_showcase', 'product_reveal'],
    },
    identitaets_hook: {
        id: 'identitaets_hook',
        name: { de: 'Identitäts-Hook', en: 'Identity Hook' },
        example: { de: 'Für alle die X lieben...', en: 'For everyone who loves X...' },
        promptPrefix: 'Scene showing a specific lifestyle or identity group, aspirational setting',
        visualCue: 'lifestyle context, specific audience representation',
        bestFor: ['lifestyle_scene'],
    },
    unerwartetes: {
        id: 'unerwartetes',
        name: { de: 'Unerwartetes', en: 'Unexpected' },
        example: { de: 'Das hättest du nicht erwartet...', en: "You didn't expect this..." },
        promptPrefix: 'Product appearing in an unexpected, surprising context or situation',
        visualCue: 'surprise element, unusual juxtaposition',
        bestFor: ['product_reveal', 'dynamic_showcase'],
    },
    vergleich: {
        id: 'vergleich',
        name: { de: 'Vergleich', en: 'Comparison' },
        example: { de: 'Links: 50€ Produkt. Rechts: unseres für 19€', en: 'Left: $50 product. Right: ours for $19' },
        promptPrefix: 'Side-by-side comparison, split screen with two products',
        visualCue: 'split screen, competitive positioning, price tags',
        bestFor: ['before_after', 'social_proof'],
    },
    asmr_satisfying: {
        id: 'asmr_satisfying',
        name: { de: 'ASMR / Satisfying', en: 'ASMR / Satisfying' },
        example: { de: 'Unboxing...', en: 'Unboxing...' },
        promptPrefix: 'Extreme close-up, slow motion, tactile texture reveal, satisfying sound design',
        visualCue: 'macro shot, slow-mo, texture focus, ASMR audio',
        bestFor: ['product_reveal', 'dynamic_showcase'],
    },
};

// ============================================================
// CTA LIBRARY — Call-to-Action Patterns
// ============================================================

export const CTA_PATTERNS = {
    de: [
        'Jetzt entdecken', 'Jetzt shoppen', 'Mehr erfahren', 'Jetzt sichern',
        'Zum Shop', 'Jetzt bestellen', 'Gratis testen', 'Jetzt starten',
    ],
    en: [
        'Shop Now', 'Discover More', 'Learn More', 'Get Yours',
        'Buy Now', 'Try Free', 'Get Started', 'Claim Offer',
    ],
};

// ============================================================
// 5 TIER-1 ARCHETYPES
// ============================================================

export const VIDEO_ARCHETYPES = {
    product_reveal: {
        id: 'product_reveal',
        name: { de: 'Product Reveal', en: 'Product Reveal' },
        description: {
            de: 'Produkt wird dramatisch enthüllt — Zoom, Licht, Smoke-Effekt',
            en: 'Product is dramatically revealed — zoom, lighting, smoke effect',
        },
        icon: '✨',
        tier: 1,
        idealDuration: 8,
        hookStyle: 'visual_wow',
        compatibleHooks: ['statistik_shock', 'kontroverser_claim', 'demo_teaser', 'asmr_satisfying', 'unerwartetes'],

        // 5-Act Veo Prompt Template
        promptTemplate: {
            act1_hook: (product, hook) =>
                `Opening shot: ${hook}. Darkness with a single spotlight, anticipation building. ` +
                `A hint of ${product} barely visible in silhouette.`,
            act2_problem: (product, context) =>
                `Quick flash of the everyday problem — ${context}. Muted, desaturated colors showing frustration.`,
            act3_solution: (product, usp) =>
                `Dramatic reveal: ${product} emerges from darkness into golden-hour spotlight. ` +
                `Slow-motion 360° rotation on a premium surface (marble, glass, brushed metal). ` +
                `Particle effects and lens flares accentuate the product. ${usp} is visually demonstrated.`,
            act4_proof: (proof) =>
                `Text overlay appears with smooth animation: "${proof}". ` +
                `Star rating fills up. Subtle sparkle effects on the product.`,
            act5_cta: (cta) =>
                `Glowing CTA button animation: "${cta}". Product centered, final glamour shot. ` +
                `Seamless loop transition back to opening darkness.`,
        },

        cameraPreset: 'dolly zoom in, shallow depth of field, 360° orbit, low angle hero shot',
        lightingPreset: 'dramatic spotlight, golden hour rim light, volumetric fog',
        audioPreset: 'dramatic whoosh, bass drop on reveal, ambient shimmer, subtle heartbeat build-up',
        negativePrompt: 'blurry, low quality, distorted text, watermark, shaky camera, overexposed, cartoon style',
    },

    before_after: {
        id: 'before_after',
        name: { de: 'Vorher/Nachher', en: 'Before/After' },
        description: {
            de: 'Transformation zeigen — vorher schlecht, nachher perfekt',
            en: 'Show transformation — before bad, after perfect',
        },
        icon: '🔄',
        tier: 1,
        idealDuration: 8,
        hookStyle: 'problem_solution',
        compatibleHooks: ['problem_erkennung', 'before_after', 'frage', 'vergleich'],

        promptTemplate: {
            act1_hook: (product, hook) =>
                `Opening: ${hook}. A scene showing a relatable, frustrating "before" state. ` +
                `Desaturated colors, messy environment, visible frustration.`,
            act2_problem: (product, context) =>
                `The problem intensifies — ${context}. Close-up on the pain point. ` +
                `Visual discomfort: cluttered, broken, inefficient.`,
            act3_solution: (product, usp) =>
                `Dramatic wipe transition: colors shift from grey to vibrant. ` +
                `${product} appears and instantly transforms the scene. ` +
                `Clean, organized, beautiful "after" state. ${usp} clearly visible.`,
            act4_proof: (proof) =>
                `Split-screen moment: "Before" on left (grey), "After" on right (colorful). ` +
                `Text overlay: "${proof}". Satisfying transformation complete.`,
            act5_cta: (cta) =>
                `Beautiful "after" scene fills the screen. CTA appears: "${cta}". ` +
                `Product hero shot with the transformed result behind it.`,
        },

        cameraPreset: 'static wide shot transitioning to tracking close-up, smooth pan',
        lightingPreset: 'desaturated cool tones → warm vibrant lighting transition',
        audioPreset: 'negative buzzer, tension build, satisfying "ding", uplifting music swell',
        negativePrompt: 'blurry, low quality, distorted text, watermark, inconsistent lighting between scenes',
    },

    dynamic_showcase: {
        id: 'dynamic_showcase',
        name: { de: 'Dynamischer Showcase', en: 'Dynamic Showcase' },
        description: {
            de: 'Produkt aus verschiedenen Winkeln, schnelle Schnitte, 360°',
            en: 'Product from multiple angles, fast cuts, 360°',
        },
        icon: '🎥',
        tier: 1,
        idealDuration: 6,
        hookStyle: 'fast_cuts',
        compatibleHooks: ['demo_teaser', 'kontroverser_claim', 'asmr_satisfying', 'unerwartetes'],

        promptTemplate: {
            act1_hook: (product, hook) =>
                `Fast-paced opening: ${hook}. Quick cut montage of ${product} from 3 different angles ` +
                `in rapid succession. Each shot less than 0.5 seconds.`,
            act2_problem: (product, context) =>
                `Brief context shot: ${context}. Fast transition showing why this product matters.`,
            act3_solution: (product, usp) =>
                `360° orbital shot of ${product} on a clean, premium surface. ` +
                `Camera orbits smoothly revealing every detail. ` +
                `Key feature highlighted with a subtle glow or callout. ${usp}.`,
            act4_proof: (proof) =>
                `Quick-fire feature callouts: 3 text overlays appear in rapid succession. ` +
                `"${proof}". Each with a satisfying "pop" animation.`,
            act5_cta: (cta) =>
                `Final beauty shot: product centered, camera pulling back to reveal full context. ` +
                `CTA slides in from bottom: "${cta}". Clean loop point.`,
        },

        cameraPreset: 'rapid cuts, orbital 360°, whip pan, rack focus between details',
        lightingPreset: 'studio lighting, clean white/grey backdrop, product-focused spots',
        audioPreset: 'rhythmic electronic beat, whoosh on each cut, satisfying click sounds',
        negativePrompt: 'blurry, low quality, distorted text, watermark, slow movement, static camera',
    },

    lifestyle_scene: {
        id: 'lifestyle_scene',
        name: { de: 'Lifestyle Szene', en: 'Lifestyle Scene' },
        description: {
            de: 'Produkt in echtem Lifestyle-Kontext — Küche, Gym, Büro',
            en: 'Product in real lifestyle context — kitchen, gym, office',
        },
        icon: '🏡',
        tier: 1,
        idealDuration: 8,
        hookStyle: 'relatability',
        compatibleHooks: ['identitaets_hook', 'frage', 'problem_erkennung', 'demo_teaser'],

        promptTemplate: {
            act1_hook: (product, hook) =>
                `Opening: ${hook}. A warm, inviting lifestyle scene — ` +
                `natural light streaming through windows, cozy interior. ` +
                `An everyday moment that feels authentic and relatable.`,
            act2_problem: (product, context) =>
                `The scene shows the everyday challenge: ${context}. ` +
                `Relatable moment — the viewer recognizes themselves in this situation.`,
            act3_solution: (product, usp) =>
                `${product} seamlessly integrates into the lifestyle scene. ` +
                `Natural usage demonstration — the product fits perfectly. ` +
                `${usp} shown through the authentic context. Warm, golden lighting.`,
            act4_proof: (proof) =>
                `Moment of satisfaction: person enjoys the result of using ${product}. ` +
                `Subtle text overlay: "${proof}". Warm color palette, genuine emotion.`,
            act5_cta: (cta) =>
                `Wide shot of the beautiful lifestyle scene with ${product} prominently placed. ` +
                `CTA appears in elegant typography: "${cta}". Aspirational final frame.`,
        },

        cameraPreset: 'handheld natural movement, shallow depth of field, golden hour, over-the-shoulder',
        lightingPreset: 'natural window light, golden hour warmth, soft shadows, lifestyle ambiance',
        audioPreset: 'ambient room tone, gentle music, natural sounds (coffee pouring, birds), soft vocal "ahh"',
        negativePrompt: 'blurry, low quality, distorted text, watermark, studio lighting, fake/posed feeling, green screen',
    },

    social_proof: {
        id: 'social_proof',
        name: { de: 'Social Proof', en: 'Social Proof / Testimonial' },
        description: {
            de: 'Text-Overlays mit Bewertungen, Sterne, Zahlen',
            en: 'Text overlays with reviews, stars, numbers',
        },
        icon: '⭐',
        tier: 1,
        idealDuration: 6,
        hookStyle: 'statistik_shock',
        compatibleHooks: ['statistik_shock', 'social_proof', 'fomo', 'vergleich'],

        promptTemplate: {
            act1_hook: (product, hook) =>
                `Opening: ${hook}. A large, bold number fills the screen — customer count, ` +
                `satisfaction percentage, or rating. Dramatic zoom effect.`,
            act2_problem: (product, context) =>
                `Quick montage: scrolling through positive reviews and ratings. ` +
                `Social media-style cards floating in. ${context}.`,
            act3_solution: (product, usp) =>
                `${product} appears surrounded by floating 5-star ratings and review snippets. ` +
                `Clean, trustworthy presentation. ${usp} reinforced by social proof.`,
            act4_proof: (proof) =>
                `The definitive proof moment: "${proof}" appears as a large, bold text overlay. ` +
                `Star ratings animate to 5/5. Review counter ticks up. Trust badges appear.`,
            act5_cta: (cta) =>
                `Product hero shot with a subtle glow of social proof elements. ` +
                `CTA with trust reinforcement: "${cta}". Social proof icons remain visible.`,
        },

        cameraPreset: 'steady center frame, smooth zoom, text-focused composition',
        lightingPreset: 'clean, bright, trustworthy lighting, slight warm tone',
        audioPreset: 'notification dings, satisfying "pop" sounds, gentle uplifting music, cash register',
        negativePrompt: 'blurry, low quality, distorted text, watermark, dark moody lighting, illegible text',
    },
};

// ============================================================
// ARCHETYPE HELPERS
// ============================================================

/**
 * Get an archetype by ID
 */
export function getArchetype(archetypeId) {
    return VIDEO_ARCHETYPES[archetypeId] || null;
}

/**
 * Get all Tier-1 archetypes as array
 */
export function getAllArchetypes() {
    return Object.values(VIDEO_ARCHETYPES);
}

/**
 * Get compatible hooks for an archetype
 */
export function getCompatibleHooks(archetypeId) {
    const archetype = VIDEO_ARCHETYPES[archetypeId];
    if (!archetype) return [];
    return archetype.compatibleHooks.map(hookId => HOOK_LIBRARY[hookId]).filter(Boolean);
}

/**
 * Select the best hook for an archetype + audience combination
 * Returns the first compatible hook (AI selection in scriptEngine overrides this)
 */
export function getDefaultHook(archetypeId) {
    const archetype = VIDEO_ARCHETYPES[archetypeId];
    if (!archetype || !archetype.compatibleHooks.length) return HOOK_LIBRARY.demo_teaser;
    return HOOK_LIBRARY[archetype.compatibleHooks[0]];
}

/**
 * Get a random CTA for the given language
 */
export function getRandomCta(language = 'de') {
    const ctas = CTA_PATTERNS[language] || CTA_PATTERNS.de;
    return ctas[Math.floor(Math.random() * ctas.length)];
}

/**
 * Build the complete negative prompt for an archetype
 */
export function buildNegativePrompt(archetypeId) {
    const archetype = VIDEO_ARCHETYPES[archetypeId];
    const base = 'blurry, low quality, distorted text, watermark, shaky camera, amateur, overexposed, underexposed';
    if (!archetype) return base;
    return `${base}, ${archetype.negativePrompt}`;
}

/**
 * Get industry-specific scene context for lifestyle/before-after archetypes
 */
export function getIndustryContext(industry) {
    const INDUSTRY_CONTEXTS = {
        skincare: { scene: 'bathroom vanity with soft lighting', problem: 'dull, tired-looking skin', color: 'soft pink and white' },
        fitness: { scene: 'modern gym or home workout space', problem: 'lack of energy, poor workout results', color: 'energetic orange and black' },
        food: { scene: 'bright, clean kitchen with fresh ingredients', problem: 'boring, unhealthy meals', color: 'warm, appetizing tones' },
        tech: { scene: 'minimalist desk setup with clean lines', problem: 'slow, frustrating technology', color: 'cool blue and silver' },
        fashion: { scene: 'stylish urban setting or curated wardrobe', problem: 'bland, uninspired outfits', color: 'sophisticated neutrals' },
        home: { scene: 'cozy living room with natural light', problem: 'cluttered, disorganized space', color: 'warm earth tones' },
        beauty: { scene: 'elegant vanity with perfect lighting', problem: 'time-consuming beauty routine', color: 'rose gold and cream' },
        pet: { scene: 'happy home with playful pet', problem: 'pet health or behavior concerns', color: 'warm, friendly green and brown' },
        supplements: { scene: 'bright morning routine, healthy lifestyle', problem: 'low energy, poor health', color: 'fresh green and white' },
        ecommerce: { scene: 'clean product photography setting', problem: 'hard to find quality products', color: 'premium dark and gold' },
        ecommerce_general: { scene: 'clean product photography setting', problem: 'hard to find quality products', color: 'premium dark and gold' },
    };
    return INDUSTRY_CONTEXTS[industry] || INDUSTRY_CONTEXTS.ecommerce;
}

export default {
    HOOK_LIBRARY,
    CTA_PATTERNS,
    VIDEO_ARCHETYPES,
    getArchetype,
    getAllArchetypes,
    getCompatibleHooks,
    getDefaultHook,
    getRandomCta,
    buildNegativePrompt,
    getIndustryContext,
};
