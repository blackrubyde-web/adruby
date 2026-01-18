// netlify/functions/_shared/aiDecisionEngine.js
// Enterprise-grade Adaptive AI Decision Engine
// Makes individual decisions with confidence scoring, reasoning, and alternatives

import { getStrategyContext, evaluatePerformance, getRecommendedRules } from './strategyKnowledgeBase.js';

/**
 * Decision Types with weights
 */
const DECISION_TYPES = {
    PAUSE: 'pause',
    INCREASE_BUDGET: 'increase_budget',
    DECREASE_BUDGET: 'decrease_budget',
    DUPLICATE: 'duplicate',
    ALERT: 'alert',
    WAIT: 'wait',
    REFRESH_CREATIVE: 'refresh_creative',
    TEST_NEW_AUDIENCE: 'test_new_audience',
};

/**
 * Scoring weights for decision making
 */
const SCORING_WEIGHTS = {
    industryBenchmark: 0.25,    // How does it compare to industry standards
    userHistory: 0.35,          // How does it compare to USER's own history
    patterns: 0.20,             // Recognized patterns from past campaigns
    realTimeSignals: 0.20,      // Current trends (last 24-48h)
};

/**
 * Calculate adaptive threshold based on user's historical performance
 */
export function calculateAdaptiveThreshold(userHistory, industryKey, metric) {
    const strategy = getStrategyContext(industryKey);
    if (!strategy?.benchmarks?.[metric]) {
        return null;
    }

    const industryBenchmark = strategy.benchmarks[metric];

    // If we have user history, calculate personalized threshold
    if (userHistory && userHistory.length > 0) {
        const userAvg = userHistory.reduce((sum, h) => sum + (h[metric] || 0), 0) / userHistory.length;
        const userStdDev = calculateStdDev(userHistory.map(h => h[metric] || 0));

        // Adaptive threshold = User average - 1 standard deviation
        // This means "below your normal performance"
        const adaptiveThreshold = Math.max(
            userAvg - userStdDev,
            industryBenchmark.poor // Never go below industry "poor" level
        );

        return {
            value: adaptiveThreshold,
            userAverage: userAvg,
            industryGood: industryBenchmark.good,
            isPersonalized: true,
            confidence: Math.min(0.9, 0.5 + (userHistory.length * 0.05)), // More history = more confidence
        };
    }

    // Fall back to industry benchmarks
    return {
        value: industryBenchmark.acceptable,
        userAverage: null,
        industryGood: industryBenchmark.good,
        isPersonalized: false,
        confidence: 0.6,
    };
}

/**
 * Evaluate campaign against industry benchmarks
 */
function evaluateVsBenchmarks(campaign, industryKey) {
    const evaluation = evaluatePerformance(industryKey, {
        roas: campaign.roas,
        ctr: campaign.ctr,
        cpc: campaign.cpc,
    });

    if (!evaluation) return { score: 0.5, details: {} };

    let totalScore = 0;
    let count = 0;
    const details = {};

    for (const [metric, data] of Object.entries(evaluation)) {
        const ratingScores = { excellent: 1, good: 0.75, acceptable: 0.5, poor: 0.25 };
        const score = ratingScores[data.rating] || 0.5;
        totalScore += score;
        count++;
        details[metric] = { ...data, score };
    }

    return {
        score: count > 0 ? totalScore / count : 0.5,
        details,
    };
}

/**
 * Evaluate campaign against user's own history
 */
function evaluateVsUserHistory(campaign, userHistory) {
    if (!userHistory || userHistory.length < 5) {
        return { score: 0.5, details: { insufficient_data: true } };
    }

    const avgRoas = userHistory.reduce((s, h) => s + h.roas, 0) / userHistory.length;
    const avgCtr = userHistory.reduce((s, h) => s + h.ctr, 0) / userHistory.length;

    const roasPercentile = campaign.roas / avgRoas;
    const ctrPercentile = campaign.ctr / avgCtr;

    // Score: 1.5x average = 1.0, 1.0x = 0.5, 0.5x = 0.25
    const roasScore = Math.min(1, Math.max(0, (roasPercentile - 0.5) / 1));
    const ctrScore = Math.min(1, Math.max(0, (ctrPercentile - 0.5) / 1));

    return {
        score: (roasScore + ctrScore) / 2,
        details: {
            vsAvgRoas: `${((roasPercentile - 1) * 100).toFixed(0)}%`,
            vsAvgCtr: `${((ctrPercentile - 1) * 100).toFixed(0)}%`,
            userAvgRoas: avgRoas,
            userAvgCtr: avgCtr,
        },
    };
}

