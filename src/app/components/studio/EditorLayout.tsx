import React, { useState, useCallback, useRef } from 'react';
import { CanvasStage, type CanvasStageHandle } from './CanvasStage';
import { LayerPanel } from './LayerPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { AssetsPanel } from './AssetsPanel';
import { RemixPanel, type RemixTheme, REMIX_THEMES } from './RemixPanel';
import { generateVariants } from './VariantGenerator';
import { runPerformanceAudit, type AuditResult } from './PerformanceAudit';
import { generateAdContent, createAdFromContent, type GeneratedAdContent } from './TextToAdGenerator';
import { getAllBrandKits, applyBrandToDocument, type BrandKit } from './BrandKit';
import { smartResize, FORMAT_PRESETS, type FormatPreset } from './SmartResize';
import { Layers, Cuboid, Wand2, X, Save, Share2, ShieldCheck, TrendingUp, AlertCircle, CheckCircle2, Download, Image as ImageIcon, Undo2, Redo2, Trash2, Copy, Sparkles, Palette, Maximize2, Loader2 } from 'lucide-react';
import type { AdDocument, StudioLayer } from '../../types/studio';

const MOCK_DOC: AdDocument = {
    id: "doc_001",
    name: "Minecraft Fox - Gaming Desk Setup",
    format: "1:1",
    width: 1080,
    height: 1080,
    backgroundColor: "#111111",
    safeArea: { top: 80, bottom: 80, left: 60, right: 60 },
    meta: {
        goal: "conversion",
        mood: "cozy_warm",
    },
    layers: [
        {
            id: "bg_01",
            type: "background",
            name: "Gaming Room Background",
            visible: true,
            locked: true,
            x: 0,
            y: 0,
            width: 1080,
            height: 1080,
            rotation: 0,
            opacity: 1,
            zIndex: 0,
            src: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=2857&auto=format&fit=crop",
            fit: "cover",
            ai: { provider: "openai", task: "generate_background", createdAt: new Date().toISOString() }
        },
        {
            id: "prod_01",
            type: "product",
            name: "Fox Lamp",
            visible: true,
            locked: false,
            x: 240,
            y: 200,
            width: 600,
            height: 600,
            rotation: 0,
            opacity: 1,
            zIndex: 10,
            src: "https://minecraft-merch.com/wp-content/uploads/2021/04/fox-light.jpg",
            fit: "contain"
        },
        {
            id: "txt_head",
            type: "text",
            name: "Headline",
            visible: true,
            locked: false,
            x: 60,
            y: 800,
            width: 960,
            height: 100,
            rotation: 0,
            opacity: 1,
            zIndex: 20,
            text: "Level Up Your Setup",
            fontFamily: "Inter",
            fontWeight: 800,
            fontSize: 80,
            lineHeight: 1.1,
            letterSpacing: -2,
            align: "center",
            color: "#FFFFFF",
            ai: { provider: "openai", task: "copy", createdAt: new Date().toISOString() }
        },
        {
            id: "cta_btn",
            type: "cta",
            name: "CTA Button",
            visible: true,
            locked: false,
            x: 390,
            y: 920,
            width: 300,
            height: 80,
            rotation: 0,
            opacity: 1,
            zIndex: 30,
            text: "Shop Now",
            fontFamily: "Inter",
            fontWeight: 700,
            fontSize: 24,
            lineHeight: 1,
            letterSpacing: 0,
            color: "#000000",
            bgColor: "#FFAA00",
            radius: 50,
            paddingX: 40,
            paddingY: 20
        }
    ]
};

interface EditorLayoutProps {
    onClose?: () => void;
    onSave?: (doc: AdDocument) => void;
}

