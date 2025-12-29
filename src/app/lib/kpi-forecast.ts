/**
 * KPI Forecasting Model
 * Predicts CTR (Click-Through Rate) and ROAS (Return on Ad Spend) based on ad quality metrics
 */

import type { AdDocument, StudioLayer } from '../types/studio';

export interface KPIForecast {
    ctr: {
        min: number;
        max: number;
        expected: number;
        confidence: 'low' | 'medium' | 'high';
    };
    roas: {
        min: number;
        max: number;
        expected: number;
        confidence: 'low' | 'medium' | 'high';
    };
    factors: {
        imageQuality: number;        // 0-100
        textOptimization: number;    // 0-100
        colorContrast: number;        // 0-100
        layoutBalance: number;        // 0-100
        ctaStrength: number;          // 0-100
    };
    recommendations: string[];
}

interface AdMetrics {
    hasImage: boolean;
    imageCount: number;
    textLayers: number;
    ctaLayers: number;
    totalLayers: number;
    hasHeadline: boolean;
    headlineLength?: number;
    hasContrast: boolean;
    colorDiversity: number;
}

/**
 * Analyze ad document and extract quality metrics
 */
function analyzeAdDocument(doc: AdDocument): AdMetrics {
    const imageLayers = doc.layers.filter(l => ['background', 'product', 'overlay', 'logo'].includes(l.type));
    const textLayers = doc.layers.filter((l: StudioLayer) => l.type === 'text');
    const ctaLayers = doc.layers.filter(l => l.type === 'cta');

    // Find headline (first text layer or largest)
    const headlineLayer = textLayers.sort((a, b) => (b as any).fontSize - (a as any).fontSize)[0];
    const headlineText = headlineLayer ? (headlineLayer as any).text : '';

    // Estimate color contrast (simplified)
    const uniqueColors = new Set(
        doc.layers
            .map(l => (l as any).color || (l as any).fill || (l as any).bgColor)
            .filter(Boolean)
    );

    return {
        hasImage: imageLayers.length > 0,
        imageCount: imageLayers.length,
        textLayers: textLayers.length,
        ctaLayers: ctaLayers.length,
        totalLayers: doc.layers.length,
        hasHeadline: !!headlineText,
        headlineLength: headlineText.length,
        hasContrast: uniqueColors.size >= 2,
        colorDiversity: uniqueColors.size,
    };
}

/**
 * Calculate Image Quality Score (0-100)
 */
function calculateImageQuality(metrics: AdMetrics): number {
    let score = 0;

    // Has professional product image
    if (metrics.hasImage) score += 40;

    // Multiple images for storytelling
    if (metrics.imageCount >= 2) score += 20;
    else if (metrics.imageCount === 1) score += 10;

    // Good layer composition
    if (metrics.totalLayers >= 4 && metrics.totalLayers <= 12) score += 30;
    else if (metrics.totalLayers > 12) score += 15; // Too complex
    else score += 10; // Too simple

    // Bonus for balanced composition
    if (metrics.textLayers >= 2 && metrics.imageCount >= 1) score += 10;

    return Math.min(100, score);
}

/**
 * Calculate Text Optimization Score (0-100)
 */
function calculateTextOptimization(metrics: AdMetrics): number {
    let score = 0;

    // Has headline
    if (metrics.hasHeadline) score += 30;

    // Optimal headline length (3-7 words ≈ 15-40 chars)
    if (metrics.headlineLength && metrics.headlineLength >= 15 && metrics.headlineLength <= 40) {
        score += 30;
    } else if (metrics.headlineLength && metrics.headlineLength > 0) {
        score += 15;
    }

    // Multiple text layers for hierarchy
    if (metrics.textLayers >= 2) score += 20;
    else if (metrics.textLayers === 1) score += 10;

    // CTA present
    if (metrics.ctaLayers > 0) score += 20;

    return Math.min(100, score);
}

/**
 * Calculate Color Contrast Score (0-100)
 */
function calculateColorContrast(metrics: AdMetrics): number {
    let score = 50; // Base score

    // High color diversity = better visual hierarchy
    if (metrics.colorDiversity >= 3) score += 50;
    else if (metrics.colorDiversity === 2) score += 30;
    else score += 10;

    return Math.min(100, score);
}

/**
 * Calculate Layout Balance Score (0-100)
 */
function calculateLayoutBalance(metrics: AdMetrics): number {
    let score = 0;

    // Optimal layer count (not too simple, not too complex)
    if (metrics.totalLayers >= 5 && metrics.totalLayers <= 10) score += 50;
    else if (metrics.totalLayers >= 3 && metrics.totalLayers <= 15) score += 30;
    else score += 10;

    // Good text-to-image ratio
    const ratio = metrics.textLayers / Math.max(1, metrics.imageCount);
    if (ratio >= 1 && ratio <= 3) score += 30;
    else score += 15;

    // Has structure (headline + body + cta)
    if (metrics.textLayers >= 2 && metrics.ctaLayers > 0) score += 20;

    return Math.min(100, score);
}

/**
 * Calculate CTA Strength Score (0-100)
 */