/**
 * Evaluate recognized patterns
 */
function evaluatePatterns(campaign, patterns = []) {
    if (!patterns || patterns.length === 0) {
        return { score: 0.5, details: { no_patterns: true } };
    }

    let relevantPatterns = [];
    let warningPatterns = [];

    for (const pattern of patterns) {
        if (pattern.type === 'fatigue' && campaign.frequency > 3) {
            warningPatterns.push({
                name: 'Ad Fatigue Risk',
                description: 'Frequency > 3, historically leads to CTR drop',
                severity: 'warning',
            });
        }

        if (pattern.type === 'scaling_success' && campaign.roas > pattern.threshold) {
            relevantPatterns.push({
                name: 'Scaling Opportunity',
                description: `ROAS above ${pattern.threshold}x has led to successful scaling`,
                severity: 'positive',
            });
        }

        if (pattern.type === 'creative_decay' && campaign.daysRunning > 14) {
            warningPatterns.push({
                name: 'Creative Decay',
                description: 'Ads older than 14 days typically see performance decline',
                severity: 'warning',
            });
        }
    }

    // More warning patterns = lower score
    const baseScore = 0.5;
    const adjustedScore = baseScore + (relevantPatterns.length * 0.1) - (warningPatterns.length * 0.15);

    return {
        score: Math.min(1, Math.max(0, adjustedScore)),
        details: {
            positivePatterns: relevantPatterns,
            warningPatterns: warningPatterns,
        },
    };
}

/**
 * Evaluate real-time signals (last 24-48h trends)
 */
function evaluateRealTimeSignals(campaign, recentMetrics = null) {
    if (!recentMetrics) {
        return { score: 0.5, details: { no_recent_data: true } };
    }

    const signals = [];
    let score = 0.5;

    // CTR trend
    if (recentMetrics.ctrTrend) {
        if (recentMetrics.ctrTrend > 0.1) {
            signals.push({ name: 'CTR Rising', value: `+${(recentMetrics.ctrTrend * 100).toFixed(0)}%`, positive: true });
            score += 0.15;
        } else if (recentMetrics.ctrTrend < -0.1) {
            signals.push({ name: 'CTR Falling', value: `${(recentMetrics.ctrTrend * 100).toFixed(0)}%`, positive: false });
            score -= 0.15;
        }
    }

    // ROAS trend
    if (recentMetrics.roasTrend) {
        if (recentMetrics.roasTrend > 0.1) {
            signals.push({ name: 'ROAS Rising', value: `+${(recentMetrics.roasTrend * 100).toFixed(0)}%`, positive: true });
            score += 0.2;
        } else if (recentMetrics.roasTrend < -0.1) {
            signals.push({ name: 'ROAS Falling', value: `${(recentMetrics.roasTrend * 100).toFixed(0)}%`, positive: false });
            score -= 0.2;
        }
    }

    // Spend efficiency
    if (recentMetrics.spendEfficiency) {
        if (recentMetrics.spendEfficiency > 1.2) {
            signals.push({ name: 'High Efficiency', value: `${(recentMetrics.spendEfficiency * 100).toFixed(0)}%`, positive: true });
            score += 0.1;
        }
    }

    return {
        score: Math.min(1, Math.max(0, score)),
        details: { signals },
    };
}

/**
 * Determine best action based on scores
 */
