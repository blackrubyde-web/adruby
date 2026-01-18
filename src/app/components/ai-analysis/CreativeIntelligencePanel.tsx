import { memo, useState, useCallback, useMemo } from 'react';
import {
    Brain,
    Trophy,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Zap,
    RefreshCw,
    ChevronRight,
    Sparkles,
    Target,
    Clock,
    Loader2,
    BarChart3,
    Eye,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabaseClient';

interface Creative {
    id: string;
    name: string;
    status: string;
    roas: number;
    ctr: number;
    spend: number;
    impressions: number;
    conversions: number;
    daysRunning?: number;
}

interface IntelligenceData {
    summary: {
        totalCreatives: number;
        winners: number;
        losers: number;
        fatigued: number;
        averageFatigueScore: number;
    };
    topPerformers: Array<{
        id: string;
        name: string;
        roas: number;
        ctr: number;
        whyWinning: string;
        scaleRecommendation: string;
    }>;
    bottomPerformers: Array<{
        id: string;
        name: string;
        roas: number;
        ctr: number;
        whyLosing: string;
        fixRecommendation: string;
    }>;
    fatigueAnalysis: Array<{
        id: string;
        name: string;
        fatigueScore: number;
        fatigueLevel: 'fresh' | 'normal' | 'fatiguing' | 'burned';
        symptoms: string[];
        daysUntilCritical: number | null;
        refreshRecommendation: string;
    }>;
    weeklyForecast: {
        expectedRoas: number;
        expectedSpend: number;
        riskLevel: 'low' | 'medium' | 'high';
        topOpportunity: string;
        biggestRisk: string;
    };
    prioritizedActions: Array<{
        priority: 'high' | 'medium' | 'low';
        action: string;
        expectedImpact: string;
        affectedCreatives: string[];
    }>;
}

interface CreativeIntelligencePanelProps {
    creatives: Creative[];
    onActionClick?: (action: string, creativeIds: string[]) => void;
}

const getFatigueColor = (level: string) => {
    switch (level) {
        case 'fresh': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
        case 'normal': return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' };
        case 'fatiguing': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
        case 'burned': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
        default: return { bg: 'bg-white/5', text: 'text-white/50', border: 'border-white/10' };
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        default: return 'bg-white/10 text-white/50';
    }
};

export const CreativeIntelligencePanel = memo(function CreativeIntelligencePanel({
    creatives,
    onActionClick,
}: CreativeIntelligencePanelProps) {
    const [intelligence, setIntelligence] = useState<IntelligenceData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'summary' | 'winners' | 'losers' | 'fatigue' | 'actions'>('summary');

    const runAnalysis = useCallback(async () => {
        if (creatives.length === 0) {
            toast.error('Keine Creatives zum Analysieren');
            return;
        }

        setIsLoading(true);
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;

            const response = await fetch('/api/ai-creative-intelligence', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ creatives, timeRange: '30d' }),
            });

            const data = await response.json();

            if (data.success && data.intelligence) {
                setIntelligence(data.intelligence);
                toast.success(`${creatives.length} Creatives analysiert!`);
            } else {
                throw new Error(data.error || 'Analysis failed');
            }
        } catch (error) {
            console.error('[CreativeIntelligencePanel] Error:', error);
            toast.error('Analyse fehlgeschlagen');
        } finally {
            setIsLoading(false);
        }
    }, [creatives]);

    const tabs = useMemo(() => [
        { id: 'summary', label: 'Übersicht', icon: BarChart3 },
        { id: 'winners', label: 'Winners', icon: Trophy },
        { id: 'losers', label: 'Losers', icon: AlertTriangle },
        { id: 'fatigue', label: 'Fatigue', icon: Clock },
        { id: 'actions', label: 'Actions', icon: Zap },
    ], []);

    return (
        <Card className="relative overflow-hidden bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-950 border-white/5">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1),transparent_60%)] blur-[80px]" />
                <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.08),transparent_60%)] blur-[60px]" />
            </div>

            <div className="relative p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                Creative Intelligence
                                <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-[10px]">
                                    AGENCY PRO
                                </Badge>
                            </h3>
                            <p className="text-sm text-white/50">Enterprise-Level Creative Analysis</p>
                        </div>
                    </div>

                    <Button
                        onClick={runAnalysis}
                        disabled={isLoading || creatives.length === 0}
                        className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 text-white shadow-lg shadow-violet-500/20"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analysiere...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                {intelligence ? 'Neu Analysieren' : 'Jetzt Analysieren'}
                            </>
                        )}
                    </Button>
                </div>

                {!intelligence ? (
                    /* Empty State */
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                            <Eye className="w-8 h-8 text-violet-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-2">Bereit für Deep Analysis</h4>
                        <p className="text-sm text-white/50 max-w-md mx-auto mb-6">
                            Klicke auf "Jetzt Analysieren" um GPT-4o basierte Creative Intelligence zu erhalten.
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 text-xs text-white/40">
                            <span className="px-3 py-1 bg-white/5 rounded-full">Winner Detection</span>
                            <span className="px-3 py-1 bg-white/5 rounded-full">Fatigue Scoring</span>
                            <span className="px-3 py-1 bg-white/5 rounded-full">Pattern Analysis</span>
                            <span className="px-3 py-1 bg-white/5 rounded-full">Weekly Forecast</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Tabs */}
                        <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6 overflow-x-auto">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                                ? 'bg-violet-600 text-white shadow-lg'
                                                : 'text-white/50 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Summary Tab */}
                        {activeTab === 'summary' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-xs text-white/40 mb-1">Total Creatives</p>
                                    <p className="text-2xl font-bold text-white">{intelligence.summary.totalCreatives}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                    <p className="text-xs text-emerald-400/70 mb-1">Winners</p>
                                    <p className="text-2xl font-bold text-emerald-400">{intelligence.summary.winners}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-xs text-red-400/70 mb-1">Losers</p>
                                    <p className="text-2xl font-bold text-red-400">{intelligence.summary.losers}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <p className="text-xs text-amber-400/70 mb-1">Fatigued</p>
                                    <p className="text-2xl font-bold text-amber-400">{intelligence.summary.fatigued}</p>
                                </div>
                            </div>
                        )}

                        {/* Winners Tab */}
                        {activeTab === 'winners' && (
                            <div className="space-y-3">
                                {intelligence.topPerformers.map((performer) => (
                                    <div key={performer.id} className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Trophy className="w-4 h-4 text-emerald-400" />
                                                    <h4 className="font-semibold text-white truncate">{performer.name}</h4>
                                                </div>
                                                <p className="text-sm text-white/50 mb-2">{performer.whyWinning}</p>
                                                <p className="text-xs text-emerald-400/80">{performer.scaleRecommendation}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-lg font-bold text-emerald-400">{performer.roas.toFixed(2)}x</p>
                                                <p className="text-xs text-white/40">CTR: {performer.ctr.toFixed(2)}%</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Losers Tab */}
                        {activeTab === 'losers' && (
                            <div className="space-y-3">
                                {intelligence.bottomPerformers.map((performer) => (
                                    <div key={performer.id} className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <AlertTriangle className="w-4 h-4 text-red-400" />
                                                    <h4 className="font-semibold text-white truncate">{performer.name}</h4>
                                                </div>
                                                <p className="text-sm text-white/50 mb-2">{performer.whyLosing}</p>
                                                <p className="text-xs text-red-400/80">{performer.fixRecommendation}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-lg font-bold text-red-400">{performer.roas.toFixed(2)}x</p>
                                                <p className="text-xs text-white/40">CTR: {performer.ctr.toFixed(2)}%</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Fatigue Tab */}
                        {activeTab === 'fatigue' && (
                            <div className="space-y-3">
                                {intelligence.fatigueAnalysis.map((item) => {
                                    const colors = getFatigueColor(item.fatigueLevel);
                                    return (
                                        <div key={item.id} className={`p-4 rounded-xl ${colors.bg} border ${colors.border}`}>
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-white truncate">{item.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge className={`${colors.bg} ${colors.text} border ${colors.border}`}>
                                                            {item.fatigueLevel}
                                                        </Badge>
                                                        {item.daysUntilCritical && (
                                                            <span className="text-xs text-white/40">
                                                                ~{item.daysUntilCritical}d bis kritisch
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-2xl font-bold ${colors.text}`}>{item.fatigueScore}</p>
                                                    <p className="text-xs text-white/40">Fatigue Score</p>
                                                </div>
                                            </div>
                                            <Progress value={item.fatigueScore} className="h-1.5 mb-2" />
                                            <p className="text-xs text-white/50">{item.refreshRecommendation}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Actions Tab */}
                        {activeTab === 'actions' && (
                            <div className="space-y-3">
                                {intelligence.prioritizedActions.map((action, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge className={getPriorityColor(action.priority)}>
                                                        {action.priority.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm font-medium text-white mb-1">{action.action}</p>
                                                <p className="text-xs text-white/50">{action.expectedImpact}</p>
                                            </div>
                                            {onActionClick && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => onActionClick(action.action, action.affectedCreatives)}
                                                    className="shrink-0"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Weekly Forecast */}
                        {activeTab === 'summary' && intelligence.weeklyForecast && (
                            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
                                <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-violet-400" />
                                    Weekly Forecast
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-white/40">Expected ROAS</p>
                                        <p className="text-lg font-bold text-white">{intelligence.weeklyForecast.expectedRoas.toFixed(2)}x</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/40">Expected Spend</p>
                                        <p className="text-lg font-bold text-white">€{intelligence.weeklyForecast.expectedSpend.toFixed(0)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/40">Risk Level</p>
                                        <Badge className={
                                            intelligence.weeklyForecast.riskLevel === 'high' ? 'bg-red-500/20 text-red-400' :
                                                intelligence.weeklyForecast.riskLevel === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-emerald-500/20 text-emerald-400'
                                        }>
                                            {intelligence.weeklyForecast.riskLevel.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <p className="text-xs text-emerald-400/70 mb-1">Top Opportunity</p>
                                        <p className="text-sm text-white">{intelligence.weeklyForecast.topOpportunity}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <p className="text-xs text-red-400/70 mb-1">Biggest Risk</p>
                                        <p className="text-sm text-white">{intelligence.weeklyForecast.biggestRisk}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
});
