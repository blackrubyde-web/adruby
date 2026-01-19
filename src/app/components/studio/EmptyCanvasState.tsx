import React from 'react';
import {
    Sparkles,
    Image,
    Type,
    Layout,
    Palette,
    Wand2,
    Upload,
    ArrowRight
} from 'lucide-react';

interface EmptyCanvasStateProps {
    onStartWithTemplate: () => void;
    onAddText: () => void;
    onAddImage: () => void;
    onAIGenerate: () => void;
    onUpload: () => void;
}

export const EmptyCanvasState: React.FC<EmptyCanvasStateProps> = ({
    onStartWithTemplate,
    onAddText,
    onAddImage,
    onAIGenerate,
    onUpload
}) => {
    const quickActions = [
        {
            icon: Layout,
            title: 'Template wählen',
            description: '40+ vorgefertigte Designs',
            color: 'from-blue-500 to-indigo-600',
            action: onStartWithTemplate
        },
        {
            icon: Wand2,
            title: 'AI Generieren',
            description: 'Beschreibe dein Ad',
            color: 'from-purple-500 to-pink-600',
            action: onAIGenerate
        },
        {
            icon: Upload,
            title: 'Bild hochladen',
            description: 'Drag & Drop oder klicken',
            color: 'from-emerald-500 to-teal-600',
            action: onUpload
        },
        {
            icon: Type,
            title: 'Text hinzufügen',
            description: 'Headline oder CTA',
            color: 'from-amber-500 to-orange-600',
            action: onAddText
        }
    ];

    return (
        <div className="absolute inset-0 flex items-center justify-center p-8 z-20 pointer-events-none">
            <div className="max-w-2xl w-full pointer-events-auto">
                {/* Hero Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-semibold mb-6">
                        <Sparkles className="w-4 h-4" />
                        Neuer Canvas
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-foreground mb-3 tracking-tight">
                        Erstelle dein nächstes<br />
                        <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            High-Converting Ad
                        </span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                        Starte mit einem Template, generiere mit AI oder beginne von Null
                    </p>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={action.title}
                                onClick={action.action}
                                className="group relative p-5 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 text-left overflow-hidden"
                            >
                                {/* Gradient Background on Hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                                <div className="relative z-10">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-bold text-foreground text-base mb-1 flex items-center gap-2">
                                        {action.title}
                                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {action.description}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Keyboard Hints */}
                <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-muted rounded font-mono text-[10px]">T</kbd>
                        Text
                    </span>
                    <span className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-muted rounded font-mono text-[10px]">V</kbd>
                        Select
                    </span>
                    <span className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-muted rounded font-mono text-[10px]">⌘D</kbd>
                        Duplicate
                    </span>
                    <span className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-muted rounded font-mono text-[10px]">⌘Z</kbd>
                        Undo
                    </span>
                </div>
            </div>
        </div>
    );
};
