/**
 * Nano Banana Creative Engine v5.1
 * 
 * 2-PHASE AI CREATIVE DIRECTION:
 *   Phase 1: Gemini Flash generates a bespoke creative brief for THIS specific product
 *   Phase 2: NanoBanana-compliant image prompt assembled from the brief
 * 
 * Every product gets its own story, scene, emotion, and camera setup.
 * Industry presets serve as FALLBACK only when AI brief generation fails.
 * 
 * 100% Gemini — no OpenAI fallback.
 */

import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import { EXTENDED_LAYOUTS } from '../extendedLayouts.js';
import { REFERENCE_PATTERNS } from '../referencePatterns.js';
import { ARROW_STYLES, BADGE_STYLES, ICON_STYLES, LINE_STYLES, SHAPE_STYLES, buildElementPrompt } from '../designElementLibrary.js';
import { AD_ARCHETYPES, ARCHETYPE_BY_KEY } from './adArchetypes.js';
import { HOOK_BY_KEY } from './hookTypes.js';
import { selectAdaptiveTriple, resolveIndustryForSelector } from './adaptiveSelector.js';

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

const META_FORMATS = {
    square: { ratio: '1:1', width: 1080, height: 1080, openaiSize: '1024x1024', geminiAspect: '1:1' },
    portrait: { ratio: '4:5', width: 1080, height: 1350, openaiSize: '1024x1536', geminiAspect: '4:5' },
    story: { ratio: '9:16', width: 1080, height: 1920, openaiSize: '1024x1536', geminiAspect: '9:16' },
};

const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const GEMINI_TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';

// ═══════════════════════════════════════════════════════════════
// VARIATION SEEDS — Creative Diversity
// ═══════════════════════════════════════════════════════════════

const SCENE_MOODS = [
    'aspirational', 'intimate', 'dramatic', 'playful', 'serene', 'bold',
    'nostalgic', 'futuristic', 'rebellious', 'warm-community', 'luxe-minimal',
    'high-energy', 'cinematic-noir', 'tropical-fresh',
];
const PERSPECTIVES = [
    'first-person-experience', 'third-person-lifestyle', 'product-hero-closeup',
    'action-moment', 'result-aftermath', 'birds-eye-flatlay', 'worms-eye-dramatic',
    'over-the-shoulder', 'macro-detail', 'environmental-wide',
];
const TIME_OF_DAY = [
    'golden-hour-sunrise', 'blue-hour-dusk', 'bright-midday',
    'cozy-evening-warmth', 'energetic-morning', 'midnight-studio',
    'overcast-soft', 'neon-night',
];

function getVariationSeeds(conceptIndex) {
    return {
        mood: SCENE_MOODS[Math.floor(Math.random() * SCENE_MOODS.length)],
        perspective: PERSPECTIVES[Math.floor(Math.random() * PERSPECTIVES.length)],
        timeOfDay: TIME_OF_DAY[Math.floor(Math.random() * TIME_OF_DAY.length)],
    };
}

// ═══════════════════════════════════════════════════════════════
// LAYOUT STYLES — 21 Diverse Ad Compositions
// Core 6 + 15 from extendedLayouts.js
// ═══════════════════════════════════════════════════════════════

const LAYOUT_STYLES = [
    // ── CORE 6 ──
    {
        key: 'split_panel',
        name: 'Split Panel',
        instruction: `LAYOUT: Split the canvas into two distinct panels. One panel has the product image/scene, the other is a colored panel with text. The split can be vertical (left/right), horizontal (top/bottom), or diagonal. Add a thin accent stripe or geometric separator between panels. Text panel should have an interesting background color from the palette. Think: magazine ad layout with clear visual hierarchy.`,
    },
    {
        key: 'full_bleed',
        name: 'Full Bleed',
        instruction: `LAYOUT: The product scene fills the ENTIRE canvas. Text is overlaid with smart contrast: use gradient overlays, frosted glass panels, or shadow zones. Text placement should follow the rule of thirds — NEVER dead center. Consider text in the top-left or bottom-right with generous margins. A subtle vignette helps focus.`,
    },
    {
        key: 'geometric_frame',
        name: 'Geometric Frame',
        instruction: `LAYOUT: Place the product inside a geometric shape (circle, rounded rectangle, hexagon, or arch) on a solid or gradient background. Text is positioned alongside or below. Add decorative elements: thin lines, dots, small geometric accents, or a grid pattern in the background. Think: modern Instagram post template.`,
    },
    {
        key: 'magazine_editorial',
        name: 'Magazine Editorial',
        instruction: `LAYOUT: Asymmetric editorial composition with multiple text blocks at different sizes. Large hero text, smaller supporting text, a small tag/badge element. Product image is cropped or bled off one edge. Include at least one decorative element: a thin line, arrow, or bracket. Think: Vogue ad meets Instagram.`,
    },
    {
        key: 'minimal_product_hero',
        name: 'Minimal Product Hero',
        instruction: `LAYOUT: The product takes 60-70% of the canvas. Generous whitespace or solid color background. Text is small, elegant, positioned in one corner or along one edge. Maximum 2 text elements. Clean, luxurious feel. Think: Apple-style product photography with minimal type.`,
    },
    {
        key: 'bold_typographic',
        name: 'Bold Typographic',
        instruction: `LAYOUT: Text IS the main design element. A huge, bold headline in a striking font dominates the canvas. The product is shown smaller or as a cutout integrated with the text. Add dynamic text effects: text clipping, overlapping layers, varied weights. Think: Nike poster meets street typography.`,
    },
    // ── EXTENDED 15 (from extendedLayouts.js) ──
    {
        key: 'floating_particles',
        name: 'Floating Product with Particles',
        instruction: `LAYOUT: ${EXTENDED_LAYOUTS.floating_particles.promptTemplate}`,
    },
    {
        key: 'collage_mood',
        name: 'Collage / Mood Board',
        instruction: `LAYOUT: ${EXTENDED_LAYOUTS.collage_mood.promptTemplate}`,
    },
    {
        key: 'photo_illustration_hybrid',
        name: 'Photo + Illustration Hybrid',
        instruction: `LAYOUT: ${EXTENDED_LAYOUTS.photo_illustration_hybrid.promptTemplate}`,
    },
    {
        key: 'watercolor_artistic',
        name: 'Watercolor / Artistic',
        instruction: `LAYOUT: ${EXTENDED_LAYOUTS.watercolor_artistic.promptTemplate}`,
    },
    {
        key: 'neon_cyberpunk',
        name: 'Neon / Cyberpunk',
        instruction: `LAYOUT: ${EXTENDED_LAYOUTS.neon_cyberpunk.promptTemplate}`,
    },
    {
        key: 'retro_vintage',
        name: 'Retro / Vintage',
        instruction: `LAYOUT: ${EXTENDED_LAYOUTS.retro_vintage.promptTemplate}`,
    },
    {
        key: 'geometric_abstract',
        name: 'Geometric Abstract',
        instruction: `LAYOUT: ${EXTENDED_LAYOUTS.geometric_abstract.promptTemplate}`,
    },
    {
        key: 'split_diagonal',
        name: 'Diagonal Split',
        instruction: `LAYOUT: ${EXTENDED_LAYOUTS.split_diagonal.promptTemplate}`,
    },
    {
        key: 'frames_windows',
        name: 'Framed Windows',
        instruction: `LAYOUT: ${EXTENDED_LAYOUTS.frames_windows.promptTemplate}`,
    },
    {
        key: 'review_showcase',
        name: 'Review Showcase',
        instruction: `LAYOUT: ${EXTENDED_LAYOUTS.review_showcase.promptTemplate}`,
    },
    {
        key: 'ugc_authentic',
        name: 'UGC / Authentic',
        instruction: `LAYOUT: ${EXTENDED_LAYOUTS.ugc_authentic.promptTemplate}`,
    },
    {
        key: 'flash_sale_timer',
        name: 'Flash Sale with Timer',
        instruction: `LAYOUT: ${EXTENDED_LAYOUTS.flash_sale_timer.promptTemplate}`,
    },
    {
        key: 'how_to_use',
        name: 'How To Use Steps',
        instruction: `LAYOUT: ${EXTENDED_LAYOUTS.how_to_use.promptTemplate}`,
    },
    {
        key: 'myth_vs_fact',
        name: 'Myth vs Fact',
        instruction: `LAYOUT: ${EXTENDED_LAYOUTS.myth_vs_fact.promptTemplate}`,
    },
    {
        key: 'expert_endorsed',
        name: 'Expert Endorsed',
        instruction: `LAYOUT: ${EXTENDED_LAYOUTS.expert_endorsed.promptTemplate}`,
    },
];

