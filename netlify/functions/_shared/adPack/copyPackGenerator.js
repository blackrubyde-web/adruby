/**
 * Copy Pack Generator v2.0
 * 
 * Generates a complete Meta ad copy pack from an AdSpec:
 *   - 12 primary texts (varied hooks: PAS, AIDA, story, question, stat, comparison)
 *   - 12 headlines (varied angles: benefit, curiosity, urgency, social proof, fear, authority)
 *   - 12 descriptions (varied focus: product, audience, result, comparison)
 *   - 6 CTAs (action, value, urgency, curiosity, social, exclusive)
 *   - 6 UGC-style variants (casual, first-person, testimonial)
 *   - 6 direct-response variants (authoritative, data-backed, punchy)
 * 
 * 100% Gemini — migrated from GPT-4o.
 */

import { GoogleGenAI } from '@google/genai';

// ═══════════════════════════════════════════════════════════════
// HOOK FRAMEWORKS
// ═══════════════════════════════════════════════════════════════

const HOOK_FRAMEWORKS = {
    PAS: 'Problem → Agitate → Solution',
    AIDA: 'Attention → Interest → Desire → Action',
    STORY: 'Mini-story / anecdote opening that draws the reader in',
    QUESTION: 'Lead with a provocative question that the audience can\'t ignore',
    STAT: 'Lead with a surprising statistic or data point',
    COMPARISON: 'Before/After or Us vs. Them contrast',
    SOCIAL_PROOF: 'Lead with customer results or social validation',
    FEAR: 'What happens if they DON\'T act (loss aversion)',
    CURIOSITY: 'Information gap that compels the click',
    BENEFIT: 'Lead with the #1 benefit, no fluff',
    AUTHORITY: 'Position as expert / industry leader',
    DIRECT: 'Straight to the point, no games',
};

const HEADLINE_ANGLES = [
    'benefit', 'curiosity', 'urgency', 'social_proof',
    'fear', 'authority', 'question', 'stat',
    'comparison', 'exclusivity', 'transformation', 'simplicity',
];

const DESCRIPTION_FOCUSES = [
    'product_features', 'audience_pain', 'result_outcome', 'comparison',
    'social_proof', 'process_ease', 'risk_reversal', 'scarcity',
    'testimonial', 'expertise', 'lifestyle', 'value_stack',
];

const CTA_TYPES = [
    'action', 'value', 'urgency', 'curiosity', 'social', 'exclusive',
];

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPT
// ═══════════════════════════════════════════════════════════════

