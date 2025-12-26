import { memo, useState, useEffect } from 'react';
import { Image, Search, ChevronDown, ChevronRight, GripVertical, Sparkles, Zap, Brain } from 'lucide-react';
import { useCampaignCanvas } from './CampaignCanvasContext';
import type { DraggableAsset, CampaignCanvasNodeData, AdSetNodeData, AdNodeData } from './types';
import { supabase } from '../../lib/supabaseClient';

interface AssetSection {
    id: string;
    title: string;
    icon: React.ElementType;
    assets: DraggableAsset[];
    loading: boolean;
    color: string;
}

// Default hooks library (can be expanded)
const DEFAULT_HOOKS: DraggableAsset[] = [
    { id: 'hook-problem', type: 'hook', name: 'Problem-Agitate-Solve', thumbnail: undefined, data: { template: 'problem', description: 'Start with a relatable problem, agitate it, then solution' } },
    { id: 'hook-question', type: 'hook', name: 'Power Question', thumbnail: undefined, data: { template: 'question', description: 'Start with an intriguing question that sparks curiosity' } },
    { id: 'hook-shocking', type: 'hook', name: 'Shocking Stat', thumbnail: undefined, data: { template: 'stat', description: 'Lead with a surprising statistic' } },
    { id: 'hook-storytime', type: 'hook', name: 'Story Opening', thumbnail: undefined, data: { template: 'story', description: 'Begin with a personal or customer story' } },
    { id: 'hook-contrarian', type: 'hook', name: 'Contrarian Take', thumbnail: undefined, data: { template: 'contrarian', description: 'Challenge common beliefs in your industry' } },
    { id: 'hook-fomo', type: 'hook', name: 'FOMO Trigger', thumbnail: undefined, data: { template: 'fomo', description: 'Create urgency and fear of missing out' } },
];

// Default strategy templates
const DEFAULT_STRATEGIES: DraggableAsset[] = [
    { id: 'strategy-broad', type: 'strategy', name: 'Broad Targeting', thumbnail: undefined, data: { targeting: { ageMin: 18, ageMax: 65, gender: 'all', locations: ['DE'] }, description: 'Let Meta\'s algorithm find your audience' } },
    { id: 'strategy-lookalike', type: 'strategy', name: 'Lookalike Audience', thumbnail: undefined, data: { targeting: { ageMin: 25, ageMax: 55, gender: 'all' }, description: 'Target people similar to your best customers' } },
    { id: 'strategy-retarget', type: 'strategy', name: 'Retargeting', thumbnail: undefined, data: { targeting: { ageMin: 18, ageMax: 65 }, description: 'Re-engage website visitors and past customers' } },
    { id: 'strategy-interest', type: 'strategy', name: 'Interest Stack', thumbnail: undefined, data: { targeting: { ageMin: 25, ageMax: 45, interests: ['Fitness', 'Health', 'Wellness'] }, description: 'Layer multiple interests for precise targeting' } },
];

