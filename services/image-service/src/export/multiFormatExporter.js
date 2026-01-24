/**
 * MULTI-FORMAT EXPORTER
 * 
 * Export ads to all major social media formats:
 * 
 * - Square (1080x1080) - Instagram Feed, Facebook
 * - Story (1080x1920) - Instagram/Facebook Stories, TikTok
 * - Portrait (1080x1350) - Instagram Portrait
 * - Landscape (1200x628) - Facebook Link, Twitter
 * - LinkedIn (1200x1200)
 * - Pinterest (1000x1500)
 * - YouTube Thumbnail (1280x720)
 * 
 * Intelligent content repositioning for each format
 */

import sharp from 'sharp';

// ========================================
// FORMAT DEFINITIONS
// ========================================

export const AD_FORMATS = {
    square: {
        name: 'Square',
        width: 1080,
        height: 1080,
        ratio: 1,
        platforms: ['instagram_feed', 'facebook_feed'],
        description: 'Instagram Feed, Facebook Feed'
    },
    story: {
        name: 'Story/Reel',
        width: 1080,
        height: 1920,
        ratio: 9 / 16,
        platforms: ['instagram_story', 'facebook_story', 'tiktok', 'youtube_shorts'],
        description: 'Instagram/Facebook Stories, TikTok, Reels'
    },
    portrait: {
        name: 'Portrait',
        width: 1080,
        height: 1350,
        ratio: 4 / 5,
        platforms: ['instagram_portrait'],
        description: 'Instagram Portrait (4:5)'
    },
    landscape: {
        name: 'Landscape',
        width: 1200,
        height: 628,
        ratio: 1.91,
        platforms: ['facebook_link', 'twitter'],
        description: 'Facebook Link Ads, Twitter'
    },
    linkedin: {
        name: 'LinkedIn',
        width: 1200,
        height: 1200,
        ratio: 1,
        platforms: ['linkedin'],
        description: 'LinkedIn Feed'
    },
    pinterest: {
        name: 'Pinterest',
        width: 1000,
        height: 1500,
        ratio: 2 / 3,
        platforms: ['pinterest'],
        description: 'Pinterest Pin'
    },
    youtube_thumb: {
        name: 'YouTube Thumbnail',
        width: 1280,
        height: 720,
        ratio: 16 / 9,
        platforms: ['youtube'],
        description: 'YouTube Thumbnail'
    }
};

// ========================================
// LAYOUT ADAPTATIONS PER FORMAT
// ========================================

export const FORMAT_LAYOUTS = {
    square: {
        product: { x: 0.5, y: 0.48, scale: 0.55 },
        headline: { x: 0.5, y: 0.12, maxWidth: 0.85 },
        tagline: { x: 0.5, y: 0.20, maxWidth: 0.75 },
        cta: { x: 0.5, y: 0.88 },
        badge: { x: 0.85, y: 0.08 }
    },
    story: {
        product: { x: 0.5, y: 0.45, scale: 0.65 },
        headline: { x: 0.5, y: 0.08, maxWidth: 0.9 },
        tagline: { x: 0.5, y: 0.14, maxWidth: 0.85 },
        cta: { x: 0.5, y: 0.92 },
        badge: { x: 0.85, y: 0.04 },
        features: { x: 0.5, y: 0.75, layout: 'vertical' }
    },
    portrait: {
        product: { x: 0.5, y: 0.45, scale: 0.6 },
        headline: { x: 0.5, y: 0.10, maxWidth: 0.85 },
        tagline: { x: 0.5, y: 0.18, maxWidth: 0.8 },
        cta: { x: 0.5, y: 0.90 },
        badge: { x: 0.85, y: 0.06 }
    },
    landscape: {
        product: { x: 0.7, y: 0.5, scale: 0.7 },
        headline: { x: 0.3, y: 0.35, maxWidth: 0.5, align: 'left' },
        tagline: { x: 0.3, y: 0.55, maxWidth: 0.45, align: 'left' },
        cta: { x: 0.3, y: 0.75, align: 'left' },
        badge: { x: 0.05, y: 0.1 }
    },
    linkedin: {
        product: { x: 0.5, y: 0.48, scale: 0.55 },
        headline: { x: 0.5, y: 0.12, maxWidth: 0.85 },
        tagline: { x: 0.5, y: 0.20, maxWidth: 0.75 },
        cta: { x: 0.5, y: 0.88 },
        badge: { x: 0.85, y: 0.08 }
    },
    pinterest: {
        product: { x: 0.5, y: 0.40, scale: 0.6 },
        headline: { x: 0.5, y: 0.08, maxWidth: 0.9 },
        tagline: { x: 0.5, y: 0.16, maxWidth: 0.85 },
        cta: { x: 0.5, y: 0.90 },
        badge: { x: 0.85, y: 0.04 },
        features: { x: 0.5, y: 0.70, layout: 'vertical' }
    },
    youtube_thumb: {
        product: { x: 0.65, y: 0.5, scale: 0.6 },
        headline: { x: 0.28, y: 0.4, maxWidth: 0.45, align: 'left', size: 1.2 },
        tagline: { x: 0.28, y: 0.6, maxWidth: 0.4, align: 'left' },
        cta: { x: 0.28, y: 0.8, align: 'left' },
        badge: { x: 0.05, y: 0.1 }
    }
};

// ========================================
// SINGLE FORMAT EXPORT
// ========================================

