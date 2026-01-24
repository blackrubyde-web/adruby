/**
 * DECORATIVE OVERLAY SYSTEM
 * 
 * Generate atmosphere-enhancing decorative layers:
 * 
 * - Bokeh light effects
 * - Floating particles
 * - Sparkle fields
 * - Gradient orbs
 * - Lens flare
 * - Light streaks
 * - Geometric accents
 */

// ========================================
// BOKEH LIGHTS
// ========================================

export function generateBokeh({
    width = 1080,
    height = 1080,
    count = 8,
    minSize = 40,
    maxSize = 150,
    colors = ['#3B82F6', '#8B5CF6', '#EC4899'],
    opacity = 0.08,
    blur = 40,
    seed = null
}) {
    const id = `bokeh_${Date.now()}`;
    const random = seed !== null ? seededRandom(seed) : Math.random;

    let defs = `<filter id="${id}_blur"><feGaussianBlur stdDeviation="${blur}"/></filter>`;
    let circles = '';

    for (let i = 0; i < count; i++) {
        const size = minSize + random() * (maxSize - minSize);
        const cx = random() * width;
        const cy = random() * height;
        const color = colors[Math.floor(random() * colors.length)];

        circles += `<circle cx="${cx}" cy="${cy}" r="${size}" fill="${color}" fill-opacity="${opacity}" filter="url(#${id}_blur)"/>`;
    }

    return { svg: `<defs>${defs}</defs>${circles}` };
}

// ========================================
// FLOATING PARTICLES
// ========================================

export function generateParticles({
    width = 1080,
    height = 1080,
    count = 50,
    minSize = 2,
    maxSize = 6,
    color = '#FFFFFF',
    minOpacity = 0.1,
    maxOpacity = 0.4,
    distribution = 'random', // 'random', 'rising', 'falling', 'center'
    seed = null
}) {
    const random = seed !== null ? seededRandom(seed) : Math.random;
    let particles = '';

    for (let i = 0; i < count; i++) {
        let x, y;

        switch (distribution) {
            case 'rising':
                x = random() * width;
                y = height - random() * height * 0.7;
                break;
            case 'falling':
                x = random() * width;
                y = random() * height * 0.7;
                break;
            case 'center':
                const angle = random() * Math.PI * 2;
                const dist = random() * Math.min(width, height) * 0.4;
                x = width / 2 + Math.cos(angle) * dist;
                y = height / 2 + Math.sin(angle) * dist;
                break;
            default:
                x = random() * width;
                y = random() * height;
        }

        const size = minSize + random() * (maxSize - minSize);
        const opacity = minOpacity + random() * (maxOpacity - minOpacity);

        particles += `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" fill-opacity="${opacity}"/>`;
    }

    return { svg: particles };
}

// ========================================
// SPARKLE FIELD
// ========================================

export function generateSparkles({
    width = 1080,
    height = 1080,
    count = 25,
    minSize = 8,
    maxSize = 20,
    color = '#FFFFFF',
    minOpacity = 0.3,
    maxOpacity = 0.8,
    seed = null
}) {
    const random = seed !== null ? seededRandom(seed) : Math.random;
    let sparkles = '';

    for (let i = 0; i < count; i++) {
        const x = random() * width;
        const y = random() * height;
        const size = minSize + random() * (maxSize - minSize);
        const opacity = minOpacity + random() * (maxOpacity - minOpacity);
        const rotation = random() * 45;

        sparkles += `
            <g transform="translate(${x}, ${y}) rotate(${rotation})">
                <line x1="${-size / 2}" y1="0" x2="${size / 2}" y2="0" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.5" stroke-linecap="round"/>
                <line x1="0" y1="${-size / 2}" x2="0" y2="${size / 2}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.5" stroke-linecap="round"/>
            </g>
        `;
    }

    return { svg: sparkles };
}

// ========================================
// GRADIENT ORBS
// ========================================

export function generateGradientOrbs({
    width = 1080,
    height = 1080,
    orbs = [
        { x: 200, y: 300, size: 400, color: '#3B82F6', opacity: 0.15 },
        { x: 800, y: 700, size: 350, color: '#8B5CF6', opacity: 0.12 }
    ],
    blur = 80
}) {
    const id = `orb_${Date.now()}`;
    let defs = `<filter id="${id}_blur"><feGaussianBlur stdDeviation="${blur}"/></filter>`;

    let elements = '';
    orbs.forEach((orb, i) => {
        const gradId = `${id}_grad_${i}`;
        defs += `<radialGradient id="${gradId}">
            <stop offset="0%" stop-color="${orb.color}" stop-opacity="${orb.opacity}"/>
            <stop offset="100%" stop-color="${orb.color}" stop-opacity="0"/>
        </radialGradient>`;

        elements += `<circle cx="${orb.x}" cy="${orb.y}" r="${orb.size}" fill="url(#${gradId})" filter="url(#${id}_blur)"/>`;
    });

    return { svg: `<defs>${defs}</defs>${elements}` };
}

