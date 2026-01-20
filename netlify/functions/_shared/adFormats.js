/**
 * AD FORMATS & A/B VARIANTS
 * 
 * Support for all Meta ad formats and A/B variant generation.
 */

import sharp from 'sharp';

/**
 * All supported Meta ad formats with dimensions
 */
export const AD_FORMATS = {
    // Square formats (most common)
    feed_square: {
        name: 'Feed Square',
        width: 1080,
        height: 1080,
        aspectRatio: '1:1',
        platforms: ['instagram_feed', 'facebook_feed'],
        recommended: true
    },

    // Portrait formats
    feed_portrait: {
        name: 'Feed Portrait',
        width: 1080,
        height: 1350,
        aspectRatio: '4:5',
        platforms: ['instagram_feed', 'facebook_feed'],
        recommended: true
    },

    // Story/Reel formats
    story: {
        name: 'Story',
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        platforms: ['instagram_story', 'facebook_story'],
        recommended: false // Requires different layout
    },

    reel: {
        name: 'Reel',
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        platforms: ['instagram_reel', 'facebook_reel', 'tiktok'],
        recommended: false
    },

    // Landscape formats
    feed_landscape: {
        name: 'Feed Landscape',
        width: 1200,
        height: 628,
        aspectRatio: '1.91:1',
        platforms: ['facebook_feed', 'facebook_link_ad'],
        recommended: false
    }
};

/**
 * A/B Variant layout configurations
 */
export const VARIANT_LAYOUTS = {
    // Variant A: Product Hero (centered product, text bottom)
    product_hero: {
        name: 'Product Hero',
        description: 'Product centered as main focus, text at bottom',
        productPosition: 'center',
        productScale: 0.6,
        textPosition: 'bottom',
        backgroundColor: 'gradient_dark'
    },

    // Variant B: Product Left (product on left, text on right)
    product_left: {
        name: 'Product Left',
        description: 'Product on left side, text on right',
        productPosition: 'left',
        productScale: 0.5,
        textPosition: 'right',
        backgroundColor: 'solid_dark'
    },

    // Variant C: Minimal (large product, minimal text overlay)
    minimal: {
        name: 'Minimal',
        description: 'Oversized product with minimal text overlay',
        productPosition: 'center',
        productScale: 0.75,
        textPosition: 'overlay_bottom',
        backgroundColor: 'transparent'
    },

    // Variant D: Text Focus (text prominent, product smaller)
    text_focus: {
        name: 'Text Focus',
        description: 'Headline as hero, product supporting',
        productPosition: 'bottom',
        productScale: 0.4,
        textPosition: 'top',
        backgroundColor: 'gradient_brand'
    }
};

/**
 * Generate A/B variant prompts for the same product
 */
export function generateVariantPrompts(baseStrategy, variantCount = 3) {
    const variants = [];
    const layoutKeys = Object.keys(VARIANT_LAYOUTS);

    for (let i = 0; i < Math.min(variantCount, layoutKeys.length); i++) {
        const layoutKey = layoutKeys[i];
        const layout = VARIANT_LAYOUTS[layoutKey];

        const variantPrompt = modifyPromptForLayout(baseStrategy.imagePrompt, layout);

        variants.push({
            variantId: `variant_${String.fromCharCode(65 + i)}`, // A, B, C...
            layoutKey,
            layout,
            imagePrompt: variantPrompt,
            productIntegration: {
                ...baseStrategy.productIntegration,
                position: layout.productPosition,
                scale: layout.productScale
            },
            textConfig: {
                ...baseStrategy.textConfig,
                position: layout.textPosition
            }
        });
    }

    return variants;
}

/**
 * Modify prompt for specific layout
 */
function modifyPromptForLayout(originalPrompt, layout) {
    let prompt = originalPrompt;

    // Adjust product placement instructions
    switch (layout.productPosition) {
        case 'left':
            prompt = prompt.replace(
                /center|CENTER|middle|MIDDLE/gi,
                'LEFT SIDE (30% from left edge)'
            );
            break;
        case 'right':
            prompt = prompt.replace(
                /center|CENTER|middle|MIDDLE/gi,
                'RIGHT SIDE (30% from right edge)'
            );
            break;
        case 'bottom':
            prompt += '\nProduct should be positioned in the LOWER THIRD of the image.';
            break;
    }

    // Adjust text placement
    switch (layout.textPosition) {
        case 'top':
            prompt = prompt.replace(
                /bottom|BOTTOM/gi,
                'TOP of the image'
            );
            break;
        case 'right':
            prompt += '\nText should be on the RIGHT SIDE of the image, vertically centered.';
            break;
        case 'overlay_bottom':
            prompt += '\nMinimal text overlay at the very bottom, semi-transparent.';
            break;
    }

    return prompt;
}

/**
 * Resize image to specific ad format
 */
export async function resizeToFormat(imageBuffer, formatKey) {
    const format = AD_FORMATS[formatKey] || AD_FORMATS.feed_square;

    const resized = await sharp(imageBuffer)
        .resize(format.width, format.height, {
            fit: 'cover',
            position: 'center'
        })
        .png()
        .toBuffer();

    return {
        buffer: resized,
        format: format
    };
}

/**
 * Generate all format variations from a single ad
 */
export async function generateAllFormats(imageBuffer) {
    const formats = {};

    for (const [key, format] of Object.entries(AD_FORMATS)) {
        if (format.recommended) {
            const result = await resizeToFormat(imageBuffer, key);
            formats[key] = result;
        }
    }

    return formats;
}

/**
 * Get recommended formats for a platform
 */
export function getFormatsForPlatform(platform) {
    const recommended = [];

    for (const [key, format] of Object.entries(AD_FORMATS)) {
        if (format.platforms.includes(platform)) {
            recommended.push({ key, ...format });
        }
    }

    return recommended;
}

export default {
    AD_FORMATS,
    VARIANT_LAYOUTS,
    generateVariantPrompts,
    resizeToFormat,
    generateAllFormats,
    getFormatsForPlatform
};
