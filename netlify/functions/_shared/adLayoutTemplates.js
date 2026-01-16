/**
 * Ad Layout Templates - Designer-Level Graphic Element System
 * 15+ proven ad layouts based on analysis of high-performing Meta Ads
 * Each template defines exact positioning, design elements, and composition rules
 */

/**
 * Layout Template Structure:
 * - id: Unique identifier
 * - name: Human-readable name
 * - description: When to use this layout
 * - zones: Array of content zones with positioning
 * - designElements: Graphic elements (arrows, lines, badges, etc.)
 * - colorScheme: Background and accent color rules
 * - typography: Font hierarchy rules
 */

export const AD_LAYOUTS = {
    // ========================================
    // FEATURE CALLOUT LAYOUTS
    // ========================================

    feature_callout_arrows: {
        id: 'feature_callout_arrows',
        name: 'Feature Callout with Arrows',
        nameDE: 'Feature-Callout mit Pfeilen',
        description: 'Product centered with curved arrows pointing to feature text blocks around it. Like BioGone, Nucao ads.',

        zones: [
            { id: 'headline', position: 'top-center', size: 'large', purpose: 'Main headline' },
            { id: 'product', position: 'center', size: '50%', purpose: 'Hero product image' },
            { id: 'feature_1', position: 'top-left', size: 'small', purpose: 'Feature callout' },
            { id: 'feature_2', position: 'top-right', size: 'small', purpose: 'Feature callout' },
            { id: 'feature_3', position: 'bottom-left', size: 'small', purpose: 'Feature callout' },
            { id: 'feature_4', position: 'bottom-right', size: 'small', purpose: 'Feature callout' },
            { id: 'cta', position: 'bottom-right-corner', size: 'medium', purpose: 'Call to action' },
        ],

        designElements: [
            { type: 'curved_arrow', from: 'feature_1', to: 'product', style: 'hand-drawn' },
            { type: 'curved_arrow', from: 'feature_2', to: 'product', style: 'hand-drawn' },
            { type: 'curved_arrow', from: 'feature_3', to: 'product', style: 'hand-drawn' },
            { type: 'curved_arrow', from: 'feature_4', to: 'product', style: 'hand-drawn' },
            { type: 'rounded_shape', position: 'cta', style: 'filled-circle' },
        ],

        colorScheme: {
            background: 'solid-vibrant', // Orange, Yellow, Mint, etc.
            text: 'high-contrast',
            accent: 'complementary',
        },

        typography: {
            headline: { weight: 'bold', size: 'xl', style: 'serif-or-display' },
            features: { weight: 'medium', size: 'sm', style: 'clean-sans' },
            cta: { weight: 'bold', size: 'md', style: 'clean-sans' },
        },

        promptTemplate: `Professional product advertisement with feature callout design.
Central hero shot of {PRODUCT} centered in the frame, taking 50% of composition.
Solid {BACKGROUND_COLOR} background, clean and vibrant.

DESIGN ELEMENTS (CRITICAL):
- 4 curved hand-drawn style arrows in {ARROW_COLOR} pointing FROM text TO the product
- Arrows have a casual, organic feel - not rigid geometric lines
- Each arrow connects a feature text block to the product

TEXT LAYOUT:
- Bold headline "{HEADLINE}" at top center
- Feature text blocks positioned around product:
  - Top-left: "{FEATURE_1}" with curved arrow pointing to product
  - Top-right: "{FEATURE_2}" with curved arrow pointing to product  
  - Bottom-left: "{FEATURE_3}" with curved arrow pointing to product
  - Bottom-right: "{FEATURE_4}" with curved arrow pointing to product
- CTA "{CTA}" in rounded circle shape at bottom-right corner

Typography: Mix of bold display font for headline, clean sans-serif for features.
Modern, professional, scroll-stopping Instagram/Facebook ad aesthetic.
The arrows create visual flow guiding eyes to the product.`,
    },

    feature_callout_dotted: {
        id: 'feature_callout_dotted',
        name: 'Feature Callout with Dotted Lines',
        nameDE: 'Feature-Callout mit gepunkteten Linien',
        description: 'Product centered with dotted lines and circle markers connecting to features. Like Pureful Yoga Mat ad.',

        zones: [
            { id: 'logo', position: 'top-center', size: 'small', purpose: 'Brand logo' },
            { id: 'headline', position: 'top-center-below-logo', size: 'large', purpose: 'Main headline' },
            { id: 'subheadline', position: 'below-headline', size: 'medium', purpose: 'Witty subline' },
            { id: 'product', position: 'center', size: '60%', purpose: 'Hero product image' },
            { id: 'feature_1', position: 'left-top', size: 'small', purpose: 'Feature' },
            { id: 'feature_2', position: 'left-middle', size: 'small', purpose: 'Feature' },
            { id: 'feature_3', position: 'left-bottom', size: 'small', purpose: 'Feature' },
            { id: 'feature_4', position: 'right-top', size: 'small', purpose: 'Feature' },
            { id: 'feature_5', position: 'right-middle', size: 'small', purpose: 'Feature' },
            { id: 'feature_6', position: 'right-bottom', size: 'small', purpose: 'Feature' },
            { id: 'footer', position: 'bottom-center', size: 'small', purpose: 'Tagline' },
        ],

        designElements: [
            { type: 'dotted_line', from: 'feature_1', to: 'product', marker: 'circle' },
            { type: 'dotted_line', from: 'feature_2', to: 'product', marker: 'circle' },
            { type: 'dotted_line', from: 'feature_3', to: 'product', marker: 'circle' },
            { type: 'dotted_line', from: 'feature_4', to: 'product', marker: 'circle' },
            { type: 'dotted_line', from: 'feature_5', to: 'product', marker: 'circle' },
            { type: 'dotted_line', from: 'feature_6', to: 'product', marker: 'circle' },
            { type: 'circle_marker', on: 'product', count: 6 },
        ],

        colorScheme: {
            background: 'solid-pastel', // Mint, Light Blue, Cream
            text: 'dark-on-light',
            accent: 'dark',
        },

        typography: {
            headline: { weight: 'bold', size: 'xl', style: 'modern-sans' },
            subheadline: { weight: 'regular', size: 'md', style: 'italic-or-casual' },
            features: { weight: 'medium', size: 'sm', style: 'clean-sans' },
        },

        promptTemplate: `Clean technical product showcase with feature callout diagram.
{PRODUCT} centered, taking 60% of frame, shown from attractive angle.
Solid {BACKGROUND_COLOR} pastel background (mint, cream, or light blue).

DESIGN ELEMENTS (CRITICAL):
- Small circle markers (○) placed at 6 points on the product
- Dotted lines (---) extending from each circle marker outward
- Lines connect to feature text labels positioned around product
- Clean, technical, infographic style

TEXT LAYOUT:
- Logo/brand mark at top center
- Bold headline "{HEADLINE}" below logo
- Witty/casual subheadline "{SUBHEADLINE}" in lighter weight
- 6 feature labels around product, connected by dotted lines:
  Left side: "{FEATURE_1}", "{FEATURE_2}", "{FEATURE_3}"
  Right side: "{FEATURE_4}", "{FEATURE_5}", "{FEATURE_6}"
- Optional footer tagline at bottom

The dotted lines create a technical/explainer diagram aesthetic.
Eco/wellness brand feel, informative yet stylish.`,
    },

    checklist_benefits: {
        id: 'checklist_benefits',
        name: 'Checklist Benefits Layout',
        nameDE: 'Checklisten-Layout mit Benefits',
        description: 'Person/product on left, checkmark list of benefits on right. Like Tape Extensions ad.',

        zones: [
            { id: 'visual', position: 'left-half', size: '50%', purpose: 'Person or product image' },
            { id: 'headline', position: 'right-top', size: 'large', purpose: 'Product name in box' },
            { id: 'check_1', position: 'right-middle-1', size: 'medium', purpose: 'Benefit 1' },
            { id: 'check_2', position: 'right-middle-2', size: 'medium', purpose: 'Benefit 2' },
            { id: 'check_3', position: 'right-middle-3', size: 'medium', purpose: 'Benefit 3' },
            { id: 'badge', position: 'bottom-center', size: 'medium', purpose: 'Trust badge' },
        ],

        designElements: [
            { type: 'color_block', position: 'headline', style: 'filled-rectangle' },
            { type: 'checkmark', position: 'check_1', style: 'filled-square' },
            { type: 'checkmark', position: 'check_2', style: 'filled-square' },
            { type: 'checkmark', position: 'check_3', style: 'filled-square' },
            { type: 'text_box', position: 'checks', style: 'white-pill' },
            { type: 'ribbon_badge', position: 'badge', style: 'award-ribbon' },
        ],

        colorScheme: {
            background: 'solid-branded', // Pink, Blue, Brand color
            text: 'white-on-color',
            accent: 'complementary-or-white',
        },

        typography: {
            headline: { weight: 'black', size: 'xxl', style: 'impact-sans' },
            checks: { weight: 'medium', size: 'md', style: 'clean-sans' },
            badge: { weight: 'bold', size: 'sm', style: 'uppercase' },
        },

        promptTemplate: `Beauty/lifestyle product advertisement with checklist layout.
Split composition: left half shows {VISUAL_DESCRIPTION}, right half shows benefits.
Solid {BACKGROUND_COLOR} background with slight diagonal gradient overlay.

DESIGN ELEMENTS (CRITICAL):
- Headline "{HEADLINE}" in solid colored rectangular box (darker shade)
- 3 benefit items with CHECKMARK icons (✓ in colored square):
  ✓ "{BENEFIT_1}" - in white rounded pill shape
  ✓ "{BENEFIT_2}" - in white rounded pill shape  
  ✓ "{BENEFIT_3}" - in white rounded pill shape
- Award/bestseller ribbon badge at bottom: "{BADGE_TEXT}" with star rating
- Badge has ribbon tails hanging below

The checkmarks are in small colored squares, benefits text in white pill shapes.
Feminine/beauty brand aesthetic, aspirational and trust-building.`,
    },

    minimal_icons_grid: {
        id: 'minimal_icons_grid',
        name: 'Minimal Icons Grid',
        nameDE: 'Minimalistisches Icon-Grid',
        description: 'Clean product photography with small icons and labels at bottom. Like Billy Dishes ad.',

        zones: [
            { id: 'headline', position: 'top-center', size: 'medium', purpose: 'Brand/product name' },
            { id: 'product', position: 'center', size: '70%', purpose: 'Hero product shot' },
            { id: 'icon_bar', position: 'bottom', size: 'small', purpose: 'Icon strip' },
            { id: 'icon_1', position: 'bottom-left', size: 'tiny', purpose: 'Feature icon 1' },
            { id: 'icon_2', position: 'bottom-center', size: 'tiny', purpose: 'Feature icon 2' },
            { id: 'icon_3', position: 'bottom-right', size: 'tiny', purpose: 'Feature icon 3' },
        ],

        designElements: [
            { type: 'icon', position: 'icon_1', style: 'simple-character' },
            { type: 'icon', position: 'icon_2', style: 'simple-character' },
            { type: 'icon', position: 'icon_3', style: 'simple-character' },
            { type: 'divider_bar', position: 'above-icons', style: 'thin-line' },
        ],

        colorScheme: {
            background: 'neutral-elegant', // Cream, Light Gray, Warm White
            text: 'dark-minimal',
            accent: 'muted',
        },

        typography: {
            headline: { weight: 'light', size: 'lg', style: 'elegant-serif' },
            labels: { weight: 'regular', size: 'xs', style: 'clean-sans' },
        },

        promptTemplate: `Ultra-minimalist luxury product advertisement.
{PRODUCT} beautifully photographed center-frame with lots of negative space.
Neutral {BACKGROUND_COLOR} background (cream, warm gray, or off-white).

DESIGN ELEMENTS (CRITICAL):
- Simple brand/product name "{HEADLINE}" at top in elegant font
- Thin horizontal divider line separating product from icon bar
- Bottom icon bar on slightly different background tone:
  - 3 small playful character icons representing features
  - Each icon has a one-word label below:
    Icon 1: "{ICON_1_LABEL}"
    Icon 2: "{ICON_2_LABEL}"  
    Icon 3: "{ICON_3_LABEL}"

Icons are simple, cute, hand-drawn style characters (like stick figures with personality).
Premium, understated, design-forward aesthetic.
Maximum negative space, minimum visual elements.`,
    },

    hero_with_badge: {
        id: 'hero_with_badge',
        name: 'Hero Product with Trust Badge',
        nameDE: 'Hero-Produkt mit Vertrauens-Badge',
        description: 'Clean hero shot with prominent trust/award badge. Premium e-commerce style.',

        zones: [
            { id: 'product', position: 'center', size: '65%', purpose: 'Hero product' },
            { id: 'headline', position: 'top', size: 'large', purpose: 'Main headline' },
            { id: 'badge', position: 'top-right', size: 'medium', purpose: 'Trust badge' },
            { id: 'tagline', position: 'bottom', size: 'small', purpose: 'Tagline/USP' },
        ],

        designElements: [
            { type: 'circle_badge', position: 'badge', style: 'seal-with-text' },
            { type: 'subtle_shadow', position: 'product', style: 'drop-shadow' },
        ],

        colorScheme: {
            background: 'gradient-subtle',
            text: 'high-contrast',
            accent: 'gold-or-brand',
        },

        promptTemplate: `Premium e-commerce product hero shot.
{PRODUCT} floating center-frame with subtle drop shadow.
Clean {BACKGROUND_COLOR} gradient background.

DESIGN ELEMENTS:
- Bold headline "{HEADLINE}" at top
- Circular trust/award badge in top-right corner:
  "{BADGE_TEXT}" in seal/stamp design
  Could include: stars, checkmark, or award symbol
- Tagline "{TAGLINE}" at bottom

Professional, trustworthy, premium shopping experience aesthetic.`,
    },

    urgency_sale_bold: {
        id: 'urgency_sale_bold',
        name: 'Bold Urgency Sale',
        nameDE: 'Auffälliger Sale-Banner',
        description: 'High-impact sale/discount announcement with bold typography and shapes.',

        zones: [
            { id: 'discount', position: 'top-center', size: 'xl', purpose: 'Discount percentage' },
            { id: 'product', position: 'center', size: '50%', purpose: 'Product image' },
            { id: 'headline', position: 'middle', size: 'large', purpose: 'Sale headline' },
            { id: 'cta', position: 'bottom', size: 'medium', purpose: 'CTA button' },
            { id: 'timer', position: 'bottom-corner', size: 'small', purpose: 'Urgency element' },
        ],

        designElements: [
            { type: 'starburst', position: 'discount', style: 'explosion' },
            { type: 'diagonal_stripe', position: 'background', style: 'dynamic' },
            { type: 'button_shape', position: 'cta', style: 'rounded-rectangle' },
        ],

        colorScheme: {
            background: 'bold-contrast', // Red, Black, or vibrant
            text: 'white-or-yellow',
            accent: 'warning-colors',
        },

        promptTemplate: `High-impact sale/promotional advertisement.
Dynamic, energetic composition with {PRODUCT} as hero.
Bold {BACKGROUND_COLOR} background with diagonal stripes or geometric shapes.

DESIGN ELEMENTS (CRITICAL):
- Large "{DISCOUNT}" in starburst/explosion shape
- Bold headline "{HEADLINE}" in impactful typography
- CTA "{CTA}" in contrasting button shape
- Urgency element: "{TIMER}" (e.g., "Ends Tonight!" or clock icon)

Creates FOMO, demands attention, drives immediate action.`,
    },

    testimonial_quote: {
        id: 'testimonial_quote',
        name: 'Testimonial Quote Card',
        nameDE: 'Testimonial-Zitat Karte',
        description: 'Customer quote with photo and star rating. Trust-building social proof.',

        zones: [
            { id: 'quote', position: 'center-top', size: 'large', purpose: 'Customer quote' },
            { id: 'photo', position: 'bottom-left', size: 'small', purpose: 'Customer photo' },
            { id: 'name', position: 'bottom-center', size: 'small', purpose: 'Customer name' },
            { id: 'rating', position: 'top-or-bottom', size: 'small', purpose: 'Star rating' },
            { id: 'product', position: 'corner', size: 'small', purpose: 'Product thumbnail' },
        ],

        designElements: [
            { type: 'quote_marks', position: 'quote', style: 'large-decorative' },
            { type: 'star_rating', position: 'rating', style: '5-stars' },
            { type: 'circle_crop', position: 'photo', style: 'avatar' },
        ],

        colorScheme: {
            background: 'soft-warm',
            text: 'readable-dark',
            accent: 'gold-stars',
        },

        promptTemplate: `Authentic testimonial/review style advertisement.
Clean, trustworthy layout focusing on customer voice.

DESIGN ELEMENTS:
- Large decorative quotation marks framing the quote
- Customer quote: "{QUOTE}" in readable serif or sans font
- Circular customer photo (avatar style)
- Customer name: "{CUSTOMER_NAME}"
- 5-star rating (⭐⭐⭐⭐⭐) prominently displayed
- Small product image in corner for context

Warm, authentic, builds trust through social proof.`,
    },

    comparison_split: {
        id: 'comparison_split',
        name: 'Before/After Comparison Split',
        nameDE: 'Vorher/Nachher Vergleich',
        description: 'Split screen showing transformation or comparison.',

        zones: [
            { id: 'before', position: 'left-half', size: '50%', purpose: 'Before state' },
            { id: 'after', position: 'right-half', size: '50%', purpose: 'After state' },
            { id: 'label_before', position: 'left-top', size: 'small', purpose: 'Before label' },
            { id: 'label_after', position: 'right-top', size: 'small', purpose: 'After label' },
            { id: 'product', position: 'center-divider', size: 'medium', purpose: 'Product overlay' },
        ],

        designElements: [
            { type: 'vertical_divider', position: 'center', style: 'zigzag-or-straight' },
            { type: 'label_pill', position: 'labels', style: 'rounded' },
        ],

        promptTemplate: `Dramatic before/after transformation comparison.
Split composition: left shows "{BEFORE_STATE}", right shows "{AFTER_STATE}".

DESIGN ELEMENTS:
- Clean vertical divider in center (could be zigzag line or straight)
- "BEFORE" label pill in top-left
- "AFTER" label pill in top-right
- {PRODUCT} can overlay the center divider as the transformation catalyst

The contrast should be dramatic and instantly readable.`,
    },

    ingredient_showcase: {
        id: 'ingredient_showcase',
        name: 'Ingredient/Material Showcase',
        nameDE: 'Inhaltsstoff-Showcase',
        description: 'Product surrounded by raw ingredients or materials.',

        zones: [
            { id: 'product', position: 'center', size: '40%', purpose: 'Product' },
            { id: 'ingredients', position: 'surrounding', size: 'various', purpose: 'Raw ingredients' },
            { id: 'headline', position: 'top', size: 'medium', purpose: 'Headline' },
            { id: 'callouts', position: 'near-ingredients', size: 'small', purpose: 'Ingredient labels' },
        ],

        designElements: [
            { type: 'floating_elements', position: 'ingredients', style: 'natural-scatter' },
            { type: 'small_labels', position: 'callouts', style: 'tag' },
        ],

        promptTemplate: `Fresh, natural product showcase with ingredients.
{PRODUCT} centered, surrounded by floating raw ingredients: {INGREDIENTS}.
Bright, clean lighting suggesting freshness and purity.

DESIGN ELEMENTS:
- Ingredients arranged artistically around product
- Small label tags identifying key ingredients
- Water droplets or fresh-cut details for authenticity

Natural, healthy, transparency-focused aesthetic.`,
    },

    stats_infographic: {
        id: 'stats_infographic',
        name: 'Stats & Numbers Infographic',
        nameDE: 'Statistik-Infografik',
        description: 'Bold numbers and statistics as the hero with visual elements.',

        zones: [
            { id: 'main_stat', position: 'center', size: 'xl', purpose: 'Hero statistic' },
            { id: 'supporting_stats', position: 'around', size: 'medium', purpose: 'Supporting numbers' },
            { id: 'product', position: 'corner', size: 'small', purpose: 'Product reference' },
            { id: 'source', position: 'bottom', size: 'tiny', purpose: 'Source citation' },
        ],

        designElements: [
            { type: 'number_highlight', position: 'main_stat', style: 'oversized' },
            { type: 'circle_frame', position: 'stats', style: 'outlined' },
            { type: 'icon_accents', position: 'various', style: 'simple' },
        ],

        promptTemplate: `Data-driven infographic style advertisement.
Bold statistics as the hero visual element.

DESIGN ELEMENTS:
- Massive hero number: "{MAIN_STAT}" (e.g., "97%", "10,000+")
- Supporting stats in circles or boxes around main stat
- Simple icons accompanying each stat
- Clean, professional, authoritative feel

Trust through data, credibility through numbers.`,
    },

    lifestyle_scene: {
        id: 'lifestyle_scene',
        name: 'Lifestyle Scene with Overlay',
        nameDE: 'Lifestyle-Szene mit Overlay',
        description: 'Lifestyle photography with text overlay and brand elements.',

        zones: [
            { id: 'photo', position: 'full', size: '100%', purpose: 'Lifestyle background' },
            { id: 'overlay', position: 'bottom-third', size: '30%', purpose: 'Text overlay area' },
            { id: 'headline', position: 'overlay', size: 'large', purpose: 'Headline' },
            { id: 'cta', position: 'overlay-bottom', size: 'medium', purpose: 'CTA' },
            { id: 'logo', position: 'corner', size: 'small', purpose: 'Brand logo' },
        ],

        designElements: [
            { type: 'gradient_overlay', position: 'bottom', style: 'fade-to-dark' },
            { type: 'text_shadow', position: 'text', style: 'subtle' },
        ],

        promptTemplate: `Aspirational lifestyle photography advertisement.
Full-bleed lifestyle photo showing {LIFESTYLE_SCENE}.
Product naturally integrated in scene or implied.

DESIGN ELEMENTS:
- Gradient overlay at bottom fading to dark
- Bold headline "{HEADLINE}" over gradient
- CTA "{CTA}" below headline
- Small logo in corner

Aspirational, emotional, desire-inducing.`,
    },

    grid_features: {
        id: 'grid_features',
        name: '2x2 Feature Grid',
        nameDE: '2x2 Feature-Grid',
        description: 'Four features in a grid layout with icons and text.',

        zones: [
            { id: 'header', position: 'top', size: 'medium', purpose: 'Product name/headline' },
            { id: 'grid', position: 'center', size: '80%', purpose: '2x2 grid' },
            { id: 'cell_1', position: 'top-left', size: '25%', purpose: 'Feature 1' },
            { id: 'cell_2', position: 'top-right', size: '25%', purpose: 'Feature 2' },
            { id: 'cell_3', position: 'bottom-left', size: '25%', purpose: 'Feature 3' },
            { id: 'cell_4', position: 'bottom-right', size: '25%', purpose: 'Feature 4' },
        ],

        designElements: [
            { type: 'grid_dividers', position: 'center', style: 'thin-lines' },
            { type: 'feature_icons', position: 'cells', style: 'outlined' },
        ],

        promptTemplate: `Organized feature grid advertisement.
Clean 2x2 grid layout showcasing 4 key features.

DESIGN ELEMENTS:
- Product name/headline at top: "{HEADLINE}"
- 4 equal cells with thin divider lines
- Each cell contains:
  - Feature icon (simple, outlined style)
  - Feature name in bold
  - Brief feature description
- Cells: "{FEATURE_1}", "{FEATURE_2}", "{FEATURE_3}", "{FEATURE_4}"

Organized, professional, easy to scan.`,
    },

    announcement_banner: {
        id: 'announcement_banner',
        name: 'Announcement Banner',
        nameDE: 'Ankündigungs-Banner',
        description: 'Bold announcement with product and location/date info.',

        zones: [
            { id: 'announcement', position: 'top-left', size: 'large', purpose: 'Main announcement' },
            { id: 'product', position: 'center', size: '50%', purpose: 'Product image' },
            { id: 'details', position: 'around-product', size: 'small', purpose: 'Feature callouts' },
            { id: 'cta', position: 'bottom-right', size: 'medium', purpose: 'CTA shape' },
        ],

        designElements: [
            { type: 'curved_arrows', position: 'details', style: 'hand-drawn' },
            { type: 'circle_cta', position: 'cta', style: 'quarter-circle' },
        ],

        promptTemplate: `Announcement/launch style advertisement.
Bold announcement text and product reveal.

Like the Nucao "Now in Sainsbury's" ad style.

DESIGN ELEMENTS:
- Large announcement: "{ANNOUNCEMENT}" in bold serif/display font
- Product centered with feature callouts around it
- Curved arrows pointing from feature text to product
- Large rounded CTA shape in corner: "{CTA}"

Exciting, news-worthy, drives action.`,
    },

    social_proof_numbers: {
        id: 'social_proof_numbers',
        name: 'Social Proof with Numbers',
        nameDE: 'Social Proof mit Zahlen',
        description: 'Customer count, rating, or achievement prominently displayed.',

        zones: [
            { id: 'product', position: 'center', size: '50%', purpose: 'Product' },
            { id: 'social_stat', position: 'top', size: 'large', purpose: 'Social proof number' },
            { id: 'supporting', position: 'below-stat', size: 'medium', purpose: 'Supporting text' },
            { id: 'rating', position: 'bottom', size: 'small', purpose: 'Rating stars' },
        ],

        designElements: [
            { type: 'star_rating', position: 'rating', style: 'filled' },
            { type: 'number_accent', position: 'social_stat', style: 'highlighted' },
        ],

        promptTemplate: `Trust-building social proof advertisement.
{PRODUCT} as hero with prominent social proof.

DESIGN ELEMENTS:
- Large social proof number: "{SOCIAL_STAT}" (e.g., "50,000+ Happy Customers")
- Supporting context below the number
- Star rating display (⭐⭐⭐⭐⭐) with review count
- Trust badges or certification marks if relevant

Credibility, trust, peer validation.`,
    },

    process_steps: {
        id: 'process_steps',
        name: 'How It Works / Process Steps',
        nameDE: 'So funktioniert es / Prozess-Schritte',
        description: 'Step-by-step visual guide, typically 3 steps.',

        zones: [
            { id: 'headline', position: 'top', size: 'medium', purpose: 'How it works headline' },
            { id: 'step_1', position: 'left', size: '30%', purpose: 'Step 1' },
            { id: 'step_2', position: 'center', size: '30%', purpose: 'Step 2' },
            { id: 'step_3', position: 'right', size: '30%', purpose: 'Step 3' },
            { id: 'cta', position: 'bottom', size: 'medium', purpose: 'CTA' },
        ],

        designElements: [
            { type: 'step_numbers', position: 'steps', style: 'circled' },
            { type: 'connecting_arrows', position: 'between-steps', style: 'forward' },
            { type: 'step_icons', position: 'steps', style: 'simple' },
        ],

        promptTemplate: `Step-by-step process/how-it-works advertisement.
Clear visual guide showing 3 easy steps.

DESIGN ELEMENTS:
- Headline: "{HEADLINE}" (e.g., "How It Works" or "3 Easy Steps")
- Step 1: Circle with "1", icon, "{STEP_1_TEXT}"
- Step 2: Circle with "2", icon, "{STEP_2_TEXT}"  
- Step 3: Circle with "3", icon, "{STEP_3_TEXT}"
- Arrows connecting steps left to right
- CTA at bottom: "{CTA}"

Simple, approachable, reduces friction.`,
    },
};

