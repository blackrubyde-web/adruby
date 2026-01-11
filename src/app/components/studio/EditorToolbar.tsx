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
    const [showAIMenu, setShowAIMenu] = useState(false);
    const [showViewMenu, setShowViewMenu] = useState(false);

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
                {/* Arrange Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="flex items-center gap-2 px-3 h-9 text-xs font-bold bg-muted dark:bg-muted hover:bg-muted/80 dark:hover:bg-muted/80 text-foreground rounded-lg transition-all border border-border"
                    >
                        <Group className="w-4 h-4 text-muted-foreground" />
                        <span>Arrange</span>
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </button>

                    {showMobileMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowMobileMenu(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-64 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* Align Section */}
                                {onAlign && (
                                    <>
                                        <div className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Align
                                        </div>
                                        <button onClick={() => { onAlign('left'); setShowMobileMenu(false); }} className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-foreground transition-colors">
                                            <div className="flex items-center gap-3">
                                                <AlignLeft className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">Left</span>
                                            </div>
                                            <kbd className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">⌘⇧←</kbd>
                                        </button>
                                        <button onClick={() => { onAlign('center'); setShowMobileMenu(false); }} className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-foreground transition-colors">
                                            <div className="flex items-center gap-3">
                                                <AlignCenter className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">Center</span>
                                            </div>
                                            <kbd className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">⌘⇧C</kbd>
                                        </button>
                                        <button onClick={() => { onAlign('right'); setShowMobileMenu(false); }} className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-foreground transition-colors">
                                            <div className="flex items-center gap-3">
                                                <AlignRight className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">Right</span>
                                            </div>
                                            <kbd className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">⌘⇧→</kbd>
                                        </button>
                                        <button onClick={() => { onAlign('top'); setShowMobileMenu(false); }} className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-foreground transition-colors">
                                            <div className="flex items-center gap-3">
                                                <AlignStartVertical className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">Top</span>
                                            </div>
                                            <kbd className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">⌘⇧↑</kbd>
                                        </button>
                                        <button onClick={() => { onAlign('middle'); setShowMobileMenu(false); }} className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-foreground transition-colors">
                                            <div className="flex items-center gap-3">
                                                <AlignCenter className="w-4 h-4 text-muted-foreground rotate-90" />
                                                <span className="font-medium">Middle</span>
                                            </div>
                                            <kbd className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">⌘⇧M</kbd>
                                        </button>
                                        <button onClick={() => { onAlign('bottom'); setShowMobileMenu(false); }} className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-foreground transition-colors">
                                            <div className="flex items-center gap-3">
                                                <AlignEndVertical className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">Bottom</span>
                                            </div>
                                            <kbd className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">⌘⇧↓</kbd>
                                        </button>
                                        <div className="h-px bg-border/50 my-1" />
                                    </>
                                )}

                                {/* Distribute Section */}
                                {onDistribute && (
                                    <>
                                        <div className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Distribute
                                        </div>
                                        <button onClick={() => { onDistribute('horizontal'); setShowMobileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-foreground transition-colors">
                                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium">Horizontal</span>
                                        </button>
                                        <button onClick={() => { onDistribute('vertical'); setShowMobileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-foreground transition-colors">
                                            <MoreHorizontal className="w-4 h-4 text-muted-foreground rotate-90" />
                                            <span className="font-medium">Vertical</span>
                                        </button>
                                        <div className="h-px bg-border/50 my-1" />
                                    </>
                                )}

                                {/* Group Section */}
                                {(onGroup || onUngroup) && (
                                    <>
                                        {onGroup && (
                                            <button onClick={() => { onGroup(); setShowMobileMenu(false); }} disabled={!canGroup} className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors ${!canGroup ? 'opacity-40 cursor-not-allowed' : 'hover:bg-muted/50 text-foreground'}`}>
                                                <div className="flex items-center gap-3">
                                                    <Group className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium">Group</span>
                                                </div>
                                                <kbd className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">⌘G</kbd>
                                            </button>
                                        )}
                                        {onUngroup && (
                                            <button onClick={() => { onUngroup(); setShowMobileMenu(false); }} disabled={!canUngroup} className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors ${!canUngroup ? 'opacity-40 cursor-not-allowed' : 'hover:bg-muted/50 text-foreground'}`}>
                                                <div className="flex items-center gap-3">
                                                    <Ungroup className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium">Ungroup</span>
                                                </div>
                                                <kbd className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">⌘⇧G</kbd>
                                            </button>
                                        )}
                                        <div className="h-px bg-border/50 my-1" />
                                    </>
                                )}

                                {/* Lock Section */}
                                {(onLock || onUnlock) && (
                                    <>
                                        {onLock && (
                                            <button onClick={() => { onLock(); setShowMobileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-foreground transition-colors">
                                                <Lock className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">Lock</span>
                                            </button>
                                        )}
                                        {onUnlock && (
                                            <button onClick={() => { onUnlock(); setShowMobileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-foreground transition-colors">
                                                <Unlock className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">Unlock</span>
                                            </button>
                                        )}
                                        <div className="h-px bg-border/50 my-1" />
                                    </>
                                )}

                                {/* Z-Order Section */}
                                {onLayerOrder && (
                                    <>
                                        <div className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Z-Order
                                        </div>
                                        <button onClick={() => { onLayerOrder('front'); setShowMobileMenu(false); }} className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-foreground transition-colors">
                                            <div className="flex items-center gap-3">
                                                <ChevronsUp className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">To Front</span>
                                            </div>
                                            <kbd className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">⌘]</kbd>
                                        </button>
                                        <button onClick={() => { onLayerOrder('forward'); setShowMobileMenu(false); }} className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-foreground transition-colors">
                                            <div className="flex items-center gap-3">
                                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">Forward</span>
                                            </div>
                                            <kbd className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">⌘⇧]</kbd>
                                        </button>
                                        <button onClick={() => { onLayerOrder('backward'); setShowMobileMenu(false); }} className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-foreground transition-colors">
                                            <div className="flex items-center gap-3">
                                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">Backward</span>
                                            </div>
                                            <kbd className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">⌘[</kbd>
                                        </button>
                                        <button onClick={() => { onLayerOrder('back'); setShowMobileMenu(false); }} className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-foreground transition-colors">
                                            <div className="flex items-center gap-3">
                                                <ChevronsDown className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">To Back</span>
                                            </div>
                                            <kbd className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">⌘⇧[</kbd>
                                        </button>
                                        <div className="h-px bg-border/50 my-1" />
                                    </>
                                )}

                                {/* Resize */}
                                <button onClick={() => { onShowResize(); setShowMobileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-foreground transition-colors">
                                    <Maximize2 className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">Resize</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>


                {/* AI Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowAIMenu(!showAIMenu)}
                        className="flex items-center gap-2 px-3 h-9 text-xs font-bold bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-400 rounded-lg transition-all border border-purple-500/20"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>AI</span>
                        <ChevronDown className="w-3 h-3" />
                    </button>

                    {showAIMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowAIMenu(false)} />
                            <div className="absolute right-0 top-full mt-2 w-56 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button onClick={() => { onShowAdWizard(); setShowAIMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-foreground transition-colors">
                                    <PlusCircle className="w-4 h-4 text-emerald-500" />
                                    <span className="font-medium">Neue Ad</span>
                                </button>
                                <button onClick={() => { onShowTextToAd(); setShowAIMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-foreground transition-colors">
                                    <Sparkles className="w-4 h-4 text-fuchsia-500" />
                                    <span className="font-medium">Text→Ad</span>
                                </button>
                                <div className="h-px bg-border/50 my-1" />
                                <button onClick={() => { onAudit(); setShowAIMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-foreground transition-colors">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    <span className="font-medium">AI Audit</span>
                                </button>
                                <button onClick={() => { onToggleSuggestions(); setShowAIMenu(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${showSuggestions ? 'bg-violet-500/10' : 'hover:bg-muted/50 text-foreground'}`}>
                                    <Zap className={`w-4 h-4 ${showSuggestions ? 'text-violet-500' : 'text-muted-foreground'}`} />
                                    <span className="font-medium">AI Tips</span>
                                </button>
                                <div className="h-px bg-border/50 my-1" />
                                <button onClick={() => { onShowBrand(); setShowAIMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-foreground transition-colors">
                                    <Palette className="w-4 h-4 text-amber-500" />
                                    <span className="font-medium">Brand Kit</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>


                {/* View Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowViewMenu(!showViewMenu)}
                        className="flex items-center gap-2 px-3 h-9 text-xs font-bold bg-muted dark:bg-muted hover:bg-muted/80 dark:hover:bg-muted/80 text-foreground rounded-lg transition-all border border-border"
                    >
                        <span>View</span>
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </button>

                    {showViewMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowViewMenu(false)} />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button
                                    onClick={() => { setIsMultiverseMode(!isMultiverseMode); setShowViewMenu(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isMultiverseMode ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-muted/50 text-foreground'}`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${isMultiverseMode ? 'bg-indigo-500' : 'bg-muted'}`} />
                                    <span className="font-medium">Multiverse</span>
                                </button>
                                <button
                                    onClick={() => { setIsPreviewMode(!isPreviewMode); if (!isPreviewMode) setIsMultiverseMode(false); setShowViewMenu(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isPreviewMode ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50 text-foreground'}`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${isPreviewMode ? 'bg-primary' : 'bg-muted'}`} />
                                    <span className="font-medium">Mockup</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Export Button */}
                <button
                    onClick={onShowExport}
                    className="flex items-center gap-2 px-4 h-9 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                </button>

                {/* Save Button */}
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
