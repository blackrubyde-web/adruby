/**
 * Dynamic Content Generator
 * Generates headlines, CTAs, hooks based on psychology and context
 * Uses formula-based generation for consistent quality
 */

/**
 * Headline Formulas - Proven structures that convert
 */
export const HEADLINE_FORMULAS = {
    // Number-based (highest engagement)
    number_benefit: {
        pattern: '{NUMBER} {BENEFIT} in {TIME}',
        examples: ['5 ways to save time today', '3 steps to perfect skin', '10 reasons to switch'],
        bestFor: ['listicle', 'how-to', 'education'],
    },
    percentage_claim: {
        pattern: '{PERCENTAGE}% {RESULT}',
        examples: ['50% more energy', '90% less hassle', '3x faster results'],
        bestFor: ['comparison', 'improvement', 'tech'],
    },

    // Question-based (curiosity gap)
    why_question: {
        pattern: 'Why {AUDIENCE} are switching to {PRODUCT}',
        examples: ['Why 10,000 moms trust us', 'Why athletes choose this'],
        bestFor: ['social-proof', 'authority'],
    },
    how_to: {
        pattern: 'How to {ACHIEVE_GOAL} without {PAIN_POINT}',
        examples: ['How to lose weight without dieting', 'How to save money without sacrifice'],
        bestFor: ['solution', 'transformation'],
    },
    what_if: {
        pattern: 'What if you could {DREAM_OUTCOME}?',
        examples: ['What if you never had to worry about...?'],
        bestFor: ['aspirational', 'lifestyle'],
    },

    // Direct benefit
    simple_benefit: {
        pattern: '{BENEFIT}. {PROOF/DIFFERENTIATOR}.',
        examples: ['Softer skin. Naturally.', 'More energy. Zero crash.'],
        bestFor: ['minimal', 'luxury', 'clean'],
    },
    command: {
        pattern: '{VERB} your {GOAL}',
        examples: ['Transform your morning', 'Upgrade your routine', 'Unlock your potential'],
        bestFor: ['action', 'fitness', 'self-improvement'],
    },

    // Social proof
    join_others: {
        pattern: 'Join {NUMBER}+ {AUDIENCE} who {BENEFIT}',
        examples: ['Join 50,000+ happy customers', 'Join athletes who trust us'],
        bestFor: ['community', 'social-proof'],
    },
    as_seen: {
        pattern: 'As featured in {PUBLICATION}',
        examples: ['As seen on Shark Tank', 'Featured in Forbes'],
        bestFor: ['authority', 'trust'],
    },

    // Urgency
    limited_time: {
        pattern: '{OFFER} - {TIME_LIMIT} only',
        examples: ['50% off - today only', 'Free shipping ends midnight'],
        bestFor: ['sale', 'urgency', 'flash'],
    },
    last_chance: {
        pattern: 'Last chance: {OFFER}',
        examples: ['Last chance: 40% off everything'],
        bestFor: ['sale', 'urgency'],
    },

    // Contrast/Comparison
    vs_format: {
        pattern: '{OLD_WAY} vs {NEW_WAY}',
        examples: ['Before vs After', 'Old routine vs New routine'],
        bestFor: ['comparison', 'transformation', 'before-after'],
    },

    // Problem-solution
    tired_of: {
        pattern: 'Tired of {PAIN}? Try {SOLUTION}.',
        examples: ['Tired of bad sleep? Try this.'],
        bestFor: ['pain-point', 'solution'],
    },
    finally: {
        pattern: 'Finally, a {PRODUCT} that {SOLVES}',
        examples: ['Finally, a skincare that actually works'],
        bestFor: ['solution', 'relief'],
    },
};

/**
 * CTA Formulas
 */
export const CTA_FORMULAS = {
    // Benefit-focused
    get_benefit: { pattern: 'Get {BENEFIT}', examples: ['Get started', 'Get yours', 'Get the glow'] },
    discover: { pattern: 'Discover {PRODUCT/BENEFIT}', examples: ['Discover the difference'] },

    // Urgency
    shop_now: { pattern: 'Shop now', urgency: 'medium' },
    buy_today: { pattern: 'Buy today', urgency: 'high' },
    limited_offer: { pattern: 'Claim your {OFFER}', urgency: 'high' },

    // Low-friction
    learn_more: { pattern: 'Learn more', friction: 'low' },
    try_free: { pattern: 'Try free for {DAYS} days', friction: 'lowest' },
    see_how: { pattern: 'See how it works', friction: 'low' },

    // Personalized
    start_journey: { pattern: 'Start your {JOURNEY}', examples: ['Start your transformation'] },
    join_us: { pattern: 'Join {NUMBER}+ {GROUP}', examples: ['Join 10,000+ happy customers'] },
};

/**
 * Hook Formulas (first line/attention grabbers)
 */
