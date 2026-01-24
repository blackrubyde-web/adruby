/**
 * ENHANCED TEXT EFFECTS
 * 
 * Professional text styling beyond basic CSS:
 * 
 * - Gradient text
 * - Glow/neon effects
 * - 3D text extrusion
 * - Outlined text
 * - Split color text
 * - Animated text (CSS keyframes)
 * - Masked text
 * - Distorted text
 */

// ========================================
// GRADIENT TEXT
// ========================================

export function createGradientText({
    text,
    x = 0,
    y = 0,
    fontSize = 48,
    fontFamily = 'Inter, system-ui',
    fontWeight = 800,
    gradientColors = ['#3B82F6', '#8B5CF6'],
    gradientAngle = 90,
    letterSpacing = '-0.02em',
    textAnchor = 'start'
}) {
    const id = `gradtext_${Date.now()}`;
    const radians = (gradientAngle * Math.PI) / 180;
    const x1 = 50 - 50 * Math.cos(radians);
    const y1 = 50 - 50 * Math.sin(radians);
    const x2 = 50 + 50 * Math.cos(radians);
    const y2 = 50 + 50 * Math.sin(radians);

    const stops = gradientColors.map((color, i) =>
        `<stop offset="${Math.round(i / (gradientColors.length - 1) * 100)}%" stop-color="${color}"/>`
    ).join('');

    return `
        <defs>
            <linearGradient id="${id}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${stops}</linearGradient>
        </defs>
        <text x="${x}" y="${y}" fill="url(#${id})" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" letter-spacing="${letterSpacing}" text-anchor="${textAnchor}">${text}</text>
    `;
}

// ========================================
// GLOW/NEON TEXT
// ========================================

export function createGlowText({
    text,
    x = 0,
    y = 0,
    fontSize = 48,
    fontFamily = 'Inter, system-ui',
    fontWeight = 700,
    textColor = '#FFFFFF',
    glowColor = '#3B82F6',
    glowIntensity = 1, // 0-2
    glowLayers = 3,
    textAnchor = 'start'
}) {
    const id = `glowtext_${Date.now()}`;

    // Create multiple glow layers
    const glowFilters = [];
    for (let i = 1; i <= glowLayers; i++) {
        const blur = 4 * i * glowIntensity;
        const opacity = 0.6 / i;
        glowFilters.push(`
            <filter id="${id}_glow${i}" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" result="blur"/>
                <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${opacity} 0"/>
            </filter>
        `);
    }

    // Render glow layers from largest to smallest
    let glowTexts = '';
    for (let i = glowLayers; i >= 1; i--) {
        glowTexts += `<text x="${x}" y="${y}" fill="${glowColor}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" text-anchor="${textAnchor}" filter="url(#${id}_glow${i})">${text}</text>`;
    }

    return `
        <defs>${glowFilters.join('')}</defs>
        ${glowTexts}
        <text x="${x}" y="${y}" fill="${textColor}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" text-anchor="${textAnchor}">${text}</text>
    `;
}

// ========================================
// 3D EXTRUDED TEXT
// ========================================

export function create3DText({
    text,
    x = 0,
    y = 0,
    fontSize = 64,
    fontFamily = 'Inter, system-ui',
    fontWeight = 900,
    faceColor = '#FFFFFF',
    extrudeColor = '#1E3A5F',
    depth = 6,
    angle = 135, // direction of extrusion
    textAnchor = 'center'
}) {
    const radians = (angle * Math.PI) / 180;
    const offsetX = Math.cos(radians);
    const offsetY = Math.sin(radians);

    // Create extrusion layers
    let extrudeLayers = '';
    for (let i = depth; i >= 1; i--) {
        const layerX = x + offsetX * i;
        const layerY = y + offsetY * i;
        const layerColor = adjustBrightness(extrudeColor, -i * 5);
        extrudeLayers += `<text x="${layerX}" y="${layerY}" fill="${layerColor}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" text-anchor="${textAnchor}">${text}</text>`;
    }

    return `
        ${extrudeLayers}
        <text x="${x}" y="${y}" fill="${faceColor}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" text-anchor="${textAnchor}">${text}</text>
    `;
}

