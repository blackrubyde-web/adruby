/**
 * 2026 ELITE TEMPLATES COLLECTION
 * 
 * 15+ Professional Meta Ad Templates
 * Each template is pixel-perfect and optimized for conversions
 * 
 * Created with Creative Director thinking - every element is intentional
 */

// ============================================================
// TYPOGRAPHY SYSTEM - Professional Font Stacks
// ============================================================

export const TYPOGRAPHY_2026 = {
    // Primary Display - Bold headlines
    display: {
        family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        weights: {
            black: 900,
            bold: 700,
            semibold: 600,
        },
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
    },

    // Body Text - Readable content
    body: {
        family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        weights: {
            medium: 500,
            regular: 400,
        },
        letterSpacing: '0',
        lineHeight: 1.5,
    },

    // Accent Text - CTAs, Badges
    accent: {
        family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        weights: {
            bold: 700,
            semibold: 600,
        },
        letterSpacing: '0.05em',
        lineHeight: 1.2,
    },

    // Type Scale (Minor Third - 1.2 ratio)
    scale: {
        '6xl': 96,   // Impact headlines
        '5xl': 80,   // Major headlines
        '4xl': 64,   // Primary headlines
        '3xl': 52,   // Secondary headlines
        '2xl': 42,   // Tertiary headlines
        'xl': 32,    // Large body
        'lg': 24,    // Medium body
        'md': 20,    // Body text
        'sm': 16,    // Small text
        'xs': 14,    // Caption
        '2xs': 12,   // Micro text
    },
};

// ============================================================
// SPACING SYSTEM - Consistent Rhythm
// ============================================================

export const SPACING_2026 = {
    base: 8,  // 8px base unit

    // Named scales
    '2xs': 4,
    'xs': 8,
    'sm': 12,
    'md': 16,
    'lg': 24,
    'xl': 32,
    '2xl': 48,
    '3xl': 64,
    '4xl': 96,
    '5xl': 128,

    // Functional spacing
    margin: {
        canvas: 44,      // Canvas margin
        section: 32,     // Section spacing
        element: 16,     // Between elements
        tight: 8,        // Tight spacing
    },

    padding: {
        card: 24,        // Card padding
        button: { x: 32, y: 16 },
        badge: { x: 16, y: 8 },
        feature: { x: 20, y: 14 },
    },
};

// ============================================================
// SHADOW SYSTEM - Depth & Hierarchy
// ============================================================

export const SHADOWS_2026 = {
    // Elevation levels
    xs: {
        offset: { x: 0, y: 1 },
        blur: 2,
        spread: 0,
        color: 'rgba(0,0,0,0.05)',
    },
    sm: {
        offset: { x: 0, y: 2 },
        blur: 4,
        spread: 0,
        color: 'rgba(0,0,0,0.1)',
    },
    md: {
        offset: { x: 0, y: 4 },
        blur: 8,
        spread: 0,
        color: 'rgba(0,0,0,0.15)',
    },
    lg: {
        offset: { x: 0, y: 8 },
        blur: 16,
        spread: 0,
        color: 'rgba(0,0,0,0.2)',
    },
    xl: {
        offset: { x: 0, y: 16 },
        blur: 32,
        spread: 0,
        color: 'rgba(0,0,0,0.25)',
    },
    '2xl': {
        offset: { x: 0, y: 24 },
        blur: 48,
        spread: 0,
        color: 'rgba(0,0,0,0.3)',
    },

    // Glow effects
    glow: {
        accent: (color) => ({
            blur: 20,
            color: color.replace(')', ', 0.4)').replace('rgb', 'rgba'),
        }),
        neon: (color) => ({
            blur: 30,
            color: color,
            opacity: 0.6,
        }),
    },
};

// ============================================================
// 15+ ELITE TEMPLATES
// ============================================================

