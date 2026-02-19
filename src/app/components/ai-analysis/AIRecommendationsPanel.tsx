import {
    Brain,
    Trash2,
    Copy,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
} from 'lucide-react';
import { Card } from '../ui/card';
import type { Ad, RecommendationStyle } from './types';

interface RecommendationItem {
    ad: Ad;
    campaign: string;
    adSet: string;
}

interface AIRecommendationsPanelProps {
    recommendations: RecommendationItem[];
    killCount: number;
    duplicateCount: number;
    increaseCount: number;
    decreaseCount: number;
    applyingActions: Record<string, boolean>;
    getRecommendationStyle: (recommendation: string) => RecommendationStyle;
    isMetaLinked: (campaignId: string) => boolean;
    onAction: (style: RecommendationStyle, ad: Ad) => void;
}

export function AIRecommendationsPanel({
    recommendations,
    killCount,
    duplicateCount,
    increaseCount,
    decreaseCount,
    applyingActions,
    getRecommendationStyle,
    isMetaLinked,
    onAction,
}: AIRecommendationsPanelProps) {
    return (
        <>
            {/* Mobile: Collapsible Accordion */}
            <div className="lg:hidden mt-4 w-full max-w-full min-w-0">
                <Card className="overflow-hidden p-0">
                    <details className="overflow-hidden">
                        <summary className="px-4 py-3 cursor-pointer flex items-center justify-between">
                            <span className="font-semibold text-foreground flex items-center gap-2">
                                <Brain className="w-5 h-5 text-primary" />
                                AI Recommendations
                            </span>
                            <span className="text-xs text-muted-foreground">Tap to view</span>
                        </summary>
                        <div className="p-4 border-t border-border/30 space-y-4">
                            {/* Panel Content - Summary Cards */}
                            <div className="grid grid-cols-2 gap-3">
                                <StatCard icon={<Trash2 className="w-5 h-5 text-red-500" />} count={killCount} label="Kill Ads" color="red" />
                                <StatCard icon={<Copy className="w-5 h-5 text-green-500" />} count={duplicateCount} label="Duplicate" color="green" />
                                <StatCard icon={<TrendingUp className="w-5 h-5 text-blue-500" />} count={increaseCount} label="Increase" color="blue" />
                                <StatCard icon={<TrendingDown className="w-5 h-5 text-orange-500" />} count={decreaseCount} label="Decrease" color="orange" />
                            </div>

                            {/* Recommendations List */}
                            <div className="space-y-3">
                                {recommendations.map(({ ad, campaign, adSet }) => (
                                    <RecommendationCard
                                        key={ad.id}
                                        ad={ad}
                                        campaign={campaign}
                                        adSet={adSet}
                                        applyingActions={applyingActions}
                                        getRecommendationStyle={getRecommendationStyle}
                                        isMetaLinked={isMetaLinked}
                                        onAction={onAction}
                                    />
                                ))}
                            </div>
                        </div>
                    </details>
                </Card>
            </div>

            {/* Desktop: Sidebar */}
            <div className="hidden lg:block w-[320px] flex-shrink-0 space-y-3 sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto">
                {/* Panel Header - Compact */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                            <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground text-sm">AI Insights</h3>
                            <p className="text-[10px] text-muted-foreground">Real-time</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                    </div>
                </div>

                {/* Compact Stats Row */}
                <div className="flex gap-2">
                    <MiniStatCard icon={<Trash2 className="w-4 h-4 text-red-400" />} count={killCount} label="Kill" color="red" />
                    <MiniStatCard icon={<Copy className="w-4 h-4 text-emerald-400" />} count={duplicateCount} label="Scale" color="emerald" />
                    <MiniStatCard icon={<TrendingUp className="w-4 h-4 text-blue-400" />} count={increaseCount} label="Boost" color="blue" />
                    <MiniStatCard icon={<TrendingDown className="w-4 h-4 text-amber-400" />} count={decreaseCount} label="Cut" color="amber" />
                </div>

                {/* Recommendations List */}
                <div className="space-y-3">
                    {recommendations.map(({ ad, campaign, adSet }) => (
                        <RecommendationCard
                            key={ad.id}
                            ad={ad}
                            campaign={campaign}
                            adSet={adSet}
                            applyingActions={applyingActions}
                            getRecommendationStyle={getRecommendationStyle}
                            isMetaLinked={isMetaLinked}
                            onAction={onAction}
                            isDesktop
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

// ── Internal sub-components ───────────────────

function StatCard({ icon, count, label, color }: { icon: React.ReactNode; count: number; label: string; color: string }) {
    return (
        <div className={`backdrop-blur-xl bg-${color}-500/10 rounded-xl border border-${color}-500/30 p-4`}>
            <div className="flex items-center justify-between mb-2">
                {icon}
                <span className={`text-2xl font-bold text-${color}-500`}>{count}</span>
            </div>
            <div className={`text-xs font-semibold text-${color}-500`}>{label}</div>
        </div>
    );
}

function MiniStatCard({ icon, count, label, color }: { icon: React.ReactNode; count: number; label: string; color: string }) {
    return (
        <div className={`flex-1 p-3 rounded-lg bg-${color}-500/10 border border-${color}-500/20`}>
            <div className="flex items-center justify-between">
                {icon}
                <span className={`text-lg font-bold text-${color}-400`}>{count}</span>
            </div>
            <div className={`text-[10px] text-${color}-400/70 mt-1`}>{label}</div>
        </div>
    );
}

function RecommendationCard({
    ad,
    campaign,
    adSet,
    applyingActions,
    getRecommendationStyle,
    isMetaLinked,
    onAction,
    isDesktop,
}: {
    ad: Ad;
    campaign: string;
    adSet: string;
    applyingActions: Record<string, boolean>;
    getRecommendationStyle: (recommendation: string) => RecommendationStyle;
    isMetaLinked: (campaignId: string) => boolean;
    onAction: (style: RecommendationStyle, ad: Ad) => void;
    isDesktop?: boolean;
}) {
    const recStyle = getRecommendationStyle(ad.aiAnalysis.recommendation);
    const actionKey = `${ad.campaignId}:${recStyle.action}`;
    const applying = Boolean(applyingActions[actionKey]);
    const isLinked = isMetaLinked(ad.campaignId);
    const isDisabled = applying || !isLinked;

    const Wrapper = isDesktop ? Card : 'div';
    const wrapperClass = isDesktop
        ? `border-2 ${recStyle.border} overflow-hidden hover:scale-105 transition-all p-0`
        : `backdrop-blur-xl bg-card/60 rounded-xl border-2 ${recStyle.border} shadow-xl overflow-hidden`;

    return (
        <Wrapper className={wrapperClass}>
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 ${recStyle.bg} rounded-lg flex-shrink-0`} style={{ color: recStyle.color }}>
                        {recStyle.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-foreground text-sm mb-1 truncate">{ad.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                            {campaign} → {adSet}
                        </div>
                    </div>
                </div>

                {/* Recommendation */}
                <div className="mb-3">
                    <div className="text-xs font-semibold mb-1" style={{ color: recStyle.color }}>
                        {recStyle.label}
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                        {ad.aiAnalysis.reason}
                    </div>
                </div>

                {/* Impact */}
                <div className="mb-3 p-2 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Expected Impact</div>
                    <div className="text-sm font-bold text-foreground">{ad.aiAnalysis.expectedImpact}</div>
                </div>

                {/* Confidence */}
                <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">AI Confidence</span>
                        <span className="font-bold" style={{ color: recStyle.color }}>{ad.aiAnalysis.confidence}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                                width: `${ad.aiAnalysis.confidence}%`,
                                backgroundColor: recStyle.color
                            }}
                        />
                    </div>
                </div>

                {/* Details */}
                <div className="mb-3 space-y-1">
                    {ad.aiAnalysis.details.slice(0, 2).map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-1 text-xs text-muted-foreground">
                            <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: recStyle.color }} />
                            <span className="leading-tight">{detail}</span>
                        </div>
                    ))}
                </div>

                {/* Action Button */}
                <button
                    onClick={() => onAction(recStyle, ad)}
                    disabled={isDisabled}
                    title={isLinked ? '' : 'Nicht mit Meta verknüpft. Bitte Sync ausführen.'}
                    className={`w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all ${isDesktop ? 'hover:scale-105' : ''} shadow-lg ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                    style={{
                        backgroundColor: recStyle.color,
                        color: 'white'
                    }}
                >
                    {applying ? 'Wird angewendet...' : recStyle.actionLabel}
                </button>
            </div>
        </Wrapper>
    );
}
