import { useState, useRef } from 'react';
import { Search, Type, Square, Tag, ShoppingBag, Laptop, Hammer, Users, Layout, Sparkles, Home, UtensilsCrossed, Dumbbell, PartyPopper, Landmark, Upload, Image as ImageIcon, X } from 'lucide-react';
import { MODULE_PRESETS, AD_TEMPLATES } from './presets';
import type { StudioLayer, AdDocument } from '../../types/studio';

interface AssetsPanelProps {
    onAddLayer: (preset: Partial<StudioLayer>) => void;
    onApplyTemplate: (template: Partial<AdDocument>) => void;
}

export const AssetsPanel = ({ onAddLayer, onApplyTemplate }: AssetsPanelProps) => {
    const [search, setSearch] = useState("");
    const [libTab, setLibTab] = useState<'modules' | 'templates' | 'upload'>('modules');
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter Logic
    const filteredModules = MODULE_PRESETS.filter(m => {
        if (!search) return true;
        const q = search.toLowerCase();
        return m.label.toLowerCase().includes(q) || m.tags.some(t => t.includes(q));
    });

    const categories = [
        { id: 'saas', label: 'SaaS & Tech', icon: Laptop },
        { id: 'craft', label: 'Craftsmen', icon: Hammer },
        { id: 'job', label: 'Recruitment', icon: Users },
        { id: 'coach', label: 'Coaching', icon: Sparkles },
        { id: 'ecommerce', label: 'E-Commerce', icon: ShoppingBag },
        { id: 'realestate', label: 'Real Estate', icon: Home },
        { id: 'food', label: 'Restaurant', icon: UtensilsCrossed },
        { id: 'fitness', label: 'Fitness', icon: Dumbbell },
        { id: 'event', label: 'Events', icon: PartyPopper },
        { id: 'finance', label: 'Finance', icon: Landmark },
        { id: 'cta', label: 'Buttons', icon: Square },
        { id: 'text', label: 'Typography', icon: Type },
    ];

    // Handle file upload
    const handleFileUpload = (files: FileList | null) => {
        if (!files) return;

        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                setUploadedImages(prev => [...prev, dataUrl]);
            };
            reader.readAsDataURL(file);
        });
    };

    // Add uploaded image as layer
    const handleAddImageToCanvas = (src: string) => {
        onAddLayer({
            type: 'product',
            name: `Uploaded Image ${uploadedImages.indexOf(src) + 1}`,
            src,
            width: 400,
            height: 400,
            x: 100,
            y: 100,
            opacity: 1,
            rotation: 0,
        });
    };

    // Remove uploaded image from library
    const handleRemoveUploadedImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileUpload(e.dataTransfer.files);
    };

    return (
        <div className="flex flex-col h-full bg-card overflow-hidden">
            <div className="p-4 border-b border-border space-y-4">
                <div className="flex bg-muted rounded-xl p-1">
                    <button
                        onClick={() => setLibTab('modules')}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${libTab === 'modules' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Tag className="w-3 h-3" /> Modules
                    </button>
                    <button
                        onClick={() => setLibTab('templates')}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${libTab === 'templates' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Layout className="w-3 h-3" /> Templates
                    </button>
                    <button
                        onClick={() => setLibTab('upload')}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${libTab === 'upload' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Upload className="w-3 h-3" /> Upload
                    </button>
                </div>

                {libTab !== 'upload' && (
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                            className="w-full bg-muted/50 border border-border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder={`Search ${libTab}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-12">
                {libTab === 'upload' ? (
                    <div className="space-y-6">
                        {/* Upload Zone */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`
                                relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                                ${isDragging
                                    ? 'border-primary bg-primary/10 scale-[1.02]'
                                    : 'border-border hover:border-primary/50 hover:bg-muted/30'}
                            `}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileUpload(e.target.files)}
                            />
                            <div className="flex flex-col items-center gap-3">
                                <div className={`p-4 rounded-2xl transition-colors ${isDragging ? 'bg-primary/20' : 'bg-muted'}`}>
                                    <Upload className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">
                                        {isDragging ? 'Drop it here!' : 'Drop images or click'}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        PNG, JPG, WebP supported
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Uploaded Images Gallery */}
                        {uploadedImages.length > 0 && (
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <ImageIcon className="w-3.5 h-3.5" /> Your Images ({uploadedImages.length})
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {uploadedImages.map((src, index) => (
                                        <div key={index} className="group relative">
                                            <button
                                                onClick={() => handleAddImageToCanvas(src)}
                                                className="w-full aspect-square rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-all bg-zinc-900"
                                            >
                                                <img
                                                    src={src}
                                                    alt={`Upload ${index + 1}`}
                                                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                                                />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRemoveUploadedImage(index); }}
                                                className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <X className="w-3 h-3 text-white" />
                                            </button>
                                            <p className="text-[9px] text-center text-muted-foreground mt-1 font-medium">
                                                Click to add
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {uploadedImages.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground/50">
                                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-xs">No images uploaded yet</p>
                            </div>
                        )}
                    </div>
                ) : libTab === 'modules' ? (
                    categories.map(cat => {
                        const items = filteredModules.filter(m => m.category === cat.id);
                        if (items.length === 0) return null;
                        const Icon = cat.icon;

                        return (
                            <div key={cat.id} className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Icon className="w-3.5 h-3.5" /> {cat.label}
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {items.map(module => (
                                        <button
                                            key={module.id}
                                            onClick={() => onAddLayer(module.layerDetails)}
                                            className="group flex flex-col items-center gap-2 p-3 rounded-2xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-center"
                                        >
                                            <div className={`w-full h-12 flex items-center justify-center text-[10px] font-black shadow-inner rounded-xl overflow-hidden bg-zinc-900 border border-white/5`}>
                                                <div className={`scale-75 ${module.preview}`}>
                                                    {module.label.split(' ')[0]}
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground truncate w-full px-1">
                                                {module.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="space-y-6">
                        {/* Featured Templates Section */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5" /> FEATURED
                            </label>
                            <div className="grid grid-cols-1 gap-4">
                                {AD_TEMPLATES.slice(0, 3).map(tpl => {
                                    const bgLayer = tpl.document.layers?.find((l: { type: string }) => l.type === 'background' || l.type === 'overlay');
                                    const bgImage = bgLayer && 'src' in bgLayer ? (bgLayer as { src?: string }).src : null;
                                    const bgColor = tpl.document.backgroundColor || '#1a1a1a';

                                    return (
                                        <button
                                            key={tpl.id}
                                            onClick={() => onApplyTemplate(tpl.document)}
                                            className="group relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-border hover:border-primary transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] duration-300"
                                        >
                                            {/* Template Preview */}
                                            <div
                                                className="absolute inset-0 flex items-center justify-center"
                                                style={{ backgroundColor: bgColor }}
                                            >
                                                {bgImage && (
                                                    <img
                                                        src={bgImage}
                                                        alt={tpl.name}
                                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                                    />
                                                )}
                                            </div>

                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90" />

                                            {/* Category Badge */}
                                            <div className="absolute top-3 left-3">
                                                <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-sm text-white rounded-full">
                                                    {tpl.niche}
                                                </span>
                                            </div>

                                            {/* Template Info */}
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <p className="text-sm font-bold text-white truncate">{tpl.name}</p>
                                                <p className="text-[10px] text-primary font-semibold mt-0.5">Click to apply</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* All Templates by Category */}
                        {categories.map(cat => {
                            const items = AD_TEMPLATES.filter(t => t.niche === cat.id);
                            if (items.length === 0) return null;
                            const Icon = cat.icon;

                            return (
                                <div key={cat.id} className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Icon className="w-3.5 h-3.5" /> {cat.label} ({items.length})
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {items.map(tpl => {
                                            const bgLayer = tpl.document.layers?.find((l: { type: string }) => l.type === 'background' || l.type === 'overlay');
                                            const bgImage = bgLayer && 'src' in bgLayer ? (bgLayer as { src?: string }).src : null;
                                            const bgColor = tpl.document.backgroundColor || '#1a1a1a';

                                            return (
                                                <button
                                                    key={tpl.id}
                                                    onClick={() => onApplyTemplate(tpl.document)}
                                                    className="group relative aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all hover:scale-[1.03] duration-200"
                                                >
                                                    {/* Template Preview with actual background */}
                                                    <div
                                                        className="absolute inset-0"
                                                        style={{ backgroundColor: bgColor }}
                                                    >
                                                        {bgImage && (
                                                            <img
                                                                src={bgImage}
                                                                alt={tpl.name}
                                                                className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Gradient overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                                    {/* Template name */}
                                                    <div className="absolute bottom-2 left-2 right-2">
                                                        <p className="text-[10px] font-bold text-white leading-tight truncate">{tpl.name}</p>
                                                        <p className="text-[8px] text-primary/80 font-semibold">Template</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
