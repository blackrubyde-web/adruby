/**
 * Composite Ad Generator v6.0
 * 
 * SOLUTION: Gemini corrupts screenshots when trying to "integrate" them.
 * 
 * NEW APPROACH:
 * 1. Gemini generates ONLY an empty premium background (no product!)
 * 2. Sharp composites the ORIGINAL screenshot pixelgenau on top
 * 3. SVG renders perfect text (headline + CTA with gradient/glow)
 * 
 * Result: 100% product preservation + premium visuals
 */

import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { matchProduct } from '../ai/productMatcher.js';
import { extractPatternDNA, getDefaultDNA } from '../ai/visualDNA.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Canvas dimensions
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;

/**
 * Main composite ad generation
 */
export async function generateCompositeAd({
    productImageBuffer,
    headline,
    tagline,
    cta,
    accentColor = '#FF4757',
    industry,
    userPrompt
}) {
    console.log('[CompositeGen] 🎨 Starting Composite Pipeline v6.0...');
    const startTime = Date.now();

    // ========================================
    // PHASE 1: Product Analysis + Foreplay
    // ========================================
    console.log('[CompositeGen] Phase 1: Product Analysis...');

    let productAnalysis = null;
    let referenceAds = [];
    let visualDNA = getDefaultDNA();

    if (productImageBuffer) {
        try {
            const matchResult = await matchProduct(productImageBuffer);
            productAnalysis = matchResult.analysis;
            referenceAds = matchResult.referenceAds || [];

            console.log(`[CompositeGen] Product: ${productAnalysis?.productName || 'Unknown'}`);
            console.log(`[CompositeGen] Found ${referenceAds.length} Foreplay references`);

            // Extract DNA from winning ads if available
            if (referenceAds.length > 0) {
                const dnaResult = await extractPatternDNA(referenceAds, 3);
                visualDNA = dnaResult.pattern || visualDNA;
                console.log(`[CompositeGen] DNA extracted: ${visualDNA.layout?.type || 'default'}`);
            }
        } catch (e) {
            console.warn('[CompositeGen] Product analysis failed:', e.message);
        }
    }

    // Detect if this is a SaaS/UI product
    const isSaaSProduct = detectSaaSProduct(productAnalysis, userPrompt);
    console.log(`[CompositeGen] SaaS Product: ${isSaaSProduct}`);

    // ========================================
    // PHASE 2: Generate Background Only
    // ========================================
    console.log('[CompositeGen] Phase 2: Generating premium background...');

    const backgroundBuffer = await generateBackgroundOnly({
        accentColor,
        visualDNA,
        industry: industry || productAnalysis?.productType || 'tech'
    });

    if (!backgroundBuffer) {
        console.error('[CompositeGen] Background generation failed, using fallback');
        return await createFallbackComposite(productImageBuffer, headline, cta, accentColor);
    }

    // ========================================
    // PHASE 3: Composite Product on Background
    // ========================================
    console.log('[CompositeGen] Phase 3: Compositing product...');

    let compositeBuffer;
    if (isSaaSProduct) {
        compositeBuffer = await compositeWithMockup(backgroundBuffer, productImageBuffer);
    } else {
        compositeBuffer = await compositeProduct(backgroundBuffer, productImageBuffer);
    }

    // ========================================
    // PHASE 4: Add Text Overlay
    // ========================================
    console.log('[CompositeGen] Phase 4: Adding text overlay...');

    const finalBuffer = await addTextOverlay(compositeBuffer, {
        headline: headline || productAnalysis?.suggestedHeadlines?.[0] || 'Premium Quality',
        tagline,
        cta: cta || 'Shop Now',
        accentColor
    });

    const duration = Date.now() - startTime;
    console.log(`[CompositeGen] ✅ Complete in ${duration}ms`);

    return {
        buffer: finalBuffer,
        duration,
        isSaaSProduct,
        productAnalysis,
        referenceCount: referenceAds.length
    };
}

/**
 * Generate ONLY a premium background - no products, no text
 */
