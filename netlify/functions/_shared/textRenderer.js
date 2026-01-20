/**
 * TEXT RENDERER
 * 
 * Reliable text rendering using SVG with embedded fonts.
 * This ensures text is always rendered correctly regardless of server environment.
 */

const CANVAS = 1080;

/**
 * Generate professional text overlay SVG
 * Uses system-safe fonts that work everywhere
 */
export function generateTextOverlaySvg(config) {
    const {
        headline,
        subheadline,
        cta,
        position = 'bottom',
        colorScheme = {}
    } = config;

    const textColor = colorScheme.text || '#FFFFFF';
    const ctaColor = colorScheme.accent || '#FF4444';

    // Calculate positions based on layout
    let headlineY, subheadlineY, ctaY;

    if (position === 'top') {
        headlineY = 120;
        subheadlineY = 180;
        ctaY = 240;
    } else { // bottom (default)
        headlineY = CANVAS - 180;
        subheadlineY = CANVAS - 120;
        ctaY = CANVAS - 60;
    }

    // Dynamic font sizing based on text length
    let headlineFontSize = 56;
    if (headline && headline.length > 20) headlineFontSize = 48;
    if (headline && headline.length > 30) headlineFontSize = 40;
    if (headline && headline.length > 40) headlineFontSize = 34;

    // Build SVG with gradient background for text readability
    let svg = `<svg width="${CANVAS}" height="${CANVAS}" xmlns="http://www.w3.org/2000/svg">
<defs>
    <linearGradient id="textBg" x1="0%" y1="${position === 'top' ? '0%' : '70%'}" x2="0%" y2="${position === 'top' ? '40%' : '100%'}">
        <stop offset="0%" style="stop-color:rgba(0,0,0,${position === 'top' ? '0.7' : '0'})"/>
        <stop offset="100%" style="stop-color:rgba(0,0,0,${position === 'top' ? '0' : '0.8'})"/>
    </linearGradient>
    <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.8)"/>
    </filter>
</defs>

<!-- Gradient overlay for text readability -->
<rect x="0" y="${position === 'top' ? '0' : CANVAS * 0.6}" width="${CANVAS}" height="${position === 'top' ? CANVAS * 0.4 : CANVAS * 0.4}" fill="url(#textBg)"/>
`;

    // Headline
    if (headline) {
        svg += `
<text x="${CANVAS / 2}" y="${headlineY}" 
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" 
    font-size="${headlineFontSize}" 
    font-weight="800" 
    fill="${textColor}" 
    text-anchor="middle"
    filter="url(#textShadow)">${escapeXml(headline)}</text>`;
    }

    // Subheadline
    if (subheadline) {
        svg += `
<text x="${CANVAS / 2}" y="${subheadlineY}" 
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" 
    font-size="22" 
    font-weight="500" 
    fill="${textColor}" 
    opacity="0.85"
    text-anchor="middle"
    filter="url(#textShadow)">${escapeXml(subheadline)}</text>`;
    }

    // CTA Button
    if (cta) {
        const ctaWidth = Math.max(180, cta.length * 14 + 60);
        const ctaX = (CANVAS - ctaWidth) / 2;
        const ctaHeight = 48;
        const ctaRadius = ctaHeight / 2;

        svg += `
<rect x="${ctaX}" y="${ctaY}" width="${ctaWidth}" height="${ctaHeight}" rx="${ctaRadius}" fill="${ctaColor}"/>
<text x="${CANVAS / 2}" y="${ctaY + ctaHeight / 2 + 6}" 
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" 
    font-size="18" 
    font-weight="700" 
    fill="#FFFFFF" 
    text-anchor="middle">${escapeXml(cta)}</text>`;
    }

    svg += `\n</svg>`;
    return svg;
}

/**
 * Apply text overlay to image buffer using Sharp
 */
export async function applyTextOverlay(imageBuffer, config, sharp) {
    const textSvg = generateTextOverlaySvg(config);

    // Ensure image is correct size
    const resized = await sharp(imageBuffer)
        .resize(CANVAS, CANVAS, { fit: 'cover' })
        .png()
        .toBuffer();

    // Composite text overlay
    const result = await sharp(resized)
        .composite([{
            input: Buffer.from(textSvg),
            top: 0,
            left: 0
        }])
        .png()
        .toBuffer();

    return result;
}

/**
 * Escape XML special characters and sanitize problematic unicode
 * Removes/replaces characters that cause rendering issues (appearing as rectangles)
 */
function escapeXml(str) {
    if (!str) return '';
    return str
        // First sanitize problematic unicode
        .replace(/[\u2800-\u28FF]/g, '')  // Braille patterns (appear as rectangles)
        .replace(/[\u2580-\u259F]/g, '')  // Block elements (appear as rectangles)
        .replace(/[\u2588-\u259F]/g, '')  // Full block and variants
        .replace(/[\uFFF0-\uFFFF]/g, '')  // Specials
        .replace(/[\u0000-\u001F]/g, '')  // Control characters
        .replace(/[\u007F-\u009F]/g, '')  // More control characters
        .replace(/\u200B/g, '')           // Zero-width space
        .replace(/\u200C/g, '')           // Zero-width non-joiner
        .replace(/\u200D/g, '')           // Zero-width joiner
        .replace(/\uFEFF/g, '')           // Byte order mark
        // Smart quotes to regular quotes
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'")
        // Em/en dashes to regular dash
        .replace(/[\u2013\u2014]/g, '-')
        // Ellipsis to three dots
        .replace(/\u2026/g, '...')
        // Then escape XML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        // Final cleanup - remove any remaining non-printable
        .replace(/[^\x20-\x7E\xA0-\xFF\u0100-\u017F\u0400-\u04FF\u4E00-\u9FFF\u3040-\u309F]/g, '');
}

export default {
    generateTextOverlaySvg,
    applyTextOverlay,
    CANVAS
};
