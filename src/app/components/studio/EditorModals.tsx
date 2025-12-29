import React from 'react';
import { X, ShieldCheck, TrendingUp, CheckCircle2, AlertCircle, Wand2, Download, ImageIcon, Sparkles, Palette, Maximize2, Loader2 } from 'lucide-react';
import { CanvasStage } from './CanvasStage';
import { AdWizard } from './AdWizard';
import { AISuggestionsPanel } from './AISuggestionsPanel';
import { toast } from 'sonner';
import { FORMAT_PRESETS, type FormatPreset } from './SmartResize';
import type { AdDocument, BrandKit, StudioLayer } from '../../types/studio';
import type { AuditResult } from './PerformanceAudit';

interface EditorModalsProps {
    doc: AdDocument;
    setDoc: (doc: AdDocument) => void;
    variants: AdDocument[];
    showVariantModal: boolean;
    setShowVariantModal: (show: boolean) => void;
    auditResult: AuditResult | null;
    showAuditModal: boolean;
    setShowAuditModal: (show: boolean) => void;
    showExportModal: boolean;
    setShowExportModal: (show: boolean) => void;
    showTextToAdModal: boolean;
    setShowTextToAdModal: (show: boolean) => void;
    showBrandModal: boolean;
    setShowBrandModal: (show: boolean) => void;
    showResizeModal: boolean;
    setShowResizeModal: (show: boolean) => void;
    showAdWizard: boolean;
    setShowAdWizard: (show: boolean) => void;
    showSuggestions: boolean;
    setShowSuggestions: (show: boolean) => void;
    brandKits: BrandKit[];
    handleApplyVariant: (variant: AdDocument) => void;
    handleExport: (format: 'png' | 'jpeg') => void;
    handleGenerateFromText: () => void;
    textToAdInput: string;
    setTextToAdInput: (text: string) => void;
    isGeneratingAd: boolean;
    handleApplyBrand: (brand: BrandKit) => void;
    handleSmartResize: (format: FormatPreset) => void;
}

