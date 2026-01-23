/**
 * Stats Grid Template
 * 
 * Product surrounded by impressive statistics.
 * Like Oats Overnight - 20g Protein, 900k+ Customers, etc.
 */

import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate Stats Grid ad
 */
export async function statsGridTemplate({
    productBuffer,
    headline,
    tagline,
    stats = [],
    cta,
    accentColor = '#8B4513',
    backgroundColor = '#FFF8E7',
    industry = 'food'
}) {
    console.log('[StatsGrid] Generating stats grid ad...');

    const colors = getIndustryColors(industry, backgroundColor, accentColor);

    // Step 1: Generate clean product scene
    const backgroundBuffer = await generateProductScene(productBuffer, colors);

    // Step 2: Overlay stats and text
    const finalBuffer = await compositeStatsOverlay({
        backgroundBuffer,
        headline,
        tagline,
        stats,
        cta,
        colors
    });

    return {
        buffer: finalBuffer,
        template: 'stats_grid'
    };
}

/**
 * Generate product scene
 */
async function generateProductScene(productBuffer, colors) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: { responseModalities: ['image', 'text'] }
    });

    const prompt = `Create a premium 1080x1080 product advertisement.

CRITICAL: DO NOT RENDER ANY TEXT, NUMBERS, STATISTICS, OR LABELS.

COMPOSITION:
- Product from input image placed CENTER
- Product occupies 40-45% of frame
- Leave GENEROUS space on LEFT and RIGHT sides for statistics
- Leave space at TOP for headline
- Leave space at BOTTOM for CTA

BACKGROUND:
- Solid gradient from ${colors.backgroundTop} to ${colors.backgroundBottom}
- Clean, professional look
- Optional: subtle decorative elements related to product (e.g., cookie crumbs for food)

STYLE: Premium e-commerce, appetizing/aspirational
LIGHTING: Soft, flattering studio lighting

OUTPUT: Clean product centered with space for stats overlay. NO TEXT OR NUMBERS.`;

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
        console.error('[StatsGrid] Gemini failed:', error.message);
        return createFallbackBackground(colors);
    }
}

/**
 * Composite stats overlay
 */
