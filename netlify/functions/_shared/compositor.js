/**
 * VECTOR COMPOSITOR
 * 
 * Layer 4 of the Pipeline
 * Renders SHARP text, buttons, and graphics using SVG/Canvas.
 * This is what makes the text look professional - not AI-generated.
 */

import sharp from 'sharp';

/**
 * Composite text and graphics onto clean canvas
 * Uses SVG for 100% sharp text rendering
 * @returns {Buffer} Final ad with sharp text overlay
 */
export async function compositeAd({
    cleanCanvasBuffer,
    coordinates,
    copy,
    layoutPlan
}) {
    console.log('[Compositor] ✨ Rendering sharp text overlay...');

    const accentColor = layoutPlan?.style?.accentColor || coordinates?.cta?.backgroundColor || '#FF4757';

    // Build SVG overlay with real fonts
    const svgOverlay = buildSVGOverlay(coordinates, copy, accentColor);

    try {
        // Convert SVG to buffer
        const svgBuffer = Buffer.from(svgOverlay);

        // Composite SVG onto clean canvas
        const result = await sharp(cleanCanvasBuffer)
            .composite([{
                input: svgBuffer,
                top: 0,
                left: 0
            }])
            .png({ quality: 100 })
            .toBuffer();

        console.log('[Compositor] ✅ Final ad composed successfully');
        return {
            success: true,
            buffer: result
        };
    } catch (error) {
        console.error('[Compositor] ❌ Failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Build SVG overlay with all text elements
 */
function buildSVGOverlay(coordinates, copy, accentColor) {
    const headline = coordinates?.headline || { x: 540, y: 100, fontSize: 64 };
    const tagline = coordinates?.tagline;
    const cta = coordinates?.cta || { x: 440, y: 960, width: 200, height: 56 };

    // Calculate CTA text position (centered in button)
    const ctaTextX = cta.x + (cta.width / 2);
    const ctaTextY = cta.y + (cta.height / 2) + 6; // +6 for vertical centering

    // Escape text for SVG
    const escapeText = (text) => {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    };

    const svg = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&amp;display=swap');
      
      .headline {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-weight: 700;
        fill: ${headline.color || '#FFFFFF'};
        text-anchor: middle;
      }
      
      .tagline {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-weight: 400;
        fill: ${tagline?.color || '#CCCCCC'};
        text-anchor: middle;
      }
      
      .cta-button {
        fill: ${accentColor};
      }
      
      .cta-text {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-weight: 600;
        fill: ${cta.textColor || '#FFFFFF'};
        text-anchor: middle;
      }
    </style>
    
    <!-- Drop shadow filter for text -->
    <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>
  
  <!-- Headline -->
  <text 
    class="headline" 
    x="${headline.x}" 
    y="${headline.y}" 
    font-size="${headline.fontSize || 64}px"
    filter="url(#textShadow)"
  >${escapeText(copy.headline)}</text>
  
  ${tagline && copy.tagline ? `
  <!-- Tagline -->
  <text 
    class="tagline" 
    x="${tagline.x}" 
    y="${tagline.y}" 
    font-size="${tagline.fontSize || 24}px"
  >${escapeText(copy.tagline)}</text>
  ` : ''}
  
  <!-- CTA Button -->
  <rect 
    class="cta-button"
    x="${cta.x}" 
    y="${cta.y}" 
    width="${cta.width}" 
    height="${cta.height}" 
    rx="${cta.borderRadius || 28}"
    ry="${cta.borderRadius || 28}"
  />
  
  <!-- CTA Text -->
  <text 
    class="cta-text"
    x="${ctaTextX}" 
    y="${ctaTextY}" 
    font-size="${cta.fontSize || 18}px"
  >${escapeText(copy.cta)}</text>
  
</svg>`;

    return svg;
}

/**
 * Add feature arrows pointing to product
 */
export function addFeatureArrows(svgContent, arrows) {
    if (!arrows || arrows.length === 0) return svgContent;

    const arrowsSvg = arrows.map(arrow => `
        <line 
            x1="${arrow.startX}" y1="${arrow.startY}" 
            x2="${arrow.endX}" y2="${arrow.endY}" 
            stroke="white" stroke-width="2" stroke-linecap="round"
        />
        <circle cx="${arrow.endX}" cy="${arrow.endY}" r="4" fill="white"/>
        <text x="${arrow.startX}" y="${arrow.startY - 10}" 
              font-family="Inter, sans-serif" font-size="14" fill="white" text-anchor="middle">
            ${arrow.label}
        </text>
    `).join('\n');

    // Insert arrows before closing </svg>
    return svgContent.replace('</svg>', `${arrowsSvg}\n</svg>`);
}

export default { compositeAd, addFeatureArrows };