export const EditorModals: React.FC<EditorModalsProps> = ({
    doc,
    setDoc,
    variants,
    showVariantModal,
    setShowVariantModal,
    auditResult,
    showAuditModal,
    setShowAuditModal,
    showExportModal,
    setShowExportModal,
    showTextToAdModal,
    setShowTextToAdModal,
    showBrandModal,
    setShowBrandModal,
    showResizeModal,
    setShowResizeModal,
    showAdWizard,
    setShowAdWizard,
    showSuggestions,
    setShowSuggestions,
    brandKits,
    handleApplyVariant,
    handleExport,
    handleGenerateFromText,
    textToAdInput,
    setTextToAdInput,
    isGeneratingAd,
    handleApplyBrand,
    handleSmartResize
}) => {
    return (
        <>
            {/* VARIANT MODAL */}
            {showVariantModal && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-12 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-7xl h-full max-h-[85%] rounded-[32px] border border-border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-8 border-b border-border flex justify-between items-end">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tight">AI Campaign Variants</h2>
                                <p className="text-muted-foreground text-sm">We generated 4 high-performing candidates for your A/B testing strategy.</p>
                            </div>
                            <button onClick={() => setShowVariantModal(false)} className="bg-muted hover:bg-muted/80 p-3 rounded-2xl transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 grid grid-cols-2 md:grid-cols-4 gap-8 bg-muted/20">
                            {variants.map((v, i) => (
                                <div key={i} className="flex flex-col gap-6 group">
                                    <div className="aspect-[4/5] bg-background rounded-3xl shadow-xl border border-white/5 overflow-hidden relative hover:ring-4 ring-primary hover:scale-[1.02] transition-all duration-300 cursor-pointer" onClick={() => handleApplyVariant(v)}>
                                        <div className="absolute inset-0 transform origin-top-left" style={{ transform: `scale(${280 / v.width})` }}>
                                            <CanvasStage doc={v} scale={1} selectedLayerIds={[]} onLayerSelect={() => { }} onLayerUpdate={() => { }} />
                                        </div>
                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="bg-white text-black px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">Apply Variant</div>
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <h3 className="font-bold text-lg">{v.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground border border-border px-1.5 py-0.5 rounded tracking-tighter">AI Score: 98%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* AUDIT MODAL */}
            {showAuditModal && auditResult && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-4xl rounded-[40px] border border-border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
                        {/* Header */}
                        <div className="p-8 border-b border-border flex justify-between items-center bg-muted/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black tracking-tight">AI Expert Audit</h2>
                                    <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest">Performance Validation Engine</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAuditModal(false)} className="hover:bg-muted p-2 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Left: Score Card */}
                            <div className="space-y-8">
                                <div className="bg-muted p-8 rounded-[32px] flex flex-col items-center justify-center text-center space-y-4 border border-border/50">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Estimated conversion score</span>
                                    <div className="text-8xl font-black tracking-tighter text-emerald-500 drop-shadow-2xl">
                                        {auditResult.score}<span className="text-2xl opacity-40">%</span>
                                    </div>
                                    <div className="px-4 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5">
                                        <TrendingUp className="w-3.5 h-3.5" /> High performing
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> What's working
                                    </h3>
                                    <div className="space-y-2">
                                        {auditResult.positives.map((p, i) => (
                                            <div key={i} className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs font-medium text-emerald-700">
                                                {p}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Improvements */}
                            <div className="space-y-8">
                                {auditResult.criticalIssues.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-red-500">
                                            <AlertCircle className="w-4 h-4" /> Critical Fixes
                                        </h3>
                                        <div className="space-y-2">
                                            {auditResult.criticalIssues.map((c, i) => (
                                                <div key={i} className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-[13px] font-bold text-red-600 leading-snug">
                                                    {c}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                                        <Wand2 className="w-4 h-4" /> Optimization Tips
                                    </h3>
                                    <div className="space-y-3">
                                        {auditResult.improvements.map((imp, i) => (
                                            <div key={i} className="flex gap-4 p-4 bg-muted/40 rounded-2xl border border-border">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black shrink-0">
                                                    {i + 1}
                                                </div>
                                                <p className="text-[13px] font-medium leading-normal">{imp}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border bg-muted/10 flex justify-end">
                            <button
                                onClick={() => setShowAuditModal(false)}
                                className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                            >
                                Apply Suggestions
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* EXPORT MODAL */}
            {showExportModal && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-md rounded-[32px] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                        {/* Header */}
                        <div className="p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-purple-600/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                                    <Download className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black tracking-tight">Export Your Ad</h2>
                                    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Download as Image</p>
                                </div>
                            </div>
                            <button onClick={() => setShowExportModal(false)} className="hover:bg-muted p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="text-center space-y-2">
                                <p className="text-sm text-muted-foreground">Exporting <span className="font-bold text-foreground">{doc.name}</span></p>
                                <p className="text-xs text-muted-foreground/70">{doc.width} × {doc.height}px • 2x Resolution</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleExport('png')}
                                    className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-indigo-500 hover:bg-indigo-500/5 transition-all"
                                >
                                    <ImageIcon className="w-10 h-10 text-indigo-500 group-hover:scale-110 transition-transform" />
                                    <div className="text-center">
                                        <p className="font-black text-sm">PNG</p>
                                        <p className="text-[10px] text-muted-foreground">Transparent bg</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleExport('jpeg')}
                                    className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-purple-500 hover:bg-purple-500/5 transition-all"
                                >
                                    <ImageIcon className="w-10 h-10 text-purple-500 group-hover:scale-110 transition-transform" />
                                    <div className="text-center">
                                        <p className="font-black text-sm">JPEG</p>
                                        <p className="text-[10px] text-muted-foreground">Smaller file</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TEXT-TO-AD AI MODAL */}
            {showTextToAdModal && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-lg rounded-[32px] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black tracking-tight">Text → Ad Magic</h2>
                                    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">AI-Powered Ad Generation</p>
                                </div>
                            </div>
                            <button onClick={() => setShowTextToAdModal(false)} className="hover:bg-muted p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Describe Your Product/Service</label>
                                <textarea
                                    value={textToAdInput}
                                    onChange={(e) => setTextToAdInput(e.target.value)}
                                    placeholder="z.B. 'Premium LED Gaming Desk Setup für Streamer, mit RGB-Beleuchtung und kabelloser Ladefunktion.'"
                                    className="w-full h-32 bg-muted/50 border border-border rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <button
                                onClick={handleGenerateFromText}
                                disabled={isGeneratingAd || !textToAdInput.trim()}
                                className="w-full py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-fuchsia-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isGeneratingAd ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                                ) : (
                                    <><Sparkles className="w-5 h-5" /> Generate Ad</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* BRAND KIT MODAL */}
            {showBrandModal && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-2xl rounded-[32px] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                                    <Palette className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black tracking-tight">Brand Kit</h2>
                                    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Apply Your Brand Identity</p>
                                </div>
                            </div>
                            <button onClick={() => setShowBrandModal(false)} className="hover:bg-muted p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {brandKits.map((brand) => (
                                <button
                                    key={brand.id}
                                    onClick={() => handleApplyBrand(brand)}
                                    className="group p-4 rounded-2xl border-2 border-border hover:border-primary transition-all text-left"
                                >
                                    <div className="flex gap-1 mb-3">
                                        {Object.values(brand.colors).map((color, i) => (
                                            <div key={i} className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: color }} />
                                        ))}
                                    </div>
                                    <p className="font-bold text-sm">{brand.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{brand.fonts.heading}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* SMART RESIZE MODAL */}
            {showResizeModal && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-3xl rounded-[32px] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
                                    <Maximize2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black tracking-tight">Smart Resize</h2>
                                    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">AI-Powered Format Conversion</p>
                                </div>
                            </div>
                            <button onClick={() => setShowResizeModal(false)} className="hover:bg-muted p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-muted-foreground mb-4">Current: {doc.width} × {doc.height}px</p>
                            <div className="grid grid-cols-3 gap-3">
                                {FORMAT_PRESETS.map((format) => (
                                    <button
                                        key={format.id}
                                        onClick={() => handleSmartResize(format)}
                                        className={`group p-4 rounded-2xl border-2 transition-all text-left ${doc.width === format.width && doc.height === format.height
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50 hover:bg-muted/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div
                                                className="bg-zinc-700 rounded"
                                                style={{
                                                    width: 24 * (format.width / Math.max(format.width, format.height)),
                                                    height: 24 * (format.height / Math.max(format.width, format.height))
                                                }}
                                            />
                                            <span className="font-bold text-sm">{format.name}</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">{format.width}×{format.height}</p>
                                        <p className="text-[9px] text-muted-foreground/60 mt-1">{format.platform}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Ad Wizard */}
            <AdWizard
                isOpen={showAdWizard}
                onClose={() => setShowAdWizard(false)}
                onComplete={(generatedDoc) => {
                    setDoc(generatedDoc);
                    setShowAdWizard(false);
                    toast.success('Ad erfolgreich generiert!');
                }}
            />

            {/* AI Suggestions Panel */}
            <AISuggestionsPanel
                document={doc}
                isVisible={showSuggestions}
                onClose={() => setShowSuggestions(false)}
                onApplySuggestion={(suggestion) => {
                    // Handle auto-fix suggestions
                    if (!suggestion.autoFixAction) {
                        toast.info(`Vorschlag "${suggestion.title}" hat keine Auto-Fix Aktion`);
                        return;
                    }

                    const { action, targetLayerId, params } = suggestion.autoFixAction;

                    if (!targetLayerId) {
                        toast.error('Keine Ziel-Layer ID gefunden');
                        return;
                    }

                    switch (action) {
                        case 'resize':
                            setDoc((prev: AdDocument) => ({
                                ...prev,
                                layers: prev.layers.map((layer: StudioLayer) =>
                                    layer.id === targetLayerId
                                        ? { ...layer, ...params }
                                        : layer
                                )
                            }));
                            toast.success(`✨ ${suggestion.title} angewendet!`);
                            break;

                        case 'recolor':
                            setDoc((prev: AdDocument) => ({
                                ...prev,
                                layers: prev.layers.map((layer: StudioLayer) =>
                                    layer.id === targetLayerId
                                        ? { ...layer, ...params }
                                        : layer
                                )
                            }));
                            toast.success(`🎨 ${suggestion.title} angewendet!`);
                            break;

                        case 'reposition':
                            setDoc((prev: AdDocument) => ({
                                ...prev,
                                layers: prev.layers.map((layer: StudioLayer) =>
                                    layer.id === targetLayerId
                                        ? { ...layer, x: (params as any).x, y: (params as any).y }
                                        : layer
                                )
                            }));
                            toast.success(`📍 ${suggestion.title} angewendet!`);
                            break;

                        default:
                            toast.info(`Aktion "${action}" wird angewendet...`);
                    }
                }}
            />
        </>
    );
};
