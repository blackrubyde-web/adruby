// netlify/functions/_shared/aiPatternEngine.js
// AI Pattern Recognition Engine - Identifies and learns from campaign patterns

/**
 * Pattern Types
 */
export const PATTERN_TYPES = {
    FATIGUE: 'fatigue',
    SCALING_SUCCESS: 'scaling_success',
    CREATIVE_DECAY: 'creative_decay',
    TIMING: 'timing',
    AUDIENCE: 'audience',
    BUDGET: 'budget',
    SEASONAL: 'seasonal',
};

/**
 * Default patterns that apply to most accounts
 */
export const DEFAULT_PATTERNS = [
    {
        type: PATTERN_TYPES.FATIGUE,
        name: 'Ad Fatigue (Frequency > 3.5)',
        description: 'Ads with frequency above 3.5 typically see declining CTR',
        conditions: { metric: 'frequency', operator: '>', value: 3.5 },
        severity: 'warning',
        recommendedAction: 'refresh_creative',
    },
    {
        type: PATTERN_TYPES.CREATIVE_DECAY,
        name: 'Creative Decay (14+ Days)',
        description: 'Creatives older than 14 days often experience performance decline',
        conditions: { metric: 'daysRunning', operator: '>', value: 14 },
        severity: 'info',
        recommendedAction: 'alert',
    },
    {
        type: PATTERN_TYPES.SCALING_SUCCESS,
        name: 'Scaling Opportunity (ROAS > 3x)',
        description: 'Campaigns with ROAS above 3x are prime candidates for scaling',
        conditions: { metric: 'roas', operator: '>', value: 3 },
        severity: 'positive',
        recommendedAction: 'increase_budget',
    },
    {
        type: PATTERN_TYPES.BUDGET,
        name: 'Budget Inefficiency (CPC Rising)',
        description: 'Rising CPC with stable CTR indicates budget inefficiency',
        conditions: { metric: 'cpcTrend', operator: '>', value: 0.15 },
        severity: 'warning',
        recommendedAction: 'decrease_budget',
    },
];

/**
 * Detect patterns in a single campaign
 */
export function detectCampaignPatterns(campaign, userPatterns = [], context = {}) {
    const detectedPatterns = [];
    const allPatterns = [...DEFAULT_PATTERNS, ...userPatterns];

    for (const pattern of allPatterns) {
        const { conditions } = pattern;
        if (!conditions) continue;

        const value = getCampaignMetric(campaign, conditions.metric, context);
        if (value === null || value === undefined) continue;

        const matches = evaluateCondition(value, conditions.operator, conditions.value);

        if (matches) {
            detectedPatterns.push({
                ...pattern,
                campaignId: campaign.id,
                campaignName: campaign.name,
                actualValue: value,
                threshold: conditions.value,
                detectedAt: new Date().toISOString(),
            });
        }
    }

    return detectedPatterns;
}

/**
 * Detect patterns across all campaigns (aggregate patterns)
 */
