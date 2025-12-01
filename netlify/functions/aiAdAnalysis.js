// netlify/functions/_shared/aiAdAnalysis.js

import OpenAI from "openai";

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
export async function analyzeAdsWithOpenAI(ads) {
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

Antworte im JSON-Format: { "results": [ { "id": "...", "score": 0-100, "main_hook": "...", "summary": "..." }, ... ] }

Ads:
${JSON.stringify(adsPayload, null, 2)}
`;

  const completion = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "ad_analysis_response",
        schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  score: { type: "number" },
                  main_hook: { type: "string" },
                  summary: { type: "string" },
                },
                required: ["id", "score", "main_hook", "summary"],
              },
            },
          },
          required: ["results"],
        },
        strict: true,
      },
    },
  });

  try {
    const parsed = JSON.parse(completion.output[0]?.content[0]?.text || "{}");
    return parsed.results || [];
  } catch (err) {
    console.error("[AIAnalysis] Failed to parse JSON response", err);
    throw err;
  }
}
