/**
 * DESIGN PRIMITIVES ENGINE
 * 
 * Fundamental design building blocks that a professional designer uses:
 * 
 * - Modular Scale System (mathematical sizing)
 * - Grid Systems (8px, 4px grids with variations)
 * - Spacing System (consistent margins/padding)
 * - Visual Weight Calculator
 * - Golden Ratio / Fibonacci Applications
 * - Optical Corrections
 * - Alignment Mathematics
 * - Balance & Symmetry
 */

// ========================================
// MODULAR SCALE SYSTEM
// ========================================

/**
 * Modular scale ratios used in professional typography
 * Each ratio creates a harmonious progression of sizes
 */
export const MODULAR_SCALES = {
    minor_second: 1.067,      // Subtle, minimal contrast
    major_second: 1.125,      // Small steps, dense hierarchy
    minor_third: 1.2,         // Classic, balanced
    major_third: 1.25,        // Slightly more dramatic
    perfect_fourth: 1.333,    // Strong hierarchy
    augmented_fourth: 1.414,  // Very dramatic (√2)
    perfect_fifth: 1.5,       // Bold, editorial
    golden_ratio: 1.618,      // Perfect harmony
    major_sixth: 1.667,       // Strong contrast
    minor_seventh: 1.778,     // Very bold
    major_seventh: 1.875,     // Extreme contrast
    octave: 2                 // Maximum contrast
};

/**
 * Generate a complete type scale from base size
 */
export function generateTypeScale(baseSize = 16, ratio = 'golden_ratio', steps = 10) {
    const r = MODULAR_SCALES[ratio] || ratio;
    const scale = {};

    // Negative steps (smaller than base)
    for (let i = -3; i < 0; i++) {
        const size = Math.round(baseSize * Math.pow(r, i));
        scale[`xs${Math.abs(i)}`] = size;
    }

    // Base and positive steps
    scale.base = baseSize;
    const labels = ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'];
    for (let i = 1; i <= steps; i++) {
        const size = Math.round(baseSize * Math.pow(r, i));
        scale[labels[i - 1] || `${i}xl`] = size;
    }

    return scale;
}

/**
 * Get recommended type scale for ad format
 */
export function getTypeScaleForFormat(width, height) {
    const area = width * height;

    if (area < 500000) {
        // Small ads - tighter scale
        return generateTypeScale(14, 'minor_third', 6);
    } else if (area < 1000000) {
        // Medium ads - balanced
        return generateTypeScale(16, 'major_third', 8);
    } else {
        // Large ads - dramatic scale
        return generateTypeScale(18, 'perfect_fourth', 10);
    }
}

// ========================================
// GRID SYSTEMS
// ========================================

export const GRID_SYSTEMS = {
    baseline_4: {
        name: '4px Baseline Grid',
        unit: 4,
        description: 'Tight, precise layouts for UI-heavy designs',
        multipliers: [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32]
    },
    baseline_8: {
        name: '8px Baseline Grid',
        unit: 8,
        description: 'Standard spacing system (Material Design)',
        multipliers: [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20]
    },
    baseline_10: {
        name: '10px Baseline Grid',
        unit: 10,
        description: 'Easy mental math, clean numbers',
        multipliers: [1, 2, 3, 4, 5, 6, 8, 10, 12, 16]
    }
};

/**
 * Generate column grid for canvas
 */
export function generateColumnGrid(width, columns = 12, gutter = 24, margin = 48) {
    const availableWidth = width - (margin * 2);
    const totalGutters = columns - 1;
    const gutterSpace = totalGutters * gutter;
    const columnWidth = (availableWidth - gutterSpace) / columns;

    const grid = [];
    let currentX = margin;

    for (let i = 0; i < columns; i++) {
        grid.push({
            index: i,
            x: currentX,
            width: columnWidth,
            center: currentX + columnWidth / 2
        });
        currentX += columnWidth + gutter;
    }

    return {
        columns: grid,
        columnWidth,
        gutter,
        margin,
        totalWidth: width,
        contentWidth: availableWidth
    };
}

/**
 * Snap value to nearest grid unit
 */
export function snapToGrid(value, unit = 8) {
    return Math.round(value / unit) * unit;
}

/**
 * Generate spacing system
 */
