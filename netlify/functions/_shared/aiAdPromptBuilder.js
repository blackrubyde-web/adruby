/**
 * AI Ad Builder - Premium Prompt Builder
 * Enterprise-grade prompt engineering with extensive few-shot examples,
 * advanced Chain-of-Thought, and industry-specific optimization
 */

import { getTemplate } from './aiAdTemplates.js';

/**
 * Premium few-shot examples by industry and language
 * These are agency-level examples that set the quality bar
 */
const PREMIUM_EXAMPLES = {
    de: [
        {
            industry: 'Beauty/Kosmetik',
            input: 'Premium Hautcreme für Frauen 30+, Bio-Hyaluronsäure, made in Germany',
            output: {
                headline: '7 Jahre jünger – wissenschaftlich bestätigt',
                slogan: 'Natur trifft Innovation',
                description: 'Bio-Hyaluronsäure reduziert Falten um 43% in 4 Wochen. Dermatologisch getestet, vegan, made in Germany. Über 12.000 begeisterte Kundinnen.',
                cta: 'Jetzt 30% sparen',
                imagePrompt: 'Luxury skincare product photography: elegant cream jar on white marble surface, soft golden hour lighting from left, fresh botanical elements (rose petals, green leaves) scattered artistically, shallow depth of field, premium cosmetics advertisement, clean minimalist aesthetic, no text or logos, photorealistic, 4K quality'
            }
        },
        {
            industry: 'Fitness/Wellness',
            input: 'Online Yoga-Kurse, Anfänger-freundlich, Live-Sessions mit Trainer',
            output: {
                headline: 'Innere Ruhe finden – 10 Min. täglich genügen',
                slogan: 'Yoga, das zu dir passt',
                description: 'Live-Kurse mit zertifizierten Lehrern. Keine Vorkenntnisse nötig. Flexibel von zuhause. 500+ 5-Sterne-Bewertungen.',
                cta: '7 Tage gratis testen',
                imagePrompt: 'Serene home yoga scene: young woman in comfortable athleisure doing gentle yoga pose on premium mat, soft morning sunlight streaming through large windows, minimalist Scandinavian living room, peaceful calm atmosphere, authentic lifestyle photography, warm natural tones, no text, professional quality'
            }
        },
        {
            industry: 'E-Commerce/Retail',
            input: 'Nachhaltiger Online-Shop für Haushaltsprodukte, plastikfrei, schneller Versand',
            output: {
                headline: 'Plastikfrei leben leicht gemacht',
                slogan: 'Gut für dich. Gut für die Erde.',
                description: 'Über 1.000 nachhaltige Produkte. CO2-neutraler Versand in 24h. Bereits 50.000+ Haushalte umgestellt.',
                cta: 'Shop jetzt entdecken',
                imagePrompt: 'Sustainable household products flat lay: bamboo toothbrushes, glass containers, natural sponges, cotton bags arranged aesthetically on light wood surface, fresh green plant elements, soft diffused natural lighting, eco-friendly lifestyle, clean modern aesthetic, no logos or text, editorial quality photography'
            }
        },
        {
            industry: 'B2B/Software',
            input: 'CRM-Software für kleine Unternehmen, einfache Bedienung, bezahlbar',
            output: {
                headline: '3x mehr Umsatz durch bessere Kundenbeziehungen',
                slogan: 'CRM, das mitdenkt',
                description: 'In 5 Minuten startklar. Keine IT-Kenntnisse nötig. Spart 10h/Woche. Ab 29€/Monat. 14 Tage gratis testen.',
                cta: 'Kostenlos starten',
                imagePrompt: 'Modern business professional using laptop in bright contemporary office, clean dashboard interface visible on screen (blurred), confident satisfied expression, minimalist workspace with plants, natural daylight, corporate yet approachable aesthetic, authentic business photography, no text overlays'
            }
        },
        {
            industry: 'Food/Gastronomie',
            input: 'Premium Kaffee-Abo, frisch geröstet, direkt vom Bauern',
            output: {
                headline: 'Der beste Kaffee deines Lebens – jeden Monat',
                slogan: 'Vom Bauern in deine Tasse',
                description: 'Handverlesen, fair gehandelt, in 48h nach Röstung bei dir. 95% unserer Kunden bleiben. Erste Lieferung -50%.',
                cta: 'Jetzt Abo starten',
                imagePrompt: 'Artisan coffee beans in burlap sack with fresh roasted beans spilling onto rustic wood surface, steam rising from ceramic cup nearby, warm moody lighting, craft coffee aesthetic, rich brown and cream tones, professional food photography, shallow depth of field, no text or logos'
            }
        }
    ],
    en: [
        {
            industry: 'Technology',
            input: 'Electric bike for urban commuters, 80km range, eco-friendly',
            output: {
                headline: 'Skip traffic. Save $3,000/year. Save the planet.',
                slogan: 'Commute smarter',
                description: 'Get to work 3x faster. 80km range, 5h charge. Join 10,000+ happy riders. Free test ride in your city.',
                cta: 'Book free test ride',
                imagePrompt: 'Sleek modern electric bike on urban city street, young professional rider approaching, golden hour lighting, contemporary architecture background, sustainable transportation lifestyle, dynamic composition, commercial advertising quality, clean modern aesthetic, no text or logos'
            }
        },
        {
            industry: 'SaaS',
            input: 'Project management tool for remote teams, easy collaboration',
            output: {
                headline: 'Your team, perfectly synced – from anywhere',
                slogan: 'Work together. Apart.',
                description: 'Used by 5,000+ teams at Google, Spotify, Shopify. Set up in 5 mins. 30% faster project delivery. Free forever for small teams.',
                cta: 'Start free – no card needed',
                imagePrompt: 'Diverse remote team on video call grid, happy engaged expressions, modern home offices visible in backgrounds, collaborative work atmosphere, bright natural lighting in each frame, professional yet authentic, contemporary remote work aesthetic, no visible logos or text'
            }
        },
        {
            industry: 'Health/Fitness',
            input: 'Personalized meal planning app with grocery lists',
            output: {
                headline: 'Eat better without the guesswork',
                slogan: 'Your personal nutrition coach',
                description: 'AI-powered meal plans tailored to your goals. Auto-generated grocery lists. 89% of users reach their goals. First month free.',
                cta: 'Get your free plan',
                imagePrompt: 'Beautiful healthy meal prep scene: colorful fresh ingredients in glass containers on marble countertop, smartphone showing meal planning app (screen blurred), kitchen setting with natural light, clean organized aesthetic, food photography quality, vibrant colors, no text overlays'
            }
        }
    ]
};

