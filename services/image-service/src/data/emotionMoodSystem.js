/**
 * EMOTION & MOOD MAPPING SYSTEM
 * 
 * Maps products to emotional triggers and moods:
 * - Primary and secondary emotions
 * - Color-emotion associations
 * - Typography-mood mappings
 * - Visual effect-emotion correlations
 * - Copy tone guidelines
 * - CTA emotion optimization
 */

// ========================================
// EMOTIONAL SPECTRUM
// ========================================

export const EMOTION_SPECTRUM = {
    // Positive high-energy emotions
    excitement: {
        name: 'Excitement',
        energy: 'high',
        valence: 'positive',
        colors: ['#FF4757', '#FF6B81', '#FFA502', '#FF6348'],
        typography: { weight: 800, letterSpacing: -2, style: 'bold' },
        effects: ['sparkles', 'glow', 'vibrant_gradients'],
        copy: { tone: 'energetic', punctuation: 'exclamations', length: 'short' },
        cta: { style: 'bold', urgency: 'high', text: ['Get Started!', 'Try Now!', 'Join Today!'] }
    },

    joy: {
        name: 'Joy',
        energy: 'high',
        valence: 'positive',
        colors: ['#FFC312', '#F79F1F', '#12CBC4', '#1289A7'],
        typography: { weight: 700, letterSpacing: -1, style: 'playful' },
        effects: ['confetti', 'bright_gradients', 'bokeh'],
        copy: { tone: 'playful', punctuation: 'exclamations', length: 'short' },
        cta: { style: 'playful', urgency: 'medium', text: ['Start Having Fun', 'Join the Fun', 'Try It Free'] }
    },

    desire: {
        name: 'Desire',
        energy: 'high',
        valence: 'positive',
        colors: ['#9B59B6', '#8E44AD', '#D63031', '#E84393'],
        typography: { weight: 600, letterSpacing: -1, style: 'elegant' },
        effects: ['luxury_glow', 'subtle_particles', 'reflections'],
        copy: { tone: 'seductive', punctuation: 'ellipsis', length: 'medium' },
        cta: { style: 'glow', urgency: 'medium', text: ['Discover Now', 'Unlock Access', 'Get Yours'] }
    },

    inspiration: {
        name: 'Inspiration',
        energy: 'medium_high',
        valence: 'positive',
        colors: ['#6C5CE7', '#A29BFE', '#00CEC9', '#55EFC4'],
        typography: { weight: 600, letterSpacing: 0, style: 'clean' },
        effects: ['light_rays', 'gradient_mesh', 'particles'],
        copy: { tone: 'inspiring', punctuation: 'periods', length: 'medium' },
        cta: { style: 'gradient', urgency: 'medium', text: ['Start Your Journey', 'Begin Today', 'Transform Now'] }
    },

    confidence: {
        name: 'Confidence',
        energy: 'medium',
        valence: 'positive',
        colors: ['#2D3436', '#636E72', '#3498DB', '#2980B9'],
        typography: { weight: 700, letterSpacing: -1, style: 'authoritative' },
        effects: ['minimal', 'clean_shadows', 'professional'],
        copy: { tone: 'confident', punctuation: 'periods', length: 'medium' },
        cta: { style: 'solid', urgency: 'medium', text: ['Get Started', 'Learn More', 'See How'] }
    },

    trust: {
        name: 'Trust',
        energy: 'medium',
        valence: 'positive',
        colors: ['#0984E3', '#74B9FF', '#00B894', '#55EFC4'],
        typography: { weight: 500, letterSpacing: 0, style: 'balanced' },
        effects: ['subtle', 'clean', 'professional'],
        copy: { tone: 'reassuring', punctuation: 'periods', length: 'medium' },
        cta: { style: 'solid', urgency: 'low', text: ['Start Free Trial', 'See Pricing', 'Contact Us'] }
    },

    peace: {
        name: 'Peace',
        energy: 'low',
        valence: 'positive',
        colors: ['#81ECEC', '#74B9FF', '#DFE6E9', '#B2BEC3'],
        typography: { weight: 400, letterSpacing: 1, style: 'light' },
        effects: ['soft_gradients', 'minimal', 'serene'],
        copy: { tone: 'calm', punctuation: 'periods', length: 'long' },
        cta: { style: 'soft', urgency: 'low', text: ['Find Your Calm', 'Begin Today', 'Start Now'] }
    },

    // Negative emotions (used strategically)
    fear: {
        name: 'Fear/Protection',
        energy: 'high',
        valence: 'negative_strategic',
        colors: ['#2D3436', '#636E72', '#E74C3C', '#C0392B'],
        typography: { weight: 700, letterSpacing: -1, style: 'bold' },
        effects: ['dark', 'warning_accents', 'contrast'],
        copy: { tone: 'urgent', punctuation: 'periods', length: 'short' },
        cta: { style: 'urgent', urgency: 'high', text: ['Protect Now', 'Secure Today', 'Don\'t Wait'] }
    },

    fomo: {
        name: 'FOMO',
        energy: 'high',
        valence: 'negative_strategic',
        colors: ['#E74C3C', '#D63031', '#FFA502', '#FF6348'],
        typography: { weight: 800, letterSpacing: -1, style: 'urgent' },
        effects: ['urgency_badges', 'countdown', 'limited'],
        copy: { tone: 'urgent', punctuation: 'exclamations', length: 'short' },
        cta: { style: 'urgent', urgency: 'high', text: ['Claim Now', 'Last Chance', 'Don\'t Miss Out'] }
    },

    curiosity: {
        name: 'Curiosity',
        energy: 'medium',
        valence: 'neutral_positive',
        colors: ['#9B59B6', '#8E44AD', '#6C5CE7', '#A29BFE'],
        typography: { weight: 500, letterSpacing: 0, style: 'intriguing' },
        effects: ['mystery', 'subtle_glow', 'reveal'],
        copy: { tone: 'mysterious', punctuation: 'ellipsis', length: 'short' },
        cta: { style: 'minimal', urgency: 'low', text: ['See How', 'Discover', 'Find Out'] }
    }
};

