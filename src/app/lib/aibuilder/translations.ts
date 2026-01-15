/**
 * AI Ad Builder - Translations (DE/EN)
 */

export const translations = {
    de: {
        // Page Title
        pageTitle: 'AI Ad Builder',
        pageSubtitle: 'Erstelle professionelle Werbeanzeigen mit KI in Sekunden',

        // Input Modes
        modeFormLabel: 'Formular',
        modeFormDesc: 'Strukturierte Eingabe',
        modeFreeLabel: 'Freitext',
        modeFreeDesc: 'Natürliche Sprache',

        // Form Fields
        industryLabel: 'Branche',
        industryPlaceholder: 'z.B. E-Commerce, SaaS, Fitness',
        targetAudienceLabel: 'Zielgruppe',
        targetAudiencePlaceholder: 'z.B. Frauen 25-40, Tech-Enthusiasten',
        productNameLabel: 'Produkt/Service',
        productNamePlaceholder: 'Name Ihres Produkts',
        uspLabel: 'Alleinstellungsmerkmal (USP)',
        uspPlaceholder: 'Was macht Ihr Produkt einzigartig?',
        toneLabel: 'Tonalität',
        tonePlaceholder: 'z.B. professionell, verspielt, dringend',
        goalLabel: 'Werbeziel',
        goalPlaceholder: 'z.B. Lead-Generierung, Verkauf, Awareness',
        templateLabel: 'Template',

        // Free Text
        freeTextPlaceholder: 'Beschreiben Sie Ihre Werbeanzeige in natürlicher Sprache...\n\nBeispiel: Ich bin Friseur in München und möchte eine Herbst-Rabattaktion für Haarschnitte bewerben.',

        // Buttons
        generateButton: 'Anzeige generieren',
        generating: 'Generiere...',
        downloadButton: 'Herunterladen',
        saveToLibraryButton: 'In Bibliothek speichern',
        tryAgainButton: 'Erneut versuchen',
        resetButton: 'Zurücksetzen',

        // Voice Input
        voiceInputButton: 'Sprachaufnahme',
        voiceRecording: 'Aufnahme läuft...',
        voiceStop: 'Stopp',
        voiceTranscribing: 'Transkribiere...',

        // Preview
        previewTitle: 'Vorschau',
        headlineLabel: 'Überschrift',
        sloganLabel: 'Slogan',
        descriptionLabel: 'Beschreibung',
        ctaLabel: 'Call-to-Action',
        noPreview: 'Generiere eine Anzeige, um die Vorschau zu sehen',

        // Templates
        templates: {
            product_launch: 'Produktneuheit',
            limited_offer: 'Befristetes Angebot',
            testimonial: 'Kundenbewertung',
            before_after: 'Vorher/Nachher',
            seasonal: 'Saisonales Event',
            b2b_solution: 'B2B-Lösung',
            lifestyle: 'Lifestyle',
        },

        // Messages
        successMessage: 'Anzeige erfolgreich generiert!',
        errorMessage: 'Fehler bei der Generierung',
        insufficientCredits: 'Nicht genügend Credits',
        savedToLibrary: 'In Bibliothek gespeichert!',

        // Credits
        creditCost: 'Kosten: {cost} Credits',
        creditsRemaining: '{count} Credits verfügbar',
    },

    en: {
        // Page Title
        pageTitle: 'AI Ad Builder',
        pageSubtitle: 'Create professional ads with AI in seconds',

        // Input Modes
        modeFormLabel: 'Form',
        modeFormDesc: 'Structured input',
        modeFreeLabel: 'Free Text',
        modeFreeDesc: 'Natural language',

        // Form Fields
        industryLabel: 'Industry',
        industryPlaceholder: 'e.g. E-Commerce, SaaS, Fitness',
        targetAudienceLabel: 'Target Audience',
        targetAudiencePlaceholder: 'e.g. Women 25-40, Tech enthusiasts',
        productNameLabel: 'Product/Service',
        productNamePlaceholder: 'Your product name',
        uspLabel: 'Unique Selling Point (USP)',
        uspPlaceholder: 'What makes your product unique?',
        toneLabel: 'Tone',
        tonePlaceholder: 'e.g. professional, playful, urgent',
        goalLabel: 'Advertising Goal',
        goalPlaceholder: 'e.g. Lead generation, Sales, Awareness',
        templateLabel: 'Template',

        // Free Text
        freeTextPlaceholder: 'Describe your ad in natural language...\n\nExample: I am a hairdresser in Munich and want to promote an autumn discount campaign for haircuts.',

        // Buttons
        generateButton: 'Generate Ad',
        generating: 'Generating...',
        downloadButton: 'Download',
        saveToLibraryButton: 'Save to Library',
        tryAgainButton: 'Try Again',
        resetButton: 'Reset',

        // Voice Input
        voiceInputButton: 'Voice Recording',
        voiceRecording: 'Recording...',
        voiceStop: 'Stop',
        voiceTranscribing: 'Transcribing...',

        // Preview
        previewTitle: 'Preview',
        headlineLabel: 'Headline',
        sloganLabel: 'Slogan',
        descriptionLabel: 'Description',
        ctaLabel: 'Call-to-Action',
        noPreview: 'Generate an ad to see the preview',

        // Templates
        templates: {
            product_launch: 'Product Launch',
            limited_offer: 'Limited Offer',
            testimonial: 'Customer Testimonial',
            before_after: 'Before/After',
            seasonal: 'Seasonal Event',
            b2b_solution: 'B2B Solution',
            lifestyle: 'Lifestyle',
        },

        // Messages
        successMessage: 'Ad generated successfully!',
        errorMessage: 'Generation error',
        insufficientCredits: 'Insufficient credits',
        savedToLibrary: 'Saved to library!',

        // Credits
        creditCost: 'Cost: {cost} Credits',
        creditsRemaining: '{count} Credits available',
    },
};

export function t(key, lang = 'de', replacements = {}) {
    const keys = key.split('.');
    let value = translations[lang];

    for (const k of keys) {
        value = value?.[k];
    }

    if (typeof value !== 'string') return key;

    // Replace placeholders
    return Object.entries(replacements).reduce(
        (str, [placeholder, val]) => str.replace(`{${placeholder}}`, String(val)),
        value
    );
}
