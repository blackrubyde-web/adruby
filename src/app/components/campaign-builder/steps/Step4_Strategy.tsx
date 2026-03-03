import { useCampaignBuilder } from '../CampaignBuilderContext';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Slider } from '../../ui/slider';
import { ShieldCheck, TrendingUp, Brain, Target, DollarSign, Check } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const Step4_Strategy = () => {
    const { strategyConfig, setStrategyConfig, strategies, selectedStrategy } = useCampaignBuilder();

    const updateField = <K extends keyof typeof strategyConfig>(key: K, value: typeof strategyConfig[K]) => {
        setStrategyConfig(prev => ({ ...prev, [key]: value }));
    };

    const selectBlueprint = (id: string | null) => {
        if (id && selectedStrategy) {
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
        <div className="space-y-10">
            {/* ── Strategy Blueprints ────────────────────────── */}
            {strategies.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-foreground">Strategie-Vorlage</h3>
                        <span className="text-xs text-muted-foreground">{strategies.length} verfügbar</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <button
                            onClick={() => selectBlueprint(null)}
                            className={cn(
                                "text-left p-4 rounded-xl border transition-all",
                                strategyConfig.blueprintId === null
                                    ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                                    : "border-border bg-card hover:border-primary/30"
                            )}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">Eigene Strategie</span>
                                {strategyConfig.blueprintId === null && <Check className="w-3.5 h-3.5 text-primary" />}
                            </div>
                            <p className="text-xs text-muted-foreground">Alle Parameter manuell konfigurieren</p>
                        </button>

                        {strategies.map(strategy => {
                            const isSelected = strategyConfig.blueprintId === strategy.id;
                            const config = strategy.autopilot_config as { target_roas?: number; risk_tolerance?: string; scale_speed?: string } | null;

                            return (
                                <button
                                    key={strategy.id}
                                    onClick={() => selectBlueprint(strategy.id)}
                                    className={cn(
                                        "text-left p-4 rounded-xl border transition-all",
                                        isSelected
                                            ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                                            : "border-border bg-card hover:border-primary/30"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium">{strategy.title}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">{strategy.industry_type}</p>
                                    <div className="flex gap-1">
                                        <Badge variant="secondary" className="text-[10px] py-0">{config?.target_roas || 3}x ROAS</Badge>
                                        <Badge variant="secondary" className="text-[10px] py-0">{config?.risk_tolerance || 'medium'}</Badge>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Configuration ──────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Target ROAS */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium text-foreground">Target ROAS</h3>
                            </div>
                            <span className="text-lg font-bold text-foreground">{strategyConfig.targetRoas.toFixed(1)}x</span>
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
                            <span>1x Breakeven</span>
                            <span>5x</span>
                            <span>10x Aggressiv</span>
                        </div>
                    </div>

                    {/* Risk Tolerance */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium text-foreground">Risikotoleranz</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {(['low', 'medium', 'high'] as const).map(level => (
                                <button
                                    key={level}
                                    onClick={() => updateField('riskTolerance', level)}
                                    className={cn(
                                        "py-2.5 px-3 rounded-lg border text-xs font-medium transition-all",
                                        strategyConfig.riskTolerance === level
                                            ? "border-primary/40 bg-primary/5 text-foreground"
                                            : "border-border/50 bg-card text-muted-foreground hover:border-border hover:text-foreground"
                                    )}
                                >
                                    {level === 'low' ? 'Konservativ' : level === 'medium' ? 'Balanced' : 'Aggressiv'}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {strategyConfig.riskTolerance === 'low' && 'Fokus auf bewährte Zielgruppen. Weniger Testing, stabilere Performance.'}
                            {strategyConfig.riskTolerance === 'medium' && 'Ausgewogene Mischung aus Scaling und Testing neuer Audiences.'}
                            {strategyConfig.riskTolerance === 'high' && 'Aggressive Testing neuer Audiences. Höheres Risiko, höheres Potenzial.'}
                        </p>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Scale Speed */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium text-foreground">Skalierungsgeschwindigkeit</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {(['slow', 'medium', 'aggressive'] as const).map(speed => (
                                <button
                                    key={speed}
                                    onClick={() => updateField('scaleSpeed', speed)}
                                    className={cn(
                                        "py-2.5 px-3 rounded-lg border text-xs font-medium transition-all",
                                        strategyConfig.scaleSpeed === speed
                                            ? "border-primary/40 bg-primary/5 text-foreground"
                                            : "border-border/50 bg-card text-muted-foreground hover:border-border hover:text-foreground"
                                    )}
                                >
                                    {speed === 'slow' ? 'Langsam' : speed === 'medium' ? 'Normal' : 'Schnell'}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {strategyConfig.scaleSpeed === 'slow' && 'Budget steigt +10-15% alle 3-4 Tage bei guter Performance.'}
                            {strategyConfig.scaleSpeed === 'medium' && 'Budget steigt +20-25% alle 2-3 Tage bei guter Performance.'}
                            {strategyConfig.scaleSpeed === 'aggressive' && 'Budget verdoppelt sich bei starker Performance. Schnelle Skalierung.'}
                        </p>
                    </div>

                    {/* Budget Allocation */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium text-foreground">Budget-Verteilung</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Testing</span>
                                <span className="font-semibold text-foreground">{strategyConfig.testingBudgetPct}%</span>
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
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Scaling</span>
                                <span className="font-semibold text-foreground">{strategyConfig.scalingBudgetPct}%</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 bg-muted/30 rounded-lg text-center border border-border/30">
                                <div className="text-sm font-bold text-foreground">{strategyConfig.testingBudgetPct}%</div>
                                <div className="text-[10px] text-muted-foreground">für neue Tests</div>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-lg text-center border border-border/30">
                                <div className="text-sm font-bold text-foreground">{strategyConfig.scalingBudgetPct}%</div>
                                <div className="text-[10px] text-muted-foreground">für Scaling</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
