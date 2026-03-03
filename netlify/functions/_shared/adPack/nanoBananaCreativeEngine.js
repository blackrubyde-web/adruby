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
// CONCEPT TYPES — 15 diverse creative concepts
// ═══════════════════════════════════════════════════════════════

const CONCEPT_TYPES = [
    // ── ORIGINAL 5 ──
    {
        key: 'lifestyle_in_use',
        name: 'Lifestyle In-Use',
        briefDirection: 'Show the product being used by a real person in a natural, aspirational setting. The scene tells a story about the lifestyle this product enables.',
    },
    {
        key: 'product_hero',
        name: 'Product Hero',
        briefDirection: 'Dramatic, stunning product showcase that highlights the product\'s most impressive feature or design element. The product is the undeniable star.',
    },
    {
        key: 'emotional_context',
        name: 'Emotional Context',
        briefDirection: 'Create a scene that captures the EMOTIONAL BENEFIT of owning this product. Focus on the feeling, the result, the transformation — not just the object.',
    },
    {
        key: 'social_proof',
        name: 'Social Proof',
        briefDirection: 'Show the product being enjoyed by multiple people, or in a setting that implies popularity and trust. Think: testimonial style, community, or "everyone has it" vibe.',
    },
    {
        key: 'problem_solution',
        name: 'Problem → Solution',
        briefDirection: 'Visualize the BEFORE/AFTER or the PROBLEM this product solves. The image should make the viewer feel the pain point and see the product as the obvious solution.',
    },
    // ── NEW 10 ──
    {
        key: 'feature_callout',
        name: 'Feature Callout',
        briefDirection: 'Product centered with 3-5 curved arrows pointing FROM feature labels TO specific product parts. Each label has a small circle origin point (○). Arrows are smooth bezier curves, NOT straight. Feature text is short (2-3 words per label). This is an EDUCATIONAL ad that shows exactly what makes the product special.',
    },
    {
        key: 'before_after',
        name: 'Before / After',
        briefDirection: 'Perfect 50/50 split showing BEFORE (the problem — muted colors, negative) and AFTER (with the product — vibrant, positive). Clear labels "Vorher" / "Nachher" or "Ohne" / "Mit". The contrast should be dramatic and instantly understandable. Think: transformation visual.',
    },
    {
        key: 'ugc_authentic',
        name: 'UGC Authentic',
        briefDirection: 'Make it look like a real user-generated Instagram post, NOT a studio ad. Natural lighting, slightly imperfect, real person using the product. Add Instagram-style UI: username "@satisfied_customer", engagement numbers, comment text. Authentic, relatable, trustworthy. This is NOT an ad — it\'s a real recommendation.',
    },
    {
        key: 'testimonial_quote',
        name: 'Testimonial Quote',
        briefDirection: 'Large customer quote in elegant quotation marks „...". Customer name + title below. 5 filled gold stars ⭐⭐⭐⭐⭐ prominently displayed. Product image on one side, quote card on the other. Trust, social proof, credibility. Think: Amazon review meets premium design.',
    },
    {
        key: 'infographic_stat',
        name: 'Infographic Stat',
        briefDirection: 'A LARGE BOLD NUMBER is the hero element (like "73%" or "2.340+" or "3x"). Supporting context text explains what the number means. Product shown alongside. Clean infographic style, data-driven trust. The number should be the first thing the eye sees. Think: data visualization meets ad.',
    },
    {
        key: 'comparison_grid',
        name: 'Us vs. Them',
        briefDirection: 'Perfect 50/50 split: LEFT side is OUR product (bright, positive, green checkmarks ✅) / RIGHT side is competitor/old way (muted, negative, red X marks ❌). 3-4 comparison points stacked vertically. Clear visual hierarchy — our product WINS. Think: comparison chart meets visual ad.',
    },
    {
        key: 'step_by_step',
        name: 'Step by Step',
        briefDirection: 'Show "Schritt 1 → Schritt 2 → Schritt 3" with forward-progressing arrows between steps. Each step has a number in a circle, a short label, and a small visual. Final step shows the RESULT. Clear progression flow from left to right (or top to bottom in story). Educational, friction-removing.',
    },
    {
        key: 'unboxing_reveal',
        name: 'Unboxing Reveal',
        briefDirection: 'Product being REVEALED from packaging. Hands opening a premium box. Confetti, sparkles, or light rays suggesting surprise and delight. The unboxing moment captures anticipation and excitement. Think: Apple unboxing experience, gift reveal, surprise moment.',
    },
    {
        key: 'job_recruiting',
        name: 'Job / Recruiting',
        briefDirection: '"Wir suchen dich!" or "Join Our Team" style ad. Bold headline, team photo in background. Benefits listed with green checkmarks ✅. Location pin 📍, salary badge, or perks highlighted. Professional but approachable. Think: modern startup recruiting post.',
    },
    {
        key: 'flash_sale',
        name: 'Flash Sale',
        briefDirection: 'URGENT flash sale advertisement. MASSIVE discount displayed in starburst/explosion shape. Product centered dramatically. Countdown timer visual. Old price struck through, new price bold and large. CTA is urgent and action-driving. FOMO, urgency, limited time, ACT NOW energy.',
    },
];

