import { useState } from 'react';
import { Type, Image as ImageIcon, LayoutTemplate, Sparkles, Hash, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Loader2, ChevronDown, ChevronUp, Wand2, X } from 'lucide-react';
import type { StudioLayer, TextLayer, ImageLayer } from '../../types/studio';

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

export const PropertiesPanel = ({ layer, onChange, onGenerate, onAdapt, onGenerateScene, onReplaceBackground, onEnhanceImage }: PropertiesPanelProps) => {
    const [showAIModal, setShowAIModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [expandedSection, setExpandedSection] = useState<'content' | 'style' | 'position' | null>('content');

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

    const handleChange = (key: string, value: any) => {
        onChange?.(layer.id, { [key]: value });
    };

    const applyStylePreset = (preset: typeof STYLE_PRESETS.text[0]) => {
        onChange?.(layer.id, {
            fontFamily: preset.fontFamily,
            fontWeight: preset.fontWeight,
            letterSpacing: preset.letterSpacing,
        });
    };

    const handleAIAction = async (action: string, data?: any) => {
        setIsProcessing(true);
        try {
            switch (action) {
                case 'scene':
                    await onGenerateScene?.(layer.id, data.prompt, 'product');
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

    const isText = layer.type === 'text' || layer.type === 'cta';
    const isImage = layer.type === 'product' || layer.type === 'background' || layer.type === 'overlay';

    const Section = ({ id, title, icon: Icon, children }: { id: 'content' | 'style' | 'position', title: string, icon: any, children: React.ReactNode }) => (
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
                        <div className={`p-2.5 rounded-xl ${isText ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {isText ? <Type className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
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

                {/* AI MAGIC BUTTON - Der einzige AI-Button */}
                <button
                    onClick={() => setShowAIModal(true)}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-sm font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:shadow-lg hover:shadow-violet-500/25 hover:scale-[1.02] transition-all active:scale-[0.98]"
                >
                    <Wand2 className="w-5 h-5" />
                    AI verbessern
                </button>
            </div>

            {/* Scrollable Content - 3 Sektionen */}
            <div className="flex-1 overflow-y-auto">
                {/* SEKTION 1: Inhalt */}
                <Section id="content" title="Inhalt" icon={Type}>
                    {isText && (
                        <textarea
                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[100px]"
                            value={(layer as any).text}
                            onChange={(e) => handleChange('text', e.target.value)}
                            placeholder="Text eingeben..."
                        />
                    )}
                    {isImage && (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            Nutze "AI verbessern" für Bild-Optionen
                        </div>
                    )}
                </Section>

                {/* SEKTION 2: Stil */}
                <Section id="style" title="Stil" icon={Sparkles}>
                    {isText && (
                        <>
                            {/* Quick Style Presets */}
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

                            {/* Font & Alignment */}
                            <div className="space-y-3">
                                <select
                                    className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm"
                                    value={(layer as any).fontFamily}
                                    onChange={(e) => handleChange('fontFamily', e.target.value)}
                                >
                                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>

                                <div className="flex gap-2">
                                    <div className="flex bg-muted rounded-xl p-1 flex-1">
                                        {(['left', 'center', 'right'] as const).map(align => (
                                            <button
                                                key={align}
                                                onClick={() => handleChange('align', align)}
                                                className={`flex-1 p-2 rounded-lg transition-all ${(layer as any).align === align ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                                            >
                                                {align === 'left' && <AlignLeft className="w-4 h-4 mx-auto" />}
                                                {align === 'center' && <AlignCenter className="w-4 h-4 mx-auto" />}
                                                {align === 'right' && <AlignRight className="w-4 h-4 mx-auto" />}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex bg-muted rounded-xl p-1">
                                        <button
                                            onClick={() => handleChange('fontWeight', (layer as any).fontWeight >= 700 ? 400 : 700)}
                                            className={`p-2 rounded-lg transition-all ${(layer as any).fontWeight >= 700 ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                                        >
                                            <Bold className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleChange('fontStyle', (layer as any).fontStyle === 'italic' ? 'normal' : 'italic')}
                                            className={`p-2 rounded-lg transition-all ${(layer as any).fontStyle === 'italic' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                                        >
                                            <Italic className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Size Slider */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-muted-foreground font-bold uppercase">Größe</span>
                                        <span className="font-mono text-primary">{(layer as any).fontSize}px</span>
                                    </div>
                                    <input type="range" min="12" max="200" value={(layer as any).fontSize} onChange={(e) => handleChange('fontSize', parseInt(e.target.value))} className="w-full accent-primary h-2 rounded-full" />
                                </div>

                                {/* Color */}
                                <div className="flex items-center gap-3">
                                    <input type="color" value={(layer as any).color} onChange={(e) => handleChange('color', e.target.value)} className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer" />
                                    <span className="text-xs font-mono text-muted-foreground">{(layer as any).color}</span>
                                </div>
                            </div>
                        </>
                    )}

                    {isImage && (
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-muted-foreground font-bold uppercase">Deckkraft</span>
                                    <span className="font-mono text-primary">{Math.round(layer.opacity * 100)}%</span>
                                </div>
                                <input type="range" min="0" max="1" step="0.05" value={layer.opacity} onChange={(e) => handleChange('opacity', parseFloat(e.target.value))} className="w-full accent-primary h-2 rounded-full" />
                            </div>
                        </div>
                    )}
                </Section>

                {/* SEKTION 3: Position */}
                <Section id="position" title="Position" icon={Hash}>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { key: 'x', label: 'X' },
                            { key: 'y', label: 'Y' },
                            { key: 'width', label: 'Breite' },
                            { key: 'height', label: 'Höhe' },
                        ].map(({ key, label }) => (
                            <div key={key} className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">{label}</label>
                                <input
                                    type="number"
                                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                                    value={Math.round((layer as any)[key])}
                                    onChange={(e) => handleChange(key, parseInt(e.target.value) || 0)}
                                />
                            </div>
                        ))}
                    </div>
                </Section>
            </div>

            {/* AI MAGIC MODAL */}
            {showAIModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
                    <div className="bg-card w-full max-w-sm rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-border bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
                                        <Wand2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold">AI Magic</h2>
                                        <p className="text-xs text-muted-foreground">Wähle eine Aktion</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowAIModal(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-5 overflow-y-auto">
                            {isProcessing ? (
                                <div className="py-8 text-center">
                                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-violet-500 mb-4" />
                                    <p className="text-sm text-muted-foreground font-medium">AI arbeitet...</p>
                                </div>
                            ) : (
                                <>
                                    {isImage && (
                                        <div className="space-y-5">
                                            <div className="space-y-3">
                                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Szene generieren</span>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {SCENE_PRESETS.map(preset => (
                                                        <button
                                                            key={preset.id}
                                                            onClick={() => handleAIAction('scene', { prompt: preset.prompt })}
                                                            className="p-3 rounded-xl border border-border hover:border-violet-500 hover:bg-violet-500/5 transition-all text-left flex flex-col gap-1 group"
                                                        >
                                                            <span className="text-xl group-hover:scale-110 transition-transform duration-300 origin-left">{preset.label.split(' ')[0]}</span>
                                                            <span className="text-xs font-medium text-foreground">{preset.label.split(' ')[1]}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bearbeiten</span>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        onClick={() => handleAIAction('cutout')}
                                                        className="p-3 rounded-xl border border-border hover:border-indigo-500 hover:bg-indigo-500/5 transition-all text-left group"
                                                    >
                                                        <div className="mb-2 w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                                            <span className="text-lg">✂️</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-bold block">Freistellen</span>
                                                            <span className="text-[10px] text-muted-foreground">Hintergrund entfernen</span>
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={() => handleAIAction('enhance')}
                                                        className="p-3 rounded-xl border border-border hover:border-emerald-500 hover:bg-emerald-500/5 transition-all text-left group"
                                                    >
                                                        <div className="mb-2 w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                                            <span className="text-lg">✨</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-bold block">Detail-Fix</span>
                                                            <span className="text-[10px] text-muted-foreground">Qualität maximieren</span>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {isText && (
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => handleAIAction('rewrite')}
                                                className="w-full p-4 rounded-xl border border-border hover:border-purple-500 hover:bg-purple-500/5 transition-all text-left flex items-center gap-4 group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                    ✍️
                                                </div>
                                                <div>
                                                    <span className="text-sm font-bold block">Text umschreiben</span>
                                                    <span className="text-xs text-muted-foreground">AI generiert Varianten</span>
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
