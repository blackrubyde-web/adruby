/**
 * Dynamic Text Renderer
 * 
 * Renders text and elements based on AI-generated composition instructions.
 * No fixed templates - positions are dynamically determined.
 */

import sharp from 'sharp';

/**
 * Render text overlay from AI composition instructions
 */
export async function renderDynamicOverlay(backgroundBuffer, instructions) {
    console.log('[DynamicRenderer] Rendering overlay with AI instructions...');

    const width = 1080;
    const height = 1080;

    const svg = buildDynamicSvg(instructions, width, height);
    const svgBuffer = Buffer.from(svg);

    return await sharp(backgroundBuffer)
        .composite([{
            input: svgBuffer,
            top: 0,
            left: 0
        }])
        .png({ quality: 100 })
        .toBuffer();
}

/**
 * Build SVG from dynamic instructions
 */
function buildDynamicSvg(instructions, width, height) {
    const escapeXml = (text) => {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    };

    // Convert percentage to pixels
    const px = (percent, max) => Math.round((percent / 100) * max);

    let elements = '';

    // Shadow filter for text
    const needsShadow = instructions.needsShadow !== false;
    const shadowFilter = needsShadow ? 'filter="url(#textShadow)"' : '';

    // Headline
    if (instructions.headline) {
        const h = instructions.headline;
        elements += `
        <text
            x="${px(h.x, width)}"
            y="${px(h.y, height)}"
            font-family="Inter, Arial, sans-serif"
            font-size="${h.fontSize || 48}"
            font-weight="${h.fontWeight || 700}"
            fill="${h.color || '#FFFFFF'}"
            text-anchor="${alignToAnchor(h.alignment)}"
            ${shadowFilter}
        >${escapeXml(h.text)}</text>
        `;
    }

    // Tagline
    if (instructions.tagline) {
        const t = instructions.tagline;
        elements += `
        <text
            x="${px(t.x, width)}"
            y="${px(t.y, height)}"
            font-family="Inter, Arial, sans-serif"
            font-size="${t.fontSize || 22}"
            font-weight="${t.fontWeight || 400}"
            fill="${t.color || 'rgba(255,255,255,0.8)'}"
            text-anchor="${alignToAnchor(t.alignment)}"
            ${shadowFilter}
        >${escapeXml(t.text)}</text>
        `;
    }

    // Feature callouts
    if (instructions.features && instructions.features.length > 0) {
        instructions.features.forEach((f, i) => {
            const x = px(f.x, width);
            const y = px(f.y, height);
            const anchorX = px(f.anchorX || 50, width);
            const anchorY = px(f.anchorY || 50, height);

            // Dotted line to anchor point
            if (f.hasLine) {
                elements += `
                <line
                    x1="${anchorX}" y1="${anchorY}"
                    x2="${x}" y2="${y}"
                    stroke="${instructions.textColor || '#333333'}"
                    stroke-width="1.5"
                    stroke-dasharray="6,4"
                    opacity="0.7"
                />
                `;
            }

            // Marker at anchor
            if (f.hasMarker) {
                elements += `
                <circle cx="${anchorX}" cy="${anchorY}" r="6" fill="${instructions.accentColor || '#27AE60'}"/>
                <circle cx="${anchorX}" cy="${anchorY}" r="3" fill="white"/>
                `;
            }

            // Feature label
            elements += `
            <text
                x="${x}" y="${y + 5}"
                font-family="Inter, Arial, sans-serif"
                font-size="20"
                font-weight="500"
                fill="${instructions.textColor || '#1a1a1a'}"
                text-anchor="${alignToAnchor(f.alignment)}"
            >${escapeXml(f.text)}</text>
            `;
        });
    }

    // Stats
    if (instructions.stats && instructions.stats.length > 0) {
        instructions.stats.forEach((s) => {
            const x = px(s.x, width);
            const y = px(s.y, height);

            // Stat value
            elements += `
            <text
                x="${x}" y="${y}"
                font-family="Inter, Arial, sans-serif"
                font-size="42"
                font-weight="800"
                fill="${instructions.accentColor || '#8B4513'}"
                text-anchor="${alignToAnchor(s.alignment)}"
            >${escapeXml(s.value)}</text>
            `;

            // Stat label
            if (s.label) {
                elements += `
                <text
                    x="${x}" y="${y + 28}"
                    font-family="Inter, Arial, sans-serif"
                    font-size="14"
                    font-weight="500"
                    fill="${instructions.textColor || '#333333'}"
                    text-anchor="${alignToAnchor(s.alignment)}"
                    text-transform="uppercase"
                    letter-spacing="1"
                >${escapeXml(s.label)}</text>
                `;
            }

            // Arrow to product
            if (s.hasArrow && s.arrowTarget) {
                const targetX = px(s.arrowTarget.x, width);
                const targetY = px(s.arrowTarget.y, height);
                const startX = s.alignment === 'start' ? x + 60 : x - 60;
                const midX = (startX + targetX) / 2;

                elements += `
                <path
                    d="M ${startX} ${y + 10} Q ${midX} ${y} ${targetX} ${targetY}"
                    stroke="${instructions.accentColor || '#8B4513'}"
                    stroke-width="2"
                    fill="none"
                    stroke-dasharray="4,3"
                    opacity="0.6"
                />
                <circle cx="${targetX}" cy="${targetY}" r="4" fill="${instructions.accentColor || '#8B4513'}"/>
                `;
            }
        });
    }

    // CTA Button
    if (instructions.cta) {
        const c = instructions.cta;
        const x = px(c.x, width);
        const y = px(c.y, height);
        const buttonWidth = 200;
        const buttonHeight = 50;

        if (c.style === 'button') {
            elements += `
            <rect
                x="${x - buttonWidth / 2}"
                y="${y - buttonHeight / 2}"
                width="${buttonWidth}"
                height="${buttonHeight}"
                rx="${c.borderRadius || 25}"
                fill="${c.backgroundColor || '#FF4757'}"
                filter="url(#ctaGlow)"
            />
            <text
                x="${x}"
                y="${y + 6}"
                font-family="Inter, Arial, sans-serif"
                font-size="${c.fontSize || 18}"
                font-weight="${c.fontWeight || 600}"
                fill="${c.textColor || '#FFFFFF'}"
                text-anchor="middle"
            >${escapeXml(c.text)}</text>
            `;
        } else {
            // Text-only CTA
            elements += `
            <text
                x="${x}"
                y="${y}"
                font-family="Inter, Arial, sans-serif"
                font-size="${c.fontSize || 18}"
                font-weight="${c.fontWeight || 500}"
                fill="${c.textColor || '#FFFFFF'}"
                text-anchor="middle"
                text-decoration="underline"
                ${shadowFilter}
            >${escapeXml(c.text)}</text>
            `;
        }
    }

    const accentColor = instructions.accentColor || instructions.cta?.backgroundColor || '#FF4757';

    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap');
        </style>
        
        <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
        
        <filter id="ctaGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="${accentColor}" flood-opacity="0.4"/>
        </filter>
    </defs>

    ${elements}

</svg>`;
}

/**
 * Convert alignment to SVG text-anchor
 */
function alignToAnchor(alignment) {
    switch (alignment) {
        case 'left':
        case 'start':
            return 'start';
        case 'right':
        case 'end':
            return 'end';
        case 'center':
        default:
            return 'middle';
    }
}

export default { renderDynamicOverlay };
