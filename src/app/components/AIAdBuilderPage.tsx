/**
 * AI Ad Builder - Main Page Component (Premium V3)
 * Mode cards with icons & descriptions, animated upload zone,
 * theater generating mode, credit counter, ambient glow.
 */

import { useState, useCallback, useEffect } from 'react';
import {
    Download, Save, Upload, FileText, MessageSquare,
    Sparkles, Image, Loader2, RefreshCw,
    AlertCircle, Store, Zap, CheckCircle2, X
} from 'lucide-react';
import { generateAd } from '../lib/api/aibuilder';
import { t } from '../lib/aibuilder/translations';
import { toast } from 'sonner';
import { FormInputMode } from './aibuilder/FormInputMode';
import { FreeTextInputMode } from './aibuilder/FreeTextInputMode';
import { PreviewArea } from './aibuilder/PreviewArea';
import { StoreImporter, CarouselBuilder } from './store-importer';
import type { ScrapedProduct, ProductCopy } from './store-importer/types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { DashboardShell } from './layout/DashboardShell';
import { cn } from '../lib/utils';
import { useAuthState, useAuthActions } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import type { Language, InputMode, AdGenerationResult, FormInputData, FreeTextInputData } from '../types/aibuilder';

type Step = 'input' | 'generating' | 'result';

/* ── Mode Card Config ──────────────────────────────── */
const MODE_CARDS = [
    {
        id: 'form' as const,
        icon: FileText,
        title: 'Formular',
        description: 'Geführte Eingabe mit Feldern',
        gradient: 'from-primary/20 to-red-500/10',
        borderColor: 'border-primary/40',
        iconColor: 'text-primary',
    },
    {
        id: 'free' as const,
        icon: MessageSquare,
        title: 'Freitext',
        description: 'Beschreibe deine Ad frei',
        gradient: 'from-violet-500/20 to-fuchsia-500/10',
        borderColor: 'border-violet-500/40',
        iconColor: 'text-violet-500',
    },
    {
        id: 'store' as const,
        icon: Store,
        title: 'Shop Import',
        description: 'Produkte aus deinem Store',
        gradient: 'from-emerald-500/20 to-teal-500/10',
        borderColor: 'border-emerald-500/40',
        iconColor: 'text-emerald-500',
    },
] as const;

