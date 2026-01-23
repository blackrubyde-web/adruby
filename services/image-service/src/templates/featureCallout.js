/**
 * Feature Callout Template
 * 
 * Product centered with dotted lines radiating to feature labels.
 * Like Pureful Yoga Mat, Jungle Sneakers, etc.
 */

import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate Feature Callout ad
 */
export async function featureCalloutTemplate({
    productBuffer,
    headline,
    tagline,
    features = [],
    accentColor = '#27AE60',
    backgroundColor = '#E8F8E8',
    industry = 'default'
}) {
    console.log('[FeatureCallout] Generating feature callout ad...');

    // Get industry-specific colors if not provided
    const colors = getIndustryColors(industry, backgroundColor, accentColor);

    // Step 1: Generate clean background with product using Gemini
    const backgroundBuffer = await generateProductScene(productBuffer, colors, industry);

    // Step 2: Overlay feature callout lines and labels
    const finalBuffer = await compositeFeatureOverlay({
        backgroundBuffer,
        headline,
        tagline,
        features,
        accentColor: colors.accent
    });

    return {
        buffer: finalBuffer,
        template: 'feature_callout'
    };
}

/**
 * Generate product scene with Gemini
 */
async function generateProductScene(productBuffer, colors, industry) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: { responseModalities: ['image', 'text'] }
    });

    const prompt = `Create a premium 1080x1080 product advertisement.

CRITICAL: DO NOT RENDER ANY TEXT, LABELS, OR WORDS.

COMPOSITION:
- The product from the input image must be EXACTLY preserved and placed CENTER
- Product should occupy 40-50% of the frame
- Clean, professional studio-style lighting
- Subtle drop shadow beneath product

BACKGROUND:
- Solid gradient background from ${colors.backgroundTop} to ${colors.backgroundBottom}
- Optional: Very subtle radial glow behind product (${colors.glow})
- Keep background CLEAN - no decorative elements

STYLE: Premium e-commerce, Meta 2026 standard
PRODUCT PLACEMENT: Centered, slightly above center point

OUTPUT: Clean product shot ready for text/label overlay. NO TEXT.`;

    try {
        const parts = [];
        if (productBuffer) {
            parts.push({
                inlineData: {
                    mimeType: 'image/png',
                    data: productBuffer.toString('base64')
                }
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
        console.error('[FeatureCallout] Gemini failed, using fallback:', error.message);
        return createFallbackBackground(colors);
    }
}

/**
 * Composite feature labels with dotted lines
 */
async function compositeFeatureOverlay({
    backgroundBuffer,
    headline,
    tagline,
    features,
    accentColor
}) {
    // Feature positions (clockwise from top-left)
    const featurePositions = [
        { x: 150, y: 280, anchorX: 350, anchorY: 350, align: 'right' },   // Top-left
        { x: 930, y: 280, anchorX: 730, anchorY: 350, align: 'left' },    // Top-right
        { x: 150, y: 540, anchorX: 350, anchorY: 540, align: 'right' },   // Middle-left
        { x: 930, y: 540, anchorX: 730, anchorY: 540, align: 'left' },    // Middle-right
        { x: 150, y: 780, anchorX: 350, anchorY: 700, align: 'right' },   // Bottom-left
        { x: 930, y: 780, anchorX: 730, anchorY: 700, align: 'left' },    // Bottom-right
    ];

    const svg = buildFeatureCalloutSvg({
        headline,
        tagline,
        features,
        positions: featurePositions,
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
 * Build SVG with headline, tagline, and feature labels
 */
function buildFeatureCalloutSvg({ headline, tagline, features, positions, accentColor }) {
    const escapeXml = (text) => {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    };

    // Generate feature labels with lines
    let featureElements = '';
    features.slice(0, 6).forEach((feature, index) => {
        if (!feature) return;
        const pos = positions[index];

        // Dotted line from anchor to label
        featureElements += `
            <line 
                x1="${pos.anchorX}" y1="${pos.anchorY}" 
                x2="${pos.x}" y2="${pos.y}" 
                stroke="#333333" 
                stroke-width="1.5" 
                stroke-dasharray="6,4"
                opacity="0.7"
            />
            <circle cx="${pos.anchorX}" cy="${pos.anchorY}" r="6" fill="${accentColor}"/>
            <circle cx="${pos.anchorX}" cy="${pos.anchorY}" r="3" fill="white"/>
            <text 
                x="${pos.x}" 
                y="${pos.y + 5}" 
                font-family="Inter, Arial, sans-serif"
                font-size="22"
                font-weight="500"
                fill="#1a1a1a"
                text-anchor="${pos.align === 'right' ? 'end' : 'start'}"
            >${escapeXml(feature)}</text>
        `;
    });

    return `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap');
        </style>
        <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.15"/>
        </filter>
    </defs>

    <!-- Headline at top -->
    ${headline ? `
    <text 
        x="540" y="100" 
        font-family="Inter, Arial, sans-serif"
        font-size="48"
        font-weight="700"
        fill="#1a1a1a"
        text-anchor="middle"
        filter="url(#textShadow)"
    >${escapeXml(headline)}</text>
    ` : ''}

    <!-- Tagline below headline -->
    ${tagline ? `
    <text 
        x="540" y="150" 
        font-family="Inter, Arial, sans-serif"
        font-size="22"
        font-weight="400"
        fill="#666666"
        text-anchor="middle"
    >${escapeXml(tagline)}</text>
    ` : ''}

    <!-- Feature callout lines and labels -->
    ${featureElements}

    <!-- Bottom tagline/CTA area -->
    <text 
        x="540" y="1020" 
        font-family="Inter, Arial, sans-serif"
        font-size="18"
        font-weight="400"
        fill="#888888"
        text-anchor="middle"
    >(And more great features too)</text>

</svg>`;
}

/**
 * Get industry-specific colors
 */
function getIndustryColors(industry, bgOverride, accentOverride) {
    const palettes = {
        eco: {
            backgroundTop: '#E8F8E8', backgroundBottom: '#D4EDD4',
            accent: '#27AE60', glow: 'rgba(39, 174, 96, 0.15)'
        },
        tech: {
            backgroundTop: '#F0F4F8', backgroundBottom: '#E2E8F0',
            accent: '#3498DB', glow: 'rgba(52, 152, 219, 0.15)'
        },
        food: {
            backgroundTop: '#FFF8E7', backgroundBottom: '#FFE8CC',
            accent: '#E67E22', glow: 'rgba(230, 126, 34, 0.15)'
        },
        beauty: {
            backgroundTop: '#FFF0F5', backgroundBottom: '#FFE4EC',
            accent: '#E91E63', glow: 'rgba(233, 30, 99, 0.15)'
        },
        fitness: {
            backgroundTop: '#1a1a2e', backgroundBottom: '#0f0f1a',
            accent: '#FF5722', glow: 'rgba(255, 87, 34, 0.2)'
        },
        default: {
            backgroundTop: '#F5F5F5', backgroundBottom: '#EBEBEB',
            accent: '#333333', glow: 'rgba(0, 0, 0, 0.1)'
        }
    };

    const palette = palettes[industry] || palettes.default;

    return {
        backgroundTop: bgOverride || palette.backgroundTop,
        backgroundBottom: palette.backgroundBottom,
        accent: accentOverride || palette.accent,
        glow: palette.glow
    };
}

/**
 * Create fallback gradient background
 */
async function createFallbackBackground(colors) {
    const svg = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:${colors.backgroundTop}"/>
                <stop offset="100%" style="stop-color:${colors.backgroundBottom}"/>
            </linearGradient>
            <radialGradient id="glow" cx="50%" cy="45%" r="35%">
                <stop offset="0%" style="stop-color:${colors.accent};stop-opacity:0.1"/>
                <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0"/>
            </radialGradient>
        </defs>
        <rect width="1080" height="1080" fill="url(#bg)"/>
        <ellipse cx="540" cy="480" rx="380" ry="280" fill="url(#glow)"/>
    </svg>`;

    return await sharp(Buffer.from(svg)).png().toBuffer();
}

export default { featureCalloutTemplate };
