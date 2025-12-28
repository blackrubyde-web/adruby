import { useState, type ComponentType, type ReactNode } from 'react';
import { Type, Image as ImageIcon, LayoutTemplate, Sparkles, Hash, AlignLeft, AlignCenter, AlignRight, Bold, Italic, ChevronDown, ChevronUp, Wand2, X } from 'lucide-react';
import type { StudioLayer, TextLayer, ImageLayer, CtaLayer, ShapeLayer } from '../../types/studio';

interface PropertiesPanelProps {
    layer?: StudioLayer;
    onChange?: (id: string, updates: Partial<StudioLayer>) => void;
    onGenerate?: (id: string, task: 'bg' | 'text') => void;
    onAdapt?: (id: string) => void;
    onGenerateScene?: (id: string, scenePrompt: string, style: string) => void;
    onReplaceBackground?: (id: string, bgPrompt: string) => void;
    onEnhanceImage?: (id: string) => void;
}

const FONTS = ["Inter", "Roboto", "Playfair Display", "Montserrat", "Oswald", "Outfit", "Space Grotesk", "Bebas Neue"];

// Style Presets für Quick-Styling
const STYLE_PRESETS = {
    text: [
        { id: 'modern', label: 'Modern', fontFamily: 'Inter', fontWeight: 700, letterSpacing: -1 },
        { id: 'bold', label: 'Bold', fontFamily: 'Bebas Neue', fontWeight: 400, letterSpacing: 2 },
        { id: 'elegant', label: 'Elegant', fontFamily: 'Playfair Display', fontWeight: 500, letterSpacing: 0 },
        { id: 'minimal', label: 'Minimal', fontFamily: 'Space Grotesk', fontWeight: 400, letterSpacing: 1 },
    ]
};

const SCENE_PRESETS = [
    { id: 'luxury', label: '✨ Luxus', prompt: 'Elegantes Marmor-Setting mit warmem Licht' },
    { id: 'nature', label: '🌿 Natur', prompt: 'Natürliches Setting mit Pflanzen' },
    { id: 'studio', label: '📸 Studio', prompt: 'Professionelles Studio mit Gradient' },
    { id: 'minimal', label: '⬜ Minimal', prompt: 'Weißer Hintergrund, saubere Schatten' },
];

type SectionId = 'content' | 'style' | 'position';
type TextLikeLayer = TextLayer | CtaLayer;

const isTextLayer = (layer: StudioLayer): layer is TextLayer => layer.type === 'text';
const isCtaLayer = (layer: StudioLayer): layer is CtaLayer => layer.type === 'cta';
const isTextLikeLayer = (layer: StudioLayer): layer is TextLikeLayer => isTextLayer(layer) || isCtaLayer(layer);
const isImageLayer = (layer: StudioLayer): layer is ImageLayer =>
    layer.type === 'product' || layer.type === 'background' || layer.type === 'overlay';
const isShapeLayer = (layer: StudioLayer): layer is ShapeLayer => layer.type === 'shape';

const isBoldWeight = (weight: TextLikeLayer['fontWeight'] | undefined) => {
    if (typeof weight === 'number') return weight >= 700;
    if (!weight) return false;
    const numeric = Number(weight);
    if (Number.isFinite(numeric)) return numeric >= 700;
    return weight === 'bold';
};

