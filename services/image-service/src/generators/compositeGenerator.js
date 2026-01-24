/**
 * Composite Ad Generator v8.0 - FULLY DYNAMIC AI
 * 
 * NO FIXED TEMPLATES - Every ad is 100% unique!
 * 
 * PIPELINE:
 * 1. Product Analysis → GPT-4V understands your product
 * 2. Foreplay Reference Analysis → GPT-4V analyzes winning ads
 * 3. DYNAMIC Layout Generation → GPT-4V creates unique layout specs
 * 4. Brand Color Extraction → Colors from screenshot
 * 5. Background Generation → Gemini creates matching scene
 * 6. DYNAMIC Mockup Generation → AI decides device type
 * 7. Advanced Compositing → Unique positioning
 * 8. DYNAMIC Typography → AI creates text layout
 * 9. Quality Verification → GPT-4V checks result
 */

import sharp from 'sharp';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { matchProduct } from '../ai/productMatcher.js';
import { quickQualityCheck } from '../ai/qualityVerifier.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Canvas dimensions
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;

/**
 * Main composite ad generation - FULLY DYNAMIC
 */
export async function generateCompositeAd({
    productImageBuffer,
    headline,
    tagline,
    cta,
    accentColor,
    industry,
    userPrompt,
    enableQualityCheck = true
}) {
    console.log('[CompositeGen] 🎨 Starting DYNAMIC Pipeline v8.0...');
    console.log('[CompositeGen] Mode: NO TEMPLATES - 100% AI-Generated Layout');
    const startTime = Date.now();

    // ========================================
    // PHASE 1: Deep Product Analysis
    // ========================================
    console.log('[CompositeGen] Phase 1: Deep Product Analysis...');

    let productAnalysis = null;
    let referenceAds = [];
    let extractedColors = { primary: '#0A0A1A', accent: accentColor || '#FF4757', text: '#FFFFFF' };

    if (productImageBuffer) {
        try {
            const matchResult = await matchProduct(productImageBuffer);
            productAnalysis = matchResult.analysis;
            referenceAds = matchResult.referenceAds || [];

            console.log(`[CompositeGen] Product: ${productAnalysis?.productName || 'Unknown'}`);
            console.log(`[CompositeGen] Type: ${productAnalysis?.productType || 'unknown'}`);
            console.log(`[CompositeGen] Foreplay references: ${referenceAds.length}`);

            // Extract colors from product image
            extractedColors = await extractBrandColors(productImageBuffer, productAnalysis);
            console.log(`[CompositeGen] Colors: accent=${extractedColors.accent}`);

        } catch (e) {
            console.warn('[CompositeGen] Product analysis failed:', e.message);
        }
    }

    const finalAccentColor = accentColor || extractedColors.accent || '#FF4757';

    // ========================================
    // PHASE 2: GPT-4V DYNAMIC LAYOUT GENERATION
    // ========================================
    console.log('[CompositeGen] Phase 2: GPT-4V Dynamic Layout Generation...');

    const dynamicLayout = await generateDynamicLayout({
        productAnalysis,
        referenceAds,
        headline,
        tagline,
        cta,
        userPrompt,
        industry
    });

    console.log(`[CompositeGen] Dynamic Layout:`, JSON.stringify(dynamicLayout, null, 2));

    // ========================================
    // PHASE 3: Generate Scene Background
    // ========================================
    console.log('[CompositeGen] Phase 3: AI Background Generation...');

    const backgroundBuffer = await generateDynamicBackground({
        accentColor: finalAccentColor,
        layout: dynamicLayout,
        industry: industry || productAnalysis?.productType || 'tech',
        productAnalysis,
        extractedColors
    });

    // ========================================
    // PHASE 4: Dynamic Device Mockup
    // ========================================
    console.log('[CompositeGen] Phase 4: Dynamic Mockup Creation...');

    let mockupBuffer = null;
    if (productImageBuffer) {
        mockupBuffer = await createDynamicMockup({
            screenshotBuffer: productImageBuffer,
            mockupStyle: dynamicLayout.mockup,
            accentColor: finalAccentColor
        });
    }

    // ========================================
    // PHASE 5: Dynamic Layout Compositing
    // ========================================
    console.log('[CompositeGen] Phase 5: Dynamic Compositing...');

    const compositeBuffer = await applyDynamicComposite({
        backgroundBuffer,
        mockupBuffer,
        layout: dynamicLayout
    });

    // ========================================
    // PHASE 6: Dynamic Text Overlay
    // ========================================
    console.log('[CompositeGen] Phase 6: Dynamic Typography...');

    const finalBuffer = await addDynamicTextOverlay(compositeBuffer, {
        headline: headline || productAnalysis?.suggestedHeadlines?.[0] || 'Premium Quality',
        tagline,
        cta: cta || 'Shop Now',
        accentColor: finalAccentColor,
        layout: dynamicLayout
    });

    // ========================================
    // PHASE 7: Quality Verification
    // ========================================
    let qualityScore = 0;
    if (enableQualityCheck) {
        console.log('[CompositeGen] Phase 7: Quality verification...');
        try {
            const qualityResult = await quickQualityCheck(finalBuffer);
            qualityScore = qualityResult.score || 0;
            console.log(`[CompositeGen] Quality score: ${qualityScore}/10`);
        } catch (e) {
            console.warn('[CompositeGen] Quality check failed:', e.message);
        }
    }

    const duration = Date.now() - startTime;
    console.log(`[CompositeGen] ✅ DYNAMIC ad complete in ${duration}ms`);

    return {
        buffer: finalBuffer,
        duration,
        productAnalysis,
        referenceCount: referenceAds.length,
        dynamicLayout,
        qualityScore,
        extractedColors
    };
}

