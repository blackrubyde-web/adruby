/**
 * E-Commerce Deep Intelligence Module
 * Complete e-commerce ad strategies, product types, AOV optimization
 * The most comprehensive e-commerce advertising system
 */

/**
 * E-Commerce Product Categories with specific strategies
 */
export const ECOMMERCE_CATEGORIES = {
    // ========================================
    // FASHION & APPAREL
    // ========================================
    fashion: {
        id: 'fashion',
        name: 'Fashion & Apparel',

        adStrategies: {
            primary: ['lifestyle', 'social-proof', 'new-arrival'],
            secondary: ['sale', 'collection', 'influencer'],
        },

        visualRules: {
            showProduct: 'on model preferred, flat-lay secondary',
            background: 'lifestyle context or clean studio',
            mood: 'aspirational, confident, stylish',
        },

        copyAngles: [
            'Make a statement',
            'Wear your confidence',
            'The [item] everyone\'s talking about',
            'Dress for the life you want',
        ],

        urgencyTactics: ['Limited sizes', 'Selling fast', 'New drop'],
        trustSignals: ['Free returns', 'Size guarantee', 'Real customer photos'],

        aovOptimization: {
            bundling: 'Complete the look suggestions',
            upsell: 'Premium fabric upgrade',
            crossSell: 'Accessories that match',
        },
    },

    // ========================================
    // BEAUTY & SKINCARE
    // ========================================
    beauty: {
        id: 'beauty',
        name: 'Beauty & Skincare',

        adStrategies: {
            primary: ['before-after', 'ingredient-focus', 'routine'],
            secondary: ['testimonial', 'dermatologist', 'clean-beauty'],
        },

        visualRules: {
            showProduct: 'texture shots, swatches, application',
            background: 'clean, soft lighting, spa-like',
            mood: 'fresh, dewy, aspirational skin/look',
        },

        copyAngles: [
            'Your skin deserves this',
            'The science of beautiful skin',
            'Results you can see',
            'Clean beauty that works',
        ],

        urgencyTactics: ['Bestseller - often sold out', 'Limited batch', 'Exclusive formula'],
        trustSignals: ['Dermatologist tested', 'Cruelty-free', 'Real results'],

        aovOptimization: {
            bundling: 'Complete routine sets',
            upsell: 'Full-size from trial',
            subscription: 'Subscribe & save 20%',
        },
    },

    // ========================================
    // ELECTRONICS & TECH
    // ========================================
    electronics: {
        id: 'electronics',
        name: 'Electronics & Tech',

        adStrategies: {
            primary: ['specs-benefit', 'comparison', 'lifestyle-use'],
            secondary: ['unboxing', 'review', 'tech-demo'],
        },

        visualRules: {
            showProduct: 'hero shot, dramatic lighting, detail close-ups',
            background: 'dark/minimal or lifestyle context',
            mood: 'premium, innovative, sleek',
        },

        copyAngles: [
            'The future of [category]',
            '[X]x faster than [competitor/old]',
            'Engineered for [outcome]',
            'Finally, tech that just works',
        ],

        urgencyTactics: ['Launch price', 'Pre-order now', 'Limited stock'],
        trustSignals: ['Warranty included', 'Free tech support', '30-day trial'],

        aovOptimization: {
            bundling: 'Essential accessories bundle',
            upsell: 'Pro version upgrade',
            protection: 'Extended warranty',
        },
    },

    // ========================================
    // HOME & FURNITURE
    // ========================================
    home: {
        id: 'home',
        name: 'Home & Furniture',

        adStrategies: {
            primary: ['room-context', 'transformation', 'lifestyle'],
            secondary: ['before-after', 'quality-focus', 'designer'],
        },

        visualRules: {
            showProduct: 'in styled room context',
            background: 'aspirational home setting',
            mood: 'cozy, elevated, magazine-worthy',
        },

        copyAngles: [
            'Transform your space',
            'Home should feel like [emotion]',
            'Design that fits your life',
            'Upgrade your everyday',
        ],

        urgencyTactics: ['White glove delivery', 'Limited collection', 'Warehouse sale'],
        trustSignals: ['Easy assembly', 'Free shipping', 'Quality guarantee'],

        aovOptimization: {
            bundling: 'Room packages',
            upsell: 'Premium materials',
            crossSell: 'Matching pieces',
        },
    },

    // ========================================
    // FOOD & BEVERAGE (DTC)
    // ========================================
    food_dtc: {
        id: 'food_dtc',
        name: 'Food & Beverage DTC',

        adStrategies: {
            primary: ['taste-appeal', 'health-benefit', 'convenience'],
            secondary: ['subscription', 'variety', 'founder-story'],
        },

        visualRules: {
            showProduct: 'appetite appeal, fresh ingredients',
            background: 'kitchen context or clean studio',
            mood: 'fresh, delicious, healthy, convenient',
        },

        copyAngles: [
            'Taste the difference',
            'Finally, [food] that\'s actually good for you',
            'Skip the store, not the quality',
            'Made with ingredients you recognize',
        ],

        urgencyTactics: ['Fresh batch', 'Seasonal flavors', 'Subscribe first'],
        trustSignals: ['Real ingredients', 'No preservatives', 'Chef-crafted'],

        aovOptimization: {
            bundling: 'Variety packs',
            subscription: 'Weekly/monthly delivery',
            crossSell: 'Complementary items',
        },
    },

    // ========================================
    // SUPPLEMENTS & WELLNESS
    // ========================================
    supplements: {
        id: 'supplements',
        name: 'Supplements & Wellness',

        adStrategies: {
            primary: ['benefit-driven', 'science-backed', 'testimonial'],
            secondary: ['ingredient-focus', 'routine', 'comparison'],
        },

        visualRules: {
            showProduct: 'clean bottle/packaging, ingredient visuals',
            background: 'clean, trustworthy, scientific feel',
            mood: 'healthy, energetic, trustworthy',
        },

        copyAngles: [
            'Feel the difference in [timeframe]',
            'Science-backed [benefit]',
            'What your body\'s been missing',
            'Join [X] people who [benefit]',
        ],

        urgencyTactics: ['Limited batch', 'Subscribe & never run out'],
        trustSignals: ['Third-party tested', 'No fillers', 'Doctor-formulated'],

        aovOptimization: {
            bundling: 'Stack for results',
            subscription: '25% off subscription',
            upsell: '3-month supply discount',
        },
    },
};

