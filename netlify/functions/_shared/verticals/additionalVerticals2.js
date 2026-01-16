/**
 * Additional Vertical Modules - Batch 2
 * Events, Subscription Boxes, App Downloads, Lead Magnets, Webinars
 */

// ========================================
// EVENT & TICKET INTELLIGENCE
// ========================================
export const EVENTS_TICKETS = {
    eventTypes: {
        conference: {
            headlines: [
                'The [industry] event of the year',
                'Join [X] professionals at [Event]',
                '[Date] - Lock in your spot',
                'Don\'t miss the conversation',
            ],
            urgency: ['Early bird ends [date]', 'Limited seats', 'Last year sold out'],
            proofPoints: ['Speakers', 'Sponsors', 'Past attendee quotes'],
            ctas: ['Register now', 'Get early bird', 'Save your seat'],
        },
        concert: {
            headlines: [
                '[Artist] live in [city]',
                '[Date] only',
                'The concert everyone\'s talking about',
                'Experience [Artist] live',
            ],
            urgency: ['Tickets going fast', 'VIP almost sold out', 'Don\'t miss out'],
            ctas: ['Get tickets', 'Buy now', 'Secure your spot'],
        },
        workshop: {
            headlines: [
                'Master [skill] in one day',
                'Hands-on [topic] workshop',
                'Limited to [X] participants',
                'Learn directly from [expert]',
            ],
            urgency: ['Small group - spots filling', 'Next workshop in [X] months'],
            ctas: ['Register now', 'Join workshop', 'Claim your spot'],
        },
        virtual: {
            headlines: [
                'Join from anywhere',
                'The virtual [event] you can\'t miss',
                'Live on [date]',
                '[X] countries, one event',
            ],
            urgency: ['Limited time replay', 'Live bonuses only'],
            ctas: ['Register free', 'Save your spot', 'Join live'],
        },
    },

    pricingStrategies: {
        earlyBird: 'Save [X]% before [date]',
        tiered: 'General €[X] | VIP €[Y] | Platinum €[Z]',
        lastChance: 'Final price - no more discounts',
    },
};

// ========================================
// SUBSCRIPTION BOX INTELLIGENCE
// ========================================
export const SUBSCRIPTION_BOX = {
    boxTypes: {
        beauty: {
            headlines: [
                'Discover new beauty favorites monthly',
                'Full-size products delivered',
                'Your personalized beauty box',
                'Worth €[X], yours for €[Y]',
            ],
            valueProps: ['Curated by experts', 'Full-size products', 'Value guarantee'],
            unboxingHook: 'See what you\'ll get',
        },
        food: {
            headlines: [
                'Delicious discoveries delivered',
                'Snack better every month',
                'Foodie finds at your door',
                'Taste the world from home',
            ],
            valueProps: ['Hand-selected', 'Artisan quality', 'Variety you can\'t find locally'],
        },
        lifestyle: {
            headlines: [
                'A box of happiness every month',
                'Surprise, delight, repeat',
                'The gift that keeps giving',
                'Curated just for you',
            ],
            valueProps: ['Personalized', 'Premium quality', 'Exclusive items'],
        },
        niche: {
            headlines: [
                'The [niche] box made for you',
                'Everything [hobby], delivered',
                'For [hobby] enthusiasts',
                'Your monthly [hobby] haul',
            ],
            valueProps: ['Passion-focused', 'Community-curated', 'Exclusive products'],
        },
    },

    subscriptionModels: {
        monthly: 'Cancel anytime. Skip months you don\'t need.',
        prepaid: 'Pay upfront, save more: [X]% off 3-month plan',
        gift: 'Perfect gift for the [person] in your life',
    },

    proofElements: ['Unboxing videos', 'Past box reveals', 'Subscriber reviews', 'Value comparison'],
};

// ========================================
// APP DOWNLOAD INTELLIGENCE
// ========================================
export const APP_DOWNLOAD = {
    appTypes: {
        utility: {
            headlines: [
                'The app that [solves problem]',
                'Your [task] just got easier',
                'Finally, [solution] in your pocket',
                '[X] people already use this',
            ],
            proofPoints: ['App store rating', 'Download count', 'Reviews'],
        },
        social: {
            headlines: [
                'The app everyone\'s on',
                'Connect with [audience]',
                'Join the [community]',
                'See what you\'re missing',
            ],
            urgency: ['Join now', 'Your friends are there'],
        },
        gaming: {
            headlines: [
                'The game you\'ll be addicted to',
                'Can you beat level [X]?',
                '[X]M players and counting',
                'Free to play, hard to stop',
            ],
            proofPoints: ['Player count', 'Rating', 'Awards'],
        },
        productivity: {
            headlines: [
                'Get more done with [App]',
                'The productivity hack of [year]',
                'Stop wasting time on [task]',
                'Your new favorite work tool',
            ],
            proofPoints: ['Time saved', 'Users', 'Company logos'],
        },
    },

    appStoreOptimization: {
        trustSignals: ['⭐⭐⭐⭐⭐ 4.8 rating', '[X]M downloads', 'Editor\'s choice'],
        ctas: ['Download free', 'Get the app', 'Try it now'],
        visualStyle: 'Phone mockup with app screenshot',
    },
};

