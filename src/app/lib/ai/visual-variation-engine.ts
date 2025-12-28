import type { AdDocument, StudioLayer } from '../../types/studio';
import type { VisualStyle } from './template-generator-v2';

/**
 * VISUAL VARIATION ENGINE V2
 * Creates style mutations and texture overlays for maximum variety
 * 
 * Features:
 * - Style interpolation (blend between two styles)
 * - Texture overlays (grain, gradient mesh, gloss)
 * - Color mutations (shift hue, adjust saturation)
 * - Layout permutations (mirror, rotate, offset)
 */

export type TextureType = 'grain' | 'gradient_mesh' | 'gloss' | 'none';
export type StyleMutation = 'shift_warm' | 'shift_cool' | 'high_contrast' | 'muted' | 'vibrant';

export interface VisualVariation {
    id: string;
    baseStyleName: string;
    mutationType: StyleMutation;
    textureOverlay: TextureType;
    colorShift: number; // -30 to +30 degrees hue shift
    saturationMultiplier: number; // 0.5 to 1.5
    diversityScore: number; // How different from original (0-100)
}

/**
 * Generate multiple visual variations of a base template
 */
export function generateVisualVariations(
    baseTemplate: AdDocument,
    count: number = 5
): AdDocument[] {
    const variations: AdDocument[] = [];

    const mutations: StyleMutation[] = ['shift_warm', 'shift_cool', 'high_contrast', 'muted', 'vibrant'];
    const textures: TextureType[] = ['grain', 'gradient_mesh', 'gloss', 'none'];

    for (let i = 0; i < Math.min(count, 10); i++) {
        const mutation = mutations[i % mutations.length];
        const texture = textures[i % textures.length];

        const variation = applyVisualVariation(baseTemplate, {
            id: `variation_${i}`,
            baseStyleName: baseTemplate.name || 'base',
            mutationType: mutation,
            textureOverlay: texture,
            colorShift: (i - count / 2) * 10, // Distribute hue shifts
            saturationMultiplier: 0.8 + (i * 0.15), // 0.8 to 1.4
            diversityScore: calculateDiversityScore(mutation, texture)
        });

        variations.push(variation);
    }

    // Sort by diversity score (most different first)
    return variations.sort((a, b) => {
        const aScore = (a as any).diversityScore || 50;
        const bScore = (b as any).diversityScore || 50;
        return bScore - aScore;
    });
}

/**
 * Apply a specific visual variation to a template
 */
export function applyVisualVariation(
    template: AdDocument,
    variation: VisualVariation
): AdDocument {
    // Deep clone template
    const varied: AdDocument = JSON.parse(JSON.stringify(template));
    varied.id = `${template.id}_${variation.id}`;
    varied.name = `${template.name} (${variation.mutationType})`;

    // Apply color mutations to all layers
    varied.layers = varied.layers.map(layer => {
        let mutatedLayer = { ...layer };

        // Apply color shifts based on mutation type
        if ('color' in layer || 'fill' in layer || 'bgColor' in layer) {
            mutatedLayer = applyColorMutation(mutatedLayer, variation);
        }

        return mutatedLayer;
    });

    // Apply texture overlay as a new layer
    if (variation.textureOverlay !== 'none') {
        const textureLayer = createTextureLayer(variation.textureOverlay, template.width, template.height);
        varied.layers.push(textureLayer);
    }

    // Store variation metadata
    (varied as any).variationMeta = variation;
    (varied as any).diversityScore = variation.diversityScore;

    return varied;
}

/**
 * Apply color mutation based on variation type
 */
function applyColorMutation(layer: StudioLayer, variation: VisualVariation): StudioLayer {
    const mutated = { ...layer };

    // Helper to mutate a single color
    const mutateColor = (color: string): string => {
        const hsl = hexToHSL(color);

        switch (variation.mutationType) {
            case 'shift_warm':
                hsl.h = (hsl.h + 15) % 360; // Shift towards red/orange
                hsl.s = Math.min(100, hsl.s * 1.1);
                break;
            case 'shift_cool':
                hsl.h = (hsl.h - 15 + 360) % 360; // Shift towards blue
                hsl.s = Math.min(100, hsl.s * 1.1);
                break;
            case 'high_contrast':
                hsl.l = hsl.l > 50 ? Math.min(95, hsl.l * 1.2) : Math.max(10, hsl.l * 0.7);
                hsl.s = Math.min(100, hsl.s * 1.3);
                break;
            case 'muted':
                hsl.s = hsl.s * 0.6;
                break;
            case 'vibrant':
                hsl.s = Math.min(100, hsl.s * 1.4);
                break;
        }

        // Apply custom hue shift
        hsl.h = (hsl.h + variation.colorShift + 360) % 360;

        // Apply saturation multiplier
        hsl.s = Math.max(0, Math.min(100, hsl.s * variation.saturationMultiplier));

        return hslToHex(hsl);
    };

    // Mutate all color properties
    if ('color' in mutated && mutated.color) {
        mutated.color = mutateColor(mutated.color);
    }
    if ('fill' in mutated && (mutated as any).fill) {
        (mutated as any).fill = mutateColor((mutated as any).fill);
    }
    if ('bgColor' in mutated && (mutated as any).bgColor) {
        (mutated as any).bgColor = mutateColor((mutated as any).bgColor);
    }
    if ('borderColor' in mutated && (mutated as any).borderColor) {
        (mutated as any).borderColor = mutateColor((mutated as any).borderColor);
    }

    return mutated;
}