export function detectAggregatePatterns(campaigns, userHistory = []) {
    const patterns = [];

    // Pattern: Overall Account Health
    const avgRoas = campaigns.reduce((s, c) => s + c.roas, 0) / campaigns.length;
    const avgCtr = campaigns.reduce((s, c) => s + c.ctr, 0) / campaigns.length;

    if (avgRoas < 1.5) {
        patterns.push({
            type: PATTERN_TYPES.BUDGET,
            name: 'Account-Wide Low ROAS',
            description: `Average ROAS of ${avgRoas.toFixed(2)}x is below profitable threshold`,
            severity: 'critical',
            affectedCampaigns: campaigns.filter(c => c.roas < 1.5).length,
            recommendedAction: 'Review all campaigns and pause underperformers',
        });
    }

    // Pattern: Multiple Fatiguing Ads
    const fatiguingAds = campaigns.filter(c => c.frequency > 3);
    if (fatiguingAds.length >= 3) {
        patterns.push({
            type: PATTERN_TYPES.FATIGUE,
            name: 'Multiple Ads Fatiguing',
            description: `${fatiguingAds.length} ads have high frequency (>3)`,
            severity: 'warning',
            affectedCampaigns: fatiguingAds.length,
            recommendedAction: 'Refresh creatives across multiple campaigns',
        });
    }

    // Pattern: Scaling Opportunity
    const scalableAds = campaigns.filter(c => c.roas >= 3);
    if (scalableAds.length >= 2) {
        patterns.push({
            type: PATTERN_TYPES.SCALING_SUCCESS,
            name: 'Multiple Scaling Opportunities',
            description: `${scalableAds.length} ads have excellent ROAS for scaling`,
            severity: 'positive',
            affectedCampaigns: scalableAds.length,
            recommendedAction: 'Consider increasing budgets across top performers',
        });
    }

    // Pattern from History: Declining Performance
    if (userHistory.length >= 7) {
        const recentWeek = userHistory.slice(0, 7);
        const previousWeek = userHistory.slice(7, 14);

        if (previousWeek.length >= 7) {
            const recentAvgRoas = recentWeek.reduce((s, h) => s + (h.outcome_roas || h.metrics_at_decision?.roas || 0), 0) / recentWeek.length;
            const previousAvgRoas = previousWeek.reduce((s, h) => s + (h.outcome_roas || h.metrics_at_decision?.roas || 0), 0) / previousWeek.length;

            if (recentAvgRoas < previousAvgRoas * 0.8) {
                patterns.push({
                    type: PATTERN_TYPES.SEASONAL,
                    name: 'Declining Week-over-Week Performance',
                    description: `ROAS dropped ${((1 - recentAvgRoas / previousAvgRoas) * 100).toFixed(0)}% compared to last week`,
                    severity: 'warning',
                    recommendedAction: 'Review current creatives and consider new tests',
                });
            }
        }
    }

    return patterns;
}

/**
 * Learn new patterns from historical data
 */
export function learnPatternsFromHistory(decisions) {
    if (decisions.length < 20) {
        return []; // Need enough data to learn patterns
    }

    const learnedPatterns = [];

    // Group decisions by type and analyze success rates
    const decisionGroups = {};
    decisions.forEach(d => {
        if (!decisionGroups[d.decision_type]) {
            decisionGroups[d.decision_type] = [];
        }
        decisionGroups[d.decision_type].push(d);
    });

    // Analyze each decision type
    for (const [type, group] of Object.entries(decisionGroups)) {
        if (group.length < 5) continue;

        const withOutcomes = group.filter(d => d.was_successful !== null);
        if (withOutcomes.length < 3) continue;

        const successRate = withOutcomes.filter(d => d.was_successful).length / withOutcomes.length;

        // Find common characteristics of successful decisions
        const successfulDecisions = withOutcomes.filter(d => d.was_successful);
        if (successfulDecisions.length >= 2) {
            // Analyze confidence levels
            const avgSuccessfulConfidence = successfulDecisions.reduce((s, d) => s + d.confidence, 0) / successfulDecisions.length;

            if (avgSuccessfulConfidence > 75) {
                learnedPatterns.push({
                    type: 'learned',
                    name: `High Confidence ${type} Success`,
                    description: `${type} decisions with confidence > ${avgSuccessfulConfidence.toFixed(0)}% have ${(successRate * 100).toFixed(0)}% success rate`,
                    conditions: { metric: 'confidence', operator: '>', value: avgSuccessfulConfidence - 5 },
                    confidence: successRate,
                    occurrences: successfulDecisions.length,
                    source: 'learned_from_history',
                });
            }
        }

        // Analyze ROAS thresholds for successful scaling
        if (type === 'increase_budget') {
            const roasValues = successfulDecisions
                .map(d => d.metrics_at_decision?.roas)
                .filter(r => r !== undefined);

            if (roasValues.length >= 3) {
                const minSuccessfulRoas = Math.min(...roasValues);
                learnedPatterns.push({
                    type: PATTERN_TYPES.SCALING_SUCCESS,
                    name: 'Learned Scaling Threshold',
                    description: `Budget increases work when ROAS > ${minSuccessfulRoas.toFixed(1)}x (based on your history)`,
                    conditions: { metric: 'roas', operator: '>', value: minSuccessfulRoas },
                    confidence: successRate,
                    occurrences: roasValues.length,
                    source: 'learned_from_history',
                });
            }
        }
    }

    return learnedPatterns;
}

/**
 * Calculate pattern strength based on history
 */
