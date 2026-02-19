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
import { getStatusColor, getPerformanceColor } from './types';

interface Strategy {
    id: string;
    title: string;
}

interface CampaignTableProps {
    campaigns: Campaign[];
    strategies: Strategy[];
    onToggleCampaign: (campaignId: string) => void;
    onToggleAdSet: (campaignId: string, adSetId: string) => void;
    onStrategyChange: (itemId: string, strategyId: string, level: 'campaign' | 'adset' | 'ad') => void;
    getRecommendationStyle: (recommendation: string) => RecommendationStyle;
}

export function CampaignTable({
    campaigns,
    strategies,
    onToggleCampaign,
    onToggleAdSet,
    onStrategyChange,
    getRecommendationStyle,
}: CampaignTableProps) {
    return (
        <Card className="hidden lg:block overflow-hidden p-0">
            {/* Table Header */}
            <div className="bg-muted/30 border-b border-border/30 p-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-muted-foreground">
                    <div className="col-span-3">Campaign / Ad Set / Ad</div>
                    <div className="col-span-1 text-center">Status</div>
                    <div className="col-span-1 text-right">Impressions</div>
                    <div className="col-span-1 text-right">CTR</div>
                    <div className="col-span-1 text-right">CPC</div>
                    <div className="col-span-1 text-right">Conv.</div>
                    <div className="col-span-1 text-right">Spend</div>
                    <div className="col-span-1 text-right">ROAS</div>
                    <div className="col-span-1 text-center">Score</div>
                    <div className="col-span-1 text-center">Strategy</div>
                </div>
            </div>

            {/* Campaign Rows */}
            {campaigns.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground">
                    Keine Kampagnen gefunden. Verbinde Meta oder starte einen Sync.
                </div>
            ) : (
                <div className="divide-y divide-border/30">
                    {campaigns.map((campaign) => (
                        <div key={campaign.id}>
                            {/* Campaign Row */}
                            <div className="hover:bg-muted/20 transition-colors">
                                <div className="p-4">
                                    <div className="grid grid-cols-12 gap-4 items-center text-sm">
                                        <div className="col-span-3 flex items-center gap-2">
                                            <button
                                                onClick={() => onToggleCampaign(campaign.id)}
                                                className="p-1 hover:bg-muted/50 rounded transition-colors"
                                            >
                                                {campaign.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </button>
                                            <Target className="w-4 h-4 text-primary" />
                                            <span className="font-semibold text-foreground">{campaign.name}</span>
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(campaign.status)}`}>
                                                {campaign.status}
                                            </span>
                                        </div>
                                        <div className="col-span-1 text-right font-mono text-foreground">{(campaign.impressions / 1000000).toFixed(2)}M</div>
                                        <div className="col-span-1 text-right font-mono text-foreground">{campaign.ctr.toFixed(2)}%</div>
                                        <div className="col-span-1 text-right font-mono text-foreground">€{campaign.cpc.toFixed(2)}</div>
                                        <div className="col-span-1 text-right font-mono text-foreground">{campaign.conversions}</div>
                                        <div className="col-span-1 text-right font-mono text-foreground">€{(campaign.spend / 1000).toFixed(1)}K</div>
                                        <div className="col-span-1 text-right font-mono font-bold text-foreground">{campaign.roas.toFixed(2)}x</div>
                                        <div className="col-span-1 flex justify-center">
                                            <span className={`font-bold ${getPerformanceColor(campaign.performanceScore)}`}>
                                                {campaign.performanceScore}
                                            </span>
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <SelectField
                                                value={campaign.strategyId || ''}
                                                onChange={(e) => onStrategyChange(campaign.id, e.target.value, 'campaign')}
                                                className="bg-muted/50 px-2 py-1 pr-7 text-xs rounded-md"
                                                iconClassName="h-3 w-3 right-2"
                                            >
                                                <option value="">No Strategy</option>
                                                {strategies.map(s => (
                                                    <option key={s.id} value={s.id}>{s.title}</option>
                                                ))}
                                            </SelectField>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ad Sets (if expanded) */}
                            {campaign.expanded && campaign.adSets.map((adSet) => (
                                <div key={adSet.id}>
                                    <div className="bg-muted/10 hover:bg-muted/20 transition-colors">
                                        <div className="p-4 pl-12">
                                            <div className="grid grid-cols-12 gap-4 items-center text-sm">
                                                <div className="col-span-3 flex items-center gap-2">
                                                    <button
                                                        onClick={() => onToggleAdSet(campaign.id, adSet.id)}
                                                        className="p-1 hover:bg-muted/50 rounded transition-colors"
                                                    >
                                                        {adSet.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                    </button>
                                                    <Users className="w-4 h-4 text-blue-500" />
                                                    <span className="font-medium text-foreground">{adSet.name}</span>
                                                </div>
                                                <div className="col-span-1 flex justify-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(adSet.status)}`}>
                                                        {adSet.status}
                                                    </span>
                                                </div>
                                                <div className="col-span-1 text-right font-mono text-muted-foreground">{(adSet.impressions / 1000000).toFixed(2)}M</div>
                                                <div className="col-span-1 text-right font-mono text-muted-foreground">{adSet.ctr.toFixed(2)}%</div>
                                                <div className="col-span-1 text-right font-mono text-muted-foreground">€{adSet.cpc.toFixed(2)}</div>
                                                <div className="col-span-1 text-right font-mono text-muted-foreground">{adSet.conversions}</div>
                                                <div className="col-span-1 text-right font-mono text-muted-foreground">€{(adSet.spend / 1000).toFixed(1)}K</div>
                                                <div className="col-span-1 text-right font-mono font-bold text-muted-foreground">{adSet.roas.toFixed(2)}x</div>
                                                <div className="col-span-1 flex justify-center">
                                                    <span className={`font-bold ${getPerformanceColor(adSet.performanceScore)}`}>
                                                        {adSet.performanceScore}
                                                    </span>
                                                </div>
                                                <div className="col-span-1 flex justify-center">
                                                    <SelectField
                                                        value={adSet.strategyId || campaign.strategyId || ''}
                                                        onChange={(e) => onStrategyChange(adSet.id, e.target.value, 'adset')}
                                                        className="bg-muted/50 px-2 py-1 pr-7 text-xs rounded-md"
                                                        iconClassName="h-3 w-3 right-2"
                                                    >
                                                        <option value="">Inherit</option>
                                                        {strategies.map(s => (
                                                            <option key={s.id} value={s.id}>{s.title}</option>
                                                        ))}
                                                    </SelectField>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ads (if expanded) */}
                                    {adSet.expanded && adSet.ads.map((ad) => {
                                        const recStyle = getRecommendationStyle(ad.aiAnalysis.recommendation);

                                        return (
                                            <div key={ad.id} className="bg-muted/5 hover:bg-muted/15 transition-colors border-l-4" style={{ borderColor: recStyle.color }}>
                                                <div className="p-4 pl-20">
                                                    <div className="grid grid-cols-12 gap-4 items-center text-sm">
                                                        <div className="col-span-3 flex items-center gap-2">
                                                            <Activity className="w-4 h-4 text-green-500" />
                                                            <span className="text-foreground">{ad.name}</span>
                                                            <div className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${recStyle.bg} border ${recStyle.border}`} style={{ color: recStyle.color }}>
                                                                {recStyle.icon}
                                                                {recStyle.label}
                                                            </div>
                                                        </div>
                                                        <div className="col-span-1 flex justify-center">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ad.status)}`}>
                                                                {ad.status}
                                                            </span>
                                                        </div>
                                                        <div className="col-span-1 text-right font-mono text-muted-foreground">{(ad.impressions / 1000).toFixed(0)}K</div>
                                                        <div className="col-span-1 text-right font-mono text-muted-foreground">{ad.ctr.toFixed(2)}%</div>
                                                        <div className="col-span-1 text-right font-mono text-muted-foreground">€{ad.cpc.toFixed(2)}</div>
                                                        <div className="col-span-1 text-right font-mono text-muted-foreground">{ad.conversions}</div>
                                                        <div className="col-span-1 text-right font-mono text-muted-foreground">€{(ad.spend / 1000).toFixed(1)}K</div>
                                                        <div className="col-span-1 text-right font-mono font-bold text-muted-foreground">{ad.roas.toFixed(2)}x</div>
                                                        <div className="col-span-1 flex justify-center">
                                                            <span className={`font-bold ${getPerformanceColor(ad.performanceScore)}`}>
                                                                {ad.performanceScore}
                                                            </span>
                                                        </div>
                                                        <div className="col-span-1 flex justify-center">
                                                            <SelectField
                                                                value={ad.strategyId || adSet.strategyId || campaign.strategyId || ''}
                                                                onChange={(e) => onStrategyChange(ad.id, e.target.value, 'ad')}
                                                                className="bg-muted/50 px-2 py-1 pr-7 text-xs rounded-md"
                                                                iconClassName="h-3 w-3 right-2"
                                                            >
                                                                <option value="">Inherit</option>
                                                                {strategies.map(s => (
                                                                    <option key={s.id} value={s.id}>{s.title}</option>
                                                                ))}
                                                            </SelectField>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
