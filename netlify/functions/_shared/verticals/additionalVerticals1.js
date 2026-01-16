/**
 * Additional Vertical Modules - Batch 1
 * Real Estate, Healthcare, B2B Enterprise, Local Business
 */

// ========================================
// REAL ESTATE INTELLIGENCE
// ========================================
export const REAL_ESTATE = {
    listingTypes: {
        residential: {
            headlines: [
                'Your dream home awaits',
                'Just listed in [neighborhood]',
                '[X] bed, [Y] bath - under market value',
                'Open house this weekend',
            ],
            urgency: ['New listing', 'Multiple offers expected', 'Price just reduced'],
            ctas: ['Schedule viewing', 'See more photos', 'Get details'],
        },
        investment: {
            headlines: [
                '[X]% cap rate opportunity',
                'Cash-flowing from day one',
                'Turn-key investment property',
                'Build your real estate portfolio',
            ],
            urgency: ['Off-market deal', 'Limited partners accepted'],
            ctas: ['See investment details', 'Calculate ROI', 'Join investor list'],
        },
        luxury: {
            headlines: [
                'Luxury living redefined',
                'Exclusive [neighborhood] estate',
                'For the discerning buyer',
                'Architectural masterpiece',
            ],
            visualStyle: 'Cinematic, lifestyle-focused, premium quality',
            ctas: ['Private showing', 'Request brochure', 'Contact agent'],
        },
    },

    agentBranding: {
        headlines: [
            'Your [area] real estate expert',
            '[X] homes sold | [Y]+ years experience',
            'The agent who closes deals',
            'Top [X]% of agents in [area]',
        ],
        trustSignals: ['Homes sold', 'Client testimonials', 'Area expertise', 'Awards'],
        ctas: ['Get home valuation', 'Search listings', 'Contact me'],
    },
};

// ========================================
// HEALTHCARE INTELLIGENCE
// ========================================
export const HEALTHCARE = {
    practiceTypes: {
        dental: {
            headlines: [
                'Your smile, our priority',
                'Gentle dentistry for the whole family',
                'New patient special: [offer]',
                'The dental experience you deserve',
            ],
            trustSignals: ['Licensed professionals', 'Modern technology', 'Patient reviews'],
            ctas: ['Book appointment', 'Call now', 'Claim offer'],
        },
        medical: {
            headlines: [
                'Healthcare that puts you first',
                'Same-day appointments available',
                'Accepting new patients',
                'Care you can trust',
            ],
            complianceNotes: ['HIPAA compliant', 'Patient privacy', 'Medical claims regulations'],
        },
        wellness: {
            headlines: [
                'Feel your best every day',
                'Holistic health solutions',
                'Your wellness journey starts here',
                'Modern medicine meets natural healing',
            ],
            ctas: ['Book consultation', 'Take assessment', 'Learn more'],
        },
        aesthetic: {
            headlines: [
                'Look as young as you feel',
                'Non-surgical rejuvenation',
                'Confidence-boosting results',
                'The [treatment] experts',
            ],
            proofElements: ['Before/after', 'Provider credentials', 'Technology'],
            ctas: ['Book free consultation', 'See results', 'Request appointment'],
        },
    },

    compliance: {
        mustInclude: ['Proper medical disclaimers', 'No guaranteed outcomes', 'Licensed professional indication'],
        avoid: ['Unsubstantiated health claims', 'Before/after without consent', 'Misleading testimonials'],
    },
};

