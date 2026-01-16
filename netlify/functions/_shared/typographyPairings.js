/**
 * Typography Pairing System
 * Professional font combinations for designer-level ads
 */

export const FONT_PAIRINGS = {
    // ========================================
    // PREMIUM / LUXURY
    // ========================================
    premium_elegant: {
        id: 'premium_elegant',
        name: 'Premium Elegant',
        headline: {
            family: 'Playfair Display',
            weight: '700',
            style: 'serif display',
            fallback: 'Georgia, serif',
        },
        body: {
            family: 'Inter',
            weight: '400',
            style: 'clean sans-serif',
            fallback: 'system-ui, sans-serif',
        },
        industries: ['luxury', 'fashion', 'beauty', 'hospitality'],
        promptDescription: 'elegant serif headline (like Playfair Display) paired with clean modern sans-serif body text (like Inter)',
    },

    premium_minimal: {
        id: 'premium_minimal',
        name: 'Premium Minimal',
        headline: {
            family: 'Helvetica Neue',
            weight: '300',
            style: 'thin sans-serif',
            fallback: 'Arial, sans-serif',
        },
        body: {
            family: 'Helvetica Neue',
            weight: '400',
            style: 'clean sans-serif',
            fallback: 'Arial, sans-serif',
        },
        industries: ['tech', 'luxury', 'minimal', 'saas'],
        promptDescription: 'thin elegant sans-serif headline paired with regular weight body text, ultra-minimal typography',
    },

    // ========================================
    // MODERN / TECH
    // ========================================
    modern_tech: {
        id: 'modern_tech',
        name: 'Modern Tech',
        headline: {
            family: 'Montserrat',
            weight: '800',
            style: 'geometric bold sans-serif',
            fallback: 'Arial Black, sans-serif',
        },
        body: {
            family: 'Open Sans',
            weight: '400',
            style: 'readable sans-serif',
            fallback: 'system-ui, sans-serif',
        },
        industries: ['tech', 'saas', 'gaming', 'startups'],
        promptDescription: 'bold geometric sans-serif headline (like Montserrat ExtraBold) with clean readable body text',
    },

    futuristic_display: {
        id: 'futuristic_display',
        name: 'Futuristic Display',
        headline: {
            family: 'Orbitron',
            weight: '700',
            style: 'sci-fi display',
            fallback: 'Arial, sans-serif',
        },
        body: {
            family: 'Roboto',
            weight: '400',
            style: 'modern sans-serif',
            fallback: 'system-ui, sans-serif',
        },
        industries: ['gaming', 'tech', 'crypto', 'futuristic'],
        promptDescription: 'futuristic sci-fi display font headline with modern clean body text',
    },

    // ========================================
    // FRIENDLY / APPROACHABLE
    // ========================================
    friendly_rounded: {
        id: 'friendly_rounded',
        name: 'Friendly Rounded',
        headline: {
            family: 'Poppins',
            weight: '700',
            style: 'rounded friendly sans-serif',
            fallback: 'Arial Rounded, sans-serif',
        },
        body: {
            family: 'Nunito',
            weight: '400',
            style: 'soft readable sans-serif',
            fallback: 'system-ui, sans-serif',
        },
        industries: ['kids', 'pets', 'education', 'health', 'apps'],
        promptDescription: 'friendly rounded sans-serif headline (like Poppins Bold) with soft approachable body text',
    },

    playful_modern: {
        id: 'playful_modern',
        name: 'Playful Modern',
        headline: {
            family: 'Quicksand',
            weight: '700',
            style: 'playful modern sans-serif',
            fallback: 'Arial Rounded, sans-serif',
        },
        body: {
            family: 'Lato',
            weight: '400',
            style: 'warm sans-serif',
            fallback: 'system-ui, sans-serif',
        },
        industries: ['lifestyle', 'travel', 'food', 'creative'],
        promptDescription: 'playful rounded headline font with warm friendly body text',
    },

    // ========================================
    // BOLD / IMPACT
    // ========================================
    bold_impact: {
        id: 'bold_impact',
        name: 'Bold Impact',
        headline: {
            family: 'Bebas Neue',
            weight: '400',
            style: 'condensed impact display',
            fallback: 'Impact, sans-serif',
        },
        body: {
            family: 'Source Sans Pro',
            weight: '400',
            style: 'neutral sans-serif',
            fallback: 'system-ui, sans-serif',
        },
        industries: ['fitness', 'sports', 'automotive', 'action'],
        promptDescription: 'bold condensed display headline (like Bebas Neue) creating strong impact, with neutral body text',
    },

    ultra_black: {
        id: 'ultra_black',
        name: 'Ultra Black',
        headline: {
            family: 'Anton',
            weight: '400',
            style: 'ultra bold condensed',
            fallback: 'Impact, sans-serif',
        },
        body: {
            family: 'Roboto',
            weight: '400',
            style: 'clean sans-serif',
            fallback: 'system-ui, sans-serif',
        },
        industries: ['fitness', 'sale', 'urgency', 'sports'],
        promptDescription: 'massive ultra-black condensed headline that DEMANDS attention, with clean body text',
    },

    // ========================================
    // EDITORIAL / MAGAZINE
    // ========================================
    editorial_classic: {
        id: 'editorial_classic',
        name: 'Editorial Classic',
        headline: {
            family: 'Libre Baskerville',
            weight: '700',
            style: 'classic editorial serif',
            fallback: 'Times New Roman, serif',
        },
        body: {
            family: 'Libre Franklin',
            weight: '400',
            style: 'modern sans-serif',
            fallback: 'system-ui, sans-serif',
        },
        industries: ['fashion', 'editorial', 'publishing', 'luxury'],
        promptDescription: 'classic editorial serif headline with modern sans-serif body, magazine-worthy typography',
    },

    modern_editorial: {
        id: 'modern_editorial',
        name: 'Modern Editorial',
        headline: {
            family: 'DM Serif Display',
            weight: '400',
            style: 'modern serif display',
            fallback: 'Georgia, serif',
        },
        body: {
            family: 'DM Sans',
            weight: '400',
            style: 'geometric sans-serif',
            fallback: 'system-ui, sans-serif',
        },
        industries: ['lifestyle', 'beauty', 'home', 'editorial'],
        promptDescription: 'modern serif display headline with matching geometric sans-serif body',
    },

    // ========================================
    // ORGANIC / NATURAL
    // ========================================
    organic_natural: {
        id: 'organic_natural',
        name: 'Organic Natural',
        headline: {
            family: 'Cormorant Garamond',
            weight: '600',
            style: 'elegant organic serif',
            fallback: 'Georgia, serif',
        },
        body: {
            family: 'Work Sans',
            weight: '400',
            style: 'friendly sans-serif',
            fallback: 'system-ui, sans-serif',
        },
        industries: ['eco', 'organic', 'wellness', 'natural'],
        promptDescription: 'organic elegant serif headline with warm approachable body text',
    },

    // ========================================
    // HANDWRITTEN / CASUAL
    // ========================================
    handwritten_accent: {
        id: 'handwritten_accent',
        name: 'Handwritten Accent',
        headline: {
            family: 'Satisfy',
            weight: '400',
            style: 'casual script',
            fallback: 'cursive',
        },
        body: {
            family: 'Raleway',
            weight: '400',
            style: 'elegant sans-serif',
            fallback: 'system-ui, sans-serif',
        },
        industries: ['wedding', 'cafe', 'artisan', 'personal'],
        promptDescription: 'casual handwritten script headline accent with elegant sans-serif body',
    },
};

/**
 * Get font pairing by ID
 */
export function getFontPairing(pairingId) {
    return FONT_PAIRINGS[pairingId] || FONT_PAIRINGS.modern_tech;
}

/**
 * Get all font pairings
 */
export function getAllFontPairings() {
    return Object.values(FONT_PAIRINGS);
}

/**
 * Recommend font pairing for industry
 */
export function recommendFontPairing(industry) {
    const pairings = Object.values(FONT_PAIRINGS).filter(
        p => p.industries.includes(industry)
    );
    return pairings.length > 0 ? pairings[0] : FONT_PAIRINGS.modern_tech;
}

/**
 * Build typography prompt for image generation
 */
export function buildTypographyPrompt(pairingId) {
    const pairing = getFontPairing(pairingId);
    return `
TYPOGRAPHY SPECIFICATIONS:
Headline: ${pairing.promptDescription}
- Headline style: ${pairing.headline.style}, weight ${pairing.headline.weight}
- Body style: ${pairing.body.style}, weight ${pairing.body.weight}
- Typography must be PERFECTLY LEGIBLE and professionally rendered
`;
}