// ========================================
// LENS FLARE
// ========================================

export function generateLensFlare({
    x = 200,
    y = 200,
    size = 300,
    color = '#FFFFFF',
    rays = 8,
    rayOpacity = 0.15,
    coreOpacity = 0.5,
    haloCount = 3
}) {
    const id = `flare_${Date.now()}`;
    let defs = '';
    let elements = '';

    // Core glow
    defs += `<radialGradient id="${id}_core">
        <stop offset="0%" stop-color="${color}" stop-opacity="${coreOpacity}"/>
        <stop offset="30%" stop-color="${color}" stop-opacity="${coreOpacity * 0.5}"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </radialGradient>`;

    elements += `<circle cx="${x}" cy="${y}" r="${size * 0.2}" fill="url(#${id}_core)"/>`;

    // Rays
    for (let i = 0; i < rays; i++) {
        const angle = (i / rays) * Math.PI * 2;
        const rayLength = size * (0.3 + Math.random() * 0.3);
        const x2 = x + Math.cos(angle) * rayLength;
        const y2 = y + Math.sin(angle) * rayLength;

        elements += `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-opacity="${rayOpacity}" stroke-width="2"/>`;
    }

    // Halos
    for (let i = 0; i < haloCount; i++) {
        const haloR = size * 0.3 + i * size * 0.15;
        elements += `<circle cx="${x}" cy="${y}" r="${haloR}" fill="none" stroke="${color}" stroke-opacity="${0.1 / (i + 1)}" stroke-width="${4 - i}"/>`;
    }

    return { svg: `<defs>${defs}</defs>${elements}` };
}

// ========================================
// LIGHT STREAKS
// ========================================

export function generateLightStreaks({
    width = 1080,
    height = 1080,
    count = 5,
    angle = 45,
    color = '#FFFFFF',
    minOpacity = 0.02,
    maxOpacity = 0.08,
    minWidth = 50,
    maxWidth = 200,
    seed = null
}) {
    const random = seed !== null ? seededRandom(seed) : Math.random;
    const id = `streak_${Date.now()}`;

    let defs = '';
    let streaks = '';

    const radians = (angle * Math.PI) / 180;
    const length = Math.sqrt(width * width + height * height) * 1.5;

    for (let i = 0; i < count; i++) {
        const streakWidth = minWidth + random() * (maxWidth - minWidth);
        const opacity = minOpacity + random() * (maxOpacity - minOpacity);
        const offsetX = (random() - 0.5) * width * 1.5;
        const offsetY = (random() - 0.5) * height;

        const gradId = `${id}_grad_${i}`;
        defs += `<linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${color}" stop-opacity="0"/>
            <stop offset="50%" stop-color="${color}" stop-opacity="${opacity}"/>
            <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>`;

        const cx = width / 2 + offsetX;
        const cy = height / 2 + offsetY;

        streaks += `<rect x="${cx - streakWidth / 2}" y="${cy - length / 2}" width="${streakWidth}" height="${length}" fill="url(#${gradId})" transform="rotate(${angle} ${cx} ${cy})"/>`;
    }

    return { svg: `<defs>${defs}</defs>${streaks}` };
}

// ========================================
// GEOMETRIC ACCENTS
// ========================================

export function generateGeometricAccents({
    width = 1080,
    height = 1080,
    shapes = 6,
    types = ['circle', 'line', 'triangle'],
    color = '#FFFFFF',
    opacity = 0.1,
    strokeWidth = 1,
    seed = null
}) {
    const random = seed !== null ? seededRandom(seed) : Math.random;
    let elements = '';

    for (let i = 0; i < shapes; i++) {
        const type = types[Math.floor(random() * types.length)];
        const x = random() * width;
        const y = random() * height;
        const size = 20 + random() * 60;

        switch (type) {
            case 'circle':
                elements += `<circle cx="${x}" cy="${y}" r="${size}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${strokeWidth}"/>`;
                break;
            case 'line':
                const angle = random() * Math.PI;
                elements += `<line x1="${x}" y1="${y}" x2="${x + Math.cos(angle) * size * 2}" y2="${y + Math.sin(angle) * size * 2}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${strokeWidth}"/>`;
                break;
            case 'triangle':
                const r = size;
                const pts = [0, 1, 2].map(j => {
                    const a = (j * 2 * Math.PI / 3) - Math.PI / 2;
                    return `${x + r * Math.cos(a)},${y + r * Math.sin(a)}`;
                }).join(' ');
                elements += `<polygon points="${pts}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${strokeWidth}"/>`;
                break;
        }
    }

    return { svg: elements };
}

