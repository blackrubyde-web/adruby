/**
 * Coaching & Consulting Intelligence Module
 * Authority building, transformation focus, high-ticket strategies
 */

/**
 * Coaching Niches with specific strategies
 */
export const COACHING_NICHES = {
    business_coach: {
        id: 'business_coach',
        name: 'Business Coaching',

        targetAudience: 'Entrepreneurs, business owners, executives',

        transformationPromise: {
            from: 'Struggling with growth, overwhelmed, stuck at revenue plateau',
            to: 'Scaling confidently, systemized business, breakthrough revenue',
        },

        headlines: [
            'From [current state] to [desired state] in [timeframe]',
            'The framework that took me from €0 to €[X]M',
            'Stop trading hours for euros',
            'The business system €[X]M founders use',
        ],

        authoritySignals: [
            'Helped [X] businesses scale to [Y]',
            'Former [impressive title]',
            'Featured in [publications]',
            '[X] years building businesses',
        ],

        proofElements: [
            'Client revenue results',
            'Before/after case studies',
            'Testimonial videos',
            'Screenshot results',
        ],

        ctas: ['Book discovery call', 'Apply now', 'Watch free training', 'Get the framework'],
    },

    life_coach: {
        id: 'life_coach',
        name: 'Life Coaching',

        targetAudience: 'Individuals seeking personal transformation',

        transformationPromise: {
            from: 'Feeling stuck, unfulfilled, anxious, unclear',
            to: 'Living purposefully, confident, peaceful, aligned',
        },

        headlines: [
            'Finally feel like yourself again',
            'From surviving to thriving',
            'The breakthrough you\'ve been waiting for',
            'What would your life look like if...',
        ],

        authoritySignals: [
            'Certified [credential]',
            'Helped [X] clients transform',
            'Trained under [known expert]',
            '[X] years of practice',
        ],

        ctas: ['Book free session', 'Start your journey', 'Take the quiz', 'Apply for coaching'],
    },

    fitness_coach: {
        id: 'fitness_coach',
        name: 'Fitness Coaching',

        targetAudience: 'People seeking physical transformation',

        transformationPromise: {
            from: 'Out of shape, low energy, frustrated with failed diets',
            to: 'Strong, energetic, confident in your body',
        },

        headlines: [
            'The program that transformed [X] bodies',
            'Results in [X] weeks or your money back',
            'No gym required. No diet pills. Just results.',
            'From [before weight] to [after weight] in [time]',
        ],

        authoritySignals: [
            'Certified [credential]',
            '[X] transformations completed',
            'Former [athletic achievement]',
            'Science-backed methods',
        ],

        proofElements: [
            'Before/after photos',
            'Client testimonials',
            'Progress tracking',
            'Video transformations',
        ],

        ctas: ['Start free challenge', 'Get your plan', 'Join now', 'Take assessment'],
    },

    career_coach: {
        id: 'career_coach',
        name: 'Career Coaching',

        targetAudience: 'Professionals seeking career change or advancement',

        transformationPromise: {
            from: 'Stuck in job, underpaid, unfulfilled at work',
            to: 'Dream role, salary increase, career fulfillment',
        },

        headlines: [
            'Land your dream job in [X] weeks',
            'My clients average [X]% salary increase',
            'From stuck to senior in [timeframe]',
            'The career pivot that changed everything',
        ],

        authoritySignals: [
            'Former [impressive company] recruiter/manager',
            'Helped [X] professionals land dream jobs',
            'Clients at [impressive companies]',
        ],

        ctas: ['Book career call', 'Get free resume review', 'Join the program', 'Apply now'],
    },

    relationship_coach: {
        id: 'relationship_coach',
        name: 'Relationship Coaching',

        targetAudience: 'Individuals or couples seeking relationship help',

        transformationPromise: {
            from: 'Struggling relationships, loneliness, communication issues',
            to: 'Deep connection, healthy communication, lasting love',
        },

        headlines: [
            'Save your relationship before it\'s too late',
            'Finally understand what [he/she] really wants',
            'The communication secret that changes everything',
            'From conflict to connection',
        ],

        ctas: ['Take the quiz', 'Book session', 'Get free guide', 'Start healing'],
    },
};

/**
 * High-Ticket Sales Strategies
 */
export const HIGH_TICKET_STRATEGIES = {
    application_funnel: {
        name: 'Application Funnel',
        flow: 'Ad → Application → Qualification → Sales call → Close',
        headlines: ['Apply now', 'Limited spots available', 'See if you qualify'],
        purpose: 'Filter for qualified, committed leads',
    },

    webinar_funnel: {
        name: 'Webinar Funnel',
        flow: 'Ad → Webinar registration → Attend → Offer → Close',
        headlines: ['Free training', 'Live workshop', 'Exclusive masterclass'],
        purpose: 'Build authority and present offer to warm audience',
    },

    vsl_funnel: {
        name: 'Video Sales Letter',
        flow: 'Ad → VSL page → Application → Sales call → Close',
        headlines: ['Watch this video', 'See how [result]', 'Free training reveals'],
        purpose: 'Pre-sell with video content',
    },

    challenge_funnel: {
        name: 'Challenge Funnel',
        flow: 'Ad → Free challenge → Deliver value → Offer → Close',
        headlines: ['Free [X]-day challenge', 'Join the challenge', 'Transform in [X] days'],
        purpose: 'Deliver value, build relationship, then offer',
    },

    book_funnel: {
        name: 'Book Funnel',
        flow: 'Ad → Free book (pay shipping) → Upsell → Nurture → High-ticket offer',
        headlines: ['Free book', 'Get your copy', 'Just pay shipping'],
        purpose: 'Low commitment entry, ascend later',
    },
};

/**
 * Authority Building Elements
 */
export const AUTHORITY_ELEMENTS = {
    credentials: ['Certifications', 'Degrees', 'Training', 'Accreditations'],
    experience: ['Years in field', 'Clients helped', 'Revenue generated', 'Problems solved'],
    media: ['Podcast appearances', 'Publications', 'Speaking events', 'Press mentions'],
    results: ['Client outcomes', 'Case studies', 'Testimonials', 'Before/after'],
    social: ['Followers', 'Community size', 'Engagement', 'Reputation'],
};

/**
 * Get coaching niche intelligence
 */
export function getCoachingNiche(nicheId) {
    return COACHING_NICHES[nicheId] || COACHING_NICHES.business_coach;
}

/**
 * Build coaching-specific prompt
 */
export function buildCoachingPrompt(niche, funnelType = 'application_funnel') {
    const n = getCoachingNiche(niche);
    const funnel = HIGH_TICKET_STRATEGIES[funnelType];

    return `
COACHING AD SPECIFICATIONS (${n.name}):

TARGET AUDIENCE: ${n.targetAudience}

TRANSFORMATION PROMISE:
FROM: ${n.transformationPromise.from}
TO: ${n.transformationPromise.to}

HEADLINE OPTIONS:
${n.headlines.map(h => `- ${h}`).join('\n')}

AUTHORITY SIGNALS:
${n.authoritySignals.map(a => `★ ${a}`).join('\n')}

PROOF ELEMENTS TO INCLUDE:
${(n.proofElements || ['Testimonials', 'Results', 'Case studies']).map(p => `✓ ${p}`).join('\n')}

FUNNEL TYPE: ${funnel.name}
FLOW: ${funnel.flow}

CTA OPTIONS:
${n.ctas.map(c => `→ ${c}`).join('\n')}

VISUAL STYLE:
- Coach as authority figure
- Client success imagery
- Professional yet approachable
- Transformation visualization
`;
}