export function generateSpacingSystem(unit = 8) {
    return {
        '0': 0,
        'px': 1,
        '0.5': unit * 0.5,
        '1': unit * 1,
        '1.5': unit * 1.5,
        '2': unit * 2,
        '2.5': unit * 2.5,
        '3': unit * 3,
        '4': unit * 4,
        '5': unit * 5,
        '6': unit * 6,
        '7': unit * 7,
        '8': unit * 8,
        '9': unit * 9,
        '10': unit * 10,
        '11': unit * 11,
        '12': unit * 12,
        '14': unit * 14,
        '16': unit * 16,
        '20': unit * 20,
        '24': unit * 24,
        '28': unit * 28,
        '32': unit * 32,
        '36': unit * 36,
        '40': unit * 40,
        '44': unit * 44,
        '48': unit * 48,
        '52': unit * 52,
        '56': unit * 56,
        '60': unit * 60,
        '64': unit * 64,
        '72': unit * 72,
        '80': unit * 80,
        '96': unit * 96
    };
}

// ========================================
// GOLDEN RATIO APPLICATIONS
// ========================================

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;

/**
 * Divide a dimension using golden ratio
 */
export function goldenDivide(total, preferLarger = true) {
    const larger = total * PHI_INVERSE;
    const smaller = total - larger;

    return preferLarger
        ? { primary: larger, secondary: smaller, ratio: PHI }
        : { primary: smaller, secondary: larger, ratio: PHI };
}

/**
 * Create golden rectangle
 */
export function goldenRectangle(width) {
    return {
        width,
        height: width / PHI,
        aspectRatio: PHI
    };
}

/**
 * Golden spiral points for element placement
 */
export function goldenSpiralPoints(width, height, segments = 8) {
    const points = [];
    let currentWidth = width;
    let currentHeight = height;
    let x = 0;
    let y = 0;
    let direction = 0; // 0: right, 1: down, 2: left, 3: up

    for (let i = 0; i < segments; i++) {
        const isHorizontal = direction % 2 === 0;
        const size = isHorizontal ? currentWidth * PHI_INVERSE : currentHeight * PHI_INVERSE;

        points.push({
            x: x + (isHorizontal ? size / 2 : 0),
            y: y + (isHorizontal ? 0 : size / 2),
            size,
            segment: i
        });

        // Update position and size based on direction
        switch (direction % 4) {
            case 0: x += size; currentWidth -= size; break;
            case 1: y += size; currentHeight -= size; break;
            case 2: x -= size; currentWidth -= size; break;
            case 3: y -= size; currentHeight -= size; break;
        }
        direction++;
    }

    return points;
}

// ========================================
// RULE OF THIRDS
// ========================================

export function ruleOfThirdsGrid(width, height) {
    const thirdW = width / 3;
    const thirdH = height / 3;

    return {
        lines: {
            vertical: [thirdW, thirdW * 2],
            horizontal: [thirdH, thirdH * 2]
        },
        powerPoints: [
            { x: thirdW, y: thirdH, name: 'top-left' },
            { x: thirdW * 2, y: thirdH, name: 'top-right' },
            { x: thirdW, y: thirdH * 2, name: 'bottom-left' },
            { x: thirdW * 2, y: thirdH * 2, name: 'bottom-right' }
        ],
        zones: {
            topLeft: { x: 0, y: 0, width: thirdW, height: thirdH },
            topCenter: { x: thirdW, y: 0, width: thirdW, height: thirdH },
            topRight: { x: thirdW * 2, y: 0, width: thirdW, height: thirdH },
            middleLeft: { x: 0, y: thirdH, width: thirdW, height: thirdH },
            center: { x: thirdW, y: thirdH, width: thirdW, height: thirdH },
            middleRight: { x: thirdW * 2, y: thirdH, width: thirdW, height: thirdH },
            bottomLeft: { x: 0, y: thirdH * 2, width: thirdW, height: thirdH },
            bottomCenter: { x: thirdW, y: thirdH * 2, width: thirdW, height: thirdH },
            bottomRight: { x: thirdW * 2, y: thirdH * 2, width: thirdW, height: thirdH }
        }
    };
}

// ========================================
// VISUAL WEIGHT CALCULATOR
// ========================================

/**
 * Calculate visual weight of an element
 * Higher weight = draws more attention
 */
