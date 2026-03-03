/**
 * AI Ad Builder – Preview Area (Visual Overhaul V4)
 * Rich empty state with orbit animation, dark canvas-aware styling,
 * floating Meta mockup, score rings with context, premium hook callout.
 */

import { useState } from 'react';
import {
    AlertCircle, Globe, MoreHorizontal, ThumbsUp,
    MessageCircle, Share2, ChevronLeft, ChevronRight,
    Sparkles, Wand2, Layers
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import type { PreviewAreaProps, AdVariant, AdGenerationResult } from '../../types/aibuilder';

/* ── SVG Score Ring ─────────────────────────────────── */
function ScoreRing({ value, max, label, color, delay = 0 }: { value: number; max: number; label: string; color: string; delay?: number }) {
    const size = 72;
    const stroke = 4;
    const r = (size - stroke) / 2;
    const circumference = 2 * Math.PI * r;
    const pct = Math.min(value / max, 1);
    const offset = circumference * (1 - pct);

    return (
        <div className="flex flex-col items-center gap-1.5 stagger-in" style={{ animationDelay: `${delay}ms` }}>
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted/15" />
                    <circle
                        cx={size / 2} cy={size / 2} r={r} fill="none"
                        stroke={color} strokeWidth={stroke}
                        strokeDasharray={circumference} strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold tabular-nums">{value}<span className="text-[9px] text-muted-foreground/50">/{max}</span></span>
                </div>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
        </div>
    );
}

function getDisplayData(result: AdGenerationResult, variantIndex: number = 0) {
    if (result.variants && result.variants.length > variantIndex) {
        return result.variants[variantIndex];
    }
    return {
        id: result.id || '0',
        headline: result.headline,
        slogan: result.slogan,
        description: result.description,
        cta: result.cta,
        hook: result.description?.split('.')[0] || '',
        imageUrl: result.imageUrl,
        imagePrompt: result.imagePrompt,
        template: result.template,
        qualityScore: result.qualityScore,
        engagementScore: result.engagementScore,
    } as AdVariant;
}

export function PreviewArea({
    language,
    result,
    loading,
    error,
    selectedVariantIndex = 0,
    onSelectVariant
}: PreviewAreaProps) {
    const [localVariantIndex, setLocalVariantIndex] = useState(0);
    const currentIndex = onSelectVariant ? selectedVariantIndex : localVariantIndex;
    const setCurrentIndex = onSelectVariant || setLocalVariantIndex;

    const variantCount = result?.variants?.length || 1;
    const displayData = result ? getDisplayData(result, currentIndex) : null;

    const nextVariant = () => setCurrentIndex((currentIndex + 1) % variantCount);
    const prevVariant = () => setCurrentIndex((currentIndex - 1 + variantCount) % variantCount);

    /* ── Error ─────── */
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 text-center min-h-[400px]">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-destructive" />
                </div>
                <div>
                    <h3 className="font-semibold text-base text-destructive">Fehler bei der Generierung</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-[300px]">{error}</p>
                </div>
            </div>
        );
    }

    /* ── Empty State — Rich visual inside canvas ── */
    if (!result || !displayData) {
        return (
            <div className="flex flex-col items-center justify-center text-center min-h-[400px] py-12">
                {/* Animated orbit icon */}
                <div className="relative w-28 h-28 mb-8">
                    {/* Glow */}
                    <div className="absolute inset-2 bg-gradient-to-br from-primary/10 to-violet-500/10 rounded-full blur-xl empty-state-glow" />

                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/20 flex items-center justify-center shadow-inner">
                            <Layers className="w-7 h-7 text-muted-foreground/30" />
                        </div>
                    </div>

                    {/* Orbiting dots */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="orbit-dot bg-primary/40" />
                        <div className="orbit-dot bg-violet-500/40" />
                        <div className="orbit-dot bg-orange-500/40" />
                    </div>
                </div>

                <h3 className="font-semibold text-lg text-foreground/80">Deine Ad-Vorschau</h3>
                <p className="text-sm text-muted-foreground/60 mt-2 max-w-[280px] leading-relaxed">
                    Fülle das Formular links aus und generiere deine erste Ad — das Ergebnis erscheint hier als Meta-Vorschau.
                </p>

                {/* Feature chips */}
                <div className="flex items-center gap-3 mt-8">
                    {[
                        { icon: '📱', label: 'Meta-Vorschau' },
                        { icon: '📊', label: 'Score-Analyse' },
                        { icon: '🎯', label: '3 Varianten' },
                    ].map((feat, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/20 border border-border/15 text-[11px] text-muted-foreground/60"
                        >
                            <span>{feat.icon}</span>
                            {feat.label}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    /* ── Result ────── */
    return (
        <div className="space-y-5">
            {/* Variant Selector */}
            {variantCount > 1 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-semibold">Variante wählen</h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={prevVariant} className="p-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] text-muted-foreground tabular-nums px-1.5">
                                {currentIndex + 1}/{variantCount}
                            </span>
                            <button onClick={nextVariant} className="p-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Variant cards */}
                    {result.variants && (
                        <div className="grid grid-cols-3 gap-2">
                            {result.variants.map((variant, index) => (
                                <button
                                    key={variant.id}
                                    onClick={() => setCurrentIndex(index)}
                                    className={cn(
                                        "relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all duration-300 border cursor-pointer",
                                        index === currentIndex
                                            ? "bg-gradient-to-br from-primary/10 to-red-500/5 text-foreground border-primary/30 shadow-lg shadow-primary/5 scale-[1.02]"
                                            : "bg-muted/10 text-muted-foreground border-border/15 hover:border-border/30 hover:bg-muted/20"
                                    )}
                                >
                                    {index === currentIndex && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-gradient-to-r from-primary to-red-500" />
                                    )}
                                    <span className="text-[10px] truncate max-w-[100px]">
                                        {variant.headline ? variant.headline.substring(0, 30) : `Variante ${index + 1}`}
                                    </span>
                                    {variant.qualityScore && (
                                        <Badge className={cn(
                                            "text-[9px] px-1.5 py-0 h-4",
                                            variant.qualityScore >= 8 ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20" :
                                                variant.qualityScore >= 6 ? "bg-amber-500/15 text-amber-600 border-amber-500/20" : "bg-muted/30"
                                        )}>
                                            {variant.qualityScore}/10
                                        </Badge>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Meta Ad Mockup ─────────────────────────── */}
            <div className="max-w-md mx-auto">
                <div className="bg-[#1a1a1b] rounded-xl overflow-hidden shadow-2xl shadow-black/30 border border-white/[0.06] ring-1 ring-white/[0.03] meta-mockup-float stagger-in"
                    style={{ animationDelay: '100ms' }}
                >
                    {/* Header */}
                    <div className="p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-primary/20">
                                {(displayData.headline || 'DB').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <div className="font-semibold text-[13px] text-white leading-tight">
                                    {displayData.headline ? displayData.headline.substring(0, 25) : 'Dein Business'}
                                </div>
                                <div className="text-[11px] text-gray-500 flex items-center gap-1">
                                    Gesponsert · <Globe className="w-2.5 h-2.5" />
                                </div>
                            </div>
                        </div>
                        <button className="text-gray-600 hover:text-gray-400 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Primary Text */}
                    <div className="px-3.5 pb-2.5">
                        <p className="text-[13px] text-white/85 whitespace-pre-wrap leading-relaxed">
                            {displayData.hook || displayData.description}
                        </p>
                    </div>

                    {/* Image */}
                    {displayData.imageUrl && (
                        <div className="relative aspect-square w-full bg-black/50">
                            <img src={displayData.imageUrl} alt="Ad Creative" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex flex-col justify-end pointer-events-none">
                                <div className="bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 pt-16">
                                    <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">
                                        {displayData.headline}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer CTA */}
                    <div className="bg-[#2a2a2b] px-3.5 py-3 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide truncate">{displayData.slogan}</p>
                            <h4 className="font-semibold text-white text-sm truncate leading-tight mt-0.5">{displayData.headline}</h4>
                        </div>
                        <button className="shrink-0 bg-white/10 hover:bg-white/15 text-white font-semibold py-1.5 px-3.5 rounded-md text-xs transition-colors border border-white/10 whitespace-nowrap">
                            {displayData.cta}
                        </button>
                    </div>

                    {/* Engagement Bar */}
                    <div className="px-3.5 py-2.5 border-t border-white/5 flex items-center text-gray-500 text-xs">
                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-1 hover:text-white transition-colors">
                                <ThumbsUp className="w-3.5 h-3.5" /> Gefällt mir
                            </button>
                            <button className="flex items-center gap-1 hover:text-white transition-colors">
                                <MessageCircle className="w-3.5 h-3.5" /> Kommentieren
                            </button>
                            <button className="flex items-center gap-1 hover:text-white transition-colors">
                                <Share2 className="w-3.5 h-3.5" /> Teilen
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Score Rings ─────────────────────────────── */}
            {(displayData.qualityScore || displayData.engagementScore) && (
                <div className="flex justify-center gap-10 pt-2">
                    {displayData.qualityScore && (
                        <div className="flex flex-col items-center gap-0.5">
                            <ScoreRing value={displayData.qualityScore} max={10} label="Qualität" color="hsl(var(--primary))" delay={200} />
                            <span className="text-[10px] text-muted-foreground/50 mt-0.5">
                                {displayData.qualityScore >= 9 ? 'Exzellent' :
                                    displayData.qualityScore >= 7 ? 'Überdurchschnittlich' :
                                        displayData.qualityScore >= 5 ? 'Durchschnitt' : 'Ausbaufähig'}
                            </span>
                        </div>
                    )}
                    {displayData.engagementScore && (
                        <div className="flex flex-col items-center gap-0.5">
                            <ScoreRing value={displayData.engagementScore} max={100} label="Engagement" color="#10b981" delay={500} />
                            <span className="text-[10px] text-muted-foreground/50 mt-0.5">
                                {displayData.engagementScore >= 80 ? 'Top 10%' :
                                    displayData.engagementScore >= 60 ? 'Top 30%' :
                                        displayData.engagementScore >= 40 ? 'Durchschnitt' : 'Unter Durchschnitt'}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* ── Hook Callout ────────────────────────────── */}
            {displayData.hook && displayData.hook !== displayData.description && (
                <div className="max-w-md mx-auto stagger-in" style={{ animationDelay: '600ms' }}>
                    <div className="relative p-4 rounded-xl bg-muted/10 border border-border/15 overflow-hidden">
                        <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />
                        <div className="pl-4">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-500 mb-2">
                                <Wand2 className="w-3.5 h-3.5" />
                                Hook dieser Variante
                            </div>
                            <p className="text-sm text-foreground/70 italic leading-relaxed">
                                <span className="text-violet-400/50 text-lg leading-none mr-0.5">„</span>
                                {displayData.hook}
                                <span className="text-violet-400/50 text-lg leading-none ml-0.5">‟</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
