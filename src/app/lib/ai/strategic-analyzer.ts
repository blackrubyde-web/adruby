import { invokeOpenAIProxy } from '../api/proxyClient';

/**
 * STAGE 1: STRATEGIC ANALYZER
 * Analyzes product/brand to determine optimal ad strategy
 */

export interface StrategicProfile {
    // Core Strategy
    productCategory: 'electronics' | 'fashion' | 'food' | 'beauty' | 'home' | 'sports' | 'tech' | 'services' | 'other';
    targetAudience: string; // Specific audience persona (e.g., "Overworked Moms")
    primaryPainPoint: string;
    desiredEmotion: 'excitement' | 'trust' | 'desire' | 'urgency' | 'exclusivity' | 'curiosity' | 'relief';
    conversionGoal: 'purchase' | 'signup' | 'download' | 'learn_more' | 'contact';

    // Copy Directions (Grounded)
    angle: string; // The specific marketing angle (e.g. "Us vs Them")
    hookType: 'question' | 'statement' | 'stat' | 'negative' | 'story';

    // Design System (Tokens)
    designSystem: {
        vibe: 'minimal' | 'bold' | 'luxury' | 'organic' | 'industrial' | 'tech';
        colorPalette: {
            primary: string; // Hex for background/dominant
            secondary: string; // Hex for accents
            text: string;    // Hex for body text
            highlight: string; // Hex for CTAs/Important text
        };
        fontPairing: {
            headline: 'Inter' | 'Oswald' | 'Playfair Display' | 'Caveat' | 'Rubik';
            body: 'Inter';
        };
        visualElements: string[]; // e.g. ["rounded corners", "glassmorphism"]
    };

    recommendedTemplate: string;
}

const FALLBACK_PROFILE: StrategicProfile = {
    productCategory: 'other',
    targetAudience: 'general consumers',
    primaryPainPoint: 'finding quality products',
    desiredEmotion: 'trust',
    conversionGoal: 'purchase',
    angle: 'quality_focus',
    hookType: 'statement',
    recommendedTemplate: 'hook_pas',
    designSystem: {
        vibe: 'minimal',
        colorPalette: {
            primary: '#000000',
            secondary: '#333333',
            text: '#000000',
            highlight: '#0066FF'
        },
        fontPairing: {
            headline: 'Inter',
            body: 'Inter'
        },
        visualElements: ['clean', 'modern']
    }
};

const PRODUCT_CATEGORIES: StrategicProfile['productCategory'][] = [
    'electronics',
    'fashion',
    'food',
    'beauty',
    'home',
    'sports',
    'tech',
    'services',
    'other'
];

const EMOTIONS: StrategicProfile['desiredEmotion'][] = [
    'excitement',
    'trust',
    'desire',
    'urgency',
    'exclusivity',
    'curiosity',
    'relief'
];

const CONVERSION_GOALS: StrategicProfile['conversionGoal'][] = [
    'purchase',
    'signup',
    'download',
    'learn_more',
    'contact'
];

const HOOK_TYPES: StrategicProfile['hookType'][] = [
    'question',
    'statement',
    'stat',
    'negative',
    'story'
];

const VIBES: StrategicProfile['designSystem']['vibe'][] = [
    'minimal',
    'bold',
    'luxury',
    'organic',
    'industrial',
    'tech'
];

