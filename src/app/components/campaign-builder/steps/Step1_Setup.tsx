import { useCampaignBuilder } from '../CampaignBuilderContext';
import { Input } from '../../ui/input';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Users, ShoppingBag, MousePointerClick, Megaphone, DollarSign, Target, Clock, Link2, AlertTriangle, Check, FlaskConical } from 'lucide-react';
import { cn } from '../../../lib/utils';

const OBJECTIVES = [
    { id: 'OUTCOME_SALES', label: 'Sales', description: 'Conversions & Käufe', icon: ShoppingBag },
    { id: 'OUTCOME_LEADS', label: 'Leads', description: 'Kontakte sammeln', icon: Users },
    { id: 'OUTCOME_TRAFFIC', label: 'Traffic', description: 'Website-Besucher', icon: MousePointerClick },
    { id: 'OUTCOME_AWARENESS', label: 'Awareness', description: 'Markenbekanntheit', icon: Megaphone },
] as const;

const BID_STRATEGIES = [
    { id: 'LOWEST_COST', label: 'Lowest Cost', description: 'Maximale Ergebnisse zum besten Preis', recommended: true },
    { id: 'COST_CAP', label: 'Cost Cap', description: 'Kosten unter Ziel halten' },
    { id: 'BID_CAP', label: 'Bid Cap', description: 'Maximales Gebot festlegen' },
    { id: 'ROAS_GOAL', label: 'ROAS Goal', description: 'Return on Ad Spend Ziel' },
] as const;

const ATTRIBUTION_WINDOWS = [
    { id: '7d_click', label: '7-Day Click' },
    { id: '7d_click_1d_view', label: '7-Day Click, 1-Day View' },
    { id: '1d_click', label: '1-Day Click' },
] as const;

