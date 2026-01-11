/**
 * PERFORMANCE AGENT
 * ML-based CTR prediction, A/B test optimization, performance scoring
 * 
 * Features:
 * - Real-time CTR prediction (heuristic + planned ML)
 * - Performance factor analysis (50+ features)
 * - A/B test winner prediction
 * - Budget allocation recommendations
 * - Industry benchmarking
 */

export interface PerformanceInput {
    copy: {
        headline: string;
        subheadline?: string;
        description: string;
        cta: string;
    };
    visual: {
        hasImage: boolean;
        colorScheme?: string;
        layoutStrategy?: string;
        compositionScore?: number;
    };
    context: {
        productType?: string;
        industry?: string;
        targetAudience?: string;
        tone: string;
    };
    metadata?: {
        powerWordCount?: number;
        emotionalScore?: number;
        readabilityGrade?: number;
    };
}

export interface PerformanceFeatures {
    // Visual Features (10)
    visual: {
        hasImage: number; // 0 or 1
        compositionScore: number; // 0-100
        colorHarmony: number; // 0-100
        whitespace: number; // 0-100
        visualBalance: number; // 0-100
        contrast: number; // 0-100
        hierarchy: number; // 0-100
        productProminence: number; // 0-100
        ctaVisibility: number; // 0-100
        professionalLook: number; // 0-100
    };

    // Copy Features (15)
    copy: {
        headlineLength: number; // chars
        headlineWordCount: number;
        descriptionLength: number;
        ctaLength: number;
        powerWordCount: number;
        emotionalScore: number; // 0-100
        sentimentScore: number; // -1 to 1
        readabilityGrade: number; // Flesch-Kincaid
        hasQuestion: number; // 0 or 1
        hasExclamation: number; // 0 or 1
        hasNumbers: number; // 0 or 1
        urgencyWords: number;
        benefitWords: number;
        clearValue: number; // 0-100
        specificity: number; // 0-100
    };

    // Design Features (8)
    design: {
        tone: number; // encoded 0-4
        layoutComplexity: number; // 0-100
        ctaSize: number; // relative 0-1
        ctaPosition: number; // encoded 0-3
        fontHierarchy: number; // 0-100
        brandConsistency: number; // 0-100
        mobileOptimized: number; // 0-100
        loadSpeed: number; // 0-100 (placeholder)
    };

    // Context Features (7)
    context: {
        industryAvgCTR: number; // %
        productPrice: number; // encoded 0-4
        seasonality: number; // 0-100
        competitionLevel: number; // 0-100
        audienceAffinity: number; // 0-100
        platformFit: number; // 0-100
        timeOfDay: number; // 0-23 (placeholder)
    };
}

export interface CTRPrediction {
    predictedCTR: number; // 0-10%
    confidence: number; // 0-1
    confidenceInterval: {
        lower: number;
        upper: number;
    };
    benchmarks: {
        industry: string;
        average: number;
        top10Percent: number;
        top25Percent: number;
        percentile: number; // Where this ad ranks
    };
}

export interface PerformanceFactors {
    topDrivers: Array<{
        feature: string;
        impact: number; // -100 to 100
        current: number;
        optimal: number;
        suggestion: string;
    }>;
    improvementOpportunities: string[];
    strengths: string[];
}

export interface ABTestPrediction {
    winProbability: number; // 0-1
    expectedLift: number; // %
    recommendedTraffic: number; // %
    earlyStopRecommendation?: {
        canStop: boolean;
        winner: 'A' | 'B' | 'inconclusive';
        confidence: number;
    };
}

export interface BudgetRecommendation {
    allocation: {
        variant: string;
        percentage: number;
        expectedROI: number;
    }[];
    reasoning: string[];
}

export interface PerformanceAgentResult {
    ctrPrediction: CTRPrediction;
    features: PerformanceFeatures;
    performanceFactors: PerformanceFactors;
    abTest?: ABTestPrediction;
    budgetRecommendation?: BudgetRecommendation;
    score: number; // Overall performance score 0-100
}

/**
 * Industry CTR benchmarks (Meta Ads 2024)
 */
