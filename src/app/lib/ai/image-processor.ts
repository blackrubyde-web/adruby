import { generateBackgroundScene } from '../api/ai-image-enhancement';
// import { invokeOpenAIProxy } from '../api/proxyClient'; // Not used directly here yet, but prepared

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
    cutoutBase64?: string; // NEW
    productName: string;
    tone: string;
    designVibe?: string;
    shouldEnhance: boolean;
    signal?: AbortSignal;
}): Promise<ProcessedAssets | undefined> {
    console.log('🖼️ Stage 5: Compositing Engine...');

    if (!params.imageBase64) {
        console.log('⏭️  No image provided, skipping');
        return undefined;
    }

    // Default: Use cutout if available, else original
    const productAsset = params.cutoutBase64 || params.imageBase64;
    const result: ProcessedAssets = { originalProduct: productAsset };

    // Decision: Generate Background?
    if (!params.shouldEnhance) {
        console.log('⏭️  User opted out of background gen');
        return result;
    }

    if (params.signal?.aborted) {
        console.warn('⏭️  Compositing aborted before background generation');
        return result;
    }

    try {
        console.log('✨ Generating Premium Background Scene...');

        // This function calls our Supabase Edge Function 'openai-proxy' (dall-e-3)
        // It prompts for a "Background texture" or "Scene" without the product.
        const bgResult = await generateBackgroundScene({
            imageBase64: params.imageBase64, // Passed for reference/color-extraction (Original is better for context)
            userPrompt: `Professional ${params.tone} background for ${params.productName}, style: ${params.designVibe || 'minimalist'}`,
            productName: params.productName,
            tone: params.tone as any
        }, { signal: params.signal });

        console.log('✅ Background generated:', bgResult.backgroundImageUrl);

        return {
            originalProduct: productAsset, // Return the CUTOUT for the layer
            generatedBackground: bgResult.backgroundImageUrl
        };

    } catch (error) {
        console.error('Image processing error:', error);
        // Fail safe: Return original
        return result;
    }
}
