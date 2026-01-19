// src/app/components/store-importer/CarouselBuilder.tsx
// Carousel Ad Builder with drag-and-drop slides

import { memo, useState, useCallback } from 'react';
import {
    GripVertical,
    Plus,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    Check,
    Edit3,
    Image as ImageIcon
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import type { ScrapedProduct, ProductCopy, CarouselSlide, CarouselAd } from './types';

interface CarouselBuilderProps {
    products: ScrapedProduct[];
    copies: ProductCopy[];
    onSave?: (carousel: CarouselAd) => void;
    onExport?: (carousel: CarouselAd) => void;
}

export const CarouselBuilder = memo(function CarouselBuilder({
    products,
    copies,
    onSave,
    onExport
}: CarouselBuilderProps) {
    // Initialize slides from products
    const initialSlides: CarouselSlide[] = products.map((product, index) => {
        const copy = copies.find(c => c.productId === product.id);
        return {
            id: `slide-${product.id}`,
            productId: product.id,
            image: product.images[0]?.src || '',
            headline: copy?.headlines[0] || product.title,
            description: copy?.primaryText || product.description.slice(0, 100),
            cta: copy?.ctas[0] || 'Jetzt kaufen',
            price: `€${product.price}`
        };
    });

    const [slides, setSlides] = useState<CarouselSlide[]>(initialSlides);
    const [activeSlide, setActiveSlide] = useState(0);
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16' | '4:5'>('1:1');
    const [editingSlide, setEditingSlide] = useState<string | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const updateSlide = useCallback((slideId: string, updates: Partial<CarouselSlide>) => {
        setSlides(prev => prev.map(s =>
            s.id === slideId ? { ...s, ...updates } : s
        ));
    }, []);

    const removeSlide = useCallback((slideId: string) => {
        setSlides(prev => prev.filter(s => s.id !== slideId));
        if (activeSlide >= slides.length - 1) {
            setActiveSlide(Math.max(0, slides.length - 2));
        }
    }, [activeSlide, slides.length]);

    const moveSlide = useCallback((fromIndex: number, toIndex: number) => {
        setSlides(prev => {
            const newSlides = [...prev];
            const [removed] = newSlides.splice(fromIndex, 1);
            newSlides.splice(toIndex, 0, removed);
            return newSlides;
        });
    }, []);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index) {
            moveSlide(draggedIndex, index);
            setDraggedIndex(index);
        }
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const nextSlide = () => {
        setActiveSlide(prev => Math.min(prev + 1, slides.length - 1));
    };

    const prevSlide = () => {
        setActiveSlide(prev => Math.max(prev - 1, 0));
    };

    const handleSave = () => {
        const carousel: CarouselAd = {
            id: `carousel-${Date.now()}`,
            type: 'carousel',
            title: 'Carousel Ad',
            slides,
            aspectRatio,
            createdAt: new Date().toISOString()
        };
        onSave?.(carousel);
    };

    const handleExport = () => {
        const carousel: CarouselAd = {
            id: `carousel-${Date.now()}`,
            type: 'carousel',
            title: 'Carousel Ad',
            slides,
            aspectRatio,
            createdAt: new Date().toISOString()
        };
        onExport?.(carousel);
    };

    const getAspectRatioClass = () => {
        switch (aspectRatio) {
            case '9:16': return 'aspect-[9/16]';
            case '4:5': return 'aspect-[4/5]';
            default: return 'aspect-square';
        }
    };

    const currentSlide = slides[activeSlide];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview Panel */}
            <Card className="p-4 bg-card border-border">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Vorschau</h3>
                    <div className="flex gap-1">
                        {(['1:1', '4:5', '9:16'] as const).map((ratio) => (
                            <button
                                key={ratio}
                                onClick={() => setAspectRatio(ratio)}
                                className={`px-3 py-1 text-xs rounded-lg transition-colors ${aspectRatio === ratio
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {ratio}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Carousel Preview */}
                <div className="relative bg-muted rounded-xl overflow-hidden">
                    {currentSlide && (
                        <div className={`relative ${getAspectRatioClass()} max-h-[500px]`}>
                            {/* Image */}
                            {currentSlide.image ? (
                                <img
                                    src={currentSlide.image}
                                    alt={currentSlide.headline}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
                                </div>
                            )}

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                <Badge className="mb-2 bg-white/20 backdrop-blur-sm border-0">
                                    {currentSlide.price}
                                </Badge>
                                <h4 className="text-lg font-bold mb-1 line-clamp-2">
                                    {currentSlide.headline}
                                </h4>
                                <p className="text-sm text-white/80 line-clamp-2 mb-3">
                                    {currentSlide.description}
                                </p>
                                <div className="inline-block px-4 py-2 bg-white text-black rounded-lg text-sm font-medium">
                                    {currentSlide.cta}
                                </div>
                            </div>

                            {/* Slide Indicator */}
                            <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-white text-xs">
                                {activeSlide + 1} / {slides.length}
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    {slides.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                disabled={activeSlide === 0}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center disabled:opacity-30 shadow-lg"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextSlide}
                                disabled={activeSlide === slides.length - 1}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center disabled:opacity-30 shadow-lg"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>

                {/* Dots */}
                <div className="flex justify-center gap-1.5 mt-3">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveSlide(i)}
                            className={`w-2 h-2 rounded-full transition-colors ${i === activeSlide ? 'bg-primary' : 'bg-muted-foreground/30'
                                }`}
                        />
                    ))}
                </div>
            </Card>

            {/* Slides List */}
            <Card className="p-4 bg-card border-border">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">
                        Slides ({slides.length})
                    </h3>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            onClick={() => setActiveSlide(index)}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${index === activeSlide
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border bg-muted/30 hover:border-primary/30'
                                } ${draggedIndex === index ? 'opacity-50' : ''}`}
                        >
                            <div className="flex gap-3">
                                {/* Drag Handle */}
                                <div className="flex items-center text-muted-foreground cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-4 h-4" />
                                </div>

                                {/* Thumbnail */}
                                <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                                    {slide.image ? (
                                        <img
                                            src={slide.image}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {editingSlide === slide.id ? (
                                        <input
                                            type="text"
                                            value={slide.headline}
                                            onChange={(e) => updateSlide(slide.id, { headline: e.target.value })}
                                            onBlur={() => setEditingSlide(null)}
                                            autoFocus
                                            className="w-full px-2 py-1 text-sm bg-background border border-border rounded text-foreground"
                                        />
                                    ) : (
                                        <h4 className="font-medium text-foreground text-sm line-clamp-1">
                                            {slide.headline}
                                        </h4>
                                    )}
                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                        {slide.price} · {slide.cta}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingSlide(slide.id);
                                        }}
                                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    {slides.length > 2 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeSlide(slide.id);
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-border flex gap-2">
                    <Button
                        onClick={handleSave}
                        className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                    >
                        <Check className="w-4 h-4" />
                        Speichern
                    </Button>
                    <Button
                        onClick={handleExport}
                        variant="outline"
                        className="gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                </div>
            </Card>
        </div>
    );
});

export default CarouselBuilder;
