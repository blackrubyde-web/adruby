import React, { useRef } from 'react';
import { Eye, EyeOff, Lock, Unlock, GripVertical, Image as ImageIcon, Type, Layers, Trash2, Copy, Sparkles, LayoutTemplate } from 'lucide-react';
import type { StudioLayer } from '../../types/studio';
import { useDrag, useDrop } from 'react-dnd';

interface LayerPanelProps {
    layers: StudioLayer[];
    selectedId?: string;
    onSelect: (id: string) => void;
    onToggleVisibility: (id: string) => void;
    onToggleLock: (id: string) => void;
    onGenerate: (id: string, task: 'bg' | 'text') => void;
    onDelete?: (id: string) => void;
    onDuplicate?: (id: string) => void;
    onReorder?: (dragIndex: number, hoverIndex: number) => void;
}

interface SortableLayerProps {
    layer: StudioLayer;
    index: number;
    selectedId?: string;
    moveLayer: (dragIndex: number, hoverIndex: number) => void;
    onSelect: (id: string) => void;
    onToggleVisibility: (id: string) => void;
    onToggleLock: (id: string) => void;
    onDelete?: (id: string) => void;
    onDuplicate?: (id: string) => void;
}

const getLayerIcon = (type: string) => {
    switch (type) {
        case 'text': return <Type className="w-4 h-4" />;
        case 'cta': return <LayoutTemplate className="w-4 h-4" />;
        case 'product': return <ImageIcon className="w-4 h-4" />;
        case 'background': return <ImageIcon className="w-4 h-4" />;
        default: return <ImageIcon className="w-4 h-4" />;
    }
};

const getLayerColor = (type: string) => {
    switch (type) {
        case 'text': return 'from-blue-500/20 to-blue-600/10 text-blue-500';
        case 'cta': return 'from-amber-500/20 to-amber-600/10 text-amber-500';
        case 'product': return 'from-emerald-500/20 to-emerald-600/10 text-emerald-500';
        case 'background': return 'from-violet-500/20 to-violet-600/10 text-violet-500';
        default: return 'from-gray-500/20 to-gray-600/10 text-gray-500';
    }
};

const SortableLayer = ({ layer, index, selectedId, moveLayer, onSelect, onToggleVisibility, onToggleLock, onDelete, onDuplicate }: SortableLayerProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const isSelected = selectedId === layer.id;

    const [{ handlerId }, drop] = useDrop<
        { index: number; id: string; type: string },
        void,
        { handlerId: string | symbol | null }
    >({
        accept: 'LAYER',
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(item, monitor) {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;

            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

            moveLayer(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: 'LAYER',
        item: () => ({ id: layer.id, index }),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));

    return (
        <div
            ref={ref}
            style={{ opacity: isDragging ? 0.4 : 1, transform: isDragging ? 'scale(1.02)' : 'scale(1)' }}
            data-handler-id={handlerId}
            onClick={() => onSelect(layer.id)}
            className={`
                group relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 border-2
                ${isSelected
                    ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 shadow-lg shadow-primary/10'
                    : 'bg-card hover:bg-muted/50 border-transparent hover:border-border/50'}
                ${!layer.visible ? 'opacity-50' : ''}
            `}
        >
            {/* Drag Handle */}
            <div className="cursor-grab active:cursor-grabbing p-1.5 -ml-1 rounded-lg text-muted-foreground/30 hover:text-muted-foreground/60 hover:bg-muted transition-all">
                <GripVertical className="w-4 h-4" />
            </div>

            {/* Layer Icon with color */}
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${getLayerColor(layer.type)} backdrop-blur-sm`}>
                {getLayerIcon(layer.type)}
            </div>

            {/* Layer Info */}
            <div className="flex-1 min-w-0 pr-10">
                <div className="flex items-center gap-2">
                    <span className={`text-xs truncate ${isSelected ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>
                        {layer.name}
                    </span>
                    {layer.ai && (
                        <span className="flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-500">
                            <Sparkles className="w-2.5 h-2.5" />
                        </span>
                    )}
                </div>
                <span className="text-[10px] text-muted-foreground/60 uppercase font-medium tracking-wide">
                    {layer.type}
                </span>
            </div>

            {/* Quick Actions - Appear on Hover */}
            <div className="absolute right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-card/95 backdrop-blur-md rounded-xl p-1 shadow-lg border border-border/50">
                {onDuplicate && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDuplicate(layer.id); }}
                        className="p-1.5 hover:bg-muted rounded-lg transition-all hover:scale-110"
                        title="Duplizieren"
                    >
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleLock(layer.id); }}
                    className="p-1.5 hover:bg-muted rounded-lg transition-all hover:scale-110"
                    title={layer.locked ? 'Entsperren' : 'Sperren'}
                >
                    {layer.locked
                        ? <Lock className="w-3.5 h-3.5 text-orange-500" />
                        : <Unlock className="w-3.5 h-3.5 text-muted-foreground" />
                    }
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
                    className="p-1.5 hover:bg-muted rounded-lg transition-all hover:scale-110"
                    title={layer.visible ? 'Ausblenden' : 'Einblenden'}
                >
                    {layer.visible
                        ? <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        : <EyeOff className="w-3.5 h-3.5 text-muted-foreground/50" />
                    }
                </button>
                {onDelete && !layer.locked && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(layer.id); }}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg transition-all hover:scale-110"
                        title="Löschen"
                    >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                )}
            </div>
        </div>
    );
};

export const LayerPanel = ({ layers, selectedId, onSelect, onToggleVisibility, onToggleLock, onGenerate, onDelete, onDuplicate, onReorder }: LayerPanelProps) => {
    const displayLayers = [...layers].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header with Glassmorphism */}
            <div className="p-4 border-b border-border/50 bg-gradient-to-r from-card to-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                        <Layers className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Layer</h3>
                        <span className="text-[10px] text-muted-foreground">{layers.length} Elemente</span>
                    </div>
                </div>
            </div>

            {/* Layer List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {displayLayers.map((layer, index) => (
                    <SortableLayer
                        key={layer.id}
                        index={index}
                        layer={layer}
                        selectedId={selectedId}
                        moveLayer={onReorder || (() => { })}
                        onSelect={onSelect}
                        onToggleVisibility={onToggleVisibility}
                        onToggleLock={onToggleLock}
                        onDelete={onDelete}
                        onDuplicate={onDuplicate}
                    />
                ))}

                {layers.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="p-4 rounded-2xl bg-muted/30 mb-4">
                            <Layers className="w-10 h-10 text-muted-foreground/20" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground/60">Keine Layer</p>
                        <p className="text-xs text-muted-foreground/40 mt-1">Füge Elemente aus der Assets-Bibliothek hinzu</p>
                    </div>
                )}
            </div>
        </div>
    );
};
