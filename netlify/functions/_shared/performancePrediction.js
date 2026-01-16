/**
 * Performance Prediction Model
 * ML-style scoring to predict ad performance
 * CTR, engagement, and conversion prediction
 */

/**
 * Performance Factors - Weighted scoring components
 */
export const PERFORMANCE_FACTORS = {
    // Visual factors
    visual: {
        weight: 0.30,
        subfactors: {
            productVisibility: { weight: 0.25, optimal: 'Product takes 40-60% of frame' },
            colorContrast: { weight: 0.20, optimal: 'High contrast, vibrant colors' },
            humanPresence: { weight: 0.20, optimal: 'Human faces increase engagement 38%' },
            visualHierarchy: { weight: 0.15, optimal: 'Clear focal point, eye path' },
            qualityLevel: { weight: 0.20, optimal: 'Professional, crisp, well-lit' },
        },
    },

    // Copy factors
    copy: {
        weight: 0.25,
        subfactors: {
            headlineStrength: { weight: 0.30, optimal: 'Specific, benefit-driven, 5-10 words' },
            ctaClearness: { weight: 0.25, optimal: 'Clear action verb, low friction' },
            emotionalTrigger: { weight: 0.20, optimal: 'Evokes emotion or curiosity' },
            socialProof: { weight: 0.15, optimal: 'Numbers, reviews, testimonials' },
            urgency: { weight: 0.10, optimal: 'Creates reason to act now' },
        },
    },

    // Relevance factors
    relevance: {
        weight: 0.25,
        subfactors: {
            audienceMatch: { weight: 0.35, optimal: 'Speaks directly to target persona' },
            industryAlignment: { weight: 0.25, optimal: 'Follows industry visual norms' },
            platformOptimization: { weight: 0.25, optimal: 'Optimized for platform specs' },
            trendAlignment: { weight: 0.15, optimal: 'Leverages current trends' },
        },
    },

    // Trust factors
    trust: {
        weight: 0.20,
        subfactors: {
            socialProof: { weight: 0.35, optimal: 'Reviews, ratings, customer count' },
            credibilitySignals: { weight: 0.25, optimal: 'Awards, certifications, media mentions' },
            transparencyLevel: { weight: 0.20, optimal: 'Clear pricing, no hidden info' },
            brandConsistency: { weight: 0.20, optimal: 'Matches brand voice and style' },
        },
    },
};

/**
 * Performance Benchmarks by Industry
 */
export const INDUSTRY_BENCHMARKS = {
    beauty: { avgCTR: 1.8, avgEngagement: 3.2, avgConversion: 2.5 },
    tech: { avgCTR: 1.2, avgEngagement: 2.1, avgConversion: 1.8 },
    fitness: { avgCTR: 2.1, avgEngagement: 4.5, avgConversion: 2.8 },
    food: { avgCTR: 1.9, avgEngagement: 3.8, avgConversion: 2.2 },
    fashion: { avgCTR: 2.0, avgEngagement: 3.5, avgConversion: 2.0 },
    home: { avgCTR: 1.4, avgEngagement: 2.8, avgConversion: 1.9 },
    health: { avgCTR: 1.5, avgEngagement: 2.9, avgConversion: 2.3 },
    pets: { avgCTR: 2.3, avgEngagement: 4.8, avgConversion: 2.6 },
    baby: { avgCTR: 1.7, avgEngagement: 3.1, avgConversion: 2.1 },
    automotive: { avgCTR: 0.9, avgEngagement: 1.8, avgConversion: 0.8 },
    saas: { avgCTR: 1.1, avgEngagement: 1.5, avgConversion: 1.2 },
    travel: { avgCTR: 2.2, avgEngagement: 4.2, avgConversion: 2.0 },
    education: { avgCTR: 1.3, avgEngagement: 2.4, avgConversion: 1.5 },
    luxury: { avgCTR: 1.0, avgEngagement: 2.0, avgConversion: 0.9 },
    eco: { avgCTR: 1.6, avgEngagement: 3.0, avgConversion: 2.1 },
};

/**
 * Calculate predicted performance score
 */
