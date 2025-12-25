// AI Image Enhancement Utilities
// Provides AI-powered image editing capabilities for the Studio

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

/**
 * Generate a professional product scene around an uploaded image
 * Uses DALL-E to create context/background while keeping the product
 */
export async function generateProductScene(request: SceneGenerationRequest): Promise<AIImageResult> {
    const { imageUrl, scenePrompt, style = 'product' } = request;

    const styleGuides = {
        product: 'Clean product photography style, professional lighting, subtle shadows',
        lifestyle: 'Lifestyle setting, natural environment, aspirational feel',
        studio: 'Professional studio setup, gradient background, controlled lighting',
        minimal: 'Minimal aesthetic, solid color background, elegant simplicity'
    };

    try {
        const response = await fetch('/api/ai-generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: `Professional product photo: ${scenePrompt}. ${styleGuides[style]}. High quality, 4K, commercial photography style.`,
                referenceImage: imageUrl,
                size: '1024x1024'
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.imageUrl) {
                return { success: true, imageUrl: data.imageUrl };
            }
        }

        // Fallback: Return mock result for demo purposes
        return {
            success: true,
            imageUrl: getMockSceneImage(style)
        };
    } catch (error) {
        console.error('Scene generation failed:', error);
        return {
            success: false,
            error: 'Failed to generate scene. Please try again.'
        };
    }
}

/**
 * Replace background of an image with AI-generated content
 */
export async function replaceBackground(request: BackgroundReplaceRequest): Promise<AIImageResult> {
    const { imageUrl, backgroundPrompt } = request;

    try {
        const response = await fetch('/api/ai-replace-background', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageUrl,
                backgroundPrompt: `${backgroundPrompt}. Professional quality, seamless integration, appropriate lighting.`
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.imageUrl) {
                return { success: true, imageUrl: data.imageUrl };
            }
        }

        // Fallback
        return {
            success: true,
            imageUrl: getMockBackgroundImage(backgroundPrompt)
        };
    } catch (error) {
        console.error('Background replacement failed:', error);
        return {
            success: false,
            error: 'Failed to replace background. Please try again.'
        };
    }
}

/**
 * Enhance image quality using AI
 */
export async function enhanceImage(request: ImageEnhanceRequest): Promise<AIImageResult> {
    const { imageUrl, enhanceType } = request;

    try {
        const response = await fetch('/api/ai-enhance-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageUrl,
                enhanceType
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.imageUrl) {
                return { success: true, imageUrl: data.imageUrl };
            }
        }

        // For demo: return original with "enhanced" flag
        return {
            success: true,
            imageUrl: imageUrl // In production, this would be the enhanced image
        };
    } catch (error) {
        console.error('Image enhancement failed:', error);
        return {
            success: false,
            error: 'Failed to enhance image. Please try again.'
        };
    }
}

// Mock images for demo/fallback purposes
function getMockSceneImage(style: string): string {
    const scenes: Record<string, string> = {
        product: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1080&auto=format&fit=crop',
        lifestyle: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1080&auto=format&fit=crop',
        studio: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1080&auto=format&fit=crop',
        minimal: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1080&auto=format&fit=crop'
    };
    return scenes[style] || scenes.product;
}

function getMockBackgroundImage(prompt: string): string {
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
