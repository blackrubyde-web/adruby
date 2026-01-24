/**
 * ADVANCED AI PROMPT ENGINE
 * 
 * Sophisticated prompt engineering for maximum AI quality:
 * 
 * - Chain-of-thought prompting
 * - Multi-step reasoning
 * - Context injection
 * - Style modifiers
 * - Industry-specific terminology
 * - Quality enforcement
 * - Iterative refinement
 */

// ========================================
// PROMPT TEMPLATES
// ========================================

export const PROMPT_TEMPLATES = {
    // Background generation prompts
    background: {
        premium_dark: {
            base: `Ultra-premium dark advertising background, high-end marketing aesthetic, sophisticated and luxurious atmosphere`,
            style_modifiers: [
                'Deep blacks and rich navy gradients',
                'Subtle ambient lighting with soft glows',
                'Professional studio quality',
                'Clean negative space',
                'Magazine advertisement quality'
            ],
            avoid: 'text, logos, products, people, faces, hands, typography, letters, words, numbers, watermarks, signatures'
        },

        gradient_mesh: {
            base: `Abstract gradient mesh background, fluid color transitions, ethereal light effects`,
            style_modifiers: [
                'Smooth color blending',
                'Soft bokeh light orbs',
                'Subtle depth with layered gradients',
                'Aurora-like color flows',
                'Premium app marketing style'
            ],
            avoid: 'text, logos, products, people, faces, hands, typography, letters'
        },

        geometric: {
            base: `Geometric abstract background with clean shapes, modern tech aesthetic`,
            style_modifiers: [
                'Low-poly style elements',
                'Grid patterns with depth',
                'Isometric shapes',
                'Subtle line work',
                'Digital abstract art'
            ],
            avoid: 'text, logos, products, people, faces, organic shapes'
        },

        nature_abstract: {
            base: `Abstract nature-inspired background, organic flowing forms`,
            style_modifiers: [
                'Flowing liquid metal',
                'Silk fabric waves',
                'Water surface reflections',
                'Organic curve patterns',
                'Botanical silhouettes'
            ],
            avoid: 'text, logos, products, people, faces, typography'
        }
    },

    // Content generation prompts
    content: {
        headline: {
            base: `You are a world-class advertising copywriter with 20 years of experience writing headlines for Fortune 500 brands.`,
            instructions: `Generate a headline that:
- Is 3-6 words maximum
- Creates immediate impact
- Speaks to the core benefit
- Uses power words that drive action
- Is memorable and shareable`,
            examples: [
                'Design That Sells Itself',
                'Create Like a Pro',
                'Your Brand, Amplified',
                'Ideas Made Beautiful',
                'Work Smarter. Look Better.'
            ]
        },

        tagline: {
            base: `You are an expert brand strategist specializing in compelling taglines.`,
            instructions: `Generate a tagline that:
- Is 5-10 words
- Reinforces the headline message
- Adds specificity and credibility
- Creates desire or urgency
- Sounds conversational but professional`,
            examples: [
                'Generate stunning ad creatives in seconds, not hours.',
                'AI-powered design that understands your brand.',
                'From concept to campaign in one click.'
            ]
        },

        cta: {
            base: `You are a conversion optimization expert.`,
            instructions: `Generate a CTA that:
- Is 2-4 words
- Uses action verbs
- Creates urgency or excitement
- Feels low-risk but high-reward
- Is specific to the offer`,
            variations: {
                action: ['Start Free', 'Get Started', 'Try Now', 'Begin Today'],
                urgency: ['Claim Now', 'Get Instant Access', 'Start Immediately'],
                curiosity: ['See How', 'Discover More', 'Explore Features'],
                value: ['Get Free Trial', 'Start for Free', 'Try Risk-Free']
            }
        }
    },

    // Analysis prompts
    analysis: {
        product: {
            base: `You are a professional product photographer and marketing specialist.`,
            instructions: `Analyze this product image and extract:
1. Product category and type
2. Target audience demographics
3. Brand aesthetic (premium, budget, playful, professional, etc.)
4. Dominant colors and color mood
5. Suggested photography style
6. Recommended background environments
7. Key selling points visible in the product`
        },

        brand: {
            base: `You are a senior brand strategist with expertise in visual identity.`,
            instructions: `Analyze this image and extract the complete brand DNA:
1. Brand personality archetype (Hero, Creator, Sage, etc.)
2. Color palette with specific hex codes
3. Typography style recommendations
4. Design language (minimal, maximal, playful, serious)
5. Target emotion to evoke
6. Visual motifs and patterns
7. Industry positioning`
        },

        reference_ad: {
            base: `You are a creative director analyzing competitor advertisements.`,
            instructions: `Analyze this ad creative and extract:
1. Layout composition pattern
2. Typography hierarchy and styles
3. Color strategy
4. Visual effects used
5. Emotional appeal
6. CTA placement and style
7. Unique creative techniques
8. Estimated performance indicators`
        }
    }
};