// ========================================
// VIGNETTE
// ========================================

export function generateVignette({
    width = 1080,
    height = 1080,
    intensity = 0.5,
    color = '#000000',
    style = 'radial' // 'radial', 'top', 'bottom', 'sides'
}) {
    const id = `vignette_${Date.now()}`;
    let gradient = '';

    switch (style) {
        case 'radial':
            gradient = `<radialGradient id="${id}" cx="50%" cy="50%" r="70%">
                <stop offset="30%" stop-color="${color}" stop-opacity="0"/>
                <stop offset="100%" stop-color="${color}" stop-opacity="${intensity}"/>
            </radialGradient>`;
            break;
        case 'top':
            gradient = `<linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="${color}" stop-opacity="${intensity}"/>
                <stop offset="30%" stop-color="${color}" stop-opacity="0"/>
            </linearGradient>`;
            break;
        case 'bottom':
            gradient = `<linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="70%" stop-color="${color}" stop-opacity="0"/>
                <stop offset="100%" stop-color="${color}" stop-opacity="${intensity}"/>
            </linearGradient>`;
            break;
        case 'sides':
            gradient = `<linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="${color}" stop-opacity="${intensity * 0.7}"/>
                <stop offset="20%" stop-color="${color}" stop-opacity="0"/>
                <stop offset="80%" stop-color="${color}" stop-opacity="0"/>
                <stop offset="100%" stop-color="${color}" stop-opacity="${intensity * 0.7}"/>
            </linearGradient>`;
            break;
    }

    return {
        svg: `<defs>${gradient}</defs><rect x="0" y="0" width="${width}" height="${height}" fill="url(#${id})"/>`
    };
}

// ========================================
// COMBINED ATMOSPHERE LAYER
// ========================================

export function generateAtmosphereLayer({
    width = 1080,
    height = 1080,
    style = 'premium', // 'premium', 'energetic', 'calm', 'tech', 'minimal'
    primaryColor = '#3B82F6',
    secondaryColor = '#8B5CF6'
}) {
    const configs = {
        premium: {
            bokeh: { count: 6, opacity: 0.06, blur: 50 },
            particles: { count: 30, maxOpacity: 0.2 },
            vignette: { intensity: 0.4 },
            orbs: true
        },
        energetic: {
            bokeh: { count: 10, opacity: 0.1, blur: 40 },
            particles: { count: 60, maxOpacity: 0.4 },
            sparkles: { count: 30 },
            vignette: { intensity: 0.3 }
        },
        calm: {
            bokeh: { count: 4, opacity: 0.04, blur: 60 },
            particles: { count: 20, maxOpacity: 0.15 },
            vignette: { intensity: 0.35 }
        },
        tech: {
            geometric: { shapes: 8, types: ['circle', 'line'] },
            particles: { count: 40 },
            streaks: { count: 3, angle: 30 },
            vignette: { intensity: 0.4 }
        },
        minimal: {
            vignette: { intensity: 0.25 },
            particles: { count: 15, maxOpacity: 0.1 }
        }
    };

    const config = configs[style] || configs.premium;
    let layers = '';

    if (config.orbs) {
        layers += generateGradientOrbs({
            width, height,
            orbs: [
                { x: width * 0.2, y: height * 0.3, size: 400, color: primaryColor, opacity: 0.12 },
                { x: width * 0.8, y: height * 0.7, size: 350, color: secondaryColor, opacity: 0.1 }
            ]
        }).svg;
    }

    if (config.bokeh) {
        layers += generateBokeh({
            width, height,
            colors: [primaryColor, secondaryColor],
            ...config.bokeh
        }).svg;
    }

    if (config.particles) {
        layers += generateParticles({ width, height, ...config.particles }).svg;
    }

    if (config.sparkles) {
        layers += generateSparkles({ width, height, ...config.sparkles }).svg;
    }

    if (config.geometric) {
        layers += generateGeometricAccents({ width, height, ...config.geometric }).svg;
    }

    if (config.streaks) {
        layers += generateLightStreaks({ width, height, ...config.streaks }).svg;
    }

    if (config.vignette) {
        layers += generateVignette({ width, height, ...config.vignette }).svg;
    }

    return { svg: layers };
}

// ========================================
// HELPER
// ========================================

function seededRandom(seed) {
    let value = seed;
    return function () {
        value = (value * 9301 + 49297) % 233280;
        return value / 233280;
    };
}

export default {
    generateBokeh,
    generateParticles,
    generateSparkles,
    generateGradientOrbs,
    generateLensFlare,
    generateLightStreaks,
    generateGeometricAccents,
    generateVignette,
    generateAtmosphereLayer
};
