/**
 * VIRAL COPY ENGINE 2.0
 * 
 * Generates high-converting, "viral" ad copy that drives action.
 * Uses psychological triggers, power words, and proven formulas.
 * 
 * Meta 2026 Level: Headlines that make people STOP scrolling.
 */

// ============================================================
// POWER WORD LIBRARIES - Psychologically Proven
// ============================================================

const POWER_WORDS = {
    urgency: [
        'Jetzt', 'Sofort', 'Heute', 'Letzte Chance', 'Nur noch',
        'Limitiert', 'Exklusiv', 'Beeile dich', 'Schnell', 'Dringend'
    ],
    exclusivity: [
        'Exklusiv', 'VIP', 'Premium', 'Elite', 'Insider',
        'Geheim', 'Privat', 'Nur für dich', 'Ausgewählt', 'Handverlesen'
    ],
    results: [
        'Bewährt', 'Garantiert', 'Erprobt', 'Wissenschaftlich', 'Nachweislich',
        'Erfolgreich', 'Getestet', 'Verifiziert', 'Zertifiziert', 'Empfohlen'
    ],
    emotions: [
        'Unglaublich', 'Atemberaubend', 'Sensationell', 'Revolutionär', 'Bahnbrechend',
        'Phänomenal', 'Spektakulär', 'Außergewöhnlich', 'Beeindruckend', 'Erstaunlich'
    ],
    numbers: [
        '10x', '100%', '3-fach', '50%', '24/7',
        '#1', '5-Sterne', '1000+', '99%', '7 Tage'
    ]
};

// English versions
const POWER_WORDS_EN = {
    urgency: [
        'Now', 'Instant', 'Today', 'Last Chance', 'Only',
        'Limited', 'Exclusive', 'Hurry', 'Fast', 'Urgent'
    ],
    exclusivity: [
        'Exclusive', 'VIP', 'Premium', 'Elite', 'Insider',
        'Secret', 'Private', 'Just for you', 'Selected', 'Handpicked'
    ],
    results: [
        'Proven', 'Guaranteed', 'Tested', 'Scientific', 'Verified',
        'Successful', 'Certified', 'Endorsed', 'Recommended', 'Trusted'
    ],
    emotions: [
        'Incredible', 'Breathtaking', 'Sensational', 'Revolutionary', 'Groundbreaking',
        'Phenomenal', 'Spectacular', 'Extraordinary', 'Impressive', 'Amazing'
    ],
    numbers: [
        '10x', '100%', '3x', '50%', '24/7',
        '#1', '5-Star', '1000+', '99%', '7 Days'
    ]
};

// ============================================================
// VIRAL HEADLINE FORMULAS - Proven Conversion Drivers
// ============================================================

const HEADLINE_FORMULAS = {
    // Number + Benefit + Timeframe
    number_benefit_time: {
        de: [
            '{number} {benefit} in nur {timeframe}',
            '{number} mehr {metric} in {timeframe}',
            'Von 0 auf {number} {metric} in {timeframe}'
        ],
        en: [
            '{number} {benefit} in just {timeframe}',
            '{number} more {metric} in {timeframe}',
            'From 0 to {number} {metric} in {timeframe}'
        ]
    },
    // How-To with Result
    how_to_result: {
        de: [
            'So erreichst du {result} ohne {pain}',
            'Wie du {result} in {timeframe} erreichst',
            'Der einfache Weg zu {result}'
        ],
        en: [
            'How to achieve {result} without {pain}',
            'How to get {result} in {timeframe}',
            'The simple way to {result}'
        ]
    },
    // Social Proof
    social_proof: {
        de: [
            '{number}+ Kunden lieben es bereits',
            'Von {number}+ Profis empfohlen',
            'Das #1 {product} in Deutschland'
        ],
        en: [
            '{number}+ customers already love it',
            'Recommended by {number}+ professionals',
            'The #1 {product} in the market'
        ]
    },
    // Fear of Missing Out
    fomo: {
        de: [
            'Nur noch {number} verfügbar',
            'Endet in {timeframe} – verpasse es nicht!',
            'Letzte Chance: {discount}% Rabatt'
        ],
        en: [
            'Only {number} left',
            'Ends in {timeframe} – don\'t miss out!',
            'Last chance: {discount}% off'
        ]
    },
    // Direct Benefit
    direct_benefit: {
        de: [
            '{benefit} – garantiert',
            'Endlich {benefit} ohne {pain}',
            'Dein Schlüssel zu {benefit}'
        ],
        en: [
            '{benefit} – guaranteed',
            'Finally {benefit} without {pain}',
            'Your key to {benefit}'
        ]
    }
};

