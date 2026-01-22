/**
 * FULL CREATIVE ENGINE
 * 
 * Generates COMPLETE ads from detailed user prompts.
 * Unlike background-only mode, this creates the entire scene
 * including products, mockups, devices, and all visual elements.
 * 
 * Examples:
 * - "MacBook with SaaS dashboard" → Full image with MacBook + dashboard
 * - "Fox plushie with Christmas hat" → Complete product scene
 * - "iPhone showing app UI in coffee shop" → Full lifestyle mockup
 */

import sharp from 'sharp';

// Canvas size
const CANVAS = 1080;

// Text positioning zones (where to NOT place critical elements)
const TEXT_ZONES = {
    headline: {
        top: { y: 40, height: 150 },
        bottom: { y: CANVAS - 200, height: 150 },
    },
    cta: {
        bottom: { y: CANVAS - 120, height: 80 },
    },
    badge: {
        topRight: { x: CANVAS - 200, y: 30, width: 180, height: 50 },
    },
};

/**
 * Build optimized prompt for DALL-E that creates complete ad scene
 * Includes user's vision + Meta ad quality requirements + text zone clearance
 * 
 * CRITICAL: We explicitly tell DALL-E to NOT generate any text because
 * we apply our own SVG text overlay afterward. Double text is the #1 issue.
 */
export function buildFullCreativePrompt(userPrompt, options = {}) {
    const {
        headline,
        subheadline,
        cta,
        textPosition = 'bottom', // 'top', 'bottom', 'left'
    } = options;

    // Determine where to leave space for our text overlay
    const textZoneInstructions = textPosition === 'top'
        ? 'Leave the TOP 20% of the image empty or with a simple solid color/gradient - this is reserved for text overlay.'
        : 'Leave the BOTTOM 25% of the image empty or with a simple solid color/gradient - this is reserved for text overlay.';

    const prompt = `
CREATE A PROFESSIONAL ADVERTISEMENT IMAGE (NO TEXT!)

=== USER'S CREATIVE VISION ===
${userPrompt}
=== END VISION ===

TECHNICAL SPECIFICATIONS:
- Output: ${CANVAS}x${CANVAS}px square image
- Style: Ultra-premium advertising quality
- Lighting: Cinematic, professional
- Focus: Sharp on main subject with subtle depth of field

LAYOUT REQUIREMENTS:
${textZoneInstructions}
The reserved zone should have simple colors (dark, light, or gradient) for text readability.

QUALITY STANDARDS:
- Premium magazine advertisement quality
- Professional color grading
- Clean, sophisticated composition
- High-end product photography feel

⚠️ ABSOLUTE RULES - MUST FOLLOW:
1. ZERO TEXT - Do NOT include any words, letters, numbers, logos, or typography
2. ZERO BUTTONS - Do NOT draw any buttons, CTAs, or UI elements
3. ZERO WATERMARKS - No signatures, stamps, or marks
4. The image should be TEXT-FREE so we can add our own text overlay

This is a BACKGROUND IMAGE for an ad - all text will be added as a separate layer.
Generate ONLY the visual scene, NO typography whatsoever.
`;

    return prompt.trim();
}

/**
 * Generate text overlay SVG for full creative mode
 * Simpler than product mode - just headline, subheadline, CTA
 */
