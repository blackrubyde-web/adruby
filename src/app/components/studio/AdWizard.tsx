import { useState, useRef, useCallback } from 'react';
import { Upload, Sparkles, ArrowRight, X, Wand2, Check, Zap, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AD_TEMPLATES } from './presets';
import type { AdDocument, StudioLayer } from '../../types/studio';
import { enhanceProductImage } from '../../lib/api/ai-image-enhancement';

interface AdWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (document: AdDocument) => void;
}

// Form data structure
interface FormData {
    brandName: string;
    productName: string;
    productDescription: string;
    imageEnhancementPrompt: string;
    painPoints: string;
    usps: string;
    targetAudience: string;
    tone: 'professional' | 'playful' | 'bold' | 'luxury' | 'minimal';
}

interface GeneratedHooks {
    headlines: string[];
    descriptions: string[];
    ctas: string[];
}

type WizardStep = 1 | 2 | 3 | 4;

const STEPS = [
    { id: 1, name: 'Produkt', icon: Sparkles },
    { id: 2, name: 'Stil', icon: Wand2 },
    { id: 3, name: 'Copy', icon: Zap },
    { id: 4, name: 'Vorschau', icon: Check },
];

const TONE_OPTIONS = [
    { id: 'professional', label: 'Professionell', emoji: '💼', color: 'from-slate-500 to-slate-700', bg: 'bg-slate-100 dark:bg-slate-900/50' },
    { id: 'playful', label: 'Spielerisch', emoji: '🎉', color: 'from-pink-500 to-rose-500', bg: 'bg-pink-100 dark:bg-pink-900/50' },
    { id: 'bold', label: 'Bold', emoji: '🔥', color: 'from-orange-500 to-red-500', bg: 'bg-orange-100 dark:bg-orange-900/50' },
    { id: 'luxury', label: 'Luxus', emoji: '✨', color: 'from-amber-400 to-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/50' },
    { id: 'minimal', label: 'Minimal', emoji: '🎯', color: 'from-zinc-400 to-zinc-600', bg: 'bg-zinc-100 dark:bg-zinc-900/50' },
];

