import { memo, useMemo } from 'react';
import { Zap, Eye } from 'lucide-react';
import { TrendMiniChart } from './TrendMiniChart';

interface CampaignMetricsRowProps {
    campaign: {
        id: string;
        name: string;
        status: 'active' | 'paused' | 'learning';
        roas: number;
        ctr: number;
        spend: number;
        revenue: number;
        conversions: number;
        performanceScore: number;
    };
    roasHistory?: number[];
    ctrHistory?: number[];
    recommendation?: 'kill' | 'duplicate' | 'increase' | 'decrease';
    onAction?: (action: string, campaignId: string) => void;
    isExpanded?: boolean;
    onToggle?: () => void;
}

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'active':
            return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' };
        case 'paused':
            return { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-500' };
        case 'learning':
            return { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-500 animate-pulse' };
        default:
            return { bg: 'bg-white/5', text: 'text-white/50', dot: 'bg-white/30' };
    }
};

const getRecommendationStyles = (rec?: string) => {
    switch (rec) {
        case 'duplicate':
            return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', label: 'Scale' };
        case 'kill':
            return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', label: 'Pause' };
        case 'increase':
            return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', label: '+Budget' };
        case 'decrease':
            return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', label: '-Budget' };
        default:
            return null;
    }
};

const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-emerald-500 to-green-500';
    if (score >= 70) return 'from-blue-500 to-cyan-500';
    if (score >= 50) return 'from-amber-500 to-yellow-500';
    return 'from-red-500 to-orange-500';
};

export const CampaignMetricsRow = memo(function CampaignMetricsRow({
    campaign,
    roasHistory,
    ctrHistory,
    recommendation,
    onAction: _onAction,
    isExpanded,
    onToggle,
}: CampaignMetricsRowProps) {
    const statusStyles = useMemo(() => getStatusStyles(campaign.status), [campaign.status]);
    const recStyles = useMemo(() => getRecommendationStyles(recommendation), [recommendation]);
    const scoreGradient = useMemo(() => getScoreColor(campaign.performanceScore), [campaign.performanceScore]);

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:shadow-lg hover:shadow-violet-500/5 ${isExpanded ? 'ring-1 ring-violet-500/30' : ''
                }`}
        >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
            </div>

            <div className="p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Left: Name, Status, Score */}
                    <div className="flex items-center gap-4 lg:w-[280px] lg:shrink-0">
                        {/* Performance Score Circle */}
                        <div className="relative shrink-0">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${scoreGradient} p-[2px]`}>
                                <div className="w-full h-full rounded-[10px] bg-zinc-900 flex items-center justify-center">
                                    <span className="text-sm font-bold text-white">{campaign.performanceScore}</span>
                                </div>
                            </div>
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-white truncate">{campaign.name}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${statusStyles.bg} ${statusStyles.text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`} />
                                    {campaign.status}
                                </span>
                                {recStyles && (
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${recStyles.bg} ${recStyles.text} border ${recStyles.border}`}>
                                        <Zap className="w-3 h-3" />
                                        {recStyles.label}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Middle: Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:flex-1">
                        <div className="text-center">
                            <p className="text-xs text-white/40 mb-1">ROAS</p>
                            <p className={`text-lg font-bold ${campaign.roas >= 2 ? 'text-emerald-400' : campaign.roas >= 1 ? 'text-white' : 'text-red-400'}`}>
                                {campaign.roas.toFixed(2)}x
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-white/40 mb-1">CTR</p>
                            <p className="text-lg font-bold text-white">{campaign.ctr.toFixed(2)}%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-white/40 mb-1">Spend</p>
                            <p className="text-lg font-bold text-white">€{campaign.spend.toFixed(0)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-white/40 mb-1">Conv.</p>
                            <p className="text-lg font-bold text-white">{campaign.conversions}</p>
                        </div>
                    </div>

                    {/* Right: Sparklines */}
                    <div className="flex items-center gap-6 lg:w-[240px] lg:shrink-0 justify-end">
                        {roasHistory && roasHistory.length > 2 && (
                            <TrendMiniChart data={roasHistory} label="ROAS" unit="x" height={32} />
                        )}
                        {ctrHistory && ctrHistory.length > 2 && (
                            <TrendMiniChart data={ctrHistory} label="CTR" unit="%" height={32} />
                        )}

                        {/* Expand Button */}
                        {onToggle && (
                            <button
                                onClick={onToggle}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <Eye className="w-4 h-4 text-white/50" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Glow on Hover */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
});
