import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Target, Plus, Copy, DollarSign, Sparkles } from 'lucide-react';
import { useCampaignCanvas } from '../CampaignCanvasContext';
import type { CampaignNodeData, AdSetNodeData } from '../types';

const OBJECTIVE_LABELS: Record<string, { emoji: string; label: string; gradient: string }> = {
    CONVERSIONS: { emoji: '🎯', label: 'Conversions', gradient: 'from-orange-500 to-red-500' },
    TRAFFIC: { emoji: '🔗', label: 'Traffic', gradient: 'from-blue-500 to-cyan-500' },
    AWARENESS: { emoji: '👁️', label: 'Awareness', gradient: 'from-purple-500 to-pink-500' },
    ENGAGEMENT: { emoji: '💬', label: 'Engagement', gradient: 'from-green-500 to-emerald-500' },
    LEADS: { emoji: '📋', label: 'Leads', gradient: 'from-yellow-500 to-orange-500' },
    APP_INSTALLS: { emoji: '📱', label: 'App Installs', gradient: 'from-indigo-500 to-purple-500' },
};

export const CampaignNode = memo(function CampaignNode({ id, data, selected }: { id: string; data: CampaignNodeData; selected?: boolean }) {
    const { addAdSetNode, duplicateNode, setSelectedNodeId, nodes, aiAnalysis } = useCampaignCanvas();
    const config = data.config;
    const [isHovered, setIsHovered] = useState(false);

    // Count child ad sets
    const adSetCount = nodes.filter(n => n.data.type === 'adset' && (n.data as AdSetNodeData).parentId === id).length;

    // Check for warnings on this node
    const hasWarning = aiAnalysis?.warnings.some(w => w.affectedNodes.includes(id));
    const hasError = aiAnalysis?.warnings.some(w => w.severity === 'error' && w.affectedNodes.includes(id));

    const objective = OBJECTIVE_LABELS[config.objective] || OBJECTIVE_LABELS.CONVERSIONS;

    return (
        <div
            data-id={id}
            className={`min-w-[320px] rounded-2xl overflow-hidden transition-all duration-300 ${selected
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-zinc-900 shadow-2xl shadow-primary/30 scale-[1.02]'
                : hasError
                    ? 'ring-2 ring-red-500/50'
                    : hasWarning
                        ? 'ring-2 ring-yellow-500/50'
                        : 'hover:scale-[1.01]'
                }`}
            style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
            onClick={() => setSelectedNodeId(id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Premium header gradient */}
            <div
                className="px-4 py-3 flex items-center justify-between"
                style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%)',
                }}
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur">
                        <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-white text-sm">Campaign</span>
                        <div className="flex items-center gap-1">
                            <span className="text-white/60 text-[10px]">{objective.emoji} {objective.label}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Duplicate button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); duplicateNode(id); }}
                        className={`p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                        title="Duplizieren"
                    >
                        <Copy className="w-3.5 h-3.5 text-white" />
                    </button>
                    {/* AI Score badge */}
                    {aiAnalysis && (
                        <div className={`px-2 py-1 rounded-lg text-[10px] font-bold ${aiAnalysis.score >= 80 ? 'bg-green-500/30 text-green-200' :
                            aiAnalysis.score >= 60 ? 'bg-yellow-500/30 text-yellow-200' :
                                'bg-red-500/30 text-red-200'
                            }`}>
                            <Sparkles className="w-3 h-3 inline mr-1" />
                            {aiAnalysis.score}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                <div>
                    <p className="font-bold text-foreground text-lg truncate">{config.name}</p>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-green-400" />
                            <span className="text-[10px] text-muted-foreground uppercase">Budget</span>
                        </div>
                        <p className="text-foreground font-bold">
                            €{config.budgetType === 'daily' ? config.dailyBudget : config.lifetimeBudget}
                            <span className="text-xs text-muted-foreground font-normal">
                                {config.budgetType === 'daily' ? '/Tag' : ' total'}
                            </span>
                        </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                            <Target className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] text-muted-foreground uppercase">Ad Sets</span>
                        </div>
                        <p className="text-foreground font-bold">
                            {adSetCount}
                            <span className="text-xs text-muted-foreground font-normal ml-1">aktiv</span>
                        </p>
                    </div>
                </div>

                {/* Bid strategy badge */}
                <div className="flex items-center gap-2">
                    <span className="text-[11px] px-3 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full font-medium border border-indigo-500/20">
                        {config.bidStrategy.replace(/_/g, ' ')}
                    </span>
                </div>

                {/* Add Ad Set button */}
                <button
                    onClick={(e) => { e.stopPropagation(); addAdSetNode(id); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 rounded-xl text-sm font-semibold text-indigo-300 transition-all border border-indigo-500/20 hover:border-indigo-500/40"
                >
                    <Plus className="w-4 h-4" />
                    Ad Set hinzufügen
                </button>
            </div>

            {/* Error/Warning indicator */}
            {(hasError || hasWarning) && (
                <div className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 ${hasError
                    ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border-t border-red-500/20'
                    : 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-t border-yellow-500/20'
                    }`}>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: hasError ? '#ef4444' : '#eab308' }} />
                    {hasError ? 'Fehler beheben erforderlich' : 'Optimierung möglich'}
                </div>
            )}

            {/* Output handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-5 !h-5 !bg-gradient-to-r !from-indigo-500 !to-purple-500 !border-2 !border-zinc-900 !-bottom-2.5 !rounded-full transition-all hover:!scale-125"
            />
        </div>
    );
});
