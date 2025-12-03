/**
 * Orchestrator – ONE CALL
 * Questionnaire → Save → Meta Ads Setup (OpenAI)
 */

const { getSupabaseClient } = require("./_shared/supabaseClient");
const OpenAI = require("openai");

// --- OpenAI Client ----------------------------------------------------------
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("[FullFlow][OpenAI] Missing OPENAI_API_KEY");
}

const openai = new OpenAI({ apiKey });

// --- Main Handler -----------------------------------------------------------

exports.handler = async (event) => {
  console.log("[FullFlow] Incoming request", {
    method: event.httpMethod,
    hasBody: !!event.body,
  });

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // Body sicher parsen
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (err) {
    console.error("[FullFlow] Failed to parse JSON body", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const {
    adVariantId,
    userId,
    answers,
    strategyRecommendation,
    generatedAd,
  } = payload;

  console.log("[FullFlow] Parsed payload:", {
    adVariantId,
    userId,
    hasAnswers: !!answers,
    hasStrategyRecommendation: !!strategyRecommendation,
    hasGeneratedAd: !!generatedAd,
  });

  if (!adVariantId || !userId || !answers) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields" }),
    };
  }

  if (!strategyRecommendation || !strategyRecommendation.strategy) {
    console.warn(
      "[FullFlow] Missing strategyRecommendation.strategy – continuing but Meta-Setup basiert nur auf Answers + Ad."
    );
  }

  // --- Supabase Init --------------------------------------------------------
  let supabase = null;
  try {
    supabase = getSupabaseClient();
  } catch (e) {
    console.error("[FullFlow] Supabase init failed", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Supabase init failed" }),
    };
  }

  // --- 1) Strategie speichern ----------------------------------------------
  console.log("[FullFlow] 1/3 Saving strategy…");

  let savedStrategy;
  try {
    const { data, error } = await supabase
      .from("ad_strategies")
      .insert({
        user_id: userId,
        ad_variant_id: adVariantId,
        questionnaire_answers: answers,
        selected_strategy: strategyRecommendation?.strategy || null,
        selected_strategy_data: strategyRecommendation?.strategy || null,
        ai_analysis: strategyRecommendation || null,
        matching_score: strategyRecommendation?.score || null,
        confidence_level: strategyRecommendation?.confidence || null,
        status: "analyzed",
      })
      .select("*")
      .single();

    if (error) {
      console.error("[FullFlow] saveError", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to save strategy" }),
      };
    }

    savedStrategy = data;
  } catch (err) {
    console.error("[FullFlow] Unexpected error while saving strategy", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to save strategy (exception)" }),
    };
  }

  // --- 2) Meta Ads Setup via OpenAI generieren ------------------------------
  console.log("[FullFlow] 2/3 Generating Meta Ads Setup…");

  const prompt = `
Du bist ein Meta Ads / Facebook Performance Marketer.
Erstelle ein vollständiges Kampagnen-Setup basierend auf:

- Strategie-Empfehlung (inkl. Diagnose): ${JSON.stringify(
    strategyRecommendation || {},
    null,
    2
  )}
- Fragebogen-Antworten: ${JSON.stringify(answers || {}, null, 2)}
- Generierte Ad (Creatives & Copy): ${JSON.stringify(generatedAd || {}, null, 2)}

Ziel:
- Ein klar strukturiertes Meta Ads Setup, das direkt ins Ads Manager Setup übertragen werden kann.

Gib ein JSON mit folgender Struktur zurück:

{
  "campaign_config": {
    // Kampagnentyp, Gebotsstrategie, Conversion-Event, Naming-Konvention etc.
  },
  "adsets_config": [
    {
      // Zielgruppe, Placements, Budget, Bidding etc.
    }
  ],
  "ads_config": [
    {
      // Creatives, Hooks, Copy-Varianten, Formate etc.
    }
  ],
  "recommendations": {
    // Skalierungsplan, Testing-Plan, Monitoring-Empfehlungen etc.
  }
}
`;

  let openAIResult = null;

  try {
    const response = await openai.responses.create({
      model: process.env.META_SETUP_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: "Du bist ein Meta Ads Performance Experte für Facebook & Instagram.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "meta_ads_setup",
          strict: true,
          schema: {
            type: "object",
            properties: {
              campaign_config: {
                type: "object",
                description: "Einstellungen auf Kampagnen-Ebene.",
                additionalProperties: true,
              },
              adsets_config: {
                type: "array",
                description: "Liste aller Adset-Konfigurationen.",
                items: {
                  type: "object",
                  additionalProperties: true,
                },
              },
              ads_config: {
                type: "array",
                description: "Liste aller Ad-Konfigurationen / Creatives.",
                items: {
                  type: "object",
                  additionalProperties: true,
                },
              },
              recommendations: {
                type: "object",
                description: "Zusätzliche Empfehlungen, Skalierungs- & Testing-Plan.",
                additionalProperties: true,
              },
            },
            required: ["campaign_config", "adsets_config", "ads_config"],
            additionalProperties: true,
          },
        },
      },
      max_output_tokens: 2000,
    });

    const raw =
      response?.output?.[0]?.content?.[0]?.text ||
      response?.output?.[0]?.content?.[0]?.json;

    if (!raw) {
      console.error("[FullFlow][OpenAI] Empty response content");
      throw new Error("Empty OpenAI response");
    }

    openAIResult =
      typeof raw === "string" ? JSON.parse(raw) : JSON.parse(JSON.stringify(raw));

    console.log("[FullFlow][OpenAI] Parsed Meta Setup:", {
      hasCampaign: !!openAIResult.campaign_config,
      adsetCount: Array.isArray(openAIResult.adsets_config)
        ? openAIResult.adsets_config.length
        : 0,
      adsCount: Array.isArray(openAIResult.ads_config)
        ? openAIResult.ads_config.length
        : 0,
    });
  } catch (err) {
    console.error("[FullFlow] OpenAI error", {
      message: err.message,
      stack: err.stack,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "OpenAI failed",
        details: err.message || String(err),
      }),
    };
  }

  // --- 3) Meta Ads Setup in DB speichern -----------------------------------
  console.log("[FullFlow] 3/3 Saving Meta Ads Setup…");

  let metaData;
  try {
    const { data, error } = await supabase
      .from("ad_meta_setup")
      .insert({
        ad_strategy_id: savedStrategy.id,
        setup_data: openAIResult,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      console.error("[FullFlow] metaError", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to save Meta Setup" }),
      };
    }

    metaData = data;
  } catch (err) {
    console.error("[FullFlow] Unexpected error while saving Meta Setup", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to save Meta Setup (exception)" }),
    };
  }

  // --- SUCCESS --------------------------------------------------------------
  console.log("[FullFlow] Success", {
    strategyId: savedStrategy.id,
    metaSetupId: metaData.id,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      strategy: savedStrategy,
      meta: metaData,
      openAI: openAIResult,
      status: "ok",
    }),
  };
};
