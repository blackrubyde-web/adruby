// netlify/functions/_shared/trendAnalysis.js
// Trend Detection & Fatigue Analysis Utilities
// Used for predictive insights in AI Analysis

/**
 * Calculate trend direction from data points
 * @param {number[]} dataPoints - Array of values (newest last)
 * @returns {{ direction: 'up' | 'down' | 'stable', slope: number, confidence: number }}
 */
export function calculateTrend(dataPoints) {
    if (!dataPoints || dataPoints.length < 2) {
        return { direction: 'stable', slope: 0, confidence: 0 };
    }

    const n = dataPoints.length;

    // Simple linear regression
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += dataPoints[i];
        sumXY += i * dataPoints[i];
        sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgY = sumY / n;
    const normalizedSlope = avgY !== 0 ? (slope / avgY) * 100 : 0;

    // Determine direction based on percentage change
    let direction = 'stable';
    if (normalizedSlope > 3) direction = 'up';
    else if (normalizedSlope < -3) direction = 'down';

    // Calculate R² for confidence
    const yMean = sumY / n;
    let ssTot = 0, ssRes = 0;
    for (let i = 0; i < n; i++) {
        const yPred = (sumY - slope * sumX) / n + slope * i;
        ssTot += Math.pow(dataPoints[i] - yMean, 2);
        ssRes += Math.pow(dataPoints[i] - yPred, 2);
    }
    const rSquared = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;
    const confidence = Math.round(Math.max(0, Math.min(100, rSquared * 100)));

    return { direction, slope: normalizedSlope, confidence };
}

/**
 * Detect ad fatigue based on metrics history
 * @param {{ ctr: number[], roas: number[], impressions: number[] }} history
 * @returns {{ hasFatigue: boolean, severity: 'none' | 'mild' | 'moderate' | 'severe', indicators: string[], daysToFatigue: number | null }}
 */
export function detectFatigue(history) {
    if (!history || !history.ctr || history.ctr.length < 3) {
        return { hasFatigue: false, severity: 'none', indicators: [], daysToFatigue: null };
    }

    const ctrTrend = calculateTrend(history.ctr);
    const roasTrend = history.roas ? calculateTrend(history.roas) : null;

    const indicators = [];
    let severityScore = 0;

    // CTR declining = primary fatigue indicator
    if (ctrTrend.direction === 'down') {
        if (ctrTrend.slope < -10) {
            indicators.push('CTR sinkt stark (-' + Math.abs(ctrTrend.slope).toFixed(1) + '% pro Tag)');
            severityScore += 3;
        } else if (ctrTrend.slope < -5) {
            indicators.push('CTR sinkt moderat');
            severityScore += 2;
        } else {
            indicators.push('CTR leicht rückläufig');
            severityScore += 1;
        }
    }

    // ROAS declining
    if (roasTrend && roasTrend.direction === 'down') {
        if (roasTrend.slope < -10) {
            indicators.push('ROAS sinkt stark');
            severityScore += 3;
        } else {
            indicators.push('ROAS rückläufig');
            severityScore += 1;
        }
    }

    // Frequency-based fatigue (if impressions grow but CTR drops)
    if (history.impressions && history.impressions.length >= 3) {
        const impTrend = calculateTrend(history.impressions);
        if (impTrend.direction === 'up' && ctrTrend.direction === 'down') {
            indicators.push('Häufigkeit steigt, Engagement sinkt');
            severityScore += 2;
        }
    }

    // Determine severity
    let severity = 'none';
    if (severityScore >= 5) severity = 'severe';
    else if (severityScore >= 3) severity = 'moderate';
    else if (severityScore >= 1) severity = 'mild';

    // Estimate days to critical fatigue
    let daysToFatigue = null;
    if (ctrTrend.slope < -2 && history.ctr.length > 0) {
        const currentCtr = history.ctr[history.ctr.length - 1];
        const criticalCtr = 0.5; // 0.5% as critical threshold
        if (currentCtr > criticalCtr && ctrTrend.slope < 0) {
            const dailyDrop = Math.abs(ctrTrend.slope) / 100 * currentCtr;
            if (dailyDrop > 0) {
                daysToFatigue = Math.round((currentCtr - criticalCtr) / dailyDrop);
            }
        }
    }

    return {
        hasFatigue: severityScore >= 1,
        severity,
        indicators,
        daysToFatigue: daysToFatigue && daysToFatigue > 0 && daysToFatigue < 90 ? daysToFatigue : null
    };
}

