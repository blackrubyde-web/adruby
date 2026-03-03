/**
 * AI Ad Builder - Main Page Component (Enhanced V2)
 * Uses DashboardShell, compact mode tabs, 2/5+3/5 layout
 */

import { useState, useCallback, useEffect } from 'react';
import {
    Download, Save, Upload, FileText, MessageSquare,
    Sparkles, Image, Loader2, RefreshCw,
    AlertCircle, Store
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

export function AIAdBuilderPage() {
    const { profile } = useAuthState();
    const { refreshProfile: _refreshProfile } = useAuthActions();
    const credits = profile?.credits ?? 0;

    const language: Language = 'de';
    const [mode, setMode] = useState<InputMode | 'store'>('form');
    const [step, setStep] = useState<Step>('input');
    const [loading, setLoading] = useState(false);
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

    // Pipeline flags — always enabled, no user-facing toggles needed
    const useAIDesignSystem = true;
    const useCompositePipeline = true;

    // Session key for localStorage
    const STORAGE_KEY = 'adruby_last_generated_ad';

    // Restore last generated ad from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.result && parsed.timestamp) {
                    // Only restore if less than 24 hours old
                    const age = Date.now() - parsed.timestamp;
                    if (age < 24 * 60 * 60 * 1000) {
                        setResult(parsed.result);
                        setStep('result');
                        if (parsed.productImagePreview) {
                            setProductImagePreview(parsed.productImagePreview);
                        }
                        // Session restored
                    } else {
                        // Clear expired data
                        localStorage.removeItem(STORAGE_KEY);
                    }
                }
            }
        } catch (e) {
            // Failed to restore session
        }
    }, []);

    // Save result to localStorage when it changes
    useEffect(() => {
        if (result) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    result,
                    productImagePreview,
                    timestamp: Date.now()
                }));
                // Saved to session storage
            } catch {
                // Failed to save session
            }
        }
    }, [result, productImagePreview]);

    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProductImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProductImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            toast.success(language === 'de' ? 'Bild hochgeladen' : 'Image uploaded');
        }
    }, [language]);

    const removeImage = useCallback(() => {
        setProductImage(null);
        setProductImagePreview(null);
    }, []);

    const handleGenerate = async (inputData: FormInputData | FreeTextInputData) => {
        setLoading(true);
        setError(null);
        setStep('generating');
        setSelectedVariantIndex(0); // Reset variant selection

        try {
            let productImageUrl = undefined;

            if (productImage) {
                // Upload product image to Supabase
                const filename = `temp/product-${profile?.id}-${Date.now()}.png`;
                const { data: _uploadData, error: uploadError } = await supabase.storage
                    .from('creative-images')
                    .upload(filename, productImage);

                if (uploadError) throw new Error('Product image upload failed: ' + uploadError.message);

                const { data: urlData } = supabase.storage
                    .from('creative-images')
                    .getPublicUrl(filename);
                productImageUrl = urlData.publicUrl;
                // Product image uploaded successfully
            }

            // Note: Railway fetches image from URL directly - no base64 needed
            const response = await generateAd({
                mode: mode as InputMode,
                language,
                productImageUrl,  // Railway will fetch this URL directly
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
        // Clear saved session when user explicitly resets
        localStorage.removeItem(STORAGE_KEY);
    };

    const handleSaveToLibrary = async () => {
        if (!result?.id) {
            toast.error(language === 'de' ? 'Keine Ad zum Speichern' : 'No ad to save');
            return;
        }
        try {
            const { error } = await supabase
                .from('generated_creatives')
                .update({ saved: true })
                .eq('id', result.id);
            if (error) throw error;
            toast.success(t('savedToLibrary', language));
            // Clear session after saving - ad is now safely in library
            localStorage.removeItem(STORAGE_KEY);
        } catch (err) {
            console.error('Save error:', err);
            toast.error(language === 'de' ? 'Speichern fehlgeschlagen' : 'Save failed');
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
            {/* ── Compact Mode Tabs ─────────────────────────────── */}
            <div className="flex items-center gap-2">
                <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border/50">
                    <button
                        onClick={() => setMode('form')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            mode === 'form'
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        Formular
                    </button>
                    <button
                        onClick={() => setMode('free')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            mode === 'free'
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Freitext
                    </button>
                    <button
                        onClick={() => setMode('store')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            mode === 'store'
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Store className="w-3.5 h-3.5" />
                        Produkte importieren
                    </button>
                </div>

                {step === 'result' && (
                    <Badge variant="secondary" className="px-2.5 py-1 text-xs bg-green-500/10 text-green-600 border-green-500/20">
                        ✓ Fertig
                    </Badge>
                )}
            </div>

            {/* ── Main Content — 2/5 Input + 3/5 Preview ─────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* LEFT: Input Column (2/5) */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Product Image Upload */}
                    {mode !== 'store' && (
                        <Card variant="glass">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Image className="w-4 h-4 text-primary" />
                                    <h3 className="text-sm font-semibold">Produktbild</h3>
                                    <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                                        Empfohlen
                                    </span>
                                </div>
                                {productImagePreview ? (
                                    <div className="relative group">
                                        <img
                                            src={productImagePreview}
                                            alt="Produkt"
                                            className="w-full h-32 object-contain rounded-lg bg-muted/50"
                                        />
                                        <button
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <AlertCircle className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border/60 rounded-xl cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all">
                                        <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                                        <span className="text-xs text-muted-foreground">Bild hochladen oder ziehen</span>
                                        <span className="text-[10px] text-muted-foreground/60 mt-0.5">PNG, JPG bis 5MB</span>
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
                                    onCreateSingleAds={(products) => {
                                        toast.success(`${products.length} Ads werden generiert...`);
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
                        <Card variant="glass">
                            <CardContent className="p-8">
                                <div className="flex flex-col items-center justify-center space-y-6 text-center min-h-[380px]">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                                        <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-red-600 rounded-full flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">KI generiert deine Ad...</h3>
                                        <p className="text-sm text-muted-foreground mt-1.5">Dauert ca. 10–15 Sekunden</p>
                                    </div>
                                    {/* Animated Progress Steps */}
                                    <div className="space-y-2 w-full max-w-xs">
                                        {['🔍 Produkt analysieren', '🎨 Design auswählen', '✍️ Texte generieren', '🖼️ Bild rendern'].map((label, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i * 1.5}s`, animationFillMode: 'both' }}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                {label}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
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
                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={handleDownload}
                                className="flex-1 gap-2 bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90"
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
