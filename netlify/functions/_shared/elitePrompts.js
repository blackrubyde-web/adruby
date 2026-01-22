/**
 * ELITE PROMPTING SYSTEM
 * 
 * Production-grade prompts for generating viral, high-converting Meta ads.
 * Based on analysis of 45+ top-performing ad creatives.
 * 
 * Key principles:
 * 1. Be SPECIFIC - vague prompts = mediocre results
 * 2. Use VISUAL LANGUAGE - describe what you SEE, not concepts
 * 3. Include NEGATIVE prompts - say what to AVOID
 * 4. Reference INDUSTRY STANDARDS - "like Apple", "Glossier-style"
 */

// ============================================
// PRODUCT ANALYSIS PROMPTS
// ============================================

export const PRODUCT_ANALYSIS_PROMPT = `You are a forensic product analyst with 20 years of e-commerce experience.

Analyze this product image with EXTREME PRECISION:

## 1. PRODUCT IDENTIFICATION
- Exact product type (not "bottle" but "500ml glass bottle with pump dispenser")
- Brand name if visible
- Estimated price point (Budget/Mid-Range/Premium/Luxury)

## 2. VISUAL DNA
- Primary color (estimate exact HEX code)
- Secondary colors
- Material (Glass? Metal? Plastic? Fabric?)
- Finish (Matte? Glossy? Textured?)
- Shape (Round? Angular? Organic?)

## 3. TARGET AUDIENCE
- Who buys this? (Age, Gender, Lifestyle)
- What problem does it solve?
- Emotional trigger (Status? Health? Convenience?)

## 4. AD RECOMMENDATION
- Best background type
- Recommended mood
- Which reference style fits? (Feature Callouts / Lifestyle / etc.)

Respond in JSON:
{
    "productType": "string",
    "productName": "string", 
    "pricePoint": "budget|midrange|premium|luxury",
    "primaryColor": "#HEX",
    "secondaryColors": ["#HEX"],
    "material": "string",
    "finish": "matte|glossy|textured|mixed",
    "shape": "string",
    "targetAge": "18-24|25-34|35-44|45-54|55+",
    "targetGender": "male|female|unisex",
    "emotionalTrigger": "string",
    "problemSolved": "string",
    "recommendedStyle": "lifestyle_action|feature_callouts|benefit_checkmarks",
    "recommendedMood": "string",
    "productDescription": "Detailed description for ad generation"
}`;

// ============================================
// AD GENERATION MASTER PROMPT
// ============================================

