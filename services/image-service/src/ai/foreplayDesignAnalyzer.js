/**
 * FOREPLAY DESIGN ANALYZER - Deep Pattern Extraction
 * 
 * Analyzes winning Foreplay ads with GPT-4V to extract:
 * - Exact layout metrics (margins, spacing, alignment)
 * - Typography patterns (font sizes, weights, letter spacing)
 * - Color usage (gradients, overlays, accent placement)
 * - Visual elements (badges, icons, callouts, decorative shapes)
 * - CTA styles and placements
 * - Composition rules (rule of thirds, focal points)
 */

import OpenAI from 'openai';
import { selectWinningSchema, WINNING_AD_SCHEMAS } from '../patterns/foreplayPatternLibrary.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Deep analyze multiple Foreplay reference ads
 * Returns comprehensive design specs for recreation
 */
export async function analyzeReferenceAds(referenceAds, productAnalysis) {
    if (!referenceAds || referenceAds.length === 0) {
        console.log('[DesignAnalyzer] No references, using default patterns');
        return getDefaultDesignSpecs();
    }

    console.log(`[DesignAnalyzer] 🔍 Analyzing ${referenceAds.length} Foreplay references...`);

    try {
        // Analyze up to 5 top-performing ads
        const adsToAnalyze = referenceAds
            .sort((a, b) => (b.running_duration?.days || 0) - (a.running_duration?.days || 0))
            .slice(0, 5);

        const analyses = await Promise.all(
            adsToAnalyze.map(ad => analyzeSingleAd(ad))
        );

        // Synthesize patterns from all analyses
        const synthesized = synthesizePatterns(analyses, productAnalysis);

        console.log('[DesignAnalyzer] ✅ Pattern synthesis complete');
        return synthesized;

    } catch (error) {
        console.error('[DesignAnalyzer] Analysis failed:', error.message);
        return getDefaultDesignSpecs();
    }
}

/**
 * Deep analyze a single ad with GPT-4V
 */
