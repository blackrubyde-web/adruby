/**
 * Industry Intelligence Engine
 * Branchenspezifische Style Packs mit eigenen Algorithmen
 * Jede Branche hat: Farben, Layouts, Typography, Triggers, Visual Rules
 */

/**
 * Industry Style Packs - 15 Branchen mit tiefer Intelligenz
 */
export const INDUSTRY_PACKS = {
    // ========================================
    // BEAUTY & COSMETICS
    // ========================================
    beauty: {
        id: 'beauty',
        name: 'Beauty & Cosmetics',
        nameDE: 'Beauty & Kosmetik',

        // Color Psychology
        colorPalette: {
            primary: ['#F5B7B1', '#FADBD8', '#D7BDE2', '#F9E79F', '#FDEBD0'],
            accent: ['#C39BD3', '#F1948A', '#85C1E9', '#F7DC6F'],
            text: ['#2C3E50', '#5D6D7E', '#FFFFFF'],
            avoid: ['#000000', '#FF0000', '#00FF00'], // Harsh colors
        },

        // Recommended layouts for this industry
        preferredLayouts: [
            'checklist_benefits',
            'lifestyle_scene',
            'ingredient_showcase',
            'testimonial_quote',
            'minimal_icons_grid',
        ],

        // Typography style
        typography: {
            headline: 'elegant-serif or soft-sans',
            body: 'clean-sans light weight',
            style: 'feminine, soft, luxurious',
        },

        // Visual rules
        visualRules: {
            lightingStyle: 'soft, diffused, golden hour or studio beauty lighting',
            composition: 'clean negative space, product as hero with lifestyle context',
            models: 'diverse, aspirational, natural makeup or product result visible',
            texture: 'smooth gradients, soft shadows, premium feel',
        },

        // Psychological triggers
        triggers: ['Transformation', 'Self-care', 'Confidence', 'Natural beauty', 'Premium quality'],

        // Copy formulas
        copyPatterns: {
            headline: '{Result} in {Time} | The secret to {Desire}',
            cta: 'Discover your glow | Start your routine | Shop the look',
        },

        // Prompt enhancement
        promptEnhancement: `
Beauty/cosmetics advertising aesthetic:
- Soft, flattering lighting with subtle highlights
- Dewy, fresh, healthy skin appearance if showing people
- Product textures are luxurious and premium
- Color palette: soft pinks, golds, nudes, pastels
- Aspirational but approachable feel
- Clean, spa-like atmosphere`,
    },

    // ========================================
    // TECH & GADGETS
    // ========================================
    tech: {
        id: 'tech',
        name: 'Tech & Gadgets',
        nameDE: 'Tech & Gadgets',

        colorPalette: {
            primary: ['#1A1A2E', '#16213E', '#0F3460', '#2C3E50', '#34495E'],
            accent: ['#00D9FF', '#7B68EE', '#00FF88', '#FF6B6B', '#FFD93D'],
            text: ['#FFFFFF', '#E5E5E5', '#B8B8B8'],
            avoid: ['#FF69B4', '#FFB6C1'], // Too soft
        },

        preferredLayouts: [
            'feature_callout_dotted',
            'grid_features',
            'stats_infographic',
            'comparison_split',
            'hero_with_badge',
        ],

        typography: {
            headline: 'geometric-sans bold or tech-display',
            body: 'clean monospace or sans-serif',
            style: 'modern, precise, futuristic',
        },

        visualRules: {
            lightingStyle: 'dramatic rim lighting, dark environments, neon accents',
            composition: 'product floating, technical precision, clean lines',
            texture: 'metallic, glass, matte finishes',
            effects: 'subtle glow, reflection, motion blur for speed',
        },

        triggers: ['Innovation', 'Efficiency', 'Power', 'Future', 'Smart'],

        copyPatterns: {
            headline: '{X}x faster | The future of {Category} | Engineered for {Benefit}',
            cta: 'Get yours | Upgrade now | Experience innovation',
        },

        promptEnhancement: `
Tech/gadget advertising aesthetic:
- Dark, moody background with dramatic lighting
- Product with precise rim lighting and subtle glow
- Futuristic, premium feel - think Apple/Samsung level
- Neon accent colors (cyan, electric blue, purple)
- Clean reflective surfaces, precise shadows
- Technical precision, no organic/soft elements`,
    },

    // ========================================
    // FITNESS & SPORTS
    // ========================================
    fitness: {
        id: 'fitness',
        name: 'Fitness & Sports',
        nameDE: 'Fitness & Sport',

        colorPalette: {
            primary: ['#1A1A1A', '#2D2D2D', '#FF4757', '#00D26A', '#3742FA'],
            accent: ['#FFA502', '#FF6348', '#2ED573', '#1E90FF'],
            text: ['#FFFFFF', '#F1F2F6', '#000000'],
            avoid: ['#FFB6C1', '#E6E6FA'], // Too soft/passive
        },

        preferredLayouts: [
            'comparison_split',
            'lifestyle_scene',
            'stats_infographic',
            'process_steps',
            'testimonial_quote',
        ],

        typography: {
            headline: 'bold-condensed impact or athletic display',
            body: 'strong sans-serif',
            style: 'powerful, dynamic, motivational',
        },

        visualRules: {
            lightingStyle: 'high contrast, dramatic shadows, action lighting',
            composition: 'dynamic angles, motion implied, energy',
            models: 'athletic, diverse, mid-action or powerful poses',
            texture: 'sweat, texture, raw energy',
        },

        triggers: ['Transformation', 'Power', 'Discipline', 'Results', 'Challenge'],

        copyPatterns: {
            headline: 'No excuses | {X}% stronger | Your {Goal} starts now',
            cta: 'Start training | Join the challenge | Transform today',
        },

        promptEnhancement: `
Fitness/sports advertising aesthetic:
- High energy, dynamic composition
- Action shots or powerful static poses
- Dramatic lighting with high contrast
- Bold, aggressive colors (red, black, neon)
- Sweat, intensity, determination visible
- Motivational, challenging atmosphere`,
    },

    // ========================================
    // FOOD & BEVERAGE
    // ========================================
    food: {
        id: 'food',
        name: 'Food & Beverage',
        nameDE: 'Food & Getränke',

        colorPalette: {
            primary: ['#FF6B35', '#F7931E', '#8B4513', '#228B22', '#FFD700'],
            accent: ['#FF4500', '#32CD32', '#DC143C', '#FF8C00'],
            text: ['#2C1810', '#FFFFFF', '#4A4A4A'],
            avoid: ['#0000FF', '#FF00FF'], // Unappetizing
        },

        preferredLayouts: [
            'ingredient_showcase',
            'lifestyle_scene',
            'feature_callout_arrows',
            'hero_with_badge',
            'minimal_icons_grid',
        ],

        typography: {
            headline: 'friendly-rounded or artisanal serif',
            body: 'warm readable sans-serif',
            style: 'appetizing, warm, inviting',
        },

        visualRules: {
            lightingStyle: 'warm, appetizing lighting, steam/freshness cues',
            composition: 'hero shot, ingredients surrounding, abundance',
            texture: 'food textures visible, moisture, freshness',
            effects: 'steam, drips, crumbs for authenticity',
        },

        triggers: ['Taste', 'Freshness', 'Indulgence', 'Health', 'Convenience'],

        copyPatterns: {
            headline: 'Taste the difference | Made with {Ingredient} | {X}% less {Negative}',
            cta: 'Order now | Try it today | Find near you',
        },

        promptEnhancement: `
Food/beverage advertising aesthetic:
- Warm, appetizing lighting (golden hour feel)
- Food hero shot with visible textures
- Fresh ingredients surrounding or integrated
- Steam, moisture, freshness cues
- Rich, warm color palette (oranges, reds, greens)
- Makes viewer HUNGRY`,
    },

    // ========================================
    // FASHION & APPAREL
    // ========================================
    fashion: {
        id: 'fashion',
        name: 'Fashion & Apparel',
        nameDE: 'Fashion & Kleidung',

        colorPalette: {
            primary: ['#000000', '#FFFFFF', '#1A1A1A', '#F5F5F5', '#2C2C2C'],
            accent: ['#FFD700', '#FF4500', '#00CED1', '#FF1493'],
            text: ['#000000', '#FFFFFF', '#666666'],
            avoid: [], // Fashion can use any color
        },

        preferredLayouts: [
            'lifestyle_scene',
            'minimal_icons_grid',
            'checklist_benefits',
            'hero_with_badge',
            'comparison_split',
        ],

        typography: {
            headline: 'editorial-serif or high-fashion sans',
            body: 'elegant thin sans-serif',
            style: 'editorial, high-end, confident',
        },

        visualRules: {
            lightingStyle: 'editorial studio or natural high-fashion',
            composition: 'model-centric or flat-lay, editorial angles',
            models: 'diverse, confident, editorial poses',
            texture: 'fabric textures visible, quality details',
        },

        triggers: ['Style', 'Identity', 'Confidence', 'Trend', 'Quality'],

        copyPatterns: {
            headline: 'Your style, elevated | The new {Season} | Limited drop',
            cta: 'Shop now | Get the look | Discover collection',
        },

        promptEnhancement: `
Fashion advertising aesthetic:
- Editorial, high-fashion photography style
- Strong composition with confident model poses
- Fabric textures and quality details visible
- High contrast, dramatic or clean minimal lighting
- Magazine-quality, runway-inspired`,
    },

    // ========================================
    // HOME & LIVING
    // ========================================
    home: {
        id: 'home',
        name: 'Home & Living',
        nameDE: 'Home & Living',

        colorPalette: {
            primary: ['#F5F5DC', '#D2B48C', '#8B7355', '#DCDCDC', '#696969'],
            accent: ['#228B22', '#4169E1', '#DAA520', '#CD853F'],
            text: ['#2C2C2C', '#5C5C5C', '#FFFFFF'],
            avoid: ['#FF0000', '#00FF00'], // Too aggressive
        },

        preferredLayouts: [
            'lifestyle_scene',
            'feature_callout_dotted',
            'minimal_icons_grid',
            'comparison_split',
            'hero_with_badge',
        ],

        typography: {
            headline: 'warm-serif or scandinavian-sans',
            body: 'readable warm sans-serif',
            style: 'cozy, sophisticated, welcoming',
        },

        visualRules: {
            lightingStyle: 'warm natural light, cozy atmosphere',
            composition: 'product in context, styled room settings',
            texture: 'natural materials, fabric, wood, plants',
            atmosphere: 'lived-in but curated, aspirational home',
        },

        triggers: ['Comfort', 'Style', 'Quality', 'Cozy', 'Upgrade'],

        promptEnhancement: `
Home/living advertising aesthetic:
- Warm, natural lighting (window light feel)
- Product styled in beautiful room context
- Natural materials visible (wood, fabric, plants)
- Cozy but curated, Scandinavian-inspired
- Aspirational home environment`,
    },

    // ========================================
    // HEALTH & WELLNESS
    // ========================================
    health: {
        id: 'health',
        name: 'Health & Wellness',
        nameDE: 'Gesundheit & Wellness',

        colorPalette: {
            primary: ['#98D8C8', '#7FDBFF', '#B8E994', '#DCEDC1', '#A8E6CF'],
            accent: ['#3498DB', '#2ECC71', '#9B59B6', '#E74C3C'],
            text: ['#2C3E50', '#FFFFFF', '#34495E'],
            avoid: ['#000000', '#8B0000'], // Too dark/aggressive
        },

        preferredLayouts: [
            'ingredient_showcase',
            'checklist_benefits',
            'stats_infographic',
            'process_steps',
            'testimonial_quote',
        ],

        typography: {
            headline: 'clean-modern-sans or friendly-rounded',
            body: 'highly readable sans-serif',
            style: 'trustworthy, clean, scientific yet approachable',
        },

        visualRules: {
            lightingStyle: 'bright, clean, clinical but warm',
            composition: 'clean layouts, trust signals prominent',
            texture: 'clean, pure, natural elements',
            imagery: 'happy healthy people, nature, purity',
        },

        triggers: ['Trust', 'Science', 'Natural', 'Results', 'Wellness'],

        promptEnhancement: `
Health/wellness advertising aesthetic:
- Clean, bright, pure lighting
- Natural elements (plants, water, sunlight)
- Trust signals and scientific credibility
- Happy, healthy, vibrant people
- Fresh, clean, calming atmosphere`,
    },

    // ========================================
    // PET PRODUCTS
    // ========================================
    pets: {
        id: 'pets',
        name: 'Pet Products',
        nameDE: 'Haustier-Produkte',

        colorPalette: {
            primary: ['#F39C12', '#27AE60', '#3498DB', '#E74C3C', '#9B59B6'],
            accent: ['#F1C40F', '#1ABC9C', '#E67E22', '#2980B9'],
            text: ['#2C3E50', '#FFFFFF', '#34495E'],
            avoid: [],
        },

        preferredLayouts: [
            'feature_callout_arrows',
            'checklist_benefits',
            'testimonial_quote',
            'lifestyle_scene',
            'hero_with_badge',
        ],

        typography: {
            headline: 'playful-bold or friendly-rounded',
            body: 'warm readable sans-serif',
            style: 'playful, loving, trustworthy',
        },

        visualRules: {
            lightingStyle: 'warm, natural, happy',
            composition: 'pet as hero or with loving owner',
            mood: 'joyful, playful, loving bond',
            texture: 'soft, cuddly, natural',
        },

        triggers: ['Love', 'Health', 'Happiness', 'Quality', 'Care'],

        promptEnhancement: `
Pet product advertising aesthetic:
- Happy, healthy, adorable pets
- Warm, loving, joyful atmosphere
- Pet-owner bond visible if people included
- Playful, energetic compositions
- Trust and care messaging`,
    },

    // ========================================
    // BABY & KIDS
    // ========================================
    baby: {
        id: 'baby',
        name: 'Baby & Kids',
        nameDE: 'Baby & Kinder',

        colorPalette: {
            primary: ['#FFE4E1', '#E0FFFF', '#F0FFF0', '#FFF8DC', '#FFFAF0'],
            accent: ['#FFB6C1', '#87CEEB', '#98FB98', '#FFDAB9'],
            text: ['#696969', '#2F4F4F', '#FFFFFF'],
            avoid: ['#000000', '#8B0000', '#2F4F4F'],
        },

        preferredLayouts: [
            'checklist_benefits',
            'lifestyle_scene',
            'feature_callout_arrows',
            'hero_with_badge',
            'testimonial_quote',
        ],

        typography: {
            headline: 'soft-rounded-sans or playful-display',
            body: 'highly readable soft sans-serif',
            style: 'gentle, safe, trustworthy',
        },

        visualRules: {
            lightingStyle: 'soft, diffused, gentle',
            composition: 'safe, clean, nurturing environment',
            mood: 'gentle, protective, loving',
            safety: 'always convey safety and quality',
        },

        triggers: ['Safety', 'Trust', 'Quality', 'Love', 'Development'],

        promptEnhancement: `
Baby/kids advertising aesthetic:
- Soft, gentle, diffused lighting
- Clean, safe, nurturing environment
- Pastel color palette
- Trust and safety always communicated
- Gentle, loving atmosphere`,
    },

    // ========================================
    // AUTOMOTIVE
    // ========================================
    automotive: {
        id: 'automotive',
        name: 'Automotive',
        nameDE: 'Automotive',

        colorPalette: {
            primary: ['#1A1A1A', '#2C3E50', '#34495E', '#C0C0C0', '#2F4F4F'],
            accent: ['#E74C3C', '#F39C12', '#3498DB', '#1ABC9C'],
            text: ['#FFFFFF', '#ECF0F1', '#000000'],
            avoid: ['#FF69B4', '#FFB6C1'],
        },

        preferredLayouts: [
            'hero_with_badge',
            'feature_callout_dotted',
            'comparison_split',
            'stats_infographic',
            'lifestyle_scene',
        ],

        typography: {
            headline: 'bold-industrial-sans or performance-display',
            body: 'clean technical sans-serif',
            style: 'powerful, precise, premium',
        },

        visualRules: {
            lightingStyle: 'dramatic studio or epic outdoor',
            composition: 'hero angles, dynamic perspectives',
            texture: 'metal, carbon, premium materials',
            effects: 'motion blur, reflections, drama',
        },

        triggers: ['Power', 'Freedom', 'Status', 'Performance', 'Innovation'],

        promptEnhancement: `
Automotive advertising aesthetic:
- Dramatic, cinematic lighting
- Hero angles showcasing design
- Premium materials visible (metal, leather)
- Sense of power and performance
- Epic, aspirational environments`,
    },

    // ========================================
    // SAAS & B2B
    // ========================================
    saas: {
        id: 'saas',
        name: 'SaaS & B2B',
        nameDE: 'SaaS & B2B',

        colorPalette: {
            primary: ['#4A90D9', '#5B8DEF', '#6C5CE7', '#00B894', '#0984E3'],
            accent: ['#00CEC9', '#FDCB6E', '#E17055', '#74B9FF'],
            text: ['#2D3436', '#FFFFFF', '#636E72'],
            avoid: ['#FF69B4', '#FFD700'],
        },

        preferredLayouts: [
            'stats_infographic',
            'process_steps',
            'grid_features',
            'testimonial_quote',
            'checklist_benefits',
        ],

        typography: {
            headline: 'modern-tech-sans medium weight',
            body: 'highly readable interface-style',
            style: 'professional, trustworthy, modern',
        },

        visualRules: {
            lightingStyle: 'clean, bright, professional',
            composition: 'organized, grid-based, clear hierarchy',
            imagery: 'abstract data viz, happy professionals, clean UI',
            trust: 'logos, numbers, charts prominent',
        },

        triggers: ['Efficiency', 'ROI', 'Trust', 'Scale', 'Integration'],

        promptEnhancement: `
SaaS/B2B advertising aesthetic:
- Clean, professional, trustworthy
- Data visualization elements
- Happy productive professionals
- Clean UI/dashboard hints
- Trust signals (logos, numbers)`,
    },

    // ========================================
    // TRAVEL & HOSPITALITY
    // ========================================
    travel: {
        id: 'travel',
        name: 'Travel & Hospitality',
        nameDE: 'Reise & Hospitality',

        colorPalette: {
            primary: ['#1E90FF', '#00CED1', '#FFD700', '#32CD32', '#FF6347'],
            accent: ['#FF4500', '#00BFFF', '#FF69B4', '#ADFF2F'],
            text: ['#FFFFFF', '#2C3E50', '#000000'],
            avoid: ['#808080', '#696969'],
        },

        preferredLayouts: [
            'lifestyle_scene',
            'hero_with_badge',
            'urgency_sale_bold',
            'testimonial_quote',
            'comparison_split',
        ],

        typography: {
            headline: 'adventurous-display or elegant-serif',
            body: 'clean readable sans-serif',
            style: 'adventurous, exciting, luxurious',
        },

        visualRules: {
            lightingStyle: 'golden hour, epic natural light',
            composition: 'epic vistas, aspirational destinations',
            mood: 'wanderlust, adventure, relaxation',
            people: 'joyful travelers, authentic moments',
        },

        triggers: ['Adventure', 'Escape', 'Experience', 'Luxury', 'Discovery'],

        promptEnhancement: `
Travel advertising aesthetic:
- Epic, breathtaking destinations
- Golden hour natural lighting
- Wanderlust-inducing compositions
- Happy travelers in genuine moments
- Aspirational, dream-worthy`,
    },

    // ========================================
    // EDUCATION & LEARNING
    // ========================================
    education: {
        id: 'education',
        name: 'Education & Learning',
        nameDE: 'Bildung & Lernen',

        colorPalette: {
            primary: ['#3498DB', '#2ECC71', '#9B59B6', '#F39C12', '#1ABC9C'],
            accent: ['#E74C3C', '#F1C40F', '#00CED1', '#FF6B6B'],
            text: ['#2C3E50', '#FFFFFF', '#34495E'],
            avoid: ['#8B0000'],
        },

        preferredLayouts: [
            'stats_infographic',
            'process_steps',
            'checklist_benefits',
            'testimonial_quote',
            'grid_features',
        ],

        typography: {
            headline: 'friendly-bold-sans or academic-serif',
            body: 'highly readable educational',
            style: 'approachable, inspiring, credible',
        },

        visualRules: {
            lightingStyle: 'bright, clear, optimistic',
            composition: 'clean, organized, progressive',
            imagery: 'success, growth, achievement',
            people: 'diverse learners, confident professionals',
        },

        triggers: ['Growth', 'Success', 'Knowledge', 'Career', 'transformation'],

        promptEnhancement: `
Education advertising aesthetic:
- Bright, optimistic, aspirational
- Success and achievement imagery
- Diverse, happy learners
- Clean, organized compositions
- Trust and credibility signals`,
    },

    // ========================================
    // LUXURY & PREMIUM
    // ========================================
    luxury: {
        id: 'luxury',
        name: 'Luxury & Premium',
        nameDE: 'Luxus & Premium',

        colorPalette: {
            primary: ['#1A1A1A', '#000000', '#2C3E50', '#FFFFFF', '#D4AF37'],
            accent: ['#C0C0C0', '#B8860B', '#4A0E4E', '#1E3A5F'],
            text: ['#FFFFFF', '#D4AF37', '#000000'],
            avoid: ['#FF69B4', '#00FF00', '#FF0000'],
        },

        preferredLayouts: [
            'minimal_icons_grid',
            'hero_with_badge',
            'lifestyle_scene',
            'testimonial_quote',
            'announcement_banner',
        ],

        typography: {
            headline: 'elegant-thin-serif or luxury-display',
            body: 'refined thin sans-serif',
            style: 'exclusive, refined, understated',
        },

        visualRules: {
            lightingStyle: 'dramatic, precise, gallery-worthy',
            composition: 'maximum negative space, restrained',
            texture: 'premium materials, craftsmanship visible',
            atmosphere: 'exclusive, museum-quality, timeless',
        },

        triggers: ['Exclusivity', 'Craftsmanship', 'Heritage', 'Status', 'Timeless'],

        promptEnhancement: `
Luxury advertising aesthetic:
- Maximum negative space, restrained design
- Premium materials and craftsmanship visible
- Dramatic, precise lighting
- Understated elegance, not flashy
- Museum-quality, timeless feel`,
    },

    // ========================================
    // ECO & SUSTAINABLE
    // ========================================
    eco: {
        id: 'eco',
        name: 'Eco & Sustainable',
        nameDE: 'Öko & Nachhaltig',

        colorPalette: {
            primary: ['#228B22', '#8FBC8F', '#3CB371', '#F4A460', '#DEB887'],
            accent: ['#20B2AA', '#6B8E23', '#DAA520', '#CD853F'],
            text: ['#2C3E50', '#FFFFFF', '#556B2F'],
            avoid: ['#FF0000', '#FF69B4'],
        },

        preferredLayouts: [
            'feature_callout_arrows',
            'ingredient_showcase',
            'checklist_benefits',
            'stats_infographic',
            'hero_with_badge',
        ],

        typography: {
            headline: 'organic-sans or earthy-display',
            body: 'natural readable sans-serif',
            style: 'honest, natural, responsible',
        },

        visualRules: {
            lightingStyle: 'natural daylight, outdoor fresh',
            composition: 'natural elements integrated',
            texture: 'raw, unprocessed, organic materials',
            atmosphere: 'fresh, pure, responsible',
        },

        triggers: ['Sustainability', 'Natural', 'Responsibility', 'Planet', 'Future'],

        promptEnhancement: `
Eco/sustainable advertising aesthetic:
- Natural daylight and outdoor settings
- Raw, organic, unprocessed textures
- Earth tones and natural greens
- Honest, transparent, responsible feel
- Nature integration (plants, wood, earth)`,
    },
};