async function generateBackgroundOnly({ accentColor, visualDNA, industry }) {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: { responseModalities: ['image', 'text'] }
        });

        const bgColors = visualDNA.colors?.background || {};
        const primaryColor = bgColors.primary || '#0A0A1A';
        const secondaryColor = bgColors.secondary || '#1A1A3A';

        const prompt = `Generate ONLY a premium advertisement background.

⛔ DO NOT include any products, text, buttons, devices, or objects.
⛔ This is ONLY an empty background scene.

REQUIREMENTS:
- Size: ${CANVAS_WIDTH}x${CANVAS_HEIGHT} pixels (square)
- Style: Premium, modern, professional
- Empty center area for product placement

BACKGROUND DESIGN:
- Primary gradient: ${primaryColor} to ${secondaryColor}
- Gradient direction: Radial from center
- Subtle glow orb in center using ${accentColor} at 15% opacity
- Subtle bokeh circles (3-5 circles, very soft, 8% opacity)
- Optional: very faint floating particles
- Optional: subtle vignette at edges

MOOD: Premium ${industry} advertisement, agency-quality

⛔ CRITICAL: Output must be a completely EMPTY background.
No products. No text. No UI elements. Just the background.`;

        const result = await model.generateContent([{ text: prompt }]);
        const candidates = result.response?.candidates;

        if (candidates?.[0]?.content?.parts) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData?.data) {
                    console.log('[CompositeGen] ✅ Background generated');
                    return Buffer.from(part.inlineData.data, 'base64');
                }
            }
        }

        throw new Error('No image in response');
    } catch (error) {
        console.error('[CompositeGen] Background generation error:', error.message);
        // Return gradient fallback
        return await createGradientBackground(accentColor);
    }
}

/**
 * Create gradient background fallback using Sharp
 */
