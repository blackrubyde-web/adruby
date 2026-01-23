/**
 * Comparison Split Template
 * 
 * Before/After or Us vs. Them side-by-side comparison.
 * Like Wild (refillable vs landfill), Birddogs (before/after).
 */

import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate Comparison Split ad
 */
export async function comparisonSplitTemplate({
    productBuffer,
    headline,
    comparisonData = {},
    cta,
    accentColor = '#27AE60',
    industry = 'eco'
}) {
    console.log('[ComparisonSplit] Generating comparison ad...');

    const {
        leftTitle = 'Before',
        rightTitle = 'After',
        leftPoints = [],
        rightPoints = [],
        leftEmoji = '👎',
        rightEmoji = '👍'
    } = comparisonData;

    // Step 1: Generate split background with products
    const backgroundBuffer = await generateSplitScene(productBuffer, industry);

    // Step 2: Overlay comparison text
    const finalBuffer = await compositeComparisonOverlay({
        backgroundBuffer,
        headline,
        leftTitle,
        rightTitle,
        leftPoints,
        rightPoints,
        leftEmoji,
        rightEmoji,
        cta,
        accentColor
    });

    return {
        buffer: finalBuffer,
        template: 'comparison_split'
    };
}

/**
 * Generate split scene with Gemini
 */
async function generateSplitScene(productBuffer, industry) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: { responseModalities: ['image', 'text'] }
    });

    const prompt = `Create a premium 1080x1080 comparison advertisement.

CRITICAL: DO NOT RENDER ANY TEXT, LABELS, CHECKMARKS, OR X MARKS.

COMPOSITION:
- SPLIT the image vertically into two halves
- LEFT SIDE: Slightly desaturated, muted tones, representing "old/bad" option
- RIGHT SIDE: Vibrant, fresh colors, representing "new/good" option
- The product from input should appear on the RIGHT side
- Leave space at TOP for headline (top 15%)
- Leave space at BOTTOM for bullet points and CTA

STYLE:
- Left side: Slightly grayish, less appealing
- Right side: Clean, bright, premium
- Clear visual distinction between the two sides
- Subtle vertical divider line in middle

OUTPUT: Split comparison scene ready for text overlay. NO TEXT.`;

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
        console.error('[ComparisonSplit] Gemini failed:', error.message);
        return createFallbackSplitBackground();
    }
}

/**
 * Composite comparison overlay
 */
async function compositeComparisonOverlay({
    backgroundBuffer,
    headline,
    leftTitle,
    rightTitle,
    leftPoints,
    rightPoints,
    leftEmoji,
    rightEmoji,
    cta,
    accentColor
}) {
    const svg = buildComparisonSvg({
        headline,
        leftTitle,
        rightTitle,
        leftPoints,
        rightPoints,
        leftEmoji,
        rightEmoji,
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
 * Build comparison SVG
 */
function buildComparisonSvg({
    headline,
    leftTitle,
    rightTitle,
    leftPoints,
    rightPoints,
    leftEmoji,
    rightEmoji,
    cta,
    accentColor
}) {
    const escapeXml = (text) => {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    };

    // Build left side bullet points (with X marks)
    let leftPointsHtml = '';
    leftPoints.slice(0, 4).forEach((point, i) => {
        leftPointsHtml += `
            <g transform="translate(40, ${700 + i * 55})">
                <rect x="0" y="-22" width="230" height="44" rx="22" fill="white" opacity="0.95"/>
                <text x="20" y="8" font-family="Inter, Arial, sans-serif" font-size="14" fill="#E74C3C" font-weight="600">✗</text>
                <text x="45" y="8" font-family="Inter, Arial, sans-serif" font-size="16" fill="#333" font-weight="500">${escapeXml(point)}</text>
            </g>
        `;
    });

    // Build right side bullet points (with checkmarks)
    let rightPointsHtml = '';
    rightPoints.slice(0, 4).forEach((point, i) => {
        rightPointsHtml += `
            <g transform="translate(810, ${700 + i * 55})">
                <rect x="0" y="-22" width="230" height="44" rx="22" fill="white" opacity="0.95"/>
                <text x="20" y="8" font-family="Inter, Arial, sans-serif" font-size="14" fill="${accentColor}" font-weight="600">✓</text>
                <text x="45" y="8" font-family="Inter, Arial, sans-serif" font-size="16" fill="#333" font-weight="500">${escapeXml(point)}</text>
            </g>
        `;
    });

    return `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap');
        </style>
        <filter id="titleShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.2"/>
        </filter>
        <filter id="cardShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.15"/>
        </filter>
    </defs>

    <!-- Headline -->
    ${headline ? `
    <text 
        x="540" y="70" 
        font-family="Inter, Arial, sans-serif"
        font-size="48"
        font-weight="800"
        fill="#1a1a1a"
        text-anchor="middle"
        filter="url(#titleShadow)"
    >${escapeXml(headline)}</text>
    ` : ''}

    <!-- Left side title (Before/Bad option) -->
    <g transform="translate(270, 140)">
        <rect x="-120" y="-35" width="240" height="70" rx="35" fill="#E8E8E8" filter="url(#cardShadow)"/>
        <text 
            x="0" y="12" 
            font-family="Inter, Arial, sans-serif"
            font-size="28"
            font-weight="700"
            fill="#666666"
            text-anchor="middle"
        >${escapeXml(leftTitle)}</text>
    </g>

    <!-- Right side title (After/Good option) -->
    <g transform="translate(810, 140)">
        <rect x="-120" y="-35" width="240" height="70" rx="35" fill="white" filter="url(#cardShadow)"/>
        <text 
            x="0" y="12" 
            font-family="Inter, Arial, sans-serif"
            font-size="28"
            font-weight="700"
            fill="#1a1a1a"
            text-anchor="middle"
        >${escapeXml(rightTitle)}</text>
    </g>

    <!-- Left points -->
    ${leftPointsHtml}

    <!-- Right points -->
    ${rightPointsHtml}

    <!-- Emoji indicators -->
    <text x="270" y="950" font-size="48" text-anchor="middle">${leftEmoji}${leftEmoji}${leftEmoji}</text>
    <text x="810" y="950" font-size="48" text-anchor="middle">${rightEmoji}${rightEmoji}${rightEmoji}</text>

    <!-- CTA Button -->
    ${cta ? `
    <g transform="translate(540, 1020)">
        <rect x="-130" y="-28" width="260" height="56" rx="28" fill="${accentColor}"/>
        <text 
            x="0" y="8" 
            font-family="Inter, Arial, sans-serif"
            font-size="18"
            font-weight="600"
            fill="white"
            text-anchor="middle"
        >${escapeXml(cta)}</text>
    </g>
    ` : ''}

</svg>`;
}

/**
 * Create fallback split background
 */
async function createFallbackSplitBackground() {
    const svg = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
        <!-- Left side (muted) -->
        <rect x="0" y="0" width="540" height="1080" fill="#D0D0D8"/>
        <!-- Right side (fresh) -->
        <rect x="540" y="0" width="540" height="1080" fill="#E8F5E9"/>
        <!-- Divider line -->
        <line x1="540" y1="0" x2="540" y2="1080" stroke="#999999" stroke-width="2" opacity="0.5"/>
    </svg>`;
    return await sharp(Buffer.from(svg)).png().toBuffer();
}

export default { comparisonSplitTemplate };