export function calculateVisualWeight(element) {
    let weight = 0;

    // Size factor (larger = heavier)
    const area = (element.width || 100) * (element.height || 100);
    weight += Math.sqrt(area) / 10;

    // Color factor (darker/saturated = heavier)
    if (element.color) {
        const rgb = hexToRgb(element.color);
        if (rgb) {
            // Darker colors have more weight
            const darkness = 1 - (rgb.r + rgb.g + rgb.b) / (255 * 3);
            weight += darkness * 30;

            // Saturated colors have more weight
            const max = Math.max(rgb.r, rgb.g, rgb.b);
            const min = Math.min(rgb.r, rgb.g, rgb.b);
            const saturation = max === 0 ? 0 : (max - min) / max;
            weight += saturation * 20;
        }
    }

    // Warm colors have more weight
    if (element.isWarmColor) weight += 10;

    // Irregular shapes have more weight than regular
    if (element.isIrregular) weight += 15;

    // Text/content density
    if (element.textDensity) weight += element.textDensity * 10;

    // High contrast elements
    if (element.hasHighContrast) weight += 20;

    // Position (top = lighter, bottom = heavier perception)
    if (element.y) {
        weight += (element.y / 1080) * 5; // Assuming 1080 height
    }

    return Math.round(weight);
}

/**
 * Calculate if composition is balanced
 */
export function calculateBalance(elements, canvasWidth, canvasHeight) {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    let totalWeight = 0;
    let weightedSumX = 0;
    let weightedSumY = 0;

    for (const element of elements) {
        const weight = calculateVisualWeight(element);
        totalWeight += weight;

        const elementCenterX = element.x + (element.width || 0) / 2;
        const elementCenterY = element.y + (element.height || 0) / 2;

        weightedSumX += (elementCenterX - centerX) * weight;
        weightedSumY += (elementCenterY - centerY) * weight;
    }

    // Calculate center of visual mass
    const visualCenterX = centerX + (weightedSumX / (totalWeight || 1));
    const visualCenterY = centerY + (weightedSumY / (totalWeight || 1));

    // Distance from true center (0 = perfect balance)
    const offsetX = Math.abs(visualCenterX - centerX) / centerX;
    const offsetY = Math.abs(visualCenterY - centerY) / centerY;

    return {
        isBalanced: offsetX < 0.15 && offsetY < 0.15,
        balanceScore: 1 - (offsetX + offsetY) / 2,
        visualCenter: { x: visualCenterX, y: visualCenterY },
        offset: { x: offsetX, y: offsetY },
        recommendation: offsetX > 0.15
            ? (weightedSumX > 0 ? 'Add weight to left side' : 'Add weight to right side')
            : (offsetY > 0.15
                ? (weightedSumY > 0 ? 'Add weight to top' : 'Add weight to bottom')
                : 'Composition is balanced')
    };
}

// ========================================
// OPTICAL CORRECTIONS
// ========================================

/**
 * Optical adjustments for perfect visual alignment
 * (What mathematically centered doesn't look centered)
 */
export const OPTICAL_CORRECTIONS = {
    // Circles need to be slightly larger than squares to look equal
    circleVsSquare: 1.08,

    // Triangles pointing up need to extend past baseline
    triangleOvershoot: 0.04,

    // Text optical center is slightly above mathematical center
    textOpticalCenterOffset: -0.03,

    // Icons should be slightly larger than text to match visual weight
    iconVsTextScale: 1.1,

    // Right side of layouts feels heavier, compensate
    rightSideCompensation: 0.97,

    // Bottom needs more padding than top for visual balance
    bottomPaddingMultiplier: 1.15,

    // Letter spacing adjustments for large text
    largeTextLetterSpacing: -0.02,

    // Line height for headlines vs body
    headlineLineHeight: 1.1,
    bodyLineHeight: 1.5
};

/**
 * Get optically centered position
 */