function pickRandomLayout() {
    return LAYOUT_STYLES[Math.floor(Math.random() * LAYOUT_STYLES.length)];
}

// ═══════════════════════════════════════════════════════════════
// CONCEPT TYPES — 72 Archetypes from adArchetypes.js
// Backward-compatible: CONCEPT_TYPES is now an alias for AD_ARCHETYPES
// ═══════════════════════════════════════════════════════════════

const CONCEPT_TYPES = AD_ARCHETYPES;

function pickRandomConcept() {
    return CONCEPT_TYPES[Math.floor(Math.random() * CONCEPT_TYPES.length)];
}

// ═══════════════════════════════════════════════════════════════
// CONCEPT → REFERENCE PATTERN MAP
// Auto-mapped: archetype keys → reference patterns where available
// ═══════════════════════════════════════════════════════════════

const CONCEPT_PATTERN_MAP = {
    feature_callout: REFERENCE_PATTERNS.feature_callouts?.promptSnippet || '',
    us_vs_them_grid: REFERENCE_PATTERNS.us_vs_them?.promptSnippet || '',
    comparison_grid: REFERENCE_PATTERNS.us_vs_them?.promptSnippet || '',
    before_after_split: REFERENCE_PATTERNS.before_after?.promptSnippet || '',
    aspirational_lifestyle: REFERENCE_PATTERNS.lifestyle_action?.promptSnippet || '',
    step_by_step_guide: REFERENCE_PATTERNS.benefit_checkmarks?.promptSnippet || '',
    benefit_checklist: REFERENCE_PATTERNS.benefit_checkmarks?.promptSnippet || '',
    community_wall: REFERENCE_PATTERNS.collage_grid?.promptSnippet || '',
    user_gallery: REFERENCE_PATTERNS.collage_grid?.promptSnippet || '',
};

// ═══════════════════════════════════════════════════════════════
// DESIGN ELEMENT PRESETS — Precise Gemini vocabulary per concept
// Built from designElementLibrary.js promptFragments
// ═══════════════════════════════════════════════════════════════

const CONCEPT_DESIGN_ELEMENTS = {
    feature_callout: `
REQUIRED DESIGN ELEMENTS:
- 3-5 ${ARROW_STYLES.curved_smooth.promptFragment}, pointing FROM feature labels TO specific product parts
- Each arrow has a ${buildElementPrompt('marker', 'circle_outline')} at the label origin
- Feature labels: ${buildElementPrompt('shape', 'pill')} with white text, clean sans-serif
- Labels positioned around product WITHOUT overlapping`,

    comparison_grid: `
REQUIRED DESIGN ELEMENTS:
- LEFT side: ${buildElementPrompt('icon', 'checkmark_circle')} next to each positive point (green)
- RIGHT side: ${buildElementPrompt('icon', 'cross_strike')} next to each negative point (red/gray)
- ${buildElementPrompt('line', 'solid_medium')} as vertical divider between sides
- ${buildElementPrompt('badge', 'pill_tag')} at top of each column ("Unser Produkt" / "Andere")`,

    before_after: `
REQUIRED DESIGN ELEMENTS:
- ${buildElementPrompt('line', 'solid_medium')} as vertical divider
- LEFT label: ${buildElementPrompt('badge', 'pill_tag')} with "VORHER" text
- RIGHT label: ${buildElementPrompt('badge', 'pill_tag')} with "NACHHER" text
- ${ARROW_STYLES.curved_hand_drawn.promptFragment} from before to after, suggesting transformation`,

    testimonial_quote: `
REQUIRED DESIGN ELEMENTS:
- Large opening quotation marks „ in top-left corner, decorative serif
- ${buildElementPrompt('icon', 'star_filled')} × 5 in a row (⭐⭐⭐⭐⭐), gold color, rating display
- Customer name in smaller text below quote
- ${buildElementPrompt('shape', 'rounded_rectangle')} as subtle card background with soft shadow`,

    infographic_stat: `
REQUIRED DESIGN ELEMENTS:
- HERO NUMBER rendered MASSIVE (fills 30-40% of canvas), bold weight
- ${buildElementPrompt('line', 'solid_thin')} separating number from context text
- ${buildElementPrompt('badge', 'circle_seal')} wrapping the number or placed alongside
- Supporting text in clean sans-serif below the number`,

    step_by_step: `
REQUIRED DESIGN ELEMENTS:
- Step numbers inside ${buildElementPrompt('marker', 'circle_filled')} (1, 2, 3)
- ${ARROW_STYLES.curved_smooth.promptFragment} connecting step 1→2→3 showing progression
- Each step has a short label text
- ${buildElementPrompt('badge', 'ribbon_award')} or checkmark at final step indicating success/result`,

    ugc_authentic: `
REQUIRED DESIGN ELEMENTS:
- Instagram-style UI overlay: username text @handle, like count, comment text
- Casual, slightly imperfect framing (not centered perfectly)
- No obvious badges or corporate elements — this should look REAL
- Optional: small heart icon ❤️ near like count`,

    flash_sale: `
REQUIRED DESIGN ELEMENTS:
- ${buildElementPrompt('badge', 'star_burst')} as discount explosion badge (e.g. "-50%")
- Old price with ${buildElementPrompt('icon', 'cross_strike')} strikethrough line
- New price in BOLD, larger than old price
- ${buildElementPrompt('shape', 'rounded_rectangle')} as CTA button, high contrast
- Urgency text: countdown or "NUR HEUTE"`,

    job_recruiting: `
REQUIRED DESIGN ELEMENTS:
- ${buildElementPrompt('icon', 'checkmark_square')} next to each benefit/perk listed
- ${buildElementPrompt('badge', 'pill_tag')} for location, salary, or contract type
- Bold headline "Wir suchen dich!" or similar
- ${buildElementPrompt('shape', 'rounded_rectangle')} as apply button/CTA`,

    unboxing_reveal: `
REQUIRED DESIGN ELEMENTS:
- Light rays or sparkle effects from the opening box
- Premium packaging visible (clean, branded box)
- ${buildElementPrompt('badge', 'pill_tag')} with product name or "NEU"
- Confetti or particle effects suggesting celebration`,
};

