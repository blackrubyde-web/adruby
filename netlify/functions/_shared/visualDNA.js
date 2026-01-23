/**
 * Visual DNA Extraction System v5.0
 * Uses GPT-4V to extract pixel-precise layouts from top Foreplay ads
 * Direct Netlify integration (Railway-independent)
 */

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Extract visual DNA from a reference ad image
 * @param {string} imageUrl - URL of the reference ad
 * @returns {Promise<Object>} - Extracted visual DNA
 */
export async function extractVisualDNA(imageUrl) {
    console.log('[VisualDNA] 🧬 Extracting visual DNA from reference ad...');

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: `Du bist ein Elite-Werbedesign-Analyst mit Pixel-Präzision.
Analysiere diese Meta-Werbeanzeige und extrahiere die EXAKTE visuelle DNA.

Gib ein JSON-Objekt mit dieser Struktur zurück:
{
  "layout": {
    "type": "hero_left|hero_right|centered|split|diagonal",
    "productPosition": {"x": "0-100%", "y": "0-100%", "width": "0-100%", "height": "0-100%"},
    "headlinePosition": {"x": "0-100%", "y": "0-100%", "alignment": "left|center|right"},
    "ctaPosition": {"x": "0-100%", "y": "0-100%"}
  },
  "typography": {
    "headlineStyle": "bold|light|condensed|wide",
    "headlineSize": "small|medium|large|xl",
    "headlineWeight": "400-900",
    "textColor": "#XXXXXX",
    "shadowStyle": "none|soft|hard|glow"
  },
  "colors": {
    "primary": "#XXXXXX",
    "secondary": "#XXXXXX",
    "accent": "#XXXXXX",
    "background": "gradient|solid|image",
    "backgroundColors": ["#XXXXXX", "#XXXXXX"]
  },
  "effects": {
    "productGlow": true/false,
    "productShadow": "none|soft|dramatic",
    "backgroundBlur": true/false,
    "particles": "none|subtle|prominent",
    "gradientOverlay": true/false
  },
  "cta": {
    "shape": "pill|rounded|square",
    "gradient": true/false,
    "colors": ["#XXXXXX", "#XXXXXX"],
    "shadow": true/false,
    "size": "small|medium|large"
  },
  "overallStyle": "minimal|bold|luxury|techy|playful",
  "qualityScore": 1-10
}

WICHTIG: Sei extrem präzise mit Positionen und Farben. Dies wird verwendet um pixelgenaue Ads zu erstellen.`
            },
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Analysiere diese top-performende Werbeanzeige und extrahiere die komplette visuelle DNA als JSON.' },
                    { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } }
                ]
            }
        ],
        max_tokens: 1500,
        response_format: { type: 'json_object' }
    });

    const dna = JSON.parse(response.choices[0].message.content);
    console.log('[VisualDNA] ✅ DNA extracted:', dna.overallStyle, 'score:', dna.qualityScore);
    return dna;
}

/**
 * Build a pixel-precise prompt from extracted DNA
 * @param {Object} dna - Visual DNA object
 * @param {Object} product - Product info (name, description, features)
 * @param {Object} text - Ad text (headline, subheadline, cta)
 * @returns {string} - Detailed prompt for image generation
 */