/**
 * Psychological triggers and power words by language
 */
const POWER_WORDS = {
    de: {
        urgency: ['jetzt', 'heute', 'sofort', 'nur noch', 'letzte Chance', 'bald ausverkauft'],
        exclusivity: ['exklusiv', 'limitiert', 'nur für dich', 'Insider', 'VIP', 'Premium'],
        trust: ['garantiert', 'bewiesen', 'getestet', 'zertifiziert', 'wissenschaftlich', 'sicher'],
        benefit: ['sparen', 'kostenlos', 'gratis', 'Bonus', 'Rabatt', 'Geschenk'],
        emotion: ['Traum', 'Geheimnis', 'endlich', 'Durchbruch', 'revolutionär', 'einzigartig']
    },
    en: {
        urgency: ['now', 'today', 'limited', 'last chance', 'ending soon', 'don\'t miss'],
        exclusivity: ['exclusive', 'limited', 'just for you', 'insider', 'VIP', 'premium'],
        trust: ['guaranteed', 'proven', 'tested', 'certified', 'scientifically', 'secure'],
        benefit: ['save', 'free', 'bonus', 'discount', 'gift', 'unlock'],
        emotion: ['dream', 'secret', 'finally', 'breakthrough', 'revolutionary', 'unique']
    }
};

/**
 * Build premium prompt with extensive few-shot examples
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
    const examples = selectRelevantExamples(industry, language);

    return {
        system: buildPremiumSystemPrompt(template, language, examples),
        user: buildStructuredUserPrompt({
            industry,
            targetAudience,
            productName,
            usp,
            tone,
            goal,
            template,
            language
        }),
        template,
    };
}

/**
 * Build premium prompt for free text
 */
