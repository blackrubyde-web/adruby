/**
 * AI Ad Builder – Preview Area (Premium V3)
 * Floating Meta mockup with mount animation, enhanced variant selector,
 * SVG score rings with stagger, premium hook callout.
 */

import { useState } from 'react';
import {
    Loader2, AlertCircle, Globe, MoreHorizontal, ThumbsUp,
    MessageCircle, Share2, Check, ChevronLeft, ChevronRight,
    Sparkles, Wand2
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import type { PreviewAreaProps, AdVariant, AdGenerationResult } from '../../types/aibuilder';

/* ── SVG Score Ring ─────────────────────────────────── */
function ScoreRing({ value, max, label, color, delay = 0 }: { value: number; max: number; label: string; color: string; delay?: number }) {
    const size = 76;
    const stroke = 5;
    const r = (size - stroke) / 2;
    const circumference = 2 * Math.PI * r;
    const pct = Math.min(value / max, 1);
    const offset = circumference * (1 - pct);

    return (
        <div className="flex flex-col items-center gap-1.5 stagger-in" style={{ animationDelay: `${delay}ms` }}>
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted/20" />
                    <circle
                        cx={size / 2} cy={size / 2} r={r} fill="none"
                        stroke={color} strokeWidth={stroke}
                        strokeDasharray={circumference} strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                        style={{
                            animation: `ring-draw 1.2s ease-out ${delay}ms forwards`,
                        }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-base font-bold tabular-nums">{value}<span className="text-[10px] text-muted-foreground/60">/{max}</span></span>
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

    /* ── Loading ────── */
    if (loading) {
        return (
            <div className="rounded-xl border border-border/40 bg-card/80 backdrop-blur p-8">
                <div className="flex flex-col items-center justify-center space-y-6 text-center min-h-[400px]">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">KI erstellt 3 Varianten…</h3>
                        <p className="text-sm text-muted-foreground mt-1.5">Dauert ca. 10–15 Sekunden</p>
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-3 h-3 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    /* ── Error ─────── */
    if (error) {
        return (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-8">
                <div className="flex flex-col items-center justify-center space-y-4 text-center min-h-[300px]">
                    <AlertCircle className="w-10 h-10 text-destructive" />
                    <div>
                        <h3 className="font-semibold text-base text-destructive">Fehler bei der Generierung</h3>
                        <p className="text-sm text-muted-foreground mt-1">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Empty State ── */
    if (!result || !displayData) {
        return (
            <div className="rounded-xl border border-border/40 bg-card/80 backdrop-blur p-8">
                <div className="flex flex-col items-center justify-center space-y-5 text-center min-h-[400px]">
                    {/* Premium gradient icon */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-violet-500/15 rounded-2xl blur-xl" />
                        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/30 border border-border/30 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-muted-foreground/40 animate-pulse" style={{ animationDuration: '3s' }} />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-base">Vorschau</h3>
                        <p className="text-sm text-muted-foreground mt-1.5 max-w-[260px] mx-auto leading-relaxed">
                            Fülle das Formular aus und generiere deine erste Ad — das Ergebnis erscheint hier.
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                        <span>Meta-Vorschau</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                        <span>Score-Analyse</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                        <span>Hook-Auswertung</span>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Result ────── */
    return (
        <div className="space-y-5">
            {/* Variant Selector — Compact Cards */}
            {variantCount > 1 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-semibold">Variante wählen</h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={prevVariant} className="p-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] text-muted-foreground tabular-nums px-1">
                                {currentIndex + 1}/{variantCount}
                            </span>
                            <button onClick={nextVariant} className="p-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
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
                                        "relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all duration-300 border",
                                        index === currentIndex
                                            ? "bg-gradient-to-br from-primary/10 to-red-500/5 text-foreground border-primary/30 shadow-lg shadow-primary/5 scale-[1.02]"
                                            : "bg-card/60 text-muted-foreground border-border/20 hover:border-border/40 hover:bg-card/80"
                                    )}
                                >
                                    {/* Active indicator */}
                                    {index === currentIndex && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-gradient-to-r from-primary to-red-500" />
                                    )}
                                    <div className={cn(
                                        "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold",
                                        index === currentIndex
                                            ? "bg-primary/20 text-primary"
                                            : "bg-muted/50 text-muted-foreground"
                                    )}>
                                        V{index + 1}
                                    </div>
                                    <span className="text-[10px]">Variante {index + 1}</span>
                                    {variant.qualityScore && (
                                        <Badge className={cn(
                                            "text-[9px] px-1.5 py-0 h-4",
                                            variant.qualityScore >= 8 ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/30" :
                                                variant.qualityScore >= 6 ? "bg-amber-500/20 text-amber-600 border-amber-500/30" : "bg-muted"
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

            {/* ── Meta Ad Mockup (floating + mount animation) ── */}
            <div className="relative">
                {/* Ambient glow */}
                <div className="absolute -inset-3 bg-gradient-to-br from-primary/5 via-transparent to-red-500/5 rounded-2xl blur-xl pointer-events-none" />

                <div className="relative max-w-md mx-auto bg-[#242526] rounded-xl overflow-hidden shadow-2xl shadow-black/40 border border-white/5 ring-1 ring-white/[0.03] meta-mockup-float stagger-in"
                    style={{ animationDelay: '100ms' }}
                >
                    {/* Header */}
                    <div className="p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-primary/20">
                                AR
                            </div>
                            <div>
                                <div className="font-semibold text-[13px] text-white leading-tight">AdRuby AI</div>
                                <div className="text-[11px] text-gray-400 flex items-center gap-1">
                                    Gesponsert · <Globe className="w-2.5 h-2.5" />
                                </div>
                            </div>
                        </div>
                        <button className="text-gray-500 hover:text-gray-300 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Primary Text */}
                    <div className="px-3.5 pb-2.5">
                        <p className="text-[13px] text-white/90 whitespace-pre-wrap leading-relaxed">
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
                    <div className="bg-[#323436] px-3.5 py-3 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide truncate">{displayData.slogan}</p>
                            <h4 className="font-semibold text-white text-sm truncate leading-tight mt-0.5">{displayData.headline}</h4>
                        </div>
                        <button className="shrink-0 bg-white/10 hover:bg-white/20 text-white font-semibold py-1.5 px-3.5 rounded-md text-xs transition-colors border border-white/10 whitespace-nowrap">
                            {displayData.cta}
                        </button>
                    </div>

                    {/* Engagement Bar — DE */}
                    <div className="px-3.5 py-2.5 border-t border-white/5 flex items-center justify-between text-gray-500 text-xs">
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

            {/* ── Score Rings (staggered) ─────────────────── */}
            {(displayData.qualityScore || displayData.engagementScore) && (
                <div className="flex justify-center gap-10">
                    {displayData.qualityScore && (
                        <ScoreRing value={displayData.qualityScore} max={10} label="Qualität" color="hsl(var(--primary))" delay={200} />
                    )}
                    {displayData.engagementScore && (
                        <ScoreRing value={displayData.engagementScore} max={100} label="Engagement" color="#10b981" delay={500} />
                    )}
                </div>
            )}

            {/* ── Hook Callout (premium) ─────────────────── */}
            {displayData.hook && displayData.hook !== displayData.description && (
                <div className="max-w-md mx-auto stagger-in" style={{ animationDelay: '600ms' }}>
                    <div className="relative p-4 rounded-xl bg-gradient-to-br from-card/90 to-card/60 backdrop-blur border border-border/30 overflow-hidden">
                        {/* Gradient left accent */}
                        <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />

                        <div className="pl-4">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-500 mb-2">
                                <Wand2 className="w-3.5 h-3.5" />
                                Hook dieser Variante
                            </div>
                            <p className="text-sm text-foreground/80 italic leading-relaxed">
                                <span className="text-violet-400/60 text-lg leading-none mr-0.5">„</span>
                                {displayData.hook}
                                <span className="text-violet-400/60 text-lg leading-none ml-0.5">‟</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
