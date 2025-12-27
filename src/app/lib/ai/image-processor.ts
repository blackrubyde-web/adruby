import { supabase } from '../supabaseClient';
import { enhanceProductImage } from '../api/ai-image-enhancement';

/**
 * STAGE 5: INTELLIGENT IMAGE PROCESSOR
 * Smart decisions: enhance, remove BG, or keep as-is
 */

export async function processImage(params: {
    imageBase64?: string;
    productName: string;
    tone: string;
    shouldEnhance: boolean;
}): Promise<{ original: string; background?: string } | undefined> {
    console.log('🖼️ Stage 5: Intelligent Image Processing...');

    if (!params.imageBase64) {
        console.log('⏭️  No image provided, skipping');
        return undefined;
    }

    // Default: Return original only
    const result = { original: params.imageBase64 };

    // Decision: Should we generate a background?
    if (!params.shouldEnhance) {
        console.log('⏭️  User opted out of enhancement');
        return result;
    }

    try {
        console.log('✨ Generating Premium Background Scene...');

        // Import dynamically to avoid circular deps if any (though here it's fine)
        const { generateBackgroundScene } = await import('../api/ai-image-enhancement');

        const bgResult = await generateBackgroundScene({
            imageBase64: params.imageBase64,
            userPrompt: 'Generate a matching premium background',
            productName: params.productName,
            tone: params.tone as any
        });

        console.log('✅ Background generated:', bgResult.backgroundImageUrl);
        return {
            original: params.imageBase64,
            background: bgResult.backgroundImageUrl
        };

    } catch (error) {
        console.error('Image processing error:', error);
        // Fallback: return original only
        return result;
    }
}
