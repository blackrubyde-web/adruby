/**
 * TYPOGRAPHY MASTERY SYSTEM
 * 
 * Professional typography like Figma/Photoshop designers:
 * 
 * - Font Pairing Intelligence
 * - Type Hierarchy Systems
 * - Kerning/Tracking Calculations
 * - Line Height Science
 * - Text Fitting Algorithms
 * - Responsive Typography
 * - Font Feature Settings
 * - Text Effects (gradients, shadows, outlines)
 * - Readability Scoring
 */

// ========================================
// PROFESSIONAL FONT PAIRINGS
// ========================================

export const FONT_PAIRINGS = {
    // Premium Sans Combinations
    modern_tech: {
        name: 'Modern Tech',
        headline: { family: 'Inter', weight: 800, style: 'normal' },
        subheadline: { family: 'Inter', weight: 500, style: 'normal' },
        body: { family: 'Inter', weight: 400, style: 'normal' },
        accent: { family: 'JetBrains Mono', weight: 500, style: 'normal' },
        mood: ['tech', 'professional', 'modern'],
        cssImport: '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap");'
    },

    premium_minimal: {
        name: 'Premium Minimal',
        headline: { family: 'Plus Jakarta Sans', weight: 700, style: 'normal' },
        subheadline: { family: 'Plus Jakarta Sans', weight: 500, style: 'normal' },
        body: { family: 'Plus Jakarta Sans', weight: 400, style: 'normal' },
        accent: { family: 'Plus Jakarta Sans', weight: 600, style: 'italic' },
        mood: ['minimal', 'elegant', 'clean'],
        cssImport: '@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap");'
    },

    bold_statement: {
        name: 'Bold Statement',
        headline: { family: 'Outfit', weight: 900, style: 'normal' },
        subheadline: { family: 'Outfit', weight: 500, style: 'normal' },
        body: { family: 'Outfit', weight: 400, style: 'normal' },
        accent: { family: 'Outfit', weight: 700, style: 'normal' },
        mood: ['bold', 'impactful', 'modern'],
        cssImport: '@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;900&display=swap");'
    },

    editorial_classic: {
        name: 'Editorial Classic',
        headline: { family: 'DM Serif Display', weight: 400, style: 'normal' },
        subheadline: { family: 'DM Sans', weight: 500, style: 'normal' },
        body: { family: 'DM Sans', weight: 400, style: 'normal' },
        accent: { family: 'DM Serif Display', weight: 400, style: 'italic' },
        mood: ['editorial', 'sophisticated', 'classic'],
        cssImport: '@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=DM+Serif+Display:ital,wght@0,400;1,400&display=swap");'
    },

    luxury_display: {
        name: 'Luxury Display',
        headline: { family: 'Playfair Display', weight: 700, style: 'normal' },
        subheadline: { family: 'Raleway', weight: 500, style: 'normal' },
        body: { family: 'Raleway', weight: 400, style: 'normal' },
        accent: { family: 'Playfair Display', weight: 500, style: 'italic' },
        mood: ['luxury', 'elegant', 'premium'],
        cssImport: '@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Raleway:wght@400;500&display=swap");'
    },

    friendly_rounded: {
        name: 'Friendly Rounded',
        headline: { family: 'Nunito', weight: 800, style: 'normal' },
        subheadline: { family: 'Nunito', weight: 600, style: 'normal' },
        body: { family: 'Nunito', weight: 400, style: 'normal' },
        accent: { family: 'Nunito', weight: 700, style: 'normal' },
        mood: ['friendly', 'approachable', 'warm'],
        cssImport: '@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap");'
    },

    geometric_clean: {
        name: 'Geometric Clean',
        headline: { family: 'Poppins', weight: 700, style: 'normal' },
        subheadline: { family: 'Poppins', weight: 500, style: 'normal' },
        body: { family: 'Poppins', weight: 400, style: 'normal' },
        accent: { family: 'Poppins', weight: 600, style: 'normal' },
        mood: ['geometric', 'clean', 'modern'],
        cssImport: '@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap");'
    },

    powerful_condensed: {
        name: 'Powerful Condensed',
        headline: { family: 'Oswald', weight: 700, style: 'normal' },
        subheadline: { family: 'Source Sans 3', weight: 500, style: 'normal' },
        body: { family: 'Source Sans 3', weight: 400, style: 'normal' },
        accent: { family: 'Oswald', weight: 600, style: 'normal' },
        mood: ['powerful', 'condensed', 'impactful'],
        cssImport: '@import url("https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Source+Sans+3:wght@400;500&display=swap");'
    },

    startup_fresh: {
        name: 'Startup Fresh',
        headline: { family: 'Manrope', weight: 800, style: 'normal' },
        subheadline: { family: 'Manrope', weight: 500, style: 'normal' },
        body: { family: 'Manrope', weight: 400, style: 'normal' },
        accent: { family: 'Space Grotesk', weight: 600, style: 'normal' },
        mood: ['startup', 'fresh', 'innovative'],
        cssImport: '@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;800&family=Space+Grotesk:wght@600&display=swap");'
    },

    futuristic_tech: {
        name: 'Futuristic Tech',
        headline: { family: 'Sora', weight: 700, style: 'normal' },
        subheadline: { family: 'Sora', weight: 500, style: 'normal' },
        body: { family: 'Sora', weight: 400, style: 'normal' },
        accent: { family: 'Space Mono', weight: 400, style: 'normal' },
        mood: ['futuristic', 'tech', 'cutting-edge'],
        cssImport: '@import url("https://fonts.googleapis.com/css2?family=Sora:wght@400;500;700&family=Space+Mono&display=swap");'
    }
};