export async function analyzeStrategy(params: {
    productName: string;
    brandName?: string;
    userPrompt: string; // Now includes structured brief data
    tone: 'professional' | 'playful' | 'bold' | 'luxury' | 'minimal';
    imageBase64?: string;
    language?: string;
}): Promise<StrategicProfile> {
    // console.log('📊 Stage 1: Strategic Analysis 2.0...');

    const analysisPrompt = `You are a World-Class Creative Director.
    
CONTEXT:
- Product: ${params.productName}
- Brand: ${params.brandName || 'N/A'}
- Brief: ${params.userPrompt}
- Desired Tone: ${params.tone}
- Language: ${params.language || 'German'} (Ensure any copy direction or angles are optimized for this language)

YOUR TASK:
Create a cohesive Creative Direction Profile.

1. ANALYZE AUDIENCE & ANGLE:
   - Who exactly is this for? Be specific.
   - What is the ONE main pain point?
   - What marketing angle cuts through the noise?

2. DEFINE DESIGN TOKENS (Visual Identity):
   - Choose a "Vibe" that fits the tone.
   - Pick a Color Palette (Hex codes) that evokes the ${params.tone} emotion.
     * Luxury = Black/Gold/Cream
     * Bold = Yellow/Black/Red
     * Trust = Blue/White/Slate
   - Select Fonts: 'Oswald' for bold, 'Playfair Display' for luxury, 'Inter' for modern/tech.

3. RECOMMEND TEMPLATE:
   - "ugc_testimonial" (if trust needed)
   - "social_proof_max" (if lots of reviews)
   - "before_after" (if visible transformation)
   - "fomo_scarcity" (if urgent offer)
   - "feature_spotlight" (if tech/SaaS)
   - "bold_statement" (if lifestyle/brand)

OUTPUT FORMAT:
JSON Only. No markdown.
{
  "productCategory": "...",
  "targetAudience": "...",
  "primaryPainPoint": "...",
  "desiredEmotion": "...",
  "conversionGoal": "...",
  "angle": "...",
  "hookType": "...",
  "designSystem": {
    "vibe": "...",
    "colorPalette": { "primary": "#...", "secondary": "#...", "text": "#...", "highlight": "#..." },
    "fontPairing": { "headline": "...", "body": "Inter" },
    "visualElements": ["..."]
  },
  "recommendedTemplate": "..."
}`;

    const { data, error } = await invokeOpenAIProxy({
        endpoint: 'chat/completions',
        model: 'gpt-4o',
        messages: [{ role: 'user', content: analysisPrompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' }
    });

    if (error) {
        throw new Error(`Strategic analysis failed: ${error.message}`);
    }

    try {
        const profile = JSON.parse(data.choices[0].message.content);
        const normalizedProfile = normalizeProfile(profile);

        // console.log(`✅ Strategy: ${normalizedProfile.designSystem.vibe} | ${normalizedProfile.angle}`);
        return normalizedProfile;
    } catch (parseError) {
        console.warn('⚠️ JSON parse failed, using fallback profile:', parseError);
        return FALLBACK_PROFILE;
    }
}

// Use strict typing for input validation
function normalizeProfile(input: unknown): StrategicProfile {
    // Treat input as untrusted record first
    const raw = input as Record<string, unknown>;

    // Safety helpers
    const getString = (value: unknown, fallback: string) =>
        typeof value === 'string' ? value : fallback;
    const isValidCategory = (v: unknown): v is StrategicProfile['productCategory'] =>
        typeof v === 'string' && PRODUCT_CATEGORIES.includes(v as StrategicProfile['productCategory']);
    const isValidEmotion = (v: unknown): v is StrategicProfile['desiredEmotion'] =>
        typeof v === 'string' && EMOTIONS.includes(v as StrategicProfile['desiredEmotion']);
    const isValidGoal = (v: unknown): v is StrategicProfile['conversionGoal'] =>
        typeof v === 'string' && CONVERSION_GOALS.includes(v as StrategicProfile['conversionGoal']);
    const isValidHook = (v: unknown): v is StrategicProfile['hookType'] =>
        typeof v === 'string' && HOOK_TYPES.includes(v as StrategicProfile['hookType']);
    const isValidVibe = (v: unknown): v is StrategicProfile['designSystem']['vibe'] =>
        typeof v === 'string' && VIBES.includes(v as StrategicProfile['designSystem']['vibe']);
    const isValidHeadlineFont = (v: unknown): v is StrategicProfile['designSystem']['fontPairing']['headline'] =>
        typeof v === 'string' && ['Inter', 'Oswald', 'Playfair Display', 'Caveat', 'Rubik'].includes(v);
    const rawDesignSystem = raw.designSystem as Record<string, unknown> | undefined;
    const rawPalette = rawDesignSystem?.colorPalette as Record<string, unknown> | undefined;
    const rawFontPairing = rawDesignSystem?.fontPairing as Record<string, unknown> | undefined;
    const rawVisualElements = rawDesignSystem?.visualElements;
    const visualElements = Array.isArray(rawVisualElements)
        ? rawVisualElements.filter((item): item is string => typeof item === 'string')
        : FALLBACK_PROFILE.designSystem.visualElements;

    return {
        productCategory: isValidCategory(raw?.productCategory) ? raw.productCategory : FALLBACK_PROFILE.productCategory,
        targetAudience: getString(raw?.targetAudience, FALLBACK_PROFILE.targetAudience),
        primaryPainPoint: getString(raw?.primaryPainPoint, FALLBACK_PROFILE.primaryPainPoint),
        desiredEmotion: isValidEmotion(raw?.desiredEmotion) ? raw.desiredEmotion : FALLBACK_PROFILE.desiredEmotion,
        conversionGoal: isValidGoal(raw?.conversionGoal) ? raw.conversionGoal : FALLBACK_PROFILE.conversionGoal,
        angle: getString(raw?.angle, FALLBACK_PROFILE.angle),
        hookType: isValidHook(raw?.hookType) ? raw.hookType : FALLBACK_PROFILE.hookType,
        recommendedTemplate: getString(raw?.recommendedTemplate, FALLBACK_PROFILE.recommendedTemplate),
        designSystem: {
            vibe: isValidVibe(rawDesignSystem?.vibe) ? rawDesignSystem.vibe : FALLBACK_PROFILE.designSystem.vibe,
            colorPalette: {
                primary: getString(rawPalette?.primary, FALLBACK_PROFILE.designSystem.colorPalette.primary),
                secondary: getString(rawPalette?.secondary, FALLBACK_PROFILE.designSystem.colorPalette.secondary),
                text: getString(rawPalette?.text, FALLBACK_PROFILE.designSystem.colorPalette.text),
                highlight: getString(rawPalette?.highlight, FALLBACK_PROFILE.designSystem.colorPalette.highlight)
            },
            fontPairing: {
                headline: isValidHeadlineFont(rawFontPairing?.headline)
                    ? rawFontPairing.headline
                    : FALLBACK_PROFILE.designSystem.fontPairing.headline,
                body: 'Inter'
            },
            visualElements
        }
    };
}
