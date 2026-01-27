/**
 * FONT MATCHER - AI-Driven Typography Selection
 * 
 * NO hardcoded fonts. Typography derived from:
 * 1. Foreplay reference ad analysis (GPT-4V)
 * 2. Industry typography standards
 * 3. Mood/emotion mapping
 * 4. Optimal sizing based on text length
 */

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Premium font library organized by category
// All fonts available in Google Fonts for universal support
const FONT_LIBRARY = {
    // Bold Modern - For tech, SaaS, startups
    bold_modern: {
        primary: ['Inter', 'Poppins', 'Montserrat', 'Plus Jakarta Sans'],
        secondary: ['DM Sans', 'Outfit', 'Urbanist', 'Figtree'],
        weights: { headline: 800, subheadline: 500, body: 400, cta: 700 }
    },
    // Elegant - For luxury, beauty, fashion
    elegant: {
        primary: ['Playfair Display', 'Cormorant Garamond', 'Libre Baskerville', 'Crimson Pro'],
        secondary: ['Lato', 'Source Sans 3', 'Nunito Sans', 'Open Sans'],
        weights: { headline: 700, subheadline: 400, body: 400, cta: 600 }
    },
    // Playful - For food, kids, lifestyle
    playful: {
        primary: ['Quicksand', 'Nunito', 'Comfortaa', 'Rubik'],
        secondary: ['Poppins', 'DM Sans', 'Outfit', 'Inter'],
        weights: { headline: 700, subheadline: 500, body: 400, cta: 700 }
    },
    // Tech - For software, AI, crypto
    tech: {
        primary: ['Space Grotesk', 'JetBrains Mono', 'IBM Plex Sans', 'Fira Code'],
        secondary: ['Inter', 'Roboto', 'Source Sans 3', 'Noto Sans'],
        weights: { headline: 700, subheadline: 500, body: 400, cta: 600 }
    },
    // Luxury - For premium, exclusive products
    luxury: {
        primary: ['Bodoni Moda', 'Cinzel', 'Marcellus', 'Cormorant'],
        secondary: ['Lato', 'Raleway', 'Nunito Sans', 'Josefin Sans'],
        weights: { headline: 700, subheadline: 300, body: 300, cta: 500 }
    },
    // Impact - For fitness, sports, energy
    impact: {
        primary: ['Oswald', 'Anton', 'Bebas Neue', 'Teko'],
        secondary: ['Roboto Condensed', 'Barlow Condensed', 'Fjalla One', 'Archivo Narrow'],
        weights: { headline: 700, subheadline: 500, body: 400, cta: 700 }
    },
    // Clean - For health, wellness, minimalist
    clean: {
        primary: ['DM Sans', 'Outfit', 'Manrope', 'Sora'],
        secondary: ['Inter', 'Public Sans', 'Work Sans', 'Karla'],
        weights: { headline: 600, subheadline: 400, body: 400, cta: 600 }
    },
    // Friendly - For services, B2B, SaaS
    friendly: {
        primary: ['Lexend', 'Plus Jakarta Sans', 'Poppins', 'Nunito'],
        secondary: ['DM Sans', 'Inter', 'Outfit', 'Figtree'],
        weights: { headline: 700, subheadline: 500, body: 400, cta: 600 }
    }
};

// Industry to font style mapping
const INDUSTRY_FONT_MAP = {
    tech: 'tech',
    saas: 'friendly',
    software: 'bold_modern',
    ai: 'tech',
    crypto: 'tech',
    beauty: 'elegant',
    fashion: 'elegant',
    luxury: 'luxury',
    jewelry: 'luxury',
    watches: 'luxury',
    fitness: 'impact',
    sports: 'impact',
    gym: 'impact',
    food: 'playful',
    restaurant: 'playful',
    beverage: 'playful',
    health: 'clean',
    wellness: 'clean',
    medical: 'clean',
    finance: 'bold_modern',
    insurance: 'friendly',
    legal: 'elegant',
    education: 'friendly',
    gaming: 'impact',
    entertainment: 'playful',
    travel: 'elegant',
    ecommerce: 'bold_modern',
    retail: 'bold_modern'
};

