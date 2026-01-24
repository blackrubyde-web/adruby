/**
 * AI BRAND DNA EXTRACTOR
 * 
 * Uses AI to extract complete brand identity from:
 * - Product images
 * - Screenshots
 * - Existing brand assets
 * - Competitor analysis
 * 
 * Extracts:
 * - Color palette (primary, secondary, accent, neutrals)
 * - Typography style
 * - Visual language/mood
 * - Design principles
 * - Icon/illustration style
 * - Photography style
 */

import OpenAI from 'openai';
import sharp from 'sharp';
import { hexToHsl, generatePalette, getColorPsychology } from './colorScience.js';
import { getFontPairingForContext } from './typographyMastery.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ========================================
// MAIN BRAND EXTRACTION
// ========================================

/**
 * Extract complete brand DNA from image
 */
export async function extractBrandDNA(imageBuffer, context = {}) {
    console.log('[BrandDNA] 🧬 Starting deep brand analysis...');

    try {
        // Extract dominant colors from image
        const extractedColors = await extractColorsFromImage(imageBuffer);

        // AI visual analysis
        const visualAnalysis = await analyzeVisualIdentity(imageBuffer, context);

        // Synthesize brand DNA
        const brandDNA = synthesizeBrandDNA(extractedColors, visualAnalysis, context);

        console.log('[BrandDNA] ✅ Brand DNA extracted');
        console.log(`[BrandDNA]   Primary: ${brandDNA.colors.primary}`);
        console.log(`[BrandDNA]   Style: ${brandDNA.visualStyle}`);
        console.log(`[BrandDNA]   Mood: ${brandDNA.mood.primary}`);

        return brandDNA;

    } catch (error) {
        console.error('[BrandDNA] Extraction failed:', error.message);
        return getDefaultBrandDNA(context);
    }
}

/**
 * Extract colors using sharp and clustering
 */
async function extractColorsFromImage(imageBuffer) {
    try {
        // Resize for faster processing
        const { data, info } = await sharp(imageBuffer)
            .resize(100, 100, { fit: 'cover' })
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Build color histogram
        const colors = {};
        const pixelCount = data.length / info.channels;

        for (let i = 0; i < data.length; i += info.channels) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Quantize for clustering (reduce to 32 levels per channel)
            const qr = Math.round(r / 8) * 8;
            const qg = Math.round(g / 8) * 8;
            const qb = Math.round(b / 8) * 8;

            const key = `${qr},${qg},${qb}`;
            colors[key] = (colors[key] || 0) + 1;
        }

        // Sort by frequency
        const sortedColors = Object.entries(colors)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20);

        // Categorize colors
        const categories = {
            vibrant: [],
            neutral: [],
            dark: [],
            light: []
        };

        for (const [colorKey, count] of sortedColors) {
            const [r, g, b] = colorKey.split(',').map(Number);
            const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            const hsl = hexToHsl(hex);

            const colorData = { hex, count, percentage: count / pixelCount };

            // Categorize
            if (hsl.s < 15) {
                if (hsl.l < 25) categories.dark.push(colorData);
                else if (hsl.l > 80) categories.light.push(colorData);
                else categories.neutral.push(colorData);
            } else {
                categories.vibrant.push(colorData);
            }
        }

        // Select representative colors
        const primary = categories.vibrant[0]?.hex ||
            categories.neutral[0]?.hex ||
            '#3B82F6';

        const secondary = categories.vibrant[1]?.hex ||
            categories.vibrant[0]?.hex ||
            '#8B5CF6';

        const background = categories.dark[0]?.hex ||
            categories.neutral.find(c => hexToHsl(c.hex).l < 20)?.hex ||
            '#0A0A1A';

        const text = categories.light[0]?.hex || '#FFFFFF';

        return {
            primary,
            secondary,
            background,
            text,
            allColors: sortedColors.slice(0, 10).map(([k, v]) => {
                const [r, g, b] = k.split(',').map(Number);
                return {
                    hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
                    percentage: v / pixelCount
                };
            }),
            categories
        };

    } catch (error) {
        console.warn('[BrandDNA] Color extraction fallback:', error.message);
        return {
            primary: '#3B82F6',
            secondary: '#8B5CF6',
            background: '#0A0A1A',
            text: '#FFFFFF',
            allColors: []
        };
    }
}

/**
 * AI visual identity analysis
 */
