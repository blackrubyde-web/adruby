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

    // Default colors
    const textColor = colorScheme.text || '#FFFFFF';
    // Use AdRuby red as base if no accent provided
    const ctaBaseColor = colorScheme.accent || '#FF4444';

    // Calculate positions based on layout
    let headlineY, subheadlineY, ctaY;

    if (position === 'top') {
        headlineY = 120;
        subheadlineY = 180;
        ctaY = 240;
    } else { // bottom (default)
        // Moved up slightly for better balance
        headlineY = CANVAS - 200;
        subheadlineY = CANVAS - 140;
        ctaY = CANVAS - 80;
    }

    // Dynamic sizing logic
    let headlineFontSize = 64; // Increased base size
    if (headline && headline.length > 20) headlineFontSize = 52;
    if (headline && headline.length > 30) headlineFontSize = 42;
    if (headline && headline.length > 40) headlineFontSize = 36;

    // Build SVG
    let svg = `<svg width="${CANVAS}" height="${CANVAS}" xmlns="http://www.w3.org/2000/svg">
<defs>
    <!-- Text readable gradient background -->
    <linearGradient id="textBg" x1="0%" y1="${position === 'top' ? '0%' : '60%'}" x2="0%" y2="${position === 'top' ? '40%' : '100%'}">
        <stop offset="0%" style="stop-color:rgba(0,0,0,${position === 'top' ? '0.8' : '0'})"/>
        <stop offset="60%" style="stop-color:rgba(0,0,0,${position === 'top' ? '0.2' : '0.6'})"/>
        <stop offset="100%" style="stop-color:rgba(0,0,0,${position === 'top' ? '0' : '0.9'})"/>
    </linearGradient>
    
    <!-- CTA Button Gradient (Modern Red) -->
    <linearGradient id="ctaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#FF6B6B"/> 
        <stop offset="100%" style="stop-color:#EE5253"/> 
    </linearGradient>

    <!-- Drop Shadows -->
    <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="rgba(0,0,0,0.7)"/>
    </filter>
    <filter id="btnShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="rgba(238, 82, 83, 0.4)"/>
    </filter>
</defs>

<!-- Gradient overlay -->
<rect x="0" y="${position === 'top' ? '0' : CANVAS * 0.5}" width="${CANVAS}" height="${position === 'top' ? CANVAS * 0.5 : CANVAS * 0.5}" fill="url(#textBg)"/>
`;

    // Use simplest font stack - Netlify has limited font support
    const fontStack = "Arial, Helvetica, sans-serif";

    // Headline
    if (headline) {
        svg += `
<text x="${CANVAS / 2}" y="${headlineY}" 
    font-family="${fontStack}" 
    font-size="${headlineFontSize}" 
    font-weight="900" 
    fill="${textColor}" 
    text-anchor="middle"
    filter="url(#textShadow)"
    letter-spacing="-1">${escapeXml(headline)}</text>`;
    }

    // Subheadline
    if (subheadline) {
        svg += `
<text x="${CANVAS / 2}" y="${subheadlineY}" 
    font-family="${fontStack}" 
    font-size="28" 
    font-weight="500" 
    fill="${textColor}" 
    opacity="0.9"
    text-anchor="middle"
    filter="url(#textShadow)">${escapeXml(subheadline)}</text>`;
    }

    // CTA Button (Modern Pill)
    if (cta) {
        // Calculate dynamic width based on text
        const charWidth = 16;
        const padding = 80;
        const ctaWidth = Math.max(220, (cta.length * charWidth) + padding);
        const ctaX = (CANVAS - ctaWidth) / 2;
        const ctaHeight = 64;
        const ctaRadius = 32;

        svg += `
<g filter="url(#btnShadow)">
    <rect x="${ctaX}" y="${ctaY}" width="${ctaWidth}" height="${ctaHeight}" rx="${ctaRadius}" fill="url(#ctaGradient)"/>
    <!-- Button Gloss Highlight -->
    <rect x="${ctaX + 10}" y="${ctaY + 2}" width="${ctaWidth - 20}" height="${ctaHeight / 2}" rx="${ctaRadius}" fill="white" opacity="0.15"/>
</g>
<text x="${CANVAS / 2}" y="${ctaY + 44}" 
    font-family="${fontStack}" 
    font-size="24" 
    font-weight="bold" 
    fill="#FFFFFF" 
    text-anchor="middle"
    letter-spacing="0.5">${escapeXml(cta.toUpperCase())}</text>`;
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
        .replace(/[\u2000-\u200F]/g, '')  // Zero width chars
        .replace(/[\u2028-\u202F]/g, '')  // Line separators
        .replace(/\uFEFF/g, '')           // Byte order mark
        .replace(/[\uE000-\uF8FF]/g, '')  // Private use area (often icons that fail)
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
        // Final cleanup - keep only printable Basic Latin, Latin-1 Supplement, and some extended Latin
        // This is aggressive but ensures no "tofu" (rectangles)
        .replace(/[^\x20-\x7E\xA0-\xFF\u0100-\u017F\u00C0-\u00FF]/g, '');
}

export default {
    generateTextOverlaySvg,
    applyTextOverlay,
    CANVAS
};
