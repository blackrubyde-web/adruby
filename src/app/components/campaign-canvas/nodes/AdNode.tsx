import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Image, Trash2, Sparkles, Copy, ExternalLink, Zap, Type } from 'lucide-react';
import { useCampaignCanvas } from '../CampaignCanvasContext';
import type { AdNodeData, DraggableAsset } from '../types';

export const AdNode = memo(function AdNode({ id, data, selected }: { id: string; data: AdNodeData; selected?: boolean }) {
    const { deleteNode, duplicateNode, setSelectedNodeId, dropCreativeOnNode, aiAnalysis } = useCampaignCanvas();
    const config = data.config;
    const creative = data.creative;
    const [isHovered, setIsHovered] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

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
            dropCreativeOnNode(id, asset);
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
            className={`w-[220px] rounded-2xl overflow-hidden transition-all duration-300 ${isDragOver
                    ? 'ring-2 ring-purple-500 scale-105 shadow-2xl shadow-purple-500/30'
                    : selected
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-zinc-900 shadow-xl shadow-primary/20 scale-[1.02]'
                        : hasWarning
                            ? 'ring-2 ring-yellow-500/50'
                            : 'hover:scale-[1.01]'
                }`}
            style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                backdropFilter: 'blur(12px)',
                border: isDragOver ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(34, 197, 94, 0.2)',
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
                className="!w-5 !h-5 !bg-gradient-to-r !from-blue-500 !to-green-500 !border-2 !border-zinc-900 !-top-2.5 !rounded-full transition-all hover:!scale-125"
            />

            {/* Creative thumbnail or drop zone */}
            <div className={`relative aspect-square ${isDragOver ? 'bg-purple-500/20' : 'bg-black/30'}`}>
                {creative?.thumbnail ? (
                    <>
                        <img
                            src={creative.thumbnail}
                            alt={creative.name}
                            className="w-full h-full object-cover"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* AI badge */}
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg">
                            <Sparkles className="w-3 h-3 text-white" />
                            <span className="text-[10px] text-white font-semibold">AI</span>
                        </div>

                        {/* Hover overlay */}
                        {isHovered && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center gap-3 animate-in fade-in duration-200">
                                <button
                                    onClick={(e) => { e.stopPropagation(); duplicateNode(id); }}
                                    className="p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all hover:scale-110"
                                    title="Duplizieren"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
                                    className="p-3 bg-red-500/80 hover:bg-red-500 rounded-xl text-white transition-all hover:scale-110"
                                    title="Löschen"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                ) : isDragOver ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-purple-300 animate-pulse">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/30 flex items-center justify-center mb-3">
                            <Zap className="w-8 h-8" />
                        </div>
                        <span className="text-sm font-semibold">Ablegen</span>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-dashed border-white/20 flex items-center justify-center mb-3">
                            <Image className="w-8 h-8 opacity-40" />
                        </div>
                        <span className="text-[11px] text-center opacity-60">Creative hierher ziehen</span>
                    </div>
                )}

                {/* Action buttons (no creative) */}
                {!creative && isHovered && (
                    <div className="absolute top-2 right-2 flex gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); duplicateNode(id); }}
                            className="p-2 bg-black/60 hover:bg-black/80 rounded-xl text-white transition-all"
                            title="Duplizieren"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
                            className="p-2 bg-red-500/80 hover:bg-red-500 rounded-xl text-white transition-all"
                            title="Löschen"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3 space-y-2">
                <p className="font-semibold text-sm text-foreground truncate">{config.name}</p>

                {config.headline && (
                    <div className="flex items-start gap-1.5">
                        <Type className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{config.headline}</p>
                    </div>
                )}

                <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] px-2.5 py-1.5 bg-gradient-to-r from-primary/20 to-indigo-500/20 text-primary rounded-lg font-semibold truncate max-w-[130px] border border-primary/20">
                        {config.cta || 'Learn More'}
                    </span>
                    {config.destinationUrl && (
                        <a
                            href={config.destinationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                            title="Link öffnen"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    )}
                </div>
            </div>

            {/* Warning indicator */}
            {hasWarning && !isDragOver && (
                <div className="px-3 py-2 bg-gradient-to-r from-yellow-500/15 to-orange-500/15 text-yellow-300 text-[11px] font-semibold flex items-center gap-2 border-t border-yellow-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    {!creative ? 'Creative fehlt' : 'Prüfen'}
                </div>
            )}
        </div>
    );
});
