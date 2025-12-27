import React, { useMemo } from 'react';
import { Card } from '../layout';
import { CheckCircle2, TrendingUp, Shield, DollarSign, Zap, Plus, Settings2 } from 'lucide-react';
import { StrategyBlueprint } from '../../hooks/useStrategies';

interface StrategySelectorProps {
    strategies: StrategyBlueprint[];
    selectedId: string | null;
    onSelect: (id: string, strategy: StrategyBlueprint) => void;
    onCreateNew: () => void;
    recommendedGoal?: 'scaling' | 'testing' | 'profit';
}

export function StrategySelector({
    strategies,
    selectedId,
    onSelect,
    onCreateNew,
    recommendedGoal = 'scaling'
}: StrategySelectorProps) {

    // Logic to determine "Best Match"
    const sortedStrategies = useMemo(() => {
        // 1. Prioritize recommended goal
        // 2. Prioritize enabled autopilot
        return [...strategies].sort((a, b) => {
            const aConfig = a.metadata?.autopilot_config as any;
            const bConfig = b.metadata?.autopilot_config as any;

            const aIsMatch = isGoalMatch(aConfig, recommendedGoal);
            const bIsMatch = isGoalMatch(bConfig, recommendedGoal);

            if (aIsMatch && !bIsMatch) return -1;
            if (!aIsMatch && bIsMatch) return 1;
            return 0;
        });
    }, [strategies, recommendedGoal]);

    function isGoalMatch(config: any, goal: string) {
        if (!config) return false;
        if (goal === 'scaling' && config.scale_speed === 'aggressive') return true;
        if (goal === 'testing' && config.risk_tolerance === 'low') return true;
        if (goal === 'profit' && config.target_roas >= 4.0) return true;
        return false;
    }

    const getStrategyIcon = (config: any) => {
        if (!config) return <Settings2 className="w-5 h-5 text-gray-400" />;
        if (config.scale_speed === 'aggressive') return <Zap className="w-5 h-5 text-orange-500" />;
        if (config.risk_tolerance === 'low') return <Shield className="w-5 h-5 text-green-500" />;
        if (config.target_roas > 3.5) return <DollarSign className="w-5 h-5 text-blue-500" />;
        return <TrendingUp className="w-5 h-5 text-indigo-500" />;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                    Select Master Strategy
                </label>
                <button
                    onClick={onCreateNew}
                    className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1"
                >
                    <Plus className="w-3 h-3" />
                    Create New
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sortedStrategies.map((strategy) => {
                    const isSelected = selectedId === strategy.id;
                    const config = strategy.metadata?.autopilot_config as any;
                    const isRecommended = isGoalMatch(config, recommendedGoal);

                    return (
                        <div
                            key={strategy.id}
                            onClick={() => onSelect(strategy.id, strategy)}
                            className={`
                relative group cursor-pointer rounded-xl p-4 border-2 transition-all duration-200
                ${isSelected
                                    ? 'border-primary bg-primary/5 shadow-md'
                                    : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                                }
              `}>

                            {/* Selection Checkmark */}
                            <div className={`
                absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center border transition-all
                ${isSelected
                                    ? 'bg-primary border-primary text-primary-foreground scale-100'
                                    : 'border-muted-foreground/30 text-transparent scale-90 group-hover:border-primary/50'
                                }
              `}>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>

                            {/* Recommended Badge */}
                            {isRecommended && (
                                <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold text-white rounded-full shadow-sm">
                                    RECOMMENDED
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <div className={`
                  p-2 rounded-lg border shadow-sm
                  ${isSelected ? 'bg-background border-primary/20' : 'bg-muted/50 border-transparent'}
                `}>
                                    {getStrategyIcon(config)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                        {strategy.title}
                                    </h4>

                                    {config ? (
                                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                ROAS {Number(config.target_roas).toFixed(1)}x
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground capitalize">
                                                <span className={`w-1.5 h-1.5 rounded-full ${config.risk_tolerance === 'high' ? 'bg-orange-500' :
                                                        config.risk_tolerance === 'low' ? 'bg-green-500' : 'bg-yellow-500'
                                                    }`} />
                                                {config.scale_speed}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            No autopilot config
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Create New Card (Empty State or Action) */}
                {!strategies.length && (
                    <div
                        onClick={onCreateNew}
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                            <Plus className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium text-foreground">Create First Strategy</span>
                        <span className="text-xs text-muted-foreground mt-1">Configure your master plan</span>
                    </div>
                )}
            </div>
        </div>
    );
}
