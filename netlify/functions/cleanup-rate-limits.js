import { cleanupRateLimitLog } from './_shared/rateLimiter.js';
import { schedule } from '@netlify/functions';

/**
 * Scheduled Function: Cleanup Rate Limit Logs
 * Runs every day at midnight to remove old entries.
 */
const handler = async (event) => {
    console.log('[Cleanup] Starting rate limit log cleanup...');
    try {
        await cleanupRateLimitLog();
        console.log('[Cleanup] Rate limit log cleanup completed.');
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Cleanup completed' })
        };
    } catch (error) {
        console.error('[Cleanup] Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Schedule it for 00:00 every day
export const scheduledHandler = schedule('0 0 * * *', handler);
export { handler };
