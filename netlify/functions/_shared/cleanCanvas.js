/**
 * CLEAN CANVAS GENERATOR
 * 
 * Layer 2 of the Pipeline
 * Generates beautiful product photo WITHOUT any text.
 * Creates negative space for text overlay.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate clean product photo with space for text
 * @returns {Buffer} Image buffer without text
 */
export async function generateCleanCanvas({
    productImageBuffer,
    layoutPlan,
    productAnalysis
}) {
    console.log('[CleanCanvas] 🎨 Generating product photo with negative space...');

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
            responseModalities: ['image', 'text']
        }
    });

    // Build prompt based on layout plan
    const negativeSpaceDirection = layoutPlan?.composition?.negativeSpaceZone || 'top';
    const backgroundType = layoutPlan?.style?.backgroundType || 'dark_gradient';
    const backgroundColor = layoutPlan?.style?.backgroundColor || '#1a1a2e';
    const lighting = layoutPlan?.style?.lighting || 'studio';
    const productPosition = layoutPlan?.composition?.productPosition || 'center';

    const prompt = `PRODUCT PHOTO ONLY - NO TEXT, NO GRAPHICS, NO OVERLAYS

Transform this product photo into a professional advertisement background.

CRITICAL REQUIREMENTS:
1. Keep the product EXACTLY as it appears - do not change its pose, angle, or appearance
2. Generate NO text whatsoever
3. Generate NO buttons or call-to-action elements
4. Generate NO graphics, arrows, or overlays

COMPOSITION:
- Product position: ${productPosition}
- Leave EMPTY SPACE in the ${negativeSpaceDirection} area for text overlay later
- At least 25-30% of the image should be clean negative space

BACKGROUND:
- Type: ${backgroundType}
- Base color: ${backgroundColor}
- Style: Professional studio photography

LIGHTING:
- Style: ${lighting}
- Make the product look premium and high-quality
- Natural shadows and reflections on surface

OUTPUT: 
A beautiful 1080x1080 product photo that looks like professional e-commerce photography.
The ${negativeSpaceDirection} area must be clean for text to be added later.

REMEMBER: Absolutely NO text, NO buttons, NO graphics. Just the product in a beautiful setting.`;

    try {
        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: 'image/png',
                    data: productImageBuffer.toString('base64')
                }
            },
            { text: prompt }
        ]);

        // Extract image from response
        const response = result.response;
        const candidates = response.candidates;

        if (candidates && candidates[0]?.content?.parts) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    const imageBuffer = Buffer.from(part.inlineData.data, 'base64');

                    // Ensure 1080x1080
                    const resizedBuffer = await sharp(imageBuffer)
                        .resize(1080, 1080, { fit: 'cover' })
                        .png()
                        .toBuffer();

                    console.log('[CleanCanvas] ✅ Clean canvas generated successfully');
                    return {
                        success: true,
                        buffer: resizedBuffer
                    };
                }
            }
        }

        throw new Error('No image in response');
    } catch (error) {
        console.error('[CleanCanvas] ❌ Failed:', error.message);

        // Fallback: Return enhanced original with simple background
        return await createFallbackCanvas(productImageBuffer, layoutPlan);
    }
}

/**
 * Fallback: Create simple background with original product
 */
async function createFallbackCanvas(productImageBuffer, layoutPlan) {
    console.log('[CleanCanvas] Using fallback canvas creator...');

    const backgroundColor = layoutPlan?.style?.backgroundColor || '#1a1a2e';

    try {
        // Create background
        const background = await sharp({
            create: {
                width: 1080,
                height: 1080,
                channels: 4,
                background: backgroundColor
            }
        }).png().toBuffer();

        // Resize product to fit
        const product = await sharp(productImageBuffer)
            .resize(700, 700, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toBuffer();

        // Composite product onto background
        const result = await sharp(background)
            .composite([{
                input: product,
                top: 280, // Leave space at top for text
                left: 190
            }])
            .png()
            .toBuffer();

        console.log('[CleanCanvas] ✅ Fallback canvas created');
        return {
            success: true,
            buffer: result,
            isFallback: true
        };
    } catch (error) {
        console.error('[CleanCanvas] Fallback also failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

export default { generateCleanCanvas };
