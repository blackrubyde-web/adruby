/**
 * CALLOUT GENERATOR
 * 
 * Generate feature callouts and annotation elements:
 * 
 * - Feature callout with pointer
 * - Numbered steps
 * - Annotation bubbles
 * - Product highlight markers
 * - Comparison callouts
 * - Tooltip-style callouts
 */

import { renderIconWithBackground, FEATURE_ICONS } from './iconLibrary.js';

// ========================================
// FEATURE CALLOUT WITH LINE
// ========================================

export function generateFeatureCallout({
    startX = 500,
    startY = 400,
    endX = 200,
    endY = 200,
    text = 'Premium Feature',
    subtext = null,
    textColor = '#FFFFFF',
    subtextColor = 'rgba(255,255,255,0.6)',
    lineColor = 'rgba(255,255,255,0.3)',
    lineWidth = 1,
    lineStyle = 'solid', // 'solid', 'dashed', 'dotted'
    dotSize = 6,
    dotColor = '#3B82F6',
    dotGlow = true,
    textPosition = 'left', // 'left', 'right'
    fontSize = 16,
    subtextSize = 12
}) {
    const id = `callout_${Date.now()}`;
    let defs = '';

    // Calculate text position
    const textX = textPosition === 'left' ? endX - 15 : endX + 15;
    const textAnchor = textPosition === 'left' ? 'end' : 'start';

    // Line style
    let dashArray = '';
    if (lineStyle === 'dashed') dashArray = 'stroke-dasharray="8,4"';
    else if (lineStyle === 'dotted') dashArray = 'stroke-dasharray="2,4"';

    // Dot glow
    if (dotGlow) {
        defs += `<filter id="${id}_glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.6 0"/>
        </filter>`;
    }

    let content = `
        <!-- Connection line -->
        <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="${lineColor}" stroke-width="${lineWidth}" ${dashArray}/>
        
        <!-- Start dot -->
        ${dotGlow ? `<circle cx="${startX}" cy="${startY}" r="${dotSize + 4}" fill="${dotColor}" filter="url(#${id}_glow)"/>` : ''}
        <circle cx="${startX}" cy="${startY}" r="${dotSize}" fill="${dotColor}"/>
        <circle cx="${startX}" cy="${startY}" r="${dotSize * 0.4}" fill="#FFFFFF"/>
        
        <!-- Text -->
        <text x="${textX}" y="${endY}" fill="${textColor}" font-family="Inter, system-ui" font-size="${fontSize}" font-weight="600" text-anchor="${textAnchor}">${text}</text>
    `;

    if (subtext) {
        content += `<text x="${textX}" y="${endY + fontSize + 4}" fill="${subtextColor}" font-family="Inter, system-ui" font-size="${subtextSize}" text-anchor="${textAnchor}">${subtext}</text>`;
    }

    return { svg: `${defs ? `<defs>${defs}</defs>` : ''}${content}` };
}

// ========================================
// NUMBERED STEP
// ========================================

export function generateNumberedStep({
    x = 50,
    y = 50,
    number = 1,
    text = 'Step description',
    size = 40,
    numberColor = '#FFFFFF',
    bgColor = '#3B82F6',
    textColor = '#FFFFFF',
    fontSize = 16,
    layout = 'horizontal' // 'horizontal', 'vertical'
}) {
    const cx = x + size / 2;
    const cy = y + size / 2;

    let textX, textY;
    if (layout === 'horizontal') {
        textX = x + size + 15;
        textY = y + size / 2 + fontSize * 0.35;
    } else {
        textX = x + size / 2;
        textY = y + size + 20;
    }

    return {
        svg: `
            <circle cx="${cx}" cy="${cy}" r="${size / 2}" fill="${bgColor}"/>
            <text x="${cx}" y="${cy + size * 0.12}" text-anchor="middle" fill="${numberColor}" font-family="Inter, system-ui" font-size="${size * 0.5}" font-weight="700">${number}</text>
            <text x="${textX}" y="${textY}" fill="${textColor}" font-family="Inter, system-ui" font-size="${fontSize}" font-weight="500" ${layout === 'vertical' ? 'text-anchor="middle"' : ''}>${text}</text>
        `,
        bounds: { x, y, width: layout === 'horizontal' ? size + 200 : 200, height: layout === 'horizontal' ? size : size + 30 }
    };
}

// ========================================
// ANNOTATION BUBBLE
// ========================================

