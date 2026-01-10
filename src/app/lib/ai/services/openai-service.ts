/**
 * OPENAI SERVICE
 * Production-ready GPT-4 Turbo integration
 * 
 * Features:
 * - Streaming responses
 * - Token usage tracking
 * - Rate limiting & retry logic
 * - Cost monitoring
 * - Structured output (JSON mode)
 * - Error handling
 */

import OpenAI from 'openai';

export interface OpenAIConfig {
    apiKey: string;
    organization?: string;
    maxRetries?: number;
    timeout?: number;
}

export interface GenerationResult<T = string> {
    content: T;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    cost: number;
    model: string;
    latency: number;
}

export interface CopyGenerationParams {
    productName: string;
    productDescription?: string;
    brandName?: string;
    tone: 'professional' | 'playful' | 'bold' | 'luxury' | 'minimal';
    goal: 'awareness' | 'consideration' | 'conversion';
    targetAudience?: string;
    language?: string;
}

const PRICING = {
    'gpt-4-turbo-preview': { input: 0.01 / 1000, output: 0.03 / 1000 },
    'gpt-4-vision-preview': { input: 0.01 / 1000, output: 0.03 / 1000 },
    'gpt-4': { input: 0.03 / 1000, output: 0.06 / 1000 },
    'gpt-3.5-turbo': { input: 0.0005 / 1000, output: 0.0015 / 1000 }
};

class OpenAIService {
    private client: OpenAI;
    private config: Required<OpenAIConfig>;

    constructor(config: OpenAIConfig) {
        this.config = {
            apiKey: config.apiKey,
            organization: config.organization || '',
            maxRetries: config.maxRetries || 3,
            timeout: config.timeout || 30000
        };

        this.client = new OpenAI({
            apiKey: this.config.apiKey,
            organization: this.config.organization,
            maxRetries: this.config.maxRetries,
            timeout: this.config.timeout
        });
    }

    /**
     * Calculate cost based on token usage
     */
    private calculateCost(model: string, promptTokens: number, completionTokens: number): number {
        const pricing = PRICING[model as keyof typeof PRICING] || PRICING['gpt-4-turbo-preview'];
        return (promptTokens * pricing.input) + (completionTokens * pricing.output);
    }

