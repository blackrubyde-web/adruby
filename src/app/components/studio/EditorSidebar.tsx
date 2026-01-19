import React, { useState } from 'react';
import { Layers, Cuboid, Wand2 } from 'lucide-react';
import { LayerPanel } from './LayerPanel';
import { AssetsPanel } from './AssetsPanel';
import { RemixPanel, type RemixTheme } from './RemixPanel';
import type { AdDocument, StudioLayer } from '../../types/studio';

interface EditorSidebarProps {
    doc: AdDocument;
    selectedLayerIds: string[];
    onSelectLayer: (id: string | undefined, multi: boolean) => void;
    onToggleVisibility: (id: string) => void;
    onToggleLock: (id: string) => void;
    onGenerate: (id: string, task: 'bg' | 'text') => void;
    onDeleteLayer: (id: string) => void;
    onDuplicateLayer: (id: string) => void;
    onReorderLayers?: (dragIndex: number, hoverIndex: number) => void;
    onAddLayer: (preset: Partial<StudioLayer>) => void;
    onApplyTemplate: (tpl: Partial<AdDocument>) => void;
    onApplyTheme: (theme: RemixTheme) => void;
    onShuffleColors: () => void;
    onResizeFormat: (format: 'IG_STORY' | 'IG_POST' | 'FB_AD') => void;
    onGenerateVariants: () => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
    doc,
    selectedLayerIds,
    onSelectLayer,
    onToggleVisibility,
    onToggleLock,
    onGenerate,
    onDeleteLayer,
    onDuplicateLayer,
    onReorderLayers,
    onAddLayer,
    onApplyTemplate,
    onApplyTheme,
    onShuffleColors,
    onResizeFormat,
    onGenerateVariants
}) => {
    const [activeTab, setActiveTab] = useState<'layers' | 'assets' | 'remix'>('layers');

    return (
        <div className="flex z-20 shrink-0 h-full">
            {/* Premium Navigation Rail */}
            <div className="w-16 border-r border-border/50 bg-gradient-to-b from-card via-card to-card/95 flex flex-col items-center py-6 gap-3 shrink-0 z-20">
                {/* Tab Buttons with improved styling */}
                <button
                    onClick={() => setActiveTab('layers')}
                    className={`relative p-3 rounded-xl transition-all duration-300 group ${activeTab === 'layers'
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    title="Layers"
                >
                    <Layers className="w-5 h-5" />
                    {activeTab === 'layers' && (
                        <div className="absolute -right-px top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-l-full" />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('assets')}
                    className={`relative p-3 rounded-xl transition-all duration-300 group ${activeTab === 'assets'
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    title="Assets & Templates"
                >
                    <Cuboid className="w-5 h-5" />
                    {activeTab === 'assets' && (
                        <div className="absolute -right-px top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-l-full" />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('remix')}
                    className={`relative p-3 rounded-xl transition-all duration-300 group ${activeTab === 'remix'
                            ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                            : 'text-muted-foreground hover:bg-purple-500/10 hover:text-purple-400'
                        }`}
                    title="AI Remix"
                >
                    <Wand2 className="w-5 h-5" />
                    {activeTab === 'remix' && (
                        <div className="absolute -right-px top-1/2 -translate-y-1/2 w-0.5 h-6 bg-purple-500 rounded-l-full" />
                    )}
                </button>

                {/* Visual separator */}
                <div className="w-8 h-px bg-border/50 my-2" />

                {/* Tab label indicator */}
                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 rotate-180 [writing-mode:vertical-lr] mt-auto">
                    {activeTab === 'layers' && 'Layers'}
                    {activeTab === 'assets' && 'Assets'}
                    {activeTab === 'remix' && 'AI Magic'}
                </div>
            </div>

            {/* Drawer Content */}
            <div className="w-72 h-full bg-card border-r border-border flex flex-col z-10 overflow-hidden">
                {activeTab === 'layers' && (
                    <LayerPanel
                        layers={doc.layers}
                        selectedIds={selectedLayerIds}
                        onSelect={onSelectLayer}
                        onToggleVisibility={onToggleVisibility}
                        onToggleLock={onToggleLock}
                        onGenerate={onGenerate}
                        onDelete={onDeleteLayer}
                        onDuplicate={onDuplicateLayer}
                        onReorder={onReorderLayers}
                    />
                )}
                {activeTab === 'assets' && (
                    <AssetsPanel
                        onAddLayer={onAddLayer}
                        onApplyTemplate={onApplyTemplate}
                    />
                )}
                {activeTab === 'remix' && (
                    <RemixPanel
                        onApplyTheme={onApplyTheme}
                        onShuffleColors={onShuffleColors}
                        onResizeFormat={onResizeFormat}
                        onGenerateVariants={onGenerateVariants}
                    />
                )}
            </div>
        </div>
    );
};
