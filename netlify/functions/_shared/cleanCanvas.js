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
    // Detect if product is a UI/SaaS/Dashboard
    const productDesc = (productAnalysis?.description || '').toLowerCase();
    const productType = (productAnalysis?.productType || '').toLowerCase();
    const isSaaSProduct = productType.includes('saas') || productType.includes('software') ||
        productType.includes('app') || productType.includes('dashboard') ||
        productDesc.includes('dashboard') || productDesc.includes('interface') ||
        productDesc.includes('platform') || productDesc.includes('tool');

    // Premium gradient colors for CTA
    const gradientStart = lightenColor(accentColor, 15);
    const gradientEnd = accentColor;

    const basePrompt = `
═══════════════════════════════════════════════════════════════
🎯 PREMIUM META AD GENERATION - 10/10 QUALITY REQUIRED
═══════════════════════════════════════════════════════════════

CANVAS: 1080 x 1080 pixels (Instagram/Facebook Square)

═══════════════════════════════════════════════════════════════
🎨 DYNAMIC BACKGROUND (NOT STATIC!)
═══════════════════════════════════════════════════════════════
Create a DYNAMIC, premium background with these effects:

PRIMARY GRADIENT:
- Direction: Radial from center, fading to edges
- Colors: Deep navy #0D0D1A → Rich purple #1A1A35 → Almost black #0A0A12
- Add subtle glow orbs: 2-3 soft circular gradients (${accentColor} at 8% opacity)

DYNAMIC ELEMENTS (choose 2-3):
- Subtle floating particles or dust specs (tiny white dots, 5-8% opacity)
- Soft bokeh circles in background (3-5 circles, blurred, 10% opacity)
- Gentle radial light rays emanating from product area
- Subtle grid or mesh pattern (very faint, 3% opacity)

CRITICAL: Background must feel ALIVE and DYNAMIC, not flat or static!

═══════════════════════════════════════════════════════════════
📱 PRODUCT PRESENTATION
═══════════════════════════════════════════════════════════════
${isSaaSProduct ? `
THIS IS A SAAS/UI PRODUCT - SPECIAL HANDLING:
- Display the dashboard/interface AS SHOWN in the input image
- Show it on a floating MacBook Pro or as a floating browser window
- Add subtle perspective (slight 3D rotation, 5-10°)
- Add screen glow: soft ${accentColor} emanating from the screen
- Add floating shadow below the device
- UI should be CLEARLY VISIBLE and READABLE
- Don't modify the actual interface content - show it as-is` : `
- Position: Centered, slightly above middle (Y: 45%)
- Size: Fill approximately 55% of canvas width
- Apply premium studio lighting from top-left
- Add subtle glow halo around product (${accentColor} at 12%)
- Add realistic shadow beneath`}

═══════════════════════════════════════════════════════════════
✍️ TYPOGRAPHY (PIXEL-PERFECT)
═══════════════════════════════════════════════════════════════
HEADLINE: "${headline}"
- Position: TOP CENTER (Y: 10-12%)
- Font: Bold, modern sans-serif (Inter, Helvetica Neue, SF Pro Display)
- Size: 54-60px, letter-spacing: -0.02em
- Color: Pure white #FFFFFF
- Text shadow: 0 4px 12px rgba(0,0,0,0.6)
- CRITICAL: Text must be PERFECTLY SHARP and READABLE

${tagline ? `SUBHEADLINE: "${tagline}"
- Position: Below headline (Y: 18-20%)
- Font: Regular weight, same family
- Size: 22-26px
- Color: Light gray #C0C0C0 or muted ${accentColor}` : ''}

═══════════════════════════════════════════════════════════════
🔥 CTA BUTTON (PREMIUM - THIS IS CRITICAL!)
═══════════════════════════════════════════════════════════════
CTA TEXT: "${cta}"

SHAPE & SIZE:
- Perfect pill shape (capsule with fully rounded ends)
- Width: 240-280px, Height: 58-64px
- Border-radius: 32px (fully rounded)
- Position: BOTTOM CENTER (Y: 86-88%)

GRADIENT FILL (MUST HAVE GRADIENT, NOT SOLID!):
- Type: Linear gradient, 135° angle (top-left to bottom-right)
- Start color: ${gradientStart} (lighter, warmer)
- End color: ${gradientEnd} (more saturated)
- Optional: Add a very subtle shine line (white at 15%, 1px, near top)

GLOW EFFECT (CRITICAL FOR PREMIUM LOOK!):
- Outer glow: 0 0 25px ${accentColor} at 50% opacity
- Secondary glow: 0 0 50px ${accentColor} at 25% opacity
- Creates a "pulsing" premium vibe

TEXT STYLING:
- Font: Bold, 18-20px
- Color: Pure white #FFFFFF
- Letter-spacing: 0.5px
- Text shadow: 0 1px 3px rgba(0,0,0,0.3)

BUTTON SHADOW:
- Primary: 0 8px 32px rgba(0,0,0,0.4)
- Color shadow: 0 4px 16px ${accentColor} at 30%

THE BUTTON MUST LOOK LIKE A REAL, CLICKABLE, PREMIUM UI ELEMENT!
NOT flat, NOT boring, NOT AI-generated looking.

═══════════════════════════════════════════════════════════════
⚡ QUALITY CHECKLIST (ALL MUST BE YES)
═══════════════════════════════════════════════════════════════
□ Text is PERFECTLY SHARP and readable (no blur, no AI artifacts)
□ CTA button has visible GRADIENT (not solid color)
□ CTA button has GLOW EFFECT (visible light emanating)
□ Background feels DYNAMIC and ALIVE (not flat/static)
□ Overall composition feels premium ($10,000 agency level)
□ Ready to run on Meta Ads immediately

${enhancedPrompt && enhancedPrompt.length > 100 ? `
═══════════════════════════════════════════════════════════════
📋 ADDITIONAL CREATIVE DIRECTION:
═══════════════════════════════════════════════════════════════
${enhancedPrompt}` : ''}

USE THE INPUT IMAGE AS THE PRODUCT - integrate it prominently into the design.

OUTPUT: A complete, premium 1080x1080 Meta advertisement.`;

    console.log('[CleanCanvas] Built premium prompt:', basePrompt.length, 'chars');
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
