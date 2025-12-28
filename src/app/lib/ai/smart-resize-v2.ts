import type { AdDocument, StudioLayer } from '../../types/studio';

/**
 * SMART RESIZE V2
 * Multi-format auto-resize with focal point detection
 * 
 * Supported Formats:
 * - Meta Feed: 1080x1080 (1:1)
 * - Meta Story: 1080x1920 (9:16)
 * - Meta Reels: 1080x1920 (9:16)
 * - TikTok: 1080x1920 (9:16)
 * - LinkedIn: 1200x627 (≈2:1)
 */

export type AdFormat = 'meta_feed' | 'meta_story' | 'meta_reels' | 'tiktok' | 'linkedin';

export interface FormatSpec {
    name: string;
    width: number;
    height: number;
    safezone: { top: number; bottom: number; left: number; right: number }; // Pixels to avoid
    focalPoint?: { x: number; y: number }; // Center of interest
}

const FORMAT_SPECS: Record<AdFormat, FormatSpec> = {
    meta_feed: {
        name: 'Meta Feed (1:1)',
        width: 1080,
        height: 1080,
        safezone: { top: 40, bottom: 40, left: 40, right: 40 }
    },
    meta_story: {
        name: 'Meta Story (9:16)',
        width: 1080,
        height: 1920,
        safezone: { top: 250, bottom: 300, left: 40, right: 40 } // Top: profile pic, Bottom: CTA overlay
    },
    meta_reels: {
        name: 'Meta Reels (9:16)',
        width: 1080,
        height: 1920,
        safezone: { top: 200, bottom: 350, left: 40, right: 40 } // Similar to stories but more bottom space
    },
    tiktok: {
        name: 'TikTok (9:16)',
        width: 1080,
        height: 1920,
        safezone: { top: 100, bottom: 400, left: 40, right: 40 } // More bottom space for UI
    },
    linkedin: {
        name: 'LinkedIn (≈2:1)',
        width: 1200,
        height: 627,
        safezone: { top: 40, bottom: 40, left: 40, right: 40 }
    }
};

/**
 * Generate multi-format versions of an ad
 */
export function generateMultiFormatAds(
    baseAd: AdDocument,
    formats: AdFormat[] = ['meta_feed', 'meta_story', 'tiktok', 'linkedin']
): Record<AdFormat, AdDocument> {
    const result: Record<string, AdDocument> = {};

    // Detect focal point (where the most important content is)
    const focalPoint = detectFocalPoint(baseAd);

    formats.forEach(format => {
        const spec = FORMAT_SPECS[format];
        const resized = smartResize(baseAd, spec, focalPoint);
        result[format] = resized;
    });

    return result as Record<AdFormat, AdDocument>;
}

/**
 * Smart resize with focal point preservation
 */
export function smartResize(
    ad: AdDocument,
    targetSpec: FormatSpec,
    focalPoint?: { x: number; y: number }
): AdDocument {
    const resized: AdDocument = {
        ...ad,
        id: `${ad.id}_${targetSpec.name.replace(/\s/g, '_')}`,
        name: `${ad.name} (${targetSpec.name})`,
        width: targetSpec.width,
        height: targetSpec.height
    };

    const scaleX = targetSpec.width / ad.width;
    const scaleY = targetSpec.height / ad.height;

    // Determine which dimension to fit
    const isCropping = ad.width / ad.height !== targetSpec.width / targetSpec.height;

    if (!isCropping) {
        // Simple proportional resize
        resized.layers = ad.layers.map(layer => proportionalResize(layer, scaleX, scaleY));
    } else {
        // Smart crop with focal point
        resized.layers = ad.layers.map(layer =>
            smartCropResize(layer, ad, targetSpec, focalPoint)
        );
    }

    // Apply safe zone adjustments
    resized.layers = applySafeZone(resized.layers, targetSpec);

    return resized;
}

/**
 * Detect the focal point (center of visual interest)
 */
function detectFocalPoint(ad: AdDocument): { x: number; y: number } {
    // Priority order: product > cta > text > center

    const productLayer = ad.layers.find(l => l.type === 'product');
    if (productLayer) {
        return {
            x: productLayer.x + productLayer.width / 2,
            y: productLayer.y + productLayer.height / 2
        };
    }

    const ctaLayer = ad.layers.find(l => l.type === 'cta');
    if (ctaLayer) {
        return {
            x: ctaLayer.x + ctaLayer.width / 2,
            y: ctaLayer.y + ctaLayer.height / 2
        };
    }

    const headlineLayer = ad.layers.find(l => l.role === 'headline');
    if (headlineLayer) {
        return {
            x: headlineLayer.x + headlineLayer.width / 2,
            y: headlineLayer.y + headlineLayer.height / 2
        };
    }

    // Default to center
    return { x: ad.width / 2, y: ad.height / 2 };
}

/**
 * Proportional resize (no cropping)
 */
function proportionalResize(layer: StudioLayer, scaleX: number, scaleY: number): StudioLayer {
    return {
        ...layer,
        x: Math.round(layer.x * scaleX),
        y: Math.round(layer.y * scaleY),
        width: Math.round(layer.width * scaleX),
        height: Math.round(layer.height * scaleY)
    };
}