/**
 * GPT-4V generates a UNIQUE layout for this specific ad
 * Analyzes Foreplay references and creates individual specs
 */
async function generateDynamicLayout({ productAnalysis, referenceAds, headline, tagline, cta, userPrompt, industry }) {
    try {
        // Build reference description for GPT-4V
        const referenceDescription = referenceAds.slice(0, 3).map((ad, i) =>
            `Reference ${i + 1}: ${ad.headline || ad.name || 'Unknown'} - ${ad.niches?.join(', ') || 'general'}`
        ).join('\n');

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: `You are an elite ad creative director. Create a UNIQUE layout for this specific ad.

PRODUCT INFO:
- Name: ${productAnalysis?.productName || 'Product'}
- Type: ${productAnalysis?.productType || industry || 'tech'}
- Style: ${productAnalysis?.adStyle || 'bold'}

CONTENT:
- Headline: "${headline || 'Premium Quality'}"
- Tagline: "${tagline || ''}"
- CTA: "${cta || 'Shop Now'}"
- User Request: "${userPrompt || ''}"

${referenceAds.length > 0 ? `TOP PERFORMING REFERENCES:\n${referenceDescription}` : ''}

Create a 100% UNIQUE layout. Be creative! Don't use standard templates.

Return JSON with these EXACT numeric values (0.0 to 1.0 = percentage of canvas):
{
    "product": {
        "x": 0.5,       // horizontal position (0=left, 0.5=center, 1=right)
        "y": 0.45,      // vertical position (0=top, 0.5=middle, 1=bottom)
        "scale": 0.55,  // size (0.3=small, 0.5=medium, 0.7=large)
        "rotation": 0,  // degrees (-15 to 15 for subtle tilt)
        "shadow": true
    },
    "headline": {
        "x": 0.5,
        "y": 0.1,
        "size": 56,           // font size in pixels (40-72)
        "weight": 800,        // font weight (400-900)
        "align": "center",    // left, center, right
        "maxWidth": 0.9       // max width as % of canvas
    },
    "tagline": {
        "x": 0.5,
        "y": 0.18,
        "size": 24,
        "show": ${tagline ? 'true' : 'false'}
    },
    "cta": {
        "x": 0.5,
        "y": 0.88,
        "width": 300,
        "height": 64,
        "borderRadius": 32,
        "style": "gradient_glow"  // gradient_glow, solid, outline, glass
    },
    "mockup": {
        "type": "macbook",        // macbook, ipad, browser, phone, floating, minimal, none
        "showReflection": true,
        "showShadow": true,
        "perspective": "subtle"   // none, subtle, dramatic
    },
    "background": {
        "style": "radial_glow",   // radial_glow, gradient, mesh, particles, minimal
        "glowIntensity": 0.15,
        "hasParticles": false,
        "hasBokeh": true
    },
    "uniqueElement": "Add something creative: floating badges, feature callouts, or decorative elements"
}`
            }],
            max_tokens: 1000,
            response_format: { type: 'json_object' }
        });

        const layout = JSON.parse(response.choices[0].message.content);
        console.log('[CompositeGen] ✅ Dynamic layout generated by GPT-4V');
        return layout;

    } catch (error) {
        console.warn('[CompositeGen] GPT-4V layout failed:', error.message);
        // Fallback with randomization for uniqueness
        return generateRandomizedFallbackLayout();
    }
}

