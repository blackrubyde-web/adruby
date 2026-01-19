/**
 * Layout-Aware Ad Compositing System
 * 
 * Creates COMPLETE ads where all elements work together:
 * - Product at layout-specific position
 * - Text zones with proper hierarchy
 * - Design elements (arrows, callouts) pointing to product
 * - Badges, CTAs integrated into design
 */

import sharp from 'sharp';
// Import premium SVG overlay creator
import { createPremiumOverlaySVG } from './premiumDesignSystem.js';

/**
 * Ad Layout Templates with precise zones
 * Each layout defines WHERE each element goes
 */
export const AD_LAYOUTS_2025 = {
    // =============================================
    // FEATURE CALLOUT - Product center, features around
    // =============================================
    feature_callout: {
        id: 'feature_callout',
        name: 'Feature Callout',
        description: 'Product centered with feature callouts around it',
        zones: {
            product: { x: 0.25, y: 0.25, width: 0.50, height: 0.50 }, // Center, 50% size
            headline: { x: 0.05, y: 0.02, width: 0.90, height: 0.12 },
            badge: { x: 0.75, y: 0.02, width: 0.22, height: 0.08 },
            feature1: { x: 0.02, y: 0.20, width: 0.25, height: 0.10 },
            feature2: { x: 0.73, y: 0.20, width: 0.25, height: 0.10 },
            feature3: { x: 0.02, y: 0.70, width: 0.25, height: 0.10 },
            feature4: { x: 0.73, y: 0.70, width: 0.25, height: 0.10 },
            cta: { x: 0.30, y: 0.85, width: 0.40, height: 0.10 },
        },
        arrows: [
            { from: 'feature1', to: 'product', style: 'curved' },
            { from: 'feature2', to: 'product', style: 'curved' },
            { from: 'feature3', to: 'product', style: 'curved' },
            { from: 'feature4', to: 'product', style: 'curved' },
        ],
        backgroundPrompt: `
Premium advertisement background with EMPTY CENTER for product placement.
Dark gradient background (#1A1A2E to #2D2D44).
Subtle geometric shapes in corners (low opacity).
Space for 4 feature callouts in corners with curved arrows.
Modern, premium aesthetic.
Center 50% of image MUST be empty for product overlay.`,
    },

    // =============================================
    // HERO LEFT - Product left, content right (checklist)
    // =============================================
    hero_left_checklist: {
        id: 'hero_left_checklist',
        name: 'Hero Left + Checklist',
        description: 'Product on left, benefits checklist on right',
        zones: {
            product: { x: 0.02, y: 0.15, width: 0.45, height: 0.70 }, // Left side
            headline: { x: 0.50, y: 0.08, width: 0.48, height: 0.15 },
            badge: { x: 0.75, y: 0.02, width: 0.22, height: 0.06 },
            feature1: { x: 0.52, y: 0.28, width: 0.45, height: 0.10 },
            feature2: { x: 0.52, y: 0.42, width: 0.45, height: 0.10 },
            feature3: { x: 0.52, y: 0.56, width: 0.45, height: 0.10 },
            feature4: { x: 0.52, y: 0.70, width: 0.45, height: 0.10 },
            cta: { x: 0.52, y: 0.82, width: 0.40, height: 0.12 },
        },
        arrows: [], // No arrows, checklist style
        backgroundPrompt: `
Split-layout advertisement background.
Left 45%: Subtle gradient or lifestyle scene, EMPTY for product overlay.
Right 55%: Dark panel (#1A1A2E) for text content.
Modern glassmorphism divider between sections.
Premium, clean aesthetic.
LEFT SIDE MUST BE EMPTY for product placement.`,
    },

    // =============================================
    // HERO CENTER MINIMAL - Product center, minimal text
    // =============================================
    hero_center_minimal: {
        id: 'hero_center_minimal',
        name: 'Minimal Center Hero',
        description: 'Product centered with minimal premium text',
        zones: {
            product: { x: 0.20, y: 0.20, width: 0.60, height: 0.55 }, // Large center
            headline: { x: 0.10, y: 0.02, width: 0.80, height: 0.15 },
            badge: { x: 0.78, y: 0.02, width: 0.20, height: 0.06 },
            subheadline: { x: 0.15, y: 0.78, width: 0.70, height: 0.08 },
            cta: { x: 0.30, y: 0.88, width: 0.40, height: 0.10 },
        },
        arrows: [],
        backgroundPrompt: `
Ultra-minimal premium advertisement background.
Clean gradient from #0F0F1A to #1A1A2E.
Subtle ambient glow in center (soft circle).
Very minimal design elements.
Center 60% EMPTY for large product hero shot.
Apple-level premium aesthetic.`,
    },

    // =============================================
    // COMPARISON SPLIT - Before/After style
    // =============================================
    gaming_showcase: {
        id: 'gaming_showcase',
        name: 'Gaming Showcase',
        description: 'Perfect for gaming products with RGB aesthetics',
        zones: {
            product: { x: 0.25, y: 0.22, width: 0.50, height: 0.50 }, // Center
            headline: { x: 0.05, y: 0.02, width: 0.90, height: 0.12 },
            badge: { x: 0.02, y: 0.02, width: 0.20, height: 0.06 },
            feature1: { x: 0.70, y: 0.25, width: 0.28, height: 0.12 },
            feature2: { x: 0.70, y: 0.42, width: 0.28, height: 0.12 },
            feature3: { x: 0.70, y: 0.59, width: 0.28, height: 0.12 },
            cta: { x: 0.25, y: 0.82, width: 0.50, height: 0.12 },
        },
        arrows: [],
        backgroundPrompt: `
Gaming/eSports style advertisement background.
Dark base (#0A0A0F) with RGB neon accents.
Subtle grid pattern overlay.
Glowing edges and particle effects.
Neon accent lines (pink, cyan, purple).
Center area EMPTY for product.
Premium gaming aesthetic, NOT cheap.`,
    },

    // =============================================
    // LIFESTYLE BLEND - Product blended into scene
    // =============================================
    lifestyle_blend: {
        id: 'lifestyle_blend',
        name: 'Lifestyle Blend',
        description: 'Product in lifestyle context',
        zones: {
            product: { x: 0.30, y: 0.30, width: 0.40, height: 0.45 }, // Slightly offset
            headline: { x: 0.05, y: 0.03, width: 0.60, height: 0.12 },
            badge: { x: 0.80, y: 0.02, width: 0.18, height: 0.06 },
            subheadline: { x: 0.05, y: 0.80, width: 0.50, height: 0.08 },
            cta: { x: 0.55, y: 0.85, width: 0.40, height: 0.10 },
        },
        arrows: [],
        backgroundPrompt: `
Lifestyle/aspirational advertisement background.
Warm ambient lighting, cozy atmosphere.
Blurred lifestyle scene (desk, room, creative space).
Gradient overlay at bottom for text.
Product area (center) should have neutral/complementary colors.
Center-right area EMPTY for product overlay.`,
    },
};

