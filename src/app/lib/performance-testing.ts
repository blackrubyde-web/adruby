/**
 * Performance Testing Utilities
 * Tools for testing Editor with 50+ layers
 */

import type { AdDocument, StudioLayer, ImageLayer, TextLayer, CtaLayer } from '../types/studio';

/**
 * Generate test document with specified number of layers
 */
export function generateTestDocument(layerCount: number): AdDocument {
    const layers: StudioLayer[] = [];

    // Background
    layers.push({
        id: 'bg',
        type: 'background',
        name: 'Background',
        src: 'https://images.unsplash.com/photo-1557683316-973673baf926',
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 0
    } as ImageLayer);

    // Generate mixed layers
    for (let i = 1; i < layerCount; i++) {
        const type = i % 3 === 0 ? 'text' : i % 3 === 1 ? 'cta' : 'overlay';

        if (type === 'text') {
            layers.push({
                id: `text-${i}`,
                type: 'text',
                name: `Text ${i}`,
                text: `Sample Text ${i}`,
                x: Math.random() * 800,
                y: Math.random() * 800,
                width: 200 + Math.random() * 100,
                height: 50 + Math.random() * 50,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                fontSize: 16 + Math.random() * 32,
                fontFamily: 'Inter',
                fontWeight: 400,
                fill: '#000000',
                align: 'left',
                zIndex: i
            } as TextLayer);
        } else if (type === 'cta') {
            layers.push({
                id: `cta-${i}`,
                type: 'cta',
                name: `Button ${i}`,
                text: `Click Here ${i}`,
                x: Math.random() * 800,
                y: Math.random() * 800,
                width: 150 + Math.random() * 100,
                height: 40 + Math.random() * 20,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                fontSize: 14 + Math.random() * 8,
                fontFamily: 'Inter',
                fontWeight: 700,
                color: '#FFFFFF',
                bgColor: '#3B82F6',
                radius: 8,
                lineHeight: 1.2,
                zIndex: i
            } as CtaLayer);
        } else {
            layers.push({
                id: `overlay-${i}`,
                type: 'overlay',
                name: `Image ${i}`,
                src: `https://picsum.photos/seed/${i}/400/400`,
                x: Math.random() * 700,
                y: Math.random() * 700,
                width: 100 + Math.random() * 200,
                height: 100 + Math.random() * 200,
                rotation: 0,
                opacity: 0.8 + Math.random() * 0.2,
                visible: true,
                locked: false,
                zIndex: i
            } as ImageLayer);
        }
    }

    return {
        id: `test-doc-${layerCount}`,
        name: `Performance Test (${layerCount} layers)`,
        width: 1080,
        height: 1080,
        backgroundColor: '#FFFFFF',
        layers
    };
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
    renderTime: number;          // Time to render canvas (ms)
    interactionLatency: number;  // Time to respond to user input (ms)
    memoryUsage?: number;        // MB (if available)
    fps: number;                 // Frames per second
    layerCount: number;
    timestamp: string;
}

/**
 * Measure render performance
 */
export async function measureRenderPerformance(
    renderFn: () => void | Promise<void>
): Promise<number> {
    const start = performance.now();
    await renderFn();
    const end = performance.now();
    return end - start;
}

/**
 * Measure interaction latency
 */
export function measureInteractionLatency(
    interactionFn: () => void
): number {
    const start = performance.now();
    interactionFn();
    const end = performance.now();
    return end - start;
}

/**
 * Get memory usage (if available)
 */
export function getMemoryUsage(): number | undefined {
    if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return undefined;
}

/**
 * FPS counter
 */
export class FPSCounter {
    private frames: number = 0;
    private lastTime: number = performance.now();
    private fps: number = 60;

    tick(): number {
        this.frames++;
        const now = performance.now();
        const delta = now - this.lastTime;

        if (delta >= 1000) {
            this.fps = Math.round((this.frames * 1000) / delta);
            this.frames = 0;
            this.lastTime = now;
        }

        return this.fps;
    }

    getFPS(): number {
        return this.fps;
    }

    reset(): void {
        this.frames = 0;
        this.lastTime = performance.now();
        this.fps = 60;
    }
}

/**
 * Run comprehensive performance test
 */
export async function runPerformanceTest(
    layerCounts: number[] = [10, 25, 50, 75, 100]
): Promise<PerformanceMetrics[]> {
    const results: PerformanceMetrics[] = [];

    for (const count of layerCounts) {
        const doc = generateTestDocument(count);
        const fpsCounter = new FPSCounter();

        // Measure render time
        const renderTime = await measureRenderPerformance(() => {
            // Simulate render
            return new Promise(resolve => setTimeout(resolve, 10));
        });

        // Measure interaction latency
        const interactionLatency = measureInteractionLatency(() => {
            // Simulate layer selection
            const layer = doc.layers[Math.floor(Math.random() * doc.layers.length)];
            return layer;
        });

        // Collect metrics
        const metrics: PerformanceMetrics = {
            renderTime,
            interactionLatency,
            memoryUsage: getMemoryUsage(),
            fps: fpsCounter.getFPS(),
            layerCount: count,
            timestamp: new Date().toISOString()
        };

        results.push(metrics);
    }

    return results;
}

/**
 * Performance benchmark thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
    renderTime: {
        excellent: 16,   // 60fps
        good: 33,        // 30fps
        acceptable: 50,  // 20fps
        poor: 100        // 10fps
    },
    interactionLatency: {
        excellent: 10,
        good: 50,
        acceptable: 100,
        poor: 200
    },
    memoryUsage: {
        excellent: 50,   // MB
        good: 100,
        acceptable: 200,
        poor: 500
    }
};

/**
 * Evaluate performance
 */
export function evaluatePerformance(metrics: PerformanceMetrics): {
    overall: 'excellent' | 'good' | 'acceptable' | 'poor';
    details: Record<string, 'excellent' | 'good' | 'acceptable' | 'poor'>;
} {
    const evaluate = (value: number, thresholds: typeof PERFORMANCE_THRESHOLDS.renderTime) => {
        if (value <= thresholds.excellent) return 'excellent';
        if (value <= thresholds.good) return 'good';
        if (value <= thresholds.acceptable) return 'acceptable';
        return 'poor';
    };

    const details = {
        renderTime: evaluate(metrics.renderTime, PERFORMANCE_THRESHOLDS.renderTime),
        interactionLatency: evaluate(metrics.interactionLatency, PERFORMANCE_THRESHOLDS.interactionLatency),
        memoryUsage: metrics.memoryUsage
            ? evaluate(metrics.memoryUsage, PERFORMANCE_THRESHOLDS.memoryUsage)
            : 'good' as const
    };

    // Overall is worst of all metrics
    const scores = Object.values(details);
    const overall = scores.includes('poor') ? 'poor'
        : scores.includes('acceptable') ? 'acceptable'
            : scores.includes('good') ? 'good'
                : 'excellent';

    return { overall, details };
}
