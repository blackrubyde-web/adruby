// Animation System for Ad Layers
// Supports basic animations like fadeIn, slideIn, zoom

export type AnimationType = 'none' | 'fadeIn' | 'fadeOut' | 'slideInLeft' | 'slideInRight' | 'slideInUp' | 'slideInDown' | 'zoomIn' | 'zoomOut' | 'bounce' | 'pulse';

export interface LayerAnimation {
    type: AnimationType;
    duration: number; // in milliseconds
    delay: number; // in milliseconds
    easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce';
}

export const ANIMATION_PRESETS: { type: AnimationType; label: string; icon: string }[] = [
    { type: 'none', label: 'None', icon: '⏸' },
    { type: 'fadeIn', label: 'Fade In', icon: '🌅' },
    { type: 'fadeOut', label: 'Fade Out', icon: '🌆' },
    { type: 'slideInLeft', label: 'Slide Left', icon: '⬅️' },
    { type: 'slideInRight', label: 'Slide Right', icon: '➡️' },
    { type: 'slideInUp', label: 'Slide Up', icon: '⬆️' },
    { type: 'slideInDown', label: 'Slide Down', icon: '⬇️' },
    { type: 'zoomIn', label: 'Zoom In', icon: '🔍' },
    { type: 'zoomOut', label: 'Zoom Out', icon: '🔎' },
    { type: 'bounce', label: 'Bounce', icon: '⚡' },
    { type: 'pulse', label: 'Pulse', icon: '💫' }
];

export const DEFAULT_ANIMATION: LayerAnimation = {
    type: 'none',
    duration: 500,
    delay: 0,
    easing: 'easeOut'
};

// Generate CSS keyframes for an animation
export function getAnimationCSS(anim: LayerAnimation): string {
    if (anim.type === 'none') return '';

    const keyframes: Record<AnimationType, string> = {
        none: '',
        fadeIn: `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `,
        fadeOut: `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `,
        slideInLeft: `
            @keyframes slideInLeft {
                from { transform: translateX(-100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `,
        slideInRight: `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `,
        slideInUp: `
            @keyframes slideInUp {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `,
        slideInDown: `
            @keyframes slideInDown {
                from { transform: translateY(-100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `,
        zoomIn: `
            @keyframes zoomIn {
                from { transform: scale(0); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        `,
        zoomOut: `
            @keyframes zoomOut {
                from { transform: scale(1.5); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        `,
        bounce: `
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-20px); }
                60% { transform: translateY(-10px); }
            }
        `,
        pulse: `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `
    };

    return keyframes[anim.type] || '';
}

// Get animation style for a layer
export function getAnimationStyle(anim: LayerAnimation): React.CSSProperties {
    if (anim.type === 'none') return {};

    const easingMap: Record<string, string> = {
        linear: 'linear',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    };

    return {
        animation: `${anim.type} ${anim.duration}ms ${easingMap[anim.easing]} ${anim.delay}ms forwards`
    };
}

// Calculate total animation duration for an ad (all layers)
export function getTotalAnimationDuration(layers: { animation?: LayerAnimation }[]): number {
    let maxEnd = 0;
    layers.forEach(layer => {
        if (layer.animation && layer.animation.type !== 'none') {
            const end = layer.animation.delay + layer.animation.duration;
            if (end > maxEnd) maxEnd = end;
        }
    });
    return maxEnd;
}

// Generate recommended staggered animations for layers
export function generateStaggeredAnimations(layerCount: number, baseDelay: number = 100): LayerAnimation[] {
    const animations: LayerAnimation[] = [];
    const types: AnimationType[] = ['fadeIn', 'slideInUp', 'zoomIn'];

    for (let i = 0; i < layerCount; i++) {
        animations.push({
            type: types[i % types.length],
            duration: 500,
            delay: baseDelay * i,
            easing: 'easeOut'
        });
    }

    return animations;
}
