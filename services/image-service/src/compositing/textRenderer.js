/**
 * Text Renderer - Sharp text overlay with proper fonts
 * 
 * Uses SVG for pixel-perfect text rendering.
 * Fonts are loaded from system (installed via Dockerfile).
 */

import sharp from 'sharp';

/**
 * Render text overlay onto base image
 */
export async function renderTextOverlay({
    baseImage,
    headline,
    tagline,
    cta,
    accentColor = '#FF4757'
}) {
    console.log('[TextRenderer] Rendering text overlay...');

    const svg = buildTextSvg({
        headline,
        tagline,
        cta,
        accentColor
    });

    const svgBuffer = Buffer.from(svg);

    // Composite SVG on top of base image
    const result = await sharp(baseImage)
        .composite([{
            input: svgBuffer,
            top: 0,
            left: 0
        }])
        .png({ quality: 100 })
        .toBuffer();

    console.log('[TextRenderer] ✅ Text overlay complete');
    return result;
}

/**
 * Build SVG with all text elements
 */
function buildTextSvg({ headline, tagline, cta, accentColor }) {
    const escapeXml = (text) => {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    };

    // Calculate CTA button dimensions
    const ctaWidth = 220;
    const ctaHeight = 56;
    const ctaX = (1080 - ctaWidth) / 2;
    const ctaY = 960;
    const ctaTextY = ctaY + ctaHeight / 2 + 7;

    return `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&amp;display=swap');
            
            .headline {
                font-family: 'Inter', Arial, sans-serif;
                font-weight: 700;
                fill: #FFFFFF;
            }
            .tagline {
                font-family: 'Inter', Arial, sans-serif;
                font-weight: 400;
                fill: #B0B0B0;
            }
            .cta-text {
                font-family: 'Inter', Arial, sans-serif;
                font-weight: 600;
                fill: #FFFFFF;
            }
        </style>
        
        <!-- Headline shadow -->
        <filter id="headlineShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000000" flood-opacity="0.5"/>
        </filter>
        
        <!-- CTA button glow -->
        <filter id="ctaGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="${accentColor}" flood-opacity="0.4"/>
        </filter>
        
        <!-- CTA gradient -->
        <linearGradient id="ctaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${lightenColor(accentColor, 15)}"/>
            <stop offset="100%" style="stop-color:${accentColor}"/>
        </linearGradient>
    </defs>

    <!-- Headline -->
    ${headline ? `
    <text 
        class="headline"
        x="540" 
        y="100" 
        font-size="56"
        text-anchor="middle"
        filter="url(#headlineShadow)"
    >${escapeXml(headline)}</text>
    ` : ''}

    <!-- Tagline -->
    ${tagline ? `
    <text 
        class="tagline"
        x="540" 
        y="160" 
        font-size="24"
        text-anchor="middle"
    >${escapeXml(tagline)}</text>
    ` : ''}

    <!-- CTA Button -->
    ${cta ? `
    <rect 
        x="${ctaX}" 
        y="${ctaY}" 
        width="${ctaWidth}" 
        height="${ctaHeight}" 
        rx="28"
        fill="url(#ctaGradient)"
        filter="url(#ctaGlow)"
    />
    <text 
        class="cta-text"
        x="540" 
        y="${ctaTextY}" 
        font-size="18"
        text-anchor="middle"
    >${escapeXml(cta)}</text>
    ` : ''}

</svg>`;
}

/**
 * Lighten a hex color by percentage
 */
function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

export default { renderTextOverlay };
