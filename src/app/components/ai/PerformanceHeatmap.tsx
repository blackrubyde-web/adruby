import { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface Campaign {
    id: string;
    name: string;
    roas: number;
    spend: number;
    revenue: number;
    ctr: number;
    conversions: number;
}

interface Props {
    campaigns: Campaign[];
    onCampaignClick: (campaignId: string) => void;
}

export function PerformanceHeatmap({ campaigns, onCampaignClick }: Props) {
    const getHeatmapColor = (roas: number) => {
        if (roas >= 4.0) return 'bg-gradient-to-br from-green-500/20 to-green-600/30 border-green-500/40 hover:border-green-500';
        if (roas >= 2.5) return 'bg-gradient-to-br from-blue-500/20 to-blue-600/30 border-blue-500/40 hover:border-blue-500';
        if (roas >= 1.5) return 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border-yellow-500/40 hover:border-yellow-500';
        if (roas >= 1.0) return 'bg-gradient-to-br from-orange-500/20 to-orange-600/30 border-orange-500/40 hover:border-orange-500';
        return 'bg-gradient-to-br from-red-500/20 to-red-600/30 border-red-500/40 hover:border-red-500';
    };

    const getROASIcon = (roas: number) => {
        if (roas >= 2.5) return <TrendingUp className="w-4 h-4 text-green-500" />;
        if (roas >= 1.0) return <TrendingUp className="w-4 h-4 text-yellow-500" />;
        return <TrendingDown className="w-4 h-4 text-red-500" />;
    };

    const getRecommendation = (roas: number) => {
        if (roas >= 4.0) return '🚀 Scale';
        if (roas >= 2.5) return '✅ Good';
        if (roas >= 1.5) return '⚠️ Watch';
        if (roas >= 1.0) return '⚡ Optimize';
        return '🛑 Pause';
    };

    // Sort campaigns by ROAS descending
    const sortedCampaigns = useMemo(() => {
        return [...campaigns].sort((a, b) => b.roas - a.roas);
    }, [campaigns]);

    if (campaigns.length === 0) {
        return (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No campaigns to display</p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold">Performance Heatmap</h3>
                    <p className="text-sm text-muted-foreground">
                        Visual overview of all campaigns by ROAS
                    </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-green-500/30 border border-green-500/40" />
                        <span className="text-muted-foreground">≥4.0x</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500/40" />
                        <span className="text-muted-foreground">2.5-4.0x</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-yellow-500/30 border border-yellow-500/40" />
                        <span className="text-muted-foreground">1.5-2.5x</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-red-500/30 border border-red-500/40" />
                        <span className="text-muted-foreground">&lt;1.0x</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {sortedCampaigns.map(campaign => (
                    <button
                        key={campaign.id}
                        onClick={() => onCampaignClick(campaign.id)}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg text-left ${getHeatmapColor(campaign.roas)}`}
                    >
                        {/* Campaign Name */}
                        <div className="flex items-start justify-between mb-2">
                            <p className="font-semibold text-sm line-clamp-2 flex-1 pr-2">
                                {campaign.name}
                            </p>
                            {getROASIcon(campaign.roas)}
                        </div>

                        {/* ROAS */}
                        <div className="mb-3">
                            <p className="text-3xl font-bold">
                                {campaign.roas.toFixed(1)}x
                            </p>
                            <p className="text-xs text-muted-foreground">ROAS</p>
                        </div>

                        {/* Metrics */}
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Spend</span>
                                <span className="font-medium">€{campaign.spend.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Revenue</span>
                                <span className="font-medium">€{campaign.revenue.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Conv</span>
                                <span className="font-medium">{campaign.conversions}</span>
                            </div>
                        </div>

                        {/* Recommendation Badge */}
                        <div className="mt-3 pt-3 border-t border-border/50">
                            <span className="text-xs font-medium">
                                {getRecommendation(campaign.roas)}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
