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
}): Promise<string | undefined> {
    console.log('🖼️ Stage 5: Intelligent Image Processing...');

    if (!params.imageBase64) {
        console.log('⏭️  No image provided, skipping');
        return undefined;
    }

    // Decision: Should we enhance this image?
    if (!params.shouldEnhance) {
        console.log('⏭️  User opted out of enhancement');
        return params.imageBase64;
    }

    try {
        // Analyze image and determine best processing approach
        const analysisPrompt = `Analyze this product image and recommend processing:

Product: ${params.productName}
Tone: ${params.tone}

Should we:
A) Remove background and add studio backdrop (product photography)
B) Keep background, enhance lighting only (lifestyle/UGC)
C) Keep as-is, minimal enhancement (already professional)

Return ONLY: A, B, or C`;

        const { data: analysisData, error: analysisError } = await supabase.functions.invoke('openai-proxy', {
            body: {
                endpoint: 'chat/completions',
                model: 'gpt-4o',
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: analysisPrompt },
                        {
                            type: 'image_url',
                            image_url: {
                                url: params.imageBase64.startsWith('data:')
                                    ? params.imageBase64
                                    : `data:image/jpeg;base64,${params.imageBase64}`,
                                detail: 'low'
                            }
                        }
                    ]
                }],
                max_tokens: 10,
                temperature: 0.3
            }
        });

        if (analysisError) {
            console.warn('Image analysis failed, using as-is:', analysisError);
            return params.imageBase64;
        }

        const decision = analysisData.choices[0]?.message?.content?.trim();
        console.log('📋 Image processing decision:', decision);

        // Apply decision
        if (decision === 'A' || decision === 'B') {
            // Enhance with DALL-E 3
            console.log('✨ Enhancing image with AI...');
            const enhanced = await enhanceProductImage({
                imageBase64: params.imageBase64,
                userPrompt: decision === 'A'
                    ? 'Remove background, add professional studio backdrop with premium lighting'
                    : 'Keep background, enhance lighting and colors for premium look',
                productName: params.productName,
                tone: params.tone as any
            });

            return enhanced.enhancedImageUrl;
        } else {
            // Keep as-is
            console.log('✅ Image looks good, keeping as-is');
            return params.imageBase64;
        }

    } catch (error) {
        console.error('Image processing error:', error);
        // Fallback: return original
        return params.imageBase64;
    }
}
