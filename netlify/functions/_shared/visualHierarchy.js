/**
 * Visual Hierarchy System
 * Eye-tracking patterns, focal points, visual flow
 * Ensures ads guide viewer's eye to conversion
 */

/**
 * Eye-Flow Patterns - How people scan ads
 */
export const EYE_FLOW_PATTERNS = {
    z_pattern: {
        id: 'z_pattern',
        name: 'Z-Pattern',
        description: 'Eye moves in Z shape: top-left → top-right → bottom-left → bottom-right',
        usage: 'Best for ads with headline, image, and CTA in standard positions',
        composition: {
            topLeft: 'Logo or headline hook (start point)',
            topRight: 'Price or key value (secondary attention)',
            center: 'Hero image (main content)',
            bottomLeft: 'Features or benefits',
            bottomRight: 'CTA button (end point - conversion)',
        },
        promptEnhancement: `Z-pattern composition optimized for natural eye flow:
- Top-left: Start with attention hook (logo, bold text, or intriguing element)
- Eye naturally moves right across the top
- Diagonal scan to bottom-left
- Ends at bottom-right where CTA should be placed
- Critical: Position CTA at bottom-right as the natural endpoint`,
    },

    f_pattern: {
        id: 'f_pattern',
        name: 'F-Pattern',
        description: 'Eye scans horizontally then drops, similar to reading',
        usage: 'Best for text-heavy ads or feature lists',
        composition: {
            topRow: 'Headline scanned left-to-right',
            secondRow: 'Subheadline or first benefit',
            leftEdge: 'Vertical scan of bullet points or features',
            scanArea: 'Right side gets less attention',
        },
        promptEnhancement: `F-pattern composition for text-heavy content:
- First row (full width): Main headline - gets most attention
- Second row: Key benefit or hook
- Left edge preferred for important text (features, bullets)
- Place decorative elements on right (less scanned)
- Keep critical info on left 2/3 of image`,
    },

    triangle: {
        id: 'triangle',
        name: 'Triangle/Pyramid',
        description: 'Single focal point with supporting elements forming triangle',
        usage: 'Best for product-hero ads',
        composition: {
            apex: 'Product or hero image (central focus)',
            baseLeft: 'Supporting info (features or price)',
            baseRight: 'CTA or social proof',
        },
        promptEnhancement: `Triangle/pyramid composition:
- Apex: Central hero element (product) commands attention
- Base expands outward with supporting elements
- Creates natural stability and visual harmony
- Eye drawn to peak, then explores base corners
- Place product at visual "apex" position`,
    },

    rule_of_thirds: {
        id: 'rule_of_thirds',
        name: 'Rule of Thirds',
        description: 'Key elements at intersection points of 3x3 grid',
        usage: 'Universal, works for most compositions',
        composition: {
            intersectionPoints: 'Place key elements at crossing points',
            leftThird: 'Product or human subject',
            rightThird: 'Text or negative space for copy',
            verticalBalance: 'Divide horizontal space for visual rhythm',
        },
        promptEnhancement: `Rule of thirds composition:
- Divide frame into 3x3 grid
- Place key elements at intersection points (power points)
- off-center placement more dynamic than centered
- Product at left vertical third
- Text/CTA aligned with right third
- Creates professional, balanced composition`,
    },

    centered: {
        id: 'centered',
        name: 'Centered/Symmetrical',
        description: 'Product centered, symmetrical layout radiates outward',
        usage: 'Best for product-focused minimal ads',
        composition: {
            center: 'Product as absolute hero',
            surrounding: 'Symmetrical feature callouts',
            corners: 'Badges, logos, or subtle accents',
        },
        promptEnhancement: `Centered symmetrical composition:
- Product at exact center commanding full attention
- Surrounding elements radiate symmetrically
- Creates premium, museum-like quality
- Perfect for feature callout diagrams
- Minimal distraction, maximum product focus`,
    },

    diagonal: {
        id: 'diagonal',
        name: 'Dynamic Diagonal',
        description: 'Elements arranged on diagonal line for energy',
        usage: 'Best for action, sports, dynamic products',
        composition: {
            diagonal: 'Product or action along diagonal axis',
            corners: 'Counterbalance with text or elements',
            movement: 'Creates sense of action and dynamism',
        },
        promptEnhancement: `Dynamic diagonal composition:
- Primary element on diagonal axis (top-left to bottom-right OR top-right to bottom-left)
- Creates energy, movement, action
- Counter-balance corners for stability
- Great for sports, fitness, action products
- Avoid static, centered feel`,
    },
};

/**
 * Focal Point Techniques
 */
