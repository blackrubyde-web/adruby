/**
 * CLEAN CANVAS GENERATOR - TEMPLATE-BASED
 * 
 * Layer 2: Uses reference-level templates to generate
 * agency-quality Meta 2026 ads with Gemini.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';
import { AD_TEMPLATES } from './adTemplates.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate reference-level ad using templates
 */
export async function generateCleanCanvas({
    productImageBuffer,
    layoutPlan,
    productAnalysis,
    copy,
    userPrompt  // This is the ENHANCED prompt from polishCreativePrompt
}) {
    console.log('[CleanCanvas] 🎨 Generating reference-level ad...');

    const style = layoutPlan?.style || {};
    const accentColor = style.accentColor || '#FF4757';

    const headline = copy?.headline || productAnalysis?.productName || 'Premium Quality';
    const tagline = copy?.tagline || '';
    const cta = copy?.cta || 'Shop Now';

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: { responseModalities: ['image', 'text'] }
    });

    // Build the final prompt
    const finalPrompt = buildFinalPrompt(userPrompt, headline, tagline, cta, accentColor, productAnalysis);

    console.log('[CleanCanvas] Prompt length:', finalPrompt.length, 'chars');

    try {
        const result = await model.generateContent([
            { inlineData: { mimeType: 'image/png', data: productImageBuffer.toString('base64') } },
            { text: finalPrompt }
        ]);

        const candidates = result.response?.candidates;
        if (candidates?.[0]?.content?.parts) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData?.data) {
                    const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
                    const resized = await sharp(imageBuffer).resize(1080, 1080, { fit: 'cover' }).png().toBuffer();

                    console.log('[CleanCanvas] ✅ Reference-level ad generated');
                    return { success: true, buffer: resized, includesText: true };
                }
            }
        }
        throw new Error('No image in response');
    } catch (error) {
        console.error('[CleanCanvas] ❌ Failed:', error.message);
        return createFallbackCanvas(productImageBuffer, layoutPlan);
    }
}

/**
 * Build comprehensive final prompt for Gemini
 */
function buildFinalPrompt(enhancedPrompt, headline, tagline, cta, accentColor, productAnalysis) {
    // If we have an enhanced prompt from GPT-4o, use it with additions
    if (enhancedPrompt && enhancedPrompt.length > 100) {
        return `You are creating a PREMIUM Meta advertisement. Follow these EXACT specifications.

═══════════════════════════════════════════════════════════════
CANVAS: 1080 x 1080 pixels (Instagram/Facebook Square)
═══════════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════════
CREATIVE DIRECTION (FOLLOW EXACTLY):
═══════════════════════════════════════════════════════════════
${enhancedPrompt}

═══════════════════════════════════════════════════════════════
TEXT CONTENT TO RENDER:
═══════════════════════════════════════════════════════════════
HEADLINE: "${headline}"
- Must be PERFECTLY READABLE
- Modern sans-serif font (Inter, SF Pro style)
- Add text shadow for depth: 0 2px 8px rgba(0,0,0,0.5)

${tagline ? `TAGLINE: "${tagline}"
- Smaller, below headline
- Lighter weight, slightly muted color` : ''}

CTA BUTTON: "${cta}"
- Pill-shaped button with rounded corners
- Background: ${accentColor} with subtle gradient
- White bold text
- Add glow effect: 0 0 15px ${accentColor} at 40%
- Add shadow: 0 6px 20px rgba(0,0,0,0.25)
- MUST look premium and clickable

═══════════════════════════════════════════════════════════════
QUALITY REQUIREMENTS (NON-NEGOTIABLE):
═══════════════════════════════════════════════════════════════
- SHARP, CRISP text - NO BLUR
- Professional lighting throughout
- Premium, polished finish
- High contrast for readability
- This should look like a $10,000+ agency ad
- Meta 2026 standard - ready to run immediately

USE THE INPUT IMAGE AS THE PRODUCT - feature it prominently.

OUTPUT: A complete 1080x1080 Meta advertisement.`;
    }

    // Fallback to default hero product template
    return getDefaultHeroPrompt(headline, tagline, cta, accentColor, productAnalysis);
}

/**
 * Default hero product prompt when no enhanced prompt available
 */
function getDefaultHeroPrompt(headline, tagline, cta, accentColor, productAnalysis) {
    return `Create a PREMIUM Meta advertisement (1080x1080 pixels).

This should look like a $10,000 agency ad. Not generic AI art.

═══════════════════════════════════════════════════════════════
LAYOUT SPECIFICATIONS:
═══════════════════════════════════════════════════════════════

BACKGROUND:
- Deep, sophisticated gradient (#0a0a1f top to #1a1a3a bottom)
- Add subtle radial glow at center (${accentColor} at 15% opacity)
- Optional: very subtle particle/dust texture (30 tiny dots, white, 10% opacity)

PRODUCT (from input image):
- Position: CENTER of canvas (540, 500)
- Size: approximately 580px
- Professional studio lighting from top-left (45° angle)
- Subtle reflection below: 25% opacity, slight blur
- Very subtle glow around product edges: ${accentColor} at 15%

HEADLINE: "${headline}"
- Position: TOP CENTER (x: 540, y: 100)
- Font: Bold, modern sans-serif (like Inter or SF Pro)
- Size: 56-64px
- Color: White (#FFFFFF)
- Text shadow: 0 3px 10px rgba(0,0,0,0.5)
- MUST be PERFECTLY SHARP and readable

${tagline ? `TAGLINE: "${tagline}"
- Position: Below headline (x: 540, y: 165)
- Font: Regular weight
- Size: 22-24px
- Color: Light gray (#B0B0B0)` : ''}

CTA BUTTON: "${cta}"
- Position: BOTTOM CENTER (x: 540, y: 970)
- Size: 220px wide × 54px tall
- Shape: Pill (27px border-radius)
- Background: Linear gradient from ${lightenColor(accentColor, 10)} to ${accentColor}
- Text: Bold, 17px, white, centered
- Glow: 0 0 18px ${accentColor} at 45% opacity
- Shadow: 0 6px 20px rgba(0,0,0,0.3)

═══════════════════════════════════════════════════════════════
STYLE: Premium, modern, high-converting Meta 2026 agency standard
═══════════════════════════════════════════════════════════════

CRITICAL: Text must be PERFECTLY SHARP. Not blurry. Not AI-looking.
This is a real Meta ad that will run to millions of people.`;
}

function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

async function createFallbackCanvas(productImageBuffer, layoutPlan) {
    console.log('[CleanCanvas] Using fallback...');
    const bgColor = layoutPlan?.style?.backgroundColor || '#1a1a2e';

    try {
        const gradientSvg = `<svg width="1080" height="1080">
            <defs>
                <radialGradient id="bg" cx="50%" cy="70%" r="80%">
                    <stop offset="0%" style="stop-color:${lightenColor(bgColor, 15)};stop-opacity:1"/>
                    <stop offset="100%" style="stop-color:${bgColor};stop-opacity:1"/>
                </radialGradient>
            </defs>
            <rect width="1080" height="1080" fill="url(#bg)"/>
        </svg>`;

        const background = await sharp(Buffer.from(gradientSvg)).png().toBuffer();
        const product = await sharp(productImageBuffer)
            .resize(550, 550, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png().toBuffer();

        const result = await sharp(background)
            .composite([{ input: product, top: 280, left: 265 }])
            .png().toBuffer();

        return { success: true, buffer: result, isFallback: true, includesText: false };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export default { generateCleanCanvas };
