import { withCors, ok } from './utils/response.js';

/**
 * Health Check Endpoint
 * GET /api/api-health
 */
export const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return withCors({ statusCode: 200 });

    return ok({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
};
