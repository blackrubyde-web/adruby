/**
 * FOREPLAY PATTERN LIBRARY
 * 
 * Pre-analyzed patterns from high-performing Foreplay ads:
 * - Color schemes by industry
 * - Typography combinations
 * - Layout compositions
 * - Visual effect presets
 * - CTA styles
 * - Badge placements
 * - WINNING AD SCHEMAS (NEW!) - Complete templates by use-case
 */

// ========================================
// WINNING AD SCHEMAS BY USE-CASE
// ========================================
// These are complete ad templates based on analysis of 500+ winning ads from Foreplay
// Each schema includes: layout, typography, colors, elements, and conversion tactics

export const WINNING_AD_SCHEMAS = {
    // ═══════════════════════════════════════════════════════════════
    // E-COMMERCE: Product-focused, urgency-driven
    // ═══════════════════════════════════════════════════════════════
    ecommerce_product_hero: {
        name: 'E-Commerce Product Hero',
        description: 'Large product image, bold claim, urgency CTA',
        bestFor: ['physical_products', 'dtc_brands', 'consumer_goods'],
        layout: {
            type: 'centered_focus',
            productPosition: { x: 0.5, y: 0.46 },
            productScale: 0.65,
            headlineY: 0.06,
            ctaY: 0.88
        },
        typography: {
            headline: { size: 52, weight: 900, maxChars: 30 },
            tagline: { size: 22, weight: 400, maxChars: 60 },
            cta: { size: 18, weight: 700, text: ['Shop Now', 'Get Yours', 'Order Now', 'Buy Today'] }
        },
        colors: {
            background: 'dark_gradient',
            accent: 'product_complementary',
            ctaColor: '#EF4444'  // Red = urgency for e-commerce
        },
        elements: {
            badges: [{ type: 'discount', text: '20% OFF', position: 'top_right' }],
            callouts: 0,  // Keep focus on product
            socialProof: { type: 'reviews', text: '10,000+ Happy Customers' }
        },
        psychology: ['urgency', 'scarcity', 'social_proof']
    },

    ecommerce_lifestyle: {
        name: 'E-Commerce Lifestyle',
        description: 'Product in context, aspirational messaging',
        bestFor: ['fashion', 'home_decor', 'beauty', 'wellness'],
        layout: {
            type: 'floating_elements',
            productPosition: { x: 0.55, y: 0.5 },
            productScale: 0.6,
            headlineY: 0.08,
            ctaY: 0.88
        },
        typography: {
            headline: { size: 48, weight: 700, style: 'elegant' },
            tagline: { size: 20, weight: 300, style: 'italic' },
            cta: { size: 16, weight: 600, text: ['Discover', 'Explore', 'Shop Collection'] }
        },
        colors: {
            background: 'warm_gradient',
            accent: 'gold_or_rose',
            ctaColor: '#000000'  // Elegant black
        },
        elements: {
            badges: [],  // Clean, no badges for lifestyle
            callouts: 1,  // One feature callout max
            socialProof: { type: 'rating', text: '⭐ 4.9 (2,500+ reviews)' }
        },
        psychology: ['aspiration', 'identity', 'desire']
    },

    // ═══════════════════════════════════════════════════════════════
    // SAAS: Feature-focused, benefit-driven
    // ═══════════════════════════════════════════════════════════════
    saas_dashboard_hero: {
        name: 'SaaS Dashboard Hero',
        description: 'Clean screenshot, clear value prop, modern CTA',
        bestFor: ['saas', 'software', 'tools', 'apps', 'platforms'],
        layout: {
            type: 'centered_focus',
            productPosition: { x: 0.5, y: 0.48 },
            productScale: 0.58,
            mockupType: 'macbook',
            headlineY: 0.07,
            ctaY: 0.90
        },
        typography: {
            headline: { size: 48, weight: 800, maxChars: 40 },
            tagline: { size: 20, weight: 400, maxChars: 80 },
            cta: { size: 18, weight: 600, text: ['Start Free Trial', 'Try Free', 'Get Started', 'Sign Up Free'] }
        },
        colors: {
            background: 'dark_blue_gradient',
            accent: 'brand_or_purple',
            ctaColor: '#6366F1'  // Indigo = modern SaaS
        },
        elements: {
            badges: [],  // Clean, no cluttered badges
            callouts: 2,  // Max 2 feature callouts
            socialProof: { type: 'logo_bar', text: 'Trusted by 5,000+ companies' }
        },
        psychology: ['clarity', 'efficiency', 'trust']
    },

    saas_feature_showcase: {
        name: 'SaaS Feature Showcase',
        description: 'Feature highlight with callouts pointing to UI',
        bestFor: ['complex_software', 'enterprise', 'feature_updates'],
        layout: {
            type: 'left_product',
            productPosition: { x: 0.35, y: 0.5 },
            productScale: 0.55,
            mockupType: 'floating',
            headlinePosition: { x: 0.75, y: 0.2 }
        },
        typography: {
            headline: { size: 42, weight: 700, alignment: 'left' },
            tagline: { size: 18, weight: 400 },
            cta: { size: 16, weight: 600, text: ['Learn More', 'See Features', 'Watch Demo'] }
        },
        colors: {
            background: 'gradient_mesh',
            accent: 'cyan_or_teal',
            ctaColor: '#14B8A6'  // Teal
        },
        elements: {
            badges: [{ type: 'new', text: 'NEW', position: 'top_left' }],
            callouts: 3,  // More callouts for features
            calloutStyle: 'glass_card_with_pointer',
            socialProof: null  // Focus on features
        },
        psychology: ['features', 'innovation', 'capability']
    },

    // ═══════════════════════════════════════════════════════════════
    // B2B: Trust-focused, ROI-driven
    // ═══════════════════════════════════════════════════════════════
    b2b_enterprise: {
        name: 'B2B Enterprise',
        description: 'Professional, trust signals, result-focused',
        bestFor: ['enterprise', 'b2b_saas', 'professional_services'],
        layout: {
            type: 'centered_focus',
            productPosition: { x: 0.5, y: 0.48 },
            productScale: 0.52,
            mockupType: 'browser',
            headlineY: 0.08,
            ctaY: 0.88
        },
        typography: {
            headline: { size: 44, weight: 700, style: 'professional' },
            tagline: { size: 18, weight: 400 },
            cta: { size: 16, weight: 600, text: ['Request Demo', 'Book a Call', 'Get a Quote', 'Learn More'] }
        },
        colors: {
            background: 'dark_navy',
            accent: 'trust_blue',
            ctaColor: '#3B82F6'  // Blue = trust
        },
        elements: {
            badges: [{ type: 'security', text: 'SOC 2 Certified', position: 'top_right' }],
            callouts: 1,
            socialProof: { type: 'logo_bar', text: 'Trusted by Fortune 500' }
        },
        psychology: ['trust', 'authority', 'roi']
    },

    b2b_case_study: {
        name: 'B2B Case Study',
        description: 'Result-focused with stats and social proof',
        bestFor: ['consulting', 'agencies', 'high_ticket'],
        layout: {
            type: 'top_product',
            productPosition: { x: 0.5, y: 0.32 },
            productScale: 0.5,
            headlineY: 0.60,
            ctaY: 0.90
        },
        typography: {
            headline: { size: 52, weight: 900, containsNumber: true }, // "3X Revenue", "50% Faster"
            tagline: { size: 20, weight: 400 },
            cta: { size: 16, weight: 600, text: ['See Case Study', 'Get Your Results', 'Book Strategy Call'] }
        },
        colors: {
            background: 'professional_dark',
            accent: 'green_success',
            ctaColor: '#10B981'  // Green = growth/success
        },
        elements: {
            badges: [{ type: 'result', text: '+247% ROI', position: 'top_left' }],
            callouts: 0,
            socialProof: { type: 'quote', text: '"Best investment we made" - CEO, TechCorp' }
        },
        psychology: ['results', 'proof', 'transformation']
    },

    // ═══════════════════════════════════════════════════════════════
    // DTC / CONSUMER: Emotion-driven, lifestyle-focused
    // ═══════════════════════════════════════════════════════════════
    dtc_disruptor: {
        name: 'DTC Disruptor',
        description: 'Bold statements, challenger brand energy',
        bestFor: ['new_brands', 'challenger_brands', 'gen_z_products'],
        layout: {
            type: 'floating_elements',
            productPosition: { x: 0.5, y: 0.48 },
            productScale: 0.55,
            headlineY: 0.06,
            ctaY: 0.88
        },
        typography: {
            headline: { size: 58, weight: 900, style: 'bold_statement' },
            tagline: { size: 22, weight: 400 },
            cta: { size: 18, weight: 700, text: ['Try It Now', 'Get Started', 'Join the Movement'] }
        },
        colors: {
            background: 'high_contrast',
            accent: 'vibrant_neon',
            ctaColor: '#F97316'  // Orange = energy
        },
        elements: {
            badges: [{ type: 'viral', text: '🔥 Trending', position: 'top_right' }],
            callouts: 1,
            socialProof: { type: 'user_count', text: '1M+ Users Already' }
        },
        psychology: ['fomo', 'identity', 'rebellion']
    },

    dtc_wellness: {
        name: 'DTC Wellness',
        description: 'Calming, natural, benefit-focused',
        bestFor: ['supplements', 'skincare', 'health', 'meditation', 'fitness'],
        layout: {
            type: 'centered_focus',
            productPosition: { x: 0.5, y: 0.48 },
            productScale: 0.55,
            headlineY: 0.08,
            ctaY: 0.88
        },
        typography: {
            headline: { size: 46, weight: 600, style: 'calm' },
            tagline: { size: 20, weight: 300, style: 'light' },
            cta: { size: 16, weight: 500, text: ['Discover', 'Feel the Difference', 'Start Your Journey'] }
        },
        colors: {
            background: 'nature_gradient',
            accent: 'organic_green',
            ctaColor: '#059669'  // Green = natural
        },
        elements: {
            badges: [{ type: 'natural', text: '100% Natural', position: 'top_left' }],
            callouts: 2,
            calloutStyle: 'benefit_focused',
            socialProof: { type: 'rating', text: '⭐ 4.9 from 5,000+ reviews' }
        },
        psychology: ['wellness', 'natural', 'transformation']
    },

    // ═══════════════════════════════════════════════════════════════
    // MOBILE APP: Install-focused
    // ═══════════════════════════════════════════════════════════════
    mobile_app_showcase: {
        name: 'Mobile App Showcase',
        description: 'Phone mockup, app store badges, feature callouts',
        bestFor: ['mobile_apps', 'ios_apps', 'android_apps', 'games'],
        layout: {
            type: 'centered_focus',
            productPosition: { x: 0.5, y: 0.48 },
            productScale: 0.45,
            mockupType: 'phone',
            headlineY: 0.08,
            ctaY: 0.88
        },
        typography: {
            headline: { size: 48, weight: 800 },
            tagline: { size: 18, weight: 400 },
            cta: { size: 16, weight: 600, text: ['Download Free', 'Get the App', 'Install Now'] }
        },
        colors: {
            background: 'app_gradient',
            accent: 'app_primary',
            ctaColor: '#8B5CF6'  // Purple = apps
        },
        elements: {
            badges: [{ type: 'appstore', text: '⭐ 4.8 on App Store', position: 'top_right' }],
            callouts: 2,
            socialProof: { type: 'downloads', text: '1M+ Downloads' }
        },
        psychology: ['convenience', 'social_proof', 'free_value']
    }
};

