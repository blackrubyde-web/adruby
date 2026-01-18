import { useCampaignBuilder } from '../CampaignBuilderContext';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Users, ShoppingBag, MousePointerClick, Megaphone, Sparkles, DollarSign, Target, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';

const OBJECTIVES = [
    { id: 'OUTCOME_SALES', label: 'Sales', description: 'Conversions & Käufe steigern', icon: ShoppingBag, color: 'from-rose-500 to-pink-600' },
    { id: 'OUTCOME_LEADS', label: 'Leads', description: 'Kontakte & Anfragen sammeln', icon: Users, color: 'from-violet-500 to-purple-600' },
    { id: 'OUTCOME_TRAFFIC', label: 'Traffic', description: 'Website-Besucher erhöhen', icon: MousePointerClick, color: 'from-blue-500 to-cyan-600' },
    { id: 'OUTCOME_AWARENESS', label: 'Awareness', description: 'Markenbekanntheit aufbauen', icon: Megaphone, color: 'from-amber-500 to-orange-600' },
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
        <div className="space-y-8">
            {/* Campaign Name - Premium Input */}
            <Card className="p-6 bg-gradient-to-br from-card to-muted/20">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Kampagnen-Name</h3>
                        <p className="text-xs text-muted-foreground">Gib deiner Kampagne einen eindeutigen Namen</p>
                    </div>
                </div>
                <Input
                    value={campaignSetup.name}
                    onChange={e => updateField('name', e.target.value)}
                    placeholder="z.B. Summer Sale 2026, Black Friday Push..."
                    className="h-14 text-lg font-medium bg-background/50"
                />
            </Card>

            {/* Objective Selection */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold">Kampagnenziel</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {OBJECTIVES.map((obj) => {
                        const isSelected = campaignSetup.objective === obj.id;
                        const Icon = obj.icon;
                        return (
                            <div
                                key={obj.id}
                                onClick={() => updateField('objective', obj.id)}
                                className={cn(
                                    "relative group cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-300 p-6 flex flex-col items-center text-center gap-4 hover:scale-[1.02]",
                                    isSelected
                                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                                        : "border-border bg-card hover:border-primary/50"
                                )}
                            >
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-inner text-white transition-transform",
                                    obj.color,
                                    isSelected && "scale-110"
                                )}>
                                    <Icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{obj.label}</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">{obj.description}</p>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-3 right-3">
                                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Budget Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Budget Type & Amount */}
                <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <DollarSign className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <h3 className="font-bold">Budget</h3>
                            <p className="text-xs text-muted-foreground">Budget-Typ und Betrag festlegen</p>
                        </div>
                    </div>

                    {/* Budget Type Toggle */}
                    <div className="flex bg-muted/50 p-1 rounded-xl">
                        {(['daily', 'lifetime'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => updateField('budgetType', type)}
                                className={cn(
                                    "flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all",
                                    campaignSetup.budgetType === type
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {type === 'daily' ? 'Tagesbudget' : 'Laufzeit-Budget'}
                            </button>
                        ))}
                    </div>

                    {/* Budget Amount */}
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">€</span>
                        <Input
                            type="number"
                            value={campaignSetup.budgetType === 'daily' ? campaignSetup.dailyBudget : campaignSetup.lifetimeBudget}
                            onChange={e => updateField(
                                campaignSetup.budgetType === 'daily' ? 'dailyBudget' : 'lifetimeBudget',
                                parseFloat(e.target.value) || 0
                            )}
                            placeholder={campaignSetup.budgetType === 'daily' ? '50' : '500'}
                            className="h-14 text-2xl font-bold pl-10"
                        />
                    </div>

                    <p className="text-xs text-muted-foreground">
                        {campaignSetup.budgetType === 'daily'
                            ? `≈ €${(campaignSetup.dailyBudget * 30).toFixed(0)} pro Monat`
                            : `Budget für gesamte Laufzeit`}
                    </p>
                </Card>

                {/* Bid Strategy */}
                <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Target className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="font-bold">Gebotsstrategie</h3>
                            <p className="text-xs text-muted-foreground">Wie soll Meta dein Budget ausgeben?</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {BID_STRATEGIES.map((strategy) => (
                            <button
                                key={strategy.id}
                                onClick={() => updateField('bidStrategy', strategy.id)}
                                className={cn(
                                    "w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between",
                                    campaignSetup.bidStrategy === strategy.id
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-border hover:border-primary/50"
                                )}
                            >
                                <div>
                                    <div className="font-semibold text-sm flex items-center gap-2">
                                        {strategy.label}
                                        {'recommended' in strategy && strategy.recommended && (
                                            <Badge variant="secondary" className="text-[10px]">Empfohlen</Badge>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{strategy.description}</div>
                                </div>
                                <div className={cn(
                                    "w-4 h-4 rounded-full border-2 transition-all",
                                    campaignSetup.bidStrategy === strategy.id
                                        ? "border-primary bg-primary"
                                        : "border-muted-foreground"
                                )} />
                            </button>
                        ))}
                    </div>

                    {/* ROAS Goal Input (conditional) */}
                    {campaignSetup.bidStrategy === 'ROAS_GOAL' && (
                        <div className="pt-2">
                            <label className="text-xs font-semibold text-muted-foreground mb-2 block">ROAS Ziel</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={campaignSetup.roasGoal || 3.0}
                                    onChange={e => updateField('roasGoal', parseFloat(e.target.value) || 3.0)}
                                    className="pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">x</span>
                            </div>
                        </div>
                    )}

                    {/* Cost Cap Input (conditional) */}
                    {campaignSetup.bidStrategy === 'COST_CAP' && (
                        <div className="pt-2">
                            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Max. Kosten pro Ergebnis</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                                <Input
                                    type="number"
                                    value={campaignSetup.costCap || 10}
                                    onChange={e => updateField('costCap', parseFloat(e.target.value) || 10)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Attribution Window */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-violet-500/10 rounded-lg">
                        <Clock className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                        <h3 className="font-bold">Attribution Window</h3>
                        <p className="text-xs text-muted-foreground">Zeitraum für Conversion-Zuordnung</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {ATTRIBUTION_WINDOWS.map((window) => (
                        <button
                            key={window.id}
                            onClick={() => updateField('attribution', window.id)}
                            className={cn(
                                "px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                                campaignSetup.attribution === window.id
                                    ? "border-violet-500 bg-violet-500/10 text-violet-600"
                                    : "border-border hover:border-violet-500/50"
                            )}
                        >
                            {window.label}
                        </button>
                    ))}
                </div>
            </Card>
        </div>
    );
};
