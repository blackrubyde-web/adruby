"use client";
import { memo, useState } from 'react';
import { Palette, Sparkles } from 'lucide-react';
import { EditorLayout } from './studio/EditorLayout';
import { AdWizard } from './studio/AdWizard';
import { creativeSaveToLibrary } from '../lib/api/creative';
import { AdDocument, StudioLayer, TextLayer, ImageLayer } from '../types/studio';

export const StudioPage = memo(function StudioPage() {
    const [currentView, setCurrentView] = useState<'landing' | 'wizard' | 'editor'>('landing');
    const [currentDocument, setCurrentDocument] = useState<AdDocument | undefined>(undefined);

    const handleClose = () => {
        setCurrentView('landing');
        setCurrentDocument(undefined);
    };

    const handleStartWizard = () => {
        setCurrentView('wizard');
    };

    const handleWizardComplete = (doc: AdDocument) => {
        setCurrentDocument(doc);
        setCurrentView('editor');
    };

    const handleSave = async (doc: AdDocument) => {
        try {
            const headlineLayer = doc.layers.find((l: StudioLayer) => l.type === 'text' && (l.name.toLowerCase().includes('headline') || (l as TextLayer).fontSize > 40));
            const descLayer = doc.layers.find((l: StudioLayer) => l.type === 'text' && l.id !== headlineLayer?.id);
            const ctaLayer = doc.layers.find((l: StudioLayer) => l.type === 'cta' || l.name.toLowerCase().includes('cta'));
            const imageLayer = doc.layers.find((l: StudioLayer) => l.type === 'product' || l.type === 'background');

            const payload = {
                createdFrom: 'studio',
                lifecycle: { status: 'active' },
                productName: doc.name || 'AdRuby Design',
                targetAudience: doc.meta?.mood || 'General',
                headline: (headlineLayer as TextLayer)?.text || 'New Creative',
                description: (descLayer as TextLayer)?.text || '',
                cta: (ctaLayer as TextLayer)?.text || 'Learn More',
                copy: {
                    hook: (headlineLayer as TextLayer)?.text || 'New Creative',
                    primary_text: (descLayer as TextLayer)?.text || '',
                    cta: (ctaLayer as TextLayer)?.text || 'Learn More',
                },
                thumbnail: (imageLayer as ImageLayer)?.src || null,
                doc_snapshot: doc
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

    // Landing Page
    if (currentView === 'landing') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-black">
                {/* Premium Background Effects - Light/Dark Mode */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-transparent to-fuchsia-50/50 dark:from-violet-900/20 dark:via-zinc-950/50 dark:to-transparent"></div>
                <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-violet-200/30 dark:bg-violet-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-fuchsia-200/30 dark:bg-fuchsia-600/10 rounded-full blur-[100px] animate-pulse-slower"></div>

                {/* Content Container */}
                <div className="relative z-10 flex flex-col items-center max-w-2xl px-6 text-center animate-in fade-in zoom-in-95 duration-1000">
                    <div className="mb-8 relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-400 dark:from-violet-600 dark:to-fuchsia-600 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
                        <div className="relative p-8 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/50 dark:border-white/5 rounded-[32px] shadow-2xl group-hover:scale-105 transition-transform duration-500">
                            <Palette className="w-16 h-16 text-violet-600 dark:text-white drop-shadow-[0_0_15px_rgba(139,92,246,0.5)] dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                        </div>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-zinc-900 dark:text-white mb-6 drop-shadow-2xl">
                        AdRuby <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400">Studio</span>
                    </h1>

                    <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-12 max-w-md font-medium leading-relaxed">
                        Craft high-converting ad creatives with the power of <span className="text-zinc-900 dark:text-white font-bold">Generative AI</span> and professional design tools.
                    </p>

                    <button
                        onClick={handleStartWizard}
                        className="group relative px-12 py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-black text-lg tracking-wide shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)] hover:shadow-[0_0_60px_-15px_rgba(139,92,246,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <span className="relative flex items-center gap-3">
                            <Sparkles className="w-5 h-5" />
                            Neue Ad erstellen
                        </span>
                    </button>

                    <p className="mt-8 text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                        v2.0 Premium Experience
                    </p>
                </div>
            </div>
        );
    }

    // AI Wizard
    if (currentView === 'wizard') {
        return (
            <div className="fixed inset-0 z-[9999] bg-background">
                <AdWizard
                    isOpen={true}
                    onClose={handleClose}
                    onComplete={handleWizardComplete}
                />
            </div>
        );
    }

    // Canvas Editor
    return (
        <div className="fixed inset-0 z-[9999] bg-background text-foreground flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <EditorLayout
                onClose={handleClose}
                onSave={handleSave}
                initialDoc={currentDocument}
            />
        </div>
    );
});
