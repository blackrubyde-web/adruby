/**
 * PRODUCT INTEGRATION ENGINE
 * 
 * Intelligently integrates product images INTO AI-generated scenes.
 * Uses GPT-4 Vision for product analysis and smart composition.
 * 
 * Flow:
 * 1. Analyze product with GPT-4V
 * 2. Build context prompt based on analysis + user intent
 * 3. Generate scene with product placeholder
 * 4. Composite product INTO scene (perspective-aware)
 * 5. Apply text overlays
 */

import sharp from 'sharp';
import OpenAI from 'openai';

const CANVAS = 1080;

// Mockup templates for different product types
const MOCKUP_TEMPLATES = {
    screenshot: {
        contexts: ['macbook', 'ipad', 'iphone', 'monitor', 'browser'],
        defaultContext: 'macbook',
    },
    lamp: {
        contexts: ['living_room', 'bedroom', 'desk', 'christmas'],
        effects: ['glow', 'ambient_light'],
    },
    product: {
        contexts: ['studio', 'lifestyle', 'flat_lay', 'in_use'],
        defaultContext: 'studio',
    },
    apparel: {
        contexts: ['model', 'flat_lay', 'hanger', 'lifestyle'],
    },
    food: {
        contexts: ['table', 'kitchen', 'hands', 'restaurant'],
    },
};

// Device frame specifications for perspective mapping
// These are tuned for AI-generated device images where the device fills most of the canvas
const DEVICE_FRAMES = {
    macbook: {
        // MacBook typically fills ~80% of canvas, screen starts ~5% from edges
        screenArea: { x: 0.05, y: 0.06, width: 0.90, height: 0.58 },
        perspective: { topShrink: 0.02, bottomExpand: 0.02 },
    },
    ipad: {
        screenArea: { x: 0.08, y: 0.08, width: 0.84, height: 0.84 },
        perspective: { topShrink: 0.01, bottomExpand: 0.01 },
    },
    iphone: {
        screenArea: { x: 0.10, y: 0.08, width: 0.80, height: 0.84 },
        perspective: { topShrink: 0.01, bottomExpand: 0.01 },
    },
};

/**
 * Analyze product image with GPT-4 Vision
 */
