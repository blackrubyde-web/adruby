/**
 * HEATMAP PREDICTOR
 * Simulate eye-tracking patterns for conversion optimization
 * 
 * Features:
 * - F-pattern detection (Western reading)
 * - Z-pattern scoring (visual hierarchy)
 * - Gaze cascade prediction
 * - Attention hotspot mapping
 * - Visual weight-based saccades
 */

import type { StudioLayer } from '../../../types/studio';

export interface HeatmapPoint {
    x: number;
    y: number;
    attention: number;  // 0-100 intensity
    dwellTime: number;  // Estimated fixation duration (ms)
}

export interface GazePath {
    points: HeatmapPoint[];
    pattern: 'F' | 'Z' | 'cascade' | 'scattered';
    ctaReachProbability: number;  // 0-100
}

export interface HeatmapPrediction {
    heatmap: HeatmapPoint[];
    gazePath: GazePath;
    attentionScore: {
        headline: number;
        product: number;
        description: number;
        cta: number;
    };
    overallScore: number;  // 0-100
    insights: string[];
}

/**
 * Calculate visual weight of element
 */
function calculateVisualWeight(layer: StudioLayer): number {
    const baseArea = layer.width * layer.height;
    let weight = baseArea;

    // Type weighting
    if (layer.type === 'text') weight *= 1.2;  // Text attracts attention
    if (layer.type === 'cta') weight *= 2.0;   // CTAs are visually prominent
    if (layer.type === 'product') weight *= 1.8; // Product is focal point

    // Opacity factor
    weight *= layer.opacity;

    // Font weight for text
    if (layer.type === 'text' || layer.type === 'cta') {
        const fw = (layer as any).fontWeight || 400;
        const fwNum = typeof fw === 'string' ? 400 : fw;
        weight *= (fwNum / 400);
    }

    // Color saturation (brighter = more attention)
    if (layer.type === 'cta') {
        weight *= 1.5; // CTAs get extra boost
    }

    return weight;
}

/**
 * Detect F-pattern (common Western reading pattern)
 */
function detectFPattern(layers: StudioLayer[], width: number, height: number): number {
    const topThird = layers.filter(l => l.y < height / 3);
    const middleThird = layers.filter(l => l.y >= height / 3 && l.y < 2 * height / 3);
    const leftHalf = layers.filter(l => l.x < width / 2);

    // F-pattern: Heavy top, some middle, left-biased
    const topScore = topThird.length / layers.length;
    const leftScore = leftHalf.length / layers.length;

    return (topScore * 0.6 + leftScore * 0.4) * 100;
}

/**
 * Detect Z-pattern (visual hierarchy flow)
 */
function detectZPattern(layers: StudioLayer[], width: number, height: number): number {
    // Z-pattern: top-left → top-right → bottom-left → bottom-right
    const topLeft = layers.filter(l => l.x < width / 2 && l.y < height / 2);
    const topRight = layers.filter(l => l.x >= width / 2 && l.y < height / 2);
    const bottomLeft = layers.filter(l => l.x < width / 2 && l.y >= height / 2);
    const bottomRight = layers.filter(l => l.x >= width / 2 && l.y >= height / 2);

    // Ideal: elements in all quadrants
    const quadrantBalance = [topLeft, topRight, bottomLeft, bottomRight]
        .filter(q => q.length > 0).length / 4;

    return quadrantBalance * 100;
}

/**
 * Simulate eye saccades (jumps between elements)
 */
function simulateSaccades(layers: StudioLayer[], startX: number, startY: number): HeatmapPoint[] {
    const visibleLayers = layers.filter(l => l.visible && l.type !== 'background');
    const points: HeatmapPoint[] = [];

    let currentX = startX;
    let currentY = startY;
    let remainingAttention = 100;

    // Calculate weights for all elements
    const elements = visibleLayers.map(layer => ({
        layer,
        centerX: layer.x + layer.width / 2,
        centerY: layer.y + layer.height / 2,
        weight: calculateVisualWeight(layer),
        visited: false
    }));

    // Simulate up to 10 saccades
    for (let i = 0; i < Math.min(10, elements.length); i++) {
        // Find nearest unvisited element with high weight
        let bestScore = -Infinity;
        let nextElement: typeof elements[0] | null = null;

        for (const elem of elements) {
            if (elem.visited) continue;

            const distance = Math.sqrt(
                Math.pow(elem.centerX - currentX, 2) +
                Math.pow(elem.centerY - currentY, 2)
            );

            // Score = weight / distance (closer + heavier = better)
            const score = elem.weight / (distance + 1);

            if (score > bestScore) {
                bestScore = score;
                nextElement = elem;
            }
        }

        if (!nextElement) break;

        // Fixate on element
        const attention = Math.min(remainingAttention, (nextElement.weight / 1000) * 100);
        const dwellTime = 200 + (attention * 10); // Base 200ms + attention bonus

        points.push({
            x: nextElement.centerX,
            y: nextElement.centerY,
            attention,
            dwellTime
        });

        nextElement.visited = true;
        currentX = nextElement.centerX;
        currentY = nextElement.centerY;
        remainingAttention -= attention;

        if (remainingAttention <= 0) break;
    }

    return points;
}