// ═══════════════════════════════════════════════════════════════
// PHASE 1: AI CREATIVE DIRECTOR — Gemini Flash Brief
// ═══════════════════════════════════════════════════════════════

let _geminiClient = null;

function isGeminiAvailable() {
    return !!process.env.GEMINI_API_KEY;
}

function getGeminiClient() {
    if (_geminiClient) return _geminiClient;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');
    _geminiClient = new GoogleGenAI({ apiKey });
    return _geminiClient;
}

/**
 * AI Creative Director: Generates a bespoke creative brief for THIS specific product.
 * Uses Gemini Flash (text-only, ~250ms, ~500 tokens) — fast and cheap.
 * 
 * Every product gets a UNIQUE scene, camera, lighting, mood, AND layout style.
 * 
 * @param {Object} adSpec - Product info (productName, offer, audience, industry, angle)
 * @param {Object} conceptType - Archetype (key, name, briefDirection, category)
 * @param {string} format - Ad format (square, portrait, story)
 * @param {Object} variation - Variation seeds for diversity
 * @param {Object} [layoutStyle] - Optional layout style override; random if not provided
 * @param {Object} [hookType] - Optional hook type with promptInjection for tone/angle
 * @returns {Promise<Object>} Creative brief JSON
 */
async function generateCreativeBrief(adSpec, conceptType, format, variation, layoutStyle, hookType) {
    const client = getGeminiClient();
    const formatSpec = META_FORMATS[format];
    const lang = adSpec.language === 'en' ? 'English' : 'German';
    const layout = layoutStyle || pickRandomLayout();

    // Build rich product context from all available fields
    // Skip generic defaults so they don't pollute the AI context in free text mode
    const isGenericName = !adSpec.productName || adSpec.productName === 'Product';
    const isGenericOffer = !adSpec.offer || adSpec.offer === 'Premium Product';
    const hasFreeText = !!adSpec.text?.trim();
    // Bug 3+4 Fix: check both URL and base64 for product image
    const hasProductImage = !!adSpec.productImageUrl || !!adSpec.productImageBase64;

    const productContext = [
        !isGenericName ? `Name: ${adSpec.productName}` : null,
        !isGenericOffer ? `Offer: ${adSpec.offer}` : null,
        adSpec.usp ? `USP (raw user input — REWRITE this into professional copy): ${adSpec.usp}` : null,
        adSpec.description ? `Description: ${adSpec.description}` : null,
        // In free text mode, this is the PRIMARY input — elevate it
        hasFreeText ? `USER CREATIVE BRIEF (this is the main input — extract product, audience, tone, and style from this):\n${adSpec.text}` : null,
    ].filter(Boolean).join('\n');

    // Bug 4 Fix: Tell Phase 1 about the product image so it generates BACKGROUND scenes, not product descriptions
    const productImageContext = hasProductImage ? `
═══ PRODUCT IMAGE PROVIDED (CRITICAL) ═══
The user has uploaded a REAL PRODUCT PHOTO. This exact photo will be placed into the ad.
Your "scene" description must describe the BACKGROUND ENVIRONMENT and STAGING ONLY.
DO NOT describe the product's appearance, shape, color, or design — the real photo handles that.
Describe: surface/table/background material, lighting setup, surrounding props, atmosphere, camera angle.
Think: "What backdrop and staging would make this real product photo look incredible?"
The product will be composited INTO your scene exactly as it appears in the user's photo.
` : '';

    // Bug 7 Fix: Layout-aware scene instructions
    const layoutSceneGuide = `
═══ LAYOUT-AWARE SCENE RULES ═══
Your scene description MUST work with the ${layout.name} layout:
${layout.key === 'split_panel' ? '- Describe TWO distinct visual zones: one for the product/scene, one for a colored text panel. Example: "LEFT: product on dark marble surface. RIGHT: deep navy panel for headline text."' : ''}
${layout.key === 'geometric_frame' ? '- Describe what is INSIDE the geometric frame (the product scene) and what is OUTSIDE (solid/gradient background). Example: "INSIDE FRAME: product floating on soft gradient. OUTSIDE: clean white background with subtle grid."' : ''}
${layout.key === 'bold_typographic' ? '- The headline text IS the main visual. Describe how the product integrates with or is secondary to massive typography.' : ''}
${layout.key === 'minimal_product_hero' ? '- 60-70% product, generous empty space. Describe a MINIMAL scene with maximum breathing room.' : ''}
${['full_bleed', 'magazine_editorial'].includes(layout.key) ? '- Full scene: product integrated into an immersive environment that fills the entire canvas.' : ''}
${!['split_panel', 'geometric_frame', 'bold_typographic', 'minimal_product_hero', 'full_bleed', 'magazine_editorial'].includes(layout.key) ? `- Describe the visual content that fits the ${layout.name} composition structure.` : ''}
`;

    const prompt = `You are a world-class Creative Director at a top Meta Ads agency creating scroll-stopping ads for 2026.

PRODUCT DETAILS:
${productContext || 'A premium product'}
${productImageContext}
INDUSTRY: ${adSpec.industry || 'general'}
TARGET AUDIENCE: ${adSpec.audience || 'quality-conscious consumers'}
CREATIVE ANGLE: ${adSpec.angle || 'premium quality'}
AD FORMAT: ${format} (${formatSpec.ratio}, ${formatSpec.width}×${formatSpec.height})
LANGUAGE: All text MUST be in ${lang}.
${adSpec.language !== 'en' ? `
CRITICAL GERMAN TEXT RULES — THE TEXT WILL BE RENDERED ON AN IMAGE:
Every word you write for headline, tagline, hook, and CTA will be BURNED INTO AN IMAGE.
AI image models CANNOT spell complex German words. You MUST use ONLY short, simple words.

MANDATORY RULES:
1. Headline: MAXIMUM 1-3 words. Use ONLY words from this safe list or equally simple words:
   Jetzt, Neu, Mehr, Dein, Spür, Erlebe, Power, Style, Stark, Bereit, Premium, Exklusiv,
   Entdecke, Starte, Perfekt, Frei, Schnell, Einfach, Besser, Ohne, Mit, Für, Top, Extra
2. Tagline: MAXIMUM 3-6 words. Keep it dead simple.
3. CTA: MAXIMUM 2 words. Examples: "Jetzt starten", "Mehr erfahren", "Jetzt sichern", "Entdecken"
4. Use € (Euro) for prices, NEVER $ or Dollar.
5. Use "du" form (lowercase), not "Sie".
6. NO compound nouns, NO long words (nothing over 10 characters).
7. NO umlauts in headlines — use "ue", "ae", "oe" OR pick a word without umlauts.
   Exception: ü in simple words like "für" is OK.
8. If you cannot think of a simple German word, use English instead (common in German ads).

GOOD examples: "Jetzt erleben." / "Dein Style." / "Mehr Power." / "Neu entdecken."
BAD examples: "Unvergessliche Qualitätserlebnisse" / "Professionelle Hautpflege-Routine"
` : ''}

═══ CREATIVE CONCEPT ═══
${conceptType.briefDirection}

═══ LAYOUT (your scene MUST follow this) ═══
${layout.instruction}
${layoutSceneGuide}

${hookType?.promptInjection ? `═══ HOOK DIRECTION ═══\n${hookType.promptInjection}` : ''}

${CONCEPT_PATTERN_MAP[conceptType.key] ? `═══ REFERENCE PATTERN (follow this precisely) ═══\n${CONCEPT_PATTERN_MAP[conceptType.key]}` : ''}

${CONCEPT_DESIGN_ELEMENTS[conceptType.key] ? `═══ DESIGN ELEMENTS FOR THIS CONCEPT ═══\n${CONCEPT_DESIGN_ELEMENTS[conceptType.key]}` : ''}

VARIATION SEEDS (use these for uniqueness):
- Mood: ${variation.mood}
- Perspective: ${variation.perspective}
- Time of day: ${variation.timeOfDay}

Generate a UNIQUE creative brief for THIS EXACT product: "${adSpec.productName || 'this product'}".
Do NOT use generic descriptions like "product on dark background" or "clean studio setup".
Think: What scene would make THIS product look irresistible?

═══ AD COPY RULES ═══
- The user's USP/description is RAW INPUT — COMPLETELY REWRITE it into short, punchy ad copy.
- NEVER paste the user's text verbatim.
- Headlines: 1-3 WORDS ONLY. Emotionally charged. Think Nike: "Just Do It" = "Jetzt starten."
- Tagline: 3-6 words max. Simple German.
- Hook: 1 short sentence, curiosity or urgency.
- CTA: 2 words max or null.
- ONLY use German words you are 100% confident you can spell correctly.

═══ CTA RULES ═══
- CTA is OPTIONAL. Not every ad needs a CTA button.
- Many top-performing ads use NO CTA button — the image and text do the selling.
- If the layout style benefits from a CTA, include one that feels designed into the composition.
- If the layout style is minimal or typographic, SKIP the CTA entirely.
- Set "includeCta" to true or false in your response.

═══ DESIGN ELEMENTS — LESS IS MORE ═══
- Maximum 1-2 design elements. NOT cluttered, NOT overdesigned.
- Choose ONE: a single accent line, a frosted glass text panel, a clean geometric frame, or a subtle gradient overlay.
- Instagram-native ads are CLEAN. Whitespace is a design element.

Return this exact JSON structure:
{
  "scene": "${hasProductImage ? 'BACKGROUND/STAGING ONLY (the real product photo will be placed in): describe surface, backdrop, lighting, props, atmosphere. DO NOT describe the product itself.' : 'A hyper-specific scene (3-4 sentences) UNIQUE to this product. Include environment, props, emotional moment.'} Must work with the ${layout.name} layout structure.",
  "camera": "Camera setup: lens mm, aperture f/1.4-f/2.8 (shallow depth of field), angle, composition rule.",
  "lighting": "Lighting (2 sentences): HIGH CONTRAST — deep shadows, bright highlights. NOT flat or evenly lit. Dramatic, directional.",
  "mood": "Emotional response (2 sentences): what to feel, what action to trigger.",
  "colorPalette": "2 colors MAXIMUM: 1 dominant + 1 accent. Example: '#1A1A1A, #FF4D00'. Monochromatic or high-contrast duotone. NOT rainbow.",
  "layoutStyle": "${layout.key}",
  "headline": "1-3 words MAXIMUM. Use only simple German words you can spell perfectly. Example: 'Jetzt erleben' or 'Dein Style'.",
  "tagline": "Supporting subline (1 short sentence). Adds context or proof.",
  "hook": "1 short sentence, 4-8 simple words max. Curiosity or urgency.",
  "includeCta": true/false,
  "cta": "CTA text (2 words MAX, e.g. 'Jetzt starten') if includeCta is true, or null if false.",
  "ctaStyle": "CTA visual style if included, or null. Example: 'Solid high-contrast pill with rounded corners'",
  "textPlacement": "DYNAMIC placement integrated into scene. Example: 'Massive headline top-left taking 30% of canvas, product fills right 60%'. NEVER 'bottom center forced'.",
  "designElements": "Maximum 1-2 elements. Be specific: 'Single thin white horizontal line above tagline' or 'Frosted glass panel behind text'. Less is more."
}

CRITICAL:
1. Scene MUST be specific to "${adSpec.productName || 'this product'}"${hasProductImage ? ' — describe BACKGROUND ONLY, not the product' : ''}
2. Headline MUST be rewritten professional copy, NEVER raw user input
3. Layout MUST follow the ${layout.name} style described above
4. Color palette: 2 colors maximum. Monochromatic > rainbow
5. CTA is OPTIONAL — decide based on the layout and concept`;

    console.log(`[NanoBanana] 🎬 AI Creative Director generating brief for "${adSpec.productName}" (${conceptType.key}, ${format})...`);

    try {
        const response = await client.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                temperature: 0.7, // Balanced: creative but precise for text quality
            },
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Empty response from Creative Director');

        const brief = JSON.parse(text);

        // Validate brief has required fields
        if (!brief.scene || !brief.camera || !brief.lighting) {
            throw new Error('Brief missing required fields (scene/camera/lighting)');
        }

        console.log(`[NanoBanana] ✅ Brief generated: "${brief.scene.substring(0, 80)}..."`);
        return brief;
    } catch (err) {
        console.warn(`[NanoBanana] ⚠️ AI Creative Director failed: ${err.message}`);
        return null; // Caller will fall back to static preset
    }
}