export function generateFullCreativeOverlay(config) {
    const {
        headline,
        subheadline,
        cta,
        textPosition = 'bottom',
        palette = 'auto', // 'light', 'dark', 'auto'
    } = config;

    // Determine colors based on palette (assuming dark background by default)
    const textPrimary = palette === 'light' ? '#1A1A1A' : '#FFFFFF';
    const textSecondary = palette === 'light' ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.85)';
    const ctaBg = '#FF4444';
    const ctaText = '#FFFFFF';

    // Position calculations
    let headlineY, subheadlineY, ctaY;

    if (textPosition === 'top') {
        headlineY = 80;
        subheadlineY = headlineY + 70;
        ctaY = subheadlineY + 80;
    } else {
        // Bottom position (default)
        headlineY = CANVAS - 180;
        subheadlineY = headlineY + 50;
        ctaY = CANVAS - 65;
    }

    // Font scaling based on headline length
    let headlineFontSize = 72;
    if (headline && headline.length > 25) headlineFontSize = 60;
    if (headline && headline.length > 35) headlineFontSize = 48;

    let svg = `<svg width="${CANVAS}" height="${CANVAS}" xmlns="http://www.w3.org/2000/svg">
<defs>
    <!-- Text shadow for readability -->
    <filter id="text-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.6)"/>
    </filter>
    <filter id="heavy-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.8)"/>
        <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="rgba(0,0,0,0.4)"/>
    </filter>
    <!-- CTA glow -->
    <filter id="cta-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6"/>
        <feFlood flood-color="${ctaBg}" flood-opacity="0.4"/>
        <feComposite operator="in"/>
        <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
    </filter>
</defs>
`;

    // Semi-transparent gradient overlay for text readability
    if (textPosition === 'bottom') {
        svg += `
<!-- Bottom gradient for text readability -->
<linearGradient id="bottom-fade" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" style="stop-color:rgba(0,0,0,0)"/>
    <stop offset="60%" style="stop-color:rgba(0,0,0,0)"/>
    <stop offset="100%" style="stop-color:rgba(0,0,0,0.7)"/>
</linearGradient>
<rect x="0" y="0" width="${CANVAS}" height="${CANVAS}" fill="url(#bottom-fade)"/>
`;
    } else if (textPosition === 'top') {
        svg += `
<!-- Top gradient for text readability -->
<linearGradient id="top-fade" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" style="stop-color:rgba(0,0,0,0.7)"/>
    <stop offset="40%" style="stop-color:rgba(0,0,0,0)"/>
    <stop offset="100%" style="stop-color:rgba(0,0,0,0)"/>
</linearGradient>
<rect x="0" y="0" width="${CANVAS}" height="${CANVAS}" fill="url(#top-fade)"/>
`;
    }

    // Headline
    if (headline) {
        svg += `
<!-- Headline -->
<text x="${CANVAS / 2}" y="${headlineY}" 
      font-family="Arial, Helvetica, sans-serif" 
      font-size="${headlineFontSize}" font-weight="800" 
      fill="${textPrimary}" text-anchor="middle"
      filter="url(#heavy-shadow)">${escapeXml(headline)}</text>
`;
    }

    // Subheadline
    if (subheadline) {
        // Word wrap for long subheadlines
        const words = subheadline.split(' ');
        const maxCharsPerLine = 45;
        let lines = [];
        let currentLine = '';

        words.forEach(word => {
            if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
                currentLine = (currentLine + ' ' + word).trim();
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        });
        if (currentLine) lines.push(currentLine);

        lines.slice(0, 2).forEach((line, i) => {
            svg += `
<text x="${CANVAS / 2}" y="${subheadlineY + (i * 28)}" 
      font-family="Arial, Helvetica, sans-serif" 
      font-size="24" font-weight="500" 
      fill="${textSecondary}" text-anchor="middle"
      filter="url(#text-shadow)">${escapeXml(line)}</text>
`;
        });
    }

    // CTA Button
    if (cta) {
        const ctaWidth = Math.max(200, cta.length * 18 + 60);
        const ctaX = (CANVAS - ctaWidth) / 2;
        const ctaHeight = 56;

        svg += `
<!-- CTA Button -->
<rect x="${ctaX}" y="${ctaY}" width="${ctaWidth}" height="${ctaHeight}" 
      rx="${ctaHeight / 2}" fill="${ctaBg}" filter="url(#cta-glow)"/>
<rect x="${ctaX}" y="${ctaY}" width="${ctaWidth}" height="${ctaHeight / 2}" 
      rx="${ctaHeight / 2}" fill="rgba(255,255,255,0.15)"/>
<text x="${CANVAS / 2}" y="${ctaY + ctaHeight / 2 + 8}" 
      font-family="Arial, Helvetica, sans-serif" 
      font-size="20" font-weight="700" 
      fill="${ctaText}" text-anchor="middle">${escapeXml(cta)}</text>
`;
    }

    svg += `</svg>`;
    return svg;
}

/**
 * Create complete ad from user's prompt
 * Generates full image + applies text overlay
 */
export async function createFullCreativeAd(config) {
    const {
        imageBuffer, // Already generated full image from DALL-E
        headline,
        subheadline,
        cta,
        textPosition = 'bottom',
    } = config;

    console.log('[FullCreative] Creating complete ad with text overlay...');

    // Generate text overlay SVG
    const overlaySvg = generateFullCreativeOverlay({
        headline,
        subheadline,
        cta,
        textPosition,
        palette: 'dark', // Assume dark for now, could auto-detect
    });

    // Resize base image to exact canvas size
    const resizedImage = await sharp(imageBuffer)
        .resize(CANVAS, CANVAS, { fit: 'cover' })
        .png()
        .toBuffer();

    // Composite text overlay
    const overlayBuffer = Buffer.from(overlaySvg);

    const finalImage = await sharp(resizedImage)
        .composite([
            { input: overlayBuffer, top: 0, left: 0 }
        ])
        .png()
        .toBuffer();

    console.log('[FullCreative] ✅ Complete ad created');

    return {
        buffer: finalImage,
        metadata: {
            mode: 'full_creative',
            textPosition,
            hasHeadline: !!headline,
            hasSubheadline: !!subheadline,
            hasCta: !!cta,
        },
    };
}

/**
 * Detect optimal text position based on prompt content
 */
export function detectTextPosition(userPrompt) {
    const lower = userPrompt.toLowerCase();

    // If user mentions "headline oben" or "text top"
    if (lower.includes('headline oben') || lower.includes('text top') || lower.includes('über dem')) {
        return 'top';
    }

    // Default to bottom
    return 'bottom';
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
        // German umlauts - KEEP these (common in German)
        // äöüÄÖÜß are in \u00C0-\u00FF range
        // Then escape XML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        // Final cleanup - keep only printable Basic Latin, Latin-1 Supplement, and extended Latin
        .replace(/[^\x20-\x7E\xA0-\xFF\u0100-\u017F]/g, '');
}

export default {
    buildFullCreativePrompt,
    generateFullCreativeOverlay,
    createFullCreativeAd,
    detectTextPosition,
    CANVAS,
    TEXT_ZONES,
};
