import { useState } from 'react';
import { Brain, TrendingDown, AlertTriangle, CheckCircle, Zap, Lightbulb } from 'lucide-react';

interface Campaign {
    id: string;
    name: string;
    roas: number;
    spend: number;
    revenue: number;
    ctr: number;
    cpc: number;
    conversions: number;
    impressions: number;
}

interface DeepInsight {
    category: 'strength' | 'weakness' | 'opportunity' | 'threat';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    actionable: boolean;
    action?: string;
}

interface Props {
    campaign: Campaign;
    onClose: () => void;
}

export function DeepInsightsPanel({ campaign, onClose }: Props) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [insights, setInsights] = useState<DeepInsight[]>([]);

    const analyzeWithAI = async () => {
        setIsAnalyzing(true);
        try {
            // Call GPT-4 for deep analysis
            const response = await fetch('/api/ai-deep-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaign })
            });

            const data = await response.json();
            setInsights(data.insights || generateFallbackInsights());
        } catch (error) {
            console.error('Deep analysis failed:', error);
            setInsights(generateFallbackInsights());
        } finally {
            setIsAnalyzing(false);
        }
    };

    const generateFallbackInsights = (): DeepInsight[] => {
        const insights: DeepInsight[] = [];

        // Strengths
        if (campaign.roas >= 3.0) {
            insights.push({
                category: 'strength',
                title: 'Starke ROAS Performance',
                description: `Mit ${campaign.roas.toFixed(2)}x ROAS liegt diese Kampagne deutlich über dem Ziel. Die Zielgruppe ist gut getroffen.`,
                impact: 'high',
                actionable: true,
                action: 'Budget um 50% erhöhen für maximale Skalierung'
            });
        }

        if (campaign.ctr >= 2.0) {
            insights.push({
                category: 'strength',
                title: 'Überdurchschnittliche CTR',
                description: `CTR von ${campaign.ctr.toFixed(2)}% zeigt, dass die Creatives sehr ansprechend sind.`,
                impact: 'high',
                actionable: true,
                action: 'Creative duplizieren und Variationen testen'
            });
        }

        // Weaknesses
        if (campaign.cpc > 2.0) {
            insights.push({
                category: 'weakness',
                title: 'Hohe Cost-per-Click',
                description: `CPC von €${campaign.cpc.toFixed(2)} ist überdurchschnittlich. Möglicherweise zu breite Zielgruppe.`,
                impact: 'medium',
                actionable: true,
                action: 'Zielgruppe verfeinern, Lookalike Audiences testen'
            });
        }

        if (campaign.conversions < 10) {
            insights.push({
                category: 'weakness',
                title: 'Niedrige Conversion-Anzahl',
                description: 'Zu wenige Conversions für statistisch signifikante Optimierung.',
                impact: 'high',
                actionable: true,
                action: 'Budget erhöhen oder Conversion-Event anpassen'
            });
        }

        // Opportunities
        if (campaign.roas >= 2.5 && campaign.spend < 1000) {
            insights.push({
                category: 'opportunity',
                title: 'Skalierungspotenzial',
                description: 'Starke Performance bei niedrigem Budget - idealer Kandidat für Skalierung.',
                impact: 'high',
                actionable: true,
                action: 'Budget schrittweise verdoppeln (20% pro Tag)'
            });
        }

        insights.push({
            category: 'opportunity',
            title: 'A/B Testing Empfehlung',
            description: 'Teste verschiedene Headlines und CTAs um Performance weiter zu optimieren.',
            impact: 'medium',
            actionable: true,
            action: 'A/B Test mit 3 Headline-Varianten starten'
        });

        // Threats
        if (campaign.impressions > 100000 && campaign.ctr < 1.5) {
            insights.push({
                category: 'threat',
                title: 'Creative Fatigue Risiko',
                description: 'Hohe Impressions bei sinkender CTR deuten auf Creative Fatigue hin.',
                impact: 'high',
                actionable: true,
                action: 'Neue Creatives innerhalb 3 Tagen launchen'
            });
        }

        return insights;
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'strength': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'weakness': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
            case 'opportunity': return <Lightbulb className="w-5 h-5 text-blue-500" />;
            case 'threat': return <TrendingDown className="w-5 h-5 text-red-500" />;
            default: return <Brain className="w-5 h-5" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'strength': return 'bg-green-500/10 border-green-500/30';
            case 'weakness': return 'bg-orange-500/10 border-orange-500/30';
            case 'opportunity': return 'bg-blue-500/10 border-blue-500/30';
            case 'threat': return 'bg-red-500/10 border-red-500/30';
            default: return 'bg-muted border-border';
        }
    };

    const getImpactBadge = (impact: string) => {
        const colors = {
            high: 'bg-red-500/20 text-red-600',
            medium: 'bg-yellow-500/20 text-yellow-600',
            low: 'bg-blue-500/20 text-blue-600'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[impact as keyof typeof colors]}`}>
                {impact.toUpperCase()}
            </span>
        );
    };

    // Auto-analyze on mount
    useState(() => {
        analyzeWithAI();
    });

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                <Brain className="w-6 h-6 text-primary" />
                                Deep AI Insights
                            </h2>
                            <p className="text-sm text-muted-foreground">{campaign.name}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>

                    {/* Campaign Summary */}
                    <div className="grid grid-cols-4 gap-4 mt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary">{campaign.roas.toFixed(2)}x</p>
                            <p className="text-xs text-muted-foreground">ROAS</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">€{campaign.spend.toFixed(0)}</p>
                            <p className="text-xs text-muted-foreground">Spend</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{campaign.ctr.toFixed(2)}%</p>
                            <p className="text-xs text-muted-foreground">CTR</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{campaign.conversions}</p>
                            <p className="text-xs text-muted-foreground">Conversions</p>
                        </div>
                    </div>
                </div>

                {/* Insights */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Brain className="w-12 h-12 text-primary animate-pulse mb-4" />
                            <p className="text-muted-foreground">Analyzing campaign with AI...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {insights.map((insight, index) => (
                                <div
                                    key={index}
                                    className={`border-2 rounded-xl p-5 ${getCategoryColor(insight.category)}`}
                                >
                                    <div className="flex items-start gap-3">
                                        {getCategoryIcon(insight.category)}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold">{insight.title}</h3>
                                                {getImpactBadge(insight.impact)}
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                {insight.description}
                                            </p>
                                            {insight.actionable && insight.action && (
                                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                                                    <Zap className="w-4 h-4 text-primary" />
                                                    <p className="text-sm font-medium">
                                                        Action: {insight.action}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-muted/30">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {insights.length} insights found • Powered by GPT-4
                        </p>
                        <button
                            onClick={analyzeWithAI}
                            disabled={isAnalyzing}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                        >
                            Re-analyze
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
