/**
 * MOTION ENGINE
 * 
 * Adds motion effects to static ad images for engaging video ads.
 * Supports Ken Burns, Zoom, Pan, Fade, Parallax effects.
 * 
 * Meta 2026 Level: Ads that MOVE and engage.
 */

// ============================================================
// MOTION PRESETS - Industry-Optimized
// ============================================================

export const MOTION_PRESETS = {
    // Premium slow zoom - luxury feel
    premium_reveal: {
        name: 'Premium Reveal',
        description: 'Slow zoom in with subtle fade',
        effects: [
            { type: 'zoom', from: 1.0, to: 1.08, duration: 4000, easing: 'easeOut' },
            { type: 'fade_in', duration: 500 }
        ],
        industries: ['fashion', 'beauty', 'home'],
        outputDuration: 4000
    },

    // Ken Burns - cinematic
    ken_burns: {
        name: 'Ken Burns',
        description: 'Classic documentary zoom & pan',
        effects: [
            { type: 'zoom', from: 1.0, to: 1.15, duration: 5000, easing: 'linear' },
            { type: 'pan', fromX: 0, fromY: 0, toX: -30, toY: -20, duration: 5000 }
        ],
        industries: ['ecommerce', 'food', 'default'],
        outputDuration: 5000
    },

    // Energetic pulse - attention grabbing
    energetic_pulse: {
        name: 'Energetic Pulse',
        description: 'Subtle pulsing zoom for energy',
        effects: [
            { type: 'pulse_zoom', min: 1.0, max: 1.03, cycles: 3, duration: 3000 }
        ],
        industries: ['fitness', 'gaming', 'kids'],
        outputDuration: 3000
    },

    // Product focus - zoom to center
    product_focus: {
        name: 'Product Focus',
        description: 'Zoom into product area',
        effects: [
            { type: 'zoom_to_point', from: 1.0, to: 1.2, x: 0.5, y: 0.4, duration: 3000, easing: 'easeInOut' }
        ],
        industries: ['ecommerce', 'beauty', 'food'],
        outputDuration: 3000
    },

    // Story/Reel optimized - vertical motion
    story_reveal: {
        name: 'Story Reveal',
        description: 'Vertical pan for Stories/Reels',
        effects: [
            { type: 'pan', fromX: 0, fromY: 50, toX: 0, toY: -50, duration: 4000, easing: 'easeInOut' },
            { type: 'zoom', from: 1.05, to: 1.0, duration: 4000 }
        ],
        industries: ['fashion', 'fitness', 'beauty'],
        outputDuration: 4000
    },

    // Text reveal - for headline focus
    text_reveal: {
        name: 'Text Reveal',
        description: 'Hold then subtle zoom for text focus',
        effects: [
            { type: 'hold', duration: 1000 },
            { type: 'zoom', from: 1.0, to: 1.05, duration: 2000, easing: 'easeOut' }
        ],
        industries: ['saas', 'default'],
        outputDuration: 3000
    },

    // Christmas/Holiday special
    festive_snow: {
        name: 'Festive Snow',
        description: 'Gentle sway with snow particle overlay',
        effects: [
            { type: 'sway', amplitude: 5, frequency: 0.5, duration: 4000 },
            { type: 'overlay_particles', particleType: 'snow', density: 50, duration: 4000 }
        ],
        industries: ['christmas'],
        outputDuration: 4000
    }
};

// ============================================================
// EASING FUNCTIONS
// ============================================================

const EASING = {
    linear: t => t,
    easeIn: t => t * t,
    easeOut: t => t * (2 - t),
    easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOutBack: t => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
};

// ============================================================
// MOTION FRAME GENERATOR
// ============================================================

/**
 * Generate motion keyframes for FFmpeg
 */
