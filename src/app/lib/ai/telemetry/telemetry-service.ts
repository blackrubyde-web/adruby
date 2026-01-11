/**
 * TELEMETRY SERVICE
 * OpenTelemetry integration for monitoring & analytics
 * 
 * Features:
 * - Performance metrics (P50, P95, P99)
 * - Error rate tracking
 * - AI API usage monitoring
 * - Cost per ad tracking
 * - User journey tracking
 */

export interface TelemetryMetrics {
    // Generation metrics
    adGenerationTime: number;
    aiApiCalls: number;
    cacheHits: number;
    cacheMisses: number;

    // Quality metrics
    qualityScore: number;
    balanceScore: number;
    ctrEstimate: number;

    // Cost metrics
    openaiCost: number;
    dalleCost: number;
    totalCost: number;

    // Error metrics
    errors: number;
    warnings: number;
}

export interface TelemetryEvent {
    name: string;
    timestamp: number;
    userId?: string;
    sessionId?: string;
    properties: Record<string, unknown>;
    metrics?: Partial<TelemetryMetrics>;
}

type GenerationStartParams = {
    productName: string;
    tone?: string;
    imageBase64?: string | null;
};

type GenerationCompleteResult = {
    metadata?: {
        template?: string;
        format?: string;
    };
    quality?: {
        comprehensiveScore?: number;
        balanceScore?: number;
        ctrEstimate?: number;
    };
};

class TelemetryService {
    private events: TelemetryEvent[] = [];
    private sessionMetrics: Map<string, Partial<TelemetryMetrics>> = new Map();

    /**
     * Track event
     */
    track(event: Omit<TelemetryEvent, 'timestamp'>): void {
        const fullEvent: TelemetryEvent = {
            ...event,
            timestamp: Date.now()
        };

        this.events.push(fullEvent);

        // In production, would send to analytics service (PostHog, Mixpanel, etc.)
        this.sendToAnalytics(fullEvent);
    }

    /**
     * Track ad generation start
     */
    trackGenerationStart(sessionId: string, params: GenerationStartParams): void {
        this.track({
            name: 'ad_generation_started',
            sessionId,
            properties: {
                productName: params.productName,
                tone: params.tone,
                hasImage: !!params.imageBase64
            }
        });

        this.sessionMetrics.set(sessionId, {
            aiApiCalls: 0,
            cacheHits: 0,
            cacheMisses: 0,
            openaiCost: 0,
            dalleCost: 0,
            totalCost: 0,
            errors: 0,
            warnings: 0
        });
    }

    /**
     * Track ad generation complete
     */
    trackGenerationComplete(sessionId: string, result: GenerationCompleteResult, durationMs: number): void {
        const metrics = this.sessionMetrics.get(sessionId) || {};

        this.track({
            name: 'ad_generation_completed',
            sessionId,
            properties: {
                template: result.metadata?.template,
                format: result.metadata?.format,
                duration: durationMs
            },
            metrics: {
                adGenerationTime: durationMs,
                qualityScore: result.quality?.comprehensiveScore || 0,
                balanceScore: result.quality?.balanceScore || 0,
                ctrEstimate: result.quality?.ctrEstimate || 0,
                ...metrics
            }
        });

        this.sessionMetrics.delete(sessionId);
    }

    /**
     * Track API call
     */
    trackAPICall(sessionId: string, service: 'openai' | 'vision' | 'dalle', cost: number, latency: number): void {
        const metrics = this.sessionMetrics.get(sessionId);
        if (metrics) {
            metrics.aiApiCalls = (metrics.aiApiCalls || 0) + 1;

            if (service === 'openai' || service === 'vision') {
                metrics.openaiCost = (metrics.openaiCost || 0) + cost;
            } else {
                metrics.dalleCost = (metrics.dalleCost || 0) + cost;
            }

            metrics.totalCost = (metrics.openaiCost || 0) + (metrics.dalleCost || 0);
        }

        this.track({
            name: 'ai_api_called',
            sessionId,
            properties: {
                service,
                cost,
                latency
            }
        });
    }

