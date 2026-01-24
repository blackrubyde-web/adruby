/**
 * DYNAMIC SHAPE GENERATOR
 * 
 * Generates decorative shapes, abstract forms, and visual elements:
 * 
 * - Geometric shapes (circles, rectangles, triangles, polygons)
 * - Organic shapes (blobs, waves, clouds)
 * - Abstract forms (mesh, lines, grids)
 * - Decorative elements (dividers, frames, corners)
 * - Data visualization shapes (bars, pies, progress)
 * 
 * All generated as high-quality SVG or PNG buffers
 */

import sharp from 'sharp';

// ========================================
// GEOMETRIC SHAPES
// ========================================

/**
 * Generate circle with optional gradient/glow
 */
export function generateCircle({
    cx = 100,
    cy = 100,
    radius = 50,
    fill = '#3B82F6',
    fillOpacity = 1,
    stroke = null,
    strokeWidth = 0,
    blur = 0,
    glow = null,
    gradientColors = null,
    gradientAngle = 90
}) {
    const id = `circle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let defs = '';
    let fillValue = fill;
    let filter = '';

    // Gradient fill
    if (gradientColors && gradientColors.length >= 2) {
        const gradId = `grad_${id}`;
        const radians = (gradientAngle * Math.PI) / 180;
        const x1 = 50 - 50 * Math.cos(radians);
        const y1 = 50 - 50 * Math.sin(radians);
        const x2 = 50 + 50 * Math.cos(radians);
        const y2 = 50 + 50 * Math.sin(radians);

        const stops = gradientColors.map((c, i) =>
            `<stop offset="${Math.round(i / (gradientColors.length - 1) * 100)}%" stop-color="${c}"/>`
        ).join('');

        defs += `<linearGradient id="${gradId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${stops}</linearGradient>`;
        fillValue = `url(#${gradId})`;
    }

    // Glow effect
    if (glow) {
        const glowId = `glow_${id}`;
        defs += `
            <filter id="${glowId}" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="${glow.blur || 10}" result="blur"/>
                <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${glow.opacity || 0.5} 0"/>
            </filter>
        `;
        filter = `filter="url(#${glowId})"`;
    }

    // Blur effect
    if (blur > 0 && !glow) {
        const blurId = `blur_${id}`;
        defs += `<filter id="${blurId}"><feGaussianBlur stdDeviation="${blur}"/></filter>`;
        filter = `filter="url(#${blurId})"`;
    }

    const strokeAttr = stroke ? `stroke="${stroke}" stroke-width="${strokeWidth}"` : '';

    return {
        svg: `
            ${defs ? `<defs>${defs}</defs>` : ''}
            <circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fillValue}" fill-opacity="${fillOpacity}" ${strokeAttr} ${filter}/>
        `,
        bounds: { x: cx - radius, y: cy - radius, width: radius * 2, height: radius * 2 }
    };
}

/**
 * Generate rectangle with rounded corners
 */
export function generateRectangle({
    x = 0,
    y = 0,
    width = 200,
    height = 100,
    rx = 0,
    ry = 0,
    fill = '#3B82F6',
    fillOpacity = 1,
    stroke = null,
    strokeWidth = 0,
    rotation = 0,
    blur = 0,
    gradientColors = null,
    gradientAngle = 135
}) {
    const id = `rect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let defs = '';
    let fillValue = fill;
    let filter = '';
    let transform = '';

    // Gradient
    if (gradientColors && gradientColors.length >= 2) {
        const gradId = `grad_${id}`;
        const radians = (gradientAngle * Math.PI) / 180;
        const x1 = 50 - 50 * Math.cos(radians);
        const y1 = 50 - 50 * Math.sin(radians);
        const x2 = 50 + 50 * Math.cos(radians);
        const y2 = 50 + 50 * Math.sin(radians);

        const stops = gradientColors.map((c, i) =>
            `<stop offset="${Math.round(i / (gradientColors.length - 1) * 100)}%" stop-color="${c}"/>`
        ).join('');

        defs += `<linearGradient id="${gradId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${stops}</linearGradient>`;
        fillValue = `url(#${gradId})`;
    }

    // Blur
    if (blur > 0) {
        const blurId = `blur_${id}`;
        defs += `<filter id="${blurId}"><feGaussianBlur stdDeviation="${blur}"/></filter>`;
        filter = `filter="url(#${blurId})"`;
    }

    // Rotation
    if (rotation !== 0) {
        const cx = x + width / 2;
        const cy = y + height / 2;
        transform = `transform="rotate(${rotation} ${cx} ${cy})"`;
    }

    const strokeAttr = stroke ? `stroke="${stroke}" stroke-width="${strokeWidth}"` : '';

    return {
        svg: `
            ${defs ? `<defs>${defs}</defs>` : ''}
            <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" ry="${ry}" fill="${fillValue}" fill-opacity="${fillOpacity}" ${strokeAttr} ${filter} ${transform}/>
        `,
        bounds: { x, y, width, height }
    };
}

