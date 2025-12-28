import React, { useState } from 'react';
import { Layers, Cuboid, Wand2 } from 'lucide-react';
import { LayerPanel } from './LayerPanel';
import { AssetsPanel } from './AssetsPanel';
import { RemixPanel, type RemixTheme } from './RemixPanel';
import type { AdDocument, StudioLayer } from '../../types/studio';

interface EditorSidebarProps {
    doc: AdDocument;
    selectedLayerId?: string;
    onSelectLayer: (id: string | undefined) => void;
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
    selectedLayerId,
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
            {/* Navigation Rail */}
            <div className="w-16 border-r border-border bg-card flex flex-col items-center py-6 gap-6 shrink-0 z-20">
                <button
                    onClick={() => setActiveTab('layers')}
                    className={`p-3 rounded-2xl transition-all duration-200 ${activeTab === 'layers' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
                    title="Layers"
                >
                    <Layers className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setActiveTab('assets')}
                    className={`p-3 rounded-2xl transition-all duration-200 ${activeTab === 'assets' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
                    title="Assets"
                >
                    <Cuboid className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setActiveTab('remix')}
                    className={`p-3 rounded-2xl transition-all duration-200 ${activeTab === 'remix' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-muted-foreground hover:bg-muted'}`}
                    title="AI Remix"
                >
                    <Wand2 className="w-6 h-6" />
                </button>
            </div>

            {/* Drawer Content */}
            <div className="w-72 h-full bg-card border-r border-border flex flex-col z-10 overflow-hidden">
                {activeTab === 'layers' && (
                    <LayerPanel
                        layers={doc.layers}
                        selectedId={selectedLayerId}
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
