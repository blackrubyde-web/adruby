import React from 'react';
import { Square, RectangleHorizontal, RectangleVertical, Smartphone } from 'lucide-react';

interface FormatPresetsBarProps {
    currentFormat: string;
    currentWidth: number;
    currentHeight: number;
    onResize: (width: number, height: number, format: string) => void;
}

const presets = [
    { id: 'square', label: '1:1', width: 1080, height: 1080, icon: Square, description: 'Instagram Post' },
    { id: 'story', label: '9:16', width: 1080, height: 1920, icon: Smartphone, description: 'Story / Reel' },
    { id: 'landscape', label: '16:9', width: 1920, height: 1080, icon: RectangleHorizontal, description: 'YouTube / Banner' },
    { id: 'facebook', label: '4:5', width: 1080, height: 1350, icon: RectangleVertical, description: 'Facebook / IG Feed' },
];

export const FormatPresetsBar: React.FC<FormatPresetsBarProps> = ({
    currentFormat,
    currentWidth,
    currentHeight,
    onResize
}) => {
    const getCurrentPresetId = () => {
        const ratio = currentWidth / currentHeight;
        if (Math.abs(ratio - 1) < 0.1) return 'square';
        if (Math.abs(ratio - 9 / 16) < 0.1) return 'story';
        if (Math.abs(ratio - 16 / 9) < 0.1) return 'landscape';
        if (Math.abs(ratio - 4 / 5) < 0.1) return 'facebook';
        return 'custom';
    };

    const activePreset = getCurrentPresetId();

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
            <div className="flex items-center gap-1 bg-black/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-2xl">
                {presets.map((preset) => {
                    const Icon = preset.icon;
                    const isActive = activePreset === preset.id;

                    return (
                        <button
                            key={preset.id}
                            onClick={() => onResize(preset.width, preset.height, preset.id)}
                            className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                                }`}
                            title={preset.description}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-xs font-bold">{preset.label}</span>

                            {/* Tooltip */}
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-[10px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {preset.description}
                            </div>
                        </button>
                    );
                })}

                {/* Current Size Display */}
                <div className="w-px h-5 bg-white/10 mx-1" />
                <div className="px-3 py-2 text-[10px] font-mono text-white/40">
                    {currentWidth}×{currentHeight}
                </div>
            </div>
        </div>
    );
};