export const ELITE_TEMPLATES_2026 = {
    // =========================================
    // 1. HERO SPLIT - Product Left, Content Right
    // =========================================
    hero_split: {
        id: 'hero_split',
        name: 'Hero Split',
        category: 'hero',
        description: 'Classic split layout with product prominence',
        bestFor: ['ecommerce', 'product_launch', 'retail'],

        canvas: { width: 1080, height: 1080 },

        zones: {
            product: {
                x: 0.02,
                y: 0.12,
                width: 0.50,
                height: 0.76,
                shadow: 'xl',
            },
            headline: {
                x: 0.54,
                y: 0.08,
                width: 0.44,
                fontSize: 'hero', // Will use scale
                align: 'left',
                maxLines: 3,
            },
            features: {
                x: 0.54,
                y: 0.32,
                width: 0.44,
                itemHeight: 64,
                itemSpacing: 12,
                maxItems: 4,
                style: 'checklist',
            },
            cta: {
                x: 0.54,
                y: 0.82,
                width: 0.38,
                height: 56,
                radius: 28,
            },
            badge: {
                x: 0.78,
                y: 0.02,
                width: 0.20,
                height: 34,
                radius: 17,
            },
        },

        backgroundPrompt: `
Split-layout premium advertisement background (1080x1080).

LEFT HALF (0-50%):
- Subtle gradient from top-left to bottom-right
- Soft ambient light highlighting product zone
- Very subtle geometric shapes (5% opacity)
- THE LEFT HALF MUST BE EMPTY for product placement

RIGHT HALF (50-100%):
- Slightly darker panel for contrast with text
- Subtle texture overlay
- Clean, minimal, professional

Style: $10,000 agency production level
Technical: Photorealistic lighting, no product, no text
`,
    },

    // =========================================
    // 2. CENTERED HERO - Minimal Premium
    // =========================================
    centered_hero: {
        id: 'centered_hero',
        name: 'Centered Hero',
        category: 'minimal',
        description: 'Apple-style minimal with focus on product',
        bestFor: ['luxury', 'tech', 'premium_brands'],

        canvas: { width: 1080, height: 1080 },

        zones: {
            product: {
                x: 0.12,
                y: 0.18,
                width: 0.76,
                height: 0.52,
                shadow: 'xl',
            },
            headline: {
                x: 0.08,
                y: 0.04,
                width: 0.84,
                fontSize: '3xl',
                align: 'center',
                maxLines: 2,
            },
            subheadline: {
                x: 0.12,
                y: 0.74,
                width: 0.76,
                fontSize: 'lg',
                align: 'center',
            },
            cta: {
                x: 0.30,
                y: 0.84,
                width: 0.40,
                height: 54,
                radius: 27,
            },
            badge: {
                x: 0.40,
                y: 0.02,
                width: 0.20,
                height: 32,
                radius: 16,
            },
        },

        backgroundPrompt: `
Ultra-minimal premium advertisement background (1080x1080).

Style: Apple Store gallery, museum exhibition quality
- Clean gradient from light gray (#F8F8F8) to white (#FFFFFF)
- Subtle ambient shadow in center where product will sit
- Absolutely minimal - no patterns, no elements
- Perfect studio lighting effect
- Professional product photography backdrop

CENTER 70% MUST BE EMPTY for product placement.
The background should make the product the absolute star.

Technical: No text, no product, photorealistic lighting
`,
    },

    // =========================================
    // 3. FEATURE CALLOUTS - Radial Layout
    // =========================================
    feature_callouts: {
        id: 'feature_callouts',
        name: 'Feature Callouts',
        category: 'informative',
        description: 'Product center with feature callouts around',
        bestFor: ['tech', 'gaming', 'product_features'],

        canvas: { width: 1080, height: 1080 },

        zones: {
            product: {
                x: 0.22,
                y: 0.22,
                width: 0.56,
                height: 0.50,
                shadow: 'lg',
            },
            headline: {
                x: 0.06,
                y: 0.03,
                width: 0.88,
                fontSize: '2xl',
                align: 'center',
            },
            features: {
                positions: [
                    { x: 0.02, y: 0.20, align: 'left', arrow: 'right' },
                    { x: 0.72, y: 0.20, align: 'right', arrow: 'left' },
                    { x: 0.02, y: 0.68, align: 'left', arrow: 'right' },
                    { x: 0.72, y: 0.68, align: 'right', arrow: 'left' },
                ],
                width: 0.26,
                itemHeight: 70,
                style: 'callout_card',
            },
            cta: {
                x: 0.28,
                y: 0.86,
                width: 0.44,
                height: 52,
                radius: 26,
            },
            badge: {
                x: 0.76,
                y: 0.02,
                width: 0.22,
                height: 30,
                radius: 15,
            },
        },

        arrows: {
            style: 'curved_dotted',
            color: 'rgba(255,255,255,0.3)',
            width: 2,
        },

        backgroundPrompt: `
Feature-callout style advertisement background (1080x1080).

CENTER (25-75% area):
- Subtle radial gradient emanating from center
- Soft ambient glow for product highlight
- EMPTY for product placement

CORNERS:
- Subtle geometric accent shapes
- Very low opacity (5-10%)
- Guide eye toward center

Style: Tech product showcase, premium gaming aesthetic
Colors: Deep dark base (#0A0A12), subtle accent glows

Technical: No text, no product, professional lighting
`,
    },

    // =========================================
    // 4. GAMING SHOWCASE - RGB Neon
    // =========================================
    gaming_showcase: {
        id: 'gaming_showcase',
        name: 'Gaming Showcase',
        category: 'gaming',
        description: 'RGB neon aesthetics for gaming products',
        bestFor: ['gaming', 'esports', 'tech_accessories'],

        canvas: { width: 1080, height: 1080 },

        zones: {
            product: {
                x: 0.18,
                y: 0.20,
                width: 0.64,
                height: 0.52,
                shadow: 'neon_glow',
                glowColor: '#00FFFF',
            },
            headline: {
                x: 0.04,
                y: 0.02,
                width: 0.92,
                fontSize: '4xl',
                align: 'center',
                style: 'neon_text',
            },
            features: {
                x: 0.68,
                y: 0.25,
                width: 0.30,
                itemHeight: 58,
                itemSpacing: 10,
                maxItems: 3,
                style: 'neon_card',
            },
            cta: {
                x: 0.22,
                y: 0.82,
                width: 0.56,
                height: 60,
                radius: 30,
                style: 'neon_gradient',
            },
            badge: {
                x: 0.02,
                y: 0.02,
                width: 0.18,
                height: 36,
                radius: 18,
                style: 'neon',
            },
        },

        palette: 'gaming',

        backgroundPrompt: `
Epic gaming/RGB advertisement background (1080x1080).

BASE:
- Ultra-dark background (#050508 to #0A0A15)
- Subtle hexagonal grid pattern (8% opacity)

NEON ELEMENTS:
- Cyan (#00FFFF) glow from left edge
- Magenta (#FF00FF) glow from right edge
- Subtle purple ambient in corners
- Thin neon accent lines (1-2px)

EFFECTS:
- Small floating particles (5-8 visible)
- Subtle scanline overlay (3% opacity)
- Light bloom on neon sources

CENTER 60% MUST BE EMPTY for product placement.
Style: Razer/ASUS ROG level, NOT cheap gamer aesthetic.

Technical: No text, no product, photorealistic lighting
`,
    },

    // =========================================
    // 5. LIFESTYLE CONTEXT - Scene Integration
    // =========================================
    lifestyle_context: {
        id: 'lifestyle_context',
        name: 'Lifestyle Context',
        category: 'lifestyle',
        description: 'Product in aspirational context',
        bestFor: ['home_decor', 'fashion', 'wellness'],

        canvas: { width: 1080, height: 1080 },

        zones: {
            product: {
                x: 0.28,
                y: 0.25,
                width: 0.44,
                height: 0.50,
                shadow: 'lg',
            },
            headline: {
                x: 0.04,
                y: 0.04,
                width: 0.65,
                fontSize: '2xl',
                align: 'left',
            },
            subheadline: {
                x: 0.04,
                y: 0.80,
                width: 0.55,
                fontSize: 'lg',
                align: 'left',
            },
            cta: {
                x: 0.58,
                y: 0.84,
                width: 0.38,
                height: 50,
                radius: 25,
            },
            badge: {
                x: 0.80,
                y: 0.02,
                width: 0.18,
                height: 32,
                radius: 16,
            },
        },

        backgroundPrompt: `
Lifestyle/aspirational advertisement background (1080x1080).

SCENE:
- Warm, cozy atmosphere (home office, living room, creative space)
- Blurred background elements for depth
- Golden hour lighting feel
- Soft shadows, warm tones

PRODUCT AREA (center 45%):
- Slightly brighter ambient light
- Clean surface for product placement
- EMPTY - product will be composited

BOTTOM:
- Subtle gradient overlay for text readability

Style: Premium lifestyle photography, editorial quality
Mood: Aspirational, warm, inviting

Technical: No text, no product, photorealistic
`,
    },

    // =========================================
    // 6. DISCOUNT URGENCY - Sale/Promo
    // =========================================
    discount_urgency: {
        id: 'discount_urgency',
        name: 'Discount Urgency',
        category: 'promo',
        description: 'High-impact sale layout',
        bestFor: ['sales', 'promotions', 'black_friday'],

        canvas: { width: 1080, height: 1080 },

        zones: {
            product: {
                x: 0.25,
                y: 0.28,
                width: 0.50,
                height: 0.45,
                shadow: 'xl',
            },
            headline: {
                x: 0.06,
                y: 0.02,
                width: 0.88,
                fontSize: '5xl',
                align: 'center',
                style: 'impact',
            },
            discount_badge: {
                x: 0.32,
                y: 0.16,
                width: 0.36,
                height: 48,
                style: 'burst',
            },
            original_price: {
                x: 0.06,
                y: 0.78,
                width: 0.35,
                fontSize: 'xl',
                style: 'strikethrough',
            },
            sale_price: {
                x: 0.42,
                y: 0.76,
                width: 0.50,
                fontSize: '4xl',
                style: 'highlight',
            },
            cta: {
                x: 0.22,
                y: 0.86,
                width: 0.56,
                height: 58,
                radius: 29,
                style: 'urgent',
            },
            timer: {
                x: 0.30,
                y: 0.94,
                width: 0.40,
                fontSize: 'sm',
            },
        },

        backgroundPrompt: `
High-energy SALE/promotional background (1080x1080).

STYLE:
- Bold, attention-grabbing
- Dynamic diagonal stripes or burst pattern
- Red/orange energy radiating from center

COLORS:
- Primary: Deep red (#B91C1C) or black (#0A0A0A)
- Accent: Bright yellow (#FCD34D) or white
- Energy: Orange gradients

CENTER 50% MUST BE EMPTY for product.

EFFECTS:
- Subtle motion blur on edges
- Light burst from center
- High contrast

Style: Black Friday energy, premium not cheap
Technical: No text, no prices, no product
`,
    },

    // =========================================
    // 7. TESTIMONIAL FOCUS - Social Proof
    // =========================================
    testimonial_focus: {
        id: 'testimonial_focus',
        name: 'Testimonial Focus',
        category: 'social_proof',
        description: 'Review/testimonial centered layout',
        bestFor: ['services', 'reviews', 'trust_building'],

        canvas: { width: 1080, height: 1080 },

        zones: {
            product: {
                x: 0.30,
                y: 0.08,
                width: 0.40,
                height: 0.35,
                shadow: 'lg',
            },
            quote: {
                x: 0.08,
                y: 0.48,
                width: 0.84,
                fontSize: 'xl',
                align: 'center',
                style: 'quote',
            },
            author: {
                x: 0.08,
                y: 0.72,
                width: 0.84,
                fontSize: 'md',
                align: 'center',
            },
            stars: {
                x: 0.35,
                y: 0.80,
                width: 0.30,
                count: 5,
            },
            cta: {
                x: 0.28,
                y: 0.88,
                width: 0.44,
                height: 52,
                radius: 26,
            },
        },

        backgroundPrompt: `
Trust-building testimonial background (1080x1080).

STYLE:
- Warm, trustworthy feel
- Soft gradient background
- Subtle quote marks watermark (10% opacity)

COLORS:
- Warm neutrals (#2A2520 to #1A1A1A)
- Accent: Gold/amber for trust

TOP 40%: Lighter for product (EMPTY)
BOTTOM 60%: Slightly darker for text contrast

Mood: Authentic, trustworthy, premium
Technical: No text, no product
`,
    },

    // =========================================
    // 8. COMPARISON SPLIT - Before/After
    // =========================================
    comparison_split: {
        id: 'comparison_split',
        name: 'Comparison Split',
        category: 'comparison',
        description: 'Before/After or comparison layout',
        bestFor: ['transformations', 'upgrades', 'versus'],

        canvas: { width: 1080, height: 1080 },

        zones: {
            left_product: {
                x: 0.02,
                y: 0.18,
                width: 0.46,
                height: 0.55,
                label: 'VORHER',
            },
            right_product: {
                x: 0.52,
                y: 0.18,
                width: 0.46,
                height: 0.55,
                label: 'NACHHER',
                highlight: true,
            },
            headline: {
                x: 0.04,
                y: 0.02,
                width: 0.92,
                fontSize: '2xl',
                align: 'center',
            },
            divider: {
                x: 0.49,
                y: 0.15,
                height: 0.65,
                style: 'vs_badge',
            },
            cta: {
                x: 0.28,
                y: 0.86,
                width: 0.44,
                height: 52,
                radius: 26,
            },
        },

        backgroundPrompt: `
Comparison/split-screen background (1080x1080).

LEFT HALF (0-48%):
- Slightly muted, desaturated
- Subtle gray overlay
- "Before" feeling

CENTER DIVIDER (48-52%):
- Subtle separator line or gradient
- Space for "VS" badge

RIGHT HALF (52-100%):
- Brighter, more vibrant
- Subtle glow effect
- "After" feeling - the upgrade

BOTH HALVES: Product areas EMPTY

Style: Premium comparison, not infomercial
Technical: No text, no products
`,
    },

    // =========================================
    // 9. STACKED VERTICAL - Story Format
    // =========================================
    stacked_vertical: {
        id: 'stacked_vertical',
        name: 'Stacked Vertical',
        category: 'story',
        description: 'Optimized for Stories/Reels format',
        bestFor: ['instagram_stories', 'tiktok', 'vertical_video'],

        canvas: { width: 1080, height: 1920 }, // 9:16

        zones: {
            headline: {
                x: 0.06,
                y: 0.06,
                width: 0.88,
                fontSize: '3xl',
                align: 'center',
            },
            product: {
                x: 0.10,
                y: 0.15,
                width: 0.80,
                height: 0.40,
                shadow: 'xl',
            },
            features: {
                x: 0.08,
                y: 0.58,
                width: 0.84,
                itemHeight: 70,
                itemSpacing: 16,
                maxItems: 4,
                style: 'checklist',
            },
            cta: {
                x: 0.15,
                y: 0.88,
                width: 0.70,
                height: 60,
                radius: 30,
            },
            swipe_indicator: {
                x: 0.40,
                y: 0.95,
                width: 0.20,
            },
        },

        backgroundPrompt: `
Vertical story-format background (1080x1920, 9:16 ratio).

COMPOSITION:
- Top section (0-50%): Lighter, product showcase area (EMPTY)
- Bottom section (50-100%): Darker for text content

STYLE:
- Gradient from top to bottom
- Subtle animated feel (light movement)
- Mobile-optimized, bold colors

CENTER-TOP 40%: EMPTY for product placement

Technical: Vertical format, no text, no product
`,
    },

    // =========================================
    // 10. GRID COLLECTION - Multi-Product
    // =========================================
    grid_collection: {
        id: 'grid_collection',
        name: 'Grid Collection',
        category: 'collection',
        description: 'Multiple products in grid layout',
        bestFor: ['collections', 'bundles', 'product_lines'],

        canvas: { width: 1080, height: 1080 },

        zones: {
            headline: {
                x: 0.04,
                y: 0.02,
                width: 0.92,
                fontSize: '2xl',
                align: 'center',
            },
            products: {
                layout: '2x2',
                positions: [
                    { x: 0.04, y: 0.14, width: 0.44, height: 0.38 },
                    { x: 0.52, y: 0.14, width: 0.44, height: 0.38 },
                    { x: 0.04, y: 0.54, width: 0.44, height: 0.38 },
                    { x: 0.52, y: 0.54, width: 0.44, height: 0.38 },
                ],
                shadow: 'md',
            },
            cta: {
                x: 0.25,
                y: 0.92,
                width: 0.50,
                height: 50,
                radius: 25,
            },
            badge: {
                x: 0.35,
                y: 0.02,
                width: 0.30,
                height: 32,
            },
        },

        backgroundPrompt: `
Grid/collection style background (1080x1080).

STRUCTURE:
- 2x2 grid implied by subtle separators
- Each quadrant slightly lighter in center
- ALL FOUR QUADRANTS EMPTY for products

STYLE:
- Clean, organized, premium
- Subtle grid lines (5% opacity)
- Professional catalog aesthetic

Technical: No products, no text
`,
    },

    // =========================================
    // 11. QUOTE IMPACT - Powerful Statement
    // =========================================
    quote_impact: {
        id: 'quote_impact',
        name: 'Quote Impact',
        category: 'brand',
        description: 'Brand statement with product accent',
        bestFor: ['brand_awareness', 'mission', 'values'],

        canvas: { width: 1080, height: 1080 },

        zones: {
            quote: {
                x: 0.08,
                y: 0.15,
                width: 0.84,
                fontSize: '4xl',
                align: 'center',
                style: 'statement',
            },
            product: {
                x: 0.35,
                y: 0.55,
                width: 0.30,
                height: 0.30,
                shadow: 'lg',
            },
            brand: {
                x: 0.30,
                y: 0.88,
                width: 0.40,
                fontSize: 'lg',
                align: 'center',
            },
        },

        backgroundPrompt: `
Impactful brand statement background (1080x1080).

STYLE:
- Bold, powerful, confident
- Dark premium base
- Subtle texture for depth

COMPOSITION:
- Top 50%: Text-ready (no distractions)
- Center-bottom: Subtle highlight for small product (EMPTY)

Mood: Premium brand, powerful statement
Technical: No text, no product
`,
    },

    // =========================================
    // 12. PROBLEM SOLUTION - Story Arc
    // =========================================
    problem_solution: {
        id: 'problem_solution',
        name: 'Problem → Solution',
        category: 'storytelling',
        description: 'Clear problem-solution narrative',
        bestFor: ['pain_points', 'solutions', 'benefits'],

        canvas: { width: 1080, height: 1080 },

        zones: {
            problem: {
                x: 0.04,
                y: 0.04,
                width: 0.92,
                height: 0.15,
                style: 'problem_text',
            },
            arrow: {
                x: 0.45,
                y: 0.20,
                size: 40,
                direction: 'down',
            },
            product: {
                x: 0.22,
                y: 0.26,
                width: 0.56,
                height: 0.42,
                shadow: 'xl',
            },
            solution: {
                x: 0.04,
                y: 0.72,
                width: 0.92,
                fontSize: 'xl',
                align: 'center',
                style: 'solution_text',
            },
            cta: {
                x: 0.28,
                y: 0.86,
                width: 0.44,
                height: 52,
                radius: 26,
            },
        },

        backgroundPrompt: `
Problem-solution narrative background (1080x1080).

COMPOSITION:
- Top area: Slightly muted/problematic feel
- Center: Bright, solution area (EMPTY for product)
- Bottom: Positive, resolved feel

VISUAL STORY:
- Gradient from gray-ish top to bright bottom
- Arrow or flow direction implied
- Center product zone is the hero moment

Style: Professional, clear communication
Technical: No text, no product
`,
    },

    // =========================================
    // 13. STATS SHOWCASE - Data Driven
    // =========================================
    stats_showcase: {
        id: 'stats_showcase',
        name: 'Stats Showcase',
        category: 'data',
        description: 'Highlight impressive statistics',
        bestFor: ['performance', 'results', 'proof'],

        canvas: { width: 1080, height: 1080 },

        zones: {
            headline: {
                x: 0.04,
                y: 0.02,
                width: 0.92,
                fontSize: '2xl',
                align: 'center',
            },
            product: {
                x: 0.04,
                y: 0.14,
                width: 0.45,
                height: 0.50,
                shadow: 'lg',
            },
            stats: {
                x: 0.52,
                y: 0.14,
                width: 0.46,
                items: [
                    { label: 'stat1', valueFontSize: '5xl', labelFontSize: 'sm' },
                    { label: 'stat2', valueFontSize: '5xl', labelFontSize: 'sm' },
                    { label: 'stat3', valueFontSize: '5xl', labelFontSize: 'sm' },
                ],
                itemSpacing: 20,
            },
            cta: {
                x: 0.52,
                y: 0.82,
                width: 0.42,
                height: 52,
                radius: 26,
            },
        },

        backgroundPrompt: `
Data/statistics showcase background (1080x1080).

LEFT HALF: Product showcase area (EMPTY)
RIGHT HALF: Clean space for large statistics

STYLE:
- Professional, trustworthy
- Subtle grid or chart elements (10% opacity)
- Data visualization hints

Colors: Dark premium base, accent for stats

Technical: No numbers, no text, no product
`,
    },

    // =========================================
    // 14. BUNDLE DEAL - Package Offer
    // =========================================
    bundle_deal: {
        id: 'bundle_deal',
        name: 'Bundle Deal',
        category: 'offer',
        description: 'Multiple products bundled together',
        bestFor: ['bundles', 'packages', 'kits'],

        canvas: { width: 1080, height: 1080 },

        zones: {
            headline: {
                x: 0.04,
                y: 0.02,
                width: 0.92,
                fontSize: '3xl',
                align: 'center',
            },
            bundle_badge: {
                x: 0.30,
                y: 0.14,
                width: 0.40,
                height: 44,
                style: 'bundle',
            },
            main_product: {
                x: 0.22,
                y: 0.20,
                width: 0.56,
                height: 0.40,
                shadow: 'xl',
            },
            secondary_products: {
                positions: [
                    { x: 0.08, y: 0.62, width: 0.26, height: 0.22 },
                    { x: 0.37, y: 0.62, width: 0.26, height: 0.22 },
                    { x: 0.66, y: 0.62, width: 0.26, height: 0.22 },
                ],
                shadow: 'md',
            },
            cta: {
                x: 0.22,
                y: 0.88,
                width: 0.56,
                height: 54,
                radius: 27,
            },
        },

        backgroundPrompt: `
Bundle/package deal background (1080x1080).

LAYOUT:
- Top: Large hero product area (EMPTY)
- Bottom row: 3 smaller product areas (EMPTY)

STYLE:
- Premium package feel
- Subtle connecting elements between products
- Value proposition vibes

Colors: Dark premium, accent for value

Technical: No products, no text, no prices
`,
    },

    // =========================================
    // 15. MINIMALIST BRAND - Ultra Clean
    // =========================================
    minimalist_brand: {
        id: 'minimalist_brand',
        name: 'Minimalist Brand',
        category: 'brand',
        description: 'Maximum whitespace, brand focus',
        bestFor: ['luxury', 'fashion', 'premium_brands'],

        canvas: { width: 1080, height: 1080 },

        zones: {
            product: {
                x: 0.25,
                y: 0.25,
                width: 0.50,
                height: 0.50,
                shadow: 'lg',
            },
            brand_name: {
                x: 0.20,
                y: 0.80,
                width: 0.60,
                fontSize: 'xl',
                align: 'center',
                style: 'brand',
            },
        },

        backgroundPrompt: `
Ultra-minimalist brand background (1080x1080).

STYLE:
- Pure, clean, maximum whitespace
- Subtle gradient (near-white to white)
- Absolutely no distractions

CENTER 50%: EMPTY for product

This is museum-level minimalism.
Think: Céline, Apple, Aesop

Technical: No text, no product, no elements
`,
    },
};

