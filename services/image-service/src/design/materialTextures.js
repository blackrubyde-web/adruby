/**
 * MATERIAL & TEXTURE SYSTEM
 * 
 * Physical material simulation for premium feel:
 * 
 * - Surface Materials (glass, metal, fabric, etc.)
 * - Texture Overlays (noise, grain, paper)
 * - Light Interaction (reflections, specular, diffuse)
 * - Depth Simulation (emboss, deboss, bevels)
 * - Environmental Effects (scratches, dust, wear)
 */

// ========================================
// MATERIAL DEFINITIONS
// ========================================

export const MATERIALS = {
    // Glass Materials
    glass_clear: {
        name: 'Clear Glass',
        type: 'glass',
        properties: {
            transparency: 0.85,
            blur: 12,
            refraction: 1.5,
            reflection: 0.15,
            specular: 0.9,
            tint: null
        },
        svgFilter: (id) => `
            <filter id="${id}">
                <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur"/>
                <feColorMatrix in="blur" type="matrix" 
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.85 0"/>
            </filter>
        `
    },

    glass_frosted: {
        name: 'Frosted Glass',
        type: 'glass',
        properties: {
            transparency: 0.6,
            blur: 20,
            refraction: 1.3,
            reflection: 0.08,
            specular: 0.5,
            noise: 0.05
        },
        svgFilter: (id) => `
            <filter id="${id}">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
                <feGaussianBlur stdDeviation="20"/>
                <feColorMatrix type="matrix" 
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.6 0"/>
            </filter>
        `
    },

    glass_dark: {
        name: 'Dark Glass',
        type: 'glass',
        properties: {
            transparency: 0.4,
            blur: 10,
            tint: '#0A0A1A',
            reflection: 0.2,
            specular: 0.7
        }
    },

    // Metal Materials
    metal_brushed: {
        name: 'Brushed Metal',
        type: 'metal',
        properties: {
            roughness: 0.4,
            metalness: 0.95,
            reflection: 0.6,
            specular: 0.8,
            anisotropy: 0.9,
            color: '#B8B8C0'
        },
        svgFilter: (id) => `
            <filter id="${id}">
                <feTurbulence type="fractalNoise" baseFrequency="0.02 0.8" numOctaves="1" result="noise"/>
                <feColorMatrix in="noise" type="matrix" 
                    values="0.3 0 0 0 0.55  0.3 0 0 0 0.55  0.35 0 0 0 0.58  0 0 0 0.15 0" result="brushed"/>
                <feComposite in="SourceGraphic" in2="brushed" operator="arithmetic" k1="0.5" k2="0.5" k3="0" k4="0"/>
            </filter>
        `
    },

    metal_chrome: {
        name: 'Chrome',
        type: 'metal',
        properties: {
            roughness: 0.05,
            metalness: 1.0,
            reflection: 0.95,
            specular: 1.0,
            color: '#C0C0C8'
        }
    },

    metal_gold: {
        name: 'Gold',
        type: 'metal',
        properties: {
            roughness: 0.15,
            metalness: 0.95,
            reflection: 0.7,
            specular: 0.9,
            color: '#D4AF37'
        }
    },

    metal_dark: {
        name: 'Dark Metal',
        type: 'metal',
        properties: {
            roughness: 0.5,
            metalness: 0.9,
            reflection: 0.3,
            specular: 0.6,
            color: '#2D2D35'
        }
    },

    // Fabric Materials
    fabric_silk: {
        name: 'Silk',
        type: 'fabric',
        properties: {
            roughness: 0.2,
            sheen: 0.8,
            weave: 'fine',
            drape: 0.9
        }
    },

    fabric_velvet: {
        name: 'Velvet',
        type: 'fabric',
        properties: {
            roughness: 0.6,
            sheen: 0.4,
            depth: 0.8,
            softness: 1.0
        }
    },

    // Paper Materials
    paper_matte: {
        name: 'Matte Paper',
        type: 'paper',
        properties: {
            roughness: 0.8,
            texture: 'fine',
            absorption: 0.7
        },
        svgFilter: (id) => `
            <filter id="${id}">
                <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="4" result="noise"/>
                <feColorMatrix in="noise" type="matrix" 
                    values="0.05 0 0 0 0  0 0.05 0 0 0  0 0 0.05 0 0  0 0 0 0.08 0" result="grain"/>
                <feBlend in="SourceGraphic" in2="grain" mode="multiply"/>
            </filter>
        `
    },

    paper_glossy: {
        name: 'Glossy Paper',
        type: 'paper',
        properties: {
            roughness: 0.1,
            reflection: 0.3,
            specular: 0.7
        }
    },

    // Plastic Materials
    plastic_matte: {
        name: 'Matte Plastic',
        type: 'plastic',
        properties: {
            roughness: 0.7,
            specular: 0.3,
            subsurface: 0.1
        }
    },

    plastic_glossy: {
        name: 'Glossy Plastic',
        type: 'plastic',
        properties: {
            roughness: 0.1,
            specular: 0.8,
            reflection: 0.4
        }
    }
};

