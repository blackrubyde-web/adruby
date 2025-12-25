import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Sparkles, ArrowRight, ArrowLeft, Loader2, X, Wand2, Check, Edit3, Save, Zap, AlertCircle, Users, Lightbulb, PartyPopper } from 'lucide-react';
import { AD_TEMPLATES } from './presets';
import useAdBuilder from '../../hooks/useAdBuilder';
import type { AdDocument, StudioLayer } from '../../types/studio';
import type { CreativeOutput, CreativeOutputV1, CreativeOutputPro, CreativeV2Variant } from '../../lib/creative/types';

interface AdWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (document: AdDocument) => void;
}

// Form data structure (from old AdBuilder)
interface FormData {
    brandName: string;
    productName: string;
    productDescription: string;
    targetAudience: string;
    painPoints: string;
    uniqueSellingPoint: string;
    tone: 'professional' | 'playful' | 'bold' | 'luxury' | 'minimal';
    goal: 'conversions' | 'awareness' | 'leads' | 'traffic';
}

interface GeneratedCreative {
    hook: string;
    primaryText: string;
    cta: string;
    score?: number;
}

type WizardStep = 1 | 2 | 3 | 4;

const STEPS = [
    { id: 1, name: 'Identity', icon: Sparkles },
    { id: 2, name: 'Strategy', icon: Users },
    { id: 3, name: 'Magic', icon: Zap },
    { id: 4, name: 'Result', icon: Check },
];

const TONE_OPTIONS = [
    { id: 'professional', label: 'Professionell', emoji: '💼', color: 'from-slate-500 to-slate-700' },
    { id: 'playful', label: 'Spielerisch', emoji: '🎉', color: 'from-pink-500 to-rose-500' },
    { id: 'bold', label: 'Bold', emoji: '🔥', color: 'from-orange-500 to-red-500' },
    { id: 'luxury', label: 'Luxus', emoji: '✨', color: 'from-amber-400 to-amber-600' },
    { id: 'minimal', label: 'Minimal', emoji: '🎯', color: 'from-zinc-400 to-zinc-600' },
];

