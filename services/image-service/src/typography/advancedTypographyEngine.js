/**
 * ADVANCED TYPOGRAPHY ENGINE
 * 
 * Professional-grade text rendering with:
 * - Dynamic text sizing and wrapping
 * - Gradient text effects
 * - 3D text shadows
 * - Outlined text
 * - Animated text hints
 * - Multi-line handling
 * - Responsive font scaling
 * - Premium typographic treatments
 */

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;

// Font stacks
const FONT_STACKS = {
    headline: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    body: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    accent: "'SF Pro Display', system-ui, sans-serif",
    mono: "'SF Mono', 'Fira Code', monospace"
};

// ========================================
// HEADLINE RENDERING
// ========================================

/**
 * Create premium headline with all effects
 */
export function createPremiumHeadline({
    text,
    x = CANVAS_WIDTH / 2,
    y = 100,
    maxWidth = CANVAS_WIDTH * 0.85,
    fontSize = 56,
    fontWeight = 800,
    color = '#FFFFFF',
    align = 'center',
    letterSpacing = -1,
    lineHeight = 1.15,
    effects = {}
}) {
    // Word wrap for long text
    const lines = wrapText(text, maxWidth, fontSize);
    const totalHeight = lines.length * fontSize * lineHeight;

    let defs = '';
    let content = '';

    // Build effect definitions
    if (effects.gradient) {
        defs += `
        <linearGradient id="headline_gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            ${effects.gradient.colors.map((c, i) =>
            `<stop offset="${i * 100 / (effects.gradient.colors.length - 1)}%" style="stop-color:${c}"/>`
        ).join('')}
        </linearGradient>`;
        color = 'url(#headline_gradient)';
    }

    if (effects.shadow !== false) {
        defs += createTextShadowFilter('headline_shadow', effects.shadow || {});
    }

    if (effects.glow) {
        defs += createTextGlowFilter('headline_glow', effects.glow);
    }

    if (effects.outline) {
        defs += `
        <filter id="headline_outline">
            <feMorphology in="SourceAlpha" operator="dilate" radius="${effects.outline.width || 2}"/>
            <feFlood flood-color="${effects.outline.color || '#000000'}"/>
            <feComposite in2="SourceAlpha" operator="in"/>
            <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>`;
    }

    // Render each line
    lines.forEach((line, i) => {
        const lineY = y + i * fontSize * lineHeight;
        const anchor = align === 'center' ? 'middle' : (align === 'right' ? 'end' : 'start');
        const lineX = align === 'center' ? x : (align === 'right' ? x + maxWidth / 2 : x - maxWidth / 2);

        let filterAttr = '';
        if (effects.shadow !== false) filterAttr = 'filter="url(#headline_shadow)"';
        if (effects.outline) filterAttr = 'filter="url(#headline_outline)"';
        if (effects.glow) filterAttr += ' filter="url(#headline_glow)"';

        content += `
        <text x="${lineX}" y="${lineY}" 
              text-anchor="${anchor}" fill="${color}"
              font-family="${FONT_STACKS.headline}"
              font-size="${fontSize}" font-weight="${fontWeight}"
              letter-spacing="${letterSpacing}"
              ${filterAttr}>
            ${escapeXml(line)}
        </text>`;
    });

    return { defs, content, height: totalHeight };
}

/**
 * Create text shadow filter
 */
function createTextShadowFilter(id, options = {}) {
    const blur = options.blur || 10;
    const opacity = options.opacity || 0.8;
    const dx = options.dx || 0;
    const dy = options.dy || 4;
    const color = options.color || '#000000';

    return `
    <filter id="${id}" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="${dx}" dy="${dy}" stdDeviation="${blur}" 
                      flood-color="${color}" flood-opacity="${opacity}"/>
    </filter>`;
}

/**
 * Create text glow filter
 */
function createTextGlowFilter(id, options = {}) {
    const blur = options.blur || 15;
    const color = options.color || '#FFFFFF';
    const opacity = options.opacity || 0.5;

    return `
    <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="${blur}" result="blur"/>
        <feFlood flood-color="${color}" flood-opacity="${opacity}"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
    </filter>`;
}

// ========================================
// TAGLINE RENDERING
// ========================================

/**
 * Create premium tagline
 */
