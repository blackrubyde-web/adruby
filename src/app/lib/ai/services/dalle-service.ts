/**
 * DALLE SERVICE
 * DALL-E 3 integration for background generation
 * 
 * Features:
 * - Background generation from prompts
 * - Style consistency
 * - Image variations
 * - Quality control
 */

import OpenAI from 'openai';
import type { GenerationResult } from './openai-service';

export interface BackgroundGenerationParams {
    productName: string;
    tone: 'minimal' | 'bold' | 'luxury' | 'professional' | 'playful';
    colorScheme?: string[];
    additionalContext?: string;
}

class DALLEService {
    private client: OpenAI;

    constructor(apiKey: string, organization?: string) {
        this.client = new OpenAI({ apiKey, organization });
    }

    /**
     * Generate ad background with DALL-E 3
     */
    async generateBackground(params: BackgroundGenerationParams): Promise<GenerationResult<{
        url: string;
        revisedPrompt: string;
    }>> {
        const startTime = Date.now();

        // Build prompt based on tone
        const styleDescriptions = {
            minimal: 'clean, minimalist, simple gradient, subtle texture, professional',
            bold: 'vibrant, high contrast, dynamic shapes, energetic, eye-catching',
            luxury: 'elegant, sophisticated, premium materials, soft lighting, refined',
            professional: 'corporate, modern, clean lines, balanced, trustworthy',
            playful: 'colorful, fun, whimsical, dynamic, friendly'
        };

        const colorContext = params.colorScheme
            ? `with color palette: ${params.colorScheme.join(', ')}`
            : '';

        const prompt = `Create a professional advertising background for ${params.productName}.
Style: ${styleDescriptions[params.tone]}
${colorContext}
${params.additionalContext || ''}

Requirements:
- No text or logos
- No products (leave center space empty for product placement)
- High quality, 1024x1024
- Suitable for e-commerce advertising
- ${params.tone} aesthetic`;

        try {
            const response = await this.client.images.generate({
                model: 'dall-e-3',
                prompt: prompt.trim(),
                n: 1,
                size: '1024x1024',
                quality: 'standard',
                style: params.tone === 'luxury' ? 'vivid' : 'natural'
            });

            const imageUrl = response.data?.[0]?.url;
            const revisedPrompt = response.data?.[0]?.revised_prompt || prompt;

            if (!imageUrl) {
                throw new Error('DALL-E API did not return an image URL.');
            }

            return {
                content: {
                    url: imageUrl,
                    revisedPrompt
                },
                usage: {
                    promptTokens: 0, // DALL-E doesn't return token usage
                    completionTokens: 0,
                    totalTokens: 0
                },
                cost: 0.04, // DALL-E 3 standard cost
                model: 'dall-e-3',
                latency: Date.now() - startTime
            };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('DALL-E API Error:', error);
            throw new Error(`Failed to generate background: ${message}`);
        }
    }

    /**
     * Create image variations with DALL-E 2
     */
    async createVariations(imageUrl: string, count: number = 3): Promise<GenerationResult<string[]>> {
        const startTime = Date.now();

        try {
            // Note: DALL-E 2 variations require PNG format and specific sizing
            // This is a simplified version - production would need proper image preprocessing

            const imageFile = imageUrl as unknown as File;
            const response = await this.client.images.createVariation({
                image: imageFile, // Needs to be File object in production
                n: Math.min(count, 4), // Max 4 for DALL-E 2
                size: '1024x1024'
            });

            const urls = response.data?.map(img => img.url!) || [];

            return {
                content: urls,
                usage: {
                    promptTokens: 0,
                    completionTokens: 0,
                    totalTokens: 0
                },
                cost: 0.02 * urls.length, // DALL-E 2 variation cost
                model: 'dall-e-2',
                latency: Date.now() - startTime
            };
        } catch (error: unknown) {
            console.error('DALL-E Variation Error:', error);
            return {
                content: [],
                usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
                cost: 0,
                model: 'fallback',
                latency: Date.now() - startTime
            };
        }
    }

    /**
     * Generate multiple background options
     */
    async generateBackgroundOptions(
        params: BackgroundGenerationParams,
        count: number = 3
    ): Promise<Array<{ url: string; revisedPrompt: string; cost: number }>> {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                const result = await this.generateBackground(params);
                results.push({
                    ...result.content,
                    cost: result.cost
                });

                // Rate limit: DALL-E 3 has strict limits
                if (i < count - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error(`Failed to generate background ${i + 1}:`, error);
            }
        }

        return results;
    }
}

/**
 * Get DALL-E service instance
 * 
 * 🚨 SECURITY: API key must be provided as parameter
 * DO NOT use process.env in browser!
 */
export function getDALLEService(apiKey: string, organization?: string): DALLEService {
    if (!apiKey || apiKey.trim() === '') {
        throw new Error('OpenAI API key is required for DALL-E service');
    }

    return new DALLEService(apiKey, organization);
}

export { DALLEService };
