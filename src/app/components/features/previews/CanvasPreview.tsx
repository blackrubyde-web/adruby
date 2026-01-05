import React from 'react';

export const CanvasPreview = () => {
    return (
        <div className="relative w-full aspect-[16/10] bg-[#0c0c0e] rounded-xl overflow-hidden shadow-2xl border border-white/10 select-none flex items-center justify-center">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

            {/* Nodes Container */}
            <div className="relative z-10 w-full h-full p-10 flex items-center justify-center scale-90 sm:scale-100">

                {/* SVG Connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                    <defs>
                        <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#C80000" stopOpacity="0.2" />
                            <stop offset="50%" stopColor="#ef4444" stopOpacity="1" />
                            <stop offset="100%" stopColor="#C80000" stopOpacity="0.2" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Audience to Ad Set */}
                    <path d="M 280 180 C 350 180, 350 250, 420 250" stroke="url(#line-gradient)" strokeWidth="3" fill="none" filter="url(#glow)" className="animate-dash-flow" />

                    {/* Ad Set to Creative */}
                    <path d="M 580 250 C 650 250, 650 180, 720 180" stroke="url(#line-gradient)" strokeWidth="3" fill="none" filter="url(#glow)" className="animate-dash-flow delay-500" />

                    {/* Ad Set to AB Test */}
                    <path d="M 580 250 C 650 250, 650 320, 720 320" stroke="url(#line-gradient)" strokeWidth="3" fill="none" filter="url(#glow)" className="animate-dash-flow delay-700" />
                </svg>

                {/* Node: Audience */}
                <div className="absolute top-[140px] left-[180px] w-48 bg-zinc-900/80 backdrop-blur-md border border-rose-500/30 rounded-xl p-4 shadow-lg shadow-rose-900/20 hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <div className="text-sm font-bold text-white">Lookalike 1%</div>
                    </div>
                    <div className="space-y-1">
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-rose-500"></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-400">
                            <span>Size: 2.1M</span>
                            <span>High Intent</span>
                        </div>
                    </div>
                    {/* Connector Dot Right */}
                    <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-white rounded-full border-2 border-rose-500 z-20"></div>
                </div>

                {/* Node: Ad Set */}
                <div className="absolute top-[210px] left-[420px] w-48 bg-zinc-900/90 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-xl z-10 animate-pulse-border">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <div className="text-sm font-bold text-white">Conversion Opt.</div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs bg-zinc-800/50 p-1.5 rounded">
                            <span className="text-zinc-400">Budget</span>
                            <span className="text-white font-mono">€500/d</span>
                        </div>
                    </div>
                    {/* Connector Dot Left */}
                    <div className="absolute top-1/2 -left-1.5 w-3 h-3 bg-zinc-800 rounded-full border-2 border-zinc-600 z-20"></div>
                    {/* Connector Dot Right */}
                    <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-white rounded-full border-2 border-blue-500 z-20"></div>
                </div>

                {/* Node: Creative A */}
                <div className="absolute top-[140px] right-[160px] w-44 bg-zinc-900/80 backdrop-blur-md border border-green-500/30 rounded-xl p-3 shadow-lg hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center text-green-500">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <div className="text-xs font-bold text-white">Video_Hook_01</div>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-zinc-800 rounded p-1 text-center">
                            <div className="text-[10px] text-zinc-500">CTR</div>
                            <div className="text-xs font-bold text-green-400">2.4%</div>
                        </div>
                        <div className="flex-1 bg-zinc-800 rounded p-1 text-center">
                            <div className="text-[10px] text-zinc-500">ROAS</div>
                            <div className="text-xs font-bold text-green-400">3.8x</div>
                        </div>
                    </div>
                    {/* Connector Dot Left */}
                    <div className="absolute top-1/2 -left-1.5 w-3 h-3 bg-zinc-800 rounded-full border-2 border-zinc-600 z-20"></div>
                </div>

                {/* Node: Creative B */}
                <div className="absolute top-[280px] right-[160px] w-44 bg-zinc-900/80 backdrop-blur-md border border-zinc-700 rounded-xl p-3 shadow-lg opacity-60">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded bg-zinc-700 flex items-center justify-center text-zinc-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <div className="text-xs font-bold text-zinc-300">Static_Image_02</div>
                    </div>
                    <div className="bg-zinc-800/50 rounded p-1 text-center border border-zinc-700 border-dashed">
                        <div className="text-[10px] text-zinc-500">Testing...</div>
                    </div>
                    {/* Connector Dot Left */}
                    <div className="absolute top-1/2 -left-1.5 w-3 h-3 bg-zinc-800 rounded-full border-2 border-zinc-600 z-20"></div>
                </div>

            </div>

            <style>{`
        .animate-dash-flow {
          stroke-dasharray: 10;
          animation: dash 20s linear infinite;
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -1000;
          }
        }
        @keyframes pulse-border {
            0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.1); }
            70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
        .animate-pulse-border {
            animation: pulse-border 2s infinite;
        }
      `}</style>
        </div>
    );
};