/**
 * Get industry pack by ID
 */
export function getIndustryPack(industryId) {
    return INDUSTRY_PACKS[industryId] || INDUSTRY_PACKS.beauty;
}

/**
 * Get all industry packs
 */
export function getAllIndustryPacks() {
    return Object.values(INDUSTRY_PACKS);
}

/**
 * Detect industry from product/text analysis
 */
export function detectIndustry(text) {
    const textLower = (text || '').toLowerCase();

    const industryKeywords = {
        beauty: ['makeup', 'skincare', 'cosmetic', 'beauty', 'serum', 'cream', 'lipstick', 'foundation', 'mascara', 'hautpflege', 'kosmetik'],
        tech: ['app', 'software', 'gadget', 'device', 'smart', 'phone', 'laptop', 'tech', 'digital', 'elektronik'],
        fitness: ['fitness', 'gym', 'workout', 'protein', 'training', 'sport', 'muscle', 'exercise', 'krafttraining'],
        food: ['food', 'snack', 'drink', 'organic', 'vegan', 'taste', 'delicious', 'recipe', 'essen', 'trinken', 'lecker'],
        fashion: ['fashion', 'clothing', 'wear', 'style', 'outfit', 'dress', 'shirt', 'mode', 'kleidung'],
        home: ['home', 'furniture', 'decor', 'kitchen', 'living', 'interior', 'möbel', 'wohnen'],
        health: ['health', 'vitamin', 'supplement', 'wellness', 'natural', 'organic', 'gesundheit', 'vitamine'],
        pets: ['pet', 'dog', 'cat', 'animal', 'puppy', 'kitten', 'hund', 'katze', 'haustier'],
        baby: ['baby', 'kid', 'child', 'toddler', 'parent', 'mom', 'dad', 'kind', 'eltern'],
        automotive: ['car', 'vehicle', 'auto', 'drive', 'motor', 'engine', 'fahrzeug'],
        saas: ['saas', 'platform', 'software', 'business', 'enterprise', 'b2b', 'roi', 'productivity'],
        travel: ['travel', 'hotel', 'flight', 'vacation', 'trip', 'destination', 'reise', 'urlaub'],
        education: ['learn', 'course', 'education', 'skill', 'training', 'certificate', 'lernen', 'kurs'],
        luxury: ['luxury', 'premium', 'exclusive', 'designer', 'limited edition', 'luxus', 'exklusiv'],
        eco: ['eco', 'sustainable', 'green', 'organic', 'biodegradable', 'recycled', 'nachhaltig', 'bio'],
    };

    let bestMatch = null;
    let highestScore = 0;

    for (const [industry, keywords] of Object.entries(industryKeywords)) {
        let score = 0;
        for (const keyword of keywords) {
            if (textLower.includes(keyword)) {
                score += 1;
            }
        }
        if (score > highestScore) {
            highestScore = score;
            bestMatch = industry;
        }
    }

    return bestMatch || 'beauty'; // Default fallback
}

/**
 * Apply industry pack to prompt
 */
export function applyIndustryToPrompt(prompt, industryId) {
    const pack = getIndustryPack(industryId);

    // Add industry-specific enhancement
    return prompt + '\n\n' + pack.promptEnhancement;
}

/**
 * Get recommended color from industry
 */
export function getIndustryColor(industryId, type = 'primary') {
    const pack = getIndustryPack(industryId);
    const colors = pack.colorPalette[type] || pack.colorPalette.primary;
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Get recommended layouts for industry
 */
export function getIndustryLayouts(industryId) {
    const pack = getIndustryPack(industryId);
    return pack.preferredLayouts || [];
}