async function analyzeSingleAd(ad) {
    const imageUrl = ad.image || ad.thumbnail;
    if (!imageUrl) return null;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: { url: imageUrl, detail: 'high' }
                    },
                    {
                        type: 'text',
                        text: `You are an elite creative director analyzing this high-performing ad (running ${ad.running_duration?.days || 30}+ days).

Analyze EVERY visual element with pixel-level precision.

Return JSON with these EXACT specifications:

{
    "layout": {
        "gridType": "rule_of_thirds|centered|asymmetric|diagonal",
        "productPlacement": {
            "zone": "center|left|right|top|bottom|top_left|top_right|bottom_left|bottom_right",
            "xPercent": 0.5,
            "yPercent": 0.45,
            "scalePercent": 0.55,
            "rotation": 0,
            "hasDeviceFrame": true,
            "deviceType": "macbook|ipad|phone|browser|none"
        },
        "margins": {
            "topPercent": 0.08,
            "bottomPercent": 0.1,
            "leftPercent": 0.06,
            "rightPercent": 0.06
        },
        "spacing": "tight|normal|loose"
    },
    "typography": {
        "headline": {
            "placement": "top|bottom|left|right|overlay",
            "yPercent": 0.1,
            "alignment": "center|left|right",
            "sizePx": 56,
            "weight": 800,
            "letterSpacing": "tight|normal|wide",
            "color": "#FFFFFF",
            "hasGradient": false,
            "gradientColors": [],
            "hasShadow": true,
            "shadowBlur": 10,
            "maxLines": 2
        },
        "tagline": {
            "show": true,
            "yPercent": 0.18,
            "sizePx": 24,
            "weight": 400,
            "color": "rgba(255,255,255,0.8)",
            "style": "normal|italic"
        },
        "cta": {
            "placement": "bottom|inline|floating",
            "yPercent": 0.88,
            "style": "pill|rounded|square|outline|gradient",
            "widthPx": 280,
            "heightPx": 56,
            "borderRadius": 28,
            "backgroundColor": "#FF4757",
            "hasGradient": true,
            "gradientDirection": "horizontal|vertical|diagonal",
            "hasGlow": true,
            "glowColor": "#FF4757",
            "glowIntensity": 0.4,
            "textColor": "#FFFFFF",
            "textSizePx": 20,
            "textWeight": 700,
            "hasIcon": false,
            "iconPosition": "left|right"
        }
    },
    "colors": {
        "backgroundType": "solid|gradient|image|pattern",
        "backgroundPrimary": "#0A0A1A",
        "backgroundSecondary": "#1A1A3A",
        "gradientDirection": "radial|linear_vertical|linear_horizontal|linear_diagonal",
        "accentColor": "#FF4757",
        "accentUsage": ["cta", "glow", "highlights"],
        "overlayColor": "rgba(0,0,0,0.3)",
        "hasVignette": true
    },
    "visualElements": {
        "badges": [
            {
                "type": "trust|award|rating|discount|new",
                "text": "⭐ 4.9 Rating",
                "position": "top_left|top_right|near_cta",
                "style": "pill|circle|rectangle",
                "backgroundColor": "rgba(255,255,255,0.1)",
                "borderColor": "rgba(255,255,255,0.2)"
            }
        ],
        "featureCallouts": [
            {
                "text": "AI-Powered",
                "position": { "xPercent": 0.2, "yPercent": 0.6 },
                "hasPointer": true,
                "pointerTarget": "product"
            }
        ],
        "decorativeElements": [
            {
                "type": "glow_orb|line|shape|particles|bokeh",
                "position": { "xPercent": 0.5, "yPercent": 0.4 },
                "color": "#FF4757",
                "opacity": 0.15,
                "size": "small|medium|large"
            }
        ],
        "icons": [],
        "socialProof": {
            "show": false,
            "type": "stars|reviews_count|users_count|logo_bar",
            "position": "bottom|top|near_cta"
        }
    },
    "effects": {
        "productShadow": {
            "show": true,
            "type": "drop|ambient|hard",
            "blur": 25,
            "opacity": 0.5,
            "offsetY": 15
        },
        "productReflection": {
            "show": false,
            "opacity": 0.1
        },
        "backgroundEffects": {
            "hasParticles": false,
            "hasBokeh": true,
            "bokehCount": 4,
            "hasNoiseTexture": true,
            "noiseOpacity": 0.02,
            "hasLightRays": false
        },
        "screenGlow": {
            "show": true,
            "color": "#4A90D9",
            "intensity": 0.08
        }
    },
    "composition": {
        "focalPoint": { "xPercent": 0.5, "yPercent": 0.45 },
        "visualFlow": "top_to_bottom|left_to_right|center_out|z_pattern",
        "hierarchy": ["headline", "product", "tagline", "cta"],
        "whitespaceBalance": "minimal|balanced|generous",
        "contrast": "high|medium|subtle"
    },
    "mood": {
        "primary": "premium|playful|urgent|professional|minimal",
        "energy": "calm|dynamic|intense",
        "trust": "corporate|friendly|luxury"
    }
}`
                    }
                ]
            }],
            max_tokens: 2000,
            response_format: { type: 'json_object' }
        });

        const analysis = JSON.parse(response.choices[0].message.content);
        console.log(`[DesignAnalyzer] ✅ Analyzed: ${ad.headline || 'Ad'}`);
        return analysis;

    } catch (error) {
        console.warn(`[DesignAnalyzer] Single ad analysis failed:`, error.message);
        return null;
    }
}

/**
 * Synthesize patterns from multiple ad analyses
 */
function synthesizePatterns(analyses, productAnalysis) {
    const validAnalyses = analyses.filter(a => a !== null);

    if (validAnalyses.length === 0) {
        return getDefaultDesignSpecs();
    }

    // Aggregate common patterns
    const synthesis = {
        // Layout - average or most common
        layout: synthesizeLayout(validAnalyses),

        // Typography - most successful patterns
        typography: synthesizeTypography(validAnalyses),

        // Colors - extract palette
        colors: synthesizeColors(validAnalyses, productAnalysis),

        // Visual elements - collect unique ones
        visualElements: synthesizeVisualElements(validAnalyses),

        // Effects - merge best ones
        effects: synthesizeEffects(validAnalyses),

        // Composition rules
        composition: synthesizeComposition(validAnalyses),

        // Mood - most common
        mood: synthesizeMood(validAnalyses),

        // Meta
        confidence: validAnalyses.length / 5,
        referenceCount: validAnalyses.length
    };

    return synthesis;
}

