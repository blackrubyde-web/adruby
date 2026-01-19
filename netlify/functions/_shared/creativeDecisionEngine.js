/**
 * INTELLIGENT CREATIVE DECISION ENGINE
 * 
 * Automatically determines the OPTIMAL visual presentation based on:
 * - Product type & industry
 * - Campaign goal
 * - Available data
 * - Target audience
 * - Price point
 * - Urgency level
 * 
 * This engine thinks like a senior Meta Ads specialist with 10+ years experience.
 */

// ============================================================
// DECISION RULES - Based on Meta Best Practices
// ============================================================

const DECISION_RULES = {
    // When to show different elements
    showPrice: {
        always: ['ecommerce', 'retail', 'fashion', 'electronics', 'beauty', 'home', 'toys'],
        conditional: ['services', 'saas', 'courses'], // Only if price is provided
        never: ['brand_awareness', 'reach'],
    },

    showOriginalPrice: {
        conditions: [
            'has_discount',
            'sale_campaign',
            'black_friday',
            'flash_sale',
        ],
    },

    showTrustBadges: {
        high_priority: ['new_brand', 'unknown_seller', 'high_price_point', 'first_purchase'],
        medium_priority: ['ecommerce', 'retail'],
        low_priority: ['established_brand', 'repeat_customer'],
    },

    showUrgency: {
        always: ['flash_sale', 'limited_edition', 'black_friday', 'cyber_monday'],
        conditional: ['low_stock', 'ending_soon'],
        never: ['evergreen', 'brand_awareness'],
    },

    showRating: {
        minimum_reviews: 10,
        minimum_rating: 4.0,
        hide_if_below: 3.5,
    },

    showCountdown: {
        campaigns: ['flash_sale', 'limited_time', 'special_offer'],
        max_hours: 72,
    },
};

// ============================================================
// VISUAL STYLE MATRIX
// ============================================================

const VISUAL_STYLES = {
    // Premium dark - for luxury, electronics, premium products
    premium_dark: {
        background: { primary: '#0C0C0C', secondary: '#1A1A1A' },
        text: { primary: '#FFFFFF', secondary: 'rgba(255,255,255,0.85)' },
        accent: '#FF4444',
        priceColor: '#FFFFFF',
        salePriceColor: '#FF4444',
        trustBadgeBg: 'rgba(255,255,255,0.08)',
        urgencyBg: 'rgba(255,68,68,0.15)',
        checkmarkColor: '#00E676',
        bestFor: ['electronics', 'luxury', 'premium', 'tech', 'watches'],
    },

    // Clean minimal - for beauty, fashion, lifestyle
    clean_minimal: {
        background: { primary: '#FAFAFA', secondary: '#F0F0F0' },
        text: { primary: '#1A1A1A', secondary: 'rgba(0,0,0,0.75)' },
        accent: '#1A1A1A',
        priceColor: '#1A1A1A',
        salePriceColor: '#E53935',
        trustBadgeBg: 'rgba(0,0,0,0.05)',
        urgencyBg: 'rgba(229,57,53,0.1)',
        checkmarkColor: '#2E7D32',
        bestFor: ['beauty', 'fashion', 'skincare', 'lifestyle', 'home_decor'],
    },

    // Warm lifestyle - for home, food, wellness
    warm_lifestyle: {
        background: { primary: '#1A1510', secondary: '#2A2520' },
        text: { primary: '#FFF8F0', secondary: 'rgba(255,248,240,0.85)' },
        accent: '#FF8C42',
        priceColor: '#FFF8F0',
        salePriceColor: '#FF8C42',
        trustBadgeBg: 'rgba(255,140,66,0.1)',
        urgencyBg: 'rgba(255,140,66,0.15)',
        checkmarkColor: '#A5D6A7',
        bestFor: ['home', 'food', 'wellness', 'organic', 'handmade'],
    },

    // High energy - for sales, promotions, flash deals
    high_energy: {
        background: { primary: '#1A0A0A', secondary: '#2A1515' },
        text: { primary: '#FFFFFF', secondary: 'rgba(255,255,255,0.9)' },
        accent: '#FF1744',
        priceColor: '#FFFFFF',
        salePriceColor: '#FFEB3B',
        trustBadgeBg: 'rgba(255,23,68,0.1)',
        urgencyBg: 'rgba(255,23,68,0.2)',
        checkmarkColor: '#76FF03',
        bestFor: ['sale', 'flash_sale', 'black_friday', 'clearance'],
    },

    // Playful vibrant - for toys, kids, fun products
    playful_vibrant: {
        background: { primary: '#1A0A2E', secondary: '#2D1B4E' },
        text: { primary: '#FFFFFF', secondary: 'rgba(255,255,255,0.9)' },
        accent: '#FF4081',
        priceColor: '#FFFFFF',
        salePriceColor: '#FF4081',
        trustBadgeBg: 'rgba(255,64,129,0.1)',
        urgencyBg: 'rgba(255,64,129,0.15)',
        checkmarkColor: '#69F0AE',
        bestFor: ['toys', 'kids', 'games', 'party', 'entertainment'],
    },

    // Professional - for B2B, services, courses
    professional: {
        background: { primary: '#0A1628', secondary: '#152238' },
        text: { primary: '#FFFFFF', secondary: 'rgba(255,255,255,0.85)' },
        accent: '#2196F3',
        priceColor: '#FFFFFF',
        salePriceColor: '#4CAF50',
        trustBadgeBg: 'rgba(33,150,243,0.1)',
        urgencyBg: 'rgba(33,150,243,0.15)',
        checkmarkColor: '#4CAF50',
        bestFor: ['saas', 'courses', 'services', 'b2b', 'consulting'],
    },
};

