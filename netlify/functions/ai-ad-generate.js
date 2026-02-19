/**
 * AI Ad Builder - Full Generation (Text + Image)
 * Synchronous version that works within Netlify timeout limits
 * Uses existing AdRuby credit system
 */

// Imports removed as endpoint is deprecated and returns 410


const QUALITY_THRESHOLD = 7;
const MAX_QUALITY_RETRIES = 2;

export const handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || 'https://adruby.de',
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

    // This endpoint is deprecated — use ai-ad-generate-background instead.
    return {
        statusCode: 410,
        headers,
        body: JSON.stringify({
            error: 'Endpoint deprecated',
            message: 'Use ai-ad-generate-background for ad generation.'
        }),
    };
};