// ========================================
// INDUSTRY COLOR PALETTES
// ========================================

export const INDUSTRY_PALETTES = {
    technology: {
        name: 'Technology',
        variants: [
            { bg: '#0A0F1C', accent: '#3B82F6', secondary: '#8B5CF6', text: '#FFFFFF' },
            { bg: '#0F172A', accent: '#06B6D4', secondary: '#22D3EE', text: '#FFFFFF' },
            { bg: '#09090B', accent: '#A855F7', secondary: '#D946EF', text: '#FFFFFF' },
            { bg: '#020617', accent: '#2563EB', secondary: '#3B82F6', text: '#FFFFFF' },
            { bg: '#0C0A09', accent: '#F97316', secondary: '#FB923C', text: '#FFFFFF' }
        ]
    },

    saas: {
        name: 'SaaS / Software',
        variants: [
            { bg: '#0F0F23', accent: '#6366F1', secondary: '#818CF8', text: '#FFFFFF' },
            { bg: '#0A1628', accent: '#14B8A6', secondary: '#2DD4BF', text: '#FFFFFF' },
            { bg: '#1A1A2E', accent: '#F472B6', secondary: '#EC4899', text: '#FFFFFF' },
            { bg: '#0D1117', accent: '#10B981', secondary: '#34D399', text: '#FFFFFF' }
        ]
    },

    ecommerce: {
        name: 'E-Commerce',
        variants: [
            { bg: '#FAFAFA', accent: '#000000', secondary: '#404040', text: '#000000' },
            { bg: '#0A0A0A', accent: '#EAB308', secondary: '#FDE047', text: '#FFFFFF' },
            { bg: '#18181B', accent: '#EF4444', secondary: '#F87171', text: '#FFFFFF' },
            { bg: '#1C1917', accent: '#F59E0B', secondary: '#FBBF24', text: '#FFFFFF' }
        ]
    },

    finance: {
        name: 'Finance / Fintech',
        variants: [
            { bg: '#0F172A', accent: '#10B981', secondary: '#34D399', text: '#FFFFFF' },
            { bg: '#0C4A6E', accent: '#38BDF8', secondary: '#7DD3FC', text: '#FFFFFF' },
            { bg: '#1E1B4B', accent: '#A78BFA', secondary: '#C4B5FD', text: '#FFFFFF' },
            { bg: '#052E16', accent: '#22C55E', secondary: '#4ADE80', text: '#FFFFFF' }
        ]
    },

    health: {
        name: 'Health / Wellness',
        variants: [
            { bg: '#ECFDF5', accent: '#059669', secondary: '#10B981', text: '#064E3B' },
            { bg: '#F0FDFA', accent: '#14B8A6', secondary: '#2DD4BF', text: '#134E4A' },
            { bg: '#FFF7ED', accent: '#EA580C', secondary: '#F97316', text: '#7C2D12' },
            { bg: '#FAFAF9', accent: '#78716C', secondary: '#A8A29E', text: '#1C1917' }
        ]
    },

    lifestyle: {
        name: 'Lifestyle / Fashion',
        variants: [
            { bg: '#FAF5FF', accent: '#A855F7', secondary: '#C084FC', text: '#3B0764' },
            { bg: '#FDF4FF', accent: '#D946EF', secondary: '#E879F9', text: '#4A044E' },
            { bg: '#0F0F0F', accent: '#FFFFFF', secondary: '#A1A1AA', text: '#FFFFFF' },
            { bg: '#1C1917', accent: '#D4A373', secondary: '#E9C46A', text: '#FEFCE8' }
        ]
    },

    gaming: {
        name: 'Gaming / Entertainment',
        variants: [
            { bg: '#0A0A0A', accent: '#EF4444', secondary: '#F87171', text: '#FFFFFF' },
            { bg: '#030712', accent: '#8B5CF6', secondary: '#A78BFA', text: '#FFFFFF' },
            { bg: '#0C0A09', accent: '#22D3EE', secondary: '#67E8F9', text: '#FFFFFF' },
            { bg: '#18181B', accent: '#FACC15', secondary: '#FDE047', text: '#FFFFFF' }
        ]
    },

    education: {
        name: 'Education',
        variants: [
            { bg: '#1E3A5F', accent: '#3B82F6', secondary: '#60A5FA', text: '#FFFFFF' },
            { bg: '#0C4A6E', accent: '#F59E0B', secondary: '#FBBF24', text: '#FFFFFF' },
            { bg: '#FFFBEB', accent: '#D97706', secondary: '#F59E0B', text: '#451A03' },
            { bg: '#F0F9FF', accent: '#0284C7', secondary: '#38BDF8', text: '#0C4A6E' }
        ]
    },

    luxury: {
        name: 'Luxury / Premium',
        variants: [
            { bg: '#0A0A0A', accent: '#D4AF37', secondary: '#FFD700', text: '#FFFFFF' },
            { bg: '#1A1A1A', accent: '#B8860B', secondary: '#DAA520', text: '#FFFFFF' },
            { bg: '#0F0F0F', accent: '#FFFFFF', secondary: '#C0C0C0', text: '#FFFFFF' },
            { bg: '#1C1917', accent: '#C9A962', secondary: '#E5C287', text: '#FFFFFF' }
        ]
    }
};