async function compositeStatsOverlay({
    backgroundBuffer,
    headline,
    tagline,
    stats,
    cta,
    colors
}) {
    const svg = buildStatsSvg({
        headline,
        tagline,
        stats,
        cta,
        accentColor: colors.accent
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
 * Build stats SVG with arrows pointing to product
 */
function buildStatsSvg({ headline, tagline, stats, cta, accentColor }) {
    const escapeXml = (text) => {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    };

    // Stat positions - left side and right side
    const statPositions = [
        { x: 120, y: 380, arrowEnd: { x: 320, y: 450 }, side: 'left' },   // Left top
        { x: 120, y: 520, arrowEnd: { x: 320, y: 540 }, side: 'left' },   // Left middle
        { x: 120, y: 660, arrowEnd: { x: 320, y: 630 }, side: 'left' },   // Left bottom
        { x: 960, y: 380, arrowEnd: { x: 760, y: 450 }, side: 'right' },  // Right top
        { x: 960, y: 520, arrowEnd: { x: 760, y: 540 }, side: 'right' },  // Right middle
        { x: 960, y: 660, arrowEnd: { x: 760, y: 630 }, side: 'right' },  // Right bottom
    ];

    let statsElements = '';
    stats.slice(0, 6).forEach((stat, index) => {
        if (!stat) return;
        const pos = statPositions[index];
        const isLeft = pos.side === 'left';
        const textAnchor = isLeft ? 'start' : 'end';
        const arrowStart = isLeft ? { x: pos.x + 60, y: pos.y + 30 } : { x: pos.x - 60, y: pos.y + 30 };

        // Curved arrow path
        const midX = (arrowStart.x + pos.arrowEnd.x) / 2;
        const controlY = (arrowStart.y + pos.arrowEnd.y) / 2;

        statsElements += `
            <!-- Stat ${index + 1} -->
            <text 
                x="${pos.x}" y="${pos.y}" 
                font-family="Inter, Arial, sans-serif"
                font-size="42"
                font-weight="800"
                fill="${accentColor}"
                text-anchor="${textAnchor}"
            >${escapeXml(stat.value || stat)}</text>
            <text 
                x="${pos.x}" y="${pos.y + 32}" 
                font-family="Inter, Arial, sans-serif"
                font-size="16"
                font-weight="500"
                fill="#333333"
                text-anchor="${textAnchor}"
                text-transform="uppercase"
                letter-spacing="1"
            >${escapeXml(stat.label || '')}</text>
            
            <!-- Arrow -->
            <path 
                d="M ${arrowStart.x} ${arrowStart.y} Q ${midX} ${controlY} ${pos.arrowEnd.x} ${pos.arrowEnd.y}"
                stroke="${accentColor}"
                stroke-width="2"
                fill="none"
                stroke-dasharray="4,3"
                opacity="0.6"
            />
            <circle cx="${pos.arrowEnd.x}" cy="${pos.arrowEnd.y}" r="4" fill="${accentColor}"/>
        `;
    });

    // CTA button
    const ctaWidth = 200;
    const ctaHeight = 50;
    const ctaX = (1080 - ctaWidth) / 2;
    const ctaY = 980;

    return `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap');
        </style>
        <filter id="textShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.15"/>
        </filter>
    </defs>

    <!-- Headline -->
    ${headline ? `
    <text 
        x="540" y="80" 
        font-family="Inter, Arial, sans-serif"
        font-size="40"
        font-weight="700"
        fill="#1a1a1a"
        text-anchor="middle"
        filter="url(#textShadow)"
    >${escapeXml(headline)}</text>
    ` : ''}

    <!-- Tagline -->
    ${tagline ? `
    <text 
        x="540" y="125" 
        font-family="Inter, Arial, sans-serif"
        font-size="20"
        font-weight="400"
        fill="#666666"
        text-anchor="middle"
    >${escapeXml(tagline)}</text>
    ` : ''}

    <!-- Stats with arrows -->
    ${statsElements}

    <!-- Price badge (optional) -->
    <g transform="translate(540, 240)">
        <rect x="-70" y="-25" width="140" height="50" rx="25" fill="${accentColor}" opacity="0.9"/>
        <text 
            x="0" y="8" 
            font-family="Inter, Arial, sans-serif"
            font-size="18"
            font-weight="600"
            fill="white"
            text-anchor="middle"
        >AS LOW AS $2.63</text>
    </g>

    <!-- CTA Button -->
    ${cta ? `
    <rect x="${ctaX}" y="${ctaY}" width="${ctaWidth}" height="${ctaHeight}" rx="25" fill="${accentColor}"/>
    <text 
        x="540" y="${ctaY + 32}" 
        font-family="Inter, Arial, sans-serif"
        font-size="16"
        font-weight="600"
        fill="white"
        text-anchor="middle"
    >${escapeXml(cta)}</text>
    ` : ''}

</svg>`;
}

/**
 * Get industry colors
 */
function getIndustryColors(industry, bgOverride, accentOverride) {
    const palettes = {
        food: { backgroundTop: '#FFF8E7', backgroundBottom: '#FFE8CC', accent: '#8B4513' },
        supplements: { backgroundTop: '#F0FFF0', backgroundBottom: '#E8F8E8', accent: '#27AE60' },
        fitness: { backgroundTop: '#FFF5F5', backgroundBottom: '#FFE8E8', accent: '#E74C3C' },
        beauty: { backgroundTop: '#FFF0F5', backgroundBottom: '#FFE4EC', accent: '#E91E63' },
        saas: { backgroundTop: '#F0F4FF', backgroundBottom: '#E4E8F8', accent: '#6366F1' },
        default: { backgroundTop: '#F8F8F8', backgroundBottom: '#EBEBEB', accent: '#333333' }
    };

    const palette = palettes[industry] || palettes.default;
    return {
        backgroundTop: bgOverride || palette.backgroundTop,
        backgroundBottom: palette.backgroundBottom,
        accent: accentOverride || palette.accent
    };
}

/**
 * Fallback background
 */
async function createFallbackBackground(colors) {
    const svg = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:${colors.backgroundTop}"/>
                <stop offset="100%" style="stop-color:${colors.backgroundBottom}"/>
            </linearGradient>
        </defs>
        <rect width="1080" height="1080" fill="url(#bg)"/>
    </svg>`;
    return await sharp(Buffer.from(svg)).png().toBuffer();
}

export default { statsGridTemplate };