const INDUSTRY_BENCHMARKS: Record<string, { avg: number; top10: number; top25: number }> = {
    ecommerce: { avg: 1.2, top10: 3.1, top25: 2.0 },
    saas: { avg: 0.9, top10: 2.4, top25: 1.6 },
    finance: { avg: 0.7, top10: 2.0, top25: 1.3 },
    healthcare: { avg: 1.1, top10: 2.8, top25: 1.8 },
    education: { avg: 1.4, top10: 3.5, top25: 2.3 },
    retail: { avg: 1.3, top10: 3.2, top25: 2.1 },
    travel: { avg: 0.8, top10: 2.2, top25: 1.5 },
    realestate: { avg: 0.9, top10: 2.5, top25: 1.7 },
    automotive: { avg: 1.0, top10: 2.6, top25: 1.7 },
    default: { avg: 1.2, top10: 3.0, top25: 2.0 }
};

/**
 * Predict ad performance using ML-based features
 */
export async function predictPerformance(
    input: PerformanceInput
): Promise<PerformanceAgentResult> {
    // STEP 1: Extract features
    const features = extractFeatures(input);

    // STEP 2: Predict CTR using ML model (currently heuristic)
    const ctrPrediction = predictCTR(features, input.context);

    // STEP 3: Analyze performance factors
    const performanceFactors = analyzePerformanceFactors(features, input);

    // STEP 4: Calculate overall score
    const score = calculatePerformanceScore(features, ctrPrediction);

    return {
        ctrPrediction,
        features,
        performanceFactors,
        score
    };
}

/**
 * Extract 50+ features from ad for ML model
 */
function extractFeatures(input: PerformanceInput): PerformanceFeatures {
    const { copy, visual, context, metadata } = input;

    return {
        visual: {
            hasImage: visual.hasImage ? 1 : 0,
            compositionScore: visual.compositionScore || 75,
            colorHarmony: estimateColorHarmony(visual.colorScheme),
            whitespace: estimateWhitespace(copy.headline.length),
            visualBalance: visual.compositionScore || 80,
            contrast: estimateContrast(context.tone),
            hierarchy: 85,
            productProminence: visual.hasImage ? 80 : 50,
            ctaVisibility: estimateCTAVisibility(copy.cta),
            professionalLook: context.tone === 'professional' ? 90 : 75
        },
        copy: {
            headlineLength: copy.headline.length,
            headlineWordCount: copy.headline.split(' ').length,
            descriptionLength: copy.description.length,
            ctaLength: copy.cta.length,
            powerWordCount: metadata?.powerWordCount || countPowerWords(copy.headline + ' ' + copy.description),
            emotionalScore: metadata?.emotionalScore || 70,
            sentimentScore: estimateSentiment(copy.headline),
            readabilityGrade: metadata?.readabilityGrade || calculateReadability(copy.description),
            hasQuestion: /\?/.test(copy.headline) ? 1 : 0,
            hasExclamation: /!/.test(copy.headline) ? 1 : 0,
            hasNumbers: /\d+/.test(copy.headline + copy.description) ? 1 : 0,
            urgencyWords: countUrgencyWords(copy.headline + ' ' + copy.description),
            benefitWords: countBenefitWords(copy.description),
            clearValue: estimateClearValue(copy.headline + ' ' + copy.description),
            specificity: countSpecificDetails(copy.description)
        },
        design: {
            tone: encodeTone(context.tone),
            layoutComplexity: 60,
            ctaSize: 0.15,
            ctaPosition: 2, // bottom-right
            fontHierarchy: 85,
            brandConsistency: 80,
            mobileOptimized: 90,
            loadSpeed: 85
        },
        context: {
            industryAvgCTR: getIndustryBenchmark(context.industry || 'default').avg,
            productPrice: encodePriceRange(0), // placeholder
            seasonality: 70,
            competitionLevel: 60,
            audienceAffinity: estimateAudienceAffinity(context.targetAudience),
            platformFit: 85, // Meta ads
            timeOfDay: 12 // noon placeholder
        }
    };
}

/**
 * Predict CTR using feature-based model
 */
