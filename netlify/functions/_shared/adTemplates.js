/**
 * AD TEMPLATES - REFERENCE-LEVEL DESIGNS
 * 
 * 7 template types based on 45 analyzed reference ads.
 * Each template has pixel-precise layout specifications.
 */

/**
 * Template definitions with layouts for 1080x1080 canvas
 */
export const AD_TEMPLATES = {

    // ═══════════════════════════════════════════════════════════════════════
    // TEMPLATE 1: FEATURE CALLOUTS
    // Example: Jungle Shoes with arrows pointing to features
    // ═══════════════════════════════════════════════════════════════════════
    feature_callouts: {
        name: "Feature Callouts",
        description: "Product hero with 3-4 curved arrows pointing to key features",
        bestFor: ["shoes", "electronics", "tools", "gadgets", "products with visible features"],
        layout: {
            headline: { x: 540, y: 80, fontSize: 48, fontWeight: 700, color: "#FFFFFF" },
            tagline: { x: 540, y: 130, fontSize: 22, fontWeight: 400, color: "#CCCCCC" },
            product: { x: 540, y: 500, width: 600, height: 600 },
            callouts: [
                { position: "top-left", x: 150, y: 280, arrowAngle: 45 },
                { position: "top-right", x: 930, y: 320, arrowAngle: -45 },
                { position: "bottom-left", x: 150, y: 720, arrowAngle: -30 },
                { position: "bottom-right", x: 930, y: 680, arrowAngle: 30 }
            ],
            cta: { x: 540, y: 980, width: 200, height: 50 }
        },
        prompt: `Create a 1080x1080 FEATURE CALLOUT advertisement.

LAYOUT:
- HEADLINE at top center (540, 80): Bold, 48px, white with drop shadow
- PRODUCT centered (540, 500): approx 600px, hero positioning with professional lighting
- 3-4 FEATURE CALLOUTS with curved arrows pointing to product features:
  • Top-left callout (150, 280) with curved arrow pointing to a feature
  • Top-right callout (930, 320) with curved arrow pointing to a feature  
  • Bottom-left callout (150, 720) with curved arrow pointing to a feature
- CTA BUTTON at bottom center (540, 980): pill shape, accent color, white text

CALLOUT STYLE:
- Either circular badges with text labels
- OR simple white text with elegant curved arrows
- Font: 16-18px, legible against background
- Arrows should elegantly curve from text to product feature

BACKGROUND:
- Gradient or lifestyle context that complements product
- Professional studio lighting effect
- Subtle vignette at edges

QUALITY: Agency-level, Meta 2026 standard, perfectly readable text.`
    },

    // ═══════════════════════════════════════════════════════════════════════
    // TEMPLATE 2: STAT-BASED
    // Example: AG1 "70% of your immune system lives in your gut"
    // ═══════════════════════════════════════════════════════════════════════
    stat_based: {
        name: "Stat-Based",
        description: "Large statistic as hook with supporting copy",
        bestFor: ["health", "supplements", "SaaS", "finance", "fitness"],
        layout: {
            logo: { x: 540, y: 60, height: 40 },
            statistic: { x: 540, y: 200, fontSize: 120, fontWeight: 800 },
            supportingText: { x: 540, y: 300, fontSize: 32, fontWeight: 500 },
            product: { x: 540, y: 580, width: 500 },
            benefits: { y: 800, columns: 3 },
            disclaimer: { x: 540, y: 1050, fontSize: 10 }
        },
        prompt: `Create a 1080x1080 STAT-BASED advertisement.

LAYOUT:
- LOGO/BRAND at top center (540, 60): small, 40px height
- BIG STATISTIC (540, 200): HUGE font (100-120px), bold, eye-catching
  Examples: "70%", "3x", "$1/day", "10M+"
- SUPPORTING TEXT below stat (540, 300): 28-32px, explains the statistic
- PRODUCT in middle area (540, 580): ~500px wide, professional shot
- 3 BENEFIT COLUMNS at bottom (y: 800):
  • Benefit 1 with icon/number
  • Benefit 2 with icon/number
  • Benefit 3 with icon/number
- Small DISCLAIMER at very bottom (540, 1050): 10px, subtle

COLOR SCHEME:
- Clean, professional (white/cream or brand colors)
- The statistic should POP - use contrasting color

STYLE: Clean, trustworthy, data-driven, premium.`
    },

    // ═══════════════════════════════════════════════════════════════════════
    // TEMPLATE 3: US VS THEM (Comparison)
    // Example: Javy Coffee vs Coffee Shops
    // ═══════════════════════════════════════════════════════════════════════
    us_vs_them: {
        name: "Us vs Them",
        description: "Split-screen comparison with checkmarks and X marks",
        bestFor: ["coffee", "food", "subscriptions", "services", "any differentiated product"],
        layout: {
            leftSide: { x: 270, width: 540, color: "#E8F4FD" },
            rightSide: { x: 810, width: 540, color: "#FDF2E8" },
            leftTitle: { x: 270, y: 100, fontSize: 32 },
            rightTitle: { x: 810, y: 100, fontSize: 32 },
            leftProduct: { x: 270, y: 400, width: 280 },
            rightProduct: { x: 810, y: 400, width: 280 },
            leftBenefits: { x: 50, y: 680, items: 5 },
            rightProblems: { x: 560, y: 680, items: 5 }
        },
        prompt: `Create a 1080x1080 US VS THEM comparison advertisement.

LAYOUT - SPLIT SCREEN:
LEFT SIDE (0-540px, light blue/positive tint):
- "Us" title at top-left (270, 100): Product name, 32px, bold
- Our PRODUCT (270, 400): 280px wide, well-lit
- 4-5 BENEFITS with GREEN CHECKMARKS (✓):
  • ✓ Benefit 1
  • ✓ Benefit 2
  • ✓ Benefit 3
  • ✓ Benefit 4
  • ✓ Benefit 5

RIGHT SIDE (540-1080px, light orange/negative tint):
- "Them" title at top-right (810, 100): Competitor type, 32px
- Their PRODUCT (810, 400): 280px wide, less appealing
- 4-5 PROBLEMS with RED X MARKS (✗):
  • ✗ Problem 1
  • ✗ Problem 2
  • ✗ Problem 3
  • ✗ Problem 4
  • ✗ Problem 5

DIVIDER: Subtle vertical line or gradient at center (540px)

STYLE: Clear comparison, makes the choice obvious, persuasive.`
    },

    // ═══════════════════════════════════════════════════════════════════════
    // TEMPLATE 4: PROCESS/STEPS
    // Example: Curology 4-step skincare
    // ═══════════════════════════════════════════════════════════════════════
    process_steps: {
        name: "Process Steps",
        description: "Numbered 3-4 step process with images",
        bestFor: ["skincare", "services", "subscriptions", "onboarding", "how-it-works"],
        layout: {
            headline: { x: 540, y: 60, fontSize: 36 },
            grid: "2x2",
            steps: [
                { x: 270, y: 320, number: 1 },
                { x: 810, y: 320, number: 2 },
                { x: 270, y: 680, number: 3 },
                { x: 810, y: 680, number: 4 }
            ],
            offerBadge: { x: 900, y: 520, width: 140 },
            disclaimer: { x: 540, y: 1050, fontSize: 10 }
        },
        prompt: `Create a 1080x1080 PROCESS STEPS advertisement.

LAYOUT:
- HEADLINE at top (540, 60): 36px, bold, value proposition
- 4 STEPS in 2x2 GRID layout:

  STEP 1 (top-left, 270, 320):
  - Large number "1" in colored circle
  - Small image/icon
  - Short description (2-3 words)

  STEP 2 (top-right, 810, 320):
  - Large number "2" in colored circle
  - Small image/icon
  - Short description

  STEP 3 (bottom-left, 270, 680):
  - Large number "3" in colored circle
  - Small image/icon
  - Short description

  STEP 4 (bottom-right, 810, 680):
  - Large number "4" in colored circle
  - Product image
  - Short description

- OFFER BADGE (900, 520): Circular, contains price/offer
- Optional PRODUCT in center connecting all steps

BACKGROUND: Light, clean (white or pastel)
STYLE: Easy to follow, clear progression, friendly.`
    },

    // ═══════════════════════════════════════════════════════════════════════
    // TEMPLATE 5: BEFORE/AFTER
    // Example: Toast comparison "Work Smart Not Hard"
    // ═══════════════════════════════════════════════════════════════════════
    before_after: {
        name: "Before/After",
        description: "Side-by-side transformation comparison",
        bestFor: ["fitness", "skincare", "cleaning", "organization", "productivity"],
        layout: {
            headline: { x: 540, y: 80, fontSize: 48 },
            beforeImage: { x: 270, y: 480, width: 350 },
            afterImage: { x: 810, y: 480, width: 350 },
            beforeLabel: { x: 270, y: 750, fontSize: 24 },
            afterLabel: { x: 810, y: 750, fontSize: 24 },
            cta: { x: 540, y: 980, width: 240 }
        },
        prompt: `Create a 1080x1080 BEFORE/AFTER comparison advertisement.

LAYOUT:
- HEADLINE at top center (540, 80): 48px, bold, punchy statement
  Example: "Work Smart. Not Hard."

- BEFORE IMAGE (left side, 270, 480):
  • 350px wide
  • Shows the "problem" state
  • Slightly desaturated or less appealing

- AFTER IMAGE (right side, 810, 480):
  • 350px wide  
  • Shows the "solution" state
  • Vibrant, appealing

- BEFORE LABEL (270, 750): 
  • "YOU WITHOUT [product]"
  • Red/negative color accent

- AFTER LABEL (810, 750):
  • "YOU WITH [product]"
  • Green/positive color accent

- CTA at bottom center (540, 980): Contains offer/badge

BACKGROUND: Clean, minimal (white or light gray)
STYLE: Clear transformation, obvious improvement.`
    },

    // ═══════════════════════════════════════════════════════════════════════
    // TEMPLATE 6: MULTI-PRODUCT GRID
    // Example: Happy Hippie supplement collage
    // ═══════════════════════════════════════════════════════════════════════
    multi_product_grid: {
        name: "Multi-Product Grid",
        description: "Product collage with center CTA card",
        bestFor: ["product lines", "bundles", "retargeting", "cross-sell", "collections"],
        layout: {
            grid: "3x3 with center card",
            centerCard: { x: 540, y: 540, width: 350, height: 250 },
            products: [
                { x: 180, y: 180 }, { x: 540, y: 180 }, { x: 900, y: 180 },
                { x: 180, y: 540 }, { x: 900, y: 540 },
                { x: 180, y: 900 }, { x: 540, y: 900 }, { x: 900, y: 900 }
            ]
        },
        prompt: `Create a 1080x1080 MULTI-PRODUCT GRID advertisement.

LAYOUT - 3x3 GRID:
- 8 PRODUCT LIFESTYLE SHOTS around the edges:
  • Top row: Product 1 (180,180), Product 2 (540,180), Product 3 (900,180)
  • Middle row: Product 4 (180,540), [CENTER CARD], Product 5 (900,540)
  • Bottom row: Product 6 (180,900), Product 7 (540,900), Product 8 (900,900)

- Each product shot: ~320x320px, lifestyle context (plants, fabric, lifestyle props)

- CENTER CARD (540, 540): 350x250px
  • Clean background (cream/white)
  • Headline: "Time for a refill?" or offer text
  • Subtext with value proposition
  • CTA: "Save Now!" or action text
  • Accent color for CTA

GRID STYLING:
- Small gaps between images (10-15px)
- Each product image should feel lifestyle/editorial

STYLE: Editorial, premium lifestyle brand feel.`
    },

    // ═══════════════════════════════════════════════════════════════════════
    // TEMPLATE 7: HERO PRODUCT (Default)
    // The fallback premium product ad
    // ═══════════════════════════════════════════════════════════════════════
    hero_product: {
        name: "Hero Product",
        description: "Single product hero shot with premium styling",
        bestFor: ["default", "single product", "product launch", "any"],
        layout: {
            headline: { x: 540, y: 100, fontSize: 64 },
            tagline: { x: 540, y: 170, fontSize: 24 },
            product: { x: 540, y: 520, width: 600 },
            cta: { x: 540, y: 970, width: 220 }
        },
        prompt: `Create a 1080x1080 HERO PRODUCT advertisement.

LAYOUT:
- HEADLINE at top center (540, 100): 
  • 64px, bold, white
  • Modern sans-serif font
  • Drop shadow for depth

- TAGLINE below headline (540, 170):
  • 24px, lighter weight
  • Gray or white, 80% opacity

- PRODUCT in center (540, 520):
  • 600px wide, hero positioning
  • Professional studio lighting from top-left
  • Subtle reflection below (20% opacity)
  • Very subtle glow around product edges

- CTA BUTTON at bottom (540, 970):
  • 220x56px, pill shape (28px radius)
  • Gradient background (accent color)
  • White bold text, 18px
  • Glow effect: 0 0 20px accent at 50%
  • Shadow: 0 8px 24px rgba(0,0,0,0.3)

BACKGROUND:
- Deep gradient (dark navy to darker)
- Subtle radial glow at center
- Optional: subtle particle/dust effect

STYLE: Premium, modern, high-converting Meta 2026 standard.`
    }
};

