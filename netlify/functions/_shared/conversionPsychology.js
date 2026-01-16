/**
 * Conversion Psychology Engine
 * Proven frameworks: AIDA, PAS, FAB, 4Ps, ACCA, QUEST, SLAP
 * Generates psychologically optimized copy structures
 */

/**
 * Conversion Frameworks - Each with specific application rules
 */
export const CONVERSION_FRAMEWORKS = {
    // ========================================
    // AIDA - Attention, Interest, Desire, Action
    // Best for: General purpose, awareness campaigns
    // ========================================
    aida: {
        id: 'aida',
        name: 'AIDA',
        fullName: 'Attention → Interest → Desire → Action',
        description: 'Classic funnel framework, works for most products',

        stages: {
            attention: {
                purpose: 'Stop the scroll, create curiosity',
                techniques: ['Surprising stat', 'Bold claim', 'Question', 'Contrast', 'Urgency'],
                examples: ['Did you know 73% of...?', 'Stop scrolling if you...', 'The secret nobody tells you'],
            },
            interest: {
                purpose: 'Build engagement, provide value',
                techniques: ['Storytelling', 'Problem identification', 'Intrigue', 'Data'],
                examples: ['Most people struggle with...', 'Here\'s what changed everything...'],
            },
            desire: {
                purpose: 'Make them want it emotionally',
                techniques: ['Benefits over features', 'Social proof', 'Transformation', 'FOMO'],
                examples: ['Imagine waking up to...', 'Join 10,000+ who already...'],
            },
            action: {
                purpose: 'Clear, low-friction CTA',
                techniques: ['Urgency', 'Scarcity', 'Risk removal', 'Value stacking'],
                examples: ['Start free today', 'Get 50% off - 24h only', 'Try risk-free'],
            },
        },

        headlineFormula: '{ATTENTION_HOOK} + {KEY_BENEFIT}',
        descriptionFormula: '{INTEREST} → {DESIRE} → {ACTION}',

        bestFor: ['awareness', 'consideration', 'general'],
    },

    // ========================================
    // PAS - Problem, Agitate, Solve
    // Best for: Pain-point products, solutions
    // ========================================
    pas: {
        id: 'pas',
        name: 'PAS',
        fullName: 'Problem → Agitate → Solve',
        description: 'Amplify pain, then present solution',

        stages: {
            problem: {
                purpose: 'Identify the pain point clearly',
                techniques: ['Specific scenarios', 'Relatable situations', 'Common frustrations'],
                examples: ['Tired of...?', 'Still dealing with...?', 'Frustrated by...?'],
            },
            agitate: {
                purpose: 'Make the problem feel urgent',
                techniques: ['Consequences', 'What-if scenarios', 'Emotional amplification'],
                examples: ['Every day you wait, you lose...', 'This is costing you...', 'Meanwhile, others are...'],
            },
            solve: {
                purpose: 'Present product as the perfect solution',
                techniques: ['Clear solution', 'Proof it works', 'Easy implementation'],
                examples: ['That\'s why we created...', 'The solution is simple:', 'Finally, there\'s...'],
            },
        },

        headlineFormula: '{PROBLEM}? + {SOLUTION_HINT}',
        descriptionFormula: '{PROBLEM_EXPAND} → {AGITATE} → {SOLVE_WITH_PROOF}',

        bestFor: ['pain-point', 'solutions', 'b2b', 'services'],
    },

    // ========================================
    // FAB - Features, Advantages, Benefits
    // Best for: Product-focused, tech, specs
    // ========================================
    fab: {
        id: 'fab',
        name: 'FAB',
        fullName: 'Features → Advantages → Benefits',
        description: 'Translate specs into emotional benefits',

        stages: {
            features: {
                purpose: 'State what the product has/does',
                techniques: ['Concrete specs', 'Technical details', 'Unique attributes'],
                examples: ['Made with 100% organic cotton', '50,000 mAh battery', '5nm processor'],
            },
            advantages: {
                purpose: 'Explain why that feature matters',
                techniques: ['Comparison', 'Context', 'Differentiation'],
                examples: ['3x more absorbent than regular', 'Lasts 5 days on single charge'],
            },
            benefits: {
                purpose: 'Emotional outcome for the user',
                techniques: ['Lifestyle improvement', 'Emotional payoff', 'End result'],
                examples: ['So you never worry about running out', 'Giving you peace of mind'],
            },
        },

        headlineFormula: '{FEATURE} = {BENEFIT}',
        descriptionFormula: '{FEATURE} → {ADVANTAGE} → {EMOTIONAL_BENEFIT}',

        bestFor: ['tech', 'products', 'specs-heavy', 'comparison'],
    },

    // ========================================
    // 4Ps - Picture, Promise, Prove, Push
    // Best for: Aspirational, lifestyle
    // ========================================
    fourPs: {
        id: 'fourPs',
        name: '4Ps',
        fullName: 'Picture → Promise → Prove → Push',
        description: 'Visual storytelling with proof',

        stages: {
            picture: {
                purpose: 'Paint the desired outcome visually',
                techniques: ['Vivid imagery', 'Before/after', 'Day-in-the-life'],
                examples: ['Picture yourself...', 'Imagine waking up to...', 'See yourself...'],
            },
            promise: {
                purpose: 'Make a clear commitment',
                techniques: ['Guarantee', 'Pledge', 'Commitment'],
                examples: ['We promise you\'ll...', 'Guaranteed to...', 'You will...'],
            },
            prove: {
                purpose: 'Back up the promise with evidence',
                techniques: ['Testimonials', 'Stats', 'Before/after', 'Awards'],
                examples: ['96% of customers agree...', 'Award-winning...', 'See the results...'],
            },
            push: {
                purpose: 'Drive immediate action',
                techniques: ['Urgency', 'Scarcity', 'Bonus'],
                examples: ['Act now - limited offer', 'Only X left', 'Bonus: Free shipping'],
            },
        },

        headlineFormula: '{PICTURE_OUTCOME}',
        descriptionFormula: '{PROMISE} → {PROVE} → {PUSH}',

        bestFor: ['lifestyle', 'aspirational', 'beauty', 'fitness'],
    },

    // ========================================
    // SLAP - Stop, Look, Act, Purchase
    // Best for: E-commerce, direct response
    // ========================================
    slap: {
        id: 'slap',
        name: 'SLAP',
        fullName: 'Stop → Look → Act → Purchase',
        description: 'Direct response, action-focused',

        stages: {
            stop: {
                purpose: 'Interrupt the scroll immediately',
                techniques: ['Bold visuals', 'Shocking statement', 'Contrarian'],
                examples: ['WAIT!', 'Don\'t scroll past this', 'Stop everything'],
            },
            look: {
                purpose: 'Force engagement with content',
                techniques: ['Intrigue', 'Visual interest', 'Key info'],
                examples: ['Look at what this does...', 'See the difference...'],
            },
            act: {
                purpose: 'Create urgency to act now',
                techniques: ['Timer', 'Limited quantity', 'Deadline'],
                examples: ['Sale ends at midnight', 'Only 50 left', 'Today only'],
            },
            purchase: {
                purpose: 'Remove friction to buy',
                techniques: ['Clear CTA', 'Risk reversal', 'Easy checkout'],
                examples: ['Buy now, pay later', '30-day guarantee', 'Free returns'],
            },
        },

        headlineFormula: '{STOP_HOOK} + {OFFER}',
        descriptionFormula: '{LOOK_AT_THIS} → {ACT_NOW_BECAUSE} → {PURCHASE_EASY}',

        bestFor: ['ecommerce', 'flash-sale', 'impulse', 'direct-response'],
    },

    // ========================================
    // QUEST - Qualify, Understand, Educate, Stimulate, Transition
    // Best for: High-ticket, considered purchases
    // ========================================
    quest: {
        id: 'quest',
        name: 'QUEST',
        fullName: 'Qualify → Understand → Educate → Stimulate → Transition',
        description: 'Consultative approach for complex sales',

        stages: {
            qualify: {
                purpose: 'Filter for right audience',
                techniques: ['Specific criteria', 'Self-selection', 'Exclusivity'],
                examples: ['For business owners who...', 'If you\'re serious about...', 'For those earning $100k+'],
            },
            understand: {
                purpose: 'Show you get their situation',
                techniques: ['Empathy', 'Shared experience', 'Problem knowledge'],
                examples: ['We know how frustrating it is...', 'You\'ve tried everything...'],
            },
            educate: {
                purpose: 'Provide valuable insight',
                techniques: ['New information', 'Counter-intuitive truth', 'Expert knowledge'],
                examples: ['Here\'s what most people don\'t know...', 'The real reason is...'],
            },
            stimulate: {
                purpose: 'Create excitement about solution',
                techniques: ['Possibilities', 'Vision', 'Potential'],
                examples: ['Imagine what you could do with...', 'Think about the possibilities...'],
            },
            transition: {
                purpose: 'Smooth move to next step',
                techniques: ['Soft CTA', 'Consultation', 'Learn more'],
                examples: ['Let\'s talk about how...', 'Book a free consultation', 'See if you qualify'],
            },
        },

        headlineFormula: '{QUALIFY} + {PROMISE}',
        descriptionFormula: '{UNDERSTAND} → {EDUCATE} → {STIMULATE} → {TRANSITION}',

        bestFor: ['high-ticket', 'b2b', 'consulting', 'education', 'saas'],
    },

    // ========================================
    // BAB - Before, After, Bridge
    // Best for: Transformation, coaching
    // ========================================
    bab: {
        id: 'bab',
        name: 'BAB',
        fullName: 'Before → After → Bridge',
        description: 'Simple transformation story',

        stages: {
            before: {
                purpose: 'Describe current painful state',
                techniques: ['Current reality', 'Pain points', 'Frustration'],
                examples: ['Right now, you\'re probably...', 'If you\'re like most people...'],
            },
            after: {
                purpose: 'Show the transformed state',
                techniques: ['Future vision', 'Success state', 'Dream outcome'],
                examples: ['But imagine if...', 'Picture a life where...', 'What if you could...'],
            },
            bridge: {
                purpose: 'Product is the bridge between states',
                techniques: ['Simple solution', 'Clear path', 'Easy transition'],
                examples: ['That\'s exactly what X does', 'The bridge between where you are and where you want to be'],
            },
        },

        headlineFormula: 'From {BEFORE} to {AFTER}',
        descriptionFormula: '{BEFORE_PAIN} → {AFTER_DREAM} → {BRIDGE_PRODUCT}',

        bestFor: ['transformation', 'coaching', 'fitness', 'education', 'personal-development'],
    },
};

