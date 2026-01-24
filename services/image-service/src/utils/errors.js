/**
 * ERROR HANDLING UTILITIES
 * 
 * Einheitliches Error-Handling für den AdBuilder
 */

// ========================================
// CUSTOM ERROR CLASSES
// ========================================

export class AdGenerationError extends Error {
    constructor(phase, originalError, recoverable = true) {
        super(`[Phase ${phase}] ${originalError.message || originalError}`);
        this.name = 'AdGenerationError';
        this.phase = phase;
        this.recoverable = recoverable;
        this.originalError = originalError;
        this.timestamp = new Date().toISOString();
    }

    toJSON() {
        return {
            name: this.name,
            phase: this.phase,
            message: this.message,
            recoverable: this.recoverable,
            timestamp: this.timestamp
        };
    }
}

export class AIServiceError extends Error {
    constructor(service, originalError, retryable = true) {
        super(`[${service}] ${originalError.message || originalError}`);
        this.name = 'AIServiceError';
        this.service = service;
        this.retryable = retryable;
        this.originalError = originalError;
        this.timestamp = new Date().toISOString();
    }
}

export class ValidationError extends Error {
    constructor(field, message, value = undefined) {
        super(`Validation failed for '${field}': ${message}`);
        this.name = 'ValidationError';
        this.field = field;
        this.value = value;
    }
}

export class TimeoutError extends Error {
    constructor(operation, timeoutMs) {
        super(`Operation '${operation}' timed out after ${timeoutMs}ms`);
        this.name = 'TimeoutError';
        this.operation = operation;
        this.timeoutMs = timeoutMs;
    }
}

export class RateLimitError extends Error {
    constructor(service, retryAfterMs = 1000) {
        super(`Rate limit exceeded for '${service}'`);
        this.name = 'RateLimitError';
        this.service = service;
        this.retryAfterMs = retryAfterMs;
    }
}

// ========================================
// ERROR HANDLING HELPERS
// ========================================

/**
 * Wrap async function with error classification
 */
export function wrapWithErrorHandling(phase, asyncFn) {
    return async (...args) => {
        try {
            return await asyncFn(...args);
        } catch (error) {
            if (error instanceof AdGenerationError) {
                throw error;
            }
            throw new AdGenerationError(phase, error, true);
        }
    };
}

/**
 * Execute with timeout
 */
export async function withTimeout(promise, timeoutMs, operationName = 'operation') {
    let timeoutId;

    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new TimeoutError(operationName, timeoutMs));
        }, timeoutMs);
    });

    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutId);
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Retry with exponential backoff
 */
export async function withRetry(asyncFn, options = {}) {
    const {
        maxRetries = 3,
        baseDelayMs = 1000,
        maxDelayMs = 10000,
        factor = 2,
        onRetry = null
    } = options;

    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await asyncFn();
        } catch (error) {
            lastError = error;

            // Don't retry non-retryable errors
            if (error instanceof AIServiceError && !error.retryable) {
                throw error;
            }
            if (error instanceof ValidationError) {
                throw error;
            }

            if (attempt < maxRetries) {
                const delay = Math.min(baseDelayMs * Math.pow(factor, attempt), maxDelayMs);

                if (onRetry) {
                    onRetry(attempt + 1, delay, error);
                }

                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

/**
 * Execute with fallback
 */
export async function withFallback(primaryFn, fallbackFn, logger = console) {
    try {
        return await primaryFn();
    } catch (error) {
        logger.warn(`Primary function failed, using fallback:`, error.message);
        return await fallbackFn();
    }
}

export default {
    AdGenerationError,
    AIServiceError,
    ValidationError,
    TimeoutError,
    RateLimitError,
    wrapWithErrorHandling,
    withTimeout,
    withRetry,
    withFallback
};