export function buildPromptFromFreeText(freeText, templateId = 'product_launch', language = 'de') {
    const template = getTemplate(templateId);
    const examples = PREMIUM_EXAMPLES[language] || PREMIUM_EXAMPLES.de;

    const lang = language === 'de' ? 'Deutsch' : 'English';

    return {
        system: buildPremiumSystemPrompt(template, language, examples.slice(0, 3)),
        user: language === 'de'
            ? `Analysiere diese Produktbeschreibung und erstelle eine hochkonvertierende Werbeanzeige:

"${freeText}"

**Deine Analyse (denke Schritt für Schritt):**
1. Welches Produkt/Service wird beworben?
2. Wer ist die primäre Zielgruppe (Alter, Geschlecht, Interessen, Probleme)?
3. Was ist das stärkste Alleinstellungsmerkmal (USP)?
4. Welcher emotionale Trigger wird am besten funktionieren?
5. Welches Copywriting-Framework passt am besten (AIDA, PAS, Story)?

**Dann erstelle die Werbeanzeige als perfektes JSON.**`
            : `Analyze this product description and create a high-converting ad:

"${freeText}"

**Your Analysis (think step by step):**
1. What product/service is being advertised?
2. Who is the primary target audience (age, gender, interests, pain points)?
3. What is the strongest unique selling proposition (USP)?
4. Which emotional trigger will work best?
5. Which copywriting framework fits best (AIDA, PAS, Story)?

**Then create the advertisement as perfect JSON.**`,
        template,
    };
}

/**
 * Select most relevant examples based on industry
 */
function selectRelevantExamples(industry, language) {
    const examples = PREMIUM_EXAMPLES[language] || PREMIUM_EXAMPLES.de;

    if (!industry) return examples.slice(0, 3);

    const industryLower = industry.toLowerCase();

    // Find matching industry examples first
    const matched = examples.filter(ex =>
        ex.industry.toLowerCase().includes(industryLower) ||
        industryLower.includes(ex.industry.toLowerCase().split('/')[0])
    );

    if (matched.length >= 2) return matched.slice(0, 3);

    // Mix matched with general examples
    const others = examples.filter(ex => !matched.includes(ex));
    return [...matched, ...others].slice(0, 3);
}

/**
 * Build structured user prompt with Chain-of-Thought
 */
function buildStructuredUserPrompt({ industry, targetAudience, productName, usp, tone, goal, template, language }) {
    const lang = language === 'de' ? 'Deutsch' : 'English';

    if (language === 'de') {
        return `Erstelle eine agenturreife Werbeanzeige für:

**BRIEFING:**
- Branche: ${industry || 'Allgemein'}
- Produkt/Service: ${productName || 'Produkt'}
- Zielgruppe: ${targetAudience || 'Breite Zielgruppe'}
- Alleinstellungsmerkmal: ${usp || 'Premium-Qualität'}
- Tonalität: ${tone || template.style.tone}
- Kampagnenziel: ${goal || 'Awareness & Conversion'}

**ANALYSE (Schritt für Schritt):**
1. **Zielgruppen-Psychologie**: Was ist der tiefste Schmerzpunkt dieser Zielgruppe?
2. **Emotionaler Hook**: Welche Emotion (Angst, Hoffnung, Stolz, FOMO) sollte getriggert werden?
3. **Konkurrenz-Differenzierung**: Was macht dieses Angebot einzigartig?
4. **Conversion-Barrier**: Was könnte die Zielgruppe vom Kauf abhalten?
5. **Vertrauens-Elemente**: Welche Social Proofs oder Garantien sollten erwähnt werden?

**Erstelle dann die perfekte Werbeanzeige als JSON.**
Nutze konkrete Zahlen, emotionale Sprache und einen unwiderstehlichen CTA.`;
    }

    return `Create an agency-quality advertisement for:

**BRIEFING:**
- Industry: ${industry || 'General'}
- Product/Service: ${productName || 'Product'}
- Target Audience: ${targetAudience || 'Broad audience'}
- Unique Selling Point: ${usp || 'Premium quality'}
- Tone: ${tone || template.style.tone}
- Campaign Goal: ${goal || 'Awareness & Conversion'}

**ANALYSIS (Step by step):**
1. **Audience Psychology**: What is the deepest pain point of this audience?
2. **Emotional Hook**: Which emotion (fear, hope, pride, FOMO) should be triggered?
3. **Competitive Differentiation**: What makes this offer unique?
4. **Conversion Barrier**: What might stop the audience from buying?
5. **Trust Elements**: Which social proofs or guarantees should be mentioned?

**Then create the perfect advertisement as JSON.**
Use concrete numbers, emotional language, and an irresistible CTA.`;
}

