import { useEffect, useState } from 'react';
import { Card } from '../layout';
import { Zap, Activity, Clock, AlertTriangle, TrendingUp, TrendingDown, PowerOff, Shield, CheckCircle2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Log = {
    id: string;
    campaign_name: string;
    action_type: 'PAUSE' | 'scale' | 'increase_budget' | 'decrease_budget' | 'SOFT_KILL' | 'HARD_STOP' | 'FATIGUE_THROTTLE' | 'SURF_SCALE' | 'pause_ad';
    reason: string;
    new_value?: string;
    created_at: string;
};

// Map action types to visual styles
const ACTION_CONFIG: Record<string, { icon: any, color: string, label: string }> = {
    'SOFT_KILL': { icon: Shield, color: 'text-red-500', label: 'Safety Kill' },
    'HARD_STOP': { icon: PowerOff, color: 'text-red-500', label: 'Stop Loss' },
    'FATIGUE_THROTTLE': { icon: TrendingDown, color: 'text-orange-500', label: 'Fatigue Protection' },
    'SURF_SCALE': { icon: TrendingUp, color: 'text-green-500', label: 'Surf Scaling' },
    'increase_budget': { icon: TrendingUp, color: 'text-green-500', label: 'Budget Up' },
    'decrease_budget': { icon: TrendingDown, color: 'text-orange-500', label: 'Budget Down' },
    'PAUSE': { icon: PowerOff, color: 'text-red-500', label: 'Paused' },
    'pause_ad': { icon: PowerOff, color: 'text-red-500', label: 'Paused' },
};

export function AutopilotActivityFeed() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClientComponentClient();

    const fetchLogs = async () => {
        try {
            const { data, error } = await supabase
                .from('autopilot_activity_log')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setLogs(data as Log[]);
        } catch (err) {
            console.error('Error fetching autopilot logs:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('autopilot_logs')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'autopilot_activity_log' },
                (payload) => {
                    setLogs(prev => [payload.new as Log, ...prev].slice(0, 20));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8 h-[300px] border border-white/5 rounded-2xl bg-black/20">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-muted-foreground animate-pulse">Connecting to Neural Engine...</span>
                </div>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-[300px] border border-white/5 rounded-2xl bg-black/20 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Activity className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium text-foreground">No Activity Yet</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    The Autopilot is monitoring your campaigns. Actions will appear here instantly.
                </p>
            </div>
        );
    }

    return (
        <Card className="border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">Neural Engine Activity</h3>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    LIVE
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="divide-y divide-white/5">
                    {logs.map((log) => {
                        const config = ACTION_CONFIG[log.action_type] || { icon: Activity, color: 'text-blue-500', label: log.action_type };
                        const Icon = config.icon;

                        return (
                            <div key={log.id} className="p-4 hover:bg-white/5 transition-colors group animate-in slide-in-from-left-2 duration-300">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors ${config.color}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className={`text-xs font-bold ${config.color}`}>
                                                {config.label}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <p className="text-sm font-medium text-foreground truncate mb-0.5">
                                            {log.campaign_name}
                                        </p>

                                        <div className="text-xs text-muted-foreground leading-relaxed">
                                            {log.reason}
                                            {log.new_value && (
                                                <span className="block mt-1 font-mono text-xs text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded w-fit">
                                                    ➜ {log.new_value}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
}