export function calculatePatternStrength(pattern, decisions) {
    // Find decisions that match this pattern
    const relevantDecisions = decisions.filter(d => {
        const metrics = d.metrics_at_decision || {};
        const value = metrics[pattern.conditions?.metric];
        if (!value) return false;
        return evaluateCondition(value, pattern.conditions?.operator, pattern.conditions?.value);
    });

    if (relevantDecisions.length === 0) {
        return { ...pattern, strength: 0.5, dataPoints: 0 };
    }

    const withOutcomes = relevantDecisions.filter(d => d.was_successful !== null);
    if (withOutcomes.length === 0) {
        return { ...pattern, strength: 0.5, dataPoints: relevantDecisions.length };
    }

    const successRate = withOutcomes.filter(d => d.was_successful).length / withOutcomes.length;

    return {
        ...pattern,
        strength: successRate,
        dataPoints: withOutcomes.length,
        lastTriggered: relevantDecisions[0]?.created_at,
    };
}

/**
 * Get recommended actions based on detected patterns
 */
export function getPatternRecommendations(patterns) {
    const recommendations = [];
    const priorities = { critical: 1, warning: 2, info: 3, positive: 4 };

    // Sort by severity
    const sortedPatterns = [...patterns].sort((a, b) =>
        (priorities[a.severity] || 5) - (priorities[b.severity] || 5)
    );

    for (const pattern of sortedPatterns) {
        recommendations.push({
            pattern: pattern.name,
            severity: pattern.severity,
            action: pattern.recommendedAction,
            reason: pattern.description,
            affectedCampaigns: pattern.affectedCampaigns || (pattern.campaignId ? 1 : 'all'),
            confidence: pattern.confidence || pattern.strength || 0.7,
        });
    }

    return recommendations;
}

// ============================================
// Helper Functions
// ============================================

function getCampaignMetric(campaign, metric, context = {}) {
    switch (metric) {
        case 'roas':
            return campaign.roas;
        case 'ctr':
            return campaign.ctr;
        case 'cpc':
            return campaign.cpc || (campaign.spend / (campaign.clicks || 1));
        case 'frequency':
            return campaign.frequency || context.frequency || 0;
        case 'spend':
            return campaign.spend;
        case 'daysRunning':
            return context.daysRunning || calculateDaysRunning(campaign);
        case 'cpcTrend':
            return context.cpcTrend || 0;
        case 'ctrTrend':
            return context.ctrTrend || 0;
        case 'roasTrend':
            return context.roasTrend || 0;
        case 'confidence':
            return context.confidence || 0;
        default:
            return campaign[metric] || null;
    }
}

function calculateDaysRunning(campaign) {
    if (!campaign.startDate && !campaign.createdAt) return 0;
    const start = new Date(campaign.startDate || campaign.createdAt);
    const now = new Date();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

function evaluateCondition(value, operator, threshold) {
    switch (operator) {
        case '>':
            return value > threshold;
        case '<':
            return value < threshold;
        case '>=':
            return value >= threshold;
        case '<=':
            return value <= threshold;
        case '==':
        case '=':
            return value === threshold;
        case '!=':
            return value !== threshold;
        default:
            return false;
    }
}

/**
 * Main analysis function - runs full pattern detection
 */
export function analyzePatterns(campaigns, userHistory = [], userPatterns = []) {
    const results = {
        campaignPatterns: [],
        aggregatePatterns: [],
        learnedPatterns: [],
        recommendations: [],
    };

    // Detect patterns for each campaign
    for (const campaign of campaigns) {
        const patterns = detectCampaignPatterns(campaign, userPatterns);
        results.campaignPatterns.push({
            campaignId: campaign.id,
            campaignName: campaign.name,
            patterns,
        });
    }

    // Detect aggregate patterns
    results.aggregatePatterns = detectAggregatePatterns(campaigns, userHistory);

    // Learn new patterns from history
    results.learnedPatterns = learnPatternsFromHistory(userHistory);

    // Generate recommendations
    const allPatterns = [
        ...results.campaignPatterns.flatMap(cp => cp.patterns),
        ...results.aggregatePatterns,
    ];
    results.recommendations = getPatternRecommendations(allPatterns);

    return results;
}
