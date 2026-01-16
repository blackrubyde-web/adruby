/**
 * Retargeting Intelligence Module
 * Cart abandon, product view, warm audience strategies
 */

/**
 * Retargeting Audience Segments
 */
export const RETARGETING_SEGMENTS = {
    // ========================================
    // CART ABANDONERS
    // ========================================
    cart_abandon: {
        id: 'cart_abandon',
        name: 'Cart Abandoners',
        description: 'Added to cart but didn\'t complete purchase',
        intent: 'High - almost bought',

        strategies: {
            reminder: {
                headline: 'You left something behind',
                subheadline: 'Complete your order',
                urgency: 'Items in cart aren\'t reserved forever',
            },
            incentive: {
                headline: 'Come back for [X]% off',
                subheadline: 'Use code COMEBACK',
                urgency: 'Offer expires in 24 hours',
            },
            scarcity: {
                headline: 'Your items are selling fast',
                subheadline: 'Only [X] left in stock',
                urgency: 'Don\'t miss out',
            },
            social_proof: {
                headline: '[X] people bought this today',
                subheadline: 'See why it\'s a bestseller',
                urgency: 'Join them',
            },
        },

        bestPractice: 'Show the exact product they left behind',
        timing: ['1 hour', '24 hours', '72 hours', '7 days'],
    },

    // ========================================
    // PRODUCT VIEWERS
    // ========================================
    product_view: {
        id: 'product_view',
        name: 'Product Viewers',
        description: 'Viewed product page but didn\'t add to cart',
        intent: 'Medium - showed interest',

        strategies: {
            benefit_reminder: {
                headline: 'Still thinking about [Product]?',
                subheadline: 'Here\'s why customers love it',
                focus: 'Benefits and reviews',
            },
            alternative: {
                headline: 'You might also like...',
                subheadline: 'Similar items you\'ll love',
                focus: 'Related products',
            },
            price_drop: {
                headline: 'Price drop on [Product]',
                subheadline: 'Now €[X] less',
                focus: 'Savings opportunity',
            },
            social_proof: {
                headline: 'Customers are loving [Product]',
                subheadline: '[X] 5-star reviews',
                focus: 'Validation',
            },
        },

        bestPractice: 'Show the exact product + social proof',
        timing: ['24 hours', '3 days', '7 days', '14 days'],
    },

    // ========================================
    // PAST PURCHASERS
    // ========================================
    past_purchaser: {
        id: 'past_purchaser',
        name: 'Past Purchasers',
        description: 'Previously purchased from you',
        intent: 'Proven - have bought before',

        strategies: {
            cross_sell: {
                headline: 'You might also love...',
                subheadline: 'Based on your last purchase',
                focus: 'Complementary products',
            },
            replenishment: {
                headline: 'Time to restock?',
                subheadline: 'Your [Product] might be running low',
                focus: 'Re-order convenience',
            },
            new_arrival: {
                headline: 'New arrivals just dropped',
                subheadline: 'Exclusive early access for you',
                focus: 'VIP treatment',
            },
            loyalty: {
                headline: 'Thank you for being a customer',
                subheadline: 'Here\'s [X]% off your next order',
                focus: 'Appreciation + incentive',
            },
        },

        bestPractice: 'Personalize based on purchase history',
        timing: ['7 days post-purchase', '30 days', '60 days'],
    },

    // ========================================
    // WEBSITE VISITORS
    // ========================================
    site_visitor: {
        id: 'site_visitor',
        name: 'Website Visitors',
        description: 'Visited site but didn\'t convert',
        intent: 'Low-Medium - browsed',

        strategies: {
            brand_reminder: {
                headline: 'Discover [Brand]',
                subheadline: 'See what you might have missed',
                focus: 'Brand story and value',
            },
            bestsellers: {
                headline: 'Our most popular products',
                subheadline: 'See what everyone\'s buying',
                focus: 'Top products as entry point',
            },
            incentive: {
                headline: 'First-time buyer?',
                subheadline: 'Get [X]% off your first order',
                focus: 'New customer incentive',
            },
        },

        bestPractice: 'General awareness with bestsellers or offer',
        timing: ['24 hours', '7 days', '14 days', '30 days'],
    },

    // ========================================
    // EMAIL SUBSCRIBERS (Non-buyers)
    // ========================================
    email_subscriber: {
        id: 'email_subscriber',
        name: 'Email Subscribers',
        description: 'On email list but never purchased',
        intent: 'Medium - opted in for something',

        strategies: {
            exclusive_offer: {
                headline: 'A special offer just for you',
                subheadline: 'Subscriber-only [X]% off',
                focus: 'VIP treatment',
            },
            proof: {
                headline: 'See why others took the leap',
                subheadline: 'Customer stories',
                focus: 'Social proof to convert',
            },
            deadline: {
                headline: 'Your offer expires [date]',
                subheadline: 'Don\'t miss out',
                focus: 'Urgency to act',
            },
        },

        bestPractice: 'Acknowledge their subscriber status, offer exclusive deal',
        timing: ['7 days after signup', '14 days', '30 days'],
    },

    // ========================================
    // LAPSED CUSTOMERS
    // ========================================
    lapsed_customer: {
        id: 'lapsed_customer',
        name: 'Lapsed Customers',
        description: 'Haven\'t purchased in 60+ days',
        intent: 'Medium - used to buy',

        strategies: {
            we_miss_you: {
                headline: 'We miss you!',
                subheadline: 'Here\'s [X]% off to welcome you back',
                focus: 'Win-back with incentive',
            },
            whats_new: {
                headline: 'A lot has changed...',
                subheadline: 'See what\'s new since your last visit',
                focus: 'New products/features',
            },
            vip_treatment: {
                headline: 'As a valued customer...',
                subheadline: 'Exclusive early access for you',
                focus: 'Special treatment',
            },
        },

        bestPractice: 'Acknowledge absence, provide strong incentive',
        timing: ['60 days inactive', '90 days', '180 days'],
    },
};

/**
 * Retargeting Ad Best Practices
 */
export const RETARGETING_BEST_PRACTICES = {
    personalization: 'Show specific products viewed, not generic ads',
    frequency: 'Cap impressions to avoid ad fatigue (3-7 per week max)',
    timing: 'Urgency decreases over time - adjust message',
    exclusion: 'Exclude recent purchasers from cart abandon campaigns',
    creative_rotation: 'Rotate creatives to prevent banner blindness',
};

/**
 * Get retargeting segment
 */
export function getRetargetingSegment(segmentId) {
    return RETARGETING_SEGMENTS[segmentId] || RETARGETING_SEGMENTS.cart_abandon;
}

/**
 * Build retargeting-specific prompt
 */
export function buildRetargetingPrompt(segment, strategy = null) {
    const seg = getRetargetingSegment(segment);
    const strat = strategy ? seg.strategies[strategy] : Object.values(seg.strategies)[0];

    return `
RETARGETING AD (${seg.name}):

AUDIENCE: ${seg.description}
INTENT LEVEL: ${seg.intent}

STRATEGY: ${strat ? `
Headline: "${strat.headline}"
Subheadline: "${strat.subheadline}"
Focus: ${strat.focus || strat.urgency}` : 'Multiple options available'}

BEST PRACTICE: ${seg.bestPractice}
TIMING: ${seg.timing.join(', ')}

VISUAL APPROACH:
- Show the EXACT product they interacted with (if applicable)
- Personalization is key for retargeting
- Include clear reminder of previous interaction
- Strong CTA to complete the action

IMPORTANT:
- This is a WARM audience - they know your product
- Copy can be more direct
- Focus on removing friction and objections
`;
}
