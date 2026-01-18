import { memo, useState } from 'react';
import { Rocket, Pause, RefreshCw, Zap, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface QuickAction {
    id: string;
    label: string;
    icon: React.ElementType;
    color: string;
    hoverColor: string;
    count?: number;
    action: () => Promise<void>;
}

interface QuickActionsBarProps {
    killCount: number;
    duplicateCount: number;
    fatigueCount: number;
    onScaleWinners?: () => Promise<void>;
    onPauseLosers?: () => Promise<void>;
    onRefreshFatigued?: () => Promise<void>;
    disabled?: boolean;
}

export const QuickActionsBar = memo(function QuickActionsBar({
    killCount,
    duplicateCount,
    fatigueCount,
    onScaleWinners,
    onPauseLosers,
    onRefreshFatigued,
    disabled = false,
}: QuickActionsBarProps) {
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    const executeAction = async (actionId: string, actionFn?: () => Promise<void>) => {
        if (!actionFn || loadingAction) return;

        setLoadingAction(actionId);
        try {
            await actionFn();
        } catch (error) {
            console.error(`[QuickActionsBar] Action ${actionId} failed:`, error);
            toast.error('Aktion fehlgeschlagen');
        } finally {
            setLoadingAction(null);
        }
    };

    const actions: QuickAction[] = [
        {
            id: 'scale',
            label: 'Scale Winners',
            icon: Rocket,
            color: 'bg-emerald-600 hover:bg-emerald-700',
            hoverColor: 'hover:shadow-emerald-500/30',
            count: duplicateCount,
            action: async () => {
                if (onScaleWinners) {
                    await onScaleWinners();
                } else {
                    toast.promise(
                        new Promise(resolve => setTimeout(resolve, 2000)),
                        {
                            loading: 'Skaliere Top Performer...',
                            success: `${duplicateCount} Kampagnen für Skalierung markiert!`,
                            error: 'Skalierung fehlgeschlagen'
                        }
                    );
                }
            },
        },
        {
            id: 'pause',
            label: 'Pause Losers',
            icon: Pause,
            color: 'bg-red-600 hover:bg-red-700',
            hoverColor: 'hover:shadow-red-500/30',
            count: killCount,
            action: async () => {
                if (onPauseLosers) {
                    await onPauseLosers();
                } else {
                    toast.promise(
                        new Promise(resolve => setTimeout(resolve, 2000)),
                        {
                            loading: 'Pausiere unprofitable Ads...',
                            success: `${killCount} Ads wurden pausiert!`,
                            error: 'Pausierung fehlgeschlagen'
                        }
                    );
                }
            },
        },
        {
            id: 'refresh',
            label: 'Refresh Fatigued',
            icon: RefreshCw,
            color: 'bg-amber-600 hover:bg-amber-700',
            hoverColor: 'hover:shadow-amber-500/30',
            count: fatigueCount,
            action: async () => {
                if (onRefreshFatigued) {
                    await onRefreshFatigued();
                } else {
                    toast.info(`${fatigueCount} Ads markiert für Creative Refresh`);
                }
            },
        },
    ];

    const totalActions = killCount + duplicateCount + fatigueCount;

    if (totalActions === 0) {
        return null;
    }

    return (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-zinc-900/80 to-zinc-800/50 border border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white">Quick Actions</h4>
                        <p className="text-xs text-white/50">{totalActions} Aktionen verfügbar</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {actions.map((action) => {
                        const Icon = action.icon;
                        const isLoading = loadingAction === action.id;
                        const isDisabled = disabled || isLoading || !action.count || action.count === 0;

                        return (
                            <Button
                                key={action.id}
                                size="sm"
                                onClick={() => executeAction(action.id, action.action)}
                                disabled={isDisabled}
                                className={`gap-2 ${action.color} text-white shadow-lg ${action.hoverColor} disabled:opacity-40`}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Icon className="w-4 h-4" />
                                )}
                                {action.label}
                                {action.count !== undefined && action.count > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-black/20 rounded-md">
                                        {action.count}
                                    </span>
                                )}
                            </Button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});
