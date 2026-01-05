import { useState } from 'react';
import { X, Save, ShieldCheck, Download, Undo2, Redo2, Sparkles, Palette, Maximize2, Zap, PlusCircle, MoreHorizontal, Group, Ungroup, Lock, Unlock, AlignLeft, AlignCenter, AlignRight, AlignStartVertical, AlignEndVertical, ChevronsUp, ChevronsDown, ChevronUp, ChevronDown } from 'lucide-react';
// Using Chevrons for Z-Order. ListPlus/Grid for Distribute? 
// Let's use generic placeholder icons if specifically named ones fail, but Chevrons are standard.
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
    scale?: number;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    onGroup?: () => void;
    onUngroup?: () => void;
    canGroup?: boolean;
    canUngroup?: boolean;
    onLock?: () => void;
    onUnlock?: () => void;
    onAlign?: (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
    onDistribute?: (type: 'horizontal' | 'vertical') => void;
    onLayerOrder?: (action: 'front' | 'back' | 'forward' | 'backward') => void;
    saveStatus?: 'saved' | 'saving' | 'unsaved';
    lastSaved?: Date | null;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    doc,
    onClose,
    activeTool: _activeTool,
    setActiveTool: _setActiveTool,
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
    onSave,
    scale = 1,
    onZoomIn,
    onZoomOut,
    onGroup,
    onUngroup,
    canGroup,
    canUngroup,
    onLock,
    onUnlock,
    onAlign,
    onDistribute,
    onLayerOrder,
    saveStatus = 'saved',
    lastSaved
}) => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    return (
        <div className="h-14 md:h-16 border-b border-border/50 flex items-center justify-between px-3 md:px-6 bg-background dark:bg-gradient-to-r dark:from-card dark:via-card dark:to-card/95 backdrop-blur-xl z-30 shrink-0 shadow-sm">
            {/* Left Section - Minimal */}
            <div className="flex items-center gap-3 md:gap-4">
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all text-muted-foreground shrink-0"
                    title="Schließen"
                >
                    <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                {/* Auto-Save Indicator */}
                <div className="flex flex-col justify-center ml-2">
                    <div className="flex items-center gap-2">
                        <h1 className="text-sm font-bold text-foreground truncate max-w-[150px] md:max-w-[200px]">
                            {doc.name || 'Untitled Ad'}
                        </h1>
                        {saveStatus === 'unsaved' && (
                            <div className="w-2 h-2 rounded-full bg-amber-500" title="Unsaved changes" />
                        )}
                        {saveStatus === 'saving' && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" title="Saving..." />
                        )}
                    </div>
                    <span className="text-[10px] text-muted-foreground hidden md:block leading-none">
                        {saveStatus === 'saved' && lastSaved
                            ? `Saved ${lastSaved.toLocaleTimeString()}`
                            : saveStatus === 'saving' ? 'Saving...' : 'Unsaved changes'}
                    </span>
                </div>

                <div className="w-[1px] h-6 bg-border mx-2" />

                <button
                    onClick={onShowResize}
                    className="p-2 hover:bg-muted rounded-md transition-colors"
                    title="Format ändern"
                >
                    <Maximize2 className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-muted dark:bg-muted rounded-lg p-0.5 border border-border h-9 mx-2">
                    <button
                        onClick={onZoomOut}
                        className="px-2 h-full hover:bg-background rounded-md text-foreground transition-all"
                        title="Zoom Out (-)"
                    >
                        -
                    </button>
                    <span className="text-xs font-medium w-12 text-center select-none text-muted-foreground">
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={onZoomIn}
                        className="px-2 h-full hover:bg-background rounded-md text-foreground transition-all"
                        title="Zoom In (+)"
                    >
                        +
                    </button>
                </div>

                <div className="h-6 w-px bg-border/50 mx-1" />

                <button
                    onClick={() => onShowExport()}
                    className="flex items-center gap-2 bg-foreground text-background hover:opacity-90 px-4 h-9 rounded-lg text-sm font-semibold transition-all shadow-sm"
                >
                    <Download className="w-4 h-4" />
                    <span className="hidden xl:inline">Export</span>
                </button>

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
            </div>

            {/* Right Section - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
                {/* Alignment Tools (Visible if onAlign provided) */}
                {onAlign && (
                    <div className="flex items-center bg-muted dark:bg-muted rounded-lg p-1 border border-border h-9 mr-2 gap-0.5">
                        <button onClick={() => onAlign('left')} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded" title="Align Left">
                            <AlignLeft className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button onClick={() => onAlign('center')} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded" title="Align Center">
                            <AlignCenter className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button onClick={() => onAlign('right')} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded" title="Align Right">
                            <AlignRight className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <div className="w-[1px] h-4 bg-border mx-1" />
                        <button onClick={() => onAlign('top')} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded" title="Align Top">
                            <AlignStartVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button onClick={() => onAlign('middle')} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded" title="Align Middle">
                            <AlignCenter className="w-4 h-4 text-muted-foreground rotate-90" />
                        </button>
                        <button onClick={() => onAlign('bottom')} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded" title="Align Bottom">
                            <AlignEndVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>
                )}

                {/* Distribute Tools */}
                {onDistribute && (
                    <div className="flex items-center bg-muted dark:bg-muted rounded-lg p-1 border border-border h-9 mr-2 gap-0.5">
                        <button onClick={() => onDistribute('horizontal')} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded" title="Distribute Horizontally">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button onClick={() => onDistribute('vertical')} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded" title="Distribute Vertically">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground rotate-90" />
                        </button>
                    </div>
                )}

                {/* Grouping Tools */}
                {(onGroup || onUngroup) && (
                    <div className="flex items-center bg-muted dark:bg-muted rounded-lg p-1 border border-border h-9 mr-2 gap-0.5">
                        {onGroup && (
                            <button
                                onClick={onGroup}
                                disabled={!canGroup}
                                className={`p-1 rounded ${!canGroup ? 'opacity-30 cursor-not-allowed' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
                                title="Group"
                            >
                                <Group className="w-4 h-4 text-muted-foreground" />
                            </button>
                        )}
                        {onUngroup && (
                            <button
                                onClick={onUngroup}
                                disabled={!canUngroup}
                                className={`p-1 rounded ${!canUngroup ? 'opacity-30 cursor-not-allowed' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
                                title="Ungroup"
                            >
                                <Ungroup className="w-4 h-4 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                )}

                {/* Locking Tools */}
                {(onLock || onUnlock) && (
                    <div className="flex items-center bg-muted dark:bg-muted rounded-lg p-1 border border-border h-9 mr-2 gap-0.5">
                        {onLock && (
                            <button onClick={onLock} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded" title="Lock">
                                <Lock className="w-4 h-4 text-muted-foreground" />
                            </button>
                        )}
                        {onUnlock && (
                            <button onClick={onUnlock} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded" title="Unlock">
                                <Unlock className="w-4 h-4 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                )}

                {/* Z-Order Tools */}
                {onLayerOrder && (
                    <div className="flex items-center bg-muted dark:bg-muted rounded-lg p-1 border border-border h-9 mr-2 gap-0.5">
                        <button onClick={() => onLayerOrder('front')} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded" title="Bring to Front">
                            <ChevronsUp className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button onClick={() => onLayerOrder('forward')} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded" title="Bring Forward">
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button onClick={() => onLayerOrder('backward')} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded" title="Send Backward">
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button onClick={() => onLayerOrder('back')} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded" title="Send to Back">
                            <ChevronsDown className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>
                )}

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
