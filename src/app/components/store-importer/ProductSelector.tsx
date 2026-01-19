// src/app/components/store-importer/ProductSelector.tsx
// Grid view for selecting scraped products

import { memo, useState } from 'react';
import { Check, ImageIcon, Star, Tag } from 'lucide-react';
import { Badge } from '../ui/badge';
import type { ScrapedProduct } from './types';

interface ProductSelectorProps {
    products: ScrapedProduct[];
    selectedIds: Set<string>;
    onSelectionChange: (ids: Set<string>) => void;
    maxSelection?: number;
}

export const ProductSelector = memo(function ProductSelector({
    products,
    selectedIds,
    onSelectionChange,
    maxSelection = 10
}: ProductSelectorProps) {
    const [filter, setFilter] = useState('');

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(filter.toLowerCase()) ||
        p.productType?.toLowerCase().includes(filter.toLowerCase())
    );

    const toggleProduct = (id: string) => {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else if (newSelection.size < maxSelection) {
            newSelection.add(id);
        }
        onSelectionChange(newSelection);
    };

    const selectAll = () => {
        const newSelection = new Set(
            filteredProducts.slice(0, maxSelection).map(p => p.id)
        );
        onSelectionChange(newSelection);
    };

    const clearSelection = () => {
        onSelectionChange(new Set());
    };

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <input
                    type="text"
                    placeholder="Produkte suchen..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 flex-1 max-w-md"
                />
                <div className="flex gap-2">
                    <button
                        onClick={selectAll}
                        className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                    >
                        Alle auswählen (max {maxSelection})
                    </button>
                    <button
                        onClick={clearSelection}
                        className="px-3 py-1.5 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                    >
                        Auswahl löschen
                    </button>
                </div>
            </div>

            {/* Selection count */}
            <div className="text-sm text-muted-foreground">
                {selectedIds.size} von {products.length} Produkten ausgewählt
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredProducts.map((product) => {
                    const isSelected = selectedIds.has(product.id);
                    const hasDiscount = product.compareAtPrice &&
                        parseFloat(product.compareAtPrice) > parseFloat(product.price);
                    const discountPercent = hasDiscount
                        ? Math.round((1 - parseFloat(product.price) / parseFloat(product.compareAtPrice!)) * 100)
                        : 0;

                    return (
                        <button
                            key={product.id}
                            onClick={() => toggleProduct(product.id)}
                            className={`relative group rounded-xl border-2 overflow-hidden transition-all text-left ${isSelected
                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                    : 'border-border bg-card hover:border-primary/30'
                                }`}
                        >
                            {/* Selection indicator */}
                            <div className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background/80 border border-border text-muted-foreground group-hover:border-primary/50'
                                }`}>
                                {isSelected && <Check className="w-4 h-4" />}
                            </div>

                            {/* Product Image */}
                            <div className="aspect-square bg-muted relative overflow-hidden">
                                {product.images[0]?.src ? (
                                    <img
                                        src={product.images[0].src}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                                    </div>
                                )}

                                {/* Discount badge */}
                                {hasDiscount && (
                                    <Badge className="absolute bottom-2 left-2 bg-red-500 text-white border-0">
                                        -{discountPercent}%
                                    </Badge>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-3">
                                <h4 className="font-medium text-foreground text-sm line-clamp-2 mb-1">
                                    {product.title}
                                </h4>

                                <div className="flex items-center gap-2 text-xs mb-2">
                                    <span className="font-semibold text-foreground">
                                        €{product.price}
                                    </span>
                                    {hasDiscount && (
                                        <span className="text-muted-foreground line-through">
                                            €{product.compareAtPrice}
                                        </span>
                                    )}
                                </div>

                                {/* Images count */}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <ImageIcon className="w-3 h-3" />
                                    <span>{product.images.length} Bilder</span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    Keine Produkte gefunden
                </div>
            )}
        </div>
    );
});

export default ProductSelector;
