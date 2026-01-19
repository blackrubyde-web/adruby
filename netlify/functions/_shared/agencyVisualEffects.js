/**
 * AGENCY-LEVEL VISUAL EFFECTS SYSTEM
 * 
 * Techniques used by $50,000/month Meta agencies:
 * - Lens flares and light leaks
 * - Product glow/aura effects
 * - Cinematic color grading
 * - Bokeh and depth simulation
 * - Film grain textures
 * - Geometric accent patterns
 * - Premium typography effects
 * - Glassmorphism and blur effects
 */

// ============================================================
// LENS FLARE & LIGHT EFFECTS
// ============================================================

export const LIGHT_EFFECTS = {
    // Subtle lens flare for premium feel
    lensFlare: {
        softGlow: {
            svg: (x, y, size = 200, color = '#FFFFFF', opacity = 0.15) => `
<radialGradient id="lensFlare-${x}-${y}" cx="50%" cy="50%" r="50%">
    <stop offset="0%" style="stop-color:${color};stop-opacity:${opacity * 2}"/>
    <stop offset="40%" style="stop-color:${color};stop-opacity:${opacity}"/>
    <stop offset="100%" style="stop-color:${color};stop-opacity:0"/>
</radialGradient>
<ellipse cx="${x}" cy="${y}" rx="${size}" ry="${size * 0.6}" fill="url(#lensFlare-${x}-${y})"/>`,
        },

        anamorphicStreak: {
            svg: (x, y, width = 400, color = '#00FFFF', opacity = 0.08) => `
<linearGradient id="streak-${x}-${y}" x1="0%" y1="50%" x2="100%" y2="50%">
    <stop offset="0%" style="stop-color:${color};stop-opacity:0"/>
    <stop offset="30%" style="stop-color:${color};stop-opacity:${opacity}"/>
    <stop offset="50%" style="stop-color:${color};stop-opacity:${opacity * 1.5}"/>
    <stop offset="70%" style="stop-color:${color};stop-opacity:${opacity}"/>
    <stop offset="100%" style="stop-color:${color};stop-opacity:0"/>
</linearGradient>
<rect x="${x - width / 2}" y="${y - 2}" width="${width}" height="4" fill="url(#streak-${x}-${y})"/>`,
        },
    },

    // Light leak overlay
    lightLeak: {
        topRight: (opacity = 0.1) => `
<radialGradient id="lightLeak-tr" cx="100%" cy="0%" r="70%">
    <stop offset="0%" style="stop-color:#FF6B00;stop-opacity:${opacity}"/>
    <stop offset="50%" style="stop-color:#FF00FF;stop-opacity:${opacity * 0.5}"/>
    <stop offset="100%" style="stop-color:#FF00FF;stop-opacity:0"/>
</radialGradient>
<rect x="0" y="0" width="100%" height="100%" fill="url(#lightLeak-tr)"/>`,

        bottomLeft: (opacity = 0.08) => `
<radialGradient id="lightLeak-bl" cx="0%" cy="100%" r="60%">
    <stop offset="0%" style="stop-color:#00FFFF;stop-opacity:${opacity}"/>
    <stop offset="60%" style="stop-color:#0080FF;stop-opacity:${opacity * 0.3}"/>
    <stop offset="100%" style="stop-color:#0080FF;stop-opacity:0"/>
</radialGradient>
<rect x="0" y="0" width="100%" height="100%" fill="url(#lightLeak-bl)"/>`,
    },
};

// ============================================================
// PRODUCT GLOW & AURA
// ============================================================

