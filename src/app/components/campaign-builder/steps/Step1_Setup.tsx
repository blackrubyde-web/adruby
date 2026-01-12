import { useCampaignBuilder } from '../CampaignBuilderContext';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card } from '../../ui/card';
import { Users, ShoppingBag, MousePointerClick, Megaphone, ArrowRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

const OBJECTIVES = [
    { id: 'OUTCOME_SALES', label: 'Sales', description: 'Drive conversions and sales', icon: ShoppingBag, color: 'from-pink-500 to-rose-500' },
    { id: 'OUTCOME_LEADS', label: 'Leads', description: 'Collect leads for your business', icon: Users, color: 'from-violet-500 to-purple-500' },
    { id: 'OUTCOME_TRAFFIC', label: 'Traffic', description: 'Send people to your website', icon: MousePointerClick, color: 'from-blue-500 to-cyan-500' },
    { id: 'OUTCOME_AWARENESS', label: 'Awareness', description: 'Show your ads to people who are most likely to remember them', icon: Megaphone, color: 'from-amber-500 to-orange-500' },
];

export const Step1_Setup = () => {
    const { campaignSpec, setCampaignSpec, handleNext } = useCampaignBuilder();

    const selectedObjective = campaignSpec.campaign.objective || 'OUTCOME_SALES';

    const setObjective = (obj: string) => {
        setCampaignSpec(prev => ({
            ...prev,
            campaign: { ...prev.campaign, objective: obj }
        }));
    };

    const setName = (name: string) => {
        setCampaignSpec(prev => ({ ...prev, campaign: { ...prev.campaign, name } }));
    };

    const setBudget = (budget: string) => {
        setCampaignSpec(prev => ({ ...prev, campaign: { ...prev.campaign, daily_budget: budget } }));
    };

    return (
        <div className="space-y-8">
            {/* 1. Campaign Name & Budget */}
            <Card className="p-8 space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Campaign Name</label>
                        <Input
                            value={campaignSpec.campaign.name || ''}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Summer Sale 2026"
                            className="h-12 text-lg"
                        />
                    </div>
                    <div className="w-full md:w-1/3 space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Daily Budget</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">€</span>
                            <Input
                                value={campaignSpec.campaign.daily_budget || ''}
                                onChange={e => setBudget(e.target.value)}
                                placeholder="50.00"
                                className="h-12 text-lg pl-8"
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* 2. Objective Selection */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold">Select Objective</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {OBJECTIVES.map((obj) => {
                        const isSelected = selectedObjective === obj.id;
                        const Icon = obj.icon;
                        return (
                            <div
                                key={obj.id}
                                onClick={() => setObjective(obj.id)}
                                className={cn(
                                    "relative group cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-300 p-6 flex flex-col items-center text-center gap-4 hover:scale-[1.02]",
                                    isSelected
                                        ? "border-primary bg-primary/5 shadow-warm"
                                        : "border-border bg-card hover:border-primary/50"
                                )}
                            >
                                <div className={cn(
                                    "w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br shadow-inner text-white",
                                    obj.color
                                )}>
                                    <Icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{obj.label}</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed mt-2">{obj.description}</p>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-3 right-3 text-primary">
                                        <div className="w-3 h-3 rounded-full bg-primary" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-end pt-8">
                <Button size="lg" onClick={handleNext} className="gap-2 px-8">
                    Continue <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};