// ========================================
// TYPE HIERARCHY SYSTEMS
// ========================================

export const TYPE_HIERARCHIES = {
    // Standard Ad Hierarchy
    ad_standard: {
        levels: [
            { name: 'headline', baseSize: 56, weight: 800, lineHeight: 1.1, letterSpacing: -2 },
            { name: 'subheadline', baseSize: 32, weight: 500, lineHeight: 1.25, letterSpacing: -0.5 },
            { name: 'body', baseSize: 18, weight: 400, lineHeight: 1.5, letterSpacing: 0 },
            { name: 'caption', baseSize: 14, weight: 400, lineHeight: 1.4, letterSpacing: 0.5 },
            { name: 'label', baseSize: 12, weight: 600, lineHeight: 1.2, letterSpacing: 1 }
        ]
    },

    // Impact Heavy (big headline, minimal else)
    impact_heavy: {
        levels: [
            { name: 'headline', baseSize: 72, weight: 900, lineHeight: 0.95, letterSpacing: -3 },
            { name: 'subheadline', baseSize: 24, weight: 400, lineHeight: 1.4, letterSpacing: 0 },
            { name: 'body', baseSize: 16, weight: 400, lineHeight: 1.5, letterSpacing: 0 },
            { name: 'caption', baseSize: 12, weight: 500, lineHeight: 1.3, letterSpacing: 0.5 }
        ]
    },

    // Balanced Editorial
    editorial: {
        levels: [
            { name: 'headline', baseSize: 48, weight: 600, lineHeight: 1.15, letterSpacing: -1 },
            { name: 'subheadline', baseSize: 28, weight: 500, lineHeight: 1.3, letterSpacing: -0.25 },
            { name: 'body', baseSize: 18, weight: 400, lineHeight: 1.6, letterSpacing: 0.15 },
            { name: 'caption', baseSize: 14, weight: 400, lineHeight: 1.5, letterSpacing: 0.25 },
            { name: 'overline', baseSize: 12, weight: 600, lineHeight: 1.2, letterSpacing: 2, transform: 'uppercase' }
        ]
    },

    // Luxury Refined
    luxury: {
        levels: [
            { name: 'headline', baseSize: 52, weight: 500, lineHeight: 1.1, letterSpacing: 2 },
            { name: 'subheadline', baseSize: 22, weight: 300, lineHeight: 1.5, letterSpacing: 4 },
            { name: 'body', baseSize: 16, weight: 300, lineHeight: 1.8, letterSpacing: 0.5 },
            { name: 'caption', baseSize: 11, weight: 400, lineHeight: 1.6, letterSpacing: 3, transform: 'uppercase' }
        ]
    },

    // Compact Dense
    compact: {
        levels: [
            { name: 'headline', baseSize: 36, weight: 700, lineHeight: 1.1, letterSpacing: -1 },
            { name: 'subheadline', baseSize: 18, weight: 500, lineHeight: 1.3, letterSpacing: 0 },
            { name: 'body', baseSize: 14, weight: 400, lineHeight: 1.45, letterSpacing: 0 },
            { name: 'caption', baseSize: 11, weight: 400, lineHeight: 1.3, letterSpacing: 0 }
        ]
    }
};

