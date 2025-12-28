import { useMemo } from 'react';
import { CheckCircle2, TrendingUp, Shield, DollarSign, Zap, Plus, Settings2 } from 'lucide-react';
import { StrategyBlueprint } from '../../hooks/useStrategies';

interface StrategyConfig {
    scale_speed: 'aggressive' | 'standard' | 'conservative';
    risk_tolerance: 'low' | 'medium' | 'high';
    target_roas: number;
}

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
            const aConfig = a.metadata?.autopilot_config as unknown as StrategyConfig;
            const bConfig = b.metadata?.autopilot_config as unknown as StrategyConfig;

            const aIsMatch = isGoalMatch(aConfig, recommendedGoal);
            const bIsMatch = isGoalMatch(bConfig, recommendedGoal);

            if (aIsMatch && !bIsMatch) return -1;
            if (!aIsMatch && bIsMatch) return 1;
            return 0;
        });
    }, [strategies, recommendedGoal]);

    function isGoalMatch(config: StrategyConfig, goal: string) {
        if (!config) return false;
        if (goal === 'scaling' && config.scale_speed === 'aggressive') return true;
        if (goal === 'testing' && config.risk_tolerance === 'low') return true;
        if (goal === 'profit' && config.target_roas >= 4.0) return true;
        return false;
    }

    const getStrategyIcon = (config: StrategyConfig) => {
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
                    const config = strategy.metadata?.autopilot_config as unknown as StrategyConfig;
                    const isRecommended = isGoalMatch(config, recommendedGoal);

                    return (
                        <div
                            key={strategy.id}
                            onClick={() => onSelect(strategy.id, strategy)}
                            className={`
                                relative group cursor-pointer rounded-2xl p-5 border transition-all duration-300 overflow-hidden
                                ${isSelected
                                    ? 'border-primary/50 bg-primary/10 shadow-[0_0_30px_rgba(124,58,237,0.15)] backdrop-blur-sm'
                                    : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 hover:shadow-xl hover:-translate-y-1'
                                }
                            `}>

                            {/* Premium Glow Effect (Active State) */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />
                            )}

                            {/* Selection Checkmark with Premium Pulse */}
                            <div className={`
                                absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 z-10
                                ${isSelected
                                    ? 'bg-primary border-primary text-white scale-100 shadow-[0_0_10px_rgba(124,58,237,0.5)]'
                                    : 'border-white/20 text-transparent scale-90 group-hover:border-white/40'
                                }
                            `}>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>

                            {/* Recommended Badge (Gradient) */}
                            {isRecommended && (
                                <div className="absolute -top-px left-6 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-600 text-[10px] font-bold text-white uppercase tracking-wider rounded-b-lg shadow-lg z-20">
                                    Recommended
                                </div>
                            )}

                            <div className="flex items-start gap-4 relative z-10">
                                <div className={`
                                    p-3 rounded-xl border shadow-inner transition-colors duration-300
                                    ${isSelected ? 'bg-background/50 border-primary/20' : 'bg-black/20 border-white/5'}
                                `}>
                                    {getStrategyIcon(config)}
                                </div>

                                <div className="flex-1 min-w-0 pt-0.5">
                                    <h4 className={`text-base font-bold truncate transition-colors ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                                        {strategy.title}
                                    </h4>

                                    {config ? (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-muted-foreground">
                                                <DollarSign className="w-3 h-3 text-blue-400" />
                                                <span className="font-medium text-gray-300">ROAS {Number(config.target_roas).toFixed(1)}x</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-muted-foreground capitalize">
                                                <Zap className={`w-3 h-3 ${config.scale_speed === 'aggressive' ? 'text-orange-400' : 'text-yellow-400'}`} />
                                                <span className="font-medium text-gray-300">{config.scale_speed}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground mt-2 italic">
                                            Not configured
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
                        className="group flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 hover:border-primary/30 cursor-pointer transition-all duration-300"
                    >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/20 transition-all shadow-[0_0_15px_rgba(124,58,237,0.1)]">
                            <Plus className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm font-bold text-gray-200 group-hover:text-white">Create First Strategy</span>
                        <span className="text-xs text-muted-foreground mt-1">Initialize your master blueprint</span>
                    </div>
                )}
            </div>
        </div>
    );
}