export const PropertiesPanel = ({ layer, onChange, onGenerate, onAdapt: _onAdapt, onGenerateScene, onReplaceBackground: _onReplaceBackground, onEnhanceImage }: PropertiesPanelProps) => {
    const [showAIModal, setShowAIModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [expandedSection, setExpandedSection] = useState<SectionId | null>('content');

    if (!layer) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center mb-6">
                    <Sparkles className="w-10 h-10 text-primary/40" />
                </div>
                <h3 className="font-bold text-lg mb-2">Wähle einen Layer</h3>
                <p className="text-sm text-muted-foreground max-w-[200px]">Klicke auf ein Element auf der Leinwand um es zu bearbeiten</p>
            </div>
        );
    }

    const handleChange = <K extends keyof StudioLayer>(key: K, value: StudioLayer[K]) => {
        onChange?.(layer.id, { [key]: value } as Partial<StudioLayer>);
    };

    const applyStylePreset = (preset: typeof STYLE_PRESETS.text[0]) => {
        onChange?.(layer.id, {
            fontFamily: preset.fontFamily,
            fontWeight: preset.fontWeight,
            letterSpacing: preset.letterSpacing,
        });
    };

    const handleAIAction = async (action: 'scene' | 'cutout' | 'rewrite' | 'enhance', data?: { prompt: string }) => {
        setIsProcessing(true);
        try {
            switch (action) {
                case 'scene':
                    if (data?.prompt) {
                        await onGenerateScene?.(layer.id, data.prompt, 'product');
                    }
                    break;
                case 'cutout':
                    await onGenerate?.(layer.id, 'bg');
                    break;
                case 'rewrite':
                    await onGenerate?.(layer.id, 'text');
                    break;
                case 'enhance':
                    await onEnhanceImage?.(layer.id);
                    break;
            }
        } finally {
            setIsProcessing(false);
            setShowAIModal(false);
        }
    };

    const textLayer = isTextLikeLayer(layer) ? layer : null;
    const imageLayer = isImageLayer(layer) ? layer : null;
    const shapeLayer = isShapeLayer(layer) ? layer : null;

    const isText = textLayer !== null;
    const isImage = imageLayer !== null;
    const isShape = shapeLayer !== null;

    const textValue = textLayer?.text ?? '';
    const textFontFamily = textLayer?.fontFamily ?? FONTS[0];
    const textFontSize = textLayer?.fontSize ?? 16;
    const textFontWeight = textLayer?.fontWeight;
    const textIsBold = isBoldWeight(textFontWeight);
    const textFontStyle = textLayer?.fontStyle ?? 'normal';
    const textAlign = isTextLayer(layer) ? layer.align : undefined;
    const textColor = isTextLayer(layer)
        ? layer.color ?? layer.fill ?? '#000000'
        : textLayer?.color ?? '#000000';
    const shapeFill = shapeLayer?.fill ?? '#000000';
    const shapeCornerRadius = shapeLayer?.cornerRadius ?? 0;
    const imageOpacity = imageLayer?.opacity ?? layer.opacity;

    const positionFields: Array<{ key: 'x' | 'y' | 'width' | 'height'; label: string }> = [
        { key: 'x', label: 'X' },
        { key: 'y', label: 'Y' },
        { key: 'width', label: 'Breite' },
        { key: 'height', label: 'Höhe' },
    ];

    const Section = ({ id, title, icon: Icon, children }: { id: SectionId; title: string; icon: ComponentType<{ className?: string }>; children: ReactNode }) => (
        <div className="border-b border-border/50 last:border-0">
            <button
                onClick={() => setExpandedSection(expandedSection === id ? null : id)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold">{title}</span>
                </div>
                {expandedSection === id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {expandedSection === id && (
                <div className="px-4 pb-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border/50 bg-gradient-to-r from-card to-card/80">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isText ? 'bg-blue-500/10 text-blue-500' : isShape ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {isText ? <Type className="w-5 h-5" /> : isShape ? <LayoutTemplate className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-sm truncate max-w-[140px]">{layer.name}</h3>
                            <span className="text-[10px] text-muted-foreground uppercase">{layer.type}</span>
                        </div>
                    </div>
                    {layer.ai && (
                        <span className="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI
                        </span>
                    )}
                </div>

                {/* AI MAGIC BUTTON */}
                <button
                    onClick={() => setShowAIModal(true)}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-sm font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:shadow-lg hover:shadow-violet-500/25 hover:scale-[1.02] transition-all active:scale-[0.98]"
                >
                    <Wand2 className="w-5 h-5" />
                    AI Magic
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                {/* SECTION 1: Content */}
                <Section id="content" title="Inhalt" icon={Type}>
                    {isText && (
                        <textarea
                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[100px]"
                            value={textValue}
                            onChange={(e) => handleChange('text' as any, e.target.value)}
                            placeholder="Text eingeben..."
                        />
                    )}
                    {(isImage || isShape) && (
                        <div className="space-y-3">
                            {isImage && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">AI Prompt</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Beschreibe das Bild..."
                                            className="w-full pl-3 pr-8 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
                                        />
                                        <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80">
                                            <Wand2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isShape && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Button Text (Link)</label>
                                    <input
                                        type="text"
                                        placeholder="Button Label..."
                                        className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
                                    // Linking this to a hypothetical linked text layer would be ideal, currently just UI
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </Section>

                {/* SECTION 2: Style */}
                <Section id="style" title="Stil" icon={Sparkles}>
                    {/* TEXT STYLES */}
                    {isText && (
                        <>
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Quick Styles</span>
                                <div className="grid grid-cols-2 gap-2">
                                    {STYLE_PRESETS.text.map(preset => (
                                        <button
                                            key={preset.id}
                                            onClick={() => applyStylePreset(preset)}
                                            className="p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                                        >
                                            <span className="text-xs font-bold">{preset.label}</span>
                                            <span className="block text-[10px] text-muted-foreground">{preset.fontFamily}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <select
                                    className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm"
                                    value={textFontFamily}
                                    onChange={(e) => handleChange('fontFamily' as any, e.target.value)}
                                >
                                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>

                                <div className="flex gap-2">
                                    <div className="flex bg-muted rounded-xl p-1 flex-1">
                                        {(['left', 'center', 'right'] as const).map(align => (
                                            <button
                                                key={align}
                                                onClick={() => handleChange('align' as any, align)}
                                                className={`flex-1 p-2 rounded-lg transition-all ${textAlign === align ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                                            >
                                                {align === 'left' && <AlignLeft className="w-4 h-4 mx-auto" />}
                                                {align === 'center' && <AlignCenter className="w-4 h-4 mx-auto" />}
                                                {align === 'right' && <AlignRight className="w-4 h-4 mx-auto" />}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex bg-muted rounded-xl p-1">
                                        <button
                                            onClick={() => handleChange('fontWeight' as any, textIsBold ? 400 : 700)}
                                            className={`p-2 rounded-lg transition-all ${textIsBold ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                                        >
                                            <Bold className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleChange('fontStyle' as any, textFontStyle === 'italic' ? 'normal' : 'italic')}
                                            className={`p-2 rounded-lg transition-all ${textFontStyle === 'italic' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                                        >
                                            <Italic className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-muted-foreground font-bold uppercase">Größe</span>
                                        <span className="font-mono text-primary">{textFontSize}px</span>
                                    </div>
                                    <input type="range" min="12" max="200" value={textFontSize} onChange={(e) => handleChange('fontSize' as any, parseInt(e.target.value))} className="w-full accent-primary h-2 rounded-full" />
                                </div>

                                <div className="flex items-center gap-3">
                                    <input type="color" value={textColor} onChange={(e) => handleChange('color' as any, e.target.value)} className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer" />
                                    <span className="text-xs font-mono text-muted-foreground">{textColor}</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* SHAPE STYLES */}
                    {isShape && (
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Füllfarbe</label>
                                <div className="flex items-center gap-3">
                                    <input type="color" value={shapeFill} onChange={(e) => handleChange('fill' as any, e.target.value)} className="w-full h-10 rounded-lg border-2 border-border cursor-pointer" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-muted-foreground font-bold uppercase">Abrundung</span>
                                    <span className="font-mono text-primary">{shapeCornerRadius}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={shapeCornerRadius}
                                    onChange={(e) => handleChange('cornerRadius' as any, parseInt(e.target.value))}
                                    className="w-full accent-primary h-2 rounded-full"
                                />
                            </div>
                        </div>
                    )}

                    {/* IMAGE STYLES */}
                    {isImage && (
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-muted-foreground font-bold uppercase">Deckkraft</span>
                                    <span className="font-mono text-primary">{Math.round(imageOpacity * 100)}%</span>
                                </div>
                                <input type="range" min="0" max="1" step="0.05" value={imageOpacity} onChange={(e) => handleChange('opacity', parseFloat(e.target.value))} className="w-full accent-primary h-2 rounded-full" />
                            </div>
                        </div>
                    )}
                </Section>

                {/* SECTION 3: Position */}
                <Section id="position" title="Position" icon={Hash}>
                    <div className="grid grid-cols-2 gap-3">
                        {positionFields.map(({ key, label }) => (
                            <div key={key} className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">{label}</label>
                                <input
                                    type="number"
                                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                                    value={Math.round(layer[key])}
                                    onChange={(e) => handleChange(key, parseInt(e.target.value) || 0)}
                                />
                            </div>
                        ))}
                    </div>
                </Section>
            </div>

            {/* AI MAGIC MODAL - REDESIGNED */}
            {showAIModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
                    <div className="w-full max-w-[320px] bg-card/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/20 animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
                        {/* Compact Header */}
                        <div className="p-4 border-b border-border/50 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/30">
                                        <Wand2 className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold tracking-tight">AI Magic</h2>
                                        <p className="text-[10px] text-muted-foreground font-medium">Was möchtest du tun?</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowAIModal(false)} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-4 h-4 opacity-70" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-3 max-h-[60vh] overflow-y-auto">
                            {isProcessing ? (
                                <div className="py-8 text-center">
                                    <div className="relative w-12 h-12 mx-auto mb-3">
                                        <div className="absolute inset-0 rounded-full border-2 border-violet-500/30"></div>
                                        <div className="absolute inset-0 rounded-full border-t-2 border-violet-500 animate-spin"></div>
                                        <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-violet-500 animate-pulse" />
                                    </div>
                                    <p className="text-xs font-bold text-foreground">AI zaubert...</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {isImage && (
                                        <>
                                            <button onClick={() => handleAIAction('cutout')} className="w-full p-3 rounded-xl hover:bg-violet-500/10 hover:border-violet-500/30 border border-transparent transition-all group flex items-center gap-3 text-left">
                                                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500 group-hover:scale-110 transition-transform">✂️</div>
                                                <div>
                                                    <span className="text-xs font-bold block">Freistellen</span>
                                                    <span className="text-[10px] text-muted-foreground">Hintergrund entfernen</span>
                                                </div>
                                            </button>

                                            <button onClick={() => handleAIAction('enhance')} className="w-full p-3 rounded-xl hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-transparent transition-all group flex items-center gap-3 text-left">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">✨</div>
                                                <div>
                                                    <span className="text-xs font-bold block">Upscale</span>
                                                    <span className="text-[10px] text-muted-foreground">4x Auflösung</span>
                                                </div>
                                            </button>

                                            <div className="pt-2 pb-1 px-1">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Szenen Generator</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                {SCENE_PRESETS.map(preset => (
                                                    <button
                                                        key={preset.id}
                                                        onClick={() => handleAIAction('scene', { prompt: preset.prompt })}
                                                        className="p-2.5 rounded-xl bg-muted/40 hover:bg-primary/5 hover:ring-1 hover:ring-primary/20 transition-all text-center flex flex-col items-center gap-1.5"
                                                    >
                                                        <span className="text-lg">{preset.label.split(' ')[0]}</span>
                                                        <span className="text-[10px] font-medium">{preset.label.split(' ')[1]}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {(isText || isShape) && (
                                        <button onClick={() => handleAIAction('rewrite')} className="w-full p-3 rounded-xl hover:bg-blue-500/10 hover:border-blue-500/30 border border-transparent transition-all group flex items-center gap-3 text-left">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">✍️</div>
                                            <div>
                                                <span className="text-xs font-bold block">Rewriter</span>
                                                <span className="text-[10px] text-muted-foreground">Text umschreiben</span>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
