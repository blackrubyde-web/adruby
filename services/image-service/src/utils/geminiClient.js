/**
 * Gemini Client with Rate Limit Retry
 * Centralized client for text analysis tasks
 * Uses gemini-1.5-flash for fast, cheap text analysis
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call Gemini for text/JSON analysis
 * @param {Object} config - { prompt, systemPrompt, jsonMode, imageBase64 }
 * @param {string} context - Logging context
 */
export async function callGemini(config, context = 'Gemini') {
    const { prompt, systemPrompt, jsonMode = true, imageBase64 = null, model = 'gemini-2.0-flash' } = config;

    let lastError = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const geminiModel = genAI.getGenerativeModel({
                model,
                generationConfig: jsonMode ? {
                    responseMimeType: 'application/json'
                } : undefined
            });

            // Build content parts
            const parts = [];

            // Add system prompt if provided
            if (systemPrompt) {
                parts.push({ text: systemPrompt + '\n\n' });
            }

            // Add image if provided
            if (imageBase64) {
                parts.push({
                    inlineData: {
                        mimeType: 'image/png',
                        data: imageBase64
                    }
                });
            }

            // Add main prompt
            parts.push({ text: prompt });

            const result = await geminiModel.generateContent(parts);
            const response = await result.response;
            const text = response.text();

            // Parse JSON if in jsonMode
            if (jsonMode) {
                try {
                    return { content: JSON.parse(text), raw: text };
                } catch (parseError) {
                    // Try to extract JSON from response
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        return { content: JSON.parse(jsonMatch[0]), raw: text };
                    }
                    console.warn(`[${context}] JSON parse failed, returning raw text`);
                    return { content: {}, raw: text };
                }
            }

            return { content: text, raw: text };

        } catch (error) {
            lastError = error;

            // Check for rate limit errors
            if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
                const delay = Math.min(
                    INITIAL_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000,
                    MAX_DELAY_MS
                );
                console.warn(`[${context}] Rate limited, retrying in ${Math.round(delay / 1000)}s (attempt ${attempt + 1}/${MAX_RETRIES})`);
                await sleep(delay);
                continue;
            }

            // Check for retryable server errors
            if (error.status >= 500 || error.message?.includes('INTERNAL')) {
                const delay = Math.min(
                    INITIAL_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000,
                    MAX_DELAY_MS
                );
                console.warn(`[${context}] Server error, retrying in ${Math.round(delay / 1000)}s (attempt ${attempt + 1}/${MAX_RETRIES})`);
                await sleep(delay);
                continue;
            }

            // Non-retryable error
            throw error;
        }
    }

    console.error(`[${context}] All ${MAX_RETRIES} retries exhausted`);
    throw lastError;
}

/**
 * Call Gemini Vision for image analysis
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} prompt - Analysis prompt
 * @param {string} context - Logging context
 */
export async function callGeminiVision(imageBuffer, prompt, context = 'GeminiVision') {
    const base64 = imageBuffer.toString('base64');
    return callGemini({
        prompt,
        imageBase64: base64,
        jsonMode: true,
        model: 'gemini-2.0-flash'
    }, context);
}

export default {
    callGemini,
    callGeminiVision
};