export const PRODUCT_EFFECTS = {
    // Subtle glow behind product
    aura: {
        standard: (centerX, centerY, width, height, color = '#FFFFFF', intensity = 0.15) => `
<filter id="productAura" x="-100%" y="-100%" width="300%" height="300%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="40" result="blur"/>
    <feFlood flood-color="${color}" flood-opacity="${intensity}"/>
    <feComposite in2="blur" operator="in"/>
</filter>
<ellipse cx="${centerX}" cy="${centerY}" rx="${width * 0.6}" ry="${height * 0.5}" 
         fill="${color}" opacity="${intensity}" filter="url(#productAura)"/>`,

        neon: (centerX, centerY, width, height, color = '#00FFFF', intensity = 0.25) => `
<filter id="neonAura" x="-100%" y="-100%" width="300%" height="300%">
    <feGaussianBlur stdDeviation="25" result="blur"/>
    <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="blur"/>
        <feMergeNode in="blur"/>
    </feMerge>
</filter>
<ellipse cx="${centerX}" cy="${centerY}" rx="${width * 0.55}" ry="${height * 0.45}" 
         fill="${color}" opacity="${intensity}" filter="url(#neonAura)"/>`,
    },

    // Drop shadow under product
    shadow: {
        soft: (centerX, bottomY, width) => `
<ellipse cx="${centerX}" cy="${bottomY + 20}" rx="${width * 0.4}" ry="15" 
         fill="rgba(0,0,0,0.3)" filter="url(#shadow-lg)"/>`,

        dramatic: (centerX, bottomY, width) => `
<ellipse cx="${centerX}" cy="${bottomY + 30}" rx="${width * 0.5}" ry="25" 
         fill="rgba(0,0,0,0.4)" filter="url(#shadow-lg)"/>
<ellipse cx="${centerX}" cy="${bottomY + 15}" rx="${width * 0.3}" ry="10" 
         fill="rgba(0,0,0,0.2)"/>`,
    },
};

// ============================================================
// GEOMETRIC ACCENT PATTERNS
// ============================================================

export const GEOMETRIC_ACCENTS = {
    // Corner accents
    cornerLines: {
        topLeft: (size = 80, color = 'rgba(255,255,255,0.08)', strokeWidth = 1) => `
<line x1="0" y1="${size}" x2="0" y2="0" stroke="${color}" stroke-width="${strokeWidth}"/>
<line x1="0" y1="0" x2="${size}" y2="0" stroke="${color}" stroke-width="${strokeWidth}"/>`,

        bottomRight: (canvasSize, size = 80, color = 'rgba(255,255,255,0.08)', strokeWidth = 1) => `
<line x1="${canvasSize}" y1="${canvasSize - size}" x2="${canvasSize}" y2="${canvasSize}" stroke="${color}" stroke-width="${strokeWidth}"/>
<line x1="${canvasSize - size}" y1="${canvasSize}" x2="${canvasSize}" y2="${canvasSize}" stroke="${color}" stroke-width="${strokeWidth}"/>`,
    },

    // Subtle grid pattern
    hexGrid: (opacity = 0.03) => `
<pattern id="hexGrid" width="60" height="52" patternUnits="userSpaceOnUse">
    <path d="M30,0 L60,15 L60,37 L30,52 L0,37 L0,15 Z" 
          fill="none" stroke="rgba(255,255,255,${opacity})" stroke-width="0.5"/>
</pattern>
<rect width="100%" height="100%" fill="url(#hexGrid)"/>`,

    // Floating orbs/particles
    particles: (count = 5, canvasSize = 1080) => {
        let particles = '';
        for (let i = 0; i < count; i++) {
            const x = Math.random() * canvasSize;
            const y = Math.random() * canvasSize;
            const size = 2 + Math.random() * 4;
            const opacity = 0.1 + Math.random() * 0.2;
            particles += `
<circle cx="${x}" cy="${y}" r="${size}" fill="rgba(255,255,255,${opacity})">
    <animate attributeName="opacity" values="${opacity};${opacity * 0.5};${opacity}" dur="${3 + Math.random() * 2}s" repeatCount="indefinite"/>
</circle>`;
        }
        return particles;
    },

    // Diagonal accent lines
    diagonalLines: (canvasSize, color = 'rgba(255,255,255,0.03)', count = 5) => {
        let lines = '';
        for (let i = 0; i < count; i++) {
            const offset = (canvasSize / count) * i;
            lines += `
<line x1="${offset}" y1="0" x2="${canvasSize}" y2="${canvasSize - offset}" 
      stroke="${color}" stroke-width="1"/>`;
        }
        return lines;
    },
};

// ============================================================
// FILM GRAIN & TEXTURE
// ============================================================

export const TEXTURES = {
    // Film grain overlay
    filmGrain: (opacity = 0.03) => `
<filter id="filmGrain">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" seed="0" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feBlend in="SourceGraphic" mode="overlay"/>
</filter>`,

    // Subtle noise texture
    noiseTexture: (opacity = 0.02) => `
<filter id="noise" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise"/>
    <feColorMatrix in="noise" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${opacity} 0"/>
</filter>
<rect width="100%" height="100%" filter="url(#noise)"/>`,
};