export const AdWizard = ({ isOpen, onClose, onComplete }: AdWizardProps) => {
    const [step, setStep] = useState<WizardStep>(1);
    const [isExiting, setIsExiting] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({
        brandName: '',
        productName: '',
        productDescription: '',
        targetAudience: '',
        painPoints: '',
        uniqueSellingPoint: '',
        tone: 'professional',
        goal: 'conversions'
    });
    const [generatedCreatives, setGeneratedCreatives] = useState<GeneratedCreative[]>([]);
    const [selectedCreative, setSelectedCreative] = useState<number>(0);
    const [selectedTemplate, setSelectedTemplate] = useState<typeof AD_TEMPLATES[0] | null>(null);
    const [generatedDocument, setGeneratedDocument] = useState<AdDocument | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Use the powerful existing ad builder hook
    const {
        analyze: adBuilderAnalyze,
        generate: adBuilderGenerate,
        result: adBuilderResult,
        status: adBuilderStatus,
        progress: adBuilderProgress,
        error: adBuilderError
    } = useAdBuilder();

    // --- Robustness: Normalization Helpers ---

    const buildFallbackBrief = useCallback(() => {
        const audienceSummary = formData.targetAudience || 'Audience';
        return {
            brand: { name: formData.brandName || formData.productName || 'AdRuby' },
            product: { name: formData.productName || 'Product', url: null, category: null },
            goal: formData.goal,
            funnel_stage: 'cold' as const,
            language: 'de' as const,
            format: '1:1' as const,
            audience: {
                summary: audienceSummary,
                segments: [audienceSummary].filter(Boolean),
            },
            offer: { summary: formData.uniqueSellingPoint || null, constraints: [] },
            tone: 'direct' as const,
            angles: [],
            risk_flags: [],
        };
    }, [formData]);

    const normalizeOutputToV1 = useCallback((output: CreativeOutput | null): CreativeOutputV1 | null => {
        if (!output || typeof output !== 'object') return null;
        if ('version' in output && output.version === '1.0') {
            return output as CreativeOutputV1;
        }
        if ('schema_version' in output && output.schema_version === '2.1-pro') {
            const pro = output as CreativeOutputPro;
            const baseBrief = pro.brief || buildFallbackBrief();
            const creatives = (pro.variants || []).map((variant, idx) => ({
                id: variant.id || `c${idx + 1}`,
                angle_id: variant.id || `angle${idx + 1}`,
                format: variant.format || baseBrief.format,
                copy: {
                    hook: variant.copy.hook || 'Hook',
                    primary_text: variant.copy.primary_text || 'Primary text',
                    cta: variant.copy.cta || 'Mehr erfahren',
                    bullets: variant.copy.bullets || [],
                },
                score: {
                    value: variant.quality?.total ?? 0,
                    rationale:
                        (variant.quality?.issues && variant.quality.issues[0]) ||
                        'Auto-scored variant',
                },
                image: {
                    input_image_used: Boolean(variant.visual?.image?.input_image_used),
                    render_intent: variant.visual?.image?.render_intent || 'Hero image',
                    hero_image_url: variant.visual?.image?.hero_image_url || undefined,
                    hero_image_bucket: variant.visual?.image?.hero_image_bucket || undefined,
                    hero_image_path: variant.visual?.image?.hero_image_path || undefined,
                    final_image_url: variant.visual?.image?.final_image_url || undefined,
                    final_image_bucket: variant.visual?.image?.final_image_bucket || undefined,
                    final_image_path: variant.visual?.image?.final_image_path || undefined,
                    width: variant.visual?.image?.width || undefined,
                    height: variant.visual?.image?.height || undefined,
                    model: variant.visual?.image?.model || undefined,
                    seed: variant.visual?.image?.seed || undefined,
                    prompt_hash: variant.visual?.image?.prompt_hash || undefined,
                    render_version: variant.visual?.image?.render_version || undefined,
                    error: variant.visual?.image?.error || undefined,
                },
            }));
            const angles =
                baseBrief.angles?.length
                    ? baseBrief.angles
                    : creatives.map((c) => ({
                        id: c.angle_id,
                        label: c.copy.hook,
                        why_it_fits: 'Generated variant',
                    }));
            return {
                version: '1.0',
                brief: { ...baseBrief, angles },
                creatives,
            } as CreativeOutputV1;
        }
        if ('schema_version' in output && output.schema_version === '2.0') {
            const baseBrief = buildFallbackBrief();
            const variants = Array.isArray((output as { variants?: unknown[] })?.variants)
                ? (output as { variants?: unknown[] }).variants ?? []
                : [];
            const creatives = variants.map((variantRaw, idx) => {
                const variant =
                    variantRaw && typeof variantRaw === 'object'
                        ? (variantRaw as any)
                        : {};
                return {
                    id: variant.id || `c${idx + 1}`,
                    angle_id: variant.id || `angle${idx + 1}`,
                    format: variant.format || baseBrief.format,
                    copy: {
                        hook: variant.hook || variant?.script?.hook || 'Hook',
                        primary_text:
                            variant?.script?.offer ||
                            variant?.script?.proof ||
                            variant?.script?.problem ||
                            'Primary text',
                        cta: variant.cta || variant?.script?.cta || 'Mehr erfahren',
                        bullets: [],
                    },
                    score: { value: 80, rationale: 'Auto-scored variant' },
                    image: {
                        input_image_used: Boolean(variant?.image?.input_image_used),
                        render_intent: variant?.image?.render_intent || 'Hero image',
                        hero_image_url: variant?.image?.hero_image_url || undefined,
                        hero_image_bucket: variant?.image?.hero_image_bucket || undefined,
                        hero_image_path: variant?.image?.hero_image_path || undefined,
                        final_image_url: variant?.image?.final_image_url || undefined,
                        final_image_bucket: variant?.image?.final_image_bucket || undefined,
                        final_image_path: variant?.image?.final_image_path || undefined,
                        width: variant?.image?.width || undefined,
                        height: variant?.image?.height || undefined,
                        model: variant?.image?.model || undefined,
                        seed: variant?.image?.seed || undefined,
                        prompt_hash: variant?.image?.prompt_hash || undefined,
                        render_version: variant?.image?.render_version || undefined,
                        error: variant?.image?.error || undefined,
                    },
                };
            });
            return {
                version: '1.0',
                brief: { ...baseBrief, angles: baseBrief.angles },
                creatives,
            } as CreativeOutputV1;
        }
        return null;
    }, [buildFallbackBrief]);

    // --- End Robustness Helpers ---

    const updateField = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = useCallback((files: FileList | null) => {
        if (!files?.[0]) return;
        const file = files[0];
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            setUploadedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    }, []);

    const canProceedToStep2 = formData.brandName && formData.productName;
    const canProceedToStep3 = formData.targetAudience || formData.painPoints;

    const goNext = () => {
        if (step === 2) {
            // Start generation when moving to step 3
            startGeneration();
        }
        setStep(prev => Math.min(prev + 1, 4) as WizardStep);
    };

    const goBack = () => {
        setStep(prev => Math.max(prev - 1, 1) as WizardStep);
    };

    const startGeneration = async () => {
        setError(null);

        try {
            // Build FormData for the API
            const fd = new FormData();

            if (uploadedImage) {
                const base64Response = await fetch(uploadedImage);
                const blob = await base64Response.blob();
                fd.append('image', blob, 'product.jpg');
            }

            fd.append('brandName', formData.brandName);
            fd.append('productName', formData.productName);
            fd.append('productDescription', formData.productDescription || formData.productName);
            fd.append('audience', formData.targetAudience);
            fd.append('painPoints', formData.painPoints);
            fd.append('uniqueSellingPoint', formData.uniqueSellingPoint);
            fd.append('tone', formData.tone);
            fd.append('goal', formData.goal);
            fd.append('funnel', 'cold');
            fd.append('language', 'de');
            fd.append('format', 'image');

            // Use the full pipeline
            const analyzeResult = await adBuilderAnalyze(fd);

            if (analyzeResult?.brief) {
                await adBuilderGenerate({
                    brief: analyzeResult.brief,
                    hasImage: !!uploadedImage,
                    imagePath: analyzeResult.image?.path || null,
                    outputMode: 'static',
                    style_mode: formData.tone === 'bold' ? 'bold' : 'modern',
                    platforms: ['facebook', 'instagram'],
                    formats: ['feed']
                });
            }
        } catch (err) {
            console.error('Generation error:', err);
            // Use fallback
            setGeneratedCreatives([
                { hook: 'Das ändert alles...', primaryText: `${formData.productName} löst dein Problem`, cta: 'Jetzt entdecken', score: 85 },
                { hook: 'Endlich eine Lösung', primaryText: `Für ${formData.targetAudience || 'dich'}`, cta: 'Mehr erfahren', score: 78 },
                { hook: `Warum ${formData.brandName}?`, primaryText: formData.uniqueSellingPoint || 'Qualität die überzeugt', cta: 'Jetzt kaufen', score: 72 },
            ]);
        }
    };

    // Watch for results from adBuilderResult and normalize them
    const normalizedResult = normalizeOutputToV1(adBuilderResult);
    const creatives = normalizedResult?.creatives || [];
    const displayCreatives = creatives.length > 0
        ? creatives.map((c: any) => ({
            hook: c.copy?.hook || 'Hook',
            primaryText: c.copy?.primary_text || '',
            cta: c.copy?.cta || 'CTA',
            score: c.score?.value || 0
        }))
        : generatedCreatives;

    // Auto-select template based on form data
    const suggestedTemplates = AD_TEMPLATES.filter(t =>
        t.niche === 'ecommerce' || t.niche === 'saas'
    ).slice(0, 6);

    const generateDocument = (template: typeof AD_TEMPLATES[0], creative: GeneratedCreative) => {
        const doc: AdDocument = {
            ...(template.document as AdDocument),
            id: `ad-${Date.now()}`,
            name: `${formData.brandName} - ${formData.productName}`,
            width: 1080,
            height: 1080
        };

        const layers = [...(doc.layers || [])];

        // Update headline with hook
        const headlineLayer = layers.find(l => l.name?.toLowerCase().includes('headline') || l.name?.toLowerCase().includes('title'));
        if (headlineLayer) {
            (headlineLayer as any).text = creative.hook.toUpperCase();
        }

        // Update CTA
        const ctaLayer = layers.find(l => l.type === 'cta');
        if (ctaLayer) {
            (ctaLayer as any).text = creative.cta.toUpperCase();
        }

        // Add product image
        if (uploadedImage) {
            const productLayer: StudioLayer = {
                id: `product-${Date.now()}`,
                type: 'product',
                name: formData.productName,
                x: 290,
                y: 200,
                width: 500,
                height: 500,
                visible: true,
                locked: false,
                zIndex: 8,
                src: uploadedImage,
                opacity: 1,
                rotation: 0,
                fit: 'contain'
            } as any;
            layers.push(productLayer);
        }

        doc.layers = layers;
        setGeneratedDocument(doc);
        return doc;
    };

    const handleSelectTemplate = (template: typeof AD_TEMPLATES[0]) => {
        setSelectedTemplate(template);
        const creative = displayCreatives[selectedCreative] || displayCreatives[0];
        if (creative) {
            generateDocument(template, creative);
        }
    };

    const handleComplete = () => {
        if (!generatedDocument && selectedTemplate) {
            const creative = displayCreatives[selectedCreative] || displayCreatives[0];
            const doc = generateDocument(selectedTemplate, creative);
            onComplete(doc);
        } else if (generatedDocument) {
            onComplete(generatedDocument);
        }
        handleClose();
    };

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setStep(1);
            setUploadedImage(null);
            setFormData({
                brandName: '',
                productName: '',
                productDescription: '',
                targetAudience: '',
                painPoints: '',
                uniqueSellingPoint: '',
                tone: 'professional',
                goal: 'conversions'
            });
            setGeneratedCreatives([]);
            setSelectedCreative(0);
            setSelectedTemplate(null);
            setGeneratedDocument(null);
            setError(null);
            setIsExiting(false);
            onClose();
        }, 300);
    };

    if (!isOpen) return null;

    const isGenerating = adBuilderStatus === 'analyzing' || adBuilderStatus === 'generating' || adBuilderStatus === 'polling';
    const progress = typeof adBuilderProgress === 'number' ? adBuilderProgress : 0;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            {/* Dark Glass Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                onClick={handleClose}
            ></div>

            {/* Content Card with Premium Glass Effect */}
            <div className={`relative w-full max-w-4xl mx-4 rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-all duration-500 transform border border-white/10 bg-zinc-900/50 backdrop-blur-2xl ${isExiting ? 'scale-95 translate-y-8' : 'scale-100 translate-y-0'} animate-in fade-in zoom-in-95 duration-300`}>

                {/* Ambient Glows */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50"></div>
                <div className="absolute -top-[200px] -right-[200px] w-[500px] h-[500px] bg-violet-600/30 rounded-full blur-[128px] pointer-events-none"></div>
                <div className="absolute -bottom-[200px] -left-[200px] w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[128px] pointer-events-none"></div>

                {/* Header */}
                <div className="p-8 border-b border-white/5 shrink-0 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                                <Sparkles className="w-6 h-6 text-violet-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">AI Ad Builder</h2>
                                <p className="text-sm text-zinc-400 font-medium">Create conversion-focused ads in seconds</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-3 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-all hover:rotate-90 duration-300"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Premium Progress Indicators */}
                    <div className="flex items-center justify-between gap-4 px-2">
                        {STEPS.map((s, i) => (
                            <div key={s.id} className="flex flex-col items-center gap-3 relative flex-1">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 relative z-10 
                                    ${step === s.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/40 ring-4 ring-violet-500/20 scale-110' :
                                            step > s.id ? 'bg-emerald-500 text-white' :
                                                'bg-white/5 text-zinc-600 border border-white/5'}`}
                                >
                                    {step > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${step === s.id ? 'text-white' : 'text-zinc-600'}`}>
                                    {s.name}
                                </span>

                                {/* Connector Line */}
                                {i < STEPS.length - 1 && (
                                    <div className="absolute top-5 left-1/2 w-full h-[2px] -z-0">
                                        <div className="w-full h-full bg-white/5"></div>
                                        <div
                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-violet-500 transition-all duration-700"
                                            style={{ width: step > s.id ? '100%' : '0%' }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 overflow-y-auto flex-1 relative z-10 scrollbar-hide">
                    {/* Step 1: Branding & Identity */}
                    {step === 1 && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in slide-in-from-right-8 fade-in duration-500">
                            {/* Left: Upload */}
                            <div className="lg:col-span-4 space-y-4">
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e.target.files)} />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`aspect-[4/5] rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group relative overflow-hidden
                                    ${uploadedImage ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-violet-500/50 hover:bg-violet-500/5'}`}
                                >
                                    {uploadedImage ? (
                                        <>
                                            <img src={uploadedImage} alt="Uploaded" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 flex flex-col justify-end p-6">
                                                <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-950/30 backdrop-blur-md px-4 py-2 rounded-xl border border-emerald-500/20 w-fit mx-auto">
                                                    <Check className="w-4 h-4" /> Uploaded
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-6 space-y-4">
                                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 border border-white/5">
                                                <Upload className="w-8 h-8 text-zinc-500 group-hover:text-violet-400 transition-colors" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white mb-1">Product Image</p>
                                                <p className="text-xs text-zinc-500">Drop your hero image here</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Inputs */}
                            <div className="lg:col-span-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 group-focus-within:text-violet-400 transition-colors">Brand Name</label>
                                        <input
                                            value={formData.brandName}
                                            onChange={(e) => updateField('brandName', e.target.value)}
                                            placeholder="e.g. AdRuby"
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all hover:bg-black/30"
                                        />
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 group-focus-within:text-violet-400 transition-colors">Product Name</label>
                                        <input
                                            value={formData.productName}
                                            onChange={(e) => updateField('productName', e.target.value)}
                                            placeholder="e.g. Pro Suite"
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all hover:bg-black/30"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 group-focus-within:text-violet-400 transition-colors">Description</label>
                                    <textarea
                                        value={formData.productDescription}
                                        onChange={(e) => updateField('productDescription', e.target.value)}
                                        placeholder="What makes your product special?"
                                        rows={4}
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all hover:bg-black/30 resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Strategy */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-500">
                            <div className="space-y-2 group">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 group-focus-within:text-violet-400 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Target Audience
                                </label>
                                <input
                                    value={formData.targetAudience}
                                    onChange={(e) => updateField('targetAudience', e.target.value)}
                                    placeholder="e.g. Digital Nomads, 25-40"
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all hover:bg-black/30"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 group-focus-within:text-amber-400 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> Pain Points
                                    </label>
                                    <textarea
                                        value={formData.painPoints}
                                        onChange={(e) => updateField('painPoints', e.target.value)}
                                        placeholder="What keeps them up at night?"
                                        rows={3}
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all hover:bg-black/30 resize-none"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 group-focus-within:text-emerald-400 flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4" /> The Solution (USP)
                                    </label>
                                    <textarea
                                        value={formData.uniqueSellingPoint}
                                        onChange={(e) => updateField('uniqueSellingPoint', e.target.value)}
                                        placeholder="Why is your product the answer?"
                                        rows={3}
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all hover:bg-black/30 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Brand Voice</label>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {TONE_OPTIONS.map(tone => (
                                        <button
                                            key={tone.id}
                                            onClick={() => updateField('tone', tone.id)}
                                            className={`relative group overflow-hidden rounded-2xl border transition-all duration-300 ${formData.tone === tone.id
                                                ? 'border-white/20 ring-2 ring-violet-500/50'
                                                : 'border-white/5 hover:border-white/20 bg-black/20'
                                                }`}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br ${tone.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                                            {formData.tone === tone.id && (
                                                <div className={`absolute inset-0 bg-gradient-to-br ${tone.color} opacity-20`}></div>
                                            )}
                                            <div className="p-4 flex flex-col items-center gap-2 relative z-10">
                                                <span className="text-2xl">{tone.emoji}</span>
                                                <span className={`text-xs font-bold ${formData.tone === tone.id ? 'text-white' : 'text-zinc-400'}`}>{tone.label}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Generation - Premium Loading State */}
                    {step === 3 && (
                        <div className="py-12 flex flex-col items-center justify-center min-h-[400px] animate-in fade-in duration-700">
                            {isGenerating ? (
                                <div className="relative">
                                    {/* Pulsing Orb */}
                                    <div className="w-48 h-48 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 blur-[80px] animate-pulse opacity-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="relative w-32 h-32 mx-auto mb-8">
                                        <div className="absolute inset-0 rounded-full border-4 border-white/10 border-t-violet-500 animate-spin" style={{ animationDuration: '3s' }}></div>
                                        <div className="absolute inset-0 rounded-full border-4 border-white/5 border-b-fuchsia-500 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Zap className="w-10 h-10 text-white drop-shadow-[0_0_15px_rgba(167,139,250,0.5)] animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-black text-white tracking-tight">Constructing Creative</h3>
                                        <p className="text-zinc-400 text-sm font-medium animate-pulse">
                                            {adBuilderStatus === 'analyzing' && 'Analyzing market patterns...'}
                                            {adBuilderStatus === 'generating' && 'Synthesizing copy & visuals...'}
                                            {adBuilderStatus === 'polling' && 'Polishing final assets...'}
                                        </p>
                                    </div>
                                    {progress > 0 && (
                                        <div className="w-64 h-1 bg-white/5 rounded-full mx-auto mt-8 overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    )}
                                </div>
                            ) : displayCreatives.length > 0 ? (
                                <div className="w-full space-y-6">
                                    <div className="text-center mb-8">
                                        <PartyPopper className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                                        <h3 className="text-2xl font-black text-white">Winning Angles Generated</h3>
                                        <p className="text-zinc-400">Select the hook that resonates most</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {displayCreatives.map((creative, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedCreative(i)}
                                                className={`p-6 rounded-2xl text-left transition-all duration-300 group border relative overflow-hidden ${selectedCreative === i
                                                    ? 'bg-violet-500/10 border-violet-500/50 ring-1 ring-violet-500/30'
                                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                                    }`}
                                            >
                                                {selectedCreative === i && (
                                                    <div className="absolute top-0 right-0 p-3">
                                                        <div className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.8)]"></div>
                                                    </div>
                                                )}
                                                <div className="space-y-2 relative z-10">
                                                    <h4 className="font-bold text-lg text-white leading-tight group-hover:text-violet-200 transition-colors">"{creative.hook}"</h4>
                                                    <p className="text-sm text-zinc-400 line-clamp-2">{creative.primaryText}</p>

                                                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-black/20 px-2 py-1 rounded-md">{creative.cta}</span>
                                                        {creative.score && (
                                                            <div className="flex items-center gap-1.5">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${creative.score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                                                <span className={`text-xs font-bold ${creative.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                                    {creative.score}% Score
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <button
                                        onClick={startGeneration}
                                        className="mt-4 px-12 py-6 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-2xl font-black text-lg shadow-[0_20px_40px_-15px_rgba(139,92,246,0.5)] hover:shadow-[0_25px_50px_-12px_rgba(139,92,246,0.6)] hover:scale-105 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Sparkles className="w-6 h-6 animate-pulse" />
                                            Ignite AI Generation
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Template & Preview */}
                    {step === 4 && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full animate-in slide-in-from-right-8 fade-in duration-500">
                            {/* Templates List */}
                            <div className="lg:col-span-4 space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 sticky top-0 bg-transparent backdrop-blur-sm py-2 z-10">Select Style</h3>
                                <div className="grid grid-cols-2 gap-3 pb-4">
                                    {suggestedTemplates.map(template => (
                                        <button
                                            key={template.id}
                                            onClick={() => handleSelectTemplate(template)}
                                            className={`p-1.5 rounded-xl border-2 transition-all duration-300 group ${selectedTemplate?.id === template.id
                                                ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                                                : 'border-white/5 hover:border-white/20 bg-black/20'
                                                }`}
                                        >
                                            <div
                                                className="aspect-square rounded-lg mb-2 overflow-hidden relative"
                                                style={{ backgroundColor: template.document.backgroundColor || '#1a1a1a' }}
                                            >
                                                {/* Mini Preview Placeholder */}
                                                <div className="absolute inset-0 opacity-50 bg-gradient-to-br from-white/5 to-transparent"></div>
                                            </div>
                                            <p className={`text-[10px] font-bold text-center mb-1 ${selectedTemplate?.id === template.id ? 'text-violet-300' : 'text-zinc-500'}`}>{template.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Live Preview Area */}
                            <div className="lg:col-span-8 flex flex-col items-center justify-center bg-black/20 rounded-3xl border border-white/5 p-8 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1),transparent_70%)]"></div>

                                {selectedTemplate && generatedDocument ? (
                                    <div className="relative z-10 flex flex-col items-center gap-6">
                                        <div className="aspect-square w-full max-w-[380px] rounded-sm shadow-2xl overflow-hidden border border-white/10 relative group"
                                            style={{ backgroundColor: generatedDocument.backgroundColor }}
                                        >
                                            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center relative z-10">
                                                {uploadedImage && <img src={uploadedImage} className="w-32 h-32 object-contain mb-6 drop-shadow-2xl" />}
                                                <h1 className="text-3xl font-black text-white leading-tight mb-4 drop-shadow-lg">{displayCreatives[selectedCreative]?.hook.toUpperCase() || 'HEADLINE'}</h1>
                                                <button className="px-6 py-2 bg-yellow-400 text-black font-black text-sm uppercase tracking-wider rounded-full shadow-lg transform group-hover:scale-105 transition-transform">
                                                    {displayCreatives[selectedCreative]?.cta || 'CTA'}
                                                </button>
                                            </div>
                                            {/* Grid Overlay Effect */}
                                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                                        </div>
                                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Live Preview</p>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-4 opacity-50">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-dashed border-white/20">
                                            <Wand2 className="w-6 h-6 text-zinc-500" />
                                        </div>
                                        <p className="text-sm text-zinc-500">Select a style to generate preview</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mt-6 animate-in slide-in-from-bottom-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer Toolbar */}
                <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-md shrink-0 flex justify-between items-center relative z-20">
                    <button
                        onClick={step === 1 ? handleClose : goBack}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={goNext}
                            disabled={(step === 1 && !canProceedToStep2) || (step === 3 && isGenerating)}
                            className="group flex items-center gap-3 px-8 py-3 bg-white text-black rounded-xl font-black hover:bg-violet-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:shadow-none"
                        >
                            Continue
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    ) : (
                        <div className="flex gap-4">
                            <button
                                onClick={handleComplete}
                                disabled={!selectedTemplate}
                                className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-xl font-bold text-zinc-300 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit in Studio
                            </button>
                            <button
                                onClick={handleComplete}
                                disabled={!selectedTemplate}
                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-black shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <Save className="w-4 h-4" />
                                Save Creative
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