// ========================================
// PRODUCT-EMOTION MAPPINGS
// ========================================

export const PRODUCT_EMOTION_MAP = {
    // SaaS & Technology
    productivity_tool: ['confidence', 'inspiration', 'trust'],
    automation_software: ['excitement', 'confidence', 'trust'],
    analytics_platform: ['confidence', 'trust', 'curiosity'],
    ai_tool: ['excitement', 'curiosity', 'inspiration'],
    security_software: ['trust', 'fear', 'peace'],
    communication_tool: ['joy', 'trust', 'confidence'],
    design_tool: ['inspiration', 'joy', 'creativity'],
    developer_tool: ['confidence', 'trust', 'excitement'],

    // E-commerce
    luxury_fashion: ['desire', 'confidence', 'inspiration'],
    streetwear: ['excitement', 'confidence', 'fomo'],
    beauty_skincare: ['desire', 'confidence', 'trust'],
    beauty_makeup: ['joy', 'desire', 'excitement'],
    home_decor: ['peace', 'inspiration', 'desire'],
    electronics: ['excitement', 'desire', 'confidence'],
    food_gourmet: ['desire', 'joy', 'curiosity'],
    fitness_equipment: ['inspiration', 'confidence', 'excitement'],

    // Health & Wellness
    fitness_app: ['inspiration', 'excitement', 'confidence'],
    meditation_app: ['peace', 'trust', 'inspiration'],
    nutrition_supplement: ['confidence', 'trust', 'excitement'],
    healthcare_service: ['trust', 'peace', 'confidence'],
    mental_health_app: ['peace', 'trust', 'inspiration'],

    // Finance
    investment_app: ['confidence', 'excitement', 'trust'],
    banking_app: ['trust', 'confidence', 'peace'],
    crypto_platform: ['excitement', 'fomo', 'curiosity'],
    insurance_service: ['trust', 'peace', 'fear'],

    // Education
    online_course: ['inspiration', 'curiosity', 'confidence'],
    language_app: ['joy', 'curiosity', 'confidence'],
    certification: ['confidence', 'inspiration', 'trust'],
    kids_education: ['joy', 'curiosity', 'trust'],

    // Travel
    luxury_hotel: ['desire', 'peace', 'inspiration'],
    adventure_travel: ['excitement', 'inspiration', 'fomo'],
    travel_booking: ['excitement', 'fomo', 'confidence'],
    experience_platform: ['joy', 'excitement', 'curiosity']
};

// ========================================
// EMOTION SELECTION FUNCTIONS
// ========================================

/**
 * Get emotions for product type
 */
