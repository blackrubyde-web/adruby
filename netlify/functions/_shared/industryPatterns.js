/**
 * INDUSTRY-SPECIFIC AD TEMPLATES
 * 
 * Templates for specific industries:
 * - SIMPLE_PRODUCT - Clean e-commerce product showcase
 * - SAAS_FEATURES - Software/App feature highlight
 * - COACH_AUTHORITY - Personal brand/coaching ads
 * - REAL_ESTATE - Property listing style
 * - TESTIMONIAL_QUOTE - Customer review focused
 * - BEFORE_AFTER - Transformation ads
 * - STATS_IMPACT - Data/results focused
 * - LIFESTYLE_CONTEXT - Product in use
 */

// ============================================================
// PATTERN 6: SIMPLE PRODUCT (Clean E-Commerce)
// Clean background, prominent product, minimal text
// ============================================================

export const SIMPLE_PRODUCT_PATTERN = {
    id: 'simple_product',
    name: 'Simple Product',
    description: 'Clean, minimal product showcase with price and CTA',
    bestFor: ['ecommerce', 'retail', 'physical_products'],

    canvas: { width: 1080, height: 1080 },

    generateSVG: (config) => {
        const {
            canvas = { width: 1080, height: 1080 },
            bgColor = '#FFFFFF',
            accentColor = '#1A1A1A',
            productName = '',
            tagline = '',
            price = '',
            originalPrice = '',
            badge = '', // "NEU", "BESTSELLER", "-30%"
            ctaText = 'Jetzt kaufen',
            showRating = false,
            rating = 5,
            reviewCount = 0,
        } = config;

        const w = canvas.width;
        const h = canvas.height;
        const isDark = bgColor.toLowerCase() !== '#ffffff' && bgColor.toLowerCase() !== '#fff';
        const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
        const mutedColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';

        let svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<!-- Background -->
<rect width="100%" height="100%" fill="${bgColor}"/>

<!-- Subtle gradient overlay -->
<defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1"/>
        <stop offset="100%" style="stop-color:${isDark ? '#000000' : '#F5F5F5'};stop-opacity:0.3"/>
    </linearGradient>
</defs>
<rect width="100%" height="100%" fill="url(#bgGradient)"/>
`;

        // Badge (top right)
        if (badge) {
            const badgeBg = badge.includes('%') ? '#EF4444' : badge === 'NEU' ? '#3B82F6' : '#F59E0B';
            svg += `
<!-- Badge -->
<rect x="${w - 150}" y="30" width="120" height="44" rx="22" fill="${badgeBg}"/>
<text x="${w - 90}" y="58" font-family="Arial, Helvetica, sans-serif" 
      font-size="18" font-weight="700" fill="#FFFFFF" text-anchor="middle">${badge}</text>
`;
        }

        // Product name (top left)
        if (productName) {
            svg += `
<!-- Product Name -->
<text x="50" y="70" font-family="Arial, Helvetica, sans-serif" 
      font-size="28" font-weight="600" fill="${textColor}">${productName}</text>
`;
        }

        // Tagline
        if (tagline) {
            svg += `
<!-- Tagline -->
<text x="50" y="105" font-family="Arial, Helvetica, sans-serif" 
      font-size="18" fill="${mutedColor}">${tagline}</text>
`;
        }

        // Rating
        if (showRating && rating) {
            const stars = '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '');
            svg += `
<!-- Rating -->
<text x="50" y="${h - 150}" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#FBBF24">${stars}</text>
<text x="${55 + rating * 24}" y="${h - 150}" font-family="Arial, Helvetica, sans-serif" 
      font-size="16" fill="${mutedColor}">(${reviewCount})</text>
`;
        }

        // Price section (bottom)
        if (price) {
            const priceY = h - 100;
            if (originalPrice) {
                svg += `
<!-- Original Price (strikethrough) -->
<text x="50" y="${priceY - 30}" font-family="Arial, Helvetica, sans-serif" 
      font-size="22" fill="${mutedColor}" text-decoration="line-through">${originalPrice}</text>
`;
            }
            svg += `
<!-- Sale Price -->
<text x="50" y="${priceY}" font-family="Arial, Helvetica, sans-serif" 
      font-size="42" font-weight="800" fill="${originalPrice ? '#EF4444' : textColor}">${price}</text>
`;
        }

        // CTA Button
        if (ctaText) {
            const ctaWidth = ctaText.length * 14 + 60;
            svg += `
<!-- CTA Button -->
<rect x="${w - ctaWidth - 40}" y="${h - 110}" width="${ctaWidth}" height="50" rx="25" fill="${accentColor}"/>
<text x="${w - ctaWidth / 2 - 40}" y="${h - 78}" font-family="Arial, Helvetica, sans-serif" 
      font-size="18" font-weight="600" fill="${isDark ? '#1A1A1A' : '#FFFFFF'}" text-anchor="middle">${ctaText}</text>
`;
        }

        svg += `</svg>`;
        return svg;
    },
};

// ============================================================
// PATTERN 7: SAAS FEATURES (Software/App)
// Feature cards, modern UI aesthetic
// ============================================================

export const SAAS_FEATURES_PATTERN = {
    id: 'saas_features',
    name: 'SaaS Features',
    description: 'Modern software feature showcase with icons and benefits',
    bestFor: ['saas', 'software', 'apps', 'tools'],

    canvas: { width: 1080, height: 1080 },

    generateSVG: (config) => {
        const {
            canvas = { width: 1080, height: 1080 },
            bgColor = '#0F172A', // Dark blue
            accentColor = '#3B82F6', // Blue
            headline = 'The smarter way to work',
            subheadline = 'Boost your productivity by 10x',
            features = [], // [{ icon: '⚡', title: 'Fast', description: '10x faster' }]
            ctaText = 'Start Free Trial',
            showPricing = false,
            price = '',
            pricePeriod = '/mo',
        } = config;

        const w = canvas.width;
        const h = canvas.height;

        let svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<!-- Background -->
<rect width="100%" height="100%" fill="${bgColor}"/>

<!-- Gradient overlay -->
<defs>
    <radialGradient id="glowGradient" cx="50%" cy="30%" r="60%">
        <stop offset="0%" style="stop-color:${accentColor};stop-opacity:0.15"/>
        <stop offset="100%" style="stop-color:${bgColor};stop-opacity:0"/>
    </radialGradient>
</defs>
<rect width="100%" height="100%" fill="url(#glowGradient)"/>

<!-- Headline -->
<text x="${w / 2}" y="100" font-family="Arial, Helvetica, sans-serif" 
      font-size="48" font-weight="800" fill="#FFFFFF" text-anchor="middle">${headline}</text>

<!-- Subheadline -->
<text x="${w / 2}" y="150" font-family="Arial, Helvetica, sans-serif" 
      font-size="22" fill="rgba(255,255,255,0.7)" text-anchor="middle">${subheadline}</text>
`;

        // Feature cards (2x2 grid or 3 vertical)
        const featureStartY = 220;
        const cardWidth = 300;
        const cardHeight = 140;
        const gap = 30;

        features.slice(0, 4).forEach((feature, i) => {
            const row = Math.floor(i / 2);
            const col = i % 2;
            const cardX = col === 0 ? (w / 2 - cardWidth - gap / 2) : (w / 2 + gap / 2);
            const cardY = featureStartY + (row * (cardHeight + gap));

            svg += `
<!-- Feature Card ${i + 1} -->
<rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" rx="16" 
      fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
<text x="${cardX + 25}" y="${cardY + 45}" font-size="32">${feature.icon || '✨'}</text>
<text x="${cardX + 70}" y="${cardY + 45}" font-family="Arial, Helvetica, sans-serif" 
      font-size="20" font-weight="600" fill="#FFFFFF">${feature.title || ''}</text>
<text x="${cardX + 25}" y="${cardY + 80}" font-family="Arial, Helvetica, sans-serif" 
      font-size="16" fill="rgba(255,255,255,0.6)">${feature.description || ''}</text>
`;
        });

        // Pricing (optional)
        if (showPricing && price) {
            svg += `
<!-- Pricing -->
<text x="${w / 2}" y="${h - 180}" font-family="Arial, Helvetica, sans-serif" text-anchor="middle">
    <tspan font-size="48" font-weight="800" fill="#FFFFFF">${price}</tspan>
    <tspan font-size="20" fill="rgba(255,255,255,0.6)">${pricePeriod}</tspan>
</text>
`;
        }

        // CTA Button
        if (ctaText) {
            const ctaWidth = 280;
            svg += `
<!-- CTA Button -->
<rect x="${(w - ctaWidth) / 2}" y="${h - 120}" width="${ctaWidth}" height="56" rx="28" fill="${accentColor}"/>
<text x="${w / 2}" y="${h - 84}" font-family="Arial, Helvetica, sans-serif" 
      font-size="18" font-weight="600" fill="#FFFFFF" text-anchor="middle">${ctaText}</text>
`;
        }

        svg += `</svg>`;
        return svg;
    },
};