function buildCopyPackSystemPrompt(language) {
    const lang = language === 'de' ? 'German' : 'English';
    const examples = language === 'de' ? GERMAN_EXAMPLES : ENGLISH_EXAMPLES;

    return `You are an elite Performance Creative Director at a top Meta Ads agency.
You write scroll-stopping ad copy that converts. You think in direct-response frameworks.

LANGUAGE: Write ALL copy in ${lang}. This is NON-NEGOTIABLE.
${language === 'de' ? `
GERMAN LANGUAGE RULES (MANDATORY — violations are unacceptable):
- Write in flawless, native-level German. You MUST sound like a native German copywriter, NOT a translation.
- Use correct German grammar: proper cases (Nominativ, Genitiv, Dativ, Akkusativ), correct articles (der/die/das), correct verb conjugations.
- Use proper German punctuation: correct comma placement (especially before dass, weil, wenn, ob, etc.).
- Use the informal du form (lowercase) for addressing the audience, unless the tone requires Sie.
- Avoid English loanwords when a natural German word exists (e.g. Angebot not Deal, Erlebnis not Experience, Vorteil not Benefit).
- Use authentic German expressions and idioms, not literal translations from English.
- Do NOT mix English and German mid-sentence unless it is a widely adopted brand term.
- Compound nouns follow German rules: Hautpflege-Routine not Hautpflege Routine.
- Umlauts and eszett MUST be used correctly — NEVER replace with ae, oe, ue, ss.
- After generating, mentally proofread every sentence for Rechtschreibung (spelling) and Grammatik (grammar).
- The copy must read as if written by a professional German advertising copywriter, not machine-translated.
` : ''}
YOUR OUTPUT RULES:
1. Every primary text MUST use a DIFFERENT hook framework (PAS, AIDA, Story, Question, Stat, Comparison, etc.)
2. Every headline MUST attack from a DIFFERENT angle (benefit, curiosity, urgency, social proof, etc.)
3. ZERO repetition — no two variants should feel similar
4. Each variant MUST include: persona context, pain point addressed, desire triggered, proof element, objection handled
5. Primary texts: short (2-3 sentences), medium (3-5 sentences), long (5-7 sentences) — mix all three lengths
6. Headlines: 5-60 characters, punchy, scroll-stopping
7. Descriptions: 30-200 characters, benefit-driven
8. CTAs: 3-25 characters, action-first verb
9. UGC variants: write as if a REAL customer is sharing their experience (first person, casual, authentic)
10. DR variants: write as if a seasoned direct-response copywriter (authoritative, data-backed, urgent)

META AD COMPLIANCE:
- No guaranteed income claims ("make $X", "verdiene X€")
- No unrealistic health claims ("lose X lbs in Y days")
- No before/after body transformation claims
- No personal attributes assumptions ("Are you overweight?")
- No misleading statistics without qualifier
- Use "may", "could", "up to" instead of absolutes

CREATIVE FRAMEWORKS TO USE:
${Object.entries(HOOK_FRAMEWORKS).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

${examples}

Return ONLY valid JSON matching the exact schema requested.`;
}

// ═══════════════════════════════════════════════════════════════
// FEW-SHOT EXAMPLES
// ═══════════════════════════════════════════════════════════════

const GERMAN_EXAMPLES = `
BEISPIEL-OUTPUT (Auszug):
{
  "primaryTexts": [
    {
      "text": "Du scrollst durch Instagram und siehst wieder perfekte Haut. Was du nicht siehst: Die meisten nutzen Filter. Was wäre, wenn deine echte Haut besser aussieht als jeder Filter? Unsere Bio-Hyaluronsäure-Creme versorgt deine Haut in 3 Schichten. 847 Kundinnen bestätigen: sichtbar jüngere Haut in 14 Tagen.",
      "hookType": "STORY",
      "length": "long",
      "persona": "Frauen 30+, Instagram-affin",
      "painPoint": "Unsicherheit über echte Hautqualität",
      "desire": "Natürliche Schönheit ohne Filter",
      "proofElement": "847 Kundinnen, 14-Tage-Ergebnis",
      "objectionHandled": "Funktioniert das wirklich ohne Filter?"
    }
  ],
  "headlines": [
    { "text": "14 Tage. Null Filter. 100% du.", "angle": "transformation", "charCount": 32 }
  ]
}`;

const ENGLISH_EXAMPLES = `
EXAMPLE OUTPUT (excerpt):
{
  "primaryTexts": [
    {
      "text": "You're scrolling through Instagram seeing perfect skin everywhere. What you don't see: most of it is filtered. What if your real skin looked better than any filter? Our bio-hyaluronic cream hydrates 3 skin layers deep. 847 customers confirm: visibly younger skin in 14 days.",
      "hookType": "STORY",
      "length": "long",
      "persona": "Women 30+, Instagram-savvy",
      "painPoint": "Insecurity about real skin quality",
      "desire": "Natural beauty without filters",
      "proofElement": "847 customers, 14-day result",
      "objectionHandled": "Does it really work without filters?"
    }
  ],
  "headlines": [
    { "text": "14 Days. Zero Filters. 100% You.", "angle": "transformation", "charCount": 32 }
  ]
}`;

// ═══════════════════════════════════════════════════════════════
// USER PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════