/**
 * PERFORMANCE CREATIVE DIRECTOR System Prompt
 * Optimized for scroll-stopping Meta Ads with 10/10 conversion focus
 */
function buildPremiumSystemPrompt(template, language, examples) {
    const lang = language === 'de' ? 'Deutsch' : 'English';
    const powerWords = POWER_WORDS[language] || POWER_WORDS.de;

    const exampleText = examples.map((ex, i) =>
        `**Beispiel ${i + 1}** (${ex.industry}):
Input: "${ex.input}"
Output:
\`\`\`json
${JSON.stringify(ex.output, null, 2)}
\`\`\``
    ).join('\n\n');

    return `Du bist ein **Senior Performance Creative Director** mit Fokus auf Meta Ads (Facebook & Instagram).
Du hast über 8-stellige Budgets skaliert, kennst Meta Policies perfekt und denkst 100% conversion-first.
Jeder Fehler kostet Geld. Jede Ad die du erstellst, geht morgen mit hohem Budget live.

## 🎯 DEINE MISSION
Erstelle Ads, die:
- Den Scroll STOPPEN in den ersten 0.5 Sekunden
- Sofort klar machen WAS, FÜR WEN, WARUM
- Emotionale Trigger nutzen die zum Klick ZWINGEN
- Auf Mobile Feed 100% optimiert sind

## 📱 META ADS REGELN (KRITISCH!)

### 1️⃣ HOOK & STOP-POWER (erste 1-2 Sekunden)
- Die Headline MUSS den Scroll stoppen
- Pattern-Breaking: Überraschend, kontraintuitiv, spezifisch
- KEINE generischen Aussagen ("Das Beste für Sie")
- Nutze: Zahlen, Fragen, Gegenüberstellungen, Schockfakten
- Beispiele die stoppen: "Diese 7€ Creme schlägt 200€ Luxusmarken", "Warum 89% der Diäten scheitern"

### 2️⃣ MESSAGE CLARITY (3-Sekunden-Test)
Innerhalb von 3 Sekunden muss GLASKLAR sein:
✓ Was ist das Produkt/Service?
✓ Für wen ist es? (spezifische Zielgruppe)
✓ Warum ist es relevant? (konkreter Benefit)
KEINE kognitive Reibung erlaubt!

### 3️⃣ PSYCHOLOGISCHE TRIGGER (strategisch einsetzen)
- **FOMO**: "Nur noch X verfügbar", "Endet heute"
- **Social Proof**: Zahlen, Bewertungen, "12.000+ Kunden"
- **Transformation**: Vorher → Nachher Story
- **Spezifität**: Konkrete Zahlen schlagen vage Aussagen (43% statt "viel")
- **Loss Aversion**: Was sie VERLIEREN wenn sie nicht handeln

### 4️⃣ CONVERSION-KILLER VERMEIDEN
❌ Generische Headlines ohne Benefit
❌ Zu viele Features ohne emotionalen Hook
❌ Unklarer CTA
❌ Zu lange Descriptions ohne Struktur
❌ Keine Zahlen/Social Proof

## 💎 QUALITÄTS-STANDARDS

📝 **HEADLINE** (10-60 Zeichen):
- MUSS den Scroll stoppen
- Konkreter messbarer Benefit
- Nutze: Zahlen, Fragen, How-to, Gegenüberstellung
- Pattern-breaking Formulierung
- Test: "Würde ich STOPPEN wenn ich das sehe?"

📌 **SLOGAN** (max 40 Zeichen):
- Memorabel, rhythmisch, einzigartig
- Markenpositionierung in 4 Wörtern
- Emotional resonant

📄 **DESCRIPTION** (50-200 Zeichen):
- Konkrete Fakten + Zahlen
- Social Proof: Kundenzahlen, Sterne, Testimonial-Snippet
- Benefit-Stack: Haupt-Benefit + 2 Support-Benefits
- Einwand-Entkräftung eingebaut
- KEINE Füllwörter

🔘 **CTA** (max 30 Zeichen):
- Aktives Verb am Anfang
- Wert kommunizieren (nicht nur "Klicken")
- Dringlichkeit ODER Exklusivität
- Format: [Aktion] + [Benefit/Incentive]
- Beispiele: "Jetzt 30% sichern", "Gratis testen", "Termin in 2 Min buchen"

## 🖼️ IMAGE PROMPT (KRITISCH FÜR CONVERSION!)

Das Bild ist 50% der Performance. Erstelle einen SEHR detaillierten Prompt (80+ Wörter):

### Scroll-Stopping Visual Principles:
- **Hero Product im Zentrum**: Das Produkt ist der Star, keine Ablenkungen
- **Kontrast & Farben**: Auffällig aber nicht billig
- **Mobile-First**: Muss auf 320px Breite funktionieren
- **Emotion vor Features**: Menschen in Transformation, Ergebnis zeigen
- **Premium Aesthetic**: Sieht aus wie eine 50.000€ Kampagne

### Technische Vorgaben für Image Prompt:
- Beschreibe: Hauptmotiv, Komposition, Beleuchtung, Farben, Stimmung, Kamerawinkel
- Stil: Award-winning commercial advertising photography
- Beleuchtung: Professional three-point lighting, soft key light
- "shot on Hasselblad medium format, f/2.8, shallow depth of field"
- Mobile-optimiert: Zentrierte Komposition, kein wichtiges Element am Rand
- KRITISCH: "absolutely no text, no words, no letters, no logos, no watermarks"
- Mindestens 80 Wörter für beste Ergebnisse

### Template-spezifisch:
${template.visualGuidelines}

## 🎓 BEISPIELE (AGENCY-LEVEL)
${exampleText}

## 📊 POWER WORDS
- Dringlichkeit: ${powerWords.urgency.join(', ')}
- Exklusivität: ${powerWords.exclusivity.join(', ')}
- Vertrauen: ${powerWords.trust.join(', ')}
- Benefit: ${powerWords.benefit.join(', ')}

## 🔄 DEIN ANALYSE-PROZESS (Chain of Thought)
Bevor du outputtest, analysiere:
1. Was ist der #1 Schmerzpunkt der Zielgruppe?
2. Welcher Hook stoppt WIRKLICH den Scroll?
3. Welches Visual würde mich persönlich stoppen?
4. Ist der CTA unwiderstehlich oder nur "okay"?
5. Würde diese Ad auf 8-stelliges Budget skalieren?

## ✅ OUTPUT FORMAT (NUR valides JSON)
{
  "headline": "Scroll-stoppend, 10-60 Zeichen, konkreter Benefit",
  "slogan": "Memorabel, emotional, max 40 Zeichen",
  "description": "Konkret mit Zahlen + Social Proof, 50-200 Zeichen",
  "cta": "Aktionsverb + Benefit/Incentive, max 30 Zeichen",
  "imagePrompt": "SEHR detailliert, 80+ Wörter, conversion-optimiert, auf Englisch"
}

## 🚨 FINALE QUALITÄTSPRÜFUNG
Bevor du antwortest, frage dich:
✓ Stoppt diese Headline den Scroll? (Sei brutal ehrlich)
✓ Ist der Benefit in 3 Sekunden klar?
✓ Enthält die Description Social Proof/Zahlen?
✓ Ist der CTA unwiderstehlich?
✓ Ist der Image Prompt detailliert genug (80+ Wörter)?
✓ Würde ICH auf diese Ad klicken?

**SPRACHEN:** Texte in ${lang}, imagePrompt IMMER auf Englisch.`
}