export function generateAnnotationBubble({
    x = 100,
    y = 100,
    text = 'Annotation',
    bgColor = 'rgba(0,0,0,0.8)',
    textColor = '#FFFFFF',
    fontSize = 14,
    padding = 12,
    borderRadius = 8,
    pointerPosition = 'bottom', // 'top', 'bottom', 'left', 'right'
    pointerSize = 10,
    maxWidth = null
}) {
    const textWidth = maxWidth || text.length * fontSize * 0.55;
    const width = textWidth + padding * 2;
    const height = fontSize + padding * 2;

    // Adjust position based on pointer
    let rectX = x - width / 2;
    let rectY = y;
    let pointerPath = '';

    switch (pointerPosition) {
        case 'bottom':
            rectY = y - height - pointerSize;
            pointerPath = `M${x - pointerSize} ${y - pointerSize} L${x} ${y} L${x + pointerSize} ${y - pointerSize}`;
            break;
        case 'top':
            rectY = y + pointerSize;
            pointerPath = `M${x - pointerSize} ${y + pointerSize} L${x} ${y} L${x + pointerSize} ${y + pointerSize}`;
            break;
        case 'left':
            rectX = x + pointerSize;
            rectY = y - height / 2;
            pointerPath = `M${x + pointerSize} ${y - pointerSize} L${x} ${y} L${x + pointerSize} ${y + pointerSize}`;
            break;
        case 'right':
            rectX = x - width - pointerSize;
            rectY = y - height / 2;
            pointerPath = `M${x - pointerSize} ${y - pointerSize} L${x} ${y} L${x - pointerSize} ${y + pointerSize}`;
            break;
    }

    return {
        svg: `
            <rect x="${rectX}" y="${rectY}" width="${width}" height="${height}" rx="${borderRadius}" fill="${bgColor}"/>
            <path d="${pointerPath}" fill="${bgColor}"/>
            <text x="${x}" y="${rectY + height / 2 + fontSize * 0.35}" text-anchor="middle" fill="${textColor}" font-family="Inter, system-ui" font-size="${fontSize}" font-weight="500">${text}</text>
        `,
        bounds: { x: rectX, y: Math.min(y, rectY), width, height: height + pointerSize }
    };
}

// ========================================
// PRODUCT HIGHLIGHT MARKER
// ========================================

export function generateHighlightMarker({
    x = 100,
    y = 100,
    size = 30,
    color = '#3B82F6',
    style = 'pulse', // 'pulse', 'ring', 'dot', 'crosshair'
    animated = false
}) {
    const id = `marker_${Date.now()}`;
    let content = '';
    let defs = '';

    switch (style) {
        case 'pulse':
            content = `
                <circle cx="${x}" cy="${y}" r="${size / 2}" fill="${color}" fill-opacity="0.2"/>
                <circle cx="${x}" cy="${y}" r="${size / 3}" fill="${color}"/>
            `;
            break;

        case 'ring':
            content = `
                <circle cx="${x}" cy="${y}" r="${size / 2}" fill="none" stroke="${color}" stroke-width="3"/>
                <circle cx="${x}" cy="${y}" r="${size / 4}" fill="${color}"/>
            `;
            break;

        case 'dot':
            defs = `<filter id="${id}_glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0"/>
            </filter>`;
            content = `
                <circle cx="${x}" cy="${y}" r="${size / 2}" fill="${color}" filter="url(#${id}_glow)"/>
                <circle cx="${x}" cy="${y}" r="${size / 3}" fill="${color}"/>
            `;
            break;

        case 'crosshair':
            const arm = size / 2;
            const gap = size / 6;
            content = `
                <line x1="${x - arm}" y1="${y}" x2="${x - gap}" y2="${y}" stroke="${color}" stroke-width="2"/>
                <line x1="${x + gap}" y1="${y}" x2="${x + arm}" y2="${y}" stroke="${color}" stroke-width="2"/>
                <line x1="${x}" y1="${y - arm}" x2="${x}" y2="${y - gap}" stroke="${color}" stroke-width="2"/>
                <line x1="${x}" y1="${y + gap}" x2="${x}" y2="${y + arm}" stroke="${color}" stroke-width="2"/>
                <circle cx="${x}" cy="${y}" r="4" fill="${color}"/>
            `;
            break;
    }

    return { svg: `${defs ? `<defs>${defs}</defs>` : ''}${content}` };
}

// ========================================
// COMPARISON CALLOUT
// ========================================

