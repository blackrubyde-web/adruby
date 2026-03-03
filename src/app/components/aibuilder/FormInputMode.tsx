/**
 * AI Ad Builder – Form Input Mode (Premium V3)
 * Grouped sections with gradient underlines, helper text, polished generate button.
 */

import { useState, useMemo } from 'react';
import { t } from '../../lib/aibuilder/translations';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Sparkles, Package, Target, Zap, Loader2 } from 'lucide-react';
import { useAuthState } from '../../contexts/AuthContext';
import type { AIAdBuilderComponentProps, FormInputData } from '../../types/aibuilder';

export function FormInputMode({ language, onGenerate, loading }: AIAdBuilderComponentProps) {
    const { profile } = useAuthState();
    const credits = profile?.credits ?? 0;

    const [formData, setFormData] = useState<FormInputData>({
        industry: '',
        targetAudience: '',
        productName: '',
        usp: '',
        tone: '',
        goal: '',
        template: 'ai_automatic',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(formData);
    };

    const handleChange = (field: keyof FormInputData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const isValid = useMemo(() => {
        return formData.productName.trim() !== '' && formData.usp.trim() !== '';
    }, [formData.productName, formData.usp]);

    const filledCount = useMemo(() => {
        return [formData.productName, formData.industry, formData.usp, formData.targetAudience, formData.tone, formData.goal]
            .filter(v => v.trim() !== '').length;
    }, [formData]);

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {/* ── Section 1: Produkt ───────────────────────────── */}
            <div className="rounded-xl border border-border/40 bg-card/80 backdrop-blur overflow-hidden group/section hover:border-border/60 transition-colors">
                <div className="px-4 pt-3 pb-2 border-b border-border/30 bg-muted/30 relative">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-red-500/10 flex items-center justify-center">
                            <Package className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-xs font-semibold text-foreground tracking-wide uppercase">Produkt</span>
                        <span className="ml-auto text-[10px] text-muted-foreground/40 tabular-nums">
                            {[formData.productName, formData.industry, formData.usp].filter(v => v.trim()).length}/3
                        </span>
                    </div>
                    {/* Gradient underline */}
                    <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-primary/40 via-red-500/20 to-transparent" />
                </div>
                <div className="p-4 space-y-4">
                    {/* Product Name */}
                    <div className="space-y-1.5 group/field">
                        <Label htmlFor="productName" className="text-xs font-medium flex items-center gap-1">
                            {t('productNameLabel', language)}
                            <span className="text-primary">*</span>
                        </Label>
                        <Input
                            id="productName"
                            value={formData.productName}
                            onChange={(e) => handleChange('productName', e.target.value)}
                            placeholder={t('productNamePlaceholder', language)}
                            className="h-9 text-sm transition-shadow focus-visible:shadow-[0_0_0_3px_rgba(var(--primary-rgb,239,68,68),0.1)]"
                        />
                        <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                            Der Name deines Produkts oder deiner Marke
                        </p>
                    </div>

                    {/* Industry */}
                    <div className="space-y-1.5 group/field">
                        <Label htmlFor="industry" className="text-xs font-medium">{t('industryLabel', language)}</Label>
                        <Input
                            id="industry"
                            value={formData.industry}
                            onChange={(e) => handleChange('industry', e.target.value)}
                            placeholder={t('industryPlaceholder', language)}
                            className="h-9 text-sm transition-shadow focus-visible:shadow-[0_0_0_3px_rgba(var(--primary-rgb,239,68,68),0.1)]"
                        />
                        <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                            z.B. E-Commerce, SaaS, Fashion, Food, Fitness
                        </p>
                    </div>

                    {/* USP */}
                    <div className="space-y-1.5 group/field">
                        <Label htmlFor="usp" className="text-xs font-medium flex items-center gap-1">
                            {t('uspLabel', language)}
                            <span className="text-primary">*</span>
                        </Label>
                        <Textarea
                            id="usp"
                            value={formData.usp}
                            onChange={(e) => handleChange('usp', e.target.value)}
                            placeholder={t('uspPlaceholder', language)}
                            rows={2}
                            className="text-sm resize-none transition-shadow focus-visible:shadow-[0_0_0_3px_rgba(var(--primary-rgb,239,68,68),0.1)]"
                        />
                        <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                            Was macht dein Produkt einzigartig? 1-2 Sätze reichen.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Section 2: Zielgruppe & Stil ─────────────────── */}
            <div className="rounded-xl border border-border/40 bg-card/80 backdrop-blur overflow-hidden group/section hover:border-border/60 transition-colors">
                <div className="px-4 pt-3 pb-2 border-b border-border/30 bg-muted/30 relative">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 flex items-center justify-center">
                            <Target className="w-3.5 h-3.5 text-violet-500" />
                        </div>
                        <span className="text-xs font-semibold text-foreground tracking-wide uppercase">Zielgruppe & Stil</span>
                        <span className="ml-auto text-[10px] text-muted-foreground/40 tabular-nums">
                            {[formData.targetAudience, formData.tone, formData.goal].filter(v => v.trim()).length}/3
                        </span>
                    </div>
                    {/* Gradient underline */}
                    <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-violet-500/40 via-fuchsia-500/20 to-transparent" />
                </div>
                <div className="p-4 space-y-4">
                    {/* Target Audience */}
                    <div className="space-y-1.5">
                        <Label htmlFor="targetAudience" className="text-xs font-medium">{t('targetAudienceLabel', language)}</Label>
                        <Input
                            id="targetAudience"
                            value={formData.targetAudience}
                            onChange={(e) => handleChange('targetAudience', e.target.value)}
                            placeholder={t('targetAudiencePlaceholder', language)}
                            className="h-9 text-sm transition-shadow focus-visible:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]"
                        />
                        <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                            z.B. Frauen 25-34, Fitness-Enthusiasten, Startup-Gründer
                        </p>
                    </div>

                    {/* Tone */}
                    <div className="space-y-1.5">
                        <Label htmlFor="tone" className="text-xs font-medium">{t('toneLabel', language)}</Label>
                        <Input
                            id="tone"
                            value={formData.tone}
                            onChange={(e) => handleChange('tone', e.target.value)}
                            placeholder={t('tonePlaceholder', language)}
                            className="h-9 text-sm transition-shadow focus-visible:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]"
                        />
                        <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                            z.B. professionell, verspielt, luxuriös, dringend
                        </p>
                    </div>

                    {/* Goal */}
                    <div className="space-y-1.5">
                        <Label htmlFor="goal" className="text-xs font-medium">{t('goalLabel', language)}</Label>
                        <Input
                            id="goal"
                            value={formData.goal}
                            onChange={(e) => handleChange('goal', e.target.value)}
                            placeholder={t('goalPlaceholder', language)}
                            className="h-9 text-sm transition-shadow focus-visible:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]"
                        />
                        <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                            z.B. Conversions steigern, Markenbekanntheit, App-Downloads
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Generate Button ──────────────────────────────── */}
            <div className="relative group">
                {/* Ambient glow when valid */}
                {isValid && !loading && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-red-500 to-orange-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                )}
                <Button
                    type="submit"
                    disabled={loading || !isValid}
                    className="relative w-full gap-2 bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90 h-12 text-sm font-semibold shadow-lg shadow-primary/20 gradient-shift-hover"
                    size="lg"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('generating', language)}
                        </>
                    ) : (
                        <>
                            <Zap className="w-4 h-4" />
                            Ad generieren
                            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-white/15 text-white/80 text-[10px] font-medium">
                                1 Credit
                            </span>
                        </>
                    )}
                </Button>
            </div>

            {/* Credits + progress info */}
            <div className="flex items-center justify-between px-1">
                <p className="text-[10px] text-muted-foreground/50">
                    {credits} {credits === 1 ? 'Credit' : 'Credits'} verbleibend
                </p>
                <p className="text-[10px] text-muted-foreground/40 tabular-nums">
                    {filledCount}/6 Felder ausgefüllt
                </p>
            </div>
        </form>
    );
}
