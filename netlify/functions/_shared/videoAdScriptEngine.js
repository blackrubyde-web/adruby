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

        const prompt = `You are an elite commercial director shooting a ${durationSeconds}-second high-end product commercial.
You direct $50,000+ productions. Your work looks like Apple, Nike, or Aesop campaigns — NOT CapCut templates or social media edits.

PRODUCT: ${productName}
INDUSTRY: ${industry}
USP: ${usp}
TARGET AUDIENCE: ${targetAudience}
LANGUAGE: ${langLabel}
VIDEO STYLE: ${archetype.name.en} — ${archetype.description.en}
HOOK PATTERN: ${hook.name.en} — "${hook.example[language] || hook.example.de}"
INDUSTRY CONTEXT:
  - Scene: ${industryContext.scene}
  - Problem: ${industryContext.problem}
  - Color palette: ${industryContext.color}
CTA: ${cta}

Create a ${durationSeconds}-second video ad script with the 5-Act structure below.

Return ONLY valid JSON:
{
  "scenes": [
    {
      "act": 1,
      "label": "HOOK",
      "durationMs": <milliseconds>,
      "visual": "<PRODUCTION-QUALITY visual direction — see rules below>",
      "textOverlay": "<text rendered on screen, in ${langLabel}>",
      "textPosition": "center|top|bottom",
      "textStyle": "bold_impact|elegant|minimal|handwritten",
      "audioSfx": "<SPECIFIC sound design — see rules below>",
      "camera": "<SPECIFIC camera rig + lens + movement — see rules below>"
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
- Act 1 (HOOK): 0s–2s — Scroll stopper. MUST grab in first 0.5s. Visual shock or curiosity.
- Act 2 (PROBLEM): 2s–4s — Show the pain point. The viewer must FEEL it.
- Act 3 (SOLUTION): 4s–6s — Product as hero. THE key benefit demonstrated.
- Act 4 (PROOF): 6s–${Math.max(7, durationSeconds - 1)}s — Trust moment. Social proof, numbers.
- Act 5 (CTA): ${Math.max(7, durationSeconds - 1)}s–${durationSeconds}s — CTA + seamless loop.

═══ WHAT THIS IS — AND IS NOT ═══
THIS IS: A commercial-grade production. Think Aesop fragrance film, Apple product reveal, Nike "Just Do It" campaign.
THIS IS NOT: A CapCut template, Canva animation, TikTok edit, or influencer video. NO bouncy text, NO random filters, NO generic stock footage aesthetic, NO template feel.

═══ VISUAL DESCRIPTION RULES (THIS IS THE MOST IMPORTANT FIELD) ═══
Veo 3.1 generates video DIRECTLY from this text. Every word matters. Each visual MUST specify:
1. ENVIRONMENT + MATERIALS: Exact surfaces and setting (polished obsidian, brushed aluminum, linen, marble, concrete)
2. PRODUCT ACTION: What physically happens (rotates on motorized turntable, emerges from shadow, is placed by a hand)
3. LIGHTING RIG: Three-point direction (key light position + color temp, fill, rim/backlight)
4. MOTION + PHYSICS: Speed, easing, direction (slow dolly-in at constant 2cm/s, particles drift upward lazily)
5. DEPTH + LAYERS: Foreground framing, background treatment (f/1.4 bokeh, volumetric haze, practical foreground element)

✅ EXCELLENT visual:
"The product sits on polished black marble. A single tungsten spotlight from above creates a tight pool of warm light. Volumetric haze drifts through the beam — each particle catches the light like gold dust. The product begins a slow 180° rotation on a motorized turntable, each surface catching specular highlights differently. Background blurs into creamy f/1.4 bokeh circles. A secondary cool-blue fill from camera-left creates dimensional shadows."

❌ TERRIBLE visual (NEVER write this):
"The product is shown in a nice studio with good lighting."
"A cool shot of the product on a table."

═══ CAMERA FIELD RULES ═══
Specify the EXACT cinematic rig, lens, and movement:
✅ GOOD: "Motorized slider dolly-in, 85mm f/1.4, low angle (15° below eye level), constant 3cm/s"
✅ GOOD: "Gimbal float tracking shot, 35mm f/2.0, eye level, gentle breathing motion"
✅ GOOD: "Orbital tracking, counter-rotating to turntable, 50mm f/2.0, 45° elevated angle"
❌ BAD: "nice camera movement" / "cinematic shot" (meaningless)

═══ AUDIO/SOUND DESIGN RULES ═══
Specify individual sound elements, not genres:
✅ GOOD: "30Hz sub-bass rumble building over 2s, single metallic 'ting' hit on reveal, crystalline high-frequency shimmer tail"
✅ GOOD: "Crisp foil unwrapping (close-mic), soft thud of product placement on marble, ambient room reverb"
❌ BAD: "uplifting music" / "dramatic sound" (meaningless)

═══ TEXT OVERLAY RULES ═══
- All text in ${langLabel}
- Typography must be DESIGNED: specify weight (600, 700, 800), tracking (tight or wide), font category (geometric sans-serif)
- Text placement must follow composition rules (golden ratio, rule of thirds, lower third)
${language === 'de' ? `
GERMAN LANGUAGE (MANDATORY):
- All textOverlay values in flawless native German.
- Correct grammar: cases, articles (der/die/das), verb conjugations.
- "du" form (lowercase).
- No anglicisms when German alternatives exist.
- Umlauts (ä,ö,ü) and ß correct.
- Prices in € (Euro), NEVER $ or Dollar.
- Proofread every textOverlay.
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
export function buildVeoPrompt({ script, archetype, productName, usp, aspectRatio = '9:16', includeAudio = true, language = 'de', hasProductImage = false }) {
    if (!script || !script.scenes) throw new Error('Invalid script: no scenes');

    const archetypeData = typeof archetype === 'string' ? getArchetype(archetype) : archetype;
    const totalDuration = script.metadata?.totalDurationMs || 8000;
    const totalSeconds = totalDuration / 1000;
    const isEnglish = language === 'en';

    // ── LANGUAGE BLOCK — matches image generator's languageBlock ──
    const languageBlock = isEnglish ? `
LANGUAGE: ALL text rendered in this video MUST be in English.
` : `
LANGUAGE: ALL text rendered in this video MUST be in German (Deutsch).
- Use € (Euro) for any prices, NEVER $ or Dollar.
- Correct German spelling with umlauts (ä, ö, ü) and ß.
- "du" form (lowercase), not "Sie".
- Avoid anglicisms: "Angebot" not "Deal", "Vorteil" not "Benefit".
- Every word must be correctly spelled in German.
`;

    // ── PRODUCT IMAGE PRESERVATION — matches image generator's 3-layer approach ──
    const productImageBlock = hasProductImage ? `
PRODUCT IMAGE REFERENCE (CRITICAL):
- A reference product image is provided as the starting frame.
- The product in the video MUST look IDENTICAL to the provided reference image.
- DO NOT redesign, reimagine, alter, or modify the product's appearance in ANY way.
- The product's shape, colors, branding, labels, textures, and proportions must be PRESERVED exactly.
- Animate the product (rotation, movement, reveal) but NEVER change what it looks like.
- Think of it as shooting a real product on a turntable — the product is real and sacred.
` : '';

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

    let prompt = `A ${totalSeconds}-second professional advertising video, ${orientation}.\n`;
    prompt += languageBlock;
    prompt += productImageBlock;
    prompt += `\nPRODUCT: "${productName}"${usp ? ` — ${usp}` : ''}${hasProductImage ? ' — use the EXACT product from the provided reference image.' : ''}.\n\n`;

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

    // Professional quality directives — PRODUCTION LEVEL
    prompt += `PRODUCTION QUALITY — THIS IS A COMMERCIAL, NOT A SOCIAL MEDIA EDIT:\n`;
    prompt += `- Shot on cinema camera (RED Komodo 6K / ARRI Alexa Mini), not a phone\n`;
    prompt += `- Professional color grading with cinematic LUT — rich blacks, controlled highlights, intentional color palette\n`;
    prompt += `- Smooth 24fps cinematic motion with controlled speed ramps — no jitter, no jerky movement\n`;
    prompt += `- Sharp selective focus with shallow depth of field (f/1.4 – f/2.8) — product always in focus, backgrounds creamy\n`;
    prompt += `- Three-point professional lighting — no flat overhead, no ring light, no flash\n`;
    prompt += `- Broadcast commercial quality — indistinguishable from a real TV/streaming ad\n`;
    prompt += `- Typography: clean geometric sans-serif (Helvetica Neue / Inter / Futura weight 600-700), sharp rendering\n`;
    prompt += `- Text placement follows golden ratio / rule of thirds — never random or centered without purpose\n`;
    prompt += `- Intentional transitions between beats — cuts motivated by narrative, not random\n`;
    prompt += `- Final frame designed to seamlessly loop back to first frame\n`;
    prompt += `\n`;
    prompt += `THIS IS NOT:\n`;
    prompt += `- A CapCut template, TikTok edit, or Canva animation\n`;
    prompt += `- Bouncy text with random effects, generic stock footage, or phone-quality footage\n`;
    prompt += `- An influencer selfie video, vlog, or screen recording\n`;
    prompt += `- Generic "product on white background" with no cinematic intent\n`;

    // Hard limit for Veo
    if (prompt.length > 3000) {
        prompt = prompt.substring(0, 2997) + '...';
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