/**
 * Get framework by ID
 */
export function getFramework(frameworkId) {
    return CONVERSION_FRAMEWORKS[frameworkId] || CONVERSION_FRAMEWORKS.aida;
}

/**
 * Recommend framework based on goal and industry
 */
export function recommendFramework(options) {
    const { goal, industry, productType, hasTestimonial, isPainPoint } = options;

    // Score each framework
    const scores = {};

    for (const [id, framework] of Object.entries(CONVERSION_FRAMEWORKS)) {
        let score = 0;

        // Goal match
        if (framework.bestFor.includes(goal)) score += 30;

        // Industry-specific preferences
        if (industry === 'fitness' && (id === 'fourPs' || id === 'bab')) score += 20;
        if (industry === 'tech' && id === 'fab') score += 25;
        if (industry === 'beauty' && id === 'fourPs') score += 20;
        if (industry === 'saas' && (id === 'quest' || id === 'pas')) score += 25;
        if (industry === 'ecommerce' && id === 'slap') score += 20;

        // Pain point products work well with PAS
        if (isPainPoint && id === 'pas') score += 30;

        // If has testimonials, 4Ps is great
        if (hasTestimonial && id === 'fourPs') score += 15;

        scores[id] = score;
    }

    // Return highest scoring
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return getFramework(sorted[0][0]);
}

