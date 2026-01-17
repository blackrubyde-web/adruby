/**
 * INTELLIGENT AUTO-DESIGN ORCHESTRATOR
 * 
 * This is the brain of the ad creation system.
 * Given raw input data, it automatically:
 * 1. Analyzes the content
 * 2. Selects the optimal pattern
 * 3. Chooses the right visual style
 * 4. Determines which elements to show
 * 5. Calculates optimal positioning
 * 6. Generates the complete ad
 * 
 * The goal: Give it product data, get a professional ad.
 */

import {
    COMPARISON_TABLE_PATTERN,
    US_VS_THEM_SPLIT_PATTERN,
    FEATURE_CALLOUTS_DOTTED_PATTERN,
    CHECKMARK_COMPARISON_PATTERN,
    FEATURE_ARROWS_PATTERN,
} from './adPatternTemplates.js';

import {
    SIMPLE_PRODUCT_PATTERN,
    SAAS_FEATURES_PATTERN,
    COACH_AUTHORITY_PATTERN,
    REAL_ESTATE_PATTERN,
    BEFORE_AFTER_PATTERN,
    STATS_IMPACT_PATTERN,
    LIFESTYLE_CONTEXT_PATTERN,
} from './industryPatterns.js';

// ============================================================
// CONTENT ANALYZER
// Analyzes input data to understand what we're working with
// ============================================================

function analyzeContent(input) {
    const analysis = {
        // Content type detection
        hasPrice: Boolean(input.price),
        hasOriginalPrice: Boolean(input.originalPrice),
        hasDiscount: input.originalPrice && input.price && input.originalPrice > input.price,
        discountPercent: 0,

        // Features
        hasFeatures: Array.isArray(input.features) && input.features.length > 0,
        featureCount: Array.isArray(input.features) ? input.features.length : 0,

        // Comparison
        hasCompetitor: Boolean(input.competitor || input.competitorName || input.compareWith),
        hasComparisonData: Array.isArray(input.comparisonData) && input.comparisonData.length > 0,
        hasChecklistBenefits: Array.isArray(input.benefits) && input.benefits.length > 0,

        // Transformation
        hasBeforeAfter: Boolean(input.beforeImage || input.afterImage || input.transformation),

        // Stats
        hasStats: Array.isArray(input.stats) && input.stats.length > 0,

        // Testimonial
        hasTestimonial: Boolean(input.testimonial || input.testimonialQuote),

        // Ratings
        hasRating: Boolean(input.rating) && input.rating >= 4.0,

        // Urgency
        hasUrgency: Boolean(input.stockLevel === 'low' || input.endDate || input.urgency),

        // Industry detection
        industry: detectIndustry(input),

        // Campaign type
        campaignType: input.campaignType || 'evergreen',
        isSale: ['sale', 'flash_sale', 'black_friday', 'discount'].includes(input.campaignType),

        // Content richness
        contentScore: 0, // Will be calculated
    };

    // Calculate discount
    if (analysis.hasDiscount) {
        analysis.discountPercent = Math.round(
            ((input.originalPrice - input.price) / input.originalPrice) * 100
        );
    }

    // Calculate content score (how much we have to work with)
    analysis.contentScore = [
        analysis.hasPrice ? 2 : 0,
        analysis.hasDiscount ? 2 : 0,
        analysis.featureCount * 1.5,
        analysis.hasCompetitor ? 3 : 0,
        analysis.hasStats ? 2 : 0,
        analysis.hasTestimonial ? 2 : 0,
        analysis.hasRating ? 1 : 0,
        input.headline ? 2 : 0,
    ].reduce((a, b) => a + b, 0);

    return analysis;
}

// ============================================================
// INDUSTRY DETECTOR
// ============================================================

