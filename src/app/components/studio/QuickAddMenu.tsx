import React, { useState } from 'react';
import {
    Plus,
    Type,
    Image,
    Square,
    Circle,
    Sparkles,
    Upload,
    Palette,
    X
} from 'lucide-react';

interface QuickAddMenuProps {
    onAddText: () => void;
    onAddShape: (shape: 'rect' | 'circle') => void;
    onAddImage: () => void;
    onAIGenerate: () => void;
    onUpload: () => void;
}

export const QuickAddMenu: React.FC<QuickAddMenuProps> = ({
    onAddText,
    onAddShape,
    onAddImage,
    onAIGenerate,
    onUpload
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { icon: Type, label: 'Text', color: 'from-blue-500 to-cyan-500', action: onAddText },
        { icon: Square, label: 'Rechteck', color: 'from-orange-500 to-amber-500', action: () => onAddShape('rect') },
        { icon: Circle, label: 'Kreis', color: 'from-pink-500 to-rose-500', action: () => onAddShape('circle') },
        { icon: Image, label: 'Bild', color: 'from-green-500 to-emerald-500', action: onAddImage },
        { icon: Upload, label: 'Upload', color: 'from-indigo-500 to-purple-500', action: onUpload },
        { icon: Sparkles, label: 'AI Magic', color: 'from-purple-500 to-pink-500', action: onAIGenerate },
    ];

    return (
        <div className="fixed bottom-24 right-8 z-50">
            {/* Menu Items - Radial */}
            <div className={`absolute bottom-16 right-0 transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col-reverse gap-3">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.label}
                                onClick={() => {
                                    item.action();
                                    setIsOpen(false);
                                }}
                                className={`group flex items-center gap-3 transition-all duration-300 ${isOpen
                                        ? 'translate-x-0 opacity-100'
                                        : 'translate-x-10 opacity-0'
                                    }`}
                                style={{
                                    transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
                                }}
                            >
                                {/* Label */}
                                <span className="px-3 py-1.5 bg-black/80 backdrop-blur-xl text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {item.label}
                                </span>
                                {/* Icon Button */}
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main FAB Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isOpen
                        ? 'bg-white/10 backdrop-blur-xl border border-white/20 rotate-45'
                        : 'bg-gradient-to-br from-primary to-purple-600 hover:scale-110 hover:shadow-primary/30'
                    }`}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <Plus className="w-6 h-6 text-white" />
                )}
            </button>
        </div>
    );
};