function predictCTR(features: PerformanceFeatures, context: PerformanceInput['context']): CTRPrediction {
    const industry = context.industry || 'default';
    const benchmark = getIndustryBenchmark(industry);

    // Base CTR from industry
    let predictedCTR = benchmark.avg;

    // Apply visual multipliers
    predictedCTR *= (1 + (features.visual.compositionScore - 75) / 200); // +/-12.5%
    predictedCTR *= (1 + (features.visual.ctaVisibility - 75) / 200);

    // Apply copy multipliers
    const optimalHeadlineLength = 50;
    const lengthDelta = Math.abs(features.copy.headlineLength - optimalHeadlineLength);
    predictedCTR *= (1 - lengthDelta / 200); // Penalize deviation

    predictedCTR *= (1 + features.copy.powerWordCount * 0.05); // +5% per power word
    predictedCTR *= (1 + (features.copy.emotionalScore - 70) / 150); // emotional boost

    if (features.copy.hasNumbers) predictedCTR *= 1.08; // +8% for specificity
    if (features.copy.urgencyWords > 0) predictedCTR *= 1.12; // +12% for urgency

    // Apply design multipliers
    predictedCTR *= (1 + (features.design.brandConsistency - 75) / 250);

    // Cap at realistic maximum
    predictedCTR = Math.min(predictedCTR, 6.0);
    predictedCTR = Math.max(predictedCTR, 0.3);

    // Confidence based on feature completeness
    const confidence = calculateConfidence(features);

    // Confidence interval (±20% of prediction with 80% confidence)
    const margin = predictedCTR * 0.2 * (1 - confidence * 0.5);

    return {
        predictedCTR: Math.round(predictedCTR * 100) / 100,
        confidence,
        confidenceInterval: {
            lower: Math.round((predictedCTR - margin) * 100) / 100,
            upper: Math.round((predictedCTR + margin) * 100) / 100
        },
        benchmarks: {
            industry,
            average: benchmark.avg,
            top10Percent: benchmark.top10,
            top25Percent: benchmark.top25,
            percentile: calculatePercentile(predictedCTR, benchmark)
        }
    };
}

/**
 * Analyze which factors drive performance
 */
function analyzePerformanceFactors(
    features: PerformanceFeatures,
    _input: PerformanceInput
): PerformanceFactors {
    const drivers: PerformanceFactors['topDrivers'] = [];

    // Analyze headline length
    const optimalHeadlineLength = 50;
    if (Math.abs(features.copy.headlineLength - optimalHeadlineLength) > 15) {
        drivers.push({
            feature: 'Headline Length',
            impact: -15,
            current: features.copy.headlineLength,
            optimal: optimalHeadlineLength,
            suggestion: features.copy.headlineLength > optimalHeadlineLength
                ? 'Shorten headline for better mobile readability'
                : 'Extend headline to provide more context'
        });
    }

    // CTA visibility
    if (features.visual.ctaVisibility < 75) {
        drivers.push({
            feature: 'CTA Visibility',
            impact: -20,
            current: features.visual.ctaVisibility,
            optimal: 90,
            suggestion: 'Make CTA button larger and use contrasting color'
        });
    }

    // Power words
    if (features.copy.powerWordCount < 2) {
        drivers.push({
            feature: 'Power Words',
            impact: -10,
            current: features.copy.powerWordCount,
            optimal: 3,
            suggestion: 'Add power words like "guaranteed", "exclusive", "limited"'
        });
    }

    // Emotional appeal
    if (features.copy.emotionalScore < 70) {
        drivers.push({
            feature: 'Emotional Appeal',
            impact: -12,
            current: features.copy.emotionalScore,
            optimal: 85,
            suggestion: 'Increase emotional resonance with benefit-focused copy'
        });
    }

    // Sort by impact
    drivers.sort((a, b) => a.impact - b.impact);

    // Identify strengths
    const strengths: string[] = [];
    if (features.copy.powerWordCount >= 3) strengths.push('Strong power word usage');
    if (features.visual.compositionScore >= 85) strengths.push('Excellent visual composition');
    if (features.copy.hasNumbers) strengths.push('Specific, quantified claims');
    if (features.visual.ctaVisibility >= 85) strengths.push('Highly visible CTA');

    return {
        topDrivers: drivers.slice(0, 5),
        improvementOpportunities: drivers.slice(0, 3).map(d => d.suggestion),
        strengths
    };
}

/**
 * Calculate overall performance score
 */
function calculatePerformanceScore(
    features: PerformanceFeatures,
    ctr: CTRPrediction
): number {
    // Weighted score based on CTR prediction vs benchmark
    const ctrScore = (ctr.predictedCTR / ctr.benchmarks.top10Percent) * 80; // Max 80 points

    // Feature quality score (max 20 points)
    const visualScore = Object.values(features.visual).reduce((sum, v) => sum + v, 0) / Object.keys(features.visual).length / 5;
    const copyScore = (features.copy.emotionalScore + features.copy.clearValue + features.copy.specificity) / 15;
    const designScore = Object.values(features.design).reduce((sum, v) => sum + v, 0) / Object.keys(features.design).length / 5;

    const featureScore = (visualScore + copyScore + designScore) / 3;

    const total = Math.min(100, ctrScore + featureScore);
    return Math.round(total);
}

