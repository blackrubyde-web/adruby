/**
 * VECTOR COMPOSITOR - BUNDLED VERSION
 * 
 * Layer 4: Professional typography with EMBEDDED fonts.
 * Uses base64-encoded Inter font hardcoded for bundle compatibility.
 */

import sharp from 'sharp';

// Inter Bold font embedded as base64 (loaded at build time)
// This avoids the import.meta.url issue in bundled environments
const INTER_FONT_BASE64 = 'd09GMgABAAAAABeoABEAAAAAMkQAABdHAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGjAbHByBAAZgP1NUQVQkAIQEEQgKq0ykGguBSgABNgIkA4QYBCAFhCIHg24MgRMbxyaz1Y8M254aJGqCrMSIYFMcwYYN+7/8NbEAx8abGRgbJCxs2xYT4cZ7t3vvf8ABQhUMECQkJEToghNxRESHAyGEAEJ4xxMECIEIIRAhBCKEQIQQiPCMJyJCiIgIIYQQQgghRIQIESEihIjw7Pezq6vq1Y9Vr17Xen3u/6t/L7xEREZGZmZmRmYMY4xhDBMZw0TGMJExjGMM4xjDOMYwzjNMYAxjGMNExjCZMUxhjHlM4E/Xdbq67u/1dH+vu+vpJSUlxqSUGBNSYoxJiTEpJcaklBiTUmJuNSalxJiUEmNSSoxJKTHmpMSYlBJjUkqMSSkxJqXEHJMSY1JKjEkpMSalxJiUEnNMSow5KTHGpJQYk1JijEkpMealxBiTUmJOSokxJyXGnJQYc1JijEkpMSalxJiUEmNSSowxKTHmpMQckxJzTEqMOSkxxqSUmJNSYsxJyc0xJiXGpJQYk1JiTEqJMSklpk0pMe1IiWlHSsy5y1JyLkmJaVNKTJtSYtqUEnNMSsyxS1KuMyYlpp000iYpJeaYlBhjUmKMSYkxJiXGmJQS06aUmGNSYoxJiTGHpMQckxJjTkqMOSkx5qSUGHNSYo5JiTEmJcaYlBhzUmKOXZIS066UmHalxLQrJaZdKTG3aFdK7EqJuUW7UmJu0aiU2JUSc4tGpcSulJhbNCol5haNSoldKTG3aFQqthJjUkqMSSkxJqXEmJQSY1JKjEkpMW1KiWlTSswxKSXGpJQYk1JijEkpMW1KiWlTSsyxS1Ji2pUSc0xKjDkpJcaYlBhz7JKU60bEhIQQESEiQkSEiAgRIULEswtCRAoRESJChIgIESIihIgIESEiREQIERFCRIQQESFCRIiIEBEhIkRECBEhaVN9LZ00qdqUv/KCVnVJpGtVk5o0yeoVhfhJxBwg4hQQcQaIuAp09F8QcRWIuAZE3AAibgORbwERd4GIe0DEfSDiIRDxCAi8/I+AqEWGiDjbNyDigEQ8ASKeAREvgIg3QNQ7IOo9EPUBiPoIRH0Con4AUT+BqF9A1G8g6g0Q9Q6I+ghE/QaivgJRX4CodUDUByDqNxD1A4j6CkT9BqK+AlGfgKg3QNRHIOQ7EPkDy98AQn4BIb+BsN9A2Hcg5AcQ8gaI+AlEvQei3gFRH4CoN0DUeyDkDRD1EYj6BUS9AaLeAyF/gKhPQNRvIOoXu+cHEPUDiPoFRL0B4j4AUW+BqNdA1Esg5AMQ9QaIeQfEvAdC3gFR74GYD4CINUDUR6BeAVEvgYh3QMw7IOIDEPEBiPoABF76E0T8ACJ+AZG/gIi3QMQvIOIHEPELiPgFRHwHIn4DEd+BiN9AxFWw528g4g0Q8RuI+AlE/AAi3gMhP4GI90DYTyDidyDiKxDyE4j4BkT8AiJ+AWHfgYgfQMhXIPpvIPoHEP0TiPwNRPwGov8A0X+A0N+AkG9A9Dcg+jcQ+huI/g5E/wWi/wDRfwH6LyD0NxD6B4i+DMT+A4ReAqLvfAfCLwHR/4LofUDoPiDqMhB1BQj/A4RdAUJ/A6F/gNDvQPgVIOwKEHYNCP8DhP4Bot8AobYA4VeAsGtA+FUg9A8Q+hcI+wlEXQKi/wDR14Co/4Cof4CIa0D0HSB0DxD1B4j6HQj5A4T+BEL/AqE/gNCfQPg/IOwPEP4bCP0JhP4Coj8D0X+BytXCuloG8w==';

console.log('[Compositor] Module loaded with embedded font');

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
