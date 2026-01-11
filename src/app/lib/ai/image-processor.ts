import { generateBackgroundScene } from '../api/ai-image-enhancement';
import { generateCompositeScene, type CompositeFusionRequest } from './image-fusion';

/**
 * STAGE 5: INTELLIGENT COMPOSITING ENGINE
 * Upgraded: Commercial-grade fusion with realistic integration
 * 
 * Pipeline:
 * 1. Take Original Product (Cutout)
 * 2. Generate matching "Scene" (Background) 
 * 3. 🆕 FUSION: Composite generation with realistic lighting/shadows
 * 4. Return compositeUrl (integrated) OR fallback to layered approach
 */

export interface ProcessedAssets {
    originalProduct: string;        // The cutout (fallback)
    generatedBackground?: string;   // The scene (fallback)
    compositeUrl?: string;          // 🆕 Fully integrated composite (PRIMARY)
    fusionMetrics?: {
        edgeBlend: number;
        lightingMatch: number;
        shadowRealism: number;
        colorHarmony: number;
    };
}

export async function processImage(params: {
    imageBase64?: string;
    cutoutBase64?: string;
    productName: string;
    tone: string;
    designVibe?: string;
    shouldEnhance: boolean;
    signal?: AbortSignal;
}): Promise<ProcessedAssets | undefined> {

    const productAsset = params.cutoutBase64 || params.imageBase64;
    const result: ProcessedAssets = { originalProduct: productAsset as string };

    // Skip enhancement if disabled
    if (!params.shouldEnhance) {
        return result;
    }

    if (params.signal?.aborted) {
        console.warn('⏭️  Compositing aborted before generation');
        return result;
    }

    try {
        // STEP 1: Generate background scene
        const scenePrompt = `Professional ${params.tone} background for ${params.productName}, style: ${params.designVibe || 'minimalist'}`;

        const bgResult = await generateBackgroundScene({
            imageBase64: params.imageBase64 as string,
            userPrompt: scenePrompt,
            productName: params.productName,
            tone: params.tone as 'professional' | 'playful' | 'bold' | 'luxury' | 'minimal'
        }, { signal: params.signal });

        // STEP 2: 🆕 Generate FUSION composite (if API key available)
        const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

        if (apiKey && params.cutoutBase64) {
            try {
                // Detect product material (simplified heuristic)
                const material = detectProductMaterial(params.productName, params.designVibe);

                // Build fusion request
                const fusionRequest: CompositeFusionRequest = {
                    productCutoutBase64: params.cutoutBase64,
                    maskBase64: extractAlphaMask(params.cutoutBase64),
                    scenePrompt,
                    productMaterial: material,
                    lightingStyle: params.tone === 'bold' ? 'dramatic' : 'studio',
                    surfaceType: params.tone === 'luxury' ? 'marble' : 'white',
                    tone: params.tone
                };

                const fusion = await generateCompositeScene(fusionRequest, apiKey);

                return {
                    originalProduct: productAsset as string,
                    generatedBackground: bgResult.backgroundImageUrl,
                    compositeUrl: fusion.compositeUrl,  // 🆕 PRIMARY OUTPUT
                    fusionMetrics: fusion.integrationMetrics
                };

            } catch (fusionError) {
                console.warn('⚠️ Fusion failed, falling back to layered approach:', fusionError);
                // Fallback to traditional layering
            }
        }

        // Fallback: Traditional layering
        return {
            originalProduct: productAsset as string,
            generatedBackground: bgResult.backgroundImageUrl
        };

    } catch (error) {
        console.error('Image processing error:', error);
        return result;
    }
}

/**
 * Detect product material from name/description (heuristic)
 */
function detectProductMaterial(productName: string, designVibe?: string): 'glass' | 'plastic' | 'fabric' | 'metal' | 'leather' | 'wood' {
    const name = productName.toLowerCase();
    const vibe = (designVibe || '').toLowerCase();

    if (/glass|bottle|jar|transparent/i.test(name)) return 'glass';
    if (/metal|steel|aluminum|chrome/i.test(name)) return 'metal';
    if (/fabric|textile|cloth|shirt|hoodie/i.test(name)) return 'fabric';
    if (/leather|bag|wallet|shoe/i.test(name)) return 'leather';
    if (/wood|wooden/i.test(name)) return 'wood';

    // Default based on vibe
    if (/luxury/.test(vibe)) return 'glass';
    return 'plastic';
}

/**
 * Extract alpha mask from cutout PNG (simplified)
 */
function extractAlphaMask(cutoutBase64: string): string {
    // In production, this would extract the alpha channel
    // For now, return the cutout itself (has transparency)
    return cutoutBase64;
}