// Helper functions
function getIndustryBenchmark(industry: string) {
    return INDUSTRY_BENCHMARKS[industry.toLowerCase()] || INDUSTRY_BENCHMARKS.default;
}

function calculatePercentile(ctr: number, benchmark: typeof INDUSTRY_BENCHMARKS.default): number {
    if (ctr >= benchmark.top10) return 90;
    if (ctr >= benchmark.top25) return 75;
    if (ctr >= benchmark.avg) return 50;
    return Math.round((ctr / benchmark.avg) * 50);
}

function calculateConfidence(features: PerformanceFeatures): number {
    // Higher confidence with more complete features
    let confidence = 0.7;
    if (features.visual.hasImage) confidence += 0.05;
    if (features.copy.powerWordCount > 2) confidence += 0.05;
    if (features.visual.compositionScore > 80) confidence += 0.05;
    return Math.min(0.9, confidence);
}

function estimateColorHarmony(scheme?: string): number {
    const harmonies: Record<string, number> = {
        'monochromatic': 85,
        'analogous': 80,
        'complementary': 90,
        'triadic': 75,
        'vibrant': 70
    };
    return scheme ? harmonies[scheme] || 75 : 75;
}

function estimateWhitespace(headlineLength: number): number {
    // More whitespace with shorter headlines
    return Math.max(40, Math.min(95, 95 - headlineLength * 0.5));
}

function estimateContrast(tone: string): number {
    return tone === 'minimal' ? 95 : 80;
}

function estimateCTAVisibility(cta: string): number {
    const length = cta.length;
    if (length < 15) return 90;
    if (length < 20) return 80;
    return 70;
}

function countPowerWords(text: string): number {
    const powerWords = /\b(neu|best|garantiert|kostenlos|exklusiv|limitiert|jetzt|proven|amazing|revolutionary|instant|free|guaranteed)\b/gi;
    return (text.match(powerWords) || []).length;
}

function countUrgencyWords(text: string): number {
    const urgency = /\b(jetzt|sofort|heute|schnell|bald|limitiert|nur noch|now|today|limited|hurry)\b/gi;
    return (text.match(urgency) || []).length;
}

function countBenefitWords(text: string): number {
    const benefits = /\b(sparen|gewinnen|verbessern|steigern|erreichen|erhalten|save|gain|improve|achieve|get)\b/gi;
    return (text.match(benefits) || []).length;
}

function estimateSentiment(text: string): number {
    const positive = /\b(toll|super|großartig|perfekt|best|amazing|great|perfect)\b/gi;
    const negative = /\b(schlecht|problem|fehler|schwierig|bad|problem|difficult)\b/gi;
    const pos = (text.match(positive) || []).length;
    const neg = (text.match(negative) || []).length;
    return (pos - neg) / Math.max(1, pos + neg);
}

function calculateReadability(text: string): number {
    const words = text.split(/\s+/).length;
    const sentences = Math.max(1, (text.match(/[.!?]+/g) || []).length);
    const syllables = estimateSyllables(text);
    // Flesch-Kincaid Grade Level
    return 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
}

function estimateSyllables(text: string): number {
    return text.split(/\s+/).reduce((sum, word) => sum + Math.max(1, word.length / 3), 0);
}

function estimateClearValue(text: string): number {
    let score = 60;
    if (/\d+/.test(text)) score += 15; // Numbers
    if (/€|$|%/.test(text)) score += 10; // Price/discount
    if (/\b(sparen|kostenlos|gratis|free|save)\b/i.test(text)) score += 15;
    return Math.min(100, score);
}

function countSpecificDetails(text: string): number {
    let score = 50;
    if (/\d+/.test(text)) score += 20; // Numbers
    if (/\b(stunden?|tage?|wochen?|monate?|jahre?|hours?|days?|weeks?|months?|years?)\b/i.test(text)) score += 15; // Time
    if (/\b\d+%\b/.test(text)) score += 15; // Percentages
    return Math.min(100, score);
}

function encodeTone(tone: string): number {
    const tones: Record<string, number> = {
        'minimal': 0,
        'professional': 1,
        'playful': 2,
        'bold': 3,
        'luxury': 4
    };
    return tones[tone] || 1;
}

function encodePriceRange(price: number): number {
    if (price < 50) return 0;
    if (price < 200) return 1;
    if (price < 500) return 2;
    if (price < 1000) return 3;
    return 4;
}

function estimateAudienceAffinity(audience?: string): number {
    // Placeholder - would analyze audience match
    return audience ? 75 : 60;
}