// ========================================
// OUTLINED TEXT
// ========================================

export function createOutlinedText({
    text,
    x = 0,
    y = 0,
    fontSize = 48,
    fontFamily = 'Inter, system-ui',
    fontWeight = 800,
    fillColor = 'none',
    strokeColor = '#FFFFFF',
    strokeWidth = 2,
    textAnchor = 'start',
    dashed = false,
    dashArray = '10,5'
}) {
    const dashAttr = dashed ? `stroke-dasharray="${dashArray}"` : '';

    return `
        <text x="${x}" y="${y}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" ${dashAttr} font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" text-anchor="${textAnchor}">${text}</text>
    `;
}

// ========================================
// SPLIT COLOR TEXT
// ========================================

export function createSplitColorText({
    text,
    x = 0,
    y = 0,
    fontSize = 48,
    fontFamily = 'Inter, system-ui',
    fontWeight = 800,
    topColor = '#3B82F6',
    bottomColor = '#FFFFFF',
    splitPosition = 50, // percentage
    textAnchor = 'start'
}) {
    const id = `splittext_${Date.now()}`;

    return `
        <defs>
            <linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="${splitPosition}%" stop-color="${topColor}"/>
                <stop offset="${splitPosition}%" stop-color="${bottomColor}"/>
            </linearGradient>
        </defs>
        <text x="${x}" y="${y}" fill="url(#${id})" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" text-anchor="${textAnchor}">${text}</text>
    `;
}

// ========================================
// SHADOW TEXT
// ========================================

export function createShadowText({
    text,
    x = 0,
    y = 0,
    fontSize = 48,
    fontFamily = 'Inter, system-ui',
    fontWeight = 700,
    textColor = '#FFFFFF',
    shadowColor = 'rgba(0,0,0,0.5)',
    shadowBlur = 8,
    shadowOffsetX = 0,
    shadowOffsetY = 4,
    textAnchor = 'start'
}) {
    const id = `shadowtext_${Date.now()}`;

    return `
        <defs>
            <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="${shadowOffsetX}" dy="${shadowOffsetY}" stdDeviation="${shadowBlur / 2}" flood-color="${shadowColor}"/>
            </filter>
        </defs>
        <text x="${x}" y="${y}" fill="${textColor}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" text-anchor="${textAnchor}" filter="url(#${id})">${text}</text>
    `;
}

// ========================================
// HIGHLIGHT TEXT
// ========================================

export function createHighlightText({
    text,
    x = 0,
    y = 0,
    fontSize = 24,
    fontFamily = 'Inter, system-ui',
    fontWeight = 600,
    textColor = '#FFFFFF',
    highlightColor = '#3B82F6',
    highlightOpacity = 0.3,
    highlightPadding = { x: 8, y: 4 },
    borderRadius = 4,
    textAnchor = 'start'
}) {
    const textWidth = text.length * fontSize * 0.55;
    const bgWidth = textWidth + highlightPadding.x * 2;
    const bgHeight = fontSize + highlightPadding.y * 2;

    let bgX = x - highlightPadding.x;
    if (textAnchor === 'middle') bgX = x - bgWidth / 2;
    else if (textAnchor === 'end') bgX = x - bgWidth + highlightPadding.x;

    return `
        <rect x="${bgX}" y="${y - fontSize - highlightPadding.y}" width="${bgWidth}" height="${bgHeight}" rx="${borderRadius}" fill="${highlightColor}" fill-opacity="${highlightOpacity}"/>
        <text x="${x}" y="${y}" fill="${textColor}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" text-anchor="${textAnchor}">${text}</text>
    `;
}

// ========================================
// UNDERLINE TEXT
// ========================================

