/**
 * CREATIVE STRATEGIST - 10/10 VERSION
 * 
 * Layer 1: Elite layout intelligence with industry-specific templates.
 * Based on analysis of 45+ top-performing Meta ads.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Industry-specific design templates
const INDUSTRY_TEMPLATES = {
    gaming: {
        mood: 'aggressive', backgroundType: 'dark_gradient', backgroundColor: '#0a0a1a',
        accentColor: '#00ff88', lighting: 'dramatic', effects: ['neon_glow', 'rgb_accent'],
        headlineWeight: 900, headlineTransform: 'uppercase'
    },
    beauty: {
        mood: 'luxurious', backgroundType: 'soft_gradient', backgroundColor: '#fef5f0',
        accentColor: '#e91e63', lighting: 'soft', effects: ['soft_shadow', 'glow'],
        headlineWeight: 600, headlineTransform: 'none'
    },
    tech: {
        mood: 'minimal', backgroundType: 'dark_gradient', backgroundColor: '#1a1a2e',
        accentColor: '#6366f1', lighting: 'studio', effects: ['reflection', 'subtle_glow'],
        headlineWeight: 700, headlineTransform: 'none'
    },
    fashion: {
        mood: 'aspirational', backgroundType: 'lifestyle_blur', backgroundColor: '#f5f5f5',
        accentColor: '#000000', lighting: 'natural', effects: ['lifestyle_context'],
        headlineWeight: 700, headlineTransform: 'uppercase'
    },
    home: {
        mood: 'cozy', backgroundType: 'warm_gradient', backgroundColor: '#fafafa',
        accentColor: '#8b5cf6', lighting: 'ambient', effects: ['warm_glow'],
        headlineWeight: 600, headlineTransform: 'none'
    },
    default: {
        mood: 'premium', backgroundType: 'dark_gradient', backgroundColor: '#1a1a2e',
        accentColor: '#FF4757', lighting: 'studio', effects: ['reflection'],
        headlineWeight: 700, headlineTransform: 'none'
    }
};

/**
 * Create elite layout strategy with industry intelligence
 */
export async function createLayoutStrategy({ productAnalysis, userPrompt, industry, headline, tagline, cta }) {
    console.log('[Strategist] 🧠 Creating elite layout strategy...');

    const template = INDUSTRY_TEMPLATES[industry] || INDUSTRY_TEMPLATES.default;
    console.log(`[Strategist] Industry: ${industry || 'default'}, Mood: ${template.mood}`);

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `You are an ELITE Creative Director creating viral Meta ads.

PRODUCT: ${productAnalysis?.productName || 'Product'} (${productAnalysis?.productType || 'Unknown'})
INDUSTRY: ${industry || 'e-commerce'}
USER WANTS: "${userPrompt || 'Premium ad'}"

COPY:
- Headline: "${headline}"
- Tagline: "${tagline || ''}"
- CTA: "${cta || 'Shop Now'}"

INDUSTRY STYLE: ${template.mood} mood, ${template.backgroundType} background

Choose the OPTIMAL layout and return JSON:
{
    "layoutType": "hero_product|feature_callouts|left_hero|lifestyle",
    "composition": {
        "productPosition": "center|left|right|bottom",
        "productSize": "45%",
        "negativeSpaceZone": "top"
    },
    "style": {
        "mood": "${template.mood}",
        "backgroundType": "${template.backgroundType}",
        "backgroundColor": "${template.backgroundColor}",
        "accentColor": "${template.accentColor}",
        "lighting": "${template.lighting}",
        "effects": ${JSON.stringify(template.effects)}
    },
    "typography": {
        "headline": {"fontSize": 64, "fontWeight": ${template.headlineWeight}, "color": "#FFFFFF", "shadow": true},
        "tagline": {"fontSize": 24, "fontWeight": 400, "color": "#CCCCCC"},
        "cta": {"fontSize": 18, "fontWeight": 600, "width": 220, "height": 56, "borderRadius": 28, "shadow": true}
    },
    "features": {
        "useGlow": ${template.effects.includes('glow') || template.effects.includes('neon_glow')},
        "useReflection": ${template.effects.includes('reflection')},
        "useShadows": true
    },
    "designRationale": "Brief explanation"
}

RULES: Dark products need light BG. Gaming = neon. Beauty = soft. Always 25%+ negative space.`;

    try {
        const result = await model.generateContent(prompt);
        const layoutPlan = JSON.parse(result.response.text());

        // Ensure template values are applied
        layoutPlan.style = { ...template, ...layoutPlan.style };

        console.log('[Strategist] ✅ Layout:', layoutPlan.layoutType);
        return layoutPlan;
    } catch (error) {
        console.error('[Strategist] Failed:', error.message);
        return getDefaultLayout(industry, template);
    }
}

function getDefaultLayout(industry, template) {
    return {
        layoutType: 'hero_product',
        composition: { productPosition: 'center', productSize: '45%', negativeSpaceZone: 'top' },
        style: template,
        typography: {
            headline: { fontSize: 64, fontWeight: template.headlineWeight, color: '#FFFFFF', shadow: true },
            tagline: { fontSize: 24, fontWeight: 400, color: '#CCCCCC' },
            cta: { fontSize: 18, fontWeight: 600, width: 220, height: 56, borderRadius: 28, shadow: true }
        },
        features: { useGlow: true, useReflection: true, useShadows: true },
        designRationale: `Default ${template.mood} layout`
    };
}

export { INDUSTRY_TEMPLATES };
export default { createLayoutStrategy };
