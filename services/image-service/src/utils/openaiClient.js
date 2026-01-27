/**
 * OpenAI Client - NOW USING GEMINI AS BACKEND
 * This is a drop-in wrapper that routes all "OpenAI" calls to Gemini
 * 
 * THROTTLING: Limits to ~6 requests per minute to stay within Gemini's
 * free tier limit of 15 RPM (with safety margin)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 2000;
const MAX_DELAY_MS = 60000;

// THROTTLING: Space out requests to avoid rate limits
const MIN_REQUEST_INTERVAL_MS = 10000; // 10 seconds between requests = 6 RPM
let lastRequestTime = 0;
let requestQueue = Promise.resolve();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * OpenAI-compatible call that uses Gemini backend
 * Maintains same interface for easy migration
 * Now with request throttling to avoid rate limits
 */
export async function callOpenAI(config, context = 'Gemini') {
    // Queue requests to ensure proper spacing
    const result = requestQueue.then(async () => {
        // Ensure minimum interval between requests
        const timeSinceLastRequest = Date.now() - lastRequestTime;
        if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
            const waitTime = MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest;
            console.log(`[${context}] Throttling: waiting ${Math.round(waitTime / 1000)}s before next request...`);
            await sleep(waitTime);
        }
        lastRequestTime = Date.now();

        return executeGeminiCall(config, context);
    });

    // Chain next request to this one
    requestQueue = result.catch(() => { }).then(() => {
        lastRequestTime = Date.now();
    });

    return result;
}

async function executeGeminiCall(config, context) {
    let lastError = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
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
                            const imageUrl = item.image_url?.url;
                            if (imageUrl) {
                                if (imageUrl.startsWith('data:')) {
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
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsedContent = JSON.parse(jsonMatch[0]);
                }
            }

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
                // Longer delay on rate limit
                const delay = Math.min(INITIAL_DELAY_MS * Math.pow(2, attempt) + Math.random() * 2000, MAX_DELAY_MS);
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
    return null;
}

export default {
    callOpenAI,
    getOpenAIClient
};