/**
 * AOV (Average Order Value) Optimization Strategies
 */
export const AOV_STRATEGIES = {
    bundling: {
        name: 'Product Bundling',
        description: 'Group related products for higher basket',
        headlines: [
            'Complete the set',
            'Better together',
            'The ultimate [X] kit',
            'Everything you need, one click',
        ],
        visualStyle: 'Show all products together, value emphasized',
    },

    threshold_shipping: {
        name: 'Free Shipping Threshold',
        description: 'Free shipping above certain amount',
        headlines: [
            'Free shipping over €[X]',
            'You\'re €[X] away from free shipping',
            'Add €[X] more for free delivery',
        ],
        visualStyle: 'Progress bar to free shipping',
    },

    tiered_discount: {
        name: 'Tiered Discounts',
        description: 'Bigger discount for larger orders',
        headlines: [
            'Buy 2, get 15% off | Buy 3, get 25% off',
            'The more you buy, the more you save',
            'Stack your savings',
        ],
        visualStyle: 'Tier visualization, value stacking',
    },

    limited_upsell: {
        name: 'Post-Purchase Upsell',
        description: 'One-click add after initial purchase decision',
        headlines: [
            'Add this for just €[X] more',
            'Customers also bought',
            'Complete your order',
        ],
    },

    subscription_save: {
        name: 'Subscribe & Save',
        description: 'Recurring order with discount',
        headlines: [
            'Subscribe & save [X]%',
            'Never run out again',
            'Set it and forget it',
        ],
        visualStyle: 'Convenience + savings emphasized',
    },
};

