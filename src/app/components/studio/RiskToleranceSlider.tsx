import React from 'react';
import { Slider } from '../../ui/slider';
import { Shield, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface RiskToleranceSliderProps {
    value: string; // 'low' | 'medium' | 'high'
    onChange: (value: 'low' | 'medium' | 'high') => void;
    scaleSpeed: string; // 'slow' | 'medium' | 'fast' | 'aggressive'
}

export function RiskToleranceSlider({ value, onChange, scaleSpeed }: RiskToleranceSliderProps) {
    // Map string values to slider position (0-100)
    const getSliderValue = (risk: string) => {
        switch (risk) {
            case 'low': return 0;
            case 'medium': return 50;
            case 'high': return 100;
            default: return 50;
        }
    };

    // Map slider position to string values
    const getRiskValue = (val: number) => {
        if (val < 33) return 'low';
        if (val < 66) return 'medium';
        return 'high';
    };

    const currentSliderValue = [getSliderValue(value)];

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'text-green-500';
            case 'medium': return 'text-blue-500';
            case 'high': return 'text-orange-500';
            default: return 'text-muted-foreground';
        }
    };

    const getRiskIcon = (risk: string) => {
        switch (risk) {
            case 'low': return <Shield className="w-5 h-5 text-green-500" />;
            case 'medium': return <TrendingUp className="w-5 h-5 text-blue-500" />;
            case 'high': return <Zap className="w-5 h-5 text-orange-500" />;
            default: return null;
        }
    };

    const getRiskLabel = (risk: string) => {
        switch (risk) {
            case 'low': return 'Conservative';
            case 'medium': return 'Balanced';
            case 'high': return 'Aggressive';
            default: return '';
        }
    };

    const getDescription = (risk: string) => {
        switch (risk) {
            case 'low':
                return 'Minimizes loss. Slow scaling. High pause threshold. Best for testing new angles.';
            case 'medium':
                return 'Balances growth and profit. Moderate scaling. Standard thresholds.';
            case 'high':
                return 'Maximizes volume. Fast scaling. Low pause threshold. Best for proven winners.';
            default: return '';
        }
    };

    // Projection logic based on current settings
    const getProjection = () => {
        const dailyIncrease =
            scaleSpeed === 'slow' ? '10-20%' :
                scaleSpeed === 'medium' ? '20-30%' :
                    scaleSpeed === 'fast' ? '30-50%' : '50%+';

        return dailyIncrease;
    };

    return (
        <div className="space-y-6 p-6 bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    Risk Tolerance & Scaling Speed
                    <div className="group relative">
                        <AlertTriangle className="w-4 h-4 text-muted-foreground cursor-help" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Determines how quickly we scale winners and cut losers.
                        </div>
                    </div>
                </label>
                <span className={`text-sm font-bold ${getRiskColor(value)} flex items-center gap-1.5`}>
                    {getRiskIcon(value)}
                    {getRiskLabel(value)}
                </span>
            </div>

            <div className="px-2">
                <Slider
                    value={currentSliderValue}
                    max={100}
                    step={1}
                    onValueChange={(vals) => onChange(getRiskValue(vals[0]))}
                    className="cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    <span>Conservative</span>
                    <span>Balanced</span>
                    <span>Aggressive</span>
                </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-background rounded-md border border-border shadow-sm">
                        {getRiskIcon(value)}
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">
                            Impact on Autopilot
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                            {getDescription(value)}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">Budget Growth</span>
                                <span className="font-mono font-medium text-foreground">
                                    Up to <span className="text-primary">{getProjection()}</span> daily
                                </span>
                            </div>
                            <div className="w-px h-8 bg-border" />
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">Reaction Time</span>
                                <span className="font-mono font-medium text-foreground">
                                    {value === 'high' ? 'High tolerance' : 'Immediate cuts'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
