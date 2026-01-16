/**
 * Price Psychology Module
 * Advanced pricing strategies: anchoring, bundling, odd pricing, charm pricing
 */

/**
 * Pricing Psychology Tactics
 */
export const PRICING_TACTICS = {
    // ========================================
    // ANCHORING
    // ========================================
    anchoring: {
        name: 'Price Anchoring',
        description: 'Show a higher reference price first to make actual price seem like a deal',

        examples: [
            { display: '~~€199~~ €99', technique: 'Strikethrough original' },
            { display: 'Value: €500 | Your price: €97', technique: 'Value stacking' },
            { display: 'Competitors charge €150+', technique: 'Market comparison' },
        ],

        headlines: [
            'Worth €[high] - yours for €[low]',
            'Save €[savings]',
            '€[original] → €[sale]',
            'Get €[value] worth for just €[price]',
        ],

        bestFor: ['sales', 'launches', 'value products'],
    },

    // ========================================
    // CHARM PRICING
    // ========================================
    charm_pricing: {
        name: 'Charm Pricing (9-ending)',
        description: 'Prices ending in 9 perceived as significantly lower',

        examples: [
            { display: '€29.99', technique: 'Classic charm price' },
            { display: '€97', technique: 'Signal value (not cheap)' },
            { display: '€199', technique: 'Just under threshold' },
        ],

        psychology: 'Left-digit effect - €29.99 reads as "twenty-something"',

        bestFor: ['retail', 'ecommerce', 'impulse purchases'],
    },

    // ========================================
    // PRESTIGE PRICING
    // ========================================
    prestige_pricing: {
        name: 'Prestige Pricing (Round Numbers)',
        description: 'Round numbers signal quality and luxury',

        examples: [
            { display: '€100', technique: 'Clean, premium feel' },
            { display: '€500', technique: 'Luxury/quality signal' },
            { display: '€2,000', technique: 'High-ticket prestige' },
        ],

        psychology: 'Round numbers = quality. Precise numbers = calculated/cheap.',

        bestFor: ['luxury', 'premium', 'high-ticket', 'services'],
    },

    // ========================================
    // DECOY PRICING
    // ========================================
    decoy_pricing: {
        name: 'Decoy Pricing',
        description: 'Add an option that makes the target option look like best value',

        examples: [
            {
                options: ['Basic: €29', 'Pro: €59', 'Team: €99'],
                decoy: 'Pro makes Team look like great value',
            },
            {
                options: ['Small: €5', 'Medium: €7', 'Large: €7.50'],
                decoy: 'Medium makes Large look like no-brainer',
            },
        ],

        bestFor: ['SaaS', 'subscriptions', 'tiered products'],
    },

    // ========================================
    // BUNDLE PRICING
    // ========================================
    bundle_pricing: {
        name: 'Bundle Pricing',
        description: 'Combine products for perceived additional value',

        examples: [
            { display: 'Bundle: €149 (save €50)', technique: 'Savings emphasized' },
            { display: 'Complete kit: €199', technique: 'Everything included' },
            { display: 'Buy 2, get 1 free', technique: 'Free item incentive' },
        ],

        headlines: [
            'The complete [product] bundle',
            'Get everything for €[X]',
            'Bundle & save €[savings]',
            'Better together: €[bundle price]',
        ],

        bestFor: ['ecommerce', 'courses', 'services'],
    },

    // ========================================
    // PAYMENT FRAMING
    // ========================================
    payment_framing: {
        name: 'Payment Framing',
        description: 'Break down price to seem smaller',

        examples: [
            { display: 'Just €1/day', technique: 'Daily cost' },
            { display: '€49/month', technique: 'Monthly instead of annual' },
            { display: '3 payments of €99', technique: 'Payment plan' },
            { display: 'Less than your coffee', technique: 'Comparison anchor' },
        ],

        headlines: [
            'Just €[X]/day',
            'From €[X]/month',
            'Less than a [common purchase]',
            'Pay in [X] easy installments',
        ],

        bestFor: ['subscriptions', 'high-ticket', 'SaaS'],
    },

    // ========================================
    // SCARCITY PRICING
    // ========================================
    scarcity_pricing: {
        name: 'Scarcity Pricing',
        description: 'Limited-time or limited-quantity pricing',

        examples: [
            { display: 'Launch price: €99', technique: 'Temporary discount' },
            { display: 'First 100: €79', technique: 'Quantity limit' },
            { display: 'Price increases at midnight', technique: 'Time deadline' },
        ],

        headlines: [
            'Price goes up in [time]',
            'Only [X] at this price',
            'Launch pricing ends [date]',
            'Lock in this rate',
        ],

        bestFor: ['launches', 'sales', 'courses'],
    },
};

/**
 * Price Display Best Practices
 */
export const PRICE_DISPLAY = {
    visual: {
        strikethrough: 'Original price crossed out, sale price bold',
        size: 'Sale price larger than original',
        color: 'Sale price in accent color (often red)',
        placement: 'Price near CTA for proximity effect',
    },

    formatting: {
        currency: 'Symbol before number (€99)',
        decimals: 'Drop .00 for clean look (€99 not €99.00)',
        separators: 'Use thousands separator (€1,999)',
    },

    context: {
        perUnit: 'Show per-unit price for bulk (€2.50/item)',
        perPeriod: 'Show monthly for annual plans (€8.25/mo billed yearly)',
        savings: 'Always show savings amount (Save €50)',
    },
};

/**
 * Get pricing tactic
 */
export function getPricingTactic(tacticId) {
    return PRICING_TACTICS[tacticId] || PRICING_TACTICS.anchoring;
}

/**
 * Build pricing-focused prompt
 */
export function buildPricingPrompt(tactic, options = {}) {
    const t = getPricingTactic(tactic);
    const { originalPrice, salePrice, savings } = options;

    return `
PRICE PSYCHOLOGY (${t.name}):
${t.description}

DISPLAY TECHNIQUE:
${t.examples?.map(e => `• ${e.display || JSON.stringify(e)}`).join('\n') || ''}

HEADLINE OPTIONS:
${t.headlines?.map(h => `- ${h}`).join('\n') || ''}

VISUAL DISPLAY:
- ${PRICE_DISPLAY.visual.strikethrough}
- ${PRICE_DISPLAY.visual.color}
- ${PRICE_DISPLAY.visual.placement}

${originalPrice && salePrice ? `
CURRENT PRICING:
Original: €${originalPrice} → Sale: €${salePrice} (Save €${savings || originalPrice - salePrice})
` : ''}
`;
}