/**
 * Get layout by ID or detect best layout
 */
export function getLayout(layoutId) {
    return AD_LAYOUTS_2025[layoutId] || AD_LAYOUTS_2025.feature_callout;
}

/**
 * Detect best layout based on content
 */
export function detectBestLayout(options) {
    const { features = [], industry, hasTestimonial, isSale, isMinimal } = options;

    if (industry === 'gaming' || industry === 'tech') {
        return AD_LAYOUTS_2025.gaming_showcase;
    }

    if (isMinimal || features.length <= 1) {
        return AD_LAYOUTS_2025.hero_center_minimal;
    }

    if (features.length >= 3) {
        // Checklist style for many features
        return AD_LAYOUTS_2025.hero_left_checklist;
    }

    // Default: feature callout
    return AD_LAYOUTS_2025.feature_callout;
}

/**
 * Create SVG for all design elements (arrows, text, badges, etc.)
 */
function createDesignOverlaySVG(layout, content, canvasSize = 1024) {
    const {
        headline,
        subheadline,
        features = [],
        cta,
        badge,
        style = 'dark',
    } = content;

    const zones = layout.zones;

    // Style config
    const styles = {
        dark: {
            headline: '#FFFFFF',
            text: '#E0E0E0',
            accent: '#FF4444',
            badge: '#FF4444',
            ctaBg: '#FF4444',
            ctaText: '#FFFFFF',
            featureBg: 'rgba(255,255,255,0.08)',
            checkmark: '#00DD88',
            arrow: '#666666',
        },
        light: {
            headline: '#1A1A1A',
            text: '#333333',
            accent: '#FF4444',
            badge: '#FF4444',
            ctaBg: '#FF4444',
            ctaText: '#FFFFFF',
            featureBg: 'rgba(0,0,0,0.05)',
            checkmark: '#00AA66',
            arrow: '#999999',
        }
    };

    const s = styles[style] || styles.dark;
    const sz = canvasSize;

    let svg = `<svg width="${sz}" height="${sz}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.4)"/>
        </filter>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="ctaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FF5555"/>
            <stop offset="100%" style="stop-color:#FF3333"/>
        </linearGradient>
    </defs>`;

    // BADGE (top corner)
    if (badge && zones.badge) {
        const b = zones.badge;
        const bx = b.x * sz + (b.width * sz) / 2;
        const by = b.y * sz + 20;
        svg += `
    <rect x="${b.x * sz}" y="${b.y * sz}" width="${b.width * sz}" height="${b.height * sz}" rx="20" fill="${s.badge}"/>
    <text x="${bx}" y="${by}" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">${escapeXml(badge.toUpperCase())}</text>`;
    }

    // HEADLINE
    if (headline && zones.headline) {
        const h = zones.headline;
        const hx = h.x * sz + (h.width * sz) / 2;
        const hy = h.y * sz + (h.height * sz) * 0.7;
        // Calculate font size based on headline length
        const fontSize = headline.length > 25 ? 36 : headline.length > 18 ? 42 : 48;
        svg += `
    <text x="${hx}" y="${hy}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="800" fill="${s.headline}" text-anchor="middle" filter="url(#shadow)">${escapeXml(headline)}</text>`;
    }

    // SUBHEADLINE
    if (subheadline && zones.subheadline) {
        const sh = zones.subheadline;
        const shx = sh.x * sz + (sh.width * sz) / 2;
        const shy = sh.y * sz + (sh.height * sz) * 0.6;
        svg += `
    <text x="${shx}" y="${shy}" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="400" fill="${s.text}" text-anchor="middle" opacity="0.9">${escapeXml(subheadline)}</text>`;
    }

    // FEATURES (with checkmarks)
    const featureZones = ['feature1', 'feature2', 'feature3', 'feature4'];
    features.slice(0, 4).forEach((feature, i) => {
        const zoneKey = featureZones[i];
        if (!zones[zoneKey]) return;

        const f = zones[zoneKey];
        const fx = f.x * sz;
        const fy = f.y * sz;
        const fw = f.width * sz;
        const fh = f.height * sz;

        // Feature box
        svg += `
    <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="12" fill="${s.featureBg}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <text x="${fx + 30}" y="${fy + fh / 2 + 5}" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="${s.checkmark}">✓</text>
    <text x="${fx + 55}" y="${fy + fh / 2 + 5}" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="500" fill="${s.text}">${escapeXml(feature)}</text>`;
    });

    // CTA BUTTON
    if (cta && zones.cta) {
        const c = zones.cta;
        const cx = c.x * sz;
        const cy = c.y * sz;
        const cw = c.width * sz;
        const ch = c.height * sz;

        svg += `
    <rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="${ch / 2}" fill="url(#ctaGrad)" filter="url(#shadow)"/>
    <text x="${cx + cw / 2}" y="${cy + ch / 2 + 6}" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="${s.ctaText}" text-anchor="middle">${escapeXml(cta)}</text>`;
    }

    // ARROWS (curved, pointing to product zone)
    if (layout.arrows && layout.arrows.length > 0) {
        layout.arrows.forEach(arrow => {
            const fromZone = zones[arrow.from];
            const toZone = zones[arrow.to];
            if (!fromZone || !toZone) return;

            // Calculate arrow endpoints
            const fromX = (fromZone.x + fromZone.width) * sz;
            const fromY = (fromZone.y + fromZone.height / 2) * sz;
            const toX = toZone.x * sz;
            const toY = (toZone.y + toZone.height / 2) * sz;

            // Curved path
            const midX = (fromX + toX) / 2;
            const curve = arrow.from.includes('1') || arrow.from.includes('3') ? -30 : 30;

            svg += `
    <path d="M${fromX},${fromY} Q${midX},${fromY + curve} ${toX},${toY}" 
          stroke="${s.arrow}" stroke-width="2" fill="none" stroke-dasharray="5,5" opacity="0.6"/>`;
        });
    }

    svg += `</svg>`;

    return svg;
}

