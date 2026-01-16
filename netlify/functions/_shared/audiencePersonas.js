/**
 * Audience Persona Intelligence System
 * Demographics, psychographics, behavior patterns
 * Creates hyper-targeted ad strategies for any audience
 */

/**
 * Pre-built Audience Personas with deep intelligence
 */
export const AUDIENCE_PERSONAS = {
    // ========================================
    // BUSY PROFESSIONALS
    // ========================================
    busy_professional: {
        id: 'busy_professional',
        name: 'Busy Professional',
        nameDE: 'Beschäftigter Berufstätiger',

        demographics: {
            ageRange: '28-45',
            income: 'middle-to-high',
            education: 'university',
            location: 'urban',
            occupation: 'white-collar professional',
        },

        psychographics: {
            values: ['efficiency', 'quality', 'status', 'work-life balance'],
            lifestyle: 'Fast-paced, goal-oriented, values time over money',
            personality: 'Ambitious, practical, results-driven',
            aspirations: ['career success', 'financial freedom', 'quality time with family'],
        },

        behavior: {
            shoppingHabits: 'Research-driven, values reviews, willing to pay for quality',
            deviceUsage: 'Mobile during commute, desktop at work',
            contentPreferences: 'Quick, scannable, value-dense',
            scrollingTime: 'Morning commute (7-9am), lunch (12-1pm), evening (8-10pm)',
        },

        painPoints: [
            'Not enough time',
            'Overwhelmed by choices',
            'Stress and burnout',
            'Missing important moments with family',
        ],

        desires: [
            'Work smarter, not harder',
            'Premium without compromise',
            'Simplify complex decisions',
            'More quality time',
        ],

        messageAngle: 'Efficiency + Premium Quality',
        headlines: [
            'Save {X} hours every week',
            'The smart choice for busy professionals',
            'Premium quality, zero hassle',
            'Because your time is worth more',
        ],

        triggers: ['authority', 'socialProof', 'commitment'],
        layouts: ['minimal_icons_grid', 'checklist_benefits', 'stats_infographic'],
    },

    // ========================================
    // HEALTH-CONSCIOUS MILLENNIAL
    // ========================================
    health_conscious: {
        id: 'health_conscious',
        name: 'Health-Conscious Millennial',
        nameDE: 'Gesundheitsbewusster Millennial',

        demographics: {
            ageRange: '25-38',
            income: 'middle',
            education: 'university',
            location: 'urban/suburban',
            occupation: 'varied',
        },

        psychographics: {
            values: ['wellness', 'sustainability', 'authenticity', 'self-improvement'],
            lifestyle: 'Active, mindful, community-oriented',
            personality: 'Curious, values-driven, socially aware',
            aspirations: ['optimal health', 'sustainable living', 'authentic experiences'],
        },

        behavior: {
            shoppingHabits: 'Label-reader, ingredient-conscious, brand-loyal',
            deviceUsage: 'Mobile-first, heavy Instagram user',
            contentPreferences: 'Educational, transparent, user-generated',
            scrollingTime: 'Early morning (6-8am), post-workout, evening wind-down',
        },

        painPoints: [
            'Hard to find truly healthy options',
            'Greenwashing and fake claims',
            'Expensive healthy alternatives',
            'Information overload',
        ],

        desires: [
            'Clean, simple ingredients',
            'Transparency and honesty',
            'Support ethical brands',
            'Feel good inside and out',
        ],

        messageAngle: 'Authentic + Clean + Transparent',
        headlines: [
            '100% clean ingredients. Zero compromises.',
            'Finally, a brand you can trust',
            'Made for bodies that deserve better',
            'Transparency in every ingredient',
        ],

        triggers: ['authority', 'reciprocity', 'likability'],
        layouts: ['ingredient_showcase', 'testimonial_quote', 'checklist_benefits'],
    },

    // ========================================
    // BUDGET-CONSCIOUS PARENT
    // ========================================
    budget_parent: {
        id: 'budget_parent',
        name: 'Budget-Conscious Parent',
        nameDE: 'Preisbewusster Elternteil',

        demographics: {
            ageRange: '28-45',
            income: 'middle',
            education: 'varied',
            location: 'suburban',
            occupation: 'varied',
            familyStatus: 'parent of young children',
        },

        psychographics: {
            values: ['family', 'security', 'value for money', 'practicality'],
            lifestyle: 'Family-centered, practical, planning-oriented',
            personality: 'Protective, practical, value-conscious',
            aspirations: ['best for children', 'financial stability', 'happy family life'],
        },

        behavior: {
            shoppingHabits: 'Price-comparison, coupon-user, bulk-buyer',
            deviceUsage: 'Mobile during kids\' activities, evening shopping',
            contentPreferences: 'Practical tips, savings, family content',
            scrollingTime: 'Kids\' nap time, after bedtime (8-11pm)',
        },

        painPoints: [
            'Everything for kids is expensive',
            'Never enough time or money',
            'Guilt about not providing the best',
            'Overwhelmed by parenting choices',
        ],

        desires: [
            'Best value for money',
            'Safe and quality for family',
            'Simplify family life',
            'Be a great parent without breaking bank',
        ],

        messageAngle: 'Quality + Affordability + Family',
        headlines: [
            'Premium quality at family-friendly prices',
            'Because your family deserves the best (without the price tag)',
            'Smart parents choose [Product]',
            'Save money without compromising quality',
        ],

        triggers: ['scarcity', 'loss_aversion', 'socialProof'],
        layouts: ['comparison_split', 'bundle_deal', 'flash_sale_timer'],
    },

    // ========================================
    // GEN Z TREND FOLLOWER
    // ========================================
    gen_z_trendy: {
        id: 'gen_z_trendy',
        name: 'Gen Z Trend Follower',
        nameDE: 'Gen Z Trendsetter',

        demographics: {
            ageRange: '16-26',
            income: 'entry-level or student',
            education: 'in-progress or recent graduate',
            location: 'urban',
        },

        psychographics: {
            values: ['authenticity', 'self-expression', 'inclusivity', 'sustainability'],
            lifestyle: 'Digital native, trend-aware, community-driven',
            personality: 'Expressive, socially conscious, skeptical of brands',
            aspirations: ['stand out', 'be authentic', 'make impact'],
        },

        behavior: {
            shoppingHabits: 'Influenced by TikTok/Instagram, impulsive, values aesthetics',
            deviceUsage: 'Mobile only, short attention span',
            contentPreferences: 'Short-form video, memes, UGC, authentic',
            scrollingTime: 'Throughout day, peak evening',
        },

        painPoints: [
            'Inauthentic brands and advertising',
            'FOMO on trends',
            'Limited budget',
            'Boring, corporate messaging',
        ],

        desires: [
            'Be unique but on-trend',
            'Support brands with values',
            'Aesthetic everything',
            'Share-worthy products',
        ],

        messageAngle: 'Trendy + Authentic + Aesthetic',
        headlines: [
            'The only [X] you\'ll want in your feed',
            'Main character energy tbh',
            'Your friends will ask where you got it',
            'It\'s giving [benefit]',
        ],

        triggers: ['fomo', 'socialProof', 'curiosity'],
        layouts: ['ugc_authentic', 'collage_mood', 'floating_particles'],
    },

    // ========================================
    // LUXURY SEEKER
    // ========================================
    luxury_seeker: {
        id: 'luxury_seeker',
        name: 'Luxury Seeker',
        nameDE: 'Luxus-Liebhaber',

        demographics: {
            ageRange: '35-60',
            income: 'high',
            education: 'university+',
            location: 'urban affluent areas',
        },

        psychographics: {
            values: ['quality', 'exclusivity', 'status', 'craftsmanship'],
            lifestyle: 'Sophisticated, discerning, experience-focused',
            personality: 'Confident, selective, appreciates finer things',
            aspirations: ['best quality', 'unique experiences', 'recognition'],
        },

        behavior: {
            shoppingHabits: 'Quality over price, brand-loyal, research-driven',
            deviceUsage: 'Multi-device, prefers premium experiences',
            contentPreferences: 'High-quality visuals, exclusive access, stories',
            scrollingTime: 'Less frequent but focused',
        },

        painPoints: [
            'Mass-market doesn\'t meet standards',
            'Finding truly premium products',
            'Time wasted on subpar options',
        ],

        desires: [
            'Exceptional quality',
            'Exclusive access',
            'Recognition of taste',
            'Timeless over trendy',
        ],

        messageAngle: 'Exclusivity + Craftsmanship + Status',
        headlines: [
            'For those who accept nothing less',
            'Crafted for the discerning few',
            'Luxury redefined',
            'The ultimate expression of [quality]',
        ],

        triggers: ['scarcity', 'authority', 'socialProof'],
        layouts: ['minimal_icons_grid', 'magazine_editorial', 'hero_with_badge'],
    },

    // ========================================
    // SMALL BUSINESS OWNER
    // ========================================
    small_business: {
        id: 'small_business',
        name: 'Small Business Owner',
        nameDE: 'Kleinunternehmer',

        demographics: {
            ageRange: '30-55',
            income: 'variable (business dependent)',
            education: 'varied',
            location: 'varied',
        },

        psychographics: {
            values: ['independence', 'growth', 'efficiency', 'ROI'],
            lifestyle: 'Busy, wear many hats, always learning',
            personality: 'Entrepreneurial, risk-taker, determined',
            aspirations: ['business growth', 'freedom', 'success'],
        },

        behavior: {
            shoppingHabits: 'ROI-focused, needs proof it works, quick decisions',
            deviceUsage: 'Mobile for quick tasks, desktop for research',
            contentPreferences: 'Case studies, ROI proof, how-to content',
            scrollingTime: 'Whenever possible, often late night',
        },

        painPoints: [
            'Limited budget and time',
            'Too many tools and platforms',
            'Overwhelmed by growth demands',
            'Can\'t afford to make mistakes',
        ],

        desires: [
            'Grow revenue without more work',
            'Tools that actually work',
            'Beat the competition',
            'More time for what matters',
        ],

        messageAngle: 'ROI + Simplicity + Growth',
        headlines: [
            'The tool that pays for itself in [X] days',
            'Your unfair advantage over competitors',
            'Scale your business without scaling stress',
            '[X]% increase in [metric] - guaranteed',
        ],

        triggers: ['loss_aversion', 'socialProof', 'commitment'],
        layouts: ['stats_infographic', 'testimonial_quote', 'comparison_split'],
    },

    // ========================================
    // FITNESS ENTHUSIAST
    // ========================================
    fitness_enthusiast: {
        id: 'fitness_enthusiast',
        name: 'Fitness Enthusiast',
        nameDE: 'Fitness-Enthusiast',

        demographics: {
            ageRange: '20-45',
            income: 'middle-to-high',
            education: 'varied',
            location: 'urban/suburban',
        },

        psychographics: {
            values: ['health', 'discipline', 'self-improvement', 'performance'],
            lifestyle: 'Active, routine-driven, goal-setting',
            personality: 'Motivated, disciplined, competitive with self',
            aspirations: ['peak performance', 'best body', 'health longevity'],
        },

        behavior: {
            shoppingHabits: 'Performance-focused, reads reviews, follows influencers',
            deviceUsage: 'Mobile for quick info, desktop for research',
            contentPreferences: 'Results, science-backed, transformations',
            scrollingTime: 'Post-workout, meal prep time, evenings',
        },

        painPoints: [
            'Plateaus in progress',
            'Too many conflicting advice',
            'Finding products that actually work',
            'Balancing fitness with life',
        ],

        desires: [
            'Better results faster',
            'Edge over others',
            'Science-backed solutions',
            'Sustainable performance',
        ],

        messageAngle: 'Performance + Results + Science',
        headlines: [
            'Unlock your next level',
            'Results that speak louder than claims',
            'Built for athletes who demand more',
            'The difference between good and great',
        ],

        triggers: ['socialProof', 'fomo', 'authority'],
        layouts: ['comparison_split', 'stats_infographic', 'testimonial_quote'],
    },

    // ========================================
    // ECO-CONSCIOUS CONSUMER
    // ========================================
    eco_conscious: {
        id: 'eco_conscious',
        name: 'Eco-Conscious Consumer',
        nameDE: 'Umweltbewusster Konsument',

        demographics: {
            ageRange: '22-45',
            income: 'middle',
            education: 'university',
            location: 'urban',
        },

        psychographics: {
            values: ['sustainability', 'ethics', 'future generations', 'responsibility'],
            lifestyle: 'Mindful consumption, reduce-reuse-recycle, activist',
            personality: 'Thoughtful, values-driven, long-term thinker',
            aspirations: ['planet preservation', 'ethical living', 'positive impact'],
        },

        behavior: {
            shoppingHabits: 'Brand values matter, checks certifications, pays premium for ethical',
            deviceUsage: 'Mobile-first, social media for causes',
            contentPreferences: 'Transparency, impact metrics, behind-the-scenes',
            scrollingTime: 'Varied, engaged with cause content',
        },

        painPoints: [
            'Greenwashing everywhere',
            'Hard to verify claims',
            'Eco options often expensive',
            'Feeling eco-efforts aren\'t enough',
        ],

        desires: [
            'Make real positive impact',
            'Trust brand claims',
            'Affordable sustainable options',
            'Be part of solution',
        ],

        messageAngle: 'Impact + Transparency + Planet',
        headlines: [
            'Good for you. Better for the planet.',
            'Sustainability without compromise',
            'Join [X] people making a difference',
            'Transparent from source to shelf',
        ],

        triggers: ['reciprocity', 'socialProof', 'commitment'],
        layouts: ['feature_callout_arrows', 'stats_infographic', 'testimonial_quote'],
    },
};

