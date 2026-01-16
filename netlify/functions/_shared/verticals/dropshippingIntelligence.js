/**
 * Dropshipping Intelligence Module
 * Trust-building for unknown brands, shipping messaging, scarcity tactics
 */

/**
 * Dropshipping Trust Challenges & Solutions
 */
export const DROPSHIPPING_TRUST = {
    challenges: [
        'Unknown brand/no recognition',
        'No physical store to visit',
        'Skepticism about product quality',
        'Concerns about shipping time',
        'Fear of scam or not receiving order',
    ],

    solutions: {
        social_proof: {
            elements: ['Customer reviews', 'User-generated content', 'Photo reviews', 'Video testimonials'],
            implementation: 'UGC-style ads perform 4x better for unknown brands',
        },

        guarantee: {
            elements: ['Money-back guarantee', 'Easy returns', 'Buyer protection', 'Quality promise'],
            implementation: 'Prominently display guarantee to reduce risk',
        },

        authority: {
            elements: ['Press mentions', 'Influencer endorsements', 'Award badges', 'Certification'],
            implementation: 'Borrow credibility from known sources',
        },

        transparency: {
            elements: ['Clear shipping times', 'Tracking info', 'Customer service contact', 'FAQ'],
            implementation: 'Address concerns before they become objections',
        },
    },
};

/**
 * Dropshipping Product Categories
 */
export const DROPSHIP_CATEGORIES = {
    gadgets: {
        name: 'Gadgets & Electronics',
        headlines: [
            'The viral gadget everyone\'s talking about',
            'Finally, [solution] that actually works',
            'As seen on TikTok - now available here',
            '[X] sold... and counting',
        ],
        urgency: ['Limited stock', 'Going viral - get yours before sold out'],
        trust: ['30-day money-back', 'Free returns', 'Secure checkout'],
    },

    fashion: {
        name: 'Fashion & Accessories',
        headlines: [
            'The [item] that broke the internet',
            'Upgrade your look for under €[X]',
            'Your new favorite [item]',
            'Trending now: [product]',
        ],
        urgency: ['Selling fast', 'Limited sizes available'],
        trust: ['Size guide included', 'Easy returns', 'Real customer photos'],
    },

    home: {
        name: 'Home & Kitchen',
        headlines: [
            'The home hack you didn\'t know you needed',
            'Transform your space',
            'The genius [product] everyone needs',
            'Why didn\'t I buy this sooner?',
        ],
        urgency: ['Warehouse sale', 'Limited quantity'],
        trust: ['Quality guaranteed', 'Secure packaging'],
    },

    pet: {
        name: 'Pet Products',
        headlines: [
            'Your [pet] will love this',
            'The viral pet product of [year]',
            '[X] pet parents agree',
            'Finally, [solution] for your [pet]',
        ],
        urgency: ['Pet-tested, owner-approved', 'Going fast'],
        trust: ['Safe for all pets', 'Vet-approved', 'Happy pet guarantee'],
    },

    beauty: {
        name: 'Beauty & Personal Care',
        headlines: [
            'The secret [beauty product] everyone\'s using',
            'Get that [desired result] look',
            'Beauty hack of the year',
            'Your skincare game-changer',
        ],
        urgency: ['Trending on social', 'Limited-time price'],
        trust: ['Cruelty-free', 'Safe ingredients', 'Results guaranteed'],
    },
};

/**
 * Shipping Messaging Strategies
 */
export const SHIPPING_MESSAGING = {
    fast_shipping: {
        messaging: 'Fast & Free Shipping',
        subtext: 'Ships within 24 hours',
        trust: 'Order tracking included',
    },

    realistic_shipping: {
        messaging: 'Free Worldwide Shipping',
        subtext: 'Delivery in [X-Y] business days',
        trust: 'Full tracking provided',
    },

    warehouse_locations: {
        messaging: 'Ships from local warehouse',
        subtext: 'Faster delivery, local support',
        trust: 'EU/US warehouse available',
    },

    express_option: {
        messaging: 'Standard: Free | Express: €[X]',
        subtext: 'Choose your speed',
        trust: 'Priority processing available',
    },
};

/**
 * Scarcity & Urgency for Dropshipping
 */
export const DROPSHIP_URGENCY = {
    stock: ['Only [X] left', 'Low stock - order now', 'Almost sold out', '[X]% claimed'],
    time: ['Sale ends soon', '48-hour sale', 'Flash deal - today only'],
    social: ['[X] people are viewing this', '[X] sold in last 24h', 'Trending now'],
    price: ['Launch price - won\'t last', 'Pre [holiday] sale', 'Introductory offer'],
};

/**
 * Ad Style Recommendations for Dropshipping
 */
export const DROPSHIP_AD_STYLES = {
    ugc_style: {
        name: 'UGC-Style Ad',
        description: 'Looks like real user content, not polished ad',
        headline: 'I finally found [solution]!',
        visual: 'Selfie-style video, authentic reaction, real usage',
        bestFor: 'Building trust, virality',
    },

    problem_solution: {
        name: 'Problem-Solution',
        description: 'Show pain point, then product solving it',
        headline: 'Tired of [problem]? This changes everything.',
        visual: 'Before/after, demonstration, comparison',
        bestFor: 'Utility products, gadgets',
    },

    viral_hook: {
        name: 'Viral Hook',
        description: 'Attention-grabbing opening',
        headline: 'Wait for it... | This is insane',
        visual: 'Unexpected reveal, satisfying demo',
        bestFor: 'Social virality, shares',
    },

    social_proof: {
        name: 'Review Compilation',
        description: 'Multiple reviews/testimonials',
        headline: 'See why [X] people love this',
        visual: 'Review screenshots, customer photos, ratings',
        bestFor: 'Trust building, consideration',
    },
};

/**
 * Get dropshipping category
 */
export function getDropshipCategory(categoryId) {
    return DROPSHIP_CATEGORIES[categoryId] || DROPSHIP_CATEGORIES.gadgets;
}

/**
 * Build dropshipping-specific prompt
 */
export function buildDropshippingPrompt(category, options = {}) {
    const cat = getDropshipCategory(category);
    const { adStyle = 'ugc_style', showUrgency = true } = options;
    const style = DROPSHIP_AD_STYLES[adStyle];

    return `
DROPSHIPPING AD SPECIFICATIONS (${cat.name}):

AD STYLE: ${style.name} - ${style.description}

HEADLINE OPTIONS:
${cat.headlines.map(h => `- ${h}`).join('\n')}

TRUST ELEMENTS (Critical for unknown brand):
${cat.trust.map(t => `✓ ${t}`).join('\n')}

VISUAL APPROACH: ${style.visual}

${showUrgency ? `
URGENCY ELEMENTS:
${cat.urgency.map(u => `⚡ ${u}`).join('\n')}
` : ''}

SHIPPING MESSAGE: ${SHIPPING_MESSAGING.realistic_shipping.messaging}
${SHIPPING_MESSAGING.realistic_shipping.subtext}

IMPORTANT FOR DROPSHIPPING:
- UGC/authentic style outperforms polished ads
- Address trust concerns immediately
- Social proof is ESSENTIAL for conversion
- Be transparent about shipping times
`;
}
