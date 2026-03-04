/**
 * VIDEO AD SCRIPT ENGINE
 * 
 * Generates video ad scripts using Gemini 2.5 Flash, then converts
 * them into optimized Veo 3.1 prompts.
 * 
 * Pipeline:
 *   1. selectBestHook()    — AI picks the best hook for the context
 *   2. generateVideoScript() — 5-act script with scene descriptions
 *   3. buildVeoPrompt()    — Converts script → single Veo prompt string
 * 
 * Uses @google/genai (same client as ai-ad-generate-background.js)
 */

import { GoogleGenAI } from '@google/genai';
import {
    getArchetype,
    getDefaultHook,
    getCompatibleHooks,
    getRandomCta,
    buildNegativePrompt,
    getIndustryContext,
    HOOK_LIBRARY,
} from './videoAdArchetypes.js';

// ============================================================
// GEMINI CLIENT
// ============================================================

let cachedGenAI = null;

function getGenAI() {
    if (!cachedGenAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY not configured');
        cachedGenAI = new GoogleGenAI({ apiKey });
    }
    return cachedGenAI;
}

// ============================================================
// HOOK SELECTION (AI-assisted)
// ============================================================

/**
 * Select the best hook for the given context using Gemini.
 * Falls back to archetype default hook if AI fails.
 */
export async function selectBestHook({ archetypeId, productName, industry, targetAudience, usp, language = 'de' }) {
    const archetype = getArchetype(archetypeId);
    if (!archetype) return getDefaultHook(archetypeId);

    const compatibleHooks = getCompatibleHooks(archetypeId);
    if (compatibleHooks.length <= 1) return compatibleHooks[0] || getDefaultHook(archetypeId);

    try {
        const ai = getGenAI();
        const hookOptions = compatibleHooks.map(h => ({
            id: h.id,
            name: h.name[language] || h.name.de,
            example: h.example[language] || h.example.de,
        }));

        const prompt = `You are a Meta video ad expert. Pick the single best scroll-stopping hook for this ad.

Product: ${productName}
Industry: ${industry}
Target Audience: ${targetAudience}
USP: ${usp}
Video Style: ${archetype.name[language] || archetype.name.de}

Available hooks:
${hookOptions.map(h => `- ${h.id}: "${h.name}" (example: "${h.example}")`).join('\n')}

Return ONLY a JSON object: { "hookId": "chosen_hook_id", "reason": "one line why" }`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', temperature: 0.4 },
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        const result = JSON.parse(text);
        const selectedHook = HOOK_LIBRARY[result.hookId];
        if (selectedHook) {
            console.log(`[ScriptEngine] AI selected hook: ${result.hookId} — ${result.reason}`);
            return selectedHook;
        }
    } catch (err) {
        console.warn(`[ScriptEngine] Hook selection failed, using default: ${err.message}`);
    }

    return getDefaultHook(archetypeId);
}

// ============================================================
// SCRIPT GENERATION (5-Act Structure)
// ============================================================

/**
 * Generate a complete video ad script using Gemini 2.5 Flash.
 * Returns a JSON script with scenes, text overlays, audio cues, and timing.
 */
