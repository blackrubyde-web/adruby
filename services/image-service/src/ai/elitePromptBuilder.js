/**
 * Elite Prompt Builder
 * 
 * Builds premium 500+ word prompts for Gemini based on:
 * - Product analysis from GPT-4V
 * - Design patterns from successful Foreplay ads
 * - Content requirements (headline, features, CTA)
 */

/**
 * Layout templates based on top-performing ad patterns
 */
const LAYOUT_TEMPLATES = {
    hero_centered: {
        name: 'Hero Centered',
        description: 'Product center stage with bold headline above',
        productPosition: 'center, occupying 45-55% of frame',
        headlinePosition: 'top center, large and bold (64-72px)',
        ctaPosition: 'bottom center, prominent button',
        bestFor: ['single product', 'luxury', 'tech']
    },
    feature_callout: {
        name: 'Feature Callout',
        description: 'Product with labeled feature points radiating outward',
        productPosition: 'center, slightly smaller (40% of frame)',
        headlinePosition: 'top left or top center',
        features: 'positioned around product with dotted lines connecting',
        ctaPosition: 'bottom center',
        bestFor: ['tech products', 'products with multiple features', 'educational']
    },
    stats_showcase: {
        name: 'Stats Showcase',
        description: 'Product with impressive statistics positioned around',
        productPosition: 'center',
        stats: 'large numbers with labels positioned left/right of product',
        headlinePosition: 'top center',
        ctaPosition: 'bottom center',
        bestFor: ['supplements', 'fitness', 'results-driven products']
    },
    lifestyle_context: {
        name: 'Lifestyle Context',
        description: 'Product shown in aspirational setting',
        productPosition: 'integrated into scene naturally',
        headlinePosition: 'top with gradient overlay for readability',
        ctaPosition: 'bottom with slight blur behind',
        bestFor: ['fashion', 'home', 'beauty', 'aspirational products']
    },
    comparison: {
        name: 'Before/After or Us vs Them',
        description: 'Split layout showing transformation or comparison',
        productPosition: 'one side of split',
        headlinePosition: 'across top or in center divider',
        bestFor: ['beauty', 'fitness', 'cleaning products', 'services']
    }
};

/**
 * Build elite prompt for complete ad generation
 */
export function buildElitePrompt({
    productAnalysis,
    patterns,
    headline,
    tagline,
    features = [],
    stats = [],
    cta,
    industry
}) {
    // Select best layout based on content and patterns
    const layout = selectLayout(patterns, features, stats, productAnalysis);
    const template = LAYOUT_TEMPLATES[layout];

    console.log('[ElitePrompt] Building prompt for layout:', template.name);

    // Build color instructions
    const colors = buildColorInstructions(productAnalysis, industry);

    // Build the mega-prompt
    const prompt = `
=== PREMIUM META AD GENERATION ===
Create a COMPLETE, READY-TO-USE Meta advertisement.
This must look like it was created by a $50,000/month creative agency.

=== CANVAS ===
Dimensions: 1080x1080 pixels (Instagram Feed)
Style: Premium, conversion-optimized, scroll-stopping

=== LAYOUT: ${template.name} ===
${template.description}

=== PRODUCT ===
Name: ${productAnalysis.productName || 'Premium Product'}
Type: ${productAnalysis.productType || 'Product'}
Target Audience: ${productAnalysis.targetAudience || 'Quality-conscious consumers'}
Emotional Hook: ${productAnalysis.emotionalHook || 'Premium quality and value'}

Product Placement:
- Position: ${template.productPosition}
- The product must be the HERO of the ad
- Use professional lighting: three-point setup with rim lighting
- Add subtle drop shadow for depth
- Product should pop but feel natural

=== TEXT ELEMENTS (MUST BE RENDERED IN IMAGE) ===

HEADLINE: "${headline || productAnalysis.suggestedHeadlines?.[0] || 'Premium Quality'}"
- Position: ${template.headlinePosition}
- Font: Modern sans-serif (like Inter or Poppins)
- Size: 64-72px for primary headline
- Weight: Bold (700-900)
- Color: ${colors.textPrimary}
- MUST have subtle text shadow for visibility
- Text must be CRYSTAL CLEAR and READABLE

${tagline ? `TAGLINE: "${tagline}"
- Position: Below headline
- Size: 24-28px
- Weight: Regular (400)
- Color: ${colors.textSecondary}
` : ''}

${features.length > 0 ? `FEATURES (with callout lines):
${features.map((f, i) => `${i + 1}. "${f}" - Position around product with dotted connector line`).join('\n')}
- Each feature has a small circle marker on the product
- Dotted lines connect markers to labels
- Font size: 16-18px
- Color: ${colors.textPrimary}
` : ''}

${stats.length > 0 ? `STATISTICS:
${stats.map((s, i) => `${i + 1}. "${s.value || s}" ${s.label ? `(${s.label})` : ''}`).join('\n')}
- Large, bold numbers (48-56px)
- Smaller labels below (14-16px)
- Position on sides of product
` : ''}

CTA BUTTON: "${cta || 'Shop Now'}"
- Position: ${template.ctaPosition}
- Style: Pill-shaped button
- Background: ${colors.ctaBackground}
- Text: White, bold, 18-20px
- Slight shadow for depth
- Width: Auto-fit text with generous padding (40px horizontal)

=== VISUAL STYLE ===
Background:
- ${colors.backgroundDescription}
- Subtle vignette around edges
- Optional: Soft bokeh elements or particles

Lighting:
- Professional studio lighting
- Key light from upper left or right
- Fill light for shadow softness  
- Rim/back light for product separation

Effects:
- Product glow effect (subtle, matching accent color)
- Depth of field: Product sharp, background soft
- Color grading: Premium, high-contrast look

=== COLOR PALETTE ===
Primary: ${colors.primary}
Secondary: ${colors.secondary}
Background: ${colors.background}
Text: ${colors.textPrimary}
Accent/CTA: ${colors.accent}

=== QUALITY REQUIREMENTS ===
- This must look like a REAL professional Meta ad
- No generic AI look - must appear hand-crafted
- Text must be perfectly legible (no blur, no artifacts)
- All elements properly aligned and balanced
- Scroll-stopping first impression
- Clear visual hierarchy: Headline → Product → Features → CTA

=== REFERENCE PATTERNS ===
Based on analysis of ${patterns.headlines?.length || 5}+ high-performing ads:
- Layout preference: ${patterns.layouts?.[0] || 'hero_centered'}
- Average text density: ${patterns.averageTextDensity || 'medium'}
- Style tendency: ${patterns.dominantStyle || 'bold'}
${patterns.elements?.hasFeatureCallouts ? '- Feature callouts with connector lines are effective' : ''}
${patterns.elements?.hasStats ? '- Bold statistics drive engagement' : ''}
${patterns.elements?.hasBadges ? '- Trust badges increase conversion' : ''}

=== OUTPUT ===
Generate a COMPLETE ad image with ALL text elements rendered.
The result should be immediately usable for Meta advertising.
`.trim();

    console.log('[ElitePrompt] Generated prompt:', prompt.length, 'chars');

    return {
        prompt,
        layout,
        template,
        colors
    };
}