function synthesizeLayout(analyses) {
    const layouts = analyses.map(a => a.layout).filter(Boolean);
    if (layouts.length === 0) return getDefaultDesignSpecs().layout;

    // Average positions
    const avgProductX = average(layouts.map(l => l.productPlacement?.xPercent || 0.5));
    const avgProductY = average(layouts.map(l => l.productPlacement?.yPercent || 0.45));
    const avgProductScale = average(layouts.map(l => l.productPlacement?.scalePercent || 0.55));

    // Most common grid type
    const gridTypes = layouts.map(l => l.gridType);
    const mostCommonGrid = mostCommon(gridTypes) || 'centered';

    // Most common device
    const devices = layouts.map(l => l.productPlacement?.deviceType).filter(Boolean);
    const mostCommonDevice = mostCommon(devices) || 'macbook';

    return {
        gridType: mostCommonGrid,
        productPlacement: {
            zone: mostCommon(layouts.map(l => l.productPlacement?.zone)) || 'center',
            xPercent: avgProductX,
            yPercent: avgProductY,
            scalePercent: avgProductScale,
            rotation: average(layouts.map(l => l.productPlacement?.rotation || 0)),
            // FIX: Default to TRUE, only false if explicitly set to false in all layouts
            hasDeviceFrame: !layouts.every(l => l.productPlacement?.hasDeviceFrame === false),
            deviceType: mostCommonDevice
        },
        margins: {
            topPercent: average(layouts.map(l => l.margins?.topPercent || 0.08)),
            bottomPercent: average(layouts.map(l => l.margins?.bottomPercent || 0.1)),
            leftPercent: average(layouts.map(l => l.margins?.leftPercent || 0.06)),
            rightPercent: average(layouts.map(l => l.margins?.rightPercent || 0.06))
        },
        spacing: mostCommon(layouts.map(l => l.spacing)) || 'normal'
    };
}

function synthesizeTypography(analyses) {
    const typos = analyses.map(a => a.typography).filter(Boolean);
    if (typos.length === 0) return getDefaultDesignSpecs().typography;

    return {
        headline: {
            placement: mostCommon(typos.map(t => t.headline?.placement)) || 'top',
            yPercent: average(typos.map(t => t.headline?.yPercent || 0.1)),
            alignment: mostCommon(typos.map(t => t.headline?.alignment)) || 'center',
            sizePx: Math.round(average(typos.map(t => t.headline?.sizePx || 56))),
            weight: Math.round(average(typos.map(t => t.headline?.weight || 800))),
            letterSpacing: mostCommon(typos.map(t => t.headline?.letterSpacing)) || 'tight',
            color: '#FFFFFF',
            hasShadow: typos.some(t => t.headline?.hasShadow !== false),
            shadowBlur: Math.round(average(typos.map(t => t.headline?.shadowBlur || 10))),
            maxLines: Math.round(average(typos.map(t => t.headline?.maxLines || 2)))
        },
        tagline: {
            show: typos.filter(t => t.tagline?.show).length >= typos.length / 2,
            yPercent: average(typos.map(t => t.tagline?.yPercent || 0.18)),
            sizePx: Math.round(average(typos.map(t => t.tagline?.sizePx || 24))),
            weight: Math.round(average(typos.map(t => t.tagline?.weight || 400))),
            color: 'rgba(255,255,255,0.8)'
        },
        cta: {
            placement: mostCommon(typos.map(t => t.cta?.placement)) || 'bottom',
            yPercent: average(typos.map(t => t.cta?.yPercent || 0.88)),
            style: mostCommon(typos.map(t => t.cta?.style)) || 'pill',
            widthPx: Math.round(average(typos.map(t => t.cta?.widthPx || 280))),
            heightPx: Math.round(average(typos.map(t => t.cta?.heightPx || 56))),
            borderRadius: Math.round(average(typos.map(t => t.cta?.borderRadius || 28))),
            // FIX: Default to TRUE for premium effects - only false if explicitly disabled
            hasGradient: !typos.every(t => t.cta?.hasGradient === false),
            hasGlow: !typos.every(t => t.cta?.hasGlow === false),
            glowIntensity: average(typos.map(t => t.cta?.glowIntensity || 0.5)),
            textSizePx: Math.round(average(typos.map(t => t.cta?.textSizePx || 20))),
            textWeight: Math.round(average(typos.map(t => t.cta?.textWeight || 700)))
        }
    };
}

function synthesizeColors(analyses, productAnalysis) {
    const colors = analyses.map(a => a.colors).filter(Boolean);
    if (colors.length === 0) return getDefaultDesignSpecs().colors;

    // Use product accent if available
    const accent = productAnalysis?.colorPalette?.[0] ||
        mostCommon(colors.map(c => c.accentColor)) ||
        '#FF4757';

    return {
        backgroundType: mostCommon(colors.map(c => c.backgroundType)) || 'gradient',
        backgroundPrimary: mostCommon(colors.map(c => c.backgroundPrimary)) || '#0A0A1A',
        backgroundSecondary: mostCommon(colors.map(c => c.backgroundSecondary)) || '#1A1A3A',
        gradientDirection: mostCommon(colors.map(c => c.gradientDirection)) || 'radial',
        accentColor: accent,
        hasVignette: colors.filter(c => c.hasVignette).length >= colors.length / 2
    };
}

