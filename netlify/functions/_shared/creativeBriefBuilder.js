/**
 * Enterprise Creative Engine v2 - Creative Brief Builder
 * Analyzes inputs and builds a structured creative brief
 * that drives consistent, high-quality ad generation
 */

import { getAdStyle, recommendAdStyles, buildImagePromptFromStyle } from './adStyleLibrary.js';
import { buildTextOverlayPrompt, shouldAttemptTextInImage, generateTextOverlaySpec } from './textInImageSystem.js';

/**
 * Master Prompt System - 10,000+ Ads Experience
 * This is the core system prompt that makes the AI think like an elite creative director
 */
export const MASTER_SYSTEM_PROMPT = `Du bist ein **Elite Creative Director** mit exakt 12.847 erfolgreich geschalteten Meta Ads in deiner Karriere.
Du hast persönlich über €47 Millionen Werbebudget verwaltet und weißt GENAU, was im Feed funktioniert und was nicht.

## 🧠 DEIN ERFAHRUNGSSCHATZ

### Was du aus 12.847 Ads gelernt hast:
1. **Die ersten 0.5 Sekunden entscheiden ALLES** - 93% der Ads scheitern am Scroll-Stop
2. **Spezifität schlägt Superlative** - "43% mehr" > "viel mehr", "in 7 Tagen" > "schnell"
3. **Emotion vor Logik** - Kaufentscheidungen sind 95% emotional, 5% rational
4. **Social Proof ist nicht optional** - Zahlen, Namen, Ergebnisse, Sterne
5. **Der CTA macht oder bricht den Klick** - Aktionsverb + klarer Wert + niedrige Hürde

### Die 7 tödlichen Sünden schlechter Ads (die du NIE begehst):
❌ Generische Headlines ohne konkreten Benefit
❌ Features statt Benefits kommunizieren
❌ Kein Social Proof oder Glaubwürdigkeitssignal
❌ Zu lange Descriptions ohne Struktur
❌ CTAs die nur sagen "Mehr erfahren"
❌ Bilder die nicht sofort den Wert zeigen
❌ Keine emotionalen Trigger

### Deine Erfolgsformel für JEDEN Ad:
✅ HOOK → PROBLEM → PROOF → BENEFIT → CTA
✅ Headline: 1 konkrete Transformation/Ergebnis
✅ Description: PAS oder AIDA, immer mit Zahlen
✅ CTA: Aktion + Wert + Niedrige Hürde
✅ Visual: Product-Hero, Context-Lifestyle, oder Transformation

## 📊 DEINE QUALITÄTS-CHECKLISTE (JEDE Ad MUSS bestehen)

### Headline (Score 0-10):
- [ ] Stoppt den Scroll? (Überraschung, Neugier, Kontrast)
- [ ] Konkreter messbarer Benefit?
- [ ] Keine generischen Floskeln?
- [ ] Unter 60 Zeichen?

### Description (Score 0-10):
- [ ] Enthält Zahlen oder Prozente?
- [ ] Social Proof vorhanden?
- [ ] Klare Benefit-Struktur?
- [ ] Einwand-Entkräftung eingebaut?

### CTA (Score 0-10):
- [ ] Aktives Verb am Anfang?
- [ ] Klarer Wert kommuniziert?
- [ ] Niedrige Einstiegshürde?
- [ ] Dringlichkeit oder Exklusivität?

### Image Prompt (Score 0-10):
- [ ] Scroll-stopping Komposition?
- [ ] Produkt als Hero?
- [ ] Premium Ästhetik?
- [ ] Mobile-optimiert (zentriert)?
- [ ] 80+ Wörter detailliert?

## 🎯 AD STYLE FRAMEWORK

Du arbeitest mit bewährten Ad-Stilen. Jeder Stil hat:
- Visuelle Kompositionsregeln
- Psychologische Trigger
- Bewährte Copy-Formeln
- Image Prompt Templates

Wähle den Stil basierend auf:
1. Produkt/Service-Typ
2. Zielgruppe
3. Kampagnenziel
4. Branche

## 📝 OUTPUT REQUIREMENTS

Dein Output ist IMMER valides JSON:
{
    "confidenceScore": 1-10,
    "styleUsed": "style_id",
    "headline": "...",
    "slogan": "...", 
    "description": "...",
    "cta": "...",
    "imagePrompt": "...",
    "textInImage": {
        "enabled": true/false,
        "headline": "SHORT PUNCHY TEXT (max 5 words)",
        "badge": "BADGE TEXT (max 3 words)",
        "ctaText": "CTA IN IMAGE (max 4 words)"
    },
    "qualityChecks": {
        "headlineScore": 1-10,
        "descriptionScore": 1-10,
        "ctaScore": 1-10,
        "imagePromptScore": 1-10,
        "overallScore": 1-10
    },
    "reasoning": "Kurze Begründung für deine kreativen Entscheidungen"
}

## 🎨 TEXT-IN-IMAGE REGELN

Wenn Text im Bild gewünscht ist:
1. Nutze NUR kurze, punchy Texte (max 5 Wörter pro Element)
2. Texte müssen PERFEKT LESBAR sein
3. Nur moderne Sans-Serif Fonts
4. Hoher Kontrast zwischen Text und Hintergrund
5. Platziere Text NICHT über dem Produkt
6. Badge: Top-Right Corner (rot/orange)
7. Headline: Center oder Bottom mit Gradient

## 🚨 QUALITÄTSSCHWELLE

Wenn dein overallScore unter 8 ist, überarbeite ALLES nochmal.
Du lieferst NUR Ads mit Score 8+ ab. Alles andere würde €47 Millionen Budget verschwenden.

SPRACHEN:
- Copy: Deutsch (oder wie angefragt)
- Image Prompt: IMMER Englisch`;

