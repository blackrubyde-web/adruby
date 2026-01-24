/**
 * DATA VISUALIZATION ELEMENTS
 * 
 * Generate infographic-style data visualizations for ads:
 * 
 * - Progress bars (linear, circular)
 * - Bar charts
 * - Pie/Donut charts
 * - Stats counters
 * - Comparison tables
 * - Feature lists with icons
 * - Rating displays
 * - Timeline elements
 */

import { hexToRgb, rgbToHex } from '../design/colorScience.js';

// ========================================
// PROGRESS BARS
// ========================================

/**
 * Generate linear progress bar
 */
export function generateProgressBar({
    x = 100,
    y = 100,
    width = 300,
    height = 20,
    progress = 75, // 0-100
    trackColor = '#1A1A2E',
    barColor = '#3B82F6',
    gradientColors = null,
    rounded = true,
    showLabel = true,
    labelColor = '#FFFFFF',
    animated = false,
    glowColor = null
}) {
    const id = `progress_${Date.now()}`;
    const radius = rounded ? height / 2 : 0;
    const progressWidth = (progress / 100) * width;

    let defs = '';
    let barFill = barColor;
    let glow = '';

    // Gradient fill
    if (gradientColors && gradientColors.length >= 2) {
        const gradId = `grad_${id}`;
        const stops = gradientColors.map((c, i) =>
            `<stop offset="${Math.round(i / (gradientColors.length - 1) * 100)}%" stop-color="${c}"/>`
        ).join('');
        defs += `<linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="0%">${stops}</linearGradient>`;
        barFill = `url(#${gradId})`;
    }

    // Glow effect
    if (glowColor) {
        const glowId = `glow_${id}`;
        defs += `<filter id="${glowId}" x="-20%" y="-100%" width="140%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0"/>
        </filter>`;
        glow = `<rect x="${x}" y="${y}" width="${progressWidth}" height="${height}" rx="${radius}" fill="${glowColor}" filter="url(#${glowId})"/>`;
    }

    const label = showLabel
        ? `<text x="${x + width + 15}" y="${y + height / 2 + 5}" fill="${labelColor}" font-family="Inter, system-ui" font-size="${height * 0.8}" font-weight="600">${progress}%</text>`
        : '';

    // Animation
    const animation = animated
        ? `<animate attributeName="width" from="0" to="${progressWidth}" dur="1s" fill="freeze"/>`
        : '';

    return {
        svg: `
            ${defs ? `<defs>${defs}</defs>` : ''}
            <!-- Track -->
            <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${trackColor}"/>
            ${glow}
            <!-- Progress -->
            <rect x="${x}" y="${y}" width="${progressWidth}" height="${height}" rx="${radius}" fill="${barFill}">
                ${animation}
            </rect>
            ${label}
        `,
        bounds: { x, y, width: width + (showLabel ? 60 : 0), height }
    };
}

/**
 * Generate circular progress (donut style)
 */
export function generateCircularProgress({
    cx = 100,
    cy = 100,
    radius = 60,
    strokeWidth = 12,
    progress = 75, // 0-100
    trackColor = '#1A1A2E',
    barColor = '#3B82F6',
    gradientColors = null,
    showLabel = true,
    labelColor = '#FFFFFF',
    labelSize = 24,
    suffix = '%'
}) {
    const id = `cprogress_${Date.now()}`;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - progress / 100);

    let defs = '';
    let stroke = barColor;

    // Gradient
    if (gradientColors && gradientColors.length >= 2) {
        const gradId = `grad_${id}`;
        const stops = gradientColors.map((c, i) =>
            `<stop offset="${Math.round(i / (gradientColors.length - 1) * 100)}%" stop-color="${c}"/>`
        ).join('');
        defs = `<linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">${stops}</linearGradient>`;
        stroke = `url(#${gradId})`;
    }

    const label = showLabel ? `
        <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" fill="${labelColor}" font-family="Inter, system-ui" font-size="${labelSize}" font-weight="700">${progress}${suffix}</text>
    ` : '';

    return {
        svg: `
            ${defs ? `<defs>${defs}</defs>` : ''}
            <!-- Track -->
            <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${trackColor}" stroke-width="${strokeWidth}"/>
            <!-- Progress -->
            <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" 
                stroke-linecap="round"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${dashOffset}"
                transform="rotate(-90 ${cx} ${cy})"/>
            ${label}
        `,
        bounds: { x: cx - radius - strokeWidth, y: cy - radius - strokeWidth, width: (radius + strokeWidth) * 2, height: (radius + strokeWidth) * 2 }
    };
}