export function getEmotionsForProduct(productType, strategy = 'primary') {
    const normalized = productType?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'productivity_tool';

    // Direct match
    if (PRODUCT_EMOTION_MAP[normalized]) {
        const emotions = PRODUCT_EMOTION_MAP[normalized];
        if (strategy === 'primary') return emotions[0];
        if (strategy === 'secondary') return emotions[1];
        if (strategy === 'all') return emotions;
    }

    // Fuzzy match
    for (const [key, emotions] of Object.entries(PRODUCT_EMOTION_MAP)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            if (strategy === 'primary') return emotions[0];
            if (strategy === 'secondary') return emotions[1];
            if (strategy === 'all') return emotions;
        }
    }

    // Default
    return strategy === 'all' ? ['confidence', 'trust', 'inspiration'] : 'confidence';
}

/**
 * Get emotion config
 */
export function getEmotionConfig(emotionKey) {
    return EMOTION_SPECTRUM[emotionKey] || EMOTION_SPECTRUM.confidence;
}

/**
 * Map emotion to design parameters
 */
export function mapEmotionToDesign(emotion) {
    const config = getEmotionConfig(emotion);

    return {
        primaryColor: config.colors[0],
        secondaryColor: config.colors[1],
        gradientColors: config.colors,
        typography: config.typography,
        effects: config.effects,
        copyGuidelines: config.copy,
        ctaStyle: config.cta.style,
        ctaText: config.cta.text[0],
        ctaOptions: config.cta.text,
        urgencyLevel: config.cta.urgency
    };
}

/**
 * Generate emotion-based design specs
 */
export function generateEmotionBasedDesign(productType, primaryEmotion = null) {
    const emotion = primaryEmotion || getEmotionsForProduct(productType, 'primary');
    const secondaryEmotion = getEmotionsForProduct(productType, 'secondary');

    const primary = mapEmotionToDesign(emotion);
    const secondary = mapEmotionToDesign(secondaryEmotion);

    return {
        primaryEmotion: emotion,
        secondaryEmotion,
        design: primary,
        fallbackDesign: secondary,
        colorBlend: blendEmotionColors(primary.gradientColors, secondary.gradientColors),
        combinedEffects: [...new Set([...primary.effects, ...secondary.effects.slice(0, 1)])]
    };
}

/**
 * Blend colors from two emotion palettes
 */
function blendEmotionColors(primary, secondary) {
    return [
        primary[0],
        primary[1] || secondary[0],
        secondary[0] || primary[1]
    ];
}

// ========================================
// SEASONAL TREND ENGINE
// ========================================