function synthesizeVisualElements(analyses) {
    const elements = analyses.map(a => a.visualElements).filter(Boolean);
    const defaults = getDefaultDesignSpecs().visualElements;

    // If no reference elements, use rich defaults
    if (elements.length === 0) return defaults;

    // Collect all from references
    const allBadges = elements.flatMap(e => e.badges || []);
    const allCallouts = elements.flatMap(e => e.featureCallouts || []);
    const allDecorative = elements.flatMap(e => e.decorativeElements || []);
    const socialProofs = elements.map(e => e.socialProof).filter(s => s?.show);

    // FIX: Merge with defaults - use defaults if reference has fewer elements
    return {
        // Use reference badges if found, otherwise use defaults
        badges: allBadges.length > 0 ? allBadges.slice(0, 3) : defaults.badges,
        // Use reference callouts if found, otherwise use defaults  
        featureCallouts: allCallouts.length > 0 ? allCallouts.slice(0, 4) : defaults.featureCallouts,
        // ALWAYS include decorative elements - merge reference + defaults
        decorativeElements: allDecorative.length > 0
            ? [...allDecorative.slice(0, 3), ...defaults.decorativeElements.slice(0, 2)]
            : defaults.decorativeElements,
        // Use reference social proof if any show, otherwise use default (now enabled)
        socialProof: socialProofs.length > 0 ? socialProofs[0] : defaults.socialProof
    };
}

function synthesizeEffects(analyses) {
    const effects = analyses.map(a => a.effects).filter(Boolean);
    if (effects.length === 0) return getDefaultDesignSpecs().effects;

    return {
        productShadow: {
            // FIX: Default show to TRUE unless explicitly disabled
            show: !effects.every(e => e.productShadow?.show === false),
            type: mostCommon(effects.map(e => e.productShadow?.type)) || 'layered',
            blur: Math.round(average(effects.map(e => e.productShadow?.blur || 30))),
            opacity: average(effects.map(e => e.productShadow?.opacity || 0.6)),
            offsetY: Math.round(average(effects.map(e => e.productShadow?.offsetY || 20)))
        },
        productReflection: {
            show: effects.some(e => e.productReflection?.show),
            opacity: average(effects.map(e => e.productReflection?.opacity || 0.15))
        },
        backgroundEffects: {
            // FIX: All premium effects default TRUE
            hasParticles: !effects.every(e => e.backgroundEffects?.hasParticles === false),
            hasBokeh: !effects.every(e => e.backgroundEffects?.hasBokeh === false),
            bokehCount: Math.round(average(effects.map(e => e.backgroundEffects?.bokehCount || 6))),
            hasNoiseTexture: !effects.every(e => e.backgroundEffects?.hasNoiseTexture === false),
            noiseOpacity: average(effects.map(e => e.backgroundEffects?.noiseOpacity || 0.03))
        },
        screenGlow: {
            // FIX: Screen glow default TRUE for premium look
            show: !effects.every(e => e.screenGlow?.show === false),
            intensity: average(effects.map(e => e.screenGlow?.intensity || 0.12))
        }
    };
}

function synthesizeComposition(analyses) {
    const compositions = analyses.map(a => a.composition).filter(Boolean);
    if (compositions.length === 0) return getDefaultDesignSpecs().composition;

    return {
        focalPoint: {
            xPercent: average(compositions.map(c => c.focalPoint?.xPercent || 0.5)),
            yPercent: average(compositions.map(c => c.focalPoint?.yPercent || 0.45))
        },
        visualFlow: mostCommon(compositions.map(c => c.visualFlow)) || 'top_to_bottom',
        hierarchy: ['headline', 'product', 'tagline', 'cta'],
        whitespaceBalance: mostCommon(compositions.map(c => c.whitespaceBalance)) || 'balanced',
        contrast: mostCommon(compositions.map(c => c.contrast)) || 'high'
    };
}

