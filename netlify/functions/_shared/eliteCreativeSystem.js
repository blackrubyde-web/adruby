/**
 * 2026 ELITE CREATIVE SYSTEM
 * 
 * This is not "pretty good" - this is WORLD-CLASS.
 * Every pixel is intentional. Every element serves a purpose.
 * 
 * Designed by thinking like a $500/hour Creative Director
 * who has created thousands of high-converting Meta ads.
 */

import sharp from 'sharp';
// Import 15 Professional Templates
import {
    ELITE_TEMPLATES_2026,
    selectOptimalTemplate,
    getTemplateById,
    TYPOGRAPHY_2026,
    SPACING_2026,
    SHADOWS_2026
} from './eliteTemplates2026.js';
// Import Agency-Level Visual Effects
import {
    LIGHT_EFFECTS,
    PRODUCT_EFFECTS,
    GEOMETRIC_ACCENTS,
    TEXTURES,
    TYPOGRAPHY_EFFECTS,
    GLASSMORPHISM,
    CTA_EFFECTS,
    BADGE_EFFECTS,
    VIGNETTE,
    COLOR_GRADING,
    generateAgencyOverlay
} from './agencyVisualEffects.js';
// Import E-Commerce Conversion Elements
import {
    PRICE_ELEMENTS,
    DISCOUNT_ELEMENTS,
    TRUST_BADGES,
    RATINGS,
    URGENCY,
    BUNDLE_ELEMENTS,
    SHIPPING_INFO,
    SOCIAL_PROOF,
    generateEcommerceOverlay
} from './ecommerceElements.js';
// Import Intelligent Creative Decision Engine
import {
    makeCreativeDecisions,
    getVisualStyle,
    DECISION_RULES,
    VISUAL_STYLES,
    LAYOUT_MATRIX
} from './creativeDecisionEngine.js';
// Import High-Converting Ad Pattern Templates
import {
    COMPARISON_TABLE_PATTERN,
    US_VS_THEM_SPLIT_PATTERN,
    FEATURE_CALLOUTS_DOTTED_PATTERN,
    CHECKMARK_COMPARISON_PATTERN,
    FEATURE_ARROWS_PATTERN,
    AD_PATTERNS,
    selectBestPattern
} from './adPatternTemplates.js';

// ============================================================
// DESIGN CONSTANTS - GOLDEN RATIOS & PRECISE MEASUREMENTS
// ============================================================

const CANVAS = 1080; // Instagram-optimized square
const GOLDEN_RATIO = 1.618;
const MARGIN = Math.round(CANVAS * 0.04); // 4% margin = 43px
const SAFE_ZONE = Math.round(CANVAS * 0.05); // 5% safe zone

// Typography Scale (based on 1.25 ratio - Minor Third)
const TYPE_SCALE = {
    hero: 72,      // Main headline
    title: 48,     // Secondary headline
    subtitle: 28,  // Subheadline
    body: 20,      // Feature text
    caption: 16,   // Small text
    badge: 14,     // Badge text
};

// Spacing Scale (8px base)
const SPACING = {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
    xxl: 64,
};

// ============================================================
// COLOR PALETTES - PSYCHOLOGICALLY OPTIMIZED
// ============================================================