// ============================================================
// CTA FORMULAS - Action-Driving Calls
// ============================================================

const CTA_FORMULAS = {
    de: {
        urgency: [
            'Jetzt sichern →',
            'Sofort starten →',
            'Heute noch zugreifen',
            'Letzte Chance nutzen'
        ],
        benefit: [
            'Kostenlos testen',
            'Gratis starten',
            'Ohne Risiko probieren',
            'Jetzt {benefit} erleben'
        ],
        exclusive: [
            'Exklusiven Zugang sichern',
            'VIP-Zugang erhalten',
            'Insider werden',
            'Jetzt freischalten'
        ],
        simple: [
            'Mehr erfahren',
            'Jetzt entdecken',
            'Hier klicken',
            'Jetzt ansehen'
        ]
    },
    en: {
        urgency: [
            'Get it now →',
            'Start instantly →',
            'Access today',
            'Grab your spot'
        ],
        benefit: [
            'Try for free',
            'Start free',
            'Risk-free trial',
            'Experience {benefit} now'
        ],
        exclusive: [
            'Get exclusive access',
            'Join VIP',
            'Become an insider',
            'Unlock now'
        ],
        simple: [
            'Learn more',
            'Discover now',
            'Click here',
            'See it now'
        ]
    }
};

// ============================================================
// VIRAL COPY GENERATOR
// ============================================================

/**
 * Generate viral headline based on context
 */
export function generateViralHeadline(config) {
    const {
        productName,
        industry,
        goal = 'conversion',
        language = 'de',
        customMetrics = {},
        tone = 'professional'
    } = config;

    const words = language === 'en' ? POWER_WORDS_EN : POWER_WORDS;
    const formulas = HEADLINE_FORMULAS;

    // Select formula based on goal
    let formulaType = 'direct_benefit';
    if (goal === 'sale' || goal === 'urgency') formulaType = 'fomo';
    if (goal === 'trust' || goal === 'awareness') formulaType = 'social_proof';
    if (goal === 'education') formulaType = 'how_to_result';
    if (customMetrics.number) formulaType = 'number_benefit_time';

    const formula = formulas[formulaType][language];
    const template = formula[Math.floor(Math.random() * formula.length)];

    // Fill in placeholders
    let headline = template
        .replace('{number}', customMetrics.number || getRandomNumber())
        .replace('{benefit}', customMetrics.benefit || getBenefitForIndustry(industry, language))
        .replace('{metric}', customMetrics.metric || getMetricForIndustry(industry, language))
        .replace('{timeframe}', customMetrics.timeframe || getRandomTimeframe(language))
        .replace('{result}', customMetrics.result || getBenefitForIndustry(industry, language))
        .replace('{pain}', customMetrics.pain || getPainForIndustry(industry, language))
        .replace('{product}', productName || 'Produkt')
        .replace('{discount}', customMetrics.discount || '50');

    // Add power word prefix for extra impact
    if (Math.random() > 0.5) {
        const powerWord = getRandomItem(words.emotions);
        headline = `${powerWord}: ${headline}`;
    }

    return headline;
}

/**
 * Generate viral CTA based on context
 */
export function generateViralCTA(config) {
    const {
        goal = 'conversion',
        language = 'de',
        benefit = '',
        urgency = false
    } = config;

    const ctaLibrary = CTA_FORMULAS[language] || CTA_FORMULAS.de;

    let ctaType = 'simple';
    if (urgency || goal === 'sale') ctaType = 'urgency';
    if (goal === 'trial' || goal === 'lead') ctaType = 'benefit';
    if (goal === 'exclusive') ctaType = 'exclusive';

    const ctaOptions = ctaLibrary[ctaType];
    let cta = ctaOptions[Math.floor(Math.random() * ctaOptions.length)];

    // Replace benefit placeholder if present
    cta = cta.replace('{benefit}', benefit || (language === 'de' ? 'Erfolg' : 'success'));

    return cta;
}

/**
 * Generate complete viral copy package
 */
