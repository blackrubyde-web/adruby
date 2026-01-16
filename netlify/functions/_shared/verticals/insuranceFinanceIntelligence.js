/**
 * Insurance & Finance Intelligence Module
 * Trust-building, compliance-aware, risk-focused advertising
 */

/**
 * Insurance Product Types
 */
export const INSURANCE_PRODUCTS = {
    life_insurance: {
        id: 'life_insurance',
        name: 'Life Insurance',

        emotionalDrivers: ['family protection', 'peace of mind', 'legacy', 'responsibility'],

        headlines: [
            'Protect what matters most',
            'Because your family deserves security',
            'Peace of mind for €[X]/month',
            'What happens to them if something happens to you?',
        ],

        trustSignals: [
            'Licensed insurance broker',
            '[X] years helping families',
            'A-rated carriers only',
            'Free, no-obligation quote',
        ],

        objectionHandlers: {
            'too expensive': 'Coverage from just €[X]/month',
            'too complicated': 'We explain everything in plain language',
            'don\'t need it': 'Your family depends on your income',
            'later': 'Rates increase with age - lock in today\'s rate',
        },

        visualStyle: 'Family moments, protection imagery, warm and trustworthy',
        cta: ['Get free quote', 'Calculate your coverage', 'Speak with advisor'],
    },

    health_insurance: {
        id: 'health_insurance',
        name: 'Health Insurance',

        emotionalDrivers: ['health security', 'quality care', 'financial protection', 'peace of mind'],

        headlines: [
            'Healthcare you can count on',
            'Don\'t let medical bills surprises destroy your savings',
            'The coverage you need at a price you can afford',
            'Compare plans in 2 minutes',
        ],

        trustSignals: [
            'Compare [X] providers',
            'Unbiased recommendations',
            'No fees for our service',
            'Licensed health insurance advisor',
        ],

        visualStyle: 'Healthcare professionals, healthy families, clean medical aesthetic',
        cta: ['Compare plans', 'Get personalized quote', 'Find your plan'],
    },

    auto_insurance: {
        id: 'auto_insurance',
        name: 'Auto Insurance',

        emotionalDrivers: ['savings', 'protection', 'legal compliance', 'peace of mind'],

        headlines: [
            'Drivers save €[X] on average',
            'Same coverage, better price',
            'Compare [X] insurers in 60 seconds',
            'Your car deserves better coverage',
        ],

        trustSignals: [
            'Compare [X]+ providers',
            'No personal info to browse',
            'Instant quotes',
            'Trusted by [X] drivers',
        ],

        visualStyle: 'Cars, driving, freedom, protection',
        cta: ['Compare quotes', 'See your savings', 'Get instant quote'],
    },

    business_insurance: {
        id: 'business_insurance',
        name: 'Business Insurance',

        emotionalDrivers: ['business protection', 'legal compliance', 'risk mitigation', 'peace of mind'],

        headlines: [
            'Protect your business from the unexpected',
            'Business insurance tailored to [industry]',
            'Don\'t let one incident close your doors',
            'Coverage that grows with your business',
        ],

        trustSignals: [
            'Specialists in [industry] coverage',
            'A-rated carriers',
            'Fast claims processing',
            'Trusted by [X] businesses',
        ],

        visualStyle: 'Business settings, professional, trustworthy',
        cta: ['Get business quote', 'Speak with specialist', 'Protect your business'],
    },
};

/**
 * Finance Product Types
 */
export const FINANCE_PRODUCTS = {
    investment: {
        id: 'investment',
        name: 'Investment Services',

        headlines: [
            'Grow your wealth intelligently',
            'Start investing with just €[X]',
            'Your money should work as hard as you do',
            '[X]% average annual returns',
        ],

        complianceRequired: [
            'Past performance does not guarantee future results',
            'Investment involves risk',
            'Capital at risk',
        ],

        trustSignals: ['Regulated by [Authority]', '[X] years in market', 'Assets under management: €[X]B'],
        cta: ['Start investing', 'See how it works', 'Open account'],
    },

    loans: {
        id: 'loans',
        name: 'Loans & Credit',

        headlines: [
            'Rates from [X]% APR',
            'Get funds in 24 hours',
            'No hidden fees, ever',
            'Check your rate - no impact on credit score',
        ],

        complianceRequired: [
            'Representative APR',
            'Subject to credit approval',
            'Borrowing responsibly',
        ],

        trustSignals: ['Transparent pricing', 'No hidden fees', 'Trusted lender'],
        cta: ['Check your rate', 'See if you qualify', 'Apply in minutes'],
    },

    accounting: {
        id: 'accounting',
        name: 'Accounting & Bookkeeping',

        headlines: [
            'Focus on your business, not the books',
            'Tax-ready books, year-round',
            'Save [X] hours/month on bookkeeping',
            'Never miss a deduction again',
        ],

        trustSignals: ['Certified accountants', 'Tax guarantee', 'Secure & compliant'],
        cta: ['Get started', 'Book consultation', 'See pricing'],
    },
};

/**
 * Trust-Building Framework for Finance
 */
export const TRUST_FRAMEWORK = {
    credentials: {
        elements: ['Licensed', 'Regulated', 'Certified', 'Accredited'],
        display: 'Prominently in ad, often near logo or CTA',
    },

    social_proof: {
        elements: ['Customer count', 'Assets managed', 'Years in business', 'Reviews'],
        display: 'Numbers with context - "Trusted by 50,000 families"',
    },

    transparency: {
        elements: ['No hidden fees', 'Clear pricing', 'Plain language', 'Full disclosure'],
        display: 'Address skepticism directly',
    },

    security: {
        elements: ['Data encryption', 'Secure process', 'Privacy protected'],
        display: 'Lock icons, security badges',
    },

    guarantee: {
        elements: ['Money-back', 'Satisfaction', 'Best price', 'Service guarantee'],
        display: 'Reduce perceived risk',
    },
};

/**
 * Compliance Considerations
 */
export const COMPLIANCE_NOTES = {
    disclaimers: 'Always include required legal disclaimers',
    claims: 'All claims must be verifiable and documented',
    testimonials: 'Real testimonials with proper disclosure',
    rates: 'Representative rates with APR disclosure',
    risks: 'Investment risks must be clearly stated',
};

/**
 * Get insurance product intelligence
 */
export function getInsuranceProduct(productId) {
    return INSURANCE_PRODUCTS[productId] || INSURANCE_PRODUCTS.life_insurance;
}

/**
 * Build insurance/finance specific prompt
 */
export function buildInsurancePrompt(product, options = {}) {
    const p = INSURANCE_PRODUCTS[product] || FINANCE_PRODUCTS[product];
    if (!p) return '';

    return `
INSURANCE/FINANCE AD SPECIFICATIONS (${p.name}):

EMOTIONAL DRIVERS:
${(p.emotionalDrivers || []).map(d => `- ${d}`).join('\n')}

HEADLINE OPTIONS:
${p.headlines.map(h => `- ${h}`).join('\n')}

TRUST SIGNALS (Critical):
${p.trustSignals.map(t => `✓ ${t}`).join('\n')}

VISUAL STYLE: ${p.visualStyle || 'Professional, trustworthy, secure'}

CTA OPTIONS:
${(p.cta || ['Get quote', 'Learn more']).map(c => `→ ${c}`).join('\n')}

COMPLIANCE REMINDER:
- Include necessary disclaimers
- All claims must be verifiable
- Use compliant language only
`;
}
