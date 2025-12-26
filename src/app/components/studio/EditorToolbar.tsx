import React, { useState } from 'react';
import { X, Save, Share2, ShieldCheck, Download, Undo2, Redo2, Sparkles, Palette, Maximize2, Hand, MousePointer2, Zap, PlusCircle, MoreHorizontal, Menu } from 'lucide-react';
import type { AdDocument } from '../../types/studio';

interface EditorToolbarProps {
    doc: AdDocument;
    onClose?: () => void;
    activeTool: 'select' | 'hand';
    setActiveTool: (tool: 'select' | 'hand') => void;
    isMultiverseMode: boolean;
    setIsMultiverseMode: (val: boolean) => void;
    isPreviewMode: boolean;
    setIsPreviewMode: (val: boolean) => void;
    historyIndex: number;
    historyLength: number;
    onUndo: () => void;
    onRedo: () => void;
    onAudit: () => void;
    onShowAdWizard: () => void;
    onToggleSuggestions: () => void;
    showSuggestions: boolean;
    onShowTextToAd: () => void;
    onShowBrand: () => void;
    onShowResize: () => void;
    onShowExport: () => void;
    onSave?: (doc: AdDocument) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    doc,
    onClose,
    activeTool,
    setActiveTool,
    isMultiverseMode,
    setIsMultiverseMode,
    isPreviewMode,
    setIsPreviewMode,
    historyIndex,
    historyLength,
    onUndo,
    onRedo,
    onAudit,
    onShowAdWizard,
    onToggleSuggestions,
    showSuggestions,
    onShowTextToAd,
    onShowBrand,
    onShowResize,
    onShowExport,
    onSave
}) => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    return (
        <div className="h-14 md:h-16 border-b border-border/50 flex items-center justify-between px-3 md:px-6 bg-background dark:bg-gradient-to-r dark:from-card dark:via-card dark:to-card/95 backdrop-blur-xl z-30 shrink-0 shadow-sm">
            {/* Left Section */}
            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all text-muted-foreground shrink-0"
                    title="Schließen"
                >
                    <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                {/* Tool Toggle - Responsive */}
                <div className="hidden sm:flex items-center bg-muted/50 dark:bg-muted/50 backdrop-blur-sm rounded-lg p-0.5 border border-border/50 h-9">
                    <button
                        onClick={() => setActiveTool('select')}
                        className={`px-2 md:px-3 h-full rounded-md transition-all flex items-center gap-1.5 ${activeTool === 'select'
                                ? 'bg-background dark:bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                        title="Auswahl (V)"
                    >
                        <MousePointer2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="text-[9px] md:text-[10px] font-bold uppercase hidden md:inline">Auswahl</span>
                    </button>
                    <button
                        onClick={() => setActiveTool('hand')}
                        className={`px-2 md:px-3 h-full rounded-md transition-all flex items-center gap-1.5 ${activeTool === 'hand'
                                ? 'bg-background dark:bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                        title="Hand (H)"
                    >
                        <Hand className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="text-[9px] md:text-[10px] font-bold uppercase hidden md:inline">Bewegen</span>
                    </button>
                </div>

                <div className="hidden md:block h-8 w-px bg-border/50" />

                {/* Document Info - Responsive */}
                <div className="flex flex-col min-w-0 flex-1 md:flex-initial">
                    <h1 className="font-bold text-xs md:text-sm tracking-tight truncate">{doc.name}</h1>
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="text-[8px] md:text-[9px] text-muted-foreground uppercase font-bold bg-gradient-to-r from-primary/20 to-purple-500/20 dark:from-primary/20 dark:to-purple-500/20 text-primary px-1.5 md:px-2 py-0.5 rounded-full">
                            Studio Pro
                        </span>
                        <span className="text-[8px] md:text-[9px] text-muted-foreground hidden sm:inline">{doc.width}×{doc.height}</span>
                    </div>
                </div>
            </div>

            {/* Right Section - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
                {/* View Modes */}
                <div className="flex items-center bg-muted dark:bg-muted rounded-lg p-0.5 border border-border h-9">
                    <button
                        onClick={() => setIsMultiverseMode(!isMultiverseMode)}
                        className={`px-3 h-full text-[10px] font-bold rounded-md transition-all ${isMultiverseMode
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Multiverse
                    </button>
                    <button
                        onClick={() => {
                            setIsPreviewMode(!isPreviewMode);
                            if (!isPreviewMode) setIsMultiverseMode(false);
                        }}
                        className={`px-3 h-full text-[10px] font-bold rounded-md transition-all ${isPreviewMode
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Mockup
                    </button>
                </div>

                {/* Undo/Redo */}
                <div className="flex items-center gap-1 bg-muted dark:bg-muted rounded-lg p-0.5 border border-border h-9">
                    <button
                        onClick={onUndo}
                        disabled={historyIndex <= 0}
                        className={`px-2 h-full rounded-md transition-all ${historyIndex > 0
                                ? 'hover:bg-background dark:hover:bg-background text-foreground'
                                : 'text-muted-foreground/40 cursor-not-allowed'
                            }`}
                        title="Rückgängig (⌘Z)"
                    >
                        <Undo2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onRedo}
                        disabled={historyIndex >= historyLength - 1}
                        className={`px-2 h-full rounded-md transition-all ${historyIndex < historyLength - 1
                                ? 'hover:bg-background dark:hover:bg-background text-foreground'
                                : 'text-muted-foreground/40 cursor-not-allowed'
                            }`}
                        title="Wiederholen (⌘⇧Z)"
                    >
                        <Redo2 className="w-4 h-4" />
                    </button>
                </div>

                <button
                    onClick={onAudit}
                    className="flex items-center gap-2 px-3 h-9 text-xs font-bold bg-muted dark:bg-muted hover:bg-muted/80 dark:hover:bg-muted/80 text-foreground rounded-lg transition-all border border-border group"
                >
                    <ShieldCheck className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span className="hidden xl:inline">Audit</span>
                </button>

                <button
                    onClick={onShowAdWizard}
                    className="flex items-center gap-2 px-3 h-9 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                >
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden xl:inline">Neue Ad</span>
                </button>

                <button
                    onClick={onToggleSuggestions}
                    className={`flex items-center gap-2 px-3 h-9 text-xs font-bold rounded-lg transition-all ${showSuggestions
                            ? 'bg-violet-500 text-white'
                            : 'bg-muted dark:bg-muted hover:bg-muted/80 dark:hover:bg-muted/80 text-foreground border border-border'
                        }`}
                >
                    <Zap className={`w-4 h-4 ${showSuggestions ? 'text-white' : 'text-violet-500'}`} />
                    <span className="hidden xl:inline">AI Tips</span>
                </button>

                <button
                    onClick={onShowTextToAd}
                    className="flex items-center gap-2 px-3 h-9 text-xs font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all"
                >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden xl:inline">Text→Ad</span>
                </button>

                <button
                    onClick={onShowBrand}
                    className="flex items-center gap-2 px-3 h-9 text-xs font-bold bg-muted dark:bg-muted hover:bg-muted/80 dark:hover:bg-muted/80 text-foreground rounded-lg transition-all border border-border group"
                >
                    <Palette className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span className="hidden xl:inline">Brand</span>
                </button>

                <button
                    onClick={onShowResize}
                    className="flex items-center gap-2 px-3 h-9 text-xs font-bold bg-muted dark:bg-muted hover:bg-muted/80 dark:hover:bg-muted/80 text-foreground rounded-lg transition-all border border-border group"
                >
                    <Maximize2 className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
                    <span className="hidden xl:inline">Resize</span>
                </button>

                <button
                    onClick={onShowExport}
                    className="flex items-center gap-2 px-4 h-9 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                    <Download className="w-4 h-4" />
                    <span className="hidden xl:inline">Export</span>
                </button>

                <button
                    onClick={() => onSave?.(doc)}
                    className="flex items-center gap-2 px-5 h-9 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all"
                >
                    <Save className="w-4 h-4" />
                    Speichern
                </button>
            </div>

            {/* Right Section - Mobile/Tablet */}
            <div className="flex lg:hidden items-center gap-2">
                {/* Undo/Redo - Always visible */}
                <div className="flex items-center gap-0.5 bg-muted dark:bg-muted rounded-lg p-0.5 border border-border h-9">
                    <button
                        onClick={onUndo}
                        disabled={historyIndex <= 0}
                        className={`px-2 h-full rounded-md transition-all ${historyIndex > 0
                                ? 'hover:bg-background dark:hover:bg-background text-foreground'
                                : 'text-muted-foreground/40 cursor-not-allowed'
                            }`}
                    >
                        <Undo2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onRedo}
                        disabled={historyIndex >= historyLength - 1}
                        className={`px-2 h-full rounded-md transition-all ${historyIndex < historyLength - 1
                                ? 'hover:bg-background dark:hover:bg-background text-foreground'
                                : 'text-muted-foreground/40 cursor-not-allowed'
                            }`}
                    >
                        <Redo2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Save Button - Always visible */}
                <button
                    onClick={() => onSave?.(doc)}
                    className="flex items-center gap-1.5 px-3 h-9 text-xs font-bold bg-primary text-primary-foreground rounded-lg transition-all shrink-0"
                >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">Speichern</span>
                </button>

                {/* More Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="p-2 hover:bg-muted dark:hover:bg-muted rounded-lg transition-all text-foreground"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {showMobileMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowMobileMenu(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-56 bg-background dark:bg-card border border-border rounded-xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button
                                    onClick={() => { onShowAdWizard(); setShowMobileMenu(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted dark:hover:bg-muted/50 text-sm font-medium text-foreground transition-colors"
                                >
                                    <PlusCircle className="w-4 h-4 text-emerald-500" />
                                    Neue Ad
                                </button>
                                <button
                                    onClick={() => { onToggleSuggestions(); setShowMobileMenu(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted dark:hover:bg-muted/50 text-sm font-medium text-foreground transition-colors"
                                >
                                    <Zap className="w-4 h-4 text-violet-500" />
                                    AI Tips
                                </button>
                                <button
                                    onClick={() => { onShowTextToAd(); setShowMobileMenu(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted dark:hover:bg-muted/50 text-sm font-medium text-foreground transition-colors"
                                >
                                    <Sparkles className="w-4 h-4 text-fuchsia-500" />
                                    Text→Ad
                                </button>
                                <div className="h-px bg-border my-2" />
                                <button
                                    onClick={() => { onAudit(); setShowMobileMenu(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted dark:hover:bg-muted/50 text-sm font-medium text-foreground transition-colors"
                                >
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    AI Audit
                                </button>
                                <button
                                    onClick={() => { onShowBrand(); setShowMobileMenu(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted dark:hover:bg-muted/50 text-sm font-medium text-foreground transition-colors"
                                >
                                    <Palette className="w-4 h-4 text-amber-500" />
                                    Brand Kit
                                </button>
                                <button
                                    onClick={() => { onShowResize(); setShowMobileMenu(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted dark:hover:bg-muted/50 text-sm font-medium text-foreground transition-colors"
                                >
                                    <Maximize2 className="w-4 h-4 text-cyan-500" />
                                    Resize
                                </button>
                                <div className="h-px bg-border my-2" />
                                <button
                                    onClick={() => { onShowExport(); setShowMobileMenu(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted dark:hover:bg-muted/50 text-sm font-medium text-foreground transition-colors"
                                >
                                    <Download className="w-4 h-4 text-indigo-500" />
                                    Export
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
