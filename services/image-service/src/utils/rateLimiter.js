/**
 * RATE LIMITER
 * 
 * Rate limiting für AI API Calls:
 * - Token bucket algorithm
 * - Per-service limits
 * - Queue management
 */

// ========================================
// TOKEN BUCKET RATE LIMITER
// ========================================

class TokenBucket {
    constructor(tokensPerInterval, intervalMs) {
        this.tokensPerInterval = tokensPerInterval;
        this.intervalMs = intervalMs;
        this.tokens = tokensPerInterval;
        this.lastRefill = Date.now();
    }

    refill() {
        const now = Date.now();
        const elapsed = now - this.lastRefill;
        const tokensToAdd = Math.floor(elapsed / this.intervalMs) * this.tokensPerInterval;

        if (tokensToAdd > 0) {
            this.tokens = Math.min(this.tokensPerInterval, this.tokens + tokensToAdd);
            this.lastRefill = now;
        }
    }

    tryConsume(count = 1) {
        this.refill();

        if (this.tokens >= count) {
            this.tokens -= count;
            return true;
        }

        return false;
    }

    getWaitTime() {
        this.refill();

        if (this.tokens > 0) {
            return 0;
        }

        const tokensNeeded = 1 - this.tokens;
        return Math.ceil(tokensNeeded / this.tokensPerInterval * this.intervalMs);
    }
}

// ========================================
// SERVICE-SPECIFIC RATE LIMITERS
// ========================================

const rateLimiters = {
    // OpenAI GPT-4: 500 RPM / 30,000 TPM Tier 1
    openai: new TokenBucket(8, 1000),  // 8 requests per second

    // Google Gemini: 60 RPM
    gemini: new TokenBucket(1, 1000),  // 1 request per second

    // Foreplay: 100 RPM
    foreplay: new TokenBucket(1, 600), // 1 request per 600ms

    // General fallback
    default: new TokenBucket(10, 1000) // 10 requests per second
};

// ========================================
// RATE LIMITED EXECUTE
// ========================================

/**
 * Execute function with rate limiting
 */
export async function rateLimitedExecute(service, asyncFn) {
    const limiter = rateLimiters[service] || rateLimiters.default;

    // Wait if rate limited
    while (!limiter.tryConsume()) {
        const waitTime = limiter.getWaitTime();
        console.log(`[RateLimit] ${service}: Waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    return await asyncFn();
}

/**
 * Create rate-limited wrapper for async function
 */
export function createRateLimitedFn(service, asyncFn) {
    return async (...args) => {
        return await rateLimitedExecute(service, () => asyncFn(...args));
    };
}

// ========================================
// REQUEST QUEUE
// ========================================

class RequestQueue {
    constructor(concurrency = 3) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }

    async add(fn, priority = 0) {
        return new Promise((resolve, reject) => {
            const task = { fn, resolve, reject, priority };

            // Insert by priority
            const insertIndex = this.queue.findIndex(t => t.priority < priority);
            if (insertIndex === -1) {
                this.queue.push(task);
            } else {
                this.queue.splice(insertIndex, 0, task);
            }

            this.processQueue();
        });
    }

    async processQueue() {
        if (this.running >= this.concurrency || this.queue.length === 0) {
            return;
        }

        this.running++;
        const task = this.queue.shift();

        try {
            const result = await task.fn();
            task.resolve(result);
        } catch (error) {
            task.reject(error);
        } finally {
            this.running--;
            this.processQueue();
        }
    }

    get pending() {
        return this.queue.length;
    }

    get active() {
        return this.running;
    }
}

// Service-specific queues
export const queues = {
    openai: new RequestQueue(5),   // 5 concurrent OpenAI calls
    gemini: new RequestQueue(2),   // 2 concurrent Gemini calls
    foreplay: new RequestQueue(3), // 3 concurrent Foreplay calls
    composite: new RequestQueue(2) // 2 concurrent ad generations
};

/**
 * Queue a request
 */
export function queueRequest(service, fn, priority = 0) {
    const queue = queues[service] || queues.composite;
    return queue.add(fn, priority);
}

// ========================================
// THROTTLE HELPER
// ========================================

/**
 * Simple throttle function
 */
export function throttle(fn, minIntervalMs) {
    let lastCall = 0;
    let pendingCall = null;

    return async (...args) => {
        const now = Date.now();
        const elapsed = now - lastCall;

        if (elapsed >= minIntervalMs) {
            lastCall = now;
            return await fn(...args);
        }

        // Queue the call
        const waitTime = minIntervalMs - elapsed;

        if (pendingCall) {
            clearTimeout(pendingCall);
        }

        return new Promise((resolve, reject) => {
            pendingCall = setTimeout(async () => {
                lastCall = Date.now();
                try {
                    resolve(await fn(...args));
                } catch (e) {
                    reject(e);
                }
            }, waitTime);
        });
    };
}

// ========================================
// EXPORTS
// ========================================

export {
    TokenBucket,
    RequestQueue
};

export default {
    rateLimitedExecute,
    createRateLimitedFn,
    queueRequest,
    queues,
    throttle
};
