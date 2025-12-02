// netlify/functions/ad-strategy-save.js

const { getSupabaseClient } = require("./_shared/supabaseClient");

exports.handler = async (event, context) => {
  console.log("[AdStrategySave] Incoming request:", {
    method: event.httpMethod,
    body: event.body,
  });

  // Nur POST zulassen
  if (event.httpMethod !== "POST") {
    console.warn("[AdStrategySave] Method not allowed:", event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // Supabase Client initialisieren
  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    console.error("[AdStrategySave] Failed to init Supabase client:", {
      message: err.message,
      stack: err.stack,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Supabase client init failed",
        details: err.message || String(err),
      }),
    };
  }

  try {
    const { adVariantId, userId, answers, strategyRecommendation } = JSON.parse(
      event.body || "{}"
    );
    console.log("[AdStrategySave] Incoming payload:", { adVariantId, userId });

    if (!adVariantId || !userId) {
      console.error("[AdStrategySave] Missing adVariantId or userId");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing adVariantId or userId" }),
      };
    }

    const selectedStrategy = strategyRecommendation?.strategy || null;

    const insertPayload = {
      user_id: userId,
      ad_variant_id: adVariantId,

      // Legacy + neue Antworten
      questionnaire_answers: answers || null,
      answers: answers || null,

      // Strategy-Infos
      selected_strategy_id: selectedStrategy?.id || null,
      selected_strategy_data: selectedStrategy
        ? {
            title: selectedStrategy.title,
            description: selectedStrategy.description,
            recommended_actions: selectedStrategy.recommended_actions || [],
          }
        : null,

      // Neue Spalte für die UI – komplette Strategie
      selected_strategy: selectedStrategy || null,

      // Vollständige KI-Analyse
      ai_analysis: strategyRecommendation || null,

      // Scoring / Meta
      matching_score:
        typeof strategyRecommendation?.score === "number"
          ? strategyRecommendation.score
          : null,
      confidence_level: strategyRecommendation?.confidence || null,

      // Status-Feld – Standardwert
      status: "analyzed",
    };

    console.log("[AdStrategySave] Insert payload:", insertPayload);

    const { data, error } = await supabase
      .from("ad_strategies")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      console.error("[AdStrategySave] Supabase error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to save strategy",
          details: error.message || error,
        }),
      };
    }

    console.log("[AdStrategySave] Strategy saved successfully:", {
      id: data?.id,
      ad_variant_id: data?.ad_variant_id,
      user_id: data?.user_id,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("[AdStrategySave] Handler error:", {
      message: err.message,
      stack: err.stack,
    });

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Unexpected server error",
        details: err.message || String(err),
      }),
    };
  }
};
