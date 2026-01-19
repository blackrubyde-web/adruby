/**
 * E-COMMERCE CONVERSION ELEMENTS
 * 
 * High-converting elements for product ads:
 * - Price displays (original, sale, savings)
 * - Discount badges and ribbons
 * - Trust badges (shipping, guarantee, secure)
 * - Star ratings
 * - Stock urgency indicators
 * - Countdown timers
 * - Bundle indicators
 * - Payment icons
 * - Shipping/delivery info
 * - Social proof elements
 */

// ============================================================
// PRICE DISPLAY ELEMENTS
// ============================================================

export const PRICE_ELEMENTS = {
    // Standard price display
    priceTag: (x, y, price, currency = '€', fontSize = 48, color = '#FFFFFF') => `
<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" 
      font-size="${fontSize}" font-weight="800" fill="${color}"
      filter="url(#premiumTextShadow)">${price}${currency}</text>`,

    // Sale price with strikethrough original
    salePrice: (x, y, originalPrice, salePrice, currency = '€') => `
<g>
    <!-- Original price (strikethrough) -->
    <text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" 
          font-size="24" font-weight="400" fill="rgba(255,255,255,0.5)"
          text-decoration="line-through">${originalPrice}${currency}</text>
    <!-- Sale price -->
    <text x="${x}" y="${y + 50}" font-family="Arial, Helvetica, sans-serif" 
          font-size="52" font-weight="800" fill="#FF4444"
          filter="url(#premiumTextShadow)">${salePrice}${currency}</text>
</g>`,

    // Price with "ab" prefix
    startingAtPrice: (x, y, price, currency = '€') => `
<g>
    <text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" 
          font-size="18" font-weight="400" fill="rgba(255,255,255,0.7)">ab</text>
    <text x="${x + 30}" y="${y}" font-family="Arial, Helvetica, sans-serif" 
          font-size="48" font-weight="800" fill="#FFFFFF">${price}${currency}</text>
</g>`,

    // Savings badge
    savingsBadge: (x, y, amount, currency = '€') => `
<g>
    <rect x="${x}" y="${y}" width="140" height="36" rx="18" fill="#00C853"/>
    <rect x="${x}" y="${y}" width="140" height="18" rx="18" fill="rgba(255,255,255,0.15)"/>
    <text x="${x + 70}" y="${y + 24}" font-family="Arial, Helvetica, sans-serif" 
          font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle">
        SPARE ${amount}${currency}</text>
</g>`,

    // Percentage discount
    percentOff: (x, y, percent, size = 'large') => {
        const isLarge = size === 'large';
        const w = isLarge ? 100 : 70;
        const h = isLarge ? 100 : 70;
        const fontSize = isLarge ? 36 : 24;
        return `
<g>
    <circle cx="${x + w / 2}" cy="${y + h / 2}" r="${w / 2}" fill="#FF4444"/>
    <circle cx="${x + w / 2}" cy="${y + h / 2 - 5}" r="${w / 2 - 5}" fill="rgba(255,255,255,0.1)"/>
    <text x="${x + w / 2}" y="${y + h / 2 + 5}" font-family="Arial, Helvetica, sans-serif" 
          font-size="${fontSize}" font-weight="800" fill="#FFFFFF" text-anchor="middle">-${percent}%</text>
</g>`;
    },
};

// ============================================================
// DISCOUNT BADGES & RIBBONS
// ============================================================