// ============================================================
// PREMIUM TYPOGRAPHY EFFECTS
// ============================================================

export const TYPOGRAPHY_EFFECTS = {
    // Multi-layer text shadow for depth
    premiumTextShadow: `
<filter id="premiumTextShadow" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)" result="shadow1"/>
    <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.2)" result="shadow2"/>
    <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="rgba(0,0,0,0.1)" result="shadow3"/>
    <feMerge>
        <feMergeNode in="shadow3"/>
        <feMergeNode in="shadow2"/>
        <feMergeNode in="shadow1"/>
        <feMergeNode in="SourceGraphic"/>
    </feMerge>
</filter>`,

    // Subtle text glow
    textGlow: (color = '#FFFFFF') => `
<filter id="textGlow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
    <feFlood flood-color="${color}" flood-opacity="0.3"/>
    <feComposite in2="blur" operator="in"/>
    <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
    </feMerge>
</filter>`,

    // Neon text effect
    neonText: (color = '#00FFFF') => `
<filter id="neonText" x="-100%" y="-100%" width="300%" height="300%">
    <feGaussianBlur stdDeviation="4" result="blur1"/>
    <feFlood flood-color="${color}" flood-opacity="0.8"/>
    <feComposite in2="blur1" operator="in" result="glow1"/>
    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur2"/>
    <feFlood flood-color="${color}" flood-opacity="0.4"/>
    <feComposite in2="blur2" operator="in" result="glow2"/>
    <feMerge>
        <feMergeNode in="glow1"/>
        <feMergeNode in="glow2"/>
        <feMergeNode in="SourceGraphic"/>
    </feMerge>
</filter>`,

    // Gradient text fill
    gradientText: (color1 = '#FF4444', color2 = '#FF8888') => `
<linearGradient id="textGradient" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" style="stop-color:${color1}"/>
    <stop offset="100%" style="stop-color:${color2}"/>
</linearGradient>`,
};

// ============================================================
// GLASSMORPHISM EFFECTS
// ============================================================

export const GLASSMORPHISM = {
    // Frosted glass panel
    frostedPanel: (x, y, width, height, radius = 20, opacity = 0.1) => `
<filter id="frostedGlass" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="10"/>
</filter>
<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}"
      fill="rgba(255,255,255,${opacity})" 
      stroke="rgba(255,255,255,${opacity * 2})" stroke-width="1"/>`,

    // Glass card with border
    glassCard: (x, y, width, height, radius = 16) => `
<defs>
    <linearGradient id="glassGradient-${x}-${y}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:rgba(255,255,255,0.2)"/>
        <stop offset="100%" style="stop-color:rgba(255,255,255,0.05)"/>
    </linearGradient>
</defs>
<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}"
      fill="url(#glassGradient-${x}-${y})" 
      stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
<rect x="${x}" y="${y}" width="${width}" height="${height / 3}" rx="${radius}"
      fill="rgba(255,255,255,0.05)"/>`,
};

// ============================================================
// CTA BUTTON EFFECTS
// ============================================================

export const CTA_EFFECTS = {
    // Premium button with multiple layers
    premiumButton: (x, y, width, height, color1, color2) => `
<defs>
    <linearGradient id="ctaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1}"/>
        <stop offset="100%" style="stop-color:${color2}"/>
    </linearGradient>
    <filter id="ctaGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8"/>
        <feFlood flood-color="${color1}" flood-opacity="0.4"/>
        <feComposite operator="in"/>
        <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
    </filter>
</defs>
<!-- Shadow layer -->
<rect x="${x + 2}" y="${y + 4}" width="${width}" height="${height}" rx="${height / 2}"
      fill="rgba(0,0,0,0.3)" filter="url(#shadow-md)"/>
<!-- Main button -->
<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${height / 2}"
      fill="url(#ctaGrad)" filter="url(#ctaGlow)"/>
<!-- Top highlight -->
<ellipse cx="${x + width / 2}" cy="${y + 12}" rx="${width * 0.4}" ry="8" fill="rgba(255,255,255,0.25)"/>
<!-- Inner shadow (bottom) -->
<rect x="${x}" y="${y + height - 8}" width="${width}" height="8" rx="4"
      fill="rgba(0,0,0,0.1)"/>`,

    // Animated pulse effect (for web)
    pulseAnimation: (color) => `
<style>
    @keyframes pulse {
        0% { filter: drop-shadow(0 0 5px ${color}); }
        50% { filter: drop-shadow(0 0 20px ${color}); }
        100% { filter: drop-shadow(0 0 5px ${color}); }
    }
    .pulse-btn { animation: pulse 2s infinite; }
</style>`,
};