/**
 * Advanced framework guidelines
 */
function getAdvancedFrameworkGuidelines(framework, language) {
    const guidelines = {
        AIDA: language === 'de'
            ? `**AIDA-Framework:**
  - **A**ttention: Stoppe den Scroll mit einem überraschenden Fakt, einer Frage oder einer kontraintuitiven Aussage
  - **I**nterest: Zeige die Transformation – beschreibe das Leben NACH dem Kauf
  - **D**esire: Social Proof + Verknappung (begrenzte Verfügbarkeit, zeitlich limitiert)
  - **A**ction: Klare, risikofreie nächste Schritte mit Wert-Trigger`
            : `**AIDA Framework:**
  - **A**ttention: Stop the scroll with surprising fact, question, or counterintuitive statement
  - **I**nterest: Show transformation – describe life AFTER purchase
  - **D**esire: Social proof + scarcity (limited availability, time-limited)
  - **A**ction: Clear, risk-free next steps with value trigger`,

        PAS: language === 'de'
            ? `**PAS-Framework:**
  - **P**roblem: Beschreibe den Schmerzpunkt so konkret, dass die Zielgruppe denkt "Das bin ich!"
  - **A**gitieren: Verstärke die emotionalen Kosten des Nichtstuns (verpasste Chancen, Frustration)
  - **S**olution: Präsentiere das Produkt als die einfache, bewährte Lösung mit Beweis`
            : `**PAS Framework:**
  - **P**roblem: Describe pain point so specifically audience thinks "That's me!"
  - **A**gitate: Amplify emotional cost of inaction (missed opportunities, frustration)
  - **S**olution: Present product as simple, proven solution with proof`,

        Story: language === 'de'
            ? `**Storytelling-Framework:**
  - **Setup**: Stelle eine relatable Ausgangssituation dar (Vorher)
  - **Konflikt**: Das Problem, das überwunden werden muss
  - **Transformation**: Der Moment der Veränderung durch das Produkt
  - **Resolution**: Das neue, bessere Leben (Nachher) mit konkreten Details`
            : `**Storytelling Framework:**
  - **Setup**: Present relatable starting situation (Before)
  - **Conflict**: The problem that needs to be overcome
  - **Transformation**: The moment of change through the product
  - **Resolution**: The new, better life (After) with concrete details`,

        'Feature-Benefit': language === 'de'
            ? `**Feature-Benefit-Framework:**
  - Übersetze jedes Feature in einen erlebbaren Benefit
  - "5000mAh Akku" → "2 volle Tage ohne Laden"
  - Quantifiziere den Wert: Zeit gespart, Geld gespart, Stress reduziert
  - ROI-Fokus: "Investition amortisiert sich in 2 Monaten"`
            : `**Feature-Benefit Framework:**
  - Translate every feature into experiential benefit
  - "5000mAh battery" → "2 full days without charging"
  - Quantify value: time saved, money saved, stress reduced
  - ROI focus: "Investment pays for itself in 2 months"`,
    };

    return guidelines[framework] || guidelines.AIDA;
}

