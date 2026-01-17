/**
 * HIGH-CONVERTING AD PATTERN TEMPLATES
 * 
 * Based on real-world high-performing Meta Ads:
 * 1. COMPARISON_TABLE - Huel style with data table
 * 2. US_VS_THEM_SPLIT - ZoRaw style vertical split
 * 3. FEATURE_CALLOUTS_DOTTED - Pureful style with dotted lines
 * 4. CHECKMARK_COMPARISON - GRO style check/X comparison
 * 5. FEATURE_ARROWS - nucao style with curved arrows
 * 
 * Each pattern is 1:1 recreated from proven ads
 */

// ============================================================
// PATTERN 1: COMPARISON TABLE (Huel Style)
// Dark background, VS in middle, comparison table below
// ============================================================

export const COMPARISON_TABLE_PATTERN = {
    id: 'comparison_table',
    name: 'Comparison Table',
    description: 'Dark background, two products with VS, comparison table below',

    canvas: { width: 1080, height: 1080 },

    structure: {
        background: { color: '#1A1A1A' },

        headline: {
            x: 0.05, y: 0.02,
            width: 0.90, height: 0.12,
            lines: [
                { text: 'line1', fontSize: 52, fontWeight: 800, color: '#FFFFFF' },
                { text: 'line2', fontSize: 52, fontWeight: 800, color: '#FFFFFF' },
            ],
            align: 'center',
        },

        products: {
            left: {
                x: 0.05, y: 0.16, width: 0.40, height: 0.30,
                label: { position: 'below', bgColor: '#FFFFFF', textColor: '#1A1A1A' },
            },
            right: {
                x: 0.55, y: 0.16, width: 0.40, height: 0.30,
                label: { position: 'below', bgColor: '#FFFFFF', textColor: '#1A1A1A' },
            },
            vs: {
                x: 0.45, y: 0.28,
                text: 'VS',
                fontSize: 28, fontWeight: 700, color: '#FFFFFF',
            },
        },

        table: {
            x: 0.05, y: 0.50, width: 0.90,
            rowHeight: 50,
            headerRow: {
                bgColor: 'transparent',
                textColor: '#FFFFFF',
            },
            dataRows: {
                bgColor: '#2A2A2A',
                textColor: '#FFFFFF',
                leftIndicator: { bad: '#EF4444', neutral: '#F59E0B', good: '#10B981' },
                rightIndicator: { bad: '#EF4444', neutral: '#F59E0B', good: '#10B981' },
            },
        },

        priceStatement: {
            x: 0.10, y: 0.88, width: 0.80, height: 0.05,
            bgColor: '#FFFFFF',
            textColor: '#1A1A1A',
            fontSize: 18, fontWeight: 600,
        },

        logo: {
            x: 0.85, y: 0.92, width: 0.12,
            color: '#FFFFFF',
        },
    },

    // SVG Generator
    generateSVG: (config) => {
        const {
            canvas = { width: 1080, height: 1080 },
            headline = ['No time for lunch?', 'No problem.'],
            leftProduct = { name: 'Competitor', image: null },
            rightProduct = { name: 'Your Product', image: null },
            tableData = [],
            priceStatement = '',
            logoText = '',
        } = config;

        const w = canvas.width;
        const h = canvas.height;

        let svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<!-- Background -->
<rect width="100%" height="100%" fill="#1A1A1A"/>

<!-- Headline -->
<text x="${w / 2}" y="60" font-family="Inter, -apple-system, sans-serif" 
      font-size="52" font-weight="800" fill="#FFFFFF" text-anchor="middle">${headline[0] || ''}</text>
<text x="${w / 2}" y="120" font-family="Inter, -apple-system, sans-serif" 
      font-size="52" font-weight="800" fill="#FFFFFF" text-anchor="middle">${headline[1] || ''}</text>

<!-- VS Badge -->
<text x="${w / 2}" y="330" font-family="Inter, sans-serif" 
      font-size="28" font-weight="700" fill="#FFFFFF" text-anchor="middle">VS</text>

<!-- Product Labels -->
<rect x="${w * 0.08}" y="400" width="${leftProduct.name.length * 12 + 30}" height="36" fill="#FFFFFF"/>
<text x="${w * 0.08 + 15}" y="425" font-family="Inter, sans-serif" 
      font-size="16" font-weight="600" fill="#1A1A1A">${leftProduct.name}</text>

<rect x="${w * 0.58}" y="400" width="${rightProduct.name.length * 12 + 30}" height="36" fill="#FFFFFF"/>
<text x="${w * 0.58 + 15}" y="425" font-family="Inter, sans-serif" 
      font-size="16" font-weight="600" fill="#1A1A1A">${rightProduct.name}</text>
`;

        // Generate table rows
        const tableStartY = 480;
        const rowHeight = 55;

        tableData.forEach((row, i) => {
            const rowY = tableStartY + (i * rowHeight);
            const leftColor = row.leftBetter ? '#10B981' : row.rightBetter ? '#EF4444' : '#F59E0B';
            const rightColor = row.rightBetter ? '#10B981' : row.leftBetter ? '#EF4444' : '#F59E0B';

            svg += `
<!-- Row ${i + 1} -->
<rect x="${w * 0.05}" y="${rowY}" width="${w * 0.28}" height="${rowHeight - 5}" rx="4" fill="#2A2A2A"/>
<rect x="${w * 0.05}" y="${rowY}" width="4" height="${rowHeight - 5}" rx="2" fill="${leftColor}"/>
<text x="${w * 0.19}" y="${rowY + 35}" font-family="Inter, sans-serif" 
      font-size="18" fill="#FFFFFF" text-anchor="middle">${row.leftValue}</text>

<rect x="${w * 0.35}" y="${rowY}" width="${w * 0.30}" height="${rowHeight - 5}" rx="4" fill="#3A3A3A"/>
<text x="${w * 0.50}" y="${rowY + 35}" font-family="Inter, sans-serif" 
      font-size="18" font-weight="600" fill="#FFFFFF" text-anchor="middle">${row.label}</text>

<rect x="${w * 0.67}" y="${rowY}" width="${w * 0.28}" height="${rowHeight - 5}" rx="4" fill="#2A2A2A"/>
<rect x="${w * 0.67}" y="${rowY}" width="4" height="${rowHeight - 5}" rx="2" fill="${rightColor}"/>
<text x="${w * 0.81}" y="${rowY + 35}" font-family="Inter, sans-serif" 
      font-size="18" fill="#FFFFFF" text-anchor="middle">${row.rightValue}</text>
`;
        });

        // Price statement
        if (priceStatement) {
            svg += `
<!-- Price Statement -->
<rect x="${w * 0.15}" y="${h - 130}" width="${w * 0.70}" height="45" rx="4" fill="#FFFFFF"/>
<text x="${w / 2}" y="${h - 100}" font-family="Inter, sans-serif" 
      font-size="18" font-weight="600" fill="#1A1A1A" text-anchor="middle">${priceStatement}</text>
`;
        }

        // Logo
        if (logoText) {
            svg += `
<!-- Logo -->
<text x="${w - 50}" y="${h - 40}" font-family="Inter, sans-serif" 
      font-size="32" font-weight="700" fill="#FFFFFF" text-anchor="end">${logoText}</text>
`;
        }

        svg += `</svg>`;
        return svg;
    },
};

// ============================================================
// PATTERN 2: US VS THEM SPLIT (ZoRaw Style)
// Vertical split, product in center, stats on sides
// ============================================================

export const US_VS_THEM_SPLIT_PATTERN = {
    id: 'us_vs_them_split',
    name: 'US vs THEM Split',
    description: 'Vertical split background, products center, comparison stats on sides',

    canvas: { width: 1080, height: 1080 },

    generateSVG: (config) => {
        const {
            canvas = { width: 1080, height: 1080 },
            leftColor = '#2DD4BF', // Cyan/Teal
            rightColor = '#9CA3AF', // Gray
            leftTitle = 'US',
            rightTitle = 'THEM',
            leftStats = [], // [{ value: '12G', label: 'PROTEIN', prefix: '' }]
            rightStats = [], // [{ value: '1G', label: 'PROTEIN', prefix: '≥' }]
            logoText = '',
            logoBgColor = '#F87171',
        } = config;

        const w = canvas.width;
        const h = canvas.height;

        let svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<!-- Split Background -->
<rect x="0" y="0" width="${w / 2}" height="${h}" fill="${leftColor}"/>
<rect x="${w / 2}" y="0" width="${w / 2}" height="${h}" fill="${rightColor}"/>

<!-- Titles -->
<text x="${w * 0.25}" y="80" font-family="Inter, -apple-system, sans-serif" 
      font-size="64" font-weight="800" fill="#1A1A1A" text-anchor="middle">${leftTitle}</text>

<circle cx="${w / 2}" cy="65" r="35" fill="#FFFFFF"/>
<text x="${w / 2}" y="75" font-family="Inter, sans-serif" 
      font-size="24" font-weight="700" fill="#1A1A1A" text-anchor="middle">VS.</text>

<text x="${w * 0.75}" y="80" font-family="Inter, -apple-system, sans-serif" 
      font-size="64" font-weight="800" fill="#1A1A1A" text-anchor="middle">${rightTitle}</text>
`;

        // Left stats (US - good values)
        const statsStartY = 200;
        const statSpacing = 120;

        leftStats.forEach((stat, i) => {
            const y = statsStartY + (i * statSpacing);
            svg += `
<text x="${w * 0.25}" y="${y}" font-family="Inter, sans-serif" text-anchor="middle">
    <tspan font-size="36" font-weight="800" fill="#1A1A1A">${stat.prefix || ''}${stat.value}</tspan>
    <tspan font-size="24" font-weight="600" fill="#1A1A1A"> ${stat.label}</tspan>
</text>`;
        });

        // Right stats (THEM - bad values)
        rightStats.forEach((stat, i) => {
            const y = statsStartY + (i * statSpacing);
            svg += `
<text x="${w * 0.75}" y="${y}" font-family="Inter, sans-serif" text-anchor="middle">
    <tspan font-size="36" font-weight="400" fill="#4B5563">${stat.prefix || ''}${stat.value}</tspan>
    <tspan font-size="24" font-weight="400" fill="#4B5563"> ${stat.label}</tspan>
</text>`;
        });

        // Logo
        if (logoText) {
            svg += `
<!-- Logo -->
<rect x="0" y="${h - 80}" width="150" height="80" fill="${logoBgColor}"/>
<text x="75" y="${h - 30}" font-family="Inter, sans-serif" 
      font-size="28" font-weight="700" fill="#FFFFFF" text-anchor="middle">${logoText}</text>
`;
        }

        svg += `</svg>`;
        return svg;
    },
};