export function createPremiumTagline({
    text,
    x = CANVAS_WIDTH / 2,
    y = 180,
    maxWidth = CANVAS_WIDTH * 0.75,
    fontSize = 24,
    fontWeight = 400,
    color = 'rgba(255,255,255,0.8)',
    align = 'center',
    letterSpacing = 0.3,
    style = 'normal'    // normal, italic, caps, spaced
}) {
    if (!text) return { defs: '', content: '', height: 0 };

    let textStyle = '';
    let textTransform = '';
    let adjustedSpacing = letterSpacing;

    switch (style) {
        case 'italic':
            textStyle = 'font-style="italic"';
            break;
        case 'caps':
            textTransform = 'text-transform: uppercase;';
            adjustedSpacing = 2;
            fontSize = fontSize * 0.85;
            break;
        case 'spaced':
            adjustedSpacing = 4;
            break;
    }

    const lines = wrapText(text, maxWidth, fontSize);
    const anchor = align === 'center' ? 'middle' : (align === 'right' ? 'end' : 'start');

    const defs = createTextShadowFilter('tagline_shadow', { blur: 8, opacity: 0.6 });

    const content = lines.map((line, i) => `
    <text x="${x}" y="${y + i * fontSize * 1.4}"
          text-anchor="${anchor}" fill="${color}"
          font-family="${FONT_STACKS.body}"
          font-size="${fontSize}" font-weight="${fontWeight}"
          letter-spacing="${adjustedSpacing}"
          style="${textTransform}"
          ${textStyle}
          filter="url(#tagline_shadow)">
        ${escapeXml(line)}
    </text>`).join('');

    return { defs, content, height: lines.length * fontSize * 1.4 };
}

// ========================================
// CTA BUTTON RENDERING
// ========================================

/**
 * Create premium CTA button
 */
export function createPremiumCTA({
    text,
    x = CANVAS_WIDTH / 2,
    y = CANVAS_HEIGHT * 0.88,
    width = 280,
    height = 64,
    borderRadius = 32,
    fontSize = 20,
    fontWeight = 700,
    backgroundColor = '#FF4757',
    textColor = '#FFFFFF',
    style = 'gradient_glow',    // solid, gradient, gradient_glow, outline, glass
    icon = null,
    iconPosition = 'right'
}) {
    const left = x - width / 2;
    let defs = '';
    let content = '';

    // Lighten color for gradient
    const lighterBg = lightenColor(backgroundColor, 20);
    const textX = icon ? (iconPosition === 'left' ? x + 10 : x - 10) : x;

    switch (style) {
        case 'gradient_glow':
            defs = `
            <linearGradient id="cta_gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${lighterBg}"/>
                <stop offset="100%" style="stop-color:${backgroundColor}"/>
            </linearGradient>
            <filter id="cta_glow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="10" stdDeviation="25" 
                              flood-color="${backgroundColor}" flood-opacity="0.5"/>
            </filter>`;

            content = `
            <g filter="url(#cta_glow)">
                <rect x="${left}" y="${y}" width="${width}" height="${height}" 
                      rx="${borderRadius}" fill="url(#cta_gradient)"/>
                <!-- Top highlight -->
                <rect x="${left + width * 0.15}" y="${y + 6}" 
                      width="${width * 0.7}" height="2" rx="1" 
                      fill="rgba(255,255,255,0.4)"/>
            </g>`;
            break;

        case 'gradient':
            defs = `
            <linearGradient id="cta_gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${lighterBg}"/>
                <stop offset="100%" style="stop-color:${backgroundColor}"/>
            </linearGradient>
            <filter id="cta_shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="8" stdDeviation="15" flood-color="#000" flood-opacity="0.3"/>
            </filter>`;

            content = `
            <g filter="url(#cta_shadow)">
                <rect x="${left}" y="${y}" width="${width}" height="${height}" 
                      rx="${borderRadius}" fill="url(#cta_gradient)"/>
            </g>`;
            break;

        case 'outline':
            defs = `
            <filter id="cta_shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="4" stdDeviation="10" flood-color="${backgroundColor}" flood-opacity="0.3"/>
            </filter>`;

            content = `
            <g filter="url(#cta_shadow)">
                <rect x="${left}" y="${y}" width="${width}" height="${height}" 
                      rx="${borderRadius}" fill="transparent" 
                      stroke="${backgroundColor}" stroke-width="2"/>
            </g>`;
            textColor = backgroundColor;
            break;

        case 'glass':
            defs = `
            <linearGradient id="cta_glass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:rgba(255,255,255,0.25)"/>
                <stop offset="100%" style="stop-color:rgba(255,255,255,0.1)"/>
            </linearGradient>
            <filter id="cta_shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="8" stdDeviation="15" flood-color="#000" flood-opacity="0.2"/>
            </filter>`;

            content = `
            <g filter="url(#cta_shadow)">
                <rect x="${left}" y="${y}" width="${width}" height="${height}" 
                      rx="${borderRadius}" fill="url(#cta_glass)" 
                      stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
            </g>`;
            break;

        default: // solid
            defs = `
            <filter id="cta_shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="8" stdDeviation="15" flood-color="#000" flood-opacity="0.3"/>
            </filter>`;

            content = `
            <g filter="url(#cta_shadow)">
                <rect x="${left}" y="${y}" width="${width}" height="${height}" 
                      rx="${borderRadius}" fill="${backgroundColor}"/>
            </g>`;
    }

    // Add text
    content += `
    <text x="${textX}" y="${y + height / 2 + fontSize * 0.35}"
          text-anchor="middle" fill="${textColor}"
          font-family="${FONT_STACKS.headline}"
          font-size="${fontSize}" font-weight="${fontWeight}"
          letter-spacing="0.5">
        ${escapeXml(text)}
    </text>`;

    // Add icon if provided
    if (icon) {
        const iconX = iconPosition === 'left' ? left + 25 : left + width - 35;
        content += `
        <text x="${iconX}" y="${y + height / 2 + 7}"
              text-anchor="middle" font-size="20">
            ${icon}
        </text>`;
    }

    return { defs, content, height };
}