// ============================================================
// BADGE EFFECTS
// ============================================================

export const BADGE_EFFECTS = {
    // Premium badge with shine
    premiumBadge: (x, y, width, height, bgColor, textColor) => `
<defs>
    <linearGradient id="badgeShine" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:rgba(255,255,255,0.3)"/>
        <stop offset="50%" style="stop-color:rgba(255,255,255,0)"/>
        <stop offset="100%" style="stop-color:rgba(255,255,255,0.1)"/>
    </linearGradient>
</defs>
<!-- Badge background -->
<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${height / 2}" fill="${bgColor}"/>
<!-- Shine overlay -->
<rect x="${x}" y="${y}" width="${width}" height="${height / 2}" rx="${height / 2}" fill="url(#badgeShine)"/>`,

    // Neon badge for gaming
    neonBadge: (x, y, width, height, color) => `
<filter id="neonBadge" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="3"/>
    <feFlood flood-color="${color}" flood-opacity="0.6"/>
    <feComposite operator="in"/>
    <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
    </feMerge>
</filter>
<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${height / 2}" 
      fill="${color}" filter="url(#neonBadge)"/>`,
};

// ============================================================
// VIGNETTE EFFECT
// ============================================================

export const VIGNETTE = {
    subtle: (canvasSize = 1080) => `
<radialGradient id="vignette" cx="50%" cy="50%" r="70%">
    <stop offset="0%" style="stop-color:rgba(0,0,0,0)"/>
    <stop offset="100%" style="stop-color:rgba(0,0,0,0.4)"/>
</radialGradient>
<rect width="${canvasSize}" height="${canvasSize}" fill="url(#vignette)"/>`,

    dramatic: (canvasSize = 1080) => `
<radialGradient id="vignetteDramatic" cx="50%" cy="50%" r="60%">
    <stop offset="0%" style="stop-color:rgba(0,0,0,0)"/>
    <stop offset="70%" style="stop-color:rgba(0,0,0,0.2)"/>
    <stop offset="100%" style="stop-color:rgba(0,0,0,0.6)"/>
</radialGradient>
<rect width="${canvasSize}" height="${canvasSize}" fill="url(#vignetteDramatic)"/>`,
};

// ============================================================
// COLOR GRADING PRESETS
// ============================================================

export const COLOR_GRADING = {
    cinematic: `
<filter id="cinematic">
    <feColorMatrix type="matrix" values="
        1.1 0 0 0 0
        0 1.0 0 0 0
        0 0 0.9 0 0.05
        0 0 0 1 0"/>
</filter>`,

    warm: `
<filter id="warm">
    <feColorMatrix type="matrix" values="
        1.1 0.1 0 0 0
        0 1.0 0 0 0
        0 0 0.85 0 0
        0 0 0 1 0"/>
</filter>`,

    cool: `
<filter id="cool">
    <feColorMatrix type="matrix" values="
        0.95 0 0.05 0 0
        0 1.0 0.05 0 0
        0 0 1.1 0 0
        0 0 0 1 0"/>
</filter>`,

    neon: `
<filter id="neonGrade">
    <feColorMatrix type="matrix" values="
        1.2 0 0.1 0 0
        0 1.1 0.1 0 0
        0.1 0.1 1.3 0 0
        0 0 0 1 0"/>
</filter>`,
};

// ============================================================
// COMPLETE OVERLAY GENERATOR
// ============================================================

