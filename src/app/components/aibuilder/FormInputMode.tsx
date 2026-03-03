/**
 * AI Ad Builder – Form Input Mode (Dark Editorial Studio v6)
 * Syne typography, scarlet accents, editorial input sections.
 */

import { useState, useMemo } from 'react';
import { t } from '../../lib/aibuilder/translations';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Package, Target, Zap, Loader2 } from 'lucide-react';
import { useAuthState } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
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

    const [showValidation, setShowValidation] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) {
            setShowValidation(true);
            return;
        }
        setShowValidation(false);
        onGenerate(formData);
    };

    const handleChange = (field: keyof FormInputData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (showValidation) setShowValidation(false);
    };

    const isValid = useMemo(() => {
        return formData.productName.trim() !== '' && formData.usp.trim() !== '';
    }, [formData.productName, formData.usp]);

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {/* ── Section 1: Produkt ───────────────────────────── */}
            <div className="input-section">
                <div className="input-section-header">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(230, 57, 70, 0.08)', border: '1px solid rgba(230, 57, 70, 0.1)' }}>
                        <Package className="w-3 h-3" style={{ color: 'var(--accent-scarlet)' }} />
                    </div>
                    <span className="text-xs font-medium tracking-wide uppercase" style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.06em', color: 'hsl(var(--muted-foreground))' }}>Produkt</span>
                    <span className="ml-auto text-[10px] text-muted-foreground/40" style={{ fontFamily: 'var(--font-body)' }}>2 Pflichtfelder</span>
                </div>
                <div className="input-section-body">
                    {/* Product Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="productName" className="text-xs font-medium flex items-center gap-1">
                            {t('productNameLabel', language)}
                            <span className="text-primary text-[10px]">*</span>
                        </Label>
                        <Input
                            id="productName"
                            value={formData.productName}
                            onChange={(e) => handleChange('productName', e.target.value)}
                            placeholder={t('productNamePlaceholder', language)}
                            className={cn(
                                "h-9 text-sm bg-muted/20 border-border/30 focus:bg-background transition-all",
                                showValidation && !formData.productName.trim() && "border-destructive/50 bg-destructive/5"
                            )}
                        />
                        {showValidation && !formData.productName.trim() ? (
                            <p className="text-[11px] text-destructive/80">Pflichtfeld — bitte ausfüllen</p>
                        ) : (
                            <p className="text-[11px] text-muted-foreground/60">
                                Der Name deines Produkts oder deiner Marke
                            </p>
                        )}
                    </div>

                    {/* Industry */}
                    <div className="space-y-1.5">
                        <Label htmlFor="industry" className="text-xs font-medium">{t('industryLabel', language)}</Label>
                        <Input
                            id="industry"
                            value={formData.industry}
                            onChange={(e) => handleChange('industry', e.target.value)}
                            placeholder={t('industryPlaceholder', language)}
                            className="h-9 text-sm bg-muted/20 border-border/30 focus:bg-background transition-all"
                        />
                        <p className="text-[11px] text-muted-foreground/60">
                            z.B. E-Commerce, SaaS, Fashion, Food, Fitness
                        </p>
                    </div>

                    {/* USP */}
                    <div className="space-y-1.5">
                        <Label htmlFor="usp" className="text-xs font-medium flex items-center gap-1">
                            {t('uspLabel', language)}
                            <span className="text-primary text-[10px]">*</span>
                        </Label>
                        <Textarea
                            id="usp"
                            value={formData.usp}
                            onChange={(e) => handleChange('usp', e.target.value)}
                            placeholder={t('uspPlaceholder', language)}
                            rows={2}
                            className={cn(
                                "text-sm resize-none bg-muted/20 border-border/30 focus:bg-background transition-all",
                                showValidation && !formData.usp.trim() && "border-destructive/50 bg-destructive/5"
                            )}
                        />
                        {showValidation && !formData.usp.trim() ? (
                            <p className="text-[11px] text-destructive/80">Pflichtfeld — bitte ausfüllen</p>
                        ) : (
                            <p className="text-[11px] text-muted-foreground/60">
                                Was macht dein Produkt einzigartig? 1-2 Sätze reichen.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Section 2: Zielgruppe & Stil ─────────────────── */}
            <div className="input-section">
                <div className="input-section-header">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(244, 162, 97, 0.08)', border: '1px solid rgba(244, 162, 97, 0.1)' }}>
                        <Target className="w-3 h-3" style={{ color: 'var(--accent-amber)' }} />
                    </div>
                    <span className="text-xs font-medium tracking-wide uppercase" style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.06em', color: 'hsl(var(--muted-foreground))' }}>Zielgruppe & Stil</span>
                    <span className="ml-auto text-[10px] text-muted-foreground/40" style={{ fontFamily: 'var(--font-body)' }}>optional</span>
                </div>
                <div className="input-section-body">
                    {/* Target Audience */}
                    <div className="space-y-1.5">
                        <Label htmlFor="targetAudience" className="text-xs font-medium">{t('targetAudienceLabel', language)}</Label>
                        <Input
                            id="targetAudience"
                            value={formData.targetAudience}
                            onChange={(e) => handleChange('targetAudience', e.target.value)}
                            placeholder={t('targetAudiencePlaceholder', language)}
                            className="h-9 text-sm bg-muted/20 border-border/30 focus:bg-background transition-all"
                        />
                        <p className="text-[11px] text-muted-foreground/60">
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
                            className="h-9 text-sm bg-muted/20 border-border/30 focus:bg-background transition-all"
                        />
                        <p className="text-[11px] text-muted-foreground/60">
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
                            className="h-9 text-sm bg-muted/20 border-border/30 focus:bg-background transition-all"
                        />
                        <p className="text-[11px] text-muted-foreground/60">
                            z.B. Conversions steigern, Markenbekanntheit, App-Downloads
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Generate Button ──────────────────────────────── */}
            <div>
                <Button
                    type="submit"
                    disabled={loading}
                    className="generate-btn w-full gap-2 h-12 text-sm rounded-xl text-white border-0"
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
                            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-white/15 text-white/80 text-[10px]" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                                1 Credit
                            </span>
                        </>
                    )}
                </Button>
            </div>

            {/* Credits info */}
            <p className="text-center text-[11px] text-muted-foreground/50">
                {credits} {credits === 1 ? 'Credit' : 'Credits'} verbleibend
            </p>
        </form>
    );
}
