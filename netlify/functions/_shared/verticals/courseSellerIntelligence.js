/**
 * Course Seller & Digital Product Intelligence Module
 * Value stacking, launch strategies, enrollment psychology
 */

/**
 * Course Types with specific strategies
 */
export const COURSE_TYPES = {
    // ========================================
    // SIGNATURE COURSE (High-ticket)
    // ========================================
    signature_course: {
        id: 'signature_course',
        name: 'Signature Course',
        priceRange: '€500 - €5,000+',
        description: 'Comprehensive transformation program',

        valueStack: {
            core: 'Complete video curriculum',
            bonuses: ['Templates', 'Workbooks', 'Community', 'Coaching calls', 'Lifetime access'],
            urgency: ['Enrollment deadline', 'Limited spots', 'Price increase'],
        },

        headlines: [
            'The complete [topic] system',
            'From [beginner] to [expert] in [X] weeks',
            'Everything you need to [achieve goal]',
            'The last [topic] course you\'ll ever need',
        ],

        proofElements: [
            'Student success stories',
            'Completion rates',
            'Results achieved',
            'Industry recognition',
        ],

        launchStrategy: 'Launch model with open/close cart',
        ctas: ['Enroll now', 'Join the program', 'Get instant access', 'Start today'],
    },

    // ========================================
    // MINI COURSE (Low-ticket tripwire)
    // ========================================
    mini_course: {
        id: 'mini_course',
        name: 'Mini Course',
        priceRange: '€27 - €97',
        description: 'Quick-win focused course',

        valueStack: {
            core: 'Focused module on specific outcome',
            bonuses: ['Quick-start guide', 'Template', 'Checklist'],
            urgency: ['Limited-time price', 'Bonus expiring'],
        },

        headlines: [
            'Learn [specific skill] in [short time]',
            '[Quick win] in just [X] hours',
            'The [topic] crash course',
            'Fast-track your [skill]',
        ],

        launchStrategy: 'Evergreen or flash sale',
        ctas: ['Get instant access', 'Start learning', 'Buy now', 'Yes, I want this'],
    },

    // ========================================
    // MEMBERSHIP / SUBSCRIPTION
    // ========================================
    membership: {
        id: 'membership',
        name: 'Membership Site',
        priceRange: '€27 - €297/month',
        description: 'Ongoing access and community',

        valueStack: {
            core: 'Monthly content, community access',
            bonuses: ['Live calls', 'Resource library', 'Networking', 'Exclusive content'],
            retention: ['New content monthly', 'Community value', 'Ongoing support'],
        },

        headlines: [
            'Join [X] members getting [benefit]',
            'Your monthly dose of [value]',
            'The community that [achieves X]',
            'Never stop growing',
        ],

        launchStrategy: 'Evergreen or periodic open enrollment',
        ctas: ['Join the community', 'Become a member', 'Start your membership', 'Join now'],
    },

    // ========================================
    // CERTIFICATION PROGRAM
    // ========================================
    certification: {
        id: 'certification',
        name: 'Certification Program',
        priceRange: '€1,000 - €10,000+',
        description: 'Professional credential program',

        valueStack: {
            core: 'Comprehensive training + certification',
            bonuses: ['Done-for-you materials', 'Marketing support', 'Alumni network', 'Mentorship'],
            outcome: 'Recognized credential, new income stream',
        },

        headlines: [
            'Become a certified [credential]',
            'Add [skill] to your professional toolkit',
            'The credential that opens doors',
            'Turn your expertise into income',
        ],

        proofElements: [
            'Alumni success',
            'Industry recognition',
            'Employment/income outcomes',
        ],

        launchStrategy: 'Application-based enrollment',
        ctas: ['Apply now', 'Download syllabus', 'Book info call', 'Start certification'],
    },

    // ========================================
    // DIGITAL PRODUCT (Templates, tools)
    // ========================================
    digital_product: {
        id: 'digital_product',
        name: 'Digital Product',
        priceRange: '€9 - €297',
        description: 'Templates, tools, resources',

        valueStack: {
            core: 'Instantly usable digital asset',
            bonuses: ['Video tutorial', 'Customization guide', 'Updates'],
            urgency: ['Launch price', 'Bundle discount'],
        },

        headlines: [
            'Done-for-you [product]',
            'Stop starting from scratch',
            'The [product] that saves [X] hours',
            'Just plug and play',
        ],

        launchStrategy: 'Evergreen',
        ctas: ['Get instant access', 'Download now', 'Buy now', 'Add to cart'],
    },
};