function synthesizeMood(analyses) {
    const moods = analyses.map(a => a.mood).filter(Boolean);
    if (moods.length === 0) return { primary: 'premium', energy: 'dynamic', trust: 'luxury' };

    return {
        primary: mostCommon(moods.map(m => m.primary)) || 'premium',
        energy: mostCommon(moods.map(m => m.energy)) || 'dynamic',
        trust: mostCommon(moods.map(m => m.trust)) || 'luxury'
    };
}

/**
 * Default design specs for fallback
 */
export function getDefaultDesignSpecs() {
    return {
        layout: {
            gridType: 'centered',
            productPlacement: {
                zone: 'center',
                xPercent: 0.5,
                yPercent: 0.45,
                scalePercent: 0.55,
                rotation: 0,
                hasDeviceFrame: true,
                deviceType: 'macbook'
            },
            margins: {
                topPercent: 0.08,
                bottomPercent: 0.1,
                leftPercent: 0.06,
                rightPercent: 0.06
            },
            spacing: 'normal'
        },
        typography: {
            headline: {
                placement: 'top',
                yPercent: 0.1,
                alignment: 'center',
                sizePx: 56,
                weight: 800,
                letterSpacing: 'tight',
                color: '#FFFFFF',
                hasShadow: true,
                shadowBlur: 10,
                maxLines: 2
            },
            tagline: {
                show: true,
                yPercent: 0.18,
                sizePx: 24,
                weight: 400,
                color: 'rgba(255,255,255,0.8)'
            },
            cta: {
                placement: 'bottom',
                yPercent: 0.88,
                style: 'pill',
                widthPx: 280,
                heightPx: 56,
                borderRadius: 28,
                hasGradient: true,
                hasGlow: true,
                glowIntensity: 0.4,
                textSizePx: 20,
                textWeight: 700
            }
        },
        colors: {
            backgroundType: 'gradient',
            backgroundPrimary: '#0A0A1A',
            backgroundSecondary: '#1A1A3A',
            gradientDirection: 'radial',
            accentColor: '#FF4757',
            hasVignette: true
        },
        visualElements: {
            // Premium badges for trust and credibility
            badges: [
                {
                    type: 'trust',
                    text: '⭐ 4.9 Rating',
                    position: 'top_right',
                    style: 'pill',
                    backgroundColor: 'rgba(255,215,0,0.15)',
                    borderColor: 'rgba(255,215,0,0.3)'
                }
            ],
            // Feature callouts with pointer lines to product
            featureCallouts: [
                {
                    text: '✨ AI-Powered',
                    position: { xPercent: 0.15, yPercent: 0.55 },
                    hasPointer: true,
                    pointerTarget: 'product'
                },
                {
                    text: '⚡ Lightning Fast',
                    position: { xPercent: 0.85, yPercent: 0.50 },
                    hasPointer: true,
                    pointerTarget: 'product'
                }
            ],
            // Rich decorative elements for visual interest
            decorativeElements: [
                { type: 'glow_orb', position: { xPercent: 0.2, yPercent: 0.3 }, color: '#FF4757', opacity: 0.12, size: 'large' },
                { type: 'glow_orb', position: { xPercent: 0.8, yPercent: 0.6 }, color: '#4A90D9', opacity: 0.1, size: 'medium' },
                { type: 'bokeh', position: { xPercent: 0.3, yPercent: 0.25 }, color: '#FFFFFF', opacity: 0.08, size: 'medium' },
                { type: 'bokeh', position: { xPercent: 0.7, yPercent: 0.7 }, color: '#FF4757', opacity: 0.06, size: 'small' },
                { type: 'particles', position: { xPercent: 0.5, yPercent: 0.35 }, color: '#FFFFFF', opacity: 0.15, size: 'large' }
            ],
            // Social proof for conversion
            socialProof: {
                show: true,
                type: 'stars',
                rating: 4.9,
                count: '2,500+',
                position: 'near_cta'
            }
        },
        effects: {
            productShadow: { show: true, type: 'layered', blur: 30, opacity: 0.6, offsetY: 20 },
            productReflection: { show: true, opacity: 0.15 },
            backgroundEffects: {
                hasBokeh: true,
                bokehCount: 6,
                hasParticles: true,
                hasNoiseTexture: true,
                noiseOpacity: 0.03
            },
            screenGlow: { show: true, intensity: 0.12 }
        },
        composition: {
            focalPoint: { xPercent: 0.5, yPercent: 0.45 },
            visualFlow: 'top_to_bottom',
            hierarchy: ['headline', 'product', 'tagline', 'cta'],
            whitespaceBalance: 'balanced',
            contrast: 'high'
        },
        mood: {
            primary: 'premium',
            energy: 'dynamic',
            trust: 'luxury'
        },
        confidence: 0.5,
        referenceCount: 0
    };
}