// ============================================================
// PATTERN 8: COACH AUTHORITY (Personal Brand/Coaching)
// Photo-centric, testimonial, authority building
// ============================================================

export const COACH_AUTHORITY_PATTERN = {
    id: 'coach_authority',
    name: 'Coach Authority',
    description: 'Personal brand/coaching with authority positioning',
    bestFor: ['coaches', 'consultants', 'personal_brand', 'courses'],

    canvas: { width: 1080, height: 1080 },

    generateSVG: (config) => {
        const {
            canvas = { width: 1080, height: 1080 },
            bgColor = '#1A1A1A',
            accentColor = '#F59E0B', // Gold
            coachName = '',
            title = '', // "Business Coach"
            headline = '',
            credentials = [], // ["10+ Jahre Erfahrung", "500+ Kunden"]
            ctaText = 'Kostenloses Erstgespräch',
            testimonialQuote = '',
            testimonialAuthor = '',
        } = config;

        const w = canvas.width;
        const h = canvas.height;

        let svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<!-- Background -->
<rect width="100%" height="100%" fill="${bgColor}"/>

<!-- Accent line at top -->
<rect x="50" y="40" width="80" height="4" fill="${accentColor}"/>

<!-- Coach name & title -->
<text x="50" y="90" font-family="Arial, Helvetica, sans-serif" 
      font-size="16" fill="${accentColor}" letter-spacing="3">${title.toUpperCase()}</text>
<text x="50" y="140" font-family="Arial, Helvetica, sans-serif" 
      font-size="42" font-weight="700" fill="#FFFFFF">${coachName}</text>
`;

        // Headline (main value prop)
        if (headline) {
            const lines = headline.split('\n');
            lines.forEach((line, i) => {
                svg += `
<text x="50" y="${220 + i * 50}" font-family="Georgia, serif" 
      font-size="36" font-weight="400" fill="#FFFFFF" font-style="italic">${line}</text>
`;
            });
        }

        // Credentials
        if (credentials.length > 0) {
            const credY = 380;
            credentials.forEach((cred, i) => {
                svg += `
<rect x="50" y="${credY + i * 50}" width="10" height="10" fill="${accentColor}"/>
<text x="75" y="${credY + i * 50 + 10}" font-family="Arial, Helvetica, sans-serif" 
      font-size="18" fill="rgba(255,255,255,0.8)">${cred}</text>
`;
            });
        }

        // Testimonial quote
        if (testimonialQuote) {
            svg += `
<!-- Testimonial -->
<text x="50" y="${h - 200}" font-family="Arial, Helvetica, sans-serif" 
      font-size="42" fill="${accentColor}">"</text>
<text x="50" y="${h - 150}" font-family="Georgia, serif" 
      font-size="18" fill="rgba(255,255,255,0.9)" font-style="italic">${testimonialQuote}</text>
<text x="50" y="${h - 115}" font-family="Arial, Helvetica, sans-serif" 
      font-size="14" fill="rgba(255,255,255,0.6)">– ${testimonialAuthor}</text>
`;
        }

        // CTA Button
        if (ctaText) {
            svg += `
<!-- CTA Button -->
<rect x="50" y="${h - 80}" width="320" height="56" rx="4" fill="${accentColor}"/>
<text x="210" y="${h - 44}" font-family="Arial, Helvetica, sans-serif" 
      font-size="16" font-weight="600" fill="#1A1A1A" text-anchor="middle">${ctaText}</text>
`;
        }

        svg += `</svg>`;
        return svg;
    },
};

// ============================================================
// PATTERN 9: REAL ESTATE (Property Listing)
// Property focused with key specs
// ============================================================

export const REAL_ESTATE_PATTERN = {
    id: 'real_estate',
    name: 'Real Estate',
    description: 'Property listing style with key specifications',
    bestFor: ['real_estate', 'property', 'rentals', 'luxury_homes'],

    canvas: { width: 1080, height: 1080 },

    generateSVG: (config) => {
        const {
            canvas = { width: 1080, height: 1080 },
            overlayColor = 'rgba(0,0,0,0.4)',
            accentColor = '#FFFFFF',
            propertyType = 'Luxuswohnung', // "Haus", "Wohnung", "Villa"
            location = '',
            price = '',
            priceType = '', // "Kaufpreis", "Miete/Monat"
            specs = [], // [{ icon: '🛏', value: '3', label: 'Zimmer' }]
            agentName = '',
            agentTitle = '',
            ctaText = 'Besichtigung vereinbaren',
        } = config;

        const w = canvas.width;
        const h = canvas.height;

        let svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<!-- Overlay gradient (for photo background) -->
<defs>
    <linearGradient id="photoOverlay" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:rgba(0,0,0,0.2);stop-opacity:1"/>
        <stop offset="60%" style="stop-color:rgba(0,0,0,0.1);stop-opacity:1"/>
        <stop offset="100%" style="stop-color:rgba(0,0,0,0.8);stop-opacity:1"/>
    </linearGradient>
</defs>
<rect width="100%" height="100%" fill="url(#photoOverlay)"/>

<!-- Property type badge -->
<rect x="40" y="40" width="${propertyType.length * 14 + 40}" height="40" rx="4" fill="rgba(255,255,255,0.9)"/>
<text x="60" y="67" font-family="Arial, Helvetica, sans-serif" 
      font-size="16" font-weight="600" fill="#1A1A1A">${propertyType}</text>
`;

        // Location
        if (location) {
            svg += `
<text x="50" y="${h - 280}" font-family="Arial, Helvetica, sans-serif" 
      font-size="20" fill="rgba(255,255,255,0.8)">📍 ${location}</text>
`;
        }

        // Price
        if (price) {
            svg += `
<text x="50" y="${h - 220}" font-family="Arial, Helvetica, sans-serif" 
      font-size="48" font-weight="800" fill="#FFFFFF">${price}</text>
<text x="50" y="${h - 185}" font-family="Arial, Helvetica, sans-serif" 
      font-size="16" fill="rgba(255,255,255,0.6)">${priceType}</text>
`;
        }

        // Specs row
        if (specs.length > 0) {
            const specY = h - 130;
            const specWidth = 120;
            specs.slice(0, 4).forEach((spec, i) => {
                const specX = 50 + (i * specWidth);
                svg += `
<text x="${specX}" y="${specY}" font-size="24">${spec.icon}</text>
<text x="${specX + 35}" y="${specY}" font-family="Arial, Helvetica, sans-serif">
    <tspan font-size="22" font-weight="700" fill="#FFFFFF">${spec.value}</tspan>
    <tspan font-size="14" fill="rgba(255,255,255,0.7)"> ${spec.label}</tspan>
</text>
`;
            });
        }

        // CTA Button
        if (ctaText) {
            svg += `
<!-- CTA Button -->
<rect x="${w - 320}" y="${h - 80}" width="280" height="50" rx="4" fill="${accentColor}"/>
<text x="${w - 180}" y="${h - 48}" font-family="Arial, Helvetica, sans-serif" 
      font-size="16" font-weight="600" fill="#1A1A1A" text-anchor="middle">${ctaText}</text>
`;
        }

        svg += `</svg>`;
        return svg;
    },
};

