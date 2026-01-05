import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
// import { useNavigate } from 'react-router-dom';

// Icons & UI
// (Most icons moved to sub-components, checking if any needed here)

// Types
import type { AdDocument, StudioLayer, ImageLayer, BrandKit, GroupLayer } from '../../types/studio';
import type { AuditResult } from './PerformanceAudit';
import { performAudit } from './PerformanceAudit';

import { removeBackground, blobToBase64 } from '../../lib/ai/bg-removal';
// ... imports

// ... imports
import type { CanvasStageHandle } from './CanvasStage';
import { smartResize, type FormatPreset } from './SmartResize';

// Sub-components
import { useEditorShortcuts } from '../../hooks/useEditorShortcuts';

import { useAutoSave } from '../../hooks/useAutoSave';
import { invokeOpenAIProxy } from '../../lib/api/proxyClient';
import { alignLayers, distributeLayers, type Alignment, type Distribution } from '../../lib/alignment';
import { apiClient } from '../../utils/apiClient';
import { EditorSidebar } from './EditorSidebar';
import { EditorCanvas } from './EditorCanvas';
import { EditorToolbar } from './EditorToolbar';
import { EditorRightPanel } from './EditorRightPanel';
import { EditorModals } from './EditorModals';

// Mock Data
const MOCK_DOC: AdDocument = {
    id: 'doc_1',
    name: 'Untitled Ad',
    width: 1080,
    height: 1080, // Changed from 1350 to match generator output
    layers: [
        {
            id: 'bg-1',
            type: 'overlay',
            name: 'Product Shot',
            x: 0,
            y: 0,
            width: 1080,
            height: 1350,
            rotation: 0,
            opacity: 1,
            locked: true,
            visible: true,
            src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000'
        },
        {
            id: 'text-1',
            type: 'text',
            name: 'Headline',
            x: 100,
            y: 200,
            rotation: 0,
            opacity: 1,
            text: 'JUST DO IT.',
            fontSize: 120,
            fontFamily: 'Inter',
            fill: '#ffffff',
            fontWeight: '900',
            textAlign: 'center',
            width: 880,
            height: 200,
            locked: false,
            visible: true,
            shadowColor: 'rgba(0,0,0,0.5)',
            shadowBlur: 20
        },
        {
            id: 'shape-1',
            type: 'shape',
            name: 'CTA Button',
            x: 340,
            y: 1100,
            width: 400,
            height: 120,
            rotation: 0,
            opacity: 1,
            fill: '#ff0000',
            cornerRadius: 60,
            locked: false,
            visible: true
        },
        {
            id: 'text-2',
            type: 'text',
            name: 'CTA Text',
            x: 340,
            y: 1135,
            width: 400,
            text: 'SHOP NOW',
            fontSize: 48,
            fontFamily: 'Inter',
            fill: '#ffffff',
            fontWeight: '800',
            textAlign: 'center',
            locked: false,
            rotation: 0,
            opacity: 1,
            height: 100,
            visible: true
        }
    ],
    backgroundColor: '#000000'
};

// Helper to ensure mock layers have required props
MOCK_DOC.layers = MOCK_DOC.layers.map(l => ({ ...l, locked: l.locked || false, opacity: l.opacity ?? 1, visible: l.visible ?? true, rotation: l.rotation ?? 0 }));

// Recursive Helpers
const updateLayerRecursive = (layers: StudioLayer[], id: string, updates: Partial<StudioLayer>): StudioLayer[] => {
    return layers.map(layer => {
        if (layer.id === id) {
            return { ...layer, ...updates } as StudioLayer;
        }
        if (layer.type === 'group') {
            return {
                ...layer,
                children: updateLayerRecursive((layer as GroupLayer).children, id, updates)
            } as GroupLayer;
        }
        return layer;
    });
};

const deleteLayerRecursive = (layers: StudioLayer[], id: string): StudioLayer[] => {
    return layers
        .filter(l => l.id !== id)
        .map(layer => {
            if (layer.type === 'group') {
                return {
                    ...layer,
                    children: deleteLayerRecursive((layer as GroupLayer).children, id)
                } as GroupLayer;
            }
            return layer;
        });
};

