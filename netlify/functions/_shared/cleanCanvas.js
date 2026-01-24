/**
 * CLEAN CANVAS GENERATOR - TEMPLATE-BASED
 * 
 * Layer 2: Uses reference-level templates to generate
 * agency-quality Meta 2026 ads with Gemini.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';
import { AD_TEMPLATES } from './adTemplates.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate reference-level ad using templates
 */
export async function generateCleanCanvas({
    productImageBuffer,
    layoutPlan,
    productAnalysis,
    copy,
    userPrompt  // This is the ENHANCED prompt from polishCreativePrompt
}) {
    console.log('[CleanCanvas] 🎨 Generating reference-level ad...');

    const style = layoutPlan?.style || {};
    const accentColor = style.accentColor || '#FF4757';

    const headline = copy?.headline || productAnalysis?.productName || 'Premium Quality';
    const tagline = copy?.tagline || '';
    const cta = copy?.cta || 'Shop Now';

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: { responseModalities: ['image', 'text'] }
    });

    // Build the final prompt
    const finalPrompt = buildFinalPrompt(userPrompt, headline, tagline, cta, accentColor, productAnalysis);

    console.log('[CleanCanvas] Prompt length:', finalPrompt.length, 'chars');

    try {
        const result = await model.generateContent([
            { inlineData: { mimeType: 'image/png', data: productImageBuffer.toString('base64') } },
            { text: finalPrompt }
        ]);

        const candidates = result.response?.candidates;
        if (candidates?.[0]?.content?.parts) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData?.data) {
                    const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
                    const resized = await sharp(imageBuffer).resize(1080, 1080, { fit: 'cover' }).png().toBuffer();

                    console.log('[CleanCanvas] ✅ Reference-level ad generated');
                    return { success: true, buffer: resized, includesText: true };
                }
            }
        }
        throw new Error('No image in response');
    } catch (error) {
        console.error('[CleanCanvas] ❌ Failed:', error.message);
        return createFallbackCanvas(productImageBuffer, layoutPlan);
    }
}

/**
 * Build comprehensive final prompt for Gemini
 * UPGRADED: Premium 10/10 quality with dynamic effects
 */
function buildFinalPrompt(enhancedPrompt, headline, tagline, cta, accentColor, productAnalysis) {
    // Detect if product is a UI/SaaS/Dashboard - use the analysis field first, then fallback to string detection
    const productDesc = (productAnalysis?.productDescription || productAnalysis?.description || '').toLowerCase();
    const productType = (productAnalysis?.productType || '').toLowerCase();
    const isSaaSProduct = productAnalysis?.isSaaSProduct === true ||
        productAnalysis?.isDeviceMockup === true ||
        productType.includes('saas') || productType.includes('software') ||
        productType.includes('app') || productType.includes('dashboard') ||
        productDesc.includes('dashboard') || productDesc.includes('interface') ||
        productDesc.includes('platform') || productDesc.includes('tool');

    // Premium gradient colors for CTA
    const gradientStart = lightenColor(accentColor, 15);
    const gradientEnd = accentColor;

    const basePrompt = `
⛔⛔⛔ CRITICAL RULE - READ THIS FIRST ⛔⛔⛔

THE INPUT IMAGE IS YOUR PRODUCT. 
DO NOT CREATE A NEW PRODUCT.
DO NOT INVENT SOMETHING ELSE.
DO NOT REPLACE THE IMAGE WITH SOMETHING DIFFERENT.

Your job is to ENHANCE the input image, NOT to replace it.

═══════════════════════════════════════════════════════════════
🎯 TASK: AD ENHANCEMENT (NOT PRODUCT CREATION!)
═══════════════════════════════════════════════════════════════

You are given an image. This image IS the product/content for the ad.
Your job is to:
1. KEEP the input image EXACTLY as it is
2. ADD a premium background behind/around it
3. ADD headline text at the top
4. ADD a CTA button at the bottom

That's it. DO NOT create a new product. The image I gave you IS the product.

═══════════════════════════════════════════════════════════════
📸 THE INPUT IMAGE
═══════════════════════════════════════════════════════════════
${isSaaSProduct ? `
The input image shows a SOFTWARE DASHBOARD or USER INTERFACE.
- Display this EXACT screenshot/interface in the ad
- You may place it in a device mockup (MacBook, browser window)
- But the CONTENT of the screen must be IDENTICAL to the input
- Do NOT change any text, colors, or elements within the UI
- The dashboard/interface IS the product - preserve it 100%` : `
The input image shows a PRODUCT.
- Display this EXACT product in the ad
- Do NOT change its shape, colors, or design
- Do NOT replace it with a different product
- The product IS what I uploaded - keep it exactly as shown`}

═══════════════════════════════════════════════════════════════
🎨 WHAT YOU SHOULD ADD
═══════════════════════════════════════════════════════════════

BACKGROUND:
- Premium dark gradient behind the input image
- Colors: #0D0D1A → #1A1A35 (deep navy/purple)
- Subtle glow effect around the product (${accentColor} at 10%)
- Optional: soft bokeh or particles in background

HEADLINE: "${headline}"
- Position: TOP of the image (10-12% from top)
- Font: Bold white text, 54-60px
- Must be crystal clear and readable

${tagline ? `SUBHEADLINE: "${tagline}"
- Below the headline, 22-26px, light gray` : ''}

CTA BUTTON: "${cta}"
- Position: BOTTOM of image (85-90% from top)
- Style: Pill/capsule shape
- Colors: Gradient from ${gradientStart} to ${gradientEnd}
- Glow effect around the button
- White bold text

═══════════════════════════════════════════════════════════════
❌ WHAT YOU MUST NOT DO
═══════════════════════════════════════════════════════════════
- ❌ DO NOT create a new product (jar, bottle, box, etc.)
- ❌ DO NOT replace the input image with something else
- ❌ DO NOT invent new objects that aren't in the input
- ❌ DO NOT ignore the input image
- ❌ DO NOT treat the input as "inspiration" - it IS the content

If I uploaded a dashboard screenshot, show that EXACT dashboard.
If I uploaded a product photo, show that EXACT product.
Do NOT make up a new product.

═══════════════════════════════════════════════════════════════
✅ CORRECT OUTPUT EXAMPLE
═══════════════════════════════════════════════════════════════
- The EXACT input image/screenshot in the center
- Premium dark gradient background
- "${headline}" text at the top
- "${cta}" button at the bottom
- That's it - simple, clean, professional

Canvas size: 1080x1080 pixels

${enhancedPrompt && enhancedPrompt.length > 100 ? `
ADDITIONAL DIRECTION (but NEVER replace the product):
${enhancedPrompt}` : ''}

REMEMBER: The input image = the product. Do not replace it.`;

    console.log('[CleanCanvas] Built STRICT preservation prompt:', basePrompt.length, 'chars');
    return basePrompt;
}