/**
 * Create texture overlay layer
 */
function createTextureLayer(texture: TextureType, width: number, height: number): StudioLayer {
    const baseLayer: any = {
        id: `texture_${texture}_${Date.now()}`,
        type: 'overlay',
        name: `Texture: ${texture}`,
        x: 0,
        y: 0,
        width,
        height,
        zIndex: 99, // On top
        rotation: 0,
        locked: false,
        visible: true
    };

    switch (texture) {
        case 'grain':
            return {
                ...baseLayer,
                src: '', // Would be filled with grain texture image
                opacity: 0.08,
                ai: {
                    provider: 'other',
                    task: 'generate_background',
                    prompt: 'Fine film grain texture overlay',
                    createdAt: new Date().toISOString()
                }
            };
        case 'gradient_mesh':
            return {
                ...baseLayer,
                src: '', // Would be filled with gradient mesh
                opacity: 0.15,
                ai: {
                    provider: 'other',
                    task: 'generate_background',
                    prompt: 'Subtle gradient mesh overlay',
                    createdAt: new Date().toISOString()
                }
            };
        case 'gloss':
            return {
                ...baseLayer,
                src: '', // Would be filled with gloss effect
                opacity: 0.12,
                ai: {
                    provider: 'other',
                    task: 'generate_background',
                    prompt: 'Glossy sheen overlay',
                    createdAt: new Date().toISOString()
                }
            };
        default:
            return baseLayer;
    }
}

/**
 * Calculate how different a variation is from the original
 */
function calculateDiversityScore(mutation: StyleMutation, texture: TextureType): number {
    const mutationScores: Record<StyleMutation, number> = {
        'shift_warm': 40,
        'shift_cool': 40,
        'high_contrast': 70,
        'muted': 50,
        'vibrant': 60
    };

    const textureScores: Record<TextureType, number> = {
        'grain': 20,
        'gradient_mesh': 30,
        'gloss': 25,
        'none': 0
    };

    return mutationScores[mutation] + textureScores[texture];
}

/**
 * Interpolate between two visual styles
 */
export function interpolateStyles(
    styleA: VisualStyle,
    styleB: VisualStyle,
    ratio: number // 0 = full A, 1 = full B
): VisualStyle {
    const clampedRatio = Math.max(0, Math.min(1, ratio));

    // Interpolate colors
    const interpolateColor = (colorA: string, colorB: string): string => {
        const hslA = hexToHSL(colorA);
        const hslB = hexToHSL(colorB);

        const interpolated = {
            h: hslA.h + (hslB.h - hslA.h) * clampedRatio,
            s: hslA.s + (hslB.s - hslA.s) * clampedRatio,
            l: hslA.l + (hslB.l - hslA.l) * clampedRatio
        };

        return hslToHex(interpolated);
    };

    return {
        id: `interpolated_${styleA.id}_${styleB.id}_${ratio}`,
        name: ratio < 0.5 ? styleA.name : styleB.name,
        colorPalette: {
            primary: interpolateColor(styleA.colorPalette.primary, styleB.colorPalette.primary),
            secondary: interpolateColor(styleA.colorPalette.secondary, styleB.colorPalette.secondary),
            accent: interpolateColor(styleA.colorPalette.accent, styleB.colorPalette.accent),
            background: interpolateColor(styleA.colorPalette.background, styleB.colorPalette.background),
            text: interpolateColor(styleA.colorPalette.text, styleB.colorPalette.text),
            scheme: ratio < 0.5 ? styleA.colorPalette.scheme : styleB.colorPalette.scheme
        },
        typography: ratio < 0.5 ? styleA.typography : styleB.typography,
        composition: ratio < 0.5 ? styleA.composition : styleB.composition
    };
}

// ========== UTILITY FUNCTIONS ==========

function hexToHSL(hex: string): { h: number; s: number; l: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 50 };

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(hsl: { h: number; s: number; l: number }): string {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
