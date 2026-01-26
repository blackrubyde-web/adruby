/**
 * PREMIUM POST-PROCESSOR
 * 
 * Final polish that makes ads look $50k-agency-quality.
 * Applied as the last step before output.
 * 
 * Features:
 * - Film grain (subtle texture)
 * - Color grading (shadows, midtones, highlights)
 * - Vignette (subtle edge darkening)
 * - Sharpening (crisp details)
 * - Contrast adjustment
 * - Dynamic range optimization
 */

import sharp from 'sharp';

/**
 * Apply premium polish to final ad image
 */
export async function applyPremiumPolish(buffer, options = {}) {
    console.log('[PostProcessor] ✨ Applying premium polish...');

    const {
        grainAmount = 1.0,      // 0-5 (0 = none, 5 = heavy)
        vignetteIntensity = 0.15,  // 0-0.5
        contrastBoost = 1.08,   // 1.0 = none, 1.1 = 10% boost
        saturationBoost = 1.05, // 1.0 = none
        sharpenAmount = 0.3,    // 0-1
        warmth = 0,             // -100 to 100 (negative = cool)
        shadowLift = 0.02,      // 0-0.1 (lifts shadows for "film" look)
        highlightRecovery = 0   // 0-0.1 (prevents blown highlights)
    } = options;

    let processed = sharp(buffer);
    const metadata = await processed.metadata();
    const width = metadata.width || 1080;
    const height = metadata.height || 1080;

    // 1. Color grading (shadows, midtones, highlights)
    if (shadowLift > 0 || warmth !== 0 || saturationBoost !== 1.0) {
        processed = processed.modulate({
            brightness: 1 + shadowLift,
            saturation: saturationBoost,
            hue: warmth
        });
        console.log('[PostProcessor]   Color grading applied');
    }

    // 2. Contrast boost
    if (contrastBoost !== 1.0) {
        // Use linear for contrast adjustment
        processed = processed.linear(contrastBoost, -(128 * (contrastBoost - 1)));
        console.log('[PostProcessor]   Contrast boosted');
    }

    // 3. Sharpening
    if (sharpenAmount > 0) {
        const sigma = 0.5 + (1 - sharpenAmount) * 1.5;
        processed = processed.sharpen(sigma, 1, 2);
        console.log('[PostProcessor]   Sharpening applied');
    }

    // Get intermediate buffer for overlay effects
    let intermediateBuffer = await processed.png().toBuffer();

    // 4. Add vignette (as composite overlay)
    if (vignetteIntensity > 0) {
        const vignetteSvg = createVignetteSvg(width, height, vignetteIntensity);
        const vignetteBuffer = await sharp(Buffer.from(vignetteSvg)).png().toBuffer();

        intermediateBuffer = await sharp(intermediateBuffer)
            .composite([{ input: vignetteBuffer, blend: 'multiply' }])
            .png()
            .toBuffer();
        console.log('[PostProcessor]   Vignette applied');
    }

    // 5. Add film grain
    if (grainAmount > 0) {
        const grainSvg = createGrainSvg(width, height, grainAmount);
        const grainBuffer = await sharp(Buffer.from(grainSvg)).png().toBuffer();

        intermediateBuffer = await sharp(intermediateBuffer)
            .composite([{ input: grainBuffer, blend: 'overlay' }])
            .png()
            .toBuffer();
        console.log('[PostProcessor]   Film grain applied');
    }

    console.log('[PostProcessor] ✅ Premium polish complete');
    return intermediateBuffer;
}

/**
 * Apply style-specific polish presets
 */
export async function applyStylePolish(buffer, style) {
    console.log(`[PostProcessor] 🎨 Applying ${style} style polish...`);

    const STYLE_PRESETS = {
        cinematic: {
            grainAmount: 2.0,
            vignetteIntensity: 0.25,
            contrastBoost: 1.12,
            saturationBoost: 0.95,
            warmth: -10,
            shadowLift: 0.03
        },
        vibrant: {
            grainAmount: 0.5,
            vignetteIntensity: 0.1,
            contrastBoost: 1.1,
            saturationBoost: 1.15,
            warmth: 5,
            shadowLift: 0
        },
        minimal: {
            grainAmount: 0.3,
            vignetteIntensity: 0.05,
            contrastBoost: 1.05,
            saturationBoost: 0.98,
            warmth: 0,
            shadowLift: 0.01
        },
        luxury: {
            grainAmount: 1.5,
            vignetteIntensity: 0.2,
            contrastBoost: 1.08,
            saturationBoost: 0.9,
            warmth: 15,
            shadowLift: 0.02
        },
        tech: {
            grainAmount: 0.8,
            vignetteIntensity: 0.15,
            contrastBoost: 1.1,
            saturationBoost: 1.05,
            warmth: -15,
            shadowLift: 0
        },
        warm: {
            grainAmount: 1.0,
            vignetteIntensity: 0.12,
            contrastBoost: 1.06,
            saturationBoost: 1.08,
            warmth: 20,
            shadowLift: 0.02
        },
        cool: {
            grainAmount: 0.8,
            vignetteIntensity: 0.15,
            contrastBoost: 1.08,
            saturationBoost: 1.0,
            warmth: -20,
            shadowLift: 0.01
        },
        bold: {
            grainAmount: 0.5,
            vignetteIntensity: 0.2,
            contrastBoost: 1.15,
            saturationBoost: 1.1,
            warmth: 0,
            sharpenAmount: 0.5
        }
    };

    const preset = STYLE_PRESETS[style] || STYLE_PRESETS.vibrant;
    return applyPremiumPolish(buffer, preset);
}

