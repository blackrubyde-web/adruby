/**
 * Industry Configuration
 * 
 * Industry-specific presets for colors, typography, effects, and template selection.
 * Based on reference ad analysis across 8 verticals.
 */

export const INDUSTRIES = {
    tech: {
        name: 'Technology',
        colors: {
            primary: '#3498DB',
            secondary: '#2980B9',
            accent: '#00D4FF',
            backgroundLight: '#F0F4F8',
            backgroundDark: '#0A0F1A',
            text: '#FFFFFF',
            textLight: '#1a1a1a'
        },
        typography: {
            headlineFont: 'Inter',
            headlineWeight: 700,
            bodyFont: 'Inter',
            ctaFont: 'Inter'
        },
        effects: ['neon_glow', 'glass_reflection', 'subtle_grid'],
        preferredTemplates: ['feature_callout', 'hero_product', 'stats_grid'],
        defaultStyle: 'dark',
        keywords: ['tech', 'software', 'app', 'device', 'gadget', 'digital', 'smart', 'AI', 'cloud']
    },

    food: {
        name: 'Food & Beverage',
        colors: {
            primary: '#E67E22',
            secondary: '#D35400',
            accent: '#F39C12',
            backgroundLight: '#FFF8E7',
            backgroundDark: '#3D2914',
            text: '#1a1a1a',
            textLight: '#1a1a1a'
        },
        typography: {
            headlineFont: 'Playfair Display',
            headlineWeight: 700,
            bodyFont: 'Inter',
            ctaFont: 'Inter'
        },
        effects: ['warm_glow', 'soft_shadow', 'appetizing_tint'],
        preferredTemplates: ['stats_grid', 'hero_product', 'lifestyle_context'],
        defaultStyle: 'light',
        keywords: ['food', 'meal', 'snack', 'drink', 'beverage', 'protein', 'organic', 'healthy', 'tasty']
    },

    fashion: {
        name: 'Fashion & Apparel',
        colors: {
            primary: '#1a1a1a',
            secondary: '#333333',
            accent: '#C9A227',
            backgroundLight: '#F5F5F5',
            backgroundDark: '#0a0a0a',
            text: '#1a1a1a',
            textLight: '#FFFFFF'
        },
        typography: {
            headlineFont: 'Montserrat',
            headlineWeight: 600,
            bodyFont: 'Inter',
            ctaFont: 'Montserrat'
        },
        effects: ['editorial_shadow', 'grain', 'high_contrast'],
        preferredTemplates: ['lifestyle_context', 'comparison_split', 'hero_product'],
        defaultStyle: 'light',
        keywords: ['fashion', 'clothing', 'wear', 'style', 'outfit', 'apparel', 'dress', 'shoes', 'accessory']
    },

    beauty: {
        name: 'Beauty & Skincare',
        colors: {
            primary: '#E91E63',
            secondary: '#C2185B',
            accent: '#FF80AB',
            backgroundLight: '#FFF0F5',
            backgroundDark: '#2D1F2D',
            text: '#1a1a1a',
            textLight: '#FFFFFF'
        },
        typography: {
            headlineFont: 'Playfair Display',
            headlineWeight: 500,
            bodyFont: 'Lato',
            ctaFont: 'Inter'
        },
        effects: ['soft_glow', 'bloom', 'skin_smooth'],
        preferredTemplates: ['hero_product', 'stats_grid', 'lifestyle_context'],
        defaultStyle: 'light',
        keywords: ['beauty', 'skin', 'makeup', 'cosmetic', 'serum', 'cream', 'glow', 'radiant', 'natural']
    },

    eco: {
        name: 'Eco & Sustainable',
        colors: {
            primary: '#27AE60',
            secondary: '#1E8449',
            accent: '#2ECC71',
            backgroundLight: '#E8F8E8',
            backgroundDark: '#1A3A2A',
            text: '#1a1a1a',
            textLight: '#FFFFFF'
        },
        typography: {
            headlineFont: 'Poppins',
            headlineWeight: 600,
            bodyFont: 'Inter',
            ctaFont: 'Poppins'
        },
        effects: ['nature_overlay', 'soft_shadow', 'leaf_accents'],
        preferredTemplates: ['feature_callout', 'comparison_split', 'lifestyle_context'],
        defaultStyle: 'light',
        keywords: ['eco', 'sustainable', 'green', 'organic', 'natural', 'recyclable', 'planet', 'earth', 'vegan']
    },

    fitness: {
        name: 'Fitness & Sports',
        colors: {
            primary: '#FF5722',
            secondary: '#E64A19',
            accent: '#FF9800',
            backgroundLight: '#FFF3E0',
            backgroundDark: '#1A1A2E',
            text: '#FFFFFF',
            textLight: '#1a1a1a'
        },
        typography: {
            headlineFont: 'Anton',
            headlineWeight: 400,
            bodyFont: 'Roboto',
            ctaFont: 'Roboto'
        },
        effects: ['dynamic_blur', 'energy_glow', 'sweat_overlay'],
        preferredTemplates: ['stats_grid', 'comparison_split', 'hero_product'],
        defaultStyle: 'dark',
        keywords: ['fitness', 'gym', 'workout', 'sport', 'muscle', 'protein', 'training', 'athlete', 'energy']
    },

    saas: {
        name: 'SaaS & Software',
        colors: {
            primary: '#6366F1',
            secondary: '#4F46E5',
            accent: '#818CF8',
            backgroundLight: '#F0F4FF',
            backgroundDark: '#0F172A',
            text: '#FFFFFF',
            textLight: '#1a1a1a'
        },
        typography: {
            headlineFont: 'Inter',
            headlineWeight: 700,
            bodyFont: 'Inter',
            ctaFont: 'Inter'
        },
        effects: ['glass_card', 'subtle_grid', 'code_accents'],
        preferredTemplates: ['feature_callout', 'stats_grid', 'hero_product'],
        defaultStyle: 'dark',
        keywords: ['saas', 'software', 'platform', 'dashboard', 'analytics', 'automation', 'tool', 'solution', 'business']
    },

    home: {
        name: 'Home & Living',
        colors: {
            primary: '#8B4513',
            secondary: '#A0522D',
            accent: '#D2691E',
            backgroundLight: '#FAF0E6',
            backgroundDark: '#2D2416',
            text: '#1a1a1a',
            textLight: '#FFFFFF'
        },
        typography: {
            headlineFont: 'Playfair Display',
            headlineWeight: 500,
            bodyFont: 'Inter',
            ctaFont: 'Inter'
        },
        effects: ['warm_ambient', 'soft_shadow', 'cozy_vignette'],
        preferredTemplates: ['lifestyle_context', 'hero_product', 'feature_callout'],
        defaultStyle: 'light',
        keywords: ['home', 'living', 'decor', 'furniture', 'interior', 'kitchen', 'bedroom', 'cozy', 'comfort']
    }
};

