/**
 * CLEAN CANVAS GENERATOR - USER PROMPT PRIORITY
 * 
 * Layer 2: Generates complete ad based on USER'S creative vision.
 * User prompt takes ABSOLUTE priority over system defaults.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate complete ad with USER PROMPT as priority
 */
export async function generateCleanCanvas({
    productImageBuffer,
    layoutPlan,
    productAnalysis,
    copy,
    userPrompt  // NEW: User's creative vision
}) {
    console.log('[CleanCanvas] 🎨 Generating ad based on user vision...');

    const style = layoutPlan?.style || {};
    const accentColor = style.accentColor || '#FF4757';

    const headline = copy?.headline || productAnalysis?.productName || 'Premium Quality';
    const tagline = copy?.tagline || '';
    const cta = copy?.cta || 'Shop Now';

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: { responseModalities: ['image', 'text'] }
    });

    // USER PROMPT HAS ABSOLUTE PRIORITY
    const prompt = userPrompt
        ? buildUserPromptFirst(userPrompt, headline, tagline, cta, accentColor)
        : buildDefaultPrompt(style, headline, tagline, cta, accentColor);

    console.log('[CleanCanvas] Using prompt type:', userPrompt ? 'USER_PRIORITY' : 'DEFAULT');

    try {
        const result = await model.generateContent([
            { inlineData: { mimeType: 'image/png', data: productImageBuffer.toString('base64') } },
            { text: prompt }
        ]);

        const candidates = result.response?.candidates;
        if (candidates?.[0]?.content?.parts) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData?.data) {
                    const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
                    const resized = await sharp(imageBuffer).resize(1080, 1080, { fit: 'cover' }).png().toBuffer();

                    console.log('[CleanCanvas] ✅ Ad generated');
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
 * USER PROMPT FIRST - User's vision takes absolute priority
 */
function buildUserPromptFirst(userPrompt, headline, tagline, cta, accentColor) {
    return `Create a Meta/Instagram advertisement (1080x1080px) based EXACTLY on this user request:

══════════════════════════════════════════
USER'S CREATIVE VISION (HIGHEST PRIORITY):
══════════════════════════════════════════
${userPrompt}

Follow the user's instructions EXACTLY. If they want a Macbook, create a Macbook.
If they want red lights, use red lights. If they want 3D effects, make 3D effects.
DO NOT change or simplify their vision.

══════════════════════════════════════════
USE THE INPUT IMAGE AS THE PRODUCT/SCREENSHOT
══════════════════════════════════════════
The uploaded image is what the user wants to feature in the ad.
Incorporate it exactly as they described.

══════════════════════════════════════════
TEXT TO INCLUDE:
══════════════════════════════════════════
HEADLINE: "${headline}"
${tagline ? `TAGLINE: "${tagline}"` : ''}
CTA BUTTON: "${cta}" (${accentColor} background, white text, pill shape, premium look with glow/shadow)

══════════════════════════════════════════
QUALITY REQUIREMENTS:
══════════════════════════════════════════
- Professional Meta ad quality
- Sharp, crisp text with proper shadows
- Premium, modern aesthetic
- CTA button must look clickable and premium
- 1080x1080 square format

Create exactly what the user asked for. Their vision is the priority.`;
}

/**
 * Default prompt when no user prompt provided
 */
function buildDefaultPrompt(style, headline, tagline, cta, accentColor) {
    const mood = style.mood || 'premium';
    const backgroundType = style.backgroundType || 'dark_gradient';
    const backgroundColor = style.backgroundColor || '#1a1a2e';

    return `Create a professional Meta/Instagram advertisement (1080x1080px).

PRODUCT: Keep the product from the input image EXACTLY as shown.

BACKGROUND:
- Style: ${backgroundType}
- Color: ${backgroundColor}
- Professional studio lighting

TEXT:
HEADLINE: "${headline}" (large, bold, white, top center)
${tagline ? `TAGLINE: "${tagline}" (smaller, gray, below headline)` : ''}

CTA BUTTON: "${cta}"
- Bottom center
- Pill-shaped with rounded corners (28px radius)
- Background: ${accentColor}
- White bold text
- IMPORTANT: Add glow effect and shadow to make it pop
- Make it look PREMIUM and CLICKABLE

STYLE: ${mood} aesthetic, clean, modern, professional
TEXT: Perfectly readable, crisp, with shadows for depth`;
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
