import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

/**
 * Nutzt OpenAI, um eine Liste von Ads zu bewerten.
 *
 * @param {Array<{ id: string, primary_text?: string, primaryText?: string, headline?: string, description?: string }>} ads
 * @returns {Promise<Array<{ id: string, score: number, main_hook: string, summary: string }>>}
 */
export async function analyzeAdsWithOpenAI(ads) {
  console.log("[AIAnalysis] analyzeAdsWithOpenAI called", { count: Array.isArray(ads) ? ads.length : 0 });

  if (!Array.isArray(ads) || ads.length === 0) return [];

  if (!openai || !apiKey) {
    console.error("[AIAnalysis] Missing OPENAI_API_KEY");
    throw new Error("OPENAI_API_KEY is required for ad analysis");
  }

  const adsPayload = ads.map((a) => ({
    id: a.id,
    primary_text: a.primary_text || a.primaryText || "",
    headline: a.headline || "",
    description: a.description || "",
  }));

  console.log("[AIAnalysis] Sending ads to OpenAI", { count: adsPayload.length });

  const systemPrompt =
    "Du bist ein erfahrener Performance-Marketing-Stratege für Meta (Facebook & Instagram) Anzeigen. " +
    "Bewerte die Anzeigen hinsichtlich Hook, Klarheit und Nutzenversprechen und gib kompakte Erkenntnisse zurück.";

  const userPrompt = `Hier ist eine Liste von Facebook/Instagram-Anzeigen im JSON-Format. Für jede Anzeige sollst du:
Einen Score von 0 bis 100 vergeben, wie stark die Anzeige voraussichtlich performt (Hook, Klarheit, Nutzenversprechen).
Den Haupt-Hook / Angle in einem Satz benennen.
Eine sehr kurze Zusammenfassung (1–2 Sätze) formulieren.
Antworte als JSON-Objekt mit dem Feld "results", das ein Array von Objekten enthält:
{
  "id": "<id aus der Eingabe>",
  "score": 0-100,
  "main_hook": "...",
  "summary": "..."
}
Hier sind die Anzeigen:
${JSON.stringify(adsPayload, null, 2)}`;

  try {
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

    const rawText = completion?.output?.[0]?.content?.[0]?.text ?? "";
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseError) {
      console.error("[AIAnalysis] Failed to parse OpenAI JSON", parseError, { rawText: rawText.slice(0, 500) });
      throw parseError;
    }

    const results = Array.isArray(parsed?.results) ? parsed.results : [];
    const normalized = results.map((item) => ({
      id: item?.id || "",
      score: typeof item?.score === "number" ? item.score : 0,
      main_hook: item?.main_hook || "",
      summary: item?.summary || "",
    }));

    console.log("[AIAnalysis] OpenAI analysis done", { resultCount: normalized.length });
    return normalized;
  } catch (error) {
    console.error("[AIAnalysis] Error during OpenAI analysis", error);
    throw error;
  }
}
