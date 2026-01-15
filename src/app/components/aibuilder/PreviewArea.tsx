/**
 * AI Ad Builder - Preview Area Component
 */

import { t } from '../../lib/aibuilder/translations';
import { Loader2, AlertCircle } from 'lucide-react';
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
        <div className="space-y-4">
            {/* Image Preview */}
            {result.imageUrl && (
                <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur overflow-hidden">
                    <img
                        src={result.imageUrl}
                        alt="Generated Ad"
                        className="w-full h-auto"
                    />
                </div>
            )}

            {/* Text Content */}
            <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur p-6 space-y-4">
                <h3 className="font-bold text-lg">{t('previewTitle', language)}</h3>

                {/* Headline */}
                {result.headline && (
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {t('headlineLabel', language)}
                        </label>
                        <p className="text-xl font-bold">{result.headline}</p>
                    </div>
                )}

                {/* Slogan */}
                {result.slogan && (
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {t('sloganLabel', language)}
                        </label>
                        <p className="text-lg font-semibold text-primary">{result.slogan}</p>
                    </div>
                )}

                {/* Description */}
                {result.description && (
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {t('descriptionLabel', language)}
                        </label>
                        <p className="text-sm">{result.description}</p>
                    </div>
                )}

                {/* CTA */}
                {result.cta && (
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {t('ctaLabel', language)}
                        </label>
                        <div className="inline-flex px-6 py-3 bg-gradient-to-r from-primary to-red-600 text-white font-semibold rounded-lg">
                            {result.cta}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
