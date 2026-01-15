/**
 * AI Ad Builder - Retry Utility
 * Implements exponential backoff retry logic for API calls
 */

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Result of the function
 */
export async function withRetry(fn, options = {}) {
    const {
        maxRetries = 3,
        initialDelay = 1000,
        maxDelay = 10000,
        backoffMultiplier = 2,
        onRetry = null,
    } = options;

    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry on certain errors
            if (shouldNotRetry(error)) {
                throw error;
            }

            // Last attempt, throw error
            if (attempt === maxRetries - 1) {
                throw error;
            }

            // Calculate delay with exponential backoff
            const delay = Math.min(
                initialDelay * Math.pow(backoffMultiplier, attempt),
                maxDelay
            );

            console.warn(
                `[Retry] Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${delay}ms...`,
                error.message
            );

            if (onRetry) {
                onRetry(attempt + 1, delay, error);
            }

            await sleep(delay);
        }
    }

    throw lastError;
}

/**
 * Determine if an error should not be retried
 */
function shouldNotRetry(error) {
    // Don't retry on authentication errors
    if (error.status === 401 || error.status === 403) {
        return true;
    }

    // Don't retry on bad request errors
    if (error.status === 400) {
        return true;
    }

    // Don't retry on content policy violations
    if (error.code === 'content_policy_violation') {
        return true;
    }

    // Don't retry on insufficient credits
    if (error.message?.includes('Insufficient credits')) {
        return true;
    }

    return false;
}

/**
 * Sleep for a given duration
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry with jitter to avoid thundering herd
 */
export async function withRetryJitter(fn, options = {}) {
    return withRetry(fn, {
        ...options,
        onRetry: (attempt, delay, error) => {
            // Add random jitter (±25%)
            const jitter = delay * 0.25 * (Math.random() - 0.5);
            const jitteredDelay = Math.max(0, delay + jitter);

            if (options.onRetry) {
                options.onRetry(attempt, jitteredDelay, error);
            }
        },
    });
}