export function generateMotionKeyframes(config) {
    const {
        preset = 'ken_burns',
        width = 1080,
        height = 1080,
        fps = 30,
        customEffects = null
    } = config;

    const presetConfig = MOTION_PRESETS[preset] || MOTION_PRESETS.ken_burns;
    const effects = customEffects || presetConfig.effects;
    const duration = presetConfig.outputDuration;
    const totalFrames = Math.ceil((duration / 1000) * fps);

    const keyframes = [];

    for (let frame = 0; frame < totalFrames; frame++) {
        const progress = frame / totalFrames;

        let transform = {
            scale: 1.0,
            translateX: 0,
            translateY: 0,
            opacity: 1.0,
            rotation: 0
        };

        // Apply each effect
        for (const effect of effects) {
            const effectProgress = getEffectProgress(effect, progress, duration);
            const easedProgress = (EASING[effect.easing] || EASING.linear)(effectProgress);

            switch (effect.type) {
                case 'zoom':
                    transform.scale = lerp(effect.from, effect.to, easedProgress);
                    break;

                case 'pan':
                    transform.translateX = lerp(effect.fromX || 0, effect.toX || 0, easedProgress);
                    transform.translateY = lerp(effect.fromY || 0, effect.toY || 0, easedProgress);
                    break;

                case 'zoom_to_point':
                    transform.scale = lerp(effect.from, effect.to, easedProgress);
                    // Offset to zoom toward point
                    const zoomOffset = (transform.scale - 1) * 0.5;
                    transform.translateX = -(effect.x - 0.5) * width * zoomOffset;
                    transform.translateY = -(effect.y - 0.5) * height * zoomOffset;
                    break;

                case 'fade_in':
                    const fadeProgress = Math.min(progress * (duration / effect.duration), 1);
                    transform.opacity = fadeProgress;
                    break;

                case 'fade_out':
                    const fadeOutStart = 1 - (effect.duration / duration);
                    if (progress > fadeOutStart) {
                        transform.opacity = 1 - ((progress - fadeOutStart) / (1 - fadeOutStart));
                    }
                    break;

                case 'pulse_zoom':
                    const cycleProgress = (progress * effect.cycles) % 1;
                    const pulseValue = Math.sin(cycleProgress * Math.PI * 2) * 0.5 + 0.5;
                    transform.scale = lerp(effect.min, effect.max, pulseValue);
                    break;

                case 'sway':
                    const swayValue = Math.sin(progress * effect.frequency * Math.PI * 2);
                    transform.translateX = swayValue * effect.amplitude;
                    break;

                case 'hold':
                    // No transform, just wait
                    break;
            }
        }

        keyframes.push({
            frame,
            time: (frame / fps) * 1000,
            ...transform
        });
    }

    return {
        keyframes,
        totalFrames,
        fps,
        duration,
        preset: presetConfig.name
    };
}

/**
 * Get effect progress (handles delayed starts)
 */
function getEffectProgress(effect, overallProgress, totalDuration) {
    const effectStart = (effect.startAt || 0) / totalDuration;
    const effectDuration = effect.duration / totalDuration;

    if (overallProgress < effectStart) return 0;
    if (overallProgress > effectStart + effectDuration) return 1;

    return (overallProgress - effectStart) / effectDuration;
}

/**
 * Linear interpolation
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

// ============================================================
// FFMPEG FILTER GENERATOR
// ============================================================

/**
 * Generate FFmpeg filter complex for motion
 */
