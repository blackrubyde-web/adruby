/**
 * VECTOR COMPOSITOR - 10/10 VERSION
 * 
 * Layer 4: Professional typography with shadows, glows, and premium effects.
 * Renders 100% sharp text using SVG.
 */

import sharp from 'sharp';

/**
 * Composite text and graphics onto clean canvas
 * Uses SVG for 100% sharp text rendering with premium effects
 */
export async function compositeAd({ cleanCanvasBuffer, coordinates, copy, layoutPlan }) {
  console.log('[Compositor] ✨ Rendering premium text overlay...');

  const style = layoutPlan?.style || {};
  const typography = layoutPlan?.typography || {};
  const features = layoutPlan?.features || {};
  const accentColor = style.accentColor || '#FF4757';
  const useGlow = features.useGlow !== false;
  const useShadows = features.useShadows !== false;

  const svgOverlay = buildPremiumSVG(coordinates, copy, {
    accentColor,
    useGlow,
    useShadows,
    typography,
    mood: style.mood || 'premium'
  });

  try {
    const svgBuffer = Buffer.from(svgOverlay);

    const result = await sharp(cleanCanvasBuffer)
      .composite([{ input: svgBuffer, top: 0, left: 0 }])
      .png({ quality: 100 })
      .toBuffer();

    console.log('[Compositor] ✅ Premium ad composed');
    return { success: true, buffer: result };
  } catch (error) {
    console.error('[Compositor] ❌ Failed:', error.message);
    return { success: false, error: error.message };
  }
}

function buildPremiumSVG(coordinates, copy, options) {
  const { accentColor, useGlow, useShadows, typography, mood } = options;

  const headline = coordinates?.headline || { x: 540, y: 100, fontSize: 64 };
  const tagline = coordinates?.tagline;
  const cta = coordinates?.cta || { x: 430, y: 960, width: 220, height: 56 };

  const ctaTextX = cta.x + (cta.width / 2);
  const ctaTextY = cta.y + (cta.height / 2) + 7;

  const escape = (text) => text ? text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '';

  // Premium headline styling based on mood
  const headlineWeight = typography?.headline?.fontWeight || 700;
  const headlineColor = typography?.headline?.color || '#FFFFFF';
  const headlineTransform = typography?.headline?.transform || 'none';

  // CTA gradient for premium look
  const ctaGradient = mood === 'aggressive'
    ? `<linearGradient id="ctaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
             <stop offset="0%" style="stop-color:${accentColor};stop-opacity:1" />
             <stop offset="100%" style="stop-color:${adjustColor(accentColor, 20)};stop-opacity:1" />
           </linearGradient>`
    : `<linearGradient id="ctaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
             <stop offset="0%" style="stop-color:${adjustColor(accentColor, 15)};stop-opacity:1" />
             <stop offset="100%" style="stop-color:${accentColor};stop-opacity:1" />
           </linearGradient>`;

  return `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${ctaGradient}
    
    <!-- Text shadow for depth -->
    ${useShadows ? `
    <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
    </filter>` : ''}
    
    <!-- Glow effect for gaming/tech -->
    ${useGlow ? `
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>` : ''}
    
    <!-- CTA button shadow -->
    <filter id="buttonShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="${accentColor}" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Headline -->
  <text 
    x="${headline.x}" 
    y="${headline.y}" 
    font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    font-size="${headline.fontSize || 64}px"
    font-weight="${headlineWeight}"
    fill="${headlineColor}"
    text-anchor="middle"
    ${useShadows ? 'filter="url(#textShadow)"' : ''}
    ${headlineTransform === 'uppercase' ? 'text-transform="uppercase"' : ''}
  >${escape(copy.headline)}</text>

  ${tagline && copy.tagline ? `
  <!-- Tagline -->
  <text 
    x="${tagline.x}" 
    y="${tagline.y}" 
    font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    font-size="${tagline.fontSize || 24}px"
    font-weight="400"
    fill="${tagline.color || '#CCCCCC'}"
    text-anchor="middle"
    ${useShadows ? 'filter="url(#softShadow)"' : ''}
  >${escape(copy.tagline)}</text>` : ''}

  <!-- CTA Button with premium styling -->
  <rect 
    x="${cta.x}" 
    y="${cta.y}" 
    width="${cta.width}" 
    height="${cta.height}" 
    rx="${cta.borderRadius || 28}"
    ry="${cta.borderRadius || 28}"
    fill="url(#ctaGrad)"
    filter="url(#buttonShadow)"
  />
  
  <!-- CTA Text -->
  <text 
    x="${ctaTextX}" 
    y="${ctaTextY}" 
    font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    font-size="${cta.fontSize || 18}px"
    font-weight="600"
    fill="#FFFFFF"
    text-anchor="middle"
  >${escape(copy.cta)}</text>
</svg>`;
}

// Adjust color brightness
function adjustColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

export default { compositeAd };
