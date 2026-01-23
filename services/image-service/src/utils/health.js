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
        version: '4.0.0',
        timestamp: new Date().toISOString(),
        features: {
            eliteGeneration: true,
            productMatcher: true,
            elitePromptBuilder: true,
            foreplayIntegration: true,
            gptVisionAnalysis: true,
            industries: ['tech', 'food', 'fashion', 'beauty', 'eco', 'fitness', 'saas', 'home'],
            effects: ['neon_glow', 'soft_shadow', 'vignette', 'grain', 'warm_tint', 'cool_tint']
        },
        dependencies: {
            sharp: !!sharp,
            gemini: !!process.env.GEMINI_API_KEY,
            openai: !!process.env.OPENAI_API_KEY,
            foreplay: !!process.env.FOREPLAY_API_KEY
        }
    };
}

export default { healthCheck };