// ========================================
// FEATURE TEXT RENDERING
// ========================================

/**
 * Create feature callout text
 */
export function createFeatureText({
    icon,
    title,
    description,
    x,
    y,
    maxWidth = 200,
    style = 'card',    // card, minimal, badge
    accentColor = '#FF4757'
}) {
    let content = '';
    let defs = '';

    switch (style) {
        case 'card':
            // Glass card background
            defs = `
            <filter id="feature_shadow_${x}" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.2"/>
            </filter>`;

            content = `
            <g filter="url(#feature_shadow_${x})">
                <rect x="${x}" y="${y}" width="${maxWidth}" height="70" rx="12"
                      fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
            </g>
            <text x="${x + 20}" y="${y + 30}" font-size="24">${icon || '✓'}</text>
            <text x="${x + 55}" y="${y + 28}" fill="#FFFFFF" font-size="14" font-weight="600"
                  font-family="${FONT_STACKS.headline}">${escapeXml(title)}</text>
            <text x="${x + 55}" y="${y + 48}" fill="rgba(255,255,255,0.7)" font-size="12"
                  font-family="${FONT_STACKS.body}">${escapeXml(description || '')}</text>`;
            break;

        case 'minimal':
            content = `
            <g>
                <circle cx="${x + 8}" cy="${y}" r="8" fill="${accentColor}"/>
                <text x="${x + 25}" y="${y + 5}" fill="#FFFFFF" font-size="14" font-weight="500"
                      font-family="${FONT_STACKS.body}">${escapeXml(title)}</text>
            </g>`;
            break;

        case 'badge':
            const badgeWidth = Math.min(maxWidth, title.length * 10 + 50);
            content = `
            <g>
                <rect x="${x}" y="${y - 15}" width="${badgeWidth}" height="30" rx="15"
                      fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
                <text x="${x + 15}" y="${y + 5}" font-size="16">${icon || '✓'}</text>
                <text x="${x + 40}" y="${y + 5}" fill="#FFFFFF" font-size="13" font-weight="500"
                      font-family="${FONT_STACKS.body}">${escapeXml(title)}</text>
            </g>`;
            break;
    }

    return { defs, content };
}

// ========================================
// SOCIAL PROOF RENDERING
// ========================================

/**
 * Create social proof display
 */