// ============================================================
// PATTERN 10: BEFORE AFTER (Transformation)
// Side-by-side or slider style transformation
// ============================================================

export const BEFORE_AFTER_PATTERN = {
    id: 'before_after',
    name: 'Before/After',
    description: 'Transformation showcase with before/after comparison',
    bestFor: ['fitness', 'beauty', 'home_improvement', 'cleaning'],

    canvas: { width: 1080, height: 1080 },

    generateSVG: (config) => {
        const {
            canvas = { width: 1080, height: 1080 },
            headline = '',
            beforeLabel = 'VORHER',
            afterLabel = 'NACHHER',
            timeframe = '', // "Nach 8 Wochen"
            ctaText = 'Jetzt starten',
            accentColor = '#10B981',
        } = config;

        const w = canvas.width;
        const h = canvas.height;

        let svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<!-- Split background hint -->
<rect x="0" y="0" width="${w / 2}" height="${h}" fill="rgba(239,68,68,0.05)"/>
<rect x="${w / 2}" y="0" width="${w / 2}" height="${h}" fill="rgba(16,185,129,0.05)"/>

<!-- Divider line -->
<line x1="${w / 2}" y1="120" x2="${w / 2}" y2="${h - 150}" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>

<!-- Before label -->
<rect x="${w * 0.25 - 50}" y="80" width="100" height="32" rx="4" fill="rgba(239,68,68,0.2)"/>
<text x="${w * 0.25}" y="102" font-family="Arial, Helvetica, sans-serif" 
      font-size="14" font-weight="700" fill="#EF4444" text-anchor="middle">${beforeLabel}</text>

<!-- After label -->
<rect x="${w * 0.75 - 50}" y="80" width="100" height="32" rx="4" fill="rgba(16,185,129,0.2)"/>
<text x="${w * 0.75}" y="102" font-family="Arial, Helvetica, sans-serif" 
      font-size="14" font-weight="700" fill="${accentColor}" text-anchor="middle">${afterLabel}</text>
`;

        // Headline
        if (headline) {
            svg += `
<text x="${w / 2}" y="50" font-family="Arial, Helvetica, sans-serif" 
      font-size="32" font-weight="700" fill="#FFFFFF" text-anchor="middle">${headline}</text>
`;
        }

        // Timeframe
        if (timeframe) {
            svg += `
<rect x="${w / 2 - 80}" y="${h - 200}" width="160" height="40" rx="20" fill="${accentColor}"/>
<text x="${w / 2}" y="${h - 173}" font-family="Arial, Helvetica, sans-serif" 
      font-size="16" font-weight="600" fill="#FFFFFF" text-anchor="middle">${timeframe}</text>
`;
        }

        // CTA Button
        if (ctaText) {
            svg += `
<rect x="${(w - 240) / 2}" y="${h - 100}" width="240" height="54" rx="27" fill="${accentColor}"/>
<text x="${w / 2}" y="${h - 66}" font-family="Arial, Helvetica, sans-serif" 
      font-size="18" font-weight="600" fill="#FFFFFF" text-anchor="middle">${ctaText}</text>
`;
        }

        svg += `</svg>`;
        return svg;
    },
};

// ============================================================
// PATTERN 11: STATS IMPACT (Results/Numbers)
// Big numbers, impact focused
// ============================================================

export const STATS_IMPACT_PATTERN = {
    id: 'stats_impact',
    name: 'Stats Impact',
    description: 'Big numbers and impressive statistics',
    bestFor: ['results', 'case_studies', 'performance', 'roi'],

    canvas: { width: 1080, height: 1080 },

    generateSVG: (config) => {
        const {
            canvas = { width: 1080, height: 1080 },
            bgColor = '#0F172A',
            accentColor = '#3B82F6',
            headline = '',
            stats = [], // [{ value: '300%', label: 'mehr Umsatz', prefix: '+' }]
            ctaText = '',
            logoText = '',
        } = config;

        const w = canvas.width;
        const h = canvas.height;

        let svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<!-- Background -->
<rect width="100%" height="100%" fill="${bgColor}"/>

<!-- Headline -->
<text x="${w / 2}" y="100" font-family="Arial, Helvetica, sans-serif" 
      font-size="36" font-weight="600" fill="#FFFFFF" text-anchor="middle">${headline}</text>
`;

        // Stats (big numbers)
        const statStartY = 220;
        const statSpacing = 200;

        stats.slice(0, 3).forEach((stat, i) => {
            const statY = statStartY + (i * statSpacing);
            svg += `
<!-- Stat ${i + 1} -->
<text x="${w / 2}" y="${statY}" font-family="Arial, Helvetica, sans-serif" text-anchor="middle">
    <tspan font-size="96" font-weight="800" fill="${accentColor}">${stat.prefix || ''}${stat.value}</tspan>
</text>
<text x="${w / 2}" y="${statY + 50}" font-family="Arial, Helvetica, sans-serif" 
      font-size="24" fill="rgba(255,255,255,0.7)" text-anchor="middle">${stat.label}</text>
`;
        });

        // CTA
        if (ctaText) {
            svg += `
<rect x="${(w - 280) / 2}" y="${h - 120}" width="280" height="56" rx="28" fill="${accentColor}"/>
<text x="${w / 2}" y="${h - 84}" font-family="Arial, Helvetica, sans-serif" 
      font-size="18" font-weight="600" fill="#FFFFFF" text-anchor="middle">${ctaText}</text>
`;
        }

        // Logo
        if (logoText) {
            svg += `
<text x="${w / 2}" y="${h - 40}" font-family="Arial, Helvetica, sans-serif" 
      font-size="20" font-weight="600" fill="rgba(255,255,255,0.5)" text-anchor="middle">${logoText}</text>
`;
        }

        svg += `</svg>`;
        return svg;
    },
};

