import React from 'react';
import { PropertiesPanel } from './PropertiesPanel';
import type { StudioLayer } from '../../types/studio';

interface EditorRightPanelProps {
    selectedLayer: StudioLayer | undefined;
    onLayerUpdate: (id: string, attrs: Partial<StudioLayer>) => void;
    onGenerate: (id: string, task: 'bg' | 'text') => void;
    onAdaptImage: (id: string) => void;
    onGenerateScene: (id: string, prompt: string, style: string) => void;
    onReplaceBackground: (id: string, prompt: string) => void;
    onEnhanceImage: (id: string) => void;
}

export const EditorRightPanel: React.FC<EditorRightPanelProps> = ({
    selectedLayer,
    onLayerUpdate,
    onGenerate,
    onAdaptImage,
    onGenerateScene,
    onReplaceBackground,
    onEnhanceImage
}) => {
    return (
        <aside className="w-80 h-full bg-card border-l border-border z-10 shrink-0 overflow-hidden">
            <PropertiesPanel
                layer={selectedLayer}
                onChange={onLayerUpdate}
                onGenerate={onGenerate}
                onAdapt={onAdaptImage}
                onGenerateScene={onGenerateScene}
                onReplaceBackground={onReplaceBackground}
                onEnhanceImage={onEnhanceImage}
            />
        </aside>
    );
};
