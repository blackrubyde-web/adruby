/**
 * ADVANCED EFFECTS ENGINE
 * 
 * Professional-grade visual effects:
 * - Glassmorphism with frosted glass
 * - 3D perspective transforms
 * - Advanced shadow systems (ambient, contact, volumetric)
 * - Gradient mesh backgrounds
 * - Particle systems
 * - Light ray effects
 * - Reflection mapping
 * - Noise and grain textures
 * - Color grading and LUTs
 * - Vignette variations
 * - Chromatic aberration
 * - Motion blur hints
 */

import sharp from 'sharp';

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;

// ========================================
// GLASSMORPHISM ENGINE
// ========================================

/**
 * Create glassmorphic panel with blur and frosted effect
 */
export function createGlassmorphismPanel({
    width = 400,
    height = 200,
    x = 0,
    y = 0,
    blurAmount = 20,
    opacity = 0.15,
    borderOpacity = 0.3,
    borderRadius = 20,
    tint = '#FFFFFF',
    borderWidth = 1
}) {
    return `
    <g transform="translate(${x}, ${y})">
        <defs>
            <filter id="glass_blur_${x}_${y}" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="${blurAmount}"/>
            </filter>
            <linearGradient id="glass_gradient_${x}_${y}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${tint};stop-opacity:${opacity * 1.5}"/>
                <stop offset="50%" style="stop-color:${tint};stop-opacity:${opacity}"/>
                <stop offset="100%" style="stop-color:${tint};stop-opacity:${opacity * 0.5}"/>
            </linearGradient>
            <linearGradient id="glass_border_${x}_${y}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${tint};stop-opacity:${borderOpacity}"/>
                <stop offset="100%" style="stop-color:${tint};stop-opacity:${borderOpacity * 0.3}"/>
            </linearGradient>
        </defs>
        <!-- Blur backdrop simulation -->
        <rect width="${width}" height="${height}" rx="${borderRadius}" 
              fill="url(#glass_gradient_${x}_${y})"/>
        <!-- Inner highlight -->
        <rect x="1" y="1" width="${width - 2}" height="${height / 3}" rx="${borderRadius - 1}"
              fill="url(#glass_border_${x}_${y})"/>
        <!-- Border -->
        <rect width="${width}" height="${height}" rx="${borderRadius}"
              fill="none" stroke="url(#glass_border_${x}_${y})" stroke-width="${borderWidth}"/>
    </g>`;
}

/**
 * Create floating glass card with content
 */
export function createGlassCard({
    x, y, width, height,
    title = '',
    subtitle = '',
    icon = '',
    accentColor = '#FF4757'
}) {
    const panelSvg = createGlassmorphismPanel({
        width, height, x, y,
        blurAmount: 25,
        opacity: 0.12,
        borderRadius: 16,
        tint: '#FFFFFF'
    });

    return `
    ${panelSvg}
    <g transform="translate(${x}, ${y})">
        ${icon ? `<text x="20" y="35" font-size="24">${icon}</text>` : ''}
        ${title ? `
        <text x="${icon ? 55 : 20}" y="32" fill="#FFFFFF" font-size="16" font-weight="600" 
              font-family="system-ui">${escapeXml(title)}</text>
        ` : ''}
        ${subtitle ? `
        <text x="${icon ? 55 : 20}" y="52" fill="rgba(255,255,255,0.7)" font-size="12" 
              font-family="system-ui">${escapeXml(subtitle)}</text>
        ` : ''}
    </g>`;
}

// ========================================
// 3D PERSPECTIVE ENGINE
// ========================================

/**
 * Generate CSS-style 3D transform matrix for SVG
 * Note: SVG doesn't support full 3D, but we can simulate with skew/scale
 */
export function create3DPerspectiveTransform({
    rotateX = 0,      // -30 to 30 degrees
    rotateY = 0,      // -30 to 30 degrees
    perspective = 1000,
    originX = 0.5,
    originY = 0.5
}) {
    // Simplified perspective simulation using skew
    const skewX = rotateY * 0.5;
    const skewY = rotateX * 0.3;
    const scaleX = 1 - Math.abs(rotateY) / 100;
    const scaleY = 1 - Math.abs(rotateX) / 100;

    return {
        transform: `skewX(${skewX}) skewY(${skewY}) scale(${scaleX}, ${scaleY})`,
        transformOrigin: `${originX * 100}% ${originY * 100}%`
    };
}

