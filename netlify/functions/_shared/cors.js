/**
 * Shared CORS utility for Netlify Functions
 * Replaces hardcoded 'Access-Control-Allow-Origin': '*' with origin whitelist.
 */

const ALLOWED_ORIGINS = [
    'https://adruby.com',
    'https://www.adruby.com',
    'https://app.adruby.com',
    'http://localhost:5173',
    'http://localhost:3000',
];

/**
 * Get CORS headers with proper origin whitelisting.
 * @param {object} event - Netlify function event object
 * @returns {Record<string, string>} Headers object with correct CORS origin
 */
export function getCorsHeaders(event) {
    const origin = event?.headers?.origin || event?.headers?.Origin || '';
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://adruby.com';
    /** @type {Record<string, string>} */
    const headers = {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };
    return headers;
}