export function createUnderlineText({
    text,
    x = 0,
    y = 0,
    fontSize = 24,
    fontFamily = 'Inter, system-ui',
    fontWeight = 600,
    textColor = '#FFFFFF',
    underlineColor = '#3B82F6',
    underlineThickness = 3,
    underlineOffset = 4,
    underlineStyle = 'solid', // 'solid', 'gradient', 'dashed', 'dots'
    textAnchor = 'start'
}) {
    const id = `underline_${Date.now()}`;
    const textWidth = text.length * fontSize * 0.55;

    let lineX = x;
    if (textAnchor === 'middle') lineX = x - textWidth / 2;
    else if (textAnchor === 'end') lineX = x - textWidth;

    const lineY = y + underlineOffset;
    let underline = '';

    switch (underlineStyle) {
        case 'solid':
            underline = `<line x1="${lineX}" y1="${lineY}" x2="${lineX + textWidth}" y2="${lineY}" stroke="${underlineColor}" stroke-width="${underlineThickness}" stroke-linecap="round"/>`;
            break;
        case 'gradient':
            underline = `
                <defs><linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="${underlineColor}" stop-opacity="0"/>
                    <stop offset="50%" stop-color="${underlineColor}"/>
                    <stop offset="100%" stop-color="${underlineColor}" stop-opacity="0"/>
                </linearGradient></defs>
                <line x1="${lineX}" y1="${lineY}" x2="${lineX + textWidth}" y2="${lineY}" stroke="url(#${id})" stroke-width="${underlineThickness}"/>
            `;
            break;
        case 'dashed':
            underline = `<line x1="${lineX}" y1="${lineY}" x2="${lineX + textWidth}" y2="${lineY}" stroke="${underlineColor}" stroke-width="${underlineThickness}" stroke-dasharray="8,4"/>`;
            break;
        case 'dots':
            underline = `<line x1="${lineX}" y1="${lineY}" x2="${lineX + textWidth}" y2="${lineY}" stroke="${underlineColor}" stroke-width="${underlineThickness}" stroke-dasharray="2,6" stroke-linecap="round"/>`;
            break;
    }

    return `
        <text x="${x}" y="${y}" fill="${textColor}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" text-anchor="${textAnchor}">${text}</text>
        ${underline}
    `;
}

// ========================================
// MASKED/PATTERN TEXT
// ========================================

export function createPatternText({
    text,
    x = 0,
    y = 0,
    fontSize = 64,
    fontFamily = 'Inter, system-ui',
    fontWeight = 900,
    pattern = 'stripes', // 'stripes', 'dots', 'gradient'
    patternColors = ['#3B82F6', '#8B5CF6'],
    textAnchor = 'center'
}) {
    const id = `patterntext_${Date.now()}`;
    let patternDef = '';

    switch (pattern) {
        case 'stripes':
            patternDef = `
                <pattern id="${id}" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
                    <rect width="5" height="10" fill="${patternColors[0]}"/>
                    <rect x="5" width="5" height="10" fill="${patternColors[1]}"/>
                </pattern>
            `;
            break;
        case 'dots':
            patternDef = `
                <pattern id="${id}" patternUnits="userSpaceOnUse" width="12" height="12">
                    <rect width="12" height="12" fill="${patternColors[0]}"/>
                    <circle cx="6" cy="6" r="3" fill="${patternColors[1]}"/>
                </pattern>
            `;
            break;
        case 'gradient':
            patternDef = `
                <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
                    ${patternColors.map((c, i) => `<stop offset="${Math.round(i / (patternColors.length - 1) * 100)}%" stop-color="${c}"/>`).join('')}
                </linearGradient>
            `;
            break;
    }

    return `
        <defs>${patternDef}</defs>
        <text x="${x}" y="${y}" fill="url(#${id})" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" text-anchor="${textAnchor}">${text}</text>
    `;
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function adjustBrightness(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

export default {
    createGradientText,
    createGlowText,
    create3DText,
    createOutlinedText,
    createSplitColorText,
    createShadowText,
    createHighlightText,
    createUnderlineText,
    createPatternText
};