/**
 * Create isometric view effect
 */
export function createIsometricTransform(angle = 30) {
    const rad = angle * Math.PI / 180;
    const skewX = Math.tan(rad) * 20;
    const scaleY = Math.cos(rad);

    return `skewX(${-skewX}) scaleY(${scaleY})`;
}

// ========================================
// ADVANCED SHADOW SYSTEM
// ========================================

/**
 * Create multi-layer shadow for depth
 */
export function createAdvancedShadow({
    id,
    type = 'layered',    // layered, ambient, contact, volumetric
    color = '#000000',
    intensity = 0.5,
    angle = 135,         // Light source angle in degrees
    elevation = 20       // Height of element
}) {
    const rad = angle * Math.PI / 180;
    const dx = Math.cos(rad) * elevation * 0.5;
    const dy = Math.sin(rad) * elevation * 0.8;

    switch (type) {
        case 'layered':
            // Multiple shadows with decreasing opacity for depth
            return `
            <filter id="${id}" x="-100%" y="-100%" width="300%" height="300%">
                <!-- Ambient shadow -->
                <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="${color}" flood-opacity="${intensity * 0.2}"/>
                <!-- Primary shadow -->
                <feDropShadow dx="${dx * 0.5}" dy="${dy * 0.5}" stdDeviation="${elevation * 0.4}" 
                              flood-color="${color}" flood-opacity="${intensity * 0.3}"/>
                <!-- Deep shadow -->
                <feDropShadow dx="${dx}" dy="${dy}" stdDeviation="${elevation}" 
                              flood-color="${color}" flood-opacity="${intensity * 0.5}"/>
            </filter>`;

        case 'ambient':
            // Soft, omnidirectional shadow
            return `
            <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="${elevation * 1.5}" result="blur"/>
                <feOffset dx="0" dy="${elevation * 0.3}" result="offset"/>
                <feFlood flood-color="${color}" flood-opacity="${intensity * 0.4}"/>
                <feComposite in2="offset" operator="in"/>
                <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>`;

        case 'contact':
            // Sharp shadow directly beneath object
            return `
            <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
                <feOffset dx="0" dy="4" result="offset"/>
                <feFlood flood-color="${color}" flood-opacity="${intensity}"/>
                <feComposite in2="offset" operator="in"/>
                <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>`;

        case 'volumetric':
            // 3D-style volumetric shadow
            return `
            <filter id="${id}" x="-100%" y="-100%" width="300%" height="300%">
                ${Array.from({ length: 5 }, (_, i) => `
                <feDropShadow dx="${dx * (i + 1) * 0.3}" dy="${dy * (i + 1) * 0.3}" 
                              stdDeviation="${(i + 1) * 2}" 
                              flood-color="${color}" flood-opacity="${intensity * 0.15}"/>
                `).join('')}
            </filter>`;

        default:
            return createAdvancedShadow({ id, type: 'layered', color, intensity, angle, elevation });
    }
}

// ========================================
// GRADIENT MESH ENGINE
// ========================================

/**
 * Create Apple-style gradient mesh background
 */
export function createGradientMesh({
    colors = ['#FF4757', '#6C5CE7', '#00D2D3', '#FFA502'],
    complexity = 4,
    softness = 0.6
}) {
    const meshPoints = [];
    const gridSize = Math.ceil(Math.sqrt(complexity));

    // Generate mesh points
    for (let i = 0; i < complexity; i++) {
        const col = i % gridSize;
        const row = Math.floor(i / gridSize);
        const x = (col / (gridSize - 1)) * CANVAS_WIDTH + (Math.random() - 0.5) * 200;
        const y = (row / (gridSize - 1)) * CANVAS_HEIGHT + (Math.random() - 0.5) * 200;
        const color = colors[i % colors.length];
        const radius = 300 + Math.random() * 400;

        meshPoints.push({ x, y, color, radius });
    }

    // Generate gradients
    let gradientDefs = '';
    let gradientCircles = '';

    meshPoints.forEach((point, i) => {
        gradientDefs += `
        <radialGradient id="mesh_${i}" cx="${point.x / CANVAS_WIDTH * 100}%" cy="${point.y / CANVAS_HEIGHT * 100}%" r="${point.radius / CANVAS_WIDTH * 100}%">
            <stop offset="0%" style="stop-color:${point.color};stop-opacity:${softness}"/>
            <stop offset="60%" style="stop-color:${point.color};stop-opacity:${softness * 0.3}"/>
            <stop offset="100%" style="stop-color:${point.color};stop-opacity:0"/>
        </radialGradient>`;

        gradientCircles += `
        <ellipse cx="${point.x}" cy="${point.y}" rx="${point.radius * 1.2}" ry="${point.radius}" 
                 fill="url(#mesh_${i})"/>`;
    });

    return {
        defs: gradientDefs,
        content: gradientCircles
    };
}

