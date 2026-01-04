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
    console.log('📊 Stage 1: Strategic Analysis 2.0...');

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

        console.log(`✅ Strategy: ${normalizedProfile.designSystem.vibe} | ${normalizedProfile.angle}`);
        return normalizedProfile;
    } catch (parseError) {
        console.warn('⚠️ JSON parse failed, using fallback profile:', parseError);
        return FALLBACK_PROFILE;
    }
}

function normalizeProfile(raw: any): StrategicProfile {
    return {
        productCategory: PRODUCT_CATEGORIES.includes(raw?.productCategory) ? raw.productCategory : FALLBACK_PROFILE.productCategory,
        targetAudience: raw?.targetAudience || FALLBACK_PROFILE.targetAudience,
        primaryPainPoint: raw?.primaryPainPoint || FALLBACK_PROFILE.primaryPainPoint,
        desiredEmotion: EMOTIONS.includes(raw?.desiredEmotion) ? raw.desiredEmotion : FALLBACK_PROFILE.desiredEmotion,
        conversionGoal: CONVERSION_GOALS.includes(raw?.conversionGoal) ? raw.conversionGoal : FALLBACK_PROFILE.conversionGoal,
        angle: raw?.angle || FALLBACK_PROFILE.angle,
        hookType: HOOK_TYPES.includes(raw?.hookType) ? raw.hookType : FALLBACK_PROFILE.hookType,
        recommendedTemplate: raw?.recommendedTemplate || FALLBACK_PROFILE.recommendedTemplate,
        designSystem: {
            vibe: VIBES.includes(raw?.designSystem?.vibe) ? raw.designSystem.vibe : FALLBACK_PROFILE.designSystem.vibe,
            colorPalette: {
                primary: raw?.designSystem?.colorPalette?.primary || FALLBACK_PROFILE.designSystem.colorPalette.primary,
                secondary: raw?.designSystem?.colorPalette?.secondary || FALLBACK_PROFILE.designSystem.colorPalette.secondary,
                text: raw?.designSystem?.colorPalette?.text || FALLBACK_PROFILE.designSystem.colorPalette.text,
                highlight: raw?.designSystem?.colorPalette?.highlight || FALLBACK_PROFILE.designSystem.colorPalette.highlight
            },
            fontPairing: {
                headline: raw?.designSystem?.fontPairing?.headline || FALLBACK_PROFILE.designSystem.fontPairing.headline,
                body: 'Inter'
            },
            visualElements: Array.isArray(raw?.designSystem?.visualElements)
                ? raw.designSystem.visualElements
                : FALLBACK_PROFILE.designSystem.visualElements
        }
    };
}
