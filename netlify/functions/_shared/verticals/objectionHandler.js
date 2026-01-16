/**
 * Objection Handler Module
 * Address common objections in ads: price, timing, trust, need
 */

/**
 * Universal Objections & Handlers
 */
export const UNIVERSAL_OBJECTIONS = {
    // ========================================
    // PRICE OBJECTIONS
    // ========================================
    too_expensive: {
        objection: 'It\'s too expensive',

        handlers: [
            {
                technique: 'Value comparison',
                response: 'Less than €[X]/day',
                headline: 'For less than a coffee a day',
            },
            {
                technique: 'ROI framing',
                response: 'Pays for itself in [X] days',
                headline: 'Save €[amount] per month',
            },
            {
                technique: 'Payment plan',
                response: 'Easy monthly payments',
                headline: 'Just €[X]/month for [Z] months',
            },
            {
                technique: 'Risk reversal',
                response: 'Money-back guarantee',
                headline: '100% refund if you\'re not satisfied',
            },
        ],

        visualElements: ['Price breakdown', 'Comparison chart', 'Savings calculator'],
    },

    // ========================================
    // TRUST OBJECTIONS
    // ========================================
    not_trusted: {
        objection: 'I don\'t know/trust this brand',

        handlers: [
            {
                technique: 'Social proof',
                response: 'Trusted by [X] customers',
                headline: 'Join [X] happy customers',
            },
            {
                technique: 'Reviews',
                response: '[X] 5-star reviews',
                headline: '⭐⭐⭐⭐⭐ rated by customers',
            },
            {
                technique: 'Authority',
                response: 'Featured in [publication]',
                headline: 'As seen in [media]',
            },
            {
                technique: 'Guarantee',
                response: 'Risk-free trial',
                headline: 'Try risk-free for [X] days',
            },
        ],

        visualElements: ['Customer photos', 'Review scores', 'Media logos', 'Trust badges'],
    },

    // ========================================
    // TIME OBJECTIONS
    // ========================================
    no_time: {
        objection: 'I don\'t have time for this',

        handlers: [
            {
                technique: 'Time savings',
                response: 'Saves [X] hours per week',
                headline: 'Get [X] hours back every week',
            },
            {
                technique: 'Quick implementation',
                response: 'Set up in [X] minutes',
                headline: 'Ready in [X] minutes, not days',
            },
            {
                technique: 'Autopilot',
                response: 'Works while you sleep',
                headline: 'Set it and forget it',
            },
            {
                technique: 'Quick wins',
                response: 'See results in [timeframe]',
                headline: 'First results in [X] days',
            },
        ],

        visualElements: ['Time saved visualization', 'Quick setup demo', 'Automation flow'],
    },

    // ========================================
    // NEED OBJECTIONS
    // ========================================
    dont_need: {
        objection: 'I don\'t need this',

        handlers: [
            {
                technique: 'Problem awareness',
                response: 'Did you know [problem costs you X]?',
                headline: 'This is costing you €[X] per month',
            },
            {
                technique: 'Future pacing',
                response: 'Imagine life with [benefit]',
                headline: 'What if you could [benefit]?',
            },
            {
                technique: 'Peer pressure',
                response: 'Your competitors are using this',
                headline: '[X]% of [industry] already have this',
            },
            {
                technique: 'Risk of inaction',
                response: 'Cost of not solving [problem]',
                headline: 'Every day without this costs you',
            },
        ],

        visualElements: ['Problem visualization', 'Before/after', 'Competitor comparison'],
    },

    // ========================================
    // COMPLEXITY OBJECTIONS
    // ========================================
    too_complicated: {
        objection: 'It looks too complicated',

        handlers: [
            {
                technique: 'Simplicity proof',
                response: 'No technical skills needed',
                headline: 'If you can click, you can use this',
            },
            {
                technique: 'Support highlight',
                response: 'Full support included',
                headline: 'We\'ll set everything up for you',
            },
            {
                technique: 'Demo offer',
                response: 'See how easy it is',
                headline: 'Watch the 2-minute demo',
            },
            {
                technique: 'Onboarding',
                response: 'Step-by-step guidance',
                headline: 'We guide you every step of the way',
            },
        ],

        visualElements: ['Simple interface screenshot', 'Step indicators', 'Support availability'],
    },

    // ========================================
    // TIMING OBJECTIONS
    // ========================================
    not_now: {
        objection: 'Now isn\'t the right time',

        handlers: [
            {
                technique: 'Urgency',
                response: 'Price increases [date]',
                headline: 'Last chance at this price',
            },
            {
                technique: 'Delayed cost',
                response: 'Wait = lose [X] more days/money',
                headline: 'Every day you wait is €[X] lost',
            },
            {
                technique: 'Low commitment',
                response: 'Start small, scale when ready',
                headline: 'Start free, upgrade when ready',
            },
            {
                technique: 'Seasonal relevance',
                response: 'Perfect timing for [season/goal]',
                headline: 'The best time to start is now',
            },
        ],

        visualElements: ['Countdown timer', 'Before/after timeline', 'Limited availability'],
    },
};

/**
 * Guarantee Types
 */
export const GUARANTEE_TYPES = {
    money_back: {
        name: 'Money-Back Guarantee',
        display: '30-day money-back guarantee',
        copy: 'If you\'re not satisfied, get a full refund. No questions asked.',
        trustLevel: 'High',
    },

    results_guarantee: {
        name: 'Results Guarantee',
        display: 'Get [result] or your money back',
        copy: 'If you don\'t see [specific result] in [timeframe], we\'ll refund 100%.',
        trustLevel: 'Very High',
    },

    satisfaction_guarantee: {
        name: 'Satisfaction Guarantee',
        display: '100% satisfaction guaranteed',
        copy: 'Love it or we\'ll make it right.',
        trustLevel: 'Medium-High',
    },

    lifetime_guarantee: {
        name: 'Lifetime Guarantee',
        display: 'Lifetime warranty',
        copy: 'Breaks? We\'ll replace it. Forever.',
        trustLevel: 'Very High',
    },

    best_price_guarantee: {
        name: 'Best Price Guarantee',
        display: 'Best price guaranteed',
        copy: 'Find it cheaper? We\'ll match it + give you [X]% off.',
        trustLevel: 'Medium',
    },
};

/**
 * Get objection handlers
 */
export function getObjectionHandlers(objectionId) {
    return UNIVERSAL_OBJECTIONS[objectionId] || UNIVERSAL_OBJECTIONS.too_expensive;
}

/**
 * Build objection-handling prompt
 */
export function buildObjectionPrompt(primaryObjection, guarantee = 'money_back') {
    const obj = getObjectionHandlers(primaryObjection);
    const guar = GUARANTEE_TYPES[guarantee];

    return `
OBJECTION HANDLING (${obj.objection}):

HANDLER TECHNIQUES:
${obj.handlers.map(h => `
• ${h.technique}
  Response: ${h.response}
  Headline: "${h.headline}"`).join('\n')}

VISUAL ELEMENTS TO INCLUDE:
${obj.visualElements.map(v => `✓ ${v}`).join('\n')}

GUARANTEE TO DISPLAY:
${guar.display}
${guar.copy}

AD SHOULD:
- Acknowledge the concern implicitly
- Immediately provide reassurance
- Back up with proof elements
- End with low-risk CTA
`;
}