// ============================================================
// LAYOUT DECISION MATRIX
// ============================================================

const LAYOUT_MATRIX = {
    // What layout to use based on available content
    few_features: { // 0-1 features
        with_price: 'centered_hero',
        without_price: 'minimalist_brand',
    },
    some_features: { // 2-3 features
        with_price: 'hero_split',
        without_price: 'hero_split',
    },
    many_features: { // 4+ features
        with_price: 'feature_callouts',
        without_price: 'feature_callouts',
    },
    sale_campaign: 'discount_urgency',
    testimonial_focus: 'testimonial_focus',
    bundle: 'bundle_deal',
    collection: 'grid_collection',
};

// ============================================================
// MAIN DECISION ENGINE
// ============================================================

export function makeCreativeDecisions(context) {
    const {
        // Product info
        productName = '',
        productType = 'retail',
        industry = 'ecommerce',
        price = null,
        originalPrice = null,

        // Campaign info
        campaignGoal = 'conversion', // 'conversion', 'awareness', 'traffic'
        campaignType = 'evergreen', // 'evergreen', 'sale', 'flash_sale', 'launch'

        // Content
        features = [],
        headline = '',
        rating = null,
        reviewCount = null,
        testimonial = null,

        // Urgency data
        stockLevel = null, // null, 'high', 'medium', 'low'
        endDate = null, // Date object or null

        // Brand info
        isNewBrand = false,
        isEstablishedBrand = false,

        // Additional
        targetAudience = 'broad',
        pricePoint = 'medium', // 'low', 'medium', 'high', 'premium'
    } = context;

    const decisions = {
        // Visual style
        visualStyle: null,
        palette: null,

        // Layout
        layout: null,

        // Elements to show
        elements: {
            showPrice: false,
            showOriginalPrice: false,
            showDiscountBadge: false,
            discountPercent: null,

            showTrustBadges: false,
            trustBadgesToShow: [],

            showRating: false,
            showReviewCount: false,

            showUrgency: false,
            urgencyType: null,
            urgencyValue: null,

            showCountdown: false,

            showBadge: false,
            badgeText: null,
        },

        // Positioning
        positions: {},

        // Reasoning (for debugging)
        reasoning: [],
    };

    // ===== VISUAL STYLE DECISION =====
    decisions.visualStyle = selectVisualStyle(industry, campaignType, pricePoint);
    decisions.palette = decisions.visualStyle;
    decisions.reasoning.push(`Visual style: ${decisions.visualStyle} (industry: ${industry})`);

    // ===== LAYOUT DECISION =====
    decisions.layout = selectLayout(features, price, campaignType, testimonial);
    decisions.reasoning.push(`Layout: ${decisions.layout} (${features.length} features)`);

    // ===== PRICE DISPLAY DECISION =====
    const showPriceIndustries = [...DECISION_RULES.showPrice.always, ...DECISION_RULES.showPrice.conditional];
    const isAwarenessGoal = campaignGoal === 'awareness' || campaignGoal === 'reach';

    if (price && showPriceIndustries.includes(industry) && !isAwarenessGoal) {
        decisions.elements.showPrice = true;
        decisions.reasoning.push(`Showing price: ${price}€ (e-commerce industry)`);

        // Show original price if discount exists
        if (originalPrice && originalPrice > price) {
            decisions.elements.showOriginalPrice = true;
            const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
            decisions.elements.discountPercent = discountPercent;
            decisions.elements.showDiscountBadge = discountPercent >= 10; // Only show badge for 10%+
            decisions.reasoning.push(`Discount: ${discountPercent}% (showing badge: ${decisions.elements.showDiscountBadge})`);
        }
    } else if (price && isAwarenessGoal) {
        decisions.reasoning.push(`NOT showing price (awareness campaign)`);
    }

    // ===== TRUST BADGES DECISION =====
    decisions.elements.showTrustBadges = shouldShowTrustBadges(pricePoint, isNewBrand, industry);
    if (decisions.elements.showTrustBadges) {
        decisions.elements.trustBadgesToShow = selectTrustBadges(pricePoint, industry);
        decisions.reasoning.push(`Trust badges: ${decisions.elements.trustBadgesToShow.join(', ')}`);
    }

    // ===== RATING DECISION =====
    if (rating !== null && rating >= DECISION_RULES.showRating.minimum_rating) {
        if (reviewCount === null || reviewCount >= DECISION_RULES.showRating.minimum_reviews) {
            decisions.elements.showRating = true;
            decisions.elements.showReviewCount = reviewCount !== null;
            decisions.reasoning.push(`Showing rating: ${rating}/5 (${reviewCount} reviews)`);
        }
    } else if (rating !== null && rating < DECISION_RULES.showRating.hide_if_below) {
        decisions.reasoning.push(`HIDING rating (${rating} is below ${DECISION_RULES.showRating.hide_if_below})`);
    }

    // ===== URGENCY DECISION =====
    const urgencyDecision = determineUrgency(campaignType, stockLevel, endDate);
    decisions.elements.showUrgency = urgencyDecision.show;
    decisions.elements.urgencyType = urgencyDecision.type;
    decisions.elements.urgencyValue = urgencyDecision.value;
    if (urgencyDecision.show) {
        decisions.reasoning.push(`Urgency: ${urgencyDecision.type} (${urgencyDecision.value})`);
    }

    // ===== COUNTDOWN DECISION =====
    if (endDate && isFlashSale(campaignType)) {
        const hoursLeft = Math.floor((endDate - new Date()) / (1000 * 60 * 60));
        if (hoursLeft > 0 && hoursLeft <= DECISION_RULES.showCountdown.max_hours) {
            decisions.elements.showCountdown = true;
            decisions.reasoning.push(`Countdown: ${hoursLeft}h remaining`);
        }
    }

    // ===== BADGE DECISION =====
    const badgeDecision = determineBadge(campaignType, stockLevel, productType);
    decisions.elements.showBadge = badgeDecision.show;
    decisions.elements.badgeText = badgeDecision.text;
    if (badgeDecision.show) {
        decisions.reasoning.push(`Badge: ${badgeDecision.text}`);
    }

    // ===== ELEMENT POSITIONING =====
    decisions.positions = calculateOptimalPositions(decisions.layout, decisions.elements);

    return decisions;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function selectVisualStyle(industry, campaignType, pricePoint) {
    // Sale campaigns always use high energy
    if (['sale', 'flash_sale', 'black_friday', 'clearance'].includes(campaignType)) {
        return 'high_energy';
    }

    // Premium price point uses premium dark
    if (pricePoint === 'premium') {
        return 'premium_dark';
    }

    // Match industry to style
    for (const [styleName, style] of Object.entries(VISUAL_STYLES)) {
        if (style.bestFor.includes(industry)) {
            return styleName;
        }
    }

    // Default to premium dark
    return 'premium_dark';
}

function selectLayout(features, price, campaignType, testimonial) {
    // Specific campaign types
    if (['sale', 'flash_sale', 'black_friday'].includes(campaignType)) {
        return 'discount_urgency';
    }

    if (testimonial) {
        return 'testimonial_focus';
    }

    // Based on feature count
    const featureCount = features.length;
    if (featureCount === 0 || featureCount === 1) {
        return price ? 'centered_hero' : 'minimalist_brand';
    } else if (featureCount <= 3) {
        return 'hero_split';
    } else {
        return 'feature_callouts';
    }
}

function shouldShowTrustBadges(pricePoint, isNewBrand, industry) {
    // Always show for high price or new brands
    if (pricePoint === 'high' || pricePoint === 'premium' || isNewBrand) {
        return true;
    }

    // Show for e-commerce industries
    const ecommerceIndustries = ['ecommerce', 'retail', 'electronics', 'fashion', 'beauty'];
    return ecommerceIndustries.includes(industry);
}

function selectTrustBadges(pricePoint, industry) {
    const badges = [];

    // Always include free shipping for e-commerce
    const ecommerceIndustries = ['ecommerce', 'retail', 'electronics', 'fashion', 'beauty', 'home'];
    if (ecommerceIndustries.includes(industry)) {
        badges.push('shipping');
    }

    // High price points need more trust
    if (pricePoint === 'high' || pricePoint === 'premium') {
        badges.push('guarantee');
        badges.push('secure');
    } else {
        badges.push('guarantee');
    }

    return badges.slice(0, 3); // Max 3 badges
}

function determineUrgency(campaignType, stockLevel, endDate) {
    // Flash sales always show urgency
    if (['flash_sale', 'black_friday', 'cyber_monday'].includes(campaignType)) {
        return {
            show: true,
            type: 'limitedTime',
            value: 24,
        };
    }

    // Low stock
    if (stockLevel === 'low') {
        return {
            show: true,
            type: 'lowStock',
            value: 3,
        };
    }

    // Ending soon
    if (endDate) {
        const hoursLeft = Math.floor((endDate - new Date()) / (1000 * 60 * 60));
        if (hoursLeft <= 48 && hoursLeft > 0) {
            return {
                show: true,
                type: 'limitedTime',
                value: hoursLeft,
            };
        }
    }

    return { show: false, type: null, value: null };
}

function isFlashSale(campaignType) {
    return ['flash_sale', 'black_friday', 'cyber_monday', 'limited_time'].includes(campaignType);
}

function determineBadge(campaignType, stockLevel, productType) {
    // Priority order for badges
    if (['flash_sale', 'black_friday'].includes(campaignType)) {
        return { show: true, text: 'FLASH SALE' };
    }

    if (campaignType === 'sale') {
        return { show: true, text: 'SALE' };
    }

    if (campaignType === 'launch') {
        return { show: true, text: 'NEU' };
    }

    if (stockLevel === 'low') {
        return { show: true, text: 'FAST AUSVERKAUFT' };
    }

    if (productType === 'bestseller') {
        return { show: true, text: 'BESTSELLER' };
    }

    // NO default badge - only show when explicitly needed
    return { show: false, text: null };
}

function calculateOptimalPositions(layout, elements) {
    const canvasSize = 1080;
    const margin = 44;

    // Base positions that work for most layouts
    const positions = {
        badge: { x: canvasSize - margin - 140, y: margin },
        price: { x: canvasSize - margin - 200, y: canvasSize - 100 },
        discount: { x: canvasSize - margin - 100, y: margin },
        trustBadges: { x: margin, y: canvasSize - 70 },
        rating: { x: margin, y: canvasSize - 110 },
        urgency: { x: margin, y: canvasSize - 150 },
    };

    // Adjust based on layout
    if (layout === 'hero_split') {
        positions.price = { x: canvasSize * 0.55, y: canvasSize - 100 };
        positions.trustBadges = { x: canvasSize * 0.55, y: canvasSize - 60 };
    }

    if (layout === 'centered_hero') {
        positions.price = { x: (canvasSize - 200) / 2, y: canvasSize - 100 };
        positions.trustBadges = { x: (canvasSize - 400) / 2, y: canvasSize - 55 };
    }

    return positions;
}

// ============================================================
// VISUAL STYLE GETTER
// ============================================================

export function getVisualStyle(styleName) {
    return VISUAL_STYLES[styleName] || VISUAL_STYLES.premium_dark;
}

// ============================================================
// EXPORTS
// ============================================================

export {
    DECISION_RULES,
    VISUAL_STYLES,
    LAYOUT_MATRIX,
};

export default {
    makeCreativeDecisions,
    getVisualStyle,
    DECISION_RULES,
    VISUAL_STYLES,
    LAYOUT_MATRIX,
};
