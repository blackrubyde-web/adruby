/**
 * MEMORY MANAGEMENT UTILITIES
 * 
 * Buffer handling und GC optimization für hochfrequente Requests
 */

import { logger } from './logger.js';

// ========================================
// BUFFER POOL
// ========================================

class BufferPool {
    constructor(options = {}) {
        this.maxSize = options.maxSize || 100 * 1024 * 1024; // 100MB
        this.currentSize = 0;
        this.buffers = new Map();
        this.log = logger.child({ component: 'buffer_pool' });
    }

    /**
     * Store buffer with automatic cleanup
     */
    store(id, buffer) {
        const size = buffer.length;

        // Check if we need to free space
        while (this.currentSize + size > this.maxSize && this.buffers.size > 0) {
            const oldest = this.buffers.keys().next().value;
            this.release(oldest);
        }

        this.buffers.set(id, { buffer, size, timestamp: Date.now() });
        this.currentSize += size;

        this.log.debug(`Buffer stored: ${id}`, { size, poolSize: this.currentSize });

        return id;
    }

    /**
     * Get buffer
     */
    get(id) {
        const entry = this.buffers.get(id);
        return entry?.buffer || null;
    }

    /**
     * Release buffer
     */
    release(id) {
        const entry = this.buffers.get(id);
        if (entry) {
            this.currentSize -= entry.size;
            this.buffers.delete(id);
            this.log.debug(`Buffer released: ${id}`, { poolSize: this.currentSize });
            return true;
        }
        return false;
    }

    /**
     * Clear all buffers
     */
    clear() {
        const count = this.buffers.size;
        this.buffers.clear();
        this.currentSize = 0;
        this.log.info(`Buffer pool cleared`, { count });
    }

    /**
     * Get stats
     */
    stats() {
        return {
            count: this.buffers.size,
            size: this.currentSize,
            maxSize: this.maxSize,
            utilization: (this.currentSize / this.maxSize * 100).toFixed(1) + '%'
        };
    }
}

// Shared pool instance
export const bufferPool = new BufferPool();

// ========================================
// SCOPED BUFFER MANAGER
// ========================================

/**
 * Manage buffers for a single request with automatic cleanup
 */
export class ScopedBufferManager {
    constructor(requestId) {
        this.requestId = requestId;
        this.buffers = new Map();
        this.log = logger.child({ component: 'buffer_manager', requestId });
    }

    /**
     * Register buffer for tracking
     */
    track(name, buffer) {
        this.buffers.set(name, buffer);
        return buffer;
    }

    /**
     * Replace buffer (releases old, tracks new)
     */
    replace(name, newBuffer) {
        const old = this.buffers.get(name);
        if (old) {
            // Mark for GC
            this.buffers.set(name, null);
        }
        this.buffers.set(name, newBuffer);
        return newBuffer;
    }

    /**
     * Get buffer
     */
    get(name) {
        return this.buffers.get(name);
    }

    /**
     * Release specific buffer
     */
    release(name) {
        this.buffers.set(name, null);
        this.buffers.delete(name);
    }

    /**
     * Cleanup all buffers
     */
    cleanup() {
        const count = this.buffers.size;
        this.buffers.forEach((_, key) => {
            this.buffers.set(key, null);
        });
        this.buffers.clear();

        // Hint GC
        if (global.gc) {
            global.gc();
        }

        this.log.debug(`Cleaned up ${count} buffers`);
    }

    /**
     * Get memory usage
     */
    memoryUsage() {
        let total = 0;
        this.buffers.forEach(buffer => {
            if (buffer?.length) {
                total += buffer.length;
            }
        });
        return total;
    }
}

// ========================================
// MEMORY MONITORING
// ========================================

/**
 * Get current memory stats
 */
export function getMemoryStats() {
    const usage = process.memoryUsage();
    return {
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
        external: Math.round(usage.external / 1024 / 1024),
        rss: Math.round(usage.rss / 1024 / 1024),
        unit: 'MB',
        heapUsedPercent: ((usage.heapUsed / usage.heapTotal) * 100).toFixed(1)
    };
}

/**
 * Check if memory is under pressure
 */
export function isMemoryPressure(thresholdPercent = 80) {
    const usage = process.memoryUsage();
    const percent = (usage.heapUsed / usage.heapTotal) * 100;
    return percent > thresholdPercent;
}

/**
 * Force garbage collection if available
 */
export function requestGC() {
    if (global.gc) {
        global.gc();
        return true;
    }
    return false;
}

// ========================================
// STREAMING COMPOSITE HELPER
// ========================================

/**
 * Composite buffers with memory optimization
 * Nulls intermediate buffers to allow GC
 */
export async function streamingComposite(sharp, operations, options = {}) {
    const { onProgress, releaseIntermediates = true } = options;

    let current = null;

    for (let i = 0; i < operations.length; i++) {
        const op = operations[i];

        if (onProgress) {
            onProgress(i, operations.length);
        }

        // Execute operation
        const result = await op(current);

        // Release intermediate
        if (releaseIntermediates && current && i < operations.length - 1) {
            current = null;
        }

        current = result;
    }

    return current;
}

// ========================================
// MEMORY PRESSURE MIDDLEWARE
// ========================================

/**
 * Express middleware to check memory before heavy operations
 */
export function memoryPressureMiddleware(thresholdPercent = 85) {
    const log = logger.child({ component: 'memory_check' });

    return (req, res, next) => {
        if (isMemoryPressure(thresholdPercent)) {
            log.warn('Memory pressure detected', getMemoryStats());

            // Try to free memory
            requestGC();
            bufferPool.clear();

            // Check again
            if (isMemoryPressure(thresholdPercent)) {
                return res.status(503).json({
                    success: false,
                    error: 'Service temporarily unavailable due to high memory usage',
                    retryAfter: 5
                });
            }
        }

        next();
    };
}

export default {
    BufferPool,
    bufferPool,
    ScopedBufferManager,
    getMemoryStats,
    isMemoryPressure,
    requestGC,
    streamingComposite,
    memoryPressureMiddleware
};
