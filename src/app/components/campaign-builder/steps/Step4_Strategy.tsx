import { useCampaignBuilder } from '../CampaignBuilderContext';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Slider } from '../../ui/slider';
import { Zap, ShieldCheck, TrendingUp, Brain, Sparkles, Target, DollarSign } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const Step4_Strategy = () => {
    const { strategyConfig, setStrategyConfig, strategies, selectedStrategy } = useCampaignBuilder();

    const updateField = <K extends keyof typeof strategyConfig>(key: K, value: typeof strategyConfig[K]) => {
        setStrategyConfig(prev => ({ ...prev, [key]: value }));
    };

    const selectBlueprint = (id: string | null) => {
        if (id && selectedStrategy) {
            // Apply strategy settings from blueprint
            const config = selectedStrategy.autopilot_config as { target_roas?: number; risk_tolerance?: string; scale_speed?: string } | null;
            setStrategyConfig(prev => ({
                ...prev,
                blueprintId: id,
                targetRoas: config?.target_roas || prev.targetRoas,
                riskTolerance: (config?.risk_tolerance as typeof prev.riskTolerance) || prev.riskTolerance,
                scaleSpeed: (config?.scale_speed as typeof prev.scaleSpeed) || prev.scaleSpeed,
            }));
        } else {
            updateField('blueprintId', id);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Zap className="w-6 h-6 text-primary" />
                    Strategy & Optimization
                </h2>
                <p className="text-muted-foreground">Definiere, wie die AI deine Kampagne optimieren soll.</p>
            </div>

            {/* Strategy Blueprints */}
            {strategies.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            Strategy Blueprints
                        </h3>
                        <Badge variant="outline" className="text-xs">
                            {strategies.length} verfügbar
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Custom Strategy Option */}
                        <Card
                            onClick={() => selectBlueprint(null)}
                            className={cn(
                                "p-5 cursor-pointer transition-all border-2",
                                strategyConfig.blueprintId === null
                                    ? "border-primary bg-primary/5 shadow-lg"
                                    : "border-border hover:border-primary/50"
                            )}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-muted rounded-lg">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Custom Strategy</h4>
                                    <p className="text-xs text-muted-foreground">Eigene Einstellungen</p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Konfiguriere alle Parameter manuell für volle Kontrolle.
                            </p>
                        </Card>

                        {/* Strategy Blueprints */}
                        {strategies.map(strategy => {
                            const isSelected = strategyConfig.blueprintId === strategy.id;
                            const config = strategy.autopilot_config as { target_roas?: number; risk_tolerance?: string; scale_speed?: string } | null;

                            return (
                                <Card
                                    key={strategy.id}
                                    onClick={() => selectBlueprint(strategy.id)}
                                    className={cn(
                                        "p-5 cursor-pointer transition-all border-2",
                                        isSelected
                                            ? "border-primary bg-primary/5 shadow-lg"
                                            : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-br from-primary to-violet-600 rounded-lg">
                                                <Brain className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">{strategy.title}</h4>
                                                <p className="text-xs text-muted-foreground">{strategy.industry_type}</p>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                        <Badge variant="secondary" className="text-[10px]">
                                            {config?.target_roas || 3}x ROAS
                                        </Badge>
                                        <Badge variant="secondary" className="text-[10px]">
                                            {config?.risk_tolerance || 'medium'}
                                        </Badge>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Strategy Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Target ROAS */}
                    <Card className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Target ROAS</h3>
                                    <p className="text-xs text-muted-foreground">Mindest-Return on Ad Spend</p>
                                </div>
                            </div>
                            <span className="text-3xl font-black text-green-500">{strategyConfig.targetRoas.toFixed(1)}x</span>
                        </div>
                        <Slider
                            value={[strategyConfig.targetRoas]}
                            onValueChange={([val]) => updateField('targetRoas', val)}
                            min={1.0}
                            max={10.0}
                            step={0.1}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1x (Breakeven)</span>
                            <span>5x</span>
                            <span>10x (Aggresiv)</span>
                        </div>
                    </Card>

                    {/* Risk Tolerance */}
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <ShieldCheck className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-bold">Risk Tolerance</h3>
                                <p className="text-xs text-muted-foreground">Wie aggressiv sollen neue Audiences getestet werden?</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {(['low', 'medium', 'high'] as const).map(level => (
                                <button
                                    key={level}
                                    onClick={() => updateField('riskTolerance', level)}
                                    className={cn(
                                        "py-4 px-4 rounded-xl border text-sm font-semibold capitalize transition-all",
                                        strategyConfig.riskTolerance === level
                                            ? "border-blue-500 bg-blue-500/10 text-blue-500 shadow-lg shadow-blue-500/20"
                                            : "border-border hover:border-blue-500/50"
                                    )}
                                >
                                    {level === 'low' ? '🛡️ Konservativ' : level === 'medium' ? '⚖️ Balanced' : '🚀 Aggressiv'}
                                </button>
                            ))}
                        </div>

                        <p className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
                            {strategyConfig.riskTolerance === 'low' && 'Fokus auf bewährte Zielgruppen. Weniger Testing, stabilere Performance.'}
                            {strategyConfig.riskTolerance === 'medium' && 'Ausgewogene Mischung aus Scaling und Testing neuer Audiences.'}
                            {strategyConfig.riskTolerance === 'high' && 'Aggressive Testing neuer Audiences. Höheres Risiko, höheres Potenzial.'}
                        </p>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Scale Speed */}
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <h3 className="font-bold">Scale Speed</h3>
                                <p className="text-xs text-muted-foreground">Wie schnell soll Budget auf Winner erhöht werden?</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {(['slow', 'medium', 'aggressive'] as const).map(speed => (
                                <button
                                    key={speed}
                                    onClick={() => updateField('scaleSpeed', speed)}
                                    className={cn(
                                        "py-4 px-4 rounded-xl border text-sm font-semibold capitalize transition-all",
                                        strategyConfig.scaleSpeed === speed
                                            ? "border-orange-500 bg-orange-500/10 text-orange-500 shadow-lg shadow-orange-500/20"
                                            : "border-border hover:border-orange-500/50"
                                    )}
                                >
                                    {speed === 'slow' ? '🐢 Langsam' : speed === 'medium' ? '🐇 Normal' : '⚡ Schnell'}
                                </button>
                            ))}
                        </div>

                        <p className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
                            {strategyConfig.scaleSpeed === 'slow' && 'Budget steigt +10-15% alle 3-4 Tage bei guter Performance.'}
                            {strategyConfig.scaleSpeed === 'medium' && 'Budget steigt +20-25% alle 2-3 Tage bei guter Performance.'}
                            {strategyConfig.scaleSpeed === 'aggressive' && 'Budget verdoppelt sich bei starker Performance. Schnelle Skalierung.'}
                        </p>
                    </Card>

                    {/* Budget Allocation */}
                    <Card className="p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-500/10 rounded-lg">
                                <Target className="w-5 h-5 text-violet-500" />
                            </div>
                            <div>
                                <h3 className="font-bold">Budget Allocation</h3>
                                <p className="text-xs text-muted-foreground">Verteilung zwischen Testing und Scaling</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-blue-500">Testing</span>
                                <span className="font-bold">{strategyConfig.testingBudgetPct}%</span>
                            </div>
                            <Slider
                                value={[strategyConfig.testingBudgetPct]}
                                onValueChange={([val]) => {
                                    updateField('testingBudgetPct', val);
                                    updateField('scalingBudgetPct', 100 - val);
                                }}
                                min={10}
                                max={90}
                                step={5}
                                className="w-full"
                            />
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-green-500">Scaling</span>
                                <span className="font-bold">{strategyConfig.scalingBudgetPct}%</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                                <div className="text-lg font-bold text-blue-500">{strategyConfig.testingBudgetPct}%</div>
                                <div className="text-xs text-muted-foreground">für neue Tests</div>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded-lg text-center">
                                <div className="text-lg font-bold text-green-500">{strategyConfig.scalingBudgetPct}%</div>
                                <div className="text-xs text-muted-foreground">für Scaling</div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
