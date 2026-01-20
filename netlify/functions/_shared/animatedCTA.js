/**
 * ANIMATED CTA GENERATOR
 * 
 * Generates animated SVG CTAs with pulse, glow, and attention-grabbing effects.
 * These can be exported as animated SVG or converted to GIF/APNG for Meta ads.
 * 
 * Meta 2026 Level: CTAs that DEMAND attention.
 */

const CANVAS = 1080;

// ============================================================
// ANIMATION KEYFRAMES
// ============================================================

const ANIMATIONS = {
    // Subtle pulse effect
    pulse: `
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
    `,

    // Glow intensity variation
    glowPulse: `
        @keyframes glowPulse {
            0%, 100% { filter: drop-shadow(0 0 8px rgba(var(--glow-color), 0.5)); }
            50% { filter: drop-shadow(0 0 20px rgba(var(--glow-color), 0.8)); }
        }
    `,

    // Shimmer effect across button
    shimmer: `
        @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
        }
    `,

    // Bounce attention effect
    bounce: `
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
    `,

    // Arrow wiggle
    arrowWiggle: `
        @keyframes arrowWiggle {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(5px); }
        }
    `,

    // Ring expansion
    ringExpand: `
        @keyframes ringExpand {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(1.5); opacity: 0; }
        }
    `
};

// ============================================================
// ANIMATED CTA STYLES
// ============================================================

const CTA_STYLES = {
    // Pulsing glow - attention grabbing
    pulsingGlow: {
        animation: 'pulse 2s ease-in-out infinite',
        filter: 'drop-shadow(0 0 15px var(--glow-color))',
        effects: ['pulse', 'glowPulse']
    },

    // Shimmer effect - premium feel
    shimmer: {
        animation: 'shimmer 3s linear infinite',
        background: 'linear-gradient(90deg, var(--primary) 0%, var(--shimmer) 50%, var(--primary) 100%)',
        backgroundSize: '200% 100%',
        effects: ['shimmer']
    },

    // Bounce - playful attention
    bouncing: {
        animation: 'bounce 1.5s ease-in-out infinite',
        effects: ['bounce']
    },

    // Ring pulse - expanding attention ring
    ringPulse: {
        animation: 'none',
        hasRing: true,
        effects: ['ringExpand']
    }
};

// ============================================================
// ANIMATED SVG GENERATOR
// ============================================================

/**
 * Generate an animated CTA SVG
 */