export const Step1_Setup = () => {
    const { campaignSetup, setCampaignSetup } = useCampaignBuilder();

    const updateField = <K extends keyof typeof campaignSetup>(key: K, value: typeof campaignSetup[K]) => {
        setCampaignSetup(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-10">
            {/* ── Name & URL ─────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Kampagnen-Name</label>
                    <Input
                        value={campaignSetup.name}
                        onChange={e => updateField('name', e.target.value)}
                        placeholder="z.B. Summer Sale 2026"
                        className="h-11 bg-card border-border"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Ziel-URL</label>
                    <Input
                        value={campaignSetup.destinationUrl}
                        onChange={e => updateField('destinationUrl', e.target.value)}
                        placeholder="https://dein-shop.de/produkt"
                        className="h-11 bg-card border-border"
                        type="url"
                    />
                    {campaignSetup.destinationUrl && !campaignSetup.destinationUrl.startsWith('http') && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> URL muss mit https:// beginnen
                        </p>
                    )}
                </div>
            </div>

            {/* ── Objective ──────────────────────────────────── */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Kampagnenziel</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {OBJECTIVES.map((obj) => {
                        const isSelected = campaignSetup.objective === obj.id;
                        const Icon = obj.icon;
                        return (
                            <button
                                key={obj.id}
                                onClick={() => updateField('objective', obj.id)}
                                className={cn(
                                    "relative text-left p-4 rounded-xl border transition-all duration-200 group",
                                    isSelected
                                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                        : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
                                )}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Icon className={cn(
                                        "w-4 h-4 transition-colors",
                                        isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                    )} />
                                    <span className={cn(
                                        "text-sm font-semibold",
                                        isSelected ? "text-foreground" : "text-foreground"
                                    )}>{obj.label}</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{obj.description}</p>
                                {isSelected && (
                                    <div className="absolute top-3 right-3">
                                        <Check className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Budget & Bid Strategy ──────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Budget */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium text-foreground">Budget</h3>
                    </div>

                    <div className="flex bg-muted/40 p-0.5 rounded-lg">
                        {(['daily', 'lifetime'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => updateField('budgetType', type)}
                                className={cn(
                                    "flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all",
                                    campaignSetup.budgetType === type
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {type === 'daily' ? 'Tagesbudget' : 'Laufzeit-Budget'}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">€</span>
                        <Input
                            type="number"
                            value={campaignSetup.budgetType === 'daily' ? campaignSetup.dailyBudget : campaignSetup.lifetimeBudget}
                            onChange={e => updateField(
                                campaignSetup.budgetType === 'daily' ? 'dailyBudget' : 'lifetimeBudget',
                                parseFloat(e.target.value) || 0
                            )}
                            placeholder={campaignSetup.budgetType === 'daily' ? '50' : '500'}
                            className="h-11 text-lg font-semibold pl-8 bg-card"
                        />
                    </div>

                    <p className="text-xs text-muted-foreground">
                        {campaignSetup.budgetType === 'daily'
                            ? `≈ €${(campaignSetup.dailyBudget * 30).toFixed(0)} pro Monat`
                            : `Budget für gesamte Laufzeit`}
                    </p>
                    {campaignSetup.budgetType === 'daily' && campaignSetup.dailyBudget > 0 && campaignSetup.dailyBudget < 1 && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Meta Minimum: €1/Tag
                        </p>
                    )}
                </div>

                {/* Bid Strategy */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium text-foreground">Gebotsstrategie</h3>
                    </div>

                    <div className="space-y-1.5">
                        {BID_STRATEGIES.map((strategy) => (
                            <button
                                key={strategy.id}
                                onClick={() => updateField('bidStrategy', strategy.id)}
                                className={cn(
                                    "w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between group",
                                    campaignSetup.bidStrategy === strategy.id
                                        ? "border-primary/40 bg-primary/5"
                                        : "border-border/50 bg-card hover:border-border hover:bg-muted/20"
                                )}
                            >
                                <div className="min-w-0">
                                    <div className="text-sm font-medium flex items-center gap-2">
                                        {strategy.label}
                                        {'recommended' in strategy && strategy.recommended && (
                                            <Badge variant="secondary" className="text-[10px] py-0">Empfohlen</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">{strategy.description}</p>
                                </div>
                                <div className={cn(
                                    "w-4 h-4 rounded-full border-2 shrink-0 ml-3 transition-all flex items-center justify-center",
                                    campaignSetup.bidStrategy === strategy.id
                                        ? "border-primary bg-primary"
                                        : "border-border"
                                )}>
                                    {campaignSetup.bidStrategy === strategy.id && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Conditional inputs */}
                    {campaignSetup.bidStrategy === 'ROAS_GOAL' && (
                        <div className="space-y-1.5 pt-1">
                            <label className="text-xs font-medium text-muted-foreground">ROAS Ziel</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={campaignSetup.roasGoal || 3.0}
                                    onChange={e => updateField('roasGoal', parseFloat(e.target.value) || 3.0)}
                                    className="pr-8 h-9 bg-card"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">x</span>
                            </div>
                        </div>
                    )}
                    {campaignSetup.bidStrategy === 'COST_CAP' && (
                        <div className="space-y-1.5 pt-1">
                            <label className="text-xs font-medium text-muted-foreground">Max. Kosten pro Ergebnis</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
                                <Input
                                    type="number"
                                    value={campaignSetup.costCap || 10}
                                    onChange={e => updateField('costCap', parseFloat(e.target.value) || 10)}
                                    className="pl-7 h-9 bg-card"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Attribution & A/B Test ──────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attribution */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium text-foreground">Attribution Window</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {ATTRIBUTION_WINDOWS.map((window) => (
                            <button
                                key={window.id}
                                onClick={() => updateField('attribution', window.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                                    campaignSetup.attribution === window.id
                                        ? "border-primary/40 bg-primary/5 text-foreground"
                                        : "border-border/50 bg-card text-muted-foreground hover:text-foreground hover:border-border"
                                )}
                            >
                                {window.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* A/B Test */}
                <div
                    className={cn(
                        "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all",
                        campaignSetup.publishMode === 'draft'
                            ? "border-primary/30 bg-primary/5"
                            : "border-border/50 bg-card hover:border-border"
                    )}
                    onClick={() => updateField('publishMode', campaignSetup.publishMode === 'publish' ? 'draft' : 'publish')}
                >
                    <div className="flex items-center gap-3">
                        <FlaskConical className={cn(
                            "w-4 h-4",
                            campaignSetup.publishMode === 'draft' ? "text-primary" : "text-muted-foreground"
                        )} />
                        <div>
                            <div className="text-sm font-medium text-foreground flex items-center gap-2">
                                A/B Test Modus
                                {campaignSetup.publishMode === 'draft' && (
                                    <Badge variant="secondary" className="text-[10px] py-0">Draft</Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">Als Draft für Testing speichern</p>
                        </div>
                    </div>
                    <div className={cn(
                        "w-9 h-5 rounded-full transition-all relative shrink-0",
                        campaignSetup.publishMode === 'draft' ? "bg-primary" : "bg-muted"
                    )}>
                        <div className={cn(
                            "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all",
                            campaignSetup.publishMode === 'draft' ? "left-4.5" : "left-0.5"
                        )} />
                    </div>
                </div>
            </div>
        </div>
    );
};
