/**
 * CREATIVE STRATEGIST
 * 
 * Layer 1 of the Pipeline
 * Analyzes product and determines optimal ad layout.
 * Output: JSON layout plan with composition, style, and elements.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyze product and create layout strategy
 * @returns {Object} Layout plan with composition, style, elements
 */
export async function createLayoutStrategy({
    productAnalysis,
    userPrompt,
    industry,
    headline,
    tagline,
    cta
}) {
    console.log('[Strategist] 🧠 Analyzing product and planning layout...');

    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
        generationConfig: {
            responseMimeType: 'application/json'
        }
    });

    const prompt = `You are a Senior Creative Director at a top Meta Ads agency.
Your job: Create a strategic layout plan for a high-converting advertisement.

PRODUCT ANALYSIS:
- Name: ${productAnalysis?.productName || 'Product'}
- Type: ${productAnalysis?.productType || 'Unknown'}
- Industry: ${industry || 'e-commerce'}
- Colors: ${productAnalysis?.colorPalette?.join(', ') || 'Unknown'}
- Price Point: ${productAnalysis?.pricePoint || 'mid-range'}

USER REQUEST: "${userPrompt || 'Create a professional ad'}"

COPY TO INCLUDE:
- Headline: "${headline || productAnalysis?.productName || 'Premium Quality'}"
- Tagline: "${tagline || ''}"
- CTA: "${cta || 'Shop Now'}"

Based on this, determine the OPTIMAL layout strategy.

Return JSON:
{
    "layoutType": "hero_product|feature_callouts|lifestyle|minimal",
    "composition": {
        "productPosition": "center|left|right|bottom-center",
        "productSize": "40-60%",
        "negativeSpaceZone": "top|top-left|top-right|left|right",
        "textZone": {
            "position": "top|bottom|left|right",
            "safeArea": {"x": 0, "y": 0, "width": 1080, "height": 300}
        }
    },
    "style": {
        "mood": "premium|playful|aggressive|minimal|cozy",
        "backgroundType": "dark_gradient|light_clean|lifestyle_blur|solid",
        "backgroundColor": "#1a1a2e",
        "accentColor": "#FF4757",
        "lighting": "studio|natural|dramatic|soft"
    },
    "elements": {
        "headline": {"fontSize": 72, "fontWeight": "bold", "color": "#FFFFFF"},
        "tagline": {"fontSize": 28, "fontWeight": "normal", "color": "#CCCCCC"},
        "cta": {"width": 200, "height": 56, "borderRadius": 28, "color": "#FF4757"}
    },
    "featureArrows": false,
    "priceBadge": false,
    "designRationale": "Brief explanation of why this layout works for this product"
}

Consider:
1. HIERARCHY: Headline 2-3x larger than tagline
2. NEGATIVE SPACE: Leave room for text, don't crowd the product
3. CONTRAST: Dark products need light backgrounds and vice versa
4. INDUSTRY: Gaming = aggressive/neon, Beauty = soft/pastel, Tech = minimal/dark`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        const layoutPlan = JSON.parse(response);

        console.log('[Strategist] ✅ Layout strategy created:', layoutPlan.layoutType);
        console.log('[Strategist] Rationale:', layoutPlan.designRationale);

        return layoutPlan;
    } catch (error) {
        console.error('[Strategist] Failed:', error.message);

        // Return sensible defaults
        return getDefaultLayout(productAnalysis);
    }
}

/**
 * Default layout for fallback
 */
function getDefaultLayout(productAnalysis) {
    const isDarkProduct = productAnalysis?.primaryColor?.startsWith('#0') ||
        productAnalysis?.primaryColor?.startsWith('#1') ||
        productAnalysis?.primaryColor?.startsWith('#2');

    return {
        layoutType: 'hero_product',
        composition: {
            productPosition: 'center',
            productSize: '50%',
            negativeSpaceZone: 'top',
            textZone: {
                position: 'top',
                safeArea: { x: 50, y: 50, width: 980, height: 250 }
            }
        },
        style: {
            mood: 'premium',
            backgroundType: isDarkProduct ? 'light_clean' : 'dark_gradient',
            backgroundColor: isDarkProduct ? '#F5F5F5' : '#1a1a2e',
            accentColor: '#FF4757',
            lighting: 'studio'
        },
        elements: {
            headline: { fontSize: 72, fontWeight: 'bold', color: isDarkProduct ? '#1a1a2e' : '#FFFFFF' },
            tagline: { fontSize: 28, fontWeight: 'normal', color: isDarkProduct ? '#666666' : '#CCCCCC' },
            cta: { width: 200, height: 56, borderRadius: 28, color: '#FF4757' }
        },
        featureArrows: false,
        priceBadge: false,
        designRationale: 'Default premium layout with product as hero'
    };
}

export default { createLayoutStrategy };