/**
 * Randomized fallback layout for uniqueness
 */
function generateRandomizedFallbackLayout() {
    const rand = (min, max) => min + Math.random() * (max - min);
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    return {
        product: {
            x: rand(0.35, 0.65),
            y: rand(0.35, 0.55),
            scale: rand(0.45, 0.65),
            rotation: rand(-8, 8),
            shadow: true
        },
        headline: {
            x: 0.5,
            y: rand(0.06, 0.12),
            size: pick([48, 52, 56, 60, 64]),
            weight: pick([700, 800, 900]),
            align: 'center',
            maxWidth: rand(0.8, 0.95)
        },
        tagline: {
            x: 0.5,
            y: rand(0.15, 0.22),
            size: pick([20, 22, 24, 26]),
            show: true
        },
        cta: {
            x: 0.5,
            y: rand(0.84, 0.92),
            width: pick([260, 280, 300, 320]),
            height: pick([56, 60, 64]),
            borderRadius: 32,
            style: pick(['gradient_glow', 'solid', 'glass'])
        },
        mockup: {
            type: pick(['macbook', 'browser', 'floating', 'minimal']),
            showReflection: Math.random() > 0.5,
            showShadow: true,
            perspective: pick(['none', 'subtle', 'subtle'])
        },
        background: {
            style: pick(['radial_glow', 'gradient', 'particles']),
            glowIntensity: rand(0.1, 0.2),
            hasParticles: Math.random() > 0.6,
            hasBokeh: Math.random() > 0.4
        },
        uniqueElement: null
    };
}

/**
 * Extract brand colors from image
 */
async function extractBrandColors(imageBuffer, productAnalysis) {
    try {
        const { data, info } = await sharp(imageBuffer)
            .resize(100, 100, { fit: 'cover' })
            .raw()
            .toBuffer({ resolveWithObject: true });

        const colors = {};
        for (let i = 0; i < data.length; i += info.channels) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const key = `${Math.round(r / 32) * 32},${Math.round(g / 32) * 32},${Math.round(b / 32) * 32}`;
            colors[key] = (colors[key] || 0) + 1;
        }

        const sorted = Object.entries(colors).sort((a, b) => b[1] - a[1]);
        let accentColor = '#FF4757';

        for (const [colorKey] of sorted) {
            const [r, g, b] = colorKey.split(',').map(Number);
            const saturation = Math.max(r, g, b) - Math.min(r, g, b);
            const brightness = (r + g + b) / 3;

            if (saturation > 80 && brightness > 50 && brightness < 220) {
                accentColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                break;
            }
        }

        if (productAnalysis?.colorPalette?.length > 0) {
            accentColor = productAnalysis.colorPalette[0] || accentColor;
        }

        return { primary: '#0A0A1A', accent: accentColor, text: '#FFFFFF' };
    } catch (e) {
        return { primary: '#0A0A1A', accent: '#FF4757', text: '#FFFFFF' };
    }
}

/**
 * Generate background based on dynamic layout
 */
