/**
 * CACHE MANAGER
 * Intelligent caching for expensive operations
 * 
 * Features:
 * - LRU cache for font measurements
 * - Image processing results cache
 * - Template pre-warming
 * - Cache invalidation strategies
 */

interface CacheEntry<T> {
    value: T;
    timestamp: number;
    hits: number;
    size: number; // Approximate size in bytes
}

export class CacheManager<T = any> {
    private cache: Map<string, CacheEntry<T>>;
    private maxSize: number; // Maximum cache size in bytes
    private maxAge: number;  // Maximum age in ms
    private currentSize: number;

    constructor(maxSize: number = 50 * 1024 * 1024, maxAge: number = 60 * 60 * 1000) { // 50MB, 1 hour
        this.cache = new Map();
        this.maxSize = maxSize;
        this.maxAge = maxAge;
        this.currentSize = 0;
    }

    /**
     * Get cached value
     */
    get(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) return null;

        // Check if expired
        if (Date.now() - entry.timestamp > this.maxAge) {
            this.delete(key);
            return null;
        }

        // Update hit count
        entry.hits++;

        return entry.value;
    }

    /**
     * Set cache value
     */
    set(key: string, value: T, size: number = 1024): void {
        // Remove old entry if exists
        if (this.cache.has(key)) {
            this.delete(key);
        }

        // Evict if necessary
        while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
            this.evictLRU();
        }

        // Add new entry
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            hits: 0,
            size
        });

        this.currentSize += size;
    }

    /**
     * Delete cache entry
     */
    delete(key: string): boolean {
        const entry = this.cache.get(key);

        if (entry) {
            this.currentSize -= entry.size;
            return this.cache.delete(key);
        }

        return false;
    }

    /**
     * Evict least recently used entry
     */
    private evictLRU(): void {
        let lruKey: string | null = null;
        let lruTime = Infinity;

        // Find least recently used (lowest timestamp, lowest hits)
        for (const [key, entry] of this.cache.entries()) {
            const score = entry.timestamp + (entry.hits * 10000); // Favor frequently accessed
            if (score < lruTime) {
                lruTime = score;
                lruKey = key;
            }
        }

        if (lruKey) {
            this.delete(lruKey);
        }
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
        this.currentSize = 0;
    }

    /**
     * Get cache statistics
     */
    getStats(): {
        entries: number;
        size: number;
        maxSize: number;
        hitRate: number;
    } {
        let totalHits = 0;
        let entriesWithHits = 0;

        for (const entry of this.cache.values()) {
            totalHits += entry.hits;
            if (entry.hits > 0) entriesWithHits++;
        }

        return {
            entries: this.cache.size,
            size: this.currentSize,
            maxSize: this.maxSize,
            hitRate: this.cache.size > 0 ? (entriesWithHits / this.cache.size) * 100 : 0
        };
    }

    /**
     * Pre-warm cache with common values
     */
    preWarm(entries: Array<{ key: string; value: T; size?: number }>): void {
        entries.forEach(entry => {
            this.set(entry.key, entry.value, entry.size || 1024);
        });
    }
}

// Global caches
export const fontMeasurementCache = new CacheManager<{
    width: number;
    height: number;
    lines: number;
}>(10 * 1024 * 1024, 2 * 60 * 60 * 1000); // 10MB, 2 hours

export const colorExtractionCache = new CacheManager<{
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
}>(5 * 1024 * 1024, 30 * 60 * 1000); // 5MB, 30 minutes

export const templateCache = new CacheManager<any>(20 * 1024 * 1024, 60 * 60 * 1000); // 20MB, 1 hour

/**
 * Generate cache key for font measurements
 */
export function getFontMeasurementKey(
    text: string,
    fontSize: number,
    fontFamily: string,
    fontWeight: number | string
): string {
    return `font:${text.substring(0, 50)}:${fontSize}:${fontFamily}:${fontWeight}`;
}

/**
 * Generate cache key for color extraction
 */
export function getColorExtractionKey(imageBase64: string): string {
    // Use first 100 chars of base64 as key (crude but fast)
    const hash = imageBase64.substring(0, 100);
    return `color:${hash}`;
}

/**
 * Cache wrapper for expensive function
 */
export async function withCache<T>(
    cache: CacheManager<T>,
    key: string,
    fn: () => Promise<T>,
    size?: number
): Promise<T> {
    // Try cache first
    const cached = cache.get(key);
    if (cached !== null) {
        return cached;
    }

    // Execute function
    const result = await fn();

    // Store in cache
    cache.set(key, result, size);

    return result;
}