// ═══════════════════════════════════════════════════════════════
// INDUSTRY PRESETS — FALLBACK when AI brief fails
// ═══════════════════════════════════════════════════════════════

const INDUSTRY_FALLBACK = {
    tech_electronics: {
        scene: 'The product displayed on a clean dark surface with subtle ambient blue-purple glow, highlighting its design and craftsmanship.',
        camera: 'Shot with 85mm lens at f/2.0, eye-level, centered composition with product as hero',
        lighting: 'Dramatic rim-light from behind, subtle cool fill from front',
        mood: 'Premium, innovative, cutting-edge',
        ctaStyle: 'Rounded pill, electric blue #2563EB',
        colorTemp: '4500K cool-neutral',
    },
    food_restaurant: {
        scene: 'The food item beautifully presented on a rustic wooden surface, steam visible, fresh herbs and ingredients artfully scattered nearby.',
        camera: 'Shot with 50mm lens at f/2.8, 45-degree overhead angle, food photography composition',
        lighting: 'Warm side-lighting from left (window quality), golden fill from right',
        mood: 'Appetizing, warm, inviting',
        ctaStyle: 'Rounded pill, warm terracotta #E07A5F',
        colorTemp: '5800K warm',
    },
    fashion_beauty: {
        scene: 'The product in an editorial setting with clean lines and generous negative space, art-directed for high-fashion appeal.',
        camera: 'Shot with 70mm lens at f/1.8, editorial composition with negative space',
        lighting: 'Soft diffused beauty lighting, large overhead softbox, subtle fill from below',
        mood: 'Aspirational, luxurious, desirable',
        ctaStyle: 'Rounded pill, matte black #1A1A1A',
        colorTemp: '5200K neutral-warm',
    },
    fitness_health: {
        scene: 'The product in an energetic context — gym, outdoors, or post-workout moment with natural golden light.',
        camera: 'Shot with 35mm lens at f/2.8, slightly dynamic low angle, conveying energy',
        lighting: 'Golden hour natural light, high clarity, vibrant',
        mood: 'Motivating, empowering, energetic',
        ctaStyle: 'Rounded pill, vibrant coral #FF6B6B',
        colorTemp: '5500K warm-neutral',
    },
    home_interior: {
        scene: 'The product integrated into a warmly styled living space with complementary decor and natural daylight.',
        camera: 'Shot with 35mm lens at f/4.0, room context visible, product as focal point',
        lighting: 'Warm natural window light, golden hour feel',
        mood: 'Cozy, aspirational, serene',
        ctaStyle: 'Rounded pill, warm sage #6B8E6B',
        colorTemp: '5800K warm',
    },
    default: {
        scene: 'The product showcased in a clean, professional setting that highlights its quality and design.',
        camera: 'Shot with 50mm lens at f/3.5, clean product photography composition',
        lighting: 'Bright, even, professional studio lighting with soft shadows',
        mood: 'Clean, trustworthy, professional',
        ctaStyle: 'Rounded pill, warm orange #F97316',
        colorTemp: '5000K neutral',
    },
};

