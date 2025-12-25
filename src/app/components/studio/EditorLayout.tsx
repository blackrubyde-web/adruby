import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

// Icons & UI
// (Most icons moved to sub-components, checking if any needed here)

// Types
import type { AdDocument, StudioLayer, BrandKit } from '../../types/studio';
import type { AuditResult } from './PerformanceAudit';
import { performAudit } from './PerformanceAudit';

// API & Utils
import { creativeGenerate, creativeGenerateImage, creativeEditImage } from '../../lib/api/creative';
import { smartResize, type FormatPreset } from './SmartResize';

// Sub-components
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
    height: 1350,
    layers: [
        {
            id: 'bg-1',
            type: 'image',
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
            visible: true
        }
    ],
    backgroundColor: '#000000'
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
    const [selectedLayerId, setSelectedLayerId] = useState<string | undefined>(undefined);
    const [activeTab, setActiveTab] = useState<'layers' | 'assets' | 'remix'>('layers');
    const [scale, setScale] = useState(0.45);
    const [history, setHistory] = useState<AdDocument[]>([initialDoc || MOCK_DOC]);
    const [historyIndex, setHistoryIndex] = useState(0);

    // Tools & Modes
    const [activeTool, setActiveTool] = useState<'select' | 'hand'>('select');
    const [isMultiverseOpen, setIsMultiverseOpen] = useState(false);
    const [isMockupView, setIsMockupView] = useState(false);
    const [mockupType, setMockupType] = useState<'instagram' | 'linkedin'>('instagram');

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
    const [isSaving, setIsSaving] = useState(false);

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
    }, [doc]);

    // Sync initialDoc if provided (and different)
    useEffect(() => {
        if (initialDoc) {
            setDoc(initialDoc);
            setHistory([initialDoc]);
            setHistoryIndex(0);
        }
    }, [initialDoc]);

    // Handle Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) handleRedo(); else handleUndo();
            }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedLayerId) {
                    setDoc(prev => ({
                        ...prev,
                        layers: prev.layers.filter(l => l.id !== selectedLayerId)
                    }));
                    setSelectedLayerId(undefined);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedLayerId, historyIndex]);


    // --- Handlers ---

    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setDoc(history[historyIndex - 1]);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setDoc(history[historyIndex + 1]);
        }
    };

    const handleLayerUpdate = (layerId: string, attrs: Partial<StudioLayer>) => {
        setDoc(prev => ({
            ...prev,
            layers: prev.layers.map(l => l.id === layerId ? { ...l, ...attrs } : l)
        }));
    };

    const handleLayerReorder = (newLayers: StudioLayer[]) => {
        setDoc(prev => ({ ...prev, layers: newLayers }));
    };

    const handleLayerSelect = (layerId?: string) => {
        setSelectedLayerId(layerId);
    };

    // AI & Image Generators
    const handleGenerate = async (layerId: string, task: 'bg' | 'text') => {
        const layer = doc.layers.find(l => l.id === layerId);
        if (!layer) return;

        toast.info('AI Magic in progress...');
        try {
            if (task === 'text' && layer.type === 'text') {
                const res = await creativeGenerate({
                    type: 'copy',
                    prompt: `Rewrite this ad copy to be more punchy and viral: "${layer.text}"`,
                    context: { brandName: 'Nike', industry: 'Sportswear' }
                });
                if (res.content) {
                    handleLayerUpdate(layerId, { text: res.content });
                    toast.success('Copy updated!');
                }
            } else if (task === 'bg') {
                // Mock BG removal/replacement
                toast.success('Background processed!');
            }
        } catch (e) {
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

    const handleExport = (format: 'png' | 'jpeg') => {
        toast.success(`Exporting as ${format.toUpperCase()}...`);
        setShowExportModal(false);
    };

    // Missing handlers implemented as placeholders or calls to existing APIs
    const handleAdaptImage = useCallback((id: string) => {
        // Placeholder for adapt image feature
        toast.info("Adapt Image feature coming soon!");
    }, []);

    const handleGenerateScene = useCallback((id: string, prompt: string, style: string) => {
        toast.info(`Generating scene with prompt: ${prompt}`);
    }, []);

    const handleReplaceBackground = useCallback((id: string, prompt: string) => {
        toast.info(`Replacing background with: ${prompt}`);
    }, []);

    const handleEnhanceImage = useCallback((id: string) => {
        toast.info("Enhancing image resolution...");
    }, []);


    return (
        <div className="h-screen w-full bg-background flex flex-col overflow-hidden font-sans text-foreground">

            <EditorToolbar
                docName={doc.name}
                onClose={onClose}
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                zoom={Math.round(scale * 100)}
                isMultiverseOpen={isMultiverseOpen}
                setIsMultiverseOpen={setIsMultiverseOpen}
                isMockupView={isMockupView}
                setIsMockupView={setIsMockupView}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                onRunAudit={handleRunAudit}
                onNewAd={() => setShowAdWizard(true)}
                onShowSuggestions={() => setShowSuggestions(!showSuggestions)}
                hasSuggestions={false} // Would be dynamic
                onTextToAd={() => setShowTextToAdModal(true)}
                onShowBrand={() => setShowBrandModal(true)}
                onResize={() => setShowResizeModal(true)}
                onShare={() => toast.success('Link copied!')}
                onExport={() => setShowExportModal(true)}
                onSave={handleSave}
                isSaving={isSaving}
            />

            <div className="flex flex-1 overflow-hidden relative">

                <EditorSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    doc={doc}
                    onLayerReorder={handleLayerReorder}
                    onLayerSelect={handleLayerSelect}
                    selectedLayerId={selectedLayerId}
                    onImportImage={(src) => {
                        const newLayer: StudioLayer = {
                            id: uuidv4(),
                            type: 'image',
                            name: 'Imported Image',
                            src,
                            x: 0,
                            y: 0,
                            width: 500,
                            height: 500,
                            rotation: 0,
                            opacity: 1,
                            visible: true
                        };
                        setDoc(d => ({ ...d, layers: [...d.layers, newLayer] }));
                        toast.success('Image added');
                    }}
                />

                <EditorCanvas
                    doc={doc}
                    scale={scale}
                    activeTool={activeTool}
                    selectedLayerId={selectedLayerId}
                    onLayerUpdate={handleLayerUpdate}
                    onLayerSelect={handleLayerSelect}
                    isMultiverseOpen={isMultiverseOpen}
                    isMockupView={isMockupView}
                    mockupType={mockupType}
                    setMockupType={setMockupType}
                    onGenerateVariants={handleGenerateVariants}
                />

                <EditorRightPanel
                    activeLayer={doc.layers.find(l => l.id === selectedLayerId)}
                    onLayerUpdate={handleLayerUpdate}
                    onGenerate={handleGenerate}
                    onAdapt={handleAdaptImage}
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
