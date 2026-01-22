/**
 * STRUCTURED LOGGER
 * 
 * Production-grade logging with:
 * - Log levels (debug, info, warn, error)
 * - Structured JSON output for log aggregation
 * - Context injection (requestId, userId)
 * - Sensitive data masking
 * - Performance timing
 */

const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};

const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL || 'info'];

// Fields that should be masked in logs
const SENSITIVE_FIELDS = ['authorization', 'password', 'token', 'apiKey', 'secret'];

/**
 * Mask sensitive data in objects
 */
function maskSensitive(obj, depth = 0) {
    if (depth > 3 || !obj || typeof obj !== 'object') return obj;

    const masked = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();

        if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
            masked[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
            masked[key] = maskSensitive(value, depth + 1);
        } else if (typeof value === 'string' && value.length > 100) {
            masked[key] = value.substring(0, 50) + '...[truncated]';
        } else {
            masked[key] = value;
        }
    }

    return masked;
}

/**
 * Truncate user ID for privacy (GDPR)
 */
function truncateUserId(userId) {
    if (!userId || typeof userId !== 'string') return 'unknown';
    return userId.substring(0, 8) + '...';
}

/**
 * Create a logger instance with context
 */
export function createLogger(context = {}) {
    const { module = 'App', requestId = null, userId = null } = context;

    const formatMessage = (level, message, data = {}) => {
        const timestamp = new Date().toISOString();
        const safeData = maskSensitive(data);

        return {
            timestamp,
            level,
            module,
            requestId,
            userId: userId ? truncateUserId(userId) : null,
            message,
            ...safeData
        };
    };

    const log = (level, message, data) => {
        if (LOG_LEVELS[level] < CURRENT_LEVEL) return;

        const entry = formatMessage(level, message, data);

        // In production, output JSON for log aggregation
        if (process.env.NODE_ENV === 'production') {
            console[level === 'debug' ? 'log' : level](JSON.stringify(entry));
        } else {
            // In dev, use pretty console output
            const emoji = {
                debug: '🔍',
                info: '📘',
                warn: '⚠️',
                error: '❌'
            }[level];

            console[level === 'debug' ? 'log' : level](
                `${emoji} [${module}] ${message}`,
                Object.keys(data).length > 0 ? data : ''
            );
        }

        return entry;
    };

    return {
        debug: (message, data = {}) => log('debug', message, data),
        info: (message, data = {}) => log('info', message, data),
        warn: (message, data = {}) => log('warn', message, data),
        error: (message, data = {}) => log('error', message, data),

        // Create child logger with additional context
        child: (additionalContext) => createLogger({ ...context, ...additionalContext }),

        // Timer for performance measurement
        startTimer: (label) => {
            const start = Date.now();
            return {
                end: (data = {}) => {
                    const duration = Date.now() - start;
                    log('info', `${label} completed`, { ...data, durationMs: duration });
                    return duration;
                }
            };
        }
    };
}

// Default logger instance
export const logger = createLogger({ module: 'AdRuby' });

// Convenience exports
export const debug = logger.debug;
export const info = logger.info;
export const warn = logger.warn;
export const error = logger.error;

export default {
    createLogger,
    logger,
    debug,
    info,
    warn,
    error
};