async function generateDynamicBackground({ accentColor, layout, industry, productAnalysis, extractedColors }) {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: { responseModalities: ['image', 'text'] }
        });

        const bgStyle = layout.background?.style || 'radial_glow';
        const hasParticles = layout.background?.hasParticles;
        const hasBokeh = layout.background?.hasBokeh;
        const glowIntensity = layout.background?.glowIntensity || 0.15;

        const prompt = `Create a premium advertisement background.

⛔ NO products, devices, text, or UI elements - EMPTY SCENE ONLY.

CANVAS: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}px

STYLE: ${bgStyle}
- ${bgStyle === 'radial_glow' ? 'Radial gradient with glowing center orb' : ''}
- ${bgStyle === 'gradient' ? 'Smooth multi-directional gradient' : ''}
- ${bgStyle === 'mesh' ? 'Subtle mesh gradient like Apple' : ''}
- ${bgStyle === 'particles' ? 'Floating particles and dust' : ''}

COLORS:
- Primary: ${extractedColors.primary || '#0A0A1A'}
- Accent glow: ${accentColor} at ${Math.round(glowIntensity * 100)}% opacity

EFFECTS:
${hasParticles ? '- Add floating particles/dust motes' : ''}
${hasBokeh ? '- Add soft bokeh circles (3-5 circles)' : ''}
- Subtle vignette at edges

PRODUCT PLACEMENT ZONE:
- Keep area around x=${layout.product?.x || 0.5}, y=${layout.product?.y || 0.45} clear for product

INDUSTRY: ${industry}
MOOD: Premium, ${productAnalysis?.adStyle || 'bold'}, agency-quality

OUTPUT: Empty background ready for product overlay.`;

        const result = await model.generateContent([{ text: prompt }]);
        const candidates = result.response?.candidates;

        if (candidates?.[0]?.content?.parts) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData?.data) {
                    console.log('[CompositeGen] ✅ Dynamic background generated');
                    const buffer = Buffer.from(part.inlineData.data, 'base64');
                    return await sharp(buffer).resize(CANVAS_WIDTH, CANVAS_HEIGHT).png().toBuffer();
                }
            }
        }

        throw new Error('No background');
    } catch (error) {
        console.warn('[CompositeGen] Background failed:', error.message);
        return await createFallbackBackground(accentColor, layout);
    }
}

/**
 * Simple fallback background
 */