function detectIndustry(input) {
    const text = [
        input.productName,
        input.industry,
        input.category,
        input.headline,
        input.description,
        input.tagline,
        ...(input.features || []),
    ].join(' ').toLowerCase();

    // Priority-ordered industry detection (more specific first)
    const industryKeywords = {
        saas: ['saas', 'software', 'app', 'platform', 'tool', 'crm', 'erp', 'automation', 'ai', 'dashboard', 'analytics', 'api', 'cloud', 'subscription', 'trial', 'enterprise'],
        coaching: ['coach', 'coaching', 'mentor', 'mentoring', 'consultant', 'consulting', 'beratung', 'berater', 'training', 'kurs', 'course', 'workshop', 'webinar', 'masterclass', 'personal brand', 'experte', 'expert'],
        real_estate: ['immobilie', 'immobilien', 'haus', 'wohnung', 'apartment', 'villa', 'grundstück', 'miete', 'property', 'real estate', 'makler', 'zimmer', 'quadratmeter', 'm²', 'kaufen', 'vermieten'],
        fitness: ['fitness', 'gym', 'workout', 'abnehmen', 'muskel', 'training', 'sport', 'protein', 'weight loss', 'body', 'shape', 'cardio', 'strength', 'muscle', 'lean', 'bulk'],
        beauty: ['beauty', 'skincare', 'kosmetik', 'makeup', 'pflege', 'anti-aging', 'serum', 'creme', 'cream', 'glow', 'skin', 'face', 'hair', 'haare', 'nail', 'spa', 'wellness'],
        fashion: ['fashion', 'mode', 'kleidung', 'outfit', 'style', 'designer', 'wear', 'dress', 'shirt', 'jeans', 'accessoire', 'schmuck', 'jewelry', 'tasche', 'bag', 'shoes', 'schuhe'],
        food: ['food', 'essen', 'ernährung', 'vegan', 'bio', 'organic', 'supplement', 'vitamin', 'protein', 'snack', 'bar', 'drink', 'getränk', 'meal', 'mahlzeit', 'healthy', 'gesund', 'zucker', 'sugar'],
        tech: ['tech', 'elektronik', 'gadget', 'computer', 'phone', 'smartphone', 'tablet', 'laptop', 'smart', 'bluetooth', 'wifi', 'usb', 'display', 'audio', 'speaker', 'headphone', 'gaming'],
        home: ['home', 'wohnen', 'möbel', 'furniture', 'deko', 'dekoration', 'interior', 'küche', 'kitchen', 'living', 'schlafzimmer', 'bedroom', 'lampe', 'lamp', 'cushion', 'kissen'],
        toys: ['spielzeug', 'toys', 'kinder', 'kids', 'game', 'spiel', 'lego', 'plush', 'plüsch', 'puppe', 'doll', 'puzzle', 'educational', 'lernspiel'],
        automotive: ['auto', 'car', 'fahrzeug', 'vehicle', 'motor', 'reifen', 'tire', 'tuning', 'zubehör', 'accessories'],
        pets: ['haustier', 'pet', 'hund', 'dog', 'katze', 'cat', 'futter', 'pet food', 'tier', 'animal'],
        finance: ['finanz', 'finance', 'geld', 'money', 'investieren', 'invest', 'trading', 'aktie', 'stock', 'krypto', 'crypto', 'sparen', 'savings'],
        education: ['bildung', 'education', 'lernen', 'learn', 'schule', 'school', 'universität', 'university', 'studium', 'study', 'sprache', 'language'],
    };

    // Score each industry by keyword matches
    const scores = {};
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
        scores[industry] = keywords.filter(k => text.includes(k)).length;
    }

    // Find industry with highest score
    const topIndustry = Object.entries(scores)
        .filter(([_, score]) => score > 0)
        .sort((a, b) => b[1] - a[1])[0];

    if (topIndustry) return topIndustry[0];

    // Check explicit industry setting
    if (input.industry) return input.industry.toLowerCase();

    return 'ecommerce'; // Default
}

// ============================================================
// PATTERN SELECTOR
// Chooses the optimal pattern based on content analysis
// ============================================================