export function generateViralCopyPackage(config) {
    const {
        productName,
        productDescription,
        industry,
        goal = 'conversion',
        language = 'de',
        customMetrics = {},
        includeSubheadline = true
    } = config;

    const headline = generateViralHeadline({
        productName,
        industry,
        goal,
        language,
        customMetrics
    });

    const cta = generateViralCTA({
        goal,
        language,
        urgency: goal === 'sale' || goal === 'urgency'
    });

    let subheadline = '';
    if (includeSubheadline) {
        subheadline = generateSubheadline({
            productName,
            productDescription,
            industry,
            language
        });
    }

    // Generate badge if appropriate
    let badge = null;
    if (goal === 'sale') {
        badge = language === 'de' ? 'SALE' : 'SALE';
    } else if (customMetrics.discount) {
        badge = `-${customMetrics.discount}%`;
    } else if (goal === 'new' || goal === 'launch') {
        badge = language === 'de' ? 'NEU' : 'NEW';
    }

    return {
        headline,
        subheadline,
        cta,
        badge,
        meta: {
            formulaUsed: 'viral_copy_engine_2.0',
            goal,
            language,
            powerWordsUsed: true
        }
    };
}

/**
 * Generate subheadline
 */
function generateSubheadline(config) {
    const { productName, productDescription, industry, language } = config;

    const templates = language === 'de' ? [
        'Die smarteste Lösung für {industry}',
        'Vertraue auf {productName}',
        'Tausende zufriedene Kunden',
        'Premium Qualität zum besten Preis'
    ] : [
        'The smartest solution for {industry}',
        'Trust {productName}',
        'Thousands of happy customers',
        'Premium quality at the best price'
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];

    return template
        .replace('{industry}', getIndustryName(industry, language))
        .replace('{productName}', productName || 'uns');
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber() {
    const options = ['287%', '10x', '500+', '93%', '3x', '1000+', '47%', '5x'];
    return getRandomItem(options);
}

function getRandomTimeframe(language) {
    const de = ['7 Tagen', '14 Tagen', '30 Tagen', '24 Stunden', '48 Stunden'];
    const en = ['7 days', '14 days', '30 days', '24 hours', '48 hours'];
    return getRandomItem(language === 'de' ? de : en);
}

function getBenefitForIndustry(industry, language) {
    const benefits = {
        de: {
            saas: 'mehr Produktivität',
            ecommerce: 'höhere Conversions',
            fashion: 'einzigartigen Style',
            food: 'mehr Genuss',
            beauty: 'strahlende Haut',
            home: 'mehr Gemütlichkeit',
            fitness: 'mehr Energie',
            default: 'bessere Ergebnisse'
        },
        en: {
            saas: 'more productivity',
            ecommerce: 'higher conversions',
            fashion: 'unique style',
            food: 'more enjoyment',
            beauty: 'radiant skin',
            home: 'more comfort',
            fitness: 'more energy',
            default: 'better results'
        }
    };
    return benefits[language]?.[industry] || benefits[language]?.default || benefits.de.default;
}

function getMetricForIndustry(industry, language) {
    const metrics = {
        de: {
            saas: 'Leads',
            ecommerce: 'Verkäufe',
            fashion: 'Komplimente',
            food: 'Bestellungen',
            beauty: 'Glow',
            home: 'Wohlfühlmomente',
            fitness: 'Kraft',
            default: 'Erfolg'
        },
        en: {
            saas: 'leads',
            ecommerce: 'sales',
            fashion: 'compliments',
            food: 'orders',
            beauty: 'glow',
            home: 'comfort moments',
            fitness: 'strength',
            default: 'success'
        }
    };
    return metrics[language]?.[industry] || metrics[language]?.default || metrics.de.default;
}

function getPainForIndustry(industry, language) {
    const pains = {
        de: {
            saas: 'komplizierte Tools',
            ecommerce: 'hohe Kosten',
            fashion: 'Kompromisse',
            food: 'schlechte Zutaten',
            beauty: 'Chemie',
            home: 'Stress',
            fitness: 'Überanstrengung',
            default: 'Aufwand'
        },
        en: {
            saas: 'complicated tools',
            ecommerce: 'high costs',
            fashion: 'compromises',
            food: 'bad ingredients',
            beauty: 'chemicals',
            home: 'stress',
            fitness: 'overexertion',
            default: 'effort'
        }
    };
    return pains[language]?.[industry] || pains[language]?.default || pains.de.default;
}

function getIndustryName(industry, language) {
    const names = {
        de: {
            saas: 'SaaS & Tech',
            ecommerce: 'E-Commerce',
            fashion: 'Fashion',
            food: 'Food & Beverage',
            beauty: 'Beauty',
            home: 'Home & Living',
            fitness: 'Fitness',
            default: 'dein Business'
        },
        en: names?.de || {}
    };
    return names[language]?.[industry] || names.de?.[industry] || names.de.default;
}

export default {
    generateViralHeadline,
    generateViralCTA,
    generateViralCopyPackage,
    POWER_WORDS,
    POWER_WORDS_EN,
    HEADLINE_FORMULAS,
    CTA_FORMULAS
};
