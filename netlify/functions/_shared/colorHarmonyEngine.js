/**
 * Color Harmony Engine - Algorithmic Color Intelligence
 * Psychology-based color selection with harmony rules
 * Generates perfect color palettes for any ad
 */

/**
 * Color Psychology - What each color triggers emotionally
 */
export const COLOR_PSYCHOLOGY = {
    red: {
        hex: '#E74C3C',
        variants: ['#C0392B', '#E74C3C', '#FF6B6B', '#FF4757', '#EA2027'],
        emotions: ['urgency', 'excitement', 'passion', 'energy', 'action'],
        industries: ['food', 'fitness', 'sale', 'urgency'],
        avoid: ['health', 'luxury', 'calm'],
    },
    orange: {
        hex: '#F39C12',
        variants: ['#E67E22', '#F39C12', '#FF9F43', '#FFA502', '#FECA57'],
        emotions: ['friendly', 'confident', 'creative', 'adventure'],
        industries: ['food', 'travel', 'kids', 'eco'],
        avoid: ['luxury', 'tech'],
    },
    yellow: {
        hex: '#F1C40F',
        variants: ['#F39C12', '#F1C40F', '#FFD93D', '#FFC312', '#FDCB6E'],
        emotions: ['happy', 'optimism', 'clarity', 'warmth'],
        industries: ['kids', 'food', 'creative', 'sale'],
        avoid: ['luxury', 'serious'],
    },
    green: {
        hex: '#2ECC71',
        variants: ['#27AE60', '#2ECC71', '#00D26A', '#26DE81', '#20BF6B'],
        emotions: ['nature', 'health', 'growth', 'money', 'eco'],
        industries: ['health', 'eco', 'finance', 'food'],
        avoid: ['luxury', 'tech'],
    },
    teal: {
        hex: '#1ABC9C',
        variants: ['#16A085', '#1ABC9C', '#00CEC9', '#0FB9B1', '#17C0EB'],
        emotions: ['calm', 'sophisticated', 'balance', 'trust'],
        industries: ['health', 'tech', 'saas', 'wellness'],
        avoid: [],
    },
    blue: {
        hex: '#3498DB',
        variants: ['#2980B9', '#3498DB', '#4A90D9', '#0984E3', '#54A0FF'],
        emotions: ['trust', 'professional', 'calm', 'security'],
        industries: ['tech', 'saas', 'finance', 'health', 'corporate'],
        avoid: ['food', 'warm'],
    },
    purple: {
        hex: '#9B59B6',
        variants: ['#8E44AD', '#9B59B6', '#6C5CE7', '#A55EEA', '#9980FA'],
        emotions: ['luxury', 'creative', 'wisdom', 'mystery'],
        industries: ['beauty', 'luxury', 'creative', 'education'],
        avoid: ['food', 'eco'],
    },
    pink: {
        hex: '#E84393',
        variants: ['#C44569', '#E84393', '#FD79A8', '#F78FB3', '#FDA7DF'],
        emotions: ['feminine', 'playful', 'romantic', 'young'],
        industries: ['beauty', 'fashion', 'kids', 'lifestyle'],
        avoid: ['tech', 'b2b', 'automotive'],
    },
    black: {
        hex: '#1A1A1A',
        variants: ['#000000', '#1A1A1A', '#2C2C2C', '#2D3436', '#1E272E'],
        emotions: ['luxury', 'power', 'elegance', 'modern'],
        industries: ['luxury', 'tech', 'fashion', 'automotive'],
        avoid: ['kids', 'eco'],
    },
    white: {
        hex: '#FFFFFF',
        variants: ['#FFFFFF', '#FAFAFA', '#F5F5F5', '#ECEFF1', '#F8F9FA'],
        emotions: ['clean', 'pure', 'simple', 'minimal'],
        industries: ['tech', 'health', 'luxury', 'minimal'],
        avoid: [],
    },
    gold: {
        hex: '#D4AF37',
        variants: ['#B8860B', '#D4AF37', '#F39C12', '#D4AC0D', '#C9B037'],
        emotions: ['premium', 'success', 'quality', 'wealth'],
        industries: ['luxury', 'finance', 'award', 'premium'],
        avoid: ['eco', 'budget'],
    },
};