async function createGradientBackground(accentColor) {
    const svg = `
    <svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="bg" cx="50%" cy="40%" r="80%">
                <stop offset="0%" style="stop-color:#1A1A3A"/>
                <stop offset="100%" style="stop-color:#0A0A1A"/>
            </radialGradient>
            <radialGradient id="glow" cx="50%" cy="45%" r="50%">
                <stop offset="0%" style="stop-color:${accentColor};stop-opacity:0.15"/>
                <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0"/>
            </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <ellipse cx="540" cy="450" rx="400" ry="350" fill="url(#glow)"/>
    </svg>`;

    return await sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Composite product onto background (for physical products)
 */
async function compositeProduct(backgroundBuffer, productBuffer) {
    if (!productBuffer) return backgroundBuffer;

    // Resize product to fit nicely
    const productResized = await sharp(productBuffer)
        .resize(600, 600, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

    const productMeta = await sharp(productResized).metadata();
    const left = Math.round((CANVAS_WIDTH - productMeta.width) / 2);
    const top = Math.round((CANVAS_HEIGHT - productMeta.height) / 2) - 50; // Slightly above center

    return await sharp(backgroundBuffer)
        .resize(CANVAS_WIDTH, CANVAS_HEIGHT)
        .composite([
            { input: productResized, left, top }
        ])
        .png()
        .toBuffer();
}

/**
 * Composite screenshot with MacBook-like mockup (for SaaS products)
 */
async function compositeWithMockup(backgroundBuffer, screenshotBuffer) {
    if (!screenshotBuffer) return backgroundBuffer;

    // Create a simple MacBook-like frame using SVG
    const screenWidth = 700;
    const screenHeight = 438; // 16:10 aspect ratio
    const frameWidth = screenWidth + 40;
    const frameHeight = screenHeight + 70;

    // Create the MacBook frame
    const frameSvg = `
    <svg width="${frameWidth}" height="${frameHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bezel" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#3a3a3c"/>
                <stop offset="100%" style="stop-color:#1c1c1e"/>
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="#000000" flood-opacity="0.5"/>
            </filter>
        </defs>
        <!-- MacBook body -->
        <rect x="0" y="0" width="${frameWidth}" height="${frameHeight - 20}" rx="12" fill="url(#bezel)" filter="url(#shadow)"/>
        <!-- Screen bezel -->
        <rect x="10" y="10" width="${screenWidth + 20}" height="${screenHeight + 20}" rx="4" fill="#000000"/>
        <!-- Camera dot -->
        <circle cx="${frameWidth / 2}" cy="20" r="3" fill="#2a2a2c"/>
        <!-- Bottom bar -->
        <rect x="0" y="${frameHeight - 20}" width="${frameWidth}" height="20" rx="2" fill="#2a2a2c"/>
        <ellipse cx="${frameWidth / 2}" cy="${frameHeight - 10}" rx="80" ry="8" fill="#1c1c1e"/>
    </svg>`;

    const frameBuffer = await sharp(Buffer.from(frameSvg)).png().toBuffer();

    // Resize screenshot to fit screen area
    const screenshotResized = await sharp(screenshotBuffer)
        .resize(screenWidth, screenHeight, { fit: 'cover' })
        .png()
        .toBuffer();

    // Composite frame with screenshot
    const mockupBuffer = await sharp(frameBuffer)
        .composite([
            { input: screenshotResized, left: 20, top: 20 }
        ])
        .png()
        .toBuffer();

    // Position mockup on background
    const mockupLeft = Math.round((CANVAS_WIDTH - frameWidth) / 2);
    const mockupTop = 200;

    return await sharp(backgroundBuffer)
        .resize(CANVAS_WIDTH, CANVAS_HEIGHT)
        .composite([
            { input: mockupBuffer, left: mockupLeft, top: mockupTop }
        ])
        .png()
        .toBuffer();
}

/**
 * Add text overlay with SVG (headline + CTA)
 */
async function addTextOverlay(imageBuffer, { headline, tagline, cta, accentColor }) {
    // Calculate gradient colors for CTA
    const ctaGradientStart = lightenColor(accentColor, 15);
    const ctaGradientEnd = accentColor;

    const textSvg = `
    <svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="ctaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${ctaGradientStart}"/>
                <stop offset="100%" style="stop-color:${ctaGradientEnd}"/>
            </linearGradient>
            <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.7"/>
            </filter>
            <filter id="ctaGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="12" result="blur"/>
                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <filter id="ctaShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="6" stdDeviation="15" flood-color="${accentColor}" flood-opacity="0.4"/>
            </filter>
        </defs>
        
        <!-- Headline -->
        <text x="540" y="100" text-anchor="middle" 
              fill="#FFFFFF" 
              font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
              font-size="56" 
              font-weight="800"
              letter-spacing="-1"
              filter="url(#textShadow)">
            ${escapeXml(headline)}
        </text>
        
        ${tagline ? `
        <!-- Tagline -->
        <text x="540" y="150" text-anchor="middle" 
              fill="rgba(255,255,255,0.75)" 
              font-family="system-ui, sans-serif" 
              font-size="24" 
              font-weight="400">
            ${escapeXml(tagline)}
        </text>
        ` : ''}
        
        <!-- CTA Button with Gradient and Glow -->
        <g filter="url(#ctaShadow)">
            <rect x="390" y="940" width="300" height="64" rx="32" fill="url(#ctaGradient)"/>
            <!-- Shine line -->
            <rect x="440" y="948" width="140" height="2" rx="1" fill="rgba(255,255,255,0.25)"/>
        </g>
        <text x="540" y="982" text-anchor="middle" 
              fill="#FFFFFF" 
              font-family="system-ui, sans-serif" 
              font-size="22" 
              font-weight="700"
              letter-spacing="0.5">
            ${escapeXml(cta)}
        </text>
    </svg>`;

    const textBuffer = await sharp(Buffer.from(textSvg)).png().toBuffer();

    return await sharp(imageBuffer)
        .composite([
            { input: textBuffer, left: 0, top: 0 }
        ])
        .png()
        .toBuffer();
}

/**
 * Detect if product is SaaS/UI/Dashboard
 */
function detectSaaSProduct(productAnalysis, userPrompt) {
    const promptLower = (userPrompt || '').toLowerCase();
    const typeLower = (productAnalysis?.productType || '').toLowerCase();
    const nameLower = (productAnalysis?.productName || '').toLowerCase();

    const saasKeywords = ['saas', 'dashboard', 'app', 'software', 'platform', 'tool', 'interface', 'ui', 'screenshot', 'analytics', 'crm', 'erp'];

    return saasKeywords.some(keyword =>
        promptLower.includes(keyword) ||
        typeLower.includes(keyword) ||
        nameLower.includes(keyword)
    );
}

/**
 * Fallback composite when generation fails
 */
async function createFallbackComposite(productBuffer, headline, cta, accentColor) {
    const background = await createGradientBackground(accentColor);

    let composite = background;
    if (productBuffer) {
        composite = await compositeProduct(background, productBuffer);
    }

    return await addTextOverlay(composite, { headline, cta, accentColor });
}

/**
 * Lighten a hex color
 */
function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

/**
 * Escape XML special characters
 */
function escapeXml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export default { generateCompositeAd };