export function predictPerformance(adConfig) {
    const scores = {
        visual: 50,
        copy: 50,
        relevance: 50,
        trust: 50,
    };

    // Visual scoring
    if (adConfig.hasProductImage || adConfig.visionDescription) scores.visual += 15;
    if (adConfig.layoutId) scores.visual += 10;
    if (adConfig.colorPalette) scores.visual += 10;
    if (adConfig.features?.length >= 3) scores.visual += 5;

    // Copy scoring
    if (adConfig.headline) {
        const len = adConfig.headline.length;
        if (len >= 20 && len <= 60) scores.copy += 15;
        if (/\d+/.test(adConfig.headline)) scores.copy += 10; // Has numbers
        if (/[?!]/.test(adConfig.headline)) scores.copy += 5; // Has emotion
    }
    if (adConfig.cta) scores.copy += 10;
    if (adConfig.features?.length > 0) scores.copy += 5;

    // Relevance scoring
    if (adConfig.industry) scores.relevance += 15;
    if (adConfig.targetAudience) scores.relevance += 10;
    if (adConfig.personaMatch) scores.relevance += 15;
    if (adConfig.platformOptimized) scores.relevance += 10;

    // Trust scoring
    if (adConfig.badge || adConfig.testimonial) scores.trust += 20;
    if (adConfig.rating) scores.trust += 15;
    if (adConfig.socialProof) scores.trust += 10;

    // Calculate weighted total
    const total =
        (scores.visual * PERFORMANCE_FACTORS.visual.weight) +
        (scores.copy * PERFORMANCE_FACTORS.copy.weight) +
        (scores.relevance * PERFORMANCE_FACTORS.relevance.weight) +
        (scores.trust * PERFORMANCE_FACTORS.trust.weight);

    // Predict metrics
    const industry = adConfig.industry || 'beauty';
    const benchmarks = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS.beauty;

    const multiplier = total / 75; // 75 is "average" score

    const prediction = {
        overallScore: Math.round(total),
        grade: getGrade(total),

        predictedCTR: Math.round(benchmarks.avgCTR * multiplier * 100) / 100,
        predictedEngagement: Math.round(benchmarks.avgEngagement * multiplier * 100) / 100,
        predictedConversion: Math.round(benchmarks.avgConversion * multiplier * 100) / 100,

        componentScores: scores,

        improvements: generateImprovements(scores, adConfig),
    };

    return prediction;
}

/**
 * Get letter grade from score
 */
function getGrade(score) {
    if (score >= 85) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
}

/**
 * Generate improvement recommendations
 */
function generateImprovements(scores, config) {
    const improvements = [];

    if (scores.visual < 70) {
        if (!config.layoutId) {
            improvements.push({
                priority: 'high',
                area: 'visual',
                suggestion: 'Use a structured layout template for more professional design',
            });
        }
        if (!config.hasProductImage) {
            improvements.push({
                priority: 'high',
                area: 'visual',
                suggestion: 'Add a product image for Vision AI analysis and accurate rendering',
            });
        }
    }

    if (scores.copy < 70) {
        if (!config.headline || config.headline.length < 20) {
            improvements.push({
                priority: 'high',
                area: 'copy',
                suggestion: 'Add a compelling headline (20-60 characters with specific benefit)',
            });
        }
        if (!config.cta) {
            improvements.push({
                priority: 'medium',
                area: 'copy',
                suggestion: 'Add a clear call-to-action',
            });
        }
    }

    if (scores.relevance < 70) {
        if (!config.targetAudience) {
            improvements.push({
                priority: 'medium',
                area: 'relevance',
                suggestion: 'Define your target audience for more tailored messaging',
            });
        }
    }

    if (scores.trust < 70) {
        improvements.push({
            priority: 'high',
            area: 'trust',
            suggestion: 'Add social proof (reviews, ratings, testimonials, or trust badges)',
        });
    }

    return improvements;
}

/**
 * Compare ad against industry benchmarks
 */
export function compareToIndustry(prediction, industry) {
    const benchmarks = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS.beauty;

    return {
        ctrVsAverage: Math.round((prediction.predictedCTR / benchmarks.avgCTR - 1) * 100),
        engagementVsAverage: Math.round((prediction.predictedEngagement / benchmarks.avgEngagement - 1) * 100),
        conversionVsAverage: Math.round((prediction.predictedConversion / benchmarks.avgConversion - 1) * 100),
        interpretation: prediction.overallScore >= 75
            ? 'Above average - this ad should outperform most competitors'
            : prediction.overallScore >= 60
                ? 'Average - solid performance expected'
                : 'Below average - consider implementing improvements',
    };
}
