import { memo, useState, useCallback, useMemo } from 'react';
import {
    Bell,
    BellRing,
    Plus,
    Trash2,
    Check,
    AlertTriangle,
    TrendingDown,
    DollarSign,
    Clock,
    Slack,
    Mail,
    Smartphone,
    ChevronDown,
    Loader2,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';

export interface AlertRule {
    id: string;
    name: string;
    type: 'budget' | 'roas' | 'ctr' | 'fatigue' | 'spend_spike' | 'custom';
    condition: {
        metric: string;
        operator: '>' | '<' | '>=' | '<=' | '==' | 'change';
        value: number;
        timeframe?: string;
    };
    channels: ('app' | 'email' | 'slack')[];
    enabled: boolean;
    lastTriggered?: string;
    triggerCount: number;
}

interface AlertsConfigPanelProps {
    alerts?: AlertRule[];
    onSaveAlert?: (alert: AlertRule) => Promise<void>;
    onDeleteAlert?: (id: string) => Promise<void>;
    onToggleAlert?: (id: string, enabled: boolean) => Promise<void>;
    slackWebhookUrl?: string;
    onSaveSlackUrl?: (url: string) => Promise<void>;
}

const ALERT_TEMPLATES: Partial<AlertRule>[] = [
    {
        name: 'Budget Überschreitung',
        type: 'budget',
        condition: { metric: 'daily_spend', operator: '>', value: 100, timeframe: 'daily' },
        channels: ['app', 'email'],
    },
    {
        name: 'ROAS unter Ziel',
        type: 'roas',
        condition: { metric: 'roas', operator: '<', value: 1.5, timeframe: '3d' },
        channels: ['app'],
    },
    {
        name: 'CTR Warnung',
        type: 'ctr',
        condition: { metric: 'ctr', operator: '<', value: 0.5, timeframe: '24h' },
        channels: ['app'],
    },
    {
        name: 'Ad Fatigue',
        type: 'fatigue',
        condition: { metric: 'frequency', operator: '>', value: 3, timeframe: '7d' },
        channels: ['app', 'email'],
    },
    {
        name: 'Spend Spike',
        type: 'spend_spike',
        condition: { metric: 'spend', operator: 'change', value: 50, timeframe: '1h' },
        channels: ['app', 'slack'],
    },
];

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'budget': return DollarSign;
        case 'roas': return TrendingDown;
        case 'ctr': return AlertTriangle;
        case 'fatigue': return Clock;
        case 'spend_spike': return AlertTriangle;
        default: return Bell;
    }
};