export const DISCOUNT_ELEMENTS = {
    // Corner ribbon (top-left)
    cornerRibbon: (text = 'SALE', bgColor = '#FF4444', textColor = '#FFFFFF') => `
<g>
    <polygon points="0,0 120,0 0,120" fill="${bgColor}"/>
    <text x="30" y="40" font-family="Arial, Helvetica, sans-serif" 
          font-size="16" font-weight="800" fill="${textColor}"
          transform="rotate(-45, 30, 40)">${text}</text>
</g>`,

    // Starburst badge
    starburstBadge: (x, y, text, bgColor = '#FF4444', size = 80) => {
        const points = [];
        for (let i = 0; i < 16; i++) {
            const angle = (i * Math.PI * 2) / 16;
            const radius = i % 2 === 0 ? size : size * 0.7;
            points.push(`${x + size + Math.cos(angle) * radius},${y + size + Math.sin(angle) * radius}`);
        }
        return `
<g>
    <polygon points="${points.join(' ')}" fill="${bgColor}"/>
    <text x="${x + size}" y="${y + size + 6}" font-family="Arial, Helvetica, sans-serif" 
          font-size="16" font-weight="800" fill="#FFFFFF" text-anchor="middle">${text}</text>
</g>`;
    },

    // Horizontal banner
    saleBanner: (x, y, width, text = 'LIMITIERTES ANGEBOT', bgColor = '#FF4444') => `
<g>
    <rect x="${x}" y="${y}" width="${width}" height="40" fill="${bgColor}"/>
    <rect x="${x}" y="${y}" width="${width}" height="20" fill="rgba(255,255,255,0.1)"/>
    <text x="${x + width / 2}" y="${y + 27}" font-family="Arial, Helvetica, sans-serif" 
          font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle" 
          letter-spacing="2">${text}</text>
</g>`,

    // "NEU" badge
    newBadge: (x, y) => `
<g>
    <rect x="${x}" y="${y}" width="60" height="28" rx="14" fill="#00B8D4"/>
    <rect x="${x}" y="${y}" width="60" height="14" rx="14" fill="rgba(255,255,255,0.2)"/>
    <text x="${x + 30}" y="${y + 19}" font-family="Arial, Helvetica, sans-serif" 
          font-size="12" font-weight="700" fill="#FFFFFF" text-anchor="middle">NEU</text>
</g>`,

    // "BESTSELLER" badge
    bestsellerBadge: (x, y) => `
<g>
    <rect x="${x}" y="${y}" width="110" height="28" rx="14" fill="#FFB300"/>
    <rect x="${x}" y="${y}" width="110" height="14" rx="14" fill="rgba(255,255,255,0.2)"/>
    <text x="${x + 55}" y="${y + 19}" font-family="Arial, Helvetica, sans-serif" 
          font-size="11" font-weight="700" fill="#1A1A1A" text-anchor="middle">⭐ BESTSELLER</text>
</g>`,
};

// ============================================================
// TRUST BADGES
// ============================================================

export const TRUST_BADGES = {
    // Free shipping badge
    freeShipping: (x, y) => `
<g>
    <rect x="${x}" y="${y}" width="160" height="36" rx="8" 
          fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <text x="${x + 12}" y="${y + 24}" font-family="Arial, Helvetica, sans-serif" 
          font-size="16">🚚</text>
    <text x="${x + 38}" y="${y + 24}" font-family="Arial, Helvetica, sans-serif" 
          font-size="13" font-weight="500" fill="rgba(255,255,255,0.9)">Gratis Versand</text>
</g>`,

    // Money-back guarantee
    moneyBackGuarantee: (x, y, days = 30) => `
<g>
    <rect x="${x}" y="${y}" width="180" height="36" rx="8" 
          fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <text x="${x + 12}" y="${y + 24}" font-family="Arial, Helvetica, sans-serif" 
          font-size="16">💰</text>
    <text x="${x + 38}" y="${y + 24}" font-family="Arial, Helvetica, sans-serif" 
          font-size="13" font-weight="500" fill="rgba(255,255,255,0.9)">${days} Tage Geld-zurück</text>
</g>`,

    // Secure checkout
    secureCheckout: (x, y) => `
<g>
    <rect x="${x}" y="${y}" width="150" height="36" rx="8" 
          fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <text x="${x + 12}" y="${y + 24}" font-family="Arial, Helvetica, sans-serif" 
          font-size="16">🔒</text>
    <text x="${x + 38}" y="${y + 24}" font-family="Arial, Helvetica, sans-serif" 
          font-size="13" font-weight="500" fill="rgba(255,255,255,0.9)">Sicher bezahlen</text>
</g>`,

    // Fast delivery
    fastDelivery: (x, y, days = '1-2') => `
<g>
    <rect x="${x}" y="${y}" width="170" height="36" rx="8" 
          fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <text x="${x + 12}" y="${y + 24}" font-family="Arial, Helvetica, sans-serif" 
          font-size="16">⚡</text>
    <text x="${x + 38}" y="${y + 24}" font-family="Arial, Helvetica, sans-serif" 
          font-size="13" font-weight="500" fill="rgba(255,255,255,0.9)">Lieferung in ${days} Tagen</text>
</g>`,

    // Trust badge row (horizontal layout)
    trustBadgeRow: (x, y, badges = ['shipping', 'guarantee', 'secure']) => {
        let svg = '<g>';
        let offsetX = 0;
        const badgeWidth = 170;
        const gap = 10;

        badges.forEach(badge => {
            if (badge === 'shipping') {
                svg += TRUST_BADGES.freeShipping(x + offsetX, y);
            } else if (badge === 'guarantee') {
                svg += TRUST_BADGES.moneyBackGuarantee(x + offsetX, y);
            } else if (badge === 'secure') {
                svg += TRUST_BADGES.secureCheckout(x + offsetX, y);
            }
            offsetX += badgeWidth + gap;
        });

        svg += '</g>';
        return svg;
    },
};