// ========================================
// PARTICLE SYSTEM
// ========================================

/**
 * Generate particle field
 */
export function createParticleField({
    count = 50,
    sizeRange = [1, 4],
    opacityRange = [0.1, 0.5],
    color = '#FFFFFF',
    distribution = 'random',    // random, radial, flow
    centerX = CANVAS_WIDTH / 2,
    centerY = CANVAS_HEIGHT / 2
}) {
    let particles = '';

    for (let i = 0; i < count; i++) {
        let x, y;

        switch (distribution) {
            case 'radial':
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * CANVAS_WIDTH * 0.45;
                x = centerX + Math.cos(angle) * distance;
                y = centerY + Math.sin(angle) * distance;
                break;
            case 'flow':
                x = Math.random() * CANVAS_WIDTH;
                y = Math.random() * CANVAS_HEIGHT;
                // Slight vertical bias
                y = y * 0.8 + CANVAS_HEIGHT * 0.1;
                break;
            default:
                x = Math.random() * CANVAS_WIDTH;
                y = Math.random() * CANVAS_HEIGHT;
        }

        const size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
        const opacity = opacityRange[0] + Math.random() * (opacityRange[1] - opacityRange[0]);

        particles += `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" fill-opacity="${opacity}"/>`;
    }

    return particles;
}

/**
 * Create sparkle/star burst effect
 */
export function createSparkles({
    count = 12,
    centerX = CANVAS_WIDTH / 2,
    centerY = CANVAS_HEIGHT / 2,
    radius = 200,
    color = '#FFFFFF',
    size = 8
}) {
    let sparkles = '';

    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const distance = radius * (0.7 + Math.random() * 0.3);
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        const sparkleSize = size * (0.5 + Math.random() * 0.5);
        const opacity = 0.4 + Math.random() * 0.6;

        // 4-point star
        sparkles += `
        <g transform="translate(${x}, ${y}) rotate(${Math.random() * 45})">
            <path d="M 0 ${-sparkleSize} L ${sparkleSize * 0.2} 0 L 0 ${sparkleSize} L ${-sparkleSize * 0.2} 0 Z
                     M ${-sparkleSize} 0 L 0 ${sparkleSize * 0.2} L ${sparkleSize} 0 L 0 ${-sparkleSize * 0.2} Z"
                  fill="${color}" fill-opacity="${opacity}"/>
        </g>`;
    }

    return sparkles;
}

// ========================================
// LIGHT EFFECTS
// ========================================

/**
 * Create light ray effect (god rays)
 */
export function createLightRays({
    originX = CANVAS_WIDTH / 2,
    originY = -100,
    rayCount = 8,
    spreadAngle = 60,
    length = CANVAS_HEIGHT * 1.5,
    color = '#FFFFFF',
    opacity = 0.1
}) {
    let rays = '';
    const startAngle = 90 - spreadAngle / 2;
    const angleStep = spreadAngle / (rayCount - 1);

    for (let i = 0; i < rayCount; i++) {
        const angle = (startAngle + i * angleStep) * Math.PI / 180;
        const width = 20 + Math.random() * 40;
        const rayOpacity = opacity * (0.5 + Math.random() * 0.5);

        const x1 = originX - width / 2;
        const x2 = originX + width / 2;
        const endX = originX + Math.cos(angle - Math.PI / 2) * length;
        const endY = originY + Math.sin(angle - Math.PI / 2) * length;
        const endWidth = width * 3;

        rays += `
        <polygon points="${x1},${originY} ${x2},${originY} ${endX + endWidth / 2},${endY} ${endX - endWidth / 2},${endY}"
                 fill="${color}" fill-opacity="${rayOpacity}"/>`;
    }

    return `
    <defs>
        <filter id="rayBlur">
            <feGaussianBlur stdDeviation="20"/>
        </filter>
    </defs>
    <g filter="url(#rayBlur)">${rays}</g>`;
}