function buildCopyPackUserPrompt(adSpec) {
    const hookList = Object.keys(HOOK_FRAMEWORKS);
    const hookAssignments = hookList.slice(0, 12).map((h, i) => `  ${i + 1}. ${h}: ${HOOK_FRAMEWORKS[h]}`).join('\n');

    return `Generate a COMPLETE ad copy pack for this product/offer:

OFFER: ${adSpec.offer}
TARGET AUDIENCE: ${adSpec.audience}
CREATIVE ANGLE: ${adSpec.angle}
${adSpec.proof ? `SOCIAL PROOF: ${adSpec.proof}` : ''}
${adSpec.productName ? `PRODUCT NAME: ${adSpec.productName}` : ''}
${adSpec.constraints?.niche ? `NICHE: ${adSpec.constraints.niche}` : ''}
${adSpec.constraints?.tone ? `TONE: ${adSpec.constraints.tone}` : ''}
${adSpec.brandKit?.palette ? `BRAND COLORS: ${adSpec.brandKit.palette.join(', ')}` : ''}

REQUIRED OUTPUT (exact JSON schema):

{
  "primaryTexts": [
    // EXACTLY 12 items. Each uses a DIFFERENT hook framework:
${hookAssignments}
    // Each item: { "text": "...", "hookType": "PAS|AIDA|...", "length": "short|medium|long", "persona": "...", "painPoint": "...", "desire": "...", "proofElement": "...", "objectionHandled": "..." }
    // Mix: 4 short (2-3 sentences), 4 medium (3-5 sentences), 4 long (5-7 sentences)
  ],
  "headlines": [
    // EXACTLY 12 items. Each uses a DIFFERENT angle:
    // Angles: ${HEADLINE_ANGLES.join(', ')}
    // Each item: { "text": "...", "angle": "...", "charCount": number }
  ],
  "descriptions": [
    // EXACTLY 12 items. Each uses a DIFFERENT focus:
    // Focuses: ${DESCRIPTION_FOCUSES.join(', ')}
    // Each item: { "text": "...", "focus": "...", "charCount": number }
  ],
  "ctas": [
    // EXACTLY 6 items. Types: ${CTA_TYPES.join(', ')}
    // Each item: { "text": "...", "type": "...", "charCount": number }
  ],
  "ugcVariants": [
    // EXACTLY 6 items. Casual first-person testimonial style.
    // Each item: { "text": "...", "style": "testimonial|casual_review|friend_recommendation|unboxing|before_after_story|discovery", "persona": "..." }
  ],
  "drVariants": [
    // EXACTLY 6 items. Hard-hitting direct-response style.
    // Each item: { "text": "...", "style": "authoritative|data_driven|scarcity|risk_reversal|value_stack|deadline", "persona": "..." }
  ]
}

CRITICAL: Return ONLY valid JSON. No markdown, no explanation, no code fences.`;
}

// ═══════════════════════════════════════════════════════════════
// MAIN GENERATOR — 100% GEMINI
// ═══════════════════════════════════════════════════════════════

/**
 * Generate a complete copy pack from an AdSpec.
 * 
 * @param {Object} adSpec - The ad specification
 * @param {string} adSpec.offer - What's being sold
 * @param {string} adSpec.audience - Target persona
 * @param {string} adSpec.angle - Creative angle/hook
 * @param {string} [adSpec.proof] - Social proof / testimonials
 * @param {string} [adSpec.productName] - Product name
 * @param {Object} [adSpec.constraints] - Constraints (niche, language, tone)
 * @param {Object} [adSpec.brandKit] - Brand kit (palette, font, logoUrl)
 * @param {Object} [options] - Options
 * @param {number} [options.maxRetries=2] - Max retries on failure
 * @param {number} [options.temperature=0.85] - LLM temperature
 * @returns {Promise<CopyPack>} The generated copy pack
 */