/**
 * Smart crop resize with focal point awareness
 */
function smartCropResize(
    layer: StudioLayer,
    originalAd: AdDocument,
    targetSpec: FormatSpec,
    focalPoint?: { x: number; y: number }
): StudioLayer {
    const focal = focalPoint || { x: originalAd.width / 2, y: originalAd.height / 2 };

    const originalRatio = originalAd.width / originalAd.height;
    const targetRatio = targetSpec.width / targetSpec.height;

    let scale: number;
    let offsetX: number = 0;
    let offsetY: number = 0;

    if (targetRatio > originalRatio) {
        // Target is wider: fit to width, crop top/bottom
        scale = targetSpec.width / originalAd.width;

        const scaledHeight = originalAd.height * scale;
        const cropHeight = scaledHeight - targetSpec.height;

        // Center crop around focal point
        const focalYScaled = focal.y * scale;
        offsetY = -(focalYScaled - targetSpec.height / 2);
        offsetY = Math.max(-cropHeight, Math.min(0, offsetY));

    } else {
        // Target is taller: fit to height, crop left/right
        scale = targetSpec.height / originalAd.height;

        const scaledWidth = originalAd.width * scale;
        const cropWidth = scaledWidth - targetSpec.width;

        // Center crop around focal point
        const focalXScaled = focal.x * scale;
        offsetX = -(focalXScaled - targetSpec.width / 2);
        offsetX = Math.max(-cropWidth, Math.min(0, offsetX));
    }

    return {
        ...layer,
        x: Math.round(layer.x * scale + offsetX),
        y: Math.round(layer.y * scale + offsetY),
        width: Math.round(layer.width * scale),
        height: Math.round(layer.height * scale)
    };
}

/**
 * Apply safe zone constraints (adjust layers that fall into danger zones)
 */
function applySafeZone(
    layers: StudioLayer[],
    spec: FormatSpec
): StudioLayer[] {
    return layers.map(layer => {
        let adjusted = { ...layer };

        // Check if layer is in top safe zone
        if (layer.y < spec.safezone.top && layer.type === 'text') {
            adjusted.y = spec.safezone.top;
        }

        // Check if layer is in bottom safe zone
        if (layer.y + layer.height > spec.height - spec.safezone.bottom && layer.type === 'cta') {
            adjusted.y = spec.height - spec.safezone.bottom - layer.height;
        }

        // Check if layer is in left safe zone
        if (layer.x < spec.safezone.left) {
            adjusted.x = spec.safezone.left;
        }

        // Check if layer is in right safe zone
        if (layer.x + layer.width > spec.width - spec.safezone.right) {
            adjusted.x = spec.width - spec.safezone.right - layer.width;
            // If layer is too wide, shrink it
            if (adjusted.x < spec.safezone.left) {
                adjusted.width = spec.width - spec.safezone.left - spec.safezone.right;
                adjusted.x = spec.safezone.left;

                // Adjust font size proportionally if it's text
                if ('fontSize' in adjusted) {
                    const scaleFactor = adjusted.width / layer.width;
                    (adjusted as any).fontSize = Math.round(((adjusted as any).fontSize || 16) * scaleFactor);
                }
            }
        }

        return adjusted;
    });
}

/**
 * Auto-scale text to fit within width constraints
 */
export function autoScaleText(
    layer: StudioLayer,
    maxWidth: number
): StudioLayer {
    if (!('fontSize' in layer) || !('text' in layer)) {
        return layer;
    }

    const adjusted = { ...layer };
    const text = (adjusted as any).text || '';
    const currentFontSize = (adjusted as any).fontSize || 16;

    // Rough estimation: 1 character ≈ 0.6 * fontSize in width
    const estimatedWidth = text.length * currentFontSize * 0.6;

    if (estimatedWidth > maxWidth) {
        const scaleFactor = maxWidth / estimatedWidth;
        (adjusted as any).fontSize = Math.max(12, Math.round(currentFontSize * scaleFactor));
        adjusted.width = maxWidth;
    }

    return adjusted;
}

/**
 * Get recommended formats for a platform
 */
export function getRecommendedFormats(platform: 'meta' | 'tiktok' | 'linkedin' | 'all'): AdFormat[] {
    switch (platform) {
        case 'meta':
            return ['meta_feed', 'meta_story', 'meta_reels'];
        case 'tiktok':
            return ['tiktok'];
        case 'linkedin':
            return ['linkedin'];
        case 'all':
            return ['meta_feed', 'meta_story', 'meta_reels', 'tiktok', 'linkedin'];
        default:
            return ['meta_feed'];
    }
}

/**
 * Export ad in specific format
 */
export function exportAdFormat(
    ad: AdDocument,
    format: AdFormat
): AdDocument {
    const spec = FORMAT_SPECS[format];
    const focalPoint = detectFocalPoint(ad);
    return smartResize(ad, spec, focalPoint);
}