function selectOptimalPattern(analysis, input) {
    const {
        hasCompetitor,
        hasComparisonData,
        hasChecklistBenefits,
        hasBeforeAfter,
        hasStats,
        hasFeatures,
        featureCount,
        industry,
        isSale,
    } = analysis;

    // Decision tree for pattern selection

    // 1. Comparison patterns (highest impact)
    if (hasCompetitor && hasComparisonData) {
        return {
            pattern: COMPARISON_TABLE_PATTERN,
            patternId: 'comparison_table',
            reason: 'Competitor + comparison data → Data table comparison',
        };
    }

    if (hasCompetitor && hasChecklistBenefits) {
        // Choose between checkmark and split based on industry
        if (['beauty', 'wellness', 'coaching'].includes(industry)) {
            return {
                pattern: CHECKMARK_COMPARISON_PATTERN,
                patternId: 'checkmark_comparison',
                reason: 'Beauty/wellness industry + benefits → Checkmark comparison',
            };
        }
        return {
            pattern: US_VS_THEM_SPLIT_PATTERN,
            patternId: 'us_vs_them_split',
            reason: 'Competitor + benefits → US vs THEM split',
        };
    }

    // 2. Transformation patterns
    if (hasBeforeAfter) {
        return {
            pattern: BEFORE_AFTER_PATTERN,
            patternId: 'before_after',
            reason: 'Before/after content → Transformation pattern',
        };
    }

    // 3. Stats/results focused
    if (hasStats && !hasCompetitor) {
        return {
            pattern: STATS_IMPACT_PATTERN,
            patternId: 'stats_impact',
            reason: 'Strong stats → Impact numbers pattern',
        };
    }

    // 4. Industry-specific patterns
    if (industry === 'saas' || industry === 'software') {
        return {
            pattern: SAAS_FEATURES_PATTERN,
            patternId: 'saas_features',
            reason: 'SaaS industry → Feature cards pattern',
        };
    }

    if (industry === 'coaching' || industry === 'consultant') {
        return {
            pattern: COACH_AUTHORITY_PATTERN,
            patternId: 'coach_authority',
            reason: 'Coaching industry → Authority pattern',
        };
    }

    if (industry === 'real_estate' || industry === 'property') {
        return {
            pattern: REAL_ESTATE_PATTERN,
            patternId: 'real_estate',
            reason: 'Real estate → Property listing pattern',
        };
    }

    // 5. Feature-based patterns
    if (featureCount >= 5) {
        return {
            pattern: FEATURE_CALLOUTS_DOTTED_PATTERN,
            patternId: 'feature_callouts_dotted',
            reason: '5+ features → Dotted callout pattern',
        };
    }

    if (featureCount >= 2 && featureCount <= 4) {
        return {
            pattern: FEATURE_ARROWS_PATTERN,
            patternId: 'feature_arrows',
            reason: '2-4 features → Arrow callout pattern',
        };
    }

    // 6. Lifestyle industries
    if (['fashion', 'lifestyle', 'home'].includes(industry)) {
        return {
            pattern: LIFESTYLE_CONTEXT_PATTERN,
            patternId: 'lifestyle_context',
            reason: 'Lifestyle industry → Context pattern',
        };
    }

    // 7. Default: Simple product (works for most)
    return {
        pattern: SIMPLE_PRODUCT_PATTERN,
        patternId: 'simple_product',
        reason: 'Default → Simple product showcase',
    };
}

// ============================================================
// VISUAL STYLE SELECTOR
// ============================================================