/**
 * Urgency & Scarcity Tactics for E-Commerce
 */
export const URGENCY_TACTICS = {
    stock_scarcity: {
        name: 'Stock Scarcity',
        examples: ['Only 3 left in stock', 'Low stock - order soon', '85% claimed'],
        visualElement: 'Low stock indicator, progress bar',
        authenticity: 'Only use if genuinely limited',
    },

    time_limited: {
        name: 'Time-Limited Offer',
        examples: ['Sale ends in 2:34:56', '24-hour flash sale', 'Today only'],
        visualElement: 'Countdown timer',
        authenticity: 'Must have real deadline',
    },

    social_proof_live: {
        name: 'Live Social Proof',
        examples: ['47 people viewing now', '12 sold in last hour', 'Trending today'],
        visualElement: 'Real-time indicator',
    },

    exclusive_access: {
        name: 'Exclusive Access',
        examples: ['VIP early access', 'Members-only pricing', 'Exclusive drop'],
        visualElement: 'Lock/unlock visual, exclusive badge',
    },

    seasonal: {
        name: 'Seasonal Urgency',
        examples: ['Last chance for holiday delivery', 'Summer collection ending', 'Back to school deadline'],
        visualElement: 'Seasonal theming',
    },
};

/**
 * Cart Abandonment Ad Strategies
 */
export const CART_ABANDONMENT = {
    reminder: {
        headline: 'You left something behind',
        subheadline: 'Your cart is waiting for you',
        cta: 'Complete your order',
        incentive: null,
    },

    incentive_discount: {
        headline: 'Complete your order for [X]% off',
        subheadline: 'Use code COMEBACK at checkout',
        cta: 'Get my discount',
        incentive: 'percentage_off',
    },

    incentive_shipping: {
        headline: 'Free shipping on your order',
        subheadline: 'We\'ll cover the shipping if you complete today',
        cta: 'Get free shipping',
        incentive: 'free_shipping',
    },

    urgency: {
        headline: 'Your cart expires soon',
        subheadline: 'Items aren\'t reserved forever',
        cta: 'Secure my items',
        incentive: 'scarcity',
    },

    social_proof: {
        headline: '[X] people bought this today',
        subheadline: 'See why it\'s a bestseller',
        cta: 'Join them',
        incentive: 'validation',
    },
};

/**
 * Get e-commerce category intelligence
 */
export function getEcommerceCategory(categoryId) {
    return ECOMMERCE_CATEGORIES[categoryId] || ECOMMERCE_CATEGORIES.fashion;
}

/**
 * Get all e-commerce categories
 */
export function getAllEcommerceCategories() {
    return Object.values(ECOMMERCE_CATEGORIES);
}

/**
 * Build e-commerce specific prompt
 */
export function buildEcommercePrompt(category, options = {}) {
    const cat = getEcommerceCategory(category);
    const { isRetargeting, hasSale, showUrgency } = options;

    let prompt = `
E-COMMERCE AD SPECIFICATIONS (${cat.name}):

VISUAL APPROACH:
- Product display: ${cat.visualRules.showProduct}
- Background: ${cat.visualRules.background}
- Mood: ${cat.visualRules.mood}

COPY ANGLES TO USE:
${cat.copyAngles.map(a => `- ${a}`).join('\n')}

TRUST SIGNALS:
${cat.trustSignals.map(t => `✓ ${t}`).join('\n')}
`;

    if (showUrgency) {
        prompt += `
URGENCY ELEMENTS:
${cat.urgencyTactics.map(u => `⚡ ${u}`).join('\n')}
`;
    }

    if (isRetargeting) {
        prompt += `
RETARGETING MESSAGE:
- Remind of product benefits
- Show what they're missing
- Add incentive if available
`;
    }

    return prompt;
}
