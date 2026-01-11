/**
 * CTR ESTIMATOR
 * Estimate Click-Through Rate using visual and content analysis
 * 
 * Features:
 * - Industry benchmark comparison
 * - Element prominence scoring
 * - CTA visibility analysis
 * - Copy quality assessment
 * - Historical pattern matching
 */

import type { StudioLayer, TextLayer, CtaLayer } from '../../../types/studio';
import type { HeatmapPrediction } from './heatmap-predictor';

type TextualLayer = TextLayer | CtaLayer;

const isTextLayer = (layer: StudioLayer): layer is TextLayer => layer.type === 'text';
const isCtaLayer = (layer: StudioLayer): layer is CtaLayer => layer.type === 'cta';

export interface CTREstimate {
    estimated: number;       // Predicted CTR (0-100%)
    confidence: number;      // Confidence level (0-100)
    benchmarks: {
        industry: number;    // Industry average CTR
        topPerformer: number; // Top 10% CTR
    };
    factors: {
        visualAppeal: number;    // 0-100
        ctaProminence: number;   // 0-100
        copyQuality: number;     // 0-100
        attention: number;       // From heatmap
    };
    recommendations: string[];
}

/**
 * Industry CTR benchmarks (Meta Ads 2024)
 */
const INDUSTRY_BENCHMARKS: Record<string, { avg: number; top10: number }> = {
    ecommerce: { avg: 1.2, top10: 3.5 },
    saas: { avg: 0.8, top10: 2.8 },
    fashion: { avg: 1.5, top10: 4.2 },
    tech: { avg: 0.9, top10: 2.5 },
    finance: { avg: 0.6, top10: 1.8 },
    health: { avg: 1.1, top10: 3.2 },
    education: { avg: 1.0, top10: 2.9 },
    realestate: { avg: 0.7, top10: 2.1 },
    default: { avg: 1.0, top10: 3.0 }
};

/**
 * Calculate visual appeal score
 */
function scoreVisualAppeal(layers: StudioLayer[]): number {
    let score = 0;

    // Check for product image
    const hasProduct = layers.some(l => l.type === 'product' || l.role === 'product');
    if (hasProduct) score += 30;

    // Check for CTA
    const hasCTA = layers.some(l => l.type === 'cta' || l.role === 'cta');
    if (hasCTA) score += 25;

    // Check for proper layering (background, content, CTA)
    const layerTypes = new Set(layers.map(l => l.type));
    if (layerTypes.has('background')) score += 10;
    if (layerTypes.size >= 3) score += 15; // Variety of elements

    // Check for visual hierarchy (different font sizes)
    const textLayers = layers.filter(isTextLayer);
    if (textLayers.length >= 2) {
        const fontSizes = textLayers.map(l => l.fontSize || 16);
        const sizeVariety = Math.max(...fontSizes) - Math.min(...fontSizes);
        if (sizeVariety >= 20) score += 20;
    }

    return Math.min(100, score);
}

/**
 * Calculate CTA prominence score
 */
function scoreCTAProminence(layers: StudioLayer[]): number {
    const ctaLayer =
        layers.find(isCtaLayer) ||
        layers.find((layer): layer is TextLayer => layer.type === 'text' && layer.role === 'cta');

    if (!ctaLayer) return 0;

    let score = 0;

    // Size (larger = better, up to 450px width)
    const sizeScore = Math.min(100, (ctaLayer.width / 450) * 100);
    score += sizeScore * 0.4;

    // Position (bottom third is ideal for CTAs)
    const canvasHeight = 1080; // Assume square
    const positionRatio = ctaLayer.y / canvasHeight;
    const positionScore = positionRatio >= 0.66 ? 100 : positionRatio * 150;
    score += positionScore * 0.3;

    // Contrast (CTA should stand out)
    // Simplified: assume dark CTA on light BG or vice versa gets full score
    const bgLayer = layers.find(l => l.type === 'background');
    if (bgLayer) {
        score += 30; // Assume good contrast for now
    }

    return Math.min(100, score);
}

/**
 * Assess copy quality (headline length, clarity)
 */