/**
 * Color Harmony Types
 */
export const HARMONY_TYPES = {
    complementary: {
        name: 'Complementary',
        description: 'Opposite colors on wheel - high contrast, bold',
        getColors: (baseHue) => [baseHue, (baseHue + 180) % 360],
    },
    analogous: {
        name: 'Analogous',
        description: 'Adjacent colors - harmonious, comfortable',
        getColors: (baseHue) => [baseHue, (baseHue + 30) % 360, (baseHue + 330) % 360],
    },
    triadic: {
        name: 'Triadic',
        description: 'Three evenly spaced - vibrant, balanced',
        getColors: (baseHue) => [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360],
    },
    splitComplementary: {
        name: 'Split Complementary',
        description: 'Base + two adjacent to complement - versatile',
        getColors: (baseHue) => [baseHue, (baseHue + 150) % 360, (baseHue + 210) % 360],
    },
    monochromatic: {
        name: 'Monochromatic',
        description: 'Variations of one hue - elegant, cohesive',
        getColors: (baseHue) => [baseHue],
    },
};

/**
 * Convert hex to HSL
 */
export function hexToHsl(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 50 };

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Convert HSL to hex
 */
export function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

    r = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    g = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    b = Math.round((b + m) * 255).toString(16).padStart(2, '0');

    return `#${r}${g}${b}`.toUpperCase();
}

/**
 * Generate harmonious palette from base color
 */
export function generateHarmoniousPalette(baseColor, harmonyType = 'complementary') {
    const hsl = hexToHsl(baseColor);
    const harmony = HARMONY_TYPES[harmonyType] || HARMONY_TYPES.complementary;
    const hues = harmony.getColors(hsl.h);

    const palette = [];

    // Primary colors
    for (const hue of hues) {
        palette.push(hslToHex(hue, hsl.s, hsl.l));
    }

    // Light variant
    palette.push(hslToHex(hsl.h, Math.max(hsl.s - 20, 0), Math.min(hsl.l + 30, 95)));

    // Dark variant
    palette.push(hslToHex(hsl.h, Math.min(hsl.s + 10, 100), Math.max(hsl.l - 25, 10)));

    return {
        primary: palette[0],
        secondary: palette[1] || palette[0],
        accent: palette[2] || palette[1] || palette[0],
        light: palette[palette.length - 2],
        dark: palette[palette.length - 1],
        all: palette,
        harmonyType: harmony.name,
    };
}

/**
 * Recommend colors based on goal/emotion
 */
export function recommendColorsForGoal(goal) {
    const goalColors = {
        conversion: ['red', 'orange', 'yellow'], // Urgency, action
        trust: ['blue', 'teal', 'green'], // Security, calm
        luxury: ['black', 'gold', 'purple'], // Premium, exclusive
        energy: ['red', 'orange', 'yellow'], // Excitement
        calm: ['blue', 'teal', 'green'], // Relaxing
        creative: ['purple', 'pink', 'orange'], // Playful
        natural: ['green', 'teal', 'brown'], // Organic
        modern: ['black', 'blue', 'teal'], // Tech
        feminine: ['pink', 'purple', 'gold'], // Beauty
        masculine: ['blue', 'black', 'green'], // Strong
    };

    const colorNames = goalColors[goal] || goalColors.conversion;
    return colorNames.map(name => COLOR_PSYCHOLOGY[name]);
}

/**
 * Extract dominant color from Vision description
 */
export function extractColorsFromDescription(description) {
    const colorKeywords = {
        red: ['red', 'rot', 'crimson', 'cherry', 'ruby'],
        orange: ['orange', 'coral', 'peach', 'tangerine'],
        yellow: ['yellow', 'gelb', 'gold', 'golden', 'cream'],
        green: ['green', 'grün', 'mint', 'olive', 'sage', 'emerald'],
        blue: ['blue', 'blau', 'navy', 'sky', 'teal', 'cyan', 'azure'],
        purple: ['purple', 'violet', 'lila', 'lavender', 'plum'],
        pink: ['pink', 'rosa', 'fuchsia', 'magenta', 'blush'],
        black: ['black', 'schwarz', 'dark', 'charcoal', 'ebony'],
        white: ['white', 'weiß', 'cream', 'ivory', 'snow'],
        brown: ['brown', 'braun', 'beige', 'tan', 'chocolate', 'coffee'],
    };

    const descLower = (description || '').toLowerCase();
    const detectedColors = [];

    for (const [color, keywords] of Object.entries(colorKeywords)) {
        for (const keyword of keywords) {
            if (descLower.includes(keyword)) {
                if (!detectedColors.includes(color)) {
                    detectedColors.push(color);
                }
                break;
            }
        }
    }

    return detectedColors;
}