/**
 * Create lens flare effect
 */
export function createLensFlare({
    x = CANVAS_WIDTH * 0.3,
    y = CANVAS_HEIGHT * 0.2,
    intensity = 0.5,
    color = '#FFD700',
    size = 100
}) {
    const flareElements = [];

    // Main flare
    flareElements.push(`
    <radialGradient id="flare_main" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:${intensity}"/>
        <stop offset="30%" style="stop-color:${color};stop-opacity:${intensity * 0.5}"/>
        <stop offset="100%" style="stop-color:${color};stop-opacity:0"/>
    </radialGradient>
    <circle cx="${x}" cy="${y}" r="${size}" fill="url(#flare_main)"/>`);

    // Secondary flares along the line to center
    const dx = (CANVAS_WIDTH / 2 - x);
    const dy = (CANVAS_HEIGHT / 2 - y);

    for (let i = 1; i <= 4; i++) {
        const flareX = x + dx * (i * 0.25 + 0.2);
        const flareY = y + dy * (i * 0.25 + 0.2);
        const flareSize = size * (0.3 + Math.random() * 0.4);
        const flareOpacity = intensity * 0.3 * (1 - i * 0.2);

        flareElements.push(`
        <circle cx="${flareX}" cy="${flareY}" r="${flareSize}" 
                fill="${color}" fill-opacity="${flareOpacity}"/>`);
    }

    return `<g>${flareElements.join('')}</g>`;
}

// ========================================
// TEXTURE EFFECTS
// ========================================

/**
 * Create noise texture overlay
 */
export function createNoiseTexture({
    opacity = 0.03,
    frequency = 0.8,
    octaves = 4,
    type = 'monochrome'    // monochrome, color, grain
}) {
    const filterId = `noise_${Date.now()}`;

    switch (type) {
        case 'grain':
            return `
            <filter id="${filterId}">
                <feTurbulence type="fractalNoise" baseFrequency="${frequency}" numOctaves="${octaves}" result="noise"/>
                <feColorMatrix type="saturate" values="0"/>
                <feComponentTransfer>
                    <feFuncA type="linear" slope="${opacity * 10}" intercept="0"/>
                </feComponentTransfer>
                <feBlend in="SourceGraphic" mode="overlay"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#${filterId})" opacity="${opacity}"/>`;

        case 'color':
            return `
            <filter id="${filterId}">
                <feTurbulence type="turbulence" baseFrequency="${frequency * 0.5}" numOctaves="${octaves}"/>
                <feComponentTransfer>
                    <feFuncA type="linear" slope="${opacity * 5}" intercept="0"/>
                </feComponentTransfer>
            </filter>
            <rect width="100%" height="100%" filter="url(#${filterId})"/>`;

        default: // monochrome
            return `
            <filter id="${filterId}">
                <feTurbulence type="fractalNoise" baseFrequency="${frequency}" numOctaves="${octaves}"/>
                <feColorMatrix type="saturate" values="0"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#${filterId})" opacity="${opacity}"/>`;
    }
}

/**
 * Create halftone pattern
 */
export function createHalftonePattern({
    dotSize = 4,
    spacing = 8,
    color = '#000000',
    opacity = 0.1
}) {
    const patternId = `halftone_${Date.now()}`;

    return `
    <defs>
        <pattern id="${patternId}" x="0" y="0" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
            <circle cx="${spacing / 2}" cy="${spacing / 2}" r="${dotSize / 2}" fill="${color}" fill-opacity="${opacity}"/>
        </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#${patternId})"/>`;
}

// ========================================
// COLOR GRADING
// ========================================

/**
 * Apply color grading filter
 */
