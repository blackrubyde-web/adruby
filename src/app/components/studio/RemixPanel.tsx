import React from 'react';
import { Wand2, Palette, RefreshCw, LayoutTemplate } from 'lucide-react';

export type RemixTheme = {
    id: string;
    label: string;
    colors: string[];
    font: string;
    bg?: string;
};

export const REMIX_THEMES: RemixTheme[] = [
    {
        id: 'midnight',
        label: 'Midnight Pro',
        colors: ['#FFFFFF', '#3B82F6', '#1E40AF'],
        font: 'Inter',
        bg: '#0F172A'
    },
    {
        id: 'neon',
        label: 'Cyber Punk',
        colors: ['#00FF99', '#FF00FF', '#00CCFF'],
        font: 'Roboto',
        bg: '#000000'
    },
    {
        id: 'luxury',
        label: 'Gold Luxury',
        colors: ['#D4AF37', '#F5F5F5', '#1A1A1A'],
        font: 'Playfair Display',
        bg: '#121212'
    },
    {
        id: 'pastel',
        label: 'Soft Pastel',
        colors: ['#FCA5A5', '#FCD34D', '#FFF1F2'],
        font: 'Inter',
        bg: '#FFFFFF'
    }
];

interface RemixPanelProps {
    onApplyTheme: (theme: RemixTheme) => void;
    onShuffleColors: () => void;
    onResizeFormat: (format: 'IG_STORY' | 'IG_POST' | 'FB_AD') => void;
    onGenerateVariants: () => void;
}

export const RemixPanel = ({ onApplyTheme, onShuffleColors, onResizeFormat, onGenerateVariants }: RemixPanelProps) => {
    return (
        <div className="flex flex-col h-full bg-card overflow-hidden">
            <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-purple-600">
                    <Wand2 className="w-4 h-4" /> AI Remix Engine
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-24">
                {/* 1. Global Themes */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Palette className="w-3.0 h-3.0" /> Visual Themes
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {REMIX_THEMES.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => onApplyTheme(theme)}
                                className="group relative flex flex-col items-center gap-2 p-1 rounded-xl border border-border hover:border-purple-500/50 hover:bg-muted/50 transition-all overflow-hidden"
                            >
                                <div className="w-full h-14 rounded-lg flex items-center justify-center text-xs font-black shadow-sm" style={{ backgroundColor: theme.bg, color: theme.colors[0], fontFamily: theme.font }}>
                                    Aa
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground pb-1 group-hover:text-foreground">
                                    {theme.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Format Adaptation */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <LayoutTemplate className="w-3.0 h-3.0" /> Smart Formats
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => onResizeFormat('IG_POST')} className="flex flex-col items-center gap-2 p-3 bg-muted/30 hover:bg-muted rounded-xl border border-transparent hover:border-border transition-all">
                            <div className="w-6 h-6 border-2 border-muted-foreground/30 rounded-md aspect-square bg-background" />
                            <span className="text-[9px] font-bold">1:1 Post</span>
                        </button>
                        <button onClick={() => onResizeFormat('IG_STORY')} className="flex flex-col items-center gap-2 p-3 bg-muted/30 hover:bg-muted rounded-xl border border-transparent hover:border-border transition-all">
                            <div className="w-4 h-6 border-2 border-muted-foreground/30 rounded-md bg-background" />
                            <span className="text-[9px] font-bold">Story</span>
                        </button>
                        <button onClick={() => onResizeFormat('FB_AD')} className="flex flex-col items-center gap-2 p-3 bg-muted/30 hover:bg-muted rounded-xl border border-transparent hover:border-border transition-all">
                            <div className="w-8 h-5 border-2 border-muted-foreground/30 rounded-md bg-background" />
                            <span className="text-[9px] font-bold">Wide</span>
                        </button>
                    </div>
                </div>

                {/* 3. Magic Actions */}
                <div className="space-y-3 pt-4 border-t border-border">
                    <button
                        onClick={onShuffleColors}
                        className="w-full flex items-center gap-4 p-4 text-xs font-bold bg-muted/50 hover:bg-muted rounded-2xl transition-all border border-transparent hover:border-border group"
                    >
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                            <RefreshCw className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <div className="text-foreground">Shuffle Identity</div>
                            <div className="text-[9px] text-muted-foreground font-normal">Switch colors from palette</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Campaign Button Fixed at Bottom */}
            <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm sticky bottom-0">
                <button
                    onClick={onGenerateVariants}
                    className="w-full py-4 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-1"
                >
                    <div className="flex items-center gap-2">
                        <Wand2 className="w-5 h-5 fill-white" />
                        <span className="text-sm tracking-tight">Generate Campaign</span>
                    </div>
                    <span className="text-[9px] opacity-70 font-bold uppercase tracking-widest">A/B Test candidates</span>
                </button>
            </div>
        </div>
    );
};
