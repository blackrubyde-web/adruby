/**
 * Web Design & Agency Intelligence Module
 * Portfolio presentation, case studies, client acquisition
 */

/**
 * Agency Service Types
 */
export const AGENCY_SERVICES = {
    web_design: {
        id: 'web_design',
        name: 'Web Design & Development',

        valueProps: [
            'Custom, conversion-optimized websites',
            'Mobile-first responsive design',
            'Fast loading, SEO-ready',
            'User experience that converts',
        ],

        headlines: [
            'Websites that actually convert',
            'Your digital presence, elevated',
            'Custom website in [X] weeks',
            'Stop losing customers to a bad website',
        ],

        proofPoints: [
            'Portfolio of stunning sites',
            'Client conversion increases',
            'Load time improvements',
            'SEO ranking results',
        ],

        objections: {
            'too expensive': 'ROI from better conversions pays for itself',
            'can use templates': 'Custom = unique + optimized for YOUR customers',
            'takes too long': 'Professional process = faster than DIY iterations',
        },

        ctas: ['Get free quote', 'See our work', 'Book consultation', 'Start your project'],
    },

    branding: {
        id: 'branding',
        name: 'Branding & Identity',

        valueProps: [
            'Memorable brand identity',
            'Consistent visual language',
            'Stand out from competitors',
            'Professional first impression',
        ],

        headlines: [
            'A brand that gets remembered',
            'First impressions that last',
            'Brand identity that works',
            'Look like the industry leader you are',
        ],

        proofPoints: [
            'Before/after brand transformations',
            'Client recognition metrics',
            'Industry awards',
            'Brand consistency showcase',
        ],

        ctas: ['Start branding project', 'See transformations', 'Book brand call'],
    },

    marketing: {
        id: 'marketing',
        name: 'Digital Marketing',

        valueProps: [
            'Performance-based advertising',
            'Data-driven strategies',
            'Measurable ROI',
            'Full-funnel approach',
        ],

        headlines: [
            'Marketing that actually works',
            '[X]x return on ad spend',
            'Stop burning ad budget',
            'Results, not just reports',
        ],

        proofPoints: [
            'ROAS case studies',
            'Client revenue growth',
            'Cost-per-acquisition metrics',
            'Conversion rate improvements',
        ],

        ctas: ['Get marketing audit', 'See case studies', 'Book strategy call'],
    },

    ecommerce: {
        id: 'ecommerce',
        name: 'E-Commerce Development',

        valueProps: [
            'High-converting online stores',
            'Seamless checkout experience',
            'Scalable infrastructure',
            'Integration with tools you use',
        ],

        headlines: [
            'Stores built to sell',
            'E-commerce that scales with you',
            'From €[X] to €[Y] revenue',
            'Your online store, done right',
        ],

        proofPoints: [
            'Revenue growth case studies',
            'Conversion rate improvements',
            'Successful store launches',
        ],

        ctas: ['Get store quote', 'See e-commerce work', 'Book project call'],
    },

    seo: {
        id: 'seo',
        name: 'SEO Services',

        valueProps: [
            'Organic traffic growth',
            'First page rankings',
            'Long-term sustainable results',
            'Transparent reporting',
        ],

        headlines: [
            'Get found on Google',
            'From page [X] to page 1',
            '[X]% organic traffic increase',
            'SEO that actually delivers',
        ],

        proofPoints: [
            'Ranking improvements',
            'Traffic growth charts',
            'Revenue from organic',
        ],

        ctas: ['Get SEO audit', 'See ranking results', 'Start SEO campaign'],
    },
};

/**
 * Portfolio Presentation Strategies
 */
export const PORTFOLIO_PRESENTATION = {
    case_study_format: {
        structure: ['Challenge', 'Approach', 'Solution', 'Results'],
        visualElement: 'Before/after mockups, results graphs',
        copyFocus: 'Specific metrics and outcomes',
    },

    visual_showcase: {
        structure: ['Hero shot', 'Device mockups', 'Detail shots'],
        visualElement: 'High-quality mockups, responsive views',
        copyFocus: 'Minimal - let visuals speak',
    },

    results_focused: {
        structure: ['Metric before', 'Metric after', 'Attribution'],
        visualElement: 'Data visualization, charts',
        copyFocus: 'Numbers and percentages prominently',
    },
};

/**
 * Client Acquisition Funnels
 */
export const ACQUISITION_FUNNELS = {
    free_audit: {
        flow: 'Ad → Free audit landing → Submit info → Audit delivery → Sales call',
        leadMagnet: 'Free website/SEO/marketing audit',
        cta: 'Get your free audit',
    },

    portfolio_browse: {
        flow: 'Ad → Portfolio → Contact form → Sales call',
        leadMagnet: 'None - portfolio IS the lead magnet',
        cta: 'See our work',
    },

    case_study: {
        flow: 'Ad → Case study download → Nurture → Sales call',
        leadMagnet: 'Detailed case study PDF',
        cta: 'See how we did it',
    },

    consultation: {
        flow: 'Ad → Direct consultation booking → Sales call',
        leadMagnet: 'Free strategy consultation',
        cta: 'Book free call',
    },
};

/**
 * Get agency service
 */
export function getAgencyService(serviceId) {
    return AGENCY_SERVICES[serviceId] || AGENCY_SERVICES.web_design;
}

/**
 * Build agency-specific prompt
 */
export function buildAgencyPrompt(service, funnelType = 'free_audit') {
    const svc = getAgencyService(service);
    const funnel = ACQUISITION_FUNNELS[funnelType];

    return `
AGENCY AD SPECIFICATIONS (${svc.name}):

VALUE PROPOSITIONS:
${svc.valueProps.map(v => `• ${v}`).join('\n')}

HEADLINE OPTIONS:
${svc.headlines.map(h => `- ${h}`).join('\n')}

PROOF POINTS TO SHOWCASE:
${svc.proofPoints.map(p => `✓ ${p}`).join('\n')}

FUNNEL: ${funnel.flow}
LEAD MAGNET: ${funnel.leadMagnet}

CTA OPTIONS:
${svc.ctas.map(c => `→ ${c}`).join('\n')}

VISUAL STYLE:
- Portfolio mockups preferred
- High-quality professional work samples
- Before/after if applicable
- Results metrics visualization
`;
}
