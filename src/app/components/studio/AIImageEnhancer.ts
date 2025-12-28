// AI Image Enhancement Utilities
// Provides AI-powered image editing capabilities for the Studio
import { enhanceProductImage, generateBackgroundScene } from '../../lib/api/ai-image-enhancement';

export interface SceneGenerationRequest {
    imageUrl: string;
    scenePrompt: string;
    style?: 'product' | 'lifestyle' | 'studio' | 'minimal';
}

export interface BackgroundReplaceRequest {
    imageUrl: string;
    backgroundPrompt: string;
}

export interface ImageEnhanceRequest {
    imageUrl: string;
    enhanceType: 'quality' | 'lighting' | 'color';
}

export interface AIImageResult {
    success: boolean;
    imageUrl?: string;
    error?: string;
}

// Helper to convert Blob/URL to Base64 for Vision API
async function urlToBase64(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                // Remove data:image/xxx;base64, prefix
                resolve(base64.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error("Failed to convert image to base64", e);
        throw new Error("Failed to process image");
    }
}

/**
 * Generate a professional product scene around an uploaded image
 * Uses Premium Vision API
 */
export async function generateProductScene(request: SceneGenerationRequest): Promise<AIImageResult> {
    const { imageUrl, scenePrompt, style = 'product' } = request;

    try {
        const base64 = await urlToBase64(imageUrl);

        // Map style to tone
        const toneMap: Record<string, 'professional' | 'playful' | 'bold' | 'luxury' | 'minimal'> = {
            product: 'professional',
            lifestyle: 'playful',
            studio: 'professional',
            minimal: 'minimal'
        };

        const result = await enhanceProductImage({
            imageBase64: base64,
            userPrompt: scenePrompt,
            productName: "Product", // Generic default
            tone: toneMap[style] || 'professional'
        });

        return {
            success: true,
            imageUrl: result.enhancedImageUrl
        };

    } catch (error) {
        console.error('Scene generation failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate scene'
        };
    }
}

/**
 * Replace background of an image with AI-generated content
 */
export async function replaceBackground(request: BackgroundReplaceRequest): Promise<AIImageResult> {
    const { imageUrl, backgroundPrompt } = request;

    try {
        const base64 = await urlToBase64(imageUrl);

        const result = await generateBackgroundScene({
            imageBase64: base64,
            userPrompt: backgroundPrompt,
            productName: "Product",
            tone: 'professional' // Default
        });

        return {
            success: true,
            imageUrl: result.backgroundImageUrl
        };
    } catch (error) {
        console.error('Background replacement failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to replace background'
        };
    }
}

/**
 * Enhance image quality using AI
 */
export async function enhanceImage(request: ImageEnhanceRequest): Promise<AIImageResult> {
    const { imageUrl, enhanceType } = request;

    try {
        const base64 = await urlToBase64(imageUrl);

        // Map enhance types to prompts
        const prompts = {
            quality: "Upscale and sharpen details, improve resolution",
            lighting: "Professional studio lighting, balanced shadows",
            color: "Vibrant color grading, color correction"
        };

        const result = await enhanceProductImage({
            imageBase64: base64,
            userPrompt: prompts[enhanceType],
            productName: "Product",
            tone: 'professional'
        });

        return {
            success: true,
            imageUrl: result.enhancedImageUrl
        };
    } catch (error) {
        console.error('Image enhancement failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to enhance image'
        };
    }
}

// Mock images for demo/fallback purposes
function _getMockSceneImage(style: string): string {
    const scenes: Record<string, string> = {
        product: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1080&auto=format&fit=crop',
        lifestyle: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1080&auto=format&fit=crop',
        studio: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1080&auto=format&fit=crop',
        minimal: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1080&auto=format&fit=crop'
    };
    return scenes[style] || scenes.product;
}

function _getMockBackgroundImage(prompt: string): string {
    // Return contextual mock based on keywords
    const promptLower = prompt.toLowerCase();
    if (promptLower.includes('marble') || promptLower.includes('luxury')) {
        return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&auto=format&fit=crop';
    }
    if (promptLower.includes('nature') || promptLower.includes('plant')) {
        return 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1080&auto=format&fit=crop';
    }
    if (promptLower.includes('wood') || promptLower.includes('rustic')) {
        return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&auto=format&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1080&auto=format&fit=crop';
}

// Predefined scene prompts for quick selection
export const SCENE_PRESETS = [
    { id: 'marble', label: 'Marmor Luxus', prompt: 'Eleganter Marmortisch mit warmem Licht' },
    { id: 'nature', label: 'Natur & Pflanzen', prompt: 'Natürliches Setting mit grünen Pflanzen' },
    { id: 'studio', label: 'Studio Clean', prompt: 'Professionelles Studio mit Gradient-Hintergrund' },
    { id: 'lifestyle', label: 'Lifestyle', prompt: 'Modernes Wohnzimmer-Setting' },
    { id: 'outdoor', label: 'Outdoor', prompt: 'Sonniges Outdoor-Setting mit natürlichem Licht' },
    { id: 'minimal', label: 'Minimalistisch', prompt: 'Sauberer weißer Hintergrund mit subtilen Schatten' }
];