/**
 * Generate copy structure from framework
 */
export function generateCopyStructure(frameworkId, inputs) {
    const framework = getFramework(frameworkId);
    const { product, audience, benefit, pain, proof } = inputs;

    const structure = {
        framework: framework.name,
        headline: framework.headlineFormula
            .replace('{ATTENTION_HOOK}', pain || 'Discover')
            .replace('{KEY_BENEFIT}', benefit || product)
            .replace('{PROBLEM}', pain || 'Struggling')
            .replace('{SOLUTION_HINT}', benefit)
            .replace('{FEATURE}', product)
            .replace('{BENEFIT}', benefit)
            .replace('{PICTURE_OUTCOME}', `Imagine ${benefit}`)
            .replace('{STOP_HOOK}', 'WAIT')
            .replace('{OFFER}', benefit)
            .replace('{QUALIFY}', `For ${audience} who`)
            .replace('{PROMISE}', benefit)
            .replace('{BEFORE}', pain)
            .replace('{AFTER}', benefit),

        sections: Object.entries(framework.stages).map(([stage, config]) => ({
            stage,
            purpose: config.purpose,
            suggestedTechniques: config.techniques,
            examples: config.examples,
        })),

        copyInstructions: `Use the ${framework.name} framework (${framework.fullName}).
Follow this structure:
${Object.entries(framework.stages).map(([stage, config]) =>
            `- ${stage.toUpperCase()}: ${config.purpose}`
        ).join('\n')}`,
    };

    return structure;
}

