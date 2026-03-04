/**
 * AI Ad Builder — Dark Editorial Studio v6
 * Syne + DM Sans typography, obsidian surfaces, grain canvas,
 * filter-chip tabs, editorial header.
 */

import { useState, useCallback, useEffect } from 'react';
import {
    Download, Save, Upload, FileText, MessageSquare,
    Sparkles, Image, Loader2, RefreshCw, Film,
    Store, CheckCircle2, X,
    Search, Target, PenTool, Palette, Frame, Wand2, Send,
    RectangleVertical, Square, Smartphone
} from 'lucide-react';
import { generateAd, refineAd } from '../lib/api/aibuilder';
import { generateVideoAd, calculateVideoCreditCost } from '../lib/api/videoApi';
import { t } from '../lib/aibuilder/translations';
import { toast } from 'sonner';
import { FormInputMode } from './aibuilder/FormInputMode';
import { FreeTextInputMode } from './aibuilder/FreeTextInputMode';
import { PreviewArea } from './aibuilder/PreviewArea';
import VideoSettingsPanel from './aibuilder/VideoSettingsPanel';
import VideoPreviewArea from './aibuilder/VideoPreviewArea';
import { StoreImporter, CarouselBuilder } from './store-importer';
import type { ScrapedProduct, ProductCopy } from './store-importer/types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DashboardShell } from './layout/DashboardShell';
import { cn } from '../lib/utils';
import { useAuthState, useAuthActions } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import type { Language, InputMode, OutputType, VideoSettings, VideoGenerationResult, AdGenerationResult, FormInputData, FreeTextInputData } from '../types/aibuilder';
import '../../styles/video-builder.css';

type Step = 'input' | 'generating' | 'result';

/* ── Mode Tab Config ──────────────────────────────── */
const MODE_TABS = [
    { id: 'form' as const, icon: FileText, label: 'Formular' },
    { id: 'free' as const, icon: MessageSquare, label: 'Freitext' },
    { id: 'store' as const, icon: Store, label: 'Shop Import' },
] as const;

/* ── Theater Pipeline Steps ────────────────────────── */
const PIPELINE_STEPS = [
    { label: 'Produkt analysieren', Icon: Search, delay: 0 },
    { label: 'Zielgruppe definieren', Icon: Target, delay: 2500 },
    { label: 'Texte generieren', Icon: PenTool, delay: 5500 },
    { label: 'Design auswählen', Icon: Palette, delay: 8000 },
    { label: 'Bild rendern', Icon: Frame, delay: 11000 },
];

