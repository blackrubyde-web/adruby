/**
 * Design Analyzer
 * 
 * GPT-4 Vision powered analysis of ad images.
 * Extracts design patterns, layout rules, and style information.
 */

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analyze an ad image to extract design patterns
 */
export async function analyzeAdDesign(imageUrl, adMetadata = {}) {
    console.log('[DesignAnalyzer] Analyzing ad design...');

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `You are an expert Meta ad designer. Analyze this advertisement image and extract detailed design patterns.

AD METADATA:
- Niche: ${adMetadata.niches?.join(', ') || 'Unknown'}
- Format: ${adMetadata.display_format || 'image'}
- Running Duration: ${adMetadata.running_duration?.days || 'Unknown'} days

Analyze the image and return a JSON object with these exact fields:

{
  "layout": {
    "pattern": "hero_product|feature_callout|stats_grid|comparison_split|lifestyle|minimal|text_heavy",
    "productPosition": {"x": 0-100, "y": 0-100, "width": 0-100, "height": 0-100},
    "textZones": [
      {"name": "headline", "x": 0-100, "y": 0-100, "width": 0-100, "height": 0-100},
      {"name": "tagline", "x": 0-100, "y": 0-100, "width": 0-100, "height": 0-100},
      {"name": "cta", "x": 0-100, "y": 0-100, "width": 0-100, "height": 0-100}
    ],
    "safeZones": [{"x": 0-100, "y": 0-100, "width": 0-100, "height": 0-100}]
  },
  "typography": {
    "headlineSize": "small|medium|large|xlarge",
    "headlineWeight": "normal|medium|semibold|bold|extrabold",
    "headlineStyle": "serif|sans-serif|display",
    "textAlignment": "left|center|right",
    "maxHeadlineChars": 25,
    "contrastRatio": "high|medium|low"
  },
  "colors": {
    "background": "#hex",
    "backgroundType": "solid|gradient|photo",
    "primaryText": "#hex",
    "accentColor": "#hex",
    "ctaBackground": "#hex",
    "ctaText": "#hex"
  },
  "elements": {
    "hasArrows": true|false,
    "hasDottedLines": true|false,
    "hasBadges": true|false,
    "hasCalloutLabels": true|false,
    "hasStats": true|false,
    "hasSocialProof": true|false,
    "ctaStyle": "button|text|pill|none"
  },
  "style": {
    "mood": "professional|playful|luxury|minimal|energetic|cozy",
    "visualDensity": "sparse|balanced|dense",
    "effects": ["shadow", "glow", "gradient", "grain", "reflection"]
  },
  "quality": {
    "overallScore": 1-10,
    "textLegibility": 1-10,
    "productClarity": 1-10,
    "compositionBalance": 1-10
  }
}

Return ONLY the JSON object, no other text.`
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageUrl,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1500,
            temperature: 0.2
        });

        const content = response.choices[0].message.content;

        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No valid JSON in response');
        }

        const analysis = JSON.parse(jsonMatch[0]);
        console.log('[DesignAnalyzer] Analysis complete:', analysis.layout?.pattern);

        return {
            success: true,
            analysis,
            imageUrl
        };

    } catch (error) {
        console.error('[DesignAnalyzer] Analysis failed:', error.message);
        return {
            success: false,
            error: error.message,
            analysis: getDefaultAnalysis()
        };
    }
}

/**
 * Analyze generated background image for text placement
 */
