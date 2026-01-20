/**
 * INDUSTRY BEST PRACTICES
 * 
 * Knowledge base with proven strategies for each industry.
 * Used by AI Creative Director to make better decisions.
 */

export const INDUSTRY_BEST_PRACTICES = {
    // Technology / SaaS
    saas: {
        name: 'SaaS / Tech',
        deviceMockup: 'macbook',
        style: 'dark_tech',
        colorPalettes: ['#0A0A0F', '#1a1a2e', '#16213e'],
        accentColors: ['#00D4FF', '#7C3AED', '#10B981'],
        typography: 'clean_modern',
        keywords: ['dashboard', 'app', 'software', 'platform', 'tool', 'analytics', 'saas'],
        headlineStyles: ['metrics_focused', 'benefit_driven', 'how_to'],
        effects: ['glow', 'reflection'],
        bestPractices: [
            'Show actual UI/dashboard in device mockup',
            'Highlight key metrics or features',
            'Dark backgrounds for tech premium feel',
            'Neon accent colors for modern look'
        ]
    },

    // E-Commerce / Retail
    ecommerce: {
        name: 'E-Commerce / Retail',
        deviceMockup: 'none',
        style: 'lifestyle',
        colorPalettes: ['#FFFFFF', '#F5F5F5', '#1A1A1A'],
        accentColors: ['#FF4444', '#FF6B35', '#F59E0B'],
        typography: 'bold_impact',
        keywords: ['shop', 'buy', 'sale', 'product', 'discount', 'offer', 'deal'],
        headlineStyles: ['urgency', 'discount', 'limited_time'],
        effects: ['sparkles', 'light_rays'],
        bestPractices: [
            'Product as hero - large and centered',
            'Clean white or lifestyle backgrounds',
            'Clear pricing or discount callout',
            'Strong CTA with urgency'
        ]
    },

    // Fashion / Apparel
    fashion: {
        name: 'Fashion / Apparel',
        deviceMockup: 'none',
        style: 'editorial',
        colorPalettes: ['#000000', '#FFFFFF', '#F5F0EB'],
        accentColors: ['#C9A87C', '#B8860B', '#8B4513'],
        typography: 'elegant_serif',
        keywords: ['fashion', 'style', 'wear', 'clothing', 'outfit', 'look', 'collection'],
        headlineStyles: ['aspirational', 'minimal', 'brand_focused'],
        effects: ['reflection', 'bokeh'],
        bestPractices: [
            'High-end editorial photography style',
            'Minimalist composition',
            'Neutral or earth-tone backgrounds',
            'Focus on texture and quality'
        ]
    },

    // Food & Beverage
    food: {
        name: 'Food & Beverage',
        deviceMockup: 'none',
        style: 'appetizing',
        colorPalettes: ['#2D1B0E', '#F5E6D3', '#FFF8DC'],
        accentColors: ['#FF6B35', '#E63946', '#2D6A4F'],
        typography: 'warm_friendly',
        keywords: ['food', 'drink', 'taste', 'delicious', 'fresh', 'recipe', 'meal'],
        headlineStyles: ['sensory', 'benefit', 'freshness'],
        effects: ['warm_glow', 'sparkles'],
        bestPractices: [
            'Warm, appetizing lighting',
            'Close-up hero shots',
            'Steam, freshness indicators',
            'Complementary props in scene'
        ]
    },

    // Beauty / Cosmetics
    beauty: {
        name: 'Beauty / Cosmetics',
        deviceMockup: 'none',
        style: 'glamour',
        colorPalettes: ['#FDF6F0', '#F8E8EE', '#2D2D2D'],
        accentColors: ['#E91E8C', '#FF69B4', '#C9A87C'],
        typography: 'elegant_modern',
        keywords: ['beauty', 'skin', 'makeup', 'glow', 'radiant', 'cosmetic', 'skincare'],
        headlineStyles: ['transformation', 'benefit', 'ingredient_focused'],
        effects: ['sparkles', 'glow', 'reflection'],
        bestPractices: [
            'Soft, flattering lighting',
            'Clean, minimal backgrounds',
            'Product texture closeups',
            'Aspirational lifestyle imagery'
        ]
    },

    // Home & Living
    home: {
        name: 'Home & Living',
        deviceMockup: 'none',
        style: 'cozy_lifestyle',
        colorPalettes: ['#F5F5DC', '#E8DCC4', '#2C3E50'],
        accentColors: ['#D4A574', '#8FBC8F', '#CD853F'],
        typography: 'warm_modern',
        keywords: ['home', 'living', 'decor', 'furniture', 'lamp', 'cozy', 'interior'],
        headlineStyles: ['emotional', 'transformation', 'comfort'],
        effects: ['glow', 'warm_lighting', 'bokeh'],
        bestPractices: [
            'Warm, inviting atmosphere',
            'Product in natural setting',
            'Lifestyle context (not just product)',
            'Cozy lighting effects'
        ]
    },

    // Christmas / Holiday
    christmas: {
        name: 'Christmas / Holiday',
        deviceMockup: 'none',
        style: 'festive',
        colorPalettes: ['#1A472A', '#8B0000', '#FFFAF0'],
        accentColors: ['#FF0000', '#FFD700', '#228B22'],
        typography: 'festive_elegant',
        keywords: ['christmas', 'weihnacht', 'gift', 'holiday', 'festive', 'santa', 'winter'],
        headlineStyles: ['gift_focused', 'emotional', 'limited_time'],
        effects: ['snow_particles', 'christmas_glow', 'sparkles'],
        bestPractices: [
            'Warm, festive color palette',
            'Snow and winter elements',
            'Gift/unwrapping context',
            'Cozy, emotional atmosphere'
        ]
    },

    // Health & Fitness
    fitness: {
        name: 'Health & Fitness',
        deviceMockup: 'none',
        style: 'energetic',
        colorPalettes: ['#1A1A1A', '#2D2D2D', '#FFFFFF'],
        accentColors: ['#00FF88', '#FF4444', '#00D4FF'],
        typography: 'bold_impact',
        keywords: ['fitness', 'health', 'workout', 'gym', 'sport', 'protein', 'supplement'],
        headlineStyles: ['transformation', 'action', 'results'],
        effects: ['light_rays', 'glow'],
        bestPractices: [
            'Dynamic, action-oriented imagery',
            'Bold, high-contrast colors',
            'Before/after or transformation focus',
            'Energetic, motivational feel'
        ]
    },

    // Kids & Toys
    kids: {
        name: 'Kids & Toys',
        deviceMockup: 'none',
        style: 'playful',
        colorPalettes: ['#FFE4E1', '#E6F3FF', '#FFFACD'],
        accentColors: ['#FF69B4', '#00CED1', '#FFD700'],
        typography: 'fun_friendly',
        keywords: ['kids', 'toy', 'child', 'play', 'fun', 'educational', 'game'],
        headlineStyles: ['fun', 'benefit_for_parents', 'educational'],
        effects: ['sparkles', 'light_rays'],
        bestPractices: [
            'Bright, cheerful colors',
            'Product in action/play context',
            'Safe and quality messaging',
            'Appeal to both kids and parents'
        ]
    },

    // Default / Generic
    default: {
        name: 'General',
        deviceMockup: 'none',
        style: 'premium',
        colorPalettes: ['#0A0A0A', '#FFFFFF', '#1A1A2E'],
        accentColors: ['#FF4444', '#7C3AED', '#00D4FF'],
        typography: 'clean_modern',
        keywords: [],
        headlineStyles: ['benefit', 'how_to', 'emotional'],
        effects: ['glow', 'reflection'],
        bestPractices: [
            'Premium, professional aesthetic',
            'Product as clear hero',
            'Clean composition',
            'Strong value proposition'
        ]
    }
};