// ========================================
// TRACKING/LETTER-SPACING CALCULATIONS
// ========================================

/**
 * Calculate optimal letter-spacing based on size and weight
 * Larger text needs tighter spacing, heavier weight needs looser
 */
export function calculateLetterSpacing(fontSize, fontWeight = 400) {
    // Base tracking (in em)
    let tracking = 0;

    // Size adjustments (larger = tighter)
    if (fontSize >= 72) tracking = -0.04;
    else if (fontSize >= 56) tracking = -0.03;
    else if (fontSize >= 42) tracking = -0.02;
    else if (fontSize >= 32) tracking = -0.01;
    else if (fontSize >= 18) tracking = 0;
    else if (fontSize >= 14) tracking = 0.01;
    else tracking = 0.02; // Small text needs more spacing for readability

    // Weight adjustments
    if (fontWeight >= 800) tracking += 0.01;
    else if (fontWeight >= 600) tracking += 0.005;

    return Math.round(tracking * fontSize * 10) / 10; // Convert em to px
}

/**
 * Calculate optimal line height
 */
export function calculateLineHeight(fontSize, contentType = 'headline') {
    const baseLineHeights = {
        headline: 1.1,
        subheadline: 1.25,
        body: 1.5,
        caption: 1.4,
        button: 1.2,
        label: 1.2
    };

    let baseHeight = baseLineHeights[contentType] || 1.4;

    // Larger text can have tighter line height
    if (fontSize >= 48) baseHeight = Math.max(0.95, baseHeight - 0.15);
    else if (fontSize >= 32) baseHeight = Math.max(1.0, baseHeight - 0.1);

    return Math.round(baseHeight * 100) / 100;
}

// ========================================
// TEXT FITTING ALGORITHMS
// ========================================

/**
 * Calculate optimal font size to fit text in width
 */
export function fitTextToWidth(text, maxWidth, fontFamily = 'Inter', minSize = 12, maxSize = 120) {
    // Approximate character width ratios
    const charWidthRatios = {
        'Inter': 0.5,
        'Outfit': 0.48,
        'Poppins': 0.52,
        'Playfair Display': 0.55,
        default: 0.5
    };

    const ratio = charWidthRatios[fontFamily] || charWidthRatios.default;
    const charCount = text.length;

    // Calculate approximate size
    let optimalSize = maxWidth / (charCount * ratio);

    // Clamp to min/max
    optimalSize = Math.max(minSize, Math.min(maxSize, optimalSize));

    return Math.floor(optimalSize);
}

/**
 * Split text into optimal lines for width
 */
export function wrapText(text, maxWidth, fontSize, fontFamily = 'Inter') {
    const charWidthRatio = 0.5;
    const avgCharWidth = fontSize * charWidthRatio;
    const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);

    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;

        if (testLine.length <= maxCharsPerLine) {
            currentLine = testLine;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    }

    if (currentLine) lines.push(currentLine);

    return {
        lines,
        lineCount: lines.length,
        longestLine: Math.max(...lines.map(l => l.length)),
        totalHeight: lines.length * fontSize * calculateLineHeight(fontSize, 'headline')
    };
}

// ========================================
// RESPONSIVE TYPOGRAPHY
// ========================================

/**
 * Generate fluid typography scale
 */
export function fluidTypeScale(minVw = 320, maxVw = 1920, minSize = 16, maxSize = 24) {
    const slope = (maxSize - minSize) / (maxVw - minVw);
    const yIntercept = minSize - slope * minVw;

    return {
        css: `clamp(${minSize}px, ${yIntercept.toFixed(4)}px + ${(slope * 100).toFixed(4)}vw, ${maxSize}px)`,
        minSize,
        maxSize,
        atWidth: (vw) => Math.min(maxSize, Math.max(minSize, slope * vw + yIntercept))
    };
}

/**
 * Scale typography for canvas size
 */
export function scaleTypographyForCanvas(baseHierarchy, canvasWidth, canvasHeight, referenceWidth = 1080) {
    const scaleFactor = canvasWidth / referenceWidth;
    const scaledHierarchy = { ...baseHierarchy };

    scaledHierarchy.levels = baseHierarchy.levels.map(level => ({
        ...level,
        baseSize: Math.round(level.baseSize * scaleFactor),
        letterSpacing: level.letterSpacing * scaleFactor
    }));

    return scaledHierarchy;
}

// ========================================
// TEXT EFFECTS (SVG)
// ========================================

