import { memo, useMemo } from 'react';
import {
    Calendar,
    TrendingUp,
    TrendingDown,
    Trophy,
    AlertTriangle,
    Target,
    DollarSign,
    ArrowRight,
    Sparkles,
    BarChart3,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface Campaign {
    id: string;
    name: string;
    roas: number;
    spend: number;
    revenue: number;
    ctr: number;
    conversions: number;
}

interface WeeklySummaryCardProps {
    campaigns: Campaign[];
    previousWeekData?: {
        totalSpend: number;
        totalRevenue: number;
        totalRoas: number;
    };
    weekStartDate?: Date;
}

interface WeeklyInsight {
    type: 'win' | 'loss' | 'opportunity' | 'risk';
    icon: React.ElementType;
    title: string;
    description: string;
    metric?: string;
}

export const WeeklySummaryCard = memo(function WeeklySummaryCard({
    campaigns,
    previousWeekData,
    weekStartDate = new Date(),
}: WeeklySummaryCardProps) {
    const summary = useMemo(() => {
        const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
        const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
        const totalRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
        const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);

        const sorted = [...campaigns].sort((a, b) => b.roas - a.roas);
        const topPerformers = sorted.slice(0, 3);
        const bottomPerformers = sorted.slice(-3).reverse();

        const winners = campaigns.filter(c => c.roas >= 3);
        const losers = campaigns.filter(c => c.roas < 1);

        // Calculate week-over-week changes
        const spendChange = previousWeekData?.totalSpend
            ? ((totalSpend - previousWeekData.totalSpend) / previousWeekData.totalSpend) * 100
            : 0;
        const roasChange = previousWeekData?.totalRoas
            ? ((totalRoas - previousWeekData.totalRoas) / previousWeekData.totalRoas) * 100
            : 0;

        return {
            totalSpend,
            totalRevenue,
            totalRoas,
            totalConversions,
            topPerformers,
            bottomPerformers,
            winners,
            losers,
            spendChange,
            roasChange,
            campaignCount: campaigns.length,
        };
    }, [campaigns, previousWeekData]);

    const insights = useMemo<WeeklyInsight[]>(() => {
        const items: WeeklyInsight[] = [];

        // Top Win
        if (summary.topPerformers[0] && summary.topPerformers[0].roas >= 2) {
            items.push({
                type: 'win',
                icon: Trophy,
                title: 'Top Performer',
                description: `"${summary.topPerformers[0].name}" mit ${summary.topPerformers[0].roas.toFixed(2)}x ROAS`,
                metric: `+€${(summary.topPerformers[0].revenue - summary.topPerformers[0].spend).toFixed(0)} Profit`,
            });
        }

        // Biggest Loss
        if (summary.losers.length > 0) {
            const totalWasted = summary.losers.reduce((sum, c) => sum + c.spend * (1 - c.roas), 0);
            items.push({
                type: 'loss',
                icon: AlertTriangle,
                title: 'Budget-Verlust',
                description: `${summary.losers.length} Ads unter Break-even`,
                metric: `-€${totalWasted.toFixed(0)} verschwendet`,
            });
        }

        // Scale Opportunity
        if (summary.winners.length > 0) {
            items.push({
                type: 'opportunity',
                icon: TrendingUp,
                title: 'Skalierungs-Chance',
                description: `${summary.winners.length} Ads mit ROAS > 3x bereit zum Skalieren`,
                metric: 'Empfehlung: +20% Budget',
            });
        }

        // Risk
        if (summary.roasChange < -10) {
            items.push({
                type: 'risk',
                icon: TrendingDown,
                title: 'ROAS-Rückgang',
                description: `ROAS um ${Math.abs(summary.roasChange).toFixed(0)}% gesunken vs. Vorwoche`,
                metric: 'Creatives prüfen',
            });
        }

        return items;
    }, [summary]);

    const formatWeekRange = () => {
        const start = new Date(weekStartDate);
        start.setDate(start.getDate() - start.getDay() + 1);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);

        return `${start.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} - ${end.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}`;
    };

    const getInsightColor = (type: string) => {
        switch (type) {
            case 'win': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
            case 'loss': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
            case 'opportunity': return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' };
            case 'risk': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
            default: return { bg: 'bg-muted/50', text: 'text-muted-foreground', border: 'border-border' };
        }
    };

    if (campaigns.length === 0) {
        return (
            <Card className="relative overflow-hidden bg-card border-border">
                <div className="relative p-4">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                            <Calendar className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                Weekly AI Summary
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">AUTO</Badge>
                            </h3>
                        </div>
                    </div>
                    <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Noch keine Kampagnen-Daten vorhanden</p>
                        <p className="text-xs text-muted-foreground mt-1">Synchronisiere deine Meta-Kampagnen um den Wochenbericht zu sehen</p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="relative overflow-hidden bg-card border-border">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -left-20 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.08),transparent_60%)] blur-[60px]" />
                <div className="absolute -bottom-20 -right-20 w-[200px] h-[200px] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.06),transparent_60%)] blur-[40px]" />
            </div>

            <div className="relative p-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                            <Calendar className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                Weekly AI Summary
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                                    AUTO
                                </Badge>
                            </h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                                <span>{formatWeekRange()}</span>
                                <span className="text-muted-foreground">·</span>
                                <span>{summary.campaignCount} Kampagnen</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            {summary.spendChange !== 0 && (
                                <span className={`text-xs ${summary.spendChange > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {summary.spendChange > 0 ? '+' : ''}{summary.spendChange.toFixed(0)}%
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Gesamt Spend</p>
                        <p className="text-xl font-bold text-foreground">€{summary.totalSpend.toFixed(0)}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center justify-between mb-2">
                            <BarChart3 className="w-4 h-4 text-emerald-400/60" />
                            {summary.roasChange !== 0 && (
                                <span className={`text-xs ${summary.roasChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {summary.roasChange > 0 ? '+' : ''}{summary.roasChange.toFixed(0)}%
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-emerald-400/60">Ø ROAS</p>
                        <p className="text-xl font-bold text-emerald-400">{summary.totalRoas.toFixed(2)}x</p>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="flex items-center justify-between mb-2">
                            <Target className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">Conversions</p>
                        <p className="text-xl font-bold text-foreground">{summary.totalConversions}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                        <div className="flex items-center justify-between mb-2">
                            <Sparkles className="w-4 h-4 text-violet-400/60" />
                        </div>
                        <p className="text-xs text-violet-400/60">Revenue</p>
                        <p className="text-xl font-bold text-violet-400">€{summary.totalRevenue.toFixed(0)}</p>
                    </div>
                </div>

                {/* AI Insights */}
                <div className="mb-4">
                    <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-violet-400" />
                        KI-Insights
                    </h4>
                    <div className="grid md:grid-cols-2 gap-2">
                        {insights.map((insight, i) => {
                            const colors = getInsightColor(insight.type);
                            const Icon = insight.icon;

                            return (
                                <div key={i} className={`p-4 rounded-xl ${colors.bg} border ${colors.border}`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}>
                                            <Icon className={`w-4 h-4 ${colors.text}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h5 className="font-medium text-foreground text-sm">{insight.title}</h5>
                                            <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
                                            {insight.metric && (
                                                <Badge className={`mt-2 ${colors.bg} ${colors.text} border ${colors.border}`}>
                                                    {insight.metric}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top 3 Performers */}
                <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Top 3 Performer</h4>
                    <div className="space-y-2">
                        {summary.topPerformers.map((campaign, i) => (
                            <div key={campaign.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500/20 text-amber-400' :
                                    i === 1 ? 'bg-muted text-muted-foreground' :
                                        'bg-orange-700/20 text-orange-400'
                                    }`}>
                                    {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground truncate">{campaign.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-emerald-400">{campaign.roas.toFixed(2)}x</p>
                                    <p className="text-xs text-muted-foreground">€{campaign.spend.toFixed(0)} Spend</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Next Week Recommendation */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <ArrowRight className="w-4 h-4 text-violet-400" />
                        <h4 className="text-sm font-semibold text-foreground">Empfehlung für nächste Woche</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {summary.winners.length > 0
                            ? `Skaliere die ${summary.winners.length} Top Performer um +20% Budget. ${summary.losers.length > 0 ? `Pausiere ${summary.losers.length} unprofitable Ads.` : ''}`
                            : summary.losers.length > 0
                                ? `Pausiere ${summary.losers.length} unprofitable Ads und teste neue Creatives.`
                                : 'Performance ist stabil. Teste neue Creative-Varianten für mehr Wachstum.'}
                    </p>
                </div>
            </div>
        </Card>
    );
});
