/**
 * COPY TEMPLATE LIBRARY
 * 
 * Templates for every type of ad copy:
 * - Headlines by strategy
 * - Taglines by tone
 * - CTAs by goal
 * - Feature descriptions
 * - Social proof formats
 * - Urgency elements
 * - Industry-specific phrases
 */

// ========================================
// HEADLINE TEMPLATES
// ========================================

export const HEADLINE_TEMPLATES = {
    // Benefit-focused headlines
    benefit: {
        patterns: [
            'Save {time} with {product}',
            'Get {result} in {timeframe}',
            '{benefit} Made Simple',
            'The Easiest Way to {goal}',
            'Finally, {benefit} That Works',
            'Unlock Your {benefit}',
            'Achieve {goal} Faster',
            'Transform Your {area} Today',
            '{X}% More {benefit}',
            'The {adjective} Way to {goal}'
        ],
        variables: {
            time: ['hours', 'days', 'time', 'minutes'],
            result: ['results', 'growth', 'leads', 'sales'],
            benefit: ['productivity', 'efficiency', 'success', 'results'],
            goal: ['succeed', 'grow', 'scale', 'win'],
            timeframe: ['days', 'weeks', 'minutes', 'seconds'],
            area: ['workflow', 'business', 'life', 'career'],
            adjective: ['smart', 'easy', 'fast', 'proven']
        }
    },

    // Problem/Solution headlines
    problem_solution: {
        patterns: [
            'Tired of {pain_point}?',
            'Stop {negative_action}',
            'Say Goodbye to {pain_point}',
            'End {pain_point} Forever',
            'No More {pain_point}',
            '{pain_point} is Over',
            'Finally Fix {problem}',
            'The Solution to {problem}',
            'Struggling with {problem}?',
            'Done with {pain_point}?'
        ],
        variables: {
            pain_point: ['wasted time', 'manual work', 'complexity', 'frustration'],
            negative_action: ['wasting time', 'struggling', 'guessing', 'losing money'],
            problem: ['slow growth', 'inefficiency', 'complexity', 'overwhelm']
        }
    },

    // Aspirational headlines
    aspirational: {
        patterns: [
            'Become a {role}',
            'Join the {group}',
            'Be Like {aspirational_figure}',
            'The Future of {industry}',
            'Level Up Your {area}',
            'Elevate Your {area}',
            'Rise Above {limitation}',
            'Your Path to {destination}',
            'Dream. Build. Succeed.',
            'Where {area} Meets Excellence'
        ],
        variables: {
            role: ['top performer', 'leader', 'expert', 'pro'],
            group: ['elite', 'successful', 'winners', 'leaders'],
            industry: ['marketing', 'business', 'tech', 'design'],
            area: ['game', 'career', 'business', 'life'],
            limitation: ['average', 'ordinary', 'the rest', 'limits'],
            destination: ['success', 'mastery', 'freedom', 'growth']
        }
    },

    // FOMO/Urgency headlines
    urgency: {
        patterns: [
            'Limited Time: {offer}',
            'Only {number} Left',
            'Ends {timeframe}',
            'Last Chance: {offer}',
            'Don\'t Miss {opportunity}',
            '{number}+ Already Joined',
            'Exclusive {offer}',
            'Before It\'s Gone',
            'Act Now: {benefit}',
            '{number}% Off Today Only'
        ],
        variables: {
            offer: ['50% off', 'free trial', 'bonus access', 'special price'],
            number: ['24', '48', '100', '1000'],
            timeframe: ['tonight', 'tomorrow', 'Friday', 'this week'],
            opportunity: ['this', 'out', 'your chance', 'the savings']
        }
    },

    // Questions
    question: {
        patterns: [
            'Ready to {goal}?',
            'Want to {benefit}?',
            'What if you could {possibility}?',
            'Why settle for {limitation}?',
            'Struggling with {problem}?',
            'Looking for {solution}?',
            'Need {benefit} fast?',
            'Who else wants {benefit}?',
            'Can you afford not to {action}?',
            'Is your {area} working?'
        ]
    },

    // Social proof
    social_proof: {
        patterns: [
            'Trusted by {number} {users}',
            '{number}+ {users} Can\'t Be Wrong',
            'Join {number}+ {users}',
            'Rated #1 by {authority}',
            'As Seen on {platform}',
            'The Choice of {users}',
            '{number}+ Five-Star Reviews',
            'Award-Winning {product}',
            'Recommended by Experts',
            'The {users}\'s Favorite'
        ],
        variables: {
            number: ['10,000', '50,000', '100,000', '1M'],
            users: ['professionals', 'businesses', 'marketers', 'teams'],
            authority: ['TechCrunch', 'Forbes', 'experts', 'G2'],
            platform: ['ProductHunt', 'Forbes', 'TechCrunch', 'the press']
        }
    },

    // Command/Direct
    command: {
        patterns: [
            'Start {action} Today',
            'Get Your {product} Now',
            'Try {product} Free',
            'Claim Your {offer}',
            'Discover {benefit}',
            'Build Your {goal}',
            'Take Control of {area}',
            'Master {skill}',
            'Transform {area}',
            'Upgrade Your {area}'
        ]
    }
};

