/**
 * RATE LIMITER
 * 
 * Simple in-memory rate limiting for API protection.
 * Uses Supabase for persistent tracking across serverless invocations.
 */

import { supabaseAdmin } from './clients.js';

// Default limits per action
const RATE_LIMITS = {
    ai_ad_generate: { maxRequests: 10, windowMinutes: 60 },   // 10 per hour
    ai_ad_generate_light: { maxRequests: 30, windowMinutes: 60 }, // 30 per hour (lighter)
    creative_analyze: { maxRequests: 20, windowMinutes: 60 },
    default: { maxRequests: 100, windowMinutes: 60 }
};

/**
 * Check if user is within rate limits
 * @param {string} userId - User ID
 * @param {string} action - Action type (ai_ad_generate, etc.)
 * @returns {Promise<{allowed: boolean, remaining: number, resetAt: Date}>}
 */
export async function checkRateLimit(userId, action = 'default') {
    const config = RATE_LIMITS[action] || RATE_LIMITS.default;
    const windowStart = new Date(Date.now() - config.windowMinutes * 60 * 1000);

    try {
        // Count recent requests in the window
        const { count, error } = await supabaseAdmin
            .from('rate_limit_log')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('action', action)
            .gte('created_at', windowStart.toISOString());

        if (error) {
            console.error('[RateLimiter] Count error:', error.message);
            // Fail open - allow request if we can't check
            return { allowed: true, remaining: config.maxRequests, resetAt: new Date() };
        }

        const currentCount = count || 0;
        const allowed = currentCount < config.maxRequests;
        const remaining = Math.max(0, config.maxRequests - currentCount - 1);
        const resetAt = new Date(windowStart.getTime() + config.windowMinutes * 60 * 1000);

        if (allowed) {
            // Log this request
            await supabaseAdmin.from('rate_limit_log').insert({
                user_id: userId,
                action: action,
                created_at: new Date().toISOString()
            });
        }

        console.log(`[RateLimiter] User ${userId} action ${action}: ${currentCount + 1}/${config.maxRequests} (${allowed ? 'ALLOWED' : 'BLOCKED'})`);

        return { allowed, remaining, resetAt };
    } catch (err) {
        console.error('[RateLimiter] Error:', err.message);
        // Fail open
        return { allowed: true, remaining: config.maxRequests, resetAt: new Date() };
    }
}

/**
 * Clean up old rate limit entries (run periodically)
 */
export async function cleanupRateLimitLog() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    const { error } = await supabaseAdmin
        .from('rate_limit_log')
        .delete()
        .lt('created_at', cutoff.toISOString());

    if (error) {
        console.error('[RateLimiter] Cleanup error:', error.message);
    }
}

/**
 * Get rate limit config for an action
 */
export function getRateLimitConfig(action) {
    return RATE_LIMITS[action] || RATE_LIMITS.default;
}

export default {
    checkRateLimit,
    cleanupRateLimitLog,
    getRateLimitConfig,
    RATE_LIMITS
};