export function createSocialProof({
    type = 'rating',    // rating, users, reviews, combined
    rating = 4.9,
    count = '2,500+',
    x = CANVAS_WIDTH / 2,
    y = CANVAS_HEIGHT * 0.82,
    style = 'minimal'
}) {
    let content = '';

    switch (type) {
        case 'rating':
            const stars = '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '');
            content = `
            <text x="${x - 60}" y="${y}" fill="#FFD700" font-size="16">${stars}</text>
            <text x="${x + 40}" y="${y}" fill="rgba(255,255,255,0.7)" font-size="14"
                  font-family="${FONT_STACKS.body}">${rating} (${count} reviews)</text>`;
            break;

        case 'users':
            content = `
            <text x="${x}" y="${y}" text-anchor="middle" fill="rgba(255,255,255,0.7)" 
                  font-size="14" font-family="${FONT_STACKS.body}">
                👥 Trusted by ${count} users
            </text>`;
            break;

        case 'combined':
            content = `
            <g>
                <text x="${x - 100}" y="${y}" fill="#FFD700" font-size="14">★★★★★</text>
                <text x="${x}" y="${y}" fill="rgba(255,255,255,0.8)" font-size="13"
                      font-family="${FONT_STACKS.body}">${rating}</text>
                <text x="${x + 30}" y="${y}" fill="rgba(255,255,255,0.5)" font-size="13"
                      font-family="${FONT_STACKS.body}">|</text>
                <text x="${x + 60}" y="${y}" fill="rgba(255,255,255,0.7)" font-size="13"
                      font-family="${FONT_STACKS.body}">${count} users</text>
            </g>`;
            break;
    }

    return content;
}

// ========================================
// BADGE RENDERING
// ========================================

/**
 * Create trust badge
 */
