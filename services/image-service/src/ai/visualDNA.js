/**
 * Visual DNA Extractor
 * 
 * Uses GPT-4V to extract pixel-precise layout information from
 * top-performing Foreplay ads. This is the key to perfect recreation.
 */

import { callOpenAI } from '../utils/openaiClient.js';


/**
 * Extract complete visual DNA from an ad image
 * Returns exact positions, sizes, colors for perfect recreation
 */
export async function extractVisualDNA(imageUrl) {
  console.log('[VisualDNA] 🧬 Extracting visual DNA from reference ad...');

  try {
    const response = await callOpenAI({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: `You are an EXPERT visual designer analyzing Meta/Facebook ads.
Your job is to extract EXACT visual specifications from successful ads.

Analyze the ad image and return PRECISE measurements as percentages of the 1080x1080 canvas.
Be extremely specific - this data will be used to recreate the exact layout.`
      }, {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this ad image and extract its complete visual DNA.

Return JSON with EXACT specifications:
{
  "layout": {
    "type": "hero_centered|feature_callout|stats_grid|lifestyle|comparison|minimal",
    "headlinePosition": {
      "x": 50,           // % from left (50 = centered)
      "y": 8,            // % from top
      "alignment": "center|left|right"
    },
    "sublinePosition": {
      "x": 50,
      "y": 14,
      "alignment": "center"
    },
    "productPosition": {
      "x": 50,           // center x
      "y": 45,           // center y
      "scale": 50        // % of frame width
    },
    "ctaPosition": {
      "x": 50,
      "y": 92
    }
  },
  "typography": {
    "headline": {
      "size": 72,        // estimated pixels
      "weight": 900,     // 400-900
      "style": "sans-serif-bold|serif|script|condensed",
      "case": "uppercase|titlecase|lowercase",
      "hasTextShadow": true,
      "shadowIntensity": "subtle|medium|strong"
    },
    "subline": {
      "size": 24,
      "weight": 400
    },
    "cta": {
      "size": 18,
      "weight": 600
    }
  },
  "colors": {
    "background": {
      "type": "solid|gradient|image",
      "primary": "#0A0A1A",
      "secondary": "#1A1A3A",
      "gradientDirection": "radial|linear-top|linear-bottom"
    },
    "text": {
      "primary": "#FFFFFF",
      "secondary": "rgba(255,255,255,0.8)"
    },
    "accent": "#FF4757",
    "cta": {
      "background": "#FF4757",
      "text": "#FFFFFF"
    }
  },
  "elements": {
    "hasFeatureCallouts": false,
    "callouts": [
      { "x": 15, "y": 40, "side": "left" },
      { "x": 85, "y": 50, "side": "right" }
    ],
    "hasConnectorLines": false,
    "lineStyle": "dotted|solid|dashed",
    "hasBadge": false,
    "badgePosition": "top-left|top-right|bottom-left|bottom-right",
    "badgeText": "",
    "hasArrows": false,
    "hasStats": false
  },
  "effects": {
    "hasProductGlow": true,
    "glowColor": "#FF4757",
    "glowIntensity": "subtle|medium|strong",
    "hasBokeh": false,
    "hasParticles": false,
    "hasVignette": true,
    "shadowStyle": "soft|hard|none",
    "hasReflection": false
  },
  "mood": "premium|bold|minimal|playful|luxury|techy|natural|urgent",
  "confidence": 0.85
}`
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl, detail: 'high' }
          }
        ]
      }],
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    });

    const dna = JSON.parse(response.choices[0].message.content);
    console.log('[VisualDNA] ✅ Extracted DNA:', dna.layout?.type || 'unknown', '| Confidence:', dna.confidence);

    return {
      success: true,
      dna,
      source: imageUrl
    };
  } catch (error) {
    console.error('[VisualDNA] Failed to extract:', error.message);
    throw error;
  }
}

/**
 * Extract DNA from multiple reference ads and find common patterns
 */
export async function extractPatternDNA(referenceAds, limit = 3) {
  console.log(`[VisualDNA] 🔬 Analyzing ${Math.min(referenceAds.length, limit)} reference ads...`);

  if (!referenceAds || referenceAds.length === 0) {
    throw new Error('Foreplay references are required for Visual DNA extraction');
  }

  const dnaResults = [];
  const adsToAnalyze = referenceAds
    .filter(ad => ad.image || ad.thumbnail)
    .slice(0, limit);

  for (const ad of adsToAnalyze) {
    const imageUrl = ad.image || ad.thumbnail;
    const result = await extractVisualDNA(imageUrl);

    if (result.success) {
      dnaResults.push({
        ...result.dna,
        adId: ad.id,
        headline: ad.headline,
        runningDays: ad.running_duration?.days
      });
    }
  }

  if (dnaResults.length === 0) {
    throw new Error('Visual DNA extraction returned no usable references');
  }

  // Find dominant pattern
  const dominantPattern = findDominantPattern(dnaResults);
  console.log('[VisualDNA] ✅ Dominant pattern:', dominantPattern.layout?.type);

  return {
    pattern: dominantPattern,
    count: dnaResults.length,
    allPatterns: dnaResults
  };
}

/**
 * Find the dominant pattern from multiple DNA extractions
 */
function findDominantPattern(dnaResults) {
  if (dnaResults.length === 1) return dnaResults[0];

  // Weight by running days (longer = more successful)
  const weighted = dnaResults.map(dna => ({
    ...dna,
    weight: (dna.runningDays || 30) / 30
  }));

  // Sort by weight and take the most successful
  weighted.sort((a, b) => b.weight - a.weight);

  // Merge top patterns (prioritize the longest-running one)
  const primary = weighted[0];

  // Average some values from top 2 if available
  if (weighted.length >= 2) {
    const secondary = weighted[1];

    // Average layout positions for more stability
    primary.layout.headlinePosition.y = Math.round(
      (primary.layout.headlinePosition.y + secondary.layout.headlinePosition.y) / 2
    );
    primary.layout.productPosition.y = Math.round(
      (primary.layout.productPosition.y + secondary.layout.productPosition.y) / 2
    );
    primary.layout.productPosition.scale = Math.round(
      (primary.layout.productPosition.scale + secondary.layout.productPosition.scale) / 2
    );
  }

  return primary;
}

/**
 * Build pixel-precise prompt from visual DNA
 */
export function buildDNAPrompt(dna, content) {
  const { headline, subline, cta, features = [], productDescription } = content;
  const canvas = 1080;

  // Convert percentage positions to pixels
  const headlineY = Math.round((dna.layout?.headlinePosition?.y || 8) * canvas / 100);
  const sublineY = Math.round((dna.layout?.sublinePosition?.y || 14) * canvas / 100);
  const productY = Math.round((dna.layout?.productPosition?.y || 45) * canvas / 100);
  const productScale = dna.layout?.productPosition?.scale || 50;
  const ctaY = Math.round((dna.layout?.ctaPosition?.y || 92) * canvas / 100);

  const typographyHeadline = dna.typography?.headline || {};
  const colors = dna.colors || {};
  const effects = dna.effects || {};

  const prompt = `=== PIXEL-PRECISE AD RECREATION ===
Canvas: ${canvas}x${canvas}px (Meta Feed Square)

=== EXACT LAYOUT SPECIFICATIONS ===

HEADLINE: "${headline}"
- Position: X=${canvas / 2}px (horizontally centered), Y=${headlineY}px from top
- Font Size: ${typographyHeadline.size || 72}px
- Font Weight: ${typographyHeadline.weight || 900} (Extra Bold)
- Font Style: ${typographyHeadline.style || 'sans-serif-bold'}, ${typographyHeadline.case || 'titlecase'}
- Color: ${colors.text?.primary || '#FFFFFF'}
${typographyHeadline.hasTextShadow ? `- Text Shadow: 0 2px 20px rgba(0,0,0,0.8) for depth and legibility` : ''}
- MUST BE CRYSTAL CLEAR AND PERFECTLY READABLE

${subline ? `
SUBLINE: "${subline}"
- Position: X=${canvas / 2}px centered, Y=${sublineY}px from top
- Font Size: ${dna.typography?.subline?.size || 24}px
- Font Weight: ${dna.typography?.subline?.weight || 400}
- Color: ${colors.text?.secondary || 'rgba(255,255,255,0.8)'}
` : ''}

PRODUCT:
- Center Position: X=${canvas / 2}px, Y=${productY}px
- Scale: ${productScale}% of frame width (${Math.round(canvas * productScale / 100)}px)
- The product must be THE HERO - prominent and perfectly lit
${productDescription ? `- Product: ${productDescription}` : ''}
- Professional three-point lighting with rim light for separation
${effects.hasProductGlow ? `- Glow Effect: ${effects.glowColor || colors.accent || '#FF4757'} at ${effects.glowIntensity || 'subtle'} intensity` : ''}
${effects.shadowStyle !== 'none' ? `- Shadow: ${effects.shadowStyle || 'soft'} drop shadow for depth` : ''}

${features.length > 0 && dna.elements?.hasFeatureCallouts ? `
FEATURE CALLOUTS:
${features.map((f, i) => {
    const pos = dna.elements?.callouts?.[i] || { x: i % 2 === 0 ? 15 : 85, y: 40 + i * 10 };
    return `- "${f}" at X=${Math.round(pos.x * canvas / 100)}px, Y=${Math.round(pos.y * canvas / 100)}px
  ${dna.elements?.hasConnectorLines ? `  - ${dna.elements.lineStyle || 'dotted'} line connecting to product` : ''}`;
  }).join('\n')}
` : ''}

CTA BUTTON: "${cta}"
- Position: X=${canvas / 2}px centered, Y=${ctaY}px from top
- Background: ${colors.cta?.background || colors.accent || '#FF4757'}
- Text: ${colors.cta?.text || '#FFFFFF'}, ${dna.typography?.cta?.size || 18}px, Bold
- Shape: Pill/rounded rectangle (border-radius: 30px)
- Width: auto-fit text with 60px horizontal padding
- Slight shadow for clickable appearance

=== BACKGROUND SPECIFICATIONS ===
- Type: ${colors.background?.type || 'gradient'}
${colors.background?.type === 'gradient' ? `
- Gradient: ${colors.background.gradientDirection || 'radial'} from ${colors.background.primary || '#0A0A1A'} to ${colors.background.secondary || '#1A1A3A'}
- Center glow matching accent color (subtle)` : `
- Color: ${colors.background?.primary || '#0A0A1A'}`}
${effects.hasVignette ? '- Vignette: Subtle darkening at edges for focus' : ''}
${effects.hasBokeh ? '- Bokeh: Soft light circles in background' : ''}
${effects.hasParticles ? '- Particles: Subtle floating specks for atmosphere' : ''}

${dna.elements?.hasBadge ? `
BADGE:
- Position: ${dna.elements.badgePosition || 'top-right'} corner
- Text: "${dna.elements.badgeText || 'NEW'}"
- Style: Small, attention-grabbing
` : ''}

=== QUALITY REQUIREMENTS ===
- This must look EXACTLY like a $50,000 agency ad
- Text must be PERFECTLY LEGIBLE - no blur, no artifacts
- Professional lighting and composition
- Premium, conversion-optimized aesthetic
- Mood: ${dna.mood || 'premium'}
- The ad must be immediately ready for Meta advertising

=== CRITICAL ===
All text elements MUST be rendered in the final image.
This is a COMPLETE ad - headline, product, CTA all visible and polished.
`;

  console.log('[VisualDNA] Built DNA prompt:', prompt.length, 'chars');
  return prompt;
}

/**
 * Default DNA pattern when extraction fails
 */
export function getDefaultDNA() {
  return {
    layout: {
      type: 'hero_centered',
      headlinePosition: { x: 50, y: 8, alignment: 'center' },
      sublinePosition: { x: 50, y: 14, alignment: 'center' },
      productPosition: { x: 50, y: 45, scale: 50 },
      ctaPosition: { x: 50, y: 92 }
    },
    typography: {
      headline: { size: 72, weight: 900, style: 'sans-serif-bold', case: 'titlecase', hasTextShadow: true, shadowIntensity: 'medium' },
      subline: { size: 24, weight: 400 },
      cta: { size: 18, weight: 600 }
    },
    colors: {
      background: { type: 'gradient', primary: '#0A0A1A', secondary: '#1A1A3A', gradientDirection: 'radial' },
      text: { primary: '#FFFFFF', secondary: 'rgba(255,255,255,0.8)' },
      accent: '#FF4757',
      cta: { background: '#FF4757', text: '#FFFFFF' }
    },
    elements: {
      hasFeatureCallouts: false,
      callouts: [],
      hasConnectorLines: false,
      hasBadge: false,
      hasArrows: false,
      hasStats: false
    },
    effects: {
      hasProductGlow: true,
      glowColor: '#FF4757',
      glowIntensity: 'subtle',
      hasBokeh: false,
      hasParticles: false,
      hasVignette: true,
      shadowStyle: 'soft',
      hasReflection: false
    },
    mood: 'premium',
    confidence: 0.5
  };
}

export default {
  extractVisualDNA,
  extractPatternDNA,
  buildDNAPrompt,
  getDefaultDNA
};