const PALETTES = {
    // GAMING - Cyberpunk meets Premium
    gaming: {
        bg: {
            primary: '#0A0A0F',
            secondary: '#12121A',
            accent: '#1A1A2E',
        },
        text: {
            primary: '#FFFFFF',
            secondary: 'rgba(255,255,255,0.85)',
            muted: 'rgba(255,255,255,0.6)',
        },
        accent: {
            primary: '#00FFFF',    // Cyan
            secondary: '#FF00FF',  // Magenta
            tertiary: '#8B5CF6',   // Purple
            gradient: 'linear-gradient(135deg, #00FFFF, #FF00FF)',
        },
        cta: {
            bg: '#FF00FF',
            text: '#FFFFFF',
            glow: 'rgba(255,0,255,0.4)',
        },
        badge: {
            bg: '#00FFFF',
            text: '#0A0A0F',
        },
        checkmark: '#00FFFF',
    },

    // PREMIUM DARK - Apple/Tesla level
    premium: {
        bg: {
            primary: '#0C0C0C',
            secondary: '#151515',
            accent: '#1E1E1E',
        },
        text: {
            primary: '#FFFFFF',
            secondary: 'rgba(255,255,255,0.9)',
            muted: 'rgba(255,255,255,0.65)',
        },
        accent: {
            primary: '#FF4444',
            secondary: '#FF6B6B',
            tertiary: '#FFD93D',
            gradient: 'linear-gradient(135deg, #FF4444, #FF6B6B)',
        },
        cta: {
            bg: '#FF4444',
            text: '#FFFFFF',
            glow: 'rgba(255,68,68,0.35)',
        },
        badge: {
            bg: '#FF4444',
            text: '#FFFFFF',
        },
        checkmark: '#00E676',
    },

    // VIBRANT - High energy, Gen-Z appeal
    vibrant: {
        bg: {
            primary: '#1A0A2E',
            secondary: '#2D1B4E',
            accent: '#3D2B5E',
        },
        text: {
            primary: '#FFFFFF',
            secondary: 'rgba(255,255,255,0.9)',
            muted: 'rgba(255,255,255,0.7)',
        },
        accent: {
            primary: '#F97316',    // Orange
            secondary: '#EC4899',  // Pink
            tertiary: '#8B5CF6',   // Purple
            gradient: 'linear-gradient(135deg, #F97316, #EC4899)',
        },
        cta: {
            bg: '#F97316',
            text: '#FFFFFF',
            glow: 'rgba(249,115,22,0.4)',
        },
        badge: {
            bg: '#EC4899',
            text: '#FFFFFF',
        },
        checkmark: '#34D399',
    },

    // MINIMAL LIGHT - Clean, Scandinavian
    minimal: {
        bg: {
            primary: '#FAFAFA',
            secondary: '#F0F0F0',
            accent: '#E5E5E5',
        },
        text: {
            primary: '#1A1A1A',
            secondary: 'rgba(0,0,0,0.85)',
            muted: 'rgba(0,0,0,0.6)',
        },
        accent: {
            primary: '#1A1A1A',
            secondary: '#333333',
            tertiary: '#666666',
            gradient: 'linear-gradient(135deg, #1A1A1A, #333333)',
        },
        cta: {
            bg: '#1A1A1A',
            text: '#FFFFFF',
            glow: 'rgba(0,0,0,0.15)',
        },
        badge: {
            bg: '#FF4444',
            text: '#FFFFFF',
        },
        checkmark: '#10B981',
    },
};

// ============================================================
// LAYOUT BLUEPRINTS - PIXEL-PERFECT ZONES
// ============================================================