// ============================================================
// TEMPLATE SELECTION LOGIC
// ============================================================

export function selectOptimalTemplate(options) {
    const {
        industry,
        goal,
        features = [],
        hasTestimonial,
        hasSale,
        productCount = 1,
        format = 'square',
    } = options;

    // Story format
    if (format === 'story' || format === '9:16') {
        return ELITE_TEMPLATES_2026.stacked_vertical;
    }

    // Multi-product
    if (productCount > 1 && productCount <= 4) {
        return ELITE_TEMPLATES_2026.grid_collection;
    }
    if (productCount > 2) {
        return ELITE_TEMPLATES_2026.bundle_deal;
    }

    // Sale/Promotion
    if (hasSale || goal === 'sale' || goal === 'promotion') {
        return ELITE_TEMPLATES_2026.discount_urgency;
    }

    // Testimonial
    if (hasTestimonial) {
        return ELITE_TEMPLATES_2026.testimonial_focus;
    }

    // Industry-specific
    if (industry === 'gaming' || industry === 'esports' || industry === 'tech') {
        return ELITE_TEMPLATES_2026.gaming_showcase;
    }

    if (industry === 'fashion' || industry === 'luxury') {
        return ELITE_TEMPLATES_2026.minimalist_brand;
    }

    if (industry === 'home_decor' || industry === 'lifestyle') {
        return ELITE_TEMPLATES_2026.lifestyle_context;
    }

    // Feature-based
    if (features.length >= 4) {
        return ELITE_TEMPLATES_2026.feature_callouts;
    }

    if (features.length >= 2) {
        return ELITE_TEMPLATES_2026.hero_split;
    }

    // Default: Centered Hero
    return ELITE_TEMPLATES_2026.centered_hero;
}

// ============================================================
// GET TEMPLATE BY ID
// ============================================================

export function getTemplateById(templateId) {
    return ELITE_TEMPLATES_2026[templateId] || ELITE_TEMPLATES_2026.hero_split;
}

// ============================================================
// LIST ALL TEMPLATES
// ============================================================

export function listAllTemplates() {
    return Object.values(ELITE_TEMPLATES_2026).map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        description: t.description,
        bestFor: t.bestFor,
    }));
}

// ============================================================
// EXPORTS
// ============================================================

export default {
    TYPOGRAPHY_2026,
    SPACING_2026,
    SHADOWS_2026,
    ELITE_TEMPLATES_2026,
    selectOptimalTemplate,
    getTemplateById,
    listAllTemplates,
};