const INDUSTRY_ALIASES = {
    'tech': 'tech_electronics', 'electronics': 'tech_electronics', 'software': 'tech_electronics',
    'saas': 'tech_electronics', 'b2b': 'tech_electronics', 'gadget': 'tech_electronics',
    'food': 'food_restaurant', 'restaurant': 'food_restaurant', 'beverage': 'food_restaurant',
    'fashion': 'fashion_beauty', 'beauty': 'fashion_beauty', 'cosmetics': 'fashion_beauty',
    'jewelry': 'fashion_beauty', 'clothing': 'fashion_beauty',
    'fitness': 'fitness_health', 'health': 'fitness_health', 'wellness': 'fitness_health',
    'sport': 'fitness_health', 'supplement': 'fitness_health',
    'home': 'home_interior', 'interior': 'home_interior', 'furniture': 'home_interior',
    'decor': 'home_interior',
};

function resolveIndustry(input) {
    if (!input) return 'default';
    const key = input.toLowerCase().replace(/[^a-z_]/g, '');
    return INDUSTRY_FALLBACK[key] ? key : (INDUSTRY_ALIASES[key] || 'default');
}

function getFallbackPreset(industry) {
    const key = resolveIndustry(industry);
    return INDUSTRY_FALLBACK[key] || INDUSTRY_FALLBACK.default;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 2: PROMPT ASSEMBLY — From AI Brief or Fallback Preset
// ═══════════════════════════════════════════════════════════════

/**
 * Build a NanoBanana-compliant image prompt from an AI-generated brief
 * or a static industry fallback preset.
 */
function buildCreativePrompt(config) {
    const { brief, fallbackPreset, format, adSpec, brandKit, conceptKey } = config;
    const formatSpec = META_FORMATS[format];
    const source = brief || fallbackPreset;

    // Brand color integration
    const brandColors = brandKit?.palette?.length > 0
        ? `Apply these brand colors as accent elements: ${brandKit.palette.join(', ')}.`
        : source.colorPalette
            ? `Color palette: ${source.colorPalette}`
            : 'Use a monochromatic or 2-color palette that complements the scene.';

    // Safe zone instructions for story format
    const safeZone = format === 'story'
        ? '\nSAFE ZONES: Keep all important elements in the center 72% of vertical composition. Top/bottom 14% will be cropped by Instagram Stories UI.'
        : '';

    // Language-aware defaults
    const isEnglish = adSpec.language === 'en';

    // ── LANGUAGE BLOCK — Critical: tells Gemini Image what language to render text in ──
    const languageBlock = isEnglish ? `
LANGUAGE: ALL text rendered in this image MUST be in English.
` : `
LANGUAGE & TEXT RENDERING — ABSOLUTE RULES:
ALL text in this image MUST be in German (Deutsch).

1. RENDER ONLY THE EXACT TEXT STRINGS GIVEN BELOW — do NOT change, rephrase, or add ANY text.
2. Copy each word LETTER BY LETTER from the strings provided.
3. Headline should be MAXIMUM 1-3 words. If the headline is longer, only render the first 2 words.
4. If you are not 100% sure you can render a word correctly, SKIP IT ENTIRELY.
5. PREFER rendering NO TEXT over rendering MISSPELLED text.
6. Use € for prices, NEVER $.
7. Simple words only. No compound nouns. No words longer than 8 letters.
8. Better to have a beautiful image with NO text than an image with garbled text.
`;

    // PREFER AI-generated copy from brief, fall back to user input
    const headline = brief?.headline || adSpec.headline || adSpec.productName || '';
    const subheadline = brief?.tagline || adSpec.subheadline || '';

    // CTA is now OPTIONAL — only include if the brief says so
    const includeCta = brief?.includeCta !== false; // default true for fallback presets
    const cta = includeCta ? (brief?.cta || adSpec.cta || '') : '';

    // Dynamic placement from brief — never hardcoded
    const textPlacement = source.textPlacement || 'Massive headline using rule of thirds, taking 20-40% of canvas area';
    const ctaStyle = source.ctaStyle || 'Solid high-contrast pill with rounded corners';

    // Design elements — prefer concept-specific presets, then brief, then generic
    const conceptDesignPreset = conceptKey ? (CONCEPT_DESIGN_ELEMENTS[conceptKey] || '') : '';
    const designElements = conceptDesignPreset || brief?.designElements || '';

    // Layout style
    const layoutKey = brief?.layoutStyle || source.layoutStyle || 'full_bleed';
    const layoutDef = LAYOUT_STYLES.find(l => l.key === layoutKey);

    // Build text block — conditionally include CTA
    let textBlock = '';
    if (headline) {
        textBlock = `
TEXT IN IMAGE (render sharply, INTEGRATE into the designed composition):
- HEADLINE: "${headline}"
  COPY THIS TEXT EXACTLY, CHARACTER BY CHARACTER. Do not modify, rephrase, or respell it.
  Position: ${textPlacement}
  Typography: Bold modern sans-serif (Inter, Helvetica Neue, or Montserrat), weight 700-900
  Size: MASSIVE — headline should take up 20-40% of the canvas area. Impossible to miss on a phone screen.
  IMPORTANT: Text must feel DESIGNED into the image — like a professional Photoshop comp
`;
        if (subheadline) {
            textBlock += `
- SUBHEADLINE: "${subheadline}"
  COPY THIS TEXT EXACTLY, CHARACTER BY CHARACTER. Do not modify, rephrase, or respell it.
  Typography: Regular weight, 40-50% of headline size, positioned near headline
`;
        }

        if (includeCta && cta) {
            textBlock += `
- CTA BUTTON: "${cta}"
  COPY THIS TEXT EXACTLY, CHARACTER BY CHARACTER. Do not modify, rephrase, or respell it.
  Style: ${ctaStyle}
  IMPORTANT: CTA must feel integrated into the layout — NOT forced to bottom-center
`;
        }
    } else {
        textBlock = `
SPACE FOR TEXT: Leave generous negative space for headline overlay.`;
    }

    // Design elements instruction — concept-specific or minimalist
    const designBlock = designElements ? `
GRAPHIC DESIGN — LESS IS MORE:
${designElements}
Keep it clean. Maximum 1-2 design elements. Whitespace is a design element.` : `
GRAPHIC DESIGN — LESS IS MORE:
Maximum 1-2 design elements. Choose ONE:
- A single bold accent line or stripe
- A frosted glass text panel for readability
- A clean geometric frame around the product
- A subtle gradient overlay for text contrast
Do NOT clutter. Instagram-native ads are CLEAN.`;

    // ── PRODUCT IMAGE PRESERVATION — Bug 3 Fix: check both URL and base64 ──
    const hasProductImage = !!adSpec.productImageUrl || !!adSpec.productImageBase64;
    // Bug 2 Fix: Stronger preservation instructions
    const productPreservationBlock = hasProductImage ? `
═══ PRODUCT IMAGE — THIS IS THE #1 RULE ═══
A REAL PRODUCT PHOTO is provided as reference. This overrides everything else.

MANDATORY:
1. The product in your generated image MUST be a FAITHFUL COPY of the reference photo.
2. SAME shape, SAME colors, SAME branding, SAME labels, SAME textures, SAME proportions.
3. DO NOT redesign, reimagine, stylize, or artistically interpret the product.
4. DO NOT change the product's color scheme, material appearance, or form factor.
5. Think: PHOTOSHOP CUTOUT of the real product placed into a new scene.
6. If you cannot faithfully reproduce the product, show it smaller rather than wrong.
7. The scene/background can be creative. The PRODUCT is sacred and untouchable.
` : '';

    // Bug 5+6 Fix: Layout as #1 priority, BEFORE scene description
    return `═══ LAYOUT STRUCTURE (THIS IS THE #1 COMPOSITION PRIORITY) ═══
This ad MUST follow this exact layout composition. DO NOT default to a generic full-bleed photo.
${layoutDef ? `Layout: ${layoutDef.name}\n${layoutDef.instruction}` : 'LAYOUT: Full bleed — scene fills entire canvas.'}
The layout structure above is MORE IMPORTANT than the scene description below.
If the layout says "split panel" — the image MUST have two distinct visual panels.
If the layout says "geometric frame" — the product MUST be inside a geometric shape.
If the layout says "bold typographic" — text MUST be the dominant visual element.

${productPreservationBlock}
${languageBlock}
═══ SCENE (fit this INTO the layout above) ═══
${source.scene}
Product: "${adSpec.productName || adSpec.offer || 'Product'}"${hasProductImage ? ' — use the EXACT product from the provided reference image, DO NOT change its appearance.' : ' — integrated naturally into the composition.'}

CAMERA:
- ${source.camera}
- ${formatSpec.ratio} aspect ratio (${formatSpec.width}×${formatSpec.height})
${source.colorTemp ? `- Color temperature: ${source.colorTemp}` : ''}

LIGHTING:
- ${source.lighting}
- HIGH CONTRAST — deep shadows, bright highlights. Directional, dramatic. NOT flat or evenly lit.
${safeZone}
${textBlock}
${designBlock}

MOOD: ${source.mood}
${brandColors}

═══ 2026 META AD STYLE (CRITICAL) ═══
This must stop the scroll on Instagram/Facebook. Modern, bold, native-feeling.

1. CONTRAST: High contrast lighting. Deep shadows, bright highlights. NOT flat or studio-sterile.
2. COLOR: Maximum 2 dominant colors + 1 accent. Monochromatic or duotone reads STRONGER than rainbow.
3. TEXTURE: Subtle film grain or texture. NOT clinical smoothness. Slightly imperfect = authentic.
4. BREATHING ROOM: 30-40% of the canvas should be breathing space. NOT every pixel filled.
5. TYPOGRAPHY WEIGHT: Headlines take up 20-40% of the canvas area. MASSIVE, bold, impossible to miss.
6. DEPTH: Strong foreground/background separation. Shallow depth of field (f/1.4-f/2.8).
7. FEEL: Scroll-stopping and bold. Think: Apple product shot meets Instagram-native content.
8. NOT: stock-photo-sterile, corporate, overdesigned, cluttered, or generic.`;
}

// ═══════════════════════════════════════════════════════════════
// IMAGE GENERATION — GEMINI (via @google/genai SDK)
// ═══════════════════════════════════════════════════════════════

/**
 * Generate an image using Gemini Image Generation model.
 * 2K resolution, aspect ratio from format spec.
 */
async function generateWithGemini(prompt, format, productImageUrl = null, productImageBase64 = null) {
    const client = getGeminiClient();
    const formatSpec = META_FORMATS[format];

    // Bug 1 Fix: Product image goes AFTER the text prompt so Gemini treats it
    // as the strongest signal (last content = highest priority for image gen).
    // Old order: [image, text-about-image, mega-prompt] → image got buried
    // New order: [mega-prompt, anchoring-text, image] → image is the final instruction

    const contents = [];
    let imageLoaded = false;
    let imageInlineData = null;

    // ── PRIORITY 1: Use base64 image directly (most reliable — no URL fetch needed) ──
    if (productImageBase64) {
        try {
            let base64Data = productImageBase64;
            let mimeType = 'image/png';

            // Handle data URL format: "data:image/png;base64,xxxxx"
            const dataUrlMatch = productImageBase64.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
            if (dataUrlMatch) {
                mimeType = dataUrlMatch[1];
                base64Data = dataUrlMatch[2];
            }

            imageInlineData = { mimeType, data: base64Data };
            imageLoaded = true;
            console.log(`[NanoBanana] ✅ Product image loaded from base64 (${(base64Data.length / 1024).toFixed(0)}KB)`);
        } catch (b64Err) {
            console.warn(`[NanoBanana] ⚠️ Base64 image parsing failed: ${b64Err.message}`);
        }
    }

    // ── PRIORITY 2: Fetch from URL (fallback if base64 not available) ──
    if (!imageLoaded && productImageUrl) {
        try {
            console.log(`[NanoBanana] 📷 Fetching product image from URL for Gemini...`);
            const imageResponse = await fetch(productImageUrl, {
                signal: AbortSignal.timeout(15000),
            });
            if (imageResponse.ok) {
                const imageArrayBuffer = await imageResponse.arrayBuffer();
                const imageBuffer = Buffer.from(imageArrayBuffer);
                imageInlineData = {
                    mimeType: imageResponse.headers.get('content-type') || 'image/png',
                    data: imageBuffer.toString('base64'),
                };
                imageLoaded = true;
                console.log(`[NanoBanana] ✅ Product image fetched from URL: ${(imageBuffer.length / 1024).toFixed(0)}KB`);
            } else {
                console.warn(`[NanoBanana] ⚠️ Product image URL returned ${imageResponse.status}`);
            }
        } catch (imgErr) {
            console.warn(`[NanoBanana] ⚠️ Could not fetch product image from URL: ${imgErr.message}`);
        }
    }

    if ((productImageUrl || productImageBase64) && !imageLoaded) {
        console.error('[NanoBanana] ❌ Product image was provided but could NOT be loaded! Ad will be generated without it.');
    }

    // ── CONTENT ORDER: text prompt FIRST, then anchoring text + image LAST ──
    // This ensures Gemini treats the product image as the strongest signal
    contents.push(prompt);

    if (imageLoaded && imageInlineData) {
        contents.push(
            '\n\nIMPORTANT — PRODUCT REFERENCE IMAGE FOLLOWS:\n'
            + 'The image below is the EXACT product you MUST faithfully reproduce in the ad.\n'
            + 'Generate the ad scene described above, but the product MUST look IDENTICAL to this reference photo.\n'
            + 'Same shape, same colors, same labels, same textures, same proportions.\n'
            + 'This is image-to-image editing: place THIS EXACT product into the ad composition.\n'
        );
        contents.push({ inlineData: imageInlineData });
        console.log(`[NanoBanana] 📌 Product image placed AFTER prompt for maximum preservation strength`);
    }

    console.log(`[NanoBanana] 🎨 Generating ${format} image with ${GEMINI_IMAGE_MODEL} (2K)...`);

    const response = await client.models.generateContent({
        model: GEMINI_IMAGE_MODEL,
        contents: contents,
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
            imageConfig: {
                aspectRatio: formatSpec?.geminiAspect || '1:1',
                imageSize: '2K',
            },
        },
    });

    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData?.data) {
                const buffer = Buffer.from(part.inlineData.data, 'base64');
                if (buffer.length < 1000) {
                    throw new Error('Generated image too small (likely failed)');
                }
                console.log(`[NanoBanana] ✅ Gemini generated ${format}: ${(buffer.length / 1024).toFixed(0)}KB`);
                return buffer;
            }
        }
    }

    let textResponse = '';
    try {
        textResponse = response.candidates?.[0]?.content?.parts
            ?.filter(p => p.text)
            ?.map(p => p.text)
            ?.join(' ') || '';
    } catch { /* ignore */ }

    throw new Error(`Gemini returned no image. Text: ${textResponse.substring(0, 200)}`);
}

