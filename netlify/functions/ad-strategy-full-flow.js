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
    console.error("[FullFlow] Missing required fields", {
      adVariantId,
      userId,
      hasAnswers: !!answers,
    });
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
      // Duplicate-Key-Fall: ad_variant_id existiert bereits -> vorhandene Strategie holen
      if (error.code === "23505") {
        console.warn(
          "[FullFlow] Strategy already exists for this ad_variant_id – loading existing strategy..."
        );
        const { data: existing, error: fetchError } = await supabase
          .from("ad_strategies")
          .select("*")
          .eq("ad_variant_id", adVariantId)
          .single();

        if (fetchError || !existing) {
          console.error(
            "[FullFlow] Failed to fetch existing strategy after duplicate key",
            fetchError
          );
          return {
            statusCode: 500,
            body: JSON.stringify({
              error:
                "Failed to load existing strategy after duplicate key",
            }),
          };
        }

        savedStrategy = existing;
      } else {
        console.error("[FullFlow] saveError", error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Failed to save strategy" }),
        };
      }
    } else {
      savedStrategy = data;
    }
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
- Generierte Ad (Creatives & Copy): ${JSON.stringify(
    generatedAd || {},
    null,
    2
  )}

Ziel:
- Ein klar strukturiertes Meta Ads Setup, das direkt ins Ads Manager Setup übertragen werden kann.

Gib ein JSON mit folgender Struktur zurück:

{
  "campaign_config": { ... },
  "adsets_config": [ ... ],
  "ads_config": [ ... ],
  "recommendations": { ... }
}

WICHTIG:
- Antworte **ausschließlich** mit einem gültigen JSON-Objekt.
- Kein Markdown, kein Fließtext, keine Kommentare – nur reines JSON.
`;

  let openAIResult = null;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.META_SETUP_MODEL || "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Du bist ein Meta Ads Performance Experte für Facebook & Instagram. Du antwortest strikt im JSON-Format, wenn der Nutzer es verlangt.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      // Erzwinge JSON-Ausgabe
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000,
    });

    const rawContent =
      completion?.choices?.[0]?.message?.content || null;

    if (!rawContent) {
      console.error("[FullFlow][OpenAI] Empty completion content", {
        completion,
      });
      throw new Error("Empty OpenAI completion content");
    }

    // JSON sicher parsen
    try {
      openAIResult = JSON.parse(rawContent);
    } catch (parseErr) {
      console.error("[FullFlow][OpenAI] Failed to parse JSON", {
        rawContent: rawContent.slice(0, 500), // trunc für Log
        error: parseErr,
      });
      throw new Error(
        "OpenAI returned non-JSON output or invalid JSON structure"
      );
    }

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

  // Defensive: falls OpenAI irgendwas Unerwartetes zurückgibt
  if (
    !openAIResult ||
    typeof openAIResult !== "object" ||
    Array.isArray(openAIResult)
  ) {
    console.error("[FullFlow] OpenAI result has invalid shape", {
      openAIResult,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Meta Ads Setup has invalid structure",
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
    console.error(
      "[FullFlow] Unexpected error while saving Meta Setup",
      err
    );
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to save Meta Setup (exception)",
      }),
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