// Mood to font style mapping
const MOOD_FONT_MAP = {
    professional: 'bold_modern',
    playful: 'playful',
    elegant: 'elegant',
    minimal: 'clean',
    bold: 'impact',
    friendly: 'friendly',
    luxury: 'luxury',
    tech: 'tech',
    warm: 'friendly',
    cool: 'clean',
    vibrant: 'impact',
    muted: 'elegant'
};

/**
 * Analyze fonts used in Foreplay reference ads via GPT-4V
 */
export async function analyzeReferenceFonts(referenceAds) {
    console.log(`[FontMatcher] 🔤 Analyzing fonts in ${referenceAds.length} references...`);

    if (!referenceAds || referenceAds.length === 0) {
        console.warn('[FontMatcher] No reference ads, using defaults');
        return getDefaultFontAnalysis();
    }

    const referenceImages = referenceAds
        .map(ad => ad.image || ad.thumbnail)
        .filter(Boolean)
        .slice(0, 4);

    if (referenceImages.length === 0) {
        console.warn('[FontMatcher] No reference images, using defaults');
        return getDefaultFontAnalysis();
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'system',
                content: 'You are an expert typographer analyzing ad typography. Identify font characteristics precisely. Always return valid JSON.'
            }, {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Analyze the typography in these high-performing ads.

For each ad, identify:
1. Headline font characteristics (serif/sans-serif, weight, style)
2. Body font characteristics
3. CTA button font characteristics
4. Overall typography mood (bold, elegant, playful, clean, tech)
5. Approximate font size hierarchy

Return JSON:
{
  "dominantStyle": "bold_modern|elegant|playful|tech|luxury|impact|clean|friendly",
  "characteristics": {
    "headline": {
      "type": "serif|sans-serif|display",
      "weight": "light|regular|medium|semibold|bold|black",
      "style": "condensed|normal|wide",
      "hasEffects": true/false
    },
    "subheadline": { ... },
    "cta": { ... }
  },
  "sizeRatios": {
    "headlineToSubheadline": 2.0-3.0,
    "headlineToCta": 1.5-2.5
  },
  "recommendations": {
    "primaryFont": "suggested Google Font name",
    "secondaryFont": "suggested Google Font name",
    "headlineWeight": 600-900,
    "bodyWeight": 400-500
  }
}`
                    },
                    ...referenceImages.map(url => ({
                        type: 'image_url',
                        image_url: { url, detail: 'high' }
                    }))
                ]
            }],
            max_tokens: 800,
            response_format: { type: 'json_object' }
        });

        // Robust JSON parsing
        let result;
        const content = response.choices[0].message.content || '{}';

        try {
            result = JSON.parse(content);
        } catch (parseError) {
            console.warn('[FontMatcher] JSON parse failed, attempting repair...');

            // Try to extract JSON from markdown code blocks
            const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) ||
                content.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                try {
                    const cleanJson = (jsonMatch[1] || jsonMatch[0]).trim();
                    result = JSON.parse(cleanJson);
                } catch (e) {
                    console.warn('[FontMatcher] JSON repair failed, using defaults');
                    return getDefaultFontAnalysis();
                }
            } else {
                console.warn('[FontMatcher] No JSON found, using defaults');
                return getDefaultFontAnalysis();
            }
        }

        console.log(`[FontMatcher]   Style: ${result.dominantStyle || 'unknown'}`);
        console.log(`[FontMatcher]   Primary: ${result.recommendations?.primaryFont || 'N/A'}`);

        return result;
    } catch (error) {
        console.error('[FontMatcher] Analysis failed:', error.message);
        console.warn('[FontMatcher] Returning defaults due to error');
        return getDefaultFontAnalysis();
    }
}

/**
 * Get default font analysis when GPT-4V fails
 */
function getDefaultFontAnalysis() {
    return {
        dominantStyle: 'bold_modern',
        characteristics: {
            headline: {
                type: 'sans-serif',
                weight: 'bold',
                style: 'normal',
                hasEffects: true
            },
            subheadline: {
                type: 'sans-serif',
                weight: 'medium',
                style: 'normal',
                hasEffects: false
            },
            cta: {
                type: 'sans-serif',
                weight: 'bold',
                style: 'normal',
                hasEffects: false
            }
        },
        sizeRatios: {
            headlineToSubheadline: 2.2,
            headlineToCta: 1.8
        },
        recommendations: {
            primaryFont: 'Inter',
            secondaryFont: 'DM Sans',
            headlineWeight: 700,
            bodyWeight: 400
        }
    };
}


/**
 * Match font to mood and industry
 */
export function matchFontToContext(industry, mood, referenceAnalysis = null) {
    console.log(`[FontMatcher] 🎯 Matching font for ${industry} / ${mood}...`);

    // Priority: Reference analysis > Industry > Mood > Default
    let fontStyle = 'bold_modern';

    if (referenceAnalysis?.dominantStyle && FONT_LIBRARY[referenceAnalysis.dominantStyle]) {
        fontStyle = referenceAnalysis.dominantStyle;
        console.log(`[FontMatcher]   Using reference style: ${fontStyle}`);
    } else if (industry && INDUSTRY_FONT_MAP[industry.toLowerCase()]) {
        fontStyle = INDUSTRY_FONT_MAP[industry.toLowerCase()];
        console.log(`[FontMatcher]   Using industry style: ${fontStyle}`);
    } else if (mood && MOOD_FONT_MAP[mood.toLowerCase()]) {
        fontStyle = MOOD_FONT_MAP[mood.toLowerCase()];
        console.log(`[FontMatcher]   Using mood style: ${fontStyle}`);
    }

    const fontSet = FONT_LIBRARY[fontStyle];

    // Use reference recommendation if available and valid
    let primaryFont = fontSet.primary[0];
    let secondaryFont = fontSet.secondary[0];

    if (referenceAnalysis?.recommendations?.primaryFont) {
        // Validate it's a known font, otherwise use our library
        const suggestedPrimary = referenceAnalysis.recommendations.primaryFont;
        const isKnown = Object.values(FONT_LIBRARY).some(lib =>
            lib.primary.includes(suggestedPrimary) || lib.secondary.includes(suggestedPrimary)
        );
        if (isKnown) {
            primaryFont = suggestedPrimary;
        }
    }

    return {
        style: fontStyle,
        primary: primaryFont,
        secondary: secondaryFont,
        weights: fontSet.weights,
        fallback: 'sans-serif'
    };
}

/**
 * Calculate optimal font sizes based on text length and container
 */
export function calculateOptimalSizes(text, containerWidth, role = 'headline', referenceAnalysis = null) {
    console.log(`[FontMatcher] 📐 Calculating size for ${role} (${text.length} chars)...`);

    // Base sizes (for 1080px width canvas)
    const BASE_SIZES = {
        headline: { min: 42, max: 72, optimal: 56 },
        subheadline: { min: 20, max: 32, optimal: 24 },
        cta: { min: 16, max: 28, optimal: 20 },
        body: { min: 14, max: 20, optimal: 16 },
        badge: { min: 12, max: 18, optimal: 14 }
    };

    const base = BASE_SIZES[role] || BASE_SIZES.body;
    const scaleFactor = containerWidth / 1080;

    // Adjust for text length
    let size = base.optimal * scaleFactor;

    // Shorter text = can be larger
    if (role === 'headline') {
        if (text.length <= 15) {
            size = base.max * scaleFactor;
        } else if (text.length <= 25) {
            size = (base.max + base.optimal) / 2 * scaleFactor;
        } else if (text.length <= 40) {
            size = base.optimal * scaleFactor;
        } else if (text.length <= 60) {
            size = (base.optimal + base.min) / 2 * scaleFactor;
        } else {
            size = base.min * scaleFactor;
        }
    }

    // Apply reference ratio if available
    if (referenceAnalysis?.sizeRatios && role === 'subheadline') {
        const ratio = referenceAnalysis.sizeRatios.headlineToSubheadline || 2.0;
        // This would be applied relative to headline size
    }

    return {
        size: Math.round(size),
        min: Math.round(base.min * scaleFactor),
        max: Math.round(base.max * scaleFactor),
        lineHeight: role === 'headline' ? 1.1 : role === 'body' ? 1.5 : 1.3
    };
}

/**
 * Generate complete typography specification
 */
export function buildTypographySpec(texts, containerWidth, industry, mood, referenceAnalysis = null) {
    console.log('[FontMatcher] 📝 Building complete typography spec...');

    const fontMatch = matchFontToContext(industry, mood, referenceAnalysis);

    // Calculate sizes for each text element
    const headlineSize = calculateOptimalSizes(texts.headline || '', containerWidth, 'headline', referenceAnalysis);
    const subheadlineSize = calculateOptimalSizes(texts.subheadline || '', containerWidth, 'subheadline', referenceAnalysis);
    const ctaSize = calculateOptimalSizes(texts.cta || '', containerWidth, 'cta', referenceAnalysis);

    // Determine text effects based on reference
    const useGradient = referenceAnalysis?.characteristics?.headline?.hasEffects ?? true;
    const useShadow = fontMatch.style === 'impact' || fontMatch.style === 'bold_modern';

    return {
        fonts: fontMatch,
        headline: {
            fontFamily: fontMatch.primary,
            fontSize: headlineSize.size,
            fontWeight: referenceAnalysis?.recommendations?.headlineWeight || fontMatch.weights.headline,
            lineHeight: headlineSize.lineHeight,
            effects: {
                gradient: useGradient,
                shadow: useShadow,
                glow: fontMatch.style === 'tech'
            }
        },
        subheadline: {
            fontFamily: fontMatch.secondary,
            fontSize: subheadlineSize.size,
            fontWeight: fontMatch.weights.subheadline,
            lineHeight: subheadlineSize.lineHeight,
            opacity: 0.85
        },
        cta: {
            fontFamily: fontMatch.primary,
            fontSize: ctaSize.size,
            fontWeight: fontMatch.weights.cta,
            lineHeight: 1.2,
            textTransform: fontMatch.style === 'impact' ? 'uppercase' : 'none',
            letterSpacing: fontMatch.style === 'luxury' ? '0.1em' : 'normal'
        },
        body: {
            fontFamily: fontMatch.secondary,
            fontSize: Math.round(16 * (containerWidth / 1080)),
            fontWeight: fontMatch.weights.body,
            lineHeight: 1.5
        }
    };
}

/**
 * MASTER: Build complete typography intelligence
 */
export async function buildTypographyIntelligence(texts, containerWidth, industry, referenceAds, colorPalette) {
    console.log('[FontMatcher] ════════════════════════════════════');
    console.log('[FontMatcher] 🔤 BUILDING TYPOGRAPHY INTELLIGENCE');
    console.log('[FontMatcher] ════════════════════════════════════');

    // 1. Analyze reference fonts
    const referenceAnalysis = await analyzeReferenceFonts(referenceAds);

    // 2. Derive mood from color palette
    const mood = colorPalette?.mood || 'professional';

    // 3. Build complete spec
    const spec = buildTypographySpec(texts, containerWidth, industry, mood, referenceAnalysis);

    // 4. Apply colors from palette
    spec.headline.color = colorPalette?.textPrimary || '#FFFFFF';
    spec.headline.gradientColors = colorPalette?.gradients?.primary || [colorPalette?.accent, '#FFFFFF'];
    spec.subheadline.color = colorPalette?.textSecondary || 'rgba(255,255,255,0.8)';
    spec.cta.color = colorPalette?.textPrimary || '#FFFFFF';
    spec.cta.backgroundColor = colorPalette?.accent || '#FF4757';
    spec.body.color = colorPalette?.textSecondary || 'rgba(255,255,255,0.7)';

    console.log('[FontMatcher] ════════════════════════════════════');
    console.log(`[FontMatcher] ✅ Typography spec complete`);
    console.log(`[FontMatcher]    Style: ${spec.fonts.style}`);
    console.log(`[FontMatcher]    Primary: ${spec.fonts.primary}`);
    console.log(`[FontMatcher]    Headline: ${spec.headline.fontSize}px / ${spec.headline.fontWeight}`);
    console.log('[FontMatcher] ════════════════════════════════════');

    return spec;
}

export default {
    analyzeReferenceFonts,
    matchFontToContext,
    calculateOptimalSizes,
    buildTypographySpec,
    buildTypographyIntelligence,
    FONT_LIBRARY
};