/**
 * Launch Strategies
 */
export const LAUNCH_STRATEGIES = {
    live_launch: {
        name: 'Live Launch',
        phases: ['Pre-launch hype', 'Cart open', 'Mid-launch push', 'Cart close urgency'],
        urgencyTactics: ['Doors close [date]', 'Bonuses expire', 'Price increases'],
        bestFor: ['Signature courses', 'High-ticket programs'],
    },

    evergreen: {
        name: 'Evergreen Funnel',
        phases: ['Ad → Opt-in → Nurture → Deadline'],
        urgencyTactics: ['Personal deadline', 'Limited-time offer', 'Expiring bonus'],
        bestFor: ['Mini courses', 'Digital products', 'Memberships'],
    },

    challenge_launch: {
        name: 'Challenge Launch',
        phases: ['Challenge registration', 'Daily content', 'Day 5 offer', 'Extended deadline'],
        urgencyTactics: ['Challenge ends', 'Special challenge pricing', 'Bonuses for participants'],
        bestFor: ['Courses requiring transformation preview'],
    },

    webinar_launch: {
        name: 'Webinar Launch',
        phases: ['Registration', 'Attend', 'Offer reveal', 'Fast-action bonus'],
        urgencyTactics: ['Limited seats', 'Live-only bonus', 'Replay expires'],
        bestFor: ['Mid to high-ticket courses'],
    },
};

/**
 * Value Stacking Formula
 */
export const VALUE_STACK_FORMULA = {
    core: { purpose: 'Main deliverable', anchor: true },
    bonus1: { purpose: 'Accelerate results', value: '€[X] value' },
    bonus2: { purpose: 'Remove obstacle', value: '€[X] value' },
    bonus3: { purpose: 'Add convenience', value: '€[X] value' },
    total: { purpose: 'Show total value vs price', example: 'Total value: €5,000 → Today: €997' },
};

/**
 * Course Enrollment Psychology
 */
export const ENROLLMENT_PSYCHOLOGY = {
    objections: {
        'no time': 'Just [X] minutes/day. Lifetime access, go at your pace.',
        'no money': 'Payment plans available. Investment in yourself.',
        'not sure it works': 'Guarantee. Student results. Risk-free.',
        'can find free': 'Free info is scattered. This is the system.',
        'done before': 'This is different because [unique mechanism].',
    },

    triggers: {
        scarcity: 'Limited enrollment periods',
        urgency: 'Price increases, bonuses expire',
        authority: 'Instructor credentials, results',
        social_proof: 'Student count, testimonials, results',
        reciprocity: 'Free value given in launch content',
    },
};

/**
 * Get course type intelligence
 */
export function getCourseType(typeId) {
    return COURSE_TYPES[typeId] || COURSE_TYPES.signature_course;
}

/**
 * Build course seller specific prompt
 */
export function buildCoursePrompt(type, launchType = 'live_launch') {
    const course = getCourseType(type);
    const launch = LAUNCH_STRATEGIES[launchType];

    return `
COURSE SELLER AD SPECIFICATIONS (${course.name}):

PRICE RANGE: ${course.priceRange}
DESCRIPTION: ${course.description}

VALUE STACK:
- Core: ${course.valueStack.core}
- Bonuses: ${course.valueStack.bonuses?.join(', ')}
- Urgency: ${course.valueStack.urgency?.join(', ') || 'Launch-based'}

HEADLINE OPTIONS:
${course.headlines.map(h => `- ${h}`).join('\n')}

LAUNCH STRATEGY: ${launch.name}
PHASES: ${launch.phases.join(' → ')}

URGENCY TACTICS:
${launch.urgencyTactics.map(u => `⚡ ${u}`).join('\n')}

CTA OPTIONS:
${course.ctas.map(c => `→ ${c}`).join('\n')}

VISUAL STYLE:
- Show course interface/materials
- Instructor authority
- Student success
- Value visualization
`;
}