// ========================================
// CHAIN-OF-THOUGHT BUILDERS
// ========================================

/**
 * Build background prompt with chain-of-thought
 */
export function buildBackgroundPromptCoT({
    industry,
    mood,
    colors,
    productType,
    targetEmotion,
    style = 'premium_dark',
    canvasWidth = 1080,
    canvasHeight = 1080
}) {
    const template = PROMPT_TEMPLATES.background[style] || PROMPT_TEMPLATES.background.premium_dark;

    // Industry-specific modifiers
    const industryModifiers = getIndustryModifiers(industry);

    // Mood modifiers
    const moodModifiers = getMoodModifiers(mood);

    // Color context
    const colorContext = colors
        ? `Incorporate these brand colors subtly: Primary ${colors.primary}, accent glow effects in ${colors.accent || colors.primary}.`
        : '';

    // Build chain-of-thought prompt
    const prompt = `
CONTEXT:
You are generating a premium advertising background for a ${industry} product.
The ad should evoke: ${targetEmotion || mood || 'trust and innovation'}
Product type: ${productType || 'SaaS application'}
Dimensions: ${canvasWidth}x${canvasHeight}px (${canvasWidth === canvasHeight ? 'square, social media optimized' : 'banner format'})

STEP 1 - UNDERSTAND THE GOAL:
${template.base}

STEP 2 - APPLY INDUSTRY AESTHETICS:
${industryModifiers.join('\n')}

STEP 3 - SET THE MOOD:
${moodModifiers.join('\n')}

STEP 4 - COLOR DIRECTION:
${colorContext}

STEP 5 - STYLE APPLICATION:
${template.style_modifiers.join(', ')}

STEP 6 - QUALITY REQUIREMENTS:
- 4K ultra-high resolution quality
- Professional photography lighting
- Magazine/billboard advertisement quality
- Perfect for placing product mockup in center

ABSOLUTELY AVOID: ${template.avoid}

FINAL PROMPT:
Generate the background based on all the above considerations.
`.trim();

    return prompt;
}

/**
 * Build content generation prompt with multi-step reasoning
 */