/**
 * XML escape helper
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
 * Fetch image as buffer
 */
async function fetchImageAsBuffer(imageUrl) {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
}

/**
 * Create complete layout-aware ad
 * This is the MAIN function for creating integrated ads
 */
export async function createLayoutAwareAd(options) {
    const {
        backgroundBuffer,
        productImageUrl,
        layoutId,
        headline,
        subheadline,
        features = [],
        cta,
        badge,
        industry,
        colorScheme = 'dark', // 'dark', 'gaming', 'vibrant', 'light'
        canvasSize = 1024,
    } = options;

    console.log('[LayoutAware] Starting layout-aware compositing...');

    // Step 1: Get layout template
    const layout = layoutId
        ? getLayout(layoutId)
        : detectBestLayout({ features, industry });

    console.log('[LayoutAware] Using layout:', layout.id);

    // Step 2: Prepare product image
    const productBuffer = await fetchImageAsBuffer(productImageUrl);
    const productMeta = await sharp(productBuffer).metadata();

    // Calculate product position from layout
    const productZone = layout.zones.product;
    const targetWidth = Math.round(canvasSize * productZone.width);
    const targetHeight = Math.round(canvasSize * productZone.height);
    const productLeft = Math.round(canvasSize * productZone.x);
    const productTop = Math.round(canvasSize * productZone.y);

    // Resize product maintaining aspect ratio
    const aspectRatio = (productMeta.height || 1) / (productMeta.width || 1);
    let finalWidth = targetWidth;
    let finalHeight = Math.round(targetWidth * aspectRatio);

    if (finalHeight > targetHeight) {
        finalHeight = targetHeight;
        finalWidth = Math.round(targetHeight / aspectRatio);
    }

    const resizedProduct = await sharp(productBuffer)
        .resize(finalWidth, finalHeight, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();

    // Center product within its zone
    const centeredLeft = productLeft + Math.round((targetWidth - finalWidth) / 2);
    const centeredTop = productTop + Math.round((targetHeight - finalHeight) / 2);

    console.log(`[LayoutAware] Product zone: ${productZone.x},${productZone.y} → placed at ${centeredLeft},${centeredTop} (${finalWidth}x${finalHeight})`);

    // Step 3: Create PREMIUM design overlay SVG (10/10 agency-level)
    // Use the premium overlay creator for glassmorphism, neon glow, professional shadows
    const designSVG = createPremiumOverlaySVG({
        width: canvasSize,
        height: canvasSize,
        headline,
        subheadline,
        features,
        cta,
        badge,
        layout: layout.id,
        colorScheme: colorScheme, // 'dark', 'gaming', 'vibrant', 'light'
    });

    console.log('[LayoutAware] Using PREMIUM overlay with colorScheme:', colorScheme);

    // Step 4: Composite everything together
    const finalImage = await sharp(backgroundBuffer)
        .resize(canvasSize, canvasSize)
        .composite([
            // Product layer
            {
                input: resizedProduct,
                left: centeredLeft,
                top: centeredTop,
                blend: 'over'
            },
            // Design overlay (text, badges, CTAs)
            {
                input: Buffer.from(designSVG),
                left: 0,
                top: 0,
            }
        ])
        .png()
        .toBuffer();

    console.log('[LayoutAware] ✅ Layout-aware ad created');

    return {
        buffer: finalImage,
        metadata: {
            layoutId: layout.id,
            layoutName: layout.name,
            productPreserved: true,
            productPosition: { left: centeredLeft, top: centeredTop, width: finalWidth, height: finalHeight },
        }
    };
}

/**
 * Build background prompt for specific layout
 */
export function buildLayoutBackgroundPrompt(layoutId, options = {}) {
    const layout = getLayout(layoutId);

    let prompt = layout.backgroundPrompt || '';

    // Add customization
    if (options.primaryColor) {
        prompt = prompt.replace(/#1A1A2E/g, options.primaryColor);
    }

    if (options.industry === 'gaming') {
        prompt += '\nGaming aesthetic: RGB neon accents, subtle grid pattern.';
    }

    prompt += `

CRITICAL REQUIREMENTS:
1. The PRODUCT ZONE (${Math.round(layout.zones.product.x * 100)}% from left, ${Math.round(layout.zones.product.y * 100)}% from top, ${Math.round(layout.zones.product.width * 100)}% wide) MUST be EMPTY or have only subtle background
2. Leave space for text overlays in defined zones
3. Professional, premium, 2025-level design
4. 1:1 aspect ratio (1024x1024)

NO PRODUCT in the generated image - product will be composited later.`;

    return prompt;
}

export default {
    AD_LAYOUTS_2025,
    getLayout,
    detectBestLayout,
    createLayoutAwareAd,
    buildLayoutBackgroundPrompt,
};
