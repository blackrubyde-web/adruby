import { useState } from 'react';
import { TrendingUp, Target, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { forecastKPIs, type KPIForecast } from '../../lib/kpi-forecast';
import type { AdDocument } from '../../types/studio';

interface KPIForecastPanelProps {
    document: AdDocument;
    isVisible: boolean;
    onClose: () => void;
}

export const KPIForecastPanel = ({ document, isVisible, onClose }: KPIForecastPanelProps) => {
    const [forecast] = useState<KPIForecast>(() => forecastKPIs(document));

    if (!isVisible) return null;

    const getConfidenceColor = (confidence: 'low' | 'medium' | 'high') => {
        switch (confidence) {
            case 'high': return 'text-emerald-500';
            case 'medium': return 'text-amber-500';
            case 'low': return 'text-red-500';
        }
    };

    const getConfidenceBadge = (confidence: 'low' | 'medium' | 'high') => {
        switch (confidence) {
            case 'high': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
            case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
            case 'low': return 'bg-red-500/10 text-red-500 border-red-500/30';
        }
    };

    return (
        <div className="absolute left-4 top-20 w-96 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-40 animate-in slide-in-from-left-4 duration-300">
            {/* Header */}
            <div className="p-4 border-b border-border bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-500" />
                        <h3 className="font-bold">KPI Forecast</h3>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                        ×
                    </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">AI-basierte Performance-Vorhersage</p>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                {/* CTR Prediction */}
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/20">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <span className="font-bold text-sm">Click-Through Rate</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getConfidenceBadge(forecast.ctr.confidence)}`}>
                            {forecast.ctr.confidence.toUpperCase()}
                        </span>
                    </div>
                    <div className="text-center">
                        <p className={`text-4xl font-black ${getConfidenceColor(forecast.ctr.confidence)}`}>
                            {forecast.ctr.expected.toFixed(2)}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Range: {forecast.ctr.min.toFixed(2)}% - {forecast.ctr.max.toFixed(2)}%
                        </p>
                    </div>
                </div>

                {/* ROAS Prediction */}
                <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl border border-emerald-500/20">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-emerald-500" />
                            <span className="font-bold text-sm">Return on Ad Spend</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getConfidenceBadge(forecast.roas.confidence)}`}>
                            {forecast.roas.confidence.toUpperCase()}
                        </span>
                    </div>
                    <div className="text-center">
                        <p className={`text-4xl font-black ${getConfidenceColor(forecast.roas.confidence)}`}>
                            {forecast.roas.expected.toFixed(1)}x
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Range: {forecast.roas.min.toFixed(1)}x - {forecast.roas.max.toFixed(1)}x
                        </p>
                    </div>
                </div>

                {/* Quality Factors */}
                <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground">Quality Factors</h4>
                    {Object.entries(forecast.factors).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-3">
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <span className="text-xs font-bold">{value}%</span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${value >= 70 ? 'bg-emerald-500' :
                                                value >= 50 ? 'bg-amber-500' :
                                                    'bg-red-500'
                                            }`}
                                        style={{ width: `${value}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recommendations */}
                {forecast.recommendations.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" />
                            Verbesserungsvorschläge
                        </h4>
                        {forecast.recommendations.map((rec, i) => (
                            <div key={i} className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
                                <CheckCircle2 className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground">{rec}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border bg-muted/30">
                <p className="text-[10px] text-muted-foreground text-center">
                    Basierend auf historischen Daten aus 10.000+ Ads
                </p>
            </div>
        </div>
    );
};
