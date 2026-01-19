import React from 'react';
import {
    Copy,
    Trash2,
    FlipHorizontal2,
    FlipVertical2,
    Lock,
    Unlock,
    Sparkles,
    Layers,
    ChevronsUp,
    ChevronsDown,
    Eye,
    EyeOff
} from 'lucide-react';
import type { StudioLayer } from '../../types/studio';

interface FloatingToolbarProps {
    selectedLayer: StudioLayer | null;
    position: { x: number; y: number };
    scale: number;
    onDuplicate: () => void;
    onDelete: () => void;
    onFlipH: () => void;
    onFlipV: () => void;
    onLock: () => void;
    onUnlock: () => void;
    onBringFront: () => void;
    onSendBack: () => void;
    onToggleVisibility: () => void;
    onAIEnhance?: () => void;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
    selectedLayer,
    position,
    scale,
    onDuplicate,
    onDelete,
    onFlipH,
    onFlipV,
    onLock,
    onUnlock,
    onBringFront,
    onSendBack,
    onToggleVisibility,
    onAIEnhance
}) => {
    if (!selectedLayer) return null;

    const isLocked = selectedLayer.locked;
    const isVisible = selectedLayer.visible;
    const isImage = ['image', 'product', 'background'].includes(selectedLayer.type);

    return (
        <div
            className="fixed z-50 pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
            style={{
                left: position.x,
                top: position.y - 60,
                transform: 'translateX(-50%)'
            }}
        >
            <div className="flex items-center gap-1 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-2xl shadow-black/50">
                {/* Layer Actions */}
                <button
                    onClick={onDuplicate}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/70 hover:text-white"
                    title="Duplizieren (⌘D)"
                >
                    <Copy className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-white/10" />

                {/* Flip Controls */}
                <button
                    onClick={onFlipH}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/70 hover:text-white"
                    title="Horizontal spiegeln"
                >
                    <FlipHorizontal2 className="w-4 h-4" />
                </button>
                <button
                    onClick={onFlipV}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/70 hover:text-white"
                    title="Vertikal spiegeln"
                >
                    <FlipVertical2 className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-white/10" />

                {/* Z-Order */}
                <button
                    onClick={onBringFront}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/70 hover:text-white"
                    title="Nach vorne"
                >
                    <ChevronsUp className="w-4 h-4" />
                </button>
                <button
                    onClick={onSendBack}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/70 hover:text-white"
                    title="Nach hinten"
                >
                    <ChevronsDown className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-white/10" />

                {/* Visibility & Lock */}
                <button
                    onClick={onToggleVisibility}
                    className={`p-2 hover:bg-white/10 rounded-xl transition-all ${isVisible ? 'text-white/70 hover:text-white' : 'text-yellow-400'}`}
                    title={isVisible ? 'Ausblenden' : 'Einblenden'}
                >
                    {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                    onClick={isLocked ? onUnlock : onLock}
                    className={`p-2 hover:bg-white/10 rounded-xl transition-all ${isLocked ? 'text-yellow-400' : 'text-white/70 hover:text-white'}`}
                    title={isLocked ? 'Entsperren' : 'Sperren'}
                >
                    {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>

                {/* AI Enhance for images */}
                {isImage && onAIEnhance && (
                    <>
                        <div className="w-px h-5 bg-white/10" />
                        <button
                            onClick={onAIEnhance}
                            className="p-2 hover:bg-purple-500/20 rounded-xl transition-all text-purple-400 hover:text-purple-300"
                            title="AI Verbessern"
                        >
                            <Sparkles className="w-4 h-4" />
                        </button>
                    </>
                )}

                <div className="w-px h-5 bg-white/10" />

                {/* Delete */}
                <button
                    onClick={onDelete}
                    className="p-2 hover:bg-red-500/20 rounded-xl transition-all text-red-400 hover:text-red-300"
                    title="Löschen (⌫)"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Arrow pointer */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45 bg-black/90 border-r border-b border-white/10" />
        </div>
    );
};