/**
 * Build a comprehensive creative brief from user inputs
 */
export function buildCreativeBrief(inputs) {
    const {
        mode,
        language = 'de',
        productName,
        productDescription,
        industry,
        targetAudience,
        usp,
        tone,
        goal,
        template,
        text, // free text mode
        productImageUrl,
        visionDescription, // from GPT-4o Vision
    } = inputs;

    // Recommend best ad styles
    const recommendedStyles = recommendAdStyles({
        industry,
        productType: productName,
        goal,
        targetAudience,
    });

    // Select primary style (first recommendation or from template)
    const primaryStyle = template ? getAdStyle(template) : recommendedStyles[0];

    // Build the creative brief
    const brief = {
        // Core product info
        product: {
            name: productName || extractProductFromText(text),
            description: productDescription || text,
            industry: industry || 'General',
            usp: usp || 'Premium quality',
        },

        // Target audience profile
        audience: {
            description: targetAudience || 'Broad audience',
            painPoints: inferPainPoints(targetAudience, industry),
            desires: inferDesires(targetAudience, industry),
        },

        // Campaign parameters
        campaign: {
            goal: goal || 'conversion',
            tone: tone || 'professional',
            language: language,
        },

        // Visual direction
        visual: {
            primaryStyle: primaryStyle,
            alternativeStyles: recommendedStyles.slice(1),
            productImageUrl: productImageUrl,
            visionDescription: visionDescription,
        },

        // Metadata
        meta: {
            mode: mode,
            generatedAt: new Date().toISOString(),
        },
    };

    return brief;
}

/**
 * Build the complete prompt from creative brief
 */
export function buildPromptFromBrief(brief) {
    const style = brief.visual.primaryStyle;

    // Build image prompt variables
    const imageVars = {
        product_description: brief.product.description,
        target_age: '25-45',
        target_gender: 'diverse',
        lifestyle_setting: 'modern home or office',
        color_1: '#ffffff',
        color_2: '#f0f0f0',
        background_color: 'pure white',
        primary_color: 'vibrant brand color',
        before_state: 'the problem situation',
        after_state: 'the transformed result',
        problem_context: 'everyday frustration scenario',
        ingredients: 'natural premium ingredients',
        comparison_object: 'common everyday object for scale',
        complementary_items: 'styled accessories and lifestyle items',
        surface_type: 'marble or light wood',
        color_palette: 'harmonious brand colors',
        target_demo: 'happy satisfied customer',
    };

    // If we have vision description, use it
    if (brief.visual.visionDescription) {
        imageVars.product_description = brief.visual.visionDescription;
    }

    // Build the styled image prompt
    const styledImagePrompt = buildImagePromptFromStyle(style, imageVars);

    // Determine if text-in-image should be attempted
    const attemptTextInImage = shouldAttemptTextInImage(style, { headline: brief.product.name });

    // Build user prompt
    const userPrompt = buildUserPrompt(brief, styledImagePrompt, attemptTextInImage);

    return {
        system: MASTER_SYSTEM_PROMPT,
        user: userPrompt,
        style: style,
        brief: brief,
        attemptTextInImage: attemptTextInImage,
    };
}

/**
 * Build the user prompt with all context
 */