export const HOOK_FORMULAS = {
    shock_stat: {
        pattern: 'Did you know {SHOCKING_STAT}?',
        examples: ['Did you know 73% of people fail at diets?'],
        emotion: 'surprise',
    },
    stop_scroll: {
        pattern: 'Stop scrolling if you {CONDITION}',
        examples: ['Stop scrolling if you want better skin'],
        emotion: 'direct',
    },
    secret: {
        pattern: 'The secret {EXPERTS} don\'t want you to know',
        examples: ['The secret dermatologists don\'t tell you'],
        emotion: 'curiosity',
    },
    mistake: {
        pattern: 'The {BIGGEST} mistake {AUDIENCE} make with {TOPIC}',
        examples: ['The biggest mistake people make when dieting'],
        emotion: 'fear-of-loss',
    },
    unpopular: {
        pattern: 'Unpopular opinion: {CONTRARIAN_VIEW}',
        examples: ['Unpopular opinion: You don\'t need a gym'],
        emotion: 'controversy',
    },
    this_is_why: {
        pattern: 'This is why your {THING} isn\'t working',
        examples: ['This is why your skincare isn\'t working'],
        emotion: 'problem-awareness',
    },
    imagine: {
        pattern: 'Imagine {DREAM_SCENARIO}',
        examples: ['Imagine waking up with perfect energy every day'],
        emotion: 'aspiration',
    },
};

/**
 * Generate headline based on context
 */
export function generateHeadline(options) {
    const {
        product,
        benefit,
        audience,
        goal = 'conversion',
        tone = 'professional',
        hasNumbers = false,
        hasSocialProof = false,
        isUrgent = false,
    } = options;

    // Select formula based on context
    let formulaId;

    if (isUrgent) {
        formulaId = 'limited_time';
    } else if (hasSocialProof) {
        formulaId = 'join_others';
    } else if (hasNumbers) {
        formulaId = 'number_benefit';
    } else if (goal === 'awareness') {
        formulaId = 'simple_benefit';
    } else if (goal === 'trust') {
        formulaId = 'why_question';
    } else {
        formulaId = 'simple_benefit';
    }

    const formula = HEADLINE_FORMULAS[formulaId];

    return {
        formula: formula.pattern,
        example: formula.examples[0],
        generated: formula.pattern
            .replace('{BENEFIT}', benefit || 'better results')
            .replace('{PRODUCT}', product || 'solution')
            .replace('{AUDIENCE}', audience || 'people')
            .replace('{NUMBER}', '10,000+')
            .replace('{PERCENTAGE}', '50')
            .replace('{TIME}', '7 days'),
        alternates: formula.examples,
    };
}

/**
 * Generate CTA based on context
 */
export function generateCTA(options) {
    const {
        goal = 'purchase',
        friction = 'medium',
        isUrgent = false,
        benefit,
        language = 'de',
    } = options;

    // German CTAs
    const germanCTAs = {
        high_urgency: ['Jetzt kaufen', 'Heute sichern', 'Jetzt sichern'],
        medium_urgency: ['Jetzt entdecken', 'Jetzt shoppen', 'Mehr erfahren'],
        low_friction: ['Kostenlos testen', 'Mehr erfahren', 'Jetzt informieren'],
    };

    // English CTAs
    const englishCTAs = {
        high_urgency: ['Buy now', 'Get it today', 'Claim offer'],
        medium_urgency: ['Shop now', 'Discover more', 'Learn more'],
        low_friction: ['Try free', 'See how it works', 'Get started free'],
    };

    const ctas = language === 'de' ? germanCTAs : englishCTAs;

    let ctaList;
    if (isUrgent) {
        ctaList = ctas.high_urgency;
    } else if (friction === 'low') {
        ctaList = ctas.low_friction;
    } else {
        ctaList = ctas.medium_urgency;
    }

    return {
        primary: ctaList[0],
        alternatives: ctaList,
    };
}

/**
 * Generate scroll-stopping hook
 */
export function generateHook(options) {
    const {
        pain,
        audience,
        emotion = 'curiosity',
    } = options;

    const emotionToFormula = {
        curiosity: 'secret',
        surprise: 'shock_stat',
        fear: 'mistake',
        aspiration: 'imagine',
        direct: 'stop_scroll',
    };

    const formulaId = emotionToFormula[emotion] || 'stop_scroll';
    const formula = HOOK_FORMULAS[formulaId];

    return {
        formula: formula.pattern,
        example: formula.examples[0],
        emotion: formula.emotion,
        generated: formula.pattern
            .replace('{CONDITION}', pain || 'want better results')
            .replace('{AUDIENCE}', audience || 'people')
            .replace('{TOPIC}', 'their routine')
            .replace('{THING}', 'routine'),
    };
}

/**
 * Generate full copy kit
 */
export function generateCopyKit(context) {
    const headline = generateHeadline(context);
    const cta = generateCTA(context);
    const hook = generateHook(context);

    return {
        headline,
        cta,
        hook,
        fullCopy: `${hook.generated}\n\n${headline.generated}\n\n${cta.primary}`,
    };
}
