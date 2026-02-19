// Shared types for the AI Analysis page and its sub-components

export type AIRecommendation = 'kill' | 'duplicate' | 'increase' | 'decrease';

export interface AIAnalysis {
    id: string;
    recommendation: AIRecommendation;
    confidence: number;
    reason: string;
    expectedImpact: string;
    details: string[];
}

export interface Ad {
    id: string;
    name: string;
    campaignId: string;
    status: 'active' | 'paused' | 'learning';
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    conversions: number;
    spend: number;
    revenue: number;
    roas: number;
    performanceScore: number;
    aiAnalysis: AIAnalysis;
    strategyId?: string | null;
}

export interface AdSet {
    id: string;
    name: string;
    status: 'active' | 'paused' | 'learning';
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    conversions: number;
    spend: number;
    revenue: number;
    roas: number;
    performanceScore: number;
    ads: Ad[];
    expanded?: boolean;
    strategyId?: string | null;
}

export interface Campaign {
    id: string;
    name: string;
    status: 'active' | 'paused' | 'learning';
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    conversions: number;
    spend: number;
    revenue: number;
    roas: number;
    performanceScore: number;
    adSets: AdSet[];
    expanded?: boolean;
    strategyId?: string | null;
}

export type RecommendationStyle = {
    color: string;
    bg: string;
    border: string;
    icon: JSX.Element;
    label: string;
    actionLabel: string;
    action: 'pause' | 'duplicate' | 'increase' | 'decrease';
    scalePct?: number;
    confirmText: string;
};

// Helper functions shared across sub-components

export function getStatusColor(status: string) {
    switch (status) {
        case 'active': return 'text-green-500 bg-green-500/20';
        case 'paused': return 'text-orange-500 bg-orange-500/20';
        case 'learning': return 'text-blue-500 bg-blue-500/20';
        default: return 'text-muted-foreground bg-muted/20';
    }
}

export function getPerformanceColor(score: number) {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
}