export const EditorLayout = ({ onClose, onSave }: EditorLayoutProps) => {
    const [doc, setDoc] = useState<AdDocument>(MOCK_DOC);
    const [selectedLayerId, setSelectedLayerId] = useState<string | undefined>();
    const [activeTab, setActiveTab] = useState<'layers' | 'assets' | 'remix'>('layers');
    const [variants, setVariants] = useState<AdDocument[]>([]);
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [isMultiverseMode, setIsMultiverseMode] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
    const [showAuditModal, setShowAuditModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const canvasRef = useRef<CanvasStageHandle>(null);

    // Text-to-Ad AI
    const [showTextToAdModal, setShowTextToAdModal] = useState(false);
    const [textToAdInput, setTextToAdInput] = useState('');
    const [isGeneratingAd, setIsGeneratingAd] = useState(false);

    // Brand Kit
    const [showBrandModal, setShowBrandModal] = useState(false);
    const brandKits = getAllBrandKits();

    // Smart Resize
    const [showResizeModal, setShowResizeModal] = useState(false);

    // Undo/Redo History
    const [history, setHistory] = useState<AdDocument[]>([MOCK_DOC]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const pushHistory = useCallback((newDoc: AdDocument) => {
        setHistory(prev => [...prev.slice(0, historyIndex + 1), newDoc].slice(-50)); // Keep last 50 states
        setHistoryIndex(prev => Math.min(prev + 1, 49));
    }, [historyIndex]);

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
            setDoc(history[historyIndex - 1]);
        }
    }, [history, historyIndex]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prev => prev + 1);
            setDoc(history[historyIndex + 1]);
        }
    }, [history, historyIndex]);

    // Layer Delete
    const handleDeleteLayer = useCallback((id: string) => {
        setDoc(prev => {
            const newDoc = { ...prev, layers: prev.layers.filter(l => l.id !== id) };
            pushHistory(newDoc);
            return newDoc;
        });
        if (selectedLayerId === id) setSelectedLayerId(undefined);
    }, [selectedLayerId, pushHistory]);

    // Layer Duplicate
    const handleDuplicateLayer = useCallback((id: string) => {
        const layer = doc.layers.find(l => l.id === id);
        if (!layer) return;
        const newLayer = {
            ...layer,
            id: `layer_${Date.now()}`,
            name: `${layer.name} (Copy)`,
            x: layer.x + 20,
            y: layer.y + 20
        };
        setDoc(prev => {
            const newDoc = { ...prev, layers: [...prev.layers, newLayer as StudioLayer] };
            pushHistory(newDoc);
            return newDoc;
        });
        setSelectedLayerId(newLayer.id);
    }, [doc.layers, pushHistory]);

    const handleSelectLayer = useCallback((id: string | undefined) => {
        setSelectedLayerId(id);
    }, []);

    const handleLayerUpdate = useCallback((id: string, newAttrs: Partial<StudioLayer>) => {
        setDoc(prev => ({
            ...prev,
            layers: prev.layers.map(l => l.id === id ? { ...l, ...newAttrs } : l) as StudioLayer[]
        }));
    }, []);

    const handleToggleVisibility = (id: string) => {
        setDoc(prev => ({
            ...prev,
            layers: prev.layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l) as StudioLayer[]
        }));
    };

    const handleToggleLock = (id: string) => {
        setDoc(prev => ({
            ...prev,
            layers: prev.layers.map(l => l.id === id ? { ...l, locked: !l.locked } : l) as StudioLayer[]
        }));
    };

    const handleAddLayer = (preset: Partial<StudioLayer>) => {
        const newLayer: StudioLayer = {
            ...preset,
            id: `layer_${Date.now()}`,
            name: preset.type === 'cta' ? 'New Button' : (preset.type === 'image' ? 'New Image' : 'New Text'),
            visible: true,
            locked: false,
            x: doc.width / 2 - (preset.width || 200) / 2,
            y: doc.height / 2 - (preset.height || 100) / 2,
            opacity: 1,
            rotation: 0,
            zIndex: doc.layers.length + 10,
            ...(preset.type === 'text' ? { text: preset.text || 'Text', fontSize: preset.fontSize || 40, fontFamily: preset.fontFamily || 'Inter', color: preset.color || '#000' } : {}),
            ...(preset.type === 'cta' ? { text: preset.text || 'Button', bgColor: (preset as any).bgColor || '#000', radius: (preset as any).radius || 0 } : {})
        } as StudioLayer;

        setDoc(prev => ({ ...prev, layers: [...prev.layers, newLayer] }));
        setSelectedLayerId(newLayer.id);
    };

    const handleApplyTemplate = (tpl: Partial<AdDocument>) => {
        setDoc(prev => ({
            ...prev,
            ...tpl,
            id: prev.id, // keep original id
            layers: tpl.layers?.map(l => ({ ...l, id: `layer_${Math.random().toString(36).substr(2, 9)}` })) as StudioLayer[]
        }));
        setSelectedLayerId(undefined);
    };

    const handleApplyTheme = (theme: RemixTheme) => {
        const colors = theme.colors;
        setDoc(prev => ({
            ...prev,
            backgroundColor: theme.bg || prev.backgroundColor,
            layers: prev.layers.map(layer => {
                const newProps: any = {};
                if (layer.type === 'text' || layer.type === 'cta') {
                    newProps.fontFamily = theme.font;
                }
                if (layer.type === 'text') {
                    newProps.color = colors[0];
                }
                if (layer.type === 'cta') {
                    newProps.bgColor = colors[1] || colors[0];
                    newProps.color = theme.bg === '#FFFFFF' ? '#000000' : '#FFFFFF';
                }
                return { ...layer, ...newProps };
            }) as StudioLayer[]
        }));
    };

    const handleShuffleColors = () => {
        setDoc(prev => ({
            ...prev,
            layers: prev.layers.map(layer => {
                if (layer.type === 'cta') {
                    return { ...layer, bgColor: `#${Math.floor(Math.random() * 16777215).toString(16)}` };
                }
                return layer;
            }) as StudioLayer[]
        }));
    };

    const handleResizeFormat = (format: 'IG_STORY' | 'IG_POST' | 'FB_AD') => {
        let width = 1080, height = 1080;
        if (format === 'IG_STORY') { width = 1080; height = 1920; }
        if (format === 'FB_AD') { width = 1200; height = 628; }

        const oldCenter = { x: doc.width / 2, y: doc.height / 2 };
        const newCenter = { x: width / 2, y: height / 2 };

        setDoc(prev => ({
            ...prev,
            width,
            height,
            format: format as any,
            layers: prev.layers.map(l => ({
                ...l,
                x: l.x + (newCenter.x - oldCenter.x),
                y: l.y + (newCenter.y - oldCenter.y)
            })) as StudioLayer[]
        }));
    };

    const handleGenerate = async (id: string, task: 'bg' | 'text') => {
        const layer = doc.layers.find(l => l.id === id);
        if (!layer) return;

        if (task === 'bg') {
            // Real background removal API call
            try {
                const response = await fetch('/api/ai/remove-background', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageUrl: (layer as any).src })
                });
                const data = await response.json();
                if (data.success && data.processedUrl) {
                    handleLayerUpdate(id, {
                        src: data.processedUrl,
                        ai: { provider: 'other', task: 'cutout', createdAt: new Date().toISOString() }
                    });
                }
            } catch (e) {
                console.error('Background removal failed:', e);
            }
        }

        if (task === 'text') {
            // Real text generation API call
            try {
                const currentText = (layer as any).text || '';
                const response = await fetch('/api/ai/generate-text', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        systemPrompt: 'You are an expert ad copywriter. Generate compelling, conversion-focused ad copy. Be direct, use power words, create urgency. Return ONLY the copy text.',
                        userPrompt: `Rewrite this ad headline to be more compelling (keep it under 10 words): "${currentText}"`,
                        model: 'gpt-4o-mini'
                    })
                });
                const data = await response.json();
                if (data.text) {
                    handleLayerUpdate(id, {
                        text: data.text,
                        ai: { provider: 'openai', task: 'copy', prompt: currentText, createdAt: new Date().toISOString() }
                    });
                }
            } catch (e) {
                // Fallback to local generation
                const fallbackHeadlines = ['Transform Your World', 'Unleash Your Potential', 'The Future is Now', 'Don\'t Wait — Act Now'];
                const randomHeadline = fallbackHeadlines[Math.floor(Math.random() * fallbackHeadlines.length)];
                handleLayerUpdate(id, {
                    text: randomHeadline,
                    ai: { provider: 'other', task: 'copy', createdAt: new Date().toISOString() }
                });
            }
        }
    };

    const handleGenerateVariants = () => {
        const newVariants = generateVariants(doc);
        setVariants(newVariants);
        setShowVariantModal(true);
    };

    const handleApplyVariant = (variant: AdDocument) => {
        setDoc(variant);
        setShowVariantModal(false);
    };

    const handleAudit = () => {
        const result = runPerformanceAudit(doc);
        setAuditResult(result);
        setShowAuditModal(true);
    };

    const handleExport = (format: 'png' | 'jpeg') => {
        const dataURL = canvasRef.current?.exportToDataURL(format, format === 'jpeg' ? 0.9 : 1);
        if (dataURL) {
            const link = document.createElement('a');
            link.download = `${doc.name || 'ad'}_${doc.width}x${doc.height}.${format}`;
            link.href = dataURL;
            link.click();
        }
        setShowExportModal(false);
    };

    // Text-to-Ad AI Handler
    const handleGenerateFromText = async () => {
        if (!textToAdInput.trim()) return;
        setIsGeneratingAd(true);
        try {
            const content = await generateAdContent({ description: textToAdInput, style: 'modern' });
            const newAdPartial = createAdFromContent(content, { width: doc.width, height: doc.height });
            const newDoc: AdDocument = {
                ...doc,
                ...newAdPartial,
                layers: [...(newAdPartial.layers || [])] as StudioLayer[]
            };
            setDoc(newDoc);
            pushHistory(newDoc);
            setShowTextToAdModal(false);
            setTextToAdInput('');
        } catch (e) {
            console.error('Text-to-Ad generation failed:', e);
        } finally {
            setIsGeneratingAd(false);
        }
    };

    // Brand Kit Handler
    const handleApplyBrand = (brand: BrandKit) => {
        const newDoc = applyBrandToDocument(doc, brand) as AdDocument;
        setDoc(newDoc);
        pushHistory(newDoc);
        setShowBrandModal(false);
    };

    // Smart Resize Handler
    const handleSmartResize = (format: FormatPreset) => {
        const resizedDoc = smartResize(doc, format);
        setDoc(resizedDoc);
        pushHistory(resizedDoc);
        setShowResizeModal(false);
    };

    const activeLayer = doc.layers.find(l => l.id === selectedLayerId);
    const scale = Math.min(0.8, 600 / Math.max(doc.width, doc.height)); // Fit to workspace

    return (
        <div className="flex flex-col h-full bg-background relative overflow-hidden">
            {/* Full-Screen Header Overlay Style */}
            <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-30 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="h-8 w-px bg-border" />
                    <div className="flex flex-col">
                        <h1 className="font-bold text-sm tracking-tight">{doc.name}</h1>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded w-fit">Studio Beta</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Premium Toggles */}
                    <div className="flex items-center bg-muted rounded-xl p-1 mr-2 border border-border">
                        <button
                            onClick={() => setIsMultiverseMode(!isMultiverseMode)}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${isMultiverseMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Multiverse
                        </button>
                        <button
                            onClick={() => {
                                setIsPreviewMode(!isPreviewMode);
                                if (!isPreviewMode) setIsMultiverseMode(false); // Disable multiverse in mockup
                            }}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${isPreviewMode ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Mockup
                        </button>
                    </div>

                    {/* Undo/Redo */}
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1 border border-border">
                        <button
                            onClick={handleUndo}
                            disabled={historyIndex <= 0}
                            className={`p-2 rounded-md transition-all ${historyIndex > 0 ? 'hover:bg-background text-foreground' : 'text-muted-foreground/40 cursor-not-allowed'}`}
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleRedo}
                            disabled={historyIndex >= history.length - 1}
                            className={`p-2 rounded-md transition-all ${historyIndex < history.length - 1 ? 'hover:bg-background text-foreground' : 'text-muted-foreground/40 cursor-not-allowed'}`}
                            title="Redo (Ctrl+Y)"
                        >
                            <Redo2 className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={handleAudit}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-all border border-border group"
                    >
                        <ShieldCheck className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                        AI Audit
                    </button>

                    {/* PREMIUM FEATURE BUTTONS */}
                    <button
                        onClick={() => setShowTextToAdModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all"
                    >
                        <Sparkles className="w-4 h-4" /> Text→Ad
                    </button>
                    <button
                        onClick={() => setShowBrandModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-all border border-border group"
                    >
                        <Palette className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" /> Brand
                    </button>
                    <button
                        onClick={() => setShowResizeModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-all border border-border group"
                    >
                        <Maximize2 className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" /> Resize
                    </button>

                    <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-muted hover:bg-muted/80 rounded-lg transition-all border border-border">
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                    >
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button onClick={() => onSave?.(doc)} className="flex items-center gap-2 px-6 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all">
                        <Save className="w-4 h-4" /> Save Ad
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Navigation Rail */}
                <div className="w-16 border-r border-border bg-card flex flex-col items-center py-6 gap-6 shrink-0 z-20">
                    <button onClick={() => setActiveTab('layers')} className={`p-3 rounded-2xl transition-all duration-200 ${activeTab === 'layers' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted'}`} title="Layers">
                        <Layers className="w-6 h-6" />
                    </button>
                    <button onClick={() => setActiveTab('assets')} className={`p-3 rounded-2xl transition-all duration-200 ${activeTab === 'assets' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted'}`} title="Assets">
                        <Cuboid className="w-6 h-6" />
                    </button>
                    <button onClick={() => setActiveTab('remix')} className={`p-3 rounded-2xl transition-all duration-200 ${activeTab === 'remix' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-muted-foreground hover:bg-muted'}`} title="AI Remix">
                        <Wand2 className="w-6 h-6" />
                    </button>
                </div>

                {/* Left Drawer */}
                <div className="w-72 h-full bg-card border-r border-border flex flex-col z-10">
                    {activeTab === 'layers' && <LayerPanel layers={doc.layers} selectedId={selectedLayerId} onSelect={handleSelectLayer} onToggleVisibility={handleToggleVisibility} onToggleLock={handleToggleLock} onGenerate={handleGenerate} onDelete={handleDeleteLayer} onDuplicate={handleDuplicateLayer} />}
                    {activeTab === 'assets' && <AssetsPanel onAddLayer={handleAddLayer} onApplyTemplate={handleApplyTemplate} />}
                    {activeTab === 'remix' && <RemixPanel onApplyTheme={handleApplyTheme} onShuffleColors={handleShuffleColors} onResizeFormat={handleResizeFormat} onGenerateVariants={handleGenerateVariants} />}
                </div>

                {/* Center Canvas Area */}
                <main className={`flex-1 relative overflow-auto flex items-center justify-center transition-colors duration-500 ${isPreviewMode ? 'bg-white' : 'bg-zinc-950'}`}>

                    {!isMultiverseMode && !isPreviewMode && (
                        <div className="shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] border border-white/5 rounded-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                            <CanvasStage ref={canvasRef} doc={doc} scale={scale} selectedLayerId={selectedLayerId} onLayerSelect={handleSelectLayer} onLayerUpdate={handleLayerUpdate} />
                        </div>
                    )}

                    {/* MULTIVERSE VIEW: 3 Formats side-by-side */}
                    {isMultiverseMode && (
                        <div className="flex items-center gap-12 p-20 animate-in slide-in-from-bottom-10 fade-in duration-700">
                            {/* 1:1 Post */}
                            <div className="flex flex-col gap-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Instagram Post</span>
                                <div className="shadow-2xl border border-white/5 rounded-sm overflow-hidden scale-[0.4] origin-top">
                                    <CanvasStage doc={doc} scale={1} selectedLayerId={undefined} onLayerSelect={() => { }} onLayerUpdate={() => { }} />
                                </div>
                            </div>
                            {/* 9:16 Story */}
                            <div className="flex flex-col gap-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Instagram Story</span>
                                <div className="shadow-2xl border border-white/5 rounded-sm overflow-hidden scale-[0.4] origin-top">
                                    {/* Story Mock: We use the doc but force story dimensions for preview */}
                                    <CanvasStage
                                        doc={{ ...doc, width: 1080, height: 1920 }}
                                        scale={1}
                                        selectedLayerId={undefined}
                                        onLayerSelect={() => { }}
                                        onLayerUpdate={() => { }}
                                    />
                                </div>
                            </div>
                            {/* 16:9 Wide */}
                            <div className="flex flex-col gap-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Facebook Wide</span>
                                <div className="shadow-2xl border border-white/5 rounded-sm overflow-hidden scale-[0.4] origin-top">
                                    <CanvasStage
                                        doc={{ ...doc, width: 1200, height: 628 }}
                                        scale={1}
                                        selectedLayerId={undefined}
                                        onLayerSelect={() => { }}
                                        onLayerUpdate={() => { }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SOCIAL MOCKUP VIEW */}
                    {isPreviewMode && (
                        <div className="relative w-[375px] h-[812px] bg-white rounded-[50px] shadow-[0_0_0_12px_#111,0_0_0_15px_#222,0_30px_60px_rgba(0,0,0,0.3)] border-[8px] border-zinc-900 overflow-hidden animate-in zoom-in-90 fade-in duration-500">
                            {/* Status Bar */}
                            <div className="h-10 bg-white flex items-center justify-between px-8 pt-4">
                                <span className="text-[14px] font-bold">9:41</span>
                                <div className="flex gap-1.5">
                                    <div className="w-4 h-4 rounded-full border border-black" />
                                    <div className="w-5 h-2.5 rounded-[3px] border border-black bg-black" />
                                </div>
                            </div>

                            {/* IG Feed Header */}
                            <div className="p-3 border-b border-zinc-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[1.5px]">
                                    <div className="w-full h-full rounded-full bg-white p-[1.5px]">
                                        <div className="w-full h-full rounded-full bg-zinc-200" />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[12px] font-bold">adruby_official</div>
                                    <div className="text-[10px] text-zinc-500 leading-none">Sponsored</div>
                                </div>
                            </div>

                            {/* THE AD CANVAS */}
                            <div className="w-full aspect-square border-b border-zinc-100 relative overflow-hidden">
                                <div className="absolute inset-0 origin-top-left" style={{ transform: `scale(${375 / doc.width})` }}>
                                    <CanvasStage doc={doc} scale={1} selectedLayerId={undefined} onLayerSelect={() => { }} onLayerUpdate={() => { }} />
                                </div>
                            </div>

                            {/* Feed Footer */}
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="w-6 h-6 border-2 border-zinc-800 rounded-full" />
                                        <div className="w-6 h-6 border-2 border-zinc-800 rounded-full" />
                                    </div>
                                    <div className="w-6 h-6 border-2 border-zinc-800 rounded-md" />
                                </div>
                                <div className="text-[12px]"><b>1,248 likes</b></div>
                                <div className="text-[11px] leading-tight">
                                    <b>adruby_official</b> Level up your creative game today with our new AI powered studio...
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Controls Footer */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 text-[11px] font-bold text-white/80 tracking-widest uppercase">
                        <span className="flex items-center gap-2">Format: <span className="text-primary">{doc.format}</span></span>
                        <div className="w-px h-4 bg-white/10" />
                        <span className="flex items-center gap-2">Zoom: <span className="text-primary">{(scale * 100).toFixed(0)}%</span></span>
                    </div>
                </main>

                {/* Right Panel */}
                <aside className="w-80 h-full bg-card border-l border-border z-10 shrink-0">
                    <PropertiesPanel layer={activeLayer} onChange={handleLayerUpdate} onGenerate={handleGenerate} />
                </aside>
            </div>

            {/* VARIANT MODAL */}
            {showVariantModal && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-12 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-7xl h-full max-h-[85%] rounded-[32px] border border-border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-8 border-b border-border flex justify-between items-end">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tight">AI Campaign Variants</h2>
                                <p className="text-muted-foreground text-sm">We generated 4 high-performing candidates for your A/B testing strategy.</p>
                            </div>
                            <button onClick={() => setShowVariantModal(false)} className="bg-muted hover:bg-muted/80 p-3 rounded-2xl transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 grid grid-cols-2 md:grid-cols-4 gap-8 bg-muted/20">
                            {variants.map((v, i) => (
                                <div key={i} className="flex flex-col gap-6 group">
                                    <div className="aspect-[4/5] bg-background rounded-3xl shadow-xl border border-white/5 overflow-hidden relative hover:ring-4 ring-primary hover:scale-[1.02] transition-all duration-300 cursor-pointer" onClick={() => handleApplyVariant(v)}>
                                        <div className="absolute inset-0 transform origin-top-left" style={{ transform: `scale(${280 / v.width})` }}>
                                            <CanvasStage doc={v} scale={1} selectedLayerId={undefined} onLayerSelect={() => { }} onLayerUpdate={() => { }} />
                                        </div>
                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="bg-white text-black px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">Apply Variant</div>
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <h3 className="font-bold text-lg">{v.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground border border-border px-1.5 py-0.5 rounded tracking-tighter">AI Score: 98%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* AUDIT MODAL */}
            {showAuditModal && auditResult && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-4xl rounded-[40px] border border-border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
                        {/* Header */}
                        <div className="p-8 border-b border-border flex justify-between items-center bg-muted/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black tracking-tight">AI Expert Audit</h2>
                                    <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest">Performance Validation Engine</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAuditModal(false)} className="hover:bg-muted p-2 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Left: Score Card */}
                            <div className="space-y-8">
                                <div className="bg-muted p-8 rounded-[32px] flex flex-col items-center justify-center text-center space-y-4 border border-border/50">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Estimated conversion score</span>
                                    <div className="text-8xl font-black tracking-tighter text-emerald-500 drop-shadow-2xl">
                                        {auditResult.score}<span className="text-2xl opacity-40">%</span>
                                    </div>
                                    <div className="px-4 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5">
                                        <TrendingUp className="w-3.5 h-3.5" /> High performing
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> What's working
                                    </h3>
                                    <div className="space-y-2">
                                        {auditResult.positives.map((p, i) => (
                                            <div key={i} className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs font-medium text-emerald-700">
                                                {p}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Improvements */}
                            <div className="space-y-8">
                                {auditResult.criticalIssues.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-red-500">
                                            <AlertCircle className="w-4 h-4" /> Critical Fixes
                                        </h3>
                                        <div className="space-y-2">
                                            {auditResult.criticalIssues.map((c, i) => (
                                                <div key={i} className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-[13px] font-bold text-red-600 leading-snug">
                                                    {c}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                                        <Wand2 className="w-4 h-4" /> Optimization Tips
                                    </h3>
                                    <div className="space-y-3">
                                        {auditResult.improvements.map((imp, i) => (
                                            <div key={i} className="flex gap-4 p-4 bg-muted/40 rounded-2xl border border-border">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black shrink-0">
                                                    {i + 1}
                                                </div>
                                                <p className="text-[13px] font-medium leading-normal">{imp}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border bg-muted/10 flex justify-end">
                            <button
                                onClick={() => setShowAuditModal(false)}
                                className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                            >
                                Apply Suggestions
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* EXPORT MODAL */}
            {showExportModal && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-md rounded-[32px] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                        {/* Header */}
                        <div className="p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-purple-600/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                                    <Download className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black tracking-tight">Export Your Ad</h2>
                                    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Download as Image</p>
                                </div>
                            </div>
                            <button onClick={() => setShowExportModal(false)} className="hover:bg-muted p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="text-center space-y-2">
                                <p className="text-sm text-muted-foreground">Exporting <span className="font-bold text-foreground">{doc.name}</span></p>
                                <p className="text-xs text-muted-foreground/70">{doc.width} × {doc.height}px • 2x Resolution</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleExport('png')}
                                    className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-indigo-500 hover:bg-indigo-500/5 transition-all"
                                >
                                    <ImageIcon className="w-10 h-10 text-indigo-500 group-hover:scale-110 transition-transform" />
                                    <div className="text-center">
                                        <p className="font-black text-sm">PNG</p>
                                        <p className="text-[10px] text-muted-foreground">Transparent bg</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleExport('jpeg')}
                                    className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-purple-500 hover:bg-purple-500/5 transition-all"
                                >
                                    <ImageIcon className="w-10 h-10 text-purple-500 group-hover:scale-110 transition-transform" />
                                    <div className="text-center">
                                        <p className="font-black text-sm">JPEG</p>
                                        <p className="text-[10px] text-muted-foreground">Smaller file</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TEXT-TO-AD AI MODAL */}
            {showTextToAdModal && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-lg rounded-[32px] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black tracking-tight">Text → Ad Magic</h2>
                                    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">AI-Powered Ad Generation</p>
                                </div>
                            </div>
                            <button onClick={() => setShowTextToAdModal(false)} className="hover:bg-muted p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Describe Your Product/Service</label>
                                <textarea
                                    value={textToAdInput}
                                    onChange={(e) => setTextToAdInput(e.target.value)}
                                    placeholder="z.B. 'Premium LED Gaming Desk Setup für Streamer, mit RGB-Beleuchtung und kabelloser Ladefunktion.'"
                                    className="w-full h-32 bg-muted/50 border border-border rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <button
                                onClick={handleGenerateFromText}
                                disabled={isGeneratingAd || !textToAdInput.trim()}
                                className="w-full py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-fuchsia-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isGeneratingAd ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                                ) : (
                                    <><Sparkles className="w-5 h-5" /> Generate Ad</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* BRAND KIT MODAL */}
            {showBrandModal && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-2xl rounded-[32px] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                                    <Palette className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black tracking-tight">Brand Kit</h2>
                                    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Apply Your Brand Identity</p>
                                </div>
                            </div>
                            <button onClick={() => setShowBrandModal(false)} className="hover:bg-muted p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {brandKits.map((brand) => (
                                <button
                                    key={brand.id}
                                    onClick={() => handleApplyBrand(brand)}
                                    className="group p-4 rounded-2xl border-2 border-border hover:border-primary transition-all text-left"
                                >
                                    <div className="flex gap-1 mb-3">
                                        {Object.values(brand.colors).map((color, i) => (
                                            <div key={i} className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: color }} />
                                        ))}
                                    </div>
                                    <p className="font-bold text-sm">{brand.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{brand.fonts.heading}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* SMART RESIZE MODAL */}
            {showResizeModal && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-3xl rounded-[32px] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
                                    <Maximize2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black tracking-tight">Smart Resize</h2>
                                    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">AI-Powered Format Conversion</p>
                                </div>
                            </div>
                            <button onClick={() => setShowResizeModal(false)} className="hover:bg-muted p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-muted-foreground mb-4">Current: {doc.width} × {doc.height}px</p>
                            <div className="grid grid-cols-3 gap-3">
                                {FORMAT_PRESETS.map((format) => (
                                    <button
                                        key={format.id}
                                        onClick={() => handleSmartResize(format)}
                                        className={`group p-4 rounded-2xl border-2 transition-all text-left ${doc.width === format.width && doc.height === format.height
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50 hover:bg-muted/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div
                                                className="bg-zinc-700 rounded"
                                                style={{
                                                    width: 24 * (format.width / Math.max(format.width, format.height)),
                                                    height: 24 * (format.height / Math.max(format.width, format.height))
                                                }}
                                            />
                                            <span className="font-bold text-sm">{format.name}</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">{format.width}×{format.height}</p>
                                        <p className="text-[9px] text-muted-foreground/60 mt-1">{format.platform}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