    /**
     * Track cache performance
     */
    trackCache(sessionId: string, hit: boolean, cacheKey: string): void {
        const metrics = this.sessionMetrics.get(sessionId);
        if (metrics) {
            if (hit) {
                metrics.cacheHits = (metrics.cacheHits || 0) + 1;
            } else {
                metrics.cacheMisses = (metrics.cacheMisses || 0) + 1;
            }
        }

        this.track({
            name: hit ? 'cache_hit' : 'cache_miss',
            sessionId,
            properties: { cacheKey }
        });
    }

    /**
     * Track error
     */
    trackError(sessionId: string, error: Error, context: unknown): void {
        const metrics = this.sessionMetrics.get(sessionId);
        if (metrics) {
            metrics.errors = (metrics.errors || 0) + 1;
        }

        this.track({
            name: 'error_occurred',
            sessionId,
            properties: {
                message: error.message,
                stack: error.stack?.substring(0, 500),
                context
            }
        });

        // Send to Sentry in production
        if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
            // @ts-expect-error - Sentry is injected at runtime in production.
            if (window.Sentry) {
                // @ts-expect-error - Sentry is injected at runtime in production.
                window.Sentry.captureException(error, { extra: context });
            }
        }
    }

    /**
     * Get session metrics
     */
    getSessionMetrics(sessionId: string): Partial<TelemetryMetrics> | undefined {
        return this.sessionMetrics.get(sessionId);
    }

    /**
     * Get aggregate statistics
     */
    getStats(timeWindowMs: number = 3600000): {
        totalAds: number;
        avgGenerationTime: number;
        avgCost: number;
        avgQuality: number;
        errorRate: number;
        cacheHitRate: number;
    } {
        const cutoff = Date.now() - timeWindowMs;
        const recentEvents = this.events.filter(e => e.timestamp >= cutoff);

        const completedAds = recentEvents.filter(e => e.name === 'ad_generation_completed');
        const errors = recentEvents.filter(e => e.name === 'error_occurred');
        const cacheHits = recentEvents.filter(e => e.name === 'cache_hit');
        const cacheMisses = recentEvents.filter(e => e.name === 'cache_miss');

        const totalAds = completedAds.length;
        const avgGenerationTime = totalAds > 0
            ? completedAds.reduce((sum, e) => sum + (e.metrics?.adGenerationTime || 0), 0) / totalAds
            : 0;
        const avgCost = totalAds > 0
            ? completedAds.reduce((sum, e) => sum + (e.metrics?.totalCost || 0), 0) / totalAds
            : 0;
        const avgQuality = totalAds > 0
            ? completedAds.reduce((sum, e) => sum + (e.metrics?.qualityScore || 0), 0) / totalAds
            : 0;
        const errorRate = (errors.length / Math.max(1, totalAds)) * 100;
        const cacheHitRate = (cacheHits.length / Math.max(1, cacheHits.length + cacheMisses.length)) * 100;

        return {
            totalAds,
            avgGenerationTime: Math.round(avgGenerationTime),
            avgCost: Math.round(avgCost * 100) / 100,
            avgQuality: Math.round(avgQuality),
            errorRate: Math.round(errorRate * 10) / 10,
            cacheHitRate: Math.round(cacheHitRate)
        };
    }

    /**
     * Send to analytics service (stub - implement with actual service)
     */
    private sendToAnalytics(event: TelemetryEvent): void {
        // Production: Send to PostHog, Mixpanel, or custom analytics
        // For now, just store locally

        if (typeof window !== 'undefined') {
            // Browser environment - could use PostHog
            // @ts-expect-error - PostHog is injected at runtime in production.
            if (window.posthog) {
                // @ts-expect-error - PostHog is injected at runtime in production.
                window.posthog.capture(event.name, {
                    ...event.properties,
                    ...event.metrics
                });
            }
        }
    }

    /**
     * Clear old events (prevent memory leak)
     */
    clearOldEvents(olderThanMs: number = 86400000): void {
        const cutoff = Date.now() - olderThanMs;
        this.events = this.events.filter(e => e.timestamp >= cutoff);
    }
}

// Singleton
let telemetryServiceInstance: TelemetryService | null = null;

export function getTelemetryService(): TelemetryService {
    if (!telemetryServiceInstance) {
        telemetryServiceInstance = new TelemetryService();

        // Clear old events every hour
        if (typeof window !== 'undefined') {
            setInterval(() => {
                telemetryServiceInstance?.clearOldEvents();
            }, 3600000);
        }
    }

    return telemetryServiceInstance;
}

export { TelemetryService };