export async function generateVideoScript({
    archetypeId,
    productName,
    industry,
    targetAudience,
    usp,
    language = 'de',
    durationSeconds = 8,
    hookOverride = null,
}) {
    const archetype = getArchetype(archetypeId);
    if (!archetype) throw new Error(`Unknown archetype: ${archetypeId}`);

    // Get hook
    const hook = hookOverride ||
        await selectBestHook({ archetypeId, productName, industry, targetAudience, usp, language });

    const industryContext = getIndustryContext(industry);
    const cta = getRandomCta(language);

    try {
        const ai = getGenAI();
        const langLabel = language === 'de' ? 'German' : 'English';

        const prompt = `You are an elite video ad director creating a ${durationSeconds}-second commercial for Meta (Instagram Reels / Facebook).

PRODUCT: ${productName}
INDUSTRY: ${industry}
USP: ${usp}
TARGET AUDIENCE: ${targetAudience}
LANGUAGE: ${langLabel}
VIDEO STYLE: ${archetype.name.en} — ${archetype.description.en}
HOOK PATTERN: ${hook.name.en} — "${hook.example[language] || hook.example.de}"
INDUSTRY CONTEXT: Scene: ${industryContext.scene}, Problem: ${industryContext.problem}, Colors: ${industryContext.color}
CTA: ${cta}

Write a ${durationSeconds}-second video ad script following the 5-Act structure below. Total duration MUST equal ${durationSeconds} seconds.

Return ONLY valid JSON with this exact structure:
{
  "scenes": [
    {
      "act": 1,
      "label": "HOOK",
      "durationMs": <milliseconds>,
      "visual": "<HYPER-DETAILED visual description — see rules below>",
      "textOverlay": "<text shown on screen, in ${langLabel}>",
      "textPosition": "center|top|bottom",
      "textStyle": "bold_impact|elegant|minimal|handwritten",
      "audioSfx": "<SPECIFIC sound effect — see rules below>",
      "camera": "<SPECIFIC camera movement — see rules below>"
    }
  ],
  "metadata": {
    "archetype": "${archetypeId}",
    "hook": "${hook.id}",
    "totalDurationMs": ${durationSeconds * 1000},
    "loopable": true,
    "estimatedEngagement": "high|medium|low"
  }
}

═══ 5-ACT TIMING ═══
- Act 1 (HOOK): 0s–2s — Scroll stopper. MUST grab attention in first 0.5s.
- Act 2 (PROBLEM): 2s–4s — Show the pain point the audience relates to.
- Act 3 (SOLUTION): 4s–6s — Product as hero. Demonstrate THE key benefit.
- Act 4 (PROOF): 6s–${Math.max(7, durationSeconds - 1)}s — Social proof, numbers, trust.
- Act 5 (CTA): ${Math.max(7, durationSeconds - 1)}s–${durationSeconds}s — Clear CTA, loop-friendly ending.

═══ VISUAL DESCRIPTION RULES (CRITICAL FOR QUALITY) ═══
The "visual" field is the MOST IMPORTANT field. Veo 3.1 generates video directly from this text.
Each visual description MUST contain ALL of these elements:
1. ENVIRONMENT: Where are we? (studio, kitchen, marble table, dark void, etc.)
2. PRODUCT ACTION: What is happening to the product? (rotating, being placed, emerging, etc.)
3. LIGHTING DIRECTION: Light source and mood (golden rim light from right, cool blue fill, spotlight from above)
4. MOTION: What is moving and how? (slow-motion pour, particles floating, smoke dissolving)
5. DEPTH: Foreground/background elements (blurred bokeh, depth layers)

EXAMPLE of a GREAT visual description:
"Extreme close-up: the product sits on polished black marble. A single warm spotlight from above creates a circular pool of light. Golden particles drift through the beam. The product slowly rotates, catching light on each surface. Shallow depth of field blurs the dark background into smooth bokeh circles."

EXAMPLE of a BAD visual description (DO NOT write like this):
"The product is shown in a nice setting with good lighting."

═══ CAMERA FIELD RULES ═══
Camera descriptions must be SPECIFIC cinematic movements:
- GOOD: "Slow dolly-in from 3m to 30cm, 85mm lens, f/2.8, low angle"
- GOOD: "Orbital tracking shot 90° around product, steady speed, eye level"
- BAD: "nice camera movement" (too vague)

═══ AUDIO FIELD RULES ═══
Sound effects must be SPECIFIC and timed:
- GOOD: "Deep bass drop on beat, followed by shimmering high-frequency sweep"
- GOOD: "Crisp unwrapping foil sound, satisfying click, ambient reverb tail"
- BAD: "uplifting music" (too vague)

═══ TEXT OVERLAY RULES ═══
- All text overlays in ${langLabel}
${language === 'de' ? `
GERMAN LANGUAGE (MANDATORY):
- All textOverlay values MUST be in flawless, native-level German. No spelling errors, no grammar mistakes.
- Use correct German grammar: proper cases, articles (der/die/das), verb conjugations.
- Use informal du-form (lowercase) for audience.
- No anglicisms when a German word exists.
- Umlauts (ä,ö,ü) and ß must be used correctly.
- Use € (Euro) for any prices, NEVER $ or Dollar.
- Proofread every textOverlay for Rechtschreibung and Grammatik.
` : ''}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', temperature: 0.7 },
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        const script = JSON.parse(text);

        // Validate and enrich
        if (!script.scenes || !Array.isArray(script.scenes)) {
            throw new Error('Invalid script: missing scenes array');
        }

        // Ensure metadata
        script.metadata = {
            ...script.metadata,
            archetype: archetypeId,
            hook: hook.id,
            totalDurationMs: durationSeconds * 1000,
            industry,
            language,
            generatedAt: new Date().toISOString(),
        };

        console.log(`[ScriptEngine] Generated ${script.scenes.length}-act script for "${productName}" (${durationSeconds}s, ${archetypeId})`);
        return { script, hook, archetype, cta };

    } catch (err) {
        console.warn(`[ScriptEngine] AI script generation failed: ${err.message}`);
        // Fallback: build script from archetype templates
        return buildFallbackScript({ archetype, hook, productName, usp, industry, cta, durationSeconds, language });
    }
}

// ============================================================
// FALLBACK SCRIPT (Template-based, no AI needed)
// ============================================================

function buildFallbackScript({ archetype, hook, productName, usp, industry, cta, durationSeconds, language }) {
    const industryCtx = getIndustryContext(industry);
    const hookPrompt = hook.promptPrefix;
    const proof = language === 'de' ? '10.000+ zufriedene Kunden' : '10,000+ happy customers';

    const scenes = [
        {
            act: 1, label: 'HOOK', durationMs: 2000,
            visual: archetype.promptTemplate.act1_hook(productName, hookPrompt),
            textOverlay: hook.example[language] || hook.example.de,
            textPosition: 'center', textStyle: 'bold_impact',
            audioSfx: archetype.audioPreset.split(',')[0],
            camera: archetype.cameraPreset.split(',')[0],
        },
        {
            act: 2, label: 'PROBLEM', durationMs: 2000,
            visual: archetype.promptTemplate.act2_problem(productName, industryCtx.problem),
            textOverlay: '', textPosition: 'bottom', textStyle: 'minimal',
            audioSfx: 'tension building sound',
            camera: 'slow tracking shot',
        },
        {
            act: 3, label: 'SOLUTION', durationMs: 2000,
            visual: archetype.promptTemplate.act3_solution(productName, usp),
            textOverlay: productName,
            textPosition: 'center', textStyle: 'elegant',
            audioSfx: archetype.audioPreset.split(',')[1] || 'reveal sound effect',
            camera: archetype.cameraPreset,
        },
        {
            act: 4, label: 'PROOF', durationMs: 1000,
            visual: archetype.promptTemplate.act4_proof(proof),
            textOverlay: proof,
            textPosition: 'center', textStyle: 'bold_impact',
            audioSfx: 'satisfying ding sound',
            camera: 'steady center frame',
        },
        {
            act: 5, label: 'CTA', durationMs: (durationSeconds * 1000) - 7000,
            visual: archetype.promptTemplate.act5_cta(cta),
            textOverlay: cta,
            textPosition: 'bottom', textStyle: 'bold_impact',
            audioSfx: 'uplifting music swell',
            camera: 'pull back to wide shot',
        },
    ];

    return {
        script: {
            scenes,
            metadata: {
                archetype: archetype.id,
                hook: hook.id,
                totalDurationMs: durationSeconds * 1000,
                loopable: true,
                estimatedEngagement: 'high',
                fallback: true,
                generatedAt: new Date().toISOString(),
            },
        },
        hook,
        archetype,
        cta,
    };
}

// ============================================================
// VEO PROMPT BUILDER — Second-by-Second Cinematic Direction
// ============================================================

/**
 * Convert a script JSON into a professional Veo 3.1 prompt with second-by-second timing.
 * 
 * Veo works best with detailed, structured prompts that describe:
 * - Exact timing per beat (0:00-0:02, etc.)
 * - Camera movements per shot (dolly, pan, zoom, orbit)
 * - Lighting and color transitions
 * - Sound design cues
 * - Emotional arc
 * 
 * This is NOT a paragraph — it's a cinematic shot list compressed into a prompt.
 */
export function buildVeoPrompt({ script, archetype, productName, usp, aspectRatio = '9:16', includeAudio = true }) {
    if (!script || !script.scenes) throw new Error('Invalid script: no scenes');

    const archetypeData = typeof archetype === 'string' ? getArchetype(archetype) : archetype;
    const totalDuration = script.metadata?.totalDurationMs || 8000;
    const totalSeconds = totalDuration / 1000;

    // ── Calculate exact timing per scene ──
    let runningTimeMs = 0;
    const timedScenes = script.scenes.map((scene) => {
        const startMs = runningTimeMs;
        const durationMs = scene.durationMs || Math.round(totalDuration / script.scenes.length);
        runningTimeMs += durationMs;
        return {
            ...scene,
            startSec: (startMs / 1000).toFixed(1),
            endSec: (Math.min(runningTimeMs, totalDuration) / 1000).toFixed(1),
            durationSec: (durationMs / 1000).toFixed(1),
        };
    });

    // ── Build second-by-second shot direction ──
    const shotList = timedScenes.map((scene, i) => {
        const timing = `[${scene.startSec}s–${scene.endSec}s]`;
        const label = scene.label || `ACT ${scene.act || i + 1}`;

        let shot = `${timing} ${label}:`;

        // Visual direction
        shot += ` ${scene.visual}`;

        // Camera movement — specific, not generic
        if (scene.camera) {
            shot += ` CAMERA: ${scene.camera}.`;
        }

        // Text overlay — with exact rendering instructions
        if (scene.textOverlay) {
            const style = scene.textStyle || 'bold_impact';
            const position = scene.textPosition || 'center';
            shot += ` TEXT ON SCREEN "${scene.textOverlay}" — ${style} typography, ${position} positioned, sharp and readable.`;
        }

        // Sound design — specific effects, not genres
        if (includeAudio && scene.audioSfx) {
            shot += ` AUDIO: ${scene.audioSfx}.`;
        }

        return shot;
    });

    // ── Assemble the complete Veo prompt ──
    const orientation = aspectRatio === '9:16' ? 'vertical (portrait, 9:16 for Instagram Reels/Stories)'
        : aspectRatio === '16:9' ? 'horizontal (landscape, 16:9 for YouTube/Feed)'
            : `${aspectRatio}`;

    let prompt = `A ${totalSeconds}-second professional advertising video, ${orientation}.\n\n`;
    prompt += `PRODUCT: "${productName}"${usp ? ` — ${usp}` : ''}.\n\n`;

    // Shot-by-shot direction
    prompt += `SHOT-BY-SHOT DIRECTION:\n`;
    prompt += shotList.join('\n');
    prompt += '\n\n';

    // Archetype-specific cinematic style
    if (archetypeData) {
        prompt += `CINEMATIC STYLE:\n`;
        prompt += `- Camera work: ${archetypeData.cameraPreset}\n`;
        prompt += `- Lighting: ${archetypeData.lightingPreset}\n`;
        if (includeAudio) {
            prompt += `- Sound design: ${archetypeData.audioPreset}\n`;
        }
        prompt += '\n';
    }

    // Professional quality directives
    prompt += `PRODUCTION QUALITY:\n`;
    prompt += `- Shot on RED Komodo 6K or equivalent cinema camera\n`;
    prompt += `- Professional color grading, cinematic LUT applied\n`;
    prompt += `- Smooth 24fps motion, no jitter or jerky movements\n`;
    prompt += `- Sharp focus on product at all times, shallow depth of field\n`;
    prompt += `- Professional lighting — no flat or amateur lighting\n`;
    prompt += `- Commercial broadcast quality — indistinguishable from a real TV ad\n`;
    prompt += `- Text overlays must be SHARP, perfectly rendered, and readable at mobile phone size\n`;
    prompt += `- Seamless transitions between shots — no abrupt cuts unless intentional\n`;
    prompt += `- The last frame should loop back cleanly to the first frame\n`;

    // Hard limit for Veo
    if (prompt.length > 2500) {
        prompt = prompt.substring(0, 2497) + '...';
    }

    return prompt;
}

/**
 * Build a complete negative prompt for Veo
 */
export function buildVeoNegativePrompt(archetypeId) {
    return buildNegativePrompt(archetypeId);
}

// ============================================================
// CREDIT CALCULATION
// ============================================================

/**
 * Calculate credit cost based on quality and duration
 */
export function calculateCreditCost(quality = 'fast', durationSeconds = 6) {
    if (quality === 'premium') {
        return durationSeconds <= 6 ? 25 : 30;
    }
    return durationSeconds <= 6 ? 15 : 20;
}

/**
 * Get the credit action key for the given settings
 */
export function getCreditAction(quality = 'fast', durationSeconds = 6) {
    if (quality === 'premium') {
        return durationSeconds <= 6 ? 'video_ad_premium_short' : 'video_ad_premium_long';
    }
    return durationSeconds <= 6 ? 'video_ad_fast_short' : 'video_ad_fast_long';
}

export default {
    selectBestHook,
    generateVideoScript,
    buildVeoPrompt,
    buildVeoNegativePrompt,
    calculateCreditCost,
    getCreditAction,
};
