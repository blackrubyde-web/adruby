/**
 * OpenAI Client with Rate Limit Retry
 * Centralized client that handles 429 errors with exponential backoff
 */

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 1000;  // 1 second
const MAX_DELAY_MS = 60000;     // 60 seconds

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * OpenAI API call with automatic retry on rate limits (429)
 * Uses exponential backoff with jitter
 */
export async function callOpenAI(config, context = 'OpenAI') {
    let lastError = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const response = await openai.chat.completions.create(config);
            return response;
        } catch (error) {
            lastError = error;

            // Check if it's a rate limit error (429)
            if (error.status === 429 || error.message?.includes('429')) {
                const delay = Math.min(
                    INITIAL_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000,
                    MAX_DELAY_MS
                );

                console.warn(`[${context}] Rate limited (429), retrying in ${Math.round(delay / 1000)}s (attempt ${attempt + 1}/${MAX_RETRIES})`);
                await sleep(delay);
                continue;
            }

            // Check for other retryable errors (500, 502, 503, 504)
            if ([500, 502, 503, 504].includes(error.status)) {
                const delay = Math.min(
                    INITIAL_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000,
                    MAX_DELAY_MS
                );

                console.warn(`[${context}] Server error (${error.status}), retrying in ${Math.round(delay / 1000)}s (attempt ${attempt + 1}/${MAX_RETRIES})`);
                await sleep(delay);
                continue;
            }

            // Non-retryable error, throw immediately
            throw error;
        }
    }

    // All retries exhausted
    console.error(`[${context}] All ${MAX_RETRIES} retries exhausted`);
    throw lastError;
}

/**
 * Get the raw OpenAI client (for special cases)
 */
export function getOpenAIClient() {
    return openai;
}

export default {
    callOpenAI,
    getOpenAIClient
};