export function buildContentPromptCoT({
    productName,
    productDescription,
    industry,
    targetAudience,
    uniqueSellingPoints = [],
    competitorPhrases = [],
    contentType = 'headline', // 'headline', 'tagline', 'cta'
    brandVoice = 'professional', // 'professional', 'casual', 'luxury', 'playful'
    maxLength = null
}) {
    const template = PROMPT_TEMPLATES.content[contentType];

    const voiceGuide = {
        professional: 'Clear, confident, authoritative. Use industry terminology appropriately.',
        casual: 'Friendly, conversational, relatable. Like talking to a smart friend.',
        luxury: 'Elegant, refined, exclusive. Evoke aspiration and prestige.',
        playful: 'Fun, energetic, creative. Use wordplay and unexpected phrases.'
    };

    return `
${template.base}

STEP 1 - UNDERSTAND THE PRODUCT:
Product: ${productName}
Description: ${productDescription}
Industry: ${industry}

STEP 2 - KNOW THE AUDIENCE:
Target audience: ${targetAudience || 'Business professionals'}
What they care about: Speed, quality, cost savings, competitive advantage

STEP 3 - IDENTIFY KEY BENEFITS:
${uniqueSellingPoints.length > 0 ? uniqueSellingPoints.map((usp, i) => `${i + 1}. ${usp}`).join('\n') : '- Saves time\n- Improves quality\n- Easy to use'}

STEP 4 - COMPETITIVE DIFFERENTIATION:
${competitorPhrases.length > 0 ? `Avoid these overused phrases:\n${competitorPhrases.join('\n')}` : ''}

STEP 5 - BRAND VOICE:
${voiceGuide[brandVoice]}

STEP 6 - GENERATION REQUIREMENTS:
${template.instructions}
${maxLength ? `Maximum length: ${maxLength} characters` : ''}

EXAMPLES OF GREAT ${contentType.toUpperCase()}S:
${template.examples ? template.examples.join('\n') : ''}

Generate 5 ${contentType} options, ranked from most impactful to safe choice.
Format: Each on a new line, with a brief explanation.
`.trim();
}

// ========================================
// STYLE MODIFIERS
// ========================================

function getIndustryModifiers(industry) {
    const modifiers = {
        technology: [
            'Clean digital aesthetics',
            'Subtle tech patterns (circuit, code)',
            'Blue and purple color accents',
            'Futuristic but accessible'
        ],
        finance: [
            'Trust and stability feel',
            'Deep blues, golds, greens',
            'Clean and professional',
            'Subtle data visualization hints'
        ],
        health: [
            'Fresh and clean atmosphere',
            'Greens, whites, soft blues',
            'Natural and organic feel',
            'Calm and reassuring'
        ],
        ecommerce: [
            'Vibrant and energetic',
            'Bold accent colors',
            'Dynamic and modern',
            'Shopping excitement'
        ],
        beauty: [
            'Elegant and luxurious',
            'Soft lighting, subtle glows',
            'Rose golds, soft pinks, creams',
            'Aspirational beauty aesthetic'
        ],
        food: [
            'Warm and appetizing',
            'Rich colors, warm lighting',
            'Fresh and natural feel',
            'Mouth-watering atmosphere'
        ],
        gaming: [
            'Dynamic and exciting',
            'Neon accents, dark backgrounds',
            'Action-packed energy',
            'RGB glow effects'
        ],
        education: [
            'Inspiring and approachable',
            'Warm, inviting colors',
            'Growth and progress feel',
            'Bright but not overwhelming'
        ],
        real_estate: [
            'Premium and aspirational',
            'Clean, sophisticated',
            'Lifestyle focused',
            'Warm and inviting'
        ],
        automotive: [
            'Powerful and dynamic',
            'Sleek, metallic accents',
            'Motion and speed hints',
            'Premium automotive aesthetic'
        ]
    };

    return modifiers[industry?.toLowerCase()] || modifiers.technology;
}

function getMoodModifiers(mood) {
    const modifiers = {
        professional: [
            'Clean and organized',
            'Subtle and refined',
            'Confidence-inspiring',
            'Business-appropriate'
        ],
        exciting: [
            'Dynamic energy',
            'Bold contrasts',
            'Movement and action',
            'Attention-grabbing'
        ],
        calm: [
            'Serene and peaceful',
            'Soft gradients',
            'Breathing room',
            'Relaxing atmosphere'
        ],
        luxurious: [
            'Premium and exclusive',
            'Rich, deep colors',
            'Sophisticated elegance',
            'High-end feel'
        ],
        playful: [
            'Fun and energetic',
            'Bright, vibrant colors',
            'Whimsical elements',
            'Joyful atmosphere'
        ],
        trustworthy: [
            'Stable and reliable',
            'Professional appearance',
            'Clean and organized',
            'Confidence-building'
        ],
        innovative: [
            'Cutting-edge feel',
            'Futuristic elements',
            'Tech-forward',
            'Forward-thinking'
        ],
        warm: [
            'Inviting and friendly',
            'Warm color tones',
            'Approachable feel',
            'Comfortable atmosphere'
        ]
    };

    return modifiers[mood?.toLowerCase()] || modifiers.professional;
}

