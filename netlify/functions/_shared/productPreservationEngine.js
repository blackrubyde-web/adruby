/**
 * Product Preservation Engine
 * 
 * Ensures the EXACT product image is used 1:1 in final ad.
 * 
 * Strategy:
 * 1. Generate background/design elements ONLY (no product)
 * 2. Composite original product image on top
 * 3. Add text overlays as final layer
 * 
 * NOTE: Image compositing requires 'sharp' which may not be available in Netlify.
 * The buildHardenedProductPrompt function is the primary mechanism.
 */

// Sharp is optional - compositing only works if available
let sharp = null;
try {
    // Dynamic import to avoid build errors when sharp not installed
    // sharp = require('sharp'); // Uncomment when sharp is available
} catch (e) {
    console.log('[ProductPreservation] sharp not available - using prompt-only preservation');
}

/**
 * Generate a background-only prompt (no product)
 * The AI ONLY generates the scene/design, product will be composited later
 */
export function buildBackgroundOnlyPrompt(options) {
    const {
        layout = 'feature_callout',
        backgroundColor = 'vibrant orange',
        designElements = [],
        headline,
        features = [],
        cta,
        badge,
        productPlaceholder = true, // Leave space for product
        language = 'de',
    } = options;

    let prompt = `Create an advertisement BACKGROUND DESIGN ONLY - NO PRODUCT.

CRITICAL: This is a BACKGROUND/TEMPLATE image. 
Leave the CENTER AREA (approximately 40-50% of frame) EMPTY for product placement later.

BACKGROUND DESIGN:
- Solid ${backgroundColor} background
- Clean, professional advertising aesthetic
- Modern graphic design elements

`;

    // Add design elements based on layout
    if (layout.includes('callout') || layout.includes('arrows')) {
        prompt += `
DESIGN ELEMENTS:
- Curved hand-drawn arrows pointing TOWARD the empty center area
- The arrows should have a casual, organic feel
- Arrows in dark charcoal or contrasting color
`;
    }

    // Add text zones (but NOT the product)
    if (headline) {
        prompt += `
TEXT (MUST BE PERFECTLY READABLE):
- Bold headline "${headline}" at the TOP of the image
- Font: Modern, bold, professional
`;
    }

    if (features.length > 0) {
        prompt += `
FEATURE CALLOUTS around the EMPTY center area:
`;
        features.forEach((feature, i) => {
            const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
            const pos = positions[i % positions.length];
            prompt += `- "${feature}" positioned at ${pos}, with arrow pointing toward center\n`;
        });
    }

    if (cta) {
        prompt += `
CTA BUTTON:
- "${cta}" in a rounded button shape at bottom-right
- Contrasting color for visibility
`;
    }

    if (badge) {
        prompt += `
BADGE:
- "${badge}" in corner badge/ribbon style
`;
    }

    prompt += `

⚠️ CRITICAL RULES:
1. THE CENTER 40-50% MUST BE EMPTY or have only subtle background texture
2. NO product image - this will be added separately
3. All text PERFECTLY LEGIBLE
4. Professional advertising quality
5. 1:1 aspect ratio (1024x1024)

This is a TEMPLATE/BACKGROUND for later product compositing.`;

    return prompt;
}

/**
 * Remove background from product image using sharp
 * Returns product with transparent background (if possible)
 */
export async function prepareProductImage(imageBuffer) {
    try {
        // Get image metadata
        const metadata = await sharp(imageBuffer).metadata();

        // Ensure PNG format for transparency
        const preparedImage = await sharp(imageBuffer)
            .ensureAlpha()
            .png()
            .toBuffer();

        return {
            buffer: preparedImage,
            width: metadata.width,
            height: metadata.height,
        };
    } catch (error) {
        console.error('[ProductPreservation] Error preparing product image:', error);
        throw error;
    }
}

/**
 * Composite product image onto background
 * Places the EXACT product image at center of background
 */