/**
 * Detect industry from product analysis and user prompt
 */
export function detectIndustry(analysis, userPrompt) {
    const prompt = (userPrompt || '').toLowerCase();
    const productType = (analysis?.productType || '').toLowerCase();
    const productName = (analysis?.productName || '').toLowerCase();
    const combinedText = `${prompt} ${productType} ${productName}`;

    // Check for Christmas/Holiday first (seasonal override)
    if (/christmas|weihnacht|santa|holiday|festive|gift|geschenk/.test(combinedText)) {
        return 'christmas';
    }

    // Check each industry's keywords
    for (const [industry, config] of Object.entries(INDUSTRY_BEST_PRACTICES)) {
        if (industry === 'default') continue;

        for (const keyword of config.keywords) {
            if (combinedText.includes(keyword)) {
                return industry;
            }
        }
    }

    // Fallback based on product type
    if (/screenshot|app|dashboard|software/.test(combinedText)) return 'saas';
    if (/lamp|light|furniture|decor/.test(combinedText)) return 'home';
    if (/clothing|dress|shirt|shoe/.test(combinedText)) return 'fashion';
    if (/food|drink|coffee|tea/.test(combinedText)) return 'food';

    return 'default';
}

/**
 * Get best practices for an industry
 */
export function getBestPractices(industryKey) {
    return INDUSTRY_BEST_PRACTICES[industryKey] || INDUSTRY_BEST_PRACTICES.default;
}

export default {
    INDUSTRY_BEST_PRACTICES,
    detectIndustry,
    getBestPractices
};
