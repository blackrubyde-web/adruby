import { memo } from 'react';
import { Settings, Target, Users, DollarSign, MapPin, Image, Type, Link2, Sparkles, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useCampaignCanvas } from './CampaignCanvasContext';
import type { AdSetNodeData, AdNodeData, CampaignObjective, BidStrategy } from './types';

const OBJECTIVES: { value: CampaignObjective; label: string; icon: string }[] = [
    { value: 'CONVERSIONS', label: 'Conversions', icon: '🎯' },
    { value: 'TRAFFIC', label: 'Traffic', icon: '🔗' },
    { value: 'AWARENESS', label: 'Brand Awareness', icon: '👁️' },
    { value: 'ENGAGEMENT', label: 'Engagement', icon: '💬' },
    { value: 'LEADS', label: 'Lead Generation', icon: '📋' },
    { value: 'APP_INSTALLS', label: 'App Installs', icon: '📱' },
];

const BID_STRATEGIES: { value: BidStrategy; label: string }[] = [
    { value: 'LOWEST_COST', label: 'Lowest Cost' },
    { value: 'COST_CAP', label: 'Cost Cap' },
    { value: 'BID_CAP', label: 'Bid Cap' },
    { value: 'MINIMUM_ROAS', label: 'Minimum ROAS' },
];