export const SEASONAL_TRENDS = {
    // Major seasons
    spring: {
        months: [3, 4, 5],
        emotions: ['joy', 'inspiration', 'peace'],
        colors: ['#55EFC4', '#81ECEC', '#FD79A8', '#FDCB6E'],
        themes: ['renewal', 'growth', 'fresh_start'],
        ctaText: ['Start Fresh', 'Bloom Now', 'Spring Into']
    },
    summer: {
        months: [6, 7, 8],
        emotions: ['joy', 'excitement', 'desire'],
        colors: ['#FFC312', '#F79F1F', '#00CEC9', '#FF6B81'],
        themes: ['adventure', 'fun', 'freedom'],
        ctaText: ['Make This Summer', 'Adventure Awaits', 'Summer Special']
    },
    fall: {
        months: [9, 10, 11],
        emotions: ['inspiration', 'confidence', 'peace'],
        colors: ['#F97F51', '#E55039', '#B33939', '#7F8FA6'],
        themes: ['change', 'preparation', 'cozy'],
        ctaText: ['Fall Into', 'Embrace Change', 'Autumn Special']
    },
    winter: {
        months: [12, 1, 2],
        emotions: ['peace', 'desire', 'joy'],
        colors: ['#74B9FF', '#0984E3', '#DFE6E9', '#B2BEC3'],
        themes: ['warmth', 'togetherness', 'reflection'],
        ctaText: ['Winter Sale', 'Warm Up With', 'New Year, New']
    },

    // Major holidays
    valentines: {
        dates: [{ month: 2, days: [1, 14] }],
        emotions: ['desire', 'joy', 'peace'],
        colors: ['#E84393', '#FD79A8', '#C44569', '#FF6B6B'],
        themes: ['love', 'romance', 'gift'],
        ctaText: ['For Your Valentine', 'Share the Love', 'Perfect Gift']
    },
    mothers_day: {
        dates: [{ month: 5, days: [1, 14] }],
        emotions: ['joy', 'trust', 'peace'],
        colors: ['#FD79A8', '#55EFC4', '#81ECEC', '#FDCB6E'],
        themes: ['appreciation', 'love', 'gift'],
        ctaText: ['For Mom', 'Thank You, Mom', 'She Deserves']
    },
    fathers_day: {
        dates: [{ month: 6, days: [10, 21] }],
        emotions: ['trust', 'confidence', 'joy'],
        colors: ['#0984E3', '#2D3436', '#636E72', '#00B894'],
        themes: ['appreciation', 'strength', 'gift'],
        ctaText: ['For Dad', 'He Deserves', 'Dad\'ll Love']
    },
    black_friday: {
        dates: [{ month: 11, days: [20, 30] }],
        emotions: ['fomo', 'excitement', 'desire'],
        colors: ['#2D3436', '#E74C3C', '#FFC312', '#000000'],
        themes: ['savings', 'deals', 'limited'],
        ctaText: ['Black Friday', 'Biggest Sale', 'Limited Time']
    },
    cyber_monday: {
        dates: [{ month: 11, days: [25, 30] }],
        emotions: ['fomo', 'excitement', 'desire'],
        colors: ['#6C5CE7', '#0984E3', '#00CEC9', '#E74C3C'],
        themes: ['tech', 'deals', 'online'],
        ctaText: ['Cyber Monday', 'Online Only', 'Tech Deals']
    },
    christmas: {
        dates: [{ month: 12, days: [1, 25] }],
        emotions: ['joy', 'peace', 'desire'],
        colors: ['#D63031', '#00B894', '#FFC312', '#FFFFFF'],
        themes: ['gift', 'magic', 'family'],
        ctaText: ['Holiday Gift', 'Spread Joy', 'Magic Awaits']
    },
    new_year: {
        dates: [{ month: 12, days: [26, 31] }, { month: 1, days: [1, 15] }],
        emotions: ['inspiration', 'excitement', 'confidence'],
        colors: ['#FFC312', '#000000', '#FFFFFF', '#6C5CE7'],
        themes: ['new_beginning', 'goals', 'transformation'],
        ctaText: ['New Year, New', 'Start 2026 Right', 'Resolution Ready']
    },
    back_to_school: {
        dates: [{ month: 8, days: [1, 31] }, { month: 9, days: [1, 15] }],
        emotions: ['inspiration', 'confidence', 'excitement'],
        colors: ['#0984E3', '#6C5CE7', '#FFC312', '#00B894'],
        themes: ['learning', 'preparation', 'growth'],
        ctaText: ['Back to School', 'Level Up', 'Get Ready']
    }
};

/**
 * Get current seasonal trend
 */
export function getCurrentSeasonalTrend() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    // Check holidays first (more specific)
    for (const [key, trend] of Object.entries(SEASONAL_TRENDS)) {
        if (trend.dates) {
            for (const dateRange of trend.dates) {
                if (dateRange.month === month && day >= dateRange.days[0] && day <= dateRange.days[1]) {
                    return { key, ...trend, type: 'holiday' };
                }
            }
        }
    }

    // Fall back to season
    for (const [key, trend] of Object.entries(SEASONAL_TRENDS)) {
        if (trend.months?.includes(month)) {
            return { key, ...trend, type: 'season' };
        }
    }

    return null;
}

/**
 * Apply seasonal overlay to design
 */
export function applySeasonalTrend(baseDesign, seasonal) {
    if (!seasonal) return baseDesign;

    return {
        ...baseDesign,
        seasonalOverlay: {
            name: seasonal.key,
            type: seasonal.type,
            accentColors: seasonal.colors.slice(0, 2),
            suggestedCTA: seasonal.ctaText[0],
            themes: seasonal.themes,
            emotionBoost: seasonal.emotions[0]
        }
    };
}

export default {
    EMOTION_SPECTRUM,
    PRODUCT_EMOTION_MAP,
    SEASONAL_TRENDS,
    getEmotionsForProduct,
    getEmotionConfig,
    mapEmotionToDesign,
    generateEmotionBasedDesign,
    getCurrentSeasonalTrend,
    applySeasonalTrend
};