/**
 * Detect industry from prompt and product analysis
 */
export function detectIndustry(prompt, productDescription = '') {
    const combined = `${prompt} ${productDescription}`.toLowerCase();

    for (const [industryKey, industry] of Object.entries(INDUSTRIES)) {
        const matchCount = industry.keywords.filter(keyword =>
            combined.includes(keyword.toLowerCase())
        ).length;

        if (matchCount >= 2) {
            return industryKey;
        }
    }

    // Check for single strong keyword match
    for (const [industryKey, industry] of Object.entries(INDUSTRIES)) {
        if (industry.keywords.some(keyword => combined.includes(keyword.toLowerCase()))) {
            return industryKey;
        }
    }

    return 'tech'; // Default fallback
}

/**
 * Get industry configuration
 */
export function getIndustryConfig(industryKey) {
    return INDUSTRIES[industryKey] || INDUSTRIES.tech;
}

/**
 * Get industry color palette
 */
export function getIndustryColors(industryKey, style = 'light') {
    const industry = INDUSTRIES[industryKey] || INDUSTRIES.tech;
    const isDark = style === 'dark';

    return {
        primary: industry.colors.primary,
        accent: industry.colors.accent,
        background: isDark ? industry.colors.backgroundDark : industry.colors.backgroundLight,
        text: isDark ? industry.colors.text : industry.colors.textLight
    };
}

export default {
    INDUSTRIES,
    detectIndustry,
    getIndustryConfig,
    getIndustryColors
};