export const PropertiesPanel = memo(function PropertiesPanel() {
    const { selectedNode, updateNodeData, aiAnalysis, isAnalyzing, runAIAnalysis } = useCampaignCanvas();

    if (!selectedNode) {
        return (
            <div className="w-80 bg-card border-l border-border flex flex-col items-center justify-center p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Settings className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-muted-foreground mb-1">No Selection</h3>
                <p className="text-xs text-muted-foreground/60">Click on a node to edit its properties</p>
            </div>
        );
    }

    const nodeData = selectedNode.data;

    // Campaign properties
    if (nodeData.type === 'campaign') {
        const config = nodeData.config;
        return (
            <div className="w-80 bg-card border-l border-border flex flex-col h-full overflow-y-auto">
                <div className="p-4 border-b border-border flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold">Campaign Settings</h3>
                </div>

                <div className="p-4 space-y-5 flex-1">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Campaign Name</label>
                        <input
                            type="text"
                            value={config.name}
                            onChange={(e) => updateNodeData(selectedNode.id, { type: 'campaign', config: { ...config, name: e.target.value } })}
                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    {/* Objective */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Objective</label>
                        <select
                            value={config.objective}
                            onChange={(e) => updateNodeData(selectedNode.id, { type: 'campaign', config: { ...config, objective: e.target.value as CampaignObjective } })}
                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            {OBJECTIVES.map((o) => (
                                <option key={o.value} value={o.value}>{o.icon} {o.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Budget */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> Budget
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={config.budgetType}
                                onChange={(e) => updateNodeData(selectedNode.id, { type: 'campaign', config: { ...config, budgetType: e.target.value as 'daily' | 'lifetime' } })}
                                className="flex-1 px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                                <option value="daily">Daily</option>
                                <option value="lifetime">Lifetime</option>
                            </select>
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                                <input
                                    type="number"
                                    value={config.budgetType === 'daily' ? config.dailyBudget : config.lifetimeBudget}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0;
                                        updateNodeData(selectedNode.id, {
                                            type: 'campaign',
                                            config: {
                                                ...config,
                                                [config.budgetType === 'daily' ? 'dailyBudget' : 'lifetimeBudget']: value,
                                            },
                                        });
                                    }}
                                    className="w-full pl-7 pr-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bid Strategy */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bid Strategy</label>
                        <select
                            value={config.bidStrategy}
                            onChange={(e) => updateNodeData(selectedNode.id, { type: 'campaign', config: { ...config, bidStrategy: e.target.value as BidStrategy } })}
                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            {BID_STRATEGIES.map((b) => (
                                <option key={b.value} value={b.value}>{b.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* AI Analysis section */}
                <AIAnalysisPanel />
            </div>
        );
    }

    // AdSet properties
    if (nodeData.type === 'adset') {
        const config = nodeData.config;
        return (
            <div className="w-80 bg-card border-l border-border flex flex-col h-full overflow-y-auto">
                <div className="p-4 border-b border-border flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <h3 className="font-bold">Ad Set Settings</h3>
                </div>

                <div className="p-4 space-y-5 flex-1">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ad Set Name</label>
                        <input
                            type="text"
                            value={config.name}
                            onChange={(e) => updateNodeData(selectedNode.id, { ...nodeData, config: { ...config, name: e.target.value } })}
                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    {/* Locations */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Locations
                        </label>
                        <input
                            type="text"
                            value={config.targeting.locations.join(', ')}
                            onChange={(e) => updateNodeData(selectedNode.id, {
                                ...nodeData,
                                config: { ...config, targeting: { ...config.targeting, locations: e.target.value.split(',').map(s => s.trim()) } }
                            })}
                            placeholder="DE, AT, CH"
                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    {/* Age Range */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Age Range</label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="number"
                                min="13"
                                max="65"
                                value={config.targeting.ageMin}
                                onChange={(e) => updateNodeData(selectedNode.id, {
                                    ...nodeData,
                                    config: { ...config, targeting: { ...config.targeting, ageMin: parseInt(e.target.value) || 18 } }
                                })}
                                className="w-20 px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                            <span className="text-muted-foreground">to</span>
                            <input
                                type="number"
                                min="13"
                                max="65"
                                value={config.targeting.ageMax}
                                onChange={(e) => updateNodeData(selectedNode.id, {
                                    ...nodeData,
                                    config: { ...config, targeting: { ...config.targeting, ageMax: parseInt(e.target.value) || 65 } }
                                })}
                                className="w-20 px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                    </div>

                    {/* Gender */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Gender</label>
                        <select
                            value={config.targeting.gender}
                            onChange={(e) => updateNodeData(selectedNode.id, {
                                ...nodeData,
                                config: { ...config, targeting: { ...config.targeting, gender: e.target.value as 'all' | 'male' | 'female' } }
                            })}
                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            <option value="all">All</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    {/* Interests */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Interests</label>
                        <textarea
                            value={config.targeting.interests.join(', ')}
                            onChange={(e) => updateNodeData(selectedNode.id, {
                                ...nodeData,
                                config: { ...config, targeting: { ...config.targeting, interests: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } }
                            })}
                            placeholder="Fitness, Health, Nutrition..."
                            rows={2}
                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Ad properties
    if (nodeData.type === 'ad') {
        const config = nodeData.config;
        return (
            <div className="w-80 bg-card border-l border-border flex flex-col h-full overflow-y-auto">
                <div className="p-4 border-b border-border flex items-center gap-2">
                    <Image className="w-5 h-5 text-green-400" />
                    <h3 className="font-bold">Ad Settings</h3>
                </div>

                <div className="p-4 space-y-5 flex-1">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ad Name</label>
                        <input
                            type="text"
                            value={config.name}
                            onChange={(e) => updateNodeData(selectedNode.id, { ...nodeData, config: { ...config, name: e.target.value } })}
                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    {/* Creative preview */}
                    {nodeData.creative && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Creative</label>
                            <div className="rounded-lg overflow-hidden border border-border aspect-video">
                                {nodeData.creative.thumbnail ? (
                                    <img src={nodeData.creative.thumbnail} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                        <Image className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Headline */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                            <Type className="w-3 h-3" /> Headline
                        </label>
                        <input
                            type="text"
                            value={config.headline}
                            onChange={(e) => updateNodeData(selectedNode.id, { ...nodeData, config: { ...config, headline: e.target.value } })}
                            placeholder="Enter headline..."
                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    {/* Primary Text */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Primary Text</label>
                        <textarea
                            value={config.primaryText}
                            onChange={(e) => updateNodeData(selectedNode.id, { ...nodeData, config: { ...config, primaryText: e.target.value } })}
                            placeholder="Enter primary text..."
                            rows={3}
                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        />
                    </div>

                    {/* CTA */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Call to Action</label>
                        <select
                            value={config.cta}
                            onChange={(e) => updateNodeData(selectedNode.id, { ...nodeData, config: { ...config, cta: e.target.value } })}
                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            <option value="Learn More">Learn More</option>
                            <option value="Shop Now">Shop Now</option>
                            <option value="Sign Up">Sign Up</option>
                            <option value="Get Offer">Get Offer</option>
                            <option value="Book Now">Book Now</option>
                            <option value="Contact Us">Contact Us</option>
                        </select>
                    </div>

                    {/* Destination URL */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                            <Link2 className="w-3 h-3" /> Destination URL
                        </label>
                        <input
                            type="url"
                            value={config.destinationUrl || ''}
                            onChange={(e) => updateNodeData(selectedNode.id, { ...nodeData, config: { ...config, destinationUrl: e.target.value } })}
                            placeholder="https://..."
                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return null;
});

// AI Analysis Panel component
const AIAnalysisPanel = memo(function AIAnalysisPanel() {
    const { aiAnalysis, isAnalyzing, runAIAnalysis } = useCampaignCanvas();

    return (
        <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    AI Analysis
                </h4>
                <button
                    onClick={runAIAnalysis}
                    disabled={isAnalyzing}
                    className="px-3 py-1.5 text-xs font-medium bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors disabled:opacity-50"
                >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </button>
            </div>

            {aiAnalysis && (
                <div className="space-y-2">
                    {/* Score */}
                    <div className="flex items-center gap-2">
                        <div className={`text-2xl font-bold ${aiAnalysis.score >= 80 ? 'text-green-500' : aiAnalysis.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {aiAnalysis.score}
                        </div>
                        <span className="text-xs text-muted-foreground">/ 100</span>
                    </div>

                    {/* Warnings */}
                    {aiAnalysis.warnings.map((warning: any) => (
                        <div
                            key={warning.id}
                            className={`p-2 rounded-lg text-xs flex items-start gap-2 ${warning.severity === 'error' ? 'bg-red-500/10 text-red-400' :
                                warning.severity === 'warning' ? 'bg-yellow-500/10 text-yellow-400' :
                                    'bg-blue-500/10 text-blue-400'
                                }`}
                        >
                            {warning.severity === 'error' ? <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> :
                                warning.severity === 'warning' ? <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> :
                                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
                            <div>
                                <p className="font-medium">{warning.title}</p>
                                <p className="opacity-80">{warning.description}</p>
                            </div>
                        </div>
                    ))}

                    {/* Suggestions */}
                    {aiAnalysis.suggestions.map((suggestion: any) => (
                        <div key={suggestion.id} className="p-2 rounded-lg bg-purple-500/10 text-xs">
                            <div className="flex items-center gap-2 text-purple-400 font-medium mb-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {suggestion.title}
                            </div>
                            <p className="text-muted-foreground">{suggestion.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});
