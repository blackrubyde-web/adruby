import { memo, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Zap, RefreshCw } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

export interface CreativeScore {
    score: number;
    feedback: string;
}

export interface CreativeAnalysis {
    scores: {
        visualComposition: CreativeScore;
        colorHarmony: CreativeScore;
        textClarity: CreativeScore;
        hookStrength: CreativeScore;
        ctaVisibility: CreativeScore;
    };
    overallScore: number;
    grade: string;
    targetAudience: string;
    platformFit: string[];
    emotionalAppeal: string;
    strengths: string[];
    improvements: Array<{
        area: string;
        suggestion: string;
        priority: 'high' | 'medium' | 'low';
    }>;
    predictedPerformance: {
        ctrPotential: 'high' | 'medium' | 'low';
        roasPotential: 'high' | 'medium' | 'low';
        fatigueRisk: 'low' | 'medium' | 'high';
    };
    isFallback?: boolean;
}

interface CreativeScoreCardProps {
    analysis: CreativeAnalysis;
    imageUrl?: string;
    adName?: string;
    onOptimize?: () => void;
    isLoading?: boolean;
}

const SCORE_LABELS = {
    visualComposition: 'Visual Composition',
    colorHarmony: 'Farbharmonie',
    textClarity: 'Text-Klarheit',
    hookStrength: 'Hook Stärke',
    ctaVisibility: 'CTA Sichtbarkeit',
};

const getGradeColor = (grade: string) => {
    switch (grade) {
        case 'A+':
        case 'A':
            return 'from-emerald-500 to-green-500';
        case 'B':
            return 'from-blue-500 to-cyan-500';
        case 'C':
            return 'from-amber-500 to-yellow-500';
        case 'D':
        case 'F':
            return 'from-red-500 to-orange-500';
        default:
            return 'from-gray-500 to-gray-400';
    }
};

const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-emerald-500';
    if (score >= 6) return 'bg-blue-500';
    if (score >= 4) return 'bg-amber-500';
    return 'bg-red-500';
};

const getPotentialBadge = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
        case 'high':
            return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Hoch</Badge>;
        case 'medium':
            return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Mittel</Badge>;
        case 'low':
            return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Niedrig</Badge>;
    }
};

export const CreativeScoreCard = memo(function CreativeScoreCard({
    analysis,
    imageUrl,
    adName,
    onOptimize,
    isLoading,
}: CreativeScoreCardProps) {
    const scoreEntries = useMemo(() => {
        return Object.entries(analysis.scores).map(([key, value]) => ({
            key,
            label: SCORE_LABELS[key as keyof typeof SCORE_LABELS] || key,
            ...value,
        }));
    }, [analysis.scores]);

    return (
        <Card className="relative overflow-hidden bg-gradient-to-br from-zinc-900/80 to-zinc-950 border-white/5 p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    {imageUrl && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                            <img src={imageUrl} alt="Creative" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div>
                        <h3 className="text-lg font-bold text-white">{adName || 'Creative Analyse'}</h3>
                        <p className="text-sm text-white/50">AI Creative Score</p>
                    </div>
                </div>

                {/* Grade Badge */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGradeColor(analysis.grade)} flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl font-black text-white">{analysis.grade}</span>
                </div>
            </div>

            {/* Overall Score */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/60">Gesamt-Score</span>
                    <span className="text-2xl font-bold text-white">{analysis.overallScore}/100</span>
                </div>
                <Progress value={analysis.overallScore} className="h-2" />
            </div>

            {/* Individual Scores */}
            <div className="space-y-3 mb-6">
                {scoreEntries.map(({ key, label, score, feedback }) => (
                    <div key={key} className="group">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-white/70">{label}</span>
                            <span className="text-sm font-semibold text-white">{score}/10</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${getScoreColor(score)} rounded-full transition-all duration-500`}
                                style={{ width: `${score * 10}%` }}
                            />
                        </div>
                        <p className="text-xs text-white/40 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {feedback}
                        </p>
                    </div>
                ))}
            </div>

            {/* Predicted Performance */}
            <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-xl bg-white/5">
                <div className="text-center">
                    <p className="text-xs text-white/50 mb-1">CTR Potenzial</p>
                    {getPotentialBadge(analysis.predictedPerformance.ctrPotential)}
                </div>
                <div className="text-center">
                    <p className="text-xs text-white/50 mb-1">ROAS Potenzial</p>
                    {getPotentialBadge(analysis.predictedPerformance.roasPotential)}
                </div>
                <div className="text-center">
                    <p className="text-xs text-white/50 mb-1">Fatigue Risiko</p>
                    {getPotentialBadge(analysis.predictedPerformance.fatigueRisk === 'low' ? 'high' : analysis.predictedPerformance.fatigueRisk === 'high' ? 'low' : 'medium')}
                </div>
            </div>

            {/* Improvements */}
            {analysis.improvements.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        Verbesserungsvorschläge
                    </h4>
                    <div className="space-y-2">
                        {analysis.improvements.slice(0, 3).map((imp, i) => (
                            <div
                                key={i}
                                className={`p-3 rounded-lg border ${imp.priority === 'high'
                                        ? 'bg-red-500/5 border-red-500/20'
                                        : imp.priority === 'medium'
                                            ? 'bg-amber-500/5 border-amber-500/20'
                                            : 'bg-blue-500/5 border-blue-500/20'
                                    }`}
                            >
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className={`w-4 h-4 mt-0.5 ${imp.priority === 'high' ? 'text-red-400' : imp.priority === 'medium' ? 'text-amber-400' : 'text-blue-400'
                                        }`} />
                                    <div>
                                        <p className="text-sm text-white/80 font-medium">{imp.area}</p>
                                        <p className="text-xs text-white/50">{imp.suggestion}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Button */}
            {onOptimize && (
                <button
                    onClick={onOptimize}
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            <Zap className="w-4 h-4" />
                            Creative optimieren
                        </>
                    )}
                </button>
            )}

            {/* Fallback Notice */}
            {analysis.isFallback && (
                <p className="text-xs text-center text-white/30 mt-4">
                    Automatische Analyse basierend auf Performance-Metriken
                </p>
            )}
        </Card>
    );
});
