import { useMemo } from 'react';
import { CheckCircle2, TrendingUp, Shield, DollarSign, Zap, Plus, Settings2, Sparkles, Target } from 'lucide-react';
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
        return [...strategies].sort((a, b) => {
            const aConfig = a.autopilot_config as unknown as StrategyConfig;
            const bConfig = b.autopilot_config as unknown as StrategyConfig;

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
        if (config.scale_speed === 'aggressive') return <Zap className="w-5 h-5 text-amber-500" />;
        if (config.risk_tolerance === 'low') return <Shield className="w-5 h-5 text-emerald-500" />;
        if (config.target_roas > 3.5) return <DollarSign className="w-5 h-5 text-indigo-500" />;
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <label className="text-base font-bold text-foreground flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Select Master Strategy
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">Choose a blueprint to guide your campaign.</p>
                </div>
                <button
                    onClick={onCreateNew}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all border border-primary/20 hover:border-primary/50"
                >
                    <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                    New Blueprint
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {sortedStrategies.map((strategy) => {
                    const isSelected = selectedId === strategy.id;
                    const config = strategy.autopilot_config as unknown as StrategyConfig;
                    const isRecommended = isGoalMatch(config, recommendedGoal);

                    return (
                        <div
                            key={strategy.id}
                            onClick={() => onSelect(strategy.id, strategy)}
                            className={`
                                relative group cursor-pointer rounded-2xl p-0.5 transition-all duration-300
                                ${isSelected
                                    ? 'bg-gradient-to-r from-primary via-purple-500 to-indigo-600 shadow-[0_0_20px_rgba(124,58,237,0.3)] scale-[1.02]'
                                    : 'bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/20'
                                }
                            `}>

                            <div className="relative bg-[#0A0A0A] rounded-[15px] p-4 h-full overflow-hidden">
                                {/* Inner Gradient Glow */}
                                {isSelected && (
                                    <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                                )}

                                {/* Recommended Badge */}
                                {isRecommended && (
                                    <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-bl from-amber-500 to-orange-600 rounded-bl-xl text-[10px] font-black text-black uppercase tracking-wider shadow-lg z-10">
                                        Best Fit
                                    </div>
                                )}

                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={`
                                        w-12 h-12 rounded-full flex items-center justify-center border shadow-inner transition-all duration-300
                                        ${isSelected
                                            ? 'bg-primary/20 border-primary/30 shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                                            : 'bg-white/5 border-white/5 group-hover:bg-white/10'
                                        }
                                    `}>
                                        {getStrategyIcon(config)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className={`text-sm font-bold truncate transition-colors ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                                                {strategy.title}
                                            </h4>
                                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />}
                                        </div>

                                        {config ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/5">
                                                    ROAS {Number(config.target_roas).toFixed(1)}x
                                                </span>
                                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize ${config.risk_tolerance === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        config.risk_tolerance === 'low' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    }`}>
                                                    {config.risk_tolerance} Risk
                                                </span>
                                            </div>
                                        ) : (
                                            <p className="text-[10px] text-muted-foreground italic">Not configured</p>
                                        )}
                                    </div>

                                    {/* Chevron indicator for selection */}
                                    {!isSelected && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                <Plus className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Create New Card (Empty State) */}
                {!strategies.length && (
                    <div
                        onClick={onCreateNew}
                        className="group flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 hover:border-primary/30 cursor-pointer transition-all duration-300 min-h-[150px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/20 transition-all shadow-[0_0_15px_rgba(124,58,237,0.1)]">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm font-bold text-gray-200 group-hover:text-white">Start Strategy Engine</span>
                        <span className="text-xs text-muted-foreground mt-1">Create your first AI blueprint</span>
                    </div>
                )}
            </div>
        </div>
    );
}