async function analyzeVisualIdentity(imageBuffer, context) {
    const base64 = imageBuffer.toString('base64');

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'system',
                content: `You are an expert brand strategist and visual identity designer. 
Analyze images to extract complete brand DNA with pixel-level precision.
Focus on design systems, not individual elements.`
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/png;base64,${base64}`, detail: 'high' }
                    },
                    {
                        type: 'text',
                        text: `Analyze this ${context.imageType || 'product'} image and extract the complete visual brand DNA.

Return comprehensive JSON:
{
    "brandPersonality": {
        "archetype": "innovator|sage|hero|caregiver|explorer|rebel|magician|ruler|lover|jester|everyman|creator",
        "traits": ["trait1", "trait2", "trait3"],
        "tone": "professional|friendly|bold|sophisticated|playful|minimal|luxurious|technical|warm|edgy",
        "energy": "calm|balanced|dynamic|intense"
    },
    
    "colorAnalysis": {
        "dominantHue": 220,
        "colorTemperature": "warm|cool|neutral",
        "saturationLevel": "muted|balanced|vibrant",
        "contrastStyle": "low|medium|high|dramatic",
        "suggestedPrimary": "#hex",
        "suggestedSecondary": "#hex",
        "suggestedAccent": "#hex",
        "colorMood": "description of color emotional impact"
    },
    
    "typographyStyle": {
        "headlineStyle": "bold|elegant|minimal|playful|technical|editorial",
        "recommendedWeight": "300|400|500|600|700|800|900",
        "letterSpacingTrend": "tight|normal|wide|tracking",
        "textTreatment": "solid|gradient|shadow|glow|outline",
        "recommendedPairing": "modern_tech|premium_minimal|bold_statement|editorial_classic|luxury_display|geometric_clean"
    },
    
    "designLanguage": {
        "style": "flat|skeuomorphic|glassmorphism|neumorphism|material|brutalist|organic",
        "cornersStyle": "sharp|slightly_rounded|rounded|pill",
        "shadowStyle": "none|subtle|medium|dramatic|layered",
        "lineStyle": "thin|medium|thick",
        "density": "spacious|balanced|dense",
        "complexity": "minimal|moderate|rich|detailed"
    },
    
    "visualMotifs": {
        "usesGradients": true,
        "gradientStyle": "linear|radial|mesh|conic",
        "usesPatterns": false,
        "patternType": null,
        "iconStyle": "outlined|filled|duotone|3d",
        "illustrationStyle": "none|flat|isometric|3d|hand_drawn",
        "photographyStyle": null
    },
    
    "spatialDesign": {
        "whitespaceUsage": "minimal|balanced|generous|dramatic",
        "gridStyle": "structured|asymmetric|organic|modular",
        "layoutTendency": "centered|left_aligned|dynamic|grid_based",
        "hierarchyApproach": "size_based|weight_based|color_based|position_based"
    },
    
    "recommendedEffects": {
        "backgroundEffects": ["gradient", "mesh", "particles"],
        "foregroundEffects": ["glow", "shadow"],
        "textEffects": ["shadow"],
        "productEffects": ["reflection", "screen_glow"]
    },
    
    "industryMatch": {
        "primaryIndustry": "technology|finance|health|education|ecommerce|etc",
        "subCategory": "specific category",
        "confidenceScore": 0.85
    }
}`
                    }
                ]
            }],
            max_tokens: 1500,
            response_format: { type: 'json_object' }
        });

        return JSON.parse(response.choices[0].message.content);

    } catch (error) {
        console.warn('[BrandDNA] AI analysis fallback:', error.message);
        return getDefaultVisualAnalysis();
    }
}

/**
 * Synthesize complete brand DNA
 */
function synthesizeBrandDNA(extractedColors, visualAnalysis, context) {
    const colorAnalysis = visualAnalysis.colorAnalysis || {};
    const typography = visualAnalysis.typographyStyle || {};
    const designLang = visualAnalysis.designLanguage || {};
    const personality = visualAnalysis.brandPersonality || {};

    // Use AI suggestions if available, otherwise extracted colors
    const primaryColor = colorAnalysis.suggestedPrimary || extractedColors.primary;
    const secondaryColor = colorAnalysis.suggestedSecondary || extractedColors.secondary;
    const accentColor = colorAnalysis.suggestedAccent || primaryColor;

    // Generate complete palette from primary
    const palette = generatePalette(primaryColor, {
        shades: 9,
        includeNeutrals: true,
        includeAccent: true,
        darkMode: true
    });

    // Get font pairing
    const fontPairing = getFontPairingForContext(
        visualAnalysis.industryMatch?.primaryIndustry,
        personality.tone
    );

    // Get color psychology
    const psychology = getColorPsychology(primaryColor);

    return {
        // Core colors
        colors: {
            primary: primaryColor,
            secondary: secondaryColor,
            accent: accentColor,
            background: extractedColors.background || palette.dark?.background || '#0A0A1A',
            surface: palette.dark?.surface || '#141428',
            text: extractedColors.text || '#FFFFFF',
            textSecondary: palette.dark?.textSecondary || '#A0A0B0',
            gradient: {
                start: primaryColor,
                end: secondaryColor,
                css: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
            },
            palette
        },

        // Typography
        typography: {
            pairing: fontPairing,
            pairingName: typography.recommendedPairing || 'modern_tech',
            headlineStyle: typography.headlineStyle || 'bold',
            headlineWeight: parseInt(typography.recommendedWeight) || 700,
            letterSpacing: typography.letterSpacingTrend || 'tight',
            textTreatment: typography.textTreatment || 'solid'
        },

        // Visual style
        visualStyle: designLang.style || 'flat',
        designLanguage: {
            corners: designLang.cornersStyle || 'rounded',
            shadows: designLang.shadowStyle || 'medium',
            lines: designLang.lineStyle || 'medium',
            density: designLang.density || 'balanced',
            complexity: designLang.complexity || 'moderate'
        },

        // Mood and personality
        mood: {
            primary: personality.tone || 'professional',
            energy: personality.energy || 'dynamic',
            archetype: personality.archetype,
            traits: personality.traits || []
        },

        // Motifs and effects
        motifs: visualAnalysis.visualMotifs || {},
        effects: visualAnalysis.recommendedEffects || {},

        // Spacing/layout
        spatial: visualAnalysis.spatialDesign || {},

        // Industry
        industry: visualAnalysis.industryMatch || {},

        // Color psychology insights
        psychology: psychology || {},

        // Raw data
        _extractedColors: extractedColors,
        _visualAnalysis: visualAnalysis
    };
}

/**
 * Get default visual analysis
 */
function getDefaultVisualAnalysis() {
    return {
        brandPersonality: {
            archetype: 'innovator',
            traits: ['professional', 'modern', 'trustworthy'],
            tone: 'professional',
            energy: 'dynamic'
        },
        colorAnalysis: {
            contrastStyle: 'high',
            colorTemperature: 'cool'
        },
        typographyStyle: {
            headlineStyle: 'bold',
            recommendedWeight: '700',
            recommendedPairing: 'modern_tech'
        },
        designLanguage: {
            style: 'flat',
            cornersStyle: 'rounded',
            shadowStyle: 'medium'
        },
        visualMotifs: {
            usesGradients: true,
            gradientStyle: 'linear'
        },
        recommendedEffects: {
            backgroundEffects: ['gradient', 'particles'],
            textEffects: ['shadow']
        },
        industryMatch: {
            primaryIndustry: 'technology',
            confidenceScore: 0.6
        }
    };
}

/**
 * Get default brand DNA
 */
function getDefaultBrandDNA(context) {
    return synthesizeBrandDNA(
        {
            primary: '#3B82F6',
            secondary: '#8B5CF6',
            background: '#0A0A1A',
            text: '#FFFFFF',
            allColors: []
        },
        getDefaultVisualAnalysis(),
        context
    );
}

// ========================================
// BRAND CONSISTENCY CHECKER
// ========================================

/**
 * Check if new design matches brand DNA
 */
export function checkBrandConsistency(designSpecs, brandDNA) {
    let score = 100;
    const issues = [];

    // Color consistency
    if (designSpecs.colors?.primary !== brandDNA.colors.primary) {
        const distance = colorDistance(designSpecs.colors?.primary, brandDNA.colors.primary);
        if (distance > 50) {
            score -= 20;
            issues.push('Primary color deviates from brand');
        }
    }

    // Typography consistency
    if (designSpecs.typography?.pairing !== brandDNA.typography.pairingName) {
        score -= 10;
        issues.push('Typography pairing differs from brand');
    }

    // Mood consistency
    if (designSpecs.mood?.primary !== brandDNA.mood.primary) {
        score -= 15;
        issues.push('Mood differs from brand identity');
    }

    return {
        score,
        consistent: score >= 70,
        issues,
        recommendations: issues.map(i => `Fix: ${i}`)
    };
}

/**
 * Simple color distance
 */
function colorDistance(hex1, hex2) {
    if (!hex1 || !hex2) return 100;

    const hsl1 = hexToHsl(hex1);
    const hsl2 = hexToHsl(hex2);

    if (!hsl1 || !hsl2) return 100;

    const hueDiff = Math.min(Math.abs(hsl1.h - hsl2.h), 360 - Math.abs(hsl1.h - hsl2.h));
    const satDiff = Math.abs(hsl1.s - hsl2.s);
    const lightDiff = Math.abs(hsl1.l - hsl2.l);

    return (hueDiff / 360 * 50) + (satDiff / 100 * 25) + (lightDiff / 100 * 25);
}

export default {
    extractBrandDNA,
    checkBrandConsistency
};