export function buildMasterAdPrompt({
    productAnalysis,
    headline,
    subheadline,
    cta,
    referencePattern,
    targetPlatform = 'meta'
}) {
    const { productName, productDescription, primaryColor, material, pricePoint, emotionalTrigger } = productAnalysis || {};

    const platformSpecs = {
        meta: { size: '1080x1080', ratio: '1:1', maxText: '20%' },
        story: { size: '1080x1920', ratio: '9:16', maxText: '15%' },
        landscape: { size: '1200x628', ratio: '1.91:1', maxText: '20%' }
    };

    const spec = platformSpecs[targetPlatform];

    return `# AUFGABE: Erstelle eine VIRAL-WÜRDIGE Meta Ad

## FORMAT
- Größe: ${spec.size}px
- Seitenverhältnis: ${spec.ratio}
- Text-Anteil: Maximal ${spec.maxText} der Fläche

## PRODUKT
${productName ? `Name: ${productName}` : ''}
${productDescription ? `Beschreibung: ${productDescription}` : ''}
${primaryColor ? `Markenfarbe: ${primaryColor}` : ''}
${material ? `Material: ${material}` : ''}
${pricePoint ? `Preissegment: ${pricePoint}` : ''}

## STIL: ${referencePattern?.name || 'Premium Professional'}
${referencePattern?.promptSnippet || getDefaultStylePrompt()}

## TEXT-INHALTE
${headline ? `📌 HEADLINE: "${headline}"
   - Platzierung: Oberer Bildbereich
   - Stil: Bold, Sans-Serif, hoher Kontrast
   - Größe: Dominant, sofort lesbar` : ''}

${subheadline ? `📝 SUBHEADLINE: "${subheadline}"
   - Platzierung: Unter der Headline
   - Stil: Regular Weight, kleiner als Headline` : ''}

${cta ? `🔘 CTA-BUTTON: "${cta}"
   - Platzierung: Unterer Bildbereich
   - Stil: Pill-Shape, hoher Kontrast
   - Farbe: Akzentfarbe oder Rot/Orange für Urgency` : ''}

## QUALITÄTSKRITERIEN

### ✅ MUSS HABEN:
1. Das Produkt ist zu 100% erkennbar und unverändert
2. Text ist GESTOCHEN SCHARF und lesbar (auch bei 50% Zoom)
3. Professionelle Beleuchtung ohne harte Schatten
4. Keine sichtbaren Compositing-Kanten
5. Das Produkt sieht NATÜRLICH in der Szene aus

### ❌ UNBEDINGT VERMEIDEN:
1. Verschwommener oder unleserlicher Text
2. Produkt wirkt "aufgeklebt" oder schwebt
3. Inkonsistente Beleuchtung/Schatten
4. Generische Stock-Photo Ästhetik
5. Überladenes Layout mit zu vielen Elementen
6. Falsche Proportionen oder verzerrtes Produkt

## EMOTIONALER TRIGGER
${emotionalTrigger ? `Diese Ad soll "${emotionalTrigger}" kommunizieren.` : 'Diese Ad soll sofortiges Verlangen wecken.'}

## BENCHMARK
Die fertige Ad muss aussehen wie:
- Eine $10,000 Agentur-Produktion
- Würdig für Apple, Nike oder Glossier Qualität
- Ein echter SCROLL-STOPPER im Feed

GENERIERE JETZT DAS BILD.`;
}

function getDefaultStylePrompt() {
    return `
STYLE: Premium Professional (Default)

HINTERGRUND:
- Eleganter, dunkler oder neutraler Hintergrund
- Subtile Texturen oder Gradienten
- Keine ablenkenden Elemente

BELEUCHTUNG:
- Drei-Punkt-Beleuchtung
- Weiches Hauptlicht von links-oben
- Dezente Rim-Lights für Tiefe
- Natürliche Schatten

PRODUKT-INTEGRATION:
- Produkt steht stabil auf einer Oberfläche
- Oder wird von menschlichen Händen gehalten
- Niemals schwebend oder ohne Kontext

TYPOGRAFIE:
- Sans-Serif für Headlines (Inter, SF Pro, Helvetica)
- High Contrast (Weiß auf Dunkel oder Dunkel auf Hell)
- Klare Hierarchie: Headline > Subheadline > CTA
`;
}

// ============================================
// PATTERN-SPECIFIC ENHANCED PROMPTS
// ============================================