/**
 * Build optimal color palette for ad
 */
export function buildOptimalPalette(options) {
    const {
        industry,
        goal = 'conversion',
        productColors = [], // From vision analysis
        brandColor = null,
        mood = 'energetic',
    } = options;

    let baseColor;

    // Priority 1: Brand color if provided
    if (brandColor) {
        baseColor = brandColor;
    }
    // Priority 2: Use product colors if detected
    else if (productColors.length > 0) {
        const productColorPsych = COLOR_PSYCHOLOGY[productColors[0]];
        if (productColorPsych) {
            baseColor = productColorPsych.variants[0];
        }
    }
    // Priority 3: Use goal-based recommendation
    else {
        const goalColors = recommendColorsForGoal(goal);
        if (goalColors.length > 0) {
            baseColor = goalColors[0].variants[Math.floor(Math.random() * goalColors[0].variants.length)];
        }
    }

    // Fallback
    if (!baseColor) {
        baseColor = '#F5A623'; // Default warm orange
    }

    // Generate harmonious palette
    const harmonyType = selectHarmonyType(mood);
    const palette = generateHarmoniousPalette(baseColor, harmonyType);

    return {
        ...palette,
        background: palette.primary,
        textPrimary: getContrastingTextColor(palette.primary),
        textSecondary: getContrastingTextColor(palette.light),
    };
}

/**
 * Select harmony type based on mood
 */
function selectHarmonyType(mood) {
    const moodHarmony = {
        energetic: 'complementary',
        calm: 'analogous',
        bold: 'triadic',
        elegant: 'monochromatic',
        balanced: 'splitComplementary',
    };
    return moodHarmony[mood] || 'complementary';
}

/**
 * Get contrasting text color (black or white)
 */
export function getContrastingTextColor(bgColor) {
    const hsl = hexToHsl(bgColor);
    return hsl.l > 50 ? '#1A1A1A' : '#FFFFFF';
}

/**
 * Describe color palette in words for AI prompts
 */
export function describePaletteForPrompt(palette) {
    return `
Color Palette:
- Background: ${describeColorName(palette.background)} (${palette.background})
- Primary: ${describeColorName(palette.primary)} (${palette.primary})
- Accent: ${describeColorName(palette.accent)} (${palette.accent})
- Text: ${palette.textPrimary}
- Color harmony: ${palette.harmonyType}
`;
}

/**
 * Describe a color in human terms
 */
function describeColorName(hex) {
    const hsl = hexToHsl(hex);

    // Determine hue name
    let hueName;
    if (hsl.s < 10) {
        hueName = hsl.l > 50 ? 'white/gray' : 'dark gray/black';
    } else if (hsl.h < 30) hueName = 'red/orange';
    else if (hsl.h < 60) hueName = 'orange/yellow';
    else if (hsl.h < 120) hueName = 'yellow/green';
    else if (hsl.h < 180) hueName = 'green/teal';
    else if (hsl.h < 240) hueName = 'blue/cyan';
    else if (hsl.h < 300) hueName = 'purple/violet';
    else hueName = 'pink/red';

    // Determine brightness
    let brightness;
    if (hsl.l < 30) brightness = 'dark';
    else if (hsl.l < 60) brightness = 'medium';
    else brightness = 'light';

    // Determine saturation
    let saturation;
    if (hsl.s < 30) saturation = 'muted';
    else if (hsl.s < 70) saturation = 'moderate';
    else saturation = 'vibrant';

    return `${saturation} ${brightness} ${hueName}`;
}
