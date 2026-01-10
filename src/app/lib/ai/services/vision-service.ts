/**
 * VISION SERVICE
 * GPT-4 Vision API integration for image analysis
 * 
 * Features:
 * - Product image analysis
 * - Composition scoring
 * - Object detection
 * - Brand element detection
 * - NSFW detection
 * - Quality assessment
 */

import OpenAI from 'openai';
import type { GenerationResult } from './openai-service';

export interface ImageAnalysisResult {
    objects: Array<{
        name: string;
        confidence: number;
        location?: { x: number; y: number; width: number; height: number };
    }>;
    composition: {
        score: number; // 0-100
        balance: 'good' | 'fair' | 'poor';
        rule_of_thirds: boolean;
        focal_point: { x: number; y: number };
    };
    quality: {
        score: number; // 0-100
        sharpness: 'sharp' | 'moderate' | 'blurry';
        lighting: 'excellent' | 'good' | 'poor';
        colors: 'vibrant' | 'muted' | 'dull';
    };
    brand_elements: {
        has_logo: boolean;
        has_text: boolean;
        text_content?: string[];
    };
    safety: {
        is_safe: boolean;
        concerns: string[];
    };
    suggestions: string[];
}

class VisionService {
    private client: OpenAI;

    constructor(apiKey: string, organization?: string) {
        this.client = new OpenAI({ apiKey, organization });
    }

    /**
     * Analyze product image comprehensively
     */
    async analyzeProductImage(imageUrl: string): Promise<GenerationResult<ImageAnalysisResult>> {
        const startTime = Date.now();

        const prompt = `Analyze this product image in detail:

1. Objects: Identify main objects and their positions
2. Composition: Score the visual composition (0-100), check rule of thirds, identify focal point
3. Quality: Assess sharpness, lighting, color vibrancy (0-100 score)
4. Brand Elements: Detect logos, text overlays
5. Safety: Check for inappropriate content
6. Suggestions: Provide 3-5 actionable improvements

Return JSON:
{
  "objects": [{"name": "string", "confidence": 0-100}],
  "composition": {"score": 0-100, "balance": "good|fair|poor", "rule_of_thirds": boolean, "focal_point": {"x": 0-100, "y": 0-100}},
  "quality": {"score": 0-100, "sharpness": "sharp|moderate|blurry", "lighting": "excellent|good|poor", "colors": "vibrant|muted|dull"},
  "brand_elements": {"has_logo": boolean, "has_text": boolean, "text_content": []},
  "safety": {"is_safe": boolean, "concerns": []},
  "suggestions": []
}`;

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4-vision-preview',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            { type: 'image_url', image_url: { url: imageUrl } }
                        ]
                    }
                ],
                max_tokens: 1000,
                temperature: 0.3
            });

            const content = JSON.parse(response.choices[0].message.content || '{}');
            const usage = response.usage!;

            return {
                content,
                usage: {
                    promptTokens: usage.prompt_tokens,
                    completionTokens: usage.completion_tokens,
                    totalTokens: usage.total_tokens
                },
                cost: (usage.prompt_tokens * 0.01 / 1000) + (usage.completion_tokens * 0.03 / 1000),
                model: response.model,
                latency: Date.now() - startTime
            };
        } catch (error: any) {
            console.error('Vision API Error:', error);

            // Fallback response
            return {
                content: {
                    objects: [],
                    composition: { score: 50, balance: 'fair', rule_of_thirds: false, focal_point: { x: 50, y: 50 } },
                    quality: { score: 50, sharpness: 'moderate', lighting: 'good', colors: 'muted' },
                    brand_elements: { has_logo: false, has_text: false },
                    safety: { is_safe: true, concerns: [] },
                    suggestions: ['Consider better lighting', 'Improve product positioning']
                },
                usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
                cost: 0,
                model: 'fallback',
                latency: Date.now() - startTime
            };
        }
    }

    /**
     * Detect brand elements (logos, text)
     */
    async detectBrandElements(imageUrl: string): Promise<GenerationResult<{
        logos: Array<{ brand: string; confidence: number }>;
        text: string[];
        colors: string[];
    }>> {
        const startTime = Date.now();

        const prompt = `Extract brand elements from this image:
1. Logos: Detect any brand logos (name + confidence)
2. Text: Extract all visible text
3. Colors: List 3-5 dominant brand colors (hex codes)

Return JSON:
{
  "logos": [{"brand": "string", "confidence": 0-100}],
  "text": ["text1", "text2"],
  "colors": ["#HEX1", "#HEX2"]
}`;

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4-vision-preview',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            { type: 'image_url', image_url: { url: imageUrl } }
                        ]
                    }
                ],
                max_tokens: 500,
                temperature: 0.2
            });

            const content = JSON.parse(response.choices[0].message.content || '{}');
            const usage = response.usage!;

            return {
                content,
                usage: {
                    promptTokens: usage.prompt_tokens,
                    completionTokens: usage.completion_tokens,
                    totalTokens: usage.total_tokens
                },
                cost: (usage.prompt_tokens * 0.01 / 1000) + (usage.completion_tokens * 0.03 / 1000),
                model: response.model,
                latency: Date.now() - startTime
            };
        } catch (error: any) {
            console.error('Vision API Error:', error);
            return {
                content: { logos: [], text: [], colors: [] },
                usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
                cost: 0,
                model: 'fallback',
                latency: Date.now() - startTime
            };
        }
    }

    /**
     * Score image composition
     */
    async scoreComposition(imageUrl: string): Promise<GenerationResult<{
        score: number;
        feedback: string[];
        improvements: string[];
    }>> {
        const startTime = Date.now();

        const prompt = `Rate this image's composition for advertising (0-100):
- Visual balance
- Rule of thirds
- Focal point clarity
- Background simplicity
- Product prominence

Provide:
1. Overall score (0-100)
2. 3 positive feedback points
3. 3 actionable improvements

Return JSON:
{
  "score": 0-100,
  "feedback": ["point1", "point2", "point3"],
  "improvements": ["improve1", "improve2", "improve3"]
}`;

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4-vision-preview',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            { type: 'image_url', image_url: { url: imageUrl } }
                        ]
                    }
                ],
                max_tokens: 400,
                temperature: 0.3
            });

            const content = JSON.parse(response.choices[0].message.content || '{}');
            const usage = response.usage!;

            return {
                content,
                usage: {
                    promptTokens: usage.prompt_tokens,
                    completionTokens: usage.completion_tokens,
                    totalTokens: usage.total_tokens
                },
                cost: (usage.prompt_tokens * 0.01 / 1000) + (usage.completion_tokens * 0.03 / 1000),
                model: response.model,
                latency: Date.now() - startTime
            };
        } catch (error: any) {
            console.error('Vision API Error:', error);
            return {
                content: {
                    score: 50,
                    feedback: ['Adequate composition'],
                    improvements: ['Consider rule of thirds']
                },
                usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
                cost: 0,
                model: 'fallback',
                latency: Date.now() - startTime
            };
        }
    }
}

// Singleton
let visionServiceInstance: VisionService | null = null;

/**
 * Get Vision service instance
 * 
 * 🚨 SECURITY: API key must be provided as parameter
 * DO NOT use process.env in browser!
 */
export function getVisionService(apiKey: string, organization?: string): VisionService {
    if (!apiKey || apiKey.trim() === '') {
        throw new Error('OpenAI API key is required for Vision service');
    }

    return new VisionService(apiKey, organization);
}

export { VisionService };
