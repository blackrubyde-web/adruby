import { StudioLayer } from "../types/studio";

export type Alignment = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
export type Distribution = 'horizontal' | 'vertical';

export const getLayerBounds = (layer: StudioLayer): { x: number; y: number; width: number; height: number } => {
    // Basic bounds. For groups, this might need recursion if we want precise content bounds, 
    // but usually groups have x/y. However, Konva groups don't always have width/height unless set.
    // In our data model, we should arguably maintain width/height for groups or calc it.
    // For now, let's assume standard properties or approx.
    // If width/height are 0/undefined for groups, we might need to assume 0 or calc from children.

    // Simplification: Use layer properties.
    return {
        x: layer.x,
        y: layer.y,
        width: (layer as any).width || 0,
        height: (layer as any).height || 0
    };
};

export const alignLayers = (
    layers: StudioLayer[],
    selectedIds: string[],
    type: Alignment,
    canvasWidth: number,
    canvasHeight: number
): StudioLayer[] => {
    if (selectedIds.length === 0) return layers;

    const selectedLayers = layers.filter(l => selectedIds.includes(l.id));

    // 1. Calculate Reference Bounds
    let refBounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity, width: 0, height: 0, centerX: 0, centerY: 0 };

    if (selectedLayers.length === 1) {
        // Align to Canvas
        refBounds = {
            minX: 0, minY: 0,
            maxX: canvasWidth, maxY: canvasHeight,
            width: canvasWidth, height: canvasHeight,
            centerX: canvasWidth / 2, centerY: canvasHeight / 2
        };
    } else {
        // Align to Selection Box
        selectedLayers.forEach(l => {
            const b = getLayerBounds(l);
            refBounds.minX = Math.min(refBounds.minX, b.x);
            refBounds.minY = Math.min(refBounds.minY, b.y);
            refBounds.maxX = Math.max(refBounds.maxX, b.x + b.width);
            refBounds.maxY = Math.max(refBounds.maxY, b.y + b.height);
        });
        refBounds.width = refBounds.maxX - refBounds.minX;
        refBounds.height = refBounds.maxY - refBounds.minY;
        refBounds.centerX = refBounds.minX + refBounds.width / 2;
        refBounds.centerY = refBounds.minY + refBounds.height / 2;
    }

    // 2. Map updates
    return layers.map(layer => {
        if (!selectedIds.includes(layer.id)) return layer;

        const b = getLayerBounds(layer);
        let newX = layer.x;
        let newY = layer.y;

        switch (type) {
            case 'left':
                newX = refBounds.minX;
                break;
            case 'center':
                newX = refBounds.centerX - (b.width / 2);
                break;
            case 'right':
                newX = refBounds.maxX - b.width;
                break;
            case 'top':
                newY = refBounds.minY;
                break;
            case 'middle':
                newY = refBounds.centerY - (b.height / 2);
                break;
            case 'bottom':
                newY = refBounds.maxY - b.height;
                break;
        }

        return { ...layer, x: newX, y: newY };
    });
};

export const distributeLayers = (
    layers: StudioLayer[],
    selectedIds: string[],
    type: Distribution
): StudioLayer[] => {
    if (selectedIds.length < 3) return layers; // Need 3 to distribute

    const selectedLayers = layers.filter(l => selectedIds.includes(l.id));

    // Sort by position
    const sorted = [...selectedLayers].sort((a, b) => {
        const bA = getLayerBounds(a);
        const bB = getLayerBounds(b);
        return type === 'horizontal' ? bA.x - bB.x : bA.y - bB.y;
    });

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const bFirst = getLayerBounds(first);
    const bLast = getLayerBounds(last);

    if (type === 'horizontal') {
        const start = bFirst.x; // Left of first
        const end = bLast.x + bLast.width; // Right of last
        // const totalWidth = end - start;

        // Sum of widths of all items
        // const sumWidths = sorted.reduce((sum, l) => sum + getLayerBounds(l).width, 0);
        // const availableSpace = totalWidth - sumWidths;

        // Gap
        // Actually, "Distribute Horizontally" usually means equal spacing between centers OR equal gap between edges.
        // Standard (e.g. Figma "Distribute Horizontal Spacing") = equal gaps.
        // Figma "Distribute Horizontal Centers" = equal center-to-center.

        // Let's implement "Distribute Centers" (simpler) or "Distribute Spacing" (better for layouts).
        // Let's go with Distribute Spacing (checking boundaries of first and last, and spreading intermediate ones).

        // Using "Distribute Centers":
        // Center of first to Center of last.
        // Range = CenterLast - CenterFirst.
        // Step = Range / (n-1).

        const cFirst = bFirst.x + bFirst.width / 2;
        const cLast = bLast.x + bLast.width / 2;
        const range = cLast - cFirst;
        const step = range / (sorted.length - 1);

        return layers.map(l => {
            const idx = sorted.findIndex(s => s.id === l.id);
            if (idx === -1) return l;
            if (idx === 0 || idx === sorted.length - 1) return l; // First and last don't move

            const newCenter = cFirst + (step * idx);
            const b = getLayerBounds(l);
            return { ...l, x: newCenter - b.width / 2 };
        });
    } else {
        // Vertical
        const cFirst = bFirst.y + bFirst.height / 2;
        const cLast = bLast.y + bLast.height / 2;
        const range = cLast - cFirst;
        const step = range / (sorted.length - 1);

        return layers.map(l => {
            const idx = sorted.findIndex(s => s.id === l.id);
            if (idx === -1) return l;
            if (idx === 0 || idx === sorted.length - 1) return l;

            const newCenter = cFirst + (step * idx);
            const b = getLayerBounds(l);
            return { ...l, y: newCenter - b.height / 2 };
        });
    }
};
