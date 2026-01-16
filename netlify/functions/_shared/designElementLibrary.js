/**
 * Design Element Library - Graphic Elements for Designer-Level Ads
 * Defines all visual elements: arrows, lines, badges, shapes, icons
 * Used by the Composition Engine to build detailed image prompts
 */

/**
 * Arrow Styles - For feature callouts
 */
export const ARROW_STYLES = {
    curved_hand_drawn: {
        id: 'curved_hand_drawn',
        description: 'Casual, organic curved arrow with hand-drawn feel',
        promptFragment: 'curved hand-drawn style arrow, organic flowing line with arrowhead, casual sketch-like quality',
    },
    curved_smooth: {
        id: 'curved_smooth',
        description: 'Smooth bezier curve arrow, more professional',
        promptFragment: 'smooth curved arrow with elegant bezier curve, clean vector-style, professional finish',
    },
    straight_simple: {
        id: 'straight_simple',
        description: 'Simple straight arrow',
        promptFragment: 'simple straight arrow line with pointed arrowhead',
    },
    angled_bracket: {
        id: 'angled_bracket',
        description: 'Right-angle bracket style connection',
        promptFragment: 'right-angle bracket connector line, architectural style, clean corners',
    },
};

/**
 * Line Styles - For connections and dividers
 */
export const LINE_STYLES = {
    dotted: {
        id: 'dotted',
        description: 'Dotted line (---)',
        promptFragment: 'dotted line made of evenly spaced small dots, clean and technical',
    },
    dashed: {
        id: 'dashed',
        description: 'Dashed line (- - -)',
        promptFragment: 'dashed line with small gaps, technical drawing style',
    },
    solid_thin: {
        id: 'solid_thin',
        description: 'Thin solid line',
        promptFragment: 'thin solid line, 1-2px equivalent, subtle divider',
    },
    solid_medium: {
        id: 'solid_medium',
        description: 'Medium weight solid line',
        promptFragment: 'medium weight solid line, clear visual separator',
    },
};

/**
 * Marker Styles - Connection points
 */
export const MARKER_STYLES = {
    circle_outline: {
        id: 'circle_outline',
        description: 'Small outlined circle marker',
        promptFragment: 'small outlined circle marker (○), thin stroke, connection point indicator',
    },
    circle_filled: {
        id: 'circle_filled',
        description: 'Small filled circle marker',
        promptFragment: 'small filled circle dot marker (●), solid, connection point',
    },
    diamond: {
        id: 'diamond',
        description: 'Diamond shaped marker',
        promptFragment: 'small diamond shape marker (◇), elegant connection point',
    },
    plus: {
        id: 'plus',
        description: 'Plus/cross marker',
        promptFragment: 'small plus sign marker (+), technical style',
    },
};

/**
 * Badge Styles - Trust signals, awards, labels
 */
export const BADGE_STYLES = {
    ribbon_award: {
        id: 'ribbon_award',
        description: 'Award ribbon badge with tails',
        promptFragment: 'award ribbon badge with decorative ribbon tails hanging below, certificate/achievement style, can contain text and stars',
    },
    circle_seal: {
        id: 'circle_seal',
        description: 'Circular seal/stamp badge',
        promptFragment: 'circular seal badge like a stamp or certification mark, official/trusted appearance',
    },
    star_burst: {
        id: 'star_burst',
        description: 'Starburst/explosion badge',
        promptFragment: 'starburst explosion shape badge, dynamic and attention-grabbing, sale/promo style',
    },
    pill_tag: {
        id: 'pill_tag',
        description: 'Rounded pill-shaped tag',
        promptFragment: 'rounded pill-shaped tag/label, modern and clean, good for short text',
    },
    corner_fold: {
        id: 'corner_fold',
        description: 'Corner fold/ribbon',
        promptFragment: 'corner ribbon fold, positioned at top-right corner, diagonal banner style',
    },
    shield: {
        id: 'shield',
        description: 'Shield/crest badge',
        promptFragment: 'shield or crest shaped badge, trust and security signaling',
    },
};

/**
 * Shape Styles - Backgrounds, containers, CTAs
 */
export const SHAPE_STYLES = {
    rounded_rectangle: {
        id: 'rounded_rectangle',
        description: 'Rounded corner rectangle',
        promptFragment: 'rounded rectangle shape with soft corners, modern button/container style',
    },
    circle: {
        id: 'circle',
        description: 'Perfect circle',
        promptFragment: 'perfect circle shape, can be filled or outlined',
    },
    quarter_circle: {
        id: 'quarter_circle',
        description: 'Quarter circle (corner accent)',
        promptFragment: 'quarter circle shape in corner, used as CTA container or decorative element',
    },
    pill: {
        id: 'pill',
        description: 'Pill/capsule shape',
        promptFragment: 'pill or capsule shape, fully rounded ends, elongated',
    },
    blob: {
        id: 'blob',
        description: 'Organic blob shape',
        promptFragment: 'organic blob/amoeba shape, playful and modern, irregular soft curves',
    },
    hexagon: {
        id: 'hexagon',
        description: 'Hexagon shape',
        promptFragment: 'hexagonal shape, tech/modern feel',
    },
};

/**
 * Icon Styles - Feature indicators
 */