export function createTrustBadge({
    text,
    icon = '✓',
    x,
    y,
    style = 'pill',    // pill, square, circle, flag
    backgroundColor = 'rgba(255,255,255,0.1)',
    borderColor = 'rgba(255,255,255,0.2)',
    textColor = '#FFFFFF',
    accentColor = '#FF4757'
}) {
    const textWidth = text.length * 8;

    switch (style) {
        case 'pill':
            const pillWidth = textWidth + 50;
            return `
            <g>
                <rect x="${x}" y="${y}" width="${pillWidth}" height="32" rx="16"
                      fill="${backgroundColor}" stroke="${borderColor}" stroke-width="1"/>
                <text x="${x + 15}" y="${y + 21}" font-size="16">${icon}</text>
                <text x="${x + 38}" y="${y + 21}" fill="${textColor}" font-size="13" font-weight="500"
                      font-family="${FONT_STACKS.body}">${escapeXml(text)}</text>
            </g>`;

        case 'square':
            const squareWidth = textWidth + 40;
            return `
            <g>
                <rect x="${x}" y="${y}" width="${squareWidth}" height="36" rx="6"
                      fill="${backgroundColor}" stroke="${borderColor}" stroke-width="1"/>
                <text x="${x + 12}" y="${y + 24}" font-size="16">${icon}</text>
                <text x="${x + 35}" y="${y + 24}" fill="${textColor}" font-size="13" font-weight="500"
                      font-family="${FONT_STACKS.body}">${escapeXml(text)}</text>
            </g>`;

        case 'circle':
            return `
            <g>
                <circle cx="${x + 25}" cy="${y + 25}" r="25"
                        fill="${backgroundColor}" stroke="${borderColor}" stroke-width="1"/>
                <text x="${x + 25}" y="${y + 32}" text-anchor="middle" font-size="22">${icon}</text>
            </g>`;

        case 'flag':
            return `
            <g>
                <polygon points="${x},${y} ${x + textWidth + 50},${y} ${x + textWidth + 60},${y + 18} ${x + textWidth + 50},${y + 36} ${x},${y + 36}"
                         fill="${accentColor}"/>
                <text x="${x + 12}" y="${y + 24}" font-size="16">${icon}</text>
                <text x="${x + 35}" y="${y + 24}" fill="${textColor}" font-size="13" font-weight="600"
                      font-family="${FONT_STACKS.body}">${escapeXml(text)}</text>
            </g>`;
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Wrap text to multiple lines
 */
function wrapText(text, maxWidth, fontSize) {
    if (!text) return [];

    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    // Approximate character width
    const avgCharWidth = fontSize * 0.55;
    const maxChars = Math.floor(maxWidth / avgCharWidth);

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;

        if (testLine.length > maxChars && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}

/**
 * Lighten a hex color
 */
function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

/**
 * Escape XML special characters
 */
function escapeXml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Build complete typography layer
 */
export function buildTypographyLayer({
    headline,
    tagline,
    cta,
    features = [],
    socialProof,
    badges = [],
    designSpecs,
    accentColor
}) {
    const typography = designSpecs?.typography || {};
    let allDefs = '';
    let allContent = '';

    // Headline
    if (headline) {
        const h = createPremiumHeadline({
            text: headline,
            y: Math.round(CANVAS_HEIGHT * (typography.headline?.yPercent || 0.1)) + (typography.headline?.sizePx || 56),
            fontSize: typography.headline?.sizePx || 56,
            fontWeight: typography.headline?.weight || 800,
            effects: {
                shadow: typography.headline?.hasShadow !== false ? {} : false,
                gradient: typography.headline?.hasGradient ? { colors: ['#FFFFFF', accentColor] } : null
            }
        });
        allDefs += h.defs;
        allContent += h.content;
    }

    // Tagline
    if (tagline && typography.tagline?.show !== false) {
        const t = createPremiumTagline({
            text: tagline,
            y: Math.round(CANVAS_HEIGHT * (typography.tagline?.yPercent || 0.18)) + (typography.tagline?.sizePx || 24),
            fontSize: typography.tagline?.sizePx || 24,
            fontWeight: typography.tagline?.weight || 400
        });
        allDefs += t.defs;
        allContent += t.content;
    }

    // CTA
    if (cta) {
        const c = createPremiumCTA({
            text: cta,
            y: Math.round(CANVAS_HEIGHT * (typography.cta?.yPercent || 0.88)),
            width: typography.cta?.widthPx || 280,
            height: typography.cta?.heightPx || 64,
            borderRadius: typography.cta?.borderRadius || 32,
            fontSize: typography.cta?.textSizePx || 20,
            fontWeight: typography.cta?.textWeight || 700,
            backgroundColor: accentColor,
            style: typography.cta?.hasGlow ? 'gradient_glow' :
                typography.cta?.hasGradient ? 'gradient' : 'solid'
        });
        allDefs += c.defs;
        allContent += c.content;
    }

    // Features
    features.forEach((feature, i) => {
        const positions = [
            { x: 50, y: 650 },
            { x: 50, y: 730 },
            { x: CANVAS_WIDTH - 250, y: 650 },
            { x: CANVAS_WIDTH - 250, y: 730 }
        ];
        const pos = positions[i % positions.length];

        const f = createFeatureText({
            icon: feature.icon,
            title: feature.title,
            description: feature.description,
            x: pos.x,
            y: pos.y,
            accentColor
        });
        allDefs += f.defs;
        allContent += f.content;
    });

    // Social proof
    if (socialProof?.show) {
        allContent += createSocialProof({
            type: socialProof.type || 'rating',
            rating: socialProof.rating || 4.9,
            count: socialProof.count || '2,500+',
            y: Math.round(CANVAS_HEIGHT * (typography.cta?.yPercent || 0.88)) - 50
        });
    }

    // Badges
    badges.forEach((badge, i) => {
        const badgePositions = {
            'top_left': { x: 40, y: 40 },
            'top_right': { x: CANVAS_WIDTH - 180, y: 40 },
            'near_cta': { x: CANVAS_WIDTH / 2 + 180, y: CANVAS_HEIGHT * 0.88 }
        };
        const pos = badgePositions[badge.position] || { x: CANVAS_WIDTH - 180, y: 40 + i * 50 };

        allContent += createTrustBadge({
            text: badge.text,
            icon: badge.icon || '✓',
            x: pos.x,
            y: pos.y,
            style: badge.style || 'pill',
            accentColor
        });
    });

    return `
    <svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <defs>${allDefs}</defs>
        ${allContent}
    </svg>`;
}

export default {
    createPremiumHeadline,
    createPremiumTagline,
    createPremiumCTA,
    createFeatureText,
    createSocialProof,
    createTrustBadge,
    buildTypographyLayer,
    FONT_STACKS
};