/**
 * Generate polygon (triangle, hexagon, etc.)
 */
export function generatePolygon({
    cx = 100,
    cy = 100,
    radius = 50,
    sides = 6,
    rotation = 0,
    fill = '#3B82F6',
    fillOpacity = 1,
    stroke = null,
    strokeWidth = 0,
    gradientColors = null
}) {
    const id = `poly_${Date.now()}`;
    let defs = '';
    let fillValue = fill;

    // Generate points
    const points = [];
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI / sides) - Math.PI / 2 + (rotation * Math.PI / 180);
        points.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
    }

    // Gradient
    if (gradientColors && gradientColors.length >= 2) {
        const gradId = `grad_${id}`;
        const stops = gradientColors.map((c, i) =>
            `<stop offset="${Math.round(i / (gradientColors.length - 1) * 100)}%" stop-color="${c}"/>`
        ).join('');
        defs = `<linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">${stops}</linearGradient>`;
        fillValue = `url(#${gradId})`;
    }

    const strokeAttr = stroke ? `stroke="${stroke}" stroke-width="${strokeWidth}"` : '';

    return {
        svg: `
            ${defs ? `<defs>${defs}</defs>` : ''}
            <polygon points="${points.join(' ')}" fill="${fillValue}" fill-opacity="${fillOpacity}" ${strokeAttr}/>
        `,
        bounds: { x: cx - radius, y: cy - radius, width: radius * 2, height: radius * 2 }
    };
}

// ========================================
// ORGANIC SHAPES
// ========================================

/**
 * Generate organic blob shape
 */
export function generateBlob({
    cx = 200,
    cy = 200,
    size = 100,
    complexity = 6,
    fill = '#3B82F6',
    fillOpacity = 0.6,
    blur = 20,
    seed = null
}) {
    const id = `blob_${Date.now()}`;
    const random = seed !== null ? seededRandom(seed) : Math.random;

    // Generate bezier curve points for organic shape
    const points = [];
    const angleStep = (2 * Math.PI) / complexity;

    for (let i = 0; i < complexity; i++) {
        const angle = i * angleStep;
        const variance = 0.2 + random() * 0.3;
        const r = size * (0.7 + variance);

        points.push({
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle)
        });
    }

    // Build smooth path using bezier curves
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        path += ` Q ${p1.x} ${p1.y} ${midX} ${midY}`;
    }
    path += ' Z';

    const blurFilter = blur > 0
        ? `<filter id="blur_${id}"><feGaussianBlur stdDeviation="${blur}"/></filter>`
        : '';

    return {
        svg: `
            <defs>${blurFilter}</defs>
            <path d="${path}" fill="${fill}" fill-opacity="${fillOpacity}" ${blur > 0 ? `filter="url(#blur_${id})"` : ''}/>
        `,
        path,
        bounds: { x: cx - size, y: cy - size, width: size * 2, height: size * 2 }
    };
}

/**
 * Generate wave pattern
 */
export function generateWave({
    width = 1080,
    height = 200,
    amplitude = 50,
    frequency = 2,
    phase = 0,
    fill = '#3B82F6',
    fillOpacity = 0.3,
    gradientColors = null
}) {
    const id = `wave_${Date.now()}`;
    let fillValue = fill;
    let defs = '';

    // Generate wave path
    let path = `M 0 ${height}`;
    const steps = 100;

    for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * width;
        const y = height / 2 + amplitude * Math.sin((i / steps) * frequency * 2 * Math.PI + phase);
        path += ` L ${x} ${y}`;
    }

    path += ` L ${width} ${height} L 0 ${height} Z`;

    // Gradient
    if (gradientColors && gradientColors.length >= 2) {
        const gradId = `grad_${id}`;
        const stops = gradientColors.map((c, i) =>
            `<stop offset="${Math.round(i / (gradientColors.length - 1) * 100)}%" stop-color="${c}"/>`
        ).join('');
        defs = `<linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="0%">${stops}</linearGradient>`;
        fillValue = `url(#${gradId})`;
    }

    return {
        svg: `
            ${defs ? `<defs>${defs}</defs>` : ''}
            <path d="${path}" fill="${fillValue}" fill-opacity="${fillOpacity}"/>
        `,
        path,
        bounds: { x: 0, y: 0, width, height }
    };
}