// ============================================================
// STAR RATINGS
// ============================================================

export const RATINGS = {
    // Star rating display
    starRating: (x, y, rating = 5, reviewCount = null, size = 'medium') => {
        const starSize = size === 'large' ? 24 : size === 'small' ? 14 : 18;
        const gap = starSize * 0.1;
        let stars = '';

        for (let i = 0; i < 5; i++) {
            const starX = x + i * (starSize + gap);
            const fillColor = i < rating ? '#FFB300' : 'rgba(255,255,255,0.2)';
            stars += `<text x="${starX}" y="${y + starSize}" font-size="${starSize}" fill="${fillColor}">★</text>`;
        }

        let reviewText = '';
        if (reviewCount !== null) {
            const textX = x + 5 * (starSize + gap) + 8;
            reviewText = `<text x="${textX}" y="${y + starSize - 2}" font-family="Arial, Helvetica, sans-serif" 
                  font-size="${starSize * 0.7}" fill="rgba(255,255,255,0.6)">(${reviewCount})</text>`;
        }

        return `<g>${stars}${reviewText}</g>`;
    },

    // Rating with text
    ratingWithLabel: (x, y, rating, totalReviews) => `
<g>
    ${RATINGS.starRating(x, y, rating)}
    <text x="${x}" y="${y + 40}" font-family="Arial, Helvetica, sans-serif" 
          font-size="14" fill="rgba(255,255,255,0.7)">${rating}/5 (${totalReviews} Bewertungen)</text>
</g>`,
};

// ============================================================
// URGENCY INDICATORS
// ============================================================

export const URGENCY = {
    // Low stock warning
    lowStock: (x, y, quantity = 3) => `
<g>
    <rect x="${x}" y="${y}" width="180" height="32" rx="6" fill="rgba(255,68,68,0.15)" 
          stroke="rgba(255,68,68,0.4)" stroke-width="1"/>
    <text x="${x + 12}" y="${y + 22}" font-family="Arial, Helvetica, sans-serif" 
          font-size="13" font-weight="600" fill="#FF6B6B">🔥 Nur noch ${quantity} auf Lager!</text>
</g>`,

    // Selling fast indicator
    sellingFast: (x, y) => `
<g>
    <rect x="${x}" y="${y}" width="160" height="32" rx="6" fill="rgba(255,152,0,0.15)" 
          stroke="rgba(255,152,0,0.4)" stroke-width="1"/>
    <text x="${x + 12}" y="${y + 22}" font-family="Arial, Helvetica, sans-serif" 
          font-size="13" font-weight="600" fill="#FFB74D">⚡ Schnell ausverkauft!</text>
</g>`,

    // Limited time offer
    limitedTime: (x, y, hoursLeft = 24) => `
<g>
    <rect x="${x}" y="${y}" width="200" height="32" rx="6" fill="rgba(156,39,176,0.15)" 
          stroke="rgba(156,39,176,0.4)" stroke-width="1"/>
    <text x="${x + 12}" y="${y + 22}" font-family="Arial, Helvetica, sans-serif" 
          font-size="13" font-weight="600" fill="#CE93D8">⏰ Nur noch ${hoursLeft}h gültig!</text>
</g>`,

    // Countdown timer display
    countdownTimer: (x, y, hours = 23, minutes = 59, seconds = 59) => `
<g>
    <rect x="${x}" y="${y}" width="180" height="50" rx="12" fill="rgba(0,0,0,0.4)" 
          stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <text x="${x + 90}" y="${y + 16}" font-family="Arial, Helvetica, sans-serif" 
          font-size="10" font-weight="500" fill="rgba(255,255,255,0.6)" text-anchor="middle">ENDET IN</text>
    <text x="${x + 90}" y="${y + 40}" font-family="Arial, Helvetica, sans-serif" 
          font-size="24" font-weight="700" fill="#FF4444" text-anchor="middle"
          letter-spacing="2">${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}</text>
</g>`,

    // People viewing indicator
    viewingNow: (x, y, count = 23) => `
<g>
    <rect x="${x}" y="${y}" width="170" height="32" rx="6" fill="rgba(76,175,80,0.15)" 
          stroke="rgba(76,175,80,0.4)" stroke-width="1"/>
    <text x="${x + 12}" y="${y + 22}" font-family="Arial, Helvetica, sans-serif" 
          font-size="13" font-weight="600" fill="#81C784">👀 ${count} schauen gerade</text>
</g>`,
};