// ========================================
// B2B ENTERPRISE INTELLIGENCE
// ========================================
export const B2B_ENTERPRISE = {
    salesCycle: {
        awareness: {
            goal: 'Introduce problem/solution',
            headlines: ['The [problem] costing you [Y]', 'Why [X]% of companies fail at [Y]'],
            cta: 'Learn more',
        },
        consideration: {
            goal: 'Demonstrate expertise and value',
            headlines: ['How [Company] solved [problem]', 'The [X] framework top companies use'],
            cta: 'Get the guide',
        },
        decision: {
            goal: 'Convert to sales conversation',
            headlines: ['See [Product] in action', 'Your custom demo awaits'],
            cta: 'Book demo',
        },
    },

    buyerPersonas: {
        executive: {
            concerns: ['ROI', 'Risk', 'Strategic fit'],
            messaging: 'Focus on business outcomes and competitive advantage',
        },
        manager: {
            concerns: ['Team efficiency', 'Implementation', 'Adoption'],
            messaging: 'Focus on ease of use and productivity gains',
        },
        technical: {
            concerns: ['Security', 'Integration', 'Scalability'],
            messaging: 'Focus on specs, architecture, and reliability',
        },
    },

    trustSignals: {
        enterprise: ['Fortune 500 logos', 'Enterprise usage stats', 'Security certifications'],
        proof: ['Case studies with named companies', 'ROI statistics', 'Industry analyst recognition'],
    },
};

// ========================================
// LOCAL BUSINESS INTELLIGENCE
// ========================================
export const LOCAL_BUSINESS = {
    businessTypes: {
        restaurant: {
            headlines: [
                'The best [cuisine] in [city]',
                'Your new favorite spot',
                'Tonight\'s reservation awaits',
                '[X] ⭐ on Google - see why',
            ],
            urgency: ['Limited tables', 'Tonight only', 'Special event'],
            ctas: ['Reserve a table', 'Order now', 'See menu'],
        },
        service: {
            headlines: [
                '[Service] you can trust',
                'Serving [area] for [X] years',
                'Your local [service] experts',
                'Same-day service available',
            ],
            trustSignals: ['Licensed & insured', 'Local reviews', 'Guarantee'],
            ctas: ['Get free quote', 'Call now', 'Book service'],
        },
        retail: {
            headlines: [
                'Shop local in [neighborhood]',
                'Visit our [city] store',
                'In-store exclusive',
                'Come see us today',
            ],
            urgency: ['In-store only', 'While supplies last'],
            ctas: ['Get directions', 'Shop now', 'Visit store'],
        },
        fitness: {
            headlines: [
                'Your fitness journey starts here',
                'Join [studio name] today',
                'First class free',
                'The gym [neighborhood] loves',
            ],
            ctas: ['Claim free class', 'Join now', 'Book trial'],
        },
    },

    localTactics: {
        proximity: 'Target by radius, mention neighborhood names',
        reviews: 'Lead with Google/Yelp ratings',
        community: 'Mention local involvement, years serving area',
        exclusivity: 'Local-only offers, in-store specials',
    },
};

/**
 * Get real estate listing type
 */
export function getRealEstateType(typeId) {
    return REAL_ESTATE.listingTypes[typeId] || REAL_ESTATE.listingTypes.residential;
}

/**
 * Get local business type
 */
export function getLocalBusinessType(typeId) {
    return LOCAL_BUSINESS.businessTypes[typeId] || LOCAL_BUSINESS.businessTypes.service;
}

/**
 * Build vertical-specific prompts
 */
export function buildRealEstatePrompt(type) {
    const t = getRealEstateType(type);
    return `
REAL ESTATE AD (${type}):
Headlines: ${t.headlines.join(' | ')}
Urgency: ${t.urgency?.join(', ') || 'Limited availability'}
CTAs: ${t.ctas.join(', ')}
Visual: High-quality property photos, lifestyle imagery
`;
}

export function buildLocalBusinessPrompt(type) {
    const t = getLocalBusinessType(type);
    return `
LOCAL BUSINESS AD (${type}):
Headlines: ${t.headlines.join(' | ')}
Trust: ${t.trustSignals?.join(', ') || 'Local reviews, years in business'}
CTAs: ${t.ctas.join(', ')}
Tactics: ${Object.values(LOCAL_BUSINESS.localTactics).join(', ')}
`;
}