// ============================================================
// PATTERN 3: FEATURE CALLOUTS DOTTED (Pureful Style)
// Light background, product center, dotted lines to features
// ============================================================

export const FEATURE_CALLOUTS_DOTTED_PATTERN = {
    id: 'feature_callouts_dotted',
    name: 'Feature Callouts Dotted',
    description: 'Light background, centered product, dotted lines pointing to feature labels',

    canvas: { width: 1080, height: 1080 },

    generateSVG: (config) => {
        const {
            canvas = { width: 1080, height: 1080 },
            bgColor = '#A7F3D0', // Mint green
            headline = 'ECO-CORK YOGA MAT',
            subheadline = '(This frickin\' thing saves the planet)',
            logoText = 'pureful',
            logoIcon = '🌿',
            features = [], // [{ text: 'CO2 Fighter', position: 'top-center', x: 0.5, y: 0.25 }]
            footnote = '',
            productZone = { x: 0.15, y: 0.35, width: 0.70, height: 0.45 },
        } = config;

        const w = canvas.width;
        const h = canvas.height;

        // Calculate product center for line connections
        const prodCenterX = (productZone.x + productZone.width / 2) * w;
        const prodCenterY = (productZone.y + productZone.height / 2) * h;

        let svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<!-- Background -->
<rect width="100%" height="100%" fill="${bgColor}"/>

<!-- Logo -->
<text x="${w / 2}" y="50" font-family="Inter, sans-serif" text-anchor="middle">
    <tspan font-size="28">${logoIcon}</tspan>
    <tspan font-size="28" font-weight="600" fill="#1A1A1A"> ${logoText}</tspan>
</text>

<!-- Headline -->
<text x="${w / 2}" y="100" font-family="Inter, -apple-system, sans-serif" 
      font-size="36" font-weight="800" fill="#1A1A1A" text-anchor="middle" letter-spacing="2">${headline}</text>

<!-- Subheadline -->
<text x="${w / 2}" y="145" font-family="Inter, sans-serif" 
      font-size="22" font-weight="400" fill="#374151" text-anchor="middle" font-style="italic">${subheadline}</text>
`;

        // Draw dotted lines and feature labels
        features.forEach((feature, i) => {
            const fx = feature.x * w;
            const fy = feature.y * h;
            const isLeft = feature.x < 0.5;
            const textAnchor = isLeft ? 'end' : 'start';
            const textX = isLeft ? fx - 15 : fx + 15;

            // Circle marker on product
            const markerX = feature.markerX ? feature.markerX * w : prodCenterX + (isLeft ? -100 : 100);
            const markerY = feature.markerY ? feature.markerY * h : prodCenterY;

            svg += `
<!-- Feature: ${feature.text} -->
<circle cx="${markerX}" cy="${markerY}" r="8" fill="none" stroke="#1A1A1A" stroke-width="2"/>
<line x1="${markerX}" y1="${markerY}" x2="${fx}" y2="${fy}" 
      stroke="#1A1A1A" stroke-width="1.5" stroke-dasharray="6,4"/>
<text x="${textX}" y="${fy + 5}" font-family="Inter, sans-serif" 
      font-size="18" font-weight="500" fill="#1A1A1A" text-anchor="${textAnchor}">${feature.text}</text>
`;
        });

        // Footnote
        if (footnote) {
            svg += `
<!-- Footnote -->
<text x="${w / 2}" y="${h - 40}" font-family="Inter, sans-serif" 
      font-size="18" fill="#4B5563" text-anchor="middle" font-style="italic">${footnote}</text>
`;
        }

        svg += `</svg>`;
        return svg;
    },
};

// ============================================================
// PATTERN 4: CHECKMARK COMPARISON (GRO Style)
// Split warm background, checkmarks vs X marks
// ============================================================

export const CHECKMARK_COMPARISON_PATTERN = {
    id: 'checkmark_comparison',
    name: 'Checkmark Comparison',
    description: 'Warm split background, product vs competitor with ✓/✗ benefits',

    canvas: { width: 1080, height: 1080 },

    generateSVG: (config) => {
        const {
            canvas = { width: 1080, height: 1080 },
            leftBgColor = '#F5E6D3', // Warm beige
            rightBgColor = '#D1D5DB', // Cool gray
            leftTitle = 'Your Product',
            rightTitle = 'Other Products',
            benefits = [], // [{ text: 'NO HARMFUL SIDE EFFECTS' }]
            checkColor = '#047857', // Green
            xColor = '#DC2626', // Red
        } = config;

        const w = canvas.width;
        const h = canvas.height;

        let svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<!-- Split Background -->
<rect x="0" y="0" width="${w / 2 + 20}" height="${h}" fill="${leftBgColor}"/>
<rect x="${w / 2}" y="0" width="${w / 2}" height="${h}" fill="${rightBgColor}"/>

<!-- Vertical Divider -->
<line x1="${w / 2}" y1="0" x2="${w / 2}" y2="${h}" stroke="#9CA3AF" stroke-width="1"/>

<!-- Left Title -->
<text x="${w * 0.25}" y="80" font-family="Georgia, serif" 
      font-size="42" fill="#1A1A1A" text-anchor="middle">${leftTitle.split(' ')[0] || ''}</text>
<text x="${w * 0.25}" y="130" font-family="Georgia, serif" 
      font-size="42" fill="#1A1A1A" text-anchor="middle">${leftTitle.split(' ').slice(1).join(' ') || ''}</text>

<!-- Right Title -->
<text x="${w * 0.75}" y="80" font-family="Georgia, serif" 
      font-size="36" fill="#6B7280" text-anchor="middle">${rightTitle.split(' ')[0] || ''}</text>
<text x="${w * 0.75}" y="125" font-family="Georgia, serif" 
      font-size="36" fill="#6B7280" text-anchor="middle">${rightTitle.split(' ').slice(1, 3).join(' ') || ''}</text>
<text x="${w * 0.75}" y="170" font-family="Georgia, serif" 
      font-size="36" fill="#6B7280" text-anchor="middle">${rightTitle.split(' ').slice(3).join(' ') || ''}</text>
`;

        // Benefits with checkmarks and X marks
        const startY = 350;
        const spacing = 110;

        benefits.forEach((benefit, i) => {
            const y = startY + (i * spacing);

            // Checkmark on left
            svg += `
<!-- Benefit: ${benefit.text} -->
<text x="${w * 0.38}" y="${y}" font-family="Inter, sans-serif" 
      font-size="36" fill="${checkColor}">✓</text>
<text x="${w * 0.42}" y="${y}" font-family="Inter, sans-serif" 
      font-size="16" font-weight="600" fill="#1A1A1A">${benefit.text.split(' ').slice(0, 2).join(' ')}</text>
<text x="${w * 0.42}" y="${y + 22}" font-family="Inter, sans-serif" 
      font-size="16" font-weight="600" fill="#1A1A1A">${benefit.text.split(' ').slice(2).join(' ')}</text>

<!-- X mark on right -->
<text x="${w * 0.72}" y="${y}" font-family="Inter, sans-serif" 
      font-size="36" fill="${xColor}">✗</text>
`;
        });

        svg += `</svg>`;
        return svg;
    },
};