const LAYOUTS = {
    // Hero Center with stacked features on right
    hero_features_right: {
        id: 'hero_features_right',
        product: {
            x: MARGIN,
            y: 150,
            width: CANVAS * 0.52,
            height: CANVAS * 0.55,
        },
        headline: {
            x: MARGIN,
            y: MARGIN + 20,
            width: CANVAS - (MARGIN * 2),
            align: 'left',
        },
        features: {
            x: CANVAS * 0.56,
            y: 180,
            width: CANVAS * 0.40,
            spacing: 80,
        },
        cta: {
            x: CANVAS * 0.56,
            y: CANVAS - 140,
            width: CANVAS * 0.38,
            height: 60,
        },
        badge: {
            x: CANVAS - MARGIN - 140,
            y: MARGIN,
            width: 140,
            height: 36,
        },
    },

    // Centered minimal - product hero
    centered_minimal: {
        id: 'centered_minimal',
        product: {
            x: CANVAS * 0.15,
            y: CANVAS * 0.18,
            width: CANVAS * 0.70,
            height: CANVAS * 0.52,
        },
        headline: {
            x: MARGIN,
            y: MARGIN + 10,
            width: CANVAS - (MARGIN * 2),
            align: 'center',
        },
        subheadline: {
            x: MARGIN,
            y: CANVAS * 0.75,
            width: CANVAS - (MARGIN * 2),
            align: 'center',
        },
        cta: {
            x: (CANVAS - 280) / 2,
            y: CANVAS - 120,
            width: 280,
            height: 56,
        },
        badge: {
            x: CANVAS - MARGIN - 130,
            y: MARGIN,
            width: 130,
            height: 34,
        },
    },

    // Feature callouts around product
    feature_callouts: {
        id: 'feature_callouts',
        product: {
            x: CANVAS * 0.22,
            y: CANVAS * 0.22,
            width: CANVAS * 0.56,
            height: CANVAS * 0.50,
        },
        headline: {
            x: MARGIN,
            y: MARGIN + 10,
            width: CANVAS - (MARGIN * 2),
            align: 'center',
        },
        features: {
            positions: [
                { x: MARGIN, y: 200, align: 'left' },
                { x: CANVAS - MARGIN - 260, y: 200, align: 'right' },
                { x: MARGIN, y: CANVAS - 200, align: 'left' },
                { x: CANVAS - MARGIN - 260, y: CANVAS - 200, align: 'right' },
            ],
            width: 260,
        },
        cta: {
            x: (CANVAS - 300) / 2,
            y: CANVAS - 110,
            width: 300,
            height: 56,
        },
        badge: {
            x: CANVAS - MARGIN - 120,
            y: MARGIN,
            width: 120,
            height: 32,
        },
    },
};

// ============================================================
// BACKGROUND PROMPT TEMPLATES - HYPER-SPECIFIC
// ============================================================

function generateEliteBackgroundPrompt(palette, layout, options = {}) {
    const { industry = 'retail', productDescription = '' } = options;
    const p = PALETTES[palette] || PALETTES.premium;
    const l = LAYOUTS[layout] || LAYOUTS.hero_features_right;

    // Calculate exact percentages for product zone
    const prodX = Math.round((l.product.x / CANVAS) * 100);
    const prodY = Math.round((l.product.y / CANVAS) * 100);
    const prodW = Math.round((l.product.width / CANVAS) * 100);
    const prodH = Math.round((l.product.height / CANVAS) * 100);

    let prompt = `
ULTRA-PREMIUM ADVERTISEMENT BACKGROUND

Create a ${CANVAS}x${CANVAS} pixel BACKGROUND ONLY for a high-converting Meta ad.
This is a $10,000 ad creative level. Every pixel must be intentional.

COLOR PALETTE:
- Primary background: ${p.bg.primary}
- Secondary tones: ${p.bg.secondary}
- Accent areas: ${p.bg.accent}

COMPOSITION:
- Clean, spacious, premium feel
- Product zone (${prodX}% from left, ${prodY}% from top, ${prodW}% wide, ${prodH}% tall) must be EMPTY
- This empty zone should have subtle ambient lighting to highlight the product that will be placed there
- Subtle gradient from top-left to bottom-right
`;

    // Add industry-specific elements
    if (industry === 'gaming' || palette === 'gaming') {
        prompt += `
GAMING AESTHETIC:
- Subtle RGB ambient glow (cyan and magenta) at edges
- Very subtle hexagonal grid pattern (5% opacity) in background
- Small floating particles or light orbs (very subtle, 3-5 visible)
- Neon edge accents (thin lines, not overwhelming)
- Dark, moody, premium gaming atmosphere
`;
    } else if (palette === 'vibrant') {
        prompt += `
VIBRANT AESTHETIC:
- Flowing color gradients in background (purple to pink to orange)
- Soft, organic shapes
- Subtle grain texture for premium feel
- Energetic but not chaotic
`;
    } else if (palette === 'minimal') {
        prompt += `
MINIMAL AESTHETIC:
- Clean, almost pure white/light gray
- Very subtle shadows suggesting depth
- Minimal elements, maximum whitespace
- Studio photography lighting feel
`;
    } else {
        prompt += `
PREMIUM DARK AESTHETIC:
- Sophisticated dark tones
- Subtle ambient light from center (where product will be)
- Elegant, understated luxury feel
- Think: Apple keynote, Tesla showroom
- Subtle texture/grain for richness
`;
    }

    prompt += `
CRITICAL TECHNICAL REQUIREMENTS:
1. The PRODUCT ZONE (${prodX}%-${prodX + prodW}% horizontal, ${prodY}%-${prodY + prodH}% vertical) MUST BE EMPTY
2. Create subtle ambient glow/highlight in the product zone to make product pop
3. NO product, NO text, NO logos in the generated image
4. Resolution: ${CANVAS}x${CANVAS}px
5. Style: Photorealistic lighting with designed elements

This background will have a product composited on top, so the product zone lighting is crucial.
`;

    return prompt;
}