export function createColorGrading({
    preset = 'cinematic',    // cinematic, warm, cool, vintage, neon
    intensity = 1.0
}) {
    const filterId = `grade_${preset}`;

    const presets = {
        cinematic: {
            saturate: 0.9,
            contrast: 1.1,
            hueRotate: -5,
            tint: 'rgba(20, 40, 80, 0.1)'
        },
        warm: {
            saturate: 1.1,
            contrast: 1.05,
            hueRotate: 10,
            tint: 'rgba(255, 180, 100, 0.1)'
        },
        cool: {
            saturate: 0.95,
            contrast: 1.05,
            hueRotate: -10,
            tint: 'rgba(100, 150, 255, 0.1)'
        },
        vintage: {
            saturate: 0.7,
            contrast: 1.1,
            hueRotate: 15,
            tint: 'rgba(200, 180, 150, 0.15)'
        },
        neon: {
            saturate: 1.4,
            contrast: 1.2,
            hueRotate: 0,
            tint: 'rgba(255, 0, 255, 0.05)'
        }
    };

    const p = presets[preset] || presets.cinematic;
    const sat = 1 + (p.saturate - 1) * intensity;
    const con = 1 + (p.contrast - 1) * intensity;

    return `
    <filter id="${filterId}">
        <feColorMatrix type="saturate" values="${sat}"/>
        <feComponentTransfer>
            <feFuncR type="linear" slope="${con}" intercept="${(1 - con) / 2}"/>
            <feFuncG type="linear" slope="${con}" intercept="${(1 - con) / 2}"/>
            <feFuncB type="linear" slope="${con}" intercept="${(1 - con) / 2}"/>
        </feComponentTransfer>
        <feColorMatrix type="hueRotate" values="${p.hueRotate * intensity}"/>
    </filter>
    <rect width="100%" height="100%" fill="${p.tint}" opacity="${intensity}"/>`;
}

// ========================================
// VIGNETTE EFFECTS
// ========================================

/**
 * Create advanced vignette
 */
export function createVignette({
    type = 'classic',    // classic, oval, corner, cinematic
    intensity = 0.4,
    spread = 0.7
}) {
    switch (type) {
        case 'oval':
            return `
            <defs>
                <radialGradient id="vignette_oval" cx="50%" cy="50%" r="${spread * 100}%">
                    <stop offset="50%" style="stop-color:transparent"/>
                    <stop offset="100%" style="stop-color:rgba(0,0,0,${intensity})"/>
                </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#vignette_oval)"/>`;

        case 'corner':
            return `
            <defs>
                <radialGradient id="vig_tl" cx="0%" cy="0%" r="100%">
                    <stop offset="0%" style="stop-color:rgba(0,0,0,${intensity})"/>
                    <stop offset="50%" style="stop-color:transparent"/>
                </radialGradient>
                <radialGradient id="vig_tr" cx="100%" cy="0%" r="100%">
                    <stop offset="0%" style="stop-color:rgba(0,0,0,${intensity})"/>
                    <stop offset="50%" style="stop-color:transparent"/>
                </radialGradient>
                <radialGradient id="vig_bl" cx="0%" cy="100%" r="100%">
                    <stop offset="0%" style="stop-color:rgba(0,0,0,${intensity})"/>
                    <stop offset="50%" style="stop-color:transparent"/>
                </radialGradient>
                <radialGradient id="vig_br" cx="100%" cy="100%" r="100%">
                    <stop offset="0%" style="stop-color:rgba(0,0,0,${intensity})"/>
                    <stop offset="50%" style="stop-color:transparent"/>
                </radialGradient>
            </defs>
            <rect width="50%" height="50%" fill="url(#vig_tl)"/>
            <rect x="50%" width="50%" height="50%" fill="url(#vig_tr)"/>
            <rect y="50%" width="50%" height="50%" fill="url(#vig_bl)"/>
            <rect x="50%" y="50%" width="50%" height="50%" fill="url(#vig_br)"/>`;

        case 'cinematic':
            // Top and bottom bars
            return `
            <defs>
                <linearGradient id="vig_top" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:rgba(0,0,0,${intensity * 0.8})"/>
                    <stop offset="100%" style="stop-color:transparent"/>
                </linearGradient>
                <linearGradient id="vig_bot" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" style="stop-color:rgba(0,0,0,${intensity * 0.8})"/>
                    <stop offset="100%" style="stop-color:transparent"/>
                </linearGradient>
            </defs>
            <rect width="100%" height="20%" fill="url(#vig_top)"/>
            <rect y="80%" width="100%" height="20%" fill="url(#vig_bot)"/>`;

        default: // classic
            return `
            <defs>
                <radialGradient id="vignette_classic" cx="50%" cy="50%" r="${spread * 100}%">
                    <stop offset="60%" style="stop-color:transparent"/>
                    <stop offset="100%" style="stop-color:rgba(0,0,0,${intensity})"/>
                </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#vignette_classic)"/>`;
    }
}

