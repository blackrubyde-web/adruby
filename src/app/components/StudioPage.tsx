"use client";
import { memo, useState } from 'react';
import { Palette } from 'lucide-react';
import { EditorLayout } from './studio/EditorLayout';
import { creativeSaveToLibrary } from '../lib/api/creative';

export const StudioPage = memo(function StudioPage() {
    const [isLaunchOpen, setIsLaunchOpen] = useState(true);

    const handleClose = () => {
        // For Vite: just close the studio overlay
        setIsLaunchOpen(false);
        // If using react-router, you could do: navigate('/dashboard');
        // For now, we'll just toggle the state
    };

    const handleSave = async (doc: any) => {
        try {
            // Transform AdDocument to a format compatible with CampaignBuilder/SavedAd
            // We extract text content from layers to populate the 'creative' fields
            const headlineLayer = doc.layers.find((l: any) => l.type === 'text' && (l.name.toLowerCase().includes('headline') || l.fontSize > 40));
            const descLayer = doc.layers.find((l: any) => l.type === 'text' && l.id !== headlineLayer?.id);
            const ctaLayer = doc.layers.find((l: any) => l.type === 'cta');
            const imageLayer = doc.layers.find((l: any) => l.type === 'product' || l.type === 'background');

            const payload = {
                createdFrom: 'studio',
                lifecycle: { status: 'active' },
                productName: doc.name || 'AdRuby Design',
                targetAudience: doc.meta?.mood || 'General',
                headline: headlineLayer?.text || 'New Creative',
                description: descLayer?.text || '',
                cta: ctaLayer?.text || 'Learn More',
                // Mock creative structure for compatibility
                copy: {
                    hook: headlineLayer?.text || 'New Creative',
                    primary_text: descLayer?.text || '',
                    cta: ctaLayer?.text || 'Learn More',
                },
                thumbnail: imageLayer?.src || null,
                doc_snapshot: doc // Save the full studio doc for re-editing if needed later
            };

            await creativeSaveToLibrary({
                output: payload
            });

            // eslint-disable-next-line no-alert
            alert('Ad saved to library successfully!');
            handleClose();
        } catch (err) {
            console.error('Failed to save ad:', err);
            // eslint-disable-next-line no-alert
            alert('Failed to save ad. See console for details.');
        }
    };

    if (!isLaunchOpen) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-zinc-950">
                {/* Premium Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-zinc-950/50 to-transparent"></div>
                <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-fuchsia-600/10 rounded-full blur-[100px] animate-pulse-slower"></div>

                {/* Content Container */}
                <div className="relative z-10 flex flex-col items-center max-w-2xl px-6 text-center animate-in fade-in zoom-in-95 duration-1000">
                    <div className="mb-8 relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
                        <div className="relative p-8 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-[32px] shadow-2xl group-hover:scale-105 transition-transform duration-500 border-t-white/10">
                            <Palette className="w-16 h-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                        </div>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white mb-6 drop-shadow-2xl">
                        AdRuby <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Studio</span>
                    </h1>

                    <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-md font-medium leading-relaxed">
                        Craft high-converting ad creatives with the power of <span className="text-white font-bold">Generative AI</span> and professional design tools.
                    </p>

                    <button
                        onClick={() => setIsLaunchOpen(true)}
                        className="group relative px-12 py-5 bg-white text-black rounded-2xl font-black text-lg tracking-wide shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <span className="relative flex items-center gap-3">
                            Open Studio
                            <Palette className="w-5 h-5" />
                        </span>
                    </button>

                    <p className="mt-8 text-xs font-bold uppercase tracking-widest text-zinc-600">
                        v2.0 Premium Experience
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-background text-foreground flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            {/* The Overlay is actually the whole page when open */}
            <div className="flex-1 bg-zinc-950 flex flex-col h-full relative">
                <EditorLayout onClose={handleClose} onSave={handleSave} />
            </div>
        </div>
    );
});