export async function compositeProductOnBackground(backgroundBuffer, productBuffer, options = {}) {
    const {
        position = 'center',
        productScale = 0.45, // Product takes 45% of width
        verticalOffset = 0, // Positive = down, negative = up
    } = options;

    try {
        // Get background dimensions
        const bgMeta = await sharp(backgroundBuffer).metadata();
        const bgWidth = bgMeta.width || 1024;
        const bgHeight = bgMeta.height || 1024;

        // Calculate product size (maintain aspect ratio)
        const prodMeta = await sharp(productBuffer).metadata();
        const prodOrigWidth = prodMeta.width || 512;
        const prodOrigHeight = prodMeta.height || 512;

        const targetWidth = Math.round(bgWidth * productScale);
        const aspectRatio = prodOrigHeight / prodOrigWidth;
        const targetHeight = Math.round(targetWidth * aspectRatio);

        // Resize product while maintaining aspect ratio
        const resizedProduct = await sharp(productBuffer)
            .resize(targetWidth, targetHeight, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toBuffer();

        // Calculate center position
        const left = Math.round((bgWidth - targetWidth) / 2);
        const top = Math.round((bgHeight - targetHeight) / 2) + verticalOffset;

        // Composite product onto background
        const composited = await sharp(backgroundBuffer)
            .composite([{
                input: resizedProduct,
                left: left,
                top: top,
                blend: 'over'
            }])
            .png()
            .toBuffer();

        console.log(`[ProductPreservation] Composited product at (${left}, ${top}), size ${targetWidth}x${targetHeight}`);

        return composited;
    } catch (error) {
        console.error('[ProductPreservation] Compositing error:', error);
        throw error;
    }
}

/**
 * Add text overlay on top of composited image
 * Final layer with headline, CTA, etc.
 */
export async function addTextOverlay(imageBuffer, textConfig) {
    const {
        headline,
        cta,
        badge,
        features = [],
        fontColor = 'white',
        fontSize = 48,
    } = textConfig;

    // For now, return image as-is
    // Text overlays are handled in the AI generation or frontend
    // Full SVG text overlay can be implemented if needed

    console.log('[ProductPreservation] Text overlay config:', { headline, cta, badge });

    return imageBuffer;
}

/**
 * Full product-preserving ad generation pipeline
 */
export async function generateProductPreservingAd(options) {
    const {
        productImageBuffer,
        backgroundColor,
        layout,
        headline,
        features,
        cta,
        badge,
        generateBackground, // Function to call for background generation
    } = options;

    console.log('[ProductPreservation] Starting product-preserving generation...');

    // Step 1: Build background-only prompt
    const backgroundPrompt = buildBackgroundOnlyPrompt({
        layout,
        backgroundColor,
        headline,
        features,
        cta,
        badge,
    });

    console.log('[ProductPreservation] Background prompt built');

    // Step 2: Generate background (caller provides this function)
    const backgroundBuffer = await generateBackground(backgroundPrompt);
    console.log('[ProductPreservation] Background generated');

    // Step 3: Prepare product image
    const preparedProduct = await prepareProductImage(productImageBuffer);
    console.log('[ProductPreservation] Product prepared');

    // Step 4: Composite product onto background
    const compositedImage = await compositeProductOnBackground(
        backgroundBuffer,
        preparedProduct.buffer,
        { productScale: 0.45 }
    );
    console.log('[ProductPreservation] Product composited');

    // Step 5: Add text overlays (if needed)
    const finalImage = await addTextOverlay(compositedImage, {
        headline,
        cta,
        badge,
        features,
    });
    console.log('[ProductPreservation] Final image ready');

    return {
        imageBuffer: finalImage,
        metadata: {
            preservationMethod: 'compositing',
            productPreserved: true,
        }
    };
}

/**
 * Hardened product integrity prompt for cases where compositing isn't used
 * This is a FALLBACK when real compositing isn't available
 */
export function buildHardenedProductPrompt(visionDescription, productName) {
    return `

🚨🚨🚨 ABSOLUTE PRODUCT PRESERVATION - ZERO TOLERANCE FOR CHANGES 🚨🚨🚨

THE FOLLOWING PRODUCT MUST APPEAR **EXACTLY** AS DESCRIBED.
ANY DEVIATION = COMPLETE FAILURE.

═══════════════════════════════════════════════════════════════
PRODUCT LOCK: ${productName || 'Product'}
═══════════════════════════════════════════════════════════════

EXACT VISUAL SPECIFICATION (DO NOT ALTER ANYTHING):
${visionDescription}

LOCKED ATTRIBUTES (CANNOT BE CHANGED):
✗ Shape/Geometry → IDENTICAL, no modifications
✗ Colors → EXACT HEX VALUES, no color grading
✗ Proportions → EXACT RATIOS maintained
✗ Details → ALL details preserved (logos, text, patterns, textures)
✗ Material appearance → Same reflectivity, texture, finish
✗ Orientation → As specified, no rotation unless explicitly stated

WHAT MAY BE ADJUSTED:
✓ Camera angle (if product details remain visible)
✓ Background/environment
✓ Lighting quality (not color temperature)
✓ Surrounding design elements
✓ Scale within composition

VERIFICATION CHECKLIST BEFORE GENERATION:
□ Product shape matches description exactly?
□ Product colors are exact same hues?
□ All logos/text/markings preserved?
□ Material texture matches (matte/glossy/etc)?
□ No "artistic improvements" added to product?

If you cannot generate the EXACT product, generate a simpler version
that prioritizes accuracy over aesthetics.

THE PRODUCT IS SACRED. DO NOT IMPROVISE.

═══════════════════════════════════════════════════════════════
`;
}

export default {
    buildBackgroundOnlyPrompt,
    prepareProductImage,
    compositeProductOnBackground,
    addTextOverlay,
    generateProductPreservingAd,
    buildHardenedProductPrompt,
};