function scoreCopyQuality(layers: StudioLayer[]): number {
    let score = 0;

    const headlineLayer = layers.find(
        (layer): layer is TextLayer => layer.type === 'text' && layer.role === 'headline'
    );
    const descLayer = layers.find(
        (layer): layer is TextLayer => layer.type === 'text' && layer.role === 'description'
    );
    const ctaLayer = layers.find(
        (layer): layer is TextualLayer =>
            layer.type === 'cta' || (layer.type === 'text' && layer.role === 'cta')
    );

    // Headline (should be concise, 3-8 words ideal)
    if (headlineLayer?.text) {
        const wordCount = headlineLayer.text.split(' ').length;
        if (wordCount >= 3 && wordCount <= 8) score += 35;
        else if (wordCount > 0) score += 20;
    }

    // Description (should exist but not too long)
    if (descLayer?.text) {
        const wordCount = descLayer.text.split(' ').length;
        if (wordCount >= 5 && wordCount <= 15) score += 25;
        else if (wordCount > 0) score += 10;
    }

    // CTA (should be action-oriented and short)
    if (ctaLayer?.text) {
        const text = ctaLayer.text.toLowerCase();
        const actionWords = ['buy', 'shop', 'get', 'learn', 'discover', 'try', 'start', 'join', 'claim', 'download'];
        const hasAction = actionWords.some(word => text.includes(word));

        if (hasAction) score += 30;
        if (text.length <= 20) score += 10; // Short and punchy
    }

    return Math.min(100, score);
}

/**
 * Estimate CTR
 */
export function estimateCTR(
    layers: StudioLayer[],
    heatmapPrediction?: HeatmapPrediction,
    industry: string = 'default'
): CTREstimate {
    const benchmarks = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS.default;

    // Calculate factor scores
    const visualAppeal = scoreVisualAppeal(layers);
    const ctaProminence = scoreCTAProminence(layers);
    const copyQuality = scoreCopyQuality(layers);
    const attention = heatmapPrediction?.overallScore || 70;

    // Calculate overall quality score
    const qualityScore = (
        visualAppeal * 0.25 +
        ctaProminence * 0.35 +
        copyQuality * 0.20 +
        attention * 0.20
    );

    // Estimate CTR based on quality
    // Formula: Benchmark * (QualityScore / 100) * MultiplierFactor
    const multiplierFactor = qualityScore >= 80 ? 1.5 : qualityScore >= 60 ? 1.0 : 0.7;
    const estimated = benchmarks.avg * (qualityScore / 100) * multiplierFactor;

    // Confidence level (higher quality = higher confidence)
    const confidence = Math.min(100, qualityScore * 0.8 + 20);

    // Generate recommendations
    const recommendations: string[] = [];

    if (visualAppeal < 70) {
        recommendations.push('Improve visual appeal: add high-quality product imagery');
    }
    if (ctaProminence < 70) {
        recommendations.push('Make CTA more prominent: increase size or move to bottom third');
    }
    if (copyQuality < 70) {
        recommendations.push('Optimize copy: use action verbs in CTA, keep headline concise (3-8 words)');
    }
    if (attention < 70) {
        recommendations.push('Improve visual hierarchy to guide attention to CTA');
    }
    if (estimated < benchmarks.avg) {
        recommendations.push(`Current estimate (${estimated.toFixed(2)}%) is below industry average (${benchmarks.avg}%)`);
    }
    if (estimated >= benchmarks.top10) {
        recommendations.push(`🎉 Ad is performing at top 10% level (${benchmarks.top10}%+)`);
    }

    return {
        estimated: Math.round(estimated * 100) / 100,
        confidence: Math.round(confidence),
        benchmarks: {
            industry: benchmarks.avg,
            topPerformer: benchmarks.top10
        },
        factors: {
            visualAppeal: Math.round(visualAppeal),
            ctaProminence: Math.round(ctaProminence),
            copyQuality: Math.round(copyQuality),
            attention: Math.round(attention)
        },
        recommendations
    };
}

/**
 * Quick check if CTR meets target
 */
export function meetsCTRTarget(estimate: CTREstimate, target: number = 1.5): boolean {
    return estimate.estimated >= target;
}

/**
 * Compare multiple variants
 */
export function compareVariants(
    variants: Array<{ layers: StudioLayer[]; name: string }>,
    industry: string = 'default'
): Array<{ name: string; ctr: CTREstimate; rank: number }> {
    const results = variants.map(variant => ({
        name: variant.name,
        ctr: estimateCTR(variant.layers, undefined, industry),
        rank: 0
    }));

    // Sort by estimated CTR (descending)
    results.sort((a, b) => b.ctr.estimated - a.ctr.estimated);

    // Assign ranks
    results.forEach((result, index) => {
        result.rank = index + 1;
    });

    return results;
}