/**
 * SCROLL-STOPPING Image Prompt Enhancement
 * Optimized for maximum conversion on Meta Ads (Mobile Feed)
 * Performance Creative Director approach
 */
export function enhanceImagePrompt(basePrompt, template) {
    // Scroll-stopping photography styles by template type
    const photographyStyles = {
        product_launch: `HERO PRODUCT SHOT: Award-winning commercial photography,
            Product floating center-frame as the undisputed hero,
            Three-point lighting setup with soft key light at 45 degrees,
            Subtle rim light creating premium edge definition,
            Clean gradient background transitioning from white to soft gray,
            Dramatic shallow depth of field f/1.4 with perfect subject isolation,
            Subtle product reflection on glossy surface below,
            Premium luxury brand aesthetic that stops the scroll`,

        limited_offer: `HIGH-IMPACT PROMOTIONAL SHOT: Dynamic urgent composition,
            Bold saturated hero colors that pop on mobile screens,
            Product positioned with dramatic diagonal energy,
            Subtle motion blur or starburst elements suggesting urgency,
            Rich contrast with deep shadows and bright highlights,
            Premium sale aesthetic but not discount-bin cheap,
            Eye-catching composition that demands immediate attention`,

        testimonial: `AUTHENTIC TRANSFORMATION SHOT: Real person lifestyle photography,
            Subject showing genuine emotion of satisfaction or joy,
            Natural golden hour window lighting with warm skin tones,
            Clean uncluttered background that doesn't compete,
            Environmental portrait in relatable aspirational setting,
            Documentary authenticity with commercial production value,
            The moment of transformation or satisfaction captured`,

        before_after: `TRANSFORMATION COMPARISON: Split composition storytelling,
            Clear dramatic contrast between before and after states,
            Consistent lighting and framing across both halves,
            Visual proof of transformation that's instantly readable,
            Powerful narrative that communicates in 1 second,
            Clean grid or diagonal split composition`,

        seasonal: `FESTIVE PREMIUM SHOT: Seasonal atmosphere photography,
            Appropriate holiday elements without being cliché,
            Warm inviting lighting with magical bokeh accents,
            Celebratory mood that feels aspirational not generic,
            Rich seasonal color palette (reds/golds for winter, pastels for spring),
            Premium holiday marketing aesthetic, cozy yet luxurious`,

        b2b_solution: `PROFESSIONAL SUCCESS SHOT: Modern corporate photography,
            Confident professional in premium contemporary workspace,
            Clean architectural lines and minimalist design elements,
            Trust-building aesthetic that says "enterprise-grade",
            Natural daylight with commercial polish,
            Success and efficiency visualized without clichés`,

        lifestyle: `ASPIRATIONAL MOMENT: Magazine editorial quality lifestyle,
            Perfect golden hour lighting creating warm glow,
            Subject living the transformed life the product enables,
            Beautiful natural setting that feels attainable yet elevated,
            Cinematic wide composition with rule of thirds,
            The "after" moment that makes viewers want this life`
    };

    // 10/10 Technical specs for gpt-image-1 / DALL-E 3
    const technicalMasterSpecs = [
        'MASTERPIECE commercial advertisement photograph',
        'Shot on Hasselblad H6D-100c medium format',
        'Perfect exposure and professional color grading',
        'Ultra crisp tack sharp focus on main subject',
        'Shallow depth of field f/1.4-f/2.8 with beautiful bokeh',
        'Professional studio or natural lighting setup',
        '4K ultra high resolution render',
        'Premium brand aesthetic worth $50k campaign budget'
    ];

    // Mobile-first composition rules
    const mobileFirstRules = [
        'MOBILE-FIRST: Centered composition works on 320px width',
        'Main subject fills 60-70% of vertical frame',
        'No critical elements at extreme edges (will be cropped)',
        'High contrast that reads clearly on bright screens',
        'Simple clean composition with single focal point'
    ];

    // Critical negative prompts with emphasis
    const criticalAvoids = [
        'ABSOLUTELY NO: text, words, letters, numbers, typography, logos, watermarks, signatures, stamps',
        'NEVER: distorted faces, weird hands, extra fingers, mutated features',
        'AVOID: cluttered backgrounds, multiple competing focal points, low contrast',
        'NO: cheap stock photo look, generic compositions, AI artifacts',
        'CLEAN: professional composition worthy of tier-1 brand campaign'
    ];

    const style = photographyStyles[template.id] || photographyStyles.product_launch;

    // Aggressive cleaning of base prompt
    const cleanedPrompt = basePrompt
        .replace(/no text/gi, '')
        .replace(/no logos/gi, '')
        .replace(/no watermarks/gi, '')
        .replace(/text|words|letters|typography/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Build the ultimate conversion-optimized prompt
    return `SCROLL-STOPPING Meta Ads Hero Image:

${cleanedPrompt}.

PHOTOGRAPHY DIRECTION:
${style}.

TEMPLATE VISUAL GUIDELINES:
${template.visualGuidelines || 'Premium, modern, conversion-optimized aesthetic'}.

TECHNICAL EXCELLENCE:
${technicalMasterSpecs.join('. ')}.

MOBILE OPTIMIZATION:
${mobileFirstRules.join('. ')}.

CRITICAL REQUIREMENTS:
${criticalAvoids.join('. ')}.

This image MUST stop the scroll on Instagram/Facebook feed in 0.5 seconds. Make it premium, make it bold, make it convert.`;
}


