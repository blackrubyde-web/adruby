import type { Handler, HandlerEvent } from '@netlify/functions';
import OpenAI from 'openai';

/**
 * AI MAGIC TEXT - Serverless Function
 * 
 * Improves ad copy using GPT-4 with context awareness
 * - Secure: API keys stay server-side
 * - Fast: Optimized prompts
 * - Smart: Context-aware suggestions
 */

interface AIMagicRequest {
    currentText: string;
    context?: 'headline' | 'subheadline' | 'cta' | 'description';
    tone?: 'professional' | 'playful' | 'bold' | 'luxury' | 'minimal';
    productContext?: string;
    language?: string;
}

interface AIMagicResponse {
    suggestions: string[];
    primary: string;
}

export const handler: Handler = async (event: HandlerEvent) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    // Handle OPTIONS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse request
        const body: AIMagicRequest = JSON.parse(event.body || '{}');
        const {
            currentText,
            context = 'headline',
            tone = 'professional',
            productContext = '',
            language = 'de'
        } = body;

        // Validation
        if (!currentText || currentText.trim().length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'currentText is required' })
            };
        }

        // Initialize OpenAI
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error('[AI Magic] OPENAI_API_KEY not found in environment');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'OpenAI API key not configured' })
            };
        }

        const openai = new OpenAI({ apiKey });

        // Context-specific system prompts
        const contextPrompts = {
            headline: 'You are a world-class ad headline writer. Create punchy, attention-grabbing headlines that make people stop scrolling.',
            subheadline: 'You are an expert at writing compelling subheadlines that expand on the main message and build curiosity.',
            cta: 'You are a conversion optimization expert. Write CTAs that create urgency and drive action.',
            description: 'You are a master copywriter. Write benefit-focused descriptions that persuade and convert.'
        };

        const toneInstructions = {
            professional: 'Professional, credible, trustworthy tone.',
            playful: 'Fun, energetic, conversational tone.',
            bold: 'Confident, direct, powerful tone.',
            luxury: 'Sophisticated, premium, exclusive tone.',
            minimal: 'Clean, simple, modern tone.'
        };

        // Build prompt
        const systemPrompt = `${contextPrompts[context]}
${toneInstructions[tone]}
Language: ${language === 'de' ? 'German' : 'English'}

Rules:
- Keep it concise and impactful
- No hashtags or emojis
- Focus on benefits, not features
- Create 3 variations
- Return ONLY a JSON array of strings, nothing else`;

        const userPrompt = `Current text: "${currentText}"
${productContext ? `Product context: ${productContext}` : ''}

Improve this ${context} with 3 powerful variations. Return as JSON array: ["option 1", "option 2", "option 3"]`;

        console.log('[AI Magic] Calling OpenAI...');

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.8,
            max_tokens: 200,
            response_format: { type: 'json_object' }
        });

        const responseText = completion.choices[0]?.message?.content || '{}';
        console.log('[AI Magic] Raw response:', responseText);

        // Parse response
        let suggestions: string[];
        try {
            const parsed = JSON.parse(responseText);
            // Handle different response formats
            if (Array.isArray(parsed)) {
                suggestions = parsed;
            } else if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
                suggestions = parsed.suggestions;
            } else if (parsed.options && Array.isArray(parsed.options)) {
                suggestions = parsed.options;
            } else {
                // Fallback: extract first 3 string values
                suggestions = Object.values(parsed).filter((v): v is string => typeof v === 'string').slice(0, 3);
            }
        } catch (parseError) {
            console.error('[AI Magic] JSON parse failed:', parseError);
            // Emergency fallback
            suggestions = [currentText, currentText, currentText];
        }

        // Ensure we have 3 suggestions
        while (suggestions.length < 3) {
            suggestions.push(currentText);
        }
        suggestions = suggestions.slice(0, 3);

        const response: AIMagicResponse = {
            suggestions,
            primary: suggestions[0]
        };

        console.log('[AI Magic] Success:', response);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response)
        };

    } catch (error: any) {
        console.error('[AI Magic] Error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'AI Magic failed',
                message: error.message || 'Unknown error'
            })
        };
    }
};
