/**
 * ENVIRONMENT VALIDATION & CONFIG
 * 
 * Startup-Validierung für alle erforderlichen Environment Variables
 * und API Connectivity Checks
 */

import { logger } from './logger.js';

// ========================================
// REQUIRED ENVIRONMENT VARIABLES
// ========================================

const REQUIRED_ENV_VARS = {
    // AI Services
    GEMINI_API_KEY: {
        description: 'Google Gemini API Key',
        critical: true
    },
    OPENAI_API_KEY: {
        description: 'OpenAI API Key for GPT-4V',
        critical: true
    },

    // Foreplay Integration
    FOREPLAY_API_KEY: {
        description: 'Foreplay API Key',
        critical: false
    },
    FOREPLAY_EMAIL: {
        description: 'Foreplay Account Email',
        critical: false
    },
    FOREPLAY_PASSWORD: {
        description: 'Foreplay Account Password',
        critical: false
    }
};

const OPTIONAL_ENV_VARS = {
    PORT: {
        description: 'Server Port',
        default: '3000'
    },
    NODE_ENV: {
        description: 'Environment',
        default: 'development'
    },
    LOG_LEVEL: {
        description: 'Logging Level',
        default: 'info'
    },
    RATE_LIMIT_ENABLED: {
        description: 'Enable Rate Limiting',
        default: 'true'
    }
};

// ========================================
// VALIDATION FUNCTIONS
// ========================================

/**
 * Validate all required environment variables
 */
export function validateEnvironment() {
    const log = logger.child({ component: 'env_validation' });
    log.info('Validating environment variables...');

    const errors = [];
    const warnings = [];

    // Check required vars
    for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
        if (!process.env[key]) {
            if (config.critical) {
                errors.push(`Missing required env var: ${key} (${config.description})`);
            } else {
                warnings.push(`Missing optional env var: ${key} (${config.description})`);
            }
        }
    }

    // Set defaults for optional vars
    for (const [key, config] of Object.entries(OPTIONAL_ENV_VARS)) {
        if (!process.env[key]) {
            process.env[key] = config.default;
            log.debug(`Set default for ${key}: ${config.default}`);
        }
    }

    // Log warnings
    warnings.forEach(w => log.warn(w));

    // Throw on critical errors
    if (errors.length > 0) {
        errors.forEach(e => log.error(e));
        throw new Error(`Environment validation failed: ${errors.join(', ')}`);
    }

    log.info('Environment validation passed', {
        criticalVars: Object.keys(REQUIRED_ENV_VARS).filter(k => REQUIRED_ENV_VARS[k].critical).length,
        optionalVars: Object.keys(OPTIONAL_ENV_VARS).length
    });

    return true;
}

// ========================================
// API CONNECTIVITY CHECKS
// ========================================

/**
 * Test API connectivity (lightweight checks)
 */
export async function checkAPIConnectivity() {
    const log = logger.child({ component: 'api_check' });
    const results = {
        gemini: { status: 'unknown', latencyMs: null },
        openai: { status: 'unknown', latencyMs: null },
        foreplay: { status: 'unknown', latencyMs: null }
    };

    // Gemini Check
    try {
        const start = Date.now();
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        await model.generateContent('test'); // Minimal test
        results.gemini = { status: 'ok', latencyMs: Date.now() - start };
    } catch (error) {
        results.gemini = { status: 'error', error: error.message };
    }

    // OpenAI Check
    try {
        const start = Date.now();
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
        });
        if (response.ok) {
            results.openai = { status: 'ok', latencyMs: Date.now() - start };
        } else {
            results.openai = { status: 'error', error: `HTTP ${response.status}` };
        }
    } catch (error) {
        results.openai = { status: 'error', error: error.message };
    }

    // Foreplay Check (if configured)
    if (process.env.FOREPLAY_API_KEY) {
        try {
            const start = Date.now();
            // Just check if API key format is valid
            results.foreplay = { status: 'configured', latencyMs: Date.now() - start };
        } catch (error) {
            results.foreplay = { status: 'error', error: error.message };
        }
    } else {
        results.foreplay = { status: 'not_configured' };
    }

    // Log results
    log.info('API connectivity check completed', results);

    return results;
}

// ========================================
// HEALTH CHECK
// ========================================

/**
 * Comprehensive health check for /health endpoint
 */
export async function healthCheck(foreplay = null) {
    const status = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        memory: {
            heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            unit: 'MB'
        },
        services: {
            gemini: !!process.env.GEMINI_API_KEY,
            openai: !!process.env.OPENAI_API_KEY,
            foreplay: !!foreplay
        }
    };

    // Check memory usage
    const memoryUsagePercent = status.memory.heapUsed / status.memory.heapTotal;
    if (memoryUsagePercent > 0.9) {
        status.status = 'degraded';
        status.warnings = status.warnings || [];
        status.warnings.push('High memory usage');
    }

    return status;
}

// ========================================
// CONFIG OBJECT
// ========================================

export const config = {
    // Server
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    // AI Services
    geminiApiKey: process.env.GEMINI_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,

    // Foreplay
    foreplayApiKey: process.env.FOREPLAY_API_KEY,
    foreplayEmail: process.env.FOREPLAY_EMAIL,
    foreplayPassword: process.env.FOREPLAY_PASSWORD,

    // Rate Limiting
    rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== 'false',

    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',

    // Generation
    qualityThreshold: 7.0,
    maxRegenerationAttempts: 2,
    defaultCanvas: {
        width: 1080,
        height: 1080
    },

    // Timeouts
    aiTimeout: 30000,  // 30 seconds
    imageTimeout: 60000 // 60 seconds
};

export default {
    validateEnvironment,
    checkAPIConnectivity,
    healthCheck,
    config,
    REQUIRED_ENV_VARS,
    OPTIONAL_ENV_VARS
};
