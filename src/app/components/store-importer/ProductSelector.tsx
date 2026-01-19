// src/app/components/store-importer/ProductSelector.tsx
// Premium product grid selector with beautiful cards

import { memo, useState } from 'react';
import { Check, ImageIcon, Search, Layers } from 'lucide-react';
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
        <div className="space-y-5">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Produkte suchen..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    />
                </div>
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={selectAll}
                        className="px-4 py-2.5 text-sm font-medium bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
                    >
                        Top {maxSelection} auswählen
                    </button>
                    <button
                        onClick={clearSelection}
                        className="px-4 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-xl hover:bg-muted/80 transition-colors"
                    >
                        Zurücksetzen
                    </button>
                </div>
            </div>

            {/* Selection count */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Layers className="w-4 h-4" />
                <span>
                    <span className="font-semibold text-foreground">{selectedIds.size}</span> von {products.length} Produkten ausgewählt
                </span>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
                            className={`group relative rounded-2xl overflow-hidden transition-all duration-300 text-left ${isSelected
                                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-[0.98]'
                                    : 'hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10'
                                }`}
                        >
                            {/* Card container */}
                            <div className={`relative bg-card border-2 rounded-2xl overflow-hidden transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30'
                                }`}>
                                {/* Selection indicator */}
                                <div className={`absolute top-3 right-3 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected
                                        ? 'bg-primary text-primary-foreground scale-100'
                                        : 'bg-background/80 backdrop-blur-sm border-2 border-border text-muted-foreground scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100'
                                    }`}>
                                    <Check className={`w-4 h-4 transition-transform ${isSelected ? 'scale-100' : 'scale-0'}`} />
                                </div>

                                {/* Product Image */}
                                <div className="aspect-square bg-muted/30 relative overflow-hidden">
                                    {product.images[0]?.src ? (
                                        <img
                                            src={product.images[0].src}
                                            alt={product.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                                            <ImageIcon className="w-12 h-12 text-muted-foreground/20" />
                                        </div>
                                    )}

                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    {/* Discount badge */}
                                    {hasDiscount && (
                                        <Badge className="absolute bottom-3 left-3 bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 shadow-lg shadow-red-500/25">
                                            -{discountPercent}%
                                        </Badge>
                                    )}

                                    {/* Images count */}
                                    {product.images.length > 1 && (
                                        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs flex items-center gap-1">
                                            <ImageIcon className="w-3 h-3" />
                                            {product.images.length}
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                    <h4 className="font-semibold text-foreground text-sm line-clamp-2 mb-2 min-h-[40px] group-hover:text-primary transition-colors">
                                        {product.title}
                                    </h4>

                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-bold text-foreground">
                                            €{product.price}
                                        </span>
                                        {hasDiscount && (
                                            <span className="text-sm text-muted-foreground line-through">
                                                €{product.compareAtPrice}
                                            </span>
                                        )}
                                    </div>

                                    {product.productType && (
                                        <Badge variant="outline" className="mt-2 text-xs">
                                            {product.productType}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-16 rounded-2xl bg-muted/30 border-2 border-dashed border-border/50">
                    <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">Keine Produkte gefunden</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Versuche einen anderen Suchbegriff</p>
                </div>
            )}
        </div>
    );
});

export default ProductSelector;
