import { memo, useCallback, useState, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './canvas-styles.css';
import {
    X, Save, Sparkles, Play, Loader2, Undo2, Redo2,
    Plus, FolderOpen, Trash2, Check, Clock,
    ChevronDown, PanelLeftClose, PanelRightClose,
    Zap, MousePointer, Layers, ArrowRight, PartyPopper, Upload, Eye
} from 'lucide-react';
import { CampaignCanvasProvider, useCampaignCanvas } from './CampaignCanvasContext';
import { CampaignNode, AdSetNode, AdNode } from './nodes';
import { AssetSidebar } from './AssetSidebar';
import { PropertiesPanel } from './PropertiesPanel';
import type { DraggableAsset, CampaignCanvasNodeData } from './types';

// Register custom node types
const nodeTypes: NodeTypes = {
    campaign: CampaignNode,
    adset: AdSetNode,
    ad: AdNode,
};

interface CampaignCanvasLayoutProps {
    onClose: () => void;
}

// Onboarding overlay component
const OnboardingOverlay = memo(function OnboardingOverlay({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);

    const steps = [
        {
            icon: Layers,
            title: 'Willkommen zum Visual Campaign Builder',
            description: 'Baue deine Meta-Kampagnen visuell mit Drag & Drop. Jede Kampagne besteht aus Ad Sets und Ads.',
            highlight: 'center',
        },
        {
            icon: MousePointer,
            title: 'Kampagnenstruktur aufbauen',
            description: 'Klicke "Add Ad Set" auf der Campaign-Node, dann "Add Ad" auf den Ad Sets.',
            highlight: 'canvas',
        },
        {
            icon: Zap,
            title: 'Assets per Drag & Drop',
            description: 'Ziehe Creatives, Hooks und Strategien aus der linken Sidebar auf deine Nodes.',
            highlight: 'left',
        },
        {
            icon: Sparkles,
            title: 'AI-Optimierung nutzen',
            description: 'Klicke "AI Review" für intelligente Vorschläge zur Verbesserung deiner Kampagne.',
            highlight: 'right',
        },
    ];

    const currentStep = steps[step];
    const isLast = step === steps.length - 1;

    return (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
            <div className="max-w-lg w-full mx-4">
                {/* Progress dots */}
                <div className="flex justify-center gap-2 mb-6">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all ${i === step ? 'w-8 bg-primary' : i < step ? 'bg-primary/50' : 'bg-white/20'
                                }`}
                        />
                    ))}
                </div>

                {/* Card */}
                <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-6 mx-auto">
                        <currentStep.icon className="w-8 h-8 text-primary" />
                    </div>

                    <h2 className="text-2xl font-bold text-center mb-3">{currentStep.title}</h2>
                    <p className="text-muted-foreground text-center mb-8">{currentStep.description}</p>

                    <div className="flex gap-3">
                        <button
                            onClick={onComplete}
                            className="flex-1 py-3 bg-muted hover:bg-muted/80 rounded-xl text-sm font-medium transition-colors"
                        >
                            Überspringen
                        </button>
                        <button
                            onClick={() => isLast ? onComplete() : setStep(s => s + 1)}
                            className="flex-1 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {isLast ? (
                                <>
                                    Los geht's
                                    <PartyPopper className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    Weiter
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

// Empty state component
const EmptyCanvasState = memo(function EmptyCanvasState() {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center max-w-md px-4">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                    <Layers className="w-12 h-12 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Deine Kampagne ist leer</h3>
                <p className="text-muted-foreground text-sm mb-6">
                    Klicke auf die Campaign-Node und füge Ad Sets hinzu, um loszulegen.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Tipp: Ziehe Creatives aus der Sidebar direkt auf deine Nodes</span>
                </div>
            </div>
        </div>
    );
});

// Success confetti effect
const ConfettiEffect = memo(function ConfettiEffect({ trigger }: { trigger: boolean }) {
    const [particles, setParticles] = useState<Array<{ id: number; left: number; color: string; delay: number }>>([]);

    useEffect(() => {
        if (trigger) {
            const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
            const newParticles = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                left: Math.random() * 100,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 0.5,
            }));
            setParticles(newParticles);

            const timeout = setTimeout(() => setParticles([]), 3500);
            return () => clearTimeout(timeout);
        }
    }, [trigger]);

    if (particles.length === 0) return null;

    return (
        <>
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="confetti-piece"
                    style={{
                        left: `${p.left}%`,
                        backgroundColor: p.color,
                        animationDelay: `${p.delay}s`,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                    }}
                />
            ))}
        </>
    );
});

function CanvasContent({ onClose }: CampaignCanvasLayoutProps) {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        setSelectedNodeId,
        addAdNode,
        dropCreativeOnNode,

        // Draft management
        draftId,
        draftName,
        setDraftName,
        drafts,
        loadDraft,
        createNewDraft,
        deleteDraft,

        // Undo/Redo
        canUndo,
        canRedo,
        undo,
        redo,

        // Persistence
        isDirty,
        isSaving,
        isLoading,
        lastSaved,
        saveDraft,

        // AI
        runAIAnalysis,
        isAnalyzing,

        // Export
        exportToMeta,
        isExporting,
    } = useCampaignCanvas();

    const [showDraftMenu, setShowDraftMenu] = useState(false);
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
    const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Check if user has seen onboarding
    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('canvas-onboarding-seen');
        if (!hasSeenOnboarding) {
            setShowOnboarding(true);
        }
    }, []);

    const completeOnboarding = useCallback(() => {
        localStorage.setItem('canvas-onboarding-seen', 'true');
        setShowOnboarding(false);
    }, []);

    // Handle preview export (format only, no API push)
    const handlePreview = useCallback(async () => {
        setShowExportMenu(false);
        const result = await exportToMeta(false);
        if (result.success) {
            setShowConfetti(true);
        }
    }, [exportToMeta]);

    // Handle real push to Meta API
    const handlePushToMeta = useCallback(async () => {
        setShowExportMenu(false);
        const result = await exportToMeta(true);
        if (result.success) {
            setShowConfetti(true);
        }
    }, [exportToMeta]);

    // Handle node selection
    const handleNodeClick = useCallback((_: React.MouseEvent, node: { id: string }) => {
        setSelectedNodeId(node.id);
    }, [setSelectedNodeId]);

    // Handle pane click (deselect)
    const handlePaneClick = useCallback(() => {
        setSelectedNodeId(null);
        setShowDraftMenu(false);
        setShowExportMenu(false);
    }, [setSelectedNodeId]);

    // Handle drop from sidebar
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const assetData = e.dataTransfer.getData('application/campaign-asset');
        if (!assetData) return;

        try {
            const asset: DraggableAsset = JSON.parse(assetData);

            // Check if dropped on a specific node
            const target = e.target as HTMLElement;
            const nodeElement = target.closest('[data-id]');
            if (nodeElement) {
                const nodeId = nodeElement.getAttribute('data-id');
                if (nodeId) {
                    dropCreativeOnNode(nodeId, asset);
                    return;
                }
            }

            // Otherwise, add to first adset
            const adsetNodes = nodes.filter((n) => n.data.type === 'adset');
            if (adsetNodes.length > 0) {
                addAdNode(adsetNodes[0].id, asset);
            }
        } catch (err) {
            console.error('[CanvasContent] Drop error:', err);
        }
    }, [nodes, addAdNode, dropCreativeOnNode]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, []);

    // Check if canvas is essentially empty (only root campaign)
    const isCanvasEmpty = nodes.length === 1 && nodes[0].data.type === 'campaign';

    return (
        <div className="fixed inset-0 z-[9999] bg-background flex flex-col animate-in fade-in zoom-in-95 duration-300">
            {/* Onboarding overlay */}
            {showOnboarding && <OnboardingOverlay onComplete={completeOnboarding} />}

            {/* Confetti */}
            <ConfettiEffect trigger={showConfetti} />

            {/* Header */}
            <div className="h-14 bg-card/80 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-4 gap-4">
                {/* Left section */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-xl transition-all hover:scale-105"
                        title="Schließen"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Draft selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDraftMenu(!showDraftMenu)}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-xl transition-colors"
                        >
                            <FolderOpen className="w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={draftName}
                                onChange={(e) => setDraftName(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm font-semibold max-w-[180px]"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>

                        {showDraftMenu && (
                            <div className="absolute top-full left-0 mt-2 w-72 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                <div className="p-2 border-b border-border/50">
                                    <button
                                        onClick={() => { createNewDraft(); setShowDraftMenu(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-muted rounded-xl text-sm transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Neuer Draft
                                    </button>
                                </div>
                                <div className="max-h-64 overflow-y-auto p-2">
                                    {drafts.length === 0 ? (
                                        <p className="text-xs text-muted-foreground text-center py-4">Keine Drafts</p>
                                    ) : (
                                        drafts.map((draft) => (
                                            <div
                                                key={draft.id}
                                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted group transition-colors ${draft.id === draftId ? 'bg-primary/10 ring-1 ring-primary/30' : ''}`}
                                            >
                                                <button
                                                    onClick={() => { loadDraft(draft.id); setShowDraftMenu(false); }}
                                                    className="flex-1 text-left"
                                                >
                                                    <p className="text-sm font-medium truncate">{draft.name || 'Unbenannt'}</p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {new Date(draft.updated_at).toLocaleDateString('de-DE')}
                                                    </p>
                                                </button>
                                                {draft.id !== draftId && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteDraft(draft.id); }}
                                                        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Auto-save indicator */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-1.5 bg-muted/30 rounded-full">
                        {isSaving ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Speichern...</span>
                            </>
                        ) : lastSaved ? (
                            <>
                                <Check className="w-3 h-3 text-green-500" />
                                <span>{lastSaved.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
                            </>
                        ) : isDirty ? (
                            <>
                                <Clock className="w-3 h-3 text-yellow-500" />
                                <span>Ungespeichert</span>
                            </>
                        ) : null}
                    </div>
                </div>

                {/* Center section - Undo/Redo */}
                <div className="flex items-center gap-1 bg-muted/30 rounded-xl p-1 backdrop-blur">
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        className="p-2.5 hover:bg-muted rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105"
                        title="Rückgängig (⌘Z)"
                    >
                        <Undo2 className="w-4 h-4" />
                    </button>
                    <div className="w-px h-5 bg-border/50" />
                    <button
                        onClick={redo}
                        disabled={!canRedo}
                        className="p-2.5 hover:bg-muted rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105"
                        title="Wiederholen (⌘⇧Z)"
                    >
                        <Redo2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Right section - Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={runAIAnalysis}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-400 rounded-xl font-medium text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 border border-purple-500/20"
                    >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        AI Review
                    </button>
                    <button
                        onClick={saveDraft}
                        disabled={isSaving || !isDirty}
                        className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 hover:bg-muted rounded-xl font-medium text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Speichern
                    </button>

                    {/* Export Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            disabled={isExporting || nodes.length < 2}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-primary/25"
                        >
                            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            Export
                            <ChevronDown className="w-3 h-3" />
                        </button>

                        {/* Export dropdown menu */}
                        {showExportMenu && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button
                                    onClick={handlePreview}
                                    disabled={isExporting}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
                                >
                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm font-medium">Vorschau</div>
                                        <div className="text-xs text-muted-foreground">JSON-Format anzeigen</div>
                                    </div>
                                </button>
                                <div className="border-t border-border/50" />
                                <button
                                    onClick={handlePushToMeta}
                                    disabled={isExporting}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
                                >
                                    <Upload className="w-4 h-4 text-green-500" />
                                    <div>
                                        <div className="text-sm font-medium text-green-500">Push to Meta</div>
                                        <div className="text-xs text-muted-foreground">Kampagne zu Meta Ads senden</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Left Sidebar Toggle (Mobile) */}
                <button
                    onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                    className="absolute left-2 top-2 z-10 p-2 bg-card/80 backdrop-blur border border-border/50 rounded-xl md:hidden hover:scale-105 transition-all"
                >
                    <PanelLeftClose className="w-4 h-4" />
                </button>

                {/* Left Sidebar - Assets */}
                <div className={`canvas-sidebar transition-all duration-300 ${leftSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'} max-md:absolute max-md:left-0 max-md:top-0 max-md:h-full max-md:z-20 max-md:shadow-2xl`}>
                    <AssetSidebar />
                </div>

                {/* Center Canvas */}
                <div
                    className="flex-1 relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    {/* Loading overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                                <span className="text-sm text-muted-foreground">Lade Draft...</span>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {isCanvasEmpty && !isLoading && <EmptyCanvasState />}

                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={handleNodeClick}
                        onPaneClick={handlePaneClick}
                        fitView
                        fitViewOptions={{ padding: 0.2 }}
                        defaultEdgeOptions={{
                            animated: true,
                            style: { strokeWidth: 2.5 },
                        }}
                        proOptions={{ hideAttribution: true }}
                        className="bg-transparent"
                        deleteKeyCode={['Backspace', 'Delete']}
                        multiSelectionKeyCode="Shift"
                    >
                        {/* SVG Gradient definitions */}
                        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                            <defs>
                                <linearGradient id="gradient-campaign-adset" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#3b82f6" />
                                </linearGradient>
                                <linearGradient id="gradient-adset-ad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#22c55e" />
                                </linearGradient>
                            </defs>
                        </svg>

                        <Background color="#333" gap={24} size={1} />
                        <Controls className="!rounded-2xl !overflow-hidden" />
                        <MiniMap
                            nodeColor={(node) => {
                                switch ((node.data as CampaignCanvasNodeData)?.type) {
                                    case 'campaign': return '#6366f1';
                                    case 'adset': return '#3b82f6';
                                    case 'ad': return '#22c55e';
                                    default: return '#666';
                                }
                            }}
                            maskColor="rgba(0, 0, 0, 0.8)"
                            className="!rounded-2xl"
                        />
                    </ReactFlow>
                </div>

                {/* Right Sidebar Toggle (Mobile) */}
                <button
                    onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                    className="absolute right-2 top-2 z-10 p-2 bg-card/80 backdrop-blur border border-border/50 rounded-xl md:hidden hover:scale-105 transition-all"
                >
                    <PanelRightClose className="w-4 h-4" />
                </button>

                {/* Right Panel - Properties */}
                <div className={`canvas-sidebar transition-all duration-300 ${rightSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'} max-md:absolute max-md:right-0 max-md:top-0 max-md:h-full max-md:z-20 max-md:shadow-2xl`}>
                    <PropertiesPanel />
                </div>
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[11px] text-muted-foreground/40 pointer-events-none hidden md:flex bg-card/30 backdrop-blur-sm px-4 py-2 rounded-full border border-border/20">
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-muted/50 rounded text-[10px]">⌘Z</kbd> Undo</span>
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-muted/50 rounded text-[10px]">⌘⇧Z</kbd> Redo</span>
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-muted/50 rounded text-[10px]">⌫</kbd> Delete</span>
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-muted/50 rounded text-[10px]">Shift</kbd> Multi-select</span>
            </div>
        </div>
    );
}

export const CampaignCanvasLayout = memo(function CampaignCanvasLayout(props: CampaignCanvasLayoutProps) {
    return (
        <CampaignCanvasProvider>
            <CanvasContent {...props} />
        </CampaignCanvasProvider>
    );
});