// ============================================================
// BUNDLE / PACKAGE INDICATORS
// ============================================================

export const BUNDLE_ELEMENTS = {
    // Bundle badge
    bundleBadge: (x, y, itemCount = 3) => `
<g>
    <rect x="${x}" y="${y}" width="120" height="36" rx="18" fill="#7C4DFF"/>
    <rect x="${x}" y="${y}" width="120" height="18" rx="18" fill="rgba(255,255,255,0.15)"/>
    <text x="${x + 60}" y="${y + 24}" font-family="Arial, Helvetica, sans-serif" 
          font-size="13" font-weight="700" fill="#FFFFFF" text-anchor="middle">📦 ${itemCount}er Set</text>
</g>`,

    // "Includes" list
    bundleIncludes: (x, y, items = []) => {
        let svg = '<g>';
        items.forEach((item, i) => {
            svg += `
<text x="${x}" y="${y + i * 28}" font-family="Arial, Helvetica, sans-serif" 
      font-size="14" fill="rgba(255,255,255,0.8)">✓ ${item}</text>`;
        });
        svg += '</g>';
        return svg;
    },

    // Value proposition
    valueProp: (x, y, totalValue, bundlePrice, currency = '€') => `
<g>
    <text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" 
          font-size="14" fill="rgba(255,255,255,0.6)">Gesamtwert: ${totalValue}${currency}</text>
    <text x="${x}" y="${y + 30}" font-family="Arial, Helvetica, sans-serif" 
          font-size="14" fill="rgba(255,255,255,0.6)">Dein Preis:</text>
    <text x="${x + 90}" y="${y + 30}" font-family="Arial, Helvetica, sans-serif" 
          font-size="28" font-weight="800" fill="#00E676">${bundlePrice}${currency}</text>
</g>`,
};

// ============================================================
// SHIPPING & DELIVERY INFO
// ============================================================

export const SHIPPING_INFO = {
    // Delivery estimate
    deliveryEstimate: (x, y, dateRange = 'Mo, 20. - Mi, 22. Jan') => `
<g>
    <rect x="${x}" y="${y}" width="240" height="44" rx="10" 
          fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <text x="${x + 14}" y="${y + 18}" font-family="Arial, Helvetica, sans-serif" 
          font-size="11" fill="rgba(255,255,255,0.5)">Lieferung</text>
    <text x="${x + 14}" y="${y + 34}" font-family="Arial, Helvetica, sans-serif" 
          font-size="14" font-weight="600" fill="rgba(255,255,255,0.9)">${dateRange}</text>
</g>`,

    // Prime-style delivery
    expressDelivery: (x, y) => `
<g>
    <rect x="${x}" y="${y}" width="180" height="44" rx="10" 
          fill="rgba(0,200,83,0.1)" stroke="rgba(0,200,83,0.3)" stroke-width="1"/>
    <text x="${x + 14}" y="${y + 18}" font-family="Arial, Helvetica, sans-serif" 
          font-size="11" fill="rgba(0,200,83,0.8)">EXPRESS</text>
    <text x="${x + 14}" y="${y + 34}" font-family="Arial, Helvetica, sans-serif" 
          font-size="14" font-weight="600" fill="#00C853">Morgen bei dir!</text>
</g>`,
};

// ============================================================
// SOCIAL PROOF ELEMENTS
// ============================================================

