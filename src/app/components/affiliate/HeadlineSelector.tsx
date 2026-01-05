import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import type { HeadlineVariant } from '../../lib/api/ai-headline-generator';

interface HeadlineSelectorProps {
    variants: HeadlineVariant[];
    isOpen: boolean;
    onClose: () => void;
    onSelect: (variant: HeadlineVariant) => void;
    isGenerating?: boolean;
}

export function HeadlineSelector({ variants, isOpen, onClose, onSelect, isGenerating }: HeadlineSelectorProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
            }
        };
    }, []);

    if (!isOpen) return null;

    const handleSelect = (variant: HeadlineVariant) => {
        setSelectedId(variant.id);

        // Clear any existing timeout
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
        }

        timeoutIdRef.current = setTimeout(() => {
            onSelect(variant);
            onClose();
            timeoutIdRef.current = null;
        }, 300);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-5xl bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden ring-1 ring-white/5 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                {/* Header */}
                <div className="relative p-6 md:p-8 border-b border-border/30 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-purple-500/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/30">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
                                    AI Magic Headlines
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Wähle deine perfekte Headline mit Design
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto">
                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="relative w-20 h-20 mb-6">
                                <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"></div>
                                <div className="absolute inset-0 rounded-full border-t-4 border-violet-500 animate-spin"></div>
                                <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-violet-500 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">AI zaubert Headlines...</h3>
                            <p className="text-sm text-muted-foreground">
                                Gleich hast du krasse, conversion-optimierte Headlines
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {variants.map((variant) => {
                                const isSelected = selectedId === variant.id;
                                const isHovered = hoveredId === variant.id;
                                const { design } = variant;

                                return (
                                    <button
                                        key={variant.id}
                                        onClick={() => handleSelect(variant)}
                                        onMouseEnter={() => setHoveredId(variant.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        className={`
                                            relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
                                            ${isSelected
                                                ? 'border-violet-500 bg-violet-500/10 shadow-xl shadow-violet-500/25 scale-[1.02]'
                                                : isHovered
                                                    ? 'border-violet-500/50 bg-violet-500/5 shadow-lg scale-[1.01]'
                                                    : 'border-border/50 bg-muted/20 hover:border-violet-500/30'
                                            }
                                        `}
                                    >
                                        {/* Selection Indicator */}
                                        {isSelected && (
                                            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                                                <Check className="w-5 h-5 text-white" />
                                            </div>
                                        )}

                                        {/* Style Badge */}
                                        <div className="mb-4">
                                            <span className={`
                                                inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                                                ${variant.style === 'bold' ? 'bg-red-500/10 text-red-500' :
                                                    variant.style === 'elegant' ? 'bg-purple-500/10 text-purple-500' :
                                                        variant.style === 'modern' ? 'bg-blue-500/10 text-blue-500' :
                                                            variant.style === 'playful' ? 'bg-orange-500/10 text-orange-500' :
                                                                'bg-gray-500/10 text-gray-500'
                                                }
                                            `}>
                                                {variant.style.charAt(0).toUpperCase() + variant.style.slice(1)}
                                            </span>
                                        </div>

                                        {/* Headline Preview */}
                                        <div className="mb-4">
                                            <div
                                                className="mb-2 leading-tight"
                                                style={{
                                                    fontSize: `${Math.min(design.fontSize / 2, 28)}px`,
                                                    fontWeight: design.fontWeight,
                                                    letterSpacing: `${design.letterSpacing}px`,
                                                    textTransform: design.textTransform,
                                                    background: design.gradient
                                                        ? `linear-gradient(135deg, ${design.gradient.from}, ${design.gradient.to})`
                                                        : design.accentColor,
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    backgroundClip: 'text',
                                                    filter: design.shadow ? `drop-shadow(0 0 ${design.shadow.blur}px ${design.shadow.color})` : 'none'
                                                }}
                                            >
                                                {variant.headline}
                                            </div>
                                            {variant.subheadline && (
                                                <p className="text-sm text-muted-foreground">
                                                    {variant.subheadline}
                                                </p>
                                            )}
                                        </div>

                                        {/* Design Preview */}
                                        <div className="space-y-3 pt-4 border-t border-border/30">
                                            {/* Color Palette */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                    Farben
                                                </span>
                                                <div className="flex gap-1.5">
                                                    <div
                                                        className="w-6 h-6 rounded-lg border border-border/50 shadow-sm"
                                                        style={{ backgroundColor: design.primaryColor }}
                                                        title={design.primaryColor}
                                                    />
                                                    {design.gradient ? (
                                                        <div
                                                            className="w-6 h-6 rounded-lg border border-border/50 shadow-sm"
                                                            style={{
                                                                background: `linear-gradient(135deg, ${design.gradient.from}, ${design.gradient.to})`
                                                            }}
                                                            title="Gradient"
                                                        />
                                                    ) : (
                                                        <div
                                                            className="w-6 h-6 rounded-lg border border-border/50 shadow-sm"
                                                            style={{ backgroundColor: design.accentColor }}
                                                            title={design.accentColor}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Typography */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                    Schrift
                                                </span>
                                                <span className="text-xs text-foreground/70">
                                                    {design.fontWeight} • {design.fontSize}px • {design.letterSpacing > 0 ? '+' : ''}{design.letterSpacing}
                                                </span>
                                            </div>

                                            {/* Emotion & Focus */}
                                            <div className="pt-2 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-violet-500">💜</span>
                                                    <span className="text-xs text-muted-foreground">{variant.emotion}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-fuchsia-500">🎯</span>
                                                    <span className="text-xs text-muted-foreground">{variant.conversionFocus}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isGenerating && (
                    <div className="p-6 border-t border-border/30 bg-muted/20">
                        <p className="text-xs text-center text-muted-foreground">
                            💡 Tipp: Jede Headline kommt mit perfekt abgestimmten Design-Parametern
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