async function createFallbackBackground(accentColor, layout) {
    const intensity = layout?.background?.glowIntensity || 0.15;

    const svg = `
    <svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="bg" cx="50%" cy="40%" r="90%">
                <stop offset="0%" style="stop-color:#1A1A3A"/>
                <stop offset="100%" style="stop-color:#0A0A1A"/>
            </radialGradient>
            <radialGradient id="glow" cx="50%" cy="45%" r="50%">
                <stop offset="0%" style="stop-color:${accentColor};stop-opacity:${intensity}"/>
                <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0"/>
            </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <ellipse cx="540" cy="450" rx="400" ry="350" fill="url(#glow)"/>
    </svg>`;

    return await sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Create mockup based on dynamic layout
 */
async function createDynamicMockup({ screenshotBuffer, mockupStyle, accentColor }) {
    const type = mockupStyle?.type || 'floating';
    const showShadow = mockupStyle?.showShadow !== false;
    const showReflection = mockupStyle?.showReflection || false;

    switch (type) {
        case 'macbook':
            return await createMacBookMockup(screenshotBuffer, accentColor, showReflection, showShadow);
        case 'ipad':
            return await createIPadMockup(screenshotBuffer, showShadow);
        case 'browser':
            return await createBrowserMockup(screenshotBuffer, showShadow);
        case 'phone':
            return await createPhoneMockup(screenshotBuffer, showShadow);
        case 'minimal':
            return await createMinimalMockup(screenshotBuffer, showShadow);
        case 'none':
            return screenshotBuffer;
        case 'floating':
        default:
            return await createFloatingMockup(screenshotBuffer, showShadow);
    }
}

// ========================================
// MOCKUP IMPLEMENTATIONS
// ========================================

async function createMacBookMockup(screenshotBuffer, accentColor, showReflection, showShadow) {
    const screenWidth = 680;
    const screenHeight = 425;
    const frameWidth = screenWidth + 50;
    const frameHeight = screenHeight + 85;

    const frameSvg = `
    <svg width="${frameWidth}" height="${frameHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="lid" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#4a4a4c"/>
                <stop offset="50%" style="stop-color:#2c2c2e"/>
                <stop offset="100%" style="stop-color:#1c1c1e"/>
            </linearGradient>
            ${showShadow ? `<filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="15" stdDeviation="25" flood-color="#000" flood-opacity="0.6"/>
            </filter>` : ''}
            ${showReflection ? `<linearGradient id="reflect" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:white;stop-opacity:0.12"/>
                <stop offset="50%" style="stop-color:white;stop-opacity:0"/>
            </linearGradient>` : ''}
        </defs>
        <g ${showShadow ? 'filter="url(#shadow)"' : ''}>
            <rect x="0" y="0" width="${frameWidth}" height="${frameHeight - 25}" rx="14" fill="url(#lid)"/>
        </g>
        <rect x="12" y="12" width="${screenWidth + 26}" height="${screenHeight + 26}" rx="6" fill="#0a0a0a"/>
        <rect x="25" y="25" width="${screenWidth}" height="${screenHeight}" rx="2" fill="#000"/>
        <circle cx="${frameWidth / 2}" cy="20" r="4" fill="#1a1a1a"/>
        <rect x="0" y="${frameHeight - 25}" width="${frameWidth}" height="25" rx="3" fill="#2a2a2c"/>
        ${showReflection ? `<rect x="25" y="25" width="${screenWidth}" height="${screenHeight / 2}" rx="2" fill="url(#reflect)"/>` : ''}
    </svg>`;

    const frameBuffer = await sharp(Buffer.from(frameSvg)).png().toBuffer();
    const screenshotResized = await sharp(screenshotBuffer)
        .resize(screenWidth, screenHeight, { fit: 'cover' })
        .png()
        .toBuffer();

    return await sharp(frameBuffer)
        .composite([{ input: screenshotResized, left: 25, top: 25 }])
        .png()
        .toBuffer();
}

async function createIPadMockup(screenshotBuffer, showShadow) {
    const screenWidth = 600;
    const screenHeight = 450;
    const frameWidth = screenWidth + 40;
    const frameHeight = screenHeight + 40;

    const frameSvg = `
    <svg width="${frameWidth}" height="${frameHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            ${showShadow ? `<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#000" flood-opacity="0.5"/>
            </filter>` : ''}
        </defs>
        <rect x="0" y="0" width="${frameWidth}" height="${frameHeight}" rx="20" fill="#c0c0c0" ${showShadow ? 'filter="url(#shadow)"' : ''}/>
        <rect x="20" y="20" width="${screenWidth}" height="${screenHeight}" rx="4" fill="#000"/>
    </svg>`;

    const frameBuffer = await sharp(Buffer.from(frameSvg)).png().toBuffer();
    const screenshotResized = await sharp(screenshotBuffer)
        .resize(screenWidth, screenHeight, { fit: 'cover' })
        .png()
        .toBuffer();

    return await sharp(frameBuffer)
        .composite([{ input: screenshotResized, left: 20, top: 20 }])
        .png()
        .toBuffer();
}

async function createBrowserMockup(screenshotBuffer, showShadow) {
    const screenWidth = 720;
    const screenHeight = 480;
    const frameWidth = screenWidth + 16;
    const frameHeight = screenHeight + 48;

    const frameSvg = `
    <svg width="${frameWidth}" height="${frameHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            ${showShadow ? `<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="15" flood-color="#000" flood-opacity="0.4"/>
            </filter>` : ''}
        </defs>
        <rect x="0" y="0" width="${frameWidth}" height="${frameHeight}" rx="10" fill="#1e1e1e" ${showShadow ? 'filter="url(#shadow)"' : ''}/>
        <rect x="0" y="0" width="${frameWidth}" height="40" rx="10" fill="#2d2d2d"/>
        <circle cx="20" cy="20" r="6" fill="#ff5f57"/>
        <circle cx="40" cy="20" r="6" fill="#febc2e"/>
        <circle cx="60" cy="20" r="6" fill="#28c840"/>
        <rect x="90" y="10" width="${frameWidth - 110}" height="20" rx="4" fill="#1a1a1a"/>
    </svg>`;

    const frameBuffer = await sharp(Buffer.from(frameSvg)).png().toBuffer();
    const screenshotResized = await sharp(screenshotBuffer)
        .resize(screenWidth, screenHeight, { fit: 'cover' })
        .png()
        .toBuffer();

    return await sharp(frameBuffer)
        .composite([{ input: screenshotResized, left: 8, top: 40 }])
        .png()
        .toBuffer();
}

async function createPhoneMockup(screenshotBuffer, showShadow) {
    const screenWidth = 280;
    const screenHeight = 600;
    const frameWidth = screenWidth + 24;
    const frameHeight = screenHeight + 48;

    const frameSvg = `
    <svg width="${frameWidth}" height="${frameHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            ${showShadow ? `<filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="#000" flood-opacity="0.5"/>
            </filter>` : ''}
        </defs>
        <rect x="0" y="0" width="${frameWidth}" height="${frameHeight}" rx="30" fill="#2c2c2e" ${showShadow ? 'filter="url(#shadow)"' : ''}/>
        <rect x="12" y="24" width="${screenWidth}" height="${screenHeight}" rx="8" fill="#000"/>
        <rect x="${frameWidth / 2 - 40}" y="32" width="80" height="22" rx="11" fill="#1a1a1a"/>
    </svg>`;

    const frameBuffer = await sharp(Buffer.from(frameSvg)).png().toBuffer();
    const screenshotResized = await sharp(screenshotBuffer)
        .resize(screenWidth, screenHeight, { fit: 'cover' })
        .png()
        .toBuffer();

    return await sharp(frameBuffer)
        .composite([{ input: screenshotResized, left: 12, top: 24 }])
        .png()
        .toBuffer();
}

async function createFloatingMockup(screenshotBuffer, showShadow) {
    const width = 700;
    const height = 450;

    const rounded = await sharp(screenshotBuffer)
        .resize(width, height, { fit: 'cover' })
        .png()
        .toBuffer();

    if (!showShadow) return rounded;

    const shadowSvg = `
    <svg width="${width + 60}" height="${height + 60}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#000" flood-opacity="0.5"/>
            </filter>
        </defs>
        <rect x="30" y="20" width="${width}" height="${height}" rx="12" fill="#000" filter="url(#shadow)"/>
    </svg>`;

    const shadowBuffer = await sharp(Buffer.from(shadowSvg)).png().toBuffer();

    return await sharp(shadowBuffer)
        .composite([{ input: rounded, left: 30, top: 20 }])
        .png()
        .toBuffer();
}

async function createMinimalMockup(screenshotBuffer, showShadow) {
    return await createFloatingMockup(screenshotBuffer, showShadow);
}

/**
 * Apply dynamic composite based on layout
 */
async function applyDynamicComposite({ backgroundBuffer, mockupBuffer, layout }) {
    if (!mockupBuffer) {
        return await sharp(backgroundBuffer).resize(CANVAS_WIDTH, CANVAS_HEIGHT).png().toBuffer();
    }

    const mockupMeta = await sharp(mockupBuffer).metadata();
    const productConfig = layout.product || {};

    const scale = productConfig.scale || 0.55;
    const targetWidth = Math.round(CANVAS_WIDTH * scale);
    const targetHeight = Math.round(mockupMeta.height * (targetWidth / mockupMeta.width));

    // Apply rotation if specified
    let resizedMockup = await sharp(mockupBuffer)
        .resize(targetWidth, targetHeight, { fit: 'inside' })
        .png()
        .toBuffer();

    if (productConfig.rotation && productConfig.rotation !== 0) {
        resizedMockup = await sharp(resizedMockup)
            .rotate(productConfig.rotation, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toBuffer();
    }

    const resizedMeta = await sharp(resizedMockup).metadata();

    // Position based on layout
    const xPos = productConfig.x !== undefined ? productConfig.x : 0.5;
    const yPos = productConfig.y !== undefined ? productConfig.y : 0.45;

    let left = Math.round(CANVAS_WIDTH * xPos - resizedMeta.width / 2);
    let top = Math.round(CANVAS_HEIGHT * yPos - resizedMeta.height / 2);

    // Keep in bounds
    left = Math.max(0, Math.min(left, CANVAS_WIDTH - resizedMeta.width));
    top = Math.max(0, Math.min(top, CANVAS_HEIGHT - resizedMeta.height));

    return await sharp(backgroundBuffer)
        .resize(CANVAS_WIDTH, CANVAS_HEIGHT)
        .composite([{ input: resizedMockup, left, top }])
        .png()
        .toBuffer();
}

/**
 * Add text overlay based on dynamic layout
 */
async function addDynamicTextOverlay(imageBuffer, { headline, tagline, cta, accentColor, layout }) {
    const headlineConfig = layout.headline || {};
    const taglineConfig = layout.tagline || {};
    const ctaConfig = layout.cta || {};

    const headlineX = Math.round(CANVAS_WIDTH * (headlineConfig.x || 0.5));
    const headlineY = Math.round(CANVAS_HEIGHT * (headlineConfig.y || 0.1)) + (headlineConfig.size || 56);
    const headlineSize = headlineConfig.size || 56;
    const headlineWeight = headlineConfig.weight || 800;

    const taglineY = Math.round(CANVAS_HEIGHT * (taglineConfig.y || 0.18)) + (taglineConfig.size || 24);
    const taglineSize = taglineConfig.size || 24;

    const ctaX = Math.round(CANVAS_WIDTH * (ctaConfig.x || 0.5));
    const ctaY = Math.round(CANVAS_HEIGHT * (ctaConfig.y || 0.88));
    const ctaWidth = ctaConfig.width || 300;
    const ctaHeight = ctaConfig.height || 64;
    const ctaRadius = ctaConfig.borderRadius || 32;

    const ctaGradientStart = lightenColor(accentColor, 15);

    const textSvg = `
    <svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="ctaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${ctaGradientStart}"/>
                <stop offset="100%" style="stop-color:${accentColor}"/>
            </linearGradient>
            <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="10" flood-color="#000" flood-opacity="0.8"/>
            </filter>
            <filter id="ctaShadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="8" stdDeviation="18" flood-color="${accentColor}" flood-opacity="0.5"/>
            </filter>
        </defs>
        
        <text x="${headlineX}" y="${headlineY}" 
              text-anchor="middle" fill="#FFFFFF" 
              font-family="system-ui, -apple-system, sans-serif" 
              font-size="${headlineSize}" font-weight="${headlineWeight}"
              letter-spacing="-1" filter="url(#textShadow)">
            ${escapeXml(headline)}
        </text>
        
        ${taglineConfig.show !== false && tagline ? `
        <text x="${CANVAS_WIDTH / 2}" y="${taglineY}" 
              text-anchor="middle" fill="rgba(255,255,255,0.8)" 
              font-family="system-ui, sans-serif" 
              font-size="${taglineSize}" font-weight="400" filter="url(#textShadow)">
            ${escapeXml(tagline)}
        </text>
        ` : ''}
        
        <g filter="url(#ctaShadow)">
            <rect x="${ctaX - ctaWidth / 2}" y="${ctaY}" width="${ctaWidth}" height="${ctaHeight}" rx="${ctaRadius}" fill="url(#ctaGrad)"/>
        </g>
        <text x="${ctaX}" y="${ctaY + ctaHeight / 2 + 8}" 
              text-anchor="middle" fill="#FFFFFF" 
              font-family="system-ui, sans-serif" 
              font-size="22" font-weight="700" letter-spacing="0.5">
            ${escapeXml(cta)}
        </text>
    </svg>`;

    const textBuffer = await sharp(Buffer.from(textSvg)).png().toBuffer();

    return await sharp(imageBuffer)
        .composite([{ input: textBuffer, left: 0, top: 0 }])
        .png()
        .toBuffer();
}

function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

function escapeXml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export default { generateCompositeAd };