// ========================================
// TEXTURE OVERLAYS
// ========================================

export const TEXTURES = {
    // Noise Textures
    noise_fine: {
        name: 'Fine Noise',
        frequency: 0.8,
        octaves: 4,
        opacity: 0.03,
        blendMode: 'overlay'
    },

    noise_medium: {
        name: 'Medium Noise',
        frequency: 0.4,
        octaves: 3,
        opacity: 0.05,
        blendMode: 'overlay'
    },

    noise_coarse: {
        name: 'Coarse Noise',
        frequency: 0.15,
        octaves: 2,
        opacity: 0.08,
        blendMode: 'overlay'
    },

    // Film Grain
    grain_35mm: {
        name: '35mm Film Grain',
        frequency: 0.7,
        octaves: 5,
        opacity: 0.04,
        blendMode: 'overlay',
        colorVariation: 0.02
    },

    grain_vintage: {
        name: 'Vintage Grain',
        frequency: 0.5,
        octaves: 4,
        opacity: 0.08,
        blendMode: 'multiply',
        colorShift: { sepia: 0.1 }
    },

    // Paper Textures
    paper_fine: {
        name: 'Fine Paper',
        frequency: 0.6,
        octaves: 4,
        opacity: 0.03,
        blendMode: 'multiply'
    },

    paper_coarse: {
        name: 'Coarse Paper',
        frequency: 0.2,
        octaves: 3,
        opacity: 0.06,
        blendMode: 'multiply'
    },

    // Canvas Texture
    canvas: {
        name: 'Canvas',
        frequency: '0.3 0.3',
        octaves: 2,
        opacity: 0.08,
        blendMode: 'multiply'
    }
};

/**
 * Generate SVG noise texture
 */
