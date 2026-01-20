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
    Palette
} from 'lucide-react';
import { DashboardShell } from './layout/DashboardShell';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

// Scene Graph Types (will be moved to separate file later)
interface SceneElement {
    id: string;
    type: 'image' | 'text' | 'arrow' | 'badge' | 'shape' | 'table' | 'cta';
    role: string;
    priority: number;
}

interface SceneRelation {
    from: string;
    to: string;
    type: 'left_of' | 'right_of' | 'above' | 'below' | 'leads_to' | 'near' | 'overlay';
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
}

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
    const [selectedComposition, setSelectedComposition] = useState<string>('product_focus');
    const [selectedIndustry, setSelectedIndustry] = useState<string>('ecommerce');
    const [selectedTone, setSelectedTone] = useState<string>('modern');
    const [isGenerating, setIsGenerating] = useState(false);
    const [creativePlan, setCreativePlan] = useState<CreativePlan | null>(null);
    const [generatedAd, setGeneratedAd] = useState<string | null>(null);
    const [variantCount, setVariantCount] = useState(1);

    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setUploadedImages(Array.from(e.target.files));
        }
    }, []);

    const handleGenerate = useCallback(async () => {
        if (!prompt && uploadedImages.length === 0) return;

        setIsGenerating(true);

        // TODO: Implement actual API call to Claude Creative Director
        // For now, simulate with timeout
        setTimeout(() => {
            // Mock creative plan
            const mockPlan: CreativePlan = {
                composition: selectedComposition,
                elements: [
                    { id: 'product', type: 'image', role: 'hero_product', priority: 1 },
                    { id: 'headline', type: 'text', role: 'main_headline', priority: 2 },
                    { id: 'cta', type: 'cta', role: 'call_to_action', priority: 3 },
                ],
                relations: [
                    { from: 'headline', to: 'product', type: 'above' },
                    { from: 'cta', to: 'product', type: 'below' },
                ],
                copy: {
                    headline: 'Your Amazing Product',
                    subheadline: 'Solve your problems today',
                    cta: 'Shop Now',
                },
                style: {
                    industry: selectedIndustry,
                    tone: selectedTone,
                    platform: 'meta',
                },
            };

            setCreativePlan(mockPlan);
            setIsGenerating(false);
        }, 2000);
    }, [prompt, uploadedImages, selectedComposition, selectedIndustry, selectedTone]);

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
                            {uploadedImages.length > 0 && (
                                <div className="mt-4 flex gap-2 flex-wrap">
                                    {uploadedImages.map((file, i) => (
                                        <div key={i} className="px-3 py-1.5 bg-muted rounded-lg text-sm">
                                            {file.name}
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

                    {/* Generate Button */}
                    <Button
                        size="lg"
                        onClick={handleGenerate}
                        disabled={isGenerating || (!prompt && uploadedImages.length === 0)}
                        className="w-full h-14 text-lg gap-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Claude generiert Creative Plan...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-5 h-5" />
                                Ad generieren
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </Button>
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

                    {/* Creative Plan Preview */}
                    {creativePlan && (
                        <Card variant="glass" className="overflow-hidden">
                            <CardContent className="p-6">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-violet-500" />
                                    Creative Plan (Scene Graph)
                                </h3>
                                <pre className="p-4 bg-muted/50 rounded-xl text-xs overflow-auto max-h-80 font-mono">
                                    {JSON.stringify(creativePlan, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    )}

                    {/* Generated Ad Preview */}
                    {generatedAd ? (
                        <Card variant="glass" className="overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg">Generierte Ad</h3>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Download className="w-4 h-4" />
                                        Download
                                    </Button>
                                </div>
                                <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
                                    <img src={generatedAd} alt="Generated Ad" className="max-w-full max-h-full rounded-lg" />
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
        </DashboardShell>
    );
});
