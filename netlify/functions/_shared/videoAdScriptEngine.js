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

        const prompt = `You are an elite Meta video ad scriptwriter. Create a ${durationSeconds}-second video ad script.

PRODUCT: ${productName}
INDUSTRY: ${industry}
USP: ${usp}
TARGET AUDIENCE: ${targetAudience}
LANGUAGE: ${langLabel}
VIDEO STYLE: ${archetype.name.en} — ${archetype.description.en}
HOOK PATTERN: ${hook.name.en} — "${hook.example[language] || hook.example.de}"
INDUSTRY CONTEXT: Scene: ${industryContext.scene}, Problem: ${industryContext.problem}, Colors: ${industryContext.color}
CTA: ${cta}

Write a script following this 5-Act structure. Total duration MUST equal ${durationSeconds} seconds.

Return ONLY valid JSON with this exact structure:
{
  "scenes": [
    {
      "act": 1,
      "label": "HOOK",
      "durationMs": <milliseconds>,
      "visual": "<detailed scene description for AI video generation>",
      "textOverlay": "<text shown on screen, in ${langLabel}>",
      "textPosition": "center|top|bottom",
      "textStyle": "bold_impact|elegant|minimal|handwritten",
      "audioSfx": "<sound effect description>",
      "camera": "<camera movement description>"
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

RULES:
- Act 1 (HOOK): 0-2s — Scroll stopper, use the hook pattern
- Act 2 (PROBLEM): 2-4s — Show the pain point  
- Act 3 (SOLUTION): 4-6s — Product as hero, demonstrate key benefit
- Act 4 (PROOF): 6-7s — Social proof, numbers, trust
- Act 5 (CTA): 7-${durationSeconds}s — Clear call-to-action, loop-friendly ending
- All text overlays in ${langLabel}
- Visual descriptions should be cinematically detailed for AI video generation
- Audio descriptions should be specific sound effects, not music genres`;

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
// VEO PROMPT BUILDER
// ============================================================

/**
 * Convert a script JSON into a single Veo prompt string.
 * Veo works best with a narrative-style prompt that describes the full video.
 */
export function buildVeoPrompt({ script, archetype, productName, usp, aspectRatio = '9:16', includeAudio = true }) {
    if (!script || !script.scenes) throw new Error('Invalid script: no scenes');

    const archetypeData = typeof archetype === 'string' ? getArchetype(archetype) : archetype;

    // Build scene-by-scene narrative
    const sceneDescriptions = script.scenes.map((scene, i) => {
        let desc = scene.visual;
        if (scene.textOverlay) {
            desc += ` Text overlay reads: "${scene.textOverlay}".`;
        }
        if (scene.camera) {
            desc += ` Camera: ${scene.camera}.`;
        }
        return desc;
    });

    // Combine into narrative prompt
    let prompt = `Professional Meta advertising video, ${aspectRatio} aspect ratio, cinematic quality. `;
    prompt += `Product: ${productName}. `;

    // Add scene narrative
    prompt += sceneDescriptions.join(' Then: ');

    // Add archetype-specific styling
    if (archetypeData) {
        prompt += ` Lighting: ${archetypeData.lightingPreset}.`;
    }

    // Add audio instructions if enabled
    if (includeAudio && archetypeData) {
        prompt += ` Audio: ${archetypeData.audioPreset}.`;
    }

    // Quality directives
    prompt += ' High production value, sharp details, smooth motion, professional color grading.';

    // Ensure prompt isn't too long (Veo has limits)
    if (prompt.length > 2000) {
        prompt = prompt.substring(0, 1997) + '...';
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
        return durationSeconds <= 6 ? 12 : 15;
    }
    return durationSeconds <= 6 ? 8 : 10;
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
