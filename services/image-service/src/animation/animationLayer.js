/**
 * ANIMATION & MOTION LAYER
 * 
 * CSS animations and motion effects for web ads:
 * 
 * - Entry animations (fade, slide, scale, bounce)
 * - Hover effects
 * - Looping animations (pulse, float, glow)
 * - Attention grabbers (shake, bounce, flash)
 * - Parallax effects
 * - Particle animations
 * 
 * Outputs: CSS keyframes, inline styles, or animated SVG
 */

// ========================================
// ANIMATION PRESETS
// ========================================

export const ANIMATIONS = {
    // Entry Animations
    fadeIn: {
        name: 'fadeIn',
        keyframes: `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `,
        default: { duration: '0.6s', easing: 'ease-out', delay: '0s' }
    },

    fadeInUp: {
        name: 'fadeInUp',
        keyframes: `
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `,
        default: { duration: '0.6s', easing: 'ease-out', delay: '0s' }
    },

    fadeInDown: {
        name: 'fadeInDown',
        keyframes: `
            @keyframes fadeInDown {
                from { opacity: 0; transform: translateY(-30px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `,
        default: { duration: '0.6s', easing: 'ease-out', delay: '0s' }
    },

    fadeInLeft: {
        name: 'fadeInLeft',
        keyframes: `
            @keyframes fadeInLeft {
                from { opacity: 0; transform: translateX(-30px); }
                to { opacity: 1; transform: translateX(0); }
            }
        `,
        default: { duration: '0.5s', easing: 'ease-out', delay: '0s' }
    },

    fadeInRight: {
        name: 'fadeInRight',
        keyframes: `
            @keyframes fadeInRight {
                from { opacity: 0; transform: translateX(30px); }
                to { opacity: 1; transform: translateX(0); }
            }
        `,
        default: { duration: '0.5s', easing: 'ease-out', delay: '0s' }
    },

    scaleIn: {
        name: 'scaleIn',
        keyframes: `
            @keyframes scaleIn {
                from { opacity: 0; transform: scale(0.8); }
                to { opacity: 1; transform: scale(1); }
            }
        `,
        default: { duration: '0.5s', easing: 'ease-out', delay: '0s' }
    },

    bounceIn: {
        name: 'bounceIn',
        keyframes: `
            @keyframes bounceIn {
                0% { opacity: 0; transform: scale(0.3); }
                50% { opacity: 1; transform: scale(1.05); }
                70% { transform: scale(0.95); }
                100% { transform: scale(1); }
            }
        `,
        default: { duration: '0.7s', easing: 'ease-out', delay: '0s' }
    },

    // Looping Animations
    pulse: {
        name: 'pulse',
        keyframes: `
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
        `,
        default: { duration: '2s', easing: 'ease-in-out', delay: '0s', iterations: 'infinite' }
    },

    float: {
        name: 'float',
        keyframes: `
            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
        `,
        default: { duration: '3s', easing: 'ease-in-out', delay: '0s', iterations: 'infinite' }
    },

    glow: {
        name: 'glow',
        keyframes: `
            @keyframes glow {
                0%, 100% { filter: drop-shadow(0 0 5px var(--glow-color, #3B82F6)); }
                50% { filter: drop-shadow(0 0 20px var(--glow-color, #3B82F6)); }
            }
        `,
        default: { duration: '2s', easing: 'ease-in-out', delay: '0s', iterations: 'infinite' }
    },

    shimmer: {
        name: 'shimmer',
        keyframes: `
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
        `,
        default: { duration: '2.5s', easing: 'linear', delay: '0s', iterations: 'infinite' }
    },

    rotate: {
        name: 'rotate',
        keyframes: `
            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `,
        default: { duration: '10s', easing: 'linear', delay: '0s', iterations: 'infinite' }
    },

    // Attention Grabbers
    shake: {
        name: 'shake',
        keyframes: `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
        `,
        default: { duration: '0.5s', easing: 'ease-in-out', delay: '0s' }
    },

    bounce: {
        name: 'bounce',
        keyframes: `
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-15px); }
            }
        `,
        default: { duration: '0.5s', easing: 'ease-out', delay: '0s', iterations: '3' }
    },

    flash: {
        name: 'flash',
        keyframes: `
            @keyframes flash {
                0%, 50%, 100% { opacity: 1; }
                25%, 75% { opacity: 0.5; }
            }
        `,
        default: { duration: '0.8s', easing: 'ease-in-out', delay: '0s' }
    }
};

// ========================================
// HOVER EFFECTS
// ========================================