/**
 * Export ad to a specific format
 */
export async function exportToFormat({
    sourceBuffer,
    format = 'square',
    backgroundColor = '#0A0A1A',
    maintainQuality = true,
    smartCrop = true
}) {
    const formatConfig = AD_FORMATS[format];
    if (!formatConfig) {
        throw new Error(`Unknown format: ${format}`);
    }

    const { width, height } = formatConfig;
    const sourceMeta = await sharp(sourceBuffer).metadata();

    // Determine scaling strategy
    const sourceRatio = sourceMeta.width / sourceMeta.height;
    const targetRatio = width / height;

    let resizedBuffer;

    if (smartCrop && Math.abs(sourceRatio - targetRatio) > 0.1) {
        // Different aspect ratio - need smart cropping/extending
        if (targetRatio > sourceRatio) {
            // Target is wider - extend sides or crop top/bottom
            resizedBuffer = await sharp(sourceBuffer)
                .resize(width, height, {
                    fit: 'cover',
                    position: 'centre'
                })
                .png()
                .toBuffer();
        } else {
            // Target is taller - extend top/bottom with background
            const scaledHeight = Math.round(width / sourceRatio);
            const resized = await sharp(sourceBuffer)
                .resize(width, scaledHeight)
                .png()
                .toBuffer();

            // Create background and composite
            resizedBuffer = await sharp({
                create: {
                    width,
                    height,
                    channels: 4,
                    background: parseColor(backgroundColor)
                }
            })
                .composite([{
                    input: resized,
                    top: Math.round((height - scaledHeight) / 2),
                    left: 0
                }])
                .png()
                .toBuffer();
        }
    } else {
        // Similar ratio - simple resize
        resizedBuffer = await sharp(sourceBuffer)
            .resize(width, height, { fit: 'cover' })
            .png()
            .toBuffer();
    }

    return {
        buffer: resizedBuffer,
        format: formatConfig,
        width,
        height
    };
}

// ========================================
// BATCH EXPORT TO ALL FORMATS
// ========================================

/**
 * Export ad to all formats
 */
export async function exportToAllFormats({
    sourceBuffer,
    backgroundColor = '#0A0A1A',
    formats = null // null = all formats
}) {
    const targetFormats = formats || Object.keys(AD_FORMATS);
    const results = {};

    for (const formatKey of targetFormats) {
        try {
            results[formatKey] = await exportToFormat({
                sourceBuffer,
                format: formatKey,
                backgroundColor
            });
            console.log(`[MultiFormat] ✓ ${AD_FORMATS[formatKey].name}`);
        } catch (error) {
            console.error(`[MultiFormat] ✗ ${formatKey}:`, error.message);
            results[formatKey] = { error: error.message };
        }
    }

    return results;
}

// ========================================
// FORMAT-AWARE GENERATION
// ========================================

/**
 * Get layout positions for a specific format
 */
export function getFormatLayout(format = 'square') {
    const layout = FORMAT_LAYOUTS[format] || FORMAT_LAYOUTS.square;
    const formatConfig = AD_FORMATS[format] || AD_FORMATS.square;

    // Convert percentages to absolute positions
    const { width, height } = formatConfig;

    return {
        product: {
            x: Math.round(layout.product.x * width),
            y: Math.round(layout.product.y * height),
            scale: layout.product.scale
        },
        headline: {
            x: Math.round(layout.headline.x * width),
            y: Math.round(layout.headline.y * height),
            maxWidth: Math.round(layout.headline.maxWidth * width),
            align: layout.headline.align || 'center',
            sizeMultiplier: layout.headline.size || 1
        },
        tagline: {
            x: Math.round(layout.tagline.x * width),
            y: Math.round(layout.tagline.y * height),
            maxWidth: Math.round(layout.tagline.maxWidth * width),
            align: layout.tagline.align || 'center'
        },
        cta: {
            x: Math.round(layout.cta.x * width),
            y: Math.round(layout.cta.y * height),
            align: layout.cta.align || 'center'
        },
        badge: layout.badge ? {
            x: Math.round(layout.badge.x * width),
            y: Math.round(layout.badge.y * height)
        } : null,
        features: layout.features ? {
            x: Math.round(layout.features.x * width),
            y: Math.round(layout.features.y * height),
            layout: layout.features.layout || 'horizontal'
        } : null,
        canvas: { width, height }
    };
}

/**
 * Get recommended formats for a platform
 */
export function getFormatsForPlatform(platform) {
    const recommended = [];

    for (const [key, config] of Object.entries(AD_FORMATS)) {
        if (config.platforms.includes(platform)) {
            recommended.push({ key, ...config });
        }
    }

    return recommended;
}

/**
 * Get all available platforms
 */
export function getAllPlatforms() {
    const platforms = new Set();

    for (const config of Object.values(AD_FORMATS)) {
        config.platforms.forEach(p => platforms.add(p));
    }

    return Array.from(platforms);
}

// ========================================
// HELPER
// ========================================

function parseColor(color) {
    if (color.startsWith('#')) {
        const hex = color.slice(1);
        return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16),
            alpha: 1
        };
    }
    return { r: 10, g: 10, b: 26, alpha: 1 };
}

export default {
    AD_FORMATS,
    FORMAT_LAYOUTS,
    exportToFormat,
    exportToAllFormats,
    getFormatLayout,
    getFormatsForPlatform,
    getAllPlatforms
};