// ========================================
// BAR CHARTS
// ========================================

/**
 * Generate simple bar chart
 */
export function generateBarChart({
    x = 50,
    y = 50,
    width = 300,
    height = 200,
    data = [
        { label: 'Before', value: 40 },
        { label: 'After', value: 95 }
    ],
    barColors = ['#64748B', '#3B82F6'],
    showLabels = true,
    showValues = true,
    labelColor = '#FFFFFF',
    valueColor = '#FFFFFF',
    barRadius = 8,
    barGap = 20,
    animated = false
}) {
    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = (width - barGap * (data.length - 1)) / data.length;
    const bars = [];

    data.forEach((item, i) => {
        const barHeight = (item.value / maxValue) * (height - 50);
        const barX = x + i * (barWidth + barGap);
        const barY = y + height - barHeight - 30;
        const color = barColors[i % barColors.length];

        // Bar
        bars.push(`<rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="${barRadius}" fill="${color}"/>`);

        // Value label
        if (showValues) {
            bars.push(`<text x="${barX + barWidth / 2}" y="${barY - 10}" text-anchor="middle" fill="${valueColor}" font-family="Inter, system-ui" font-size="18" font-weight="700">${item.value}${item.suffix || '%'}</text>`);
        }

        // Bottom label
        if (showLabels) {
            bars.push(`<text x="${barX + barWidth / 2}" y="${y + height - 5}" text-anchor="middle" fill="${labelColor}" font-family="Inter, system-ui" font-size="14">${item.label}</text>`);
        }
    });

    return {
        svg: bars.join('\n'),
        bounds: { x, y, width, height }
    };
}

// ========================================
// PIE/DONUT CHARTS
// ========================================

/**
 * Generate donut chart
 */
