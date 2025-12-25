import React from 'react';
import { PropertiesPanel } from './PropertiesPanel';
import type { StudioLayer } from '../../types/studio';

interface EditorRightPanelProps {
    activeLayer: StudioLayer | undefined;
    onLayerUpdate: (id: string, attrs: Partial<StudioLayer>) => void;
    onGenerate: (id: string, task: 'bg' | 'text') => void;
    onAdapt: (id: string) => void;
    onGenerateScene: (id: string, prompt: string, style: string) => void;
    onReplaceBackground: (id: string, prompt: string) => void;
    onEnhanceImage: (id: string) => void;
}

export const EditorRightPanel: React.FC<EditorRightPanelProps> = ({
    activeLayer,
    onLayerUpdate,
    onGenerate,
    onAdapt,
    onGenerateScene,
    onReplaceBackground,
    onEnhanceImage
}) => {
    return (
        <aside className="w-80 h-full bg-card border-l border-border z-10 shrink-0 overflow-hidden">
            <PropertiesPanel
                layer={activeLayer}
                onChange={onLayerUpdate}
                onGenerate={onGenerate}
                onAdapt={onAdapt}
                onGenerateScene={onGenerateScene}
                onReplaceBackground={onReplaceBackground}
                onEnhanceImage={onEnhanceImage}
            />
        </aside>
    );
};
