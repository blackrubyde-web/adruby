// src/app/components/store-importer/StoreImporter.tsx
// Main component for importing products from Shopify stores

import { memo, useState, useCallback } from 'react';
import {
    Store,
    Loader2,
    Search,
    Package,
    Wand2,
    ArrowRight,
    AlertCircle,
    Check,
    Image as ImageIcon,
    LayoutGrid,
    Sparkles
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
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

        // Validate URL
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
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground">
                        Store Import
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Shopify Store scrapen und automatisch Ads erstellen
                    </p>
                </div>
            </div>

            {/* Step: URL Input */}
            {step === 'input' && (
                <Card className="p-6 bg-card border-border">
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-sm font-medium text-foreground mb-2 block">
                                Shopify Store URL
                            </span>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="url"
                                        value={storeUrl}
                                        onChange={(e) => setStoreUrl(e.target.value)}
                                        placeholder="z.B. https://example-store.myshopify.com"
                                        className="w-full pl-11 pr-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                                    />
                                </div>
                                <Button
                                    onClick={handleScrape}
                                    className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90"
                                >
                                    <Search className="w-4 h-4" />
                                    Scannen
                                </Button>
                            </div>
                        </label>

                        {error && (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="p-4 rounded-xl bg-muted/50">
                            <h4 className="font-medium text-foreground mb-2">Unterstützte Stores:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    Alle Shopify Stores
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    Custom Domains (z.B. mybrand.com)
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    .myshopify.com Subdomains
                                </li>
                            </ul>
                        </div>
                    </div>
                </Card>
            )}

            {/* Step: Loading */}
            {step === 'loading' && (
                <Card className="p-12 bg-card border-border">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-4 animate-pulse">
                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            Store wird gescannt...
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Produkte, Bilder und Preise werden extrahiert
                        </p>
                    </div>
                </Card>
            )}

            {/* Step: Product Selection */}
            {step === 'select' && storeInfo && (
                <div className="space-y-4">
                    {/* Store Info */}
                    <Card className="p-4 bg-card border-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <Store className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">{storeInfo.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {products.length} Produkte gefunden
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={reset}>
                                Anderen Store
                            </Button>
                        </div>
                    </Card>

                    {/* Product Selector */}
                    <Card className="p-4 bg-card border-border">
                        <ProductSelector
                            products={products}
                            selectedIds={selectedIds}
                            onSelectionChange={setSelectedIds}
                            maxSelection={10}
                        />
                    </Card>

                    {/* Action Button */}
                    <div className="flex justify-end">
                        <Button
                            onClick={handleGenerateCopy}
                            disabled={selectedIds.size === 0}
                            className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90"
                        >
                            <Wand2 className="w-4 h-4" />
                            Copy für {selectedIds.size} Produkte generieren
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Step: Generating Copy */}
            {step === 'generating' && (
                <Card className="p-12 bg-card border-border">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-4 animate-pulse">
                            <Sparkles className="w-8 h-8 text-violet-500 animate-spin" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            AI generiert Ad-Copy...
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Hooks, Headlines und CTAs werden erstellt
                        </p>
                    </div>
                </Card>
            )}

            {/* Step: Ready - Choose Action */}
            {step === 'ready' && (
                <div className="space-y-4">
                    {/* Success Message */}
                    <Card className="p-4 bg-emerald-500/10 border-emerald-500/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                                <Check className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">
                                    Bereit für Ad-Erstellung!
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {copies.length} Produkte mit AI-generierter Copy
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={handleCreateSingleAds}
                            className="p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <ImageIcon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-1">
                                Einzelne Ads erstellen
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Ein Ad pro Produkt mit verschiedenen Templates
                            </p>
                        </button>

                        <button
                            onClick={handleCreateCarousel}
                            className="p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <LayoutGrid className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-1">
                                Carousel Ad erstellen
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Mehrere Produkte in einem swipebaren Carousel
                            </p>
                        </button>
                    </div>

                    {/* Reset */}
                    <div className="text-center">
                        <button
                            onClick={reset}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            ← Zurück zum Start
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

export default StoreImporter;
