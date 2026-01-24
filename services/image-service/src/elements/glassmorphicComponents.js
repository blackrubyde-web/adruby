/**
 * GLASSMORPHIC COMPONENTS
 * 
 * Premium glass-effect UI components:
 * 
 * - Glass cards with blur
 * - Glass buttons
 * - Glass panels with borders
 * - Glass navigation bars
 * - Glass notification banners
 * - Glass feature cards
 */

// ========================================
// GLASS CARD
// ========================================

export function generateGlassCard({
    x = 50,
    y = 50,
    width = 300,
    height = 200,
    borderRadius = 20,
    bgColor = 'rgba(255,255,255,0.05)',
    borderColor = 'rgba(255,255,255,0.1)',
    borderWidth = 1,
    blur = 20,
    innerGlow = true,
    shadow = true
}) {
    const id = `glass_${Date.now()}`;
    let defs = '';
    let content = '';

    // Blur filter
    defs += `<filter id="${id}_blur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" result="blur"/>
    </filter>`;

    // Shadow
    if (shadow) {
        defs += `<filter id="${id}_shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="rgba(0,0,0,0.3)"/>
        </filter>`;
    }

    // Backdrop blur simulation (background layer)
    content += `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${borderRadius}" fill="${bgColor}" ${shadow ? `filter="url(#${id}_shadow)"` : ''}/>`;

    // Border
    content += `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${borderRadius}" fill="none" stroke="${borderColor}" stroke-width="${borderWidth}"/>`;

    // Inner glow (top edge highlight)
    if (innerGlow) {
        defs += `<linearGradient id="${id}_innerGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.15)"/>
            <stop offset="3%" stop-color="rgba(255,255,255,0.05)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
        </linearGradient>`;
        content += `<rect x="${x + borderWidth}" y="${y + borderWidth}" width="${width - borderWidth * 2}" height="${height - borderWidth * 2}" rx="${borderRadius - borderWidth}" fill="url(#${id}_innerGlow)"/>`;
    }

    return {
        svg: `<defs>${defs}</defs>${content}`,
        bounds: { x, y, width, height }
    };
}

// ========================================
// GLASS BUTTON
// ========================================

export function generateGlassButton({
    x = 50,
    y = 50,
    width = 180,
    height = 50,
    text = 'Get Started',
    textColor = '#FFFFFF',
    fontSize = 16,
    bgColor = 'rgba(59,130,246,0.3)',
    borderColor = 'rgba(59,130,246,0.5)',
    accentColor = '#3B82F6',
    borderRadius = 12,
    glow = true,
    hover = false // if true, show hover state
}) {
    const id = `btn_${Date.now()}`;
    let defs = '';

    // Gradient overlay
    defs += `<linearGradient id="${id}_grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.15)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>`;

    // Glow
    if (glow) {
        defs += `<filter id="${id}_glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur"/>
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.4 0"/>
        </filter>`;
    }

    const glowBg = glow ? `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${borderRadius}" fill="${accentColor}" filter="url(#${id}_glow)"/>` : '';

    return {
        svg: `
            <defs>${defs}</defs>
            ${glowBg}
            <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${borderRadius}" fill="${bgColor}"/>
            <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${borderRadius}" fill="url(#${id}_grad)"/>
            <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${borderRadius}" fill="none" stroke="${borderColor}" stroke-width="1"/>
            <text x="${x + width / 2}" y="${y + height / 2 + fontSize * 0.35}" text-anchor="middle" fill="${textColor}" font-family="Inter, system-ui" font-size="${fontSize}" font-weight="600">${text}</text>
        `,
        bounds: { x, y, width, height }
    };
}

// ========================================
// GLASS PANEL
// ========================================

export function generateGlassPanel({
    x = 50,
    y = 50,
    width = 400,
    height = 300,
    borderRadius = 24,
    header = null, // { text: 'Title', icon: iconObj }
    headerHeight = 60,
    bgOpacity = 0.05,
    borderOpacity = 0.1,
    accentColor = '#3B82F6'
}) {
    const id = `panel_${Date.now()}`;
    let defs = '';
    let content = '';

    // Header gradient
    if (header) {
        defs += `<linearGradient id="${id}_header" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="${accentColor}" stop-opacity="0"/>
        </linearGradient>`;
    }

    // Main panel
    content += `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${borderRadius}" fill="rgba(255,255,255,${bgOpacity})"/>`;
    content += `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${borderRadius}" fill="none" stroke="rgba(255,255,255,${borderOpacity})" stroke-width="1"/>`;

    // Header
    if (header) {
        content += `
            <path d="M${x} ${y + borderRadius} Q${x} ${y} ${x + borderRadius} ${y} L${x + width - borderRadius} ${y} Q${x + width} ${y} ${x + width} ${y + borderRadius} L${x + width} ${y + headerHeight} L${x} ${y + headerHeight} Z" fill="url(#${id}_header)"/>
            <line x1="${x + 20}" y1="${y + headerHeight}" x2="${x + width - 20}" y2="${y + headerHeight}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
            <text x="${x + 24}" y="${y + headerHeight / 2 + 6}" fill="#FFFFFF" font-family="Inter, system-ui" font-size="18" font-weight="600">${header.text}</text>
        `;
    }

    return {
        svg: `${defs ? `<defs>${defs}</defs>` : ''}${content}`,
        bounds: { x, y, width, height },
        contentArea: { x: x + 20, y: y + (header ? headerHeight : 20) + 20, width: width - 40, height: height - (header ? headerHeight : 20) - 40 }
    };
}

