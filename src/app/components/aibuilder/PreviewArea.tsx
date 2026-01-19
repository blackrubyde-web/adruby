/**
 * AI Ad Builder - Preview Area Component with Multi-Variant Support
 */

import { useState } from 'react';
import { t } from '../../lib/aibuilder/translations';
import {
    Loader2, AlertCircle, Globe, MoreHorizontal, ThumbsUp,
    MessageCircle, Share2, Check, ChevronLeft, ChevronRight,
    Sparkles, Star, TrendingUp
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import type { PreviewAreaProps, AdVariant, AdGenerationResult } from '../../types/aibuilder';

// Helper to get display data from result or variant
function getDisplayData(result: AdGenerationResult, variantIndex: number = 0) {
    if (result.variants && result.variants.length > variantIndex) {
        return result.variants[variantIndex];
    }
    // Fallback to main result data
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

    // Use external or local state
    const currentIndex = onSelectVariant ? selectedVariantIndex : localVariantIndex;
    const setCurrentIndex = onSelectVariant || setLocalVariantIndex;

    const variantCount = result?.variants?.length || 1;
    const displayData = result ? getDisplayData(result, currentIndex) : null;

    const nextVariant = () => {
        setCurrentIndex((currentIndex + 1) % variantCount);
    };

    const prevVariant = () => {
        setCurrentIndex((currentIndex - 1 + variantCount) % variantCount);
    };

    if (loading) {
        return (
            <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-8">
                <div className="flex flex-col items-center justify-center space-y-6 text-center min-h-[400px]">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
                        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-white animate-spin" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-xl">{t('generating', language)}</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            {language === 'de'
                                ? 'KI erstellt 3 Varianten für dich...'
                                : 'AI is creating 3 variants for you...'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="w-3 h-3 rounded-full bg-primary/30 animate-pulse"
                                style={{ animationDelay: `${i * 0.2}s` }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-8">
                <div className="flex flex-col items-center justify-center space-y-4 text-center min-h-[400px]">
                    <AlertCircle className="w-12 h-12 text-destructive" />
                    <div>
                        <h3 className="font-semibold text-lg text-destructive">{t('errorMessage', language)}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!result || !displayData) {
        return (
            <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-8">
                <div className="flex flex-col items-center justify-center space-y-4 text-center min-h-[400px]">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">{t('previewTitle', language)}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{t('noPreview', language)}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Variant Selector Header */}
            {variantCount > 1 && (
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-lg">
                            {language === 'de' ? 'Wähle deine Variante' : 'Choose your variant'}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={prevVariant}
                            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium px-2">
                            {currentIndex + 1} / {variantCount}
                        </span>
                        <button
                            onClick={nextVariant}
                            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Variant Pills */}
            {variantCount > 1 && (
                <div className="flex justify-center gap-3">
                    {result.variants?.map((variant, index) => (
                        <button
                            key={variant.id}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                                "group relative px-6 py-3 rounded-xl border-2 transition-all duration-300",
                                index === currentIndex
                                    ? "border-primary bg-primary/10 scale-105"
                                    : "border-border/50 bg-card/50 hover:border-primary/50"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                {index === currentIndex && (
                                    <Check className="w-4 h-4 text-primary" />
                                )}
                                <span className={cn(
                                    "font-semibold",
                                    index === currentIndex ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {language === 'de' ? `Variante ${index + 1}` : `Variant ${index + 1}`}
                                </span>
                            </div>

                            {/* Score badge */}
                            {variant.qualityScore && (
                                <Badge
                                    className={cn(
                                        "absolute -top-2 -right-2 text-[10px]",
                                        variant.qualityScore >= 8 ? "bg-emerald-500" :
                                            variant.qualityScore >= 6 ? "bg-amber-500" : "bg-muted"
                                    )}
                                >
                                    {variant.qualityScore}/10
                                </Badge>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Meta Ad Mockup */}
            <div className="max-w-md mx-auto bg-[#242526] rounded-xl overflow-hidden shadow-2xl shadow-black/20 border border-white/5">
                {/* Header */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white font-bold">
                            AR
                        </div>
                        <div>
                            <div className="font-semibold text-sm text-white">AdRuby AI</div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                                {language === 'de' ? 'Gesponsert' : 'Sponsored'} · <Globe className="w-3 h-3" />
                            </div>
                        </div>
                    </div>
                    <button className="text-gray-400 hover:text-white">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                {/* Primary Text (Hook/Description) */}
                <div className="px-4 pb-3">
                    <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                        {displayData.hook || displayData.description}
                    </p>
                </div>

                {/* Image with Text Overlay */}
                {displayData.imageUrl && (
                    <div className="relative aspect-square w-full bg-black/50">
                        <img
                            src={displayData.imageUrl}
                            alt="Ad Creative"
                            className="w-full h-full object-cover"
                        />
                        {/* Text Overlay Layer */}
                        <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
                            {/* Top Badge */}
                            <div className="flex justify-end">
                                <div className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg uppercase tracking-wide">
                                    {language === 'de' ? 'Limitiert' : 'Limited'}
                                </div>
                            </div>
                            {/* Bottom Headline Overlay */}
                            <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent -mx-4 -mb-4 p-4 pt-12">
                                <h3 className="text-white font-bold text-xl leading-tight drop-shadow-lg">
                                    {displayData.headline}
                                </h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer (Slogan + CTA) */}
                <div className="bg-[#323436] p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase tracking-wide truncate">
                            {displayData.slogan}
                        </p>
                        <h4 className="font-bold text-white text-base truncate leading-tight mt-0.5">
                            {displayData.headline}
                        </h4>
                    </div>
                    <button className="shrink-0 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors border border-white/10 whitespace-nowrap">
                        {displayData.cta}
                    </button>
                </div>

                {/* Engagement Mockup */}
                <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between text-gray-400 text-sm">
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1.5 hover:text-white transition">
                            <ThumbsUp className="w-4 h-4" /> <span>Like</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-white transition">
                            <MessageCircle className="w-4 h-4" /> <span>Comment</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-white transition">
                            <Share2 className="w-4 h-4" /> <span>Share</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Scores */}
            {(displayData.qualityScore || displayData.engagementScore) && (
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    {displayData.qualityScore && (
                        <div className="bg-card/30 backdrop-blur-sm p-4 rounded-xl border border-border/40 text-center">
                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground uppercase mb-1">
                                <Star className="w-3 h-3" />
                                {language === 'de' ? 'Qualität' : 'Quality'}
                            </div>
                            <div className="text-2xl font-bold text-primary">{displayData.qualityScore}/10</div>
                        </div>
                    )}
                    {displayData.engagementScore && (
                        <div className="bg-card/30 backdrop-blur-sm p-4 rounded-xl border border-border/40 text-center">
                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground uppercase mb-1">
                                <TrendingUp className="w-3 h-3" />
                                {language === 'de' ? 'Engagement' : 'Engagement'}
                            </div>
                            <div className="text-2xl font-bold text-emerald-500">{displayData.engagementScore}%</div>
                        </div>
                    )}
                </div>
            )}

            {/* Hook Preview */}
            {displayData.hook && displayData.hook !== displayData.description && (
                <div className="max-w-md mx-auto p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
                    <div className="flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400 mb-2">
                        <Sparkles className="w-4 h-4" />
                        {language === 'de' ? 'Hook dieser Variante' : 'Hook for this variant'}
                    </div>
                    <p className="text-sm text-foreground italic">"{displayData.hook}"</p>
                </div>
            )}
        </div>
    );
}
