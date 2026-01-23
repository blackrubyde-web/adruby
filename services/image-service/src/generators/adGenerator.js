/**
 * Ad Generator - Core generation logic
 * 
 * Clean implementation with proper compositing:
 * 1. Generate background/scene with Gemini
 * 2. Composite product image with Sharp
 * 3. Render text with SVG overlay
 */

import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { renderTextOverlay } from '../compositing/textRenderer.js';
import { fetchProductImage } from '../utils/imageLoader.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Main ad generation function
 */
export async function generateAd({
    productImageUrl,
    productImageBase64,
    headline,
    tagline,
    cta,
    userPrompt,
    industry,
    template,
    accentColor = '#FF4757'
}) {
    console.log('[AdGenerator] Starting generation pipeline...');

    // Step 1: Load product image
    let productBuffer;
    if (productImageBase64) {
        productBuffer = Buffer.from(productImageBase64, 'base64');
    } else if (productImageUrl) {
        productBuffer = await fetchProductImage(productImageUrl);
    }

    // Step 2: Generate background scene with Gemini
    const backgroundBuffer = await generateBackground({
        productBuffer,
        userPrompt,
        industry,
        template
    });

    // Step 3: Composite product onto background (if separate)
    let compositeBuffer = backgroundBuffer;

    // Step 4: Render sharp text overlay with SVG
    const finalBuffer = await renderTextOverlay({
        baseImage: compositeBuffer,
        headline,
        tagline,
        cta,
        accentColor
    });

    console.log('[AdGenerator] ✅ Generation complete');

    return {
        buffer: finalBuffer,
        template: template || 'hero_product'
    };
}

/**
 * Generate background/scene using Gemini
 */
async function generateBackground({ productBuffer, userPrompt, industry, template }) {
    console.log('[AdGenerator] Generating scene with Gemini...');

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: { responseModalities: ['image', 'text'] }
    });

    // Build prompt for background generation
    const prompt = buildBackgroundPrompt({ userPrompt, industry, template });

    try {
        const parts = [];

        // Include product image if available
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
                    // Resize to exact 1080x1080
                    return await sharp(imageBuffer)
                        .resize(1080, 1080, { fit: 'cover' })
                        .png()
                        .toBuffer();
                }
            }
        }

        throw new Error('No image in Gemini response');
    } catch (error) {
        console.error('[AdGenerator] Gemini failed:', error.message);
        // Return fallback gradient background
        return createFallbackBackground(industry);
    }
}

/**
 * Build optimized prompt for Gemini
 */
function buildBackgroundPrompt({ userPrompt, industry, template }) {
    const basePrompt = `Create a premium 1080x1080 Meta advertisement.

CRITICAL INSTRUCTIONS:
- DO NOT render any text, headlines, or buttons - these will be added separately
- Focus ONLY on the visual scene/background and product placement
- The product from the input image must be EXACTLY preserved
- Create a professional, agency-quality composition

STYLE: Premium, modern, high-converting Meta 2026 standard
INDUSTRY: ${industry || 'e-commerce'}

`;

    if (userPrompt && userPrompt.length > 20) {
        return basePrompt + `USER DIRECTION:\n${userPrompt}\n\nRemember: NO TEXT in the image!`;
    }

    // Default premium background
    return basePrompt + `
BACKGROUND:
- Deep gradient background (#0a0f1a to #1a1f3a)
- Subtle ambient glow behind the product
- Professional studio lighting from top-left
- Optional: subtle particles or bokeh effect

PRODUCT:
- Feature the input product prominently
- Center composition with some negative space at top and bottom
- Add subtle reflection beneath the product
- Slight glow around product edges

OUTPUT: A beautiful product scene ready for text overlay.`;
}

/**
 * Create fallback gradient background
 */
async function createFallbackBackground(industry) {
    console.log('[AdGenerator] Using fallback background...');

    const colors = {
        tech: { top: '#0a0f1a', bottom: '#1a1f3a' },
        beauty: { top: '#fef5f0', bottom: '#ffe4e1' },
        gaming: { top: '#0a0a1a', bottom: '#1a0a2e' },
        default: { top: '#1a1a2e', bottom: '#0f0f1a' }
    };

    const palette = colors[industry] || colors.default;

    const svg = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:${palette.top}"/>
                <stop offset="100%" style="stop-color:${palette.bottom}"/>
            </linearGradient>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:#FF4757;stop-opacity:0.15"/>
                <stop offset="100%" style="stop-color:#FF4757;stop-opacity:0"/>
            </radialGradient>
        </defs>
        <rect width="1080" height="1080" fill="url(#bg)"/>
        <ellipse cx="540" cy="540" rx="400" ry="300" fill="url(#glow)"/>
    </svg>`;

    return await sharp(Buffer.from(svg)).png().toBuffer();
}

export default { generateAd };
