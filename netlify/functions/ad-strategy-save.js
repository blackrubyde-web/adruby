// netlify/functions/ad-strategy-save.js

const { getSupabaseClient } = require("./_shared/supabaseClient");

exports.handler = async (event) => {
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
    const {
      adVariantId,
      userId,
      answers,
      strategyRecommendation,
    } = JSON.parse(event.body || "{}");

    console.log("[AdStrategySave] Parsed payload:", {
      adVariantId,
      userId,
      hasAnswers: !!answers,
      hasStrategyRecommendation: !!strategyRecommendation,
    });

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

    // 1. Versuch: Insert
    let { data, error } = await supabase
      .from("ad_strategies")
      .insert(insertPayload)
      .select("*")
      .single();

    // Falls Insert wegen Unique-Constraint scheitert → Update statt 500
    if (error && error.code === "23505") {
      console.warn(
        "[AdStrategySave] Duplicate strategy detected – running UPDATE instead",
        {
          code: error.code,
          message: error.message,
          details: error.details,
        }
      );

      const updatePayload = { ...insertPayload, updated_at: new Date().toISOString() };

      const updateResult = await supabase
        .from("ad_strategies")
        .update(updatePayload)
        .eq("ad_variant_id", adVariantId)
        .eq("user_id", userId)
        .select("*")
        .single();

      data = updateResult.data;
      error = updateResult.error;
    }

    if (error) {
      console.error("[AdStrategySave] Supabase error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to save strategy",
          details:
            error.message ||
            error.details ||
            error.hint ||
            JSON.stringify(error),
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