function selectVisualStyle(analysis, input) {
    const { industry, isSale, campaignType } = analysis;

    // Campaign-based overrides
    if (isSale || campaignType === 'flash_sale') {
        return {
            style: 'high_energy',
            bgColor: '#1A0A0A',
            bgGradient: 'linear-gradient(135deg, #1A0A0A 0%, #2D1515 100%)',
            accentColor: '#EF4444',
            secondaryAccent: '#FBBF24',
            textColor: '#FFFFFF',
            mutedColor: 'rgba(255,255,255,0.7)',
        };
    }

    // Premium industry-based styles with gradients
    const styleMap = {
        saas: {
            style: 'professional',
            bgColor: '#0F172A',
            bgGradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            accentColor: '#3B82F6',
            secondaryAccent: '#06B6D4',
            textColor: '#FFFFFF',
            mutedColor: 'rgba(255,255,255,0.6)',
        },
        coaching: {
            style: 'authority',
            bgColor: '#1A1A1A',
            bgGradient: 'linear-gradient(180deg, #1A1A1A 0%, #0A0A0A 100%)',
            accentColor: '#F59E0B',
            secondaryAccent: '#D97706',
            textColor: '#FFFFFF',
            mutedColor: 'rgba(255,255,255,0.7)',
        },
        real_estate: {
            style: 'luxury',
            bgColor: 'transparent',
            bgGradient: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
            accentColor: '#FFFFFF',
            secondaryAccent: '#D4AF37',
            textColor: '#FFFFFF',
            mutedColor: 'rgba(255,255,255,0.8)',
        },
        beauty: {
            style: 'elegant',
            bgColor: '#FDF2F8',
            bgGradient: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)',
            accentColor: '#EC4899',
            secondaryAccent: '#DB2777',
            textColor: '#1F2937',
            mutedColor: 'rgba(31,41,55,0.6)',
        },
        fitness: {
            style: 'energy',
            bgColor: '#18181B',
            bgGradient: 'linear-gradient(135deg, #18181B 0%, #1F2937 100%)',
            accentColor: '#10B981',
            secondaryAccent: '#059669',
            textColor: '#FFFFFF',
            mutedColor: 'rgba(255,255,255,0.7)',
        },
        food: {
            style: 'warm',
            bgColor: '#FFFBEB',
            bgGradient: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            accentColor: '#F59E0B',
            secondaryAccent: '#D97706',
            textColor: '#1F2937',
            mutedColor: 'rgba(31,41,55,0.6)',
        },
        tech: {
            style: 'modern',
            bgColor: '#111827',
            bgGradient: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
            accentColor: '#6366F1',
            secondaryAccent: '#8B5CF6',
            textColor: '#FFFFFF',
            mutedColor: 'rgba(255,255,255,0.6)',
        },
        home: {
            style: 'cozy',
            bgColor: '#FEFCE8',
            bgGradient: 'linear-gradient(135deg, #FEFCE8 0%, #FEF9C3 100%)',
            accentColor: '#84CC16',
            secondaryAccent: '#65A30D',
            textColor: '#1F2937',
            mutedColor: 'rgba(31,41,55,0.6)',
        },
        toys: {
            style: 'playful',
            bgColor: '#F5F3FF',
            bgGradient: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
            accentColor: '#8B5CF6',
            secondaryAccent: '#EC4899',
            textColor: '#1F2937',
            mutedColor: 'rgba(31,41,55,0.6)',
        },
        fashion: {
            style: 'chic',
            bgColor: '#FAFAFA',
            bgGradient: 'linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 100%)',
            accentColor: '#1A1A1A',
            secondaryAccent: '#525252',
            textColor: '#1A1A1A',
            mutedColor: 'rgba(26,26,26,0.6)',
        },
        automotive: {
            style: 'bold',
            bgColor: '#0C0C0C',
            bgGradient: 'linear-gradient(135deg, #0C0C0C 0%, #1F1F1F 100%)',
            accentColor: '#DC2626',
            secondaryAccent: '#EA580C',
            textColor: '#FFFFFF',
            mutedColor: 'rgba(255,255,255,0.7)',
        },
        pets: {
            style: 'friendly',
            bgColor: '#ECFDF5',
            bgGradient: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            accentColor: '#059669',
            secondaryAccent: '#10B981',
            textColor: '#1F2937',
            mutedColor: 'rgba(31,41,55,0.6)',
        },
        finance: {
            style: 'trust',
            bgColor: '#0F172A',
            bgGradient: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)',
            accentColor: '#0EA5E9',
            secondaryAccent: '#22D3EE',
            textColor: '#FFFFFF',
            mutedColor: 'rgba(255,255,255,0.7)',
        },
        education: {
            style: 'academic',
            bgColor: '#1E3A5F',
            bgGradient: 'linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)',
            accentColor: '#FBBF24',
            secondaryAccent: '#F59E0B',
            textColor: '#FFFFFF',
            mutedColor: 'rgba(255,255,255,0.7)',
        },
        ecommerce: {
            style: 'clean',
            bgColor: '#FFFFFF',
            bgGradient: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)',
            accentColor: '#1A1A1A',
            secondaryAccent: '#4B5563',
            textColor: '#1A1A1A',
            mutedColor: 'rgba(26,26,26,0.5)',
        },
    };

    return styleMap[industry] || styleMap.ecommerce;
}

// ============================================================
// ELEMENT DECISION ENGINE
// ============================================================

function decideElements(analysis, input) {
    const elements = {
        showPrice: false,
        showOriginalPrice: false,
        showDiscountBadge: false,
        showTrustBadges: false,
        showRating: false,
        showUrgency: false,
        showCta: true,

        badge: null,
        trustBadges: [],
        urgencyType: null,
        urgencyValue: null,
    };

    // Price decisions
    if (analysis.hasPrice && !['coaching', 'real_estate'].includes(analysis.industry)) {
        elements.showPrice = true;

        if (analysis.hasDiscount) {
            elements.showOriginalPrice = true;
            if (analysis.discountPercent >= 15) {
                elements.showDiscountBadge = true;
            }
        }
    }

    // Trust badges for e-commerce
    if (['ecommerce', 'retail', 'beauty'].includes(analysis.industry)) {
        elements.showTrustBadges = true;
        elements.trustBadges = ['shipping', 'guarantee'];
    }

    // Rating display
    if (analysis.hasRating && input.reviewCount >= 10) {
        elements.showRating = true;
    }

    // Urgency
    if (analysis.hasUrgency && analysis.isSale) {
        elements.showUrgency = true;
        elements.urgencyType = input.stockLevel === 'low' ? 'lowStock' : 'limitedTime';
        elements.urgencyValue = input.stockLevel === 'low' ? 3 : 24;
    }

    // Badge text
    if (analysis.isSale) {
        elements.badge = analysis.discountPercent >= 20 ? `-${analysis.discountPercent}%` : 'SALE';
    } else if (input.isNew) {
        elements.badge = 'NEU';
    } else if (input.isBestseller) {
        elements.badge = 'BESTSELLER';
    }

    return elements;
}

