/**
 * EFFECTS MATCHER - Reference-Driven Visual Effects
 * 
 * Analyzes Foreplay reference ads to match effects exactly:
 * - Shadow types and intensity
 * - Glow and lighting effects
 * - Gradient overlays
 * - Noise/grain levels
 * - Background treatments
 */

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Effect intensity levels
const INTENSITY_LEVELS = {
    subtle: 0.3,
    moderate: 0.6,
    bold: 1.0
};

// Shadow presets based on common ad styles
const SHADOW_PRESETS = {
    soft_diffuse: {
        blur: 40,
        spread: 10,
        opacity: 0.25,
        color: '#000000',
        offsetX: 0,
        offsetY: 20
    },
    hard_drop: {
        blur: 15,
        spread: 0,
        opacity: 0.4,
        color: '#000000',
        offsetX: 10,
        offsetY: 15
    },
    colored_ambient: {
        blur: 60,
        spread: 20,
        opacity: 0.3,
        color: 'accent', // Will be replaced with accent color
        offsetX: 0,
        offsetY: 30
    },
    multi_layer: {
        layers: [
            { blur: 20, opacity: 0.15, offsetY: 10 },
            { blur: 40, opacity: 0.1, offsetY: 25 },
            { blur: 80, opacity: 0.05, offsetY: 50 }
        ]
    },
    contact: {
        blur: 30,
        spread: -10,
        opacity: 0.4,
        scaleY: 0.2,
        offsetY: 'bottom'
    },
    none: null
};

// Glow presets
const GLOW_PRESETS = {
    soft_accent: {
        blur: 40,
        opacity: 0.4,
        color: 'accent'
    },
    neon: {
        blur: 20,
        opacity: 0.8,
        color: 'accent',
        spread: 5
    },
    ambient: {
        blur: 80,
        opacity: 0.2,
        color: 'accent'
    },
    screen_glow: {
        blur: 30,
        opacity: 0.5,
        color: '#FFFFFF'
    },
    none: null
};

// Background treatment presets
const BACKGROUND_PRESETS = {
    gradient_dark: {
        type: 'radial',
        colors: ['#1a1a2e', '#0a0a1a'],
        position: 'center'
    },
    gradient_light: {
        type: 'radial',
        colors: ['#ffffff', '#f0f0f0'],
        position: 'center'
    },
    gradient_accent: {
        type: 'linear',
        angle: 135,
        colors: ['accent_dark', 'accent']
    },
    solid_dark: {
        type: 'solid',
        color: '#0a0a1a'
    },
    mesh_gradient: {
        type: 'mesh',
        points: 5,
        colors: ['accent', 'secondary', 'primary']
    },
    image_blur: {
        type: 'image',
        blur: 30,
        overlay: 'rgba(0,0,0,0.6)'
    }
};

/**
 * Analyze effects used in Foreplay reference ads via GPT-4V
 */
