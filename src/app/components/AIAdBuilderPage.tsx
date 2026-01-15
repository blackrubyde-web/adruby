/**
 * AI Ad Builder - Main Page Component
 */

import { useState } from 'react';
import { Wand2, Download, Save, Globe } from 'lucide-react';
import { generateAd } from '../lib/api/aibuilder';
import { t } from '../lib/aibuilder/translations';
import { toast } from 'sonner';
import { FormInputMode } from './aibuilder/FormInputMode';
import { FreeTextInputMode } from './aibuilder/FreeTextInputMode';
import { PreviewArea } from './aibuilder/PreviewArea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import type { Language, InputMode, AdGenerationResult, FormInputData, FreeTextInputData } from '../types/aibuilder';

export function AIAdBuilderPage() {
    const [language, setLanguage] = useState<Language>('de');
    const [mode, setMode] = useState<InputMode>('form');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AdGenerationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async (inputData: FormInputData | FreeTextInputData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await generateAd({
                mode,
                language,
                ...inputData,
            });

            if (response.success) {
                setResult(response.data);
                toast.success(t('successMessage', language));
            } else {
                throw new Error('Generation failed');
            }
        } catch (err) {
            console.error('Generation error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            toast.error(t('errorMessage', language) + ': ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        setError(null);
    };

    const handleSaveToLibrary = async () => {
        if (!result) return;

        // TODO: Integration mit Creative Library
        toast.success(t('savedToLibrary', language));
    };

    const handleDownload = () => {
        if (!result?.imageUrl) return;

        const link = document.createElement('a');
        link.href = result.imageUrl;
        link.download = `ai-ad-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border/40 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
                                <Wand2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">{t('pageTitle', language)}</h1>
                                <p className="text-sm text-muted-foreground">{t('pageSubtitle', language)}</p>
                            </div>
                        </div>

                        {/* Language Switcher */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
                            className="gap-2"
                        >
                            <Globe className="w-4 h-4" />
                            {language === 'de' ? 'DE' : 'EN'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Area */}
                    <div className="space-y-6">
                        <Tabs value={mode} onValueChange={(value) => setMode(value as InputMode)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="form">
                                    {t('modeFormLabel', language)}
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        {t('modeFormDesc', language)}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger value="free">
                                    {t('modeFreeLabel', language)}
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        {t('modeFreeDesc', language)}
                                    </span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="form" className="mt-6">
                                <FormInputMode
                                    language={language}
                                    onGenerate={handleGenerate}
                                    loading={loading}
                                />
                            </TabsContent>

                            <TabsContent value="free" className="mt-6">
                                <FreeTextInputMode
                                    language={language}
                                    onGenerate={handleGenerate}
                                    loading={loading}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Preview Area */}
                    <div className="space-y-6">
                        <PreviewArea
                            language={language}
                            result={result}
                            loading={loading}
                            error={error}
                        />

                        {/* Action Buttons */}
                        {result && !loading && (
                            <div className="flex flex-wrap gap-3">
                                <Button onClick={handleDownload} className="gap-2">
                                    <Download className="w-4 h-4" />
                                    {t('downloadButton', language)}
                                </Button>

                                <Button onClick={handleSaveToLibrary} variant="outline" className="gap-2">
                                    <Save className="w-4 h-4" />
                                    {t('saveToLibraryButton', language)}
                                </Button>

                                <Button onClick={handleReset} variant="ghost">
                                    {t('resetButton', language)}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