/**
 * Auto-select optimal template based on product analysis and user prompt
 */
export function selectOptimalTemplate(productAnalysis, userPrompt, industry) {
    const prompt = (userPrompt || '').toLowerCase();
    const productType = (productAnalysis?.productType || '').toLowerCase();

    // Check user prompt for explicit template hints
    if (prompt.includes('feature') || prompt.includes('arrow') || prompt.includes('callout')) {
        return 'feature_callouts';
    }
    if (prompt.includes('vs') || prompt.includes('versus') || prompt.includes('compare') || prompt.includes('them')) {
        return 'us_vs_them';
    }
    if (prompt.includes('step') || prompt.includes('process') || prompt.includes('how')) {
        return 'process_steps';
    }
    if (prompt.includes('before') || prompt.includes('after') || prompt.includes('transform')) {
        return 'before_after';
    }
    if (prompt.includes('grid') || prompt.includes('collage') || prompt.includes('multiple') || prompt.includes('bundle')) {
        return 'multi_product_grid';
    }
    if (prompt.includes('stat') || prompt.includes('%') || prompt.includes('number')) {
        return 'stat_based';
    }

    // Auto-select based on industry
    const industryTemplates = {
        'health': 'stat_based',
        'supplements': 'stat_based',
        'fitness': 'before_after',
        'skincare': 'process_steps',
        'beauty': 'process_steps',
        'food': 'us_vs_them',
        'coffee': 'us_vs_them',
        'shoes': 'feature_callouts',
        'electronics': 'feature_callouts',
        'tech': 'feature_callouts',
        'saas': 'hero_product',
        'software': 'hero_product'
    };

    if (industry && industryTemplates[industry.toLowerCase()]) {
        return industryTemplates[industry.toLowerCase()];
    }

    // Default to hero_product
    return 'hero_product';
}