/**
 * Psychological Triggers - What makes people act
 */
export const PSYCHOLOGICAL_TRIGGERS = {
    scarcity: {
        name: 'Scarcity',
        description: 'Limited availability creates urgency',
        examples: ['Only 5 left', 'Limited edition', 'Selling fast'],
        usage: 'Use when stock is genuinely limited or for special editions',
    },
    urgency: {
        name: 'Urgency',
        description: 'Time pressure drives action',
        examples: ['Ends tonight', '24 hours only', 'Last chance'],
        usage: 'Use for sales, launches, or limited-time offers',
    },
    socialProof: {
        name: 'Social Proof',
        description: 'Others\' actions validate decision',
        examples: ['50,000+ happy customers', '⭐⭐⭐⭐⭐ rated', 'As seen in Forbes'],
        usage: 'Always include when available - most powerful trigger',
    },
    authority: {
        name: 'Authority',
        description: 'Expert endorsement builds trust',
        examples: ['Doctor recommended', 'Industry award winner', 'Used by professionals'],
        usage: 'Use when you have legitimate credentials or endorsements',
    },
    reciprocity: {
        name: 'Reciprocity',
        description: 'Give value first, receive action',
        examples: ['Free guide included', 'Bonus worth €50', 'Free shipping'],
        usage: 'Lead with value to create obligation to reciprocate',
    },
    likability: {
        name: 'Likability',
        description: 'People buy from those they like',
        examples: ['We\'re a family business', 'Founded by someone like you', 'Community-driven'],
        usage: 'Humanize brand, show personality and values',
    },
    commitment: {
        name: 'Commitment/Consistency',
        description: 'Small yes leads to bigger yes',
        examples: ['Free trial', 'Start with just €1', 'No commitment'],
        usage: 'Lower initial barrier to create future commitments',
    },
    fomo: {
        name: 'FOMO',
        description: 'Fear of missing out on opportunity',
        examples: ['Don\'t miss out', 'Everyone\'s talking about', 'Trending now'],
        usage: 'Show what they\'ll miss by not acting',
    },
    curiosity: {
        name: 'Curiosity Gap',
        description: 'Open loop creates need to know',
        examples: ['The secret to...', 'What nobody tells you about...', 'The one thing...'],
        usage: 'Create intrigue without giving everything away',
    },
    loss_aversion: {
        name: 'Loss Aversion',
        description: 'Fear of losing more powerful than gaining',
        examples: ['Don\'t lose your...', 'Stop wasting...', 'Every day without this costs you...'],
        usage: 'Frame benefits as avoiding loss rather than gaining',
    },
};

/**
 * Get relevant triggers for context
 */
export function getRelevantTriggers(context) {
    const { hasScarcity, hasUrgency, hasProof, isLaunch, isSale } = context;

    const triggers = [];

    if (hasScarcity) triggers.push(PSYCHOLOGICAL_TRIGGERS.scarcity);
    if (hasUrgency || isSale) triggers.push(PSYCHOLOGICAL_TRIGGERS.urgency);
    if (hasProof) triggers.push(PSYCHOLOGICAL_TRIGGERS.socialProof);
    if (isLaunch) triggers.push(PSYCHOLOGICAL_TRIGGERS.fomo);

    // Always include these high-impact triggers
    triggers.push(PSYCHOLOGICAL_TRIGGERS.curiosity);

    return triggers;
}