// ========================================
// TYPOGRAPHY COMBINATIONS
// ========================================

export const TYPOGRAPHY_PRESETS = {
    bold_impact: {
        name: 'Bold Impact',
        headline: { size: 64, weight: 900, letterSpacing: -2, lineHeight: 1.0 },
        tagline: { size: 22, weight: 400, letterSpacing: 0.5, lineHeight: 1.4 },
        cta: { size: 18, weight: 700, letterSpacing: 0.5 },
        mood: ['premium', 'intense', 'urgent']
    },

    elegant_minimal: {
        name: 'Elegant Minimal',
        headline: { size: 48, weight: 600, letterSpacing: -0.5, lineHeight: 1.15 },
        tagline: { size: 18, weight: 300, letterSpacing: 1, lineHeight: 1.5 },
        cta: { size: 16, weight: 500, letterSpacing: 1 },
        mood: ['luxury', 'calm', 'minimal']
    },

    modern_tech: {
        name: 'Modern Tech',
        headline: { size: 56, weight: 800, letterSpacing: -1.5, lineHeight: 1.1 },
        tagline: { size: 20, weight: 400, letterSpacing: 0, lineHeight: 1.4 },
        cta: { size: 18, weight: 600, letterSpacing: 0.3 },
        mood: ['dynamic', 'professional', 'tech']
    },

    playful_friendly: {
        name: 'Playful Friendly',
        headline: { size: 52, weight: 700, letterSpacing: -1, lineHeight: 1.15 },
        tagline: { size: 20, weight: 400, letterSpacing: 0.2, lineHeight: 1.45 },
        cta: { size: 18, weight: 600, letterSpacing: 0.2 },
        mood: ['playful', 'friendly', 'approachable']
    },

    headline_heavy: {
        name: 'Headline Heavy',
        headline: { size: 72, weight: 900, letterSpacing: -3, lineHeight: 0.95 },
        tagline: { size: 18, weight: 400, letterSpacing: 0.5, lineHeight: 1.5 },
        cta: { size: 20, weight: 700, letterSpacing: 0.5 },
        mood: ['intense', 'powerful', 'statement']
    },

    balanced_classic: {
        name: 'Balanced Classic',
        headline: { size: 52, weight: 700, letterSpacing: -1, lineHeight: 1.2 },
        tagline: { size: 20, weight: 400, letterSpacing: 0.3, lineHeight: 1.45 },
        cta: { size: 18, weight: 600, letterSpacing: 0.3 },
        mood: ['professional', 'trustworthy', 'balanced']
    }
};