/**
 * Generate cloud shape
 */
export function generateCloud({
    cx = 200,
    cy = 100,
    width = 300,
    height = 150,
    fill = '#FFFFFF',
    fillOpacity = 0.2,
    blur = 30,
    puffs = 5
}) {
    const id = `cloud_${Date.now()}`;
    const circles = [];

    // Generate puffy circles for cloud
    const baseY = cy + height * 0.2;
    const stepX = width / (puffs + 1);

    for (let i = 1; i <= puffs; i++) {
        const x = cx - width / 2 + stepX * i;
        const radiusVariance = 0.7 + Math.random() * 0.6;
        const r = (height / 3) * radiusVariance;
        const yOffset = -Math.abs(Math.sin(i / puffs * Math.PI)) * (height * 0.4);

        circles.push(`<circle cx="${x}" cy="${baseY + yOffset}" r="${r}" fill="${fill}"/>`);
    }

    // Add base ellipse
    circles.push(`<ellipse cx="${cx}" cy="${baseY + height * 0.1}" rx="${width * 0.45}" ry="${height * 0.25}" fill="${fill}"/>`);

    const blurFilter = blur > 0
        ? `<filter id="blur_${id}"><feGaussianBlur stdDeviation="${blur}"/></filter>`
        : '';

    return {
        svg: `
            <defs>${blurFilter}</defs>
            <g fill-opacity="${fillOpacity}" ${blur > 0 ? `filter="url(#blur_${id})"` : ''}>
                ${circles.join('\n')}
            </g>
        `,
        bounds: { x: cx - width / 2, y: cy - height / 2, width, height }
    };
}

// ========================================
// ABSTRACT FORMS
// ========================================

/**
 * Generate abstract line pattern
 */
export function generateLinePattern({
    width = 1080,
    height = 1080,
    lines = 20,
    strokeColor = '#FFFFFF',
    strokeOpacity = 0.1,
    strokeWidth = 1,
    direction = 'diagonal', // 'horizontal', 'vertical', 'diagonal', 'random'
    spacing = null,
    curved = false
}) {
    const actualSpacing = spacing || height / lines;
    const lineElements = [];

    for (let i = 0; i < lines; i++) {
        let line = '';
        const y = i * actualSpacing;

        switch (direction) {
            case 'horizontal':
                line = `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${strokeColor}" stroke-opacity="${strokeOpacity}" stroke-width="${strokeWidth}"/>`;
                break;
            case 'vertical':
                const x = i * (width / lines);
                line = `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${strokeColor}" stroke-opacity="${strokeOpacity}" stroke-width="${strokeWidth}"/>`;
                break;
            case 'diagonal':
                const offset = i * actualSpacing * 1.5;
                line = `<line x1="${-offset}" y1="${height}" x2="${width - offset}" y2="0" stroke="${strokeColor}" stroke-opacity="${strokeOpacity}" stroke-width="${strokeWidth}"/>`;
                break;
            case 'random':
                const x1 = Math.random() * width;
                const y1 = Math.random() * height;
                const x2 = Math.random() * width;
                const y2 = Math.random() * height;
                line = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${strokeColor}" stroke-opacity="${strokeOpacity}" stroke-width="${strokeWidth}"/>`;
                break;
        }

        lineElements.push(line);
    }

    return {
        svg: lineElements.join('\n'),
        bounds: { x: 0, y: 0, width, height }
    };
}

/**
 * Generate grid pattern
 */