export function generateNoiseTextureSVG(width, height, textureKey = 'noise_fine') {
    const texture = TEXTURES[textureKey] || TEXTURES.noise_fine;
    const filterId = `noise_${Date.now()}`;

    return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <filter id="${filterId}">
                <feTurbulence 
                    type="fractalNoise" 
                    baseFrequency="${texture.frequency}" 
                    numOctaves="${texture.octaves}" 
                    stitchTiles="stitch"
                    result="noise"
                />
                <feColorMatrix 
                    in="noise" 
                    type="matrix" 
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${texture.opacity} 0"
                />
            </filter>
            <rect width="100%" height="100%" filter="url(#${filterId})" 
                  style="mix-blend-mode: ${texture.blendMode}"/>
        </svg>
    `;
}

// ========================================
// LIGHT SIMULATION
// ========================================

export const LIGHTING_SETUPS = {
    studio_soft: {
        name: 'Soft Studio',
        keyLight: { angle: -30, intensity: 0.8, softness: 0.9, color: '#FFFFFF' },
        fillLight: { angle: 45, intensity: 0.4, softness: 1.0, color: '#F0F0FF' },
        rimLight: { angle: 180, intensity: 0.2, softness: 0.7, color: '#FFFFFF' }
    },

    studio_dramatic: {
        name: 'Dramatic Studio',
        keyLight: { angle: -45, intensity: 1.0, softness: 0.3, color: '#FFFFFF' },
        fillLight: { angle: 60, intensity: 0.15, softness: 0.8, color: '#202040' },
        rimLight: { angle: 165, intensity: 0.5, softness: 0.4, color: '#FFFFFF' }
    },

    natural_day: {
        name: 'Natural Daylight',
        keyLight: { angle: -60, intensity: 0.7, softness: 1.0, color: '#FFF8F0' },
        ambient: { intensity: 0.5, color: '#E8F0FF' }
    },

    golden_hour: {
        name: 'Golden Hour',
        keyLight: { angle: 15, intensity: 0.9, softness: 0.8, color: '#FFD080' },
        ambient: { intensity: 0.3, color: '#FF9050' }
    },

    neon: {
        name: 'Neon Glow',
        lights: [
            { angle: -30, intensity: 0.6, softness: 0.6, color: '#FF00FF' },
            { angle: 30, intensity: 0.6, softness: 0.6, color: '#00FFFF' }
        ],
        ambient: { intensity: 0.1, color: '#101020' }
    },

    top_down: {
        name: 'Top Down',
        keyLight: { angle: 0, elevation: 90, intensity: 0.8, softness: 0.7, color: '#FFFFFF' },
        ambient: { intensity: 0.2, color: '#E0E0F0' }
    }
};

/**
 * Generate specular highlight SVG
 */
export function generateSpecularHighlight(x, y, size, intensity = 0.8, color = '#FFFFFF') {
    const filterId = `specular_${Date.now()}`;

    return `
        <defs>
            <radialGradient id="${filterId}" cx="30%" cy="30%">
                <stop offset="0%" stop-color="${color}" stop-opacity="${intensity}"/>
                <stop offset="50%" stop-color="${color}" stop-opacity="${intensity * 0.3}"/>
                <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
            </radialGradient>
        </defs>
        <ellipse cx="${x}" cy="${y}" rx="${size * 0.6}" ry="${size * 0.4}" 
                 fill="url(#${filterId})" style="mix-blend-mode: screen"/>
    `;
}

/**
 * Generate reflection gradient
 */
export function generateReflection(width, height, reflectionHeight = 0.3) {
    const reflectHeight = height * reflectionHeight;
    const gradientId = `reflect_${Date.now()}`;

    return `
        <defs>
            <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15"/>
                <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
            </linearGradient>
        </defs>
        <rect x="0" y="${height - reflectHeight}" width="${width}" height="${reflectHeight}" 
              fill="url(#${gradientId})"/>
    `;
}

// ========================================
// DEPTH EFFECTS (Emboss, Bevel)
// ========================================

export const DEPTH_EFFECTS = {
    emboss_subtle: {
        name: 'Subtle Emboss',
        lightAngle: 135,
        depth: 1,
        softness: 1,
        highlightColor: '#FFFFFF',
        highlightOpacity: 0.3,
        shadowColor: '#000000',
        shadowOpacity: 0.2
    },

    emboss_medium: {
        name: 'Medium Emboss',
        lightAngle: 135,
        depth: 2,
        softness: 1.5,
        highlightColor: '#FFFFFF',
        highlightOpacity: 0.5,
        shadowColor: '#000000',
        shadowOpacity: 0.35
    },

    deboss: {
        name: 'Deboss',
        lightAngle: 315, // Reverse of emboss
        depth: 1.5,
        softness: 1,
        highlightColor: '#FFFFFF',
        highlightOpacity: 0.2,
        shadowColor: '#000000',
        shadowOpacity: 0.4
    },

    bevel_smooth: {
        name: 'Smooth Bevel',
        style: 'inner',
        depth: 3,
        softness: 3,
        highlightMode: 'screen',
        shadowMode: 'multiply'
    },

    pillow_emboss: {
        name: 'Pillow Emboss',
        style: 'pillow',
        depth: 2,
        softness: 2
    }
};

/**
 * Generate emboss effect SVG filter
 */
export function generateEmbossFilter(effectKey = 'emboss_subtle') {
    const effect = DEPTH_EFFECTS[effectKey] || DEPTH_EFFECTS.emboss_subtle;
    const filterId = `emboss_${Date.now()}`;

    const angleRad = (effect.lightAngle * Math.PI) / 180;
    const dx = Math.cos(angleRad) * effect.depth;
    const dy = Math.sin(angleRad) * effect.depth;

    return {
        filterId,
        svg: `
            <filter id="${filterId}">
                <!-- Highlight (light side) -->
                <feOffset in="SourceAlpha" dx="${-dx}" dy="${-dy}" result="offsetLight"/>
                <feGaussianBlur in="offsetLight" stdDeviation="${effect.softness}" result="blurLight"/>
                <feFlood flood-color="${effect.highlightColor}" flood-opacity="${effect.highlightOpacity}"/>
                <feComposite in2="blurLight" operator="in" result="highlight"/>
                
                <!-- Shadow (dark side) -->
                <feOffset in="SourceAlpha" dx="${dx}" dy="${dy}" result="offsetDark"/>
                <feGaussianBlur in="offsetDark" stdDeviation="${effect.softness}" result="blurDark"/>
                <feFlood flood-color="${effect.shadowColor}" flood-opacity="${effect.shadowOpacity}"/>
                <feComposite in2="blurDark" operator="in" result="shadow"/>
                
                <!-- Combine -->
                <feMerge>
                    <feMergeNode in="shadow"/>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="highlight"/>
                </feMerge>
            </filter>
        `
    };
}

// ========================================
// ENVIRONMENTAL EFFECTS
// ========================================

export const ENVIRONMENTAL_EFFECTS = {
    dust_light: {
        name: 'Light Dust',
        particleCount: 20,
        sizeRange: [1, 3],
        opacity: 0.15,
        blur: 0.5
    },

    dust_heavy: {
        name: 'Heavy Dust',
        particleCount: 50,
        sizeRange: [1, 4],
        opacity: 0.25,
        blur: 0.8
    },

    scratches_fine: {
        name: 'Fine Scratches',
        count: 10,
        lengthRange: [20, 80],
        opacity: 0.1,
        angle: [-30, 30]
    },

    scratches_worn: {
        name: 'Worn Scratches',
        count: 25,
        lengthRange: [30, 150],
        opacity: 0.2,
        angle: [-45, 45]
    },

    weathered: {
        name: 'Weathered',
        edgeWear: 0.3,
        colorFade: 0.15,
        noise: 0.1
    }
};

/**
 * Generate dust particles SVG
 */
export function generateDustParticles(width, height, effectKey = 'dust_light') {
    const effect = ENVIRONMENTAL_EFFECTS[effectKey] || ENVIRONMENTAL_EFFECTS.dust_light;

    let particles = '';
    for (let i = 0; i < effect.particleCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = effect.sizeRange[0] + Math.random() * (effect.sizeRange[1] - effect.sizeRange[0]);
        const opacity = effect.opacity * (0.5 + Math.random() * 0.5);

        particles += `<circle cx="${x}" cy="${y}" r="${size}" fill="#FFFFFF" opacity="${opacity}" filter="url(#dustBlur)"/>`;
    }

    return `
        <defs>
            <filter id="dustBlur">
                <feGaussianBlur stdDeviation="${effect.blur}"/>
            </filter>
        </defs>
        ${particles}
    `;
}

// ========================================
// MATERIAL SELECTION
// ========================================

/**
 * Get material for product type
 */
export function getMaterialForProduct(productType) {
    const materialMap = {
        'phone': 'glass_clear',
        'laptop': 'metal_dark',
        'software': 'glass_frosted',
        'saas': 'glass_frosted',
        'fashion': 'fabric_silk',
        'beauty': 'glass_clear',
        'luxury': 'metal_gold',
        'tech': 'metal_brushed',
        'electronics': 'plastic_glossy'
    };

    const normalized = productType?.toLowerCase() || '';

    for (const [key, material] of Object.entries(materialMap)) {
        if (normalized.includes(key)) {
            return MATERIALS[material];
        }
    }

    return MATERIALS.glass_frosted; // Default
}

/**
 * Get texture for mood
 */
export function getTextureForMood(mood) {
    const textureMap = {
        'premium': 'noise_fine',
        'vintage': 'grain_vintage',
        'modern': 'noise_fine',
        'organic': 'paper_fine',
        'artistic': 'canvas',
        'clean': null,
        'tech': 'noise_fine'
    };

    return textureMap[mood?.toLowerCase()] || 'noise_fine';
}

export default {
    MATERIALS,
    TEXTURES,
    LIGHTING_SETUPS,
    DEPTH_EFFECTS,
    ENVIRONMENTAL_EFFECTS,
    generateNoiseTextureSVG,
    generateSpecularHighlight,
    generateReflection,
    generateEmbossFilter,
    generateDustParticles,
    getMaterialForProduct,
    getTextureForMood
};
