import { memo, useState, useCallback } from 'react';
import {
    Workflow,
    Plus,
    Trash2,
    Play,
    Pause,
    ChevronDown,
    Settings,
    Zap,
    Clock,
    Check,
    X,
    Loader2,
    AlertTriangle,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';

export interface AutomationRule {
    id: string;
    name: string;
    enabled: boolean;
    condition: {
        metric: string;
        operator: '>' | '<' | '>=' | '<=' | '==' | 'change_up' | 'change_down';
        value: number;
        timeframe: string;
    };
    action: {
        type: 'pause' | 'increase_budget' | 'decrease_budget' | 'duplicate' | 'alert';
        value?: number;
    };
    lastTriggered?: string;
    triggerCount: number;
    createdAt: string;
}

interface AutomatedRulesPanelProps {
    rules?: AutomationRule[];
    onSaveRule?: (rule: AutomationRule) => Promise<void>;
    onDeleteRule?: (id: string) => Promise<void>;
    onToggleRule?: (id: string, enabled: boolean) => Promise<void>;
}

const METRICS = [
    { value: 'roas', label: 'ROAS' },
    { value: 'ctr', label: 'CTR (%)' },
    { value: 'cpc', label: 'CPC (€)' },
    { value: 'spend', label: 'Spend (€)' },
    { value: 'frequency', label: 'Frequency' },
    { value: 'conversions', label: 'Conversions' },
];

const OPERATORS = [
    { value: '>', label: '>' },
    { value: '<', label: '<' },
    { value: '>=', label: '≥' },
    { value: '<=', label: '≤' },
    { value: '==', label: '=' },
    { value: 'change_up', label: '↑ steigt um' },
    { value: 'change_down', label: '↓ sinkt um' },
];

const TIMEFRAMES = [
    { value: '1h', label: '1 Stunde' },
    { value: '6h', label: '6 Stunden' },
    { value: '24h', label: '24 Stunden' },
    { value: '3d', label: '3 Tage' },
    { value: '7d', label: '7 Tage' },
];

const ACTIONS = [
    { value: 'pause', label: 'Ad pausieren', icon: Pause, color: 'text-red-400' },
    { value: 'increase_budget', label: 'Budget erhöhen', icon: Zap, color: 'text-emerald-400' },
    { value: 'decrease_budget', label: 'Budget reduzieren', icon: AlertTriangle, color: 'text-amber-400' },
    { value: 'duplicate', label: 'Ad duplizieren', icon: Plus, color: 'text-blue-400' },
    { value: 'alert', label: 'Alert senden', icon: AlertTriangle, color: 'text-violet-400' },
];

const DEFAULT_RULES: AutomationRule[] = [
    {
        id: '1',
        name: 'Auto-Pause unprofitable Ads',
        enabled: true,
        condition: { metric: 'roas', operator: '<', value: 1.0, timeframe: '3d' },
        action: { type: 'pause' },
        triggerCount: 12,
        createdAt: '2026-01-10',
    },
    {
        id: '2',
        name: 'Scale Top Performers',
        enabled: true,
        condition: { metric: 'roas', operator: '>', value: 3.0, timeframe: '7d' },
        action: { type: 'increase_budget', value: 20 },
        triggerCount: 5,
        createdAt: '2026-01-12',
    },
    {
        id: '3',
        name: 'Fatigue Detection',
        enabled: false,
        condition: { metric: 'ctr', operator: 'change_down', value: 20, timeframe: '3d' },
        action: { type: 'alert' },
        triggerCount: 0,
        createdAt: '2026-01-15',
    },
];

export const AutomatedRulesPanel = memo(function AutomatedRulesPanel({
    rules: initialRules,
    onSaveRule,
    onDeleteRule,
    onToggleRule,
}: AutomatedRulesPanelProps) {
    const [rules, setRules] = useState<AutomationRule[]>(initialRules || DEFAULT_RULES);
    const [isCreating, setIsCreating] = useState(false);
    const [newRule, setNewRule] = useState<Partial<AutomationRule>>({
        name: '',
        condition: { metric: 'roas', operator: '<', value: 1.0, timeframe: '3d' },
        action: { type: 'pause' },
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = useCallback(async (id: string, enabled: boolean) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, enabled } : r));
        if (onToggleRule) await onToggleRule(id, enabled);
        toast.success(enabled ? 'Regel aktiviert' : 'Regel deaktiviert');
    }, [onToggleRule]);

    const handleDelete = useCallback(async (id: string) => {
        setRules(prev => prev.filter(r => r.id !== id));
        if (onDeleteRule) await onDeleteRule(id);
        toast.success('Regel gelöscht');
    }, [onDeleteRule]);

    const handleCreateRule = useCallback(async () => {
        if (!newRule.name || !newRule.condition || !newRule.action) {
            toast.error('Bitte alle Felder ausfüllen');
            return;
        }

        setIsLoading(true);
        const rule: AutomationRule = {
            ...newRule as AutomationRule,
            id: `rule-${Date.now()}`,
            enabled: true,
            triggerCount: 0,
            createdAt: new Date().toISOString().split('T')[0],
        };

        setRules(prev => [...prev, rule]);
        if (onSaveRule) await onSaveRule(rule);

        setNewRule({
            name: '',
            condition: { metric: 'roas', operator: '<', value: 1.0, timeframe: '3d' },
            action: { type: 'pause' },
        });
        setIsCreating(false);
        setIsLoading(false);
        toast.success('Regel erstellt');
    }, [newRule, onSaveRule]);

    const enabledCount = rules.filter(r => r.enabled).length;
    const totalTriggers = rules.reduce((sum, r) => sum + r.triggerCount, 0);

    return (
        <Card className="relative overflow-hidden bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-950 border-white/5">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_60%)] blur-[60px]" />
            </div>

            <div className="relative p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <Workflow className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                Automation Rules
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                                    AGENCY PRO
                                </Badge>
                            </h3>
                            <p className="text-sm text-white/50">{enabledCount} aktiv · {totalTriggers} ausgelöst</p>
                        </div>
                    </div>

                    <Button
                        size="sm"
                        onClick={() => setIsCreating(!isCreating)}
                        className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 text-white"
                    >
                        <Plus className="w-4 h-4" />
                        Neue Regel
                    </Button>
                </div>

                {/* Create Rule Form */}
                {isCreating && (
                    <div className="mb-6 p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-blue-400" />
                            Neue Automatisierungsregel
                        </h4>

                        {/* Rule Name */}
                        <div className="mb-4">
                            <label className="text-xs text-white/50 mb-1 block">Regelname</label>
                            <input
                                type="text"
                                value={newRule.name}
                                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="z.B. Auto-Pause unprofitable Ads"
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>

                        {/* IF Condition */}
                        <div className="mb-4">
                            <label className="text-xs text-white/50 mb-2 block">IF (Bedingung)</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <select
                                    value={newRule.condition?.metric}
                                    onChange={(e) => setNewRule(prev => ({
                                        ...prev,
                                        condition: { ...prev.condition!, metric: e.target.value }
                                    }))}
                                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                >
                                    {METRICS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                                <select
                                    value={newRule.condition?.operator}
                                    onChange={(e) => setNewRule(prev => ({
                                        ...prev,
                                        condition: { ...prev.condition!, operator: e.target.value as any }
                                    }))}
                                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                >
                                    {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <input
                                    type="number"
                                    value={newRule.condition?.value}
                                    onChange={(e) => setNewRule(prev => ({
                                        ...prev,
                                        condition: { ...prev.condition!, value: parseFloat(e.target.value) }
                                    }))}
                                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                    step="0.1"
                                />
                                <select
                                    value={newRule.condition?.timeframe}
                                    onChange={(e) => setNewRule(prev => ({
                                        ...prev,
                                        condition: { ...prev.condition!, timeframe: e.target.value }
                                    }))}
                                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                >
                                    {TIMEFRAMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* THEN Action */}
                        <div className="mb-4">
                            <label className="text-xs text-white/50 mb-2 block">THEN (Aktion)</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {ACTIONS.map(action => {
                                    const Icon = action.icon;
                                    const isSelected = newRule.action?.type === action.value;
                                    return (
                                        <button
                                            key={action.value}
                                            onClick={() => setNewRule(prev => ({
                                                ...prev,
                                                action: { type: action.value as any, value: action.value.includes('budget') ? 20 : undefined }
                                            }))}
                                            className={`p-3 rounded-lg border text-left transition-all ${isSelected
                                                    ? 'bg-blue-500/20 border-blue-500/40'
                                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Icon className={`w-4 h-4 ${action.color}`} />
                                                <span className="text-sm text-white">{action.label}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Budget Value Input */}
                            {(newRule.action?.type === 'increase_budget' || newRule.action?.type === 'decrease_budget') && (
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-sm text-white/50">um</span>
                                    <input
                                        type="number"
                                        value={newRule.action?.value || 20}
                                        onChange={(e) => setNewRule(prev => ({
                                            ...prev,
                                            action: { ...prev.action!, value: parseInt(e.target.value) }
                                        }))}
                                        className="w-20 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                    />
                                    <span className="text-sm text-white/50">%</span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                onClick={handleCreateRule}
                                disabled={isLoading || !newRule.name}
                                className="gap-2 bg-blue-600 hover:bg-blue-700"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Regel erstellen
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsCreating(false)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Rules List */}
                <div className="space-y-3">
                    {rules.length === 0 ? (
                        <div className="text-center py-8">
                            <Workflow className="w-12 h-12 text-white/20 mx-auto mb-3" />
                            <p className="text-white/50">Keine Regeln konfiguriert</p>
                        </div>
                    ) : (
                        rules.map((rule) => {
                            const actionConfig = ACTIONS.find(a => a.value === rule.action.type);
                            const ActionIcon = actionConfig?.icon || Zap;

                            return (
                                <div
                                    key={rule.id}
                                    className={`p-4 rounded-xl border transition-all ${rule.enabled
                                            ? 'bg-blue-500/5 border-blue-500/20'
                                            : 'bg-white/5 border-white/10 opacity-60'
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl ${rule.enabled ? 'bg-blue-500/20 border-blue-500/30' : 'bg-white/5 border-white/10'} border flex items-center justify-center shrink-0`}>
                                                <ActionIcon className={`w-5 h-5 ${rule.enabled ? actionConfig?.color : 'text-white/30'}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-semibold text-white truncate">{rule.name}</h4>
                                                <p className="text-xs text-white/50">
                                                    IF {rule.condition.metric} {rule.condition.operator} {rule.condition.value} ({rule.condition.timeframe})
                                                    → {actionConfig?.label}
                                                    {rule.action.value && ` ${rule.action.value}%`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            {rule.triggerCount > 0 && (
                                                <Badge variant="outline" className="text-xs hidden sm:block">
                                                    {rule.triggerCount}x
                                                </Badge>
                                            )}
                                            <Switch
                                                checked={rule.enabled}
                                                onCheckedChange={(checked) => handleToggle(rule.id, checked)}
                                            />
                                            <button
                                                onClick={() => handleDelete(rule.id)}
                                                className="p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
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
        </Card>
    );
});
