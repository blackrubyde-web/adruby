/**
 * Composite Ad Generator v7.0 - ADVANCED LOGIC
 * 
 * FULL PIPELINE:
 * 1. Product Analysis → GPT-4V deep understanding
 * 2. Foreplay Pattern Application → Copy layouts from winning ads
 * 3. Brand Color Extraction → Extract colors from screenshot
 * 4. Background Generation → Gemini creates matching scene
 * 5. Device Mockup Selection → MacBook/iPad/Browser/Floating/Phone
 * 6. Advanced Compositing → Shadows, reflections, perspective
 * 7. Text Overlay → Typography from Foreplay patterns
 * 8. Quality Verification → GPT-4V checks result
 */

import sharp from 'sharp';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { matchProduct, analyzeProduct } from '../ai/productMatcher.js';
import { extractPatternDNA, getDefaultDNA } from '../ai/visualDNA.js';
import { quickQualityCheck } from '../ai/qualityVerifier.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Canvas dimensions
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;

// Device mockup types
const MOCKUP_TYPES = {
    MACBOOK: 'macbook',
    MACBOOK_PRO: 'macbook_pro',
    IPAD: 'ipad',
    BROWSER: 'browser',
    FLOATING: 'floating',
    PHONE: 'phone',
    MINIMAL: 'minimal'
};

// Layout templates from Foreplay patterns
const LAYOUT_TEMPLATES = {
    hero_centered: { productY: 0.45, headlineY: 0.08, ctaY: 0.88, productScale: 0.55 },
    hero_left: { productX: 0.25, headlineX: 0.7, ctaX: 0.7, productScale: 0.5 },
    hero_right: { productX: 0.75, headlineX: 0.3, ctaX: 0.3, productScale: 0.5 },
    hero_top: { productY: 0.25, headlineY: 0.65, ctaY: 0.88, productScale: 0.45 },
    hero_bottom: { productY: 0.6, headlineY: 0.1, ctaY: 0.88, productScale: 0.5 },
    floating_cards: { productY: 0.45, headlineY: 0.08, ctaY: 0.88, productScale: 0.6, floating: true },
    split_screen: { productX: 0.65, textX: 0.25, productScale: 0.45 }
};

/**
 * Main composite ad generation - ADVANCED
 */
