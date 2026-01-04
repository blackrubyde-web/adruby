import OpenAI from 'openai';
import { requireUserId } from './_shared/auth.js';
import { badRequest, methodNotAllowed, ok, withCors } from './utils/response.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return withCors({ statusCode: 204, body: '' });
    }

    if (event.httpMethod !== 'POST') {
        return methodNotAllowed('POST,OPTIONS');
    }

    try {
        const auth = await requireUserId(event);
        if (!auth.ok) return auth.response;

        const { adDocument, imageUrl } = JSON.parse(event.body);
        if (!adDocument) {
            return badRequest('Missing adDocument');
        }

        // Analyze the current ad structure
        const layers = adDocument?.layers || [];
        const textLayers = layers.filter(l => l.type === 'text' || l.type === 'cta');
        const imageLayers = layers.filter(l => l.type === 'background' || l.type === 'product');

        const systemPrompt = `You are an expert ad designer and conversion optimizer. Analyze this ad and provide specific, actionable suggestions.

Return a JSON array of suggestions:
[
    {
        "id": "unique_id",
        "type": "warning" | "improvement" | "tip",
        "category": "headline" | "cta" | "layout" | "colors" | "image" | "copy",
        "title": "Short title",
        "description": "What to improve and why",
        "priority": 1-5 (5 = most important),
        "autoFixAvailable": true | false,
        "autoFixAction": { ... } // Optional: what to change if autofix
    }
]

Focus on:
- Headline length (too long/short?)
- CTA visibility and text
- Text readability (contrast, size)
- Layout balance
- Mobile-friendliness
- Urgency/scarcity elements
- Social proof presence`;

        const adDescription = `Ad Structure:
- Dimensions: ${adDocument?.width || 1080}x${adDocument?.height || 1080}
- Background: ${adDocument?.backgroundColor}
- Text layers: ${textLayers.map(l => `"${l.text}" (${l.fontSize}px, ${l.color})`).join(', ')}
- Image layers: ${imageLayers.length} images
- Has CTA: ${layers.some(l => l.type === 'cta') ? 'Yes' : 'No'}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Analyze this ad and suggest improvements:\n\n${adDescription}` }
            ],
            max_tokens: 800,
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content);
        const suggestions = result.suggestions || result;

        return ok({
            success: true,
            suggestions: Array.isArray(suggestions) ? suggestions : []
        });
    } catch (error) {
        console.error('AI Suggestions Error:', error);
        return withCors({
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message || 'Suggestions generation failed'
            })
        });
    }
};