    /**
     * Generate ad copy with GPT-4 Turbo
     */
    async generateAdCopy(params: CopyGenerationParams): Promise<GenerationResult<{
        headline: string;
        subheadline: string;
        description: string;
        cta: string;
        variants: Array<{
            headline: string;
            hookAngle: string;
            score: number;
        }>;
    }>> {
        const startTime = Date.now();

        const systemPrompt = `You are an expert ad copywriter specializing in high-converting ${params.tone} advertisements. 
Your goal is to create compelling, ${params.goal}-focused copy that resonates with ${params.targetAudience || 'the target audience'}.`;

        const userPrompt = `Create compelling ad copy for:
Product: ${params.productName}
${params.productDescription ? `Description: ${params.productDescription}` : ''}
${params.brandName ? `Brand: ${params.brandName}` : ''}
Tone: ${params.tone}
Goal: ${params.goal}
Language: ${params.language || 'English'}

Generate:
1. Main headline (3-8 words, attention-grabbing)
2. Subheadline (8-12 words, value proposition)
3. Description (15-25 words, benefits)
4. CTA (2-3 words, action-oriented)
5. 5 alternative headline variants with different hook angles (curiosity, urgency, social proof, benefit, problem-solution)

Return as JSON with structure:
{
  "headline": "string",
  "subheadline": "string", 
  "description": "string",
  "cta": "string",
  "variants": [
    {"headline": "string", "hookAngle": "curiosity", "score": 85}
  ]
}`;

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.8,
                max_tokens: 1500
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
                cost: this.calculateCost('gpt-4-turbo-preview', usage.prompt_tokens, usage.completion_tokens),
                model: response.model,
                latency: Date.now() - startTime
            };
        } catch (error: any) {
            console.error('OpenAI API Error:', error);
            throw new Error(`Failed to generate copy: ${error.message}`);
        }
    }

    /**
     * Enhance existing headline
     */
    async enhanceHeadline(headline: string, context?: { tone?: string; goal?: string }): Promise<GenerationResult> {
        const startTime = Date.now();

        const prompt = `Improve this ad headline to be more ${context?.tone || 'compelling'}:
"${headline}"

Make it:
- Concise (3-8 words)
- ${context?.goal === 'conversion' ? 'Action-oriented' : 'Attention-grabbing'}
- Free of clichés
- Emotionally resonant

Return ONLY the improved headline, nothing else.`;

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 50
            });

            const content = response.choices[0].message.content?.trim() || headline;
            const usage = response.usage!;

            return {
                content,
                usage: {
                    promptTokens: usage.prompt_tokens,
                    completionTokens: usage.completion_tokens,
                    totalTokens: usage.total_tokens
                },
                cost: this.calculateCost('gpt-4-turbo-preview', usage.prompt_tokens, usage.completion_tokens),
                model: response.model,
                latency: Date.now() - startTime
            };
        } catch (error: any) {
            console.error('OpenAI API Error:', error);
            return {
                content: headline,
                usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
                cost: 0,
                model: 'fallback',
                latency: Date.now() - startTime
            };
        }
    }

    /**
     * Generate CTA variants
     */
    async generateCTAVariants(productName: string, goal: string, count: number = 5): Promise<GenerationResult<string[]>> {
        const startTime = Date.now();

        const prompt = `Generate ${count} compelling CTA button texts for "${productName}".
Goal: ${goal}
Requirements:
- 2-3 words each
- Action verbs
- Urgency/value
- No generic "Click Here"

Return as JSON array: ["CTA 1", "CTA 2", ...]`;

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-3.5-turbo', // Cheaper model for simple task
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' },
                temperature: 0.9,
                max_tokens: 200
            });

            const parsed = JSON.parse(response.choices[0].message.content || '{"ctas": []}');
            const content = parsed.ctas || parsed.variants || Object.values(parsed)[0] || [];
            const usage = response.usage!;

            return {
                content,
                usage: {
                    promptTokens: usage.prompt_tokens,
                    completionTokens: usage.completion_tokens,
                    totalTokens: usage.total_tokens
                },
                cost: this.calculateCost('gpt-3.5-turbo', usage.prompt_tokens, usage.completion_tokens),
                model: response.model,
                latency: Date.now() - startTime
            };
        } catch (error: any) {
            console.error('OpenAI API Error:', error);
            return {
                content: ['Shop Now', 'Learn More', 'Get Started'],
                usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
                cost: 0,
                model: 'fallback',
                latency: Date.now() - startTime
            };
        }
    }

    /**
     * Analyze sentiment of text
     */
    async analyzeSentiment(text: string): Promise<GenerationResult<{
        sentiment: 'positive' | 'neutral' | 'negative';
        score: number;
        emotions: string[];
    }>> {
        const startTime = Date.now();

        const prompt = `Analyze the sentiment and emotional tone of this ad copy:
"${text}"

Return JSON:
{
  "sentiment": "positive|neutral|negative",
  "score": 0-100 (how positive/negative),
  "emotions": ["emotion1", "emotion2"] (e.g., excitement, trust, urgency)
}`;

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' },
                temperature: 0.3,
                max_tokens: 150
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
                cost: this.calculateCost('gpt-3.5-turbo', usage.prompt_tokens, usage.completion_tokens),
                model: response.model,
                latency: Date.now() - startTime
            };
        } catch (error: any) {
            console.error('OpenAI API Error:', error);
            return {
                content: { sentiment: 'neutral', score: 50, emotions: [] },
                usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
                cost: 0,
                model: 'fallback',
                latency: Date.now() - startTime
            };
        }
    }
}

/**
 * Get or create OpenAI service instance
 * 
 * 🚨 SECURITY: API key must be provided as parameter
 * DO NOT use process.env in browser - it's undefined in Vite!
 */
export function getOpenAIService(apiKey: string, organization?: string): OpenAIService {
    // Validate API key
    if (!apiKey || apiKey.trim() === '') {
        throw new Error('OpenAI API key is required');
    }

    // For server-side, create new instance each time with provided key
    // (Singleton pattern removed for security - no caching of keys)
    return new OpenAIService({
        apiKey,
        organization
    });
}

export { OpenAIService };
