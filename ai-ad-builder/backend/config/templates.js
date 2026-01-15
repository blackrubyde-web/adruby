/**
 * Template-Konfigurationen für verschiedene Ad-Typen
 * Jedes Template definiert Stil, Tonalität und strukturelle Vorgaben
 */

export const adTemplates = {
    product_launch: {
        id: 'product_launch',
        name: {
            de: 'Produktneuheit',
            en: 'Product Launch'
        },
        description: {
            de: 'Für die Ankündigung neuer Produkte oder Features',
            en: 'For announcing new products or features'
        },
        style: {
            tone: 'exciting, innovative',
            focus: 'product benefits, new features',
            cta: 'Jetzt entdecken / Discover now'
        },
        copywritingFramework: 'AIDA',
        visualGuidelines: 'Product-focused, clean background, modern aesthetic',
        layoutHints: 'Large product image, bold headline, feature highlights'
    },

    limited_offer: {
        id: 'limited_offer',
        name: {
            de: 'Befristetes Angebot',
            en: 'Limited Offer'
        },
        description: {
            de: 'Für zeitlich begrenzte Rabatte und Aktionen',
            en: 'For time-limited discounts and promotions'
        },
        style: {
            tone: 'urgent, persuasive',
            focus: 'discount/savings, scarcity',
            cta: 'Jetzt sichern / Get it now'
        },
        copywritingFramework: 'PAS',
        visualGuidelines: 'Bold colors, price/discount prominently, countdown feel',
        layoutHints: 'Eye-catching badge, strong contrast, clear pricing'
    },

    testimonial: {
        id: 'testimonial',
        name: {
            de: 'Kundenbewertung',
            en: 'Customer Testimonial'
        },
        description: {
            de: 'Social Proof durch Kundenstimmen',
            en: 'Social proof through customer voices'
        },
        style: {
            tone: 'authentic, trustworthy',
            focus: 'customer satisfaction, results',
            cta: 'Mehr Erfolgsgeschichten / More success stories'
        },
        copywritingFramework: 'Story',
        visualGuidelines: 'Friendly faces, quote marks, testimonial-style',
        layoutHints: 'Customer photo, quote text, star rating'
    },

    before_after: {
        id: 'before_after',
        name: {
            de: 'Vorher/Nachher',
            en: 'Before/After'
        },
        description: {
            de: 'Zeigt Transformation oder Verbesserung',
            en: 'Shows transformation or improvement'
        },
        style: {
            tone: 'impressive, results-driven',
            focus: 'transformation, proof',
            cta: 'Ihre Transformation starten / Start your transformation'
        },
        copywritingFramework: 'PAS',
        visualGuidelines: 'Split-screen or side-by-side comparison',
        layoutHints: 'Clear before/after division, arrows, labels'
    },

    seasonal: {
        id: 'seasonal',
        name: {
            de: 'Saisonales Event',
            en: 'Seasonal Event'
        },
        description: {
            de: 'Für Weihnachten, Black Friday, Sommer-Aktionen etc.',
            en: 'For Christmas, Black Friday, Summer sales etc.'
        },
        style: {
            tone: 'festive, timely',
            focus: 'seasonal occasion, special offer',
            cta: 'Zum Angebot / View offer'
        },
        copywritingFramework: 'AIDA',
        visualGuidelines: 'Seasonal colors/elements, festive atmosphere',
        layoutHints: 'Seasonal decorations, themed colors, holiday mood'
    },

    b2b_solution: {
        id: 'b2b_solution',
        name: {
            de: 'B2B-Lösung',
            en: 'B2B Solution'
        },
        description: {
            de: 'Professionell und lösungsorientiert für Business-Kunden',
            en: 'Professional and solution-focused for business clients'
        },
        style: {
            tone: 'professional, authoritative',
            focus: 'ROI, efficiency, business value',
            cta: 'Demo anfragen / Request demo'
        },
        copywritingFramework: 'Feature-Benefit',
        visualGuidelines: 'Clean, corporate, data/charts if relevant',
        layoutHints: 'Professional imagery, statistics, credibility markers'
    },

    lifestyle: {
        id: 'lifestyle',
        name: {
            de: 'Lifestyle',
            en: 'Lifestyle'
        },
        description: {
            de: 'Emotional und aspirativ für Lifestyle-Produkte',
            en: 'Emotional and aspirational for lifestyle products'
        },
        style: {
            tone: 'inspirational, aspirational',
            focus: 'lifestyle benefits, emotions',
            cta: 'Jetzt erleben / Experience now'
        },
        copywritingFramework: 'Story',
        visualGuidelines: 'Beautiful lifestyle photography, aspirational scenes',
        layoutHints: 'Large lifestyle image, minimal text, elegant typography'
    }
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

export default adTemplates;