// ========================================
// VISUAL EFFECT PATTERNS
// ========================================

export const EFFECT_PATTERNS = {
    premium_dark: {
        name: 'Premium Dark',
        background: 'radial_gradient',
        bokeh: { show: true, count: 5, opacity: 0.04 },
        particles: { show: true, count: 30, opacity: 0.15 },
        noise: { show: true, opacity: 0.02 },
        vignette: { show: true, intensity: 0.35 },
        screenGlow: { show: true, intensity: 0.1 },
        colorGrading: 'cinematic'
    },

    vibrant_energy: {
        name: 'Vibrant Energy',
        background: 'gradient_mesh',
        bokeh: { show: true, count: 8, opacity: 0.06 },
        particles: { show: true, count: 50, opacity: 0.2 },
        sparkles: { show: true, count: 12 },
        noise: { show: true, opacity: 0.015 },
        vignette: { show: true, intensity: 0.25 },
        colorGrading: 'neon'
    },

    clean_minimal: {
        name: 'Clean Minimal',
        background: 'solid_gradient',
        bokeh: { show: false },
        particles: { show: false },
        noise: { show: true, opacity: 0.01 },
        vignette: { show: true, intensity: 0.15 },
        screenGlow: { show: false }
    },

    luxury_glow: {
        name: 'Luxury Glow',
        background: 'radial_gradient',
        bokeh: { show: true, count: 3, opacity: 0.03 },
        particles: { show: true, count: 15, opacity: 0.1 },
        lightRays: { show: true, count: 4, opacity: 0.05 },
        noise: { show: true, opacity: 0.02 },
        vignette: { show: true, intensity: 0.4 },
        colorGrading: 'warm'
    },

    tech_futuristic: {
        name: 'Tech Futuristic',
        background: 'gradient_mesh',
        bokeh: { show: true, count: 6, opacity: 0.05 },
        particles: { show: true, count: 40, opacity: 0.2 },
        glassCards: { show: true },
        noise: { show: true, opacity: 0.025 },
        vignette: { show: true, intensity: 0.3 },
        screenGlow: { show: true, intensity: 0.15 },
        colorGrading: 'cool'
    },

    warm_inviting: {
        name: 'Warm Inviting',
        background: 'radial_gradient',
        bokeh: { show: true, count: 4, opacity: 0.04 },
        particles: { show: false },
        lensFlare: { show: true, intensity: 0.15 },
        noise: { show: true, opacity: 0.02 },
        vignette: { show: true, intensity: 0.3 },
        colorGrading: 'warm'
    }
};