export function AIAdBuilderPage() {
    const { profile } = useAuthState();
    const { refreshProfile: _refreshProfile } = useAuthActions();
    const credits = profile?.credits ?? 0;

    const language: Language = 'de';
    const [mode, setMode] = useState<InputMode | 'store'>('form');
    const [step, setStep] = useState<Step>('input');
    const [loading, setLoading] = useState(false);
    const [generatingStartTime, setGeneratingStartTime] = useState<number | null>(null);
    const [result, setResult] = useState<AdGenerationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [productImage, setProductImage] = useState<File | null>(null);
    const [productImagePreview, setProductImagePreview] = useState<string | null>(null);

    // Store import state
    const [importedProducts, setImportedProducts] = useState<ScrapedProduct[]>([]);
    const [importedCopies, setImportedCopies] = useState<ProductCopy[]>([]);
    const [showCarouselBuilder, setShowCarouselBuilder] = useState(false);

    // Multi-variant selection
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

    // Ad refinement state
    const [refinePrompt, setRefinePrompt] = useState('');
    const [isRefining, setIsRefining] = useState(false);

    // Ad format state
    const [adFormat, setAdFormat] = useState<'square' | 'portrait' | 'story'>('square');

    // Funnel stage state
    const [funnelStage, setFunnelStage] = useState<'tof' | 'mof' | 'bof'>('tof');

    // ── VIDEO STATE ──
    const [outputType, setOutputType] = useState<OutputType>('image');
    const [videoSettings, setVideoSettings] = useState<VideoSettings>({
        archetype: 'product_reveal',
        durationSeconds: 6,
        includeAudio: true,
        quality: 'fast',
        aspectRatio: '9:16',
        resolution: '1080p',
        personGeneration: 'dont_allow',
    });
    const [videoResult, setVideoResult] = useState<VideoGenerationResult | null>(null);
    const [videoProgress, setVideoProgress] = useState(0);
    const [videoStep, setVideoStep] = useState('');
    const [videoProgressMessage, setVideoProgressMessage] = useState('');

    // Theater mode completed steps
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    // Pipeline flags
    const useAIDesignSystem = true;
    const useCompositePipeline = true;

    const STORAGE_KEY = 'adruby_last_generated_ad';

    // Restore last generated ad from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.result && parsed.timestamp) {
                    const age = Date.now() - parsed.timestamp;
                    if (age < 24 * 60 * 60 * 1000) {
                        setResult(parsed.result);
                        setStep('result');
                        if (parsed.productImagePreview) {
                            setProductImagePreview(parsed.productImagePreview);
                        }
                    } else {
                        localStorage.removeItem(STORAGE_KEY);
                    }
                }
            }
        } catch {
            // Failed to restore session
        }
    }, []);

    // Save result to localStorage
    useEffect(() => {
        if (result) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    result,
                    productImagePreview,
                    timestamp: Date.now()
                }));
            } catch {
                // Failed to save session
            }
        }
    }, [result, productImagePreview]);

    // Theater mode: mark steps as completed with delays, adapt when result arrives
    useEffect(() => {
        if (step !== 'generating') {
            setCompletedSteps([]);
            return;
        }
        setGeneratingStartTime(Date.now());
        const timers = PIPELINE_STEPS.map((s, i) =>
            setTimeout(() => {
                setCompletedSteps(prev => [...prev, i]);
            }, s.delay + 1500)
        );
        return () => timers.forEach(clearTimeout);
    }, [step]);

    // When result arrives, immediately complete all remaining steps
    useEffect(() => {
        if (step === 'result' && generatingStartTime) {
            setCompletedSteps(PIPELINE_STEPS.map((_, i) => i));
            setGeneratingStartTime(null);
        }
    }, [step, generatingStartTime]);

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                toast.error('Bild zu groß — maximal 5MB erlaubt');
                return;
            }
            setProductImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProductImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            toast.success('Bild hochgeladen');
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            if (file.size > MAX_FILE_SIZE) {
                toast.error('Bild zu groß — maximal 5MB erlaubt');
                return;
            }
            setProductImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProductImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            toast.success('Bild hochgeladen');
        }
    }, []);

    const removeImage = useCallback(() => {
        setProductImage(null);
        setProductImagePreview(null);
    }, []);

    const handleGenerate = async (inputData: FormInputData | FreeTextInputData) => {
        // Credit check
        if (credits <= 0) {
            toast.error('Keine Credits mehr — bitte upgraden');
            return;
        }
        setLoading(true);
        setError(null);
        setStep('generating');
        setSelectedVariantIndex(0);

        try {
            let productImageUrl = undefined;

            if (productImage) {
                const filename = `temp/product-${profile?.id}-${Date.now()}.png`;
                const { data: _uploadData, error: uploadError } = await supabase.storage
                    .from('creative-images')
                    .upload(filename, productImage);

                if (uploadError) throw new Error('Product image upload failed: ' + uploadError.message);

                const { data: urlData } = supabase.storage
                    .from('creative-images')
                    .getPublicUrl(filename);
                productImageUrl = urlData.publicUrl;
            }

            const response = await generateAd({
                mode: mode as InputMode,
                language,
                productImageUrl,
                useAIDesignSystem,
                useCompositePipeline,
                format: adFormat,
                funnelStage,
                ...inputData,
            });

            if (response.success) {
                setResult(response.data);
                setStep('result');
                toast.success(t('successMessage', language));
            } else {
                throw new Error('Generation failed');
            }
        } catch (err) {
            console.error('Generation error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            setStep('input');
            toast.error(t('errorMessage', language) + ': ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // ── VIDEO GENERATE HANDLER ──
    const handleVideoGenerate = async (inputData: FormInputData | FreeTextInputData) => {
        const videoCreditCost = calculateVideoCreditCost(videoSettings.quality, videoSettings.durationSeconds);
        if (credits < videoCreditCost) {
            toast.error(`Nicht genug Credits — ${videoCreditCost} benötigt`);
            return;
        }
        setLoading(true);
        setError(null);
        setStep('generating');
        setVideoResult(null);
        setVideoProgress(0);
        setVideoStep('pending');
        setVideoProgressMessage('Video wird vorbereitet...');

        try {
            let productImageUrl: string | undefined;
            if (productImage) {
                const filename = `temp/product-${profile?.id}-${Date.now()}.png`;
                const { error: uploadError } = await supabase.storage
                    .from('creative-images')
                    .upload(filename, productImage);
                if (uploadError) throw new Error('Product image upload failed: ' + uploadError.message);
                const { data: urlData } = supabase.storage.from('creative-images').getPublicUrl(filename);
                productImageUrl = urlData.publicUrl;
            }

            const formData = 'text' in inputData ? inputData : inputData as FormInputData;
            const response = await generateVideoAd({
                outputType: 'video',
                mode: (mode === 'store' ? 'form' : mode) as 'form' | 'free',
                language,
                archetypeId: videoSettings.archetype,
                durationSeconds: videoSettings.durationSeconds,
                quality: videoSettings.quality,
                aspectRatio: videoSettings.aspectRatio,
                resolution: videoSettings.resolution,
                includeAudio: videoSettings.includeAudio,
                personGeneration: videoSettings.personGeneration,
                productImageUrl,
                productName: 'productName' in formData ? (formData as FormInputData).productName : undefined,
                industry: 'industry' in formData ? (formData as FormInputData).industry : undefined,
                targetAudience: 'targetAudience' in formData ? (formData as FormInputData).targetAudience : undefined,
                usp: 'usp' in formData ? (formData as FormInputData).usp : undefined,
                text: 'text' in formData ? (formData as { text: string }).text : undefined,
            }, {
                onProgress: (progress, step, message) => {
                    setVideoProgress(progress);
                    setVideoStep(step);
                    setVideoProgressMessage(message);
                },
            });

            if (response.success && response.data) {
                setVideoResult(response.data);
                setStep('result');
                toast.success('🎬 Video-Ad erstellt!');
            } else {
                throw new Error(response.error || 'Video generation failed');
            }
        } catch (err) {
            console.error('Video generation error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            setStep('input');
            toast.error('Video-Generierung fehlgeschlagen: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        setVideoResult(null);
        setError(null);
        setStep('input');
        localStorage.removeItem(STORAGE_KEY);
    };

    const handleSaveToLibrary = async () => {
        // Video save
        if (outputType === 'video' && videoResult) {
            try {
                const user = (await supabase.auth.getUser())?.data?.user;
                if (!user) throw new Error('Nicht eingeloggt');

                const { error } = await supabase
                    .from('generated_creatives')
                    .insert({
                        user_id: user.id,
                        image_url: videoResult.videoUrl,
                        media_type: 'video',
                        prompt: videoResult.archetype?.replace(/_/g, ' ') || 'Video Ad',
                        archetype: videoResult.archetype || 'video_ad',
                        ad_score: videoResult.qualityScore || null,
                        format: videoResult.aspectRatio || '9:16',
                        tags: ['video', 'ai-generated', videoResult.archetype || 'video'].filter(Boolean),
                        metadata: {
                            duration_ms: videoResult.durationMs,
                            resolution: videoResult.resolution,
                            has_audio: videoResult.hasAudio,
                            engagement_score: videoResult.engagementScore,
                            archetype: videoResult.archetype,
                        },
                        saved: true,
                    });
                if (error) throw error;
                toast.success('Video in Bibliothek gespeichert!');
            } catch (err) {
                console.error('Video save error:', err);
                toast.error('Speichern fehlgeschlagen');
            }
            return;
        }

        // Image save (existing)
        if (!result?.id) {
            toast.error('Keine Ad zum Speichern');
            return;
        }
        try {
            const { error } = await supabase
                .from('generated_creatives')
                .update({ saved: true })
                .eq('id', result.id);
            if (error) throw error;
            toast.success(t('savedToLibrary', language));
            localStorage.removeItem(STORAGE_KEY);
        } catch (err) {
            console.error('Save error:', err);
            toast.error('Speichern fehlgeschlagen');
        }
    };

    const handleDownload = () => {
        const url = outputType === 'video' ? videoResult?.videoUrl : result?.imageUrl;
        if (!url) return;
        const ext = outputType === 'video' ? 'mp4' : 'png';
        const link = document.createElement('a');
        link.href = url;
        link.download = `ai-ad-${Date.now()}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRefine = async () => {
        if (!result?.id || !refinePrompt.trim()) return;
        if (credits <= 0) {
            toast.error('Keine Credits mehr — bitte upgraden');
            return;
        }

        setIsRefining(true);
        try {
            const response = await refineAd({
                jobId: result.id,
                refinementPrompt: refinePrompt.trim(),
                language,
            });

            if (response.success && response.data) {
                setResult(response.data);
                setRefinePrompt('');
                toast.success('Ad wurde bearbeitet!');
                // Refresh profile to update credit count
                try { _refreshProfile(); } catch { /* ignore */ }
            } else {
                throw new Error('Refinement failed');
            }
        } catch (err) {
            console.error('Refine error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Bearbeitung fehlgeschlagen';
            toast.error(errorMessage);
        } finally {
            setIsRefining(false);
        }
    };

    return (
        <DashboardShell hideHero>
            {/* ── Header ──────────────────────────────────── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Ad Builder</h1>
                    <p className="text-sm text-muted-foreground">Erstelle hochkonvertierende Meta Ads mit KI</p>
                </div>
                <div className="flex items-center gap-3">
                    {step === 'result' && (
                        <Badge variant="secondary" className="text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Fertig
                        </Badge>
                    )}
                </div>
            </div>

            {/* ── Output Type Toggle (Bild ↔ Video) ──── */}
            <div className="output-type-toggle" style={{ maxWidth: '280px' }}>
                <button
                    className={cn('output-type-btn', outputType === 'image' && 'output-type-btn--active')}
                    onClick={() => setOutputType('image')}
                >
                    <Image className="w-4 h-4" /> 🖼️ Bild
                </button>
                <button
                    className={cn('output-type-btn', outputType === 'video' && 'output-type-btn--active')}
                    onClick={() => setOutputType('video')}
                >
                    <Film className="w-4 h-4" /> 🎬 Video
                </button>
            </div>

            {/* ── Mode Tabs ────────────────────────────── */}
            <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border/50">
                {MODE_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = mode === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setMode(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${isActive
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ═══ Main Grid — Input + Canvas ═══════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

                {/* ── LEFT: Input Column (2/5) ─────────────── */}
                <div className="lg:col-span-2 input-panel">

                    {/* Product Image Upload */}
                    {mode !== 'store' && (
                        <div className="upload-zone-gradient">
                            <div className="input-section">
                                <div className="input-section-header">
                                    <Image className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-semibold">Produktbild</span>
                                    <span className="ml-auto text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                                        Empfohlen
                                    </span>
                                </div>
                                <div className="input-section-body">
                                    {productImagePreview ? (
                                        <div className="relative group rounded-xl overflow-hidden">
                                            <img
                                                src={productImagePreview}
                                                alt="Produkt"
                                                className="w-full h-40 object-contain bg-black/5 dark:bg-white/5 transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center backdrop-blur-0 group-hover:backdrop-blur-[2px]">
                                                <button
                                                    onClick={removeImage}
                                                    className="p-2.5 bg-white/90 dark:bg-black/70 text-destructive rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 shadow-xl"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label
                                            className="relative flex flex-col items-center justify-center w-full h-32 rounded-xl cursor-pointer
                                                       bg-gradient-to-br from-muted/40 to-muted/10
                                                       border-2 border-dashed border-border/30
                                                       hover:border-primary/40 hover:from-primary/5 hover:to-red-500/5
                                                       transition-all duration-400 group/upload"
                                            onDrop={handleDrop}
                                            onDragOver={(e) => e.preventDefault()}
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-red-500/5 flex items-center justify-center mb-3 group-hover/upload:from-primary/20 group-hover/upload:to-red-500/10 group-hover/upload:scale-110 transition-all duration-300">
                                                <Upload className="w-5 h-5 text-primary/60 group-hover/upload:text-primary transition-colors" />
                                            </div>
                                            <span className="text-xs font-medium text-muted-foreground group-hover/upload:text-foreground transition-colors">
                                                Bild hochladen oder hierher ziehen
                                            </span>
                                            <span className="text-[10px] text-muted-foreground/40 mt-1">PNG, JPG bis 5MB</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Format Selector ── */}
                    <div className="input-section">
                        <div className="input-section-header">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-red-500/10 flex items-center justify-center">
                                    <RectangleVertical className="w-3.5 h-3.5 text-primary/70" />
                                </div>
                                <h3 className="text-sm font-semibold text-foreground">Format</h3>
                            </div>
                        </div>
                        <div className="input-section-body">
                            <div className="flex gap-2">
                                {[
                                    { id: 'square' as const, label: '1:1 Feed', icon: Square },
                                    { id: 'portrait' as const, label: '4:5 Instagram', icon: RectangleVertical },
                                    { id: 'story' as const, label: '9:16 Story', icon: Smartphone },
                                ].map(fmt => (
                                    <button
                                        key={fmt.id}
                                        onClick={() => setAdFormat(fmt.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-300
                                            ${adFormat === fmt.id
                                                ? 'bg-primary/10 text-primary border border-primary/30 shadow-sm'
                                                : 'bg-muted/20 text-muted-foreground border border-border/20 hover:bg-muted/40 hover:text-foreground'
                                            }`}
                                    >
                                        <fmt.icon className="w-3.5 h-3.5" />
                                        {fmt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Funnel Stage Selector ── */}
                    <div className="input-section">
                        <div className="input-section-header">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-amber-500/10 flex items-center justify-center">
                                    <Target className="w-3.5 h-3.5 text-primary/70" />
                                </div>
                                <h3 className="text-sm font-semibold text-foreground">Funnel-Phase</h3>
                            </div>
                        </div>
                        <div className="input-section-body">
                            <div className="flex gap-2">
                                {[
                                    { id: 'tof' as const, label: 'Entdecken', sub: 'Awareness' },
                                    { id: 'mof' as const, label: 'Vergleichen', sub: 'Consideration' },
                                    { id: 'bof' as const, label: 'Kaufen', sub: 'Conversion' },
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFunnelStage(f.id)}
                                        className={`flex-1 flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-300
                                            ${funnelStage === f.id
                                                ? 'bg-primary/10 text-primary border border-primary/30 shadow-sm'
                                                : 'bg-muted/20 text-muted-foreground border border-border/20 hover:bg-muted/40 hover:text-foreground'
                                            }`}
                                    >
                                        <span>{f.label}</span>
                                        <span className="text-[10px] opacity-60">{f.sub}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Video Settings Panel (below format/funnel) ── */}
                    {outputType === 'video' && (
                        <VideoSettingsPanel
                            language={language}
                            settings={videoSettings}
                            onSettingsChange={setVideoSettings}
                            disabled={loading}
                        />
                    )}

                    {/* Form / Free / Store Content */}
                    {mode === 'form' ? (
                        <FormInputMode
                            language={language}
                            onGenerate={outputType === 'video' ? handleVideoGenerate : handleGenerate}
                            loading={loading}
                        />
                    ) : mode === 'free' ? (
                        <FreeTextInputMode
                            language={language}
                            onGenerate={outputType === 'video' ? handleVideoGenerate : handleGenerate}
                            loading={loading}
                        />
                    ) : mode === 'store' && !showCarouselBuilder ? (
                        <div className="input-section">
                            <div className="input-section-body">
                                <StoreImporter
                                    onProductsSelected={(products, copies) => {
                                        setImportedProducts(products);
                                        setImportedCopies(copies);
                                    }}
                                    onCreateSingleAds={(products) => {
                                        if (!products.length) {
                                            toast.error('Keine Produkte ausgewählt');
                                            return;
                                        }
                                        const p = products[0];
                                        const formData: FormInputData = {
                                            productName: p.title,
                                            usp: p.description?.slice(0, 200) || p.title,
                                            targetAudience: p.tags?.join(', ') || '',
                                            industry: p.productType || '',
                                            tone: 'professional',
                                            goal: 'sales',
                                            template: 'default',
                                        };
                                        if (p.images?.[0]?.src) {
                                            setProductImagePreview(p.images[0].src);
                                        }
                                        toast.info(`Ad wird generiert für: ${p.title}`);
                                        handleGenerate(formData);
                                    }}
                                    onCreateCarousel={(products, copies) => {
                                        setImportedProducts(products);
                                        setImportedCopies(copies);
                                        setShowCarouselBuilder(true);
                                    }}
                                />
                            </div>
                        </div>
                    ) : mode === 'store' && showCarouselBuilder ? (
                        <div className="input-section">
                            <div className="input-section-header">
                                <span className="text-sm font-semibold">Carousel Builder</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="ml-auto text-xs h-7"
                                    onClick={() => setShowCarouselBuilder(false)}
                                >
                                    ← Zurück
                                </Button>
                            </div>
                            <div className="input-section-body">
                                <CarouselBuilder
                                    products={importedProducts}
                                    copies={importedCopies}
                                    onSave={() => { toast.success('Carousel gespeichert!'); }}
                                    onExport={() => { toast.success('Carousel exportiert!'); }}
                                />
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* ── RIGHT: Canvas Preview (3/5) ──────────── */}
                <div className="lg:col-span-3">
                    <div className="ad-builder-canvas grain-overlay">
                        <div className="relative z-10 p-6">
                            {step === 'generating' ? (
                                /* ── Theater Mode — Premium AI ──── */
                                <div className="ai-empty-state" style={{ minHeight: '560px' }}>
                                    {/* Aurora gradient */}
                                    <div className="ai-empty-aurora" />

                                    {/* Rising particles */}
                                    <div className="ai-empty-particles">
                                        {[...Array(12)].map((_, i) => (
                                            <div key={i} className={`ai-particle ai-particle-${(i % 4) + 1}`} style={{
                                                left: `${10 + Math.random() * 80}%`,
                                                animationDelay: `${i * 0.4}s`,
                                                width: `${2 + Math.random() * 4}px`,
                                                height: `${2 + Math.random() * 4}px`,
                                            }} />
                                        ))}
                                    </div>

                                    {/* Neural Core */}
                                    <div className="ai-core-container" style={{ width: '130px', height: '130px', marginBottom: '1rem' }}>
                                        <div className="ai-orbit-ring ai-orbit-ring-3"><div className="ai-orbit-dot" /></div>
                                        <div className="ai-orbit-ring ai-orbit-ring-2"><div className="ai-orbit-dot" /><div className="ai-orbit-dot ai-orbit-dot-2" /></div>
                                        <div className="ai-orbit-ring ai-orbit-ring-1"><div className="ai-orbit-dot ai-orbit-dot-lg" /></div>
                                        <div className="ai-core-glow ai-core-glow-outer" />
                                        <div className="ai-core-glow ai-core-glow-mid" />
                                        <div className="ai-core-icon">
                                            <Sparkles className="w-7 h-7 text-white" />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-display font-bold text-lg text-foreground ai-text-glow">
                                        KI generiert deine Ad…
                                    </h3>

                                    {/* Progress bar */}
                                    <div className="w-full max-w-xs mt-3">
                                        <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full theater-progress-bar bg-primary" />
                                        </div>
                                        <p className="text-xs text-muted-foreground/50 mt-1.5 text-center">
                                            ca. 30–60 Sekunden
                                        </p>
                                    </div>

                                    {/* Pipeline Steps */}
                                    <div className="space-y-2 w-full max-w-xs mt-4">
                                        {PIPELINE_STEPS.map((pStep, i) => {
                                            const StepIcon = pStep.Icon;
                                            return (
                                                <div
                                                    key={i}
                                                    className="stagger-in flex items-center gap-2.5 text-sm"
                                                    style={{ animationDelay: `${pStep.delay}ms` }}
                                                >
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500",
                                                        completedSteps.includes(i)
                                                            ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/15"
                                                            : "text-muted-foreground/60"
                                                    )}>
                                                        {completedSteps.includes(i) ? (
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <StepIcon className="w-3.5 h-3.5" />
                                                        )}
                                                    </div>
                                                    <span className={cn(
                                                        "transition-colors duration-300 font-medium text-[13px]",
                                                        completedSteps.includes(i)
                                                            ? "text-foreground"
                                                            : "text-muted-foreground/60"
                                                    )}>
                                                        {pStep.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                /* ── Preview / Empty State ──────────── */
                                <div className="min-h-[440px]">
                                    {outputType === 'video' ? (
                                        <VideoPreviewArea
                                            language={language}
                                            result={videoResult}
                                            loading={loading}
                                            error={error}
                                            progress={videoProgress}
                                            currentStep={videoStep}
                                            progressMessage={videoProgressMessage}
                                            onDownload={handleDownload}
                                            onSaveToLibrary={handleSaveToLibrary}
                                            onRegenerate={handleReset}
                                        />
                                    ) : (
                                        <PreviewArea
                                            language={language}
                                            result={result}
                                            loading={loading}
                                            error={error}
                                            selectedVariantIndex={selectedVariantIndex}
                                            onSelectVariant={setSelectedVariantIndex}
                                        />
                                    )}

                                    {/* Action Buttons */}
                                    {result && !loading && step === 'result' && (
                                        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
                                            <Button
                                                onClick={handleDownload}
                                                className="generate-btn flex-1 gap-2 h-11 rounded-xl text-white border-0"
                                            >
                                                <Download className="w-4 h-4" />
                                                Herunterladen
                                            </Button>
                                            <Button onClick={handleSaveToLibrary} variant="outline" className="flex-1 gap-2 h-11 rounded-xl">
                                                <Save className="w-4 h-4" />
                                                In Bibliothek
                                            </Button>
                                            <Button onClick={handleReset} variant="ghost" className="gap-2 h-11 rounded-xl text-muted-foreground hover:text-foreground">
                                                <RefreshCw className="w-4 h-4" />
                                                Neu
                                            </Button>
                                        </div>
                                    )}

                                    {/* Refine / Edit Section */}
                                    {result && !loading && !isRefining && step === 'result' && (
                                        <div className="mt-4 pt-4 border-t border-border/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Wand2 className="w-3.5 h-3.5 text-primary" />
                                                <span className="text-xs font-semibold text-foreground">Ad bearbeiten</span>
                                                <Badge className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20">1 Credit</Badge>
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={refinePrompt}
                                                    onChange={(e) => setRefinePrompt(e.target.value)}
                                                    placeholder="z.B. 'Entferne den CTA Button', 'Mach den Text größer'..."
                                                    className="flex-1 h-9 px-3 rounded-lg bg-muted/30 border border-border/30 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && refinePrompt.trim()) handleRefine();
                                                    }}
                                                />
                                                <Button
                                                    onClick={handleRefine}
                                                    disabled={!refinePrompt.trim()}
                                                    size="sm"
                                                    className="h-9 px-3 gap-1.5 generate-btn text-white border-0"
                                                >
                                                    <Send className="w-3.5 h-3.5" />
                                                    Anpassen
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Refine loading state */}
                                    {isRefining && (
                                        <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-3">
                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                            <span className="text-sm text-muted-foreground">Ad wird bearbeitet...</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
