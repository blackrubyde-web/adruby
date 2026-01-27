/**
 * OpenAI Client - NOW USING GEMINI AS BACKEND
 * This is a drop-in wrapper that routes all "OpenAI" calls to Gemini
 * to avoid OpenAI's restrictive rate limits
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * OpenAI-compatible call that uses Gemini backend
 * Maintains same interface for easy migration
 */
export async function callOpenAI(config, context = 'Gemini') {
    let lastError = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash-exp',
                generationConfig: {
                    responseMimeType: 'application/json'
                }
            });

            // Extract prompt from OpenAI format
            const messages = config.messages || [];
            const parts = [];

            for (const msg of messages) {
                if (typeof msg.content === 'string') {
                    parts.push({ text: `${msg.role}: ${msg.content}` });
                } else if (Array.isArray(msg.content)) {
                    for (const item of msg.content) {
                        if (item.type === 'text') {
                            parts.push({ text: item.text });
                        } else if (item.type === 'image_url') {
                            // Handle image URLs - fetch and convert to base64
                            const imageUrl = item.image_url?.url;
                            if (imageUrl) {
                                if (imageUrl.startsWith('data:')) {
                                    // Already base64
                                    const base64Match = imageUrl.match(/base64,(.+)/);
                                    if (base64Match) {
                                        parts.push({
                                            inlineData: {
                                                mimeType: 'image/png',
                                                data: base64Match[1]
                                            }
                                        });
                                    }
                                } else {
                                    // HTTP URL - fetch it
                                    try {
                                        const response = await fetch(imageUrl);
                                        const buffer = await response.arrayBuffer();
                                        const base64 = Buffer.from(buffer).toString('base64');
                                        parts.push({
                                            inlineData: {
                                                mimeType: 'image/png',
                                                data: base64
                                            }
                                        });
                                    } catch (fetchError) {
                                        console.warn(`[${context}] Could not fetch image: ${fetchError.message}`);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            const result = await model.generateContent(parts);
            const response = await result.response;
            const text = response.text();

            // Parse JSON and return in OpenAI-compatible format
            let parsedContent = text;
            try {
                parsedContent = JSON.parse(text);
            } catch {
                // Try to extract JSON
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsedContent = JSON.parse(jsonMatch[0]);
                }
            }

            // Return in OpenAI-compatible format
            return {
                choices: [{
                    message: {
                        content: JSON.stringify(parsedContent)
                    }
                }]
            };

        } catch (error) {
            lastError = error;

            if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
                const delay = Math.min(INITIAL_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000, MAX_DELAY_MS);
                console.warn(`[${context}] Rate limited, retrying in ${Math.round(delay / 1000)}s (attempt ${attempt + 1}/${MAX_RETRIES})`);
                await sleep(delay);
                continue;
            }

            if (error.status >= 500 || error.message?.includes('INTERNAL')) {
                const delay = Math.min(INITIAL_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000, MAX_DELAY_MS);
                console.warn(`[${context}] Server error, retrying in ${Math.round(delay / 1000)}s (attempt ${attempt + 1}/${MAX_RETRIES})`);
                await sleep(delay);
                continue;
            }

            throw error;
        }
    }

    console.error(`[${context}] All ${MAX_RETRIES} retries exhausted`);
    throw lastError;
}

export function getOpenAIClient() {
    // Return null - OpenAI client no longer used
    return null;
}

export default {
    callOpenAI,
    getOpenAIClient
};
