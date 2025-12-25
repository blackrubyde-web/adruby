import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Layers, Plus, Trash2, Users, MapPin, Copy, Target, Zap } from 'lucide-react';
import { useCampaignCanvas } from '../CampaignCanvasContext';
import type { AdSetNodeData, DraggableAsset } from '../types';

export const AdSetNode = memo(function AdSetNode({ id, data, selected }: { id: string; data: AdSetNodeData; selected?: boolean }) {
    const { addAdNode, deleteNode, duplicateNode, setSelectedNodeId, nodes, aiAnalysis } = useCampaignCanvas();
    const config = data.config;
    const [isHovered, setIsHovered] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    // Count ads in this set
    const adCount = nodes.filter((n) => n.data.type === 'ad' && (n.data as any).parentId === id).length;

    // Check for warnings
    const hasWarning = aiAnalysis?.warnings.some(w => w.affectedNodes.includes(id));

    // Handle drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const assetData = e.dataTransfer.getData('application/campaign-asset');
        if (assetData) {
            const asset: DraggableAsset = JSON.parse(assetData);
            addAdNode(id, asset);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    return (
        <div
            data-id={id}
            className={`min-w-[280px] rounded-2xl overflow-hidden transition-all duration-300 ${isDragOver
                    ? 'ring-2 ring-green-500 scale-105 shadow-2xl shadow-green-500/30'
                    : selected
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-zinc-900 shadow-xl shadow-primary/20 scale-[1.02]'
                        : hasWarning
                            ? 'ring-2 ring-yellow-500/50'
                            : 'hover:scale-[1.01]'
                }`}
            style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
                backdropFilter: 'blur(12px)',
                border: isDragOver ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(59, 130, 246, 0.25)',
            }}
            onClick={() => setSelectedNodeId(id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            {/* Input handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-5 !h-5 !bg-gradient-to-r !from-indigo-500 !to-blue-500 !border-2 !border-zinc-900 !-top-2.5 !rounded-full transition-all hover:!scale-125"
            />

            {/* Header */}
            <div
                className="px-4 py-2.5 flex items-center justify-between"
                style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(99, 102, 241, 0.4) 100%)',
                    borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
                }}
            >
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                        <Layers className="w-3.5 h-3.5 text-blue-200" />
                    </div>
                    <span className="font-bold text-sm text-blue-100">Ad Set</span>
                </div>
                <div className="flex items-center gap-1">
                    {isHovered && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); duplicateNode(id); }}
                                className="p-1.5 hover:bg-white/20 rounded-lg text-blue-200 transition-colors"
                                title="Duplizieren"
                            >
                                <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
                                className="p-1.5 hover:bg-red-500/30 rounded-lg text-red-300 transition-colors"
                                title="Löschen"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <p className="font-semibold text-foreground truncate">{config.name}</p>

                {/* Targeting badges */}
                <div className="flex flex-wrap gap-1.5">
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-white/10 rounded-full text-[11px] text-muted-foreground border border-white/5">
                        <MapPin className="w-3 h-3 text-blue-400" />
                        {config.targeting.locations.join(', ') || 'Alle'}
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-white/10 rounded-full text-[11px] text-muted-foreground border border-white/5">
                        <Users className="w-3 h-3 text-purple-400" />
                        {config.targeting.ageMin}-{config.targeting.ageMax}
                    </span>
                    {config.targeting.gender !== 'all' && (
                        <span className="px-2.5 py-1 bg-white/10 rounded-full text-[11px] text-muted-foreground capitalize border border-white/5">
                            {config.targeting.gender === 'male' ? '♂️' : '♀️'} {config.targeting.gender}
                        </span>
                    )}
                </div>

                {/* Optimization goal */}
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Target className="w-3 h-3 text-emerald-400" />
                    <span>{config.optimizationGoal.replace(/_/g, ' ')}</span>
                </div>

                {/* Ad count badge */}
                <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${adCount === 0
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/20'
                            : 'bg-green-500/20 text-green-300 border border-green-500/20'
                        }`}>
                        {adCount} Ad{adCount !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Drop zone / Add button */}
                {isDragOver ? (
                    <div className="flex items-center justify-center py-4 border-2 border-dashed border-green-500 rounded-xl text-green-400 text-sm font-semibold bg-green-500/10 animate-pulse">
                        <Zap className="w-4 h-4 mr-2" />
                        Creative ablegen
                    </div>
                ) : (
                    <button
                        onClick={(e) => { e.stopPropagation(); addAdNode(id); }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-green-500/15 to-emerald-500/15 hover:from-green-500/25 hover:to-emerald-500/25 rounded-xl text-xs font-semibold text-green-300 transition-all border border-green-500/20 hover:border-green-500/40"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Ad hinzufügen
                    </button>
                )}
            </div>

            {/* Warning indicator */}
            {hasWarning && !isDragOver && (
                <div className="px-4 py-2 bg-gradient-to-r from-yellow-500/15 to-orange-500/15 text-yellow-300 text-[11px] font-semibold flex items-center gap-2 border-t border-yellow-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    Optimierung möglich
                </div>
            )}

            {/* Output handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-5 !h-5 !bg-gradient-to-r !from-blue-500 !to-green-500 !border-2 !border-zinc-900 !-bottom-2.5 !rounded-full transition-all hover:!scale-125"
            />
        </div>
    );
});