// ========================================
// QUALITY ENFORCEMENT
// ========================================

export const QUALITY_CONSTRAINTS = {
    background: {
        resolution: '4K quality, ultra-sharp details',
        composition: 'Clean center area for product placement',
        lighting: 'Professional studio-quality lighting',
        negative: 'NO text, NO logos, NO faces, NO products, NO typography'
    },

    content: {
        headline: {
            minWords: 2,
            maxWords: 8,
            forbidden: ['click here', 'buy now', 'limited time', 'act now'],
            required: ['action verb OR benefit']
        },
        tagline: {
            minWords: 4,
            maxWords: 15,
            forbidden: ['best in class', 'world-class', 'cutting-edge'],
            required: ['specific benefit']
        },
        cta: {
            minWords: 2,
            maxWords: 4,
            forbidden: ['submit', 'click'],
            required: ['action verb']
        }
    }
};

/**
 * Validate content against quality constraints
 */
export function validateContent(content, type) {
    const constraints = QUALITY_CONSTRAINTS.content[type];
    if (!constraints) return { valid: true, issues: [] };

    const issues = [];
    const words = content.trim().split(/\s+/);

    // Word count
    if (words.length < constraints.minWords) {
        issues.push(`Too short: ${words.length} words (min: ${constraints.minWords})`);
    }
    if (words.length > constraints.maxWords) {
        issues.push(`Too long: ${words.length} words (max: ${constraints.maxWords})`);
    }

    // Forbidden phrases
    const lowerContent = content.toLowerCase();
    for (const phrase of constraints.forbidden || []) {
        if (lowerContent.includes(phrase)) {
            issues.push(`Contains forbidden phrase: "${phrase}"`);
        }
    }

    return {
        valid: issues.length === 0,
        issues
    };
}

// ========================================
// ITERATIVE REFINEMENT
// ========================================

/**
 * Build refinement prompt based on feedback
 */
export function buildRefinementPrompt({
    originalContent,
    contentType,
    feedback,
    direction
}) {
    return `
ORIGINAL ${contentType.toUpperCase()}:
"${originalContent}"

FEEDBACK:
${feedback}

REFINEMENT DIRECTION:
${direction || 'Make it more impactful while keeping the core message'}

REQUIREMENTS:
1. Keep what works from the original
2. Address the specific feedback
3. Maintain brand voice consistency
4. Improve overall impact

Generate 3 refined versions, each addressing the feedback differently.
`.trim();
}

/**
 * Build A/B test prompt
 */
export function buildABTestPrompt({
    originalContent,
    contentType,
    testFocus // 'emotional', 'rational', 'urgency', 'curiosity'
}) {
    const focusGuides = {
        emotional: 'Create a version that leads with emotion and feeling',
        rational: 'Create a version that leads with logic and benefits',
        urgency: 'Create a version that emphasizes time-sensitivity',
        curiosity: 'Create a version that creates curiosity and intrigue'
    };

    return `
CONTROL ${contentType.toUpperCase()}:
"${originalContent}"

A/B TEST FOCUS: ${testFocus}
${focusGuides[testFocus]}

Generate a variant that:
1. Tests the specific focus area
2. Is meaningfully different from control
3. Maintains similar length and structure
4. Could potentially outperform the original

Provide:
- Variant text
- Hypothesis: Why this might perform better
- Key difference from original
`.trim();
}

// ========================================
// MEGA PROMPT BUILDER
// ========================================

/**
 * Build comprehensive mega prompt for full ad generation
 */
