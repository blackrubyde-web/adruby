/**
 * Performance Feedback Loop
 * Tracks actual campaign performance vs. AI predictions
 */

export interface CampaignPerformance {
    campaignId: string;
    campaignName: string;
    launchDate: string;

    // Predicted values (from KPI Forecast)
    predicted: {
        ctr: {
            min: number;
            max: number;
            expected: number;
        };
        roas: {
            min: number;
            max: number;
            expected: number;
        };
    };

    // Actual values (from Meta API)
    actual: {
        ctr?: number;
        roas?: number;
        impressions?: number;
        clicks?: number;
        conversions?: number;
        spend?: number;
        revenue?: number;
    };

    // Accuracy metrics
    accuracy?: {
        ctrError: number;      // % difference
        roasError: number;     // % difference
        confidenceHit: boolean; // Did actual fall within predicted range?
    };

    status: 'active' | 'paused' | 'completed';
    lastUpdated: string;
}

/**
 * Calculate prediction accuracy
 */
export function calculateAccuracy(performance: CampaignPerformance): CampaignPerformance['accuracy'] {
    if (!performance.actual.ctr || !performance.actual.roas) {
        return undefined;
    }

    const ctrError = Math.abs(
        (performance.actual.ctr - performance.predicted.ctr.expected) / performance.predicted.ctr.expected * 100
    );

    const roasError = Math.abs(
        (performance.actual.roas - performance.predicted.roas.expected) / performance.predicted.roas.expected * 100
    );

    const ctrInRange =
        performance.actual.ctr >= performance.predicted.ctr.min &&
        performance.actual.ctr <= performance.predicted.ctr.max;

    const roasInRange =
        performance.actual.roas >= performance.predicted.roas.min &&
        performance.actual.roas <= performance.predicted.roas.max;

    return {
        ctrError,
        roasError,
        confidenceHit: ctrInRange && roasInRange
    };
}

/**
 * Save campaign performance to database
 */
export async function saveCampaignPerformance(
    performance: Omit<CampaignPerformance, 'accuracy' | 'lastUpdated'>
): Promise<{ success: boolean; error?: string }> {
    try {
        const accuracy = calculateAccuracy(performance as CampaignPerformance);

        const response = await fetch('/api/campaign-performance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...performance,
                accuracy,
                lastUpdated: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save performance data');
        }

        return { success: true };
    } catch (error) {
        console.error('Error saving performance:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Fetch campaign performance from Meta API
 */
export async function fetchMetaPerformance(
    campaignId: string
): Promise<CampaignPerformance['actual'] | null> {
    try {
        const response = await fetch(`/.netlify/functions/meta-campaigns?campaignId=${campaignId}`);
        const data = await response.json();

        if (!data.success || !data.insights) {
            return null;
        }

        const insights = data.insights;

        // Calculate metrics from raw data
        const ctr = insights.clicks && insights.impressions
            ? (insights.clicks / insights.impressions) * 100
            : undefined;

        const roas = insights.revenue && insights.spend
            ? insights.revenue / insights.spend
            : undefined;

        return {
            ctr,
            roas,
            impressions: insights.impressions,
            clicks: insights.clicks,
            conversions: insights.conversions,
            spend: insights.spend,
            revenue: insights.revenue
        };
    } catch (error) {
        console.error('Error fetching Meta performance:', error);
        return null;
    }
}

/**
 * Performance tracking hook
 */
export function usePerformanceTracking(campaignId: string) {
    const [performance, setPerformance] = React.useState<CampaignPerformance | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const updatePerformance = async () => {
        setIsLoading(true);
        try {
            const actual = await fetchMetaPerformance(campaignId);

            if (actual && performance) {
                const updated = {
                    ...performance,
                    actual,
                    lastUpdated: new Date().toISOString()
                };

                const accuracy = calculateAccuracy(updated);
                setPerformance({ ...updated, accuracy });

                // Save to database
                await saveCampaignPerformance(updated);
            }
        } catch (error) {
            console.error('Error updating performance:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        performance,
        isLoading,
        updatePerformance,
        setInitialPerformance: setPerformance
    };
}

// Need to add React import
import React from 'react';

/**
 * Model retraining data structure
 */
export interface ModelTrainingData {
    adQuality: {
        imageQuality: number;
        textOptimization: number;
        colorContrast: number;
        layoutBalance: number;
        ctaStrength: number;
    };
    actualCTR: number;
    actualROAS: number;
    timestamp: string;
}

/**
 * Collect training data for model improvement
 */
export async function collectTrainingData(
    performance: CampaignPerformance,
    qualityFactors: ModelTrainingData['adQuality']
): Promise<void> {
    if (!performance.actual.ctr || !performance.actual.roas) {
        return;
    }

    const trainingData: ModelTrainingData = {
        adQuality: qualityFactors,
        actualCTR: performance.actual.ctr,
        actualROAS: performance.actual.roas,
        timestamp: new Date().toISOString()
    };

    try {
        await fetch('/api/model-training', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trainingData)
        });
    } catch (error) {
        console.error('Error collecting training data:', error);
    }
}