export function generateDonutChart({
    cx = 150,
    cy = 150,
    outerRadius = 100,
    innerRadius = 60,
    data = [
        { value: 60, color: '#3B82F6', label: 'Feature A' },
        { value: 25, color: '#8B5CF6', label: 'Feature B' },
        { value: 15, color: '#EC4899', label: 'Feature C' }
    ],
    showLabels = false,
    labelColor = '#FFFFFF',
    gap = 2
}) {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let currentAngle = -90; // Start from top
    const segments = [];

    data.forEach((item, i) => {
        const angle = (item.value / total) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle - gap;

        // Create arc path
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = cx + outerRadius * Math.cos(startRad);
        const y1 = cy + outerRadius * Math.sin(startRad);
        const x2 = cx + outerRadius * Math.cos(endRad);
        const y2 = cy + outerRadius * Math.sin(endRad);
        const x3 = cx + innerRadius * Math.cos(endRad);
        const y3 = cy + innerRadius * Math.sin(endRad);
        const x4 = cx + innerRadius * Math.cos(startRad);
        const y4 = cy + innerRadius * Math.sin(startRad);

        const largeArc = angle > 180 ? 1 : 0;

        const path = `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;

        segments.push(`<path d="${path}" fill="${item.color}"/>`);

        currentAngle += angle;
    });

    return {
        svg: segments.join('\n'),
        bounds: { x: cx - outerRadius, y: cy - outerRadius, width: outerRadius * 2, height: outerRadius * 2 }
    };
}

// ========================================
// STATS COUNTERS
// ========================================

/**
 * Generate stat counter display
 */
export function generateStatCounter({
    x = 100,
    y = 100,
    value = '10M+',
    label = 'Active Users',
    valueColor = '#FFFFFF',
    valueSize = 48,
    labelColor = '#A0A0B0',
    labelSize = 16,
    icon = null, // SVG path or null
    iconColor = '#3B82F6',
    layout = 'vertical' // 'vertical', 'horizontal'
}) {
    const isVertical = layout === 'vertical';

    let content = '';

    if (icon) {
        content += `<g transform="translate(${x}, ${y})">
            <path d="${icon}" fill="${iconColor}" transform="scale(1.5)"/>
        </g>`;
    }

    const valueY = isVertical ? y + (icon ? 50 : 0) : y + valueSize * 0.35;
    const valueX = isVertical ? x : x + (icon ? 60 : 0);

    content += `<text x="${valueX}" y="${valueY}" fill="${valueColor}" font-family="Inter, system-ui" font-size="${valueSize}" font-weight="800">${value}</text>`;

    const labelY = isVertical ? valueY + valueSize * 0.5 + 15 : y + valueSize * 0.35 + 25;
    const labelX = isVertical ? x : valueX;

    content += `<text x="${labelX}" y="${labelY}" fill="${labelColor}" font-family="Inter, system-ui" font-size="${labelSize}">${label}</text>`;

    return {
        svg: content,
        bounds: { x, y, width: 200, height: isVertical ? 120 : 80 }
    };
}

/**
 * Generate stat comparison (before/after style)
 */
export function generateStatComparison({
    x = 100,
    y = 100,
    beforeValue = '2 hours',
    afterValue = '5 minutes',
    beforeLabel = 'Before',
    afterLabel = 'After AdRuby',
    beforeColor = '#64748B',
    afterColor = '#10B981',
    labelColor = '#A0A0B0',
    arrowColor = '#FFFFFF'
}) {
    const gap = 150;

    return {
        svg: `
            <!-- Before -->
            <g>
                <text x="${x}" y="${y}" fill="${beforeColor}" font-family="Inter, system-ui" font-size="32" font-weight="700">${beforeValue}</text>
                <text x="${x}" y="${y + 25}" fill="${labelColor}" font-family="Inter, system-ui" font-size="14">${beforeLabel}</text>
            </g>
            
            <!-- Arrow -->
            <g transform="translate(${x + 120}, ${y - 10})">
                <line x1="0" y1="0" x2="40" y2="0" stroke="${arrowColor}" stroke-width="2" stroke-opacity="0.5"/>
                <polygon points="40,-5 50,0 40,5" fill="${arrowColor}" fill-opacity="0.5"/>
            </g>
            
            <!-- After -->
            <g>
                <text x="${x + gap + 50}" y="${y}" fill="${afterColor}" font-family="Inter, system-ui" font-size="32" font-weight="700">${afterValue}</text>
                <text x="${x + gap + 50}" y="${y + 25}" fill="${labelColor}" font-family="Inter, system-ui" font-size="14">${afterLabel}</text>
            </g>
        `,
        bounds: { x, y: y - 20, width: gap + 200, height: 60 }
    };
}

// ========================================
// COMPARISON TABLES
// ========================================

/**
 * Generate comparison table
 */
export function generateComparisonTable({
    x = 50,
    y = 50,
    width = 400,
    rows = [
        { feature: 'AI Generation', us: true, competitor: false },
        { feature: 'Unlimited Creatives', us: true, competitor: false },
        { feature: 'Brand Consistency', us: true, competitor: true },
        { feature: 'One-Click Export', us: true, competitor: false }
    ],
    usColor = '#10B981',
    competitorColor = '#EF4444',
    headerBg = '#1A1A2E',
    rowBg = '#0D0D1A',
    textColor = '#FFFFFF',
    featureColor = '#A0A0B0',
    rowHeight = 45,
    cornerRadius = 12
}) {
    const colWidth = width / 3;
    const headerHeight = 50;
    const totalHeight = headerHeight + rows.length * rowHeight;

    let content = '';

    // Background
    content += `<rect x="${x}" y="${y}" width="${width}" height="${totalHeight}" rx="${cornerRadius}" fill="${rowBg}"/>`;

    // Header
    content += `<rect x="${x}" y="${y}" width="${width}" height="${headerHeight}" rx="${cornerRadius}" fill="${headerBg}"/>`;
    content += `<rect x="${x}" y="${y + headerHeight - cornerRadius}" width="${width}" height="${cornerRadius}" fill="${headerBg}"/>`;

    // Header text
    content += `<text x="${x + colWidth / 2}" y="${y + headerHeight / 2 + 5}" text-anchor="middle" fill="${textColor}" font-family="Inter, system-ui" font-size="14" font-weight="600">Feature</text>`;
    content += `<text x="${x + colWidth * 1.5}" y="${y + headerHeight / 2 + 5}" text-anchor="middle" fill="${usColor}" font-family="Inter, system-ui" font-size="14" font-weight="600">Us</text>`;
    content += `<text x="${x + colWidth * 2.5}" y="${y + headerHeight / 2 + 5}" text-anchor="middle" fill="${featureColor}" font-family="Inter, system-ui" font-size="14" font-weight="600">Others</text>`;

    // Rows
    rows.forEach((row, i) => {
        const rowY = y + headerHeight + i * rowHeight;

        // Alternating background
        if (i % 2 === 0) {
            content += `<rect x="${x}" y="${rowY}" width="${width}" height="${rowHeight}" fill="rgba(255,255,255,0.02)"/>`;
        }

        // Feature name
        content += `<text x="${x + 20}" y="${rowY + rowHeight / 2 + 5}" fill="${featureColor}" font-family="Inter, system-ui" font-size="14">${row.feature}</text>`;

        // Us checkmark/X
        const usIcon = row.us
            ? `<circle cx="${x + colWidth * 1.5}" cy="${rowY + rowHeight / 2}" r="10" fill="${usColor}" fill-opacity="0.2"/><text x="${x + colWidth * 1.5}" y="${rowY + rowHeight / 2 + 5}" text-anchor="middle" fill="${usColor}" font-size="14">✓</text>`
            : `<circle cx="${x + colWidth * 1.5}" cy="${rowY + rowHeight / 2}" r="10" fill="${competitorColor}" fill-opacity="0.2"/><text x="${x + colWidth * 1.5}" y="${rowY + rowHeight / 2 + 5}" text-anchor="middle" fill="${competitorColor}" font-size="14">✗</text>`;
        content += usIcon;

        // Competitor checkmark/X
        const compIcon = row.competitor
            ? `<circle cx="${x + colWidth * 2.5}" cy="${rowY + rowHeight / 2}" r="10" fill="${usColor}" fill-opacity="0.2"/><text x="${x + colWidth * 2.5}" y="${rowY + rowHeight / 2 + 5}" text-anchor="middle" fill="${usColor}" font-size="14">✓</text>`
            : `<circle cx="${x + colWidth * 2.5}" cy="${rowY + rowHeight / 2}" r="10" fill="${competitorColor}" fill-opacity="0.2"/><text x="${x + colWidth * 2.5}" y="${rowY + rowHeight / 2 + 5}" text-anchor="middle" fill="${competitorColor}" font-size="14">✗</text>`;
        content += compIcon;
    });

    return {
        svg: content,
        bounds: { x, y, width, height: totalHeight }
    };
}

// ========================================
// FEATURE LISTS
// ========================================

/**
 * Generate feature list with checkmarks
 */
export function generateFeatureList({
    x = 50,
    y = 50,
    features = ['Feature 1', 'Feature 2', 'Feature 3'],
    checkColor = '#10B981',
    textColor = '#FFFFFF',
    fontSize = 18,
    lineHeight = 40,
    iconStyle = 'check' // 'check', 'dot', 'arrow', 'star'
}) {
    const items = [];

    features.forEach((feature, i) => {
        const itemY = y + i * lineHeight;

        let icon = '';
        switch (iconStyle) {
            case 'check':
                icon = `<circle cx="${x + 12}" cy="${itemY}" r="12" fill="${checkColor}" fill-opacity="0.2"/>
                        <text x="${x + 12}" y="${itemY + 5}" text-anchor="middle" fill="${checkColor}" font-size="14">✓</text>`;
                break;
            case 'dot':
                icon = `<circle cx="${x + 12}" cy="${itemY}" r="6" fill="${checkColor}"/>`;
                break;
            case 'arrow':
                icon = `<text x="${x + 12}" y="${itemY + 5}" text-anchor="middle" fill="${checkColor}" font-size="16">→</text>`;
                break;
            case 'star':
                icon = `<text x="${x + 12}" y="${itemY + 6}" text-anchor="middle" fill="${checkColor}" font-size="18">★</text>`;
                break;
        }

        items.push(`
            ${icon}
            <text x="${x + 35}" y="${itemY + 6}" fill="${textColor}" font-family="Inter, system-ui" font-size="${fontSize}">${feature}</text>
        `);
    });

    return {
        svg: items.join('\n'),
        bounds: { x, y: y - lineHeight / 2, width: 400, height: features.length * lineHeight }
    };
}

// ========================================
// RATING DISPLAYS
// ========================================

/**
 * Generate star rating display
 */
export function generateStarRating({
    x = 100,
    y = 100,
    rating = 4.8,
    maxStars = 5,
    starSize = 24,
    filledColor = '#FBBF24',
    emptyColor = '#374151',
    showValue = true,
    showCount = true,
    count = '2,847',
    valueColor = '#FFFFFF',
    countColor = '#A0A0B0'
}) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const partialStar = rating - fullStars;
    const gap = starSize * 0.2;

    for (let i = 0; i < maxStars; i++) {
        const starX = x + i * (starSize + gap);

        let fill = emptyColor;
        if (i < fullStars) {
            fill = filledColor;
        }

        // Simple star polygon
        const points = [];
        for (let j = 0; j < 5; j++) {
            const angle = (j * 144 - 90) * Math.PI / 180;
            const r = j % 2 === 0 ? starSize / 2 : starSize / 4;
            points.push(`${starX + starSize / 2 + r * Math.cos(angle)},${y + starSize / 2 + r * Math.sin(angle)}`);
        }

        stars.push(`<polygon points="${points.join(' ')}" fill="${fill}"/>`);

        // Partial star (clip)
        if (i === fullStars && partialStar > 0) {
            const clipId = `starClip_${Date.now()}_${i}`;
            stars.push(`
                <defs>
                    <clipPath id="${clipId}">
                        <rect x="${starX}" y="${y}" width="${starSize * partialStar}" height="${starSize}"/>
                    </clipPath>
                </defs>
                <polygon points="${points.join(' ')}" fill="${filledColor}" clip-path="url(#${clipId})"/>
            `);
        }
    }

    let labels = '';
    const labelsX = x + maxStars * (starSize + gap) + 10;

    if (showValue) {
        labels += `<text x="${labelsX}" y="${y + starSize / 2 + 5}" fill="${valueColor}" font-family="Inter, system-ui" font-size="18" font-weight="700">${rating}</text>`;
    }

    if (showCount) {
        labels += `<text x="${labelsX + 40}" y="${y + starSize / 2 + 5}" fill="${countColor}" font-family="Inter, system-ui" font-size="14">(${count})</text>`;
    }

    return {
        svg: stars.join('\n') + labels,
        bounds: { x, y, width: labelsX + 100 - x, height: starSize }
    };
}

// ========================================
// TIMELINE ELEMENTS
// ========================================

/**
 * Generate simple timeline
 */
export function generateTimeline({
    x = 50,
    y = 50,
    width = 400,
    steps = [
        { label: 'Upload', active: true },
        { label: 'AI Analysis', active: true },
        { label: 'Generate', active: false },
        { label: 'Export', active: false }
    ],
    activeColor = '#3B82F6',
    inactiveColor = '#374151',
    lineColor = '#1F2937',
    textColor = '#FFFFFF',
    inactiveTextColor = '#6B7280',
    nodeSize = 20,
    lineWidth = 3
}) {
    const stepWidth = width / (steps.length - 1);
    const elements = [];

    // Line
    elements.push(`<line x1="${x}" y1="${y}" x2="${x + width}" y2="${y}" stroke="${lineColor}" stroke-width="${lineWidth}"/>`);

    // Progress line
    const activeCount = steps.filter(s => s.active).length;
    const progressWidth = (activeCount - 1) * stepWidth;
    if (progressWidth > 0) {
        elements.push(`<line x1="${x}" y1="${y}" x2="${x + progressWidth}" y2="${y}" stroke="${activeColor}" stroke-width="${lineWidth}"/>`);
    }

    // Nodes
    steps.forEach((step, i) => {
        const nodeX = x + i * stepWidth;
        const color = step.active ? activeColor : inactiveColor;
        const textClr = step.active ? textColor : inactiveTextColor;

        elements.push(`<circle cx="${nodeX}" cy="${y}" r="${nodeSize / 2}" fill="${color}"/>`);

        if (step.active && i < activeCount - 1) {
            elements.push(`<circle cx="${nodeX}" cy="${y}" r="${nodeSize / 2 - 4}" fill="${color}"/>`);
        }

        elements.push(`<text x="${nodeX}" y="${y + nodeSize + 15}" text-anchor="middle" fill="${textClr}" font-family="Inter, system-ui" font-size="12">${step.label}</text>`);
    });

    return {
        svg: elements.join('\n'),
        bounds: { x, y: y - nodeSize, width, height: nodeSize * 2 + 30 }
    };
}

export default {
    generateProgressBar,
    generateCircularProgress,
    generateBarChart,
    generateDonutChart,
    generateStatCounter,
    generateStatComparison,
    generateComparisonTable,
    generateFeatureList,
    generateStarRating,
    generateTimeline
};