// ============================================================
// CONTENT GENERATOR
// Generates pattern-specific configuration
// ============================================================

function generatePatternConfig(patternId, analysis, input, visualStyle, elements) {
    const baseConfig = {
        canvas: { width: 1080, height: 1080 },
        bgColor: visualStyle.bgColor,
        accentColor: visualStyle.accentColor,
    };

    switch (patternId) {
        case 'comparison_table':
            return {
                ...baseConfig,
                headline: input.headline ? input.headline.split('\n') : ['Your headline', 'goes here'],
                leftProduct: { name: input.competitorName || 'Competitor' },
                rightProduct: { name: input.productName || 'Our Product' },
                tableData: input.comparisonData || [],
                priceStatement: input.priceStatement || '',
                logoText: input.brandName || '',
            };

        case 'us_vs_them_split':
            return {
                ...baseConfig,
                leftColor: visualStyle.accentColor,
                rightColor: '#9CA3AF',
                leftTitle: 'WIR',
                rightTitle: 'ANDERE',
                leftStats: (input.benefits || []).slice(0, 4).map(b => ({
                    value: b.value || '',
                    label: b.label || b,
                    prefix: b.prefix || '',
                })),
                rightStats: (input.competitorStats || []).slice(0, 4),
                logoText: input.brandName || '',
            };

        case 'feature_callouts_dotted':
            return {
                ...baseConfig,
                headline: input.productName || '',
                subheadline: input.tagline || '',
                logoText: input.brandName || '',
                features: (input.features || []).slice(0, 8).map((f, i) => ({
                    text: typeof f === 'string' ? f : f.text,
                    x: i % 2 === 0 ? 0.1 : 0.9,
                    y: 0.3 + (Math.floor(i / 2) * 0.15),
                })),
                footnote: input.footnote || '',
            };

        case 'simple_product':
            return {
                ...baseConfig,
                productName: input.productName || '',
                tagline: input.tagline || input.subheadline || '',
                price: elements.showPrice ? `${input.price}€` : '',
                originalPrice: elements.showOriginalPrice ? `${input.originalPrice}€` : '',
                badge: elements.badge || '',
                ctaText: input.ctaText || 'Jetzt kaufen',
                showRating: elements.showRating,
                rating: input.rating,
                reviewCount: input.reviewCount,
            };

        case 'saas_features':
            return {
                ...baseConfig,
                headline: input.headline || 'The smarter way to work',
                subheadline: input.subheadline || '',
                features: (input.features || []).slice(0, 4).map(f => ({
                    icon: f.icon || '✨',
                    title: f.title || f,
                    description: f.description || '',
                })),
                ctaText: input.ctaText || 'Start Free Trial',
                showPricing: elements.showPrice,
                price: input.price ? `${input.price}€` : '',
            };

        case 'coach_authority':
            return {
                ...baseConfig,
                coachName: input.coachName || input.productName || '',
                title: input.title || 'Coach & Berater',
                headline: input.headline || '',
                credentials: input.credentials || input.features || [],
                ctaText: input.ctaText || 'Kostenloses Erstgespräch',
                testimonialQuote: input.testimonialQuote || '',
                testimonialAuthor: input.testimonialAuthor || '',
            };

        case 'real_estate':
            return {
                ...baseConfig,
                propertyType: input.propertyType || 'Immobilie',
                location: input.location || '',
                price: input.price ? `${input.price.toLocaleString('de-DE')}€` : '',
                priceType: input.priceType || 'Kaufpreis',
                specs: input.specs || [
                    { icon: '🛏', value: input.rooms || '3', label: 'Zimmer' },
                    { icon: '📐', value: input.size || '85', label: 'm²' },
                ],
                ctaText: input.ctaText || 'Besichtigung',
            };

        case 'before_after':
            return {
                ...baseConfig,
                headline: input.headline || '',
                beforeLabel: input.beforeLabel || 'VORHER',
                afterLabel: input.afterLabel || 'NACHHER',
                timeframe: input.timeframe || '',
                ctaText: input.ctaText || 'Jetzt starten',
            };

        case 'stats_impact':
            return {
                ...baseConfig,
                headline: input.headline || '',
                stats: (input.stats || []).slice(0, 3),
                ctaText: input.ctaText || '',
                logoText: input.brandName || '',
            };

        case 'lifestyle_context':
            return {
                ...baseConfig,
                headline: input.headline || '',
                subheadline: input.subheadline || '',
                price: elements.showPrice ? `${input.price}€` : '',
                ctaText: input.ctaText || 'Shop now',
                brandName: input.brandName || '',
            };

        default:
            return baseConfig;
    }
}

