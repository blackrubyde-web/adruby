/**
 * AI Ad Builder - Enhanced Prompt Builder
 * Advanced prompt engineering with few-shot examples and constraints
 */

import { getTemplate } from './aiAdTemplates.js';

/**
 * Few-shot examples for better ad generation
 */
const FEW_SHOT_EXAMPLES = {
    de: [
        {
            input: 'Premium Hautcreme für Frauen 30+, Bio-Hyaluronsäure',
            output: {
                headline: '7 Jahre jünger aussehen – wissenschaftlich bewiesen',
                slogan: 'Natur trifft Innovation',
                description: 'Unsere Bio-Hyaluronsäure-Formel reduziert Falten um bis zu 43% in nur 4 Wochen. Dermatologisch getestet, vegan, made in Germany.',
                cta: 'Jetzt 30% Rabatt sichern',
                imagePrompt: 'Professional beauty product photography, premium skincare cream jar on marble surface, soft natural lighting, botanical elements, elegant minimalist aesthetic, high-end cosmetics advertisement'
            }
        },
        {
            input: 'Online Yoga-Kurse, Anfänger-freundlich, Live-Sessions',
            output: {
                headline: 'Finde deine innere Ruhe – in nur 10 Minuten täglich',
                slogan: 'Yoga für echte Menschen',
                description: 'Keine Vorkenntnisse nötig! Live-Kurse mit zertifizierten Lehrern. Flexibel von zuhause aus. Über 500 begeisterte Teilnehmer.',
                cta: 'Erste Woche gratis testen',
                imagePrompt: 'Peaceful yoga scene, woman in comfortable home setting doing simple yoga pose, soft morning light through window, calm atmosphere, welcoming and accessible yoga practice, authentic lifestyle photography'
            }
        }
    ],
    en: [
        {
            input: 'Electric bike for urban commuters, eco-friendly',
            output: {
                headline: 'Skip traffic, save money, protect the planet',
                slogan: 'Commute smarter',
                description: 'Our e-bike gets you to work 3x faster than public transport. 80km range, 5h charge. Join 10,000+ happy riders.',
                cta: 'Get $200 off today',
                imagePrompt: 'Modern electric bike in urban environment, professional product photography, sleek design, city background, sustainable transportation, lifestyle shot with business professional'
            }
        }
    ]
};

/**
 * Build enhanced prompt with few-shot examples
 */
export function buildPromptFromForm(formData) {
    const {
        industry,
        targetAudience,
        productName,
        usp,
        tone,
        goal,
        template: templateId,
        language = 'de',
    } = formData;

    const template = getTemplate(templateId);
    const lang = language === 'de' ? 'Deutsch' : 'English';
    const examples = FEW_SHOT_EXAMPLES[language] || FEW_SHOT_EXAMPLES.de;

    return {
        system: buildEnhancedSystemPrompt(template, language, examples),
        user: `Erstelle eine Werbeanzeige mit folgenden Informationen:

**Branche**: ${industry || 'Allgemein'}
**Zielgruppe**: ${targetAudience || 'Allgemeine Zielgruppe'}
**Produkt/Service**: ${productName || 'Produkt'}
**Alleinstellungsmerkmal**: ${usp || 'Hochwertig und zuverlässig'}
**Tonalität**: ${tone || template.style.tone}
**Werbeziel**: ${goal || 'Aufmerksamkeit und Interesse wecken'}

Analysiere die Informationen Schritt für Schritt:
1. Was ist das Hauptproblem der Zielgruppe?
2. Wie löst das Produkt dieses Problem?
3. Was ist der stärkste emotionale Trigger?
4. Welcher CTA erzeugt die höchste Conversion?

Erstelle dann die Werbeanzeige im JSON-Format.`,
        template,
    };
}

/**
 * Build enhanced prompt for free text with chain-of-thought
 */
export function buildPromptFromFreeText(freeText, templateId = 'product_launch', language = 'de') {
    const template = getTemplate(templateId);
    const lang = language === 'de' ? 'Deutsch' : 'English';
    const examples = FEW_SHOT_EXAMPLES[language] || FEW_SHOT_EXAMPLES.de;

    return {
        system: buildEnhancedSystemPrompt(template, language, examples),
        user: `Erstelle eine Werbeanzeige basierend auf dieser Beschreibung:

${freeText}

Analysiere die Beschreibung Schritt für Schritt:
1. Identifiziere Produkt/Service und Zielgruppe
2. Extrahiere die wichtigsten Alleinstellungsmerkmale
3. Bestimme den besten emotionalen Ansatz
4. Wähle die passendste Tonalität

Erstelle dann die Werbeanzeige im JSON-Format.`,
        template,
    };
}

