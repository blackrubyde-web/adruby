import { useState } from 'react';
import { Zap, TrendingUp, DollarSign, Info, BarChart3 } from 'lucide-react';

interface CBOConfigPanelProps {
    cboEnabled: boolean;
    dailyBudget?: number;
    lifetimeBudget?: number;
    budgetDistribution: 'auto' | 'manual';
    spendCap?: number;
    adSetCount: number;
    onCBOToggle: (enabled: boolean) => void;
    onDailyBudgetChange: (budget: number) => void;
    onLifetimeBudgetChange: (budget: number) => void;
    onDistributionChange: (distribution: 'auto' | 'manual') => void;
    onSpendCapChange: (cap: number) => void;
}

export const CBOConfigPanel = ({
    cboEnabled,
    dailyBudget = 0,
    lifetimeBudget,
    budgetDistribution,
    spendCap,
    adSetCount,
    onCBOToggle,
    onDailyBudgetChange,
    onLifetimeBudgetChange,
    onDistributionChange,
    onSpendCapChange
}: CBOConfigPanelProps) => {
    const [budgetType, setBudgetType] = useState<'daily' | 'lifetime'>('daily');

    // Calculate estimated distribution per ad set
    const estimatedPerAdSet = cboEnabled
        ? (budgetType === 'daily' ? dailyBudget : lifetimeBudget || 0) / Math.max(1, adSetCount)
        : 0;

    return (
        <div className="space-y-4">
            {/* CBO Toggle */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-500/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-500/20 rounded-lg">
                        <Zap className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Campaign Budget Optimization</p>
                        <p className="text-xs text-muted-foreground">Meta verteilt Budget automatisch auf beste Ad Sets</p>
                    </div>
                </div>
                <button
                    onClick={() => onCBOToggle(!cboEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${cboEnabled ? 'bg-violet-500' : 'bg-muted'
                        }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${cboEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    />
                </button>
            </div>

            {cboEnabled && (
                <>
                    {/* Budget Type Selection */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setBudgetType('daily')}
                            className={`p-3 rounded-xl border transition-all ${budgetType === 'daily'
                                    ? 'bg-primary/10 border-primary'
                                    : 'bg-card border-border hover:border-primary/50'
                                }`}
                        >
                            <DollarSign className="w-4 h-4 mx-auto mb-1" />
                            <p className="text-xs font-bold">Tagesbudget</p>
                        </button>
                        <button
                            onClick={() => setBudgetType('lifetime')}
                            className={`p-3 rounded-xl border transition-all ${budgetType === 'lifetime'
                                    ? 'bg-primary/10 border-primary'
                                    : 'bg-card border-border hover:border-primary/50'
                                }`}
                        >
                            <BarChart3 className="w-4 h-4 mx-auto mb-1" />
                            <p className="text-xs font-bold">Laufzeitbudget</p>
                        </button>
                    </div>

                    {/* Budget Input */}
                    <div>
                        <label className="text-xs font-bold text-muted-foreground mb-2 block">
                            {budgetType === 'daily' ? 'Tägliches Budget' : 'Gesamtbudget'} (Campaign-Level)
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="number"
                                value={budgetType === 'daily' ? dailyBudget : lifetimeBudget || 0}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    budgetType === 'daily'
                                        ? onDailyBudgetChange(val)
                                        : onLifetimeBudgetChange(val);
                                }}
                                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Budget Distribution Strategy */}
                    <div>
                        <label className="text-xs font-bold text-muted-foreground mb-2 block">
                            Verteilungsstrategie
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => onDistributionChange('auto')}
                                className={`p-3 rounded-xl border transition-all text-left ${budgetDistribution === 'auto'
                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                        : 'bg-card border-border hover:border-emerald-500/50'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                                    <p className="text-xs font-bold">Auto</p>
                                </div>
                                <p className="text-[10px] text-muted-foreground">Meta optimiert automatisch</p>
                            </button>
                            <button
                                onClick={() => onDistributionChange('manual')}
                                className={`p-3 rounded-xl border transition-all text-left ${budgetDistribution === 'manual'
                                        ? 'bg-blue-500/10 border-blue-500/30'
                                        : 'bg-card border-border hover:border-blue-500/50'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <BarChart3 className="w-3 h-3 text-blue-500" />
                                    <p className="text-xs font-bold">Manuell</p>
                                </div>
                                <p className="text-[10px] text-muted-foreground">Du kontrollierst Verteilung</p>
                            </button>
                        </div>
                    </div>

                    {/* Spend Cap (Optional) */}
                    <div>
                        <label className="text-xs font-bold text-muted-foreground mb-2 block flex items-center gap-1">
                            Spend Cap (Optional)
                            <Info className="w-3 h-3" />
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="number"
                                value={spendCap || ''}
                                onChange={(e) => onSpendCapChange(parseFloat(e.target.value) || 0)}
                                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Kein Limit"
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            Maximale Ausgaben für diese Kampagne
                        </p>
                    </div>

                    {/* Budget Preview */}
                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                        <div className="flex items-center gap-2 mb-3">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            <p className="text-xs font-bold">Budget-Verteilung Preview</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Ad Sets:</span>
                                <span className="font-bold">{adSetCount}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Ø Budget pro Ad Set:</span>
                                <span className="font-bold text-primary">
                                    €{estimatedPerAdSet.toFixed(2)}/Tag
                                </span>
                            </div>
                            {spendCap && (
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Max. Gesamtausgaben:</span>
                                    <span className="font-bold text-amber-500">€{spendCap.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        {budgetDistribution === 'auto' && (
                            <div className="mt-3 p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <p className="text-[10px] text-emerald-600">
                                    ✓ Meta verteilt Budget dynamisch auf performanteste Ad Sets
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {!cboEnabled && (
                <div className="p-4 bg-muted/30 rounded-xl border border-border text-center">
                    <Info className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">
                        Budget wird auf Ad Set-Level verwaltet
                    </p>
                </div>
            )}
        </div>
    );
};