// ========================================
// CTA STYLE PATTERNS
// ========================================

export const CTA_PATTERNS = {
    gradient_glow: {
        name: 'Gradient Glow',
        style: 'gradient_glow',
        hasGradient: true,
        hasGlow: true,
        glowIntensity: 0.5,
        borderRadius: 'full',
        size: 'large',
        mood: ['premium', 'dynamic', 'tech']
    },

    solid_bold: {
        name: 'Solid Bold',
        style: 'solid',
        hasGradient: false,
        hasGlow: false,
        borderRadius: 'medium',
        size: 'large',
        mood: ['professional', 'urgent', 'direct']
    },

    outline_elegant: {
        name: 'Outline Elegant',
        style: 'outline',
        hasGradient: false,
        hasGlow: false,
        borderRadius: 'full',
        size: 'medium',
        mood: ['minimal', 'luxury', 'sophisticated']
    },

    glass_modern: {
        name: 'Glass Modern',
        style: 'glass',
        hasGradient: false,
        hasGlow: true,
        glowIntensity: 0.2,
        borderRadius: 'large',
        size: 'medium',
        mood: ['tech', 'futuristic', 'modern']
    },

    soft_friendly: {
        name: 'Soft Friendly',
        style: 'gradient',
        hasGradient: true,
        hasGlow: false,
        borderRadius: 'full',
        size: 'medium',
        mood: ['playful', 'friendly', 'approachable']
    }
};