export function generateComparisonCallout({
    x = 50,
    y = 50,
    before = { text: 'Before', value: '2 hours' },
    after = { text: 'After', value: '5 min' },
    width = 300,
    beforeColor = '#64748B',
    afterColor = '#10B981',
    bgColor = 'rgba(255,255,255,0.05)',
    textColor = '#FFFFFF',
    style = 'horizontal' // 'horizontal', 'vertical'
}) {
    const height = style === 'horizontal' ? 80 : 160;
    const halfWidth = width / 2;

    if (style === 'horizontal') {
        return {
            svg: `
                <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="12" fill="${bgColor}"/>
                
                <!-- Before -->
                <text x="${x + halfWidth / 2}" y="${y + 25}" text-anchor="middle" fill="${beforeColor}" font-family="Inter, system-ui" font-size="12">${before.text}</text>
                <text x="${x + halfWidth / 2}" y="${y + 55}" text-anchor="middle" fill="${textColor}" font-family="Inter, system-ui" font-size="24" font-weight="700">${before.value}</text>
                
                <!-- Divider -->
                <line x1="${x + halfWidth}" y1="${y + 15}" x2="${x + halfWidth}" y2="${y + height - 15}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                
                <!-- After -->
                <text x="${x + halfWidth * 1.5}" y="${y + 25}" text-anchor="middle" fill="${afterColor}" font-family="Inter, system-ui" font-size="12">${after.text}</text>
                <text x="${x + halfWidth * 1.5}" y="${y + 55}" text-anchor="middle" fill="${afterColor}" font-family="Inter, system-ui" font-size="24" font-weight="700">${after.value}</text>
            `,
            bounds: { x, y, width, height }
        };
    }

    return {
        svg: `
            <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="12" fill="${bgColor}"/>
            
            <!-- Before -->
            <text x="${x + 20}" y="${y + 35}" fill="${beforeColor}" font-family="Inter, system-ui" font-size="14">${before.text}</text>
            <text x="${x + width - 20}" y="${y + 35}" text-anchor="end" fill="${textColor}" font-family="Inter, system-ui" font-size="20" font-weight="700">${before.value}</text>
            
            <!-- Arrow -->
            <text x="${x + width / 2}" y="${y + height / 2 + 5}" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="20">↓</text>
            
            <!-- After -->
            <text x="${x + 20}" y="${y + height - 30}" fill="${afterColor}" font-family="Inter, system-ui" font-size="14">${after.text}</text>
            <text x="${x + width - 20}" y="${y + height - 30}" text-anchor="end" fill="${afterColor}" font-family="Inter, system-ui" font-size="20" font-weight="700">${after.value}</text>
        `,
        bounds: { x, y, width, height }
    };
}

// ========================================
// ICON CALLOUT
// ========================================

export function generateIconCallout({
    x = 50,
    y = 50,
    icon = FEATURE_ICONS.speed,
    title = 'Fast',
    description = 'Lightning fast performance',
    iconSize = 48,
    iconColor = '#3B82F6',
    iconBgColor = 'rgba(59,130,246,0.15)',
    titleColor = '#FFFFFF',
    descColor = 'rgba(255,255,255,0.6)',
    layout = 'horizontal' // 'horizontal', 'vertical'
}) {
    const iconSvg = renderIconWithBackground({
        icon,
        size: iconSize,
        iconSize: iconSize * 0.5,
        iconColor,
        bgColor: iconBgColor,
        x: layout === 'horizontal' ? x : x,
        y: layout === 'horizontal' ? y : y
    });

    let titleX, titleY, descX, descY, textAnchor;

    if (layout === 'horizontal') {
        titleX = x + iconSize + 15;
        titleY = y + iconSize / 2 - 5;
        descX = titleX;
        descY = titleY + 18;
        textAnchor = 'start';
    } else {
        titleX = x + iconSize / 2;
        titleY = y + iconSize + 20;
        descX = titleX;
        descY = titleY + 18;
        textAnchor = 'middle';
    }

    return {
        svg: `
            ${iconSvg}
            <text x="${titleX}" y="${titleY}" fill="${titleColor}" font-family="Inter, system-ui" font-size="16" font-weight="600" text-anchor="${textAnchor}">${title}</text>
            <text x="${descX}" y="${descY}" fill="${descColor}" font-family="Inter, system-ui" font-size="13" text-anchor="${textAnchor}">${description}</text>
        `,
        bounds: { x, y, width: layout === 'horizontal' ? iconSize + 200 : 150, height: layout === 'horizontal' ? iconSize : iconSize + 50 }
    };
}

export default {
    generateFeatureCallout,
    generateNumberedStep,
    generateAnnotationBubble,
    generateHighlightMarker,
    generateComparisonCallout,
    generateIconCallout
};
