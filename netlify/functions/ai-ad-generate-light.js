/**
 * AI Ad Builder - Lightweight Text-Only Generation
 * Fast version that only generates ad copy (no image) to avoid timeout
 */

import { getOpenAiClient, getOpenAiModel } from './_shared/openai.js';
import { buildPromptFromForm, buildPromptFromFreeText } from './_shared/aiAdPromptBuilder.js';
import { getUserProfile } from './_shared/auth.js';

export const handler = async (event) => {
    const startTime = Date.now();

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { mode, language = 'de' } = body;

        // Optional Auth (make it work for testing)
        const authHeader = event.headers.authorization || event.headers.Authorization;
        let user = null;
        if (authHeader) {
            user = await getUserProfile(authHeader);
        }

        // Build Prompts
        let promptData;
        if (mode === 'form') {
            promptData = buildPromptFromForm(body);
        } else if (mode === 'free') {
            const { text, template } = body;
            if (!text) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing text' }) };
            }
            promptData = buildPromptFromFreeText(text, template, language);
        } else {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid mode' }) };
        }

        console.log('[AI Ad Generate Light] Starting for user:', user?.id || 'anonymous');

        const openai = getOpenAiClient();
        const model = getOpenAiModel();

        // Generate text only - should be fast (~3-5s)
        const copyResponse = await openai.chat.completions.create({
            model,
            messages: [
                { role: 'system', content: promptData.system },
                { role: 'user', content: promptData.user },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8,
            max_tokens: 800,
        });

        const adCopy = JSON.parse(copyResponse.choices[0].message.content);

        console.log('[AI Ad Generate Light] Text generated in', Date.now() - startTime, 'ms');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    headline: adCopy.headline || '',
                    slogan: adCopy.slogan || '',
                    description: adCopy.description || '',
                    cta: adCopy.cta || '',
                    imagePrompt: adCopy.imagePrompt || '',
                    template: promptData.template?.id || 'product_launch',
                },
                metadata: {
                    model,
                    timestamp: Date.now(),
                    generationTime: Date.now() - startTime,
                    type: 'text-only',
                },
            }),
        };

    } catch (error) {
        console.error('[AI Ad Generate Light] Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Generation failed',
                message: error.message,
            }),
        };
    }
};
