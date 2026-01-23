/**
 * ART DIRECTOR - 10/10 VERSION
 * 
 * Layer 3: Intelligent coordinate extraction for text placement.
 * Returns pixel-precise positions based on image analysis.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get optimal text overlay coordinates
 */
export async function getOverlayCoordinates({ cleanCanvasBuffer, layoutPlan, copy }) {
    console.log('[ArtDirector] 📐 Calculating optimal text positions...');

    const composition = layoutPlan?.composition || {};
    const typography = layoutPlan?.typography || {};
    const negativeSpace = composition.negativeSpaceZone || 'top';

    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `Analyze this ad image and determine EXACT pixel coordinates for text.

IMAGE: 1080 x 1080 pixels
NEGATIVE SPACE: ${negativeSpace}

TEXT TO PLACE:
- Headline: "${copy.headline}" (must be prominent, large)
- Tagline: "${copy.tagline || ''}" (smaller, below headline)
- CTA: "${copy.cta}" (button at bottom)

TYPOGRAPHY GUIDANCE:
- Headline size: ${typography.headline?.fontSize || 64}px
- Tagline size: ${typography.tagline?.fontSize || 24}px

Return JSON with PIXEL coordinates (x,y from TOP-LEFT):
{
    "headline": {
        "x": 540,
        "y": 100,
        "fontSize": ${typography.headline?.fontSize || 64},
        "fontWeight": ${typography.headline?.fontWeight || 700},
        "color": "${typography.headline?.color || '#FFFFFF'}",
        "textAlign": "center",
        "shadow": true
    },
    "tagline": ${copy.tagline ? `{
        "x": 540,
        "y": 170,
        "fontSize": ${typography.tagline?.fontSize || 24},
        "fontWeight": 400,
        "color": "${typography.tagline?.color || '#CCCCCC'}",
        "textAlign": "center"
    }` : 'null'},
    "cta": {
        "x": 430,
        "y": 970,
        "width": ${typography.cta?.width || 220},
        "height": ${typography.cta?.height || 56},
        "borderRadius": ${typography.cta?.borderRadius || 28},
        "fontSize": ${typography.cta?.fontSize || 18},
        "fontWeight": 600
    },
    "analysis": "Brief note on placement"
}

RULES:
- x=540 = horizontally centered (for center-aligned text)
- Place text in EMPTY space, never over product
- Headline y should be 80-120px for top placement
- CTA y should be 950-980px (near bottom)
- Ensure readable contrast`;

    try {
        const result = await model.generateContent([
            { inlineData: { mimeType: 'image/png', data: cleanCanvasBuffer.toString('base64') } },
            { text: prompt }
        ]);

        const coords = JSON.parse(result.response.text());
        console.log('[ArtDirector] ✅ Coordinates:', coords.headline?.y, coords.cta?.y);
        return coords;
    } catch (error) {
        console.error('[ArtDirector] ❌ Failed:', error.message);
        return getDefaultCoords(layoutPlan, copy);
    }
}

function getDefaultCoords(layoutPlan, copy) {
    const typography = layoutPlan?.typography || {};
    const negativeSpace = layoutPlan?.composition?.negativeSpaceZone || 'top';

    // Position based on negative space zone
    const headlineY = negativeSpace === 'top' ? 100 : negativeSpace === 'bottom' ? 900 : 100;
    const taglineY = headlineY + 70;

    return {
        headline: {
            x: 540, y: headlineY,
            fontSize: typography.headline?.fontSize || 64,
            fontWeight: typography.headline?.fontWeight || 700,
            color: typography.headline?.color || '#FFFFFF',
            textAlign: 'center', shadow: true
        },
        tagline: copy.tagline ? {
            x: 540, y: taglineY,
            fontSize: typography.tagline?.fontSize || 24,
            fontWeight: 400,
            color: typography.tagline?.color || '#CCCCCC',
            textAlign: 'center'
        } : null,
        cta: {
            x: 430, y: 970,
            width: typography.cta?.width || 220,
            height: typography.cta?.height || 56,
            borderRadius: typography.cta?.borderRadius || 28,
            fontSize: typography.cta?.fontSize || 18,
            fontWeight: 600
        },
        analysis: 'Default positions'
    };
}

export default { getOverlayCoordinates };
