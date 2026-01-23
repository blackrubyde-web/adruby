/**
 * Foreplay API Client
 * 
 * Integration with Foreplay's 100M+ ad database.
 * Used to fetch reference ads for learning design patterns.
 */

const FOREPLAY_BASE_URL = 'https://public.api.foreplay.co';

/**
 * Main Foreplay client class
 */
export class ForeplayClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.cache = new Map();
        this.cacheExpiry = 1000 * 60 * 60; // 1 hour
    }

    /**
     * Make authenticated request to Foreplay API
     */
    async request(endpoint, params = {}) {
        const url = new URL(`${FOREPLAY_BASE_URL}${endpoint}`);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach(v => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, value);
                }
            }
        });

        console.log(`[Foreplay] Requesting: ${endpoint}`);

        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': this.apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`Foreplay API error: ${response.status} - ${error.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();

        // Log remaining credits
        const creditsRemaining = response.headers.get('X-Credits-Remaining');
        if (creditsRemaining) {
            console.log(`[Foreplay] Credits remaining: ${creditsRemaining}`);
        }

        return data;
    }

    /**
     * Search ads by industry/niche with quality filters
     */
    async searchAdsByNiche(niche, options = {}) {
        const cacheKey = `niche:${niche}:${JSON.stringify(options)}`;

        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                console.log(`[Foreplay] Using cached results for ${niche}`);
                return cached.data;
            }
        }

        const params = {
            niches: [niche],
            display_format: options.format || 'image',
            running_duration_min_days: options.minRunDays || 14,
            languages: options.languages || ['en'],
            live: options.live !== false ? 'true' : undefined,
            order: options.order || 'longest_running',
            limit: options.limit || 10
        };

        const result = await this.request('/api/discovery/ads', params);

        this.cache.set(cacheKey, {
            data: result.data,
            timestamp: Date.now()
        });

        return result.data || [];
    }

    /**
     * Search by niche with custom query and filters
     * Used by product matcher for smart ad discovery
     */
    async searchByNiche(niche, options = {}) {
        const cacheKey = `byniche:${niche}:${options.query}:${options.runningDurationMin}`;

        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                console.log(`[Foreplay] Using cached results for ${niche}`);
                return cached.data;
            }
        }

        const params = {
            query: options.query || '',
            niches: [niche],
            display_format: 'image',
            running_duration_min_days: options.runningDurationMin || 30,
            order: options.order || 'longest_running',
            live: 'true',
            limit: options.limit || 10
        };

        try {
            const result = await this.request('/api/discovery/ads', params);

            this.cache.set(cacheKey, {
                data: result.data,
                timestamp: Date.now()
            });

            return result.data || [];
        } catch (error) {
            console.error('[Foreplay] searchByNiche error:', error.message);
            return [];
        }
    }

    /**
     * Get ads similar to a product/prompt
     * Searches by keywords extracted from the prompt
     */
    async findSimilarAds(prompt, industry, options = {}) {
        const cacheKey = `similar:${prompt}:${industry}`;

        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            }
        }

        // Map industry to Foreplay niches
        const nicheMap = {
            'tech': 'app/software',
            'food': 'food/drink',
            'fashion': 'fashion',
            'beauty': 'beauty',
            'eco': 'home/garden',
            'fitness': 'health/wellness',
            'saas': 'app/software',
            'home': 'home/garden'
        };

        const niche = nicheMap[industry] || 'other';

        const params = {
            query: this.extractKeywords(prompt),
            niches: [niche],
            display_format: 'image',
            running_duration_min_days: 7,
            order: 'most_relevant',
            limit: options.limit || 5
        };

        const result = await this.request('/api/discovery/ads', params);

        const ads = result.data || [];

        this.cache.set(cacheKey, {
            data: ads,
            timestamp: Date.now()
        });

        return ads;
    }

    /**
     * Get user's curated swipefile ads
     */
    async getSwipefileAds(options = {}) {
        const params = {
            display_format: options.format || 'image',
            order: options.order || 'saved_newest',
            limit: options.limit || 50
        };

        const result = await this.request('/api/swipefile/ads', params);
        return result.data || [];
    }

    /**
     * Get detailed ad information
     */
    async getAdDetails(adId) {
        const cacheKey = `ad:${adId}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        const result = await this.request(`/api/ad/${adId}`);

        this.cache.set(cacheKey, {
            data: result.data,
            timestamp: Date.now()
        });

        return result.data;
    }

    /**
     * Get top-performing ads for an industry
     * Focus on long-running ads (30+ days = proven success)
     */
    async getTopPerformingAds(industry, options = {}) {
        const nicheMap = {
            'tech': 'app/software',
            'food': 'food/drink',
            'fashion': 'fashion',
            'beauty': 'beauty',
            'eco': 'home/garden',
            'fitness': 'health/wellness',
            'saas': 'app/software',
            'home': 'home/garden',
            'accessories': 'accessories',
            'jewelry': 'jewelry/watches'
        };

        const niche = nicheMap[industry] || industry;

        return this.searchAdsByNiche(niche, {
            minRunDays: 30,
            order: 'longest_running',
            limit: options.limit || 20,
            ...options
        });
    }

    /**
     * Check API usage/credits
     */
    async checkUsage() {
        const result = await this.request('/api/usage');
        return result.data;
    }

    /**
     * Extract relevant keywords from a prompt
     */
    extractKeywords(prompt) {
        if (!prompt) return '';

        // Remove common filler words
        const stopWords = ['a', 'an', 'the', 'for', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'of', 'with', 'create', 'make', 'generate', 'ad', 'advertisement'];

        const words = prompt.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word));

        return words.slice(0, 5).join(' ');
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('[Foreplay] Cache cleared');
    }
}

/**
 * Create Foreplay client instance
 */
export function createForeplayClient(apiKey) {
    if (!apiKey) {
        console.warn('[Foreplay] No API key provided');
        return null;
    }
    return new ForeplayClient(apiKey);
}

export default { ForeplayClient, createForeplayClient };