// ========================================
// GLASS NOTIFICATION BANNER
// ========================================

export function generateGlassBanner({
    x = 50,
    y = 50,
    width = 400,
    height = 60,
    text = 'Limited time offer!',
    subtext = null,
    icon = null,
    bgColor = 'rgba(139,92,246,0.15)',
    borderColor = 'rgba(139,92,246,0.3)',
    accentColor = '#8B5CF6',
    textColor = '#FFFFFF',
    borderRadius = 12
}) {
    let content = '';

    // Background
    content += `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${borderRadius}" fill="${bgColor}"/>`;
    content += `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${borderRadius}" fill="none" stroke="${borderColor}" stroke-width="1"/>`;

    // Accent bar
    content += `<rect x="${x}" y="${y}" width="4" height="${height}" rx="2" fill="${accentColor}"/>`;

    // Text
    const textX = x + 20;
    if (subtext) {
        content += `<text x="${textX}" y="${y + height * 0.4}" fill="${textColor}" font-family="Inter, system-ui" font-size="14" font-weight="600">${text}</text>`;
        content += `<text x="${textX}" y="${y + height * 0.7}" fill="rgba(255,255,255,0.6)" font-family="Inter, system-ui" font-size="12">${subtext}</text>`;
    } else {
        content += `<text x="${textX}" y="${y + height / 2 + 5}" fill="${textColor}" font-family="Inter, system-ui" font-size="14" font-weight="600">${text}</text>`;
    }

    return { svg: content, bounds: { x, y, width, height } };
}

// ========================================
// GLASS FEATURE CARD
// ========================================

export function generateGlassFeatureCard({
    x = 50,
    y = 50,
    width = 280,
    height = 180,
    title = 'Feature Title',
    description = 'Feature description goes here',
    icon = null,
    iconBgColor = 'rgba(59,130,246,0.2)',
    iconColor = '#3B82F6',
    borderRadius = 20,
    accentPosition = 'top' // 'top', 'left', 'none'
}) {
    const id = `feature_${Date.now()}`;
    let content = '';
    let defs = '';

    // Top shine gradient
    defs += `<linearGradient id="${id}_shine" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.1)"/>
        <stop offset="50%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>`;

    // Card background
    content += `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${borderRadius}" fill="rgba(255,255,255,0.03)"/>`;
    content += `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${borderRadius}" fill="url(#${id}_shine)"/>`;
    content += `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${borderRadius}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`;

    // Accent
    if (accentPosition === 'top') {
        content += `<rect x="${x + width * 0.3}" y="${y}" width="${width * 0.4}" height="3" rx="1.5" fill="${iconColor}" fill-opacity="0.5"/>`;
    } else if (accentPosition === 'left') {
        content += `<rect x="${x}" y="${y + height * 0.2}" width="3" height="${height * 0.6}" rx="1.5" fill="${iconColor}" fill-opacity="0.5"/>`;
    }

    // Icon background
    const iconSize = 48;
    const iconX = x + 24;
    const iconY = y + 24;
    content += `<circle cx="${iconX + iconSize / 2}" cy="${iconY + iconSize / 2}" r="${iconSize / 2}" fill="${iconBgColor}"/>`;

    // Title
    content += `<text x="${x + 24}" y="${y + 100}" fill="#FFFFFF" font-family="Inter, system-ui" font-size="18" font-weight="600">${title}</text>`;

    // Description
    content += `<text x="${x + 24}" y="${y + 125}" fill="rgba(255,255,255,0.6)" font-family="Inter, system-ui" font-size="13">${description}</text>`;

    return { svg: `<defs>${defs}</defs>${content}`, bounds: { x, y, width, height } };
}

// ========================================
// GLASS TOOLTIP
// ========================================

export function generateGlassTooltip({
    x = 100,
    y = 100,
    text = 'Tooltip text',
    width = null,
    position = 'top', // 'top', 'bottom', 'left', 'right'
    bgColor = 'rgba(0,0,0,0.8)',
    textColor = '#FFFFFF',
    fontSize = 12,
    padding = 10,
    arrowSize = 8
}) {
    const textWidth = text.length * fontSize * 0.55;
    const w = width || textWidth + padding * 2;
    const h = fontSize + padding * 2;

    let arrowPath = '';
    let rectX = x, rectY = y;

    switch (position) {
        case 'top':
            rectY = y - h - arrowSize;
            arrowPath = `M${x - arrowSize} ${y - arrowSize} L${x} ${y} L${x + arrowSize} ${y - arrowSize}`;
            break;
        case 'bottom':
            rectY = y + arrowSize;
            arrowPath = `M${x - arrowSize} ${y + arrowSize} L${x} ${y} L${x + arrowSize} ${y + arrowSize}`;
            break;
    }

    return {
        svg: `
            <rect x="${rectX - w / 2}" y="${rectY}" width="${w}" height="${h}" rx="6" fill="${bgColor}"/>
            <path d="${arrowPath}" fill="${bgColor}"/>
            <text x="${rectX}" y="${rectY + h / 2 + fontSize * 0.35}" text-anchor="middle" fill="${textColor}" font-family="Inter, system-ui" font-size="${fontSize}">${text}</text>
        `,
        bounds: { x: rectX - w / 2, y: rectY, width: w, height: h + arrowSize }
    };
}

export default {
    generateGlassCard,
    generateGlassButton,
    generateGlassPanel,
    generateGlassBanner,
    generateGlassFeatureCard,
    generateGlassTooltip
};
