/**
 * CLEAN CANVAS GENERATOR - 10/10 VERSION
 * 
 * Layer 2: Generates premium product photo WITHOUT text.
 * Industry-aware backgrounds with proper negative space.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate clean product photo with industry-appropriate styling
 */
export async function generateCleanCanvas({ productImageBuffer, layoutPlan, productAnalysis }) {
    console.log('[CleanCanvas] 🎨 Generating premium product canvas...');

    const style = layoutPlan?.style || {};
    const composition = layoutPlan?.composition || {};

    const mood = style.mood || 'premium';
    const backgroundType = style.backgroundType || 'dark_gradient';
    const backgroundColor = style.backgroundColor || '#1a1a2e';
    const lighting = style.lighting || 'studio';
    const effects = style.effects || [];
    const productPosition = composition.productPosition || 'center';
    const negativeSpace = composition.negativeSpaceZone || 'top';

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: { responseModalities: ['image', 'text'] }
    });

    const prompt = `PRODUCT PHOTO ENHANCEMENT - NO TEXT

Create a premium ${mood} advertisement background for this product.

CRITICAL RULES:
1. Keep the product EXACTLY as it appears - same pose, angle, details
2. Generate NO text, NO buttons, NO graphics
3. Leave empty ${negativeSpace} area (25%+) for text overlay later

COMPOSITION:
- Product position: ${productPosition}
- Leave CLEAR space in: ${negativeSpace}
- Product should fill ~45% of frame

BACKGROUND STYLE: ${backgroundType}
- Base color: ${backgroundColor}
- Lighting: ${lighting}
${effects.includes('neon_glow') ? '- Add subtle neon glow accents' : ''}
${effects.includes('reflection') ? '- Add subtle floor reflection' : ''}
${effects.includes('warm_glow') ? '- Add warm cozy lighting' : ''}
${effects.includes('soft_shadow') ? '- Add soft natural shadows' : ''}

QUALITY:
- Professional product photography level
- Magazine/e-commerce quality
- Clean, uncluttered
- Premium aesthetic

OUTPUT: 1080x1080 product photo WITHOUT any text or graphics.`;

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

                    console.log('[CleanCanvas] ✅ Premium canvas generated');
                    return { success: true, buffer: resized };
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
    console.log('[CleanCanvas] Using premium fallback...');

    const bgColor = layoutPlan?.style?.backgroundColor || '#1a1a2e';

    try {
        // Create gradient background
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
            .composite([{ input: product, top: 320, left: 265 }])
            .png().toBuffer();

        console.log('[CleanCanvas] ✅ Fallback canvas created');
        return { success: true, buffer: result, isFallback: true };
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
