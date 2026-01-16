/**
 * Brand Voice Engine
 * Consistent tone, vocabulary, and personality across all ads
 * Ensures brand consistency and recognition
 */

/**
 * Brand Voice Archetypes
 */
export const BRAND_ARCHETYPES = {
    // The Sage (wisdom, expertise)
    sage: {
        id: 'sage',
        name: 'The Sage',
        description: 'Expert, knowledgeable, educational',

        personality: {
            traits: ['wise', 'trustworthy', 'analytical', 'thoughtful'],
            tone: 'Authoritative yet approachable, educational',
            approach: 'Teach and inform, provide valuable insights',
        },

        vocabulary: {
            use: ['discover', 'understand', 'learn', 'proven', 'research-backed', 'expert', 'insights'],
            avoid: ['crazy', 'lit', 'OMG', 'slang', 'hype'],
        },

        copyStyle: {
            sentenceLength: 'medium-to-long',
            punctuation: 'Minimal exclamation marks',
            formatting: 'Clean, organized, structured',
        },

        visualStyle: 'Clean, minimal, professional, trustworthy colors (blues, whites)',

        industries: ['education', 'health', 'saas', 'consulting', 'finance'],
    },

    // The Creator (innovation, artistry)
    creator: {
        id: 'creator',
        name: 'The Creator',
        description: 'Innovative, artistic, expressive',

        personality: {
            traits: ['creative', 'imaginative', 'expressive', 'original'],
            tone: 'Inspiring, artistic, visionary',
            approach: 'Spark imagination, celebrate creativity',
        },

        vocabulary: {
            use: ['create', 'design', 'imagine', 'inspire', 'vision', 'original', 'craft'],
            avoid: ['boring', 'ordinary', 'standard', 'basic'],
        },

        copyStyle: {
            sentenceLength: 'varied',
            punctuation: 'Creative use, em-dashes, ellipses',
            formatting: 'Artistic, unconventional',
        },

        visualStyle: 'Bold, artistic, unique compositions, unexpected elements',

        industries: ['art', 'design', 'fashion', 'music', 'creative tools'],
    },

    // The Caregiver (nurturing, supportive)
    caregiver: {
        id: 'caregiver',
        name: 'The Caregiver',
        description: 'Nurturing, protective, supportive',

        personality: {
            traits: ['caring', 'supportive', 'protective', 'warm'],
            tone: 'Warm, empathetic, reassuring',
            approach: 'Support and protect, show you care',
        },

        vocabulary: {
            use: ['care', 'protect', 'support', 'nurture', 'safe', 'gentle', 'trust'],
            avoid: ['aggressive', 'harsh', 'extreme', 'risky'],
        },

        copyStyle: {
            sentenceLength: 'medium',
            punctuation: 'Soft, warm',
            formatting: 'Approachable, easy to read',
        },

        visualStyle: 'Soft colors, warm lighting, human connection, gentle',

        industries: ['baby', 'health', 'pets', 'insurance', 'home'],
    },

    // The Rebel (challenging, disruptive)
    rebel: {
        id: 'rebel',
        name: 'The Rebel',
        description: 'Bold, disruptive, challenging the status quo',

        personality: {
            traits: ['bold', 'provocative', 'independent', 'authentic'],
            tone: 'Edgy, direct, unapologetic',
            approach: 'Challenge conventions, break rules',
        },

        vocabulary: {
            use: ['break', 'rebel', 'defy', 'disrupt', 'real', 'raw', 'challenge'],
            avoid: ['traditional', 'standard', 'classic', 'ordinary'],
        },

        copyStyle: {
            sentenceLength: 'short, punchy',
            punctuation: 'Bold use of periods. Like this.',
            formatting: 'Unconventional, rule-breaking',
        },

        visualStyle: 'High contrast, bold colors, unexpected, provocative',

        industries: ['streetwear', 'alcohol', 'motorcycles', 'extreme sports', 'youth'],
    },

    // The Hero (courageous, achieving)
    hero: {
        id: 'hero',
        name: 'The Hero',
        description: 'Courageous, motivating, achievement-focused',

        personality: {
            traits: ['brave', 'determined', 'inspiring', 'powerful'],
            tone: 'Empowering, motivational, ambitious',
            approach: 'Inspire action, celebrate achievement',
        },

        vocabulary: {
            use: ['achieve', 'conquer', 'power', 'strength', 'win', 'goal', 'unstoppable'],
            avoid: ['weak', 'fail', 'impossible', 'can\'t'],
        },

        copyStyle: {
            sentenceLength: 'short-to-medium, powerful',
            punctuation: 'Strategic exclamations',
            formatting: 'Bold, impactful, clear',
        },

        visualStyle: 'Dynamic, action-oriented, powerful imagery, high energy',

        industries: ['fitness', 'sports', 'automotive', 'career', 'coaching'],
    },

    // The Everyman (relatable, honest)
    everyman: {
        id: 'everyman',
        name: 'The Everyman',
        description: 'Relatable, honest, down-to-earth',

        personality: {
            traits: ['authentic', 'relatable', 'honest', 'friendly'],
            tone: 'Conversational, genuine, accessible',
            approach: 'Connect as equals, be real',
        },

        vocabulary: {
            use: ['real', 'honest', 'simple', 'everyday', 'people', 'together', 'us'],
            avoid: ['exclusive', 'elite', 'luxury', 'premium'],
        },

        copyStyle: {
            sentenceLength: 'natural, conversational',
            punctuation: 'Natural, like talking to friend',
            formatting: 'Simple, accessible',
        },

        visualStyle: 'Authentic, real people, lifestyle, UGC-feel',

        industries: ['food', 'household', 'community', 'retail', 'everyday products'],
    },

    // The Lover (passionate, indulgent)
    lover: {
        id: 'lover',
        name: 'The Lover',
        description: 'Passionate, sensual, indulgent',

        personality: {
            traits: ['passionate', 'sensual', 'intimate', 'indulgent'],
            tone: 'Evocative, romantic, luxurious',
            approach: 'Appeal to senses, create desire',
        },

        vocabulary: {
            use: ['love', 'desire', 'passion', 'indulge', 'sensual', 'intimate', 'beautiful'],
            avoid: ['cheap', 'quick', 'practical', 'functional'],
        },

        copyStyle: {
            sentenceLength: 'flowing, descriptive',
            punctuation: 'Evocative ellipses...',
            formatting: 'Elegant, luxurious',
        },

        visualStyle: 'Beautiful imagery, sensual lighting, rich textures, intimate',

        industries: ['beauty', 'fragrance', 'fashion', 'chocolate', 'wine', 'jewelry'],
    },

    // The Jester (fun, playful)
    jester: {
        id: 'jester',
        name: 'The Jester',
        description: 'Fun, playful, entertaining',

        personality: {
            traits: ['fun', 'playful', 'witty', 'entertaining'],
            tone: 'Light-hearted, humorous, engaging',
            approach: 'Entertain and delight, make people smile',
        },

        vocabulary: {
            use: ['fun', 'play', 'enjoy', 'smile', 'lol', 'love', 'awesome'],
            avoid: ['serious', 'formal', 'complicated', 'boring'],
        },

        copyStyle: {
            sentenceLength: 'short, punchy, fun',
            punctuation: 'Emojis welcome 🎉',
            formatting: 'Playful, creative',
        },

        visualStyle: 'Bright colors, fun elements, playful compositions, joy',

        industries: ['candy', 'entertainment', 'toys', 'casual apps', 'snacks'],
    },
};

