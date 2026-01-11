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
    // Check for actual undefined/null values, but allow 0 as valid
    if (performance.actual.ctr === undefined || performance.actual.ctr === null ||
        performance.actual.roas === undefined || performance.actual.roas === null) {
        return undefined;
    }

    // Prevent division by zero for expected values
    const ctrExpected = performance.predicted.ctr.expected;
    const roasExpected = performance.predicted.roas.expected;

    // If expected is 0 or very close to 0, we can't calculate meaningful error percentage
    const ctrError = (ctrExpected && Math.abs(ctrExpected) > 0.001)
        ? Math.abs((performance.actual.ctr - ctrExpected) / ctrExpected * 100)
        : 0;

    const roasError = (roasExpected && Math.abs(roasExpected) > 0.001)
        ? Math.abs((performance.actual.roas - roasExpected) / roasExpected * 100)
        : 0;

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
        const accuracy = calculateAccuracy({
            ...performance,
            lastUpdated: new Date().toISOString()
        });

        const response = await apiClient.post<{ success: boolean; error?: string }>('/api/campaign-performance', {
            ...performance,
            accuracy,
            lastUpdated: new Date().toISOString()
        }
        );

        if (!response.success && response.error) {
            throw new Error(response.error);
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
        type MetaAction = { action_type?: string; value?: number };
        type MetaInsights = {
            impressions?: number;
            clicks?: number;
            ctr?: number;
            spend?: number;
            conversions?: number;
            purchase_value?: number;
            roas?: number;
            actions?: MetaAction[];
        };
        // Build query params and pass to apiClient
        const data = await apiClient.get<{ campaigns?: Array<{ id: string; insights?: MetaInsights }> }>(
            `/.netlify/functions/meta-campaigns?campaignId=${encodeURIComponent(campaignId)}`
        );

        if (!data.campaigns || data.campaigns.length === 0) {
            return null;
        }

        const campaign = data.campaigns.find(c => c.id === campaignId);
        if (!campaign || !campaign.insights) {
            return null;
        }

        const insights = campaign.insights;
        const impressions = insights.impressions ?? 0;
        const clicks = insights.clicks ?? 0;
        const spend = insights.spend ?? 0;
        const purchaseValue = insights.purchase_value ?? 0;

        // Calculate metrics from raw data
        return {
            impressions,
            clicks,
            ctr: insights.ctr ?? (impressions ? (clicks / impressions) * 100 : 0),
            spend,
            conversions: insights.conversions ?? insights.actions?.find(a => a.action_type === 'purchase')?.value ?? 0,
            roas: insights.roas ?? (spend ? purchaseValue / spend : 0)
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
import { apiClient } from '../utils/apiClient';

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
        await apiClient.post('/api/model-training', trainingData);
    } catch (error) {
        console.error('Error collecting training data:', error);
    }
}