export async function generateCompositeAd({
    productImageBuffer,
    headline,
    tagline,
    cta,
    accentColor,
    industry,
    userPrompt,
    mockupType,
    layoutTemplate,
    enableQualityCheck = true
}) {
    console.log('[CompositeGen] 🎨 Starting ADVANCED Composite Pipeline v7.0...');
    const startTime = Date.now();

    // ========================================
    // PHASE 1: Deep Product Analysis
    // ========================================
    console.log('[CompositeGen] Phase 1: Deep Product Analysis...');

    let productAnalysis = null;
    let referenceAds = [];
    let visualDNA = getDefaultDNA();
    let extractedColors = { primary: '#0A0A1A', accent: accentColor || '#FF4757', text: '#FFFFFF' };

    if (productImageBuffer) {
        try {
            // Full product matching with Foreplay
            const matchResult = await matchProduct(productImageBuffer);
            productAnalysis = matchResult.analysis;
            referenceAds = matchResult.referenceAds || [];

            console.log(`[CompositeGen] Product: ${productAnalysis?.productName || 'Unknown'}`);
            console.log(`[CompositeGen] Type: ${productAnalysis?.productType || 'unknown'}`);
            console.log(`[CompositeGen] Foreplay references: ${referenceAds.length}`);

            // Extract DNA from winning ads
            if (referenceAds.length > 0) {
                const dnaResult = await extractPatternDNA(referenceAds, 5);
                visualDNA = dnaResult.pattern || visualDNA;
                console.log(`[CompositeGen] DNA: ${visualDNA.layout?.type || 'default'}, confidence: ${dnaResult.confidence || 0}`);
            }

            // Extract colors from product image
            extractedColors = await extractBrandColors(productImageBuffer, productAnalysis);
            console.log(`[CompositeGen] Extracted colors: primary=${extractedColors.primary}, accent=${extractedColors.accent}`);

        } catch (e) {
            console.warn('[CompositeGen] Product analysis failed:', e.message);
        }
    }

    // Use provided accent or extracted
    const finalAccentColor = accentColor || extractedColors.accent || '#FF4757';

    // Detect product type
    const isSaaSProduct = detectSaaSProduct(productAnalysis, userPrompt);
    const isPhoneApp = detectPhoneApp(productAnalysis, userPrompt);
    console.log(`[CompositeGen] SaaS: ${isSaaSProduct}, Phone App: ${isPhoneApp}`);

    // ========================================
    // PHASE 2: Layout Selection from Foreplay
    // ========================================
    console.log('[CompositeGen] Phase 2: Layout Selection...');

    const selectedLayout = selectLayoutFromDNA(visualDNA, layoutTemplate, isSaaSProduct);
    const selectedMockup = selectMockupType(isSaaSProduct, isPhoneApp, mockupType, visualDNA);

    console.log(`[CompositeGen] Layout: ${selectedLayout.name}, Mockup: ${selectedMockup}`);

    // ========================================
    // PHASE 3: Generate Scene Background
    // ========================================
    console.log('[CompositeGen] Phase 3: Generating scene background...');

    const backgroundBuffer = await generateSceneBackground({
        accentColor: finalAccentColor,
        visualDNA,
        industry: industry || productAnalysis?.productType || 'tech',
        layout: selectedLayout,
        extractedColors
    });

    // ========================================
    // PHASE 4: Advanced Device Mockup
    // ========================================
    console.log('[CompositeGen] Phase 4: Creating device mockup...');

    let mockupBuffer = null;
    if (productImageBuffer) {
        mockupBuffer = await createAdvancedMockup({
            screenshotBuffer: productImageBuffer,
            mockupType: selectedMockup,
            accentColor: finalAccentColor,
            addReflection: true,
            addShadow: true,
            perspective: visualDNA.effects?.perspective || 'subtle'
        });
    }

    // ========================================
    // PHASE 5: Composite with Layout
    // ========================================
    console.log('[CompositeGen] Phase 5: Layout compositing...');

    const compositeBuffer = await applyLayoutComposite({
        backgroundBuffer,
        mockupBuffer,
        layout: selectedLayout,
        visualDNA
    });

    // ========================================
    // PHASE 6: Text Overlay with DNA Typography
    // ========================================
    console.log('[CompositeGen] Phase 6: Typography from DNA...');

    const typographyConfig = extractTypographyFromDNA(visualDNA, selectedLayout);

    const finalBuffer = await addAdvancedTextOverlay(compositeBuffer, {
        headline: headline || productAnalysis?.suggestedHeadlines?.[0] || 'Premium Quality',
        tagline,
        cta: cta || 'Shop Now',
        accentColor: finalAccentColor,
        typography: typographyConfig,
        layout: selectedLayout
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
    console.log(`[CompositeGen] ✅ Complete in ${duration}ms`);

    return {
        buffer: finalBuffer,
        duration,
        isSaaSProduct,
        isPhoneApp,
        productAnalysis,
        referenceCount: referenceAds.length,
        layout: selectedLayout.name,
        mockupType: selectedMockup,
        qualityScore,
        extractedColors
    };
}

/**
 * Extract brand colors from product image using Sharp
 */
async function extractBrandColors(imageBuffer, productAnalysis) {
    try {
        // Get dominant colors using Sharp stats
        const { dominant, channels } = await sharp(imageBuffer)
            .resize(100, 100, { fit: 'cover' })
            .raw()
            .toBuffer({ resolveWithObject: true })
            .then(async ({ data, info }) => {
                // Sample pixels and find dominant colors
                const colors = {};
                for (let i = 0; i < data.length; i += info.channels) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    // Quantize to reduce color space
                    const key = `${Math.round(r / 32) * 32},${Math.round(g / 32) * 32},${Math.round(b / 32) * 32}`;
                    colors[key] = (colors[key] || 0) + 1;
                }
                // Sort by frequency
                const sorted = Object.entries(colors).sort((a, b) => b[1] - a[1]);
                return { dominant: sorted.slice(0, 5), channels: info.channels };
            });

        // Find most vibrant color for accent
        let accentColor = '#FF4757';
        let primaryColor = '#0A0A1A';

        for (const [colorKey] of dominant) {
            const [r, g, b] = colorKey.split(',').map(Number);
            const saturation = Math.max(r, g, b) - Math.min(r, g, b);
            const brightness = (r + g + b) / 3;

            // Use vibrant color as accent
            if (saturation > 80 && brightness > 50 && brightness < 220) {
                accentColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                break;
            }
        }

        // Use product analysis colors if available
        if (productAnalysis?.colorPalette?.length > 0) {
            accentColor = productAnalysis.colorPalette[0] || accentColor;
        }

        return { primary: primaryColor, accent: accentColor, text: '#FFFFFF' };
    } catch (e) {
        console.warn('[CompositeGen] Color extraction failed:', e.message);
        return { primary: '#0A0A1A', accent: '#FF4757', text: '#FFFFFF' };
    }
}

/**
 * Select layout template based on Visual DNA
 */
function selectLayoutFromDNA(visualDNA, preferredLayout, isSaaSProduct) {
    // If user specified a layout, use it
    if (preferredLayout && LAYOUT_TEMPLATES[preferredLayout]) {
        return { ...LAYOUT_TEMPLATES[preferredLayout], name: preferredLayout };
    }

    // Extract from DNA if available
    const dnaLayout = visualDNA.layout?.type;
    if (dnaLayout && LAYOUT_TEMPLATES[dnaLayout]) {
        return { ...LAYOUT_TEMPLATES[dnaLayout], name: dnaLayout };
    }

    // Default based on product type
    if (isSaaSProduct) {
        return { ...LAYOUT_TEMPLATES.hero_centered, name: 'hero_centered' };
    }

    // Random selection for variety
    const layoutKeys = Object.keys(LAYOUT_TEMPLATES);
    const randomLayout = layoutKeys[Math.floor(Math.random() * layoutKeys.length)];
    return { ...LAYOUT_TEMPLATES[randomLayout], name: randomLayout };
}

/**
 * Select mockup type based on product analysis
 */
function selectMockupType(isSaaSProduct, isPhoneApp, preferredType, visualDNA) {
    if (preferredType && Object.values(MOCKUP_TYPES).includes(preferredType)) {
        return preferredType;
    }

    // From DNA
    if (visualDNA.elements?.deviceType) {
        return visualDNA.elements.deviceType;
    }

    // Based on product type
    if (isPhoneApp) return MOCKUP_TYPES.PHONE;
    if (isSaaSProduct) return MOCKUP_TYPES.MACBOOK_PRO;

    return MOCKUP_TYPES.FLOATING;
}

/**
 * Detect if product is a phone app
 */
function detectPhoneApp(productAnalysis, userPrompt) {
    const keywords = ['phone', 'mobile', 'ios', 'android', 'app store', 'play store', 'iphone'];
    const text = `${userPrompt || ''} ${productAnalysis?.productName || ''} ${productAnalysis?.productType || ''}`.toLowerCase();
    return keywords.some(kw => text.includes(kw));
}

/**
 * Detect SaaS product
 */
function detectSaaSProduct(productAnalysis, userPrompt) {
    const keywords = ['saas', 'dashboard', 'app', 'software', 'platform', 'tool', 'interface', 'ui', 'screenshot', 'analytics', 'crm', 'erp', 'admin', 'panel'];
    const text = `${userPrompt || ''} ${productAnalysis?.productName || ''} ${productAnalysis?.productType || ''}`.toLowerCase();
    return keywords.some(kw => text.includes(kw));
}

/**
 * Generate scene background with Gemini
 */
async function generateSceneBackground({ accentColor, visualDNA, industry, layout, extractedColors }) {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: { responseModalities: ['image', 'text'] }
        });

        const bgStyle = visualDNA.style || 'premium_dark';
        const bgColors = visualDNA.colors?.background || {};

        const prompt = `Create a premium advertisement background scene.

⛔ NO products, devices, text, buttons, or UI elements - EMPTY SCENE ONLY.

SCENE REQUIREMENTS:
- Canvas: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}px (square)
- Style: ${bgStyle === 'light' ? 'Clean light premium' : 'Dark luxury tech'}
- Industry: ${industry}

COMPOSITION (based on layout: ${layout.name}):
- Leave clear space for product placement at the designated area
- ${layout.name === 'hero_centered' ? 'Central focus point with radial composition' : ''}
- ${layout.name === 'hero_left' || layout.name === 'hero_right' ? 'Asymmetric composition with gradient flow' : ''}
- ${layout.name === 'split_screen' ? 'Two-zone composition with subtle divider' : ''}

COLOR PALETTE:
- Primary: ${bgColors.primary || extractedColors.primary || '#0A0A1A'}
- Secondary: ${bgColors.secondary || '#1A1A3A'}
- Accent glow: ${accentColor} at 12-18% opacity

EFFECTS (choose based on style):
${visualDNA.effects?.hasParticles ? '- Floating particles or dust motes' : ''}
${visualDNA.effects?.hasBokeh ? '- Soft bokeh circles (3-5, blurred)' : ''}
${visualDNA.effects?.hasLightRays ? '- Subtle light rays from top' : ''}
- Subtle vignette at edges
- Subtle noise texture (2-3%)

MOOD: Premium ${industry} brand, agency-quality production value.

OUTPUT: ONLY the background, completely empty, ready for product overlay.`;

        const result = await model.generateContent([{ text: prompt }]);
        const candidates = result.response?.candidates;

        if (candidates?.[0]?.content?.parts) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData?.data) {
                    console.log('[CompositeGen] ✅ Scene background generated');
                    const buffer = Buffer.from(part.inlineData.data, 'base64');
                    return await sharp(buffer).resize(CANVAS_WIDTH, CANVAS_HEIGHT).png().toBuffer();
                }
            }
        }

        throw new Error('No background generated');
    } catch (error) {
        console.warn('[CompositeGen] Gemini background failed:', error.message);
        return await createPremiumGradientBackground(accentColor, visualDNA);
    }
}

