import React from 'react';
import { CanvasStage, type CanvasStageHandle } from './CanvasStage';
import type { AdDocument, StudioLayer } from '../../types/studio';

interface EditorCanvasProps {
    doc: AdDocument;
    scale: number;
    selectedLayerId?: string;
    onLayerSelect: (id: string | undefined) => void;
    onLayerUpdate: (id: string, attrs: Partial<StudioLayer>) => void;
    activeTool: 'select' | 'hand';
    viewPos: { x: number; y: number };
    onViewChange: (pos: { x: number; y: number }) => void;
    isMultiverseMode: boolean;
    isPreviewMode: boolean;
    mockupType: 'feed' | 'story';
    setMockupType: (type: 'feed' | 'story') => void;
    canvasRef: React.RefObject<CanvasStageHandle>;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
    doc,
    scale,
    selectedLayerId,
    onLayerSelect,
    onLayerUpdate,
    activeTool,
    viewPos,
    onViewChange,
    isMultiverseMode,
    isPreviewMode,
    mockupType,
    setMockupType,
    canvasRef
}) => {
    return (
        <main className={`flex-1 relative overflow-hidden flex items-center justify-center transition-colors duration-500 ${isPreviewMode ? 'bg-white' : 'bg-zinc-100/50 dark:bg-zinc-950'}`}>

            {!isMultiverseMode && !isPreviewMode && (
                <div className="shadow-2xl shadow-black/5 dark:shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] border border-zinc-200 dark:border-white/5 rounded-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                    <CanvasStage
                        ref={canvasRef}
                        doc={doc}
                        scale={scale}
                        selectedLayerId={selectedLayerId}
                        onLayerSelect={onLayerSelect}
                        onLayerUpdate={onLayerUpdate}
                        isHandMode={activeTool === 'hand'}
                        viewPos={viewPos}
                        onViewChange={onViewChange}
                    />
                </div>
            )}

            {/* MULTIVERSE VIEW: 3 Formats side-by-side */}
            {isMultiverseMode && (
                <div className="flex items-center gap-12 p-20 animate-in slide-in-from-bottom-10 fade-in duration-700">
                    {/* 1:1 Post */}
                    <div className="flex flex-col gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-white/40 text-center">Instagram Post</span>
                        <div className="shadow-2xl border border-zinc-200 dark:border-white/5 rounded-sm overflow-hidden scale-[0.4] origin-top">
                            <CanvasStage doc={doc} scale={1} preview={true} selectedLayerId={undefined} onLayerSelect={() => { }} onLayerUpdate={() => { }} />
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
                                preview={true}
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
                                        <CanvasStage doc={doc} scale={1} preview={true} selectedLayerId={undefined} onLayerSelect={() => { }} onLayerUpdate={() => { }} />
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
                                            selectedLayerId={undefined}
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

            {/* Controls Footer */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 text-[11px] font-bold text-white/80 tracking-widest uppercase pointer-events-none">
                <span className="flex items-center gap-2">Format: <span className="text-primary">{doc.format}</span></span>
                <div className="w-px h-4 bg-white/10" />
                <span className="flex items-center gap-2">Zoom: <span className="text-primary">{(scale * 100).toFixed(0)}%</span></span>
            </div>
        </main>
    );
};