function pickRandomConcept() {
    return CONCEPT_TYPES[Math.floor(Math.random() * CONCEPT_TYPES.length)];
}

// ═══════════════════════════════════════════════════════════════
// CONCEPT → REFERENCE PATTERN MAP
// Links concept types to precise prompt snippets from referencePatterns.js
// ═══════════════════════════════════════════════════════════════

const CONCEPT_PATTERN_MAP = {
    feature_callout: REFERENCE_PATTERNS.feature_callouts?.promptSnippet || '',
    comparison_grid: REFERENCE_PATTERNS.us_vs_them?.promptSnippet || '',
    before_after: REFERENCE_PATTERNS.before_after?.promptSnippet || '',
    lifestyle_in_use: REFERENCE_PATTERNS.lifestyle_action?.promptSnippet || '',
    step_by_step: REFERENCE_PATTERNS.benefit_checkmarks?.promptSnippet || '',
    social_proof: REFERENCE_PATTERNS.collage_grid?.promptSnippet || '',
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
 * @param {Object} conceptType - What kind of ad (lifestyle, hero, emotional, etc.)
 * @param {string} format - Ad format (square, portrait, story)
 * @param {Object} variation - Variation seeds for diversity
 * @param {Object} [layoutStyle] - Optional layout style override; random if not provided
 * @returns {Promise<Object>} Creative brief JSON
 */
async function generateCreativeBrief(adSpec, conceptType, format, variation, layoutStyle) {
    const client = getGeminiClient();
    const formatSpec = META_FORMATS[format];
    const lang = adSpec.language === 'en' ? 'English' : 'German';
    const layout = layoutStyle || pickRandomLayout();

    // Build rich product context from all available fields
    const productContext = [
        adSpec.productName ? `Name: ${adSpec.productName}` : null,
        adSpec.offer ? `Offer: ${adSpec.offer}` : null,
        adSpec.usp ? `USP (raw user input — REWRITE this): ${adSpec.usp}` : null,
        adSpec.description ? `Description: ${adSpec.description}` : null,
        adSpec.text ? `Details: ${adSpec.text}` : null,
    ].filter(Boolean).join('\n');

    const prompt = `You are a world-class Creative Director, Graphic Designer, AND Copywriter at a top Meta Ads agency.
You are directing a $50,000 ad production for ONE specific product — combining photography, typography, and graphic design.

PRODUCT DETAILS:
${productContext || 'A premium product'}

INDUSTRY: ${adSpec.industry || 'general'}
TARGET AUDIENCE: ${adSpec.audience || 'quality-conscious consumers'}
CREATIVE ANGLE: ${adSpec.angle || 'premium quality'}
AD FORMAT: ${format} (${formatSpec.ratio}, ${formatSpec.width}×${formatSpec.height})
LANGUAGE: All text MUST be in ${lang}.

CREATIVE CONCEPT: ${conceptType.briefDirection}

${layout.instruction}

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
- The user's USP/description is RAW INPUT — COMPLETELY REWRITE it into professional, punchy ad copy.
- NEVER paste the user's text verbatim. Transform "Guter schläger, mehr power, bessere schläge" into something like "Dein unfairer Vorteil auf dem Court."
- Headlines: 2-5 words, emotionally charged, benefit-driven. Think Nike, Apple, or Gymshark.
- Hook: Creates curiosity or urgency. The "stop the scroll" line.
- Examples of great German ad copy:
  • "Spür den Unterschied." (feel it)
  • "Dein Move. Dein Moment." (personal)
  • "Nie wieder zweiter." (competitive edge)
  • "Bereit für mehr?" (curiosity)

═══ CTA RULES ═══
- CTA is OPTIONAL. Not every ad needs a CTA button.
- Many top-performing ads use NO CTA button — the image and text do the selling.
- If the layout style benefits from a CTA, include one that feels designed into the composition.
- If the layout style is minimal or typographic, SKIP the CTA entirely.
- Set "includeCta" to true or false in your response.

═══ DESIGN ELEMENT RULES ═══
- The ad is a DESIGNED piece, not just a photo with text overlay.
- Include graphic design elements where appropriate: decorative lines, geometric shapes, accent stripes, arrows (→), small badge/tag elements, dot patterns, or frame borders.
- These elements make the difference between "photo with text" and "professional designed ad".

Return this exact JSON structure:
{
  "scene": "A hyper-specific scene (3-4 sentences) UNIQUE to this product. Include environment, props, human interaction, emotional moment.",
  "camera": "Camera setup: lens mm, aperture f/X.X, angle, composition rule.",
  "lighting": "Lighting (2 sentences): primary source, fill, accents.",
  "mood": "Emotional response (2 sentences): what to feel, what action to trigger.",
  "colorPalette": "3-4 hex colors: '#hex1, #hex2, #hex3'",
  "layoutStyle": "${layout.key}",
  "headline": "SHORT punchy headline (2-5 words). Professional copywriting, NOT user's raw text.",
  "tagline": "Supporting subline (1 short sentence). Adds context or proof.",
  "hook": "First feed line — 1 sentence, curiosity or urgency.",
  "includeCta": true/false,
  "cta": "CTA text (2-4 words) if includeCta is true, or null if false.",
  "ctaStyle": "CTA visual style if included, or null. Example: 'Semi-transparent pill #1A1A1A 80% opacity'",
  "textPlacement": "DYNAMIC placement integrated into scene. Example: 'Large headline top-left with thin accent line above, product fills right 60%'. NEVER 'bottom center forced'.",
  "designElements": "Specific graphic elements to include: 'Thin white horizontal line above tagline, small corner badge with price, subtle dot grid in background panel'. Be specific."
}

CRITICAL:
1. Scene MUST be specific to "${adSpec.productName || 'this product'}"
2. Headline MUST be rewritten professional copy, NEVER raw user input
3. Layout MUST follow the ${layout.name} style described above
4. Include graphic design elements — this is NOT just a photo
5. CTA is OPTIONAL — decide based on the layout and concept`;

    console.log(`[NanoBanana] 🎬 AI Creative Director generating brief for "${adSpec.productName}" (${conceptType.key}, ${format})...`);

    try {
        const response = await client.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                temperature: 0.9, // High creativity for diverse outputs
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
            : 'Use colors that naturally complement the scene.';

    // Safe zone instructions for story format
    const safeZone = format === 'story'
        ? '\nSAFE ZONES: Keep all important elements in the center 72% of vertical composition. Top/bottom 14% will be cropped by Instagram Stories UI.'
        : '';

    // Language-aware defaults
    const isEnglish = adSpec.language === 'en';

    // PREFER AI-generated copy from brief, fall back to user input
    const headline = brief?.headline || adSpec.headline || adSpec.productName || '';
    const subheadline = brief?.tagline || adSpec.subheadline || '';

    // CTA is now OPTIONAL — only include if the brief says so
    const includeCta = brief?.includeCta !== false; // default true for fallback presets
    const cta = includeCta ? (brief?.cta || adSpec.cta || '') : '';

    // Dynamic placement from brief — never hardcoded
    const textPlacement = source.textPlacement || 'Headline integrated into scene composition using rule of thirds';
    const ctaStyle = source.ctaStyle || 'Semi-transparent pill, integrated into scene lighting';

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
  Position: ${textPlacement}
  Typography: Bold modern sans-serif (like Inter, Helvetica, or Montserrat), high contrast
  Size: Large enough to read at phone screen size
  IMPORTANT: Text must feel DESIGNED into the image — like a professional Photoshop comp
`;
        if (subheadline) {
            textBlock += `
- SUBHEADLINE: "${subheadline}"
  Typography: Regular weight, 50-60% of headline size, positioned near headline
`;
        }

        if (includeCta && cta) {
            textBlock += `
- CTA BUTTON: "${cta}"
  Style: ${ctaStyle}
  IMPORTANT: CTA must feel integrated into the layout — NOT forced to bottom-center
`;
        }
    } else {
        textBlock = `
SPACE FOR TEXT: Leave generous negative space for headline overlay.`;
    }

    // Design elements instruction — concept-specific or generic
    const designBlock = designElements ? `
GRAPHIC DESIGN ELEMENTS:
${designElements}
These elements are CRUCIAL — they differentiate a professional designed ad from a simple photo with text.` : `
GRAPHIC DESIGN ELEMENTS:
Add at least one design element: a thin accent line, geometric shape, subtle pattern, or decorative element.
This is NOT just a photo — it's a DESIGNED advertisement.`;

    return `A professional Meta advertisement image — a DESIGNED piece, not just a photo with text.

${layoutDef ? `LAYOUT STYLE: ${layoutDef.name}\n${layoutDef.instruction}\n` : ''}
SCENE:
${source.scene}
Product: "${adSpec.productName || adSpec.offer || 'Product'}" — integrated naturally into the composition.

CAMERA:
- ${source.camera}
- ${formatSpec.ratio} aspect ratio (${formatSpec.width}×${formatSpec.height})
${source.colorTemp ? `- Color temperature: ${source.colorTemp}` : ''}

LIGHTING:
- ${source.lighting}
- Professional commercial quality, natural-looking
${safeZone}
${textBlock}
${designBlock}

MOOD: ${source.mood}
${brandColors}

QUALITY: This must look like a $50,000 agency production.
Professional, polished, scroll-stopping. Indistinguishable from a real commercial ad.
Text and design elements must feel DESIGNED into the image — like an Adobe Illustrator/Photoshop comp.
Every element (text, shapes, lines, product) should feel intentionally placed.`;
}

// ═══════════════════════════════════════════════════════════════
// IMAGE GENERATION — GEMINI (via @google/genai SDK)
// ═══════════════════════════════════════════════════════════════

/**
 * Generate an image using Gemini Image Generation model.
 * 2K resolution, aspect ratio from format spec.
 */
async function generateWithGemini(prompt, format, productImageUrl = null) {
    const client = getGeminiClient();
    const formatSpec = META_FORMATS[format];

    const contents = [];

    // Product image for image-to-image generation
    if (productImageUrl) {
        try {
            console.log(`[NanoBanana] 📷 Fetching product image for Gemini...`);
            const imageResponse = await fetch(productImageUrl, {
                signal: AbortSignal.timeout(15000),
            });
            if (imageResponse.ok) {
                const imageArrayBuffer = await imageResponse.arrayBuffer();
                const imageBuffer = Buffer.from(imageArrayBuffer);
                contents.push({
                    inlineData: {
                        mimeType: imageResponse.headers.get('content-type') || 'image/png',
                        data: imageBuffer.toString('base64'),
                    },
                });
                console.log(`[NanoBanana] ✅ Product image loaded: ${(imageBuffer.length / 1024).toFixed(0)}KB`);
            }
        } catch (imgErr) {
            console.warn(`[NanoBanana] ⚠️ Could not fetch product image: ${imgErr.message}`);
        }
    }

    contents.push(prompt);

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
        brandKit,
    };

    if (!isGeminiAvailable()) {
        throw new Error('GEMINI_API_KEY not configured — cannot generate images');
    }

    // Concept + Layout: use forced indices if provided (variant diversity), else random
    const conceptType = typeof _forceConceptIndex === 'number'
        ? CONCEPT_TYPES[_forceConceptIndex % CONCEPT_TYPES.length]
        : pickRandomConcept();
    const layout = typeof _forceLayoutIndex === 'number'
        ? LAYOUT_STYLES[_forceLayoutIndex % LAYOUT_STYLES.length]
        : pickRandomLayout();
    const variation = getVariationSeeds(0);

    console.log(`[NanoBanana] 🎲 concept=${conceptType.key}, layout=${layout.key}${typeof _forceConceptIndex === 'number' ? ' (forced)' : ''}`);

    // Phase 1: AI Creative Director
    const brief = await generateCreativeBrief(adSpec, conceptType, format, variation, layout);

    // Phase 2: Prompt Assembly — pass conceptKey for design element presets
    const prompt = buildCreativePrompt({
        brief,
        fallbackPreset: brief ? null : getFallbackPreset(industry),
        format,
        adSpec,
        brandKit: brandKit || {},
        conceptKey: conceptType.key,
    });

    // Image Generation — 100% Gemini
    const buffer = await generateWithGemini(prompt, format, productImageUrl);
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
            readability: 7,
            composition: 7,
            colors: 7,
            scrollStop: 7,
            overall: 7,
            feedback: 'Scoring nicht verfügbar',
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