export function buildDNAPrompt(dna, product, text) {
    const prompt = `
=== META AD GENERATION - PIXEL-PRECISE KREATION ===

LAYOUT-SPEZIFIKATION:
- Layout-Typ: ${dna.layout?.type || 'centered'}
- Produkt-Position: X=${dna.layout?.productPosition?.x || '50%'}, Y=${dna.layout?.productPosition?.y || '50%'}
- Produkt-Größe: ${dna.layout?.productPosition?.width || '60%'} × ${dna.layout?.productPosition?.height || '60%'}
- Headline-Position: X=${dna.layout?.headlinePosition?.x || '50%'}, Y=${dna.layout?.headlinePosition?.y || '15%'}
- CTA-Position: X=${dna.layout?.ctaPosition?.x || '50%'}, Y=${dna.layout?.ctaPosition?.y || '85%'}

TYPOGRAFIE:
- Headline-Stil: ${dna.typography?.headlineStyle || 'bold'} ${dna.typography?.headlineWeight || '700'}
- Headline-Größe: ${dna.typography?.headlineSize || 'large'}
- Text-Farbe: ${dna.typography?.textColor || '#FFFFFF'}
- Schatten: ${dna.typography?.shadowStyle || 'soft'}

FARBPALETTE:
- Primär: ${dna.colors?.primary || '#1a1a2e'}
- Sekundär: ${dna.colors?.secondary || '#16213e'}
- Akzent: ${dna.colors?.accent || '#e94560'}
- Hintergrund: ${dna.colors?.background || 'gradient'}
${dna.colors?.backgroundColors ? `- Gradient: ${dna.colors.backgroundColors.join(' → ')}` : ''}

VISUELLE EFFEKTE:
- Produkt-Glow: ${dna.effects?.productGlow ? 'JA - subtiler Leuchteffekt um das Produkt' : 'NEIN'}
- Produkt-Schatten: ${dna.effects?.productShadow || 'soft'}
- Hintergrund-Unschärfe: ${dna.effects?.backgroundBlur ? 'JA' : 'NEIN'}
- Partikel-Effekte: ${dna.effects?.particles || 'subtle'}
- Gradient-Overlay: ${dna.effects?.gradientOverlay ? 'JA' : 'NEIN'}

CTA-BUTTON DESIGN:
- Form: ${dna.cta?.shape || 'pill'} (${dna.cta?.shape === 'pill' ? 'abgerundete Enden' : 'eckig'})
- Gradient: ${dna.cta?.gradient ? `JA - von ${dna.cta?.colors?.[0] || '#FF6B00'} zu ${dna.cta?.colors?.[1] || '#FF8C00'}` : 'NEIN'}
- Schatten: ${dna.cta?.shadow ? 'JA - weicher Glüheffekt' : 'NEIN'}
- Größe: ${dna.cta?.size || 'medium'}

=== PRODUKT-INFORMATIONEN ===
Produkt: ${product?.name || 'Premium Produkt'}
Beschreibung: ${product?.description || ''}

=== TEXT-INHALTE ===
HEADLINE: "${text?.headline || 'Jetzt entdecken'}"
SUBHEADLINE: "${text?.subheadline || ''}"
CTA-TEXT: "${text?.cta || 'Jetzt starten'}"

=== QUALITÄTS-ANFORDERUNGEN ===
Gesamtstil: ${dna.overallStyle || 'premium'}
Qualitätslevel: 10/10 - Absolut professionell, Meta-ready
- Perfekte Typografie mit klarem, lesbarem Text
- Professionelle Farbharmonie
- Dynamische, nicht statische Komposition
- Premium CTA-Button mit Gradient und Glow
- Produkt als visueller Hero mit perfekter Integration

KRITISCH: 
1. Der CTA-Button muss PREMIUM aussehen - Gradient, Glow-Effekt, perfekte Proportionen
2. Das Layout muss DYNAMISCH wirken - nicht flach oder statisch
3. Alle Texte müssen PERFEKT gerendert sein - klar, lesbar, professionell
4. Die Farben müssen HARMONISCH sein - basierend auf der extrahierten Palette
`;

    console.log('[VisualDNA] Built DNA prompt:', prompt.length, 'chars');
    return prompt;
}

/**
 * Find best matching Foreplay reference for a product
 * @param {string} productType - Type of product
 * @param {string} industry - Industry category
 * @returns {Promise<Object|null>} - Best matching reference or null
 */
export async function findBestReference(productType, industry) {
    // This would call Foreplay API - for now return default DNA
    console.log('[VisualDNA] Finding best reference for:', productType, industry);

    // Default premium DNA template based on top-performing ads analysis
    return {
        layout: {
            type: 'centered',
            productPosition: { x: '50%', y: '45%', width: '55%', height: '45%' },
            headlinePosition: { x: '50%', y: '12%', alignment: 'center' },
            ctaPosition: { x: '50%', y: '88%' }
        },
        typography: {
            headlineStyle: 'bold',
            headlineSize: 'xl',
            headlineWeight: '800',
            textColor: '#FFFFFF',
            shadowStyle: 'soft'
        },
        colors: {
            primary: '#0D0D1A',
            secondary: '#1A1A2E',
            accent: '#FF6B35',
            background: 'gradient',
            backgroundColors: ['#0D0D1A', '#1A1A2E', '#0D0D1A']
        },
        effects: {
            productGlow: true,
            productShadow: 'dramatic',
            backgroundBlur: false,
            particles: 'subtle',
            gradientOverlay: true
        },
        cta: {
            shape: 'pill',
            gradient: true,
            colors: ['#FF6B35', '#FF8C42'],
            shadow: true,
            size: 'large'
        },
        overallStyle: 'premium',
        qualityScore: 9
    };
}

export default {
    extractVisualDNA,
    buildDNAPrompt,
    findBestReference
};