function determineBestAction(scores, campaign) {
    const avgScore = Object.values(scores).reduce((s, v) => s + v.score, 0) / Object.keys(scores).length;

    const actions = [];

    // High performer - scale
    if (avgScore >= 0.75) {
        if (campaign.roas >= 3) {
            actions.push({ action: DECISION_TYPES.INCREASE_BUDGET, value: 25, confidence: 0.85 + (avgScore - 0.75) });
            actions.push({ action: DECISION_TYPES.DUPLICATE, confidence: 0.7 });
        } else {
            actions.push({ action: DECISION_TYPES.INCREASE_BUDGET, value: 15, confidence: 0.75 });
        }
    }

    // Good performer - maintain or slightly scale
    else if (avgScore >= 0.55) {
        actions.push({ action: DECISION_TYPES.WAIT, confidence: 0.7 });
        if (campaign.roas >= 2) {
            actions.push({ action: DECISION_TYPES.INCREASE_BUDGET, value: 10, confidence: 0.55 });
        }
    }

    // Below average - optimize or pause
    else if (avgScore >= 0.35) {
        if (scores.realTimeSignals?.score < 0.4) {
            actions.push({ action: DECISION_TYPES.DECREASE_BUDGET, value: 20, confidence: 0.7 });
        }
        if (scores.patterns?.details?.warningPatterns?.length > 0) {
            actions.push({ action: DECISION_TYPES.REFRESH_CREATIVE, confidence: 0.65 });
        }
        actions.push({ action: DECISION_TYPES.ALERT, confidence: 0.6 });
    }

    // Poor performer - pause or kill
    else {
        if (campaign.roas < 1) {
            actions.push({ action: DECISION_TYPES.PAUSE, confidence: 0.9 });
        } else {
            actions.push({ action: DECISION_TYPES.DECREASE_BUDGET, value: 30, confidence: 0.8 });
            actions.push({ action: DECISION_TYPES.PAUSE, confidence: 0.6 });
        }
    }

    // Sort by confidence
    actions.sort((a, b) => b.confidence - a.confidence);

    return actions;
}

/**
 * Generate human-readable reasoning
 */
function generateReasoning(scores, campaign, primaryAction) {
    const reasons = [];

    // Industry benchmark reasoning
    if (scores.industryBenchmark?.details) {
        for (const [metric, data] of Object.entries(scores.industryBenchmark.details)) {
            if (data.rating === 'excellent') {
                reasons.push(`Dein ${metric.toUpperCase()} ist **exzellent** für deine Branche`);
            } else if (data.rating === 'poor') {
                reasons.push(`Dein ${metric.toUpperCase()} liegt **unter dem Branchendurchschnitt**`);
            }
        }
    }

    // User history reasoning
    if (scores.userHistory?.details && !scores.userHistory.details.insufficient_data) {
        const vsRoas = scores.userHistory.details.vsAvgRoas;
        if (vsRoas.startsWith('+')) {
            reasons.push(`ROAS ist ${vsRoas} über deinem 30-Tage-Schnitt`);
        } else if (parseInt(vsRoas) < -15) {
            reasons.push(`ROAS ist ${vsRoas} unter deinem üblichen Niveau`);
        }
    }

    // Pattern reasoning
    if (scores.patterns?.details?.warningPatterns?.length > 0) {
        scores.patterns.details.warningPatterns.forEach(p => {
            reasons.push(`⚠️ ${p.name}: ${p.description}`);
        });
    }
    if (scores.patterns?.details?.positivePatterns?.length > 0) {
        scores.patterns.details.positivePatterns.forEach(p => {
            reasons.push(`✅ ${p.name}: ${p.description}`);
        });
    }

    // Real-time signals
    if (scores.realTimeSignals?.details?.signals) {
        scores.realTimeSignals.details.signals.forEach(s => {
            const icon = s.positive ? '📈' : '📉';
            reasons.push(`${icon} ${s.name}: ${s.value}`);
        });
    }

    return reasons.join('\n');
}

/**
 * Main decision function - makes individual decisions with full context
 */