// ========================================
// TAGLINE TEMPLATES
// ========================================

export const TAGLINE_TEMPLATES = {
    explanatory: [
        'The {adjective} {category} for {audience}',
        '{benefit_1}, {benefit_2}, {benefit_3} — all in one place',
        'Everything you need to {goal}',
        'From {start} to {end}, we\'ve got you covered',
        'Built for {audience} who {desire}',
        'The only {category} you\'ll ever need',
        'Where {audience} go to {goal}',
        'Simple. Powerful. {adjective}.'
    ],
    emotional: [
        'Because you deserve {benefit}',
        'Your {goal} starts here',
        'Made for those who {desire}',
        'For everyone who {belief}',
        'Where dreams become {reality}',
        'The {category} that gets you',
        'Finally, {category} that works',
        'Life\'s too short for {pain_point}'
    ],
    features: [
        '{feature_1} + {feature_2} + {feature_3}',
        '10x faster {action} with AI',
        'Automation that actually works',
        'Real-time {feature} for {audience}',
        'Zero learning curve. Maximum impact.',
        'Enterprise power. Startup simplicity.',
        'Free forever, upgrade when ready',
        '{number}+ integrations. One platform.'
    ],
    stats: [
        'Join {number}+ {users} worldwide',
        'Trusted by {number}% of Fortune 500',
        '{number}x faster than {competitor}',
        'Save {number}+ hours every month',
        '{number}% increase in {metric}',
        'From $0 to ${number}M in {timeframe}',
        '{number} countries. One platform.',
        'Processing ${number}B+ annually'
    ]
};

// ========================================
// CTA TEMPLATES
// ========================================

export const CTA_TEMPLATES = {
    direct: {
        primary: ['Buy Now', 'Shop Now', 'Order Now', 'Get It Now'],
        secondary: ['Add to Cart', 'Purchase', 'Order Today', 'Get Yours']
    },
    trial: {
        primary: ['Start Free Trial', 'Try Free', 'Get Started Free', 'Start for Free'],
        secondary: ['Try It Now', 'Begin Free Trial', 'Start Free', 'Test Drive']
    },
    discovery: {
        primary: ['Learn More', 'Discover Now', 'Explore', 'See How'],
        secondary: ['Find Out More', 'See Features', 'View Demo', 'Watch Demo']
    },
    signup: {
        primary: ['Sign Up Free', 'Get Started', 'Join Now', 'Create Account'],
        secondary: ['Join Free', 'Register Now', 'Start Now', 'Begin Now']
    },
    download: {
        primary: ['Download Free', 'Get the App', 'Install Now', 'Download Now'],
        secondary: ['Get Free', 'Install Free', 'Download App', 'Get It Free']
    },
    booking: {
        primary: ['Book Now', 'Schedule Demo', 'Reserve Spot', 'Book Appointment'],
        secondary: ['Book Call', 'Get Demo', 'Schedule Call', 'Reserve Now']
    },
    exclusive: {
        primary: ['Get Early Access', 'Join Waitlist', 'Claim Access', 'Unlock Now'],
        secondary: ['Get Access', 'Apply Now', 'Request Access', 'Enter']
    },
    savings: {
        primary: ['Save 50% Now', 'Claim Discount', 'Get Deal', 'Save Today'],
        secondary: ['Use Code', 'Apply Discount', 'Redeem Offer', 'Get Savings']
    }
};

// ========================================
// INDUSTRY-SPECIFIC PHRASES
// ========================================

export const INDUSTRY_PHRASES = {
    saas: {
        headlines: [
            'Scale Without Limits',
            'Automate Everything',
            '10x Your Productivity',
            'Built for Teams'
        ],
        benefits: ['automation', 'integrations', 'collaboration', 'analytics'],
        power_words: ['scale', 'automate', 'streamline', 'optimize', 'integrate']
    },
    ecommerce: {
        headlines: [
            'Free Shipping Over $50',
            'New Arrivals',
            'Shop the Collection',
            'Limited Edition'
        ],
        benefits: ['fast shipping', 'easy returns', 'premium quality', 'exclusive'],
        power_words: ['shop', 'save', 'discover', 'exclusive', 'limited']
    },
    finance: {
        headlines: [
            'Grow Your Wealth',
            'Secure Your Future',
            'Smart Money Moves',
            'Bank Without Fees'
        ],
        benefits: ['security', 'growth', 'transparency', 'control'],
        power_words: ['secure', 'grow', 'invest', 'protect', 'earn']
    },
    health: {
        headlines: [
            'Transform Your Body',
            'Feel Your Best',
            'Unlock Your Potential',
            'Natural Results'
        ],
        benefits: ['results', 'natural', 'effective', 'trusted'],
        power_words: ['transform', 'boost', 'enhance', 'natural', 'proven']
    },
    education: {
        headlines: [
            'Learn From the Best',
            'Master New Skills',
            'Advance Your Career',
            'Knowledge is Power'
        ],
        benefits: ['expert instructors', 'certificates', 'flexible', 'practical'],
        power_words: ['master', 'learn', 'grow', 'advance', 'unlock']
    },
    travel: {
        headlines: [
            'Adventure Awaits',
            'Escape the Ordinary',
            'Discover Paradise',
            'Book Your Dream'
        ],
        benefits: ['best prices', 'exclusive deals', 'curated experiences', 'easy booking'],
        power_words: ['explore', 'discover', 'escape', 'adventure', 'experience']
    }
};