export const HOVER_EFFECTS = {
    lift: {
        normal: 'transition: transform 0.3s ease, box-shadow 0.3s ease;',
        hover: 'transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.3);'
    },

    scale: {
        normal: 'transition: transform 0.3s ease;',
        hover: 'transform: scale(1.05);'
    },

    glow: {
        normal: 'transition: box-shadow 0.3s ease;',
        hover: 'box-shadow: 0 0 20px var(--glow-color, #3B82F6);'
    },

    brighten: {
        normal: 'transition: filter 0.3s ease;',
        hover: 'filter: brightness(1.1);'
    },

    rotate: {
        normal: 'transition: transform 0.3s ease;',
        hover: 'transform: rotate(5deg);'
    }
};

// ========================================
// STAGGERED ANIMATION BUILDER
// ========================================

/**
 * Create staggered animation for multiple elements
 */
export function createStaggeredAnimation({
    animation = 'fadeInUp',
    baseDelay = 0,
    staggerDelay = 0.1,
    count = 5
}) {
    const anim = ANIMATIONS[animation];
    if (!anim) return [];

    const styles = [];

    for (let i = 0; i < count; i++) {
        const delay = baseDelay + (i * staggerDelay);
        styles.push({
            index: i,
            animation: `${anim.name} ${anim.default.duration} ${anim.default.easing} ${delay}s forwards`,
            delay: `${delay}s`
        });
    }

    return {
        keyframes: anim.keyframes,
        elements: styles
    };
}

// ========================================
// CSS GENERATOR
// ========================================

/**
 * Generate complete CSS for ad
 */
export function generateAdAnimationCSS({
    productAnimation = 'scaleIn',
    headlineAnimation = 'fadeInDown',
    taglineAnimation = 'fadeInUp',
    ctaAnimation = 'bounceIn',
    featuresAnimation = 'fadeInLeft',
    badgeAnimation = 'fadeIn',
    productDelay = 0.2,
    headlineDelay = 0,
    taglineDelay = 0.15,
    ctaDelay = 0.4,
    featuresDelay = 0.3,
    featureStagger = 0.1,
    featureCount = 4,
    glowColor = '#3B82F6',
    enableHover = true
}) {
    let css = `
/* Ad Animation Styles */
:root {
    --glow-color: ${glowColor};
}

/* Base visibility */
.ad-animated {
    opacity: 0;
}
`;

    // Collect needed keyframes
    const usedAnimations = new Set();
    [productAnimation, headlineAnimation, taglineAnimation, ctaAnimation, featuresAnimation, badgeAnimation]
        .filter(Boolean)
        .forEach(a => usedAnimations.add(a));

    // Add keyframes
    for (const animName of usedAnimations) {
        const anim = ANIMATIONS[animName];
        if (anim) {
            css += anim.keyframes + '\n';
        }
    }

    // Element animations
    if (productAnimation && ANIMATIONS[productAnimation]) {
        const anim = ANIMATIONS[productAnimation];
        css += `
.ad-product {
    animation: ${anim.name} ${anim.default.duration} ${anim.default.easing} ${productDelay}s forwards;
}`;
    }

    if (headlineAnimation && ANIMATIONS[headlineAnimation]) {
        const anim = ANIMATIONS[headlineAnimation];
        css += `
.ad-headline {
    animation: ${anim.name} ${anim.default.duration} ${anim.default.easing} ${headlineDelay}s forwards;
}`;
    }

    if (taglineAnimation && ANIMATIONS[taglineAnimation]) {
        const anim = ANIMATIONS[taglineAnimation];
        css += `
.ad-tagline {
    animation: ${anim.name} ${anim.default.duration} ${anim.default.easing} ${taglineDelay}s forwards;
}`;
    }

    if (ctaAnimation && ANIMATIONS[ctaAnimation]) {
        const anim = ANIMATIONS[ctaAnimation];
        css += `
.ad-cta {
    animation: ${anim.name} ${anim.default.duration} ${anim.default.easing} ${ctaDelay}s forwards;
}`;
    }

    // Staggered features
    if (featuresAnimation && ANIMATIONS[featuresAnimation]) {
        const anim = ANIMATIONS[featuresAnimation];
        for (let i = 0; i < featureCount; i++) {
            const delay = featuresDelay + (i * featureStagger);
            css += `
.ad-feature-${i + 1} {
    animation: ${anim.name} ${anim.default.duration} ${anim.default.easing} ${delay}s forwards;
}`;
        }
    }

    // Badge
    if (badgeAnimation && ANIMATIONS[badgeAnimation]) {
        const anim = ANIMATIONS[badgeAnimation];
        css += `
.ad-badge {
    animation: ${anim.name} ${anim.default.duration} ${anim.default.easing} 0.5s forwards;
}`;
    }

    // CTA hover effects
    if (enableHover) {
        css += `
.ad-cta {
    ${HOVER_EFFECTS.lift.normal}
    ${HOVER_EFFECTS.glow.normal}
}
.ad-cta:hover {
    ${HOVER_EFFECTS.lift.hover}
    ${HOVER_EFFECTS.glow.hover}
}

.ad-product {
    ${HOVER_EFFECTS.scale.normal}
}
.ad-product:hover {
    ${HOVER_EFFECTS.scale.hover}
}`;
    }

    // Looping animations for enhanced engagement
    css += `
/* Looping animations */
${ANIMATIONS.pulse.keyframes}
${ANIMATIONS.float.keyframes}
${ANIMATIONS.glow.keyframes}

.ad-cta-pulse {
    animation: pulse 2s ease-in-out infinite;
}

.ad-product-float {
    animation: float 3s ease-in-out infinite;
}

.ad-badge-glow {
    animation: glow 2s ease-in-out infinite;
}
`;

    return css;
}

