import { memo, useState, useCallback } from 'react';
import {
    Sparkles,
    Upload,
    Wand2,
    Layers,
    RefreshCw,
    Download,
    ChevronRight,
    Zap,
    Image as ImageIcon,
    Type,
    ArrowRight,
    Grid3X3,
    Palette,
    AlertCircle,
    CheckCircle2,
    Play,
    Square,
    Smartphone,
    Monitor,
    Rocket
} from 'lucide-react';
import { DashboardShell } from './layout/DashboardShell';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

// Scene Graph Types (will be moved to separate file later)
interface SceneElement {
    id: string;
    type: 'image' | 'text' | 'arrow' | 'badge' | 'shape' | 'table' | 'cta';
    role: string;
    priority: number;
    props?: Record<string, unknown>;
}

interface SceneRelation {
    from: string;
    to: string;
    type: 'left_of' | 'right_of' | 'above' | 'below' | 'leads_to' | 'near' | 'overlay' | 'inside';
    gap?: number;
}

interface CreativePlan {
    composition: string;
    elements: SceneElement[];
    relations: SceneRelation[];
    copy: {
        headline: string;
        subheadline?: string;
        cta: string;
    };
    style: {
        industry: string;
        tone: string;
        platform: string;
    };
    background?: {
        type: string;
        prompt?: string;
    };
}

interface ApiResponse {
    success: boolean;
    plans: CreativePlan[];
    usage?: {
        input_tokens: number;
        output_tokens: number;
        model: string;
    };
    error?: string;
    hint?: string;
}

// Pipeline step for progress tracking
type PipelineStep = 'idle' | 'creative' | 'layout' | 'render' | 'done' | 'error';

// Format presets for multi-format export
const FORMAT_PRESETS = [
    { id: 'square', label: 'Square', width: 1080, height: 1080, icon: Square, description: 'Feed Post' },
    { id: 'story', label: 'Story', width: 1080, height: 1920, icon: Smartphone, description: '9:16 Vertical' },
    { id: 'feed', label: 'Feed', width: 1200, height: 628, icon: Monitor, description: 'Link Preview' },
];

const COMPOSITION_TYPES = [
    { id: 'product_focus', label: 'Product Focus', icon: ImageIcon, description: 'Produkt im Zentrum' },
    { id: 'before_after', label: 'Before/After', icon: ArrowRight, description: 'Vorher-Nachher Vergleich' },
    { id: 'saas_dashboard', label: 'SaaS Dashboard', icon: Grid3X3, description: 'App/Dashboard Showcase' },
    { id: 'comparison', label: 'Comparison', icon: Layers, description: 'Produktvergleich Tabelle' },
    { id: 'feature_callout', label: 'Feature Callout', icon: Zap, description: 'Features mit Pfeilen' },
];

const INDUSTRY_TYPES = [
    { id: 'ecommerce', label: 'E-Commerce' },
    { id: 'saas', label: 'SaaS' },
    { id: 'local', label: 'Local Business' },
    { id: 'coach', label: 'Coaching' },
    { id: 'agency', label: 'Agency' },
    { id: 'dropshipping', label: 'Dropshipping' },
];

const TONE_OPTIONS = [
    { id: 'modern', label: 'Modern' },
    { id: 'luxury', label: 'Luxury' },
    { id: 'aggressive', label: 'Aggressive' },
    { id: 'minimal', label: 'Minimal' },
];

