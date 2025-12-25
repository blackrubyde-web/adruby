import { Type, Image as ImageIcon, Box, LayoutTemplate, Palette, Sparkles, Hash, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Blend } from 'lucide-react';
import type { StudioLayer, TextLayer, CtaLayer } from '../../types/studio';

interface PropertiesPanelProps {
    layer?: StudioLayer;
    onChange?: (id: string, attrs: Partial<StudioLayer>) => void;
    onGenerate?: (id: string, task: 'bg' | 'text') => void;
}

const FONTS = [
    "Inter", "Roboto", "System", "Playfair Display", "Montserrat", "Oswald", "Pacifico", "Outfit", "Space Grotesk", "Fraunces", "Syne", "Urbanist"
];

export const PropertiesPanel = ({ layer, onChange, onGenerate }: PropertiesPanelProps) => {
    if (!layer) {
        return (
            <div className="w-80 border-l border-border bg-card p-6 flex flex-col items-center justify-center text-center h-full">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Box className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-muted-foreground">No Selection</h3>
                <p className="text-xs text-muted-foreground/60 mt-1">Select a layer to edit properties</p>
            </div>
        );
    }

    const handleChange = (key: string, value: any) => {
        onChange?.(layer.id, { [key]: value });
    };

    const isText = layer.type === 'text' || layer.type === 'cta';
    const textLayer = layer as TextLayer;

    return (
        <div className="w-80 border-l border-border bg-card flex flex-col h-full overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
                <h3 className="font-semibold text-sm flex items-center gap-2 capitalize">
                    {layer.type === 'text' && <Type className="w-4 h-4" />}
                    {(layer.type === 'product' || layer.type === 'background') && <ImageIcon className="w-4 h-4" />}
                    {layer.type === 'cta' && <LayoutTemplate className="w-4 h-4" />}
                    {layer.name}
                </h3>
                {layer.ai && (
                    <div className="flex items-center gap-1 text-[10px] font-medium text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3" /> AI Generated
                    </div>
                )}
            </div>

            <div className="p-4 space-y-6 pb-20">
                {/* 1. Content Section (Text) */}
                {isText && (
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            <Type className="w-3 h-3" /> Copywriting
                        </label>
                        <textarea
                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y min-h-[100px] font-medium transition-all"
                            value={(layer as any).text}
                            onChange={(e) => handleChange('text', e.target.value)}
                        />
                        {onGenerate && layer.type === 'text' && (
                            <button
                                onClick={() => onGenerate(layer.id, 'text')}
                                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold bg-purple-600 text-white rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-500/20 transition-all"
                            >
                                <Sparkles className="w-4 h-4 fill-white" />
                                Rewrite with AI
                            </button>
                        )}
                        {(onGenerate && (layer.type === 'product' || layer.type === 'background')) && (
                            <button
                                onClick={() => onGenerate(layer.id, 'bg')}
                                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
                            >
                                <Sparkles className="w-4 h-4 fill-white" />
                                Magic Cutout
                            </button>
                        )}
                    </div>
                )}

                {/* 2. Typography (Expanded) */}
                {isText && (
                    <div className="space-y-4 pt-4 border-t border-border">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            <Type className="w-3 h-3" /> Typography
                        </label>

                        {/* Font Family */}
                        <div className="space-y-1.5">
                            <span className="text-[10px] text-muted-foreground/70 font-bold uppercase">Font Family</span>
                            <select
                                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20"
                                value={(layer as any).fontFamily}
                                onChange={(e) => handleChange('fontFamily', e.target.value)}
                            >
                                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>

                        {/* Alignment & Weight */}
                        <div className="flex gap-2">
                            <div className="flex bg-muted rounded-lg p-1 border border-border flex-1">
                                <button onClick={() => handleChange('align', 'left')} className={`flex-1 flex items-center justify-center p-1.5 rounded-md transition-all ${(layer as any).align === 'left' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}><AlignLeft className="w-4 h-4" /></button>
                                <button onClick={() => handleChange('align', 'center')} className={`flex-1 flex items-center justify-center p-1.5 rounded-md transition-all ${(layer as any).align === 'center' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}><AlignCenter className="w-4 h-4" /></button>
                                <button onClick={() => handleChange('align', 'right')} className={`flex-1 flex items-center justify-center p-1.5 rounded-md transition-all ${(layer as any).align === 'right' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}><AlignRight className="w-4 h-4" /></button>
                            </div>
                            <div className="flex bg-muted rounded-lg p-1 border border-border">
                                <button
                                    onClick={() => handleChange('fontWeight', (layer as any).fontWeight >= 700 ? 400 : 700)}
                                    className={`p-1.5 rounded-md transition-all ${(layer as any).fontWeight >= 700 ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                                >
                                    <Bold className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleChange('fontStyle', (layer as any).fontStyle === 'italic' ? 'normal' : 'italic')}
                                    className={`p-1.5 rounded-md transition-all ${(layer as any).fontStyle === 'italic' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                                >
                                    <Italic className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Spacing Sliders */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-muted-foreground/70 font-bold uppercase">Size ({(layer as any).fontSize}px)</label>
                                <input type="range" min="8" max="200" value={(layer as any).fontSize} onChange={(e) => handleChange('fontSize', parseInt(e.target.value))} className="w-full accent-primary" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-muted-foreground/70 font-bold uppercase">Spacing ({(layer as any).letterSpacing || 0})</label>
                                <input type="range" min="-10" max="50" value={(layer as any).letterSpacing || 0} onChange={(e) => handleChange('letterSpacing', parseInt(e.target.value))} className="w-full accent-primary" />
                            </div>
                            <div className="space-y-1.5 col-span-2">
                                <label className="text-[10px] text-muted-foreground/70 font-bold uppercase">Line Height ({(layer as any).lineHeight || 1.1})</label>
                                <input type="range" min="0.5" max="3" step="0.1" value={(layer as any).lineHeight || 1.1} onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))} className="w-full accent-primary" />
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Shadow Effects */}
                {isText && (
                    <div className="space-y-4 pt-4 border-t border-border">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            <Blend className="w-3 h-3" /> Effects (Shadow)
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-muted-foreground/70 font-bold uppercase">Blur ({(layer as any).shadowBlur || 0})</label>
                                <input type="range" min="0" max="50" value={(layer as any).shadowBlur || 0} onChange={(e) => handleChange('shadowBlur', parseInt(e.target.value))} className="w-full accent-primary" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-muted-foreground/70 font-bold uppercase">Offset Y ({(layer as any).shadowOffsetY || 0})</label>
                                <input type="range" min="-20" max="50" value={(layer as any).shadowOffsetY || 0} onChange={(e) => handleChange('shadowOffsetY', parseInt(e.target.value))} className="w-full accent-primary" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-muted-foreground/70 font-bold uppercase">Color</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={(layer as any).shadowColor || '#000000'} onChange={(e) => handleChange('shadowColor', e.target.value)} className="w-8 h-8 rounded border-none p-0 cursor-pointer" />
                                    <span className="text-[10px] font-mono opacity-60">{(layer as any).shadowColor || '#000'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Appearance (Colors) */}
                <div className="space-y-4 pt-4 border-t border-border">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <Palette className="w-3 h-3" /> Appearance
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-muted-foreground/70 font-bold uppercase">Opacity</label>
                            <input type="range" min="0" max="1" step="0.1" value={layer.opacity} onChange={(e) => handleChange('opacity', parseFloat(e.target.value))} className="w-full accent-primary" />
                        </div>
                        {isText && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-muted-foreground/70 font-bold uppercase">Text Color</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={(layer as any).color} onChange={(e) => handleChange('color', e.target.value)} className="w-8 h-8 rounded border-none p-0 cursor-pointer" />
                                    <span className="text-[10px] font-mono opacity-60">{(layer as any).color}</span>
                                </div>
                            </div>
                        )}
                        {layer.type === 'cta' && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-muted-foreground/70 font-bold uppercase">Button BG</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={(layer as any).bgColor} onChange={(e) => handleChange('bgColor', e.target.value)} className="w-8 h-8 rounded border-none p-0 cursor-pointer" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 5. Geometry */}
                <div className="space-y-4 pt-4 border-t border-border">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5" /> Geometry
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-muted-foreground/60 uppercase">X</label>
                            <input type="number" className="w-full bg-muted/30 border border-border rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary" value={Math.round(layer.x)} onChange={(e) => handleChange('x', parseInt(e.target.value))} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-muted-foreground/60 uppercase">Y</label>
                            <input type="number" className="w-full bg-muted/30 border border-border rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary" value={Math.round(layer.y)} onChange={(e) => handleChange('y', parseInt(e.target.value))} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-muted-foreground/60 uppercase">Width</label>
                            <input type="number" className="w-full bg-muted/30 border border-border rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary" value={Math.round(layer.width)} onChange={(e) => handleChange('width', parseInt(e.target.value))} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-muted-foreground/60 uppercase">Height</label>
                            <input type="number" className="w-full bg-muted/30 border border-border rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary" value={Math.round(layer.height)} onChange={(e) => handleChange('height', parseInt(e.target.value))} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