export function generateGrid({
    width = 1080,
    height = 1080,
    cellSize = 50,
    strokeColor = '#FFFFFF',
    strokeOpacity = 0.05,
    strokeWidth = 1,
    dotted = false
}) {
    const lines = [];

    // Vertical lines
    for (let x = 0; x <= width; x += cellSize) {
        lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${strokeColor}" stroke-opacity="${strokeOpacity}" stroke-width="${strokeWidth}" ${dotted ? 'stroke-dasharray="2,4"' : ''}/>`);
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += cellSize) {
        lines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${strokeColor}" stroke-opacity="${strokeOpacity}" stroke-width="${strokeWidth}" ${dotted ? 'stroke-dasharray="2,4"' : ''}/>`);
    }

    return {
        svg: lines.join('\n'),
        bounds: { x: 0, y: 0, width, height }
    };
}

/**
 * Generate dot pattern
 */
export function generateDotPattern({
    width = 1080,
    height = 1080,
    dotRadius = 3,
    spacing = 30,
    fill = '#FFFFFF',
    fillOpacity = 0.1,
    randomize = false
}) {
    const dots = [];

    for (let x = spacing; x < width; x += spacing) {
        for (let y = spacing; y < height; y += spacing) {
            const offsetX = randomize ? (Math.random() - 0.5) * spacing * 0.3 : 0;
            const offsetY = randomize ? (Math.random() - 0.5) * spacing * 0.3 : 0;
            const r = randomize ? dotRadius * (0.5 + Math.random()) : dotRadius;

            dots.push(`<circle cx="${x + offsetX}" cy="${y + offsetY}" r="${r}" fill="${fill}" fill-opacity="${fillOpacity}"/>`);
        }
    }

    return {
        svg: dots.join('\n'),
        bounds: { x: 0, y: 0, width, height }
    };
}

// ========================================
// DECORATIVE ELEMENTS
// ========================================

/**
 * Generate decorative divider line
 */
export function generateDivider({
    x = 0,
    y = 540,
    width = 1080,
    style = 'gradient', // 'solid', 'gradient', 'dots', 'dashes', 'diamond'
    color = '#FFFFFF',
    opacity = 0.3,
    thickness = 2
}) {
    const id = `divider_${Date.now()}`;
    let element = '';

    switch (style) {
        case 'gradient':
            element = `
                <defs>
                    <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="${color}" stop-opacity="0"/>
                        <stop offset="50%" stop-color="${color}" stop-opacity="${opacity}"/>
                        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
                    </linearGradient>
                </defs>
                <line x1="${x}" y1="${y}" x2="${x + width}" y2="${y}" stroke="url(#${id})" stroke-width="${thickness}"/>
            `;
            break;
        case 'solid':
            element = `<line x1="${x}" y1="${y}" x2="${x + width}" y2="${y}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${thickness}"/>`;
            break;
        case 'dots':
            element = `<line x1="${x}" y1="${y}" x2="${x + width}" y2="${y}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${thickness}" stroke-dasharray="2,8"/>`;
            break;
        case 'dashes':
            element = `<line x1="${x}" y1="${y}" x2="${x + width}" y2="${y}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${thickness}" stroke-dasharray="12,6"/>`;
            break;
        case 'diamond':
            const diamondSize = 8;
            element = `
                <line x1="${x}" y1="${y}" x2="${x + width / 2 - 15}" y2="${y}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${thickness}"/>
                <polygon points="${x + width / 2},${y - diamondSize} ${x + width / 2 + diamondSize},${y} ${x + width / 2},${y + diamondSize} ${x + width / 2 - diamondSize},${y}" fill="${color}" fill-opacity="${opacity}"/>
                <line x1="${x + width / 2 + 15}" y1="${y}" x2="${x + width}" y2="${y}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${thickness}"/>
            `;
            break;
    }

    return { svg: element, bounds: { x, y: y - thickness, width, height: thickness * 2 } };
}

/**
 * Generate decorative corner accent
 */