// OpenAI fallback removed — 100% Gemini

// ═══════════════════════════════════════════════════════════════
// MAIN ENGINE — 2-Phase Generation
// ═══════════════════════════════════════════════════════════════

/**
 * Generate all creative assets for an ad pack.
 * 
 * Phase 1: AI Creative Director generates unique briefs per concept+format
 * Phase 2: NanoBanana builds prompts from briefs and generates images
 * Fallback: Static industry presets if Phase 1 fails
 */
export async function generateCreativePack(adSpec, options = {}) {
    const {
        formats = Object.keys(META_FORMATS),
        maxRetries = 2,
        onProgress = () => { },
    } = options;

    if (!isGeminiAvailable()) {
        throw new Error('GEMINI_API_KEY not configured — cannot generate images');
    }
    const industryKey = resolveIndustry(adSpec.industry);
    const totalImages = CONCEPT_TYPES.length * formats.length;
    let generatedCount = 0;
    let failedCount = 0;
    let aiBriefsUsed = 0;
    let fallbacksUsed = 0;

    console.log(`[NanoBanana] 🚀 Engine v5.0 — AI Creative Director`);
    console.log(`[NanoBanana] Product: "${adSpec.productName}" | Industry: ${adSpec.industry} (${industryKey})`);
    console.log(`[NanoBanana] Image Gen: ${GEMINI_IMAGE_MODEL}`);

    const creativePack = {
        concepts: [],
        engine: 'gemini_image',
        industry: industryKey,
        stats: { total: totalImages, generated: 0, failed: 0, aiBriefs: 0, fallbacks: 0 },
    };

    // ── PHASE 1: Pre-generate ALL briefs in parallel ──
    // 9 briefs from Gemini Flash in ~1.5s parallel instead of ~13s sequential
    const briefJobs = [];
    for (let conceptIndex = 0; conceptIndex < CONCEPT_TYPES.length; conceptIndex++) {
        const conceptType = CONCEPT_TYPES[conceptIndex];
        for (const formatKey of formats) {
            if (!META_FORMATS[formatKey]) continue;
            const variation = getVariationSeeds(conceptIndex);
            const briefPromise = generateCreativeBrief(adSpec, conceptType, formatKey, variation)
                .catch(err => { console.warn(`[NanoBanana] Brief failed for ${conceptType.key}/${formatKey}: ${err.message}`); return null; });
            briefJobs.push({ conceptIndex, conceptType, formatKey, briefPromise });
        }
    }

    console.log(`[NanoBanana] 🎬 Generating ${briefJobs.length} briefs in parallel...`);
    onProgress('generating_briefs', 5, { total: briefJobs.length });
    const briefResults = await Promise.all(briefJobs.map(j => j.briefPromise));

    // Map briefs back to concept/format pairs
    const briefMap = new Map();
    briefJobs.forEach((job, idx) => {
        briefMap.set(`${job.conceptIndex}_${job.formatKey}`, briefResults[idx]);
    });

    const successBriefs = briefResults.filter(b => b !== null).length;
    console.log(`[NanoBanana] ✅ ${successBriefs}/${briefJobs.length} briefs generated`);

    // ── PHASE 2: Generate images sequentially (rate limits) ──
    for (let conceptIndex = 0; conceptIndex < CONCEPT_TYPES.length; conceptIndex++) {
        const conceptType = CONCEPT_TYPES[conceptIndex];

        const conceptResult = {
            name: conceptType.name,
            key: conceptType.key,
            formats: {},
        };

        for (const formatKey of formats) {
            const formatSpec = META_FORMATS[formatKey];
            if (!formatSpec) continue;

            const progressPct = Math.round((generatedCount / totalImages) * 100);
            onProgress('generating_image', progressPct, {
                concept: conceptType.name,
                format: formatKey,
                remaining: totalImages - generatedCount,
            });

            // Use pre-generated brief or fallback
            const brief = briefMap.get(`${conceptIndex}_${formatKey}`);
            let fallbackPreset = null;

            if (!brief) {
                fallbackPreset = getFallbackPreset(adSpec.industry);
                fallbacksUsed++;
            } else {
                aiBriefsUsed++;
            }

            // ── PHASE 2: Prompt Assembly + Image Generation ──
            const prompt = buildCreativePrompt({
                brief,
                fallbackPreset: brief ? null : fallbackPreset,
                format: formatKey,
                adSpec,
                brandKit: adSpec.brandKit || {},
            });

            let imageResult = null;
            let lastError = null;

            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    const buffer = await generateWithGemini(prompt, formatKey, adSpec.productImageUrl);
                    imageResult = {
                        buffer,
                        width: formatSpec.width,
                        height: formatSpec.height,
                        format: 'png',
                        engine: 'gemini_image',
                        usedAiBrief: !!brief,
                    };
                    break;
                } catch (err) {
                    lastError = err;
                    console.warn(`[NanoBanana] ${conceptType.name}/${formatKey} attempt ${attempt + 1}/${maxRetries + 1} failed: ${err.message}`);
                }
            }

            if (imageResult) {
                conceptResult.formats[formatKey] = imageResult;
                generatedCount++;
            } else {
                failedCount++;
                console.error(`[NanoBanana] ❌ ${conceptType.name}/${formatKey} failed: ${lastError?.message}`);
                conceptResult.formats[formatKey] = {
                    error: lastError?.message || 'Unknown error',
                    width: formatSpec.width,
                    height: formatSpec.height,
                };
            }
        }

        creativePack.concepts.push(conceptResult);
    }

    creativePack.stats = { total: totalImages, generated: generatedCount, failed: failedCount, aiBriefs: aiBriefsUsed, fallbacks: fallbacksUsed };

    console.log(`[NanoBanana] ✅ Pack complete: ${generatedCount}/${totalImages} images | AI Briefs: ${aiBriefsUsed} | Fallbacks: ${fallbacksUsed}`);

    if (generatedCount < Math.ceil(totalImages * 0.67)) {
        throw new Error(`Too many failures: ${generatedCount}/${totalImages} (need ≥67%)`);
    }

    return creativePack;
}