/**
 * Get layout by ID
 */
export function getAdLayout(layoutId) {
    return AD_LAYOUTS[layoutId] || AD_LAYOUTS.feature_callout_arrows;
}

/**
 * Get all available layouts
 */
export function getAllAdLayouts() {
    return Object.values(AD_LAYOUTS);
}

/**
 * Recommend layouts based on content type
 */
export function recommendLayouts(options) {
    const {
        hasMultipleFeatures,
        hasTestimonial,
        isSale,
        isAnnouncement,
        isMinimal,
        hasBeforeAfter,
        featureCount = 0,
    } = options;

    const recommendations = [];

    if (hasMultipleFeatures && featureCount >= 4) {
        recommendations.push(AD_LAYOUTS.feature_callout_arrows);
        recommendations.push(AD_LAYOUTS.feature_callout_dotted);
    }

    if (hasMultipleFeatures && featureCount === 3) {
        recommendations.push(AD_LAYOUTS.checklist_benefits);
        recommendations.push(AD_LAYOUTS.process_steps);
    }

    if (hasTestimonial) {
        recommendations.push(AD_LAYOUTS.testimonial_quote);
        recommendations.push(AD_LAYOUTS.social_proof_numbers);
    }

    if (isSale) {
        recommendations.push(AD_LAYOUTS.urgency_sale_bold);
    }

    if (isAnnouncement) {
        recommendations.push(AD_LAYOUTS.announcement_banner);
    }

    if (isMinimal) {
        recommendations.push(AD_LAYOUTS.minimal_icons_grid);
        recommendations.push(AD_LAYOUTS.hero_with_badge);
    }

    if (hasBeforeAfter) {
        recommendations.push(AD_LAYOUTS.comparison_split);
    }

    // Default recommendations if none match
    if (recommendations.length === 0) {
        recommendations.push(AD_LAYOUTS.feature_callout_arrows);
        recommendations.push(AD_LAYOUTS.hero_with_badge);
        recommendations.push(AD_LAYOUTS.checklist_benefits);
    }

    return recommendations.slice(0, 3);
}