// Helper functions
function average(arr) {
    const nums = arr.filter(n => typeof n === 'number');
    if (nums.length === 0) return 0;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function mostCommon(arr) {
    const filtered = arr.filter(Boolean);
    if (filtered.length === 0) return null;

    const counts = {};
    for (const item of filtered) {
        counts[item] = (counts[item] || 0) + 1;
    }

    let max = 0;
    let result = null;
    for (const [key, count] of Object.entries(counts)) {
        if (count > max) {
            max = count;
            result = key;
        }
    }
    return result;
}

/**
 * PLAN AD COMPOSITION - AI Creative Director Final Step
 * 
 * Takes synthesized Foreplay patterns + user's deepAnalysis and creates
 * an optimal AI-driven composition plan with specific decisions about:
 * - What elements to include and WHERE exactly
 * - What text to use (from deepAnalysis suggestions or custom)
 * - Which Foreplay patterns to apply
 * - What to explicitly EXCLUDE
 */
export async function planAdComposition(foreplayPatterns, deepAnalysis, productAnalysis, userPrompt = '', industry = '') {
    console.log('[AdPlanner] 🧠 AI Creative Director planning final composition...');

    try {
        // Select base schema for psychology/fallback, but REAL patterns take priority
        const schemaResult = selectWinningSchema(productAnalysis, industry, userPrompt);
        const selectedSchema = schemaResult.schema;
        console.log(`[AdPlanner] 📋 Base Schema: ${selectedSchema.name} (for psychology guidance)`);

        // Count how many actual Foreplay references we have
        const hasRealPatterns = foreplayPatterns && foreplayPatterns.referenceCount > 0;
        console.log(`[AdPlanner] 🎯 ${hasRealPatterns ? `Using ${foreplayPatterns.referenceCount} REAL Foreplay patterns` : 'No real patterns - using schema defaults'}`);

        // Create CUSTOMIZED schema by merging real patterns with template
        const customizedSchema = hasRealPatterns ? {
            name: `Custom: ${selectedSchema.name}`,
            // Use REAL patterns for layout, override schema
            layout: {
                ...selectedSchema.layout,
                productPosition: foreplayPatterns.layout?.productPlacement ? {
                    x: foreplayPatterns.layout.productPlacement.xPercent,
                    y: foreplayPatterns.layout.productPlacement.yPercent
                } : selectedSchema.layout.productPosition,
                productScale: foreplayPatterns.layout?.productPlacement?.scalePercent || selectedSchema.layout.productScale
            },
            // Use REAL typography from Foreplay
            typography: {
                headline: foreplayPatterns.typography?.headline || selectedSchema.typography?.headline,
                tagline: foreplayPatterns.typography?.tagline || selectedSchema.typography?.tagline,
                cta: foreplayPatterns.typography?.cta || selectedSchema.typography?.cta
            },
            // Use REAL colors from Foreplay
            colors: {
                background: foreplayPatterns.colors?.backgroundType || 'dark_gradient',
                accent: foreplayPatterns.colors?.accentColor || selectedSchema.colors?.accent,
                primary: foreplayPatterns.colors?.backgroundPrimary,
                secondary: foreplayPatterns.colors?.backgroundSecondary
            },
            // Keep schema elements limits but adapt to real patterns
            elements: selectedSchema.elements,
            // Use schema psychology
            psychology: selectedSchema.psychology
        } : selectedSchema;

        console.log(`[AdPlanner] 🎨 Customized Schema Created:`);
        console.log(`[AdPlanner]   Layout: ${JSON.stringify(customizedSchema.layout?.productPosition || {})}`);
        console.log(`[AdPlanner]   Accent: ${customizedSchema.colors?.accent || 'default'}`);

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'system',
                content: `You are an elite creative director who creates UNIQUE, individualized ad compositions.

CRITICAL: You create CUSTOM designs, NOT from templates. Each ad must be unique to the product.

You will receive:
1. REAL FOREPLAY PATTERNS: Actual design specs extracted from winning ads via GPT-4V (THIS IS YOUR PRIMARY SOURCE)
2. CUSTOMIZED SCHEMA: A template customized with real Foreplay data (use for psychology and fallbacks)
3. DEEP ANALYSIS: Analysis of the user's product screenshot (visual anchors, empty spaces, content zones)
4. PRODUCT ANALYSIS: Basic product info

Your job: Create a COMPLETELY INDIVIDUALIZED composition that:
- PRIMARILY uses the REAL Foreplay patterns (they are extracted from actual winning ads!)
- Adapts the patterns to the user's specific product screenshot
- Uses the schema psychology for conversion optimization
- RESPECTS the pre-computed smartPlacements from product analysis

RULES:
- FOREPLAY FIRST: Real patterns > schema defaults
- SMART PLACEMENTS: Use the pre-computed positions from PRODUCT_SMART_PLACEMENTS as your foundation
- SAFE ZONES: NEVER place elements in noOverlay or noText areas
- SPATIAL GRID: Check which zones are occupied before placing elements
- Be UNIQUE: Don't just copy - adapt patterns to this specific product
- Be PRECISE: Give exact positions as percentages
- Use REAL VALUES: The Foreplay patterns have actual pixel values, colors, positions - USE THEM
- VALIDATE: Before finalizing, verify no elements overlap important content areas`
            }, {
                role: 'user',
                content: `Create a UNIQUE composition plan for this ad.

REAL FOREPLAY PATTERNS (from ${foreplayPatterns.referenceCount || 0} winning ads - USE THESE FIRST!):
${JSON.stringify({
                    layout: {
                        gridType: foreplayPatterns.layout?.gridType,
                        productPlacement: foreplayPatterns.layout?.productPlacement,
                        margins: foreplayPatterns.layout?.margins,
                        spacing: foreplayPatterns.layout?.spacing
                    },
                    typography: {
                        headline: foreplayPatterns.typography?.headline,
                        tagline: foreplayPatterns.typography?.tagline,
                        cta: foreplayPatterns.typography?.cta
                    },
                    colors: foreplayPatterns.colors,
                    visualElements: foreplayPatterns.visualElements,
                    effects: foreplayPatterns.effects,
                    mood: foreplayPatterns.mood
                }, null, 2)}

CUSTOMIZED SCHEMA (for psychology and fallbacks):
${JSON.stringify({
                    name: customizedSchema.name,
                    layout: customizedSchema.layout,
                    typography: customizedSchema.typography,
                    colors: customizedSchema.colors,
                    elements: customizedSchema.elements,
                    psychology: customizedSchema.psychology
                }, null, 2)}

PRODUCT DEEP ANALYSIS (adapt patterns to this):
${JSON.stringify({
                    productType: deepAnalysis?.productType,
                    contentZones: deepAnalysis?.contentZones,
                    visualAnchors: deepAnalysis?.visualAnchors?.slice(0, 3),
                    emptySpaces: deepAnalysis?.contentZones?.emptySpaces,
                    designRecommendations: deepAnalysis?.designRecommendations,
                    excludeElements: deepAnalysis?.excludeElements,
                    overallMood: deepAnalysis?.overallMood
                }, null, 2)}

PRODUCT SMART PLACEMENTS (USE THESE EXACT POSITIONS - pre-computed from screenshot analysis):
${JSON.stringify({
                    headline: deepAnalysis?.smartPlacements?.headline,
                    tagline: deepAnalysis?.smartPlacements?.tagline,
                    cta: deepAnalysis?.smartPlacements?.cta,
                    badges: deepAnalysis?.smartPlacements?.badges,
                    callouts: deepAnalysis?.smartPlacements?.callouts,
                    socialProof: deepAnalysis?.smartPlacements?.socialProof
                }, null, 2)}

SAFE ZONES (DO NOT PLACE ELEMENTS HERE):
${JSON.stringify({
                    noOverlay: deepAnalysis?.safeZones?.noOverlay,
                    noText: deepAnalysis?.safeZones?.noText,
                    spatialGrid: deepAnalysis?.spatialGrid?.zones
                }, null, 2)}

PRODUCT INFO:
${JSON.stringify({
                    name: productAnalysis?.productName,
                    type: productAnalysis?.productType,
                    keywords: productAnalysis?.keywords?.slice(0, 5)
                }, null, 2)}

USER PROMPT (if any): "${userPrompt}"

Return JSON with this EXACT structure:
{
    "headline": {
        "text": "compelling headline",
        "position": { "xPercent": 0.5, "yPercent": 0.08 },
        "sizePx": 48,
        "weight": 800,
        "alignment": "center",
        "useGradient": true,
        "colors": ["#FFFFFF", "#FF4757"]
    },
    "subheadline": {
        "text": "supporting text or null if not needed",
        "position": { "xPercent": 0.5, "yPercent": 0.16 },
        "sizePx": 20
    },
    "product": {
        "position": { "xPercent": 0.5, "yPercent": 0.5 },
        "scale": 0.65,
        "rotation": -3,
        "mockupType": "macbook|floating|browser|none",
        "addShadow": true,
        "addGlow": true
    },
    "cta": {
        "text": "Action Text",
        "position": { "xPercent": 0.5, "yPercent": 0.9 },
        "style": "gradient_pill",
        "primaryColor": "#FF4757",
        "textColor": "#FFFFFF"
    },
    "callouts": [
        {
            "text": "Feature callout",
            "pointTo": { "xPercent": 0.3, "yPercent": 0.4 },
            "position": { "xPercent": 0.15, "yPercent": 0.35 },
            "style": "glass_card"
        }
    ],
    "badges": [
        {
            "type": "rating",
            "text": "⭐ 4.9",
            "position": { "xPercent": 0.9, "yPercent": 0.1 }
        }
    ],
    "excludeFromDesign": ["excessive_badges", "multiple_callouts", "reason..."],
    "background": {
        "style": "gradient_dark",
        "primaryColor": "#0A0A1A",
        "secondaryColor": "#1A1A3A",
        "addBokeh": true,
        "addVignette": true
    },
    "designRationale": "Brief explanation of design choices"
}`
            }],
            max_tokens: 2000,
            response_format: { type: 'json_object' }
        });

        const compositionPlan = JSON.parse(response.choices[0].message.content);

        console.log('[AdPlanner] ✅ Composition Plan Created:');
        console.log(`[AdPlanner]   Headline: "${compositionPlan.headline?.text?.substring(0, 30)}..."`);
        console.log(`[AdPlanner]   Callouts: ${compositionPlan.callouts?.length || 0}`);
        console.log(`[AdPlanner]   Badges: ${compositionPlan.badges?.length || 0}`);
        console.log(`[AdPlanner]   Mockup: ${compositionPlan.product?.mockupType || 'floating'}`);
        console.log(`[AdPlanner]   Excluded: ${compositionPlan.excludeFromDesign?.join(', ') || 'none'}`);
        console.log(`[AdPlanner]   Rationale: ${compositionPlan.designRationale?.substring(0, 60)}...`);

        return compositionPlan;
    } catch (error) {
        console.error('[AdPlanner] GPT-4 planning failed:', error.message);
        return getDefaultCompositionPlan(foreplayPatterns, deepAnalysis);
    }
}

