import { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, Clock, RotateCcw, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';

interface AutopilotAction {
    id: string;
    campaign_id: string;
    campaign_name: string;
    action: string;
    reason: string;
    status: 'pending' | 'applied' | 'failed' | 'cancelled' | 'undone';
    error_message?: string;
    created_at: string;
    applied_at?: string;
}

export function AutopilotActivityLog() {
    const [actions, setActions] = useState<AutopilotAction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'applied' | 'pending' | 'failed'>('all');

    useEffect(() => {
        loadActions();
    }, [filter]);

    const loadActions = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let query = supabase
                .from('autopilot_actions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;
            if (error) throw error;

            setActions(data || []);
        } catch (error) {
            console.error('Failed to load actions:', error);
            toast.error('Failed to load activity log');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUndo = async (actionId: string) => {
        if (!window.confirm('Undo this action? This will attempt to restore the previous state.')) {
            return;
        }

        try {
            // Mark as undone
            const { error } = await supabase
                .from('autopilot_actions')
                .update({
                    status: 'undone',
                    undone_at: new Date().toISOString()
                })
                .eq('id', actionId);

            if (error) throw error;

            toast.success('Action marked as undone');
            loadActions();
        } catch (error) {
            console.error('Failed to undo action:', error);
            toast.error('Failed to undo action');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'applied':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4 text-gray-500" />;
            case 'undone':
                return <RotateCcw className="w-4 h-4 text-blue-500" />;
            default:
                return <Activity className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'applied':
                return 'bg-green-500/10 text-green-600 border-green-500/20';
            case 'failed':
                return 'bg-red-500/10 text-red-600 border-red-500/20';
            case 'pending':
                return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
            case 'cancelled':
                return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
            case 'undone':
                return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    const getActionLabel = (action: string) => {
        const labels: Record<string, string> = {
            pause: 'Paused',
            scale_up: 'Increased Budget',
            scale_down: 'Decreased Budget',
            duplicate: 'Duplicated'
        };
        return labels[action] || action;
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (isLoading) {
        return (
            <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-center py-8">
                    <Activity className="w-6 h-6 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Autopilot Activity Log
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Recent automated and manual actions
                    </p>
                </div>

                {/* Filter */}
                <div className="flex gap-2">
                    {(['all', 'applied', 'pending', 'failed'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filter === f
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-muted/80'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Actions List */}
            {actions.length === 0 ? (
                <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No actions yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {actions.map(action => (
                        <div
                            key={action.id}
                            className={`border-2 rounded-xl p-4 ${getStatusColor(action.status)}`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                    {getStatusIcon(action.status)}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold">
                                                {getActionLabel(action.action)}
                                            </p>
                                            <span className="text-xs px-2 py-0.5 bg-muted rounded capitalize">
                                                {action.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {action.campaign_name || action.campaign_id}
                                        </p>
                                        {action.reason && (
                                            <p className="text-sm mb-2">
                                                {action.reason}
                                            </p>
                                        )}
                                        {action.error_message && (
                                            <p className="text-sm text-red-600">
                                                Error: {action.error_message}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            {formatTime(action.created_at)}
                                        </p>
                                    </div>
                                </div>

                                {/* Undo Button */}
                                {action.status === 'applied' && (
                                    <button
                                        onClick={() => handleUndo(action.id)}
                                        className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-1"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        Undo
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