export async function analyzeReferenceEffects(referenceAds) {
    console.log(`[EffectsMatcher] 🔍 Analyzing effects in ${referenceAds.length} references...`);

    if (!referenceAds || referenceAds.length === 0) {
        console.warn('[EffectsMatcher] No reference ads, using defaults');
        return getDefaultEffectsAnalysis();
    }

    const referenceImages = referenceAds
        .map(ad => ad.image || ad.thumbnail)
        .filter(Boolean)
        .slice(0, 4);

    if (referenceImages.length === 0) {
        console.warn('[EffectsMatcher] No reference images, using defaults');
        return getDefaultEffectsAnalysis();
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'system',
                content: 'You are an expert visual designer analyzing ad effects and treatments with extreme precision. Always return valid JSON.'
            }, {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Analyze the visual effects in these high-performing ads.

For each ad, identify:

1. SHADOW EFFECTS
   - Shadow type: soft_diffuse, hard_drop, colored_ambient, multi_layer, contact, none
   - Shadow intensity: subtle (0.1-0.3), moderate (0.4-0.6), bold (0.7-1.0)
   - Shadow color: usually black, but could be colored/accent

2. GLOW EFFECTS
   - Glow type: soft_accent, neon, ambient, screen_glow, none
   - Glow intensity: subtle, moderate, bold
   - Glow color: white, accent color, custom

3. BACKGROUND TREATMENT
   - Background type: gradient_dark, gradient_light, gradient_accent, solid_dark, mesh_gradient, image_blur
   - Has noise/grain: true/false (estimate percentage 0-5%)
   - Has vignette: true/false

4. LIGHTING
   - Light direction: top, bottom, left, right, center, none
   - Has lens flare: true/false
   - Has light rays: true/false

5. OVERALL STYLE
   - Effect intensity: minimal, balanced, dramatic
   - Mood: dark, light, vibrant, muted

Return JSON:
{
  "dominantEffects": {
    "shadow": {
      "type": "soft_diffuse|hard_drop|colored_ambient|multi_layer|contact|none",
      "intensity": 0.0-1.0,
      "color": "#hex or 'accent'"
    },
    "glow": {
      "type": "soft_accent|neon|ambient|screen_glow|none",
      "intensity": 0.0-1.0,
      "color": "#hex or 'accent'"
    },
    "background": {
      "type": "gradient_dark|gradient_light|gradient_accent|solid_dark|mesh_gradient|image_blur",
      "noisePercent": 0-5,
      "hasVignette": true/false,
      "vignetteIntensity": 0.0-0.5
    },
    "lighting": {
      "direction": "top|bottom|left|right|center|none",
      "hasLensFlare": true/false,
      "hasLightRays": true/false,
      "intensity": 0.0-1.0
    }
  },
  "overallStyle": "minimal|balanced|dramatic",
  "recommendations": {
    "shadowPreset": "best matching preset name",
    "glowPreset": "best matching preset name",
    "backgroundPreset": "best matching preset name"
  }
}`
                    },
                    ...referenceImages.map(url => ({
                        type: 'image_url',
                        image_url: { url, detail: 'high' }
                    }))
                ]
            }],
            max_tokens: 1000,
            response_format: { type: 'json_object' }
        });

        // Robust JSON parsing
        let result;
        const content = response.choices[0].message.content || '{}';

        try {
            result = JSON.parse(content);
        } catch (parseError) {
            console.warn('[EffectsMatcher] JSON parse failed, attempting repair...');

            // Try to extract JSON from markdown code blocks
            const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) ||
                content.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                try {
                    const cleanJson = (jsonMatch[1] || jsonMatch[0]).trim();
                    result = JSON.parse(cleanJson);
                } catch (e) {
                    console.warn('[EffectsMatcher] JSON repair failed, using defaults');
                    return getDefaultEffectsAnalysis();
                }
            } else {
                console.warn('[EffectsMatcher] No JSON found, using defaults');
                return getDefaultEffectsAnalysis();
            }
        }

        console.log(`[EffectsMatcher]   Style: ${result.overallStyle || 'balanced'}`);
        console.log(`[EffectsMatcher]   Shadow: ${result.dominantEffects?.shadow?.type || 'unknown'}`);
        console.log(`[EffectsMatcher]   Glow: ${result.dominantEffects?.glow?.type || 'unknown'}`);
        console.log(`[EffectsMatcher]   Background: ${result.dominantEffects?.background?.type || 'unknown'}`);

        return result;
    } catch (error) {
        console.error('[EffectsMatcher] Analysis failed:', error.message);
        console.warn('[EffectsMatcher] Returning defaults due to error');
        return getDefaultEffectsAnalysis();
    }
}

/**
 * Get default effects analysis when GPT-4V fails
 */
function getDefaultEffectsAnalysis() {
    return {
        dominantEffects: {
            shadow: {
                type: 'soft_diffuse',
                intensity: 0.5,
                color: '#000000'
            },
            glow: {
                type: 'soft_accent',
                intensity: 0.4,
                color: 'accent'
            },
            background: {
                type: 'gradient_dark',
                noisePercent: 2,
                hasVignette: true,
                vignetteIntensity: 0.15
            },
            lighting: {
                direction: 'center',
                hasLensFlare: false,
                hasLightRays: false,
                intensity: 0.5
            }
        },
        overallStyle: 'balanced',
        recommendations: {
            shadowPreset: 'soft_diffuse',
            glowPreset: 'soft_accent',
            backgroundPreset: 'gradient_dark'
        }
    };
}


/**
 * Build effects configuration from reference analysis
 */
export function buildEffectsConfig(referenceAnalysis, colorPalette) {
    console.log('[EffectsMatcher] 🎨 Building effects configuration...');

    const effects = referenceAnalysis.dominantEffects || {};
    const accentColor = colorPalette?.accent || '#FF4757';
    const dominantColor = colorPalette?.dominant || '#0A0A1A';

    // Resolve 'accent' color references
    const resolveColor = (color) => {
        if (color === 'accent') return accentColor;
        if (color === 'accent_dark') return darkenColor(accentColor, 0.3);
        if (color === 'primary') return dominantColor;
        if (color === 'secondary') return colorPalette?.secondary || '#1A1A3A';
        return color || accentColor;
    };

    // Build shadow config
    const shadowType = effects.shadow?.type || 'soft_diffuse';
    const shadowPreset = SHADOW_PRESETS[shadowType] || SHADOW_PRESETS.soft_diffuse;
    const shadowConfig = shadowPreset ? {
        ...shadowPreset,
        color: resolveColor(effects.shadow?.color || shadowPreset?.color),
        opacity: (shadowPreset?.opacity || 0.25) * (effects.shadow?.intensity || 0.5)
    } : null;

    // Build glow config
    const glowType = effects.glow?.type || 'none';
    const glowPreset = GLOW_PRESETS[glowType];
    const glowConfig = glowPreset ? {
        ...glowPreset,
        color: resolveColor(effects.glow?.color || glowPreset?.color),
        opacity: (glowPreset?.opacity || 0.4) * (effects.glow?.intensity || 0.5)
    } : null;

    // Build background config
    const bgType = effects.background?.type || 'gradient_dark';
    const bgPreset = BACKGROUND_PRESETS[bgType] || BACKGROUND_PRESETS.gradient_dark;
    const backgroundConfig = {
        ...bgPreset,
        colors: (bgPreset?.colors || []).map(resolveColor),
        noisePercent: effects.background?.noisePercent || 1,
        vignetteIntensity: effects.background?.hasVignette
            ? (effects.background?.vignetteIntensity || 0.15)
            : 0
    };

    // Build lighting config
    const lightingConfig = {
        direction: effects.lighting?.direction || 'center',
        intensity: effects.lighting?.intensity || 0.5,
        hasLensFlare: effects.lighting?.hasLensFlare || false,
        hasLightRays: effects.lighting?.hasLightRays || false
    };

    const config = {
        shadow: shadowConfig,
        glow: glowConfig,
        background: backgroundConfig,
        lighting: lightingConfig,
        overallStyle: referenceAnalysis.overallStyle || 'balanced',
        // Colors for reference
        colors: {
            accent: accentColor,
            dominant: dominantColor,
            secondary: colorPalette?.secondary
        }
    };

    console.log('[EffectsMatcher] ✅ Effects configuration built');
    return config;
}

/**
 * Generate SVG for shadow effect
 */
export function generateShadowSVG(shadowConfig, elementWidth, elementHeight) {
    if (!shadowConfig) return '';

    const { blur, opacity, color, offsetX = 0, offsetY = 0 } = shadowConfig;
    const id = `shadow_${Date.now()}`;

    return {
        defs: `
            <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="${offsetX}" dy="${offsetY}" stdDeviation="${blur / 2}" 
                    flood-color="${color}" flood-opacity="${opacity}"/>
            </filter>
        `,
        filter: `url(#${id})`
    };
}

/**
 * Generate SVG for glow effect
 */
export function generateGlowSVG(glowConfig, elementWidth, elementHeight) {
    if (!glowConfig) return '';

    const { blur, opacity, color, spread = 0 } = glowConfig;
    const id = `glow_${Date.now()}`;

    return {
        defs: `
            <filter id="${id}" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="${blur / 2}" result="blur"/>
                <feFlood flood-color="${color}" flood-opacity="${opacity}" result="color"/>
                <feComposite in="color" in2="blur" operator="in" result="glow"/>
                <feMerge>
                    <feMergeNode in="glow"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        `,
        filter: `url(#${id})`
    };
}

/**
 * MASTER: Build complete effects package from reference ads
 */
export async function buildEffectsIntelligence(referenceAds, colorPalette) {
    console.log('[EffectsMatcher] ════════════════════════════════════');
    console.log('[EffectsMatcher] ✨ BUILDING EFFECTS INTELLIGENCE');
    console.log('[EffectsMatcher] ════════════════════════════════════');

    // 1. Analyze reference effects
    const referenceAnalysis = await analyzeReferenceEffects(referenceAds);

    // 2. Build configuration with colors
    const config = buildEffectsConfig(referenceAnalysis, colorPalette);

    console.log('[EffectsMatcher] ════════════════════════════════════');
    console.log(`[EffectsMatcher] ✅ Effects intelligence complete`);
    console.log(`[EffectsMatcher]    Style: ${config.overallStyle}`);
    console.log(`[EffectsMatcher]    Shadow: ${config.shadow ? 'enabled' : 'none'}`);
    console.log(`[EffectsMatcher]    Glow: ${config.glow ? 'enabled' : 'none'}`);
    console.log('[EffectsMatcher] ════════════════════════════════════');

    return config;
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function darkenColor(hex, amount) {
    const rgb = hexToRgb(hex);
    return rgbToHex(
        Math.round(rgb.r * (1 - amount)),
        Math.round(rgb.g * (1 - amount)),
        Math.round(rgb.b * (1 - amount))
    );
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

export default {
    analyzeReferenceEffects,
    buildEffectsConfig,
    buildEffectsIntelligence,
    generateShadowSVG,
    generateGlowSVG,
    SHADOW_PRESETS,
    GLOW_PRESETS,
    BACKGROUND_PRESETS
};