// ========================================
// MOTION EFFECTS
// ========================================

/**
 * Create motion blur hint (static representation)
 */
export function createMotionBlurHint({
    direction = 'horizontal',    // horizontal, vertical, radial
    intensity = 0.3,
    streakCount = 3
}) {
    let streaks = '';

    for (let i = 0; i < streakCount; i++) {
        const offset = (i - streakCount / 2) * 5;
        const opacity = intensity * (1 - Math.abs(i - streakCount / 2) / streakCount);

        if (direction === 'horizontal') {
            streaks += `
            <rect x="${CANVAS_WIDTH * 0.1}" y="${CANVAS_HEIGHT * 0.45 + offset}" 
                  width="${CANVAS_WIDTH * 0.8}" height="2" 
                  fill="#FFFFFF" fill-opacity="${opacity}"/>`;
        } else if (direction === 'vertical') {
            streaks += `
            <rect x="${CANVAS_WIDTH * 0.45 + offset}" y="${CANVAS_HEIGHT * 0.1}" 
                  width="2" height="${CANVAS_HEIGHT * 0.8}" 
                  fill="#FFFFFF" fill-opacity="${opacity}"/>`;
        }
    }

    return streaks;
}

// ========================================
// COMPOSITE ALL EFFECTS
// ========================================

/**
 * Build complete effects layer
 */
export async function buildEffectsLayer(designSpecs, accentColor) {
    const effects = designSpecs?.effects || {};
    const composition = designSpecs?.composition || {};
    const mood = designSpecs?.mood || {};

    let effectsSvg = '';
    let effectsDefs = '';

    // Add gradient mesh if premium mood
    if (mood.primary === 'premium' || mood.primary === 'luxury') {
        const mesh = createGradientMesh({
            colors: [accentColor, '#6C5CE7', '#00D2D3', accentColor],
            complexity: 5,
            softness: 0.4
        });
        effectsDefs += mesh.defs;
        effectsSvg += mesh.content;
    }

    // Add particles
    if (effects.backgroundEffects?.hasParticles) {
        effectsSvg += createParticleField({
            count: 40,
            sizeRange: [1, 3],
            opacityRange: [0.1, 0.3],
            distribution: 'radial',
            centerX: CANVAS_WIDTH * (composition.focalPoint?.xPercent || 0.5),
            centerY: CANVAS_HEIGHT * (composition.focalPoint?.yPercent || 0.45)
        });
    }

    // Add sparkles near product
    if (mood.energy === 'dynamic' || mood.energy === 'intense') {
        effectsSvg += createSparkles({
            count: 8,
            centerX: CANVAS_WIDTH * (composition.focalPoint?.xPercent || 0.5),
            centerY: CANVAS_HEIGHT * (composition.focalPoint?.yPercent || 0.45),
            radius: 250,
            color: accentColor,
            size: 6
        });
    }

    // Add light rays for dramatic effect
    if (effects.backgroundEffects?.hasLightRays) {
        effectsSvg += createLightRays({
            originX: CANVAS_WIDTH * 0.3,
            originY: -50,
            rayCount: 6,
            spreadAngle: 40,
            color: '#FFFFFF',
            opacity: 0.08
        });
    }

    // Add noise texture
    if (effects.backgroundEffects?.hasNoiseTexture !== false) {
        effectsSvg += createNoiseTexture({
            opacity: effects.backgroundEffects?.noiseOpacity || 0.02,
            type: 'grain'
        });
    }

    // Add vignette
    if (designSpecs?.colors?.hasVignette !== false) {
        effectsSvg += createVignette({
            type: 'classic',
            intensity: 0.35,
            spread: 0.65
        });
    }

    const fullSvg = `
    <svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <defs>${effectsDefs}</defs>
        ${effectsSvg}
    </svg>`;

    return await sharp(Buffer.from(fullSvg)).png().toBuffer();
}

// Helper
function escapeXml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default {
    createGlassmorphismPanel,
    createGlassCard,
    create3DPerspectiveTransform,
    createIsometricTransform,
    createAdvancedShadow,
    createGradientMesh,
    createParticleField,
    createSparkles,
    createLightRays,
    createLensFlare,
    createNoiseTexture,
    createHalftonePattern,
    createColorGrading,
    createVignette,
    createMotionBlurHint,
    buildEffectsLayer
};
