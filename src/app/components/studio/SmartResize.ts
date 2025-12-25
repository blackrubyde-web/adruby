// Smart Resize - Intelligent layer repositioning across formats
// Preserves visual hierarchy and proportions

import type { AdDocument, StudioLayer } from '../../types/studio';

export interface FormatPreset {
    id: string;
    name: string;
    width: number;
    height: number;
    platform: string;
}

export const FORMAT_PRESETS: FormatPreset[] = [
    { id: 'square', name: 'Square', width: 1080, height: 1080, platform: 'Instagram Post' },
    { id: 'story', name: 'Story', width: 1080, height: 1920, platform: 'Instagram/TikTok Story' },
    { id: 'landscape', name: 'Landscape', width: 1920, height: 1080, platform: 'Facebook/YouTube' },
    { id: 'portrait', name: 'Portrait', width: 1080, height: 1350, platform: 'Instagram Portrait' },
    { id: 'twitter', name: 'Twitter', width: 1200, height: 675, platform: 'Twitter/X Post' },
    { id: 'linkedin', name: 'LinkedIn', width: 1200, height: 627, platform: 'LinkedIn Post' },
    { id: 'banner', name: 'Banner', width: 728, height: 90, platform: 'Web Banner' },
    { id: 'leaderboard', name: 'Leaderboard', width: 970, height: 250, platform: 'Web Leaderboard' },
    { id: 'pinterest', name: 'Pinterest', width: 1000, height: 1500, platform: 'Pinterest Pin' }
];

// Layer importance weights for smart positioning
function getLayerImportance(layer: StudioLayer): number {
    switch (layer.type) {
        case 'cta': return 100; // Most important - always visible
        case 'text': return 80; // Headlines important
        case 'product': return 70; // Product images important
        case 'logo': return 60; // Logo should be visible
        case 'background': return 10; // Least important
        case 'overlay': return 20;
        default: return 50;
    }
}

// Smart resize algorithm
export function smartResize(doc: AdDocument, targetFormat: FormatPreset): AdDocument {
    const { width: oldW, height: oldH } = doc;
    const { width: newW, height: newH } = targetFormat;

    const scaleX = newW / oldW;
    const scaleY = newH / oldH;
    const uniformScale = Math.min(scaleX, scaleY);

    // Determine aspect ratio change
    const oldRatio = oldW / oldH;
    const newRatio = newW / newH;
    const isGoingWider = newRatio > oldRatio;
    const isGoingTaller = newRatio < oldRatio;

    // Sort layers by importance
    const sortedLayers = [...doc.layers].sort((a, b) => getLayerImportance(b) - getLayerImportance(a));

    const newLayers = sortedLayers.map((layer, idx) => {
        const importance = getLayerImportance(layer);

        // Calculate new dimensions
        let newWidth = layer.width * uniformScale;
        let newHeight = layer.height * uniformScale;

        // For high-importance layers, ensure minimum size
        if (importance >= 70) {
            const minSize = Math.min(newW, newH) * 0.2;
            newWidth = Math.max(newWidth, minSize);
            newHeight = Math.max(newHeight, newWidth * (layer.height / layer.width));
        }

        // Calculate new position based on layer type
        let newX: number;
        let newY: number;

        if (layer.type === 'background' || layer.type === 'overlay') {
            // Full coverage for backgrounds
            newX = 0;
            newY = 0;
            newWidth = newW;
            newHeight = newH;
        } else if (layer.type === 'cta') {
            // CTA: center horizontally, position at golden ratio from bottom
            newX = (newW - newWidth) / 2;
            newY = newH * 0.75 - newHeight / 2;
        } else if (layer.type === 'text') {
            // Text: maintain relative horizontal position, adjust vertical
            const relX = (layer.x + layer.width / 2) / oldW;
            const relY = (layer.y + layer.height / 2) / oldH;

            // Slight adjustment for tall formats - push text higher
            const yAdjust = isGoingTaller ? 0.9 : 1;

            newX = newW * relX - newWidth / 2;
            newY = newH * relY * yAdjust - newHeight / 2;
        } else if (layer.type === 'product') {
            // Product: try to keep centered or in upper portion
            const relX = (layer.x + layer.width / 2) / oldW;
            const relY = (layer.y + layer.height / 2) / oldH;

            // For taller formats, position product higher
            const yAdjust = isGoingTaller ? 0.7 : isGoingWider ? 1.1 : 1;

            newX = newW * relX - newWidth / 2;
            newY = newH * relY * yAdjust - newHeight / 2;
        } else if (layer.type === 'logo') {
            // Logo: top corner
            newX = newW * 0.05;
            newY = newH * 0.05;
            // Keep logo proportionally smaller
            newWidth = Math.min(newWidth, newW * 0.15);
            newHeight = newWidth * (layer.height / layer.width);
        } else {
            // Default: proportional repositioning
            const relX = layer.x / oldW;
            const relY = layer.y / oldH;
            newX = newW * relX;
            newY = newH * relY;
        }

        // Ensure layer stays within bounds
        newX = Math.max(0, Math.min(newX, newW - newWidth));
        newY = Math.max(0, Math.min(newY, newH - newHeight));

        // Adjust font size for text layers
        let fontSize = (layer as any).fontSize;
        if (fontSize) {
            fontSize = Math.round(fontSize * uniformScale);
            // Ensure minimum readability
            fontSize = Math.max(fontSize, 14);
            // Cap maximum size
            fontSize = Math.min(fontSize, 120);
        }

        return {
            ...layer,
            x: Math.round(newX),
            y: Math.round(newY),
            width: Math.round(newWidth),
            height: Math.round(newHeight),
            ...(fontSize && { fontSize })
        };
    });

    // Re-sort by original zIndex
    newLayers.sort((a, b) => a.zIndex - b.zIndex);

    return {
        ...doc,
        width: newW,
        height: newH,
        layers: newLayers,
        safeArea: {
            top: Math.round(newH * 0.05),
            right: Math.round(newW * 0.05),
            bottom: Math.round(newH * 0.1),
            left: Math.round(newW * 0.05)
        }
    };
}

// Generate all format variations at once
export function generateAllFormats(doc: AdDocument): { format: FormatPreset; doc: AdDocument }[] {
    return FORMAT_PRESETS.map(format => ({
        format,
        doc: smartResize(doc, format)
    }));
}

// Quick check if a resize maintains visual quality
export function assessResizeQuality(original: AdDocument, resized: AdDocument): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 100;

    // Check if any important layers are too small
    resized.layers.forEach(layer => {
        const importance = getLayerImportance(layer);
        if (importance >= 70) {
            const areaRatio = (layer.width * layer.height) / (resized.width * resized.height);
            if (areaRatio < 0.02) {
                issues.push(`${layer.name} may be too small`);
                score -= 10;
            }
        }
    });

    // Check if CTA is visible
    const cta = resized.layers.find(l => l.type === 'cta');
    if (cta) {
        if (cta.y + cta.height > resized.height * 0.95) {
            issues.push('CTA may be cut off');
            score -= 20;
        }
    }

    return { score: Math.max(0, score), issues };
}