// ========================================
// SOCIAL PROOF TEMPLATES
// ========================================

export const SOCIAL_PROOF_TEMPLATES = {
    ratings: [
        '⭐⭐⭐⭐⭐ {score} ({count} reviews)',
        'Rated {score}/5 by {count}+ users',
        '{score} out of 5 stars • {count} reviews',
        '★★★★★ {count}+ five-star reviews'
    ],
    users: [
        'Trusted by {count}+ {type}',
        'Join {count}+ happy customers',
        '{count}+ {type} already love us',
        'Used by {count} businesses worldwide'
    ],
    awards: [
        '🏆 {award_name} {year}',
        'Winner: {award_name}',
        'Named "{award_name}" by {source}',
        '#1 {category} on {platform}'
    ],
    testimonial: [
        '"{quote}" — {name}, {title}',
        '\"{quote}\" — {name}',
        'As {name} says: "{quote}"'
    ]
};

// ========================================
// URGENCY TEMPLATES
// ========================================

export const URGENCY_TEMPLATES = {
    time_limited: [
        '⏰ Ends {timeframe}',
        'Only {hours} hours left',
        'Expires {date}',
        'Sale ends {timeframe}'
    ],
    quantity_limited: [
        '🔥 Only {number} left',
        '{number} remaining',
        'Almost sold out',
        'Limited stock'
    ],
    exclusive: [
        '✨ Exclusive offer',
        'VIP access only',
        'Members only',
        'Invite only'
    ],
    seasonal: [
        '🎄 Holiday Special',
        '🎉 New Year Sale',
        '💝 Valentine\'s Deal',
        '☀️ Summer Sale'
    ]
};

// ========================================
// TEMPLATE FUNCTIONS
// ========================================

/**
 * Generate headline from template
 */
export function generateHeadlineFromTemplate(strategy, variables = {}) {
    const templates = HEADLINE_TEMPLATES[strategy];
    if (!templates) return null;

    const pattern = templates.patterns[Math.floor(Math.random() * templates.patterns.length)];
    return fillTemplate(pattern, { ...templates.variables, ...variables });
}

/**
 * Generate tagline from template
 */
export function generateTaglineFromTemplate(type, variables = {}) {
    const templates = TAGLINE_TEMPLATES[type];
    if (!templates) return null;

    const pattern = templates[Math.floor(Math.random() * templates.length)];
    return fillTemplate(pattern, variables);
}

/**
 * Get CTA options for goal
 */
export function getCTAOptions(goal) {
    const templates = CTA_TEMPLATES[goal] || CTA_TEMPLATES.discovery;
    return [...templates.primary, ...templates.secondary];
}

/**
 * Get industry-specific headlines
 */
export function getIndustryHeadlines(industry) {
    return INDUSTRY_PHRASES[industry]?.headlines || INDUSTRY_PHRASES.saas.headlines;
}

/**
 * Fill template with variables
 */
function fillTemplate(template, variables) {
    let result = template;

    for (const [key, values] of Object.entries(variables)) {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        const replacement = Array.isArray(values)
            ? values[Math.floor(Math.random() * values.length)]
            : values;
        result = result.replace(regex, replacement);
    }

    return result;
}

/**
 * Generate complete copy package
 */
export function generateCopyPackage(productInfo, industry, strategy = 'benefit') {
    const industryPhrases = INDUSTRY_PHRASES[industry] || INDUSTRY_PHRASES.saas;

    return {
        headlines: {
            primary: generateHeadlineFromTemplate(strategy, productInfo),
            secondary: generateHeadlineFromTemplate('social_proof', productInfo),
            alternative: industryPhrases.headlines[0]
        },
        taglines: {
            primary: generateTaglineFromTemplate('explanatory', productInfo),
            emotional: generateTaglineFromTemplate('emotional', productInfo)
        },
        ctas: getCTAOptions('discovery'),
        socialProof: SOCIAL_PROOF_TEMPLATES.ratings[0],
        urgency: URGENCY_TEMPLATES.time_limited[0],
        powerWords: industryPhrases.power_words
    };
}

export default {
    HEADLINE_TEMPLATES,
    TAGLINE_TEMPLATES,
    CTA_TEMPLATES,
    INDUSTRY_PHRASES,
    SOCIAL_PROOF_TEMPLATES,
    URGENCY_TEMPLATES,
    generateHeadlineFromTemplate,
    generateTaglineFromTemplate,
    getCTAOptions,
    getIndustryHeadlines,
    generateCopyPackage
};
