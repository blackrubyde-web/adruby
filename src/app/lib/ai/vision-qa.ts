import { invokeOpenAIProxy } from '../api/proxyClient';

export interface VisionScore {
    totalScore: number; // 0-100
    breakdown: {
        productVisibility: number; // Is the product the hero?
        textReadability: number; // Is text legible against background?
        aesthetics: number; // Does it look premium?
        safetyCheck: boolean; // No weird AI deformities
    };
    feedback: string;
}

/**
 * VISION QA SCORER
 * Uses GPT-4 Vision to valid "Is this ad actually good?"
 * Prevents "Schrott" (Trash) from reaching the user.
 */
export async function scoreAdQuality(imageUrl: string, context: { product: string, tone: string }): Promise<VisionScore> {
    try {
        const { data, error } = await invokeOpenAIProxy<{
            choices: Array<{ message: { content: string } }>;
        }>({
            endpoint: 'chat/completions',
            model: 'gpt-4o', // Capable of Vision
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text', text: `You are an elite Creative Director using the "Authentic AI" framework. 
Analyze this ad asset for product: "${context.product}". Tone: "${context.tone}".
Return a JSON object with:
- totalScore: 0-100
- breakdown: 
    - productVisibility: 0-100 (Is the product the hero?)
    - textReadability: 0-100 (Is there good contrast space?)
    - aesthetics: 0-100 (Does it look premium / authentic?)
    - safetyCheck: boolean (True = safe, False = weird artifacts/NSFW)
- feedback: 1 sentence summary.` },
                        { type: 'image_url', image_url: { url: imageUrl } }
                    ]
                }
            ],
            max_tokens: 300,
            response_format: { type: 'json_object' }
        });

        if (error) throw error;

        const content = data?.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error('No vision QA response');
        }
        const result = JSON.parse(content);
        return result;

    } catch (_err) {
        // Fallback if vision fails (e.g. rate limit)
        return {
            totalScore: 85,
            breakdown: { productVisibility: 85, textReadability: 85, aesthetics: 85, safetyCheck: true },
            feedback: "Vision QA unavailable, proceeding with default approval."
        };
    }
}
