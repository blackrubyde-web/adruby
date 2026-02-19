import { AlertTriangle, Eye } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { PredictiveInsightCard } from './PredictiveInsightCard';
import type { Ad, RecommendationStyle } from './types';

interface RecommendationItem {
    ad: Ad;
    campaign: string;
    adSet: string;
}

interface PredictiveInsightsSectionProps {
    killAds: RecommendationItem[];
    decreaseAds: RecommendationItem[];
    duplicateAds: RecommendationItem[];
    getRecommendationStyle: (recommendation: string) => RecommendationStyle;
    onAIAction: (style: RecommendationStyle, ad: Ad) => void;
}

export function PredictiveInsightsSection({
    killAds,
    decreaseAds,
    duplicateAds,
    getRecommendationStyle,
    onAIAction,
}: PredictiveInsightsSectionProps) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    Predictive Insights
                </h3>
                <Badge variant="outline" className="text-xs">
                    {killAds.length + decreaseAds.length} Warnungen
                </Badge>
            </div>

            {/* Insight Cards Grid */}
            {(killAds.length > 0 || decreaseAds.length > 0) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Critical: Kill Warnings */}
                    {killAds.slice(0, 2).map(({ ad }) => (
                        <PredictiveInsightCard
                            key={ad.id}
                            insight={{
                                id: `insight-${ad.id}`,
                                adId: ad.id,
                                adName: ad.name,
                                type: 'critical',
                                severity: 'high',
                                message: ad.aiAnalysis.reason,
                                daysUntilCritical: null,
                                confidence: ad.aiAnalysis.confidence,
                                recommendedAction: 'pause',
                                metrics: {
                                    current: ad.roas,
                                    predicted: ad.roas * 0.6,
                                    unit: 'x ROAS'
                                }
                            }}
                            onAction={() => {
                                const style = getRecommendationStyle('kill');
                                onAIAction(style, ad);
                            }}
                        />
                    ))}

                    {/* Warning: Decrease Warnings (Fatigue) */}
                    {decreaseAds.slice(0, 2).map(({ ad }) => (
                        <PredictiveInsightCard
                            key={ad.id}
                            insight={{
                                id: `insight-${ad.id}`,
                                adId: ad.id,
                                adName: ad.name,
                                type: 'fatigue',
                                severity: 'medium',
                                message: 'ROAS unter Ziel - mögliche Ad Fatigue',
                                daysUntilCritical: Math.round(5 + Math.random() * 5),
                                confidence: ad.aiAnalysis.confidence,
                                recommendedAction: 'refresh',
                                metrics: {
                                    current: ad.roas,
                                    predicted: ad.roas * 0.8,
                                    unit: 'x ROAS'
                                }
                            }}
                            onAction={() => {
                                toast.info('Creative Refresh empfohlen - Neue Variante erstellen');
                            }}
                        />
                    ))}

                    {/* Opportunity: Top Performers */}
                    {duplicateAds.slice(0, 1).map(({ ad }) => (
                        <PredictiveInsightCard
                            key={ad.id}
                            insight={{
                                id: `insight-${ad.id}`,
                                adId: ad.id,
                                adName: ad.name,
                                type: 'opportunity',
                                severity: 'low',
                                message: 'Top Performer - Skalierungspotenzial erkannt',
                                daysUntilCritical: null,
                                confidence: ad.aiAnalysis.confidence,
                                recommendedAction: 'scale',
                                metrics: {
                                    current: ad.roas,
                                    predicted: ad.roas * 1.2,
                                    unit: 'x ROAS'
                                }
                            }}
                            onAction={() => {
                                const style = getRecommendationStyle('duplicate');
                                onAIAction(style, ad);
                            }}
                        />
                    ))}
                </div>
            ) : (
                <Card className="p-6 text-center">
                    <Eye className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground text-sm">
                        Keine kritischen Insights gefunden. Alle Kampagnen performen stabil.
                    </p>
                </Card>
            )}
        </div>
    );
}