// ========================================
// BADGE PLACEMENT PATTERNS
// ========================================

export const BADGE_PATTERNS = {
    top_right_corner: {
        positions: [
            { x: 0.85, y: 0.04 },
            { x: 0.85, y: 0.09 }
        ],
        style: 'pill',
        opacity: 0.9
    },

    top_left_stack: {
        positions: [
            { x: 0.04, y: 0.04 },
            { x: 0.04, y: 0.09 },
            { x: 0.04, y: 0.14 }
        ],
        style: 'square',
        opacity: 0.85
    },

    near_cta: {
        positions: [
            { x: 0.7, y: 0.88 }
        ],
        style: 'pill',
        opacity: 0.95
    },

    scattered: {
        positions: [
            { x: 0.04, y: 0.04 },
            { x: 0.85, y: 0.2 },
            { x: 0.04, y: 0.7 }
        ],
        style: 'mixed',
        opacity: 0.8
    },

    corners: {
        positions: [
            { x: 0.04, y: 0.04 },
            { x: 0.85, y: 0.04 }
        ],
        style: 'flag',
        opacity: 0.9
    }
};

// ========================================
// LAYOUT COMPOSITION PATTERNS
// ========================================

export const COMPOSITION_PATTERNS = {
    centered_focus: {
        productPosition: { x: 0.5, y: 0.48 },
        productScale: 0.55,
        headlineY: 0.08,
        ctaY: 0.88,
        whitespace: 'balanced',
        grid: 'centered'
    },

    left_product: {
        productPosition: { x: 0.28, y: 0.5 },
        productScale: 0.48,
        headlinePosition: { x: 0.72, y: 0.25 },
        ctaPosition: { x: 0.72, y: 0.55 },
        whitespace: 'minimal',
        grid: 'asymmetric'
    },

    right_product: {
        productPosition: { x: 0.72, y: 0.5 },
        productScale: 0.48,
        headlinePosition: { x: 0.28, y: 0.25 },
        ctaPosition: { x: 0.28, y: 0.55 },
        whitespace: 'minimal',
        grid: 'asymmetric'
    },

    top_product: {
        productPosition: { x: 0.5, y: 0.28 },
        productScale: 0.5,
        headlineY: 0.6,
        ctaY: 0.88,
        whitespace: 'generous',
        grid: 'rule_of_thirds'
    },

    floating_elements: {
        productPosition: { x: 0.55, y: 0.5 },
        productScale: 0.6,
        headlineY: 0.08,
        ctaY: 0.9,
        floatingCards: true,
        whitespace: 'minimal',
        grid: 'dynamic'
    }
};