// ============================================================
// PATTERN 5: FEATURE ARROWS (nucao Style)
// Solid color background, product center, curved arrows to features
// ============================================================

export const FEATURE_ARROWS_PATTERN = {
    id: 'feature_arrows',
    name: 'Feature Arrows',
    description: 'Vibrant solid background, product center, curved arrows pointing to features',

    canvas: { width: 1080, height: 1080 },

    generateSVG: (config) => {
        const {
            canvas = { width: 1080, height: 1080 },
            bgColor = '#F59E0B', // Orange
            headline = ['Now in', 'Sainsbury\'s', 'Springfield.'],
            features = [], // [{ text: 'Home compostable wrapper.', x: 0.15, y: 0.35, arrowDirection: 'right' }]
            ctaText = 'Try it now!',
            ctaBgColor = '#EA580C', // Darker orange
            textColor = '#FFFFFF',
        } = config;

        const w = canvas.width;
        const h = canvas.height;

        let svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<!-- Background -->
<rect width="100%" height="100%" fill="${bgColor}"/>

<!-- Headline -->
<text x="${w * 0.08}" y="100" font-family="Georgia, serif" 
      font-size="56" font-weight="400" font-style="italic" fill="${textColor}">${headline[0] || ''}</text>
<text x="${w * 0.08}" y="165" font-family="Georgia, serif" 
      font-size="56" font-weight="700" fill="${textColor}">${headline[1] || ''}</text>
<text x="${w * 0.08}" y="230" font-family="Georgia, serif" 
      font-size="56" font-weight="700" fill="${textColor}">${headline[2] || ''}</text>
`;

        // Draw feature labels with arrows
        features.forEach((feature, i) => {
            const fx = feature.x * w;
            const fy = feature.y * h;

            // Draw curved arrow
            const arrowEnd = feature.arrowDirection === 'right'
                ? { x: fx + 150, y: fy + 30 }
                : feature.arrowDirection === 'left'
                    ? { x: fx - 20, y: fy + 30 }
                    : { x: fx + 80, y: fy + 50 };

            svg += `
<!-- Feature: ${feature.text} -->
<text x="${fx}" y="${fy}" font-family="Inter, sans-serif" 
      font-size="18" font-weight="500" fill="${textColor}">${feature.text.split('.')[0]}.</text>
${feature.text.split('.')[1] ? `<text x="${fx}" y="${fy + 24}" font-family="Inter, sans-serif" 
      font-size="18" font-weight="500" fill="${textColor}">${feature.text.split('.')[1]}.</text>` : ''}

<!-- Arrow -->
<path d="M ${fx + 80} ${fy + 15} Q ${fx + 120} ${fy + 60} ${arrowEnd.x} ${arrowEnd.y}" 
      fill="none" stroke="${textColor}" stroke-width="2" marker-end="url(#arrowhead)"/>
`;
        });

        // Add arrowhead marker
        svg += `
<defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="${textColor}"/>
    </marker>
</defs>
`;

        // CTA Button (bottom right corner as circle)
        if (ctaText) {
            svg += `
<!-- CTA -->
<circle cx="${w - 80}" cy="${h - 80}" r="100" fill="${ctaBgColor}"/>
<text x="${w - 80}" y="${h - 70}" font-family="Inter, sans-serif" 
      font-size="22" font-weight="600" fill="${textColor}" text-anchor="middle">${ctaText}</text>
`;
        }

        svg += `</svg>`;
        return svg;
    },
};

// ============================================================
// PATTERN SELECTOR - Auto-detect best pattern
// ============================================================

export function selectBestPattern(context) {
    const {
        hasCompetitor = false,
        hasTableData = false,
        hasFeatures = false,
        featureCount = 0,
        hasChecklistBenefits = false,
        industry = 'retail',
        campaignType = 'evergreen',
    } = context;

    // Competitor comparison with data table
    if (hasCompetitor && hasTableData) {
        return COMPARISON_TABLE_PATTERN;
    }

    // Competitor comparison with checklist
    if (hasCompetitor && hasChecklistBenefits) {
        // Split decision based on style preference
        if (industry === 'beauty' || industry === 'wellness') {
            return CHECKMARK_COMPARISON_PATTERN;
        }
        return US_VS_THEM_SPLIT_PATTERN;
    }

    // Many features to highlight
    if (hasFeatures && featureCount >= 5) {
        return FEATURE_CALLOUTS_DOTTED_PATTERN;
    }

    // Few features with strong messaging
    if (hasFeatures && featureCount <= 4) {
        return FEATURE_ARROWS_PATTERN;
    }

    // Default
    return FEATURE_ARROWS_PATTERN;
}

// ============================================================
// ALL PATTERNS COLLECTION
// ============================================================

export const AD_PATTERNS = {
    comparison_table: COMPARISON_TABLE_PATTERN,
    us_vs_them_split: US_VS_THEM_SPLIT_PATTERN,
    feature_callouts_dotted: FEATURE_CALLOUTS_DOTTED_PATTERN,
    checkmark_comparison: CHECKMARK_COMPARISON_PATTERN,
    feature_arrows: FEATURE_ARROWS_PATTERN,
};

// ============================================================
// EXPORTS
// ============================================================

export default {
    COMPARISON_TABLE_PATTERN,
    US_VS_THEM_SPLIT_PATTERN,
    FEATURE_CALLOUTS_DOTTED_PATTERN,
    CHECKMARK_COMPARISON_PATTERN,
    FEATURE_ARROWS_PATTERN,
    AD_PATTERNS,
    selectBestPattern,
};