/**
 * Generate gradient text SVG
 */
export function createGradientTextSVG({
    text,
    fontSize = 56,
    fontFamily = 'Inter',
    fontWeight = 800,
    gradientColors = ['#FF4757', '#FF6B81'],
    gradientAngle = 90,
    x = '50%',
    y = '50%',
    textAnchor = 'middle'
}) {
    const gradientId = `textGrad_${Date.now()}`;
    const radians = (gradientAngle * Math.PI) / 180;
    const x1 = 50 - 50 * Math.cos(radians);
    const y1 = 50 - 50 * Math.sin(radians);
    const x2 = 50 + 50 * Math.cos(radians);
    const y2 = 50 + 50 * Math.sin(radians);

    const stops = gradientColors.map((color, i) =>
        `<stop offset="${Math.round(i / (gradientColors.length - 1) * 100)}%" stop-color="${color}"/>`
    ).join('');

    return `
        <defs>
            <linearGradient id="${gradientId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
                ${stops}
            </linearGradient>
        </defs>
        <text 
            x="${x}" 
            y="${y}" 
            font-family="${fontFamily}, system-ui, sans-serif" 
            font-size="${fontSize}" 
            font-weight="${fontWeight}" 
            fill="url(#${gradientId})" 
            text-anchor="${textAnchor}" 
            dominant-baseline="central"
        >${escapeXml(text)}</text>
    `;
}

/**
 * Generate text with shadow/glow
 */
export function createTextWithShadow({
    text,
    fontSize = 56,
    fontFamily = 'Inter',
    fontWeight = 800,
    color = '#FFFFFF',
    shadowColor = '#000000',
    shadowBlur = 20,
    shadowOffsetX = 0,
    shadowOffsetY = 4,
    glowColor = null,
    glowIntensity = 0.5,
    x = '50%',
    y = '50%',
    textAnchor = 'middle'
}) {
    const filterId = `textShadow_${Date.now()}`;

    let filterSvg = `
        <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="${shadowOffsetX}" dy="${shadowOffsetY}" stdDeviation="${shadowBlur / 2}" flood-color="${shadowColor}" flood-opacity="0.5"/>
    `;

    if (glowColor) {
        filterSvg += `
            <feDropShadow dx="0" dy="0" stdDeviation="${shadowBlur * glowIntensity}" flood-color="${glowColor}" flood-opacity="${glowIntensity}"/>
        `;
    }

    filterSvg += '</filter>';

    return `
        <defs>${filterSvg}</defs>
        <text 
            x="${x}" 
            y="${y}" 
            font-family="${fontFamily}, system-ui, sans-serif" 
            font-size="${fontSize}" 
            font-weight="${fontWeight}" 
            fill="${color}" 
            filter="url(#${filterId})"
            text-anchor="${textAnchor}" 
            dominant-baseline="central"
        >${escapeXml(text)}</text>
    `;
}

/**
 * Create outline text
 */
export function createOutlineText({
    text,
    fontSize = 56,
    fontFamily = 'Inter',
    fontWeight = 800,
    fillColor = 'transparent',
    strokeColor = '#FFFFFF',
    strokeWidth = 2,
    x = '50%',
    y = '50%',
    textAnchor = 'middle'
}) {
    return `
        <text 
            x="${x}" 
            y="${y}" 
            font-family="${fontFamily}, system-ui, sans-serif" 
            font-size="${fontSize}" 
            font-weight="${fontWeight}" 
            fill="${fillColor}" 
            stroke="${strokeColor}"
            stroke-width="${strokeWidth}"
            text-anchor="${textAnchor}" 
            dominant-baseline="central"
        >${escapeXml(text)}</text>
    `;
}

// ========================================
// READABILITY SCORING
// ========================================

/**
 * Score readability of typography configuration
 */
