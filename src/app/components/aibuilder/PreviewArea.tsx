/**
 * AI Ad Builder - Preview Area Component
 */

import { t } from '../../lib/aibuilder/translations';
import { Loader2, AlertCircle, Globe, MoreHorizontal, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import type { PreviewAreaProps } from '../../types/aibuilder';

export function PreviewArea({ language, result, loading, error }: PreviewAreaProps) {
    if (loading) {
        return (
            <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur p-8">
                <div className="flex flex-col items-center justify-center space-y-4 text-center min-h-[400px]">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <div>
                        <h3 className="font-semibold text-lg">{t('generating', language)}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {language === 'de'
                                ? 'KI erstellt Ihre Anzeige...'
                                : 'AI is creating your ad...'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-8">
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

    if (!result) {
        return (
            <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur p-8">
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
            <h3 className="font-bold text-lg px-2">{t('previewTitle', language)}</h3>

            {/* Meta Ad Mockup */}
            <div className="max-w-md mx-auto bg-[#242526] rounded-xl overflow-hidden shadow-lg border border-border/20">
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

                {/* Primary Text (Description) */}
                <div className="px-4 pb-3">
                    <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{result.description}</p>
                </div>

                {/* Image with Text Overlay */}
                {result.imageUrl && (
                    <div className="relative aspect-square w-full bg-black/50">
                        <img
                            src={result.imageUrl}
                            alt="Ad Creative"
                            className="w-full h-full object-cover"
                        />
                        {/* Text Overlay Layer - Conversion-Optimized */}
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
                                    {result.headline}
                                </h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer (Headline + CTA) */}
                <div className="bg-[#323436] p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase tracking-wide truncate">
                            {result.slogan}
                        </p>
                        <h4 className="font-bold text-white text-base truncate leading-tight mt-0.5">
                            {result.headline}
                        </h4>
                    </div>
                    <button className="shrink-0 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors border border-white/10 whitespace-nowrap">
                        {result.cta}
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

            {/* Scores (moved below ad) */}
            {(result.qualityScore || result.engagementScore) && (
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    {result.qualityScore && (
                        <div className="bg-card/30 p-4 rounded-xl border border-border/40 text-center">
                            <div className="text-xs text-muted-foreground uppercase">{language === 'de' ? 'Qualität' : 'Quality'}</div>
                            <div className="text-2xl font-bold text-primary mt-1">{result.qualityScore}/10</div>
                        </div>
                    )}
                    {result.engagementScore && (
                        <div className="bg-card/30 p-4 rounded-xl border border-border/40 text-center">
                            <div className="text-xs text-muted-foreground uppercase">{language === 'de' ? 'Engagement' : 'Engagement'}</div>
                            <div className="text-2xl font-bold text-green-500 mt-1">{result.engagementScore}%</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