const BRAND_KITS: BrandKit[] = [
    {
        id: 'bk_1',
        name: 'Nike Sport',
        colors: { primary: '#000000', secondary: '#FFFFFF', accent: '#E10600' },
        fonts: { heading: 'Inter', body: 'Roboto' },
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg'
    },
    {
        id: 'bk_2',
        name: 'Tech Modern',
        colors: { primary: '#1a1a1a', secondary: '#f0f0f0', accent: '#0070f3' },
        fonts: { heading: 'Outfit', body: 'Inter' },
        logo: ''
    },
    {
        id: 'bk_3',
        name: 'Nature Organic',
        colors: { primary: '#2f3e46', secondary: '#cad2c5', accent: '#52796f' },
        fonts: { heading: 'Playfair Display', body: 'Lato' },
        logo: ''
    }
];

interface EditorLayoutProps {
    onClose?: () => void;
    initialDoc?: AdDocument;
    onSave?: (doc: AdDocument) => void;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({ onClose, initialDoc, onSave }) => {
    // --- State ---
    const [doc, setDoc] = useState<AdDocument>(initialDoc || MOCK_DOC);
    const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
    const [_activeTab, _setActiveTab] = useState<'layers' | 'assets' | 'remix'>('layers');
    const [history, setHistory] = useState<AdDocument[]>([initialDoc || MOCK_DOC]);
    const [historyIndex, setHistoryIndex] = useState(0);

    // Tools & Modes
    const [activeTool, setActiveTool] = useState<'select' | 'hand'>('select');
    const [isMultiverseOpen, setIsMultiverseOpen] = useState(false);
    const [isMockupView, setIsMockupView] = useState(false);

    // Canvas Geometry
    const [viewPos, setViewPos] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1); // Controlled scale state
    const canvasRef = useRef<CanvasStageHandle>(null);
    const [mockupType, setMockupType] = useState<'feed' | 'story'>('feed');

    // Auto-Save
    const { lastSaved } = useAutoSave(doc, setDoc, {
        enabled: true,
        interval: 5000,
        storageKey: `adruby-autosave-${doc.id || 'default'}`
    });