/**
 * Get persona by ID
 */
export function getPersona(personaId) {
    return AUDIENCE_PERSONAS[personaId] || null;
}

/**
 * Get all personas
 */
export function getAllPersonas() {
    return Object.values(AUDIENCE_PERSONAS);
}

/**
 * Detect persona from audience description
 */
export function detectPersona(audienceDescription) {
    const desc = (audienceDescription || '').toLowerCase();

    const personaKeywords = {
        busy_professional: ['professional', 'business', 'executive', 'manager', 'busy', 'career'],
        health_conscious: ['health', 'wellness', 'organic', 'fitness', 'yoga', 'vegan', 'healthy'],
        budget_parent: ['parent', 'mom', 'dad', 'family', 'kids', 'children', 'budget', 'value'],
        gen_z_trendy: ['gen z', 'young', 'trendy', 'tiktok', 'student', 'teen', 'aesthetic'],
        luxury_seeker: ['luxury', 'premium', 'high-end', 'affluent', 'exclusive', 'wealthy'],
        small_business: ['business owner', 'entrepreneur', 'startup', 'small business', 'founder'],
        fitness_enthusiast: ['fitness', 'gym', 'athlete', 'workout', 'training', 'sports', 'muscle'],
        eco_conscious: ['eco', 'sustainable', 'green', 'environment', 'planet', 'ethical', 'conscious'],
    };

    for (const [personaId, keywords] of Object.entries(personaKeywords)) {
        for (const keyword of keywords) {
            if (desc.includes(keyword)) {
                return getPersona(personaId);
            }
        }
    }

    return null; // No match - will use generic approach
}

/**
 * Build audience-optimized prompt section
 */
export function buildAudiencePrompt(persona) {
    if (!persona) return '';

    return `
TARGET AUDIENCE INTELLIGENCE:
- Primary Persona: ${persona.name}
- Age Range: ${persona.demographics.ageRange}
- Income Level: ${persona.demographics.income}
- Core Values: ${persona.psychographics.values.join(', ')}
- Key Pain Points: ${persona.painPoints.slice(0, 2).join('; ')}
- Core Desires: ${persona.desires.slice(0, 2).join('; ')}
- Message Angle: ${persona.messageAngle}
- Psychological Triggers: ${persona.triggers.join(', ')}

COPY MUST:
- Address their specific pain points
- Speak to their values (${persona.psychographics.values[0]}, ${persona.psychographics.values[1]})
- Use visuals that resonate with ${persona.psychographics.lifestyle}
`;
}