/**
 * Get template prompt with dynamic content
 */
export function getTemplatePrompt(templateKey, { headline, tagline, cta, accentColor, features }) {
    const template = AD_TEMPLATES[templateKey];
    if (!template) return AD_TEMPLATES.hero_product.prompt;

    let prompt = template.prompt;

    // Replace placeholders
    prompt = prompt.replace(/\[product\]/gi, 'the product');

    // Add dynamic text content
    prompt += `

═══════════════════════════════════════════════════════════════
TEXT CONTENT TO INCLUDE:
═══════════════════════════════════════════════════════════════
HEADLINE: "${headline || 'Premium Quality'}"
${tagline ? `TAGLINE: "${tagline}"` : ''}
CTA BUTTON TEXT: "${cta || 'Shop Now'}"
ACCENT COLOR: ${accentColor || '#FF4757'}

${features && features.length ? `FEATURES/BENEFITS TO HIGHLIGHT:
${features.map((f, i) => `${i + 1}. ${f}`).join('\n')}` : ''}

CRITICAL REQUIREMENTS:
- Text must be PERFECTLY SHARP and READABLE
- This should look like a $10,000 agency ad
- Use the uploaded image as the product
- Follow the layout specifications EXACTLY`;

    return prompt;
}

export default { AD_TEMPLATES, selectOptimalTemplate, getTemplatePrompt };
