/**
 * AI Ad Builder - Simple Cache Implementation
 * In-memory cache for session-based caching
 */

class SimpleCache {
    constructor(ttl = 3600000) { // Default 1 hour TTL
        this.cache = new Map();
        this.ttl = ttl;
    }

    /**
     * Generate cache key from params
     */
    generateKey(prefix, params) {
        const sorted = Object.keys(params)
            .sort()
            .map(key => `${key}:${params[key]}`)
            .join('|');
        return `${prefix}:${sorted}`;
    }

    /**
     * Get item from cache
     */
    get(key) {
        const item = this.cache.get(key);

        if (!item) {
            return null;
        }

        // Check if expired
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        console.log('[Cache] HIT:', key);
        return item.value;
    }

    /**
     * Set item in cache
     */
    set(key, value, customTTL) {
        const ttl = customTTL || this.ttl;
        this.cache.set(key, {
            value,
            expiry: Date.now() + ttl,
        });
        console.log('[Cache] SET:', key, `(TTL: ${ttl}ms)`);
    }

    /**
     * Delete item from cache
     */
    delete(key) {
        this.cache.delete(key);
    }

    /**
     * Clear all items
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Get cache stats
     */
    stats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}

// Global cache instance (persists across function invocations in same container)
const adCache = new SimpleCache(3600000); // 1 hour TTL

export { adCache };
