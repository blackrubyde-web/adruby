// AI Service Module for AdRuby Studio
// Provides text generation and background removal capabilities

import { apiClient } from '../../utils/apiClient';

export interface AiTextRequest {
    prompt: string;
    context?: string;
    style?: 'punchy' | 'professional' | 'casual' | 'urgent';
    maxLength?: number;
}

export interface AiTextResponse {
    text: string;
    alternatives?: string[];
}

export interface AiBgRemovalRequest {
    imageUrl: string;
}

export interface AiBgRemovalResponse {
    processedUrl: string;
    success: boolean;
}

// --- Text Generation ---
export async function generateAdCopy(request: AiTextRequest): Promise<AiTextResponse> {
    const { prompt, context, style = 'punchy', maxLength = 50 } = request;

    // Build system prompt for ad copy
    const systemPrompt = `You are an expert ad copywriter. Generate compelling, conversion-focused ad copy.
Style: ${style}
Max characters: ${maxLength}
Be direct, use power words, create urgency.
Return ONLY the copy text, no explanations.`;

    const userPrompt = context
        ? `Product/Service: ${context}\nTask: ${prompt}`
        : prompt;

    try {
        // Try OpenAI first
        const data = await apiClient.post<{ text: string; alternatives?: string[] }>(
            '/api/ai-generate-text',
            {
                systemPrompt,
                userPrompt,
                model: 'gpt-4o-mini'
            }
        );
        return {
            text: data.text,
            alternatives: data.alternatives
        };
    } catch (e) {
        console.warn('OpenAI API failed, using fallback:', e);
    }

    // Fallback: Generate locally using templates
    const templates: Record<string, string[]> = {
        headline: [
            'Transform Your Life Today',
            'The Future Starts Here',
            'Unlock Your Potential',
            'Don\'t Miss Out',
            'Limited Time Only'
        ],
        cta: [
            'Get Started Now',
            'Claim Your Spot',
            'Try It Free',
            'Shop Now',
            'Learn More'
        ],
        subheadline: [
            'Join thousands of satisfied customers',
            'Rated #1 by experts',
            'Fast, easy, and affordable',
            'No credit card required',
            'Free shipping worldwide'
        ]
    };

    // Detect intent and pick template
    const promptLower = prompt.toLowerCase();
    let pool = templates.headline;
    if (promptLower.includes('button') || promptLower.includes('cta')) {
        pool = templates.cta;
    } else if (promptLower.includes('sub') || promptLower.includes('description')) {
        pool = templates.subheadline;
    }

    const randomText = pool[Math.floor(Math.random() * pool.length)];
    return { text: randomText, alternatives: pool.slice(0, 3) };
}

// --- Background Removal ---
export async function removeBackground(request: AiBgRemovalRequest): Promise<AiBgRemovalResponse> {
    const { imageUrl } = request;

    try {
        // Call our backend API which connects to remove.bg or similar
        const data = await apiClient.post<{ processedUrl: string }>(
            '/api/ai/remove-background',
            { imageUrl }
        );
        return {
            processedUrl: data.processedUrl,
            success: true
        };
    } catch (e) {
        console.warn('Background removal API failed:', e);
    }

    // Fallback: Return original with transparency simulation
    // In production, this would call remove.bg, PhotoRoom, or Clipdrop API
    return {
        processedUrl: imageUrl, // Would be processed URL in production
        success: false
    };
}

// --- Variant Generation with AI ---
export async function generateVariantCopy(originalText: string, count: number = 3): Promise<string[]> {
    const prompt = `Generate ${count} alternative versions of this ad copy. Make each unique but keep the same meaning:
Original: "${originalText}"
Return only the alternatives, one per line, no numbering.`;

    const result = await generateAdCopy({ prompt });

    if (result.alternatives && result.alternatives.length > 0) {
        return result.alternatives;
    }

    // Fallback variations
    return [
        originalText.toUpperCase(),
        originalText.split(' ').slice(0, -1).join(' ') + '!',
        '✨ ' + originalText
    ];
}

// --- Performance Analysis ---
export interface AdAnalysis {
    readabilityScore: number;
    emotionalImpact: 'low' | 'medium' | 'high';
    suggestedImprovements: string[];
}

export function analyzeAdCopy(text: string): AdAnalysis {
    const words = text.split(/\s+/).length;
    const hasEmoji = /[\u{1F600}-\u{1F6FF}]/u.test(text);
    const hasExclamation = text.includes('!');
    const hasQuestion = text.includes('?');
    const hasPowerWords = /free|now|limited|exclusive|save|new|best|proven|guaranteed/i.test(text);

    const readabilityScore = Math.min(100, Math.max(0,
        100 - (words > 10 ? (words - 10) * 5 : 0) +
        (hasPowerWords ? 10 : 0) +
        (hasExclamation ? 5 : 0)
    ));

    const emotionalImpact =
        (hasPowerWords && hasExclamation) ? 'high' :
            (hasPowerWords || hasEmoji) ? 'medium' : 'low';

    const suggestedImprovements: string[] = [];
    if (words > 15) suggestedImprovements.push('Shorten to under 10 words for better impact');
    if (!hasPowerWords) suggestedImprovements.push('Add power words like FREE, NOW, or LIMITED');
    if (!hasExclamation && !hasQuestion) suggestedImprovements.push('Add punctuation for emotional impact');
    if (!hasEmoji) suggestedImprovements.push('Consider adding an emoji for visual appeal');

    return {
        readabilityScore,
        emotionalImpact,
        suggestedImprovements
    };
}