/**
 * Generate a single ad image using the NanoBanana engine.
 * Uses AI Creative Director for individualized prompt.
 */
export async function generateSingleAd(params) {
    const {
        productImageUrl,
        headline, subheadline, cta,
        productName, offer, audience, industry, angle,
        brandKit, format = 'square',
        _forceConceptIndex, _forceLayoutIndex,
        _adaptiveConfig, // { archetype, layout (key), hook, meta }
        funnelStage, goal,
    } = params;

    const adSpec = {
        productName: productName || offer || 'Product',
        offer: offer || productName || 'Premium Product',
        audience: audience || 'quality-conscious consumers',
        industry: industry || 'general',
        angle: angle || 'premium quality',
        language: params.language || 'de',
        usp: params.usp || '',
        description: params.description || '',
        text: params.text || '',
        headline, subheadline,
        cta: cta || '',  // No forced fallback — AI decides
        productImageUrl,
        productImageBase64: params.productImageBase64 || null, // Bug 3 Fix: pass base64 to adSpec
        brandKit,
    };

    if (!isGeminiAvailable()) {
        throw new Error('GEMINI_API_KEY not configured — cannot generate images');
    }

    // ── Archetype + Layout + Hook Selection ──
    let conceptType, layout, hookType;

    if (_adaptiveConfig) {
        // Adaptive selector provided complete config
        conceptType = _adaptiveConfig.archetype;
        const layoutKey = _adaptiveConfig.layout;
        layout = LAYOUT_STYLES.find(l => l.key === layoutKey) || pickRandomLayout();
        hookType = _adaptiveConfig.hook;
    } else if (typeof _forceConceptIndex === 'number') {
        // Legacy forced indices
        conceptType = CONCEPT_TYPES[_forceConceptIndex % CONCEPT_TYPES.length];
        layout = typeof _forceLayoutIndex === 'number'
            ? LAYOUT_STYLES[_forceLayoutIndex % LAYOUT_STYLES.length]
            : pickRandomLayout();
    } else {
        conceptType = pickRandomConcept();
        layout = pickRandomLayout();
    }

    const variation = getVariationSeeds(0);

    console.log(`[NanoBanana] 🎲 archetype=${conceptType.key} (${conceptType.category || '?'}), layout=${layout.key}, hook=${hookType?.key || 'none'}`);

    // Phase 1: AI Creative Director — with hook injection
    const brief = await generateCreativeBrief(adSpec, conceptType, format, variation, layout, hookType);

    // Phase 2: Prompt Assembly — pass conceptKey for design element presets
    const prompt = buildCreativePrompt({
        brief,
        fallbackPreset: brief ? null : getFallbackPreset(industry),
        format,
        adSpec,
        brandKit: brandKit || {},
        conceptKey: conceptType.key,
    });

    // Image Generation — 100% Gemini (prefer base64 image, fallback to URL)
    const buffer = await generateWithGemini(prompt, format, productImageUrl, params.productImageBase64 || null);
    const engine = 'gemini_image';

    // CTA only if the brief decided to include one
    const includeCta = brief?.includeCta !== false;

    return {
        buffer,
        engine,
        usedAiBrief: !!brief,
        // AI-generated copy for frontend display
        copy: {
            headline: brief?.headline || adSpec.headline || adSpec.productName || '',
            tagline: brief?.tagline || adSpec.subheadline || '',
            hook: brief?.hook || '',
            cta: includeCta ? (brief?.cta || adSpec.cta || '') : '',
            includeCta,
        },
        metadata: {
            industry: resolveIndustry(industry),
            concept: conceptType.name,
            layout: layout.name,
            format,
            model: GEMINI_IMAGE_MODEL,
            briefScene: brief?.scene?.substring(0, 100) || 'fallback preset',
            designElements: brief?.designElements || '',
        },
    };
}