export function generateCornerAccent({
    corner = 'top-left', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
    size = 100,
    style = 'lines', // 'lines', 'arc', 'bracket', 'flourish'
    color = '#FFFFFF',
    opacity = 0.3,
    strokeWidth = 2,
    canvasWidth = 1080,
    canvasHeight = 1080
}) {
    let x = 0, y = 0;
    let transform = '';

    // Position based on corner
    switch (corner) {
        case 'top-left':
            x = 20; y = 20;
            break;
        case 'top-right':
            x = canvasWidth - size - 20; y = 20;
            transform = `transform="scale(-1,1) translate(${-(2 * x + size)},0)"`;
            break;
        case 'bottom-left':
            x = 20; y = canvasHeight - size - 20;
            transform = `transform="scale(1,-1) translate(0,${-(2 * y + size)})"`;
            break;
        case 'bottom-right':
            x = canvasWidth - size - 20; y = canvasHeight - size - 20;
            transform = `transform="scale(-1,-1) translate(${-(2 * x + size)},${-(2 * y + size)})"`;
            break;
    }

    let element = '';

    switch (style) {
        case 'lines':
            element = `
                <g ${transform}>
                    <line x1="${x}" y1="${y}" x2="${x + size}" y2="${y}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${strokeWidth}"/>
                    <line x1="${x}" y1="${y}" x2="${x}" y2="${y + size}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${strokeWidth}"/>
                </g>
            `;
            break;
        case 'arc':
            element = `
                <g ${transform}>
                    <path d="M ${x} ${y + size} Q ${x} ${y} ${x + size} ${y}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${strokeWidth}"/>
                </g>
            `;
            break;
        case 'bracket':
            element = `
                <g ${transform}>
                    <path d="M ${x + size * 0.3} ${y} L ${x} ${y} L ${x} ${y + size * 0.3}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${strokeWidth + 1}"/>
                </g>
            `;
            break;
    }

    return { svg: element, bounds: { x, y, width: size, height: size } };
}

/**
 * Generate decorative frame
 */
export function generateFrame({
    x = 40,
    y = 40,
    width = 1000,
    height = 1000,
    style = 'simple', // 'simple', 'double', 'ornate', 'rounded'
    color = '#FFFFFF',
    opacity = 0.15,
    strokeWidth = 2,
    cornerRadius = 0
}) {
    let element = '';

    switch (style) {
        case 'simple':
            element = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${cornerRadius}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${strokeWidth}"/>`;
            break;
        case 'double':
            const gap = 8;
            element = `
                <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${cornerRadius}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${strokeWidth}"/>
                <rect x="${x + gap}" y="${y + gap}" width="${width - gap * 2}" height="${height - gap * 2}" rx="${cornerRadius}" fill="none" stroke="${color}" stroke-opacity="${opacity * 0.6}" stroke-width="${strokeWidth * 0.5}"/>
            `;
            break;
        case 'rounded':
            element = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${Math.min(width, height) * 0.05}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${strokeWidth}"/>`;
            break;
    }

    return { svg: element, bounds: { x, y, width, height } };
}

// ========================================
// PNG GENERATION
// ========================================

/**
 * Convert SVG to PNG buffer
 */
export async function svgToPng(svg, width = 1080, height = 1080) {
    const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${svg}</svg>`;

    return await sharp(Buffer.from(fullSvg))
        .png()
        .toBuffer();
}

/**
 * Generate decorative element as PNG
 */
export async function generateDecorativePng(type, options = {}, width = 1080, height = 1080) {
    let shapeSvg = '';

    switch (type) {
        case 'blob':
            shapeSvg = generateBlob({ cx: width / 2, cy: height / 2, size: Math.min(width, height) * 0.4, ...options }).svg;
            break;
        case 'cloud':
            shapeSvg = generateCloud({ cx: width / 2, cy: height / 2, width: width * 0.6, height: height * 0.3, ...options }).svg;
            break;
        case 'wave':
            shapeSvg = generateWave({ width, height: height * 0.3, ...options }).svg;
            break;
        case 'circle':
            shapeSvg = generateCircle({ cx: width / 2, cy: height / 2, radius: Math.min(width, height) * 0.3, ...options }).svg;
            break;
        case 'grid':
            shapeSvg = generateGrid({ width, height, ...options }).svg;
            break;
        case 'dots':
            shapeSvg = generateDotPattern({ width, height, ...options }).svg;
            break;
    }

    return await svgToPng(shapeSvg, width, height);
}

// ========================================
// HELPERS
// ========================================

function seededRandom(seed) {
    let value = seed;
    return function () {
        value = (value * 9301 + 49297) % 233280;
        return value / 233280;
    };
}

export default {
    generateCircle,
    generateRectangle,
    generatePolygon,
    generateBlob,
    generateWave,
    generateCloud,
    generateLinePattern,
    generateGrid,
    generateDotPattern,
    generateDivider,
    generateCornerAccent,
    generateFrame,
    svgToPng,
    generateDecorativePng
};
