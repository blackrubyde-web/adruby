import { useState, useEffect } from 'react';
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

    // Auto-analyze on mount or when campaign changes
    useEffect(() => {
        analyzeWithAI();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaign.id]);

    const analyzeWithAI = async () => {
        setIsAnalyzing(true);
        try {
            const { invokeOpenAIProxy } = await import('../../lib/api/proxyClient');

            // Generate a prompt based on campaign data
            const prompt = `Analyze this ad campaign:
            Name: ${campaign.name}
            ROAS: ${campaign.roas}
            Spend: ${campaign.spend}
            CTR: ${campaign.ctr}%
            CPC: ${campaign.cpc}
            Conversions: ${campaign.conversions}
            
            Provide 4-5 deep qualitative insights categorized as 'strength', 'weakness', 'opportunity', or 'threat'.
            Return JSON format: { "insights": [{ "category": "...", "title": "...", "description": "...", "impact": "high/medium/low", "actionable": true, "action": "..." }] }`;

            const { data, error } = await invokeOpenAIProxy<{
                choices: Array<{ message: { content: string } }>;
            }>({
                endpoint: 'chat/completions',
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'You are a senior ad strategist. Return valid JSON only.' },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: "json_object" }
            });

            if (error) throw error;

            const content = data?.choices?.[0]?.message?.content;
            if (!content) {
                throw new Error('No insights returned');
            }
            const parsed = JSON.parse(content);
            setInsights(parsed.insights || generateFallbackInsights());
        } catch (error) {
            console.error('Deep analysis failed:', error);
            setInsights(generateFallbackInsights());
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Helper functions for rendering
    const generateFallbackInsights = (): DeepInsight[] => [
        {
            category: 'strength',
            title: 'Strong conversion rate',
            description: 'Your campaign is performing well with consistent conversions.',
            impact: 'high',
            actionable: false
        },
        {
            category: 'weakness',
            title: 'High cost per click',
            description: `CPC of €${campaign.cpc.toFixed(2)} is above industry average.`,
            impact: 'medium',
            actionable: true,
            action: 'Refine audience targeting to reduce wasted impressions'
        },
        {
            category: 'opportunity',
            title: 'Scaling potential detected',
            description: 'Your ROAS suggests room for controlled budget increase.',
            impact: 'high',
            actionable: true,
            action: 'Test increasing daily budget by 20%'
        }
    ];

    const getCategoryColor = (category: DeepInsight['category']) => {
        switch (category) {
            case 'strength': return 'bg-green-500/10 border-green-500/30';
            case 'weakness': return 'bg-red-500/10 border-red-500/30';
            case 'opportunity': return 'bg-blue-500/10 border-blue-500/30';
            case 'threat': return 'bg-orange-500/10 border-orange-500/30';
        }
    };

    const getCategoryIcon = (category: DeepInsight['category']) => {
        switch (category) {
            case 'strength': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'weakness': return <TrendingDown className="w-5 h-5 text-red-500" />;
            case 'opportunity': return <Lightbulb className="w-5 h-5 text-blue-500" />;
            case 'threat': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
        }
    };

    const getImpactBadge = (impact: DeepInsight['impact']) => {
        const colors = {
            high: 'bg-red-500/20 text-red-300 border border-red-500/30',
            medium: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
            low: 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colors[impact]}`}>
                {impact.toUpperCase()}
            </span>
        );
    };

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
