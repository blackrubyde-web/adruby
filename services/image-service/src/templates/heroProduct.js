/**
 * Hero Product Template
 * 
 * Clean, bold product shot with prominent headline.
 * Most versatile template - works for any product.
 */

import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate Hero Product ad
 */
export async function heroProductTemplate({
    productBuffer,
    headline,
    tagline,
    cta,
    accentColor = '#FF4757',
    backgroundColor,
    industry = 'default',
    style = 'dark'
}) {
    console.log('[HeroProduct] Generating hero product ad...');

    const colors = getStyleColors(style, industry, accentColor, backgroundColor);

    // Step 1: Generate dramatic product scene
    const backgroundBuffer = await generateHeroScene(productBuffer, colors, style);

    // Step 2: Overlay text elements
    const finalBuffer = await compositeHeroOverlay({
        backgroundBuffer,
        headline,
        tagline,
        cta,
        colors,
        style
    });

    return {
        buffer: finalBuffer,
        template: 'hero_product'
    };
}

/**
 * Generate hero product scene with Gemini
 */
async function generateHeroScene(productBuffer, colors, style) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: { responseModalities: ['image', 'text'] }
    });

    const styleDescriptions = {
        dark: `
            - Deep gradient background from ${colors.backgroundTop} to ${colors.backgroundBottom}
            - Dramatic studio lighting from top-left
            - Subtle ambient glow behind product (${colors.glow})
            - Product reflection on dark surface
            - Premium, moody atmosphere`,
        light: `
            - Clean white/light gray gradient background
            - Soft, diffused studio lighting
            - Minimal shadows, airy feel
            - Product floating on clean surface
            - Fresh, modern aesthetic`,
        colorful: `
            - Vibrant gradient background with brand colors
            - Bold, energetic lighting
            - Color splashes or abstract shapes in background
            - Dynamic, eye-catching composition
            - Fun, playful atmosphere`
    };

    const prompt = `Create a premium 1080x1080 hero product advertisement.

CRITICAL: DO NOT RENDER ANY TEXT, HEADLINES, OR BUTTONS.

COMPOSITION:
- Product from input image placed CENTER, slightly below middle
- Product occupies 50-60% of frame
- Leave clear space at TOP for headline (top 15%)
- Leave clear space at BOTTOM for CTA button (bottom 12%)
- Product should be the HERO - dramatic and prominent

STYLE: ${styleDescriptions[style] || styleDescriptions.dark}

LIGHTING:
- Professional studio quality
- Highlights on product edges
- Subtle rim lighting for depth

OUTPUT: Dramatic product hero shot ready for text overlay. NO TEXT.`;

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
        console.error('[HeroProduct] Gemini failed, using fallback:', error.message);
        return createFallbackHeroBackground(colors);
    }
}

/**
 * Composite hero text overlay
 */
async function compositeHeroOverlay({
    backgroundBuffer,
    headline,
    tagline,
    cta,
    colors,
    style
}) {
    const textColor = style === 'light' ? '#1a1a1a' : '#FFFFFF';
    const subTextColor = style === 'light' ? '#666666' : '#B0B0B0';

    const svg = buildHeroSvg({
        headline,
        tagline,
        cta,
        textColor,
        subTextColor,
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
 * Build hero SVG overlay
 */
function buildHeroSvg({ headline, tagline, cta, textColor, subTextColor, accentColor }) {
    const escapeXml = (text) => {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    };

    const ctaWidth = 240;
    const ctaHeight = 60;
    const ctaX = (1080 - ctaWidth) / 2;
    const ctaY = 970;

    return `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap');
        </style>
        
        <filter id="headlineShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
        
        <filter id="ctaGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="6" stdDeviation="16" flood-color="${accentColor}" flood-opacity="0.5"/>
        </filter>
        
        <linearGradient id="ctaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${lightenColor(accentColor, 10)}"/>
            <stop offset="100%" style="stop-color:${accentColor}"/>
        </linearGradient>
    </defs>

    <!-- Headline -->
    ${headline ? `
    <text 
        x="540" y="100" 
        font-family="Inter, Arial, sans-serif"
        font-size="64"
        font-weight="800"
        fill="${textColor}"
        text-anchor="middle"
        letter-spacing="-2"
        filter="url(#headlineShadow)"
    >${escapeXml(headline)}</text>
    ` : ''}

    <!-- Tagline -->
    ${tagline ? `
    <text 
        x="540" y="155" 
        font-family="Inter, Arial, sans-serif"
        font-size="24"
        font-weight="400"
        fill="${subTextColor}"
        text-anchor="middle"
    >${escapeXml(tagline)}</text>
    ` : ''}

    <!-- CTA Button -->
    ${cta ? `
    <rect 
        x="${ctaX}" y="${ctaY}" 
        width="${ctaWidth}" height="${ctaHeight}" 
        rx="30"
        fill="url(#ctaGradient)"
        filter="url(#ctaGlow)"
    />
    <text 
        x="540" y="${ctaY + 38}" 
        font-family="Inter, Arial, sans-serif"
        font-size="20"
        font-weight="600"
        fill="#FFFFFF"
        text-anchor="middle"
    >${escapeXml(cta)}</text>
    ` : ''}

</svg>`;
}

/**
 * Get style-based colors
 */
function getStyleColors(style, industry, accentOverride, bgOverride) {
    const industryAccents = {
        tech: '#3498DB',
        food: '#E67E22',
        fashion: '#1a1a1a',
        beauty: '#E91E63',
        eco: '#27AE60',
        fitness: '#FF5722',
        saas: '#6366F1',
        home: '#8B4513',
        default: '#FF4757'
    };

    const accent = accentOverride || industryAccents[industry] || industryAccents.default;

    const styles = {
        dark: {
            backgroundTop: bgOverride || '#0a0f1a',
            backgroundBottom: '#1a1f3a',
            glow: `${accent}33`,
            accent
        },
        light: {
            backgroundTop: bgOverride || '#FFFFFF',
            backgroundBottom: '#F5F5F5',
            glow: `${accent}15`,
            accent
        },
        colorful: {
            backgroundTop: bgOverride || accent,
            backgroundBottom: darkenColor(accent, 20),
            glow: '#FFFFFF22',
            accent: '#FFFFFF'
        }
    };

    return styles[style] || styles.dark;
}

/**
 * Create fallback hero background
 */
async function createFallbackHeroBackground(colors) {
    const svg = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:${colors.backgroundTop}"/>
                <stop offset="100%" style="stop-color:${colors.backgroundBottom}"/>
            </linearGradient>
            <radialGradient id="glow" cx="50%" cy="50%" r="40%">
                <stop offset="0%" style="stop-color:${colors.glow}"/>
                <stop offset="100%" style="stop-color:transparent"/>
            </radialGradient>
        </defs>
        <rect width="1080" height="1080" fill="url(#bg)"/>
        <ellipse cx="540" cy="540" rx="450" ry="350" fill="url(#glow)"/>
    </svg>`;

    return await sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Color utilities
 */
function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

export default { heroProductTemplate };
