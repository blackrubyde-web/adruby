import React from 'react';
import { X, Save, Share2, ShieldCheck, Download, Undo2, Redo2, Sparkles, Palette, Maximize2, Hand, MousePointer2, Zap, PlusCircle } from 'lucide-react';
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
    return (
        <div className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-gradient-to-r from-card via-card to-card/95 backdrop-blur-xl z-30 shrink-0 shadow-lg shadow-black/5">
            <div className="flex items-center gap-4">
                <button onClick={onClose} className="p-2.5 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all text-muted-foreground">
                    <X className="w-5 h-5" />
                </button>

                {/* Tool Toggle - Premium Style */}
                <div className="flex items-center bg-muted/50 backdrop-blur-sm rounded-xl p-1 border border-border/50 h-10">
                    <button
                        onClick={() => setActiveTool('select')}
                        className={`px-3 h-full rounded-lg transition-all flex items-center gap-2 ${activeTool === 'select' ? 'bg-background text-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                        title="Auswahl-Werkzeug (V)"
                    >
                        <MousePointer2 className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase hidden sm:inline">Auswahl</span>
                    </button>
                    <button
                        onClick={() => setActiveTool('hand')}
                        className={`px-3 h-full rounded-lg transition-all flex items-center gap-2 ${activeTool === 'hand' ? 'bg-background text-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                        title="Hand-Werkzeug (H)"
                    >
                        <Hand className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase hidden sm:inline">Bewegen</span>
                    </button>
                </div>

                <div className="h-8 w-px bg-border/50" />

                <div className="flex flex-col">
                    <h1 className="font-bold text-sm tracking-tight">{doc.name}</h1>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary px-2 py-0.5 rounded-full">Studio Pro</span>
                        <span className="text-[9px] text-muted-foreground">{doc.width}×{doc.height}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Premium Toggles */}
                <div className="flex items-center bg-muted rounded-lg p-1 mr-2 border border-border h-9">
                    <button
                        onClick={() => setIsMultiverseMode(!isMultiverseMode)}
                        className={`px-3 h-full text-[10px] font-bold rounded-md transition-all flex items-center ${isMultiverseMode ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Multiverse
                    </button>
                    <button
                        onClick={() => {
                            setIsPreviewMode(!isPreviewMode);
                            if (!isPreviewMode) setIsMultiverseMode(false); // Disable multiverse in mockup
                        }}
                        className={`px-3 h-full text-[10px] font-bold rounded-md transition-all flex items-center ${isPreviewMode ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Mockup
                    </button>
                </div>

                {/* Undo/Redo */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1 border border-border h-9">
                    <button
                        onClick={onUndo}
                        disabled={historyIndex <= 0}
                        className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${historyIndex > 0 ? 'hover:bg-background text-foreground' : 'text-muted-foreground/40 cursor-not-allowed'}`}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onRedo}
                        disabled={historyIndex >= historyLength - 1}
                        className={`px-2 h-full rounded-md transition-all flex items-center justify-center ${historyIndex < historyLength - 1 ? 'hover:bg-background text-foreground' : 'text-muted-foreground/40 cursor-not-allowed'}`}
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo2 className="w-4 h-4" />
                    </button>
                </div>

                <button
                    onClick={onAudit}
                    className="flex items-center gap-2 px-4 h-9 text-xs font-bold bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-all border border-border group"
                >
                    <ShieldCheck className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                    AI Audit
                </button>

                {/* PREMIUM FEATURE BUTTONS */}
                <button
                    onClick={onShowAdWizard}
                    className="flex items-center gap-2 px-4 h-9 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                >
                    <PlusCircle className="w-4 h-4" /> Neue Ad
                </button>
                <button
                    onClick={onToggleSuggestions}
                    className={`flex items-center gap-2 px-4 h-9 text-xs font-bold rounded-lg transition-all ${showSuggestions ? 'bg-violet-500 text-white' : 'bg-muted hover:bg-muted/80 text-foreground border border-border'}`}
                >
                    <Zap className={`w-4 h-4 ${showSuggestions ? 'text-white' : 'text-violet-500'}`} /> AI Tips
                </button>
                <button
                    onClick={onShowTextToAd}
                    className="flex items-center gap-2 px-4 h-9 text-xs font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all"
                >
                    <Sparkles className="w-4 h-4" /> Text→Ad
                </button>
                <button
                    onClick={onShowBrand}
                    className="flex items-center gap-2 px-4 h-9 text-xs font-bold bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-all border border-border group"
                >
                    <Palette className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" /> Brand
                </button>
                <button
                    onClick={onShowResize}
                    className="flex items-center gap-2 px-4 h-9 text-xs font-bold bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-all border border-border group"
                >
                    <Maximize2 className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" /> Resize
                </button>

                <button className="flex items-center gap-2 px-4 h-9 text-xs font-semibold bg-muted hover:bg-muted/80 rounded-lg transition-all border border-border">
                    <Share2 className="w-4 h-4" /> Share
                </button>
                <button
                    onClick={onShowExport}
                    className="flex items-center gap-2 px-5 h-9 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                    <Download className="w-4 h-4" /> Export
                </button>
                <button onClick={() => onSave?.(doc)} className="flex items-center gap-2 px-6 h-9 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all">
                    <Save className="w-4 h-4" /> Save Ad
                </button>
            </div>
        </div>
    );
};
