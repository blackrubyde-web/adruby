import { memo, useMemo } from 'react';
import { Trophy, AlertCircle, TrendingUp, Lightbulb, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card } from '../ui/card';

interface Campaign {
    id: string;
    name: string;
    roas: number;
    spend: number;
    ctr: number;
    conversions: number;
    performanceScore: number;
}

interface InsightSummaryCardsProps {
    campaigns: Campaign[];
    totalSpend: number;
    totalRevenue: number;
    totalRoas: number;
}

interface InsightCard {
    icon: React.ElementType;
    iconColor: string;
    bgColor: string;
    borderColor: string;
    title: string;
    value: string;
    subtitle: string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
}

export const InsightSummaryCards = memo(function InsightSummaryCards({
    campaigns,
    totalSpend,
    totalRevenue,
    totalRoas,
}: InsightSummaryCardsProps) {
    const insights = useMemo<InsightCard[]>(() => {
        if (!campaigns.length) {
            return [];
        }

        const sorted = [...campaigns].sort((a, b) => b.roas - a.roas);
        const topPerformer = sorted[0];
        const worstPerformer = sorted[sorted.length - 1];

        // Find biggest CTR performer (indicates trending)
        const byCtr = [...campaigns].sort((a, b) => b.ctr - a.ctr);
        const trendingUp = byCtr[0];

        // Budget efficiency insight
        const profitableCount = campaigns.filter(c => c.roas > 2).length;
        const unprofitableCount = campaigns.filter(c => c.roas < 1).length;

        const cards: InsightCard[] = [];

        // Top Performer
        if (topPerformer) {
            cards.push({
                icon: Trophy,
                iconColor: 'text-amber-400',
                bgColor: 'bg-amber-500/10',
                borderColor: 'border-amber-500/20',
                title: 'Top Performer',
                value: `${topPerformer.roas.toFixed(2)}x ROAS`,
                subtitle: topPerformer.name.length > 25 ? topPerformer.name.slice(0, 25) + '...' : topPerformer.name,
                trend: 'up',
                trendValue: `€${topPerformer.spend.toFixed(0)} Spend`,
            });
        }

        // Needs Attention
        if (worstPerformer && worstPerformer.roas < 2) {
            cards.push({
                icon: AlertCircle,
                iconColor: 'text-red-400',
                bgColor: 'bg-red-500/10',
                borderColor: 'border-red-500/20',
                title: 'Braucht Aufmerksamkeit',
                value: `${worstPerformer.roas.toFixed(2)}x ROAS`,
                subtitle: worstPerformer.name.length > 25 ? worstPerformer.name.slice(0, 25) + '...' : worstPerformer.name,
                trend: 'down',
                trendValue: 'Pause empfohlen',
            });
        }

        // Trending Up (best CTR = good creative)
        if (trendingUp && trendingUp.ctr > 1.5) {
            cards.push({
                icon: TrendingUp,
                iconColor: 'text-emerald-400',
                bgColor: 'bg-emerald-500/10',
                borderColor: 'border-emerald-500/20',
                title: 'Beste CTR',
                value: `${trendingUp.ctr.toFixed(2)}%`,
                subtitle: trendingUp.name.length > 25 ? trendingUp.name.slice(0, 25) + '...' : trendingUp.name,
                trend: 'up',
                trendValue: 'Creative funktioniert',
            });
        }

        // Budget Tip
        if (unprofitableCount > 0) {
            const wastedSpend = campaigns
                .filter(c => c.roas < 1)
                .reduce((sum, c) => sum + c.spend, 0);
            cards.push({
                icon: Lightbulb,
                iconColor: 'text-violet-400',
                bgColor: 'bg-violet-500/10',
                borderColor: 'border-violet-500/20',
                title: 'Budget-Tipp',
                value: `€${wastedSpend.toFixed(0)} sparen`,
                subtitle: `${unprofitableCount} unprofitable Ads pausieren`,
                trend: 'stable',
                trendValue: 'Optimierung',
            });
        } else if (profitableCount > 0) {
            cards.push({
                icon: Lightbulb,
                iconColor: 'text-violet-400',
                bgColor: 'bg-violet-500/10',
                borderColor: 'border-violet-500/20',
                title: 'Budget-Tipp',
                value: `${profitableCount} skalierbar`,
                subtitle: 'Ads mit ROAS > 2x',
                trend: 'up',
                trendValue: 'Skalierung empfohlen',
            });
        }

        return cards;
    }, [campaigns]);

    if (insights.length === 0) {
        return null;
    }

    const TrendIcon = ({ trend }: { trend?: 'up' | 'down' | 'stable' }) => {
        if (trend === 'up') return <ArrowUpRight className="w-3 h-3" />;
        if (trend === 'down') return <ArrowDownRight className="w-3 h-3" />;
        return <Minus className="w-3 h-3" />;
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {insights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                    <Card
                        key={index}
                        className={`p-4 ${insight.bgColor} border ${insight.borderColor} hover:scale-[1.02] transition-transform cursor-default`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl ${insight.bgColor} border ${insight.borderColor} flex items-center justify-center`}>
                                <Icon className={`w-5 h-5 ${insight.iconColor}`} />
                            </div>
                            {insight.trend && (
                                <div className={`flex items-center gap-1 text-xs ${insight.trend === 'up' ? 'text-emerald-400' :
                                        insight.trend === 'down' ? 'text-red-400' : 'text-white/40'
                                    }`}>
                                    <TrendIcon trend={insight.trend} />
                                    <span>{insight.trendValue}</span>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-white/50 mb-1">{insight.title}</p>
                        <p className="text-xl font-bold text-white mb-1">{insight.value}</p>
                        <p className="text-xs text-white/40 truncate">{insight.subtitle}</p>
                    </Card>
                );
            })}
        </div>
    );
});