export async function analyzeBackgroundForText(imageBuffer) {
    console.log('[DesignAnalyzer] Analyzing background for text placement...');

    try {
        const base64Image = imageBuffer.toString('base64');

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Analyze this generated ad background image to find optimal text placement zones.

The image will have text overlaid on it. Find:
1. Safe zones for text (areas with low visual complexity, good contrast)
2. Product/focal point location to avoid
3. Recommended text positions

Return JSON:
{
  "focalPoint": {"x": 0-100, "y": 0-100},
  "productBounds": {"x": 0-100, "y": 0-100, "width": 0-100, "height": 0-100},
  "safeZones": [
    {"zone": "top", "x": 0-100, "y": 0-100, "width": 0-100, "height": 0-100, "suitability": 1-10},
    {"zone": "bottom", "x": 0-100, "y": 0-100, "width": 0-100, "height": 0-100, "suitability": 1-10}
  ],
  "recommendedLayout": {
    "headline": {"x": 0-100, "y": 0-100, "maxWidth": 0-100, "alignment": "left|center|right"},
    "tagline": {"x": 0-100, "y": 0-100, "maxWidth": 0-100, "alignment": "left|center|right"},
    "cta": {"x": 0-100, "y": 0-100}
  },
  "dominantColors": ["#hex1", "#hex2"],
  "suggestedTextColor": "#hex",
  "needsTextShadow": true|false,
  "backgroundComplexity": "simple|medium|complex"
}

Return ONLY the JSON object.`
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/png;base64,${base64Image}`,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            max_tokens: 800,
            temperature: 0.2
        });

        const content = response.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error('No valid JSON in response');
        }

        return JSON.parse(jsonMatch[0]);

    } catch (error) {
        console.error('[DesignAnalyzer] Background analysis failed:', error.message);
        return getDefaultBackgroundAnalysis();
    }
}

/**
 * Batch analyze multiple ads
 */
export async function batchAnalyzeAds(ads, maxConcurrent = 3) {
    console.log(`[DesignAnalyzer] Batch analyzing ${ads.length} ads...`);

    const results = [];

    for (let i = 0; i < ads.length; i += maxConcurrent) {
        const batch = ads.slice(i, i + maxConcurrent);
        const batchPromises = batch.map(ad => {
            const imageUrl = ad.image || ad.thumbnail;
            if (!imageUrl) return null;
            return analyzeAdDesign(imageUrl, ad);
        }).filter(Boolean);

        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((result, idx) => {
            if (result.status === 'fulfilled' && result.value.success) {
                results.push({
                    adId: batch[idx].id,
                    analysis: result.value.analysis
                });
            }
        });

        // Rate limiting
        if (i + maxConcurrent < ads.length) {
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    console.log(`[DesignAnalyzer] Completed ${results.length} analyses`);
    return results;
}

/**
 * Default analysis fallback
 */
function getDefaultAnalysis() {
    return {
        layout: {
            pattern: 'hero_product',
            productPosition: { x: 30, y: 30, width: 40, height: 50 },
            textZones: [
                { name: 'headline', x: 10, y: 5, width: 80, height: 15 },
                { name: 'cta', x: 35, y: 88, width: 30, height: 8 }
            ]
        },
        typography: {
            headlineSize: 'large',
            headlineWeight: 'bold',
            headlineStyle: 'sans-serif',
            textAlignment: 'center'
        },
        colors: {
            background: '#1a1a1a',
            primaryText: '#FFFFFF',
            accentColor: '#FF4757'
        },
        elements: {
            ctaStyle: 'button'
        },
        quality: {
            overallScore: 5
        }
    };
}

/**
 * Default background analysis fallback
 */
function getDefaultBackgroundAnalysis() {
    return {
        focalPoint: { x: 50, y: 50 },
        productBounds: { x: 25, y: 25, width: 50, height: 50 },
        safeZones: [
            { zone: 'top', x: 0, y: 0, width: 100, height: 20, suitability: 8 },
            { zone: 'bottom', x: 0, y: 80, width: 100, height: 20, suitability: 7 }
        ],
        recommendedLayout: {
            headline: { x: 50, y: 10, maxWidth: 80, alignment: 'center' },
            cta: { x: 50, y: 92 }
        },
        suggestedTextColor: '#FFFFFF',
        needsTextShadow: true,
        backgroundComplexity: 'medium'
    };
}

export default { analyzeAdDesign, analyzeBackgroundForText, batchAnalyzeAds };