/**
 * Default composition plan when AI planning fails
 */
function getDefaultCompositionPlan(foreplayPatterns, deepAnalysis) {
    return {
        headline: {
            text: deepAnalysis?.designRecommendations?.suggestedHeadline || 'Premium Quality',
            position: { xPercent: 0.5, yPercent: 0.08 },
            sizePx: foreplayPatterns?.typography?.headline?.sizePx || 48,
            weight: 800,
            alignment: 'center',
            useGradient: true,
            colors: ['#FFFFFF', foreplayPatterns?.colors?.accentColor || '#FF4757']
        },
        subheadline: {
            text: deepAnalysis?.designRecommendations?.suggestedSubheadline || null,
            position: { xPercent: 0.5, yPercent: 0.16 },
            sizePx: 20
        },
        product: {
            position: { xPercent: 0.5, yPercent: 0.5 },
            scale: foreplayPatterns?.layout?.productPlacement?.scalePercent || 0.65,
            rotation: 0,
            mockupType: foreplayPatterns?.layout?.productPlacement?.deviceType || 'macbook',
            addShadow: true,
            addGlow: true
        },
        cta: {
            text: deepAnalysis?.designRecommendations?.ctaText || 'Learn More',
            position: { xPercent: 0.5, yPercent: 0.9 },
            style: 'gradient_pill',
            primaryColor: foreplayPatterns?.colors?.accentColor || '#FF4757',
            textColor: '#FFFFFF'
        },
        callouts: [],
        badges: [],
        excludeFromDesign: deepAnalysis?.excludeElements || [],
        background: {
            style: 'gradient_dark',
            primaryColor: foreplayPatterns?.colors?.backgroundPrimary || '#0A0A1A',
            secondaryColor: foreplayPatterns?.colors?.backgroundSecondary || '#1A1A3A',
            addBokeh: true,
            addVignette: true
        },
        designRationale: 'Fallback to safe defaults'
    };
}

export default { analyzeReferenceAds, getDefaultDesignSpecs, planAdComposition };