export const FOCAL_POINT_TECHNIQUES = {
    contrast: {
        name: 'Contrast',
        description: 'Bright/dark contrast draws attention',
        application: 'Product should be highest contrast area',
        promptHint: 'Product area has highest contrast (brightest against dark or vice versa)',
    },
    color: {
        name: 'Color Pop',
        description: 'Saturated color against muted background',
        application: 'Product in vibrant color, background desaturated',
        promptHint: 'Product is most saturated element, background more muted',
    },
    isolation: {
        name: 'Isolation',
        description: 'Negative space surrounds focal point',
        application: 'Product surrounded by breathing room',
        promptHint: 'Clear negative space around product, no visual clutter',
    },
    size: {
        name: 'Size Hierarchy',
        description: 'Largest element draws first attention',
        application: 'Product is largest visual element',
        promptHint: 'Product takes 40-60% of frame, larger than any other element',
    },
    depth: {
        name: 'Depth/Focus',
        description: 'Sharp focus vs blur creates depth',
        application: 'Product sharp, background with subtle blur',
        promptHint: 'Product perfectly sharp, background with very subtle depth-of-field blur',
    },
    leading_lines: {
        name: 'Leading Lines',
        description: 'Visual lines guide eye to focal point',
        application: 'Arrows, lines, shapes point to product',
        promptHint: 'Visual elements (lines, arrows, gestures) guide eye toward product',
    },
};

/**
 * Visual Hierarchy Levels
 */
export const HIERARCHY_LEVELS = {
    primary: {
        level: 1,
        elements: ['headline', 'product', 'main offer'],
        style: 'Largest, boldest, highest contrast',
        attention: '60% of initial focus',
    },
    secondary: {
        level: 2,
        elements: ['subheadline', 'features', 'price'],
        style: 'Medium size, clear but not dominant',
        attention: '25% of focus',
    },
    tertiary: {
        level: 3,
        elements: ['CTA', 'badge', 'social proof'],
        style: 'Smaller but actionable',
        attention: '10% of focus',
    },
    subtle: {
        level: 4,
        elements: ['logo', 'fine print', 'decorative'],
        style: 'Smallest, subtle presence',
        attention: '5% of focus',
    },
};

/**
 * Build visual hierarchy prompt
 */
export function buildVisualHierarchyPrompt(patternId, options = {}) {
    const pattern = EYE_FLOW_PATTERNS[patternId] || EYE_FLOW_PATTERNS.rule_of_thirds;
    const { primaryElement, secondaryElements, cta } = options;

    return `
VISUAL HIERARCHY (Critical for Conversion):

Eye-Flow Pattern: ${pattern.name}
${pattern.promptEnhancement}

HIERARCHY LEVELS:
1. PRIMARY (60% attention): ${primaryElement || 'Product hero'}
   - Largest, boldest, highest contrast
   - Eye lands here first
   
2. SECONDARY (25% attention): ${secondaryElements?.join(', ') || 'Features, benefits'}
   - Supports primary, doesn't compete
   - Clear but subordinate

3. TERTIARY (10% attention): ${cta || 'CTA, badge'}
   - Action elements - where conversion happens
   - Clearly visible but doesn't steal from product

4. SUBTLE (5% attention): Logo, decorative
   - Minimal presence
   - Brand recognition without distraction

FOCAL POINT TECHNIQUES:
- Use CONTRAST to make product pop
- ISOLATION with negative space
- SIZE hierarchy (product largest)
- LEADING LINES pointing to product
`;
}

/**
 * Recommend pattern based on ad type
 */
export function recommendPattern(adType) {
    const typeToPattern = {
        'feature-callout': 'centered',
        'product-hero': 'triangle',
        'text-heavy': 'f_pattern',
        'standard': 'z_pattern',
        'action': 'diagonal',
        'minimal': 'rule_of_thirds',
        'editorial': 'rule_of_thirds',
    };

    const patternId = typeToPattern[adType] || 'z_pattern';
    return EYE_FLOW_PATTERNS[patternId];
}

/**
 * Validate composition against pattern
 */
export function validateComposition(elements) {
    const warnings = [];

    // Check for CTA position
    if (elements.ctaPosition === 'top-left') {
        warnings.push('CTA at top-left may be suboptimal - eye starts here, not ends');
    }

    // Check for product visibility
    if (elements.productSize < 30) {
        warnings.push('Product may be too small - recommend 40-60% of frame');
    }

    // Check for text density
    if (elements.textDensity > 20) {
        warnings.push('Too much text may reduce ad reach - keep under 20%');
    }

    return {
        valid: warnings.length === 0,
        warnings,
    };
}