/**
 * Select best layout based on content and patterns
 */
function selectLayout(patterns, features, stats, productAnalysis) {
    // Content-based selection (strongest signal)
    if (features.length >= 3) return 'feature_callout';
    if (stats.length >= 2) return 'stats_showcase';

    // Pattern-based selection
    if (patterns.layouts?.length > 0) {
        const preferredLayout = patterns.layouts[0];
        if (LAYOUT_TEMPLATES[preferredLayout]) {
            return preferredLayout;
        }
    }

    // Product type fallback
    const styleMap = {
        figurine: 'hero_centered',
        tech: 'feature_callout',
        beauty: 'lifestyle_context',
        fashion: 'lifestyle_context',
        fitness: 'stats_showcase',
        food: 'hero_centered'
    };

    return styleMap[productAnalysis.productType] || 'hero_centered';
}

/**
 * Build color instructions based on product and industry
 */
function buildColorInstructions(productAnalysis, industry) {
    // Use product's own colors when available
    const productColors = productAnalysis.colorPalette || [];
    const style = productAnalysis.adStyle || 'bold';

    // Default palettes by style
    const palettes = {
        bold: {
            primary: '#FF4757',
            secondary: '#2F3542',
            accent: '#FF4757',
            background: '#0F0F1A',
            backgroundDescription: 'Deep dark gradient from #0F0F1A to #1A1A2E with subtle radial glow',
            textPrimary: '#FFFFFF',
            textSecondary: 'rgba(255,255,255,0.75)',
            ctaBackground: '#FF4757'
        },
        minimal: {
            primary: '#1A1A2E',
            secondary: '#4A4A5A',
            accent: '#2563EB',
            background: '#FFFFFF',
            backgroundDescription: 'Clean white to light gray (#F5F5F5) gradient',
            textPrimary: '#1A1A2E',
            textSecondary: 'rgba(26,26,46,0.7)',
            ctaBackground: '#1A1A2E'
        },
        playful: {
            primary: '#FF6B6B',
            secondary: '#4ECDC4',
            accent: '#FFE66D',
            background: '#2B2D42',
            backgroundDescription: 'Fun gradient with subtle color splashes',
            textPrimary: '#FFFFFF',
            textSecondary: 'rgba(255,255,255,0.85)',
            ctaBackground: '#FF6B6B'
        },
        luxury: {
            primary: '#C9A961',
            secondary: '#1A1A1A',
            accent: '#C9A961',
            background: '#0A0A0A',
            backgroundDescription: 'Deep black with subtle gold accent lighting',
            textPrimary: '#FFFFFF',
            textSecondary: 'rgba(255,255,255,0.8)',
            ctaBackground: '#C9A961'
        },
        techy: {
            primary: '#00D4FF',
            secondary: '#7B68EE',
            accent: '#00D4FF',
            background: '#0D1117',
            backgroundDescription: 'Dark tech gradient with cyan/purple accents',
            textPrimary: '#FFFFFF',
            textSecondary: 'rgba(255,255,255,0.75)',
            ctaBackground: '#00D4FF'
        },
        natural: {
            primary: '#2D5016',
            secondary: '#8B7355',
            accent: '#4A7C23',
            background: '#F5F1EB',
            backgroundDescription: 'Warm natural tones with earthy gradient',
            textPrimary: '#2D3436',
            textSecondary: 'rgba(45,52,54,0.75)',
            ctaBackground: '#4A7C23'
        }
    };

    const basePalette = palettes[style] || palettes.bold;

    // Override with product colors if available
    if (productColors.length > 0) {
        basePalette.primary = productColors[0];
        basePalette.accent = productColors[0];
        basePalette.ctaBackground = productColors[0];
    }

    return basePalette;
}

/**
 * Build a simple prompt for quick generation (fallback)
 */
export function buildSimplePrompt(headline, cta, style = 'dark') {
    return `Create a premium 1080x1080 Meta advertisement.
    
HEADLINE: "${headline}" - Large, bold, white text at top
CTA: "${cta}" - Red button at bottom
STYLE: ${style === 'dark' ? 'Dark gradient background' : 'Light clean background'}
QUALITY: Professional, agency-level, ready for Meta ads

Text must be perfectly clear and readable.`;
}

export default { buildElitePrompt, buildSimplePrompt, LAYOUT_TEMPLATES };