export const ENHANCED_PATTERNS = {
    feature_callouts: {
        name: 'Feature Callouts',
        systemContext: 'Du erstellst Produkt-Feature-Ads wie Apple sie für iPhone macht.',
        promptEnhancement: `
FEATURE CALLOUT STYLE (Apple-Qualität)

LAYOUT:
- Produkt im Zentrum, ca. 50-60% der Bildfläche
- 3-5 Feature-Beschriftungen drum herum
- Geschwungene Linien verbinden Labels mit Features

FEATURE-LABELS:
- Jedes Label in einer subtilen Pill-Form
- Weiße oder helle Schrift auf dunklem Pill (oder umgekehrt)
- Kurz und prägnant: "Sprint Laces™", "60W Fast Charge"

VERBINDUNGSLINIEN:
- Elegant geschwungene Bezier-Kurven
- Dezenter Glüh-Effekt oder subtiler Schatten
- Pfeilspitze am Produkt-Ende

HINTERGRUND:
- Das Produkt IN AKTION zeigen
- Lifestyle-Kontext (jemand benutzt es)
- Dynamische Elemente (Wasser, Bewegung, Licht)

BEISPIEL-REFERENZ:
- Apple "Shot on iPhone" Feature-Grafiken
- Nike Schuh-Technologie-Ads
- GoPro Action-Shots mit Feature-Callouts
`,
        negativePrompt: 'Keine geraden Linien, keine generischen Icons, keine Stock-Photo Menschen'
    },

    us_vs_them: {
        name: 'Us vs Them Comparison',
        systemContext: 'Du erstellst überzeugende Vergleichs-Ads wie Wild Deodorant oder Oatly.',
        promptEnhancement: `
US VS THEM STYLE (Überzeugungs-Layout)

LAYOUT:
- Exakte 50/50 Vertikalteilung
- LINKS: Dein Produkt (Hero, positiv)
- RECHTS: Konkurrenz/Problem (Anti-Hero, negativ)

LINKE SEITE (POSITIV):
- Helle, frische Farben (Mint, Himmelblau, Weiß)
- Produkt in bestem Licht, Premium-Inszenierung
- 👍 Emoji oder ✨ oben
- Grüne Checkmarks bei Features
- Headline: Positives Statement

RECHTE SEITE (NEGATIV):
- Gedämpfte Farben (Grau, Beige, verblasst)
- Konkurrenz-Typ-Produkt (nicht echte Marke!)
- 👎 Emoji oder 🚫 oben
- Rote X-Markierungen bei Nachteilen
- Headline: Negatives Statement

MITTELTEILER:
- Subtile vertikale Linie
- Oder Farbverlauf-Übergang

CTA:
- Volle Breite am unteren Rand
- Klar auf der "guten" Seite platziert
`,
        negativePrompt: 'Keine echten Markennamen der Konkurrenz, nicht beleidigend, nicht irreführend'
    },

    lifestyle_action: {
        name: 'Lifestyle Action Shot',
        systemContext: 'Du erstellst aspirational Lifestyle-Content wie Female Invest oder Glossier.',
        promptEnhancement: `
LIFESTYLE ACTION STYLE (Aspirational Content)

KERNKONZEPT:
- Zeige das LEBEN, das man mit diesem Produkt führt
- Nicht das Produkt verkaufen, sondern den LIFESTYLE
- Authentisch, aber aspirational

SZENE:
- Natürliches Setting (Zuhause, Café, Natur)
- Warmes, weiches Licht (Golden Hour Vibes)
- Aufgeräumt aber "gelebt"
- Lifestyle-Props: Pflanzen, Bücher, Kaffee, Textilien

MENSCHLICHE PRÄSENZ:
- Hände die das Produkt halten/benutzen
- Oder Person im Hintergrund (unscharf)
- Natürliche, ungestellte Pose
- Diverse, relatable Menschen

TEXT:
- Minimal und elegant
- Markenname oben (dezent)
- Produkt-Claim mittig oder unten
- Kein aggressiver CTA - subtiler "One click away"

FARBPALETTE:
- Warme Neutrals: Beige, Creme, Sandtöne
- Grün-Akzente (Pflanzen)
- Keine Neon-Farben

REFERENZ:
- Kinfolk Magazine Ästhetik
- Airbnb Experiences Fotos
- Everlane Produkt-Shots
`,
        negativePrompt: 'Keine Studio-Atmosphäre, keine sterilen Hintergründe, keine Hochglanz-Perfektion'
    },

    benefit_checkmarks: {
        name: 'Benefit Checkmarks List',
        systemContext: 'Du erstellst Trust-Building Content wie Supplement-Brands.',
        promptEnhancement: `
BENEFIT CHECKMARK STYLE (Trust Builder)

LAYOUT:
- Produkt links (40% Breite), in Nutzungs-Kontext
- Benefits rechts (60%), gestapelt

PRODUKT-SEITE:
- Produkt wird benutzt (Hände, Gießen, Anwenden)
- Warme, einladende Beleuchtung
- Lifestyle-Kontext sichtbar

BENEFIT-LISTE:
- 3-4 Key Benefits (nicht mehr!)
- Jeder Benefit mit farbigem ✓ Checkmark
- Kurz und prägnant ("Vegan & Cruelty Free")
- Subtiler Pill-Hintergrund pro Zeile
- Gleicher Abstand zwischen allen

VERTRAUENS-ELEMENTE:
- Trust Badges am unteren Rand
- Zahlungsanbieter-Logos (PayPal, Klarna)
- Oder Zertifizierungen (Bio, Vegan, etc.)

TYPOGRAFIE:
- Sans-Serif, gut lesbar
- Checkmarks in Marken-Akzentfarbe
- Benefit-Text in Dunkelgrau (nicht Schwarz)
`,
        negativePrompt: 'Keine langen Texte, keine mehr als 4 Benefits, keine unleserlichen Trust-Badges'
    },

    before_after: {
        name: 'Before/After Transformation',
        systemContext: 'Du erstellst überzeugende Transformation-Ads wie Fitness oder Education.',
        promptEnhancement: `
BEFORE/AFTER STYLE (Transformation Visual)

LAYOUT:
- Zwei Bilder nebeneinander (50/50)
- Oder übereinander (bei vertical)
- Klare visuelle Trennung

VORHER (LINKS/OBEN):
- Das PROBLEM zeigen
- Visuell weniger attraktiv
- Gedämpfte Farben, leicht chaotisch
- Aber nicht abstoßend oder fake
- Label: "Ohne [Produkt]" oder "Vorher"

NACHHER (RECHTS/UNTEN):
- Die LÖSUNG zeigen
- Visuell deutlich besser
- Helle, klare Farben
- Ordnung, Erfolg, Zufriedenheit
- Label: "Mit [Produkt]" oder "Nachher"

HEADLINE:
- Clever und einprägsam
- "Work Smart. Not Hard."
- "Goodbye [Problem]. Hello [Solution]."

VISUELLE METAPHERN:
- Verbrannter Toast vs Perfekter Toast
- Verhedderte Kabel vs Aufgeräumt
- Gestresst vs Entspannt

WICHTIG:
- Die Transformation muss GLAUBWÜRDIG sein
- Keine unrealistischen Versprechen
- Der Unterschied muss sofort erkennbar sein
`,
        negativePrompt: 'Keine unrealistischen Erwartungen, keine negativen Vorher-Bilder von Menschen'
    }
};

