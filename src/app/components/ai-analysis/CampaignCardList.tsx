import {
    ChevronDown,
    ChevronRight,
    Target,
    Users,
    Activity,
} from 'lucide-react';
import { Card } from '../ui/card';
import { SelectField } from '../ui/select-field';
import type { Campaign, RecommendationStyle } from './types';
import { getStatusColor } from './types';

interface Strategy {
    id: string;
    title: string;
}

interface CampaignCardListProps {
    campaigns: Campaign[];
    strategies: Strategy[];
    onToggleCampaign: (campaignId: string) => void;
    onToggleAdSet: (campaignId: string, adSetId: string) => void;
    onStrategyChange: (itemId: string, strategyId: string, level: 'campaign' | 'adset' | 'ad') => void;
    getRecommendationStyle: (recommendation: string) => RecommendationStyle;
}

export function CampaignCardList({
    campaigns,
    strategies,
    onToggleCampaign,
    onToggleAdSet,
    onStrategyChange,
    getRecommendationStyle,
}: CampaignCardListProps) {
    return (
        <div className="lg:hidden space-y-3">
            {campaigns.length === 0 ? (
                <Card className="p-6 text-center text-muted-foreground">
                    Keine Kampagnen gefunden. Verbinde Meta oder starte einen Sync.
                </Card>
            ) : (
                campaigns.map((campaign) => (
                    <Card key={campaign.id} className="overflow-hidden p-0">
                        <div className="p-4">
                            <div className="flex items-start gap-3 min-w-0">
                                <button
                                    onClick={() => onToggleCampaign(campaign.id)}
                                    className="p-1 hover:bg-muted/50 rounded shrink-0"
                                >
                                    {campaign.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Target className="w-4 h-4 text-primary shrink-0" />
                                        <div className="font-semibold text-foreground truncate">{campaign.name}</div>
                                    </div>

                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(campaign.status)}`}>
                                            {campaign.status}
                                        </span>
                                        <span className="text-xs text-muted-foreground">Impr: <span className="text-foreground font-mono">{(campaign.impressions / 1000000).toFixed(2)}M</span></span>
                                        <span className="text-xs text-muted-foreground">CTR: <span className="text-foreground font-mono">{campaign.ctr.toFixed(2)}%</span></span>
                                        <span className="text-xs text-muted-foreground">ROAS: <span className="text-foreground font-mono font-bold">{campaign.roas.toFixed(2)}x</span></span>
                                        <span className="text-xs text-muted-foreground">Spend: <span className="text-foreground font-mono">€{(campaign.spend / 1000).toFixed(1)}K</span></span>
                                    </div>

                                    <div className="mt-3">
                                        <SelectField
                                            value={campaign.strategyId || ''}
                                            onChange={(e) => onStrategyChange(campaign.id, e.target.value, 'campaign')}
                                            className="bg-muted/50 text-sm py-2 px-3 rounded-lg"
                                        >
                                            <option value="">No Strategy</option>
                                            {strategies.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                        </SelectField>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expanded: AdSets/Ads as Cards */}
                        {campaign.expanded && (
                            <div className="border-t border-border/30">
                                {campaign.adSets.map((adSet) => (
                                    <div key={adSet.id} className="p-4 border-b border-border/20">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <button
                                                onClick={() => onToggleAdSet(campaign.id, adSet.id)}
                                                className="p-1 hover:bg-muted/50 rounded shrink-0"
                                            >
                                                {adSet.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </button>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Users className="w-4 h-4 text-blue-500 shrink-0" />
                                                    <div className="font-medium text-foreground truncate">{adSet.name}</div>
                                                </div>

                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(adSet.status)}`}>
                                                        {adSet.status}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">ROAS: <span className="text-foreground font-mono font-bold">{adSet.roas.toFixed(2)}x</span></span>
                                                    <span className="text-xs text-muted-foreground">Spend: <span className="text-foreground font-mono">€{(adSet.spend / 1000).toFixed(1)}K</span></span>
                                                </div>

                                                <div className="mt-3">
                                                    <SelectField
                                                        value={adSet.strategyId || campaign.strategyId || ''}
                                                        onChange={(e) => onStrategyChange(adSet.id, e.target.value, 'adset')}
                                                        className="bg-muted/50 text-sm py-2 px-3 rounded-lg"
                                                    >
                                                        <option value="">Inherit</option>
                                                        {strategies.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                                    </SelectField>
                                                </div>

                                                {adSet.expanded && (
                                                    <div className="mt-3 space-y-2">
                                                        {adSet.ads.map((ad) => {
                                                            const recStyle = getRecommendationStyle(ad.aiAnalysis.recommendation);
                                                            return (
                                                                <div key={ad.id} className="rounded-xl border border-border/40 bg-muted/10 p-3">
                                                                    <div className="flex items-start gap-2 min-w-0">
                                                                        <Activity className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="font-medium text-foreground truncate">{ad.name}</div>
                                                                            <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                                                                <span className={`px-2 py-1 rounded-full ${getStatusColor(ad.status)}`}>{ad.status}</span>
                                                                                <span className="text-muted-foreground">CTR <span className="text-foreground font-mono">{ad.ctr.toFixed(2)}%</span></span>
                                                                                <span className="text-muted-foreground">ROAS <span className="text-foreground font-mono font-bold">{ad.roas.toFixed(2)}x</span></span>
                                                                            </div>
                                                                            <div className="mt-2">
                                                                                <SelectField
                                                                                    value={ad.strategyId || adSet.strategyId || campaign.strategyId || ''}
                                                                                    onChange={(e) => onStrategyChange(ad.id, e.target.value, 'ad')}
                                                                                    className="bg-muted/50 text-sm py-2 px-3 rounded-lg"
                                                                                >
                                                                                    <option value="">Inherit</option>
                                                                                    {strategies.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                                                                </SelectField>
                                                                            </div>
                                                                        </div>

                                                                        <div className="shrink-0">
                                                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${recStyle.border} ${recStyle.bg}`} style={{ color: recStyle.color }}>
                                                                                {recStyle.label}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                ))
            )}
        </div>
    );
}