export const SOCIAL_PROOF = {
    // Customer count
    customerCount: (x, y, count = '10.000+') => `
<g>
    <text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" 
          font-size="14" fill="rgba(255,255,255,0.7)">Bereits</text>
    <text x="${x + 50}" y="${y}" font-family="Arial, Helvetica, sans-serif" 
          font-size="14" font-weight="700" fill="#FFFFFF">${count}</text>
    <text x="${x + 120}" y="${y}" font-family="Arial, Helvetica, sans-serif" 
          font-size="14" fill="rgba(255,255,255,0.7)">zufriedene Kunden</text>
</g>`,

    // Trust logos placeholder
    trustLogos: (x, y) => `
<g>
    <rect x="${x}" y="${y}" width="60" height="30" rx="4" fill="rgba(255,255,255,0.1)"/>
    <rect x="${x + 70}" y="${y}" width="60" height="30" rx="4" fill="rgba(255,255,255,0.1)"/>
    <rect x="${x + 140}" y="${y}" width="60" height="30" rx="4" fill="rgba(255,255,255,0.1)"/>
</g>`,

    // Review snippet
    reviewSnippet: (x, y, text, author, rating = 5) => `
<g>
    <rect x="${x}" y="${y}" width="280" height="80" rx="12" 
          fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <text x="${x + 16}" y="${y + 22}" font-family="Arial, Helvetica, sans-serif" 
          font-size="12" fill="#FFB300">${'★'.repeat(rating)}</text>
    <text x="${x + 16}" y="${y + 46}" font-family="Arial, Helvetica, sans-serif" 
          font-size="13" fill="rgba(255,255,255,0.85)">"${text}"</text>
    <text x="${x + 16}" y="${y + 68}" font-family="Arial, Helvetica, sans-serif" 
          font-size="11" fill="rgba(255,255,255,0.5)">– ${author}</text>
</g>`,
};

// ============================================================
// COMPLETE E-COMMERCE OVERLAY GENERATOR
// ============================================================

export function generateEcommerceOverlay(config) {
    const {
        canvasSize = 1080,
        // Price info
        showPrice = false,
        price = null,
        originalPrice = null,
        currency = '€',
        // Discount
        showDiscount = false,
        discountPercent = null,
        // Trust badges
        showTrustBadges = true,
        trustBadges = ['shipping', 'guarantee'],
        // Rating
        showRating = false,
        rating = 5,
        reviewCount = null,
        // Urgency
        showUrgency = false,
        urgencyType = 'lowStock', // 'lowStock', 'sellingFast', 'limitedTime', 'countdown'
        urgencyValue = 3,
        // Layout positions
        pricePosition = { x: 600, y: 800 },
        trustPosition = { x: 50, y: 1000 },
        ratingPosition = { x: 50, y: 900 },
        urgencyPosition = { x: 50, y: 950 },
        discountPosition = { x: 920, y: 50 },
    } = config;

    let svg = `<svg width="${canvasSize}" height="${canvasSize}" xmlns="http://www.w3.org/2000/svg">
<defs>
    <filter id="premiumTextShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.5)"/>
    </filter>
</defs>
`;

    // Discount badge
    if (showDiscount && discountPercent) {
        svg += PRICE_ELEMENTS.percentOff(discountPosition.x, discountPosition.y, discountPercent, 'large');
    }

    // Price display
    if (showPrice && price) {
        if (originalPrice) {
            svg += PRICE_ELEMENTS.salePrice(pricePosition.x, pricePosition.y, originalPrice, price, currency);
        } else {
            svg += PRICE_ELEMENTS.priceTag(pricePosition.x, pricePosition.y, price, currency);
        }
    }

    // Star rating
    if (showRating) {
        svg += RATINGS.starRating(ratingPosition.x, ratingPosition.y, rating, reviewCount, 'medium');
    }

    // Urgency indicator
    if (showUrgency) {
        switch (urgencyType) {
            case 'lowStock':
                svg += URGENCY.lowStock(urgencyPosition.x, urgencyPosition.y, urgencyValue);
                break;
            case 'sellingFast':
                svg += URGENCY.sellingFast(urgencyPosition.x, urgencyPosition.y);
                break;
            case 'limitedTime':
                svg += URGENCY.limitedTime(urgencyPosition.x, urgencyPosition.y, urgencyValue);
                break;
            case 'countdown':
                svg += URGENCY.countdownTimer(urgencyPosition.x, urgencyPosition.y, 23, 59, 59);
                break;
        }
    }

    // Trust badges
    if (showTrustBadges && trustBadges.length > 0) {
        svg += TRUST_BADGES.trustBadgeRow(trustPosition.x, trustPosition.y, trustBadges);
    }

    svg += `</svg>`;
    return svg;
}

// ============================================================
// EXPORTS
// ============================================================

export default {
    PRICE_ELEMENTS,
    DISCOUNT_ELEMENTS,
    TRUST_BADGES,
    RATINGS,
    URGENCY,
    BUNDLE_ELEMENTS,
    SHIPPING_INFO,
    SOCIAL_PROOF,
    generateEcommerceOverlay,
};