// ========================================
// PATTERN SELECTION
// ========================================

/**
 * Select best color palette for industry and mood
 */
export function selectColorPalette(industry, mood = 'premium') {
    const normalizedIndustry = industry?.toLowerCase() || 'technology';

    // Find matching industry
    let palette = INDUSTRY_PALETTES.technology;
    for (const [key, value] of Object.entries(INDUSTRY_PALETTES)) {
        if (normalizedIndustry.includes(key) || key.includes(normalizedIndustry)) {
            palette = value;
            break;
        }
    }

    // Select variant based on mood
    const variants = palette.variants;
    if (mood === 'dark' || mood === 'premium') {
        return variants[0];
    } else if (mood === 'vibrant' || mood === 'dynamic') {
        return variants[Math.min(1, variants.length - 1)];
    }

    return variants[Math.floor(Math.random() * variants.length)];
}

/**
 * Select typography preset based on mood
 */
export function selectTypographyPreset(mood = 'professional', productType = '') {
    const moods = {
        premium: 'bold_impact',
        luxury: 'elegant_minimal',
        tech: 'modern_tech',
        playful: 'playful_friendly',
        intense: 'headline_heavy',
        professional: 'balanced_classic',
        minimal: 'elegant_minimal'
    };

    return TYPOGRAPHY_PRESETS[moods[mood]] || TYPOGRAPHY_PRESETS.balanced_classic;
}

/**
 * Select effect pattern based on mood
 */
export function selectEffectPattern(mood = 'premium', energy = 'dynamic') {
    if (mood === 'premium' && energy !== 'intense') {
        return EFFECT_PATTERNS.premium_dark;
    }
    if (energy === 'intense' || mood === 'vibrant') {
        return EFFECT_PATTERNS.vibrant_energy;
    }
    if (mood === 'minimal') {
        return EFFECT_PATTERNS.clean_minimal;
    }
    if (mood === 'luxury') {
        return EFFECT_PATTERNS.luxury_glow;
    }
    if (mood === 'tech' || mood === 'futuristic') {
        return EFFECT_PATTERNS.tech_futuristic;
    }
    if (mood === 'friendly' || mood === 'warm') {
        return EFFECT_PATTERNS.warm_inviting;
    }

    return EFFECT_PATTERNS.premium_dark;
}

/**
 * Select CTA pattern based on mood
 */
export function selectCTAPattern(mood = 'premium') {
    for (const [key, pattern] of Object.entries(CTA_PATTERNS)) {
        if (pattern.mood.includes(mood)) {
            return pattern;
        }
    }
    return CTA_PATTERNS.gradient_glow;
}

/**
 * Build complete pattern set from analysis
 */
export function buildPatternSet(designSpecs, productAnalysis, contentPackage) {
    const mood = designSpecs?.mood?.primary || 'premium';
    const energy = designSpecs?.mood?.energy || 'dynamic';
    const industry = productAnalysis?.industry || productAnalysis?.productType || 'technology';

    return {
        colors: selectColorPalette(industry, mood),
        typography: selectTypographyPreset(mood, productAnalysis?.productType),
        effects: selectEffectPattern(mood, energy),
        cta: selectCTAPattern(mood),
        badges: mood === 'minimal' ? BADGE_PATTERNS.top_right_corner : BADGE_PATTERNS.scattered,
        composition: selectCompositionPattern(designSpecs?.layout?.type)
    };
}

/**
 * Select composition pattern
 */
function selectCompositionPattern(layoutType) {
    const map = {
        hero_centered: COMPOSITION_PATTERNS.centered_focus,
        hero_left: COMPOSITION_PATTERNS.left_product,
        hero_right: COMPOSITION_PATTERNS.right_product,
        hero_top: COMPOSITION_PATTERNS.top_product,
        floating_ui: COMPOSITION_PATTERNS.floating_elements
    };

    return map[layoutType] || COMPOSITION_PATTERNS.centered_focus;
}

// ========================================
// INTELLIGENT SCHEMA SELECTION
// ========================================

