// src/app/components/store-importer/StoreImporter.tsx
// Premium Store Importer with beautiful UI

import { memo, useState, useCallback } from 'react';
import {
    Store,
    Loader2,
    Search,
    Wand2,
    ArrowRight,
    AlertCircle,
    Check,
    Image as ImageIcon,
    LayoutGrid,
    Sparkles,
    ShoppingBag,
    Zap,
    TrendingUp,
    Star
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { ProductSelector } from './ProductSelector';
import type { ScrapedProduct, StoreInfo, ProductCopy } from './types';

interface StoreImporterProps {
    onProductsSelected?: (products: ScrapedProduct[], copies: ProductCopy[]) => void;
    onCreateSingleAds?: (products: ScrapedProduct[], copies: ProductCopy[]) => void;
    onCreateCarousel?: (products: ScrapedProduct[], copies: ProductCopy[]) => void;
}

type ImporterStep = 'input' | 'loading' | 'select' | 'generating' | 'ready';

export const StoreImporter = memo(function StoreImporter({
    onProductsSelected,
    onCreateSingleAds,
    onCreateCarousel
}: StoreImporterProps) {
    const [step, setStep] = useState<ImporterStep>('input');
    const [storeUrl, setStoreUrl] = useState('');
    const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
    const [products, setProducts] = useState<ScrapedProduct[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [copies, setCopies] = useState<ProductCopy[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleScrape = useCallback(async () => {
        if (!storeUrl.trim()) {
            toast.error('Bitte gib eine Store-URL ein');
            return;
        }

        let url = storeUrl.trim();
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }

        setStep('loading');
        setError(null);

        try {
            const response = await fetch('/api/shopify-scraper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeUrl: url, maxProducts: 100 })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Scraping fehlgeschlagen');
            }

            setStoreInfo(data.store);
            setProducts(data.products);
            setSelectedIds(new Set(data.products.slice(0, 5).map((p: ScrapedProduct) => p.id)));
            setStep('select');

            toast.success(`${data.products.length} Produkte von ${data.store.name} geladen!`);
        } catch (err) {
            console.error('[StoreImporter] Scrape error:', err);
            setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
            setStep('input');
            toast.error('Store konnte nicht gescrapt werden');
        }
    }, [storeUrl]);

    const handleGenerateCopy = useCallback(async () => {
        const selectedProducts = products.filter(p => selectedIds.has(p.id));

        if (selectedProducts.length === 0) {
            toast.error('Bitte wähle mindestens ein Produkt aus');
            return;
        }

        setStep('generating');

        try {
            const response = await fetch('/api/ai-product-copy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products: selectedProducts, mode: 'batch' })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Copy-Generierung fehlgeschlagen');
            }

            setCopies(data.copies);
            setStep('ready');

            toast.success(`Copy für ${selectedProducts.length} Produkte generiert!`);

            if (onProductsSelected) {
                onProductsSelected(selectedProducts, data.copies);
            }
        } catch (err) {
            console.error('[StoreImporter] Copy generation error:', err);
            setStep('select');
            toast.error('Copy konnte nicht generiert werden');
        }
    }, [products, selectedIds, onProductsSelected]);

    const handleCreateSingleAds = () => {
        const selectedProducts = products.filter(p => selectedIds.has(p.id));
        if (onCreateSingleAds) {
            onCreateSingleAds(selectedProducts, copies);
        }
    };

    const handleCreateCarousel = () => {
        const selectedProducts = products.filter(p => selectedIds.has(p.id));
        if (onCreateCarousel) {
            onCreateCarousel(selectedProducts, copies);
        }
    };

    const reset = () => {
        setStep('input');
        setStoreUrl('');
        setStoreInfo(null);
        setProducts([]);
        setSelectedIds(new Set());
        setCopies([]);
        setError(null);
    };

    return (
        <div className="space-y-6">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 p-6 border border-emerald-500/20">
                {/* Animated background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div className="relative flex items-center gap-5">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition" />
                        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                            <ShoppingBag className="w-7 h-7 text-white" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">
                                Shopify Store Import
                            </h2>
                            <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                                NEU
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            Scrape jeden Shopify Store und erstelle automatisch Ads
                        </p>
                    </div>
                </div>
            </div>

            {/* Step: URL Input */}
            {step === 'input' && (
                <div className="space-y-6">
                    {/* Main Input Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-8">
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-medium text-foreground mb-3 block">
                                    Shopify Store URL eingeben
                                </label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1 group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                        <div className="relative">
                                            <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                                            <input
                                                type="url"
                                                value={storeUrl}
                                                onChange={(e) => setStoreUrl(e.target.value)}
                                                placeholder="example-store.myshopify.com oder example.com"
                                                className="w-full pl-12 pr-4 py-4 bg-muted/50 border-2 border-border/50 rounded-xl text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:bg-background transition-all"
                                                onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleScrape}
                                        size="lg"
                                        className="px-8 gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 text-white font-semibold"
                                    >
                                        <Search className="w-5 h-5" />
                                        Store scannen
                                    </Button>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <span className="text-red-600 dark:text-red-400">{error}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { icon: Zap, title: 'Blitzschnell', desc: 'Bis zu 100 Produkte in Sekunden', color: 'amber' },
                            { icon: Sparkles, title: 'AI-Powered', desc: 'Automatische Hooks & Headlines', color: 'violet' },
                            { icon: TrendingUp, title: 'Conversion-Ready', desc: 'Optimiert für Facebook & Instagram', color: 'emerald' },
                        ].map((feature) => {
                            const Icon = feature.icon;
                            const colors = {
                                amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
                                violet: 'from-violet-500/10 to-fuchsia-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400',
                                emerald: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
                            }[feature.color];

                            return (
                                <div key={feature.title} className={`p-5 rounded-xl bg-gradient-to-br ${colors} border backdrop-blur-sm`}>
                                    <Icon className="w-6 h-6 mb-3" />
                                    <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Step: Loading */}
            {step === 'loading' && (
                <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-16">
                    {/* Animated rings */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="absolute w-64 h-64 rounded-full border border-emerald-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                        <div className="absolute w-48 h-48 rounded-full border border-teal-500/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                        <div className="absolute w-32 h-32 rounded-full border border-cyan-500/40 animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />
                    </div>

                    <div className="relative flex flex-col items-center justify-center text-center">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-xl opacity-50 animate-pulse" />
                            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl">
                                <Loader2 className="w-10 h-10 text-white animate-spin" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">
                            Store wird analysiert...
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Produkte, Preise und Bilder werden extrahiert
                        </p>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-sm text-muted-foreground">Dies dauert ca. 5-10 Sekunden</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Step: Product Selection */}
            {step === 'select' && storeInfo && (
                <div className="space-y-5">
                    {/* Store Info Card */}
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                <Store className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">{storeInfo.name}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    {products.length} Produkte erfolgreich geladen
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={reset} className="gap-2">
                            <Store className="w-4 h-4" />
                            Anderen Store
                        </Button>
                    </div>

                    {/* Product Selection */}
                    <div className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Produkte auswählen</h3>
                                <p className="text-sm text-muted-foreground">Wähle die Produkte für deine Ads (max. 10)</p>
                            </div>
                            <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                                {selectedIds.size} ausgewählt
                            </Badge>
                        </div>
                        <ProductSelector
                            products={products}
                            selectedIds={selectedIds}
                            onSelectionChange={setSelectedIds}
                            maxSelection={10}
                        />
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-center">
                        <Button
                            onClick={handleGenerateCopy}
                            disabled={selectedIds.size === 0}
                            size="lg"
                            className="px-8 gap-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 shadow-lg shadow-violet-500/25 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Wand2 className="w-5 h-5" />
                            AI-Copy für {selectedIds.size} Produkte generieren
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Step: Generating Copy */}
            {step === 'generating' && (
                <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-16">
                    {/* Magic particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-violet-500/50 rounded-full animate-ping"
                                style={{
                                    top: `${20 + Math.random() * 60}%`,
                                    left: `${10 + Math.random() * 80}%`,
                                    animationDuration: `${1 + Math.random() * 2}s`,
                                    animationDelay: `${Math.random() * 2}s`
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative flex flex-col items-center justify-center text-center">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-xl opacity-50 animate-pulse" />
                            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-xl">
                                <Sparkles className="w-10 h-10 text-white animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">
                            AI generiert überzeugende Copy...
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Hooks, Headlines und CTAs werden erstellt
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {['Hooks', 'Headlines', 'CTAs', 'Descriptions'].map((item, i) => (
                                <Badge key={item} variant="outline" className="animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
                                    {item}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Step: Ready - Choose Action */}
            {step === 'ready' && (
                <div className="space-y-5">
                    {/* Success Banner */}
                    <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-teal-500/20 border border-emerald-500/30">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />
                        <div className="relative flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <Check className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    Perfekt! Alles bereit
                                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                </h3>
                                <p className="text-muted-foreground">
                                    {copies.length} Produkte mit AI-generierter Copy erstellt
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <button
                            onClick={handleCreateSingleAds}
                            className="group relative overflow-hidden p-8 rounded-2xl border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 hover:border-blue-500/50 hover:from-blue-500/10 hover:to-cyan-500/10 transition-all duration-300 text-left"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-5 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                                    <ImageIcon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    Einzelne Ads erstellen
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Pro Produkt ein individuelles Ad mit verschiedenen Template-Designs
                                </p>
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                                    <span>Jetzt erstellen</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={handleCreateCarousel}
                            className="group relative overflow-hidden p-8 rounded-2xl border-2 border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 hover:border-violet-500/50 hover:from-violet-500/10 hover:to-fuchsia-500/10 transition-all duration-300 text-left"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-5 shadow-lg shadow-violet-500/25 group-hover:scale-110 transition-transform duration-300">
                                    <LayoutGrid className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    Carousel Ad erstellen
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Alle Produkte in einem swipebaren Carousel für maximale Engagement
                                </p>
                                <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-medium">
                                    <span>Carousel bauen</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Reset Link */}
                    <div className="text-center pt-2">
                        <button
                            onClick={reset}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                        >
                            ← Anderen Store scannen
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

export default StoreImporter;
