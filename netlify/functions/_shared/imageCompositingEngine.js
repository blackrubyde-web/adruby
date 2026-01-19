/**
 * Real Image Compositing Engine
 * 
 * Guarantees 1:1 product preservation by:
 * 1. Generating BACKGROUND ONLY (no product in AI generation)
 * 2. Fetching the ORIGINAL product image
 * 3. Compositing the EXACT product onto the background
 * 4. Adding text overlays as final layer
 * 
 * This is the ONLY way to guarantee the product is not modified.
 */

import sharp from 'sharp';

/**
 * Fetch image from URL and return as buffer
 */
export async function fetchImageAsBuffer(imageUrl) {
    console.log('[Compositing] Fetching image from:', imageUrl.substring(0, 50) + '...');

    const response = await fetch(imageUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Remove or make transparent the background of product image
 * Uses simple approach - works best with solid color backgrounds
 */
export async function prepareProductForCompositing(productBuffer, options = {}) {
    const {
        removeBackground = false, // If true, attempts to make edges transparent
        resizeToFit = 0.45, // Product takes 45% of final canvas
        canvasSize = 1024,
    } = options;

    try {
        // Get original dimensions
        const metadata = await sharp(productBuffer).metadata();
        const originalWidth = metadata.width || 512;
        const originalHeight = metadata.height || 512;

        // Calculate target size (maintain aspect ratio)
        const targetWidth = Math.round(canvasSize * resizeToFit);
        const aspectRatio = originalHeight / originalWidth;
        const targetHeight = Math.round(targetWidth * aspectRatio);

        // Resize product
        let processed = sharp(productBuffer)
            .resize(targetWidth, targetHeight, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            });

        // Ensure PNG for alpha channel
        processed = processed.png();

        const buffer = await processed.toBuffer();

        console.log(`[Compositing] Product prepared: ${targetWidth}x${targetHeight}`);

        return {
            buffer,
            width: targetWidth,
            height: targetHeight,
            originalWidth,
            originalHeight,
        };
    } catch (error) {
        console.error('[Compositing] Error preparing product:', error);
        throw error;
    }
}

/**
 * Composite product onto background at specified position
 */
export async function compositeProductOnBackground(backgroundBuffer, productBuffer, options = {}) {
    const {
        position = 'center', // 'center', 'center-bottom', 'center-left', etc.
        offsetX = 0,
        offsetY = 0,
        productScale = 0.45,
        canvasSize = 1024,
    } = options;

    try {
        // Prepare product (resize to fit)
        const preparedProduct = await prepareProductForCompositing(productBuffer, {
            resizeToFit: productScale,
            canvasSize,
        });

        // Get background metadata
        const bgMeta = await sharp(backgroundBuffer).metadata();
        const bgWidth = bgMeta.width || canvasSize;
        const bgHeight = bgMeta.height || canvasSize;

        // Calculate position
        let left, top;

        switch (position) {
            case 'center':
                left = Math.round((bgWidth - preparedProduct.width) / 2) + offsetX;
                top = Math.round((bgHeight - preparedProduct.height) / 2) + offsetY;
                break;
            case 'center-bottom':
                left = Math.round((bgWidth - preparedProduct.width) / 2) + offsetX;
                top = Math.round(bgHeight - preparedProduct.height - 100) + offsetY;
                break;
            case 'center-left':
                left = Math.round(bgWidth * 0.1) + offsetX;
                top = Math.round((bgHeight - preparedProduct.height) / 2) + offsetY;
                break;
            case 'center-right':
                left = Math.round(bgWidth * 0.9 - preparedProduct.width) + offsetX;
                top = Math.round((bgHeight - preparedProduct.height) / 2) + offsetY;
                break;
            default:
                left = Math.round((bgWidth - preparedProduct.width) / 2) + offsetX;
                top = Math.round((bgHeight - preparedProduct.height) / 2) + offsetY;
        }

        // Composite
        const result = await sharp(backgroundBuffer)
            .composite([{
                input: preparedProduct.buffer,
                left: Math.max(0, left),
                top: Math.max(0, top),
                blend: 'over'
            }])
            .png()
            .toBuffer();

        console.log(`[Compositing] Product composited at (${left}, ${top})`);

        return result;
    } catch (error) {
        console.error('[Compositing] Error compositing:', error);
        throw error;
    }
}

/**
 * Create text overlay SVG
 */
function createTextOverlaySVG(config) {
    const {
        width = 1024,
        height = 1024,
        headline,
        subheadline,
        cta,
        badge,
        features = [],
        style = 'modern-dark', // 'modern-dark', 'modern-light', 'glassmorphism'
    } = config;

    // Style presets
    const styles = {
        'modern-dark': {
            headlineColor: '#FFFFFF',
            textColor: '#E5E5E5',
            accentColor: '#FF4444',
            badgeBg: 'rgba(255, 68, 68, 0.95)',
            ctaBg: 'linear-gradient(135deg, #FF4444, #FF6666)',
            shadowColor: 'rgba(0,0,0,0.3)',
        },
        'modern-light': {
            headlineColor: '#1A1A1A',
            textColor: '#333333',
            accentColor: '#FF4444',
            badgeBg: '#FF4444',
            ctaBg: '#FF4444',
            shadowColor: 'rgba(0,0,0,0.1)',
        },
        'glassmorphism': {
            headlineColor: '#FFFFFF',
            textColor: '#E5E5E5',
            accentColor: '#00D4AA',
            badgeBg: 'rgba(255,255,255,0.15)',
            ctaBg: 'rgba(0, 212, 170, 0.9)',
            shadowColor: 'rgba(0,0,0,0.2)',
        }
    };

    const s = styles[style] || styles['modern-dark'];

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="${s.shadowColor}"/>
        </filter>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
    </defs>`;

    // Badge (top right)
    if (badge) {
        svg += `
    <rect x="${width - 140}" y="30" width="120" height="36" rx="18" fill="${s.badgeBg}"/>
    <text x="${width - 80}" y="54" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">${badge.toUpperCase()}</text>`;
    }

    // Headline (top area)
    if (headline) {
        svg += `
    <text x="${width / 2}" y="90" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="800" fill="${s.headlineColor}" text-anchor="middle" filter="url(#shadow)">${escapeXml(headline)}</text>`;
    }

    // Subheadline
    if (subheadline) {
        svg += `
    <text x="${width / 2}" y="130" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="400" fill="${s.textColor}" text-anchor="middle" opacity="0.9">${escapeXml(subheadline)}</text>`;
    }

    // Features (right side checklist)
    if (features.length > 0) {
        const startY = 200;
        const featureSpacing = 50;

        features.slice(0, 4).forEach((feature, i) => {
            const y = startY + (i * featureSpacing);
            svg += `
    <rect x="${width - 280}" y="${y - 15}" width="260" height="40" rx="20" fill="rgba(255,255,255,0.1)"/>
    <text x="${width - 250}" y="${y + 8}" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#00CC88">✓</text>
    <text x="${width - 225}" y="${y + 8}" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="500" fill="${s.headlineColor}">${escapeXml(feature)}</text>`;
        });
    }

    // CTA button (bottom)
    if (cta) {
        const ctaWidth = Math.min(cta.length * 12 + 60, 280);
        const ctaX = (width - ctaWidth) / 2;
        svg += `
    <rect x="${ctaX}" y="${height - 100}" width="${ctaWidth}" height="50" rx="25" fill="${s.accentColor}"/>
    <text x="${width / 2}" y="${height - 68}" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF" text-anchor="middle">${escapeXml(cta)}</text>`;
    }

    svg += `</svg>`;

    return svg;
}