/* ── Theater Pipeline Steps ────────────────────────── */
const PIPELINE_STEPS = [
    { label: 'Produkt analysieren', icon: '🔍', delay: 0 },
    { label: 'Zielgruppe definieren', icon: '🎯', delay: 2500 },
    { label: 'Texte generieren', icon: '✍️', delay: 5500 },
    { label: 'Design auswählen', icon: '🎨', delay: 8000 },
    { label: 'Bild rendern', icon: '🖼️', delay: 11000 },
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

    const handleReset = () => {
        setResult(null);
        setError(null);
        setStep('input');
        localStorage.removeItem(STORAGE_KEY);
    };

    const handleSaveToLibrary = async () => {
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
        if (!result?.imageUrl) return;
        const link = document.createElement('a');
        link.href = result.imageUrl;
        link.download = `ai-ad-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <DashboardShell hideHero>
            {/* ── Mode Cards ─────────────────────────────────── */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    {MODE_CARDS.map((card) => {
                        const Icon = card.icon;
                        const isActive = mode === card.id;
                        return (
                            <button
                                key={card.id}
                                onClick={() => setMode(card.id)}
                                className={cn(
                                    "relative flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-300 group cursor-pointer",
                                    isActive
                                        ? `bg-gradient-to-br ${card.gradient} ${card.borderColor} shadow-lg shadow-black/5`
                                        : "bg-card/60 border-border/30 hover:border-border/60 hover:bg-card/80"
                                )}
                            >
                                {/* Active indicator bar */}
                                {isActive && (
                                    <div className={cn(
                                        "absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b",
                                        card.id === 'form' ? "from-primary to-red-500" :
                                            card.id === 'free' ? "from-violet-500 to-fuchsia-500" :
                                                "from-emerald-500 to-teal-500"
                                    )} />
                                )}
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                                    isActive
                                        ? `bg-background/80 ${card.iconColor}`
                                        : "bg-muted/50 text-muted-foreground group-hover:text-foreground"
                                )}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <div className={cn(
                                        "text-xs font-semibold transition-colors",
                                        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                    )}>
                                        {card.title}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground/70 truncate">
                                        {card.description}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Status badge — only show "Fertig" when result ready */}
                <div className="ml-auto flex items-center gap-2">
                    {step === 'result' && (
                        <Badge variant="secondary" className="px-2.5 py-1 text-xs bg-green-500/10 text-green-600 border-green-500/20 gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Fertig
                        </Badge>
                    )}
                </div>
            </div>

            {/* ── Main Content — 2/5 Input + 3/5 Preview ─────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* LEFT: Input Column (2/5) */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Product Image Upload — Animated Gradient Border */}
                    {mode !== 'store' && (
                        <div className="upload-zone-gradient">
                            <Card variant="glass" className="relative">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Image className="w-4 h-4 text-primary" />
                                        <h3 className="text-sm font-semibold">Produktbild</h3>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                                            Empfohlen
                                        </span>
                                    </div>
                                    {productImagePreview ? (
                                        <div className="relative group rounded-lg overflow-hidden">
                                            <img
                                                src={productImagePreview}
                                                alt="Produkt"
                                                className="w-full h-36 object-contain bg-black/20 transition-transform duration-300 group-hover:scale-105"
                                            />
                                            {/* Dark overlay on hover */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                                <button
                                                    onClick={removeImage}
                                                    className="p-2 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 shadow-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {/* Glow ring */}
                                            <div className="absolute inset-0 rounded-lg ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all pointer-events-none" />
                                        </div>
                                    ) : (
                                        <label
                                            className="relative flex flex-col items-center justify-center w-full h-28 rounded-xl cursor-pointer
                                                       bg-gradient-to-br from-muted/30 to-muted/10
                                                       border border-dashed border-border/40
                                                       hover:border-primary/50 hover:shadow-[0_0_20px_rgba(var(--primary-rgb,239,68,68),0.1)]
                                                       transition-all duration-300 group/upload"
                                            onDrop={handleDrop}
                                            onDragOver={(e) => e.preventDefault()}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover/upload:bg-primary/20 group-hover/upload:scale-110 transition-all duration-300">
                                                <Upload className="w-5 h-5 text-primary/70 group-hover/upload:text-primary transition-colors" />
                                            </div>
                                            <span className="text-xs text-muted-foreground group-hover/upload:text-foreground transition-colors">
                                                Bild hochladen oder ziehen
                                            </span>
                                            <span className="text-[10px] text-muted-foreground/50 mt-0.5">PNG, JPG bis 5MB</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                        </label>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Form/Free/Store Content */}
                    {mode === 'form' ? (
                        <FormInputMode
                            language={language}
                            onGenerate={handleGenerate}
                            loading={loading}
                        />
                    ) : mode === 'free' ? (
                        <FreeTextInputMode
                            language={language}
                            onGenerate={handleGenerate}
                            loading={loading}
                        />
                    ) : mode === 'store' && !showCarouselBuilder ? (
                        <Card variant="glass">
                            <CardContent className="p-4">
                                <StoreImporter
                                    onProductsSelected={(products, copies) => {
                                        setImportedProducts(products);
                                        setImportedCopies(copies);
                                    }}
                                    onCreateSingleAds={(_products) => {
                                        toast.info('Einzel-Ads aus Shop-Import — Coming Soon! Nutze den Carousel Builder.');
                                    }}
                                    onCreateCarousel={(products, copies) => {
                                        setImportedProducts(products);
                                        setImportedCopies(copies);
                                        setShowCarouselBuilder(true);
                                    }}
                                />
                            </CardContent>
                        </Card>
                    ) : mode === 'store' && showCarouselBuilder ? (
                        <Card variant="glass">
                            <CardContent className="p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-foreground">Carousel Builder</h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-7"
                                        onClick={() => setShowCarouselBuilder(false)}
                                    >
                                        ← Zurück
                                    </Button>
                                </div>
                                <CarouselBuilder
                                    products={importedProducts}
                                    copies={importedCopies}
                                    onSave={() => { toast.success('Carousel gespeichert!'); }}
                                    onExport={() => { toast.success('Carousel exportiert!'); }}
                                />
                            </CardContent>
                        </Card>
                    ) : null}
                </div>

                {/* RIGHT: Preview Column (3/5) */}
                <div className="lg:col-span-3 space-y-4">
                    {step === 'generating' ? (
                        /* ── Theater Mode ─────────────────────────── */
                        <div className="relative rounded-2xl overflow-hidden border border-border/20">
                            {/* Frosted glass background */}
                            <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />

                            {/* Floating particles */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`particle particle-${i + 1}`}
                                        style={{
                                            width: `${4 + Math.random() * 6}px`,
                                            height: `${4 + Math.random() * 6}px`,
                                            left: `${15 + Math.random() * 70}%`,
                                            bottom: `${10 + Math.random() * 30}%`,
                                            background: `hsl(var(--primary) / ${0.3 + Math.random() * 0.4})`,
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Shimmer overlay */}
                            <div className="absolute inset-0 shimmer-bg pointer-events-none" />

                            <div className="relative flex flex-col items-center justify-center min-h-[440px] p-8 text-center space-y-8">
                                {/* Animated icon */}
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-2xl animate-pulse" />
                                    <div className="relative w-20 h-20 bg-gradient-to-br from-primary via-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20">
                                        <Sparkles className="w-9 h-9 text-white animate-pulse" />
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <h3 className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                        KI generiert deine Ad…
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Dauert ca. 10–15 Sekunden
                                    </p>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full max-w-sm">
                                    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-primary via-red-500 to-orange-500 rounded-full theater-progress-bar" />
                                    </div>
                                </div>

                                {/* Step checklist */}
                                <div className="space-y-3 w-full max-w-xs">
                                    {PIPELINE_STEPS.map((pStep, i) => (
                                        <div
                                            key={i}
                                            className="stagger-in flex items-center gap-3 text-sm"
                                            style={{ animationDelay: `${pStep.delay}ms` }}
                                        >
                                            <div className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 transition-all duration-500",
                                                completedSteps.includes(i)
                                                    ? "bg-green-500/20 text-green-500"
                                                    : "bg-muted/30 text-muted-foreground"
                                            )}>
                                                {completedSteps.includes(i) ? (
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                ) : (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                )}
                                            </div>
                                            <span className={cn(
                                                "transition-colors duration-300",
                                                completedSteps.includes(i)
                                                    ? "text-foreground"
                                                    : "text-muted-foreground"
                                            )}>
                                                {pStep.icon} {pStep.label}
                                            </span>
                                            {completedSteps.includes(i) && (
                                                <span className="ml-auto text-[10px] text-green-500/70">✓</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ── Preview with ambient glow ─────────── */
                        <div className="relative">
                            {/* Ambient glow behind preview */}
                            {result && (
                                <div className="absolute -inset-4 bg-gradient-to-br from-primary/8 via-transparent to-red-500/8 rounded-3xl blur-2xl pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
                            )}
                            <div className="relative">
                                <PreviewArea
                                    language={language}
                                    result={result}
                                    loading={loading}
                                    error={error}
                                    selectedVariantIndex={selectedVariantIndex}
                                    onSelectVariant={setSelectedVariantIndex}
                                />
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {result && !loading && step === 'result' && (
                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={handleDownload}
                                className="flex-1 gap-2 bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90 shadow-lg shadow-primary/20 gradient-shift-hover"
                            >
                                <Download className="w-4 h-4" />
                                Herunterladen
                            </Button>
                            <Button onClick={handleSaveToLibrary} variant="outline" className="flex-1 gap-2">
                                <Save className="w-4 h-4" />
                                In Bibliothek speichern
                            </Button>
                            <Button onClick={handleReset} variant="ghost" className="gap-2">
                                <RefreshCw className="w-4 h-4" />
                                Neu starten
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardShell>
    );
}
