import { StudioLayer } from "../types/studio";

export interface SnapGuide {
    type: 'vertical' | 'horizontal';
    position: number;
    pixelPos: number; // Viewport pixel position? Or Stage coordinate? Stage.
    start: number;
    end: number;
}

export interface SnapResult {
    x: number;
    y: number;
    guides: SnapGuide[];
}

const SNAP_THRESHOLD = 5;

// Helper to get edges
const getGuides = (layer: StudioLayer) => {
    // Assuming width/height exist or defaulting (same issue as alignment)
    // We really need real width/height from Konva nodes if possible, but 
    // for MVP we use data model.
    const w = (layer as any).width || 100; // Default fallback
    const h = (layer as any).height || 100;

    return {
        vertical: [
            layer.x,             // Left
            layer.x + w / 2,     // Center
            layer.x + w          // Right
        ],
        horizontal: [
            layer.y,             // Top
            layer.y + h / 2,     // Middle
            layer.y + h          // Bottom
        ]
    };
};

export const getSnapLines = (
    layer: StudioLayer,
    otherLayers: StudioLayer[],
    stageWidth: number,
    stageHeight: number
): SnapResult => {
    const w = (layer as any).width || 100;
    const h = (layer as any).height || 100;

    // Dragged layer proposed positions
    // Note: 'layer' passed here has the *new* (dragged) x/y

    let snapX = layer.x;
    let snapY = layer.y;
    const guides: SnapGuide[] = [];

    // Target Snap Points (Stage & Other Layers)
    const vTargets = [0, stageWidth / 2, stageWidth];
    const hTargets = [0, stageHeight / 2, stageHeight];

    otherLayers.forEach(l => {
        // Skip hidden/locked? Maybe.
        const g = getGuides(l);
        vTargets.push(...g.vertical);
        hTargets.push(...g.horizontal);
    });

    // Find closest vertical snap
    // We check absolute distance between layer edges and target lines

    // Vertical Edges of Dragged Layer
    const vEdges = [
        { val: layer.x, offset: 0 },         // Left
        { val: layer.x + w / 2, offset: w / 2 }, // Center
        { val: layer.x + w, offset: w }      // Right
    ];

    let minVDist = SNAP_THRESHOLD + 1;
    let bestVLine: { pos: number, edgeOffset: number } | null = null;

    // Check all combinations
    vEdges.forEach(edge => {
        vTargets.forEach(target => {
            const dist = Math.abs(edge.val - target);
            if (dist < minVDist) {
                minVDist = dist;
                bestVLine = { pos: target, edgeOffset: edge.offset };
            }
        });
    });

    if (bestVLine) {
        snapX = bestVLine.pos - bestVLine.edgeOffset;
        guides.push({
            type: 'vertical',
            position: bestVLine.pos, // For rendering line at this x
            pixelPos: bestVLine.pos,
            start: -1000, // Infinite line visually or relative to matched objects?
            end: 1000 // For now just long line
            //Ideally we calculate min/max Y of matched objects for pretty guides
        });
    }

    // Horizontal
    const hEdges = [
        { val: layer.y, offset: 0 },         // Top
        { val: layer.y + h / 2, offset: h / 2 }, // Middle
        { val: layer.y + h, offset: h }      // Bottom
    ];

    let minHDist = SNAP_THRESHOLD + 1;
    let bestHLine: { pos: number, edgeOffset: number } | null = null;

    hEdges.forEach(edge => {
        hTargets.forEach(target => {
            const dist = Math.abs(edge.val - target);
            if (dist < minHDist) {
                minHDist = dist;
                bestHLine = { pos: target, edgeOffset: edge.offset };
            }
        });
    });

    if (bestHLine) {
        snapY = bestHLine.pos - bestHLine.edgeOffset;
        guides.push({
            type: 'horizontal',
            position: bestHLine.pos,
            pixelPos: bestHLine.pos, // y position
            start: -1000,
            end: 1000
        });
    }

    return { x: snapX, y: snapY, guides };
};