export function generateFFmpegFilter(keyframes, config = {}) {
    const { width = 1080, height = 1080 } = config;

    // Build zoompan filter
    const firstFrame = keyframes.keyframes[0];
    const lastFrame = keyframes.keyframes[keyframes.keyframes.length - 1];

    // Calculate zoom and pan values for FFmpeg zoompan filter
    const startZoom = firstFrame.scale;
    const endZoom = lastFrame.scale;
    const startX = firstFrame.translateX;
    const endX = lastFrame.translateX;
    const startY = firstFrame.translateY;
    const endY = lastFrame.translateY;

    // FFmpeg zoompan filter expression
    const zoomExpr = startZoom === endZoom
        ? `${startZoom}`
        : `${startZoom}+(${endZoom}-${startZoom})*on/${keyframes.totalFrames}`;

    const xExpr = `iw/2-(iw/zoom/2)+${startX}+(${endX}-${startX})*on/${keyframes.totalFrames}`;
    const yExpr = `ih/2-(ih/zoom/2)+${startY}+(${endY}-${startY})*on/${keyframes.totalFrames}`;

    return `zoompan=z='${zoomExpr}':x='${xExpr}':y='${yExpr}':d=${keyframes.totalFrames}:s=${width}x${height}:fps=${keyframes.fps}`;
}

// ============================================================
// MOTION PRESET SELECTOR
// ============================================================

/**
 * Select best motion preset for industry/context
 */
export function selectMotionPreset(context = {}) {
    const { industry = 'default', format = 'square', goal = 'engagement' } = context;

    // Find presets matching industry
    const matchingPresets = Object.entries(MOTION_PRESETS)
        .filter(([key, preset]) => preset.industries.includes(industry) || preset.industries.includes('default'))
        .map(([key, preset]) => ({ key, ...preset }));

    if (matchingPresets.length === 0) {
        return 'ken_burns'; // Ultimate fallback
    }

    // For stories/reels, prefer vertical motion
    if (format === 'story' || format === 'reel') {
        const storyPreset = matchingPresets.find(p => p.key === 'story_reveal');
        if (storyPreset) return storyPreset.key;
    }

    // Return first matching preset
    return matchingPresets[0].key;
}

/**
 * Get all available presets
 */
export function getAvailablePresets() {
    return Object.entries(MOTION_PRESETS).map(([key, preset]) => ({
        key,
        name: preset.name,
        description: preset.description,
        duration: preset.outputDuration,
        industries: preset.industries
    }));
}

// ============================================================
// CSS ANIMATION GENERATOR (for web preview)
// ============================================================

/**
 * Generate CSS animation for web preview
 */
export function generateCSSAnimation(preset = 'ken_burns') {
    const presetConfig = MOTION_PRESETS[preset] || MOTION_PRESETS.ken_burns;
    const duration = presetConfig.outputDuration / 1000;

    let cssKeyframes = '@keyframes adMotion {\n';
    let cssTransforms = [];

    for (const effect of presetConfig.effects) {
        switch (effect.type) {
            case 'zoom':
                cssKeyframes += `  0% { transform: scale(${effect.from}); }\n`;
                cssKeyframes += `  100% { transform: scale(${effect.to}); }\n`;
                break;

            case 'pan':
                cssKeyframes += `  0% { transform: translate(${effect.fromX}px, ${effect.fromY}px); }\n`;
                cssKeyframes += `  100% { transform: translate(${effect.toX}px, ${effect.toY}px); }\n`;
                break;

            case 'fade_in':
                cssKeyframes += `  0% { opacity: 0; }\n`;
                cssKeyframes += `  ${Math.round((effect.duration / presetConfig.outputDuration) * 100)}% { opacity: 1; }\n`;
                break;

            case 'pulse_zoom':
                cssKeyframes += `  0%, 100% { transform: scale(${effect.min}); }\n`;
                cssKeyframes += `  50% { transform: scale(${effect.max}); }\n`;
                break;
        }
    }

    cssKeyframes += '}\n\n';
    cssKeyframes += `.ad-motion {\n`;
    cssKeyframes += `  animation: adMotion ${duration}s ease-in-out infinite;\n`;
    cssKeyframes += `}\n`;

    return cssKeyframes;
}

export default {
    MOTION_PRESETS,
    generateMotionKeyframes,
    generateFFmpegFilter,
    selectMotionPreset,
    getAvailablePresets,
    generateCSSAnimation,
    EASING
};