export const AdWizard = ({ isOpen, onClose, onComplete }: AdWizardProps) => {
    const [step, setStep] = useState<WizardStep>(1);
    const [isExiting, setIsExiting] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({
        brandName: '',
        productName: '',
        productDescription: '',
        imageEnhancementPrompt: '',
        painPoints: '',
        usps: '',
        targetAudience: '',
        tone: 'professional',
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingStep, setLoadingStep] = useState<'idle' | 'image' | 'hooks' | 'creating'>('idle');
    const [generatedHooks, setGeneratedHooks] = useState<GeneratedHooks | null>(null);
    const [selectedHookIndex, setSelectedHookIndex] = useState(0);
    const [generatedDoc, setGeneratedDoc] = useState<AdDocument | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateField = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = useCallback((files: FileList | null) => {
        if (!files?.[0]) return;
        const file = files[0];

        // File type validation
        if (!file.type.startsWith('image/')) {
            toast.error('Nur Bilder erlaubt (JPG, PNG, WebP)');
            return;
        }

        // File size validation (5MB max)
        const maxSizeBytes = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSizeBytes) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
            toast.error(`Bild zu groß! (${sizeMB}MB). Max 5MB erlaubt.`);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setUploadedImage(e.target?.result as string);
            toast.success('Bild erfolgreich hochgeladen');
        };
        reader.onerror = () => {
            toast.error('Fehler beim Laden des Bildes');
        };
        reader.readAsDataURL(file);
    }, []);

    const canProceedToStep2 = formData.productName.trim().length > 0;
    const canProceedToStep3 = canProceedToStep2 && formData.tone;
    const canProceedToStep4 = canProceedToStep3; // Step 3 fields are optional

    const goNext = () => {
        if (step < 4) {
            setStep(prev => (prev + 1) as WizardStep);
        }
    };

    const goBack = () => {
        if (step > 1) {
            setStep(prev => (prev - 1) as WizardStep);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setLoadingStep('image');

        try {
            // PREMIUM AI IMAGE ENHANCEMENT
            let finalImage = uploadedImage;

            if (uploadedImage && formData.imageEnhancementPrompt.trim()) {
                console.log('🎨 Starting PREMIUM AI image enhancement...');
                toast.info('Analysiere Bild...');

                try {
                    const enhancementResult = await enhanceProductImage({
                        imageBase64: uploadedImage,
                        userPrompt: formData.imageEnhancementPrompt,
                        productName: formData.productName,
                        brandName: formData.brandName,
                        tone: formData.tone
                    });

                    finalImage = enhancementResult.enhancedImageUrl;
                    console.log('✅ Premium image generated:', enhancementResult.analysisNotes);
                } catch (imageError: any) {
                    console.error('Image enhancement failed:', imageError);
                    toast.warning('Bild-Verbesserung übersprungen. Nutze Original-Bild.');
                    // Continue with original image instead of failing completely
                }
            }

            // HOOK GENERATION - Premium Ad Copy
            setLoadingStep('hooks');
            console.log('✍️ Generating premium ad hooks...');
            toast.info('Generiere Premium Hooks...');

            const hookPrompt = `You are an ELITE copywriter for premium advertising. Generate high-converting ad copy.

PRODUCT CONTEXT:
- Product: ${formData.productName}
${formData.brandName ? `- Brand: ${formData.brandName}` : ''}
- Description: ${formData.productDescription || 'N/A'}
- Pain Points: ${formData.painPoints || 'N/A'}
- Unique Selling Points: ${formData.usps || 'N/A'}
- Target Audience: ${formData.targetAudience || 'General public'}
- Tone: ${formData.tone}

REQUIREMENTS:
- Headlines: 10 attention-grabbing, conversion-optimized headlines (max 8 words each)
- Descriptions: 5 compelling short descriptions that highlight benefits (max 12 words each)
- CTAs: 5 action-oriented call-to-actions (max 3 words each)

Make it PREMIUM, ${formData.tone}, and irresistible. Focus on emotional triggers and value propositions.

Generate this EXACT JSON structure:
{
  "headlines": ["headline 1", "headline 2", ...],
  "descriptions": ["description 1", "description 2", ...],
  "ctas": ["CTA 1", "CTA 2", ...]
}`;

            const hooksResponse = await fetch('/.netlify/functions/openai-proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    endpoint: 'chat/completions',
                    model: 'gpt-4o',
                    messages: [{ role: 'user', content: hookPrompt }],
                    temperature: 0.9,
                    response_format: { type: 'json_object' }
                })
            });

            if (!hooksResponse.ok) {
                const errorData = await hooksResponse.json().catch(() => ({}));

                // Specific error handling
                if (hooksResponse.status === 401) {
                    throw new Error('API_KEY_MISSING');
                } else if (hooksResponse.status === 429) {
                    throw new Error('RATE_LIMIT');
                } else {
                    throw new Error(errorData.error?.message || 'Hook generation failed');
                }
            }

            const hooksData = await hooksResponse.json();
            const hooks: GeneratedHooks = JSON.parse(hooksData.choices[0].message.content);

            // Validate hooks
            if (!hooks.headlines?.length || hooks.headlines.length === 0) {
                throw new Error('EMPTY_HOOKS');
            }

            setGeneratedHooks(hooks);
            console.log('✅ Premium hooks generated:', hooks.headlines.length, 'headlines');

            // CREATE AD DOCUMENT
            setLoadingStep('creating');
            toast.info('Erstelle Ad...');
            // Create ad document
            const selectedTone = TONE_OPTIONS.find(t => t.id === formData.tone);
            const doc: AdDocument = {
                id: `ad-${Date.now()}`,
                name: `${formData.brandName || formData.productName} Ad`,
                width: 1080,
                height: 1080,
                backgroundColor: formData.tone === 'minimal' ? '#ffffff' : '#000000',
                layers: [
                    // Professional Image Setup: Background Blur + Product Focus
                    ...(finalImage ? [
                        // Layer 1: Blurred Background
                        {
                            id: `bg-blur-${Date.now()}`,
                            type: 'background',
                            name: 'Background Blur',
                            x: 0,
                            y: 0,
                            width: 1080,
                            height: 1080,
                            rotation: 0,
                            opacity: 0.3,
                            locked: false,
                            visible: true,
                            src: finalImage,
                            fit: 'cover',
                            blur: 40
                        },
                        // Layer 2: Gradient Overlay
                        {
                            id: `overlay-${Date.now()}`,
                            type: 'overlay',
                            name: 'Gradient Overlay',
                            x: 0,
                            y: 0,
                            width: 1080,
                            height: 1080,
                            rotation: 0,
                            opacity: 0.6,
                            locked: false,
                            visible: true,
                            fill: formData.tone === 'minimal' ? '#ffffff' : '#000000'
                        },
                        // Layer 3: Product Image (Centered & Framed)
                        {
                            id: `product-${Date.now()}`,
                            type: 'product',
                            name: 'Product Image',
                            x: 140,
                            y: 400,
                            width: 800,
                            height: 500,
                            rotation: 0,
                            opacity: 1,
                            locked: false,
                            visible: true,
                            src: finalImage,
                            fit: 'contain',
                            shadowColor: 'rgba(0,0,0,0.3)',
                            shadowBlur: 30,
                            shadowOffsetY: 10
                        }
                    ] : []),
                    // Headline
                    {
                        id: `text-${Date.now()}`,
                        type: 'text' as const,
                        name: 'Headline',
                        x: 80,
                        y: 150,
                        width: 920,
                        height: 200,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        visible: true,
                        text: hooks.headlines[0],
                        fontSize: 96,
                        fontFamily: 'Inter',
                        fontWeight: '900',
                        color: formData.tone === 'minimal' ? '#000000' : '#ffffff',
                        align: 'left',
                        lineHeight: 1.1,
                        shadowColor: formData.tone === 'minimal' ? 'transparent' : 'rgba(0,0,0,0.5)',
                        shadowBlur: 20
                    },
                    // Description
                    ...(formData.productDescription ? [{
                        id: `desc-${Date.now()}`,
                        type: 'text' as const,
                        name: 'Description',
                        x: 80,
                        y: 400,
                        width: 920,
                        height: 150,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        visible: true,
                        text: formData.productDescription,
                        fontSize: 32,
                        fontFamily: 'Inter',
                        fontWeight: '400',
                        color: formData.tone === 'minimal' ? '#333333' : '#e0e0e0',
                        align: 'left',
                        lineHeight: 1.4
                    }] : []),
                    // CTA Button
                    {
                        id: `cta-${Date.now()}`,
                        type: 'cta' as const,
                        name: 'CTA',
                        x: 80,
                        y: 880,
                        width: 400,
                        height: 100,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        visible: true,
                        text: 'JETZT ENTDECKEN',
                        fontSize: 24,
                        fontFamily: 'Inter',
                        fontWeight: '700',
                        color: '#ffffff',
                        bgColor: formData.tone === 'luxury' ? '#d4af37' : '#000000',
                        radius: 50,
                        shadowColor: 'rgba(0,0,0,0.3)',
                        shadowBlur: 15,
                        shadowOffsetY: 5
                    }
                ] as any as StudioLayer[]
            };

            setGeneratedDoc(doc);
            setIsGenerating(false);
            setStep(4); // Go to preview instead of directly to canvas
            // Parent (StudioPage) handles view transition after preview
        } catch (error) {
            console.error('❌ Ad generation failed:', error);
            setIsGenerating(false);
            setLoadingStep('idle');

            // Specific error messages
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            if (errorMessage === 'API_KEY_MISSING') {
                toast.error('OpenAI API Key fehlt! Bitte in Netlify ENV setzen: VITE_OPENAI_API_KEY');
            } else if (errorMessage === 'RATE_LIMIT') {
                toast.error('Zu viele Anfragen! Bitte warte 1 Minute und versuche es erneut.');
            } else if (errorMessage === 'EMPTY_HOOKS') {
                toast.error('KI konnte keine Hooks generieren. Bitte füge mehr Details hinzu.');
            } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
                toast.error('Netzwerk-Fehler. Bitte Internetverbindung prüfen.');
            } else {
                toast.error(`Ad-Generierung fehlgeschlagen: ${errorMessage.substring(0, 100)}`);
            }
        }
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
                imageEnhancementPrompt: '',
                painPoints: '',
                usps: '',
                targetAudience: '',
                tone: 'professional',
            });
            setIsExiting(false);
            onClose();
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xl"
                onClick={handleClose}
            />

            {/* Content Card */}
            <div className={`relative w-full max-w-3xl mx-4 rounded-3xl shadow-2xl overflow-hidden h-[90vh] flex flex-col transition-all duration-500 transform border border-border bg-background ${isExiting ? 'scale-95 translate-y-8' : 'scale-100 translate-y-0'}`}>

                {/* Header */}
                <div className="p-4 md:p-6 border-b border-border shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 border border-primary/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground">AI Ad Builder</h2>
                                <p className="text-xs md:text-sm text-muted-foreground font-medium">Erstelle deine perfekte Ad in Sekunden</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-all"
                        >
                            <X className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between gap-2 md:gap-4">
                        {STEPS.map((s, i) => (
                            <div key={s.id} className="flex flex-col items-center gap-2 md:gap-3 relative flex-1">
                                <div
                                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-all duration-500 relative z-10 ${step === s.id
                                        ? 'bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20 scale-110'
                                        : step > s.id
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-muted text-muted-foreground border border-border'
                                        }`}
                                >
                                    {step > s.id ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <s.icon className="w-3 h-3 md:w-4 md:h-4" />}
                                </div>
                                <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${step === s.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {s.name}
                                </span>

                                {/* Connector Line */}
                                {i < STEPS.length - 1 && (
                                    <div className="absolute top-4 md:top-5 left-1/2 w-full h-[2px] -z-0">
                                        <div className="w-full h-full bg-border" />
                                        <div
                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-primary transition-all duration-700"
                                            style={{ width: step > s.id ? '100%' : '0%' }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-4 md:p-6 overflow-y-auto flex-1">
                    {/* Step 1: Product Info */}
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 animate-in slide-in-from-right-8 fade-in duration-500">
                            {/* Left: Upload */}
                            <div className="md:col-span-5 space-y-4">
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e.target.files)} />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group relative overflow-hidden ${uploadedImage
                                        ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10'
                                        : 'border-border hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10'
                                        }`}
                                >
                                    {uploadedImage ? (
                                        <>
                                            <img src={uploadedImage} alt="Uploaded" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 dark:to-black/80 flex flex-col justify-end p-6">
                                                <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-950/50 dark:bg-emerald-950/70 backdrop-blur-md px-4 py-2 rounded-xl border border-emerald-500/20 w-fit mx-auto">
                                                    <Check className="w-4 h-4" /> Hochgeladen
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-6 space-y-4">
                                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted dark:bg-muted/50 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 border border-border">
                                                <Upload className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm md:text-base text-foreground mb-1">Produkt Bild</p>
                                                <p className="text-xs text-muted-foreground">Optional: Lade dein Hero-Image hoch</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Inputs */}
                            <div className="md:col-span-7 space-y-4 md:space-y-6">
                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">
                                        Produkt Name *
                                    </label>
                                    <input
                                        value={formData.productName}
                                        onChange={(e) => updateField('productName', e.target.value)}
                                        placeholder="z.B. Pro Suite, Air Max, Premium Coffee"
                                        className="w-full bg-muted/50 dark:bg-muted/30 border border-border rounded-xl px-4 md:px-5 py-3 md:py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all hover:bg-muted/70 dark:hover:bg-muted/50"
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">
                                        Brand Name (Optional)
                                    </label>
                                    <input
                                        value={formData.brandName}
                                        onChange={(e) => updateField('brandName', e.target.value)}
                                        placeholder="z.B. AdRuby, Nike, Starbucks"
                                        className="w-full bg-muted/50 dark:bg-muted/30 border border-border rounded-xl px-4 md:px-5 py-3 md:py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all hover:bg-muted/70 dark:hover:bg-muted/50"
                                    />
                                </div>

                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">
                                        Beschreibung (Optional)
                                    </label>
                                    <textarea
                                        value={formData.productDescription}
                                        onChange={(e) => updateField('productDescription', e.target.value)}
                                        placeholder="Was macht dein Produkt besonders?"
                                        rows={3}
                                        className="w-full bg-muted/50 dark:bg-muted/30 border border-border rounded-xl px-4 md:px-5 py-3 md:py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all hover:bg-muted/70 dark:hover:bg-muted/50 resize-none"
                                    />
                                </div>

                                {/* AI Image Enhancement - Only show if image uploaded */}
                                {uploadedImage && (
                                    <div className="space-y-2 group relative">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors flex items-center gap-2">
                                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                                            KI Bild-Verbesserung (Optional)
                                        </label>
                                        <textarea
                                            value={formData.imageEnhancementPrompt}
                                            onChange={(e) => updateField('imageEnhancementPrompt', e.target.value)}
                                            placeholder="z.B. 'Entferne Hintergrund, füge professionellen Studio-Hintergrund hinzu, verbessere Beleuchtung und Farben für Premium-Look'"
                                            rows={3}
                                            className="w-full bg-gradient-to-br from-primary/5 to-red-500/5 dark:from-primary/10 dark:to-red-500/10 border border-primary/30 rounded-xl px-4 md:px-5 py-3 md:py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all hover:border-primary/50 resize-none"
                                        />
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                            <Sparkles className="w-3 h-3" />
                                            Die KI optimiert dein Bild für professionelle Ad-Qualität
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Style Selection */}
                    {step === 2 && (
                        <div className="space-y-6 md:space-y-8 animate-in slide-in-from-right-8 fade-in duration-500">
                            <div className="text-center space-y-2">
                                <h3 className="text-lg md:text-xl font-bold text-foreground">Wähle deinen Stil</h3>
                                <p className="text-sm text-muted-foreground">Der Stil bestimmt das Look & Feel deiner Ad</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                                {TONE_OPTIONS.map(tone => (
                                    <button
                                        key={tone.id}
                                        onClick={() => updateField('tone', tone.id)}
                                        className={`relative group overflow-hidden rounded-2xl border-2 transition-all duration-300 ${formData.tone === tone.id
                                            ? 'border-primary ring-4 ring-primary/20 scale-105'
                                            : 'border-border hover:border-primary/50 hover:scale-102'
                                            }`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${tone.color} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity`} />
                                        {formData.tone === tone.id && (
                                            <div className={`absolute inset-0 bg-gradient-to-br ${tone.color} opacity-10 dark:opacity-20`} />
                                        )}
                                        <div className={`p-4 md:p-6 flex flex-col items-center gap-2 md:gap-3 relative z-10 ${tone.bg}`}>
                                            <span className="text-3xl md:text-4xl">{tone.emoji}</span>
                                            <span className={`text-xs md:text-sm font-bold ${formData.tone === tone.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {tone.label}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Copy & Hooks */}
                    {step === 3 && (
                        <div className="space-y-6 md:space-y-8 animate-in slide-in-from-right-8 fade-in duration-500">
                            <div className="text-center space-y-2 mb-8">
                                <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                                    Beschreibe dein Produkt <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-600">genauer</span>
                                </h3>
                                <p className="text-sm md:text-base text-muted-foreground">
                                    Die KI erstellt daraus perfekte Headlines, Beschreibungen & CTAs
                                </p>
                            </div>

                            <div className="space-y-6">
                                {/* Pain Points */}
                                <div className="space-y-3 group">
                                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <Zap className="w-4 h-4 text-rose-500" />
                                        Welche Probleme löst dein Produkt?
                                    </label>
                                    <textarea
                                        value={formData.painPoints}
                                        onChange={(e) => updateField('painPoints', e.target.value)}
                                        placeholder="z.B. 'Zeitverschwendung bei manueller Dateneingabe, hohe Fehlerquote, komplizierte Tools'"
                                        rows={3}
                                        maxLength={500}
                                        className="w-full bg-muted/50 dark:bg-muted/30 border border-border rounded-xl px-4 md:px-5 py-3 md:py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all hover:bg-muted/70 dark:hover:bg-muted/50 resize-none text-sm"
                                    />
                                </div>

                                {/* USPs */}
                                <div className="space-y-3 group">
                                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                        Was macht dein Produkt einzigartig?
                                    </label>
                                    <textarea
                                        value={formData.usps}
                                        onChange={(e) => updateField('usps', e.target.value)}
                                        placeholder="z.B. '10x schneller als Konkurrenz, KI-powered, 99.9% Genauigkeit, keine Vorkenntnisse nötig'"
                                        rows={3}
                                        maxLength={500}
                                        className="w-full bg-muted/50 dark:bg-muted/30 border border-border rounded-xl px-4 md:px-5 py-3 md:py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all hover:bg-muted/70 dark:hover:bg-muted/50 resize-none text-sm"
                                    />
                                </div>

                                {/* Target Audience */}
                                <div className="space-y-3 group">
                                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                        Wer ist deine Zielgruppe?
                                    </label>
                                    <input
                                        value={formData.targetAudience}
                                        onChange={(e) => updateField('targetAudience', e.target.value)}
                                        placeholder="z.B. 'Marketing Manager in B2B SaaS, 25-45 Jahre, technik-affin'"
                                        maxLength={200}
                                        className="w-full bg-muted/50 dark:bg-muted/30 border border-border rounded-xl px-4 md:px-5 py-3 md:py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all hover:bg-muted/70 dark:hover:bg-muted/50 text-sm"
                                    />
                                </div>

                                <div className="pt-2 flex items-center gap-3 p-4 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-950/20 dark:to-blue-950/20 border border-cyan-200/50 dark:border-cyan-800/30 rounded-xl">
                                    <Sparkles className="w-5 h-5 text-cyan-500 shrink-0" />
                                    <p className="text-xs text-cyan-900 dark:text-cyan-100">
                                        Je detaillierter deine Angaben, desto bessere Headlines und Texte generiert die KI!
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Preview & Hook Selection */}
                    {step === 4 && generatedDoc && generatedHooks ? (
                        <div className="py-4 md:py-6 space-y-6 animate-in fade-in duration-500 h-full overflow-hidden">
                            <div className="text-center space-y-1 mb-4">
                                <h3 className="text-xl md:text-2xl font-black text-foreground flex items-center justify-center gap-3">
                                    <Sparkles className="w-6 h-6 text-primary" />
                                    Deine Ad ist fertig!
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Wähle die besten Hooks für deine Kampagne
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px] overflow-y-auto">
                                {/* Left: Simplified Ad Preview */}
                                <div className="lg:col-span-7 space-y-4">
                                    <div className="aspect-square rounded-2xl overflow-hidden border-2 border-border shadow-2xl" style={{ backgroundColor: generatedDoc.backgroundColor }}>
                                        <div className="relative w-full h-full p-16 flex flex-col">
                                            {/* Headline */}
                                            <h2 className="text-6xl font-black leading-tight mb-auto" style={{
                                                color: formData.tone === 'minimal' ? '#000000' : '#ffffff'
                                            }}>
                                                {generatedHooks.headlines[selectedHookIndex]}
                                            </h2>

                                            {/* Description */}
                                            <p className="text-2xl mb-8" style={{
                                                color: formData.tone === 'minimal' ? '#333333' : '#e0e0e0'
                                            }}>
                                                {generatedHooks.descriptions[Math.min(selectedHookIndex, generatedHooks.descriptions.length - 1)]}
                                            </p>

                                            {/* CTA Button */}
                                            <div className="px-12 py-6 bg-black dark:bg-white text-white dark:text-black rounded-full text-2xl font-bold shadow-2xl inline-block self-start">
                                                {generatedHooks.ctas[Math.min(selectedHookIndex, generatedHooks.ctas.length - 1)]}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Hooks Panel */}
                                <div className="lg:col-span-5 space-y-6 overflow-y-auto pr-2">
                                    {/* Headlines */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-rose-500" />
                                            Headlines ({generatedHooks.headlines.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {generatedHooks.headlines.map((headline, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setSelectedHookIndex(i)}
                                                    className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 ${selectedHookIndex === i
                                                        ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20'
                                                        : 'border-border hover:border-primary/50 bg-muted/30 dark:bg-muted/10'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${selectedHookIndex === i
                                                            ? 'border-primary bg-primary'
                                                            : 'border-border bg-background'
                                                            }`}>
                                                            {selectedHookIndex === i && (
                                                                <Check className="w-3 h-3 text-white" />
                                                            )}
                                                        </div>
                                                        <span className="text-sm font-medium text-foreground leading-relaxed">
                                                            {headline}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Descriptions */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-amber-500" />
                                            Beschreibungen ({generatedHooks.descriptions.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {generatedHooks.descriptions.map((desc, i) => (
                                                <div
                                                    key={i}
                                                    className="p-3 rounded-lg border border-border bg-muted/20 text-xs text-muted-foreground leading-relaxed"
                                                >
                                                    {desc}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CTAs */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <Check className="w-4 h-4 text-emerald-500" />
                                            CTAs ({generatedHooks.ctas.length})
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {generatedHooks.ctas.map((cta, i) => (
                                                <div
                                                    key={i}
                                                    className="px-4 py-2 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold"
                                                >
                                                    {cta}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={() => onComplete(generatedDoc)}
                                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-red-600 text-white rounded-xl font-bold text-base hover:shadow-lg hover:shadow-primary/30 transition-all group"
                                >
                                    <span>Zur Bearbeitung im Canvas</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ) : step === 4 ? (
                        // Loading state while generating
                        <div className="py-8 md:py-12 flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] animate-in fade-in duration-700 space-y-6 md:space-y-8">
                            {isGenerating ? (
                                <div className="relative text-center space-y-6">
                                    {/* Pulsing Orb */}
                                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-r from-primary to-red-600 blur-[60px] md:blur-[80px] animate-pulse opacity-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                    <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 md:mb-8">
                                        <div className="absolute inset-0 rounded-full border-4 border-border border-t-primary animate-spin" style={{ animationDuration: '3s' }} />
                                        <div className="absolute inset-0 rounded-full border-4 border-border border-b-red-500 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Zap className="w-8 h-8 md:w-10 md:h-10 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)] animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Erstelle deine Ad...</h3>
                                        <p className="text-sm md:text-base text-muted-foreground font-medium animate-pulse">
                                            {loadingStep === 'image' && 'Analysiere & verbessere Bild...'}
                                            {loadingStep === 'hooks' && 'Generiere Headlines & Texte...'}
                                            {loadingStep === 'creating' && 'Erstelle finales Ad-Design...'}
                                            {loadingStep === 'idle' && 'KI generiert perfekte Layouts & Texte'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-6 md:space-y-8 max-w-md">
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto border-2 border-primary/20">
                                        <Wand2 className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xl md:text-2xl font-black text-foreground">Bereit zum Erstellen!</h3>
                                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                                            Deine Ad wird mit KI generiert und direkt im Canvas Editor geöffnet, wo du sie weiter anpassen kannst.
                                        </p>
                                    </div>
                                    <div className="bg-muted/50 dark:bg-muted/30 rounded-xl p-4 md:p-6 space-y-2 border border-border">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Produkt:</span>
                                            <span className="font-bold text-foreground">{formData.productName}</span>
                                        </div>
                                        {formData.brandName && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Brand:</span>
                                                <span className="font-bold text-foreground">{formData.brandName}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Stil:</span>
                                            <span className="font-bold text-foreground capitalize">{formData.tone}</span>
                                        </div>
                                        {uploadedImage && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Bild:</span>
                                                <span className="font-bold text-emerald-500 flex items-center gap-1">
                                                    <Check className="w-4 h-4" /> Hochgeladen
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-4 md:p-6 border-t border-border bg-muted/30 dark:bg-muted/20 backdrop-blur-md shrink-0 flex justify-between items-center">
                    <button
                        onClick={step === 1 ? handleClose : goBack}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-sm md:text-base text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {step === 1 ? 'Abbrechen' : 'Zurück'}
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={goNext}
                            disabled={(step === 1 && !canProceedToStep2) || (step === 2 && !canProceedToStep3) || (step === 3 && !canProceedToStep4)}
                            className="group flex items-center gap-2 md:gap-3 px-6 md:px-8 py-2.5 md:py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm md:text-base hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            Weiter
                            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    ) : (
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="flex items-center gap-2 md:gap-3 px-6 md:px-8 py-2.5 md:py-3 bg-gradient-to-r from-primary to-red-600 text-white rounded-xl font-bold text-sm md:text-base hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generiere...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Ad Erstellen
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