const getTypeColor = (type: string) => {
    switch (type) {
        case 'budget': return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' };
        case 'roas': return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' };
        case 'ctr': return { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' };
        case 'fatigue': return { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/20' };
        case 'spend_spike': return { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/20' };
        default: return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' };
    }
};

export const AlertsConfigPanel = memo(function AlertsConfigPanel({
    alerts: initialAlerts = [],
    onSaveAlert,
    onDeleteAlert,
    onToggleAlert,
    slackWebhookUrl: initialSlackUrl = '',
    onSaveSlackUrl,
}: AlertsConfigPanelProps) {
    const [alerts, setAlerts] = useState<AlertRule[]>(initialAlerts.length > 0 ? initialAlerts : [
        { ...ALERT_TEMPLATES[0], id: '1', enabled: true, triggerCount: 3 } as AlertRule,
        { ...ALERT_TEMPLATES[1], id: '2', enabled: true, triggerCount: 5 } as AlertRule,
        { ...ALERT_TEMPLATES[3], id: '3', enabled: false, triggerCount: 0 } as AlertRule,
    ]);
    const [showTemplates, setShowTemplates] = useState(false);
    const [slackUrl, setSlackUrl] = useState(initialSlackUrl);
    const [showSlackConfig, setShowSlackConfig] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = useCallback(async (id: string, enabled: boolean) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled } : a));
        if (onToggleAlert) {
            await onToggleAlert(id, enabled);
        }
        toast.success(enabled ? 'Alert aktiviert' : 'Alert deaktiviert');
    }, [onToggleAlert]);

    const handleDelete = useCallback(async (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
        if (onDeleteAlert) {
            await onDeleteAlert(id);
        }
        toast.success('Alert gelöscht');
    }, [onDeleteAlert]);

    const handleAddTemplate = useCallback(async (template: Partial<AlertRule>) => {
        const newAlert: AlertRule = {
            ...template,
            id: `alert-${Date.now()}`,
            enabled: true,
            triggerCount: 0,
            channels: template.channels || ['app'],
        } as AlertRule;

        setAlerts(prev => [...prev, newAlert]);
        setShowTemplates(false);

        if (onSaveAlert) {
            await onSaveAlert(newAlert);
        }
        toast.success(`Alert "${template.name}" hinzugefügt`);
    }, [onSaveAlert]);

    const handleSaveSlack = useCallback(async () => {
        if (!slackUrl.includes('hooks.slack.com')) {
            toast.error('Ungültige Slack Webhook URL');
            return;
        }
        setIsLoading(true);
        if (onSaveSlackUrl) {
            await onSaveSlackUrl(slackUrl);
        }
        setIsLoading(false);
        setShowSlackConfig(false);
        toast.success('Slack Webhook gespeichert');
    }, [slackUrl, onSaveSlackUrl]);

    const enabledCount = useMemo(() => alerts.filter(a => a.enabled).length, [alerts]);
    const totalTriggers = useMemo(() => alerts.reduce((sum, a) => sum + a.triggerCount, 0), [alerts]);

    return (
        <div className="relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                        <BellRing className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            Smart Alerts
                            <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-[10px]">
                                AGENCY PRO
                            </Badge>
                        </h3>
                        <p className="text-xs text-muted-foreground">{enabledCount} aktiv · {totalTriggers} ausgelöst</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSlackConfig(!showSlackConfig)}
                        className="gap-1 h-8 text-xs"
                    >
                        <Slack className="w-3 h-3" />
                        Slack
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="gap-1 h-8 text-xs bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-90 text-white"
                    >
                        <Plus className="w-3 h-3" />
                        Alert
                    </Button>
                </div>
            </div>

            {/* Slack Config */}
            {showSlackConfig && (
                <div className="mb-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <div className="flex items-center gap-2 mb-3">
                        <Slack className="w-5 h-5 text-violet-400" />
                        <h4 className="font-semibold text-foreground">Slack Integration</h4>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={slackUrl}
                            onChange={(e) => setSlackUrl(e.target.value)}
                            placeholder="https://hooks.slack.com/services/..."
                            className="flex-1 px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        />
                        <Button
                            onClick={handleSaveSlack}
                            disabled={isLoading}
                            className="gap-2 bg-violet-600 hover:bg-violet-700"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Speichern
                        </Button>
                    </div>
                </div>
            )}

            {/* Templates */}
            {showTemplates && (
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ALERT_TEMPLATES.map((template, i) => {
                        const colors = getTypeColor(template.type || 'custom');
                        const Icon = getTypeIcon(template.type || 'custom');
                        const alreadyAdded = alerts.some(a => a.name === template.name);

                        return (
                            <button
                                key={i}
                                onClick={() => !alreadyAdded && handleAddTemplate(template)}
                                disabled={alreadyAdded}
                                className={`p-4 rounded-xl border text-left transition-all ${alreadyAdded
                                    ? 'bg-muted border-border opacity-50 cursor-not-allowed'
                                    : `${colors.bg} ${colors.border} hover:scale-[1.02]`
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Icon className={`w-5 h-5 ${colors.text}`} />
                                    <span className="font-medium text-foreground">{template.name}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {template.condition?.metric} {template.condition?.operator} {template.condition?.value}
                                    {template.condition?.operator === 'change' && '%'}
                                </p>
                                {alreadyAdded && (
                                    <Badge className="mt-2 bg-muted text-muted-foreground">Bereits hinzugefügt</Badge>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Alert List */}
            <div className="space-y-3">
                {alerts.length === 0 ? (
                    <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">Keine Alerts konfiguriert</p>
                    </div>
                ) : (
                    alerts.map((alert) => {
                        const colors = getTypeColor(alert.type);
                        const Icon = getTypeIcon(alert.type);

                        return (
                            <div
                                key={alert.id}
                                className={`p-4 rounded-xl border transition-all ${alert.enabled
                                    ? `${colors.bg} ${colors.border}`
                                    : 'bg-muted border-border opacity-60'
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center shrink-0`}>
                                            <Icon className={`w-5 h-5 ${colors.text}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-semibold text-foreground truncate">{alert.name}</h4>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>
                                                    {alert.condition.metric} {alert.condition.operator} {alert.condition.value}
                                                    {alert.condition.operator === 'change' && '%'}
                                                </span>
                                                {alert.condition.timeframe && (
                                                    <span className="text-muted-foreground">({alert.condition.timeframe})</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        {/* Channels */}
                                        <div className="hidden sm:flex items-center gap-1">
                                            {alert.channels.includes('app') && (
                                                <div className="w-6 h-6 rounded bg-muted flex items-center justify-center" title="In-App">
                                                    <Smartphone className="w-3 h-3 text-muted-foreground" />
                                                </div>
                                            )}
                                            {alert.channels.includes('email') && (
                                                <div className="w-6 h-6 rounded bg-muted flex items-center justify-center" title="Email">
                                                    <Mail className="w-3 h-3 text-muted-foreground" />
                                                </div>
                                            )}
                                            {alert.channels.includes('slack') && (
                                                <div className="w-6 h-6 rounded bg-violet-500/20 flex items-center justify-center" title="Slack">
                                                    <Slack className="w-3 h-3 text-violet-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Trigger Count */}
                                        {alert.triggerCount > 0 && (
                                            <Badge variant="outline" className="text-xs hidden md:block">
                                                {alert.triggerCount}x ausgelöst
                                            </Badge>
                                        )}

                                        {/* Toggle */}
                                        <Switch
                                            checked={alert.enabled}
                                            onCheckedChange={(checked) => handleToggle(alert.id, checked)}
                                        />

                                        {/* Delete */}
                                        <button
                                            onClick={() => handleDelete(alert.id)}
                                            className="p-2 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
});