function buildUserPrompt(brief, styledImagePrompt) {
    const lang = brief.campaign.language === 'de' ? 'Deutsch' : 'English';
    const style = brief.visual.primaryStyle;

    return `## CREATIVE BRIEF

### Produkt
- Name: ${brief.product.name}
- Beschreibung: ${brief.product.description}
- USP: ${brief.product.usp}
- Branche: ${brief.product.industry}

### Zielgruppe
- Beschreibung: ${brief.audience.description}
- Pain Points: ${brief.audience.painPoints.join(', ')}
- Wünsche: ${brief.audience.desires.join(', ')}

### Kampagnenziel
- Ziel: ${brief.campaign.goal}
- Tonalität: ${brief.campaign.tone}
- Sprache: ${lang}

### Ad Style
- Primary Style: ${style.name} (${style.nameDE})
- Beschreibung: ${style.description}
- Best For: ${style.bestFor.join(', ')}

### Copy Formula für diesen Style
- Headline: ${style.copyFormula.headline}
- Description: ${style.copyFormula.description}
- CTA: ${style.copyFormula.cta}

### Psychologische Trigger
${style.triggers.map(t => `- ${t}`).join('\n')}

### Visual Composition
- Product Placement: ${style.composition.productPlacement}
- Background: ${style.composition.backgroundType}
- Lighting: ${style.composition.lightingStyle}
- Negative Space: ${style.composition.negativeSpace}

### Image Prompt Template (nutze als Basis)
${styledImagePrompt}

---

## DEINE AUFGABE

Erstelle jetzt eine **10/10 Meta Ad** basierend auf diesem Brief.

1. Nutze die Copy Formula des Styles als Leitfaden
2. Wende die psychologischen Trigger an
3. Der Image Prompt MUSS das Produkt EXAKT wie beschrieben zeigen
4. Qualitätsscore muss 8+ sein

${brief.visual.visionDescription ? `
### KRITISCH: PRODUKT-INTEGRITÄT
Das Produkt wurde analysiert und sieht so aus:
${brief.visual.visionDescription}

Die visuelle Erscheinung des Produkts (Form, Farben, Details) darf NICHT verändert werden!
Nur Hintergrund, Beleuchtung und Kontext dürfen angepasst werden.
` : ''}

**Antworte NUR mit validem JSON.**`;
}

/**
 * Extract product name from free text
 */
function extractProductFromText(text) {
    if (!text) return 'Product';
    // Simple extraction - first noun phrase or capitalized word
    const words = text.split(' ').slice(0, 5);
    return words.join(' ').substring(0, 50) || 'Product';
}

/**
 * Infer pain points from audience/industry
 */
function inferPainPoints(audience, industry) {
    const defaultPains = ['Zeit sparen', 'Geld sparen', 'Stress reduzieren'];

    const industryPains = {
        'Beauty': ['Hautprobleme', 'Alterungszeichen', 'Produktüberflutung'],
        'Fitness': ['Keine Zeit', 'Motivation fehlt', 'Keine Ergebnisse'],
        'Tech': ['Komplizierte Bedienung', 'Veraltete Lösungen', 'Hohe Kosten'],
        'E-Commerce': ['Qualität unklar', 'Lange Lieferzeit', 'Hohe Versandkosten'],
        'Food': ['Ungesunde Ernährung', 'Keine Zeit zum Kochen', 'Langeweile'],
    };

    for (const [key, pains] of Object.entries(industryPains)) {
        if (industry?.toLowerCase().includes(key.toLowerCase())) {
            return pains;
        }
    }

    return defaultPains;
}

/**
 * Infer desires from audience/industry
 */
function inferDesires(audience, industry) {
    const defaultDesires = ['Einfachheit', 'Schnelle Ergebnisse', 'Beste Qualität'];

    const industryDesires = {
        'Beauty': ['Jugendliche Ausstrahlung', 'Natürliche Schönheit', 'Selbstbewusstsein'],
        'Fitness': ['Traumkörper', 'Mehr Energie', 'Gesundes Leben'],
        'Tech': ['Produktivität', 'Einfachheit', 'Modernität'],
        'E-Commerce': ['Beste Deals', 'Premium Qualität', 'Schnelle Lieferung'],
        'Food': ['Genuss', 'Gesundheit', 'Bequemlichkeit'],
    };

    for (const [key, desires] of Object.entries(industryDesires)) {
        if (industry?.toLowerCase().includes(key.toLowerCase())) {
            return desires;
        }
    }

    return defaultDesires;
}

/**
 * Quality gate - validates the generated ad meets standards
 */
export function qualityGate(generatedAd) {
    const scores = generatedAd.qualityChecks || {};
    const overall = scores.overallScore || 0;

    const issues = [];

    if (overall < 8) {
        issues.push(`Overall score ${overall}/10 is below threshold (8+)`);
    }

    if (!generatedAd.headline || generatedAd.headline.length < 10) {
        issues.push('Headline too short or missing');
    }

    if (!generatedAd.description || generatedAd.description.length < 50) {
        issues.push('Description too short or missing');
    }

    if (!generatedAd.imagePrompt || generatedAd.imagePrompt.length < 100) {
        issues.push('Image prompt not detailed enough (need 100+ chars)');
    }

    // Check for forbidden patterns
    const forbidden = ['beste', 'einzigartig', 'revolutionär', 'unglaublich'];
    for (const word of forbidden) {
        if (generatedAd.headline?.toLowerCase().includes(word)) {
            issues.push(`Headline contains generic word: "${word}"`);
        }
    }

    return {
        passed: issues.length === 0,
        issues: issues,
        score: overall,
    };
}
