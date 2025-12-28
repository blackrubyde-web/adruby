import { generateBackgroundScene } from '../api/ai-image-enhancement';

/**
 * STAGE 5: INTELLIGENT COMPOSITING ENGINE
 * Philosophy: "Don't touch the product."
 * 
 * Pipeline:
 * 1. Take Original Product (Cutout)
 * 2. Generate matching "Scene" (Background) based on Strategy
 * 3. Return both to LayoutComposer for final assembly
 */

export interface ProcessedAssets {
    originalProduct: string; // The cutout
    generatedBackground?: string; // The scene
    compositeUrl?: string; // Optional: Pre-merged (if using backend merger)
}

export async function processImage(params: {
    imageBase64?: string;
    productName: string;
    tone: string;
    designVibe?: string; // From Strategic Analyzer
    shouldEnhance: boolean;
}): Promise<ProcessedAssets | undefined> {
    console.log('🖼️ Stage 5: Compositing Engine...');

    if (!params.imageBase64) {
        console.log('⏭️  No image provided, skipping');
        return undefined;
    }

    // Default: Just the product
    const result: ProcessedAssets = { originalProduct: params.imageBase64 };

    // Decision: Generate Background?
    if (!params.shouldEnhance) {
        console.log('⏭️  User opted out of background gen');
        return result;
    }

    try {
        console.log('✨ Generating Premium Background Scene...');

        // This function calls our Supabase Edge Function 'openai-proxy' (dall-e-3)
        // It prompts for a "Background texture" or "Scene" without the product.
        const bgResult = await generateBackgroundScene({
            imageBase64: params.imageBase64, // Passed for reference/color-extraction
            userPrompt: `Professional ${params.tone} background for ${params.productName}, style: ${params.designVibe || 'minimalist'}`,
            productName: params.productName,
            tone: params.tone as any
        });

        console.log('✅ Background generated:', bgResult.backgroundImageUrl);

        return {
            originalProduct: params.imageBase64,
            generatedBackground: bgResult.backgroundImageUrl
        };

    } catch (error) {
        console.error('Image processing error:', error);
        // Fail safe: Return original
        return result;
    }
}
