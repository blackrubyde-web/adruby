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
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        features: {
            templates: ['feature_callout', 'hero_product', 'stats_grid', 'comparison_split', 'lifestyle_context'],
            industries: ['tech', 'food', 'fashion', 'beauty', 'eco', 'fitness', 'saas', 'home'],
            effects: ['neon_glow', 'soft_shadow', 'vignette', 'grain', 'warm_tint', 'cool_tint']
        },
        dependencies: {
            sharp: !!sharp,
            gemini: !!process.env.GEMINI_API_KEY,
            openai: !!process.env.OPENAI_API_KEY
        }
    };
}

export default { healthCheck };
