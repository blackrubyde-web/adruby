import React from 'react';
import { CanvasStage, type CanvasStageHandle } from './CanvasStage';
import type { AdDocument, StudioLayer } from '../../types/studio'
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuShortcut,
} from "../ui/context-menu";

interface EditorCanvasProps {
    doc: AdDocument;
    scale: number;
    selectedLayerIds: string[];
    onLayerSelect: (id: string | undefined, multi: boolean) => void;
    onLayerUpdate: (id: string, attrs: Partial<StudioLayer>) => void;
    activeTool: 'select' | 'hand';
    viewPos: { x: number; y: number };
    onViewChange: (pos: { x: number; y: number }) => void;
    isMultiverseMode: boolean;
    isPreviewMode: boolean;
    mockupType: 'feed' | 'story';
    setMockupType: (type: 'feed' | 'story') => void;
    canvasRef: React.RefObject<CanvasStageHandle>;
    onZoom?: (delta: number, center?: { x: number, y: number }) => void;
    onMultiLayerSelect?: (ids: string[]) => void;
    onCopy?: () => void;
    onPaste?: () => void;
    onDuplicate?: () => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
    doc,
    scale,
    selectedLayerIds,
    onLayerSelect,
    onLayerUpdate,
    activeTool,
    viewPos,
    onViewChange,
    isMultiverseMode,
    isPreviewMode,
    mockupType,
    setMockupType,
    canvasRef,
    onZoom,
    onMultiLayerSelect,
    onCopy,
    onPaste,
    onDuplicate
}) => {
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            onZoom?.(delta, { x: e.clientX, y: e.clientY }); // Optional: pass center
        }
    };

    return (
        <main
            className={`flex-1 relative overflow-hidden flex items-center justify-center transition-all duration-500 ${isPreviewMode
                ? 'bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950'
                : 'bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950'
                }`}
            onWheel={handleWheel}
            style={{
                backgroundImage: !isPreviewMode ? `
                    radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.03) 0%, transparent 40%),
                    radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.03) 0%, transparent 40%),
                    linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)
                ` : undefined,
                backgroundSize: !isPreviewMode ? '100% 100%, 100% 100%, 20px 20px, 20px 20px' : undefined,
            }}
        >
            {/* Subtle ambient glow effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-radial from-purple-500/5 to-transparent rounded-full blur-3xl" />
            </div>

            {!isMultiverseMode && !isPreviewMode && (
                <ContextMenu>
                    <ContextMenuTrigger className="flex-1 flex items-center justify-center p-8 h-full w-full relative z-10">
                        {/* Canvas container with premium shadow */}
                        <div className="relative group">
                            {/* Multi-layer shadow for depth */}
                            <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 via-purple-500/10 to-pink-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-700" />
                            <div
                                className="relative shadow-2xl shadow-black/20 dark:shadow-black/50 border border-zinc-200/50 dark:border-white/10 rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-500"
                                style={{
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
                                }}
                            >
                                <CanvasStage
                                    ref={canvasRef}
                                    doc={doc}
                                    scale={scale}
                                    selectedLayerIds={selectedLayerIds}
                                    onLayerSelect={onLayerSelect}
                                    onLayerUpdate={onLayerUpdate}
                                    isHandMode={activeTool === 'hand'}
                                    viewPos={viewPos}
                                    onViewChange={onViewChange}
                                    onMultiLayerSelect={onMultiLayerSelect}
                                />
                            </div>
                        </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-64 bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
                        <ContextMenuItem inset onSelect={onCopy} disabled={selectedLayerIds.length === 0} className="gap-3">
                            Copy
                            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem inset onSelect={onPaste} className="gap-3">
                            Paste
                            <ContextMenuShortcut>⌘V</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem inset onSelect={onDuplicate} disabled={selectedLayerIds.length === 0} className="gap-3">
                            Duplicate
                            <ContextMenuShortcut>⌘D</ContextMenuShortcut>
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            )}

            {/* MULTIVERSE VIEW: 3 Formats side-by-side */}
            {isMultiverseMode && (
                <div className="flex items-center gap-12 p-20 animate-in slide-in-from-bottom-10 fade-in duration-700">
                    {/* 1:1 Post */}
                    <div className="flex flex-col gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-white/40 text-center">Instagram Post</span>
                        <div className="shadow-2xl border border-zinc-200 dark:border-white/5 rounded-sm overflow-hidden scale-[0.4] origin-top">
                            <CanvasStage doc={doc} scale={1} preview={true} selectedLayerIds={[]} onLayerSelect={() => { }} onLayerUpdate={() => { }} />
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
                                preview={true}
                                selectedLayerIds={[]}
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
                                preview={true}
                                selectedLayerIds={[]}
                                onLayerSelect={() => { }}
                                onLayerUpdate={() => { }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* SOCIAL MOCKUP VIEW */}
            {isPreviewMode && (
                <div className="relative animate-in zoom-in-90 fade-in duration-500 flex flex-col items-center">

                    {/* Format Toggle */}
                    <div className="absolute -top-16 flex gap-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-lg z-50">
                        <button
                            onClick={() => setMockupType('feed')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${mockupType === 'feed' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black dark:text-zinc-500 dark:hover:text-white'}`}
                        >
                            Feed Post
                        </button>
                        <button
                            onClick={() => setMockupType('story')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${mockupType === 'story' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black dark:text-zinc-500 dark:hover:text-white'}`}
                        >
                            Story
                        </button>
                    </div>

                    <div className="relative w-[375px] h-[812px] bg-white rounded-[50px] shadow-2xl border-[8px] border-zinc-200 dark:border-zinc-900 overflow-hidden">
                        {/* Status Bar */}
                        <div className="h-10 bg-white flex items-center justify-between px-8 pt-4 z-20 relative">
                            <span className="text-[14px] font-bold text-black">9:41</span>
                            <div className="flex gap-1.5">
                                <div className="w-4 h-4 rounded-full border border-black" />
                                <div className="w-5 h-2.5 rounded-[3px] border border-black bg-black" />
                            </div>
                        </div>

                        {mockupType === 'feed' && (
                            <>
                                {/* IG Feed Header */}
                                <div className="p-3 border-b border-zinc-100 flex items-center gap-3 bg-white relative z-10">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[1.5px]">
                                        <div className="w-full h-full rounded-full bg-white p-[1.5px]">
                                            <div className="w-full h-full rounded-full bg-zinc-200" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[12px] font-bold text-black">adruby_official</div>
                                        <div className="text-[10px] text-zinc-500 leading-none">Sponsored</div>
                                    </div>
                                </div>

                                {/* THE AD CANVAS - CENTERED & FITTED */}
                                <div className="w-full aspect-square bg-zinc-50 relative overflow-hidden flex items-center justify-center">
                                    <div style={{
                                        width: doc.width,
                                        height: doc.height,
                                        transform: `scale(${359 / doc.width})`,
                                        transformOrigin: 'center center'
                                    }}>
                                        <CanvasStage doc={doc} scale={1} preview={true} selectedLayerIds={[]} onLayerSelect={() => { }} onLayerUpdate={() => { }} />
                                    </div>
                                </div>

                                {/* Feed Footer */}
                                <div className="p-4 space-y-3 bg-white relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-4">
                                            <div className="w-6 h-6 border-2 border-zinc-800 rounded-full" />
                                            <div className="w-6 h-6 border-2 border-zinc-800 rounded-full" />
                                        </div>
                                        <div className="w-6 h-6 border-2 border-zinc-800 rounded-md" />
                                    </div>
                                    <div className="text-[12px] text-black"><b>1,248 likes</b></div>
                                    <div className="text-[11px] leading-tight text-black">
                                        <b>adruby_official</b> Level up your creative game today with our new AI powered studio...
                                    </div>
                                </div>
                            </>
                        )}

                        {mockupType === 'story' && (
                            <div className="absolute inset-0 bg-black">
                                {/* Story Header */}
                                <div className="absolute top-12 left-0 right-0 z-20 flex items-center justify-between px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-zinc-200 border border-white/20" />
                                        <span className="text-white text-xs font-bold shadow-black drop-shadow-md">adruby_official 12h</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm" />
                                </div>

                                {/* STORY CANVAS - FULLSCREEN COVER */}
                                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                                    <div style={{
                                        width: doc.width,
                                        height: doc.height,
                                        transform: `scale(${Math.max(359 / doc.width, 796 / doc.height)})`,
                                        transformOrigin: 'center center'
                                    }}>
                                        <CanvasStage
                                            doc={doc}
                                            scale={1}
                                            preview={true}
                                            selectedLayerIds={[]}
                                            onLayerSelect={() => { }}
                                            onLayerUpdate={() => { }}
                                        />
                                    </div>
                                </div>

                                {/* Story Footer */}
                                <div className="absolute bottom-8 left-4 right-4 z-20 flex gap-3">
                                    <div className="h-10 flex-1 rounded-full border border-white/30 bg-black/20 backdrop-blur-md px-4 flex items-center text-white/50 text-xs">
                                        Send message...
                                    </div>
                                    <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white">
                                        ♥
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Premium Controls Footer */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {/* Main Info Bar */}
                <div className="bg-black/70 backdrop-blur-2xl border border-white/10 px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-4 text-[11px] font-semibold text-white/80">
                    <span className="flex items-center gap-2">
                        <span className="text-white/50">Format</span>
                        <span className="text-primary font-bold">{doc.format || '1:1'}</span>
                    </span>
                    <div className="w-px h-4 bg-white/10" />
                    <span className="flex items-center gap-2">
                        <span className="text-white/50">Zoom</span>
                        <span className="text-primary font-bold">{(scale * 100).toFixed(0)}%</span>
                    </span>
                    <div className="w-px h-4 bg-white/10" />
                    <span className="flex items-center gap-2">
                        <span className="text-white/50">Layers</span>
                        <span className="text-white font-bold">{doc.layers.length}</span>
                    </span>
                </div>

                {/* Keyboard Shortcuts Hint */}
                <div className="hidden xl:flex bg-black/50 backdrop-blur-xl border border-white/5 px-4 py-2.5 rounded-2xl items-center gap-3 text-[10px] text-white/40">
                    <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60 font-mono">⌘</kbd>
                        <span>+scroll = zoom</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60 font-mono">V</kbd>
                        <span>= select</span>
                    </span>
                </div>
            </div>
        </main>
    );
};