/**
 * Tone Modifiers
 */
export const TONE_MODIFIERS = {
    professional: {
        description: 'Business-appropriate, polished',
        adjustments: {
            vocabulary: 'Remove slang, use industry terms',
            punctuation: 'Conservative, no emojis',
            formality: 'high',
        },
    },
    casual: {
        description: 'Relaxed, friendly',
        adjustments: {
            vocabulary: 'Conversational, some slang okay',
            punctuation: 'Natural, emoji sparingly',
            formality: 'medium',
        },
    },
    playful: {
        description: 'Fun, energetic',
        adjustments: {
            vocabulary: 'Fun words, exclamations',
            punctuation: 'Emojis encouraged, exclamation marks',
            formality: 'low',
        },
    },
    luxury: {
        description: 'Sophisticated, exclusive',
        adjustments: {
            vocabulary: 'Elegant, refined, understated',
            punctuation: 'Minimal, elegant',
            formality: 'high',
        },
    },
    urgent: {
        description: 'Action-driving, immediate',
        adjustments: {
            vocabulary: 'Now, today, limited, act',
            punctuation: 'Exclamation points, capital keys',
            formality: 'varies',
        },
    },
};

/**
 * Get brand archetype
 */
export function getArchetype(archetypeId) {
    return BRAND_ARCHETYPES[archetypeId] || BRAND_ARCHETYPES.everyman;
}

/**
 * Recommend archetype based on industry and tone
 */
export function recommendArchetype(industry, tone) {
    const industryArchetypes = {
        fitness: 'hero',
        beauty: 'lover',
        tech: 'sage',
        education: 'sage',
        food: 'everyman',
        fashion: 'creator',
        health: 'caregiver',
        baby: 'caregiver',
        pets: 'caregiver',
        luxury: 'lover',
        eco: 'caregiver',
        saas: 'sage',
        entertainment: 'jester',
        sports: 'hero',
    };

    return getArchetype(industryArchetypes[industry] || 'everyman');
}

/**
 * Build brand voice prompt section
 */
export function buildBrandVoicePrompt(archetypeId, toneModifier = 'casual') {
    const archetype = getArchetype(archetypeId);
    const modifier = TONE_MODIFIERS[toneModifier] || TONE_MODIFIERS.casual;

    return `
BRAND VOICE:
- Archetype: ${archetype.name} (${archetype.description})
- Personality: ${archetype.personality.traits.join(', ')}
- Tone: ${archetype.personality.tone}
- Approach: ${archetype.personality.approach}

VOCABULARY:
- Use words like: ${archetype.vocabulary.use.slice(0, 5).join(', ')}
- Avoid: ${archetype.vocabulary.avoid.slice(0, 3).join(', ')}

VISUAL STYLE:
${archetype.visualStyle}

TONE MODIFIER: ${modifier.description}
${modifier.adjustments.vocabulary}
`;
}

/**
 * Validate copy against brand voice
 */
export function validateBrandVoice(copy, archetypeId) {
    const archetype = getArchetype(archetypeId);
    const warnings = [];

    // Check for avoided words
    for (const avoidWord of archetype.vocabulary.avoid) {
        if (copy.toLowerCase().includes(avoidWord.toLowerCase())) {
            warnings.push(`Contains word "${avoidWord}" which may not fit ${archetype.name} voice`);
        }
    }

    // Check for recommended words
    const usedRecommended = archetype.vocabulary.use.filter(
        word => copy.toLowerCase().includes(word.toLowerCase())
    );

    if (usedRecommended.length === 0) {
        warnings.push(`Consider using brand words: ${archetype.vocabulary.use.slice(0, 3).join(', ')}`);
    }

    return {
        valid: warnings.length === 0,
        warnings,
        usedBrandWords: usedRecommended,
    };
}
