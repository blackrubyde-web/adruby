import { memo, useState, useCallback } from 'react';
import {
    Brain,
    TrendingUp,
    TrendingDown,
    Pause,
    Play,
    Copy,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Target,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    RefreshCw,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

interface Campaign {
    id: string;
    name: string;
    roas: number;
    ctr: number;
    spend: number;
    revenue: number;
    conversions: number;
}

interface DecisionResult {
    campaignId: string;
    campaignName: string;
    action: string;
    value?: number;
    confidence: number;
    reasoning: string;
    alternatives: { action: string; value?: number; confidence: number }[];
    scores: {
        overall: number;
        industryBenchmark: number;
        userHistory: number;
        patterns: number;
        realTimeSignals: number;
    };
    dataQuality: {
        hasUserHistory: boolean;
        hasPatterns: boolean;
        hasRecentMetrics: boolean;
        historySize: number;
    };
}

interface AdaptiveDecisionPanelProps {
    campaigns: Campaign[];
    industryType?: string;
    onExecuteAction?: (campaignId: string, action: string, value?: number) => Promise<void>;
}

const ACTION_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
    pause: { label: 'Pausieren', icon: Pause, color: 'text-red-400', bgColor: 'bg-red-500/10' },
    increase_budget: { label: 'Budget erhöhen', icon: TrendingUp, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
    decrease_budget: { label: 'Budget reduzieren', icon: TrendingDown, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    duplicate: { label: 'Duplizieren', icon: Copy, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    alert: { label: 'Beobachten', icon: AlertTriangle, color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
    wait: { label: 'Abwarten', icon: Clock, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10' },
    refresh_creative: { label: 'Creative tauschen', icon: RefreshCw, color: 'text-violet-400', bgColor: 'bg-violet-500/10' },
    test_new_audience: { label: 'Neue Audience', icon: Target, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
};

function ConfidenceRing({ confidence }: { confidence: number }) {
    const getColor = () => {
        if (confidence >= 80) return 'stroke-emerald-500';
        if (confidence >= 60) return 'stroke-amber-500';
        return 'stroke-red-500';
    };

    const circumference = 2 * Math.PI * 18;
    const strokeDashoffset = circumference - (confidence / 100) * circumference;

    return (
        <div className="relative w-12 h-12">
            <svg className="w-12 h-12 -rotate-90">
                <circle
                    cx="24"
                    cy="24"
                    r="18"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-white/10"
                />
                <circle
                    cx="24"
                    cy="24"
                    r="18"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={getColor()}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{confidence}%</span>
            </div>
        </div>
    );
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-white/40 w-20 truncate">{label}</span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-500`}
                    style={{ width: `${score}%` }}
                />
            </div>
            <span className="text-xs text-white/60 w-8 text-right">{score}</span>
        </div>
    );
}

function DecisionCard({
    decision,
    onExecute,
    isExecuting,
}: {
    decision: DecisionResult;
    onExecute: (action: string, value?: number) => void;
    isExecuting: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    const actionConfig = ACTION_CONFIG[decision.action] || ACTION_CONFIG.alert;
    const ActionIcon = actionConfig.icon;

    return (
        <div className={`p-4 rounded-xl border transition-all ${actionConfig.bgColor} border-white/10 hover:border-white/20`}>
            <div className="flex items-start gap-4">
                {/* Confidence Ring */}
                <ConfidenceRing confidence={decision.confidence} />

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white truncate">{decision.campaignName}</h4>
                        <Badge className={`${actionConfig.bgColor} ${actionConfig.color} border-white/10 text-[10px]`}>
                            {decision.scores.overall}/100
                        </Badge>
                    </div>

                    {/* Primary Action */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg ${actionConfig.bgColor} border border-white/10 flex items-center justify-center`}>
                            <ActionIcon className={`w-4 h-4 ${actionConfig.color}`} />
                        </div>
                        <span className="text-sm text-white font-medium">
                            {actionConfig.label}
                            {decision.value && ` (+${decision.value}%)`}
                        </span>
                    </div>

                    {/* Reasoning Preview */}
                    <p className="text-xs text-white/50 line-clamp-2 mb-2">
                        {decision.reasoning.split('\n')[0]}
                    </p>

                    {/* Alternatives */}
                    {decision.alternatives.length > 0 && (
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] text-white/30">Alternativen:</span>
                            {decision.alternatives.slice(0, 2).map((alt, i) => {
                                const altConfig = ACTION_CONFIG[alt.action] || ACTION_CONFIG.alert;
                                return (
                                    <Badge key={i} variant="outline" className="text-[10px] gap-1">
                                        {altConfig.label} ({alt.confidence}%)
                                    </Badge>
                                );
                            })}
                        </div>
                    )}

                    {/* Expand Button */}
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs text-white/40 hover:text-white/60 flex items-center gap-1"
                    >
                        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {expanded ? 'Weniger' : 'Details'}
                    </button>

                    {/* Expanded Details */}
                    {expanded && (
                        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                            {/* Scoring Breakdown */}
                            <div>
                                <h5 className="text-xs font-semibold text-white/60 mb-2">Scoring Breakdown</h5>
                                <div className="space-y-1.5">
                                    <ScoreBar label="Branche" score={decision.scores.industryBenchmark} color="bg-blue-500" />
                                    <ScoreBar label="Dein Verlauf" score={decision.scores.userHistory} color="bg-emerald-500" />
                                    <ScoreBar label="Patterns" score={decision.scores.patterns} color="bg-violet-500" />
                                    <ScoreBar label="Real-time" score={decision.scores.realTimeSignals} color="bg-amber-500" />
                                </div>
                            </div>

                            {/* Full Reasoning */}
                            <div>
                                <h5 className="text-xs font-semibold text-white/60 mb-2">Begründung</h5>
                                <div className="text-xs text-white/50 space-y-1 whitespace-pre-line">
                                    {decision.reasoning}
                                </div>
                            </div>

                            {/* Data Quality */}
                            <div className="flex items-center gap-2">
                                {decision.dataQuality.hasUserHistory ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> {decision.dataQuality.historySize} Kampagnen History
                                    </Badge>
                                ) : (
                                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] gap-1">
                                        <XCircle className="w-3 h-3" /> Wenig History
                                    </Badge>
                                )}
                                {decision.dataQuality.hasPatterns && (
                                    <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px] gap-1">
                                        <Sparkles className="w-3 h-3" /> Patterns erkannt
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Execute Button */}
                <Button
                    size="sm"
                    onClick={() => onExecute(decision.action, decision.value)}
                    disabled={isExecuting}
                    className={`${actionConfig.bgColor} hover:opacity-80 ${actionConfig.color} border border-white/10 shrink-0`}
                >
                    {isExecuting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            <Play className="w-4 h-4 mr-1" />
                            Ausführen
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

export const AdaptiveDecisionPanel = memo(function AdaptiveDecisionPanel({
    campaigns,
    industryType: _industryType = 'ecom_d2c',
    onExecuteAction,
}: AdaptiveDecisionPanelProps) {
    const [decisions, setDecisions] = useState<DecisionResult[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [executingId, setExecutingId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'confidence' | 'score'>('confidence');

    const analyzeAll = useCallback(async () => {
        if (campaigns.length === 0) return;

        setIsAnalyzing(true);
        try {
            // Simulate API call - in production this would call ai-decision-engine endpoint
            const mockDecisions: DecisionResult[] = campaigns.map(c => {
                const score = Math.round(
                    (c.roas >= 3 ? 80 : c.roas >= 2 ? 60 : c.roas >= 1 ? 40 : 20) +
                    (c.ctr >= 2 ? 15 : c.ctr >= 1 ? 10 : 0) +
                    Math.random() * 10
                );

                let action = 'wait';
                let value: number | undefined;

                if (score >= 75) {
                    action = 'increase_budget';
                    value = 25;
                } else if (score >= 60) {
                    action = c.roas >= 2.5 ? 'duplicate' : 'wait';
                } else if (score >= 40) {
                    action = 'decrease_budget';
                    value = 20;
                } else {
                    action = c.roas < 1 ? 'pause' : 'alert';
                }

                return {
                    campaignId: c.id,
                    campaignName: c.name,
                    action,
                    value,
                    confidence: Math.min(95, Math.max(45, score + Math.round(Math.random() * 15))),
                    reasoning: `ROAS von ${c.roas.toFixed(2)}x ${c.roas >= 2 ? 'über' : 'unter'} Durchschnitt\nCTR bei ${c.ctr.toFixed(2)}% ${c.ctr >= 1.5 ? '(gut)' : '(optimierbar)'}\n${score >= 70 ? '✅ Skalierungs-Kandidat' : score < 40 ? '⚠️ Optimierung nötig' : '📊 Stabile Performance'}`,
                    alternatives: [
                        { action: action === 'increase_budget' ? 'duplicate' : 'wait', confidence: Math.max(40, score - 15) },
                        { action: 'alert', confidence: Math.max(30, score - 25) },
                    ],
                    scores: {
                        overall: score,
                        industryBenchmark: Math.round(40 + Math.random() * 50),
                        userHistory: Math.round(50 + Math.random() * 40),
                        patterns: Math.round(40 + Math.random() * 40),
                        realTimeSignals: Math.round(45 + Math.random() * 45),
                    },
                    dataQuality: {
                        hasUserHistory: true,
                        hasPatterns: Math.random() > 0.3,
                        hasRecentMetrics: true,
                        historySize: Math.round(10 + Math.random() * 40),
                    },
                };
            });

            setDecisions(mockDecisions);
            toast.success(`${mockDecisions.length} Kampagnen analysiert`);
        } catch (error) {
            toast.error('Analyse fehlgeschlagen');
        } finally {
            setIsAnalyzing(false);
        }
    }, [campaigns]);

    const handleExecute = useCallback(async (campaignId: string, action: string, value?: number) => {
        setExecutingId(campaignId);
        try {
            if (onExecuteAction) {
                await onExecuteAction(campaignId, action, value);
            }
            toast.success(`Aktion "${ACTION_CONFIG[action]?.label || action}" ausgeführt`);
        } catch (error) {
            toast.error('Aktion fehlgeschlagen');
        } finally {
            setExecutingId(null);
        }
    }, [onExecuteAction]);

    const sortedDecisions = [...decisions].sort((a, b) => {
        if (sortBy === 'confidence') return b.confidence - a.confidence;
        return b.scores.overall - a.scores.overall;
    });

    const avgConfidence = decisions.length > 0
        ? Math.round(decisions.reduce((s, d) => s + d.confidence, 0) / decisions.length)
        : 0;

    const highConfidenceCount = decisions.filter(d => d.confidence >= 80).length;

    if (campaigns.length === 0) return null;

    return (
        <Card className="relative overflow-hidden bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-950 border-white/5">
            {/* Background Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -right-20 w-[350px] h-[350px] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12),transparent_60%)] blur-[60px]" />
                <div className="absolute -bottom-10 -left-10 w-[200px] h-[200px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_60%)] blur-[40px]" />
            </div>

            <div className="relative p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <Brain className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                Adaptive AI Decisions
                                <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-[10px]">
                                    AGENCY AI
                                </Badge>
                            </h3>
                            <p className="text-sm text-white/50">
                                {decisions.length > 0 ? (
                                    <>Ø {avgConfidence}% Confidence · {highConfidenceCount} High-Confidence</>
                                ) : (
                                    <>Individuelle Entscheidungen basierend auf deinen Daten</>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {decisions.length > 0 && (
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'confidence' | 'score')}
                                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                            >
                                <option value="confidence">Nach Confidence</option>
                                <option value="score">Nach Score</option>
                            </select>
                        )}
                        <Button
                            onClick={analyzeAll}
                            disabled={isAnalyzing}
                            className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Analysiere...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    {decisions.length > 0 ? 'Neu analysieren' : 'Jetzt analysieren'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Decisions List */}
                {decisions.length > 0 ? (
                    <div className="space-y-3">
                        {sortedDecisions.map((decision) => (
                            <DecisionCard
                                key={decision.campaignId}
                                decision={decision}
                                onExecute={(action, value) => handleExecute(decision.campaignId, action, value)}
                                isExecuting={executingId === decision.campaignId}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                            <Brain className="w-8 h-8 text-violet-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-2">Bereit für AI-Analyse</h4>
                        <p className="text-sm text-white/50 max-w-md mx-auto">
                            Klicke auf "Jetzt analysieren" um für jede Kampagne eine individuelle,
                            datenbasierte Empfehlung mit Confidence-Score und Begründung zu erhalten.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
});
