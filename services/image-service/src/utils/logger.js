/**
 * STRUCTURED LOGGER
 * 
 * Production-grade logging with:
 * - Structured JSON output
 * - Log levels
 * - Request context
 * - Performance timing
 */

// ========================================
// LOG LEVELS
// ========================================

const LOG_LEVELS = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60
};

const LEVEL_NAMES = {
    10: 'TRACE',
    20: 'DEBUG',
    30: 'INFO',
    40: 'WARN',
    50: 'ERROR',
    60: 'FATAL'
};

// ========================================
// LOGGER CLASS
// ========================================

class Logger {
    constructor(options = {}) {
        this.name = options.name || 'image-service';
        this.level = LOG_LEVELS[options.level || process.env.LOG_LEVEL || 'info'] || LOG_LEVELS.info;
        this.pretty = options.pretty || process.env.NODE_ENV !== 'production';
        this.context = options.context || {};
    }

    child(context) {
        return new Logger({
            name: this.name,
            level: Object.keys(LOG_LEVELS).find(k => LOG_LEVELS[k] === this.level),
            pretty: this.pretty,
            context: { ...this.context, ...context }
        });
    }

    _log(level, message, data = {}) {
        if (level < this.level) return;

        const entry = {
            timestamp: new Date().toISOString(),
            level: LEVEL_NAMES[level],
            service: this.name,
            ...this.context,
            message,
            ...data
        };

        if (this.pretty) {
            this._prettyPrint(entry);
        } else {
            console.log(JSON.stringify(entry));
        }
    }

    _prettyPrint(entry) {
        const levelColors = {
            TRACE: '\x1b[90m',
            DEBUG: '\x1b[36m',
            INFO: '\x1b[32m',
            WARN: '\x1b[33m',
            ERROR: '\x1b[31m',
            FATAL: '\x1b[35m'
        };
        const reset = '\x1b[0m';
        const color = levelColors[entry.level] || reset;

        let output = `${color}[${entry.timestamp}] ${entry.level}${reset}: ${entry.message}`;

        // Add extra data
        const extraKeys = Object.keys(entry).filter(k => !['timestamp', 'level', 'service', 'message'].includes(k));
        if (extraKeys.length > 0) {
            const extra = {};
            extraKeys.forEach(k => extra[k] = entry[k]);
            output += ` ${JSON.stringify(extra)}`;
        }

        console.log(output);
    }

    trace(message, data) { this._log(LOG_LEVELS.trace, message, data); }
    debug(message, data) { this._log(LOG_LEVELS.debug, message, data); }
    info(message, data) { this._log(LOG_LEVELS.info, message, data); }
    warn(message, data) { this._log(LOG_LEVELS.warn, message, data); }
    error(message, data) { this._log(LOG_LEVELS.error, message, data); }
    fatal(message, data) { this._log(LOG_LEVELS.fatal, message, data); }
}

// ========================================
// DEFAULT LOGGER INSTANCE
// ========================================

export const logger = new Logger();

// ========================================
// REQUEST CONTEXT LOGGER
// ========================================

export function createRequestLogger(req) {
    return logger.child({
        requestId: req.id || req.headers['x-request-id'] || generateRequestId(),
        method: req.method,
        path: req.path
    });
}

function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ========================================
// PERFORMANCE TIMER
// ========================================

export class Timer {
    constructor(name) {
        this.name = name;
        this.startTime = Date.now();
        this.marks = {};
    }

    mark(label) {
        this.marks[label] = Date.now() - this.startTime;
    }

    elapsed() {
        return Date.now() - this.startTime;
    }

    end(log = logger) {
        const duration = this.elapsed();
        log.info(`Timer [${this.name}] completed`, {
            duration,
            durationMs: `${duration}ms`,
            marks: this.marks
        });
        return duration;
    }
}

// ========================================
// PHASE LOGGER FOR PIPELINE
// ========================================

export class PipelineLogger {
    constructor(requestId) {
        this.requestId = requestId;
        this.log = logger.child({ requestId, component: 'pipeline' });
        this.startTime = Date.now();
        this.phases = [];
    }

    startPhase(phase, name) {
        const phaseLog = {
            phase,
            name,
            startTime: Date.now()
        };
        this.phases.push(phaseLog);
        this.log.info(`▶ PHASE ${phase}: ${name}`, { phase, name });
    }

    endPhase(phase, details = {}) {
        const phaseLog = this.phases.find(p => p.phase === phase);
        if (phaseLog) {
            phaseLog.duration = Date.now() - phaseLog.startTime;
            phaseLog.details = details;
            this.log.info(`✓ PHASE ${phase} completed`, {
                phase,
                duration: phaseLog.duration,
                ...details
            });
        }
    }

    complete(result = {}) {
        const totalDuration = Date.now() - this.startTime;
        this.log.info('Pipeline completed', {
            totalDuration,
            phases: this.phases.map(p => ({
                phase: p.phase,
                name: p.name,
                duration: p.duration
            })),
            ...result
        });

        return {
            totalDuration,
            phases: this.phases
        };
    }

    error(phase, error) {
        this.log.error(`✗ PHASE ${phase} failed`, {
            phase,
            error: error.message,
            stack: error.stack
        });
    }
}

// ========================================
// EXPRESS MIDDLEWARE
// ========================================

export function requestLoggerMiddleware(req, res, next) {
    const requestId = req.headers['x-request-id'] || generateRequestId();
    req.id = requestId;
    req.log = createRequestLogger(req);

    const startTime = Date.now();

    // Log request start
    req.log.info('Request started', {
        body: Object.keys(req.body || {}),
        query: req.query
    });

    // Log response
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logFn = res.statusCode >= 400 ? req.log.warn.bind(req.log) : req.log.info.bind(req.log);
        logFn('Request completed', {
            statusCode: res.statusCode,
            duration
        });
    });

    next();
}

export default {
    Logger,
    logger,
    createRequestLogger,
    Timer,
    PipelineLogger,
    requestLoggerMiddleware
};
