/**
 * VECTOR COMPOSITOR - FIXED VERSION
 * 
 * Layer 4: Professional typography that works on serverless.
 * Uses sharp's text rendering with system-fallback fonts.
 */

import sharp from 'sharp';

/**
 * Composite text and graphics onto clean canvas
 * Uses sharp's native text rendering (works without fontconfig)
 */
export async function compositeAd({ cleanCanvasBuffer, coordinates, copy, layoutPlan }) {
  console.log('[Compositor] ✨ Rendering text overlay...');

  const style = layoutPlan?.style || {};
  const accentColor = style.accentColor || '#FF4757';

  try {
    const headline = coordinates?.headline || { x: 540, y: 100, fontSize: 64 };
    const tagline = coordinates?.tagline;
    const cta = coordinates?.cta || { x: 430, y: 960, width: 220, height: 56 };

    // Create text overlays using sharp's built-in text rendering
    const overlays = [];

    // Headline - using sharp's text method
    if (copy.headline) {
      const headlineSvg = createTextSvg({
        text: copy.headline,
        fontSize: headline.fontSize || 64,
        fontWeight: 700,
        color: '#FFFFFF',
        width: 900,
        height: 100,
        align: 'center'
      });
      overlays.push({
        input: Buffer.from(headlineSvg),
        top: Math.round((headline.y || 100) - 50),
        left: Math.round(540 - 450)
      });
    }

    // Tagline
    if (copy.tagline && tagline) {
      const taglineSvg = createTextSvg({
        text: copy.tagline,
        fontSize: tagline.fontSize || 24,
        fontWeight: 400,
        color: '#CCCCCC',
        width: 800,
        height: 50,
        align: 'center'
      });
      overlays.push({
        input: Buffer.from(taglineSvg),
        top: Math.round((tagline.y || 170) - 20),
        left: Math.round(540 - 400)
      });
    }

    // CTA Button
    const ctaSvg = createCtaSvg({
      text: copy.cta || 'Shop Now',
      width: cta.width || 220,
      height: cta.height || 56,
      color: accentColor,
      borderRadius: cta.borderRadius || 28
    });
    overlays.push({
      input: Buffer.from(ctaSvg),
      top: Math.round(cta.y || 960),
      left: Math.round(cta.x || 430)
    });

    // Composite all overlays
    const result = await sharp(cleanCanvasBuffer)
      .composite(overlays)
      .png({ quality: 100 })
      .toBuffer();

    console.log('[Compositor] ✅ Ad composed successfully');
    return { success: true, buffer: result };
  } catch (error) {
    console.error('[Compositor] ❌ Failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Create text SVG with embedded font styling
 * Uses basic web-safe fonts that work everywhere
 */
function createTextSvg({ text, fontSize, fontWeight, color, width, height, align }) {
  const escapedText = (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const textX = align === 'center' ? width / 2 : 0;
  const textAnchor = align === 'center' ? 'middle' : 'start';

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <style>
            .txt { 
                font-family: Arial, Helvetica, sans-serif;
                font-weight: ${fontWeight};
                fill: ${color};
                font-size: ${fontSize}px;
            }
        </style>
        <text class="txt" x="${textX}" y="${fontSize * 0.8}" text-anchor="${textAnchor}">${escapedText}</text>
    </svg>`;
}

/**
 * Create CTA button SVG
 */
function createCtaSvg({ text, width, height, color, borderRadius }) {
  const escapedText = (text || 'Shop Now')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="btnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:${lightenColor(color, 15)};stop-opacity:1"/>
                <stop offset="100%" style="stop-color:${color};stop-opacity:1"/>
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="${color}" flood-opacity="0.4"/>
            </filter>
        </defs>
        <rect 
            x="0" y="0" 
            width="${width}" height="${height}" 
            rx="${borderRadius}" ry="${borderRadius}"
            fill="url(#btnGrad)"
            filter="url(#shadow)"
        />
        <text 
            x="${width / 2}" 
            y="${height / 2 + 6}" 
            font-family="Arial, Helvetica, sans-serif"
            font-size="18px"
            font-weight="600"
            fill="#FFFFFF"
            text-anchor="middle"
        >${escapedText}</text>
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
