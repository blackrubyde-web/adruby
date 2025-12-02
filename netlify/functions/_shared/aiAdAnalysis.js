// netlify/functions/_shared/aiAdAnalysis.js

const OpenAI = require("openai");

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("[AIAnalysis] Missing OPENAI_API_KEY");
}

const openai = new OpenAI({ apiKey });

/**
 * Nutzt OpenAI, um eine Liste von Ads zu bewerten.
 *
 * @param {Array<{ id: string, primary_text?: string, primaryText?: string, headline?: string, description?: string }>} ads
 * @returns {Promise<Array<{ id: string, score: number, main_hook: string, summary: string }>>}
 */
async function analyzeAdsWithOpenAI(ads) {
  if (!Array.isArray(ads) || ads.length === 0) return [];

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for ad analysis");
  }

  const adsPayload = ads.map((a) => ({
    id: a.id,
    primary_text: a.primary_text || a.primaryText || "",
    headline: a.headline || "",
    description: a.description || "",
  }));

  const systemPrompt =
    "Du bist ein erfahrener Performance-Marketing-Stratege für Facebook und Instagram Anzeigen. " +
    "Du bewertest Anzeigen und fasst die wichtigsten Erkenntnisse zusammen.";

  const userPrompt = `
Bewerte die folgenden Anzeigen aus Performance-Sicht.

Gib pro Ad zurück:
- "score": Zahl von 0-100 (Performance-Einschätzung)
- "main_hook": wichtigster Aufhänger / Versprechen
- "summary": 2-3 Sätze mit den Haupt-Learnings

Antworte im JSON-Format:
{
  "ads": [
    { "id": "...", "score": 0-100, "main_hook": "...", "summary": "..." }
  ]
}

WICHTIG:
- Antworte NUR mit gültigem JSON.
- Kein Markdown, keine Erklärungen.

Ads:
${JSON.stringify(adsPayload, null, 2)}
`;

  const completion = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    text: {
      format: "json",
    },
  });

  try {
    const output = completion.output?.[0];
    const content = output?.content?.[0];
    const jsonString = content?.text || "{}";

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      console.error(
        "[AIAnalysis] Failed to parse JSON from OpenAI (analysis)",
        jsonString,
        e
      );
      throw new Error("Failed to parse AI analysis JSON");
    }

    if (!parsed || !Array.isArray(parsed.ads)) return [];

    return parsed.ads.map((ad) => ({
      id: ad.id,
      score: ad.score,
      main_hook: ad.main_hook,
      summary: ad.summary,
    }));
  } catch (err) {
    console.error("[AIAnalysis] Failed to process analysis response", err);
    throw err;
  }
}

/**
 * Generiert aus gescrapten Ads + User-Briefing fertige Ad-Creatives.
 *
 * @param {Object} params
 * @param {{ product?: string; goal?: string; market?: string; language?: string }} params.userBriefing
 * @param {Array<{ id: string, primary_text?: string, primaryText?: string, headline?: string, description?: string }>} params.ads
 * @returns {Promise<Array<{
 *   id: string,
 *   base_ad_id?: string,
 *   headline: string,
 *   primaryText: string,
 *   description: string,
 *   hook: string,
 *   angle: string,
 *   cta: string,
 *   visualIdea: string
 * }>>}
 */
async function generateCreativesFromAds({ userBriefing, ads }) {
  if (!Array.isArray(ads) || ads.length === 0) return [];
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for creative generation");
  }

  const { product, goal, market, language } = userBriefing || {};

  const adsPayload = ads.map((a, idx) => ({
    id: a.id || `ad-${idx}`,
    primary_text: a.primary_text || a.primaryText || "",
    headline: a.headline || "",
    description: a.description || "",
  }));

  const systemPrompt =
    "Du bist ein Senior Performance-Marketer und Creative Director für Meta Ads. " +
    "Du entwickelst performante Ad-Creatives basierend auf gescrapten Wettbewerber-Ads und einem Briefing.";

  const userPrompt = `
Briefing:
- Produkt / Angebot: ${product || "nicht näher spezifiziert"}
- Kampagnenziel: ${goal || "keins angegeben"}
- Markt / Nische: ${market || "keine Angabe"}
- Sprache: ${language || "de"}

Du bekommst eine Liste von gescrapten Anzeigen (Wettbewerber). Analysiere Muster, Hooks und Positionierung.

Erzeuge dann auf Basis dieser Daten und des Briefings NEUE, eigene Ad-Creatives.
Wichtig: Die Texte sollen NICHT kopiert wirken, sondern eigenständig formuliert sein, aber aus den Learnings der Wettbewerber profitieren.

Antworte im JSON-Format:
{
  "ads": [
    {
      "id": "creative-1",
      "base_ad_id": "<id einer verwendeten Wettbewerbs-Ad oder null>",
      "headline": "starke, klickstarke Headline",
      "primaryText": "längerer Anzeigentext im typischen Meta-Stil",
      "description": "optionaler Beschreibungstext unter der Headline",
      "hook": "klarer Haupt-Hook / Versprechen",
      "angle": "kurze Beschreibung des strategischen Angles",
      "cta": "prägnanter Call-to-Action",
      "visualIdea": "konkrete Idee für das Visual / die Gestaltung"
    }
  ]
}

- Erzeuge mindestens 3 unterschiedliche Varianten.
- Antworte NUR mit gültigem JSON, ohne zusätzlichen Text oder Markdown.

Gescrapte Ads:
${JSON.stringify(adsPayload, null, 2)}
`;

  const completion = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    text: {
      format: "json",
    },
  });

  try {
    const output = completion.output?.[0];
    const content = output?.content?.[0];
    const jsonString = content?.text || "{}";

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      console.error(
        "[AIAnalysis] Failed to parse JSON from OpenAI (creatives)",
        jsonString,
        e
      );
      throw new Error("Failed to parse AI creatives JSON");
    }

    if (!parsed || !Array.isArray(parsed.ads)) return [];

    return parsed.ads.map((ad) => ({
      id: ad.id,
      base_ad_id: ad.base_ad_id,
      headline: ad.headline,
      primaryText: ad.primaryText,
      description: ad.description,
      hook: ad.hook,
      angle: ad.angle,
      cta: ad.cta,
      visualIdea: ad.visualIdea,
    }));
  } catch (err) {
    console.error("[AIAnalysis] Failed to process creatives response", err);
    throw err;
  }
}

module.exports = {
  analyzeAdsWithOpenAI,
  generateCreativesFromAds,
};
