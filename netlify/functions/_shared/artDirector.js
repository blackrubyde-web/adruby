/**
 * ART DIRECTOR - Coordinate Extractor
 * 
 * Layer 3 of the Pipeline
 * Analyzes the clean canvas and determines exact X/Y coordinates
 * for text overlay placement.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyze clean canvas and get overlay coordinates
 * @returns {Object} Exact pixel coordinates for all text elements
 */
export async function getOverlayCoordinates({
    cleanCanvasBuffer,
    layoutPlan,
    copy
}) {
    console.log('[ArtDirector] 📐 Analyzing image for optimal text placement...');

    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
        generationConfig: {
            responseMimeType: 'application/json'
        }
    });

    const prompt = `You are an Art Director analyzing an advertisement image.
Your job: Determine EXACT pixel coordinates for text overlay placement.

IMAGE SIZE: 1080 x 1080 pixels

TEXT TO PLACE:
- Headline: "${copy.headline}" (primary, large, bold)
- Tagline: "${copy.tagline || ''}" (secondary, smaller)
- CTA Button: "${copy.cta}" (bottom, clickable button)

LAYOUT GUIDANCE:
- Preferred text zone: ${layoutPlan?.composition?.textZone?.position || 'top'}
- Product position: ${layoutPlan?.composition?.productPosition || 'center'}
- Style: ${layoutPlan?.style?.mood || 'premium'}

Analyze the image and find the BEST positions for each element.
Consider:
1. Text should be in EMPTY space, not overlapping the product
2. Headline should be prominent and immediately visible
3. CTA should be at the bottom, clearly tappable
4. Maintain visual hierarchy (headline > tagline > cta)

Return JSON with EXACT pixel coordinates:
{
    "headline": {
        "x": 540,
        "y": 100,
        "maxWidth": 900,
        "fontSize": 72,
        "fontWeight": "bold",
        "color": "#FFFFFF",
        "textAlign": "center",
        "lineHeight": 1.1
    },
    "tagline": {
        "x": 540,
        "y": 180,
        "maxWidth": 800,
        "fontSize": 28,
        "fontWeight": "normal",
        "color": "#CCCCCC",
        "textAlign": "center",
        "lineHeight": 1.3
    },
    "cta": {
        "x": 440,
        "y": 950,
        "width": 200,
        "height": 56,
        "borderRadius": 28,
        "backgroundColor": "${layoutPlan?.style?.accentColor || '#FF4757'}",
        "textColor": "#FFFFFF",
        "fontSize": 18,
        "fontWeight": "bold"
    },
    "featureArrows": [],
    "safeZones": {
        "productArea": {"x": 200, "y": 250, "width": 680, "height": 650},
        "textArea": {"x": 50, "y": 30, "width": 980, "height": 200}
    },
    "recommendations": "Brief note on placement choices"
}

IMPORTANT:
- x,y coordinates are from TOP-LEFT corner
- For centered text, x should be 540 (center of 1080)
- CTA button x is the LEFT edge of the button
- All values must be integers`;

    try {
        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: 'image/png',
                    data: cleanCanvasBuffer.toString('base64')
                }
            },
            { text: prompt }
        ]);

        const response = result.response.text();
        const coordinates = JSON.parse(response);

        console.log('[ArtDirector] ✅ Coordinates extracted');
        console.log('[ArtDirector] Headline at:', coordinates.headline?.x, coordinates.headline?.y);
        console.log('[ArtDirector] CTA at:', coordinates.cta?.x, coordinates.cta?.y);

        return coordinates;
    } catch (error) {
        console.error('[ArtDirector] ❌ Failed:', error.message);

        // Return sensible defaults
        return getDefaultCoordinates(layoutPlan, copy);
    }
}

/**
 * Default coordinates based on layout plan
 */
function getDefaultCoordinates(layoutPlan, copy) {
    const accentColor = layoutPlan?.style?.accentColor || '#FF4757';
    const textColor = layoutPlan?.style?.mood === 'light' ? '#1a1a2e' : '#FFFFFF';
    const subTextColor = layoutPlan?.style?.mood === 'light' ? '#666666' : '#CCCCCC';

    return {
        headline: {
            x: 540,
            y: 100,
            maxWidth: 900,
            fontSize: 64,
            fontWeight: 'bold',
            color: textColor,
            textAlign: 'center',
            lineHeight: 1.1
        },
        tagline: copy.tagline ? {
            x: 540,
            y: 175,
            maxWidth: 800,
            fontSize: 24,
            fontWeight: 'normal',
            color: subTextColor,
            textAlign: 'center',
            lineHeight: 1.3
        } : null,
        cta: {
            x: 440,
            y: 960,
            width: 200,
            height: 56,
            borderRadius: 28,
            backgroundColor: accentColor,
            textColor: '#FFFFFF',
            fontSize: 18,
            fontWeight: 'bold'
        },
        featureArrows: [],
        safeZones: {
            productArea: { x: 150, y: 200, width: 780, height: 700 },
            textArea: { x: 50, y: 40, width: 980, height: 180 }
        },
        recommendations: 'Default centered layout with headline at top, CTA at bottom'
    };
}

export default { getOverlayCoordinates };
