import { memo } from 'react';
import { AlertTriangle, TrendingDown, Clock, Zap, ArrowRight, RefreshCw, Pause } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export interface PredictiveInsight {
    id: string;
    adId: string;
    adName: string;
    type: 'fatigue' | 'declining' | 'opportunity' | 'critical';
    severity: 'low' | 'medium' | 'high';
    message: string;
    daysUntilCritical: number | null;
    confidence: number;
    recommendedAction: 'refresh' | 'pause' | 'scale' | 'monitor';
    metrics?: {
        current: number;
        predicted: number;
        unit: string;
    };
}

interface PredictiveInsightCardProps {
    insight: PredictiveInsight;
    onAction?: (action: string, adId: string) => void;
    compact?: boolean;
}

const TYPE_CONFIG = {
    fatigue: {
        icon: RefreshCw,
        color: 'amber',
        label: 'Ad Fatigue',
    },
    declining: {
        icon: TrendingDown,
        color: 'orange',
        label: 'Rückläufig',
    },
    opportunity: {
        icon: Zap,
        color: 'emerald',
        label: 'Chance',
    },
    critical: {
        icon: AlertTriangle,
        color: 'red',
        label: 'Kritisch',
    },
};

const ACTION_CONFIG = {
    refresh: { label: 'Creative erneuern', icon: RefreshCw },
    pause: { label: 'Pausieren', icon: Pause },
    scale: { label: 'Skalieren', icon: Zap },
    monitor: { label: 'Beobachten', icon: Clock },
};

export const PredictiveInsightCard = memo(function PredictiveInsightCard({
    insight,
    onAction,
    compact = false,
}: PredictiveInsightCardProps) {
    const config = TYPE_CONFIG[insight.type];
    const actionConfig = ACTION_CONFIG[insight.recommendedAction];
    const Icon = config.icon;
    const ActionIcon = actionConfig.icon;

    const colorClasses = {
        amber: {
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            text: 'text-amber-400',
            badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        },
        orange: {
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20',
            text: 'text-orange-400',
            badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        },
        emerald: {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            text: 'text-emerald-400',
            badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        },
        red: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            text: 'text-red-400',
            badge: 'bg-red-500/20 text-red-400 border-red-500/30',
        },
    };

    const colors = colorClasses[config.color as keyof typeof colorClasses];

    if (compact) {
        return (
            <div className={`flex items-center gap-3 p-3 rounded-xl ${colors.bg} border ${colors.border}`}>
                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/90 font-medium truncate">{insight.adName}</p>
                    <p className="text-xs text-white/50 truncate">{insight.message}</p>
                </div>
                {insight.daysUntilCritical !== null && (
                    <Badge className={colors.badge}>
                        ~{insight.daysUntilCritical}d
                    </Badge>
                )}
            </div>
        );
    }

    return (
        <Card className={`relative overflow-hidden ${colors.bg} border ${colors.border} p-5`}>
            {/* Severity Indicator */}
            <div className={`absolute top-0 left-0 w-1 h-full ${insight.severity === 'high' ? 'bg-red-500' :
                insight.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />

            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge className={colors.badge}>{config.label}</Badge>
                        {insight.daysUntilCritical !== null && (
                            <Badge variant="outline" className="text-white/60 border-white/10">
                                <Clock className="w-3 h-3 mr-1" />
                                ~{insight.daysUntilCritical} Tage
                            </Badge>
                        )}
                        <span className="text-xs text-white/40 ml-auto">{insight.confidence}% Konfidenz</span>
                    </div>

                    <h4 className="text-base font-semibold text-white mb-1 truncate">{insight.adName}</h4>
                    <p className="text-sm text-white/60 mb-4">{insight.message}</p>

                    {/* Metrics Comparison */}
                    {insight.metrics && (
                        <div className="flex items-center gap-4 p-3 rounded-lg bg-black/20 mb-4">
                            <div className="text-center">
                                <p className="text-xs text-white/40">Aktuell</p>
                                <p className="text-lg font-bold text-white">
                                    {insight.metrics.current.toFixed(2)}{insight.metrics.unit}
                                </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-white/30" />
                            <div className="text-center">
                                <p className="text-xs text-white/40">Prognose</p>
                                <p className={`text-lg font-bold ${insight.metrics.predicted < insight.metrics.current ? 'text-red-400' : 'text-emerald-400'
                                    }`}>
                                    {insight.metrics.predicted.toFixed(2)}{insight.metrics.unit}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    {onAction && (
                        <Button
                            size="sm"
                            onClick={() => onAction(insight.recommendedAction, insight.adId)}
                            className={`gap-2 ${insight.severity === 'high'
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : insight.type === 'opportunity'
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    : ''
                                }`}
                        >
                            <ActionIcon className="w-4 h-4" />
                            {actionConfig.label}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
});
