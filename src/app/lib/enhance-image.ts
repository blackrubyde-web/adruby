/**
 * AI Enhance Image Feature
 * Upscales low-resolution images using AI
 */

export interface EnhanceImageOptions {
    scale: 2 | 4;  // 2x or 4x upscaling
    denoise: boolean;
    sharpen: boolean;
}

export interface EnhanceImageResult {
    success: boolean;
    enhancedUrl?: string;
    originalSize: { width: number; height: number };
    enhancedSize: { width: number; height: number };
    processingTime?: number;
    error?: string;
}

/**
 * Enhance image using AI upscaling service
 * In production, this would call Real-ESRGAN or similar
 */
export async function enhanceImage(
    imageUrl: string,
    options: EnhanceImageOptions = { scale: 2, denoise: true, sharpen: false }
): Promise<EnhanceImageResult> {
    try {
        const startTime = Date.now();

        // Call backend enhancement service
        const response = await fetch('/.netlify/functions/ai-enhance-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageUrl,
                scale: options.scale,
                denoise: options.denoise,
                sharpen: options.sharpen
            })
        });

        if (!response.ok) {
            throw new Error(`Enhancement failed: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success || !result.enhancedUrl) {
            throw new Error(result.error || 'Enhancement failed');
        }

        const processingTime = Date.now() - startTime;

        return {
            success: true,
            enhancedUrl: result.enhancedUrl,
            originalSize: result.originalSize,
            enhancedSize: result.enhancedSize,
            processingTime
        };
    } catch (error) {
        console.error('Image enhancement error:', error);
        return {
            success: false,
            originalSize: { width: 0, height: 0 },
            enhancedSize: { width: 0, height: 0 },
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Batch enhance multiple images
 */
export async function enhanceImageBatch(
    imageUrls: string[],
    options?: EnhanceImageOptions
): Promise<EnhanceImageResult[]> {
    const promises = imageUrls.map(url => enhanceImage(url, options));
    return Promise.all(promises);
}

/**
 * Check if image needs enhancement (based on size)
 */
export function shouldEnhanceImage(width: number, height: number, targetSize: number = 1080): boolean {
    return width < targetSize || height < targetSize;
}

/**
 * Get recommended enhancement settings
 */
export function getRecommendedEnhanceSettings(
    currentWidth: number,
    currentHeight: number,
    targetWidth: number = 1080
): EnhanceImageOptions {
    const currentMax = Math.max(currentWidth, currentHeight);
    const scale = targetWidth / currentMax;

    return {
        scale: scale <= 2 ? 2 : 4,
        denoise: currentMax < 500, // Enable denoise for very small images
        sharpen: scale > 2          // Enable sharpen for large upscales
    };
}
