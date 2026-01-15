/**
 * AI Ad Builder - Form Input Mode Component
 */

import { useState } from 'react';
import { t } from '../../lib/aibuilder/translations';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Sparkles } from 'lucide-react';
import type { AIAdBuilderComponentProps, FormInputData } from '../../types/aibuilder';

const templates = [
    'product_launch',
    'limited_offer',
    'testimonial',
    'before_after',
    'seasonal',
    'b2b_solution',
    'lifestyle',
] as const;

export function FormInputMode({ language, onGenerate, loading }: AIAdBuilderComponentProps) {
    const [formData, setFormData] = useState<FormInputData>({
        industry: '',
        targetAudience: '',
        productName: '',
        usp: '',
        tone: '',
        goal: '',
        template: 'product_launch',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(formData);
    };

    const handleChange = (field: keyof FormInputData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur p-6 space-y-4">
                {/* Industry */}
                <div className="space-y-2">
                    <Label htmlFor="industry">{t('industryLabel', language)}</Label>
                    <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => handleChange('industry', e.target.value)}
                        placeholder={t('industryPlaceholder', language)}
                    />
                </div>

                {/* Target Audience */}
                <div className="space-y-2">
                    <Label htmlFor="targetAudience">{t('targetAudienceLabel', language)}</Label>
                    <Input
                        id="targetAudience"
                        value={formData.targetAudience}
                        onChange={(e) => handleChange('targetAudience', e.target.value)}
                        placeholder={t('targetAudiencePlaceholder', language)}
                    />
                </div>

                {/* Product Name */}
                <div className="space-y-2">
                    <Label htmlFor="productName">{t('productNameLabel', language)}</Label>
                    <Input
                        id="productName"
                        value={formData.productName}
                        onChange={(e) => handleChange('productName', e.target.value)}
                        placeholder={t('productNamePlaceholder', language)}
                    />
                </div>

                {/* USP */}
                <div className="space-y-2">
                    <Label htmlFor="usp">{t('uspLabel', language)}</Label>
                    <Textarea
                        id="usp"
                        value={formData.usp}
                        onChange={(e) => handleChange('usp', e.target.value)}
                        placeholder={t('uspPlaceholder', language)}
                        rows={3}
                    />
                </div>

                {/* Tone */}
                <div className="space-y-2">
                    <Label htmlFor="tone">{t('toneLabel', language)}</Label>
                    <Input
                        id="tone"
                        value={formData.tone}
                        onChange={(e) => handleChange('tone', e.target.value)}
                        placeholder={t('tonePlaceholder', language)}
                    />
                </div>

                {/* Goal */}
                <div className="space-y-2">
                    <Label htmlFor="goal">{t('goalLabel', language)}</Label>
                    <Input
                        id="goal"
                        value={formData.goal}
                        onChange={(e) => handleChange('goal', e.target.value)}
                        placeholder={t('goalPlaceholder', language)}
                    />
                </div>

                {/* Template */}
                <div className="space-y-2">
                    <Label htmlFor="template">{t('templateLabel', language)}</Label>
                    <Select value={formData.template} onValueChange={(value) => handleChange('template', value)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {templates.map((template) => (
                                <SelectItem key={template} value={template}>
                                    {t(`templates.${template}`, language)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                disabled={loading}
                className="w-full gap-2 bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90"
                size="lg"
            >
                <Sparkles className="w-4 h-4" />
                {loading ? t('generating', language) : t('generateButton', language)}
            </Button>
        </form>
    );
}