// ============================================
// QUALITY VERIFICATION PROMPT
// ============================================

export const QUALITY_VERIFICATION_PROMPT = `Du bist ein Senior Art Director mit 15+ Jahren Erfahrung bei Top-Werbeagenturen.

Bewerte diese Werbeanzeige KRITISCH aber FAIR nach folgenden Kriterien (1-10):

## 1. PRODUKTPRÄSENTATION (1-10)
- Ist das Produkt klar erkennbar?
- Sieht es professionell aus?
- Ist es natürlich in die Szene integriert?

## 2. TEXT-QUALITÄT (1-10)
- Ist der Text 100% scharf und lesbar?
- Sind Headline und CTA klar getrennt?
- Stimmt die Typografie-Hierarchie?

## 3. KOMPOSITION (1-10)
- Ist das Layout ausgewogen?
- Führt der Blick zum wichtigsten Element?
- Ist genug "breathing room"?

## 4. SCROLL-STOPPER-QUALITÄT (1-10)
- Würde es im Feed auffallen?
- Ist es merkwürdig/interessant genug?
- Hat es einen "Hook"?

## 5. CONVERSION-POTENTIAL (1-10)
- Ist das Wertversprechen klar?
- Ist der CTA sichtbar?
- Weckt es Kaufinteresse?

Antworte in JSON:
{
    "scores": {
        "productPresentation": number,
        "textQuality": number,
        "composition": number,
        "scrollStopper": number,
        "conversionPotential": number
    },
    "overallScore": number,
    "strengths": ["string"],
    "weaknesses": ["string"],
    "improvementSuggestions": ["string"],
    "passesQualityGate": boolean
}`;

export default {
    PRODUCT_ANALYSIS_PROMPT,
    buildMasterAdPrompt,
    ENHANCED_PATTERNS,
    QUALITY_VERIFICATION_PROMPT
};