/**
 * Create premium gradient fallback
 */
async function createPremiumGradientBackground(accentColor, visualDNA) {
    const style = visualDNA?.style || 'dark';
    const bgColor1 = style === 'light' ? '#F5F5F7' : '#0A0A18';
    const bgColor2 = style === 'light' ? '#E8E8ED' : '#151525';

    const svg = `
    <svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="bg" cx="50%" cy="35%" r="90%">
                <stop offset="0%" style="stop-color:${bgColor2}"/>
                <stop offset="100%" style="stop-color:${bgColor1}"/>
            </radialGradient>
            <radialGradient id="glow1" cx="30%" cy="30%" r="40%">
                <stop offset="0%" style="stop-color:${accentColor};stop-opacity:0.12"/>
                <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0"/>
            </radialGradient>
            <radialGradient id="glow2" cx="70%" cy="60%" r="35%">
                <stop offset="0%" style="stop-color:${accentColor};stop-opacity:0.08"/>
                <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0"/>
            </radialGradient>
            <filter id="noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise"/>
                <feColorMatrix type="saturate" values="0"/>
                <feBlend in="SourceGraphic" in2="noise" mode="overlay" result="blend"/>
                <feComposite in="blend" in2="SourceGraphic" operator="in"/>
            </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <ellipse cx="320" cy="320" rx="450" ry="380" fill="url(#glow1)"/>
        <ellipse cx="760" cy="650" rx="380" ry="320" fill="url(#glow2)"/>
        <!-- Bokeh circles -->
        <circle cx="200" cy="200" r="80" fill="${accentColor}" fill-opacity="0.04"/>
        <circle cx="850" cy="350" r="60" fill="${accentColor}" fill-opacity="0.05"/>
        <circle cx="150" cy="700" r="100" fill="${accentColor}" fill-opacity="0.03"/>
        <circle cx="900" cy="800" r="70" fill="${accentColor}" fill-opacity="0.04"/>
        <!-- Noise overlay -->
        <rect width="100%" height="100%" fill="white" opacity="0.02" filter="url(#noise)"/>
    </svg>`;

    return await sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Create advanced device mockup with effects
 */
async function createAdvancedMockup({ screenshotBuffer, mockupType, accentColor, addReflection, addShadow, perspective }) {
    switch (mockupType) {
        case MOCKUP_TYPES.MACBOOK:
        case MOCKUP_TYPES.MACBOOK_PRO:
            return await createMacBookMockup(screenshotBuffer, accentColor, addReflection, addShadow, perspective);
        case MOCKUP_TYPES.IPAD:
            return await createIPadMockup(screenshotBuffer, accentColor, addReflection, addShadow);
        case MOCKUP_TYPES.BROWSER:
            return await createBrowserMockup(screenshotBuffer, accentColor, addShadow);
        case MOCKUP_TYPES.PHONE:
            return await createPhoneMockup(screenshotBuffer, accentColor, addReflection, addShadow);
        case MOCKUP_TYPES.MINIMAL:
            return await createMinimalMockup(screenshotBuffer, addShadow);
        case MOCKUP_TYPES.FLOATING:
        default:
            return await createFloatingMockup(screenshotBuffer, accentColor, addShadow);
    }
}

/**
 * MacBook Pro mockup with screen glow and reflection
 */
async function createMacBookMockup(screenshotBuffer, accentColor, addReflection, addShadow, perspective) {
    const screenWidth = 680;
    const screenHeight = 425;
    const frameWidth = screenWidth + 50;
    const frameHeight = screenHeight + 85;

    // Create frame with gradients
    const frameSvg = `
    <svg width="${frameWidth}" height="${frameHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="lid" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#4a4a4c"/>
                <stop offset="50%" style="stop-color:#2c2c2e"/>
                <stop offset="100%" style="stop-color:#1c1c1e"/>
            </linearGradient>
            <linearGradient id="screenBezel" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#1a1a1a"/>
                <stop offset="100%" style="stop-color:#000000"/>
            </linearGradient>
            ${addShadow ? `
            <filter id="dropShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="15" stdDeviation="25" flood-color="#000000" flood-opacity="0.6"/>
            </filter>` : ''}
            ${addReflection ? `
            <linearGradient id="reflection" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:white;stop-opacity:0.15"/>
                <stop offset="50%" style="stop-color:white;stop-opacity:0"/>
            </linearGradient>` : ''}
            <filter id="screenGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="glow"/>
                <feMerge>
                    <feMergeNode in="glow"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        
        <!-- Main body with shadow -->
        <g ${addShadow ? 'filter="url(#dropShadow)"' : ''}>
            <rect x="0" y="0" width="${frameWidth}" height="${frameHeight - 25}" rx="14" fill="url(#lid)"/>
        </g>
        
        <!-- Screen bezel -->
        <rect x="12" y="12" width="${screenWidth + 26}" height="${screenHeight + 26}" rx="6" fill="url(#screenBezel)"/>
        
        <!-- Screen area (where screenshot goes) -->
        <rect x="25" y="25" width="${screenWidth}" height="${screenHeight}" rx="2" fill="#000"/>
        
        <!-- Screen glow effect -->
        <rect x="25" y="25" width="${screenWidth}" height="${screenHeight}" rx="2" fill="${accentColor}" fill-opacity="0.03" filter="url(#screenGlow)"/>
        
        <!-- Camera -->
        <circle cx="${frameWidth / 2}" cy="20" r="4" fill="#1a1a1a"/>
        <circle cx="${frameWidth / 2}" cy="20" r="2" fill="#0a0a0a"/>
        
        <!-- Bottom hinge -->
        <rect x="0" y="${frameHeight - 25}" width="${frameWidth}" height="25" rx="3" fill="#2a2a2c"/>
        <rect x="0" y="${frameHeight - 25}" width="${frameWidth}" height="4" fill="#3a3a3c"/>
        
        <!-- Trackpad hint -->
        <rect x="${frameWidth / 2 - 60}" y="${frameHeight - 18}" width="120" height="10" rx="2" fill="#1c1c1e"/>
        
        ${addReflection ? `
        <!-- Screen reflection -->
        <rect x="25" y="25" width="${screenWidth}" height="${screenHeight / 2}" rx="2" fill="url(#reflection)"/>
        ` : ''}
    </svg>`;

    const frameBuffer = await sharp(Buffer.from(frameSvg)).png().toBuffer();

    // Resize screenshot
    const screenshotResized = await sharp(screenshotBuffer)
        .resize(screenWidth, screenHeight, { fit: 'cover' })
        .png()
        .toBuffer();

    // Composite
    return await sharp(frameBuffer)
        .composite([
            { input: screenshotResized, left: 25, top: 25 }
        ])
        .png()
        .toBuffer();
}

/**
 * iPad mockup
 */
async function createIPadMockup(screenshotBuffer, accentColor, addReflection, addShadow) {
    const screenWidth = 600;
    const screenHeight = 450;
    const frameWidth = screenWidth + 40;
    const frameHeight = screenHeight + 40;

    const frameSvg = `
    <svg width="${frameWidth}" height="${frameHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="ipadBody" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#e0e0e0"/>
                <stop offset="100%" style="stop-color:#c0c0c0"/>
            </linearGradient>
            ${addShadow ? `
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#000" flood-opacity="0.5"/>
            </filter>` : ''}
        </defs>
        <rect x="0" y="0" width="${frameWidth}" height="${frameHeight}" rx="20" fill="url(#ipadBody)" ${addShadow ? 'filter="url(#shadow)"' : ''}/>
        <rect x="20" y="20" width="${screenWidth}" height="${screenHeight}" rx="4" fill="#000"/>
        <circle cx="${frameWidth / 2}" cy="12" r="4" fill="#888"/>
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

/**
 * Browser window mockup
 */
async function createBrowserMockup(screenshotBuffer, accentColor, addShadow) {
    const screenWidth = 720;
    const screenHeight = 480;
    const frameWidth = screenWidth + 16;
    const frameHeight = screenHeight + 48;

    const frameSvg = `
    <svg width="${frameWidth}" height="${frameHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            ${addShadow ? `
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="15" flood-color="#000" flood-opacity="0.4"/>
            </filter>` : ''}
        </defs>
        <!-- Window -->
        <rect x="0" y="0" width="${frameWidth}" height="${frameHeight}" rx="10" fill="#1e1e1e" ${addShadow ? 'filter="url(#shadow)"' : ''}/>
        <!-- Title bar -->
        <rect x="0" y="0" width="${frameWidth}" height="40" rx="10" fill="#2d2d2d"/>
        <rect x="0" y="30" width="${frameWidth}" height="10" fill="#2d2d2d"/>
        <!-- Traffic lights -->
        <circle cx="20" cy="20" r="6" fill="#ff5f57"/>
        <circle cx="40" cy="20" r="6" fill="#febc2e"/>
        <circle cx="60" cy="20" r="6" fill="#28c840"/>
        <!-- URL bar -->
        <rect x="90" y="10" width="${frameWidth - 110}" height="20" rx="4" fill="#1a1a1a"/>
        <text x="100" y="24" fill="#666" font-size="10" font-family="system-ui">adruby.com</text>
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

/**
 * Phone mockup
 */
async function createPhoneMockup(screenshotBuffer, accentColor, addReflection, addShadow) {
    const screenWidth = 280;
    const screenHeight = 600;
    const frameWidth = screenWidth + 24;
    const frameHeight = screenHeight + 48;

    const frameSvg = `
    <svg width="${frameWidth}" height="${frameHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="phoneBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#3a3a3c"/>
                <stop offset="100%" style="stop-color:#1c1c1e"/>
            </linearGradient>
            ${addShadow ? `
            <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="#000" flood-opacity="0.5"/>
            </filter>` : ''}
        </defs>
        <rect x="0" y="0" width="${frameWidth}" height="${frameHeight}" rx="30" fill="url(#phoneBody)" ${addShadow ? 'filter="url(#shadow)"' : ''}/>
        <rect x="12" y="24" width="${screenWidth}" height="${screenHeight}" rx="8" fill="#000"/>
        <!-- Dynamic Island -->
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

/**
 * Floating card mockup (no device frame)
 */
async function createFloatingMockup(screenshotBuffer, accentColor, addShadow) {
    const width = 700;
    const height = 450;

    // Just resize with rounded corners and shadow
    const rounded = await sharp(screenshotBuffer)
        .resize(width, height, { fit: 'cover' })
        .png()
        .toBuffer();

    if (!addShadow) return rounded;

    // Add shadow via composite
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

/**
 * Minimal mockup - just rounded corners
 */
async function createMinimalMockup(screenshotBuffer, addShadow) {
    return await createFloatingMockup(screenshotBuffer, '#FF4757', addShadow);
}

/**
 * Apply layout-based compositing
 */
async function applyLayoutComposite({ backgroundBuffer, mockupBuffer, layout, visualDNA }) {
    if (!mockupBuffer) {
        return await sharp(backgroundBuffer).resize(CANVAS_WIDTH, CANVAS_HEIGHT).png().toBuffer();
    }

    const mockupMeta = await sharp(mockupBuffer).metadata();

    // Calculate position based on layout
    let left, top;
    const productScale = layout.productScale || 0.55;

    // Resize mockup according to layout scale
    const targetWidth = Math.round(CANVAS_WIDTH * productScale);
    const targetHeight = Math.round(mockupMeta.height * (targetWidth / mockupMeta.width));

    const resizedMockup = await sharp(mockupBuffer)
        .resize(targetWidth, targetHeight, { fit: 'inside' })
        .png()
        .toBuffer();

    const resizedMeta = await sharp(resizedMockup).metadata();

    // Position based on layout type
    if (layout.productX !== undefined) {
        left = Math.round(CANVAS_WIDTH * layout.productX - resizedMeta.width / 2);
    } else {
        left = Math.round((CANVAS_WIDTH - resizedMeta.width) / 2);
    }

    if (layout.productY !== undefined) {
        top = Math.round(CANVAS_HEIGHT * layout.productY - resizedMeta.height / 2);
    } else {
        top = Math.round((CANVAS_HEIGHT - resizedMeta.height) / 2);
    }

    // Ensure within bounds
    left = Math.max(0, Math.min(left, CANVAS_WIDTH - resizedMeta.width));
    top = Math.max(0, Math.min(top, CANVAS_HEIGHT - resizedMeta.height));

    return await sharp(backgroundBuffer)
        .resize(CANVAS_WIDTH, CANVAS_HEIGHT)
        .composite([{ input: resizedMockup, left, top }])
        .png()
        .toBuffer();
}

/**
 * Extract typography settings from Visual DNA
 */
function extractTypographyFromDNA(visualDNA, layout) {
    const defaultTypo = {
        headlineSize: 56,
        headlineWeight: 800,
        headlineLetterSpacing: -1,
        taglineSize: 24,
        ctaSize: 22,
        ctaWeight: 700,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    };

    // Override from DNA if available
    if (visualDNA.typography) {
        return {
            ...defaultTypo,
            headlineSize: visualDNA.typography.headlineSize || defaultTypo.headlineSize,
            headlineWeight: visualDNA.typography.headlineWeight || defaultTypo.headlineWeight,
            taglineSize: visualDNA.typography.taglineSize || defaultTypo.taglineSize,
            ctaSize: visualDNA.typography.ctaSize || defaultTypo.ctaSize
        };
    }

    return defaultTypo;
}

/**
 * Advanced text overlay with DNA-based typography
 */
async function addAdvancedTextOverlay(imageBuffer, { headline, tagline, cta, accentColor, typography, layout }) {
    const ctaGradientStart = lightenColor(accentColor, 15);
    const ctaGradientEnd = accentColor;

    // Calculate positions based on layout
    const headlineY = Math.round(CANVAS_HEIGHT * (layout.headlineY || 0.08));
    const taglineY = headlineY + typography.headlineSize + 10;
    const ctaY = Math.round(CANVAS_HEIGHT * (layout.ctaY || 0.88));
    const centerX = CANVAS_WIDTH / 2;

    const textSvg = `
    <svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="ctaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${ctaGradientStart}"/>
                <stop offset="100%" style="stop-color:${ctaGradientEnd}"/>
            </linearGradient>
            <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="10" flood-color="#000000" flood-opacity="0.8"/>
            </filter>
            <filter id="ctaGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="15" result="glow"/>
                <feMerge>
                    <feMergeNode in="glow"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <filter id="ctaShadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="8" stdDeviation="18" flood-color="${accentColor}" flood-opacity="0.5"/>
            </filter>
        </defs>
        
        <!-- Headline -->
        <text x="${centerX}" y="${headlineY + typography.headlineSize}" 
              text-anchor="middle" 
              fill="#FFFFFF" 
              font-family="${typography.fontFamily}" 
              font-size="${typography.headlineSize}" 
              font-weight="${typography.headlineWeight}"
              letter-spacing="${typography.headlineLetterSpacing}"
              filter="url(#textShadow)">
            ${escapeXml(headline)}
        </text>
        
        ${tagline ? `
        <text x="${centerX}" y="${taglineY + typography.taglineSize}" 
              text-anchor="middle" 
              fill="rgba(255,255,255,0.8)" 
              font-family="${typography.fontFamily}" 
              font-size="${typography.taglineSize}" 
              font-weight="400"
              filter="url(#textShadow)">
            ${escapeXml(tagline)}
        </text>
        ` : ''}
        
        <!-- CTA Button -->
        <g filter="url(#ctaShadow)">
            <rect x="${centerX - 150}" y="${ctaY}" width="300" height="64" rx="32" fill="url(#ctaGradient)"/>
            <rect x="${centerX - 100}" y="${ctaY + 6}" width="200" height="2" rx="1" fill="rgba(255,255,255,0.3)"/>
        </g>
        <text x="${centerX}" y="${ctaY + 42}" 
              text-anchor="middle" 
              fill="#FFFFFF" 
              font-family="${typography.fontFamily}" 
              font-size="${typography.ctaSize}" 
              font-weight="${typography.ctaWeight}"
              letter-spacing="0.5">
            ${escapeXml(cta)}
        </text>
    </svg>`;

    const textBuffer = await sharp(Buffer.from(textSvg)).png().toBuffer();

    return await sharp(imageBuffer)
        .composite([{ input: textBuffer, left: 0, top: 0 }])
        .png()
        .toBuffer();
}

/**
 * Helper functions
 */
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
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export default { generateCompositeAd };