export const ICON_STYLES = {
    checkmark_square: {
        id: 'checkmark_square',
        description: 'Checkmark in square box',
        promptFragment: 'checkmark (✓) inside a small filled square box, benefit/feature indicator',
    },
    checkmark_circle: {
        id: 'checkmark_circle',
        description: 'Checkmark in circle',
        promptFragment: 'checkmark (✓) inside a circle, approval/success indicator',
    },
    star_filled: {
        id: 'star_filled',
        description: 'Filled 5-point star',
        promptFragment: 'filled 5-point star (★), rating/quality indicator',
    },
    star_outline: {
        id: 'star_outline',
        description: 'Outlined 5-point star',
        promptFragment: 'outlined 5-point star (☆), rating indicator',
    },
    cross_strike: {
        id: 'cross_strike',
        description: 'X or strike-through',
        promptFragment: 'X cross or strike-through symbol, "no" or negation indicator, often in circle',
    },
    arrow_right: {
        id: 'arrow_right',
        description: 'Right pointing arrow',
        promptFragment: 'right-pointing arrow (→), direction/CTA indicator',
    },
    character_simple: {
        id: 'character_simple',
        description: 'Simple character/mascot icon',
        promptFragment: 'simple cute character icon, stick-figure like with personality, playful brand mascot',
    },
};

/**
 * Background Styles
 */
export const BACKGROUND_STYLES = {
    solid_vibrant: {
        id: 'solid_vibrant',
        description: 'Solid vibrant color (orange, yellow, pink)',
        promptFragment: 'solid vibrant {COLOR} background, no gradients, clean and bold',
        colors: ['#F5A623', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
    },
    solid_pastel: {
        id: 'solid_pastel',
        description: 'Solid pastel color (mint, cream, light blue)',
        promptFragment: 'solid soft pastel {COLOR} background, calming and elegant',
        colors: ['#98D8C8', '#F7DC6F', '#AED6F1', '#F5B7B1', '#D7BDE2', '#FCF3CF', '#E8DAEF'],
    },
    solid_neutral: {
        id: 'solid_neutral',
        description: 'Solid neutral (cream, gray, off-white)',
        promptFragment: 'solid neutral {COLOR} background, sophisticated and minimal',
        colors: ['#F5F5F0', '#E5E5E5', '#FAFAFA', '#F0EAD6', '#DDD', '#C4C4C4'],
    },
    gradient_subtle: {
        id: 'gradient_subtle',
        description: 'Subtle gradient between similar tones',
        promptFragment: 'subtle gradient background from {COLOR_1} to {COLOR_2}, smooth transition',
    },
    gradient_overlay: {
        id: 'gradient_overlay',
        description: 'Gradient overlay (transparent to dark)',
        promptFragment: 'gradient overlay fading from transparent to dark/black at bottom, for text legibility',
    },
};

/**
 * Typography Styles
 */
export const TYPOGRAPHY_STYLES = {
    headline_impact: {
        weight: 'black',
        style: 'Impact, bold sans-serif display font',
        promptFragment: 'bold impactful headline typography, thick black weight, strong visual presence',
    },
    headline_elegant: {
        weight: 'regular',
        style: 'Elegant serif or light sans-serif',
        promptFragment: 'elegant refined headline typography, sophisticated and premium feel',
    },
    headline_playful: {
        weight: 'bold',
        style: 'Rounded, friendly font',
        promptFragment: 'playful friendly headline typography, rounded letterforms, approachable',
    },
    body_clean: {
        weight: 'regular',
        style: 'Clean sans-serif (Inter, Helvetica)',
        promptFragment: 'clean readable body text, modern sans-serif, excellent legibility',
    },
    label_uppercase: {
        weight: 'medium',
        style: 'Uppercase, slightly tracked',
        promptFragment: 'uppercase label text, slightly spaced letters, organized and clean',
    },
};

/**
 * Build design element prompt fragment
 */
export function buildElementPrompt(elementType, style, options = {}) {
    const { color, position, text } = options;

    let fragment = '';

    // Get the base fragment based on type and style
    switch (elementType) {
        case 'arrow':
            fragment = ARROW_STYLES[style]?.promptFragment || ARROW_STYLES.curved_hand_drawn.promptFragment;
            break;
        case 'line':
            fragment = LINE_STYLES[style]?.promptFragment || LINE_STYLES.dotted.promptFragment;
            break;
        case 'marker':
            fragment = MARKER_STYLES[style]?.promptFragment || MARKER_STYLES.circle_outline.promptFragment;
            break;
        case 'badge':
            fragment = BADGE_STYLES[style]?.promptFragment || BADGE_STYLES.ribbon_award.promptFragment;
            break;
        case 'shape':
            fragment = SHAPE_STYLES[style]?.promptFragment || SHAPE_STYLES.rounded_rectangle.promptFragment;
            break;
        case 'icon':
            fragment = ICON_STYLES[style]?.promptFragment || ICON_STYLES.checkmark_square.promptFragment;
            break;
        case 'background':
            fragment = BACKGROUND_STYLES[style]?.promptFragment || BACKGROUND_STYLES.solid_vibrant.promptFragment;
            break;
    }

    // Replace placeholders
    if (color) {
        fragment = fragment.replace('{COLOR}', color);
        fragment = fragment.replace('{COLOR_1}', color);
    }
    if (text) {
        fragment += ` containing text "${text}"`;
    }
    if (position) {
        fragment = `${fragment}, positioned at ${position}`;
    }

    return fragment;
}

/**
 * Get random color from a style palette
 */
export function getRandomColorFromStyle(styleId) {
    const style = BACKGROUND_STYLES[styleId];
    if (style?.colors) {
        return style.colors[Math.floor(Math.random() * style.colors.length)];
    }
    return '#F5A623'; // Default orange
}

/**
 * Build complete background prompt
 */
export function buildBackgroundPrompt(style, color = null) {
    const bgStyle = BACKGROUND_STYLES[style] || BACKGROUND_STYLES.solid_vibrant;
    const selectedColor = color || getRandomColorFromStyle(style);

    return bgStyle.promptFragment.replace('{COLOR}', selectedColor);
}