export async function analyzeProductImage(openai, imageUrl) {
    console.log('[ProductIntegration] Analyzing product with GPT-4V...');

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Analyze this product image for ad creation. Return JSON only:
{
    "productType": "screenshot|lamp|electronics|apparel|food|beauty|toy|other",
    "description": "Brief description of what you see",
    "suggestedContext": "macbook|ipad|iphone|studio|lifestyle|christmas|glow|etc",
    "colors": ["primary color", "secondary color"],
    "mood": "premium|playful|professional|cozy|energetic",
    "suggestedEffects": ["glow", "shadow", "reflection", etc],
    "isScreenContent": true/false,
    "aspectRatio": "portrait|landscape|square"
}`
                        },
                        {
                            type: 'image_url',
                            image_url: { url: imageUrl }
                        }
                    ]
                }
            ],
            max_tokens: 500,
            response_format: { type: "json_object" }
        });

        const analysis = JSON.parse(response.choices[0].message.content);
        console.log('[ProductIntegration] Product analysis:', analysis);
        return analysis;
    } catch (error) {
        console.error('[ProductIntegration] GPT-4V analysis failed:', error);
        // Return default analysis
        return {
            productType: 'product',
            description: 'Product image',
            suggestedContext: 'studio',
            colors: ['#FFFFFF', '#000000'],
            mood: 'premium',
            suggestedEffects: ['shadow'],
            isScreenContent: false,
            aspectRatio: 'square'
        };
    }
}

/**
 * Build optimized context prompt based on product analysis and user intent
 */
export function buildIntegratedPrompt(productAnalysis, userPrompt, options = {}) {
    const { headline, textPosition = 'bottom' } = options;

    const textZoneInstruction = textPosition === 'top'
        ? 'Keep the TOP 15% relatively empty for headline text.'
        : 'Keep the BOTTOM 20% relatively dark/simple for headline and CTA text.';

    // Detect user's intent from prompt
    const lowerPrompt = userPrompt.toLowerCase();
    const wantsMacbook = lowerPrompt.includes('macbook') || lowerPrompt.includes('laptop');
    const wantsIpad = lowerPrompt.includes('ipad') || lowerPrompt.includes('tablet');
    const wantsIphone = lowerPrompt.includes('iphone') || lowerPrompt.includes('phone') || lowerPrompt.includes('handy');
    const wantsChristmas = lowerPrompt.includes('weihnacht') || lowerPrompt.includes('christmas');
    const wantsGlow = lowerPrompt.includes('glow') || lowerPrompt.includes('leuchten') || lowerPrompt.includes('neon');
    const wantsDarkMode = lowerPrompt.includes('dark') || lowerPrompt.includes('dunkel');

    let contextType = productAnalysis.suggestedContext;
    let deviceFrame = null;

    // Override context based on user intent
    if (productAnalysis.isScreenContent || productAnalysis.productType === 'screenshot') {
        if (wantsMacbook) {
            contextType = 'macbook_scene';
            deviceFrame = 'macbook';
        } else if (wantsIpad) {
            contextType = 'ipad_scene';
            deviceFrame = 'ipad';
        } else if (wantsIphone) {
            contextType = 'iphone_scene';
            deviceFrame = 'iphone';
        } else {
            contextType = 'macbook_scene';
            deviceFrame = 'macbook';
        }
    }

    // Build style elements
    const styleElements = [];
    if (wantsDarkMode) styleElements.push('dark mode aesthetic, deep blacks');
    if (wantsGlow) styleElements.push('subtle neon glow accents');
    if (wantsChristmas) styleElements.push('christmas atmosphere, festive lighting');
    if (productAnalysis.mood === 'premium') styleElements.push('premium, Apple-like quality');

    // Extract colors from user prompt
    const colorMatches = userPrompt.match(/(?:rot|red|grün|green|blau|blue|gold|pink|lila|purple|orange|gelb|yellow)/gi);
    if (colorMatches) {
        styleElements.push(`accent colors: ${colorMatches.join(', ')}`);
    }

    let prompt;

    if (deviceFrame) {
        // Generate scene WITH device frame AND text
        prompt = `
PROFESSIONAL ADVERTISEMENT WITH DEVICE MOCKUP

Create a ${CANVAS}x${CANVAS}px advertisement image featuring a ${deviceFrame === 'macbook' ? 'MacBook Pro Space Black' : deviceFrame === 'ipad' ? 'iPad Pro' : 'iPhone 15 Pro'}.

DEVICE PLACEMENT:
- Position the ${deviceFrame} taking up 85-90% of the image width
- Device should be angled slightly (3D perspective) for premium feel
- THE SCREEN MUST BE COMPLETELY BLACK/EMPTY - the actual content will be composited later
- Device is centered horizontally

SCENE & ATMOSPHERE:
${userPrompt}

STYLE:
${styleElements.join(', ') || 'Premium dark aesthetic, cinematic lighting'}

TEXT IN IMAGE (CRITICAL - MUST BE RENDERED):
${headline ? `- Large bold headline text at BOTTOM of image: "${headline}"` : ''}
- Text should be white, bold, and highly readable
- Use clean sans-serif typography
- Add subtle shadow behind text for readability

CRITICAL:
- Device screen MUST be solid black (content added later)
- Text MUST be rendered clearly and legibly at the bottom
- Photorealistic device with designed background
- Premium $10,000 ad creative quality

OUTPUT: ${CANVAS}x${CANVAS}px
`;
    } else {
        // Generate integrated scene with product context
        prompt = `
PROFESSIONAL ADVERTISEMENT - INTEGRATED PRODUCT SCENE

Create a ${CANVAS}x${CANVAS}px advertisement featuring this product context:
- Product type: ${productAnalysis.productType}
- Product description: ${productAnalysis.description}

USER'S CREATIVE VISION:
${userPrompt}

INTEGRATION STYLE:
- Generate a scene where this type of product would naturally appear
- Leave a central area for the actual product to be composited
- Match the mood: ${productAnalysis.mood}
${wantsChristmas ? '- Include festive Christmas elements (hat on product position, decorations)' : ''}
${wantsGlow ? '- Add glow/light effects emanating from center where product will be' : ''}

SCENE STYLE:
${styleElements.join(', ') || 'Premium aesthetic'}

TEXT ZONES:
${textZoneInstruction}

CRITICAL:
- Central product area should have subtle lighting/glow for integration
- NO text or typography
- Premium quality

OUTPUT: ${CANVAS}x${CANVAS}px
`;
    }

    return {
        prompt: prompt.trim(),
        deviceFrame,
        contextType,
        effects: wantsGlow ? ['glow'] : [],
        christmas: wantsChristmas,
    };
}

/**
 * Composite product INTO device frame with perspective
 */
export async function compositeIntoDevice(contextBuffer, productBuffer, deviceType) {
    console.log(`[ProductIntegration] Compositing into ${deviceType}...`);

    const frame = DEVICE_FRAMES[deviceType] || DEVICE_FRAMES.macbook;

    // Get context dimensions
    const contextMeta = await sharp(contextBuffer).metadata();

    // Calculate screen area in pixels
    const screenX = Math.round(contextMeta.width * frame.screenArea.x);
    const screenY = Math.round(contextMeta.height * frame.screenArea.y);
    const screenW = Math.round(contextMeta.width * frame.screenArea.width);
    const screenH = Math.round(contextMeta.height * frame.screenArea.height);

    // Resize product to fit screen area
    const resizedProduct = await sharp(productBuffer)
        .resize(screenW, screenH, { fit: 'cover' })
        .png()
        .toBuffer();

    // Composite product into context
    const result = await sharp(contextBuffer)
        .composite([
            {
                input: resizedProduct,
                left: screenX,
                top: screenY,
            }
        ])
        .png()
        .toBuffer();

    console.log('[ProductIntegration] ✓ Device composite complete');
    return result;
}

/**
 * Composite product into center of scene (for non-device contexts)
 */
export async function compositeIntoScene(contextBuffer, productBuffer, options = {}) {
    console.log('[ProductIntegration] Compositing product into scene...');

    const { scale = 0.55, yOffset = 0 } = options;

    // Get context dimensions
    const contextMeta = await sharp(contextBuffer).metadata();

    // Calculate product size and position
    const productW = Math.round(contextMeta.width * scale);
    const productH = Math.round(contextMeta.height * scale);
    const productX = Math.round((contextMeta.width - productW) / 2);
    const productY = Math.round((contextMeta.height - productH) / 2) + yOffset;

    // Resize product
    const resizedProduct = await sharp(productBuffer)
        .resize(productW, productH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

    // Composite
    const result = await sharp(contextBuffer)
        .composite([
            {
                input: resizedProduct,
                left: productX,
                top: productY,
            }
        ])
        .png()
        .toBuffer();

    console.log('[ProductIntegration] ✓ Scene composite complete');
    return result;
}

/**
 * Apply glow effect around product area
 */
export async function applyGlowEffect(imageBuffer, color = '#FF4444', intensity = 0.3) {
    // Create glow SVG overlay
    const glowSvg = `
<svg width="${CANVAS}" height="${CANVAS}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:${intensity}"/>
            <stop offset="50%" style="stop-color:${color};stop-opacity:${intensity * 0.3}"/>
            <stop offset="100%" style="stop-color:${color};stop-opacity:0"/>
        </radialGradient>
    </defs>
    <ellipse cx="${CANVAS / 2}" cy="${CANVAS / 2}" rx="${CANVAS * 0.4}" ry="${CANVAS * 0.35}" fill="url(#glow)"/>
</svg>`;

    // First resize to CANVAS dimensions, then apply overlay
    const resizedImage = await sharp(imageBuffer)
        .resize(CANVAS, CANVAS, { fit: 'cover' })
        .png()
        .toBuffer();

    const result = await sharp(resizedImage)
        .composite([
            { input: Buffer.from(glowSvg), blend: 'screen' }
        ])
        .png()
        .toBuffer();

    return result;
}

/**
 * Generate text overlay SVG
 */
export function generateTextOverlay(config) {
    const {
        headline,
        subheadline,
        cta,
        textPosition = 'bottom',
    } = config;

    const textPrimary = '#FFFFFF';
    const textSecondary = 'rgba(255,255,255,0.85)';
    const ctaBg = '#FF4444';

    let headlineY, subheadlineY, ctaY;

    if (textPosition === 'top') {
        headlineY = 90;
        subheadlineY = headlineY + 60;
        ctaY = subheadlineY + 70;
    } else {
        headlineY = CANVAS - 160;
        subheadlineY = headlineY + 45;
        ctaY = CANVAS - 55;
    }

    let headlineFontSize = 64;
    if (headline && headline.length > 25) headlineFontSize = 52;
    if (headline && headline.length > 35) headlineFontSize = 42;

    let svg = `<svg width="${CANVAS}" height="${CANVAS}" xmlns="http://www.w3.org/2000/svg">
<defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="rgba(0,0,0,0.7)"/>
    </filter>
    <linearGradient id="fade" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:rgba(0,0,0,0)"/>
        <stop offset="65%" style="stop-color:rgba(0,0,0,0)"/>
        <stop offset="100%" style="stop-color:rgba(0,0,0,0.75)"/>
    </linearGradient>
</defs>
<rect x="0" y="0" width="${CANVAS}" height="${CANVAS}" fill="url(#fade)"/>
`;

    if (headline) {
        svg += `<text x="${CANVAS / 2}" y="${headlineY}" 
            font-family="Arial, Helvetica, sans-serif" 
            font-size="${headlineFontSize}" font-weight="800" 
            fill="${textPrimary}" text-anchor="middle"
            filter="url(#shadow)">${escapeXml(headline)}</text>`;
    }

    if (subheadline) {
        const words = subheadline.split(' ');
        let lines = [];
        let currentLine = '';
        words.forEach(word => {
            if ((currentLine + ' ' + word).trim().length <= 50) {
                currentLine = (currentLine + ' ' + word).trim();
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        });
        if (currentLine) lines.push(currentLine);

        lines.slice(0, 2).forEach((line, i) => {
            svg += `<text x="${CANVAS / 2}" y="${subheadlineY + (i * 26)}" 
                font-family="Arial, Helvetica, sans-serif" 
                font-size="22" font-weight="500" 
                fill="${textSecondary}" text-anchor="middle"
                filter="url(#shadow)">${escapeXml(line)}</text>`;
        });
    }

    if (cta) {
        const ctaWidth = Math.max(180, cta.length * 16 + 50);
        const ctaX = (CANVAS - ctaWidth) / 2;
        const ctaH = 50;

        svg += `
<rect x="${ctaX}" y="${ctaY}" width="${ctaWidth}" height="${ctaH}" 
      rx="${ctaH / 2}" fill="${ctaBg}"/>
<text x="${CANVAS / 2}" y="${ctaY + ctaH / 2 + 7}" 
      font-family="Arial, Helvetica, sans-serif" 
      font-size="18" font-weight="700" 
      fill="#FFFFFF" text-anchor="middle">${escapeXml(cta)}</text>`;
    }

    svg += `</svg>`;
    return svg;
}

/**
 * Apply text overlay to image
 */
export async function applyTextOverlay(imageBuffer, config) {
    const overlaySvg = generateTextOverlay(config);

    // First resize to CANVAS dimensions, then apply overlay
    const resizedImage = await sharp(imageBuffer)
        .resize(CANVAS, CANVAS, { fit: 'cover' })
        .png()
        .toBuffer();

    const result = await sharp(resizedImage)
        .composite([
            { input: Buffer.from(overlaySvg), top: 0, left: 0 }
        ])
        .png()
        .toBuffer();

    return result;
}

function escapeXml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export default {
    analyzeProductImage,
    buildIntegratedPrompt,
    compositeIntoDevice,
    compositeIntoScene,
    applyGlowEffect,
    applyTextOverlay,
    generateTextOverlay,
    DEVICE_FRAMES,
    MOCKUP_TEMPLATES,
    CANVAS,
};