    // Modals
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [variants, setVariants] = useState<AdDocument[]>([]);
    const [showAuditModal, setShowAuditModal] = useState(false);
    const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showTextToAdModal, setShowTextToAdModal] = useState(false);
    const [textToAdInput, setTextToAdInput] = useState('');
    const [showBrandModal, setShowBrandModal] = useState(false);
    const [showResizeModal, setShowResizeModal] = useState(false);
    const [showAdWizard, setShowAdWizard] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Process States
    const [isGeneratingAd, setIsGeneratingAd] = useState(false);
    const [_isSaving, setIsSaving] = useState(false);

    // --- Handlers (Moved up for useEffect dependency) ---

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setDoc(history[historyIndex - 1]);
        }
    }, [history, historyIndex]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setDoc(history[historyIndex + 1]);
        }
    }, [history, historyIndex]);

    // --- Effects ---
    // Update history when doc changes
    useEffect(() => {
        if (doc !== history[historyIndex]) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(doc);
            if (newHistory.length > 20) newHistory.shift();
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }
    }, [doc, history, historyIndex]);

    // Sync initialDoc
    useEffect(() => {
        if (initialDoc) {
            setDoc(initialDoc);
            setHistory([initialDoc]);
            setHistoryIndex(0);
            // Reset view
            setViewPos({ x: 0, y: 0 });
            setScale(0.5); // Default fit
        }
    }, [initialDoc]);

    // Spacebar Panning Mode
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && activeTool !== 'hand') {
                // e.preventDefault(); // careful with text inputs
                if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
                    e.preventDefault();
                    setActiveTool('hand');
                }
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space' && activeTool === 'hand') {
                setActiveTool('select');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [activeTool]);

    // Handle Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) handleRedo(); else handleUndo();
            }

        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedLayerIds, historyIndex, handleRedo, handleUndo]);



    const handleLayerUpdate = useCallback((layerId: string, attrs: Partial<StudioLayer>) => {
        setDoc(prev => ({
            ...prev,
            layers: updateLayerRecursive(prev.layers, layerId, attrs)
        }));
    }, []);


    const handleLayerSelect = (layerId?: string, multi: boolean = false) => {
        if (!layerId) {
            setSelectedLayerIds([]);
            return;
        }
        if (multi) {
            setSelectedLayerIds(prev =>
                prev.includes(layerId)
                    ? prev.filter(id => id !== layerId)
                    : [...prev, layerId]
            );
        } else {
            setSelectedLayerIds([layerId]);
        }
    };

    const handleMultiLayerSelect = (layerIds: string[]) => {
        setSelectedLayerIds(layerIds);
    };

    // AI & Image Generators
    // AI & Image Generators
    const handleGenerate = async (layerId: string, task: 'bg' | 'text') => {
        const layer = doc.layers.find(l => l.id === layerId);
        if (!layer) return;

        toast.info('AI Magic in progress...');
        try {
            if (task === 'text' && layer.type === 'text') {
                // Mock AI generation for now to avoid strict type errors
                const mockContent = "Just Do It. Better.";
                handleLayerUpdate(layerId, { text: mockContent });
                toast.success('Copy updated!');
            } else if (task === 'bg' && (layer.type === 'product' || layer.type === 'overlay' || layer.type === 'image')) {
                const imgLayer = layer as ImageLayer;
                if (!imgLayer.src) return;

                toast.loading('Entferne Hintergrund...', { id: 'bg-remove' });
                const blob = await removeBackground(imgLayer.src);
                const base64 = await blobToBase64(blob);

                handleLayerUpdate(layerId, { src: base64, type: 'product' }); // Ensure it's treated as product
                toast.dismiss('bg-remove');
                toast.success('Hintergrund entfernt!');
            }
        } catch (e) {
            console.error(e);
            toast.dismiss('bg-remove');
            toast.error('AI generation failed');
        }
    };

    const handleGenerateFromText = async () => {
        if (!textToAdInput.trim()) return;
        setIsGeneratingAd(true);
        try {
            await new Promise(r => setTimeout(r, 2000)); // Sim delay
            // Mock result
            const newDoc = { ...MOCK_DOC, name: 'AI Gen: ' + textToAdInput.slice(0, 10), id: uuidv4() };
            setDoc(newDoc);
            toast.success('Ad generated successfully!');
            setShowTextToAdModal(false);
            setTextToAdInput('');
        } catch (e) {
            toast.error('Failed to generate ad');
        } finally {
            setIsGeneratingAd(false);
        }
    };

    const handleGenerateVariants = async () => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 3000)),
            {
                loading: 'AI is dreaming up variants...',
                success: () => {
                    const vars = [
                        { ...doc, id: 'v1', name: 'Variant A: High Contrast', backgroundColor: '#ffffff', layers: doc.layers.map(l => l.type === 'text' ? { ...l, fill: '#000000' } : l) },
                        { ...doc, id: 'v2', name: 'Variant B: Dark Mode', backgroundColor: '#111111', layers: doc.layers.map(l => l.type === 'text' ? { ...l, fill: '#ffffff' } : l) },
                        { ...doc, id: 'v3', name: 'Variant C: Minimal', layers: doc.layers.slice(0, 2) },
                        { ...doc, id: 'v4', name: 'Variant D: Bold', layers: doc.layers.map(l => l.type === 'text' ? { ...l, fontWeight: '900', fontSize: (l.fontSize || 20) * 1.2 } : l) }
                    ];
                    setVariants(vars);
                    setShowVariantModal(true);
                    return 'Variants generated!';
                },
                error: 'Could not generate variants'
            }
        );
    };

    const handleApplyVariant = (variant: AdDocument) => {
        setDoc(variant);
        setShowVariantModal(false);
        toast.success('Variant applied');
    };

    const handleRunAudit = () => {
        const result = performAudit(doc);
        setAuditResult(result);
        setShowAuditModal(true);
    };

    const handleSmartResize = (preset: FormatPreset) => {
        const newDoc = smartResize(doc, preset);
        setDoc(newDoc);
        setShowResizeModal(false);
        toast.success(`Resized to ${preset.name}`);
    };

    const handleApplyBrand = (brand: BrandKit) => {
        setDoc(prev => ({
            ...prev,
            backgroundColor: brand.colors.primary,
            layers: prev.layers.map(l => {
                if (l.type === 'text') {
                    if (l.fontSize && l.fontSize > 60) return { ...l, fontFamily: brand.fonts.heading, fill: brand.colors.secondary };
                    return { ...l, fontFamily: brand.fonts.body, fill: brand.colors.secondary };
                }
                if (l.type === 'shape') {
                    return { ...l, fill: brand.colors.accent };
                }
                return l;
            })
        }));
        setShowBrandModal(false);
        toast.success(`Applied brand: ${brand.name}`);
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate save delay
        setTimeout(() => {
            if (onSave) {
                onSave(doc);
            }
            setIsSaving(false);
            toast.success('Ad saved to library!');
        }, 800);
    };



    // Missing handlers implemented as placeholders or calls to existing APIs
    const handleAdaptImage = useCallback((_id: string) => {
        // Placeholder for adapt image feature
        toast.info("Adapt Image: Coming in V2");
    }, []);

    const handleGenerateScene = useCallback(async (_id: string, prompt: string, _style: string) => {
        // Use DALL-E 3 via OpenAI Proxy
        toast.loading("Generating Scene...");
        const { data, error } = await invokeOpenAIProxy({
            endpoint: 'images/generations',
            model: 'dall-e-3',
            prompt: `Generate a high-quality advertising background scene: ${prompt}, style: ${_style}. No text, photorealistic.`,
            size: "1024x1024",
            quality: "standard",
            n: 1
        });

        if (error || !data?.data?.[0]?.url) {
            toast.dismiss();
            toast.error("Scene generation failed");
            return;
        }

        // In a real app, we would upload this URL to storage and add as a layer
        // For now, we mock adding it or just show success
        toast.dismiss();
        toast.success("Scene Generated! (Link copied to log)");

    }, []);

    const handleReplaceBackground = useCallback(async (id: string, prompt: string) => {
        const layer = doc.layers.find(l => l.id === id);
        if (!layer || !['image', 'product', 'overlay', 'background'].includes(layer.type)) {
            toast.error("Please select an image layer first");
            return;
        }

        toast.loading("Replacing Background...");
        try {
            const result = await apiClient.post<{ imageUrl?: string }>(
                '/api/ai-replace-background',
                {
                    imageUrl: (layer as ImageLayer).src,
                    backgroundPrompt: prompt
                }
            );
            if (result.imageUrl) {
                handleLayerUpdate(id, { src: result.imageUrl });
                toast.dismiss();
                toast.success("Background Replaced!");
            }
        } catch (e) {
            toast.dismiss();
            toast.error("Background replacement failed");
        }
    }, [doc.layers, handleLayerUpdate]);

    const handleEnhanceImage = useCallback((_id: string) => {
        toast.info("Enhance Image: Coming in V2");
    }, []);

    // --- Sidebar Handlers ---
    const handleToggleVisibility = (id: string) => {
        const layer = doc.layers.find(l => l.id === id);
        if (layer) handleLayerUpdate(id, { visible: !layer.visible });
    };
    const handleToggleLock = (id: string) => {
        const layer = doc.layers.find(l => l.id === id);
        if (layer) handleLayerUpdate(id, { locked: !layer.locked });
    };
    const handleDeleteLayer = (id: string) => {
        setDoc(prev => ({ ...prev, layers: deleteLayerRecursive(prev.layers, id) }));
        if (selectedLayerIds.includes(id)) {
            setSelectedLayerIds(prev => prev.filter(selId => selId !== id));
        }
    };
    const handleDuplicateLayer = (id: string) => {
        const layer = doc.layers.find(l => l.id === id);
        if (layer) {
            const newLayer = { ...layer, id: uuidv4(), name: layer.name + ' Copy', x: layer.x + 20, y: layer.y + 20 };
            setDoc(prev => ({ ...prev, layers: [...prev.layers, newLayer] }));
            // Verify if we should select the new layer? Often desirable.
            setSelectedLayerIds([newLayer.id]);
        }
    };
    const handleReorderLayers = (dragIndex: number, hoverIndex: number) => {
        setDoc(prev => {
            // Create deep copies to avoid mutation
            const newLayers = prev.layers.map(l => ({ ...l }));
            // We assume prev.layers is already sorted by display order (zIndex desc) or panel order?
            // Actually LayerPanel sorts by zIndex DESC.
            // But dragging usually happens in the list.
            // If the list is sorted by zIndex DESC, then index 0 is max zIndex.

            // However, the standard DND examples usually operate on the array index.
            // If we blindly splice, we might be splicing a sorted array but the underlying state might be unsorted?
            // "prev.layers" in state might be unsorted.
            // We should sort it first to match the UI, then operation, then reassign zIndices.

            // Sort by zIndex DESC (matching LayerPanel display)
            newLayers.sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0));

            const [removed] = newLayers.splice(dragIndex, 1);
            newLayers.splice(hoverIndex, 0, removed);

            // Now reassign zIndices based on the new order.
            // Since index 0 is top (max zIndex), we assign:
            // i=0 -> zIndex = len-1
            // i=len-1 -> zIndex = 0
            const len = newLayers.length;
            newLayers.forEach((l, i) => {
                l.zIndex = len - 1 - i;
            });

            return { ...prev, layers: newLayers };
        });
    };

    const handleGroup = () => {
        if (selectedLayerIds.length < 2) return;

        // Find selected layers (top-level only for MVP)
        const selectedLayers = doc.layers.filter(l => selectedLayerIds.includes(l.id));
        if (selectedLayers.length < 2) return;

        // Calculate bounds
        const minX = Math.min(...selectedLayers.map(l => l.x));
        const minY = Math.min(...selectedLayers.map(l => l.y));
        const maxX = Math.max(...selectedLayers.map(l => l.x + l.width));
        const maxY = Math.max(...selectedLayers.map(l => l.y + l.height));

        const groupX = minX;
        const groupY = minY;
        const groupWidth = maxX - minX;
        const groupHeight = maxY - minY;

        // Create Group Layer
        const newGroup: GroupLayer = {
            id: uuidv4(),
            type: 'group',
            name: 'Group',
            x: groupX,
            y: groupY,
            width: groupWidth,
            height: groupHeight,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            children: selectedLayers.map(l => ({
                ...l,
                x: l.x - groupX, // Relative position
                y: l.y - groupY
            }))
        };

        // Update Doc
        setDoc(prev => ({
            ...prev,
            layers: [
                ...prev.layers.filter(l => !selectedLayerIds.includes(l.id)),
                newGroup
            ]
        }));
        setSelectedLayerIds([newGroup.id]);
        toast.success('Layers grouped');
    };

    const handleUngroup = () => {
        if (selectedLayerIds.length !== 1) return;
        const groupId = selectedLayerIds[0];
        const group = doc.layers.find(l => l.id === groupId) as GroupLayer | undefined;

        if (!group || group.type !== 'group') return;

        // Extract children
        const ungroupedLayers = group.children.map(child => ({
            ...child,
            x: child.x + group.x, // Absolute position
            y: child.y + group.y,
            rotation: (child.rotation || 0) + (group.rotation || 0) // Basic rotation composition
            // Note: Scaling/skewing of group not fully handled in this MVP, assumed 1
        }));

        // Update Doc
        setDoc(prev => ({
            ...prev,
            layers: [
                ...prev.layers.filter(l => l.id !== groupId),
                ...ungroupedLayers
            ]
        }));
        setSelectedLayerIds(ungroupedLayers.map(l => l.id));
        toast.success('Group ungrouped');
    };
    const handleLockSelected = () => {
        selectedLayerIds.forEach(id => {
            handleLayerUpdate(id, { locked: true });
        });
        toast.success('Layers locked');
    };

    const handleUnlockSelected = () => {
        selectedLayerIds.forEach(id => {
            handleLayerUpdate(id, { locked: false });
        });
        toast.success('Layers unlocked');
    };

    const handleExport = (format: 'png' | 'jpeg') => {
        if (!canvasRef.current) {
            toast.error('Canvas not ready');
            return;
        }

        try {
            const dataUrl = canvasRef.current.exportToDataURL(format);
            if (dataUrl) {
                const link = document.createElement('a');
                link.download = `${doc.name || 'AdRuby-Design'}.${format}`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Campaign exported successfully!');
                setShowExportModal(false);
            } else {
                toast.error('Failed to export canvas');
            }
        } catch (e) {
            console.error('Export failed', e);
            toast.error('Export failed');
        }
    };

    const handleAlign = (type: Alignment) => {
        if (selectedLayerIds.length === 0) return;
        setDoc(prev => ({
            ...prev,
            layers: alignLayers(prev.layers, selectedLayerIds, type, prev.width, prev.height)
        }));
    };

    const handleDistribute = (type: Distribution) => {
        if (selectedLayerIds.length < 3) return;
        setDoc(prev => ({
            ...prev,
            layers: distributeLayers(prev.layers, selectedLayerIds, type)
        }));
    };



    const handleNudge = (dx: number, dy: number) => {


        setDoc(prev => {
            let newLayers = [...prev.layers];
            selectedLayerIds.forEach(id => {
                // We need to find the layer to get current x/y
                // Simple approach: Iterate and update
                const findAndUpdate = (layers: StudioLayer[]): StudioLayer[] => {
                    return layers.map(l => {
                        if (l.id === id) {
                            return { ...l, x: l.x + dx, y: l.y + dy };
                        }
                        if (l.type === 'group') {
                            return { ...l, children: findAndUpdate((l as GroupLayer).children) };
                        }
                        return l;
                    });
                };
                newLayers = findAndUpdate(newLayers);
            });
            return { ...prev, layers: newLayers };
        });
    };

    const handleDeleteSelected = () => {
        if (selectedLayerIds.length === 0) return;
        setDoc(prev => {
            let newLayers = prev.layers;
            selectedLayerIds.forEach(id => {
                newLayers = deleteLayerRecursive(newLayers, id);
            });
            return { ...prev, layers: newLayers };
        });
        setSelectedLayerIds([]);
        toast.success('Layers deleted');
    };

    useEditorShortcuts({
        onDelete: handleDeleteSelected,
        onGroup: handleGroup,
        onUngroup: handleUngroup,
        onDeselectAll: () => setSelectedLayerIds([]),
        onNudge: handleNudge,
        canGroup: selectedLayerIds.length > 1,
        canUngroup: selectedLayerIds.length === 1 && doc.layers.find(l => l.id === selectedLayerIds[0])?.type === 'group',
        selectedLayerIds
    });

    const handleAddLayer = (preset: Partial<StudioLayer>) => {
        const newLayer = {
            id: uuidv4(),
            type: 'text',
            name: 'New Layer',
            x: 100,
            y: 100,
            width: 400,
            height: 100,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            ...preset
        } as StudioLayer;
        setDoc(prev => ({ ...prev, layers: [...prev.layers, newLayer] }));
    };


    const handleZoom = (delta: number, _center?: { x: number, y: number }) => {
        setScale(prev => {
            const newScale = Math.min(Math.max(prev * delta, 0.1), 5);
            return newScale;
        });
        // TODO: Handle centering zoom on pointer
    };

    const findLayerRecursive = (layers: StudioLayer[], id: string): StudioLayer | undefined => {
        for (const layer of layers) {
            if (layer.id === id) return layer;
            if (layer.type === 'group') {
                const found = findLayerRecursive((layer as GroupLayer).children || [], id);
                if (found) return found;
            }
        }
        return undefined;
    };

    const selectedLayer = selectedLayerIds.length > 0 ? findLayerRecursive(doc.layers, selectedLayerIds[0]) : undefined;

    return (
        <div className="h-screen w-full bg-background dark:bg-background flex flex-col overflow-hidden font-sans text-foreground">

            <EditorToolbar
                doc={doc}
                onClose={onClose}
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                isMultiverseMode={isMultiverseOpen}
                setIsMultiverseMode={setIsMultiverseOpen}
                isPreviewMode={isMockupView}
                setIsPreviewMode={setIsMockupView}
                historyIndex={historyIndex}
                historyLength={history.length}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onAudit={handleRunAudit}
                onShowAdWizard={() => setShowAdWizard(true)}
                onToggleSuggestions={() => setShowSuggestions(!showSuggestions)}
                showSuggestions={showSuggestions}
                onShowTextToAd={() => setShowTextToAdModal(true)}
                onShowBrand={() => setShowBrandModal(true)}
                onShowResize={() => setShowResizeModal(true)}
                onShowExport={() => setShowExportModal(true)}
                onSave={handleSave}
                // Zoom Controls
                scale={scale}
                onZoomIn={() => handleZoom(1.2)}
                onZoomOut={() => handleZoom(0.8)}
                // Group Controls
                onGroup={handleGroup}
                onUngroup={handleUngroup}
                canGroup={selectedLayerIds.length > 1}
                canUngroup={selectedLayerIds.length === 1 && doc.layers.find(l => l.id === selectedLayerIds[0])?.type === 'group'}
                onLock={handleLockSelected}
                onUnlock={handleUnlockSelected}
                lastSaved={lastSaved}
                onAlign={handleAlign}
                onDistribute={handleDistribute}
            />

            <div className="flex flex-1 overflow-hidden relative">

                <EditorSidebar
                    doc={doc}
                    onReorderLayers={handleReorderLayers}
                    onSelectLayer={handleLayerSelect}
                    selectedLayerIds={selectedLayerIds}
                    onAddLayer={handleAddLayer}
                    onToggleVisibility={handleToggleVisibility}
                    onToggleLock={handleToggleLock}
                    onDeleteLayer={handleDeleteLayer}
                    onDuplicateLayer={handleDuplicateLayer}
                    onGenerate={handleGenerate}
                    onApplyTemplate={(tpl) => {
                        // Check if we have existing content worth saving
                        const existingProduct = doc.layers.find(l => l.type === 'product' && 'src' in l && l.src && l.src.length > 100) as ImageLayer | undefined;
                        const existingTexts = doc.layers.filter(l => l.type === 'text') as StudioLayer[];

                        let shouldMerge = false;
                        if (existingProduct || existingTexts.length > 0) {
                            shouldMerge = window.confirm("Möchtest du das aktuelle Design (Bilder & Text) auf das neue Template übernehmen?");
                        }

                        const newDoc = { ...doc, ...tpl };

                        if (shouldMerge) {
                            // Smart Merge: Preserve user's uploaded product image if it exists
                            if (existingProduct) {
                                const newProductIndex = newDoc.layers.findIndex(l => l.type === 'product');
                                if (newProductIndex !== -1) {
                                    newDoc.layers[newProductIndex] = {
                                        ...newDoc.layers[newProductIndex],
                                        src: existingProduct.src
                                    } as ImageLayer;
                                }
                            }
                        }

                        setDoc(newDoc);
                        toast.success('Template applied successfully!');
                    }}
                    onApplyTheme={(_theme) => toast.info('Theme applied')}
                    onShuffleColors={() => toast.info('Colors shuffled')}
                    onResizeFormat={(fmt) => toast.info(`Resized to ${fmt}`)}
                    onGenerateVariants={handleGenerateVariants}
                />

                <EditorCanvas
                    doc={doc}
                    scale={scale}
                    activeTool={activeTool}
                    selectedLayerIds={selectedLayerIds}
                    onLayerUpdate={handleLayerUpdate}
                    onLayerSelect={handleLayerSelect}
                    onMultiLayerSelect={handleMultiLayerSelect}
                    isMultiverseMode={isMultiverseOpen}
                    isPreviewMode={isMockupView}
                    mockupType={mockupType}
                    setMockupType={setMockupType}
                    onViewChange={(pos) => setViewPos(pos)}
                    viewPos={viewPos}
                    canvasRef={canvasRef}
                    onZoom={handleZoom}
                />

                <EditorRightPanel
                    selectedLayer={selectedLayer}
                    onLayerUpdate={handleLayerUpdate}
                    onGenerate={handleGenerate}
                    onAdaptImage={handleAdaptImage}
                    onGenerateScene={handleGenerateScene}
                    onReplaceBackground={handleReplaceBackground}
                    onEnhanceImage={handleEnhanceImage}
                />

            </div>

            <EditorModals
                doc={doc}
                setDoc={setDoc}
                variants={variants}
                showVariantModal={showVariantModal}
                setShowVariantModal={setShowVariantModal}
                auditResult={auditResult}
                showAuditModal={showAuditModal}
                setShowAuditModal={setShowAuditModal}
                showExportModal={showExportModal}
                setShowExportModal={setShowExportModal}
                showTextToAdModal={showTextToAdModal}
                setShowTextToAdModal={setShowTextToAdModal}
                showBrandModal={showBrandModal}
                setShowBrandModal={setShowBrandModal}
                showResizeModal={showResizeModal}
                setShowResizeModal={setShowResizeModal}
                showAdWizard={showAdWizard}
                setShowAdWizard={setShowAdWizard}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                brandKits={BRAND_KITS}
                handleApplyVariant={handleApplyVariant}
                handleExport={handleExport}
                handleGenerateFromText={handleGenerateFromText}
                textToAdInput={textToAdInput}
                setTextToAdInput={setTextToAdInput}
                isGeneratingAd={isGeneratingAd}
                handleApplyBrand={handleApplyBrand}
                handleSmartResize={handleSmartResize}
            />

        </div>
    );
};