// ============================================================
// MAIN ORCHESTRATOR FUNCTION
// ============================================================

export function designAd(input) {
    console.log('[AutoDesign] 🎨 Starting intelligent ad design...');

    // Step 1: Analyze content
    const analysis = analyzeContent(input);
    console.log('[AutoDesign] 📊 Content analysis:', {
        industry: analysis.industry,
        featureCount: analysis.featureCount,
        hasCompetitor: analysis.hasCompetitor,
        hasStats: analysis.hasStats,
        contentScore: analysis.contentScore,
    });

    // Step 2: Select optimal pattern
    const { pattern, patternId, reason } = selectOptimalPattern(analysis, input);
    console.log(`[AutoDesign] 🎯 Pattern: ${patternId} (${reason})`);

    // Step 3: Select visual style
    const visualStyle = selectVisualStyle(analysis, input);
    console.log(`[AutoDesign] 🎨 Style: ${visualStyle.style}`);

    // Step 4: Decide which elements to show
    const elements = decideElements(analysis, input);
    console.log('[AutoDesign] ✅ Elements:', {
        showPrice: elements.showPrice,
        showDiscountBadge: elements.showDiscountBadge,
        showTrustBadges: elements.showTrustBadges,
        badge: elements.badge,
    });

    // Step 5: Generate pattern-specific config
    const patternConfig = generatePatternConfig(patternId, analysis, input, visualStyle, elements);

    // Step 6: Generate SVG
    const svg = pattern.generateSVG(patternConfig);

    // Return complete result
    return {
        svg,
        patternId,
        patternConfig,
        analysis,
        visualStyle,
        elements,
        reasoning: [
            `Industry: ${analysis.industry}`,
            `Pattern: ${patternId} - ${reason}`,
            `Style: ${visualStyle.style}`,
            `Content score: ${analysis.contentScore}`,
            elements.showPrice ? `Price: ${input.price}€` : 'Price: hidden',
            elements.showDiscountBadge ? `Discount: ${analysis.discountPercent}%` : '',
        ].filter(Boolean),
    };
}

// ============================================================
// BATCH DESIGN (Multiple variants)
// ============================================================

export function designAdVariants(input, count = 3) {
    const variants = [];
    const analysis = analyzeContent(input);

    // Get multiple suitable patterns
    const patternCandidates = [
        selectOptimalPattern(analysis, input),
        // Force some alternatives
        { pattern: SIMPLE_PRODUCT_PATTERN, patternId: 'simple_product', reason: 'Alternative 1' },
        { pattern: FEATURE_ARROWS_PATTERN, patternId: 'feature_arrows', reason: 'Alternative 2' },
    ];

    for (let i = 0; i < Math.min(count, patternCandidates.length); i++) {
        const { pattern, patternId, reason } = patternCandidates[i];
        const visualStyle = selectVisualStyle(analysis, input);
        const elements = decideElements(analysis, input);
        const patternConfig = generatePatternConfig(patternId, analysis, input, visualStyle, elements);

        variants.push({
            variant: i + 1,
            svg: pattern.generateSVG(patternConfig),
            patternId,
            reason,
        });
    }

    return variants;
}

// ============================================================
// EXPORTS
// ============================================================

export {
    analyzeContent,
    detectIndustry,
    selectOptimalPattern,
    selectVisualStyle,
    decideElements,
};

export default {
    designAd,
    designAdVariants,
    analyzeContent,
    selectOptimalPattern,
};