// ========================================
// SVG ANIMATION
// ========================================

/**
 * Generate animated SVG for sparkles/particles
 */
export function generateAnimatedSparkleSVG({
    width = 1080,
    height = 1080,
    count = 20,
    color = '#FFFFFF',
    minDuration = 1.5,
    maxDuration = 3
}) {
    let sparkles = '';

    for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 2 + Math.random() * 6;
        const duration = minDuration + Math.random() * (maxDuration - minDuration);
        const delay = Math.random() * 2;

        sparkles += `
            <circle cx="${x}" cy="${y}" r="${size}" fill="${color}">
                <animate attributeName="opacity" values="0;0.8;0" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
                <animate attributeName="r" values="${size};${size * 1.5};${size}" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
            </circle>
        `;
    }

    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${sparkles}</svg>`;
}

/**
 * Generate floating particles SVG animation
 */
export function generateFloatingParticlesSVG({
    width = 1080,
    height = 1080,
    count = 30,
    color = '#FFFFFF',
    direction = 'up' // 'up', 'down', 'left', 'right'
}) {
    let particles = '';

    for (let i = 0; i < count; i++) {
        const size = 1 + Math.random() * 4;
        const opacity = 0.1 + Math.random() * 0.3;
        const duration = 4 + Math.random() * 6;
        const delay = Math.random() * 5;

        let startX, startY, endX, endY;

        switch (direction) {
            case 'up':
                startX = Math.random() * width;
                startY = height + 20;
                endX = startX + (Math.random() - 0.5) * 100;
                endY = -20;
                break;
            case 'down':
                startX = Math.random() * width;
                startY = -20;
                endX = startX + (Math.random() - 0.5) * 100;
                endY = height + 20;
                break;
            default:
                startX = Math.random() * width;
                startY = height + 20;
                endX = startX;
                endY = -20;
        }

        particles += `
            <circle r="${size}" fill="${color}" fill-opacity="${opacity}">
                <animate attributeName="cx" values="${startX};${endX}" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
                <animate attributeName="cy" values="${startY};${endY}" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
            </circle>
        `;
    }

    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${particles}</svg>`;
}

// ========================================
// ANIMATION PRESETS BY AD TYPE
// ========================================

export const AD_ANIMATION_PRESETS = {
    premium: {
        productAnimation: 'scaleIn',
        headlineAnimation: 'fadeInDown',
        taglineAnimation: 'fadeInUp',
        ctaAnimation: 'bounceIn',
        productDelay: 0.3,
        headlineDelay: 0,
        taglineDelay: 0.2,
        ctaDelay: 0.5
    },

    energetic: {
        productAnimation: 'bounceIn',
        headlineAnimation: 'fadeInLeft',
        taglineAnimation: 'fadeInRight',
        ctaAnimation: 'bounceIn',
        productDelay: 0.2,
        headlineDelay: 0,
        taglineDelay: 0.1,
        ctaDelay: 0.4
    },

    minimal: {
        productAnimation: 'fadeIn',
        headlineAnimation: 'fadeIn',
        taglineAnimation: 'fadeIn',
        ctaAnimation: 'fadeIn',
        productDelay: 0.2,
        headlineDelay: 0,
        taglineDelay: 0.1,
        ctaDelay: 0.3
    },

    dynamic: {
        productAnimation: 'fadeInUp',
        headlineAnimation: 'fadeInDown',
        taglineAnimation: 'fadeInUp',
        ctaAnimation: 'scaleIn',
        featuresAnimation: 'fadeInLeft',
        productDelay: 0.1,
        headlineDelay: 0,
        taglineDelay: 0.15,
        ctaDelay: 0.4,
        featuresDelay: 0.25,
        featureStagger: 0.08
    }
};

/**
 * Get animation preset
 */
export function getAnimationPreset(style = 'premium') {
    return AD_ANIMATION_PRESETS[style] || AD_ANIMATION_PRESETS.premium;
}

export default {
    ANIMATIONS,
    HOVER_EFFECTS,
    AD_ANIMATION_PRESETS,
    createStaggeredAnimation,
    generateAdAnimationCSS,
    generateAnimatedSparkleSVG,
    generateFloatingParticlesSVG,
    getAnimationPreset
};