export function generateAnimatedCTA(config) {
    const {
        text = 'Jetzt kaufen',
        style = 'pulsingGlow',
        primaryColor = '#FF4444',
        textColor = '#FFFFFF',
        width = 280,
        height = 56,
        x = (CANVAS - 280) / 2,
        y = CANVAS - 120,
        fontSize = 20
    } = config;

    const styleConfig = CTA_STYLES[style] || CTA_STYLES.pulsingGlow;
    const radius = height / 2;

    // Calculate glow color (lighter version of primary)
    const glowColor = primaryColor;

    // Build animation styles
    let animationStyles = '';
    styleConfig.effects.forEach(effect => {
        if (ANIMATIONS[effect]) {
            animationStyles += ANIMATIONS[effect];
        }
    });

    // Determine if we need arrow
    const hasArrow = text.includes('→') || text.includes('→');
    const cleanText = text.replace('→', '').replace('→', '').trim();

    let svg = `<svg width="${CANVAS}" height="${CANVAS}" xmlns="http://www.w3.org/2000/svg">
<defs>
    <style>
        :root {
            --primary: ${primaryColor};
            --glow-color: ${hexToRgb(glowColor)};
            --shimmer: ${lightenColor(primaryColor, 40)};
        }
        ${animationStyles}
        
        .cta-button {
            animation: ${styleConfig.animation};
            transform-origin: center;
        }
        
        .cta-glow {
            animation: glowPulse 2s ease-in-out infinite;
        }
        
        .cta-arrow {
            animation: arrowWiggle 1s ease-in-out infinite;
        }
        
        .cta-ring {
            animation: ringExpand 2s ease-out infinite;
            transform-origin: center;
        }
    </style>
    
    <!-- Button gradient -->
    <linearGradient id="ctaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${primaryColor}"/>
        <stop offset="100%" style="stop-color:${darkenColor(primaryColor, 20)}"/>
    </linearGradient>
    
    <!-- Shimmer gradient -->
    <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${primaryColor}"/>
        <stop offset="50%" style="stop-color:${lightenColor(primaryColor, 30)}"/>
        <stop offset="100%" style="stop-color:${primaryColor}"/>
    </linearGradient>
    
    <!-- Glow filter -->
    <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feFlood flood-color="${primaryColor}" flood-opacity="0.6"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
    </filter>
</defs>

<!-- Animated glow background -->
<g class="cta-glow">
    <ellipse cx="${x + width / 2}" cy="${y + height / 2}" rx="${width / 2 + 20}" ry="${height / 2 + 15}" 
             fill="${primaryColor}" opacity="0.2" filter="url(#glowFilter)"/>
</g>
`;

    // Add ring pulse effect if enabled
    if (styleConfig.hasRing) {
        svg += `
<!-- Expanding ring effect -->
<circle class="cta-ring" cx="${x + width / 2}" cy="${y + height / 2}" r="${width / 2}" 
        fill="none" stroke="${primaryColor}" stroke-width="2" opacity="0.5"/>
<circle class="cta-ring" cx="${x + width / 2}" cy="${y + height / 2}" r="${width / 2}" 
        fill="none" stroke="${primaryColor}" stroke-width="2" opacity="0.5" style="animation-delay: 0.5s"/>
`;
    }

    svg += `
<!-- Main button -->
<g class="cta-button">
    <!-- Button background -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" 
          fill="${style === 'shimmer' ? 'url(#shimmerGradient)' : 'url(#ctaGradient)'}"
          filter="url(#glowFilter)"/>
    
    <!-- Highlight reflection -->
    <ellipse cx="${x + width / 2}" cy="${y + 14}" rx="${width * 0.35}" ry="8" 
             fill="rgba(255,255,255,0.25)"/>
    
    <!-- Button text -->
    <text x="${x + width / 2 - (hasArrow ? 10 : 0)}" y="${y + height / 2 + 7}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="${fontSize}" font-weight="700" 
          fill="${textColor}" text-anchor="middle">${escapeXml(cleanText)}</text>
`;

    // Add animated arrow if present
    if (hasArrow) {
        svg += `
    <!-- Animated arrow -->
    <g class="cta-arrow">
        <text x="${x + width / 2 + (cleanText.length * 5)}" y="${y + height / 2 + 7}" 
              font-family="Arial, Helvetica, sans-serif" 
              font-size="${fontSize}" font-weight="700" 
              fill="${textColor}" text-anchor="middle">→</text>
    </g>
`;
    }

    svg += `
</g>
</svg>`;

    return svg;
}

/**
 * Generate animated badge SVG
 */
export function generateAnimatedBadge(config) {
    const {
        text = 'NEU',
        style = 'pulsingGlow',
        primaryColor = '#FF4444',
        textColor = '#FFFFFF',
        width = 100,
        height = 32,
        x = CANVAS - 43 - 130,
        y = 43
    } = config;

    const radius = height / 2;

    return `<svg width="${width + 40}" height="${height + 40}" xmlns="http://www.w3.org/2000/svg" viewBox="${x - 20} ${y - 20} ${width + 40} ${height + 40}">
<defs>
    <style>
        @keyframes badgePulse {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px ${primaryColor}); }
            50% { transform: scale(1.08); filter: drop-shadow(0 0 12px ${primaryColor}); }
        }
        .badge-animated {
            animation: badgePulse 1.5s ease-in-out infinite;
            transform-origin: center;
        }
    </style>
</defs>
<g class="badge-animated">
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" 
          fill="${primaryColor}"/>
    <text x="${x + width / 2}" y="${y + height / 2 + 5}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="14" font-weight="700" 
          fill="${textColor}" text-anchor="middle" letter-spacing="1">${escapeXml(text.toUpperCase())}</text>
</g>
</svg>`;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function escapeXml(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '255, 68, 68';
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

/**
 * Get all available animation styles
 */
export function getAnimationStyles() {
    return Object.keys(CTA_STYLES);
}

export default {
    generateAnimatedCTA,
    generateAnimatedBadge,
    getAnimationStyles,
    CTA_STYLES,
    ANIMATIONS,
    CANVAS
};
