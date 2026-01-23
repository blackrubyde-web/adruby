/**
 * Lifestyle Context Template
 * 
 * Product in real-world use with subtle text overlays.
 * Like Jungle Sneakers in water, Female Invest lifestyle shot.
 */

import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate Lifestyle Context ad
 */
export async function lifestyleContextTemplate({
    productBuffer,
    headline,
    tagline,
    features = [],
    cta,
    accentColor = '#FFFFFF',
    industry = 'lifestyle',
    mood = 'aspirational'
}) {
    console.log('[LifestyleContext] Generating lifestyle ad...');

    // Step 1: Generate lifestyle scene with product in context
    const backgroundBuffer = await generateLifestyleScene(productBuffer, industry, mood);

    // Step 2: Overlay text with subtle, elegant styling
    const finalBuffer = await compositeLifestyleOverlay({
        backgroundBuffer,
        headline,
        tagline,
        features,
        cta,
        accentColor
    });

    return {
        buffer: finalBuffer,
        template: 'lifestyle_context'
    };
}

/**
 * Generate lifestyle scene with Gemini
 */
async function generateLifestyleScene(productBuffer, industry, mood) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: { responseModalities: ['image', 'text'] }
    });

    const moodDescriptions = {
        aspirational: 'Aspirational, lifestyle, desirable. Person using product in beautiful setting.',
        adventure: 'Outdoor adventure, action, energy. Dynamic scene with motion.',
        cozy: 'Warm, comfortable, intimate. Home or relaxation setting.',
        urban: 'City life, modern, sophisticated. Urban environment.',
        nature: 'Natural, organic, peaceful. Nature or eco-friendly setting.'
    };

    const industryContexts = {
        fashion: 'Fashion editorial style, model wearing/holding product',
        outdoor: 'Outdoor adventure scene, product in active use',
        home: 'Beautiful home interior, product in living space',
        food: 'Appetizing food photography, lifestyle eating scene',
        beauty: 'Beauty editorial, soft lighting, elegant setting',
        tech: 'Modern workspace or lifestyle tech usage',
        fitness: 'Active fitness scene, gym or outdoor workout'
    };

    const prompt = `Create a premium 1080x1080 lifestyle advertisement.

CRITICAL: DO NOT RENDER ANY TEXT, HEADLINES, OR LABELS.

SCENE:
- ${moodDescriptions[mood] || moodDescriptions.aspirational}
- ${industryContexts[industry] || industryContexts.lifestyle}
- The product from input image should be visible and integrated naturally
- Product should feel like part of the scene, not pasted on

COMPOSITION:
- Full lifestyle photography style
- Rule of thirds composition
- Leave subtle space at top and bottom for text overlay
- Product visible but not dominating - it's about the lifestyle

STYLE:
- High-end editorial/commercial photography look
- Natural lighting or golden hour
- Authentic, not staged feeling
- Instagram-worthy aesthetic

OUTPUT: Beautiful lifestyle scene with product naturally integrated. NO TEXT.`;

    try {
        const parts = [];
        if (productBuffer) {
            parts.push({
                inlineData: { mimeType: 'image/png', data: productBuffer.toString('base64') }
            });
        }
        parts.push({ text: prompt });

        const result = await model.generateContent(parts);
        const candidates = result.response?.candidates;

        if (candidates?.[0]?.content?.parts) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData?.data) {
                    const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
                    return await sharp(imageBuffer)
                        .resize(1080, 1080, { fit: 'cover' })
                        .png()
                        .toBuffer();
                }
            }
        }
        throw new Error('No image in response');
    } catch (error) {
        console.error('[LifestyleContext] Gemini failed:', error.message);
        return createFallbackLifestyleBackground();
    }
}

/**
 * Composite lifestyle text overlay
 */
async function compositeLifestyleOverlay({
    backgroundBuffer,
    headline,
    tagline,
    features,
    cta,
    accentColor
}) {
    const svg = buildLifestyleSvg({
        headline,
        tagline,
        features,
        cta,
        accentColor
    });

    const svgBuffer = Buffer.from(svg);

    return await sharp(backgroundBuffer)
        .composite([{
            input: svgBuffer,
            top: 0,
            left: 0
        }])
        .png({ quality: 100 })
        .toBuffer();
}

