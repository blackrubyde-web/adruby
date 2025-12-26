import type { Handler, HandlerEvent } from '@netlify/functions';

/**
 * Netlify Function: OpenAI Proxy
 * Proxies requests to OpenAI API to avoid CORS issues
 * and keep API key secure on server side
 */
export const handler: Handler = async (event: HandlerEvent) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Get API key from environment
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'OpenAI API key not configured' })
        };
    }

    try {
        // Parse request body
        const body = JSON.parse(event.body || '{}');
        const { endpoint = 'chat/completions', ...requestData } = body;

        // Validate endpoint (security)
        const allowedEndpoints = ['chat/completions', 'images/generations'];
        if (!allowedEndpoints.includes(endpoint)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid endpoint' })
            };
        }

        // Call OpenAI API
        const response = await fetch(`https://api.openai.com/v1/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        // Return response
        return {
            statusCode: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Allow from any origin (or restrict to your domain)
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('OpenAI proxy error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};