/**
 * Enhanced system prompt with few-shot examples and constraints
 */
function buildEnhancedSystemPrompt(template, language, examples) {
    const lang = language === 'de' ? 'Deutsch' : 'English';

    const exampleText = examples.map((ex, i) =>
        `Beispiel ${i + 1}:
Input: "${ex.input}"
Output: ${JSON.stringify(ex.output, null, 2)}`
    ).join('\n\n');

    return `Du bist David Ogilvy reinkarniert – ein Meister der Werbetexte auf absolutem Agentur-Niveau.
Deine Ads konvertieren 3x besser als der Durchschnitt, weil du die Psychologie deiner Zielgruppe verstehst.

**Copywriting-Framework**: ${template.copywritingFramework}
${getFrameworkGuidelines(template.copywritingFramework)}

**Stil-Vorgaben**:
- Tonalität: ${template.style.tone}
- Fokus: ${template.style.focus}
- Vermeide: Klischees, Superlative ohne Beweis, passive Sprache

**KRITISCHE REGELN**:
1. Headline: 10-60 Zeichen, kraftvoll, benefit-fokussiert
2. Slogan: Max 40 Zeichen, memorabel, emotional
3. Description: 50-200 Zeichen, konkret, mit sozialen Beweisen oder Zahlen
4. CTA: Max 30 Zeichen, aktives Verb, Dringlichkeit
5. Image Prompt: Detailliert, professionell, auf Englisch, KEIN Text im Bild

**BEISPIELE VON EXZELLENTEN ADS**:
${exampleText}

**Visuelle Vorgaben für DALL-E**:
${template.visualGuidelines}

**Output-Format** (NUR JSON, KEIN zusätzlicher Text):
{
  "headline": "Nutzen-fokussierte Überschrift (10-60 Zeichen)",
  "slogan": "Emotionaler, einprägsamer Slogan (max 40 Zeichen)",
  "description": "Konkrete Beschreibung mit Zahlen/Beweisen (50-200 Zeichen)",
  "imagePrompt": "Sehr detaillierte englische DALL-E Beschreibung (professional, no text in image)",
  "cta": "${typeof template.style.cta === 'object' ? template.style.cta[language] : template.style.cta}"
}

**Sprachen**:
- Texte (headline, slogan, description, cta): ${lang}
- imagePrompt: Immer Englisch`;
}

/**
 * Framework guidelines with advanced tactics
 */
function getFrameworkGuidelines(framework) {
    const guidelines = {
        AIDA: `- Attention: Hook mit Frage, Statistik oder überraschendem Fakt
- Interest: Konkrete Benefits, nicht Features
- Desire: Social Proof (Zahlen, Testimonials)
- Action: Dringlichkeit + klare Anweisung`,

        PAS: `- Problem: Schmerzpunkt emotional und konkret beschreiben
- Agitation: Kosten des Nicht-Handelns aufzeigen
- Solution: Produkt als einfache, bewiesene Lösung präsentieren`,

        Story: `- Hero's Journey: Vorher-Nachher-Transformation
- Authentizität: Echte Details, nicht generisch
- Emotional Peak: Moment der Veränderung hervorheben`,

        'Feature-Benefit': `- Feature → Benefit Translation: "5000mAh" → "2 Tage ohne Laden"
- Quantifiziere Vorteile: "Spart 3 Stunden pro Woche"
- ROI-Focus: "Investment rentiert sich in 2 Monaten"`,
    };

    return guidelines[framework] || guidelines.AIDA;
}

/**
 * Enhanced image prompt with professional photography direction
 */
export function enhanceImagePrompt(basePrompt, template) {
    const photographyStyle = {
        product_launch: 'professional product photography, studio lighting, commercial advertising style',
        limited_offer: 'dynamic composition, vibrant colors, energetic marketing aesthetic',
        testimonial: 'authentic lifestyle photography, natural lighting, relatable scene',
        before_after: 'split composition, clear contrast, transformation focused',
        seasonal: 'seasonal atmosphere, festive elements, warm color palette',
        b2b_solution: 'corporate professional aesthetic, modern office environment, clean minimalist',
        lifestyle: 'aspirational lifestyle scene, beautiful natural setting, magazine quality',
    };

    const style = photographyStyle[template.id] || photographyStyle.product_launch;

    return `Professional advertising image: ${basePrompt}. ${style}. ${template.visualGuidelines}. High quality, 4K resolution, commercial grade. No text, no watermarks, no logos in image. Photorealistic, suitable for Meta Ads.`;
}