/**
 * Build lifestyle SVG overlay - elegant, minimal
 */
function buildLifestyleSvg({ headline, tagline, features, cta, accentColor }) {
    const escapeXml = (text) => {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    };

    // Feature labels with elegant lines (like Jungle Sneakers)
    let featureElements = '';
    const featurePositions = [
        { x: 180, y: 350, lineEnd: { x: 350, y: 420 } },
        { x: 180, y: 650, lineEnd: { x: 350, y: 600 } },
        { x: 900, y: 500, lineEnd: { x: 730, y: 520 } }
    ];

    features.slice(0, 3).forEach((feature, i) => {
        if (!feature) return;
        const pos = featurePositions[i];
        const isLeft = pos.x < 540;

        featureElements += `
            <!-- Feature line -->
            <line 
                x1="${pos.lineEnd.x}" y1="${pos.lineEnd.y}" 
                x2="${pos.x}" y2="${pos.y}" 
                stroke="white" 
                stroke-width="1.5"
                opacity="0.8"
            />
            <circle cx="${pos.lineEnd.x}" cy="${pos.lineEnd.y}" r="4" fill="white"/>
            
            <!-- Feature label -->
            <text 
                x="${pos.x}" y="${pos.y}" 
                font-family="Inter, Arial, sans-serif"
                font-size="18"
                font-weight="500"
                fill="white"
                text-anchor="${isLeft ? 'start' : 'end'}"
                filter="url(#textGlow)"
            >${escapeXml(feature)}</text>
        `;
    });

    return `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&amp;display=swap');
        </style>
        
        <!-- Text glow for readability on photo -->
        <filter id="textGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="#000000" flood-opacity="0.7"/>
        </filter>
        
        <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="10" flood-color="#000000" flood-opacity="0.8"/>
        </filter>
    </defs>

    <!-- Subtle gradient overlay for text area -->
    <defs>
        <linearGradient id="topFade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#000000;stop-opacity:0.4"/>
            <stop offset="100%" style="stop-color:#000000;stop-opacity:0"/>
        </linearGradient>
        <linearGradient id="bottomFade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#000000;stop-opacity:0"/>
            <stop offset="100%" style="stop-color:#000000;stop-opacity:0.5"/>
        </linearGradient>
    </defs>
    <rect x="0" y="0" width="1080" height="200" fill="url(#topFade)"/>
    <rect x="0" y="880" width="1080" height="200" fill="url(#bottomFade)"/>

    <!-- Brand/Headline at top - elegant serif font -->
    ${headline ? `
    <text 
        x="540" y="80" 
        font-family="Playfair Display, Georgia, serif"
        font-size="52"
        font-weight="500"
        font-style="italic"
        fill="white"
        text-anchor="middle"
        filter="url(#strongGlow)"
    >${escapeXml(headline)}</text>
    ` : ''}

    <!-- Tagline -->
    ${tagline ? `
    <text 
        x="540" y="130" 
        font-family="Inter, Arial, sans-serif"
        font-size="22"
        font-weight="400"
        fill="white"
        text-anchor="middle"
        filter="url(#textGlow)"
    >${escapeXml(tagline)}</text>
    ` : ''}

    <!-- Feature labels with lines -->
    ${featureElements}

    <!-- CTA at bottom -->
    ${cta ? `
    <text 
        x="540" y="1000" 
        font-family="Inter, Arial, sans-serif"
        font-size="18"
        font-weight="500"
        fill="white"
        text-anchor="middle"
        filter="url(#textGlow)"
        text-decoration="underline"
    >${escapeXml(cta)}</text>
    ` : ''}

</svg>`;
}

/**
 * Create fallback lifestyle background
 */
async function createFallbackLifestyleBackground() {
    // Create a moody gradient as fallback
    const svg = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#1a3a52"/>
                <stop offset="50%" style="stop-color:#2d5a5a"/>
                <stop offset="100%" style="stop-color:#3d4a4a"/>
            </linearGradient>
        </defs>
        <rect width="1080" height="1080" fill="url(#bg)"/>
    </svg>`;
    return await sharp(Buffer.from(svg)).png().toBuffer();
}

export default { lifestyleContextTemplate };