export const LLMAdBuilderPage = memo(function LLMAdBuilderPage() {
    const [prompt, setPrompt] = useState('');
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [selectedComposition, setSelectedComposition] = useState<string>('product_focus');
    const [selectedIndustry, setSelectedIndustry] = useState<string>('ecommerce');
    const [selectedTone, setSelectedTone] = useState<string>('modern');
    const [selectedFormat, setSelectedFormat] = useState<string>('square');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSolvingLayout, setIsSolvingLayout] = useState(false);
    const [creativePlan, setCreativePlan] = useState<CreativePlan | null>(null);
    const [allPlans, setAllPlans] = useState<CreativePlan[]>([]);
    const [generatedAd, setGeneratedAd] = useState<string | null>(null);
    const [allFormatsAds, setAllFormatsAds] = useState<Record<string, string>>({});
    const [variantCount, setVariantCount] = useState(1);
    const [apiUsage, setApiUsage] = useState<{ input_tokens: number; output_tokens: number; model: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [solvedLayout, setSolvedLayout] = useState<{
        elements: Record<string, { x: number; y: number; width: number; height: number; type: string; role: string }>;
        canvasWidth: number;
        canvasHeight: number;
    } | null>(null);
    const [layoutWarnings, setLayoutWarnings] = useState<string[]>([]);
    const [pipelineStep, setPipelineStep] = useState<PipelineStep>('idle');
    const [productImageBase64, setProductImageBase64] = useState<string | null>(null);

    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setUploadedImages(files);

            // Create preview URLs
            const previews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => {
                // Revoke old URLs to prevent memory leaks
                prev.forEach(url => URL.revokeObjectURL(url));
                return previews;
            });
        }
    }, []);

    const removeImage = useCallback((index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    }, []);

    // Convert file to base64
    const fileToBase64 = useCallback((file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                // Remove data URL prefix to get pure base64
                resolve(result.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }, []);

    // Get current format dimensions
    const getCurrentFormat = useCallback(() => {
        return FORMAT_PRESETS.find(f => f.id === selectedFormat) || FORMAT_PRESETS[0];
    }, [selectedFormat]);

    // ONE-CLICK MAGIC GENERATE - Full pipeline in one button
    const handleMagicGenerate = useCallback(async () => {
        if (!prompt && uploadedImages.length === 0) return;

        const format = getCurrentFormat();
        setPipelineStep('creative');
        setError(null);
        setGeneratedAd(null);
        setCreativePlan(null);
        setSolvedLayout(null);

        try {
            // Convert first image to base64 for compositing
            let productBase64: string | null = null;
            if (uploadedImages.length > 0) {
                productBase64 = await fileToBase64(uploadedImages[0]);
                setProductImageBase64(productBase64);
            }

            // Step 1: Claude Creative Director
            toast.loading('Claude analysiert...', { id: 'magic-generate' });

            const creativeResponse = await fetch('/.netlify/functions/llm-creative-director', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    images: uploadedImages.map((f, i) => ({ name: f.name, description: `Image ${i + 1}` })),
                    composition: selectedComposition,
                    industry: selectedIndustry,
                    tone: selectedTone,
                    platform: 'meta',
                    variants: variantCount
                })
            });

            const creativeData = await creativeResponse.json();
            if (!creativeResponse.ok || !creativeData.success) {
                throw new Error(creativeData.error || 'Creative Director failed');
            }

            const plan = creativeData.plans[0];
            setCreativePlan(plan);
            setAllPlans(creativeData.plans);
            setApiUsage(creativeData.usage);

            // Step 2: Constraint Solver
            setPipelineStep('layout');
            toast.loading('Layout berechnen...', { id: 'magic-generate' });

            const layoutResponse = await fetch('/.netlify/functions/llm-solve-layout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sceneGraph: plan,
                    canvasWidth: format.width,
                    canvasHeight: format.height
                })
            });

            const layoutData = await layoutResponse.json();
            if (!layoutResponse.ok || !layoutData.success) {
                throw new Error(layoutData.error || 'Layout solver failed');
            }

            setSolvedLayout(layoutData.layout);
            setLayoutWarnings(layoutData.warnings || []);

            // Step 3: Canvas Render
            setPipelineStep('render');
            toast.loading('Bild rendern...', { id: 'magic-generate' });

            const renderResponse = await fetch('/.netlify/functions/llm-render-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    layout: layoutData.layout,
                    copy: plan.copy,
                    style: plan.style,
                    background: plan.background,
                    productImage: productBase64
                })
            });

            const renderData = await renderResponse.json();
            if (!renderResponse.ok || !renderData.success) {
                throw new Error(renderData.error || 'Render failed');
            }

            setGeneratedAd(`data:${renderData.mimeType};base64,${renderData.image}`);
            setPipelineStep('done');

            toast.success('🎉 Ad generiert!', {
                id: 'magic-generate',
                description: `${format.label} (${format.width}×${format.height}) in ${renderData.renderTime}ms`
            });

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Pipeline fehlgeschlagen';
            setError(message);
            setPipelineStep('error');
            toast.error('Fehler', { id: 'magic-generate', description: message });
        }
    }, [prompt, uploadedImages, selectedComposition, selectedIndustry, selectedTone, variantCount, getCurrentFormat, fileToBase64]);

    // Solve layout constraints (manual step)
    const handleSolveLayout = useCallback(async () => {
        if (!creativePlan) return;
        const format = getCurrentFormat();

        setIsSolvingLayout(true);
        setLayoutWarnings([]);

        try {
            const response = await fetch('/.netlify/functions/llm-solve-layout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sceneGraph: creativePlan,
                    canvasWidth: format.width,
                    canvasHeight: format.height
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to solve layout');
            }

            setSolvedLayout(data.layout);
            setLayoutWarnings(data.warnings || []);

            toast.success('Layout gelöst!', {
                description: `${Object.keys(data.layout.elements).length} Elemente positioniert`,
                icon: <CheckCircle2 className="w-4 h-4" />
            });

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Layout-Fehler';
            toast.error('Layout-Fehler', { description: message });
        } finally {
            setIsSolvingLayout(false);
        }
    }, [creativePlan]);

    // Render image from layout
    const [isRendering, setIsRendering] = useState(false);
    const [renderTime, setRenderTime] = useState<number | null>(null);

    const handleRenderImage = useCallback(async () => {
        if (!solvedLayout || !creativePlan) return;

        setIsRendering(true);
        setGeneratedAd(null);

        try {
            const response = await fetch('/.netlify/functions/llm-render-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    layout: solvedLayout,
                    copy: creativePlan.copy,
                    style: creativePlan.style,
                    background: creativePlan.background
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to render image');
            }

            // Set the generated image as data URL
            setGeneratedAd(`data:${data.mimeType};base64,${data.image}`);
            setRenderTime(data.renderTime);

            toast.success('Ad gerendert!', {
                description: `${(data.size / 1024).toFixed(1)} KB in ${data.renderTime}ms`,
                icon: <CheckCircle2 className="w-4 h-4" />
            });

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Render-Fehler';
            toast.error('Render-Fehler', { description: message });
        } finally {
            setIsRendering(false);
        }
    }, [solvedLayout, creativePlan]);

    const handleGenerate = useCallback(async () => {
        if (!prompt && uploadedImages.length === 0) return;

        setIsGenerating(true);
        setError(null);
        setCreativePlan(null);
        setAllPlans([]);

        try {
            // Prepare image descriptions for the API
            const imageDescriptions = uploadedImages.map((file, i) => ({
                name: file.name,
                description: `Uploaded image ${i + 1}: ${file.name}`
            }));

            const response = await fetch('/.netlify/functions/llm-creative-director', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    images: imageDescriptions,
                    composition: selectedComposition,
                    industry: selectedIndustry,
                    tone: selectedTone,
                    platform: 'meta',
                    variants: variantCount
                })
            });

            const data: ApiResponse = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to generate creative plan');
            }

            if (data.plans && data.plans.length > 0) {
                setCreativePlan(data.plans[0]);
                setAllPlans(data.plans);
                setApiUsage(data.usage || null);

                toast.success('Creative Plan generiert!', {
                    description: `${data.plans[0].elements.length} Elemente, ${data.plans[0].relations.length} Relations`,
                    icon: <CheckCircle2 className="w-4 h-4" />
                });
            }

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
            setError(message);
            toast.error('Fehler bei der Generierung', {
                description: message,
                icon: <AlertCircle className="w-4 h-4" />
            });
        } finally {
            setIsGenerating(false);
        }
    }, [prompt, uploadedImages, selectedComposition, selectedIndustry, selectedTone, variantCount]);

    return (
        <DashboardShell
            title="LLM Ad Builder"
            subtitle="Claude-powered Creative Director mit präzisem Constraint-Based Rendering"
            headerChips={
                <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    BETA
                </Badge>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
                {/* LEFT: Input Panel */}
                <div className="space-y-6">
                    {/* Prompt Input */}
                    <Card variant="glass" className="overflow-hidden">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Type className="w-5 h-5 text-primary" />
                                Beschreibe deine Ad
                            </h3>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="z.B. 'Erstelle eine Ad für mein neues Fitness-Produkt. Zeige Vorher/Nachher Ergebnisse mit einem starken CTA.'"
                                className="w-full h-32 p-4 bg-muted/50 border border-border rounded-xl resize-none text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </CardContent>
                    </Card>

                    {/* Image Upload */}
                    <Card variant="glass" className="overflow-hidden">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Upload className="w-5 h-5 text-primary" />
                                Bilder hochladen
                            </h3>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                                <span className="text-sm text-muted-foreground">
                                    Produkt-Bilder, Screenshots, etc.
                                </span>
                            </label>
                            {imagePreviews.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-3">
                                    {imagePreviews.map((preview, i) => (
                                        <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                                            <img
                                                src={preview}
                                                alt={uploadedImages[i]?.name || 'Preview'}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={() => removeImage(i)}
                                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                            >
                                                ×
                                            </button>
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                                                {uploadedImages[i]?.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Composition Type */}
                    <Card variant="glass" className="overflow-hidden">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-primary" />
                                Komposition
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {COMPOSITION_TYPES.map((comp) => {
                                    const Icon = comp.icon;
                                    const isSelected = selectedComposition === comp.id;
                                    return (
                                        <button
                                            key={comp.id}
                                            onClick={() => setSelectedComposition(comp.id)}
                                            className={`p-4 rounded-xl border text-left transition-all ${isSelected
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <div className="font-semibold text-sm">{comp.label}</div>
                                            <div className="text-xs text-muted-foreground">{comp.description}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Style Options */}
                    <Card variant="glass" className="overflow-hidden">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Palette className="w-5 h-5 text-primary" />
                                Style
                            </h3>

                            <div className="space-y-4">
                                {/* Industry */}
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Industry</label>
                                    <div className="flex flex-wrap gap-2">
                                        {INDUSTRY_TYPES.map((ind) => (
                                            <button
                                                key={ind.id}
                                                onClick={() => setSelectedIndustry(ind.id)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedIndustry === ind.id
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted hover:bg-muted/80'
                                                    }`}
                                            >
                                                {ind.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tone */}
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Tone</label>
                                    <div className="flex flex-wrap gap-2">
                                        {TONE_OPTIONS.map((tone) => (
                                            <button
                                                key={tone.id}
                                                onClick={() => setSelectedTone(tone.id)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedTone === tone.id
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted hover:bg-muted/80'
                                                    }`}
                                            >
                                                {tone.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Variants */}
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Varianten</label>
                                    <div className="flex gap-2">
                                        {[1, 3, 5].map((count) => (
                                            <button
                                                key={count}
                                                onClick={() => setVariantCount(count)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${variantCount === count
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted hover:bg-muted/80'
                                                    }`}
                                            >
                                                {count}x
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Format Selection */}
                    <Card variant="glass" className="overflow-hidden">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Monitor className="w-5 h-5 text-primary" />
                                Export Format
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                {FORMAT_PRESETS.map((format) => {
                                    const Icon = format.icon;
                                    const isSelected = selectedFormat === format.id;
                                    return (
                                        <button
                                            key={format.id}
                                            onClick={() => setSelectedFormat(format.id)}
                                            className={`p-3 rounded-xl border text-center transition-all ${isSelected
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <div className="font-semibold text-sm">{format.label}</div>
                                            <div className="text-xs text-muted-foreground">{format.width}×{format.height}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pipeline Progress Indicator */}
                    {pipelineStep !== 'idle' && pipelineStep !== 'done' && pipelineStep !== 'error' && (
                        <Card variant="glass" className="overflow-hidden border-violet-500/30">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    {['creative', 'layout', 'render'].map((step, i) => {
                                        const isActive = pipelineStep === step;
                                        const isPast = ['creative', 'layout', 'render'].indexOf(pipelineStep) > i;
                                        return (
                                            <div key={step} className="flex items-center gap-2 flex-1">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isActive ? 'bg-violet-500 text-white animate-pulse' :
                                                    isPast ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                                                    }`}>
                                                    {isPast ? '✓' : i + 1}
                                                </div>
                                                <span className={`text-xs font-medium ${isActive ? 'text-violet-500' : isPast ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                                    {step === 'creative' ? 'Claude' : step === 'layout' ? 'Layout' : 'Render'}
                                                </span>
                                                {i < 2 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* MAGIC GENERATE BUTTON */}
                    <Button
                        size="lg"
                        onClick={handleMagicGenerate}
                        disabled={pipelineStep !== 'idle' && pipelineStep !== 'done' && pipelineStep !== 'error' || (!prompt && uploadedImages.length === 0)}
                        className="w-full h-16 text-lg gap-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25"
                    >
                        {pipelineStep !== 'idle' && pipelineStep !== 'done' && pipelineStep !== 'error' ? (
                            <>
                                <RefreshCw className="w-6 h-6 animate-spin" />
                                Pipeline läuft...
                            </>
                        ) : (
                            <>
                                <Rocket className="w-6 h-6" />
                                ✨ Magic Generate
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </Button>

                    {/* Manual Step Buttons (collapsed by default) */}
                    <details className="group">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-2">
                            <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
                            Manuelle Schritte anzeigen
                        </summary>
                        <div className="mt-3 space-y-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleGenerate}
                                disabled={isGenerating || (!prompt && uploadedImages.length === 0)}
                                className="w-full gap-2"
                            >
                                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                1. Creative Plan
                            </Button>
                        </div>
                    </details>
                </div>

                {/* RIGHT: Preview & Output Panel */}
                <div className="space-y-6">
                    {/* Architecture Diagram */}
                    <Card variant="glass" className="overflow-hidden">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500" />
                                Rendering Pipeline
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3 p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-violet-500" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">1. Claude Creative Director</div>
                                        <div className="text-xs text-muted-foreground">Analysiert Prompt → Scene Graph JSON</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <Layers className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">2. Constraint Solver (kiwi.js)</div>
                                        <div className="text-xs text-muted-foreground">Relations → Pixel-Koordinaten</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                        <ImageIcon className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">3. Canvas Renderer</div>
                                        <div className="text-xs text-muted-foreground">Layout → Finales Bild (node-canvas)</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Error State */}
                    {error && (
                        <Card variant="glass" className="overflow-hidden border-red-500/30">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-red-500">Fehler</h4>
                                        <p className="text-sm text-muted-foreground mt-1">{error}</p>
                                        {error.includes('ANTHROPIC_API_KEY') && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Füge <code className="bg-muted px-1 rounded">ANTHROPIC_API_KEY</code> in deinen Netlify Environment Variables hinzu.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Creative Plan Preview */}
                    {creativePlan && (
                        <Card variant="glass" className="overflow-hidden border-violet-500/30">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        Creative Plan generiert
                                    </h3>
                                    {apiUsage && (
                                        <span className="text-xs text-muted-foreground">
                                            {apiUsage.input_tokens + apiUsage.output_tokens} tokens
                                        </span>
                                    )}
                                </div>

                                {/* Copy Preview */}
                                <div className="mb-4 p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-500/20">
                                    <div className="text-lg font-bold mb-1">{creativePlan.copy.headline}</div>
                                    {creativePlan.copy.subheadline && (
                                        <div className="text-sm text-muted-foreground mb-2">{creativePlan.copy.subheadline}</div>
                                    )}
                                    <div className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                                        {creativePlan.copy.cta}
                                    </div>
                                </div>

                                {/* Composition & Style */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <Badge variant="secondary">{creativePlan.composition}</Badge>
                                    <Badge variant="outline">{creativePlan.style.industry}</Badge>
                                    <Badge variant="outline">{creativePlan.style.tone}</Badge>
                                </div>

                                {/* Elements Summary */}
                                <div className="text-xs text-muted-foreground mb-2">
                                    {creativePlan.elements.length} Elemente · {creativePlan.relations.length} Relations
                                </div>

                                {/* Raw JSON (collapsible) */}
                                <details className="group">
                                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                        Scene Graph JSON anzeigen
                                    </summary>
                                    <pre className="mt-2 p-4 bg-muted/50 rounded-xl text-xs overflow-auto max-h-60 font-mono">
                                        {JSON.stringify(creativePlan, null, 2)}
                                    </pre>
                                </details>

                                {/* Solve Layout Button */}
                                <Button
                                    className="w-full mt-4 gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                                    onClick={handleSolveLayout}
                                    disabled={isSolvingLayout}
                                >
                                    {isSolvingLayout ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Constraints lösen...
                                        </>
                                    ) : (
                                        <>
                                            <Layers className="w-4 h-4" />
                                            Layout berechnen (kiwi.js)
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Solved Layout Preview */}
                    {solvedLayout && (
                        <Card variant="glass" className="overflow-hidden border-blue-500/30">
                            <CardContent className="p-6">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-blue-500" />
                                    Layout gelöst ({solvedLayout.canvasWidth}×{solvedLayout.canvasHeight})
                                </h3>

                                {/* Warnings */}
                                {layoutWarnings.length > 0 && (
                                    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm">
                                        <div className="font-semibold text-amber-500 mb-1">Warnungen:</div>
                                        {layoutWarnings.map((w, i) => (
                                            <div key={i} className="text-xs text-muted-foreground">• {w}</div>
                                        ))}
                                    </div>
                                )}

                                {/* Visual Layout Preview */}
                                <div
                                    className="relative bg-muted/50 rounded-xl overflow-hidden mb-4"
                                    style={{
                                        aspectRatio: `${solvedLayout.canvasWidth}/${solvedLayout.canvasHeight}`,
                                        maxHeight: '400px'
                                    }}
                                >
                                    {Object.entries(solvedLayout.elements).map(([id, el]) => {
                                        const scaleX = 100 / solvedLayout.canvasWidth;
                                        const scaleY = 100 / solvedLayout.canvasHeight;

                                        const colors: Record<string, string> = {
                                            image: 'bg-emerald-500/30 border-emerald-500',
                                            text: 'bg-violet-500/30 border-violet-500',
                                            cta: 'bg-red-500/30 border-red-500',
                                            arrow: 'bg-amber-500/30 border-amber-500',
                                            badge: 'bg-pink-500/30 border-pink-500',
                                            shape: 'bg-blue-500/30 border-blue-500',
                                            table: 'bg-cyan-500/30 border-cyan-500'
                                        };
                                        const colorClass = colors[el.type] || 'bg-gray-500/30 border-gray-500';

                                        return (
                                            <div
                                                key={id}
                                                className={`absolute border-2 rounded flex items-center justify-center text-xs font-mono ${colorClass}`}
                                                style={{
                                                    left: `${el.x * scaleX}%`,
                                                    top: `${el.y * scaleY}%`,
                                                    width: `${el.width * scaleX}%`,
                                                    height: `${el.height * scaleY}%`
                                                }}
                                                title={`${id}: ${el.type} (${el.x}, ${el.y}) ${el.width}×${el.height}`}
                                            >
                                                <span className="truncate px-1">{id}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Layout Data */}
                                <details className="group">
                                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                        Layout JSON anzeigen
                                    </summary>
                                    <pre className="mt-2 p-4 bg-muted/50 rounded-xl text-xs overflow-auto max-h-60 font-mono">
                                        {JSON.stringify(solvedLayout, null, 2)}
                                    </pre>
                                </details>

                                {/* Render Image Button */}
                                <Button
                                    className="w-full mt-4 gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                                    onClick={handleRenderImage}
                                    disabled={isRendering}
                                >
                                    {isRendering ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Bild rendern...
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon className="w-4 h-4" />
                                            Ad rendern (Sharp + SVG)
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Generated Ad Preview */}
                    {generatedAd ? (
                        <Card variant="glass" className="overflow-hidden border-emerald-500/30">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            Generierte Ad
                                        </h3>
                                        {renderTime && (
                                            <span className="text-xs text-muted-foreground">
                                                Gerendert in {renderTime}ms
                                            </span>
                                        )}
                                    </div>
                                    <a
                                        href={generatedAd}
                                        download="llm-generated-ad.png"
                                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </a>
                                </div>
                                <div className="aspect-square bg-muted rounded-xl flex items-center justify-center overflow-hidden">
                                    <img src={generatedAd} alt="Generated Ad" className="max-w-full max-h-full rounded-lg shadow-lg" />
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card variant="glass" className="overflow-hidden">
                            <CardContent className="p-6">
                                <div className="aspect-square bg-muted/30 rounded-xl flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                                        <Wand2 className="w-8 h-8 text-violet-500" />
                                    </div>
                                    <h4 className="font-semibold text-lg mb-2">Bereit zum Generieren</h4>
                                    <p className="text-sm text-muted-foreground max-w-xs">
                                        Beschreibe deine Ad und lade Bilder hoch. Claude analysiert deine Anfrage und erstellt einen strukturierten Creative Plan.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardShell >
    );
});