export const AssetSidebar = memo(function AssetSidebar() {
    const { setAvailableCreatives, addAdNode, selectedNodeId, nodes, updateNodeData } = useCampaignCanvas();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['creatives']));
    const [sections, setSections] = useState<AssetSection[]>([
        { id: 'creatives', title: 'My Creatives', icon: Image, assets: [], loading: true, color: 'text-green-400' },
        { id: 'hooks', title: 'Hook Templates', icon: Zap, assets: DEFAULT_HOOKS, loading: false, color: 'text-yellow-400' },
        { id: 'strategies', title: 'Targeting Strategies', icon: Brain, assets: DEFAULT_STRATEGIES, loading: false, color: 'text-purple-400' },
    ]);

    // Load creatives from Supabase
    useEffect(() => {
        async function loadCreatives() {
            try {
                const { data, error } = await supabase
                    .from('generated_creatives')
                    .select('id, outputs, inputs, thumbnail, created_at')
                    .eq('saved', true)
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (error) throw error;

                const creatives: DraggableAsset[] = (data || []).map((row) => {
                    const outputs = row.outputs as Record<string, unknown>;
                    const inputs = row.inputs as Record<string, unknown>;
                    const brief = outputs?.brief as Record<string, unknown> | undefined;
                    const product = brief?.product as Record<string, unknown> | undefined;
                    return {
                        id: row.id,
                        type: 'creative' as const,
                        name: (product?.name as string) || (inputs?.productName as string) || 'Creative',
                        thumbnail: row.thumbnail || undefined,
                        data: { outputs, inputs },
                    };
                });

                setSections((prev) =>
                    prev.map((s) => (s.id === 'creatives' ? { ...s, assets: creatives, loading: false } : s))
                );
                setAvailableCreatives(creatives);
            } catch (err) {
                console.error('[AssetSidebar] Failed to load creatives:', err);
                setSections((prev) =>
                    prev.map((s) => (s.id === 'creatives' ? { ...s, loading: false } : s))
                );
            }
        }

        loadCreatives();
    }, [setAvailableCreatives]);

    // Load saved strategies from campaign_strategy_blueprints
    useEffect(() => {
        async function loadStrategies() {
            try {
                const { data, error } = await supabase
                    .from('campaign_strategy_blueprints')
                    .select('id, name, strategy_data, created_at')
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (!error && data && data.length > 0) {
                    const dbStrategies: DraggableAsset[] = data.map((row) => ({
                        id: row.id,
                        type: 'strategy' as const,
                        name: row.name || 'Strategy',
                        thumbnail: undefined,
                        data: row.strategy_data || {},
                    }));

                    setSections((prev) =>
                        prev.map((s) =>
                            s.id === 'strategies'
                                ? { ...s, assets: [...dbStrategies, ...DEFAULT_STRATEGIES] }
                                : s
                        )
                    );
                }
            } catch (err) {
                console.error('[AssetSidebar] Failed to load strategies:', err);
            }
        }

        loadStrategies();
    }, []);

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) => {
            const next = new Set(prev);
            if (next.has(sectionId)) {
                next.delete(sectionId);
            } else {
                next.add(sectionId);
            }
            return next;
        });
    };

    const handleDragStart = (e: React.DragEvent, asset: DraggableAsset) => {
        e.dataTransfer.setData('application/campaign-asset', JSON.stringify(asset));
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleDoubleClick = (asset: DraggableAsset) => {
        const selectedNode = nodes.find((n) => n.id === selectedNodeId);

        if (asset.type === 'creative') {
            // Add creative to adset or ad
            if (selectedNode?.data.type === 'adset') {
                addAdNode(selectedNode.id, asset);
            } else if (selectedNode?.data.type === 'ad') {
                // Update the ad's creative
                updateNodeData(selectedNode.id, {
                    ...selectedNode.data,
                    creative: { id: asset.id, thumbnail: asset.thumbnail, name: asset.name }
                } as CampaignCanvasNodeData);
            } else {
                // Find first adset
                const firstAdSet = nodes.find((n) => n.data.type === 'adset');
                if (firstAdSet) addAdNode(firstAdSet.id, asset);
            }
        } else if (asset.type === 'strategy' && selectedNode?.data.type === 'adset') {
            // Apply strategy targeting to selected adset
            const strategyData = asset.data as Record<string, unknown> & { targeting?: Record<string, unknown> };
            if (strategyData.targeting) {
                const adsetData = selectedNode.data as AdSetNodeData;
                updateNodeData(selectedNode.id, {
                    ...adsetData,
                    config: {
                        ...adsetData.config,
                        targeting: {
                            ...adsetData.config.targeting,
                            ...strategyData.targeting,
                        }
                    }
                } as CampaignCanvasNodeData);
            }
        } else if (asset.type === 'hook' && selectedNode?.data.type === 'ad') {
            // Apply hook template to ad
            const adData = selectedNode.data as AdNodeData;
            updateNodeData(selectedNode.id, {
                ...adData,
                config: {
                    ...adData.config,
                    hookId: asset.id,
                    // Could auto-generate text based on hook template here
                }
            } as CampaignCanvasNodeData);
        }
    };

    const filteredSections = sections.map((section) => ({
        ...section,
        assets: section.assets.filter((a) =>
            a.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    }));

    return (
        <div className="w-72 bg-card border-r border-border flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Asset Library
                </h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                </div>
            </div>

            {/* Sections */}
            <div className="flex-1 overflow-y-auto p-2">
                {filteredSections.map((section) => (
                    <div key={section.id} className="mb-2">
                        {/* Section header */}
                        <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            {expandedSections.has(section.id) ? (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                            <section.icon className={`w-4 h-4 ${section.color}`} />
                            <span className="flex-1 text-left text-sm font-medium">{section.title}</span>
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {section.assets.length}
                            </span>
                        </button>

                        {/* Section content */}
                        {expandedSections.has(section.id) && (
                            <div className="px-2 py-1 space-y-1">
                                {section.loading ? (
                                    <div className="text-xs text-muted-foreground p-3 text-center">Loading...</div>
                                ) : section.assets.length === 0 ? (
                                    <div className="text-xs text-muted-foreground p-3 text-center">
                                        {section.id === 'creatives' ? 'Save creatives in Studio to see them here' : 'No assets'}
                                    </div>
                                ) : (
                                    section.assets.map((asset) => (
                                        <div
                                            key={asset.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, asset)}
                                            onDoubleClick={() => handleDoubleClick(asset)}
                                            className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/60 cursor-grab active:cursor-grabbing transition-colors group"
                                        >
                                            <GripVertical className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {asset.thumbnail ? (
                                                <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                                                    <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className={`w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0`}>
                                                    {asset.type === 'creative' && <Image className="w-4 h-4 text-muted-foreground" />}
                                                    {asset.type === 'hook' && <Zap className="w-4 h-4 text-yellow-400" />}
                                                    {asset.type === 'strategy' && <Brain className="w-4 h-4 text-purple-400" />}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">{asset.name}</p>
                                                <p className="text-[10px] text-muted-foreground truncate">
                                                    {asset.type === 'hook' && (asset.data as Record<string, unknown> & { description?: string })?.description}
                                                    {asset.type === 'strategy' && (asset.data as Record<string, unknown> & { description?: string })?.description}
                                                    {asset.type === 'creative' && 'Creative'}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer hint */}
            <div className="p-3 border-t border-border space-y-1">
                <p className="text-[10px] text-muted-foreground text-center">
                    Drag assets to canvas or double-click to add
                </p>
                <p className="text-[10px] text-muted-foreground/60 text-center">
                    💡 Strategies apply to AdSets, Hooks to Ads
                </p>
            </div>
        </div>
    );
});