export function generateAgencyOverlay(config) {
    const {
        canvasSize = 1080,
        palette = 'premium',
        includeVignette = true,
        includeGrain = true,
        includeLightEffects = true,
        includeGeometricAccents = true,
        productZone = null,
        isGaming = false,
    } = config;

    // Calculate product zone center for effects positioning
    const hasProductZone = productZone && productZone.width && productZone.height;
    const prodCenterX = hasProductZone ? (productZone.x + productZone.width / 2) : canvasSize / 2;
    const prodCenterY = hasProductZone ? (productZone.y + productZone.height / 2) : canvasSize / 2;

    let svg = `<svg width="${canvasSize}" height="${canvasSize}" xmlns="http://www.w3.org/2000/svg">
<defs>
    ${TYPOGRAPHY_EFFECTS.premiumTextShadow}
    ${TYPOGRAPHY_EFFECTS.textGlow()}
    ${isGaming ? TYPOGRAPHY_EFFECTS.neonText() : ''}
    
    <!-- Premium film grain for texture -->
    <filter id="premiumNoise" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise"/>
        <feColorMatrix in="noise" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.03 0"/>
    </filter>
    
    <!-- Vignette centered on product - product stays bright, edges get darker -->
    <radialGradient id="vignetteProductCentered" cx="${prodCenterX / canvasSize * 100}%" cy="${prodCenterY / canvasSize * 100}%" r="80%">
        <stop offset="0%" style="stop-color:rgba(0,0,0,0)"/>
        <stop offset="50%" style="stop-color:rgba(0,0,0,0)"/>
        <stop offset="80%" style="stop-color:rgba(0,0,0,0.15)"/>
        <stop offset="100%" style="stop-color:rgba(0,0,0,0.35)"/>
    </radialGradient>
    
    <!-- Large shadow for depth -->
    <filter id="shadow-lg" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="8" stdDeviation="15" flood-color="rgba(0,0,0,0.35)"/>
    </filter>
    
    ${COLOR_GRADING.cinematic}
</defs>
`;

    // Light effects - creates atmosphere
    if (includeLightEffects) {
        if (isGaming) {
            // Neon aesthetic for gaming
            svg += LIGHT_EFFECTS.lensFlare.anamorphicStreak.svg(canvasSize / 2, canvasSize * 0.25, canvasSize * 0.9, '#00FFFF', 0.08);
            svg += LIGHT_EFFECTS.lightLeak.topRight(0.08);
            svg += LIGHT_EFFECTS.lightLeak.bottomLeft(0.06);
        } else {
            // Subtle professional glow
            svg += LIGHT_EFFECTS.lensFlare.softGlow.svg(canvasSize * 0.8, canvasSize * 0.2, 180, '#FFFFFF', 0.10);
            svg += LIGHT_EFFECTS.lensFlare.softGlow.svg(canvasSize * 0.15, canvasSize * 0.85, 100, '#FFFFFF', 0.05);
        }
    }

    // Product glow/aura - makes product pop
    if (hasProductZone) {
        const centerX = productZone.x + productZone.width / 2;
        const centerY = productZone.y + productZone.height / 2;
        if (isGaming) {
            // Strong neon glow for gaming
            svg += PRODUCT_EFFECTS.aura.neon(centerX, centerY, productZone.width, productZone.height, '#00FFFF', 0.15);
        } else {
            // Elegant white glow for premium
            svg += PRODUCT_EFFECTS.aura.standard(centerX, centerY, productZone.width, productZone.height, '#FFFFFF', 0.12);
        }
        // Add subtle shadow under product
        svg += PRODUCT_EFFECTS.shadow.soft(centerX, productZone.y + productZone.height, productZone.width);
    }

    // Geometric accents for premium feel
    if (includeGeometricAccents) {
        svg += GEOMETRIC_ACCENTS.cornerLines.topLeft(70, 'rgba(255,255,255,0.08)', 1);
        svg += GEOMETRIC_ACCENTS.cornerLines.bottomRight(canvasSize, 70, 'rgba(255,255,255,0.08)', 1);
        if (isGaming) {
            svg += GEOMETRIC_ACCENTS.hexGrid(0.025);
            svg += GEOMETRIC_ACCENTS.particles(4, canvasSize);
        }
    }

    // Premium vignette - product center stays bright
    if (includeVignette) {
        svg += `<rect width="${canvasSize}" height="${canvasSize}" fill="url(#vignetteProductCentered)"/>`;
    }

    // Film grain for premium texture (subtle but visible)
    if (includeGrain) {
        svg += `<rect width="100%" height="100%" filter="url(#premiumNoise)" opacity="0.35"/>`;
    }

    svg += `</svg>`;

    return svg;
}

// ============================================================
// EXPORTS
// ============================================================

export default {
    LIGHT_EFFECTS,
    PRODUCT_EFFECTS,
    GEOMETRIC_ACCENTS,
    TEXTURES,
    TYPOGRAPHY_EFFECTS,
    GLASSMORPHISM,
    CTA_EFFECTS,
    BADGE_EFFECTS,
    VIGNETTE,
    COLOR_GRADING,
    generateAgencyOverlay,
};