export function scoreReadability({
    fontSize,
    lineHeight,
    letterSpacing,
    contrastRatio,
    charactersPerLine = 60,
    fontWeight = 400
}) {
    let score = 100;
    const issues = [];

    // Font size (14px minimum for body)
    if (fontSize < 14) {
        score -= 20;
        issues.push('Font size too small for body text');
    } else if (fontSize < 16) {
        score -= 10;
        issues.push('Font size slightly small');
    }

    // Line height
    if (lineHeight < 1.2) {
        score -= 15;
        issues.push('Line height too tight');
    } else if (lineHeight > 2.0) {
        score -= 10;
        issues.push('Line height too loose');
    }

    // Contrast ratio (WCAG)
    if (contrastRatio && contrastRatio < 4.5) {
        score -= 30;
        issues.push('Insufficient color contrast');
    } else if (contrastRatio && contrastRatio < 7) {
        score -= 10;
        issues.push('Could improve color contrast');
    }

    // Characters per line (45-75 optimal)
    if (charactersPerLine < 35) {
        score -= 10;
        issues.push('Line too short');
    } else if (charactersPerLine > 85) {
        score -= 15;
        issues.push('Line too long for comfortable reading');
    }

    // Very light weights are hard to read at small sizes
    if (fontWeight < 400 && fontSize < 16) {
        score -= 15;
        issues.push('Light weight at small size reduces readability');
    }

    return {
        score: Math.max(0, score),
        grade: score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F',
        issues,
        passes: score >= 60
    };
}

// ========================================
// FONT PAIRING RECOMMENDATIONS
// ========================================

/**
 * Get font pairing for industry/mood
 */
export function getFontPairingForContext(industry, mood) {
    const moodMap = {
        'tech': 'modern_tech',
        'professional': 'modern_tech',
        'minimal': 'premium_minimal',
        'elegant': 'premium_minimal',
        'bold': 'bold_statement',
        'impactful': 'bold_statement',
        'editorial': 'editorial_classic',
        'sophisticated': 'editorial_classic',
        'luxury': 'luxury_display',
        'premium': 'luxury_display',
        'friendly': 'friendly_rounded',
        'approachable': 'friendly_rounded',
        'clean': 'geometric_clean',
        'geometric': 'geometric_clean',
        'powerful': 'powerful_condensed',
        'startup': 'startup_fresh',
        'innovative': 'startup_fresh',
        'futuristic': 'futuristic_tech'
    };

    const industryMap = {
        'technology': 'modern_tech',
        'saas': 'startup_fresh',
        'finance': 'modern_tech',
        'luxury': 'luxury_display',
        'fashion': 'editorial_classic',
        'beauty': 'luxury_display',
        'health': 'geometric_clean',
        'fitness': 'powerful_condensed',
        'food': 'friendly_rounded',
        'education': 'geometric_clean'
    };

    // Try mood first, then industry, then default
    const key = moodMap[mood?.toLowerCase()] ||
        industryMap[industry?.toLowerCase()] ||
        'modern_tech';

    return FONT_PAIRINGS[key];
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function escapeXml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// ========================================
// TYPOGRAPHY SPEC GENERATOR
// ========================================

/**
 * Generate complete typography specification for ad design
 * Called by designIntelligenceIntegrator
 */
export function generateTypographySpec({
    industry = 'tech',
    mood = 'professional',
    hierarchy = 'ad_standard',
    canvasWidth = 1080,
    canvasHeight = 1080
} = {}) {
    // Get font pairing based on context
    const fontPairing = getFontPairingForContext(industry, mood);

    // Get type hierarchy
    const baseHierarchy = TYPE_HIERARCHIES[hierarchy] || TYPE_HIERARCHIES.ad_standard;

    // Scale for canvas
    const scaledHierarchy = scaleTypographyForCanvas(baseHierarchy, canvasWidth, canvasHeight);

    // Build complete spec
    return {
        fontPairing,
        hierarchy: scaledHierarchy,
        fonts: {
            headline: fontPairing.headline,
            subheadline: fontPairing.subheadline,
            body: fontPairing.body,
            accent: fontPairing.accent
        },
        cssImport: fontPairing.cssImport,
        levels: scaledHierarchy.levels.reduce((acc, level) => {
            acc[level.name] = {
                fontFamily: fontPairing[level.name]?.family || fontPairing.body.family,
                fontSize: level.baseSize,
                fontWeight: level.weight || fontPairing[level.name]?.weight || 400,
                lineHeight: level.lineHeight,
                letterSpacing: level.letterSpacing,
                textTransform: level.transform || 'none'
            };
            return acc;
        }, {}),
        mood: fontPairing.mood,
        industry
    };
}

export default {
    FONT_PAIRINGS,
    TYPE_HIERARCHIES,
    calculateLetterSpacing,
    calculateLineHeight,
    fitTextToWidth,
    wrapText,
    fluidTypeScale,
    scaleTypographyForCanvas,
    createGradientTextSVG,
    createTextWithShadow,
    createOutlineText,
    scoreReadability,
    getFontPairingForContext,
    generateTypographySpec
};
