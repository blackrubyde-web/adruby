/**
 * AI Ad Builder - Template Definitions
 * Vordefinierte Templates für verschiedene Werbearten
 */

export const adTemplates = {
    product_launch: {
        id: 'product_launch',
        name: { de: 'Produktneuheit', en: 'Product Launch' },
        description: {
            de: 'Für die Ankündigung neuer Produkte oder Features',
            en: 'For announcing new products or features',
        },
        style: {
            tone: 'exciting, innovative, energetic',
            focus: 'product benefits, new features, innovation',
            cta: { de: 'Jetzt entdecken', en: 'Discover now' },
        },
        copywritingFramework: 'AIDA',
        visualGuidelines: 'Product-focused, clean background, modern aesthetic, show product clearly',
    },

    limited_offer: {
        id: 'limited_offer',
        name: { de: 'Befristetes Angebot', en: 'Limited Offer' },
        description: {
            de: 'Für zeitlich begrenzte Rabatte und Aktionen',
            en: 'For time-limited discounts and promotions',
        },
        style: {
            tone: 'urgent, persuasive, action-oriented',
            focus: 'discount/savings, scarcity, time pressure',
            cta: { de: 'Jetzt sichern', en: 'Get it now' },
        },
        copywritingFramework: 'PAS',
        visualGuidelines: 'Bold colors, discount badge visible, countdown feel, high contrast',
    },

    testimonial: {
        id: 'testimonial',
        name: { de: 'Kundenbewertung', en: 'Customer Testimonial' },
        description: {
            de: 'Social Proof durch Kundenstimmen',
            en: 'Social proof through customer voices',
        },
        style: {
            tone: 'authentic, trustworthy, relatable',
            focus: 'customer satisfaction, real results, trust',
            cta: { de: 'Mehr Erfolgsgeschichten', en: 'More success stories' },
        },
        copywritingFramework: 'Story',
        visualGuidelines: 'Friendly customer photo, quote marks, testimonial-style, warm colors',
    },

    before_after: {
        id: 'before_after',
        name: { de: 'Vorher/Nachher', en: 'Before/After' },
        description: {
            de: 'Zeigt Transformation oder Verbesserung',
            en: 'Shows transformation or improvement',
        },
        style: {
            tone: 'impressive, results-driven, confident',
            focus: 'transformation, proof of results, visual impact',
            cta: { de: 'Ihre Transformation starten', en: 'Start your transformation' },
        },
        copywritingFramework: 'PAS',
        visualGuidelines: 'Split-screen comparison, clear contrast, arrows or divider, dramatic',
    },

    seasonal: {
        id: 'seasonal',
        name: { de: 'Saisonales Event', en: 'Seasonal Event' },
        description: {
            de: 'Für Weihnachten, Black Friday, Sommer-Aktionen etc.',
            en: 'For Christmas, Black Friday, Summer sales etc.',
        },
        style: {
            tone: 'festive, timely, celebratory',
            focus: 'seasonal occasion, special offer, limited time',
            cta: { de: 'Zum Angebot', en: 'View offer' },
        },
        copywritingFramework: 'AIDA',
        visualGuidelines: 'Seasonal colors and elements, festive atmosphere, holiday-themed',
    },

    b2b_solution: {
        id: 'b2b_solution',
        name: { de: 'B2B-Lösung', en: 'B2B Solution' },
        description: {
            de: 'Professionell und lösungsorientiert für Business-Kunden',
            en: 'Professional and solution-focused for business clients',
        },
        style: {
            tone: 'professional, authoritative, solution-focused',
            focus: 'ROI, efficiency, business value, problem-solving',
            cta: { de: 'Demo anfragen', en: 'Request demo' },
        },
        copywritingFramework: 'Feature-Benefit',
        visualGuidelines: 'Clean corporate aesthetic, data/charts if relevant, professional imagery',
    },

    lifestyle: {
        id: 'lifestyle',
        name: { de: 'Lifestyle', en: 'Lifestyle' },
        description: {
            de: 'Emotional und aspirativ für Lifestyle-Produkte',
            en: 'Emotional and aspirational for lifestyle products',
        },
        style: {
            tone: 'inspirational, aspirational, emotional',
            focus: 'lifestyle benefits, emotions, aspirations',
            cta: { de: 'Jetzt erleben', en: 'Experience now' },
        },
        copywritingFramework: 'Story',
        visualGuidelines: 'Beautiful lifestyle photography, aspirational scenes, elegant, minimal text',
    },
};

/**
 * Template anhand ID abrufen
 */
export function getTemplate(templateId) {
    return adTemplates[templateId] || adTemplates.product_launch;
}

/**
 * Alle Templates als Array
 */
export function getAllTemplates() {
    return Object.values(adTemplates);
}