/**
 * Select the best winning ad schema based on product analysis
 * This is the core intelligence for matching product to winning patterns
 * 
 * @param {Object} productAnalysis - Product analysis from AI
 * @param {string} industry - Industry/vertical
 * @param {string} userPrompt - Original user prompt for context
 * @returns {Object} Best matching winning ad schema
 */
export function selectWinningSchema(productAnalysis, industry, userPrompt = '') {
    console.log('[SchemaSelector] 🧠 Selecting best winning ad schema...');

    const productType = productAnalysis?.productType?.toLowerCase() || '';
    const industryLower = industry?.toLowerCase() || '';
    const prompt = userPrompt?.toLowerCase() || '';
    const keywords = productAnalysis?.keywords || [];
    const keywordsLower = keywords.map(k => k.toLowerCase());

    // Score each schema
    const scores = {};

    for (const [schemaKey, schema] of Object.entries(WINNING_AD_SCHEMAS)) {
        let score = 0;

        // Check if product type matches bestFor
        for (const bestFor of schema.bestFor) {
            if (productType.includes(bestFor) || industryLower.includes(bestFor)) {
                score += 10;
            }
            if (keywordsLower.some(k => k.includes(bestFor))) {
                score += 5;
            }
            if (prompt.includes(bestFor)) {
                score += 3;
            }
        }

        // Industry matching
        if (schemaKey.startsWith('ecommerce') && (industryLower.includes('ecommerce') || industryLower.includes('shop') || industryLower.includes('store'))) {
            score += 15;
        }
        if (schemaKey.startsWith('saas') && (industryLower.includes('saas') || industryLower.includes('software') || productType.includes('dashboard'))) {
            score += 15;
        }
        if (schemaKey.startsWith('b2b') && (industryLower.includes('b2b') || industryLower.includes('enterprise') || industryLower.includes('business'))) {
            score += 15;
        }
        if (schemaKey.startsWith('dtc') && (industryLower.includes('dtc') || industryLower.includes('consumer') || industryLower.includes('brand'))) {
            score += 15;
        }
        if (schemaKey.includes('mobile') && (productType.includes('app') || productType.includes('mobile') || industryLower.includes('app'))) {
            score += 15;
        }
        if (schemaKey.includes('wellness') && (industryLower.includes('health') || industryLower.includes('wellness') || keywordsLower.some(k => k.includes('natural')))) {
            score += 12;
        }

        scores[schemaKey] = score;
    }

    // Find highest scoring schema
    let bestSchema = 'saas_dashboard_hero';  // Default
    let bestScore = 0;

    for (const [key, score] of Object.entries(scores)) {
        if (score > bestScore) {
            bestScore = score;
            bestSchema = key;
        }
    }

    console.log(`[SchemaSelector] ✅ Selected: ${bestSchema} (score: ${bestScore})`);
    console.log(`[SchemaSelector]   Schema: "${WINNING_AD_SCHEMAS[bestSchema].name}"`);
    console.log(`[SchemaSelector]   Psychology: ${WINNING_AD_SCHEMAS[bestSchema].psychology.join(', ')}`);

    return {
        schemaKey: bestSchema,
        schema: WINNING_AD_SCHEMAS[bestSchema],
        confidence: bestScore >= 10 ? 'high' : bestScore >= 5 ? 'medium' : 'low',
        allScores: scores
    };
}

/**
 * Get all available schemas for a specific category
 */
export function getSchemasByCategory(category) {
    const categories = {
        ecommerce: ['ecommerce_product_hero', 'ecommerce_lifestyle'],
        saas: ['saas_dashboard_hero', 'saas_feature_showcase'],
        b2b: ['b2b_enterprise', 'b2b_case_study'],
        dtc: ['dtc_disruptor', 'dtc_wellness'],
        app: ['mobile_app_showcase']
    };

    const keys = categories[category] || [];
    return keys.map(key => ({ key, ...WINNING_AD_SCHEMAS[key] }));
}

export default {
    WINNING_AD_SCHEMAS,
    INDUSTRY_PALETTES,
    TYPOGRAPHY_PRESETS,
    EFFECT_PATTERNS,
    CTA_PATTERNS,
    BADGE_PATTERNS,
    COMPOSITION_PATTERNS,
    selectColorPalette,
    selectTypographyPreset,
    selectEffectPattern,
    selectCTAPattern,
    selectWinningSchema,
    getSchemasByCategory,
    buildPatternSet
};