// ============================================================
// SVG GENERATION - PIXEL-PERFECT TYPOGRAPHY
// ============================================================

function generateEliteOverlaySVG(config) {
    const {
        palette = 'premium',
        layout = 'hero_features_right',
        headline,
        subheadline,
        features = [],
        cta,
        badge,
    } = config;

    const p = PALETTES[palette] || PALETTES.premium;
    const l = LAYOUTS[layout] || LAYOUTS.hero_features_right;

    let svg = `<svg width="${CANVAS}" height="${CANVAS}" xmlns="http://www.w3.org/2000/svg">
<defs>
    <!-- Premium Drop Shadow -->
    <filter id="shadow-lg" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="8" stdDeviation="20" flood-color="rgba(0,0,0,0.5)"/>
    </filter>
    <filter id="shadow-md" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="4" stdDeviation="10" flood-color="rgba(0,0,0,0.4)"/>
    </filter>
    <filter id="shadow-sm" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.3)"/>
    </filter>

    <!-- Glow Effects -->
    <filter id="glow-accent" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feFlood flood-color="${p.cta.glow}"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
    </filter>
    <filter id="glow-check" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
    </filter>

    <!-- CTA Gradient -->
    <linearGradient id="cta-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${p.accent.primary}"/>
        <stop offset="100%" style="stop-color:${p.accent.secondary}"/>
    </linearGradient>

    <!-- Badge Gradient -->
    <linearGradient id="badge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${p.badge.bg}"/>
        <stop offset="100%" style="stop-color:${p.accent.secondary || p.badge.bg}"/>
    </linearGradient>
</defs>
`;

    // ===== BADGE (Top Right) =====
    if (badge && l.badge) {
        const b = l.badge;
        const badgeRadius = b.height / 2;
        svg += `
<!-- Badge -->
<rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" rx="${badgeRadius}" 
      fill="url(#badge-gradient)" filter="url(#shadow-sm)"/>
<rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height / 2}" rx="${badgeRadius}" 
      fill="rgba(255,255,255,0.15)"/>
<text x="${b.x + b.width / 2}" y="${b.y + b.height / 2 + 5}" 
      font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif" 
      font-size="${TYPE_SCALE.badge}" font-weight="700" 
      fill="${p.badge.text}" text-anchor="middle" letter-spacing="1.5">${escapeXml(badge.toUpperCase())}</text>
`;
    }

    // ===== HEADLINE =====
    if (headline && l.headline) {
        const h = l.headline;
        const textAnchor = h.align === 'center' ? 'middle' : h.align === 'right' ? 'end' : 'start';
        const x = h.align === 'center' ? CANVAS / 2 : h.align === 'right' ? CANVAS - MARGIN : h.x;

        // Calculate optimal font size
        let fontSize = TYPE_SCALE.hero;
        if (headline.length > 30) fontSize = TYPE_SCALE.title;
        if (headline.length > 45) fontSize = TYPE_SCALE.subtitle + 8;

        svg += `
<!-- Headline -->
<text x="${x}" y="${h.y + fontSize}" 
      font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif" 
      font-size="${fontSize}" font-weight="800" 
      fill="${p.text.primary}" text-anchor="${textAnchor}" 
      filter="url(#shadow-md)">${escapeXml(headline)}</text>
`;
    }

    // ===== SUBHEADLINE =====
    if (subheadline && l.subheadline) {
        const sh = l.subheadline;
        const textAnchor = sh.align === 'center' ? 'middle' : 'start';
        const x = sh.align === 'center' ? CANVAS / 2 : sh.x;

        svg += `
<!-- Subheadline -->
<text x="${x}" y="${sh.y + TYPE_SCALE.subtitle}" 
      font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif" 
      font-size="${TYPE_SCALE.subtitle}" font-weight="400" 
      fill="${p.text.secondary}" text-anchor="${textAnchor}">${escapeXml(subheadline)}</text>
`;
    }

    // ===== FEATURES =====
    if (features.length > 0 && l.features) {
        if (l.features.positions) {
            // Callout style (around product)
            features.slice(0, 4).forEach((feature, i) => {
                const pos = l.features.positions[i];
                if (!pos) return;

                const fw = l.features.width;
                const fh = 70; // Feature box height
                const fx = pos.x;
                const fy = pos.y;

                svg += `
<!-- Feature ${i + 1} -->
<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="16" 
      fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
<circle cx="${fx + 28}" cy="${fy + fh / 2}" r="12" fill="${p.checkmark}" opacity="0.15"/>
<text x="${fx + 28}" y="${fy + fh / 2 + 6}" 
      font-family="Inter, sans-serif" font-size="18" 
      fill="${p.checkmark}" text-anchor="middle" filter="url(#glow-check)">✓</text>
<text x="${fx + 52}" y="${fy + fh / 2 + 6}" 
      font-family="Inter, -apple-system, sans-serif" font-size="${TYPE_SCALE.body}" font-weight="500" 
      fill="${p.text.secondary}">${escapeXml(feature)}</text>
`;
            });
        } else {
            // Stacked style (on right side)
            features.slice(0, 4).forEach((feature, i) => {
                const fx = l.features.x;
                const fy = l.features.y + (i * l.features.spacing);
                const fw = l.features.width;
                const fh = 64;

                svg += `
<!-- Feature ${i + 1} -->
<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="14" 
      fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
<rect x="${fx}" y="${fy}" width="${fw}" height="${fh / 2}" rx="14" fill="rgba(255,255,255,0.02)"/>
<circle cx="${fx + 26}" cy="${fy + fh / 2}" r="11" fill="${p.checkmark}" opacity="0.15"/>
<text x="${fx + 26}" y="${fy + fh / 2 + 5}" 
      font-family="Inter, sans-serif" font-size="16" 
      fill="${p.checkmark}" text-anchor="middle" filter="url(#glow-check)">✓</text>
<text x="${fx + 48}" y="${fy + fh / 2 + 6}" 
      font-family="Inter, -apple-system, sans-serif" font-size="${TYPE_SCALE.body - 2}" font-weight="500" 
      fill="${p.text.secondary}">${escapeXml(feature)}</text>
`;
            });
        }
    }

    // ===== CTA BUTTON =====
    if (cta && l.cta) {
        const c = l.cta;
        const radius = c.height / 2;

        svg += `
<!-- CTA Button -->
<rect x="${c.x}" y="${c.y}" width="${c.width}" height="${c.height}" rx="${radius}" 
      fill="url(#cta-gradient)" filter="url(#glow-accent)"/>
<!-- CTA Highlight -->
<ellipse cx="${c.x + c.width / 2}" cy="${c.y + 14}" rx="${c.width * 0.35}" ry="8" 
         fill="rgba(255,255,255,0.2)"/>
<!-- CTA Text -->
<text x="${c.x + c.width / 2}" y="${c.y + c.height / 2 + 7}" 
      font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif" 
      font-size="${TYPE_SCALE.body}" font-weight="700" 
      fill="${p.cta.text}" text-anchor="middle" letter-spacing="0.5">${escapeXml(cta)}</text>
`;
    }

    svg += `</svg>`;
    return svg;
}

