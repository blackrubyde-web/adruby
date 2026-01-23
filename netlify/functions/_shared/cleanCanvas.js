/**
 * CLEAN CANVAS GENERATOR - WITH TEXT
 * 
 * Layer 2: Generates product photo WITH text overlay.
 * Gemini renders text directly in the image (no separate compositor needed).
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate complete ad with text using Gemini
 */
export async function generateCleanCanvas({ productImageBuffer, layoutPlan, productAnalysis, copy }) {
    console.log('[CleanCanvas] 🎨 Generating complete ad with Gemini...');

    const style = layoutPlan?.style || {};
    const composition = layoutPlan?.composition || {};

    const mood = style.mood || 'premium';
    const backgroundType = style.backgroundType || 'dark_gradient';
    const backgroundColor = style.backgroundColor || '#1a1a2e';
    const accentColor = style.accentColor || '#FF4757';
    const lighting = style.lighting || 'studio';

    // Get copy text - either from copy parameter or use defaults
    const headline = copy?.headline || productAnalysis?.productName || 'Premium Quality';
    const tagline = copy?.tagline || '';
    const cta = copy?.cta || 'Shop Now';

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: { responseModalities: ['image', 'text'] }
    });

    const prompt = `Create a professional Meta/Instagram advertisement (1080x1080px).

PRODUCT: Keep the product from the input image EXACTLY as shown. Do not modify the product.

BACKGROUND:
- Style: ${backgroundType}
- Color: ${backgroundColor}
- Lighting: ${lighting}
- Add subtle gradient and professional studio lighting
- Leave space at top for headline and bottom for CTA button

TEXT TO INCLUDE (render as clean, crisp typography):

HEADLINE at top: "${headline}"
- Large, bold, white text
- Modern sans-serif font (like Inter, SF Pro, or Helvetica)
- Drop shadow for readability
- Centered

${tagline ? `TAGLINE below headline: "${tagline}"
- Smaller, lighter weight text
- Gray or light color (#CCCCCC)
- Centered` : ''}

CTA BUTTON at bottom center: "${cta}"
- Pill-shaped button with rounded corners
- Background color: ${accentColor}
- White text inside the button
- Subtle glow/shadow effect
- Width approximately 200-220px

STYLE REQUIREMENTS:
- ${mood} aesthetic
- Professional ad quality
- Clean, modern design
- Text must be PERFECTLY READABLE and CRISP
- No artifacts, no blurry text
- Looks like a professional Meta ad

OUTPUT: A complete advertisement ready to run on Instagram/Facebook.`;

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

                    console.log('[CleanCanvas] ✅ Complete ad generated with Gemini');
                    return {
                        success: true,
                        buffer: resized,
                        includesText: true  // Flag that text is already rendered
                    };
                }
            }
        }
        throw new Error('No image in response');
    } catch (error) {
        console.error('[CleanCanvas] ❌ Failed:', error.message);
        return createFallbackCanvas(productImageBuffer, layoutPlan);
    }
}

async function createFallbackCanvas(productImageBuffer, layoutPlan) {
    console.log('[CleanCanvas] Using fallback canvas...');

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
