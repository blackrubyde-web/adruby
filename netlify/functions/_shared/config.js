/**
 * CENTRALIZED CONFIGURATION
 * 
 * All magic numbers, timeouts, and configurable values in one place.
 * Override via environment variables.
 */

// ============================================
// TIMEOUTS (in milliseconds)
// ============================================
export const TIMEOUTS = {
    /** Timeout for fetching external images */
    IMAGE_FETCH: parseInt(process.env.TIMEOUT_IMAGE_FETCH || '15000', 10),

    /** Timeout for Gemini API calls */
    GEMINI_API: parseInt(process.env.TIMEOUT_GEMINI_API || '60000', 10),

    /** Timeout for OpenAI API calls */
    OPENAI_API: parseInt(process.env.TIMEOUT_OPENAI_API || '120000', 10),

    /** Timeout for Supabase operations */
    SUPABASE: parseInt(process.env.TIMEOUT_SUPABASE || '10000', 10),
};

// ============================================
// QUALITY SETTINGS
// ============================================
export const QUALITY = {
    /** Minimum quality score to pass (1-10) */
    MIN_SCORE: parseInt(process.env.QUALITY_MIN_SCORE || '8', 10),

    /** Maximum retries for quality improvement */
    MAX_RETRIES: parseInt(process.env.QUALITY_MAX_RETRIES || '2', 10),

    /** Canvas size for generated ads */
    CANVAS_SIZE: parseInt(process.env.CANVAS_SIZE || '1080', 10),
};

// ============================================
// RATE LIMITS
// ============================================
export const RATE_LIMITS = {
    /** Gemini requests per minute */
    GEMINI_PER_MINUTE: parseInt(process.env.GEMINI_RATE_PER_MINUTE || '15', 10),

    /** Gemini requests per day */
    GEMINI_PER_DAY: parseInt(process.env.GEMINI_RATE_PER_DAY || '1500', 10),

    /** Consecutive errors before fallback */
    ERROR_THRESHOLD: parseInt(process.env.ERROR_THRESHOLD || '3', 10),
};

// ============================================
// CREDITS
// ============================================
export const CREDITS = {
    /** Cost for AI ad generation */
    AI_AD_GENERATE: parseInt(process.env.CREDIT_AI_AD || '10', 10),

    /** Cost for creative analysis */
    CREATIVE_ANALYZE: parseInt(process.env.CREDIT_ANALYZE || '1', 10),

    /** Cost for creative generation */
    CREATIVE_GENERATE: parseInt(process.env.CREDIT_GENERATE || '5', 10),
};

// ============================================
// SECURITY
// ============================================
export const SECURITY = {
    /** Allowed origins for CORS */
    ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS ||
        'https://adruby.com,https://www.adruby.com,https://app.adruby.com,http://localhost:5173,http://localhost:3000'
    ).split(','),

    /** Allowed hosts for image URLs (SSRF protection) */
    ALLOWED_IMAGE_HOSTS: (process.env.ALLOWED_IMAGE_HOSTS ||
        'res.cloudinary.com,cdn.shopify.com,images.unsplash.com,supabase.co,storage.googleapis.com,s3.amazonaws.com,i.imgur.com'
    ).split(','),
};

// ============================================
// AI MODELS
// ============================================
export const AI_MODELS = {
    /** Gemini model for image generation */
    GEMINI_IMAGE: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',

    /** GPT model for vision analysis */
    GPT_VISION: process.env.GPT_VISION_MODEL || 'gpt-4o',

    /** GPT model for image generation */
    GPT_IMAGE: process.env.GPT_IMAGE_MODEL || 'gpt-image-1',
};

// ============================================
// FEATURE FLAGS
// ============================================
export const FEATURES = {
    /** Use Gemini for image generation */
    USE_GEMINI: process.env.GEMINI_API_KEY ? true : false,

    /** Enable reference pattern system */
    USE_REFERENCE_PATTERNS: process.env.DISABLE_REFERENCE_PATTERNS !== 'true',

    /** Always apply SVG text overlay */
    FORCE_SVG_TEXT: process.env.FORCE_SVG_TEXT !== 'false',
};

// ============================================
// HELPER: Fetch with timeout
// ============================================
export async function fetchWithTimeout(url, options = {}, timeoutMs = TIMEOUTS.IMAGE_FETCH) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error(`Request timeout after ${timeoutMs}ms: ${url}`);
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

export default {
    TIMEOUTS,
    QUALITY,
    RATE_LIMITS,
    CREDITS,
    SECURITY,
    AI_MODELS,
    FEATURES,
    fetchWithTimeout
};