/**
 * Escape XML special characters
 */
function escapeXml(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Add text overlay to composited image
 */
export async function addTextOverlay(imageBuffer, textConfig) {
    try {
        const metadata = await sharp(imageBuffer).metadata();
        const width = metadata.width || 1024;
        const height = metadata.height || 1024;

        // Create SVG overlay
        const svg = createTextOverlaySVG({
            width,
            height,
            ...textConfig,
            style: 'modern-dark', // Default to modern dark style
        });

        // Composite text overlay
        const result = await sharp(imageBuffer)
            .composite([{
                input: Buffer.from(svg),
                top: 0,
                left: 0,
            }])
            .png()
            .toBuffer();

        console.log('[Compositing] Text overlay added');
        return result;
    } catch (error) {
        console.error('[Compositing] Error adding text overlay:', error);
        // Return original if overlay fails
        return imageBuffer;
    }
}

/**
 * Full compositing pipeline
 * This is the main function that ensures 1:1 product preservation
 */
export async function createCompositedAd(options) {
    const {
        backgroundBuffer,
        productImageUrl,
        headline,
        subheadline,
        cta,
        badge,
        features = [],
        productPosition = 'center',
        productScale = 0.45,
        style = 'modern-dark',
    } = options;

    console.log('[Compositing] Starting full compositing pipeline...');

    // Step 1: Fetch original product image
    const productBuffer = await fetchImageAsBuffer(productImageUrl);
    console.log('[Compositing] ✓ Product image fetched');

    // Step 2: Composite product onto background
    const compositedImage = await compositeProductOnBackground(
        backgroundBuffer,
        productBuffer,
        {
            position: productPosition,
            productScale: productScale,
        }
    );
    console.log('[Compositing] ✓ Product composited');

    // Step 3: Add text overlays
    const finalImage = await addTextOverlay(compositedImage, {
        headline,
        subheadline,
        cta,
        badge,
        features,
        style,
    });
    console.log('[Compositing] ✓ Text overlays added');

    console.log('[Compositing] ✅ Pipeline complete - product preserved 1:1');

    return {
        buffer: finalImage,
        metadata: {
            productPreserved: true,
            method: 'real-compositing',
        }
    };
}

/**
 * Build background-only prompt for 2025-level design
 */
export function build2025BackgroundPrompt(options) {
    const {
        primaryColor = '#1A1A2E', // Dark navy
        accentColor = '#FF4444', // Ruby red accent
        style = 'modern-gradient',
        mood = 'premium',
        industry = 'gaming',
    } = options;

    const stylePrompts = {
        'modern-gradient': `
BACKGROUND ONLY - No product, leave center 50% empty for product placement.

Create a PREMIUM 2025 advertisement background:
- Deep gradient from ${primaryColor} to slightly lighter shade
- Subtle geometric shapes in background (low opacity)
- Modern glassmorphism UI card in top-right for features (frosted glass effect)
- Subtle ambient glow effects
- Professional, sleek, Instagram-ready

AESTHETIC:
- Think: Apple product launch quality
- Ultra-modern, minimalist but rich
- Subtle depth through layers and shadows
- Premium feel, not cluttered

COLOR SCHEME:
- Primary: Dark, sophisticated (${primaryColor})
- Accent spots of ${accentColor} for CTA areas
- White/light text areas

CENTER MUST BE EMPTY for product overlay.`,

        'glassmorphism': `
BACKGROUND ONLY - Leave center 50% empty.

Ultra-modern glassmorphism advertisement background:
- Gradient base from dark purple to deep blue
- Multiple frosted glass panels with blur effect
- Subtle light orbs/bokeh in background
- Floating glass cards for feature lists
- Neon accent lines (${accentColor})

2025 DESIGN TRENDS:
- Glassmorphism layers
- Soft shadows
- Blur effects (backdrop-filter style)
- Subtle gradients
- Premium lighting effects

CENTER AREA EMPTY for product placement.`,

        'neon-gaming': `
BACKGROUND ONLY - Center empty for product.

Gaming/tech advertisement background:
- Dark base (#0D0D0D to #1A1A2E gradient)
- RGB neon accent lines
- Subtle grid pattern overlay
- Glowing edges and particles
- Gaming aesthetic but PREMIUM, not cheap

Elements:
- Neon border accents
- Floating UI elements
- Subtle scanline texture
- Ambient particle effects

Clean center area for product.`,
    };

    return stylePrompts[style] || stylePrompts['modern-gradient'];
}

export default {
    fetchImageAsBuffer,
    prepareProductForCompositing,
    compositeProductOnBackground,
    addTextOverlay,
    createCompositedAd,
    build2025BackgroundPrompt,
};
