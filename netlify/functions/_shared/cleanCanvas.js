/**
 * CLEAN CANVAS GENERATOR - ELITE VERSION
 * 
 * Layer 2: Generates PREMIUM Meta 2026 ads using
 * pixel-precise prompts from the Creative Polisher.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate elite Meta 2026 ad with Gemini
 */
export async function generateCleanCanvas({
    productImageBuffer,
    layoutPlan,
    productAnalysis,
    copy,
    userPrompt  // This is the ENHANCED prompt from polishCreativePrompt
}) {
    console.log('[CleanCanvas] 🎨 Generating ELITE Meta 2026 ad...');

    const style = layoutPlan?.style || {};
    const accentColor = style.accentColor || '#FF4757';

    const headline = copy?.headline || productAnalysis?.productName || 'Premium Quality';
    const tagline = copy?.tagline || '';
    const cta = copy?.cta || 'Shop Now';

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: { responseModalities: ['image', 'text'] }
    });

    // Build the final prompt - use enhanced prompt if available
    const finalPrompt = userPrompt
        ? buildElitePrompt(userPrompt, headline, tagline, cta, accentColor)
        : buildDefaultElitePrompt(style, headline, tagline, cta, accentColor, productAnalysis);

    console.log('[CleanCanvas] Prompt type:', userPrompt ? 'ENHANCED' : 'DEFAULT');

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

                    console.log('[CleanCanvas] ✅ ELITE ad generated');
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
 * Elite prompt using the enhanced creative direction
 */
function buildElitePrompt(enhancedPrompt, headline, tagline, cta, accentColor) {
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
- Use modern sans-serif font (like Inter, SF Pro)
- Add text shadow for depth

${tagline ? `TAGLINE: "${tagline}"
- Smaller, below headline
- Lighter weight, gray or white` : ''}

CTA BUTTON: "${cta}"
- Pill-shaped button
- Background: ${accentColor} (with subtle gradient)
- White bold text
- Add glow/shadow effect to make it POP
- MUST look clickable and premium

═══════════════════════════════════════════════════════════════
QUALITY REQUIREMENTS:
═══════════════════════════════════════════════════════════════
- SHARP, CRISP text with NO blur
- Professional lighting
- Premium, polished look
- High contrast for readability
- Looks like a $10,000 agency ad

USE THE INPUT IMAGE AS THE PRODUCT/SCREENSHOT - feature it prominently.

OUTPUT: A complete 1080x1080 Meta advertisement.`;
}

/**
 * Default elite prompt when no enhanced prompt available
 */
function buildDefaultElitePrompt(style, headline, tagline, cta, accentColor, productAnalysis) {
    const mood = style.mood || 'premium';
    const backgroundColor = style.backgroundColor || '#1a1a2e';
    const productName = productAnalysis?.productName || 'Product';

    return `Create a PREMIUM Meta advertisement (1080x1080 pixels).

═══════════════════════════════════════════════════════════════
PIXEL-PRECISE LAYOUT SPECIFICATIONS:
═══════════════════════════════════════════════════════════════

BACKGROUND:
- Deep gradient from ${backgroundColor} (top) to darker shade (bottom)
- Add subtle radial glow at center (${accentColor}, opacity 20%, blur 200px)
- Optional: subtle particle/dust effect (10-20 small white dots, opacity 15%)

PRODUCT (from input image):
- Position: CENTER of canvas (540, 500)
- Size: approximately 550-600px
- Add professional studio lighting from top-left
- Add subtle reflection below product (opacity 25%)
- Add very subtle glow around product edges

HEADLINE: "${headline}"
- Position: TOP CENTER (x: 540, y: 100)
- Font: Bold, modern sans-serif
- Size: 64px
- Color: White (#FFFFFF)
- Text shadow: 0 4px 8px rgba(0,0,0,0.5)
- MUST be perfectly sharp and readable

${tagline ? `TAGLINE: "${tagline}"
- Position: Below headline (x: 540, y: 170)
- Font: Regular weight
- Size: 24px
- Color: Light gray (#CCCCCC)` : ''}

CTA BUTTON: "${cta}"
- Position: BOTTOM CENTER (x: 540, y: 970)
- Size: 220px x 56px
- Background: Linear gradient from lighter ${accentColor} to ${accentColor}
- Border-radius: 28px (pill shape)
- Text: Bold, 18px, white, centered
- Add glow effect: 0 0 20px ${accentColor} at 50% opacity
- Add shadow: 0 8px 24px rgba(0,0,0,0.3)

═══════════════════════════════════════════════════════════════
STYLE: ${mood}, professional, high-converting Meta 2026 ad
═══════════════════════════════════════════════════════════════

TEXT MUST BE PERFECTLY SHARP AND READABLE.
This should look like a premium agency ad, not AI-generated.`;
}

async function createFallbackCanvas(productImageBuffer, layoutPlan) {
    console.log('[CleanCanvas] Using fallback...');
    const bgColor = layoutPlan?.style?.backgroundColor || '#1a1a2e';

    try {
        const gradientSvg = `<svg width="1080" height="1080">
            <defs>
                <radialGradient id="bg" cx="50%" cy="70%" r="80%">
                    <stop offset="0%" style="stop-color:${adjustColor(bgColor, 20)};stop-opacity:1"/>
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

function adjustColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

export default { generateCleanCanvas };