/**
 * Auto-detect best polish style based on colors and mood
 */
export async function applyAutoPolish(buffer, colorPalette, mood) {
    console.log('[PostProcessor] 🤖 Auto-detecting polish style...');

    // Map mood to style
    const MOOD_TO_STYLE = {
        warm: 'warm',
        cool: 'cool',
        vibrant: 'vibrant',
        muted: 'minimal',
        professional: 'minimal',
        playful: 'vibrant',
        elegant: 'luxury',
        bold: 'bold'
    };

    const style = MOOD_TO_STYLE[mood] || 'vibrant';
    console.log(`[PostProcessor]   Auto-selected: ${style}`);

    return applyStylePolish(buffer, style);
}

// ═══════════════════════════════════════════════════════════════
// SVG GENERATORS
// ═══════════════════════════════════════════════════════════════

function createVignetteSvg(width, height, intensity) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.max(width, height) * 0.8;

    // Intensity controls how dark the edges get (0-1)
    const opacity = Math.min(0.8, intensity * 2);

    return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
                <stop offset="0%" style="stop-color:white; stop-opacity:1"/>
                <stop offset="60%" style="stop-color:white; stop-opacity:1"/>
                <stop offset="100%" style="stop-color:black; stop-opacity:${opacity}"/>
            </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#vignette)"/>
    </svg>`;
}

function createGrainSvg(width, height, amount) {
    // Create noise pattern
    const grainOpacity = 0.02 + (amount * 0.01);

    // Generate random noise points
    let noisePoints = '';
    const density = Math.min(5000, amount * 1000);

    for (let i = 0; i < density; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const brightness = Math.random() > 0.5 ? 255 : 0;
        const size = 0.5 + Math.random() * 1.5;
        noisePoints += `<circle cx="${x}" cy="${y}" r="${size}" fill="rgb(${brightness},${brightness},${brightness})" opacity="${grainOpacity}"/>`;
    }

    return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="rgb(128,128,128)" opacity="0"/>
        ${noisePoints}
    </svg>`;
}

/**
 * Create color grading LUT-like effect
 */
function createColorGradingSvg(width, height, options) {
    const { shadowTint = '#1a1a2e', highlightTint = '#ffffff', midtoneTint = '#808080' } = options;

    return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="colorGrade" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" style="stop-color:${shadowTint}; stop-opacity:0.1"/>
                <stop offset="50%" style="stop-color:${midtoneTint}; stop-opacity:0"/>
                <stop offset="100%" style="stop-color:${highlightTint}; stop-opacity:0.05"/>
            </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#colorGrade)"/>
    </svg>`;
}

/**
 * Analyze image and recommend polish settings
 */
export async function analyzeAndRecommendPolish(buffer) {
    console.log('[PostProcessor] 🔍 Analyzing image for polish recommendations...');

    try {
        const { data, info } = await sharp(buffer)
            .resize(100, 100, { fit: 'cover' })
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Calculate average brightness and saturation
        let totalBrightness = 0;
        let totalSaturation = 0;
        const pixelCount = data.length / info.channels;

        for (let i = 0; i < data.length; i += info.channels) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            totalBrightness += (r + g + b) / 3;
            totalSaturation += Math.max(r, g, b) - Math.min(r, g, b);
        }

        const avgBrightness = totalBrightness / pixelCount;
        const avgSaturation = totalSaturation / pixelCount;

        // Recommend adjustments based on analysis
        const recommendations = {
            grainAmount: 1.0,
            vignetteIntensity: 0.15,
            contrastBoost: 1.08,
            saturationBoost: 1.0,
            warmth: 0,
            shadowLift: 0
        };

        // If too dark, lift shadows
        if (avgBrightness < 80) {
            recommendations.shadowLift = 0.03;
            recommendations.contrastBoost = 1.05;
        }

        // If too bright, add vignette and contrast
        if (avgBrightness > 180) {
            recommendations.vignetteIntensity = 0.2;
            recommendations.contrastBoost = 1.1;
        }

        // If desaturated, boost saturation
        if (avgSaturation < 50) {
            recommendations.saturationBoost = 1.1;
        }

        // If oversaturated, reduce
        if (avgSaturation > 150) {
            recommendations.saturationBoost = 0.95;
        }

        console.log(`[PostProcessor]   Brightness: ${Math.round(avgBrightness)}/255`);
        console.log(`[PostProcessor]   Saturation: ${Math.round(avgSaturation)}/255`);

        return recommendations;
    } catch (error) {
        console.error('[PostProcessor] Analysis failed:', error.message);
        return {}; // Return defaults
    }
}

/**
 * Apply adaptive polish based on image analysis
 */
export async function applyAdaptivePolish(buffer) {
    const recommendations = await analyzeAndRecommendPolish(buffer);
    return applyPremiumPolish(buffer, recommendations);
}

export default {
    applyPremiumPolish,
    applyStylePolish,
    applyAutoPolish,
    applyAdaptivePolish,
    analyzeAndRecommendPolish
};
