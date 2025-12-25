import React from 'react';
import { Eye, EyeOff, Lock, Unlock, GripVertical, Image as ImageIcon, Type, Layers, Trash2, Copy } from 'lucide-react';
import type { StudioLayer } from '../../types/studio';

interface LayerPanelProps {
    layers: StudioLayer[];
    selectedId?: string;
    onSelect: (id: string) => void;
    onToggleVisibility: (id: string) => void;
    onToggleLock: (id: string) => void;
    onGenerate: (id: string, task: 'bg' | 'text') => void;
    onDelete?: (id: string) => void;
    onDuplicate?: (id: string) => void;
}

export const LayerPanel = ({ layers, selectedId, onSelect, onToggleVisibility, onToggleLock, onGenerate, onDelete, onDuplicate }: LayerPanelProps) => {
    const displayLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

    return (
        <div className="flex flex-col h-full bg-card overflow-hidden">
            <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" /> Layers
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {displayLayers.map(layer => {
                    const isSelected = selectedId === layer.id;
                    return (
                        <div
                            key={layer.id}
                            onClick={() => onSelect(layer.id)}
                            className={`
                                group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all border
                                ${isSelected
                                    ? 'bg-primary/5 text-primary border-primary/20 shadow-sm'
                                    : 'hover:bg-muted/50 text-foreground border-transparent'}
                            `}
                        >
                            <GripVertical className="w-4 h-4 text-muted-foreground/30 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                                {layer.type === 'text' || layer.type === 'cta' ? <Type className="w-4 h-4 opacity-70" /> : <ImageIcon className="w-4 h-4 opacity-70" />}
                            </div>

                            <span className={`flex-1 text-xs break-words leading-tight pr-14 ${isSelected ? 'font-bold' : 'font-medium'}`}>
                                {layer.name}
                            </span>

                            <div className="absolute right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card/80 backdrop-blur-sm rounded-lg p-0.5 shadow-sm border border-border">
                                {onDuplicate && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDuplicate(layer.id); }}
                                        className="p-1.5 hover:bg-background rounded-lg transition-colors border border-transparent hover:border-border"
                                        title="Duplicate Layer"
                                    >
                                        <Copy className="w-3.5 h-3.5 text-muted-foreground/60" />
                                    </button>
                                )}
                                {onDelete && !layer.locked && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(layer.id); }}
                                        className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                        title="Delete Layer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-red-500/60 hover:text-red-500" />
                                    </button>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onToggleLock(layer.id); }}
                                    className="p-1.5 hover:bg-background rounded-lg transition-colors border border-transparent hover:border-border"
                                >
                                    {layer.locked ? <Lock className="w-3.5 h-3.5 text-red-500" /> : <Unlock className="w-3.5 h-3.5 text-muted-foreground/60" />}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
                                    className="p-1.5 hover:bg-background rounded-lg transition-colors border border-transparent hover:border-border"
                                >
                                    {layer.visible ? <Eye className="w-3.5 h-3.5 text-muted-foreground/80" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground/40" />}
                                </button>
                            </div>
                        </div>
                    );
                })}

                {layers.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/50 italic text-[10px] space-y-2">
                        <Layers className="w-8 h-8 opacity-10" />
                        <span>No layers found</span>
                    </div>
                )}
            </div>
        </div>
    );
};