// ═══════════════════════════════════════════════════════════════
// GEMINI VISION SCORING — Real quality assessment
// ═══════════════════════════════════════════════════════════════

/**
 * Score a generated ad image using Gemini Vision.
 * Returns real quality metrics instead of placeholder scores.
 * 
 * @param {Buffer} imageBuffer - PNG image buffer
 * @returns {Promise<Object>} Quality scores { readability, composition, colors, scrollStop, overall, feedback }
 */
export async function scoreAdImage(imageBuffer) {
    try {
        const client = getGeminiClient();
        const base64 = imageBuffer.toString('base64');

        const response = await client.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'image/png',
                                data: base64,
                            },
                        },
                        {
                            text: `You are a Meta Ads performance analyst. Rate this ad image on a scale of 1-10 for each category.

SCORING CRITERIA:
1. readability (1-10): Is the text sharp, readable, and well-positioned? Can you read it at mobile phone size?
2. composition (1-10): Does it follow visual hierarchy? Rule of thirds? Clear focal point?
3. colors (1-10): Is the color palette harmonious? Good contrast? Professional?
4. scrollStop (1-10): Would this stop someone scrolling through Instagram/Facebook? Eye-catching?
5. overall (1-10): Overall ad quality as a performance marketer would judge it.
6. feedback: One sentence of constructive feedback in German.

Return ONLY valid JSON:
{ "readability": X, "composition": X, "colors": X, "scrollStop": X, "overall": X, "feedback": "..." }`,
                        },
                    ],
                },
            ],
            config: {
                responseMimeType: 'application/json',
                temperature: 0.3,
                maxOutputTokens: 200,
            },
        });

        const parsed = JSON.parse(response.text);
        console.log(`[NanoBanana] 📊 Ad Score: ${parsed.overall}/10 — ${parsed.feedback}`);
        return parsed;
    } catch (err) {
        console.warn(`[NanoBanana] ⚠️ Scoring failed: ${err.message}`);
        return {
            readability: null,
            composition: null,
            colors: null,
            scrollStop: null,
            overall: null,
            feedback: 'Bewertung nicht verfügbar',
        };
    }
}

/**
 * No-op cleanup (no temp files when using API directly).
 */
export async function cleanupTempFiles() { }

export {
    CONCEPT_TYPES,
    LAYOUT_STYLES,
    META_FORMATS,
    buildCreativePrompt,
    resolveIndustry,
    isGeminiAvailable as checkAvailability,
};

export default {
    generateCreativePack,
    generateSingleAd,
    scoreAdImage,
    cleanupTempFiles,
    isGeminiAvailable,
    CONCEPT_TYPES,
    LAYOUT_STYLES,
    META_FORMATS,
    resolveIndustry,
};