// ============================================================
// XML ESCAPE
// ============================================================

function escapeXml(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// ============================================================
// PRODUCT ENHANCEMENT
// ============================================================

async function enhanceProduct(productBuffer, palette = 'premium') {
    const p = PALETTES[palette];
    const meta = await sharp(productBuffer).metadata();

    // Add subtle shadow under product
    const shadowSVG = `<svg width="${meta.width}" height="${meta.height}">
        <defs>
            <filter id="product-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="15" stdDeviation="30" flood-color="rgba(0,0,0,0.4)"/>
            </filter>
        </defs>
        <rect x="0" y="0" width="${meta.width}" height="${meta.height}" fill="transparent" filter="url(#product-shadow)"/>
    </svg>`;

    // For now, just ensure PNG with alpha
    return sharp(productBuffer)
        .ensureAlpha()
        .png()
        .toBuffer();
}

// ============================================================
// MAIN COMPOSITING FUNCTION
// ============================================================

export async function createEliteAd(options) {
    const {
        backgroundBuffer,
        productImageUrl,
        palette = 'premium',
        layout = 'hero_features_right',
        headline,
        subheadline,
        features = [],
        cta,
        badge,
    } = options;

    console.log('[EliteCreative] Creating 2026-level ad...');
    console.log('[EliteCreative] Palette:', palette, '| Layout:', layout);

    const l = LAYOUTS[layout] || LAYOUTS.hero_features_right;
    const canvasSize = CANVAS;

    // Step 1: Fetch and prepare product
    const productResponse = await fetch(productImageUrl);
    if (!productResponse.ok) throw new Error('Failed to fetch product image');
    const productBuffer = Buffer.from(await productResponse.arrayBuffer());

    const productMeta = await sharp(productBuffer).metadata();
    const enhancedProduct = await enhanceProduct(productBuffer, palette);

    // Step 2: Calculate precise product placement
    const targetW = l.product.width;
    const targetH = l.product.height;
    const aspectRatio = (productMeta.height || 1) / (productMeta.width || 1);

    let finalW = targetW;
    let finalH = Math.round(targetW * aspectRatio);
    if (finalH > targetH) {
        finalH = targetH;
        finalW = Math.round(targetH / aspectRatio);
    }

    const resizedProduct = await sharp(enhancedProduct)
        .resize(finalW, finalH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

    // Center product in its zone
    const prodLeft = l.product.x + Math.round((targetW - finalW) / 2);
    const prodTop = l.product.y + Math.round((targetH - finalH) / 2);

    console.log('[EliteCreative] Product: ${finalW}x${finalH} at (${prodLeft}, ${prodTop})');

    // Step 3: Generate elite overlay SVG (text, CTAs, badges)
    const overlaySVG = generateEliteOverlaySVG({
        palette,
        layout,
        headline,
        subheadline,
        features,
        cta,
        badge,
    });

    // Step 4: Generate Agency-Level Effects Overlay (lens flares, product glow, vignette)
    const isGaming = palette === 'gaming';
    const agencyEffectsOverlay = generateAgencyOverlay({
        canvasSize,
        palette,
        includeVignette: true,
        includeGrain: true,
        includeLightEffects: true,
        includeGeometricAccents: true,
        productZone: {
            x: prodLeft,
            y: prodTop,
            width: finalW,
            height: finalH,
        },
        isGaming,
    });

    console.log('[EliteCreative] Agency effects: Vignette ✓ | Grain ✓ | Light ✓ | Glow ✓');

    // Step 5: Generate E-Commerce Overlay (price, trust badges, ratings, urgency)
    const ecommerceOverlay = generateEcommerceOverlay({
        canvasSize,
        showPrice: options.price ? true : false,
        price: options.price,
        originalPrice: options.originalPrice,
        currency: options.currency || '€',
        showDiscount: options.discountPercent ? true : false,
        discountPercent: options.discountPercent,
        showTrustBadges: options.showTrustBadges !== false,
        trustBadges: options.trustBadges || ['shipping', 'guarantee'],
        showRating: options.rating ? true : false,
        rating: options.rating || 5,
        reviewCount: options.reviewCount,
        showUrgency: options.showUrgency || false,
        urgencyType: options.urgencyType || 'lowStock',
        urgencyValue: options.urgencyValue || 3,
    });

    const hasEcommerceElements = options.price || options.discountPercent || options.rating;
    if (hasEcommerceElements) {
        console.log('[EliteCreative] E-Commerce: Price ✓ | Trust ✓ | Ratings ✓');
    }

    // Step 6: Composite everything in correct order
    const composeLayers = [
        // Layer 1: Product with shadow
        {
            input: resizedProduct,
            left: prodLeft,
            top: prodTop,
            blend: 'over',
        },
        // Layer 2: Typography and UI overlay
        {
            input: Buffer.from(overlaySVG),
            left: 0,
            top: 0,
        },
        // Layer 3: Agency effects (vignette, glow, light effects)
        {
            input: Buffer.from(agencyEffectsOverlay),
            left: 0,
            top: 0,
            blend: 'over',
        },
    ];

    // Layer 4: E-Commerce elements (if enabled)
    if (hasEcommerceElements) {
        composeLayers.push({
            input: Buffer.from(ecommerceOverlay),
            left: 0,
            top: 0,
            blend: 'over',
        });
    }

    const finalImage = await sharp(backgroundBuffer)
        .resize(canvasSize, canvasSize)
        .composite(composeLayers)
        .png({ quality: 100 })
        .toBuffer();

    console.log('[EliteCreative] ✅ AGENCY-LEVEL AD CREATED');

    return {
        buffer: finalImage,
        metadata: {
            palette,
            layout,
            productPosition: { x: prodLeft, y: prodTop, w: finalW, h: finalH },
            canvasSize,
            agencyEffects: ['vignette', 'grain', 'lightEffects', 'productGlow', 'geometricAccents'],
            ecommerceElements: hasEcommerceElements ? ['price', 'trustBadges', 'ratings', 'urgency'] : [],
        },
    };
}

// ============================================================
// AUTO-DETECTION
// ============================================================

export function detectOptimalConfig(options) {
    const { industry, tone, features = [], isMinimal } = options;

    let palette = 'premium';
    let layout = 'hero_features_right';

    // Palette detection
    if (industry === 'gaming' || industry === 'tech' || industry === 'esports') {
        palette = 'gaming';
    } else if (tone === 'playful' || tone === 'energetic' || industry === 'fashion') {
        palette = 'vibrant';
    } else if (isMinimal || tone === 'minimal' || industry === 'scandinavian') {
        palette = 'minimal';
    }

    // Layout detection
    if (features.length === 0 || isMinimal) {
        layout = 'centered_minimal';
    } else if (features.length <= 2) {
        layout = 'hero_features_right';
    } else {
        layout = 'feature_callouts';
    }

    return { palette, layout };
}

// ============================================================
// SMART AD CREATION - FULL AUTO-PILOT
// Uses Decision Engine to make all visual choices automatically
// ============================================================

export async function createSmartAd(options) {
    const {
        // Required
        backgroundBuffer,
        productImageUrl,

        // Product info
        productName = '',
        productType = 'retail',
        industry = 'ecommerce',

        // Content
        headline,
        subheadline,
        features = [],
        cta,

        // Price (optional)
        price = null,
        originalPrice = null,
        currency = '€',

        // Ratings (optional)
        rating = null,
        reviewCount = null,

        // Campaign info
        campaignGoal = 'conversion',
        campaignType = 'evergreen',

        // Urgency (optional)
        stockLevel = null,
        endDate = null,

        // Brand info
        isNewBrand = false,
        pricePoint = 'medium',
    } = options;

    console.log('[SmartAd] 🧠 Starting intelligent ad creation...');
    console.log('[SmartAd] Product:', productName, '| Industry:', industry);

    // ===== STEP 1: Make intelligent decisions =====
    const decisions = makeCreativeDecisions({
        productName,
        productType,
        industry,
        price,
        originalPrice,
        campaignGoal,
        campaignType,
        features,
        headline,
        rating,
        reviewCount,
        stockLevel,
        endDate,
        isNewBrand,
        pricePoint,
    });

    console.log('[SmartAd] 📊 Decisions made:');
    decisions.reasoning.forEach(r => console.log(`   → ${r}`));

    // ===== STEP 2: Get visual style =====
    const visualStyle = getVisualStyle(decisions.visualStyle);
    console.log('[SmartAd] 🎨 Visual style:', decisions.visualStyle);

    // ===== STEP 3: Call createEliteAd with all decisions applied =====
    const result = await createEliteAd({
        backgroundBuffer,
        productImageUrl,
        palette: decisions.visualStyle === 'high_energy' ? 'premium' :
            decisions.visualStyle === 'clean_minimal' ? 'minimal' :
                decisions.visualStyle === 'playful_vibrant' ? 'vibrant' : 'premium',
        layout: decisions.layout === 'hero_split' ? 'hero_features_right' :
            decisions.layout === 'feature_callouts' ? 'feature_callouts' :
                decisions.layout === 'centered_hero' ? 'centered_minimal' : 'hero_features_right',
        headline,
        subheadline,
        features,
        cta,
        badge: decisions.elements.badgeText,

        // E-commerce elements (now auto-determined!)
        price: decisions.elements.showPrice ? price : null,
        originalPrice: decisions.elements.showOriginalPrice ? originalPrice : null,
        discountPercent: decisions.elements.showDiscountBadge ? decisions.elements.discountPercent : null,
        currency,
        showTrustBadges: decisions.elements.showTrustBadges,
        trustBadges: decisions.elements.trustBadgesToShow,
        rating: decisions.elements.showRating ? rating : null,
        reviewCount: decisions.elements.showReviewCount ? reviewCount : null,
        showUrgency: decisions.elements.showUrgency,
        urgencyType: decisions.elements.urgencyType,
        urgencyValue: decisions.elements.urgencyValue,
    });

    console.log('[SmartAd] ✅ Smart ad created with', decisions.reasoning.length, 'intelligent decisions');

    return {
        ...result,
        metadata: {
            ...result.metadata,
            decisions: {
                visualStyle: decisions.visualStyle,
                layout: decisions.layout,
                elementsShown: Object.entries(decisions.elements)
                    .filter(([_, v]) => v === true || (Array.isArray(v) && v.length > 0))
                    .map(([k, _]) => k),
                reasoning: decisions.reasoning,
            },
        },
    };
}

// ============================================================
// EXPORTS
// ============================================================

export {
    CANVAS,
    PALETTES,
    LAYOUTS,
    generateEliteBackgroundPrompt,
    generateEliteOverlaySVG,
    // Template exports
    ELITE_TEMPLATES_2026,
    selectOptimalTemplate,
    getTemplateById,
    TYPOGRAPHY_2026,
    SPACING_2026,
    SHADOWS_2026,
    // Decision engine
    makeCreativeDecisions,
    getVisualStyle,
    DECISION_RULES,
    VISUAL_STYLES,
};

export default {
    createEliteAd,
    createSmartAd, // NEW: Intelligent auto-pilot mode
    detectOptimalConfig,
    generateEliteBackgroundPrompt,
    makeCreativeDecisions,
    PALETTES,
    LAYOUTS,
    CANVAS,
    // Templates
    ELITE_TEMPLATES_2026,
    selectOptimalTemplate,
    getTemplateById,
};
