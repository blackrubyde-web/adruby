/**
 * Effects Engine
 * 
 * Post-processing effects for premium ad quality.
 * Applied after base image generation.
 */

import sharp from 'sharp';

/**
 * Apply effects to an image buffer
 */
export async function applyEffects(imageBuffer, effects = [], options = {}) {
    if (!effects || effects.length === 0) {
        return imageBuffer;
    }

    console.log('[Effects] Applying effects:', effects.join(', '));

    let result = imageBuffer;

    for (const effect of effects) {
        try {
            result = await applyEffect(result, effect, options);
        } catch (error) {
            console.warn(`[Effects] Failed to apply ${effect}:`, error.message);
        }
    }

    return result;
}

/**
 * Apply a single effect
 */
async function applyEffect(buffer, effectName, options = {}) {
    switch (effectName) {
        case 'soft_shadow':
            return applySoftShadow(buffer, options);
        case 'neon_glow':
            return applyNeonGlow(buffer, options);
        case 'vignette':
            return applyVignette(buffer, options);
        case 'grain':
            return applyGrain(buffer, options);
        case 'warm_tint':
            return applyWarmTint(buffer);
        case 'cool_tint':
            return applyCoolTint(buffer);
        case 'contrast_boost':
            return applyContrastBoost(buffer);
        case 'soft_glow':
            return applySoftGlow(buffer, options);
        default:
            console.warn(`[Effects] Unknown effect: ${effectName}`);
            return buffer;
    }
}

/**
 * Apply soft shadow/glow around edges
 */
async function applySoftShadow(buffer, options = {}) {
    const { color = '#000000', opacity = 0.2, blur = 40 } = options;

    // Create vignette-style shadow effect using SVG overlay
    const shadowSvg = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="shadow" cx="50%" cy="50%" r="70%">
                <stop offset="0%" style="stop-color:${color};stop-opacity:0"/>
                <stop offset="70%" style="stop-color:${color};stop-opacity:0"/>
                <stop offset="100%" style="stop-color:${color};stop-opacity:${opacity}"/>
            </radialGradient>
        </defs>
        <rect width="1080" height="1080" fill="url(#shadow)"/>
    </svg>`;

    return await sharp(buffer)
        .composite([{
            input: Buffer.from(shadowSvg),
            top: 0,
            left: 0,
            blend: 'over'
        }])
        .png()
        .toBuffer();
}

/**
 * Apply neon glow effect (for tech products)
 */
async function applyNeonGlow(buffer, options = {}) {
    const { color = '#00D4FF', intensity = 0.3 } = options;

    const glowSvg = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="neon" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:${color};stop-opacity:${intensity}"/>
                <stop offset="60%" style="stop-color:${color};stop-opacity:${intensity * 0.3}"/>
                <stop offset="100%" style="stop-color:${color};stop-opacity:0"/>
            </radialGradient>
        </defs>
        <ellipse cx="540" cy="540" rx="400" ry="350" fill="url(#neon)"/>
    </svg>`;

    return await sharp(buffer)
        .composite([{
            input: Buffer.from(glowSvg),
            top: 0,
            left: 0,
            blend: 'screen'
        }])
        .png()
        .toBuffer();
}

/**
 * Apply vignette effect
 */
async function applyVignette(buffer, options = {}) {
    const { strength = 0.4 } = options;

    const vignetteSvg = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
                <stop offset="0%" style="stop-color:black;stop-opacity:0"/>
                <stop offset="70%" style="stop-color:black;stop-opacity:0"/>
                <stop offset="100%" style="stop-color:black;stop-opacity:${strength}"/>
            </radialGradient>
        </defs>
        <rect width="1080" height="1080" fill="url(#vignette)"/>
    </svg>`;

    return await sharp(buffer)
        .composite([{
            input: Buffer.from(vignetteSvg),
            top: 0,
            left: 0,
            blend: 'multiply'
        }])
        .png()
        .toBuffer();
}

/**
 * Apply subtle grain effect (for editorial look)
 */
async function applyGrain(buffer, options = {}) {
    const { amount = 0.08 } = options;

    // Create noise pattern
    const grainSize = 1080;
    const noiseBuffer = await generateNoiseBuffer(grainSize, amount);

    return await sharp(buffer)
        .composite([{
            input: noiseBuffer,
            top: 0,
            left: 0,
            blend: 'overlay'
        }])
        .png()
        .toBuffer();
}

/**
 * Generate noise buffer for grain effect
 */
async function generateNoiseBuffer(size, amount) {
    // Create a simple grain pattern using SVG with random dots
    const dots = [];
    const dotCount = Math.floor(size * size * amount * 0.01);

    for (let i = 0; i < dotCount; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const opacity = Math.random() * 0.3;
        const isLight = Math.random() > 0.5;
        dots.push(`<circle cx="${x}" cy="${y}" r="1" fill="${isLight ? 'white' : 'black'}" opacity="${opacity}"/>`);
    }

    const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        ${dots.join('\n')}
    </svg>`;

    return Buffer.from(svg);
}

/**
 * Apply warm tint (for food, cozy products)
 */
async function applyWarmTint(buffer) {
    return await sharp(buffer)
        .modulate({
            saturation: 1.1,
            brightness: 1.02
        })
        .tint({ r: 255, g: 240, b: 220 })
        .png()
        .toBuffer();
}

/**
 * Apply cool tint (for tech, fresh products)
 */
async function applyCoolTint(buffer) {
    return await sharp(buffer)
        .modulate({
            saturation: 1.05
        })
        .tint({ r: 220, g: 235, b: 255 })
        .png()
        .toBuffer();
}

/**
 * Boost contrast for more punch
 */
async function applyContrastBoost(buffer) {
    return await sharp(buffer)
        .modulate({
            brightness: 1.02
        })
        .linear(1.1, -10) // Slight contrast increase
        .png()
        .toBuffer();
}

/**
 * Apply soft glow effect
 */
async function applySoftGlow(buffer, options = {}) {
    const { color = '#FFFFFF', intensity = 0.15 } = options;

    const glowSvg = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="softglow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:${color};stop-opacity:${intensity}"/>
                <stop offset="100%" style="stop-color:${color};stop-opacity:0"/>
            </radialGradient>
        </defs>
        <ellipse cx="540" cy="500" rx="350" ry="300" fill="url(#softglow)"/>
    </svg>`;

    return await sharp(buffer)
        .composite([{
            input: Buffer.from(glowSvg),
            top: 0,
            left: 0,
            blend: 'soft-light'
        }])
        .png()
        .toBuffer();
}

/**
 * Quick presets for common effect combinations
 */
export const EFFECT_PRESETS = {
    premium_dark: ['neon_glow', 'vignette', 'contrast_boost'],
    premium_light: ['soft_glow', 'contrast_boost'],
    editorial: ['grain', 'vignette', 'contrast_boost'],
    warm_cozy: ['warm_tint', 'soft_glow', 'vignette'],
    tech_modern: ['neon_glow', 'cool_tint'],
    natural: ['soft_shadow', 'warm_tint']
};

export default {
    applyEffects,
    EFFECT_PRESETS
};