export async function generateCopyPack(adSpec, options = {}) {
    const { maxRetries = 2, temperature = 0.85 } = options;
    const language = adSpec.constraints?.language || 'de';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set — cannot generate copy pack');
    const client = new GoogleGenAI({ apiKey });

    const systemPrompt = buildCopyPackSystemPrompt(language);
    const userPrompt = buildCopyPackUserPrompt(adSpec);

    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[CopyPackGenerator] Attempt ${attempt + 1}/${maxRetries + 1} (Gemini 2.5 Flash)...`);

            const response = await client.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `${systemPrompt}\n\n${userPrompt}`,
                config: {
                    responseMimeType: 'application/json',
                    temperature: temperature + (attempt * 0.05),
                    maxOutputTokens: 8000,
                },
            });

            const raw = response.text;
            const parsed = JSON.parse(raw);

            // Validate structure
            const validation = validateCopyPackStructure(parsed);
            if (!validation.valid) {
                console.warn(`[CopyPackGenerator] Structure validation failed:`, validation.errors);
                if (attempt < maxRetries) {
                    lastError = new Error(`Structure validation: ${validation.errors.join(', ')}`);
                    continue;
                }
                // On last attempt, auto-fix what we can
                const fixed = autoFixCopyPack(parsed);
                console.log(`[CopyPackGenerator] Auto-fixed copy pack, ${fixed.fixCount} fixes applied`);
                return enrichCopyPack(fixed.pack, adSpec);
            }

            console.log(`[CopyPackGenerator] ✅ Generated copy pack:`, {
                primaryTexts: parsed.primaryTexts?.length,
                headlines: parsed.headlines?.length,
                descriptions: parsed.descriptions?.length,
                ctas: parsed.ctas?.length,
                ugcVariants: parsed.ugcVariants?.length,
                drVariants: parsed.drVariants?.length,
            });

            return enrichCopyPack(parsed, adSpec);
        } catch (err) {
            console.error(`[CopyPackGenerator] Attempt ${attempt + 1} failed:`, err.message);
            lastError = err;
        }
    }

    throw new Error(`Copy pack generation failed after ${maxRetries + 1} attempts: ${lastError?.message}`);
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Validate the structure of a generated copy pack.
 */
export function validateCopyPackStructure(pack) {
    const errors = [];

    // Check required arrays exist with minimum counts
    const checks = [
        { field: 'primaryTexts', min: 8, target: 12 },
        { field: 'headlines', min: 8, target: 12 },
        { field: 'descriptions', min: 8, target: 12 },
        { field: 'ctas', min: 4, target: 6 },
        { field: 'ugcVariants', min: 4, target: 6 },
        { field: 'drVariants', min: 4, target: 6 },
    ];

    for (const check of checks) {
        if (!Array.isArray(pack[check.field])) {
            errors.push(`Missing or non-array: ${check.field}`);
        } else if (pack[check.field].length < check.min) {
            errors.push(`${check.field}: got ${pack[check.field].length}, need at least ${check.min}`);
        }
    }

    // Check primary texts have required metadata
    if (Array.isArray(pack.primaryTexts)) {
        for (let i = 0; i < pack.primaryTexts.length; i++) {
            const pt = pack.primaryTexts[i];
            if (!pt.text || typeof pt.text !== 'string') {
                errors.push(`primaryTexts[${i}]: missing text`);
            }
            if (!pt.hookType) {
                errors.push(`primaryTexts[${i}]: missing hookType`);
            }
        }
    }

    // Check headlines have text
    if (Array.isArray(pack.headlines)) {
        for (let i = 0; i < pack.headlines.length; i++) {
            if (!pack.headlines[i].text) {
                errors.push(`headlines[${i}]: missing text`);
            }
        }
    }

    return { valid: errors.length === 0, errors };
}

// ═══════════════════════════════════════════════════════════════
// AUTO-FIX
// ═══════════════════════════════════════════════════════════════

/**
 * Auto-fix a copy pack that failed validation.
 * Pads arrays to minimum lengths, adds missing metadata.
 */
export function autoFixCopyPack(pack) {
    let fixCount = 0;
    const fixed = { ...pack };

    // Ensure all arrays exist
    const defaults = {
        primaryTexts: [],
        headlines: [],
        descriptions: [],
        ctas: [],
        ugcVariants: [],
        drVariants: [],
    };

    for (const [key, defaultVal] of Object.entries(defaults)) {
        if (!Array.isArray(fixed[key])) {
            fixed[key] = defaultVal;
            fixCount++;
        }
    }

    // Fill missing metadata on primary texts
    const hookKeys = Object.keys(HOOK_FRAMEWORKS);
    for (let i = 0; i < fixed.primaryTexts.length; i++) {
        const pt = fixed.primaryTexts[i];
        if (!pt.hookType) {
            pt.hookType = hookKeys[i % hookKeys.length];
            fixCount++;
        }
        if (!pt.length) {
            pt.length = i < 4 ? 'short' : i < 8 ? 'medium' : 'long';
            fixCount++;
        }
        if (!pt.persona) { pt.persona = 'General'; fixCount++; }
        if (!pt.painPoint) { pt.painPoint = 'N/A'; fixCount++; }
        if (!pt.desire) { pt.desire = 'N/A'; fixCount++; }
        if (!pt.proofElement) { pt.proofElement = 'N/A'; fixCount++; }
        if (!pt.objectionHandled) { pt.objectionHandled = 'N/A'; fixCount++; }
    }

    // Fill missing metadata on headlines
    for (let i = 0; i < fixed.headlines.length; i++) {
        if (!fixed.headlines[i].angle) {
            fixed.headlines[i].angle = HEADLINE_ANGLES[i % HEADLINE_ANGLES.length];
            fixCount++;
        }
        if (!fixed.headlines[i].charCount && fixed.headlines[i].text) {
            fixed.headlines[i].charCount = fixed.headlines[i].text.length;
            fixCount++;
        }
    }

    // Fill missing metadata on descriptions
    for (let i = 0; i < fixed.descriptions.length; i++) {
        if (!fixed.descriptions[i].focus) {
            fixed.descriptions[i].focus = DESCRIPTION_FOCUSES[i % DESCRIPTION_FOCUSES.length];
            fixCount++;
        }
        if (!fixed.descriptions[i].charCount && fixed.descriptions[i].text) {
            fixed.descriptions[i].charCount = fixed.descriptions[i].text.length;
            fixCount++;
        }
    }

    // Fill missing metadata on CTAs
    for (let i = 0; i < fixed.ctas.length; i++) {
        if (!fixed.ctas[i].type) {
            fixed.ctas[i].type = CTA_TYPES[i % CTA_TYPES.length];
            fixCount++;
        }
    }

    return { pack: fixed, fixCount };
}

// ═══════════════════════════════════════════════════════════════
// ENRICHMENT
// ═══════════════════════════════════════════════════════════════

/**
 * Enrich copy pack with computed metadata.
 */
function enrichCopyPack(pack, adSpec) {
    return {
        ...pack,
        _meta: {
            generatedAt: new Date().toISOString(),
            offer: adSpec.offer,
            audience: adSpec.audience,
            angle: adSpec.angle,
            language: adSpec.constraints?.language || 'de',
            engine: 'gemini-2.5-flash',
            totalVariants:
                (pack.primaryTexts?.length || 0) +
                (pack.headlines?.length || 0) +
                (pack.descriptions?.length || 0) +
                (pack.ctas?.length || 0) +
                (pack.ugcVariants?.length || 0) +
                (pack.drVariants?.length || 0),
            hookCoverage: [...new Set(pack.primaryTexts?.map(pt => pt.hookType) || [])],
            angleCoverage: [...new Set(pack.headlines?.map(h => h.angle) || [])],
        },
    };
}

export default {
    generateCopyPack,
    validateCopyPackStructure,
    autoFixCopyPack,
    HOOK_FRAMEWORKS,
    HEADLINE_ANGLES,
    DESCRIPTION_FOCUSES,
    CTA_TYPES,
};
