import { memo, useEffect, useState, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { creativeSaveToLibrary } from '../lib/api/creative';
import { AdDocument, StudioLayer, TextLayer, ImageLayer } from '../types/studio';
import { supabase } from '../lib/supabaseClient';

// Lazy load heavy components to speed up Studio Landing view
const EditorLayout = lazy(() => import('./studio/EditorLayout').then(mod => ({ default: mod.EditorLayout })));
const AdWizard = lazy(() => import('./studio/AdWizard').then(mod => ({ default: mod.AdWizard })));

export const StudioPage = memo(function StudioPage() {
    // Default to editor (canvas) - skip wizard
    const [currentView, setCurrentView] = useState<'wizard' | 'editor'>('editor');
    const [currentDocument, setCurrentDocument] = useState<AdDocument | undefined>(undefined);
    const [isBooting, setIsBooting] = useState(true);

    const handleClose = () => {
        window.history.pushState({}, document.title, '/library');
        window.dispatchEvent(new PopStateEvent('popstate'));
        setCurrentDocument(undefined);
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
                output: payload,
                blueprintId: doc.meta?.blueprintId,
                score: doc.meta?.score
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

    const LoadingFallback = () => (
        <div className="flex items-center justify-center min-h-screen bg-background text-primary">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Lade Studio...</p>
            </div>
        </div>
    );

    useEffect(() => {
        let mounted = true;
        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const creativeId = params?.get('id');

        // No creativeId = go directly to blank canvas editor
        if (!creativeId) {
            setCurrentView('editor');
            setCurrentDocument(undefined);
            setIsBooting(false);
            return;
        }

        // Load existing creative
        (async () => {
            try {
                const { data, error } = await supabase
                    .from('generated_creatives')
                    .select('outputs')
                    .eq('id', creativeId)
                    .single();
                if (error) throw error;
                const outputs = (data?.outputs || {}) as { doc_snapshot?: AdDocument } | null;
                const doc = outputs?.doc_snapshot;
                if (mounted && doc) {
                    setCurrentDocument(doc);
                    setCurrentView('editor');
                } else if (mounted) {
                    // No doc found, go to blank editor
                    setCurrentView('editor');
                }
            } catch (err) {
                console.error('[StudioPage] Failed to load creative:', err);
                if (mounted) setCurrentView('editor');
            } finally {
                if (mounted) setIsBooting(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    if (isBooting) {
        return <LoadingFallback />;
    }

    // AI Wizard
    if (currentView === 'wizard') {
        return (
            <div className="fixed inset-0 z-[9999] bg-background">
                <Suspense fallback={<LoadingFallback />}>
                    <AdWizard
                        isOpen={true}
                        onClose={handleClose}
                        onComplete={handleWizardComplete}
                    />
                </Suspense>
            </div>
        );
    }

    // Canvas Editor
    return (
        <div className="fixed inset-0 z-[9999] bg-background text-foreground flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <Suspense fallback={<LoadingFallback />}>
                <EditorLayout
                    onClose={handleClose}
                    onSave={handleSave}
                    initialDoc={currentDocument}
                />
            </Suspense>
        </div>
    );
});
