/**
 * AB TEST OPTIMIZER
 * Predict variant performance and recommend winners
 * 
 * Features:
 * - Bayesian optimization
 * - Multi-armed bandit simulation
 * - Early stopping detection
 * - Confidence intervals
 */

export interface VariantPerformance {
    variantId: string;
    estimatedCTR: number;
    confidenceInterval: [number, number]; // [lower, upper]
    confidence: number; // 0-100
    recommendedTrafficAllocation: number; // 0-100%
}

export interface ABTestPrediction {
    winner: string | null;
    variants: VariantPerformance[];
    earlyStoppingRecommended: boolean;
    minimumSampleSize: number;
    insights: string[];
}

/**
 * Calculate confidence interval using normal approximation
 */
function calculateConfidenceInterval(
    mean: number,
    stdDev: number,
    sampleSize: number,
    confidenceLevel: number = 0.95
): [number, number] {
    // Z-score for 95% confidence
    const zScore = confidenceLevel === 0.95 ? 1.96 : 2.58; // 95% or 99%

    const standardError = stdDev / Math.sqrt(sampleSize);
    const marginOfError = zScore * standardError;

    return [
        Math.max(0, mean - marginOfError),
        Math.min(100, mean + marginOfError)
    ];
}

/**
 * Bayesian multi-armed bandit - Thompson Sampling
 */
function thompsonSampling(variants: Array<{ alpha: number; beta: number }>): number[] {
    // Simulate beta distribution for each variant
    const samples = variants.map(v => {
        // Beta distribution approximation
        const mean = v.alpha / (v.alpha + v.beta);
        const variance = (v.alpha * v.beta) / (Math.pow(v.alpha + v.beta, 2) * (v.alpha + v.beta + 1));
        const stdDev = Math.sqrt(variance);

        // Normal approximation (for simplicity)
        const sample = mean + stdDev * randomNormal();
        return Math.max(0, Math.min(1, sample));
    });

    // Calculate allocation percentages
    const total = samples.reduce((sum, s) => sum + s, 0);
    return samples.map(s => (s / total) * 100);
}

/**
 * Generate random normal (Box-Muller transform)
 */
function randomNormal(): number {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Predict AB test performance
 */
export function predictABTest(
    variants: Array<{
        id: string;
        qualityScore: number; // 0-100
        ctrEstimate: number;  // 0-100%
        balanceScore: number; // 0-100
        heatmapScore?: number; // 0-100
    }>,
    priorSamples: number = 100 // Simulated impressions per variant
): ABTestPrediction {
    const insights: string[] = [];

    // Convert quality scores to beta distribution parameters
    const betaParams = variants.map(v => {
        // Use quality score as prior
        // Higher quality = more confident in higher CTR
        const successRate = v.ctrEstimate / 100;
        const alpha = 1 + (successRate * priorSamples);
        const beta = 1 + ((1 - successRate) * priorSamples);

        return { alpha, beta };
    });

    // Calculate traffic allocation using Thompson Sampling
    const allocations = thompsonSampling(betaParams);

    // Calculate performance metrics for each variant
    const performances: VariantPerformance[] = variants.map((v, index) => {
        const ci = calculateConfidenceInterval(
            v.ctrEstimate,
            v.ctrEstimate * 0.2, // Assume 20% std dev
            priorSamples,
            0.95
        );

        return {
            variantId: v.id,
            estimatedCTR: v.ctrEstimate,
            confidenceInterval: ci,
            confidence: Math.round((v.qualityScore + v.balanceScore + (v.heatmapScore || 70)) / 3),
            recommendedTrafficAllocation: Math.round(allocations[index])
        };
    });

    // Sort by estimated CTR
    performances.sort((a, b) => b.estimatedCTR - a.estimatedCTR);

    // Determine winner
    const topVariant = performances[0];
    const secondVariant = performances[1];

    let winner: string | null = null;
    let earlyStoppingRecommended = false;

    if (performances.length >= 2) {
        // Check if top variant's confidence interval doesn't overlap with second
        const [topLower, _topUpper] = topVariant.confidenceInterval;
        const [_secondLower, secondUpper] = secondVariant.confidenceInterval;

        if (topLower > secondUpper) {
            winner = topVariant.variantId;
            earlyStoppingRecommended = true;
            insights.push(`✅ Clear winner detected: ${topVariant.variantId} (${topVariant.estimatedCTR.toFixed(2)}% CTR)`);
            insights.push(`Recommend stopping test early and allocating 100% traffic to winner.`);
        } else {
            insights.push(`No clear winner yet. Continue testing with recommended allocations.`);
            insights.push(`Top variant: ${topVariant.variantId} (${topVariant.estimatedCTR.toFixed(2)}% CTR, ${topVariant.confidence}% confidence)`);
        }
    }

    // Calculate minimum sample size for statistical significance
    // Using simplified power analysis (assumes 80% power, 5% alpha)
    const effectSize = topVariant.estimatedCTR - (secondVariant?.estimatedCTR || 0);
    const pooledStdDev = Math.sqrt(
        (topVariant.estimatedCTR * (100 - topVariant.estimatedCTR)) / 100
    );

    const minimumSampleSize = effectSize > 0
        ? Math.ceil((16 * Math.pow(pooledStdDev, 2)) / Math.pow(effectSize, 2))
        : 1000; // Default

    insights.push(`Minimum sample size per variant: ${minimumSampleSize} impressions`);

    // Additional insights
    if (topVariant.recommendedTrafficAllocation > 70) {
        insights.push(`🚀 Allocate ${topVariant.recommendedTrafficAllocation}% traffic to ${topVariant.variantId}`);
    }

    const lowPerformers = performances.filter(p => p.estimatedCTR < topVariant.estimatedCTR * 0.5);
    if (lowPerformers.length > 0) {
        insights.push(`⚠️ Consider removing low performers: ${lowPerformers.map(p => p.variantId).join(', ')}`);
    }

    return {
        winner,
        variants: performances,
        earlyStoppingRecommended,
        minimumSampleSize,
        insights
    };
}

/**
 * Quick comparison: pick best variant
 */
export function pickBestVariant(
    variants: Array<{
        id: string;
        comprehensiveScore: number;
    }>
): string {
    return variants.sort((a, b) => b.comprehensiveScore - a.comprehensiveScore)[0].id;
}