// ============================================================
// PATTERN 12: LIFESTYLE CONTEXT (Product in Use)
// Lifestyle photography overlay style
// ============================================================

export const LIFESTYLE_CONTEXT_PATTERN = {
    id: 'lifestyle_context',
    name: 'Lifestyle Context',
    description: 'Product shown in lifestyle/usage context',
    bestFor: ['lifestyle', 'fashion', 'home', 'wellness'],

    canvas: { width: 1080, height: 1080 },

    generateSVG: (config) => {
        const {
            canvas = { width: 1080, height: 1080 },
            overlayPosition = 'bottom', // 'bottom', 'top', 'left'
            headline = '',
            subheadline = '',
            price = '',
            ctaText = '',
            brandName = '',
        } = config;

        const w = canvas.width;
        const h = canvas.height;

        let svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<!-- Gradient overlay for text readability -->
<defs>
    <linearGradient id="textOverlay" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:rgba(0,0,0,0);stop-opacity:1"/>
        <stop offset="50%" style="stop-color:rgba(0,0,0,0);stop-opacity:1"/>
        <stop offset="100%" style="stop-color:rgba(0,0,0,0.7);stop-opacity:1"/>
    </linearGradient>
</defs>
<rect width="100%" height="100%" fill="url(#textOverlay)"/>
`;

        // Brand name (top)
        if (brandName) {
            svg += `
<text x="50" y="60" font-family="Arial, Helvetica, sans-serif" 
      font-size="20" font-weight="600" fill="#FFFFFF" letter-spacing="2">${brandName.toUpperCase()}</text>
`;
        }

        // Headline (bottom)
        if (headline) {
            svg += `
<text x="50" y="${h - 150}" font-family="Georgia, serif" 
      font-size="42" font-weight="400" fill="#FFFFFF">${headline}</text>
`;
        }

        // Subheadline
        if (subheadline) {
            svg += `
<text x="50" y="${h - 100}" font-family="Arial, Helvetica, sans-serif" 
      font-size="20" fill="rgba(255,255,255,0.8)">${subheadline}</text>
`;
        }

        // Price & CTA row
        if (price || ctaText) {
            if (price) {
                svg += `
<text x="50" y="${h - 50}" font-family="Arial, Helvetica, sans-serif" 
      font-size="28" font-weight="700" fill="#FFFFFF">${price}</text>
`;
            }
            if (ctaText) {
                svg += `
<rect x="${w - 220}" y="${h - 80}" width="180" height="48" rx="24" fill="#FFFFFF"/>
<text x="${w - 130}" y="${h - 49}" font-family="Arial, Helvetica, sans-serif" 
      font-size="16" font-weight="600" fill="#1A1A1A" text-anchor="middle">${ctaText}</text>
`;
            }
        }

        svg += `</svg>`;
        return svg;
    },
};

// ============================================================
// ALL INDUSTRY PATTERNS COLLECTION
// ============================================================

export const INDUSTRY_PATTERNS = {
    simple_product: SIMPLE_PRODUCT_PATTERN,
    saas_features: SAAS_FEATURES_PATTERN,
    coach_authority: COACH_AUTHORITY_PATTERN,
    real_estate: REAL_ESTATE_PATTERN,
    before_after: BEFORE_AFTER_PATTERN,
    stats_impact: STATS_IMPACT_PATTERN,
    lifestyle_context: LIFESTYLE_CONTEXT_PATTERN,
};

// ============================================================
// INDUSTRY AUTO-SELECTOR
// ============================================================

export function selectPatternForIndustry(industry, context = {}) {
    const {
        hasCompetitor = false,
        hasTransformation = false,
        hasStats = false,
        hasTestimonial = false,
        featureCount = 0,
    } = context;

    // Industry-specific defaults
    const industryMap = {
        'ecommerce': 'simple_product',
        'retail': 'simple_product',
        'saas': 'saas_features',
        'software': 'saas_features',
        'app': 'saas_features',
        'coach': 'coach_authority',
        'coaching': 'coach_authority',
        'consultant': 'coach_authority',
        'course': 'coach_authority',
        'real_estate': 'real_estate',
        'property': 'real_estate',
        'fitness': 'before_after',
        'beauty': 'before_after',
        'fashion': 'lifestyle_context',
        'lifestyle': 'lifestyle_context',
        'home': 'lifestyle_context',
    };

    // Override based on content
    if (hasTransformation) return 'before_after';
    if (hasStats && !hasCompetitor) return 'stats_impact';
    if (featureCount >= 3 && industry.includes('saas')) return 'saas_features';

    return industryMap[industry.toLowerCase()] || 'simple_product';
}

// ============================================================
// EXPORTS
// ============================================================

export default {
    SIMPLE_PRODUCT_PATTERN,
    SAAS_FEATURES_PATTERN,
    COACH_AUTHORITY_PATTERN,
    REAL_ESTATE_PATTERN,
    BEFORE_AFTER_PATTERN,
    STATS_IMPACT_PATTERN,
    LIFESTYLE_CONTEXT_PATTERN,
    INDUSTRY_PATTERNS,
    selectPatternForIndustry,
};