export function getOpticalCenter(containerWidth, containerHeight, elementWidth, elementHeight, elementType = 'generic') {
    let x = (containerWidth - elementWidth) / 2;
    let y = (containerHeight - elementHeight) / 2;

    switch (elementType) {
        case 'text':
        case 'headline':
            // Text looks better slightly above mathematical center
            y = y - (containerHeight * OPTICAL_CORRECTIONS.textOpticalCenterOffset);
            break;
        case 'circle':
        case 'icon':
            // No adjustment needed, already centered
            break;
        case 'triangle':
            // Triangles need slight offset
            y = y - (elementHeight * OPTICAL_CORRECTIONS.triangleOvershoot);
            break;
        case 'product':
        case 'image':
            // Products look better slightly above center
            y = y - (containerHeight * 0.02);
            break;
    }

    return { x: Math.round(x), y: Math.round(y) };
}

// ========================================
// ASPECT RATIOS
// ========================================

export const ASPECT_RATIOS = {
    // Common social media
    square: { ratio: 1, name: '1:1', description: 'Instagram/Facebook Feed' },
    portrait: { ratio: 4 / 5, name: '4:5', description: 'Instagram Portrait' },
    story: { ratio: 9 / 16, name: '9:16', description: 'Stories/Reels' },
    landscape_16_9: { ratio: 16 / 9, name: '16:9', description: 'YouTube/Wide' },
    landscape_4_3: { ratio: 4 / 3, name: '4:3', description: 'Classic TV' },

    // Print/Design
    a4: { ratio: 1 / 1.414, name: 'A4', description: 'ISO A4 Paper' },
    letter: { ratio: 8.5 / 11, name: 'Letter', description: 'US Letter' },
    golden: { ratio: 1 / PHI, name: 'Golden', description: 'Golden Ratio' },

    // Cinema
    cinemascope: { ratio: 2.35, name: '2.35:1', description: 'Cinemascope' },
    anamorphic: { ratio: 2.39, name: '2.39:1', description: 'Anamorphic' },

    // Pinterest
    pinterest_long: { ratio: 2 / 3, name: '2:3', description: 'Pinterest Optimal' },
    pinterest_standard: { ratio: 0.6, name: '3:5', description: 'Pinterest Standard' }
};

/**
 * Get dimensions for aspect ratio
 */
export function getDimensionsForRatio(ratio, baseWidth) {
    const r = typeof ratio === 'string' ? ASPECT_RATIOS[ratio]?.ratio : ratio;
    return {
        width: baseWidth,
        height: Math.round(baseWidth / r)
    };
}

// ========================================
// ALIGNMENT HELPERS
// ========================================

export function alignElements(elements, alignment, containerWidth, containerHeight) {
    const aligned = [...elements];

    switch (alignment) {
        case 'left':
            aligned.forEach(el => el.x = 0);
            break;
        case 'center':
            aligned.forEach(el => el.x = (containerWidth - (el.width || 0)) / 2);
            break;
        case 'right':
            aligned.forEach(el => el.x = containerWidth - (el.width || 0));
            break;
        case 'top':
            aligned.forEach(el => el.y = 0);
            break;
        case 'middle':
            aligned.forEach(el => el.y = (containerHeight - (el.height || 0)) / 2);
            break;
        case 'bottom':
            aligned.forEach(el => el.y = containerHeight - (el.height || 0));
            break;
        case 'distribute-horizontal':
            {
                const totalWidth = elements.reduce((sum, el) => sum + (el.width || 0), 0);
                const gap = (containerWidth - totalWidth) / (elements.length + 1);
                let currentX = gap;
                aligned.forEach(el => {
                    el.x = currentX;
                    currentX += (el.width || 0) + gap;
                });
            }
            break;
        case 'distribute-vertical':
            {
                const totalHeight = elements.reduce((sum, el) => sum + (el.height || 0), 0);
                const gap = (containerHeight - totalHeight) / (elements.length + 1);
                let currentY = gap;
                aligned.forEach(el => {
                    el.y = currentY;
                    currentY += (el.height || 0) + gap;
                });
            }
            break;
    }

    return aligned;
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export default {
    MODULAR_SCALES,
    GRID_SYSTEMS,
    ASPECT_RATIOS,
    OPTICAL_CORRECTIONS,
    generateTypeScale,
    getTypeScaleForFormat,
    generateColumnGrid,
    snapToGrid,
    generateSpacingSystem,
    goldenDivide,
    goldenRectangle,
    goldenSpiralPoints,
    ruleOfThirdsGrid,
    calculateVisualWeight,
    calculateBalance,
    getOpticalCenter,
    getDimensionsForRatio,
    alignElements
};
