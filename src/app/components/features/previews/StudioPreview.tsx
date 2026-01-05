import React from 'react';
import { Palette, Layers, Type, Image as ImageIcon, Sparkles, Download, Settings, MousePointer, Box, X } from 'lucide-react';

export const StudioPreview = () => {
    return (
        <div className="relative w-full aspect-[16/10] bg-zinc-950 rounded-xl overflow-hidden shadow-2xl border border-white/10 select-none">
            {/* Fake Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-zinc-900 border-b border-white/10 flex items-center justify-between px-4 z-20">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="ml-3 text-xs text-zinc-400 font-medium">Summer Campaign_v2.design</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-rose-500 border border-zinc-900 flex items-center justify-center text-[10px] text-white">JD</div>
                        <div className="w-6 h-6 rounded-full bg-blue-500 border border-zinc-900 flex items-center justify-center text-[10px] text-white">AI</div>
                    </div>
                    <div className="px-2 py-1 rounded bg-white/5 text-[10px] text-zinc-400">Autosaved</div>
                    <button className="px-3 py-1 bg-white text-black text-xs font-bold rounded hover:bg-zinc-200">Export</button>
                </div>
            </div>

            {/* Sidebar */}
            <div className="absolute top-10 left-0 bottom-0 w-14 bg-zinc-900/50 backdrop-blur-md border-r border-white/10 flex flex-col items-center py-4 gap-4 z-20">
                <div className="p-2 rounded-lg bg-rose-600/20 text-rose-500"><Sparkles className="w-5 h-5" /></div>
                <div className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"><Layers className="w-5 h-5" /></div>
                <div className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"><Type className="w-5 h-5" /></div>
                <div className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"><ImageIcon className="w-5 h-5" /></div>
                <div className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"><Box className="w-5 h-5" /></div>
                <div className="mt-auto p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"><Settings className="w-5 h-5" /></div>
            </div>

            {/* Right Properties Panel */}
            <div className="absolute top-10 right-0 bottom-0 w-60 bg-zinc-900/80 backdrop-blur-md border-l border-white/10 p-4 z-20 hidden lg:block">
                <div className="space-y-6">
                    <div>
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">AI Controls</div>
                        <div className="space-y-3">
                            <div className="p-3 bg-zinc-800/50 rounded-lg border border-white/5">
                                <div className="flex items-center justify-between text-xs text-zinc-300 mb-2">
                                    <span>Smart Resize</span>
                                    <Sparkles className="w-3 h-3 text-rose-500" />
                                </div>
                                <div className="flex gap-1">
                                    <div className="h-6 w-6 rounded bg-rose-600/20 border border-rose-500/30"></div>
                                    <div className="h-6 w-8 rounded bg-zinc-700/50"></div>
                                    <div className="h-6 w-4 rounded bg-zinc-700/50"></div>
                                </div>
                            </div>
                            <div className="p-3 bg-zinc-800/50 rounded-lg border border-white/5">
                                <div className="flex items-center justify-between text-xs text-zinc-300 mb-2">
                                    <span>Background Removal</span>
                                    <Settings className="w-3 h-3 text-zinc-500" />
                                </div>
                                <div className="w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-rose-500"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Layer Properties</div>
                        <div className="space-y-3">
                            <div className="h-8 bg-zinc-800 rounded border border-white/5 flex items-center px-2 text-xs text-zinc-400 justify-between">
                                <span>Opacity</span>
                                <span>100%</span>
                            </div>
                            <div className="h-8 bg-zinc-800 rounded border border-white/5 flex items-center px-2 text-xs text-zinc-400 justify-between">
                                <span>Blend Mode</span>
                                <span>Normal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="absolute inset-0 top-10 left-14 right-60 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] flex items-center justify-center z-10 p-10">

                {/* The Ad Itself */}
                <div className="relative w-[300px] aspect-[4/5] bg-black rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden group">
                    {/* Background Image */}
                    <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000" alt="Sneaker" className="absolute inset-0 w-full h-full object-cover opacity-80" />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                    {/* Floating Elements */}
                    <div className="absolute top-8 left-0 right-0 text-center">
                        <h2 className="text-3xl font-black text-white italic tracking-tighter drop-shadow-xl animate-pulse-slow">JUST DO IT.</h2>
                    </div>

                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-4/5">
                        <div className="bg-red-600 text-white font-bold py-3 px-6 rounded-full text-center shadow-lg shadow-red-600/30 flex items-center justify-center gap-2">
                            SHOP NOW <span className="text-xs bg-white/20 px-1 rounded">AIR MAX</span>
                        </div>
                    </div>

                    {/* Selection UI (Fake) */}
                    <div className="absolute inset-0 border-2 border-rose-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-rose-500"></div>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500"></div>
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-rose-500"></div>
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-rose-500"></div>
                        <div className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-sm">Instagram Story</div>
                    </div>
                </div>

                {/* Floating Cursor Animation */}
                <div className="absolute top-1/2 left-1/2 pointer-events-none animate-float-cursor z-50">
                    <MousePointer className="w-6 h-6 text-white fill-black drop-shadow-lg" />
                    <div className="ml-4 mt-2 bg-rose-500 text-white text-xs px-2 py-1 rounded-md shadow-lg font-medium whitespace-nowrap">
                        AI Creating Variant...
                    </div>
                </div>
            </div>

            {/* CSS for specific preview animations */}
            <style>{`
        @keyframes float-cursor {
            0% { transform: translate(100px, 100px); }
            50% { transform: translate(-50px, -20px); }
            100% { transform: translate(100px, 100px); }
        }
        .animate-float-cursor {
            animation: float-cursor 8s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
};
