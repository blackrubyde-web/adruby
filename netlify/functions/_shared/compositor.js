/**
 * VECTOR COMPOSITOR - EMBEDDED FONT VERSION
 * 
 * Layer 4: Professional typography with EMBEDDED fonts.
 * Uses base64-encoded Inter font for serverless compatibility.
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load and encode font at module load time
let INTER_FONT_BASE64 = '';
try {
  const fontPath = path.join(__dirname, 'inter-bold.woff2');
  if (fs.existsSync(fontPath)) {
    INTER_FONT_BASE64 = fs.readFileSync(fontPath).toString('base64');
    console.log('[Compositor] ✓ Inter font loaded and encoded');
  } else {
    console.warn('[Compositor] ⚠ Font file not found, text may not render');
  }
} catch (e) {
  console.error('[Compositor] Font load error:', e.message);
}

/**
 * Composite text and graphics onto clean canvas
 */
export async function compositeAd({ cleanCanvasBuffer, coordinates, copy, layoutPlan }) {
  console.log('[Compositor] ✨ Rendering with embedded font...');

  const style = layoutPlan?.style || {};
  const accentColor = style.accentColor || '#FF4757';

  try {
    const headline = coordinates?.headline || { x: 540, y: 100, fontSize: 64 };
    const tagline = coordinates?.tagline;
    const cta = coordinates?.cta || { x: 430, y: 960, width: 220, height: 56 };

    // Build SVG with embedded font
    const svgContent = buildSvgWithEmbeddedFont({
      headline: { ...headline, text: copy.headline },
      tagline: tagline && copy.tagline ? { ...tagline, text: copy.tagline } : null,
      cta: { ...cta, text: copy.cta || 'Shop Now' },
      accentColor,
      fontBase64: INTER_FONT_BASE64
    });

    const svgBuffer = Buffer.from(svgContent);

    // Composite SVG onto canvas
    const result = await sharp(cleanCanvasBuffer)
      .composite([{ input: svgBuffer, top: 0, left: 0 }])
      .png({ quality: 100 })
      .toBuffer();

    console.log('[Compositor] ✅ Ad composed with embedded font');
    return { success: true, buffer: result };
  } catch (error) {
    console.error('[Compositor] ❌ Failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Build SVG with embedded @font-face
 */
function buildSvgWithEmbeddedFont({ headline, tagline, cta, accentColor, fontBase64 }) {
  const escapeText = (text) => {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const ctaCenterX = cta.x + (cta.width || 220) / 2;
  const ctaCenterY = cta.y + (cta.height || 56) / 2 + 7;

  // Font-face with embedded base64 font
  const fontFace = fontBase64 ? `
        @font-face {
            font-family: 'Inter';
            src: url(data:font/woff2;base64,${fontBase64}) format('woff2');
            font-weight: 700;
            font-style: normal;
        }
    ` : '';

  return `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            ${fontFace}
            .headline {
                font-family: 'Inter', Arial, sans-serif;
                font-weight: 700;
                fill: #FFFFFF;
            }
            .tagline {
                font-family: 'Inter', Arial, sans-serif;
                font-weight: 400;
                fill: #CCCCCC;
            }
            .cta-text {
                font-family: 'Inter', Arial, sans-serif;
                font-weight: 600;
                fill: #FFFFFF;
            }
        </style>
        <linearGradient id="ctaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${lightenColor(accentColor, 15)};stop-opacity:1"/>
            <stop offset="100%" style="stop-color:${accentColor};stop-opacity:1"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.5"/>
        </filter>
        <filter id="btnShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="${accentColor}" flood-opacity="0.4"/>
        </filter>
    </defs>

    <!-- Headline -->
    <text 
        class="headline"
        x="${headline.x || 540}" 
        y="${headline.y || 100}" 
        font-size="${headline.fontSize || 64}px"
        text-anchor="middle"
        filter="url(#shadow)"
    >${escapeText(headline.text)}</text>

    ${tagline ? `
    <!-- Tagline -->
    <text 
        class="tagline"
        x="${tagline.x || 540}" 
        y="${tagline.y || 170}" 
        font-size="${tagline.fontSize || 24}px"
        text-anchor="middle"
    >${escapeText(tagline.text)}</text>
    ` : ''}

    <!-- CTA Button -->
    <rect 
        x="${cta.x || 430}" 
        y="${cta.y || 960}" 
        width="${cta.width || 220}" 
        height="${cta.height || 56}" 
        rx="${cta.borderRadius || 28}"
        fill="url(#ctaGrad)"
        filter="url(#btnShadow)"
    />
    <text 
        class="cta-text"
        x="${ctaCenterX}" 
        y="${ctaCenterY}" 
        font-size="18px"
        text-anchor="middle"
    >${escapeText(cta.text)}</text>
</svg>`;
}

function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

export default { compositeAd };