function calculateCTAStrength(metrics: AdMetrics): number {
    let score = 0;

    // CTA exists
    if (metrics.ctaLayers > 0) score += 60;
    else return 0; // No CTA = critical issue

    // Single clear CTA (not confusing multiple CTAs)
    if (metrics.ctaLayers === 1) score += 40;
    else if (metrics.ctaLayers === 2) score += 20;
    else score += 10; // Too many CTAs

    return Math.min(100, score);
}

/**
 * Predict CTR based on quality factors
 * Industry baseline: 0.5% - 2.5% for social ads
 */
function predictCTR(factors: KPIForecast['factors']): KPIForecast['ctr'] {
    // Weighted average of factors
    const overallScore = (
        factors.imageQuality * 0.30 +
        factors.textOptimization * 0.25 +
        factors.colorContrast * 0.15 +
        factors.layoutBalance * 0.15 +
        factors.ctaStrength * 0.15
    );

    // Map score to CTR range
    // 90-100 → 2.0-3.5%
    // 70-89  → 1.5-2.5%
    // 50-69  → 1.0-1.8%
    // 30-49  → 0.5-1.2%
    // 0-29   → 0.2-0.6%

    let min, max, confidence: 'low' | 'medium' | 'high';

    if (overallScore >= 90) {
        min = 2.0;
        max = 3.5;
        confidence = 'high';
    } else if (overallScore >= 70) {
        min = 1.5;
        max = 2.5;
        confidence = 'high';
    } else if (overallScore >= 50) {
        min = 1.0;
        max = 1.8;
        confidence = 'medium';
    } else if (overallScore >= 30) {
        min = 0.5;
        max = 1.2;
        confidence = 'medium';
    } else {
        min = 0.2;
        max = 0.6;
        confidence = 'low';
    }

    const expected = (min + max) / 2;

    return { min, max, expected, confidence };
}

/**
 * Predict ROAS based on CTR and quality
 * Assumes avg. conversion rate and margin
 */
function predictROAS(ctr: KPIForecast['ctr'], factors: KPIForecast['factors']): KPIForecast['roas'] {
    // Base ROAS multiplier from CTR
    const baseMultiplier = ctr.expected * 0.8; // Rough heuristic

    // Adjust for ad quality
    const qualityBonus = (
        factors.imageQuality * 0.01 +
        factors.textOptimization * 0.01
    );

    let min, max, confidence: 'low' | 'medium' | 'high';

    if (ctr.confidence === 'high' && factors.ctaStrength >= 70) {
        min = 2.5 + qualityBonus;
        max = 5.0 + qualityBonus;
        confidence = 'high';
    } else if (ctr.confidence === 'medium') {
        min = 1.5 + qualityBonus;
        max = 3.5 + qualityBonus;
        confidence = 'medium';
    } else {
        min = 0.8;
        max = 2.0;
        confidence = 'low';
    }

    const expected = (min + max) / 2;

    return { min, max, expected, confidence };
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(factors: KPIForecast['factors'], metrics: AdMetrics): string[] {
    const recommendations: string[] = [];

    // Image Quality
    if (factors.imageQuality < 60) {
        if (!metrics.hasImage) {
            recommendations.push('Füge ein hochwertiges Produktbild hinzu (+40% CTR)');
        } else {
            recommendations.push('Verwende professionelle, hochauflösende Bilder');
        }
    }

    // Text Optimization
    if (factors.textOptimization < 60) {
        if (!metrics.hasHeadline) {
            recommendations.push('Füge eine prägnante Headline hinzu (max. 5 Wörter)');
        } else if (metrics.headlineLength && metrics.headlineLength > 40) {
            recommendations.push('Kürze die Headline auf max. 40 Zeichen');
        }
    }

    // CTA
    if (factors.ctaStrength < 40) {
        recommendations.push('Füge einen klaren Call-to-Action Button hinzu (+30% Conversions)');
    } else if (metrics.ctaLayers > 2) {
        recommendations.push('Reduziere auf einen einzelnen, klaren CTA');
    }

    // Color Contrast
    if (factors.colorContrast < 50) {
        recommendations.push('Erhöhe den Farbkontrast für bessere Lesbarkeit');
    }

    // Layout
    if (factors.layoutBalance < 50) {
        if (metrics.totalLayers < 3) {
            recommendations.push('Füge mehr Elemente hinzu für visuelles Interesse');
        } else if (metrics.totalLayers > 15) {
            recommendations.push('Vereinfache das Layout (max. 10 Elemente)');
        }
    }

    return recommendations;
}

/**
 * Main forecasting function
 */
export function forecastKPIs(doc: AdDocument): KPIForecast {
    const metrics = analyzeAdDocument(doc);

    const factors: KPIForecast['factors'] = {
        imageQuality: calculateImageQuality(metrics),
        textOptimization: calculateTextOptimization(metrics),
        colorContrast: calculateColorContrast(metrics),
        layoutBalance: calculateLayoutBalance(metrics),
        ctaStrength: calculateCTAStrength(metrics),
    };

    const ctr = predictCTR(factors);
    const roas = predictROAS(ctr, factors);
    const recommendations = generateRecommendations(factors, metrics);

    return {
        ctr,
        roas,
        factors,
        recommendations,
    };
}
