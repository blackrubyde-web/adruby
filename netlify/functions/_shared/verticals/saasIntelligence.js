/**
 * SaaS & Software Sales Intelligence Module
 * Complete SaaS advertising strategies, trial/demo funnels, pricing psychology
 */

/**
 * SaaS Business Models with specific strategies
 */
export const SAAS_MODELS = {
    // ========================================
    // FREEMIUM MODEL
    // ========================================
    freemium: {
        id: 'freemium',
        name: 'Freemium SaaS',
        description: 'Free tier with paid upgrades',

        adStrategies: {
            primary: ['free-value', 'feature-teaser', 'upgrade-benefit'],
            funnel: 'Ad → Free signup → Onboarding → Upgrade prompts',
        },

        headlines: [
            'Start free, upgrade when ready',
            'Free forever. Pro when you need it.',
            'Join [X] users already on free',
            'No credit card required',
        ],

        ctas: ['Start free', 'Create free account', 'Get started free'],

        objectionHandlers: [
            'No credit card needed',
            'Free tier has everything to start',
            'Upgrade only if you want more',
        ],

        conversionFocus: 'Signups, then upgrade rate',
    },

    // ========================================
    // FREE TRIAL MODEL
    // ========================================
    free_trial: {
        id: 'free_trial',
        name: 'Free Trial SaaS',
        description: '7-30 day full access trial',

        adStrategies: {
            primary: ['full-access', 'time-urgency', 'result-preview'],
            funnel: 'Ad → Trial signup → Onboarding → Conversion before end',
        },

        headlines: [
            'Try [Product] free for [X] days',
            'Full access. No commitment.',
            'See results in [X] days - guaranteed',
            'Your [benefit] trial starts now',
        ],

        ctas: ['Start free trial', 'Try free for [X] days', 'Get [X] days free'],

        objectionHandlers: [
            'Cancel anytime during trial',
            'No charge until trial ends',
            'Full features included',
        ],

        conversionFocus: 'Trial starts, then trial-to-paid rate',
    },

    // ========================================
    // DEMO REQUEST MODEL
    // ========================================
    demo_request: {
        id: 'demo_request',
        name: 'Demo Request SaaS',
        description: 'Sales-led with demo calls',

        adStrategies: {
            primary: ['problem-solution', 'roi-focused', 'authority'],
            funnel: 'Ad → Demo request → Sales call → Close',
        },

        headlines: [
            'See how [Company] increased [metric] by [X]%',
            'Book a personalized demo',
            'Let us show you what\'s possible',
            'See [Product] in action',
        ],

        ctas: ['Book a demo', 'Schedule your demo', 'Get a walkthrough', 'See it in action'],

        objectionHandlers: [
            'No pressure, just information',
            '15-minute personalized walkthrough',
            'Learn how it fits your needs',
        ],

        conversionFocus: 'Demo bookings, then SQL rate',
    },

    // ========================================
    // DIRECT PURCHASE MODEL
    // ========================================
    direct_purchase: {
        id: 'direct_purchase',
        name: 'Direct Purchase SaaS',
        description: 'Buy now, no trial needed',

        adStrategies: {
            primary: ['value-stack', 'guarantee', 'social-proof'],
            funnel: 'Ad → Pricing → Direct checkout',
        },

        headlines: [
            'The only [tool] you need',
            'Get instant access to [benefit]',
            'Start [doing X] today',
            '[X]% of users see results in first week',
        ],

        ctas: ['Get started', 'Buy now', 'Start today', 'Get instant access'],

        objectionHandlers: [
            '30-day money-back guarantee',
            'Instant access after purchase',
            'Cancel anytime',
        ],

        conversionFocus: 'Direct purchases',
    },
};

/**
 * SaaS Pricing Display Strategies
 */
export const SAAS_PRICING = {
    anchor_high: {
        name: 'High Anchor',
        description: 'Show expensive plan first to make others seem affordable',
        visual: 'Enterprise ($999) → Pro ($99) → Starter ($29)',
        psychology: 'Anchoring effect - middle option looks like great value',
    },

    highlight_popular: {
        name: 'Highlight Popular',
        description: 'Badge on most common plan',
        visual: '"Most Popular" or "Best Value" badge',
        psychology: 'Social proof - if most choose it, must be right',
    },

    annual_discount: {
        name: 'Annual Discount',
        description: 'Show monthly price with annual savings',
        visual: '$29/mo billed annually (save 2 months!)',
        psychology: 'Loss aversion on savings',
    },

    per_user_value: {
        name: 'Per User Value',
        description: 'Break down to per-user or per-day cost',
        visual: 'Just $0.99/day per user',
        psychology: 'Makes big numbers seem small',
    },

    roi_comparison: {
        name: 'ROI Comparison',
        description: 'Compare cost to value generated',
        visual: '$99/mo → Saves $2,000/mo in time',
        psychology: 'Investment framing, not expense',
    },
};

/**
 * SaaS Feature Presentation
 */
export const FEATURE_PRESENTATION = {
    benefit_first: {
        pattern: '[Benefit] with [Feature]',
        example: 'Save 10 hours/week with automated reports',
    },

    problem_solution: {
        pattern: 'No more [Problem]. [Feature] handles it.',
        example: 'No more manual data entry. AI handles it.',
    },

    comparison: {
        pattern: 'Old way: [Pain] → New way: [Solution]',
        example: 'Old way: 3 tools → New way: 1 platform',
    },

    specificity: {
        pattern: '[Exact Number] [Specific Benefit]',
        example: '47 integrations. 3-click setup.',
    },
};

/**
 * SaaS Social Proof Types
 */
export const SAAS_SOCIAL_PROOF = {
    user_count: ['Used by 10,000+ teams', 'Join 50,000 businesses', 'Trusted by 1M+ users'],
    logo_bar: 'Show recognizable customer logos',
    testimonial: 'Specific result quote from named customer',
    rating: 'G2, Capterra, Product Hunt ratings',
    case_study: 'Detailed customer success story',
    live_stats: 'Real-time usage numbers',
};

/**
 * Get SaaS model intelligence
 */
export function getSaaSModel(modelId) {
    return SAAS_MODELS[modelId] || SAAS_MODELS.free_trial;
}

/**
 * Build SaaS-specific prompt
 */
export function buildSaaSPrompt(model, options = {}) {
    const m = getSaaSModel(model);
    const { hasRating, userCount, focusROI } = options;

    let prompt = `
SAAS ADVERTISING SPECIFICATIONS (${m.name}):

BUSINESS MODEL: ${m.description}
FUNNEL: ${m.adStrategies.funnel}

HEADLINE OPTIONS:
${m.headlines.map(h => `- ${h}`).join('\n')}

CTA OPTIONS:
${m.ctas.map(c => `→ ${c}`).join('\n')}

OBJECTION HANDLERS TO INCLUDE:
${m.objectionHandlers.map(o => `✓ ${o}`).join('\n')}

CONVERSION FOCUS: ${m.conversionFocus}
`;

    if (focusROI) {
        prompt += `
ROI MESSAGING:
- Lead with specific numbers
- Compare cost to value generated
- Use case study results if available
`;
    }

    return prompt;
}
