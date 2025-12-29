/**
 * Snapping utilities for editor
 */

export interface SnapGuide {
    type: 'vertical' | 'horizontal';
    position: number;
    pixelPos: number;
    start: number;
    end: number;
}

export interface SnapResult {
    x: number;
    y: number;
    guides: SnapGuide[];
}

const SNAP_THRESHOLD = 5; // pixels

/**
 * Check if two numbers are within snap threshold
 */
function isNearby(a: number, b: number, threshold = SNAP_THRESHOLD): boolean {
    return Math.abs(a - b) <= threshold;
}

/**
 * Calculate snap position for dragged layer
 */
export function calculateSnap(
    layer: { x: number; y: number; width: number; height: number },
    otherLayers: Array<{ x: number; y: number; width: number; height: number }>,
    canvasWidth: number,
    canvasHeight: number
): SnapResult {
    const guides: SnapGuide[] = [];
    let snapX = layer.x;
    let snapY = layer.y;

    const w = layer.width;
    const h = layer.height;

    // Snap targets (canvas edges + other layer edges)
    const vTargets: number[] = [0, canvasWidth / 2, canvasWidth];
    const hTargets: number[] = [0, canvasHeight / 2, canvasHeight];

    otherLayers.forEach(other => {
        vTargets.push(other.x, other.x + other.width / 2, other.x + other.width);
        hTargets.push(other.y, other.y + other.height / 2, other.y + other.height);
    });

    // Vertical Edges of Dragged Layer
    const vEdges = [
        { val: layer.x, offset: 0 },         // Left
        { val: layer.x + w / 2, offset: w / 2 }, // Center
        { val: layer.x + w, offset: w }      // Right
    ];

    let minVDist = SNAP_THRESHOLD + 1;
    let bestVLine: { pos: number, edgeOffset: number } | null = null;

    vTargets.forEach(target => {
        vEdges.forEach(edge => {
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
            position: bestVLine.pos,
            pixelPos: bestVLine.pos,
            start: -1000,
            end: 1000
        });
    }

    // Horizontal Edges
    const hEdges = [
        { val: layer.y, offset: 0 },
        { val: layer.y + h / 2, offset: h / 2 },
        { val: layer.y + h, offset: h }
    ];

    let minHDist = SNAP_THRESHOLD + 1;
    let bestHLine: { pos: number, edgeOffset: number } | null = null;

    hTargets.forEach(target => {
        hEdges.forEach(edge => {
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
            pixelPos: bestHLine.pos,
            start: -1000,
            end: 1000
        });
    }

    return {
        x: snapX,
        y: snapY,
        guides
    };
}

/**
 * Filter only visible snap guides
 */
export function filterVisibleGuides(guides: SnapGuide[], viewportBounds: { left: number; right: number; top: number; bottom: number }): SnapGuide[] {
    return guides.filter(guide => {
        if (guide.type === 'vertical') {
            return guide.position >= viewportBounds.left && guide.position <= viewportBounds.right;
        } else {
            return guide.position >= viewportBounds.top && guide.position <= viewportBounds.bottom;
        }
    });
}