/**
 * Predict future performance based on historical data
 * @param {number[]} history - Historical values
 * @param {number} days - Days to predict
 * @returns {{ predictions: number[], trend: string, confidence: number, warning: string | null }}
 */
export function predictPerformance(history, days = 7) {
    if (!history || history.length < 5) {
        return { predictions: [], trend: 'insufficient_data', confidence: 0, warning: null };
    }

    const trend = calculateTrend(history);
    const lastValue = history[history.length - 1];
    const avgValue = history.reduce((a, b) => a + b, 0) / history.length;

    const predictions = [];
    for (let d = 1; d <= days; d++) {
        // Simple linear extrapolation with dampening
        const change = (trend.slope / 100) * lastValue * d * 0.8; // 0.8 dampening factor
        let predicted = lastValue + change;
        // Clamp to reasonable bounds (0 to 2x average)
        predicted = Math.max(0, Math.min(avgValue * 2, predicted));
        predictions.push(Math.round(predicted * 100) / 100);
    }

    // Generate warning if trend is concerning
    let warning = null;
    if (trend.direction === 'down' && trend.slope < -5) {
        const daysUntilZero = lastValue / (Math.abs(trend.slope / 100) * lastValue);
        if (daysUntilZero < 14) {
            warning = `Bei aktuellem Trend wird diese Metrik in ~${Math.round(daysUntilZero)} Tagen kritisch`;
        }
    }

    return {
        predictions,
        trend: trend.direction,
        confidence: trend.confidence,
        warning
    };
}

/**
 * Get comprehensive trend analysis for a campaign
 * @param {{ ctr: number[], roas: number[], conversions: number[], spend: number[] }} metricsHistory 
 * @returns {Object} Full trend analysis
 */
export function getComprehensiveTrendAnalysis(metricsHistory) {
    const ctrTrend = metricsHistory.ctr ? calculateTrend(metricsHistory.ctr) : null;
    const roasTrend = metricsHistory.roas ? calculateTrend(metricsHistory.roas) : null;
    const convTrend = metricsHistory.conversions ? calculateTrend(metricsHistory.conversions) : null;

    const fatigue = detectFatigue(metricsHistory);
    const ctrPrediction = metricsHistory.ctr ? predictPerformance(metricsHistory.ctr, 7) : null;
    const roasPrediction = metricsHistory.roas ? predictPerformance(metricsHistory.roas, 7) : null;

    // Overall health score
    let healthScore = 70; // Baseline
    if (ctrTrend?.direction === 'up') healthScore += 10;
    if (ctrTrend?.direction === 'down') healthScore -= 15;
    if (roasTrend?.direction === 'up') healthScore += 10;
    if (roasTrend?.direction === 'down') healthScore -= 15;
    if (fatigue.severity === 'moderate') healthScore -= 10;
    if (fatigue.severity === 'severe') healthScore -= 20;
    healthScore = Math.max(0, Math.min(100, healthScore));

    // Actionability
    const actions = [];
    if (fatigue.severity === 'severe') {
        actions.push({ type: 'urgent', message: 'Creative refresh dringend empfohlen' });
    } else if (fatigue.severity === 'moderate') {
        actions.push({ type: 'warning', message: 'A/B Test mit neuen Varianten starten' });
    }
    if (roasTrend?.direction === 'down' && roasTrend.slope < -5) {
        actions.push({ type: 'warning', message: 'Budget-Reduktion prüfen' });
    }
    if (ctrTrend?.direction === 'up' && roasTrend?.direction === 'up') {
        actions.push({ type: 'success', message: 'Performance steigt - Skalierung empfohlen' });
    }

    return {
        trends: { ctr: ctrTrend, roas: roasTrend, conversions: convTrend },
        fatigue,
        predictions: { ctr: ctrPrediction, roas: roasPrediction },
        healthScore,
        actions,
        analyzedAt: new Date().toISOString()
    };
}