/**
 * Generate heatmap from gaze points
 */
function generateHeatmap(gazePoints: HeatmapPoint[], width: number, height: number): HeatmapPoint[] {
    const heatmap: HeatmapPoint[] = [];
    const gridSize = 50; // 50px grid

    // Create grid
    for (let y = 0; y < height; y += gridSize) {
        for (let x = 0; x < width; x += gridSize) {
            let totalAttention = 0;

            // Sum attention from nearby gaze points (Gaussian falloff)
            for (const point of gazePoints) {
                const distance = Math.sqrt(
                    Math.pow(point.x - x, 2) +
                    Math.pow(point.y - y, 2)
                );

                // Gaussian falloff (σ = 100px)
                const sigma = 100;
                const influence = point.attention * Math.exp(-(distance * distance) / (2 * sigma * sigma));
                totalAttention += influence;
            }

            if (totalAttention > 0.1) {
                heatmap.push({
                    x,
                    y,
                    attention: Math.min(100, totalAttention),
                    dwellTime: 0
                });
            }
        }
    }

    return heatmap;
}

/**
 * Predict eye-tracking heatmap
 */
export function predictHeatmap(
    layers: StudioLayer[],
    width: number = 1080,
    height: number = 1080
): HeatmapPrediction {
    // Start at natural entry point (top-left for Western viewers)
    const startX = width * 0.2;
    const startY = height * 0.15;

    // Simulate gaze path
    const gazePoints = simulateSaccades(layers, startX, startY);

    // Generate heatmap
    const heatmap = generateHeatmap(gazePoints, width, height);

    // Detect patterns
    const fScore = detectFPattern(layers, width, height);
    const zScore = detectZPattern(layers, width, height);

    let pattern: 'F' | 'Z' | 'cascade' | 'scattered';
    if (fScore > 60) pattern = 'F';
    else if (zScore > 60) pattern = 'Z';
    else if (gazePoints.length >= 5) pattern = 'cascade';
    else pattern = 'scattered';

    // Calculate CTA reach probability
    const ctaLayer = layers.find(l => l.type === 'cta' || l.role === 'cta');
    let ctaReachProbability = 0;

    if (ctaLayer) {
        const ctaCenterX = ctaLayer.x + ctaLayer.width / 2;
        const ctaCenterY = ctaLayer.y + ctaLayer.height / 2;

        // Check if any gaze point is near CTA
        for (const point of gazePoints) {
            const distance = Math.sqrt(
                Math.pow(point.x - ctaCenterX, 2) +
                Math.pow(point.y - ctaCenterY, 2)
            );

            if (distance < 200) {
                ctaReachProbability = Math.max(ctaReachProbability, 100 - (distance / 2));
            }
        }
    }

    // Calculate attention scores per element type
    const headlineLayer = layers.find(l => l.role === 'headline');
    const productLayer = layers.find(l => l.type === 'product' || l.role === 'product');
    const descLayer = layers.find(l => l.role === 'description');

    const getAttentionForLayer = (layer: StudioLayer | undefined): number => {
        if (!layer) return 0;
        const centerX = layer.x + layer.width / 2;
        const centerY = layer.y + layer.height / 2;

        let totalAttention = 0;
        for (const point of gazePoints) {
            const distance = Math.sqrt(
                Math.pow(point.x - centerX, 2) +
                Math.pow(point.y - centerY, 2)
            );
            if (distance < 150) {
                totalAttention += point.attention;
            }
        }
        return Math.min(100, totalAttention);
    };

    const attentionScore = {
        headline: getAttentionForLayer(headlineLayer),
        product: getAttentionForLayer(productLayer),
        description: getAttentionForLayer(descLayer),
        cta: getAttentionForLayer(ctaLayer)
    };

    // Overall score (weighted)
    const overallScore = (
        attentionScore.headline * 0.25 +
        attentionScore.product * 0.25 +
        attentionScore.cta * 0.40 +
        attentionScore.description * 0.10
    );

    // Generate insights
    const insights: string[] = [];
    if (attentionScore.cta < 50) {
        insights.push('⚠️ CTA has low attention. Consider moving it higher or making it larger.');
    }
    if (attentionScore.headline < 60) {
        insights.push('⚠️ Headline may be overlooked. Increase font size or contrast.');
    }
    if (pattern === 'scattered') {
        insights.push('⚠️ Gaze path is scattered. Improve visual hierarchy.');
    }
    if (ctaReachProbability < 60) {
        insights.push(`⚠️ Only ${Math.round(ctaReachProbability)}% chance users reach CTA. Optimize path.`);
    }

    return {
        heatmap,
        gazePath: {
            points: gazePoints,
            pattern,
            ctaReachProbability
        },
        attentionScore,
        overallScore: Math.round(overallScore),
        insights
    };
}

/**
 * Quick check if layout passes attention standards
 */
export function passesAttentionStandards(prediction: HeatmapPrediction): boolean {
    return (
        prediction.overallScore >= 70 &&
        prediction.attentionScore.cta >= 60 &&
        prediction.gazePath.ctaReachProbability >= 65
    );
}
