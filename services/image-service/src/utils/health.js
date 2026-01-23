/**
 * Health Check - Service status endpoint
 */

import sharp from 'sharp';

/**
 * Check service health
 */
export function healthCheck() {
    return {
        status: 'healthy',
        service: 'adruby-image-service',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        dependencies: {
            sharp: !!sharp,
            gemini: !!process.env.GEMINI_API_KEY,
            openai: !!process.env.OPENAI_API_KEY
        }
    };
}

export default { healthCheck };