export function buildMegaAdPrompt({
    product,
    industry,
    targetAudience,
    brandColors,
    brandVoice,
    campaign,
    referenceAds = [],
    constraints = {}
}) {
    return `
═══════════════════════════════════════════════════════════
          MASTER AD CREATIVE GENERATION BRIEF
═══════════════════════════════════════════════════════════

ROLE:
You are a Creative Director at a top advertising agency.
You've created award-winning campaigns for Apple, Nike, and Tesla.
Your ads are known for stunning visuals and compelling copy.

═══════════════════════════════════════════════════════════

SECTION 1: PRODUCT UNDERSTANDING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Product: ${product?.name || 'SaaS Product'}
Description: ${product?.description || 'A powerful software solution'}
Category: ${product?.category || 'Technology'}
Key Benefits:
${product?.benefits?.map((b, i) => `  ${i + 1}. ${b}`).join('\n') || '  - Saves time\n  - Improves quality'}

═══════════════════════════════════════════════════════════

SECTION 2: TARGET AUDIENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Primary Audience: ${targetAudience?.primary || 'Business professionals'}
Demographics: ${targetAudience?.demographics || '25-45, decision makers'}
Pain Points:
${targetAudience?.painPoints?.map((p, i) => `  ${i + 1}. ${p}`).join('\n') || '  - Wasting time on repetitive tasks'}
Desires:
${targetAudience?.desires?.map((d, i) => `  ${i + 1}. ${d}`).join('\n') || '  - More efficiency and quality'}

═══════════════════════════════════════════════════════════

SECTION 3: BRAND IDENTITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brand Voice: ${brandVoice || 'Professional, innovative, trustworthy'}
Primary Color: ${brandColors?.primary || '#3B82F6'}
Secondary Color: ${brandColors?.secondary || '#8B5CF6'}
Visual Style: ${brandColors?.style || 'Modern, clean, premium'}

═══════════════════════════════════════════════════════════

SECTION 4: CAMPAIGN CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Campaign Goal: ${campaign?.goal || 'Drive trial signups'}
Platform: ${campaign?.platform || 'Facebook/Instagram'}
Ad Format: ${campaign?.format || '1080x1080 square'}
Desired Action: ${campaign?.desiredAction || 'Start free trial'}

═══════════════════════════════════════════════════════════

SECTION 5: CREATIVE DIRECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reference Patterns:
${referenceAds.map((ad, i) => `  ${i + 1}. ${ad.description || 'Premium SaaS ad style'}`).join('\n') || '  - Clean product hero with gradient background'}

Mood/Emotion: ${campaign?.mood || 'Innovative, trustworthy, exciting'}

═══════════════════════════════════════════════════════════

DELIVERABLES REQUIRED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. HEADLINE (3-6 words)
   - Maximum impact
   - Benefit-focused
   
2. TAGLINE (7-12 words)
   - Supports headline
   - Adds specificity
   
3. CTA (2-4 words)
   - Action-oriented
   - Low friction

4. BACKGROUND DESCRIPTION
   - Mood and atmosphere
   - Color palette application
   - Lighting direction

5. LAYOUT RECOMMENDATION
   - Element positioning
   - Visual hierarchy
   - Focal point

═══════════════════════════════════════════════════════════

Format your response as structured JSON:
{
    "headline": "...",
    "headline_reasoning": "...",
    "tagline": "...",
    "tagline_reasoning": "...",
    "cta": "...",
    "cta_reasoning": "...",
    "background": {
        "description": "...",
        "mood": "...",
        "lighting": "...",
        "colors": ["...", "..."]
    },
    "layout": {
        "style": "...",
        "focal_point": "...",
        "element_order": ["...", "..."]
    },
    "confidence_score": 0-100
}
`.trim();
}

export default {
    PROMPT_TEMPLATES,
    QUALITY_CONSTRAINTS,
    buildBackgroundPromptCoT,
    buildContentPromptCoT,
    validateContent,
    buildRefinementPrompt,
    buildABTestPrompt,
    buildMegaAdPrompt
};
