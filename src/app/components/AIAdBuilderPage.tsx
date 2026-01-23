/**
 * AI Ad Builder - Main Page Component (Enhanced V2)
 * Premium design with product upload, beautiful mode switcher
 */

import { useState, useCallback, useEffect } from 'react';
import {
    Wand2, Download, Save, Globe, Upload, FileText, MessageSquare,
    Sparkles, Image, Loader2, RefreshCw, Zap, ChevronRight,
    CheckCircle2, AlertCircle, Store
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
import { cn } from '../lib/utils';
import { useAuthState, useAuthActions } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import type { Language, InputMode, AdGenerationResult, FormInputData, FreeTextInputData } from '../types/aibuilder';

type Step = 'input' | 'generating' | 'result';

export function AIAdBuilderPage() {
    const { profile } = useAuthState();
    const { refreshProfile: _refreshProfile } = useAuthActions();
    const credits = profile?.credits ?? 0;

    const [language, setLanguage] = useState<Language>('de');
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
            }



            const response = await generateAd({
                mode: mode as InputMode,
                language,
                productImageUrl,
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
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            {/* Premium Header */}
            <div className="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-xl">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Logo */}
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-red-500 to-orange-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition"></div>
                                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center shadow-lg">
                                    <Wand2 className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight">{t('pageTitle', language)}</h1>
                                <p className="text-xs text-muted-foreground">{t('pageSubtitle', language)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Credits Badge */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm">
                                <Zap className="w-4 h-4 text-primary" />
                                <span className="font-medium">{credits} Credits</span>
                            </div>

                            {/* Language Toggle */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
                                className="gap-2 rounded-full"
                            >
                                <Globe className="w-4 h-4" />
                                {language.toUpperCase()}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-center gap-2 text-sm">
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                        step === 'input' ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    )}>
                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span>
                        <span className="hidden sm:inline">{language === 'de' ? 'Eingabe' : 'Input'}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                        step === 'generating' ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    )}>
                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">2</span>
                        <span className="hidden sm:inline">{language === 'de' ? 'Generierung' : 'Generating'}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                        step === 'result' ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    )}>
                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">3</span>
                        <span className="hidden sm:inline">{language === 'de' ? 'Ergebnis' : 'Result'}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Column - Input */}
                    <div className="space-y-6">

                        {/* Premium Mode Switcher */}
                        <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-2">
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => setMode('form')}
                                    className={cn(
                                        "relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                                        mode === 'form'
                                            ? "bg-gradient-to-br from-primary to-red-600 text-white shadow-lg shadow-primary/25"
                                            : "hover:bg-muted/50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                        mode === 'form' ? "bg-white/20" : "bg-muted"
                                    )}>
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-sm">{t('modeFormLabel', language)}</div>
                                        <div className={cn(
                                            "text-xs hidden sm:block",
                                            mode === 'form' ? "text-white/70" : "text-muted-foreground"
                                        )}>
                                            {t('modeFormDesc', language)}
                                        </div>
                                    </div>
                                    {mode === 'form' && (
                                        <CheckCircle2 className="absolute top-2 right-2 w-4 h-4" />
                                    )}
                                </button>

                                <button
                                    onClick={() => setMode('free')}
                                    className={cn(
                                        "relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                                        mode === 'free'
                                            ? "bg-gradient-to-br from-primary to-red-600 text-white shadow-lg shadow-primary/25"
                                            : "hover:bg-muted/50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                        mode === 'free' ? "bg-white/20" : "bg-muted"
                                    )}>
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-sm">{t('modeFreeLabel', language)}</div>
                                        <div className={cn(
                                            "text-xs hidden sm:block",
                                            mode === 'free' ? "text-white/70" : "text-muted-foreground"
                                        )}>
                                            {t('modeFreeDesc', language)}
                                        </div>
                                    </div>
                                    {mode === 'free' && (
                                        <CheckCircle2 className="absolute top-2 right-2 w-4 h-4" />
                                    )}
                                </button>

                                <button
                                    onClick={() => setMode('store')}
                                    className={cn(
                                        "relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                                        mode === 'store'
                                            ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                                            : "hover:bg-muted/50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                        mode === 'store' ? "bg-white/20" : "bg-muted"
                                    )}>
                                        <Store className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-sm">
                                            {language === 'de' ? 'Store Import' : 'Store Import'}
                                        </div>
                                        <div className={cn(
                                            "text-xs hidden sm:block",
                                            mode === 'store' ? "text-white/70" : "text-muted-foreground"
                                        )}>
                                            {language === 'de' ? 'Shopify scrapen' : 'Scrape Shopify'}
                                        </div>
                                    </div>
                                    {mode === 'store' && (
                                        <CheckCircle2 className="absolute top-2 right-2 w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Product Image Upload - only for form/free modes */}
                        {mode !== 'store' && (
                            <div className="rounded-2xl border-2 border-primary/30 bg-card/50 backdrop-blur-sm p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Image className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold">
                                        {language === 'de' ? 'Produktbild' : 'Product Image'}
                                    </h3>
                                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                        {language === 'de' ? '⭐ Empfohlen für beste Ergebnisse' : '⭐ Recommended for best results'}
                                    </span>
                                </div>

                                {productImagePreview ? (
                                    <div className="relative group">
                                        <img
                                            src={productImagePreview}
                                            alt="Product"
                                            className="w-full h-40 object-contain rounded-lg bg-muted/50"
                                        />
                                        <button
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/60 rounded-xl cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all">
                                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                        <span className="text-sm text-muted-foreground">
                                            {language === 'de' ? 'Bild hierher ziehen oder klicken' : 'Drag image here or click'}
                                        </span>
                                        <span className="text-xs text-muted-foreground/60 mt-1">PNG, JPG bis 5MB</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                    </label>
                                )}
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
                            <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-6">
                                <StoreImporter
                                    onProductsSelected={(products, copies) => {
                                        setImportedProducts(products);
                                        setImportedCopies(copies);
                                    }}
                                    onCreateSingleAds={(products, _copies) => {
                                        // TODO: Integrate with existing ad generation
                                        toast.success(`${products.length} Ads werden generiert...`);
                                    }}
                                    onCreateCarousel={(products, copies) => {
                                        setImportedProducts(products);
                                        setImportedCopies(copies);
                                        setShowCarouselBuilder(true);
                                    }}
                                />
                            </div>
                        ) : mode === 'store' && showCarouselBuilder ? (
                            <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="font-semibold text-foreground">Carousel Builder</h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowCarouselBuilder(false)}
                                    >
                                        ← Zurück
                                    </Button>
                                </div>
                                <CarouselBuilder
                                    products={importedProducts}
                                    copies={importedCopies}
                                    onSave={(_carousel) => {
                                        toast.success('Carousel gespeichert!');
                                    }}
                                    onExport={(_carousel) => {
                                        toast.success('Carousel exportiert!');
                                    }}
                                />
                            </div>
                        ) : null}
                    </div>

                    {/* Right Column - Preview */}
                    <div className="space-y-6">
                        {step === 'generating' ? (
                            <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-8">
                                <div className="flex flex-col items-center justify-center space-y-6 text-center min-h-[400px]">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                                        <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-red-600 rounded-full flex items-center justify-center">
                                            <Loader2 className="w-10 h-10 text-white animate-spin" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl">{t('generating', language)}</h3>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            {language === 'de'
                                                ? 'KI erstellt Ihre professionelle Werbeanzeige...'
                                                : 'AI is creating your professional ad...'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Sparkles className="w-4 h-4" />
                                        {language === 'de' ? 'Dauert ca. 10-15 Sekunden' : 'Takes about 10-15 seconds'}
                                    </div>
                                </div>
                            </div>
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
                                    {t('downloadButton', language)}
                                </Button>

                                <Button onClick={handleSaveToLibrary} variant="outline" className="flex-1 gap-2">
                                    <Save className="w-4 h-4" />
                                    {t('saveToLibraryButton', language)}
                                </Button>

                                <Button onClick={handleReset} variant="ghost" className="gap-2">
                                    <RefreshCw className="w-4 h-4" />
                                    {t('resetButton', language)}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
