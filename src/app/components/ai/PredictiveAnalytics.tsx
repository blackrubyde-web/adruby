import { useState, useMemo } from 'react';
import { TrendingUp, Calculator, Target, AlertCircle, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface Campaign {
    id: string;
    name: string;
    roas: number;
    spend: number;
    revenue: number;
    ctr: number;
    conversions: number;
}

interface Forecast {
    scenario: string;
    budgetChange: number;
    predictedROAS: number;
    predictedRevenue: number;
    predictedSpend: number;
    confidence: number;
    recommendation: string;
}

interface Props {
    campaign: Campaign;
}

export function PredictiveAnalytics({ campaign }: Props) {
    const [selectedScenario, setSelectedScenario] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

    // Generate forecast scenarios
    const forecasts = useMemo((): Forecast[] => {
        const baseROAS = campaign.roas;
        const baseSpend = campaign.spend;

        return [
            {
                scenario: 'conservative',
                budgetChange: 0.2, // +20%
                predictedROAS: baseROAS * 0.95, // Slight decrease due to scaling
                predictedRevenue: campaign.revenue * 1.15,
                predictedSpend: baseSpend * 1.2,
                confidence: 85,
                recommendation: 'Sicherer Ansatz mit minimalem Risiko'
            },
            {
                scenario: 'moderate',
                budgetChange: 0.5, // +50%
                predictedROAS: baseROAS * 0.90,
                predictedRevenue: campaign.revenue * 1.35,
                predictedSpend: baseSpend * 1.5,
                confidence: 70,
                recommendation: 'Ausgewogenes Risiko-Rendite-Verhältnis'
            },
            {
                scenario: 'aggressive',
                budgetChange: 1.0, // +100%
                predictedROAS: baseROAS * 0.80,
                predictedRevenue: campaign.revenue * 1.60,
                predictedSpend: baseSpend * 2.0,
                confidence: 55,
                recommendation: 'Höheres Risiko, aber maximales Wachstumspotenzial'
            }
        ];
    }, [campaign]);

    // Generate 7-day forecast data
    const forecastData = useMemo(() => {
        const selected = forecasts.find(f => f.scenario === selectedScenario)!;
        const days = 7;

        return Array.from({ length: days }, (_, i) => {
            const progress = (i + 1) / days;
            return {
                day: `Tag ${i + 1}`,
                current: campaign.roas,
                predicted: campaign.roas + (selected.predictedROAS - campaign.roas) * progress,
                upper: (campaign.roas + (selected.predictedROAS - campaign.roas) * progress) * 1.1,
                lower: (campaign.roas + (selected.predictedROAS - campaign.roas) * progress) * 0.9
            };
        });
    }, [campaign, selectedScenario, forecasts]);

    const selectedForecast = forecasts.find(f => f.scenario === selectedScenario)!;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                    <Calculator className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                    <h3 className="text-lg font-bold">Predictive Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                        AI-powered forecast for {campaign.name}
                    </p>
                </div>
            </div>

            {/* Scenario Selector */}
            <div className="grid grid-cols-3 gap-3">
                {forecasts.map(forecast => (
                    <button
                        key={forecast.scenario}
                        onClick={() => setSelectedScenario(forecast.scenario as any)}
                        className={`p-4 rounded-xl border-2 transition-all ${selectedScenario === forecast.scenario
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                    >
                        <p className="font-semibold capitalize mb-1">{forecast.scenario}</p>
                        <p className="text-2xl font-bold text-primary mb-1">
                            +{(forecast.budgetChange * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Budget Increase</p>
                    </button>
                ))}
            </div>

            {/* Forecast Chart */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h4 className="font-semibold mb-4">7-Day ROAS Forecast</h4>
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={forecastData}>
                        <defs>
                            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="day" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1a1a1a',
                                border: '1px solid #333',
                                borderRadius: '8px'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="upper"
                            stroke="none"
                            fill="#8b5cf6"
                            fillOpacity={0.1}
                        />
                        <Area
                            type="monotone"
                            dataKey="lower"
                            stroke="none"
                            fill="#8b5cf6"
                            fillOpacity={0.1}
                        />
                        <Line
                            type="monotone"
                            dataKey="current"
                            stroke="#888"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="predicted"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            dot={{ fill: '#8b5cf6', r: 4 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-500 rounded" />
                        <span className="text-muted-foreground">Current</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded" />
                        <span className="text-muted-foreground">Predicted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500/30 rounded" />
                        <span className="text-muted-foreground">Confidence Range</span>
                    </div>
                </div>
            </div>

            {/* Predictions */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-muted-foreground">Predicted ROAS</p>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold mb-1">
                        {selectedForecast.predictedROAS.toFixed(2)}x
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {selectedForecast.predictedROAS > campaign.roas ? '↑' : '↓'}
                        {Math.abs(((selectedForecast.predictedROAS - campaign.roas) / campaign.roas) * 100).toFixed(1)}%
                        vs current
                    </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-muted-foreground">Predicted Revenue</p>
                        <Target className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold mb-1">
                        €{selectedForecast.predictedRevenue.toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        +€{(selectedForecast.predictedRevenue - campaign.revenue).toFixed(0)} additional revenue
                    </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-muted-foreground">New Budget</p>
                        <Calculator className="w-4 h-4 text-purple-500" />
                    </div>
                    <p className="text-3xl font-bold mb-1">
                        €{selectedForecast.predictedSpend.toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        +€{(selectedForecast.predictedSpend - campaign.spend).toFixed(0)} increase
                    </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-muted-foreground">Confidence</p>
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                    </div>
                    <p className="text-3xl font-bold mb-1">
                        {selectedForecast.confidence}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {selectedForecast.confidence >= 75 ? 'High' : selectedForecast.confidence >= 60 ? 'Medium' : 'Low'} confidence
                    </p>
                </div>
            </div>

            {/* Recommendation */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-5">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                        <p className="font-semibold mb-1">AI Recommendation</p>
                        <p className="text-sm text-muted-foreground">
                            {selectedForecast.recommendation}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
