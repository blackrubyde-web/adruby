import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { StudioLayer, GroupLayer, AdDocument } from '../types/studio';
import { toast } from 'sonner';

interface UseEditorClipboardProps {
    doc: AdDocument;
    setDoc: React.Dispatch<React.SetStateAction<AdDocument>>;
    selectedLayerIds: string[];
    setSelectedLayerIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const useEditorClipboard = ({
    doc,
    setDoc,
    selectedLayerIds,
    setSelectedLayerIds,
}: UseEditorClipboardProps) => {
    const [clipboard, setClipboard] = useState<StudioLayer[] | null>(null);

    // Helper to clone a layer recursively with new IDs
    const cloneLayer = useCallback((layer: StudioLayer, offset = 20): StudioLayer => {
        const newId = uuidv4();
        if (layer.type === 'group') {
            const group = layer as GroupLayer;
            return {
                ...group,
                id: newId,
                x: group.x + offset,
                y: group.y + offset,
                children: group.children.map(child => cloneLayer(child, 0)) // Children handled relative to group, no extra offset usually needed if group moves
                // Actually, if we offset the group, children move with it. If we offset children, they move inside.
                // We should only offset the root layer.
            };
        }
        return {
            ...layer,
            id: newId,
            x: layer.x + offset,
            y: layer.y + offset,
        };
    }, []);

    const handleCopy = useCallback(() => {
        if (selectedLayerIds.length === 0) return;

        // Find selected layers
        const layersToCopy = doc.layers.filter(l => selectedLayerIds.includes(l.id));
        if (layersToCopy.length > 0) {
            setClipboard(layersToCopy);
            toast.success('Copied to clipboard');
        }
    }, [doc.layers, selectedLayerIds]);

    const handlePaste = useCallback(() => {
        if (!clipboard || clipboard.length === 0) return;

        const newLayers = clipboard.map(l => cloneLayer(l));

        setDoc(prev => ({
            ...prev,
            layers: [...prev.layers, ...newLayers]
        }));

        // Select pasted layers
        setSelectedLayerIds(newLayers.map(l => l.id));
        toast.success('Pasted layers');
    }, [clipboard, cloneLayer, setDoc, setSelectedLayerIds]);

    const handleDuplicate = useCallback(() => {
        if (selectedLayerIds.length === 0) return;

        const layersToDuplicate = doc.layers.filter(l => selectedLayerIds.includes(l.id));
        const newLayers = layersToDuplicate.map(l => cloneLayer(l));

        setDoc(prev => ({
            ...prev,
            layers: [...prev.layers, ...newLayers]
        }));

        setSelectedLayerIds(newLayers.map(l => l.id));
        toast.success('Duplicated');
    }, [doc.layers, selectedLayerIds, cloneLayer, setDoc, setSelectedLayerIds]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

        if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
            e.preventDefault();
            handleCopy();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
            e.preventDefault();
            handlePaste();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
            e.preventDefault();
            handleDuplicate();
        }
    }, [handleCopy, handlePaste, handleDuplicate]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return {
        handleCopy,
        handlePaste,
        handleDuplicate,
        hasClipboard: !!clipboard && clipboard.length > 0
    };
};