// ========================================
// LEAD MAGNET INTELLIGENCE
// ========================================
export const LEAD_MAGNET = {
    magnetTypes: {
        ebook: {
            headlines: [
                'Free guide: [Topic]',
                'The complete [topic] handbook',
                'Download your free guide',
                'The [topic] blueprint - free',
            ],
            format: 'PDF guide/ebook',
            valuePerception: 'Comprehensive, educational',
        },
        checklist: {
            headlines: [
                'Free checklist: [Task]',
                'Never miss a step',
                'The [task] checklist you need',
                'Download your free checklist',
            ],
            format: 'One-page checklist',
            valuePerception: 'Quick, actionable',
        },
        template: {
            headlines: [
                'Free template: [Purpose]',
                'Done-for-you [template]',
                'Plug-and-play [template]',
                'Copy our exact [template]',
            ],
            format: 'Spreadsheet/doc template',
            valuePerception: 'Time-saving, practical',
        },
        quiz: {
            headlines: [
                'Take the [topic] quiz',
                'Find out your [type]',
                'Discover your [personality/style]',
                'What\'s your [X] score?',
            ],
            format: 'Interactive quiz',
            valuePerception: 'Personalized, engaging',
        },
        minicourse: {
            headlines: [
                'Free mini-course: [Topic]',
                'Learn [skill] in [time]',
                '5 free lessons on [topic]',
                'Start learning today - free',
            ],
            format: 'Email/video course',
            valuePerception: 'In-depth, valuable',
        },
    },

    optInPsychology: {
        valueFirst: 'Lead with what they GET',
        specificOutcome: 'Promise specific result',
        instantAccess: 'Emphasize immediate delivery',
        noRisk: 'Free, no strings attached',
    },
};

// ========================================
// WEBINAR/VSL INTELLIGENCE
// ========================================
export const WEBINAR_VSL = {
    webinarTypes: {
        educational: {
            headlines: [
                'Free training: [Topic]',
                'Learn [skill] in [X] minutes',
                'Live workshop: [Topic]',
                'Register for free training',
            ],
            structure: ['Teach', 'Case study', 'Offer'],
        },
        reveal: {
            headlines: [
                'The [secret] finally revealed',
                'What nobody tells you about [topic]',
                'The truth about [topic]',
                'Discover the [X] method',
            ],
            structure: ['Problem', 'Discovery story', 'Solution', 'Offer'],
        },
        case_study: {
            headlines: [
                'How [client] achieved [result]',
                'Inside the [result] case study',
                'See how we did it',
                'From [before] to [after]',
            ],
            structure: ['Challenge', 'Solution', 'Results', 'How you can too'],
        },
    },

    vslStructure: {
        hook: 'First 30 seconds must capture attention',
        problem: 'Agitate the pain deeply',
        solution: 'Present unique mechanism',
        proof: 'Show results and testimonials',
        offer: 'Present irresistible offer',
        urgency: 'Give reason to act now',
    },

    countdownElements: ['Starts in [time]', 'Live on [date]', 'Limited seats', 'Replay expires'],
};

/**
 * Get event type intelligence
 */
export function getEventType(typeId) {
    return EVENTS_TICKETS.eventTypes[typeId] || EVENTS_TICKETS.eventTypes.conference;
}

/**
 * Get lead magnet type
 */
export function getLeadMagnetType(typeId) {
    return LEAD_MAGNET.magnetTypes[typeId] || LEAD_MAGNET.magnetTypes.ebook;
}

/**
 * Build event prompt
 */
export function buildEventPrompt(type) {
    const t = getEventType(type);
    return `
EVENT AD (${type}):
Headlines: ${t.headlines.join(' | ')}
Urgency: ${t.urgency.join(', ')}
CTAs: ${t.ctas.join(', ')}
Visual: Event imagery, speaker photos, venue, date prominently
`;
}

/**
 * Build lead magnet prompt
 */
export function buildLeadMagnetPrompt(type) {
    const t = getLeadMagnetType(type);
    return `
LEAD MAGNET AD (${type}):
Headlines: ${t.headlines.join(' | ')}
Format: ${t.format}
Value perception: ${t.valuePerception}
Psychology: ${Object.values(LEAD_MAGNET.optInPsychology).join(', ')}
Visual: Show the lead magnet, emphasize FREE
`;
}