/**
 * Default hero product prompt when no enhanced prompt available
 */
function getDefaultHeroPrompt(headline, tagline, cta, accentColor, productAnalysis) {
    return `Create a PREMIUM Meta advertisement (1080x1080 pixels).

This should look like a $10,000 agency ad. Not generic AI art.

═══════════════════════════════════════════════════════════════
LAYOUT SPECIFICATIONS:
═══════════════════════════════════════════════════════════════

BACKGROUND:
- Deep, sophisticated gradient (#0a0a1f top to #1a1a3a bottom)
- Add subtle radial glow at center (${accentColor} at 15% opacity)
- Optional: very subtle particle/dust texture (30 tiny dots, white, 10% opacity)

PRODUCT (from input image):
- Position: CENTER of canvas (540, 500)
- Size: approximately 580px
- Professional studio lighting from top-left (45° angle)
- Subtle reflection below: 25% opacity, slight blur
- Very subtle glow around product edges: ${accentColor} at 15%

HEADLINE: "${headline}"
- Position: TOP CENTER (x: 540, y: 100)
- Font: Bold, modern sans-serif (like Inter or SF Pro)
- Size: 56-64px
- Color: White (#FFFFFF)
- Text shadow: 0 3px 10px rgba(0,0,0,0.5)
- MUST be PERFECTLY SHARP and readable

${tagline ? `TAGLINE: "${tagline}"
- Position: Below headline (x: 540, y: 165)
- Font: Regular weight
- Size: 22-24px
- Color: Light gray (#B0B0B0)` : ''}

CTA BUTTON: "${cta}"
- Position: BOTTOM CENTER (x: 540, y: 970)
- Size: 220px wide × 54px tall
- Shape: Pill (27px border-radius)
- Background: Linear gradient from ${lightenColor(accentColor, 10)} to ${accentColor}
- Text: Bold, 17px, white, centered
- Glow: 0 0 18px ${accentColor} at 45% opacity
- Shadow: 0 6px 20px rgba(0,0,0,0.3)

═══════════════════════════════════════════════════════════════
STYLE: Premium, modern, high-converting Meta 2026 agency standard
═══════════════════════════════════════════════════════════════

CRITICAL: Text must be PERFECTLY SHARP. Not blurry. Not AI-looking.
This is a real Meta ad that will run to millions of people.`;
}

function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

async function createFallbackCanvas(productImageBuffer, layoutPlan) {
    console.log('[CleanCanvas] Using fallback...');
    const bgColor = layoutPlan?.style?.backgroundColor || '#1a1a2e';

    try {
        const gradientSvg = `<svg width="1080" height="1080">
            <defs>
                <radialGradient id="bg" cx="50%" cy="70%" r="80%">
                    <stop offset="0%" style="stop-color:${lightenColor(bgColor, 15)};stop-opacity:1"/>
                    <stop offset="100%" style="stop-color:${bgColor};stop-opacity:1"/>
                </radialGradient>
            </defs>
            <rect width="1080" height="1080" fill="url(#bg)"/>
        </svg>`;

        const background = await sharp(Buffer.from(gradientSvg)).png().toBuffer();
        const product = await sharp(productImageBuffer)
            .resize(550, 550, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png().toBuffer();

        const result = await sharp(background)
            .composite([{ input: product, top: 280, left: 265 }])
            .png().toBuffer();

        return { success: true, buffer: result, isFallback: true, includesText: false };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export default { generateCleanCanvas };