export function makeDecision(campaign, context = {}) {
    const {
        industryKey = 'ecom_d2c',
        userHistory = [],
        patterns = [],
        recentMetrics = null,
    } = context;

    // Calculate all scores
    const scores = {
        industryBenchmark: evaluateVsBenchmarks(campaign, industryKey),
        userHistory: evaluateVsUserHistory(campaign, userHistory),
        patterns: evaluatePatterns(campaign, patterns),
        realTimeSignals: evaluateRealTimeSignals(campaign, recentMetrics),
    };

    // Apply weights
    const weightedScore =
        (scores.industryBenchmark.score * SCORING_WEIGHTS.industryBenchmark) +
        (scores.userHistory.score * SCORING_WEIGHTS.userHistory) +
        (scores.patterns.score * SCORING_WEIGHTS.patterns) +
        (scores.realTimeSignals.score * SCORING_WEIGHTS.realTimeSignals);

    // Determine actions
    const actions = determineBestAction(scores, campaign);
    const primaryAction = actions[0];
    const alternatives = actions.slice(1, 3);

    // Generate reasoning
    const reasoning = generateReasoning(scores, campaign, primaryAction);

    // Calculate overall confidence (weighted by data availability)
    let confidenceModifier = 1;
    if (scores.userHistory.details?.insufficient_data) confidenceModifier -= 0.15;
    if (scores.patterns.details?.no_patterns) confidenceModifier -= 0.1;
    if (scores.realTimeSignals.details?.no_recent_data) confidenceModifier -= 0.1;

    const finalConfidence = Math.min(0.95, primaryAction.confidence * confidenceModifier);

    return {
        campaignId: campaign.id,
        campaignName: campaign.name,

        // Primary recommendation
        action: primaryAction.action,
        value: primaryAction.value,
        confidence: Math.round(finalConfidence * 100),

        // Detailed reasoning
        reasoning,

        // Alternative options
        alternatives: alternatives.map(a => ({
            action: a.action,
            value: a.value,
            confidence: Math.round(a.confidence * confidenceModifier * 100),
        })),

        // Scoring breakdown
        scores: {
            overall: Math.round(weightedScore * 100),
            industryBenchmark: Math.round(scores.industryBenchmark.score * 100),
            userHistory: Math.round(scores.userHistory.score * 100),
            patterns: Math.round(scores.patterns.score * 100),
            realTimeSignals: Math.round(scores.realTimeSignals.score * 100),
        },

        // Metadata
        dataQuality: {
            hasUserHistory: userHistory.length >= 5,
            hasPatterns: patterns.length > 0,
            hasRecentMetrics: !!recentMetrics,
            historySize: userHistory.length,
        },

        generatedAt: new Date().toISOString(),
    };
}

/**
 * Batch decision making for multiple campaigns
 */
export function makeBatchDecisions(campaigns, context = {}) {
    return campaigns.map(campaign => makeDecision(campaign, context));
}

/**
 * Get recommended rules with adaptive thresholds
 */
export function getAdaptiveRules(industryKey, userHistory = []) {
    const baseRules = getRecommendedRules(industryKey);

    return baseRules.map(rule => {
        // Try to make threshold adaptive
        const metricMatch = rule.condition.match(/(\w+)\s*[<>]=?\s*([\d.]+)/);
        if (metricMatch && userHistory.length >= 5) {
            const metric = metricMatch[1];
            const baseValue = parseFloat(metricMatch[2]);
            const adaptive = calculateAdaptiveThreshold(userHistory, industryKey, metric);

            if (adaptive?.isPersonalized) {
                return {
                    ...rule,
                    originalThreshold: baseValue,
                    adaptiveThreshold: adaptive.value,
                    reasoning: `Adaptiert basierend auf deinem Ø ${metric}: ${adaptive.userAverage?.toFixed(2)}`,
                    confidence: Math.round(adaptive.confidence * 100),
                    isAdaptive: true,
                };
            }
        }

        return {
            ...rule,
            isAdaptive: false,
            confidence: 60,
        };
    });
}

// Utility: Calculate standard deviation
function calculateStdDev(values) {
    if (values.length === 0) return 0;
    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    const squareDiffs = values.map(v => Math.pow(v - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((s, v) => s + v, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
}
